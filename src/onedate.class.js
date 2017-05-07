const OneDate = function OneDate(config, helper) {
  const year = config.year;
  const month = config.month;
  const day = config.day;
  const adapterId = config.adapterId || helper.primaryAdapterId;
  const adapter = helper.getAdapter(adapterId);
  const primaryAdapterId = helper.primaryAdapterId;
  const primaryAdapter = helper.getAdapter(primaryAdapterId);

  const localToPrimary = (date) => {
    const i18nDate = adapter.i18n(date);
    const l10nDate = primaryAdapter.l10n(i18nDate);

    return l10nDate;
  };

  const int = () => {
    const date = localToPrimary({ year, month, day });
    const sdate = {
      year: (`${date.year}`).slice(-4),
      month: (`0${date.month}`).slice(-2),
      day: (`0${date.day}`).slice(-2),
    };

    return parseInt(`${sdate.year}${sdate.month}${sdate.day}`, 10);
  };

  const stringify = (date, seperator = '') => {
    const sdate = {
      year: (`${date.year}`).slice(-4),
      month: (`0${date.month}`).slice(-2),
      day: (`0${date.day}`).slice(-2),
    };

    return `${sdate.year}${seperator}${sdate.month}${seperator}${sdate.day}`;
  };

  const offsetYear = (offset) => {
    const date = adapter.offsetYear({ year, month, day }, offset);
    return new OneDate({
      year: date.year,
      month: date.month,
      day: date.day,
      adapterId,
    }, helper);
  };

  const offsetMonth = (offset) => {
    const date = adapter.offsetMonth({ year, month, day }, offset);
    return new OneDate({
      year: date.year,
      month: date.month,
      day: date.day,
      adapterId,
    }, helper);
  };

  const offsetDay = (offset) => {
    const date = adapter.offsetDay({ year, month, day }, offset);
    return new OneDate({
      year: date.year,
      month: date.month,
      day: date.day,
      adapterId,
    }, helper);
  };

  const weekday = (() => {
    const i18nDate = adapter.i18n({ year, month, day });
    const stringDate = stringify(i18nDate, '-');
    const jsDate = new Date(stringDate);
    return jsDate.getDay() + 1;
  })();

  return { year, month, day, adapterId, weekday, int, offsetYear, offsetMonth, offsetDay };
};

module.exports = OneDate;
