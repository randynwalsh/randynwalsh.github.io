
// <OAUTH_SUBS_Sub>
async function JSB_ODB_OAUTH_SUBS_Sub() {
}
// </OAUTH_SUBS_Sub>

// <OLOGIN_Pgm>
async function JSB_ODB_OLOGIN_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    await JSB_ODB_PGM_AUTHLOGIN_Sub();
    return;
}
// </OLOGIN_Pgm>

// <OAUTHLOGIN_Pgm>
async function JSB_ODB_OAUTHLOGIN_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    await JSB_ODB_PGM_AUTHLOGIN_Sub();
    return;
}
// </OAUTHLOGIN_Pgm>

// <PGM_AUTHLOGIN_Sub>
async function JSB_ODB_PGM_AUTHLOGIN_Sub() {
    var Oauthauthority = paramVar('authority');
    var Forcereapprove = false;
    var Rtnurl = queryVar('returnurl');
    if (Not(Rtnurl)) Rtnurl = queryVar('response_redirect');

    if (Oauthauthority) Forcereapprove = paramVar('forceReapprove');

    var Access_Token = await JSB_ODB_OAUTH_LOGIN(Oauthauthority, Forcereapprove, function (_Oauthauthority, _Forcereapprove) { Oauthauthority = _Oauthauthority; Forcereapprove = _Forcereapprove });
    if (Not(Access_Token)) return Stop(activeProcess.At_Errors);

    if (Rtnurl) {
        // if InStr(rtnUrl, "?") Then rtnUrl := "&" Else rtnUrl := "?"
        // rtnUrl := "access_token=":UrlEncode(access_token)
        Println(At(-1), JSB_HTML_SCRIPT('window.location.href=' + jsEscapeString(Rtnurl)));
        FlushHTML();
        return Stop();
    }

    // We need to use response.redirect so that the rpcsid doesn't change
    if (CBool(queryVar('returnurl'))) return At_Response.redirect(urlDecode(queryVar('returnurl')));
    if (CBool(queryVar('response_redirect'))) return At_Response.redirect(urlDecode(queryVar('response_redirect')));

    var Closeurl = (HtmlRoot() + 'close_html?access_token=' + urlEncode(Access_Token) + '&userno=' + urlEncode(userno()));

    Println(JSB_HTML_SCRIPT(' \r\n\
        // debugger;\r\n\
        var myIFrame = parent.window[\'popOutID\']\r\n\
        if (myIFrame) {\r\n\
            $(myIFrame).attr(\'src\', "' + Closeurl + '");\r\n\
        } else {\r\n\
            window.location.href = "' + Closeurl + '";\r\n\
        }     \r\n\
    '));
}
// </PGM_AUTHLOGIN_Sub>

// <OAUTH_LOGIN>
async function JSB_ODB_OAUTH_LOGIN(Oauthauthority, Forcereapprove) {
    // local variables
    var I;

    var _Userno = userno();

    var Ftmp = await JSB_BF_FHANDLE('tmp');

    var _Settings = undefined;

    if (Not(Oauthauthority)) {
        _Settings = await JSB_BF_JSBCONFIG('authenticationtype', { "value": 'local' });
        Oauthauthority = _Settings.oauth_authority;
        if (Not(Oauthauthority)) return Stop('Please specify an oauth_authority in your default jsb_config authenticationtype');
    }

    if (Right(LCase(Oauthauthority), 7) != '_config') Oauthauthority += '_config';
    if (await asyncRead(await JSB_BF_FHANDLE('jsb_config'), Oauthauthority, "JSON", 0, _data => _Settings = _data)); else { activeProcess.At_Errors = Oauthauthority + ' app _settings are not setup in jsb_config.'; return undefined; }
    if (Right(_Settings.jsbauthority, 1) == '/') {
        _Settings.jsbauthority = Left(_Settings.jsbauthority, Len(_Settings.jsbauthority) - 1);
        if (await asyncWrite(_Settings, await JSB_BF_FHANDLE('jsb_config'), Oauthauthority, "", 0)); else null;
    }

    // Steps:
    // 1) We redirect the user to the oAuth login page (see _settings.authorize), passing a "state" parameter

    // 2) after a login, the oauth will redirect the user to a known page (oauth_silent_redirect_uri) with an access code and the "state" we provided.
    // we exchange the access code for an access token, and then use the "state" to redirect the user back to where he came from.

    // Step 1:
    // Build URL to the oAuth server login page (_settings.authorize) to request a code

    var Url = _Settings.authorize;
    Url += '?response_type=code';
    Url += '&client_id=' + urlEncode(_Settings.client_id);
    if (CBool(_Settings.scope)) Url += '&scope=' + urlEncode(_Settings.scope);
    if (CBool(_Settings.response_mode)) Url += '&response_mode=' + urlEncode(_Settings.response_mode);

    if (Forcereapprove) {
        if (CBool(_Settings.prompt)) {
            // login: force login screen, none: don't show any login screens, and consent (force user to consent to giving app permisssions)
            Url += '&prompt=login';
        } else {
            Url += '&force_reapprove=true';
        }
    }

    // Tell the oauth server where to redirect the user to exchange the code for a token (silent_redirect_uri)
    var Silent_Redirect_Uri = CStr(_Settings.jsbauthority) + '/oauth_silent_redirect_uri';
    var Sameorigin = Left(Silent_Redirect_Uri, Len(JSBRootAct())) == JSBRootAct();
    if (InStr1(1, JSB_BF_URL(), ':443')) Silent_Redirect_Uri = Change(Silent_Redirect_Uri, '/' + Field(Silent_Redirect_Uri, '/', 3) + '/', '/' + Field(Silent_Redirect_Uri, '/', 3) + ':443/');
    if (Left(Silent_Redirect_Uri, Len(JSBRootAct())) == JSBRootAct()) Sameorigin = true;
    Url += '&redirect_uri=' + urlEncode(Silent_Redirect_Uri);

    // Build the "state" the will eventually be passed back to us, so we know where the send the user next
    // use "atoken_" to write the access token on the server and we will fetch with a rest call
    var Rtntourl = '';
    if (Sameorigin) Rtntourl = JSBRootAct() + 'oauth_redirect_uri'; else Rtntourl = 'atoken_' + DropIfLeft(_Userno, ':');
    Url += '&state=' + urlEncode(Oauthauthority + '*' + _Userno + '*' + Rtntourl + '*' + JSB_BF_URL());

    var Browserscript = (Hidden('accesstoken', '') + JSB_HTML_SCRIPT('\r\n\
        window.checkClosed = function () {\r\n\
            if (!winObj || winObj.closed || typeof winObj.closed==\'undefined\')  { \r\n\
                if (!window.cordova) doJsbSubmit(false) \r\n\
            } else setTimeout(checkClosed, 500); \r\n\
        }\r\n\
        \r\n\
        var winObj;\r\n\
        var url = "' + Url + '"\r\n\
\r\n\
        if (window.saveAtSession) saveAtSession()\r\n\
    \r\n\
        if (window.cordova) {\r\n\
            if (cordova.InAppBrowser) {\r\n\
                winObj = cordova.InAppBrowser.open(url, "_blank", "location=yes");\r\n\
            } else {\r\n\
                winObj = navigator.app.loadUrl(url, {openExternal:true});\r\n\
            }\r\n\
        } else {\r\n\
            winObj = window.open(url, "_system", "location=yes");\r\n\
        }\r\n\
        \r\n\
        if(!winObj || typeof winObj.closed==\'undefined\') winObj = false;\r\n\
\r\n\
        if (winObj)\r\n\
           checkClosed();\r\n\
        else\r\n\
            popoutWindow("' + Oauthauthority + ' oAuth Login", "' + Url + '", "80%", "80%", function () { doJsbSubmit(false); })\r\n\
    '));

    JSB_BF_USERVAR('oauth_results', '');
    var B = At_Response.buffer();
    Print(Browserscript);

    // We will return here eventually with a POST
    await At_Server.asyncPause(me);
    At_Response.buffer(B);

    var Access_Token = formVar('accesstoken');
    var Oauth_Results = undefined;
    if (Not(Access_Token)) {
        // ======================== Run the javascript to make the call     // ======================== 
        // Do we need to fetch access token from server?
        if (Field(Rtntourl, '_', 1) == 'atoken') {
            // Call the server, ask for our access token
            Url = CStr(_Settings.jsbauthority) + '/oauth_myToken?atoken=' + Rtntourl;
            var Soauth_Results = await JSB_BF_GET(Url);

            if (Not(Soauth_Results)) {
                activeProcess.At_Errors = 'no result from server routine oauth_myToken';
                return undefined;
            }

            Oauth_Results = parseJSON(Soauth_Results);
            if (CBool(Oauth_Results.access_errors)) { activeProcess.At_Errors = Oauth_Results.access_errors; return undefined; }
        } else {
            if (System(1) == 'js') window.getAtSession();
            for (I = 1; I <= 12; I++) {
                Oauth_Results = JSB_BF_USERVAR('oauth_results');
                if (CBool(Oauth_Results)) break;
                FlushHTML();
            }

            if (Not(Oauth_Results)) {
                activeProcess.At_Errors = 'OAuth login failed for \'' + Oauthauthority + '\'';
                return undefined;
            }

            if (CBool(Oauth_Results.access_errors)) {
                activeProcess.At_Errors = Oauth_Results.access_errors;
                return undefined;
            }
        }

        Access_Token = Oauth_Results.access_token;
        JSB_BF_USERVAR('myOAuthCode', Oauth_Results.Code);
    }

    // SUCCESSFUL - Save our current login
    JSB_BF_USERVAR('myAccessToken', Access_Token);
    JSB_BF_USERVAR('myOAuthName', Oauthauthority);

    var Userinfo = await JSB_ODB_OAUTHWHO();
    var _Username = '';
    if (CBool(Userinfo)) _Username = Userinfo.username;

    if (Not(_Username) == Null0(Userinfo.username)) {
        activeProcess.At_Errors = 'oAuth Login successful, but unable to retrieve a username';
        return undefined;
    }

    var Oauthdomain = DropIfRight(Oauthauthority, '_config');
    if (LCase(Left(_Username, Len(Oauthdomain) + 1)) != LCase(Oauthdomain) + '-') _Username = Oauthdomain + '-' + _Username;

    await JSB_BF_SIGNIN(_Username, true, function (__Username) { _Username = __Username });

    // Update profile?
    var F_Users = await JSB_BF_FHANDLE('JSB_USERS');
    if (CBool(F_Users)) {
        var Profile = undefined;
        if (await asyncRead(F_Users, _Username, "JSON", 0, _data => Profile = _data)); else {
            Profile = {};
            Profile.username = _Username;
            Profile.password = 'X';
            Profile.isinrole = [undefined,];
            Profile.disabled = false;

            if (CBool(Userinfo.email)) {
                Profile.email = Userinfo.email;
                var Emaildomain = LCase(DropLeft(CStr(Userinfo.email), '@'));
                if (Left(Emaildomain, Len(Oauthdomain) + 1) == Oauthdomain + '.') Profile.isinrole = [undefined, 'employee'];
            }

            if (await asyncWrite(Profile, F_Users, _Username, "JSON", 0)); else null;
        }
    }

    return Access_Token;
}
// </OAUTH_LOGIN>

// <OAUTH_MYTOKEN_Pgm>
async function JSB_ODB_OAUTH_MYTOKEN_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    // local variables
    var Atoken = '', Restful_Result, Oauth_Results, R, Cb;

    var Restful_Result;
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Atoken = JSB_BF_PARAMVAR('ATOKEN', CStr(1));
                System(56);// Run to compleation
                if (Field(Atoken, '_', 1) != 'atoken') { Restful_Result = { "access_errors": 'bad request' }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto; }

                if (await asyncRead(await JSB_BF_FHANDLE('tmp'), Atoken, "JSON", 0, _data => Oauth_Results = _data)) {
                    if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('tmp'), Atoken)); else return Stop(activeProcess.At_Errors);
                    Restful_Result = Oauth_Results; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto;
                }

                Restful_Result = { "access_errors": 'unknown token' }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto;

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                // This server only routine is needed since oauth requires a known url for the redirect.  
                // After the user logs in, he is rediected here with a code.  We must then
                // contact the oauth server to convert the code into an the access token.
                // This insures that the code is valid and it's not a spoof.

                // We are also passed the "state" parameter, which can be anything we want that
                // is setup by us in the original login request.  Here we store a return URL
                // for the user.

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </OAUTH_MYTOKEN_Pgm>

// <OAUTH_REDIRECT_URI_Pgm>
async function JSB_ODB_OAUTH_REDIRECT_URI_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    System(56);// Run to compleation
    // should run in the same session state as the first caller
    var _Userno = JSB_BF_URLPARAM('userno');
    var Oauthname_Config = JSB_BF_URLPARAM('oAuthName_Config');
    var Access_Token = JSB_BF_URLPARAM('access_token');
    var Access_Errors = JSB_BF_URLPARAM('errors');
    var Token_Type = JSB_BF_URLPARAM('token_type');
    var Rtnurl = JSB_BF_URLPARAM('returnurl');

    var Oauth_Results = { "access_token": Access_Token, "access_errors": Access_Errors, "token_type": Token_Type, "userno": _Userno, "close": HtmlRoot() };
    JSB_BF_USERVAR('oauth_results', Oauth_Results, _Userno);

    return At_Response.redirect(HtmlRoot() + 'close_html?access_token=' + Access_Token + '&token_type=' + Token_Type + '&errors=' + urlEncode(Access_Errors) + '&oAuthName_Config=' + urlEncode(Oauthname_Config) + '&userno=' + urlEncode(_Userno));
}
// </OAUTH_REDIRECT_URI_Pgm>

// <OAUTHWHO_Pgm>
async function JSB_ODB_OAUTHWHO_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    var Userinfo = await JSB_ODB_OAUTHWHO();
    if (Not(Userinfo)) Println(activeProcess.At_Errors);
    Println(Userinfo);
    return;
}
// </OAUTHWHO_Pgm>

// <OWHO_Pgm>
async function JSB_ODB_OWHO_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    var Userinfo = await JSB_ODB_OAUTHWHO();
    if (Not(Userinfo)) Println(activeProcess.At_Errors);
    Println(Userinfo);
    return;
}
// </OWHO_Pgm>

// <OAUTHWHO>
async function JSB_ODB_OAUTHWHO() {
    var Access_Token = JSB_BF_USERVAR('myAccessToken');
    var Oauthname_Config = JSB_BF_USERVAR('myOAuthName');

    if ((Not(Access_Token))) { activeProcess.At_Errors = 'Please first do an oAuthLogin'; return undefined; }

    // Get user info
    var _Settings = undefined;
    if (await asyncRead(await JSB_BF_FHANDLE('jsb_config'), Oauthname_Config, "JSON", 0, _data => _Settings = _data)); else { activeProcess.At_Errors = Oauthname_Config + ' app _settings are not setup in jsb_config.'; return undefined; }
    if (CBool(_Settings.ItemContent)) return Stop('This oAuth profile isn\'t json');

    var Mydomain = JSBRootAct();
    if (Right(Mydomain, 1) == '/') Mydomain = Left(Mydomain, Len(Mydomain) - 1);

    var Localdomain = LCase(_Settings.jsbauthority) == LCase(Mydomain);
    var Userinfo = undefined;

    if (Localdomain) {
        Userinfo = await JSB_ODB_OAUTH_PROFILE(Oauthname_Config, Access_Token, function (_Oauthname_Config, _Access_Token) { Oauthname_Config = _Oauthname_Config; Access_Token = _Access_Token });
    } else {
        var Url = (CStr(_Settings.jsbauthority) + '/oauth_profile?oAuthName_Config=' + urlEncode(Oauthname_Config) + '&access_token=' + urlEncode(Access_Token));
        Userinfo = CJSon(await JSB_BF_GET(Url, 'GET'));
    }

    if (Not(Userinfo)) return undefined;
    if (CBool(Userinfo.error)) { activeProcess.At_Errors = Userinfo.error; return undefined; }

    return Userinfo;
}
// </OAUTHWHO>

// <OQUIT_Pgm>
async function JSB_ODB_OQUIT_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    if (Not(await JSB_ODB_OAUTH_QUIT())) Println(activeProcess.At_Errors);
    return;
}
// </OQUIT_Pgm>

// <OAUTHQUIT_Pgm>
async function JSB_ODB_OAUTHQUIT_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    if (Not(await JSB_ODB_OAUTH_QUIT())) Println(activeProcess.At_Errors);
    return;
}
// </OAUTHQUIT_Pgm>

// <OAUTHOFF_Pgm>
async function JSB_ODB_OAUTHOFF_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    if (Not(await JSB_ODB_OAUTH_QUIT())) Println(activeProcess.At_Errors);
    return;
}
// </OAUTHOFF_Pgm>

// <OAUTHLOGOFF_Pgm>
async function JSB_ODB_OAUTHLOGOFF_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    if (Not(await JSB_ODB_OAUTH_QUIT())) Println(activeProcess.At_Errors);
    return;
}
// </OAUTHLOGOFF_Pgm>

// <OOFF_Pgm>
async function JSB_ODB_OOFF_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    if (Not(await JSB_ODB_OAUTH_QUIT())) Println(activeProcess.At_Errors);
    return;
}
// </OOFF_Pgm>

// <OLOGOUT_Pgm>
async function JSB_ODB_OLOGOUT_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    if (Not(await JSB_ODB_OAUTH_QUIT())) Println(activeProcess.At_Errors);
    return;
}
// </OLOGOUT_Pgm>

// <OLOGOFF_Pgm>
async function JSB_ODB_OLOGOFF_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    if (Not(await JSB_ODB_OAUTH_QUIT())) Println(activeProcess.At_Errors);
    return;
}
// </OLOGOFF_Pgm>

