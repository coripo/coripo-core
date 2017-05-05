/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;
const GregorianAdapter = require('../src/gregorian.adapter.js');
const OneDate = require('../src/onedate.class.js');

describe('OneDate Class', () => {
  const GREGORIAN_ADAPTER_ID = new GregorianAdapter().id;
  const dateConfig = { year: 2017, month: 10, day: 5, adapterId: GREGORIAN_ADAPTER_ID };
  const helper = {
    getAdapter: () => new GregorianAdapter(),
    primaryAdapterId: GREGORIAN_ADAPTER_ID,
  };

  describe('year', () => {
    it('should return 2017', () => {
      const date = new OneDate(dateConfig, helper);
      expect(date.year).to.equal(2017);
    });
  });

  describe('month', () => {
    it('should return 10', () => {
      const date = new OneDate(dateConfig, helper);
      expect(date.month).to.equal(10);
    });
  });

  describe('day', () => {
    it('should return 5', () => {
      const date = new OneDate(dateConfig, helper);
      expect(date.day).to.equal(5);
    });
  });

  describe('offsetYear()', () => {
    it('should return 2019', () => {
      const date = new OneDate(dateConfig, helper);
      expect(date.offsetYear(2).year).to.equal(2019);
    });
    it('should return 2006', () => {
      const date = new OneDate(dateConfig, helper);
      expect(date.offsetYear(-11).year).to.equal(2006);
    });

    context('immutability check', () => {
      it('should both return 20191005', () => {
        const date = new OneDate(dateConfig, helper);
        expect(date.offsetYear(2).int()).to.equal(date.offsetYear(2).int());
      });
    });
  });

  describe('offsetMonth()', () => {
    it('should return year 2017/11', () => {
      let date = new OneDate(dateConfig, helper);
      date = date.offsetMonth(1);
      expect(date.year).to.equal(2017);
      expect(date.month).to.equal(11);
    });
    it('should return 2018/1', () => {
      let date = new OneDate(dateConfig, helper);
      date = date.offsetMonth(3);
      expect(date.year).to.equal(2018);
      expect(date.month).to.equal(1);
    });
    it('should return 2017/6', () => {
      let date = new OneDate(dateConfig, helper);
      date = date.offsetMonth(-4);
      expect(date.year).to.equal(2017);
      expect(date.month).to.equal(6);
    });
    it('should return 2016/12', () => {
      let date = new OneDate(dateConfig, helper);
      date = date.offsetMonth(-10);
      expect(date.year).to.equal(2016);
      expect(date.month).to.equal(12);
    });

    context('immutability check', () => {
      it('should both return 20171105', () => {
        const date = new OneDate(dateConfig, helper);
        expect(date.offsetMonth(1).int()).to.equal(date.offsetMonth(1).int());
      });
    });
  });

  describe('offsetDay()', () => {
    it('should return 10/8', () => {
      let date = new OneDate(dateConfig, helper);
      date = date.offsetDay(3);
      expect(date.month).to.equal(10);
      expect(date.day).to.equal(8);
    });
    it('should return 11/2', () => {
      let date = new OneDate(dateConfig, helper);
      date = date.offsetDay(28);
      expect(date.month).to.equal(11);
      expect(date.day).to.equal(2);
    });
    it('should return 10/3', () => {
      let date = new OneDate(dateConfig, helper);
      date = date.offsetDay(-2);
      expect(date.month).to.equal(10);
      expect(date.day).to.equal(3);
    });
    it('should return 9/30', () => {
      let date = new OneDate(dateConfig, helper);
      date = date.offsetDay(-5);
      expect(date.month).to.equal(9);
      expect(date.day).to.equal(30);
    });

    context('immutability check', () => {
      it('should both return 20171008', () => {
        const date = new OneDate(dateConfig, helper);
        expect(date.offsetDay(3).int()).to.equal(date.offsetDay(3).int());
      });
    });
  });
});
