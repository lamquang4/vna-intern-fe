import Link from "next/link";
import { Button } from "./Button";

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  textColor?: string;
  target?: string;
}

interface Props {
  header?: React.ReactNode;
  items: DropdownMenuItem[];
  horizontal?: "left" | "right";
  vertical?: "top" | "bottom";
}

function DropdownMenu({
  items,
  header,
  horizontal = "right",
  vertical = "bottom",
}: Props) {
  const horizontalClass = {
    left: "left-0",
    right: "right-0",
  };

  const verticalClass = {
    top: "bottom-full",
    bottom: "top-full",
  };

  return (
    <div
      className={`absolute inline-flex flex-col ${horizontalClass[horizontal]} ${verticalClass[vertical]} w-max bg-white shadow-md rounded-sm z-20`}
    >
      {header}

      {items.map((item, index) =>
        item.href ? (
          <Link
            key={index}
            href={item.href}
            onClick={item.onClick}
            target={item.target}
            className="block px-2.5 py-3 hover:bg-muted w-full"
          >
            <div
              className={`flex items-center gap-2 font-medium ${
                item.textColor ?? "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          </Link>
        ) : (
          <Button
            key={index}
            type="button"
            onClick={item.onClick}
            disabled={item.disabled}
            className={`px-2.5 py-3 hover:bg-muted w-full flex items-center gap-2 font-medium ${
              item.textColor ?? "text-muted-foreground"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Button>
        ),
      )}
    </div>
  );
}

export default DropdownMenu;
