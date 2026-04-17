import { useEffect, useRef } from 'react';
import { MotionValue } from 'framer-motion';

interface VerletRopeProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  length?: number;
}

export default function VerletRope({ x: dragX, y: dragY, length = 240 }: VerletRopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const segments = 15;
  const segmentLength = length / segments;

  const pointsRef = useRef(
    Array.from({ length: segments }).map((_, i) => ({
      x: 0,
      y: i * segmentLength,
      oldX: 0,
      oldY: i * segmentLength,
    }))
  );

  useEffect(() => {
    let animationFrameId: number;
    // La manija está empujada 240px abajo por CSS, así que su resting Y visual es 'length'
    let currentDragX = 0;
    let currentDragY = length;

    // Conectar framer motion properties directamente a variables let locales. 
    // ¡Esto no dispara renders de React y da 120 FPS impecables!
    const unsubX = dragX.on('change', (latest) => { currentDragX = latest; });
    const unsubY = dragY.on('change', (latest) => { currentDragY = latest + length; });

    const render = () => {
      const pts = pointsRef.current;
      
      // Nodo 0: Fijado como perno al techo del contenedor
      pts[0].x = 0;
      pts[0].y = 0;

      // Nodo Final: Pegado al gancho que se agarra con el mouse
      pts[pts.length - 1].x = currentDragX;
      pts[pts.length - 1].y = currentDragY;

      // Integración Verlet matemática (Gravedad, fricción y arrastre inercial)
      for (let i = 1; i < pts.length - 1; i++) {
        const p = pts[i];
        const vx = (p.x - p.oldX) * 0.92; // Fricción reducida para mayor oscilación
        const vy = (p.y - p.oldY) * 0.92; 

        p.oldX = p.x;
        p.oldY = p.y;

        p.x += vx;
        p.y += vy + 0.9; // Extra Gravedad para dar peso físico
      }

      // Cinemática inversa (Constraint Solver) - Restringe longitud de soga
      for (let k = 0; k < 10; k++) { // 10 iteraciones garantiza solidez tipo cable tensor
        for (let i = 0; i < pts.length - 1; i++) {
          const p1 = pts[i];
          const p2 = pts[i + 1];

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance === 0) continue; 

          const difference = segmentLength - distance;
          const percent = difference / distance / 2;
          const offsetX = dx * percent;
          const offsetY = dy * percent;

          if (i !== 0) {
            p1.x -= offsetX;
            p1.y -= offsetY;
          }
          if (i + 1 !== pts.length - 1) { 
            p2.x += offsetX;
            p2.y += offsetY;
          }
        }
      }

      // Renderer Vectorial en Canvas
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        ctx.beginPath();
        // Centrar las matemáticas al medio del canvas (Centro X: 150)
        ctx.moveTo(pts[0].x + 150, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x + 150, pts[i].y);
        }
        
        ctx.strokeStyle = '#64748b'; // Slate color string
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      unsubX();
      unsubY();
    };
  }, [dragX, dragY, segmentLength, length]);

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={600} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        pointerEvents: 'none',
        zIndex: 2
      }} 
    />
  );
}
