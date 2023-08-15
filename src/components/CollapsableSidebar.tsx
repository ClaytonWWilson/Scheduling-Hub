import React, { useState } from "react";
import CollapsableButton from "./CollapsableButton";

import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import WidgetsIcon from "@mui/icons-material/Widgets";
import SettingsIcon from "@mui/icons-material/Settings";
import HandymanIcon from "@mui/icons-material/Handyman";
import RouteIcon from "@mui/icons-material/Route";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { Paper } from "@mui/material";
import { Page } from "../types/App";

type SidebarProps = {
  defaultSelected: Page;
  onSelect: (page: Page) => void;
  onCollapse: (isCollapsed: boolean) => void;
};

const Sidebar = (props: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState(props.defaultSelected);

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div
      className={`h-[calc(100vh-1.5rem)] min-h-[22rem] max-h-[35rem] float-left px-1 ml-3 fixed transition-all ${
        collapsed ? "w-12 min-w-[3rem]" : "w-48 min-w-[12rem]"
      }`}
    >
      <Paper className="h-full w-full flex flex-col mt-4 shadow-md rounded-lg transition-all">
        <div onClick={toggleCollapsed}></div>
        <CollapsableButton
          icon={AccessAlarmIcon}
          collapsed={collapsed}
          label="Scheduling Hub"
          onClick={() => {
            props.onCollapse(!collapsed);
            toggleCollapsed();
          }}
          selected={false}
        />
        <div
          className={`border-t-[1px] border-solid border-t-slate-600 w-auto mb-2 mt-1 transition-all mx-2`}
        ></div>
        <CollapsableButton
          icon={RouteIcon}
          collapsed={collapsed}
          label="Tasks"
          onClick={() => {
            setSelected(Page.enum.TASKS);
            props.onSelect(Page.enum.TASKS);
          }}
          selected={selected === Page.enum.TASKS}
        />
        <CollapsableButton
          icon={WidgetsIcon}
          collapsed={collapsed}
          label="DCAP"
          onClick={() => {
            setSelected(Page.enum.DCAP);
            props.onSelect(Page.enum.DCAP);
          }}
          selected={selected === Page.enum.DCAP}
        />
        <CollapsableButton
          icon={HandymanIcon}
          collapsed={collapsed}
          label="Tools"
          onClick={() => {
            setSelected(Page.enum.TOOLS);
            props.onSelect(Page.enum.TOOLS);
          }}
          selected={selected === Page.enum.TOOLS}
        />
        <CollapsableButton
          icon={ShowChartIcon}
          collapsed={collapsed}
          label="Stats"
          onClick={() => {
            setSelected(Page.enum.STATS);
            props.onSelect(Page.enum.STATS);
          }}
          selected={selected === Page.enum.STATS}
        />

        <CollapsableButton
          icon={SettingsIcon}
          collapsed={collapsed}
          label="Settings"
          onClick={() => {
            setSelected(Page.enum.SETTINGS);
            props.onSelect(Page.enum.SETTINGS);
          }}
          selected={selected === Page.enum.SETTINGS}
          className="mt-auto"
        />
      </Paper>
    </div>
  );
};

export default Sidebar;
