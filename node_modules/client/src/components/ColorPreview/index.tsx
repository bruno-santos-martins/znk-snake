import React from 'react';

export const ColorPreview: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="color-preview">
      <div className="swatch" style={{ background: color }} />
      <p>Your color is reserved.</p>
    </div>
  );
};
