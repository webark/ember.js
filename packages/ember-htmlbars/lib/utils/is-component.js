/**
@module ember
@submodule ember-htmlbars
*/

import {
  CONTAINS_DASH_CACHE,
  CONTAINS_DOT_CACHE
} from '../system/lookup-helper';
import { isComponentCell } from '../keywords/closure-component';
import { isStream } from '../streams/utils';

function hasComponentOrTemplate(owner, path, options) {
  return owner.hasRegistration('component:' + path, options) ||
    owner.hasRegistration('template:components/' + path, options);
}

/*
 Given a path name, returns whether or not a component with that
 name was found in the container.
*/
export default function isComponent(env, scope, path) {
  let owner = env.owner;
  if (!owner) { return false; }
  if (typeof path === 'string') {
    if (CONTAINS_DOT_CACHE.get(path)) {
      let stream = env.hooks.get(env, scope, path);
      if (isStream(stream)) {
        let cell = stream.value();
        if (isComponentCell(cell)) {
          return true;
        }
      }
    }
    if (!CONTAINS_DASH_CACHE.get(path)) { return false; }

    if (hasComponentOrTemplate(owner, path)) {
      return true; // global component found
    } else {
      let moduleName = env.meta && env.meta.moduleName;

      if (!moduleName) {
        // Without a source moduleName, we can not perform local lookups.
        return false;
      }

      let options = { source: `template:${moduleName}` };

      return hasComponentOrTemplate(owner, path, options);
    }
  }
}
