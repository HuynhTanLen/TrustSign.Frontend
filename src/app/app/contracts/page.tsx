"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge, ContractStatus } from "@/components/ui/badge";
import { Plus, Search, Filter, Eye, FileSignature } from "lucide-react";

interface ContractItem {
  id: string;
  title: string;
  partner: string;
  creator: string;
  status: ContractStatus;
  sentAt: string;
  dueAt: string;
}

const CONTRACTS: ContractItem[] = [
  {
    id: "TS-SAAS-2026-01",
    title: "Hợp đồng Dịch vụ Phần mềm SaaS",
    partner: "Công ty TNHH Công nghệ ABC",
    creator: "Nguyễn Văn An",
    status: "Completed",
    sentAt: "23/10/2026 09:10",
    dueAt: "30/10/2026 17:00",
  },
  {
    id: "TS-2026-092",
    title: "Hợp đồng Cung cấp Dịch vụ Cloud",
    partner: "Trần Thị Mai (Bên B)",
    creator: "Nguyễn Văn An",
    status: "Pending",
    sentAt: "22/10/2026 14:00",
    dueAt: "Hôm nay 17:00",
  },
  {
    id: "TS-2026-088",
    title: "Thỏa thuận Bảo mật Thông tin NDA",
    partner: "Lê Hoàng Long (Người 2/2)",
    creator: "Trần Thị Mai",
    status: "Signing",
    sentAt: "21/10/2026 11:30",
    dueAt: "24/10/2026 12:00",
  },
  {
    id: "TS-BB-9920",
    title: "Biên bản Bàn giao Nghiệm thu Dự án",
    partner: "Tập đoàn Viettel IDC",
    creator: "Nguyễn Văn An",
    status: "Completed",
    sentAt: "19/10/2026 08:45",
    dueAt: "25/10/2026 17:00",
  },
  {
    id: "TS-LD-1042",
    title: "Hợp đồng Lao động Chính thức 2026",
    partner: "Phạm Minh Tuấn",
    creator: "Trần Thị Mai",
    status: "Draft",
    sentAt: "Chưa gửi",
    dueAt: "—",
  },
  {
    id: "TS-KT-0811",
    title: "Hợp đồng Tư vấn Kiểm toán Nội bộ",
    partner: "Công ty Kiểm toán Đông Á",
    creator: "Nguyễn Văn An",
    status: "Declined",
    sentAt: "15/10/2026 16:20",
    dueAt: "20/10/2026 17:00",
  },
];

export default function ContractsListPage() {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const filtered = CONTRACTS.filter((c) => {
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesQuery =
      !query.trim() ||
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.partner.toLowerCase().includes(query.toLowerCase()) ||
      c.id.toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const filterTabs: { key: string; label: string }[] = [
    { key: "ALL", label: "Tất cả (6)" },
    { key: "Pending", label: "Chờ ký (1)" },
    { key: "Signing", label: "Đang ký (1)" },
    { key: "Completed", label: "Hoàn tất (2)" },
    { key: "Draft", label: "Nháp (1)" },
    { key: "Declined", label: "Từ chối (1)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Quản lý Hợp đồng
          </h1>
          <p className="text-sm text-muted mt-1">
            Tra cứu, theo dõi tiến trình ký tuần tự và tải xuống hợp đồng đã đóng dấu số PAdES
          </p>
        </div>
        <Link href="/app/contracts/new">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            <span>Soạn hợp đồng mới</span>
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-5 bg-surface border border-line rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4">
          {filterTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`h-10 px-4 rounded-xl text-sm font-semibold transition-all ${
                statusFilter === t.key
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Tìm theo tên hợp đồng, bên ký hoặc mã hợp đồng..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 border border-slate-300 rounded-xl pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 border border-slate-300 rounded-xl px-4 text-sm font-medium text-slate-800 bg-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Draft">Nháp</option>
              <option value="Pending">Chờ ký</option>
              <option value="Signing">Đang ký</option>
              <option value="Completed">Hoàn tất</option>
              <option value="Declined">Từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-surface border border-line rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-line text-xs uppercase tracking-wider font-semibold text-slate-500 h-12">
                <th className="px-6">Mã hợp đồng</th>
                <th className="px-6">Tên hợp đồng</th>
                <th className="px-6">Bên ký</th>
                <th className="px-6">Người tạo</th>
                <th className="px-6">Trạng thái</th>
                <th className="px-6">Hạn ký</th>
                <th className="px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {filtered.map((item) => (
                <tr key={item.id} className="h-[64px] hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 font-mono font-medium text-slate-600">{item.id}</td>
                  <td className="px-6 font-semibold text-slate-900">{item.title}</td>
                  <td className="px-6 text-slate-700">{item.partner}</td>
                  <td className="px-6 text-slate-600">{item.creator}</td>
                  <td className="px-6">
                    <Badge contractStatus={item.status} />
                  </td>
                  <td
                    className={`px-6 ${
                      item.dueAt.includes("Hôm nay") ? "text-danger font-semibold" : "text-slate-600"
                    }`}
                  >
                    {item.dueAt}
                  </td>
                  <td className="px-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      {(item.status === "Pending" || item.status === "Signing") && (
                        <Link href={`/sign/${item.id}`}>
                          <Button variant="primary" size="sm">
                            <FileSignature className="w-4 h-4" />
                            <span>Ký</span>
                          </Button>
                        </Link>
                      )}
                      <Link href={`/app/contracts/${item.id}`}>
                        <Button variant="secondary" size="sm">
                          <Eye className="w-4 h-4" />
                          <span>Chi tiết</span>
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
