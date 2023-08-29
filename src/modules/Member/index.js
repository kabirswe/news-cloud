import List from './List'
import Permission from './Permission'
import MemberSave from './Save/memberForm'
import path from '../../routes/path'

export const MemberModule = [
    {
        path: path.memberList,
        component: List
    },
    {
        path: path.memberPermission,
        component: Permission
    },
    {
        path: path.memberSave,
        component: MemberSave
    }
]
