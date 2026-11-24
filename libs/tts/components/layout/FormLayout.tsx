import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Props {
  title: React.ReactNode;
  backHref: string;
  action?: React.ReactNode;
  others?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function FormLayout({
  title,
  backHref,
  action,
  others,
  actions,
  children,
  className = "",
}: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="py-[30px] sm:px-[20px] px-[15px] flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3>{title}</h3>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {action}

            {backHref && (
              <Link
                href={backHref}
                className="flex items-center gap-1 px-3 py-2 font-medium text-muted-foreground hover:text-primary"
              >
                <ChevronLeft size={20} /> <span>Trở về</span>
              </Link>
            )}
          </div>
        </div>

        {others}

        {actions}
      </div>

      <div
        className={`flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-[30px] sm:px-[20px] px-[15px] ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

export default FormLayout;
