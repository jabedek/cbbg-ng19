export const QUESTIONS = [
  { _id: '30491599', text: 'Co by było gdyby...' },
  { _id: 'ae08dabd', text: 'Co powiedział(a)...' },
  { _id: 'd9b9c2f4', text: 'Co by powiedział(a)...' },
  { _id: 'e88f1db7', text: 'Co mogłoby...' },
  { _id: 'ab516809', text: 'Co chciał(a)by...' },
  { _id: '84219e5a', text: 'Co chciał(a)byś...' },
  { _id: '7084eead', text: 'Ile trzeba...' },
  { _id: '38bf984c', text: 'Ile kosztuje...' },
  { _id: 'f491bc85', text: 'Gdzie...' },
  { _id: '5e9dbde5', text: 'Skąd...' },
  { _id: 'de1acca3', text: 'Kiedy...' },
  { _id: 'bba64790', text: 'Od kiedy...' },
  { _id: 'a4ba8df7', text: 'Kto...' },
  { _id: '968fe528', text: 'Kto był...' },
  { _id: '09cd743e', text: 'Kto wymyślił...' },
  { _id: 'f07fc0c6', text: 'Kim był...' },
  { _id: '54eb8f8b', text: 'Z kim...' },
  { _id: '173bf402', text: 'Po kim...' },
  { _id: '8f15465d', text: 'Za kogo...' },
  { _id: '1499b4af', text: 'Za co...' },
  { _id: 'a0a26468', text: 'Dlaczego...' },
  { _id: '0928c929', text: 'Po co...' },
  { _id: '92db7f7a', text: 'Jak...' },
  { _id: '62a32468', text: 'Jak nazwiesz...' },
  { _id: 'cb3b1f56', text: 'Jak to możliwe, że...' },
  { _id: '422b5c66', text: 'Jaka jest szansa na to, że...' },
  { _id: '57319e62', text: 'Czym różni się...' },
  { _id: 'fb2aa6c5', text: 'W jakiej kolejności...' },
  { _id: '8f847e51', text: 'Przed czym...' },
] as const;

export type QuestionPremise = (typeof QUESTIONS)[number];
