"use client";
import { memo, useState } from "react";
import { KeyRound, LogOut, UserRound } from "lucide-react";
import DropdownMenu from "@/libs/core/components/ui/DropdownMenu";
import { Image } from "@/libs/core/components/ui/Image";
import userAvatar from "@/libs/tts/assets/user.png";
import ChangePasswordModal from "../../auth/change-password/ChangePasswordModal";
import { useLogout, useGetMe } from "@/libs/tts/hooks/useAuth";

function ProfileMenu() {
  const [dropDownOpen, setDropDownOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const { data } = useGetMe();
  const account = data?.data;

  const logoutMutation = useLogout();

  const handleLogout = () => {
    setDropDownOpen(false);
    logoutMutation.mutate();
  };

  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDropDownOpen((prev) => !prev);
  };

  const menuItems = [
    {
      label: "Thông tin tài khoản",
      icon: <UserRound size={20} />,
      href: `/account`,
    },
    {
      label: "Đổi mật khẩu",
      icon: <KeyRound size={20} />,
      onClick: () => {
        setDropDownOpen(false);
        setModalOpen(true);
      },
    },
    {
      label: "Đăng xuất",
      icon: <LogOut size={20} />,
      onClick: handleLogout,
      textColor: "text-error",
    },
  ];

  if (!account) {
    return null;
  }

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setDropDownOpen(true)}
        onMouseLeave={() => setDropDownOpen(false)}
      >
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={handleToggleDropdown}
        >
          <div className="relative w-[45px] h-[45px] p-1 rounded-full border border-border overflow-hidden">
            <Image
              src={
                account?.avatarUrl
                  ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${account?.avatarUrl}`
                  : userAvatar
              }
              alt="user"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
          </div>
          <p>{account?.fullname}</p>
        </div>

        {dropDownOpen && <DropdownMenu items={menuItems} vertical="bottom" />}
      </div>

      {modalOpen && <ChangePasswordModal onClose={() => setModalOpen(false)} />}
    </>
  );
}

export default memo(ProfileMenu);
