import { useEffect, useState } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface FormField<T extends Record<string, unknown>> {
  name: keyof T;
  label: string;
  type: "text" | "select" | "number" | "email" | "textarea" | "password";
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[];
  loadOptions?: () => Promise<SelectOption[]>;
  optionValue?: string;
  optionLabel?: string;
  disabled?: boolean;
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
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectOptions, setSelectOptions] = useState<
    Record<string, SelectOption[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const defaultSubmitText = mode === "update" ? "Cập nhật" : "Lưu";
  const finalSubmitText = submitButtonText || defaultSubmitText;

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
            const stringData: Record<string, string> = {};
            Object.keys(data).forEach((key) => {
              const value = data[key];
              stringData[key] = value !== null && value !== undefined ? String(value) : "";
            });
            setFormData(stringData);
          }
        } catch (error) {
          alert(error instanceof Error ? error.message : "Không thể load dữ liệu");
        } finally {
          setLoadingData(false);
        }
      }
    };

    loadInitialData();
  }, [mode, initialData, loadData]);

  useEffect(() => {
    fields.forEach((field) => {
      if (field.type === "select" && field.loadOptions) {
        field
          .loadOptions()
          .then((data) => {
            setSelectOptions((prev) => ({ ...prev, [field.name as string]: data }));
          })
          .catch((error) => {
            alert(error instanceof Error ? error.message : "Có lỗi xảy ra");
          });
      }
    });
  }, [fields]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const transformedData: Record<string, unknown> = {};
      fields.forEach((field) => {
        const value = formData[field.name as string] || "";
        if (field.type === "number" || field.type === "select") {
          transformedData[field.name as string] = value ? Number(value) : null;
        } else {
          transformedData[field.name as string] = value;
        }
      });

      await onSubmit(transformedData as T);

      if (onSuccess) {
        onSuccess();
      }

      alert(successMessage);

      if (mode === "create") {
        setFormData({});
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FormField<T>) => {
    const value = formData[field.name as string] || "";

    switch (field.type) {
      case "select": {
        const options = field.options || selectOptions[field.name as string] || [];
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.name as string, e.target.value)}
            disabled={field.disabled || loadingData}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">-- {field.placeholder || "Chọn"} --</option>
            {options.map((option) => {
              const optionValue = field.optionValue
                ? option[field.optionValue]
                : option.value;
              const optionLabel = field.optionLabel
                ? option[field.optionLabel]
                : option.label;
              return (
                <option
                  key={String(optionValue)}
                  value={optionValue as string | number}
                >
                  {optionLabel}
                </option>
              );
            })}
          </select>
        );
      }

      case "textarea": {
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.name as string, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled || loadingData}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
            rows={4}
          />
        );
      }

      default: {
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleChange(field.name as string, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled || loadingData}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          />
        );
      }
    }
  };

  if (loadingData) {
    return <div className="text-center py-4 text-gray-400">Đang tải dữ liệu...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name as string}>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {field.label}:
          </label>
          {renderField(field)}
        </div>
      ))}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
      >
        {loading ? loadingText : finalSubmitText}
      </button>
    </form>
  );
}

export default DynamicForm;