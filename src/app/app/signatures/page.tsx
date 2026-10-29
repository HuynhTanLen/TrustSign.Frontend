"use client";

import * as React from "react";
import { ImageIcon, PenTool, Plus, Star, Trash2 } from "lucide-react";
import { signaturesApi, type SavedSignature, type SignatureKind } from "@/lib/api/signatures";
import { ApiError } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { SignaturePad, SIGNATURE_CANVAS } from "@/components/signature-pad";
import { useToast } from "@/components/ui/toast";

const KIND_LABELS: Record<SignatureKind, string> = { Draw: "Vẽ tay", Type: "Gõ tên", Upload: "Ảnh chụp" };
const INKS = [
  { value: "#1f2328", label: "Đen" },
  { value: "#1b3a5c", label: "Xanh" },
];
const TYPE_FONTS = ['"Segoe Script", cursive', '"Brush Script MT", cursive', 'Georgia, serif', '"Segoe UI", sans-serif'];
const { width: CANVAS_W, height: CANVAS_H } = SIGNATURE_CANVAS;

function renderTyped(text: string, font: string, ink: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = ink;
  ctx.font = `56px ${font}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2, CANVAS_W - 40);
  return canvas.toDataURL("image/png");
}

function AddSignatureDialog({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: (s: SavedSignature) => void }) {
  const { toast } = useToast();
  const [tab, setTab] = React.useState<"Draw" | "Type" | "Upload">("Draw");
  const [label, setLabel] = React.useState("");
  const [ink, setInk] = React.useState(INKS[0].value);
  const [drawn, setDrawn] = React.useState<string | null>(null);
  const [typed, setTyped] = React.useState("");
  const [font, setFont] = React.useState(TYPE_FONTS[0]);
  const [isSaving, setIsSaving] = React.useState(false);

  const canSave = label.trim() !== "" && ((tab === "Draw" && drawn) || (tab === "Type" && typed.trim()));

  const save = async () => {
    const png = tab === "Draw" ? drawn : renderTyped(typed.trim(), font, ink);
    if (!png) return;
    setIsSaving(true);
    try {
      onSaved(await signaturesApi.create(label.trim(), tab, png));
      toast("Đã lưu chữ ký.", "success");
      onClose();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không lưu được chữ ký.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Thêm chữ ký"
      className="max-w-[640px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button variant="primary" onClick={save} disabled={!canSave} isLoading={isSaving}>
            Lưu chữ ký
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Tên gọi" required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Chữ ký đầy đủ" />
        <Tabs
          tabs={[
            { id: "Draw", label: "Vẽ tay" },
            { id: "Type", label: "Gõ tên" },
            { id: "Upload", label: "Tải ảnh" },
          ]}
          value={tab}
          onChange={(id) => setTab(id as typeof tab)}
        />
        {tab !== "Upload" && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted">Màu mực</span>
            {INKS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setInk(c.value)}
                aria-pressed={ink === c.value}
                className={`inline-flex items-center gap-1.5 h-8 px-2 rounded-md border text-sm ${
                  ink === c.value ? "border-primary bg-selected" : "border-line hover:bg-page"
                }`}
              >
                <span className="w-3 h-3 rounded-full" style={{ background: c.value }} aria-hidden="true" />
                {c.label}
              </button>
            ))}
          </div>
        )}

        <div key={tab} className="motion-safe:animate-fade-in">
          {tab === "Draw" && <SignaturePad ink={ink} onChange={setDrawn} />}
          {tab === "Type" && (
            <div className="flex flex-col gap-3">
              <Input label="Họ và tên" value={typed} onChange={(e) => setTyped(e.target.value)} />
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Kiểu chữ">
                {TYPE_FONTS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={font === f}
                    onClick={() => setFont(f)}
                    className={`h-16 px-3 rounded-md border transparent-checkerboard text-2xl truncate ${
                      font === f ? "border-primary shadow-[inset_0_0_0_1px_var(--color-primary)]" : "border-line"
                    }`}
                    style={{ fontFamily: f, color: ink }}
                  >
                    {typed || "Họ và tên"}
                  </button>
                ))}
              </div>
            </div>
          )}
          {tab === "Upload" && (
            <div className="flex flex-col items-center gap-1 p-8 rounded-md border border-dashed border-line-strong bg-page text-center">
              <ImageIcon className="w-6 h-6 text-muted" aria-hidden="true" />
              <p className="text-sm font-semibold text-fg">Tách chữ ký từ ảnh chụp chưa có</p>
              <p className="text-sm text-muted">Chức năng này (FE-10) sẽ tách nền ảnh ngay trên trình duyệt. Hiện dùng Vẽ tay hoặc Gõ tên.</p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}

export default function SignaturesPage() {
  const { toast } = useToast();
  const { data, error, isLoading, reload, mutate } = useApi("signatures", signaturesApi.list);
  const [adding, setAdding] = React.useState(false);
  const [removing, setRemoving] = React.useState<SavedSignature | null>(null);

  const setDefault = async (s: SavedSignature) => {
    try {
      await signaturesApi.setDefault(s.id);
      mutate((list) => list.map((x) => ({ ...x, isDefault: x.id === s.id })));
      toast(`Đã đặt "${s.label}" làm chữ ký mặc định.`, "success");
    } catch {
      toast("Không đổi được chữ ký mặc định.", "error");
    }
  };

  const remove = async () => {
    if (!removing) return;
    try {
      await signaturesApi.remove(removing.id);
      mutate((list) => list.filter((x) => x.id !== removing.id));
      toast("Đã xóa chữ ký.", "success");
    } catch {
      toast("Không xóa được chữ ký.", "error");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Chữ ký của tôi"
        description="Chữ ký đã lưu dùng lại khi ký hợp đồng; lưu dạng PNG nền trong suốt"
        actions={
          <Button variant="primary" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            Thêm chữ ký
          </Button>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((s) => (
            <Card
              key={s.id}
              title={s.label}
              icon={PenTool}
              className={`motion-safe:animate-fade-up ${s.isDefault ? "border-primary" : ""}`}
              actions={
                s.isDefault ? (
                  <span className="inline-flex items-center gap-1 h-[22px] px-2 rounded-sm bg-primary text-white text-xs font-semibold">
                    <Star className="w-3 h-3" aria-hidden="true" />
                    Mặc định
                  </span>
                ) : undefined
              }
              bodyClassName="p-0"
            >
              <div className="h-32 m-4 rounded-md border border-line transparent-checkerboard flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.imageUrl} alt={`Chữ ký ${s.label}`} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex items-center justify-between gap-2 px-4 h-12 border-t border-line text-sm">
                <span className="text-muted">
                  {KIND_LABELS[s.kind]} · {formatDate(s.createdAt)}
                </span>
                <div className="flex gap-1">
                  {!s.isDefault && (
                    <Button variant="ghost" onClick={() => setDefault(s)}>
                      Đặt mặc định
                    </Button>
                  )}
                  <Button variant="ghost" aria-label={`Xóa chữ ký ${s.label}`} disabled={s.isDefault} onClick={() => setRemoving(s)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<PenTool />}
          title="Chưa có chữ ký nào"
          description="Thêm chữ ký để dùng lại khi ký hợp đồng thay vì vẽ lại mỗi lần."
          actionLabel="Thêm chữ ký"
          onAction={() => setAdding(true)}
        />
      )}

      {adding && (
        <AddSignatureDialog open onClose={() => setAdding(false)} onSaved={(s) => mutate((list) => [...list, s])} />
      )}

      <Dialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Xóa chữ ký"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              Không xóa
            </Button>
            <Button variant="danger" onClick={remove}>
              Xóa chữ ký
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg">Chữ ký &quot;{removing?.label}&quot; sẽ bị xóa khỏi tài khoản.</p>
      </Dialog>
    </div>
  );
}
