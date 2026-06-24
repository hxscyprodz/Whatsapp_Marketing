import os from "os";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { formatBytes, formatUptime } from "../utils/server.utils";

export const serverMetrics = (req: Request, res: Response) => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsagePercentage = ((usedMemory / totalMemory) * 100).toFixed(1);

  const diagnostics = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    performance: {
      uptime: formatUptime(process.uptime()),
      processUpTime: formatUptime(process.uptime()),
      loadAverage: os.loadavg(),
      cpuCount: os.cpus().length,
    },
    memory: {
      total: formatBytes(totalMemory),
      used: formatBytes(usedMemory),
      free: formatBytes(freeMemory),
      usagePercentage: `${memoryUsagePercentage}%`,
    },
    environment: {
      platform: os.platform(),
      architecture: os.arch(),
      nodeVersion: process.version,
    },
  };

  return res.status(StatusCodes.OK).json(diagnostics);
};
