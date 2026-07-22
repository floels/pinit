import { vi } from "vitest";
import "@testing-library/jest-dom/vitest"; // advanced matchers, e.g. toHaveAttribute
import { TextEncoder, TextDecoder } from "util";
import createFetchMock from "vitest-fetch-mock";

// jsdom doesn't provide TextEncoder/TextDecoder, which some dependencies use.
globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

// Global fetch mock (jest-fetch-mock's API, ported to Vitest). Exposes the
// `fetchMock` global used throughout the test suite.
const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();
globalThis.fetchMock = fetchMocker;

// Mock react-i18next for every test — resolves keys against the real namespace
// JSON so assertions match actual translated strings (see reactI18nextMock.ts).
vi.mock("react-i18next", () => import("./reactI18nextMock"));
