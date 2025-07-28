import express from "express";

import ServerConfig from "./config/ServerConfig.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import resumeRoutes from "./routes/resume.route.js";
import managerResumeRoutes from "./routes/manager.resume.route.js";
import adminResumeRoutes from "./routes/admin.resume.route.js";
import connectDB from "./config/dbConfig.js";
import recruiterRoutes from "./routes/recruiter.route.js";
import managerRoutes from "./routes/manager.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import scorecardRoute from "./routes/scorecard.route.js";
import adminRoutes from "./routes/admin.route.js";
import accountmanagerRoutes from "./routes/accountmanager.route.js";
const app = express();

app.use(
  cors({
    origin: ServerConfig.Frontend_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/resumes", resumeRoutes);
app.use("/api/manager/resumes", managerResumeRoutes);
app.use("/api/admin/resumes", adminResumeRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/manager",managerRoutes );
app.use("/api/company", companyRoute);
app.use("/api/jobs", jobRoute); 
app.use("/api/scorecard", scorecardRoute); 
app.use("/api/admin",adminRoutes);
app.use("/api/accountmanager",accountmanagerRoutes)
app.listen(ServerConfig.PORT, async () => {
  console.log(`Server started on port ${ServerConfig.PORT}...`);
});

connectDB();
