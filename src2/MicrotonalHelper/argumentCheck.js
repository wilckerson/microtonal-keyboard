export function isRequired(value, argument) {
  if (value === undefined)
    throw new Error(`The argument ${argument} is required`);
}

export function isArray(value, argument) {
  if (!Array.isArray(value))
    throw new Error(`The argument ${argument} must be an Array`);
}
