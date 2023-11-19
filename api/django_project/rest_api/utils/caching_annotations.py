from typing import Type

from django.core.cache import cache
from pydantic import BaseModel


def create_cache(
    object_name, pydantic_model: Type[BaseModel], expiration_time=60 * 60 * 24
):
    def decorator(func):
        def wrapper(*args, **kwargs) -> pydantic_model:
            object_id = kwargs.get("id")
            disabled_cache = kwargs.get("disabled_cache", False)
            key_name = object_name + "_" + str(object_id)
            cached_result = cache.get(key_name)
            if cached_result and not disabled_cache:
                return pydantic_model.parse_raw(cached_result)
            result: BaseModel = func(*args, **kwargs)
            cache.set(key_name, result.json(), expiration_time)
            return result

        return wrapper

    return decorator


def invalidate_cache(object_name):
    def decorator(func):
        def wrapper(*args, **kwargs):
            object_id = kwargs.get("id")
            key_name = object_name + "_" + str(object_id)
            result = func(*args, **kwargs)
            cache.delete(key_name)
            return result

        return wrapper

    return decorator
