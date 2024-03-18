"use client";

import { Order, useFeedbackQuery, useReportQuery } from "@/api";
import { FormattedDate } from "@/components/FormattedDate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/datatable";
import { Form, SimpleFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { H1 } from "@/components/ui/text";
import { usePageOptionSearchForm } from "@/hooks/usePageOptionSearchForm";
import { usePageOptions } from "@/hooks/usePageOptions";
import { Printer, SearchIcon } from "lucide-react";
import { feedbackColumns, getCellClassName } from "./columns";

export default function Reports() {
  const { data } = useReportQuery();

  const { pageOptions, updateOptions } = usePageOptions({
    take: 1000,
    order: Order.ASC,
    orderBy: "sentiment_score",
  });
  const { searchForm, handleSearch } = usePageOptionSearchForm(
    pageOptions,
    updateOptions
  );
  const { data: searchData } = useFeedbackQuery(pageOptions);

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <H1>
          Roadmap Prioritization Report -{" "}
          <FormattedDate date={new Date().toString()} />
        </H1>
        <div className="flex items-center">
          <Button
            variant="default"
            className="print:hidden"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Feedback Keyword Search</CardTitle>
          <CardDescription className="print:hidden">
            Get a report of the lowest scored feedback entries based on your
            keyword search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...searchForm}>
            <form
              onSubmit={handleSearch}
              className="flex w-full items-center space-x-2"
            >
              <SimpleFormField
                form={searchForm}
                name="search"
                className="w-full"
              >
                <Input
                  data-testid="keyword-search-input"
                  type="text"
                  placeholder="Search..."
                />
              </SimpleFormField>
              <Button type="submit" className="print:hidden">
                <span className="hidden sm:block">Search</span>
                <SearchIcon className="h-4 w-4 sm:ml-2" />
              </Button>
            </form>
          </Form>
          <DataTable
            columns={feedbackColumns}
            getCellClassName={getCellClassName}
            data={searchData?.data ?? []}
            paginated
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top Overall Priority Feature Requests</CardTitle>
          <CardDescription>
            The current highest priority feature requests that are unscheduled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.featureRequests.map((fr, i) => (
                <TableRow
                  key={fr.id}
                  className={`${i !== 4 ? "border-b" : ""} p-4 space-y-2`}
                >
                  <TableCell>{fr.name}</TableCell>
                  <TableCell>{fr.description}</TableCell>
                  <TableCell>{fr.totalScore?.toFixed(2)}</TableCell>
                  <TableCell>{fr.feedbackCount}</TableCell>
                  <TableCell>
                    <FormattedDate date={fr.createdAt} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Recent Feedback</CardTitle>
          <CardDescription>
            The top 5 sentiment feedback received in the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Sentiment Score</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.top5.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.email}</TableCell>
                  <TableCell>{f.text}</TableCell>
                  <TableCell>{f.sentimentScore?.toFixed(2)}</TableCell>
                  <TableCell>{f.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Bottom 5 Recent Feedback</CardTitle>
          <CardDescription>
            The bottom 5 sentiment feedback received in the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Sentiment Score</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.bottom5.map((f, i) => (
                <TableRow
                  key={f.id}
                  className={`${i !== 4 ? "border-b" : ""} p-4`}
                >
                  <TableCell>{f.email}</TableCell>
                  <TableCell>{f.text}</TableCell>
                  <TableCell>{f.sentimentScore?.toFixed(2)}</TableCell>
                  <TableCell>{f.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
