export interface Booking {
  id?: string;
  groupName: string;
  date: string; // ISO string
  startTime: string;
  endTime: string;
  kidsCount: number;
  teachersCount: number;
  medicalNotes?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  bookingType: 'day-group' | 'residential';
  nights?: number; // Only for residential bookings
}
