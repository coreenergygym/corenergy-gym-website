export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'
export type RegistrationStatus = 'NEW' | 'CONTACTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
export type MemberStatus = 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'INACTIVE'

export interface GymSettings {
  id: string
  gym_name: string
  owner_name: string | null
  phone: string | null
  whatsapp_number: string | null
  email: string | null
  address: string | null
  instagram_url: string | null
  opening_hours: string | null
  upi_id: string | null
  payment_qr_url: string | null
  about_text: string | null
  logo_url: string | null
  updated_at: string
}

export interface Membership {
  id: string
  name: string
  duration_label: string
  price: number
  description: string | null
  features: string[]
  is_active: boolean
  sort_order: number
}

export interface ServiceItem {
  id: string
  name: string
  description: string | null
  features: string[]
  is_active: boolean
  sort_order: number
}

export interface Member {
  id: string
  created_at: string
  registration_id: string | null
  full_name: string
  phone: string
  email: string | null
  membership_id: string | null
  membership_name: string | null
  status: MemberStatus
  start_date: string | null
  end_date: string | null
  notes: string | null
}

export interface Registration {
  id: string
  created_at: string
  full_name: string
  phone: string
  email: string | null
  date_of_birth: string | null
  membership_id: string | null
  membership_name: string | null
  preferred_start_date: string | null
  notes: string | null
  status: RegistrationStatus
  admin_notes: string | null
}

export interface Appointment {
  id: string
  created_at: string
  full_name: string
  phone: string
  email: string | null
  service: string
  appointment_date: string
  appointment_time: string
  message: string | null
  status: AppointmentStatus
  admin_notes: string | null
}

export interface Payment {
  id: string
  created_at: string
  registration_id: string | null
  customer_name: string
  customer_phone: string
  amount: number
  transaction_reference: string
  proof_url: string | null
  status: PaymentStatus
  admin_notes: string | null
  verified_at: string | null
}

export interface Receipt {
  id: string
  created_at: string
  payment_id: string
  receipt_number: string
  customer_name: string
  membership_or_service: string
  amount: number
  payment_date: string
  transaction_reference: string
}