// <OAUTH_QUIT>
async function JSB_ODB_OAUTH_QUIT() {
    var Access_Token = JSB_BF_USERVAR('myAccessToken');
    var Oauthname_Config = JSB_BF_USERVAR('myOAuthName');

    if ((Not(Access_Token) || Not(Oauthname_Config))) { activeProcess.At_Errors = 'Not logged in'; return false; }

    // Get user info
    var _Settings = undefined;
    if (await asyncRead(await JSB_BF_FHANDLE('jsb_config'), Oauthname_Config, "JSON", 0, _data => _Settings = _data)); else { activeProcess.At_Errors = Oauthname_Config + ' app _settings are not setup in jsb_config.'; return false; }

    var Url = _Settings.revoke;
    if (Not(Url)) Url = Change(_Settings.authorize, '/authorize', '/revocation');

    var Header = [undefined, 'Content-Type: application/x-www-form-urlencoded', 'Authorization: Bearer ' + Access_Token];
    var Method = '';
    if (InStr1(1, Left(Url, 10), ',')) {
        Method = Field(Url, ',', 1);
        Url = DropLeft(Url, ',');
    } else {
        Method = 'POST';
    }

    var Logoutinfo = (CJSon(await JSB_BF_GET(Url, Method, Header, 'token_type_hint=access_token&token=' + Access_Token, undefined, function (_Header, _P4) { Header = _Header })));

    JSB_BF_USERVAR('myAccessToken', '');
    JSB_BF_USERVAR('myOAuthName', '');

    return true;
}
// </OAUTH_QUIT>

// <OAUTH_PROFILE_Pgm>
async function JSB_ODB_OAUTH_PROFILE_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    // local variables
    var Oauthname_Config = '', Access_Token = '', Restful_Result;
    var R, Cb;

    var Restful_Result;
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Oauthname_Config = JSB_BF_PARAMVAR('OAUTHNAME_CONFIG', CStr(1)); Access_Token = JSB_BF_PARAMVAR('ACCESS_TOKEN', CStr(2));
                Restful_Result = await JSB_ODB_OAUTH_PROFILE(Oauthname_Config, Access_Token, function (_Oauthname_Config, _Access_Token) { Oauthname_Config = _Oauthname_Config; Access_Token = _Access_Token }); gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto;

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </OAUTH_PROFILE_Pgm>

// <OAUTH_PROFILE>
async function JSB_ODB_OAUTH_PROFILE(Oauthname_Config, Access_Token) {
    // Get user info
    if (Right(LCase(Oauthname_Config), 7) != '_config') Oauthname_Config = CStr(Oauthname_Config) + '_config';

    var _Settings = undefined;
    if (await asyncRead(await JSB_BF_FHANDLE('jsb_config'), Oauthname_Config, "JSON", 0, _data => _Settings = _data)); else { return { "error": Oauthname_Config + ' app _settings are not setup in jsb_config.' } }
    if (CBool(_Settings.ItemContent)) { return { "error": 'This oAuth profile isn\'t json' } }

    var Url = _Settings.userinfo;
    if (Not(Url)) { return { "error": Oauthname_Config + ' app _settings do not have a userinfo url' } }

    var Header = [undefined, 'Content-Type: application/json', 'Authorization: Bearer ' + CStr(Access_Token)];
    var Method = '';
    if (InStr1(1, Left(Url, 10), ',')) {
        Method = Field(Url, ',', 1);
        Url = DropLeft(Url, ',');
    } else {
        Method = 'POST';
    }

    var Userinfo = CJSon(await JSB_BF_GET(Url, Method, Header, 'null', undefined, function (_Header, _P4) { Header = _Header }));
    if (Not(Userinfo)) { return { "error": Url + ' ' + CStr(activeProcess.At_Errors) } }

    var Rec = {};
    if (CBool(Userinfo.email)) Rec.email = Userinfo.email;

    if (CBool(Userinfo.preferred_username)) {
        Rec.username = Userinfo.preferred_username;
    } else if (CBool(Userinfo.username)) {
        Rec.username = Userinfo.username;
    } else if (CBool(Userinfo.login)) {
        Rec.username = Userinfo.login;
    } else if (CBool(Userinfo.user)) {
        Rec.username = Userinfo.user;
    } else if (CBool(Rec.email)) {
        Rec.username = Field(Rec.email, '@', 1);
    } else {
        return Userinfo;
    }

    return Rec;
}
// </OAUTH_PROFILE>

// <RPC_SERVER_Sub>
async function JSB_ODB_RPC_SERVER_Sub() {
}
// </RPC_SERVER_Sub>

// <RPC_RECORD_CALL>
async function JSB_ODB_RPC_RECORD_CALL(Info) {
    if (System(1) != 'aspx') return false;
    if (await JSB_ODB_WRITE(CStr(Info), await JSB_BF_FHANDLE('', 'iplog', true), DATETIME() + '.' + Right(Timer(), 2) + ' ' + JSB_BF_MYIP())); else return false;
    return true;
}
// </RPC_RECORD_CALL>

// <SELECTTO>
async function JSB_ODB_SELECTTO(Cols, Fhandle, Whereclause, ByRef_Sl, setByRefValues) {
    // local variables
    var Term, Termi, Preselect, Limitedids, Needparens, Nexttk;
    var Andclause, Cname, Rfhandle, Success, Topn, Bottomn, Wherehasfunctions;
    var Wherehasoperators, Usesitemcontent, Hasorderby, Displaycolumns;
    var Columnshasfunctions, Columnshasoperators, Ignoreorderby;
    var Twhere, Tcols, Js, Selecteditemids, Selecteditems, Newids;
    var Newitems, I, Rs;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Sl)
        return v
    }
    if (InStrI1(1, Whereclause, 'orderby')) {
        var Awhereclause = Split(Whereclause, 5);
        Termi = LBound(Awhereclause) - 1;
        for (Term of iterateOver(Awhereclause)) {
            Termi++;
            if (LCase(Term) == 'orderby') Awhereclause[Termi] = 'order by';
        }
        Whereclause = Join(Awhereclause, ' ');
    }

    if (Not(System(11)) && Whereclause && (System(1) == 'js' || Left(Fhandle, 4) == 'dos:')) {
        // Can we build a pre-select on ItemID's?
        Preselect = await JSB_ODB_PRESELECTBYITEMID(Whereclause);
        if (CBool(Preselect)) { if (await asyncSelect(Cols, Fhandle, Preselect, _selectList => odbActiveSelectList = _selectList)); else clearSelect(odbActiveSelectList); }
    }

    // Limit to list of previously selected ids?
    if (CBool(System(11))) {
        Limitedids = getList(0);
        if (Len(Limitedids)) {
            Needparens = InStr1(1, Change(Change(LCase(Whereclause), '(', ' '), ')', ' '), ' or ');
            if (CBool(Needparens)) Whereclause = '(' + Whereclause + ')';

            // Put this first so a pre-select can be made on itemid's
            // The funny spacing and mixed case is so I can pull this apart in javaScript and know it was a pre-select
            Limitedids = '(\'' + Join(Limitedids, '\',\'') + '\')';
            if (System(1) == 'js') Limitedids = 'ItEmID iN ' + CStr(Limitedids); else Limitedids = 'ItemID iN ' + CStr(Limitedids);
            Nexttk = LCase(Field(Whereclause, ' ', 1, true));
            if (Nexttk == 'sort' || Nexttk == 'order' || Nexttk == 'by') Andclause = ' '; else Andclause = ' AnD ';
            if (Whereclause) Whereclause = CStr(Limitedids) + CStr(Andclause) + Whereclause; else Whereclause = Limitedids;
        }
    }

    if (Left(Fhandle, 1) == '@') {
        Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_selectto');
        Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, Cols, Rfhandle, Whereclause, ByRef_Sl, Success, function (_ByRef_Sl, _Success) { ByRef_Sl = _ByRef_Sl; Success = _Success });
        return exit(Success);
    }

    if (System(1) == 'aspx') {
        if (await asyncSelect(Cols, Fhandle, Whereclause, _selectList => ByRef_Sl = _selectList)) {
            return exit(1);
        } else {
            return exit(0);
        }
    }

    if (LCase(fieldLeft(CStr(Cols), ' ')) == 'top') {
        Cols = dropLeft(CStr(Cols), ' ');
        Topn = fieldLeft(Cols, ' ');
        Cols = dropLeft(Cols, ' ');
    } else if (LCase(fieldLeft(Cols, ' ')) == 'bottom') {
        Cols = dropLeft(Cols, ' ');
        Bottomn = fieldLeft(Cols, ' ');
        Cols = dropLeft(Cols, ' ');
    } else if (Left(LCase(Cols), 7) == 'bottom ') {
        Bottomn = Field(Cols, ' ', 2, true);
    }

    // Look in Where Clause for Functions, Operators, ItemContent and OrderBy
    await JSB_ODB_PARSESQLCOLUMNS_Sub(Whereclause, false, [undefined,], Wherehasfunctions, Wherehasoperators, Usesitemcontent, Hasorderby, function (_Whereclause, _P2, _P3, _Wherehasfunctions, _Wherehasoperators, _Usesitemcontent, _Hasorderby) { Whereclause = _Whereclause; Wherehasfunctions = _Wherehasfunctions; Wherehasoperators = _Wherehasoperators; Usesitemcontent = _Usesitemcontent; Hasorderby = _Hasorderby });

    // Build list of display Columns and also check for functions, operators, ItemContent
    Displaycolumns = [undefined,];
    await JSB_ODB_PARSESQLCOLUMNS_Sub(Cols, true, Displaycolumns, Columnshasfunctions, Columnshasoperators, Usesitemcontent, Ignoreorderby, function (_Cols, _P2, _Displaycolumns, _Columnshasfunctions, _Columnshasoperators, _Usesitemcontent, _Ignoreorderby) { Cols = _Cols; Displaycolumns = _Displaycolumns; Columnshasfunctions = _Columnshasfunctions; Columnshasoperators = _Columnshasoperators; Usesitemcontent = _Usesitemcontent; Ignoreorderby = _Ignoreorderby });

    if (CBool(Columnshasfunctions) || CBool(Columnshasoperators) || CBool(Wherehasfunctions) || (CBool(Wherehasoperators) && System(1) == 'gae') || (CBool(Hasorderby) && System(1) == 'gae')) {
        if (CBool(Wherehasfunctions) || CBool(Wherehasoperators)) Twhere = ''; else Twhere = Whereclause;
        if ((CBool(Usesitemcontent) && System(1) != 'aspx') || CBool(Wherehasfunctions)) {
            if (InStr1(1, LCase(Cols), 'itemid')) Tcols = '*,ItemID'; else Tcols = '*';
        } else {
            Tcols = Cols;
        }
        if (await asyncSelect(Tcols, Fhandle, Twhere, _selectList => ByRef_Sl = _selectList)); else return exit(0);
    } else {
        if (CBool(Topn)) Topn = 'top ' + CStr(Topn) + ' ';
        if (await asyncSelect(CStr(Topn) + Cols, Fhandle, Whereclause, _selectList => ByRef_Sl = _selectList)) {
            return exit(1);
        } else {
            return exit(0);
        }
    }

    Js = parseJSON(ByRef_Sl);
    Selecteditemids = Js.SelectedItemIDs;
    Selecteditems = Js.SelectedItems;

    if (CBool(Wherehasfunctions) || (CBool(Wherehasoperators) && System(1) != 'aspx') || (CBool(Hasorderby) && System(1) == 'gae')) {
        if (Not(await JSB_ODB_FILTERJSONARRAY(Selecteditemids, Selecteditems, Whereclause, function (_Selecteditemids, _Selecteditems, _Whereclause) { Selecteditemids = _Selecteditemids; Selecteditems = _Selecteditems; Whereclause = _Whereclause }))) return exit(false);
    }

    if (CBool(Columnshasfunctions) || CBool(Columnshasoperators) || (CBool(Usesitemcontent) && System(1) != 'aspx') || CBool(Wherehasfunctions)) {
        if (Not(await JSB_ODB_PROCESSCOLUMNS(Displaycolumns, Selecteditems, Selecteditemids, function (_Displaycolumns, _Selecteditems, _Selecteditemids) { Displaycolumns = _Displaycolumns; Selecteditems = _Selecteditems; Selecteditemids = _Selecteditemids }))) return exit(false);
    }

    if (CBool(Topn)) {
        Newids = [undefined,];
        Newitems = [undefined,];

        Selecteditemids = Split(Selecteditemids, am);
        if (Null0(Topn) > UBound(Selecteditemids)) Topn = UBound(Selecteditemids);
        var _ForEndI_31 = +Topn;
        for (I = 1; I <= _ForEndI_31; I++) {
            Newids[Newids.length] = Selecteditemids[I];
            if (Len(Selecteditems)) Newitems[Newitems.length] = Selecteditems[I];
        }
        Selecteditemids = Join(Newids, am);
        Selecteditems = Newitems;;
    } else if (CBool(Bottomn)) {
        Newids = [undefined,];
        Newitems = [undefined,];

        Selecteditemids = Split(Selecteditemids, am);
        var _ForEndI_34 = UBound(Selecteditemids);
        for (I = +Bottomn + 1; I <= _ForEndI_34; I++) {
            Newids[Newids.length] = Selecteditemids[I];
            if (Len(Selecteditems)) Newitems[Newitems.length] = Selecteditems[I];
        }
        Selecteditemids = Join(Newids, am);
        Selecteditems = Newitems;
    }

    if (CBool(Js.OnlyReturnItemIDs)) Selecteditems = [undefined,]; else Selecteditems = parseJSON(Selecteditems);

    Rs = {};
    Rs.SelectedItemIDs = Selecteditemids;
    Rs.SelectedItems = Selecteditems;
    Rs.OnlyReturnItemIDs = Js.OnlyReturnItemIDs;

    ByRef_Sl = formList(Rs);
    return exit(1);
}
// </SELECTTO>

// <SELECT>
async function JSB_ODB_SELECT(Cols, Fhandle, Whereclause, Toignored) {
    // local variables
    var Preselect, Limitedids, Needparens, Cname, Rfhandle, Success;
    var Topn, Bottomn, Wherehasfunctions, Wherehasoperators, Usesitemcontent;
    var Hasorderby, Displaycolumns, Columnshasfunctions, Columnshasoperators;
    var Ignoreorderby, Twhere, Tcols, Sl, Js, Selecteditemids;
    var Selecteditems, Newids, Newitems, I, Rs;

    if (Not(System(11)) && Whereclause && (System(1) == 'js' || Left(Fhandle, 4) == 'dos:')) {
        // Can we build a pre-select on ItemID's?
        Preselect = await JSB_ODB_PRESELECTBYITEMID(CStr(Whereclause));
        if (CBool(Preselect)) { if (await JSB_ODB_SELECT(CStr(Cols), Fhandle, CStr(Preselect), '')); else return Stop(activeProcess.At_Errors); }
    }

    // Limit to list of previously selected ids?
    if (CBool(System(11))) {
        Limitedids = getList(0);
        if (Len(Limitedids)) {
            Needparens = InStr1(1, Change(Change(LCase(Whereclause), '(', ' '), ')', ' '), ' or ');
            if (CBool(Needparens)) Whereclause = '(' + CStr(Whereclause) + ')';

            // Put this first so a pre-select can be made on itemid's
            // The funny spacing and mixed case is so I can pull this apart in javaScript and know it was a pre-select
            Limitedids = '(\'' + Join(Limitedids, '\',\'') + '\')';
            if (System(1) == 'js') Limitedids = 'ItEmID iN ' + CStr(Limitedids); else Limitedids = 'ItemID iN ' + CStr(Limitedids);
            if (Whereclause) Whereclause = CStr(Limitedids) + ' AnD ' + Whereclause; else Whereclause = Limitedids;
        }
    }

    if (Left(Fhandle, 1) == '@') {
        Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_select');
        Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, Cols, Rfhandle, Whereclause, Success, function (_Success) { Success = _Success });
        return Success;
    }

    if (System(1) == 'aspx') {
        if (await asyncSelect(Cols, Fhandle, Whereclause, _selectList => odbActiveSelectList = _selectList)) {
            return 1;
        } else {
            return 0;
        }
    }

    if (LCase(fieldLeft(CStr(Cols), ' ')) == 'top') {
        Cols = dropLeft(CStr(Cols), ' ');
        Topn = fieldLeft(Cols, ' ');
        Cols = dropLeft(Cols, ' ');
    } else if (LCase(fieldLeft(Cols, ' ')) == 'bottom') {
        Cols = dropLeft(Cols, ' ');
        Bottomn = fieldLeft(Cols, ' ');
        Cols = dropLeft(Cols, ' ');
    } else if (Left(LCase(Cols), 7) == 'bottom ') {
        Bottomn = Field(Cols, ' ', 2, true);
    }

    // Look in Where Clause for Functions, Operators, ItemContent and OrderBy
    await JSB_ODB_PARSESQLCOLUMNS_Sub(Whereclause, false, [undefined,], Wherehasfunctions, Wherehasoperators, Usesitemcontent, Hasorderby, function (_Whereclause, _P2, _P3, _Wherehasfunctions, _Wherehasoperators, _Usesitemcontent, _Hasorderby) { Whereclause = _Whereclause; Wherehasfunctions = _Wherehasfunctions; Wherehasoperators = _Wherehasoperators; Usesitemcontent = _Usesitemcontent; Hasorderby = _Hasorderby });

    // Build list of display Columns and also check for functions, operators, ItemContent
    Displaycolumns = [undefined,];
    await JSB_ODB_PARSESQLCOLUMNS_Sub(Cols, true, Displaycolumns, Columnshasfunctions, Columnshasoperators, Usesitemcontent, Ignoreorderby, function (_Cols, _P2, _Displaycolumns, _Columnshasfunctions, _Columnshasoperators, _Usesitemcontent, _Ignoreorderby) { Cols = _Cols; Displaycolumns = _Displaycolumns; Columnshasfunctions = _Columnshasfunctions; Columnshasoperators = _Columnshasoperators; Usesitemcontent = _Usesitemcontent; Ignoreorderby = _Ignoreorderby });

    if (CBool(Columnshasfunctions) || CBool(Columnshasoperators) || CBool(Wherehasfunctions) || (CBool(Wherehasoperators) && System(1) == 'gae') || (CBool(Hasorderby) && System(1) == 'gae')) {
        if (CBool(Wherehasfunctions) || CBool(Wherehasoperators)) Twhere = ''; else Twhere = Whereclause;
        if ((CBool(Usesitemcontent) && System(1) != 'aspx') || CBool(Wherehasfunctions)) {
            if (InStr1(1, LCase(Cols), 'itemid')) Tcols = '*,ItemID'; else Tcols = '*';
        } else {
            Tcols = Cols;
        }
        if (await asyncSelect(Tcols, Fhandle, Twhere, _selectList => Sl = _selectList)); else return 0;
    } else {
        if (CBool(Topn)) Topn = 'top ' + CStr(Topn) + ' ';
        if (await asyncSelect(CStr(Topn) + Cols, Fhandle, Whereclause, _selectList => odbActiveSelectList = _selectList)) {
            return 1;
        } else {
            return 0;
        }
    }

    Js = parseJSON(Sl);
    Selecteditemids = Js.SelectedItemIDs;
    Selecteditems = Js.SelectedItems;

    if (CBool(Wherehasfunctions) || (CBool(Wherehasoperators) && System(1) != 'aspx') || (CBool(Hasorderby) && System(1) == 'gae')) {
        if (Not(await JSB_ODB_FILTERJSONARRAY(Selecteditemids, Selecteditems, Whereclause, function (_Selecteditemids, _Selecteditems, _Whereclause) { Selecteditemids = _Selecteditemids; Selecteditems = _Selecteditems; Whereclause = _Whereclause }))) return false;
    }

    if (CBool(Columnshasfunctions) || CBool(Columnshasoperators) || (CBool(Usesitemcontent) && System(1) != 'aspx') || CBool(Wherehasfunctions)) {
        if (Not(await JSB_ODB_PROCESSCOLUMNS(Displaycolumns, Selecteditems, Selecteditemids, function (_Displaycolumns, _Selecteditems, _Selecteditemids) { Displaycolumns = _Displaycolumns; Selecteditems = _Selecteditems; Selecteditemids = _Selecteditemids }))) return false;
    }

    if (CBool(Topn)) {
        Newids = [undefined,];
        Newitems = [undefined,];

        Selecteditemids = Split(Selecteditemids, am);
        if (Null0(Topn) > UBound(Selecteditemids)) Topn = UBound(Selecteditemids);
        var _ForEndI_64 = +Topn;
        for (I = 1; I <= _ForEndI_64; I++) {
            Newids[Newids.length] = Selecteditemids[I];
            if (Len(Selecteditems)) Newitems[Newitems.length] = Selecteditems[I];
        }
        Selecteditemids = Join(Newids, am);
        Selecteditems = Newitems;;
    } else if (CBool(Bottomn)) {
        Newids = [undefined,];
        Newitems = [undefined,];

        Selecteditemids = Split(Selecteditemids, am);
        var _ForEndI_67 = UBound(Selecteditemids);
        for (I = +Bottomn + 1; I <= _ForEndI_67; I++) {
            Newids[Newids.length] = Selecteditemids[I];
            if (Len(Selecteditems)) Newitems[Newitems.length] = Selecteditems[I];
        }
        Selecteditemids = Join(Newids, am);
        Selecteditems = Newitems;
    }

    if (CBool(Js.OnlyReturnItemIDs)) Selecteditems = [undefined,]; else Selecteditems = parseJSON(Selecteditems);

    Rs = { "SelectedItemIDs": Selecteditemids };
    Rs.SelectedItems = Selecteditems;
    Rs.OnlyReturnItemIDs = Js.OnlyReturnItemIDs;

    odbActiveSelectList = formList(Rs);
    return 1;
}
// </SELECT>

