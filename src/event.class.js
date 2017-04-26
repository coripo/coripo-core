const Event = function Event(config) {
  const id = config.id || 0;
  const title = config.title;
  const color = config.color || '#000000';
  const note = config.note || '';
  const since = config.since;
  const till = config.till || config.since;
  const repeats = config.repeats || [];
  const sequels = config.sequels || [];
  const virtual = config.virtual || false;

  const offsetDate = (date, scale, step) => {
    switch (scale) {
      case 'year': {
        return date.offsetYear(step);
      }
      case 'month': {
        return date.offsetMonth(step);
      }
      case 'day': {
        return date.offsetDay(step);
      }
      default: {
        throw new Error('Invalid scale string for offsetDate method');
      }
    }
  };

  const getRepeats = (_since, _till) => {
    const qSince = (_till.int() <= _since.int()) ? _till : _since;
    const qTill = (_since.int() >= _till.int()) ? _since : _till;
    let events = [];

    repeats.forEach((pattern) => {
      let times = pattern.times;
      let cursor = {
        since: offsetDate(since, pattern.cycle, pattern.step),
        till: offsetDate(till, pattern.cycle, pattern.step),
      };
      while (times !== 0 && cursor.since.int() <= qTill.int()) {
        if (cursor.since.int() >= qSince.int()) {
          events = events.concat((new Event({
            id, virtual: true, title, color, note, sequels, since: cursor.since, till: cursor.till,
          })).query(qSince, qTill));
        }
        cursor = {
          since: offsetDate(cursor.since, pattern.cycle, pattern.step),
          till: offsetDate(cursor.till, pattern.cycle, pattern.step),
        };
        times -= 1;
      }
    });
    return events;
  };

  const getSequels = (_since, _till) => {
    const qSince = (_till.int() <= _since.int()) ? _till : _since;
    const qTill = (_since.int() >= _till.int()) ? _since : _till;
    let events = [];

    sequels.forEach((sequel) => {
      const sequelDates = {
        since: offsetDate(since, sequel.since.scale, sequel.since.offset),
        till: offsetDate(since, sequel.till.scale, sequel.till.offset),
      };
      const realSequel = new Event({
        id,
        virtual: true,
        title: sequel.title || title,
        note: sequel.note || note,
        color: sequel.color || color,
        since: sequelDates.since,
        till: sequelDates.till,
      });
      events = events.concat((realSequel).query(qSince, qTill));
    });
    return events;
  };

  const includes = (event, _since, _till) => {
    const qSince = (_till.int() <= _since.int()) ? _till : _since;
    const qTill = (_since.int() >= _till.int()) ? _since : _till;

    if (qSince.int() <= since.int() && qTill.int() >= since.int()) {
      return true;
    }
    if (qSince.int() <= till.int() && qTill.int() >= till.int()) {
      return true;
    }
    return false;
  };

  const query = (_since, _till) => {
    let events = [];

    events = events.concat(includes(this, _since, _till) ? [
      { id, virtual, title, color, note, since, till, sinceInt: since.int(), tillInt: till.int() },
    ] : []);
    events = events.concat(getRepeats(_since, _till));
    events = events.concat(getSequels(_since, _till));

    return events;
  };

  return { title, color, note, since, till, query };
};

exports.Event = Event;
