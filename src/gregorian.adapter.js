const i18next = require('i18next');
const locales = require('../locales/index.js');

const Adapter = function Adapter(config = {}) {
  i18next.init({
    lng: config.locale || 'en',
    fallbackLng: 'en',
    initImmediate: false,
    resources: locales,
  });
  const trl = (key) => {
    i18next.store.data = locales;
    i18next.changeLanguage(config.locale || 'en');
    return i18next.t(key);
  };
  const id = 'coripo.coripo.adapter.gregorian';
  const name = trl('gregorian-adapter.name');
  const description = trl('gregorian-adapter.description');

  const l10n = date => date;

  const i18n = ldate => ldate;

  const getMonthName = (month, short) => {
    const shortNameKey = `gregorian-adapter.months.${month}.short`;
    const fullNameKey = `gregorian-adapter.months.${month}.name`;
    const string = short ? trl(shortNameKey) : trl(fullNameKey);
    if (string === shortNameKey || string === fullNameKey) {
      throw new Error('Invalid month number, number should be between 1 and 12');
    }
    return string;
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
