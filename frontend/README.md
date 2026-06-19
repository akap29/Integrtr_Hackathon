# Employee onboarding dashboard

React + TypeScript + Tailwind. Dashboard → "Start onboarding" → HR fills the
employee form → redirects to a detail page that shows the live step tracker
(SuccessFactors → Team Slack → HR Slack), with retry on any failed step.

## How to run

1. Unzip this folder and open a terminal inside it.
2. Install dependencies:

   ```
   npm install
   ```

3. Start the dev server:

   ```
   npm run dev
   ```

4. Open the URL it prints (usually `http://localhost:5173`).

That's it — no backend needed to click through it. `src/api.ts` currently
uses an in-memory mock database, seeded with two sample onboarding requests.

## Wiring up your real backend

Everything that talks to the server lives in `src/api.ts`. Replace the
mock function bodies with real calls to your Express routes — no other
file needs to change:

```ts
// src/api.ts
export async function listOnboardings() {
  const res = await fetch("/api/onboarding");
  return res.json();
}

export async function startOnboarding(employee, initiatedBy) {
  const res = await fetch("/api/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employee, initiatedBy }),
  });
  return res.json();
}

export async function retryStep(id, step) {
  const res = await fetch(`/api/onboarding/${id}/retry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step }),
  });
  return res.json();
}
```

If your Express server runs on a different port during development, add a
proxy in `vite.config.ts`:

```ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { "/api": "http://localhost:5000" },
  },
});
```

## File structure

```
src/
  types.ts            - TS interfaces mirroring the mongo ledger schema
  api.ts               - service layer (mock now, swap for real fetch calls)
  App.tsx               - 3-page router: dashboard / form / detail
  Dashboard.tsx          - landing page, stats + "start onboarding" + recent list
  OnboardingForm.tsx      - HR intake form (7 fields)
  RecordDetail.tsx         - employee details + SF reference + step tracker
  StepTracker.tsx           - step progress UI with retry action
  StatusBadge.tsx            - status pill used across pages
```

## Building for production

```
npm run build
```

Outputs static files to `dist/`, ready to deploy or serve from Express.
