export function createStatusQuery(key, values) {
  return values.reduce((accumulator, value) => {
    accumulator[value] = { [key]: value };
    return accumulator;
  }, {});
}

