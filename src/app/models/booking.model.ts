export interface Booking {
  id: string;
  groupName: string;
  date: string; // ISO string
  startTime: string;
  endTime: string;
  activity: string;
  kidsCount: number;
  teachersCount: number;
  medicalNotes?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}
