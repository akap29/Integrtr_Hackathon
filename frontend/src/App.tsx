// App.tsx
import React, { useState } from "react";
import { Dashboard } from "./Dashboard";
import { OnboardingFlow } from "./OnboardingFlow";
import { RecordDetail } from "./RecordDetail";

// Swap with the logged-in HR user from your auth context.
const CURRENT_USER = { userId: "abhay", name: "Abhay Sharma", email: "abhay@company.com" };

type Page = { name: "dashboard" } | { name: "form" } | { name: "detail"; id: string };

export default function App() {
  const [page, setPage] = useState<Page>({ name: "dashboard" });

  if (page.name === "form") {
    return (
      <OnboardingFlow
        currentUser={CURRENT_USER}
        onBack={() => setPage({ name: "dashboard" })}
        onCreated={(id) => setPage({ name: "detail", id })}
      />
    );
  }

  if (page.name === "detail") {
    return <RecordDetail recordId={page.id} onBack={() => setPage({ name: "dashboard" })} />;
  }

  return (
    <Dashboard
      onStartNew={() => setPage({ name: "form" })}
      onOpenRecord={(id) => setPage({ name: "detail", id })}
    />
  );
}
