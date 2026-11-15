export function createRoundManager(onRoundEnd) {
  let timer = 100;
  let roundNum = 1;
  let scoreCT = 0;
  let scoreT = 0;
  let phase = 'buy'; // buy, active, ended

  function resetRound(winner) {
    if (winner === 'CT') scoreCT++;
    if (winner === 'T') scoreT++;
    roundNum++;
    timer = 100;
    phase = 'buy';
    if (onRoundEnd) onRoundEnd(winner);
  }

  function update(dt, bots) {
    if (phase === 'ended') return;

    timer -= dt;
    if (timer <= 0) {
      // Time out: CT wins defense
      resetRound('CT');
      return;
    }

    // Check elimination
    const ctAlive = bots.filter(b => b.team === 'CT' && b.alive).length;
    const tAlive = bots.filter(b => b.team === 'T' && b.alive).length;

    if (tAlive === 0) {
      resetRound('CT');
    } else if (ctAlive === 0) {
      resetRound('T');
    }
  }

  return {
    get timer() { return timer; },
    get roundNum() { return roundNum; },
    get scoreCT() { return scoreCT; },
    get scoreT() { return scoreT; },
    get phase() { return phase; },
    setPhase(p) { phase = p; },
    update,
    resetRound
  };
}
