const deepSet = (obj: object, path: string | string[], val: any) => {
  if (typeof path === "string") path = path.split(".");

  if (path.length === 0) return val;

  const next = path.shift();
  obj[next] = deepSet(obj[next] || {}, path, val);
  return obj;
};

export default deepSet;
