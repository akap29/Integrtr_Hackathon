import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import onboardingRoutes from "./routes/onboarding.routes.js";

const app = express();

app.use(express.json());

app.use(cors());

// Debug: log incoming requests and bodies
app.use((req, res, next) => {
	// eslint-disable-next-line no-console
	console.log('INCOMING', req.method, req.originalUrl, 'body keys:', Object.keys(req.body || {}));
	next();
});

app.use(helmet());

app.use(morgan("dev"));

app.use(
	"/api/onboarding",
	onboardingRoutes
);

export default app;
