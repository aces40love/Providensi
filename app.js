'use strict';

document.documentElement.classList.add('js');

if (document.querySelector('[data-redirect="why-thaddeus"]')) {
  window.location.replace('../why/' + window.location.search + window.location.hash);
}

const menu = document.querySelector('.menu-toggle');
const navigation = document.getElementById('primary-navigation');
const navDropdowns = Array.from(document.querySelectorAll('.nav-dropdown'));
const closeDropdown = (dropdown, restoreFocus = false) => {
  dropdown.open = false;
  const toggle = dropdown.querySelector('summary');
  toggle.setAttribute('aria-expanded', 'false');
  if (restoreFocus) toggle.focus();
};
if (menu && navigation) {
  menu.hidden = false;
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    menu.querySelector('.sr-only').textContent = 'Open navigation';
    navigation.classList.remove('is-open');
    navDropdowns.forEach(dropdown => closeDropdown(dropdown));
  };
  menu.addEventListener('click', () => {
    if (menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    } else {
      menu.setAttribute('aria-expanded', 'true');
      menu.querySelector('.sr-only').textContent = 'Close navigation';
      navigation.classList.add('is-open');
    }
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true'
      && !navDropdowns.some(dropdown => dropdown.open)) {
      closeMenu();
      menu.focus();
    }
  });
  window.matchMedia('(min-width: 851px)').addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });
}

for (const dropdown of navDropdowns) {
  const toggle = dropdown.querySelector('summary');
  dropdown.addEventListener('toggle', () => {
    toggle.setAttribute('aria-expanded', String(dropdown.open));
    if (dropdown.open) {
      navDropdowns.filter(other => other !== dropdown).forEach(other => closeDropdown(other));
    }
  });
  toggle.setAttribute('aria-expanded', String(dropdown.open));
  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) closeDropdown(dropdown);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dropdown.open) {
      event.preventDefault();
      closeDropdown(dropdown, true);
    }
  });
}

const featureSearch = document.getElementById('feature-search');
if (featureSearch) {
  const cards = Array.from(document.querySelectorAll('.catalog-card'));
  const filters = Array.from(document.querySelectorAll('[data-feature-filter]'));
  const groups = Array.from(document.querySelectorAll('[data-feature-group]'));
  let category = 'all';
  const updateFeatures = () => {
    const query = featureSearch.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const card of cards) {
      const matches = (category === 'all' || card.dataset.featureCategory === category) && card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !matches;
      card.querySelector('.capability-detail').open = matches && query.length > 0;
      if (matches) count += 1;
    }
    for (const group of groups) {
      group.hidden = !Array.from(group.querySelectorAll('.catalog-card')).some(card => !card.hidden);
    }
    for (const filter of filters) filter.setAttribute('aria-pressed', String(filter.dataset.featureFilter === category));
    document.getElementById('feature-count').textContent = count + ' of ' + cards.length + ' capabilities shown.';
    document.getElementById('feature-empty').hidden = count !== 0;
  };
  featureSearch.addEventListener('input', updateFeatures);
  for (const filter of filters) filter.addEventListener('click', () => {
    category = filter.dataset.featureFilter;
    updateFeatures();
  });
  const revealLinkedFeature = () => {
    const card = cards.find((item) => '#' + item.id === window.location.hash);
    if (!card) return;
    category = 'all';
    featureSearch.value = '';
    updateFeatures();
    card.querySelector('.capability-detail').open = true;
    card.scrollIntoView({ behavior: 'instant', block: 'start' });
  };
  window.addEventListener('hashchange', revealLinkedFeature);
  updateFeatures();
  revealLinkedFeature();
}

const blogFilters = Array.from(document.querySelectorAll('[data-blog-filter]'));
const blogSearch = document.getElementById('blog-search');
if (blogSearch) {
  const cards = Array.from(document.querySelectorAll('[data-blog-category]'));
  let category = 'all';
  const updateStories = () => {
    const query = blogSearch.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const card of cards) {
      const matches = (category === 'all' || card.dataset.blogCategory === category) && card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) count += 1;
    }
    for (const button of blogFilters) button.setAttribute('aria-pressed', String(button.dataset.blogFilter === category));
    document.getElementById('blog-count').textContent = count + ' of ' + cards.length + (cards.length === 1 ? ' story' : ' stories') + ' shown.';
    document.getElementById('blog-empty').hidden = count !== 0;
  };
  for (const filter of blogFilters) filter.addEventListener('click', () => {
    category = filter.dataset.blogFilter;
    updateStories();
  });
  blogSearch.addEventListener('input', updateStories);
  updateStories();
}

