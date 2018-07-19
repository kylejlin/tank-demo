import { System, IndexSpec } from 'indexed-ecs';
import { Raycaster } from 'three';

const shotSystem = new System(
  (escene, [{ entities: shotEntities }, { entities: shootableEntities }]) => {
    const dt = escene.globals.deltaTime;
    const dts = dt * 1e-3;

    for (const shotEnt of shotEntities) {
      let closestDistance = Infinity;
      let closestEnt = null;

      for (const shootableEnt of shootableEntities) {
        const raycaster = new Raycaster();
        raycaster.set(
          shotEnt.Shot.origin,
          shotEnt.Shot.direction
        );
        const hits = raycaster.intersectObject(shootableEnt.Shootable.scene_, true);
        for (const hit of hits) {
          if (hit.distance < closestDistance) {
            closestDistance = hit.distance;
            closestEnt = shootableEnt;
          }
        }
      }

      if (closestEnt !== null) {
        closestEnt.Shootable.health -= shotEnt.Shot.damage;
      }

      escene.removeEntity(shotEnt);
    }
  },
  [
    new IndexSpec(['Shot']),
    new IndexSpec(['Shootable'])
  ]
);

export default shotSystem;
