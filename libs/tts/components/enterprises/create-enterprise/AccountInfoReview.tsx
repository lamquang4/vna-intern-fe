import { Button } from "@/libs/core/components/ui/Button";

interface Props {
  taxCode: string;
  onClose: () => void;
}

function AccountInfoReview({ taxCode, onClose }: Props) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex min-w-0 gap-1.5">
            <span>Tên tài khoản:</span>
            <span className="break-words font-medium">{taxCode}</span>
          </div>

          <div className="flex min-w-0 gap-1.5">
            <span>Mật khẩu:</span>
            <span className="break-words font-medium">12345678</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={onClose}
            className="rounded-lg px-3.5 py-2 font-medium bg-primary text-white"
          >
            Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AccountInfoReview;
