export interface User {
  id: number;
  email: string;
  name: string;
  role: 'farmer' | 'admin';
  language: 'en' | 'ta';
  created_at?: string;
}

export interface Farm {
  id: number;
  name: string;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  area_acres?: number | null;
}

export interface Field {
  id: number;
  farm_id: number;
  name: string;
  area_acres?: number | null;
  soil_type?: string | null;
}

export interface Crop {
  id: number;
  field_id: number;
  name: string;
  variety?: string | null;
  planting_date?: string | null;
  growth_stage: string;
  expected_harvest?: string | null;
  expected_yield_kg?: number | null;
  status: 'active' | 'harvested' | 'failed';
}

export interface Expense {
  id: number;
  crop_id?: number | null;
  category: 'seeds' | 'fertilizer' | 'labor' | 'irrigation' | 'transport' | 'other';
  amount: number;
  spent_on: string;
  note?: string | null;
}

export interface Harvest {
  id: number;
  crop_id: number;
  quantity_kg: number;
  price_per_kg: number;
  harvested_on: string;
}

export interface Task {
  id: number;
  crop_id?: number | null;
  title: string;
  task_type: 'sowing' | 'irrigation' | 'fertilization' | 'pest_inspection' | 'harvesting' | 'other';
  due_date: string;
  completed: boolean;
}

export interface PestObservation {
  id: number;
  crop_id?: number | null;
  kind: 'pest' | 'weed';
  description: string;
  severity: 'low' | 'medium' | 'high';
  observed_on: string;
}

export interface DiseaseDetails {
  crop: string;
  common_name: string;
  tamil_name: string;
  pathogen: string;
  symptoms: {
    en: string;
    ta: string;
  };
  treatments: {
    cultural: string[];
    biological: string[];
    chemical: string[];
  };
  prevention: string;
}

export interface DiseasePredictionItem {
  label: string;
  confidence: number;
  engine?: string;
  details?: DiseaseDetails;
}

export interface DiseasePredictionResponse {
  id: number;
  mode: string;
  predictions: DiseasePredictionItem[];
  top_prediction?: DiseasePredictionItem;
  is_uncertain?: boolean;
  image_url: string;
  created_at?: string;
  message?: string;
  disclaimer?: string;
}

export interface DiseaseHistoryItem {
  id: number;
  crop_id?: number | null;
  image_path: string;
  image_url: string;
  mode: string;
  predicted_label?: string | null;
  confidence?: number | null;
  created_at: string;
  details?: DiseaseDetails;
}

export interface SoilAnalysisResult {
  ratings: {
    nitrogen: 'low' | 'medium' | 'high';
    phosphorus: 'low' | 'medium' | 'high';
    potassium: 'low' | 'medium' | 'high';
  };
  recommendations: Array<{
    nutrient: string;
    rule: string;
    advice: string;
  }>;
  crop_note?: string | null;
  disclaimer: string;
}

export interface SoilHistoryItem {
  id: number;
  field_id?: number | null;
  crop_name?: string | null;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  soil_type?: string | null;
  tested_on: string;
  ratings?: SoilAnalysisResult['ratings'];
  recommendations?: SoilAnalysisResult['recommendations'];
}

export interface MarketPrice {
  id: number;
  crop: string;
  market: string;
  price: number;
  unit: string;
  source: string;
  is_sample: boolean;
  recorded_on: string;
}

export interface Article {
  id: number;
  category: string;
  title_en: string;
  title_ta?: string | null;
  body_en: string;
  body_ta?: string | null;
  title?: string;
  body?: string;
  language?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  farms: number;
  fields: number;
  crops: number;
  active_crops_count: number;
  tasks_pending: number;
  tasks_overdue: number;
  expected_yield_kg: number;
  unread_notifications: number;
  total_cost: number;
  revenue: number;
  profit: number;
  recent_tasks: Task[];
  recent_expenses: Expense[];
  recent_disease: DiseaseHistoryItem[];
}

export interface ReportSummary {
  total_cost: number;
  revenue: number;
  profit: number;
  expenses_by_category: Record<string, number>;
  crops: Array<{
    crop: string;
    status: string;
    cost: number;
    revenue: number;
    profit: number;
  }>;
}

export interface WeatherData {
  source: string;
  fetched_at: string;
  data: {
    current?: {
      temperature_2m: number;
      relative_humidity_2m: number;
      precipitation: number;
      weather_code: number;
      wind_speed_10m: number;
    };
    daily?: {
      time: string[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_sum: number[];
      weather_code: number[];
    };
  };
}
