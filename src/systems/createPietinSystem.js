import { System, IndexSpec, Entity } from 'indexed-ecs';
import GLTFLoader from 'three-gltf-loader';
import { Vector3, Group, Object3D } from 'three';

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

        if (!ent.Shootable) {
          ent.addComponent({
            name: 'Shootable',
            health: ent.Pietin.health,
            scene_: ent.Pietin.scene_,
          });
        }

        if (
          (tankEnt.Position.x - ent.Position.x) ** 2
          +
          (tankEnt.Position.y - ent.Position.y) ** 2
          < ent.Pietin.aimingRange ** 2
        ) {
          const temp = new Object3D();
          temp.position.set(ent.Position.x, tankEnt.Position.y, ent.Position.z);
          temp.lookAt(new Vector3(tankEnt.Position.x, tankEnt.Position.y, tankEnt.Position.z));
          const newRotY = (temp.rotation.y + (1.5 * Math.PI));
          ent.Pietin.rotY = tankEnt.Position.z > ent.Position.z ? newRotY : -newRotY;
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
