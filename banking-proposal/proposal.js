(() => {
  'use strict';

  document.documentElement.classList.add('js-enabled');

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.primary-nav');
  if (menuButton && navigation) {
    const closeMenu = (restoreFocus = false) => {
      navigation.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.textContent = 'Menu';
      if (restoreFocus) menuButton.focus();
    };
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? 'Close' : 'Menu';
      navigation.classList.toggle('is-open', isOpen);
    });
    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    window.matchMedia('(min-width: 851px)').addEventListener('change', (event) => {
      if (event.matches) closeMenu();
    });
  }

  const revealLinkedExample = () => {
    const target = document.getElementById(window.location.hash.slice(1));
    if (!target) return;
    let expanded = false;
    for (let element = target; element; element = element.parentElement) {
      if (element.tagName === 'DETAILS' && !element.open) {
        element.open = true;
        expanded = true;
      }
    }
    if (expanded) target.scrollIntoView({ block: 'start', behavior: 'instant' });
  };
  revealLinkedExample();
  window.addEventListener('hashchange', revealLinkedExample);

  const filterBar = document.querySelector('[data-resource-filters]');
  if (filterBar) {
    const cards = [...document.querySelectorAll('[data-audience]')];
    const buttons = [...filterBar.querySelectorAll('[data-filter]')];
    const status = document.querySelector('[data-filter-status]');
    filterBar.hidden = false;
    if (status) status.hidden = false;
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const category = button.dataset.filter;
        buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        let visibleCount = 0;
        cards.forEach((card) => {
          const visible = category === 'all' || card.dataset.audience.split(' ').includes(category);
          card.hidden = !visible;
          if (visible) visibleCount += 1;
        });
        if (status) status.textContent = category === 'all'
          ? `Showing all ${visibleCount} guides.`
          : `Showing ${visibleCount} ${visibleCount === 1 ? 'guide' : 'guides'} for ${button.textContent.trim().toLowerCase()}.`;
      });
    });
  }

  const form = document.querySelector('#pilot-form');
  const output = document.querySelector('#brief-output');
  if (!form || !output) return;

  const prepareButton = form.querySelector('button[type="submit"]');
  const briefText = document.querySelector('#brief-text');
  const briefStatus = document.querySelector('#brief-status');
  const outputHeading = document.querySelector('#brief-output-title');
  if (!prepareButton || !briefText || !briefStatus || !outputHeading) return;
  prepareButton.disabled = false;

  const readField = (name) => String(new FormData(form).get(name) || '').trim();
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const lendingAssignment = form.querySelector('#workflow').selectedOptions[0].dataset.lending === 'true';

    const lines = [
      'BANK PILOT DISCUSSION BRIEF',
      'Prepared in the Providensi banking proposal.',
      'Draft only. Not sent, not approved, and not an order.',
      '',
      'THE ASSIGNMENT',
      `Candidate workflow: ${readField('workflow')}`,
      `Intended result: ${readField('outcome')}`,
      '',
      'PEOPLE AND REVIEW',
      `Bank sponsor role: ${readField('sponsor')}`,
      `Accountable reviewer role: ${readField('reviewer')}`,
      '',
      'INFORMATION AND ENVIRONMENT',
      `Proposed inputs: ${readField('inputs')}`,
      `Deployment preference: ${readField('deployment')}`,
      'Input approval, actual information paths, and required safeguards must be confirmed before use.',
      '',
      'WHAT A USEFUL RESULT LOOKS LIKE',
      readField('success'),
      '',
      'INITIAL ACTION BOUNDARY',
      'Preparation and analysis using approved information. No automatic credit decision, payment release, source-record change, or regulatory submission.',
      lendingAssignment
        ? 'Lending includes borrower-facing work, including reviewed information requests, status updates, renewals, and workout correspondence. Any live borrower communication requires separately agreed bank authority, review, and an approved channel.'
        : 'This assignment supports internal bank work, not direct retail customer interactions.',
      'Teller service and other direct retail customer interactions outside lending are excluded from this proposal.',
      'A person with the appropriate authority reviews the sources, exceptions, calculations, and resulting work.',
      '',
      'OPEN QUESTIONS',
      readField('questions') || 'To be identified with the bank’s operations, technology, security, and risk owners.',
      '',
      'BEFORE A PILOT BEGINS',
      'Agree on the exact deliverable, approved sources, permissions, testing, review capacity, total cost, support responsibilities, and stop conditions.',
      'Confirm applicable written agreements and bank approvals. Synthetic information is the starting point, not permission to introduce customer information.',
      '',
      'DECISION AFTER EVALUATION',
      'Record the evidence and decide whether to stop, revise, or expand. Reclaimed staff capacity is not automatically cash saved.',
      '',
      'This brief was prepared locally in the browser. It has not been sent to Providensi or used to approve a deployment.'
    ];
    briefText.textContent = lines.join('\n');
    briefStatus.textContent = '';
    output.hidden = false;
    outputHeading.focus({ preventScroll: true });
    output.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  });

  document.querySelector('#edit-brief')?.addEventListener('click', () => {
    output.hidden = true;
    const firstField = form.querySelector('select');
    if (firstField) firstField.focus();
  });

  document.querySelector('#copy-brief')?.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(briefText.textContent);
      briefStatus.textContent = 'Brief copied. Nothing has been sent.';
    } catch {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(briefText);
        selection.removeAllRanges();
        selection.addRange(range);
        briefText.focus();
      }
      briefStatus.textContent = 'Automatic copying is unavailable. The brief is selected; use your copy shortcut.';
    }
  });

  document.querySelector('#download-brief')?.addEventListener('click', () => {
    const blob = new Blob([briefText.textContent], { type: 'text/plain;charset=utf-8' });
    const objectURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectURL;
    link.download = 'Providensi-Bank-Pilot-Discussion-Brief.txt';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectURL), 1000);
    briefStatus.textContent = 'A text-file download was requested. Check your browser’s downloads. Nothing has been sent.';
  });
})();
