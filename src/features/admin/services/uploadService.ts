// src/features/admin/services/uploadService.ts
// Moved from: src/modules/upload/upload.module.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const UploadService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post<{ url: string }>(
      `${API_BASE}/uploads/image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data.url;
  },
};
