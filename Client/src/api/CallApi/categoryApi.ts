import { BaseApi } from "../BaseApi/baseApi";
import type {CategoryResponse} from "../../type/categotry/CategoryResponse";
import type { CategoryCreateAndUpdateRequest } from "../../type/categotry/CategoryCreateAndUpdateRequest";
// import type { CategoryHeader } from "../../type/categotry/CategoryHeader";
import type { CategoryOption } from "../../type/categotry/CategoryOption";
import type { PageResponse } from "../../api/BaseApi/baseApi";
/**
 * API client for Category resource
 * Base endpoint: /categories
 * Extends BaseApi with category-specific methods
 * 
 * Generic Type Parameters:
 * - CategoryResponse: Main entity type (used in lists)
 * - CategoryRequest: Request DTO (for create/update input)
 * - CategoryRequest: Response from getById (for editing forms)
 * - CategoryHeader: Response from create/update (includes children)
 */
class CategoryApi extends BaseApi<
  CategoryResponse,     // T - Main entity type
  CategoryCreateAndUpdateRequest      // TRequest - Create/Update input DTO
  // CategoryRequest,       // TResponse - Get by ID returns CategoryRequest (for editing)
  // CategoryHeader         // TCreateResponse - Create/Update returns CategoryHeader (with children)
> {
  constructor() {
    super("categories");
  }

  /**
   * Get all categories with pagination, search, and filtering
   * @param page - Page number (0-indexed)
   * @param size - Items per page
   * @param search - Search term for category name
   * @param sortBy - Field to sort by
   * @param sortDir - Sort direction
   * @param parentId - Filter by parent category ID
   * @returns Paginated category response
   * 
   * Endpoint: GET /categories?page=0&size=10&search=...&parentId=...
   * Matches: getAllCategories() in CategoryController
   */
  async getAllCategories(
    page = 0,
    size = 10,
    search?: string,
    sortBy = "categoryId",
    sortDir: "asc" | "desc" = "asc",
    parentId?: number
  ): Promise<PageResponse<CategoryResponse>> {
    // Use BaseApi.getAll with additionalParams for parentId
    return this.getAll<PageResponse<CategoryResponse>>(
      page,
      size,
      search,
      sortBy,
      sortDir,
      parentId !== undefined ? { parentId } : undefined
    );
  }

  /**
   * Get category by ID
   * Returns CategoryRequest (suitable for editing forms)
   * @param categoryId - Category ID
   * @returns Category request DTO
   * 
   * Endpoint: GET /categories/{id}
   * Matches: getCategoryById() in CategoryController
   */
  async getCategoryById(categoryId: number): Promise<CategoryResponse> {
    return this.getById(categoryId);
  }

  /**
   * Get category tree (root categories with nested children)
   * @returns Array of root categories with children
   * 
   * Endpoint: GET /categories/tree
   * Matches: getCategoryTree() in CategoryController
   */
  // async getCategoryTree(): Promise<CategoryHeader[]> {
  //   return this.customGet<CategoryHeader[]>("/tree");
  // }

  /**
   * Create a new category
   * @param payload - Category creation data
   * @returns Created category with children structure
   * 
   * Endpoint: POST /categories
   * Matches: createCategory() in CategoryController
   */
  async createCategory(payload: CategoryCreateAndUpdateRequest): Promise<CategoryResponse> {
    return this.create(payload);
  }

  /**
   * Update an existing category
   * @param id - Category ID to update
   * @param payload - Updated category data
   * @returns Updated category with children structure
   * 
   * Endpoint: PUT /categories/{id}
   * Matches: updateCategory() in CategoryController
   */
  async updateCategory(
    id: number,
    payload: CategoryCreateAndUpdateRequest
  ): Promise<CategoryResponse> {
    return this.update(id, payload);
  }

  /**
   * Delete a category
   * @param id - Category ID to delete
   * @returns True if deletion successful
   * 
   * Endpoint: DELETE /categories/{id}
   * Matches: deleteCategory() in CategoryController
   */
  async deleteCategory(id: number): Promise<void> {
  await this.delete(id);
}


  /**
   * Get all categories as simple options (id and name only)
   * Used for dropdowns and select inputs
   * @returns Array of category options
   * 
   * Endpoint: GET /categories/options
   * Matches: getAllCategoryOptions() in CategoryController
   */
  async getAllCategoryOptions(): Promise<CategoryOption[]> {
    return this.customGet<CategoryOption[]>("/options");
  }

  /**
   * Get root categories as simple options (id and name only)
   * Used for parent category selection
   * @returns Array of root category options
   * 
   * Endpoint: GET /categories/options/root
   * Matches: getRootCategoryOptions() in CategoryController
   */
  async getRootCategoryOptions(): Promise<CategoryOption[]> {
    return this.customGet<CategoryOption[]>("/options/root");
  }
}

export const categoryApi = new CategoryApi();