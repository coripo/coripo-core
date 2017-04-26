const Event = function Event(config) {
  const title = config.title;
  const note = config.note || '';
  const since = config.since;
  const till = config.till || config.since;

  const includes = (event, _since, _till) => {
    if (_since.int() <= since.int() && _till.int() >= since.int()) {
      return true;
    }
    if (_since.int() <= till.int() && _till.int() >= till.int()) {
      return true;
    }
    return false;
  };

  const query = (_since, _till) => {
    let events = [];
    events = events.concat(includes(this, _since, _till) ? [
      {
        title,
        note,
        since,
        till,
      }] : []);

    return events;
  };

  return { title, note, since, till, query };
};

exports.Event = Event;
