import GLTFLoader from 'three-gltf-loader';

const assets = {};
const waitForAssetsToLoad = Promise.all([
  new Promise((resolve) => {
    new GLTFLoader().load('./models/donut.glb', (gltf) => {
      assets.donutScene = gltf.scene;
      assets.donutScene.scale.set(2.5, 2.5, 2.5);
      resolve();
    });
  }),

  new Promise((resolve) => {
    new GLTFLoader().load('./models/light-cannon-shell-four-pack.glb', (gltf) => {
      assets.fourPackScene = gltf.scene;
      assets.fourPackScene.scale.set(.75,.75,.75);
      resolve();
    });
  }),

  new Promise((resolve) => {
    new GLTFLoader().load('./models/pietin-gun.glb', (gltf) => {
      assets.pietinScene = gltf.scene;
      assets.pietinScene.scale.set(1.8, 1.8, 1.8);
      resolve();
    });
  }),

  new Promise((resolve) => {
    new GLTFLoader().load('./models/tank.glb', (gltf) => {
      assets.tankScene = gltf.scene;
      // TODO reconsider...
      assets.tankAnimations = gltf.animations;
      resolve();
    });
  }),

  new Promise((resolve) => {
    new GLTFLoader().load('./models/soldier.glb', (gltf) => {
      assets.soldierScene = gltf.scene;
      assets.soldierScene.scale.set(0.5, 0.5, 0.5);
      assets.soldierAnimations = gltf.animations;
      resolve();
    });
  })
]);

export default assets;
export { waitForAssetsToLoad };
