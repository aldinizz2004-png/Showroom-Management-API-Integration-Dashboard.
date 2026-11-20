export const BRANDS = ['Chery', 'OMODA', 'JAECOO'];
export const STATUSES = ['available', 'reserved', 'sold'];

export const searchVehicles = (vehicles, term) => {
  const query = term.trim().toLowerCase();
  if (!query) return vehicles;
  return vehicles.filter(({ brand, model }) =>
    `${brand} ${model}`.toLowerCase().includes(query)
  );
};

export const filterByPrice = (vehicles, min, max) =>
  vehicles.filter(({ price }) => {
    const aboveMin = min === '' || price >= Number(min);
    const belowMax = max === '' || price <= Number(max);
    return aboveMin && belowMax;
  });

export const filterVehicles = (vehicles, { search = '', minPrice = '', maxPrice = '' } = {}) =>
  filterByPrice(searchVehicles(vehicles, search), minPrice, maxPrice);

const SORTERS = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'year-asc': (a, b) => a.year - b.year,
  'year-desc': (a, b) => b.year - a.year,
};

export const sortVehicles = (vehicles, sortKey) => {
  const sorter = SORTERS[sortKey];
  return sorter ? [...vehicles].sort(sorter) : [...vehicles];
};

export const findVehicle = (vehicles, id) => vehicles.find((vehicle) => vehicle.id === id);

export const hasAvailableVehicles = (vehicles) =>
  vehicles.some(({ status }) => status === 'available');

export const isEverythingSold = (vehicles) =>
  vehicles.length > 0 && vehicles.every(({ status }) => status === 'sold');

export const toListItems = (vehicles) =>
  vehicles.map(({ id, brand, model }) => ({ id, label: `${brand} ${model}` }));

export const validateVehicle = (values) => {
  const errors = {};
  const maxYear = new Date().getFullYear() + 1;
  const { brand, model, year, price, mileage, color, status } = values;

  if (!BRANDS.includes(brand)) errors.brand = 'Choose a brand.';
  if (model.trim().length < 2) errors.model = 'Model must be at least 2 characters.';
  if (!Number.isInteger(year) || year < 1990 || year > maxYear) {
    errors.year = `Year must be between 1990 and ${maxYear}.`;
  }
  if (!Number.isFinite(price) || price <= 0) errors.price = 'Price must be greater than 0.';
  if (!Number.isFinite(mileage) || mileage < 0) errors.mileage = 'Mileage cannot be negative.';
  if (color.trim().length < 2) errors.color = 'Color must be at least 2 characters.';
  if (!STATUSES.includes(status)) errors.status = 'Choose a status.';

  return errors;
};
