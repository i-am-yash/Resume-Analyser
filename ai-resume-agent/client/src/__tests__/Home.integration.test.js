import { render, screen, fireEvent } from "@testing-library/react";
import Home from "../pages/Home";
import axios from "axios";

jest.mock("axios");

test("user submits resume and sees score", async () => {
  axios.post
    .mockResolvedValueOnce({ data: { data: { text: "resume text" } } }) // upload
    .mockResolvedValueOnce({
      data: {
        data: {
          match_score: 88,
          matching_skills: ["React"],
          missing_skills: ["Node"],
          suggestions: ["Add backend experience"],
        },
      },
    }); // match

  render(<Home />);

  const fileInput = screen.getByLabelText(/upload resume/i);
  const textarea = screen.getByPlaceholderText(/job description/i);
  const button = screen.getByText(/analyze resume/i);

  fireEvent.change(fileInput, {
    target: {
      files: [new File(["%PDF-1.4"], "resume.pdf", { type: "application/pdf" })]
    }
  });

  fireEvent.change(textarea, {
    target: { value: "Frontend role" }
  });

  fireEvent.click(button);

  const score = await screen.findByText("88%");

  expect(score).toBeInTheDocument();
});