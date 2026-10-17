"use client";
import { Menu } from "lucide-react";
import ProfileMenu from "./ProfileMenu";
import { Button } from "@/libs/core/components/ui/Button";

interface Props {
  onToggleMenu: () => void;
}

function Header({ onToggleMenu }: Props) {
  return (
    <header className="sticky top-0 z-10 flex w-full bg-white border-border items-center border-b">
      <div className="w-full flex justify-between items-center sm:px-[20px] py-3.5 px-[15px]">
        <Button
          onClick={onToggleMenu}
          className="w-8.5 h-8.5 rounded-lg border border-border justify-center items-center flex"
        >
          <Menu size={18} />
        </Button>

        <ProfileMenu />
      </div>
    </header>
  );
}

export default Header;
