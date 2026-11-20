const BASE_URL = 'http://localhost:3000/vehicles';
const TIMEOUT_MS = 8000;

const HTTP_MESSAGES = {
  400: 'Bad request: the server rejected the submitted data.',
  401: 'Unauthorized: you are not allowed to perform this action.',
  404: 'Not found: the requested vehicle does not exist.',
  500: 'Server error: something went wrong on the server. Try again later.',
};

export class ApiError extends Error {
  constructor(message, { kind = 'http', status = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

const buildUrl = (path = '', params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== '' && value != null)
  ).toString();
  return `${BASE_URL}${path}${query ? `?${query}` : ''}`;
};

async function request(url, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  const options = { method, headers };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  options.signal = controller.signal;

  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    const message =
      error.name === 'AbortError'
        ? 'Network error: the API did not respond in time. Check that JSON Server is running on port 3000.'
        : 'Network error: could not reach the API. Make sure JSON Server is running on port 3000.';
    throw new ApiError(message, { kind: 'network' });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const message =
      HTTP_MESSAGES[response.status] ?? `Request failed with status ${response.status}.`;
    throw new ApiError(message, { status: response.status });
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError('The server returned a response that is not valid JSON.', {
      status: response.status,
    });
  }
}

export const getVehicles = (params = {}) => request(buildUrl('', params));

export const getVehicleById = (id) => request(buildUrl(`/${id}`));

export const createVehicle = (vehicle) => request(buildUrl(), { method: 'POST', body: vehicle });

export const updateVehicle = (id, vehicle) =>
  request(buildUrl(`/${id}`), { method: 'PUT', body: vehicle });

export const deleteVehicle = (id) => request(buildUrl(`/${id}`), { method: 'DELETE' });
