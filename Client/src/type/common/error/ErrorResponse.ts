// src/type/common/ErrorResponse.ts
export interface ErrorResponse {
  errorCode: string;
  message: string;
  status: number;
  timestamp: string;
  path: string;
  details?: {
    fieldName?: string;
    resourceName?: string;
    fieldValue?: string;
  };
}
