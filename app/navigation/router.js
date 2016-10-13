import {
  createRouter
} from '@exponent/ex-navigation'

import Sandbox from '../../_sandbox/Sandbox'

export default createRouter(() => ({
  sandbox: () => Sandbox
}))
