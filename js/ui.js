const $ = (id) => document.getElementById(id);

export const elements = {
  grid: $('vehicleGrid'),
  feedback: $('feedback'),
  resultsInfo: $('resultsInfo'),
  inventoryNotice: $('inventoryNotice'),
  suggestions: $('vehicleSuggestions'),
  toastRegion: $('toastRegion'),
  filterForm: $('filterForm'),
  searchInput: $('searchInput'),
  brandFilter: $('brandFilter'),
  statusFilter: $('statusFilter'),
  minPrice: $('minPrice'),
  maxPrice: $('maxPrice'),
  sortSelect: $('sortSelect'),
  resetBtn: $('resetBtn'),
  addBtn: $('addVehicleBtn'),
  formDialog: $('formDialog'),
  form: $('vehicleForm'),
  formTitle: $('formTitle'),
  submitBtn: $('submitBtn'),
  cancelBtn: $('cancelBtn'),
  detailsDialog: $('detailsDialog'),
  detailsBody: $('detailsBody'),
  closeDetailsBtn: $('closeDetailsBtn'),
  confirmDialog: $('confirmDialog'),
  confirmText: $('confirmText'),
  confirmBtn: $('confirmDeleteBtn'),
  confirmCancelBtn: $('confirmCancelBtn'),
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat('en-US');

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const vehicleCard = ({ id, brand, model, year, price, mileage, color, status }) => `
  <article class="card" data-id="${escapeHtml(id)}">
    <div class="card-top">
      <span class="brand brand-${escapeHtml(brand.toLowerCase())}">${escapeHtml(brand)}</span>
      <span class="badge badge-${escapeHtml(status)}">${escapeHtml(capitalize(status))}</span>
    </div>
    <h3>${escapeHtml(model)}</h3>
    <p class="price">${currency.format(price)}</p>
    <dl class="meta">
      <div><dt>Year</dt><dd>${escapeHtml(year)}</dd></div>
      <div><dt>Mileage</dt><dd>${number.format(mileage)} km</dd></div>
      <div><dt>Color</dt><dd>${escapeHtml(color)}</dd></div>
    </dl>
    <div class="card-actions">
      <button type="button" class="btn btn-ghost" data-action="view" aria-label="View ${escapeHtml(brand)} ${escapeHtml(model)}">View</button>
      <button type="button" class="btn btn-ghost" data-action="edit" aria-label="Edit ${escapeHtml(brand)} ${escapeHtml(model)}">Edit</button>
      <button type="button" class="btn btn-danger" data-action="delete" aria-label="Delete ${escapeHtml(brand)} ${escapeHtml(model)}">Delete</button>
    </div>
  </article>`;

export const clearFeedback = () => {
  elements.feedback.innerHTML = '';
  elements.feedback.className = 'feedback';
};

export const showLoading = () => {
  elements.grid.innerHTML = '';
  elements.feedback.className = 'feedback feedback-loading';
  elements.feedback.innerHTML = '<div class="spinner" aria-hidden="true"></div><p>Loading vehicles...</p>';
};

export const showEmpty = (message = 'No vehicles match your filters.') => {
  elements.grid.innerHTML = '';
  elements.feedback.className = 'feedback feedback-empty';
  elements.feedback.innerHTML = `<p>${escapeHtml(message)}</p>`;
};

export const showError = (message) => {
  elements.grid.innerHTML = '';
  elements.feedback.className = 'feedback feedback-error';
  elements.feedback.innerHTML = `
    <p>${escapeHtml(message)}</p>
    <button type="button" class="btn btn-primary" data-action="retry">Try again</button>`;
};

export const renderVehicles = (vehicles) => {
  if (vehicles.length === 0) {
    showEmpty();
    return;
  }
  clearFeedback();
  elements.grid.innerHTML = vehicles.map(vehicleCard).join('');
};

export const setInventoryNotice = (message) => {
  elements.inventoryNotice.textContent = message;
};

export const renderSearchSuggestions = (items) => {
  const labels = [...new Set(items.map(({ label }) => label))];
  elements.suggestions.innerHTML = labels
    .map((label) => `<option value="${escapeHtml(label)}"></option>`)
    .join('');
};

export const setResultsInfo = (shown, total) => {
  elements.resultsInfo.textContent = `Showing ${shown} of ${total} vehicles`;
};

export const showToast = (type, message) => {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  if (type === 'error') toast.setAttribute('role', 'alert');
  toast.textContent = message;
  elements.toastRegion.append(toast);
  setTimeout(() => toast.remove(), 4500);
};

export const setBusy = (button, busy, busyLabel, idleLabel) => {
  button.disabled = busy;
  button.textContent = busy ? busyLabel : idleLabel;
};

export const clearFieldErrors = () => {
  elements.form.querySelectorAll('[data-error-for]').forEach((node) => {
    node.textContent = '';
  });
  elements.form.querySelectorAll('.invalid').forEach((node) => {
    node.classList.remove('invalid');
    node.removeAttribute('aria-invalid');
  });
};

export const showFieldErrors = (errors) => {
  clearFieldErrors();
  Object.entries(errors).forEach(([field, message]) => {
    const target = elements.form.querySelector(`[data-error-for="${field}"]`);
    const input = elements.form.elements[field];
    if (target) target.textContent = message;
    if (input) {
      input.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
    }
  });
  elements.form.querySelector('.invalid')?.focus();
};

export const readFormValues = () => {
  const { brand, model, year, price, mileage, color, status } = elements.form.elements;
  return {
    brand: brand.value,
    model: model.value.trim(),
    year: Number(year.value),
    price: Number(price.value),
    mileage: Number(mileage.value),
    color: color.value.trim(),
    status: status.value,
  };
};

export const openFormDialog = (vehicle = null) => {
  const { form, formTitle, submitBtn, formDialog } = elements;
  form.reset();
  clearFieldErrors();

  if (vehicle) {
    const { brand, model, year, price, mileage, color, status } = vehicle;
    Object.entries({ brand, model, year, price, mileage, color, status }).forEach(([name, value]) => {
      form.elements[name].value = value;
    });
  }

  formTitle.textContent = vehicle ? 'Edit vehicle' : 'Add vehicle';
  submitBtn.textContent = vehicle ? 'Save changes' : 'Add vehicle';
  formDialog.showModal();
};

export const openDetails = ({ id, brand, model, year, price, mileage, color, status }) => {
  elements.detailsBody.innerHTML = `
    <h2>${escapeHtml(brand)} ${escapeHtml(model)}</h2>
    <span class="badge badge-${escapeHtml(status)}">${escapeHtml(capitalize(status))}</span>
    <dl class="details-list">
      <div><dt>ID</dt><dd>${escapeHtml(id)}</dd></div>
      <div><dt>Brand</dt><dd>${escapeHtml(brand)}</dd></div>
      <div><dt>Model</dt><dd>${escapeHtml(model)}</dd></div>
      <div><dt>Year</dt><dd>${escapeHtml(year)}</dd></div>
      <div><dt>Price</dt><dd>${currency.format(price)}</dd></div>
      <div><dt>Mileage</dt><dd>${number.format(mileage)} km</dd></div>
      <div><dt>Color</dt><dd>${escapeHtml(color)}</dd></div>
    </dl>`;
  elements.detailsDialog.showModal();
};

export const openConfirm = ({ brand, model, year }) => {
  elements.confirmText.textContent = `Delete ${brand} ${model} (${year})? This cannot be undone.`;
  elements.confirmDialog.showModal();
};
