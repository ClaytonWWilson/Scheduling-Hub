import { SvgIconTypeMap, Typography } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import React from "react";

type CollapsableButtonProps = {
  onClick: () => void;
  collapsed: boolean;
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
    muiName: string;
  };
  label: string;
  selected: boolean;
  className?: string;
};

const CollapsableButton = (props: CollapsableButtonProps) => {
  return (
    <div
      className={`flex text-center h-10 min-h-[2.5rem] overflow-clip text-clip rounded-lg cursor-pointer transition-all duration-[25] ${
        props.selected && "bg-secondarybutton"
      }${props.className ? " " + props.className : ""}`}
      onClick={props.onClick}
    >
      <props.icon className="ml-2 mt-2" sx={{ fontSize: 25 }} />
      {!props.collapsed && (
        <Typography className={`select-none pl-1 pt-2 `}>
          {props.selected ? <strong>{props.label}</strong> : props.label}
        </Typography>
      )}
    </div>
  );
};

export default CollapsableButton;
