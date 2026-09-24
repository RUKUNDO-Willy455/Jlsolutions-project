import Page from '../components/Page';
import Testimonials from '../components/Testimonials';
import TestimonialsDetail from '../components/TestimonialsDetail';
import CTA from '../components/CTA';
import { useI18n } from '../i18n';

export default function TestimonialsPage() {
  const { t } = useI18n();
  return (
    <Page>
      <h1 className="sr-only">{t('pg.testimonials')}</h1>
      <Testimonials />
      <TestimonialsDetail />
      <CTA />
    </Page>
  );
}