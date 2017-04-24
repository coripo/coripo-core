/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;
const GregorianAdapter = require('../src/gregorian.adapter.js').Adapter;
const OneDate = require('../src/onedate.class.js').OneDate;

describe('OneDate Class', () => {
  const GREGORIAN_ADAPTER_ID = new GregorianAdapter().id;
  const dateConfig = { year: 2017, month: 10, day: 5, adapterId: GREGORIAN_ADAPTER_ID };
  const helper = {
    getAdapter: () => new GregorianAdapter(),
    primaryAdapterId: GREGORIAN_ADAPTER_ID,
  };

  describe('getYear()', () => {
    it('should return 2017', () => {
      const date = new OneDate(dateConfig, helper);
      expect(date.getYear()).to.equal(2017);
    });
  });

  describe('getMonth()', () => {
    it('should return 10', () => {
      const date = new OneDate(dateConfig, helper);
      expect(date.getMonth()).to.equal(10);
    });
  });

  describe('getDay()', () => {
    it('should return 5', () => {
      const date = new OneDate(dateConfig, helper);
      expect(date.getDay()).to.equal(5);
    });
  });

  describe('offsetYear()', () => {
    it('should return year as 2019', () => {
      const date = new OneDate(dateConfig, helper);
      expect(date.offsetYear(2).getYear()).to.equal(2019);
    });
    it('should return year as 2006', () => {
      const date = new OneDate(dateConfig, helper);
      expect(date.offsetYear(-11).getYear()).to.equal(2006);
    });
  });

  describe('offsetMonth()', () => {
    it('should return year 2017 month as 11', () => {
      const date = new OneDate(dateConfig, helper);
      date.offsetMonth(1);
      expect(date.getYear()).to.equal(2017);
      expect(date.getMonth()).to.equal(11);
    });
    it('should return year as 2018 month as 1', () => {
      const date = new OneDate(dateConfig, helper);
      date.offsetMonth(3);
      expect(date.getYear()).to.equal(2018);
      expect(date.getMonth()).to.equal(1);
    });
    it('should return year as 2017 month as 6', () => {
      const date = new OneDate(dateConfig, helper);
      date.offsetMonth(-4);
      expect(date.getYear()).to.equal(2017);
      expect(date.getMonth()).to.equal(6);
    });
    it('should return year as 2016 month as 12', () => {
      const date = new OneDate(dateConfig, helper);
      date.offsetMonth(-10);
      expect(date.getYear()).to.equal(2016);
      expect(date.getMonth()).to.equal(12);
    });
  });

  describe('offsetDay()', () => {
    it('should return month as 10 day as 8', () => {
      const date = new OneDate(dateConfig, helper);
      date.offsetDay(3);
      expect(date.getMonth()).to.equal(10);
      expect(date.getDay()).to.equal(8);
    });
    it('should return month as 11 day as 2', () => {
      const date = new OneDate(dateConfig, helper);
      date.offsetDay(28);
      expect(date.getMonth()).to.equal(11);
      expect(date.getDay()).to.equal(2);
    });
    it('should return month as 10 day as 3', () => {
      const date = new OneDate(dateConfig, helper);
      date.offsetDay(-2);
      expect(date.getMonth()).to.equal(10);
      expect(date.getDay()).to.equal(3);
    });
    it('should return month as 9 day as 30', () => {
      const date = new OneDate(dateConfig, helper);
      date.offsetDay(-5);
      expect(date.getMonth()).to.equal(9);
      expect(date.getDay()).to.equal(30);
    });
  });
});
