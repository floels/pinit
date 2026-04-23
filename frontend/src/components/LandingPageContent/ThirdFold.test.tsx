import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ThirdFold from "./ThirdFold";

// This component is purely presentational:
it("renders", () => {
  render(
    <MemoryRouter>
      <ThirdFold />
    </MemoryRouter>,
  );
});
