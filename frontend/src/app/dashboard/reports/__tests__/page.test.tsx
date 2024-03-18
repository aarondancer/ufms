import "@testing-library/jest-dom";

import * as apiModule from "@/api";
import { fireEvent, render, screen } from "@/utils/testing";
import Reports from "../page";

jest.mock("../../../../api", () => ({
  ...jest.requireActual("../../../../api"),
  useReportQuery: jest.fn(),
  useFeedbackQuery: jest.fn(),
}));

describe("Reports", () => {
  const mockReportData = {
    featureRequests: Array.from({ length: 5 }).map((_, i) => ({
      id: `feature-request-${i}`,
      name: `test name ${i}`,
      description: "test description",
      totalScore: 0,
      averageSentimentScore: 20.3456 + i,
      feedbackCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: apiModule.FeatureRequestStatus.UNSCHEDULED,
      updates: [],
      feedbacks: [],
    })),
    top5: Array.from({ length: 5 }).map((_, i) => ({
      id: `top-feedback-${i}}`,
      email: `top${i}test@test.com`,
      text: "test feedback",
      sentimentScore: 80.33 + i,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "UNREVIEWED",
      featureRequests: [],
    })),
    bottom5: Array.from({ length: 5 }).map((_, i) => ({
      id: `bottom-feedback-${i}}`,
      email: `bottom${i}test@test.com`,
      text: "test feedback",
      sentimentScore: 20.33 - i,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "UNREVIEWED",
      featureRequests: [],
    })),
  };

  const mockFeedbackData = {
    data: Array.from({ length: 5 }).map((_, i) => ({
      id: `search-feedback-${i}}`,
      email: `search${i}test@test.com`,
      text: `search feedback ${i}}`,
      sentimentScore: 80.33 + i,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "UNREVIEWED",
      featureRequests: [],
    })),
    meta: { ...new apiModule.PageOptionsDto() },
  };

  it("should render report with data", () => {
    jest
      .spyOn(apiModule, "useReportQuery")
      .mockReturnValue({ data: mockReportData, isLoading: false } as any);
    jest
      .spyOn(apiModule, "useFeedbackQuery")
      .mockReturnValue({ data: mockFeedbackData, isLoading: false } as any);

    render(<Reports />);
    expect(
      screen.getByText("Roadmap Prioritization Report -")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Top Overall Priority Feature Requests")
    ).toBeInTheDocument();
  });

  it("should not render content when no data is present", () => {
    jest
      .spyOn(apiModule, "useReportQuery")
      .mockReturnValue({ data: null, isLoading: true } as any);

    render(<Reports />);
    expect(
      screen.queryByText("Roadmap Prioritization Report -")
    ).not.toBeInTheDocument();
  });

  it("should render top and bottom 5 feedback sentiment in report", () => {
    jest
      .spyOn(apiModule, "useReportQuery")
      .mockReturnValue({ data: mockReportData, isLoading: false } as any);
    jest
      .spyOn(apiModule, "useFeedbackQuery")
      .mockReturnValue({ data: mockFeedbackData, isLoading: false } as any);

    render(<Reports />);
    for (let i = 0; i < 5; i++) {
      expect(screen.getByText(`${80.33 + i}`)).toBeInTheDocument();
      expect(screen.getByText(`${20.33 - i}`)).toBeInTheDocument();
    }
  });

  it("should render top 5 priority feature requests in report", () => {
    jest
      .spyOn(apiModule, "useReportQuery")
      .mockReturnValue({ data: mockReportData, isLoading: false } as any);
    jest
      .spyOn(apiModule, "useFeedbackQuery")
      .mockReturnValue({ data: mockFeedbackData, isLoading: false } as any);

    render(<Reports />);
    for (let i = 0; i < 5; i++) {
      expect(screen.getByText(`test name ${i}`)).toBeInTheDocument();
    }
  });

  it("should render feedback by keyword search in report", () => {
    jest
      .spyOn(apiModule, "useReportQuery")
      .mockReturnValue({ data: mockReportData, isLoading: false } as any);
    jest
      .spyOn(apiModule, "useFeedbackQuery")
      .mockReturnValue({ data: mockFeedbackData, isLoading: false } as any);

    render(<Reports />);
    const search = screen.getByTestId("keyword-search-input");
    fireEvent.change(search, { target: { value: "test" } });

    for (let i = 0; i < 5; i++) {
      expect(screen.getByText(`search${i}test@test.com`)).toBeInTheDocument();
    }
  });
});
