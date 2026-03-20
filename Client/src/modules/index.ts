// ─────────────────────────────────────────────────────────────
//  modules/index.ts
//  Import mọi thứ từ 1 chỗ duy nhất:
//    import { AuthService, ProductService, OrderService } from "@/modules";
// ─────────────────────────────────────────────────────────────

export { authService }                           from "./auth/auth.module";

export { AccountService }                        from "./account/account.module";

export { CategoryService }                       from "./category/category.module";
export type { NavbarCategory }                   from "./category/category.module";

export { ColorService }                          from "./color/color.module";

export { SizeService }                           from "./size/size.module";

export { ProductService }                        from "./product/product.module";

export { ProductVariantService }                 from "./productVariant/productVariant.module";

export { LocalCartService, ServerCartService, CartItemService } from "./cart/cart.module";
export type { CartItem }                         from "./cart/cart.module";

export { OrderService, OrderItemService }        from "./order/order.module";

export { PaymentService, PaymentGatewayService } from "./payment/payment.module";

export { UploadService }                         from "./upload/upload.module";