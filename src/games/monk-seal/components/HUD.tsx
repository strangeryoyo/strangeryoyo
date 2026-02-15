import React from 'react';
import { useGame } from '../services/gameState';
import { getEquipment } from '../data/equipment';

const HUD: React.FC = () => {
  const { state, dispatch } = useGame();
  const { player, regions } = state;

  const tool = player.equippedTool ? getEquipment(player.equippedTool) : null;
  const cleanedCount = regions.filter(r => r.cleaned).length;
  const totalRegions = regions.length;
  const xpPercent = player.xpToNext > 0 ? (player.xp / player.xpToNext) * 100 : 0;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      background: '#01579b', color: 'white', padding: '6px 12px',
      fontFamily: "'Fredoka One', cursive", fontSize: '0.75rem',
      flexWrap: 'wrap', minHeight: '36px',
    }}>
      {/* Level */}
      <span>Lv.{player.level}</span>

      {/* HP */}
      <span>&#x2764;&#xFE0F;</span>
      <div style={{
        width: '60px', height: '10px', background: '#1a237e',
        borderRadius: '5px', overflow: 'hidden', border: '1px solid #4fc3f7',
      }}>
        <div style={{
          width: `${(player.hp / player.maxHp) * 100}%`, height: '100%',
          background: player.hp > player.maxHp * 0.3 ? '#4caf50' : '#f44336',
          transition: 'width 0.4s',
        }} />
      </div>
      <span style={{ fontSize: '0.65rem' }}>{player.hp}/{player.maxHp}</span>

      {/* XP bar */}
      <span style={{ fontSize: '0.65rem', marginLeft: '4px' }}>XP</span>
      <div style={{
        width: '40px', height: '8px', background: '#1a237e',
        borderRadius: '4px', overflow: 'hidden', border: '1px solid #4fc3f7',
      }}>
        <div style={{
          width: `${xpPercent}%`, height: '100%',
          background: '#ffeb3b', transition: 'width 0.4s',
        }} />
      </div>

      {/* Shells */}
      <span style={{ marginLeft: '4px' }}>&#x1F41A; {player.shells}</span>

      {/* Equipped tool */}
      {tool && <span style={{ marginLeft: '4px' }}>{tool.emoji} {tool.name}</span>}

      {/* Progress */}
      <span style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>
        &#x1F30A; {cleanedCount}/{totalRegions} Clean
      </span>

      {/* Shop button (only on map) */}
      {state.screen === 'MAP' && (
        <button
          onClick={() => dispatch({ type: 'OPEN_SHOP' })}
          style={{
            background: '#ff9800', color: 'white', border: 'none',
            borderRadius: '6px', padding: '2px 8px', cursor: 'pointer',
            fontFamily: "'Fredoka One', cursive", fontSize: '0.7rem',
          }}
        >
          &#x1F6D2; Shop
        </button>
      )}
    </div>
  );
};

export default HUD;
