// ─── Wrapper chung từ ApiResponse<T> của backend ────────────────────────────
export interface ApiResponse<T> {
  success:   boolean
  message:   string
  data:      T
  errors?:   unknown
  timestamp: string
}

export interface PageResponse<T> {
  content:          T[]
  totalElements:    number
  totalPages:       number
  size:             number
  number:           number       // page index (0-based)
  first:            boolean
  last:             boolean
}

// ─── Auth ────────────────────────────────────────────────────────────────────
// BE: AuthResponse.UserInfo { id: Integer, name, email, role: String, avatarUrl, emailVerified }
export interface UserInfo {
  id:            number
  name:          string
  email:         string
  role:          string         // "ROLE_USER" | "ROLE_ADMIN"
  avatarUrl:     string | null
  emailVerified: boolean
}

export interface AuthResponse {
  accessToken:                string
  refreshToken:               string
  tokenType:                  string
  expiresIn:                  number   // giây
  refreshExpiresIn:           number   // giây
  requiresEmailVerification:  boolean
  user:                       UserInfo
}

export interface LoginRequest {
  email:    string
  password: string
}

export interface RegisterRequest {
  name:     string
  email:    string
  password: string
  phone?:   string
}

export interface VerifyEmailRequest {
  email: string
  otp:   string
}

export interface ResendOtpRequest {
  email: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email:       string
  otp:         string
  newPassword: string
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  categoryId:       number
  categoryName:     string
  parentCategory:   Pick<Category, 'categoryId' | 'categoryName'> | null
  childCategories:  Category[]
}

// ─── Product ─────────────────────────────────────────────────────────────────
export interface ProductListDto {
  id:              string
  name:            string
  slug:            string
  basePrice:       number
  salePrice:       number | null
  mainImage:       string
  hoverImage:      string | null
  ratingAvg:       number
  ratingCount:     number
  categoryName:    string
  availableColors: string[]
  availableSizes:  string[]
  inStock:         boolean
}

export interface VariantDto {
  id:        string
  sku:       string
  colorCode: string
  colorName: string
  sizeCode:  string
  quantity:  number
  imageUrl:  string | null
  inStock:   boolean
}

export interface CategoryInfo {
  id:   number
  name: string
  slug: string
}

export interface ProductDetailDto {
  id:             string
  name:           string
  slug:           string
  description:    string | null
  basePrice:      number
  salePrice:      number | null
  effectivePrice: number
  mainImage:      string
  hoverImage:     string | null
  ratingAvg:      number
  ratingCount:    number
  active:         boolean
  category:       CategoryInfo
  variants:       VariantDto[]
  createdAt:      string
}

export interface ProductFilterDto {
  page?:       number
  size?:       number
  search?:     string
  categoryId?: number
  minPrice?:   number
  maxPrice?:   number
  colorCode?:  string
  sizeCode?:   string
  sortBy?:     'createdAt' | 'basePrice' | 'name' | 'id'
  sortDir?:    'asc' | 'desc'
}

// Admin create — matches BE ProductCreateRequest
export interface ProductCreateRequest {
  name:         string
  slug:         string
  description?: string
  basePrice:    number
  salePrice?:   number | null
  mainImage:    string
  hoverImage?:  string
  categoryId:   number
}

// Admin update — matches BE ProductUpdateRequest
export interface ProductUpdateRequest {
  name:         string
  slug:         string
  description?: string
  basePrice:    number
  salePrice?:   number | null
  mainImage:    string
  hoverImage?:  string
  categoryId:   number
  active?:      boolean
}

// ─── Variant (full DTO from VariantController) ───────────────────────────────
export interface VariantFullDto {
  id:          string
  sku:         string
  productId:   string
  productName: string
  colorId:     number
  colorCode:   string
  colorName:   string
  sizeId:      number
  sizeCode:    string
  sizeName:    string
  quantity:    number
  inStock:     boolean
  imageUrl:    string | null
}

// BE ProductVariantCreateRequest — uses colorId/sizeId (NOT colorCode/colorName)
export interface VariantCreateRequest {
  sku:       string
  colorId:   number
  sizeId:    number
  quantity:  number
  imageUrl?: string
}

