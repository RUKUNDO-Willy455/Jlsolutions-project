import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import AdminPanel from './components/AdminPanel';
import TechnicianPanel from './components/TechnicianPanel';
import AiAssistant from './components/AiAssistant';
import { useRoute } from './router';
import { useSeo } from './hooks/useSeo';
import { I18nProvider } from './i18n';
import HomePage from './pages/Home';
import ServicesPage from './pages/Services';
import ProcessPage from './pages/Process';
import FounderPage from './pages/Founder';
import PricingPage from './pages/Pricing';
import ClientsPage from './pages/Clients';
import TestimonialsPage from './pages/Testimonials';
import BookingPage from './pages/Booking';
import TrackBookingPage from './pages/TrackBooking';
import ContactPage from './pages/Contact';
import PrivacyPage from './pages/Privacy';
import TermsPage from './pages/Terms';

function PageView() {
  const path = useRoute();

  switch (path) {
    case '/services':
      return <ServicesPage />;
    case '/process':
      return <ProcessPage />;
    case '/founder':
      return <FounderPage />;
    case '/pricing':
      return <PricingPage />;
    case '/clients':
      return <ClientsPage />;
    case '/testimonials':
      return <TestimonialsPage />;
    case '/booking':
      return <BookingPage />;
    case '/track':
      return <TrackBookingPage />;
    case '/contact':
      return <ContactPage />;
    case '/privacy':
      return <PrivacyPage />;
    case '/terms':
      return <TermsPage />;
    case '/':
    default:
      return <HomePage />;
  }
}

export default function App() {
  return (
    <I18nProvider>
      <Shell />
    </I18nProvider>
  );
}

function Shell() {
  const [loading, setLoading] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const [techOpen, setTechOpen] = useState(false);
  const path = useRoute();

  useSeo(path);

  useEffect(() => {
    const boot = document.getElementById('boot-splash');
    if (boot) {
      boot.classList.add('is-hidden');
      const rem = window.setTimeout(() => boot.remove(), 700);
      return () => window.clearTimeout(rem);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 2600);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <LoadingScreen visible={loading} />
      {adminOpen ? (
        <AdminPanel onExit={() => setAdminOpen(false)} />
      ) : techOpen ? (
        <TechnicianPanel onExit={() => setTechOpen(false)} />
      ) : (
        <>
          <Navbar />
          <main key={path} className="page-enter">
            <PageView />
          </main>
          <Footer onAdminClick={() => setAdminOpen(true)} onTechClick={() => setTechOpen(true)} />
          <AiAssistant />
        </>
      )}
    </>
  );
}