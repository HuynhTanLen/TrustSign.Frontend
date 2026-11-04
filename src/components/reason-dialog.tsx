"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

/** Hộp thoại xác nhận yêu cầu nhập lý do bắt buộc (khóa, thu hồi, từ chối ký). */
export function ReasonDialog({
  open,
  title,
  message,
  confirmLabel,
  reasonLabel = "Lý do",
  danger = true,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  reasonLabel?: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const formId = React.useId();
  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    setReason("");
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm(trimmed);
      setReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      preventClose={isSubmitting}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            form={formId}
            variant={danger ? "danger" : "primary"}
            isLoading={isSubmitting}
            disabled={!reason.trim()}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="flex flex-col gap-4">
        <p className="text-sm text-fg">{message}</p>
        <Input
          data-autofocus
          label={reasonLabel}
          required
          disabled={isSubmitting}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </form>
    </Dialog>
  );
}
