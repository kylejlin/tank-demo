import { System, IndexSpec, Entity } from 'indexed-ecs';
import GLTFLoader from 'three-gltf-loader';
import { Vector3 } from 'three';
import { Howl } from 'howler';
// Modified from http://soundbible.com/2021-Atchisson-Assault-Shotgun.html
import exposionSrc from '../audio/longer-explosion.wav';

const explosionSound = new Howl({
  src: exposionSrc,
  volume: 5.5,
});

let donutScene = null;
(new GLTFLoader()).load('./models/donut.glb', (gltf) => {
  donutScene = gltf.scene;
  donutScene.position.set(-20, 0, -30);
  donutScene.scale.set(2.5, 2.5, 2.5);
});

const createDonutSystem = (scene) => {
  return new System(
    (escene, [{ entities }]) => {
      const dt = escene.globals.deltaTime;
      const dts = dt * 1e-3;

      if (donutScene === null) {
        return;
      }

      for (const ent of entities) {
        if (!ent.Donut.scene_) {
          const clone = donutScene.clone();
          ent.Donut.scene_ = clone;
          scene.add(clone);
        }

        if (ent.Donut.health <= 0) {
          scene.remove(ent.Donut.scene_);
          escene.removeEntity(ent);

          const explosion = new Entity();
          explosion.addComponent({
            name: 'Explosion',
            position: new Vector3(ent.Donut.x, ent.Donut.y, ent.Donut.z),
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

        ent.Donut.scene_.position.set(ent.Donut.x, ent.Donut.y, ent.Donut.z);
      }
    },
    [
      new IndexSpec(['Donut'])
    ]
  )
};

export default createDonutSystem;
