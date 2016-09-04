import { setTesting } from 'ember-metal';
import { jQuery } from 'ember-views';
import {
  getAdapter,
  setAdapter
} from './test/adapter';
import {
  incrementPendingRequests,
  decrementPendingRequests,
  clearPendingRequests
} from './test/pending_requests';
import QUnitAdapter from './adapters/qunit';

/**
  Sets Ember up for testing. This is useful to perform
  basic setup steps in order to unit test.

  Use `App.setupForTesting` to perform integration tests (full
  application testing).

  @method setupForTesting
  @namespace Ember
  @since 1.5.0
  @private
*/
export default function setupForTesting() {
  setTesting(true);

  let adapter = getAdapter();
  // if adapter is not manually set default to QUnit
  if (!adapter) {
    setAdapter(new QUnitAdapter());
  }

  jQuery(document).off('ajaxSend', incrementPendingRequests);
  jQuery(document).off('ajaxComplete', decrementPendingRequests);

  clearPendingRequests();

  jQuery(document).on('ajaxSend', incrementPendingRequests);
  jQuery(document).on('ajaxComplete', decrementPendingRequests);
}
