export type ImageDimensions = {
  width: number;
  height: number;
};

// Reads the pixel dimensions of an image file. The pin creation flow sends them
// to the API, which requires them. Throws when the browser cannot decode the
// file, because a pin without dimensions cannot be laid out before its image
// loads.
export const readImageDimensions = async (
  file: File,
): Promise<ImageDimensions> => {
  const bitmap = await createImageBitmap(file);

  const { width, height } = bitmap;

  bitmap.close();

  if (!width || !height) {
    throw new Error("The image reports no usable dimensions.");
  }

  return { width, height };
};
