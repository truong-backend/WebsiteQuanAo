// src/features/admin/types/contact.types.ts
// Moved from: src/types/contact/contact.types.ts

export type ContactStatus = 'UNREAD' | 'READ' | 'REPLIED';

export const ContactStatusLabels: Record<ContactStatus, string> = {
  UNREAD:  'Chưa đọc',
  READ:    'Đã đọc',
  REPLIED: 'Đã trả lời',
};

export const ContactStatusColors: Record<ContactStatus, string> = {
  UNREAD:  '#ef4444',
  READ:    '#3b82f6',
  REPLIED: '#22c55e',
};

export interface ContactCreateRequest {
  name: string; email: string; phone?: string; subject?: string; message: string;
}
export interface ContactStatusUpdateRequest { status: ContactStatus; adminNote?: string; }
export interface ContactReplyRequest { subject: string; body: string; }
export interface ContactResponse {
  id: number; name: string; email: string; phone?: string;
  subject?: string; message: string; status: ContactStatus;
  createdAt: string; adminNote?: string;
}
