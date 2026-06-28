export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const IMAGE_BASE_URL = API_BASE_URL.replace('/api', '');

export interface VillaImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  album?: string;
}

export interface VillaFacility {
  id: string;
  name: string;
  name_en?: string;
  icon: string;
}

export interface Villa {
  id: string;
  name: string;
  slug: string;
  description: string;
  description_en?: string;
  location: string;
  capacity: number;
  base_price: number;
  weekend_price: number;
  extra_guest_fee: number;
  weekend_enabled: boolean;
  tagline: string;
  tagline_en?: string;
  long_description: string[];
  long_description_en?: string[];
  size: string;
  bed_count: number;
  bathroom_count: number;
  view_description: string;
  view_description_en?: string;
  max_guests: number;
  features: string[];
  features_en?: string[];
  images: VillaImage[];
  facilities: VillaFacility[];
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

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
  getVillas: (): Promise<ApiResponse<Villa[]>> => fetchApi('/villas'),
  getVilla: (slug: string): Promise<ApiResponse<Villa>> => fetchApi(`/villas/${slug}`),
  checkAvailability: (data: any) => 
    fetch(`${API_BASE_URL}/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  getBookedDates: (slug: string) => fetch(`${API_BASE_URL}/villas/${slug}/booked-dates`).then(r => r.json()),
  submitBooking: (data: any) =>
    fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),
};
