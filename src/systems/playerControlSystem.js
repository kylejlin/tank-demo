import { System, IndexSpec, Entity } from 'indexed-ecs';
import { Vector3, Euler, AnimationClip } from 'three';
import { Howl } from 'howler';
// http://soundbible.com/1919-Shotgun-Blast.html
import tankFireSrc from '../audio/tank-fire.mp3';

const TAU = 2 * Math.PI;

const tankFireSound = new Howl({
  src: tankFireSrc,
});

const keys = {};
const Codes = {
  38: 'UP',
  40: 'DOWN',
  37: 'LEFT',
  39: 'RIGHT',
  87: 'W',
  65: 'A',
  83: 'S',
  68: 'D',
  81: 'Q',
  69: 'E',
  32: 'SPACE',
};
window.addEventListener('keydown', (e) => {
  const keyName = Codes[e.keyCode];
  if (keyName === undefined) {
    return;
  }
  keys[keyName] = true;
});
window.addEventListener('keyup', (e) => {
  const keyName = Codes[e.keyCode];
  if (keyName === undefined) {
    return;
  }
  keys[keyName] = false;
});

const playerControlSystem = new System(
  (escene, [{ entities }]) => {
    const dt = escene.globals.deltaTime;
    const dts = dt * 1e-3;

    for (const ent of entities) {
      if (!('currentFireCooldown_' in ent.Tank)) {
        ent.Tank.currentFireCooldown_ = 0;
      }

      ent.Tank.currentFireCooldown_ -= dt;

      if (keys.LEFT) {
        ent.Tank.rotY += ent.Tank.turnSpeed * dt;
        while (ent.Tank.rotY > TAU) {
          ent.Tank.rotY -= TAU;
        }
      }
      if (keys.RIGHT) {
        ent.Tank.rotY -= ent.Tank.turnSpeed * dt;
        while (ent.Tank.rotY < 0) {
          ent.Tank.rotY += TAU;
        }
      }
      if (keys.UP) {
        ent.Position.x += Math.sin(ent.Tank.rotY) * ent.Tank.moveSpeed * dt;
        ent.Position.z += Math.cos(ent.Tank.rotY) * ent.Tank.moveSpeed * dt;
      }
      if (keys.DOWN) {
        ent.Position.x -= Math.sin(ent.Tank.rotY) * ent.Tank.moveSpeed * dt;
        ent.Position.z -= Math.cos(ent.Tank.rotY) * ent.Tank.moveSpeed * dt;
      }

      if (keys.SPACE && ent.Tank.currentFireCooldown_ <= 0) {
        ent.Tank.currentFireCooldown_ = ent.Tank.fireCooldown;

        const { x, y, z } = ent.Position;
        const { rotY, damage } = ent.Tank;
        const shot = new Entity();
        shot.addComponent({
          name: 'Shot',
          shooter: ent,
          origin: new Vector3(x + Math.sin(rotY) * 2.3, y + 1.6, z + Math.cos(rotY) * 2.3),
          direction: (new Vector3(0, 0, 1)).applyEuler(new Euler(0, rotY, 0)),
          damage,
        });
        escene.addEntity(shot);

        tankFireSound.play();

        ent.Tank.gunMixer_.time = 0;
        ent.Tank.turretMixer_.time = 0;

        const explosion = new Entity();
        explosion.addComponent({
          name: 'Explosion',
          position: new Vector3(x + Math.sin(rotY) * 2.3, y + 1.6, z + Math.cos(rotY) * 2.3),
        	positionRandomness: .3,
        	velocity: (new Vector3(0, 0, 1.45)).applyEuler(new Euler(0, rotY, 0)),
        	velocityRandomness: .0,
        	color: 0xaa4400,
        	colorRandomness: .1,
        	turbulence: .0,
        	lifetime: 0.2,
        	size: 5,
        	sizeRandomness: 1,
          spawnRate: 2500,
          emissionDuration: 0.2,
        });
        escene.addEntity(explosion);
      }

      if (ent.Tank.currentFireCooldown_ > ent.Tank.fireCooldown - 0.375e3/*AnimationClip.findByName(tankAnimations, 'GunAction').duration * 1e3*/) {
        ent.Tank.gunMixer_.update(dts);
        ent.Tank.turretMixer_.update(dts);
      }
    }
  },
  [
    new IndexSpec(['Tank', 'PlayerTank'])
  ]
);

export default playerControlSystem;
