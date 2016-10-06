/**
@module ember
@submodule ember-templates
*/

import View from 'ember-views/views/view';
import topLevelViewTemplate from 'ember-htmlbars/templates/top-level-view';
import TemplateSupport from 'ember-views/mixins/template_support';

export let CoreOutletView = View.extend(TemplateSupport, {
  defaultTemplate: topLevelViewTemplate,

  init() {
    this._super();
    this._outlets = [];
  },

  setOutletState(state) {
    this.outletState = { main: state };

    if (this._env) {
      this._env.outletState = this.outletState;
    }

    if (this.lastResult) {
      this.dirtyOutlets();
      this._outlets = [];

      this.scheduleRevalidate(null, null);
    }
  },

  dirtyOutlets() {
    // Dirty any render nodes that correspond to outlets
    for (let i = 0; i < this._outlets.length; i++) {
      this._outlets[i].isDirty = true;
    }
  }
});

export let OutletView = CoreOutletView.extend({ tagName: '' });
