jest.mock("axios", () => ({
  create: jest.fn(),
}));

test("matchJob returns backend response", async () => {
  const axios = require("axios");

  const mockPost = jest.fn().mockResolvedValue({
    data: { match_score: 75 },
  });

  axios.create.mockReturnValue({
    post: mockPost,
  });

  const { matchJob } = require("../services/api");

  const payload = {
    resumeText: "react dev",
    jobDescription: "frontend",
  };

  const res = await matchJob(payload);

  expect(mockPost).toHaveBeenCalledWith("/api/match/match-job", payload);
  expect(res.match_score).toBe(75);
});