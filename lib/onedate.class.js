"use strict";

var OneDate = function OneDate(config, helper) {
  var year = config.year;
  var month = config.month;
  var day = config.day;
  var adapterId = config.adapterId || helper.primaryAdapterId;
  var adapter = helper.getAdapter(adapterId);
  var primaryAdapterId = helper.primaryAdapterId;
  var primaryAdapter = helper.getAdapter(primaryAdapterId);

  var localToPrimary = function localToPrimary(date) {
    var i18nDate = adapter.i18n(date);
    var l10nDate = primaryAdapter.l10n(i18nDate);

    return l10nDate;
  };

  var int = function int() {
    var date = localToPrimary({ year: year, month: month, day: day });
    var sdate = {
      year: ("" + date.year).slice(-4),
      month: ("0" + date.month).slice(-2),
      day: ("0" + date.day).slice(-2)
    };

    return parseInt("" + sdate.year + sdate.month + sdate.day, 10);
  };

  var offsetYear = function offsetYear(offset) {
    var date = adapter.offsetYear({ year: year, month: month, day: day }, offset);
    return new OneDate({
      year: date.year,
      month: date.month,
      day: date.day,
      adapterId: adapterId
    }, helper);
  };

  var offsetMonth = function offsetMonth(offset) {
    var date = adapter.offsetMonth({ year: year, month: month, day: day }, offset);
    return new OneDate({
      year: date.year,
      month: date.month,
      day: date.day,
      adapterId: adapterId
    }, helper);
  };

  var offsetDay = function offsetDay(offset) {
    var date = adapter.offsetDay({ year: year, month: month, day: day }, offset);
    return new OneDate({
      year: date.year,
      month: date.month,
      day: date.day,
      adapterId: adapterId
    }, helper);
  };

  return { year: year, month: month, day: day, int: int, offsetYear: offsetYear, offsetMonth: offsetMonth, offsetDay: offsetDay };
};

module.exports = OneDate;
//# sourceMappingURL=onedate.class.js.map