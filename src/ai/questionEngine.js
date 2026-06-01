import { generateJSON } from './gemini';

const TYPE_CONTEXT = {
  Technical: 'a technical software engineering interview focusing on coding, algorithms, data structures, system design, and technical problem-solving',
  Behavioral: 'a behavioral interview using the STAR method focusing on past experiences, teamwork, conflict resolution, and leadership',
  HR: 'an HR screening interview covering motivation, culture fit, salary expectations, and career goals',
  'Scenario Based': 'a scenario-based interview presenting real-world work situations and asking how the candidate would handle them',
  'Project Discussion': 'a project deep-dive interview where the candidate discusses their past projects, technical decisions, and impact',
};

const MOCK_QUESTIONS = {
  Technical: [
    { id: 1, question: "Explain the difference between Virtual DOM and Shadow DOM. When would you use one over the other?", category: "React Architecture", difficulty: "Medium", expectedKeyPoints: ["Virtual DOM is a concept where UI is kept in memory", "Shadow DOM is browser scoping of CSS", "Virtual DOM is used by React, Shadow DOM for isolation"], followUp: "How does React fiber architecture relate?", timeLimit: 90 },
    { id: 2, question: "Write a function in JavaScript to check if a string is a palindrome, ignoring non-alphanumeric characters.", category: "Algorithms", difficulty: "Medium", expectedKeyPoints: ["Clean string with regex", "Convert to lowercase", "Use two-pointer approach"], followUp: "What is the time complexity of your approach?", timeLimit: 90 },
    { id: 3, question: "What is the difference between client-side rendering (CSR) and server-side rendering (SSR) in Next.js?", category: "Performance", difficulty: "Medium", expectedKeyPoints: ["CSR downloads minimal HTML", "SSR renders HTML on server", "SEO comparison"], followUp: "What is hydration in React SSR?", timeLimit: 90 }
  ],
  Behavioral: [
    { id: 1, question: "Describe a time when you had to resolve a conflict within your team. What steps did you take?", category: "Conflict Resolution", difficulty: "Medium", expectedKeyPoints: ["Listen without bias", "Focus on technical arguments", "Align on shared goals"], followUp: "What was the final outcome?", timeLimit: 90 },
    { id: 2, question: "Tell me about a time you failed to meet a deadline. What did you learn?", category: "Time Management", difficulty: "Medium", expectedKeyPoints: ["Take responsibility", "Communicate proactively", "Adjust estimates"], followUp: "How do you estimate your tasks now?", timeLimit: 90 }
  ],
  HR: [
    { id: 1, question: "Why do you want to join our company?", category: "Culture Fit", difficulty: "Medium", expectedKeyPoints: ["Express alignment with mission", "Mention specific technical challenges", "Describe match with career goals"], followUp: "What specific product area interests you most?", timeLimit: 90 },
    { id: 2, question: "What are your salary expectations for this role?", category: "Negotiation", difficulty: "Medium", expectedKeyPoints: ["State a reasonable range", "Express flexibility", "Show interest in benefits"], followUp: "What other factors make you accept?", timeLimit: 90 }
  ],
  'Scenario Based': [
    { id: 1, question: "You discover a critical bug in production right before a major release. How do you handle it?", category: "Incident Response", difficulty: "Medium", expectedKeyPoints: ["Assess the impact", "Coordinate rollback or hotfix", "Communicate status clearly"], followUp: "How do you prevent this bug from slipping through?", timeLimit: 90 }
  ],
  'Project Discussion': [
    { id: 1, question: "Discuss the architecture of the most challenging project you have worked on. What were the trade-offs?", category: "Architecture", difficulty: "Medium", expectedKeyPoints: ["Explain tech choices", "Discuss challenges like state management", "Acknowledge code trade-offs"], followUp: "If you had to rewrite it today, what would you change?", timeLimit: 90 }
  ]
};

export const generateQuestions = async ({ type, difficulty, count = 5, resumeSummary = '', jdSummary = '', previousScores = [] }) => {
  try {
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
    return await generateJSON(prompt);
  } catch (err) {
    console.warn(`Gemini API question generation failed for ${type}, returning static mock questions:`, err);
    const mockList = MOCK_QUESTIONS[type] || MOCK_QUESTIONS.Technical;
    // Map IDs to fit requested count
    return Array.from({ length: count }, (_, i) => {
      const q = mockList[i % mockList.length];
      return { ...q, id: i + 1, difficulty, type };
    });
  }
};
