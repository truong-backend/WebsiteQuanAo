import { useState, useEffect } from 'react';

export interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

export interface FilterControlProps {
  fields: FilterField[];
  onFilterChange: (filters: Record<string, string | number | boolean>) => void;
  onReset: () => void;
}

export function FilterControl({
  fields,
  onFilterChange,
  onReset
}: FilterControlProps) {
  const [filters, setFilters] = useState<Record<string, string | number | boolean>>({});
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (fieldName: string, value: string | number | boolean) => {
    const newFilters = { ...filters };
    
    if (value === '' || value === null || value === undefined) {
      delete newFilters[fieldName];
    } else {
      newFilters[fieldName] = value;
    }
    
    setFilters(newFilters);
  };

  const handleApply = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({});
    onReset();
    setIsOpen(false);
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center gap-2"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
          />
        </svg>
        <span>Lọc</span>
        {activeFilterCount > 0 && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Filter Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Filter Fields */}
            <div className="space-y-4 mb-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  
                  {field.type === 'select' && (
                    <select
                      value={filters[field.name] as string || ''}
                      onChange={(e) => handleFilterChange(field.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Tất cả --</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={filters[field.name] as string || ''}
                      onChange={(e) => handleFilterChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={filters[field.name] as number || ''}
                      onChange={(e) => handleFilterChange(field.name, e.target.value ? Number(e.target.value) : '')}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {field.type === 'boolean' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters[field.name] as boolean || false}
                        onChange={(e) => handleFilterChange(field.name, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">{field.placeholder || 'Kích hoạt'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đặt lại
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}