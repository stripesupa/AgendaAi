import { create } from 'zustand';
import { AppState, Service, WorkingHours, Appointment } from '../types';
import * as supabaseApi from '../lib/supabase';

export const useAppStore = create<AppState & {
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, shopName: string, shopSlug: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Services
  fetchServices: () => Promise<void>;
  createService: (service: Omit<Service, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateService: (service: Partial<Service> & { id: string }) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  
  // Working Hours
  fetchWorkingHours: () => Promise<void>;
  updateWorkingHours: (workingHours: WorkingHours[]) => Promise<void>;
  
  // Appointments
  fetchAppointments: (startDate?: Date, endDate?: Date) => Promise<void>;
}>(
  (set, get) => ({
    user: null,
    services: [],
    workingHours: [],
    appointments: [],
    isInitialized: false,
    isLoading: false,
    error: null,

    initialize: async () => {
      try {
        set({ isLoading: true, error: null });
        const user = await supabaseApi.getCurrentUser();
        set({ user, isInitialized: true });
        
        if (user) {
          await get().fetchServices();
          await get().fetchWorkingHours();
          await get().fetchAppointments();
        }
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    signIn: async (email, password) => {
      try {
        set({ isLoading: true, error: null });
        await supabaseApi.signIn(email, password);
        await get().initialize();
      } catch (error) {
        set({ error: (error as Error).message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    signUp: async (email, password, shopName, shopSlug) => {
      try {
        set({ isLoading: true, error: null });
        await supabaseApi.signUp(email, password, shopName, shopSlug);
        await get().initialize();
      } catch (error) {
        set({ error: (error as Error).message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    signOut: async () => {
      try {
        set({ isLoading: true, error: null });
        await supabaseApi.signOut();
        set({ 
          user: null, 
          services: [], 
          workingHours: [], 
          appointments: [], 
          isInitialized: true 
        });
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchServices: async () => {
      try {
        set({ isLoading: true, error: null });
        const services = await supabaseApi.getServices();
        set({ services });
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    createService: async (service) => {
      try {
        set({ isLoading: true, error: null });
        const newService = await supabaseApi.createService(service);
        set(state => ({ 
          services: [...state.services, newService] 
        }));
      } catch (error) {
        set({ error: (error as Error).message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    updateService: async (service) => {
      try {
        set({ isLoading: true, error: null });
        const updatedService = await supabaseApi.updateService(service);
        set(state => ({
          services: state.services.map(s => 
            s.id === updatedService.id ? updatedService : s
          )
        }));
      } catch (error) {
        set({ error: (error as Error).message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    deleteService: async (serviceId) => {
      try {
        set({ isLoading: true, error: null });
        await supabaseApi.deleteService(serviceId);
        set(state => ({
          services: state.services.filter(s => s.id !== serviceId)
        }));
      } catch (error) {
        set({ error: (error as Error).message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    fetchWorkingHours: async () => {
      try {
        set({ isLoading: true, error: null });
        const workingHours = await supabaseApi.getWorkingHours();
        set({ workingHours });
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },

    updateWorkingHours: async (workingHours) => {
      try {
        set({ isLoading: true, error: null });
        const updatedHours = await supabaseApi.updateWorkingHours(workingHours);
        set({ workingHours: updatedHours });
      } catch (error) {
        set({ error: (error as Error).message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    fetchAppointments: async (startDate, endDate) => {
      try {
        set({ isLoading: true, error: null });
        const appointments = await supabaseApi.getAppointments(startDate, endDate);
        set({ appointments });
      } catch (error) {
        set({ error: (error as Error).message });
      } finally {
        set({ isLoading: false });
      }
    },
  })
);