import { Modal } from "@/libs/core/components/ui/Modal";
import ChangeEmailForm from "./ChangeEmailForm";

interface Props {
  onClose: () => void;
  email: string;
  roleCode: string;
}

function ChangeEmailModal({ onClose, email, roleCode }: Props) {
  return (
    <Modal
      title="Thay đổi email"
      onClose={onClose}
      className="max-w-[420px]"
      headerClassName="uppercase"
    >
      <ChangeEmailForm onClose={onClose} email={email} roleCode={roleCode} />
    </Modal>
  );
}

export default ChangeEmailModal;
