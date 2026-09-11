import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./config/db";
import userRoutes from "./routes/userRoutes";
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";

const app = express();

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: "100kb" }));
app.use(clerkMiddleware());

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK", service: "NOVA backend" });
});

app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => console.log(`NOVA backend running on port ${PORT}`));
};

startServer().catch((error: Error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
