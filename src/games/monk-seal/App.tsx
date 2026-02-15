import React, { useReducer } from 'react';
import { gameReducer, createInitialState, GameContext } from './services/gameState';
import StartScreen from './components/StartScreen';
import WorldMap from './components/WorldMap';
import Battle from './components/Battle';
import Shop from './components/Shop';
import VictoryScreen from './components/VictoryScreen';
import GameOverScreen from './components/GameOverScreen';
import HUD from './components/HUD';
import './styles.css';

const App: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  const showHUD = state.screen !== 'START';

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <div style={{
        width: '100vw', height: '100vh',
        maxWidth: '900px', maxHeight: '600px',
        margin: 'auto',
        display: 'flex', flexDirection: 'column',
        background: '#01579b',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
      }}>
        {showHUD && <HUD />}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {state.screen === 'START' && <StartScreen />}
          {state.screen === 'MAP' && <WorldMap />}
          {state.screen === 'BATTLE' && <Battle />}
          {state.screen === 'SHOP' && <Shop />}
          {state.screen === 'VICTORY' && <VictoryScreen />}
          {state.screen === 'GAME_OVER' && <GameOverScreen />}
        </div>
      </div>
    </GameContext.Provider>
  );
};

export default App;
