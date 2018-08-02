import { System } from 'becs';
import { Vector3, Euler } from 'three';
import { Howl } from 'howler';
// http://soundbible.com/1998-Gun-Fire.html
import rifleSrc from '../audio/rifle.mp3';

const rifleSound = new Howl({
  src: rifleSrc,
});

const playFireAnim = (ent) => {
  ent.Soldier.fireAction.weight = 1;
  ent.Soldier.runAction.weight = 0;
  ent.Soldier.aimAction.weight = 0;
  ent.Soldier.riseAction.weight = 0;
  ent.Soldier.fireAction.reset().play();
};

const playRiseAnim = (ent) => {
  ent.Soldier.riseAction.weight = 1;
  ent.Soldier.runAction.weight = 0;
  ent.Soldier.aimAction.weight = 0;
  ent.Soldier.fireAction.weight = 0;
  ent.Soldier.riseAction.reset().play();
};

const playAimAnim = (ent) => {
  ent.Soldier.aimAction.weight = 1;
  ent.Soldier.runAction.weight = 0;
  ent.Soldier.riseAction.weight = 0;
  ent.Soldier.fireAction.weight = 0;
  ent.Soldier.aimAction.reset().play();
};

const playRunAnim = (ent) => {
  ent.Soldier.runAction.weight = 1;
  ent.Soldier.aimAction.weight = 0;
  ent.Soldier.riseAction.weight = 0;
  ent.Soldier.fireAction.weight = 0;
};

const GUN_ANGLE_OFFSET = -0.1;

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
          const theta = Math.atan2(dx, dz) + GUN_ANGLE_OFFSET;
          if (ent.Rotation.y !== theta) {
            ent.Soldier.state = 'RISING';
            playRiseAnim(ent);
          } else {
            if (ent.Soldier.currentFireCooldown <= 0) {
              ent.Soldier.currentFireCooldown = ent.Soldier.fireCooldown;
              ent.Soldier.state = 'FIRING';
              playFireAnim(ent);
              rifleSound.play();
              scene.addEntity({
                Explosion: {
                  position: ent.ThreeScene.scene.position.clone().add(
                    new Vector3(-0.1, 7, 6.3).multiplyScalar(0.5).applyEuler(ent.ThreeScene.scene.rotation)
                  ),
                	positionRandomness: .1,
                	velocity: new Vector3(0, 0, 1.375).applyEuler(new Euler(0, ent.Rotation.y + 0.25, 0)),
                	velocityRandomness: .0,
                	color: 0xaa4400,
                	colorRandomness: .1,
                	turbulence: .0,
                	lifetime: 0.1,
                	size: 3,
                	sizeRandomness: 1,
                  spawnRate: 2500,
                  emissionDuration: 0.05,
                },
              });
              scene.addEntity({
                Explosion: {
                  position: ent.ThreeScene.scene.position.clone().add(
                    new Vector3(-0.1, 7, 6.3).multiplyScalar(0.5).applyEuler(ent.ThreeScene.scene.rotation)
                  ),
                	positionRandomness: .15,
                	velocity: new Vector3(0, 0, 0.25).applyEuler(new Euler(0, ent.Rotation.y + 0.25, 0)),
                	velocityRandomness: .15,
                	color: 0x080808,
                	colorRandomness: .0,
                	turbulence: .0,
                	lifetime: 0.7,
                	size: 3,
                	sizeRandomness: 3,
                  spawnRate: 2500,
                  emissionDuration: 0.1,
                },
              });
              scene.addEntity({
                Explosion: {
                  position: ent.ThreeScene.scene.position.clone().add(
                    new Vector3(-0.1, 7, 6.3).multiplyScalar(0.5).applyEuler(ent.ThreeScene.scene.rotation)
                  ),
                	positionRandomness: .05,
                	velocity: new Vector3(0, 0, 0.5).applyEuler(new Euler(0, ent.Rotation.y + 0.25, 0)),
                	velocityRandomness: .15,
                	color: 0x080808,
                	colorRandomness: .0,
                	turbulence: .0,
                	lifetime: 0.5,
                	size: 3,
                	sizeRandomness: 3,
                  spawnRate: 1250,
                  emissionDuration: 0.1,
                },
              });
              const trueTheta = theta - GUN_ANGLE_OFFSET;
              scene.addEntity({
                Shot: {
                  shooter: ent,
                  origin: new Vector3(ent.Position.x, 1, ent.Position.z),
                  direction: (new Vector3(0, 0, 1)).applyEuler(new Euler(0, trueTheta, 0)),
                  damage: ent.Soldier.damage,
                },
              });
            }
          }
        } else if (dist < ent.Soldier.seeingRange) {
          ent.Soldier.state = 'RISING';
          playRiseAnim(ent);
        }
      } else if (ent.Soldier.state === 'RUNNING') {
        ent.Soldier.runAction.play();
        const theta = Math.atan2(dx, dz) + GUN_ANGLE_OFFSET;
        ent.Rotation.y = theta;

        if (dist > ent.Soldier.firingRange) {
          const [normalizedX, normalizedZ] = [dx / dist, dz / dist];
          ent.Position.x += normalizedX * dt * ent.Soldier.moveSpeed;
          ent.Position.z += normalizedZ * dt * ent.Soldier.moveSpeed;
        } else {
          ent.Soldier.state = 'AIMING';
          playAimAnim(ent);
        }
      } else if (ent.Soldier.state === 'AIMING') {
        if (ent.Soldier.aimAction.paused) {
          ent.Soldier.state = 'CROUCHED';
        }
      } else if (ent.Soldier.state === 'RISING') {
        if (ent.Soldier.riseAction.paused) {
          ent.Soldier.state = 'RUNNING';
          playRunAnim(ent);
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
