export function buildQueryString<T extends object>(
  params?: T
) {

  if (!params)
    return "";


  const query = new URLSearchParams();


  Object.entries(params)
    .forEach(([key, value]) => {

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.append(
          key,
          String(value)
        );
      }

    });


  const result =
    query.toString();


  return result
    ? `?${result}`
    : "";
}