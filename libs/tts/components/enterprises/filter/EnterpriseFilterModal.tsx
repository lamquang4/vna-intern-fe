import { Modal } from "@/libs/core/components/ui/Modal";
import EnterpriseFilterForm from "./EnterpriseFilterForm";

interface Props {
  onClose: () => void;
}

function EnterpriseFilterModal({ onClose }: Props) {
  return (
    <Modal
      title="Bộ lọc"
      headerClassName="uppercase border border-border"
      onClose={onClose}
      className="max-w-[600px]"
    >
      <EnterpriseFilterForm onClose={onClose} />
    </Modal>
  );
}

export default EnterpriseFilterModal;
