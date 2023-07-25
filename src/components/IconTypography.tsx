import { SvgIconTypeMap, Typography } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
// import { Typography } from "@mui/material/styles/createTypography";
import React, { ComponentProps, ReactNode } from "react";

interface IconTypographyProps extends ComponentProps<typeof Typography> {
  children?: ReactNode;
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
    muiName: string;
  };
  // popOverText?: string;
  onClick?: () => void;
  iconHidden?: boolean;
}
const IconTypography = (props: IconTypographyProps) => {
  return (
    <div className={`cursor-pointer ${props.className}`}>
      <Typography onClick={props.onClick} {...props}>
        {props.children}
        {props.iconHidden ?? (
          <props.icon className="mt-[-0.25rem]" sx={{ fontSize: 15 }} />
        )}
      </Typography>
    </div>
  );
};

export default IconTypography;

// TODO: Add popover text support
