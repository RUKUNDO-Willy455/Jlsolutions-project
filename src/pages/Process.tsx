import Page from '../components/Page';
import ProcessSection from '../components/ProcessSection';
import ProcessSpecialties from '../components/ProcessSpecialties';
import CTA from '../components/CTA';
import { useI18n } from '../i18n';

export default function ProcessPage() {
  const { t } = useI18n();
  return (
    <Page>
      <h1 className="sr-only">{t('pg.process')}</h1>
      <ProcessSection />
      <ProcessSpecialties />
      <CTA />
    </Page>
  );
}