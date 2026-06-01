import { generateJSON } from './gemini';

export const generateRoadmap = async ({ resumeAnalysis, jdAnalysis, matchData, readinessScore, plan = 7 }) => {
  const prompt = `
You are a career coach. Create a personalized ${plan}-day interview preparation roadmap.

Candidate Profile:
- Current Readiness Score: ${readinessScore}/100
- Skills: ${(resumeAnalysis?.skills || []).join(', ')}
- Missing Skills: ${(matchData?.missingSkills || []).join(', ')}
- Gap Areas: ${(matchData?.gapAreas || []).join(', ')}
- Target Role: ${jdAnalysis?.jobTitle || 'Software Engineer'}

Return a JSON array of exactly ${plan} day objects:
[
  {
    "day": 1,
    "theme": "<day theme e.g. Arrays & Strings>",
    "tasks": [
      {
        "title": "<task title>",
        "description": "<what to do>",
        "duration": "<e.g. 45 min>",
        "type": "<study|practice|mock|review>",
        "resources": ["<resource name>"]
      }
    ],
    "goal": "<what the candidate should achieve by end of this day>",
    "focusSkill": "<primary skill focus>"
  }
]
`;
  return generateJSON(prompt);
};
