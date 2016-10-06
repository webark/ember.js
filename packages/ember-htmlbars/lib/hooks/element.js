/**
@module ember
@submodule ember-htmlbars
*/

import { findHelper } from '../system/lookup-helper';
import { handleRedirect } from 'htmlbars-runtime/hooks';
import { buildHelperStream } from '../system/invoke-helper';

export default function emberElement(morph, env, scope, path, params, hash, visitor) {
  if (handleRedirect(morph, env, scope, path, params, hash, null, null, visitor)) {
    return;
  }

  let result;
  let helper = findHelper(path, scope.getSelf(), env);
  if (helper) {
    let helperStream = buildHelperStream(helper, params, hash, { element: morph.element }, env, scope, path);
    result = helperStream.value();
  } else {
    result = env.hooks.get(env, scope, path);
  }

  env.hooks.getValue(result);
}
