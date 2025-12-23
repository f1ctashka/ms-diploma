from typing import Iterable, Dict, List
from datetime import datetime

from sqlalchemy.orm import Session

from uav_service.db.tables import (
    User,
    Configuration,
    Simulation,
    Drone,
    Trajectory,
)


def create_configuration(
    session: Session,
    *,
    user_id: int,
    base: Dict[str, float],
    user: Dict[str, float],
    algorithm_params: Dict[str, float],
) -> Configuration:
    """
    Persist input state of the system (configuration).
    """

    config = Configuration(
        user_id=user_id,
        base_x=base["x"],
        base_y=base["y"],
        base_z=base["z"],
        user_x=user["x"],
        user_y=user["y"],
        user_z=user["z"],
        max_distance=algorithm_params["max_distance"],
        step_size=algorithm_params["step_size"],
    )

    session.add(config)
    session.flush()  # отримуємо config.id

    return config


def create_drones(
    session: Session,
    *,
    configuration_id: int,
    drones: Iterable[Dict],
) -> dict[str, int]:
    """
    Persist initial drone states.
    """

    label_to_id: dict[str, int] = {}

    for drone in drones:
        entity = Drone(
            configuration_id=configuration_id,
            label=drone["label"],
            init_x=drone["coordinates"]["x"],
            init_y=drone["coordinates"]["y"],
            init_z=drone["coordinates"]["z"],
            init_yaw=drone["coordinates"]["yaw"],
        )
        session.add(entity)
        session.flush()
        label_to_id[entity.label] = entity.id

    return label_to_id


def start_simulation(
    session: Session,
    *,
    configuration_id: int,
) -> Simulation:
    """
    Create simulation record.
    """

    simulation = Simulation(
        configuration_id=configuration_id,
        started_at=datetime.now(),
    )

    session.add(simulation)
    session.flush()

    return simulation


def save_trajectories(
    session: Session,
    *,
    simulation_id: int,
    trajectories: dict[str, list[dict]],
    label_to_id: dict[str, int],
):
    """
    Persist trajectories using drone labels.
    """

    for label, steps in trajectories.items():
        drone_id = label_to_id.get(label)

        if drone_id is None:
            raise ValueError(f"Unknown drone label: {label}")

        for step_index, step in enumerate(steps):
            session.add(
                Trajectory(
                    simulation_id=simulation_id,
                    drone_id=drone_id,
                    step_index=step_index,
                    x=step["x"],
                    y=step["y"],
                    z=step["z"],
                    yaw=step["yaw"],
                )
            )


def finish_simulation(
    session: Session,
    *,
    simulation: Simulation,
    success: bool = True,
):
    simulation.finished_at = datetime.now()
    simulation.success = success


def persist_full_simulation(
    session: Session,
    *,
    user_id: int,
    base: Dict[str, float],
    user: Dict[str, float],
    algorithm_params: Dict[str, float],
    drones: Iterable[Dict],
    trajectories: Dict[int, List[Dict]],
) -> int:
    """
    Atomic persistence of full simulation lifecycle.
    """

    try:
        config = create_configuration(
            session,
            user_id=user_id,
            base=base,
            user=user,
            algorithm_params=algorithm_params,
        )

        drone_label_to_id = create_drones(
            session,
            configuration_id=config.id,
            drones=drones,
        )

        simulation = start_simulation(
            session,
            configuration_id=config.id,
        )

        save_trajectories(
            session,
            simulation_id=simulation.id,
            trajectories=trajectories,
            label_to_id=drone_label_to_id,
        )

        finish_simulation(session, simulation=simulation, success=True)

        session.commit()
        return simulation.id

    except Exception:
        session.rollback()
        raise
