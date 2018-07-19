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

      camera.position.set(ent.Position.x + 25, ent.Position.y + 25, ent.Position.z + 25);
      camera.lookAt(new Vector3(ent.Position.x, ent.Position.y, ent.Position.z));
    },
    [
      new IndexSpec(['PlayerTank', 'Tank', 'Position'])
    ]
  );
};

export default createCameraSystem;
