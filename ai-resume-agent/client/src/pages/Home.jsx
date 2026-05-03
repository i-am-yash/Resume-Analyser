import { useState } from "react";
import ResumeUpload from "../components/ResumeUpload";
import ResultCard from "../components/ResultCard";

const Home = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  console.log('result', result);

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🚀 AI Resume Analyzer</h1>

      <ResumeUpload
        setResult={setResult}
        setLoading={setLoading}
      />

      {loading && <p>Analyzing...</p>}

      {result && <ResultCard result={result} />}
    </div>
  );
};

export default Home;