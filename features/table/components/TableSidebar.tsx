"use client";

import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";

type Table = {
  id: string;
  projectId: string;
  name: string;
  isSubTable: boolean;
  createdAt: string;
  updatedAt: string;
};

const tableCache: Record<string, Table[]> = {};

const STORAGE_KEY_PREFIX = "tableOrder_";

const getStoredOrder = (projectId: string): string[] | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${projectId}`);
  return stored ? JSON.parse(stored) : null;
};

const storeOrder = (projectId: string, order: string[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    `${STORAGE_KEY_PREFIX}${projectId}`,
    JSON.stringify(order),
  );
};

const clearStoredOrder = (projectId: string) => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${projectId}`);
};

// Helper to detect mobile device
const isMobile = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 1024; // lg breakpoint
};

interface TableSidebarProps {
  onSelectTable?: (tableId?: string) => void;
  refreshKey?: number;
  onAddTable?: () => void;
  onDeleteTable?: (tableId: string) => void;
  isOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function TableSidebar({
  onSelectTable,
  refreshKey,
  onAddTable,
  onDeleteTable,
  isOpen = false,
  onToggleSidebar,
}: TableSidebarProps) {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const cachedTables = projectId ? tableCache[projectId] : null;

  const [tables, setTables] = useState<Table[]>(cachedTables || []);
  const [loading, setLoading] = useState<boolean>(!cachedTables);
  const [error, setError] = useState<string | null>(null);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  // Set initial activeTableId from route on mount and when projectId/table list changes
  useEffect(() => {
    if (!projectId || !tables.length) return;
    // Try to get tableId from route params
    const routeTableId = params.tableId as string | undefined;
    if (routeTableId && tables.some((t) => t.id === routeTableId)) {
      setActiveTableId(routeTableId);
    } else {
      // If no tableId in route, default to first table
      setActiveTableId(tables[0].id);
    }
  }, [projectId, tables, params.tableId]);

  // Drag and drop state
  const [isReordering, setIsReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [tablesBeforeReorder, setTablesBeforeReorder] = useState<Table[]>([]);
  const dragIdRef = useRef<string | null>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const queuedClientYRef = useRef<number | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const isTouchDraggingRef = useRef(false);

  // Long press state for mobile
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [longPressedIndex, setLongPressedIndex] = useState<number | null>(null);

  // Apply stored order to tables
  const applyStoredOrder = useCallback(
    (tablesData: Table[]): Table[] => {
      const storedOrder = getStoredOrder(projectId);
      if (!storedOrder || storedOrder.length === 0) {
        return tablesData.sort(
          (a: Table, b: Table) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      }

      // Create a map to track tables and prevent duplicates
      const tablesMap = new Map<string, Table>();
      tablesData.forEach((t) => tablesMap.set(t.id, t));

      // Build result array with unique tables in stored order
      const result: Table[] = [];
      const processedIds = new Set<string>();

      // Add tables in stored order (if they exist)
      for (const id of storedOrder) {
        const table = tablesMap.get(id);
        if (table && !processedIds.has(id)) {
          result.push(table);
          processedIds.add(id);
        }
      }

      // Add remaining tables not in stored order
      for (const [id, table] of tablesMap.entries()) {
        if (!processedIds.has(id)) {
          result.push(table);
          processedIds.add(id);
        }
      }

      return result;
    },
    [projectId],
  );

  useEffect(() => {
    if (!projectId) return;

    // Jika refreshKey > 0, invalidate cache untuk force refresh
    if ((refreshKey ?? 0) > 0) {
      delete tableCache[projectId];
    }

    // Jika ada cache dan tidak perlu refresh → skip fetch
    if (tableCache[projectId]) {
      const sortedTables = applyStoredOrder(tableCache[projectId]);
      setTables(sortedTables);
      setLoading(false);
      return;
    }

    const fetchTables = async () => {
      try {
        setLoading(true);
        const data = await api.getAllUserTables(projectId);
        const sortedTables = applyStoredOrder(data.data);
        tableCache[projectId] = sortedTables;
        setTables(sortedTables);
      } catch (err: any) {
        setError(err.message || "Failed to fetch tables");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [projectId, refreshKey, applyStoredOrder]);

  const handleTableClick = (tableId: string) => {
    setActiveTableId(tableId);
    router.push(`/projects/${projectId}/${tableId}`);
    onSelectTable?.(tableId);
  };

  const handleAddTable = () => {
    if (!projectId) return;
    onAddTable?.();
  };

  const resetDragState = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (dragFrameRef.current !== null) {
      cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }

    queuedClientYRef.current = null;
    dragIdRef.current = null;
    draggedIndexRef.current = null;
    isTouchDraggingRef.current = false;

    setDraggedIndex(null);
    setLongPressedIndex(null);
  }, []);

  const getDropIndexFromClientY = useCallback(
    (clientY: number): number | null => {
      if (!tables.length) return null;

      for (let i = 0; i < tables.length; i++) {
        const el = itemRefs.current[tables[i].id];
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        if (clientY < midpoint) return i;
      }

      // Pointer below all rows -> insert at the end.
      return tables.length;
    },
    [tables],
  );

  const moveDraggedTable = useCallback((targetInsertionIndex: number) => {
    const currentDragId = dragIdRef.current;
    if (!currentDragId) return;

    const currentIndex = draggedIndexRef.current;
    if (currentIndex === null) return;

    // `targetInsertionIndex` is based on the full list. If dragging downward,
    // remove offset to get the real insertion slot after removal.
    const targetIndex =
      currentIndex < targetInsertionIndex
        ? targetInsertionIndex - 1
        : targetInsertionIndex;
    if (currentIndex === targetIndex) return;

    const fromIndex = currentIndex;

    setTables((prevTables) => {
      if (dragIdRef.current !== currentDragId) return prevTables;

      const from = fromIndex;
      if (
        from < 0 ||
        from >= prevTables.length ||
        targetIndex < 0 ||
        targetIndex >= prevTables.length
      ) {
        return prevTables;
      }

      const newTables = [...prevTables];
      const [removed] = newTables.splice(from, 1);
      newTables.splice(targetIndex, 0, removed);
      return newTables;
    });

    draggedIndexRef.current = targetIndex;
    setDraggedIndex(targetIndex);

    if (isTouchDraggingRef.current) {
      setLongPressedIndex(targetIndex);
    }
  }, []);

  const flushQueuedDragMove = useCallback(() => {
    dragFrameRef.current = null;

    const clientY = queuedClientYRef.current;
    if (clientY === null || !dragIdRef.current) return;

    const targetIndex = getDropIndexFromClientY(clientY);
    if (targetIndex === null) return;

    moveDraggedTable(targetIndex);
  }, [getDropIndexFromClientY, moveDraggedTable]);

  const queueDragMove = useCallback(
    (clientY: number) => {
      queuedClientYRef.current = clientY;

      if (dragFrameRef.current !== null) return;
      dragFrameRef.current = requestAnimationFrame(flushQueuedDragMove);
    },
    [flushQueuedDragMove],
  );

  // Start reordering mode
  const startReorder = () => {
    setTablesBeforeReorder([...tables]);
    setIsReordering(true);
  };

  // Save reordered tables
  const saveOrder = () => {
    const order = tables.map((t) => t.id);
    storeOrder(projectId, order);
    setIsReordering(false);
    resetDragState();
  };

  // Cancel reordering
  const cancelReorder = () => {
    setTables(tablesBeforeReorder);
    setIsReordering(false);
    resetDragState();
  };

  // Drag handlers for desktop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    const currentDragId = `drag-${Date.now()}-${Math.random()}`;
    dragIdRef.current = currentDragId;
    draggedIndexRef.current = index;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", tables[index]?.id || "");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragIdRef.current) return;
    e.dataTransfer.dropEffect = "move";
    queueDragMove(e.clientY);
  };

  const handleDragEnd = () => {
    resetDragState();
  };

  // Long press handlers for mobile
  const handleTouchStart = (_e: React.TouchEvent, index: number) => {
    if (!isReordering || dragIdRef.current) return;

    const currentDragId = `drag-${Date.now()}-${Math.random()}`;
    dragIdRef.current = currentDragId;
    draggedIndexRef.current = index;
    setDraggedIndex(index);

    longPressTimerRef.current = setTimeout(() => {
      if (dragIdRef.current === currentDragId) {
        isTouchDraggingRef.current = true;
        setLongPressedIndex(index);
      }
    }, 300);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isTouchDraggingRef.current && dragIdRef.current) {
      const touch = e.touches[0];
      if (!touch) return;
      e.preventDefault();
      queueDragMove(touch.clientY);
      return;
    }

    if (longPressTimerRef.current && !isTouchDraggingRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      dragIdRef.current = null;
      draggedIndexRef.current = null;
      setDraggedIndex(null);
    }
  };

  const handleTouchEnd = () => {
    resetDragState();
  };

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (dragFrameRef.current !== null) {
        cancelAnimationFrame(dragFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Open button - only on mobile when sidebar is closed */}
      {!isOpen && onToggleSidebar && (
        <button
          className="lg:hidden fixed top-[320px] left-3 z-20 p-2 rounded-lg bg-slate-900/80 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800/90 transition-colors"
          onClick={() => onToggleSidebar?.()}
          aria-label="Open sidebar"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {/* Backdrop - Only on mobile when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => onToggleSidebar?.()}
        />
      )}

      {/* Sidebar - Always visible on desktop, controlled on mobile */}
      <aside
        className={`fixed lg:static top-16 lg:top-0 left-0 h-[calc(100vh-64px)] lg:h-full w-64 bg-[#111828] backdrop-blur-sm border-r border-slate-800/50 text-white flex flex-col p-4 overflow-y-auto shadow-lg z-30 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
            Tables
          </h2>
          {/* Close button for mobile */}
          <button
            className="lg:hidden p-1 rounded-md hover:bg-slate-800/50 transition-colors text-slate-400 hover:text-white"
            onClick={() => onToggleSidebar?.()}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Reorder controls */}
        {!isReordering && tables.length > 1 && (
          <button
            onClick={startReorder}
            className="mb-3 text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1"
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
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
            Reorder
          </button>
        )}

        {/* Save/Cancel buttons */}
        {isReordering && (
          <div className="mb-3 flex gap-2">
            <button
              onClick={cancelReorder}
              className="flex-1 py-1 px-2 text-xs rounded-lg border border-slate-700/50 text-slate-400 hover:bg-slate-800/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveOrder}
              className="flex-1 py-1 px-2 text-xs rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-colors"
            >
              Save
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3 flex-1">
          {loading ? (
            <p className="text-sm text-slate-400">Loading tables...</p>
          ) : error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : tables.length > 0 ? (
            tables.map((table, index) => (
              <div
                key={table.id}
                ref={(node) => {
                  if (node) {
                    itemRefs.current[table.id] = node;
                  } else {
                    delete itemRefs.current[table.id];
                  }
                }}
                className={`group relative transition-[transform,opacity] duration-150 ${isReordering ? "cursor-move select-none" : ""} ${
                  draggedIndex === index ? "opacity-80" : ""
                }`}
                draggable={isReordering && !isMobile()}
                onDragStart={(e) => isReordering && handleDragStart(e, index)}
                onDragOver={(e) => isReordering && handleDragOver(e)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => isReordering && handleTouchStart(e, index)}
                onTouchMove={(e) => isReordering && handleTouchMove(e)}
                onTouchEnd={() => isReordering && handleTouchEnd()}
              >
                <button
                  onClick={() => !isReordering && handleTableClick(table.id)}
                  className={`w-full text-left px-4 py-2 rounded-xl transition-all border-2
                    ${
                      draggedIndex === index ||
                      longPressedIndex === index ||
                      activeTableId === table.id
                        ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10 text-blue-400"
                        : "border-slate-700/30 hover:bg-slate-800/50 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10"
                    }`}
                >
                  {/* Drag handle - desktop */}
                  {isReordering && (
                    <span className="hidden lg:inline mr-2 text-slate-500 hover:text-slate-300">
                      <svg
                        className="w-4 h-4 inline"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8h16M4 16h16"
                        />
                      </svg>
                    </span>
                  )}
                  {table.name + " " + (table.isSubTable ? "[ ]" : "")}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTable?.(table.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-300"
                  title="Delete table"
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No tables yet</p>
          )}
        </div>

        {/* Add Table */}
        <button
          onClick={handleAddTable}
          className="mt-4 py-2 rounded-xl border border-dashed 
        border-slate-700/50 text-slate-400
        hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5
        transition-all"
        >
          + Add Table
        </button>
      </aside>
    </>
  );
}
