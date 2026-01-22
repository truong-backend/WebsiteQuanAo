// src/api/BaseApi/baseApi.ts
import axios from "axios";
import type { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";

/**
 * Base API class for RESTful resources
 * Provides common CRUD operations with proper typing
 * 
 * @template T - Main entity type
 * @template TRequest - Request DTO type (for create/update)
 * @template TResponse - Response DTO type (for read operations)
 * @template TCreateResponse - Create response type (default: TResponse)
 */
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

    // Optional: Add request interceptor for auth
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Get paginated list of resources
   * @param page - Page number (0-indexed)
   * @param size - Items per page
   * @param search - Search term
   * @param sortBy - Field to sort by
   * @param sortDir - Sort direction (asc/desc)
   * @param additionalParams - Additional query parameters
   * @returns Paginated response
   * 
   * Endpoint: GET /
   * RESTful Convention: GET /resources with query params
   */
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

    // Only add params if they have values
    if (search) {
      params.search = search;
    }

    if (sortBy) {
      params.sortBy = sortBy;
    }

    // Add any additional params (e.g., parentId for categories)
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = String(value);
        }
      });
    }

    const response: AxiosResponse<TPageResponse> = await this.axiosInstance.get(
      "",
      { params }
    );
    return response.data;
  }

  /**
   * Get single resource by ID
   * @param id - Resource ID
   * @returns Resource data
   * 
   * Endpoint: GET /{id}
   */
  async getById(id: number | string): Promise<TResponse> {
    const response: AxiosResponse<TResponse> = await this.axiosInstance.get(
      `/${id}`
    );
    return response.data;
  }

  /**
   * Create a new resource
   * @param payload - Resource creation data
   * @returns Created resource data
   * 
   * Endpoint: POST /
   * RESTful Convention: POST /resources (not /save)
   */
  async create(payload: TCreateRequest): Promise<TCreateResponse> {
    const response: AxiosResponse<TCreateResponse> =
      await this.axiosInstance.post("", payload);
    return response.data;
  }

  /**
   * Update an existing resource
   * @param id - Resource ID to update
   * @param payload - Updated resource data
   * @returns Updated resource data
   * 
   * Endpoint: PUT /{id}
   * RESTful Convention: PUT /resources/{id} (not /update/{id})
   */
  async update(id: string | number, payload: TUpdateRequest): Promise<TCreateResponse> {
    const response: AxiosResponse<TCreateResponse> =
      await this.axiosInstance.put(`/${id}`, payload);
    return response.data;
  }

  /**
   * Delete a resource
   * @param id - Resource ID to delete
   * @returns True if deletion successful
   * 
   * Endpoint: DELETE /{id}
   * RESTful Convention: DELETE /resources/{id} (not /delete/{id})
   */
  async delete(id: string | number): Promise<void> {
  await this.axiosInstance.delete(`/${id}`);
}

  /**
   * Custom GET endpoint call
   * Useful for non-standard endpoints like /tree, /options, etc.
   * @param path - Endpoint path (e.g., "/tree", "/options/root")
   * @param config - Axios request config
   * @returns Response data
   */
  async customGet<TCustomResponse>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<TCustomResponse> {
    const response: AxiosResponse<TCustomResponse> =
      await this.axiosInstance.get(path, config);
    return response.data;
  }

  /**
   * Custom POST endpoint call
   * @param path - Endpoint path
   * @param data - Request body
   * @param config - Axios request config
   * @returns Response data
   */
  async customPost<TCustomResponse, TData = unknown>(
    path: string,
    data?: TData,
    config?: AxiosRequestConfig
  ): Promise<TCustomResponse> {
    const response: AxiosResponse<TCustomResponse> =
      await this.axiosInstance.post(path, data, config);
    return response.data;
  }

  /**
   * Custom PUT endpoint call
   * @param path - Endpoint path
   * @param data - Request body
   * @param config - Axios request config
   * @returns Response data
   */
  async customPut<TCustomResponse, TData = unknown>(
    path: string,
    data?: TData,
    config?: AxiosRequestConfig
  ): Promise<TCustomResponse> {
    const response: AxiosResponse<TCustomResponse> =
      await this.axiosInstance.put(path, data, config);
    return response.data;
  }

  /**
   * Custom DELETE endpoint call
   * @param path - Endpoint path
   * @param config - Axios request config
   * @returns Response data
   */
  async customDelete<TCustomResponse>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<TCustomResponse> {
    const response: AxiosResponse<TCustomResponse> =
      await this.axiosInstance.delete(path, config);
    return response.data;
  }
}

/**
 * Type helper for pagination params
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  search?: string;
}

/**
 * Type helper for additional filter params
 */
export interface AdditionalParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Type helper for paginated response (matches Spring Boot Page)
 */
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

/**
 * Type helper for sort configuration
 */
export interface SortConfig {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

/**
 * Type helper for pageable configuration
 */
export interface PageableConfig {
  pageNumber: number;
  pageSize: number;
  sort: SortConfig;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}