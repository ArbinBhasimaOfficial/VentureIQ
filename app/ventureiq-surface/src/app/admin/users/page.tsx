"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Shield, UserCheck, UserX } from "lucide-react";
import { useState } from "react";
import { getAdminUsers, setAdminUserActive, updateAdminUserRole } from "@/lib/api/admin";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const client = useQueryClient();
  const users = useQuery({
    queryKey: ["admin", "users", search],
    queryFn: () => getAdminUsers({ page: 1, limit: 50, search }),
  });
  const refresh = () => client.invalidateQueries({ queryKey: ["admin", "users"] });
  return (
    <div className="space-y-7">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
          Access control
        </p>
        <h1 className="mt-3 text-3xl font-bold">Users</h1>
        <p className="mt-3 text-sm text-gray-500">Manage workspace roles and account access.</p>
      </header>
      <div className="flex items-center gap-3 border border-white/[0.06] bg-white/[0.02] px-3 py-2">
        <Search className="h-4 w-4 text-gray-600" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search users"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-700"
        />
      </div>
      <div className="overflow-x-auto border border-white/[0.06]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] text-[10px] uppercase tracking-widest text-gray-600">
            <tr>
              <th className="px-5 py-4">User</th>
              <th className="px-5 py-4">Role</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {users.data?.users.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-4">
                  <p className="font-semibold text-gray-200">{user.name}</p>
                  <p className="mt-1 text-xs text-gray-600">{user.email}</p>
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={async () => {
                      await updateAdminUserRole(user.id, user.role === "ADMIN" ? "USER" : "ADMIN");
                      refresh();
                    }}
                    className="inline-flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    {user.role}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <span className={user.isActive ? "text-emerald-400" : "text-red-400"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={async () => {
                      await setAdminUserActive(user.id, !user.isActive);
                      refresh();
                    }}
                    className="text-gray-500 hover:text-cyan-400"
                    title={user.isActive ? "Deactivate" : "Reactivate"}
                  >
                    {user.isActive ? (
                      <UserX className="ml-auto h-4 w-4" />
                    ) : (
                      <UserCheck className="ml-auto h-4 w-4" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.isLoading && !users.data?.users.length && (
          <p className="px-5 py-8 text-sm text-gray-600">No users found.</p>
        )}
      </div>
    </div>
  );
}
