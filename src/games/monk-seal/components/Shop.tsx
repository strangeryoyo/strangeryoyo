import React from 'react';
import { useGame } from '../services/gameState';
import { equipment } from '../data/equipment';
import { soundManager } from '../services/sound';
import { EquipmentItem } from '../types';

const Shop: React.FC = () => {
  const { state, dispatch } = useGame();
  const { player } = state;

  const statBoosts = equipment.filter(e => e.type === 'stat-boost');
  const cleaningTools = equipment.filter(e => e.type === 'cleaning-tool');

  const handleBuy = (item: EquipmentItem) => {
    if (player.purchases.includes(item.id) || player.shells < item.cost) return;
    soundManager.purchase();
    dispatch({ type: 'BUY_EQUIPMENT', item });
  };

  const handleEquip = (toolId: string) => {
    dispatch({ type: 'EQUIP_TOOL', toolId });
  };

  const renderItem = (item: EquipmentItem) => {
    const owned = player.purchases.includes(item.id);
    const equipped = player.equippedTool === item.id;
    const canAfford = player.shells >= item.cost;
    const isTool = item.type === 'cleaning-tool';

    return (
      <div key={item.id} style={{
        background: 'white', borderRadius: '10px', padding: '8px 10px',
        display: 'flex', alignItems: 'center', gap: '8px',
        border: equipped ? '2px solid #ff9800' : '2px solid #e0e0e0',
        opacity: owned && !isTool ? 0.6 : 1,
      }}>
        <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#006064' }}>{item.name}</div>
          <div style={{ fontSize: '0.7rem', color: '#666' }}>{item.description}</div>
        </div>
        {!owned ? (
          <button
            className="btn"
            disabled={!canAfford}
            onClick={() => handleBuy(item)}
            style={{ fontSize: '0.7rem', padding: '4px 10px' }}
          >
            {item.cost === 0 ? 'Free' : `${item.cost} \ud83d\udc1a`}
          </button>
        ) : isTool ? (
          <button
            className={`btn ${equipped ? 'btn-green' : 'btn-blue'}`}
            onClick={() => handleEquip(item.id)}
            style={{ fontSize: '0.7rem', padding: '4px 10px' }}
          >
            {equipped ? 'Equipped' : 'Equip'}
          </button>
        ) : (
          <span style={{ fontSize: '0.7rem', color: '#4caf50', fontWeight: 700 }}>Owned</span>
        )}
      </div>
    );
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #fff8e1 0%, #ffecb3 100%)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 12px', background: '#ff8f00', color: 'white',
      }}>
        <h2 className="fredoka" style={{ margin: 0, fontSize: '1rem' }}>
          &#x1F6D2; Salty's Shop
        </h2>
        <span className="fredoka" style={{ fontSize: '0.9rem' }}>&#x1F41A; {player.shells}</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px' }}>
        {/* Stat boosts */}
        <h3 className="fredoka" style={{ fontSize: '0.85rem', color: '#e65100', margin: '4px 0' }}>
          Stat Boosts
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
          {statBoosts.map(renderItem)}
        </div>

        {/* Cleaning tools */}
        <h3 className="fredoka" style={{ fontSize: '0.85rem', color: '#e65100', margin: '4px 0' }}>
          Cleaning Tools
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {cleaningTools.map(renderItem)}
        </div>
      </div>

      {/* Back button */}
      <div style={{ padding: '8px 12px' }}>
        <button
          className="btn btn-blue"
          style={{ width: '100%', fontSize: '0.9rem' }}
          onClick={() => dispatch({ type: 'OPEN_MAP' })}
        >
          Back to Map
        </button>
      </div>
    </div>
  );
};

export default Shop;
