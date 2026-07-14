import { useAudioPlayer } from "./AudioPlayerContext";

/**
 * Ya no reproduce nada por su cuenta — eso lo decide el Registro
 * de música. Este botón solo silencia/reactiva lo que sea que esté
 * sonando en ese momento (o lo próximo que suene).
 */
export default function AmbientAudio() {
  const { current, muted, toggleMute } = useAudioPlayer();

  const icon = muted ? "🔇" : current ? "🔊" : "🔈";
  const label = muted ? "Activar sonido" : "Silenciar";

  return (
    <button
      className="lg-glass lg-ambient-toggle"
      onClick={toggleMute}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}
