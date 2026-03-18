"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function ProjectCardFlow({
  isOpen,
  selectedProjectId,
  onClose,
  onProjectCreated,
  onProjectDeleted,
  editData,
}: {
  isOpen: string | null;
  selectedProjectId: string | null;
  onClose: () => void;
  onProjectCreated: () => void;
  onProjectDeleted: () => void;
  editData?: { name: string; description: string | null };
}) {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen === "edit-project" && editData) {
      setProjectName(editData.name);
      setProjectDescription(editData.description || "");
      setError(null);
    } else if (isOpen === "create-project") {
      setProjectName("");
      setProjectDescription("");
      setError(null);
    }
  }, [isOpen, editData]);

  if (!isOpen) {
    return null;
  }

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.createProject(projectName, projectDescription);
      setProjectName("");
      setProjectDescription("");
      onClose();
      onProjectCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    if (!selectedProjectId) {
      setError("No project selected");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.updateProjects(
        selectedProjectId,
        projectName,
        projectDescription
      );
      setProjectName("");
      setProjectDescription("");
      onClose();
      onProjectCreated();
    } catch (err: any) {
      setError(err.message || "Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProjectId) {
      setError("No project selected");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.deleteProject(selectedProjectId);
      onClose();
      onProjectDeleted();
    } catch (err: any) {
      setError(err.message || "Failed to delete project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 border border-slate-700/50 shadow-2xl shadow-blue-500/20 max-w-md w-full rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          <h2 className="text-xl font-semibold text-white">
            {isOpen === "create-project"
              ? "Create Project"
              : isOpen === "edit-project"
              ? "Edit Project"
              : isOpen === "delete-project"
              ? "Delete Project"
              : ""}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800/50"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isOpen === "create-project" && (
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                disabled={loading}
              />

              <label className="block text-sm font-medium mb-2 mt-4 text-slate-300">
                Description (Optional)
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Enter project description"
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                rows={4}
                disabled={loading}
              />

              {error && (
                <p className="text-red-400 text-sm mt-3 flex items-center gap-2">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error}
                </p>
              )}
            </div>
          )}

          {isOpen === "edit-project" && (
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                disabled={loading}
              />

              <label className="block text-sm font-medium mb-2 mt-4 text-slate-300">
                Description (Optional)
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Enter project description"
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                rows={4}
                disabled={loading}
              />

              {error && (
                <p className="text-red-400 text-sm mt-3 flex items-center gap-2">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error}
                </p>
              )}
            </div>
          )}

          {isOpen === "delete-project" && (
            <div>
              <div className="flex items-start gap-3 mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <svg
                  className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <p className="text-sm text-red-400 font-medium mb-1">
                    Warning
                  </p>
                  <p className="text-sm text-slate-300">
                    Are you sure you want to delete this project? This action
                    cannot be undone.
                  </p>
                </div>
              </div>
              {error && (
                <p className="text-red-400 text-sm flex items-center gap-2">
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
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 bg-slate-800/30 border-t border-slate-800/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          {isOpen === "create-project" && (
            <button
              onClick={handleCreateProject}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          )}
          {isOpen === "edit-project" && (
            <button
              onClick={handleUpdateProject}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          )}
          {isOpen === "delete-project" && (
            <button
              onClick={handleDeleteProject}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

type Project = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpenCardFlow, setIsOpenCardFlow] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [editData, setEditData] = useState<
    { name: string; description: string | null } | undefined
  >();
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await api.getAllUserProjects();
        setProjects(data.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <svg
            className="w-12 h-12 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  const handleButtonProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleCreateProject = () => {
    setIsOpenCardFlow("create-project");
  };

  const handleDeleteProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsOpenCardFlow("delete-project");
  };

  const handleEditProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setEditData({ name: project.name, description: project.description });
    setIsOpenCardFlow("edit-project");
  };

  const handleProjectCreated = () => {
    setIsOpenCardFlow(null);
    const fetchProjects = async () => {
      try {
        const data = await api.getAllUserProjects();
        setProjects(data.data);
      } catch (err: any) {
        console.error(err);
      }
    };
    fetchProjects();
  };

  const handleProjectDeleted = () => {
    setIsOpenCardFlow(null);
    setSelectedProjectId(null);
    const fetchProjects = async () => {
      try {
        const data = await api.getAllUserProjects();
        setProjects(data.data);
      } catch (err: any) {
        console.error(err);
      }
    };
    fetchProjects();
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] bg-gradient-to-b from-[#0a0f1a] via-[#0d1421] to-[#0a0f1a] p-6 sm:p-10">
      {/* Background Effects */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div
        className="fixed top-40 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
              Projects
            </span>
          </h1>
          <p className="text-slate-400">Kelola semua project portfolio Anda</p>
        </div>

        {/* Projects Grid */}
        <div className="flex items-start gap-6 flex-wrap">
          {projects?.map((project: any) => (
            <div
              key={project.id}
              className="relative group w-full sm:w-64 bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-4 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
            >
              {/* Delete button */}
              <button
                onClick={() => handleDeleteProject(project.id)}
                className="absolute top-3 right-3 bg-red-500/90 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110 z-10 shadow-lg"
                title="Delete project"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Project name button */}
              <button
                onClick={() => handleButtonProjectClick(project.id)}
                className="w-full mt-1 mb-4 px-4 py-2.5 rounded-xl 
                bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-semibold text-center
                hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 truncate
                hover:scale-[1.02] active:scale-95"
              >
                {project.name}
              </button>

              {/* Description card */}
              <div
                className="rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer"
                onDoubleClick={() => handleEditProject(project)}
                title="Double-click to edit"
              >
                <p className="p-4 text-sm text-slate-300 line-clamp-4 leading-relaxed">
                  {project.description || "No description"}
                </p>
              </div>
            </div>
          ))}

          {/* Add New Project Button */}
          <button
            onClick={handleCreateProject}
            className="w-full sm:w-64 h-52 flex flex-col items-center justify-center 
            rounded-2xl border-2 border-dashed border-slate-700/50
            text-slate-500
            hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5
            transition-all duration-300 group/add
            backdrop-blur-sm"
          >
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-3 group-hover/add:bg-blue-500/10 group-hover/add:scale-110 transition-all duration-300">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Tambah Project Baru</span>
          </button>
        </div>
      </div>

      <ProjectCardFlow
        isOpen={isOpenCardFlow}
        selectedProjectId={selectedProjectId}
        editData={editData}
        onClose={() => {
          setIsOpenCardFlow(null);
          setSelectedProjectId(null);
          setEditData(undefined);
        }}
        onProjectCreated={handleProjectCreated}
        onProjectDeleted={handleProjectDeleted}
      />
    </div>
  );
}

export default function ProjectsPageWrapper() {
  return (
    <ProtectedRoute>
      <ProjectsPage />
    </ProtectedRoute>
  );
}
