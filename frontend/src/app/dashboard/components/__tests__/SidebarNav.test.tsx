import "@testing-library/jest-dom";

import { render, screen, fireEvent } from "@/utils/testing";
import { SidebarNav } from "../SidebarNav";
import * as apiModule from "@/api";
import * as navigationModule from "next/navigation";

jest.mock("../../../../api", () => ({
  ...jest.requireActual("../../../../api"),
  useCurrentUserQuery: jest.fn(),
  logout: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

jest.mock("../SelectNav", () => ({ SelectNav: () => <div>Select Nav</div> }));

describe("SidebarNav", () => {
  const mockItems = [
    {
      icon: <div>Icon1</div>,
      href: "/path1",
      title: "Title1",
      matchPath: "path1",
    },
    {
      icon: <div>Icon2</div>,
      href: "/path2",
      title: "Title2",
      matchPath: "path2",
    },
  ];

  it("should not render when user is not present or loading", () => {
    jest.spyOn(apiModule, "useCurrentUserQuery").mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);
    render(<SidebarNav items={mockItems} />);
    expect(screen.queryByText("Title1")).not.toBeInTheDocument();
    expect(screen.queryByText("Title2")).not.toBeInTheDocument();
  });

  it("should render user information and navigation items when user is loaded", () => {
    jest.spyOn(apiModule, "useCurrentUserQuery").mockReturnValue({
      data: {
        id: "1" as apiModule.Uuid,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
    } as any);
    jest.spyOn(navigationModule, "usePathname").mockReturnValue("/path1");

    render(<SidebarNav items={mockItems} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    expect(screen.getByText("Title1")).toBeInTheDocument();
    expect(screen.getByText("Title2")).toBeInTheDocument();
  });

  it("should highlight the active navigation item based on the current pathname", () => {
    jest.spyOn(apiModule, "useCurrentUserQuery").mockReturnValue({
      data: {
        id: "1" as apiModule.Uuid,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
    } as any);
    jest.spyOn(navigationModule, "usePathname").mockReturnValue("/path2");

    render(<SidebarNav items={mockItems} />);
    const activeNavItem = screen.getByText("Title2").closest("a");
    expect(activeNavItem).toHaveClass("border-l-4 border-primary");
  });

  it("should highlight the active navigation item when in a details page", () => {
    jest.spyOn(apiModule, "useCurrentUserQuery").mockReturnValue({
      data: {
        id: "1" as apiModule.Uuid,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
    } as any);
    jest.spyOn(navigationModule, "usePathname").mockReturnValue("/path2/details/deep");

    render(<SidebarNav items={mockItems} />);
    const activeNavItem = screen.getByText("Title2").closest("a");
    expect(activeNavItem).toHaveClass("border-l-4 border-primary");
  });

  it("should call logout on clicking the logout button", () => {
    jest.spyOn(apiModule, "useCurrentUserQuery").mockReturnValue({
      data: {
        id: "1" as apiModule.Uuid,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
    } as any);

    render(<SidebarNav items={mockItems} />);
    fireEvent.click(screen.getByText("Logout"));
    expect(apiModule.logout).toHaveBeenCalled();
  });
});
