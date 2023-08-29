import Users from './Management'
import EditUser from './EditUser'
import Profile from './Profile/Update'
import path from '../../routes/path'

export const UsersModule = [
    {
        path: path.users,
        component: Users
    },
    {
        path: path.editUser,
        component: EditUser
    },
    {
        path: path.profile,
        component: Profile
    }
]