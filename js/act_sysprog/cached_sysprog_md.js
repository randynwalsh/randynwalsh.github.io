anonymousFunc = function () {

    // start command - go to https://idfg.idaho.gov/ifwis/IfwisAGPI/sqlDocs/tcl and "delete md sqldocs" to allow tcl access
    if (!window.cached_md) window.cached_md = {}
    cached_md["cs"] = "qd\xFEifwissql\xFEcs";

    // Point to the sources
    if (location.href.indexOf("//localhost") > 0) { 
        window.cached_md["jsb_tcl"] = "qd\xFEsysprog.jsb\xFEjsb_tcl";
        window.cached_md["jsb_bf"] = "qd\xFEsysprog.jsb\xFEjsb_bf";
        window.cached_md["jsb_html"] = "qd\xFEsysprog.jsb\xFEjsb_html";
        window.cached_md["jsb_odb"] = "qd\xFEsysprog.jsb\xFEjsb_odb";
        window.cached_md["jsb_themes"] = "qd\xFEsysprog.jsb\xFEjsb_themes";
        window.cached_md["jsb_mdl"] = "qd\xFEsysprog.jsb\xFEjsb_mdl";
        window.cached_md["jsb_ctls"] = "qd\xFEsysprog.jsb\xFEjsb_ctls";
        window.cached_md["jsb_pagetemplates"] = "qd\xFEsysprog.jsb\xFEjsb_pagetemplates";
        window.cached_md["jsb_viewtemplates"] = "qd\xFEsysprog.jsb\xFEjsb_viewtemplates";
        window.cached_md["jsb2js"] = "qd\xFEsysprog.jsb\xFEjsb2js";
    }
}

anonymousFunc()
anonymousFunc = null