import Login from './Login'
import Forgot from './Forgot'
import Registration from './Registration'
import Reset from './Reset'
import TokenExpired from './TokenExpired'
import path from '../../routes/path'

export const AuthModule = [
    {
        path: path.login,
        component: Login
    },
    {
        path: path.forgot,
        component: Forgot
    },
    {
        path: path.reset,
        component: Reset
    },
    {
        path: path.signup,
        component: Registration
    },
    {
        path: path.tokenExpired,
        component: TokenExpired
    }
]