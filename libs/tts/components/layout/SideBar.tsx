import { memo, useState, type ReactNode } from "react";
import { Overlay } from "@/libs/core/components/ui/Overlay";
import {
  BuildingComplex,
  ChevronDown,
  ChevronUp,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/libs/core/components/ui/Button";
import { Image } from "@/libs/core/components/ui/Image";
import { usePathname } from "next/navigation";
import logo from "@/libs/tts/assets/logo.png";
import { twMerge } from "tailwind-merge";
import { useGetMe } from "../../hooks/useAuth";
import { RoleCode } from "@/libs/shared/tts/models/enums";

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

function SideBar({ menuOpen, onToggleMenu }: Props) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const { data } = useGetMe();
  const account = data?.data;

  const menuDataRoleAdmin: MenuGroup[] = [
    {
      title: "Hệ thống",
      items: [
        {
          icon: <UsersRound size={20} strokeWidth={2} />,
          label: "Người dùng",
          key: "1a",
          children: [
            { label: "Danh sách người dùng", path: "/users" },
            { label: "Thêm người dùng", path: "/users/create" },
          ],
        },
        {
          icon: <BuildingComplex size={20} strokeWidth={2} />,
          label: "Doanh nghiệp",
          key: "2a",
          children: [
            { label: "Danh sách doanh nghiệp", path: "/enterprises" },
            { label: "Thêm doanh nghiệp", path: "/enterprises/create" },
          ],
        },
      ],
    },
    {
      title: "Tai nạn lao động",
      items: [
        {
          icon: <BuildingComplex size={20} strokeWidth={2} />,
          label: "TNLĐ theo HĐLĐ",
          path: "/hd",
        },
      ],
    },
  ];

  const menuDataRoleEnterprise: MenuGroup[] = [
    {
      title: "Hệ thống",
      items: [
        {
          icon: <BuildingComplex size={20} strokeWidth={2} />,
          label: "Thông tin doanh nghiệp",
          path: "/enterprise",
        },
      ],
    },
    {
      title: "Tai nạn lao động",
      items: [
        {
          icon: <BuildingComplex size={20} strokeWidth={2} />,
          label: "TNLĐ theo HĐLĐ",
          path: "/hd",
        },
      ],
    },
  ];

  const menuData =
    account?.roleCode === RoleCode.SO
      ? menuDataRoleAdmin
      : account?.roleCode === RoleCode.DOANH_NGHIEP
        ? menuDataRoleEnterprise
        : [];

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
          "fixed top-0 left-0 z-[55] h-screen w-[300px]",
          "transition-transform duration-280 ease-in-out",
          "xl:sticky xl:top-0 xl:z-auto xl:translate-x-0",
          "xl:shrink-0 xl:overflow-hidden xl:transition-[width]",
          menuOpen ? "translate-x-0" : "-translate-x-full",
          menuOpen ? "xl:w-0" : "xl:w-[300px]",
        )}
      >
        <nav className="custom-scroll h-full w-[300px] overflow-y-auto bg-sidebar pb-5 text-sidebar-foreground">
          <div className="mb-[20px] flex items-center gap-[15px] justify-center sticky top-0 py-5 sm:px-[20px] px-[15px]">
            <Image src={logo} alt="logo" className="w-[45px]" loading="eager" />

            <p className="font-medium text-center">
              Ủy ban nhân dân thành phố <br></br> Hồ Chí Minh
            </p>
          </div>

          <ul className="flex flex-col font-normal px-[15px] gap-[10px]">
            {menuData.map((group, groupIndex) => (
              <div key={groupIndex} className="flex flex-col gap-[10px]">
                <p className="uppercase py-3 font-normal">{group.title}</p>

                {group.items.map((item, index) => (
                  <li key={index} className="flex flex-col gap-[10px]">
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
                          } rounded-lg p-3 w-full cursor-pointer flex justify-between items-center`}
                        >
                          <p className="flex items-center gap-[10px]">
                            {item.icon} {item.label}
                          </p>
                          <Button type="button">
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
                          className={`max-h-0 overflow-hidden invisible transition-all duration-600 ease-in-out pl-[30px] flex flex-col gap-[10px] ${
                            openMenus[item.key] ||
                            item.children.some(
                              (child) => pathname === child.path,
                            )
                              ? "max-h-fit visible"
                              : ""
                          }`}
                        >
                          {item.children.map((child, childIndex) => (
                            <li key={childIndex} className="w-full">
                              <Link
                                href={child.path}
                                className={`block w-full rounded-lg p-3 ${
                                  pathname === child.path
                                    ? "bg-white text-sidebar"
                                    : ""
                                }`}
                              >
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
                          pathname === item.path
                            ? "bg-white text-sidebar"
                            : "text-white"
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
