import { Dynamic } from "@/components/Dynamic";
import { render, RenderOptions } from "@testing-library/react";
import React, { ReactElement } from "react";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <Dynamic>{children}</Dynamic>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

