const Event = function Event(config) {
  const id = config.id || 0;
  const title = config.title;
  const color = config.color || '#000000';
  const note = config.note || '';
  const since = config.since;
  const till = config.till || config.since;
  const repeats = config.repeats || [];
  const virtual = config.virtual || false;

  const offsetRange = (_since, _till, cycle, step) => {
    switch (cycle) {
      case 'year': {
        return {
          since: _since.offsetYear(step),
          till: _till.offsetYear(step),
        };
      }
      case 'month': {
        return {
          since: _since.offsetMonth(step),
          till: _till.offsetMonth(step),
        };
      }
      case 'day': {
        return {
          since: _since.offsetDay(step),
          till: _till.offsetDay(step),
        };
      }
      default: {
        throw new Error('Invalid cycle string for offsetRange method');
      }
    }
  };

  const getRepeats = (_since, _till) => {
    const qSince = (_till.int() <= _since.int()) ? _till : _since;
    const qTill = (_since.int() >= _till.int()) ? _since : _till;
    let events = [];

    repeats.forEach((pattern) => {
      let times = pattern.times;
      let cursor = offsetRange(since, till, pattern.cycle, pattern.step);
      while (times !== 0 && cursor.since.int() <= qTill.int()) {
        if (cursor.since.int() >= qSince.int()) {
          events = events.concat((new Event({
            id, virtual: true, title, color, note, since: cursor.since, till: cursor.till,
          })).query(qSince, qTill));
        }
        cursor = offsetRange(cursor.since, cursor.till, pattern.cycle, pattern.step);
        times -= 1;
      }
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

    return events;
  };

  return { title, color, note, since, till, query };
};

exports.Event = Event;
