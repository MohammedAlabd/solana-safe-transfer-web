export const log = (options: { debug?: Boolean; message: any }) => {
  const shouldLog = options.debug || process.env.DEBUG;
  if (shouldLog) {
    console.log(...options.message);
  }
};
