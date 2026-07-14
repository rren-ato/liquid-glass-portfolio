import { useEffect, useRef, useState } from "react";

/**
 * Control de música ambiente de fondo (Fluidscape, Kevin MacLeod).
 * Arranca SIEMPRE apagado: los navegadores bloquean el autoplay con
 * sonido de todas formas, y además es mejor práctica no imponerle
 * audio a nadie sin que lo pida — la persona lo prende si quiere.
 */
export default function AmbientAudio() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = 0.35;
    audio.loop = true;
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => {
        // si el navegador igual bloquea el play, no rompemos nada
      });
      setPlaying(true);
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/fluidscape.mp3" preload="none" />
      <button
        className="lg-glass lg-ambient-toggle"
        onClick={toggle}
        aria-label={playing ? "Silenciar música de fondo" : "Reproducir música de fondo"}
        title={playing ? "Silenciar música de fondo" : "Reproducir música de fondo"}
      >
        {playing ? "🔊" : "🔈"}
      </button>
    </>
  );
}
