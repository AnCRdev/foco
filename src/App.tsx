import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Lightbulb } from 'lucide-react';
import './index.css';

function App() {
  const [isOn, setIsOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Toggle Function simulating connection to real IoT hardware
  const toggleDevice = async () => {
    setIsConnecting(true);
    
    // Aquí puedes reemplazar con tu endpoint para Render o HW local:
    // try {
    //   await fetch('https://tudominio.onrender.com/api/toggle', { 
    //     method: 'POST', 
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ power: !isOn }) 
    //   });
    // } catch (e) {
    //   console.error("Error al conectar con foco", e);
    // }
    
    // Simulate network delay
    setTimeout(() => {
      setIsOn(!isOn);
      setIsConnecting(false);
    }, 600);
  };

  return (
    <div className={`app-container ${isOn ? 'on' : 'off'}`}>
      <div className="ambient-glow" />
      
      <motion.div 
        className="glass-panel"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.div 
          animate={{ scale: isOn ? 1.2 : 1 }} 
          transition={{ duration: 0.5 }}
        >
          {isOn ? (
            <Lightbulb size={64} className="icon-on" strokeWidth={1.5} />
          ) : (
            <Lightbulb size={64} className="icon-off" strokeWidth={1.5} />
          )}
        </motion.div>

        <div>
           <h1>{isOn ? 'Encendido' : 'Apagado'}</h1>
           <p className="subtitle">Módulo de Iluminación IoT</p>
        </div>

        <motion.button
          className={`power-button ${isOn ? 'on' : 'off'}`}
          onClick={toggleDevice}
          disabled={isConnecting}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Power Button"
        >
          <AnimatePresence mode="wait">
            {isConnecting ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'flex' }}
              >
                <div className="spinner" />
              </motion.div>
            ) : (
              <motion.div
                key="power"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                style={{ display: 'flex' }}
              >
                <Power size={52} strokeWidth={2} className={isOn ? 'icon-on' : 'icon-off'} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        
        <p className="hint">
          {isConnecting ? 'Enviando señal...' : 'Toca para cambiar de estado'}
        </p>

      </motion.div>
    </div>
  );
}

export default App;
