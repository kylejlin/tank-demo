import { System, IndexSpec } from 'indexed-ecs';
import GLTFLoader from 'three-gltf-loader';

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
        if (ent.Donut.health <= 0) {
          scene.remove(ent.Donut.scene_);
          escene.removeEntity(ent);
          continue;
        }

        if (!ent.Donut.scene_) {
          const clone = donutScene.clone();
          ent.Donut.scene_ = clone;
          scene.add(clone);
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
