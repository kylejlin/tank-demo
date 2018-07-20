import { System, IndexSpec, Entity } from 'indexed-ecs';

const healthBarFg = document.querySelector('.health-bar-fg');
const lightCannonFg = document.querySelector('.light-cannon-fg');

const hudSystem = new System(
  (escene, [{ entities }]) => {
    const dt = escene.globals.deltaTime;
    const dts = dt * 1e-3;

    const [ent] = entities;
    if (!ent) {
      // Player is dead
      healthBarFg.style.display = 'none';
      lightCannonFg.style.display = 'none';
      return;
    }

    const healthRatio = ent.Shootable.health / ent.Shootable.maxHealth;
    healthBarFg.style.width = 40 * healthRatio + 'vw';
    healthBarFg.style.display = 'block';

    lightCannonFg.innerHTML = ent.Tank.ammo;
    lightCannonFg.style.display = 'block';
  },
  [
    new IndexSpec(['Tank', 'PlayerTank', 'Shootable'])
  ]
);

export default hudSystem;
