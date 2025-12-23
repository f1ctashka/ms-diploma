from pydantic import BaseModel

from uav_service.logic.models import Coordinates, Coordinates3D, Drone


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UavComputeRequest(BaseModel):
    user: Coordinates
    base: Coordinates3D | None = None
    initial_drone_positions: list[Drone] | None = None
    step_size: float = 3.0


class UavComputeResponse(BaseModel):
    base_coordinates: Coordinates3D
    user_coordinates: Coordinates
    drone_positions: dict[str, list[Coordinates3D]]
    simulation_id: int
