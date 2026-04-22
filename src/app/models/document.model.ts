export type DocumentCategory =
  | 'garda-vetting'
  | 'health-safety'
  | 'first-aid'
  | 'other';

export interface AppDocument {
  id: string;
  title: string;
  imageUrl: string;
  category: DocumentCategory;
  uploadedBy: string;
  createdAt: string;
}