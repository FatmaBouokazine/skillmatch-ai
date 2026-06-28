// Use the internal module to avoid pdf-parse's auto-run test that rejects with
// undefined when the test fixture file is missing (a well-known library bug).
const pdfParse = require('pdf-parse/lib/pdf-parse.js');
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
 * AI-powered resume scorer — returns score 0-100 plus detailed feedback.
 * Falls back to regex scoring when no AI key is available.
 * @param {string} text
 * @returns {Promise<{ score: number, hints: string[] }>}
 */
async function scoreResumeWithAI(text) {
  const apiKey = process.env.GROQ_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return scoreResume(text);

  const prompt = `You are an expert resume reviewer and career coach. Analyse the resume text below and return ONLY valid JSON — no markdown, no explanation.

Return exactly this shape:
{
  "score": 72,
  "hints": [
    "Your professional summary is strong, but consider adding measurable outcomes.",
    "..."
  ]
}

Scoring criteria (total 100 pts):
- Contact completeness (email, phone, LinkedIn/GitHub): 10 pts
- Professional summary / objective quality: 15 pts
- Work experience depth (roles, dates, bullet achievements): 25 pts
- Education section completeness: 15 pts
- Skills section relevance and coverage: 20 pts
- Resume length & detail (word count, descriptions): 10 pts
- Use of strong action verbs and quantified results: 5 pts

For "hints": provide 4–6 SPECIFIC, actionable pieces of advice tailored to THIS resume. Do not give generic tips — reference actual content, missing sections, or weak spots you observed. Each hint should be 1–2 sentences.

Resume text:
${text.slice(0, 6000)}`;

  try {
    if (process.env.GROQ_API_KEY) {
      const Groq = require('groq-sdk');
      const ClientClass = Groq.default || Groq;
      const groq = new ClientClass({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      });
      const raw = completion.choices[0].message.content.trim();
      const jsonStr = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      const parsed = JSON.parse(jsonStr);
      return {
        score: Math.max(0, Math.min(100, Math.round(Number(parsed.score)))),
        hints: Array.isArray(parsed.hints) ? parsed.hints.slice(0, 8) : [],
      };
    }

    if (process.env.ANTHROPIC_API_KEY) {
      const Anthropic = require('@anthropic-ai/sdk');
      const ClientClass = Anthropic.default || Anthropic;
      const client = new ClientClass({ apiKey: process.env.ANTHROPIC_API_KEY });
      const message = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });
      const raw = message.content[0].text.trim();
      const jsonStr = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      const parsed = JSON.parse(jsonStr);
      return {
        score: Math.max(0, Math.min(100, Math.round(Number(parsed.score)))),
        hints: Array.isArray(parsed.hints) ? parsed.hints.slice(0, 8) : [],
      };
    }
  } catch (_) {
    // AI failed — fall back to regex
  }

  return scoreResume(text);
}

/**
 * Regex-based resume extraction — runs when AI is unavailable.
 * @param {string} text
 * @returns {object}
 */
