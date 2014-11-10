'use strict';
var expect = require('chai').expect;
var Site = require('../extension/script/devtools/model/Site');
var Step = require('../extension/script/devtools/model/Step');

describe('Step', function() {

    it('should exist', function() {
        expect(Step).to.exist;
    });

    describe('constructor', function() {

        var fakeStep = {
            type: Site.TYPES.FORM
        };

        it('should create an instance', function() {
            var step = new Step(Site, fakeStep);
            expect(step).to.be.an.instanceof(Step);
            expect(step._type).to.be.equal(fakeStep.type);
        });

        it('should throw with no arguments', function() {
            var func = function() {
                return new Step();
            };
            expect(func).to.throw('The "Site" argument is required');
        });

        it('should throw with no Site argument', function() {
            var func = function() {
                return new Step(fakeStep);
            };
            expect(func).to.throw('The "step" argument is required');
        });

        it('should throw with no step argument', function() {
            var func = function() {
                return new Step(Site);
            };
            expect(func).to.throw('The "step" argument is required');
        });

        it('should throw with no type property', function() {
            var func = function() {
                return new Step(Site, {});
            };
            expect(func).to.throw('The "step.type" property is required');
        });

    });

});
