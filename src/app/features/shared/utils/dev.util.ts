export async function tryCatch(promise: Promise<any>) {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    console.error(error);
    return [null, error];
  }
}

export function consoleError(catchedError: any, prefixWhere = '', prefixIntent = '') {
  const groupStyle = 'display: flex; background-color: darkred; color: white; padding: 4px;';
  const prefixWhereStyle = 'background-color: darkred; color: rgba(255,140,140); padding: 4px 0px;';
  const prefixIntentStyle = 'background-color: darkred; color: rgba(255,140,140); padding: 4px 0px;';
  const catchedErrorStyle =
    'background-color: darkred; color: lightgray; font-weight: 500; padding: 4px 0px; text-decoration: underline;';

  console.groupCollapsed(`%cApp Error`, groupStyle);

  console.error(
    `\n%c${prefixWhere}\n%c${prefixIntent}\n%c${catchedError}`,
    prefixWhereStyle,
    prefixIntentStyle,
    catchedErrorStyle,
  );

  console.groupEnd();
}
