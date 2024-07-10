import { memo } from "react";

interface ModalProps {
  body: React.ReactNode;
  title: string;
}

const WelcomeModal: React.FC<ModalProps> = ({ body, title }) => {
  const handleClose = () => {
    const modal = document.getElementById("welcome_modal");
    if (modal) {
      modal.classList.remove("modal-open");
    }
  };

  return (
    <dialog id="welcome_modal" className="modal modal-top modal-open">
      <div className="modal-box">
        <div className="w-1/2 mx-auto">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2 inline-block border-b-2 border-current">{title}</h2>
          <div className="py-4">{body}</div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-primary btn-outline" onClick={handleClose}>Got it!</button>
            </form>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default memo(WelcomeModal);
