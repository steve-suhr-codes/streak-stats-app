import { Linking } from 'react-native';

// Hosted on stevesuhr.com (repo: steve-suhr-com, app/streak-stats/).
export const PRIVACY_POLICY_URL = 'https://stevesuhr.com/streak-stats/privacy';
export const TERMS_URL = 'https://stevesuhr.com/streak-stats/terms';

/** Opens a URL in the phone's browser. */
export function openLink(url: string) {
  void Linking.openURL(url);
}
