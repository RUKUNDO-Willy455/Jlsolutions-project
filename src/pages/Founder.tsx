import Page from '../components/Page';
import Founder from '../components/Founder';
import FounderSpecialties from '../components/FounderSpecialties';
import CTA from '../components/CTA';

export default function FounderPage() {
  return (
    <Page>
      <h1 className="sr-only">The Founder — Jean Luc Solutions</h1>
      <Founder />
      <FounderSpecialties />
      <CTA />
    </Page>
  );
}