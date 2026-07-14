import { createContext, useContext, useRef, useState } from "react";

/**
 * Un solo <audio> compartido para todo el sitio — evita que dos
 * fuentes de sonido distintas (el parlante ambiente y el registro
 * de música) suenen pisadas una sobre la otra.
 *
 * - El Registro de música decide QUÉ suena (play(cancion)).
 * - El botón de parlante solo controla mute/unmute de eso.
 */
const AudioPlayerContext = createContext(null);

export function AudioPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [current, setCurrent] = useState(null); // fila de la canción sonando, o null
  const [muted, setMuted] = useState(false);

  const play = (song) => {
    const audio = audioRef.current;

    // si tocás play sobre la misma canción que ya suena, actúa como pausa/resume
    if (current?.id === song.id) {
      if (audio.paused) {
        return audio.play().then(() => setCurrent(song));
      }
      audio.pause();
      setCurrent(null);
      return Promise.resolve();
    }

    audio.src = song.archivo;
    audio.muted = muted;
    return audio.play().then(() => setCurrent(song));
  };

  const stop = () => {
    audioRef.current.pause();
    setCurrent(null);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    const next = !audio.muted;
    audio.muted = next;
    setMuted(next);
  };

  return (
    <AudioPlayerContext.Provider value={{ current, muted, play, stop, toggleMute }}>
      <audio ref={audioRef} onEnded={() => setCurrent(null)} />
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}
