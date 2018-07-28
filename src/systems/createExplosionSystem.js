import { System } from 'becs';
import GPUParticleSystem from '../GPUParticleSystem';

const createExplosionSystem = (threeScene) => {
  return new System(
    [
      ['Explosion']
    ],
    ([entities], scene) => {
      const dt = scene.globals.deltaTime;
      const dts = dt * 1e-3;

      if (!scene.globals.particleSystem) {
        scene.globals.particleSystem = new GPUParticleSystem();
        scene.globals.particleSystemTimeInSeconds = 0;
        threeScene.add(scene.globals.particleSystem);
      }

      scene.globals.particleSystemTimeInSeconds += dts;
      scene.globals.particleSystem.update(scene.globals.particleSystemTimeInSeconds);

      for (const ent of entities) {
        if (ent.Explosion.emissionDuration > 0) {
          ent.Explosion.emissionDuration -= dts;
          for (let i = 0; i < ent.Explosion.spawnRate * dts; i++) {
            scene.globals.particleSystem.spawnParticle(ent.Explosion);
          }
        }
      }
    }
  )
};

export default createExplosionSystem;
