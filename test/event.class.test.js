/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;
const GregorianAdapter = require('../src/gregorian.adapter.js').Adapter;
const OneDate = require('../src/onedate.class.js').OneDate;
const Event = require('../src/event.class.js').Event;

describe('Event Class', () => {
  const GREGORIAN_ADAPTER_ID = new GregorianAdapter().id;
  const helper = {
    getAdapter: () => new GregorianAdapter(),
    primaryAdapterId: GREGORIAN_ADAPTER_ID,
  };
  const sampleDate = new OneDate({
    year: 2017,
    month: 10,
    day: 5,
    adapterId: GREGORIAN_ADAPTER_ID,
  }, helper);

  describe('title', () => {
    it('should return string', () => {
      const event = new Event({
        title: 'jack\'s bday',
        since: sampleDate,
      });
      expect(event.title).to.be.a('string');
    });
  });

  describe('color', () => {
    it('should return string', () => {
      const event = new Event({
        title: 'jack\'s bday',
        color: '#f811f8',
        since: sampleDate,
      });
      expect(event.color).to.be.a('string');
    });
  });

  describe('note', () => {
    it('should return string', () => {
      const event = new Event({
        title: 'jack\'s bday',
        note: 'get a cake for him',
        since: sampleDate,
      });
      expect(event.note).to.be.a('string');
    });
  });

  describe('since', () => {
    it('should return OneDate', () => {
      const event = new Event({
        title: 'jack\'s bday',
        note: 'get a cake for him',
        since: sampleDate,
      });
      expect(event.since).to.deep.equal(sampleDate);
    });
  });

  describe('till', () => {
    it('should return 20171015', () => {
      const event = new Event({
        title: 'jack\'s bday',
        note: 'get a cake for him',
        since: sampleDate,
        till: sampleDate.offsetDay(10),
      });
      expect(event.till.int()).to.equal(sampleDate.offsetDay(10).int());
    });
  });

  describe('query()', () => {
    context('when repeats is empty', () => {
      it('should return an array by length of 1', () => {
        const event = new Event({
          title: 'jack\'s bday',
          note: 'get a cake for him',
          since: sampleDate,
          till: sampleDate.offsetDay(10),
        });
        const events = event.query(sampleDate.offsetDay(-10), sampleDate.offsetDay(0));
        expect(events).to.have.lengthOf(1);
      });
      it('should return an array by length of 1', () => {
        const event = new Event({
          title: 'jack\'s bday',
          note: 'get a cake for him',
          since: sampleDate,
          till: sampleDate.offsetDay(10),
        });
        const events = event.query(sampleDate.offsetDay(-10), sampleDate.offsetDay(5));
        expect(events).to.have.lengthOf(1);
      });
      it('should return an array by length of 1', () => {
        const event = new Event({
          title: 'jack\'s bday',
          note: 'get a cake for him',
          since: sampleDate,
          till: sampleDate.offsetDay(10),
        });
        const events = event.query(sampleDate.offsetDay(10), sampleDate.offsetDay(15));
        expect(events).to.have.lengthOf(1);
      });
      it('should return an array by length of 0', () => {
        const event = new Event({
          title: 'jack\'s bday',
          note: 'get a cake for him',
          since: sampleDate,
          till: sampleDate.offsetDay(10),
        });
        const events = event.query(sampleDate.offsetDay(-10), sampleDate.offsetDay(-1));
        expect(events).to.have.lengthOf(0);
      });

      context('when since is bigger than till', () => {
        it('should return an array by length of 1', () => {
          const event = new Event({
            title: 'jack\'s bday',
            note: 'get a cake for him',
            since: sampleDate,
            till: sampleDate.offsetDay(10),
          });
          const events = event.query(sampleDate.offsetDay(11), sampleDate.offsetDay(5));
          expect(events).to.have.lengthOf(1);
        });
      });
    });

    context('when repeats is not empty', () => {
      it('should return an array by length of 2', () => {
        const event = new Event({
          title: 'jack\'s bday',
          note: 'get a cake for him',
          since: sampleDate,
          repeats: [
            { times: -1, cycle: 'year', step: 1 },
          ],
        });
        const events = event.query(sampleDate, sampleDate.offsetYear(1));
        expect(events).to.have.lengthOf(2);
      });
      it('should return an array by length of 2', () => {
        const event = new Event({
          title: 'jack\'s and her meniversary',
          note: 'pay for your domains (every 4 year)',
          since: sampleDate,
          repeats: [
            { times: -1, cycle: 'year', step: 4 },
          ],
        });
        const events = event.query(sampleDate.offsetDay(1), sampleDate.offsetYear(8));
        expect(events).to.have.lengthOf(2);
      });
      it('should return an array by length of 3', () => {
        const event = new Event({
          title: 'jack\'s and her meniversary',
          note: 'get a cake for him',
          since: sampleDate,
          repeats: [
            { times: 11, cycle: 'month', step: 1 },
          ],
        });
        const events = event.query(sampleDate, sampleDate.offsetMonth(12));
        expect(events).to.have.lengthOf(12);
      });
      it('should return an array by length of 0', () => {
        const event = new Event({
          title: 'jack\'s bday',
          note: 'get a cake for him',
          since: sampleDate,
          repeats: [
            { times: 3, cycle: 'year', step: 1 },
          ],
        });
        const events = event.query(sampleDate.offsetMonth(1), sampleDate.offsetMonth(10));
        expect(events).to.have.lengthOf(0);
      });
      it('should return an array by length of 3', () => {
        const event = new Event({
          title: 'menstrual cycle',
          note: 'get some pads',
          since: sampleDate,
          till: sampleDate.offsetDay(4),
          repeats: [
            { times: -1, cycle: 'day', step: 28 },
          ],
        });
        const events = event.query(sampleDate, sampleDate.offsetMonth(2));
        expect(events).to.have.lengthOf(3);
      });
    });

    context('when sequels is not empty', () => {
      it('should return an array by length of 11', () => {
        const periodStart = new OneDate({ year: 2017, month: 4, day: 4 }, helper);
        const periodCycle = 28;
        const event = new Event({
          title: 'menstrual cycle',
          note: 'get some pads',
          since: periodStart,
          till: periodStart.offsetDay(4),
          repeats: [
            { times: -1, cycle: 'day', step: periodCycle },
          ],
          sequels: [
            {
              title: 'pre-period',
              since: { scale: 'day', offset: -2 },
              till: { scale: 'day', offset: -1 },
            },
            {
              title: 'post-period',
              since: { scale: 'day', offset: 5 },
              till: { scale: 'day', offset: 6 },
            },
          ],
        });
        const events = event.query(new OneDate({ year: 2017, month: 4, day: 1 }, helper),
          new OneDate({ year: 2017, month: 6, day: 30 }, helper));
        expect(events).to.have.lengthOf(11);
      });

      it('should return an array by length of 2', () => {
        const event = new Event({
          title: 'overlap remove test',
          since: new OneDate({ year: 2017, month: 4, day: 4 }, helper),
          till: new OneDate({ year: 2017, month: 4, day: 4 }, helper).offsetDay(3),
          overlap: { internal: 'remove' },
          sequels: [
            {
              title: 'removed stage',
              since: { scale: 'day', offset: 1 },
              till: { scale: 'day', offset: 2 },
            },
            {
              title: 'remaining stage',
              since: { scale: 'day', offset: 2 },
              till: { scale: 'day', offset: 3 },
            },
          ],
        });
        const events = event.query(new OneDate({ year: 2017, month: 4, day: 1 }, helper),
          new OneDate({ year: 2017, month: 6, day: 30 }, helper));
        expect(events).to.have.lengthOf(2);
      });

      it('should return an array by length of 3', () => {
        const event = new Event({
          title: 'overlap trim test',
          since: new OneDate({ year: 2017, month: 4, day: 4 }, helper),
          till: new OneDate({ year: 2017, month: 4, day: 4 }, helper).offsetDay(3),
          overlap: { internal: 'trim' },
          sequels: [
            {
              title: 'trimmed stage',
              since: { scale: 'day', offset: 4 },
              till: { scale: 'day', offset: 8 },
            },
            {
              title: 'remaining stage',
              since: { scale: 'day', offset: 2 },
              till: { scale: 'day', offset: 5 },
            },
          ],
        });
        const events = event.query(new OneDate({ year: 2017, month: 4, day: 1 }, helper),
          new OneDate({ year: 2017, month: 6, day: 30 }, helper));
        expect(events).to.have.lengthOf(3);
      });
    });
  });
});
