import { System, IndexSpec } from 'indexed-ecs';
import GPUParticleSystem from '../GPUParticleSystem';

const createExplosionSystem = (scene) => {
  return new System(
    (escene, [{ entities }]) => {
      const dt = escene.globals.deltaTime;
      const dts = dt * 1e-3;

      if (!escene.globals.particleSystem) {
        escene.globals.particleSystem = new GPUParticleSystem();
        escene.globals.particleSystemTimeInSeconds = 0;
        scene.add(escene.globals.particleSystem);
      }

      escene.globals.particleSystemTimeInSeconds += dts;
      escene.globals.particleSystem.update(escene.globals.particleSystemTimeInSeconds);

      for (const ent of entities) {
        if (ent.Explosion.emissionDuration > 0) {
          ent.Explosion.emissionDuration -= dts;
          for (let i = 0; i < ent.Explosion.spawnRate * dts; i++) {
            escene.globals.particleSystem.spawnParticle(ent.Explosion);
          }
        }
      }
    },
    [
      new IndexSpec(['Explosion'])
    ]
  )
};

export default createExplosionSystem;
