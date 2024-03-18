import "@testing-library/jest-dom";

import * as apiModule from "@/api";
import { render, screen } from "@/utils/testing";
import FeatureRequestDetails from "../page";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

jest.mock("../../../../../api", () => ({
  ...jest.requireActual("../../../../../api"),
  useFeatureRequestQuery: jest.fn().mockReturnValue({
    isLoading: false,
    data: undefined,
  }),
  useUpdateFeatureRequestStatusMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
  }),
}));

describe("Feature Request Details", () => {
  it("should render", () => {
    jest.spyOn(apiModule, "useFeatureRequestQuery").mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);
    render(<FeatureRequestDetails params={{ id: "1" as apiModule.Uuid }} />);
    expect(screen.queryByText("Feature Request")).toBeInTheDocument();
  });

  it("should render details of a feature request", () => {
    const createdAt = "2023-11-19T18:26:37.454Z";
    jest.spyOn(apiModule, "useFeatureRequestQuery").mockReturnValue({
      data: {
        id: "8616423b-73cb-42a8-b05a-4eca28c16101",
        name: "test name",
        description: "test description",
        totalScore: 70.233,
        averageSentimentScore: 20.3456,
        feedbackCount: 0,
        createdAt,
        updatedAt: createdAt,
        status: apiModule.FeatureRequestStatus.UNSCHEDULED,
        updates: [],
        feedbacks: [],
      },
      isLoading: false,
    } as any);
    render(<FeatureRequestDetails params={{ id: "1" as apiModule.Uuid }} />);
    expect(
      screen.queryByTestId("feature-request-detail-sentiment")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("feature-request-detail-score")
    ).toHaveTextContent("70.23");
    expect(
      screen.queryByTestId("feature-request-detail-sentiment")
    ).toHaveTextContent("20.35");
    expect(
      screen.queryByTestId("feature-request-detail-description")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("feature-request-detail-description")
    ).toHaveTextContent("test description");
    expect(
      screen.queryByTestId("feature-request-detail-createdat")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("feature-request-detail-createdat")
    ).toHaveTextContent("Nov 19, 2023 12:26 PM");
  });
});
