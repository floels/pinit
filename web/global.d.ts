import type createFetchMock from "vitest-fetch-mock";

// The global fetch mock installed in setupTests.ts.
declare global {
  var fetchMock: ReturnType<typeof createFetchMock>;
}
