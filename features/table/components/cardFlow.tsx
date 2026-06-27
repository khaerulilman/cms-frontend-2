"use client";

import { api } from "@/lib/api";
import { useState } from "react";
import * as React from "react";
import {
  addColumnsToTableDetail,
  invalidateTableDetail,
  invalidateAllTableCache,
  removeColumnFromTableDetail,
  removeRowsFromTableDetail,
  updateColumnInTableDetail,
  upsertCellInTableDetail,
  rollbackTableDetail,
} from "@/features/table/services/tableDetailStore";
import { Cell } from "@/features/table/types";

export function CardFlow({
  isOpen,
  selectedTable,
  selectedRow,
  selectedRows,
  selectedColumn,
  selectedColumnData,
  selectedCell,
  projectId,
  onClose,
  onTableAdded,
  onTableDeleted,
  onRowDeleted,
  onTableUpdated,
}: any) {
  const [columnName, setColumnName] = useState("");
  const [tableName, setTableName] = useState("");
  const [cellValue, setCellValue] = useState("");
  const [isSubTable, setIsSubTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useSubTableMode, setUseSubTableMode] = useState(false);
  const [subTables, setSubTables] = useState<any[]>([]);
  const [selectedSubTableId, setSelectedSubTableId] = useState<string | null>(
    null,
  );
  const [loadingSubTables, setLoadingSubTables] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  // Add table mode states
  const [addTableMode, setAddTableMode] = useState<"input" | "duplicate">(
    "input",
  );
  const [allTables, setAllTables] = useState<any[]>([]);
  const [selectedTableToDuplicate, setSelectedTableToDuplicate] = useState<
    string | null
  >(null);
  const [loadingAllTables, setLoadingAllTables] = useState(false);

  // Track initial state for change detection
  const [initialColumnName, setInitialColumnName] = useState("");
  const [initialTableName, setInitialTableName] = useState("");
  const [initialCellValue, setInitialCellValue] = useState("");
  const [initialUploadedImageUrl, setInitialUploadedImageUrl] =
    useState<string>("");
  const [initialUseSubTableMode, setInitialUseSubTableMode] = useState(false);
  const [initialSelectedSubTableId, setInitialSelectedSubTableId] = useState<
    string | null
  >(null);
  const [initialIsSubTable, setInitialIsSubTable] = useState(false);

  // Update tableName when editTable mode is opened
  React.useEffect(() => {
    if (
      (isOpen === "edit-table" || isOpen === "delete-table") &&
      projectId &&
      selectedTable
    ) {
      const fetchTableName = async () => {
        try {
          const data = await api.getAllUserTables(projectId);
          const currentTable = data.data.find(
            (table: any) => table.id === selectedTable,
          );
          if (currentTable) {
            setTableName(currentTable.name);
            setInitialTableName(currentTable.name);
            setIsSubTable(currentTable.isSubTable ?? false);
            setInitialIsSubTable(currentTable.isSubTable ?? false);
          }
        } catch (err) {
          console.error("Failed to fetch table name:", err);
        }
      };

      fetchTableName();
      setError(null);
    }
  }, [isOpen, projectId, selectedTable]);

  // Update cellValue when selectedCell changes
  React.useEffect(() => {
    if (!selectedCell) return;

    const cellValueToUse = selectedCell.value || "";
    const imageUrlToUse = selectedCell.imageUrl || "";

    // Priority: Check if imageUrl exists from previous upload (from database)
    if (imageUrlToUse && isImageUrl(imageUrlToUse)) {
      setUploadedImageUrl(imageUrlToUse);
      setInitialUploadedImageUrl(imageUrlToUse);
      setCellValue("");
      setInitialCellValue("");
    } else if (isImageUrl(cellValueToUse)) {
      // Fallback: Check if value itself is an image URL
      setUploadedImageUrl(cellValueToUse);
      setInitialUploadedImageUrl(cellValueToUse);
      setCellValue("");
      setInitialCellValue("");
    } else {
      // It's plain text
      setCellValue(cellValueToUse);
      setInitialCellValue(cellValueToUse);
      setUploadedImageUrl("");
      setInitialUploadedImageUrl("");
    }

    // Check if the cell value is a valid sub-table ID
    const isValidSubTableId = subTables.some(
      (table) => table.id === cellValueToUse,
    );

    if (isValidSubTableId) {
      setUseSubTableMode(true);
      setInitialUseSubTableMode(true);
      setSelectedSubTableId(cellValueToUse);
      setInitialSelectedSubTableId(cellValueToUse);
    } else {
      setUseSubTableMode(false);
      setInitialUseSubTableMode(false);
      setSelectedSubTableId(null);
      setInitialSelectedSubTableId(null);
    }
  }, [selectedCell?.value, subTables]);

  // Update columnName when edit-column mode is opened
  React.useEffect(() => {
    if (isOpen === "edit-column" && selectedColumnData) {
      setColumnName(selectedColumnData.name || "");
      setInitialColumnName(selectedColumnData.name || "");
      setError(null);
    }
  }, [isOpen, selectedColumnData]);

  // Fetch all tables when add-table mode is opened (for duplicate dropdown)
  React.useEffect(() => {
    if (isOpen === "add-table" && projectId) {
      const fetchAllTables = async () => {
        try {
          setLoadingAllTables(true);
          const data = await api.getAllUserTables(projectId);
          setAllTables(data.data);
        } catch (err) {
          console.error("Failed to fetch tables:", err);
        } finally {
          setLoadingAllTables(false);
        }
      };

      fetchAllTables();
      // Reset states
      setTableName("");
      setIsSubTable(false);
      setSelectedTableToDuplicate(null);
      setAddTableMode("input");
      setError(null);
    }
  }, [isOpen, projectId]);

  // Fetch sub-tables when edit-cell mode is opened
  React.useEffect(() => {
    if (isOpen === "update-cell" && projectId) {
      const fetchSubTables = async () => {
        try {
          setLoadingSubTables(true);
          const data = await api.getAllUserTables(projectId);
          const filtered = data.data.filter((table: any) => table.isSubTable);
          setSubTables(filtered);
        } catch (err) {
          console.error("Failed to fetch sub-tables:", err);
        } finally {
          setLoadingSubTables(false);
        }
      };

      fetchSubTables();
      // Reset file-related states when opening update-cell
      setSelectedFile(null);
      setLocalPreviewUrl("");
      setUploadedImageUrl("");
    }
  }, [isOpen, projectId]);

  if (!isOpen) {
    return null;
  }

  // For add-table and delete-table modes, we don't need selectedTable
  if (
    !selectedTable &&
    isOpen !== "add-table" &&
    isOpen !== "delete-table" &&
    isOpen !== "bulk-delete-rows"
  ) {
    return null;
  }

  const isImageUrl = (value: string): boolean => {
    if (!value || !value.startsWith("http")) return false;
    return (
      value.includes(".jpg") ||
      value.includes(".jpeg") ||
      value.includes(".png") ||
      value.includes(".gif") ||
      value.includes(".webp") ||
      value.includes("cloudinary")
    );
  };

  // Helper function to check if there are unsaved changes
  const hasChanges = (): boolean => {
    switch (isOpen) {
      case "add-column":
        return columnName.trim() !== "";
      case "edit-column":
        return columnName !== initialColumnName;
      case "add-table":
        if (addTableMode === "input") {
          return tableName.trim() !== "";
        } else {
          return selectedTableToDuplicate !== null;
        }
      case "edit-table":
        return (
          tableName !== initialTableName || isSubTable !== initialIsSubTable
        );
      case "update-cell":
        // Check for file upload, imageUrl changes, or cellValue/subTable changes
        return (
          selectedFile !== null ||
          uploadedImageUrl !== initialUploadedImageUrl ||
          cellValue !== initialCellValue ||
          selectedSubTableId !== initialSelectedSubTableId ||
          useSubTableMode !== initialUseSubTableMode
        );
      default:
        return false;
    }
  };

  const handleAddColumn = async () => {
    if (!columnName.trim()) {
      setError("Column name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.createColumn(selectedTable, [
        { name: columnName },
      ]);

      // Optimistically update state
      addColumnsToTableDetail(selectedTable, response?.data || []);

      setColumnName("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create column");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async () => {
    if (addTableMode === "input") {
      if (!tableName.trim()) {
        setError("Table name is required");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        await api.createTable(projectId, tableName, isSubTable);
        setTableName("");
        setIsSubTable(false);
        onClose();
        onTableAdded?.();
      } catch (err: any) {
        setError(err.message || "Failed to create table");
      } finally {
        setLoading(false);
      }
    } else if (addTableMode === "duplicate") {
      if (!selectedTableToDuplicate) {
        setError("Please select a table to duplicate");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        await api.duplicateTable(selectedTableToDuplicate, isSubTable);
        setSelectedTableToDuplicate(null);
        setIsSubTable(false);
        onClose();
        onTableAdded?.();
      } catch (err: any) {
        setError(err.message || "Failed to duplicate table");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateTable = async () => {
    if (!tableName.trim()) {
      setError("Table name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.updateTables(selectedTable, tableName, isSubTable);

      setTableName("");
      setIsSubTable(false);
      onClose();
      onTableUpdated?.();
    } catch (err: any) {
      setError(err.message || "Failed to update table");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.deleteTable(selectedTable);

      invalidateTableDetail(selectedTable);
      invalidateAllTableCache();

      onClose();
      onTableDeleted?.();
    } catch (err: any) {
      setError(err.message || "Failed to delete table");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRow = async () => {
    if (!selectedRow) {
      setError("No row selected");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Optimistically remove from state
      const previousState = removeRowsFromTableDetail(selectedTable, [
        selectedRow,
      ]);

      try {
        await api.deleteRow(selectedRow);
        onClose();
        onRowDeleted?.();
      } catch (apiErr) {
        // Rollback on API error
        if (previousState) {
          rollbackTableDetail(selectedTable, previousState);
        }
        throw apiErr;
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete row");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDeleteRows = async () => {
    if (!selectedRows || selectedRows.length === 0) {
      setError("No rows selected");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Optimistically remove from state
      const previousState = removeRowsFromTableDetail(
        selectedTable,
        selectedRows,
      );

      try {
        await api.bulkDeleteRows(selectedRows);
        onClose();
        onRowDeleted?.();
      } catch (apiErr) {
        // Rollback on API error
        if (previousState) {
          rollbackTableDetail(selectedTable, previousState);
        }
        throw apiErr;
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete rows");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColumn = async () => {
    if (!selectedColumn) {
      setError("No column selected");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Optimistically remove from state
      const previousState = removeColumnFromTableDetail(
        selectedTable,
        selectedColumn,
      );

      try {
        await api.deleteColumn(selectedColumn);
        onClose();
      } catch (apiErr) {
        // Rollback on API error
        if (previousState) {
          rollbackTableDetail(selectedTable, previousState);
        }
        throw apiErr;
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete column");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateColumn = async () => {
    if (!selectedColumnData || !selectedColumnData.id) {
      setError("No column selected");
      return;
    }

    if (!columnName.trim()) {
      setError("Column name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create updated column object
      const updatedColumn = { ...selectedColumnData, name: columnName };

      // Optimistically update state
      const previousState = updateColumnInTableDetail(
        selectedTable,
        updatedColumn,
      );

      try {
        const response = await api.updateColumns(
          selectedColumnData.id,
          columnName,
        );

        // Update with server response if different
        if (response?.data) {
          updateColumnInTableDetail(selectedTable, response.data);
        }

        setColumnName("");
        onClose();
      } catch (apiErr) {
        // Rollback on API error
        if (previousState) {
          rollbackTableDetail(selectedTable, previousState);
        }
        throw apiErr;
      }
    } catch (err: any) {
      setError(err.message || "Failed to update column");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      // Upload will be handled in handleUpdateCell
      // This function is kept for backward compatibility
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Compress image before upload
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          // Calculate new dimensions (max 1920px width/height)
          let width = img.width;
          let height = img.height;
          const maxDimension = 1920;

          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with quality 0.8 (80% quality)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Failed to compress image"));
              }
            },
            "image/jpeg",
            0.8,
          );
        };
        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      // Validate file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      try {
        setUploading(true);
        setError(null);

        // Compress image
        const compressedFile = await compressImage(file);

        // Create local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setLocalPreviewUrl(e.target?.result as string);
          setSelectedFile(compressedFile);
          setUploading(false);
        };
        reader.readAsDataURL(compressedFile);
      } catch (err: any) {
        setError(err.message || "Failed to process image");
        setUploading(false);
      }
    }
  };

  const handleUpdateCell = async () => {
    if (!selectedCell || !selectedCell.rowId || !selectedCell.columnId) {
      setError("No cell selected");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Kondisi 1: If there's a file selected, upload it (multipart form data)
      if (selectedFile) {
        const response = await api.updateCellWithImage(
          selectedCell.rowId,
          selectedCell.columnId,
          selectedFile,
        );
        if (response?.data) {
          // Optimistically update state
          upsertCellInTableDetail(selectedTable, response.data);
        }
      }
      // Kondisi 2: If there's an uploadedImageUrl (from database), preserve it by sending imageUrl
      else if (uploadedImageUrl && !useSubTableMode) {
        const response = await api.updateCellImage(
          selectedCell.rowId,
          selectedCell.columnId,
          uploadedImageUrl,
        );
        if (response?.data) {
          // Optimistically update state
          upsertCellInTableDetail(selectedTable, response.data);
        }
      }
      // Kondisi 3: No file and no image, use regular JSON update with text value
      else {
        let finalValue = cellValue;

        // Handle sub-table mode
        if (useSubTableMode) {
          finalValue = selectedSubTableId || "";
        }

        // Create optimistic cell update
        const optimisticCell: Cell = {
          ...selectedCell,
          value: finalValue || "",
        };

        // Optimistically update state
        const previousState = upsertCellInTableDetail(
          selectedTable,
          optimisticCell,
        );

        try {
          const response = await api.updateCell(
            selectedCell.rowId,
            selectedCell.columnId,
            finalValue || "",
          );

          // Update with server response if available
          if (response?.data) {
            upsertCellInTableDetail(selectedTable, response.data);
          }
        } catch (apiErr) {
          // Rollback on API error
          if (previousState) {
            rollbackTableDetail(selectedTable, previousState);
          }
          throw apiErr;
        }
      }

      setUseSubTableMode(false);
      setSelectedSubTableId(null);
      setSelectedFile(null);
      setLocalPreviewUrl("");
      setCellValue("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update cell");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50">
      <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-800/50 rounded-2xl shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          <h2 className="text-lg font-semibold text-white">
            {isOpen === "add-column"
              ? "Add Column"
              : isOpen === "edit-column"
                ? "Edit Column"
                : isOpen === "add-table"
                  ? "Add Table"
                  : isOpen === "edit-table"
                    ? "Edit Table"
                    : isOpen === "delete-table"
                      ? "Delete Table"
                      : isOpen === "delete-row"
                        ? "Delete Row"
                        : isOpen === "bulk-delete-rows"
                          ? "Delete Rows"
                          : isOpen === "delete-column"
                            ? "Delete Column"
                            : isOpen === "update-cell"
                              ? "Edit Cell"
                              : ""}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-slate-300">
          {isOpen === "add-column" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Column Name
              </label>
              <input
                type="text"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                placeholder="Enter column name"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                disabled={loading}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          )}

          {isOpen === "edit-column" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Column Name
              </label>
              <input
                type="text"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                placeholder="Enter column name"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                disabled={loading}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          )}

          {isOpen === "add-table" && (
            <div>
              {/* Mode Selector */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setAddTableMode("input");
                    setSelectedTableToDuplicate(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    addTableMode === "input"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                  disabled={loading}
                >
                  Create New
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddTableMode("duplicate");
                    setTableName("");
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    addTableMode === "duplicate"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                  disabled={loading}
                >
                  Duplicate Existing
                </button>
              </div>

              {/* Input Mode */}
              {addTableMode === "input" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Table Name
                  </label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="Enter table name"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    disabled={loading}
                  />
                </div>
              )}

              {/* Duplicate Mode */}
              {addTableMode === "duplicate" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Table to Duplicate
                  </label>
                  {loadingAllTables ? (
                    <p className="text-sm text-slate-400">Loading tables...</p>
                  ) : allTables.length > 0 ? (
                    <select
                      value={selectedTableToDuplicate || ""}
                      onChange={(e) =>
                        setSelectedTableToDuplicate(e.target.value || null)
                      }
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      disabled={loading}
                    >
                      <option value="">-- Select a table --</option>
                      {allTables.map((table) => (
                        <option key={table.id} value={table.id}>
                          {table.name}
                          {table.columnCount > 0
                            ? ` (${table.columnCount} columns)`
                            : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-slate-400">
                      No tables available to duplicate
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    The duplicated table will include all columns, rows, and
                    data from the selected table.
                  </p>
                </div>
              )}

              {/* Sub Table Checkbox - Available for both input and duplicate modes */}
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="isSubTable"
                  checked={isSubTable}
                  onChange={(e) => setIsSubTable(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                  disabled={loading}
                />
                <label
                  htmlFor="isSubTable"
                  className="text-sm font-medium cursor-pointer"
                >
                  Sub Table
                </label>
              </div>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          )}

          {isOpen === "edit-table" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Table Name
              </label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Enter table name"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                disabled={loading}
              />
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="editIsSubTable"
                  checked={isSubTable}
                  onChange={(e) => setIsSubTable(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                  disabled={loading}
                />
                <label
                  htmlFor="editIsSubTable"
                  className="text-sm font-medium cursor-pointer"
                >
                  Sub Table
                </label>
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          )}

          {isOpen === "delete-table" && (
            <div>
              <p className="text-sm text-slate-600 mb-4">
                Are you sure you want to delete the table{" "}
                <span className="font-semibold text-white">"{tableName}"</span>?
                This action cannot be undone.
              </p>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}

          {isOpen === "delete-row" && (
            <div>
              <p className="text-sm text-slate-600 mb-4">
                Are you sure you want to delete this row? This action cannot be
                undone.
              </p>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}

          {isOpen === "bulk-delete-rows" && (
            <div>
              <p className="text-sm text-slate-600 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">
                  {selectedRows?.length || 0}
                </span>{" "}
                row{(selectedRows?.length || 0) > 1 ? "s" : ""}? This action
                cannot be undone.
              </p>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}

          {isOpen === "delete-column" && (
            <div>
              <p className="text-sm text-slate-600 mb-4">
                Are you sure you want to delete this column? This action cannot
                be undone.
              </p>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}

          {isOpen === "update-cell" && (
            <div>
              {useSubTableMode ? (
                <div>
                  {loadingSubTables ? (
                    <p className="text-sm text-slate-400">
                      Loading sub-tables...
                    </p>
                  ) : subTables.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {subTables.map((table) => (
                        <button
                          key={table.id}
                          onClick={() => setSelectedSubTableId(table.id)}
                          className={`w-full px-4 py-2 rounded-lg text-left transition-colors border-2 ${
                            selectedSubTableId === table.id
                              ? "border-blue-500 bg-blue-50 text-blue-900"
                              : "border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                          }`}
                          disabled={loading}
                        >
                          {table.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">
                      No sub-tables available
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Upload Section */}
                  {!localPreviewUrl && !uploadedImageUrl && (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading || loading}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        {uploading ? (
                          <>
                            <svg
                              className="w-8 h-8 text-blue-500 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span className="text-sm text-blue-500">
                              Compressing image...
                            </span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-8 h-8 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="text-sm text-slate-600">
                              Click to upload image
                            </span>
                            <span className="text-xs text-slate-400">
                              Image will be auto-compressed
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  )}

                  {/* Preview Local File Before Upload */}
                  {localPreviewUrl && (
                    <div className="relative">
                      <img
                        src={localPreviewUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg border border-slate-300"
                      />
                      <button
                        onClick={() => {
                          setLocalPreviewUrl("");
                          setSelectedFile(null);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Preview Uploaded Image from Cloudinary */}
                  {uploadedImageUrl && (
                    <div className="relative">
                      <img
                        src={uploadedImageUrl}
                        alt="Uploaded"
                        className="w-full h-40 object-cover rounded-lg border border-slate-300"
                      />
                      <button
                        onClick={() => {
                          setUploadedImageUrl("");
                          setCellValue("");
                          setLocalPreviewUrl("");
                          setSelectedFile(null);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Text Input for Cell Value - Only show if no file selected and not uploaded */}
                  {!localPreviewUrl && !uploadedImageUrl && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">
                        Cell Value
                      </label>
                      <textarea
                        value={cellValue}
                        onChange={(e) => {
                          setCellValue(e.target.value);
                        }}
                        placeholder="Enter or edit cell value"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        rows={4}
                        disabled={loading || uploading}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 mb-4 mt-4">
                <input
                  type="checkbox"
                  id="useSubTable"
                  checked={useSubTableMode}
                  onChange={(e) => {
                    setUseSubTableMode(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedSubTableId(null);
                    }
                  }}
                  className="w-4 h-4 cursor-pointer"
                  disabled={loading || uploading}
                />
                <label
                  htmlFor="useSubTable"
                  className="text-sm font-medium cursor-pointer"
                >
                  Select from Sub Table
                </label>
              </div>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-800/50 bg-slate-800/30">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-700/50 text-slate-300 hover:bg-slate-800/50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          {isOpen === "add-column" && (
            <button
              onClick={handleAddColumn}
              disabled={loading || !hasChanges()}
              className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          )}
          {isOpen === "edit-column" && (
            <button
              onClick={handleUpdateColumn}
              disabled={loading || !hasChanges()}
              className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          )}
          {isOpen === "add-table" && (
            <button
              onClick={handleAddTable}
              disabled={loading || !hasChanges()}
              className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : addTableMode === "input"
                  ? "Create Table"
                  : "Duplicate Table"}
            </button>
          )}
          {isOpen === "edit-table" && (
            <button
              onClick={handleUpdateTable}
              disabled={loading || !hasChanges()}
              className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-blue-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          )}
          {isOpen === "delete-table" && (
            <button
              onClick={handleDeleteTable}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-xl bg-red-500/80 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 transition disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          )}
          {isOpen === "delete-row" && (
            <button
              onClick={handleDeleteRow}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-xl bg-red-500/80 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 transition disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          )}
          {isOpen === "bulk-delete-rows" && (
            <button
              onClick={handleBulkDeleteRows}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-xl bg-red-500/80 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 transition disabled:opacity-50"
            >
              {loading
                ? "Deleting..."
                : `Delete ${selectedRows?.length || 0} Row${(selectedRows?.length || 0) > 1 ? "s" : ""}`}
            </button>
          )}
          {isOpen === "delete-column" && (
            <button
              onClick={handleDeleteColumn}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-xl bg-red-500/80 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 transition disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          )}
          {isOpen === "update-cell" && (
            <button
              onClick={handleUpdateCell}
              disabled={loading || !hasChanges()}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
