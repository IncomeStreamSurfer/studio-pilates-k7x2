import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabaseServiceRole = import.meta.env.SUPABASE_SERVICE_ROLE ?? '';

export interface Instructor {
  id: string;
  slug: string;
  name: string;
  speciality: string;
  bio: string;
  photo_url: string | null;
  certifications: string[] | null;
  years_experience: number | null;
  created_at: string;
}

export interface PilatesClass {
  id: string;
  slug: string;
  name: string;
  description: string;
  class_type: 'reformer' | 'mat' | 'tower' | 'prenatal' | 'private' | 'beginner-foundations';
  price_pence: number;
  currency: string;
  duration_minutes: number;
  level: string;
  image_url: string | null;
  created_at: string;
}

export interface ClassSession {
  id: string;
  class_id: string;
  instructor_id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  spots_booked: number;
  created_at: string;
  class?: PilatesClass;
  instructor?: Instructor;
}

export interface Booking {
  id: string;
  session_id: string;
  customer_email: string;
  customer_name: string;
  amount_paid_pence: number;
  currency: string;
  stripe_session_id: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface ContentRow {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string | null;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  cover_image_url: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export function getSupabase(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

export function getAdminSupabase(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceRole, {
    auth: { persistSession: false },
  });
}
