# Profanity / abusive word filter
# Words are checked case-insensitively as whole or substring matches

BLOCKED_WORDS = [
    # Common profanity
    "fuck", "shit", "bitch", "asshole", "bastard", "cunt", "dick", "cock",
    "pussy", "whore", "slut", "damn", "ass", "piss", "crap", "wtf", "stfu",
    "fag", "faggot", "nigger", "nigga", "spic", "kike", "chink", "retard",
    "moron", "idiot", "stupid", "dumbass", "motherfucker", "fucker", "bullshit",
    "jackass", "dipshit", "shithead", "arsehole", "arse", "twat", "wanker",
    "tosser", "bollocks", "prick", "douche", "douchebag", "jerk", "loser",
    "screw you", "go to hell", "son of a bitch", "son of bitch", "bloody hell",
    "god damn", "goddamn", "goddam", "hell", "rape", "sexual", "porn", "sex",
    "penis", "vagina", "boobs", "nude", "naked", "XXX",
]


def find_abusive_word(text: str) -> str | None:
    """Returns the offending word if found, else None."""
    if not text:
        return None
    lower = text.lower()
    for word in BLOCKED_WORDS:
        if word.lower() in lower:
            return word
    return None


def contains_abusive_word(text: str) -> bool:
    """Returns True if text contains any blocked word."""
    return find_abusive_word(text) is not None
