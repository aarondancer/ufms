"use client";

import { Button } from "@/components/ui/button";
import { ToastAction, ToastActionElement } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QueryClient, useMutation, useQuery } from "react-query";
import { Misc } from "ts-toolbelt";

export type Uuid = string & { _uuidBrand: undefined };

const getBaseUri = () => window.location.origin;
const getApiUri = () => `${getBaseUri()}/api`;

export const queryClient = new QueryClient();

const getAuthToken = () => {
  const token = localStorage.getItem("token");
  return token ? `Bearer ${token}` : undefined;
};

const setAuthToken = (token: string) => {
  localStorage.setItem("token", token);
  return `Bearer ${token}`;
};

const redirectToLogin = (noreferrer?: boolean) => {
  // No token found, user is not logged in
  window.location.replace(
    `${getBaseUri()}/auth${
      !noreferrer ? `?redirect=${encodeURIComponent(window.location.href)}` : ""
    }`
  );
};

export const logout = (noreferrer: boolean = true) => {
  localStorage.removeItem("token");
  queryClient.clear();
  redirectToLogin(noreferrer);
};

const errorToast = (
  title: string = "Server Error",
  message: string = "Something went wrong on our end. Please try again later."
) => {
  toast({
    variant: "destructive",
    title,
    description: message,
    action: (
      <Button variant="outline" onClick={() => window.location.reload()}>
        Refresh
      </Button>
    ),
  });
};

const successToast = (message: string, action?: ToastActionElement) => {
  const ref = {
    current: toast({
      variant: "default",
      description: (
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />
          {message}
        </div>
      ),
    }),
  };
};

export async function fetchApi<R extends Misc.JSON.Value | string | void>(
  path: string,
  options: Omit<RequestInit, "body"> & {
    body?: Misc.JSON.Value;
    isPublic?: boolean;
  } = {}
): Promise<R> {
  const token = getAuthToken();

  if (!options.isPublic && !token) {
    logout(false);
    return Promise.reject("No token found, user is not logged in");
  }

  const finalOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  };

  try {
    const res = await fetch(`${getApiUri()}${path}`, finalOptions);
    if (res.status === 401 || res.status === 403) {
      logout(false);
      errorToast(
        "Unauthorized",
        "You are not authorized to perform this action."
      );
    }
    if (res.status >= 400) {
      errorToast();
      throw new Error(
        "Something went wrong on our end. Please try again later."
      );
    }
    if (res.headers.get("content-type")?.includes("application/json")) {
      return await res.json();
    }
    if (res.headers.get("content-type")?.includes("text/plain")) {
      return (await res.text()) as R;
    }
    return undefined as R;
  } catch (e) {
    errorToast();
    return Promise.reject(e);
  }
}

export type Dated<T> = T & {
  createdAt: string;
  updatedAt: string;
};

export type WithId<T> = T & {
  id: Uuid;
};

export type Entity<T> = Dated<WithId<T>>;

export type Create<T> = Omit<T, keyof Dated<{}> | keyof WithId<{}>>;

export type Paged<T> = {
  data: T[];
  meta: {
    page: number;
    take: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export enum Order {
  ASC = "ASC",
  DESC = "DESC",
}

export class PageOptionsDto {
  order: Order = Order.DESC;
  orderBy: string = "created_at";
  page: number = 1;
  take: number = 10;
  q?: string;

  private toParams() {
    return new URLSearchParams({
      order: this.order,
      orderBy: this.orderBy,
      page: String(this.page),
      take: String(this.take),
      ...(this.q && { q: this.q }),
    });
  }

  toString() {
    return `?${this.toParams().toString()}`;
  }

  constructor(options?: Partial<PageOptionsDto>) {
    Object.assign(this, options);
  }
}

export type User = Entity<{
  firstName: string;
  lastName: string;
  email: string;
}>;

type TokenPayload = {
  expiresIn: number;
  accessToken: string;
};

const authKeys = {
  user: ["user"] as const,
  auth: ["auth"] as const,
  apiKey: ["apiKey"] as const,
};

type LoginResponse = {
  user: User;
  token: TokenPayload;
};

async function login(payload: Pick<User, "email"> & { password: string }) {
  const response = await fetchApi<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
    isPublic: true,
  });

  return response;
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuthToken(data.token.accessToken);
      queryClient.setQueryData(authKeys.auth, data.token);
      queryClient.setQueryData(authKeys.user, data.user);
      const redirect = new URLSearchParams(window.location.search).get(
        "redirect"
      );
      if (redirect) {
        window.location.replace(decodeURIComponent(redirect));
      } else {
        window.location.replace(`${getBaseUri()}/`);
      }
      successToast("Successfully logged in");
    },
    onError: (error) => {
      errorToast("Login Error", String(error || "Something went wrong"));
    },
  });
}

