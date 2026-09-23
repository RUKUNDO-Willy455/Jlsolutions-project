import Page from '../components/Page';
import ProcessSection from '../components/ProcessSection';
import ProcessSpecialties from '../components/ProcessSpecialties';
import CTA from '../components/CTA';

export default function ProcessPage() {
  return (
    <Page>
      <h1 className="sr-only">Our Process — Jean Luc Solutions</h1>
      <ProcessSection />
      <ProcessSpecialties />
      <CTA />
    </Page>
  );
}