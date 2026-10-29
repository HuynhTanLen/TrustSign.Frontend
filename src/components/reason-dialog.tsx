"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

/** Confirmation that requires a written reason (lock, revoke, decline). */
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
  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" form="reason-form" variant={danger ? "danger" : "primary"} isLoading={isSubmitting} disabled={!reason.trim()}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <form id="reason-form" onSubmit={submit} className="flex flex-col gap-4">
        <p className="text-sm text-fg">{message}</p>
        <Input label={reasonLabel} required value={reason} onChange={(e) => setReason(e.target.value)} />
      </form>
    </Dialog>
  );
}