// <FILTERJSONARRAY>
async function JSB_ODB_FILTERJSONARRAY(ByRef_Selecteditemids, ByRef_Selecteditems, ByRef_Where, setByRefValues) {
    // local variables
    var Sortcolumns, Sorting, Likestart, I, Isvalidsqlfunction;
    var Rtoken, Id, Ftmp, C, Cid, Translate, Tag, R;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Selecteditemids, ByRef_Selecteditems, ByRef_Where)
        return v
    }
    // AND - OR, &&, ||
    // A Matches B
    // =, #, NE, >=, <=, >, <, EQ, GE, LE, LT, GT
    // Concat : &
    // + -
    // ^
    // uniary + -

    var Tokens = Split(ByRef_Where, ' ', 5);
    Tokens[Tokens.length] = Chr(255);
    if (typeOf(ByRef_Selecteditemids) == 'String') ByRef_Selecteditemids = Split(ByRef_Selecteditemids, am);

    Sortcolumns = [undefined,];
    var Results = [undefined,];
    Sorting = false;
    var Gotone = false;
    var Hascompare = false;
    var Needc = false;
    var Clausestart = 1;
    Likestart = 1;

    var _ForEndI_71 = UBound(Tokens);
    for (I = 1; I <= _ForEndI_71; I++) {
        var Otoken = Tokens[I];
        var Token = LCase(Otoken);

        if (CBool((Sorting))) {
            if ((Token == ',')) { Gotone = false;; } else if ((CBool(Gotone) && Token == 'asc')) { Sortcolumns[Len(Sortcolumns)] = '\>' + CStr(Sortcolumns[Len(Sortcolumns)]);; } else if ((CBool(Gotone) && Token == 'desc')) { Sortcolumns[Len(Sortcolumns)] = '\<' + CStr(Sortcolumns[Len(Sortcolumns)]);; } else if ((CBool(Gotone) && Token == 'numeric')) { Sortcolumns[Len(Sortcolumns)] = '#' + CStr(Sortcolumns[Len(Sortcolumns)]);; } else if ((CBool(Gotone) && Token == 'right')) { Sortcolumns[Len(Sortcolumns)] = '!' + CStr(Sortcolumns[Len(Sortcolumns)]);; } else if (Right(Token, 1) == '(') {
                activeProcess.At_Errors = 'invalid sort column ' + CStr(Token);
                return exit(false);;
            } else if (isAlpha(Left(Token, 1))) {
                Gotone = true;
                Sortcolumns[Sortcolumns.length] = Otoken;;
            } else if ((Left(Token, 1) == '[' && Right(Token, 1) == ']')) {
                Otoken = Mid1(Otoken, 1, Len(Otoken) - 2);
                Gotone = true;
                Sortcolumns[Sortcolumns.length] = Otoken;;
            } else if (Left(Token, 2) == '*a') {
                Gotone = true;
                Sortcolumns[Sortcolumns.length] = Otoken;;
            } else if (Token == Chr(255)) {
                // done;
            } else {
                activeProcess.At_Errors = 'invalid sort syntax \'' + CStr(Token) + '"';
                return exit(false);
            }
        } else {

            var Ntoken = LCase(Tokens[+I + 1]);
            Isvalidsqlfunction = await JSB_ODB_VALIDSQLFUNCTION(Token, Rtoken, function (_Token, _Rtoken) { Token = _Token; Rtoken = _Rtoken });

            switch ((true)) {
                case Token == Chr(255):
                    if (CBool(Hascompare)) { Results.Insert(Clausestart, 'LCase('); Results[Results.length] = ')'; }
                    if (CBool(Needc)) Results[Results.length] = ')';

                    break;

                case Token == 'order' && Ntoken == 'by':
                    if (CBool(Hascompare)) { Results.Insert(Clausestart, 'LCase('); Results[Results.length] = ')'; }
                    if (CBool(Needc)) Results[Results.length] = ')';

                    Sorting = true;
                    I++;

                    break;

                case Token == 'gt':
                    Results[Results.length] = ') \> LCase('; Hascompare = true;
                    break;

                case Token == 'lt':
                    Results[Results.length] = ') \< LCase('; Hascompare = true;
                    break;

                case Token == 'ge':
                    Results[Results.length] = ') \>= LCase('; Hascompare = true;
                    break;

                case Token == 'le':
                    Results[Results.length] = ') \<= LCase('; Hascompare = true;
                    break;

                case Token == 'eq':
                    Results[Results.length] = ') = LCase('; Hascompare = true;
                    break;

                case Token == 'ne':
                    Results[Results.length] = ') \<\> LCase('; Hascompare = true;
                    break;

                case Token == '=':
                    Results[Results.length] = ') = LCase('; Hascompare = true;
                    break;

                case Token == '\>':
                    Results[Results.length] = ') \> LCase('; Hascompare = true;
                    break;

                case Token == '\<':
                    Results[Results.length] = ') \< LCase('; Hascompare = true;
                    break;

                case Token == '\>=':
                    Results[Results.length] = ') \>= LCase('; Hascompare = true;
                    break;

                case Token == '\<=':
                    Results[Results.length] = ') \<= LCase('; Hascompare = true;
                    break;

                case Token == '=\>':
                    Results[Results.length] = ') \>= LCase('; Hascompare = true;
                    break;

                case Token == '=\<':
                    Results[Results.length] = ') \<= LCase('; Hascompare = true;
                    break;

                case Token == '\<\>':
                    Results[Results.length] = ') \<\> LCase('; Hascompare = true;
                    break;

                case Token == '!=':
                    Results[Results.length] = ') \<\> LCase('; Hascompare = true;

                    break;

                case Token == 'like':
                    Results.Insert(Clausestart, '@jsb_odb.sqlLikeCompare('); Results[Results.length] = ',';
                    Needc = true;

                    break;

                case Token == ':':
                    Results[Results.length] = ':\'\':';
                    break;

                case Token == '&':
                    Results[Results.length] = ':\'\':';

                    break;

                case Token == 'itemid' || Token == '*a0':
                    Results[Results.length] = 'ItemID';

                    break;

                case Left(Token, 2) == '*a' && isNumber(Mid1(Token, 3)):
                    Results[Results.length] = '@jsb_odb.SqlExtract(row, ' + Mid1(Token, 3) + ')';

                    break;

                case Token == Chr(9):
                    Results[Results.length] = ' ';
                    break;

                case isNumber(Token):
                    Results[Results.length] = Token;

                    break;

                case Token == 'and' || Token == '&&':
                    if (CBool(Hascompare)) { Results.Insert(Clausestart, 'LCase('); Results[Results.length] = ')'; Hascompare = false; }
                    if (CBool(Needc)) Results[Results.length] = ')';
                    Results[Results.length] = ' and ';
                    Likestart = UBound(Results) + 1;

                    break;

                case Token == 'or' || Token == '||':
                    if (CBool(Hascompare)) { Results.Insert(Clausestart, 'LCase('); Results[Results.length] = ')'; Hascompare = false; }
                    if (CBool(Needc)) Results[Results.length] = ')';
                    Results[Results.length] = ' or ';
                    Clausestart = UBound(Results) + 1;

                    break;

                case Isvalidsqlfunction:
                    if (Rtoken == 'IsNull(') Rtoken = 'IsNull2(';
                    Results[Results.length] = Rtoken;
                    Clausestart = UBound(Results);

                    break;

                case isAlpha(Left(Token, 1)):
                    // get data from dataset row
                    // results[-1] = "LCase(":"row.":token:")"

                    Results[Results.length] = 'row[translate[\'' + CStr(Token) + '\']]';

                    break;

                case Left(Token, 1) == '[' && Right(Token, 1) == ']':
                    // get data from dataset row
                    Results[Results.length] = 'row[translate[\'' + Mid1(Token, 2, Len(Otoken) - 2) + '\']]';

                    break;

                case InStr1(1, '\'",+-/^%()', Left(Token, 1)) > 0:
                    Results[Results.length] = Token;

                    break;

                case InStr1(1, ' ' + Chr(9), Left(Token, 1)) > 0:
                    // white space
                    Results[Results.length] = ' ';
                    break;

            }
        }
    }

    // create dynamic function
    if (UBound(Results) && Len(ByRef_Selecteditemids)) {
        var Sfilter = Join(Results, ' ');
        var F = '';
        Id = 'eval_' + Change(Change(userno(), ':', '_'), '-', '_');

        F = 'sub ' + CStr(Id) + '(translate, SelectedItemIDs, SelectedItems)';
        F = Replace(F, -1, 0, 0, '   var Items = []; ');
        F = Replace(F, -1, 0, 0, '   var ItemIDs = []; ');
        F = Replace(F, -1, 0, 0, '   for each ItemID, i in SelectedItemIDs');
        F = Replace(F, -1, 0, 0, '      if ItemID \<\> "__json_indexes__" then');
        F = Replace(F, -1, 0, 0, '         var row = SelectedItems[i]; ');
        F = Replace(F, -1, 0, 0, '         if !row Then Row = {}');
        F = Replace(F, -1, 0, 0, '         if ' + CStr(Sfilter) + ' { Items[-1] = SelectedItems[i]; ItemIDs[-1] = ItemID } ');
        F = Replace(F, -1, 0, 0, '      End If');
        F = Replace(F, -1, 0, 0, '   next');
        F = Replace(F, -1, 0, 0, '   SelectedItemIDs = ItemIDs');
        F = Replace(F, -1, 0, 0, '   SelectedItems = Items');
        F = Replace(F, -1, 0, 0, 'end sub');

        Ftmp = await JSB_BF_FHANDLE('tmp');
        if (await JSB_ODB_WRITE(CStr(F), Ftmp, CStr(Id))); else return Stop(activeProcess.At_Errors);
        await asyncTclExecute('basic tmp ' + CStr(Id), _capturedData => C = _capturedData)

        if (!InStr1(1, LCase(C), 'successful')) {
            activeProcess.At_Errors = C;
            return exit(false);
        }

        Cid = ('tmp|' + CStr(Id));

        Translate = {};

        for (Tag of iterateOver(ByRef_Selecteditems[0])) {
            Translate[LCase(Tag)] = Tag;
        }

        await asyncCallByName(Cid, me, 0 /*ignore if missing */, Translate, ByRef_Selecteditemids, ByRef_Selecteditems);

        if (await JSB_ODB_DELETEITEM(Ftmp, CStr(Id))); else return Stop(activeProcess.At_Errors);

        if (System(1) == 'js') {
            if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('dict', 'tmp'), CStr(Id) + '_SUB1.js')); else return Stop(activeProcess.At_Errors);
        } else {
            if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('dict', 'tmp'), CStr(Id) + '_1.pcs')); else return Stop(activeProcess.At_Errors);
        }
    }

    if ((CBool(Sorting) && System(1) == 'gae')) {
        // combine everything into a single JSON record for sort
        var _ForEndI_102 = Len(ByRef_Selecteditems);
        for (I = 1; I <= _ForEndI_102; I++) {
            if (CBool(ByRef_Selecteditems[I])) R = ByRef_Selecteditems[I]; else { R = {} }
            R._itemId_ = ByRef_Selecteditemids[I];
            ByRef_Selecteditems[I] = R;
        }

        ByRef_Selecteditems = Sort(ByRef_Selecteditems, Sortcolumns);

        // explode JSON rec back into sepeate recs for item ids
        var _ForEndI_104 = Len(ByRef_Selecteditems);
        for (I = 1; I <= _ForEndI_104; I++) {
            ByRef_Selecteditemids[I] = ByRef_Selecteditems[I]._itemId_;
            R = ByRef_Selecteditems[I];
            delete R['_itemId_']
        }
    }

    ByRef_Selecteditemids = Join(ByRef_Selecteditemids, am);
    return exit(true);
}
// </FILTERJSONARRAY>

// <SQLLIKECOMPARE>
async function JSB_ODB_SQLLIKECOMPARE(ByRef_X, ByRef_L, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_X, ByRef_L)
        return v
    }
    var Fchar = Left(ByRef_L, 1);
    var E = '%';
    ByRef_X = LCase(ByRef_X);
    ByRef_L = LCase(ByRef_L);

    if ((Fchar == '%' || Fchar == '[')) {
        var Lenl = Len(ByRef_L);
        if (Right(ByRef_L, 1) == ']' || Right(ByRef_L, 1) == '%') return exit(InStr1(1, ByRef_X, Mid1(ByRef_L, 2, +Lenl - 2)) > 0);
        return exit(Right(ByRef_X, +Lenl - 1) == Mid1(ByRef_L, 2));
    }

    var Echar = Right(ByRef_L, 1);
    if ((Echar == '%' || Echar == ']')) {
        Lenl = Len(ByRef_L);
        return exit(Left(ByRef_X, +Lenl - 1) == Left(ByRef_L, +Lenl - 1));
    }

    return exit(LCase(ByRef_X) == LCase(ByRef_L));
}
// </SQLLIKECOMPARE>

// <SQLEXTRACT>
async function JSB_ODB_SQLEXTRACT(ByRef_Row, ByRef_Atrno, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row, ByRef_Atrno)
        return v
    }
    if (Not(ByRef_Row)) return exit('');
    if (HasTag(ByRef_Row, 'ItemContent')) return exit(Extract(ByRef_Row.ItemContent, ByRef_Atrno, 0, 0)); else {
        return exit(ByRef_Row[ByRef_Atrno]); // row[Extract(row, atrNo)];
    }
    return exit();
}
// </SQLEXTRACT>

