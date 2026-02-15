import React from 'react';
import { useGame } from '../services/gameState';

const VictoryScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const region = state.battle ? state.regions.find(r => r.id === state.battle!.regionId) : null;

  return (
    <div className="slide-up" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #e8f5e9 0%, #c8e6c9 100%)',
      textAlign: 'center', padding: '20px',
    }}>
      <h1 className="fredoka" style={{ color: '#2e7d32', fontSize: '2rem', margin: '0 0 4px 0' }}>
        VICTORY!
      </h1>

      <div style={{ fontSize: '3rem', margin: '4px 0' }}>
        &#x1F41A;&#x2728;&#x1F9AD;&#x2728;&#x1F41A;
      </div>

      {state.battle && (
        <p style={{ color: '#388e3c', fontSize: '0.9rem', margin: '4px 0' }}>
          Defeated {state.battle.enemy.name}!
        </p>
      )}

      {region && (
        <div style={{
          background: 'white', borderRadius: '12px', padding: '10px 16px',
          margin: '8px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#006064' }}>
            {region.name}
          </p>
          <div style={{
            width: '150px', height: '10px', background: '#e0e0e0',
            borderRadius: '5px', overflow: 'hidden', margin: '4px auto',
          }}>
            <div style={{
              width: `${100 - (region.pollution / region.maxPollution) * 100}%`,
              height: '100%', background: '#4caf50', transition: 'width 0.5s',
            }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: '#666' }}>
            {region.cleaned ? '100% Clean!' : `${Math.round(100 - (region.pollution / region.maxPollution) * 100)}% cleaned`}
          </p>
        </div>
      )}

      <button
        className="btn btn-green"
        style={{ marginTop: '8px' }}
        onClick={() => dispatch({ type: 'VICTORY_CONTINUE' })}
      >
        Continue
      </button>
    </div>
  );
};

export default VictoryScreen;
