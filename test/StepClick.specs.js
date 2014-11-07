'use strict';
var expect = require('chai').expect;
var multiline = require('multiline');
var Step = require('../extension/script/devtools/model/Step');
var Site = require('../extension/script/devtools/model/Site');
var StepClick = require('../extension/script/devtools/model/StepClick');

describe('StepClick', function() {

    it('should exist', function() {
        expect(StepClick).to.exist;
    });

    describe('static methods', function() {

        it('should provide defaults', function() {
            expect(StepClick.getDefaults(Site)).to.deep.equal({
                type: Site.TYPES.CLICK,
                name: '',
                key: ''
            });
        });

    });

    describe('constructor', function() {

        it('should create an instance', function() {
            var options = {
                type: Site.TYPES.CLICK,
                name: 'test click',
                key: 'input#test'
            };
            var step = new StepClick(Site, options);
            expect(step).to.be.an.instanceof(Step);
            expect(step).to.be.an.instanceof(StepClick);
            expect(step.toJson).to.exist;
            expect(step.toCasper).to.exist;
            expect(step._type).to.be.equal(options.type);
            expect(step._name).to.be.equal(options.name);
            expect(step._key).to.be.equal(options.key);
        });

        it('should throw with no arguments', function() {
            var func = function() {
                return new StepClick(Site);
            };
            expect(func).to.throw('The "step" argument is required');
        });

        it('should throw with empty object', function() {
            var func = function() {
                return new StepClick(Site, {});
            };
            expect(func).to.throw('The "step.type" property is required');
        });

        it('should throw with no type property', function() {
            var func = function() {
                return new StepClick(Site, {
                    name: 'test click',
                    key: 'input#test'
                });
            };
            expect(func).to.throw('The "step.type" property is required');
        });

        it('should throw with invalid type property', function() {
            var func = function() {
                return new StepClick(Site, {
                    type: 'invalid type',
                    name: 'test click',
                    key: 'input#test'
                });
            };
            expect(func).to.throw('The "step.type" property is not valid');
        });

        it('should throw with no key property', function() {
            var func = function() {
                return new StepClick(Site, {
                    type: Site.TYPES.CLICK,
                    name: 'test click'
                });
            };
            expect(func).to.throw('The "step.key" property is required');
        });

        it('should not throw with no name property', function() {
            var func = function() {
                return new StepClick(Site, {
                    type: Site.TYPES.CLICK,
                    key: 'input#test'
                });
            };
            expect(func).to.be.ok;
        });

    });

    describe('toJson', function() {

        it('should convert to json', function() {
            var options = {
                type: Site.TYPES.CLICK,
                name: 'test click',
                key: 'input#test'
            };
            var step = new StepClick(Site, options);
            expect(step.toJson()).to.deep.equal(options);
        });

    });

    describe('toCasper', function() {

        it('should convert to casper', function() {
            var options = {
                type: Site.TYPES.CLICK,
                name: 'test click',
                key: 'input#test'
            };
            var casper = multiline(function() {
                /*
                    casper.then(function() {
                        this.click("input#test");
                    });
                */
            })._clean();
            var step = new StepClick(Site, options);
            expect(step.toCasper()._clean()).to.equal(casper);
        });

    });

});
