export const sleep = async (sec: number) => {
  return new Promise((resolve) => setTimeout(resolve, 1000 * sec));
};
