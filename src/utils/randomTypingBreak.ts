interface TDelayParams {
    message: string;
    min: number;
    max: number;
}

export const delay = async ({message, min, max}: TDelayParams)  => {
  const getRandomBreakTime = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const delay = Math.min( message.length * 600, getRandomBreakTime(min, max));
  await new Promise((resolve) => setTimeout(resolve, delay));
};
