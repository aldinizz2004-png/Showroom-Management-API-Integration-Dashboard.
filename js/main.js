import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from './api.js';
import {
  filterVehicles,
  sortVehicles,
  findVehicle,
  validateVehicle,
  hasAvailableVehicles,
  isEverythingSold,
  toListItems,
} from './vehicles.js';
import { calculateStats, renderStats } from './dashboard.js';
import * as ui from './ui.js';

const { elements, readFormValues } = ui;

const DEFAULT_FILTERS = {
  search: '',
  brand: '',
  status: '',
  minPrice: '',
  maxPrice: '',
  sort: '',
};

const state = {
  allVehicles: [],
  sourceVehicles: [],
  filters: { ...DEFAULT_FILTERS },
  busy: false,
  editingId: null,
  deletingId: null,
};

let latestRequest = 0;

const getInventoryNotice = (vehicles) => {
  if (isEverythingSold(vehicles)) return 'Every vehicle in the showroom has been sold.';
  if (vehicles.length > 0 && !hasAvailableVehicles(vehicles)) {
    return 'No vehicles are currently available for sale.';
  }
  return '';
};

const render = () => {
  const { search, minPrice, maxPrice, sort } = state.filters;
  renderStats(calculateStats(state.allVehicles));

  if (minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice)) {
    ui.showEmpty('The minimum price is higher than the maximum price.');
    ui.setResultsInfo(0, state.allVehicles.length);
    return;
  }

  const filtered = filterVehicles(state.sourceVehicles, { search, minPrice, maxPrice });
  const visible = sortVehicles(filtered, sort);
  ui.renderVehicles(visible);
  ui.setResultsInfo(visible.length, state.allVehicles.length);
};

async function loadVehicles() {
  const { brand, status } = state.filters;
  const requestId = ++latestRequest;
  ui.showLoading();

  try {
    const [allVehicles, filteredVehicles] = await Promise.all([
      getVehicles(),
      brand || status ? getVehicles({ brand, status }) : null,
    ]);
    if (requestId !== latestRequest) return;

    state.allVehicles = allVehicles;
    state.sourceVehicles = filteredVehicles ?? allVehicles;
    ui.renderSearchSuggestions(toListItems(allVehicles));
    ui.setInventoryNotice(getInventoryNotice(allVehicles));
    render();
  } catch (error) {
    if (requestId === latestRequest) ui.showError(error.message);
  }
}

const readFilters = () => {
  const { searchInput, brandFilter, statusFilter, minPrice, maxPrice, sortSelect } = elements;
  state.filters = {
    search: searchInput.value,
    brand: brandFilter.value,
    status: statusFilter.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    sort: sortSelect.value,
  };
};

const handleLocalFilterChange = () => {
  readFilters();
  render();
};

const handleRemoteFilterChange = () => {
  readFilters();
  loadVehicles();
};

const handleReset = () => {
  elements.filterForm.reset();
  state.filters = { ...DEFAULT_FILTERS };
  loadVehicles();
};

const handleGridClick = async (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || state.busy) return;

  const card = button.closest('[data-id]');
  const id = Number(card.dataset.id);
  const { action } = button.dataset;

  if (action === 'view') {
    try {
      ui.openDetails(await getVehicleById(id));
    } catch (error) {
      ui.showToast('error', error.message);
      if (error.status === 404) loadVehicles();
    }
  }

  if (action === 'edit') {
    const vehicle = findVehicle(state.allVehicles, id);
    if (!vehicle) return;
    state.editingId = id;
    ui.openFormDialog(vehicle);
  }

  if (action === 'delete') {
    const vehicle = findVehicle(state.allVehicles, id);
    if (!vehicle) return;
    state.deletingId = id;
    ui.openConfirm(vehicle);
  }
};

const handleFeedbackClick = (event) => {
  if (event.target.closest('[data-action="retry"]')) loadVehicles();
};

const handleFormSubmit = async (event) => {
  event.preventDefault();
  if (state.busy) return;

  const values = readFormValues();
  const errors = validateVehicle(values);
  if (Object.keys(errors).length > 0) {
    ui.showFieldErrors(errors);
    return;
  }
  ui.clearFieldErrors();

  const isEdit = state.editingId !== null;
  const idleLabel = isEdit ? 'Save changes' : 'Add vehicle';
  state.busy = true;
  ui.setBusy(elements.submitBtn, true, 'Saving...', idleLabel);

  try {
    if (isEdit) {
      await updateVehicle(state.editingId, { ...values, id: state.editingId });
    } else {
      await createVehicle(values);
    }
    elements.formDialog.close();
    ui.showToast('success', isEdit ? 'Vehicle updated successfully.' : 'Vehicle added successfully.');
    state.busy = false;
    await loadVehicles();
  } catch (error) {
    ui.showToast('error', error.message);
  } finally {
    state.busy = false;
    ui.setBusy(elements.submitBtn, false, 'Saving...', idleLabel);
  }
};

const handleConfirmDelete = async () => {
  if (state.busy || state.deletingId === null) return;

  state.busy = true;
  ui.setBusy(elements.confirmBtn, true, 'Deleting...', 'Delete');

  try {
    await deleteVehicle(state.deletingId);
    elements.confirmDialog.close();
    ui.showToast('success', 'Vehicle deleted successfully.');
    state.busy = false;
    await loadVehicles();
  } catch (error) {
    elements.confirmDialog.close();
    ui.showToast('error', error.message);
    if (error.status === 404) await loadVehicles();
  } finally {
    state.busy = false;
    ui.setBusy(elements.confirmBtn, false, 'Deleting...', 'Delete');
  }
};

const init = () => {
  const { filterForm, searchInput, minPrice, maxPrice, sortSelect, brandFilter, statusFilter } =
    elements;

  [searchInput, minPrice, maxPrice].forEach((input) =>
    input.addEventListener('input', handleLocalFilterChange)
  );
  sortSelect.addEventListener('change', handleLocalFilterChange);
  [brandFilter, statusFilter].forEach((select) =>
    select.addEventListener('change', handleRemoteFilterChange)
  );
  filterForm.addEventListener('submit', (event) => event.preventDefault());
  elements.resetBtn.addEventListener('click', handleReset);

  elements.grid.addEventListener('click', handleGridClick);
  elements.feedback.addEventListener('click', handleFeedbackClick);

  elements.addBtn.addEventListener('click', () => {
    state.editingId = null;
    ui.openFormDialog();
  });
  elements.form.addEventListener('submit', handleFormSubmit);
  elements.cancelBtn.addEventListener('click', () => elements.formDialog.close());
  elements.closeDetailsBtn.addEventListener('click', () => elements.detailsDialog.close());
  elements.confirmBtn.addEventListener('click', handleConfirmDelete);
  elements.confirmCancelBtn.addEventListener('click', () => elements.confirmDialog.close());

  loadVehicles();
};

init();
