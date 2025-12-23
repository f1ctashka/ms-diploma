from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def get_engine(db_url: str):
    return create_engine(
        db_url,
        echo=False,
        future=True,
    )


def get_session_factory(engine):
    return sessionmaker(
        bind=engine,
        autoflush=False,
        autocommit=False,
        future=True,
    )
