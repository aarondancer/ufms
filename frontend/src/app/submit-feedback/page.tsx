"use client";

import { useSubmitFeedbackMutation } from "@/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, SimpleFormField, useZodForm, z } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { H1 } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

const feedbackSchema = z.object({
  email: z.string().email(),
  text: z.string().min(10).max(10000),
});

export default function SubmitFeedback() {
  const [displayAlert, setDisplayAlert] = useState(false);
  const { isLoading, isSuccess, mutateAsync } = useSubmitFeedbackMutation();

  const feedbackForm = useZodForm({
    schema: feedbackSchema,
    defaultValues: {
      email: "",
      text: "",
    },
  });

  const handleSubmit = feedbackForm.handleSubmit(async (values) => {
    await mutateAsync(values);
    feedbackForm.reset();
  });

  useEffect(() => {
    if (isSuccess) {
      setDisplayAlert(true);
    }
  }, [isSuccess]);

  const successAlert = (
    <Alert variant="accent">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>Feedback recieved</AlertTitle>
      <AlertDescription>
        Thank you for submitting your feedback to FPI. We will review it soon!
      </AlertDescription>
    </Alert>
  );

  return (
    <div className="container flex flex-col space-y-4 p-4">
      <div className="relative z-20 flex items-center text-lg font-medium">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-6 w-6"
        >
          <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
        </svg>
        FPI
      </div>
      <H1>Submit Feedback to FPI</H1>
      <p className="text-muted-foreground max-w-[720px]">
        We value your input! Your feedback helps us improve our products and
        services. Please take a moment to share your thoughts with us.
        <br />
        <span>Thank you for being a valued part of our community.</span>
      </p>
      {displayAlert === false ? (
        <Form {...feedbackForm}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <SimpleFormField
              form={feedbackForm}
              name="email"
              label="Email Address"
            >
              <Input type="email" placeholder="Email" />
            </SimpleFormField>
            <SimpleFormField form={feedbackForm} name="text" label="Feedback">
              <Textarea
                rows={20}
                placeholder="Please enter your feedback here."
              />
            </SimpleFormField>
            <Button type="submit" loading={isLoading}>
              Submit
            </Button>
          </form>
        </Form>
      ) : (
        <div>{successAlert}</div>
      )}
    </div>
  );
}
