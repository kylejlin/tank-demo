import { System, IndexSpec } from 'indexed-ecs';
import GPUParticleSystem from '../GPUParticleSystem';
import { Vector3 } from 'three';

const createTankMuzzleFlashSystem = (scene) => {
  return new System(
    (escene, [{ entities }, { entities: tankEntities }]) => {
      const dt = escene.globals.deltaTime;
      const dts = dt * 1e-3;

      if (!escene.globals.tankMuzzleFlashParticleSystem) {
        escene.globals.tankMuzzleFlashParticleSystem = new GPUParticleSystem();
        escene.globals.tankMuzzleFlashParticleSystemTimeInSeconds = 0;
        scene.add(escene.globals.tankMuzzleFlashParticleSystem);
      }

      escene.globals.tankMuzzleFlashParticleSystemTimeInSeconds += dts;
      escene.globals.tankMuzzleFlashParticleSystem.update(escene.globals.tankMuzzleFlashParticleSystemTimeInSeconds);

      const [tankEnt] = tankEntities;
      if (!tankEnt) {
        // Player is dead.
        return;
      }

      escene.globals.tankMuzzleFlashParticleSystem.position.copy(
        new Vector3(tankEnt.Position.x + Math.sin(tankEnt.Tank.rotY) * 2.3, tankEnt.Position.y + 1.6, tankEnt.Position.z + Math.cos(tankEnt.Tank.rotY) * 2.3)
      );
      escene.globals.tankMuzzleFlashParticleSystem.rotation.y = tankEnt.Tank.rotY;

      for (const ent of entities) {
        if (ent.TankMuzzleFlash.emissionDuration > 0) {
          ent.TankMuzzleFlash.emissionDuration -= dts;
          for (let i = 0; i < ent.TankMuzzleFlash.spawnRate * dts; i++) {
            escene.globals.tankMuzzleFlashParticleSystem.spawnParticle(ent.TankMuzzleFlash);
          }
        }
      }
    },
    [
      new IndexSpec(['TankMuzzleFlash']),
      new IndexSpec(['PlayerTank', 'Tank', 'Position'])
    ]
  )
};

export default createTankMuzzleFlashSystem;
