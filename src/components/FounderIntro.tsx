import { useEffect, useState } from 'react';
import founderHero from '../assets/founder-hero.jpg';
import './Founder.css';

/**
 * Full-screen founder cover shown when the founder page is entered.
 * At the top of the page ONLY the founder's portrait is visible (no navbar,
 * logo or assistant). As the visitor scrolls the cover peels up and away,
 * letting the navigation and page content come forward. Scrolling back to
 * the top restores the cover, keeping the same reveal transition.
 */
export default function FounderIntro() {
  const [entered, setEntered] = useState(false);
  const [away, setAway] = useState(false);

  useEffect(() => {
    const update = () => {
      const isTop = window.scrollY <= 56;
      if (isTop) setEntered(true);
      setAway(!isTop);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      className={`founder-intro ${entered ? 'is-visible' : ''} ${away ? 'is-away' : ''}`}
      aria-hidden="true"
    >
      <img src={founderHero} alt="" className="founder-intro__img" decoding="async" fetchPriority="high" />
      <div className="founder-intro__veil" aria-hidden="true" />
      <div className="founder-intro__captions">
        <h1 className="founder-intro__name">Jean Luc <span className="founder-intro__name-up">Niyibizi</span></h1>
        <p className="founder-intro__role">CEO &amp; Founder of JL Solutions</p>
      </div>
      <div className="founder-intro__cue" aria-hidden="true">
        <span className="founder-intro__cue-line" />
        <span className="founder-intro__cue-text">Scroll</span>
      </div>
    </div>
  );
}