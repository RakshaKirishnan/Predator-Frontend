"use client";

import React from "react";
import { AppShell } from "../../components/layout/AppShell";
import { HelpSupportView } from "../../components/help/HelpSupportView";

export default function HelpPage() {
  return (
    <AppShell activeTab="Help & Support">
      <HelpSupportView />
    </AppShell>
  );
}
