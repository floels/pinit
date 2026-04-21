import { render } from "@testing-library/react";
import LogoutTrigger from "./LogoutTrigger";

const mockLogOut = jest.fn();

jest.mock("@/lib/hooks/useLogOut", () => ({
  useLogOut: () => mockLogOut,
}));

const renderComponent = () => {
  render(<LogoutTrigger />);
};

it("calls 'logOut' upon initial render", () => {
  renderComponent();

  expect(mockLogOut).toHaveBeenCalledTimes(1);
});
