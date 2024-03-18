"use client";

import {
  FeatureRequestStatus,
  Uuid,
  usePublicFeatureRequestQuery,
} from "@/api";
import { FormattedDate } from "@/components/FormattedDate";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/datatable";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { H1 } from "@/components/ui/text";
import { updatesColumns } from "../../../dashboard/feature-requests/[id]/UpdatesColumns";

const STATUS_TEXT_MAP: Record<FeatureRequestStatus, string> = {
  [FeatureRequestStatus.UNSCHEDULED]: "Unscheduled",
  [FeatureRequestStatus.SCHEDULED]: "Scheduled",
  [FeatureRequestStatus.IN_PROGRESS]: "In Progress",
  [FeatureRequestStatus.COMPLETED]: "Completed",
  [FeatureRequestStatus.REJECTED]: "Rejected",
};

const STATUS_VARIANT_MAP: Record<
  FeatureRequestStatus,
  "default" | "destructive" | "outline"
> = {
  [FeatureRequestStatus.UNSCHEDULED]: "outline",
  [FeatureRequestStatus.SCHEDULED]: "default",
  [FeatureRequestStatus.IN_PROGRESS]: "default",
  [FeatureRequestStatus.COMPLETED]: "outline",
  [FeatureRequestStatus.REJECTED]: "destructive",
};

export default function PublicFeatureRequestDetails({
  params,
}: {
  params: { id: string };
}) {
  const { data } = usePublicFeatureRequestQuery(params.id as Uuid);

  return (
    <div className="container p-4 space-y-4">
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
      <div className="flex justify-between">
        <H1>Feature Request</H1>
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
                {data && (
                  <Badge variant={STATUS_VARIANT_MAP[data.status]}>
                    {STATUS_TEXT_MAP[data.status]}
                  </Badge>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border-r px-4 py-3 font-semibold">
                Created At
              </TableCell>
              <TableCell className="px-4 py-3">
                {data && <FormattedDate date={data.createdAt} />}
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
          <div className="text-sm text-muted-foreground">
            {data?.description}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center space-x-4">
            <div>Updates</div>
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
