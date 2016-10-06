/**
@module ember
@submodule ember-templates
*/

import lookupPartial from 'ember-views/system/lookup_partial';
import { internal } from 'htmlbars-runtime';

/**
  The `partial` helper renders another template without
  changing the template context:

  ```handlebars
  {{foo}}
  {{partial "nav"}}
  ```

  The above example template will render a template named
  "-nav", which has the same context as the parent template
  it's rendered into, so if the "-nav" template also referenced
  `{{foo}}`, it would print the same thing as the `{{foo}}`
  in the above example.

  If a "-nav" template isn't found, the `partial` helper will
  fall back to a template named "nav".

  ### Bound template names

  The parameter supplied to `partial` can also be a path
  to a property containing a template name, e.g.:

  ```handlebars
  {{partial someTemplateName}}
  ```

  The above example will look up the value of `someTemplateName`
  on the template context (e.g. a controller) and use that
  value as the name of the template to render. If the resolved
  value is falsy, nothing will be rendered. If `someTemplateName`
  changes, the partial will be re-rendered using the new template
  name.


  @method partial
  @for Ember.Templates.helpers
  @param {String} partialName The name of the template to render minus the leading underscore.
  @public
*/

export default {
  setupState(state, env, scope, params, hash) {
    return { partialName: env.hooks.getValue(params[0]) };
  },

  render(renderNode, env, scope, params, hash, template, inverse, visitor) {
    let state = renderNode.getState();
    if (!state.partialName) { return true; }
    let found = lookupPartial(env, state.partialName);
    if (!found) { return true; }

    internal.hostBlock(renderNode, env, scope, found.raw, null, null, visitor, function(options) {
      options.templates.template.yield();
    });
  }
};