const examples = {
  proposal: {
    project: 'Branch procedure review',
    title: 'The policy. The source. The open question.',
    prompt: 'Compare these fictional branch procedures. Cite the relevant sections and flag conflicting review steps.',
    response: 'Organize the supplied procedures, identify version differences, and prepare a brief for the policy owner.',
    steps: ['Identify the supplied versions', 'Link statements to source sections', 'Flag the conflicting approval step'],
    file: 'Branch policy brief',
    sample: 'BRANCH POLICY BRIEF\nFictional sample. No bank policies or customer information were processed.\n\nQUESTION\nWhich internal reviewer approves a procedure exception?\n\nILLUSTRATIVE SOURCE REGISTER\nProcedure A, section 2, draft dated September 1: names a branch supervisor.\nProcedure B, section 4, draft dated September 15: names an operations reviewer.\nThese documents are invented for this example; they are not real bank guidance.\n\nFINDING\nThe supplied fictional drafts name different reviewers. The later date alone does not establish which draft is approved or in force.\n\nOPEN QUESTION\nThe policy owner needs to confirm the effective version and approval role. Do not treat either draft as the current rule without confirmation.\n\nREVIEW NOTE\nA real brief should cite the actual passages and document versions. No exception has been approved, no customer record accessed, and no message sent.'
  },
  research: {
    project: 'Examination evidence preparation',
    title: 'The request. The evidence. The gaps.',
    prompt: 'Organize this fictional examination request into an evidence checklist. Do not invent missing records.',
    response: 'Map supplied documents to the request, identify missing evidence, and leave submission to the accountable reviewer.',
    steps: ['Map the request to approved sources', 'Separate available and missing evidence', 'Prepare a review packet'],
    file: 'Examination evidence packet',
    sample: 'EXAMINATION EVIDENCE PACKET\nFictional sample. No examination materials or customer records were processed.\n\nILLUSTRATIVE REQUEST\nProvide the approved procedure and evidence that its latest revision was reviewed.\n\nAVAILABLE\nA fictional procedure draft is listed in the source pack. Its approval status has not been established.\n\nMISSING\nNo signed approval or revision-review record was supplied. Mark this as a gap; do not create an approval record.\n\nREVIEW ASSIGNMENT\nThe bank must identify the responsible owner, confirm the effective procedure, and locate the actual review evidence.\n\nSUBMISSION STATUS\nNot submitted. This example is not evidence of compliance, examination readiness, or regulator acceptance.\n\nNEXT STEP\nHave the accountable person verify the source record and complete the evidence checklist before any submission.'
  },
  report: {
    project: 'Document reconciliation',
    title: 'The fields. The difference. The review.',
    prompt: 'Compare these fictional documents against the required fields. Flag differences without changing the originals.',
    response: 'Extract the agreed fields, show discrepancies with source locations, and prepare a note for staff review.',
    steps: ['Check the required fields', 'Identify missing and conflicting entries', 'Prepare a discrepancy note'],
    file: 'Document discrepancy note',
    sample: 'DOCUMENT DISCREPANCY NOTE\nFictional sample. No customer documents, accounts, or production records were accessed.\n\nILLUSTRATIVE INPUTS\nDocument A contains an internal reference ending 104.\nDocument B contains an internal reference ending 140.\nBoth examples are invented.\n\nFINDING\nThe reference values do not agree. One required review-date field is missing.\n\nACTION FOR REVIEWER\nConfirm the correct source value and locate the missing date. Do not choose a value because it appears more plausible.\n\nBOUNDARY\nNo source record has been changed. No credit decision, payment, customer communication, or regulatory submission has been made.\n\nREVIEW NOTE\nValidate extraction and source locations against the originals before relying on the result.'
  }
};

const downloadText = (filename, text) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
};

const tabs = Array.from(document.querySelectorAll('[data-example]'));
const sampleDialog = document.getElementById('sample-dialog');
let activeExample = 'proposal';

const setExample = (key) => {
  const example = examples[key];
  if (!example) return;
  activeExample = key;
  for (const tab of tabs) {
    const selected = tab.dataset.example === key;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  }
  document.getElementById('demo-project').textContent = example.project;
  document.getElementById('demo-title').textContent = example.title;
  document.getElementById('demo-prompt').textContent = example.prompt;
  document.getElementById('demo-response').textContent = example.response;
  document.getElementById('demo-file').textContent = example.file;
  document.querySelector('.visual-caption span:last-child').textContent = '0' + (Object.keys(examples).indexOf(key) + 1) + ' / 03';
  const stepList = document.getElementById('demo-steps');
  stepList.replaceChildren();
  for (const text of example.steps) {
    const item = document.createElement('li');
    const check = document.createElement('span');
    check.className = 'check-circle';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = '✓';
    item.append(check, document.createTextNode(text));
    stepList.appendChild(item);
  }
  document.getElementById('workflow-detail').setAttribute('aria-labelledby', 'tab-' + key);
};

