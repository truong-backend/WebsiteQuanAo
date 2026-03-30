// src/features/account/api/accountApi.ts
// Moved from: src/modules/account/account.module.ts (class AccountApi)
import { BaseApi } from '@/services/baseApi';
import type { AccountResponse, AccountCreateRequest, AccountUpdateRequest } from '../types/account.types';
import type { OrderBasicResponse } from '@/features/orders/types/order.types';

class AccountApi extends BaseApi<AccountResponse, AccountCreateRequest, AccountUpdateRequest> {
  constructor() { super('accounts'); }

  searchAndFilter(page = 0, size = 10, search?: string, role?: string, sortBy = 'email', sortDir: 'asc' | 'desc' = 'asc') {
    return this.axiosInstance.get('', { params: { page, size, search, role, sortBy, sortDir } });
  }

  getMe()                                                           { return this.axiosInstance.get<AccountResponse>('/me'); }
  updateMe(payload: AccountUpdateRequest)                           { return this.axiosInstance.put<AccountResponse>('/me', payload); }
  changePassword(p: { oldPassword: string; newPassword: string })  { return this.axiosInstance.put('/me/password', p); }
  updateRole(id: string | number, role: string)                    { return this.axiosInstance.put<AccountResponse>(`/${id}/role`, { role }); }
  enable(id: string | number)                                      { return this.axiosInstance.put<AccountResponse>(`/${id}/enable`); }
  disable(id: string | number)                                     { return this.axiosInstance.put<AccountResponse>(`/${id}/disable`); }
  getOrdersByAccountId(id: string | number)                        { return this.axiosInstance.get<OrderBasicResponse[]>(`/${id}/orders`); }
  getMyOrders()                                                    { return this.axiosInstance.get<OrderBasicResponse[]>('/me/orders'); }
}

export const accountApi = new AccountApi();
