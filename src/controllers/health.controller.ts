import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { redis } from '../lib/redis';

interface HealthStatus {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    version: string;
    services: {
        database: {
            status: 'connected' | 'disconnected';
            responseTime?: number;
        };
        redis: {
            status: 'connected' | 'disconnected';
            responseTime?: number;
        };
        telegram: {
            status: 'configured' | 'not_configured';
        };
        email: {
            status: 'configured' | 'not_configured';
        };
    };
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
}

export async function healthCheck(req: Request, res: Response) {
    const startTime = Date.now();
    let overallStatus: 'healthy' | 'unhealthy' = 'healthy';

    const health: HealthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        services: {
            database: { status: 'disconnected' },
            redis: { status: 'disconnected' },
            telegram: { status: 'not_configured' },
            email: { status: 'not_configured' }
        },
        memory: {
            used: 0,
            total: 0,
            percentage: 0
        }
    };

    // Check Database
    try {
        const dbStart = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        health.services.database = {
            status: 'connected',
            responseTime: Date.now() - dbStart
        };
    } catch (error) {
        health.services.database.status = 'disconnected';
        overallStatus = 'unhealthy';
    }

    // Check Redis
    try {
        const redisStart = Date.now();
        await redis.ping();
        health.services.redis = {
            status: 'connected',
            responseTime: Date.now() - redisStart
        };
    } catch (error) {
        health.services.redis.status = 'disconnected';
        // Redis não é crítico, não marca como unhealthy
    }

    // Check Telegram configuration
    if (process.env.TELEGRAM_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        health.services.telegram.status = 'configured';
    }

    // Check Email configuration
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
        health.services.email.status = 'configured';
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    health.memory = {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
    };

    health.status = overallStatus;

    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
}

// Simple health check para load balancers
export async function simpleHealthCheck(req: Request, res: Response) {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'OK' });
    } catch (error) {
        res.status(503).json({ status: 'ERROR' });
    }
}