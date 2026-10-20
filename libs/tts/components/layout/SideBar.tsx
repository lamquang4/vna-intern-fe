import { memo, useState, type ReactNode } from "react";
import { Overlay } from "@/libs/core/components/ui/Overlay";
import { ChevronDown, ChevronUp, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/libs/core/components/ui/Button";
import { Image } from "@/libs/core/components/ui/Image";
import { usePathname } from "next/navigation";
import logo from "@/libs/tts/assets/logo.png";
import { twMerge } from "tailwind-merge";

interface Props {
  menuOpen: boolean;
  onToggleMenu: () => void;
}

interface MenuChild {
  label: string;
  path: string;
}

interface MenuItemBase {
  icon: ReactNode;
  label: string;
}

interface MenuItemWithChildren extends MenuItemBase {
  key: string;
  children: MenuChild[];
  path?: never;
}

interface MenuItemSingle extends MenuItemBase {
  path: string;
  children?: never;
  key?: never;
}

type MenuItem = MenuItemWithChildren | MenuItemSingle;

interface MenuGroup {
  title?: string;
  items: MenuItem[];
}

const menuData: MenuGroup[] = [
  {
    items: [
      {
        icon: <Settings size={20} />,
        label: "Hệ thống",
        key: "1a",
        children: [
          { label: "Tài khoản", path: "/" },
          { label: "Quản lý doanh nghiệp", path: "/" },
          { label: "Ký báo cáo", path: "/" },
        ],
      },
      {
        icon: <Settings size={20} />,
        label: "Tai nạn lao động",
        key: "2a",
        children: [
          { label: "Danh mục chung", path: "/" },
          { label: "TNLĐ theo HĐLĐ", path: "/" },
        ],
      },
    ],
  },
];

function SideBar({ menuOpen, onToggleMenu }: Props) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleOpen = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  return (
    <>
      <aside
        className={twMerge(
          "fixed top-0 left-0 z-[55] h-screen w-[280px]",
          "transition-transform duration-280 ease-in-out",
          "xl:sticky xl:top-0 xl:z-auto xl:translate-x-0",
          "xl:shrink-0 xl:overflow-hidden xl:transition-[width]",
          menuOpen ? "translate-x-0" : "-translate-x-full",
          menuOpen ? "xl:w-0" : "xl:w-[280px]",
        )}
      >
        <nav className="custom-scroll h-full w-[280px] overflow-y-auto bg-sidebar pb-5 text-sidebar-foreground">
          <div className="mb-[20px] flex items-center gap-[15px] justify-center sticky top-0 py-4.5 px-3.5">
            <Image src={logo} alt="logo" className="w-[45px]" loading="eager" />

            <p className="font-medium text-center">
              Ủy ban nhân dân thành phố <br></br> Hồ Chí Minh
            </p>
          </div>

          <ul className="flex flex-col gap-[15px] font-normal px-3.5">
            {menuData.map((group, groupIndex) => (
              <div key={groupIndex} className="flex flex-col gap-[10px]">
                <p className="uppercase">{group.title}</p>
                {group.items.map((item, index) => (
                  <li key={index}>
                    {item.children ? (
                      <>
                        <div
                          onClick={() => toggleOpen(item.key)}
                          className={`${
                            openMenus[item.key] ||
                            item.children.some(
                              (child) => pathname === child.path,
                            )
                              ? ""
                              : ""
                          } rounded-lg py-3 w-full cursor-pointer flex justify-between items-center`}
                        >
                          <p className="flex items-center gap-[10px]">
                            {item.icon} {item.label}
                          </p>
                          <Button>
                            {openMenus[item.key] ||
                            item.children.some(
                              (child) => pathname === child.path,
                            ) ? (
                              <ChevronDown size={18} />
                            ) : (
                              <ChevronUp size={18} />
                            )}
                          </Button>
                        </div>
                        <ul
                          className={`max-h-0 overflow-hidden invisible transition-all duration-600 ease-in-out pl-[25px] ${
                            openMenus[item.key] ||
                            item.children.some(
                              (child) => pathname === child.path,
                            )
                              ? "max-h-fit visible"
                              : ""
                          }`}
                        >
                          {item.children.map((child, childIndex) => (
                            <li
                              key={childIndex}
                              className={`rounded-lg w-full cursor-pointer my-[5px] ${
                                pathname === child.path ? "" : " "
                              }`}
                            >
                              <Link href={child.path} className="py-3">
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <Link
                        href={item.path}
                        className={`${
                          pathname === item.path ? "text-white  " : " "
                        } rounded-lg p-3 w-full cursor-pointer flex justify-between items-center`}
                      >
                        <p className="flex items-center gap-[10px]">
                          {item.icon} {item.label}
                        </p>
                      </Link>
                    )}
                  </li>
                ))}
              </div>
            ))}
          </ul>
        </nav>
      </aside>

      {menuOpen && <Overlay className="xl:hidden" onClose={onToggleMenu} />}
    </>
  );
}

export default memo(SideBar);
