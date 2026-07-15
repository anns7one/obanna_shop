import re

_UNSAFE_CHARS = set("<>{}`;=\\")
_NAME_PUNCTUATION = {" ", "-", "'", "’"}


def validate_phone_format(value: str) -> str:
    """Deliberately not tied to any one country's dialing pattern (e.g. a
    fixed +7(...)...-..-.. mask) — Obanna's customers aren't limited to one
    country, so this only checks for a plausible international shape:
    digits plus common separators, no letters or other symbols."""
    value = value.strip()
    if not re.fullmatch(r"[0-9+()\-\s]{6,30}", value):
        raise ValueError("Enter a valid phone number")
    return value


def validate_name_characters(value: str) -> str:
    """Letters (any language/script), spaces, hyphens and apostrophes only —
    covers real names worldwide while rejecting digits and symbols."""
    value = value.strip()
    if not value or not all(ch.isalpha() or ch in _NAME_PUNCTUATION for ch in value):
        raise ValueError("Only letters, spaces, hyphens and apostrophes are allowed")
    return value


def validate_safe_text(value: str) -> str:
    """Free-form fields (address, city, comments, ...) legitimately contain
    almost any character, so this only blocks a small set of symbols with no
    normal use in this kind of text and a history of markup/injection abuse,
    rather than restricting to a narrow allowlist."""
    value = value.strip()
    if not value or any(ch in _UNSAFE_CHARS for ch in value):
        raise ValueError("This field contains characters that aren't allowed")
    return value
