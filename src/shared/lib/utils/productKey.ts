/**
 * Generates a random license key for digital products.
 * Formats:
 * - XXXX-XXXX-XXXX-XXXX (4 blocks of 4 alphanumeric characters)
 * - XXXXX-XXXXX-XXXXX (3 blocks of 5 alphanumeric characters)
 */
export function generateProductKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const getRandomBlock = (length: number) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Randomly choose between 4-character and 5-character formats
  const useFiveCharFormat = Math.random() > 0.5;

  if (useFiveCharFormat) {
    return `${getRandomBlock(5)}-${getRandomBlock(5)}-${getRandomBlock(5)}`;
  } else {
    return `${getRandomBlock(4)}-${getRandomBlock(4)}-${getRandomBlock(4)}-${getRandomBlock(4)}`;
  }
}
