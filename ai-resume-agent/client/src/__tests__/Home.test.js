import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders resume upload form", () => {
  render(<App />);

  expect(screen.getByText(/upload resume/i)).toBeInTheDocument();
  expect(screen.getByText(/job description/i)).toBeInTheDocument();
  expect(screen.getByText(/analyze resume/i)).toBeInTheDocument();
});