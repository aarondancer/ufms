"use client";

import { useFeedbackQuery } from "@/api";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { DataTablePagination } from "@/components/ui/datatable";
import { Form, SimpleFormField, z } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { usePageOptionSearchForm } from "@/hooks/usePageOptionSearchForm";
import { usePageOptions } from "@/hooks/usePageOptions";
import { useTablePaginationState } from "@/hooks/useTablePaginationState";
import { EraserIcon, ReloadIcon } from "@radix-ui/react-icons";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { SearchIcon, SearchX } from "lucide-react";
import { feedbackColumns } from "./components/FeedbackColumns";
import { cn } from "@/utils";

const getCellClassName = (id: string, header?: boolean) => {
  return cn(
    id === "id" && "hidden xl:table-cell",
    id === "status" && "hidden sm:table-cell",
    id === "sentimentScore" && `hidden sm:table-cell`,
    id === "createdAt" && "hidden md:table-cell",
    id === "action" && "hidden sm:table-cell"
  );
};

export default function Feedback() {
  const { pageOptions, updateOptions } = usePageOptions();
  const { data, isLoading, refetch } = useFeedbackQuery(pageOptions);
  const { pagination, setPagination } = useTablePaginationState(
    data,
    pageOptions,
    updateOptions
  );
  const { searchForm, handleSearch } = usePageOptionSearchForm(
    pageOptions,
    updateOptions
  );

  const table = useReactTable({
    data: data?.data ?? [],
    columns: feedbackColumns,
    pageCount: pagination.pageCount,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: (...args) => setPagination(...args),
    manualPagination: true,
  });

  return (
    <div className="space-y-4">
      <H1>Feedback</H1>
      <Form {...searchForm}>
        <form
          onSubmit={handleSearch}
          className="flex w-full items-center space-x-2"
        >
          <SimpleFormField form={searchForm} name="search" className="w-full">
            <Input type="text" placeholder="Search..." />
          </SimpleFormField>
          <Button type="submit">
            <span className="hidden sm:block">Submit</span>
            <SearchIcon className="h-4 w-4 sm:ml-2" />
          </Button>
        </form>
      </Form>
      <DataTablePagination table={table} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={getCellClassName(header.column.id, true)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                      <CardTitle>No feedback found.</CardTitle>
                      {pageOptions.q && (
                        <CardDescription>{`Unable to find any feedback for "${pageOptions.q}"`}</CardDescription>
                      )}
                    </div>
                    <div className="flex flex-col flex-grow-0 space-y-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          searchForm.setValue("search", "");
                          handleSearch();
                        }}
                      >
                        <EraserIcon className="h-4 w-4 mr-2" />
                        Clear Search
                      </Button>
                      <Button variant="ghost" onClick={() => refetch()}>
                        <ReloadIcon className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
