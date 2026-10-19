import Page from '../components/Page';
import Hero from '../components/Hero';
import Welcome from '../components/Welcome';
import Services from '../components/Services';
import Pricing from '../components/Pricing';
import ProcessSection from '../components/ProcessSection';
import ClientsSection from '../components/ClientsSection';
import BookingFlow from '../components/BookingFlow';
import Testimonials from '../components/Testimonials';
import Gallery from '../components/Gallery';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

type FooterHandlers = { onLoginClick?: () => void };

export default function HomePage({ footerHandlers }: { footerHandlers: FooterHandlers }) {
  return (
    <Page>
      {/* One static background for the entire home page. The hero, booking and
          CTA/Footer sections paint their own backgrounds above it. */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none">
        <img src="/images/loading%20without%20logo.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[rgba(5,10,23,0.7)]" />
      </div>
      <Hero />
      <Welcome />
      <Services />
      <Pricing />
      <ProcessSection />
      <ClientsSection />
      <BookingFlow variant="home" />
      <Testimonials />
      <Gallery />
      <CTA>
        <Footer {...footerHandlers} />
      </CTA>
    </Page>
  );
}