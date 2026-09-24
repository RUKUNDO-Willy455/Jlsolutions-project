import Page from '../components/Page';
import Services from '../components/Services';
import ServiceSpecialties from '../components/ServiceSpecialties';
import CTA from '../components/CTA';
import { useI18n } from '../i18n';

export default function ServicesPage() {
  const { t } = useI18n();
  return (
    <Page>
      <h1 className="sr-only">{t('pg.services')}</h1>
      <Services />
      <ServiceSpecialties />
      <CTA />
    </Page>
  );
}