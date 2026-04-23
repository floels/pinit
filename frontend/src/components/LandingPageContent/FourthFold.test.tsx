import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FourthFold from "./FourthFold";

// This component is purely presentational:
it("renders", () => {
  render(
    <MemoryRouter>
      <FourthFold />
    </MemoryRouter>,
  );
});
