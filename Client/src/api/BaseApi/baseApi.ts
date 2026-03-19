// src/api/BaseApi/baseApi.ts
import axios from "axios";
import type { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";

export class BaseApi<
  T,
  TCreateRequest = T,
  TUpdateRequest = TCreateRequest,
  TResponse = T,
  TCreateResponse = TResponse
> {
  protected axiosInstance: AxiosInstance;
  protected baseURL: string;

  constructor(endpoint: string) {
    this.baseURL = `http://localhost:8080/${endpoint}`;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ─── Response interceptor: bắt 401 → tự động logout ─────────────────────
    this.axiosInstance.interceptors.response.use(
      (response) => response, // request thành công → trả về bình thường
      (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // Token hết hạn hoặc không hợp lệ
          localStorage.removeItem("token");
          localStorage.removeItem("expiresIn");

          // Redirect về trang login
          // Dùng window.location thay vì navigate vì đây là class nằm ngoài React
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  async getAll<TPageResponse>(
    page = 0,
    size = 10,
    search?: string,
    sortBy?: string,
    sortDir: "asc" | "desc" = "asc",
    additionalParams?: Record<string, string | number | boolean>
  ): Promise<TPageResponse> {
    const params: Record<string, string> = {
      page: page.toString(),
      size: size.toString(),
      sortDir,
    };

    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;

    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = String(value);
        }
      });
    }

    const response: AxiosResponse<TPageResponse> = await this.axiosInstance.get("", { params });
    return response.data;
  }

  async getById(id: number | string): Promise<TResponse> {
    const response: AxiosResponse<TResponse> = await this.axiosInstance.get(`/${id}`);
    return response.data;
  }

  async create(payload: TCreateRequest): Promise<TCreateResponse> {
    const response: AxiosResponse<TCreateResponse> = await this.axiosInstance.post("", payload);
    return response.data;
  }

  async update(id: string | number, payload: TUpdateRequest): Promise<TCreateResponse> {
    const response: AxiosResponse<TCreateResponse> = await this.axiosInstance.put(`/${id}`, payload);
    return response.data;
  }

  async delete(id: string | number): Promise<void> {
    await this.axiosInstance.delete(`/${id}`);
  }

  async customGet<TCustomResponse>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<TCustomResponse> {
    const response: AxiosResponse<TCustomResponse> = await this.axiosInstance.get(path, config);
    return response.data;
  }

  async customPost<TCustomResponse, TData = unknown>(
    path: string,
    data?: TData,
    config?: AxiosRequestConfig
  ): Promise<TCustomResponse> {
    const response: AxiosResponse<TCustomResponse> = await this.axiosInstance.post(path, data, config);
    return response.data;
  }

  async customPut<TCustomResponse, TData = unknown>(
    path: string,
    data?: TData,
    config?: AxiosRequestConfig
  ): Promise<TCustomResponse> {
    const response: AxiosResponse<TCustomResponse> = await this.axiosInstance.put(path, data, config);
    return response.data;
  }

  async customDelete<TCustomResponse>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<TCustomResponse> {
    const response: AxiosResponse<TCustomResponse> = await this.axiosInstance.delete(path, config);
    return response.data;
  }
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  search?: string;
}

export interface AdditionalParams {
  [key: string]: string | number | boolean | undefined;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { empty: boolean; sorted: boolean; unsorted: boolean };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: { empty: boolean; sorted: boolean; unsorted: boolean };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface SortConfig {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableConfig {
  pageNumber: number;
  pageSize: number;
  sort: SortConfig;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}