function extractResumeDataFallback(text) {
  // ── Pre-process: split concatenated text that PDFs merge together ──────────
  // e.g. "NutritionMarch 2024" → "Nutrition March 2024"
  //      "Technology2024"      → "Technology 2024"
  const MONTH_NAMES = 'January|February|March|April|May|June|July|August|September|October|November|December';
  const preprocessed = text
    .replace(new RegExp(`([a-zA-Z])(${MONTH_NAMES})`, 'g'), '$1 $2')
    .replace(/([a-zA-Z])((?:19|20)\d{2})\b/g, '$1 $2');

  const lines = preprocessed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // ── Section detection ──────────────────────────────────────────────────────
  const IS_SECTION = (l) => {
    const t = l.trim();
    if (!t || t.length > 60) return false;
    return /^(summary|objective|profile|about\s*me|professional\s*(?:summary|profile)|career\s*(?:summary|overview)|personal\s*statement|introduction|skills?|technical\s*skills?|core\s*competencies?|competencies|technologies|tools|(?:work\s+)?experience|work\s+history|employment(?:\s+history)?|professional\s+experience|career\s+history|education|academic(?:\s+background)?|qualifications?|training|certifications?|projects?|awards?|languages?|references?|hobbies|interests?|volunteer)/i.test(t);
  };

  function getSectionLines(headings) {
    const hs = Array.isArray(headings) ? headings : [headings];
    const start = lines.findIndex((l) => {
      const t = l.trim();
      return hs.some((h) => {
        const p = h.replace(/\s+/g, '\\s+');
        if (new RegExp(`^${p}\\s*:?\\s*$`, 'i').test(t)) return true;
        if (t.length <= 50 && new RegExp(`^${p}\\b`, 'i').test(t)) return true;
        return false;
      });
    });
    if (start === -1) return [];
    const end = lines.findIndex((l, i) => i > start && IS_SECTION(l));
    return lines.slice(start + 1, end === -1 ? undefined : end);
  }

  // ── Contact ────────────────────────────────────────────────────────────────
  const emailM    = preprocessed.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneM    = preprocessed.match(/(?<!\d)(\+?[\d][\d()\s\-.]{5,17}[\d])(?!\d)/);
  const linkedInM = preprocessed.match(/linkedin\.com\/in\/(\w[\w-]+)/i);
  const githubM   = preprocessed.match(/github\.com[\/\\]+(\w[\w-]+)/i)
                 || preprocessed.match(/github\s*:\s*(?:https?:\/\/github\.com\/)?(\w[\w-]+)/i);
  const githubUser = githubM ? (githubM[2] || githubM[1]) : '';

  // ── Header = lines before first section heading ───────────────────────────
  // Prevents education/experience content from polluting name/title/location
  const TITLE_KW    = /\b(engineer|developer|designer|analyst|manager|director|lead|senior|junior|architect|consultant|specialist|coordinator|officer|executive|scientist|researcher|intern|associate|vp|cto|ceo|cfo|president|administrator|supervisor|programmer|full[\s-]?stack|front[\s-]?end|back[\s-]?end|devops)\b/i;
  const firstSecIdx = lines.findIndex((l) => IS_SECTION(l));
  const headerLines = lines.slice(0, firstSecIdx > 0 ? firstSecIdx : Math.min(8, lines.length));

  // Name — accepts "John Smith", "Azer IDOUDI", "JOHN SMITH" (any capitalisation)
  let firstName = '', lastName = '';
  const nameLine = headerLines.find(
    (l) => /^[A-Z][a-zA-Z'-]+(?:\s+[A-Z][a-zA-Z'-]+){1,3}$/.test(l)
        && !/@/.test(l) && !/\d/.test(l) && !IS_SECTION(l)
  ) || '';
  if (nameLine) {
    // Normalise ALL-CAPS words to Title Case ("IDOUDI" → "Idoudi")
    const parts = nameLine.trim().split(/\s+/).map((w) =>
      /^[A-Z]+$/.test(w) ? w[0] + w.slice(1).toLowerCase() : w
    );
    firstName = parts[0] || '';
    lastName  = parts.slice(1).join(' ');
  }

  // Title — header first, then whole-doc fallback for short standalone title lines
  const nameIdx = nameLine ? lines.indexOf(nameLine) : 0;
  let title = lines.slice(nameIdx + 1, nameIdx + 6).find(
    (l) => TITLE_KW.test(l) && l.length < 80 && !/@/.test(l) && !/^https?:/i.test(l) && !l.includes(':')
  ) || '';
  if (!title) {
    title = lines.find(
      (l, i) => i > nameIdx && TITLE_KW.test(l) && l.length < 60
             && !/@/.test(l) && !/^https?:/i.test(l) && !/^\d/.test(l)
             && !l.includes(':')
    ) || '';
  }
  // Strip project/company suffix after " – " separator (e.g. "Developer – E-commerce" → "Developer")
  title = title.split(/\s+–\s+/)[0].trim();

  // Location — only in the real header; split each line on separators so
  // concatenated strings like "DegreeTunis, Tunisia" don't get picked up
  let location = '';
  for (const l of headerLines) {
    if (TITLE_KW.test(l) || /@/.test(l) || /^https?:/i.test(l)) continue;
    const segments = l.split(/\s*[|·•—]\s*/).map((s) => s.trim());
    for (const seg of segments) {
      if (!seg || seg.length > 50 || TITLE_KW.test(seg) || /@/.test(seg)) continue;
      if (/^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?,\s*[A-Z]{2,3}$/.test(seg)) {
        location = seg; break;
      }
      if (/^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?,\s*[A-Z][a-zA-Z]{3,}$/.test(seg)
          && !TITLE_KW.test(seg)) {
        location = seg; break;
      }
    }
    if (location) break;
  }

  // ── Summary / Bio ─────────────────────────────────────────────────────────
  const sumLines = getSectionLines([
    'summary', 'objective', 'profile', 'about me', 'about',
    'professional summary', 'professional profile', 'career objective',
    'career overview', 'personal statement', 'introduction', 'overview',
  ]);
  const bio = sumLines.slice(0, 5).join(' ').replace(/\s+/g, ' ').trim();

  // ── Skills ────────────────────────────────────────────────────────────────
  const skLines = getSectionLines([
    'skills', 'technical skills', 'core competencies', 'competencies',
    'tools', 'technologies', 'proficiencies', 'expertise', 'key skills', 'tech stack',
  ]);
  // Strip "Category: " prefixes ("Programming Languages: C, C++" → "C, C++")
  const skText = skLines.map((l) => l.replace(/^[A-Za-z\s/\-]+:\s*/, '')).join(', ');
  const skills = [...new Set(
    skText
      .split(/[,|•·\t\n]+/)
      .map((s) => s.replace(/^[\s\-\*\u2022]+/, '').trim())
      .filter((s) => s.length > 1 && s.length < 50 && !/^\d+$/.test(s)),
  )].slice(0, 30);

  // ── Experience ─────────────────────────────────────────────────────────────
  const expLines = getSectionLines([
    'experience', 'work experience', 'work history', 'employment',
    'professional experience', 'career history', 'employment history',
  ]);
  const experience = [];

  // Matches "March 2024 – June 2024", "2020 – 2022", "2020 – Present"
  // Works on preprocessed lines where month names are already separated
  const DATE_RANGE = /(\b(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+)?\d{4})\s*[-–—to]+\s*((?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+)?\d{4}|Present|Current|Now)\b/i;

  let curExp = null;

  // Assign a text fragment to the right field of an experience entry.
  // Uses TITLE_KW to distinguish role lines from company lines.
  function _expAssign(entry, line) {
    if (line.length >= 100) {
      entry.description += (entry.description ? ' ' : '') + line;
      return;
    }
    // Split on pipe/bullet/en-dash separators (e.g. "Developer – Project TitleRemote")
    const parts = line.split(/\s*[|·•–]\s*/).map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (!entry.role && part.length < 65 && TITLE_KW.test(part)) {
        entry.role = part;
      } else if (!entry.company) {
        entry.company = part;
      } else {
        entry.description += (entry.description ? ' ' : '') + part;
      }
    }
  }

  for (const line of expLines) {
    const dm = DATE_RANGE.exec(line);
    if (dm) {
      if (curExp) experience.push(curExp);
      const endRaw  = dm[2].trim();
      const current = /present|current|now/i.test(endRaw);
      // Text on the same line as the date (may be "Role | Company" etc.)
      const extra   = line.replace(dm[0], '').replace(/^[\s\-|–—,.:]+|[\s\-|–—,.:]+$/g, '').trim();
      curExp = { company: '', role: '', startDate: dm[1].trim(), endDate: current ? '' : endRaw, current, description: '' };
      if (extra) _expAssign(curExp, extra);
    } else if (curExp) {
      _expAssign(curExp, line);
    }
  }
  if (curExp) experience.push(curExp);

  // ── Education ──────────────────────────────────────────────────────────────
  const eduLines = getSectionLines(['education', 'academic', 'academic background', 'qualifications', 'training']);
  const education = [];

  const DEGREE_RX = /\b(bachelor(?:'s)?|master(?:'s)?|phd|ph\.d\.?|doctorate|associate(?:'s)?|b\.?\s*sc\.?|m\.?\s*sc\.?|b\.?\s*[ae]\.?|m\.?\s*[ae]\.?|b\.?\s*eng\.?|m\.?\s*eng\.?|mba|diploma|certificate|b\.s\.|m\.s\.|a\.s\.|llb|llm|undergraduate|postgraduate)\b/i;
  const UNI_RX    = /\b(university|college|institute|school|academy|polytechnic|faculty)\b/i;
  const YEAR_ONLY = /^\d{4}\s*(?:[-–—]\s*(?:\d{4}|Present|Current))?\s*$/i;
  const YEAR_ALL  = /\b(\d{4})\b/g;

  // Strip trailing "City, Country", trailing years, and trailing lone month names
  function _stripEdu(s) {
    const MONTH_RX = /\s*\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*$/i;
    return s
      .replace(/\s*\d{4}.*$/i, '')                              // strip trailing year+
      .replace(/\s*[A-Z][a-z]+,\s*[A-Z][a-z]+\s*$/, '')        // strip "City, Country" (lowercase-only after first char prevents greedy match)
      .replace(MONTH_RX, '')                                    // strip trailing lone month
      .trim();
  }

  function _allYears(s) {
    YEAR_ALL.lastIndex = 0;
    const found = [];
    let m;
    while ((m = YEAR_ALL.exec(s)) !== null) found.push(m[1]);
    return found;
  }

  let curEdu = null;
  function _pushEdu() {
    if (curEdu && (curEdu.institution || curEdu.degree)) education.push({ ...curEdu });
    curEdu = null;
  }

  for (const line of eduLines) {
    const isDeg      = DEGREE_RX.test(line);
    const isUni      = UNI_RX.test(line);
    const isYearOnly = YEAR_ONLY.test(line);
    const years      = _allYears(line);

    function _applyYears(entry) {
      if (!entry.startDate && years[0]) {
        entry.startDate = years[0];
        if (years.length > 1 && !/present|current/i.test(line))
          entry.endDate = years[years.length - 1];
        else if (/present|current/i.test(line))
          entry.endDate = '';
      }
    }

    if (isYearOnly) {
      if (curEdu) _applyYears(curEdu);
      continue;
    }

    if (isDeg) {
      if (!curEdu) {
        curEdu = { institution: '', degree: '', field: '', startDate: '', endDate: '' };
      } else if (curEdu.degree) {
        _pushEdu();
        curEdu = { institution: '', degree: '', field: '', startDate: '', endDate: '' };
      }
      curEdu.degree = _stripEdu(line);
      _applyYears(curEdu);
    } else if (isUni) {
      if (!curEdu) {
        curEdu = { institution: '', degree: '', field: '', startDate: '', endDate: '' };
      } else if (curEdu.institution) {
        _pushEdu();
        curEdu = { institution: '', degree: '', field: '', startDate: '', endDate: '' };
      }
      curEdu.institution = _stripEdu(line);
      _applyYears(curEdu);
    } else if (curEdu) {
      if (years.length && !curEdu.startDate) {
        _applyYears(curEdu);
      } else if (!years.length && !curEdu.field && line.length < 100) {
        curEdu.field = line;
      }
    }
  }
  _pushEdu();

  return {
    firstName,
    lastName,
    title,
    location,
    phone:    phoneM    ? (phoneM[1] || phoneM[0]).trim() : '',
    linkedIn: linkedInM ? `https://linkedin.com/in/${linkedInM[1]}` : '',
    github:   githubUser ? `https://github.com/${githubUser}` : '',
    bio,
    skills,
    experience: experience.slice(0, 10),
    education:  education.slice(0, 5),
  };
}

/**
 * Use Claude AI to extract structured profile data from resume text.
 * Falls back to regex extraction if the AI key is not configured.
 * @param {string} text - Plain-text resume content
 * @returns {Promise<object>}
 */
async function extractResumeData(text) {
  if (!process.env.GROQ_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return extractResumeDataFallback(text);
  }

  const prompt = `You are a resume parser. Extract structured data from the resume text below and return ONLY valid JSON — no markdown, no explanation, no extra text.

Return exactly this shape:
{
  "firstName": "",
  "lastName": "",
  "title": "",
  "location": "",
  "phone": "",
  "linkedIn": "",
  "github": "",
  "bio": "",
  "skills": [],
  "experience": [
    {
      "company": "",
      "role": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": ""
    }
  ]
}

Rules:
- firstName / lastName: from the name at the top of the resume
- title: current or most recent job title (e.g. "Senior Frontend Engineer")
- location: city and country/state if present
- phone: phone number if present, else empty string
- linkedIn: LinkedIn profile URL if present, else empty string
- github: GitHub profile URL or username if present, else empty string
- bio: write a concise 2–3 sentence professional summary based on the resume content
- skills: flat array of skill strings extracted from skills section and throughout the resume; deduplicate; no duplicates
- experience: array of work entries sorted newest first; set current=true if it is a current role (no end date or says "Present"); dates as "Month YYYY" or "YYYY" or empty string
- education: array of education entries sorted newest first; dates as "YYYY" or empty string

Resume text:
${text}`;

  // ── Try Groq first (free tier, fast) ──────────────────────────────────────
  if (process.env.GROQ_API_KEY) {
    try {
      const Groq = require('groq-sdk');
      const ClientClass = Groq.default || Groq;
      const groq = new ClientClass({ apiKey: process.env.GROQ_API_KEY });
      const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const completion = await groq.chat.completions.create({
        model,
        max_tokens: 4096,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }],
      });
      const raw = completion.choices[0].message.content.trim();
      const jsonStr = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      return JSON.parse(jsonStr);
    } catch (err) {
      // Fall through to Anthropic or regex
    }
  }

  // ── Try Anthropic as secondary ─────────────────────────────────────────────
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const ClientClass = Anthropic.default || Anthropic;
      const client = new ClientClass({ apiKey: process.env.ANTHROPIC_API_KEY });
      const message = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-5',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      });
      const raw = message.content[0].text.trim();
      const jsonStr = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      return JSON.parse(jsonStr);
    } catch (err) {
      // Fall through to regex
    }
  }

  // ── Regex fallback ─────────────────────────────────────────────────────────
  return extractResumeDataFallback(text);
}

module.exports = { parsePDF, scoreResume, scoreResumeWithAI, extractResumeData, extractResumeDataFallback };
