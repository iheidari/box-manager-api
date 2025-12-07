import { FastifyRequest, FastifyReply } from "fastify";
import { Box } from "../models/Box";
import { BoxRequest } from "../types/box";
import { uploadImage } from "../services/r2Service";

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

    // Upload images to R2 and get imageIds
    const processedItems = await Promise.all(
      (boxData.items || []).map(async (item) => {
        // Upload each image to R2 and collect imageIds
        const imageIds = await Promise.all(
          item.image.map(async (img) => {
            // Detect content type from base64 string if possible
            let contentType = "image/jpeg"; // default
            if (typeof img === "string" && img.includes("data:")) {
              const match = img.match(/data:([^;]+)/);
              if (match) {
                contentType = match[1];
              }
            }

            // Upload image to R2
            const imageId = await uploadImage(img, contentType);
            return imageId;
          })
        );

        return {
          id: item.id,
          name: item.name,
          imageId: imageIds,
        };
      })
    );

    const processedBox = {
      id: boxData.id,
      name: boxData.name,
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
          imageId: item.imageId,
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
