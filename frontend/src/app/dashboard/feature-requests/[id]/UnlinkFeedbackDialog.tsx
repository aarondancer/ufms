import { Uuid, useUnlinkFeedbackOnFeatureRequestMutation } from "@/api";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Unlink } from "lucide-react";
import { useState } from "react";

export function UnlinkFeedbackDialog({
  featureRequestId,
  feedbackId,
}: {
  featureRequestId: Uuid;
  feedbackId: Uuid;
}) {
  const [open, setOpen] = useState(false);
  const deleteMutation = useUnlinkFeedbackOnFeatureRequestMutation();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger>
          <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
            <Unlink className="h-4 w-4" />
            <span className="hidden ml-0 lg:ml-2 lg:block">Unlink</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Unlink feedback</TooltipContent>
      </Tooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unlink Feedback</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to unlink this feedback from this feature
            requeset?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              deleteMutation
                .mutateAsync({ featureRequestId, feedbackId })
                .then(() => setOpen(false))
            }
          >
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
