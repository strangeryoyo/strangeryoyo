import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../services/gameState';
import { getRandomQuestion } from '../data/questions';
import { getEquipment } from '../data/equipment';
import { soundManager } from '../services/sound';
import { BASE_XP_REWARD, BASE_SHELL_REWARD, COMBO_BONUS_SHELLS, POLLUTION_PER_WIN, BASE_ENEMY_ATK, ENEMY_ATK_VARIANCE } from '../constants';
import QuestionOverlay from './QuestionOverlay';

const Battle: React.FC = () => {
  const { state, dispatch } = useGame();
  const battle = state.battle;
  const [playerShake, setPlayerShake] = useState(false);
  const [enemyShake, setEnemyShake] = useState(false);
  const [pendingAction, setPendingAction] = useState(false);

  const triggerShake = (target: 'player' | 'enemy') => {
    if (target === 'player') {
      setPlayerShake(true);
      setTimeout(() => setPlayerShake(false), 400);
    } else {
      setEnemyShake(true);
      setTimeout(() => setEnemyShake(false), 400);
    }
  };

  // Handle enemy turn
  useEffect(() => {
    if (!battle || battle.turnPhase !== 'ENEMY_TURN') return;
    const timer = setTimeout(() => {
      const dmg = battle.enemy.atk + Math.floor(Math.random() * ENEMY_ATK_VARIANCE);
      soundManager.enemyHit();
      triggerShake('player');
      dispatch({ type: 'ENEMY_ATTACK', damage: dmg });
    }, 600);
    return () => clearTimeout(timer);
  }, [battle?.turnPhase]);

  // Check for enemy defeated or player defeated after state updates
  useEffect(() => {
    if (!battle) return;
    if (battle.turnPhase === 'ACTION_SELECT') {
      if (battle.enemy.hp <= 0) {
        // Victory
        const tool = state.player.equippedTool ? getEquipment(state.player.equippedTool) : null;
        const cleanPower = tool?.cleanPower || 15;
        const shellBonus = battle.comboCount * COMBO_BONUS_SHELLS;
        soundManager.victory();
        dispatch({
          type: 'ENEMY_DEFEATED',
          xpGain: BASE_XP_REWARD + battle.comboCount * 5,
          shellGain: BASE_SHELL_REWARD + shellBonus,
          pollutionReduced: POLLUTION_PER_WIN + Math.floor(cleanPower / 3),
        });
        return;
      }
      if (state.player.hp <= 0) {
        soundManager.defeat();
        dispatch({ type: 'PLAYER_DEFEATED' });
        return;
      }
    }
  }, [battle?.enemy.hp, state.player.hp, battle?.turnPhase]);

  const handleAction = useCallback(() => {
    if (!battle || battle.turnPhase !== 'ACTION_SELECT' || pendingAction) return;
    if (battle.enemy.hp <= 0 || state.player.hp <= 0) return;
    setPendingAction(true);
    const region = state.regions.find(r => r.id === battle.regionId);
    const q = getRandomQuestion(battle.enemy.category, region?.difficulty || null, state.usedQuestionIds);
    if (q) {
      soundManager.attack();
      triggerShake('enemy');
      setTimeout(() => {
        dispatch({ type: 'SHOW_QUESTION', question: q });
        setPendingAction(false);
      }, 300);
    } else {
      setPendingAction(false);
    }
  }, [battle, pendingAction, state.usedQuestionIds, state.regions]);

  const handleFlee = () => {
    dispatch({ type: 'OPEN_MAP' });
  };

  if (!battle) return null;

  const hpPercent = (state.player.hp / state.player.maxHp) * 100;
  const enemyHpPercent = (battle.enemy.hp / battle.enemy.maxHp) * 100;
  const isActionPhase = battle.turnPhase === 'ACTION_SELECT' && battle.enemy.hp > 0 && state.player.hp > 0;

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #b3e5fc 0%, #e1f5fe 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Battle stage */}
      <div style={{
        flex: 1, display: 'flex', justifyContent: 'space-around',
        alignItems: 'center', padding: '10px', position: 'relative',
      }}>
        {/* Player */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={`float ${playerShake ? 'shake' : ''}`} style={{ fontSize: '3.5rem' }}>
            &#x1F9AD;
          </div>
          <span className="fredoka" style={{ fontSize: '0.75rem', color: '#006064' }}>Salty</span>
          <div style={{ width: '80px', marginTop: '4px' }} className="hp-bar">
            <div className="hp-bar-fill" style={{
              width: `${hpPercent}%`,
              background: hpPercent > 30 ? '#4caf50' : '#f44336',
            }} />
          </div>
          <span style={{ fontSize: '0.6rem', color: '#666' }}>{state.player.hp}/{state.player.maxHp}</span>
        </div>

        {/* VS */}
        <div className="fredoka" style={{
          fontSize: '1.3rem', color: '#f44336',
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
        }}>VS</div>

        {/* Enemy */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={enemyShake ? 'shake' : ''} style={{ fontSize: '3.5rem' }}>
            {battle.enemy.emoji}
          </div>
          <span className="fredoka" style={{ fontSize: '0.75rem', color: '#006064' }}>{battle.enemy.name}</span>
          <div style={{ width: '80px', marginTop: '4px' }} className="hp-bar">
            <div className="hp-bar-fill" style={{
              width: `${enemyHpPercent}%`,
              background: '#f44336',
            }} />
          </div>
          <span style={{ fontSize: '0.6rem', color: '#666' }}>{battle.enemy.hp}/{battle.enemy.maxHp}</span>
        </div>
      </div>

      {/* Battle log */}
      <div style={{
        background: '#01579b', color: 'white', padding: '6px 12px',
        fontSize: '0.8rem', textAlign: 'center', minHeight: '30px',
      }}>
        {battle.battleLog}
      </div>

      {/* Combo indicator */}
      {battle.comboCount > 0 && (
        <div style={{
          background: '#ff9800', color: 'white', padding: '2px 8px',
          fontSize: '0.7rem', textAlign: 'center', fontWeight: 700,
        }}>
          {battle.comboCount}x Combo!
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '6px', padding: '8px 12px',
        background: 'white', borderTop: '3px solid #01579b',
      }}>
        <button
          className="btn"
          onClick={handleAction}
          disabled={!isActionPhase || pendingAction}
        >
          &#x1F4A5; Bubble Blast
        </button>
        <button
          className="btn btn-green"
          onClick={handleAction}
          disabled={!isActionPhase || pendingAction}
        >
          &#x1F9CA; Fin Smash
        </button>
        <button
          className="btn btn-purple"
          onClick={handleAction}
          disabled={!isActionPhase || pendingAction}
        >
          &#x1F30A; Tail Slap
        </button>
        <button
          className="btn btn-red"
          onClick={handleFlee}
          disabled={!isActionPhase}
        >
          &#x1F3C3; Flee
        </button>
      </div>

      {/* Question overlay */}
      {(battle.turnPhase === 'QUESTION' || battle.turnPhase === 'RESULT') && (
        <QuestionOverlay />
      )}
    </div>
  );
};

export default Battle;
