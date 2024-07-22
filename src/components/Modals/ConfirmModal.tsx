"use client";
import { memo } from "react";

interface ModalProps {
  message: string;
  onConfirm: () => void;
  loading?: boolean;
}

const ConfirmModal: React.FC<ModalProps> = ({ message, onConfirm, loading }) => {

  return (
    <dialog id="confirm_modal" className="modal">
      <div className="modal-box">
        <div className="py-2 text-center">{message}</div>
        <div className="modal-action justify-between">
          <button className="btn btn-success" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="loading loading-spinner"></span> : "Yes"}
          </button>
          <form method="dialog">
            <button className="btn btn-error" disabled={loading}>No</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default memo(ConfirmModal);
