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
  AnimationClip,
  AnimationMixer,
  Raycaster,
} from 'three';
import GLTFLoader from 'three-gltf-loader';
// http://soundbible.com/1919-Shotgun-Blast.html
import tankFireSrc from './audio/tank-fire.mp3';
// Modified from http://soundbible.com/2021-Atchisson-Assault-Shotgun.html
import exposionSrc from './audio/longer-explosion.wav';
import { Howl } from 'howler';
import { Entity, Scene as ECSScene } from 'indexed-ecs';
import createExplosionSystem from './systems/createExplosionSystem';
import createDonutSystem from './systems/createDonutSystem';
import donutSpawnerSystem from  './systems/donutSpawnerSystem';
import createTankSystem from './systems/createTankSystem';
import playerControlSystem from './systems/playerControlSystem';
import shotSystem from './systems/shotSystem';
import createCameraSystem from './systems/createCameraSystem';
import createPietinSystem from './systems/createPietinSystem';
import createShootableSystem from './systems/createShootableSystem';
import hudSystem from './systems/hudSystem';

const tankFireSound = new Howl({
  src: tankFireSrc,
});
const explosionSound = new Howl({
  src: exposionSrc,
  volume: 5.5,
});

const healthBarFg = document.querySelector('.health-bar-fg');

const TAU = 2 * Math.PI;

const SPOT_COLOR = 0xaaaaaa;

const scene = new Scene();
const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);

const escene = new ECSScene();
escene.addSystem(createExplosionSystem(scene));
escene.addSystem(createDonutSystem(scene));
escene.addSystem(donutSpawnerSystem);
escene.addSystem(createTankSystem(scene));
escene.addSystem(playerControlSystem);
escene.addSystem(shotSystem);
escene.addSystem(createCameraSystem(camera));
escene.addSystem(createPietinSystem(scene));
escene.addSystem(createShootableSystem(scene));
escene.addSystem(hudSystem);
const spawner = new Entity;
spawner.addComponent({
  name: 'DonutSpawner',
  cooldownRange: [2.5e3, 10e3],
  xRange: [-50, 50],
  yRange: [0, 0],
  zRange: [-50, 50],
  healthRange: [5, 20],
});
//escene.addEntity(spawner);
const tank = new Entity();
tank.addComponent({
  name: 'Tank',
  turnSpeed: 0.002,
  moveSpeed: 0.01,
  fireCooldown: 0.4e3,
  rotY: 0,
  maxHealth: 100,
  damage: 15,
  ammo: 25,
});
tank.addComponent({
  name: 'Position',
  x: 0,
  y: 1,
  z: 0,
});
tank.addComponent({
  name: 'PlayerTank',
});
escene.addEntity(tank);
const pietin1 = new Entity();
pietin1.addComponent({
  name: 'Pietin',
  aimingRange: 30,
  firingRange: 20,
  damage: 2,
  fireCooldown: 0.1e3,
  rotY: 0.4 * TAU,
  health: 25,
});
pietin1.addComponent({
  name: 'Position',
  x: -15,
  y: 0,
  z: -20,
});
escene.addEntity(pietin1);
const pietin2 = new Entity();
pietin2.addComponent({
  name: 'Pietin',
  aimingRange: 30,
  firingRange: 20,
  fireCooldown: 0.1e3,
  damage: 2,
  rotY: 0,
  health: 25,
});
pietin2.addComponent({
  name: 'Position',
  x: -20,
  y: 0,
  z: -15,
});
escene.addEntity(pietin2);

scene.background = new Color(0x005588);
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
spot1.power = spot2.power = spot3.power = spot4.power = 4 * Math.PI;
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

const update = (dt) => {
  escene.globals.deltaTime = dt;
  escene.update();

  // const healthBarVw = 40 * tankHealth / MAX_HEALTH + 'vw';
  // healthBarFg.style.width = healthBarVw;
  // healthBarFg.style.display = tankHealth > 0
  //   ? 'block'
  //   : 'none';
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
