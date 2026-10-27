import { Modal } from "@/libs/core/components/ui/Modal";
import UserFilterForm from "./UserFilterForm";

interface Props {
  onClose: () => void;
}

function UserFilterModal({ onClose }: Props) {
  return (
    <Modal
      title="Bộ lọc"
      headerClassName="uppercase border border-border"
      onClose={onClose}
      className="max-w-[520px]"
    >
      <UserFilterForm onClose={onClose} />
    </Modal>
  );
}

export default UserFilterModal;
