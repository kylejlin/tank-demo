import { System } from 'becs';
import { Vector3, Euler, AnimationClip } from 'three';
import { Howl } from 'howler';
// Modified from http://soundbible.com/2021-Atchisson-Assault-Shotgun.html
import explosionSrc from '../audio/longer-explosion.wav';

const TAU = 2 * Math.PI;

const explosionSound = new Howl({
  src: explosionSrc,
  volume: 5.5,
});

const shootableSystem = new System(
  [
    ['Shootable', 'Position', 'ThreeScene']
  ],
  ([entities], scene) => {
    const dt = scene.globals.deltaTime;
    const dts = dt * 1e-3;

    for (const ent of entities) {
      if (ent.Shootable.health <= 0) {
        const explosion = {
          Explosion: {
            position: new Vector3(ent.Position.x, ent.Position.y, ent.Position.z),
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
          },
        };
        scene.addEntity(explosion);

        explosionSound.play();

        if (ent.LootDropper && ent.LootDropper.drop !== null) {
          scene.addEntity(ent.LootDropper.drop);
        }

        scene.removeEntity(ent);
      }
    }
  }
);

export default shootableSystem;
