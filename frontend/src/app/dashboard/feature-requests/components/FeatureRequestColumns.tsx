"use client";

import { FeatureRequest } from "@/api";
import { DateAgo } from "@/components/DateAgo";
import { SentimentIcon } from "@/components/SentimentIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createColumnHelper } from "@tanstack/react-table";
import {
  CalendarCheck,
  CalendarX,
  CheckSquare,
  Eye,
  Hammer,
  Sigma,
  Sticker,
  ThumbsDown
} from "lucide-react";
import Link from "next/link";

export const FR_STATUS_ICON_MAP: Record<FeatureRequest["status"], React.ReactNode> = {
  UNSCHEDULED: <CalendarX className="h-4 w-4" />,
  SCHEDULED: <CalendarCheck className="h-4 w-4" />,
  IN_PROGRESS: <Hammer className="h-4 w-4" />,
  COMPLETED: <CheckSquare className="h-4 w-4" />,
  REJECTED: <ThumbsDown className="h-4 w-4" />,
};

export const FR_STATUS_TEXT_MAP: Record<FeatureRequest["status"], string> = {
  UNSCHEDULED: "Unscheduled",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

const ch = createColumnHelper<FeatureRequest>();

export const featureRequestColumns = [
  ch.accessor("id", {
    header: "ID",
    cell: (info) => {
      const id = info.getValue();
      return (
        <Link
          href={`/dashboard/feature-requests/${id}`}
          className="hover:underline underline-offset-4 font-mono"
        >
          {id.slice(-12)}
        </Link>
      );
    },
  }),
  ch.accessor("name", {
    header: "Request",
    cell: (info) => {
      const id = info.row.original.id;
      const raw = info.row.original.createdAt;
      const status = info.row.original.status;
      return (
        <Link
          href={`/dashboard/feature-requests/${id}`}
          className="hover:underline underline-offset-4 font-mono"
        >
          <div className="flex items-center">
            <span className="mr-2 sm:hidden sm:mr-0">
              {FR_STATUS_ICON_MAP[status]}
            </span>
            <div>
              {info.getValue()}
              <div className="sm:hidden text-sm text-muted-foreground">
                <DateAgo date={raw} />
              </div>
            </div>
          </div>
        </Link>
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
            {FR_STATUS_ICON_MAP[status]}
            <span className="ml-2">{FR_STATUS_TEXT_MAP[status]}</span>
          </div>
          <div className="flex lg:hidden items-center">
            <Tooltip>
              <TooltipTrigger>{FR_STATUS_ICON_MAP[status]}</TooltipTrigger>
              <TooltipContent>{FR_STATUS_TEXT_MAP[status]}</TooltipContent>
            </Tooltip>
          </div>
        </>
      );
    },
  }),
  ch.accessor("averageSentimentScore", {
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
  ch.accessor("feedbackCount", {
    header: "Feedback",
    cell: (info) => {
      const score = info.getValue();
      return (
        <div className="flex items-center">
          <Sticker className="h-4 w-4" />
          <span className="ml-1">{Math.round(score)}</span>
        </div>
      );
    },
  }),
  ch.accessor("totalScore", {
    header: "Score",
    cell: (info) => {
      const score = info.getValue();
      const sentimentScore = info.row.original.averageSentimentScore;
      const feedbackCount = info.row.original.feedbackCount;
      const variant =
        score >= 2000
          ? "destructive"
          : score >= 1000
          ? "default"
          : score > 0
          ? "outline"
          : "secondary";
      return (
        <Tooltip>
          <TooltipTrigger>
            <Badge variant={variant} className="justify-center  min-w-[60px]">
              {score !== 0 ? Math.round(score) : "-"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-1">
                <Sigma className="h-4 w-4" />
                <span className="font-semibold">Priority Score:</span>
                <span>{Math.round(score)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <SentimentIcon score={sentimentScore} />
                <span className="font-semibold">Sentiment:</span>
                <span>{Math.round(sentimentScore)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Sticker className="h-4 w-4" />
                <span className="font-semibold">Feedback Count:</span>
                <span>{feedbackCount}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
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
    header: "Action",
    cell: (info) => {
      const id = info.row.original.id;
      return (
        <Link href={`/dashboard/feature-requests/${id}`}>
          <Button variant="outline" size="sm">
            <span className="hidden md:block mr-2">View</span>
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      );
    },
  }),
];
