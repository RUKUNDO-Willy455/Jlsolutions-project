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

type FooterHandlers = { onAdminClick?: () => void; onTechClick?: () => void };

export default function HomePage({ footerHandlers }: { footerHandlers: FooterHandlers }) {
  return (
    <Page>
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