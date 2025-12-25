import React, { useRef, useEffect } from 'react';
import { useSimulation } from '../App';
import MiniMap from './MiniMap';

const CanvasView = () => {
    const canvasRef = useRef(null);
    const { params, drones, handleAddDrone } = useSimulation();

    // Configuration from original
    const SCALE = 4;
    
    const hexToRgba = (hex, alpha = 1) => {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const draw = (ctx, time) => {
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        const offsetX = w / 2;
        const offsetY = h / 2;

        const toX = (x) => x * SCALE + offsetX;
        const toY = (y) => y * -SCALE + offsetY;

        ctx.clearRect(0, 0, w, h);

        // 1. Draw Grid (Dark mode aesthetic)
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, w, h);
        
        ctx.strokeStyle = "rgba(148,163,184,0.08)";
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 50) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += 50) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // 2. Draw Base Station Radar (Animated)
        const bx = toX(params.baseX);
        const by = toY(params.baseY);
        const radarRange = (params.signalRange || 40) * SCALE;
        
        // Radar Circle
        ctx.beginPath();
        ctx.arc(bx, by, radarRange, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(59, 130, 246, 0.45)";
        ctx.lineWidth = 1.3;
        ctx.stroke();

        // Radar Gradient
        const radarGrad = ctx.createRadialGradient(bx, by, radarRange * 0.2, bx, by, radarRange);
        radarGrad.addColorStop(0, "rgba(59, 130, 246, 0.15)");
        radarGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx.beginPath();
        ctx.arc(bx, by, radarRange, 0, Math.PI * 2);
        ctx.fillStyle = radarGrad;
        ctx.fill();

        // Animated Radar Sweep
        const sweepAngle = (time * 4) % (Math.PI * 2);
        const pulse = 0.7 + 0.3 * Math.sin(time * 8);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(sweepAngle) * radarRange, by + Math.sin(sweepAngle) * radarRange);
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.6 * pulse})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Base Station Point
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#000000";
        ctx.shadowColor = "#3b82f6";
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(bx, by, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#3b82f6";
        ctx.fill();

        // 3. Draw User Point
        const ux = toX(params.userX);
        const uy = toY(params.userY);
        ctx.beginPath();
        ctx.arc(ux, uy, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#f97316";
        ctx.shadowColor = "#f97316";
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;

        // 4. Draw Drones (Animated)
        drones.forEach(drone => {
            const dx = toX(drone.x);
            const dy = toY(drone.y);
            const signalRange = (params.signalRange * 0.5 || 25) * SCALE;
            const signalAngle = (params.signalAngle || 60) * Math.PI / 180;
            const yaw = - (drone.yaw * Math.PI / 180); // flip for canvas

            // Signal Sector (Animated Pulse)
            const dPulse = 0.8 + 0.2 * Math.sin(time * 3);
            const startAngle = yaw - signalAngle / 2;
            const endAngle = yaw + signalAngle / 2;

            const sGrad = ctx.createRadialGradient(dx, dy, signalRange * 0.1, dx, dy, signalRange);
            sGrad.addColorStop(0, hexToRgba(drone.color, 0.25 * dPulse));
            sGrad.addColorStop(1, "rgba(0,0,0,0)");
            
            ctx.beginPath();
            ctx.arc(dx, dy, signalRange, startAngle, endAngle);
            ctx.lineTo(dx, dy);
            ctx.closePath();
            ctx.fillStyle = sGrad;
            ctx.fill();

            // Drone orientation line
            ctx.beginPath();
            ctx.moveTo(dx, dy);
            ctx.lineTo(dx + Math.cos(yaw) * 15, dy + Math.sin(yaw) * 15);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Drone Body
            ctx.beginPath();
            ctx.arc(dx, dy, 6, 0, Math.PI * 2);
            ctx.fillStyle = drone.color;
            ctx.shadowColor = drone.color;
            ctx.shadowBlur = 18;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Small glowing core
            ctx.beginPath();
            ctx.arc(dx, dy, 3, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.globalAlpha = 0.7 * dPulse;
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let frameId;

        const render = () => {
            const time = Date.now() / 1000;
            draw(ctx, time);
            frameId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(frameId);
    }, [params, drones]);

    const handleClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        // 1. Get pixel position relative to the element
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        
        // 2. Scale coordinate to the internal canvas resolution (900x600)
        // This is crucial because CSS 'width: 100%' might have resized the element
        const internalPx = (px / rect.width) * canvas.width;
        const internalPy = (py / rect.height) * canvas.height;
        
        // 3. Convert to centered world coordinates
        // SCALE=4, Center=(450, 300), Y is flipped
        const x = (internalPx - canvas.width / 2) / SCALE;
        const y = (internalPy - canvas.height / 2) / -SCALE;
        
        handleAddDrone(x, y);
    };

    return (
        <div className="canvas-shell">
            <div className="canvas-header">
                <div className="canvas-chip">
                    <span className="canvas-chip-dot"></span>
                    <span>Live Simulation • React Engine v2</span>
                </div>
                <div style={{ opacity: 0.6 }}>
                    Click to deploy UAV • Virtual airspace
                </div>
            </div>

            <MiniMap />

            <canvas 
                ref={canvasRef} 
                width={900} 
                height={600} 
                id="canvas"
                onClick={handleClick}
            />
        </div>
    );
};

export default CanvasView;
