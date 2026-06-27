"use client";

import { api } from "@/lib/api";
import { useTableDetail } from "../hooks/useTableDetail";
import {
  addRowToTableDetail,
  hasRowInTableDetail,
  removeRowsFromTableDetail,
  rollbackTableDetail,
} from "../services/tableDetailStore";
import { useEffect, useState, useRef } from "react";
import { TableNameDisplay } from "./TableNameDisplay";

export function TableDetail({
  selectedTable,
  onSelectColumnButton,
  onSelectRowButton,
  onSelectDeleteColumn,
  onEditColumn,
  onUpdateCell,
  refreshTrigger,
  onOpenGuide,
  projectId,
  onEditTable,
  tableNameRefreshKey,
  onBulkDeleteRows,
}: any) {
  const { data, loading, error } = useTableDetail(
    selectedTable,
    refreshTrigger,
  );

  const [subTables, setSubTables] = useState<any[]>([]);
  const [tableNameMap, setTableNameMap] = useState<Record<string, string>>({});
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  const columns = data?.columns || [];
  const rows = data?.rows || [];
  const cells = data?.cells || [];

  // Clear selection when table changes or data refreshes
  useEffect(() => {
    setSelectedRowIds(new Set());
  }, [selectedTable, refreshTrigger]);

  const visibleRowIds = new Set(rows.map((row: any) => row.id));
  const visibleSelectedRowIds = new Set(
    Array.from(selectedRowIds).filter((rowId) => visibleRowIds.has(rowId)),
  );

  // Fetch sub-tables and create mapping
  useEffect(() => {
    if (!projectId) return;

    const fetchTableData = async () => {
      try {
        const data = await api.getAllUserTables(projectId);
        const filtered = data.data.filter((table: any) => table.isSubTable);
        setSubTables(filtered);

        // Create mapping of ID to name
        const map: Record<string, string> = {};
        data.data.forEach((table: any) => {
          map[table.id] = table.name;
        });
        setTableNameMap(map);
      } catch (err) {
        console.error("Failed to fetch table data:", err);
      }
    };

    fetchTableData();
  }, [projectId]);

  const renderCellValue = (value: string, imageUrl?: string) => {
    // Priority 1: Use imageUrl if available (from Cloudinary)
    const displayUrl = imageUrl || value;

    // Check if value is a URL (starts with http/https)
    if (
      displayUrl &&
      (displayUrl.startsWith("http://") ||
        displayUrl.startsWith("https://") ||
        displayUrl.startsWith("data:image/"))
    ) {
      // Check if it's an image URL
      if (
        displayUrl.includes(".jpg") ||
        displayUrl.includes(".jpeg") ||
        displayUrl.includes(".png") ||
        displayUrl.includes(".gif") ||
        displayUrl.includes(".webp") ||
        displayUrl.includes("cloudinary")
      ) {
        return (
          <img
            src={displayUrl}
            alt="Cell content"
            className="h-10 w-10 lg:h-12 lg:w-12 object-cover rounded border border-slate-700/50 cursor-pointer hover:scale-150 transition-transform flex-shrink-0"
            title="Click to view full size"
            onClick={() => window.open(displayUrl, "_blank")}
          />
        );
      }
    }

    // Check if value is a tableId (exists in subTables)
    if (tableNameMap[value]) {
      return (
        <span className="inline-block px-2 py-1 text-xs font-medium text-blue-400 border border-blue-500/50 rounded bg-blue-500/10 truncate max-w-full">
          {tableNameMap[value]}
        </span>
      );
    }
    return value || "-";
  };

  const handleCreateColumn = async () => {
    onSelectColumnButton();
  };

  const handleCreateRow = async () => {
    if (!selectedTable) return;

    try {
      // Optimistically add row with temporary data
      const tempRow = {
        id: `temp_${Date.now()}`,
        tableId: selectedTable,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const previousState = addRowToTableDetail(selectedTable, tempRow);

      void (async () => {
        try {
          const response = await api.createRow(selectedTable);
          if (
            response?.data &&
            hasRowInTableDetail(selectedTable, tempRow.id)
          ) {
            removeRowsFromTableDetail(selectedTable, [tempRow.id]);
            addRowToTableDetail(selectedTable, response.data);
          } else if (response?.data) {
            // Row was removed locally before create finished, keep backend in sync.
            await api.deleteRow(response.data.id);
          }
        } catch (apiErr: any) {
          if (previousState) {
            rollbackTableDetail(selectedTable, previousState);
          }
          console.error("Failed to create row:", apiErr);
          if (typeof window !== "undefined") {
            window.alert(apiErr?.message || "Failed to create row");
          }
        }
      })();
    } catch (e) {
      console.error("Error in handleCreateRow:", e);
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    onSelectRowButton(rowId);
  };

  const handleToggleRowSelection = (rowId: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const handleToggleAllRows = () => {
    if (visibleSelectedRowIds.size === rows.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(rows.map((r: any) => r.id)));
    }
  };

  const handleBulkDelete = () => {
    if (visibleSelectedRowIds.size === 0) return;
    onBulkDeleteRows?.(Array.from(visibleSelectedRowIds));
  };

  const handleOpenSidebarGuide = async () => {
    onOpenGuide?.();
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <main className="flex-1 p-3 lg:p-8 overflow-auto bg-[#0a0f1a] text-white w-full">
      <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-3 lg:px-6 py-3 lg:py-4 border-b border-slate-700/50 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <TableNameDisplay
              selectedTable={selectedTable}
              projectId={projectId}
              onEditTable={onEditTable}
              refreshKey={tableNameRefreshKey}
            />
          </div>

          {/* Desktop: Show buttons directly */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-medium"
              onClick={() => handleOpenSidebarGuide()}
            >
              Get Data
            </button>
            <button
              className="px-3 py-2 rounded-xl border border-dashed border-slate-700/50 text-slate-400 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition-all"
              onClick={() => handleCreateColumn()}
            >
              + Add Column
            </button>
          </div>

          {/* Mobile: Show dropdown menu */}
          <div className="lg:hidden relative" ref={menuRef}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-white"
              aria-label="Open menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="2"
                  fill="currentColor"
                  opacity="0.5"
                />
                <circle
                  cx="6"
                  cy="12"
                  r="2"
                  fill="currentColor"
                  opacity="0.3"
                />
                <circle
                  cx="18"
                  cy="12"
                  r="2"
                  fill="currentColor"
                  opacity="0.3"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isMobileMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-[160px]">
                <button
                  className="w-full px-4 py-3 text-left text-white text-sm hover:bg-slate-700 transition-colors flex items-center gap-3"
                  onClick={() => {
                    handleOpenSidebarGuide();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="14"
                      rx="2"
                      strokeWidth={2}
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 9h8"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 13h5"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 20l2-2-2-2"
                    />
                  </svg>
                  Get Data
                </button>
                <button
                  className="w-full px-4 py-3 text-left text-white text-sm hover:bg-slate-700 transition-colors flex items-center gap-3"
                  onClick={() => {
                    handleCreateColumn();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h8"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 12h8"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 18h8"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9v8"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 13h8"
                    />
                  </svg>
                  Add Column
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table Container with Horizontal Scroll */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 lg:p-12 text-center text-slate-400">
              <div className="inline-block animate-pulse text-sm lg:text-base">
                Loading columns...
              </div>
            </div>
          ) : error ? (
            <div className="p-8 lg:p-12 text-center text-red-500 font-medium text-sm lg:text-base">
              {error}
            </div>
          ) : columns.length > 0 ? (
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-slate-700/50">
                <thead className="bg-slate-800/50">
                  <tr>
                    {/* Checkbox header */}
                    <th
                      scope="col"
                      className="sticky left-0 z-10 bg-slate-800/50 px-2 lg:px-3 py-3 text-center border-r border-slate-700/50 shadow-sm w-10"
                    >
                      <input
                        type="checkbox"
                        checked={
                          rows.length > 0 &&
                          visibleSelectedRowIds.size === rows.length
                        }
                        onChange={handleToggleAllRows}
                        className="w-4 h-4 cursor-pointer accent-blue-500"
                        title="Select all rows"
                      />
                    </th>
                    <th
                      scope="col"
                      className="px-3 lg:px-6 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider border-r border-slate-700/50 shadow-sm whitespace-nowrap"
                    >
                      No
                    </th>

                    {columns.map((column, idx) => (
                      <th
                        key={column.id}
                        scope="col"
                        className="px-3 lg:px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-slate-800/50 transition-colors min-w-[120px] touch-manipulation"
                        onDoubleClick={() => onEditColumn?.(column)}
                        onClick={() => {
                          // On mobile, use single click/tap to edit
                          if (
                            typeof window !== "undefined" &&
                            window.innerWidth < 1024
                          ) {
                            onEditColumn?.(column);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 select-none">
                          <span className="truncate">{column.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDeleteColumn(column.id);
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-medium flex-shrink-0 touch-manipulation"
                            title="Delete column"
                          >
                            ✕
                          </button>
                        </div>
                      </th>
                    ))}

                    <th
                      scope="col"
                      className="sticky right-0 z-10 bg-slate-800/50 px-3 lg:px-6 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider border-l border-slate-700/50 shadow-sm whitespace-nowrap"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-slate-900/20 divide-y divide-slate-700/50">
                  {rows.length > 0 ? (
                    rows.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-800/30 transition-colors duration-150 ${
                          selectedRowIds.has(row.id) ? "bg-blue-500/10" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="sticky left-0 z-10 bg-slate-900/30 px-2 lg:px-3 py-3 lg:py-4 text-center border-r border-slate-700/50 shadow-sm w-10">
                          <input
                            type="checkbox"
                            checked={selectedRowIds.has(row.id)}
                            onChange={() => handleToggleRowSelection(row.id)}
                            className="w-4 h-4 cursor-pointer accent-blue-500"
                          />
                        </td>
                        {/* No - Sticky Left */}
                        <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm font-medium text-slate-300 text-center border-r border-slate-700/50 shadow-sm">
                          {index + 1}
                        </td>

                        {/* Data Columns */}
                        {columns.map((column) => {
                          const cellValue = cells.find(
                            (cell) =>
                              cell.rowId === row.id &&
                              cell.columnId === column.id,
                          );
                          return (
                            <td
                              key={column.id}
                              onDoubleClick={() =>
                                onUpdateCell(
                                  row.id,
                                  column.id,
                                  cellValue?.value || "",
                                  cellValue?.imageUrl || "",
                                )
                              }
                              className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-slate-300 cursor-pointer hover:bg-blue-500/10 transition-colors min-w-[120px] max-w-[200px]"
                            >
                              <div className="truncate">
                                {renderCellValue(
                                  cellValue?.value || "",
                                  cellValue?.imageUrl || undefined,
                                )}
                              </div>
                            </td>
                          );
                        })}

                        {/* Actions - Sticky Right */}
                        <td className="sticky right-0 z-10 bg-slate-900/30 px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-center border-l border-slate-700/50 shadow-sm">
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-xs lg:text-sm"
                          >
                            DELETE
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length + 3}
                        className="px-3 lg:px-6 py-8 lg:py-12 text-center text-xs lg:text-sm text-slate-400"
                      >
                        No rows yet. Click "Add Row" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 lg:p-12 text-center text-slate-400 text-sm lg:text-base">
              No columns available. Click "Add Column" to create your first
              column.
            </div>
          )}
        </div>

        {/* Footer with Add Row and Bulk Delete Buttons */}
        {columns.length > 0 && (
          <div className="px-3 lg:px-6 py-2 lg:py-4 border-t border-slate-700/50 bg-slate-800/30 flex gap-2">
            <button
              className="flex-1 px-3 lg:px-4 py-2 rounded-xl border border-dashed
        border-slate-700/50 text-slate-400
        hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5
        transition-all text-sm lg:text-base"
              onClick={() => handleCreateRow()}
            >
              + Add Row
            </button>
            {visibleSelectedRowIds.size > 0 && (
              <button
                className="px-3 lg:px-4 py-2 rounded-xl border border-dashed
          border-red-700/50 text-red-400
          hover:border-red-500/50 hover:text-red-300 hover:bg-red-500/10
          transition-all text-sm lg:text-base whitespace-nowrap"
                onClick={handleBulkDelete}
              >
                Delete ({visibleSelectedRowIds.size})
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
