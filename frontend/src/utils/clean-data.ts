export const cleanData = (obj: any): any => {
  const cleaned: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) cleaned[key] = obj[key];
  });
  return cleaned;
};