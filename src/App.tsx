import React, { useState, useEffect, useMemo } from 'react';
import { Menu, ArrowLeft } from 'lucide-react';

interface Tile {
  id: string;
  rotation: number;
  position: number;
}

function useResponsiveGrid() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return useMemo(() => {
    const padding = Math.min(dimensions.width, dimensions.height) * 0.03;
    const isLandscape = dimensions.width > dimensions.height;
    
    let tileSize: number;
    let gridStyle: React.CSSProperties;
    
    if (isLandscape) {
      const availableHeight = dimensions.height - (padding * 2) - 160;
      const availableWidth = dimensions.width - (padding * 2);
      tileSize = Math.min(availableHeight / 5, availableWidth / 10);
      
      gridStyle = {
        gridTemplateColumns: `repeat(10, ${tileSize}px)`,
        gridTemplateRows: `repeat(5, ${tileSize}px)`,
      };
    } else {
      const availableWidth = dimensions.width - (padding * 2);
      const availableHeight = dimensions.height - (padding * 2);
      tileSize = Math.min(availableWidth / 5, availableHeight / 10);
      
      gridStyle = {
        gridTemplateColumns: `repeat(5, ${tileSize}px)`,
        gridTemplateRows: `repeat(10, ${tileSize}px)`,
      };
    }

    return { tileSize, gridStyle, padding, isLandscape };
  }, [dimensions]);
}

function Tile({ 
  tile, 
  isSelected, 
  onClick, 
  tileSize, 
  isLandscape 
}: { 
  tile: Tile; 
  isSelected: boolean; 
  onClick: () => void; 
  tileSize: number;
  isLandscape: boolean;
}) {
  const cols = isLandscape ? 10 : 5;
  const rows = isLandscape ? 5 : 10;

  const style = {
    width: tileSize,
    height: tileSize,
    backgroundImage: `url(${IMAGE_URL})`,
    backgroundSize: `${tileSize * cols}px ${tileSize * rows}px`,
    backgroundPosition: `${-(tile.position % cols) * tileSize}px ${-Math.floor(tile.position / cols) * tileSize}px`,
    transform: `rotate(${tile.rotation}deg)`,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  return (
    <div
      onClick={onClick}
      style={style}
      className={`
        border
        ${isSelected 
          ? 'border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.5)]' 
          : 'border-white/20 hover:border-white/40'
        }
      `}
    />
  );
}

const IMAGE_URL = "https://images.unsplash.com/photo-1682686580391-615b1f28e5ee?q=80&w=1080&h=2160&auto=format&fit=crop";

function MainMenu({ onStartGame }: { onStartGame: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold text-white mb-4">Puzzle Game</h1>
      <button
        onClick={onStartGame}
        className="px-8 py-4 bg-blue-600 text-white rounded-lg text-xl font-semibold 
                 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl
                 active:transform active:scale-95"
      >
        Start Game
      </button>
    </div>
  );
}

function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Правила игры</h2>
        <div className="text-gray-300 space-y-4">
          <p>1. Цель игры - собрать изображение, правильно расположив и повернув все фрагменты.</p>
          <p>2. Нажмите на фрагмент, чтобы выбрать его.</p>
          <p>3. Нажмите на выбранный фрагмент еще раз, чтобы повернуть его на 90°.</p>
          <p>4. Нажмите на другой фрагмент, чтобы поменять их местами.</p>
          <p>5. Продолжайте, пока не соберете изображение полностью.</p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold 
                   hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl
                   active:transform active:scale-95"
        >
          Понятно!
        </button>
      </div>
    </div>
  );
}

function Game({ onExit }: { onExit: () => void }) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(true);
  const { tileSize, gridStyle, padding, isLandscape } = useResponsiveGrid();

  useEffect(() => {
    const totalTiles = 50; // 5x10 grid
    const initialTiles = Array.from({ length: totalTiles }, (_, i) => ({
      id: `tile-${i}`,
      rotation: Math.floor(Math.random() * 4) * 90, // Random rotation: 0, 90, 180, or 270 degrees
      position: i,
    }));
    
    const shuffledTiles = [...initialTiles].sort(() => Math.random() - 0.5);
    setTiles(shuffledTiles);
  }, []);

  const handleTileClick = (clickedTileId: string) => {
    if (selectedTileId === null) {
      setSelectedTileId(clickedTileId);
    } else if (selectedTileId === clickedTileId) {
      setTiles(prev => prev.map(tile => 
        tile.id === clickedTileId 
          ? { ...tile, rotation: (tile.rotation + 90) % 360 }
          : tile
      ));
      setSelectedTileId(null); // Clear selection after rotation
    } else {
      setTiles(prev => {
        const newTiles = [...prev];
        const selectedIndex = newTiles.findIndex(t => t.id === selectedTileId);
        const clickedIndex = newTiles.findIndex(t => t.id === clickedTileId);
        [newTiles[selectedIndex], newTiles[clickedIndex]] = 
        [newTiles[clickedIndex], newTiles[selectedIndex]];
        return newTiles;
      });
      setSelectedTileId(null);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {isLandscape && (
        <h1 className="text-4xl font-bold text-white mb-8">Puzzle Game</h1>
      )}
      <button
        onClick={onExit}
        className="absolute top-4 left-4 p-2 text-white hover:bg-white/10 rounded-lg
                 transition-colors flex items-center gap-2"
      >
        <ArrowLeft size={24} />
        {isLandscape && <span>Назад</span>}
      </button>
      <div className="bg-gray-800 p-4 rounded-xl shadow-2xl">
        <div 
          style={{
            display: 'grid',
            ...gridStyle,
            gap: '1px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '1px',
            borderRadius: '8px',
          }}
        >
          {tiles.map((tile) => (
            <Tile
              key={tile.id}
              tile={tile}
              isSelected={tile.id === selectedTileId}
              onClick={() => handleTileClick(tile.id)}
              tileSize={tileSize}
              isLandscape={isLandscape}
            />
          ))}
        </div>
      </div>
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const { padding } = useResponsiveGrid();

  return (
    <div 
      className="fixed inset-0 bg-gray-900 overflow-hidden"
      style={{ padding }}
    >
      {isPlaying ? (
        <Game onExit={() => setIsPlaying(false)} />
      ) : (
        <MainMenu onStartGame={() => setIsPlaying(true)} />
      )}
    </div>
  );
}

export default App;