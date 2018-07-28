import { System } from 'becs';
import GPUParticleSystem from '../GPUParticleSystem';
import { Vector3 } from 'three';

const createTankMuzzleFlashSystem = (threeScene) => {
  return new System(
    [
      ['TankMuzzleFlash'],
      ['PlayerTank', 'Tank', 'Position']
    ],
    ([entities, tankEntities], scene) => {
      const dt = scene.globals.deltaTime;
      const dts = dt * 1e-3;

      if (!scene.globals.tankMuzzleFlashParticleSystem) {
        scene.globals.tankMuzzleFlashParticleSystem = new GPUParticleSystem();
        scene.globals.tankMuzzleFlashParticleSystemTimeInSeconds = 0;
        threeScene.add(scene.globals.tankMuzzleFlashParticleSystem);
      }

      scene.globals.tankMuzzleFlashParticleSystemTimeInSeconds += dts;
      scene.globals.tankMuzzleFlashParticleSystem.update(scene.globals.tankMuzzleFlashParticleSystemTimeInSeconds);

      const [tankEnt] = tankEntities;
      if (!tankEnt) {
        // Player is dead.
        return;
      }

      scene.globals.tankMuzzleFlashParticleSystem.position.copy(
        new Vector3(tankEnt.Position.x + Math.sin(tankEnt.Rotation.y) * 2.3, tankEnt.Position.y + 1.6, tankEnt.Position.z + Math.cos(tankEnt.Rotation.y) * 2.3)
      );
      scene.globals.tankMuzzleFlashParticleSystem.rotation.y = tankEnt.Rotation.y;

      for (const ent of entities) {
        if (ent.TankMuzzleFlash.emissionDuration > 0) {
          ent.TankMuzzleFlash.emissionDuration -= dts;
          for (let i = 0; i < ent.TankMuzzleFlash.spawnRate * dts; i++) {
            scene.globals.tankMuzzleFlashParticleSystem.spawnParticle(ent.TankMuzzleFlash);
          }
        }
      }
    }
  )
};

export default createTankMuzzleFlashSystem;
