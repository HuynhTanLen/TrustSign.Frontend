"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Award, ShieldOff, Download, ShieldCheck, Search } from "lucide-react";

interface CertItem {
  serial: string;
  subjectName: string;
  subjectEmail: string;
  tenantName: string;
  validFrom: string;
  validTo: string;
  revoked: boolean;
  revokeReason?: string;
}

export default function AdminCertificatesPage() {
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");

  const [certs, setCerts] = React.useState<CertItem[]>([
    {
      serial: "5F:2A:90:E4:11:B2",
      subjectName: "CN=Nguyễn Văn An, O=CTCP Giải pháp Chữ Tín",
      subjectEmail: "an.nguyen@trustsign.vn",
      tenantName: "CTCP Giải pháp Chữ Tín",
      validFrom: "18/10/2026",
      validTo: "18/10/2027",
      revoked: false,
    },
    {
      serial: "8C:41:03:D9:77:A0",
      subjectName: "CN=Trần Bình Minh, O=Công ty TNHH Công nghệ ABC",
      subjectEmail: "minh.tb@congngheabc.com",
      tenantName: "Phiên ký công khai (OTP)",
      validFrom: "23/10/2026",
      validTo: "23/10/2027",
      revoked: false,
    },
    {
      serial: "3B:99:18:C2:04:F1",
      subjectName: "CN=Trần Thị Mai, O=CTCP Giải pháp Chữ Tín",
      subjectEmail: "mai.tran@trustsign.vn",
      tenantName: "CTCP Giải pháp Chữ Tín",
      validFrom: "20/10/2026",
      validTo: "20/10/2027",
      revoked: false,
    },
    {
      serial: "1A:08:77:E1:55:C9",
      subjectName: "CN=Phạm Quốc Hưng, O=Công ty TNHH Đầu tư Ánh Dương",
      subjectEmail: "hung.pq@anhduonginvest.vn",
      tenantName: "Công ty TNHH Đầu tư Ánh Dương",
      validFrom: "01/09/2026",
      validTo: "01/09/2027",
      revoked: true,
      revokeReason: "KeyCompromise (Lộ khóa cá nhân / Thu hồi vào CRL)",
    },
  ]);

  const filtered = certs.filter(
    (c) =>
      !query.trim() ||
      c.serial.toLowerCase().includes(query.toLowerCase()) ||
      c.subjectName.toLowerCase().includes(query.toLowerCase()) ||
      c.subjectEmail.toLowerCase().includes(query.toLowerCase())
  );

  const handleRevoke = (c: CertItem) => {
    const reason = prompt(
      `Nhập lý do thu hồi chứng thư số Serial [${c.serial}] để cập nhật vào danh sách CRL:`,
      "CessationOfOperation (Ngừng sử dụng)"
    );
    if (!reason) return;
    setCerts((prev) =>
      prev.map((item) =>
        item.serial === c.serial
          ? { ...item, revoked: true, revokeReason: reason }
          : item
      )
    );
    toast(`Đã thu hồi chứng thư số ${c.serial} và cập nhật CRL`, "info");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Quản lý Chứng thư số PKI & CRL (FE-08)
          </h1>
          <p className="text-sm text-muted mt-1">
            Giám sát danh sách chứng thư số X.509 do TrustSign Issuing CA cấp phát và thực hiện thu hồi (Revoke)
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={() => toast("Đang tải chứng thư gốc TrustSign-Root-CA.cer", "info")}
        >
          <Download className="w-4 h-4" />
          <span>Tải Root CA (.cer)</span>
        </Button>
      </div>

      {/* CA Info Banner */}
      <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Hạ tầng PKI Nội bộ: TrustSign Root CA G1 → TrustSign Issuing CA v1
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 font-mono">
              Thuật toán: RSA-2048 / SHA256withRSA • Chuẩn đóng dấu: PAdES-B-T (ETSI EN 319 142)
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
          <ShieldCheck className="w-4 h-4" /> HSM / KeyStore Hoạt động tốt
        </span>
      </div>

      {/* Search */}
      <div className="p-5 bg-surface border border-line rounded-2xl shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Tìm theo số Serial, tên người được cấp hoặc email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 border border-slate-300 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-line rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-line text-xs uppercase tracking-wider font-semibold text-slate-500 h-12">
                <th className="px-6">Chủ thể được cấp (Subject DN)</th>
                <th className="px-6">Số Serial</th>
                <th className="px-6">Hiệu lực</th>
                <th className="px-6">Trạng thái CRL</th>
                <th className="px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {filtered.map((c) => (
                <tr key={c.serial} className="h-[68px] hover:bg-slate-50/80 transition">
                  <td className="px-6">
                    <p className="font-bold text-slate-900">{c.subjectName}</p>
                    <p className="text-xs text-slate-500">{c.subjectEmail} • {c.tenantName}</p>
                    {c.revokeReason && (
                      <p className="text-xs text-danger mt-0.5">Lý do thu hồi: {c.revokeReason}</p>
                    )}
                  </td>
                  <td className="px-6 font-mono font-semibold text-slate-700">{c.serial}</td>
                  <td className="px-6 text-slate-600 text-xs">
                    {c.validFrom} → {c.validTo}
                  </td>
                  <td className="px-6">
                    {c.revoked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-danger border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-danger" /> Đã thu hồi (Revoked)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Còn hiệu lực
                      </span>
                    )}
                  </td>
                  <td className="px-6 text-right">
                    {!c.revoked && (
                      <Button variant="danger" size="sm" onClick={() => handleRevoke(c)}>
                        <ShieldOff className="w-4 h-4" />
                        <span>Thu hồi (Revoke)</span>
                      </Button>
                    )}
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
