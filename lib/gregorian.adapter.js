'use strict';

var i18next = require('i18next');
var locales = require('../locales/index.js');

var Adapter = function Adapter() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  i18next.init({
    lng: config.locale || 'en',
    fallbackLng: 'en',
    initImmediate: false,
    resources: locales
  });
  var trl = function trl(key) {
    i18next.store.data = locales;
    i18next.changeLanguage(config.locale || 'en');
    return i18next.t(key);
  };
  var id = 'coripo.coripo.adapter.gregorian';
  var name = trl('gregorian-adapter.name');
  var description = trl('gregorian-adapter.description');

  var l10n = function l10n(date) {
    return date;
  };

  var i18n = function i18n(ldate) {
    return ldate;
  };

  var getMonthName = function getMonthName(month, short) {
    var shortNameKey = 'gregorian-adapter.months.' + month + '.short';
    var fullNameKey = 'gregorian-adapter.months.' + month + '.name';
    var string = short ? trl(shortNameKey) : trl(fullNameKey);
    if (string === shortNameKey || string === fullNameKey) {
      throw new Error('Invalid month number, number should be between 1 and 12');
    }
    return string;
  };

  var getMonthLength = function getMonthLength(year, month) {
    return new Date(year, month, 0).getDate();
  };

  var isValid = function isValid(date) {
    return date.year >= 1 && date.month >= 1 && date.month <= 12 && date.day >= 1 && date.day <= getMonthLength(date.year, date.month);
  };

  var isLeap = function isLeap(year) {
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  };

  var offsetYear = function offsetYear(date, offset) {
    var i18nDate = i18n({ year: date.year, month: date.month, day: date.day });
    var jsDate = new Date(i18nDate.year + '-' + i18nDate.month + '-' + i18nDate.day);
    jsDate.setFullYear(jsDate.getFullYear() + offset);
    return l10n({
      year: jsDate.getFullYear(),
      month: jsDate.getMonth() + 1,
      day: jsDate.getDate()
    });
  };

  var offsetMonth = function offsetMonth(date, offset) {
    var i18nDate = i18n({ year: date.year, month: date.month, day: date.day });
    var jsDate = new Date(i18nDate.year + '-' + i18nDate.month + '-' + i18nDate.day);
    jsDate.setMonth(jsDate.getMonth() + offset);
    return l10n({
      year: jsDate.getFullYear(),
      month: jsDate.getMonth() + 1,
      day: jsDate.getDate()
    });
  };

  var offsetDay = function offsetDay(date, offset) {
    var i18nDate = i18n({ year: date.year, month: date.month, day: date.day });
    var jsDate = new Date(i18nDate.year + '-' + i18nDate.month + '-' + i18nDate.day);
    jsDate.setDate(jsDate.getDate() + offset);
    return l10n({
      year: jsDate.getFullYear(),
      month: jsDate.getMonth() + 1,
      day: jsDate.getDate()
    });
  };

  return {
    id: id,
    name: name,
    description: description,
    l10n: l10n,
    i18n: i18n,
    isValid: isValid,
    isLeap: isLeap,
    getMonthName: getMonthName,
    getMonthLength: getMonthLength,
    offsetYear: offsetYear,
    offsetMonth: offsetMonth,
    offsetDay: offsetDay
  };
};

exports.Adapter = Adapter;
//# sourceMappingURL=gregorian.adapter.js.map