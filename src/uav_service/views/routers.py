from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from uav_service.auth.dependencies import get_current_user
from uav_service.db import User
from uav_service.db.dependencies import get_db
from uav_service.db.logic import persist_full_simulation
from uav_service.logic.compute import compute_drone_bridge_positions
from uav_service.logic.models import Coordinates3D, Drone
from uav_service.views.models import UavComputeRequest, UavComputeResponse

router = APIRouter(prefix="/uav")


@router.post("/compute/", status_code=200)
async def start(
    *,
    request_data: UavComputeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UavComputeResponse:
    base_coordinates = request_data.base or Coordinates3D(x=0, y=0, z=0)
    drones = request_data.initial_drone_positions or [
        Drone(label="UAV_1", coordinates=Coordinates3D(x=10, y=5, z=10)),
        Drone(label="UAV_2", coordinates=Coordinates3D(x=20, y=10, z=12)),
        Drone(label="UAV_3", coordinates=Coordinates3D(x=30, y=15, z=15)),
        Drone(label="UAV_4", coordinates=Coordinates3D(x=40, y=20, z=17)),
        Drone(label="UAV_5", coordinates=Coordinates3D(x=50, y=25, z=18)),
    ]

    try:
        drone_positions = compute_drone_bridge_positions(
            user_coordinates=request_data.user,
            base_coordinates=base_coordinates,
            drones=drones,
            step_size=request_data.step_size,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    simulation_id = persist_full_simulation(
        session=db,
        user_id=user.id,
        base=base_coordinates.model_dump(),
        user={**request_data.user.model_dump(), "z": 0},
        algorithm_params={"max_distance": 10, "step_size": request_data.step_size},
        drones=[d.model_dump() for d in drones],
        trajectories={
            k: [i.model_dump() for i in v] for k, v in drone_positions.items()
        },
    )

    return UavComputeResponse(
        base_coordinates=base_coordinates,
        user_coordinates=request_data.user,
        drone_positions=drone_positions,
        simulation_id=simulation_id,
    )
