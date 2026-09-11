"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_dns_1 = __importDefault(require("node:dns"));
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI is not configured");
    }
    if (mongoUri.includes("<") || mongoUri.includes(">")) {
        throw new Error("MONGO_URI still contains placeholders; replace <username>, <password>, <cluster>, and <database> in .env");
    }
    const dnsServers = process.env.DNS_SERVERS?.split(",").map((server) => server.trim()).filter(Boolean);
    if (dnsServers?.length) {
        node_dns_1.default.setServers(dnsServers);
    }
    try {
        const conn = await mongoose_1.default.connect(mongoUri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        throw error;
    }
};
exports.default = connectDB;
