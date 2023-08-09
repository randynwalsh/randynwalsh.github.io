// Definitions for file: SYSTEM
function overLoadSystemDef() {
    if (!window.cached_system) return setTimeout(overLoadSystemDef, 100);

    // Override and previous cache definition
    if (window.virginIDS) virginIDS.system = undefined
    window.cachedFileNames["system"] = "./js/act_sysprog/cached_sysprog_system.js"; // not used since we are always included in the <head>

    window.cached_system = {} // remove any previous definition by cached_system.js
    window.cached_system["sysprog.lcl"] = "P\xFE./sysprog/\xFEadmin\xFEadmin";
    // window.cached_system["ifwissql"] = "P\xFEhttp://10.24.72.135/jsb/ifwissql/\xFEguest\xFEguest";
    window.cached_system["sysprog.jsb"] = "P\xFE//jsbwinforms.azurewebsites.net/sysprog\xFEguest\xFEguest";
}


overLoadSystemDef()
