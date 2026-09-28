"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, Shield, UserCheck, UserX } from "lucide-react";

import { getAdminUsers, setAdminUserActive, updateAdminUserRole } from "@/lib/api/admin";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mutatingUserId, setMutatingUserId] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const queryClient = useQueryClient();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users
  const usersQuery = useQuery({
    queryKey: ["admin", "users", debouncedSearch],
    queryFn: () =>
      getAdminUsers({
        page: 1,
        limit: 50,
        search: debouncedSearch.trim() || undefined,
      }),
  });

  // Update user role
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "USER" | "ADMIN" }) =>
      updateAdminUserRole(id, role),

    onMutate: ({ id }) => {
      setMutatingUserId(id);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
        exact: false,
      });
    },

    onError: (error) => {
      console.error("Failed to update user role:", error);
    },

    onSettled: () => {
      setMutatingUserId(null);
    },
  });

  // Activate / deactivate user
  const activeMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setAdminUserActive(id, active),

    onMutate: ({ id }) => {
      setMutatingUserId(id);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
        exact: false,
      });
    },

    onError: (error) => {
      console.error("Failed to update user account status:", error);
    },

    onSettled: () => {
      setMutatingUserId(null);
    },
  });

  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  const handleConfirmClose = (confirmed: boolean) => {
    if (confirmed) {
      confirmDialog.onConfirm();
    }

    setConfirmDialog({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: () => {},
    });
  };

  const handleRoleChange = (id: string, currentRole: "USER" | "ADMIN") => {
    const nextRole = currentRole === "ADMIN" ? "USER" : "ADMIN";

    showConfirmDialog(
      "Change User Role",
      `Are you sure you want to change this user's role to ${nextRole}?`,
      () => {
        roleMutation.mutate({
          id,
          role: nextRole,
        });
      },
    );
  };

  const handleActiveChange = (id: string, isActive: boolean) => {
    const nextState = !isActive;
    const action = nextState ? "reactivate" : "deactivate";

    showConfirmDialog(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} this user?`,
      () => {
        activeMutation.mutate({
          id,
          active: nextState,
        });
      },
    );
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
          Access control
        </p>

        <h1 className="mt-3 text-3xl font-bold">Users</h1>

        <p className="mt-3 text-sm text-gray-500">Manage workspace roles and account access.</p>
      </header>

      {/* Search */}
      <div className="flex items-center gap-3 border border-white/[0.06] bg-white/[0.02] px-3 py-2">
        <Search className="h-4 w-4 text-gray-600" />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search users"
          className="flex-1 bg-transparent text-sm text-gray-200 outline-none placeholder:text-gray-700"
          aria-label="Search users"
        />
      </div>

      {/* Loading */}
      {usersQuery.isPending && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading users...
        </div>
      )}

      {/* Query Error */}
      {usersQuery.isError && (
        <div className="flex items-center justify-between border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
          <span>Failed to load users. Please try again.</span>

          <button
            type="button"
            onClick={() => usersQuery.refetch()}
            className="ml-3 text-cyan-400 underline hover:text-cyan-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Role Mutation Error */}
      {roleMutation.isError && (
        <div className="flex items-center justify-between border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
          <span>Failed to update the user&apos;s role.</span>

          <button
            type="button"
            onClick={() => roleMutation.reset()}
            className="ml-3 text-red-400 hover:text-red-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Mutation Error */}
      {activeMutation.isError && (
        <div className="flex items-center justify-between border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
          <span>Failed to update the user&apos;s account status.</span>

          <button
            type="button"
            onClick={() => activeMutation.reset()}
            className="ml-3 text-red-400 hover:text-red-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto border border-white/[0.06]">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="border-b border-white/[0.06] text-[10px] uppercase tracking-widest text-gray-600">
            <tr>
              <th className="px-5 py-4">User</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Created</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.05]">
            {usersQuery.data?.users.map((user) => {
              const isUserMutating = mutatingUserId === user.id;

              return (
                <tr key={user.id} className="transition hover:bg-white/[0.01]">
                  {/* User */}
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-200">{user.name}</p>

                    <p className="mt-1 text-xs text-gray-600">{user.email}</p>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      disabled={isUserMutating}
                      onClick={() => handleRoleChange(user.id, user.role)}
                      className="inline-flex items-center gap-2 text-xs text-cyan-400 transition hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Change role from ${user.role}`}
                    >
                      {isUserMutating && roleMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Shield className="h-3.5 w-3.5" />
                      )}

                      {user.role}
                    </button>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className={user.isActive ? "text-emerald-400" : "text-red-400"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-5 py-4 text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      disabled={isUserMutating}
                      onClick={() => handleActiveChange(user.id, user.isActive)}
                      className="text-gray-500 transition hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={user.isActive ? "Deactivate user" : "Reactivate user"}
                    >
                      {isUserMutating && activeMutation.isPending ? (
                        <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                      ) : user.isActive ? (
                        <UserX className="ml-auto h-4 w-4" />
                      ) : (
                        <UserCheck className="ml-auto h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State */}
        {!usersQuery.isPending && !usersQuery.isError && !usersQuery.data?.users.length && (
          <p className="px-5 py-8 text-sm text-gray-600">No users found.</p>
        )}
      </div>

      {/* Total Users */}
      {usersQuery.data?.pagination && (
        <p className="text-xs text-gray-600">Total users: {usersQuery.data.pagination.total}</p>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-message"
            className="w-full max-w-sm rounded-lg border border-white/[0.06] bg-gray-950 p-6 shadow-xl"
          >
            <h2 id="confirm-dialog-title" className="text-lg font-semibold text-gray-200">
              {confirmDialog.title}
            </h2>

            <p id="confirm-dialog-message" className="mt-3 text-sm text-gray-500">
              {confirmDialog.message}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => handleConfirmClose(false)}
                className="flex-1 rounded px-4 py-2 text-sm font-medium text-gray-400 transition hover:bg-white/[0.05] hover:text-gray-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleConfirmClose(true)}
                className="flex-1 rounded bg-cyan-400/20 px-4 py-2 text-sm font-medium text-cyan-400 transition hover:bg-cyan-400/30"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
