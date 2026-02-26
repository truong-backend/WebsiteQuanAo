import { useEffect, useState } from "react";
import { Form, Input, Select, Button, message } from "antd";
import { Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";

const { TextArea } = Input;

export interface SelectOption {
  value: string | number;
  label: string | number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface FormField<T extends Record<string, unknown>> {
  name: keyof T;
  label: string;
  type:
    | "text"
    | "select"
    | "number"
    | "email"
    | "textarea"
    | "password"
    | "image"
    | "datetime-local";
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  loadOptions?: () => Promise<SelectOption[]>;
  optionValue?: string;
  optionLabel?: string;
  disabled?: boolean;
  uploadType?: string;
  maxLength?: number;
  defaultValue?: string | number | boolean | null;
}

interface DynamicFormProps<T extends Record<string, unknown>> {
  fields: FormField<T>[];
  onSubmit: (data: T) => Promise<void>;
  submitButtonText?: string;
  loadingText?: string;
  onSuccess?: () => void;
  successMessage?: string;
  mode?: "create" | "update";
  initialData?: T;
  loadData?: () => Promise<T>;
}

function DynamicForm<T extends Record<string, unknown>>({
  fields,
  onSubmit,
  submitButtonText,
  loadingText = "Đang lưu...",
  onSuccess,
  successMessage = "Lưu thành công",
  mode = "create",
  initialData,
  loadData,
}: DynamicFormProps<T>) {
  const [form] = Form.useForm();
  const [selectOptions, setSelectOptions] = useState<Record<string, SelectOption[]>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [fileList, setFileList] = useState<Record<string, UploadFile[]>>({});

  const defaultSubmitText = mode === "update" ? "Cập nhật" : "Lưu";
  const finalSubmitText = submitButtonText || defaultSubmitText;

  const getFileNameFromUrl = (url: string): string => {
    try {
      const parts = url.split("/");
      return parts[parts.length - 1];
    } catch {
      return "";
    }
  };

  const deleteImageOnServer = async (imageUrl: string): Promise<boolean> => {
    try {
      const fileName = getFileNameFromUrl(imageUrl);
      if (!fileName) {
        console.error("Cannot extract filename from URL");
        return false;
      }
      const response = await fetch(
        `http://localhost:8080/uploads/images?fileName=${encodeURIComponent(fileName)}`,
        { method: "DELETE" },
      );
      if (response.ok) return true;
      console.error("Delete failed:", await response.text());
      return false;
    } catch (error) {
      console.error("Error deleting image:", error);
      return false;
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (mode === "update") {
        setLoadingData(true);
        try {
          let data: T | undefined;
          if (loadData) {
            data = await loadData();
          } else if (initialData) {
            data = initialData;
          }
          if (data) {
            form.setFieldsValue(data);
            const newFileList: Record<string, UploadFile[]> = {};
            fields.forEach((field) => {
              if (field.type === "image" && data![field.name]) {
                const imageUrl = data![field.name] as string;
                newFileList[field.name as string] = [
                  {
                    uid: "-1",
                    name: getFileNameFromUrl(imageUrl) || "image.png",
                    status: "done",
                    url: imageUrl,
                  },
                ];
              }
            });
            setFileList(newFileList);
          }
        } catch (error) {
          message.error(error instanceof Error ? error.message : "Không thể load dữ liệu");
        } finally {
          setLoadingData(false);
        }
      }
    };
    loadInitialData();
  }, [mode, initialData, loadData, form]);

  useEffect(() => {
    fields.forEach((field) => {
      if (field.type === "select" && field.loadOptions) {
        field
          .loadOptions()
          .then((data) => {
            setSelectOptions((prev) => ({ ...prev, [field.name as string]: data }));
          })
          .catch((error) => {
            message.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
          });
      }
    });
  }, [fields]);

  const handleSubmit = async (values: T) => {
    setLoading(true);
    try {
      const transformedData: Record<string, unknown> = {};
      fields.forEach((field) => {
        const value = values[field.name];
        if (field.type === "number") {
          transformedData[field.name as string] = value ? Number(value) : null;
        } else {
          transformedData[field.name as string] = value ?? null;
        }
      });
      await onSubmit(transformedData as T);
      if (onSuccess) onSuccess();
      message.success(successMessage);
      if (mode === "create") {
        form.resetFields();
        setFileList({});
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FormField<T>) => {
    switch (field.type) {
      case "select": {
        const options = field.options || selectOptions[field.name as string] || [];
        const antdOptions = options.map((option) => {
          const optionValue = field.optionValue ? option[field.optionValue] : option.value;
          const optionLabel = field.optionLabel ? option[field.optionLabel] : option.label;
          return { value: optionValue as string | number, label: optionLabel };
        });
        return (
          <Select
            placeholder={field.placeholder || "Chọn"}
            disabled={field.disabled || loadingData}
            options={antdOptions}
            allowClear
          />
        );
      }

      case "textarea": {
        return (
          <TextArea
            placeholder={field.placeholder}
            disabled={field.disabled || loadingData}
            maxLength={field.maxLength}
            rows={4}
          />
        );
      }

      case "number": {
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            disabled={field.disabled || loadingData}
          />
        );
      }

      case "email": {
        return (
          <Input
            type="email"
            placeholder={field.placeholder}
            disabled={field.disabled || loadingData}
          />
        );
      }

      case "password": {
        return (
          <Input.Password
            placeholder={field.placeholder}
            disabled={field.disabled || loadingData}
          />
        );
      }

      case "datetime-local": {
        return (
          <Input
            type="datetime-local"
            placeholder={field.placeholder}
            disabled={field.disabled || loadingData}
          />
        );
      }

      case "image": {
        const fieldName = field.name as string;
        const currentFileList = fileList[fieldName] || [];
        return (
          <>
            <Upload
              name="file"
              action="http://localhost:8080/uploads/image"
              listType="picture-card"
              maxCount={1}
              accept="image/*"
              fileList={currentFileList}
              onChange={(info) => {
                setFileList((prev) => ({ ...prev, [fieldName]: info.fileList }));
                if (info.file.status === "done") {
                  const imageUrl = info.file.response?.url;
                  if (imageUrl) {
                    form.setFieldValue(fieldName, imageUrl);
                    message.success("Upload ảnh thành công");
                  }
                } else if (info.file.status === "error") {
                  message.error("Upload ảnh thất bại");
                }
              }}
              onRemove={async (file) => {
                const imageUrl = file.url || form.getFieldValue(fieldName);
                if (imageUrl) {
                  const deleted = await deleteImageOnServer(imageUrl);
                  if (deleted) {
                    message.success("Đã xóa ảnh");
                  } else {
                    message.warning("Đã xóa ảnh khỏi form (không xóa được file trên server)");
                  }
                }
                form.setFieldValue(fieldName, null);
                setFileList((prev) => ({ ...prev, [fieldName]: [] }));
                return true;
              }}
            >
              {currentFileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <Form.Item name={fieldName} hidden>
              <Input />
            </Form.Item>
          </>
        );
      }

      default: {
        return (
          <Input
            type="text"
            placeholder={field.placeholder}
            disabled={field.disabled || loadingData}
            maxLength={field.maxLength}
          />
        );
      }
    }
  };

  if (loadingData) {
    return (
      <div style={{ textAlign: "center", padding: "16px", color: "#999" }}>
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      disabled={loading || loadingData}
      initialValues={Object.fromEntries(
        fields
          .filter((f) => f.defaultValue !== undefined)
          .map((f) => [f.name, f.defaultValue])
      )}
    >
      {fields.map((field) => (
        <Form.Item
          key={field.name as string}
          name={field.name as string}
          label={field.label}
          rules={[
            {
              required: field.required,
              message: `Vui lòng nhập ${field.label.toLowerCase()}`,
            },
          ]}
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
  );
}

export default DynamicForm;