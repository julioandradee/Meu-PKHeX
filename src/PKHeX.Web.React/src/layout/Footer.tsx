import { Flex, Layout } from 'antd'
import { Link } from 'react-router'
import { applicationName, gitHubRepository, sdkDocs } from '../constants'
import { useTranslation } from '../i18n'
import { routes } from '../routes'

export function Footer() {
  const { t } = useTranslation()

  return (
    <Layout.Footer style={{ textAlign: 'center' }}>
      <p>{t('footer.tagline', `${applicationName} - edit pokemon save files.`)}</p>
      <p>
        {t('footer.issues', 'Issues or feedback on')}{' '}
        <a href={gitHubRepository} target="_blank">
          GitHub
        </a>
      </p>
      <Flex wrap justify="center" gap="8px 16px">
        <Link to={routes.privacyPolicy}>{t('common.privacyPolicy', 'Privacy Policy')}</Link>
        <Link to={routes.termsOfUse}>{t('common.termsOfUse', 'Terms of Use')}</Link>
        <Link to={routes.credits}>{t('common.credits', 'Credits')}</Link>
        <Link to={routes.releaseNotes()}>{t('common.releaseNotes', 'Release Notes')}</Link>
        <a href="/blog">Blog</a>
        <a href={sdkDocs} target="_blank">
          SDK
        </a>
      </Flex>
    </Layout.Footer>
  )
}
