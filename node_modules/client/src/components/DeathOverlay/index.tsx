import React from 'react';

type DeathOverlayProps = {
  show: boolean;
  onRespawn: () => void;
  cooldownMs: number;
};

export const DeathOverlay: React.FC<DeathOverlayProps> = ({ show, onRespawn, cooldownMs }) => {
  if (!show) return null;

  const cooldownSeconds = Math.ceil(cooldownMs / 1000);
  const canRespawn = cooldownMs <= 0;

  return (
    <div className="overlay overlay-death">
      <div className="panel death-modal" role="dialog" aria-modal="true" aria-labelledby="death-title">
        <p className="death-badge">Snake Down</p>
        <h2 id="death-title">You died</h2>
        <p className="death-subtitle">Prepare-se para voltar mais forte.</p>
        <button type="button" onClick={onRespawn} disabled={!canRespawn} className="death-respawn-btn">
          {canRespawn ? 'Reviver agora' : `Reviver em ${cooldownSeconds}s`}
        </button>
        {!canRespawn ? <p className="death-helper">Cooldown ativo para novo respawn.</p> : null}
      </div>
    </div>
  );
};
