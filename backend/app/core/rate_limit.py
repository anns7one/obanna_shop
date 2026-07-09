from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import get_settings

settings = get_settings()

# key_func=get_remote_address: limits are counted per client IP.
# storage_uri points at Redis so limits are shared correctly even if the
# backend later runs as multiple replicas instead of a single process.
limiter = Limiter(key_func=get_remote_address, storage_uri=settings.redis_url)
