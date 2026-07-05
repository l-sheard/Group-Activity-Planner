export default function Modal({ open, onClose, children, maxWidth = "460px" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-[rgba(58,47,42,.35)] flex items-center justify-center z-[100] p-5" onClick={onClose}>
      <div
        className="bg-surface rounded-lg shadow-card w-full p-7 max-h-[calc(100vh-40px)] overflow-y-auto"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
