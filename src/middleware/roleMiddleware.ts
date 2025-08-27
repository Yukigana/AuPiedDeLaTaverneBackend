import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware.js";

export const requireRole = (roleName: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Non autorisé" });
    }

    const hasRole = req.user.roles?.some((r: any) => r.name === roleName);
    if (!hasRole) {
      return res.status(403).json({ error: "Accès interdit - rôle manquant" });
    }

    next();
  };
};
