import { replaceSpecialChars } from './common.util';

/** If user display name is empty, create it based on email */
export function generateUserDisplayName(userEmail: string) {
  const [emailUser, emailDomain] = userEmail.split('@');
  const normalizedUser = replaceSpecialChars(emailUser);

  if (normalizedUser.length >= 8) {
    return `${normalizedUser.substring(0, 6).toUpperCase()}-${Math.randomInt(10, 99)}`;
  }

  const normalizedDomain = replaceSpecialChars(emailDomain.split('.')[0]);

  const userPart = `${normalizedUser[0]}${normalizedUser[normalizedUser.length - 1]}`;
  const domainPart = normalizedDomain.substring(0, 1);
  const fullDisplayName = `${userPart}${domainPart}-${Math.randomInt(1000, 9999)}`;

  return fullDisplayName.toUpperCase();
}
