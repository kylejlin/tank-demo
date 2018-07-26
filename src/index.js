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
import { waitForAssetsToLoad } from './assets';

// http://soundbible.com/1919-Shotgun-Blast.html
import tankFireSrc from './audio/tank-fire.mp3';
// Modified from http://soundbible.com/2021-Atchisson-Assault-Shotgun.html
import exposionSrc from './audio/longer-explosion.wav';
import { Howl } from 'howler';

import { Entity, Scene as ECSScene } from 'indexed-ecs';

import createPietin from './creators/createPietin';
import createTank from './creators/createTank';

import createPendingRemovalSystem from './systems/createPendingRemovalSystem';

import createExplosionSystem from './systems/createExplosionSystem';
import donutSpawnerSystem from  './systems/donutSpawnerSystem';
import playerControlSystem from './systems/playerControlSystem';
import shotSystem from './systems/shotSystem';
import createCameraSystem from './systems/createCameraSystem';
import pietinSystem from './systems/pietinSystem';
import shootableSystem from './systems/shootableSystem';
import hudSystem from './systems/hudSystem';
import lootSystem from './systems/lootSystem';
import createTankMuzzleFlashSystem from './systems/createTankMuzzleFlashSystem';
import boundarySystem from './systems/boundarySystem';
import createThreeSceneSystem from './systems/createThreeSceneSystem';

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

waitForAssetsToLoad.then(() => {
  escene.addSystem(createExplosionSystem(scene));
  escene.addSystem(donutSpawnerSystem);
  escene.addSystem(playerControlSystem);
  escene.addSystem(shotSystem);
  escene.addSystem(createCameraSystem(camera));
  escene.addSystem(pietinSystem);
  escene.addSystem(shootableSystem);
  escene.addSystem(hudSystem);
  escene.addSystem(lootSystem);
  escene.addSystem(createTankMuzzleFlashSystem(scene));
  escene.addSystem(boundarySystem);
  escene.addSystem(createThreeSceneSystem(scene));

  escene.addSystem(createPendingRemovalSystem(scene));

  const spawner = new Entity({
    DonutSpawner: {
      cooldownRange: [2.5e3, 10e3],
      xRange: [-50, 50],
      yRange: [0, 0],
      zRange: [-50, 50],
      healthRange: [5, 20],
    },
  });
  escene.addEntity(spawner);
  const tank = createTank({
    position: {
      x: 0,
      y: 1,
      z: 0,
    },
    maxHealth: 100,
    turnSpeed: 0.002,
    moveSpeed: 0.01,
    fireCooldown: 0.4e3,
    damage: 15,
    ammo: 25,
  });
  tank.addComponent({
    name: 'PlayerTank',
  });
  escene.addEntity(tank);
  const pietin1 = createPietin({
    position: {
      x: -15,
      y: 0,
      z: -20,
    },
    health: 25,
    aimingRange: 30,
    firingRange: 20,
    damage: 2,
    fireCooldown: 0.1e3,
  });
  escene.addEntity(pietin1);
  const pietin2 = createPietin({
    position: {
      x: -20,
      y: 0,
      z: -15,
    },
    health: 25,
    aimingRange: 30,
    firingRange: 20,
    fireCooldown: 0.1e3,
    damage: 2,
  });
  escene.addEntity(pietin2);

  gameLoop();
});

scene.background = new Color(0x005588);
const renderer = new WebGLRenderer();
renderer.physicallyCorrectLights = true;
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
});
document.body.appendChild(renderer.domElement);

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

const floorMat = new MeshStandardMaterial({ color: 0x442200 });
floorMat.metalness = 0.0;
floorMat.roughness = 0.8;
const floor = new Mesh(
  new PlaneGeometry(100, 100, 50, 50),
  floorMat
);
floor.rotation.x -= 0.25 * TAU;
scene.add(floor);

let then = Date.now();
const gameLoop = () => {
  requestAnimationFrame(gameLoop);

  const now = Date.now();
  const dt = now - then;
  then = now;

  escene.globals.deltaTime = dt;
  escene.update();
  renderer.render(scene, camera);
};

// Just so the user doesn't have to stare at a blank screen while waiting for
// assets to load.
const initRender = () => {
  camera.position.set(25, 26, 25);
  camera.lookAt(new Vector3(0, 1, 0));
  renderer.render(scene, camera);
};
initRender();
