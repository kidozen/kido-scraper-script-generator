var expect = chai.expect;

describe('Site', function() {
    'use strict';

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
                container: '',
                fields: [{
                    type: Site.TYPES.SELECTOR,
                    name: '',
                    key: ''
                }]
            });
        });

        it('should provide defaults for selector', function() {
            expect(Site.getDefaults(Site.TYPES.SELECTOR)).to.deep.equal({
                type: Site.TYPES.SELECTOR,
                name: '',
                key: ''
            });
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

});
