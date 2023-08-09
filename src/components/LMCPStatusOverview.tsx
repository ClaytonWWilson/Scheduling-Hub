import React from "react";
import { Typography } from "@mui/material";
import { z } from "zod";

type LMCPStatusProps = {
  requested: number;
  pdr: number;
  currentLmcp: number;
  currentAtrops: number;
};

const LMCPApprovalStatus = z.enum([
  "auto_approved",
  "l7_required",
  "war_room",
  "unknown",
]);
type LMCPApprovalStatus = z.infer<typeof LMCPApprovalStatus>;

const getNewIntakeString = (requested: number, pdr: number) => {
  if (requested === 0) return "???";

  const newIntake = requested - pdr;
  if (Number.isNaN(newIntake)) return "???";
  return newIntake.toString();
};

const getApprovalStatusColor = (status: LMCPApprovalStatus) => {
  switch (status) {
    case LMCPApprovalStatus.enum.auto_approved:
      return "text-green-500";
    case LMCPApprovalStatus.enum.l7_required:
      return "text-yellow-400";
    case LMCPApprovalStatus.enum.war_room:
      return "text-red-500";
    case LMCPApprovalStatus.enum.unknown:
      return "";
  }
};

const getApprovalStatus = (
  requested: number,
  currentLmcp: number,
  currentAtrops: number
): LMCPApprovalStatus => {
  const percent = getAdjustmentPercent(requested, currentLmcp, currentAtrops);

  if (Number.isNaN(percent)) return LMCPApprovalStatus.enum.unknown;

  if (percent <= 5) {
    return LMCPApprovalStatus.enum.auto_approved;
  } else if (percent > 5 && percent <= 10) {
    return LMCPApprovalStatus.enum.l7_required;
  } else {
    return LMCPApprovalStatus.enum.war_room;
  }
};

const getAdjustmentPercent = (
  requested: number,
  currentLmcp: number,
  currentAtrops: number
) => {
  // Use the higher value between LMCP and ATROPS to determine the adjustment percentage
  const highestCurrentValue = Math.max(currentLmcp, currentAtrops);
  const adjustmentPercent = (requested / highestCurrentValue - 1) * 100;

  return adjustmentPercent;
};

const getApprovalStatusString = (status: LMCPApprovalStatus): string => {
  switch (status) {
    case LMCPApprovalStatus.enum.auto_approved:
      return "Auto-Approved";
    case LMCPApprovalStatus.enum.l7_required:
      return "L7 Required";
    case LMCPApprovalStatus.enum.war_room:
      return "War Room";
    case LMCPApprovalStatus.enum.unknown:
      return "???";
  }
};

const getDeltaString = (
  requested: number,
  currentLmcp: number,
  currentAtrops: number
): string => {
  const percent = getAdjustmentPercent(requested, currentLmcp, currentAtrops);

  if (Number.isNaN(percent)) return "???";

  if (percent > 100) {
    return "> 100%";
  } else if (percent < -100) {
    return "< -100%";
  } else {
    return `${percent.toFixed(2)}%`;
  }
};

const getLargerSourceString = (
  currentLmcp: number,
  currentAtrops: number
): string => {
  if (currentLmcp === 0 || currentAtrops === 0) return "???";

  if (currentLmcp > currentAtrops) {
    return "LMCP";
  } else {
    return "ATROPS";
  }
};

const LMCPStatusOverview = (props: LMCPStatusProps) => {
  return (
    <>
      <Typography align="center">{`New LMCP: ${getNewIntakeString(
        props.requested,
        props.pdr
      )}`}</Typography>
      <div className="grid grid-cols-3">
        <Typography
          className={`${getApprovalStatusColor(
            getApprovalStatus(
              props.requested,
              props.currentLmcp,
              props.currentAtrops
            )
          )}`}
          align="center"
        >{`Status: ${getApprovalStatusString(
          getApprovalStatus(
            props.requested,
            props.currentLmcp,
            props.currentAtrops
          )
        )}`}</Typography>
        <Typography align="center">{`Delta: ${getDeltaString(
          props.requested,
          props.currentLmcp,
          props.currentAtrops
        )}`}</Typography>
        <Typography align="center">{`Using: ${getLargerSourceString(
          props.currentLmcp,
          props.currentAtrops
        )}`}</Typography>
      </div>
    </>
  );
};

export default LMCPStatusOverview;
