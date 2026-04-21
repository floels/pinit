import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SecondFold from "./SecondFold";

// This component is purely presentational:
it("renders", () => {
  render(
    <MemoryRouter>
      <SecondFold />
    </MemoryRouter>,
  );
});
