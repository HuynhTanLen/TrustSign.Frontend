"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Plus, Search, PenTool, Eye, FileText, Code2, Sparkles } from "lucide-react";

const TEMPLATES = [
  {
    id: "tpl-1",
    name: "Mẫu Hợp đồng Dịch vụ Phần mềm SaaS",
    varsCount: 4,
    variables: ["ten_doi_tac", "ma_so_thue", "gia_tri_hd", "ngay_hieu_luc"],
    author: "Nguyễn Văn An",
    updatedAt: "22/10/2026 15:30",
  },
  {
    id: "tpl-2",
    name: "Mẫu Thỏa thuận Bảo mật Thông tin (NDA)",
    varsCount: 3,
    variables: ["ten_ben_nhan", "dai_dien", "thoi_han_bao_mat"],
    author: "Trần Thị Mai",
    updatedAt: "20/10/2026 10:15",
  },
  {
    id: "tpl-3",
    name: "Mẫu Hợp đồng Lao động Tiêu chuẩn",
    varsCount: 6,
    variables: ["ho_ten_nv", "cccd", "vi_tri", "muc_luong", "ngay_bat_dau", "thoi_han"],
    author: "Nguyễn Văn An",
    updatedAt: "18/10/2026 09:00",
  },
];

export default function TemplatesPage() {
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [templateHtml, setTemplateHtml] = React.useState(
    `HỢP ĐỒNG DỊCH VỤ PHẦN MỀM\nBên A: Công ty Cổ phần Giải pháp Chữ Tín\nBên B: {{ten_doi_tac}} (Mã số thuế: {{ma_so_thue}})\nTổng giá trị hợp đồng: {{gia_tri_hd}}\nCó hiệu lực kể từ ngày: {{ngay_hieu_luc}}.`
  );

  // Tự động phát hiện biến {{ten_bien}} từ nội dung
  const detectedVars = React.useMemo(() => {
    const matches = Array.from(templateHtml.matchAll(/\{\{([a-zA-Z0-9_]+)\}\}/g)).map((m) => m[1]);
    return Array.from(new Set(matches));
  }, [templateHtml]);

  const filtered = TEMPLATES.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Mẫu Hợp đồng Động (FE-04)
          </h1>
          <p className="text-sm text-muted mt-1">
            Quản lý các mẫu văn bản chuẩn hóa với biến động tự động nhận diện <code>{"{{ten_bien}}"}</code>
          </p>
        </div>
        <Link href="/app/contracts/new">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            <span>Soạn hợp đồng từ mẫu</span>
          </Button>
        </Link>
      </div>

      {/* Danh sách mẫu */}
      <div className="bg-surface border border-line rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-900">Danh sách mẫu đang lưu hành</h2>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Tìm theo tên mẫu hợp đồng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 border border-slate-300 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-line text-xs uppercase tracking-wider font-semibold text-slate-500 h-12">
                <th className="px-6">Tên mẫu hợp đồng</th>
                <th className="px-6">Các biến động</th>
                <th className="px-6">Người tạo</th>
                <th className="px-6">Cập nhật lần cuối</th>
                <th className="px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {filtered.map((tpl) => (
                <tr key={tpl.id} className="h-[64px] hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 font-semibold text-slate-900 flex items-center gap-2.5 h-[64px]">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <span>{tpl.name}</span>
                  </td>
                  <td className="px-6">
                    <div className="flex flex-wrap gap-1.5">
                      {tpl.variables.map((v) => (
                        <span
                          key={v}
                          className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-primary border border-indigo-200 font-mono text-xs font-semibold"
                        >
                          {`{{${v}}}`}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 text-slate-700">{tpl.author}</td>
                  <td className="px-6 text-slate-500">{tpl.updatedAt}</td>
                  <td className="px-6 text-right">
                    <Link href="/app/contracts/new">
                      <Button variant="secondary" size="sm">
                        Sử dụng mẫu
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trình soạn thảo mẫu hợp đồng + Tự phát hiện biến (FE-04) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-surface border border-line rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" />
              <span>Trình soạn thảo mẫu trực tiếp</span>
            </h2>
            <span className="text-xs text-muted">Gõ {"{{ten_bien}}"} để thêm trường tự động</span>
          </div>

          <textarea
            rows={7}
            value={templateHtml}
            onChange={(e) => setTemplateHtml(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-4 text-sm font-mono text-slate-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 leading-relaxed"
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => toast("Đã hiển thị bản xem trước với dữ liệu mẫu", "info")}
            >
              <Eye className="w-4 h-4" />
              <span>Xem trước PDF</span>
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => toast("Đã lưu mẫu hợp đồng thành công", "success")}
            >
              Lưu mẫu hợp đồng
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5 bg-surface border border-line rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Biến tự động phát hiện ({detectedVars.length})</span>
          </h2>
          <p className="text-sm text-muted">
            Danh sách các biến được trích xuất trực tiếp từ nội dung mẫu bên trái:
          </p>

          <div className="space-y-3">
            {detectedVars.map((v) => (
              <div
                key={v}
                className="p-3.5 rounded-xl border border-line bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono text-sm font-bold text-primary">{`{{${v}}}`}</span>
                  <p className="text-xs text-slate-500 mt-0.5">Kiểu dữ liệu: Chữ / Số • Bắt buộc</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Đã nhận diện
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
