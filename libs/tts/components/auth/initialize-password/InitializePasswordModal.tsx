import { Modal } from "@/libs/core/components/ui/Modal";
import InitializePasswordForm from "./InitializePasswordForm";

interface Props {
  onClose: () => void;
  username: string;
}

function InitializePasswordModal({ onClose, username }: Props) {
  return (
    <Modal
      title="Khởi tạo mật khẩu"
      onClose={onClose}
      className="max-w-[420px]"
      headerClassName="bg-primary text-white uppercase"
    >
      <InitializePasswordForm onClose={onClose} username={username} />
    </Modal>
  );
}

export default InitializePasswordModal;
