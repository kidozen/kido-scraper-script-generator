var expect = chai.expect;

describe('StepFormSelector', function() {
    'use strict';

    it('should exist', function() {
        expect(StepFormSelector).to.exist;
    });

    describe('static methods', function() {

        it('should provide defaults', function() {
            expect(StepFormSelector.getDefaults()).to.deep.equal({
                type: Site.TYPES.FORM_SELECTOR,
                name: '',
                key: '',
                value: ''
            });
        });

    });

    describe('constructor', function() {

        it('should create an instance', function() {
            var options = {
                type: Site.TYPES.FORM_SELECTOR,
                name: 'test form selector',
                key: 'input#test',
                value: 'test value'
            };
            var step = new StepFormSelector(options);
            expect(step).to.be.an.instanceof(Step);
            expect(step).to.be.an.instanceof(StepFormSelector);
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
            expect(step)
                .to.have.property('_value')
                .that.is.a('string')
                .that.equals(options.value);
        });

        it('should throw with no arguments', function() {
            var func = function() {
                return new StepFormSelector();
            };
            expect(func).to.throw('The "step" argument is required');
        });

        it('should throw with empty object', function() {
            var func = function() {
                return new StepFormSelector({});
            };
            expect(func).to.throw('The "step.key" property is required');
        });

        it('should throw with no type property', function() {
            var func = function() {
                return new StepFormSelector({
                    name: 'test form selector',
                    key: 'input#test',
                    value: 'test value'
                });
            };
            expect(func).to.throw('The "step.type" property is required');
        });

        it('should throw with no key property', function() {
            var func = function() {
                return new StepFormSelector({
                    type: Site.TYPES.FORM_SELECTOR,
                    name: 'test form selector',
                    value: 'test value'
                });
            };
            expect(func).to.throw('The "step.key" property is required');
        });

        it('should not throw with no name property', function() {
            var func = function() {
                return new StepFormSelector({
                    type: Site.TYPES.FORM_SELECTOR,
                    key: 'input#test',
                    value: 'test value'
                });
            };
            expect(func).to.be.ok;
        });

    });

    describe('toJson', function() {

        it('should convert to json', function() {
            var options = {
                type: Site.TYPES.FORM_SELECTOR,
                name: 'test form selector',
                key: 'input#test',
                value: 'test value'
            };
            var step = new StepFormSelector(options).toJson();
            expect(step).to.have.property('type', options.type);
            expect(step).to.have.property('name', options.name);
            expect(step).to.have.property('key', options.key);
            expect(step).to.have.property('value', options.value);
        });

    });

    describe('toCasper', function() {

        it('should convert to casper', function() {
            var options = {
                type: Site.TYPES.FORM_SELECTOR,
                name: 'test form selector',
                key: 'input#test',
                value: 'test value'
            };
            var casper = multiline(function() {
                /*
                    document.querySelector("input#test").value = "test value";
                */
            }).clean();
            var step = new StepFormSelector(options);
            expect(step.toCasper().clean()).to.equal(casper);
        });

    });

});
