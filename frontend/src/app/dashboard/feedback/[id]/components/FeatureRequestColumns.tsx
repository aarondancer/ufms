import { FeatureRequest, Uuid } from "@/api";
import { UnlinkFeedbackDialog } from "@/app/dashboard/feature-requests/[id]/UnlinkFeedbackDialog";
import {
  FR_STATUS_ICON_MAP,
  FR_STATUS_TEXT_MAP,
} from "@/app/dashboard/feature-requests/components/FeatureRequestColumns";
import { DateAgo } from "@/components/DateAgo";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils";
import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { useParams } from "next/navigation";

export const getCellClassName = (id: string) => {
  return cn(
    id === "id" && "hidden xl:table-cell",
    id === "status" && "hidden sm:table-cell",
    id === "createdAt" && "hidden sm:table-cell"
  );
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
          target="_blank"
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
          target="_blank"
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
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const params = useParams();
      const feedbackId = params.id as Uuid;
      return (
        <UnlinkFeedbackDialog featureRequestId={id} feedbackId={feedbackId} />
      );
    },
  }),
];
