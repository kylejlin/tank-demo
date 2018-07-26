import { Entity } from 'indexed-ecs';
import assets from '../assets';
import { Group } from 'three';

const createPietin = ({
  position,
  health,

  aimingRange,
  firingRange,
  damage,
  fireCooldown,
}) => {
  const { pietinScene } = assets;

  const clone = pietinScene.clone();
  const spinnables = new Group();
  clone.children
    .filter(m => ['Pietin', 'GunBody', 'Barrel1', 'Barrel2'].includes(m.name))
    .forEach((mesh) => {
      spinnables.add(mesh);
      clone.remove(mesh);
    });
  clone.add(spinnables);

  return new Entity({
    Pietin: {
      rotY: 0,
      aimingRange,
      firingRange,
      damage,
      fireCooldown,
      currentFireCooldown: 0,
      spinnables,
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

    Shootable: {
      health,
    },
  });
};

export default createPietin;
