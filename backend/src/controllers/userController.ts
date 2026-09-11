import { Request, Response } from "express";

export const getMe = async (req: Request, res: Response): Promise<void> => {
  res.json(req.user);
};