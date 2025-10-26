import { Request, Response } from 'express';
import { performance } from 'perf_hooks';

interface Metrics {
    requests_total: number;
    requests_duration_ms: {
        method: string;
        route: string;
        status: number;
        duration: number;
        timestamp: number;
    }[];
    memory_usage: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
        arrayBuffers: number;
    };
    uptime: number;
    timestamp: string;
}

// Store para métricas (em produção usar Redis ou BD)
let metricsStore: Metrics = {
    requests_total: 0,
    requests_duration_ms: [],
    memory_usage: process.memoryUsage(),
    uptime: 0,
    timestamp: new Date().toISOString()
};

// Middleware para capturar métricas
export function metricsMiddleware(req: Request, res: Response, next: Function) {
    const startTime = performance.now();

    // Incrementar contador
    metricsStore.requests_total++;

    // Capturar end da response
    const originalSend = res.send;
    res.send = function (body: any) {
        const duration = performance.now() - startTime;

        // Armazenar métricas da request
        metricsStore.requests_duration_ms.push({
            method: req.method,
            route: req.route?.path || req.path,
            status: res.statusCode,
            duration: Math.round(duration * 100) / 100,
            timestamp: Date.now()
        });

        // Limitar histórico (manter apenas últimas 1000 requests)
        if (metricsStore.requests_duration_ms.length > 1000) {
            metricsStore.requests_duration_ms = metricsStore.requests_duration_ms.slice(-1000);
        }

        // Atualizar memory usage
        metricsStore.memory_usage = process.memoryUsage();
        metricsStore.uptime = process.uptime();
        metricsStore.timestamp = new Date().toISOString();

        return originalSend.call(this, body);
    };

    next();
}

// Endpoint para métricas (formato Prometheus-like)
export function getMetrics(req: Request, res: Response) {
    if (process.env.NODE_ENV === 'production' && !req.query.token) {
        return res.status(401).json({ error: 'Token required for metrics access' });
    }

    const metrics = generatePrometheusMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
}

// Endpoint para métricas JSON
export function getMetricsJson(req: Request, res: Response) {
    if (process.env.NODE_ENV === 'production' && !req.query.token) {
        return res.status(401).json({ error: 'Token required for metrics access' });
    }

    // Calcular estatísticas
    const recentRequests = metricsStore.requests_duration_ms.slice(-100);
    const avgResponseTime = recentRequests.length > 0
        ? recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length
        : 0;

    const statusCodes = recentRequests.reduce((acc: any, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
    }, {});

    const response = {
        ...metricsStore,
        statistics: {
            avg_response_time_ms: Math.round(avgResponseTime * 100) / 100,
            requests_per_minute: calculateRequestsPerMinute(),
            status_codes: statusCodes,
            memory_usage_mb: {
                rss: Math.round(metricsStore.memory_usage.rss / 1024 / 1024 * 100) / 100,
                heapTotal: Math.round(metricsStore.memory_usage.heapTotal / 1024 / 1024 * 100) / 100,
                heapUsed: Math.round(metricsStore.memory_usage.heapUsed / 1024 / 1024 * 100) / 100,
            }
        }
    };

    res.json(response);
}

function calculateRequestsPerMinute(): number {
    const oneMinuteAgo = Date.now() - 60000;
    const recentRequests = metricsStore.requests_duration_ms.filter(
        r => r.timestamp > oneMinuteAgo
    );
    return recentRequests.length;
}

function generatePrometheusMetrics(): string {
    const metrics = [];

    // Total requests
    metrics.push(`# HELP http_requests_total Total number of HTTP requests`);
    metrics.push(`# TYPE http_requests_total counter`);
    metrics.push(`http_requests_total ${metricsStore.requests_total}`);

    // Memory usage
    metrics.push(`# HELP process_memory_usage_bytes Process memory usage in bytes`);
    metrics.push(`# TYPE process_memory_usage_bytes gauge`);
    metrics.push(`process_memory_usage_bytes{type="rss"} ${metricsStore.memory_usage.rss}`);
    metrics.push(`process_memory_usage_bytes{type="heapTotal"} ${metricsStore.memory_usage.heapTotal}`);
    metrics.push(`process_memory_usage_bytes{type="heapUsed"} ${metricsStore.memory_usage.heapUsed}`);

    // Uptime
    metrics.push(`# HELP process_uptime_seconds Process uptime in seconds`);
    metrics.push(`# TYPE process_uptime_seconds gauge`);
    metrics.push(`process_uptime_seconds ${metricsStore.uptime}`);

    // Response time histogram (últimas 100 requests)
    const recentRequests = metricsStore.requests_duration_ms.slice(-100);
    if (recentRequests.length > 0) {
        const avgResponseTime = recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length;
        metrics.push(`# HELP http_request_duration_ms Average HTTP request duration in milliseconds`);
        metrics.push(`# TYPE http_request_duration_ms gauge`);
        metrics.push(`http_request_duration_ms ${avgResponseTime}`);
    }

    return metrics.join('\n') + '\n';
}