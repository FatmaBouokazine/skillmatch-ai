const pdfParse = require('pdf-parse');
const fs = require('fs');

/**
 * Parse a PDF file and return its plain-text content.
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<string>}
 */
async function parsePDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * Score resume text on a 0–100 scale by checking for key sections,
 * contact info, word count, and action verbs.
 * @param {string} text - Plain-text resume content
 * @returns {{ score: number, hints: string[] }}
 */
function scoreResume(text) {
  let score = 0;
  const hints = [];
  const lower = text.toLowerCase();

  // ── Contact info — 10 pts ──────────────────────────────────────
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/.test(lower);
  const hasPhone = /(\+?[\d\s\-().]{7,20})/.test(text);

  if (hasEmail) {
    score += 5;
  } else {
    hints.push('Add your email address to the contact section.');
  }
  if (hasPhone) {
    score += 5;
  } else {
    hints.push('Add a phone number so recruiters can reach you easily.');
  }

  // ── Professional summary — 15 pts ──────────────────────────────
  if (/\b(summary|objective|profile|professional summary|about me|career overview)\b/.test(lower)) {
    score += 15;
  } else {
    hints.push('Add a professional summary or objective section at the top of your resume.');
  }

  // ── Work experience — 25 pts ───────────────────────────────────
  if (/\b(experience|work history|employment|professional experience|career history)\b/.test(lower)) {
    score += 25;
  } else {
    hints.push('Add a work experience section describing your previous roles and achievements.');
  }

  // ── Education — 15 pts ─────────────────────────────────────────
  if (/\b(education|degree|university|college|bachelor|master|phd|diploma|certification|academic)\b/.test(lower)) {
    score += 15;
  } else {
    hints.push('Add an education section listing your academic qualifications and certifications.');
  }

  // ── Skills section — 20 pts ────────────────────────────────────
  if (/\b(skills|technologies|tools|expertise|technical skills|competencies|proficiencies)\b/.test(lower)) {
    score += 20;
  } else {
    hints.push('Add a dedicated skills section listing your technical and soft skills.');
  }

  // ── Resume length — 10 pts ─────────────────────────────────────
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 300) {
    score += 10;
  } else {
    hints.push(
      `Your resume is too brief (${wordCount} words). Aim for at least 300 words to provide sufficient detail.`
    );
  }

  // ── Action verbs — 5 pts ───────────────────────────────────────
  const actionVerbs = [
    'managed', 'developed', 'led', 'designed', 'implemented',
    'achieved', 'improved', 'built', 'created', 'delivered',
    'increased', 'reduced', 'launched', 'optimized', 'collaborated',
  ];
  const foundVerbs = actionVerbs.filter((v) => lower.includes(v));
  if (foundVerbs.length >= 3) {
    score += 5;
  } else {
    hints.push(
      'Use strong action verbs (e.g., managed, developed, implemented, achieved) to describe your accomplishments.'
    );
  }

  return { score: Math.min(score, 100), hints: hints.slice(0, 5) };
}

/**
 * Use Claude AI to extract structured profile data from resume text.
 * @param {string} text - Plain-text resume content
 * @returns {Promise<object>}
 */
async function extractResumeData(text) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  // Lazy-require so the module loads even without the SDK installed yet
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Anthropic = require('@anthropic-ai/sdk');
  const ClientClass = Anthropic.default || Anthropic;
  const client = new ClientClass({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `Extract the following from this resume text and return ONLY valid JSON with no extra text or markdown:
{
  "firstName": "",
  "lastName": "",
  "title": "",
  "location": "",
  "bio": "",
  "skills": [],
  "experience": [{"company": "", "role": "", "startDate": "", "endDate": "", "description": ""}]
}

Rules:
- title: current or most recent job title
- bio: professional summary, max 3 sentences
- skills: array of skill strings
- experience: array of work experience entries; leave endDate empty if current role

Resume text:
${text}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].text.trim();
  // Strip markdown code fences if present
  const jsonStr = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  return JSON.parse(jsonStr);
}

module.exports = { parsePDF, scoreResume, extractResumeData };
