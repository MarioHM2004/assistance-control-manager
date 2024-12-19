// debounce.ts

/**
 * Creates a debounced version of the provided function.
 * The debounced function will delay execution until after the specified delay
 * has passed since the last time it was called.
 *
 * @template T - The type of the function to debounce.
 * @param func - The function to debounce.
 * @param delay - The number of milliseconds to delay.
 * @returns A debounced version of the function.
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout); // Clear the previous timeout if the function is called again
    timeout = setTimeout(() => func(...args), delay); // Set a new timeout to call the function
  };
}

export default debounce;
