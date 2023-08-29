import path from './path';

export const mapRoutesWithDb =  {
    "Article Edit": [path.content,path.contentCreate, path.contentEdit],
    "Article Review": [],
    "Article Approve": [],
    "Article Publish": [],
    "User Management": [path.users, path.editUser, path.profile],
    "System Setting": [path.systemSettings, path.role, path.sns, path.location],
    "Member Management": [path.memberList],
    "Design": []
}


// controlled menus are [user management, memeber management, system settings]