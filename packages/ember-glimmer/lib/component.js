import CoreView from 'ember-views/views/core_view';
import ClassNamesSupport from './ember-views/class-names-support';
import ChildViewsSupport from 'ember-views/mixins/child_views_support';
import ViewStateSupport from 'ember-views/mixins/view_state_support';
import InstrumentationSupport from 'ember-views/mixins/instrumentation_support';
import AriaRoleSupport from 'ember-views/mixins/aria_role_support';
import ViewMixin from 'ember-views/mixins/view_support';
import ActionSupport from 'ember-views/mixins/action_support';
import TargetActionSupport from 'ember-runtime/mixins/target_action_support';
import symbol from 'ember-metal/symbol';
import { get } from 'ember-metal/property_get';
import { PROPERTY_DID_CHANGE } from 'ember-metal/property_events';
import { getAttrFor } from 'ember-views/compat/attrs-proxy';
import { UPDATE, RootReference } from './utils/references';
import { DirtyableTag } from 'glimmer-reference';
import { readDOMAttr } from 'glimmer-runtime';
import { assert, deprecate } from 'ember-metal/debug';
import { NAME_KEY } from 'ember-metal/mixin';
import { getOwner } from 'container/owner';

export const DIRTY_TAG = symbol('DIRTY_TAG');
export const ARGS = symbol('ARGS');
export const ROOT_REF = symbol('ROOT_REF');
export const IS_DISPATCHING_ATTRS = symbol('IS_DISPATCHING_ATTRS');
export const HAS_BLOCK = symbol('HAS_BLOCK');
export const BOUNDS = symbol('BOUNDS');

const Component = CoreView.extend(
  ChildViewsSupport,
  ViewStateSupport,
  ClassNamesSupport,
  InstrumentationSupport,
  AriaRoleSupport,
  TargetActionSupport,
  ActionSupport,
  ViewMixin, {
    isComponent: true,

    init() {
      this._super(...arguments);
      this[IS_DISPATCHING_ATTRS] = false;
      this[DIRTY_TAG] = new DirtyableTag();
      this[ROOT_REF] = new RootReference(this);
      this[BOUNDS] = null;

      // If a `defaultLayout` was specified move it to the `layout` prop.
      // `layout` is no longer a CP, so this just ensures that the `defaultLayout`
      // logic is supported with a deprecation
      if (this.defaultLayout && !this.layout) {
        deprecate(
          `Specifying \`defaultLayout\` to ${this} is deprecated. Please use \`layout\` instead.`,
          false,
          {
            id: 'ember-views.component.defaultLayout',
            until: '3.0.0',
            url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-component-defaultlayout'
          }
        );

        this.layout = this.defaultLayout;
      }

      // If in a tagless component, assert that no event handlers are defined
      assert(
        `You can not define a function that handles DOM events in the \`${this}\` tagless component since it doesn't have any DOM element.`,
        this.tagName !== '' || !this.renderer._destinedForDOM || !(() => {
          let eventDispatcher = getOwner(this).lookup('event_dispatcher:main');
          let events = (eventDispatcher && eventDispatcher._finalEvents) || {};

          for (let key in events) {
            let methodName = events[key];

            if (typeof this[methodName]  === 'function') {
              return true; // indicate that the assertion should be triggered
            }
          }
        }
      )());
    },

    rerender() {
      this[DIRTY_TAG].dirty();
      this._super();
    },

    __defineNonEnumerable(property) {
      this[property.name] = property.descriptor.value;
    },

    [PROPERTY_DID_CHANGE](key) {
      if (this[IS_DISPATCHING_ATTRS]) { return; }

      let args, reference;

      if ((args = this[ARGS]) && (reference = args[key])) {
        if (reference[UPDATE]) {
          reference[UPDATE](get(this, key));
        }
      }
    },

    getAttr(key) {
      // TODO Intimate API should be deprecated
      let attrs = this.attrs;
      if (!attrs) { return; }
      return getAttrFor(attrs, key);
    },

    readDOMAttr(name) {
      return readDOMAttr(this.element, name);
    }
  }
);

Component[NAME_KEY] = 'Ember.Component';

Component.reopenClass({
  isComponentFactory: true
});

export default Component;
