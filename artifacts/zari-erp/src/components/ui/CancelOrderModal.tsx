import { useState } from "react";
import { XCircle } from "lucide-react";

interface CancelOrderModalProps {
  open: boolean;
  orderCode?: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export default function CancelOrderModal({ open, orderCode, onConfirm, onCancel }: CancelOrderModalProps) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  function handleConfirm() {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason("");
  }

  function handleClose() {
    setReason("");
    onCancel();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="p-2 rounded-xl bg-orange-50">
            <XCircle className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Cancel Order</h2>
            {orderCode && <p className="text-xs text-gray-400 mt-0.5">{orderCode}</p>}
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600">
            This order will be permanently marked as <span className="font-semibold text-orange-600">Cancelled</span> and cannot be reactivated.
          </p>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Client requested cancellation, Design not approved…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 resize-none transition"
              value={reason}
              onChange={e => setReason(e.target.value)}
              autoFocus
            />
            {reason.trim() === "" && (
              <p className="text-xs text-gray-400 mt-1">A reason is required to cancel.</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors">
            Keep Order
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
}
