const OneDate = function OneDate(config, helper) {
  let object;
  let year;
  let month;
  let day;
  let adapterId;
  let adapter;
  let primaryAdapter;
  let primaryAdapterId;

  const construct = () => {
    year = config.year;
    month = config.month;
    day = config.day;
    adapterId = config.adapterId || helper.primaryAdapterId;
    adapter = helper.getAdapter(adapterId);
    primaryAdapterId = helper.primaryAdapterId;
    primaryAdapter = helper.getAdapter(primaryAdapterId);
  };
  construct();

  const getYear = () => year;
  const getMonth = () => month;
  const getDay = () => day;

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

  const offsetYear = (offset) => {
    const i18nDate = adapter.i18n({ year, month, day });
    const jsDate = new Date(`${i18nDate.year}-${i18nDate.month}-${i18nDate.day}`);
    jsDate.setFullYear(jsDate.getFullYear() + offset);
    const l10nDate = adapter.l10n({
      year: jsDate.getFullYear(),
      month: jsDate.getMonth() + 1,
      day: jsDate.getDate(),
    });
    year = l10nDate.year;
    month = l10nDate.month;
    day = l10nDate.day;

    return object;
  };

  const offsetMonth = (offset) => {
    const i18nDate = adapter.i18n({ year, month, day });
    const jsDate = new Date(`${i18nDate.year}-${i18nDate.month}-${i18nDate.day}`);
    jsDate.setMonth(jsDate.getMonth() + offset);
    const l10nDate = adapter.l10n({
      year: jsDate.getFullYear(),
      month: jsDate.getMonth() + 1,
      day: jsDate.getDate(),
    });
    year = l10nDate.year;
    month = l10nDate.month;
    day = l10nDate.day;

    return object;
  };

  const offsetDay = (offset) => {
    const i18nDate = adapter.i18n({ year, month, day });
    const jsDate = new Date(`${i18nDate.year}-${i18nDate.month}-${i18nDate.day}`);
    jsDate.setDate(jsDate.getDate() + offset);
    const l10nDate = adapter.l10n({
      year: jsDate.getFullYear(),
      month: jsDate.getMonth() + 1,
      day: jsDate.getDate(),
    });
    year = l10nDate.year;
    month = l10nDate.month;
    day = l10nDate.day;

    return object;
  };

  object = { getYear, getMonth, getDay, int, offsetYear, offsetMonth, offsetDay };

  return object;
};

exports.OneDate = OneDate;
