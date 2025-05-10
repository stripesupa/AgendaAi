export interface User {
  id: string;
  email: string;
  shop_name: string;
  shop_slug: string;
  created_at: string;
  subscription_status: 'active' | 'inactive' | 'trial';
  subscription_end_date?: string;
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  description?: string;
  user_id: string;
  created_at: string;
}

export interface WorkingHours {
  id: string;
  day_of_week: number; // 0-6, where 0 is Sunday
  start_time: string; // format: "09:00"
  end_time: string; // format: "18:00"
  is_working_day: boolean;
  user_id: string;
}

export interface Appointment {
  id: string;
  service_id: string;
  client_name: string;
  client_phone: string;
  start_time: string; // ISO date string
  end_time: string; // ISO date string
  status: 'scheduled' | 'cancelled' | 'completed';
  user_id: string;
  created_at: string;
  service?: Service;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  appointment?: Appointment;
}

export interface AppState {
  user: User | null;
  services: Service[];
  workingHours: WorkingHours[];
  appointments: Appointment[];
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}