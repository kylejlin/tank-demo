import { System } from 'becs';
import { Howl } from 'howler';
// http://soundbible.com/1998-Gun-Fire.html
import rifleSrc from '../audio/rifle.mp3';

const rifleSound = new Howl({
  src: rifleSrc,
});

// const setActiveAnimation = (ent, active) => {
//   const actionKeys = ['runAction', 'aimAction', 'riseAction', 'fireAction'];
//   for (const key of actionKeys) {
//     ent.Soldier[key].weight = key === active
//       ? 1
//       : 0;
//   }
// };

const soldierSystem = new System(
  [
    ['Soldier', 'Position', 'Rotation'],
    ['Tank', 'PlayerTank']
  ],
  ([entities, tankEntities], scene) => {
    const dt = scene.globals.deltaTime;
    const dts = dt * 1e-3;

    const [tankEnt] = tankEntities;
    if (!tankEnt) {
      // Player dead
      return;
    }

    for (const ent of entities) {
      ent.Soldier.mixer.update(dt * 1e-3);
      ent.Soldier.currentFireCooldown -= dt;

      const dx = tankEnt.Position.x - ent.Position.x;
      const dz = tankEnt.Position.z - ent.Position.z;
      const dist = Math.hypot(dx, dz);

      if (ent.Soldier.state === 'CROUCHED') {
        if (dist < ent.Soldier.firingRange) {
          if (ent.Soldier.currentFireCooldown <= 0) {
            ent.Soldier.currentFireCooldown = ent.Soldier.fireCooldown;
            ent.Soldier.state = 'FIRING';
            ent.Soldier.fireAction.weight = 1;
            ent.Soldier.runAction.weight = 0;
            ent.Soldier.aimAction.weight = 0;
            ent.Soldier.riseAction.weight = 0;
            ent.Soldier.fireAction.reset().play();
          }
        } else if (dist < ent.Soldier.seeingRange) {
          ent.Soldier.state = 'RISING';
          ent.Soldier.riseAction.weight = 1;
          ent.Soldier.runAction.weight = 0;
          ent.Soldier.aimAction.weight = 0;
          ent.Soldier.fireAction.weight = 0;
          ent.Soldier.riseAction.reset().play();
        }
      } else if (ent.Soldier.state === 'RUNNING') {
        ent.Soldier.runAction.play();
        const theta = Math.atan2(dx, dz);
        ent.Rotation.y = theta;

        if (dist > ent.Soldier.firingRange) {
          const [normalizedX, normalizedZ] = [dx / dist, dz / dist];
          ent.Position.x += normalizedX * dt * ent.Soldier.moveSpeed;
          ent.Position.z += normalizedZ * dt * ent.Soldier.moveSpeed;
        } else {
          ent.Soldier.state = 'AIMING';
          ent.Soldier.aimAction.weight = 1;
          ent.Soldier.runAction.weight = 0;
          ent.Soldier.riseAction.weight = 0;
          ent.Soldier.fireAction.weight = 0;
          ent.Soldier.aimAction.reset().play();
        }
      } else if (ent.Soldier.state === 'AIMING') {
        if (ent.Soldier.aimAction.paused) {
          ent.Soldier.state = 'CROUCHED';
        }
      } else if (ent.Soldier.state === 'RISING') {
        if (ent.Soldier.riseAction.paused) {
          ent.Soldier.state = 'RUNNING';
          ent.Soldier.runAction.weight = 1;
          ent.Soldier.aimAction.weight = 0;
          ent.Soldier.riseAction.weight = 0;
          ent.Soldier.fireAction.weight = 0;
        }
      } else if (ent.Soldier.state === 'FIRING') {
        if (ent.Soldier.fireAction.paused) {
          ent.Soldier.state = 'CROUCHED';
        }
      }
    }
  }
);

export default soldierSystem;
