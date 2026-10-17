"use client";
import { Button } from "@/libs/core/components/ui/Button";
import DropdownMenu from "@/libs/core/components/ui/DropdownMenu";
import { Input } from "@/libs/core/components/ui/Input";
import { Label } from "@/libs/core/components/ui/Label";
import { KeyRound, LogOut, User } from "lucide-react";
import toast from "react-hot-toast";

export default function Home() {
  const handleChange = () => {
    toast.success("Thành công");
    toast.error("Thất bại");
  };
  return (
    <div>
      <DropdownMenu
        vertical="top"
        horizontal="left"
        items={[
          {
            label: "Thông tin tài khoản",
            icon: <User size={16} />,
            href: "/profile",
          },
          {
            label: "Đổi mật khẩu",
            icon: <KeyRound size={16} />,
            onClick: handleChange,
            disabled: true,
          },
          {
            label: "Đăng xuất",
            icon: <LogOut size={16} />,
            onClick: handleChange,
            textColor: "text-red-500",
          },
        ]}
      />

      <Label required>test</Label>
      <Input placeholder="hello" />
      <Button onClick={handleChange} variant="primary">
        Cập nhật
      </Button>
    </div>
  );
}
