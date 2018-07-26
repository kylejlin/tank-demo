import { System, IndexSpec } from 'indexed-ecs';

const createPendingRemovalSystem = (scene) => {
  return new System(
    (escene, [{ entities }]) => {
      for (const ent of entities) {
        if (ent.ThreeScene && ent.ThreeScene.isAdded) {
          ent.ThreeScene.isAdded = false;
          scene.remove(ent.ThreeScene.scene);
        }

        escene.removeEntity(ent);
      }
    },
    [
      new IndexSpec(['PendingRemoval'])
    ]
  );
};

export default createPendingRemovalSystem;
