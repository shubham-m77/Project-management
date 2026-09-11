import mongoose, { Schema, Document, Types } from "mongoose";

// Member sub-document ka shape
interface IMember {
  user: Types.ObjectId;
  role: "admin" | "member"; // union type - sirf ye do values valid hain
}

export interface IProject extends Document {
  name: string;
  description: string;
  owner: Types.ObjectId;
  members: IMember[];
  status: "planning" | "active" | "on-hold" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["admin", "member"], default: "member" },
      },
    ],
    status: {
      type: String,
      enum: ["planning", "active", "on-hold", "completed"],
      default: "planning",
    },
  },
  { timestamps: true }
);

ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ "members.user": 1 });

export default mongoose.model<IProject>("Project", ProjectSchema);