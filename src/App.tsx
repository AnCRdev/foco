import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Lightbulb } from 'lucide-react';
import './index.css';

function App() {
  const [isOn, setIsOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const toggleDevice = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    
    // Simular el retraso físico/hardware
    setTimeout(() => {
      setIsOn(!isOn);
      setIsConnecting(false);
    }, 450);
  };

  // Físicas tipo "Vercel" (Spring animations)
  const springConfig = { type: "spring", stiffness: 400, damping: 25, mass: 1 } as const;
  const hardwareSpring = { type: "spring", stiffness: 500, damping: 15, mass: 0.5 } as const;

  return (
    <div className={`app-container ${isOn ? 'on' : 'off'}`}>
      <div className="ambient-glow" />
      
      <motion.div 
        className="glass-panel"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.div 
          animate={{ 
            scale: isOn ? 1.2 : 1, 
            y: isOn ? -10 : 0,
            rotate: isOn ? [0, 10, -10, 0] : 0 // Ligero temblor físico al prender
          }} 
          transition={springConfig}
        >
          {isOn ? (
            <Lightbulb size={64} className="icon-on" strokeWidth={1.5} />
          ) : (
            <Lightbulb size={64} className="icon-off" strokeWidth={1.5} />
          )}
        </motion.div>

        <div className="text-container">
           <motion.h1 layout transition={springConfig}>
             {isOn ? 'Encendido' : 'Apagado'}
           </motion.h1>
           <motion.p layout className="subtitle" transition={springConfig}>
             Control Inteligente con Físicas
           </motion.p>
        </div>

        {/* Vercel-style Physical Toggle Switch */}
        <div 
          className={`vercel-switch-track ${isOn ? 'on' : 'off'} ${isConnecting ? 'loading' : ''}`}
          onClick={toggleDevice}
        >
          <motion.div
            className="vercel-switch-thumb"
            layout /* Layout prop automáticamente aplica físicas de resorte (spring) */
            transition={hardwareSpring}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9, width: "60px" }} /* Se aplasta físicamente al presionarlo antes de soltar */
          >
            <AnimatePresence mode="popLayout">
              {isConnecting ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 360 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="icon-wrapper"
                >
                  <div className="spinner-small" />
                </motion.div>
              ) : (
                <motion.div
                  key="icon"
                  initial={{ opacity: 0, scale: 0.2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.2 }}
                  transition={hardwareSpring}
                  className="icon-wrapper"
                >
                  <Power size={24} strokeWidth={2.5} className={isOn ? 'icon-thumb-on' : 'icon-thumb-off'} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        
        <motion.p layout transition={springConfig} className="hint">
          {isConnecting ? 'Aplicando fuerza...' : 'Alternar interruptor'}
        </motion.p>

      </motion.div>
    </div>
  );
}

export default App;
