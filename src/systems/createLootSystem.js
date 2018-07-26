import { System, IndexSpec, Entity } from 'indexed-ecs';
import { Vector3, Raycaster, Euler } from 'three';
import { Howl } from 'howler';
// Trimmed from https://www.youtube.com/watch?v=Igym4-KVFPc
import pickUpAmmoSrc from '../audio/pick-up-ammo.wav';

const pickUpSounds = {
  ammo: new Howl({
    src: pickUpAmmoSrc,
    volume: 20,
  }),
};

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
      const raycaster1 = new Raycaster();
      raycaster1.set(
        new Vector3(tankEnt.Position.x, tankEnt.Position.y, tankEnt.Position.z).add(new Vector3(0, 0.5, 0).applyEuler(new Euler(0, tankEnt.Rotation.y, 0))),
        (new Vector3(0, 0, 1)).applyEuler(new Euler(0, tankEnt.Rotation.y, 0))
      );
      const raycaster2 = new Raycaster();
      raycaster2.set(
        new Vector3(tankEnt.Position.x, tankEnt.Position.y, tankEnt.Position.z).add(new Vector3(-1, 0.5, 0).applyEuler(new Euler(0, tankEnt.Rotation.y, 0))),
        (new Vector3(0, 0, 1)).applyEuler(new Euler(0, tankEnt.Rotation.y, 0))
      );
      const raycaster3 = new Raycaster();
      raycaster3.set(
        new Vector3(tankEnt.Position.x, tankEnt.Position.y, tankEnt.Position.z).add(new Vector3(1, 0.5, 0).applyEuler(new Euler(0, tankEnt.Rotation.y, 0))),
        (new Vector3(0, 0, 1)).applyEuler(new Euler(0, tankEnt.Rotation.y, 0))
      );

      for (const ent of entities) {
        const hits1 = raycaster1.intersectObject(ent.ThreeScene.scene, true);
        const hits2 = raycaster2.intersectObject(ent.ThreeScene.scene, true);
        const hits3 = raycaster3.intersectObject(ent.ThreeScene.scene, true);
        const hits = hits1.concat(hits2).concat(hits3);
        for (const hit of hits) {
          if (hit.distance <= 2.3) {
            for (const key in ent.Loot.contents) {
              tankEnt.Tank[key] += ent.Loot.contents[key];
            }

            if (pickUpSounds[ent.Loot.pickUpSound]) {
              pickUpSounds[ent.Loot.pickUpSound].play();
            }

            scene.remove(ent.ThreeScene.scene);
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
