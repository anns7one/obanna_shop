from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base for every request/response schema. Fields are written in
    idiomatic snake_case Python, but serialize/deserialize as camelCase on
    the wire (e.g. compare_at_price <-> compareAtPrice), matching the
    frontend's lib/types.ts exactly. from_attributes=True lets a schema be
    built directly from a SQLAlchemy model instance."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
