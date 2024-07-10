import { toastDurationMS } from "../tailwind.config";

/** Tries to open the modal
 * @param {string} modalId - The ID of the modal to be opened, must be ID of HTMLDialogElement
 * @returns true if such modal exists in doc and was opened, false otherwise
 *
 * REQUIRES "use client"
*/
export function openModal(modalId: modalTypes): boolean {
  const modal = document.getElementById(modalId);
  if (modal instanceof HTMLDialogElement) {
    modal.showModal();
    return true;
  }
  return false;
}

export type modalTypes = "share_link_modal" | "create_retro_modal" | "confirm_modal" | "welcome_modal";

export const getSuccessfulNotification = (message: string) => {
  const toast = document.createElement("div");
  toast.className = "toast toast-center animate-slide-in-out-bottom";
  toast.innerHTML = `
    <div class="alert alert-success gap-0">
      ${message}
    </div>
  `;
  return toast;
};

export const getErrorNotification = (message: string) => {
  const toast = document.createElement("div");
  toast.className = "toast toast-center animate-slide-in-out-bottom";
  toast.innerHTML = `
    <div class="alert alert-error gap-0">
      ${message}
    </div>
  `;
  return toast;
};

export const notify = (notificationType: "successful" | "error", message: string, elementToAppend: HTMLElement | null) => {
  const mapType = {
    "successful": getSuccessfulNotification,
    "error": getErrorNotification,
  };

  const toast = mapType[notificationType](message);
  if (elementToAppend) {
    elementToAppend.appendChild(toast);
    setTimeout(() => {
      elementToAppend.removeChild(toast);
    }, toastDurationMS);
  }
};
