import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePricing, rentalDaysBetween } from '../js/pricing.js';
test('multi-day without protection',()=>{const p=calculatePricing({dailyPrice:300,rentalDays:3,deposit:1000});assert.deepEqual([p.rentalTotal,p.deposit,p.protectionFee,p.platformFee,p.communityFund,p.totalDue,p.ownerNet],[90000,100000,0,10800,216,190000,79200]);});
test('multi-day with protection',()=>{const p=calculatePricing({dailyPrice:300,rentalDays:3,deposit:1000,protectionSelected:true});assert.equal(p.protectionFee,4500);assert.equal(p.totalDue,194500);});
test('rejects zero days, invalid dates, and negative amounts',()=>{assert.throws(()=>calculatePricing({dailyPrice:300,rentalDays:0}));assert.throws(()=>calculatePricing({dailyPrice:-1,rentalDays:1}));assert.throws(()=>rentalDaysBetween('2026-10-24','2026-10-24'));});
test('rounds fees using integer satang',()=>{const p=calculatePricing({dailyPrice:.01,rentalDays:1,deposit:0,protectionSelected:true});assert.equal(p.rentalTotal,1);assert.equal(p.platformFee,0);assert.equal(p.protectionFee,0);});
