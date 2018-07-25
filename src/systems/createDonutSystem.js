import { System, IndexSpec, Entity } from 'indexed-ecs';
import { Vector3 } from 'three';
import assets from '../assets';

const createDonutSystem = (scene) => {
  const { donutScene } = assets;

  return new System(
    (escene, [{ entities }]) => {
      const dt = escene.globals.deltaTime;
      const dts = dt * 1e-3;

      for (const ent of entities) {
        if (!ent.Donut.scene_) {
          const clone = donutScene.clone();
          ent.Donut.scene_ = clone;
          scene.add(clone);
        }

        if (!ent.LootDropper) {
          const fourPack = new Entity();
          fourPack.addComponent({
            name: 'FourPack',
            rotY: 0,
          });
          fourPack.addComponent({
            name: 'Position',
            x: ent.Position.x,
            y: ent.Position.y,
            z: ent.Position.z,
          });
          const drop = Math.random() < 0.50
            ? fourPack
            : null;
          ent.addComponent({
            name: 'LootDropper',
            drop,
          });
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
