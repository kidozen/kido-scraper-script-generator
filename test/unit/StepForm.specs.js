/* jshint expr: true */
/* global describe, it, chai, multiline, Site, Step, StepForm */
var expect = chai.expect;

describe('StepForm', function() {
    'use strict';

    it('should exist', function() {
        expect(StepForm).to.exist;
    });

    describe('static methods', function() {

        it('should provide defaults', function() {
            expect(StepForm.getDefaults()).to.deep.equal({
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

    });

    describe('constructor', function() {

        it('should create an instance', function() {
            var options = {
                type: Site.TYPES.FORM,
                name: 'test form',
                selectors: [{
                    type: Site.TYPES.FORM_SELECTOR,
                    key: 'input#test',
                    value: 'test value'
                }, {
                    type: Site.TYPES.FORM_SELECTOR,
                    key: 'select.slt-test',
                    value: '1234'
                }],
                submit: {
                    type: Site.TYPES.CLICK,
                    key: 'button.btn-test'
                }
            };
            var step = new StepForm(options);
            expect(step).to.be.an.instanceof(Step);
            expect(step).to.be.an.instanceof(StepForm);
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
                .to.have.property('_submit')
                .that.is.an('object');
            expect(step._submit)
                .to.have.property('_type')
                .that.equals(options.submit.type);
            expect(step._submit)
                .to.have.property('_key')
                .that.equals(options.submit.key);
            expect(step._selectors).to.be.an('array');
            step._selectors.forEach(function(item, index) {
                expect(item)
                    .to.have.property('_type')
                    .that.equals(options.selectors[index].type);
                expect(item)
                    .to.have.property('_key')
                    .that.equals(options.selectors[index].key);
                expect(item)
                    .to.have.property('_value')
                    .that.equals(options.selectors[index].value);
            });
        });

        it('should throw with no arguments', function() {
            var func = function() {
                return new StepForm();
            };
            expect(func).to.throw('The "step" argument is required');
        });

        it('should throw with empty object', function() {
            var func = function() {
                return new StepForm({});
            };
            expect(func).to.throw('The "step.selectors" property must be an array');
        });

        it('should throw with no type property', function() {
            var func = function() {
                return new StepForm({
                    name: 'test form',
                    selectors: [],
                    submit: {
                        type: Site.TYPES.CLICK,
                        key: 'button.btn-test'
                    }
                });
            };
            expect(func).to.throw('The "step.type" property is required');
        });

        it('should throw with no selectors property', function() {
            var func = function() {
                return new StepForm({
                    type: Site.TYPES.FORM,
                    name: 'test form',
                    submit: {
                        type: Site.TYPES.CLICK,
                        key: 'button.btn-test'
                    }
                });
            };
            expect(func).to.throw('The "step.selectors" property must be an array');
        });

        it('should throw if the selectors property is not an array', function() {
            var func = function() {
                return new StepForm({
                    type: Site.TYPES.FORM,
                    name: 'test form',
                    selectors: {},
                    submit: {
                        type: Site.TYPES.CLICK,
                        key: 'button.btn-test'
                    }
                });
            };
            expect(func).to.throw('The "step.selectors" property must be an array');
        });

        it('should not throw with no name property', function() {
            var func = function() {
                return new StepForm({
                    type: Site.TYPES.FORM,
                    selectors: [],
                    submit: {
                        type: Site.TYPES.CLICK,
                        key: 'button.btn-test'
                    }
                });
            };
            expect(func).to.be.ok;
        });

    });

    describe('toJson', function() {

        it('should convert to json', function() {
            var options = {
                type: Site.TYPES.FORM,
                name: 'test form',
                selectors: [{
                    type: Site.TYPES.FORM_SELECTOR,
                    key: 'input#test',
                    value: 'test value'
                }, {
                    type: Site.TYPES.FORM_SELECTOR,
                    key: 'select.slt-test',
                    value: '1234'
                }],
                submit: {
                    type: Site.TYPES.CLICK,
                    key: 'button.btn-test'
                }
            };
            var step = new StepForm(options).toJson();
            expect(step).to.have.property('type', options.type);
            expect(step).to.have.property('name', options.name);
            expect(step).to.have.property('submit');
            expect(step).to.have.deep.property('submit.type', options.submit.type);
            expect(step).to.have.deep.property('submit.key', options.submit.key);
            expect(step.selectors).to.be.an('array');
            step.selectors.forEach(function(item, index) {
                expect(item)
                    .to.have.property('type')
                    .that.equals(options.selectors[index].type);
                expect(item)
                    .to.have.property('key')
                    .that.equals(options.selectors[index].key);
                expect(item)
                    .to.have.property('value')
                    .that.equals(options.selectors[index].value);
            });
        });

    });

    describe('toCasper', function() {

        it('should convert to casper', function() {
            var options = {
                type: Site.TYPES.FORM,
                name: 'test form',
                selectors: [{
                    type: Site.TYPES.FORM_SELECTOR,
                    key: 'input#test',
                    value: 'test value'
                }, {
                    type: Site.TYPES.FORM_SELECTOR,
                    key: 'select.slt-test',
                    value: '1234'
                }],
                submit: {
                    type: Site.TYPES.CLICK,
                    key: 'button.btn-test'
                }
            };
            var casper = multiline(function() {
                /*
                    casper.thenEvaluate(function() {
                        document.querySelector("input#test").value = "test value";
                        document.querySelector("select.slt-test").value = "1234";
                    });
                    casper.then(function(){
                        this.click("button.btn-test");
                    });
                */
            }).clean();
            var step = new StepForm(options);
            expect(step.toCasper().clean()).to.equal(casper);
        });

    });

});
