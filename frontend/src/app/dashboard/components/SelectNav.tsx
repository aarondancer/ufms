"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo } from "react";

type SelectNavProps = SelectPrimitive.SelectProps &
  Pick<React.HTMLAttributes<HTMLElement>, "className"> & {
    items: {
      icon: React.ReactElement;
      href: string;
      title: string;
      matchPath: string;
    }[];
  };

export function SelectNav({ items, className, ...props }: SelectNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const value = useMemo(
    () =>
      items.find((item) => pathname.includes(item.matchPath))?.href ??
      pathname,
    [items, pathname]
  );

  return (
    <Select onValueChange={router.push} value={value} {...props}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Navigate" />
      </SelectTrigger>
      <SelectContent>
        {items.map((link) => (
          <SelectItem key={link.href} value={link.href}>
            <div className="flex items-center">
              <span className="flex items-center mr-2">
                {React.cloneElement(link.icon, { className: "h-4 w-4" })}
              </span>
              {link.title}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
