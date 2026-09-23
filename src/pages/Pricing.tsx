import Page from '../components/Page';
import Pricing from '../components/Pricing';
import PricingFaq from '../components/PricingFaq';
import ClientsSection from '../components/ClientsSection';
import CTA from '../components/CTA';

export default function PricingPage() {
  return (
    <Page>
      <h1 className="sr-only">Pricing — Jean Luc Solutions</h1>
      <Pricing />
      <PricingFaq />
      <ClientsSection />
      <CTA />
    </Page>
  );
}