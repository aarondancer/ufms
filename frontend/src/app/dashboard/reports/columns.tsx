"use client";

import { Feedback } from "@/api";
import { FormattedDate } from "@/components/FormattedDate";
import { SentimentIcon } from "@/components/SentimentIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils";
import { createColumnHelper } from "@tanstack/react-table";
import { FB_STATUS_ICON_MAP, FB_STATUS_TEXT_MAP } from "../feedback/components/FeedbackColumns";

export const getCellClassName = (id: string, header?: boolean) => {
  return cn(
    id === "id" && "hidden xl:table-cell",
    id === "status" && "hidden sm:table-cell",
    id === "sentimentScore" && `hidden sm:table-cell`,
    id === "createdAt" && "hidden md:table-cell"
  );
};

const ch = createColumnHelper<Feedback>();

export const feedbackColumns = [
  ch.accessor("email", {
    header: "Info",
    cell: (info) => {
      const id = info.row.original.id;
      const raw = info.row.original.createdAt;
      return (
        <>
          <div className="font-mono">
            <div className="flex flex-col justify-center">
              <div className="flex items-center">
                <span className="text-ellipsis">{info.getValue()}</span>
              </div>
              <div className="flex items-center">
                <span className="flex text-sm text-muted-foreground">
                  <FormattedDate date={raw} />
                </span>
              </div>
            </div>
          </div>
        </>
      );
    },
  }),
  ch.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue();
      return (
        <>
          <div className="hidden lg:flex items-center">
            {FB_STATUS_ICON_MAP[status]}
            <span className="ml-2">{FB_STATUS_TEXT_MAP[status]}</span>
          </div>
          <div className="flex lg:hidden items-center">
            <Tooltip>
              <TooltipTrigger>{FB_STATUS_ICON_MAP[status]}</TooltipTrigger>
              <TooltipContent>{FB_STATUS_TEXT_MAP[status]}</TooltipContent>
            </Tooltip>
          </div>
        </>
      );
    },
  }),
  ch.accessor("sentimentScore", {
    header: "Sentiment",
    cell: (info) => {
      const score = info.getValue();
      return (
        <>
          <div className="hidden lg:flex items-center">
            <SentimentIcon score={score} />
            <span className="ml-2">{Math.round(score)}</span>
          </div>
          <div className="flex lg:hidden items-center">
            <Tooltip>
              <TooltipTrigger>
                <SentimentIcon score={score} />
              </TooltipTrigger>
              <TooltipContent>{score?.toFixed(2)}</TooltipContent>
            </Tooltip>
          </div>
        </>
      );
    },
  }),
  ch.accessor("createdAt", {
    header: "Date",
    cell: (info) => {
      const raw = info.getValue();
      return <FormattedDate date={raw} />;
    },
  }),
];
