import { System, IndexSpec } from 'indexed-ecs';
import { Vector3 } from 'three';

const createCameraSystem = (camera) => {
  return new System(
    (escene, [{ entities }]) => {
      const dt = escene.globals.deltaTime;
      const dts = dt * 1e-3;

      const [ent] = entities;

      if (!ent) {
        throw new Error('No player found.');
      }

      camera.position.set(ent.Tank.x + 25, ent.Tank.y + 25, ent.Tank.z + 25);
      camera.lookAt(new Vector3(ent.Tank.x, ent.Tank.y, ent.Tank.z));
    },
    [
      new IndexSpec(['PlayerTank'])
    ]
  );
};

export default createCameraSystem;
