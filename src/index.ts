import Fastify from "fastify";

const fastify = Fastify({
  logger: true,
});

// Status endpoint
fastify.get("/status", async (request, reply) => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
});

// Start server
const start = async () => {
  try {
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
