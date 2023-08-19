// additional Definitions for file: JSB_Users
function overloadjsbConfigDef() {
    // make sure act_defaults loads first
    if (!window.cached_jsb_config) return setTimeout(overloadjsbConfigDef, 100);

    // Override or update acached_jsb_config
    // window.cached_jsb_config["extraconfig"] = { }
}

overloadjsbConfigDef()

