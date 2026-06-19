import React, { useState } from "react";

const STEP_LABELS = { sfWrite: "SuccessFactors", teamSlack: "Team Slack", hrSlack: "HR Slack" };

const STATUS_STYLES = {
  completed: "bg-teal-50 text-teal-800 border-teal-200",
  partially_completed: "bg-amber-50 text-amber-800 border-amber-200",
  in_progress: "bg-blue-50 text-blue-800 border-blue-200",
  pending: "bg-stone-100 text-stone-600 border-stone-200",
};
const STATUS_LABEL = {
  completed: "Completed",
  partially_completed: "Needs attention",
  in_progress: "In progress",
  pending: "Pending",
};
const STATUS_DOT = {
  completed: "bg-teal-600",
  partially_completed: "bg-amber-600",
  in_progress: "bg-blue-600",
  pending: "bg-stone-400",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

const STEP_DOT = {
  success: "bg-teal-600 border-teal-600",
  failed: "bg-rose-600 border-rose-600",
  in_progress: "bg-blue-600 border-blue-600 animate-pulse",
  pending: "bg-white border-stone-300",
};

function StepTracker({ record, onChange }) {
  const [retrying, setRetrying] = useState(null);
  const keys = Object.keys(record.steps);

  function handleRetry(step) {
    setRetrying(step);
    setTimeout(() => {
      const updatedSteps = {
        ...record.steps,
        [step]: { status: "success", completedAt: new Date().toISOString(), error: null },
      };
      const allDone = Object.values(updatedSteps).every((s) => s.status === "success");
      onChange({
        ...record,
        steps: updatedSteps,
        onboardingStatus: allDone ? "completed" : "partially_completed",
      });
      setRetrying(null);
    }, 600);
  }

  return (
    <div>
      {keys.map((key, idx) => {
        const step = record.steps[key];
        const isLast = idx === keys.length - 1;
        return (
          <div key={key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`block h-2.5 w-2.5 rounded-full border ${STEP_DOT[step.status]}`} />
              {!isLast && <span className="w-px flex-1 bg-stone-200" style={{ minHeight: 28 }} />}
            </div>
            <div className="pb-5 -mt-0.5 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-stone-800">{STEP_LABELS[key]}</p>
                {step.status === "failed" && (
                  <button
                    onClick={() => handleRetry(key)}
                    disabled={retrying === key}
                    className="text-xs font-medium text-amber-700 border border-amber-300 rounded-md px-2 py-1 hover:bg-amber-50 disabled:opacity-50"
                  >
                    {retrying === key ? "Retrying…" : "Retry step"}
                  </button>
                )}
              </div>
              <p className="text-xs font-mono text-stone-500 mt-0.5">
                {step.status === "success" && step.completedAt
                  ? `done · ${new Date(step.completedAt).toLocaleTimeString()}`
                  : step.status === "failed"
                  ? `failed · ${step.error ?? "unknown error"}`
                  : step.status === "in_progress"
                  ? "running…"
                  : "waiting"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const emptyStep = () => ({ status: "pending", completedAt: null, error: null });

const INITIAL_RECORDS = [
  {
    _id: "1",
    requestId: "ONB-20260619-001",
    initiatedAt: "2026-06-19T09:12:00Z",
    employee: {
      firstName: "John", lastName: "Doe", email: "john.doe@company.com",
      department: "Engineering", division: "Product", jobTitle: "Software Engineer",
      managerEmail: "manager@company.com", startDate: "2026-06-20", country: "IN",
    },
    successFactors: { personIdExternal: "100045" },
    steps: {
      sfWrite: { status: "success", completedAt: "2026-06-19T09:13:10Z", error: null },
      teamSlack: { status: "success", completedAt: "2026-06-19T09:13:14Z", error: null },
      hrSlack: { status: "failed", completedAt: null, error: "channel_not_found" },
    },
    onboardingStatus: "partially_completed",
  },
  {
    _id: "2",
    requestId: "ONB-20260618-014",
    initiatedAt: "2026-06-18T14:02:00Z",
    employee: {
      firstName: "Priya", lastName: "Menon", email: "priya.menon@company.com",
      department: "Design", division: "Product", jobTitle: "Product Designer",
      managerEmail: "lead.design@company.com", startDate: "2026-06-22", country: "IN",
    },
    successFactors: { personIdExternal: "100046" },
    steps: {
      sfWrite: { status: "success", completedAt: "2026-06-18T14:03:00Z", error: null },
      teamSlack: { status: "success", completedAt: "2026-06-18T14:03:05Z", error: null },
      hrSlack: { status: "success", completedAt: "2026-06-18T14:03:08Z", error: null },
    },
    onboardingStatus: "completed",
  },
];

function initials(employee) {
  return `${employee.firstName[0] ?? ""}${employee.lastName[0] ?? ""}`.toUpperCase();
}

function Dashboard({ records, onStartNew, onOpenRecord }) {
  const total = records.length;
  const completed = records.filter((r) => r.onboardingStatus === "completed").length;
  const needsAttention = records.filter((r) => r.onboardingStatus === "partially_completed").length;
  const inProgress = records.filter((r) => r.onboardingStatus === "in_progress" || r.onboardingStatus === "pending").length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-stone-400 mb-1">HR · onboarding</p>
        <h1 className="text-3xl text-stone-900 mb-1" style={{ fontFamily: "Georgia, serif" }}>
          Good morning, Abhay
        </h1>
        <p className="text-sm text-stone-500">Here's what's happening with employee onboarding today.</p>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="bg-white border border-stone-200 rounded-xl px-4 py-4">
          <p className="text-xs text-stone-500 mb-1">Total</p>
          <p className="text-2xl text-stone-900 font-mono">{total}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl px-4 py-4">
          <p className="text-xs text-stone-500 mb-1">In progress</p>
          <p className="text-2xl text-blue-700 font-mono">{inProgress}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl px-4 py-4">
          <p className="text-xs text-stone-500 mb-1">Needs attention</p>
          <p className="text-2xl text-amber-700 font-mono">{needsAttention}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl px-4 py-4">
          <p className="text-xs text-stone-500 mb-1">Completed</p>
          <p className="text-2xl text-teal-700 font-mono">{completed}</p>
        </div>
      </div>

      <button
        onClick={onStartNew}
        className="w-full mb-10 rounded-xl border-2 border-dashed border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50 transition-colors px-6 py-6 flex items-center justify-between text-left"
      >
        <div>
          <p className="text-base font-medium text-stone-900">Start a new onboarding</p>
          <p className="text-sm text-stone-500 mt-0.5">Fill in employee details to create their record in SuccessFactors.</p>
        </div>
        <span className="rounded-lg bg-stone-900 text-white text-sm font-medium px-4 py-2.5 shrink-0">
          + New employee
        </span>
      </button>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-stone-900">Recent onboardings</h2>
      </div>

      <div className="space-y-3">
        {records.map((r) => (
          <button
            key={r._id}
            onClick={() => onOpenRecord(r._id)}
            className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 flex items-center justify-between text-left hover:border-stone-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center text-sm font-medium text-stone-600 shrink-0">
                {initials(r.employee)}
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800">
                  {r.employee.firstName} {r.employee.lastName}
                </p>
                <p className="text-xs text-stone-500">{r.employee.jobTitle} · {r.employee.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-stone-400 hidden sm:inline">{r.requestId}</span>
              <StatusBadge status={r.onboardingStatus} />
            </div>
          </button>
        ))}

        {records.length === 0 && (
          <div className="text-center py-12 text-sm text-stone-500">No onboardings yet — start your first one above.</div>
        )}
      </div>
    </div>
  );
}

function RecordDetail({ record, onChange, onBack }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button onClick={onBack} className="text-sm text-stone-500 hover:text-stone-800 mb-6">← Back to dashboard</button>
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-stone-100 flex items-center justify-center text-sm font-medium text-stone-600">
              {initials(record.employee)}
            </div>
            <div>
              <p className="text-xs font-mono text-stone-400">{record.requestId}</p>
              <h2 className="text-lg text-stone-900" style={{ fontFamily: "Georgia, serif" }}>
                {record.employee.firstName} {record.employee.lastName}
              </h2>
            </div>
          </div>
          <StatusBadge status={record.onboardingStatus} />
        </div>
        <p className="text-sm text-stone-500 mb-6 ml-14">{record.employee.jobTitle} · {record.employee.department}</p>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Employee details</p>
            <dl className="text-sm space-y-2">
              <Row label="Email" value={record.employee.email} />
              <Row label="Department" value={record.employee.department} />
              <Row label="Division" value={record.employee.division || "—"} />
              <Row label="Job title" value={record.employee.jobTitle} />
              <Row label="Manager" value={record.employee.managerEmail} />
              <Row
                label="Start date"
                value={new Date(record.employee.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              />
              <Row label="Country" value={record.employee.country} />
            </dl>
          </div>

          <div>
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">SuccessFactors reference</p>
            <dl className="text-sm space-y-2">
              <Row label="Person ID" value={record.successFactors.personIdExternal ?? "pending"} mono />
              {record.retryCount > 0 && <Row label="Retries" value={String(record.retryCount)} />}
            </dl>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-5">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Execution steps</p>
          <StepTracker record={record} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-stone-500 shrink-0">{label}</dt>
      <dd className={`text-stone-800 text-right truncate ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

const EMPTY_FORM = {
  firstName: "", lastName: "", email: "", department: "", division: "",
  jobTitle: "", managerEmail: "", startDate: "", country: "IN",
};

function validate(v) {
  const e = {};
  if (!v.firstName.trim()) e.firstName = "First name is required";
  if (!v.lastName.trim()) e.lastName = "Last name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Enter a valid email";
  if (!v.department.trim()) e.department = "Department is required";
  if (!v.jobTitle.trim()) e.jobTitle = "Job title is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.managerEmail)) e.managerEmail = "Enter a valid manager email";
  if (!v.startDate) e.startDate = "Start date is required";
  return e;
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-stone-600 mb-1.5 block">{label}</span>
      {children}
      {error && <span className="text-xs text-rose-600 mt-1 block">{error}</span>}
    </label>
  );
}

const inputClass = "w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400";

function FormPage({ records, setRecords, onBack, onCreated }) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function update(key, val) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const requestId = `ONB-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(records.length + 1).padStart(3, "0")}`;
    const record = {
      _id: String(Date.now()),
      requestId,
      initiatedAt: new Date().toISOString(),
      employee: { ...values },
      successFactors: { personIdExternal: null },
      steps: { sfWrite: emptyStep(), teamSlack: emptyStep(), hrSlack: emptyStep() },
      onboardingStatus: "pending",
    };
    setRecords((prev) => [record, ...prev]);
    setSubmitting(false);
    onCreated(record._id);
    runProgress(record, setRecords);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button onClick={onBack} className="text-sm text-stone-500 hover:text-stone-800 mb-6">← Back to dashboard</button>
      <p className="text-xs font-mono uppercase tracking-widest text-stone-400 mb-1">New onboarding request</p>
      <h1 className="text-2xl text-stone-900 mb-1" style={{ fontFamily: "Georgia, serif" }}>Employee details</h1>
      <p className="text-sm text-stone-500 mb-6">These fields create the record in SuccessFactors and trigger the Slack notifications.</p>

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" error={errors.firstName}>
            <input className={inputClass} value={values.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="John" />
          </Field>
          <Field label="Last name" error={errors.lastName}>
            <input className={inputClass} value={values.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Doe" />
          </Field>
        </div>

        <Field label="Work email" error={errors.email}>
          <input type="email" className={inputClass} value={values.email} onChange={(e) => update("email", e.target.value)} placeholder="john.doe@company.com" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Department" error={errors.department}>
            <input className={inputClass} value={values.department} onChange={(e) => update("department", e.target.value)} placeholder="Engineering" />
          </Field>
          <Field label="Division (optional)">
            <input className={inputClass} value={values.division} onChange={(e) => update("division", e.target.value)} placeholder="Product" />
          </Field>
        </div>

        <Field label="Job title" error={errors.jobTitle}>
          <input className={inputClass} value={values.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} placeholder="Software Engineer" />
        </Field>

        <Field label="Manager email" error={errors.managerEmail}>
          <input type="email" className={inputClass} value={values.managerEmail} onChange={(e) => update("managerEmail", e.target.value)} placeholder="manager@company.com" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start date" error={errors.startDate}>
            <input type="date" className={inputClass} value={values.startDate} onChange={(e) => update("startDate", e.target.value)} />
          </Field>
          <Field label="Country">
            <select className={inputClass} value={values.country} onChange={(e) => update("country", e.target.value)}>
              <option value="IN">India</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
            </select>
          </Field>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button type="submit" disabled={submitting} className="rounded-md bg-stone-900 text-white text-sm font-medium px-5 py-2.5 hover:bg-stone-800 disabled:opacity-50">
            {submitting ? "Creating employee…" : "Create employee"}
          </button>
          <span className="text-xs text-stone-400">Initiated by Abhay Sharma</span>
        </div>
      </form>
    </div>
  );
}

function runProgress(record, setRecords) {
  const order = ["sfWrite", "teamSlack", "hrSlack"];
  let i = 0;

  function step() {
    if (i >= order.length) {
      setRecords((prev) =>
        prev.map((r) =>
          r._id === record._id
            ? { ...r, onboardingStatus: "completed", successFactors: { personIdExternal: "100050" } }
            : r
        )
      );
      return;
    }
    const key = order[i];
    setRecords((prev) =>
      prev.map((r) =>
        r._id === record._id
          ? { ...r, onboardingStatus: "in_progress", steps: { ...r.steps, [key]: { ...r.steps[key], status: "in_progress" } } }
          : r
      )
    );
    setTimeout(() => {
      setRecords((prev) =>
        prev.map((r) =>
          r._id === record._id
            ? { ...r, steps: { ...r.steps, [key]: { status: "success", completedAt: new Date().toISOString(), error: null } } }
            : r
        )
      );
      i += 1;
      step();
    }, 700);
  }
  step();
}

export default function App() {
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [page, setPage] = useState("dashboard");
  const [activeId, setActiveId] = useState(null);

  const activeRecord = records.find((r) => r._id === activeId);

  return (
    <div className="min-h-screen bg-stone-50">
      {page === "dashboard" && (
        <Dashboard
          records={records}
          onStartNew={() => setPage("form")}
          onOpenRecord={(id) => { setActiveId(id); setPage("detail"); }}
        />
      )}
      {page === "form" && (
        <FormPage
          records={records}
          setRecords={setRecords}
          onBack={() => setPage("dashboard")}
          onCreated={(id) => { setActiveId(id); setPage("detail"); }}
        />
      )}
      {page === "detail" && activeRecord && (
        <RecordDetail
          record={activeRecord}
          onChange={(updated) => setRecords((prev) => prev.map((r) => (r._id === updated._id ? updated : r)))}
          onBack={() => setPage("dashboard")}
        />
      )}
    </div>
  );
}