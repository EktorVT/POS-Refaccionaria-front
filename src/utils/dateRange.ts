export type DatePreset = "all" | "today" | "week" | "month" | "custom";

export interface DateRange {
  from?: string;
  to?: string;
}

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

const parseLocalDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export function getDateRange(
  preset: DatePreset,
  customFrom = "",
  customTo = ""
): DateRange {
  const now = new Date();

  switch (preset) {
    case "today":
      return {
        from: startOfDay(now).toISOString(),
        to: endOfDay(now).toISOString()
      };
    case "week": {
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // lunes
      return {
        from: startOfDay(monday).toISOString(),
        to: endOfDay(now).toISOString()
      };
    }
    case "month":
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        to: endOfDay(now).toISOString()
      };
    case "custom":
      return {
        from: customFrom
          ? startOfDay(parseLocalDate(customFrom)).toISOString()
          : undefined,
        to: customTo
          ? endOfDay(parseLocalDate(customTo)).toISOString()
          : undefined
      };
    default:
      return {};
  }
}
