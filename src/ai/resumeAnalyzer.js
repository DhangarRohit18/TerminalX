import { generateJSON } from './gemini';

const MOCK_RESUME_ANALYSIS = {
  name: "Rohit Dhangar",
  skills: ["React.js", "Node.js", "Firebase", "Express.js", "JavaScript", "HTML5", "CSS3", "Git", "REST APIs", "Tailwind CSS"],
  programmingLanguages: ["JavaScript", "TypeScript", "Python", "SQL"],
  frameworks: ["React", "Express", "Next.js"],
  tools: ["VS Code", "Git", "Postman", "Vercel", "Firebase Console"],
  experience: [
    { company: "Tech Solutions Inc.", role: "Frontend Developer Intern", duration: "Jan 2025 - Present", highlights: ["Developed responsive UI components using React and Tailwind CSS", "Integrated REST APIs for real-time data binding", "Improved page load times by 25% through lazy loading and code splitting"] }
  ],
  projects: [
    { name: "TerminalX", description: "A browser-based interactive terminal application with support for custom themes and command execution.", techStack: ["React", "CSS", "Vite"], impact: "Received 500+ stars on GitHub and used by developers for mock CLI environments." }
  ],
  education: [
    { degree: "Bachelor of Technology in Computer Science", institution: "Tech University", year: "2026", gpa: "8.5/10" }
  ],
  certifications: ["React Developer Certification", "Firebase Fundamentals Badge"],
  summary: "Results-driven Software Engineering student with experience building modern web applications. Specialized in frontend development with React, state management, and real-time backend integrations with Firebase.",
  strengthScore: 88,
  strengths: ["Strong JavaScript and React fundamentals", "Excellent UI/UX design sense and responsive styling", "Active project experience with terminal emulation and API integrations"],
  weaknesses: ["Limited professional production experience", "Lack of complex cloud architecture deployment history"],
  improvementSuggestions: ["Add automated test coverage (Jest, Playwright) to portfolio projects", "Integrate CI/CD pipelines to demonstrate automated workflow knowledge", "Incorporate state management tools like Redux Toolkit for larger codebases"],
  overallAssessment: "Strong candidate with solid frontend building blocks. The projects demonstrate a high level of autonomy and implementation depth. Focus on backend fundamentals and testing to reach the senior developer level."
};

export const analyzeResume = async (resumeText) => {
  try {
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
    return await generateJSON(prompt);
  } catch (err) {
    console.warn("Gemini API resume analysis failed, returning static mock fallback data:", err);
    return MOCK_RESUME_ANALYSIS;
  }
};