// <PARSESQLCOLUMNS_Sub>
async function JSB_ODB_PARSESQLCOLUMNS_Sub(ByRef_S, ByRef_Addrowobj, ByRef_Columns, ByRef_Hasfunctions, ByRef_Hasoperators, ByRef_Usesitemcontent, ByRef_Hasorderby, setByRefValues) {
    // local variables
    var Lp, Afterconjection, A, Token, Sqlformat, Term, I, T, Lt;
    var Rt, Sqlfunc, Tablename;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_S, ByRef_Addrowobj, ByRef_Columns, ByRef_Hasfunctions, ByRef_Hasoperators, ByRef_Usesitemcontent, ByRef_Hasorderby)
        return v
    }
    ByRef_Columns = [undefined,];
    Lp = 0;
    Afterconjection = false;
    ByRef_Hasorderby = false;

    // Which format?
    // LIST TABLENAME C1 C2 With C3 = C4 BY C5

    // or
    // SELECT C1, C2 FROM TABLENAME WHERE C3 = C4 ORDER BY C5

    A = Split(ByRef_S, '', 5);
    for (Token of iterateOver(A)) {
        if (Token == 'from') Sqlformat = true;
    }

    Term = '';
    I = LBound(A) - 1;
    for (Token of iterateOver(A)) {
        I++;
        T = LCase(Token);
        Lt = Left(T, 1);
        Rt = Right(T, 1);

        switch ((true)) {
            case T == 'gt':
                T = '\>';
                break;

            case T == 'lt':
                T = '\<';
                break;

            case T == 'ge':
                T = '\>=';
                break;

            case T == 'le':
                T = '\<=';
                break;

            case T == 'eq':
                T = '==';
                break;

            case T == 'ne':
                T = '\<\>';
                break;

            case T == '!=':
                T = '\<\>';
                break;

            case T == ',':
                if (Not(Lp)) Token = '';

                break;

            case T == 'like':
                if (System(1) == 'gae') {
                    Token = 'sqlLikeCompare(' + CStr(Term) + ', ';
                    Term = '';
                    ByRef_Hasfunctions = true;
                }

                break;

            case T == 'in':
                if (System(1) == 'gae') {
                    Token = 'sqlInOperator(' + CStr(Term) + ', ';
                    Term = '';
                    ByRef_Hasfunctions = true;
                }

                break;

            case T == 'list' || T == 'sort' || T == 'order' || T == 'by' || T == 'with' || T == 'where' || T == 'or' || T == 'and' || T == 'top' || T == 'bottom':
                break;

            case T == 'itemid' || T == '*a0':
                Token = 'ItemID';

                break;

            case Rt == '(':
                break;

            case T == 'as' && Null0(Lp) == '0':
                I++;
                if (CBool(Term)) {
                    Term += ' as ' + CStr(A[I]);
                } else {
                    ByRef_Columns[UBound1(ByRef_Columns)] = ByRef_Columns[UBound(ByRef_Columns)] + ' as ' + CStr(A[I]);
                }

                Token = '';

                break;

            case Left(T, 2) == '*a' && isNumber(Mid1(T, 3)):
                if (CBool(ByRef_Addrowobj)) Token = '@jsb_odb.SqlExtract(row, ' + Mid1(T, 3) + ')';
                ByRef_Usesitemcontent = true;

                break;

            case isAlpha(Left(T, 1)):
                // get data from dataset row
                if (CBool(ByRef_Addrowobj)) Token = 'row.' + CStr(Token);
                ByRef_Usesitemcontent = true;

                break;

            case Lt == '[' && Rt == ']':
                // get data from dataset row
                if (CBool(ByRef_Addrowobj)) Token = 'row[\'' + Mid1(Token, 2, Len(Token) - 2) + '\']';
                ByRef_Usesitemcontent = true;
                break;

        }

        T = LCase(Token);
        Lt = Left(T, 1);

        if (isEmpty(T)); else if (T == '(') {
            Lp++;
            Term += CStr(T);
            ByRef_Hasoperators = true;;
        } else if (Rt == '(') {
            Lp++;
            if (CBool(Term)) ByRef_Columns[ByRef_Columns.length] = Term;
            if (await JSB_ODB_VALIDSQLFUNCTION(T, Sqlfunc, function (_T, _Sqlfunc) { T = _T; Sqlfunc = _Sqlfunc })) Term = Sqlfunc; else Term = 'Invalid_function_' + CStr(T);
            ByRef_Hasfunctions = true;;
        } else if (T == ')') {
            Lp--;
            Term += CStr(T);
            if (Null0(Lp) == '0') {
                ByRef_Columns[ByRef_Columns.length] = Term;
                Term = '';
            }
        } else if (T == 'and' || T == 'or' || T == 'like' || InStr1(1, '=\<\>/:&|!', Lt)) {
            if (!Len(ByRef_Columns) && Not(Term)) ByRef_Columns[ByRef_Columns.length] = 'Invalid Syntax';
            Term += ' ' + CStr(T);
            Afterconjection = true;
            ByRef_Hasoperators = true;;
        } else if (InStr1(1, '+-', Lt)) {
            Term += CStr(T);
            Afterconjection = true;
            ByRef_Hasoperators = true;;
        } else if (CBool(Afterconjection)) {
            Term += CStr(T);
            Afterconjection = false;;
        } else if (Null0(I) == 1 && (T == 'top' || T == 'bottom')) {
            I++;;
        } else if (Null0(I) == 1 && (T == 'sort' || T == 'list')) {
            Afterconjection = false;

            if (Not(Sqlformat)) {
                I++;
                Tablename = A[I];

                if (LCase(Tablename) == 'dict') {
                    I++;
                    Tablename += ' ' + CStr(A[I]);;
                } else if (LCase(Tablename) == 'data') {
                    I++;
                    Tablename = A[I];
                }
            }
        } else if (Null0(Lp) == '0' && (T == 'sort' || T == 'order' || T == 'by' || T == 'orderby')) {
            ByRef_Hasorderby = true;;
        } else if (Null0(Lp) == '0') {
            if (CBool(Term)) ByRef_Columns[ByRef_Columns.length] = Term;
            Afterconjection = false;
            if (T == ',') Term = ''; else Term = Token;
        } else {
            if (CBool(Term)) Term += ' ';
            Term += CStr(Token);
        }
    }

    if (CBool(Term)) ByRef_Columns[ByRef_Columns.length] = Term;
    if (Null0(Lp) != '0') ByRef_Columns[ByRef_Columns.length] = 'unbalanced parentheses';
    return exit();
}
// </PARSESQLCOLUMNS_Sub>

// <PROCESSCOLUMNS>
async function JSB_ODB_PROCESSCOLUMNS(ByRef_Columns, ByRef_Items, ByRef_Itemids, setByRefValues) {
    // local variables
    var Id, I1, F, Columnclause, Columni, Ftmp, C, Cid;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Columns, ByRef_Items, ByRef_Itemids)
        return v
    }
    // create dynamic function
    if (UBound(ByRef_Columns) && UBound(ByRef_Items)) {
        Id = 'eval_' + Change(Change(userno(), ':', '_'), '-', '_');

        I1 = ByRef_Items[1];

        F = 'sub ' + CStr(Id) + '(Items, ItemIDs)';
        F = Replace(F, -1, 0, 0, '   var Results = []; ');
        F = Replace(F, -1, 0, 0, '   for each row, rowi in Items');
        F = Replace(F, -1, 0, 0, '      ItemID = ItemIDs[rowi]');
        F = Replace(F, -1, 0, 0, '      r = {} ');

        Columni = LBound(ByRef_Columns) - 1;
        for (Columnclause of iterateOver(ByRef_Columns)) {
            Columni++;
            if (Left(Columnclause, 4) == 'row.') {
                if (InStr1(1, Columnclause, ' as ')) Columnclause = 'row.' + dropLeft(CStr(Columnclause), ' as ');
                F = Replace(F, -1, 0, 0, '      r[`' + Field(Columnclause, '.', 2, true) + '`] =  ' + CStr(Columnclause));;
            } else if (LCase(Columnclause) == 'itemid') {
                F = Replace(F, -1, 0, 0, '      r.' + CStr(Columnclause) + ' =  ' + CStr(Columnclause));;
            } else if (Columnclause == ','); else if (InStr1(1, Columnclause, ' as ')) {
                F = Replace(F, -1, 0, 0, '      r[`' + dropLeft(CStr(Columnclause), ' as ') + '`] = ' + dropRight(CStr(Columnclause), ' as '));;
            } else {
                F = Replace(F, -1, 0, 0, '      r[`expr_' + CStr(Columni) + '`] =  ' + CStr(Columnclause));
            }
        }

        F = Replace(F, -1, 0, 0, '      Results[-1] = r ');
        F = Replace(F, -1, 0, 0, '   next');
        F = Replace(F, -1, 0, 0, '   Items = Results');
        F = Replace(F, -1, 0, 0, 'end sub');

        Ftmp = await JSB_BF_FHANDLE('tmp');
        if (await JSB_ODB_WRITE(CStr(F), Ftmp, CStr(Id))); else return Stop(activeProcess.At_Errors);
        await asyncTclExecute('basic tmp ' + CStr(Id), _capturedData => C = _capturedData)

        if (!InStr1(1, LCase(C), 'successful')) {
            activeProcess.At_Errors = C;
            return exit(false);
        }

        Cid = ('tmp|' + CStr(Id));

        await asyncCallByName(Cid, me, 0 /*ignore if missing */, ByRef_Items, Split(ByRef_Itemids, Chr(254)));

        if (await JSB_ODB_DELETEITEM(Ftmp, CStr(Id))); else return Stop(activeProcess.At_Errors);

        if (System(1) == 'js') {
            if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('dict', 'tmp'), CStr(Id) + '_SUB1.js')); else return Stop(activeProcess.At_Errors);
        } else {
            if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('dict', 'tmp'), CStr(Id) + '_1.pcs')); else return Stop(activeProcess.At_Errors);
        }
    }
    return exit(true);
}
// </PROCESSCOLUMNS>

// <VALIDSQLFUNCTION>
async function JSB_ODB_VALIDSQLFUNCTION(ByRef_Token, ByRef_Rtoken, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Token, ByRef_Rtoken)
        return v
    }
    switch ((true)) {
        case ByRef_Token == 'abs(':
            ByRef_Rtoken = 'Abs(';
            break;

        case ByRef_Token == 'guid(':
            ByRef_Rtoken = 'GUID(';
            break;

        case ByRef_Token == 'seq(':
            ByRef_Rtoken = 'Seq(';
            break;

        case ByRef_Token == 'asc(':
            ByRef_Rtoken = 'Seq(';
            break;

        case ByRef_Token == 'isint(':
            ByRef_Rtoken = 'IsInt(';
            break;

        case ByRef_Token == 'isnull(':
            ByRef_Rtoken = 'IsNull(';
            break;

        case ByRef_Token == 'isnothing(':
            ByRef_Rtoken = 'IsNothing(';
            break;

        case ByRef_Token == 'chr(':
            ByRef_Rtoken = 'Chr(';
            break;

        case ByRef_Token == 'char(':
            ByRef_Rtoken = 'Chr(';
            break;

        case ByRef_Token == 'mid(':
            ByRef_Rtoken = 'Mid(';
            break;

        case ByRef_Token == 'left(':
            ByRef_Rtoken = 'Left(';
            break;

        case ByRef_Token == 'right(':
            ByRef_Rtoken = 'Right(';
            break;

        case ByRef_Token == 'count(':
            ByRef_Rtoken = 'Count(';
            break;

        case ByRef_Token == 'cint(':
            ByRef_Rtoken = 'CInt(';
            break;

        case ByRef_Token == 'clng(':
            ByRef_Rtoken = 'CInt(';
            break;

        case ByRef_Token == 'cdbl(':
            ByRef_Rtoken = 'CNum(';
            break;

        case ByRef_Token == 'csng(':
            ByRef_Rtoken = 'CNum(';
            break;

        case ByRef_Token == 'val(':
            ByRef_Rtoken = 'CNum(';
            break;

        case ByRef_Token == 'cdec(':
            ByRef_Rtoken = 'CNum(';
            break;

        case ByRef_Token == 'delete(':
            ByRef_Rtoken = 'Delete(';
            break;

        case ByRef_Token == 'dcount(':
            ByRef_Rtoken = 'DCount(';
            break;

        case ByRef_Token == 'extract(':
            ByRef_Rtoken = 'Extract(';
            break;

        case ByRef_Token == 'hex(':
            ByRef_Rtoken = 'DTX(';
            break;

        case ByRef_Token == 'exp(':
            ByRef_Rtoken = 'Exp(';
            break;

        case ByRef_Token == 'field(':
            ByRef_Rtoken = 'Field(';
            break;

        case ByRef_Token == 'iconv(':
            ByRef_Rtoken = 'IConv(';
            break;

        case ByRef_Token == 'oconv(':
            ByRef_Rtoken = 'OConv(';
            break;

        case ByRef_Token == 'index(':
            ByRef_Rtoken = 'Index(';
            break;

        case ByRef_Token == 'instr(':
            ByRef_Rtoken = 'InStr(';
            break;

        case ByRef_Token == 'len(':
            ByRef_Rtoken = 'Len(';
            break;

        case ByRef_Token == 'ln(':
            ByRef_Rtoken = 'Log(';
            break;

        case ByRef_Token == 'mcl(':
            ByRef_Rtoken = 'LCase(';
            break;

        case ByRef_Token == 'lcase(':
            ByRef_Rtoken = 'LCase(';
            break;

        case ByRef_Token == 'mcu(':
            ByRef_Rtoken = 'UCase(';
            break;

        case ByRef_Token == 'ucase(':
            ByRef_Rtoken = 'UCase(';
            break;

        case ByRef_Token == 'lower(':
            ByRef_Rtoken = 'Lower(';
            break;

        case ByRef_Token == 'raise(':
            ByRef_Rtoken = 'raise(';
            break;

        case ByRef_Token == 'mod(':
            ByRef_Rtoken = 'Mod(';
            break;

        case ByRef_Token == 'not(':
            ByRef_Rtoken = 'Not(';
            break;

        case ByRef_Token == 'pwr(':
            ByRef_Rtoken = 'Pwr(';
            break;

        case ByRef_Token == 'rem(':
            ByRef_Rtoken = 'Mod(';
            break;

        case ByRef_Token == 'rnd(':
            ByRef_Rtoken = 'Rnd(';
            break;

        case ByRef_Token == 'space(':
            ByRef_Rtoken = 'Space(';
            break;

        case ByRef_Token == 'sqrt(':
            ByRef_Rtoken = 'Qqrt(';
            break;

        case ByRef_Token == 'str(':
            ByRef_Rtoken = 'StrRpt(';
            break;

        case ByRef_Token == 'strrpt(':
            ByRef_Rtoken = 'StrRpt(';
            break;

        case ByRef_Token == 'dateserial(':
            ByRef_Rtoken = 'Date(';
            break;

        case ByRef_Token == 'timedate(':
            ByRef_Rtoken = 'TimeDate(';
            break;

        case ByRef_Token == 'datetime(':
            ByRef_Rtoken = 'DateTime(';
            break;

        case ByRef_Token == 'trim(':
            ByRef_Rtoken = 'Trim(';
            break;

        case ByRef_Token == 'ltrim(':
            ByRef_Rtoken = 'LTrim(';
            break;

        case ByRef_Token == 'trimf(':
            ByRef_Rtoken = 'LTrim(';
            break;

        case ByRef_Token == 'rtrim(':
            ByRef_Rtoken = 'RTrim(';
            break;

        case ByRef_Token == 'trimb(':
            ByRef_Rtoken = 'RTrim(';
            break;

        case ByRef_Token == 'xtd(':
            ByRef_Rtoken = 'XTD(';
            break;

        case ByRef_Token == 'convert(':
            ByRef_Rtoken = 'Convert(';
            break;

        case ByRef_Token == 'replace(':
            ByRef_Rtoken = 'Replace(';
            break;

        case ByRef_Token == 'change(':
            ByRef_Rtoken = 'Change(';
            break;

        case ByRef_Token == 'changei(':
            ByRef_Rtoken = 'ChangeI(';
            break;

        case ByRef_Token == 'xts(':
            ByRef_Rtoken = 'XTS(';
            break;

        case ByRef_Token == 'stx(':
            ByRef_Rtoken = 'STX(';
            break;

        case ByRef_Token == 'encode(':
            ByRef_Rtoken = 'Encrypt(';
            break;

        case ByRef_Token == 'encrypt(':
            ByRef_Rtoken = 'Encrypt(';
            break;

        case ByRef_Token == 'decode(':
            ByRef_Rtoken = 'Decrypt(';
            break;

        case ByRef_Token == 'decrypt(':
            ByRef_Rtoken = 'Decrypt(';
            break;

        case ByRef_Token == 'date(':
            ByRef_Rtoken = 'Date(';
            break;

        case ByRef_Token == 'time(':
            ByRef_Rtoken = 'Time(';
            break;

        case ByRef_Token == 'timer(':
            ByRef_Rtoken = 'Timer(';
            break;

        case ByRef_Token == 'now(':
            ByRef_Rtoken = 'Now(';
            break;

        case ByRef_Token == 'dow(':
            ByRef_Rtoken = 'DayOfWeek(';
            break;

        case ByRef_Token == 'dayofweek(':
            ByRef_Rtoken = 'DayOfWeek(';
            break;

        case ByRef_Token == 'year(':
            ByRef_Rtoken = 'Year(';
            break;

        case ByRef_Token == 'month(':
            ByRef_Rtoken = 'Month(';
            break;

        case ByRef_Token == 'day(':
            ByRef_Rtoken = 'Day(';
            break;

        case ByRef_Token == 'dmy(':
            ByRef_Rtoken = 'DMY(';
            break;

        case ByRef_Token == 'cstr(':
            ByRef_Rtoken = 'CStr(';
            break;

        case ByRef_Token == 'system(':
            ByRef_Rtoken = 'System(';
            break;

        case ByRef_Token == 'json(':
            ByRef_Rtoken = 'JSON(';
            break;

        case ByRef_Token == 'xml(':
            ByRef_Rtoken = 'XML(';
            break;

        case ByRef_Token == 'htmlencode(':
            ByRef_Rtoken = 'htmlEscape(';
            break;

        case ByRef_Token == 'htmlescape(':
            ByRef_Rtoken = 'htmlEscape(';
            break;

        case ByRef_Token == 'htmldecode(':
            ByRef_Rtoken = 'htmlUnescape(';
            break;

        case ByRef_Token == 'htmlunescape(':
            ByRef_Rtoken = 'htmlUnescape(';
            break;

        case ByRef_Token == 'urlencode(':
            ByRef_Rtoken = 'urlEncode(';
            break;

        case ByRef_Token == 'urlescape(':
            ByRef_Rtoken = 'urlEncode(';
            break;

        case ByRef_Token == 'urldecode(':
            ByRef_Rtoken = 'UrlDecode(';
            break;

        case ByRef_Token == 'urlunescape(':
            ByRef_Rtoken = 'UrlDecode(';
            break;

        case ByRef_Token == 'fmt(':
            ByRef_Rtoken = 'Fmt(';
            break;

        case ByRef_Token == 'typeof(':
            ByRef_Rtoken = 'typeOf(';
            break;

        case ByRef_Token == 'lbound(':
            ByRef_Rtoken = 'LBound(';
            break;

        case ByRef_Token == 'ubound(':
            ByRef_Rtoken = 'UBound(';
            break;

        case ByRef_Token == 'hastag(':
            ByRef_Rtoken = 'HasTag(';
            break;

        case ByRef_Token == 'regx(':
            ByRef_Rtoken = 'regExp(';
            break;

        case ByRef_Token == 'regex(':
            ByRef_Rtoken = 'regExp(';
            break;

        case ByRef_Token == 'regexp(':
            ByRef_Rtoken = 'regExp(';
            break;

        default:
            return exit(false);
            break;

    }
    return exit(true);
}
// </VALIDSQLFUNCTION>

