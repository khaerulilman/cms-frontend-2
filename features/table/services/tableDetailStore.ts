import { api } from "@/lib/api";
import { TableDetailCache } from "../types";

const cache: Record<string, TableDetailCache> = {};

export async function getTableDetail(
  tableId: string
): Promise<TableDetailCache> {
  if (cache[tableId]) return cache[tableId];

  const [columns, rows] = await Promise.all([
    api.getColumnByTableId(tableId),
    api.getRowByTableId(tableId),
  ]);

  // Get cells for all rows
  const cellsPromises = rows.data.map((row: any) =>
    api.getCellsByRowId(row.id)
  );
  const cellsResponses = await Promise.all(cellsPromises);
  const allCells = cellsResponses.flatMap(
    (response: any) => response.data || []
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
