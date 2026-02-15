import React from 'react';
import { useGame } from '../services/gameState';

const GameOverScreen: React.FC = () => {
  const { state, dispatch } = useGame();

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #37474f 0%, #263238 100%)',
      textAlign: 'center', padding: '20px',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '8px' }}>
        &#x1F3D6;&#xFE0F;&#x1F4A4;&#x1F9AD;
      </div>
      <h1 className="fredoka" style={{ color: '#f44336', fontSize: '2rem', margin: '0 0 8px 0' }}>
        OH NO!
      </h1>
      <p style={{ color: '#b0bec5', fontSize: '0.95rem', maxWidth: '300px', marginBottom: '16px' }}>
        Salty is too tired to continue. Time to rest on the beach and try again!
      </p>
      <p style={{ color: '#78909c', fontSize: '0.8rem', marginBottom: '12px' }}>
        Level {state.player.level} | &#x1F41A; {state.player.shells} shells saved
      </p>
      <button
        className="btn btn-red"
        onClick={() => dispatch({ type: 'GAME_OVER_RETRY' })}
      >
        Try Again
      </button>
    </div>
  );
};

export default GameOverScreen;
