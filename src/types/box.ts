// Request type - accepts base64 strings for images
export type ItemRequest = {
  id: string;
  name: string;
  image: (string | Buffer)[];
};

export type BoxRequest = {
  id: string;
  name: string;
  items: ItemRequest[];
};

// Database type - stores images as Buffer
export type Item = {
  id: string;
  name: string;
  image: Buffer[];
};

export type Box = {
  id: string;
  name: string;
  items: Item[];
};

