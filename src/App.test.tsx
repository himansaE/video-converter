import React from "react";
import { render, screen } from "@testing-library/react";
import Default from "./default";

test("renders learn react link", () => {
  render(<Default />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
