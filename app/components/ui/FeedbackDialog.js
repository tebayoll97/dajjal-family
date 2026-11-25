"use client";
import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { Badge } from "./Badge";

/** Shared, dismissible feedback for completed or failed user actions. */
export function FeedbackDialog({ open, onClose, title, message, variant = "success", closeLabel = "Close" }) {
  const safeVariant = ["success", "danger", "warning", "info"].includes(variant) ? variant : "info";
  return <Dialog open={Boolean(open)} onClose={onClose} title={title} closeLabel={closeLabel} closeOnBackdrop={false}
    actions={<Button onClick={onClose}>{closeLabel}</Button>}>
    <div className="ui-feedback-dialog">
      <Badge variant={safeVariant}>{safeVariant === "success" ? "SUCCESS" : safeVariant.toUpperCase()}</Badge>
      <p className="ui-text-body">{message}</p>
    </div>
  </Dialog>;
}
