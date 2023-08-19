// additional Definitions for file: JSB_Users
function overloadjsbMDDef() {
    // make sure act_defaults loads first
    if (!window.cached_md) return setTimeout(overloadjsbMDDef, 100);

    // Override or update cached_md
    window.cached_md["showtop1000"] = "cv\xFEjsb_mdl\xFEshowtop1000";
}

overloadjsbMDDef()
