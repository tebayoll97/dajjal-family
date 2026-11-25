"use client";
import { useLanguage } from "../LanguageProvider";
import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { Badge } from "./Badge";

const statusLabels = {
  id: { success: "BERHASIL", danger: "GAGAL", warning: "PERHATIAN", info: "INFORMASI" },
  en: { success: "SUCCESS", danger: "FAILED", warning: "ATTENTION", info: "INFORMATION" },
};

/** Shared, dismissible feedback for completed or failed user actions. */
export function FeedbackDialog({ open, onClose, title, message, variant = "success", closeLabel = "Close" }) {
  const { language } = useLanguage();
  const safeVariant = ["success", "danger", "warning", "info"].includes(variant) ? variant : "info";
  const labels = statusLabels[language === "id" ? "id" : "en"];
  return <Dialog open={Boolean(open)} onClose={onClose} title={title} closeLabel={closeLabel} closeOnBackdrop={false}
    actions={<Button onClick={onClose}>{closeLabel}</Button>}>
    <div className="ui-feedback-dialog">
      <Badge variant={safeVariant}>{labels[safeVariant]}</Badge>
      <p className="ui-text-body">{message}</p>
    </div>
  </Dialog>;
}
