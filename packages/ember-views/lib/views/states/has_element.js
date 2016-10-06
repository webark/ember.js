import _default from './default';
import {
  assign,
  run,
  flaggedInstrument,
  get
} from 'ember-metal';
import jQuery from '../../system/jquery';

const hasElement = Object.create(_default);

assign(hasElement, {
  $(view, sel) {
    let elem = view.element;
    return sel ? jQuery(sel, elem) : jQuery(elem);
  },

  getElement(view) {
    let parent = get(view, 'parentView');
    if (parent) { parent = get(parent, 'element'); }
    if (parent) { return view.findElementInParentElement(parent); }
    return jQuery('#' + get(view, 'elementId'))[0];
  },

  // once the view has been inserted into the DOM, rerendering is
  // deferred to allow bindings to synchronize.
  rerender(view) {
    view.renderer.ensureViewNotRendering(view);
    view.renderer.rerender(view);
  },

  destroy(view) {
    view.renderer.remove(view);
  },

  // Handle events from `Ember.EventDispatcher`
  handleEvent(view, eventName, event) {
    if (view.has(eventName)) {
      // Handler should be able to re-dispatch events, so we don't
      // preventDefault or stopPropagation.
      return flaggedInstrument(`interaction.${eventName}`, { event, view }, () => {
        return run.join(view, view.trigger, eventName, event);
      });
    } else {
      return true; // continue event propagation
    }
  }
});

export default hasElement;
