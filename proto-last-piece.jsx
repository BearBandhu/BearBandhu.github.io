const { useState, useEffect, useCallback, useRef } = React;

const ROWS = 8;
const COLS = 5;

// Core stats and visuals
const ICONS = {
  player: '♔',
  king: '♔', 
  pawn: '♟',
  knight: '♞',
  bishop: '♝',
  rook: '♜',
  rock: '⛰️'
};

const STATS = {
  player: { def: 4 }, 
  pawn:   { def: 3 }, 
  knight: { def: 4 }, 
  bishop: { def: 4 }, 
  rook:   { def: 5 }, 
};

// Rock-Paper-Scissors Type Advantages (Negative numbers lower enemy defense)
const ADVANTAGES = {
  bishop: { rook: -2 },   // Bishop outmaneuvers Rook
  rook: { knight: -2 },   // Rook boxes in Knight
  knight: { bishop: -2 }, // Knight jumps Bishop
  king: { pawn: -1 }      // King easily handles Pawns
};

const DIRS = {
  king: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]],
  knight: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
  rook: [[-1, 0], [1, 0], [0, -1], [0, 1]],
  bishop: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
};

const TheLastPiece = () => {
  const [player, setPlayer] = useState({ r: 7, c: 2 });
  const [enemies, setEnemies] = useState([]);
  const [rocks, setRocks] = useState([]);
  const [floor, setFloor] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [validMoves, setValidMoves] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Stance Inventory State (Max 2, Single-Use)
  const [inventory, setInventory] = useState([]); 
  const [selectedSlot, setSelectedSlot] = useState(null); 

  // Reroll Resource State (Capped at 5)
  const [focusState, setFocusState] = useState(0);
  const focusRef = useRef(0);
  const setFocus = useCallback((val) => {
    const cappedVal = Math.max(0, Math.min(5, val)); 
    focusRef.current = cappedVal;
    setFocusState(cappedVal);
  }, []);

  // Async inline rolling animation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [inlineRoll, setInlineRoll] = useState(null);

  const addLog = useCallback((msg, type = 'neutral') => {
    setLogs(prev => [{ id: Math.random(), msg, type }, ...prev].slice(0, 4));
  }, []);

  const executeRoll = async (r, c, targetDef, isPlayer, advantageMsg = null) => {
    let rollSuccess = false;
    let finalRollResult = 0;

    while (true) {
      const { finalRoll, isSuccess } = await new Promise(resolve => {
        setInlineRoll({ r, c, targetDef, advantageMsg, currentRoll: 1, phase: 'rolling', isPlayer, isSuccess: false });

        let ticks = 0;
        const interval = setInterval(() => {
          ticks++;
          setInlineRoll(prev => ({ ...prev, currentRoll: Math.floor(Math.random() * 6) + 1 }));
          
          if (ticks > 15) { 
            const res = Math.floor(Math.random() * 6) + 1;
            const succ = res >= targetDef;
            clearInterval(interval);
            setInlineRoll(prev => ({ ...prev, currentRoll: res, phase: 'result', isSuccess: succ }));
            
            setTimeout(() => {
              resolve({ finalRoll: res, isSuccess: succ });
            }, 800); 
          }
        }, 50);
      });

      rollSuccess = isSuccess;
      finalRollResult = finalRoll;

      const isBadOutcomeForPlayer = (isPlayer && !isSuccess) || (!isPlayer && isSuccess);

      if (isBadOutcomeForPlayer && focusRef.current > 0) {
        const wantsReroll = await new Promise(resolve => {
          setInlineRoll(prev => ({ ...prev, phase: 'promptReroll', resolvePrompt: resolve }));
        });

        if (wantsReroll) {
          setFocus(focusRef.current - 1);
          addLog(`Used 1 ✨ Focus to reroll!`, 'neutral');
          continue; 
        } else {
          break; 
        }
      } else {
        break; 
      }
    }

    setInlineRoll(null);
    return { finalRoll: finalRollResult, isSuccess: rollSuccess };
  };

  const generateFloor = useCallback((currentFloor, startingCol) => {
    const newEnemies = [];
    const newRocks = [];
    const occupied = new Set([`7-${startingCol}`]); 
    
    const isFree = (r, c) => !occupied.has(`${r}-${c}`);
    const markOccupied = (r, c) => occupied.add(`${r}-${c}`);

    const numRocks = Math.min(2 + Math.floor(currentFloor / 3), 6);
    for (let i = 0; i < numRocks; i++) {
      let r = Math.floor(Math.random() * 6) + 1; 
      let c = Math.floor(Math.random() * COLS);
      if (isFree(r, c)) {
        newRocks.push({ r, c });
        markOccupied(r, c);
      }
    }

    const numEnemies = Math.min(3 + Math.floor(currentFloor / 2), 8);
    for (let i = 0; i < numEnemies; i++) {
      let r = Math.floor(Math.random() * 5) + 1; 
      let c = Math.floor(Math.random() * COLS);
      
      if (isFree(r, c)) {
        let type = 'pawn';
        const rand = Math.random();
        if (currentFloor > 2 && rand > 0.6) type = 'knight';
        else if (currentFloor > 3 && rand > 0.8) type = 'bishop';
        else if (currentFloor > 4 && rand > 0.9) type = 'rook';

        newEnemies.push({ id: Math.random().toString(36).substr(2, 9), type, r, c });
        markOccupied(r, c);
      }
    }
    return { newEnemies, newRocks };
  }, []);

  const calculateEnemyMoves = useCallback((currentEnemies, currentRocks, playerPos) => {
    const isRock = (r, c) => currentRocks.some(rk => rk.r === r && rk.c === c);
    const dist = (r1, c1, r2, c2) => Math.abs(r1 - r2) + Math.abs(c1 - c2);
    const claimed = new Set(currentEnemies.map(e => `${e.r}-${e.c}`));
    const isClaimed = (r, c) => claimed.has(`${r}-${c}`);

    return currentEnemies.map(enemy => {
      let intent = { r: enemy.r, c: enemy.c }; 
      claimed.delete(`${enemy.r}-${enemy.c}`); 

      const isBlocked = (r, c) => isRock(r, c) || isClaimed(r, c);

      if (enemy.type === 'pawn') {
        const canAttackLeft = (enemy.r + 1 === playerPos.r && enemy.c - 1 === playerPos.c);
        const canAttackRight = (enemy.r + 1 === playerPos.r && enemy.c + 1 === playerPos.c);

        if (canAttackLeft) {
          intent = { r: enemy.r + 1, c: enemy.c - 1 };
        } else if (canAttackRight) {
          intent = { r: enemy.r + 1, c: enemy.c + 1 };
        } else {
          let target = { r: enemy.r + 1, c: enemy.c };
          const targetIsPlayer = target.r === playerPos.r && target.c === playerPos.c;

          if (target.r < ROWS && !isBlocked(target.r, target.c) && !targetIsPlayer) {
            intent = target;
          } else {
            let options = [];
            if (target.r < ROWS) { 
              if (enemy.c - 1 >= 0 && !isBlocked(target.r, enemy.c - 1) && !(target.r === playerPos.r && enemy.c - 1 === playerPos.c)) options.push({ r: target.r, c: enemy.c - 1 });
              if (enemy.c + 1 < COLS && !isBlocked(target.r, enemy.c + 1) && !(target.r === playerPos.r && enemy.c + 1 === playerPos.c)) options.push({ r: target.r, c: enemy.c + 1 });
            }
            if (options.length === 0) { 
              if (enemy.c - 1 >= 0 && !isBlocked(enemy.r, enemy.c - 1) && !(enemy.r === playerPos.r && enemy.c - 1 === playerPos.c)) options.push({ r: enemy.r, c: enemy.c - 1 });
              if (enemy.c + 1 < COLS && !isBlocked(enemy.r, enemy.c + 1) && !(enemy.r === playerPos.r && enemy.c + 1 === playerPos.c)) options.push({ r: enemy.r, c: enemy.c + 1 });
            }
            if (options.length > 0) {
              options.sort((a, b) => dist(a.r, a.c, playerPos.r, playerPos.c) - dist(b.r, b.c, playerPos.r, playerPos.c));
              intent = options[0];
            }
          }
        }
      } else if (enemy.type === 'knight') {
        const jumps = DIRS.knight;
        const validJumps = jumps
          .map(([dr, dc]) => ({ r: enemy.r + dr, c: enemy.c + dc }))
          .filter(pos => pos.r >= 0 && pos.r < ROWS && pos.c >= 0 && pos.c < COLS && !isBlocked(pos.r, pos.c));
        
        if (validJumps.length > 0) {
          validJumps.sort((a, b) => dist(a.r, a.c, playerPos.r, playerPos.c) - dist(b.r, b.c, playerPos.r, playerPos.c));
          intent = validJumps[0]; 
        }
      } else if (enemy.type === 'bishop') {
        let bestDist = Infinity;
        let bestPos = null;
        DIRS.bishop.forEach(([dr, dc]) => {
          let nr = enemy.r + dr, nc = enemy.c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !isBlocked(nr, nc)) {
            let d = dist(playerPos.r, playerPos.c, nr, nc);
            if (d < bestDist) {
              bestDist = d;
              bestPos = { r: nr, c: nc };
            }
          }
        });
        if (bestPos) intent = bestPos;
      } else if (enemy.type === 'rook') {
        let dr = playerPos.r > enemy.r ? 1 : playerPos.r < enemy.r ? -1 : 0;
        let dc = playerPos.c > enemy.c ? 1 : playerPos.c < enemy.c ? -1 : 0;
        let possibleIntents = [];
        if (dr !== 0 && !isBlocked(enemy.r + dr, enemy.c)) possibleIntents.push({ r: enemy.r + dr, c: enemy.c });
        if (dc !== 0 && !isBlocked(enemy.r, enemy.c + dc)) possibleIntents.push({ r: enemy.r, c: enemy.c + dc });
        if (possibleIntents.length > 0) intent = possibleIntents[0]; 
      }
      
      claimed.add(`${intent.r}-${intent.c}`);
      return { ...enemy, intent };
    });
  }, []);

  useEffect(() => {
    const { newEnemies, newRocks } = generateFloor(1, 2);
    setRocks(newRocks);
    setEnemies(newEnemies);
    addLog('Advantages: Bishop>Rook, Rook>Knight, Knight>Bishop!', 'good');
  }, [generateFloor, addLog]);

  useEffect(() => {
    if (gameOver || isProcessing) {
      setValidMoves([]);
      return;
    }

    const moves = [];
    const isRock = (r, c) => rocks.some(rk => rk.r === r && rk.c === c);
    const isEnemy = (r, c) => enemies.some(e => e.r === r && e.c === c);
    
    const activeStance = selectedSlot !== null ? inventory[selectedSlot] : 'king';

    if (activeStance === 'king' || activeStance === 'knight') {
      DIRS[activeStance].forEach(([dr, dc]) => {
        const nr = player.r + dr;
        const nc = player.c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !isRock(nr, nc)) {
          moves.push({ r: nr, c: nc });
        }
      });
    } else if (activeStance === 'rook' || activeStance === 'bishop') {
      const activeDirs = activeStance === 'rook' ? DIRS.rook : DIRS.bishop;
      activeDirs.forEach(([dr, dc]) => {
        let nr = player.r + dr;
        let nc = player.c + dc;
        while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          if (isRock(nr, nc)) break; 
          moves.push({ r: nr, c: nc });
          if (isEnemy(nr, nc)) break; 
          nr += dr;
          nc += dc;
        }
      });
    }
    
    setValidMoves(moves);
  }, [player, inventory, selectedSlot, enemies, rocks, gameOver, isProcessing]);

  const handleMove = async (targetR, targetC) => {
    if (gameOver || isProcessing) return;
    setIsProcessing(true);

    let nextPlayerPos = { r: targetR, c: targetC };
    let targetEnemy = enemies.find(e => e.r === targetR && e.c === targetC);
    let remainingEnemies = [...enemies];
    
    const activeStance = selectedSlot !== null ? inventory[selectedSlot] : 'king';

    // Process inventory consumption
    let newInventory = [...inventory];
    if (selectedSlot !== null) {
      newInventory.splice(selectedSlot, 1); 
    }

    // 1. Resolve Player Action
    if (targetEnemy) {
      let required = STATS[targetEnemy.type].def;
      let advantageMsg = null;

      // Apply Type Advantage
      if (ADVANTAGES[activeStance] && ADVANTAGES[activeStance][targetEnemy.type]) {
        required += ADVANTAGES[activeStance][targetEnemy.type];
        advantageMsg = "WEAKNESS!";
      }

      required = Math.max(1, Math.min(6, required)); // Bound between 1 and 6

      const { finalRoll, isSuccess } = await executeRoll(player.r, player.c, required, true, advantageMsg);
      
      if (isSuccess) {
        setFocus(focusRef.current + 1);
        addLog(`Rolled ${finalRoll}. 🎯 HIT! (+1 ✨)`, 'good');
        
        remainingEnemies = remainingEnemies.filter(e => e.id !== targetEnemy.id);
        
        // Add special pieces to inventory
        if (['knight', 'rook', 'bishop'].includes(targetEnemy.type)) {
          newInventory.push(targetEnemy.type);
          if (newInventory.length > 2) newInventory.shift(); 
        }
      } else {
        addLog(`Rolled ${finalRoll} (Needs ${required}+) ❌ MISS!`, 'bad');
        nextPlayerPos = { r: player.r, c: player.c }; // Bump back
      }
    }

    setInventory(newInventory);
    setSelectedSlot(null);

    // 2. Resolve Enemy Actions
    let playerKilled = false;
    let finalEnemies = [];
    let promotionLogs = [];

    const enemiesWithIntent = calculateEnemyMoves(remainingEnemies, rocks, nextPlayerPos);

    for (let enemy of enemiesWithIntent) {
      if (playerKilled) break;

      let finalPos = { r: enemy.intent.r, c: enemy.intent.c };
      
      if (finalPos.r === nextPlayerPos.r && finalPos.c === nextPlayerPos.c) {
        const eReq = STATS.player.def;
        
        const { finalRoll, isSuccess } = await executeRoll(enemy.r, enemy.c, eReq, false);
        
        if (isSuccess) {
          addLog(`${enemy.type.toUpperCase()} rolled ${finalRoll}. 💀 LETHAL!`, 'bad');
          playerKilled = true;
        } else {
          addLog(`${enemy.type.toUpperCase()} rolled ${finalRoll}. 🛡️ DODGED!`, 'good');
          finalPos = { r: enemy.r, c: enemy.c }; // Bump back
        }
      }
      
      if (finalPos.r < ROWS && finalPos.r >= 0) {
        let currentType = enemy.type;
        if (currentType === 'pawn' && finalPos.r === ROWS - 1) {
          const promotions = ['knight', 'rook', 'bishop'];
          currentType = promotions[Math.floor(Math.random() * promotions.length)];
          promotionLogs.push(`Pawn promoted to ${currentType.toUpperCase()}!`);
        }
        finalEnemies.push({ ...enemy, r: finalPos.r, c: finalPos.c, type: currentType });
      }
    }

    promotionLogs.forEach(msg => addLog(msg, 'bad'));

    if (playerKilled) {
      setPlayer(nextPlayerPos);
      setEnemies(finalEnemies);
      setGameOver(true);
      setIsProcessing(false);
      return;
    }

    // 3. Board Advance check
    if (finalEnemies.length === 0) {
      const nextFloor = floor + 1;
      setFloor(nextFloor);
      setPlayer({ r: 7, c: nextPlayerPos.c });
      
      const { newEnemies, newRocks } = generateFloor(nextFloor, nextPlayerPos.c);
      setRocks(newRocks);
      setEnemies(newEnemies);
      addLog(`Floor Cleared! Advanced to Floor ${nextFloor}!`, 'good');
    } else {
      setPlayer(nextPlayerPos);
      setEnemies(finalEnemies);
    }
    
    setIsProcessing(false);
  };

  const restartGame = () => {
    setFloor(1);
    setPlayer({ r: 7, c: 2 });
    setInventory([]);
    setSelectedSlot(null);
    setGameOver(false);
    setIsProcessing(false);
    setInlineRoll(null);
    setFocus(0);
    setLogs([]);
    const { newEnemies, newRocks } = generateFloor(1, 2);
    setRocks(newRocks);
    setEnemies(newEnemies);
    addLog('Game Restarted. Good luck!', 'neutral');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-slate-200 select-none touch-manipulation pb-8">
      <div className="w-full max-w-sm p-4 flex flex-col gap-3 relative">
        
        {/* Header UI */}
        <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
          <div>
            <h1 className="text-xl font-black tracking-wider text-slate-100">THE LAST PIECE</h1>
            <div className="flex items-center gap-3 text-sm mt-1">
              <span className="text-emerald-400 font-mono">Floor {floor}</span>
              <span className="text-slate-400 font-mono">Def: {STATS.player.def}+</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Focus</div>
            <div className={`font-mono font-bold text-lg ${focusState === 5 ? 'text-amber-300 animate-pulse' : 'text-amber-500'}`}>
              ✨ {focusState}/5
            </div>
          </div>
        </div>

        {/* Inventory Bar */}
        <div className="flex gap-2">
          {/* Default King Move */}
          <div 
             onClick={() => !isProcessing && setSelectedSlot(null)}
             className={`flex-1 py-1.5 px-2 rounded-lg border-2 flex items-center justify-center transition-all ${
               selectedSlot === null 
                 ? 'bg-emerald-900/40 border-emerald-500 shadow-[inset_0_0_10px_rgba(16,185,129,0.3)] text-emerald-400 cursor-default scale-100' 
                 : 'bg-slate-800 border-slate-700 text-slate-400 cursor-pointer hover:bg-slate-700 scale-95 opacity-80'
             }`}
          >
             <span className="text-xl leading-none drop-shadow-md">{ICONS.king}</span>
             <span className="ml-2 text-[10px] uppercase tracking-widest font-bold">King</span>
          </div>

          {/* Slots 1 & 2 */}
          {[0, 1].map(index => {
             const item = inventory[index];
             const isSelected = selectedSlot === index;
             return (
               <div 
                 key={index}
                 onClick={() => !isProcessing && item && setSelectedSlot(isSelected ? null : index)}
                 className={`flex-1 py-1.5 px-2 rounded-lg border-2 flex items-center justify-center transition-all ${
                   !item 
                     ? 'bg-slate-900/50 border-slate-800/50 opacity-40 border-dashed' 
                     : isSelected 
                       ? 'bg-indigo-900/60 border-indigo-500 shadow-[inset_0_0_10px_rgba(99,102,241,0.4)] text-indigo-300 cursor-pointer scale-100' 
                       : 'bg-slate-800 border-slate-600 text-slate-300 cursor-pointer hover:bg-slate-700 scale-95 opacity-90'
                 }`}
               >
                 {item ? (
                   <>
                     <span className="text-xl leading-none drop-shadow-md">{ICONS[item]}</span>
                     <span className="ml-1.5 text-[10px] uppercase tracking-widest font-bold">{item}</span>
                   </>
                 ) : (
                   <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold py-1">Empty</span>
                 )}
               </div>
             )
          })}
        </div>

        {/* The Grid */}
        <div className="bg-slate-900 border-[3px] border-slate-800 rounded-xl p-1 relative shadow-2xl mt-1">
          <div className="grid grid-cols-5 grid-rows-8 gap-1 relative z-10">
            {Array.from({ length: ROWS * COLS }).map((_, i) => {
              const r = Math.floor(i / COLS);
              const c = i % COLS;
              const isDark = (r + c) % 2 === 1;
              
              const isPlayer = player.r === r && player.c === c;
              const enemyHere = enemies.find(e => e.r === r && e.c === c);
              const rockHere = rocks.find(rk => rk.r === r && rk.c === c);
              const isValidMove = validMoves.some(m => m.r === r && m.c === c);
              const isRollingHere = inlineRoll && inlineRoll.r === r && inlineRoll.c === c;

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => isValidMove && !isProcessing ? handleMove(r, c) : null}
                  className={`
                    w-full aspect-square flex items-center justify-center text-3xl transition-all duration-200 rounded-sm relative
                    ${isDark ? 'bg-slate-800/80' : 'bg-slate-700/80'}
                    ${isValidMove && !isProcessing ? 'cursor-pointer hover:bg-emerald-900/50 shadow-[inset_0_0_10px_rgba(52,211,153,0.2)]' : ''}
                    ${isProcessing && !isRollingHere ? 'opacity-50 grayscale-[50%]' : ''}
                  `}
                >
                  {isValidMove && !isProcessing && (
                     <div className="absolute w-3 h-3 rounded-full opacity-80 animate-pulse bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  )}

                  {/* Inline Dice Roll & Reroll Prompt Overlay */}
                  {isRollingHere && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center animate-in zoom-in duration-150">
                      <div className={`w-[145%] aspect-square bg-slate-900/95 backdrop-blur-md border-2 flex flex-col items-center justify-center rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-all duration-300 ${
                        inlineRoll.phase === 'result' || inlineRoll.phase === 'promptReroll'
                          ? (inlineRoll.isSuccess ? 'border-emerald-500 scale-110 z-50' : 'border-red-500 scale-110 z-50')
                          : 'border-slate-500 scale-100 z-50'
                      }`}>
                        
                        {inlineRoll.phase === 'promptReroll' ? (
                          <div className="flex flex-col gap-1.5 items-center w-full px-1.5 z-50">
                            <div className="text-[9px] text-slate-200 uppercase font-black text-center leading-tight mt-1">
                               {inlineRoll.isPlayer ? 'Missed!' : 'Lethal Hit!'}
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); inlineRoll.resolvePrompt(true); }} 
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] py-1.5 rounded shadow-lg font-bold tracking-wider active:scale-95 transition-all"
                            >
                               REROLL ({focusState}✨)
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); inlineRoll.resolvePrompt(false); }} 
                              className="w-full bg-slate-700 hover:bg-slate-600 text-white text-[9px] py-1 rounded shadow active:scale-95 transition-all mb-1"
                            >
                               Accept
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-[-4px]">Need {inlineRoll.targetDef}+</div>
                            {inlineRoll.advantageMsg && (
                              <div className="text-[8px] text-amber-400 font-black uppercase tracking-widest mt-1 mb-[-4px] animate-pulse">
                                {inlineRoll.advantageMsg}
                              </div>
                            )}
                            <div className={`text-4xl font-black tabular-nums ${
                                inlineRoll.phase === 'result'
                                  ? (inlineRoll.isSuccess ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]')
                                  : 'text-white'
                              }`}>
                              {inlineRoll.currentRoll}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="relative z-10 flex items-center justify-center w-full h-full pointer-events-none">
                    {rockHere && (
                      <span className="text-slate-500 text-2xl drop-shadow-md">{ICONS.rock}</span>
                    )}
                    {isPlayer && (
                      <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] z-20 text-4xl">
                        {ICONS.player}
                      </span>
                    )}
                    {enemyHere && !isPlayer && (
                      <div className="relative">
                        <span className="text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)] text-4xl">
                          {ICONS[enemyHere.type]}
                        </span>
                        <div className="absolute -bottom-1 -right-2 bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-300 w-4 h-4 flex items-center justify-center rounded-full shadow-lg">
                          {STATS[enemyHere.type].def}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Log UI */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-2 h-24 overflow-hidden flex flex-col justify-end shadow-inner mt-1">
          <div className="flex flex-col gap-0.5 justify-end h-full">
            {logs.slice().reverse().map((log, i) => (
              <div 
                key={log.id} 
                className={`text-[11px] font-mono truncate transition-opacity duration-300 ${
                  log.type === 'good' ? 'text-emerald-400' : 
                  log.type === 'bad' ? 'text-red-400' : 'text-slate-400'
                }`}
                style={{ opacity: 1 - (i * 0.2) }}
              >
                {'>'} {log.msg}
              </div>
            ))}
          </div>
        </div>

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-50 rounded-xl backdrop-blur-sm border border-slate-800 animate-in fade-in zoom-in duration-300">
            <h2 className="text-4xl font-black text-red-500 mb-2 drop-shadow-lg">DEFEAT</h2>
            <p className="text-slate-300 mb-8 font-mono">Reached Floor {floor}</p>
            <button 
              onClick={restartGame}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-full font-bold uppercase tracking-widest transition-colors border border-slate-600 shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<TheLastPiece />);
