import React from 'react';

interface RainDropIconProps {
  intensity: 'none' | 'tiny' | 'light' | 'heavy';
  size?: number;
}

const RainDropIcon: React.FC<RainDropIconProps> = ({ intensity, size = 20 }) => {
  if (intensity === 'none') {
    return <div style={{ height: size }} />;
  }

  const getDrops = () => {
    switch (intensity) {
      case 'heavy':
        return ['#AEECEF', '#AEECEF', '#AEECEF'];
      case 'light':
        return ['#AEECEF', '#AEECEF'];
      case 'tiny':
      default:
        return ['#AEECEF'];
    }
  };

  const drops = getDrops();

  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: size, justifyContent: 'center' }}>
      {drops.map((color, i) => (
        <svg key={i} width="5" height={10 + i * 2} viewBox="0 0 5 12" fill="none">
          <path
            d="M2.5 0 C2.5 0 0 4 0 7.5 a2.5 2.5 0 0 0 5 0 C5 4 2.5 0 2.5 0z"
            fill={color}
            opacity="0.75"
          />
        </svg>
      ))}
    </div>
  );
};

export default RainDropIcon;
