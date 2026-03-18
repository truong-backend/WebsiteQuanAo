// src/Components/Admin/common/DynamicForm/DynamicForm.tsx
import { useEffect, useRef, useState } from 'react';
import styles from './DynamicForm.module.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string | number;
  label: string | number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface FormField<T extends Record<string, unknown>> {
  name:          keyof T;
  label:         string;
  type:          'text' | 'select' | 'number' | 'email' | 'textarea' | 'password' | 'image' | 'datetime-local';
  placeholder?:  string;
  required?:     boolean;
  options?:      SelectOption[];
  loadOptions?:  () => Promise<SelectOption[]>;
  optionValue?:  string;
  optionLabel?:  string;
  disabled?:     boolean;
  maxLength?:    number;
  defaultValue?: string | number | boolean | null;
}

interface DynamicFormProps<T extends Record<string, unknown>> {
  fields:            FormField<T>[];
  onSubmit:          (data: T) => Promise<void>;
  submitButtonText?: string;
  loadingText?:      string;
  onSuccess?:        () => void;
  successMessage?:   string;
  mode?:             'create' | 'update';
  initialData?:      T;
  loadData?:         () => Promise<T>;
}

// ─── Toast (replaces antd message) ───────────────────────────────────────────

let toastTimer: ReturnType<typeof setTimeout>;
let setGlobalToast: ((t: { msg: string; type: 'success' | 'error' | 'info' } | null) => void) | null = null;

const toast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
  setGlobalToast?.({ msg, type });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => setGlobalToast?.(null), 3000);
};

// ─── Component ────────────────────────────────────────────────────────────────

