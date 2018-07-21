import { System, IndexSpec, Entity } from 'indexed-ecs';

const MAP_SIZE = 100;
const MIN_Y = -100;

const boundarySystem = new System(
  (escene, [{ entities }]) => {
    const dt = escene.globals.deltaTime;
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
  },
  [
    new IndexSpec(['Position', 'Shootable'])
  ]
);

export default boundarySystem;
