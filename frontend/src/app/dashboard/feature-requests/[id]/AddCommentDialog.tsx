import { Uuid, useCommentOnFeatureRequestMutation } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, SimpleFormField, useZodForm, z } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  text: z.string().min(4).max(2000),
});

function CommentForm({ id, onClose }: { id: Uuid; onClose: () => void }) {
  const commentMutation = useCommentOnFeatureRequestMutation();

  const form = useZodForm({
    schema,
    defaultValues: {
      text: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await commentMutation.mutateAsync({
      featureRequestId: id,
      text: values.text,
    });
    onClose();
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <SimpleFormField form={form} name="text" label="Comment">
          <Textarea
            placeholder="Enter a comment for the feature request"
            rows={10}
          />
        </SimpleFormField>
        <Button type="submit" loading={commentMutation.isLoading}>
          Submit
        </Button>
      </form>
    </Form>
  );
}

export function CommentFeatureRequestDialog({ id }: { id: Uuid }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          Comment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add comment to feature request</DialogTitle>
          <DialogDescription>
            Comment on the status, updates, or anything else related to this
            feature request.
          </DialogDescription>
          {open && <CommentForm id={id} onClose={() => setOpen(false)} />}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
