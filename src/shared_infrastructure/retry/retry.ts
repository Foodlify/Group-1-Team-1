function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  action: String,
): Promise<T> {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      console.log(`Attempt ${attempt} of ${action} failed`);
      if (attempt < retries) {
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}
