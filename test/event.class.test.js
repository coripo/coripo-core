/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;
const GregorianAdapter = require('../src/gregorian.adapter.js');
const OneDate = require('../src/onedate.class.js');
const Event = require('../src/event.class.js');

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

  describe('collides()', () => {
    it('should return false', () => {
      const event = new Event({
        title: 'The Event',
        since: sampleDate,
        till: sampleDate.offsetDay(2),
      });
      expect(event.collides(sampleDate.offsetDay(3), sampleDate.offsetDay(4))).to.be.false;
    });
    it('should return [l]', () => {
      const event = new Event({
        title: 'The Event',
        since: sampleDate,
        till: sampleDate.offsetDay(2),
      });
      expect(event.collides(sampleDate.offsetDay(-1), sampleDate)).to.deep.equal(['l']);
    });
    it('should return [l, c]', () => {
      const event = new Event({
        title: 'The Event',
        since: sampleDate,
        till: sampleDate.offsetDay(2),
      });
      expect(event.collides(sampleDate, sampleDate)).to.deep.equal(['l', 'c']);
    });
    it('should return [c]', () => {
      const event = new Event({
        title: 'The Event',
        since: sampleDate,
        till: sampleDate.offsetDay(3),
      });
      expect(event.collides(sampleDate.offsetDay(1), sampleDate.offsetDay(2))).to.deep.equal(['c']);
    });
    it('should return [l, r]', () => {
      const event = new Event({
        title: 'The Event',
        since: sampleDate,
        till: sampleDate.offsetDay(2),
      });
      expect(event.collides(sampleDate.offsetDay(-1), sampleDate.offsetDay(3))).to.deep.equal(['l', 'r', 'i']);
    });
    it('should return [l, r, c]', () => {
      const event = new Event({
        title: 'The Event',
        since: sampleDate,
        till: sampleDate.offsetDay(2),
      });
      expect(event.collides(sampleDate, sampleDate.offsetDay(2))).to.deep.equal(['l', 'r', 'c', 'i']);
    });
    it('should return [r]', () => {
      const event = new Event({
        title: 'The Event',
        since: sampleDate,
        till: sampleDate.offsetDay(2),
      });
      expect(event.collides(sampleDate.offsetDay(1), sampleDate.offsetDay(3))).to.deep.equal(['r']);
    });
    it('should return [r, c]', () => {
      const event = new Event({
        title: 'The Event',
        since: sampleDate,
        till: sampleDate.offsetDay(2),
      });
      expect(event.collides(sampleDate.offsetDay(1), sampleDate.offsetDay(2))).to.deep.equal(['r', 'c']);
    });
  });

  describe('query()', () => {
    context('when repeats is empty', () => {
      it('should return an array by length of 1', () => {
        const event = new Event({
          title: 'The Event',
          note: 'get a cake for him',
          since: sampleDate,
          till: sampleDate.offsetDay(10),
        });
        const series = event.query(sampleDate.offsetDay(-10), sampleDate.offsetDay(0));
        expect(series.events).to.have.lengthOf(1);
      });
      it('should return an array by length of 1', () => {
        const event = new Event({
          title: 'The Event',
          note: 'get a cake for him',
          since: sampleDate,
          till: sampleDate.offsetDay(10),
        });
        const series = event.query(sampleDate.offsetDay(-10), sampleDate.offsetDay(5));
        expect(series.events).to.have.lengthOf(1);
      });
      it('should return an array by length of 1', () => {
        const event = new Event({
          title: 'The Event',
          note: 'get a cake for him',
          since: sampleDate,
          till: sampleDate.offsetDay(10),
        });
        const series = event.query(sampleDate.offsetDay(10), sampleDate.offsetDay(15));
        expect(series.events).to.have.lengthOf(1);
      });
      it('should return an array by length of 0', () => {
        const event = new Event({
          title: 'The Event',
          note: 'get a cake for him',
          since: sampleDate,
          till: sampleDate.offsetDay(10),
        });
        const series = event.query(sampleDate.offsetDay(-10), sampleDate.offsetDay(-1));
        expect(series.events).to.have.lengthOf(0);
      });

      context('when since is bigger than till', () => {
        it('should return an array by length of 1', () => {
          const event = new Event({
            title: 'The Event',
            note: 'get a cake for him',
            since: sampleDate,
            till: sampleDate.offsetDay(10),
          });
          const series = event.query(sampleDate.offsetDay(11), sampleDate.offsetDay(5));
          expect(series.events).to.have.lengthOf(1);
        });
      });
    });

    context('when repeats is not empty', () => {
      it('should return an array by length of 2', () => {
        const event = new Event({
          title: 'The Event',
          note: 'get a cake for him',
          since: sampleDate,
          repeats: [
            { times: -1, cycle: 'year', step: 1 },
          ],
        });
        const series = event.query(sampleDate, sampleDate.offsetYear(1));
        expect(series.events).to.have.lengthOf(2);
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
        const series = event.query(sampleDate.offsetDay(1), sampleDate.offsetYear(8));
        expect(series.events).to.have.lengthOf(2);
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
        const series = event.query(sampleDate, sampleDate.offsetMonth(12));
        expect(series.events).to.have.lengthOf(12);
      });
      it('should return an array by length of 0', () => {
        const event = new Event({
          title: 'The Event',
          note: 'get a cake for him',
          since: sampleDate,
          repeats: [
            { times: 3, cycle: 'year', step: 1 },
          ],
        });
        const series = event.query(sampleDate.offsetMonth(1), sampleDate.offsetMonth(10));
        expect(series.events).to.have.lengthOf(0);
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
        const series = event.query(sampleDate, sampleDate.offsetMonth(2));
        expect(series.events).to.have.lengthOf(3);
      });
    });

    context('when sequels is not empty', () => {
      it('should return an array by length of 11', () => {
        const periodStart = new OneDate({ year: 2017, month: 4, day: 4 }, helper);
        const periodCycle = 28;
        const event = new Event({
          title: 'Period Days',
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
        const series = event.query(new OneDate({ year: 2018, month: 4, day: 1 }, helper),
          new OneDate({ year: 2018, month: 6, day: 30 }, helper));
        expect(series.events).to.have.lengthOf(11);
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
        const series = event.query(new OneDate({ year: 2017, month: 4, day: 1 }, helper),
          new OneDate({ year: 2017, month: 6, day: 30 }, helper));
        expect(series.events).to.have.lengthOf(2);
      });

      it('should return an array by length of 23', () => {
        const periodStart = new OneDate({ year: 2017, month: 4, day: 3 }, helper);
        const periodLength = 8;
        const cycleLength = 16;
        const event = new Event({
          title: 'Period Days',
          color: '#ee10f6',
          since: periodStart,
          till: periodStart.offsetDay(periodLength - 1),
          overlap: { internal: 'trim' },
          repeats: [{ times: -1, cycle: 'day', step: cycleLength }],
          sequels: [
            {
              title: 'Peak Ovulation',
              color: '#00aeef',
              since: { scale: 'day', offset: 10 },
              till: { scale: 'day', offset: 14 },
            },
            {
              title: 'Pre-Period',
              color: '#f36',
              since: { scale: 'day', offset: -2 },
              till: { scale: 'day', offset: -1 },
            },
            {
              title: 'Post-Period',
              color: '#7e70ff',
              since: { scale: 'day', offset: periodLength },
              till: { scale: 'day', offset: periodLength + 1 },
            },
          ],
        });
        const series = event.query(new OneDate({ year: 2017, month: 4, day: 1 }, helper),
          new OneDate({ year: 2017, month: 6, day: 30 }, helper));
        expect(series.events).to.have.lengthOf(23);
      });
      it('should return an array of 1', () => {
        const periodStart = new OneDate({ year: 2017, month: 4, day: 23 }, helper);
        const periodLength = 5;
        const cycleLength = 28;
        const event = new Event({
          title: 'Period Days',
          color: '#ee10f6',
          since: periodStart,
          till: periodStart.offsetDay(periodLength - 1),
          overlap: { internal: 'trim' },
          repeats: [{ times: -1, cycle: 'day', step: cycleLength }],
          sequels: [
            {
              title: 'Peak Ovulation',
              color: '#00aeef',
              since: { scale: 'day', offset: 10 },
              till: { scale: 'day', offset: 14 },
            },
            {
              title: 'Pre-Period',
              color: '#f36',
              since: { scale: 'day', offset: -2 },
              till: { scale: 'day', offset: -1 },
            },
            {
              title: 'Post-Period',
              color: '#7e70ff',
              since: { scale: 'day', offset: periodLength },
              till: { scale: 'day', offset: periodLength + 1 },
            },
          ],
        });
        const series = event.query(new OneDate({ year: 2017, month: 5, day: 19 }, helper),
          new OneDate({ year: 2017, month: 5, day: 19 }, helper));
        expect(series.events).to.have.lengthOf(1);
      });
    });
  });
});
