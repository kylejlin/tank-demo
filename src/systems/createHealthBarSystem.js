import { System, IndexSpec, Entity } from 'indexed-ecs';

const createHealthBarSystem = (healthBarFg) => {
  return new System(
    (escene, [{ entities }]) => {
      const dt = escene.globals.deltaTime;
      const dts = dt * 1e-3;

      const [ent] = entities;
      if (!ent) {
        // Player dead
        healthBarFg.style.display = 'none';
        return;
      }

      const healthRatio = ent.Shootable.health / ent.Shootable.maxHealth;
      healthBarFg.style.width = 40 * healthRatio + 'vw';
      healthBarFg.style.display = 'block';
    },
    [
      new IndexSpec(['Tank', 'PlayerTank', 'Shootable'])
    ]
  )
};

export default createHealthBarSystem;
