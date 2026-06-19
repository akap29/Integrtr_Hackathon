// Dashboard.tsx
import React, { useEffect, useState } from "react";
import { OnboardingRecord } from "./types";
import { listOnboardings } from "./api";
import { StatusBadge } from "./StatusBadge";

interface Props {
  onStartNew: () => void;
  onOpenRecord: (id: string) => void;
}

function initials(employee: OnboardingRecord["employee"]) {
  return `${employee.firstName[0] ?? ""}${employee.lastName[0] ?? ""}`.toUpperCase();
}

const AVATAR_GRADIENTS = [
  "from-iris-500 to-aqua-400",
  "from-aqua-500 to-iris-400",
  "from-rose-500 to-amber-400",
  "from-amber-500 to-iris-400",
];

function avatarGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash + seed.charCodeAt(i)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[hash];
}

export function Dashboard({ onStartNew, onOpenRecord }: Props) {
  const [records, setRecords] = useState<OnboardingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listOnboardings().then((data) => {
      setRecords(data);
      setLoading(false);
    });
  }, []);

  const total = records.length;
  const completed = records.filter((r) => r.onboardingStatus === "completed").length;
  const needsAttention = records.filter((r) => r.onboardingStatus === "partially_completed").length;
  const inProgress = records.filter(
    (r) => r.onboardingStatus === "in_progress" || r.onboardingStatus === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-8">
          <p className="text-xs font-data uppercase tracking-widest text-iris-500 mb-2">HR · Onboarding</p>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold text-ink-900 mb-2">
            Onboarding dashboard
          </h1>
          <p className="text-sm text-ink-500 max-w-md">
            Here's what's happening with employee onboarding today.
          </p>
        </header>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total" value={total} accent="bg-ink-100" textClass="text-ink-700" dot="bg-ink-500" />
          <StatCard label="In progress" value={inProgress} accent="bg-iris-50" textClass="text-iris-700" dot="bg-iris-500" />
          <StatCard label="Needs attention" value={needsAttention} accent="bg-amber-50" textClass="text-amber-700" dot="bg-amber-500" />
          <StatCard label="Completed" value={completed} accent="bg-aqua-50" textClass="text-aqua-700" dot="bg-aqua-500" />
        </div>

        <button
          onClick={onStartNew}
          className="w-full mb-10 rounded-2xl border-2 border-dashed border-iris-200 bg-white hover:border-iris-400 hover:shadow-md hover:shadow-iris-100 transition-all px-6 py-6 flex items-center justify-between text-left group"
        >
          <div>
            <p className="text-base font-semibold text-ink-900">Start a new onboarding</p>
            <p className="text-sm text-ink-500 mt-0.5">
              Add personal details, then employment details, to create their record in SuccessFactors.
            </p>
          </div>
          <span className="rounded-lg bg-gradient-to-r from-iris-500 to-aqua-400 text-white text-sm font-medium px-4 py-2.5 shrink-0 shadow-sm group-hover:opacity-90 transition-opacity">
            + New employee
          </span>
        </button>

        <h2 className="text-base font-semibold text-ink-900 mb-4">Recent onboardings</h2>

        {loading && <p className="text-sm text-ink-400">Loading…</p>}

        <div className="space-y-3">
          {records.map((r) => (
            <button
              key={r._id}
              onClick={() => onOpenRecord(r._id)}
              className="w-full bg-white border border-ink-100 rounded-2xl px-5 py-4 flex items-center justify-between text-left hover:border-iris-200 hover:shadow-sm hover:shadow-iris-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full bg-gradient-to-br ${avatarGradient(
                    r.employeeKey
                  )} flex items-center justify-center text-sm font-semibold text-white shrink-0`}
                >
                  {initials(r.employee)}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-800">
                    {r.employee.firstName} {r.employee.lastName}
                  </p>
                  <p className="text-xs text-ink-500">
                    {r.employee.jobTitle} · {r.employee.department}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-data text-ink-400 hidden sm:inline">{r.requestId}</span>
                <StatusBadge status={r.onboardingStatus} />
              </div>
            </button>
          ))}

          {!loading && records.length === 0 && (
            <div className="text-center py-12 text-sm text-ink-500">
              No onboardings yet — start your first one above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  textClass,
  dot,
}: {
  label: string;
  value: number;
  accent: string;
  textClass: string;
  dot: string;
}) {
  return (
    <div className={`${accent} rounded-2xl px-4 py-4 border border-ink-100/60`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <p className={`text-xs ${textClass} opacity-90`}>{label}</p>
      </div>
      <p className={`text-2xl font-data font-medium ${textClass}`}>{value}</p>
    </div>
  );
}
