from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    configurations: Mapped[List["Configuration"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Configuration(Base):
    __tablename__ = "configurations"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Base station coordinates
    base_x: Mapped[float] = mapped_column(Float, nullable=False)
    base_y: Mapped[float] = mapped_column(Float, nullable=False)
    base_z: Mapped[float] = mapped_column(Float, nullable=False)

    # User coordinates
    user_x: Mapped[float] = mapped_column(Float, nullable=False)
    user_y: Mapped[float] = mapped_column(Float, nullable=False)
    user_z: Mapped[float] = mapped_column(Float, nullable=False)

    # Algorithm / bridge parameters
    max_distance: Mapped[float] = mapped_column(Float, nullable=False)
    step_size: Mapped[float] = mapped_column(Float, nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    user: Mapped["User"] = relationship(back_populates="configurations")
    simulations: Mapped[List["Simulation"]] = relationship(
        back_populates="configuration",
        cascade="all, delete-orphan",
    )
    drones: Mapped[List["Drone"]] = relationship(
        back_populates="configuration",
        cascade="all, delete-orphan",
    )


class Simulation(Base):
    __tablename__ = "simulations"

    id: Mapped[int] = mapped_column(primary_key=True)

    configuration_id: Mapped[int] = mapped_column(
        ForeignKey("configurations.id", ondelete="CASCADE"),
        nullable=False,
    )

    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    success: Mapped[Optional[bool]] = mapped_column(Boolean)

    configuration: Mapped["Configuration"] = relationship(back_populates="simulations")
    trajectories: Mapped[List["Trajectory"]] = relationship(
        back_populates="simulation",
        cascade="all, delete-orphan",
    )


class Drone(Base):
    __tablename__ = "drones"

    id: Mapped[int] = mapped_column(primary_key=True)

    configuration_id: Mapped[int] = mapped_column(
        ForeignKey("configurations.id", ondelete="CASCADE"),
        nullable=False,
    )

    label: Mapped[str] = mapped_column(String(64), nullable=False)

    # Initial position
    init_x: Mapped[float] = mapped_column(Float, nullable=False)
    init_y: Mapped[float] = mapped_column(Float, nullable=False)
    init_z: Mapped[float] = mapped_column(Float, nullable=False)

    init_yaw: Mapped[float] = mapped_column(Float, nullable=False)

    configuration: Mapped["Configuration"] = relationship(back_populates="drones")
    trajectories: Mapped[List["Trajectory"]] = relationship(
        back_populates="drone",
        cascade="all, delete-orphan",
    )


class Trajectory(Base):
    __tablename__ = "trajectories"

    id: Mapped[int] = mapped_column(primary_key=True)

    simulation_id: Mapped[int] = mapped_column(
        ForeignKey("simulations.id", ondelete="CASCADE"),
        nullable=False,
    )
    drone_id: Mapped[int] = mapped_column(
        ForeignKey("drones.id", ondelete="CASCADE"),
        nullable=False,
    )

    step_index: Mapped[int] = mapped_column(Integer, nullable=False)

    x: Mapped[float] = mapped_column(Float, nullable=False)
    y: Mapped[float] = mapped_column(Float, nullable=False)
    z: Mapped[float] = mapped_column(Float, nullable=False)

    yaw: Mapped[float] = mapped_column(Float, nullable=False)

    simulation: Mapped["Simulation"] = relationship(back_populates="trajectories")
    drone: Mapped["Drone"] = relationship(back_populates="trajectories")
