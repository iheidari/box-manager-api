import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "";

/**
 * Upload an image to Cloudflare R2
 * @param imageData - Base64 string or Buffer of the image
 * @param contentType - MIME type of the image (e.g., 'image/jpeg', 'image/png')
 * @returns The imageId (key) used to retrieve the image later
 */
export const uploadImage = async (
  imageData: string | Buffer,
  contentType: string = "image/jpeg"
): Promise<string> => {
  try {
    // Generate unique imageId
    const imageId = uuidv4();

    // Convert base64 string to Buffer if needed
    let buffer: Buffer;
    if (typeof imageData === "string") {
      // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
      const base64Data = imageData.includes(",")
        ? imageData.split(",")[1]
        : imageData;
      buffer = Buffer.from(base64Data, "base64");
    } else {
      buffer = imageData;
    }

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageId,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    return imageId;
  } catch (error) {
    throw new Error(`Failed to upload image to R2: ${error}`);
  }
};

/**
 * Get an image from Cloudflare R2
 * @param imageId - The imageId (key) of the image to retrieve
 * @returns Buffer containing the image data
 */
export const getImage = async (imageId: string): Promise<Buffer> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageId,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      throw new Error("No image data found");
    }

    // Convert stream to Buffer
    const chunks: Uint8Array[] = [];
    
    // AWS SDK v3 Body is a Readable stream
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error: any) {
    throw new Error(`Failed to get image from R2: ${error.message || error}`);
  }
};

/**
 * Get a public URL for an image (if R2 is configured with public access)
 * @param imageId - The imageId (key) of the image
 * @returns Public URL to the image
 */
export const getImageUrl = (imageId: string): string => {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl}/${imageId}`;
  }
  // If no public URL is configured, return empty string
  // You'll need to use the getImage endpoint instead
  return "";
};

