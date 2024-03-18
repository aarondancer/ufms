"use client";

import {
  FeatureRequest,
  FeatureRequestStatus,
  Uuid,
  useFeatureRequestQuery,
  useUpdateFeatureRequestStatusMutation,
} from "@/api";
import { FormattedDate } from "@/components/FormattedDate";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/datatable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { H1 } from "@/components/ui/text";
import { CommentFeatureRequestDialog } from "./AddCommentDialog";
import { DeleteFeatureRequestAlertDialog } from "./DeleteFeatureRequestDialog";
import { feedbackColumns, getCellClassName } from "./FeedbackColumns";
import { updatesColumns } from "./UpdatesColumns";

const statusOptions = Object.values(FeatureRequestStatus).map((status) => (
  <SelectItem key={status} value={status}>
    {status
      .toLowerCase()
      .split("_")
      .map((s) => `${s[0].toUpperCase()}${s.slice(1)}`)
      .join(" ")}
  </SelectItem>
));

export default function FeatureRequestDetails({
  params,
}: {
  params: { id: string };
}) {
  const { data } = useFeatureRequestQuery(params.id as Uuid);

  const statusMutation = useUpdateFeatureRequestStatusMutation();

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <H1>Feature Request</H1>
        {data && <DeleteFeatureRequestAlertDialog id={params.id as Uuid} />}
      </div>
      <Card>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="border-r px-4 py-3 font-semibold">
                ID
              </TableCell>
              <TableCell className="px-4 py-3">{data?.id.slice(-12)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border-r px-4 py-3 font-semibold">
                Name
              </TableCell>
              <TableCell className="px-4 py-3">{data?.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border-r px-4 py-3 font-semibold">
                Status
              </TableCell>
              <TableCell className="px-4 py-3">
                <Select
                  value={data?.status}
                  onValueChange={(value) =>
                    statusMutation.mutate({
                      featureRequestId: params.id as Uuid,
                      status: value as FeatureRequest["status"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>{statusOptions}</SelectContent>
                </Select>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border-r px-4 py-3 font-semibold">
                Priority Score
              </TableCell>
              <TableCell
                data-testid="feature-request-detail-score"
                className="px-4 py-3"
              >
                {Number(data?.totalScore)?.toFixed(2)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border-r px-4 py-3 font-semibold">
                Sentiment Score
              </TableCell>
              <TableCell
                data-testid="feature-request-detail-sentiment"
                className="px-4 py-3"
              >
                {Number(data?.averageSentimentScore)?.toFixed(2)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border-r px-4 py-3 font-semibold">
                Created At
              </TableCell>
              <TableCell
                data-testid="feature-request-detail-createdat"
                className="px-4 py-3"
              >
                {data && <FormattedDate date={data?.createdAt} />}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            data-testid="feature-request-detail-description"
            className="text-sm text-muted-foreground"
          >
            {data?.description}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center space-x-4">
            <div>Associated Feedback</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.feedbacks || []}
            paginated
            columns={feedbackColumns}
            getCellClassName={getCellClassName}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center space-x-4">
            <div>Updates</div>
            <CommentFeatureRequestDialog id={params.id as Uuid} />
          </CardTitle>
          <CardDescription>
            Status updates and comments from the product team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.updates || []}
            paginated
            columns={updatesColumns}
          />
        </CardContent>
      </Card>
    </div>
  );
}
