export type ShiftAssignmentType =
  | 'residential-group'
  | 'activity-station'
  | 'follow-day-group';

export type ShiftStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'worked';

export interface RotaShift {
  id: string;
  employeeId?: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;

  assignmentType: ShiftAssignmentType;

  bookingId?: string;
  groupName?: string;

  // backend sends this
  activity?: string | null;

  // keep this optional so old code doesn't explode
  activityName?: string | null;

  status: ShiftStatus;
  confirmedWorked?: boolean;
  createdAt?: string;
  respondedAt?: string | null;
}