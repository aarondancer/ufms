"use client";

import { usePagedFeatureRequestsQuery } from "@/api";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { DataTablePagination } from "@/components/ui/datatable";
import { Form, SimpleFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { AlertCircle, Hourglass, SearchIcon, SearchX } from "lucide-react";
import { featureRequestColumns } from "./components/FeatureRequestColumns";
import { cn } from "@/utils";

const defaultPageOptions = {
  orderBy: "priority",
  q: "",
  page: 1,
  take: 10,
};

const getCellClassName = (id: string) => {
  return cn(
    id === "id" && "hidden xl:table-cell",
    id === "status" && "hidden sm:table-cell",
    id === "averageSentimentScore" && "hidden xl:table-cell",
    id === "feedbackCount" && "hidden lg:table-cell",
    id === "createdAt" && "hidden sm:table-cell"
  );
};

export default function FeatureRequests() {
  const { pageOptions, updateOptions } = usePageOptions(defaultPageOptions);
  const { isLoading, data, refetch } = usePagedFeatureRequestsQuery(pageOptions);
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
    columns: featureRequestColumns,
    pageCount: pagination.pageCount,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
  });

  return (
    <div className="space-y-4">
      <H1>Feature Requests</H1>

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
      <div className="flex flex-wrap items-center w-full space-y-4 md:flex-nowrap md:space-y-0 md:justify-between md:space-x-4">
        <div className="flex flex-nowrap items-center space-x-2 w-full md:w-auto">
          <span>Sort:</span>
          <Select
            onValueChange={(value) => updateOptions({ orderBy: value })}
            value={pageOptions.orderBy}
          >
            <SelectTrigger className="w-full max-w-full md:max-w-[160px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">
                <div className="flex items-center">
                  <span className="flex items-center mr-2">
                    <AlertCircle className="w-4 h-4" />
                  </span>
                  Priority
                </div>
              </SelectItem>
              <SelectItem value="recent">
                <div className="flex items-center">
                  <span className="flex items-center mr-2">
                    <Hourglass className="w-4 h-4" />
                  </span>
                  Most Recent
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTablePagination table={table} />
      </div>
      <div className="rounded-md border">
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
                <TableCell colSpan={featureRequestColumns.length} className="w-full">
                  <div className="flex flex-col flex-grow-0 space-y-4 items-center justify-center p-6">
                    <SearchX className="h-24 w-24 text-muted-foreground" />
                    <div className="text-center space-y-2">
                      <CardTitle>No feature requests found.</CardTitle>
                      {pageOptions.q && (
                        <CardDescription>{`Unable to find any feature requests for "${pageOptions.q}"`}</CardDescription>
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
