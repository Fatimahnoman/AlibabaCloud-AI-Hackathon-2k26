export type DetectedLanguage = 'english' | 'roman_urdu' | 'urdu' | 'mixed' | 'unknown';

const URDU_RANGES = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const ROMAN_URDU_MARKERS = [
  /\b(mein|mai|mujhe|tumhe|aapko|usko|unko|humko|yeh|woh|ye|wo|kya|kaise|kaisa|kahan|kab|kyun|kyu|kaun|kaunsa|kitna|kitne|bilkul|zaroor|nahi|haan|ji|theek|accha|bura|sundar|chota|bada|lamba|gharelu|paisa|paise|rupees|rupay|ghar|bahar|andar|upar|neeche|saath|alag|paas|door|jaldi|dhire|subah|shaam|raat|din|mahina|hafta|saal|scholarship|university|universities|college|school|padhai|padhna|likhna|samajhna|computer|science|engineering|medicine|business|arts|commerce|math|physics|chemistry|biology|history|geography|english|hindi|urdu|fraud|fake|scam|phishing|budget|income|expense|salary|kharcha|kamai|bachat|saving|goal|plan|study|teacher|student|class|exam|test|result|grade|marks|percentage|admission|apply|application|form|document|paper|visa|passport|interview|appointment|country|pakistan|india|america|uk|canada|australia|germany|china|japan|korea|saudi|dubai|uae|qatar|kuwait|oman|bahrain|turkey|malaysia|turkey)\b/gi,
];

const ROMAN_URDU_PATTERNS = [
  /\b(mein|mai|tujhe|tumhe|aapko|usko|unko|humko)\b/i,
  /\b(yeh|woh|ye|wo|kya|kaise|kahan|kyun|kaun)\b/i,
  /\b(bilkul|zaroor|nahi|haan|ji|theek|accha|chalo|suno|dekho|batao|bolo|likho|padho)\b/i,
  /\b(paisa|paise|rupees|rupay|ghar|kharcha|kamai|bachat)\b/i,
  /\b(padhai|padhna|likhna|samajhna|sikhna|seekhna)\b/i,
  /\b(mujhe|tumhe|aapko|usko|unko|humko|mere|tumhare|aapke|uske|unke|hamare)\b/i,
];

export function detectLanguage(text: string): DetectedLanguage {
  if (!text || text.trim().length === 0) return 'unknown';

  const trimmed = text.trim();
  const hasUrdu = URDU_RANGES.test(trimmed);
  const hasAscii = /[a-zA-Z]/.test(trimmed);

  const romanUrduScore = ROMAN_URDU_PATTERNS.reduce((score, pattern) => {
    const matches = trimmed.match(pattern);
    return score + (matches ? matches.length : 0);
  }, 0);

  const romanUrduMarkers = ROMAN_URDU_MARKERS.reduce((score, pattern) => {
    const matches = trimmed.match(pattern);
    return score + (matches ? matches.length : 0);
  }, 0);

  const isRomanUrdu = romanUrduScore >= 2 || romanUrduMarkers >= 3;

  if (hasUrdu && hasAscii) return 'mixed';
  if (hasUrdu && !hasAscii) return 'urdu';
  if (isRomanUrdu && hasAscii) return 'roman_urdu';
  if (hasAscii && !hasUrdu) return 'english';

  return 'unknown';
}

export function getLanguageLabel(lang: DetectedLanguage): string {
  switch (lang) {
    case 'english': return 'English';
    case 'roman_urdu': return 'Roman Urdu';
    case 'urdu': return 'Urdu';
    case 'mixed': return 'Mixed';
    default: return 'English';
  }
}
