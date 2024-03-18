import { fetchApi, logout } from "..";

describe("fetchApi", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: {
        href: "http://localhost:3000",
        origin: "http://localhost:3000",
        replace: jest.fn(),
      },
      writable: true,
    });

    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => {},
        headers: new Headers({ content_type: "application/json" }),
      })
    );
  });

  it("should redirect to login for authenticated routes if token is not present", async () => {
    await expect(
      fetchApi("/test", {
        isPublic: false,
      })
    ).rejects.toEqual("No token found, user is not logged in");
    expect(window.location.replace).toHaveBeenCalledWith(
      `http://localhost:3000/auth?redirect=${encodeURIComponent(
        "http://localhost:3000"
      )}`
    );
  });

  it("should not redirect to login for public routes if token is not present", async () => {
    await fetchApi("/test", {
      isPublic: true,
    });

    expect(window.location.replace).not.toHaveBeenCalled();
  });

  it("should not redirect to login for authenticated routes if token is present", async () => {
    jest.spyOn(Storage.prototype, "getItem").mockReturnValue("some-token");

    await fetchApi("/test", {
      isPublic: false,
    });

    expect(window.location.replace).not.toHaveBeenCalled();
  });
});

describe("logout", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    Object.defineProperty(window, "location", {
      value: {
        origin: "http://localhost:3000",
        replace: jest.fn(),
      },
      writable: true,
    });
  });

  it("should remove the token and redirect to login", () => {
    localStorage.setItem("token", "some-token");
    logout();
    expect(localStorage.getItem("token")).toBeUndefined();
    expect(window.location.replace).toHaveBeenCalledWith(
      "http://localhost:3000/auth"
    );
  });
});
