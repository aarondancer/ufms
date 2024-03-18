import "@testing-library/jest-dom";

import { render, screen } from "@/utils/testing";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { FormattedDate } from "../FormattedDate";

// Extend dayjs with required plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

jest.mock("dayjs", () => {
  const originalDayjs = jest.requireActual("dayjs");
  originalDayjs.extend(jest.requireActual("dayjs/plugin/utc"));
  originalDayjs.extend(jest.requireActual("dayjs/plugin/timezone"));
  originalDayjs.extend(jest.requireActual("dayjs/plugin/relativeTime"));
  const specificTime = originalDayjs("2023-01-01T12:00:00Z");
  specificTime.tz = jest.fn(() => specificTime);
  const mock = jest.fn(() => specificTime);
  // @ts-ignore
  mock.extend = jest.fn();
  // @ts-ignore
  mock.tz = { guess: jest.fn() };
  return mock;
});

describe("DateAgo", () => {
  it("displays the correct time ago", () => {
    const testDate = "2023-01-01T12:00:00Z";
    render(<FormattedDate date={testDate} />);

    expect(screen.getByText("Jan 1, 2023 6:00 AM")).toBeInTheDocument();
  });
});
