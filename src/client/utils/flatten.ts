const flatten = (arr: any[]) => {
  let next = [];
  for (let val of arr) {
    if (Array.isArray(val)) {
      for (let innerVal of val) {
        next.push(innerVal);
      }
    } else {
      next.push(val);
    }
  }

  return next;
};

export default flatten;
