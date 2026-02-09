export type ShiftStatus = 'pending' | 'accepted' | 'declined';
export type ShiftType = 'activity' | 'group';

export interface RotaShift {
  id: string;
  date: string; // ISO
  startTime: string;
  endTime: string;

  type: ShiftType;

  activity?: string;   // for activity shift
  groupName?: string;  // for group shift

  employeeId: string;
  employeeName: string;

  // connection to booking (part 2)
  bookingId?: string;

  status: ShiftStatus;

  // timestamps (part 3)
  createdAt: string;          // ISO
  respondedAt?: string;       // ISO (when accepted/declined)
}
