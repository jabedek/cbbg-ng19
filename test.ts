export function objectKeepKeys(
  keysToKeep: string[],
  objectToModify: Record<any, any>,
) {
  const newObj: any = {};
  keysToKeep.forEach((key) => {
    newObj[key] = objectToModify[key];
  });

  return newObj;
}

export function objectRemoveKeys(
  keysToRemove: string[],
  objectToModify: Record<any, any>,
) {
  const objCopyStr: any = JSON.stringify(objectToModify);
  const objCopy: any = JSON.parse(objCopyStr);

  Object.keys(objectToModify).forEach((objectKey) => {
    if (keysToRemove.includes(objectKey)) {
      delete objCopy[objectKey];
    }
  });
  console.log(keysToRemove);
  console.log(objectToModify);
  console.log(objCopy);

  return objCopy;
}

export function entriesKeepKeys(
  dictionary: Record<string | number, any>,
  keysToKeep: string[],
) {
  const newDictionary = Object.entries(dictionary).reduce((acc, entry) => {
    const update = Object.assign({}, acc, {
      [entry[0]]: objectKeepKeys(keysToKeep, entry[1]),
    });
    return update;
  }, {});

  return newDictionary;
}

export function renameObjectKey(
  currKey: string,
  newKeyName: string,
  obj: Record<string | number, any>,
) {
  const newObj = {} as any;

  Object.entries(obj).forEach(([key, val]) => {
    if (key === currKey) {
      newObj[newKeyName] = val;
    } else {
      newObj[key] = val;
    }
  });

  console.log(currKey, newKeyName);
  console.log(obj);
  console.log(newObj);

  return newObj;
}
