import Page from '../components/Page';
import BookingFlow from '../components/BookingFlow';
import CTA from '../components/CTA';

export default function BookingPage() {
  return (
    <Page>
      <BookingFlow variant="page" />
      <CTA />
    </Page>
  );
}