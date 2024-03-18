import "@testing-library/jest-dom";
import Auth from "../page";
import { render, screen, fireEvent, act, waitFor } from "@/utils/testing";
import * as apiModule from "@/api";

jest.mock("../../../api", () => ({
  ...jest.requireActual("../../../api"),
  useLoginMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null,
  }),
  useRegisterMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null,
  }),
}));

describe("Auth", () => {
  it("renders the page", () => {
    render(<Auth />);

    const logo = screen.getByText("FPI UFMS");
    expect(logo).toBeInTheDocument();
  });

  it("renders the login form", () => {
    render(<Auth />);

    const email = screen.getByTestId("login-email");
    const password = screen.getByTestId("login-password");
    const submit = screen.getByTestId("login-submit");

    expect(email).toBeInTheDocument();
    expect(password).toBeInTheDocument();
    expect(submit).toBeInTheDocument();
  });

  it("renders the login form", () => {
    render(<Auth />);

    const email = screen.getByTestId("login-email");
    const password = screen.getByTestId("login-password");
    const submit = screen.getByTestId("login-submit");

    expect(email).toBeInTheDocument();
    expect(password).toBeInTheDocument();
    expect(submit).toBeInTheDocument();
  });

  it("submits the login form", () => {
    const mutate = jest.fn();
    // @ts-ignore
    apiModule.useLoginMutation.mockReturnValue({
      mutate,
      isLoading: false,
      isError: false,
      isSuccess: false,
      error: null,
    });
    render(<Auth />);

    const email = screen.getByTestId("login-email");
    const password = screen.getByTestId("login-password");
    const submit = screen.getByTestId("login-submit");

    expect(email).toBeInTheDocument();
    expect(password).toBeInTheDocument();
    expect(submit).toBeInTheDocument();

    fireEvent.change(email, { target: { value: "test@fpi.test" } });
    fireEvent.change(password, { target: { value: "Password!123" } });

    act(() => {
      fireEvent.click(submit);
    });

    waitFor(() =>
      expect(mutate).toHaveBeenCalledWith({
        email: "test@fpi.test",
        password: "Password!123",
      })
    );
  });

  it("validates email in login form", async () => {
    const mutate = jest.fn();
    // @ts-ignore
    apiModule.useLoginMutation.mockReturnValue({
      mutate,
      isLoading: false,
      isError: false,
      isSuccess: false,
      error: null,
    });
    render(<Auth />);

    const email = screen.getByTestId("login-email");
    const password = screen.getByTestId("login-password");
    const submit = screen.getByTestId("login-submit");

    expect(email).toBeInTheDocument();
    expect(password).toBeInTheDocument();
    expect(submit).toBeInTheDocument();

    fireEvent.change(email, { target: { value: "test@notcorrect.com" } });
    fireEvent.change(password, { target: { value: "Password!123" } });

    act(() => {
      fireEvent.click(submit);
    });

    expect(submit).toBeDisabled();

    waitFor(() => expect(submit).not.toBeDisabled());
    expect(mutate).not.toHaveBeenCalled();
  });
});
