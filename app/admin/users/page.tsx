"use client";

import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { DataTable, Column } from "@/components/ui/DataTable";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { patientsApi } from "@/lib/services/api";
import { apiClient } from "@/lib/services/api-client";
import { User, UserRole } from "@/lib/types";
import { UserPlus, Shield, Search, CheckCircle2, RefreshCw } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);

  // Form State
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("doctor");
  const [department, setDepartment] = React.useState("");

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientsApi.getAll();
      setUsers(data);
    } catch {
      // Keep empty if error
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleToggleActive = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newUser: User = {
      id: `usr_${role}_${Date.now()}`,
      email,
      username: email.split("@")[0],
      fullName: name,
      role,
      department: department || (role === "admin" ? "IT Administration" : "Orthopedics"),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setUsers([newUser, ...users]);
    setInviteModalOpen(false);
    setName("");
    setEmail("");
    setDepartment("");
  };

  const columns: Column<User>[] = [
    { key: "fullName", header: "User", sortable: true },
    { key: "email", header: "Email Address", sortable: true },
    {
      key: "role",
      header: "Access Role",
      sortable: true,
      render: (u) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
            u.role === "admin"
              ? "bg-purple-50 text-purple-700 border border-purple-200"
              : u.role === "doctor"
              ? "bg-teal-50 text-teal-800 border border-teal-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          {u.role.toUpperCase()}
        </span>
      ),
    },
    { key: "department", header: "Department / Cohort", sortable: true },
    {
      key: "isActive",
      header: "Account Status",
      render: (u) => (
        <button
          onClick={() => handleToggleActive(u.id)}
          className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
            u.isActive
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {u.isActive ? "Active" : "Suspended"}
        </button>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Identity & Access Governance
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Administer clinical staff roles, provision patient credentials, and maintain directory integrity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              loading={loading}
              className="gap-1.5"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setInviteModalOpen(true)}
              className="gap-1.5"
            >
              <UserPlus className="h-4 w-4" /> Invite New User
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>User Directory</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-64">
                  <Input
                    placeholder="Search name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search className="h-4 w-4 text-slate-400" />}
                  />
                </div>
                <div className="w-36">
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    options={[
                      { value: "all", label: "All Roles" },
                      { value: "doctor", label: "Doctors" },
                      { value: "patient", label: "Patients" },
                      { value: "admin", label: "Admins" },
                    ]}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable rows={5} cols={5} />
            ) : (
              <DataTable columns={columns} data={filteredUsers} />
            )}
          </CardContent>
        </Card>

        {/* Invite User Dialog */}
        <Dialog
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          title="Invite New User"
          description="Provision account credentials for a doctor, patient, or administrative staff."
        >
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Dr. Jane Foster or John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Work Email"
              type="email"
              required
              placeholder="jane.foster@orthosense.health"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Select
              label="System Role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={[
                { value: "doctor", label: "Clinician / Doctor (Medical Staff)" },
                { value: "patient", label: "Rehabilitation Patient" },
                { value: "admin", label: "System Administrator" },
              ]}
            />
            <Input
              label="Department / Surgical Group"
              placeholder="e.g. Post-Op ACL Cohort or Orthopedic Surgery"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Send Invitation
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AppShell>
  );
}
