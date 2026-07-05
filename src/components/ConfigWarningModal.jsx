import Modal from "./Modal";
import { btnPrimary } from "../lib/ui";

export default function ConfigWarningModal({ open, onDismiss }) {
  return (
    <Modal open={open} onClose={onDismiss}>
      <h1 className="m-0 mb-1.5 text-[22px] font-bold tracking-tight">One-time setup needed</h1>
      <p className="text-muted m-0 mb-4">
        This app uses Firebase for shared data. Copy <code>.env.example</code> to <code>.env.local</code> and fill in
        your Firebase project's values. The <code>README.md</code> walks through it.
      </p>
      <button className={btnPrimary} onClick={onDismiss}>
        Got it
      </button>
    </Modal>
  );
}
