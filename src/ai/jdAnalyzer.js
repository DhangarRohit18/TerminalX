import { generateJSON } from './gemini';

export const analyzeJD = async (jdText) => {
  const prompt = `
You are an expert job description analyst. Analyze the following job description.

Job Description:
"""
${jdText}
"""

Return this exact JSON structure:
{
  "jobTitle": "<extracted job title>",
  "company": "<company name if mentioned>",
  "requiredSkills": ["<skill1>", "<skill2>", ...],
  "preferredSkills": ["<skill1>", ...],
  "programmingLanguages": ["<lang1>", ...],
  "frameworks": ["<fw1>", ...],
  "tools": ["<tool1>", ...],
  "responsibilities": ["<resp1>", "<resp2>", ...],
  "experienceRequired": "<e.g. 2-4 years>",
  "educationRequired": "<e.g. B.S. in Computer Science>",
  "keywords": ["<keyword1>", "<keyword2>", ...],
  "softSkills": ["<soft skill1>", ...],
  "summary": "<2-3 sentence summary of the role>",
  "seniorityLevel": "<Entry/Mid/Senior/Lead/Principal>",
  "interviewTopics": ["<likely interview topic 1>", "<topic2>", "<topic3>", "<topic4>", "<topic5>"]
}
`;
  return generateJSON(prompt);
};
