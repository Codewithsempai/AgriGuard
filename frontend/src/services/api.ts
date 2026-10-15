import axios from 'axios';
import type {
  User, Farm, Field, Crop, Expense, Harvest, Task, PestObservation,
  DiseasePredictionResponse, DiseaseHistoryItem, SoilAnalysisResult,
  SoilHistoryItem, MarketPrice, Article, NotificationItem, DashboardStats,
  ReportSummary, WeatherData
} from '../types';

export const PRODUCTION_API_URL = 'https://agriguard-api-0115.onrender.com/api/v1';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalhost && import.meta.env.DEV ? '/api/v1' : PRODUCTION_API_URL);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const getAssetUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const backendOrigin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${backendOrigin}${path.startsWith('/') ? '' : '/'}${path}`;
};

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('agriguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('agriguard_token');
      localStorage.removeItem('agriguard_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  register: (data: { email: string; name: string; password: string }) =>
    apiClient.post<User>('/auth/register', data).then(r => r.data),
    
  login: (data: FormData | URLSearchParams | { username: string; password: string }) => {
    let body: any = data;
    const headers: Record<string, string> = {};
    if (!(data instanceof FormData) && !(data instanceof URLSearchParams)) {
      const params = new URLSearchParams();
      params.append('username', (data as any).username || (data as any).email);
      params.append('password', (data as any).password);
      body = params;
    }
    if (body instanceof URLSearchParams) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    return apiClient.post<{ access_token: string; token_type: string; user: User }>('/auth/login', body, { headers }).then(r => r.data);
  },
    
  getMe: () =>
    apiClient.get<User>('/auth/me').then(r => r.data),
    
  updateMe: (data: { name?: string; language?: string }) =>
    apiClient.put<User>('/auth/me', data).then(r => r.data),
    
  getAdminUsers: () =>
    apiClient.get<User[]>('/admin/users').then(r => r.data),

  // Dashboard
  getDashboard: () =>
    apiClient.get<DashboardStats>('/dashboard').then(r => ({
      ...r.data,
      recent_disease: r.data.recent_disease?.map(d => ({
        ...d,
        image_url: getAssetUrl(d.image_url)
      }))
    })),

  // Farms
  getFarms: (q?: string) =>
    apiClient.get<{ total: number; items: Farm[] }>('/farms', { params: { q } }).then(r => r.data),
  createFarm: (data: Partial<Farm>) =>
    apiClient.post<Farm>('/farms', data).then(r => r.data),
  updateFarm: (id: number, data: Partial<Farm>) =>
    apiClient.put<Farm>(`/farms/${id}`, data).then(r => r.data),
  deleteFarm: (id: number) =>
    apiClient.delete(`/farms/${id}`),

  // Fields
  getFields: () =>
    apiClient.get<{ total: number; items: Field[] }>('/fields').then(r => r.data),
  createField: (data: Partial<Field>) =>
    apiClient.post<Field>('/fields', data).then(r => r.data),
  updateField: (id: number, data: Partial<Field>) =>
    apiClient.put<Field>(`/fields/${id}`, data).then(r => r.data),
  deleteField: (id: number) =>
    apiClient.delete(`/fields/${id}`),

  // Crops
  getCrops: () =>
    apiClient.get<{ total: number; items: Crop[] }>('/crops').then(r => r.data),
  createCrop: (data: Partial<Crop>) =>
    apiClient.post<Crop>('/crops', data).then(r => r.data),
  updateCrop: (id: number, data: Partial<Crop>) =>
    apiClient.put<Crop>(`/crops/${id}`, data).then(r => r.data),
  deleteCrop: (id: number) =>
    apiClient.delete(`/crops/${id}`),

  // Expenses
  getExpenses: () =>
    apiClient.get<{ total: number; items: Expense[] }>('/expenses').then(r => r.data),
  createExpense: (data: Partial<Expense>) =>
    apiClient.post<Expense>('/expenses', data).then(r => r.data),
  updateExpense: (id: number, data: Partial<Expense>) =>
    apiClient.put<Expense>(`/expenses/${id}`, data).then(r => r.data),
  deleteExpense: (id: number) =>
    apiClient.delete(`/expenses/${id}`),

  // Harvests
  getHarvests: () =>
    apiClient.get<{ total: number; items: Harvest[] }>('/harvests').then(r => r.data),
  createHarvest: (data: Partial<Harvest>) =>
    apiClient.post<Harvest>('/harvests', data).then(r => r.data),
  updateHarvest: (id: number, data: Partial<Harvest>) =>
    apiClient.put<Harvest>(`/harvests/${id}`, data).then(r => r.data),
  deleteHarvest: (id: number) =>
    apiClient.delete(`/harvests/${id}`),

  // Tasks & Calendar
  getTasks: () =>
    apiClient.get<{ total: number; items: Task[] }>('/tasks').then(r => r.data),
  createTask: (data: Partial<Task>) =>
    apiClient.post<Task>('/tasks', data).then(r => r.data),
  updateTask: (id: number, data: Partial<Task>) =>
    apiClient.put<Task>(`/tasks/${id}`, data).then(r => r.data),
  toggleTask: (id: number) =>
    apiClient.post<Task>(`/tasks/${id}/toggle`).then(r => r.data),
  deleteTask: (id: number) =>
    apiClient.delete(`/tasks/${id}`),

  // Pest Management
  getPestObservations: () =>
    apiClient.get<{ total: number; items: PestObservation[] }>('/pest-observations').then(r => r.data),
  createPestObservation: (data: Partial<PestObservation>) =>
    apiClient.post<PestObservation>('/pest-observations', data).then(r => r.data),
  deletePestObservation: (id: number) =>
    apiClient.delete(`/pest-observations/${id}`),

  // Disease
  predictDisease: (formData: FormData) =>
    apiClient.post<DiseasePredictionResponse>('/disease/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => ({
      ...r.data,
      image_url: getAssetUrl(r.data.image_url)
    })),
  getDiseaseHistory: () =>
    apiClient.get<DiseaseHistoryItem[]>('/disease/history').then(r =>
      r.data.map(item => ({
        ...item,
        image_url: getAssetUrl(item.image_url)
      }))
    ),
  deleteDiseaseHistoryItem: (id: number) =>
    apiClient.delete(`/disease/history/${id}`).then(r => r.data),
  clearAllDiseaseHistory: () =>
    apiClient.delete('/disease/history').then(r => r.data),
  getDiseaseEngineStatus: () =>
    apiClient.get<{ gemini_active: boolean; engine: string; model_available: boolean }>('/disease/engine-status').then(r => r.data),
  configureGeminiKey: (apiKey: string) =>
    apiClient.post<{ status: string; gemini_active: boolean }>('/disease/configure-key', { api_key: apiKey }).then(r => r.data),

  // Soil
  analyzeSoil: (data: { field_id?: number | null; crop_name?: string | null; ph: number; nitrogen: number; phosphorus: number; potassium: number; soil_type?: string | null; save?: boolean }) =>
    apiClient.post<SoilAnalysisResult>('/soil/analyze', data).then(r => r.data),
  getSoilHistory: () =>
    apiClient.get<SoilHistoryItem[]>('/soil/history').then(r => r.data),

  // Weather
  getWeather: async (lat: number, lon: number): Promise<WeatherData> => {
    try {
      const res = await apiClient.get<WeatherData>('/weather/forecast', { params: { lat, lon } });
      return res.data;
    } catch (backendError) {
      // Live fallback directly to Open-Meteo when backend is asleep, cold-starting, or unauthenticated
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=auto&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=precipitation,precipitation_probability,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code&forecast_days=7`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Open-Meteo API returned status ${resp.status}`);
        const data = await resp.json();
        return {
          source: 'Open-Meteo (open-meteo.com)',
          fetched_at: new Date().toISOString(),
          data,
        };
      } catch {
        throw backendError;
      }
    }
  },

  // Market Prices
  getMarketPrices: (params?: { crop?: string; market?: string; on?: string }) =>
    apiClient.get<{ total: number; items: MarketPrice[] }>('/market-prices', { params }).then(r => r.data),
  createMarketPrice: (data: Partial<MarketPrice>) =>
    apiClient.post<MarketPrice>('/market-prices', data).then(r => r.data),
  deleteMarketPrice: (id: number) =>
    apiClient.delete(`/market-prices/${id}`),

  // Knowledge Centre
  getKnowledge: (params?: { q?: string; category?: string; lang?: string }) =>
    apiClient.get<Article[]>('/knowledge', { params }).then(r => r.data),
  createArticle: (data: Partial<Article>) =>
    apiClient.post<Article>('/knowledge', data).then(r => r.data),
  updateArticle: (id: number, data: Partial<Article>) =>
    apiClient.put<Article>(`/knowledge/${id}`, data).then(r => r.data),
  deleteArticle: (id: number) =>
    apiClient.delete(`/knowledge/${id}`),

  // Notifications
  getNotifications: () =>
    apiClient.get<NotificationItem[]>('/notifications').then(r => r.data),
  markNotificationRead: (id: number) =>
    apiClient.post<NotificationItem>(`/notifications/${id}/read`).then(r => r.data),
  markAllNotificationsRead: () =>
    apiClient.post<{ status: string }>('/notifications/read-all').then(r => r.data),

  // Reports
  getReportSummary: () =>
    apiClient.get<ReportSummary>('/reports/summary').then(r => r.data),
  downloadReportCsv: () => {
    return apiClient.get('/reports/summary', {
      params: { format: 'csv' },
      responseType: 'blob'
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `crop_financial_summary_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }
};
