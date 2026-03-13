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
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  assignmentType: ShiftAssignmentType;

  bookingId?: string;
  groupName?: string;
  activityName?: string;

  status: ShiftStatus;
}