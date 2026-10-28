/** Returns a new selection with the value added or removed. */
export const toggleFilterValue = <T>(values: readonly T[], value: T): T[] =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
