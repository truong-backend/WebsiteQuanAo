// src/features/admin/api/contactApi.ts
// Moved from: src/modules/contact/contact.module.ts (class ContactApi)
import { BaseApi } from '@/services/baseApi';
import type {
  ContactResponse, ContactCreateRequest,
  ContactStatusUpdateRequest, ContactReplyRequest,
} from '../types/contact.types';

class ContactApi extends BaseApi<ContactResponse, ContactCreateRequest, ContactStatusUpdateRequest> {
  constructor() { super('contacts'); }
  getStats()                                                     { return this.axiosInstance.get<Record<string, number>>('/stats'); }
  updateStatus(id: number, payload: ContactStatusUpdateRequest)  { return this.axiosInstance.patch<ContactResponse>(`/${id}/status`, payload); }
  sendReply(id: number, payload: ContactReplyRequest)            { return this.axiosInstance.post<ContactResponse>(`/${id}/reply`, payload); }
}

export const contactApi = new ContactApi();