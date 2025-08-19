import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface ParcelJourneyDB {
  id: string
  bag_id: string
  customer_name: string | null
  customer_phone: string | null
  recipient_name: string | null
  recipient_phone: string | null
  from_location: any
  to_location: any
  parcel_size: string | null
  number_of_boxes: number | null
  special_instructions: string | null
  status: 'pending' | 'in-transit' | 'delivered'
  created_at: string
  updated_at: string
} 