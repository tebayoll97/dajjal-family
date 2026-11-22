import { Button } from "./Button";
import { Dialog } from "./Dialog";
export function ConfirmDialog({ open, onClose, onConfirm, title, description, children, confirmLabel = "Confirm", cancelLabel = "Cancel", confirmVariant = "danger", loading = false, className = "" }) {
  return <Dialog open={open} onClose={onClose} title={title} description={description} closeOnBackdrop={false} closeLabel={cancelLabel} className={className} actions={<><Button variant="secondary" disabled={loading} onClick={onClose}>{cancelLabel}</Button><Button variant={confirmVariant} loading={loading} onClick={onConfirm}>{confirmLabel}</Button></>}>{children}</Dialog>;
}
