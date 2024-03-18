import {
  Feedback,
  Order,
  Uuid,
  useAssignFeedbackToFeatureRequestMutation,
  usePagedFeatureRequestsQuery,
} from "@/api";
import { FR_STATUS_ICON_MAP } from "@/app/dashboard/feature-requests/components/FeatureRequestColumns";
import { DateAgo } from "@/components/DateAgo";
import { SentimentIcon } from "@/components/SentimentIcon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePageOptions } from "@/hooks/usePageOptions";
import { cn } from "@/utils";
import { LinkIcon, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

function FeatureRequestAssignList({
  feedback,
}: {
  feedback: Feedback<{ featureRequests: true }>;
}) {
  const { pageOptions } = usePageOptions({
    take: 1000,
    orderBy: "created_at",
    order: Order.DESC,
  });
  const { data, isLoading } = usePagedFeatureRequestsQuery(pageOptions);
  const assignMutation = useAssignFeedbackToFeatureRequestMutation();

  const filtered = useMemo(() => {
    if (!feedback.featureRequests) return data?.data ?? [];
    return (
      data?.data.filter(
        (fr) => !feedback.featureRequests.find((f) => f.id === fr.id)
      ) ?? []
    );
  }, [data?.data, feedback.featureRequests]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full p-4">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center text-muted-foreground w-full p-4 space-y-4">
        <div>No feature requests</div>
        <DialogClose>
          <Button data-testid="assign-feedback-close">Close</Button>
        </DialogClose>
      </div>
    );
  }

  return filtered.map(({ id, status, createdAt, name, totalScore }, i) => (
    <div
      key={id}
      className={cn(
        "flex justify-between space-x-4 py-4",
        i !== filtered.length - 1 && "border-b"
      )}
    >
      <div>
        <div className="font-mono text-left">
          <div className="flex flex-col justify-center">
            <div className="flex items-center">
              <span className="mr-2">{FR_STATUS_ICON_MAP[status]}</span>
              <span className="text-ellipsis">{name}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">
                <SentimentIcon score={totalScore} />
              </span>
              <span className="flex text-sm text-muted-foreground">
                <DateAgo date={createdAt} />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <Button
          data-testid={`assign-feedback-${id}`}
          onClick={() =>
            assignMutation.mutateAsync({
              featureRequestId: id,
              feedbackId: feedback.id,
            })
          }
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Assign
        </Button>
      </div>
    </div>
  ));
}

export function AssignFeedbackDialog({
  feedback,
}: {
  feedback: Feedback<{ featureRequests: true }>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button data-testid="assign-feedback-trigger" variant="default">
          <LinkIcon className="h-4 w-4 mr-2" />
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent data-testid="assign-feedback-content">
        <DialogHeader>
          <DialogTitle>Assign feedback</DialogTitle>
          <DialogDescription>
            Assign this feedback to a feature request
          </DialogDescription>
          {open && <FeatureRequestAssignList feedback={feedback} />}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
