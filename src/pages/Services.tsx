import Page from '../components/Page';
import Services from '../components/Services';
import ServiceSpecialties from '../components/ServiceSpecialties';
import CTA from '../components/CTA';

export default function ServicesPage() {
  return (
    <Page>
      <h1 className="sr-only">Services — Jean Luc Solutions</h1>
      <Services />
      <ServiceSpecialties />
      <CTA />
    </Page>
  );
}