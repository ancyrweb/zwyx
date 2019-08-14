const filterUnique = <T extends any>(val: T, index: number, array: T[]) => array.indexOf(val) === index;
const unique = <T extends any>(array: T[]) => array.filter(filterUnique);

export default unique;
