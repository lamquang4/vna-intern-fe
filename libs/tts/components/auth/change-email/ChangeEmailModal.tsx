import { Modal } from "@/libs/core/components/ui/Modal";
import ChangeEmailForm from "./ChangeEmailForm";

interface Props {
  onClose: () => void;
  email: string;
}

function ChangeEmailModal({ onClose, email }: Props) {
  return (
    <Modal
      title="Thay đổi email"
      onClose={onClose}
      className="max-w-[420px]"
      headerClassName="uppercase bg-primary text-white"
    >
      <ChangeEmailForm onClose={onClose} email={email} />
    </Modal>
  );
}

export default ChangeEmailModal;
