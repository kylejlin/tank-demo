import { System, IndexSpec, Entity } from 'indexed-ecs';
import { Vector3, Raycaster, Euler } from 'three';

const createLootSystem = (scene) => {
  return new System(
    (escene, [{ entities }, { entities: tankEntities }]) => {
      const dt = escene.globals.deltaTime;
      const dts = dt * 1e-3;

      const [tankEnt] = tankEntities;
      if (!tankEnt) {
        // Player is dead.
        return;
      }
      const raycaster = new Raycaster();
      raycaster.set(
        new Vector3(tankEnt.Position.x + Math.sin(tankEnt.Tank.rotY) * 0, tankEnt.Position.y + 0.5, tankEnt.Position.z + Math.cos(tankEnt.Tank.rotY) * 0),
        (new Vector3(0, 0, 1)).applyEuler(new Euler(0, tankEnt.Tank.rotY, 0))
      );

      for (const ent of entities) {
        const hits = raycaster.intersectObject(ent.Loot.scene_, true);
        for (const hit of hits) {
          if (hit.distance <= 2.3) {
            for (const key in ent.Loot.contents) {
              tankEnt.Tank[key] += ent.Loot.contents[key];
            }
            scene.remove(ent.Loot.scene_);
            escene.removeEntity(ent);
            break;
          }
        }
      }
    },
    [
      new IndexSpec(['Loot']),
      new IndexSpec(['PlayerTank', 'Tank'])
    ]
  )
};

export default createLootSystem;
