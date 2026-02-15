import React from 'react';
import { useGame } from '../services/gameState';

const StartScreen: React.FC = () => {
  const { state, dispatch } = useGame();
  const hs = state.highScore;
  const hasScores = hs.totalEnemiesDefeated > 0;

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #4fc3f7 0%, #0288d1 60%, #01579b 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Animated waves background */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', opacity: 0.3 }}>
        <svg viewBox="0 0 800 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0,60 Q100,20 200,60 T400,60 T600,60 T800,60 L800,120 L0,120 Z" fill="#0277bd">
            <animate attributeName="d" dur="4s" repeatCount="indefinite"
              values="M0,60 Q100,20 200,60 T400,60 T600,60 T800,60 L800,120 L0,120 Z;
                      M0,60 Q100,100 200,60 T400,60 T600,60 T800,60 L800,120 L0,120 Z;
                      M0,60 Q100,20 200,60 T400,60 T600,60 T800,60 L800,120 L0,120 Z" />
          </path>
        </svg>
      </div>

      {/* Seal */}
      <div className="float" style={{ fontSize: '5rem', marginBottom: '8px' }}>
        &#x1F9AD;
      </div>

      {/* Title */}
      <h1 className="fredoka" style={{
        color: 'white', fontSize: '2rem', textShadow: '2px 3px 0 #01579b',
        margin: '0 0 4px 0',
      }}>
        Monk Seal Quest
      </h1>
      <p style={{
        color: '#e1f5fe', fontSize: '0.9rem', fontWeight: 600,
        margin: '0 0 16px 0', textAlign: 'center', padding: '0 20px',
      }}>
        Help Salty clean up the world's oceans!
      </p>

      {/* Start button */}
      <button
        className="btn pulse"
        style={{ fontSize: '1.2rem', padding: '12px 32px' }}
        onClick={() => dispatch({ type: 'START_GAME' })}
      >
        START ADVENTURE
      </button>

      {/* High Scores */}
      {hasScores && (
        <div style={{
          marginTop: '14px', background: 'rgba(0,0,0,0.25)',
          borderRadius: '12px', padding: '8px 16px',
          display: 'flex', gap: '16px', flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', color: '#e1f5fe', fontSize: '0.7rem' }}>
            <div style={{ fontSize: '1.1rem' }}>&#x1F3C6;</div>
            <div style={{ fontWeight: 700 }}>Lv.{hs.bestLevel}</div>
            <div style={{ opacity: 0.7 }}>Best Level</div>
          </div>
          <div style={{ textAlign: 'center', color: '#e1f5fe', fontSize: '0.7rem' }}>
            <div style={{ fontSize: '1.1rem' }}>&#x1F30A;</div>
            <div style={{ fontWeight: 700 }}>{hs.mostRegionsCleaned}/20</div>
            <div style={{ opacity: 0.7 }}>Oceans Cleaned</div>
          </div>
          <div style={{ textAlign: 'center', color: '#e1f5fe', fontSize: '0.7rem' }}>
            <div style={{ fontSize: '1.1rem' }}>&#x2694;&#xFE0F;</div>
            <div style={{ fontWeight: 700 }}>{hs.totalEnemiesDefeated}</div>
            <div style={{ opacity: 0.7 }}>Enemies Beaten</div>
          </div>
          <div style={{ textAlign: 'center', color: '#e1f5fe', fontSize: '0.7rem' }}>
            <div style={{ fontSize: '1.1rem' }}>&#x1F525;</div>
            <div style={{ fontWeight: 700 }}>{hs.bestCombo}x</div>
            <div style={{ opacity: 0.7 }}>Best Combo</div>
          </div>
        </div>
      )}

      {/* Decorative emojis */}
      <div style={{
        position: 'absolute', bottom: '15%', left: '10%',
        fontSize: '1.5rem', opacity: 0.5,
      }}>&#x1F41A;</div>
      <div style={{
        position: 'absolute', bottom: '20%', right: '12%',
        fontSize: '1.5rem', opacity: 0.5,
      }}>&#x1F420;</div>
      <div style={{
        position: 'absolute', top: '15%', right: '15%',
        fontSize: '1.2rem', opacity: 0.4,
      }}>&#x2B50;</div>
    </div>
  );
};

export default StartScreen;
