import { useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import VerletRope from './VerletRope';
import './index.css';

function App() {
  const [isOn, setIsOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Sensores de posición X,Y de alta velocidad que leen la mano del usuario para enviarlo a la soga matemática
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const toggleDevice = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setTimeout(() => {
      setIsOn(prev => !prev);
      setIsConnecting(false);
    }, 200);
  };

  const handleDragEnd = (_event: any, info: any) => {
    if (info.offset.y > 60) {
      toggleDevice();
    }
  };

  return (
    <div className={`app-container ${isOn ? 'on' : 'off'}`}>
      <div className="ambient-glow" />
      
      <div className="hanging-system">
        
        <motion.div 
          className="bulb-container"
          animate={{
             rotate: isOn ? [0, 2, -2, 0] : 0, 
          }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
           <div className={`bulb-glass ${isOn ? 'glow' : 'dim'}`}>
              <Lightbulb 
                size={110} 
                strokeWidth={1} 
                color={isOn ? "#fef08a" : "#4b5563"} 
                fill={isOn ? "rgba(253, 224, 71, 0.4)" : "transparent"}
              />
           </div>
        </motion.div>

        {/* Zona del Cordón */}
        <div className="cord-container">
           {/* Soga física Verlet rendering loop (dibuja la cuerda hasta el gancho) */}
           <VerletRope x={dragX} y={dragY} length={240} />

           {/* Gancho controlador (La mano del usuario lo agarra aquí) */}
           <motion.div 
             className="pull-cord"
             style={{ x: dragX, y: dragY }}
             drag // Permite simular un péndulo completo al arrastrar de lado a lado
             dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }} 
             dragElastic={{ top: 0, bottom: 0.6, left: 0.1, right: 0.1 }}
             onDragEnd={handleDragEnd}
             whileHover={{ cursor: "grab", scale: 1.05 }}
             whileTap={{ cursor: "grabbing", scale: 0.95 }}
           >
             <div className="handle"></div>
           </motion.div>
        </div>
      </div>

      <motion.div 
        className="instructions"
        animate={{ y: isOn ? 0 : -5 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
         <h1>{isOn ? 'Encendido' : 'Apagado'}</h1>
         <p>Juega o tira del gancho para controlar la luz</p>
      </motion.div>

    </div>
  );
}

export default App;