function DynamicForm<T extends Record<string, unknown>>({
  fields, onSubmit,
  submitButtonText, loadingText = 'Đang lưu...',
  onSuccess, successMessage = 'Lưu thành công',
  mode = 'create', initialData, loadData,
}: DynamicFormProps<T>) {
  // values: store all field values
  const [values, setValues]           = useState<Record<string, unknown>>({});
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [selectOpts, setSelectOpts]   = useState<Record<string, SelectOption[]>>({});
  const [loading, setLoading]         = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [showPw, setShowPw]           = useState<Record<string, boolean>>({});
  const [imgPreviews, setImgPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading]     = useState<Record<string, boolean>>({});
  const [toastState, setToastState]   = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  setGlobalToast = setToastState;

  const finalSubmitText = submitButtonText ?? (mode === 'update' ? 'Cập nhật' : 'Lưu');

  // Init default values
  useEffect(() => {
    const defaults: Record<string, unknown> = {};
    fields.forEach((f) => { if (f.defaultValue !== undefined) defaults[f.name as string] = f.defaultValue; });
    setValues(defaults);
  }, []);

  // Load update data
  useEffect(() => {
    if (mode !== 'update') return;
    (async () => {
      setLoadingData(true);
      try {
        const data = loadData ? await loadData() : initialData;
        if (!data) return;
        const v: Record<string, unknown> = {};
        fields.forEach((f) => { v[f.name as string] = (data as Record<string, unknown>)[f.name as string] ?? ''; });
        setValues(v);
        // Set image previews
        const previews: Record<string, string> = {};
        fields.forEach((f) => {
          if (f.type === 'image' && (data as Record<string, unknown>)[f.name as string]) {
            previews[f.name as string] = (data as Record<string, unknown>)[f.name as string] as string;
          }
        });
        setImgPreviews(previews);
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Không thể load dữ liệu', 'error');
      } finally { setLoadingData(false); }
    })();
  }, [mode, initialData, loadData]);

  // Load select options
  useEffect(() => {
    fields.forEach((f) => {
      if (f.type === 'select' && f.loadOptions) {
        f.loadOptions()
          .then((data) => setSelectOpts((prev) => ({ ...prev, [f.name as string]: data })))
          .catch((err) => toast(err instanceof Error ? err.message : 'Có lỗi xảy ra', 'error'));
      }
    });
  }, [fields]);

  const set = (name: string, val: unknown) => {
    setValues((prev) => ({ ...prev, [name]: val }));
    setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required) {
        const v = values[f.name as string];
        if (v === undefined || v === null || v === '') {
          errs[f.name as string] = `Vui lòng nhập ${f.label.toLowerCase()}`;
        }
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const transformed: Record<string, unknown> = {};
      fields.forEach((f) => {
        const v = values[f.name as string];
        transformed[f.name as string] = f.type === 'number' ? (v ? Number(v) : null) : (v ?? null);
      });
      await onSubmit(transformed as T);
      onSuccess?.();
      toast(successMessage, 'success');
      if (mode === 'create') {
        const defaults: Record<string, unknown> = {};
        fields.forEach((f) => { if (f.defaultValue !== undefined) defaults[f.name as string] = f.defaultValue; else defaults[f.name as string] = ''; });
        setValues(defaults);
        setImgPreviews({});
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Có lỗi xảy ra', 'error');
    } finally { setLoading(false); }
  };

  // Image upload
  const handleImageChange = async (fieldName: string, file: File) => {
    setUploading((prev) => ({ ...prev, [fieldName]: true }));
    try {
      const form = new FormData();
      form.append('file', file);
      const res  = await fetch('http://localhost:8080/uploads/image', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload thất bại');
      const data = await res.json();
      const url  = data?.url as string;
      set(fieldName, url);
      setImgPreviews((prev) => ({ ...prev, [fieldName]: url }));
      toast('Upload ảnh thành công', 'success');
    } catch {
      toast('Upload ảnh thất bại', 'error');
    } finally { setUploading((prev) => ({ ...prev, [fieldName]: false })); }
  };

  const handleRemoveImage = async (fieldName: string) => {
    const url = values[fieldName] as string;
    if (url) {
      try {
        const fileName = url.split('/').pop();
        if (fileName) await fetch(`http://localhost:8080/uploads/images?fileName=${encodeURIComponent(fileName)}`, { method: 'DELETE' });
      } catch {}
    }
    set(fieldName, null);
    setImgPreviews((prev) => { const n = { ...prev }; delete n[fieldName]; return n; });
  };

  // ── Render each field ──────────────────────────────────────────────────────

  const renderField = (field: FormField<T>) => {
    const name     = field.name as string;
    const value    = values[name] ?? '';
    const disabled = field.disabled || loadingData || loading;
    const err      = errors[name];

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            className={styles.textarea}
            value={value as string}
            onChange={(e) => set(name, e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            maxLength={field.maxLength}
            rows={4}
          />
        );

      case 'select': {
        const opts = (field.options ?? selectOpts[name] ?? []);
        return (
          <select
            className={styles.select}
            value={value as string}
            onChange={(e) => set(name, e.target.value)}
            disabled={disabled}
          >
            <option value="">{field.placeholder ?? '— Chọn —'}</option>
            {opts.map((o, i) => {
              const v = field.optionValue ? o[field.optionValue] : o.value;
              const l = field.optionLabel ? o[field.optionLabel] : o.label;
              return <option key={i} value={v as string | number}>{l as string}</option>;
            })}
          </select>
        );
      }

      case 'password':
        return (
          <div className={styles.passwordWrap}>
            <input
              type={showPw[name] ? 'text' : 'password'}
              value={value as string}
              onChange={(e) => set(name, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
            />
            <button type="button" className={styles.passwordToggle} onClick={() => setShowPw((prev) => ({ ...prev, [name]: !prev[name] }))}>
              {showPw[name] ? '🙈' : '👁'}
            </button>
          </div>
        );

      case 'image': {
        const preview = imgPreviews[name];
        const isUp    = uploading[name];
        return (
          <div>
            {preview ? (
              <div className={styles.previewWrap}>
                <img className={styles.previewImg} src={preview} alt="preview" />
                <button type="button" className={styles.removeImg} onClick={() => handleRemoveImage(name)} disabled={disabled}>×</button>
              </div>
            ) : (
              <label className={`${styles.uploadArea} ${isUp ? '' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  className={styles.uploadInput}
                  disabled={disabled || isUp}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageChange(name, f); e.target.value = ''; }}
                />
                {isUp ? (
                  <div className={styles.uploadProgress}>
                    <div className={styles.uploadSpinner} />
                    <span>Đang upload...</span>
                  </div>
                ) : (
                  <>
                    <div className={styles.uploadIcon}>📷</div>
                    <div className={styles.uploadText}>Nhấn để chọn ảnh</div>
                    <div className={styles.uploadHint}>PNG, JPG, WEBP — tối đa 5MB</div>
                  </>
                )}
              </label>
            )}
          </div>
        );
      }

      default: {
        const typeMap: Record<string, string> = { number: 'number', email: 'email', 'datetime-local': 'datetime-local', text: 'text' };
        return (
          <input
            className={styles.input}
            type={typeMap[field.type] ?? 'text'}
            value={value as string}
            onChange={(e) => set(name, e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            maxLength={field.maxLength}
          />
        );
      }
    }
  };

  // ── Loading data state ─────────────────────────────────────────────────────

  if (loadingData) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Toast */}
      {toastState && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toastState.type === 'success' ? '#22c55e' : toastState.type === 'error' ? '#ef4444' : '#374151',
          color: '#fff', borderRadius: 10, padding: '12px 20px',
          fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.2s ease',
        }}>
          {toastState.msg}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {fields.map((field) => (
          <div key={field.name as string} className={styles.field}>
            <label className={styles.label}>
              {field.label}
              {field.required && <span className={styles.label__required}>*</span>}
            </label>
            {renderField(field)}
            {errors[field.name as string] && (
              <span className={styles.fieldError}>⚠ {errors[field.name as string]}</span>
            )}
          </div>
        ))}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? (
            <><div className={styles.btnSpinner} />{loadingText}</>
          ) : finalSubmitText}
        </button>
      </form>

      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }`}</style>
    </>
  );
}

export default DynamicForm;