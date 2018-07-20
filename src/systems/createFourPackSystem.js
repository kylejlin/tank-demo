import { System, IndexSpec, Entity } from 'indexed-ecs';
import GLTFLoader from 'three-gltf-loader';

let fourPackScene = null;
(new GLTFLoader()).load('./models/light-cannon-shell-four-pack.glb', (gltf) => {
  fourPackScene = gltf.scene;
  fourPackScene.scale.set(.75,.75,.75);
});

const createFourPackSystem = (scene) => {
  return new System(
    (escene, [{ entities }]) => {
      const dt = escene.globals.deltaTime;
      const dts = dt * 1e-3;

      if (fourPackScene === null) {
        return;
      }

      for (const ent of entities) {
        if (!ent.FourPack.scene_) {
          const clone = fourPackScene.clone();
          ent.FourPack.scene_ = clone;
          scene.add(clone);
        }
        
        if (!ent.Loot) {
          ent.addComponent({
            name: 'Loot',
            scene_: ent.FourPack.scene_,
            contents: {
              ammo: 4,
            },
          });
        }

        ent.FourPack.rotY += 0.03;

        ent.FourPack.scene_.position.set(ent.Position.x, ent.Position.y, ent.Position.z);
        ent.FourPack.scene_.rotation.y = ent.FourPack.rotY;
      }
    },
    [
      new IndexSpec(['FourPack', 'Position'])
    ]
  )
};

export default createFourPackSystem;
