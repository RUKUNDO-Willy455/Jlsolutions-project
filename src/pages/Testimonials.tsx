import Page from '../components/Page';
import Testimonials from '../components/Testimonials';
import TestimonialsDetail from '../components/TestimonialsDetail';
import CTA from '../components/CTA';

export default function TestimonialsPage() {
  return (
    <Page>
      <h1 className="sr-only">Testimonials — Jean Luc Solutions</h1>
      <Testimonials />
      <TestimonialsDetail />
      <CTA />
    </Page>
  );
}