import Page from '../components/Page';
import Pricing from '../components/Pricing';
import PricingFaq from '../components/PricingFaq';
import ClientsSection from '../components/ClientsSection';
import CTA from '../components/CTA';
import { useI18n } from '../i18n';

export default function PricingPage() {
  const { t } = useI18n();
  return (
    <Page>
      <h1 className="sr-only">{t('pg.pricing')}</h1>
      <Pricing />
      <PricingFaq />
      <ClientsSection />
      <CTA />
    </Page>
  );
}