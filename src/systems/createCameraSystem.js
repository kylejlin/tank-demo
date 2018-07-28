import { System } from 'becs';
import { Vector3 } from 'three';

const createCameraSystem = (camera) => {
  return new System(
    [
      ['PlayerTank', 'Tank', 'Position']
    ],
    ([entities], scene) => {
      const dt = scene.globals.deltaTime;
      const dts = dt * 1e-3;

      const [ent] = entities;

      if (!ent) {
        // Player dead
        return;
      }

      camera.position.set(ent.Position.x + 25, ent.Position.y + 25, ent.Position.z + 25);
      camera.lookAt(new Vector3(ent.Position.x, ent.Position.y, ent.Position.z));
    }
  );
};

export default createCameraSystem;
