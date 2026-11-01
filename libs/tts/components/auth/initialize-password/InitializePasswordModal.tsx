import { Modal } from "@/libs/core/components/ui/Modal";
import InitializePasswordForm from "./InitializePasswordForm";

interface Props {
  onClose: () => void;
  username: string;
  userId: string;
}

function InitializePasswordModal({ onClose, username, userId }: Props) {
  return (
    <Modal
      title="Khởi tạo mật khẩu"
      onClose={onClose}
      className="max-w-[420px]"
      headerClassName="bg-primary text-white uppercase"
    >
      <InitializePasswordForm
        onClose={onClose}
        username={username}
        userId={userId}
      />
    </Modal>
  );
}

export default InitializePasswordModal;
