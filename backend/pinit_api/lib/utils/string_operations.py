import re


def compute_initial(email=""):
    match_letter_before_at = re.search(r"([a-zA-Z])[^@]*@", email)

    if match_letter_before_at:
        # At least one letter found before '@': return the first one (capitalized)
        return match_letter_before_at.group(1).upper()

    # Otherwise, return "X" by default:
    return "X"


def compute_username_candidate(email=""):
    local_part = email.split("@")[0]

    alphabetic_characters = re.findall(r"[a-zA-Z]+", local_part)

    username_candidate = "".join(alphabetic_characters).lower()

    # Return "user" if no alphabetic characters were found in the email address:
    return username_candidate if username_candidate else "user"


def compute_first_and_last_name(email=""):
    local_part = email.split("@")[0]

    # Assume ".", "_" and "-" can separate a first name from a last name
    separators_pattern = r"[._-]"

    name_parts = re.split(separators_pattern, local_part)

    # Remove any non-alphabetical characters from the name parts
    name_parts = ["".join(re.findall(r"[a-zA-Z]+", part)) for part in name_parts]

    # Assume first name is in first place after splitting by separators,
    # and last name in second place:
    first_name = name_parts[0].capitalize() if len(name_parts) > 0 else ""
    last_name = name_parts[1].capitalize() if len(name_parts) > 1 else ""

    return first_name, last_name
