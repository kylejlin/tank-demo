import { System, IndexSpec, Entity } from 'indexed-ecs';
import { randFloat } from './helpers/rand';

const donutSpawnerSystem = new System(
  (escene, [{ entities }]) => {
    const dt = escene.globals.deltaTime;
    const dts = dt * 1e-3;

    for (const ent of entities) {
      if (!('currentCooldown_' in ent.DonutSpawner)) {
        const [min, max] = ent.DonutSpawner.cooldownRange;
        ent.DonutSpawner.currentCooldown_ = randFloat(min, max);
      }
      ent.DonutSpawner.currentCooldown_ -= dt;
      if (ent.DonutSpawner.currentCooldown_ <= 0) {
        const [minCd, maxCd] = ent.DonutSpawner.cooldownRange;
        const [minX, maxX] = ent.DonutSpawner.xRange;
        const [minY, maxY] = ent.DonutSpawner.yRange;
        const [minZ, maxZ] = ent.DonutSpawner.zRange;
        const [minH, maxH] = ent.DonutSpawner.healthRange;
        ent.DonutSpawner.currentCooldown_ = randFloat(minCd, maxCd);
        const donut = new Entity();
        donut.addComponent({
          name: 'Donut',
          x: randFloat(minX, maxX),
          y: randFloat(minY, maxY),
          z: randFloat(minZ, maxZ),
          health: randFloat(minH, maxH),
        });
        escene.addEntity(donut);
      }
    }
  },
  [
    new IndexSpec(['DonutSpawner'])
  ]
);

export default donutSpawnerSystem;
