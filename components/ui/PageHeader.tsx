import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import React, { ReactElement, ReactNode } from "react";
import { Button } from "./button";

type IconProps = {
  className?: string;
};

type PageHeaderProps = {
  icon?: ReactElement<IconProps>;
  title: ReactNode;
  backLink?: string;
  backLabel?: string;
};

export function PageHeader({
  icon,
  title,
  backLink = "/",
  backLabel = "Back to Home",
}: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-5 mb-8">
      <Link href={backLink}>
        <Button
          variant="outline"
          size="sm"
          className="mb-2 border-emerald-900/30"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backLabel}
        </Button>
      </Link>

      <div className="flex items-end gap-2">
        {icon && (
          <div className="text-[#0A4D68]">
            {React.cloneElement(icon, {
              className: "h-12 md:h-14 w-12 md:w-14",
            })}
          </div>
        )}

        <h1 className="text-4xl md:text-5xl gradient-title">
          {title}
        </h1>
      </div>
    </div>
  );
}
