import { api } from "@/lib/api";
import { TableDetailCache, Column, Row, Cell } from "../types";

const cache: Record<string, TableDetailCache> = {};
const listeners: Record<string, Set<(data: TableDetailCache) => void>> = {};

/**
 * Notify all listeners about cache changes
 */
function notify(tableId: string): void {
  const data = cache[tableId];
  if (!data) return;
  listeners[tableId]?.forEach((listener) => listener(data));
}

/**
 * Create a deep copy of cache data for rollback capability
 */
function cloneCache(data: TableDetailCache): TableDetailCache {
  return {
    columns: [...data.columns],
    rows: [...data.rows],
    cells: [...data.cells],
  };
}

export async function getTableDetail(
  tableId: string,
): Promise<TableDetailCache> {
  if (cache[tableId]) return cache[tableId];

  const [columns, rows] = await Promise.all([
    api.getColumnByTableId(tableId),
    api.getRowByTableId(tableId),
  ]);

  // Get cells for all rows
  const cellsPromises = rows.data.map((row: any) =>
    api.getCellsByRowId(row.id),
  );
  const cellsResponses = await Promise.all(cellsPromises);
  const allCells = cellsResponses.flatMap(
    (response: any) => response.data || [],
  );

  return (cache[tableId] = {
    columns: columns.data || [],
    rows: rows.data || [],
    cells: allCells,
  });
}

export function invalidateTableDetail(tableId: string) {
  delete cache[tableId];
}

export function invalidateAllTableCache() {
  Object.keys(cache).forEach((key) => delete cache[key]);
}

/**
 * Add columns to table detail and return old state for rollback
 */
export function addColumnsToTableDetail(
  tableId: string,
  newColumns: Column[],
): TableDetailCache | null {
  if (!cache[tableId] || !newColumns.length) return null;

  const oldState = cloneCache(cache[tableId]);
  cache[tableId].columns.push(...newColumns);
  notify(tableId);

  return oldState;
}

/**
 * Remove column from table detail including all related cells, returns old state for rollback
 */
export function removeColumnFromTableDetail(
  tableId: string,
  columnId: string,
): TableDetailCache | null {
  if (!cache[tableId]) return null;

  const oldState = cloneCache(cache[tableId]);

  // Remove column
  cache[tableId].columns = cache[tableId].columns.filter(
    (col) => col.id !== columnId,
  );

  // Remove all cells related to this column
  cache[tableId].cells = cache[tableId].cells.filter(
    (cell) => cell.columnId !== columnId,
  );

  notify(tableId);
  return oldState;
}

/**
 * Add row to table detail, returns old state for rollback
 */
export function addRowToTableDetail(
  tableId: string,
  newRow: Row,
): TableDetailCache | null {
  if (!cache[tableId]) return null;

  const oldState = cloneCache(cache[tableId]);
  cache[tableId].rows.push(newRow);
  notify(tableId);

  return oldState;
}

/**
 * Remove rows from table detail including all related cells, returns old state for rollback
 */
export function removeRowsFromTableDetail(
  tableId: string,
  rowIds: string[],
): TableDetailCache | null {
  if (!cache[tableId]) return null;

  const oldState = cloneCache(cache[tableId]);
  const rowIdSet = new Set(rowIds);

  // Remove rows
  cache[tableId].rows = cache[tableId].rows.filter(
    (row) => !rowIdSet.has(row.id),
  );

  // Remove all cells related to these rows
  cache[tableId].cells = cache[tableId].cells.filter(
    (cell) => !rowIdSet.has(cell.rowId),
  );

  notify(tableId);
  return oldState;
}

/**
 * Update column in table detail, returns old state for rollback
 */
export function updateColumnInTableDetail(
  tableId: string,
  updatedColumn: Column,
): TableDetailCache | null {
  if (!cache[tableId]) return null;

  const oldState = cloneCache(cache[tableId]);

  const columnIndex = cache[tableId].columns.findIndex(
    (col) => col.id === updatedColumn.id,
  );

  if (columnIndex !== -1) {
    cache[tableId].columns[columnIndex] = updatedColumn;
  }

  notify(tableId);
  return oldState;
}

/**
 * Upsert (insert or update) cell in table detail, returns old state for rollback
 */
export function upsertCellInTableDetail(
  tableId: string,
  cell: Cell,
): TableDetailCache | null {
  if (!cache[tableId]) return null;

  const oldState = cloneCache(cache[tableId]);

  const cellIndex = cache[tableId].cells.findIndex((c) => c.id === cell.id);

  if (cellIndex !== -1) {
    // Update existing cell
    cache[tableId].cells[cellIndex] = cell;
  } else {
    // Add new cell
    cache[tableId].cells.push(cell);
  }

  notify(tableId);
  return oldState;
}

/**
 * Rollback cache to previous state
 */
export function rollbackTableDetail(
  tableId: string,
  previousState: TableDetailCache,
): void {
  if (!previousState) return;
  cache[tableId] = cloneCache(previousState);
  notify(tableId);
}

/**
 * Subscribe to cache changes for a table
 * Returns unsubscribe function
 */
export function subscribeTableDetail(
  tableId: string,
  listener: (data: TableDetailCache) => void,
): () => void {
  listeners[tableId] ??= new Set();
  listeners[tableId].add(listener);

  return () => {
    listeners[tableId]?.delete(listener);
    if (listeners[tableId]?.size === 0) {
      delete listeners[tableId];
    }
  };
}
