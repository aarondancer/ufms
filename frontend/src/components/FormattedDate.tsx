import { dayjs } from "@/utils";
import { useMemo } from "react";

export const FormattedDate = ({ date: raw }: { date: string }) => {
  const formatted = useMemo(() => {
    const date = dayjs(raw).tz(dayjs.tz.guess());
    return date.format("MMM D, YYYY h:mm A");
  }, [raw]);
  return <span>{formatted}</span>;
};