function register(payload: Create<User & { password: string }>) {
  return fetchApi<void>("/auth/register", {
    method: "POST",
    body: payload,
    isPublic: true,
  });
}

export function useRegisterMutation() {
  const loginMutation = useLoginMutation();

  return useMutation({
    mutationFn: register,
    onSuccess: (_data, values) => {
      loginMutation.mutate({
        email: values.email,
        password: values.password,
      });
      successToast("Successfully registered");
    },
    onError: (error) => {
      errorToast("Registration Error", String(error || "Something went wrong"));
    },
  });
}

async function getCurrentUser() {
  return fetchApi<User>("/auth/me", {
    method: "GET",
  });
}

export function useCurrentUserQuery() {
  return useQuery(authKeys.user, getCurrentUser);
}

export function useIsAuthenticated() {
  const token = useQuery(authKeys.auth, getAuthToken, {
    retry: false,
    initialData: getAuthToken(),
  });
  return typeof token.data === "string" && token.data.length !== 0;
}

export function useRequireAuth() {
  const isAuthenticated = useIsAuthenticated();
  if (!isAuthenticated) {
    redirectToLogin();
  }
  return isAuthenticated;
}

function getApiKey() {
  return fetchApi<TokenPayload>("/auth/api-key", {
    method: "GET",
  });
}

export const useApiKeyQuery = () => {
  return useQuery(authKeys.apiKey, getApiKey, {
    staleTime: Infinity,
  });
};

const feedbackKeys = {
  all: ["feedback"] as const,
  paged: (options: PageOptionsDto) =>
    ["feedback", "paged", JSON.stringify(options)] as const,
  one: (id: Uuid) => ["feedback", id] as const,
} as const;

type FeedbackVariants = {
  featureRequests?: boolean;
};

export type Feedback<
  O extends FeedbackVariants = {
    featureRequests: false;
  }
> = Entity<{
  email: string;
  source: "ONLINE_FORM" | "EXTERNAL";
  status: "UNREVIEWED" | "REVIEWED";
  text: string;
  sentimentScore: number;
}> &
  (O extends { featureRequests: true }
    ? { featureRequests: FeatureRequest[] }
    : {});

function getFeedback(options: PageOptionsDto) {
  return fetchApi<Paged<Feedback>>(`/feedback${options}`);
}

export function useFeedbackQuery(options: PageOptionsDto) {
  return useQuery(feedbackKeys.paged(options), () => getFeedback(options));
}

function getFeedbackById(id: Uuid) {
  return fetchApi<Feedback<{ featureRequests: true }>>(`/feedback/${id}`);
}

export function useFeedbackByIdQuery(id: Uuid) {
  return useQuery(feedbackKeys.one(id), () => getFeedbackById(id));
}

function submitFeedback(payload: Pick<Feedback, "text" | "email">) {
  return fetchApi<void>("/feedback", {
    method: "POST",
    body: payload,
    isPublic: true,
  });
}

export function useSubmitFeedbackMutation() {
  return useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries(feedbackKeys.all);
      successToast("Successfully submitted feedback");
    },
    onError: (error) => {
      errorToast("Submission Error", String(error || "Something went wrong"));
    },
  });
}

function deleteFeedback(feedbackId: Uuid) {
  return fetchApi<void>(`/feedback/${feedbackId}`, {
    method: "DELETE",
  });
}

export function useDeleteFeedbackMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: deleteFeedback,
    onSuccess: async () => {
      await router.push("/dashboard/feedback");
      setTimeout(() => {
        queryClient.invalidateQueries(feedbackKeys.all);
        queryClient.invalidateQueries(featureRequestKeys.all);
      }, 2000);
      successToast("Deleted feedback");
    },
    onError: (error) => {
      errorToast("Deletion error", String(error || "Something went wrong"));
    },
  });
}

