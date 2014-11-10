'use strict';
var expect = require('chai').expect;
var multiline = require('multiline');
var Util = require('../extension/script/devtools/model/Util');
var Site = require('../extension/script/devtools/model/Site');
var StepSelector = require('../extension/script/devtools/model/StepSelector');

describe('Site', function() {

    it('should exist', function() {
        expect(Site).to.exist;
    });

    describe('static methods', function() {

        it('should provide step types', function() {
            expect(Site.TYPES).to.exist;
            expect(Site.TYPES.CLICK).to.be.equal('click');
            expect(Site.TYPES.FORM).to.be.equal('form');
            expect(Site.TYPES.FORM_SELECTOR).to.be.equal('form_selector');
            expect(Site.TYPES.SCRAP).to.be.equal('scrap');
            expect(Site.TYPES.SELECTOR).to.be.equal('selector');
        });

        it('should provide constructors', function() {
            expect(Site.getConstructor).to.exist;
            var func;
            Object.keys(Site.TYPES).forEach(function(type) {
                func = function() {
                    return Site.getConstructor(Site.TYPES[type]);
                };
                expect(func).to.not.throw('The type is not valid');
            });
            func = function() {
                return Site.getConstructor('invalid type');
            };
            expect(func).to.throw('The type is not valid');
        });

        it('should provide defaults for site', function() {
            expect(Site.getDefaults).to.exist;
            expect(Site.getDefaults()).to.deep.equal({
                name: '',
                url: '',
                steps: []
            });
        });

        it('should provide defaults for click', function() {
            expect(Site.getDefaults(Site.TYPES.CLICK)).to.deep.equal({
                type: Site.TYPES.CLICK,
                name: '',
                key: ''
            });
        });

        it('should provide defaults for form', function() {
            expect(Site.getDefaults(Site.TYPES.FORM)).to.deep.equal({
                type: Site.TYPES.FORM,
                name: '',
                selectors: [{
                    type: Site.TYPES.FORM_SELECTOR,
                    name: '',
                    key: '',
                    value: ''
                }],
                submit: {
                    type: Site.TYPES.CLICK,
                    name: '',
                    key: ''
                }
            });
        });

        it('should provide defaults for form selector', function() {
            expect(Site.getDefaults(Site.TYPES.FORM_SELECTOR)).to.deep.equal({
                type: Site.TYPES.FORM_SELECTOR,
                name: '',
                key: '',
                value: ''
            });
        });

        it('should provide defaults for scrap', function() {
            expect(Site.getDefaults(Site.TYPES.SCRAP)).to.deep.equal({
                type: Site.TYPES.SCRAP,
                name: '',
                fields: [{
                    type: Site.TYPES.SELECTOR,
                    name: '',
                    key: '',
                    attr: ''
                }]
            });
        });

        it('should provide defaults for selector', function() {
            expect(Site.getDefaults(Site.TYPES.SELECTOR)).to.deep.equal({
                type: Site.TYPES.SELECTOR,
                name: '',
                key: '',
                attr: ''
            });
        });

        it('should throw with invalid type', function() {
            var func = function() {
                return Site.getDefaults('invalid type');
            };
            expect(func).to.throw('The type is not valid');
        });

        it('should validate step', function() {
            expect(Site.validateStep).to.exist;
            var func = function() {
                return Site.validateStep();
            };
            expect(func).to.throw('The "step" argument is required');
            func = function() {
                return Site.validateStep({});
            };
            expect(func).to.throw('The "step.type" property is required');
            func = function() {
                return Site.validateStep({
                    type: 'invalid type'
                });
            };
            expect(func).to.throw('The type is not valid');
            expect(Site.validateStep({
                type: Site.TYPES.CLICK,
                key: 'button.btn-test'
            })).to.be.true;
        });

    });

    describe('constructor', function() {

        it('should create an instance', function() {
            var options = {
                name: 'test',
                url: 'www.test.com',
                steps: []
            };
            var site = new Site(options);
            expect(site).to.be.an.instanceof(Site);
            expect(site.toJson).to.exist;
            expect(site.toCasper).to.exist;
            expect(site._name).to.be.equal(options.name);
            expect(site._url).to.be.equal(options.url);
            expect(site._steps).to.deep.equal(options.steps);
        });

        it('should throw with no arguments', function() {
            var func = function() {
                return new Site();
            };
            expect(func).to.throw('The "site" argument is required');
        });

        it('should throw with empty object', function() {
            var func = function() {
                return new Site({});
            };
            expect(func).to.throw('The "site.name" property is required');
        });

        it('should throw with no name property', function() {
            var func = function() {
                return new Site({
                    url: 'www.test.com',
                    steps: []
                });
            };
            expect(func).to.throw('The "site.name" property is required');
        });

        it('should throw with no url property', function() {
            var func = function() {
                return new Site({
                    name: 'test',
                    steps: []
                });
            };
            expect(func).to.throw('The "site.url" property is required');
        });

        it('should throw with no steps property', function() {
            var func = function() {
                return new Site({
                    name: 'test',
                    url: 'www.test.com'
                });
            };
            expect(func).to.throw('The "site.steps" property must be an array');
        });

        it('should throw if the steps property is not an array', function() {
            var func = function() {
                return new Site({
                    name: 'test',
                    url: 'www.test.com',
                    steps: {}
                });
            };
            expect(func).to.throw('The "site.steps" property must be an array');
        });

    });

    var testSite = {
        name: 'test site',
        url: 'http://www.test.com/',
        steps: [{
            type: Site.TYPES.FORM,
            name: 'Search',
            selectors: [{
                type: Site.TYPES.FORM_SELECTOR,
                name: '',
                key: 'input#query',
                value: 'test value'
            }],
            submit: {
                type: Site.TYPES.CLICK,
                name: '',
                key: 'button.ml-btn'
            }
        }, {
            type: Site.TYPES.SCRAP,
            name: 'Scrap',
            fields: [{
                type: Site.TYPES.SELECTOR,
                name: 'description',
                key: 'h2.list-view-item-title',
                attr: StepSelector.ATTRS.TEXT
            }, {
                type: Site.TYPES.SELECTOR,
                name: 'price',
                key: 'span.ch-price',
                attr: StepSelector.ATTRS.TEXT
            }]
        }]
    };

    describe('toJson', function() {

        it('should convert to json', function() {
            var site = new Site(testSite).toJson();
            expect(site).to.have.property('name', testSite.name);
            expect(site).to.have.property('url', testSite.url);
            expect(site.steps)
                .to.be.an('array')
                .and.to.have.length(2);
            site.steps.forEach(function(item, index) {
                expect(item)
                    .to.have.property('type')
                    .that.equals(testSite.steps[index].type);
                expect(item)
                    .to.have.property('name')
                    .that.equals(testSite.steps[index].name);
            });
        });

    });

    describe('toCasper', function() {

        it('should convert to casper', function() {
            var casper = Util.clean.call(multiline(function() {
                /*
                    var casper = require('casper').create({
                        pageSettings: {
                            loadImages: false,
                            loadPlugins: false
                        }
                    });
                    casper.start('http://www.test.com/');
                    casper.thenEvaluate(function() {
                        document.querySelector("input#query").value = "test value";
                    });
                    casper.then(function() {
                        this.click("button.ml-btn");
                    });
                    casper.then(function() {
                        var values = {};
                        values["description"] = this.evaluate(function() {
                            var selection = document.querySelectorAll("h2.list-view-item-title");
                            return [].map.call(selection, function(item) {
                                return item.innerText;
                            });
                        });
                        values["price"] = this.evaluate(function() {
                            var selection = document.querySelectorAll("span.ch-price");
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
                    casper.run(function() {
                        this.exit();
                    });
                */
            }));
            var site = new Site(testSite);
            expect(Util.clean.call(site.toCasper())).to.equal(casper);
        });

    });

});
