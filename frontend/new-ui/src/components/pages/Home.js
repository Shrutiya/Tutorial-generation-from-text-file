import React from 'react';
import '../../App.css';
import Cards from '../Cards';
import HeroSection from '../HeroSection';
import Footer from '../Footer';

function Home() {
  return (
    <>
      <HeroSection />
      <div id="tutorial">
      <Cards/>
      </div>
      <Footer />
    </>
  );
}

export default Home;