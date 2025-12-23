from datetime import datetime, timedelta

from jose import jwt

from uav_service.auth.constants import ALGORITHM
from uav_service.settings import settings


def _create_token(*, subject: str | int, expires_delta: timedelta, token_type: str):
    payload = {
        "sub": str(subject),
        "type": token_type,
        "exp": datetime.now() + expires_delta,
    }
    return jwt.encode(payload, settings.misc.secret_key, algorithm=ALGORITHM)


def create_access_token(user_id: int):
    return _create_token(
        subject=user_id,
        token_type="access",
        expires_delta=timedelta(minutes=30),
    )


def create_refresh_token(user_id: int):
    return _create_token(
        subject=user_id,
        token_type="refresh",
        expires_delta=timedelta(days=7),
    )
