"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { UserSession } from "@/lib/auth";

interface DashboardLayoutClientProps {
  user: UserSession | null;
  children: React.ReactNode;
}

export default function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-col flex-grow overflow-hidden">
        <Navbar
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-grow overflow-y-auto p-6 lg:p-8 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
