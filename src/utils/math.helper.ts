/**
 * Financial & E-Commerce Calculation Utilities
 * Handles currency parsing, subtotal aggregation, 8% tax rounding, and sort verification.
 */
export class MathHelper {
  public static readonly DEFAULT_TAX_RATE = 0.08;

  /**
   * Extracts numeric value from formatted currency text (e.g., "$29.99" or "Item total: $29.99")
   */
  public static parseCurrency(text: string): number {
    const cleaned = text.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    if (Number.isNaN(parsed)) {
      throw new Error(`Unable to parse currency from string: "${text}"`);
    }
    return this.roundToTwoDecimals(parsed);
  }

  /**
   * Rounds a numeric value to 2 decimal places using standard financial rounding
   */
  public static roundToTwoDecimals(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  /**
   * Calculates exact item subtotal from an array of item prices
   */
  public static calculateSubtotal(prices: number[]): number {
    const sum = prices.reduce((acc, price) => acc + price, 0);
    return this.roundToTwoDecimals(sum);
  }

  /**
   * Calculates Swag Labs 8% sales tax rounded to 2 decimal places
   */
  public static calculateTax(subtotal: number, taxRate = this.DEFAULT_TAX_RATE): number {
    return this.roundToTwoDecimals(subtotal * taxRate);
  }

  /**
   * Calculates grand total (subtotal + tax) rounded to 2 decimal places
   */
  public static calculateGrandTotal(prices: number[], taxRate = this.DEFAULT_TAX_RATE): {
    subtotal: number;
    tax: number;
    total: number;
  } {
    const subtotal = this.calculateSubtotal(prices);
    const tax = this.calculateTax(subtotal, taxRate);
    const total = this.roundToTwoDecimals(subtotal + tax);
    return { subtotal, tax, total };
  }

  /**
   * Verifies if an array of strings is sorted alphabetically A -> Z
   */
  public static isSortedAscendingStrings(items: string[]): boolean {
    const expected = [...items].sort((a, b) => a.localeCompare(b));
    return items.every((val, idx) => val === expected[idx]);
  }

  /**
   * Verifies if an array of strings is sorted alphabetically Z -> A
   */
  public static isSortedDescendingStrings(items: string[]): boolean {
    const expected = [...items].sort((a, b) => b.localeCompare(a));
    return items.every((val, idx) => val === expected[idx]);
  }

  /**
   * Verifies if an array of numbers is sorted Low -> High
   */
  public static isSortedAscendingNumbers(values: number[]): boolean {
    for (let i = 1; i < values.length; i++) {
      if (values[i] < values[i - 1]) return false;
    }
    return true;
  }

  /**
   * Verifies if an array of numbers is sorted High -> Low
   */
  public static isSortedDescendingNumbers(values: number[]): boolean {
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) return false;
    }
    return true;
  }
}

export const parseCurrency = (text: string): number => MathHelper.parseCurrency(text);
export const roundToTwoDecimals = (value: number): number => MathHelper.roundToTwoDecimals(value);


