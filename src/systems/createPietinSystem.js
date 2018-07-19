import { System, IndexSpec, Entity } from 'indexed-ecs';
import GLTFLoader from 'three-gltf-loader';
import { Vector3, Group, Object3D } from 'three';
import { Howl } from 'howler';
// Modified from http://soundbible.com/2021-Atchisson-Assault-Shotgun.html
import exposionSrc from '../audio/longer-explosion.wav';

const explosionSound = new Howl({
  src: exposionSrc,
  volume: 5.5,
});

let pietinScene = null;
(new GLTFLoader()).load('./models/pietin-gun.glb', (gltf) => {
  pietinScene = gltf.scene;
  pietinScene.scale.set(1.8, 1.8, 1.8);
});

const createPietinSystem = (scene) => {
  return new System(
    (escene, [{ entities }, { entities: tankEntities }]) => {
      const dt = escene.globals.deltaTime;
      const dts = dt * 1e-3;

      if (pietinScene === null) {
        return;
      }

      const [tankEnt] = tankEntities;
      if (!tankEnt) {
        throw new Error('No player found.');
      }

      for (const ent of entities) {
        if (!ent.Pietin.scene_) {
          const clone = pietinScene.clone();
          const spinnables = new Group();
          clone.children
            .filter(m => ['Pietin', 'GunBody', 'Barrel1', 'Barrel2'].includes(m.name))
            .forEach((mesh) => {
              spinnables.add(mesh);
              clone.remove(mesh);
            });
          clone.add(spinnables);
          scene.add(clone);
          ent.Pietin.scene_ = clone;
          ent.Pietin.spinnables_ = spinnables;
        }

        if (ent.Pietin.health <= 0) {
          scene.remove(ent.Pietin.scene_);
          escene.removeEntity(ent);

          const explosion = new Entity();
          explosion.addComponent({
            name: 'Explosion',
            position: new Vector3(ent.Pietin.x, ent.Pietin.y, ent.Pietin.z),
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

        if (
          (tankEnt.Tank.x - ent.Pietin.x) ** 2
          +
          (tankEnt.Tank.y - ent.Pietin.y) ** 2
          < ent.Pietin.aimingRange ** 2
        ) {
          const temp = new Object3D();
          temp.position.set(ent.Pietin.x, tankEnt.Tank.y, ent.Pietin.z);
          temp.lookAt(new Vector3(tankEnt.Tank.x, tankEnt.Tank.y, tankEnt.Tank.z));
          const newRotY = (temp.rotation.y + (1.5 * Math.PI));
          ent.Pietin.rotY = tankEnt.Tank.z > ent.Pietin.z ? newRotY : -newRotY;
        }

        ent.Pietin.scene_.position.set(ent.Pietin.x, ent.Pietin.y, ent.Pietin.z);
        ent.Pietin.spinnables_.rotation.y = ent.Pietin.rotY;
      }
    },
    [
      new IndexSpec(['Pietin']),
      new IndexSpec(['Tank', 'PlayerTank'])
    ]
  )
};

export default createPietinSystem;
