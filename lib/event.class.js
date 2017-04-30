'use strict';

var Event = function Event(config) {
  var overlapRule = { ALLOW: 'allow', TRIM: 'trim', REMOVE: 'remove', SPLIT: 'split' };
  var id = config.id || 0;
  var generatorId = config.generatorId || 'unknown';
  var title = config.title;
  var color = config.color || '#000000';
  var note = config.note || '';
  var since = config.since;
  var till = config.till || config.since;
  var repeats = config.repeats || [];
  var sequels = config.sequels || [];
  var virtual = config.virtual || false;
  var repeated = config.repeated || false;
  var priority = config.priority || 0;
  var overlap = config.overlap || {};
  overlap.internal = overlap.internal || overlapRule.ALLOW;
  overlap.external = overlap.external || overlapRule.ALLOW;

  var offsetDate = function offsetDate(date, scale, step) {
    switch (scale) {
      case 'year':
        {
          return date.offsetYear(step);
        }
      case 'month':
        {
          return date.offsetMonth(step);
        }
      case 'day':
        {
          return date.offsetDay(step);
        }
      default:
        {
          throw new Error('Invalid scale string for offsetDate method');
        }
    }
  };

  var getRepeats = function getRepeats(_since, _till) {
    var qSince = _till.int() <= _since.int() ? _till : _since;
    var qTill = _since.int() >= _till.int() ? _since : _till;
    var events = [];

    repeats.forEach(function (pattern, index) {
      var times = pattern.times;
      var round = 1;
      var cursor = {
        since: offsetDate(since, pattern.cycle, pattern.step),
        till: offsetDate(till, pattern.cycle, pattern.step)
      };
      while (times !== 0 && cursor.since.int() <= qTill.int()) {
        if (cursor.since.int() >= qSince.int()) {
          events = events.concat(new Event({
            id: id,
            generatorId: generatorId,
            virtual: true,
            repeated: true,
            overlap: overlap,
            priority: priority + round * (index + 1) * (sequels.length + 1),
            title: title,
            color: color,
            note: note,
            sequels: sequels,
            since: cursor.since,
            till: cursor.till
          }).query(qSince, qTill, 'event[]'));
        }
        cursor = {
          since: offsetDate(cursor.since, pattern.cycle, pattern.step),
          till: offsetDate(cursor.till, pattern.cycle, pattern.step)
        };
        round += 1;
        times -= 1;
      }
    });
    return events;
  };

  var getSequels = function getSequels(_since, _till) {
    var qSince = _till.int() <= _since.int() ? _till : _since;
    var qTill = _since.int() >= _till.int() ? _since : _till;
    var events = [];

    sequels.forEach(function (sequel, index) {
      var sequelDates = {
        since: offsetDate(since, sequel.since.scale, sequel.since.offset),
        till: offsetDate(since, sequel.till.scale, sequel.till.offset)
      };
      var realSequel = new Event({
        id: id,
        generatorId: generatorId,
        virtual: true,
        repeated: repeated,
        overlap: overlap,
        priority: priority + (index + 1),
        title: sequel.title || title,
        note: sequel.note || note,
        color: sequel.color || color,
        since: sequelDates.since,
        till: sequelDates.till
      });
      events = events.concat(realSequel.query(qSince, qTill, 'event[]'));
    });
    return events;
  };

  var _collides = function _collides(event, _since, _till) {
    var qEvent = event || { since: since, till: till };
    var qSince = _till.int() <= _since.int() ? _till : _since;
    var qTill = _since.int() >= _till.int() ? _since : _till;
    var collisions = [];
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

  var handleOverlaps = function handleOverlaps(_events, _since, _till) {
    var events = _events;
    switch (overlap.internal) {
      case overlapRule.ALLOW:
        {
          break;
        }
      case overlapRule.REMOVE:
        {
          events = events.reduce(function (evts, event) {
            var parallels = evts.filter(function (evt) {
              return evt.virtual && _collides(event, evt.since, evt.till);
            }).sort(function (a, b) {
              return b.priority - a.priority;
            });
            if (!parallels.length) return evts.concat([event]);
            var items = evts.filter(function (evt) {
              return !(evt.virtual && _collides(event, evt.since, evt.till));
            });
            return items.concat([parallels[0]]);
          }, []);
          break;
        }
      case overlapRule.TRIM:
        {
          events = events.reduce(function (evts, event) {
            var parallels = evts.filter(function (evt) {
              return evt.virtual && _collides(event, evt.since, evt.till);
            });
            if (!parallels.length) return evts.concat([event]);
            var items = evts.filter(function (evt) {
              return !(evt.virtual && _collides(event, evt.since, evt.till));
            });
            var conflicts = parallels.concat([event]).sort(function (a, b) {
              return b.priority - a.priority;
            });
            var master = conflicts[0];
            var slaves = conflicts.slice(1);
            items = items.concat([master]);
            var trimmedSlaves = slaves.map(function (evt) {
              var slave = evt;
              var collision = _collides(slave, master.since, master.till);
              while (collision) {
                if (collision.includes('r')) {
                  slave = new Event({
                    id: slave.id,
                    generatorId: slave.generatorId,
                    virtual: slave.virtual,
                    repeated: slave.repeated,
                    overlap: slave.overlap,
                    priority: slave.priority,
                    title: slave.title,
                    note: slave.note,
                    color: slave.color,
                    since: slave.since,
                    till: master.since.offsetDay(-1)
                  }).query(_since, _till, 'event[]')[0];
                } else if (collision.includes('l')) {
                  slave = new Event({
                    id: slave.id,
                    generatorId: slave.generatorId,
                    virtual: slave.virtual,
                    repeated: slave.repeated,
                    overlap: slave.repeated,
                    priority: slave.priority,
                    title: slave.title,
                    note: slave.note,
                    color: slave.color,
                    since: master.till.offsetDay(1),
                    till: slave.till
                  }).query(_since, _till, 'event[]')[0];
                }
                collision = _collides(slave, master.since, master.till);
              }
              return slave;
            }).filter(function (evt) {
              return evt.till.int() - evt.since.int() >= 0;
            });
            return items.concat(trimmedSlaves);
          }, []);
          break;
        }
      case overlapRule.SPLIT:
        {
          // TODO
          break;
        }
      default:
        break;
    }

    return events;
  };

  var query = function query(_since, _till, _output) {
    var output = _output || 'series';
    var events = [].concat(_collides(undefined, _since, _till) ? [{
      id: id,
      generatorId: generatorId,
      virtual: virtual,
      repeated: repeated,
      overlap: overlap.external,
      priority: priority,
      title: title,
      color: color,
      note: note,
      since: since,
      till: till,
      collides: function collides(qsince, qtill) {
        return _collides(undefined, qsince, qtill);
      }
    }] : []).concat(getSequels(_since, _till)).concat(getRepeats(_since, _till));
    events = handleOverlaps(events, _since, _till).sort(function (a, b) {
      return a.since.int() - b.since.int();
    });
    if (output === 'event[]') return events;
    return {
      generatorId: events.length ? events[0].generatorId : undefined,
      overlap: events.length ? events[0].overlap : undefined,
      events: events,
      range: events.length ? function (evts) {
        return evts.concat(overlap.external.includes('forever') ? query(since.offsetYear(-10), till, 'event[]') : []).reduce(function (range, e) {
          return {
            since: e.since.int() < range.since.int() ? e.since : range.since,
            till: e.till.int() > range.till.int() ? e.till : range.till
          };
        }, {
          since: evts[0].since,
          till: evts[0].till
        });
      }(events) : undefined
    };
  };

  return {
    id: id,
    generatorId: generatorId,
    virtual: virtual,
    repeated: repeated,
    title: title,
    color: color,
    note: note,
    since: since,
    till: till,
    overlap: overlap.external,
    collides: function collides(_since, _till) {
      return _collides(undefined, _since, _till);
    },
    query: query
  };
};

exports.Event = Event;
//# sourceMappingURL=event.class.js.map