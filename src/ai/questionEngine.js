import { generateJSON } from './gemini';

const TYPE_CONTEXT = {
  Technical: 'a technical software engineering interview focusing on coding, algorithms, data structures, system design, and technical problem-solving',
  Behavioral: 'a behavioral interview using the STAR method focusing on past experiences, teamwork, conflict resolution, and leadership',
  HR: 'an HR screening interview covering motivation, culture fit, salary expectations, and career goals',
  'Scenario Based': 'a scenario-based interview presenting real-world work situations and asking how the candidate would handle them',
  'Project Discussion': 'a project deep-dive interview where the candidate discusses their past projects, technical decisions, and impact',
};

export const generateQuestions = async ({ type, difficulty, count = 5, resumeSummary = '', jdSummary = '', previousScores = [] }) => {
  const avgScore = previousScores.length ? previousScores.reduce((a, b) => a + b, 0) / previousScores.length : 70;
  const adaptiveNote = previousScores.length > 0
    ? `The candidate's recent average score is ${avgScore.toFixed(0)}/100. ${avgScore > 80 ? 'Increase difficulty slightly.' : avgScore < 50 ? 'Reduce difficulty slightly.' : 'Maintain current difficulty.'}`
    : '';

  const prompt = `
You are a senior ${type} interviewer conducting ${TYPE_CONTEXT[type] || 'a job interview'}.

Generate exactly ${count} interview questions for a ${difficulty} difficulty ${type} interview.

${resumeSummary ? `Candidate Background: ${resumeSummary}` : ''}
${jdSummary ? `Job Requirements: ${jdSummary}` : ''}
${adaptiveNote}

Return a JSON array of ${count} question objects. Each object must have:
- "id": number (1 to ${count})
- "question": string (the actual question)
- "type": "${type}"
- "difficulty": "${difficulty}"
- "category": string (e.g., "Arrays", "Leadership", "System Design", "Communication")
- "expectedKeyPoints": array of 3-5 strings (key points a good answer should cover)
- "followUp": string (one follow-up question to probe deeper)
- "timeLimit": number (seconds: Easy=60, Medium=90, Hard=120)

Make questions realistic, challenging, and specific to the context.
`;
  return generateJSON(prompt);
};
