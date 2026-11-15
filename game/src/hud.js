export function createHUD() {
  const elHealth = document.getElementById('stat-health');
  const elArmor = document.getElementById('stat-armor');
  const elMoney = document.getElementById('stat-money');
  const elAmmoMag = document.getElementById('ammo-mag');
  const elAmmoReserve = document.getElementById('ammo-reserve');
  const elWeaponName = document.getElementById('weapon-name');
  const elTimer = document.getElementById('round-timer');
  const elScoreCT = document.getElementById('score-ct');
  const elScoreT = document.getElementById('score-t');
  const elKillFeed = document.getElementById('kill-feed');
  const elRoundBanner = document.getElementById('round-banner');
  const elHitmarker = document.getElementById('hitmarker');
  const elStartOverlay = document.getElementById('start-overlay');
  const elBuyMenu = document.getElementById('buy-menu');
  const elBuyItemsList = document.getElementById('buy-items-list');

  function updateStats(player, weapon, rounds) {
    if (elHealth) elHealth.textContent = Math.max(0, Math.round(player.health));
    if (elArmor) elArmor.textContent = Math.round(player.armor);
    if (elMoney) elMoney.textContent = `$${player.money}`;

    const w = weapon.getActive();
    if (elAmmoMag) elAmmoMag.textContent = w.mag;
    if (elAmmoReserve) elAmmoReserve.textContent = `/ ${w.reserve}`;
    if (elWeaponName) elWeaponName.textContent = w.name;

    if (elTimer) {
      const mins = Math.floor(rounds.timer / 60);
      const secs = Math.floor(rounds.timer % 60);
      elTimer.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    if (elScoreCT) elScoreCT.textContent = rounds.scoreCT;
    if (elScoreT) elScoreT.textContent = rounds.scoreT;
  }

  function showHitmarker() {
    if (!elHitmarker) return;
    elHitmarker.classList.add('on');
    setTimeout(() => elHitmarker.classList.remove('on'), 90);
  }

  function addKillMessage(text) {
    if (!elKillFeed) return;
    const div = document.createElement('div');
    div.className = 'kill-item';
    div.innerHTML = text;
    elKillFeed.appendChild(div);
    setTimeout(() => div.remove(), 4000);
  }

  function showRoundBanner(text) {
    if (!elRoundBanner) return;
    elRoundBanner.textContent = text;
    elRoundBanner.classList.add('show');
    setTimeout(() => elRoundBanner.classList.remove('show'), 3000);
  }

  function setOverlayVisible(visible) {
    if (elStartOverlay) {
      if (visible) elStartOverlay.removeAttribute('hidden');
      else elStartOverlay.setAttribute('hidden', '');
    }
  }

  function setBuyMenuVisible(visible, weapons, onBuy) {
    if (!elBuyMenu) return;
    if (visible) {
      elBuyMenu.removeAttribute('hidden');
      if (elBuyItemsList) {
        elBuyItemsList.innerHTML = '';
        weapons.forEach((w, idx) => {
          if (w.cost > 0) {
            const item = document.createElement('div');
            item.className = 'buy-item';
            item.innerHTML = `<span class="buy-item-name">${w.name}</span><span class="buy-item-price">$${w.cost}</span>`;
            item.onclick = () => {
              if (onBuy(idx, w.cost)) {
                setBuyMenuVisible(false);
              }
            };
            elBuyItemsList.appendChild(item);
          }
        });
      }
    } else {
      elBuyMenu.setAttribute('hidden', '');
    }
  }

  return {
    updateStats,
    showHitmarker,
    addKillMessage,
    showRoundBanner,
    setOverlayVisible,
    setBuyMenuVisible
  };
}
