// src/Components/Admin/common/DynamicForm/DynamicForm.tsx
import { useEffect, useState } from 'react';
import { Form, Input, Select, Button, message, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import styles from './DynamicForm.module.scss';

const { TextArea } = Input;

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
  uploadType?:   string;
  maxLength?:    number;
  defaultValue?: string | number | boolean | null;
}

interface DynamicFormProps<T extends Record<string, unknown>> {
  fields:             FormField<T>[];
  onSubmit:           (data: T) => Promise<void>;
  submitButtonText?:  string;
  loadingText?:       string;
  onSuccess?:         () => void;
  successMessage?:    string;
  mode?:              'create' | 'update';
  initialData?:       T;
  loadData?:          () => Promise<T>;
}

function DynamicForm<T extends Record<string, unknown>>({
  fields, onSubmit,
  submitButtonText, loadingText = 'Đang lưu...',
  onSuccess, successMessage = 'Lưu thành công',
  mode = 'create', initialData, loadData,
}: DynamicFormProps<T>) {
  const [form] = Form.useForm();
  const [selectOptions, setSelectOptions]   = useState<Record<string, SelectOption[]>>({});
  const [loading, setLoading]               = useState(false);
  const [loadingData, setLoadingData]       = useState(false);
  const [fileList, setFileList]             = useState<Record<string, UploadFile[]>>({});

  const finalSubmitText = submitButtonText ?? (mode === 'update' ? 'Cập nhật' : 'Lưu');

  const getFileNameFromUrl = (url: string) => {
    try { return url.split('/').pop() ?? ''; }
    catch { return ''; }
  };

  const deleteImageOnServer = async (imageUrl: string) => {
    try {
      const fileName = getFileNameFromUrl(imageUrl);
      if (!fileName) return false;
      const res = await fetch(`http://localhost:8080/uploads/images?fileName=${encodeURIComponent(fileName)}`, { method: 'DELETE' });
      return res.ok;
    } catch { return false; }
  };

  // Load data for update mode
  useEffect(() => {
    if (mode !== 'update') return;
    (async () => {
      setLoadingData(true);
      try {
        const data = loadData ? await loadData() : initialData;
        if (!data) return;
        form.setFieldsValue(data);
        const fl: Record<string, UploadFile[]> = {};
        fields.forEach((f) => {
          if (f.type === 'image' && data[f.name]) {
            const url = data[f.name] as string;
            fl[f.name as string] = [{ uid: '-1', name: getFileNameFromUrl(url) || 'image.png', status: 'done', url }];
          }
        });
        setFileList(fl);
      } catch (err) {
        message.error(err instanceof Error ? err.message : 'Không thể load dữ liệu');
      } finally { setLoadingData(false); }
    })();
  }, [mode, initialData, loadData]);

  // Load select options
  useEffect(() => {
    fields.forEach((f) => {
      if (f.type === 'select' && f.loadOptions) {
        f.loadOptions()
          .then((data) => setSelectOptions((prev) => ({ ...prev, [f.name as string]: data })))
          .catch((err) => message.error(err instanceof Error ? err.message : 'Có lỗi xảy ra'));
      }
    });
  }, [fields]);

  const handleSubmit = async (values: T) => {
    setLoading(true);
    try {
      const transformed: Record<string, unknown> = {};
      fields.forEach((f) => {
        const v = values[f.name];
        transformed[f.name as string] = f.type === 'number' ? (v ? Number(v) : null) : (v ?? null);
      });
      await onSubmit(transformed as T);
      onSuccess?.();
      message.success(successMessage);
      if (mode === 'create') { form.resetFields(); setFileList({}); }
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally { setLoading(false); }
  };

  const renderField = (field: FormField<T>) => {
    switch (field.type) {
      case 'select': {
        const opts = (field.options ?? selectOptions[field.name as string] ?? []).map((o) => ({
          value: (field.optionValue ? o[field.optionValue] : o.value) as string | number,
          label: field.optionLabel ? o[field.optionLabel] : o.label,
        }));
        return <Select placeholder={field.placeholder ?? 'Chọn'} disabled={field.disabled || loadingData} options={opts} allowClear />;
      }
      case 'textarea':
        return <TextArea placeholder={field.placeholder} disabled={field.disabled || loadingData} maxLength={field.maxLength} rows={4} />;
      case 'number':
        return <Input type="number" placeholder={field.placeholder} disabled={field.disabled || loadingData} />;
      case 'email':
        return <Input type="email" placeholder={field.placeholder} disabled={field.disabled || loadingData} />;
      case 'password':
        return <Input.Password placeholder={field.placeholder} disabled={field.disabled || loadingData} />;
      case 'datetime-local':
        return <Input type="datetime-local" placeholder={field.placeholder} disabled={field.disabled || loadingData} />;
      case 'image': {
        const key = field.name as string;
        const fl  = fileList[key] ?? [];
        return (
          <>
            <Upload
              name="file"
              action="http://localhost:8080/uploads/image"
              listType="picture-card"
              maxCount={1}
              accept="image/*"
              fileList={fl}
              onChange={(info) => {
                setFileList((prev) => ({ ...prev, [key]: info.fileList }));
                if (info.file.status === 'done') {
                  const url = info.file.response?.url;
                  if (url) { form.setFieldValue(key, url); message.success('Upload ảnh thành công'); }
                } else if (info.file.status === 'error') {
                  message.error('Upload ảnh thất bại');
                }
              }}
              onRemove={async (file) => {
                const url = file.url ?? form.getFieldValue(key);
                if (url) {
                  const ok = await deleteImageOnServer(url);
                  message.info(ok ? 'Đã xóa ảnh' : 'Đã xóa khỏi form (không xóa được file trên server)');
                }
                form.setFieldValue(key, null);
                setFileList((prev) => ({ ...prev, [key]: [] }));
                return true;
              }}
            >
              {fl.length === 0 && <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
            </Upload>
            <Form.Item name={key} hidden><Input /></Form.Item>
          </>
        );
      }
      default:
        return <Input type="text" placeholder={field.placeholder} disabled={field.disabled || loadingData} maxLength={field.maxLength} />;
    }
  };

  if (loadingData) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className={styles.formWrap}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={loading || loadingData}
        initialValues={Object.fromEntries(fields.filter((f) => f.defaultValue !== undefined).map((f) => [f.name, f.defaultValue]))}
      >
        {fields.map((field) => (
          <Form.Item
            key={field.name as string}
            name={field.name as string}
            label={field.label}
            rules={[{ required: field.required, message: `Vui lòng nhập ${field.label.toLowerCase()}` }]}
          >
            {renderField(field)}
          </Form.Item>
        ))}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {loading ? loadingText : finalSubmitText}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default DynamicForm;