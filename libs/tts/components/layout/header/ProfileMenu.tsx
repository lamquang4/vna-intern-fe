"use client";
import { memo, useState } from "react";
import { KeyRound, LogOut, UserRound } from "lucide-react";
import DropdownMenu from "@/libs/core/components/ui/DropdownMenu";
import { Image } from "@/libs/core/components/ui/Image";
import userAvatar from "@/libs/tts/assets/user.png";
import ChangePasswordModal from "../../change-password/ChangePasswordModal";

function ProfileMenu() {
  const [dropDownOpen, setDropDownOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDropDownOpen((prev) => !prev);
  };

  const account = {
    username: "Quang Lam",
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
      onClick: () => {},
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
          <div className="w-[40px] h-[40px] p-1 rounded-full border border-border overflow-hidden">
            <Image
              src={userAvatar}
              alt="user"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
          <p>{account.username}</p>
        </div>

        {dropDownOpen && <DropdownMenu items={menuItems} vertical="bottom" />}
      </div>

      {modalOpen && <ChangePasswordModal onClose={() => setModalOpen(false)} />}
    </>
  );
}

export default memo(ProfileMenu);
