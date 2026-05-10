declare module 'opossum' {
  type CircuitBreakerOptions = {
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
  };

  export default class CircuitBreaker<TArgs extends unknown[], TResult> {
    constructor(action: (...args: TArgs) => Promise<TResult>, options?: CircuitBreakerOptions);
    fire(...args: TArgs): Promise<TResult>;
  }
}
