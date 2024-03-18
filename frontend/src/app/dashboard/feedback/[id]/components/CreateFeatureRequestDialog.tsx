import { Feedback, useCreateFeatureRequestMutation } from "@/api";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(4).max(80),
  description: z.string().min(4).max(2000),
});

function FeatureRequestCreateForm({
  feedback,
  onClose,
}: {
  feedback: Feedback<{ featureRequests: true }>;
  onClose: () => void;
}) {
  const createFrMutation = useCreateFeatureRequestMutation();

  const form = useZodForm({
    schema,
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await createFrMutation.mutateAsync({
      ...values,
      feedbackId: feedback.id,
    });
    onClose();
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <SimpleFormField
          form={form}
          name="name"
          label="Name"
          description="The name of a feature request should summarize the description."
        >
          <Input placeholder="Enter a name for the feature request" />
        </SimpleFormField>
        <SimpleFormField
          form={form}
          name="description"
          label="Description"
          description="The description of the feature request should address the problem in the feedback and outline a solution."
        >
          <Textarea
            placeholder="Enter a description for the feature request"
            rows={10}
          />
        </SimpleFormField>
        <Button type="submit" loading={createFrMutation.isLoading}>
          Submit
        </Button>
      </form>
    </Form>
  );
}

export function CreateFeatureRequestDialog({
  feedback,
}: {
  feedback: Feedback<{ featureRequests: true }>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          New
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new feature request</DialogTitle>
          <DialogDescription>
            Create a new feature request based on the feedback you selected.
          </DialogDescription>
          {open && (
            <FeatureRequestCreateForm
              feedback={feedback}
              onClose={() => setOpen(false)}
            />
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
