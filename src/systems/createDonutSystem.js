import { System, IndexSpec, Entity } from 'indexed-ecs';
import GLTFLoader from 'three-gltf-loader';
import { Vector3 } from 'three';

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

        if (!ent.Shootable) {
          ent.addComponent({
            name: 'Shootable',
            health: ent.Donut.health,
            scene_: ent.Donut.scene_,
          });
        }

        ent.Donut.scene_.position.set(ent.Position.x, ent.Position.y, ent.Position.z);
      }
    },
    [
      new IndexSpec(['Donut'])
    ]
  )
};

export default createDonutSystem;
