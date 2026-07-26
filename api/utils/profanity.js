const ABUSIVE_WORDS = new Set([
  "fuck", "shit", "bitch", "asshole", "bastard", "cunt", "dick",
  "pussy", "nigger", "faggot", "whore", "slut", "abuse", "scam",
  "fraud", "spam", "idiot", "dumb", "stupid"
]);

export function findAbusiveWord(text) {
  if (!text) return null;
  const cleaned = text.toLowerCase().replace(/[^\w\s]/gi, "");
  const words = cleaned.split(/\s+/);
  for (const w of words) {
    if (ABUSIVE_WORDS.has(w)) {
      return w;
    }
  }
  return null;
}
