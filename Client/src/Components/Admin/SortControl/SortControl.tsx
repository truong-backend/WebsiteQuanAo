export interface SortOption {
  value: string;
  label: string;
}

export interface SortParams {
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

export interface SortControlProps {
  options: SortOption[];
  onSortChange: (params: SortParams) => void;
  defaultSortBy?: string;
  defaultSortDir?: 'asc' | 'desc';
}

export function SortControl({
  options,
  onSortChange,
  defaultSortBy,
  defaultSortDir = 'asc'
}: SortControlProps) {
  const initialSortBy = defaultSortBy || (options.length > 0 ? options[0].value : '');
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDir);

  const handleSortByChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    onSortChange({ sortBy: newSortBy, sortDir });
  };

  const handleSortDirChange = () => {
    const newDir = sortDir === 'asc' ? 'desc' : 'asc';
    setSortDir(newDir);
    onSortChange({ sortBy, sortDir: newDir });
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">Sắp xếp:</label>
      
      <select
        value={sortBy}
        onChange={(e) => handleSortByChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        onClick={handleSortDirChange}
        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        title={sortDir === 'asc' ? 'Tăng dần' : 'Giảm dần'}
      >
        {sortDir === 'asc' ? '↑ Tăng dần' : '↓ Giảm dần'}
      </button>
    </div>
  );
}

import { useState } from 'react';