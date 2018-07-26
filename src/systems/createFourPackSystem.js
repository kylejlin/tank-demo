import { System, IndexSpec } from 'indexed-ecs';
import assets from '../assets';

const createFourPackSystem = (scene) => {
  const { fourPackScene } = assets;

  return new System(
    (escene, [{ entities }]) => {
      const dt = escene.globals.deltaTime;
      const dts = dt * 1e-3;

      for (const ent of entities) {
        ent.Rotation.y += 0.0015 * dt;
      }
    },
    [
      new IndexSpec(['FourPack', 'Rotation'])
    ]
  )
};

export default createFourPackSystem;
