import { System } from 'becs';
import lightCannonThumbnailSrc from '../images/light-cannon-shell-four-pack-thumbnail.png';

const lightCannonBg = document.querySelector('.light-cannon-bg');

lightCannonBg.style.backgroundImage = 'url("/' + lightCannonThumbnailSrc + '")';

const healthBarFg = document.querySelector('.health-bar-fg');
const lightCannonFg = document.querySelector('.light-cannon-fg');

const hudSystem = new System(
  [
    ['Tank', 'PlayerTank', 'Shootable']
  ],
  ([entities], scene) => {
    const dt = scene.globals.deltaTime;
    const dts = dt * 1e-3;

    const [ent] = entities;
    if (!ent) {
      // Player is dead
      healthBarFg.style.display = 'none';
      return;
    }

    const healthRatio = ent.Shootable.health / ent.Tank.maxHealth;
    healthBarFg.style.width = 40 * healthRatio + 'vw';
    healthBarFg.style.display = 'block';

    lightCannonFg.innerHTML = ent.Tank.ammo;
  }
);

export default hudSystem;
