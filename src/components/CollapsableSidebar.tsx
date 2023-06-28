import React, { useState } from "react";
import CollapsableButton from "./CollapsableButton";

import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import WidgetsIcon from "@mui/icons-material/Widgets";
import SettingsIcon from "@mui/icons-material/Settings";

type SidebarProps = {
  defaultSelected: string;
  onSelect: (page: string) => void;
};

const Sidebar = (props: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState(props.defaultSelected);

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <div
      className={`h-screen min-h-[16rem] float-left p-1 transition-all ${
        collapsed ? "w-12 min-w-[3rem]" : "w-48 min-w-[12rem]"
      }`}
    >
      <div className="shadow-lg shadow-primary rounded-lg h-full w-full flex flex-col transition-all">
        <div onClick={toggleCollapsed}></div>
        <CollapsableButton
          icon={AccessAlarmIcon}
          collapsed={collapsed}
          label="Scheduling Hub"
          onClick={toggleCollapsed}
          selected={false}
        />
        <div
          className={`border-t-[1px] border-solid border-t-slate-600 w-auto mb-2 mt-1 transition-all mx-2`}
        ></div>
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
          icon={RocketLaunchIcon}
          collapsed={collapsed}
          label="Same Day"
          onClick={() => {
            setSelected("same-day");
            props.onSelect("same-day");
          }}
          selected={selected === "same-day"}
        />
        <CollapsableButton
          icon={FitnessCenterIcon}
          collapsed={collapsed}
          label="AMXL"
          onClick={() => {
            setSelected("amxl");
            props.onSelect("amxl");
          }}
          selected={selected === "amxl"}
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
