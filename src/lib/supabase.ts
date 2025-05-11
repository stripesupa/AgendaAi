import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signUp(email: string, password: string, shopName: string, shopSlug: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        shop_name: shopName,
        shop_slug: shopSlug,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function createService(service: Omit<Service, 'id' | 'user_id' | 'created_at'>) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('services')
    .insert({
      ...service,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getServices() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getBarberServices(barberId: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('user_id', barberId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateService(service: Partial<Service> & { id: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('services')
    .update(service)
    .eq('id', service.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteService(serviceId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function getWorkingHours() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('working_hours')
    .select('*')
    .eq('user_id', user.id)
    .order('day_of_week', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getBarberWorkingHours(barberId: string) {
  const { data, error } = await supabase
    .from('working_hours')
    .select('*')
    .eq('user_id', barberId)
    .order('day_of_week', { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateWorkingHours(workingHours: WorkingHours[]) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  // Remove existing working hours
  await supabase
    .from('working_hours')
    .delete()
    .eq('user_id', user.id);

  // Insert new working hours
  const { data, error } = await supabase
    .from('working_hours')
    .insert(workingHours.map(hours => ({
      ...hours,
      user_id: user.id,
    })))
    .select();

  if (error) throw error;
  return data;
}

export async function getAppointments(startDate?: Date, endDate?: Date) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  let query = supabase
    .from('appointments')
    .select(`
      *,
      service:services (
        id,
        name,
        duration,
        price
      )
    `)
    .eq('user_id', user.id)
    .order('start_time', { ascending: true });

  if (startDate) {
    query = query.gte('start_time', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('start_time', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function createAppointment(appointment: {
  service_id: string;
  client_name: string;
  client_phone: string;
  start_time: string;
  end_time: string;
  barber_id: string;
}) {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...appointment,
      status: 'scheduled',
      user_id: appointment.barber_id,
    })
    .select(`
      *,
      service:services (
        id,
        name,
        duration,
        price
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function getBarberBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        shop_name,
        shop_slug,
        subscription_status
      `)
      .eq('shop_slug', slug)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle null case

    if (error) throw error;
    
    // Return null if no barber was found
    return data;
  } catch (error) {
    console.error('Error fetching barber by slug:', error);
    return null;
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: 'scheduled' | 'cancelled' | 'completed') {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}