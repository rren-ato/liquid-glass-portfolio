import { useEffect, useRef, useState } from "react";
import initSqlJs from "sql.js";
import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import LiquidBlobLayer from "./LiquidBlobLayer";
import { useAudioPlayer } from "./AudioPlayerContext";

/**
 * Mini registro de música — ventanita flotante, no tarjeta de proyecto.
 * Corre SQLite de verdad en el navegador (sql.js / WebAssembly).
 * Las queries son reales: INSERT, SELECT, WHERE, ORDER BY, DELETE.
 * No hay persistencia todavía: se reinicia al recargar la página.
 *
 * La columna `archivo` guarda la ruta al mp3 real (en /public/audio/).
 * El botón ▶ intenta reproducir ese archivo de verdad; si no existe
 * todavía (no lo subiste), lo avisa en vez de romper la página.
 */
export default function MusicRegistry() {
  const dbRef = useRef(null);
  const { current: nowPlaying, play, stop } = useAudioPlayer();
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState("");
  const [lastQuery, setLastQuery] = useState("");
  const [form, setForm] = useState({ titulo: "", artista: "", anio: "" });
  const [playError, setPlayError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    initSqlJs({ locateFile: () => wasmUrl }).then((SQL) => {
      if (cancelled) return;
      const db = new SQL.Database();
      db.run(`
        CREATE TABLE canciones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT NOT NULL,
          artista TEXT NOT NULL,
          anio INTEGER,
          archivo TEXT
        );
        INSERT INTO canciones (titulo, artista, anio, archivo) VALUES
          ('Fluidscape', 'Kevin MacLeod', NULL, '/audio/fluidscape.mp3'),
          ('Digital Lemonade', 'Kevin MacLeod', NULL, '/audio/digital-lemonade.mp3'),
          ('Shiny Tech', 'Kevin MacLeod', NULL, '/audio/shiny-tech.mp3');
      `);
      dbRef.current = db;
      setReady(true);
      refresh(db, "");
    });
    return () => {
      cancelled = true;
      dbRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refresh(db, term) {
    const sql = term
      ? `SELECT * FROM canciones WHERE titulo LIKE '%${term}%' OR artista LIKE '%${term}%' ORDER BY anio DESC;`
      : `SELECT * FROM canciones ORDER BY anio DESC;`;
    setLastQuery(sql);
    const res = db.exec(sql);
    if (res.length === 0) {
      setSongs([]);
      return;
    }
    const { columns, values } = res[0];
    setSongs(values.map((row) => Object.fromEntries(columns.map((c, i) => [c, row[i]]))));
  }

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearch(term);
    if (dbRef.current) refresh(dbRef.current, term);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.titulo || !form.artista || !dbRef.current) return;
    const sql = `INSERT INTO canciones (titulo, artista, anio) VALUES ('${form.titulo.replace(
      /'/g,
      "''"
    )}', '${form.artista.replace(/'/g, "''")}', ${Number(form.anio) || "NULL"});`;
    dbRef.current.run(sql);
    setLastQuery(sql);
    setForm({ titulo: "", artista: "", anio: "" });
    refresh(dbRef.current, search);
  };

  const handleDelete = (id) => {
    if (!dbRef.current) return;
    const sql = `DELETE FROM canciones WHERE id = ${id};`;
    dbRef.current.run(sql);
    setLastQuery(sql);
    if (nowPlaying?.id === id) stop();
    refresh(dbRef.current, search);
  };

  const togglePlay = (song) => {
    if (!song.archivo) {
      setPlayError(`"${song.titulo}" no tiene un archivo de audio asociado.`);
      setTimeout(() => setPlayError(null), 3000);
      return;
    }

    play(song).catch(() => {
      setPlayError(`No encontré el archivo de "${song.titulo}" todavía en ${song.archivo}`);
      setTimeout(() => setPlayError(null), 4000);
    });
  };

  return (
    <>
      <button
        className={`lg-glass lg-music-toggle ${nowPlaying ? "lg-music-toggle-playing" : ""}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Cerrar registro de música" : "Abrir registro de música"}
      >
        {isOpen ? "✕" : "♪"}
      </button>

      {isOpen && (
        <div className="lg-music-panel lg-glass">
          <div className="lg-music-header">
            <LiquidBlobLayer />
            <div className="lg-liquid-tint" />
            <div className="lg-music-header-content">
              {nowPlaying ? (
                <>
                  <span className="lg-eq" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                  <div>
                    <h4>{nowPlaying.titulo}</h4>
                    <span className="lg-music-now-artist">{nowPlaying.artista}</span>
                  </div>
                </>
              ) : (
                <div>
                  <span className="lg-eyebrow" style={{ marginBottom: 0 }}>
                    SELECT * FROM canciones
                  </span>
                  <h4>Registro de música</h4>
                </div>
              )}
            </div>
          </div>

          <div className="lg-music-body">
            {!ready ? (
              <p className="lg-music-hint">cargando SQLite en el navegador…</p>
            ) : (
              <>
                <input
                  className="lg-music-input"
                  placeholder="buscar por título o artista…"
                  value={search}
                  onChange={handleSearch}
                />

                {playError && <p className="lg-music-error">{playError}</p>}

                <ul className="lg-music-list">
                  {songs.length === 0 && <li className="lg-music-hint">sin resultados</li>}
                  {songs.map((s) => (
                    <li
                      key={s.id}
                      className={`lg-music-row ${
                        nowPlaying?.id === s.id ? "lg-music-row-playing" : ""
                      }`}
                    >
                      <button
                        className="lg-music-play"
                        onClick={() => togglePlay(s)}
                        aria-label={
                          nowPlaying?.id === s.id ? `Pausar ${s.titulo}` : `Reproducir ${s.titulo}`
                        }
                      >
                        {nowPlaying?.id === s.id ? "❚❚" : "▶"}
                      </button>
                      <div>
                        <strong>{s.titulo}</strong>
                        <span className="lg-music-artist">
                          {s.artista} {s.anio ? `· ${s.anio}` : ""}
                        </span>
                      </div>
                      <button
                        className="lg-music-delete"
                        onClick={() => handleDelete(s.id)}
                        aria-label={`Borrar ${s.titulo}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>

                <form className="lg-music-form" onSubmit={handleAdd}>
                  <input
                    placeholder="título"
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  />
                  <input
                    placeholder="artista"
                    value={form.artista}
                    onChange={(e) => setForm({ ...form, artista: e.target.value })}
                  />
                  <input
                    placeholder="año"
                    inputMode="numeric"
                    value={form.anio}
                    onChange={(e) => setForm({ ...form, anio: e.target.value })}
                  />
                  <button type="submit" className="lg-btn primary">
                    +
                  </button>
                </form>

                <p className="lg-music-sql">$ {lastQuery}</p>
                <p className="lg-music-hint">
                  corre en tu navegador con SQLite (sql.js) — se reinicia al recargar. Las
                  canciones agregadas a mano no van a tener archivo de audio propio.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
