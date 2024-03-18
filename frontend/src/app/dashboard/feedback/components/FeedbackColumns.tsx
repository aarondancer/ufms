"use client";

import { Feedback } from "@/api";
import { DateAgo } from "@/components/DateAgo";
import { SentimentIcon } from "@/components/SentimentIcon";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createColumnHelper } from "@tanstack/react-table";
import {
  CheckCircle,
  Eye,
  MinusCircle
} from "lucide-react";
import Link from "next/link";

const ch = createColumnHelper<Feedback>();

export const FB_STATUS_ICON_MAP: Record<Feedback["status"], React.ReactNode> = {
  UNREVIEWED: <MinusCircle className="h-4 w-4" />,
  REVIEWED: <CheckCircle className="h-4 w-4" />,
};

export const FB_STATUS_TEXT_MAP: Record<Feedback["status"], string> = {
  UNREVIEWED: "Unreviewed",
  REVIEWED: "Reviewed",
};

export const feedbackColumns = [
  ch.accessor("id", {
    header: "ID",
    cell: (info) => {
      const id = info.getValue();
      return (
        <Link
          href={`/dashboard/feedback/${id}`}
          className="hover:underline underline-offset-4 font-mono"
        >
          {id.slice(-12)}
        </Link>
      );
    },
  }),
  ch.accessor("email", {
    header: "Email",
    cell: (info) => {
      const id = info.row.original.id;
      const score = info.row.original.sentimentScore;
      const status = info.row.original.status;
      const raw = info.row.original.createdAt;
      return (
        <>
          <Link
            href={`/dashboard/feedback/${id}`}
            className="hover:underline underline-offset-4 font-mono"
          >
            <div className="flex flex-col justify-center">
              <div className="flex items-center">
                <span className="mr-2 sm:hidden sm:mr-0">
                  {FB_STATUS_ICON_MAP[status]}
                </span>
                <span className="text-ellipsis">{info.getValue()}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2 sm:hidden sm:mr-0">
                  <SentimentIcon score={score} />
                </span>
                <span className="flex md:hidden text-sm text-muted-foreground">
                  <DateAgo date={raw} />
                </span>
              </div>
            </div>
          </Link>
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
      return <DateAgo date={raw} />;
    },
  }),
  ch.display({
    id: "action",
    header: "Action",
    cell: (info) => {
      const id = info.row.original.id;
      return (
        <Link href={`/dashboard/feedback/${id}`}>
          <Button variant="outline" size="sm">
            <span className="hidden md:block mr-2">View</span>
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      );
    },
  }),
];
