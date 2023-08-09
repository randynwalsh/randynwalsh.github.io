
// <THEME_NONE>
async function JSB_THEMES_THEME_NONE(Fromfile, Edppage, Html, Brand) { 
    var  me = new jsbRoutine("JSB_THEMES", "theme_none", "JSB_THEMES_THEME_NONE"); me.localValue = function (varName) { return eval(varName) }
    // local variables
    var Htmlhead, Theme, Menuhtml, Htmltail, Header, Overflow;

    if (CBool(queryVar('inTheme'))) return Html;

    if (CBool(isMobile())) Htmlhead = JSB_HTML_HEAD(CStr(JsLink(CStr(jsbRoot()) + 'js/jquery.keyboard.js')));

    Theme = await JSB_BF_JSBCONFIG('defaultTheme', At_Session.Item('lastTheme')); 
    if (Not(Theme)) Theme = At_Application.Item(JSB_BF_JSBACCOUNT() + '_lastTheme');
    if (Not(Theme)) Theme = 'superhero';

    Htmlhead = CStr(Htmlhead) + JSB_BF_THEME(CStr(Theme)); 

    var Whoami = ''; 
    var Usrname = ''; 

    if (System(1, me)=='js') {
       if (window.server_rpcsid) Usrname = await asyncRpcRequest('USERNAME');
    } else {
       Usrname = JSB_BF_USERNAME();
    }

    if (Usrname) {
       if (CBool(await asyncRpcRequest('ISADMIN'))) {
          Whoami = JSB_HTML_ANCHOR('off', Usrname + ' [Admin]'); ;
       } else if (CBool(await asyncRpcRequest('ISDIRECTOR'))) {
          Whoami = JSB_HTML_ANCHOR('off', Usrname + ' [Director]'); ;
       } else if (CBool(await asyncRpcRequest('ISMANAGER'))) {
          Whoami = JSB_HTML_ANCHOR('off', Usrname + ' [Manager]'); ;
       } else if (await JSB_BF_ISCLERK()) {
          Whoami = JSB_HTML_ANCHOR('off', Usrname + ' [Clerk]'); ;
       } else if (CBool(await asyncRpcRequest('ISEMPLOYEE'))) {
          Whoami = JSB_HTML_ANCHOR('off', Usrname + ' [Employee]'); ;
       } else if (CBool(await asyncRpcRequest('ISAUTHENTICATED'))) {
          Whoami = JSB_HTML_ANCHOR('off', Usrname); ;
       } else {
          Whoami = JSB_HTML_ANCHOR(CStr(await asyncRpcRequest('LOGINURL')), 'Login');
       }
    }

    // Get JsonMenu
    var Whichmenu = Fromfile + '.Project_Menus'; 
    var _Jsonmenu = {}; 
    await asyncCallByName(Whichmenu, me, 1 /*ignore if missing */, _Jsonmenu, Edppage); 

    // Menu?
    if (Len(_Jsonmenu)) {
       if (Not(isMobile()) && Whoami) {
          _Jsonmenu.rightAlign = true; // Only One Of These Can Be Placed In The Code
          _Jsonmenu.htmlText1 = Whoami;
       }

       Menuhtml = JSB_HTML_MENUBAR(_Jsonmenu, '', true, false, '30px', {"Center":false}); 
       Htmltail = JSB_BF_GENEVENTHANDLER('SelectMenu', JSB_BF_JSBRESTCALL('{!id}'), 12, '');
    } else {
       if (Brand) { Header = CStr(Header) + JSB_BF_HTML('\<div id="Headerbrand" style="position: absolute; left: 7em; top: 0px; font-family: roboto; font-size: 1.3em; opacity: .5; overflow-x: hidden;"\>') + Brand + JSB_BF_HTML('\</div\>'); }
       if (Whoami) { Header = CStr(Header) + JSB_BF_HTML('\<div id="whoami" style="position: absolute; right: 7em; top: 0px; font-family: roboto; font-size: 1.3em; opacity: .5; overflow-x: hidden;"\>') + Whoami + JSB_BF_HTML('\</div\>'); }
       Overflow = 'overflow-y: hidden';
    }

    Html = JSB_HTML_ROWS2('30px', CStr(Header), '%', Html, Overflow, 'overflow-x: none; overflow-y:auto; padding-left: 15px; padding-right: 15px'); 

    if (CBool(isMobile())) Html = JSB_HTML_HEAD(CStr(JsLink(CStr(jsbRoot()) + 'js/jquery.keyboard.js'))) + Html;
    return CStr(Htmlhead) + Html + CStr(Htmltail); 
}
// </THEME_NONE>
