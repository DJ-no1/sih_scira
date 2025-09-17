/**
 * Utility for wrapping database operations with timeout handling
 */

export class DatabaseTimeoutError extends Error {
  constructor(operation: string, timeout: number) {
    super(`Database operation '${operation}' timed out after ${timeout}ms`);
    this.name = 'DatabaseTimeoutError';
  }
}

/**
 * Wraps a database operation with a timeout
 */
export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number = 15000,
  operationName: string = 'database operation'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new DatabaseTimeoutError(operationName, timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation, timeoutPromise]);
  } catch (error) {
    if (error instanceof DatabaseTimeoutError) {
      console.error(`⚠️ Database timeout: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Retry wrapper for database operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
  operationName: string = 'database operation'
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        console.error(`❌ Database operation '${operationName}' failed after ${maxRetries} attempts:`, lastError);
        throw lastError;
      }
      
      const delay = baseDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
      console.warn(`⚠️ Database operation '${operationName}' failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Combined timeout and retry wrapper
 */
export async function withTimeoutAndRetry<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 15000,
  maxRetries: number = 2,
  operationName: string = 'database operation'
): Promise<T> {
  return withRetry(
    () => withTimeout(operation(), timeoutMs, operationName),
    maxRetries,
    1000,
    operationName
  );
}