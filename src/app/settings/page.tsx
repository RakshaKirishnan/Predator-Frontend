"use client";

import React from "react";
import { AppShell } from "../../components/layout/AppShell";
import { EmailTemplateEditor } from "../../components/settings/EmailTemplateEditor";

export default function SettingsPage() {
  return (
    <AppShell activeTab="Settings">
      <EmailTemplateEditor />
    </AppShell>
  );
}
