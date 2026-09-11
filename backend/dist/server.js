"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_2 = require("@clerk/express");
const db_1 = __importDefault(require("./config/db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const app = (0, express_1.default)();
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";
app.use((0, cors_1.default)({ origin: allowedOrigin }));
app.use(express_1.default.json({ limit: "100kb" }));
app.use((0, express_2.clerkMiddleware)());
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", service: "NOVA backend" });
});
app.use("/api/users", userRoutes_1.default);
app.use("/api/projects", projectRoutes_1.default);
app.use("/api/tasks", taskRoutes_1.default);
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong" });
});
const PORT = Number(process.env.PORT) || 5000;
const startServer = async () => {
    await (0, db_1.default)();
    app.listen(PORT, () => console.log(`NOVA backend running on port ${PORT}`));
};
startServer().catch((error) => {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
});
