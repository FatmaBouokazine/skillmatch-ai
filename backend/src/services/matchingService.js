/**
 * Multi-factor AI-style job ↔ employee matching.
 * Scoring weights: skills 40% · title 20% · description keywords 25% · education 15%
 */

const STOP_WORDS = new Set([
  'with', 'the', 'and', 'for', 'are', 'was', 'not', 'you', 'that', 'this',
  'from', 'have', 'has', 'will', 'they', 'your', 'our', 'can', 'its', 'into',
  'also', 'both', 'such', 'than', 'then', 'some', 'over', 'who', 'well',
  'able', 'been', 'being', 'used', 'using', 'each', 'must', 'good', 'very',
  'able', 'when', 'what', 'their', 'would', 'which', 'should',
]);

/** Tokenise text into meaningful lowercase words (>3 chars, no stop words). */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));
}

/** Unique tokens from text. */
function keywords(text) {
  return [...new Set(tokenize(text))];
}

/**
 * Compute a 0-100 match score between an employee profile and a job post.
 *
 * @param {object} emp  - EmployeeProfile document (lean)
 * @param {object} job  - JobPost document (lean)
 * @returns {{ score: number, matchedSkills: string[], breakdown: object }}
 */
function computeJobMatchScore(emp, job) {
  // ── 1. Skill match (40%) ────────────────────────────────────────────────
  const required = Array.isArray(job.requiredSkills)
    ? job.requiredSkills.map(s => s.toLowerCase())
    : [];
  const empSkillsLower = (emp.skills || []).map(s => s.name.toLowerCase());
  const matchedSkills = required.filter(s => empSkillsLower.includes(s));

  const skillScore = required.length > 0
    ? (matchedSkills.length / required.length) * 100
    : 50; // neutral when job lists no required skills

  // ── 2. Title / role relevance (20%) ────────────────────────────────────
  const jobTitleTokens = tokenize(job.title || '');
  const empRoleTokens = new Set([
    ...tokenize(emp.title || ''),
    ...(emp.experience || []).flatMap(e => tokenize(e.role || '')),
  ]);
  const titleScore = jobTitleTokens.length > 0
    ? (jobTitleTokens.filter(w => empRoleTokens.has(w)).length / jobTitleTokens.length) * 100
    : 50;

  // ── 3. Description keyword match (25%) ─────────────────────────────────
  const descKW = keywords(job.description || '');
  const empText = [
    emp.title || '',
    emp.bio || '',
    ...(emp.experience || []).map(e => `${e.role || ''} ${e.description || ''} ${e.company || ''}`),
    ...(emp.skills || []).map(s => s.name),
  ].join(' ').toLowerCase();

  const descScore = descKW.length > 0
    ? (descKW.filter(k => empText.includes(k)).length / descKW.length) * 100
    : 50;

  // ── 4. Education presence (15%) ─────────────────────────────────────────
  const hasEdu = (emp.education || []).some(e => e.institution || e.degree || e.field);
  const eduScore = hasEdu ? 72 : 40;

  // ── Weighted total ───────────────────────────────────────────────────────
  const raw = skillScore * 0.40 + titleScore * 0.20 + descScore * 0.25 + eduScore * 0.15;
  const score = Math.round(Math.min(100, Math.max(0, raw)));

  return {
    score,
    matchedSkills,
    breakdown: {
      skillScore:  Math.round(skillScore),
      titleScore:  Math.round(titleScore),
      descScore:   Math.round(descScore),
      eduScore:    Math.round(eduScore),
    },
  };
}

module.exports = { computeJobMatchScore };
