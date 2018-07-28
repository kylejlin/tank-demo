import { System } from 'becs';

const MAP_SIZE = 100;
const MIN_Y = -100;

const boundarySystem = new System(
  [
    ['Position', 'Shootable']
  ],
  ([entities], scene) => {
    const dt = scene.globals.deltaTime;
    const dts = dt * 1e-3;

    for (const ent of entities) {
      if (
        ent.Position.x > MAP_SIZE / 2
        || ent.Position.x < MAP_SIZE / -2
        || ent.Position.z > MAP_SIZE / 2
        || ent.Position.z < MAP_SIZE / -2
      ) {
        ent.Shootable.health = 0;
      }
    }
  }
);

export default boundarySystem;
