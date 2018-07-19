import { System, IndexSpec } from 'indexed-ecs';
import { Raycaster } from 'three';

const shotSystem = new System(
  (escene, [{ entities: shotEntities }, { entities: donutEntities }, { entities: pietinEntities }]) => {
    const dt = escene.globals.deltaTime;
    const dts = dt * 1e-3;

    for (const shotEnt of shotEntities) {
      for (const donutEnt of donutEntities) {
        const raycaster = new Raycaster();
        raycaster.set(
          shotEnt.Shot.origin,
          shotEnt.Shot.direction
        );
        const hits = raycaster.intersectObject(donutEnt.Donut.scene_, true);
        if (hits.length > 0) {
          donutEnt.Donut.health -= shotEnt.Shot.damage;
        }
      }
      for (const pietinEnt of pietinEntities) {
        const raycaster = new Raycaster();
        raycaster.set(
          shotEnt.Shot.origin,
          shotEnt.Shot.direction
        );
        const hits = raycaster.intersectObject(pietinEnt.Pietin.scene_, true);
        if (hits.length > 0) {
          pietinEnt.Pietin.health -= shotEnt.Shot.damage;
        }
      }
      escene.removeEntity(shotEnt);
    }
  },
  [
    new IndexSpec(['Shot']),
    new IndexSpec(['Donut']),
    new IndexSpec(['Pietin'])
  ]
);

export default shotSystem;
