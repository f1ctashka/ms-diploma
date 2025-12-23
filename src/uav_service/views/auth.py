from fastapi import APIRouter, Depends, HTTPException
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from starlette import status

from uav_service.auth.constants import ALGORITHM
from uav_service.auth.jwt import create_access_token, create_refresh_token
from uav_service.auth.security import verify_password
from uav_service.db import User
from uav_service.db.dependencies import get_db
from uav_service.db.logic import create_user
from uav_service.settings import settings
from uav_service.views.models import LoginRequest, RefreshRequest, TokenPair

router = APIRouter(prefix="/auth")


@router.post("/login", response_model=TokenPair)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenPair)
def refresh_token(payload: RefreshRequest):
    try:
        decoded = jwt.decode(
            payload.refresh_token, settings.misc.secret_key, algorithms=[ALGORITHM]
        )

        if decoded.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        user_id = int(decoded["sub"])

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    return TokenPair(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


@router.post("/register", response_model=TokenPair)
def register(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    user = create_user(
        db,
        email=payload.email,
        password=payload.password,
    )
    if not user:
        raise HTTPException(status_code=400, detail="User already exists")
    return TokenPair(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )
