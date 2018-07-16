import {
  Scene,
  Color,
  OrthographicCamera,
  WebGLRenderer,
  PlaneGeometry,
  Mesh,
  MeshStandardMaterial,
  MeshLambertMaterial,
  MeshBasicMaterial,
  TextureLoader,
  AmbientLight,
  SpotLight,
} from 'three';
import GLTFLoader from 'three-gltf-loader';

const TAU = 2 * Math.PI;
const TURN_SPEED = 0.002;
const MOVE_SPEED = 0.01;
const _K = 0.05;
const FRUS_WIDTH = window.innerWidth * _K;
const FRUS_HEIGHT = window.innerHeight * _K;

const scene = new Scene();
scene.background = new Color(0x005588);
const camera = new OrthographicCamera(FRUS_WIDTH / - 2, FRUS_WIDTH / 2, FRUS_HEIGHT / 2, FRUS_HEIGHT / - 2, 1, 1000 );
const renderer = new WebGLRenderer();
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

const amb = new AmbientLight(0xffffff);
scene.add(amb);

const spot = new SpotLight(0xffffff);
spot.position.set(0, 20, 0);
spot.power = 8 * Math.PI;
scene.add(spot);

const floor = new Mesh(
  new PlaneGeometry(100, 100, 50, 50),
  new MeshBasicMaterial({ color: 0x888888 })
);
floor.rotation.x -= 0.25 * TAU;
scene.add(floor);

let tankScene = null;
(new GLTFLoader()).load('./models/tank.glb', (gltf) => {
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
    camera.position.set(tankScene.position.x + 10, tankScene.position.y + 10, tankScene.position.z + 10);
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
