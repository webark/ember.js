import { UPDATE } from '../utils/references';
import { unMut } from './mut';

export default {
  isInternalHelper: true,

  toReference(args) {
    let ref = unMut(args.positional.at(0));

    let wrapped = Object.create(ref);

    wrapped[UPDATE] = undefined;

    return wrapped;
  }
};
