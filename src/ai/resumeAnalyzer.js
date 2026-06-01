import { generateJSON } from './gemini';

export const analyzeResume = async (resumeText) => {
  const prompt = `
You are an expert resume analyst and career coach. Analyze the following resume text.

Resume:
"""
${resumeText}
"""

Return this exact JSON structure:
{
  "name": "<candidate name if found>",
  "skills": ["<skill1>", "<skill2>", ...],
  "programmingLanguages": ["<lang1>", ...],
  "frameworks": ["<fw1>", ...],
  "tools": ["<tool1>", ...],
  "experience": [
    { "company": "<company>", "role": "<role>", "duration": "<duration>", "highlights": ["<highlight>"] }
  ],
  "projects": [
    { "name": "<project>", "description": "<desc>", "techStack": ["<tech>"], "impact": "<impact>" }
  ],
  "education": [
    { "degree": "<degree>", "institution": "<institution>", "year": "<year>", "gpa": "<gpa if mentioned>" }
  ],
  "certifications": ["<cert1>", ...],
  "summary": "<2-3 sentence professional summary of the candidate>",
  "strengthScore": <1-100>,
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "improvementSuggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"],
  "overallAssessment": "<one paragraph honest assessment>"
}
`;
  return generateJSON(prompt);
};
