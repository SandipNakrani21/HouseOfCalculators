/** Localize the ASCII numeric literals in authored examples, not prose or inputs. */
export function formatGuideExample(value: string, locale: string): string {
  return value.replace(/\d+(?:,\d{3})*(?:\.\d+)?/g, token => {
    const decimals = token.split(".")[1]?.length ?? 0;
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: token.includes(","),
    }).format(Number(token.replaceAll(",", "")));
  });
}
