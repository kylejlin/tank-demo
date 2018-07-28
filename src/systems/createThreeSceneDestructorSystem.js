import { DestructorSystem } from 'becs';

const createThreeSceneDestructorSystem = (threeScene) => new DestructorSystem(
  ['ThreeScene'],
  (entity) => {
    if (entity.ThreeScene.isAdded) {
      threeScene.remove(entity.ThreeScene.scene);
    }
  }
);

export default createThreeSceneDestructorSystem;
