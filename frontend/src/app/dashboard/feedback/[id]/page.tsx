"use client";

import {
  Feedback,
  Uuid,
  useFeedbackByIdQuery,
  useFeedbackStatusMutation,
} from "@/api";
import { FormattedDate } from "@/components/FormattedDate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePlaceholders,
  TableRow,
} from "@/components/ui/table";
import { H1 } from "@/components/ui/text";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { SearchX } from "lucide-react";
import { feedbackColumns } from "../components/FeedbackColumns";
import { AssignFeedbackDialog } from "./components/AssignFeedbackDialog";
import { CreateFeatureRequestDialog } from "./components/CreateFeatureRequestDialog";
import {
  featureRequestColumns,
  getCellClassName,
} from "./components/FeatureRequestColumns";
import { DeleteFeedbackAlertDialog } from "./components/DeleteFeedbackDialog";

export default function FeedbackDetails({
  params,
}: {
  params: { id: string };
}) {
  const { data, isLoading } = useFeedbackByIdQuery(params.id as Uuid);
  const statusMutation = useFeedbackStatusMutation();

  const table = useReactTable({
    data: data?.featureRequests ?? [],
    columns: featureRequestColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <H1 data-testid="feedback-detail-title">Feedback</H1>
        {data && <DeleteFeedbackAlertDialog feedback={data} />}
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
                Email
              </TableCell>
              <TableCell
                data-testid="feedback-detail-email"
                className="px-4 py-3"
              >
                {data?.email}
              </TableCell>
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
                      feedbackId: params.id as Uuid,
                      status: value as Feedback["status"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNREVIEWED">Unreviewed</SelectItem>
                    <SelectItem value="REVIEWED">Reviewed</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border-r px-4 py-3 font-semibold">
                Sentiment Score
              </TableCell>
              <TableCell
                data-testid="feedback-detail-sentiment"
                className="px-4 py-3"
              >
                {data?.sentimentScore}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border-r px-4 py-3 font-semibold">
                Created At
              </TableCell>
              <TableCell
                data-testid="feedback-detail-createdat"
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
          <CardTitle>Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            data-testid="feedback-detail-text"
            className="text-sm text-muted-foreground"
          >
            {data?.text}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div>Associated Feature Requests</div>
            <div className="flex space-x-2">
              {data && <AssignFeedbackDialog feedback={data} />}
              {data && <CreateFeatureRequestDialog feedback={data} />}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((cell) => {
                    return (
                      <TableHead
                        key={cell.id}
                        className={getCellClassName(cell.column.id)}
                      >
                        {cell.isPlaceholder
                          ? null
                          : flexRender(
                              cell.column.columnDef.header,
                              cell.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={getCellClassName(cell.column.id)}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isLoading ? (
                <TablePlaceholders
                  count={10}
                  widths={[100, 240, 120, 60, 100, 80]}
                  height={32}
                />
              ) : (
                <TableRow>
                  <TableCell colSpan={feedbackColumns.length}>
                    <div className="flex flex-col flex-grow-0 space-y-4 items-center justify-center p-6">
                      <SearchX className="h-24 w-24 text-muted-foreground" />
                      <div className="text-center space-y-2">
                        <CardTitle>No feature requests associated.</CardTitle>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
