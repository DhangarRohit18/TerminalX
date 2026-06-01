import { generateJSON } from './gemini';

const MOCK_JD_ANALYSIS = {
  jobTitle: "Software Engineer",
  company: "Google",
  requiredSkills: ["React", "TypeScript", "Node.js", "REST APIs", "Data Structures", "Algorithms"],
  preferredSkills: ["Google Cloud Platform", "Kubernetes", "Next.js", "GraphQL"],
  programmingLanguages: ["TypeScript", "JavaScript", "Python"],
  frameworks: ["React", "Express"],
  tools: ["Git", "Webpack", "Docker", "VS Code"],
  responsibilities: [
    "Design and develop responsive, highly interactive web applications",
    "Collaborate with product managers and UX designers to build clean user interfaces",
    "Write scalable APIs and backend services using Node.js",
    "Write automated unit and integration tests"
  ],
  experienceRequired: "2+ years",
  educationRequired: "B.S. or M.S. in Computer Science or equivalent practical experience",
  keywords: ["Frontend", "Fullstack", "React", "TypeScript", "REST", "Agile"],
  softSkills: ["Teamwork", "Communication", "Problem Solving", "Growth Mindset"],
  summary: "Google is looking for a Software Engineer to join our Core UI team. You will be responsible for building premium web interfaces, improving frontend architectures, and integrating backend APIs.",
  seniorityLevel: "Mid",
  interviewTopics: ["React Architecture", "State Management", "REST APIs", "JavaScript/TypeScript Fundamentals", "CSS Grid & Flexbox"]
};

export const analyzeJD = async (jdText) => {
  try {
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
    return await generateJSON(prompt);
  } catch (err) {
    console.warn("Gemini API JD analysis failed, returning static mock fallback data:", err);
    return MOCK_JD_ANALYSIS;
  }
};
