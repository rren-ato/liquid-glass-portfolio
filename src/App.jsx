import "./styles/tokens.css";

import GlassFilterDefs from "./components/GlassFilterDefs";
import BlobCanvas from "./components/BlobCanvas";
import Preloader from "./components/Preloader";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Playground from "./components/Playground";
import Footer from "./components/Footer";
import MusicRegistry from "./components/MusicRegistry";
import AmbientAudio from "./components/AmbientAudio";
import { AudioPlayerProvider } from "./components/AudioPlayerContext";

export default function App() {
  const handleNavigate = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="lg-root">
      <GlassFilterDefs />
      <Preloader />
      <BlobCanvas />
      <div className="lg-grain" />

      <Nav onNavigate={handleNavigate} />

      <div className="lg-wrap">
        <Hero onNavigate={handleNavigate} />
        <About />
        <Projects />
        <Playground />
        <Footer />
      </div>

      <AudioPlayerProvider>
        <MusicRegistry />
        <AmbientAudio />
      </AudioPlayerProvider>
    </div>
  );
}
