import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Dashboard from "./components/Dashboard";
import MapExplorer from "./components/MapExplorer";
import ChangeDetection from "./components/ChangeDetection";
import Interventions from "./components/Interventions";
import Reports from "./components/Reports";

export default function App() {
  const [view, setView] = useState("dashboard");

  return (
    <div className="app-bg flex h-screen overflow-hidden">
      <Sidebar view={view} setView={setView} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar view={view} />
        <main key={view} className="flex-1 overflow-y-auto animate-fade-in">
          {view === "dashboard" && <Dashboard />}
          {view === "map" && <MapExplorer />}
          {view === "change" && <ChangeDetection />}
          {view === "interventions" && <Interventions />}
          {view === "reports" && <Reports />}
        </main>
      </div>
    </div>
  );
}
