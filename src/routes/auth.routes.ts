import { Router } from "express";
import { clientLogin, clientSignup } from "../controllers/auth.controller";

const router = Router();

router.post("/login", clientLogin);
router.post("/register", clientSignup)

export default router;