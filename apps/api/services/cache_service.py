import os
import json
import hashlib
from typing import Optional, Any, Dict
import redis
from apps.api.config import settings

class RedisCacheService:
    """
    Redis 7 Cache Service for background jobs, rate limits,
    and review result caching keyed by SHA-256(content_text + brand_pack_version).
    """
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.client = None
        try:
            self.client = redis.from_url(self.redis_url, decode_responses=True)
            self.client.ping()
            self.is_connected = True
        except Exception:
            self.is_connected = False
            # Memory cache fallback if local redis server is not currently running
            self._local_cache: Dict[str, str] = {}

    def get_review_cache(self, content_text: str, brand_pack_version: int) -> Optional[Dict[str, Any]]:
        key = f"review:{hashlib.sha256((content_text + str(brand_pack_version)).encode()).hexdigest()}"
        if self.is_connected and self.client:
            try:
                val = self.client.get(key)
                if val:
                    return json.loads(val)
            except Exception:
                pass
        elif key in getattr(self, "_local_cache", {}):
            return json.loads(self._local_cache[key])
        return None

    def set_review_cache(self, content_text: str, brand_pack_version: int, result: Dict[str, Any], ttl_seconds: int = 3600):
        key = f"review:{hashlib.sha256((content_text + str(brand_pack_version)).encode()).hexdigest()}"
        payload = json.dumps(result, default=str)
        if self.is_connected and self.client:
            try:
                self.client.setex(key, ttl_seconds, payload)
            except Exception:
                pass
        else:
            if not hasattr(self, "_local_cache"):
                self._local_cache = {}
            self._local_cache[key] = payload

cache_service = RedisCacheService()
