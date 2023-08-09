// additional Definitions for file: JSB_THEMES
function overloadJsbThemesDef() {
    if (!window.cached_jsb_themes) return setTimeout(overloadJsbThemesDef, 100);

    // Override and previous cache definition
    if (window.virginIDS) virginIDS.jsb_themes = undefined
    window.cachedFileNames["jsb_themes"] = "./js/act_sysprog/cached_sysprog_jsb_themes.js"; // not used since we are always included in the <head>
    window.cached_jsb_themes["extra"] = "Program Extra\xFE   Print 'Hello'\xFEEnd Program";
}


overloadJsbThemesDef()

