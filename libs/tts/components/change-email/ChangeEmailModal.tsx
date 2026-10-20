import { Modal } from "@/libs/core/components/ui/Modal";
import ChangeEmailForm from "../change-email/ChangeEmailForm";

interface Props {
  onClose: () => void;
}

function ChangeEmailModal({ onClose }: Props) {
  return (
    <Modal
      title="Thay đổi email"
      onClose={onClose}
      className="max-w-[420px]"
      headerClassName="uppercase text-primary"
    >
      <ChangeEmailForm onClose={onClose} />
    </Modal>
  );
}

export default ChangeEmailModal;
