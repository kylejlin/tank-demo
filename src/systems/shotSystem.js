import { System, IndexSpec } from 'indexed-ecs';
import { Raycaster } from 'three';

const shotSystem = new System(
  (escene, [{ entities: shotEntities }, { entities: hittableEntities }]) => {
    const dt = escene.globals.deltaTime;
    const dts = dt * 1e-3;

    for (const shotEnt of shotEntities) {
      let closestDistance = Infinity;
      let closestEnt = null;

      for (const hittableEnt of hittableEntities) {
        const raycaster = new Raycaster();
        raycaster.set(
          shotEnt.Shot.origin,
          shotEnt.Shot.direction
        );
        const hits = raycaster.intersectObject(hittableEnt.Hittable.scene_, true);
        for (const hit of hits) {
          if (hit.distance < closestDistance) {
            closestDistance = hit.distance;
            closestEnt = hittableEnt;
          }
        }
      }

      if (closestEnt !== null) {
        closestEnt.Hittable.health -= shotEnt.Shot.damage;
      }

      escene.removeEntity(shotEnt);
    }
  },
  [
    new IndexSpec(['Shot']),
    new IndexSpec(['Hittable'])
  ]
);

export default shotSystem;
