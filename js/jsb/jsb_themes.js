
// <THEME_NONE>
async function JSB_THEMES_THEME_NONE(Fromfile, Edppage, Html, Brand) {
    // local variables
    var Menuhtml, Htmltail, Header, Overflow;

    if (CBool(queryVar('inTheme'))) return Html;

    var Htmlhead = ''; var Theme = '';

    if (CBool(isMobile())) Htmlhead = Head(JsLink(jsbRoot() + 'js/jquery.keyboard.js'));

    Theme = await JSB_BF_JSBCONFIG('defaultTheme', At_Session.Item('lastTheme'));
    if (Not(Theme)) Theme = At_Application.Item(jsbAccount() + '_lastTheme');
    if (Not(Theme)) Theme = 'superhero';

    Htmlhead += JSB_BF_THEME(Theme);

    var Whoami = '';
    var Usrname = '';

    if (System(1) == 'js') {
        if (window.server_rpcsid && window.myRpcUrl) Usrname = await asyncRpcRequest('USERNAME');
    } else {
        Usrname = UserName();
    }

    if (Usrname) {
        if (CBool(await asyncRpcRequest('ISADMIN'))) {
            Whoami = Anchor('off', Usrname + ' [Admin]');;
        } else if (CBool(await asyncRpcRequest('ISDIRECTOR'))) {
            Whoami = Anchor('off', Usrname + ' [Director]');;
        } else if (CBool(await asyncRpcRequest('ISMANAGER'))) {
            Whoami = Anchor('off', Usrname + ' [Manager]');;
        } else if (await JSB_BF_ISCLERK()) {
            Whoami = Anchor('off', Usrname + ' [Clerk]');;
        } else if (CBool(await asyncRpcRequest('ISEMPLOYEE'))) {
            Whoami = Anchor('off', Usrname + ' [Employee]');;
        } else if (CBool(await asyncRpcRequest('ISAUTHENTICATED'))) {
            Whoami = Anchor('off', Usrname);;
        } else {
            Whoami = Anchor(CStr(await asyncRpcRequest('LOGINURL')), 'Login');
        }
    }

    // Get JsonMenu
    var Whichmenu = CStr(Fromfile) + '.Project_Menus';
    var Jsonmenu = {};
    await asyncCallByName(Whichmenu, me, 1 /*ignore if missing */, Jsonmenu, Edppage);

    // Menu?
    if (Len(Jsonmenu)) {
        if (Not(isMobile()) && Whoami) {
            Jsonmenu.rightAlign = true; // Only One Of These Can Be Placed In The Code
            Jsonmenu.htmlText1 = Whoami;
        }

        Menuhtml = MenuBar(Jsonmenu, '', true, false, '30px', { "Center": false });
        Htmltail = genEventHandler('SelectMenu', jsbRestCall('{!id}'), 12, '');
    } else {
        if (Brand) { Header = CStr(Header) + html('\<div id="Headerbrand" style="position: absolute; left: 7em; top: 0px; font-family: roboto; font-size: 1.3em; opacity: .5; overflow-x: hidden;"\>') + CStr(Brand) + html('\</div\>'); }
        if (Whoami) { Header += html('\<div id="whoami" style="position: absolute; right: 7em; top: 0px; font-family: roboto; font-size: 1.3em; opacity: .5; overflow-x: hidden;"\>') + Whoami + html('\</div\>'); }
        Overflow = 'overflow-y: hidden';
    }

    Html = JSB_HTML_ROWS2('30px', CStr(Header), '%', CStr(Html), Overflow, 'overflow-x: none; overflow-y:auto; padding-left: 15px; padding-right: 15px');

    if (CBool(isMobile())) Html = Head(JsLink(jsbRoot() + 'js/jquery.keyboard.js')) + Html;
    return Htmlhead + Html + CStr(Htmltail);
}
// </THEME_NONE>