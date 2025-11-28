import { Request, Response } from "express";
import { MongoDBConnection } from "@infrastructure/database/mongodb/connection";
import { createClient } from "redis";
import { config } from "@infrastructure/config/env";

export class HealthController {
  async check(_req: Request, res: Response): Promise<void> {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        mongodb: await this.checkMongoDB(),
        redis: await this.checkRedis(),
      },
    };

    const isHealthy =
      health.services.mongodb.status === "up" &&
      health.services.redis.status === "up";

    res.status(isHealthy ? 200 : 503).json(health);
  }

  private async checkMongoDB(): Promise<{
    status: string;
    message?: string;
  }> {
    try {
      const mongoConnection = MongoDBConnection.getInstance();
      const db = mongoConnection.getDatabase();
      await db.admin().ping();
      return { status: "up" };
    } catch (error) {
      return {
        status: "down",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async checkRedis(): Promise<{ status: string; message?: string }> {
    let client;
    try {
      client = createClient({
        socket: {
          host: config.cache.redisHost,
          port: config.cache.redisPort,
        },
      });
      await client.connect();
      await client.ping();
      await client.quit();
      return { status: "up" };
    } catch (error) {
      if (client) {
        await client.quit().catch(() => {});
      }
      return {
        status: "down",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
