import { System } from 'becs';

const createThreeSceneSystem = (threeScene) => {
  return new System(
    [
      ['ThreeScene', 'Position']
    ],
    ([entities], scene) => {
      for (const ent of entities) {
        if (!ent.ThreeScene.isAdded) {
          ent.ThreeScene.isAdded = true;
          threeScene.add(ent.ThreeScene.scene);
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
    }
  );
};

export default createThreeSceneSystem;
