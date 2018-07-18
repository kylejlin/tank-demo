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



const tankFireSound = new Howl({
  src: tankFireSrc,
});
const explosionSound = new Howl({
  src: exposionSrc,
  volume: 5.5,
});

const healthBarFg = document.querySelector('.health-bar-fg');

const TAU = 2 * Math.PI;
const TURN_SPEED = 0.002;
const MOVE_SPEED = 0.01;
const SPOT_COLOR = 0xaaaaaa;
const FIRE_COOLDOWN = 0.4e3;
const MAX_HEALTH = 100;

const scene = new Scene();

const escene = new ECSScene();
escene.addSystem(createExplosionSystem(scene));
escene.addSystem(createDonutSystem(scene));
escene.addSystem(donutSpawnerSystem);
const spawner = new Entity;
spawner.addComponent({
  name: 'DonutSpawner',
  cooldownRange: [1000, 5000],
  xRange: [-50, 50],
  yRange: [0, 0],
  zRange: [-50, 50],
  healthRange: [20, 100],
});
escene.addEntity(spawner);

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
let tankAnimations = null;
let gunMixer = null;
let turretMixer = null;
(new GLTFLoader()).load('./models/tank2.glb', (gltf) => {
  tankScene = gltf.scene;
  tankAnimations = gltf.animations;
  const gun = tankScene.children.find(m => m.name === 'Gun');
  gunMixer = new AnimationMixer(gun);
  const turret = tankScene.children.find(m => m.name === 'Turret');
  turretMixer = new AnimationMixer(turret);
  tankScene.position.y = 1;
  scene.add(tankScene);
});

let donutScene = null;
let donutHasExploded = false;
(new GLTFLoader()).load('./models/donut.glb', (gltf) => {
  donutScene = gltf.scene;
  donutScene.position.set(-20, 0, -30);
  donutScene.scale.set(2.5, 2.5, 2.5);
  scene.add(donutScene);
});

let tick = 1;
let tickOffset = 1;
let fireCooldown = 0;
let hasTankExploded = false;
let tankHealth = MAX_HEALTH;
let selfHarmCooldown = 0;
const update = (dt) => {
  escene.globals.deltaTime = dt;
  escene.update();

  const healthBarVw = 40 * tankHealth / MAX_HEALTH + 'vw';
  healthBarFg.style.width = healthBarVw;
  healthBarFg.style.display = tankHealth > 0
    ? 'block'
    : 'none';

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

    if (keys.W && selfHarmCooldown <= 0) {
      selfHarmCooldown = FIRE_COOLDOWN;
      tankHealth -= 20;
    }
    selfHarmCooldown -= dt;

    fireCooldown -= dt;
    if (keys.SPACE && fireCooldown <= 0) {
      fireCooldown = FIRE_COOLDOWN;

      const raycaster = new Raycaster();
      raycaster.set(
        tankScene.position.clone().add(new Vector3(Math.sin(tankScene.rotation.y) * 2.3, 1.6, Math.cos(tankScene.rotation.y) * 2.3)),
        (new Vector3(0, 0, 1)).applyEuler(tankScene.rotation)
      );
      const hits = raycaster.intersectObject(donutScene, true);
      if (hits.length > 0 && !donutHasExploded) {
        donutHasExploded = true;
        scene.remove(donutScene);

        const explosion = new Entity();
        explosion.addComponent({
          name: 'Explosion',
          position: donutScene.position.clone(),
        	positionRandomness: 1,
        	velocity: new Vector3(0, 0.1, 0),
        	velocityRandomness: .9,
        	color: 0xff8500,
        	colorRandomness: .1,
        	turbulence: 0.0,
        	lifetime: 0.8,
        	size: 10,
        	sizeRandomness: 3,
          spawnRate: 25000,
          emissionDuration: 0.2,
        });
        escene.addEntity(explosion);

        explosionSound.play();
      }

      tankFireSound.play();

      const gunClip = AnimationClip.findByName(tankAnimations, 'GunAction');
      const gunAction = gunMixer.clipAction(gunClip);
      gunAction.play();
      gunMixer.time = 0;
      const turretClip = AnimationClip.findByName(tankAnimations, 'TurretAction');
      const turretAction = turretMixer.clipAction(turretClip);
      turretAction.play();
      turretMixer.time = 0;

      const explosion = new Entity();
      const k = (new Vector3(0, 0, 1.45)).applyEuler(tankScene.rotation);
      explosion.addComponent({
        name: 'Explosion',
        position: new Vector3(tankScene.position.x + Math.sin(tankScene.rotation.y) * 2.3, tankScene.position.y + 1.6, tankScene.position.z + Math.cos(tankScene.rotation.y) * 2.3),
      	positionRandomness: .3,
      	velocity: k,
      	velocityRandomness: .0,
      	color: 0xaa4400,
      	colorRandomness: .1,
      	turbulence: .0,
      	lifetime: 0.2,
      	size: 5,
      	sizeRandomness: 1,
        spawnRate: 2500,
        emissionDuration: 0.2,
      });
      escene.addEntity(explosion);
    }
    if (fireCooldown > FIRE_COOLDOWN - AnimationClip.findByName(tankAnimations, 'GunAction').duration * 1e3) {
      gunMixer.update(dt * 0.001);
      turretMixer.update(dt * 0.001);
    }
    camera.position.set(tankScene.position.x + 25, tankScene.position.y + 25, tankScene.position.z + 25);
    camera.lookAt(tankScene.position);
  }

  if (!hasTankExploded && tankHealth <= 0) {
    scene.remove(tankScene);

    const explosion = new Entity();
    explosion.addComponent({
      name: 'Explosion',
      position: new Vector3(tankScene.position.x, tankScene.position.y, tankScene.position.z),
    	positionRandomness: 1,
    	velocity: new Vector3(0, 0.1, 0),
    	velocityRandomness: .9,
    	color: 0xff8500,
    	colorRandomness: .1,
    	turbulence: 0.0,
    	lifetime: 0.8,
    	size: 10,
    	sizeRandomness: 3,
      spawnRate: 25000,
      emissionDuration: 0.2,
    });
    escene.addEntity(explosion);

    explosionSound.play();
    hasTankExploded = true;
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
