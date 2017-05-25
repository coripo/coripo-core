const Event = function Event(cfg) {
  const config = Object.assign({}, {
    till: cfg.since,
    generatorId: 'coripo.coripo.generator.handmade',
    categoryId: 0,
    tags: [],
    repeats: [],
    sequels: [],
    priority: 0,
    virtual: false,
    repeated: false,
  }, cfg,
    {
      overlap: Object.assign({},
        {
          internal: 'allow',
          external: 'allow',
        }, cfg.overlap),
    });

  const collides = (event, _since, _till) => {
    const qs = (_till.int() <= _since.int() ? _till : _since).int();
    const qt = (_since.int() >= _till.int() ? _since : _till).int();
    const es = (event || { since: config.since, till: config.till }).since.int();
    const et = (event || { since: config.since, till: config.till }).till.int();
    const collisions = []
      .concat((qs <= es && qt >= es) ? ['left'] : [])
      .concat((qs <= et && qt >= et) ? ['right'] : [])
      .concat((qs > es && qt < et) ? ['inside'] : [])
      .concat((qs < es && qt > et) ? ['outside'] : []);
    if (collisions.length) return collisions;
    return false;
  };

  const getRange = evts => evts.reduce((range, e) => ({
    since: e.since.int() < range.since.int() ? e.since : range.since,
    till: e.till.int() > range.till.int() ? e.till : range.till,
  }), { since: evts[0].since, till: evts[0].till });


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

    return config.repeats.reduce((events, pattern, index) => {
      let evts = [];
      let times = pattern.times;
      let round = 1;
      let cursor = { since: config.since, till: config.till };
      let range = { since: config.since, till: config.till };

      do {
        cursor = {
          since: offsetDate(cursor.since, pattern.cycle, pattern.step),
          till: offsetDate(cursor.till, pattern.cycle, pattern.step),
        };
        range = {
          since: offsetDate(range.since, pattern.cycle, pattern.step),
          till: offsetDate(range.till, pattern.cycle, pattern.step),
        };
        evts = evts.concat(new Event(Object.assign({}, config, {
          virtual: true,
          repeated: true,
          priority: config.priority + (round * (index + 1) * (config.sequels.length + 1)),
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

    return config.sequels.reduce((events, sequel, index) => {
      const sequelDates = {
        since: offsetDate(config.since, sequel.since.scale, sequel.since.offset),
        till: offsetDate(config.since, sequel.till.scale, sequel.till.offset),
      };
      if ((!sequel.repeats || !sequel.repeats.length) &&
        !collides({
          since: sequelDates.since,
          till: sequelDates.till,
        }, qSince, qTill)) return events;

      const realSequel = new Event(Object.assign({}, config, sequel, {
        virtual: true,
        priority: config.priority + (index + 1),
        since: sequelDates.since,
        till: sequelDates.till,
        sequels: [],
      }));
      return events.concat((realSequel).query(qSince, qTill, 'event[]'));
    }, []);
  };

  const handleOverlaps = (_events, _since, _till) => {
    const events = _events;
    if (config.overlap.internal === 'allow') return events;
    if (config.overlap.internal === 'remove') {
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
    if (config.overlap.internal === 'trim') {
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
          let col = collides(slave, master.since, master.till);
          while (col) {
            if (col.includes('outside')) {
              slave = undefined;
            } else if (col.includes('left') && col.includes('right')) {
              slave = undefined;
            } else if (col.includes('right')) {
              slave = (new Event(Object.assign({}, slave, {
                till: master.since.offsetDay(-1),
              }))).query(_since, _till, 'event[]')[0];
            } else if (col.includes('left')) {
              slave = (new Event(Object.assign({}, slave, {
                since: master.till.offsetDay(1),
              }))).query(_since, _till, 'event[]')[0];
            } else if (col.includes('inside')) {
              slave = (new Event(Object.assign({}, slave, {
                till: master.since.offsetDay(-1),
              }))).query(_since, _till, 'event[]')[0];
            }
            col = slave ? collides(slave, master.since, master.till) : false;
          }
          return slave;
        }).filter(evt => evt !== undefined);
        return items.concat(trimmedSlaves);
      }, []);
    }

    return events;
  };

  const object = Object.assign({}, config, {
    collides: (qsince, qtill) => collides(undefined, qsince, qtill),
    query: (_since, _till, _output) => {
      const output = _output || 'series';
      let events = [].concat(collides(undefined, _since, _till) ? [object] : [])
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
            .concat((config.overlap.external.includes('forever')) ?
              object.query(config.since.offsetYear(-10), config.till, 'event[]') : [])) :
          undefined,
      };
    },
  });

  return object;
};

module.exports = Event;
