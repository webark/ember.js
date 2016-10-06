import { Controller, String as StringUtils } from 'ember-runtime';
import { Route, NoneLocation } from 'ember-routing';
import { run } from 'ember-metal';
import { compile } from 'ember-template-compiler';
import { Application } from 'ember-application';
import { jQuery } from 'ember-views';
import { setTemplates, setTemplate } from 'ember-glimmer';

let App, container, router, registry;
let expectedReplaceURL, expectedPushURL;


let TestLocation = NoneLocation.extend({
  initState() {
    this.set('path', startingURL);
  },

  setURL(path) {
    if (expectedReplaceURL) {
      ok(false, 'pushState occurred but a replaceState was expected');
    }
    if (expectedPushURL) {
      equal(path, expectedPushURL, 'an expected pushState occurred');
      expectedPushURL = null;
    }
    this.set('path', path);
  },

  replaceURL(path) {
    if (expectedPushURL) {
      ok(false, 'replaceState occurred but a pushState was expected');
    }
    if (expectedReplaceURL) {
      equal(path, expectedReplaceURL, 'an expected replaceState occurred');
      expectedReplaceURL = null;
    }
    this.set('path', path);
  }
});

function bootApplication() {
  router = container.lookup('router:main');
  run(App, 'advanceReadiness');
}

function sharedSetup() {
  run(() => {
    App = Application.create({
      name: 'App',
      rootElement: '#qunit-fixture'
    });

    App.deferReadiness();

    registry = App.__registry__;
    container = App.__container__;

    registry.register('location:test', TestLocation);

    startingURL = expectedReplaceURL = expectedPushURL = '';

    App.Router.reopen({
      location: 'test'
    });

    App.LoadingRoute = Route.extend({
    });

    setTemplate('application', compile('{{outlet}}'));
    setTemplate('home', compile('<h3>Hours</h3>'));
  });
}

function sharedTeardown() {
  run(() => {
    App.destroy();
    App = null;
    setTemplates({});
  });
}

QUnit.module('Routing with Query Params', {
  setup() {
    sharedSetup();
  },

  teardown() {
    sharedTeardown();
  }
});

let startingURL = '';

function testParamlessLinks(routeName) {
  QUnit.test('param-less links in an app booted with query params in the URL don\'t reset the query params: ' + routeName, function() {
    expect(1);

    setTemplate(routeName, compile('{{link-to \'index\' \'index\' id=\'index-link\'}}'));

    App[StringUtils.capitalize(routeName) + 'Controller'] = Controller.extend({
      queryParams: ['foo'],
      foo: 'wat'
    });

    startingURL = '/?foo=YEAH';
    bootApplication();

    equal(jQuery('#index-link').attr('href'), '/?foo=YEAH');
  });
}

testParamlessLinks('application');
testParamlessLinks('index');
