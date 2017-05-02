const Event = function Event(config) {
  const id = config.id;
  const title = config.title;
  const since = config.since;
  const till = config.till || config.since;
  const generatorId = config.generatorId || 'coripo.coripo.generator.handmade';
  const color = config.color || undefined;
  const icon = config.icon || undefined;
  const image = config.image || undefined;
  const categoryId = config.categoryId || undefined;
  const tags = config.tags || [];
  const note = config.note || '';
  const repeats = config.repeats || [];
  const sequels = config.sequels || [];
  const virtual = config.virtual || false;
  const repeated = config.repeated || false;
  const priority = config.priority || 0;
  const overlap = {
    internal: ((config.overlap || {}).internal || 'allow'),
    external: ((config.overlap || {}).external || 'allow'),
  };
  let getPublicObject = () => { };
  let getPrivateObject = () => { };
  let collides = () => { };

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

  const getEstimatedRange = (event) => {

  };

  const getRange = evts => evts.reduce((range, e) => ({
    since: e.since.int() < range.since.int() ? e.since : range.since,
    till: e.till.int() > range.till.int() ? e.till : range.till,
  }), { since: evts[0].since, till: evts[0].till });

  const getRepeats = (_since, _till) => {
    const qSince = (_till.int() <= _since.int()) ? _till : _since;
    const qTill = (_since.int() >= _till.int()) ? _since : _till;

    return repeats.reduce((events, pattern, index) => {
      let evts = [];
      let times = pattern.times;
      let round = 1;
      let cursor = { since, till };
      let range = { since, till };

      do {
        cursor = {
          since: offsetDate(cursor.since, pattern.cycle, pattern.step),
          till: offsetDate(cursor.till, pattern.cycle, pattern.step),
        };
        range = {
          since: offsetDate(range.since, pattern.cycle, pattern.step),
          till: offsetDate(range.till, pattern.cycle, pattern.step),
        };
        evts = evts.concat(new Event(Object.assign({}, getPrivateObject(), {
          virtual: true,
          repeated: true,
          priority: priority + (round * (index + 1) * (sequels.length + 1)),
          since: cursor.since,
          till: cursor.till,
          repeats: [],
        })).query(qSince, qTill, 'event[]'));
        round += 1;
        times -= 1;
      } while (times !== 0 && range.since.int() <= qTill.int());
      return events.concat(evts);
    }, []);
  };

  const getSequels = (_since, _till) => {
    const qSince = (_till.int() <= _since.int()) ? _till : _since;
    const qTill = (_since.int() >= _till.int()) ? _since : _till;

    return sequels.reduce((events, sequel, index) => {
      const sequelDates = {
        since: offsetDate(since, sequel.since.scale, sequel.since.offset),
        till: offsetDate(since, sequel.till.scale, sequel.till.offset),
      };
      if ((!sequel.repeats || !sequel.repeats.length) &&
        !collides({
          since: sequelDates.since,
          till: sequelDates.till,
        }, qSince, qTill)) return events;

      const realSequel = new Event(Object.assign({}, getPrivateObject(), {
        virtual: true,
        priority: priority + (index + 1),
        title: sequel.title,
        note: sequel.note,
        color: sequel.color,
        since: sequelDates.since,
        till: sequelDates.till,
        repeats: sequel.repeats,
        sequels: [],
      }));
      return events.concat((realSequel).query(qSince, qTill, 'event[]'));
    }, []);
  };

  collides = (event, _since, _till) => {
    const qs = (_till.int() <= _since.int() ? _till : _since).int();
    const qt = (_since.int() >= _till.int() ? _since : _till).int();
    const es = (event || { since, till }).since.int();
    const et = (event || { since, till }).till.int();
    const collisions = []
      .concat((qs <= es && qt >= es) ? ['l'] : [])
      .concat((qs <= et && qt >= et) ? ['r'] : [])
      .concat((qs >= es && qt <= et) ? ['c'] : [])
      .concat((qs <= es && qt >= et) ? ['i'] : []);
    if (collisions.length) return collisions;
    return false;
  };

  const handleOverlaps = (_events, _since, _till) => {
    const events = _events;
    if (overlap.internal === 'allow') return events;
    if (overlap.internal === 'remove') {
      return events.reduce((evts, event) => {
        const parallels = evts
          .filter(evt => evt.virtual && collides(event, evt.since, evt.till))
          .sort((a, b) => b.priority - a.priority);
        if (!parallels.length) return evts.concat([event]);
        const items = evts
          .filter(evt => !(evt.virtual && collides(event, evt.since, evt.till)));
        return items.concat([parallels[0]]);
      }, []);
    }
    if (overlap.internal === 'trim') {
      return events.reduce((evts, event) => {
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
              slave = (new Event(Object.assign({}, slave, {
                till: master.since.offsetDay(-1),
              }))).query(_since, _till, 'event[]')[0];
            } else if (collision.includes('l')) {
              slave = (new Event(Object.assign({}, slave, {
                since: master.till.offsetDay(1),
              }))).query(_since, _till, 'event[]')[0];
            }
            collision = collides(slave, master.since, master.till);
          }
          return slave;
        }).filter(evt => evt.till.int() - evt.since.int() >= 0);
        return items.concat(trimmedSlaves);
      }, []);
    }

    return events;
  };

  const query = (_since, _till, _output) => {
    const output = _output || 'series';
    let events = [].concat(collides(undefined, _since, _till) ? [getPublicObject()] : [])
      .concat(getSequels(_since, _till))
      .concat(getRepeats(_since, _till));
    events = handleOverlaps(events, _since, _till)
      .sort((a, b) => a.since.int() - b.since.int());
    if (output === 'event[]') return events;
    return {
      generatorId: events.length ? events[0].generatorId : undefined,
      overlap: events.length ? events[0].overlap : undefined,
      events,
      range: events.length ?
        getRange(events
          .concat((overlap.external.includes('forever')) ?
            query(since.offsetYear(-10), till, 'event[]') : [])) :
        undefined,
    };
  };

  getPublicObject = () => ({
    id,
    generatorId,
    virtual,
    repeated,
    priority,
    overlap,
    title,
    color,
    icon,
    image,
    categoryId,
    tags,
    note,
    since,
    till,
    collides: (qsince, qtill) => collides(undefined, qsince, qtill),
    query,
  });

  getPrivateObject = () => Object.assign({}, getPublicObject, {
    sequels,
    repeats,
  });

  return getPublicObject();
};

exports.Event = Event;
