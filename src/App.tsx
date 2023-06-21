import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import CollapsableSidebar from "./components/CollapsableSidebar";
import SameDay from "./components/pages/SameDay";
import LMCP from "./components/pages/LMCP";
import Settings from "./components/pages/Settings";

function App() {
  const [page, setPage] = useState("dcap");

  return (
    <div className="flex bg-primary">
      <CollapsableSidebar
        defaultSelected="dcap"
        onSelect={(page) => setPage(page)}
      />

      <div className="w-full h-full">
        <LMCP visible={page === "lmcp"} />
        <SameDay visible={page === "same-day"} />
        <Settings visible={page === "settings"} />
      </div>
    </div>
  );
}

export default App;
