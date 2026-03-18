"use client";

import { TableSidebar } from "@/features/table/components/TableSidebar";
import { CardFlow } from "@/features/table/components/cardFlow";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [refreshKey, setRefreshKey] = useState(0);
  const [isOpenCardFlow, setIsOpenCardFlow] = useState<string | null>(null);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);
  const [tableIdToDelete, setTableIdToDelete] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(window.innerWidth >= 1024);
  }, []);

  const handleSelectTable = (tableId?: string) => {
    // Handled by TableSidebar's internal navigation
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleAddTable = () => {
    setIsOpenCardFlow("add-table");
  };

  const handleTableAdded = () => {
    setSidebarRefresh((prev) => prev + 1);
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeleteTable = (tableId: string) => {
    setTableIdToDelete(tableId);
    setIsOpenCardFlow("delete-table");
  };

  const handleTableDeleted = () => {
    setSidebarRefresh((prev) => prev + 1);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#0a0f1a]">
      <TableSidebar
        isOpen={isSidebarOpen}
        onSelectTable={handleSelectTable}
        refreshKey={sidebarRefresh}
        onAddTable={handleAddTable}
        onDeleteTable={handleDeleteTable}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <main className="flex-1 p-8 overflow-auto text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
            Select a Table
          </h1>
          <p className="text-slate-400">
            Choose a table from the sidebar to view its contents
          </p>
        </div>
      </main>

      <CardFlow
        isOpen={isOpenCardFlow}
        selectedTable={tableIdToDelete}
        selectedRow={null}
        selectedColumn={null}
        selectedCell={null}
        projectId={projectId}
        onClose={() => {
          setIsOpenCardFlow(null);
          setTableIdToDelete(null);
        }}
        onRefresh={() => {}}
        onTableAdded={handleTableAdded}
        onTableDeleted={handleTableDeleted}
      />
    </div>
  );
}
