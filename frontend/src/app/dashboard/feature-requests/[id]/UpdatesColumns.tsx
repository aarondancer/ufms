"use client";

import { FeatureRequestStatus, FeatureUpdate } from "@/api";
import { Badge } from "@/components/ui/badge";
import { createColumnHelper } from "@tanstack/react-table";

const ch = createColumnHelper<FeatureUpdate>();

const STATUS_REGEX = /STATUS UPDATED: From (.+) to (.+)./;

const STATUS_TEXT_MAP: Record<FeatureRequestStatus, string> = {
  [FeatureRequestStatus.UNSCHEDULED]: "Unscheduled",
  [FeatureRequestStatus.SCHEDULED]: "Scheduled",
  [FeatureRequestStatus.IN_PROGRESS]: "In Progress",
  [FeatureRequestStatus.COMPLETED]: "Completed",
  [FeatureRequestStatus.REJECTED]: "Rejected",
};

const STATUS_VARIANT_MAP: Record<
  FeatureRequestStatus,
  "default" | "destructive" | "outline"
> = {
  [FeatureRequestStatus.UNSCHEDULED]: "outline",
  [FeatureRequestStatus.SCHEDULED]: "default",
  [FeatureRequestStatus.IN_PROGRESS]: "default",
  [FeatureRequestStatus.COMPLETED]: "outline",
  [FeatureRequestStatus.REJECTED]: "destructive",
};

export const updatesColumns = [
  ch.accessor("text", {
    header: "Text",
    cell: (info) => {
      const value = info.getValue();
      const matches = value.match(STATUS_REGEX);
      if (matches) {
        return (
          <span>
            Status updated from{" "}
            <Badge
              variant={STATUS_VARIANT_MAP[matches[1] as FeatureRequestStatus]}
            >
              {STATUS_TEXT_MAP[matches[1] as FeatureRequestStatus]}
            </Badge>{" "}
            to{" "}
            <Badge
              variant={STATUS_VARIANT_MAP[matches[2] as FeatureRequestStatus]}
            >
              {STATUS_TEXT_MAP[matches[2] as FeatureRequestStatus]}
            </Badge>
          </span>
        );
      } else {
        return <span>{value}</span>;
      }
    },
  }),
];
