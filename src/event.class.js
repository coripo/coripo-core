/* eslint-disable no-param-reassign */
const Event = function Event(config) {
  const overlapRule = { ALLOW: 'allow', TRIM: 'trim', REMOVE: 'remove', SPLIT: 'split' };
  const id = config.id || 0;
  const title = config.title;
  const color = config.color || '#000000';
  const note = config.note || '';
  const since = config.since;
  const till = config.till || config.since;
  const repeats = config.repeats || [];
  const sequels = config.sequels || [];
  const virtual = config.virtual || false;
  const priority = config.priority || 0;
  const overlap = config.overlap || {};
  overlap.internal = overlap.internal || overlapRule.ALLOW;
  overlap.external = overlap.external || overlapRule.ALLOW;

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

    repeats.forEach((pattern, index) => {
      let times = pattern.times;
      let round = 1;
      let cursor = {
        since: offsetDate(since, pattern.cycle, pattern.step),
        till: offsetDate(till, pattern.cycle, pattern.step),
      };
      while (times !== 0 && cursor.since.int() <= qTill.int()) {
        if (cursor.since.int() >= qSince.int()) {
          events = events.concat((new Event({
            id,
            virtual: true,
            priority: priority + (round * (index + 1) * (sequels.length + 1)),
            title,
            color,
            note,
            sequels,
            since: cursor.since,
            till: cursor.till,
          })).query(qSince, qTill));
        }
        cursor = {
          since: offsetDate(cursor.since, pattern.cycle, pattern.step),
          till: offsetDate(cursor.till, pattern.cycle, pattern.step),
        };
        round += 1;
        times -= 1;
      }
    });
    return events;
  };

  const getSequels = (_since, _till) => {
    const qSince = (_till.int() <= _since.int()) ? _till : _since;
    const qTill = (_since.int() >= _till.int()) ? _since : _till;
    let events = [];

    sequels.forEach((sequel, index) => {
      const sequelDates = {
        since: offsetDate(since, sequel.since.scale, sequel.since.offset),
        till: offsetDate(since, sequel.till.scale, sequel.till.offset),
      };
      const realSequel = new Event({
        id,
        virtual: true,
        priority: priority + (index + 1),
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
    const qEvent = event || { since, till };
    const qSince = (_till.int() <= _since.int()) ? _till : _since;
    const qTill = (_since.int() >= _till.int()) ? _since : _till;
    let collides = [];
    if (qSince.int() <= qEvent.since.int() && qTill.int() >= qEvent.since.int()) {
      collides = collides.concat(['l']);
    }
    if (qSince.int() <= qEvent.till.int() && qTill.int() >= qEvent.till.int()) {
      collides = collides.concat(['r']);
    }
    if (collides.length) return collides;
    return false;
  };

  const handleOverlaps = (_events, _since, _till) => {
    let events = _events;
    switch (overlap.internal) {
      case overlapRule.ALLOW: {
        break;
      }
      case overlapRule.REMOVE: {
        events = events.reduce((evts, event) => {
          const parallel = evts.find(evt => evt.virtual && includes(event, evt.since, evt.till));
          if (!parallel) return (evts = evts.concat([event]));
          const items = evts.filter(evt => !(evt.virtual && includes(event, evt.since, evt.till)));
          const winner = (parallel.priority > event.priority) ? parallel : event;
          evts = items.concat([winner]);
          return evts;
        }, []);
        break;
      }
      case overlapRule.TRIM: {
        events = events.reduce((evts, event) => {
          const parallel = evts.find(evt => evt.virtual && includes(event, evt.since, evt.till));
          if (!parallel) return (evts = evts.concat([event]));
          const items = evts.filter(evt => !(evt.virtual && includes(event, evt.since, evt.till)));
          let strong;
          let weak;
          if (parallel.priority > event.priority) {
            strong = parallel;
            weak = event;
          } else {
            strong = event;
            weak = parallel;
          }
          evts = items.concat([strong]);
          for (let i = 1; i <= 2; i += 1) {
            const collision = includes(weak, strong.since, strong.till);
            if (!collision) break;
            if (collision.includes('r')) {
              weak = (new Event({
                id,
                virtual: true,
                priority: weak.priority,
                title: weak.title,
                note: weak.note,
                color: weak.color,
                since: weak.since,
                till: strong.since.offsetDay(-1),
              })).query(_since, _till)[0];
            } else if (collision.includes('l')) {
              weak = (new Event({
                id,
                virtual: true,
                priority: weak.priority,
                title: weak.title,
                note: weak.note,
                color: weak.color,
                since: strong.till.offsetDay(1),
                till: weak.till,
              })).query(_since, _till)[0];
            }
          }
          if (weak.till.int() - weak.since.int() >= 0) {
            evts = evts.concat([weak]);
          }
          return evts;
        }, []);
        break;
      }
      case overlapRule.SPLIT: {
        // TODO
        break;
      }
      default:
        break;
    }

    return events;
  };

  const query = (_since, _till) => {
    let events = [];
    events = events.concat(includes(undefined, _since, _till) ? [
      {
        id,
        virtual,
        title,
        color,
        note,
        since,
        till,
        sinceInt: since.int(),
        tillInt: till.int(),
      },
    ] : []);
    events = events.concat(getSequels(_since, _till));
    events = events.concat(getRepeats(_since, _till));
    events = handleOverlaps(events, _since, _till);
    return events.sort((a, b) => a.sinceInt - b.sinceInt);
  };

  return { title, color, note, since, till, overlap: overlap.external, query };
};

exports.Event = Event;
