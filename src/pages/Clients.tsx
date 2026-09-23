import Page from '../components/Page';
import ClientsSection from '../components/ClientsSection';
import ClientsDetail from '../components/ClientsDetail';
import CTA from '../components/CTA';

export default function ClientsPage() {
  return (
    <Page>
      <h1 className="sr-only">Our Clients — Jean Luc Solutions</h1>
      <ClientsSection />
      <ClientsDetail />
      <CTA />
    </Page>
  );
}