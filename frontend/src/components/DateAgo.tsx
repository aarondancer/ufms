import { dayjs } from "@/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMemo } from "react";

export const DateAgo = ({ date: raw }: { date: string }) => {
  const [ago, formatted] = useMemo(() => {
    const date = dayjs(raw).tz(dayjs.tz.guess());
    return [date.fromNow(), date.format("MMM D, YYYY h:mm A")] as const;
  }, [raw]);
  return (
    <Tooltip>
      <TooltipTrigger>
        <span>{ago}</span>
      </TooltipTrigger>
      <TooltipContent>
        <span>{formatted}</span>
      </TooltipContent>
    </Tooltip>
  );
};
