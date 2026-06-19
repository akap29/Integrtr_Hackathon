// RecordDetail.tsx
import React, { useEffect, useState } from "react";
import { OnboardingRecord } from "./types";
import { getOnboarding } from "./api";
import { StatusBadge } from "./StatusBadge";
import { StepTracker } from "./StepTracker";

interface Props {
  recordId: string;
  onBack: () => void;
}

function initials(employee: OnboardingRecord["employee"]) {
  return `${employee.firstName[0] ?? ""}${employee.lastName[0] ?? ""}`.toUpperCase();
}

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RecordDetail({ recordId, onBack }: Props) {
  const [record, setRecord] = useState<OnboardingRecord | null>(null);

  useEffect(() => {
    let active = true;
    let timer: any;

    const fetchRecord = () => {
      getOnboarding(recordId).then((r) => {
        if (!active) return;
        setRecord(r ?? null);
        if (r && (r.onboardingStatus === "pending" || r.onboardingStatus === "in_progress")) {
          timer = setTimeout(fetchRecord, 3000);
        }
      }).catch((err) => {
        console.error("Record detail fetch error:", err);
        if (active) {
          timer = setTimeout(fetchRecord, 10000);
        }
      });
    };

    fetchRecord();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [recordId]);

  if (!record) {
    return (
      <div className="min-h-screen bg-ink-50">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <p className="text-sm text-ink-400">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="h-1.5 w-full bg-gradient-to-r from-iris-600 via-iris-400 to-aqua-500" />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button onClick={onBack} className="text-sm text-ink-500 hover:text-ink-800 mb-6">
          ← Back to dashboard
        </button>

        <div className="bg-white border border-ink-100 rounded-2xl shadow-sm shadow-iris-100/40 p-6">
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-iris-500 to-aqua-400 flex items-center justify-center text-sm font-semibold text-white">
                {initials(record.employee)}
              </div>
              <div>
                <p className="text-xs font-data text-ink-400">{record.requestId}</p>
                <h2 className="text-lg font-display font-semibold text-ink-900">
                  {record.employee.firstName} {record.employee.lastName}
                </h2>
              </div>
            </div>
            <StatusBadge status={record.onboardingStatus} />
          </div>
          <p className="text-sm text-ink-500 mb-6 ml-14">
            {record.employee.jobTitle} · {record.employee.department}
          </p>

          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <p className="text-xs font-medium text-iris-600 uppercase tracking-wide mb-3">
                Personal details
              </p>
              <dl className="text-sm space-y-2">
                <Row label="Email" value={record.employee.email} />
                <Row label="Gender" value={record.employee.gender} />
                <Row label="Date of birth" value={fmtDate(record.employee.dob)} />
                <Row label="Country" value={record.employee.country} />
                <Row label="Marital status" value={record.employee.maritalStatus} />
                <Row label="National ID" value={record.employee.nationalId} mono />
                <Row label="Address" value={record.employee.address} />
              </dl>
            </div>

            <div>
              <p className="text-xs font-medium text-aqua-700 uppercase tracking-wide mb-3">
                Employment details
              </p>
              <dl className="text-sm space-y-2">
                <Row label="Job title" value={record.employee.jobTitle} />
                <Row label="Department" value={record.employee.department} />
                <Row label="Start date" value={fmtDate(record.employee.startDate)} />
                <Row label="HR name" value={record.employee.hrName} />
                <Row label="HR email" value={record.employee.hrEmail} />
              </dl>

              <p className="text-xs font-medium text-ink-400 uppercase tracking-wide mb-3 mt-5">
                SuccessFactors reference
              </p>
              <dl className="text-sm space-y-2">
                <Row label="Person ID" value={record.successFactors.personIdExternal ?? "pending"} mono />
                <Row label="User ID" value={record.successFactors.userId ?? "pending"} mono />
                <Row label="Employment ID" value={record.successFactors.employmentId ?? "pending"} mono />
                <Row
                  label="Initiated by"
                  value={`${record.initiatedBy.name} · ${new Date(record.initiatedAt).toLocaleDateString()}`}
                />
                {record.retryCount > 0 && <Row label="Retries" value={String(record.retryCount)} />}
              </dl>
              {record.successFactors.deepLink && (
                <a
                  href={record.successFactors.deepLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-iris-600 underline mt-3 inline-block"
                >
                  Open record in SuccessFactors
                </a>
              )}
            </div>
          </div>

          <div className="border-t border-ink-100 pt-5">
            <p className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-3">
              Execution steps
            </p>
            <StepTracker record={record} onChange={setRecord} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-500 shrink-0">{label}</dt>
      <dd className={`text-ink-800 text-right truncate ${mono ? "font-data text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
