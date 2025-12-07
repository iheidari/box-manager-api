import Fastify from "fastify";
import dotenv from "dotenv";
import { connectDB } from "./db/connection";
import { getStatus } from "./controllers/statusController";
import { createBox } from "./controllers/boxController";

// Load environment variables
dotenv.config();

const fastify = Fastify({
  logger: true,
});

// Status endpoint
fastify.get("/status", getStatus);

// POST endpoint to create a box
fastify.post("/boxes", createBox);

// Start server
const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || "0.0.0.0";

    await fastify.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
