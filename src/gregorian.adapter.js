const Adapter = function Adapter() {
  const id = 'coripo.coripo.adapter.gregorian';
  const name = 'Gregorian';
  const description = 'The Gregorian calendar is internationally the most widely used civil calendar.';

  const months = [
    { name: 'January', short: 'Jan' },
    { name: 'February', short: 'Feb' },
    { name: 'March', short: 'Mar' },
    { name: 'April', short: 'Apr' },
    { name: 'May', short: 'May' },
    { name: 'June', short: 'Jun' },
    { name: 'July', short: 'Jul' },
    { name: 'August', short: 'Aug' },
    { name: 'September', short: 'Sept' },
    { name: 'October', short: 'Oct' },
    { name: 'November', short: 'Nov' },
    { name: 'December', short: 'Dec' },
  ];

  const l10n = date => date;

  const i18n = ldate => ldate;

  const getMonthName = (month, short) => {
    const mon = (months[month - 1]);
    if (typeof mon === 'undefined') {
      throw new Error('Invalid month number, number should be between 1 and 12');
    }
    return short ? mon.short : mon.name;
  };

  const getMonthLength = (year, month) => new Date(year, month, 0).getDate();

  const isValid = date => (date.year >= 1)
    && (date.month >= 1 && date.month <= 12)
    && (date.day >= 1 && date.day <= getMonthLength(date.year, date.month));

  const isLeap = year => ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);

  const offsetYear = (date, offset) => {
    const i18nDate = i18n({ year: date.year, month: date.month, day: date.day });
    const jsDate = new Date(`${i18nDate.year}-${i18nDate.month}-${i18nDate.day}`);
    jsDate.setFullYear(jsDate.getFullYear() + offset);
    return l10n({
      year: jsDate.getFullYear(),
      month: jsDate.getMonth() + 1,
      day: jsDate.getDate(),
    });
  };

  const offsetMonth = (date, offset) => {
    const i18nDate = i18n({ year: date.year, month: date.month, day: date.day });
    const jsDate = new Date(`${i18nDate.year}-${i18nDate.month}-${i18nDate.day}`);
    jsDate.setMonth(jsDate.getMonth() + offset);
    return l10n({
      year: jsDate.getFullYear(),
      month: jsDate.getMonth() + 1,
      day: jsDate.getDate(),
    });
  };

  const offsetDay = (date, offset) => {
    const i18nDate = i18n({ year: date.year, month: date.month, day: date.day });
    const jsDate = new Date(`${i18nDate.year}-${i18nDate.month}-${i18nDate.day}`);
    jsDate.setDate(jsDate.getDate() + offset);
    return l10n({
      year: jsDate.getFullYear(),
      month: jsDate.getMonth() + 1,
      day: jsDate.getDate(),
    });
  };

  return {
    id,
    name,
    description,
    l10n,
    i18n,
    isValid,
    isLeap,
    getMonthName,
    getMonthLength,
    offsetYear,
    offsetMonth,
    offsetDay,
  };
};

exports.Adapter = Adapter;