// <PRESELECTBYITEMID>
async function JSB_ODB_PRESELECTBYITEMID(Whereclause) {
    // local variables
    var I;

    // Can we build a pre-select of only ItemID's?
    var Awhereclause = Split(Whereclause, 5);
    Whereclause = Join(Awhereclause, ' ');

    var Stophere = 0;
    var Preselect = [undefined,];

    var Term = '';
    var Termi = undefined;
    var Truncated = undefined;

    Termi = LBound(Awhereclause) - 1;
    for (Term of iterateOver(Awhereclause)) {
        Termi++;
        var Colname = '';
        var Lcterm = LCase(Term);

        var Fc = Left(Lcterm, 1); // first char
        var Sc = Mid1(Lcterm, 2, 1); // 2nd chr
        var M3 = Mid1(Lcterm, 3); // 3rd char forward
        var Lc = Right(Lcterm, 1); // last char

        if (Fc == '*' && Sc == 'a' && isNumeric(M3)) {
            // Annn
            Colname = Lcterm;;
        } else if (Lcterm == 'and' || Lcterm == 'or'); else if (Lcterm == 'like'); else if (isAlpha(Fc) && InStr1(1, Fc, '(') == 0) {
            // Indetifier
            Colname = Lcterm;;
        } else if (Fc == '[' && Lc == ']') {
            // [ColName]
            Colname = Mid1(Lcterm, 1, Len(Lcterm) - 2);;
        } else if (Fc == '[' || Lc == ']' || Fc == '%' || Lc == '%') {
            // like term ;
        } else if (Fc == '"' || Fc == '\'') {
            // "String" or "ColName"  (Column Name if next token is an relational operator)

            var Nc = LCase(Awhereclause[Termi + 1]);
            if (InStr1(1, ' \<\>=!', Left(Nc, 1)) > 1 || Nc == 'like') Colname = Mid1(Lcterm, 2, Len(Lcterm) - 2);
        }

        if (Colname) {
            if (Colname != 'itemid' && Colname != '*a0') {
                Truncated = Termi;
                break;
            }
        } else if (Fc == '\'' || Fc == '"') {
            // Ignore in strings
            Term = Change(Term, '(', Chr(1));
            Term = Change(Term, ')', Chr(2));
        }

        Preselect[Preselect.length] = Term;
    }

    var Spreselect = Join(Preselect, ' ');


    while (Truncated) {
        // Find Last and or Or before the offending clause
        Preselect = Split(Spreselect, 5);
        var _ForEndI_168 = LBound(Preselect);
        for (I = UBound(Preselect); I >= _ForEndI_168; I--) {
            Lcterm = LCase(Preselect[I]);
            Preselect.Pop();
            if (Lcterm == 'and' || Lcterm == 'or' || Lcterm == 'order' || Lcterm == 'orderby' || Lcterm == 'by') break;
        }

        if (Lcterm == 'or') {
            return ''; // we can't preselect as the other part is an or statement;
        }

        // Make sure parenthsis are balanced
        Spreselect = Join(Preselect, ' ');
        Truncated = false;

        while (true) {
            var Fcnt = Count(Spreselect, '(');
            var Bcnt = Count(Spreselect, ')');
            if (Fcnt == Bcnt) break;
            var Fi = Index1(Spreselect, '(', Fcnt);
            var Bi = Index1(Spreselect, ')', Bcnt);
            if (Fi > Bi) Spreselect = Left(Preselect, Fi - 1); else Spreselect = Left(Preselect, Bi - 1);
            Spreselect = RTrim(Spreselect);
            Truncated = true;
        }
    }

    Spreselect = Change(Spreselect, Chr(1), '(');
    Spreselect = Change(Spreselect, Chr(2), ')');

    // no change? we can push all of this into the main select
    if (Spreselect == Whereclause) return '';
    return Spreselect;
}
// </PRESELECTBYITEMID>

// <I_DB_Sub>
async function JSB_ODB_I_DB_Sub() {
}
// </I_DB_Sub>

// <CLEARREFCACHE_Sub>
async function JSB_ODB_CLEARREFCACHE_Sub(Fhandle) {
    // local variables
    var Refkey, Key;

    var Refcache = At_Session.Item('RefCache');
    if (CBool(Refcache)) {
        Fhandle = LCase(Fhandle);
        var Keys2delete = [undefined,];
        for (Refkey of iterateOver(Refcache)) {
            if (Field(Refkey, Chr(250), 1, true) == Fhandle) Keys2delete[Keys2delete.length] = Refkey;
        }
        for (Refkey of iterateOver(Keys2delete)) {
            delete Refcache[Refkey]
        }
    }

    var Filename = LCase(fHandle2FileName(Fhandle));
    if (Filename == 'system' || Filename == 'jsb_users') {
        if (System(1) == 'gae') {
            await asyncTclExecute('clear-cache'); // Clears Mem-Cache;
        }
        At_Session.Item('CACHEDACCOUNTS', '');
        At_Session.Item('RPC_CACHED_OPENS', {});
        At_Session.Item('LAST_RPC_ADDRESS', '');
        At_Session.Item('RPC_CACHED_LOGINS', {});
        At_Session.Item('RPC_CACHED_ITEMS', {});
        At_Session.Item('REFCACHE', {});
        if (System(1) == 'js') window.saveAtSession();
    }

    if (Filename == 'jsb_config') {
        for (Key of iterateOver(At_Application.Item('KEYS'))) {
            if (Left(Key, 7) == 'config ') At_Application.Item(Key, undefined);
        }
        if (System(1) == 'js') window.saveAtSession();
    }
}
// </CLEARREFCACHE_Sub>

// <VALIDODBPROTOCOLS>
async function JSB_ODB_VALIDODBPROTOCOLS() {
    return [undefined, 'rmt', 'hyb', 'log', 'rpc', 'dropbox', 'sheets', 'hbd', 'bin'];
}
// </VALIDODBPROTOCOLS>

// <LISTFILES>
async function JSB_ODB_LISTFILES(ByRef_Result, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Result)
        return v
    }
    var _Account = At_Session.Item('ATTACHEDDATABASE');
    var Cachedaccounts = At_Session.Item('CACHEDACCOUNTS');
    var Spot = undefined;
    var Errors = '';

    if (Locate(_Account, Cachedaccounts, 1, 0, 0, "", position => Spot = position)) {
        var Httpaddress = Change(Extract(Cachedaccounts, 2, Spot, 0), '%%', Chr(253));

        if (Left(Httpaddress, 1) == '@') {
            var A1 = Field(Httpaddress, vm, 1, true);
            var Logininfo = dropLeft(Httpaddress, vm);
            var Odbsub = 'jsb_odb.' + Mid1(A1, 2) + '_ListFiles';
            var Success = undefined;
            await asyncCallByName(Odbsub, me, 0 /*ignore if missing */, Logininfo, ByRef_Result, Success, function (_ByRef_Result, _Success) { ByRef_Result = _ByRef_Result; Success = _Success });
            return exit(Success);;
        } else if (Httpaddress) {
            await JSB_ODB_RPC_LISTFILES_Sub(Httpaddress, ByRef_Result, Errors, function (_ByRef_Result, _Errors) { ByRef_Result = _ByRef_Result; Errors = _Errors });
            return exit(!Errors);
        }
    }

    var Aresult = undefined;
    if (await asyncListFiles(_fileList => Aresult = _fileList)); else return exit(0);
    ByRef_Result = CStr(Aresult, true);
    return exit(1);
}
// </LISTFILES>

// <OPEN>
async function JSB_ODB_OPEN(Dictdata, Fname, ByRef_Fhandle, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Fhandle)
        return v
    }
    Fname = LTrim(RTrim(Fname));
    var Lfname = LCase(Trim(Fname));
    if (!Lfname) return exit(undefined);

    Dictdata = LCase(Trim(Dictdata));
    if (Left(Lfname, 5) == 'dict ' || Left(Lfname, 5) == 'data ') {
        Dictdata = Left(Lfname, 4);
        Fname = Mid1(Fname, 6);
        Lfname = Mid1(Lfname, 6);
    }
    if (Dictdata != 'dict') Dictdata = 'data';

    // these must already exists and be local
    if (Lfname == 'system' || Lfname == 'md') {
        if (await asyncOpen(Dictdata, Fname, _fHandle => ByRef_Fhandle = _fHandle)) return exit(true); else return exit(false);
    }

    // check for Q-Log
    var Fmd = undefined;
    if (await asyncOpen("", 'md', _fHandle => Fmd = _fHandle)); else return exit(false);

    var Qrec = '';
    if (await asyncRead(Fmd, Fname, "", 0, _data => Qrec = _data)); else Qrec = '';
    var Lqrec1 = LCase(Extract(Qrec, 1, 0, 0));

    // Check for "ql" log files (allows ql of other protocols)
    var Enablelogfile = undefined;
    if (Locate('ql', Lqrec1, 1, 0, 0, "", position => Enablelogfile = position)) {
        var Qfname = Trim(Extract(Qrec, 2, Enablelogfile, 0));
        if (!Qfname) Qfname = Fname;

        // Make sure log file exists (use open, not _open so QPTR to SDCard willl work)
        var Qflogfilename = Trim(Extract(Qrec, 3, Enablelogfile, 0));
        if (!Qflogfilename) Qflogfilename = 'dblog';

        // Instead of calling the protocol log_Open, I do it here to prevent circular opens
        Dictdata = LCase(Dictdata);
        if (Dictdata != 'dict') Dictdata = 'data';
        ByRef_Fhandle = '@log.' + Dictdata + am + Qfname + am + Qflogfilename;

        var Xfhandle = undefined;
        if (Qfname == Fname) {
            // Prevent circular open with i_open
            if (await asyncOpen(Dictdata, Qfname, _fHandle => Xfhandle = _fHandle)); else return exit(false);
        } else {
            if (await JSB_ODB_OPEN(Dictdata, Qfname, Xfhandle, function (_Xfhandle) { Xfhandle = _Xfhandle })); else return exit(false);
            ByRef_Fhandle += am + 'a';
        }
        return exit(true);
    }

    // Check for Q md entry
    var Isqdrec = undefined;
    if (Locate('qd', Lqrec1, 1, 0, 0, "", position => Isqdrec = position)) {
        var Isqrec = Isqdrec;
    } else {
        Isqdrec = 0;
        if (Locate('q', Lqrec1, 1, 0, 0, "", position => Isqrec = position)); else Isqrec = 0;
    }

    var _Protocol = '';
    if (InStr1(1, Fname, ':')) {
        _Protocol = LCase(Field(Fname, ':', 1, true));
        if (Locate(_Protocol, await JSB_ODB_VALIDODBPROTOCOLS(), 0, 0, 0, "", position => { })) {
            Fname = dropLeft(Fname, ':');
            if (Left(Fname, 1) == '@') Fname = Mid1(Fname, 2);
        } else {
            _Protocol = '';
        }
    }

    if (Isqrec) {
        Qfname = Trim(Extract(Qrec, 3, Isqrec, 0));
        if (!Qfname) Qfname = Fname;
        if (Not(_Protocol) && InStr1(1, Qfname, ':')) {
            _Protocol = LCase(Field(Qfname, ':', 1, true));
            if (Locate(_Protocol, await JSB_ODB_VALIDODBPROTOCOLS(), 0, 0, 0, "", position => { })) {
                Qfname = dropLeft(Qfname, ':');
                if (Left(Qfname, 1) == '@') Qfname = Mid1(Qfname, 2);
                Fname = Qfname;
            } else {
                _Protocol = '';
            }
        }
    }

    var Rmtonly = _Protocol == 'rmt';

    // Check for a protocol
    if (!Rmtonly) {
        if (_Protocol) {
            var Cname = ('jsb_odb|' + _Protocol + '_open');
            var Success = undefined;
            await asyncCallByName(Cname, me, 0 /*ignore if missing */, Dictdata, Fname, ByRef_Fhandle, Success, function (_ByRef_Fhandle, _Success) { ByRef_Fhandle = _ByRef_Fhandle; Success = _Success });
            if (JSB_BF_TYPEOFFILE(ByRef_Fhandle)) return exit(Success);
            ByRef_Fhandle = '@' + _Protocol + '.' + CStr(ByRef_Fhandle);
            return exit(Success);
        }

        // Local versions come before q-ptrs
        if (await asyncOpen(Dictdata, Fname, _fHandle => ByRef_Fhandle = _fHandle)) return exit(true);
    }

    // Check for Q versions and set QActName
    if (Isqdrec) {
        if (Dictdata == 'dict') {
            // DICT is local
            if (await asyncOpen('dict', Qfname, _fHandle => ByRef_Fhandle = _fHandle)) return exit(true);
            if (await asyncCreateTable("DATA", 'dict ' + Qfname, _fHandle => activeProcess.At_File = _fHandle)); else return exit(false);
            if (await asyncOpen('dict', Qfname, _fHandle => ByRef_Fhandle = _fHandle)) return exit(true);
            return exit(false);
        }
    }

    if (Isqrec) {
        var Qactname = Trim(Extract(Qrec, 2, Isqrec, 0));
        Qfname = Trim(Extract(Qrec, 3, Isqrec, 0));
        if (!Qfname) Qfname = Fname;

        if (Qactname) {
            var Httpaddress = await JSB_ODB_ATTACHREMOTEDB(Qactname, false);
            if (Left(Httpaddress, 1) == '!') {
                return exit(false); // AttachDB error (!);
            }
            if (Httpaddress == '.') Qactname = '';
        }

        // No Account given?
        if (!Qactname || Qactname == '.') {
            if (LCase(Qfname) == LCase(Fname)) return exit(false);
            if (Rmtonly) if (Left(LCase(Qfname), 4) != 'rmt:') Qfname = 'rmt:' + Qfname;
            return exit(await JSB_ODB_OPEN(Dictdata, Qfname, ByRef_Fhandle, function (_ByRef_Fhandle) { ByRef_Fhandle = _ByRef_Fhandle })); // Check For Another Q-Ptr;
        }

        // ====================== HANDLE Q ACCOUNTS via ATTACH ====================== 
        if (Left(Httpaddress, 1) == '@') {
            _Protocol = Mid1(Extract(Httpaddress, 1, 1, 0), 2);
            Cname = ('jsb_odb|' + _Protocol + '_open');
            await asyncCallByName(Cname, me, 0 /*ignore if missing */, Extract(Httpaddress, 1, 2, 0), Dictdata, Qfname, ByRef_Fhandle, Success, function (_ByRef_Fhandle, _Success) { ByRef_Fhandle = _ByRef_Fhandle; Success = _Success });
            return exit(Success);
        }

        if (Httpaddress) {
            await JSB_ODB_RPC_OPEN_Sub(Httpaddress, Dictdata, Qfname, ByRef_Fhandle, Success, function (_ByRef_Fhandle, _Success) { ByRef_Fhandle = _ByRef_Fhandle; Success = _Success });
            return exit(Success);
        }

        // non-http - attempt internal Attach to a Database
        var Currentaccount = Account();

        // Try internal attach
        if (await asyncAttach(Qactname)); else {
            if (await asyncAttach(Currentaccount)); else null;
            activeProcess.At_Errors = 'Unable to attach to account ' + Qactname;
            return exit(false);
        }
        var Opensuccess = undefined;
        if (await asyncOpen(Dictdata, Qfname, _fHandle => ByRef_Fhandle = _fHandle)) Opensuccess = true; else Opensuccess = false;
        var Openerror = activeProcess.At_Errors;

        // reset current account
        if (await asyncAttach(Currentaccount)); else null;

        // return error or success
        activeProcess.At_Errors = Openerror;
        return exit(Opensuccess);
    }

    if (Rmtonly) {
        if (await asyncOpen(Dictdata, Fname, _fHandle => ByRef_Fhandle = _fHandle)) {
            if (System(1) == 'js') {
                if (Left(ByRef_Fhandle, 1) == '/') return exit(true);
            } else if (System(1) == 'gae') {
                if (Left(ByRef_Fhandle, 1) != '0') return exit(true);
            } else if (System(1) == 'aspx') {
                if (Left(ByRef_Fhandle, 4) == 'ado:') return exit(true);
            }
        }
        var Errs = Fname + ' does not exist remotely';
    } else {
        if (await asyncOpen(Dictdata, Fname, _fHandle => ByRef_Fhandle = _fHandle)) return exit(true);
        Errs = activeProcess.At_Errors;
    }

    // is this file in the attached database?
    var _Account = At_Session.Item('ATTACHEDDATABASE');
    var Cachedaccounts = At_Session.Item('CACHEDACCOUNTS');
    var Spot = undefined;
    if (Locate(_Account, Cachedaccounts, 1, 0, 0, "", position => Spot = position)) {
        Httpaddress = Change(Extract(Cachedaccounts, 2, Spot, 0), '%%', Chr(253));

        if (Left(Httpaddress, 1) == '@') {
            var A1 = Field(Httpaddress, vm, 1, true);
            var Logininfo = dropLeft(Httpaddress, vm);
            var Odbsub = 'jsb_odb.' + Mid1(A1, 2) + '_open';
            await asyncCallByName(Odbsub, me, 0 /*ignore if missing */, Logininfo, Dictdata, Fname, ByRef_Fhandle, Success, function (_ByRef_Fhandle, _Success) { ByRef_Fhandle = _ByRef_Fhandle; Success = _Success });
            return exit(Success);;
        } else if (Httpaddress) {
            await JSB_ODB_RPC_OPEN_Sub(Httpaddress, Dictdata, Fname, ByRef_Fhandle, Success, function (_ByRef_Fhandle, _Success) { ByRef_Fhandle = _ByRef_Fhandle; Success = _Success });
            return exit(Success);
        }
    }

    activeProcess.At_Errors = Errs;
    return exit(false);
}
// </OPEN>

