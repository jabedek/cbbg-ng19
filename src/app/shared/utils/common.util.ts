export function undefinedToNull(obj: any): any {
  if (obj === undefined) {
    return null;
  }
  if (typeof obj === 'object') {
    for (let key in obj) {
      obj[key] = undefinedToNull(obj[key]);
    }
  }
  return obj;
}

/** Change all characters except numbers and letters. */
export function replaceSpecialChars(text: string, replaceWith = '') {
  const newText = text.replaceAll(/[\W_]/g, replaceWith);

  return newText;
}

export const signalTransformBoolean = (val: boolean | string | number | null | undefined): boolean => Boolean(val);
