// additional Definitions for file: JSB_Users
function overloadJsbUsersDef() {
    // make sure act_defaults loads first
    if (!window.cached_jsb_users) return setTimeout(overloadJsbUsersDef, 100);

    // Override or update acached_jsb_users
    // window.cached_jsb_users["extrauser"] = { "username": "extrauser", "password": "guest", "passwordexpires": "", "errorcount": 0, "lastlogin": "", "isinrole": ["guest"] };
}

overloadJsbUsersDef()
