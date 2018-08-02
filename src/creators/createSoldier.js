import assets from '../assets';
import {
  AnimationMixer,
  AnimationClip,
  LoopOnce,
  Skeleton,
} from 'three';
import cloneGltf from '../cloneGltf';

// TODO
const createMedkit = () => null;

const createSoldier = ({
  position,
  health,

  moveSpeed,

  damage,
  fireCooldown,
  seeingRange,
  firingRange,
}) => {
  const { soldierScene, soldierAnimations } = assets;

  const clone = cloneGltf({
    scene: soldierScene,
    animations: soldierAnimations
  }).scene;
  console.log(clone);
  const mixer = new AnimationMixer(clone);
  const runClip = AnimationClip.findByName(soldierAnimations, 'Run');
  const aimClip = AnimationClip.findByName(soldierAnimations, 'Aim');
  const riseClip = AnimationClip.findByName(soldierAnimations, 'Rise');
  const fireClip = AnimationClip.findByName(soldierAnimations, 'Fire');
  const runAction = mixer.clipAction(runClip);
  const aimAction = mixer.clipAction(aimClip);
  const riseAction = mixer.clipAction(riseClip);
  const fireAction = mixer.clipAction(fireClip);
  runAction.timeScale = 0.85;
  runAction.weight = 0;
  aimAction.loop = LoopOnce;
  aimAction.clampWhenFinished = true;
  riseAction.loop = LoopOnce;
  riseAction.clampWhenFinished = true;
  fireAction.loop = LoopOnce;
  fireAction.clampWhenFinished = true;

  return {
    Soldier: {
      damage,
      state: 'CROUCHED',
      moveSpeed,
      fireCooldown,
      currentFireCooldown: 0,
      seeingRange,
      firingRange,
      mixer,
      runAction,
      aimAction,
      riseAction,
      fireAction,
    },

    ThreeScene: {
      scene: clone,
      isAdded: false,
    },

    Position: {
      x: position.x,
      y: position.y,
      z: position.z,
    },

    Rotation: {
      x: 0,
      y: 0,
      z: 0,
    },

    LootDropper: {
      drop: Math.random() < 0.50
        ? createMedkit({
          position: { ...position },
        })
        : null,
    },

    Shootable: {
      health,
    },
  };
};

export default createSoldier;