// BE ProductVariantUpdateRequest
export interface VariantUpdateRequest {
  colorId:   number
  sizeId:    number
  quantity:  number
  imageUrl?: string
}

// ─── Color (NEW in BE) ───────────────────────────────────────────────────────
export interface ColorDto {
  id:        number
  code:      string
  name:      string
  nameEn:    string | null
  active:    boolean
  createdAt: string
}

export interface ColorRequest {
  code:    string
  name:    string
  nameEn?: string
  active?: boolean
}

// ─── Size (NEW in BE) ────────────────────────────────────────────────────────
export interface SizeDto {
  id:        number
  code:      string
  name:      string
  sortOrder: number
  active:    boolean
  createdAt: string
}

export interface SizeRequest {
  code:      string
  name:      string
  sortOrder: number
  active?:   boolean
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItemDto {
  cartItemId:    number
  variantId:     string
  sku:           string
  productId:     string
  productName:   string
  productSlug:   string
  colorCode:     string
  colorName:     string
  sizeCode:      string
  imageUrl:      string | null
  unitPrice:     number
  quantity:      number
  stockQuantity: number
  lineTotal:     number
}

export interface CartDto {
  cartId:     number
  totalItems: number
  subtotal:   number
  items:      CartItemDto[]
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentMethod = 'COD' | 'VNPAY'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface OrderItemDto {
  id:          string
  variantId:   string
  productName: string
  variantInfo: string
  imageUrl:    string | null
  unitPrice:   number
  quantity:    number
  lineTotal:   number
}

export interface PaymentInfo {
  id:            string
  method:        PaymentMethod
  status:        PaymentStatus
  amount:        number
  transactionId: string | null
  payTime:       string | null
}

export interface OrderUserInfo {
  id:    number
  name:  string
  email: string
}

export interface OrderDto {
  id:              string
  user:            OrderUserInfo
  phoneNumber:     string
  shippingAddress: string
  note:            string | null
  subtotal:        number
  shippingFee:     number
  discountAmount:  number
  totalAmount:     number
  status:          OrderStatus
  orderTime:       string
  items:           OrderItemDto[]
  payment:         PaymentInfo | null
}

export interface CreateOrderRequest {
  phoneNumber:     string
  shippingAddress: string
  note?:           string
  paymentMethod:   PaymentMethod
  items: {
    variantId: string
    quantity:  number
  }[]
  clearCart?: boolean
}

// ─── Payment (NEW in BE) ─────────────────────────────────────────────────────
export interface PaymentDto {
  id:            string
  orderId:       string
  method:        PaymentMethod
  status:        PaymentStatus
  amount:        number
  transactionId: string | null
  payTime:       string | null
  createdAt:     string
}

export interface VNPayCreateResponse {
  paymentId:  string
  orderId:    string
  paymentUrl: string
  method:     string
}

// ─── Review ──────────────────────────────────────────────────────────────────
export interface ReviewDto {
  id:         number
  productId:  string
  userId:     number
  userName:   string
  userAvatar: string | null
  orderId:    string | null
  rating:     number
  comment:    string | null
  createdAt:  string
}

export interface CreateReviewRequest {
  rating:    number
  comment?:  string
  orderId?:  string
}
// ─── User Management ─────────────────────────────────────────────────────────
export interface UserDto {
  id:            number
  name:          string
  email:         string
  phone:         string | null
  avatarUrl:     string | null
  role:          string          // "ROLE_USER" | "ROLE_ADMIN"
  enabled:       boolean
  emailVerified: boolean
  createdAt:     string
  updatedAt:     string
}

export interface UpdateProfileRequest {
  name:       string
  phone?:     string
  avatarUrl?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword:     string
}

export interface AdminUpdateUserRequest {
  name:       string
  phone?:     string
  avatarUrl?: string
}

export interface UserFilterDto {
  page?:    number
  size?:    number
  search?:  string
  role?:    string
  enabled?: boolean
  sortBy?:  string
  sortDir?: string
}