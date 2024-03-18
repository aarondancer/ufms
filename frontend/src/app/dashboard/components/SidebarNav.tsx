"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout, useCurrentUserQuery } from "@/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils";
import { SelectNav } from "./SelectNav";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    icon: React.ReactElement;
    href: string;
    title: string;
    matchPath: string;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUserQuery();

  if (!user || isLoading) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="hidden justify-between lg:flex">
        <CardTitle>
          <div className="flex flex-row space-x-4 items-center">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user.firstName.charAt(0).toUpperCase() +
                  user.lastName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-md font-medium leading-none">
                {user.firstName + " " + user.lastName}
              </p>
              <p className="text-sm leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <Separator className="hidden lg:flex" />
      <CardContent className="pt-6">
        <nav className={cn("flex lg:hidden")} {...props}>
          <SelectNav items={items} />
        </nav>

        <nav
          className={cn(
            "hidden space-x-2 lg:flex lg:space-y-2 lg:flex-col lg:space-x-0"
          )}
          {...props}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "outline" }),
                pathname.includes(item.matchPath)
                  ? "shadow-md hover:shadow-md"
                  : "shadow-sm hover:bg-transparent hover:shadow-md",
                pathname.includes(item.matchPath)
                  ? "border-l-4 border-primary"
                  : "",
                "p-6 justify-start transition-all"
              )}
            >
              <span className="mr-5">{item.icon}</span>
              {item.title}
            </Link>
          ))}
        </nav>
      </CardContent>
      <Separator className="hidden lg:flex" />
      <CardFooter className="hidden justify-end pt-6 lg:flex">
        <Link
          href="/logout"
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
          className="w-full"
        >
          <Button variant="outline" className="w-full shadow-none">
            Logout
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
