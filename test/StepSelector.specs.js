'use strict';
var expect = require('chai').expect;
var multiline = require('multiline');
var Step = require('../extension/script/devtools/model/Step');
var Site = require('../extension/script/devtools/model/Site');
var StepSelector = require('../extension/script/devtools/model/StepSelector');

describe('StepSelector', function() {

    it('should exist', function() {
        expect(StepSelector).to.exist;
    });

    describe('static methods', function() {

        it('should provide defaults', function() {
            expect(StepSelector.getDefaults(Site)).to.deep.equal({
                type: Site.TYPES.SELECTOR,
                name: '',
                key: '',
                attr: ''
            });
        });

    });

    describe('constructor', function() {

        it('should create an instance', function() {
            var options = {
                type: Site.TYPES.SELECTOR,
                name: 'test selector',
                key: 'h2#title-test',
                attr: StepSelector.ATTRS.TEXT
            };
            var step = new StepSelector(Site, options);
            expect(step).to.be.an.instanceof(Step);
            expect(step).to.be.an.instanceof(StepSelector);
            expect(step.toJson).to.exist;
            expect(step.toCasper).to.exist;
            expect(step)
                .to.have.property('_type')
                .that.is.a('string')
                .that.equals(options.type);
            expect(step)
                .to.have.property('_name')
                .that.is.a('string')
                .that.equals(options.name);
            expect(step)
                .to.have.property('_key')
                .that.is.a('string')
                .that.equals(options.key);
        });

        it('should throw with no arguments', function() {
            var func = function() {
                return new StepSelector(Site);
            };
            expect(func).to.throw('The "step" argument is required');
        });

        it('should throw with empty object', function() {
            var func = function() {
                return new StepSelector(Site, {});
            };
            expect(func).to.throw('The "step.type" property is required');
        });

        it('should throw with no type property', function() {
            var func = function() {
                return new StepSelector(Site, {
                    name: 'test selector',
                    key: 'h2#title-test',
                    attr: StepSelector.ATTRS.TEXT
                });
            };
            expect(func).to.throw('The "step.type" property is required');
        });

        it('should throw with invalid type property', function() {
            var func = function() {
                return new StepSelector(Site, {
                    type: 'invalid type',
                    name: 'test selector',
                    key: 'h2#title-test',
                    attr: StepSelector.ATTRS.TEXT
                });
            };
            expect(func).to.throw('The "step.type" property is not valid');
        });

        it('should throw with no key property', function() {
            var func = function() {
                return new StepSelector(Site, {
                    type: Site.TYPES.SELECTOR,
                    name: 'test selector',
                    attr: StepSelector.ATTRS.TEXT
                });
            };
            expect(func).to.throw('The "step.key" property is required');
        });

        it('should throw with no name property', function() {
            var func = function() {
                return new StepSelector(Site, {
                    type: Site.TYPES.SELECTOR,
                    key: 'h2#title-test',
                    attr: StepSelector.ATTRS.TEXT
                });
            };
            expect(func).to.throw('The "step.name" property is required');
        });

        it('should throw with no attr property', function() {
            var func = function() {
                return new StepSelector(Site, {
                    type: Site.TYPES.SELECTOR,
                    name: 'test selector',
                    key: 'h2#title-test'
                });
            };
            expect(func).to.throw('The "step.attr" property is required');
        });

        it('should throw with invalid attr property', function() {
            var func = function() {
                return new StepSelector(Site, {
                    type: Site.TYPES.SELECTOR,
                    name: 'test selector',
                    key: 'h2#title-test',
                    attr: 'invalid attr'
                });
            };
            expect(func).to.throw('The "step.attr" property is not valid');
        });

    });

    describe('toJson', function() {

        it('should convert to json', function() {
            var options = {
                type: Site.TYPES.SELECTOR,
                name: 'test selector',
                key: 'h2#title-test',
                attr: StepSelector.ATTRS.TEXT
            };
            var step = new StepSelector(Site, options).toJson();
            expect(step).to.have.property('type', options.type);
            expect(step).to.have.property('name', options.name);
            expect(step).to.have.property('key', options.key);
            expect(step).to.have.property('attr', options.attr);
        });

    });

    describe('toCasper', function() {

        it('should convert to casper', function() {
            var options = {
                type: Site.TYPES.SELECTOR,
                name: 'test selector',
                key: 'h2#title-test',
                attr: StepSelector.ATTRS.TEXT
            };
            var casper = multiline(function() {
                /*
                    values["test selector"] = this.evaluate(function() {
                        var selection = document.querySelectorAll("h2#title-test");
                        return [].map.call(selection, function(item) {
                            return item.innerText;
                        });
                    });
                */
            })._clean();
            var step = new StepSelector(Site, options);
            expect(step.toCasper()._clean()).to.equal(casper);
        });

    });

});
