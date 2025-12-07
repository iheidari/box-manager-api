import { FastifyRequest, FastifyReply } from "fastify";

export const getStatus = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
};
