import { loop } from 'frotsi';

function simpleEncryption(pwd: string) {
  const randomChar = '㋛'; // String.fromCodePoint(Math.randomInt(100, 115));
  loop(Math.randomInt(2, 4)).forEach(() => (pwd += randomChar));

  return (
    pwd
      .split('')
      .map((char) => {
        const code = char.codePointAt(0);
        return code ? code + 1000 : code;
      })
      .join('_') + '㋛'
  );
}

function simpleDecryption(codedPwd: string) {
  const split = codedPwd.replace('㋛', '').split('_');
  console.log(split);
  const regex = new RegExp(split[split.length - 1], 'g');
  console.log(regex);
  const nums = [...codedPwd.matchAll(regex)].length;
  console.log(nums);
  const splitSpliced = split.toSpliced(split.length - nums);
  console.log(splitSpliced);
  return splitSpliced.map((code) => String.fromCodePoint(Number(code) - 1000)).join('');
}

export class AppCrypto {
  static encrypt(pwd: string) {
    const encoded = simpleEncryption(pwd);
    console.log('crypto encrypt', pwd, encoded);

    return encoded;
  }

  static decrypt(codedPwd: string) {
    const decoded = simpleDecryption(codedPwd);
    console.log('crypto decrypt', codedPwd, decoded);

    return decoded;
  }
}
