import { System, IndexSpec, Entity } from 'indexed-ecs';
import GLTFLoader from 'three-gltf-loader';
import { Vector3, Euler, Group, Object3D } from 'three';
import { Howl } from 'howler';
// http://soundbible.com/1919-Shotgun-Blast.html
import tankFireSrc from '../audio/tank-fire.mp3';

const tankFireSound = new Howl({
  src: tankFireSrc,
  volume: 0.35,
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
        // Player dead
        return;
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

        if (!ent.Shootable) {
          ent.addComponent({
            name: 'Shootable',
            health: ent.Pietin.health,
            scene_: ent.Pietin.scene_,
          });
        }

        if (!('currentFireCooldown_' in ent.Pietin)) {
          ent.Pietin.currentFireCooldown_ = 0;
        }

        ent.Pietin.currentFireCooldown_ -= dt;

        if (
          (tankEnt.Position.x - ent.Position.x) ** 2
          +
          (tankEnt.Position.z - ent.Position.z) ** 2
          < ent.Pietin.aimingRange ** 2
        ) {
          const temp = new Object3D();
          temp.position.set(ent.Position.x, tankEnt.Position.y, ent.Position.z);
          temp.lookAt(new Vector3(tankEnt.Position.x, tankEnt.Position.y, tankEnt.Position.z));
          const newRotY = (temp.rotation.y + (1.5 * Math.PI));
          ent.Pietin.rotY = tankEnt.Position.z > ent.Position.z ? newRotY : -newRotY;

          if (
            ((tankEnt.Position.x - ent.Position.x) ** 2
            +
            (tankEnt.Position.z - ent.Position.z) ** 2
            < ent.Pietin.firingRange ** 2)
            && ent.Pietin.currentFireCooldown_ <= 0
          ) {
            ent.Pietin.currentFireCooldown_ = ent.Pietin.fireCooldown;

            const explRotY = ent.Pietin.rotY + 0.5 * Math.PI;
            const explosion1 = new Entity();
            explosion1.addComponent({
              name: 'Explosion',
              position: new Vector3(ent.Position.x, ent.Position.y, ent.Position.z).add(new Vector3(0.5, 3.6, 4.8).applyEuler(new Euler(0, explRotY, 0))),
            	positionRandomness: .3,
            	velocity: (new Vector3(0, 0, 1.45)).applyEuler(new Euler(0, explRotY, 0)),
              velocityRandomness: .0,
            	color: 0xaa4400,
            	colorRandomness: .1,
            	turbulence: .0,
            	lifetime: 0.1,
            	size: 5,
            	sizeRandomness: 1,
              spawnRate: 2500,
              emissionDuration: 0.03
            });
            escene.addEntity(explosion1);
            const explosion2 = new Entity();
            explosion2.addComponent({
              name: 'Explosion',
              position: new Vector3(ent.Position.x, ent.Position.y, ent.Position.z).add(new Vector3(-0.5, 3.6, 4.8).applyEuler(new Euler(0, explRotY, 0))),
            	positionRandomness: .3,
            	velocity: (new Vector3(0, 0, 1.45)).applyEuler(new Euler(0, explRotY, 0)),
            	velocityRandomness: .0,
            	color: 0xaa4400,
            	colorRandomness: .1,
            	turbulence: .0,
            	lifetime: 0.1,
            	size: 5,
            	sizeRandomness: 1,
              spawnRate: 2500,
              emissionDuration: 0.03,
            });
            escene.addEntity(explosion2);

            const shot1 = new Entity();
            shot1.addComponent({
              name: 'Shot',
              shooter: ent,
              origin: new Vector3(ent.Position.x, ent.Position.y, ent.Position.z).add(new Vector3(0.5, 0.25, 4.8).applyEuler(new Euler(0, explRotY, 0))),
              direction: (new Vector3(0, 0, 1)).applyEuler(new Euler(0, explRotY, 0)),
              damage: ent.Pietin.damage * 0.5,
            });
            escene.addEntity(shot1);
            const shot2 = new Entity();
            shot2.addComponent({
              name: 'Shot',
              shooter: ent,
              origin: new Vector3(ent.Position.x, ent.Position.y, ent.Position.z).add(new Vector3(-0.5, 0.25, 4.8).applyEuler(new Euler(0, explRotY, 0))),
              direction: (new Vector3(0, 0, 1)).applyEuler(new Euler(0, explRotY, 0)),
              damage: ent.Pietin.damage * 0.5,
            });
            escene.addEntity(shot2);

            tankFireSound.play();
          }
        }

        ent.Pietin.scene_.position.set(ent.Position.x, ent.Position.y, ent.Position.z);
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
