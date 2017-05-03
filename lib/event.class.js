'use strict';

var Event = function Event(config) {
  var id = config.id;
  var title = config.title;
  var since = config.since;
  var till = config.till || config.since;
  var generatorId = config.generatorId || 'coripo.coripo.generator.handmade';
  var color = config.color || undefined;
  var icon = config.icon || undefined;
  var image = config.image || undefined;
  var categoryId = config.categoryId || undefined;
  var tags = config.tags || [];
  var note = config.note || '';
  var repeats = config.repeats || [];
  var sequels = config.sequels || [];
  var virtual = config.virtual || false;
  var repeated = config.repeated || false;
  var priority = config.priority || 0;
  var overlap = {
    internal: (config.overlap || {}).internal || 'allow',
    external: (config.overlap || {}).external || 'allow'
  };
  var getPublicObject = function getPublicObject() {};
  var getPrivateObject = function getPrivateObject() {};
  var _collides = function collides() {};

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

  _collides = function collides(event, _since, _till) {
    var qs = (_till.int() <= _since.int() ? _till : _since).int();
    var qt = (_since.int() >= _till.int() ? _since : _till).int();
    var es = (event || { since: since, till: till }).since.int();
    var et = (event || { since: since, till: till }).till.int();
    var collisions = [].concat(qs <= es && qt >= es ? ['l'] : []).concat(qs <= et && qt >= et ? ['r'] : []).concat(qs >= es && qt <= et ? ['c'] : []).concat(qs <= es && qt >= et ? ['i'] : []);
    if (collisions.length) return collisions;
    return false;
  };

  var getRange = function getRange(evts) {
    return evts.reduce(function (range, e) {
      return {
        since: e.since.int() < range.since.int() ? e.since : range.since,
        till: e.till.int() > range.till.int() ? e.till : range.till
      };
    }, { since: evts[0].since, till: evts[0].till });
  };

  var getRepeats = function getRepeats(_since, _till) {
    var qSince = _till.int() <= _since.int() ? _till : _since;
    var qTill = _since.int() >= _till.int() ? _since : _till;

    return repeats.reduce(function (events, pattern, index) {
      var evts = [];
      var times = pattern.times;
      var round = 1;
      var cursor = { since: since, till: till };
      var range = { since: since, till: till };

      do {
        cursor = {
          since: offsetDate(cursor.since, pattern.cycle, pattern.step),
          till: offsetDate(cursor.till, pattern.cycle, pattern.step)
        };
        range = {
          since: offsetDate(range.since, pattern.cycle, pattern.step),
          till: offsetDate(range.till, pattern.cycle, pattern.step)
        };
        evts = evts.concat(new Event(Object.assign({}, getPrivateObject(), {
          virtual: true,
          repeated: true,
          priority: priority + round * (index + 1) * (sequels.length + 1),
          since: cursor.since,
          till: cursor.till,
          repeats: []
        })).query(qSince, qTill, 'event[]'));
        round += 1;
        times -= 1;
      } while (times !== 0 && range.since.int() <= qTill.int());
      return events.concat(evts);
    }, []);
  };

  var getSequels = function getSequels(_since, _till) {
    var qSince = _till.int() <= _since.int() ? _till : _since;
    var qTill = _since.int() >= _till.int() ? _since : _till;

    return sequels.reduce(function (events, sequel, index) {
      var sequelDates = {
        since: offsetDate(since, sequel.since.scale, sequel.since.offset),
        till: offsetDate(since, sequel.till.scale, sequel.till.offset)
      };
      if ((!sequel.repeats || !sequel.repeats.length) && !_collides({
        since: sequelDates.since,
        till: sequelDates.till
      }, qSince, qTill)) return events;

      var realSequel = new Event(Object.assign({}, getPrivateObject(), {
        virtual: true,
        priority: priority + (index + 1),
        title: sequel.title,
        note: sequel.note,
        color: sequel.color,
        since: sequelDates.since,
        till: sequelDates.till,
        repeats: sequel.repeats,
        sequels: []
      }));
      return events.concat(realSequel.query(qSince, qTill, 'event[]'));
    }, []);
  };

  var handleOverlaps = function handleOverlaps(_events, _since, _till) {
    var events = _events;
    if (overlap.internal === 'allow') return events;
    if (overlap.internal === 'remove') {
      return events.reduce(function (evts, event) {
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
    }
    if (overlap.internal === 'trim') {
      return events.reduce(function (evts, event) {
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
              slave = new Event(Object.assign({}, slave, {
                till: master.since.offsetDay(-1)
              })).query(_since, _till, 'event[]')[0];
            } else if (collision.includes('l')) {
              slave = new Event(Object.assign({}, slave, {
                since: master.till.offsetDay(1)
              })).query(_since, _till, 'event[]')[0];
            }
            collision = _collides(slave, master.since, master.till);
          }
          return slave;
        }).filter(function (evt) {
          return evt.till.int() - evt.since.int() >= 0;
        });
        return items.concat(trimmedSlaves);
      }, []);
    }

    return events;
  };

  var query = function query(_since, _till, _output) {
    var output = _output || 'series';
    var events = [].concat(_collides(undefined, _since, _till) ? [getPublicObject()] : []).concat(getSequels(_since, _till)).concat(getRepeats(_since, _till));
    events = handleOverlaps(events, _since, _till).sort(function (a, b) {
      return a.since.int() - b.since.int();
    });
    if (output === 'event[]') return events;
    return {
      generatorId: events.length ? events[0].generatorId : undefined,
      overlap: events.length ? events[0].overlap : undefined,
      events: events,
      range: events.length ? getRange(events.concat(overlap.external.includes('forever') ? query(since.offsetYear(-10), till, 'event[]') : [])) : undefined
    };
  };

  getPublicObject = function getPublicObject() {
    return {
      id: id,
      generatorId: generatorId,
      virtual: virtual,
      repeated: repeated,
      priority: priority,
      overlap: overlap,
      title: title,
      color: color,
      icon: icon,
      image: image,
      categoryId: categoryId,
      tags: tags,
      note: note,
      since: since,
      till: till,
      collides: function collides(qsince, qtill) {
        return _collides(undefined, qsince, qtill);
      },
      query: query
    };
  };

  getPrivateObject = function getPrivateObject() {
    return Object.assign({}, getPublicObject(), {
      sequels: sequels,
      repeats: repeats
    });
  };

  return getPublicObject();
};

exports.Event = Event;
//# sourceMappingURL=event.class.js.map