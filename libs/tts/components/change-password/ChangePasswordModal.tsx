import { Modal } from "@/libs/core/components/ui/Modal";
import ChangePasswordForm from "../change-password/ChangePasswordForm";

interface Props {
  onClose: () => void;
}

function ChangePasswordModal({ onClose }: Props) {
  return (
    <Modal
      title="Đổi mật khẩu"
      onClose={onClose}
      className="max-w-[420px]"
      headerClassName="bg-primary text-white"
    >
      <ChangePasswordForm onClose={onClose} />
    </Modal>
  );
}

export default ChangePasswordModal;
