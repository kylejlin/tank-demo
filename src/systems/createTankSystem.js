import { System, IndexSpec, Entity } from 'indexed-ecs';
import assets from '../assets';
import { AnimationClip, AnimationMixer, Vector3 } from 'three';

const createTankSystem = (scene) => {
  const { tankScene } = assets;
  const { tankAnimations } = assets;

  return new System(
    (escene, [{ entities }]) => {
      const dt = escene.globals.deltaTime;
      const dts = dt * 1e-3;

      for (const ent of entities) {
        if (!ent.Tank.scene_) {
          const clone = tankScene.clone();
          ent.Tank.scene_ = clone;
          scene.add(clone);

          const gun = clone.children.find(m => m.name === 'Gun');
          ent.Tank.gunMixer_ = new AnimationMixer(gun);
          const turret = clone.children.find(m => m.name === 'Turret');
          ent.Tank.turretMixer_ = new AnimationMixer(turret);
          const gunClip = AnimationClip.findByName(tankAnimations, 'GunAction');
          ent.Tank.gunAction_ = ent.Tank.gunMixer_.clipAction(gunClip);
          ent.Tank.gunAction_.play();
          const turretClip = AnimationClip.findByName(tankAnimations, 'TurretAction');
          ent.Tank.turretAction_ = ent.Tank.turretMixer_.clipAction(turretClip);
          ent.Tank.turretAction_.play();
        }

        if (!ent.Shootable) {
          ent.addComponent({
            name: 'Shootable',
            maxHealth: ent.Tank.maxHealth,
            health: ent.Tank.maxHealth,
            scene_: ent.Tank.scene_,
          });
        }

        ent.Tank.scene_.position.set(ent.Position.x, ent.Position.y, ent.Position.z);
        ent.Tank.scene_.rotation.set(0, ent.Tank.rotY, 0);
      }
    },
    [
      new IndexSpec(['Tank', 'Position'])
    ]
  )
};

export default createTankSystem;
