import { System } from 'becs';
import { randFloat } from './helpers/rand';
import createDonut from '../creators/createDonut';

const donutSpawnerSystem = new System(
  [
    ['DonutSpawner']
  ],
  ([entities], scene) => {
    const dt = scene.globals.deltaTime;
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

        scene.addEntity(createDonut({
          health: randFloat(minH, maxH),
          position: {
            x: randFloat(minX, maxX),
            y: randFloat(minY, maxY),
            z: randFloat(minZ, maxZ),
          },
        }));
      }
    }
  }
);

export default donutSpawnerSystem;
