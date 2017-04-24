const Event = function Event(config) {
  let title;
  let note;
  let since;
  let till;

  const construct = () => {
    title = config.title;
    note = config.note || '';
    since = config.since;
    till = config.till || config.since;
  };
  construct();

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
