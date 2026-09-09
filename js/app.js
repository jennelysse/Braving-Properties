const SITE_CONFIG = {
  applicationFee: null, // Example: 50
  screeningUrl: "", // Example: Stripe payment link or screening-provider URL
  contactEmail: "your-email@example.com"
};

const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }

  loadProperties();
  setupApplication();
  setupContactForm();
});

async function getProperties() {
  try {
    const res = await fetch('data/properties.json');
    if (!res.ok) throw new Error('Could not load properties');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

function propertyCard(p) {
  return `
    <article class="property-card">
      <div class="property-image-wrap">
        <img class="property-image" src="${p.image}" alt="Placeholder image for ${p.title}">
        <span class="status-badge">${p.status}</span>
      </div>
      <div class="property-body">
        <div class="property-topline"><div><h3>${p.title}</h3><p>${p.location}</p></div><strong class="rent">${money(p.rent)}<small>/mo</small></strong></div>
        <div class="property-facts"><span>${p.beds} bed</span><span>${p.baths} bath</span><span>${p.sqft} sq ft</span></div>
        <p>${p.description}</p>
        <div class="property-actions"><a class="btn btn-navy" href="apply.html?property=${encodeURIComponent(p.id)}">Apply for This Home</a><a class="text-link" href="contact.html">Ask a question →</a></div>
      </div>
    </article>`;
}

async function loadProperties() {
  const properties = await getProperties();
  const featured = document.getElementById('featured-properties');
  if (featured) featured.innerHTML = properties.filter(p => p.featured).slice(0, 3).map(propertyCard).join('');

  const list = document.getElementById('property-list');
  if (list) {
    const bedFilter = document.getElementById('bed-filter');
    const priceFilter = document.getElementById('price-filter');
    const reset = document.getElementById('reset-filters');
    const empty = document.getElementById('no-properties');

    const render = () => {
      const beds = bedFilter.value;
      const price = priceFilter.value;
      const filtered = properties.filter(p => (beds === 'all' || p.beds >= Number(beds)) && (price === 'all' || p.rent <= Number(price)));
      list.innerHTML = filtered.map(propertyCard).join('');
      empty.hidden = filtered.length !== 0;
    };
    bedFilter.addEventListener('change', render);
    priceFilter.addEventListener('change', render);
    reset.addEventListener('click', () => { bedFilter.value = 'all'; priceFilter.value = 'all'; render(); });
    render();
  }

  const propertySelect = document.getElementById('property-select');
  if (propertySelect) {
    properties.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = `${p.title} — ${money(p.rent)}/mo`;
      propertySelect.appendChild(option);
    });
    const requested = new URLSearchParams(location.search).get('property');
    if (requested && properties.some(p => p.id === requested)) propertySelect.value = requested;
  }
}

function setupApplication() {
  const form = document.getElementById('application-form');
  if (!form) return;
  const steps = [...form.querySelectorAll('.form-step')];
  const next = document.getElementById('next-step');
  const prev = document.getElementById('prev-step');
  const fill = document.getElementById('progress-fill');
  const labels = [...document.querySelectorAll('.progress-labels span')];
  const msg = document.getElementById('form-message');
  let step = 0;

  const renderStep = () => {
    steps.forEach((el, i) => el.classList.toggle('active', i === step));
    labels.forEach((el, i) => el.classList.toggle('active', i <= step));
    fill.style.width = `${((step + 1) / steps.length) * 100}%`;
    prev.hidden = step === 0;
    next.hidden = step === steps.length - 1;
    next.textContent = step === 2 ? 'Finish Initial Profile' : 'Continue';
    msg.textContent = '';
    if (step === 2) populateReview(form);
    if (step === 3) configureScreening();
  };

  const validateStep = () => {
    const required = [...steps[step].querySelectorAll('[required]')];
    const bad = required.find(el => !el.checkValidity());
    if (bad) { bad.reportValidity(); return false; }
    return true;
  };

  next.addEventListener('click', () => {
    if (!validateStep()) return;
    if (step < steps.length - 1) { step++; renderStep(); }
  });
  prev.addEventListener('click', () => { if (step > 0) { step--; renderStep(); } });
  renderStep();
}

function populateReview(form) {
  const data = new FormData(form);
  const select = form.querySelector('#property-select');
  const propertyText = select.options[select.selectedIndex]?.textContent || 'Not selected';
  const rows = [
    ['Applicant', `${data.get('firstName') || ''} ${data.get('lastName') || ''}`.trim()],
    ['Email', data.get('email')], ['Phone', data.get('phone')], ['Property', propertyText],
    ['Desired move-in', data.get('moveInDate')], ['Occupants', data.get('occupants')],
    ['Pets', data.get('pets') || '0'], ['Approx. monthly household income', data.get('income') ? money(Number(data.get('income'))) : '']
  ];
  document.getElementById('application-review').innerHTML = rows.map(([label, val]) => `<div><span>${label}</span><strong>${val || '—'}</strong></div>`).join('');
}

function configureScreening() {
  const fee = document.getElementById('fee-display');
  const link = document.getElementById('screening-link');
  if (fee) fee.textContent = SITE_CONFIG.applicationFee ? money(SITE_CONFIG.applicationFee) : 'Configured by Bravion Properties';
  if (link && SITE_CONFIG.screeningUrl) {
    link.href = SITE_CONFIG.screeningUrl;
    link.textContent = SITE_CONFIG.applicationFee ? `Pay ${money(SITE_CONFIG.applicationFee)} & Continue Securely` : 'Continue to Secure Screening';
    link.classList.remove('disabled-link');
    link.removeAttribute('aria-disabled');
  }
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = encodeURIComponent(`Bravion Properties: ${data.get('topic')}`);
    const body = encodeURIComponent(`Name: ${data.get('firstName')} ${data.get('lastName')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone') || 'Not provided'}\n\n${data.get('message')}`);
    const message = document.getElementById('contact-message');
    if (SITE_CONFIG.contactEmail === 'your-email@example.com') {
      message.textContent = 'Contact email is not configured yet. Update SITE_CONFIG.contactEmail in js/app.js before publishing.';
      return;
    }
    window.location.href = `mailto:${SITE_CONFIG.contactEmail}?subject=${subject}&body=${body}`;
  });
}
