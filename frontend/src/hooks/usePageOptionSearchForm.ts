import { PageOptionsDto } from "@/api";
import { useZodForm, z } from "@/components/ui/form";

const searchSchema = z.object({
  search: z.string(),
});

export const usePageOptionSearchForm = (
  pageOptions: PageOptionsDto,
  updateOptions: (options: Partial<PageOptionsDto>) => void
) => {
  const searchForm = useZodForm({
    schema: searchSchema,
    defaultValues: {
      search: pageOptions.q ?? "",
    },
  });

  const handleSearch = searchForm.handleSubmit(({ search: q }) => {
    updateOptions({ q });
  });

  return {
    searchForm,
    handleSearch,
  };
};
