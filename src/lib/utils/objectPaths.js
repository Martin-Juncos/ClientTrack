export function setValueAtPath(target, path, value) {
  const segments = path.split(".");
  const clone = structuredClone(target);
  let current = clone;

  segments.slice(0, -1).forEach((segment) => {
    current[segment] ??= {};
    current = current[segment];
  });

  current[segments.at(-1)] = value;
  return clone;
}
