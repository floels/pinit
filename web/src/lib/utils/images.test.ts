import { readImageDimensions } from "./images";

const MOCK_FILE = new File(["mockImage"], "MockImage.png", {
  type: "image/png",
});

const mockClose = vi.fn();

afterEach(() => {
  vi.unstubAllGlobals();
  mockClose.mockClear();
});

it("returns the dimensions reported by the decoded bitmap", async () => {
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn().mockResolvedValue({ width: 1024, height: 768, close: mockClose }),
  );

  const dimensions = await readImageDimensions(MOCK_FILE);

  expect(dimensions).toEqual({ width: 1024, height: 768 });
});

it("closes the bitmap so it does not leak", async () => {
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn().mockResolvedValue({ width: 1024, height: 768, close: mockClose }),
  );

  await readImageDimensions(MOCK_FILE);

  expect(mockClose).toHaveBeenCalled();
});

it("returns null when the browser cannot decode the file", async () => {
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn().mockRejectedValue(new Error("undecodable")),
  );

  const dimensions = await readImageDimensions(MOCK_FILE);

  expect(dimensions).toBeNull();
});

it("returns null when the browser has no 'createImageBitmap'", async () => {
  vi.stubGlobal("createImageBitmap", undefined);

  const dimensions = await readImageDimensions(MOCK_FILE);

  expect(dimensions).toBeNull();
});

it("returns null when a dimension is zero", async () => {
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn().mockResolvedValue({ width: 0, height: 768, close: mockClose }),
  );

  const dimensions = await readImageDimensions(MOCK_FILE);

  expect(dimensions).toBeNull();
});
