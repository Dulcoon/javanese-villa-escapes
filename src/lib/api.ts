export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  getVillas: () => fetchApi('/villas'),
  getVilla: (slug: string) => fetchApi(`/villas/${slug}`),
  checkAvailability: (data: any) => fetchApi('/check-availability', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  submitBooking: (data: any) => fetchApi('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};
