import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { SearchInput, Pagination, LoadingSpinner, EmptyState } from './ui';
import type { Column } from '../types';

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  isLoading?: boolean;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  pageSize?: number;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  onEdit,
  onDelete,
  isLoading = false,
  searchPlaceholder = 'Search...',
  emptyTitle = 'No data found',
  emptyDescription = 'There are no items to display.',
  emptyIcon,
  pageSize = 10,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter((item) => {
      return columns.some((column) => {
        const value = item[column.key as keyof T];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const hasActions = onEdit || onDelete;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="max-w-md">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder={searchPlaceholder} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-6 py-4 text-left text-sm font-semibold text-slate-300 ${column.sortable ? 'cursor-pointer hover:text-white select-none' : ''}`}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && (
                        sortConfig?.key === String(column.key) ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-emerald-400" />
                          )
                        ) : (
                          <ChevronUp className="w-4 h-4 text-slate-600" />
                        )
                      )}
                    </div>
                  </th>
                ))}
                {hasActions && (
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300 w-20">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (hasActions ? 1 : 0)}>
                    <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const key = keyExtractor(item);
                  return (
                    <tr key={key} className="hover:bg-slate-800/30 transition-colors">
                      {columns.map((column) => (
                        <td key={`${key}-${String(column.key)}`} className="px-6 py-4 text-sm text-slate-300">
                          {column.render ? column.render(item) : String(item[column.key as keyof T] ?? '-')}
                        </td>
                      ))}
                      {hasActions && (
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === key ? null : key)}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {openDropdown === key && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                                <div className="absolute right-0 mt-1 w-36 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-20 py-1">
                                  {onEdit && (
                                    <button
                                      onClick={() => { onEdit(item); setOpenDropdown(null); }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                    >
                                      <Edit className="w-4 h-4" /> Edit
                                    </button>
                                  )}
                                  {onDelete && (
                                    <button
                                      onClick={() => { onDelete(item); setOpenDropdown(null); }}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
          </p>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
}
