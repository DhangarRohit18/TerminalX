import { generateJSON } from './gemini';

export const matchResumeToJD = async (resumeAnalysis, jdAnalysis) => {
  const prompt = `
You are an AI hiring assistant. Compare a candidate's resume analysis to a job description analysis and compute match scores.

Resume Analysis:
${JSON.stringify(resumeAnalysis, null, 2)}

Job Description Analysis:
${JSON.stringify(jdAnalysis, null, 2)}

Return this exact JSON structure:
{
  "skillMatchPercent": <0-100>,
  "projectMatchPercent": <0-100>,
  "experienceMatchPercent": <0-100>,
  "overallMatchScore": <0-100>,
  "matchedSkills": ["<skill1>", ...],
  "missingSkills": ["<skill1>", ...],
  "strongAreas": ["<area1>", ...],
  "gapAreas": ["<area1>", ...],
  "recommendation": "<hire/maybe/not yet>",
  "recommendationReason": "<2-3 sentence explanation>",
  "hiringProbability": <0-100>,
  "skillBreakdown": [
    { "skill": "<skill>", "inResume": true/false, "inJD": true/false, "proficiencyEstimate": <0-100> }
  ],
  "improvementPriority": ["<most important skill to add/improve>", ...]
}
`;
  return generateJSON(prompt);
};
