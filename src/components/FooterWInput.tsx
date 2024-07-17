import { forwardRef, memo } from "react";
import { openModal } from "@/helpers";

interface FooterWInputProps {
  options: string[];
  selectedOption: string;
  onSelectChange: React.ChangeEventHandler<HTMLSelectElement>;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  buttonTag: string;
  isAuthor: boolean;
}

const FooterWInput = forwardRef<HTMLInputElement, FooterWInputProps>(({
  options,
  selectedOption,
  onSelectChange,
  message,
  setMessage,
  handleSubmit,
  buttonTag,
  isAuthor,
}, ref) => {

  return (
    <div className="flex py-4 justify-between">
      <select
        className="select select-bordered w-1/4 flex-grow"
        onChange={onSelectChange}
        value={selectedOption}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
      <form
        className="flex w-full"
        onSubmit={handleSubmit}
      >
        <input
          ref={ref}
          type="text"
          className="input input-bordered w-1/2 mx-4 flex-grow"
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary w-1/8 mr-4 flex-grow"
          disabled={message.length === 0}
        >
          Submit
        </button>
      </form>
      <button className="btn btn-primary w-1/8 flex-grow" disabled={!isAuthor} onClick={() => openModal("confirm_modal")}>
        {buttonTag}
      </button>
    </div>
  );
});
FooterWInput.displayName = "FooterWInput";

export default memo(FooterWInput);
