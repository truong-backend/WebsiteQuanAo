// src/components/admin/index.ts
// Barrel export — import từ 1 chỗ duy nhất:
//   import { DynamicList, DynamicForm, AdminModal, AdminPageState, AdminLayout } from '@/components/admin'
export { default as AdminLayout } from "../../layouts/admin/AdminLayout.tsx";
export { default as AdminModal } from "./ui/AdminModal.tsx";
export { default as AdminPageState } from "../../layouts/admin/AdminPageState.tsx";
export { default as DynamicForm } from "./Dynamic/DynamicForm.tsx";
export { default as DynamicList } from "./Dynamic/DynamicList.tsx";
export type { FormField, SelectOption } from "./Dynamic/DynamicForm.tsx";
export type { Column, Action, DynamicListProps } from "./Dynamic/DynamicList.tsx";
