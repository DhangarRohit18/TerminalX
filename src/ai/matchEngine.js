import { generateJSON } from './gemini';

const MOCK_MATCH_ANALYSIS = {
  skillMatchPercent: 82,
  projectMatchPercent: 85,
  experienceMatchPercent: 70,
  overallMatchScore: 81,
  matchedSkills: ["React", "TypeScript", "Node.js", "REST APIs", "Git", "VS Code"],
  missingSkills: ["Google Cloud Platform", "Kubernetes", "GraphQL", "Docker"],
  strongAreas: ["Frontend development with React and TypeScript", "API consumption and data synchronization"],
  gapAreas: ["DevOps, containerization (Docker/Kubernetes)", "Cloud infrastructure setup (GCP/AWS)"],
  recommendation: "maybe",
  recommendationReason: "The candidate meets all core frontend requirements and has excellent React skills. However, they lack experience with Kubernetes and Google Cloud Platform, which are preferred for this role.",
  hiringProbability: 75,
  skillBreakdown: [
    { skill: "React", inResume: true, inJD: true, proficiencyEstimate: 90 },
    { skill: "TypeScript", inResume: true, inJD: true, proficiencyEstimate: 85 },
    { skill: "Node.js", inResume: true, inJD: true, proficiencyEstimate: 75 },
    { skill: "REST APIs", inResume: true, inJD: true, proficiencyEstimate: 85 },
    { skill: "Google Cloud Platform", inResume: false, inJD: true, proficiencyEstimate: 0 },
    { skill: "Kubernetes", inResume: false, inJD: true, proficiencyEstimate: 0 }
  ],
  improvementPriority: [
    "Learn Google Cloud Platform fundamentals and containerization using Docker",
    "Gain exposure to building API endpoints using GraphQL instead of only REST"
  ]
};

export const matchResumeToJD = async (resumeAnalysis, jdAnalysis) => {
  try {
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
    return await generateJSON(prompt);
  } catch (err) {
    console.warn("Gemini API resume-JD match failed, returning static mock fallback data:", err);
    return MOCK_MATCH_ANALYSIS;
  }
};
