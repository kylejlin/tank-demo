import { Entity } from 'indexed-ecs';
import assets from '../assets';
import createFourPack from './createFourPack';

const createDonut = ({
  position,
  health,
}) => {
  const { donutScene } = assets;

  return new Entity({
    ThreeScene: {
      scene: donutScene.clone(),
      isAdded: false,
    },

    Position: {
      x: position.x,
      y: position.y,
      z: position.z,
    },

    LootDropper: {
      drop: Math.random() < 0.50
        ? createFourPack({
          position: { ...position },
        })
        : null,
    },

    Shootable: {
      health,
    },
  });
};

export default createDonut;
