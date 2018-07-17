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
} from 'three';
import GPUParticleSystem from './GPUParticleSystem';
import GLTFLoader from 'three-gltf-loader';
// http://soundbible.com/1919-Shotgun-Blast.html
import tankFireSrc from './audio/tank-fire.mp3';
// Modified from http://soundbible.com/2021-Atchisson-Assault-Shotgun.html
import exposionSrc from './audio/longer-explosion.wav';
import { Howl } from 'howler';

const tankFireSound = new Howl({
  src: tankFireSrc,
});
const explosionSound = new Howl({
  src: exposionSrc,
});

const healthBarFg = document.querySelector('.health-bar-fg');

const TAU = 2 * Math.PI;
const TURN_SPEED = 0.002;
const MOVE_SPEED = 0.01;
const SPOT_COLOR = 0xaaaaaa;
const FIRE_COOLDOWN = 0.4e3;
const MAX_HEALTH = 100;

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
	lifetime: 0.2,
	size: 5,
	sizeRandomness: 1,
};
const spawnerOptions = {
	spawnRate: 2500,
};

const kaboom = new GPUParticleSystem({ maxParticles: 25000 });
kaboom.position.set(0, 3, 0);
scene.add(kaboom);
const kOptions = {
	position: new Vector3(),
	positionRandomness: 1,
	velocity: new Vector3(0, 0.1, 0),
	velocityRandomness: .9,
	color: 0xff8500,
	colorRandomness: .1,
	turbulence: 0.0,
	lifetime: 0.8,
	size: 10,
	sizeRandomness: 3,
};
const kSpawnerOptions = {
	spawnRate: 25000,
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
  console.log(gltf);
});

let tick = 1;
let tickOffset = 1;
let kTick = 1;
let kTickOffset = 1;
let fireCooldown = 0;
let hasTankExploded = false;
let tankHealth = MAX_HEALTH;
let selfHarmCooldown = 0;
const update = (dt) => {
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

    boom.position.set(tankScene.position.x + Math.sin(tankScene.rotation.y) * 2.3, tankScene.position.y + 1.6, tankScene.position.z + Math.cos(tankScene.rotation.y) * 2.3);

    fireCooldown -= dt;
    if (keys.SPACE && fireCooldown <= 0) {
      fireCooldown = FIRE_COOLDOWN;

      tankFireSound.play();

      const gunClip = AnimationClip.findByName(tankAnimations, 'GunAction');
      const gunAction = gunMixer.clipAction(gunClip);
      gunAction.play();
      gunMixer.time = 0;
      const turretClip = AnimationClip.findByName(tankAnimations, 'TurretAction');
      const turretAction = turretMixer.clipAction(turretClip);
      turretAction.play();
      turretMixer.time = 0;

      boom.position.set(tankScene.position.x + Math.sin(tankScene.rotation.y) * 2.3, tankScene.position.y + 1.6, tankScene.position.z + Math.cos(tankScene.rotation.y) * 2.3);
      boom.rotation.y = tankScene.rotation.y;
      options.velocity.set(0, 0, 2.5);
      tickOffset += tick;
      tick = 0;
    }
    if (fireCooldown > FIRE_COOLDOWN - AnimationClip.findByName(tankAnimations, 'GunAction').duration * 1e3) {
      gunMixer.update(dt * 0.001);
      turretMixer.update(dt * 0.001);
    }
    camera.position.set(tankScene.position.x + 25, tankScene.position.y + 25, tankScene.position.z + 25);
    camera.lookAt(tankScene.position);
  }

  if (!hasTankExploded && tankHealth <= 0) {
    kaboom.position.set(tankScene.position.x, tankScene.position.y, tankScene.position.z);
    scene.remove(tankScene);
    kTickOffset += kTick;
    kTick = 0;
    explosionSound.play();
    hasTankExploded = true;
  }

  // Delta-time in seconds.
  const dts = dt * 0.001;
  tick += dts;
  kTick += dts;

  if (tick < 0.2) {
    for (let x = 0; x < spawnerOptions.spawnRate * dts; x++) {
      boom.spawnParticle(options);
    }
  }
  boom.update(tick + tickOffset);

  if (kTick < 0.2) {
    for (let x = 0; x < kSpawnerOptions.spawnRate * dts; x++) {
      kaboom.spawnParticle(kOptions);
    }
  }
  kaboom.update(kTick + kTickOffset);
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
