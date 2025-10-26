import { createClient } from 'redis';
import { createConnection } from 'net';

// Mock Redis interface when Redis is not available
const mockRedis = {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    exists: async () => 0,
    expire: async () => 1,
    flushall: async () => 'OK',
    on: () => { },
    connect: async () => { },
    disconnect: async () => { }
};

// Check if Redis is available before creating client
async function checkRedisAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
        const connection = createConnection({ port: 6379, host: 'localhost', timeout: 1000 });

        connection.on('connect', () => {
            connection.destroy();
            resolve(true);
        });

        connection.on('error', () => {
            resolve(false);
        });

        connection.on('timeout', () => {
            connection.destroy();
            resolve(false);
        });
    });
}

let redis: any = mockRedis;

// Initialize Redis only if it's available and not in test mode
if (process.env.NODE_ENV !== 'test') {
    checkRedisAvailability().then(isAvailable => {
        if (isAvailable) {
            try {
                const redisClient = createClient();

                redisClient.on('error', (err: any) => {
                    console.warn('Redis connection lost, switching to mock mode');
                    redis = mockRedis;
                });

                redisClient.connect().then(() => {
                    console.log('✅ Redis connected successfully');
                    redis = redisClient;
                }).catch(() => {
                    console.log('⚠️ Redis connection failed, using mock mode');
                    redis = mockRedis;
                });
            } catch (err) {
                console.log('⚠️ Redis not available, using mock mode');
                redis = mockRedis;
            }
        } else {
            console.log('⚠️ Redis server not running, caching disabled');
        }
    });
} else {
    console.log('🧪 Test mode: Using Redis mock');
}

export { redis };