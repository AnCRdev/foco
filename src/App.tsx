import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { Lightbulb, Mic, MicOff } from 'lucide-react';
import VerletRope from './VerletRope';
import './index.css';

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function App() {
  const [isOn, setIsOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Sensores de posición X,Y de alta velocidad que leen la mano del usuario para enviarlo a la soga matemática
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

  const toggleDevice = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/toggle`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setIsOn(data.state);
    } catch (err) {
      console.error('Error al contactar el ESP32:', err);
      // Fallback visual si el backend no está disponible
      setIsOn(prev => !prev);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDragEnd = (_event: any, info: any) => {
    if (info.offset.y > 60) {
      toggleDevice();
    }
  };

  useEffect(() => {
    // Configurar SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'es-ES'; // Idioma español

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript.toLowerCase();
        console.log("Comando escuchado:", transcript);

        if (
          transcript.includes('lumos') ||
          transcript.includes('enciende') ||
          transcript.includes('apaga') ||
          transcript.includes('luz')
        ) {
          toggleDevice();
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Error en SpeechRecognition:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        // Si sigue en modo listening pero se cortó, reactivar (o apagar el botón)
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Tu navegador no soporta Web Speech API");
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isConnecting]); // Se vuelve a montar si isConnecting cambia para no colisionar

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta comandos de voz.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("No se pudo iniciar el micrófono", e);
      }
    }
  };

  return (
    <div className={`app-container ${isOn ? 'on' : 'off'}`}>
      <div className="ambient-glow" />
      
      {/* Botón Flotante del Micrófono */}
      <motion.button 
        className={`mic-button ${isListening ? 'listening' : ''}`}
        onClick={toggleListening}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={isListening ? "Detener escucha" : "Control por Voz"}
      >
        {isListening ? <Mic size={28} color="#ffffff" /> : <MicOff size={28} color="#cbd5e1" />}
      </motion.button>
      
      {isListening && (
        <div className="voice-status">
          Escuchando... Di "enciende", "apaga" o "lumos"
        </div>
      )}

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
         <p>Juega, tira del gancho o usa tu voz para controlar la luz</p>
      </motion.div>

    </div>
  );
}

export default App;
