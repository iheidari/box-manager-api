import { FastifyRequest, FastifyReply } from "fastify";
import { getImage } from "../services/r2Service";

export const getImageById = async (
  request: FastifyRequest<{ Params: { imageId: string } }>,
  reply: FastifyReply
) => {
  try {
    const { imageId } = request.params;

    if (!imageId) {
      return reply.code(400).send({
        error: "imageId is required",
      });
    }

    // Get image from R2
    const imageBuffer = await getImage(imageId);

    // Set appropriate headers
    reply.type("image/jpeg"); // Default, you might want to detect actual type
    reply.header("Content-Length", imageBuffer.length.toString());

    return reply.send(imageBuffer);
  } catch (error: any) {
    request.log.error(error);
    if (error.message.includes("Failed to get image")) {
      return reply.code(404).send({
        error: "Image not found",
      });
    }
    return reply.code(500).send({
      error: "Internal server error",
      message: error.message,
    });
  }
};

