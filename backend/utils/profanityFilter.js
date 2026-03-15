// Profanity / abusive word filter
// Words are checked case-insensitively as whole or substring matches

const BLOCKED_WORDS = [
  // Common profanity
  "fuck", "shit", "bitch", "asshole", "bastard", "cunt", "dick", "cock",
  "pussy", "whore", "slut", "damn", "ass", "piss", "crap", "wtf", "stfu",
  "fag", "faggot", "nigger", "nigga", "spic", "kike", "chink", "retard",
  "moron", "idiot", "stupid", "dumbass", "motherfucker", "fucker", "bullshit",
  "jackass", "dipshit", "shithead", "arsehole", "arse", "twat", "wanker",
  "tosser", "bollocks", "prick", "douche", "douchebag", "jerk", "loser",
  "screw you", "go to hell", "son of a bitch", "son of bitch", "bloody hell",
  "god damn", "goddamn", "goddam", "hell", "rape", "sexual", "porn", "sex",
  "penis", "vagina", "boobs", "nude", "naked", "XXX",
];

/**
 * Returns the offending word if found, else null.
 * @param {string} text
 * @returns {string|null}
 */
export const findAbusiveWord = (text) => {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word.toLowerCase())) {
      return word;
    }
  }
  return null;
};

/**
 * Returns true if text contains any blocked word.
 * @param {string} text
 * @returns {boolean}
 */
export const containsAbusiveWord = (text) => findAbusiveWord(text) !== null;