function updateFeedbackStatus({
  feedbackId,
  status,
}: {
  feedbackId: Uuid;
  status: Feedback["status"];
}) {
  return fetchApi<void>(`/feedback/${feedbackId}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function useFeedbackStatusMutation() {
  return useMutation({
    mutationFn: updateFeedbackStatus,
    onMutate: ({ feedbackId, status }) => {
      queryClient.setQueryData(
        feedbackKeys.one(feedbackId),
        (oldData: any) => ({
          ...oldData,
          status,
        })
      );
    },
    onSuccess: () => {
      // invalidate all feature requests because this updates the scores
      queryClient.invalidateQueries(feedbackKeys.all);
      successToast("Feedback status updated");
    },
    onError: (error) => {
      errorToast("Update Error", String(error || "Something went wrong"));
    },
  });
}

const featureRequestKeys = {
  all: ["featureRequests"] as const,
  paged: (options: PageOptionsDto) =>
    ["featureRequests", JSON.stringify(options)] as const,
  one: (id: Uuid) => ["featureRequests", id] as const,
  onePublic: (id: Uuid) => ["featureRequests", `public/${id}`] as const,
} as const;

export enum FeatureRequestStatus {
  UNSCHEDULED = "UNSCHEDULED",
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
}

export enum FeatureUpdateType {
  STATUS = "STATUS",
  COMMENT = "COMMENT",
}

export type FeatureUpdate = Entity<{
  type: FeatureUpdateType;
  text: string;
  featureRequestId: Uuid;
}>;

export type FeatureRequestVariantFlags = {
  feedback?: boolean;
  updates?: boolean;
  scores?: boolean;
};

export type FeatureRequest<
  O extends FeatureRequestVariantFlags = {
    feedback: false;
    updates: false;
    scores: true;
  }
> = Entity<{
  name: string;
  status: FeatureRequestStatus;
  description: string;
}> &
  (O extends { feedback: true } ? { feedbacks: Feedback[] } : {}) &
  (O extends { updates: true } ? { updates: FeatureUpdate[] } : {}) &
  (O extends { scores: true }
    ? {
        feedbackCount: number;
        averageSentimentScore: number;
        totalScore: number;
      }
    : {});

function getFeatureRequests(options: PageOptionsDto) {
  return fetchApi<Paged<FeatureRequest<{ scores: true }>>>(
    `/featurerequest${options.toString()}`
  );
}

export function usePagedFeatureRequestsQuery(options: PageOptionsDto) {
  return useQuery(featureRequestKeys.paged(options), () =>
    getFeatureRequests(options)
  );
}

function getFeatureRequest(id: Uuid) {
  return fetchApi<
    FeatureRequest<{
      feedback: true;
      updates: true;
      scores: true;
    }>
  >(`/featurerequest/${id}`);
}

function getPublicFeatureRequest(id: Uuid) {
  return fetchApi<
    FeatureRequest<{
      feedback: false;
      updates: true;
      scores: false;
    }>
  >(`/featurerequest/public/${id}`, { isPublic: true });
}

export function useFeatureRequestQuery(id: Uuid, enabled: boolean = true) {
  return useQuery(featureRequestKeys.one(id), () => getFeatureRequest(id), {
    enabled,
  });
}

export function usePublicFeatureRequestQuery(
  id: Uuid,
  enabled: boolean = true
) {
  return useQuery(
    featureRequestKeys.onePublic(id),
    () => getPublicFeatureRequest(id),
    {
      enabled,
    }
  );
}

function createFeatureRequest(
  payload: Create<
    Omit<
      FeatureRequest<{
        feedback: false;
        updates: false;
        scores: false;
      }>,
      "status"
    >
  > & {
    feedbackId?: Uuid;
  }
) {
  return fetchApi<FeatureRequest>("/featurerequest", {
    method: "POST",
    body: payload,
  });
}

export function useCreateFeatureRequestMutation() {
  return useMutation({
    mutationFn: createFeatureRequest,
    onSuccess: (data, variable) => {
      // invalidate all feature requests because this updates the scores
      queryClient.invalidateQueries(featureRequestKeys.all);
      if (variable.feedbackId) {
        // invalidate all feedback because this updates the status
        queryClient.invalidateQueries(feedbackKeys.all);
      }
      successToast(
        "Successfully created feature request",
        <Link href={`/dashboard/feature-requests/${data.id}`}>
          <ToastAction altText="Go to feature request">View</ToastAction>
        </Link>
      );
    },
    onError: (error) => {
      errorToast("Submission Error", String(error || "Something went wrong"));
    },
  });
}

function assignFeedbackToFeatureRequest({
  featureRequestId,
  feedbackId,
}: {
  featureRequestId: Uuid;
  feedbackId: Uuid;
}) {
  return fetchApi<void>(`/featurerequest/${featureRequestId}/feedback`, {
    method: "POST",
    body: { feedbackId },
  });
}

export function useAssignFeedbackToFeatureRequestMutation() {
  return useMutation({
    mutationFn: assignFeedbackToFeatureRequest,
    onSuccess: (_data, variables) => {
      // invalidate all feature requests because this updates the scores
      queryClient.invalidateQueries(featureRequestKeys.all);
      // invalidate all feedback because this updates the status
      queryClient.invalidateQueries(feedbackKeys.all);
      successToast(
        "Assigned to feature request",
        <Link
          href={`/dashboard/feature-requests/${variables.featureRequestId}`}
        >
          <ToastAction altText="Go to feature request">View</ToastAction>
        </Link>
      );
    },
    onError: (error) => {
      errorToast("Submission Error", String(error || "Something went wrong"));
    },
  });
}

function unlinkFeedbackOnFeatureRequest({
  featureRequestId,
  feedbackId,
}: {
  featureRequestId: Uuid;
  feedbackId: Uuid;
}) {
  return fetchApi<void>(
    `/featurerequest/${featureRequestId}/feedback/${feedbackId}`,
    {
      method: "DELETE",
    }
  );
}

export function useUnlinkFeedbackOnFeatureRequestMutation() {
  return useMutation({
    mutationFn: unlinkFeedbackOnFeatureRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(featureRequestKeys.all);
      queryClient.invalidateQueries(feedbackKeys.all);
      successToast("Deleted feedback from feature request");
    },
    onError: (error) => {
      errorToast("Deletion error", String(error || "Something went wrong"));
    },
  });
}

function deleteFeatureRequest(featureRequestId: Uuid) {
  return fetchApi<void>(`/featurerequest/${featureRequestId}`, {
    method: "DELETE",
  });
}

export function useDeleteFeatureRequestMutation() {
  const router = useRouter();
  return useMutation({
    mutationFn: deleteFeatureRequest,
    onSuccess: async () => {
      await router.push("/dashboard/feature-requests");
      setTimeout(() => {
        queryClient.invalidateQueries(feedbackKeys.all);
        queryClient.invalidateQueries(featureRequestKeys.all);
      }, 2000);
      successToast("Deleted feature request");
    },
    onError: (error) => {
      errorToast("Deletion error", String(error || "Something went wrong"));
    },
  });
}

function updateFeatureRequestStatus({
  featureRequestId,
  status,
}: {
  featureRequestId: Uuid;
  status: FeatureRequestStatus;
}) {
  return fetchApi<void>(`/featurerequest/${featureRequestId}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function useUpdateFeatureRequestStatusMutation() {
  return useMutation({
    mutationFn: updateFeatureRequestStatus,
    onMutate: ({ featureRequestId, status }) => {
      queryClient.setQueryData(
        featureRequestKeys.one(featureRequestId),
        (oldData: any) => ({
          ...oldData,
          status,
        })
      );
    },
    onSuccess: () => {
      // invalidate all feature requests because this updates the scores
      queryClient.invalidateQueries(featureRequestKeys.all);
      successToast("Updated feature request status");
    },
    onError: (error) => {
      errorToast("Update Error", String(error || "Something went wrong"));
    },
  });
}

function commentOnFeatureReqeust({
  featureRequestId,
  text,
}: {
  featureRequestId: Uuid;
  text: string;
}) {
  return fetchApi<void>(`/featurerequest/${featureRequestId}/comment`, {
    method: "POST",
    body: { text },
  });
}

export function useCommentOnFeatureRequestMutation() {
  return useMutation({
    mutationFn: commentOnFeatureReqeust,
    onMutate: ({ featureRequestId, text }) => {
      queryClient.setQueryData(
        featureRequestKeys.one(featureRequestId),
        (oldData: any) => ({
          ...oldData,
          updates: [
            ...oldData.updates,
            {
              id: `temp-${Math.random()}`,
              text,
              type: FeatureUpdateType.COMMENT,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })
      );
    },
    onSuccess: (_data, variables) => {
      // invalidate only the feature request that was commented on
      queryClient.invalidateQueries(
        featureRequestKeys.one(variables.featureRequestId)
      );
      queryClient.invalidateQueries(
        featureRequestKeys.onePublic(variables.featureRequestId)
      );
      successToast("Comment added to feature request");
    },
    onError: (error) => {
      errorToast("Submission Error", String(error || "Something went wrong"));
    },
  });
}

async function getReport() {
  const [feedback, featureRequests] = await Promise.all([
    fetchApi<{ top: Feedback[]; bottom: Feedback[] }>("/feedback/report"),
    fetchApi<FeatureRequest[]>("/featurerequest/report"),
  ]);

  return { top5: feedback.top, bottom5: feedback.bottom, featureRequests };
}

export function useReportQuery() {
  return useQuery("report", getReport);
}
