import fs from 'fs';

export default (firstConfig, secondConfig) => {
  const getObjectView = config => JSON.parse(fs.readFileSync(config, 'utf-8'));
  const first = getObjectView(firstConfig);
  const second = getObjectView(secondConfig);
  const properties = new Set([...Object.keys(first), ...Object.keys(second)]);
  const propertyAction = [
    {
      type: 'unchanged',
      check: prop => first[prop] === second[prop],
      view: prop => `    ${prop}: ${first[prop]}`,
    },
    {
      type: 'deleted',
      check: prop => !second[prop],
      view: prop => `  - ${prop}: ${first[prop]}`,
    },
    {
      type: 'added',
      check: prop => !first[prop] && second[prop],
      view: prop => `  + ${prop}: ${second[prop]}`,
    },
    {
      type: 'changed',
      check: prop => first[prop] !== second[prop],
      view: prop => `  + ${prop}: ${second[prop]}\n  - ${prop}: ${first[prop]}`,
    },
  ];
  const getPropertyAction = prop => propertyAction.find(({ check }) => check(prop));
  const resultArray = [...properties].reduce(
    (acc, prop) => {
      const { view } = getPropertyAction(prop);
      return [...acc, view(prop)];
    }, [],
  );
  return `{\n${resultArray.join('\n')}\n}`;
};
