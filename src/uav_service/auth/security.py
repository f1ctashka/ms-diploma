from passlib.context import CryptContext
import hashlib

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)

def _prehash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def hash_password(password: str) -> str:
    return pwd_context.hash(_prehash_password(password))

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(_prehash_password(password), hashed)
