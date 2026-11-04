"use client";

import * as React from "react";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Dialog } from "@/components/ui/Dialog";
import { DataTable, Column } from "@/components/ui/DataTable";
import { INITIAL_USERS } from "@/lib/services/mock-data";
import { User, UserRole } from "@/lib/types";
import { UserPlus, Shield, Search, CheckCircle2 } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<User[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [inviteModalOpen, setInviteModalOpen] = React.useState(false);

  // Form State
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("doctor");
  const [department, setDepartment] = React.useState("");

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
    { key: "fullName", header: "Name / Staff Identity", sortable: true },
    { key: "email", header: "Email Address", sortable: true },
    {
      key: "role",
      header: "Access Role",
      sortable: true,
      render: (u) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
            u.role === "admin"
              ? "bg-slate-100 text-slate-800 border border-slate-300"
              : u.role === "doctor"
              ? "bg-teal-50 text-teal-800 border border-teal-200"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          {u.role}
        </span>
      ),
    },
    { key: "department", header: "Department / Assignment", sortable: true },
    {
      key: "isActive",
      header: "Status",
      render: (u) => (
        <button
          onClick={() => handleToggleActive(u.id)}
          className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
            u.isActive
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
          }`}
        >
          {u.isActive ? "Active (Enabled)" : "Disabled"}
        </button>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Boundary Notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs">
          <strong>Clinical-Administrative Boundary Rule:</strong> As an administrator, you have permission to provision accounts and hardware. Clinical patient session telemetry charts and diagnostic notes are strictly forbidden from this workspace.
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              User Directory & Role Governance (W2.1)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Provision clinician, administrator, and subject accounts across clinical units.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setInviteModalOpen(true)}
            className="gap-1.5"
          >
            <UserPlus className="h-4 w-4" /> Provision New User
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-64">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div className="w-48">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 text-xs"
              options={[
                { value: "all", label: "All User Roles" },
                { value: "doctor", label: "Doctors & Clinicians" },
                { value: "patient", label: "Rehabilitation Patients" },
                { value: "admin", label: "System Administrators" },
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle>Registered Accounts ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={filteredUsers}
              columns={columns}
              keyExtractor={(u) => u.id}
            />
          </CardContent>
        </Card>

        {/* Provision Modal */}
        <Dialog
          open={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          title="Provision New Healthcare Account"
          description="Assign email, access role, and clinical department."
        >
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Dr. Catherine Brooks"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="e.g. c.brooks@orthosense.health"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Select
              label="System Role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={[
                { value: "doctor", label: "Doctor / Clinician" },
                { value: "patient", label: "Patient" },
                { value: "admin", label: "System Administrator" },
              ]}
            />
            <Input
              label="Clinical Unit / Department"
              placeholder="e.g. Orthopedic Sports Medicine"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Provision User
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AppShell>
  );
}

