'use strict';
var expect = require('chai').expect;
var multiline = require('multiline');
var Util = require('../extension/script/devtools/model/Util');
var Step = require('../extension/script/devtools/model/Step');
var Site = require('../extension/script/devtools/model/Site');
var StepScrape = require('../extension/script/devtools/model/StepScrape');
var StepSelector = require('../extension/script/devtools/model/StepSelector');

describe('StepScrape', function() {

    it('should exist', function() {
        expect(StepScrape).to.exist;
    });

    describe('static methods', function() {

        it('should provide defaults', function() {
            expect(StepScrape.getDefaults(Site)).to.deep.equal({
                type: Site.TYPES.SCRAPE,
                name: '',
                fields: [{
                    type: Site.TYPES.SELECTOR,
                    name: '',
                    key: '',
                    attr: ''
                }]
            });
        });

    });

    describe('constructor', function() {

        it('should create an instance', function() {
            var options = {
                type: Site.TYPES.SCRAPE,
                name: 'test scrape',
                fields: [{
                    type: Site.TYPES.SELECTOR,
                    name: 'test-brand',
                    key: 'h4.brand',
                    attr: StepSelector.ATTRS.TEXT
                }, {
                    type: Site.TYPES.SELECTOR,
                    name: 'test-price',
                    key: 'h5.price',
                    attr: StepSelector.ATTRS.TEXT
                }]
            };
            var step = new StepScrape(Site, options);
            expect(step).to.be.an.instanceof(Step);
            expect(step).to.be.an.instanceof(StepScrape);
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
            expect(step._fields).to.be.an('array');
            step._fields.forEach(function(item, index) {
                expect(item)
                    .to.have.property('_type')
                    .that.equals(options.fields[index].type);
                expect(item)
                    .to.have.property('_name')
                    .that.equals(options.fields[index].name);
                expect(item)
                    .to.have.property('_key')
                    .that.equals(options.fields[index].key);
            });
        });

        it('should throw with no arguments', function() {
            var func = function() {
                return new StepScrape(Site);
            };
            expect(func).to.throw('The "step" argument is required');
        });

        it('should throw with empty object', function() {
            var func = function() {
                return new StepScrape(Site, {});
            };
            expect(func).to.throw('The "step.type" property is required');
        });

        it('should throw with no type property', function() {
            var func = function() {
                return new StepScrape(Site, {
                    name: 'test scrape',
                    fields: []
                });
            };
            expect(func).to.throw('The "step.type" property is required');
        });

        it('should throw with invalid type property', function() {
            var func = function() {
                return new StepScrape(Site, {
                    type: 'invalid type',
                    name: 'test scrape',
                    fields: []
                });
            };
            expect(func).to.throw('The "step.type" property is not valid');
        });

        it('should not throw with no name property', function() {
            var func = function() {
                return new StepScrape(Site, {
                    type: Site.TYPES.SCRAPE,
                    fields: []
                });
            };
            expect(func).to.be.ok;
        });

        it('should throw with no fields property', function() {
            var func = function() {
                return new StepScrape(Site, {
                    type: Site.TYPES.SCRAPE,
                    name: 'test scrape'
                });
            };
            expect(func).to.throw('The "step.fields" property must be an array');
        });

        it('should throw if the fields property is not an array', function() {
            var func = function() {
                return new StepScrape(Site, {
                    type: Site.TYPES.SCRAPE,
                    name: 'test scrape',
                    fields: {}
                });
            };
            expect(func).to.throw('The "step.fields" property must be an array');
        });

    });

    describe('toJson', function() {

        it('should convert to json', function() {
            var options = {
                type: Site.TYPES.SCRAPE,
                name: 'test scrape',
                fields: [{
                    type: Site.TYPES.SELECTOR,
                    name: 'test-brand',
                    key: 'h4.brand',
                    attr: StepSelector.ATTRS.TEXT
                }, {
                    type: Site.TYPES.SELECTOR,
                    name: 'test-price',
                    key: 'h5.price',
                    attr: StepSelector.ATTRS.TEXT
                }]
            };
            var step = new StepScrape(Site, options).toJson();
            expect(step).to.have.property('type', options.type);
            expect(step).to.have.property('name', options.name);
            expect(step.fields).to.be.an('array');
            step.fields.forEach(function(item, index) {
                expect(item)
                    .to.have.property('type')
                    .that.equals(options.fields[index].type);
                expect(item)
                    .to.have.property('name')
                    .that.equals(options.fields[index].name);
                expect(item)
                    .to.have.property('key')
                    .that.equals(options.fields[index].key);
                expect(item)
                    .to.have.property('attr')
                    .that.equals(options.fields[index].attr);
            });
        });

    });

    describe('toCasper', function() {

        it('should convert to casper', function() {
            var options = {
                type: Site.TYPES.SCRAPE,
                name: 'test scrape',
                fields: [{
                    type: Site.TYPES.SELECTOR,
                    name: 'test-brand',
                    key: 'h4.brand',
                    attr: StepSelector.ATTRS.TEXT
                }, {
                    type: Site.TYPES.SELECTOR,
                    name: 'test-price',
                    key: 'h5.price',
                    attr: StepSelector.ATTRS.TEXT
                }]
            };
            var casper = Util.clean.call(multiline(function() {
                /*
                    casper.then(function() {
                        var values = {};
                        values["test-brand"] = this.evaluate(function() {
                            var selection = document.querySelectorAll("h4.brand");
                            return [].map.call(selection, function(item) {
                                return item.innerText;
                            });
                        });
                        values["test-price"] = this.evaluate(function() {
                            var selection = document.querySelectorAll("h5.price");
                            return [].map.call(selection, function(item) {
                                return item.innerText;
                            });
                        });
                        var result = [];
                        Object.keys(values).forEach(function(key) {
                            values[key].forEach(function(val, index) {
                                result[index] = result[index] || {};
                                result[index][key] = val;
                            });
                        });
                        this.echo(JSON.stringify(result, null, 2));
                    });
                */
            }));
            var step = new StepScrape(Site, options);
            expect(Util.clean.call(step.toCasper())).to.equal(casper);
        });

    });

});