// <CREATEFILE>
async function JSB_ODB_CREATEFILE(Dictdata, Filename) {
    var _Account = At_Session.Item('ATTACHEDDATABASE');
    var Cachedaccounts = At_Session.Item('CACHEDACCOUNTS');

    if (!Len(Filename)) {
        Filename = RTrim(Dictdata);
        Dictdata = '';
    }

    Dictdata = LCase(Trim(Dictdata));
    Filename = RTrim(LTrim(Filename));

    var Lfname = LCase(Filename);
    if (Left(Lfname, 5) == 'dict ' || Left(Lfname, 5) == 'data ') {
        Dictdata = Left(Lfname, 4);
        Filename = Mid1(Filename, 6);
    }

    var Spot = undefined;
    if (Locate(_Account, Cachedaccounts, 1, 0, 0, "", position => Spot = position)) {
        var Httpaddress = Change(Extract(Cachedaccounts, 2, Spot, 0), '%%', Chr(253));
        var Success = undefined;

        if (Left(Httpaddress, 1) == '@') {
            var A1 = Field(Httpaddress, vm, 1, true);
            var Logininfo = dropLeft(Httpaddress, vm);
            var Rmtcall = 'jsb_odb.' + Mid1(A1, 2) + '_CreateFile';
            await asyncCallByName(Rmtcall, me, 0 /*ignore if missing */, Logininfo, Dictdata, Filename, Success, function (_Success) { Success = _Success });
            return Success;;
        } else if (Httpaddress) {
            var Fhandle = undefined;
            await JSB_ODB_RPC_CREATEFILE_Sub(Httpaddress, LTrim(Dictdata + ' ' + Filename), Fhandle, Success, function (_Fhandle, _Success) { Fhandle = _Fhandle; Success = _Success });
            return Success;
        }
    }

    if (await asyncCreateTable(Dictdata, Filename, _fHandle => activeProcess.At_File = _fHandle)) return 1; else return 0;
}
// </CREATEFILE>

// <CLEARFILE>
async function JSB_ODB_CLEARFILE(Fhandle) {
    await JSB_ODB_CLEARREFCACHE_Sub(Fhandle);

    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_clearfile');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, Rfhandle, Success, function (_Success) { Success = _Success });
        return Success;
    }

    if (await asyncClearTable(Fhandle)) return true;

    return false;
}
// </CLEARFILE>

// <DELETEFILE>
async function JSB_ODB_DELETEFILE(Fhandle) {
    await JSB_ODB_CLEARREFCACHE_Sub(Fhandle);

    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_deletefile');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, Rfhandle, Success, function (_Success) { Success = _Success });
        return Success;
    }

    if (await asyncDeleteTable(Fhandle)) return 1; else return 0;
}
// </DELETEFILE>

// <DELETEITEM>
async function JSB_ODB_DELETEITEM(Fhandle, Iname) {
    await JSB_ODB_CLEARREFCACHE_Sub(Fhandle);

    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_deleteitem');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, Rfhandle, Iname, Success, function (_Success) { Success = _Success });
        return Success;
    }

    if (await asyncDelete(Fhandle, Iname)) return 1; else return 0;
}
// </DELETEITEM>

// <READ>
async function JSB_ODB_READ(ByRef_Item, Fhandle, Iname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item)
        return v
    }
    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_read');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, ByRef_Item, Rfhandle, Iname, Success, function (_ByRef_Item, _Success) { ByRef_Item = _ByRef_Item; Success = _Success });
        return exit(Success);
    }

    return exit(await JSB_ODB_READX(ByRef_Item, Fhandle, CStr(Iname), false, function (_ByRef_Item) { ByRef_Item = _ByRef_Item }));
}
// </READ>

// <READM>
async function JSB_ODB_READM(ByRef_Item, Fhandle, Iname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item)
        return v
    }
    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_read');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, ByRef_Item, Rfhandle, Iname, Success, function (_ByRef_Item, _Success) { ByRef_Item = _ByRef_Item; Success = _Success });
    } else {
        Success = await JSB_ODB_READX(ByRef_Item, Fhandle, CStr(Iname), false, function (_ByRef_Item) { ByRef_Item = _ByRef_Item });
    }

    if (!Success) return exit(false);
    ByRef_Item = Split(ByRef_Item, am);
    return exit(Success);
}
// </READM>

// <READMU>
async function JSB_ODB_READMU(ByRef_Item, Fhandle, Iname, setByRefValues) {
    // local variables
    var Cname, Rfhandle, Success;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item)
        return v
    }
    if (Left(Fhandle, 1) == '@') {
        Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_readu');
        Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, ByRef_Item, Rfhandle, Iname, Success, function (_ByRef_Item, _Success) { ByRef_Item = _ByRef_Item; Success = _Success });
    } else {
        Success = await JSB_ODB_READX(ByRef_Item, Fhandle, CStr(Iname), true, function (_ByRef_Item) { ByRef_Item = _ByRef_Item });
    }

    if (Not(Success)) return exit(false);
    ByRef_Item = Split(ByRef_Item, am);
    return exit(Success);
}
// </READMU>

// <READU>
async function JSB_ODB_READU(ByRef_Item, Fhandle, Iname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item)
        return v
    }
    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_readu');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, ByRef_Item, Rfhandle, Iname, Success, function (_ByRef_Item, _Success) { ByRef_Item = _ByRef_Item; Success = _Success });
        return exit(Success);
    }

    return exit(await JSB_ODB_READX(ByRef_Item, Fhandle, CStr(Iname), true, function (_ByRef_Item) { ByRef_Item = _ByRef_Item }));
}
// </READU>

// <READX>
async function JSB_ODB_READX(ByRef_Item, Fhandle, Iname, Isreadu, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item)
        return v
    }
    if (LCase(Left(Fhandle, 4)) == 'http') {
        var Fh = undefined;
        if (await asyncOpen("", Fhandle, _fHandle => Fh = _fHandle)); else return exit(0);
        if (await asyncRead(Fh, '', "", 0, _data => ByRef_Item = _data)) return exit(1); else return exit(0);
    }

    if (Isreadu) {
        if (await asyncRead(Fhandle, Iname, "U", 0, _data => ByRef_Item = _data)) return exit(1); else return exit(0);
    } else {
        if (await asyncRead(Fhandle, Iname, "", 0, _data => ByRef_Item = _data)) return exit(1); else return exit(0);
    }
    return exit();
}
// </READX>

// <READJSON>
async function JSB_ODB_READJSON(ByRef_Item, Fhandle, Iname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item)
        return v
    }
    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_readjson');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, ByRef_Item, Rfhandle, Iname, Success, function (_ByRef_Item, _Success) { ByRef_Item = _ByRef_Item; Success = _Success });
        return exit(Success);
    }

    if (await asyncRead(Fhandle, Iname, "JSON", 0, _data => ByRef_Item = _data)) return exit(true); else return exit(false);
    return exit();
}
// </READJSON>

// <READJSONU>
async function JSB_ODB_READJSONU(ByRef_Item, Fhandle, Iname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item)
        return v
    }
    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_readjsonu');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, ByRef_Item, Rfhandle, Iname, Success, function (_ByRef_Item, _Success) { ByRef_Item = _ByRef_Item; Success = _Success });
        return exit(Success);
    }

    if (await asyncRead(Fhandle, Iname, "JSONU", 0, _data => ByRef_Item = _data)) return exit(true); else return exit(false);
    return exit();
}
// </READJSONU>

// <READV>
async function JSB_ODB_READV(ByRef_Line, Fhandle, Iname, Atrno, setByRefValues) {
    // local variables
    var Item;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Line)
        return v
    }
    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_readv');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, Item, Rfhandle, Iname, Atrno, Success, function (_Item, _Success) { Item = _Item; Success = _Success });
        return exit(Success);
    }

    if (await asyncRead(Fhandle, Iname, "V", Atrno, _data => ByRef_Line = _data)); else return exit(false);
    return exit(true);
}
// </READV>

// <READVU>
async function JSB_ODB_READVU(ByRef_Line, Fhandle, Iname, Atrno, setByRefValues) {
    // local variables
    var Item;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Line)
        return v
    }
    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_readvu');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, Item, Rfhandle, Iname, Atrno, Success, function (_Item, _Success) { Item = _Item; Success = _Success });
        return exit(Success);
    }

    if (await asyncRead(Fhandle, Iname, "U", 0, _data => ByRef_Line = _data)); else return exit(false);
    ByRef_Line = Extract(Item, Atrno, 0, 0);
    return exit(true);
}
// </READVU>

// <READXML>
async function JSB_ODB_READXML(ByRef_Item, Fhandle, Iname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item)
        return v
    }
    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_readxml');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, ByRef_Item, Rfhandle, Iname, Success, function (_ByRef_Item, _Success) { ByRef_Item = _ByRef_Item; Success = _Success });
        return exit(Success);
    }

    if (await asyncRead(Fhandle, Iname, "XML", 0, _data => ByRef_Item = _data)) return exit(true); else return exit(false);
    return exit();
}
// </READXML>

// <READXMLU>
async function JSB_ODB_READXMLU(ByRef_Item, Fhandle, Iname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item)
        return v
    }
    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_readxmlu');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, ByRef_Item, Rfhandle, Iname, Success, function (_ByRef_Item, _Success) { ByRef_Item = _ByRef_Item; Success = _Success });
        return exit(Success);
    }

    if (await asyncRead(Fhandle, Iname, "XMLU", 0, _data => ByRef_Item = _data)) return exit(true); else return exit(false);
    return exit();
}
// </READXMLU>

// <WRITE>
async function JSB_ODB_WRITE(Item, Fhandle, Iname) {
    await JSB_ODB_CLEARREFCACHE_Sub(Fhandle);

    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_write');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, Item, Rfhandle, Iname, Success, function (_Success) { Success = _Success });
        return Success;
    }

    if (await asyncWrite(Item, Fhandle, Iname, "", 0)) return 1; else return 0;
}
// </WRITE>

// <WRITEU>
async function JSB_ODB_WRITEU(Item, Fhandle, Iname) {
    await JSB_ODB_CLEARREFCACHE_Sub(Fhandle);

    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_writeu');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, Item, Rfhandle, Iname, Success, function (_Success) { Success = _Success });
        return Success;
    }

    if (await asyncWrite(Item, Fhandle, Iname, "U", 0)) return 1; else return 0;
}
// </WRITEU>

// <WRITEJSON>
async function JSB_ODB_WRITEJSON(Item, Fhandle, Iname) {
    await JSB_ODB_CLEARREFCACHE_Sub(Fhandle);

    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_writejson');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, Item, Rfhandle, Iname, Success, function (_Success) { Success = _Success });
        return Success;
    }

    if (await asyncWrite(Item, Fhandle, Iname, "JSON", 0)) return 1; else return 0;
}
// </WRITEJSON>

// <WRITEJSONU>
async function JSB_ODB_WRITEJSONU(Item, Fhandle, Iname) {
    await JSB_ODB_CLEARREFCACHE_Sub(Fhandle);

    if (Left(Fhandle, 1) == '@') {
        var Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_writejsonu');
        var Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        var Success = undefined;
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, Item, Rfhandle, Iname, Success, function (_Success) { Success = _Success });
        return Success;
    }

    if (await asyncWrite(Item, Fhandle, Iname, "JSONU", 0)) return 1; else return 0;
}
// </WRITEJSONU>

// <WRITEV>
async function JSB_ODB_WRITEV(Line, Fhandle, Iname, Atrno) {
    if (await asyncWrite(Line, Fhandle, Iname, "V", Atrno)) return 1; else return 0;
}
// </WRITEV>

// <WRITEVU>
async function JSB_ODB_WRITEVU(Line, Fhandle, Iname, Atrno) {
    if (await asyncWrite(Line, Fhandle, Iname, "VU", Atrno)) return 1; else return 0;
}
// </WRITEVU>

// <WRITEXML>
async function JSB_ODB_WRITEXML(Item, Fhandle, Iname) {
    // local variables
    var Cname, Rfhandle, Success;

    await JSB_ODB_CLEARREFCACHE_Sub(Fhandle);

    if (Left(Fhandle, 1) == '@') {
        Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_writexml');
        Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, Item, Rfhandle, Iname, Success, function (_Success) { Success = _Success });
        return Success;
    }

    if (await asyncWrite(Item, Fhandle, Iname, "XML", 0)) return 1; else return 0;
}
// </WRITEXML>

// <WRITEXMLU>
async function JSB_ODB_WRITEXMLU(Item, Fhandle, Iname) {
    // local variables
    var Cname, Rfhandle, Success;

    await JSB_ODB_CLEARREFCACHE_Sub(Fhandle);

    if (Left(Fhandle, 1) == '@') {
        Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_writexmlu');
        Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, Item, Rfhandle, Iname, Success, function (_Success) { Success = _Success });
        return Success;
    }

    if (await asyncWrite(Item, Fhandle, Iname, "XMLU", 0)) return 1; else return 0;
}
// </WRITEXMLU>

// <ATTACH_Pgm>
async function JSB_ODB_ATTACH_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    // Dim ActiveAct As String = @Account
    var Accountname = Field(Field(activeProcess.At_Sentence, ' ', 2), '(', 1);
    if (Not(isAdmin())) return Stop('You are not an administrator');
    clearSelect(odbActiveSelectList);
    await JSB_ODB_DETACHDB_Sub(true);
    if (!(await JSB_ODB_ATTACHDB(Accountname))) return Stop(activeProcess.At_Errors);
    Println('Attached to ', Accountname);
    return;
}
// </ATTACH_Pgm>

// <ATTACHDB_Pgm>
async function JSB_ODB_ATTACHDB_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    // Dim ActiveAct As String = @Account
    var Accountname = Field(Field(activeProcess.At_Sentence, ' ', 2), '(', 1);
    if (Not(isAdmin())) return Stop('You are not an administrator');
    clearSelect(odbActiveSelectList);
    await JSB_ODB_DETACHDB_Sub(true);
    if (!(await JSB_ODB_ATTACHDB(Accountname))) return Stop(activeProcess.At_Errors);
    Println('Attached to ', Accountname);
    return;
}
// </ATTACHDB_Pgm>

// <DETACHDB_Pgm>
async function JSB_ODB_DETACHDB_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    await JSB_ODB_DETACHDB_Sub(true);
    return;
}
// </DETACHDB_Pgm>

// <DETACH_Pgm>
async function JSB_ODB_DETACH_Pgm() {  // PROGRAM
    Commons_JSB_ODB = {};
    Equates_JSB_ODB = {};

    await JSB_ODB_DETACHDB_Sub(true);
    return;
}
// </DETACH_Pgm>

// <ATTACHDB>
async function JSB_ODB_ATTACHDB(Accountname) {
    // local variables
    var Fsystem, Olddef;

    if (System(1) == 'js') {
        if (Null0(Accountname) == Null0(window.dbName)) Accountname = '';
    }

    if ((Not(Accountname))) {
        await JSB_ODB_DETACHDB_Sub(false);
        return true;
    }

    var Httpaddress = await JSB_ODB_ATTACHREMOTEDB(Accountname, true);

    // Did we get an error?
    if (Left(Httpaddress, 1) == '!') return false;

    // Did we attach?
    if (Httpaddress) return true;

    // Try internal attach
    if (await asyncAttach(Accountname)) {
        At_Session.Item('ATTACHEDDATABASE', Accountname);
        if (System(1) == 'js') window.saveAtSession();
        return true;
    }

    if (Not(Accountname)) return false;
    var Realerror = activeProcess.At_Errors;

    if (await asyncOpen("", 'system', _fHandle => Fsystem = _fHandle)); else return false;
    if (await asyncRead(Fsystem, Accountname, "", 0, _data => Olddef = _data)) { activeProcess.At_Errors = Realerror; return false; }

    // Can we attempt a SQL attachment using a default config?
    var Dftact = await JSB_BF_JSBCONFIG('default.account');
    if (Not(Dftact)) { activeProcess.At_Errors = Realerror; return false; }
    if (!InStr1(1, Dftact, '\<\<databasename\>\>')) { activeProcess.At_Errors = 'jsb_config default.account is missing \<\<databasename\>\>'; return false; }
    Dftact = Change(Dftact, '\<\<databasename\>\>', Accountname);
    if (await asyncWrite(Dftact, Fsystem, Accountname, "", 0)); else return false;

    // Attemp http attach?
    Httpaddress = await JSB_ODB_ATTACHREMOTEDB(Accountname, true);
    var Success = (Left(Httpaddress, 1) != '!' && Httpaddress);
    if (!Success) {
        // Try internal attach
        if (await asyncAttach(Accountname)) Success = true;
    }

    // Get rid of temporary account definition
    if (await JSB_ODB_DELETEITEM(Fsystem, Accountname)); else null;

    if (Success) {
        At_Session.Item('ATTACHEDDATABASE', Accountname);
        if (System(1) == 'js') window.saveAtSession();
    } else {
        activeProcess.At_Errors = 'No such account ' + Accountname;
    }

    return Success;
}
// </ATTACHDB>

