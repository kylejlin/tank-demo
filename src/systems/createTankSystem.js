import { System, IndexSpec, Entity } from 'indexed-ecs';
import GLTFLoader from 'three-gltf-loader';
import { AnimationClip, AnimationMixer, Vector3 } from 'three';
import { Howl } from 'howler';
// Modified from http://soundbible.com/2021-Atchisson-Assault-Shotgun.html
import exposionSrc from '../audio/longer-explosion.wav';

const explosionSound = new Howl({
  src: exposionSrc,
  volume: 5.5,
});

let tankScene = null;
let tankAnimations = null;
(new GLTFLoader()).load('./models/tank2.glb', (gltf) => {
  tankScene = gltf.scene;
  tankAnimations = gltf.animations;
});

const createTankSystem = (scene) => {
  return new System(
    (escene, [{ entities }]) => {
      const dt = escene.globals.deltaTime;
      const dts = dt * 1e-3;

      if (tankScene === null) {
        return;
      }

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

        if (ent.Tank.health <= 0) {
          scene.remove(ent.Tank.scene_);
          escene.removeEntity(ent);

          const explosion = new Entity();
          explosion.addComponent({
            name: 'Explosion',
            position: new Vector3(ent.Tank.x, ent.Tank.y, ent.Tank.z),
          	positionRandomness: 1,
          	velocity: new Vector3(0, 0.1, 0),
          	velocityRandomness: .9,
          	color: 0xff8500,
          	colorRandomness: .1,
          	turbulence: 0.0,
          	lifetime: 0.8,
          	size: 10,
          	sizeRandomness: 3,
            spawnRate: 25000,
            emissionDuration: 0.2,
          });
          escene.addEntity(explosion);

          explosionSound.play();
          continue;
        }

        ent.Tank.scene_.position.set(ent.Tank.x, ent.Tank.y, ent.Tank.z);
        ent.Tank.scene_.rotation.set(0, ent.Tank.rotY, 0);
      }
    },
    [
      new IndexSpec(['Tank'])
    ]
  )
};

export default createTankSystem;
