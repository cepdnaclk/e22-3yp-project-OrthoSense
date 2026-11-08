import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor?: (item: T, idx?: number) => string;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No records found.",
  className,
  onRowClick,
}: DataTableProps<T>) {
  const getKey = keyExtractor || ((item: any, idx?: number) => item.id || item.key || item.uuid || (idx !== undefined ? `row_${idx}` : String(Math.random())));
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const comparison = aVal > bVal ? 1 : -1;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [data, sortKey, sortOrder]);

  return (
    <div className={cn("w-full overflow-x-auto rounded-lg border border-slate-200 bg-white", className)}>
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
          <tr>
            {columns.map((col) => {
              const isSorted = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={cn("px-4 py-3.5", col.className)}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="group inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] rounded"
                      aria-label={`Sort by ${col.header} ${isSorted ? (sortOrder === "asc" ? "descending" : "unsorted") : "ascending"}`}
                    >
                      {col.header}
                      {isSorted ? (
                        sortOrder === "asc" ? (
                          <ChevronUp className="h-4 w-4 text-[#0F766E]" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-[#0F766E]" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-slate-400 text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item, index) => (
              <tr
                key={getKey(item, index)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "hover:bg-slate-50/75 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-4 py-3 text-slate-800", col.className)}
                  >
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

