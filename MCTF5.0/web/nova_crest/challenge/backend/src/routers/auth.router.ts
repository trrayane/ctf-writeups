import { Router, type Router as ExpressRouter } from "express";
import {
  login,
  logout,
  me,
  refresh,
  register,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  validateLogin,
  validateLogout,
  validateRefresh,
  validateRegister,
} from "../middlewares/validators/auth.validators.js";

const authRouter: ExpressRouter = Router();

authRouter.post("/register", validateRegister, register);
authRouter.post("/login", validateLogin, login);
authRouter.post("/refresh", validateRefresh, refresh);
authRouter.post("/logout", validateLogout, logout);
authRouter.get("/me", requireAuth, me);

export { authRouter };
