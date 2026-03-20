// src/components/admin/index.ts
// Barrel export — import từ 1 chỗ duy nhất:
//   import { DynamicList, DynamicForm, AdminModal, AdminPageState, AdminLayout } from '@/components/admin'
export { default as AdminLayout }    from './AdminLayout.tsx';
export { default as AdminModal }     from './AdminModal';
export { default as AdminPageState } from './AdminPageState';
export { default as DynamicForm }    from './DynamicForm';
export { default as DynamicList }    from './DynamicList';
export type { FormField, SelectOption }      from './DynamicForm';
export type { Column, Action, DynamicListProps } from './DynamicList';