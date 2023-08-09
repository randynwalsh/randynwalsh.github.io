anonymousFunc = function () {
window.cachedFileNames["jsb_themes"] = "jsb_themes"
if (!window.cached_jsb_themes) window.cached_jsb_themes = {}

var z="function Theme_none(ByVal FromFile As String, ByVal edpPage As String, Byval Html As String, optional byval Brand As String) As String\xFE";
 z+="\xFE";
 z+="    If @QueryVar('inTheme') Then Return HTML\xFE";
 z+="    \xFE";
 z+="    If isMobile() Then HtmlHead = @Head(@JsLink(@jsbRoot:`js/jquery.keyboard.js`))\xFE";
 z+="\xFE";
 z+="    Theme = jsbConfig(\"defaultTheme\", @Session['lastTheme'])\xFE";
 z+="    if !Theme Then Theme = @application[@jsbAccount:\"_lastTheme\"]\xFE";
 z+="    if !Theme Then Theme = \"superhero\"    \xFE";
 z+="    \xFE";
 z+="    HtmlHead := @Jsb_bf.Theme(Theme)\xFE";
 z+="    \xFE";
 z+="    Dim WhoAmI As String = \"\"\xFE";
 z+="    Dim UsrName As String = \"\"\xFE";
 z+="\xFE";
 z+="    If System(1) = \"js\" Then\xFE";
 z+="        if window.server_rpcsid Then UsrName = @@UserName\xFE";
 z+="    Else\xFE";
 z+="        UsrName = @UserName\xFE";
 z+="    End If\xFE";
 z+="    \xFE";
 z+="    if UsrName Then\xFE";
 z+="        If @@IsAdmin Then\xFE";
 z+="            WhoAmI = @Anchor('off', UsrName:\" [Admin]\")\xFE";
 z+="    \xFE";
 z+="        ElseIf @@IsDirector Then\xFE";
 z+="            WhoAmI = @Anchor('off', UsrName:\" [Director]\")\xFE";
 z+="    \xFE";
 z+="        ElseIf @@IsManager Then\xFE";
 z+="            WhoAmI = @Anchor('off', UsrName:\" [Manager]\")\xFE";
 z+="    \xFE";
 z+="        ElseIf @IsClerk Then\xFE";
 z+="            WhoAmI = @Anchor('off', UsrName:\" [Clerk]\")\xFE";
 z+="    \xFE";
 z+="        ElseIf @@IsEmployee Then\xFE";
 z+="            WhoAmI = @Anchor('off', UsrName:\" [Employee]\")\xFE";
 z+="    \xFE";
 z+="        ElseIf @@IsAuthenticated Then\xFE";
 z+="            WhoAmI = @Anchor('off', UsrName)\xFE";
 z+="    \xFE";
 z+="        Else\xFE";
 z+="            WhoAmI = @Anchor(@@LoginUrl, \"Login\")\xFE";
 z+="        End If\xFE";
 z+="    End If\xFE";
 z+="    \xFE";
 z+="    * Get JsonMenu\xFE";
 z+="    Dim whichMenu As String = FromFile:\".Project_Menus\"\xFE";
 z+="    Dim JsonMenu As JSON = {}\xFE";
 z+="    Call @?whichMenu(JsonMenu, edpPage)\xFE";
 z+="\xFE";
 z+="    // Menu?\xFE";
 z+="    If Len(JsonMenu) Then \xFE";
 z+="        If !isMobile() And WhoAmI Then\xFE";
 z+="            JsonMenu.rightAlign = True; * Only One Of These Can Be Placed In The Code\xFE";
 z+="            JsonMenu.htmlText1 = WhoAmI\xFE";
 z+="        End If\xFE";
 z+="    \xFE";
 z+="        menuHtml = MenuBar(JsonMenu, '', True, False, \"30px\", { Center: False } )\xFE";
 z+="        HtmlTail = @genEventHandler(\"SelectMenu\", @jsbRestCall(\"{!id}\"), 12, \"\")\xFE";
 z+="    Else\xFE";
 z+="        If Brand Then  Header := @Html(`<div id=\"Headerbrand\" style=\"position: absolute; left: 7em; top: 0px; font-family: roboto; font-size: 1.3em; opacity: .5; overflow-x: hidden;\">`):Brand:@Html(`</div>`)\xFE";
 z+="        If WhoAmI Then Header := @Html(`<div id=\"whoami\" style=\"position: absolute; right: 7em; top: 0px; font-family: roboto; font-size: 1.3em; opacity: .5; overflow-x: hidden;\">`):WhoAmI:@Html(`</div>`)\xFE";
 z+="        overFlow = \"overflow-y: hidden\"\xFE";
 z+="    End If\xFE";
 z+="    \xFE";
 z+="    Html = @Rows2(\"30px\", Header, \"%\", Html, overflow, \"overflow-x: none; overflow-y:auto; padding-left: 15px; padding-right: 15px\")\xFE";
 z+="    \xFE";
 z+="    If isMobile() Then Html = @Head(@JsLink(@jsbRoot:`js/jquery.keyboard.js`)):Html\xFE";
 z+="    Return HtmlHead:Html:HtmlTail\xFE";
 z+="End function\xFE";
 z+="\xFE";
 z+=""
window.cached_jsb_themes["theme_none"]=z;
}
anonymousFunc()
anonymousFunc = null