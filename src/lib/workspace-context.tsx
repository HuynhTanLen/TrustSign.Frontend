"use client";

import * as React from "react";
import type { UserDto } from "@/lib/api/auth";
import type { TenantRole } from "@/lib/api/tenants";

export const TENANT_ROLE_LABELS: Record<TenantRole, string> = {
  TenantOwner: "Chủ doanh nghiệp",
  ContractManager: "Quản lý hợp đồng",
  Employee: "Nhân viên",
};

export const TENANT_ROLE_DESCRIPTIONS: Record<TenantRole, string> = {
  TenantOwner: "Toàn quyền quản lý thông tin doanh nghiệp, thành viên, lời mời và phân quyền vai trò.",
  ContractManager: "Quản lý mẫu hợp đồng và theo dõi hợp đồng trong doanh nghiệp.",
  Employee: "Làm việc trong không gian doanh nghiệp theo quyền được phân công.",
};

export interface WorkspaceContextValue {
  user: UserDto;
  activeTenantId: string;
  currentRole: TenantRole;
  openProfileModal: () => void;
  refreshUser: () => Promise<void>;
}

export const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

export function useWorkspace(): WorkspaceContextValue {
  const ctx = React.useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace phải được dùng bên trong AppLayout.");
  }
  return ctx;
}
