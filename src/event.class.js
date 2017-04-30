const Event = function Event(config) {
  const overlapRule = { ALLOW: 'allow', TRIM: 'trim', REMOVE: 'remove', SPLIT: 'split' };
  const id = config.id || 0;
  const generatorId = config.generatorId || 'unknown';
  const title = config.title;
  const color = config.color || '#000000';
  const note = config.note || '';
  const since = config.since;
  const till = config.till || config.since;
  const repeats = config.repeats || [];
  const sequels = config.sequels || [];
  const virtual = config.virtual || false;
  const repeated = config.repeated || false;
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
            generatorId,
            virtual: true,
            repeated: true,
            overlap,
            priority: priority + (round * (index + 1) * (sequels.length + 1)),
            title,
            color,
            note,
            sequels,
            since: cursor.since,
            till: cursor.till,
          })).query(qSince, qTill, 'event[]'));
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
        generatorId,
        virtual: true,
        repeated,
        overlap,
        priority: priority + (index + 1),
        title: sequel.title || title,
        note: sequel.note || note,
        color: sequel.color || color,
        since: sequelDates.since,
        till: sequelDates.till,
      });
      events = events.concat((realSequel).query(qSince, qTill, 'event[]'));
    });
    return events;
  };

  const collides = (event, _since, _till) => {
    const qEvent = event || { since, till };
    const qSince = (_till.int() <= _since.int()) ? _till : _since;
    const qTill = (_since.int() >= _till.int()) ? _since : _till;
    let collisions = [];
    if (qSince.int() <= qEvent.since.int() && qTill.int() >= qEvent.since.int()) {
      collisions = collisions.concat(['l']);
    }
    if (qSince.int() <= qEvent.till.int() && qTill.int() >= qEvent.till.int()) {
      collisions = collisions.concat(['r']);
    }
    if (qSince.int() >= qEvent.since.int() && qTill.int() <= qEvent.till.int()) {
      collisions = collisions.concat(['c']);
    }
    if (collisions.length) return collisions;
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
          const parallels = evts
            .filter(evt => evt.virtual && collides(event, evt.since, evt.till))
            .sort((a, b) => b.priority - a.priority);
          if (!parallels.length) return evts.concat([event]);
          const items = evts
            .filter(evt => !(evt.virtual && collides(event, evt.since, evt.till)));
          return items.concat([parallels[0]]);
        }, []);
        break;
      }
      case overlapRule.TRIM: {
        events = events.reduce((evts, event) => {
          const parallels = evts.filter(evt => evt.virtual && collides(event, evt.since, evt.till));
          if (!parallels.length) return evts.concat([event]);
          let items = evts.filter(evt => !(evt.virtual && collides(event, evt.since, evt.till)));
          const conflicts = parallels.concat([event]).sort((a, b) => b.priority - a.priority);
          const master = conflicts[0];
          const slaves = conflicts.slice(1);
          items = items.concat([master]);
          const trimmedSlaves = slaves.map((evt) => {
            let slave = evt;
            let collision = collides(slave, master.since, master.till);
            while (collision) {
              if (collision.includes('r')) {
                slave = (new Event({
                  id,
                  generatorId,
                  virtual: true,
                  repeated,
                  overlap,
                  priority: slave.priority,
                  title: slave.title,
                  note: slave.note,
                  color: slave.color,
                  since: slave.since,
                  till: master.since.offsetDay(-1),
                })).query(_since, _till, 'event[]')[0];
              } else if (collision.includes('l')) {
                slave = (new Event({
                  id,
                  generatorId,
                  virtual: true,
                  repeated,
                  overlap,
                  priority: slave.priority,
                  title: slave.title,
                  note: slave.note,
                  color: slave.color,
                  since: master.till.offsetDay(1),
                  till: slave.till,
                })).query(_since, _till, 'event[]')[0];
              }
              collision = collides(slave, master.since, master.till);
            }
            return slave;
          }).filter(evt => evt.till.int() - evt.since.int() >= 0);
          return items.concat(trimmedSlaves);
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

  const query = (_since, _till, _output) => {
    const output = _output || 'series';
    let events = [].concat(collides(undefined, _since, _till) ? [
      {
        id,
        generatorId,
        virtual,
        repeated,
        overlap: overlap.external,
        title,
        color,
        note,
        since,
        till,
        collides: (qsince, qtill) => collides(undefined, qsince, qtill),
      },
    ] : [])
      .concat(getSequels(_since, _till))
      .concat(getRepeats(_since, _till));
    events = handleOverlaps(events, _since, _till)
      .sort((a, b) => a.since.int() - b.since.int());
    if (output === 'event[]') return events;
    return {
      generatorId: events.length ? events[0].generatorId : undefined,
      overlap: events.length ? events[0].overlap : undefined,
      events,
      range: events.length ? (evts => evts
        .concat((overlap.external.includes('forever')) ?
          query(since.offsetYear(-10), till, 'event[]') : [])
        .reduce((range, e) => ({
          since: e.since.int() < range.since.int() ? e.since : range.since,
          till: e.till.int() > range.till.int() ? e.till : range.till,
        }), {
          since: evts[0].since,
          till: evts[0].till,
        })
      )(events) : undefined,
    };
  };

  return {
    id,
    generatorId,
    virtual,
    repeated,
    title,
    color,
    note,
    since,
    till,
    overlap: overlap.external,
    collides: (_since, _till) => collides(undefined, _since, _till),
    query,
  };
};

exports.Event = Event;
