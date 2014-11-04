var expect = chai.expect;

describe('StepClick', function() {
    'use strict';

    it('should exist', function() {
        expect(StepClick).to.exist;
    });

    describe('static methods', function() {

        it('should provide defaults', function() {
            expect(StepClick.getDefaults()).to.deep.equal({
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
            var step = new StepClick(options);
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
                return new StepClick();
            };
            expect(func).to.throw('The "step" argument is required');
        });

        it('should throw with empty object', function() {
            var func = function() {
                return new StepClick({});
            };
            expect(func).to.throw('The "step.key" property is required');
        });

        it('should throw with no type property', function() {
            var func = function() {
                return new StepClick({
                    name: 'test click',
                    key: 'input#test'
                });
            };
            expect(func).to.throw('The "step.type" property is required');
        });

        it('should throw with no key property', function() {
            var func = function() {
                return new StepClick({
                    type: Site.TYPES.CLICK,
                    name: 'test click'
                });
            };
            expect(func).to.throw('The "step.key" property is required');
        });

        it('should not throw with no name property', function() {
            var func = function() {
                return new StepClick({
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
            var step = new StepClick(options);
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
            }).clean();
            var step = new StepClick(options);
            expect(step.toCasper().clean()).to.equal(casper);
        });

    });

});
