/**
 * ABN Validation using the official ATO weighted checksum algorithm.
 * Reference: https://abr.business.gov.au/Help/AbnFormat
 *
 * Weights: 10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19
 * Steps:
 *   1. Subtract 1 from the first digit
 *   2. Multiply each digit by its weight
 *   3. Sum all products
 *   4. If sum % 89 === 0, the ABN is valid
 */

const WEIGHTS = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]

export function validateAbn(raw: string): { valid: boolean; formatted: string; error?: string } {
  const digits = raw.replace(/\s+/g, '').replace(/-/g, '')

  if (!/^\d{11}$/.test(digits)) {
    return {
      valid: false,
      formatted: digits,
      error: 'ABN must be exactly 11 digits',
    }
  }

  const nums = digits.split('').map(Number)
  nums[0] -= 1

  const sum = nums.reduce((acc, digit, i) => acc + digit * WEIGHTS[i], 0)

  const valid = sum % 89 === 0

  const formatted = `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`

  return {
    valid,
    formatted,
    error: valid ? undefined : 'Invalid ABN — checksum failed',
  }
}

export function stripAbn(raw: string): string {
  return raw.replace(/\s+/g, '').replace(/-/g, '')
}
