"use client";

import { useApiKeyQuery } from "@/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { H1 } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";

export default function Settings() {
  const { data } = useApiKeyQuery();

  return (
    <div className="space-y-4">
      <H1>Settings</H1>
      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          <CardDescription>
            Use this API key as a bearer token in the HTTP Authorization header
            to submit feedback from external integrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data?.accessToken}
            rows={8}
            className="font-mono"
          ></Textarea>
        </CardContent>
      </Card>
    </div>
  );
}
