import { PageOptionsDto } from "@/api";
import { useCallback, useMemo, useRef, useState } from "react";

export const usePageOptions = (initial?: Partial<PageOptionsDto>) => {
  const initialRef = useRef(initial);
  const [pageOptions, setPageOptions] = useState(
    () => new PageOptionsDto(initial)
  );
  const updateOptions = useCallback((options: Partial<PageOptionsDto>) => {
    setPageOptions((prev) => new PageOptionsDto({ ...prev, ...options }));
  }, []);
  const resetOptions = useCallback((toInitial?: boolean) => {
    setPageOptions(
      new PageOptionsDto(toInitial ? initialRef.current : undefined)
    );
  }, []);
  return useMemo(
    () => ({ pageOptions, updateOptions, resetOptions } as const),
    [pageOptions, updateOptions, resetOptions]
  );
};
