// Request type - accepts base64 strings for images
export type ItemRequest = {
  id: string;
  name: string;
  image: (string | Buffer)[]; // Base64 strings or Buffers
};

export type BoxRequest = {
  id: string;
  name: string;
  items: ItemRequest[];
};

// Database type - stores imageIds (references to R2 storage)
export type Item = {
  id: string;
  name: string;
  imageId: string[]; // Array of imageIds stored in R2
};

export type Box = {
  id: string;
  name: string;
  items: Item[];
};

