import Page from '../components/Page';
import ClientsSection from '../components/ClientsSection';
import ClientsDetail from '../components/ClientsDetail';
import CTA from '../components/CTA';
import { useI18n } from '../i18n';

export default function ClientsPage() {
  const { t } = useI18n();
  return (
    <Page>
      <h1 className="sr-only">{t('pg.clients')}</h1>
      <ClientsSection />
      <ClientsDetail />
      <CTA />
    </Page>
  );
}