import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import './index.css';

function App() {
  const [isOn, setIsOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Activador físico que se llama cuando soltamos el cordón y baja más allá de cierto límite.
  const toggleDevice = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    
    setTimeout(() => {
      setIsOn(prev => !prev);
      setIsConnecting(false);
    }, 200);
  };

  const handleDragEnd = (event: any, info: any) => {
    // Si el usuario jaló la cuerda más de 60 pixeles hacia abajo:
    if (info.offset.y > 60) {
      toggleDevice();
    }
  };

  return (
    <div className={`app-container ${isOn ? 'on' : 'off'}`}>
      {/* Luz ambiente radiante volumétrica */}
      <div className="ambient-glow" />
      
      {/* SISTEMA COLGANTE */}
      <div className="hanging-system">
        
        {/* Contenedor del Foco Realista */}
        <motion.div 
          className="bulb-container"
          animate={{
             rotate: isOn ? [0, 2, -2, 0] : 0, // Pequeño temblor (chispa de poder) simulando la corriente entrando
             y: isOn ? 0 : 0
          }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
           {/* El Vidrio y el Brillo */}
           <div className={`bulb-glass ${isOn ? 'glow' : 'dim'}`}>
              <Lightbulb 
                size={110} 
                strokeWidth={1} 
                color={isOn ? "#fef08a" : "#4b5563"} 
                fill={isOn ? "rgba(253, 224, 71, 0.4)" : "transparent"}
              />
           </div>
        </motion.div>

        {/* Cordón Físico Arrastrable (Pull Cord / Gancho) */}
        <div className="cord-container">
           <motion.div 
             className="pull-cord"
             drag="y"
             dragConstraints={{ top: 0, bottom: 0 }} /* Siempre forzamos a que el origen magnético sea arriba para que "rebote" si lo sueltas */
             dragElastic={{ top: 0, bottom: 0.6 }} /* Resistencia asimétrica: pesado hacia abajo, no sube más allá de su tope. */
             onDragEnd={handleDragEnd}
             whileHover={{ cursor: "grab" }}
             whileTap={{ cursor: "grabbing" }}
             whileDrag={{ scaleY: 1.05 }} /* Simula que el cordón de caucho se estira */
           >
             <div className="string"></div>
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
         <p>Jala el gancho rojo hacia abajo</p>
      </motion.div>

    </div>
  );
}

export default App;
