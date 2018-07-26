import { System, IndexSpec } from 'indexed-ecs';

const createThreeSceneSystem = (scene) => {
  return new System(
    (escene, [{ entities }]) => {
      for (const ent of entities) {
        if (!ent.ThreeScene.isAdded) {
          ent.ThreeScene.isAdded = true;
          scene.add(ent.ThreeScene.scene);
        }

        ent.ThreeScene.scene.position.set(
          ent.Position.x,
          ent.Position.y,
          ent.Position.z
        );

        if (ent.Rotation) {
          ent.ThreeScene.scene.rotation.set(
            ent.Rotation.x,
            ent.Rotation.y,
            ent.Rotation.z
          );
        }
      }
    },
    [
      new IndexSpec(['ThreeScene', 'Position'])
    ]
  );
};

export default createThreeSceneSystem;
