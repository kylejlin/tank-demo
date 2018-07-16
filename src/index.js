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
  Points,
  Vector3,
} from 'three';
import GPUParticleSystem from './GPUParticleSystem';
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

const boom = new GPUParticleSystem({ maxParticles: 25000 });
boom.position.set(0, 0, 0);
scene.add(boom);
const options = {
	position: new Vector3(),
	positionRandomness: .3,
	velocity: new Vector3(),
	velocityRandomness: .0,
	color: 0xff8500,
	colorRandomness: .1,
	turbulence: .0,
	lifetime: 0.5,
	size: 5,
	sizeRandomness: 1,
};
const spawnerOptions = {
	spawnRate: 2500,
};


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

let tick = 0;
let tickOffset = 0;
let fireCooldown = 0;
const update = (dt) => {
  if (tankScene) {
    if (keys.LEFT) {
      tankScene.rotation.y += TURN_SPEED * dt;
      while (tankScene.rotation.y > TAU) {
        tankScene.rotation.y -= TAU;
      }
    }
    if (keys.RIGHT) {
      tankScene.rotation.y -= TURN_SPEED * dt;
      while (tankScene.rotation.y < 0) {
        tankScene.rotation.y += TAU;
      }
    }
    if (keys.UP) {
      tankScene.position.x += Math.sin(tankScene.rotation.y) * MOVE_SPEED * dt;
      tankScene.position.z += Math.cos(tankScene.rotation.y) * MOVE_SPEED * dt;
    }
    if (keys.DOWN) {
      tankScene.position.x -= Math.sin(tankScene.rotation.y) * MOVE_SPEED * dt;
      tankScene.position.z -= Math.cos(tankScene.rotation.y) * MOVE_SPEED * dt;
    }
    fireCooldown -= dt;
    if (keys.SPACE && fireCooldown <= 0) {
      fireCooldown = 1e3;
      boom.position.set(tankScene.position.x + Math.sin(tankScene.rotation.y) * 2.3, tankScene.position.y + 1.6, tankScene.position.z + Math.cos(tankScene.rotation.y) * 2.3);
      boom.rotation.y = tankScene.rotation.y;
      options.velocity.set(0, 0, 3);
      tickOffset += tick;
      tick = 0;
    }
    camera.position.set(tankScene.position.x + 25, tankScene.position.y + 25, tankScene.position.z + 25);
    camera.lookAt(tankScene.position);
  }

  // Delta-time in seconds.
  const dts = dt * 0.001;
  tick += dts;
  //options.position.x = Math.sin(tick * spawnerOptions.horizontalSpeed) * 20;
  //options.position.z = Math.sin(tick * spawnerOptions.horizontalSpeed + spawnerOptions.verticalSpeed) * 5;
  if (tick < 0.2) {
    for (let x = 0; x < spawnerOptions.spawnRate * dts; x++) {
      // Yep, that's really it.	Spawning particles is super cheap, and once you spawn them, the rest of
      // their lifecycle is handled entirely on the GPU, driven by a time uniform updated below
      boom.spawnParticle(options);
    }
  }
  boom.update(tick + tickOffset);
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
