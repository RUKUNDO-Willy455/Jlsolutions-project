import Page from '../components/Page';
import Founder from '../components/Founder';
import FounderSpecialties from '../components/FounderSpecialties';
import CTA from '../components/CTA';
import { useI18n } from '../i18n';

export default function FounderPage() {
  const { t } = useI18n();
  return (
    <Page>
      <h1 className="sr-only">{t('pg.founder')}</h1>
      <Founder />
      <FounderSpecialties />
      <CTA />
    </Page>
  );
}