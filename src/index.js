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

import { Scene32 } from 'becs';

import createPietin from './creators/createPietin';
import createTank from './creators/createTank';
import createSoldier from './creators/createSoldier';

import createThreeSceneDestructorSystem from './systems/createThreeSceneDestructorSystem';

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
import soldierSystem from './systems/soldierSystem';

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

const threeScene = new Scene();
const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);

const scene = new Scene32();

waitForAssetsToLoad.then(() => {
  scene.addSystem(createExplosionSystem(threeScene));
  scene.addSystem(donutSpawnerSystem);
  scene.addSystem(playerControlSystem);
  scene.addSystem(shotSystem);
  scene.addSystem(createCameraSystem(camera));
  scene.addSystem(pietinSystem);
  scene.addSystem(shootableSystem);
  scene.addSystem(hudSystem);
  scene.addSystem(lootSystem);
  scene.addSystem(createTankMuzzleFlashSystem(threeScene));
  scene.addSystem(boundarySystem);
  scene.addSystem(createThreeSceneSystem(threeScene));
  scene.addSystem(soldierSystem);

  scene.addDestructorSystem(createThreeSceneDestructorSystem(threeScene));

  const spawner = {
    DonutSpawner: {
      cooldownRange: [2.5e3, 10e3],
      xRange: [-50, 50],
      yRange: [0, 0],
      zRange: [-50, 50],
      healthRange: [5, 20],
    },
  };
  scene.addEntity(spawner);
  const tank = createTank({
    isPlayerTank: true,
    position: {
      x: 30,
      y: 1,
      z: 30,
    },
    maxHealth: 100,
    turnSpeed: 0.002,
    moveSpeed: 0.01,
    fireCooldown: 0.4e3,
    damage: 15,
    ammo: 25,
  });
  scene.addEntity(tank);
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
  scene.addEntity(pietin1);
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
  scene.addEntity(pietin2);
  for (let i = -10; i < 10; i++) {
    const soldier = createSoldier({
      health: 15,
      position: {
        x: -5 + i * 2,
        y: 0,
        z: -5 - i * 2,
      },
      rotation: {
        x: 0,
        y: 0.7,
        z: 0,
      },
      moveSpeed: 0.005,
      damage: 1,
      fireCooldown: 1e3,
      seeingRange: 30,
      firingRange: 15,
    });
    scene.addEntity(soldier);
  }

  gameLoop();
});

threeScene.background = new Color(0x005588);
const renderer = new WebGLRenderer();
renderer.physicallyCorrectLights = true;
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(threeScene, camera);
});
document.body.appendChild(renderer.domElement);

const spot1 = new SpotLight(SPOT_COLOR);
const spot2 = new SpotLight(SPOT_COLOR);
const spot3 = new SpotLight(SPOT_COLOR);
const spot4 = new SpotLight(SPOT_COLOR);
threeScene.add(spot1);
threeScene.add(spot2);
threeScene.add(spot3);
threeScene.add(spot4);
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
threeScene.add(floor);

let then = Date.now();
const gameLoop = () => {
  requestAnimationFrame(gameLoop);

  const now = Date.now();
  const dt = now - then;
  then = now;

  scene.globals.deltaTime = dt;
  scene.update();
  renderer.render(threeScene, camera);
};

// Just so the user doesn't have to stare at a blank screen while waiting for
// assets to load.
const initRender = () => {
  camera.position.set(25, 26, 25);
  camera.lookAt(new Vector3(0, 1, 0));
  renderer.render(threeScene, camera);
};
initRender();
