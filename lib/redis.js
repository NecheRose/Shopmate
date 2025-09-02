import { createClient } from "redis";

// Create Redis client
export const client = createClient({
	username: process.env.CLOUD_REDIS_USERNAME || "default",
	password: process.env.CLOUD_REDIS_PASSWORD,
	socket: {
		host: process.env.CLOUD_REDIS_HOST,
		port: process.env.CLOUD_REDIS_PORT,
		reconnectStrategy: retries => {
			if (retries > 10) {
				return new Error("Redis reconnect failed after 10 attempts");
			}
			// Linear backoff strategy:
      // Wait time increases by 100ms per retry (100ms, 200ms, 300ms, …)
      // Maximum wait time is capped at 3000ms (3 seconds)
      // This prevents overwhelming Redis with rapid reconnect attempts
			return Math.min(retries * 100, 3000); 
		}
	}
});

// Function to connect Redis safely
export const connectRedis = async () => {
  try {
    await client.connect();
    console.log("Redis connected");
  } catch (err) {
    console.error("Initial Redis connection failed:", err);
  }
};

// Event listeners for visibility
client.on("error", (err) => console.error("Redis error:", err));
client.on("reconnecting", () => console.log("Redis reconnecting..."));
client.on("end", () => console.log("Redis connection closed"));



