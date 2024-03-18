import "@testing-library/jest-dom";

import * as apiModule from "@/api";
import { act, fireEvent, render, screen } from "@/utils/testing";
import FeedbackDetails from "../page";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
  useParams: jest.fn().mockReturnValue({
    id: "1",
  }),
}));

jest.mock("../../../../../api", () => ({
  ...jest.requireActual("../../../../../api"),
  useFeedbackByIdQuery: jest.fn().mockReturnValue({
    isLoading: false,
    data: undefined,
  }),
  useFeedbackStatusMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
  }),
  usePagedFeatureRequestsQuery: jest.fn().mockReturnValue({
    isLoading: false,
    data: [],
  }),
  useAssignFeedbackToFeatureRequestMutation: jest.fn().mockReturnValue({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe("Feedback Details", () => {
  it("should render", () => {
    jest.spyOn(apiModule, "useFeedbackByIdQuery").mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);
    render(<FeedbackDetails params={{ id: "1" as apiModule.Uuid }} />);
    expect(screen.queryByTestId("feedback-detail-title")).toBeInTheDocument();
  });

  it("should render details of feedback", () => {
    const createdAt = "2023-11-19T18:26:37.454Z";
    jest.spyOn(apiModule, "useFeedbackByIdQuery").mockReturnValue({
      data: {
        id: "8616423b-73cb-42a8-b05a-4eca28c16101",
        email: "test@test.com",
        text: "test feedback",
        sentimentScore: 20.3456,
        createdAt,
        updatedAt: createdAt,
        status: "UNREVIEWED",
        featureRequests: [],
      },
      isLoading: false,
    } as any);
    render(<FeedbackDetails params={{ id: "1" as apiModule.Uuid }} />);
    expect(
      screen.queryByTestId("feedback-detail-sentiment")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("feedback-detail-sentiment")).toHaveTextContent(
      "20.34"
    );
    expect(screen.queryByTestId("feedback-detail-text")).toBeInTheDocument();
    expect(screen.queryByTestId("feedback-detail-text")).toHaveTextContent(
      "test feedback"
    );
    expect(
      screen.queryByTestId("feedback-detail-createdat")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("feedback-detail-createdat")).toHaveTextContent(
      "Nov 19, 2023 12:26 PM"
    );
  });

  it("should open the assign feedback to feature request modal", async () => {
    const createdAt = "2023-11-19T18:26:37.454Z";
    jest.spyOn(apiModule, "useFeedbackByIdQuery").mockReturnValue({
      data: {
        id: "8616423b-73cb-42a8-b05a-4eca28c16101",
        email: "test@test.com",
        text: "test feedback",
        sentimentScore: 20.3456,
        createdAt,
        updatedAt: createdAt,
        status: "UNREVIEWED",
        featureRequests: [
          {
            id: "fr1",
            name: "fr1 name",
            description: "fr1 test description",
            totalScore: 0,
            averageSentimentScore: 20.3456,
            feedbackCount: 0,
            createdAt,
            updatedAt: createdAt,
            status: apiModule.FeatureRequestStatus.UNSCHEDULED,
            updates: [],
            feedbacks: [],
          },
        ],
      },
      isLoading: false,
    } as any);
    jest.spyOn(apiModule, "usePagedFeatureRequestsQuery").mockReturnValue({
      data: {
        data: [
          {
            id: "fr1",
            name: "fr1 name",
            description: "fr1 test description",
            totalScore: 0,
            averageSentimentScore: 20.3456,
            feedbackCount: 0,
            createdAt,
            updatedAt: createdAt,
            status: apiModule.FeatureRequestStatus.UNSCHEDULED,
            updates: [],
            feedbacks: [],
          },
          {
            id: "fr2",
            name: "fr2 name",
            description: "fr2 test description",
            totalScore: 0,
            averageSentimentScore: 20.3456,
            feedbackCount: 0,
            createdAt,
            updatedAt: createdAt,
            status: apiModule.FeatureRequestStatus.UNSCHEDULED,
            updates: [],
            feedbacks: [],
          },
        ],
      },
      isLoading: false,
    } as any);
    render(<FeedbackDetails params={{ id: "1" as apiModule.Uuid }} />);
    act(() => {
      fireEvent.click(screen.getByTestId("assign-feedback-trigger"));
    });
    await screen.findByText("Assign this feedback to a feature request");
    await expect(screen.findByText("fr2 name")).resolves.toBeInTheDocument();
    expect(screen.queryByTestId("assign-feedback-content")).toHaveTextContent(
      "fr2 name"
    );
    expect(
      screen.queryByTestId("assign-feedback-content")
    ).not.toHaveTextContent("fr1 name");
  });

  it("should assign feedback to feature request", async () => {
    const createdAt = "2023-11-19T18:26:37.454Z";
    jest.spyOn(apiModule, "useFeedbackByIdQuery").mockReturnValue({
      data: {
        id: "1",
        email: "test@test.com",
        text: "test feedback",
        sentimentScore: 20.3456,
        createdAt,
        updatedAt: createdAt,
        status: "UNREVIEWED",
        featureRequests: [
          {
            id: "fr1",
            name: "fr1 name",
            description: "fr1 test description",
            totalScore: 0,
            averageSentimentScore: 20.3456,
            feedbackCount: 0,
            createdAt,
            updatedAt: createdAt,
            status: apiModule.FeatureRequestStatus.UNSCHEDULED,
            updates: [],
            feedbacks: [],
          },
        ],
      },
      isLoading: false,
    } as any);
    jest.spyOn(apiModule, "usePagedFeatureRequestsQuery").mockReturnValue({
      data: {
        data: [
          {
            id: "fr1",
            name: "fr1 name",
            description: "fr1 test description",
            totalScore: 0,
            averageSentimentScore: 20.3456,
            feedbackCount: 0,
            createdAt,
            updatedAt: createdAt,
            status: apiModule.FeatureRequestStatus.UNSCHEDULED,
            updates: [],
            feedbacks: [],
          },
          {
            id: "fr2",
            name: "fr2 name",
            description: "fr2 test description",
            totalScore: 0,
            averageSentimentScore: 20.3456,
            feedbackCount: 0,
            createdAt,
            updatedAt: createdAt,
            status: apiModule.FeatureRequestStatus.UNSCHEDULED,
            updates: [],
            feedbacks: [],
          },
        ],
      },
      isLoading: false,
    } as any);
    const mutateAsync = jest.fn().mockResolvedValue(undefined);
    jest
      .spyOn(apiModule, "useAssignFeedbackToFeatureRequestMutation")
      .mockReturnValue({
        mutateAsync: mutateAsync,
      } as any),
      render(<FeedbackDetails params={{ id: "1" as apiModule.Uuid }} />);
    act(() => {
      fireEvent.click(screen.getByTestId("assign-feedback-trigger"));
    });
    await screen.findByText("Assign this feedback to a feature request");
    await expect(screen.findByText("fr2 name")).resolves.toBeInTheDocument();
    expect(screen.queryByTestId("assign-feedback-content")).toHaveTextContent(
      "fr2 name"
    );
    expect(
      screen.queryByTestId("assign-feedback-content")
    ).not.toHaveTextContent("fr1 name");
    jest.spyOn(apiModule, "useFeedbackByIdQuery").mockReturnValue({
      data: {
        id: "1",
        email: "test@test.com",
        text: "test feedback",
        sentimentScore: 20.3456,
        createdAt,
        updatedAt: createdAt,
        status: "UNREVIEWED",
        featureRequests: [
          {
            id: "fr1",
            name: "fr1 name",
            description: "fr1 test description",
            totalScore: 0,
            averageSentimentScore: 20.3456,
            feedbackCount: 0,
            createdAt,
            updatedAt: createdAt,
            status: apiModule.FeatureRequestStatus.UNSCHEDULED,
            updates: [],
            feedbacks: [],
          },
          {
            id: "fr2",
            name: "fr2 name",
            description: "fr2 test description",
            totalScore: 0,
            averageSentimentScore: 20.3456,
            feedbackCount: 0,
            createdAt,
            updatedAt: createdAt,
            status: apiModule.FeatureRequestStatus.UNSCHEDULED,
            updates: [],
            feedbacks: [],
          },
        ],
      },
      isLoading: false,
    } as any);
    act(() => {
      fireEvent.click(screen.getByTestId("assign-feedback-fr2"));
    });
    expect(mutateAsync).toHaveBeenCalledWith({
      feedbackId: "1",
      featureRequestId: "fr2",
    });
  });
});
