from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


NUMBER_SUGGESTIONS_RETURNED = 12
ERROR_CODE_MISSING_SEARCH_PARAMETER = "missing_search_parameter"

# This query will return an intermediary table containing a single column (`word`)
# and one row per word found in all pins' title and description,
# by leveraging the regexp_split_to_table PostgreSQL function.
# We split the text by: space, period, comma, hyphen, colon, slash and question mark.
SQL_QUERY_SELECT_ALL_WORDS_PINS_TITLE_DESCRIPTION = """
SELECT regexp_split_to_table(lower(title), '[\\s.,-:/?]+') AS word
FROM pinit_api_pin
UNION ALL
SELECT regexp_split_to_table(lower(description), '[\\s.,-:/?]+') AS word
FROM pinit_api_pin
"""

# This query will select the N words which appear most frequently in the
# intermediary table above and which are 'LIKE' the pattern provided as parameter (`%s`).
# This pattern will be `{prefix}%`, where `prefix` is the term we want to auto-complete,
# and `%` is the usual SQL wildcard for `LIKE` statements.
SQL_QUERY_GET_AUTOCOMPLETE_SUGGESTIONS = f"""
SELECT word
FROM (
{SQL_QUERY_SELECT_ALL_WORDS_PINS_TITLE_DESCRIPTION}
) t
WHERE word LIKE %s
GROUP BY word
ORDER BY COUNT(*) DESC, word
LIMIT {NUMBER_SUGGESTIONS_RETURNED};
"""


@api_view(["GET"])
def get_search_suggestions(request):
    search_term = request.GET.get("search", None)

    if not search_term:
        return Response(
            {"errors": [{"code": ERROR_CODE_MISSING_SEARCH_PARAMETER}]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    sanitized_search_term = "".join(char for char in search_term if char.isalnum())

    lowercase_search_term = sanitized_search_term.lower()

    with connection.cursor() as cursor:
        cursor.execute(
            SQL_QUERY_GET_AUTOCOMPLETE_SUGGESTIONS, [f"{lowercase_search_term}%"]
        )

        # cursor.fetchall() returns a list of lists, so we need to flatten it:
        suggestions = [item[0] for item in cursor.fetchall()]

    response_data = {"results": suggestions}

    return Response(response_data)
