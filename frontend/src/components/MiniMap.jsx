import React, { useRef, useEffect } from 'react';
import { useSimulation } from '../App';

const MiniMap = () => {
  const canvasRef = useRef(null);
  const { drones, params } = useSimulation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Clear and draw Radar background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.fillRect(0, 0, w, h);

    const sc = 0.5; // Mini-scale
    const cx = w / 2;
    const cy = h / 2;

    // Radar circles
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.lineWidth = 1;
    [20, 40, 60].forEach(r => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
    });
    
    // Crosshair
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
    ctx.moveTo(0, cy); ctx.lineTo(w, cy);
    ctx.stroke();

    // Base (Black dot)
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(cx + params.baseX * sc, cy - params.baseY * sc, 3, 0, Math.PI * 2);
    ctx.fill();

    // User (Orange dot)
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.arc(cx + params.userX * sc, cy - params.userY * sc, 3, 0, Math.PI * 2);
    ctx.fill();

    // Drones
    drones.forEach(d => {
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.arc(cx + d.x * sc, cy - d.y * sc, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

  }, [drones, params]);

  return (
    <div className="minimap-container">
      <canvas ref={canvasRef} width={120} height={120} />
      <div className="minimap-pulse"></div>
    </div>
  );
};

export default MiniMap;
