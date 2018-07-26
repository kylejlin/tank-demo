import { Entity } from 'indexed-ecs';
import assets from '../assets';

const createFourPack = ({
  position,
}) => {
  const { fourPackScene } = assets;

  return new Entity({
    ThreeScene: {
      scene: fourPackScene.clone(),
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

    Loot: {
      contents: {
        ammo: 4,
      },
      pickUpSound: 'ammo',
    },
  });
};

export default createFourPack;
