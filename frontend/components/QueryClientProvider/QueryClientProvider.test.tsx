import { useQuery } from "@tanstack/react-query";
import QueryClientProvider from "./QueryClientProvider";
import { render, screen } from "@testing-library/react";

it("gives its child access to 'useQuery'", () => {
  const ChildElement = () => {
    useQuery({ queryKey: ["dummyQuery"], queryFn: () => ({}) });

    return <div data-testid="child-element" />;
  };

  render(
    <QueryClientProvider>
      <ChildElement />
    </QueryClientProvider>,
  );

  // Just check that the child element rendered successfully:
  screen.getByTestId("child-element");
});
