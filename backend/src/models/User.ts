import mongoose, { Schema, Document } from "mongoose";

// Ye interface batata hai ek User document mein kya-kya fields hongi
export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);