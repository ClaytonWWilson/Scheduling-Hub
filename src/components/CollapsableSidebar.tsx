import React, { useState } from "react";
import CollapsableButton from "./CollapsableButton";

import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import WidgetsIcon from "@mui/icons-material/Widgets";
import SettingsIcon from "@mui/icons-material/Settings";
import HandymanIcon from "@mui/icons-material/Handyman";
import RouteIcon from "@mui/icons-material/Route";

type SidebarProps = {
  defaultSelected: string;
  onSelect: (page: string) => void;
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
      className={`h-[calc(100vh-.75rem)] min-h-[22rem] max-h-[33rem] float-left px-1 fixed transition-all ${
        collapsed ? "w-12 min-w-[3rem]" : "w-48 min-w-[12rem]"
      }`}
    >
      <div className="h-full w-full flex flex-col mt-2 shadow-md shadow-primary rounded-lg transition-all">
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
            setSelected("tasks");
            props.onSelect("tasks");
          }}
          selected={selected === "tasks"}
        />
        <CollapsableButton
          icon={WidgetsIcon}
          collapsed={collapsed}
          label="DCAP"
          onClick={() => {
            setSelected("dcap");
            props.onSelect("dcap");
          }}
          selected={selected === "dcap"}
        />
        <CollapsableButton
          icon={ThunderstormIcon}
          collapsed={collapsed}
          label="LMCP"
          onClick={() => {
            setSelected("lmcp");
            props.onSelect("lmcp");
          }}
          selected={selected === "lmcp"}
        />
        <CollapsableButton
          icon={HandymanIcon}
          collapsed={collapsed}
          label="Tools"
          onClick={() => {
            setSelected("tools");
            props.onSelect("tools");
          }}
          selected={selected === "tools"}
        />

        <CollapsableButton
          icon={SettingsIcon}
          collapsed={collapsed}
          label="Settings"
          onClick={() => {
            setSelected("settings");
            props.onSelect("settings");
          }}
          selected={selected === "settings"}
          className="mt-auto"
        />
      </div>
    </div>
  );
};

export default Sidebar;
