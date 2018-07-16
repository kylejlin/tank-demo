import {
  Scene,
  Color,
  PerspectiveCamera,
  WebGLRenderer,
  PlaneGeometry,
  Mesh,
  MeshStandardMaterial,
  MeshLambertMaterial,
  MeshBasicMaterial,
  TextureLoader,
  AmbientLight,
  SpotLight,
  BoxGeometry,
} from 'three';
import GLTFLoader from 'three-gltf-loader';

const TAU = 2 * Math.PI;
const TURN_SPEED = 0.002;
const MOVE_SPEED = 0.01;
const SPOT_COLOR = 0xaaaaaa;

const scene = new Scene();
scene.background = new Color(0x005588);
const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
const renderer = new WebGLRenderer();
renderer.physicallyCorrectLights = true;
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
document.body.appendChild(renderer.domElement);

const keys = {};
const Codes = {
  38: 'UP',
  40: 'DOWN',
  37: 'LEFT',
  39: 'RIGHT',
  87: 'W',
  65: 'A',
  83: 'S',
  68: 'D',
  81: 'Q',
  69: 'E',
  32: 'SPACE',
};
window.addEventListener('keydown', (e) => {
  const keyName = Codes[e.keyCode];
  if (keyName === undefined) {
    return;
  }
  keys[keyName] = true;
});
window.addEventListener('keyup', (e) => {
  const keyName = Codes[e.keyCode];
  if (keyName === undefined) {
    return;
  }
  keys[keyName] = false;
});

const spot1 = new SpotLight(SPOT_COLOR);
const spot2 = new SpotLight(SPOT_COLOR);
const spot3 = new SpotLight(SPOT_COLOR);
const spot4 = new SpotLight(SPOT_COLOR);
scene.add(spot1);
scene.add(spot2);
scene.add(spot3);
scene.add(spot4);
spot1.power = spot2.power = spot3.power = spot4.power = 8 * Math.PI;
spot1.position.set(50, 10, 50);
spot2.position.set(-50, 10, 50);
spot3.position.set(-50, 10, -50);
spot4.position.set(50, 10, -50);
spot1.lookAt(0, 0, 0);
spot2.lookAt(0, 0, 0);
spot3.lookAt(0, 0, 0);
spot4.lookAt(0, 0, 0);
//spot1.power = 8 * Math.PI;


const floorMat = new MeshStandardMaterial({ color: 0x442200 });
floorMat.metalness = 0.0;
floorMat.roughness = 0.8;
const floor = new Mesh(
  new PlaneGeometry(100, 100, 50, 50),
  floorMat
);
floor.rotation.x -= 0.25 * TAU;
scene.add(floor);

let tankScene = null;
(new GLTFLoader()).load('./models/tank4.glb', (gltf) => {
  tankScene = gltf.scene;
  tankScene.position.y = 1;
  scene.add(tankScene);
});

const update = (dt) => {
  if (tankScene) {
    if (keys.LEFT) {
      tankScene.rotation.y += TURN_SPEED * dt;
    }
    if (keys.RIGHT) {
      tankScene.rotation.y -= TURN_SPEED * dt;
    }
    if (keys.UP) {
      tankScene.position.x += Math.sin(tankScene.rotation.y) * MOVE_SPEED * dt;
      tankScene.position.z += Math.cos(tankScene.rotation.y) * MOVE_SPEED * dt;
    }
    if (keys.DOWN) {
      tankScene.position.x -= Math.sin(tankScene.rotation.y) * MOVE_SPEED * dt;
      tankScene.position.z -= Math.cos(tankScene.rotation.y) * MOVE_SPEED * dt;
    }
    camera.position.set(tankScene.position.x + 25, tankScene.position.y + 25, tankScene.position.z + 25);
    camera.lookAt(tankScene.position);
  }
};

let then = Date.now();
const loop = () => {
  const now = Date.now();
  const dt = now - then;
  then = now;
  requestAnimationFrame(loop);
  update(dt);
  renderer.render(scene, camera);
};
loop();
