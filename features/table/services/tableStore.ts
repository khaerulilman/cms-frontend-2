export type Table = {
  id: string;
  projectId: string;
  name: string;
  isSubTable: boolean;
  createdAt: string;
  updatedAt: string;
};

const tableCache: Record<string, Table[]> = {};
const listeners: Record<string, Set<(tables: Table[]) => void>> = {};

function notify(projectId: string) {
  const tables = tableCache[projectId];
  if (!tables) return;
  listeners[projectId]?.forEach((listener) => listener(tables));
}

export function getCachedTables(projectId: string) {
  return tableCache[projectId] || null;
}

export function setCachedTables(projectId: string, tables: Table[]) {
  tableCache[projectId] = tables;
  notify(projectId);
}

export function invalidateTables(projectId: string) {
  delete tableCache[projectId];
}

export function subscribeTables(
  projectId: string,
  listener: (tables: Table[]) => void,
) {
  listeners[projectId] ??= new Set();
  listeners[projectId].add(listener);

  return () => {
    listeners[projectId]?.delete(listener);
    if (listeners[projectId]?.size === 0) {
      delete listeners[projectId];
    }
  };
}

export function updateTableInProjectCache(projectId: string, table: Table) {
  const current = tableCache[projectId];
  if (!current) return;

  tableCache[projectId] = current.map((item) =>
    item.id === table.id ? { ...item, ...table } : item,
  );
  notify(projectId);
}

/**
 * Add a new table to project cache and return previous state for rollback
 */
export function addTableToProjectCache(
  projectId: string,
  table: Table,
): Table[] | null {
  const current = tableCache[projectId];
  if (!current) return null;

  const previousState = [...current];
  tableCache[projectId] = [...current, table];
  notify(projectId);

  return previousState;
}

/**
 * Remove a table from project cache and return previous state for rollback
 */
export function removeTableFromProjectCache(
  projectId: string,
  tableId: string,
): Table[] | null {
  const current = tableCache[projectId];
  if (!current) return null;

  const previousState = [...current];
  tableCache[projectId] = current.filter((table) => table.id !== tableId);
  notify(projectId);

  return previousState;
}

/**
 * Rollback tables to previous state
 */
export function rollbackTables(
  projectId: string,
  previousState: Table[],
): void {
  if (!previousState) return;
  tableCache[projectId] = [...previousState];
  notify(projectId);
}
