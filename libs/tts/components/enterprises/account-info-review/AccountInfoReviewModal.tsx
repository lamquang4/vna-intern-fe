import { Modal } from "@/libs/core/components/ui/Modal";
import AccountInfoReview from "./AccountInfoReview";

interface Props {
  taxCode: string;
  onClose: () => void;
}

function AccountInfoReviewModal({ taxCode, onClose }: Props) {
  return (
    <Modal
      onClose={onClose}
      title="Thông tin tài khoản"
      headerClassName="uppercase bg-primary text-white"
      className="max-w-[400px]"
    >
      <AccountInfoReview taxCode={taxCode} onClose={onClose} />
    </Modal>
  );
}

export default AccountInfoReviewModal;
