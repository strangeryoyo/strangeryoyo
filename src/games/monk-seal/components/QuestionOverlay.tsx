import React from 'react';
import { useGame } from '../services/gameState';
import { soundManager } from '../services/sound';
import { COMBO_DAMAGE_BONUS, CORRECT_DAMAGE_MULTIPLIER } from '../constants';

const QuestionOverlay: React.FC = () => {
  const { state, dispatch } = useGame();
  const battle = state.battle;
  if (!battle || !battle.currentQuestion) return null;
  const q = battle.currentQuestion;

  const isResult = battle.turnPhase === 'RESULT';

  const handleAnswer = (idx: number) => {
    if (isResult) return;
    dispatch({ type: 'ANSWER_QUESTION', answerIndex: idx });
  };

  const handleContinue = () => {
    if (battle.wasCorrect) {
      const baseDmg = state.player.atk;
      const comboDmg = battle.comboCount * COMBO_DAMAGE_BONUS;
      const totalDmg = Math.round((baseDmg + comboDmg) * CORRECT_DAMAGE_MULTIPLIER);
      soundManager.correct();
      dispatch({ type: 'APPLY_CORRECT_ANSWER', damage: totalDmg });
    } else {
      soundManager.wrong();
      dispatch({ type: 'APPLY_WRONG_ANSWER' });
    }
  };

  return (
    <div className="fade-in" style={{
      position: 'absolute', inset: 0, zIndex: 20,
      background: 'rgba(255,255,255,0.97)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '16px', textAlign: 'center',
    }}>
      {/* Category badge */}
      <span style={{
        background: '#0288d1', color: 'white', padding: '2px 10px',
        borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700,
        marginBottom: '8px', textTransform: 'uppercase',
      }}>
        {q.category}
      </span>

      {/* Question */}
      <h3 className="fredoka" style={{
        fontSize: '0.95rem', color: '#006064',
        margin: '0 0 12px 0', maxWidth: '450px', lineHeight: 1.3,
      }}>
        {q.question}
      </h3>

      {/* Options */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '6px', width: '100%', maxWidth: '400px',
      }}>
        {q.options.map((opt, i) => {
          let bg = '#0288d1';
          if (isResult) {
            if (i === q.correctIndex) bg = '#4caf50';
            else if (i === battle.selectedAnswer && !battle.wasCorrect) bg = '#f44336';
            else bg = '#90a4ae';
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={isResult}
              style={{
                padding: '8px 10px', background: bg, color: 'white',
                border: 'none', borderRadius: '10px', fontSize: '0.8rem',
                fontWeight: 700, cursor: isResult ? 'default' : 'pointer',
                transition: 'background 0.2s', opacity: isResult && i !== q.correctIndex && i !== battle.selectedAnswer ? 0.5 : 1,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Result explanation */}
      {isResult && (
        <div className="fade-in" style={{ marginTop: '10px', maxWidth: '400px' }}>
          <p style={{
            fontWeight: 700, fontSize: '1rem',
            color: battle.wasCorrect ? '#2e7d32' : '#c62828',
            margin: '0 0 4px 0',
          }}>
            {battle.wasCorrect ? 'Correct!' : 'Not quite!'}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#555', margin: '0 0 10px 0', lineHeight: 1.3 }}>
            {q.explanation}
          </p>
          <button className="btn" onClick={handleContinue} style={{ fontSize: '0.85rem' }}>
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionOverlay;
