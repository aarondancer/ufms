"use client";

import { cn } from "@/utils";
import Link from "next/link";
import React from "react";
import { SelectNav } from "./SelectNav";
import { UserNav } from "./UserNav";

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    icon: React.ReactElement;
    href: string;
    title: string;
    matchPath: string;
  }[];
}

export function MainNav({ items, className, ...props }: MainNavProps) {
  return (
    <div className="border-b print:hidden">
      <div className="flex h-16 items-center px-4">
        <nav className="flex w-full items-center space-x-4 lg:hidden">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-primary"
          >
            <div className="relative z-20 flex items-center text-md font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1 h-4 w-4"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              UFMS
            </div>
          </Link>
          <SelectNav items={items} />
        </nav>
        <nav
          className={cn(
            "hidden justify-end lg:w-full lg:justify-between md:flex items-center space-x-4 lg:space-x-6",
            className
          )}
          {...props}
        >
          <Link
            href="/dashboard"
            className="transition-colors hover:text-primary lg:block hidden"
          >
            <div className="relative z-20 flex items-center text-md font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-5 w-5"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              FPI UFMS
            </div>
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <div className="ml-4">
            <UserNav />
          </div>
        </div>
      </div>
    </div>
  );
}
