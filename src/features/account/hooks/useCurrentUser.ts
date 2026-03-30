// src/features/account/hooks/useCurrentUser.ts
import { useState, useEffect } from 'react';
import { AccountService } from '../services/accountService';
import type { AccountResponse } from '../types/account.types';

export function useCurrentUser() {
  const [user, setUser]       = useState<AccountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    AccountService.getCurrentUser()
      .then(setUser)
      .catch((err) => setError(err instanceof Error ? err.message : 'Có lỗi xảy ra'))
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    setError(null);
    AccountService.getCurrentUser()
      .then(setUser)
      .catch((err) => setError(err instanceof Error ? err.message : 'Có lỗi xảy ra'))
      .finally(() => setLoading(false));
  };

  return { user, setUser, loading, error, refresh };
}