for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => setExample(tab.dataset.example));
  tab.addEventListener('keydown', (event) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].focus();
    setExample(tabs[next].dataset.example);
  });
}

if (sampleDialog) {
  const openButton = document.getElementById('open-sample');
  openButton.addEventListener('click', () => {
    const example = examples[activeExample];
    document.getElementById('sample-heading').textContent = example.file;
    document.getElementById('sample-body').textContent = example.sample;
    sampleDialog.showModal();
    document.getElementById('close-sample').focus();
  });
  document.getElementById('close-sample').addEventListener('click', () => sampleDialog.close());
  sampleDialog.addEventListener('close', () => openButton.focus());
  sampleDialog.addEventListener('click', (event) => {
    if (event.target !== sampleDialog) return;
    const bounds = sampleDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) sampleDialog.close();
  });
  document.getElementById('download-sample').addEventListener('click', () => {
    downloadText('Thaddeus-fictional-' + activeExample + '-sample.txt', examples[activeExample].sample);
  });
}

for (const form of document.querySelectorAll('[data-lead-magnet]')) {
  const firstName = form.elements.namedItem('fields[first_name]');
  const status = form.querySelector('[data-resource-status]');
  const button = form.querySelector('button[type="submit"]');
  form.addEventListener('input', () => {
    firstName.setCustomValidity('');
    status.hidden = true;
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    firstName.setCustomValidity(firstName.value.trim() ? '' : 'Please enter your first name.');
    if (!form.reportValidity()) return;
    status.textContent = 'Preview checked. No subscription was created and no email was sent. ' + form.dataset.resourceTitle + ' is drafted; final publication approval and Kit delivery setup are still pending.';
    status.hidden = false;
    form.reset();
    status.focus({ preventScroll: true });
  });
  button.disabled = false;
}

const quoteForm = document.getElementById('quote-form');
if (quoteForm) {
  const result = document.getElementById('quote-result');
  const recipient = 'dakotastewart@delphilabsinc.com';
  const organizationLabel = document.body.dataset.site === 'banking' ? 'Bank or organization' : 'Company or organization';
  let preparedInquiry = '';
  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!quoteForm.reportValidity()) return;
    const fields = new FormData(quoteForm);
    const clean = (name) => String(fields.get(name) || '').trim();
    const name = clean('name');
    const company = clean('company');
    const goals = clean('goals');
    const requiredText = [
      [quoteForm.elements.namedItem('name'), name.length >= 1, 'Please enter your name.'],
      [quoteForm.elements.namedItem('company'), company.length >= 1, 'Please enter your organization name.'],
      [quoteForm.elements.namedItem('goals'), goals.length >= 20, 'Please describe your goals in at least 20 characters.']
    ];
    for (const [field, valid, message] of requiredText) {
      field.setCustomValidity(valid ? '' : message);
      if (!valid) {
        field.reportValidity();
        return;
      }
    }
    preparedInquiry = [
      'CUSTOM LLM INQUIRY',
      'Prepared with Thaddeus by Providensi.',
      'This is an inquiry, not an order or agreed delivery commitment.',
      '',
      'Name: ' + name,
      'Work email: ' + clean('email'),
      organizationLabel + ': ' + company,
      'People using the solution: ' + clean('team'),
      '',
      'GOALS',
      goals,
      '',
      'DEPLOYMENT PREFERENCE',
      clean('deployment') + ' (subject to feasibility review)',
      '',
      'INFORMATION REQUIREMENTS',
      clean('data'),
      '',
      'OTHER REQUIREMENTS',
      clean('requirements') || 'None specified.',
      '',
      'Please contact me to discuss feasibility, scope, data-handling commitments, support, and a quote.'
    ].join('\n');
    document.getElementById('quote-summary').textContent = preparedInquiry;
    const subject = 'Custom LLM inquiry: ' + company.replace(/[\r\n]+/g, ' ');
    document.getElementById('email-quote').href = 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(preparedInquiry);
    quoteForm.hidden = true;
    result.hidden = false;
    document.getElementById('quote-result-title').focus({ preventScroll: true });
    result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  });
  quoteForm.addEventListener('input', (event) => {
    if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');
  });
  document.getElementById('edit-quote').addEventListener('click', () => {
    result.hidden = true;
    quoteForm.hidden = false;
    document.getElementById('full-name').focus();
  });
  document.getElementById('download-quote').addEventListener('click', () => {
    if (preparedInquiry) downloadText('Thaddeus-custom-LLM-inquiry.txt', preparedInquiry);
  });
}
