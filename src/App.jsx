import { useEffect } from 'react';
import { ScrollTrigger } from './lib/gsap';
import { LenisContext, useLenisInstance } from './hooks/useLenis';
import Header from './components/Header/Header';
import CustomCursor from './components/CustomCursor/CustomCursor';
import ScrollProgress from './components/ScrollProgress/ScrollProgress';
import Story from './sections/Story/Story';
import Services from './sections/Services/Services';
import About from './sections/About/About';
import Projects from './sections/Projects/Projects';
import Process from './sections/Process/Process';
import Contact from './sections/Contact/Contact';

export default function App() {
  const lenis = useLenisInstance();

  // Les scènes épinglées sont créées section par section : on les ordonne
  // puis on recalcule une fois les polices chargées (évite les décalages).
  useEffect(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <Header />
      <main id="main">
        <Story />
        <Services />
        <About />
        <Projects />
        <Process />
        <Contact />
      </main>
      <ScrollProgress />
      <CustomCursor />
    </LenisContext.Provider>
  );
}
