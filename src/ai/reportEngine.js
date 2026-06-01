import { generateJSON } from './gemini';

export const generateInterviewReport = async ({ interview, questions, answers, evaluations, userProfile, resumeAnalysis }) => {
  const prompt = `
You are generating a professional interview performance report.

Interview Data:
- Type: ${interview.type}
- Difficulty: ${interview.difficulty}
- Date: ${new Date().toLocaleDateString()}
- Candidate: ${userProfile?.displayName || 'Candidate'}
- Total Questions: ${questions.length}
- Average Score: ${Math.round(evaluations.reduce((s, e) => s + (e?.scores?.total || 0), 0) / evaluations.length)}/100

Questions & Scores:
${questions.map((q, i) => `Q${i + 1}: "${q.question}" → Score: ${evaluations[i]?.scores?.total || 0}/100`).join('\n')}

Return this exact JSON:
{
  "executiveSummary": "<3-4 sentence professional summary>",
  "overallReadinessScore": <0-100>,
  "readinessCategory": "<Interview Ready|Strong Candidate|Average Candidate|Needs Improvement>",
  "topStrengths": ["<strength1>", "<strength2>", "<strength3>"],
  "criticalWeaknesses": ["<weakness1>", "<weakness2>"],
  "priorityImprovements": ["<improvement1>", "<improvement2>", "<improvement3>"],
  "skillsAssessment": [
    { "skill": "<skill>", "score": <0-100>, "status": "<strong|adequate|weak>" }
  ],
  "hiringRecommendation": "<strongly recommend|recommend|conditionally recommend|not recommended>",
  "hiringProbability": <0-100>,
  "nextSteps": ["<step1>", "<step2>", "<step3>"],
  "interviewTips": ["<tip1>", "<tip2>", "<tip3>"]
}
`;
  return generateJSON(prompt);
};
