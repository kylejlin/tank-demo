import { System, IndexSpec, Entity } from 'indexed-ecs';
import { Raycaster, Vector3 } from 'three';

const shotSystem = new System(
  (escene, [{ entities: shotEntities }, { entities: shootableEntities }]) => {
    const dt = escene.globals.deltaTime;
    const dts = dt * 1e-3;

    for (const shotEnt of shotEntities) {
      let closestHit = { distance: Infinity };
      let closestEnt = null;

      for (const shootableEnt of shootableEntities) {
        if (shootableEnt === shotEnt.Shot.shooter) {
          continue;
        }

        const raycaster = new Raycaster();
        raycaster.set(
          shotEnt.Shot.origin,
          shotEnt.Shot.direction
        );
        const hits = raycaster.intersectObject(shootableEnt.Shootable.scene_, true);
        for (const hit of hits) {
          if (hit.distance < closestHit.distance) {
            closestHit = hit;
            closestEnt = shootableEnt;
          }
        }
      }

      if (closestEnt !== null) {
        closestEnt.Shootable.health -= shotEnt.Shot.damage;
        const explosion = new Entity();
        explosion.addComponent({
          name: 'Explosion',
          position: closestHit.point.clone(),
          positionRandomness: 1,
          velocity: new Vector3(0, 0.1, 0),
          velocityRandomness: .2,
          color: 0xff8500,
          colorRandomness: .1,
          turbulence: 0.0,
          lifetime: 0.1,
          size: 5,
          sizeRandomness: 3,
          spawnRate: 25000,
          emissionDuration: 0.05,
        });
        escene.addEntity(explosion);
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
