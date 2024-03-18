"use client";
import { useRequireAuth } from "@/api";
import { SidebarNav } from "./components/SidebarNav";
import { MainNav } from "./components/MainNav";
import { ReaderIcon, CardStackIcon, GearIcon, BarChartIcon } from "@radix-ui/react-icons";

const navItems = [
  {
    icon: <ReaderIcon className="h-5 w-5" />,
    title: "Feedback",
    href: "/dashboard/feedback",
    matchPath: "feedback",
  },
  {
    icon: <CardStackIcon className="h-5 w-5" />,
    title: "Feature Requests",
    href: "/dashboard/feature-requests",
    matchPath: "feature-requests"
  },
  {
    icon: <BarChartIcon className="h-5 w-5" />,
    title: "Reports",
    href: "/dashboard/reports",
    matchPath: "reports"
  },
  {
    icon: <GearIcon className="h-5 w-5" />,
    title: "Settings",
    href: "/dashboard/settings",
    matchPath: "settings"
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthed = useRequireAuth();

  if (!isAuthed) {
    return null;
  }

  return (
    <>
      <MainNav items={navItems} />
      <div className="space-y-6 p-4 md:p-6 lg:p-8 xl:p-10 md:block">
        <div className="flex flex-col lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="hidden lg:block min-w-[280px] lg:w-1/5 print:hidden">
            <SidebarNav items={navItems} />
          </aside>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </>
  );
}
