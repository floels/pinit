export type ImageDimensions = {
  width: number;
  height: number;
};

// Reads the pixel dimensions of an image file. The pin creation flow sends them
// to the API, which lets every client lay out the pin before its image loads.
// Returns null when the browser cannot decode the file. Pin creation then
// proceeds without the dimensions, because the API treats them as optional.
export const readImageDimensions = async (
  file: File,
): Promise<ImageDimensions | null> => {
  if (typeof createImageBitmap !== "function") {
    return null;
  }

  try {
    const bitmap = await createImageBitmap(file);

    const { width, height } = bitmap;

    bitmap.close();

    if (!width || !height) {
      return null;
    }

    return { width, height };
  } catch {
    return null;
  }
};
