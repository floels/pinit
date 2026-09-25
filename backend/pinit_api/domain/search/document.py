"""Pin document shape and Elasticsearch index mappings for searchable pins."""

INDEX_MAPPINGS = {
    "properties": {
        "unique_id": {"type": "keyword"},
        "title": {"type": "text", "analyzer": "english"},
        "description": {"type": "text", "analyzer": "english"},
        # Analyzed with the (non-stemming) standard analyzer and made aggregatable
        # via fielddata, so suggestions can run a terms aggregation over word tokens.
        "suggest_text": {"type": "text", "analyzer": "standard", "fielddata": True},
        "image_url": {"type": "keyword", "index": False},
        "image_width": {"type": "integer", "index": False},
        "image_height": {"type": "integer", "index": False},
        "created_at": {"type": "date"},
        "author": {
            "type": "object",
            "properties": {
                "username": {"type": "keyword"},
                "display_name": {"type": "keyword"},
                "initial": {"type": "keyword"},
                "profile_picture_url": {"type": "keyword", "index": False},
            },
        },
    }
}


def build_pin_document(pin):
    return {
        "unique_id": str(pin.unique_id),
        "title": pin.title,
        "image_url": pin.image_url,
        "image_width": pin.image_width,
        "image_height": pin.image_height,
        "description": pin.description,
        # Combined title + description for word-level autocomplete suggestions.
        "suggest_text": f"{pin.title} {pin.description}",
        "created_at": pin.created_at.isoformat() if pin.created_at else None,
        "author": {
            "username": pin.author.username,
            "display_name": pin.author.display_name,
            "initial": pin.author.initial,
            "profile_picture_url": pin.author.profile_picture_url,
        },
    }


def pin_result_from_source(source):
    """Map an indexed pin document to the search-hit read shape."""
    return {
        "unique_id": source["unique_id"],
        "title": source["title"],
        "image_url": source["image_url"],
        "image_width": source["image_width"],
        "image_height": source["image_height"],
        "author": source["author"],
    }
