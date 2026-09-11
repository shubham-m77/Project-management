import "@clerk/express/env";
import { IUser } from "../models/User";

// Express ke Request type ko extend kar rahe hain taaki req.user
// TypeScript ko pata ho (attachUser middleware ye set karta hai)
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};