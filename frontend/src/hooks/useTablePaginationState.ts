import { PageOptionsDto, Paged } from "@/api";
import { PaginationState } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { usePageOptions } from "./usePageOptions";

export const useTablePaginationState = <T>(
  data: Paged<T> | undefined,
  pageOptions: PageOptionsDto,
  updateOptions: ReturnType<typeof usePageOptions>["updateOptions"]
) => {
  const pagination = useMemo(
    () => ({
      pageCount: data?.meta?.pageCount ?? 1,
      pageIndex: (data?.meta?.page ?? 1) - 1,
      pageSize: pageOptions.take,
    }),
    [data?.meta?.page, data?.meta?.pageCount, pageOptions.take]
  );

  const setPagination = useCallback(
    (
      updates: PaginationState | ((old: PaginationState) => PaginationState)
    ) => {
      if (typeof updates === "function") {
        updates = updates(pagination);
      }
      updateOptions({
        page: updates.pageIndex + 1,
        take: updates.pageSize,
      });
    },
    [pagination, updateOptions]
  );

  return {
    pagination,
    setPagination,
  };
};