// <ATTACHREMOTEDB>
async function JSB_ODB_ATTACHREMOTEDB(Accountname, Permanent) {
    // local variables
    var Spot;

    Accountname = LCase(Accountname);
    var Httpaddressnsid = '';

    var Cachedaccounts = At_Session.Item('CACHEDACCOUNTS');
    if (Locate(Accountname, Cachedaccounts, 1, 0, 0, "", position => Spot = position)) {
        Httpaddressnsid = Change(Extract(Cachedaccounts, 2, Spot, 0), '%%', Chr(253));
    } else {

        // A Q-PTR to another account -- attempt to attach to the account
        var Fsystem = undefined;
        if (await asyncOpen("", 'system', _fHandle => Fsystem = _fHandle)); else return '';

        var Qact = '';
        if (await asyncRead(Fsystem, Accountname, "", 0, _data => Qact = _data)); else return '';

        var A1 = UCase(Extract(Qact, 1, 0, 0));
        var Provider = Extract(Qact, 2, 0, 0);
        var _Password = Extract(Qact, 4, 0, 0);
        var Providertype = Left(A1, 1);

        if (Left(A1, 1) != '@') {
            if (Providertype != 'J' && Providertype != 'P') return '';
            if (Provider == '.') return Provider;
            if (Left(Provider, 2) == './') {
                if (Providertype == 'F') return Provider;
                if (Providertype == 'P') Provider = jsbRoot() + Mid1(Provider, 3);
            }
            if (Left(Provider, 4) != 'http' && Left(Provider, 2) != '//') { activeProcess.At_Errors = 'Bad MD QPtr: ' + Accountname; return '!' + CStr(activeProcess.At_Errors); }
            if (Right(Provider, 1) != '/') Provider += '/';
        }

        // Prompt for Username / Password?
        Httpaddressnsid = await JSB_ODB_PROMPTFORUSERNAMEANDPASSWORD(Accountname, CStr(Qact));
        if (Not(Httpaddressnsid)) return '!' + CStr(activeProcess.At_Errors);

        Cachedaccounts = Replace(Cachedaccounts, 1, Spot, 0, Accountname);
        Cachedaccounts = Replace(Cachedaccounts, 2, Spot, 0, Change(Httpaddressnsid, Chr(253), '%%'));
        At_Session.Item('CACHEDACCOUNTS', Cachedaccounts);

        if (Right(Extract(Qact, 1, 0, 0), 1) != '!' && Len(_Password)) {
            Qact = Replace(Qact, 4, 0, 0, STX(aesEncrypt(_Password)));
            Qact = Replace(Qact, 1, 0, 0, Extract(Qact, 1, 0, 0) + '!');
            if (await asyncWrite(Qact, Fsystem, Accountname, "", 0)); else null;
        }
    }

    if (Permanent) {
        At_Session.Item('ATTACHEDDATABASE', Accountname);
        if (System(1) == 'js') window.saveAtSession();
    }

    return Httpaddressnsid;
}
// </ATTACHREMOTEDB>

// <PROMPTFORUSERNAMEANDPASSWORD>
async function JSB_ODB_PROMPTFORUSERNAMEANDPASSWORD(Accountname, Qact) {
    // local variables
    var P, Msg, Ans, Login;

    var A1 = UCase(Extract(Qact, 1, 0, 0));
    var Provider = Extract(Qact, 2, 0, 0);
    var _Username = Extract(Qact, 3, 0, 0);
    var _Password = Extract(Qact, 4, 0, 0);
    var Initialdb = Extract(Qact, 5, 0, 0);
    var Httpaddressnsid = '';
    var Providertype = Left(A1, 1);

    if (Right(A1, 1) == '!') {
        A1 = Left(A1, Len(A1) - 1);
        try {
            P = XTS(_Password);
            if (STX(P) == _Password) _Password = aesDecrypt(P);
        } catch (Xerr) { }
    }

    if (Left(Provider, 2) == './' && Providertype == 'P') Provider = jsbRoot() + Mid1(Provider, 3);
    if (Right(Provider, 1) != '/') Provider += '/';

    if (InStr1(1, Provider, '\<\<username\>\>') || InStr1(1, Provider, '\<\<password\>\>')) {
        if (!_Username || !_Password) {
            Msg = 'Attach to database';

            while (true) {
                Ans = await JSB_ODB_LOGINBOX(Msg, 'Login required to attach to ' + CStr(Accountname), '', function (_Msg, _P2, _P3) { Msg = _Msg });
                if (Ans == Chr(27)) {
                    activeProcess.At_Errors = 'User Canceled Attach';
                    return '';
                }

                Provider = Extract(Qact, 2, 0, 0);
                if (Left(Provider, 2) == './' && Providertype == 'P') Provider = jsbRoot() + Mid1(Provider, 3);
                if (Right(Provider, 1) != '/') Provider += '/';

                Provider = Change(Provider, '\<\<username\>\>', _Username);
                Provider = Change(Provider, '\<\<password\>\>', _Password);

                if (Left(A1, 1) == '@') {
                    Login = 'jsb_odb.' + Mid1(A1, 2) + '_Login';
                    await asyncCallByName(Login, me, 0 /*ignore if missing */, Httpaddressnsid, Provider, _Username, _Password, Initialdb, function (_Httpaddressnsid) { Httpaddressnsid = _Httpaddressnsid });
                    if (Httpaddressnsid) Httpaddressnsid = A1 + vm + CStr(Httpaddressnsid);
                } else {
                    Httpaddressnsid = await JSB_ODB_RPC_LOGIN(Provider, _Username, _Password, Initialdb);
                }

                if (Not(Not(Httpaddressnsid))) break;
                Msg = activeProcess.At_Errors;
            }
            return Httpaddressnsid;
        }
    }

    Provider = Change(Provider, '\<\<username\>\>', _Username);
    Provider = Change(Provider, '\<\<password\>\>', _Password);

    if (Left(A1, 1) == '@') {
        Login = 'jsb_odb.' + Mid1(A1, 2) + '_Login';
        await asyncCallByName(Login, me, 0 /*ignore if missing */, Httpaddressnsid, Provider, _Username, _Password, Initialdb, function (_Httpaddressnsid) { Httpaddressnsid = _Httpaddressnsid });
        if (Httpaddressnsid) Httpaddressnsid = A1 + vm + Httpaddressnsid;
    } else {
        Httpaddressnsid = await JSB_ODB_RPC_LOGIN(Provider, _Username, _Password, Initialdb);
    }

    return Httpaddressnsid;
}
// </PROMPTFORUSERNAMEANDPASSWORD>

// <DETACHDB_Sub>
async function JSB_ODB_DETACHDB_Sub(Removecache) {
    // local variables
    var _Account, Cachedaccounts, Spot, Httpaddress;

    _Account = At_Session.Item('ATTACHEDDATABASE');
    if (CBool(_Account) && Removecache) {
        Cachedaccounts = At_Session.Item('CACHEDACCOUNTS');
        if (Locate(_Account, Cachedaccounts, 1, 0, 0, "", position => Spot = position)) {
            Httpaddress = Change(Extract(Cachedaccounts, 2, Spot, 0), '%%', Chr(253));
            if (Left(Httpaddress, 1) == '@') {
                var A1 = Field(Httpaddress, vm, 1);
                var Logininfo = dropLeft(CStr(Httpaddress), vm);
                var Dt = 'jsb_odb.' + Mid1(A1, 2) + '_Logout';
                var Success = undefined;
                await asyncCallByName(Dt, me, 0 /*ignore if missing */, Logininfo, Success);
                if (!Success) Println(activeProcess.At_Errors);
            }

            Cachedaccounts = Delete(Cachedaccounts, 2, Spot, 0);
            Cachedaccounts = Delete(Cachedaccounts, 1, Spot, 0);

            At_Session.Item('CACHEDACCOUNTS', Cachedaccounts);
        }
    }

    At_Session.Item('ATTACHEDDATABASE', '');

    // Try internal attach
    if (await asyncAttach('')); else Println(activeProcess.At_Errors);
    clearSelect(odbActiveSelectList);

    if (System(1) == 'js') window.saveAtSession();
}
// </DETACHDB_Sub>

// <RPC_DB_Sub>
async function JSB_ODB_RPC_DB_Sub() {
}
// </RPC_DB_Sub>

// <RPC_LOGIN>
async function JSB_ODB_RPC_LOGIN(Httpaddress, _Username, Password, Initialdb) {
    // local variables
    var Errors;

    var Key = (LCase(Change(Httpaddress, vm, '**') + '&&' + CStr(_Username) + '&&' + CStr(Initialdb)));
    await JSB_ODB_RPC_DROPOLDCACHE_Sub();

    var Loginkey = At_Session.Item('RPC_CACHED_LOGINS')[Key];
    if (Loginkey) {
        At_Session.Item('RPC_LAST_ADDRESS', Loginkey);
        return Loginkey;
    }

    await JSB_ODB_RPC_SHOWSTATUS('RPC Login: ' + CStr(_Username));
    var Success = await JSB_BF_RPC(CStr(Httpaddress), At_Session.Item('SERVER_RPCSID'), 'serverlogin', _Username, Password, Initialdb, Errors, undefined, undefined, undefined, function (__Username, _Password, _Initialdb, _Errors) { _Username = __Username; Password = _Password; Initialdb = _Initialdb; Errors = _Errors });
    if (!Success) {
        await JSB_ODB_RPC_SHOWSTATUS('XLogin Failed: ' + await JSB_ODB_RPC_ERROR(CStr(Errors)));
        return '';
    }

    var Sid = At_Session.Item('LASTGET_RPCSID_');
    if (Not(Sid)) {
        if (InStr1(1, Errors, '-')) Sid = Field(Errors, '-', 1);
    }

    if (Not(Sid)) Sid = 'rpc:none';
    Loginkey = CStr(Httpaddress) + vm + Sid;
    At_Session.Item('RPC_CACHED_LOGINS')[Key] = Loginkey;
    At_Session.Item('RPC_LAST_ADDRESS', Loginkey);
    return Loginkey;
}
// </RPC_LOGIN>

// <RPC_ERROR>
async function JSB_ODB_RPC_ERROR(Errors) {
    if (Errors) activeProcess.At_Errors = Errors;
    return activeProcess.At_Errors;
}
// </RPC_ERROR>

// <RPC_OPEN_Sub>
async function JSB_ODB_RPC_OPEN_Sub(Logininfo, Dictdata, Fname, ByRef_Fhandle, ByRef_Success, setByRefValues) {
    // local variables
    var Filemeta, Rfhandle, Errors;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Fhandle, ByRef_Success)
        return v
    }
    if (!Dictdata) Dictdata = 'data';
    var Key = (LCase(Change(Logininfo, vm, '&&') + '&&' + Dictdata + '&&' + CStr(Fname)));

    await JSB_ODB_RPC_DROPOLDCACHE_Sub();

    if (CBool(At_Session.Item('RPC_CACHED_OPENS')[Key])) {
        Filemeta = At_Session.Item('RPC_CACHED_OPENS')[Key];
        ByRef_Success = Filemeta.Success;
        Rfhandle = Filemeta.rfHandle;
        if ((!ByRef_Success)) Errors = Filemeta.Errors;
    } else {
        ByRef_Success = await JSB_BF_RPC(Extract(Logininfo, 1, 1, 0), Extract(Logininfo, 1, 2, 0), 'serveropen', Dictdata, Fname, Rfhandle, Errors, undefined, undefined, undefined, function (_Dictdata, _Fname, _Rfhandle, _Errors) { Dictdata = _Dictdata; Fname = _Fname; Rfhandle = _Rfhandle; Errors = _Errors });
        await JSB_ODB_RPC_SHOWSTATUS('RPC Open' + (ByRef_Success ? ': ' : 'Failed: ') + CStr(Fname));
        At_Session.Item('RPC_CACHED_OPENS')[Key] = { "Success": ByRef_Success, "rfHandle": Rfhandle, "Errors": Errors, "Timer": Timer() }
    }

    if (ByRef_Success) ByRef_Fhandle = '@rpc.' + CStr(Logininfo) + am + CStr(Rfhandle); else ByRef_Fhandle = await JSB_ODB_RPC_ERROR(CStr(Errors));
    return exit();
}
// </RPC_OPEN_Sub>

// <RPC_CREATEFILE_Sub>
async function JSB_ODB_RPC_CREATEFILE_Sub(Logininfo, Fname, ByRef_Fhandle, ByRef_Success, setByRefValues) {
    // local variables
    var Errors;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Fhandle, ByRef_Success)
        return v
    }
    ByRef_Success = await JSB_BF_RPC(Extract(Logininfo, 1, 1, 0), Extract(Logininfo, 1, 2, 0), 'servercreatefile', Fname, ByRef_Fhandle, Errors, undefined, undefined, undefined, undefined, function (_Fname, _ByRef_Fhandle, _Errors) { Fname = _Fname; ByRef_Fhandle = _ByRef_Fhandle; Errors = _Errors });
    if (ByRef_Success) ByRef_Fhandle = '@rpc.' + CStr(Logininfo) + am + CStr(ByRef_Fhandle); else ByRef_Fhandle = Errors;
    return exit();
}
// </RPC_CREATEFILE_Sub>

// <RPC_PRIMARYKEYNAME_Sub>
async function JSB_ODB_RPC_PRIMARYKEYNAME_Sub(Fhandle, ByRef_Result, ByRef_Success, setByRefValues) {
    // local variables
    var Errors;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Result, ByRef_Success)
        return v
    }
    ByRef_Success = await JSB_BF_RPC(Extract(Fhandle, 1, 1, 0), Extract(Fhandle, 1, 2, 0), 'serverprimarykeyname', Extract(Fhandle, 2, 0, 0), ByRef_Result, Errors, undefined, undefined, undefined, undefined, function (_P4, _ByRef_Result, _Errors) { ByRef_Result = _ByRef_Result; Errors = _Errors });
    if (!ByRef_Success) activeProcess.At_Errors = Errors;
    return exit();
}
// </RPC_PRIMARYKEYNAME_Sub>

// <RPC_READJSON_Sub>
async function JSB_ODB_RPC_READJSON_Sub(ByRef_Item, Fhandle, Iname, ByRef_Success, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item, ByRef_Success)
        return v
    }
    var Sitem = '';
    await JSB_ODB_RPC_READX_Sub(Sitem, CStr(Fhandle), CStr(Iname), ByRef_Success, 'JSon', function (_Sitem, _ByRef_Success) { Sitem = _Sitem; ByRef_Success = _ByRef_Success });
    if ((Left(Sitem, 1) == '{' || Left(Sitem, 1) == '[') && ByRef_Success) ByRef_Item = parseJSON(Sitem);
    return exit();
}
// </RPC_READJSON_Sub>

// <RPC_READJSONU_Sub>
async function JSB_ODB_RPC_READJSONU_Sub(ByRef_Item, Fhandle, Iname, ByRef_Success, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item, ByRef_Success)
        return v
    }
    var Sitem = '';
    await JSB_ODB_RPC_READX_Sub(Sitem, CStr(Fhandle), CStr(Iname), ByRef_Success, 'JSonU', function (_Sitem, _ByRef_Success) { Sitem = _Sitem; ByRef_Success = _ByRef_Success });
    if ((Left(Sitem, 1) == '{' || Left(Sitem, 1) == '[') && ByRef_Success) ByRef_Item = parseJSON(Sitem);
    return exit();
}
// </RPC_READJSONU_Sub>

// <RPC_READXML_Sub>
async function JSB_ODB_RPC_READXML_Sub(ByRef_Item, Fhandle, Iname, ByRef_Success, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item, ByRef_Success)
        return v
    }
    await JSB_ODB_RPC_READX_Sub(ByRef_Item, CStr(Fhandle), CStr(Iname), ByRef_Success, 'XML', function (_ByRef_Item, _ByRef_Success) { ByRef_Item = _ByRef_Item; ByRef_Success = _ByRef_Success });
    if (Left(ByRef_Item, 1) == '\<' && ByRef_Success) ByRef_Item = parseXML(ByRef_Item);
    return exit();
}
// </RPC_READXML_Sub>

// <RPC_READXMLU_Sub>
async function JSB_ODB_RPC_READXMLU_Sub(ByRef_Item, Fhandle, Iname, ByRef_Success, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item, ByRef_Success)
        return v
    }
    await JSB_ODB_RPC_READX_Sub(ByRef_Item, CStr(Fhandle), CStr(Iname), ByRef_Success, 'XMLU', function (_ByRef_Item, _ByRef_Success) { ByRef_Item = _ByRef_Item; ByRef_Success = _ByRef_Success });
    if (Left(ByRef_Item, 1) == '\<' && ByRef_Success) ByRef_Item = parseXML(ByRef_Item);
    return exit();
}
// </RPC_READXMLU_Sub>

// <RPC_READ_Sub>
async function JSB_ODB_RPC_READ_Sub(ByRef_Item, Fhandle, Iname, ByRef_Success, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item, ByRef_Success)
        return v
    }
    await JSB_ODB_RPC_READX_Sub(ByRef_Item, CStr(Fhandle), CStr(Iname), ByRef_Success, '', function (_ByRef_Item, _ByRef_Success) { ByRef_Item = _ByRef_Item; ByRef_Success = _ByRef_Success });
    return exit();
}
// </RPC_READ_Sub>

