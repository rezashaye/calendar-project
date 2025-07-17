import moment from "moment-jalaali";

// تنظیم moment-jalaali برای استفاده از تقویم شمسی
moment.loadPersian({ usePersianDigits: true, dialect: "persian-modern" });

// نام‌های ماه‌های شمسی
export const jalaliMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

// نام‌های روزهای هفته
export const jalaliWeekdays = [
  "شنبه",
  "یک‌شنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
];

// نام‌های کوتاه روزهای هفته
export const jalaliWeekdaysShort = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

// تابع تبدیل تاریخ میلادی به شمسی
export const toJalali = (date: Date) => {
  return moment(date).format("jYYYY/jM/jD");
};

// تابع تبدیل تاریخ شمسی به میلادی
export const fromJalali = (jalaliDate: string) => {
  return moment(jalaliDate, "jYYYY/jM/jD").toDate();
};

// تابع فرمت کردن تاریخ شمسی
export const formatJalaliDate = (
  date: Date,
  format: string = "jYYYY/jM/jD"
) => {
  return moment(date).format(format);
};

// تابع فرمت کردن تاریخ شمسی با نام ماه
export const formatJalaliDateWithMonth = (date: Date) => {
  const jMoment = moment(date);
  const year = jMoment.jYear();
  const month = jalaliMonths[jMoment.jMonth()];
  const day = jMoment.jDate();
  return `${day} ${month} ${year}`;
};

// تابع فرمت کردن ماه و سال شمسی
export const formatJalaliMonthYear = (date: Date) => {
  const jMoment = moment(date);
  const year = jMoment.jYear();
  const month = jalaliMonths[jMoment.jMonth()];
  return `${month} ${year}`;
};

// تابع گرفتن نام روز هفته
export const getJalaliWeekday = (date: Date) => {
  const jalaliDayOfWeek = getJalaliDayOfWeek(date);
  return jalaliWeekdays[jalaliDayOfWeek];
};

// تابع گرفتن نام کوتاه روز هفته
export const getJalaliWeekdayShort = (date: Date) => {
  const jalaliDayOfWeek = getJalaliDayOfWeek(date);
  return jalaliWeekdaysShort[jalaliDayOfWeek];
};

// تابع گرفتن اول ماه شمسی
export const getJalaliMonthStart = (date: Date) => {
  return moment(date).startOf("jMonth").toDate();
};

// تابع گرفتن آخر ماه شمسی
export const getJalaliMonthEnd = (date: Date) => {
  return moment(date).endOf("jMonth").toDate();
};

// تابع اضافه کردن ماه شمسی
export const addJalaliMonth = (date: Date, months: number) => {
  return moment(date).add(months, "jMonth").toDate();
};

// تابع کم کردن ماه شمسی
export const subtractJalaliMonth = (date: Date, months: number) => {
  return moment(date).subtract(months, "jMonth").toDate();
};

// تابع گرفتن تعداد روزهای ماه شمسی
export const getJalaliDaysInMonth = (date: Date) => {
  return moment(date).endOf("jMonth").jDate();
};

// تابع گرفتن اول ماه شمسی به شکل Date
export const getJalaliFirstDayOfMonth = (date: Date) => {
  const jMoment = moment(date);
  const year = jMoment.jYear();
  const month = jMoment.jMonth();
  // ایجاد اول ماه شمسی
  const firstDay = moment().jYear(year).jMonth(month).jDate(1);
  return firstDay.toDate();
};

// تابع گرفتن روز هفته شمسی (0 = شنبه، 6 = جمعه)
export const getJalaliDayOfWeek = (date: Date) => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  // تبدیل به فرمت شمسی (0 = شنبه، 6 = جمعه)
  // JavaScript: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  // Persian: 0=شنبه, 1=یک‌شنبه, 2=دوشنبه, 3=سه‌شنبه, 4=چهارشنبه, 5=پنج‌شنبه, 6=جمعه
  // Mapping:
  // Sunday (0) -> یک‌شنبه (1)
  // Monday (1) -> دوشنبه (2)
  // Tuesday (2) -> سه‌شنبه (3)
  // Wednesday (3) -> چهارشنبه (4)
  // Thursday (4) -> پنج‌شنبه (5)
  // Friday (5) -> جمعه (6)
  // Saturday (6) -> شنبه (0)
  return dayOfWeek === 6 ? 0 : dayOfWeek + 1;
};

// تابع گرفتن داده‌های ماه شمسی برای تقویم
export const getJalaliMonthData = (date: Date) => {
  const jMoment = moment(date);
  const year = jMoment.jYear();
  const month = jMoment.jMonth();

  // اول ماه شمسی
  const firstDayOfMonth = moment().jYear(year).jMonth(month).jDate(1).toDate();
  const firstDayWeekday = getJalaliDayOfWeek(firstDayOfMonth);

  // تعداد روزهای ماه
  const daysInMonth = moment()
    .jYear(year)
    .jMonth(month)
    .endOf("jMonth")
    .jDate();

  const days = [];

  // اضافه کردن خانه‌های خالی برای روزهای قبل از اول ماه
  for (let i = 0; i < firstDayWeekday; i++) {
    days.push(null);
  }

  // اضافه کردن روزهای ماه
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDay = moment().jYear(year).jMonth(month).jDate(day).toDate();
    days.push(currentDay);
  }

  return {
    days,
    year,
    month,
    monthName: jalaliMonths[month],
    daysInMonth,
    firstDayWeekday,
  };
};

// تابع گرفتن تاریخ شمسی به شکل عدد
export const getJalaliDate = (date: Date) => {
  return moment(date).jDate();
};

// تابع گرفتن ماه شمسی به شکل عدد
export const getJalaliMonth = (date: Date) => {
  return moment(date).jMonth();
};

// تابع گرفتن سال شمسی به شکل عدد
export const getJalaliYear = (date: Date) => {
  return moment(date).jYear();
};

// تابع گرفتن تاریخ شمسی کامل به شکل رشته
export const getJalaliFullDate = (date: Date) => {
  const jMoment = moment(date);
  const year = jMoment.jYear();
  const month = jalaliMonths[jMoment.jMonth()];
  const day = jMoment.jDate();
  const weekday = getJalaliWeekday(date);
  return `${weekday} ${day} ${month} ${year}`;
};

// تابع فرمت کردن تاریخ کامل برای هدر
export const formatJalaliFullDate = (date: Date) => {
  return getJalaliFullDate(date);
};

export default moment;
