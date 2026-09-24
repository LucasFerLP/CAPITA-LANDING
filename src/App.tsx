import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Manifesto } from "./components/Manifesto";
import { Features } from "./components/Features";
import { Hosts } from "./components/Hosts";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Features />
        <Hosts />
      </main>
      <Footer />
    </>
  );
}
