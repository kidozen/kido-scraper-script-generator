/* global casper, document, __utils__ */
'use strict';

var URL = 'http://localhost:9090/view/devtools/panel.html';

casper.test.begin('should build form selector script', function(test) {
    casper.start(URL, function() {
        test.assertUrlMatch(URL + '#/zero', 'Url hash must be "/zero"');
        test.assertSelectorHasText('h2', 'My Sites');
        test.assertEval(function() {
            return __utils__.findOne('button').innerText === 'Add new site';
        }, 'Find "Add new site" button');
        this.click('button');
    });

    casper.thenEvaluate(function() {
        document.querySelector('input[ng-model="name"]').value = 'Test';
        document.querySelector('input[ng-model="url"]').value = 'http://www.test.com';
    });

    casper.then(function() {
        test.assertUrlMatch(URL + '#/one', 'Url hash must be "/one"');
        test.assertSelectorHasText('h2', 'New Site');
        test.assertEval(function() {
            return __utils__.findOne('input[ng-model="name"]').value === 'Test';
        }, 'Validate "name" input');
        test.assertEval(function() {
            return __utils__.findOne('input[ng-model="url"]').value === 'http://www.test.com';
        }, 'Validate "url" input');
        test.assertEval(function() {
            return __utils__.findOne('button').innerText === 'Create';
        }, 'Find "Create" button');
        this.click('button');
    });

    casper.then(function() {
        test.assertUrlMatch(URL + '#/two/test', 'Url hash must be "/two/test"');
    });

    casper.run(function() {
        test.done();
    });
});
