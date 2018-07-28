import assets from '../assets';
import { AnimationMixer, AnimationClip } from 'three';

const createTank = ({
  isPlayerTank,

  position,
  maxHealth,

  turnSpeed,
  moveSpeed,
  damage,
  fireCooldown,
  ammo,
}) => {
  const { tankScene, tankAnimations } = assets;

  const clone = tankScene.clone();
  const gun = clone.children.find(m => m.name === 'Gun');
  const gunMixer = new AnimationMixer(gun);
  const turret = clone.children.find(m => m.name === 'Turret');
  const turretMixer = new AnimationMixer(turret);

  const gunClip = AnimationClip.findByName(tankAnimations, 'GunAction');
  const gunAction = gunMixer.clipAction(gunClip);
  gunAction.play();
  const turretClip = AnimationClip.findByName(tankAnimations, 'TurretAction');
  const turretAction = turretMixer.clipAction(turretClip);
  turretAction.play();

  const playerTankComponent = isPlayerTank
    ? { PlayerTank: {} }
    : {};

  return {
    ...playerTankComponent,

    Tank: {
      maxHealth,
      turnSpeed,
      moveSpeed,
      damage,
      fireCooldown,
      currentFireCooldown: 0,
      ammo,
      gunMixer,
      turretMixer,
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

    Shootable: {
      health: maxHealth,
    },
  };
};

export default createTank;
