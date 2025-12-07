import { FastifyRequest, FastifyReply } from "fastify";
import { Box } from "../models/Box";
import { BoxRequest } from "../types/box";

export const createBox = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const boxData = request.body as BoxRequest;

    // Validate required fields
    if (!boxData.id || !boxData.name) {
      return reply.code(400).send({
        error: "Missing required fields: id and name are required",
      });
    }

    // Validate items structure if provided
    if (boxData.items) {
      for (const item of boxData.items) {
        if (!item.id || !item.name) {
          return reply.code(400).send({
            error: "Each item must have id and name",
          });
        }
      }
    }

    // Convert image data (assuming base64 strings) to Buffer
    const processedItems = (boxData.items || []).map((item) => ({
      ...item,
      image: item.image.map((img) => {
        // If image is a string (base64), convert to Buffer
        if (typeof img === "string") {
          return Buffer.from(img, "base64");
        }
        // If already a Buffer, return as is
        return img instanceof Buffer ? img : Buffer.from(img);
      }),
    }));

    const processedBox = {
      ...boxData,
      items: processedItems,
    };

    // Create new box in database
    const newBox = new Box(processedBox);
    const savedBox = await newBox.save();

    return reply.code(201).send({
      message: "Box created successfully",
      box: {
        id: savedBox.id,
        name: savedBox.name,
        items: savedBox.items.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image.map((img) => img.toString("base64")), // Convert back to base64 for response
        })),
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      // Duplicate key error
      return reply.code(409).send({
        error: "Box with this id already exists",
      });
    }
    request.log.error(error);
    return reply.code(500).send({
      error: "Internal server error",
      message: error.message,
    });
  }
};