// <RPC_READU_Sub>
async function JSB_ODB_RPC_READU_Sub(ByRef_Item, Fhandle, Iname, ByRef_Success, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item, ByRef_Success)
        return v
    }
    await JSB_ODB_RPC_READX_Sub(ByRef_Item, CStr(Fhandle), CStr(Iname), ByRef_Success, 'U', function (_ByRef_Item, _ByRef_Success) { ByRef_Item = _ByRef_Item; ByRef_Success = _ByRef_Success });
    return exit();
}
// </RPC_READU_Sub>

// <RPC_READX_Sub>
async function JSB_ODB_RPC_READX_Sub(ByRef_Item, Fhandle, Iname, ByRef_Success, Rtype, setByRefValues) {
    // local variables
    var Errors;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item, ByRef_Success)
        return v
    }
    ByRef_Item = '';

    await JSB_ODB_RPC_DROPOLDCACHE_Sub();

    var Key = (LCase(Change(Fhandle, vm, '**') + '&&' + CStr(Iname)));

    if (CBool(At_Session.Item('RPC_CACHED_ITEMS')[Key]) && Right(Rtype, 1) != 'U') {
        ByRef_Success = true;
        ByRef_Item = At_Session.Item('RPC_CACHED_ITEMS')[Key];
        At_Session.Item('RPC_CACHED_TIMER')[Key] = Timer();
        return exit(undefined);
    }

    await JSB_ODB_RPC_SHOWSTATUS('RPC Read' + CStr(Rtype) + ':' + CStr(Iname));
    ByRef_Success = await JSB_BF_RPC(Extract(Fhandle, 1, 1, 0), Extract(Fhandle, 1, 2, 0), 'serverread' + LCase(Rtype), ByRef_Item, Extract(Fhandle, 2, 0, 0), Iname, Errors, undefined, undefined, undefined, function (_ByRef_Item, _P5, _Iname, _Errors) { ByRef_Item = _ByRef_Item; Iname = _Iname; Errors = _Errors });
    if (!ByRef_Success) activeProcess.At_Errors = Errors;
    if (CBool(Errors)) {
        await JSB_ODB_RPC_SHOWSTATUS('RPC Read Failed:' + await JSB_ODB_RPC_ERROR(CStr(Errors)));
        Fhandle = Errors;
        return exit(undefined);
    }

    At_Session.Item('RPC_CACHED_ITEMS')[Key] = ByRef_Item;
    At_Session.Item('RPC_CACHED_TIMER')[Key] = Timer();

    return exit();
}
// </RPC_READX_Sub>

// <RPC_READV_Sub>
async function JSB_ODB_RPC_READV_Sub(ByRef_Item, Fhandle, Iname, Atrno, ByRef_Success, setByRefValues) {
    // local variables
    var Errors;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item, ByRef_Success)
        return v
    }
    ByRef_Item = '';
    await JSB_ODB_RPC_DROPOLDCACHE_Sub();
    var Key = (LCase(Change(Fhandle, vm, '**') + '&&' + CStr(Iname)));

    if (CBool(At_Session.Item('RPC_CACHED_ITEMS')[Key])) {
        ByRef_Success = true;
        ByRef_Item = At_Session.Item('RPC_CACHED_ITEMS')[Key];
        ByRef_Item = Extract(ByRef_Item, Atrno, 0, 0);
        At_Session.Item('RPC_CACHED_TIMER')[Key] = Timer();
        return exit(undefined);
    }

    ByRef_Success = await JSB_BF_RPC(Extract(Fhandle, 1, 1, 0), Extract(Fhandle, 1, 2, 0), 'serverreadv', ByRef_Item, Extract(Fhandle, 2, 0, 0), Iname, Atrno, Errors, undefined, undefined, function (_ByRef_Item, _P5, _Iname, _Atrno, _Errors) { ByRef_Item = _ByRef_Item; Iname = _Iname; Atrno = _Atrno; Errors = _Errors });
    if (CBool(Errors)) await JSB_ODB_RPC_ERROR(CStr(Errors)); else await JSB_ODB_RPC_SHOWSTATUS('RPC ReadV:' + CStr(Iname));
    return exit();
}
// </RPC_READV_Sub>

// <RPC_READVU_Sub>
async function JSB_ODB_RPC_READVU_Sub(ByRef_Item, Fhandle, Iname, Atrno, ByRef_Success, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Item, ByRef_Success)
        return v
    }
    ByRef_Item = '';
    var Key = (LCase(Change(Fhandle, vm, '**') + '&&' + CStr(Iname)));
    if (At_Session.Item('RPC_CACHED_ITEMS')) {
        delete At_Session.Item('RPC_CACHED_ITEMS')[Key]
        delete At_Session.Item('RPC_CACHED_TIMER')[Key];
    }

    var Errors = '';
    ByRef_Success = await JSB_BF_RPC(Extract(Fhandle, 1, 1, 0), Extract(Fhandle, 1, 2, 0), 'serverreadvu', ByRef_Item, Extract(Fhandle, 2, 0, 0), Iname, Atrno, Errors, undefined, undefined, function (_ByRef_Item, _P5, _Iname, _Atrno, _Errors) { ByRef_Item = _ByRef_Item; Iname = _Iname; Atrno = _Atrno; Errors = _Errors });
    if (Errors) await JSB_ODB_RPC_ERROR(CStr(Errors)); else await JSB_ODB_RPC_SHOWSTATUS('RPC ReadVU:' + CStr(Iname));
    return exit();
}
// </RPC_READVU_Sub>

// <RPC_LISTFILES_Sub>
async function JSB_ODB_RPC_LISTFILES_Sub(Httpaddress, ByRef_Result, ByRef_Errors, setByRefValues) {
    // local variables
    var Success;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Result, ByRef_Errors)
        return v
    }
    ByRef_Result = '';
    await JSB_ODB_RPC_DROPOLDCACHE_Sub();
    Success = await JSB_BF_RPC(Extract(Httpaddress, 1, 1, 0), Extract(Httpaddress, 1, 2, 0), 'serverlistfiles', ByRef_Result, ByRef_Errors, undefined, undefined, undefined, undefined, undefined, function (_ByRef_Result, _ByRef_Errors) { ByRef_Result = _ByRef_Result; ByRef_Errors = _ByRef_Errors });
    if (ByRef_Errors) await JSB_ODB_RPC_ERROR(CStr(ByRef_Errors)); else await JSB_ODB_RPC_SHOWSTATUS('RPC ListFiles:');
    return exit();
}
// </RPC_LISTFILES_Sub>

// <RPC_DELETEFILE_Sub>
async function JSB_ODB_RPC_DELETEFILE_Sub(Fhandle, ByRef_Success, setByRefValues) {
    // local variables
    var Ckey, Errors;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Success)
        return v
    }
    var Pkey = (LCase(Change(Fhandle, vm, '**') + '&&'));
    for (Ckey of iterateOver(At_Session.Item('RPC_CACHED_ITEMS'))) {
        if (CBool(Ckey)) {
            if (Left(Ckey, Len(Pkey)) == Pkey) {
                delete At_Session.Item('RPC_CACHED_ITEMS')[Ckey]
                delete At_Session.Item('RPC_CACHED_TIMER')[Ckey];
            }
        }
    }

    ByRef_Success = await JSB_BF_RPC(Extract(Fhandle, 1, 1, 0), Extract(Fhandle, 1, 2, 0), 'serverdeletefile', Extract(Fhandle, 2, 0, 0), Errors, undefined, undefined, undefined, undefined, undefined, function (_P4, _Errors) { Errors = _Errors });
    if (CBool(Errors)) await JSB_ODB_RPC_ERROR(CStr(Errors)); else await JSB_ODB_RPC_SHOWSTATUS('RPC DeleteFile:' + Extract(Fhandle, 2, 0, 0));
    return exit();
}
// </RPC_DELETEFILE_Sub>

// <RPC_CLEARFILE_Sub>
async function JSB_ODB_RPC_CLEARFILE_Sub(Fhandle, ByRef_Success, setByRefValues) {
    // local variables
    var Ckey, Errors;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Success)
        return v
    }
    var Pkey = (LCase(Change(Fhandle, vm, '**') + '&&'));
    await JSB_ODB_RPC_DROPOLDCACHE_Sub();

    for (Ckey of iterateOver(At_Session.Item('RPC_CACHED_ITEMS'))) {
        if (CBool(Ckey)) {
            if (Left(Ckey, Len(Pkey)) == Pkey) {
                delete At_Session.Item('RPC_CACHED_ITEMS')[Ckey]
                delete At_Session.Item('RPC_CACHED_TIMER')[Ckey];
            }
        }
    }

    ByRef_Success = await JSB_BF_RPC(Extract(Fhandle, 1, 1, 0), Extract(Fhandle, 1, 2, 0), 'serverclearfile', Extract(Fhandle, 2, 0, 0), Errors, undefined, undefined, undefined, undefined, undefined, function (_P4, _Errors) { Errors = _Errors });
    if (CBool(Errors)) await JSB_ODB_RPC_ERROR(CStr(Errors)); else await JSB_ODB_RPC_SHOWSTATUS('RPC ClearFile:' + Extract(Fhandle, 2, 0, 0));
    return exit();
}
// </RPC_CLEARFILE_Sub>

// <RPC_DELETEITEM_Sub>
async function JSB_ODB_RPC_DELETEITEM_Sub(Fhandle, Iname, ByRef_Success, setByRefValues) {
    // local variables
    var Errors;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Success)
        return v
    }
    await JSB_ODB_RPC_DROPOLDCACHE_Sub();

    var Key = (LCase(Change(Fhandle, vm, '**') + '&&' + CStr(Iname)));
    if (At_Session.Item('RPC_CACHED_ITEMS')) {
        delete At_Session.Item('RPC_CACHED_ITEMS')[Key]
        delete At_Session.Item('RPC_CACHED_TIMER')[Key];
    }
    ByRef_Success = await JSB_BF_RPC(Extract(Fhandle, 1, 1, 0), Extract(Fhandle, 1, 2, 0), 'serverdeleteitem', Extract(Fhandle, 2, 0, 0), Iname, Errors, undefined, undefined, undefined, undefined, function (_P4, _Iname, _Errors) { Iname = _Iname; Errors = _Errors });
    if (CBool(Errors)) await JSB_ODB_RPC_ERROR(CStr(Errors)); else await JSB_ODB_RPC_SHOWSTATUS('RPC DeleteItem:' + CStr(Iname));
    return exit();
}
// </RPC_DELETEITEM_Sub>

// <RPC_SELECT_Sub>
async function JSB_ODB_RPC_SELECT_Sub(Cols, Fhandle, Whereclause, ByRef_Success, setByRefValues) {
    // local variables
    var Errors, Results;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Success)
        return v
    }
    ByRef_Success = await JSB_BF_RPC(Extract(Fhandle, 1, 1, 0), Extract(Fhandle, 1, 2, 0), 'serverselect', Cols, Extract(Fhandle, 2, 0, 0), Whereclause, Errors, Results, undefined, undefined, function (_Cols, _P5, _Whereclause, _Errors, _Results) { Cols = _Cols; Whereclause = _Whereclause; Errors = _Errors; Results = _Results });
    if (CBool(Errors)) { await JSB_ODB_RPC_ERROR(CStr(Errors)); return exit(undefined); }
    await JSB_ODB_RPC_SHOWSTATUS('RPC Select: ' + Extract(Fhandle, 2, 0, 0) + ' ' + CStr(Whereclause));
    odbActiveSelectList = formList(Results);
    return exit();
}
// </RPC_SELECT_Sub>

// <RPC_SELECTTO_Sub>
async function JSB_ODB_RPC_SELECTTO_Sub(Cols, Fhandle, Whereclause, ByRef_Sl, ByRef_Success, setByRefValues) {
    // local variables
    var Errors, Results;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Sl, ByRef_Success)
        return v
    }
    ByRef_Success = await JSB_BF_RPC(Extract(Fhandle, 1, 1, 0), Extract(Fhandle, 1, 2, 0), 'serverselect', Cols, Extract(Fhandle, 2, 0, 0), Whereclause, Errors, Results, undefined, undefined, function (_Cols, _P5, _Whereclause, _Errors, _Results) { Cols = _Cols; Whereclause = _Whereclause; Errors = _Errors; Results = _Results });
    if (CBool(Errors)) { await JSB_ODB_RPC_ERROR(CStr(Errors)); return exit(undefined); }
    await JSB_ODB_RPC_SHOWSTATUS('RPC SelectTo: ' + Extract(Fhandle, 2, 0, 0) + ' ' + CStr(Whereclause));
    ByRef_Sl = formList(Results);
    return exit();
}
// </RPC_SELECTTO_Sub>

// <RPC_WRITE_Sub>
async function JSB_ODB_RPC_WRITE_Sub(Item, Fhandle, Iname, ByRef_Success, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Success)
        return v
    }
    await JSB_ODB_RPC_WRITEX_Sub(CStr(Item), CStr(Fhandle), CStr(Iname), ByRef_Success, '', function (_ByRef_Success, _P5) { ByRef_Success = _ByRef_Success });
    return exit();
}
// </RPC_WRITE_Sub>

// <RPC_WRITEU_Sub>
async function JSB_ODB_RPC_WRITEU_Sub(Item, Fhandle, Iname, ByRef_Success, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Success)
        return v
    }
    await JSB_ODB_RPC_WRITEX_Sub(CStr(Item), CStr(Fhandle), CStr(Iname), ByRef_Success, 'U', function (_ByRef_Success, _P5) { ByRef_Success = _ByRef_Success });
    return exit();
}
// </RPC_WRITEU_Sub>

// <RPC_WRITEJSON_Sub>
async function JSB_ODB_RPC_WRITEJSON_Sub(Item, Fhandle, Iname, ByRef_Success, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Success)
        return v
    }
    await JSB_ODB_RPC_WRITEX_Sub(CStr(Item, true), CStr(Fhandle), CStr(Iname), ByRef_Success, 'JSon', function (_ByRef_Success, _P5) { ByRef_Success = _ByRef_Success });
    return exit();
}
// </RPC_WRITEJSON_Sub>

// <RPC_WRITEJSONU_Sub>
async function JSB_ODB_RPC_WRITEJSONU_Sub(Item, Fhandle, Iname, ByRef_Success, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Success)
        return v
    }
    await JSB_ODB_RPC_WRITEX_Sub(CStr(Item, true), CStr(Fhandle), CStr(Iname), ByRef_Success, 'JSonU', function (_ByRef_Success, _P5) { ByRef_Success = _ByRef_Success });
    return exit();
}
// </RPC_WRITEJSONU_Sub>

// <RPC_WRITEX_Sub>
async function JSB_ODB_RPC_WRITEX_Sub(Item, Fhandle, Iname, ByRef_Success, ByRef_Wtype, setByRefValues) {
    // local variables
    var Errors;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Success, ByRef_Wtype)
        return v
    }
    await JSB_ODB_RPC_DROPOLDCACHE_Sub();

    await JSB_ODB_RPC_SHOWSTATUS('RPC Write' + CStr(ByRef_Wtype) + ':' + CStr(Iname));
    ByRef_Success = await JSB_BF_RPC(Extract(Fhandle, 1, 1, 0), Extract(Fhandle, 1, 2, 0), 'serverwrite' + LCase(ByRef_Wtype), '0x' + STX(Item), Extract(Fhandle, 2, 0, 0), Iname, Errors, undefined, undefined, undefined, function (_P4, _P5, _Iname, _Errors) { Iname = _Iname; Errors = _Errors });
    if (CBool(Errors)) { await JSB_ODB_RPC_ERROR(CStr(Errors)); return exit(undefined); }

    var Key = (LCase(Change(Fhandle, vm, '**') + '&&' + CStr(Iname)));

    // If the Commit for the WriteU later fails, we need to be sure to invalidate the cache
    At_Session.Item('RPC_CACHED_ITEMS')[Key] = Item;
    At_Session.Item('RPC_CACHED_TIMER')[Key] = Timer();
    return exit();
}
// </RPC_WRITEX_Sub>

// <RPC_SHOWSTATUS>
async function JSB_ODB_RPC_SHOWSTATUS(S) {
    showStatus(S);
}
// </RPC_SHOWSTATUS>

// <RPC_DROPOLDCACHE_Sub>
async function JSB_ODB_RPC_DROPOLDCACHE_Sub() {
    // local variables
    var Ckey, Filemeta;

    if (Not(At_Session.Item('RPC_CACHED_ITEMS'))) { At_Session.Item('RPC_CACHED_ITEMS', {}); }
    if (Not(At_Session.Item('RPC_CACHED_TIMER'))) { At_Session.Item('RPC_CACHED_TIMER', {}); }
    if (Not(At_Session.Item('RPC_CACHED_LOGINS'))) { At_Session.Item('RPC_CACHED_LOGINS', {}); }
    if (Not(At_Session.Item('RPC_CACHED_OPENS'))) { At_Session.Item('RPC_CACHED_OPENS', {}); }

    for (Ckey of iterateOver(At_Session.Item('RPC_CACHED_OPENS'))) {
        if (CBool(Ckey)) {
            Filemeta = At_Session.Item('RPC_CACHED_OPENS')[Ckey];
            // invalid if more than a 30 seconds has passed - or clock has rolled over to a new day
            if (Abs(Timer() - CNum(Filemeta.Timer)) > 30000) {
                delete At_Session.Item('RPC_CACHED_OPENS')[Ckey];
            }
        }
    }

    for (Ckey of iterateOver(At_Session.Item('RPC_CACHED_ITEMS'))) {
        if (CBool(Ckey)) {
            // invalid if more than a second has passed - or clock has rolled over to a new day
            if (Abs(Timer() - CNum(At_Session.Item('RPC_CACHED_TIMER')[Ckey])) > 1000) {
                delete At_Session.Item('RPC_CACHED_ITEMS')[Ckey]
                delete At_Session.Item('RPC_CACHED_TIMER')[Ckey];
            }
        }
    }
}
// </RPC_DROPOLDCACHE_Sub>