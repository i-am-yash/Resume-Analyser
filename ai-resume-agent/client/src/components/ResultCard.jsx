import React from 'react';

const ResultCard = ({ result }) => {
    console.log('result', result, 'resultcard');
  if (!result) return null;
console.log('result', result, 'resultcard');
const formatted = {
    matchScore: result.match_score,
    summary: result.summary,
    matchingSkills: result.matching_skills || [],
    missingSkills: result.missing_skills || [],
    suggestions: result.suggestions || [],
  };
  const {
    matchScore,
    summary,
    matchingSkills = [],
    missingSkills = [],
    suggestions = [],
  } = formatted;

  return (
    <div
      style={{
        border: '1px solid #dbe0e7',
        borderRadius: 8,
        padding: 24,
        background: '#f9fafb',
        maxWidth: 600,
        margin: '0 auto',
        boxShadow: '0 2px 8px #f0f4fa',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 22, color: '#2051f2', fontWeight: 700 }}>
          Match Score:&nbsp;
          <span
            style={{
              color:
                matchScore >= 80
                  ? 'green'
                  : matchScore >= 60
                  ? '#c98408'
                  : '#db3131',
              fontSize: 30,
            }}
          >
            {typeof matchScore === 'number'
              ? `${matchScore}%`
              : matchScore || '--'}
          </span>
        </span>
      </div>

      {summary && (
        <div
          style={{
            marginBottom: 18,
            background: '#eef5ff',
            padding: '12px 16px',
            borderRadius: 5,
            fontSize: 16,
          }}
        >
          <strong>Summary:</strong>
          <div style={{ marginTop: 5 }}>{summary}</div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <strong>Matching Skills:</strong>
        <ul style={{ marginTop: 5, marginBottom: 0, paddingLeft: 20 }}>
          {matchingSkills.length > 0 ? (
            matchingSkills.map((skill, idx) => (
              <li key={skill + idx} style={{ color: '#1c493a', fontSize: 15 }}>
                {skill}
              </li>
            ))
          ) : (
            <li style={{ color: '#777' }}>None listed</li>
          )}
        </ul>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Missing Skills:</strong>
        <ul style={{ marginTop: 5, marginBottom: 0, paddingLeft: 20 }}>
          {missingSkills.length > 0 ? (
            missingSkills.map((skill, idx) => (
              <li
                key={skill + idx}
                style={{
                  color: '#dc2626',
                  fontWeight: 500,
                  fontSize: 15,
                  background: '#fde5e5',
                  borderRadius: 3,
                  padding: '2px 5px',
                  marginBottom: 3,
                  display: 'inline-block',
                  marginRight: 5,
                }}
              >
                {skill}
              </li>
            ))
          ) : (
            <li style={{ color: '#0b7c29' }}>No missing skills 🎉</li>
          )}
        </ul>
      </div>

      <div>
        <strong>Suggestions:</strong>
        <ul style={{ marginTop: 5, paddingLeft: 20 }}>
          {suggestions && suggestions.length > 0 ? (
            suggestions.map((s, idx) => (
              <li key={s.slice(0, 20) + idx} style={{ fontSize: 15 }}>
                {s}
              </li>
            ))
          ) : (
            <li style={{ color: '#777' }}>No suggestions available.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ResultCard;