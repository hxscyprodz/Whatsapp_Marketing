import { Router } from "express";
import { serverMetrics } from "../controllers/server.controller";

const router = Router();

router.get("/server-stats", serverMetrics);

export default router;
