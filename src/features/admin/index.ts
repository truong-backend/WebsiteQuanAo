// src/features/admin/index.ts
export { ColorService }           from './services/colorService';
export { SizeService }            from './services/sizeService';
export { ContactService }         from './services/contactService';
export { ProductVariantService }  from './services/productVariantService';
export { UploadService }          from './services/uploadService';

export type {
  ColorResponse, ColorCreateRequest, ColorUpdateRequest, ColorOption,
  ColorResponsePageResponse,
}                                 from './types/color.types';
export type {
  SizesResponse, SizeCreateRequest, SizeUpdateRequest, SizeOption,
  SizeResponsePageResponse,
}                                 from './types/size.types';
export type {
  ContactResponse, ContactCreateRequest,
  ContactStatusUpdateRequest, ContactReplyRequest,
}                                 from './types/contact.types';
export {
  ContactStatusLabels,
  ContactStatusColors,
}                                 from './types/contact.types';
export type { ContactStatus }     from './types/contact.types';
export type {
  ProductVariantResponse,
  ProductVariantCreateRequest,
  ProductVariantUpdateRequest,
  ProductVariantResponsePageResponse,
}                                 from './types/productVariant.types';

export { default as AccountPage }        from './components/AccountPage';
export { default as CategoryPage }       from './components/CategoryPage';
export { default as ColorPage }          from './components/ColorPage';
export { default as SizePage }           from './components/SizePage';
export { default as ProductPage }        from './components/ProductPage';
export { default as ProductVariantPage } from './components/ProductVariantPage';
export { default as OrderPage }          from './components/OrderPage';
export { default as ContactPage }        from './components/ContactPage';
