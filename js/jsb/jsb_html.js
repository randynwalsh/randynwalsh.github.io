
// <ACCORDION>
function Accordion(Txtheader, Content, Startopen, Footerpanel) {
    var Isexpanded = '';
    var Uniqueid = '';

    if (Startopen) Isexpanded = ' in'; else Isexpanded = '';
    if (Footerpanel) Footerpanel = '\<div class="panel-footer"\>' + Chr(29) + CStr(Footerpanel) + Chr(28) + '\</div\>';

    Uniqueid = JSB_BF_NEWGUID();
    return Chr(28) + '\<div class="panel-group"\>\r\n\
      \<div class="panel panel-default"\>\r\n\
        \<div class="panel-heading"\>\r\n\
          \<h4 class="panel-title"\>\r\n\
            \<a class="accordian" data-toggle="collapse" href="#' + Uniqueid + '"\>' + Chr(29) + CStr(Txtheader) + Chr(28) + '\</a\>\r\n\
          \</h4\>\r\n\
        \</div\>\r\n\
        \<div id="' + Uniqueid + '" class="panel-collapse collapse' + Isexpanded + '"\>\r\n\
          \<div class="panel-body"\>' + Chr(29) + CStr(Content) + Chr(28) + '\</div\>\r\n\
          ' + Footerpanel + '\r\n\
        \</div\>\r\n\
      \</div\>\r\n\
    \</div\>' + Chr(29);

}
// </ACCORDION>

// <ACEEDITOR>
function AceEditor(Id, Defaultvalue, Startonlineno) {
    var _Html = '';

    if (!Startonlineno) Startonlineno = 1;

    var Needload = true;
    if (System(1) == 'js') {
        if (window.ace) Needload = false;
    }
    if (Needload) {
        _Html = Head(JsLink(jsbRoot() + 'js/aceeditor/ace.js'));
        _Html += Head(JsLink(jsbRoot() + 'js/aceeditor/theme-chrome.js'));
        _Html += Head(JsLink(jsbRoot() + 'js/aceeditor/ext-language_tools.js'));
    }

    _Html += Chr(28) + '\r\n\
      \<input id="' + CStr(Id) + '_lineNo" name="' + CStr(Id) + '_lineNo" type="hidden" /\>\r\n\
      \<textarea id="' + CStr(Id) + '" name="' + CStr(Id) + '" style="display: none" autocomplete="offItGoes" autocorrect="off" autocapitalize="off" spellcheck="false"\>\</textarea\> \r\n\
      \<div id="ace_' + CStr(Id) + '" class="aces" style="display: none"\>' + CStr(Defaultvalue) + '\</div\> \r\n\
      \<style type="text/css" media="screen"\> \r\n\
         .aces { position: absolute; left: 0; right: 0; top: 0; bottom: 0; } \r\n\
      \</style\> \r\n\
      \<script type="text/javascript"\> \r\n\
        $(document).ready(function () {\r\n\
            setupAce("' + CStr(Id) + '", ' + CStr(Startonlineno) + ')\r\n\
        });\r\n\
      \</script\>\r\n\
   ' + Chr(29);
    return _Html;

}
// </ACEEDITOR>

// <JSLINK>
function JsLink(Url) {
    if (Left(Url, 5) == 'file:' && System(1) == 'aspx') {
        if (InStr1(1, Url, 'jsb/js/')); else if (InStr1(1, Url, '/js/')) {
            Url = Change(Url, '/js/', '/jsb/js/');;
        } else if (Left(Url, 3) == 'js/') {
            Url = 'jsb/js/' + Mid1(Url, 4);;
        } else if (!InStr1(1, Url, '/jsb/') && !InStr1(1, Url, '\\jsb\\')) {
            Url = jsbRoot() + 'jsb/js/' + Url;
        }
    } else {
        if (!InStr1(1, Url, '/') && !InStr1(1, Url, '\\')) Url = jsbRoot() + 'js/' + Url;
    }

    return Chr(28) + '\<script src=' + jsEscapeHREF(Url) + '\>\</script\>' + crlf + Chr(29);
}
// </JSLINK>

// <JSON2TABLE>
function JSB_HTML_JSON2TABLE(Id, Jsarray, Classnameorattributes) {
    return jsonArray2table(Id, Jsarray, Classnameorattributes);
}
// </JSON2TABLE>

// <JSONARRAY2TABLE>
function jsonArray2table(Id, Jsarray, Classnameorattributes) {
    var Header = undefined;
    var Trs = undefined;
    var Ths = undefined;
    var Tds = undefined;
    var Row = undefined;
    var Row1 = '';
    var Tag = '';

    if (CBool(isArray(Id))) {
        Classnameorattributes = Jsarray;
        Jsarray = Id;
        Id = '';
    }

    Trs = [undefined,];
    Ths = [undefined,];
    if (!Len(Jsarray)) return;
    Row1 = Jsarray[1];

    Trs[Trs.length] = html('\<thead style=\'background-color: rgb(50%,50%,50%);\'\>');
    for (Tag of iterateOver(Row1)) {
        Ths[Ths.length] = JSB_HTML_TH(CStr(Tag));
    }
    Trs[Trs.length] = JSB_HTML_TR(CStr(Ths));
    Trs[Trs.length] = html('\</thead\>');

    Trs[Trs.length] = html('\<tbody\>');
    for (Row of iterateOver(Jsarray)) {
        Tds = [undefined,];
        for (Tag of iterateOver(Row1)) {
            Tds[Tds.length] = JSB_HTML_TD(CStr(Row[Tag]));
        }
        Trs[Trs.length] = JSB_HTML_TR(CStr(Tds));
    }
    Trs[Trs.length] = html('\</tbody\>');

    Header = [undefined,];
    Header[Header.length] = CssLink(jsbRoot() + 'js/bootstrap-table/bootstrap-table.css');
    Header[Header.length] = JsLink(jsbRoot() + 'js/bootstrap-table/bootstrap-table.js');
    Header[Header.length] = JsLink(jsbRoot() + 'js/bootstrap-table/extensions/mobile/bootstrap-table-mobile.js');

    return Join(Header, '') + JSB_HTML_TABLE(CStr(Id), Trs, Classnameorattributes);
}
// </JSONARRAY2TABLE>

// <JSONMENU>
function JSB_HTML_JSONMENU(Id, Staticmenu) {
    var _Html = '';

    if (Staticmenu === undefined) {
        Staticmenu = Id;
        Id = JSB_BF_NEWGUID();
    }

    _Html = html('\<span id=\'' + Id + '\'\>menu view\</span\>');
    if (isJSON(Staticmenu)) {
        _Html += JSB_HTML_SCRIPT('$(\'#' + Id + '\').html(jsonMenu(' + CStr(Staticmenu) + ', false));');
    }

    return _Html;
}
// </JSONMENU>

// <JSONTREE>
function JSONTree(Id, Statictree, Dynamicurl) {
    var _Html = '';
    var Onsuccess = '';
    var Onfailure = '';

    if (Statictree === undefined) {
        Statictree = parseJSON(Id);
        Id = JSB_BF_NEWGUID();
    }

    _Html = html('\<span id=\'' + Id + '\'\>tree view\</span\>');
    if (isJSON(Statictree)) {
        _Html += JSB_HTML_SCRIPT('$(\'#' + Id + '\').html(jsonTree(' + CStr(Statictree) + ', false));');
    }

    if (Dynamicurl) {
        // Load by AJAX
        Onsuccess = '$(\'#' + Id + '\').html(jsonTree(json))';
        Onfailure = 'alert(\'failed treeview load ajax call to \' + ' + jsEscapeString(CStr(Dynamicurl)) + ' + \'; error: \' + textStatus)';
        _Html += JSB_HTML_SCRIPT('\r\n\
            function ' + Id + '_refresh() {\r\n\
                ' + CStr(ajax(jsEscapeHREF(CStr(Dynamicurl)), Onsuccess, Onfailure)) + '\r\n\
            }\r\n\
            ' + (Statictree ? '' : Id + '_refresh();') + '\r\n\
        ');
    }

    return _Html;
}
// </JSONTREE>

// <KNOB>
function Knob(Id, Defaultvalue, Readonly, Additionalattributes, Minvalue, Maxvalue, Size, _Color) {
    var _Html = '';
    var Ct = '';
    var Onchange = '';
    var Onrelease = '';
    var Aa = '';

    _Html = Head(JsLink(jsbRoot() + 'js/knob.js'));

    if (Readonly) Ct = 'KNOB_ReadOnly'; else Ct = 'KNOB';
    Aa = joinAttributes(JSB_BF_MERGEATTRIBUTE('class', Ct, ' ', Aa));

    if (Readonly) {
        _Html += Chr(28) + '\<input id=\'' + CStr(Id) + '\' tabindex=\'-1\' name=\'' + CStr(Id) + '\' readonly ' + Aa;
    } else {
        _Html += Chr(28) + '\<input id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\' ' + Aa;
    }

    _Html += ' value="' + CStr(CNum(Defaultvalue)) + '"';
    if (Size) _Html += ' data-width="' + CStr(Size) + '"';
    if (Minvalue) _Html += ' data-min="' + CStr(Minvalue) + '"';
    if (Maxvalue) _Html += ' data-max="' + CStr(Maxvalue) + '"';
    if (_Color) _Html += ' data-fgColor="' + CStr(_Color) + '"';
    _Html += ' data-cursor=true data-linecap=round /\>' + Chr(29);

    Onchange = hasAttribute('onchange', Additionalattributes);
    Onrelease = hasAttribute('onrelease', Additionalattributes);
    if (Onchange) { Onchange = 'change: function (v) { ' + Onchange + ' }'; } else Onchange = '';
    if (Onrelease) { Onrelease = 'release: function (v) { ' + Onrelease + ' }'; } else Onrelease = '';
    if (Onchange && Onrelease) Onchange += ',';

    _Html += JSB_HTML_SCRIPT('$("#' + CStr(Id) + '").knob({ ' + Onchange + Onrelease + ' })');
    return _Html;

}
// </KNOB>

// <LABEL>
function Label(Labeltext, Forid, Additionalattributes) {
    var _Html = '';

    if (Additionalattributes === undefined) {
        if (isJSON(Forid) || InStr1(1, Forid, '=')) {
            Additionalattributes = Forid;
            Forid = '';
        } else {
            Additionalattributes = [undefined, 'style=\'width:200px;\''];
        }
    }

    _Html = Chr(28) + '\<label ';
    if (CBool(Forid)) _Html += ' id=\'lbl_' + CStr(Forid) + '\' for=\'' + CStr(Forid) + '\'';
    _Html += ' ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'Label form-control-label', ' ', Additionalattributes), ' ');
    if (Labeltext) Labeltext = CStr(Labeltext) + ':';
    _Html += '\>' + Change(Change(htmlEscape(Language(Labeltext)), Chr(255), '\<br /\>'), Chr(13), '\<br /\>') + '&nbsp\</label\>' + Chr(29);

    return _Html;

}
// </LABEL>

// <LAYOUT>
function LAYOUT(Centerhtml, Northhtml, Northoptions, Southhtml, Southoptions, Easthtml, Eastoptions, Westhtml, Westoptions) {
    // Options: Fixed (!resizable, !slidable, !closable)
    // resizable, slidable, closable    (defaults)
    // minSize:int, maxSize:int, startsize:int, initClosed, initHidden, allowOverFlow

    // example: 
    // NorthHtml := @button('', @Html(`<span class="glyphicon glyphicon-menu-hamburger"></span>`), { onclick: 'if (myLayout.west.state.isVisible) return myLayout.hide("west"); myLayout.open("west"); myLayout.show("west") ' } ) 
    // print @JSB_HTML.LAYOUT(CenterHtml, NorthHtml, "!resizable, slidable, allowoverflow, startsize:300", SouthHtml, "initClosed, startsize:30, minSize:15", EastHtml, "startsize: 60, minSize:15", WestHtml, "startsize: 60"):

    // NO options at all will force closed and hidden

    var _Html = '';
    var Northsize = '';
    var Southsize = '';
    var Eastsize = '';
    var Westsize = '';
    var Northminsize = '';
    var Southminsize = '';
    var Eastminsize = '';
    var Westminsize = '';
    var Northmaxsize = '';
    var Southmaxsize = '';
    var Eastmaxsize = '';
    var Westmaxsize = '';
    var Northoverflow = '';
    var Southoverflow = '';
    var Eastoverflow = '';
    var Westoverflow = '';

    var Needload = true;
    if (System(1) == 'js') {
        if (window.jQuery.layout) Needload = false;
    }
    if (Needload) {
        _Html = Head(JsLink(jsbRoot() + 'js/jquery/jquery.layout.js'));
    }

    if (Not(Northoptions)) Northoptions = 'initClosed, initHidden, Fixed'; else Northoptions = Change(Northoptions, 'px', '');
    if (Not(Southoptions)) Southoptions = 'initClosed, initHidden, Fixed'; else Southoptions = Change(Southoptions, 'px', '');
    if (Not(Eastoptions)) Eastoptions = 'initClosed, initHidden, Fixed'; else Eastoptions = Change(Eastoptions, 'px', '');
    if (Not(Westoptions)) Westoptions = 'initClosed, initHidden, Fixed'; else Westoptions = Change(Westoptions, 'px', '');

    Northoptions = LCase(Northoptions);
    Southoptions = LCase(Southoptions);
    Eastoptions = LCase(Eastoptions);
    Westoptions = LCase(Westoptions);

    if (Field(Northoptions, 'startsize:', 2)) Northsize = 'size: \'' + Field(Field(Northoptions, 'startsize:', 2), ',', 1) + '\',';
    if (Field(Southoptions, 'startsize:', 2)) Southsize = 'size: \'' + Field(Field(Southoptions, 'startsize:', 2), ',', 1) + '\',';
    if (Field(Eastoptions, 'startsize:', 2)) Eastsize = 'size: \'' + Field(Field(Eastoptions, 'startsize:', 2), ',', 1) + '\',';
    if (Field(Westoptions, 'startsize:', 2)) Westsize = 'size: \'' + Field(Field(Westoptions, 'startsize:', 2), ',', 1) + '\',';

    if (Field(Northoptions, 'minsize:', 2)) Northminsize = 'minSize: \'' + Field(Field(Northoptions, 'minsize:', 2), ',', 1) + '\',';
    if (Field(Southoptions, 'minsize:', 2)) Southminsize = 'minSize: \'' + Field(Field(Southoptions, 'minsize:', 2), ',', 1) + '\',';
    if (Field(Eastoptions, 'minsize:', 2)) Eastminsize = 'minSize: \'' + Field(Field(Eastoptions, 'minsize:', 2), ',', 1) + '\',';
    if (Field(Westoptions, 'minsize:', 2)) Westminsize = 'minSize: \'' + Field(Field(Westoptions, 'minsize:', 2), ',', 1) + '\',';

    if (Field(Northoptions, 'maxsize:', 2)) Northmaxsize = 'maxSize: \'' + Field(Field(Northoptions, 'maxsize:', 2), ',', 1) + '\',';
    if (Field(Southoptions, 'maxsize:', 2)) Southmaxsize = 'maxSize: \'' + Field(Field(Southoptions, 'maxsize:', 2), ',', 1) + '\',';
    if (Field(Eastoptions, 'maxsize:', 2)) Eastmaxsize = 'maxSize: \'' + Field(Field(Eastoptions, 'maxsize:', 2), ',', 1) + '\',';
    if (Field(Westoptions, 'maxsize:', 2)) Westmaxsize = 'maxSize: \'' + Field(Field(Westoptions, 'maxsize:', 2), ',', 1) + '\',';

    if (InStr1(1, Northoptions, 'fixed')) Northoptions += ', !resizable, !slidable, !closable';
    if (InStr1(1, Southoptions, 'fixed')) Southoptions += ', !resizable, !slidable, !closable';
    if (InStr1(1, Eastoptions, 'fixed')) Eastoptions += ', !resizable, !slidable, !closable';
    if (InStr1(1, Westoptions, 'fixed')) Westoptions += ', !resizable, !slidable, !closable';

    if (InStr1(1, Northoptions, 'allowoverflow')) Northoverflow = 'showOverflowOnHover: true,';
    if (InStr1(1, Southoptions, 'allowoverflow')) Southoverflow = 'showOverflowOnHover: true,';
    if (InStr1(1, Eastoptions, 'allowoverflow')) Eastoverflow = 'showOverflowOnHover: true,';
    if (InStr1(1, Westoptions, 'allowoverflow')) Westoverflow = 'showOverflowOnHover: true,';

    _Html += '\r\n\
     \<div id="mylayout" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; border: 0; padding: 0; margin: 0;"\>\r\n\
         \<div class="ui-layout-center"\>' + CStr(Centerhtml) + '\</div\>\r\n\
         \<div class="ui-layout-north"\>' + CStr(Northhtml) + '\</div\>\r\n\
         \<div class="ui-layout-south"\>' + CStr(Southhtml) + '\</div\>\r\n\
         \<div class="ui-layout-east"\>' + CStr(Easthtml) + '\</div\>\r\n\
         \<div class="ui-layout-west"\>' + CStr(Westhtml) + '\</div\>\r\n\
      \</div\>\r\n\
      \<script type="text/javascript"\>\r\n\
            window.myLayout = $(\'#mylayout\').layout({\r\n\
                applyDemoStyles: true,\r\n\
                defaults: {\r\n\
                    fxName: "slide",\r\n\
                     fxSpeed: "fast"\r\n\
                    , resizerClass: "resizer"   \r\n\
                    , togglerClass: "toggler"   \r\n\
                    , buttonClass: "button" ,\r\n\
                    paneClass: "pane"  \r\n\
                },\r\n\
                north: {\r\n\
                    initHidden: ' + CStr((Index1(Northoptions, 'inithidden', 1) > 0)) + ',\r\n\
                    initClosed: ' + CStr((Index1(Northoptions, 'initclosed', 1) > 0)) + ',\r\n\
                    resizable: ' + CStr((Index1(Northoptions, '!resizable', 1) == 0)) + ',\r\n\
                    slidable: ' + CStr((Index1(Northoptions, '!slidable', 1) == 0)) + ',\r\n\
                    ' + Northsize + '\r\n\
                    ' + Northminsize + '\r\n\
                    ' + Northmaxsize + '\r\n\
                    ' + Northoverflow + '\r\n\
                    closable: ' + CStr((Index1(Northoptions, '!closable', 1) == 0)) + '\r\n\
                },\r\n\
                south: {\r\n\
                    initHidden: ' + CStr((Index1(Southoptions, 'inithidden', 1) > 0)) + ',\r\n\
                    initClosed: ' + CStr((Index1(Southoptions, 'initclosed', 1) > 0)) + ',\r\n\
                    resizable: ' + CStr((Index1(Southoptions, '!resizable', 1) == 0)) + ',\r\n\
                    slidable: ' + CStr((Index1(Southoptions, '!slidable', 1) == 0)) + ',\r\n\
                    ' + Southsize + '\r\n\
                    ' + Southminsize + '\r\n\
                    ' + Southmaxsize + '\r\n\
                    ' + Southoverflow + '\r\n\
                    closable: ' + CStr((Index1(Southoptions, '!closable', 1) == 0)) + '\r\n\
                },\r\n\
                east: {\r\n\
                    initHidden: ' + CStr((Index1(Eastoptions, 'inithidden', 1) > 0)) + ',\r\n\
                    initClosed: ' + CStr((Index1(Eastoptions, 'initclosed', 1) > 0)) + ',\r\n\
                    resizable: ' + CStr((Index1(Eastoptions, '!resizable', 1) == 0)) + ',\r\n\
                    slidable: ' + CStr((Index1(Eastoptions, '!slidable', 1) == 0)) + ',\r\n\
                    ' + Eastsize + '\r\n\
                    ' + Eastminsize + '\r\n\
                    ' + Eastmaxsize + '\r\n\
                    ' + Eastoverflow + '\r\n\
                    closable: ' + CStr((Index1(Eastoptions, '!closable', 1) == 0)) + '\r\n\
                },\r\n\
                west: {\r\n\
                    initHidden: ' + CStr((Index1(Westoptions, 'inithidden', 1) > 0)) + ',\r\n\
                    initClosed: ' + CStr((Index1(Westoptions, 'initclosed', 1) > 0)) + ',\r\n\
                    resizable: ' + CStr((Index1(Westoptions, '!resizable', 1) == 0)) + ',\r\n\
                    slidable: ' + CStr((Index1(Westoptions, '!slidable', 1) == 0)) + ',\r\n\
                    ' + Westsize + '\r\n\
                    ' + Westminsize + '\r\n\
                    ' + Westmaxsize + '\r\n\
                    ' + Westoverflow + '\r\n\
                    closable: ' + CStr((Index1(Westoptions, '!closable', 1) == 0)) + '\r\n\
                }\r\n\
            });\r\n\
     \</script\>\r\n\
     ';

    if (InStr1(1, Northoptions, 'allowoverflow')) {
        _Html += '\r\n\
            \<style\>\r\n\
                .ui-layout-north { overflow: visible !important; border: none !important }\r\n\
                .resizer-north { display: none !important }\r\n\
            \</style\>\r\n\
           ';
    }
    return Chr(28) + _Html + Chr(29);

}
// </LAYOUT>

// <LISTBOX>
function ListBox(Id, Values, Default, Addblank, Readonly, Additionalattributes, Multivalueddata) {
    if (isJSON(Default) || CBool(isArray(Default))) {
        Additionalattributes = Default;
        Default = '';
    }

    if (isJSON(Addblank) || CBool(isArray(Addblank))) {
        Additionalattributes = Addblank;
        Addblank = false;
    }

    if (isJSON(Readonly) || CBool(isArray(Readonly))) {
        Additionalattributes = Readonly;
        Readonly = false;
    }

    Values = makeArray(Values);
    var Listsize = '';
    if (CBool(Values)) Listsize = Len(Values); else Listsize = '5';
    Additionalattributes = JSB_BF_MERGEATTRIBUTE('size', Listsize, ' ', Additionalattributes);
    return DropDownBox(Id, Values, Default, Addblank, Readonly, Additionalattributes, Multivalueddata);
}
// </LISTBOX>

// <LISTBOXAJAX>
function ListBoxAJAX(Id, Url, Desciptionfield, Valuefield, Additionalattributes) {
    if (isJSON(Valuefield) || CBool(isArray(Valuefield))) {
        Additionalattributes = Valuefield;
        Valuefield = Desciptionfield;
    }

    if (Valuefield === undefined) Valuefield = Desciptionfield;

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('size', '5', ' ', Additionalattributes);
    return DropDownBox(Id, Url, Desciptionfield, Valuefield);

}
// </LISTBOXAJAX>

// <LISTBOXINCLUDEURL>
function ListBoxIncludeURL(Id, Srcurl, Arrayid, Addblank, Default, Readonly, Additionalattributes, Multivalueddata) {
    if (isJSON(Default) || CBool(isArray(Default))) {
        Additionalattributes = Default;
        Default = '';
    }

    if (isJSON(Addblank) || CBool(isArray(Addblank))) {
        Additionalattributes = Addblank;
        Addblank = false;
    }

    if (isJSON(Readonly) || CBool(isArray(Readonly))) {
        Additionalattributes = Readonly;
        Readonly = false;
    }

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('size', '5', ' ', Additionalattributes);
    return DropDownBoxIncludeURL(Id, Srcurl, Arrayid, Addblank, Default, Readonly, Additionalattributes, Multivalueddata);

}
// </LISTBOXINCLUDEURL>

// <MARK>
function Mark(Text) {
    return Chr(28) + '\<mark\>' + Chr(29) + CStr(Text) + Chr(28) + '\</mark\>' + Chr(29);

}
// </MARK>

// <MENUBAR>
function MenuBar(Jsonmenu, Brandhtml, Fixtotop, Verticalexpand, Barheight, Additionalprops) {
    // local variables
    var Tagname, Tn2;

    var Menuhtml = [undefined,];

    if (Additionalprops === undefined) {
        if (isJSON(Barheight)) { Additionalprops = Barheight; Barheight = undefined; }
        if (isJSON(Verticalexpand)) { Additionalprops = Verticalexpand; Verticalexpand = undefined; }
        if (isJSON(Fixtotop)) { Additionalprops = Fixtotop; Fixtotop = undefined; }
        if (isJSON(Brandhtml)) { Additionalprops = Brandhtml; Brandhtml = undefined; }
    }

    if (Fixtotop === undefined) Fixtotop = true;
    if (Not(Barheight)) Barheight = '40px';
    if (CNum(Barheight) == CStr(Barheight, true)) Barheight += 'px';

    Menuhtml[Menuhtml.length] = '\<style\>';
    // MenuHtml[-1] = ' .in { display: table !important }' ;* This messes up other jquery controls which use .in (jquery.keypad)

    if (isJSON(Additionalprops)) {
        var Jadditionalprops = Additionalprops;
        if (CBool(Jadditionalprops.MenuBarTextColor) && CBool(Jadditionalprops.BackgroundColor)) {
            Menuhtml[Menuhtml.length] = '   .navbar-default {  color: ' + CStr(Jadditionalprops.MenuBarTextColor) + ' !important; background: ' + CStr(Jadditionalprops.BackgroundColor) + ' !important; }';
            Menuhtml[Menuhtml.length] = '   .navbar-default a {  color: ' + CStr(Jadditionalprops.MenuBarTextColor) + ' !important; background: ' + CStr(Jadditionalprops.BackgroundColor) + ' !important; }';
            Menuhtml[Menuhtml.length] = '   .navbar-default\>li\>a {  color: ' + CStr(Jadditionalprops.MenuBarTextColor) + ' !important; background: ' + CStr(Jadditionalprops.BackgroundColor) + ' !important; }';
        }

        if (CBool(Jadditionalprops.MenuBarTextColor) && CBool(Jadditionalprops.MenuBarBackground)) { Menuhtml[Menuhtml.length] = '   .navbar-default .dropdown-menu  {  color: ' + CStr(Jadditionalprops.MenuBarTextColor) + ' !important; background: ' + CStr(Jadditionalprops.MenuBarBackground) + ' !important; }'; }
        if (CBool(Jadditionalprops.HilightTextColor) && CBool(Jadditionalprops.HilightBackground)) { Menuhtml[Menuhtml.length] = '   .navbar-default .dropdown-menu li:hover {  color: ' + CStr(Jadditionalprops.HilightTextColor) + ' !important; background: ' + CStr(Jadditionalprops.HilightBackground) + ' !important; }'; }

        var _Center = Jadditionalprops.Center;
    }
    Menuhtml[Menuhtml.length] = '\</style\>';

    if (CBool(Verticalexpand)) {
        var Ul = '\<ul class="nav nav-pills nav-stacked" style="list-style-type:none; margin: 0; padding: 0; width: auto; height: ' + CStr(Barheight) + ' "\>';
    } else {
        Ul = '\<ul class="navbar-nav" style="list-style-type:none; margin: 0; padding: 0; width: auto; height: ' + CStr(Barheight) + '; align-items: center; display: flex;"\>';
    }

    var Rightleft = 'left';
    var Hascollaspe = false;
    var Needenddiv = false;

    for (Tagname of iterateOver(Jsonmenu)) {
        var Tnl = LCase(Tagname);
        if (Tnl == 'collaspable') Hascollaspe = true;
    }

    if (CBool(Fixtotop)) {
        // MenuHtml[-1] = '<style> body { padding-top: 60px; } </style>'
        Menuhtml[Menuhtml.length] = '\<nav role="navigation" class="navbar-default navbar-fixed-top" \>'; // navbar style="position: relative";
    } else {
        Menuhtml[Menuhtml.length] = '\<nav role="navigation" class="navbar-default"\>'; // navbar;
    }

    if (_Center) {
        Menuhtml[Menuhtml.length] = '\<div class="container-fluid" style="display: table;"\>';
    } else {
        Menuhtml[Menuhtml.length] = '\<div class="container-fluid" style="padding-left: 2px;"\>';
    }

    // The Hamburger goes in header
    if (Hascollaspe) {
        Menuhtml[Menuhtml.length] = '\r\n\
        \<button id="mnuHamburger" type="button" class="navbar-toggle collapsed" style="padding: 1px" data-toggle="collapse" data-target="#navcollaspe" aria-expanded="false"\>\r\n\
            \<span class="sr-only"\>Toggle navigation\</span\>\r\n\
            \<span class="icon-bar"\>\</span\>\r\n\
            \<span class="icon-bar"\>\</span\>\r\n\
            \<span class="icon-bar"\>\</span\>\r\n\
         \</button\>\r\n\
          ';
    }

    var Listyle = 'display: table; height: 100%; padding: 0 4px 0;';
    var Listyleicon = 'height: 100%; padding: 0 2px 0;';
    var Liinside = 'display: table-cell; height: 100%; border: none; background-color: transparent; color: inherit;';
    var Btnstyle = 'min-width: 50px; height: 100%; border: none; background-color: transparent; color: inherit; padding: 0 4px 0;';
    var Textstyle = 'cursor: pointer;';

    if (CBool(Brandhtml)) {
        var Needul = false;
        Menuhtml[Menuhtml.length] = Ul;

        // If brand has onlick
        // MenuHtml[-1] = `<li class="dropdown pull-` : rightLeft : `" style="`:liStyle:`">`
        // MenuHtml[-1] = ` <b id="mnuBrand" class="btn" href="#" style="padding-left: 0; font-weight: bold; cursor: default;">` : BrandHTML : `</b>`

        Menuhtml[Menuhtml.length] = '\<li class="pull-' + Rightleft + '" style="' + Listyle + '"\>';
        Menuhtml[Menuhtml.length] = ' \<b id="mnuBrand" class="" style="display: table-header-group; font-weight: bold; cursor: default;"\>' + CStr(Brandhtml) + '\</b\>';
        Menuhtml[Menuhtml.length] = '\</li\>';
    } else {
        Needul = true;
    }

    for (Tagname of iterateOver(Jsonmenu)) {
        var So = Jsonmenu[Tagname];
        Tnl = LCase(Tagname);

        if (CBool(Verticalexpand) && Tnl != 'rightalign') {
            if (!Needul) { Menuhtml[Menuhtml.length] = '\</ul\>'; Needul = true; }
        }

        if (Tnl == 'rightalign') {
            if (Not(Verticalexpand)) {
                if (!Needul) Menuhtml[Menuhtml.length] = '\</ul\>';
                Rightleft = 'right';
                Needul = true;
                if (Needenddiv) Menuhtml[Menuhtml.length] = '\</div\>';
                Menuhtml[Menuhtml.length] = '\<div class="navbar-header navbar-right"\>';
            }
        } else if (Tnl == 'collaspable') {
            if (!Needul) Menuhtml[Menuhtml.length] = '\</ul\>';
            if (Needenddiv) Menuhtml[Menuhtml.length] = '\</div\>';
            Menuhtml[Menuhtml.length] = '\<div class="collapse navbar-collapse" id="mnucollaspe" style="overflow: visible"\>';
            Needul = true;;
        } else if (Left(Tnl, 3) == 'txt') {
            if (Needul) { Menuhtml[Menuhtml.length] = Ul; Needul = false; }
            Menuhtml[Menuhtml.length] = '    \<input id=\'' + CStr(Tagname) + '\' name=\'' + CStr(Tagname) + '\' type="text" class="form-control" placeholder="' + htmlEscape(CStr(So, true)) + '"\>';;
        } else if (Left(Tnl, 3) == 'btn') {
            if (Needul) { Menuhtml[Menuhtml.length] = Ul; Needul = false; }
            Menuhtml[Menuhtml.length] = '\<button id="' + CStr(Tagname) + '" type="button" onclick=' + jsEscapeAttr('window.eventHandler_SelectMenu({ id: \'' + CStr(So, true) + '\'}, "id")') + ' class="btn-default btn" style="' + Btnstyle + '"\>' + htmlEscape(CStr(So, true)) + '\</button\>'; // btn;
        } else if (Left(Tagname, 4) == 'html') {
            if (Needul) { Menuhtml[Menuhtml.length] = Ul; Needul = false; }
            Menuhtml[Menuhtml.length] = CStr(So, true);;
        } else if (isJSON(So)) {
            var Jso = So;

            if (Needul) { Menuhtml[Menuhtml.length] = Ul; Needul = false; }
            var Myonclick = '';
            if (CBool(Jso.onclick)) Myonclick = 'onclick=' + jsEscapeAttr(CStr(Jso.onclick)); else Myonclick = 'onclick=' + jsEscapeAttr('window.eventHandler_SelectMenu(' + CStr(So, true) + ', "id")');

            var Caption = '';
            if (CBool(Jso.caption)) Caption = Jso.caption; else Caption = Tagname;

            if (CBool(Jso.id)) {
                if (CBool(Jso.glyphicon)) {
                    Menuhtml[Menuhtml.length] = '\<li class="navbar-text dropdown pull-' + Rightleft + '" style="' + Listyle + '"\>';
                    Menuhtml[Menuhtml.length] = '\<a id="mnu' + CStr(Tagname) + '" ' + Myonclick + ' class="btn" style="' + Liinside + ' ' + Btnstyle + '"\>';
                    Menuhtml[Menuhtml.length] = ' \<span class="glyphicon glyphicon-' + CStr(Jso.glyphicon) + '" style="' + CStr(Jso.style) + '" class="icone icone-custom " ondragstart="return false"\>\</span\>';
                    Menuhtml[Menuhtml.length] = '\</a\>';
                    Menuhtml[Menuhtml.length] = '\</li\>';;
                } else if (CBool(Jso.iconurl)) {
                    var Url = Jso.iconurl;

                    // Url paths?
                    if (InStr1(1, Url, ':')) {
                        So = clone(So);
                        delete So['iconurl'];
                    } else {
                        if (!InStr1(1, Url, '/') && !InStr1(1, Url, '\\')) Url = jsbRoot() + 'pics/' + Url;
                        if (Left(Url, 1) == '/' && Left(Url, Len(jsbRoot())) != jsbRoot()) Url = jsbRoot() + Mid1(Url, 2);
                        if (Left(Url, 2) == './') Url = jsbRoot() + Change(Mid1(Url, 3), '\\', '/');

                        // File system path?
                        if (Left(Url, 2) != '\\\\' && Left(Url, 4) != 'http' && InStr1(1, Url, '/') && !InStr1(1, Url, '\\')) Url = Change(Url, '/', '\\');
                    }

                    Menuhtml[Menuhtml.length] = '\<li class="dropdown pull-' + Rightleft + '" style="' + Listyleicon + '"\>'; // Drop display: table;
                    Menuhtml[Menuhtml.length] = '\<img id="mnu' + CStr(Tagname) + '" src="' + Url + '" style="' + Liinside + ' ' + CStr(Jso.style) + '" ' + Myonclick + ' class="btn-default btn" ondragstart="return false"\>'; // btn
                    Menuhtml[Menuhtml.length] = '\</li\>';
                } else {
                    Menuhtml[Menuhtml.length] = '\<li class="dropdown pull-' + Rightleft + '" style="' + Listyle + '"\>';
                    So = (Change(Change(So, '"', '&quot;'), '\'', '&apos;'));
                    if (Needul) { Menuhtml[Menuhtml.length] = Ul; Needul = false; }
                    Menuhtml[Menuhtml.length] = '\<button id="mnu' + CStr(Tagname) + '" type="button" ' + Myonclick + ' class="btn-default btn" style="' + Listyle + '; padding: 0; ' + Btnstyle + '"\>' + htmlEscape(Caption) + '\</button\>'; // btn
                    Menuhtml[Menuhtml.length] = '\</li\>';
                }
            } else {
                Menuhtml[Menuhtml.length] = '\<li class="navbar-text dropdown btn pull-' + Rightleft + '" style="' + Listyle + '"\>';
                Menuhtml[Menuhtml.length] = '  \<a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" style="display: table-cell; padding: 0; vertical-align: middle;' + CStr(Jso.style) + '"\>';
                Menuhtml[Menuhtml.length] = htmlEscape(Tagname);
                // Bootstrap CSS handles now -  MenuHtml[-1] = `     <b class="caret"></b>`
                Menuhtml[Menuhtml.length] = '  \</a\>';
                Menuhtml[Menuhtml.length] = '  \<ul id="mnu' + CStr(Tagname) + '" class="dropdown-menu" style="list-style-type:none; margin: 0; position: absolute; border: lightgray solid 1px; border-radius: 5px; font-size: smaller"\>';
                for (Tn2 of iterateOver(So)) {
                    var Ltn2 = LCase(Tn2);
                    var So2 = So[Tn2];
                    Tn2 = htmlEncode(Tn2);
                    if (isJSON(So2)) {
                        var Jso2 = So2;
                        if (CBool(Jso2.onclick)) Myonclick = 'onclick=' + jsEscapeAttr(CStr(Jso2.onclick)); else Myonclick = 'onclick=' + jsEscapeAttr('window.eventHandler_SelectMenu(' + CStr(Jso2, true) + ', "id")');
                        if (CBool(Jso2.caption)) Caption = htmlEscape(Jso2.caption); else Caption = Tn2;
                        Menuhtml[Menuhtml.length] = '\<li id="mnu' + CStr(Tn2) + '" ' + Myonclick + '\>' + Caption + '\</li\>';;
                    } else if (Left(Ltn2, 3) == 'sep') {
                        Menuhtml[Menuhtml.length] = '\<li role="seperator" class="divider"\>\</li\>';;
                    } else if (Ltn2 != 'rightalign' && Ltn2 != 'collaspable') {
                        Menuhtml[Menuhtml.length] = '\<li id="mnu' + CStr(Tn2) + '" onclick=' + jsEscapeAttr(CStr(So2, true)) + '\>' + CStr(Tn2) + '\</li\>';
                    }
                }
                Menuhtml[Menuhtml.length] = '  \</ul\>';
                Menuhtml[Menuhtml.length] = '\</li\>';
            }
        } else {
            if (Needul) { Menuhtml[Menuhtml.length] = Ul; Needul = false; }
            Menuhtml[Menuhtml.length] = '\<li id="mnu' + CStr(Tagname) + '" class="navbar-text btn dropdown pull-' + Rightleft + '" style="' + Textstyle + '" onclick=' + jsEscapeAttr(CStr(So, true)) + '\>' + htmlEscape(Tagname) + '\</li\>';
        }
    }

    if (!Needul) Menuhtml[Menuhtml.length] = '\</ul\>';
    if (Needenddiv) Menuhtml[Menuhtml.length] = '\</div\>';

    Menuhtml[Menuhtml.length] = '\</div\>'; // container fluid
    Menuhtml[Menuhtml.length] = '\</nav\>';

    // Create the default POSTBACK for SelectMenu to put value in @FormVar('SelectedMenu')

    Menuhtml[Menuhtml.length] = '\<script\>if (!window.eventHandler_SelectMenu) { ';
    var Op = genEventHandler('SelectMenu', undefined, 7, 'SelectedMenu');
    Op = dropLeft(Op, '\>'); // drop script tag
    Op = dropRight(Op, '\</script\>');
    Menuhtml[Menuhtml.length] = Op;
    Menuhtml[Menuhtml.length] = '}\</script\>';

    return html(Join(Menuhtml, crlf));
}
// </MENUBAR>

// <MENUBARX>
async function MenuBarX(Jsonmenu, Useborders, Padding, _Center, Usedownarrow, _Backgroundcolor, Menubarbackground, Menubartextcolor, Hilightbackground, Hilighttextcolor) {
    // 10

    // cssdeck.com/labs/another-simple-css3-dropdown-menu

    // Convert JSON to Html Menu
    var Menuhtml = undefined;
    var Ibar = undefined;
    var Borders = '';
    var Tagname = '';
    var Onclick = '';
    var Da = '';
    var Li = '';
    var Tn2 = '';
    var So2 = '';
    var So = undefined;

    if (Useborders) { Borders = ' border: 1px solid; margin-top: 2px;'; }
    if (Not(Padding)) Padding = '10px';
    Menuhtml = [undefined,];
    Menuhtml[Menuhtml.length] = '\<style\>';
    if (_Center) {
        Menuhtml[Menuhtml.length] = '   .menuBar {  padding-top: ' + Padding + '; padding-bottom: ' + Padding + '; text-align: center }';
    } else {
        Menuhtml[Menuhtml.length] = '   .menuBar {  padding-top: ' + Padding + '; padding-bottom: ' + Padding + ' }';
    }
    Menuhtml[Menuhtml.length] = '   .menuBar ul {  color: ' + CStr(Menubartextcolor) + '; }';
    Menuhtml[Menuhtml.length] = '   .menuBar ul li {  background: ' + CStr(Menubarbackground) + ';  color: ' + CStr(Menubartextcolor) + '; ' + Borders + ' }';
    Menuhtml[Menuhtml.length] = '   .menuBar ul li:hover {  background: ' + CStr(Hilightbackground) + ';  color: ' + CStr(Hilighttextcolor) + '; }';
    Menuhtml[Menuhtml.length] = '   .menuBar ul li:hover ul {  background: ' + CStr(_Backgroundcolor) + '; height: auto }';
    Menuhtml[Menuhtml.length] = '   .menuBar ul li ul li { background: ' + CStr(Menubarbackground) + ';  color: ' + CStr(Menubartextcolor) + '; }';
    Menuhtml[Menuhtml.length] = '\</style\>';
    Menuhtml[Menuhtml.length] = '\<menuBar class="menuBar"\>\<ul\>';

    // All Top level items with ICONS go first
    Ibar = [undefined,];
    for (Tagname of iterateOver(Jsonmenu)) {
        So = Jsonmenu[Tagname];
        if (Left(So, 1) == '{') {
            if (CBool(So.id) && (CBool(So.iconurl) || CBool(So.glyphicon))) {
                Ibar[Ibar.length] = Tagname;
            }
        }
    }

    if (Len(Ibar)) {
        Menuhtml[Menuhtml.length] = '\<div class="btn-group"\>';
        for (Tagname of iterateOver(Ibar)) {
            So = Jsonmenu[Tagname];

            Onclick = Change(So, '\'', '\\u0027');
            Onclick = 'onclick=\'window.eventHandler_SelectMenu(' + Onclick + ', "id")\'';

            Menuhtml[Menuhtml.length] = '\<button type="button" title="' + CStr(Tagname) + '" type="button" class="btnbar btn-default btn" data-toggle="tooltip" ' + Onclick + '\>'; // btn
            if (CBool(So.iconurl)) {
                Menuhtml[Menuhtml.length] = ' \<img src="' + jsbRoot() + 'pics/' + CStr(So.iconurl) + '" class="img-responsive"  ondragstart="return false" /\>';
            } else {
                Menuhtml[Menuhtml.length] = ' \<span class="glyphicon glyphicon-' + CStr(So.glyphicon) + '"  ondragstart="return false"\>\</span\>';
            }
            Menuhtml[Menuhtml.length] = '\</button\>';
        }
        Menuhtml[Menuhtml.length] = '\</div\>';
    }

    if (Usedownarrow) { Da = ('&#9660;'); } else Da = '';

    for (Tagname of iterateOver(Jsonmenu)) {
        So = Jsonmenu[Tagname];
        Tagname = htmlEncode(Tagname);
        if (Left(So, 1) == '{') {
            if (CBool(So.id)) {
                if (CBool(So.iconurl) || CBool(So.glyphicon)) {
                    // Skip Button Bar ICons;
                } else {
                    So = Change(So, '\'', '\\u0027');
                    Li = '\<li onclick=\'window.eventHandler_SelectMenu(' + CStr(So) + ', "id")\'\>' + Tagname + '\</li\>';
                    Menuhtml[Menuhtml.length] = Li;
                }
            } else {
                Menuhtml[Menuhtml.length] = '\<li\>' + Tagname + Da + '\<ul\>';

                for (Tn2 of iterateOver(So)) {
                    So2 = So[Tn2];
                    Tn2 = htmlEncode(Tn2);
                    if (Left(So2, 1) == '{') {
                        So2 = Change(So2, '\'', '\\u0027');
                        Menuhtml[Menuhtml.length] = '\<li onclick=\'window.eventHandler_SelectMenu(' + So2 + ', "id")\'\>' + Tn2 + '\</li\>';
                    } else {
                        Menuhtml[Menuhtml.length] = '\<li onclick=' + jsEscapeAttr(So2) + '\>' + Tn2 + '\</li\>';
                    }
                }
                Menuhtml[Menuhtml.length] = '\</ul\>\</li\>';
            }
        } else {
            Li = '\<li onclick=' + jsEscapeAttr(CStr(So)) + '\>' + Tagname + '\</li\>';
            Menuhtml[Menuhtml.length] = Li;
        }
    }

    Menuhtml[Menuhtml.length] = '\</ul\>\</menuBar\>\</nav\>';

    return html('\<div style="height: 1.9em; background: ' + CStr(_Backgroundcolor) + ';"\>') + html(Join(Menuhtml, '')) + html('\</div\>');

}
// </MENUBARX>

// <MONO>
function Mono(Id, Content, Additionalattributes) {
    var _Html = '';

    if (isJSON(Content) || CBool(isArray(Content))) {
        Additionalattributes = Content;
        Content = Id;
        Id = '';;
    } else if (Content === undefined) {
        Content = Id;
        Id = '';
    }

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'font-family:monospace', ';', Additionalattributes);
    _Html = htmlEscape(Content);
    _Html = (Change(_Html, ' ', '&nbsp;'));
    _Html = Change(_Html, crlf, '\<br /\>');
    if (Id) Id = ' id=\'' + Id + '\' ';
    _Html = Chr(28) + '\<span' + Id + joinAttributes(Additionalattributes) + '\>' + _Html + '\</span\>' + Chr(29);
    return _Html;
}
// </MONO>

// <MONOSPACE>
function MonoSpace(Id, Content, Additionalattributes) {
    return Mono(CStr(Id), Content, Additionalattributes);

}
// </MONOSPACE>

// <MULTISELECTDROPDOWNBOX>
function multiSelectDropDownBox(Id, Values, Defaults, Additionalattributesdisplay, Binding) {
    var Delimiter = '';
    var Svals = CStr(Values, true);

    if (InStr1(1, Svals, am)) {
        Delimiter = am;
    } else if (InStr1(1, Svals, vm)) {
        Delimiter = vm;
    } else if (InStr1(1, Svals, svm)) {
        Delimiter = svm;
    } else if (InStr1(1, Svals, ';')) {
        Delimiter = ';';
    } else if (InStr1(1, Svals, ',')) {
        Delimiter = ',';
    } else {
        if (CBool(Binding)) Delimiter = ','; else Delimiter = am;
    }

    var Vals = Split(Change(Svals, Delimiter + ' ', Delimiter), Delimiter);
    if (Defaults == '*') Defaults = Vals;

    Defaults = Change(Defaults, Delimiter + ' ', Delimiter);

    var _Html = Chr(28) + '\<div class=\'dropdown-check-list form-control\' ' + joinAttributes(Additionalattributesdisplay, ' ') + '\>\r\n\
        \<span class="anchor"\>\r\n\
            \<input id="' + CStr(Id) + '" name="' + CStr(Id) + '" type=\'textbox\' tabindex=\'-1\' readonly class=\'dropdown-input form-control\'';
    if (InStr1(1, Additionalattributesdisplay, 'required')) _Html += 'required ';
    _Html += Join(Binding, ' ') + ' autocomplete=\'offItGoes\' onclick=\'multiSelectCheckBoxShowlist(this)\' value=\'' + Change(Defaults, Delimiter, ',') + '\'/\>\r\n\
        \</span\>\r\n\
        \<div class="dropdown-check-list-arrow" onclick=\'multiSelectCheckBoxShowlist(this)\'\>\</div\>\<div class="itemsnbtns"\>\r\n\
        \<ul class="multiselect-items"\>' + crlf + Chr(29);

    var I = undefined;
    var V = undefined;

    I = LBound(Vals) - 1;
    for (V of iterateOver(Vals)) {
        I++;
        _Html += Chr(28) + '\<li\>\<input id="' + CStr(Id) + '_' + CStr(I) + '" type=\'checkbox\' onchange=\'multiSelectCheckBoxChanged(this);\' style=\'float:left;width:9%\' /\>';
        _Html += '\<span onclick="clickMyCompanion(this, \'' + CStr(Id) + '_' + CStr(I) + '\'); multiSelectCheckBoxChanged(this);"  style=\'float:left;width:90%\'\>' + Chr(29) + CStr(V, true) + Chr(28) + '\</span\>\</li\>' + crlf + Chr(29);
    }

    return _Html + Chr(28) + '\</ul\>\<div class="centerBtns"\>    \r\n\
          \<button type=\'button\' class=\'smallbtn\' onclick=\'multiSelectAll(this)\'\>Select All\</button\>\r\n\
          \<button type=\'button\' class=\'smallbtn\' onclick=\'multiSelectNone(this)\'\>Select None\</button\>\r\n\
          \<button type=\'button\' class=\'smallbtn\' onclick=\'multiSelectCheckBoxShowlist(this, true)\'\>OK\</button\>\r\n\
       \</div\>\</div\>\</div\>' + crlf + Chr(29);

    return _Html + Chr(28) + '\<li class="centerBtns"\>    \r\n\
          \<button type=\'button\' class=\'smallbtn\' onclick=\'multiSelectAll(this)\'\>Select All\</button\>\r\n\
          \<button type=\'button\' class=\'smallbtn\' onclick=\'multiSelectNone(this)\'\>Select None\</button\>\r\n\
          \<button type=\'button\' class=\'smallbtn\' onclick=\'multiSelectCheckBoxShowlist(this, true)\'\>OK\</button\>\r\n\
       \</li\>\</ul\>\</div\>' + crlf + Chr(29);
}
// </MULTISELECTDROPDOWNBOX>

// <MULTISELECTFIELDSETBTNS>
function multiSelectFieldSetBtns(Id, Values, Defaultvalues, Readonly, Additionalattributes, Multivalueddata) {
    // local variables
    var V;

    var Subdelimiter = '';
    var Vals = makeArray(Values); Subdelimiter = activeProcess.At_Ni;
    if (!InStr1(1, Values, Subdelimiter)) Subdelimiter = '';

    var Opts = [undefined,];
    var Ia = dataAdditionalAttributes(Additionalattributes);
    Ia += ' ' + 'onclick=\'window.msfieldSetBtn_Change(this)\'';

    if (Id) {
        var Name = ' name=\'' + CStr(Id) + '\'';
        Ia += ' data-parsley-errors-container="#' + CStr(Id) + '_errors" ';
    }

    var S2 = '';
    if (Readonly) S2 = ' tabindex=\'-1\' readonly '; else S2 = '';

    if ((Subdelimiter && Multivalueddata) || Subdelimiter >= Chr(252)) {
        for (V of iterateOver(Vals)) {
            if (InStr1(1, V, Subdelimiter)) {
                var Display = Field(V, Subdelimiter, 1);
                V = dropLeft(CStr(V), Subdelimiter);
                var S = '';
                if (CBool(V)) { if (Locate(V, Defaultvalues, 0, 0, 0, "", position => { })) S = ' checked'; else S = ''; } else S = '';
                Opts[Opts.length] = '\<label class=\'fieldSetBtnLbl' + S + '\'\>' + htmlEscape(Display) + '\<input type=\'checkbox\' class=\'fieldSetBtn\'' + Name + Ia + S2 + S + ' value="' + CStr(V, true) + '"\>\</label\>';
            } else {
                if (Locate(V, Defaultvalues, 0, 0, 0, "", position => { })) S = ' checked'; else S = '';
                Opts[Opts.length] = '\<label class=\'fieldSetBtnLbl' + S + '\'\>' + htmlEscape(V) + '\<input type=\'checkbox\' class=\'fieldSetBtn\'' + Name + Ia + S2 + S + ' value="' + CStr(V) + '"\>\</label\>';
            }
        };
    } else if (CBool(Vals)) {
        for (V of iterateOver(Vals)) {
            if (Locate(V, Defaultvalues, 0, 0, 0, "", position => { })) S = ' checked'; else S = '';
            Opts[Opts.length] = '\<label class=\'fieldSetBtnLbl' + S + '\'\>' + htmlEscape(V) + '\<input type=\'checkbox\' class=\'fieldSetBtn\'' + Name + Ia + S2 + S + ' value="' + CStr(V) + '"\>\</label\>';
        }
    }

    var Oa = JSB_BF_UIADDITIONALATTRIBUTES(Additionalattributes);
    var _Div = '';

    if (Id) {
        _Div = html('\<fieldset class=\'fieldSetBtnsFrame form-control\' ' + Oa + '\>\r\n\
                       \<div class=\'fieldSetBtnsDiv\' id="' + CStr(Id) + '" ' + Oa + '\>' + crlf + Join(Opts, crlf) + crlf + '\r\n\
                       \</div\>\</fieldset\>\r\n\
                       \<div id="' + CStr(Id) + '_errors" style="display: inline-block"\>\</div\>\r\n\
                     ');
    } else {
        _Div = html('\<fieldset class=\'fieldSetBtnsFrame form-control\' ' + Oa + '\>\r\n\
                       \<div class=\'fieldSetBtnsDiv\' ' + Oa + '\>' + crlf + Join(Opts, crlf) + crlf + '\r\n\
                       \</div\>\</fieldset\>\r\n\
                     ');
    }

    return _Div;

}
// </MULTISELECTFIELDSETBTNS>

// <CSSLINK>
function CssLink(Url) {
    if (Left(Url, 5) == 'file:' && System(1) == 'aspx') {
        if (InStr1(1, Url, 'jsb/css/')); else if (InStr1(1, Url, '/css/')) {
            Url = Change(Url, '/css/', '/jsb/css/');;
        } else if (Left(Url, 3) == 'css/') {
            Url = 'jsb/css/' + Mid1(Url, 4);;
        } else if (!InStr1(1, Url, '/jsb/') && !InStr1(1, Url, '\\jsb\\')) {
            Url = jsbRoot() + 'jsb/css/' + Url;
        }
    } else {
        if (!InStr1(1, Url, '/') && !InStr1(1, Url, '\\')) Url = jsbRoot() + 'css/' + Url;
    }

    return Chr(28) + '\<link type=\'text/css\' rel="stylesheet" href=' + jsEscapeHREF(Url) + ' /\>' + crlf + Chr(29);
}
// </CSSLINK>

// <JQGRID>
async function JSB_HTML_JQGRID(Jqgridid, Restfulnameordataarray, Usermodelcolumns, Myoptions) {
    // local variables
    var Column, V;

    // Check if we need to read values for reference controls
    var Refctls = [undefined, 'autotextbox', 'cascadingautotextbox', 'cascadingcombobox', 'cascadingdropdownbox', 'combobox', 'dropdownbox', 'fieldsetbtns', 'multiselectdropdownbox', 'multiselectfieldsetbtns', 'multiselectlistbox', 'popselection', 'radiobox', 'label', 'sliderlabeled'];

    for (Column of iterateOver(Usermodelcolumns)) {
        if (Len(Column.name) && Not(Column.edittype) && (CBool(Column.reflist) || CBool(Column.reffile))) {
            if (Locate(LCase(Column.control), Refctls, 0, 0, 0, "", position => { })) {
                var Values = await JSB_MDL_MDLGETREFVALUES('', Column, {}, function (_P1, _Column, _P3) { Column = _Column });
                var Vals = [undefined,];
                if (CBool(Column.addBlank)) Vals[Vals.length] = ':';

                for (V of iterateOver(Values)) {
                    if (InStr1(1, V, Chr(255))) {
                        V = Change(V, Chr(255), ':');;
                    } else if (InStr1(1, V, Chr(254))) {
                        V = Change(V, Chr(254), ':');;
                    } else if (InStr1(1, V, Chr(253))) {
                        V = Change(V, Chr(253), ':');;
                    } else if (InStr1(1, V, Chr(252))) {
                        V = Change(V, Chr(252), ':');;
                    } else if (InStr1(1, V, ',')) {
                        V = Change(V, ',', ':');;
                    } else if (isEmpty(V)) {
                        if (Not(Column.addBlank)) V = ':';
                    } else {
                        V = CStr(V) + ':' + CStr(V);
                    }

                    Vals[Vals.length] = Field(V, ':', 2) + ':' + Field(V, ':', 1); // code:desc
                }

                Column.edittype = 'select';
                Column.formatter = 'select';
                Column.editoptions = { "value": Join(Vals, ';') }; // "FE:FedEx;IN:InTime;TN:TNT;AR:ARAMEX";
            }
        }
    }

    return JSB_HTML_JQGRID2(CStr(Jqgridid), Restfulnameordataarray, Usermodelcolumns, Myoptions);
}
// </JQGRID>

// <JSBDEF2JQGRIDDEF>
function JSB_HTML_JSBDEF2JQGRIDDEF(ByRef_Myoptions, ByRef_Tcolumn, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Myoptions, ByRef_Tcolumn)
        return v
    }
    var Column = {};
    Column.name = ByRef_Tcolumn.name;
    if (CBool(ByRef_Tcolumn.datatype)) Column.datatype = ByRef_Tcolumn.datatype;
    if (CBool(ByRef_Tcolumn.primarykey)) Column.primarykey = true;
    if (CBool(ByRef_Tcolumn.index)) Column.index = ByRef_Tcolumn.index;
    if (CBool(ByRef_Tcolumn.align)) Column.align = ByRef_Tcolumn.align;
    if (CBool(ByRef_Tcolumn.width)) Column.width = ByRef_Tcolumn.width;
    if (CBool(ByRef_Tcolumn.label)) Column.label = ByRef_Tcolumn.label;
    if (CBool(ByRef_Tcolumn.sorttype)) Column.sorttype = ByRef_Tcolumn.sorttype;
    if (CBool(ByRef_Tcolumn.sortable)) Column.sortable = ByRef_Tcolumn.sortable;
    if (CBool(ByRef_Tcolumn.formatoptions)) Column.formatoptions = ByRef_Tcolumn.formatoptions;

    if (CBool(ByRef_Tcolumn.tooltip)) { Column.cellattr = '^^function () { return \' title="' + urlEncode(ByRef_Tcolumn.tooltip) + '"\'; }^^'; }
    if (Not(Column.label)) Column.label = Column.name;

    // Valid formatters: http://www.trirand.com/jqgridwiki/doku.php?id=wiki:predefined_formatter
    // integer, number, currency, date, email, link, showlink, checkbox, select, actions
    if (CBool(ByRef_Tcolumn.formatter)) {
        Column.formatter = ByRef_Tcolumn.formatter;;
    } else if (Column.datatype == 'date' || Column.datatype == 'datetime') {
        Column.formatter = 'date';;
    } else if (Column.datatype == 'currency') {
        Column.formatter = 'currency';

        // Else If Column.datatype = "url" Then
        // Column.formatter = 'link';
    } else if (Column.datatype == 'integer') {
        // Column.formatter = 'integer' // By making the formatter an integer, the data will be converted to an integer, and thus empty becomes 0;
    } else if (Column.datatype == 'autointeger') {
        Column.formatter = 'integer';;
    } else if (Column.datatype == 'double') {
        Column.formatter = 'number';;
    }

    if (ByRef_Tcolumn.display == 'hidden' || ByRef_Tcolumn.display == 'gridhidden') Column.hidden = true;

    // http://www.trirand.com/jqgridwiki/doku.php?id=wiki:common_rules
    var Ctltype = LCase(ByRef_Tcolumn.control);

    // edittype and editoptions only set if column is editable
    if (CBool(ByRef_Tcolumn.canedit) || CBool(ByRef_Tcolumn.editable)) {
        Column.editable = true;
        if (CBool(ByRef_Tcolumn.edittype)) Column.edittype = ByRef_Tcolumn.edittype;
        if (CBool(ByRef_Tcolumn.editoptions)) Column.editoptions = ByRef_Tcolumn.editoptions;
    } else {
        // Not editable
        Column.editable = false;
        if (Ctltype != 'button' && Ctltype != 'anchor' && Ctltype != 'urlbox' && Ctltype != 'url') Ctltype = '';
    }

    if (Not(Column.edittype) && Ctltype) {
        // *
        // * textbox, dropDownBox, combobox, listbox, autotextbox, datebox, timebox, datetimebox, imagebox, currencybox
        // *                maskedtextbox, radiobox, multiselectlistbox, multiselectdropDownBox, colorpick, slider
        // *                htmlbox, label, imagebox, uploadimagebox, appendbox, passwordbox
        // * ->
        // *      text, textarea, checkbox, select, password, button, image, file custom

        if (Ctltype == 'button') {
            Column.formatter = '^^jqGridAddBtn^^';
            var Url = dropIfRight(CStr(ByRef_Tcolumn.transferurl), '.page', true);
            var Pkid = '';
            Column.editoptions = { "colName": Column.Name, "primaryKey": Pkid, "transferurl": Url, "transferto": ByRef_Tcolumn.transferto, "transferaddfrompage": ByRef_Tcolumn.transferaddfrompage, "transferextra": ByRef_Tcolumn.onParentExtra, "datausuage": ByRef_Tcolumn.datausuage, "title": Column.label };;
        } else if (Ctltype == 'imagebox') {
            // Column.editable = false;
        } else if (Ctltype == 'checkbox') {
            Column.edittype = 'checkbox';
            Column.editoptions = { "value": '1:0' };
            Column.formatter = 'checkbox';
            Column.align = 'center';;
        } else if (Ctltype == 'label') {
            Column.editable = false;;
        } else if (Ctltype == 'urlbox' || Ctltype == 'anchor') {
            Column.formatter = '^^function (cellValue, myOptions, rowObject) { return "\<a href=" + urlEncode(cellValue) + " target=\'_blank\'\>...\</a\>";  }^^';;
        } else if (Ctltype == 'url') {
            Column.formatter = '^^function (cellValue, myOptions, rowObject) { return "\<a href=" + urlEncode(cellValue) + " target=\'_blank\'\>" + cellValue + "\</a\>";  }^^';
        }
    }

    if (Right(Column.index, 1) == '#') {
        Column.sorttype = 'int';
        Column.index = Left(Column.index, Len(Column.index) - 1);
        if (Not(Column.align)) Column.align = 'right';
    } else if (Column.datatype == 'integer' || Column.datatype == 'autointeger') {
        Column.sorttype = 'int';
        if (Not(Column.index)) Column.index = Column.name;
        if (Not(Column.align)) Column.align = 'right';
    } else if (Column.datatype == 'double') {
        Column.sorttype = 'float';
        if (Not(Column.index)) Column.index = Column.name;
        if (Not(Column.align)) Column.align = 'right';
    } else {
        if (Not(Column.index)) Column.index = Column.name;
    }

    if (CBool(ByRef_Myoptions.WidthMultiplier) && isNumeric(Column.width) && Len(Column.width)) Column.width = CNum(Column.width) * CNum(ByRef_Myoptions.WidthMultiplier);

    // need a default row?
    if (CBool(ByRef_Myoptions.allowInserts)) {
        var D = '';
        if (CBool(ByRef_Tcolumn.defaultvalue)) D = ByRef_Tcolumn.defaultvalue; else D = ByRef_Tcolumn.defaultValue;
        if (Not(D)) D = '';
        if (Column.control == 'json_inline') {
            if (Left(D, 1) != '[' || Right(D, 1) != ']') {
                if (Left(D, 1) == '{' && Right(D, 1) == '}') D = '[' + D + ']'; else D = '[]';
            }
            var Js = parseJSON('{array:' + D + '}');
            D = Js.array;
        }
        if (Len(D)) Column.defaultValue = D;
    }

    Column.resizable = true; // default

    return exit(Column);
}
// </JSBDEF2JQGRIDDEF>

// <JQGRID2>
function JSB_HTML_JQGRID2(Jqgridid, Restfulnameordataarray, Usermodelcolumns, Myoptions) {
    var Cols = undefined;
    var Columnmodel = undefined;
    var Defaultrow = undefined;
    var Js = undefined;
    var Tcolumn = undefined;
    var Column = undefined;
    var _Html = '';
    var Pkid = '';
    var Ctltype = '';
    var Url = '';
    var D = '';
    var Addbtn = '';
    var Pager = '';
    var Joinedmodel = '';
    var Lh = '';
    var Rh = '';
    var Aw = '';
    var Tbl = '';
    var S = '';
    var Arg = '';

    if (typeOf(Myoptions) != 'JSonObject') { Myoptions = {} }

    if (Not(Jqgridid)) Jqgridid = 'jqGrid_' + CStr(Rnd(99999));

    // Moved to head - Html = @CssLink(@jsbroot:"css/ui.jqgrid.css")
    _Html = Head(JsLink(jsbRoot() + 'js/grid.locale-en.js'));
    _Html += Head(JsLink(jsbRoot() + 'js/jquery/jquery.jqgrid.js'));

    Cols = [undefined,];
    Columnmodel = [undefined,];
    Defaultrow = {};

    if (Not(Myoptions.WidthMultiplier)) Myoptions.WidthMultiplier = 1;

    Pkid = '';
    for (Tcolumn of iterateOver(Usermodelcolumns)) {
        if (Len(Tcolumn.name) && CBool(Tcolumn.primarykey)) { Pkid = Tcolumn.name; break; }
    }

    for (Tcolumn of iterateOver(Usermodelcolumns)) {
        if (Len(Tcolumn.name)) {
            Column = {};
            Column.name = Tcolumn.name;
            if (CBool(Tcolumn.datatype)) Column.datatype = Tcolumn.datatype;
            if (CBool(Tcolumn.primarykey)) Column.primarykey = true;
            if (CBool(Tcolumn.index)) Column.index = Tcolumn.index;
            if (CBool(Tcolumn.align)) Column.align = Tcolumn.align;
            if (CBool(Tcolumn.width)) Column.width = Tcolumn.width;
            if (CBool(Tcolumn.label)) Column.label = Tcolumn.label;
            if (CBool(Tcolumn.sorttype)) Column.sorttype = Tcolumn.sorttype;
            if (CBool(Tcolumn.sortable)) Column.sortable = Tcolumn.sortable;
            if (CBool(Tcolumn.tooltip)) { Column.cellattr = '^^function () { return \' title="' + urlEncode(Tcolumn.tooltip) + '"\'; }^^'; }
            if (Not(Column.label)) Column.label = Column.name;

            // Valid formatters: http://www.trirand.com/jqgridwiki/doku.php?id=wiki:predefined_formatter
            // integer, number, currency, date, email, link, showlink, checkbox, select, actions
            if (CBool(Tcolumn.formatter)) {
                Column.formatter = Tcolumn.formatter;;
            } else if (Column.datatype == 'date' || Column.datatype == 'datetime') {
                Column.formatter = 'date';;
            } else if (Column.datatype == 'currency') {
                Column.formatter = 'currency';

                // Else If Column.datatype = "url" Then
                // Column.formatter = 'link';
            } else if (Column.datatype == 'integer') {
                // Column.formatter = 'integer' // By making the formatter an integer, the data will be converted to an integer, and thus empty becomes 0;
            } else if (Column.datatype == 'autointeger') {
                Column.formatter = 'integer';;
            } else if (Column.datatype == 'double') {
                Column.formatter = 'number';;
            }

            if (Tcolumn.display == 'hidden' || Tcolumn.display == 'gridhidden') Column.hidden = true;

            // http://www.trirand.com/jqgridwiki/doku.php?id=wiki:common_rules
            Ctltype = LCase(Tcolumn.control);

            // edittype and editoptions only set if column is editable
            if (CBool(Tcolumn.canedit) || CBool(Tcolumn.editable)) {
                Column.editable = true;
                if (CBool(Tcolumn.edittype)) Column.edittype = Tcolumn.edittype;
                if (CBool(Tcolumn.editoptions)) Column.editoptions = Tcolumn.editoptions;
            } else {
                // Not editable
                Column.editable = false;
                if (Ctltype != 'button' && Ctltype != 'anchor' && Ctltype != 'urlbox' && Ctltype != 'url') Ctltype = '';
            }

            if (Not(Column.edittype) && Ctltype) {
                // *
                // * textbox, dropDownBox, combobox, listbox, autotextbox, datebox, timebox, datetimebox, imagebox, currencybox
                // *                maskedtextbox, radiobox, multiselectlistbox, multiselectdropDownBox, colorpick, slider
                // *                htmlbox, label, imagebox, uploadimagebox, appendbox, passwordbox
                // * ->
                // *      text, textarea, checkbox, select, password, button, image, file custom

                if (Ctltype == 'button') {
                    Column.formatter = '^^jqGridAddBtn^^';
                    Url = dropIfRight(CStr(Tcolumn.transferurl), '.page', true);
                    Column.editoptions = { "colName": Column.Name, "primaryKey": Pkid, "transferurl": Url, "transferto": Tcolumn.transferto, "transferaddfrompage": Tcolumn.transferaddfrompage, "transferextra": Tcolumn.onParentExtra, "datausuage": Tcolumn.datausuage, "title": Column.label };;
                } else if (Ctltype == 'imagebox') {
                    // Column.editable = false;
                } else if (Ctltype == 'checkbox') {
                    Column.edittype = 'checkbox';
                    Column.editoptions = { "value": '1:0' };
                    Column.formatter = 'checkbox';
                    Column.align = 'center';;
                } else if (Ctltype == 'label') {
                    Column.editable = false;;
                } else if (Ctltype == 'urlbox' || Ctltype == 'anchor') {
                    Column.formatter = '^^function (cellValue, myOptions, rowObject) { return "\<a href=" + urlEncode(cellValue) + " target=\'_blank\'\>...\</a\>";  }^^';;
                } else if (Ctltype == 'url') {
                    Column.formatter = '^^function (cellValue, myOptions, rowObject) { return "\<a href=" + urlEncode(cellValue) + " target=\'_blank\'\>" + cellValue + "\</a\>";  }^^';
                }
            }

            if (Right(Column.index, 1) == '#') {
                Column.sorttype = 'int';
                Column.index = Left(Column.index, Len(Column.index) - 1);
                if (Not(Column.align)) Column.align = 'right';
            } else if (Column.datatype == 'integer' || Column.datatype == 'autointeger') {
                Column.sorttype = 'int';
                if (Not(Column.index)) Column.index = Column.name;
                if (Not(Column.align)) Column.align = 'right';
            } else if (Column.datatype == 'double') {
                Column.sorttype = 'float';
                if (Not(Column.index)) Column.index = Column.name;
                if (Not(Column.align)) Column.align = 'right';
            } else {
                if (Not(Column.index)) Column.index = Column.name;
            }

            if (CBool(Myoptions.WidthMultiplier) && isNumeric(Column.width) && Len(Column.width)) Column.width = CNum(Column.width) * CNum(Myoptions.WidthMultiplier);

            // need a default row?
            if (CBool(Myoptions.allowInserts)) {
                if (CBool(Tcolumn.defaultvalue)) D = Tcolumn.defaultvalue; else D = Tcolumn.defaultValue;
                if (Not(D)) D = '';
                if (Column.control == 'json_inline') {
                    if (Left(D, 1) != '[' || Right(D, 1) != ']') {
                        if (Left(D, 1) == '{' && Right(D, 1) == '}') D = '[' + D + ']'; else D = '[]';
                    }
                    Js = parseJSON('{array:' + D + '}');
                    D = Js.array;
                }
                Defaultrow[Column.name] = D;
            }

            Column.resizable = true; // default

            Cols[Cols.length] = '\'' + CStr(Column.label) + '\'';

            Columnmodel[Columnmodel.length] = Column;
            if (CBool(Column.primarykey)) Pkid = Column.name;
        }
    }

    if (CBool(Myoptions.allowDeletes)) {
        Column = {};
        Column.name = 'jqGridAction';
        Column.label = 'Delete';
        Column.sortable = false;
        Column.width = '65px';
        Column.editable = false;
        Columnmodel[Columnmodel.length] = Column;
        Cols[Cols.length] = '\'' + CStr(Column.label) + '\'';
    }

    Tbl = Chr(28) + '\<table id=\'' + Jqgridid + '\' style=" position: relative; background-color: transparent;" \>\<tr\>\<td\>\</td\>\</tr\>\</table\>' + crlf + Chr(29);

    if (CBool(Myoptions.allowInserts) || CBool(Myoptions.allowUpdates) || CBool(Myoptions.allowDeletes)) {
        if (Not(Pkid)) Tbl += Chr(28) + 'You must setup a primary key column in order for your CRUD operations to work\<br /\>' + Chr(29);
    }

    if (CBool(Myoptions.allowInserts)) {
        Addbtn = Chr(28) + '\<input type="BUTTON" id="' + Jqgridid + '_newRow" value="New Row" onclick="jqGrid_NewRow(\'' + Jqgridid + '\', ' + Jqgridid + '_dr, ' + CStr(CNum(Myoptions.allowDeletes)) + ', \'' + Pkid + '\')" /\>' + Chr(29);
    }

    if (CBool(Myoptions.doPaging)) {
        Pager = Chr(28) + '\<div id="' + Jqgridid + '_pager"\>\</div\>' + Chr(29);
    }

    if (CBool(Myoptions.doPaging) || CBool(Myoptions.allowInserts)) {
        _Html += JSB_HTML_ROWS2('%', Tbl, '30px', Addbtn + Pager);
    } else {
        _Html += Tbl;
    }

    Joinedmodel = Join(CStr(Columnmodel, true), ',' + crlf);

    // Need to turn these (^^) back into non-JSON strings

    while (InStr1(1, Joinedmodel, '"^^')) {
        Lh = Field(Joinedmodel, '"^^', 1);
        Joinedmodel = dropLeft(Joinedmodel, '"^^');
        Arg = Field(Joinedmodel, '^^"', 1);
        Rh = dropIfLeft(Joinedmodel, '^^"');

        var Jarg = parseJSON('{ Arg: "' + Arg + '"}');
        Arg = Jarg.Arg;

        Joinedmodel = Lh + Arg + Rh;
    }

    S = '\r\n\
            // Initial column order for ' + Jqgridid + '\r\n\
            var ' + Jqgridid + '_cm = [' + Joinedmodel + '];\r\n\
            var ' + Jqgridid + '_dr = ' + CStr(Defaultrow) + '\r\n\
        ';

    if (System(1) == 'gae' || System(1) == 'aspx') {
        S += '\r\n\
              // Calc how many rows we can display\r\n\
              $(function() {\r\n\
           ';
    }

    S += '\r\n\
           var gheight = $("#' + Jqgridid + '").height();\r\n\
           var gwidth = $("#' + Jqgridid + '").width();\r\n\
        ';

    if (typeOf(Restfulnameordataarray) == 'Array') {
        D = Join(Restfulnameordataarray, ',');
        D = Change(D, am, '\\xFE');
        D = Change(D, crlf, '\\r\\n');
        D = Change(D, cr, '\\r');
        D = Change(D, lf, '\\n');

        S += '\r\n\
            var ' + Jqgridid + '_data = [' + D + ']\r\n\
            window.refreshData = function () {  }\r\n\
            \r\n\
            ' + Jqgridid + '_options = {\r\n\
                datatype: "local",\r\n\
                data: ' + Jqgridid + '_data,\r\n\
                scroll: 1,\r\n\
                rowNum: 9999,\r\n\
        ';
    } else {
        if (CBool(Myoptions.doPaging)) {
            S += '\r\n\
                var rowHeight = 23; //  $("#' + Jqgridid + ' tr").eq(1).height();\r\n\
                var rowsperpage = parseInt(gheight / rowHeight);\r\n\
            ';
        }

        S += '\r\n\
        window.refreshData = function () { $("#' + Jqgridid + '").trigger(\'reloadGrid\'); }\r\n\
\r\n\
        var ' + Jqgridid + '_options = {\r\n\
            url:' + jsEscapeString(CStr(Restfulnameordataarray)) + ',\r\n\
            datatype: "json",\r\n\
            ';
        if (CBool(Myoptions.doPaging)) {
            S += '\r\n\
            rowNum: rowsperpage,\r\n\
            rowList:[5, 10, 30, 60, 90, 200],\r\n\
            pager: \'#' + Jqgridid + '_pager\',\r\n\
            ';
        } else {
            S += '\r\n\
            rowNum: 9999,\r\n\
            scroll: 1,\r\n\
            ';
        }
    }

    if (CBool(Myoptions.width100percent)) Aw = 'true'; else Aw = 'false';
    S += '\r\n\
            colNames: [' + Join(Cols, ',') + '],\r\n\
            colModel: ' + Jqgridid + '_cm,\r\n\
            cmTemplate: { autoResizable: true },\r\n\
            autoresizeOnLoad: true,\r\n\
            multiselect: false,\r\n\
            gridview: true, // makes it faster but prohibits the use of treeGrid and subGrid\r\n\
            sortable: true, // allow column reordering\r\n\
            height: \'98%\',\r\n\
            autowidth: ' + Aw + ',\r\n\
            ignoreCase: true,\r\n\
            caption: ' + jsEscapeString(CStr(Myoptions.caption)) + ',\r\n\
            sortname: ' + jsEscapeString(CStr(Myoptions.sortname)) + ',\r\n\
            sortorder:' + jsEscapeString(CStr(Myoptions.sortorder)) + ',\r\n\
            sortable: {\r\n\
                update: function () { saveColumnStates("' + Jqgridid + '") }\r\n\
            },\r\n\
\r\n\
            gridComplete: function() { jqGrid_gridComplete(\'' + Jqgridid + '\')},\r\n\
            loadComplete: function(data) { jqGrid_loadComplete(\'' + Jqgridid + '\')},\r\n\
            \r\n\
            resizeStop: function () { saveColumnStates("' + Jqgridid + '") },\r\n\
\r\n\
            onSelectRow: function(id, a, dataRow) { \r\n\
                // jqGrid_onSelectRow() will call eventHandler_eventHandler_rowSelected() - Setup your events with JSB_BF @genEventHandler("rowSelected", ...)\r\n\
                jqGrid_onSelectRow(dataRow, \'' + Jqgridid + '\', id) \r\n\
            },\r\n\
            ondblClickRow: function(id, a, b, e) { \r\n\
                // jqGrid_ondblClickRow() will call eventHandler_dblClickRow() - Setup your events with JSB_BF @genEventHandler("dblClickRow", ...)\r\n\
                jqGrid_ondblClickRow(e, \'' + Jqgridid + '\', id) \r\n\
            },\r\n\
            \r\n\
            altRows:true,\r\n\
        };\r\n\
        \r\n\
        jqGrid_Create("' + Jqgridid + '", ' + CStr(Myoptions) + ', ' + Jqgridid + '_options, \'' + Pkid + '\');\r\n\
        \r\n\
        function ' + Jqgridid + '_refresh() {\r\n\
             $(\'' + Jqgridid + '\').trigger(\'reloadGrid\'); \r\n\
        }\r\n\
        ';

    if (System(1) == 'gae' || System(1) == 'aspx') {
        S += '\r\n\
          });\r\n\
       ';;
    }

    return _Html + JSB_HTML_SCRIPT(S);
}
// </JQGRID2>

// <JQGRIDDEFAULTMODEL>
function JSB_HTML_JQGRIDDEFAULTMODEL(Rows) {
    var M = undefined;
    var Js = undefined;
    var S = undefined;
    var Name = '';
    var V = '';
    var Vtype = '';

    M = [undefined,];

    if (Len(Rows)) {
        Js = parseJSON(Rows[1]);
        for (Name of iterateOver(Js)) {
            V = Js[Name];
            S = {};
            S.name = Name;
            S.index = Name;
            S.label = UCase(Left(Name, 1)) + Mid1(Name, 2);
            S.width = 150;

            Vtype = typeOf(V);
            if (Left(V, 7) == 'http://' || Left(V, 8) == 'https://') {
                S.control = 'anchor';
                S.width = 15;
                S.sortable = false;;
            } else if (Vtype == 'Double') {
                S.datatype = 'double';
                S.width = 80;;
            } else if (Vtype == 'Integer' || (isNumeric(V) && !isNothing(V))) {
                S.datatype = 'integer';
                S.width = 80;;
            }

            M[M.length] = S;
        }
    } else {
        M[M.length] = { "name": 'no rows' }
    }

    return M;
}
// </JQGRIDDEFAULTMODEL>

// <MULTISELECTLISTBOX>
function JSB_HTML_MULTISELECTLISTBOX(Id, Values, Defaults, Additionalattributes, Binding, Itemwidth) {
    // local variables
    var J;

    var Delimiter = '';
    var Svals = CStr(Values, true);

    if (InStr1(1, Svals, am)) {
        Delimiter = am;
    } else if (InStr1(1, Svals, vm)) {
        Delimiter = vm;
    } else if (InStr1(1, Svals, svm)) {
        Delimiter = svm;
    } else if (InStr1(1, Svals, ';')) {
        Delimiter = ';';
    } else if (InStr1(1, Svals, ',')) {
        Delimiter = ',';
    } else {
        if (CBool(Binding)) Delimiter = ','; else Delimiter = am;
    }

    var Vals = Split(Change(Svals, Delimiter + ' ', Delimiter), Delimiter);
    if (Defaults == '*') Defaults = Vals;

    Defaults = Change(Defaults, Delimiter + ' ', Delimiter);

    var Xh = '';
    if (Itemwidth) { Xh = ' style=\'display: inline; list-style-type: none; padding-right: 20px; width: ' + CStr(Itemwidth) + '; overflow-x:hidden; white-space:nowrap;\''; }
    var Defs = Split(Defaults, Delimiter);

    if (CBool(Binding)) {
        var Onupdate = 'onupdate: function (input, bindingContext) { multiSelectReflectValues(input) }';
        Binding = JSB_BF_MERGEATTRIBUTE('data-bind', Onupdate, ',', Binding);
    } else {
        Binding = '';
    }

    var _Html = Chr(28) + '\<div class=\'check-list form-control\' ' + JSB_BF_UIADDITIONALATTRIBUTES(Additionalattributes) + '\>\r\n\
          \<span class="anchor"\>\<input id="' + CStr(Id) + '" name="' + CStr(Id) + '" style="height: 100%" type=\'textbox\' ' + Join(Binding, ' ') + ' value=\'' + Join(Defaults, ',') + '\' ' + dataAdditionalAttributes(Additionalattributes) + ' /\>\</span\>\r\n\
          \<ul class="listbox-items" style="white-space: normal"\>' + crlf + Chr(29);

    var I = undefined;
    var V = undefined;

    I = LBound(Vals) - 1;
    for (V of iterateOver(Vals)) {
        I++;
        var Checked = '';
        var _ForEndI_10 = DCount(Defaults, Delimiter);
        for (J = 1; J <= _ForEndI_10; J++) {
            if (V == Field(Defaults, Delimiter, J)) {
                Checked = 'checked ';
                break;
            }
        }

        _Html += Chr(28) + '\<li' + Xh + '\>\<input type=\'checkbox\' ' + Checked + ' onchange=\'multiSelectCheckBoxChanged(this);\' /\>' + Chr(29) + CStr(V) + Chr(28) + '\</li\>' + crlf + Chr(29);
    }

    _Html += Chr(28) + '\</ul\>\</div\>' + crlf + Chr(29);

    return _Html;

}
// </MULTISELECTLISTBOX>

// <MVTREE>
async function JSB_HTML_MVTREE(Mvtree) {
    // Convert to JSON structure
    var Secondlevel = undefined;
    var Subsubcaption = '';
    var Ami = undefined;
    var Vmi = undefined;
    var Svmi = undefined;
    var Jsfolder1 = undefined;
    var Jsfolder2 = undefined;
    var Treefolders = undefined;
    var Folder = '';
    var Foldername = '';
    var Subcaption = '';
    var Folder2name = '';

    Treefolders = {};

    Ami = LBound(Split(Mvtree, am)) - 1;
    for (Folder of iterateOver(Split(Mvtree, am))) {
        Ami++;
        Secondlevel = [undefined,];
        Foldername = Extract(Folder, 1, 1, 1);
        Folder = Delete(Folder, 1, 1, 0);
        Treefolders[Foldername] = {}; // id: "F_":AmI

        Jsfolder1 = Treefolders[Foldername];
        Vmi = LBound(Split(Folder, vm)) - 1;
        for (Subcaption of iterateOver(Split(Folder, vm))) {
            Vmi++;
            if (InStr1(1, Subcaption, svm)) {
                Folder2name = Extract(Subcaption, 1, 1, 1);
                Subcaption = Delete(Subcaption, 1, 1, 1);

                Jsfolder1[Folder2name] = {}; // id: "F_":AmI:"_":VmI
                Jsfolder2 = Jsfolder1[Folder2name];
                Svmi = LBound(Split(Subcaption, svm)) - 1;
                for (Subsubcaption of iterateOver(Split(Subcaption, svm))) {
                    Svmi++;
                    if (Subsubcaption) { Jsfolder2[Subsubcaption] = { "id": 'A_' + CStr(Ami) + '_' + CStr(Vmi) + '_' + CStr(Svmi) } }
                }
            } else {
                if (Subcaption) { Jsfolder1[Subcaption] = { "id": 'A_' + CStr(Ami) + '_' + CStr(Vmi) } }
            }
        }
    }

    return JSONTree(CStr(Treefolders));
}
// </MVTREE>

// <NANOGALLERY>
function JSB_HTML_NANOGALLERY(Id, Userid, Theme, Colorscheme) {
    var _Html = '';

    if (Not(Theme)) Theme = 'default';
    if (Not(Colorscheme)) Colorscheme = 'none';

    _Html = Head(JsLink('//cdnjs.cloudflare.com/ajax/libs/nanogallery/5.1.1/jquery.nanogallery.min.js'));
    _Html += Head(CssLink('//cdnjs.cloudflare.com/ajax/libs/nanogallery/5.1.1/css/nanogallery.min.css'));

    if (Not(Userid)) Userid = '110070799136410122654';
    _Html += Chr(28) + '\r\n\
      \<div id="' + CStr(Id) + '" name="' + CStr(Id) + '"\>\</div\>\r\n\
\r\n\
      \<script type="text/javascript"\> \r\n\
    ';
    if (System(1) == 'gae' || System(1) == 'aspx') { _Html += ' $(document).ready(function () { '; }

    _Html += '\r\n\
          $("#' + CStr(Id) + '").nanoGallery({\r\n\
            kind: \'picasa\',\r\n\
            userID: \'' + Userid + '\',\r\n\
            colorScheme: \'' + Userid + '\',\r\n\
          });\r\n\
        ';
    if (System(1) == 'gae' || System(1) == 'aspx') { _Html += ' }); '; }

    _Html += ' \</script\> ' + Chr(29);
    return _Html;
}
// </NANOGALLERY>

// <NICEDITOR>
function JSB_HTML_NICEDITOR(Id, Defaultvalue, Oncontextmenu, Additionalattributes) {
    var _Html = '';
    var Styleribbonbar = '';
    var S = '';

    Defaultvalue = Change(Defaultvalue, Chr(254), '\<br /\>');

    // This code was intended to insure that all the DIVs were balanced - didn't work to good
    if (InStr1(1, Defaultvalue, 'class="docExample"') && false) {
        Defaultvalue = (Change(Defaultvalue, '\<div', '&lt;div'));
        Defaultvalue = (Change(Defaultvalue, '&lt;div class="docExample"', '\<div class="docExample"'));
        Defaultvalue = (Change(Defaultvalue, '\</div\>', '&lt;/div&gt;'));
    }

    _Html = Head(JsLink(jsbRoot() + 'js/nicEdit.js'));
    _Html += Head(JsLink(jsbRoot() + 'js/jquery/jquery.tooltip.pack.js'));

    // When do we display the button bar?
    if (Oncontextmenu) {
        Styleribbonbar = ' style="position: static; display: none; top: 0; left: 130px; border: 1,solid; width: 770px"';

        _Html += Chr(28) + '\<div id="' + CStr(Id) + '_nicBtns" style="position:relative; display: none; "\>' + crlf + Chr(29);
        _Html += JSB_HTML_SUBMITBTN(CStr(Id) + '_formbtn', 'Save', 'Save');
        _Html += JSB_HTML_SUBMITBTN(CStr(Id) + '_formbtn', 'Cancel', 'Cancel');
        _Html += Chr(28) + '   \<div id="' + CStr(Id) + '_myNicPanel"' + Styleribbonbar + '\>\</div\>' + crlf + Chr(29);
        _Html += Chr(28) + '\</div\>' + crlf + Chr(29);
    } else {
        _Html += html('\<div id="' + CStr(Id) + '_myNicPanel" style="width: 770px; position: fixed;"\>\</div\>');
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'margin-top: 30px', ';', Additionalattributes);
    }

    // results get placed here
    _Html += Chr(28) + '\<input id="' + CStr(Id) + '" name="' + CStr(Id) + '" type=\'hidden\' /\>' + crlf + Chr(29);

    // Nic editor displays here
    _Html += Chr(28) + '\<div id="x_' + CStr(Id) + '" ' + joinAttributes(Additionalattributes) + ' class="nicEditorDiv"\>' + Change(Defaultvalue, Chr(254), '\<br /\>') + '\</div\>' + crlf + Chr(29);

    if (Not(Oncontextmenu)) {
        // Html = @Rows2("30px", @Html(`<div id="`:ID:`_myNicPanel"></div>`), "%", Html, "", "overflow:auto" );
    }

    if (Oncontextmenu) {
        if (Null0(Oncontextmenu) == true) {
            _Html += CStr(AttachToEvent('#x_' + CStr(Id), 'contextmenu', 'function (e) { return ' + CStr(Id) + '_cMenu(e, this) }'));
            S = Replace(S, -1, 0, 0, 'function ' + CStr(Id) + '_cMenu(e) {');
            S = Replace(S, -1, 0, 0, '   if ($(\'#' + CStr(Id) + '_myNicPanel\').is(\':visible\')) return true;');
            S = Replace(S, -1, 0, 0, '   var cMenu = $("\<ul id=\'contextMenu\' /\>");');
            S = Replace(S, -1, 0, 0, '   $(cMenu).append(\'\<li onclick="' + CStr(Id) + '_EnableEditing()"\>Edit HTML\</li\>\');');
            S = Replace(S, -1, 0, 0, '   return jsbContentMenu(e, cMenu)');
            S = Replace(S, -1, 0, 0, '}');
        }

        S = Replace(S, -1, 0, 0, 'function ' + CStr(Id) + '_EnableEditing(e, fromObj) {');
    } else {
        if (System(1) == 'gae' || System(1) == 'aspx') { S = Replace(S, -1, 0, 0, '$( document ).ready( function () {'); }
    }

    S = Replace(S, -1, 0, 0, '   var myNicEditor = new nicEditor({ fullPanel : true });');
    S = Replace(S, -1, 0, 0, '   $(\'#' + CStr(Id) + '_myNicPanel\').show()');
    S = Replace(S, -1, 0, 0, '   $(\'#' + CStr(Id) + '_nicBtns\').show()');
    S = Replace(S, -1, 0, 0, '   myNicEditor.setPanel(\'' + CStr(Id) + '_myNicPanel\');');
    S = Replace(S, -1, 0, 0, '   myNicEditor.addInstance("x_' + CStr(Id) + '");');

    // Disable labels from jumping to their corresponding controls
    S = Replace(S, -1, 0, 0, '   disableLabelJump();');

    if (Oncontextmenu) {
        S = Replace(S, -1, 0, 0, '   $("#x_' + CStr(Id) + '").focus();');
        S = Replace(S, -1, 0, 0, '}');
    } else {
        if (System(1) == 'gae' || System(1) == 'aspx') { S = Replace(S, -1, 0, 0, '});'); }
    }

    S = Replace(S, -1, 0, 0, '$("#jsb").on("submit.' + CStr(Id) + '", function( event ) {');
    S = Replace(S, -1, 0, 0, '   var nicE = new nicEditors.findEditor("x_' + CStr(Id) + '");');
    S = Replace(S, -1, 0, 0, '   if (nicE.getContent) {');
    S = Replace(S, -1, 0, 0, '      var nicContent = nicE.getContent()');
    S = Replace(S, -1, 0, 0, '   } else {');
    S = Replace(S, -1, 0, 0, '      var nicContent = $(\'#x_' + CStr(Id) + '\').html()');
    S = Replace(S, -1, 0, 0, '   }');
    S = Replace(S, -1, 0, 0, '   nicContent = Change(nicContent, "\</div\>", "\</div \>")');
    S = (Replace(S, -1, 0, 0, '   nicContent = Change(nicContent, "&lt;div", "\<div")'));
    S = (Replace(S, -1, 0, 0, '   nicContent = Change(nicContent, "&lt;/div&gt;", "\</div\>")'));
    S = Replace(S, -1, 0, 0, '   $("#' + CStr(Id) + '").val(nicContent);');
    S = Replace(S, -1, 0, 0, '');
    S = Replace(S, -1, 0, 0, '   unloadDynamicScript("' + CStr(Id) + '_cMenu")');
    S = Replace(S, -1, 0, 0, '   unloadDynamicScript("' + CStr(Id) + '_EnableEditing")');
    S = Replace(S, -1, 0, 0, '   unloadDynamicScript("' + CStr(Id) + '_nicBtns")');
    S = Replace(S, -1, 0, 0, '   unloadDynamicScript("' + CStr(Id) + '_myNicPanel")');
    S = Replace(S, -1, 0, 0, '   unloadDynamicScript("' + CStr(Id) + '_formbtn")');
    S = Replace(S, -1, 0, 0, '   unloadDynamicScript("x_' + CStr(Id) + '")');
    S = Replace(S, -1, 0, 0, '');
    S = Replace(S, -1, 0, 0, '  $("#jsb").off("submit.' + CStr(Id) + '");');

    S = Replace(S, -1, 0, 0, '});');

    _Html += JSB_HTML_SCRIPT(S);

    return _Html;

}
// </NICEDITOR>

// <NOUISLIDER>
function JSB_HTML_NOUISLIDER(Id, Defaultvalue, Readonly, Additionalattributes, Minvalue, Maxvalue, Size, _Color, Units) {
    var Onchange = undefined;
    var Required = undefined;
    var _Html = '';
    var Ct = '';
    var Aa = '';

    _Html = Head(CssLink(jsbRoot() + 'css/nouislider.css'));
    _Html += Head(JsLink(jsbRoot() + 'js/nouislider.js'));

    if (!Minvalue) Minvalue = 0;
    if (Maxvalue === undefined) Maxvalue = 100; else Maxvalue = CNum(Maxvalue);
    if (Readonly) Ct = 'NOUISLIDER_ReadOnly'; else Ct = 'NOUISLIDER';
    if (Readonly) Readonly = ' readonly'; else Readonly = '';
    if (Size) { Size = '; width: ' + CStr(Size); }
    if (Additionalattributes === undefined) Additionalattributes = [undefined,];

    Onchange = Additionalattributes['onchange'];
    if (!Onchange) Onchange = Additionalattributes['onupdate'];

    Aa = JSB_BF_MERGEATTRIBUTE('class', Ct, ' ', Additionalattributes);

    _Html += Chr(28) + '\<div id=\'slider_' + CStr(Id) + '\' ' + JSB_BF_UIADDITIONALATTRIBUTES(Aa) + ' style="margin-right: 5px; margin-top: 40px; margin-bottom: 10px; form-control' + Size + '"\>\</div\>';
    _Html += '\<input id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\'' + CStr(Readonly) + ' style=\'display:none\' ' + dataAdditionalAttributes(Aa) + '/\>' + Chr(29);

    _Html += JSB_HTML_SCRIPT('\r\n\
        var nouiSlider_' + CStr(Id) + ' = document.getElementById(\'slider_' + CStr(Id) + '\');\r\n\
\r\n\
        noUiSlider.create(nouiSlider_' + CStr(Id) + ', {\r\n\
         start: ' + CStr(CNum(Defaultvalue)) + ',\r\n\
            tooltips: true,\r\n\
            step: 1,\r\n\
         behaviour: \'none\',\r\n\
         range: {\r\n\
          \'min\': ' + CStr(Minvalue) + ',\r\n\
          \'max\': ' + CStr(Maxvalue) + '\r\n\
         },\r\n\
         format: {\r\n\
           to: function ( value ) {\r\n\
          return Field(value, \'.\', 1)' + (Units ? ' + \'&nbsp' + CStr(Units) + '\'' : '') + '\r\n\
           },\r\n\
           from: function ( value ) {\r\n\
          return ' + (Units ? 'parseInt(value)' : 'value') + '\r\n\
           }\r\n\
         }\r\n\
        });\r\n\
    ');

    if (!Minvalue) { if (Locate('required', Additionalattributes, 0, 0, 0, "", position => { })) Required = true; }

    if (Required) {
        _Html += JSB_HTML_SCRIPT('\r\n\
            nouiSlider_' + CStr(Id) + '.noUiSlider.on(\'update\', function( values, handle, unencoded, tap, positions ) {\r\n\
             var value = parseInt(values[handle]);\r\n\
             if (value) {\r\n\
                 var myInput = document.getElementById(\'' + CStr(Id) + '\');\r\n\
                  myInput.value = value;\r\n\
                  if ($(myInput).parsley && $(myInput).parsley().reset) $(myInput).parsley().reset()\r\n\
                  $(myInput).trigger("change")\r\n\
                }\r\n\
            });  \r\n\
        ');
    } else {
        _Html += JSB_HTML_SCRIPT('\r\n\
            nouiSlider_' + CStr(Id) + '.noUiSlider.on(\'update\', function( values, handle, unencoded, tap, positions ) {\r\n\
               var value = parseInt(values[handle]);\r\n\
               var myInput = document.getElementById(\'' + CStr(Id) + '\');\r\n\
               myInput.value = parseInt(value);\r\n\
               if ($(myInput).parsley && $(myInput).parsley().reset) $(myInput).parsley().reset()\r\n\
               $(myInput).trigger("change")\r\n\
            });  \r\n\
        ');
    }

    if (_Color) _Html += JSB_HTML_SCRIPT('$(\'#slider_' + CStr(Id) + ' \> .noUi-base\').css(\'background-color\', \'' + CStr(_Color) + '\')');
    if (Onchange) { _Html += JSB_HTML_SCRIPT('$(\'#' + CStr(Id) + '\').change(function (e) { ' + CStr(Onchange) + ' });'); }
    return _Html;

}
// </NOUISLIDER>

// <ONSWIPE>
async function JSB_HTML_ONSWIPE() {
}
// </ONSWIPE>

// <ONSWIPEDOWN>
async function JSB_HTML_ONSWIPEDOWN(Id, Submitvalue) {
    var _Html = '';

    if (Not(Submitvalue)) Submitvalue = 'SWIPEDDOWN';

    if (System(1) == 'js') {
        return JSB_HTML_SCRIPT('\r\n\
          enableSwipes();\r\n\
          onSwipedDown = function () { \r\n\
             parsleyDestroy();\r\n\
             assignBtn(\'' + CStr(Id) + '\', \'' + Submitvalue + '\'); \r\n\
             if (!ProcessQ.length) { ProcessQ.push(pauseRoutine); setTimeout(go, 30); }\r\n\
          }');
    } else {
        _Html = (Chr(28) + '\<button id=\'swipe_down\' name=\'' + CStr(Id) + '\'" type=\'submit\' class=\'SubmitBtn\' style=\'display: none\' value=\'' + Submitvalue + '\'\>Swipe Left\</button\>&nbsp;' + Chr(29));
        return _Html + JSB_HTML_SCRIPT('\r\n\
          enableSwipes();\r\n\
          onSwipedDown = function () { \r\n\
             parsleyDestroy();\r\n\
             $(\'#swipe_down\').trigger(\'click\'); \r\n\
          }');
    }
}
// </ONSWIPEDOWN>

// <ONSWIPELEFT>
async function JSB_HTML_ONSWIPELEFT(Id, Submitvalue) {
    var _Html = '';

    if (Not(Submitvalue)) Submitvalue = 'SWIPEDLEFT';

    if (System(1) == 'js') {
        return JSB_HTML_SCRIPT('\r\n\
          enableSwipes();\r\n\
          onSwipedLeft = function () { \r\n\
             parsleyDestroy();\r\n\
             assignBtn(\'' + CStr(Id) + '\', \'' + Submitvalue + '\'); \r\n\
             if (!ProcessQ.length) { ProcessQ.push(pauseRoutine); setTimeout(go, 30); }\r\n\
          }');
    } else {
        _Html = (Chr(28) + '\<button id=\'swipe_Left\' name=\'' + CStr(Id) + '\'" type=\'submit\' class=\'SubmitBtn\' style=\'display: none\' value=\'' + Submitvalue + '\'\>Swipe Left\</button\>&nbsp;' + Chr(29));
        return _Html + JSB_HTML_SCRIPT('\r\n\
          enableSwipes();\r\n\
          onSwipedLeft = function () { \r\n\
             parsleyDestroy();\r\n\
             $(\'#swipe_Left\').trigger(\'click\'); \r\n\
          }');
    }
}
// </ONSWIPELEFT>

// <ONSWIPERIGHT>
async function JSB_HTML_ONSWIPERIGHT(Id, Submitvalue) {
    var _Html = '';

    if (Not(Submitvalue)) Submitvalue = 'SWIPEDRIGHT';

    if (System(1) == 'js') {
        return JSB_HTML_SCRIPT('\r\n\
          enableSwipes();\r\n\
          onSwipedRight = function () { \r\n\
             parsleyDestroy();\r\n\
             assignBtn(\'' + CStr(Id) + '\', \'' + Submitvalue + '\'); \r\n\
             if (!ProcessQ.length) { ProcessQ.push(pauseRoutine); setTimeout(go, 30); }\r\n\
          }');
    } else {
        _Html = (Chr(28) + '\<button id=\'swipe_right\' name=\'' + CStr(Id) + '\'" type=\'submit\' class=\'SubmitBtn\' style=\'display: none\' value=\'' + Submitvalue + '\'\>Swipe Left\</button\>&nbsp;' + Chr(29));
        return _Html + JSB_HTML_SCRIPT('\r\n\
          enableSwipes();\r\n\
          onSwipedRight = function () { \r\n\
             parsleyDestroy();\r\n\
             $(\'#swipe_right\').trigger(\'click\'); \r\n\
          }');
    }
}
// </ONSWIPERIGHT>

// <ONSWIPEUP>
async function JSB_HTML_ONSWIPEUP(Id, Submitvalue) {
    var _Html = '';

    if (Not(Submitvalue)) Submitvalue = 'SWIPEDUP';

    if (System(1) == 'js') {
        return JSB_HTML_SCRIPT('\r\n\
          enableSwipes();\r\n\
          onSwipedUp = function () { \r\n\
             parsleyDestroy();\r\n\
             assignBtn(\'' + CStr(Id) + '\', \'' + Submitvalue + '\'); \r\n\
             if (!ProcessQ.length) { ProcessQ.push(pauseRoutine); setTimeout(go, 30); }\r\n\
          }');
    } else {
        _Html = (Chr(28) + '\<button id=\'swipe_up\' name=\'' + CStr(Id) + '\'" type=\'submit\' class=\'SubmitBtn\' style=\'display: none\' value=\'' + Submitvalue + '\'\>Swipe Left\</button\>&nbsp;' + Chr(29));
        return _Html + JSB_HTML_SCRIPT('\r\n\
          enableSwipes();\r\n\
          onSwipedUp = function () { \r\n\
             parsleyDestroy();\r\n\
             $(\'#swipe_up\').trigger(\'click\'); \r\n\
          }');
    }
}
// </ONSWIPEUP>

// <PARA>
function JSB_HTML_PARA(Classname, Content, Additionalattributes) {
    var _Html = '';

    if (Content === undefined) {
        Content = Classname;
        Classname = '';
    }

    _Html = Chr(28) + '\<p class=\'' + Classname + '\'';
    if (Additionalattributes) _Html += joinAttributes(Additionalattributes);
    _Html += '\>\<span\>' + Chr(29);
    _Html += Content;
    _Html += Chr(28) + '\</span\>\</p\>' + Chr(29);
    return _Html;
}
// </PARA>

// <PASSWORDBOX>
function JSB_HTML_PASSWORDBOX(Id, Defaultvalue, Readonly, Additionalattributes) {
    var _Html = '';

    if (isJSON(Defaultvalue) || CBool(isArray(Defaultvalue))) {
        Additionalattributes = Defaultvalue;
        Defaultvalue = '';
    }

    if (isJSON(Readonly) || CBool(isArray(Readonly))) {
        Additionalattributes = Readonly;
        Readonly = false;
    }

    if (CBool(Readonly)) {
        _Html = Chr(28) + '\<input id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\' tabindex=\'-1\' readonly ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'PasswordBox_ReadOnly form-control', ' ', Additionalattributes), ' ');
    } else {
        _Html = Chr(28) + '\<input id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\' ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'PasswordBox form-control', ' ', Additionalattributes), ' ');
    }

    _Html += 'type=\'password\' value=\'' + Chr(29) + CStr(Defaultvalue) + Chr(28) + '\' /\>' + Chr(29);
    return _Html;
}
// </PASSWORDBOX>

// <PRETTYPRINT>
function JSB_HTML_PRETTYPRINT(Jscode) {
    var _Html = '';

    _Html = Head(JsLink('//cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js'));

    Jscode = Change(Jscode, am, crlf);
    _Html += Chr(28) + '\<div style="height:100%; overflow: auto; margin: 0; padding: 0; border: 0;"\>\<code class="prettyprint"\>' + Change(Change(htmlEncode(Jscode), Chr(10), '\<br/\>'), ' ', '&nbsp;') + '\</code\>\</div\>' + crlf + Chr(29);

    return _Html;
}
// </PRETTYPRINT>

// <PROGRESSBAR>
function JSB_HTML_PROGRESSBAR(Id, Additionalattributes) {
    var _Html = '';

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'height:1.4em', ';', Additionalattributes);
    _Html = Chr(28) + '\<div id=\'' + CStr(Id) + '\' class=\'progress\' ' + joinAttributes(Additionalattributes) + '\>';
    _Html += '\<div id=\'' + CStr(Id) + '_bar\' class=\'progress-bar\' role=\'progressbar\'\>';
    _Html += '\<span id=\'' + CStr(Id) + '_text\'\>\</span\>';
    _Html += '\</div\>\</div\>\<script\>$(\'#' + CStr(Id) + '\').css(\'z-index\', window.nextZIndex())\</script\>' + Chr(29);
    return _Html;
}
// </PROGRESSBAR>

// <RADIOBTNS>
function JSB_HTML_RADIOBTNS(Id, Values, Default, Readonly, Additionalattributes, Multivalueddata) {
    var Opts = undefined;
    var Vals = undefined;
    var Vi = undefined;
    var Xoa = undefined;
    var Subdelimiter = '';
    var Crlf = '';
    var Founddefaultvalue = undefined;
    var Ia = '';
    var S2 = '';
    var Name = '';
    var V = '';
    var S = '';
    var Display = '';
    var Oa = '';
    var _Div = '';

    Vals = makeArray(Values); Subdelimiter = activeProcess.At_Ni;
    if (!InStr1(1, Values, Subdelimiter)) Subdelimiter = '';

    Crlf = crlf;
    Founddefaultvalue = false;
    Opts = [undefined,];

    Ia = dataAdditionalAttributes(Additionalattributes);
    if (Ia) Ia = ' ' + Ia;
    Ia += ' data-parsley-errors-container="#' + CStr(Id) + '_errors" ';

    if (Readonly) S2 = ' tabindex=\'-1\' readonly'; else S2 = '';

    if (Id) Name = ' name=\'' + CStr(Id) + '\'';

    if (Subdelimiter) {
        Vi = LBound(Vals) - 1;
        for (V of iterateOver(Vals)) {
            Vi++;
            S = '';
            if (InStr1(1, V, Subdelimiter)) {

                Display = Field(V, Subdelimiter, 1);
                V = dropLeft(CStr(V), Subdelimiter);
                if (V == Default && Len(Default)) { S = ' checked'; Founddefaultvalue = true; }
                Opts[Opts.length] = '\<input type=\'radio\' class=\'RadioBtn\'' + Name + Ia + S2 + S + ' value="' + V + '"\>\<label for="' + Name + '"/\>' + htmlEscape(Display) + '\</label\>';
            } else {
                if (V == Default && Len(Default)) { S = ' checked'; Founddefaultvalue = true; }
                Opts[Opts.length] = '\<input type=\'radio\' class=\'RadioBtn\'' + Name + Ia + S2 + S + ' value="' + '\>\<label for="' + Name + '"/\>' + htmlEscape(V) + '\</label\>';
            }
            // IA = "" * for knockout
        };
    } else if (CBool(Vals)) {
        Vi = LBound(Vals) - 1;
        for (V of iterateOver(Vals)) {
            Vi++;
            S = '';
            if (V == Default && Len(Default)) { S = ' checked'; Founddefaultvalue = true; }
            Opts[Opts.length] = '\<input type=\'radio\' class=\'RadioBtn\'' + Name + Ia + S2 + S + ' value="' + V + '"\>\<label for="' + Name + '"/\>' + htmlEscape(V) + '\</label\>';
            // IA = ""  * for knockout
        }
    }

    if (!Founddefaultvalue && Len(Default)) {
        Opts[Opts.length] = '\<input type=\'radio\' class=\'RadioBtn\'' + Name + S2 + ' checked' + ' value="' + CStr(Default) + '"/\>' + htmlEscape(Default) + '\</label\>';
    }

    Oa = JSB_BF_UIADDITIONALATTRIBUTES(Additionalattributes);
    if (Readonly) {
        Xoa[Xoa.length] = 'onfocus="this.defaultIndex=this.selectedIndex;"';
        Xoa[Xoa.length] = 'onchange="this.selectedIndex=this.defaultIndex;"';
    }

    _Div = html('\<fieldset class=\'RadioBtnsFrame form-control\' ' + Oa + '\>\r\n\
                      \<div class=\'RadioBtnsDiv\' id="' + CStr(Id) + '" ' + Oa + '\>' + Crlf + Join(Opts, Crlf) + Crlf + '\r\n\
                      \</div\>\r\n\
                   \</fieldset\>\r\n\
                   \<div id="' + CStr(Id) + '_errors" style="display: inline-block"\>\</div\>\r\n\
                 ');

    return _Div;

}
// </RADIOBTNS>

// <RELOADDATALISTFROMURL_ONPARENT_CHANGE>
function JSB_HTML_RELOADDATALISTFROMURL_ONPARENT_CHANGE(Id, Changeon_Parentid, Quotedurl, Jsloadroutine) {
    var Onsuccess = '';
    var Script = '';

    Script = ('\r\n\
        function ' + CStr(Id) + '_' + CStr(Changeon_Parentid) + '_OnChange(pObj, newid, childCtl, firstLoad) {\r\n\
            var parentObj = pObj;\r\n\
            \r\n\
            if (!childCtl) childCtl = findMyCompanion(parentObj, \'' + CStr(Id) + '\')\r\n\
            if (!childCtl) return alert(\'Unable to find matching companion of ' + CStr(Id) + '\');\r\n\
            \r\n\
            var Url = ' + CStr(Quotedurl) + ';\r\n\
            var NewID = newid;\r\n\
            Url = urlCtlSubstitutions(Url, { id: newid, ' + CStr(Changeon_Parentid) + ': newid })\r\n\
\r\n\
            // Check if already loaded \r\n\
            var lastFetch = CStr($(parentObj).data(\'lastFetch_' + CStr(Id) + '\'));\r\n\
            if (lastFetch == "..pending..") return\r\n\
            \r\n\
            if (lastFetch && lastFetch == CStr(newid)) {\r\n\
                var a = $(parentObj).data(\'lastFetchData_' + CStr(Id) + '\');\r\n\
                if (a) ' + CStr(Jsloadroutine) + ';\r\n\
                return\r\n\
            }\r\n\
            \r\n\
            if (formVar(pObj) != newid) window._isDirty = true;\r\n\
            \r\n\
\r\n\
            $(parentObj).data(\'lastFetch_' + CStr(Id) + '\', "..pending..");\r\n\
         ');
    // OnSuccess for AJax
    Onsuccess = '\r\n\
            $(parentObj).data(\'lastFetchData_' + CStr(Id) + '\', []);\r\n\
            var a;\r\n\
            for(var key in json) { \r\n\
               a = json[key];\r\n\
               if (isArray(a)) { \r\n\
                   $(parentObj).data(\'lastFetchData_' + CStr(Id) + '\', a);\r\n\
                   break;\r\n\
                }\r\n\
            }\r\n\
            \r\n\
            ' + CStr(Jsloadroutine) + '\r\n\
\r\n\
            $(parentObj).data(\'lastFetch_' + CStr(Id) + '\', NewID);\r\n\
         ';

    // QuotedUrl, jsSuccess, jsFailure, PostPayLoad, infoMsg, HeaderJSON, Ok2Cache)
    Script += CStr(ajax('Url', Onsuccess, undefined, undefined, undefined, undefined, true)) + '\r\n\
      }\r\n\
    ';
    return JSB_HTML_SCRIPT(Script);

}
// </RELOADDATALISTFROMURL_ONPARENT_CHANGE>

// <REPEATERHTML>
function JSB_HTML_REPEATERHTML(Id, Tag, Outerhtmlprefix, _Innerhtml, Outerhtmlsuffix, Parentmodel) {
    var _Html = undefined;
    var Crlf = '';
    var Koid = '';

    _Html = [undefined,];
    Crlf = html(crlf);

    if (Parentmodel) Koid = JSB_BF_NICENAME(Change(Parentmodel, '().', '_')) + CStr(Id); else Koid = JSB_BF_NICENAME(CStr(Id));

    if (Parentmodel) {
        _Html[_Html.length] = JSB_HTML_SCRIPT(' \r\n\
               koModel.' + Koid + '_delRow = function(theRow, index, myParent) { \r\n\
               parsleyDestroy(); \r\n\
               myParent.' + CStr(Id) + '.remove(theRow) \r\n\
            } \r\n\
        ');
        _Html[_Html.length] = CStr(Outerhtmlprefix) + Crlf;
        _Html[_Html.length] = CStr(html('\<' + CStr(Tag) + ' data-bind="foreach: ' + JSB_BF_NICENAME(CStr(Id)) + '"\>')) + Crlf; // nested inside another foreach: ($parent);
    } else {
        // Html[-1] = @jsb_bf.Html(`<head><script src="`:@jsbRoot:`js/knockout-min.js"></script></head>`:CRLF())
        // Html[-1] = @jsb_bf.Html(`<head><script src="`:@jsbRoot:`js/komap.js"></script></head>`:CRLF())
        _Html[_Html.length] = Head(JsLink(jsbRoot() + 'js/knockout-min.js'));
        _Html[_Html.length] = Head(JsLink(jsbRoot() + 'js/komap.js'));
        _Html[_Html.length] = html('\<input id="' + CStr(Id) + '" class="repeaterHtml" name="' + CStr(Id) + '" type=\'hidden\' /\>' + crlf);
        _Html[_Html.length] = (JSB_HTML_SCRIPT('\r\n\
            if (!window.koModel) koModel = {}\r\n\
\r\n\
            koModel.' + Koid + '_delRow = function(theRow) { \r\n\
               parsleyDestroy(); \r\n\
               koModel.' + CStr(Id) + '.remove(theRow) \r\n\
            }\r\n\
            \r\n\
            koModel.' + Koid + '_Value = function() { \r\n\
               return ko.mapping.toJSON(koModel.' + Koid + ');\r\n\
            }\r\n\
\r\n\
            $( \'form\' ).on("submit.' + CStr(Id) + '", function( event ) {\r\n\
                 var V = ko.mapping.toJSON(koModel.' + Koid + ');\r\n\
                 $("#' + CStr(Id) + '").val(V);\r\n\
                 $( \'form\' ).off("submit.' + Koid + '")\r\n\
                 return true;\r\n\
            });\r\n\
\r\n\
            ko.bindingHandlers.addIfNotInList = {\r\n\
                 update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {\r\n\
                     var found = false;\r\n\
                     var entry, value;\r\n\
            \r\n\
                     value = allBindings().value\r\n\
                     if (typeof(value) == "function") value = value();\r\n\
                     if (isString(value) || isNumber(value)) {\r\n\
                         if (allBindings().options) {\r\n\
                              allBindings().options().forEach(function(entry) {\r\n\
                                 if (entry == value) found = true;\r\n\
                              })\r\n\
                              if (!found) allBindings().options().push(value);\r\n\
                         } else {\r\n\
                              $(element).find(\'option\').each(function() {\r\n\
                                 if (this.value == value) found = true;\r\n\
                              });\r\n\
                              if (!found)  {\r\n\
                                $(element).append($(\'\<option\>\</option\>\').attr("value", value))\r\n\
                              }\r\n\
                         }\r\n\
                     }\r\n\
                }\r\n\
            };\r\n\
        '));

        _Html[_Html.length] = CStr(Outerhtmlprefix) + Crlf;
        _Html[_Html.length] = CStr(html('\<' + CStr(Tag) + ' data-bind="foreach: $data.' + CStr(Id) + '"\>')) + Crlf;
    }

    _Html[_Html.length] = CStr(_Innerhtml) + Crlf;
    _Html[_Html.length] = CStr(html('\</' + CStr(Tag) + '\>')) + Crlf;
    _Html[_Html.length] = CStr(Outerhtmlsuffix) + Crlf;

    return Join(_Html, '');
}
// </REPEATERHTML>

// <REPEATERLOAD>
function JSB_HTML_REPEATERLOAD(Id, Newrow, Jsonarray, Parentmodel) {
    var Parent = '';
    var Koid = '';
    var S = '';

    S = 'if (!window.koModel) koModel = {}' + crlf;
    if (Not(Newrow)) { Newrow = {} }
    if (Parentmodel) {
        Parent = 'koModel.' + JSB_BF_NICENAME(Change(Parentmodel, '().', ''));
        Koid = Parent + '_' + JSB_BF_NICENAME(CStr(Id));
        S += Koid + '_DefaultRow = ' + Change(Newrow, Chr(160), Chr(32)) + crlf;
        S += Koid + '_newRow = function(index) { \r\n\
            ' + Parent + '()[index].' + JSB_BF_NICENAME(CStr(Id)) + '.push(ko.mapping.fromJS(' + Koid + '_DefaultRow)); \r\n\
            }' + crlf;
    } else {
        Koid = 'koModel.' + JSB_BF_NICENAME(CStr(Id));
        S += Koid + '_DefaultRow = ' + Change(Newrow, Chr(160), Chr(32)) + crlf;
        S += Koid + '_newRow = function() { \r\n\
                ' + Koid + '.push(ko.mapping.fromJS(' + Koid + '_DefaultRow)); \r\n\
            }' + crlf;

        // LOAD DATA
        if (typeOf(Jsonarray) == 'Array') {
            S += Koid + ' = makeObservableKO([' + Change(Join(Jsonarray, ','), Chr(160), Chr(32)) + '], ' + Koid + '_DefaultRow);' + crlf;
        } else {
            S += Koid + ' = makeObservableKO(' + CStr(Id) + ', ' + Koid + '_DefaultRow)' + crlf;
        }
    }

    // Can only do this once, and after all models are setup
    S += '$(document).ready(function () { rebindKnockout() }); ' + crlf;

    return JSB_HTML_SCRIPT(S);
}
// </REPEATERLOAD>

// <REQUESTFILE>
async function JSB_HTML_REQUESTFILE(Id) {
    // local variables
    var Filename, Results, Callbacknumber;

    Filename = At_Request.FileName(Id);
    if (Not(Filename)) return false;
    Results = '';
    await new Promise(resolve => formFile(me, Id, function (_Results) { Results = _Results; Callbacknumber = 1; resolve(Callbacknumber) }));
    return Results;
}
// </REQUESTFILE>

// <RESETBTN>
function JSB_HTML_RESETBTN(Id, Displaytext, Additionalattributes, Btntype, Btnsize) {
    var _Html = '';

    if (Displaytext === undefined) Displaytext = 'RESET';

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('onclick', 'parsleyDestroy();', ';', Additionalattributes);
    Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'ResetBtn', ' ', Additionalattributes);
    if (Not(Btntype)) Btntype = 'default';
    if (Left(Btntype, 4) != 'btn-') Btntype = 'btn-' + Btntype;
    if (!InStr1(1, Additionalattributes, 'btn-')) Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'btn ' + Btntype, ' ', Additionalattributes);

    if (Btnsize) {
        if (Left(Btnsize, 4) != 'btn-') Btnsize = 'btn-' + CStr(Btnsize);
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', Btnsize, ' ', Additionalattributes);
    }

    _Html = Chr(28) + '\<input ' + joinAttributes(Additionalattributes);
    if (Id) {
        _Html += ' id=\'' + CStr(Id) + '\''; // name='":ID:"'";
    }
    _Html += 'type="reset" value="' + Chr(29) + CStr(Language(Displaytext)) + Chr(28) + '" /\>&nbsp;' + Chr(29);
    return _Html;

}
// </RESETBTN>

// <ROWS2>
function JSB_HTML_ROWS2(R1height, R1content, R2height, R2content, R1style, R2style) {
    var R1h = '';
    var R2h = '';
    var Id = '';
    var R1c = '';
    var R2c = '';

    if (R2height === undefined) {
        R2content = R1content;
        R1content = R1height;
        R1height = '50%';
        R2height = '50%';
    }

    if (isJSON(R1style)) {
        R1style = JSB_BF_MERGEATTRIBUTE('style', '', ';', R1style);
    } else if (Not(R1style)) {
        if (InStr1(1, R1height, '%')) R1style = 'overflow-y: auto'; else R1style = 'overflow-y: hidden';
    }

    if (isJSON(R2style)) {
        R2style = JSB_BF_MERGEATTRIBUTE('style', '', ';', R2style);
    } else if (Not(R2style)) {
        if (InStr1(1, R2height, '%')) R2style = 'overflow-y: auto'; else R2style = 'overflow-y: hidden';
    }

    if (InStr1(1, R1height, '%') && (InStr1(1, R2height, 'px') || !R2height)) {
        R1h = 'position:absolute; top:0; bottom:' + CStr(CNum(R2height) + 1) + 'px;';
        R2h = 'position:absolute; bottom:0;';
        if (R2height) { R2h += ' height:' + R2height + ';'; }
        Id = 'ROWS2PF_' + CStr(Rnd(999));
        R1c = 'ROWS2PF_a';
        R2c = 'ROWS2PF_b';;
    } else if ((InStr1(1, R1height, 'px') || !R1height) && InStr1(1, R2height, '%')) {
        R1h = 'position:relative; top:0;';
        R2h = 'position:absolute; bottom:0;';

        if (R1height) {
            R1h += ' height:' + R1height + ';';
            R2h += ' top:' + CStr(CNum(R1height)) + 'px;';
        } else {
            R1h += ' height:100%;';
        }

        Id = 'ROWS2FP_' + CStr(Rnd(999));
        R1c = 'ROWS2FP_a';
        R2c = 'ROWS2FP_b';;
    } else if (InStr1(1, R1height, '%') && InStr1(1, R2height, '%')) {
        if (R1height) { R1h = 'position:relative; height: ' + R1height + ';'; }
        if (R2height) { R2h = 'position:relative; height: ' + R2height + ';'; }
        Id = 'ROWS2PP_' + CStr(Rnd(999));
        R1c = 'ROWS2FP_a';
        R2c = 'ROWS2FP_b';
    } else {

        if (R1height) { R1h = 'position:relative; height: ' + R1height + ';'; }
        if (R2height) { R2h = 'position:relative; height: ' + R2height + ';'; }
        Id = 'ROWS2FF_' + CStr(Rnd(999));
        R1c = 'ROWS2FF_a';
        R2c = 'ROWS2FF_b';
    }

    return Chr(28) + '\r\n\
      \<div id=\'' + Id + '1\' style="display: block; left: 0; right: 0; ' + R1h + ' ' + CStr(R1style) + '" class="ROWS2_TOP ' + R1c + '"\>' + Chr(29) + R1content + Chr(28) + '\</div\>\r\n\
      \<div id=\'' + Id + '2\' style="display: block; left: 0; right: 0; ' + R2h + ' ' + CStr(R2style) + '" class="ROWS2_BOT ' + R2c + '"\>' + Chr(29) + R2content + Chr(28) + '\</div\>\r\n\
   ' + Chr(29);

}
// </ROWS2>

// <SAVEANCHOR>
function JSB_HTML_SAVEANCHOR(Id, Defaultvalue, Displaytext, Additionalattributes, Parsleycheck) {
    return JSB_HTML_SUBMITANCHOR(Id, Defaultvalue, Displaytext, Additionalattributes, CStr(true));
}
// </SAVEANCHOR>

// <SAVEBTN>
function JSB_HTML_SAVEBTN(Id, Defaultvalue, Displaytext, Additionalattributes, Btntype, Btnsize, Onclick) {
    return JSB_HTML_SUBMITBTN(Id, Defaultvalue, Displaytext, Additionalattributes, CStr(Btntype), CStr(Btnsize), 'if (!parsleyIsValid(true)) return false; ' + CStr(Onclick));
}
// </SAVEBTN>

// <SCRIPT>
function JSB_HTML_SCRIPT(S) {
    return Chr(28) + crlf + '\<script type="text/javascript"\>' + crlf + Change(S, Chr(254), crlf) + crlf + '\</script\>' + crlf + Chr(29);

}
// </SCRIPT>

// <SCRIPTSRC>
function JSB_HTML_SCRIPTSRC(Url) {
    return Chr(28) + '\<script src=' + jsEscapeHREF(CStr(Url)) + '\>\</script\>' + crlf + Chr(29);

}
// </SCRIPTSRC>

// <SETATTRIBUTE>
function JSB_HTML_SETATTRIBUTE(Controlid, Attributename, Value) {
    var _Html = '';

    if (Left(Controlid, 1) != '.' && Left(Controlid, 1) != '#' && Controlid != 'body' && Controlid != 'window') Controlid = '#' + CStr(Controlid);
    _Html = Chr(28) + '\<script type="text/javascript"\>';
    _Html += '    $("' + Controlid + '").attr("' + CStr(Attributename) + '", "' + CStr(Value) + '");';
    _Html += '\</script\>' + Chr(29);
    return _Html;

}
// </SETATTRIBUTE>

// <SETCLASS>
function JSB_HTML_SETCLASS(Controlid, Classname) {
    var _Html = '';

    if (Left(Controlid, 1) != '.' && Left(Controlid, 1) != '#' && Controlid != 'body' && Controlid != 'window') Controlid = '#' + CStr(Controlid);
    _Html = Chr(28) + '\<script type="text/javascript"\>';
    _Html += '    $("' + Controlid + '").addClass("' + CStr(Classname) + '");';
    _Html += '\</script\>' + Chr(29);
    return _Html;

}
// </SETCLASS>

// <SETFOCUS>
function JSB_HTML_SETFOCUS(Controlid) {
    var _Html = '';

    if (Left(Controlid, 1) != '.' && Left(Controlid, 1) != '#' && Controlid != 'body' && Controlid != 'window') Controlid = '#' + CStr(Controlid);
    _Html = Chr(28) + '\<script type="text/javascript"\>';
    _Html += '    $("' + Controlid + '").focus();';
    _Html += '\</script\>' + Chr(29);
    return _Html;

}
// </SETFOCUS>

// <SETSTYLE>
function JSB_HTML_SETSTYLE(Controlid, Jsonorattributename, Value) {
    var Stylename = '';
    var _Html = undefined;

    if (Left(Controlid, 1) != '.' && Left(Controlid, 1) != '#' && Controlid != 'body' && Controlid != 'window') Controlid = '#' + CStr(Controlid);

    if (Value === undefined) {
        _Html = [undefined,];
        for (Stylename of iterateOver(Jsonorattributename)) {
            _Html[_Html.length] = '$("' + Controlid + '").css(' + jsEscapeString(CStr(Stylename)) + ', ' + jsEscapeString(CStr(Jsonorattributename[Stylename])) + ');';
        }
        return JSB_HTML_SCRIPT(Join(_Html, crlf));
    } else {
        _Html = Chr(28) + '\<script type="text/javascript"\>';
        _Html += '    $("' + Controlid + '").css(' + jsEscapeString(CStr(Jsonorattributename)) + ', ' + jsEscapeString(CStr(Value)) + ');';
        _Html += '\</script\>' + Chr(29);
        return _Html;
    }
}
// </SETSTYLE>

// <SLIDER>
function JSB_HTML_SLIDER(Id, Defaultvalue, Minvalue, Maxvalue, Stepsize, Additionalattributes) {
    var _Html = '';

    if (Id) Id = 'id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\' ';
    _Html = Chr(28) + '\<input ' + Id + 'tabindex=\'-1\' type=\'range\' ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'Slider form-control', ' ', Additionalattributes), ' ');

    if (Not(Minvalue)) Minvalue = '0';
    if (!Maxvalue) Maxvalue = +Minvalue + 100;
    if (Defaultvalue <= Minvalue) Defaultvalue = Minvalue;
    if (Null0(Defaultvalue) > Maxvalue) Defaultvalue = Maxvalue;
    if (!Stepsize) Stepsize = 1;

    _Html += ' min=' + Minvalue + ' max=' + CStr(Maxvalue) + ' value=' + Defaultvalue;
    if (Stepsize) _Html += ' step=' + CStr(Stepsize);

    _Html += ' /\>' + Chr(29);
    return _Html;

}
// </SLIDER>

// <SLIDERLABELED>
function JSB_HTML_SLIDERLABELED(Id, Values, Defaultvalue, Addblank, Readonly, Additionalattributes, Multivalueddata) {
    // local variables
    var V;

    if (Multivalueddata === undefined) Multivalueddata = true;

    var _Html = Head(CssLink(jsbRoot() + 'css/slider_pips.css'));
    _Html += Head(JsLink(jsbRoot() + 'js/slider_pips.js'));

    var Ct = '';
    if (Readonly) Ct = 'sliderLabeled_ReadOnly'; else Ct = 'sliderLabeled';

    var Vals = makeArray(Values);
    var Subdelimiter = activeProcess.At_Ni;
    if (!InStr1(1, Values, Subdelimiter)) Subdelimiter = '';

    var Founddefaultvalue = Len(Defaultvalue) == 0;

    var Iopts = [undefined,];
    var Ivals = [undefined,];

    if (Addblank) Iopts[Iopts.length] = '';

    if ((Subdelimiter && Multivalueddata) || Subdelimiter >= Chr(252)) {
        for (V of iterateOver(Vals)) {
            var S = '';
            if (InStr1(1, V, Subdelimiter) || Len(Ivals)) {
                var Display = Field(V, Subdelimiter, 1);
                V = dropLeft(CStr(V), Subdelimiter);
                if (Null0(V) == Null0(Defaultvalue) && Len(Defaultvalue)) Founddefaultvalue = true;
                Iopts[Iopts.length] = CStr(Display, true);
                Ivals[Ivals.length] = V;
            } else {
                if (Null0(V) == Null0(Defaultvalue) && Len(Defaultvalue)) Founddefaultvalue = true;
                Iopts[Iopts.length] = CStr(V, true);
            }
        }
    } else if (CBool(Vals)) {
        for (V of iterateOver(Vals)) {
            if (Null0(V) == Null0(Defaultvalue) && Len(Defaultvalue)) Founddefaultvalue = true;
            Iopts[Iopts.length] = CStr(V, true);
        }
    }

    if (!Founddefaultvalue) {
        Iopts[Iopts.length] = CStr(Defaultvalue, true);
        if (Len(Ivals)) Ivals[Ivals.length] = CStr(Defaultvalue, true);
    }

    if (Addblank && Len(Ivals)) Ivals.Insert(1, '');

    var Aa = JSB_BF_MERGEATTRIBUTE('class', Ct, ' ', Additionalattributes);
    // AA  = @MergeAttribute("class", "form-control", " ", AA)
    Aa = JSB_BF_MERGEATTRIBUTE('style', 'border: none', ';', Aa);
    if (Not(Ivals)) Ivals = 'null';

    if (Id) {
        _Html += Chr(28) + '\r\n\
            \<span class="form-control ui-widget-content slider-labeled"\>\<div id=\'slider_' + CStr(Id) + '\' ' + JSB_BF_UIADDITIONALATTRIBUTES(Aa) + '\>\r\n\
                \<div id=\'handle_' + CStr(Id) + '\' class="ui-slider-handle ui-slider-handle-custom" style="margin-left: -25px" \>\</div\>\r\n\
            \</div\>\r\n\
            \<input id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\' type=\'text\' style=\'display:none\' ' + dataAdditionalAttributes(Aa) + ' class=\'SliderLabeled\' /\>\r\n\
            \</span\>\r\n\
        ' + Chr(29);
        if (!isNumber(Defaultvalue) || Len(Defaultvalue) == 0) Defaultvalue = '\'' + CStr(Defaultvalue) + '\'';
        _Html += JSB_HTML_SCRIPT('sliderLabeled_onLoad($("#' + CStr(Id) + '"), ' + Defaultvalue + ', ' + Json2String(Iopts) + ', ' + CStr(CNum(Readonly)) + ', ' + Json2String(Ivals) + ')');
    } else {
        _Html += Chr(28) + '\r\n\
            \<span class="form-control ui-widget-content slider-labeled"\>\<div ' + JSB_BF_UIADDITIONALATTRIBUTES(Aa) + '\>\r\n\
                \<div class="ui-slider-handle ui-slider-handle-custom" style="margin-left: -25px" \>\</div\>\</div\>\r\n\
            \</div\>\r\n\
            \<input ' + dataAdditionalAttributes(Aa) + ' class=\'SliderLabeled\' type=\'text\' style=\'color: back;\' myOpts=\'' + htmlEscape(Json2String(Iopts)) + '\'  myVals=\'' + htmlEscape(Json2String(Ivals)) + '\' /\>\r\n\
            \</span\>\r\n\
        ' + Chr(29); // style='display:none';
    }

    return _Html;

}
// </SLIDERLABELED>

// <SLIDESHOW>
function JSB_HTML_SLIDESHOW(Arrayofphoto_Urls) {
    var Id = '';
    var _Html = '';
    var Photo_Url = '';

    Id = JSB_BF_NEWGUID();
    _Html = Head(JsLink(jsbRoot() + 'js/jquery/jquery.bxslider.js'));
    _Html += Head(CssLink(jsbRoot() + 'css/jquery.bxslider.css'));

    _Html += Chr(28) + '\r\n\
        \<ul id="' + Id + '"\>\r\n\
    ';

    for (Photo_Url of iterateOver(Arrayofphoto_Urls)) {
        _Html += '\<li\>\<img src=' + jsEscapeHREF(CStr(Photo_Url)) + '/\>\</li\>' + crlf;
    }

    _Html += '\r\n\
        \</ul\>\r\n\
        \<style\>\r\n\
            .bx-wrapper .bx-viewport { background-color: black; }\r\n\
            .bx-wrapper img { display: initial !important }\r\n\
            #' + Id + ' li { position: relative !important; text-align: center !important }\r\n\
        \</style\>\r\n\
        \<script type="text/javascript"\>\r\n\
            $(document).ready(function(){\r\n\
                $(\'#' + Id + '\').bxSlider({\r\n\
                    auto: true,\r\n\
                    autoControls: true,\r\n\
                    infiniteLoop: true,\r\n\
                    speed: 800,\r\n\
                    pause: 4000,\r\n\
                    mode: \'fade\'\r\n\
                });\r\n\
            });\r\n\
        \</script\>\r\n\
    ' + Chr(29);
    return _Html;
}
// </SLIDESHOW>

// <SMARTCOMBOBOX>
async function JSB_HTML_SMARTCOMBOBOX(Id, Tblname, Defaultvalue, Addblank, Additionalattributes) {
    var _Html = undefined;
    var Sl = undefined;
    var Values = undefined;

    if (isJSON(Defaultvalue) || CBool(isArray(Defaultvalue))) {
        Additionalattributes = Defaultvalue;
        Defaultvalue = '';
    }

    if (isJSON(Addblank) || CBool(isArray(Addblank))) {
        Additionalattributes = Addblank;
        Addblank = false;
    }

    if (Not(Tblname)) {
        Values = [undefined, 'Your smart combo box does not have a reffile'];
    } else {
        if (await JSB_ODB_SELECTTO('', await JSB_BF_FHANDLE('', Tblname, true), '', Sl, function (_Sl) { Sl = _Sl })) {
            Values = getList(Sl);
            Values = Split(Values, am);
            Values[Values.length] = '';
            Values = Sort(Values, 'LAI');
        } else {
            Values = [undefined, activeProcess.At_Errors];
        }
    }

    _Html = [undefined,];
    _Html[_Html.length] = ComboBox(CStr(Id), Values, Defaultvalue, Addblank, '', '', Additionalattributes);

    return Join(_Html, crlf);
}
// </SMARTCOMBOBOX>

// <SMARTCOMBOBOXBLUR>
async function JSB_HTML_SMARTCOMBOBOXBLUR(S, Tblname, Id) {
    // local variables
    var F, X, Sl, Values;

    if (Not(S)) return undefined;
    F = await JSB_BF_FHANDLE('', Tblname, true);
    if (await JSB_ODB_READ(X, F, CStr(S), function (_X) { X = _X })) return undefined;
    if (await JSB_ODB_WRITE('', F, CStr(S))); else Alert(CStr(activeProcess.At_Errors));

    // Update with new values
    if (await JSB_ODB_SELECTTO('', await JSB_BF_FHANDLE('', Tblname, true), '', Sl, function (_Sl) { Sl = _Sl })) Values = getList(Sl); else return Alert(CStr(activeProcess.At_Errors));

    Values = Sort(Values, 'LAI');
    window.loadOptions('dd_' + CStr(Id), Values);
    window.storeVal(Id, S);

    return true;
}
// </SMARTCOMBOBOXBLUR>

// <SORTABLELISTBOX>
function JSB_HTML_SORTABLELISTBOX(Id, Values, Additionalattributes, Binding) {
    var I = undefined;
    var Delimiter = '';
    var _Html = '';
    var S = '';
    var V = '';

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'uiSortableList', ' ', Additionalattributes);

    if (CBool(isArray(Values))) {
        Delimiter = am;
    } else {
        Values = CStr(Values, true);

        if (InStr1(1, Values, am)) {
            Delimiter = am;
        } else if (InStr1(1, Values, vm)) {
            Delimiter = vm;
        } else if (InStr1(1, Values, svm)) {
            Delimiter = svm;
        } else if (InStr1(1, Values, ';')) {
            Delimiter = ';';
        } else if (InStr1(1, Values, ',')) {
            Delimiter = ',';
        } else {
            if (Binding) Delimiter = ','; else Delimiter = am;
        }
        Values = Split(Change(Values, Delimiter + ' ', Delimiter), Delimiter);
    }

    // If we are returning a value, we need to put the list back together with the correct delimeter
    _Html = CStr(_Html) + Chr(28) + '\<input id="' + CStr(Id) + '" name="' + CStr(Id) + '" type=\'hidden\' value="' + CStr(htmlEncode(Values)) + '" ' + Join(Binding, ' ') + '/\>' + crlf + Chr(29);
    _Html += Chr(28) + '\<ul id=\'ul_' + CStr(Id) + '\' ' + joinAttributes(Additionalattributes, ' ') + '\>' + crlf + Chr(29);

    S = JSB_HTML_SCRIPT('\r\n\
        function onChange_' + CStr(Id) + '() {\r\n\
            var myUL = $(\'#ul_' + CStr(Id) + '\');\r\n\
            var del = Chr(' + CStr(Seq(Delimiter)) + ');\r\n\
            var results = $(myUL).find("li").map(function(){ return $(this).text(); }).get(); \r\n\
            \r\n\
            var myTxtBox = $(\'#' + CStr(Id) + '\');\r\n\
            $(myTxtBox).val(results.join(del))\r\n\
        }\r\n\
        \r\n\
        $(function() {\r\n\
          $( "#ul_' + CStr(Id) + '" ).sortable({\r\n\
                stop: onChange_' + CStr(Id) + ',\r\n\
                receive: onChange_' + CStr(Id) + ',\r\n\
                remove: onChange_' + CStr(Id) + '\r\n\
          }).disableSelection();\r\n\
        });\r\n\
     ');

    I = LBound(Values) - 1;
    for (V of iterateOver(Values)) {
        I++;
        _Html += Chr(28) + '\<li  class="list-group-item"\>' + Chr(29) + CStr(V) + Chr(28) + '\</li\>' + crlf + Chr(29);
    }
    _Html += Chr(28) + '\</ul\>' + Chr(29);

    return _Html + S;

}
// </SORTABLELISTBOX>

// <SPAN>
function JSB_HTML_SPAN(Id, Spantext, Pxwidth, Additionalattributes) {
    var _Html = '';

    if (Additionalattributes === undefined) {
        if (isJSON(Pxwidth) || CBool(isArray(Pxwidth))) {
            Additionalattributes = Pxwidth;
            Pxwidth = undefined;;
        } else if (Pxwidth === undefined && (isJSON(Spantext) || CBool(isArray(Spantext)))) {
            Additionalattributes = Spantext;
            Spantext = Id;
            Id = '';
        }
    } else if (Spantext === undefined) {
        Spantext = Id;
        Id = '';
    }

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'Span', ' ', Additionalattributes);

    if (CBool(Pxwidth)) {
        if (CStr(CNum(Pxwidth), true) == Pxwidth) Pxwidth += 'px';
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'width: ' + CStr(Pxwidth), ';', Additionalattributes);
    }

    _Html = Chr(28) + '\<span';
    if (Id) _Html += ' id=\'' + Id + '\'';
    _Html += joinAttributes(Additionalattributes) + '\>' + Chr(29) + CStr(Spantext) + Chr(28) + '\</span\>' + Chr(29);
    return _Html;

}
// </SPAN>

// <STYLE>
function JSB_HTML_STYLE(S) {
    // local variables
    var Jtag;

    // Build a style attribute for an HTML tag
    if (typeOf(S) == 'JSonObject') {
        var Jsonstyles = S;
        var _Html = '';
        for (Jtag of iterateOver(Jsonstyles)) {
            var Jvalue = Jsonstyles[Jtag];
            if (CBool(Jvalue)) {
                if (_Html) { _Html += '; '; }
                _Html += CStr(Jtag) + ':' + CStr(Jvalue, true);
            }
        }
        return 'style=' + jsEscapeAttr(_Html);
    }

    // Return an inline-style
    return Chr(28) + '\<style\>' + crlf + Change(S, am, crlf) + crlf + '\</style\>' + crlf + Chr(29);
}
// </STYLE>

// <SUBMITANCHOR>
function JSB_HTML_SUBMITANCHOR(Id, Defaultvalue, Displaytext, Additionalattributes, Parsleycheck) {
    var Btntype = '';
    var Btnsze = '';
    var Onclick = '';

    if (Additionalattributes === undefined) Additionalattributes = [undefined,];

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'SubmitAnchor', ' ', Additionalattributes);
    if (Parsleycheck) Onclick = 'if (!parsleyIsValid(true)) return false'; else { Onclick = 'parsleyDestroy();'; }
    Btntype = '';
    Btnsze = '';
    return JSB_HTML_SUBMITBTN(Id, Defaultvalue, Displaytext, Additionalattributes, 'default', '', Onclick);
}
// </SUBMITANCHOR>

// <SUBMITBTN>
function JSB_HTML_SUBMITBTN(Id, Defaultvalue, Displaytext, Additionalattributes, Btntype, Btnsize, Onclick) {
    var _Html = '';

    if (Not(Additionalattributes)) {
        if (isJSON(Id)) {
            Additionalattributes = Id;
            Id = '';
        } else if (isJSON(Defaultvalue)) {
            Additionalattributes = Defaultvalue;
            Defaultvalue = '';
        } else if (isJSON(Displaytext)) {
            Additionalattributes = Displaytext;
            Displaytext = '';
        }
    }

    if (Not(Defaultvalue)) Defaultvalue = Displaytext;
    if (Not(Defaultvalue)) Defaultvalue = Id;
    if (Not(Defaultvalue)) Defaultvalue = 'Submit';
    if (Not(Displaytext)) Displaytext = Defaultvalue;

    Displaytext = Language(Displaytext);

    if (Not(Onclick)) { Onclick = 'parsleyDestroy();'; }

    _Html = Chr(28) + '\<button type=\'submit\'';
    Onclick += '; assignBtn(this, ' + jsEscapeString(CStr(Defaultvalue)) + '); '; // Creates an input element by the same name for the form data

    if (CBool(Id)) {
        _Html += ' id=\'' + CStr(Id) + '\' '; // name='":ID:"'" - removed this because the js version will get a value for formvar(id) even if it's not clicked;
    }
    Additionalattributes = JSB_BF_MERGEATTRIBUTE('onclick', Onclick, ';', Additionalattributes);
    Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'SubmitBtn', ' ', Additionalattributes);
    if (Not(Btntype)) Btntype = 'default';
    if (Left(Btntype, 4) != 'btn-') Btntype = 'btn-' + Btntype;
    if (!InStr1(1, Additionalattributes, 'btn-')) Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'btn ' + Btntype, ' ', Additionalattributes);

    if (Btnsize) {
        if (Left(Btnsize, 4) != 'btn-') Btnsize = 'btn-' + CStr(Btnsize);
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', Btnsize, ' ', Additionalattributes);
    }

    _Html += joinAttributes(Additionalattributes);
    _Html += ' value="' + Chr(29) + CStr(Defaultvalue) + Chr(28) + '"';
    _Html += '\>' + Chr(29) + CStr(Language(Displaytext)) + Chr(28) + '\</button\>&nbsp;' + Chr(29);
    return _Html;
}
// </SUBMITBTN>

// <SUBSCRIPT>
function JSB_HTML_SUBSCRIPT(Text, Additionalattributes) {
    return Chr(28) + '\<sub ' + joinAttributes(Additionalattributes) + '\>' + Chr(29) + CStr(Text) + Chr(28) + '\</sub\>' + Chr(29);

}
// </SUBSCRIPT>

// <SUPERSCRIPT>
function JSB_HTML_SUPERSCRIPT(Text, Additionalattributes) {
    return Chr(28) + '\<sup' + joinAttributes(Additionalattributes) + '\>' + Chr(29) + CStr(Text) + Chr(28) + '\</sup\>' + Chr(29);
}
// </SUPERSCRIPT>

// <SWITCH>
function JSB_HTML_SWITCH(Id, Value, Description, Checked, Additionalattributes, Btntype) {
    var Oa = '';
    var Ia = '';
    var Xoa = '';
    var _Html = '';

    if (isJSON(Description) || CBool(isArray(Description))) {
        Additionalattributes = Description;
        Description = '';;
    } else if (isJSON(Checked) || CBool(isArray(Checked))) {
        Additionalattributes = Checked;
        if (Null0(Description) == false || Null0(Description) == true) {
            Checked = Description;
            Description = '';
        } else {
            Checked = false;
        }
    }

    if (Not(Btntype)) Btntype = 'default';
    if (Left(Btntype, 4) != 'btn-') Btntype = 'btn-' + Btntype;

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'switch slider round', ' ', Additionalattributes);
    if (!InStr1(1, Additionalattributes, 'btn-')) Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', Btntype, ' ', Additionalattributes);

    Oa = JSB_BF_UIADDITIONALATTRIBUTES(Additionalattributes);
    Ia = dataAdditionalAttributes(Additionalattributes);
    if (InStr1(1, Oa, 'form-control')) Xoa = 'class=\'form-control\''; else Xoa = '';
    _Html = Chr(28) + '\<div ' + Xoa + ' style="padding-top: 4px; padding-left: 0; border: 0; display: inline-block;"\>';
    _Html += '\<label class="switch" style="align-items: center; display: inline-flex; height: 39px;"\>';
    _Html += '\<input type=\'checkbox\' id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\'' + joinAttributes(Additionalattributes, ' ') + '/\>';
    _Html += '\<span value=\'' + htmlEscape(Value) + '\'' + joinAttributes(Additionalattributes, ' ');
    if (CBool(Checked)) _Html += ' checked';
    _Html += '\>\</span\>\</input\>\</label\>&nbsp;' + htmlEscape(Description) + '\</div\>' + Chr(29);
    return _Html;
}
// </SWITCH>

// <TABLE>
function JSB_HTML_TABLE(Id, _Html, Classnameorattributes) {
    if (_Html === undefined) {
        _Html = Id;
        Id = '';;
    } else if (isJSON(_Html)) {
        Classnameorattributes = _Html;
        _Html = Id;
        Id = '';
    }

    if (Id) Id = 'id=\'' + Id + '\' ';
    return Chr(28) + '\<table ' + Id + classOrAtttributes(Classnameorattributes) + '\>' + Chr(29) + CStr(_Html) + Chr(28) + '\</table\>' + Chr(29);
}
// </TABLE>

// <TABS>
function JSB_HTML_TABS(Id, Tab1caption, Tab1content, Tab2caption, Tab2content, Tab3caption, Tab3content) {
    var Tabcaptionarray = undefined;
    var Tabcontentarray = undefined;
    var I = undefined;
    var _Html = '';

    if (CBool(isArray(Tab1caption))) {
        Tabcaptionarray = Tab1caption;
        Tabcontentarray = Tab1content;;
    } else {
        Tabcaptionarray = [undefined,];
        Tabcontentarray = [undefined,];
        if (CBool(Tab1caption)) { Tabcaptionarray[Tabcaptionarray.length] = Tab1caption; Tabcontentarray[Tabcontentarray.length] = Tab1content; }
        if (Tab2caption) { Tabcaptionarray[Tabcaptionarray.length] = Tab2caption; Tabcontentarray[Tabcontentarray.length] = Tab2content; }
        if (Tab3caption) { Tabcaptionarray[Tabcaptionarray.length] = Tab3caption; Tabcontentarray[Tabcontentarray.length] = Tab3content; }
    }

    _Html = Chr(28) + '\<ul style=\'border-style:hidden hidden solid hidden\'\>' + crlf;

    var _ForEndI_5 = UBound(Tabcaptionarray);
    for (I = 1; I <= _ForEndI_5; I++) {
        _Html += '\<li id=\'tabsli_' + CStr(I) + '\'\>\<a href=\'#tabs_' + CStr(I) + '\'\>' + CStr(Tabcaptionarray[I]) + '\</a\>\<span class=\'ui-icon ui-icon-circle-close\' role=\'presentation\'\>Remove Tab\</span\>\</li\>' + crlf;
    }
    _Html += '\</ul\>' + crlf + Chr(29);

    var _ForEndI_6 = UBound(Tabcaptionarray);
    for (I = 1; I <= _ForEndI_6; I++) {
        _Html += CStr(Div('tabs_' + CStr(I), Tabcontentarray[I], [undefined, 'style=\'border-top: 0;\'']));
    }

    _Html = Div(Id, _Html, [undefined, 'class=\'tabs\'']);

    _Html += Chr(28) + '\<script\>' + crlf;
    _Html += '  var tabs = $("#' + CStr(Id) + '");' + crlf;
    _Html += '  tabs.tabs({' + crlf;
    _Html += '     select: function (e, ui) {  }' + crlf;
    _Html += '  });' + crlf;

    _Html += '  // close icon: removing the tab on click' + crlf;
    _Html += '  $(tabs).on("click", ".ui-icon-close", onjqTabClose);' + crlf;
    _Html += '  $(tabs).css(\'border-color\', $(tabs).find("ul").css("background-color")); ' + crlf;
    _Html += '  var p = tabs.parent(); ' + crlf;
    _Html += '  $(p).css(\'overflow\', \'hidden\'); ' + crlf;

    _Html += '\</script\>' + crlf + Chr(29);

    return _Html;

}
// </TABS>

// <TD>
function JSB_HTML_TD(_Html, Classnameorattributes) {
    return Chr(28) + '\<td' + classOrAtttributes(Classnameorattributes) + '\>' + Chr(29) + CStr(_Html) + Chr(28) + '\</td\>' + Chr(29);
}
// </TD>

// <TEXTAREA>
function JSB_HTML_TEXTAREA(Id, Defaulttext, Rows, Cols, Additionalattributes) {
    var _Html = '';

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'TextArea form-control', ' ', Additionalattributes);
    Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'resize:none', ';', Additionalattributes);

    _Html = Chr(28) + '\<textarea id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\'' + joinAttributes(Additionalattributes, ' ');
    _Html += ' onfocus=\'if (isMobile() && !$(this).attr("readonly")) $(this).keypad({ layout: "full" })\'';

    if (Rows || Cols) {
        _Html += ' type="text" rows="' + CStr(Rows) + '" cols="' + CStr(Cols) + '"\>' + CStr(htmlEncode(Defaulttext)) + '\</textarea\>' + Chr(29);
    } else {
        _Html += ' type="text" style="width:100%; height: initial; resize:none;"\>' + CStr(htmlEncode(Defaulttext)) + '\</textarea\>' + Chr(29);
        _Html += JSB_HTML_SCRIPT('\r\n\
            $(\'#' + CStr(Id) + '\').on({\r\n\
              keyup: function() { autoSizeTextarea(this) }\r\n\
            });\r\n\
        ');
    }

    return _Html;

}
// </TEXTAREA>

// <TEXTBOX>
function JSB_HTML_TEXTBOX(Id, Defaultvalue, Readonly, Additionalattributes, Keypadtype) {
    var Ct = '';
    var _Html = '';
    var Aa = '';

    if (isJSON(Defaultvalue) || CBool(isArray(Defaultvalue))) {
        Keypadtype = Readonly;
        Additionalattributes = Defaultvalue;
        Readonly = false;;
    } else if (isJSON(Readonly) || CBool(isArray(Defaultvalue))) {
        Keypadtype = Additionalattributes;
        Additionalattributes = Readonly;
        Readonly = false;
    }

    if (CBool(Readonly)) Ct = 'TextBox_ReadOnly'; else Ct = 'TextBox';
    Aa = JSB_BF_MERGEATTRIBUTE('class', 'clearable form-control', ' ', Additionalattributes);
    Aa = joinAttributes(JSB_BF_MERGEATTRIBUTE('class', Ct, ' ', Aa));
    if (InStr1(1, Aa, 'type=') == 0) Aa += ' type=\'text\'';

    _Html = Chr(28) + '\<input';
    if (Id) _Html += ' id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\'';
    if (CBool(Readonly)) _Html += ' tabindex=\'-1\' readonly ';
    if (Len(Defaultvalue)) _Html += ' value="' + CStr(htmlEncode(Defaultvalue)) + '"';
    _Html += ' ' + Aa;

    if (Keypadtype) {
        if (Left(Keypadtype, 1) != '[') Keypadtype = '"' + LCase(Keypadtype) + '"';
        if (Keypadtype == '"full"') {
            _Html += ' onfocus=' + jsEscapeAttr('if (isMobile() && !$(this).attr("readonly") && $(window).width() \> 700) $(this).keypad({layout: ' + Keypadtype + ' })');
        } else {
            _Html += ' onfocus=' + jsEscapeAttr('if (!$(this).attr("readonly") && $(window).width() \> 300) $(this).keypad({layout: ' + Keypadtype + ' })');
        }
    }

    _Html += '/\>' + Chr(29);
    return _Html;

}
// </TEXTBOX>

// <TEXTCENTER>
function JSB_HTML_TEXTCENTER(Content, Additionalattributes) {
    var _Html = '';

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'text-center', ' ', Additionalattributes);

    _Html = Chr(28) + '\<p' + joinAttributes(Additionalattributes) + '\>' + Chr(29) + CStr(Content) + Chr(28) + '\</p\>' + Chr(29);
    return _Html;
}
// </TEXTCENTER>

// <TEXTJUSTIFY>
function JSB_HTML_TEXTJUSTIFY(Content, Additionalattributes) {
    var _Html = '';

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'text-justify', ' ', Additionalattributes);
    _Html = Chr(28) + '\<p' + joinAttributes(Additionalattributes) + '\>' + Chr(29) + CStr(Content) + Chr(28) + '\</p\>' + Chr(29);
    return _Html;
}
// </TEXTJUSTIFY>

// <TEXTLEFT>
function JSB_HTML_TEXTLEFT(Content, Additionalattributes) {
    var _Html = '';

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'text-left', ' ', Additionalattributes);
    _Html = Chr(28) + '\<p' + joinAttributes(Additionalattributes) + '\>' + Chr(29) + CStr(Content) + Chr(28) + '\</p\>' + Chr(29);
    return _Html;
}
// </TEXTLEFT>

// <TEXTNOWRAP>
function JSB_HTML_TEXTNOWRAP(Content, Additionalattributes) {
    var _Html = '';

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'text-nowrap', ' ', Additionalattributes);
    _Html = Chr(28) + '\<p' + joinAttributes(Additionalattributes) + '\>' + Chr(29) + CStr(Content) + Chr(28) + '\</p\>' + Chr(29);
    return _Html;
}
// </TEXTNOWRAP>

// <TEXTRIGHT>
function JSB_HTML_TEXTRIGHT(Content, Additionalattributes) {
    var _Html = '';

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'text-right', ' ', Additionalattributes);
    _Html = Chr(28) + '\<p' + joinAttributes(Additionalattributes) + '\>' + Chr(29) + CStr(Content) + Chr(28) + '\</p\>' + Chr(29);
    return _Html;
}
// </TEXTRIGHT>

// <TH>
function JSB_HTML_TH(Innerheadercell, Classnameorattributes) {
    if (CBool(Classnameorattributes)) {
        return Chr(28) + '\<th' + classOrAtttributes(Classnameorattributes) + '\>' + Chr(29) + CStr(Innerheadercell) + Chr(28) + '\</th\>' + Chr(29);
    } else {
        return Chr(28) + '\<th data-sortable="true"\>' + Chr(29) + CStr(Innerheadercell) + Chr(28) + '\</th\>' + Chr(29);
    }
}
// </TH>

// <TIMEBOX>
function JSB_HTML_TIMEBOX(Id, Defaultvalue, Readonly, Additionalattributes) {
    var _Html = '';

    _Html = Head(JsLink(jsbRoot() + 'js/timepicker.js'));
    _Html += Head(CssLink(jsbRoot() + 'css/timepicker.css'));

    if (Additionalattributes === undefined) {
        if (Readonly === undefined) {
            if (isJSON(Defaultvalue) || CBool(isArray(Defaultvalue))) {
                Additionalattributes = Defaultvalue;
                Defaultvalue = '';
            }
        } else {
            if (isJSON(Readonly) || CBool(isArray(Readonly))) {
                Additionalattributes = Readonly;
                Readonly = false;
            }
        }
    }

    if (CBool(Defaultvalue)) {
        if (InStr1(1, Defaultvalue, ':')) Defaultvalue = r83Time(r83Time(Defaultvalue)); else Defaultvalue = r83Time(CNum(Defaultvalue));
    }

    if (CBool(Readonly)) {
        _Html += Chr(28) + '\<input id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\' tabindex=\'-1\' readonly ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'TimeBox_ReadOnly form-control', ' ', Additionalattributes), ' ') + ' value="' + CStr(htmlEncode(Defaultvalue)) + '" /\>' + Chr(29);
    } else {
        if (true) {
            // Use jQuery timepicker
            if (Not(Id)) Id = 'TMB_' + CStr(Rnd(99999));
            _Html += Chr(28) + '\<input id=\'' + Id + '\' name=\'' + Id + '\' ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'TimeBox form-control', ' ', Additionalattributes), ' ') + ' readonly value="' + CStr(htmlEncode(Defaultvalue)) + '" /\>' + Chr(29);
            _Html += JSB_HTML_SCRIPT('$( "#' + Id + '" ).timepicker({ showLeadingZero: true, showNowButton: true, showDeselectButton: true, showCloseButton: true }); ');
        } else {
            _Html = Chr(28) + '\<input id=\'' + Id + '\' name=\'' + Id + '\' type=\'time\' ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'TimeBox form-control', ' ', Additionalattributes), ' ') + ' value="' + CStr(htmlEncode(Defaultvalue)) + '" /\>' + Chr(29);
        }
    }

    return _Html;

}
// </TIMEBOX>

// <TOOLTIP>
function JSB_HTML_TOOLTIP(Tip, Text) {
    var _Html = Chr(28) + '\<a xhref="#" data-toggle="tooltip" title=' + jsEscapeAttr(CStr(Tip)) + '\>' + Chr(29) + CStr(Text) + Chr(28) + '\</a\>' + Chr(29);
    var S = JSB_HTML_SCRIPT('$(\'[data-toggle="tooltip"\').tooltip()');
    return _Html + S;
}
// </TOOLTIP>

// <TR>
function JSB_HTML_TR(Innertd, Classnameorattributes) {
    if (CBool(Classnameorattributes)) {
        return Chr(28) + '\<tr' + classOrAtttributes(Classnameorattributes) + '\>' + Chr(29) + CStr(Innertd) + Chr(28) + '\</tr\>' + Chr(29);
    } else {
        return Chr(28) + '\<tr\>' + Chr(29) + CStr(Innertd) + Chr(28) + '\</tr\>' + Chr(29);
    }
}
// </TR>

// <UNDERLINE>
function JSB_HTML_UNDERLINE(Text, Additionalattributes) {
    return Chr(28) + '\<u' + joinAttributes(Additionalattributes) + '\>' + Chr(29) + CStr(Text) + Chr(28) + '\</u\>' + Chr(29);
}
// </UNDERLINE>

// <UPDATEPROGRESSBAR>
function JSB_HTML_UPDATEPROGRESSBAR(Id, Valuenow, Valuemin, Valuemax, Animate) {
    var I = undefined;
    var Percentdone = undefined;
    var C = '';
    var V = '';

    if (!Valuemax) Valuemax = 100;

    if (CStr(CNum(Valuenow), true) != CStr(Valuenow, true)) {
        V = '';
        var _ForEndI_3 = Len(Valuenow);
        for (I = 1; I <= _ForEndI_3; I++) {
            C = Mid1(Valuenow, I, 1);
            if (isNumeric(C) || C == '.') {
                V += C;
            } else {
                if (Len(V)) break;
            }
        }
    } else {
        V = Valuenow;
    }

    V = CNum(V);

    if (Null0(V) < Valuemin) V = Valuemin;
    if (Null0(V) > Valuemax) V = Valuemax;

    V -= Valuemin;
    Valuemax -= Valuemin;

    if (Valuemax) Percentdone = CInt(+V / Valuemax * 10000) / 100; else Valuemax = 100;

    if (System(1) == 'js') {
        if (Not(Animate)) {
            $('#' + CStr(Id) + '_bar').hide();
            $('#' + CStr(Id) + '_bar').width(CStr(Percentdone) + '%');
            $('#' + CStr(Id) + '_bar').show();
            $('#' + CStr(Id) + '_text').text(Valuenow);
        } else {
            $('#' + CStr(Id) + '_bar').width(CStr(Percentdone) + '%');
            $('#' + CStr(Id) + '_text').text(Valuenow);
        }
        return '';
    } else {
        return JSB_HTML_SCRIPT('\r\n\
            $(\'#' + CStr(Id) + '_bar\').hide().width("' + CStr(Percentdone) + '%").show();\r\n\
            $(\'#' + CStr(Id) + '_text\').text("' + CStr(Valuenow) + '")\r\n\
        ');
    }
}
// </UPDATEPROGRESSBAR>

// <UPLOADBOX>
function JSB_HTML_UPLOADBOX(Id, Defaultvalue, Autopostback, Allowmultiplefiles, Acceptablemimetypes, Lbladditionalattributes, Ctladditionalattributes) {
    // To work correctly, this must be inside a <form method="post" enctype="multipart/form-data">
    var _Html = '';
    var Aa = '';

    if (isJSON(Defaultvalue) || CBool(isArray(Defaultvalue))) {
        Lbladditionalattributes = Defaultvalue;
        Defaultvalue = '';
    }

    if (isJSON(Autopostback) || CBool(isArray(Autopostback))) {
        Lbladditionalattributes = Autopostback;
        Autopostback = false;
    }

    if (isJSON(Allowmultiplefiles) || CBool(isArray(Allowmultiplefiles))) {
        Lbladditionalattributes = Allowmultiplefiles;
        Allowmultiplefiles = false;
    }

    _Html = Chr(28);
    if (CBool(Defaultvalue) || Len(Lbladditionalattributes) || Len(Ctladditionalattributes)) {
        Aa = JSB_BF_MERGEATTRIBUTE('class', 'form-control', ' ', Lbladditionalattributes);

        if (true) {
            Aa = Change(Aa, 'text:', 'href:');
            _Html += '\<a class=\'Anchor form-control\' target=\'_blank\' href=\'' + HtmlRoot() + 'uploads/' + CStr(Defaultvalue) + '\'';
        } else {
            _Html += '\<label class=\'CtlLabel form-control\'';
        }

        if (Id) _Html += ' id=\'ctllbl_' + CStr(Id) + '\'';

        _Html += joinAttributes(JSB_BF_MERGEATTRIBUTE('class', 'UploadBoxLbl', ' ', Aa)) + '\>';
        _Html += Change(htmlEscape(Defaultvalue), Chr(13), '\<br /\>');

        if (true) _Html += '\</a\>'; else _Html += '\</label\>';
    }

    _Html += '\<input type="file"';
    if (Id) _Html += ' name="' + CStr(Id) + '" id="' + CStr(Id) + '"';
    if (CBool(Allowmultiplefiles)) _Html += ' multiple';
    if (Acceptablemimetypes) _Html += ' accept=\'' + CStr(Acceptablemimetypes) + '\'';
    Aa = JSB_BF_MERGEATTRIBUTE('class', 'form-control', ' ', Ctladditionalattributes);
    _Html += joinAttributes(JSB_BF_MERGEATTRIBUTE('class', 'UploadBoxInput', ' ', Aa));
    _Html += '/\>' + Chr(29);

    if (CBool(Autopostback) && Id) { _Html += JSB_HTML_SCRIPT(' $("#' + CStr(Id) + '").change(function() { doJsbSubmit(true) } );'); }

    return _Html;
}
// </UPLOADBOX>

// <VSPLITTER>
function JSB_HTML_VSPLITTER(Id, Lhdiv, Rhdiv, Startpixeloffset) {
    if (!Startpixeloffset && isNumber(Rhdiv)) {
        Startpixeloffset = Rhdiv;
        Rhdiv = Lhdiv;
        Lhdiv = Id;
        Id = '';
    }

    if (Not(Id)) Id = 'Splitter_' + CStr(Rnd(99999));
    if (!Startpixeloffset) Startpixeloffset = 150;

    var _Html = Chr(28) + '\r\n\
      \<div id="' + Id + '" class="vsplitter"\>\r\n\
          \<div id="' + Id + '_LFT" class="vsplitterleft" style="width:' + CStr(Startpixeloffset) + 'px"\>' + Chr(29) + Lhdiv + Chr(28) + '\</div\>\r\n\
          \<div id="' + Id + '_SEP" class="vsplitterseperator" \>\</div\>\r\n\
          \<div id="' + Id + '_RGT" class="vsplitterright"\>' + Chr(29) + Rhdiv + Chr(28) + '\</div\>\r\n\
       \</div\>\r\n\
       \<script\>\r\n\
            vSplitterDragElement("' + Id + '");\r\n\
        \</script\>\r\n\
    ' + Chr(29);

    return _Html;
}
// </VSPLITTER>

// <WINDOWCLOSE>
function JSB_HTML_WINDOWCLOSE() {
    return CloseWindow();
}
// </WINDOWCLOSE>

// <FIELDSETBTNS>
function JSB_HTML_FIELDSETBTNS(Id, Values, Default, Readonly, Additionalattributes, Multivalueddata) {
    // local variables
    var V;

    var Subdelimiter = '';
    var Vals = makeArray(Values); Subdelimiter = activeProcess.At_Ni;
    if (!InStr1(1, Values, Subdelimiter)) Subdelimiter = '';

    var Founddefaultvalue = false;
    var Opts = [undefined,];

    var Ia = dataAdditionalAttributes(Additionalattributes);
    Ia += ' ' + 'onclick=\'window.fieldSetBtn_Change(this)\'';

    if (Id) {
        var Name = ' name=\'' + CStr(Id) + '\'';
        Ia += ' data-parsley-errors-container="#' + CStr(Id) + '_errors" ';
    }

    var S = ''; var S2 = '';
    if (Readonly) S2 = ' tabindex=\'-1\' readonly '; else S2 = '';

    if ((Subdelimiter && Multivalueddata) || Subdelimiter >= Chr(252)) {
        for (V of iterateOver(Vals)) {
            if (InStr1(1, V, Subdelimiter)) {
                var Display = Field(V, Subdelimiter, 1);
                V = dropLeft(CStr(V), Subdelimiter);
                if (Null0(V) == Null0(Default) && Len(Default)) { S = ' checked'; Founddefaultvalue = true; }
                Opts[Opts.length] = '\<label class=\'fieldSetBtnLbl' + S + '\'\>' + htmlEscape(Display) + '\<input type=\'radio\' class=\'fieldSetBtn\'' + Name + Ia + S2 + S + ' value="' + CStr(V) + '"/\>\</label\>';
            } else {
                if (Null0(V) == Null0(Default) && Len(Default)) { S = ' checked'; Founddefaultvalue = true; }
                Opts[Opts.length] = '\<label class=\'fieldSetBtnLbl' + S + '\'\>' + htmlEscape(V) + '\<input type=\'radio\' class=\'fieldSetBtn\'' + Name + Ia + S2 + S + ' value="' + CStr(V) + '"/\>\</label\>';
            }
        };
    } else if (CBool(Vals)) {
        for (V of iterateOver(Vals)) {
            if (Null0(V) == Null0(Default) && Len(Default)) { S = ' checked'; Founddefaultvalue = true; }
            Opts[Opts.length] = '\<label class=\'fieldSetBtnLbl' + S + '\'\>' + htmlEscape(V) + '\<input type=\'radio\' class=\'fieldSetBtn\'' + Name + Ia + S2 + S + ' value="' + CStr(V) + '"/\>\</label\>';
        }
    }

    if (!Founddefaultvalue && Len(Default)) {
        Opts[Opts.length] = '\<label class=\'fieldSetBtnLbl checked\' ' + Ia + '\>' + htmlEscape(Default) + '\<input type=\'radio\' class=\'fieldSetBtn\'' + Name + Ia + S2 + ' checked value="' + CStr(Default) + '"/\>\</label\>';
    }

    var _Div = '';
    var Xoa = '';

    var Oa = JSB_BF_UIADDITIONALATTRIBUTES(Additionalattributes);
    if (Readonly) {
        Xoa = ' onchange="this.selectedIndex=this.defaultIndex;"';
        Xoa += 'onfocus="this.defaultIndex=this.selectedIndex;"';
    }

    if (Id) {
        _Div = html('\<fieldset class=\'fieldSetBtnsFrame form-control\' ' + Oa + '\>\r\n\
                       \<div class=\'fieldSetBtnsDiv\' id="' + CStr(Id) + '" ' + Oa + '\>' + crlf + Join(Opts, crlf) + crlf + '\r\n\
                       \</div\>\</fieldset\>\r\n\
                       \<div id="' + CStr(Id) + '_errors" style="display: inline-block"\>\</div\>\r\n\
                     ');
    } else {
        // KOModel
        _Div = html('\<fieldset class=\'fieldSetBtnsFrame form-control\' ' + Oa + '\>\r\n\
                       \<div class=\'fieldSetBtnsDiv\' ' + Oa + '\>' + crlf + Join(Opts, crlf) + crlf + '\r\n\
                       \</div\>\</fieldset\>\r\n\
                     ');
    }

    return _Div;

}
// </FIELDSETBTNS>

// <FONT>
function Font(Family, Size, _Color, Backcolor, Text, Additionalattributes) {
    var Newstyles = undefined;
    var Attributes = '';

    Newstyles = { "display": 'inline' };
    if (Family) Newstyles['font-family'] = Family;
    if (Size) Newstyles['font-size'] = Size;
    if (_Color) Newstyles['color'] = _Color;
    if (Backcolor) Newstyles['background-color'] = Backcolor;

    Attributes = joinAttributes(JSB_BF_MERGESTYLE(Newstyles, Additionalattributes));

    return Chr(28) + '\<span ' + Attributes + '\>' + Chr(29) + CStr(Text) + Chr(28) + '\</span\>' + Chr(29);
}
// </FONT>

// <FORMWIZARD>
function FormWizard(Divid, Lastpagebtnid) {
    var _Html = '';
    var S = '';

    _Html = Head(JsLink(jsbRoot() + 'js/formToWizard.js'));

    S = 'debugger; ';
    // if system(1) = "gae" OR system(1) = "aspx" then s<-1> = `$( document ).ready( function () {`
    S = Replace(S, -1, 0, 0, 'jsbIgnoreHashChanges = true;');
    if (Lastpagebtnid) {
        S = Replace(S, -1, 0, 0, '   $("#' + CStr(Divid) + '").formToWizard({ submitButton: \'' + CStr(Lastpagebtnid) + '\' });');
    } else {
        S = Replace(S, -1, 0, 0, '   $("#' + CStr(Divid) + '").formToWizard();');
    }
    S = Replace(S, -1, 0, 0, '   $("#steps").hide();');
    // if system(1) = "gae" OR system(1) = "aspx" then s<-1> = `});`

    _Html += JSB_HTML_SCRIPT(S);
    return _Html;

}
// </FORMWIZARD>

// <FULLSTYLE>
function FullStyle(Float, Left, Right, Top, Bottom, Width, _Height, Border, Overflow, _Color, Background) {
    var _Html = '';

    _Html = '';
    if (Float) { _Html += 'float:' + CStr(Float) + '; '; }
    if (Left) { _Html += 'left:' + CStr(Left) + '; '; }
    if (Right) { _Html += 'right:' + CStr(Right) + '; '; }
    if (Top) { _Html += 'top:' + CStr(Top) + '; '; }
    if (Bottom) { _Html += 'bottom:' + CStr(Bottom) + '; '; }
    if (Width) { _Html += 'width:' + CStr(Width) + '; '; }
    if (_Height) { _Html += 'height:' + CStr(_Height) + '; '; }
    if (Border) { _Html += 'border:' + CStr(Border) + '; '; }
    if (Overflow) { _Html += 'overflow:' + CStr(Overflow) + '; '; }
    if (_Color) { _Html += 'color:' + CStr(_Color) + '; '; }
    if (Background) { _Html += 'background-color:' + CStr(Background) + '; '; }
    if (Overflow) { _Html += 'overflow:' + CStr(Overflow) + '; '; }
    return 'style=' + jsEscapeAttr(_Html);
}
// </FULLSTYLE>

// <GLYPHICON>
function Glyphicon(Nameafterhyphen) {
    return Chr(28) + '\<span class=\'glyphicon glyphicon-' + LCase(Nameafterhyphen) + '\' aria-hidden=\'true\'\>\</span\>' + Chr(29);

}
// </GLYPHICON>

// <H1>
function H1(Content) {
    return Chr(28) + '\<h1\>\<span\>' + Chr(29) + CStr(Content) + Chr(28) + '\</span\>\</h1\>' + Chr(29);

}
// </H1>

// <H2>
function H2(Content) {
    return Chr(28) + '\<h2\>\<span\>' + Chr(29) + CStr(Content) + Chr(28) + '\</span\>\</h2\>' + Chr(29);

}
// </H2>

// <H3>
function H3(Content) {
    return Chr(28) + '\<h3\>\<span\>' + Chr(29) + CStr(Content) + Chr(28) + '\</span\>\</h3\>' + Chr(29);

}
// </H3>

// <H4>
function H4(Content) {
    return Chr(28) + '\<h4\>\<span\>' + Chr(29) + CStr(Content) + Chr(28) + '\</span\>\</h4\>' + Chr(29);

}
// </H4>

// <HEAD>
function Head(_Html) {
    return Chr(28) + '\<head\>' + CStr(_Html) + '\</head\>' + Chr(29);

}
// </HEAD>

// <HIDDEN>
function Hidden(Id, Defaultvalue, Additionalattributes) {
    var _Html = '';
    var Aa = '';

    _Html = Chr(28) + '\<input';
    if (Id) _Html += ' id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\'';
    Aa = JSB_BF_MERGEATTRIBUTE('', '', '', Additionalattributes);
    _Html += ' style="display:none" value="' + CStr(htmlEncode(Defaultvalue)) + '" ' + Aa + '/\>' + Chr(29);
    return _Html;
}
// </HIDDEN>

// <HIDDENVAR>
function HiddenVar(Id, Defaultvalue, Additionalattributes) {
    return Hidden(CStr(Id), CStr(Defaultvalue), Additionalattributes);
}
// </HIDDENVAR>

// <HILIGHT>
function Hilight(Text) {
    return Chr(28) + '\<mark\>' + Chr(29) + CStr(Text) + Chr(28) + '\</mark\>' + Chr(29);

}
// </HILIGHT>

// <HLINE>
function HLine() {
    return Chr(28) + '\<hr /\>' + Chr(29);

}
// </HLINE>

// <HR>
function Hr() {
    return Chr(28) + '\<hr /\>' + Chr(29);

}
// </HR>

// <HSPLITTER>
function HSplitter(Id, Topdiv, Botdiv, Startpixeloffset) {
    if (!Startpixeloffset && isNumber(Botdiv)) {
        Startpixeloffset = Botdiv;
        Botdiv = Topdiv;
        Topdiv = Id;
        Id = '';
    }

    if (Not(Id)) Id = 'HSplitter_' + CStr(Rnd(99999));
    if (!Startpixeloffset) Startpixeloffset = 150;

    var _Html = Chr(28) + '\r\n\
        \<div id="' + Id + '" class="hsplitter"\>\r\n\
            \<div id="' + Id + '_TOP" class="hsplittertop" style="height:' + CStr(Startpixeloffset) + 'px"\>' + Chr(29) + Topdiv + Chr(28) + '\</div\>\r\n\
            \<div id="' + Id + '_SEP" class="hsplitterseperator" \>\</div\>\r\n\
            \<div id="' + Id + '_BOT" class="hsplitterbottom"\>' + Chr(29) + Botdiv + Chr(28) + '\</div\>\r\n\
        \</div\>\r\n\
        \<script\>\r\n\
            hSplitterDragElement("' + Id + '");\r\n\
        \</script\>\r\n\
    ' + Chr(29);

    return _Html;
}
// </HSPLITTER>

// <IFRAME>
function Iframe(Id, Url_Or_Html, Additionalattributes) {
    var Ishtml = undefined;
    var _Html = '';

    if (Url_Or_Html === undefined) {
        Url_Or_Html = Id;
        Url_Or_Html = '';
    }

    _Html = Chr(28) + '\<iframe application=\'yes\'';
    Ishtml = Mid1(Url_Or_Html, 1, 1) == '\<';
    if (Ishtml && Not(Id)) Id = JSB_BF_NEWGUID();
    if (Id) _Html += ' id=\'' + Id + '\' name=\'' + Id + '\'';
    _Html += ' ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'IFrame', ' ', Additionalattributes), ' ');
    if (Ishtml) {
        _Html += ' /\>' + Chr(29);
        _Html += JSB_HTML_SCRIPT('\r\n\
            var doc = document.getElementById(\'' + Id + '\').contentWindow.document;\r\n\
            doc.open();\r\n\
            doc.write(' + jsEscapeString(Url_Or_Html) + ');\r\n\
            doc.close();\r\n\
         ');
    } else {
        _Html += ' src=' + jsEscapeHREF(Url_Or_Html) + '\>' + Chr(29) + 'Loading ' + Id + Chr(28) + '...\</iframe\>' + Chr(29);
    }

    return _Html;
}
// </IFRAME>

// <IMAGE>
function IMAGE(Id, Src, Alttext, Stretchwidth, Stretchheight, Additionalattributes) {
    var _Html = '';

    // Did we pass the image (string data only) in the ID?
    if (Src === undefined || isNumber(Left(Src, 1)) || isJSON(Src)) {
        Src = Id;
        Id = '';
    }

    if (isNumber(Left(Alttext, 1))) {
        Additionalattributes = Stretchheight;
        Stretchheight = Stretchwidth;
        Stretchwidth = Alttext;
        Alttext = '';
    }

    // AdditionalAttributes always the last parameter
    if (isJSON(Alttext)) {
        Additionalattributes = Alttext;
        Alttext = '';;
    } else if (isJSON(Stretchwidth)) {
        Additionalattributes = Stretchwidth;
        Stretchwidth = '';;
    } else if (isJSON(Stretchheight)) {
        Additionalattributes = Stretchheight;
        Stretchheight = '';
    }

    _Html = '\<img';
    if (Id) _Html += ' id=\'' + Id + '\' name=\'' + Id + '\'';
    _Html += ' border="0" src="' + CStr(Src) + '"';
    if (CBool(Alttext)) _Html += ' alt="' + htmlEscape(Alttext) + '"';
    if (CBool(Stretchwidth)) _Html += ' width="' + CStr(Stretchwidth) + '"';
    if (CBool(Stretchheight)) _Html += ' height="' + CStr(Stretchheight) + '"';
    _Html += ' ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'img-fluid', ' ', Additionalattributes), ' ');
    _Html += '/\>';
    return html(_Html);
}
// </IMAGE>

// <INPUTGROUP>
function InputGroup(Prefixtext, Controlhtml, Suffixtext) {
    var _Html = '';

    _Html = Chr(28) + '\<div class="input-group"\>';
    if (Prefixtext) _Html += '\<span class="input-group-addon"\>' + htmlEscape(Prefixtext) + '\</span\>';
    _Html += Chr(29) + CStr(Controlhtml) + Chr(28);
    if (Suffixtext) _Html += '\<span class="input-group-addon"\>' + htmlEscape(Suffixtext) + '\</span\>';
    _Html += '\</div\>' + Chr(29);
    return _Html;

}
// </INPUTGROUP>

// <INPUTPOPSELECTION>
function InputPopSelection(Id, Values, Defaultvalue, Additionalattributes, Width, _Height, Title) {
    var Dialogclick = '';
    var Dialog = '';
    var Popscript = '';

    Dialogclick = 'onclick="event.stopPropagation(); setTimeout(function () { $(this).prop(\'onclick\', null).off(\'click\'); $(\'#popOutDIV\').dialog(\'close\') }, 10); "';

    Dialog = JSB_HTML_FIELDSETBTNS('id1', Values, CStr(Defaultvalue), false, [undefined, 'style=\'min-width: 90px\'', Dialogclick]);

    Popscript = JSB_HTML_SCRIPT('\r\n\
        function ' + CStr(Id) + '_popScript(ctl) {\r\n\
              var Dialog = $(' + jsEscapeString(Dialog) + ');\r\n\
              var dftValue = $(ctl).val();\r\n\
              \r\n\
              new popoutWindow(\'' + CStr(Title) + '\', Dialog, \'' + CStr(Width) + '\', \'' + CStr(_Height) + '\', false /* onCloseSubmit */, ctl /*putResultInCtlOrID */, self /* pFromWindow */);\r\n\
              \r\n\
              // Set the correct dftValue\r\n\
              if (dftValue) {\r\n\
                  setTimeout(function() { \r\n\
                      var radioBtn = $(":radio[value=" + dftValue + "]", Dialog)\r\n\
                      $(radioBtn).prop(\'checked\', true)\r\n\
                      $(radioBtn).trigger("change")\r\n\
                      $(radioBtn).focus()\r\n\
                  }) \r\n\
              }\r\n\
            }\r\n\
        ');

    Additionalattributes[Additionalattributes.length] = 'onclick=\'' + CStr(Id) + '_popScript(this)\'';
    return JSB_HTML_TEXTBOX(CStr(Id), Defaultvalue, false, Additionalattributes) + Popscript;

}
// </INPUTPOPSELECTION>

// <INTEGERBOX>
function INTEGERBOX(Id, Defaultvalue, Readonly, Additionalattributes, Minvalue, Maxvalue) {
    var _Html = '';

    if (Readonly) {
        _Html = Chr(28) + '\<input id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\' readonly tabindex=\'-1\' ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'IntegerBox_ReadOnly form-control', ' ', Additionalattributes), ' ');
    } else {
        _Html = Chr(28) + '\<input id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\' type=\'number\' ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'IntegerBox form-control', ' ', Additionalattributes), ' ');
        if (Len(Minvalue)) _Html += ' min=\'' + CStr(Minvalue) + '\'';
        if (Len(Maxvalue)) _Html += ' max=\'' + CStr(Maxvalue) + '\'';
    }

    if (Len(Defaultvalue)) _Html += ' value="' + CStr(htmlEncode(Defaultvalue)) + '"';

    _Html += ' onfocus=\'if (isMobile() && !$(this).attr("readonly")) $(this).keypad({ layout: "integer" })\' /\>' + Chr(29);

    return _Html;

}
// </INTEGERBOX>

// <ITALIC>
function Italic(Text, Additionalattributes) {
    return Chr(28) + '\<i' + joinAttributes(Additionalattributes) + '\>' + Chr(29) + CStr(Text) + Chr(28) + '\</i\>' + Chr(29);
}
// </ITALIC>

// <ITALICS>
function Italics(Text, Additionalattributes) {
    return Chr(28) + '\<i' + joinAttributes(Additionalattributes) + '\>' + Chr(29) + CStr(Text) + Chr(28) + '\</i\>' + Chr(29);
}
// </ITALICS>

// <JAVASCRIPT>
function JavaScript(Src) {
    return Chr(28) + '\<script\>' + CStr(Src) + '\</script\>' + crlf + Chr(29);

}
// </JAVASCRIPT>

// <BOLD>
function bold(Text) {
    return Chr(28) + '\<b\>' + Chr(29) + CStr(Text) + Chr(28) + '\</b\>' + Chr(29);

}
// </BOLD>

// <ANCHOR>
function Anchor(Idorurl, Url, Caption, Additionalattributes) {
    var _Html = '';

    if (Url === undefined) {
        Url = Idorurl;
        Caption = Url;
        Idorurl = undefined;;
    } else if (Caption === undefined) {
        Caption = Url;
        Url = Idorurl;
        Idorurl = undefined;
    }

    if (isJSON(Caption) || CBool(isArray(Caption))) {
        Additionalattributes = Caption;
        if (InStr1(1, Idorurl, '/') || InStr1(1, Idorurl, '\\')) {
            Caption = Url;
            Url = Idorurl;
            Idorurl = '';
        } else {
            Caption = Url;
        }
    }

    _Html = Chr(28) + '\<a';
    if (Idorurl) _Html += ' id=\'' + Idorurl + '\' name=\'' + Idorurl + '\'';
    _Html += ' ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'Anchor', ' ', Additionalattributes), ' '); // Removed Form-Control Because Of Width 100%

    if (InStr1(1, _Html, 'target=') == 0) {
        if (LCase(Left(Url, 4)) == 'http' || Left(Url, 1) == '/') _Html += ' target="_top"'; else _Html += ' target="_parent"';
    }

    _Html += ' href=' + jsEscapeHREF(Url) + '\>' + Chr(29) + CStr(Caption) + Chr(28) + '\</a\>' + Chr(29);
    return _Html;
}
// </ANCHOR>

// <AUTOTEXTBOX>
function AutoTextBox(Id, Values, Default, Minlength, Additionalattributes, Multivalueddata, Restricttolist, Labelname, Valuename) {
    // 7 Parameters

    var Vs = undefined;
    var Subdelimiter = '';
    var V = '';
    var Display = '';
    var Keypadtype = '';
    var Onfocus = '';
    var _Html = '';
    var Aa = '';
    var Iopts = undefined;

    Aa = JSB_BF_MERGEATTRIBUTE('class', 'clearable', ' ', Additionalattributes);
    Aa = JSB_BF_MERGEATTRIBUTE('class', 'AutoTextBox', ' ', Aa);
    Aa = Join(JSB_BF_MERGEATTRIBUTE('class', 'form-control', ' ', Aa), ' ');
    if (InStr1(1, Aa, 'type=') == 0) Aa += ' type=\'text\'';
    if (Restricttolist === undefined) Restricttolist = true;

    Iopts = [undefined,];

    Vs = makeArray(Values); Subdelimiter = activeProcess.At_Ni;
    V = Vs[LBound(Vs)];
    if (!InStr1(1, V, Subdelimiter)) Subdelimiter = '';

    if ((Subdelimiter && Multivalueddata) || (Subdelimiter >= Chr(252))) {
        // Build list
        V = Vs[1];
        for (V of iterateOver(Vs)) {
            if (InStr1(1, V, Subdelimiter)) {
                Display = Field(V, Subdelimiter, 1);
                V = Field(V, Subdelimiter, 2);
            } else {
                Display = V;
            }
            Iopts[Iopts.length] = { "label": Display, "value": V };
        }
    } else {
        Iopts = Vs;
    }

    if (!Minlength) Minlength = 1;

    if (Len(Default)) Default = ' value="' + CStr(htmlEncode(Default)) + '"';

    Keypadtype = hasAttribute('mobilepad', Additionalattributes);
    if (InStr1(1, '\'"', Left(Keypadtype, 1)) && Left(Keypadtype, 1) == Right(Keypadtype, 1)) Keypadtype = Mid1(Keypadtype, 2, Len(Keypadtype) - 2);

    if (Keypadtype) {
        if (Left(Keypadtype, 1) != '[') Keypadtype = '"' + LCase(Keypadtype) + '"';
        if (Keypadtype == '"full"') {
            Onfocus = (' onfocus=' + jsEscapeAttr('if (isMobile() && !$(this).attr("readonly") && $(window).width() \> 700) $(this).keypad({layout: ' + Keypadtype + ' })'));
        } else {
            Onfocus = (' onfocus=' + jsEscapeAttr('if (!$(this).attr("readonly") && $(window).width() \> 300) $(this).keypad({layout: ' + Keypadtype + ' })'));
        }
    }

    if (Id) {
        _Html = Chr(28) + '\<input id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\' ' + Aa + ' ' + Default + Onfocus + ' /\>' + Chr(29);
        _Html += JSB_HTML_SCRIPT('autoCompleteTextBox("#' + CStr(Id) + '" , ' + Json2String(Iopts) + ', ' + CStr(Minlength) + ', null, ' + CStr(Restricttolist + 0) + ', \'' + CStr(Labelname) + '\', \'' + CStr(Valuename) + '\');');
    } else {
        // knockout will supply ID and Name and do autoCompleteTextBox
        Iopts = htmlEscape(Json2String(Iopts));
        _Html = Chr(28) + '\<input ' + Aa + Onfocus + ' ' + Default + ' myOpts=\'' + CStr(Iopts) + '\' minLength=' + CStr(Minlength + 0) + ' restrictToList=' + CStr(Restricttolist + 0) + ' labelName=\'' + CStr(Labelname) + '\' valueName=\'' + CStr(Valuename) + '\' /\>' + Chr(29);
    }

    return _Html;
}
// </AUTOTEXTBOX>

// <BUTTON>
function Button(Id, Displaytext, Additionalattributes, Bparsleycheck, Btntype, Btnsize) {
    if (Additionalattributes === undefined) {
        if (CBool(isArray(Displaytext)) || isJSON(Displaytext)) {
            Additionalattributes = Displaytext;
            Displaytext = Id;
            Id = '';
        }
    }
    if (Displaytext === undefined) Displaytext = Id;

    var _Html = Chr(28) + '\<button';
    var Pc = '';
    if (Id) _Html += ' id=\'' + Id + '\' name=\'' + Id + '\'';

    if (Bparsleycheck) { Pc = 'if (!parsleyIsValid(true)) return false;'; } else { Pc = 'parsleyDestroy();'; }
    var Aa = JSB_BF_MERGEATTRIBUTE('onclick', Pc, ';', Additionalattributes);

    if (hasAttribute('onclick', Aa) || hasAttribute('data-bind', Aa)) {
        _Html += ' type=\'button\'';
    } else {
        _Html += ' type=\'submit\'';
        Pc += 'assignBtn(this, ' + jsEscapeString(Displaytext, 'onclick') + '); jsbClose(this); ';
    }

    Aa = JSB_BF_MERGEATTRIBUTE('class', 'Button', ' ', Aa);
    if (Not(Btntype)) Btntype = 'default';
    if (Left(Btntype, 4) != 'btn-') Btntype = 'btn-' + Btntype;
    if (!InStr1(1, Aa, 'btn-')) Aa = JSB_BF_MERGEATTRIBUTE('class', 'btn ' + Btntype, ' ', Aa);

    if (Btnsize) {
        if (Left(Btnsize, 4) != 'btn-') Btnsize = 'btn-' + CStr(Btnsize);
        Aa = JSB_BF_MERGEATTRIBUTE('class', Btnsize, ' ', Aa);
    }

    _Html += joinAttributes(Aa);
    _Html += '\>' + Chr(29) + CStr(Language(Displaytext)) + Chr(28) + '\</button\>&nbsp;' + Chr(29);

    return _Html;
}
// </BUTTON>

// <CHECKBOX>
function CHECKBOX(Id, Value, Description, Checked, Additionalattributes) {
    var Readonly = undefined;
    var _Html = '';

    if (isJSON(Description) || CBool(isArray(Description))) {
        Additionalattributes = Description;
        Description = '';;
    } else if (isJSON(Checked) || CBool(isArray(Checked))) {
        Additionalattributes = Checked;
        Checked = false;
    }

    Readonly = (hasAttribute('readonly', Additionalattributes) || hasAttribute('disabled', Additionalattributes));

    if (Readonly) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'form-control CheckBoxSpan_readonly', ' ', Additionalattributes);
    } else {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'form-control CheckBoxSpan', ' ', Additionalattributes);
    }

    _Html = Chr(28) + '\<span ' + JSB_BF_UIADDITIONALATTRIBUTES(Additionalattributes) + '\>';
    _Html += '\<input type=\'checkbox\' id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\' value=\'' + htmlEscape(Value) + '\' class=\'CheckBox\' ' + dataAdditionalAttributes(Additionalattributes);
    if (CBool(Checked)) _Html += ' checked';
    if (Readonly && !(hasAttribute('disabled', Additionalattributes))) _Html += ' disabled=\'disabled\'';
    _Html += '/\>';
    if (CBool(Description)) _Html += '\<label class="CheckBoxLabel" for=\'' + CStr(Id) + '\'\>' + Chr(29) + CStr(Description) + Chr(28) + '\</label\>';
    _Html += '\</span\>' + Chr(29);
    return _Html;

}
// </CHECKBOX>

// <CLASSORATTTRIBUTES>
function classOrAtttributes(Classnameorattributes) {
    if (isJSON(Classnameorattributes) || CBool(isArray(Classnameorattributes))) {
        return ' ' + Join(JSB_BF_MERGEATTRIBUTE('', '', ' ', Classnameorattributes), ' ');
    } else if (Left(Classnameorattributes, 6) == 'class=') {
        return ' ' + CStr(Classnameorattributes);
    } else if (Len(Classnameorattributes)) {
        return ' class=\'":classname:"\'';
    }
    return '';
}
// </CLASSORATTTRIBUTES>

// <COLS2>
function Cols2(C1width, C1content, C2width, C2content, _Height, C1style, C2style) {
    var H = '';
    var C1h = '';
    var C2h = '';
    var R1style = '';
    var R2style = '';

    if (C2width === undefined) {
        C2content = C1content;
        C1content = C1width;
        C1width = '50%';
        C2width = '50%';
    }

    if (!(C1style === undefined) && C2style === undefined) {
        // Drop Height
        C2style = C1style;
        C1style = _Height;
        _Height = '100%';
    }

    if (isJSON(R1style)) { R1style = JSB_BF_MERGEATTRIBUTE('style', '', ';', R1style); }
    if (isJSON(R2style)) { R2style = JSB_BF_MERGEATTRIBUTE('style', '', ';', R2style); }

    if (Not(_Height)) { H = 'top: 0; bottom: 0;'; } else { H = 'height: ' + _Height + '; '; }

    if (InStr1(1, C1width, 'px') && InStr1(1, C2width, '%')) {
        // Fixed Left, Open Right from http://jsfiddle.net/bWuQB/5/  leftcss = "float loeft; width: xpx;" rightcss = "margin-left: xpx;"
        // <div class='twocolumns_fixed_Variable' style=' position: absolute; width: 100%; left: 0; `:h:`' >
        return Chr(28) + '\r\n\
            \<div class=\'twocolumns_fixed_Variable\' style=\'position: absolute; width: 100%; left: 0; ' + H + '\' \>\r\n\
            \<div class=\'fixedLeft\' style="float: left; position: absolute; ' + H + ' width: ' + C1width + '; ' + C1style + '"\>\r\n\
            ' + Chr(29) + C1content + Chr(28) + '\r\n\
            \</div\>\r\n\
            \<div class=\'variableRight\' style="position: absolute; left: ' + C1width + '; right: 0; ' + H + ' ' + C2style + '"\>\r\n\
            ' + Chr(29) + C2content + Chr(28) + '\r\n\
            \</div\>\r\n\
         \</div\>\r\n\
      ' + Chr(29);;
    }

    if (InStr1(1, C1width, '%') && InStr1(1, C2width, 'px')) {

        // Open Left, Fixed Right
        return Chr(28) + '\r\n\
         \<div class=\'twocolumns_Variable_fixed\' style=\'position: relative; width: 100%;  ' + H + '\' \>\r\n\
            \<div class=\'fixedRight\' style=\'float: right; ' + H + ' width: ' + CStr(CNum(C2width)) + 'px; ' + C2style + '\'\>\r\n\
            ' + Chr(29) + C2content + Chr(28) + '\r\n\
            \</div\>\r\n\
            \<div class=\'variableLeft\' style=" ' + H + ' padding-right: ' + CStr(CNum(C2width)) + 'px; ' + C1style + '"\>\r\n\
            ' + Chr(29) + C1content + Chr(28) + '\r\n\
            \</div\>\r\n\
         \</div\>\r\n\
      ' + Chr(29);;
    }

    // Percent both or fixed both
    if (C1width) { C1h = 'width: ' + C1width + ';'; }
    if (C2width) { C2h = 'width: ' + C2width + '; left: ' + C1width + ';'; }
    return Chr(28) + '\r\n\
      \<div style="position: relative; float: left; width: ' + C1width + '; ' + H + C1style + '"\>' + Chr(29) + C1content + Chr(28) + '\</div\>\r\n\
      \<div style="position: relative; float: left; width: ' + C2width + '; ' + H + C2style + '"\>' + Chr(29) + C2content + Chr(28) + '\</div\>\r\n\
   ' + Chr(29);
}
// </COLS2>

// <COMBOBOX>
function ComboBox(Id, Urlorarray, Default, Addblank, Descriptionfield, Valuefield, Additionalattributes, Multivalueddata, Maxselected) {
    // 9

    var _Html = undefined;
    var Scripts = undefined;
    var Isurl = undefined;
    var Type = '';
    var Keypadtype = '';
    var Onfocus = '';
    var Onsuccess = '';
    var Onfailure = '';
    var Vals = '';
    var Iopts = '';

    _Html = [undefined,];
    Scripts = [undefined,];

    if (Multivalueddata === undefined) Multivalueddata = true;
    if ((!Maxselected)) Maxselected = 1;

    if (Addblank === undefined) {
        if (isJSON(Default) || CBool(isArray(Default))) {
            Additionalattributes = Default;
            Default = '';
        }
    } else if (Descriptionfield === undefined) {
        if (isJSON(Addblank) || CBool(isArray(Addblank))) {
            Additionalattributes = Addblank;
            Addblank = false;
        }
    } else if (Valuefield === undefined) {
        if (isJSON(Descriptionfield) || CBool(isArray(Descriptionfield))) {
            Additionalattributes = Descriptionfield;
            Descriptionfield = '';
        }
    } else if (Additionalattributes === undefined) {
        if (isJSON(Valuefield) || CBool(isArray(Valuefield))) {
            Additionalattributes = Valuefield;
            Valuefield = '';
        }
    }

    if (System(1) == 'aspx') {
        _Html[_Html.length] = Head(JsLink(jsbRoot() + 'js/magicsuggest.js'));
        _Html[_Html.length] = CStr(_Html) + Head(CssLink(jsbRoot() + 'css/magicsuggest.css'));
    }

    Type = hasAttribute('type', Additionalattributes);
    if (InStr1(1, '\'"', Left(Type, 1)) && Left(Type, 1) == Right(Type, 1)) Type = Mid1(Type, 2, Len(Type) - 2);

    Keypadtype = hasAttribute('mobilepad', Additionalattributes);
    if (InStr1(1, '\'"', Left(Keypadtype, 1)) && Left(Keypadtype, 1) == Right(Keypadtype, 1)) Keypadtype = Mid1(Keypadtype, 2, Len(Keypadtype) - 2);

    if (Type == 'number' && Not(Keypadtype)) Keypadtype = 'real';

    if (Keypadtype) {
        if (Left(Keypadtype, 1) != '[') Keypadtype = '"' + LCase(Keypadtype) + '"';
        if (Keypadtype == '"full"') {
            Onfocus = (' onfocus=' + jsEscapeAttr('if (isMobile() && !$(this).attr("readonly") && $(window).width() \> 700) $(this).keypad({layout: ' + Keypadtype + ' })'));
        } else {
            Onfocus = (' onfocus=' + jsEscapeAttr('if (!$(this).attr("readonly") && $(window).width() \> 300) $(this).keypad({layout: ' + Keypadtype + ' })'));
        }
    }

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'magicSelect form-control', ' ', Additionalattributes);

    if (CBool(isString(Urlorarray))) {
        Isurl = (Left(Urlorarray, 4) == 'http' || Left(Urlorarray, 2) == '//');
    }

    Default = Change(Default, '\'', '\\\'');
    Valuefield = Change(Valuefield, '\'', '\\\'');
    Descriptionfield = Change(Descriptionfield, '\'', '\\\'');

    if (Id) {
        _Html[_Html.length] = (Chr(28) + '\<input id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\'' + joinAttributes(Additionalattributes, ' ') + Onfocus + ' onchange="if ($(this).parsley && $(this).parsley().reset) $(this).parsley().reset()" /\> ' + Chr(29));

        if (Isurl) {
            Onsuccess = '\r\n\
              $(\'#dd_' + CStr(Id) + '\').empty();\r\n\
              \r\n\
              for(var key in json) { \r\n\
                  comboBoxLoad($(\'#' + CStr(Id) + '\'), json[key], \'' + CStr(Default) + '\', ' + CStr(+Addblank + 0) + ', \'' + CStr(Valuefield) + '\', \'' + CStr(Descriptionfield) + '\', ' + CStr(CNum(Multivalueddata)) + ', ' + CStr(CNum(Maxselected)) + ')\r\n\
                  break;\r\n\
               }\r\n\
            ';

            Onfailure = 'alert(\'failed combobox ajax call to \' + ' + jsEscapeString(CStr(Urlorarray)) + ' + \'; error: \' + textStatus)';

            // QuotedUrl, jsSuccess, jsFailure, PostPayLoad, infoMsg, HeaderJSON, Ok2Cache)
            Scripts[Scripts.length] = ajax(jsEscapeString(CStr(Urlorarray)), Onsuccess, Onfailure, undefined, undefined, undefined, true);;
        } else {
            if (CBool(isString(Urlorarray))) Vals = Json2String(makeArray(Urlorarray)); else Vals = Json2String(Urlorarray);
            Scripts[Scripts.length] = 'comboBoxLoad($(\'#' + CStr(Id) + '\'), ' + Vals + ', \'' + CStr(Default) + '\', ' + CStr(+Addblank + 0) + ', \'' + CStr(Valuefield) + '\', \'' + CStr(Descriptionfield) + '\', ' + CStr(CNum(Multivalueddata)) + ', ' + CStr(CNum(Maxselected)) + ')';
        }
    } else {
        // knockout will supply load
        Iopts = htmlEscape(Urlorarray);
        _Html[_Html.length] = (Chr(28) + '\<input' + joinAttributes(Additionalattributes, ' ') + Onfocus + ' myOpts=\'' + Iopts + '\' onchange="if ($(this).parsley && $(this).parsley().reset) $(this).parsley().reset()" /\>' + Chr(29));
    }

    _Html[_Html.length] = JSB_HTML_SCRIPT(Join(Scripts, crlf));

    return Join(_Html, '');
}
// </COMBOBOX>

// <CONTEXTMENU>
function ContextMenu(Jqselector, Menulist, Noscripttags, Cmenuid) {
    var Menuitems = undefined;
    var Menuitem = undefined;
    var Txt = '';
    var Onclick = '';
    var Style = '';
    var S = '';

    if (Not(Cmenuid)) Cmenuid = 'cm_' + JSB_BF_NICENAME(JSB_BF_NEWGUID()) + '_contextMenu'; else Cmenuid = JSB_BF_NICENAME(Cmenuid);

    Menuitems = [undefined,];
    for (Txt of iterateOver(Menulist)) {
        Menuitem = Menulist[Txt];
        if (isJSON(Menuitem)) {
            if (CBool(Menuitem.caption)) Txt = Menuitem.caption;
            if (CBool(Menuitem.onclick)) {
                Onclick = 'var cmd =' + jsEscapeString(CStr(Menuitem.cmd) + CStr(Menuitem.Cmd)) + '; \r\n\
                           var val=' + jsEscapeString(CStr(Menuitem.val) + CStr(Menuitem.Val)) + '; \r\n\
                           var Cmd=cmd; var Val=val; \r\n\
                           contextMenuClose(); \r\n\
                           ' + CStr(Menuitem.onclick);
            } else {
                Onclick = 'contextMenu_Submit(this, ' + jsEscapeString(CStr(Menuitem.cmd) + CStr(Menuitem.Cmd)) + ', ' + jsEscapeString(CStr(Menuitem.val) + CStr(Menuitem.Val)) + ')';
            }
            Menuitems[Menuitems.length] = '$(cMenu).append(' + jsEscapeString('\<li class=\'contextMenu\' onclick=' + jsEscapeAttr(Onclick) + '\>' + Txt + '\</li\>') + ');';
        } else if (Not(Menuitem)) {
            Style = ' style=' + jsEscapeAttr('height: 6px; background-color:gray; width: auto;');
            Menuitems[Menuitems.length] = '$(cMenu).append(' + jsEscapeString('\<li class=\'contextMenu\' ' + Style + '\>\</li\>') + ');';
        } else {
            Menuitems[Menuitems.length] = '$(cMenu).append(' + jsEscapeString('\<li class=\'contextMenu\'\>' + CStr(Menuitem) + '\</li\>') + ');';
        }
    }

    S = '   \r\n\
         $(document).on("contextmenu", "' + CStr(Jqselector) + '", function (e) { return ' + Cmenuid + '(e, this) });\r\n\
         \r\n\
         function ' + Cmenuid + '(e, c) {\r\n\
             // Create context menu\r\n\
             var cMenu = $("\<ul id=\'contextMenu\' /\>");\r\n\
             ' + Join(Menuitems, crlf) + '\r\n\
             return jsbContentMenu(e, cMenu)\r\n\
         }';

    if (Noscripttags) S = html(S); else S = JSB_HTML_SCRIPT(S);
    return S;
}
// </CONTEXTMENU>

// <DATEBOX>
function DATEBOX(Id, Defaultvalue, Readonly, Additionalattributes, Yearrange) {
    var D = '';
    var _Html = '';

    if (isJSON(Defaultvalue) || CBool(isArray(Defaultvalue))) {
        Additionalattributes = Defaultvalue;
        Defaultvalue = '';
    }

    if (isJSON(Readonly) || CBool(isArray(Readonly))) {
        Additionalattributes = Readonly;
        Readonly = false;
    }

    if (Not(Yearrange)) Yearrange = CStr(CNum(JSB_BF_THEYEAR()) - 100) + ':' + JSB_BF_THEYEAR();
    if (Len(Defaultvalue)) {
        if (InStr1(1, Defaultvalue, '-') || InStr1(1, Defaultvalue, '/')) {
            D = r83Date(r83Date(Defaultvalue));
        } else {
            D = r83Date(Defaultvalue);
        }
    }

    _Html = Chr(28) + '\<input';
    if (Id) _Html += ' id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\'';
    _Html += ' ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'DateBox form-control', ' ', Additionalattributes), ' ') + ' value="' + D + '"';

    if (CBool(Readonly)) {
        _Html += ' readonly tabindex=\'-1\' /\>' + Chr(29);
    } else {
        _Html += ' /\>' + Chr(29);

        if (Id) {
            // Use jQuery datepicker
            _Html += JSB_HTML_SCRIPT('\r\n\
                if ($( "#' + CStr(Id) + '" ).datepicker) {\r\n\
                   $( "#' + CStr(Id) + '" ).datepicker({ \r\n\
                       dateFormat: "yy-mm-dd", \r\n\
                       showButtonPanel: true, \r\n\
                       changeMonth: true, \r\n\
                       changeYear: true, \r\n\
                       yearRange: \'' + Yearrange + '\',\r\n\
                       onChangeMonthYear: function(year, month, datePicker) {\r\n\
                            // Prevent forbidden dates, like 2/31/2012:\r\n\
                            var $t = $(this);\r\n\
                            var day = $t.data(\'preferred-day\') || new Date().getDate();\r\n\
                            var newDate = new Date(month + \'/\' + day + \'/\' + year);\r\n\
                            while (day \> 28) {\r\n\
                              if (newDate.getDate() == day && newDate.getMonth() + 1 == month && newDate.getFullYear() == year) {\r\n\
                                break;\r\n\
                              } else {\r\n\
                                day -= 1;\r\n\
                                newDate = new Date(month + \'/\' + day + \'/\' + year);\r\n\
                              }\r\n\
                            }   \r\n\
                            $t.datepicker(\'setDate\', newDate);\r\n\
                       },  \r\n\
                        \r\n\
                       beforeShow: function(dateText, datePicker) {\r\n\
                            // Record the starting date so that\r\n\
                            // if the user changes months from Jan-\>Feb-\>Mar\r\n\
                            // and the original date was 1/31,\r\n\
                            // then we go 1/31-\>2/28-\>3/31.\r\n\
                            $(this).data(\'preferred-day\', ($(this).datepicker(\'getDate\') || new Date()).getDate());\r\n\
                            hideKeyboard();\r\n\
                       }\r\n\
                    }); \r\n\
                } else if ($( "#' + CStr(Id) + '" ).date) {\r\n\
                   $( "#' + CStr(Id) + '" ).date({ dateFormat: "yy-mm-dd", showButtonPanel: true }); \r\n\
                } else {\r\n\
                   $( "#' + CStr(Id) + '" ).attr(\'type\', \'date\');\r\n\
                }\r\n\
           ');
        } else {
            // Html := @jsb_html.SCRIPT(`$('.DateBox').datepicker();`);
        }
    }

    return _Html;

}
// </DATEBOX>

// <DECIMALBOX>
function DECIMALBOX(Id, Defaultvalue, Readonly, Additionalattributes, Minvalue, Maxvalue) {
    var _Html = '';

    if (isJSON(Defaultvalue) || CBool(isArray(Defaultvalue))) {
        Additionalattributes = Defaultvalue;
        Defaultvalue = '';
    }

    if (isJSON(Readonly) || CBool(isArray(Readonly))) {
        Additionalattributes = Readonly;
        Readonly = false;
    }

    if (CBool(Readonly)) {
        _Html = Chr(28) + '\<input id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\' readonly tabindex=\'-1\' ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'DecimalBox_ReadOnly form-control', ' ', Additionalattributes), ' ');
    } else {
        // HTML = CHR(28):"<input id='":ID:"' name='":ID:"' type='number' step='any' ":Join(@MergeAttribute("class", "DecimalBox form-control", " ", AdditionalAttributes), " ")
        _Html = Chr(28) + '\<input id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\' ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'DecimalBox form-control', ' ', Additionalattributes), ' ');
        if (Len(Minvalue)) _Html += ' min=\'' + CStr(Minvalue) + '\'';
        if (Len(Maxvalue)) _Html += ' max=\'' + CStr(Maxvalue) + '\'';
    }

    if (Len(Defaultvalue)) _Html += ' value="' + CStr(htmlEncode(Defaultvalue)) + '"';

    _Html += ' onfocus=\'if (isMobile() && !$(this).attr("readonly")) $(this).keypad({ layout: "real" })\' /\>' + Chr(29);

    return _Html;

}
// </DECIMALBOX>

// <DEVXGRID>
async function JSB_HTML_DEVXGRID(Gridid, Tblnameorarray, Usersettings) {
    // local variables
    var Xhtml, Ftable, Sl, Rows;

    var Serverurl = Usersettings.serverURL;
    if (Not(Serverurl)) Serverurl = jsbRootAct();

    if (Not(Tblnameorarray)) { activeProcess.At_Errors = 'HTML.devXGrid: Mising tblNameOrArray'; return undefined; }

    if (Not(Usersettings.gridDefs) || Not(Usersettings.primaryKeyField)) {
        var Griddefinition = await JSB_HTML_GETDEVXGRIDMETA(Serverurl, Usersettings, Tblnameorarray, function (_Serverurl, _Usersettings, _Tblnameorarray) { Serverurl = _Serverurl; Usersettings = _Usersettings; Tblnameorarray = _Tblnameorarray });
        if (Not(Griddefinition)) return undefined;
        if (Not(Usersettings.primaryKeyField)) Usersettings.primaryKeyField = Griddefinition.primaryKey;
        if (Not(Usersettings.gridDefs)) Usersettings.gridDefs = Griddefinition.gridDefs;
    }

    var _Html = JsLink('https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.10.1/polyfill.min.js');
    _Html += JsLink('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.1.1/exceljs.min.js');
    _Html += JsLink('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js');
    _Html += CssLink('https://cdn3.devexpress.com/jslib/21.2.5/css/dx.light.css');
    _Html += JsLink('https://cdn3.devexpress.com/jslib/21.2.5/js/dx.all.js');

    // See https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration/
    _Html += JSB_HTML_STYLE('\r\n\
        .dx-datagrid .dx-data-row \> td.bullet {\r\n\
          padding-top: 0;\r\n\
          padding-bottom: 0;\r\n\
        }\r\n\
    ');

    _Html += html('\r\n\
        \<div class="dx-viewport" style="position: absolute"\>\r\n\
            \<div class="demo-container"\>\r\n\
              \<div id="' + CStr(Gridid) + '"\>\</div\>\r\n\
            \</div\>\r\n\
        \</div\>\r\n\
    ');

    Xhtml = CStr(Xhtml) + html('\r\n\
        \<div class="dx-viewport" style="position: absolute"\>\r\n\
          \<div id="' + CStr(Gridid) + '"\>\</div\>\r\n\
        \</div\>\r\n\
    ');

    var Scriptsetupgrid = '[' + Join(Usersettings.gridDefs, ',' + crlf) + ']';

    var S = '';

    if (isSelectlist(CStr(Tblnameorarray))) Tblnameorarray = getList(Tblnameorarray);

    if (CBool(isArray(Tblnameorarray))) {
        S += '\r\n\
            // setup an array datastore\r\n\
            $(() =\> {\r\n\
                window.' + CStr(Gridid) + '_customDataStore = [' + Join(Tblnameorarray, ',' + crlf) + '];\r\n\
            });\r\n\
        ';;
    } else if (CBool(Usersettings.databaseName)) {
        S += '\r\n\
            // setup a custom datastore\r\n\
            $(() =\> {\r\n\
                    \r\n\
                function isNotEmpty(value) {\r\n\
                    return value !== undefined && value !== null && value !== \'\';\r\n\
                }\r\n\
                \r\n\
                window.' + CStr(Gridid) + '_customDataStore = new DevExpress.data.CustomStore({\r\n\
                    key: \'' + CStr(Usersettings.primaryKeyField) + '\',\r\n\
                    load(loadOptions) {\r\n\
                      const deferred = $.Deferred();\r\n\
                      const args = { databaseName: \'' + CStr(Usersettings.databaseName) + '\', tblNameOrArray: \'' + CStr(Tblnameorarray) + '\' };\r\n\
                \r\n\
                      [\'skip\',\'take\',\'requireTotalCount\',\'requireGroupCount\',\'sort\',\'filter\',\'totalSummary\',\'group\',\'groupSummary\',].forEach((i) =\> {\r\n\
                        if (i in loadOptions && isNotEmpty(loadOptions[i])) {\r\n\
                          args[i] = JSON.stringify(loadOptions[i]);\r\n\
                        }\r\n\
                      });\r\n\
                      \r\n\
                      $.ajax({\r\n\
                        url: \'' + Serverurl + 'restApiFetch\',\r\n\
                        dataType: \'json\',\r\n\
                        data: args,\r\n\
                        success(result) {\r\n\
                          // debugger;\r\n\
                          if (result.errors) {\r\n\
                              deferred.reject(\'Data Loading Error: \' + result.errors);\r\n\
                          } else {\r\n\
                              deferred.resolve(result.data, {\r\n\
                                totalCount: result.totalCount,\r\n\
                                summary: result.summary,\r\n\
                                groupCount: result.groupCount,\r\n\
                              });\r\n\
                          }\r\n\
                        },\r\n\
                        error() {\r\n\
                        debugger;\r\n\
                          deferred.reject(\'Data Loading Error\');\r\n\
                        },\r\n\
                        timeout: 33000,\r\n\
                      });\r\n\
                \r\n\
                      return deferred.promise();\r\n\
                    },\r\n\
                });\r\n\
            });\r\n\
        ';
    } else {
        if (await JSB_ODB_OPEN('', CStr(Tblnameorarray), Ftable, function (_Ftable) { Ftable = _Ftable })) {
            if (await JSB_ODB_SELECTTO('*', Ftable, '', Sl, function (_Sl) { Sl = _Sl })) {
                Rows = getList(Sl);

                S += '\r\n\
                    // setup an array datastore\r\n\
                    $(() =\> {\r\n\
                        window.' + CStr(Gridid) + '_customDataStore = [' + Join(Rows, ',' + crlf) + '];\r\n\
                    });\r\n\
                ';
            } else {
                S += 'alert(' + jsEscapeString(CStr(activeProcess.At_Errors)) + ');';
            }
        } else {
            S += 'alert(' + jsEscapeString(CStr(activeProcess.At_Errors)) + ');';
        }
    }

    S += '\r\n\
        $(() =\> {\r\n\
            debugger; \r\n\
        ';

    if (CBool(Usersettings.devXGridLayout)) { S += 'localStorage[\'' + CStr(Gridid) + '_state\'] = ' + jsEscapeString(CStr(Usersettings.devXGridLayout)) + ';'; }

    S += '\r\n\
            $(\'#' + CStr(Gridid) + '\').dxDataGrid({\r\n\
    ';

    if (Not(Ftable) && Not(isArray(Tblnameorarray))) {
        S += ' remoteOperations: true,  // Grouping on Server\r\n\
                    scrolling: {\r\n\
                      mode: \'virtual\',\r\n\
                      rowRenderingMode: \'virtual\',\r\n\
                    },';
    }

    S += '\r\n\
                // use a remote oData provider\r\n\
                // see https://js.devexpress.com/Documentation/18_1/ApiReference/ui_widgets/dxdatagrid/Configuration/remoteOperations/\r\n\
                \r\n\
                dataSource: window.' + CStr(Gridid) + '_customDataStore,\r\n\
                allowColumnReordering: true,\r\n\
                allowColumnResizing: true,\r\n\
                rowAlternationEnabled: true,\r\n\
                showBorders: true,\r\n\
                showRowLines: true,\r\n\
                columnChooser: {\r\n\
                  enabled: true,\r\n\
                  allowSearch: true,\r\n\
                },\r\n\
                selection: { mode: \'single\' },\r\n\
                filterRow: { visible: true },\r\n\
                groupPanel: { visible: true },\r\n\
                grouping: { autoExpandAll: false },\r\n\
                stateStoring: {\r\n\
                  enabled: true,\r\n\
                  type: \'localStorage\',\r\n\
                  storageKey: \'' + CStr(Gridid) + '_state\', \r\n\
                },\r\n\
                searchPanel: {\r\n\
                  visible: true,\r\n\
                  highlightCaseSensitive: true,\r\n\
                },\r\n\
                paging: { pageSize: 10 },\r\n\
                headerFilter: {\r\n\
                  visible: true,\r\n\
                  allowSearch: true,\r\n\
                },\r\n\
                wordWrapEnabled: true,\r\n\
                pager: {\r\n\
                  showPageSizeSelector: true,\r\n\
                  allowedPageSizes: [10, 25, 50, 100],\r\n\
                },\r\n\
    ';

    if (CBool(Usersettings.columnAutoWidth)) {
        S += '\r\n\
            columnAutoWidth: true,\r\n\
        ';
    }

    if (Not(Usersettings.hideExportBtns)) {
        S += '\r\n\
                export: {\r\n\
                    enabled: true,\r\n\
                    allowExportSelectedData: true,\r\n\
                },\r\n\
                onExporting: function(e) {\r\n\
                    debugger\r\n\
                    \r\n\
                    var workbook = new ExcelJS.Workbook(); \r\n\
                    var worksheet = workbook.addWorksheet(\'Main sheet\'); \r\n\
                    DevExpress.excelExporter.exportDataGrid({ \r\n\
                        worksheet: worksheet, \r\n\
                        component: e.component,\r\n\
                        customizeCell: function(options) {\r\n\
                            var excelCell = options;\r\n\
                            excelCell.font = { name: \'Arial\', size: 12 };\r\n\
                            excelCell.alignment = { horizontal: \'left\' };\r\n\
                        } \r\n\
                    }).then(function() {\r\n\
                        workbook.xlsx.writeBuffer().then(function(buffer) { \r\n\
                            saveAs(new Blob([buffer], { type: \'application/octet-stream\' }), \'DataGrid.xlsx\'); \r\n\
                        }); \r\n\
                    }); \r\n\
                    e.cancel = true; \r\n\
                },\r\n\
            ';
    }

    S += '\r\n\
\r\n\
                columns: ' + Scriptsetupgrid + ',\r\n\
        \r\n\
                onContentReady(e) {\r\n\
                  if (!collapsed) {\r\n\
                    collapsed = true;\r\n\
                    // debugger;\r\n\
                    // e.component.expandRow([\'EnviroCare\']);\r\n\
                  }\r\n\
                },\r\n\
            });\r\n\
        });\r\n\
\r\n\
        collapsed = false;\r\n\
    ';

    return _Html + JSB_HTML_SCRIPT(S);
}
// </DEVXGRID>

// <GETDEVXGRIDMETA>
async function JSB_HTML_GETDEVXGRIDMETA(ByRef_Serverurl, ByRef_Usersettings, ByRef_Tblnameorarray, setByRefValues) {
    // local variables
    var Columnname, Ci;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Serverurl, ByRef_Usersettings, ByRef_Tblnameorarray)
        return v
    }
    var Schemadefs = undefined;
    if (CBool(ByRef_Usersettings.columns)) {
        Schemadefs = ByRef_Usersettings.columns;
    } else {
        Schemadefs = await JSB_BF_DBTABLESCHEMA(CStr(ByRef_Usersettings.databaseName), ByRef_Tblnameorarray);
    }

    var Griddefs = [undefined,];
    var Firstcolumnname = '';
    var Primarykey = '';
    var Firstguid = true;

    if (isJSON(Schemadefs)) {
        Ci = LBound(Schemadefs) - 1;
        for (Columnname of iterateOver(Schemadefs)) {
            Ci++;
            var Dbdef = Schemadefs[Columnname];
            if (Dbdef.datatype == 'guid') {
                if (Firstguid) Firstguid = false; else Dbdef.display = 'hidden';
            }
            if (Null0(Ci) == 1) Firstcolumnname = Columnname;
            Griddefs[Griddefs.length] = await JSB_HTML_JSBDEF2DEVXGRIDDEF(Dbdef, function (_Dbdef) { Dbdef = _Dbdef });
            if (CBool(Dbdef.primarykey)) Primarykey = Columnname;
        }
    } else {
        Ci = LBound(Schemadefs) - 1;
        for (Dbdef of iterateOver(Schemadefs)) {
            Ci++;
            Columnname = Dbdef.name;
            if (Dbdef.datatype == 'guid') {
                if (Firstguid) Firstguid = false; else Dbdef.display = 'hidden';
            }
            if (Null0(Ci) == 1) Firstcolumnname = Columnname;
            Griddefs[Griddefs.length] = await JSB_HTML_JSBDEF2DEVXGRIDDEF(Dbdef, function (_Dbdef) { Dbdef = _Dbdef });
            if (CBool(Dbdef.primarykey)) Primarykey = Columnname;
        }
    }

    if (Not(Primarykey)) Primarykey = Firstcolumnname;
    return exit({ "gridDefs": Griddefs, "primaryKey": Primarykey });
}
// </GETDEVXGRIDMETA>

// <JSBDEF2DEVXGRIDDEF>
async function JSB_HTML_JSBDEF2DEVXGRIDDEF(ByRef_Tcolumn, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tcolumn)
        return v
    }
    var Column = {};
    // setup Column.dataField
    Column.dataField = ByRef_Tcolumn.name;

    Column.allowGrouping = true;
    if (CBool(ByRef_Tcolumn.align)) Column.alignment = ByRef_Tcolumn.align;

    // Convert datatype from: guid;autointeger;integer;double;boolean;string;date;time;datetime;currency;blob;png;jpg;collection;url;memo;password,jsonarray,jsonrow
    // to one of these: number, boolean, string, date, datetime

    // Setup dataType
    Column.dataType = 'string';
    Column.showEditorAlways = false;
    switch (ByRef_Tcolumn.datatype) {
        case 'currency':
            Column.dataType = 'number'; Column.format = 'currency'; Column.allowGrouping = false;
            if (Not(Column.alignment)) Column.alignment = 'right';
            break;

        case 'autointeger':
            Column.dataType = 'number'; Column.allowGrouping = false;
            if (Not(Column.alignment)) Column.alignment = 'right';
            break;

        case 'integer':
            Column.dataType = 'number';
            if (Not(Column.alignment)) Column.alignment = 'right';
            break;

        case 'double':
            Column.dataType = 'number'; Column.allowGrouping = false;
            if (Not(Column.alignment)) Column.alignment = 'right';
            break;

        case 'boolean':
            Column.dataType = 'boolean';
            break;

        case 'date':
            Column.dataType = 'date';
            break;

        case 'time':
            Column.dataType = 'string'; Column.allowGrouping = false;
            break;

        case 'datetime':
            Column.dataType = 'datetime'; Column.allowGrouping = false;
    }

    if (CBool(ByRef_Tcolumn.Caption)) {
        Column.caption = ByRef_Tcolumn.Caption;
    } else if (CBool(ByRef_Tcolumn.label)) {
        Column.caption = ByRef_Tcolumn.label;
    } else if (CBool(ByRef_Tcolumn.ColumnName)) {
        Column.caption = ByRef_Tcolumn.ColumnName;
    } else if (CBool(ByRef_Tcolumn.name)) {
        Column.caption = ByRef_Tcolumn.name;
    }

    // https://js.devexpress.com/Documentation/ApiReference/Common/Object_Structures/format/
    // cellTemplate: discountCellTemplate,
    // cssClass: 'bullet'

    if (CBool(ByRef_Tcolumn.width)) Column.width = ByRef_Tcolumn.width;

    if (ByRef_Tcolumn.display == 'hidden' || ByRef_Tcolumn.display == 'gridhidden') Column.visible = false;

    var D = '';
    if (CBool(ByRef_Tcolumn.defaultvalue)) D = ByRef_Tcolumn.defaultvalue; else D = ByRef_Tcolumn.defaultValue;
    if (Not(D)) D = '';
    if (Column.control == 'json_inline') {
        if (Left(D, 1) != '[' || Right(D, 1) != ']') {
            if (Left(D, 1) == '{' && Right(D, 1) == '}') D = '[' + D + ']'; else D = '[]';
        }
        var Js = parseJSON('{array:' + D + '}');
        D = Js.array;
    }
    if (Len(D)) Column.defaultValue = D;

    // Column.allowResizing = true ;* default

    // groupIndex: 0,
    // allowGrouping
    // width: 150

    return exit(Column);
}
// </JSBDEF2DEVXGRIDDEF>

// <DIV>
function Div(Id, Content, Additionalattributes) {
    var _Html = '';

    if (Additionalattributes === undefined) {
        if (Content === undefined) {
            if (isJSON(Id)) Additionalattributes = Id; else Content = Id;
            Id = '';
        } else {
            if (CBool(isArray(Content)) || isJSON(Content)) {
                Additionalattributes = Content;
                Content = Id;
                Id = '';
            } else if (isJSON(Id)) {
                Additionalattributes = Id;
                Id = '';
            }
        }
    }

    _Html = Chr(28) + '\<div';
    if (Id) _Html += ' id=\'' + Id + '\' name=\'' + Id + '\'';
    if (CBool(Additionalattributes)) _Html += joinAttributes(Additionalattributes);
    _Html += '\>' + Chr(29) + Content + Chr(28) + '\</div\>' + Chr(29);
    return _Html;

}
// </DIV>

// <DROPDOWNBOX>
function DropDownBox(Id, Values, Default, Addblank, Readonly, Additionalattributes, Multivalueddata, Desciptionfield, Valuefield) {
    var Opts = undefined;
    var Subdelimiter = '';
    var Crlf = '';
    var Founddefaultvalue = undefined;
    var Ldefault = '';
    var V = '';
    var S = '';
    var Display = '';

    var Vals = makeArray(Values); Subdelimiter = activeProcess.At_Ni;
    if (!InStr1(1, Values, Subdelimiter)) Subdelimiter = '';
    if (Multivalueddata === undefined) Multivalueddata = true;

    Crlf = crlf;
    Founddefaultvalue = false;

    Opts = [undefined,];
    Ldefault = LCase(Default);

    if (Addblank) {
        if (Len(Default) == 0) {
            Founddefaultvalue = true;
            Opts[Opts.length] = '\<option selected value=""\>\</option\>';
        } else {
            Opts[Opts.length] = '\<option\>\</option\>';
        }
    }

    if ((Subdelimiter && Multivalueddata) || Subdelimiter >= Chr(252)) {
        for (V of iterateOver(Vals)) {
            S = '';
            if (InStr1(1, V, Subdelimiter)) {
                Display = Field(V, Subdelimiter, 1);
                V = dropLeft(CStr(V), Subdelimiter);
                if (LCase(V) == Ldefault && Len(Default)) { S = ' selected'; Founddefaultvalue = true; }
                Opts[Opts.length] = '\<option' + S + ' value="' + V + '"\>' + htmlEscape(Display) + '\</option\>';
            } else {
                if (LCase(V) == Ldefault && Len(Default)) { S = ' selected'; Founddefaultvalue = true; }
                Opts[Opts.length] = '\<option' + S + '\>' + htmlEscape(V) + '\</option\>';
            }
        }
    } else if (CBool(Vals)) {
        for (V of iterateOver(Vals)) {
            S = '';
            if (LCase(V) == Ldefault && Len(Default)) { S = ' selected'; Founddefaultvalue = true; }
            Opts[Opts.length] = '\<option' + S + '\>' + htmlEscape(V) + '\</option\>';
        }
    }

    if (!Founddefaultvalue) {
        if (Not(Default)) {
            if (Len(Opts) == 1) {
                Opts[LBound(Opts)] = Change(Opts[LBound(Opts)], '\<option selected', '\<option ');
            } else {
                Opts.Insert(1, '\<option disabled selected value=\'\'\>Select Something\</option\>');
            }
        } else {
            Opts[Opts.length] = '\<option selected\>' + htmlEscape(Default) + '\</option\>';
        }
    }

    if (Id) Id = ' id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\'';

    if (Readonly) {
        return Chr(28) + '\<select' + Id + ' tabindex=\'-1\'  readonly ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'DropDownBox_ReadOnly form-control', ' ', Additionalattributes), ' ') + '\>' + Crlf + Join(Opts, Crlf) + Crlf + '\</select\>' + Crlf + Chr(29);
    } else {
        return Chr(28) + '\<select' + Id + ' ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'DropDownBox form-control', ' ', Additionalattributes), ' ') + '\>' + Crlf + Join(Opts, Crlf) + Crlf + '\</select\>' + Crlf + Chr(29);
    }
}
// </DROPDOWNBOX>

// <ADDAUTOTEXTBOXCASCADINGEVENT>
function addAutoTextBoxCascadingEvent(Id, Changeon_Parentid, Quotedurl, Minlength) {
    var A = '';
    var S = '';

    S = ('\r\n\
        function ' + CStr(Id) + '_' + CStr(Changeon_Parentid) + '_OnChange(pObj, newid, txtbox) {\r\n\
            var parentObj = pObj;\r\n\
            var autoTextBox = txtbox;\r\n\
            \r\n\
            if (!autoTextBox) autoTextBox = findMyCompanion(parentObj, \'' + CStr(Id) + '\')\r\n\
            if (!autoTextBox) return alert(\'Unable to find matching companion of ' + CStr(Id) + '\');\r\n\
         \r\n\
            // Check if already loaded \r\n\
            var lastFetch = CStr($(parentObj).data(\'lastFetch_' + CStr(Id) + '\'));\r\n\
            if (lastFetch == "..pending..") return\r\n\
            \r\n\
            if (lastFetch && lastFetch == CStr(newid)) {\r\n\
                var a = $(parentObj).data(\'lastFetchData_' + CStr(Id) + '\');\r\n\
                if (a) autoCompleteTextBox(autoTextBox, a, ' + CStr(CNum(Minlength)) + ')\r\n\
                return\r\n\
            }\r\n\
            \r\n\
            if (formVar(pObj) != newid) window._isDirty = true;\r\n\
            \r\n\
            var Url = ' + CStr(Quotedurl) + ';\r\n\
            var NewID = newid;\r\n\
            Url = urlCtlSubstitutions(Url, { id: newid, ' + CStr(Changeon_Parentid) + ': newid })\r\n\
            $(parentObj).data(\'lastFetch_' + CStr(Id) + '\', "..pending..");\r\n\
         ');
    // OnSuccess for AJax
    A = '\r\n\
            $(parentObj).data(\'lastFetchData_' + CStr(Id) + '\', []);\r\n\
            for(var key in json) { \r\n\
               var a = json[key];\r\n\
               if (isArray(a)) { \r\n\
                   $(parentObj).data(\'lastFetchData_' + CStr(Id) + '\', a);\r\n\
                   break;\r\n\
                }\r\n\
            }\r\n\
            autoCompleteTextBox(autoTextBox, a, ' + CStr(CNum(Minlength)) + ', null, true) // txtBox, choiceArray, minLength, CompanionID, restrictToList\r\n\
            $(parentObj).data(\'lastFetch_' + CStr(Id) + '\', NewID);\r\n\
            \r\n\
         ';
    S += CStr(ajax('Url', A)) + '\r\n\
      }\r\n\
    ';
    return JSB_HTML_SCRIPT(S);

}
// </ADDAUTOTEXTBOXCASCADINGEVENT>

// <ADDCOMBOBOXCASCADINGEVENT>
function addComboBoxCascadingEvent(Id, Changeon_Parentid, Quotedurl, Addblank, Descriptionfield, Valuefield, Additionalattributes) {
    var S = ('\r\n\
        function ' + CStr(Id) + '_' + CStr(Changeon_Parentid) + '_OnChange(pObj, newid, cbobox, firstLoad) {\r\n\
            var parentObj = pObj;\r\n\
            var ComboBox = cbobox;\r\n\
            \r\n\
            if (!ComboBox) ComboBox = findMyCompanion(parentObj, \'' + CStr(Id) + '\')\r\n\
            if (!ComboBox) return alert(\'unable to find matching companion for ' + CStr(Id) + '\');\r\n\
            \r\n\
            // Check if already loaded \r\n\
            var lastFetch = CStr($(parentObj).data(\'lastFetch_' + CStr(Id) + '\'));\r\n\
            if (lastFetch == "..pending..") return\r\n\
\r\n\
            if (lastFetch && lastFetch == CStr(newid)) {\r\n\
                var a = $(parentObj).data(\'lastFetchData_' + CStr(Id) + '\');\r\n\
                //                 Ctl,      a,    ValueField,       DesciptionField,        addBlank,       dft,  subDel\r\n\
                if (a) loadOptions(ComboBox, a, \'' + CStr(Valuefield) + '\', \'' + CStr(Descriptionfield) + '\', \'' + CStr(Addblank + 0) + '\',  null, \'\', !firstLoad);\r\n\
                return\r\n\
            }\r\n\
            \r\n\
            if (formVar(pObj) != newid && !firstLoad) window._isDirty = true;\r\n\
            \r\n\
            var Url = ' + CStr(Quotedurl) + ';\r\n\
            var NewID = newid;\r\n\
            Url = urlCtlSubstitutions(Url, { id: newid, ' + CStr(Changeon_Parentid) + ': newid })\r\n\
            $(parentObj).data(\'lastFetch_' + CStr(Id) + '\', "..pending..");\r\n\
        ');
    // OnSuccess for AJax
    var A = '\r\n\
            $(parentObj).data(\'lastFetchData_' + CStr(Id) + '\', []);\r\n\
            \r\n\
            for(var key in json) { \r\n\
                var a = json[key];\r\n\
                if (isArray(a)) { \r\n\
                    $(parentObj).data(\'lastFetchData_' + CStr(Id) + '\', a);\r\n\
                    break;\r\n\
                }\r\n\
            }\r\n\
            \r\n\
            //          Ctl,      a,    ValueField,       DesciptionField,        addBlank,       dft,  subDel\r\n\
            loadOptions(ComboBox, a, \'' + CStr(Valuefield) + '\', \'' + CStr(Descriptionfield) + '\', \'' + CStr(Addblank + 0) + '\',  null, \'\', !firstLoad);\r\n\
            $(parentObj).data(\'lastFetch_' + CStr(Id) + '\', NewID);\r\n\
        ';

    // QuotedUrl, jsSuccess, jsFailure, PostPayLoad, infoMsg, HeaderJSON, Ok2Cache)
    S += CStr(ajax('Url', A, undefined, undefined, undefined, undefined, true)) + '\r\n\
        }\r\n\
    ';
    return JSB_HTML_SCRIPT(S);

}
// </ADDCOMBOBOXCASCADINGEVENT>

// <ADDDROPDOWNCASCADINGEVENT>
function addDropDownCascadingEvent(Id, Changeon_Parentid, Quotedurl, Addblank, Desciptionfield, Valuefield) {
    var S = '';
    var A = '';

    if (!Valuefield) Valuefield = Desciptionfield;
    if (!Desciptionfield) Desciptionfield = Valuefield;

    S = '\r\n\
      function ' + CStr(Id) + '_' + CStr(Changeon_Parentid) + '_OnChange(pObj, newid, ddbox) {\r\n\
            var parentObj = pObj;\r\n\
            var dropDownBox = ddbox;\r\n\
            \r\n\
            if (!dropDownBox) dropDownBox = findMyCompanion(parentObj, \'' + CStr(Id) + '\')\r\n\
            if (!dropDownBox) return alert(\'unable to find matching companion for ' + CStr(Id) + '\');\r\n\
            \r\n\
            var lastFetch = $(parentObj).data(\'lastFetch_' + CStr(Id) + '\');\r\n\
            if (CStr(lastFetch) == CStr(newid)) {\r\n\
                var a = $(parentObj).data(\'lastFetchData_' + CStr(Id) + '\');\r\n\
                //                    Ctl,      a,    ValueField,       DesciptionField,       addBlank,      dft,  subDel\r\n\
                if (a) loadOptions(dropDownBox, a, \'' + Valuefield + '\', \'' + Desciptionfield + '\', \'' + CStr(Addblank + 0) + '\', null, \'\', true);\r\n\
                return\r\n\
            }\r\n\
            \r\n\
            if (formVar(pObj) != newid) window._isDirty = true;\r\n\
            $(parentObj).data(\'lastFetch_' + CStr(Id) + '\', newid);\r\n\
            \r\n\
            var Url = ' + CStr(Quotedurl) + ';\r\n\
            Url = urlCtlSubstitutions(Url, { id: newid, ' + CStr(Changeon_Parentid) + ': newid })\r\n\
        ';

    // OnSuccess for AJax
    A = '\r\n\
            for(var key in json) { \r\n\
               var a = json[key];\r\n\
                if (isArray(a)) { \r\n\
                    $(parentObj).data(\'lastFetchData_' + CStr(Id) + '\', a);\r\n\
                    //             Ctl,      a,    ValueField,       DesciptionField,       addBlank,      dft,  subDel\r\n\
                    loadOptions(dropDownBox, a, \'' + Valuefield + '\', \'' + Desciptionfield + '\', \'' + CStr(Addblank + 0) + '\', null, \'\', true);\r\n\
                    break;\r\n\
                }\r\n\
            }\r\n\
         ';
    // QuotedUrl, jsSuccess, jsFailure, PostPayLoad, infoMsg, HeaderJSON, Ok2Cache)
    S += CStr(ajax('Url', A, undefined, undefined, undefined, undefined, true)) + '\r\n\
      }';

    return JSB_HTML_SCRIPT(S + cascadingAttach2Parent(CStr(Id), CStr(Changeon_Parentid)));

}
// </ADDDROPDOWNCASCADINGEVENT>

// <ADDPICK>
function addPick(Ctlhtml, Putresultinid, Popuptitle, Popupwidth, Popupheight, Popupurl, Onclosesubmit) {
    var _Html = undefined;
    var Fi = undefined;
    var Closesubmit = '';
    var Uniqueid = '';
    var C2 = '';

    if (Not(Popupheight)) Popupheight = 'auto';
    if (Not(Popupwidth)) Popupwidth = 'auto';

    if (CNum(Popupheight) != Null0(Popupheight)) Popupheight = '"' + Popupheight + '"';
    if (CNum(Popupwidth) != Null0(Popupwidth)) Popupwidth = '"' + Popupwidth + '"';
    if (Onclosesubmit) Closesubmit = 'true'; else Closesubmit = 'false';

    if (Putresultinid) {
        Uniqueid = CStr(Putresultinid) + '_pick';
        Putresultinid = '\'' + CStr(Putresultinid) + '\'';
    } else {
        Putresultinid = '$(btn).parent().next().find(\'input\')';
        Uniqueid = 'pickBtn_' + JSB_BF_NEWGUID();
    }

    _Html = [undefined,];

    C2 = Button(Uniqueid, '...', [undefined, 'onclick=\'popup4_' + Uniqueid + '(this)\'', 'style=\' min-height: 1.8em; padding: 0; min-width:24px !important\'']);

    Fi = InStr1(1, Ctlhtml, '\<div class=\'fieldSetBtnsDiv\'');
    if (Fi) {
        Fi = InStr1(Fi, Ctlhtml, '\</div\>');
        C2 = Left(Ctlhtml, Fi - 1) + Chr(29) + C2 + Chr(28) + Mid1(Ctlhtml, Fi);
    } else {
        C2 = Cols2('%', Ctlhtml, '26px', C2, '', '', 'overflow-x: hidden');
    }

    _Html[_Html.length] = C2;
    _Html[_Html.length] = Chr(28) + '\<script type="text/javascript"\>';
    _Html[_Html.length] = '   function popup4_' + Uniqueid + '(btn) {';
    _Html[_Html.length] = '       var url = ' + jsEscapeString(CStr(Popupurl));
    _Html[_Html.length] = '       var toTxtBox = findMyCompanion(btn, ' + Putresultinid + ')';
    _Html[_Html.length] = '       setTimeout(function() { ';
    _Html[_Html.length] = ('          if (InStr(url, \'?\') == -1) url += "?"; else url += "&"');
    _Html[_Html.length] = '          url += "fromUrl=" + urlEncode(window.location)';
    _Html[_Html.length] = ('          url += "&fromValue=" + urlEncode(formVar(toTxtBox));');
    _Html[_Html.length] = '          new popoutWindow(' + jsEscapeString(CStr(Popuptitle)) + ', url, ' + Popupwidth + ', ' + Popupheight + ', ' + Closesubmit + ', toTxtBox)';
    _Html[_Html.length] = '       }, 100);';
    _Html[_Html.length] = '   }';
    _Html[_Html.length] = '\</script\>' + Chr(29);

    return Join(_Html, crlf);
}
// </ADDPICK>

// <ADDPOSTBACKPICK>
function addPostbackPick(Ctlhtml, Btnname, Btnvalue, Functionname) {
    var _Html = JSB_HTML_SUBMITBTN(Btnname, Btnvalue, '...', [undefined, 'style=\'width: 24px; height: 1.8em; padding: 0; min-width:24px !important\'']);

    var Fi = InStr1(1, Ctlhtml, '\<div class=\'fieldSetBtnsDiv\'');
    if (Fi) {
        Fi = InStr1(Fi, Ctlhtml, '\</div\>');
        _Html = Left(Ctlhtml, Fi - 1) + Chr(29) + _Html + Chr(28) + Mid1(Ctlhtml, Fi);
    } else {
        _Html = Cols2('%', Ctlhtml, '26px', _Html, '', '', 'overflow-x: hidden');
    }

    return _Html;
}
// </ADDPOSTBACKPICK>

// <ADDTOCALENDAR>
async function addToCalendar(Title, Startdate, Durationminutesorenddate, Address, Description) {
    var _Html = '';
    var Duration = '';
    var Stopdate = '';

    _Html = Head(JsLink(jsbRoot() + 'js/ouical.js'));
    _Html += Head(CssLink(jsbRoot() + 'css/ouical.css'));

    Duration = 'null';
    Stopdate = 'null';
    if (InStr1(1, Durationminutesorenddate, ' ')) Stopdate = 'new Date(\'' + CStr(Durationminutesorenddate) + '\')'; else Duration = Durationminutesorenddate;

    _Html += html('\<div class="new-cal"\>\</div\>');

    _Html += JSB_HTML_SCRIPT('\r\n\
     debugger\r\n\
      var myCalendar = createCalendar({\r\n\
        options: {\r\n\
          class: \'my-class\',\r\n\
          id: \'my-id\'                               // You need to pass an ID. If you don\'t, one will be generated for you.\r\n\
        },\r\n\
        data: {\r\n\
          title: \'' + htmlEscape(Title) + '\',     // Event title\r\n\
          start: new Date(\'' + CStr(Startdate) + '\'),   // Event start date\r\n\
          duration: ' + Duration + ',                            // Event duration (IN MINUTES)\r\n\
          end: ' + Stopdate + ',     // You can also choose to set an end time.\r\n\
                                                    // If an end time is set, this will take precedence over duration\r\n\
          address: \'' + htmlEscape(Address) + '\',\r\n\
          description: \'' + htmlEscape(Description) + '\'\r\n\
        }\r\n\
      });\r\n\
\r\n\
      $(\'.new-cal\').append(myCalendar);\r\n\
    ');

    return _Html;
}
// </ADDTOCALENDAR>

// <AUTOTEXTBOXAJAX>
function AutoTextBoxAJax(Id, Url, Default, Minlength, Additionalattributes, Restricttolist, Labelname, Valuename) {
    // 6 parameters

    var Onsuccess = '';
    var Onfailure = '';
    var _Html = '';

    if (CBool(isArray(Url))) return AutoTextBox(Id, Url, Default, Minlength, [undefined,], true, Restricttolist);

    if (Not(Minlength)) Minlength = 1;

    Onsuccess = '\r\n\
          for(var key in json) { \r\n\
              autoCompleteTextBox( "*#' + CStr(Id) + '", json[key], ' + CStr(Minlength) + ', null, ' + CStr(+Restricttolist + 0) + ', \'' + CStr(Labelname) + '\', \'' + CStr(Valuename) + '\');\r\n\
              break;\r\n\
           }';

    Onfailure = 'alert(\'failed AutoTextBox ajax call to ' + CStr(Url) + '; error: \' + textStatus)';

    _Html = CStr(_Html) + JSB_HTML_TEXTBOX(CStr(Id), Default, false, Additionalattributes, undefined);

    // QuotedUrl, jsSuccess, jsFailure, PostPayLoad, infoMsg, HeaderJSON, Ok2Cache)
    return _Html + JSB_HTML_SCRIPT(CStr(ajax(jsEscapeHREF(CStr(Url)), Onsuccess, Onfailure, undefined, undefined, undefined, true)));
}
// </AUTOTEXTBOXAJAX>

// <AUTOTEXTBOXINCLUDEURL>
function AutoTextBoxIncludeURL(Id, Srcurl, Arrayid, Default, Minlength, Additionalattributes, Multivalueddata, Restricttolist, Labelname, Valuename) {
    var _Html = '';
    var S = '';

    _Html = Head(JsLink(CStr(Srcurl)));
    _Html += JSB_HTML_TEXTBOX(CStr(Id), Default, false, Additionalattributes);
    if (!Minlength) Minlength = 1;

    if (Id) {
        S = 'autoCompleteTextBox("#' + CStr(Id) + '" , ' + CStr(Arrayid) + ', ' + CStr(Minlength) + ', null, ' + CStr(Restricttolist + 0) + ', \'' + CStr(Labelname) + '\', \'' + CStr(Valuename) + '\');';
        if (System(1) == 'gae' || System(1) == 'aspx') { S = '$( document ).ready( function () { ' + S + ' });'; }
        _Html += JSB_HTML_SCRIPT(S);
    }

    return _Html;
}
// </AUTOTEXTBOXINCLUDEURL>

// <BACKGROUNDCOLOR>
function backgroundcolor(Backcolor, Text) {
    return Font('', '', '', CStr(Backcolor), CStr(Text));
}
// </BACKGROUNDCOLOR>

// <BOLDFACE>
function boldface(Text) {
    return Chr(28) + '\<b\>' + Chr(29) + CStr(Text) + Chr(28) + '\</b\>' + Chr(29);

}
// </BOLDFACE>

// <BR>
function br() {
    return Chr(28) + '\<br /\>' + Chr(29);

}
// </BR>

// <CALENDAR>
async function Calendar(Year, Month, Events, Tableclass, Tablestyle) {
    // local variables
    var Event;

    var Additionalattributes = undefined;
    var Day = undefined;
    var _Html = '';
    var Cells = undefined;

    // Get 1st of the month
    var Dt = CStr(Year) + '-' + CStr(Month) + '-1';
    var Offset = CNum(r83Date(Dt)) % 7;

    // Plug in the days

    Cells = [undefined,];
    for (Day = 1; Day <= 32; Day++) {
        var Newdate = CStr(Year) + '-' + CStr(Month) + '-' + CStr(Day);
        if (Day > 28) {
            var Monthcheck = r83Date(Newdate);
            Monthcheck = r83Date(Monthcheck);
            Monthcheck = Field(Monthcheck, '-', 2);
            if (Monthcheck != Month) break;
        }
        Cells[Day + Offset] = Day;
    }

    // Plug in the Events

    for (Event of iterateOver(Events)) {
        var Eventday = Field(Event, vm, 1);

        if (Field(Eventday, '-', 2) == Month && Field(Eventday, '-', 1) == Year) {
            Day = Field(Eventday, '-', 3);
            var _Color = Field(Event, vm, 2);
            var Desc = Field(Event, vm, 3);

            if (InStr1(1, Desc, Chr(28))) {
                Cells[Day + Offset] = Replace(Cells[Day + Offset], -1, 0, 0, Desc);
            } else {
                Cells[Day + Offset] = Replace(Cells[Day + Offset], -1, 0, 0, JSB_HTML_SPAN('', Desc, undefined, { "Title": Desc, "Style": 'color: ' + _Color }));
            }
        }
    }

    var Header = await CalendarColumns('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');
    var Row2 = await CalendarColumns(CStr(Cells[1]), CStr(Cells[2]), CStr(Cells[3]), CStr(Cells[4]), CStr(Cells[5]), CStr(Cells[6]), CStr(Cells[7]));
    var Row3 = await CalendarColumns(CStr(Cells[8]), CStr(Cells[9]), CStr(Cells[10]), CStr(Cells[11]), CStr(Cells[12]), CStr(Cells[13]), CStr(Cells[14]));
    var Row4 = await CalendarColumns(CStr(Cells[15]), CStr(Cells[16]), CStr(Cells[17]), CStr(Cells[18]), CStr(Cells[19]), CStr(Cells[20]), CStr(Cells[21]));
    var Row5 = await CalendarColumns(CStr(Cells[22]), CStr(Cells[23]), CStr(Cells[24]), CStr(Cells[25]), CStr(Cells[26]), CStr(Cells[27]), CStr(Cells[28]));
    var Row6 = await CalendarColumns(CStr(Cells[29]), CStr(Cells[30]), CStr(Cells[31]), CStr(Cells[32]), CStr(Cells[33]), CStr(Cells[34]), CStr(Cells[35]));
    var Row7 = '';
    if (CBool(Cells[36])) {
        Row7 = await CalendarColumns(CStr(Cells[36]), CStr(Cells[37]), CStr(Cells[38]), CStr(Cells[39]), CStr(Cells[40]), CStr(Cells[41]), CStr(Cells[42]));
    }

    _Html = await CalendarRows(Header, Row2, Row3, Row4, Row5, Row6, Row7);

    Additionalattributes = [undefined,];
    if (Tableclass) Additionalattributes[Additionalattributes.length] = 'class=\'' + CStr(Tableclass) + '\'';
    if (Tablestyle) Additionalattributes[Additionalattributes.length] = 'style=\'' + CStr(Tablestyle) + '\'';
    Additionalattributes[Additionalattributes.length] = 'border=\'1\'';
    _Html = JSB_HTML_TABLE('', _Html, Additionalattributes);

    return _Html;
}
// </CALENDAR>

// <CALENDARCOLUMNS>
async function CalendarColumns(C1content, C2content, C3content, C4content, C5content, C6content, C7content) {
    var _Html = '';

    _Html = await calendarTD(CStr(C2content));
    _Html += await calendarTD(CStr(C2content));
    _Html += await calendarTD(CStr(C3content));
    _Html += await calendarTD(CStr(C4content));
    _Html += await calendarTD(CStr(C5content));
    _Html += await calendarTD(CStr(C6content));
    _Html += await calendarTD(CStr(C7content));

    return _Html;
}
// </CALENDARCOLUMNS>

// <CALENDARROWS>
async function CalendarRows(Headerrow, R2content, R3content, R4content, R5content, R6content, R7content) {
    var Additionalattributes = undefined;
    var _Html = '';

    Additionalattributes = [undefined,];

    _Html = JSB_HTML_TR(CStr(Headerrow), 'class=\'calendarRow calendarRowHeader\'');

    _Html += JSB_HTML_TR(CStr(R2content), 'class=\'calendarRow\'');
    _Html += JSB_HTML_TR(CStr(R3content), 'class=\'calendarRow\'');
    _Html += JSB_HTML_TR(CStr(R4content), 'class=\'calendarRow\'');
    _Html += JSB_HTML_TR(CStr(R5content), 'class=\'calendarRow\'');
    _Html += JSB_HTML_TR(CStr(R6content), 'class=\'calendarRow\'');
    _Html += JSB_HTML_TR(CStr(R7content), 'class=\'calendarRow\'');

    return _Html;
}
// </CALENDARROWS>

// <CALENDARTD>
async function calendarTD(Calcell, Isheader) {
    var Additionalattributes = undefined;
    var L = undefined;
    var Content = '';
    var Classname = '';
    var Theday = '';
    var Cell = '';

    Theday = Extract(Calcell, 1, 0, 0);
    Cell = bold(Theday);
    var _ForEndI_1 = DCount(Calcell, am);
    for (L = 2; L <= _ForEndI_1; L++) {
        Content = Extract(Calcell, L, 0, 0);
        if (Not(Content)) { Content = (html('&nbsp;')); }
        Cell += br() + Content;
    }
    if (Isheader) Classname = 'calendarHD'; else Classname = 'calendarTD';
    Additionalattributes = [undefined, 'valign=\'top\'', 'class=\'' + Classname + '\''];
    return JSB_HTML_TD(Cell, Additionalattributes);
}
// </CALENDARTD>

// <CASCADINGAJAXDROPDOWNBOX>
function cascadingAJaxDropDownBox(Id, Changeon_Parentid, Quotedurl, Addblank, Default, Additionalattributes, Desciptionfield, Valuefield) {
    var _Html = '';
    var S = '';
    var A = '';

    if (!Valuefield) Valuefield = Desciptionfield;
    if (!Desciptionfield) Desciptionfield = Valuefield;

    _Html = DropDownBox(CStr(Id), [undefined,], CStr(Default), Addblank, false, Additionalattributes, CStr(false));

    if (Not(Id)) return _Html;

    S = ('\r\n\
       ajaxLoadOptions(Ctl, Url, AutoPostBack, AddIfNotInList, AddBlank, DesciptionField, ValueField, isKnockOut)\r\n\
       \r\n\
      function ' + CStr(Id) + '_' + CStr(Changeon_Parentid) + '_OnChange(pObj, newid, ddbox) {\r\n\
            var parentObj = pObj;\r\n\
            var dropDownBox = ddbox;\r\n\
            \r\n\
            if (!dropDownBox) dropDownBox = findMyCompanion(parentObj, \'' + CStr(Id) + '\')\r\n\
            if (!dropDownBox) return alert(\'unable to find matching companion for ' + CStr(Id) + '\');\r\n\
            \r\n\
            // Check if already loaded \r\n\
            var lastFetch = CStr($(parentObj).data(\'lastFetch_' + CStr(Id) + '\'));\r\n\
            if (lastFetch == "..pending..") return\r\n\
            \r\n\
            if (lastFetch && lastFetch == CStr(newid)) {\r\n\
                var a = $(parentObj).data(\'lastFetchData_' + CStr(Id) + '\');\r\n\
                //                    Ctl,      a,    ValueField,       DesciptionField,       addBlank,      dft,  subDel\r\n\
                if (a) loadOptions(dropDownBox, a, \'' + Valuefield + '\', \'' + Desciptionfield + '\', \'' + CStr(Addblank + 0) + '\', null, \'\', true);\r\n\
                return\r\n\
            }\r\n\
            \r\n\
            if (formVar(pObj) != newid) window._isDirty = true;\r\n\
            \r\n\
            var Url = ' + CStr(Quotedurl) + ';\r\n\
            var NewID = newid;\r\n\
            Url = urlCtlSubstitutions(Url, { id: newid, ' + CStr(Changeon_Parentid) + ': newid })\r\n\
            $(parentObj).data(\'lastFetch_' + CStr(Id) + '\', "..pending..");\r\n\
        ');

    // OnSuccess for AJax
    A = '\r\n\
            $(parentObj).data(\'lastFetchData_' + CStr(Id) + '\', []);\r\n\
            for(var key in json) { \r\n\
               var a = json[key];\r\n\
                if (isArray(a)) { \r\n\
                    $(parentObj).data(\'lastFetchData_' + CStr(Id) + '\', a);\r\n\
                    break;\r\n\
                }\r\n\
            }\r\n\
            //             Ctl,      a,    ValueField,       DesciptionField,       addBlank,      dft,  subDel\r\n\
            loadOptions(dropDownBox, a, \'' + Valuefield + '\', \'' + Desciptionfield + '\', \'' + CStr(Addblank + 0) + '\', null, \'\', true);\r\n\
            $(parentObj).data(\'lastFetch_' + CStr(Id) + '\', NewID);\r\n\
         ';

    // QuotedUrl, jsSuccess, jsFailure, PostPayLoad, infoMsg, HeaderJSON, Ok2Cache)
    S += CStr(ajax('Url', A, undefined, undefined, undefined, undefined, true)) + '\r\n\
      }';

    _Html += JSB_HTML_SCRIPT(S + cascadingAttach2Parent(CStr(Id), CStr(Changeon_Parentid)));

    return _Html;
}
// </CASCADINGAJAXDROPDOWNBOX>

// <CASCADINGATTACH2PARENT>
function cascadingAttach2Parent(Childid, Parentid, Forknockout) {
    var S = '';
    var P = '';

    if (Forknockout) {
        P = 'element, data, index, extra';
        S = 'function ' + CStr(Childid) + '_' + CStr(Parentid) + '_check(' + P + ') {\r\n\
            var parentID = \'KO_' + CStr(Parentid) + '_\' + index();\r\n\
            var childID = \'' + CStr(Childid) + '_\' + index();\r\n\
        ';
    } else {
        S = 'function ' + CStr(Childid) + '_' + CStr(Parentid) + '_check() { \r\n\
              var parentID = \'' + CStr(Parentid) + '\';\r\n\
              var childID = \'' + CStr(Childid) + '\';\r\n\
        ';
    }

    S += '\r\n\
          // find the parent\r\n\
          var parentCtl = $("[id=" + parentID + "]")\r\n\
          var childCtl = $("[id=" + childID + "]")\r\n\
          \r\n\
          if (!$(parentCtl).length || !$(childCtl).length) return setTimeout(function () { ' + CStr(Childid) + '_' + CStr(Parentid) + '_check(' + P + ') }, 100);\r\n\
    \r\n\
          // Get future notificaion for all parents (*#)\r\n\
          if ($(parentCtl).hasClass(\'ms-ctn\')) {\r\n\
            ms = parentCtl.magicSuggest()\r\n\
\r\n\
            $(ms).on(\'selectionchange\', function() {\r\n\
                var msData = ms.getSelection();\r\n\
                if (msData.length) msData = msData[0].name; else msData = null;\r\n\
                ' + CStr(Childid) + '_' + CStr(Parentid) + '_OnChange(parentCtl, msData, childCtl, false)\r\n\
            })\r\n\
            \r\n\
          } else {\r\n\
              $(parentCtl).on(\'autocompletechange\', function (e,u) { ' + CStr(Childid) + '_' + CStr(Parentid) + '_OnChange(parentCtl, $(this).val(), childCtl, false) } ); \r\n\
              $(parentCtl).on(\'autocompleteselect\', function (e,u) { ' + CStr(Childid) + '_' + CStr(Parentid) + '_OnChange(parentCtl, u.item.value, childCtl, false) } );\r\n\
              $(parentCtl).on(\'change\',             function (e,u) { ' + CStr(Childid) + '_' + CStr(Parentid) + '_OnChange(parentCtl, $(this).val(), childCtl, false) });\r\n\
          }\r\n\
          \r\n\
          // Force one change now\r\n\
          ' + CStr(Childid) + '_' + CStr(Parentid) + '_OnChange(parentCtl, formVar(\'' + CStr(Parentid) + '\'), childCtl, true) \r\n\
    }';

    if ((!Forknockout)) {
        S += ' \r\n\
          $( document ).ready(function() {\r\n\
              // We need inline scripts to run before firing AJAX calls. (MagicSelect Controls needs to run first)\r\n\
              setTimeout(window.' + CStr(Childid) + '_' + CStr(Parentid) + '_check, 100);\r\n\
          });\r\n\
        ';
    }

    return S;
}
// </CASCADINGATTACH2PARENT>

// <CASCADINGAUTOTEXTBOX>
function CascadingAutoTextBox(Id, Changeon_Parentid, Quotedurl, Default, Minlength, Additionalattributes) {
    var _Html = '';

    if (Minlength === undefined) Minlength = 1;
    _Html = AutoTextBox(CStr(Id), [undefined,], CStr(Default), +Minlength, Additionalattributes);
    if (Not(Id)) return _Html;

    var Jsroutine = 'autoCompleteTextBox(childCtl, a, ' + CStr(CNum(Minlength)) + ', null / CompanionID */, true /* restrictToList */)';
    _Html += JSB_HTML_RELOADDATALISTFROMURL_ONPARENT_CHANGE(CStr(Id), CStr(Changeon_Parentid), CStr(Quotedurl), Jsroutine);

    return _Html + JSB_HTML_SCRIPT(cascadingAttach2Parent(CStr(Id), CStr(Changeon_Parentid)));
}
// </CASCADINGAUTOTEXTBOX>

// <CASCADINGCOMBOBOX>
function CascadingComboBox(Id, Changeon_Parentid, Quotedurl, Default, Addblank, Descriptionfield, Valuefield, Additionalattributes) {
    var _Html = '';

    _Html = ComboBox(CStr(Id), [undefined,], Default, Addblank, Descriptionfield, Valuefield, Additionalattributes);
    if (Not(Id)) return _Html;

    _Html += addComboBoxCascadingEvent(CStr(Id), CStr(Changeon_Parentid), CStr(Quotedurl), Addblank, CStr(Descriptionfield), CStr(Valuefield), Additionalattributes);
    return _Html + JSB_HTML_SCRIPT(cascadingAttach2Parent(CStr(Id), CStr(Changeon_Parentid)));
}
// </CASCADINGCOMBOBOX>

// <CASCADINGDROPDOWNBOX>
function cascadingDropDownBox(Id, Changeon_Parentid, Quotedurl, Addblank, Default, Additionalattributes, Desciptionfield, Valuefield) {
    var _Html = DropDownBox(CStr(Id), [undefined,], CStr(Default), Addblank, false, Additionalattributes, CStr(false));
    if (Not(Id)) return _Html;

    _Html += addDropDownCascadingEvent(CStr(Id), CStr(Changeon_Parentid), CStr(Quotedurl), Addblank, CStr(Desciptionfield), CStr(Valuefield));
    return _Html;
}
// </CASCADINGDROPDOWNBOX>

// <CENTER>
function Center(Content, Additionalattributes) {
    var _Html = '';

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'width: 100%; text-align:center', ';', Additionalattributes);
    _Html = Chr(28) + '\<div' + joinAttributes(Additionalattributes) + '\>' + Chr(29) + CStr(Content) + Chr(28) + '\</div\>' + Chr(29);
    return _Html;

}
// </CENTER>

// <CHART>
function Chart(Chartid, Restnameorarray, Charttype, Title, Vtitle, Htitle) {
    var _Html = '';
    var S = '';

    if (Not(Charttype)) Charttype = 'ColumnChart';
    if (Not(Chartid)) Chartid = 'chart_' + CStr(Rnd(99999));

    _Html = Head(JsLink('//www.google.com/jsapi'));

    _Html += Chr(28) + '\<div id=\'' + Chartid + '\' style="position: relative; overflow: hidden; background-color: transparent;" \>\</div\>' + crlf + Chr(29);

    S = '\r\n\
      google.load(\'visualization\', \'1.0\', {\'packages\':[\'corechart\'], \'callback\': \'drawChart_' + Chartid + '()\'});\r\n\
\r\n\
      function drawChart_' + Chartid + '() {';

    if (typeOf(Restnameorarray) == 'Array') {
        S += '\r\n\
         window.refreshData = function () {  }\r\n\
         var jsonData = [' + Join(chartDefaultModel(Restnameorarray), ',') + '];\r\n\
         var data = new google.visualization.arrayToDataTable(jsonData);\r\n\
      ';
    } else {
        S += '\r\n\
         window.refreshData = function () { }\r\n\
\r\n\
         var jsonData =$("#' + Chartid + '").ajax({\r\n\
             url:' + jsEscapeString(CStr(Restnameorarray)) + ',\r\n\
             datatype: "json",\r\n\
               async: false\r\n\
         }).responseText;\r\n\
      ';
    }
    S += '\r\n\
\r\n\
          var options = {\r\n\
            title: \'' + CStr(Title) + '\',\r\n\
            hAxis: {title: \'' + CStr(Htitle) + '\' },\r\n\
            vAxis: {title: \'' + CStr(Vtitle) + '\' }\r\n\
\r\n\
          };\r\n\
\r\n\
         // Instantiate and draw our chart, passing in some options.\r\n\
         var chart = new google.visualization.' + Charttype + '(document.getElementById(\'' + Chartid + '\'));\r\n\
         chart.draw(data, options);\r\n\
\r\n\
      }\r\n\
   ';

    return _Html + JSB_HTML_SCRIPT(S);
}
// </CHART>

// <CHARTDEFAULTMODEL>
function chartDefaultModel(Rows) {
    var Cols = undefined;
    var Drows = undefined;
    var A = undefined;
    var Row = undefined;
    var Tn = '';
    var Te = '';
    var V = '';

    Cols = [undefined,];

    if (Len(Rows)) {
        for (Tn of iterateOver(Rows[1])) {
            Cols[Cols.length] = Tn;
        }
    }

    Drows = [undefined,];
    Drows[Drows.length] = '[\'' + Join(Cols, '\',\'') + '\']';
    for (Row of iterateOver(Rows)) {
        A = [undefined,];
        for (Te of iterateOver(Cols)) {
            V = Row[Te];
            if (typeOf(V) == 'String') A[A.length] = '\'' + CStr(Row[Te]) + '\''; else A[A.length] = Row[Te];
        }
        Drows[Drows.length] = '[' + Join(A, ',') + ']';
    }

    return Drows;
}
// </CHARTDEFAULTMODEL>

// <CIRCLE>
function circle(X, Y, Radias, Backcolor) {
    // BackColor is like "#RRGGBB"
    // Radius in Pixels

    var _Html = '';

    _Html = CStr(_Html) + Chr(28) + '\r\n\
      \<script type="text/javascript"\>\r\n\
            canvas = document.getElementsByTagName(\'canvas\')[0]\r\n\
            if (!canvas) {\r\n\
               $(\'\<canvas style="left: 0px; top: 0px; margin: 0px; position: absolute; border: none;"\>\</canvas\>\').appendTo("#jsb")\r\n\
               canvas = document.getElementsByTagName(\'canvas\')[0]\r\n\
            }\r\n\
            ctx = canvas.getContext("2d");\r\n\
            ctx.fillStyle = "' + CStr(Backcolor) + '"\r\n\
            ctx.beginPath();\r\n\
            ctx.arc(' + CStr(X) + ', ' + CStr(Y) + ', ' + CStr(Radias) + ', 0, Math.PI*2, true); \r\n\
            ctx.closePath();\r\n\
            ctx.fill();\r\n\
      \</script\>' + Chr(29);

    return _Html;

}
// </CIRCLE>

// <CKEDITOR>
function CKEDITOR(Id, Defaultvalue, _Height, Oncontextmenu) {
    var _Html = '';
    var S = '';

    if (_Height === undefined) _Height = '600px';

    _Html = Head(JsLink('//cdnjs.cloudflare.com/ajax/libs/ckeditor/4.2/ckeditor.js'));
    _Html += Head(JsLink('//a.cksource.com/c/1/misc/jquery.tooltip.pack.js'));

    S = '';
    if (Oncontextmenu) {
        _Html += Chr(28) + '\<div id="' + CStr(Id) + '" name="' + CStr(Id) + '"\>' + CStr(Defaultvalue) + '\</div\>' + crlf + Chr(29);
        _Html += CStr(AttachToEvent('#' + CStr(Id), 'contextmenu', 'function (e) { return ' + CStr(Id) + '_cMenu(e) }'));
        S = (Replace(S, -1, 0, 0, '\r\n\
         function ' + CStr(Id) + '_cMenu(e) {                 \r\n\
            var cMenu = $("\<ul id=\'contextMenu\' /\>");                 \r\n\
            $(cMenu).append(\'\<li onClick="' + CStr(Id) + '_ckChange()"\>Edit\</li\>\');                 \r\n\
            return jsbContentMenu(e, cMenu)                 \r\n\
         }                 \r\n\
                          \r\n\
         function ' + CStr(Id) + '_ckChange() {                 \r\n\
            $("#' + CStr(Id) + '").replaceWith($(\'\<textarea id="' + CStr(Id) + '" name="' + CStr(Id) + '"\>\').attr({ value: $(\'#' + CStr(Id) + '\').html() }));                 \r\n\
            $(\'#jsb\').append("\<input id=\'Btn\' name=\'Btn\' type=\'submit\' value=\'Save\' /\>&nbsp;\<input id=\'Btn\' name=\'Btn\' type=\'submit\' value=\'Cancel\' /\>");                 \r\n\
            CKEDITOR.config.toolbar = [\r\n\
               { name: \'document\', items: [\'Source\', \'-\', \'NewPage\', \'Preview\', \'-\', \'Templates\' ] },\r\n\
               { name: \'clipboard\', items: [ \'Cut\', \'Copy\', \'Paste\', \'PasteText\', \'PasteFromWord\', \'-\', \'Undo\', \'Redo\' ] },\r\n\
               { name: \'basicstyles\', items: [ \'Bold\', \'Italic\' ] }\r\n\
            ];\r\n\
            '));
    } else {
        _Html += Chr(28) + '\<textarea id="' + CStr(Id) + '" name="' + CStr(Id) + '" \>' + CStr(Defaultvalue) + '\</textarea\>' + crlf + Chr(29);
        S = Replace(S, -1, 0, 0, '\r\n\
         CKEDITOR.config.toolbar = [ \r\n\
            [ \'Save\', \'Bold\', \'Italic\', \'Underline\', \'Font\', \'FontSize\', \'Styles\', \'BGColor\', \r\n\
              \'-\', \'SelectAll\', \'Cut\', \'Copy\', \'Paste\', \r\n\
              \'-\', \'Find\', \'Replace\', \r\n\
              \'-\', \'Undo\', \'Redo\', \r\n\
              \'-\', \'JustifyLeft\', \'JustifyCenter\', \r\n\
              \'-\', \'SpellChecker\', \'Smiley\',\r\n\
              \'-\', \'NumberedList\',\'BulletedList\', \r\n\
              \'-\', \'Outdent\',\'Indent\',\r\n\
              \'-\', \'Link\', \'Unlink\', \'Maximize\'\r\n\
            ] \r\n\
         ];\r\n\
         ');
    }

    S = Replace(S, -1, 0, 0, '\r\n\
      CKEDITOR.config.enterMode = CKEDITOR.ENTER_BR;\r\n\
      CKEDITOR.config.height = \'' + _Height + '\';\r\n\
      CKEDITOR.replace( \'' + CStr(Id) + '\' );\r\n\
      CKEDITOR.plugins.registered[\'save\']=\r\n\
         {\r\n\
               init : function( editor )\r\n\
               {\r\n\
                  var command = editor.addCommand( \'save\', \r\n\
                     {\r\n\
                        modes : { wysiwyg:1, source:1 },\r\n\
                        exec : function( editor ) {\r\n\
                           var fo=editor.element.$.form;\r\n\
                           editor.updateElement();\r\n\
                           if ($(\'#btn\').length == 0) { $(\'#jsb\').append("\<input id=\'btn\' name=\'btn\' type=\'hidden\' /\>") }\r\n\
                           $(\'#btn\').val(\'Save\');\r\n\
                           doJsbSubmit();\r\n\
                        }\r\n\
                     }\r\n\
                  );\r\n\
                  editor.ui.addButton( \'Save\',{label : \'My Save\',command : \'save\'});\r\n\
               }\r\n\
         }\r\n\
\r\n\
    $("#jsb").submit(function( event ) {\r\n\
        $(\'textarea.ckeditor\').each(function () {\r\n\
            var $textarea = $(this);\r\n\
            $textarea.val(CKEDITOR.instances[$textarea.attr(\'name\')].getData());\r\n\
        });\r\n\
    });');

    if (Oncontextmenu) S = Replace(S, -1, 0, 0, '}');
    _Html += JSB_HTML_SCRIPT(S);
    return _Html;

}
// </CKEDITOR>

// <CLOSEWINDOW>
function CloseWindow() {
    return Chr(28) + ' new windowOpen(jsbRoot() + \'close_html\', \'_self\').close();' + Chr(29);
}
// </CLOSEWINDOW>

// <CODE>
function Code(Text) {
    return Chr(28) + '\<code\>' + Chr(29) + CStr(Text) + Chr(28) + '\</code\>' + Chr(29);

}
// </CODE>

// <CODEMIRROR>
function JSB_HTML_CODEMIRROR(Id, Defaultvalue) {
    var _Html = CssLink('//cdnjs.cloudflare.com/ajax/libs/codemirror/3.16.0/codemirror.min.css');
    _Html += JsLink('//cdnjs.cloudflare.com/ajax/libs/codemirror/3.16.0/codemirror.min.js');

    _Html += JsLink('//cdnjs.cloudflare.com/ajax/libs/codemirror/3.16.0/mode/javascript/javascript.min.js');
    _Html += JsLink('//cdnjs.cloudflare.com/ajax/libs/codemirror/3.16.0/mode/xml/xml.min.js');

    _Html += JsLink('//cdnjs.cloudflare.com/ajax/libs/codemirror/3.16.0/addon/dialog/dialog.min.js');
    _Html += CssLink('//cdnjs.cloudflare.com/ajax/libs/codemirror/3.16.0/addon/dialog/dialog.css');

    _Html += JsLink('//cdnjs.cloudflare.com/ajax/libs/codemirror/3.16.0/addon/search/search.min.js');
    _Html += JsLink('//cdnjs.cloudflare.com/ajax/libs/codemirror/3.16.0/addon/search/searchcursor.min.js');

    _Html += CssLink('//cdnjs.cloudflare.com/ajax/libs/codemirror/3.16.0/theme/elegant.min.css');

    _Html = Head(_Html);

    _Html += Chr(28) + '\r\n\
      \<textarea id="' + CStr(Id) + '" name="' + CStr(Id) + '"\>' + CStr(Defaultvalue) + '\</textarea\>\r\n\
      \<style\>\r\n\
         .CodeMirror {\r\n\
           border: 1px solid #eee;\r\n\
           height: 99%;\r\n\
           overflow: hidden;\r\n\
           left: 0;\r\n\
           right: 0;\r\n\
\r\n\
         }\r\n\
         .CodeMirror-scroll {\r\n\
           overflow-y: hidden;\r\n\
           overflow-x: auto;\r\n\
         }\r\n\
         .CodeMirror-stepline {\r\n\
           background-color: lime;\r\n\
         }\r\n\
         .CodeMirror-errline {\r\n\
           background-color: red;\r\n\
         }\r\n\
         .CodeMirror-wrnline {\r\n\
           background-color: yellow;\r\n\
         }\r\n\
      \</style\>\r\n\
      \<script type="text/javascript"\>\r\n\
         \r\n\
         window.' + CStr(Id) + ' = CodeMirror.fromTextArea(document.getElementById("' + CStr(Id) + '"), {\r\n\
           lineNumbers: true,\r\n\
           matchBrackets: true,\r\n\
           continueComments: "Enter",\r\n\
           theme: "elegant",\r\n\
           indentUnit: 3,\r\n\
           tabSize: 3,\r\n\
           indentWithTabs: false,\r\n\
\r\n\
           extraKeys: {\r\n\
              "Ctrl-Y": function (cm) {\r\n\
                 var lineno = cm.getCursor().line;\r\n\
                 var cline = cm.doc.getLine(lineno)\r\n\
                 var textarea = document.createElement(\'textarea\');\r\n\
                 textarea.value = "randy"\r\n\
                 var Range = textarea.createTextRange()\r\n\
                 Range.execCommand("Copy");\r\n\
                 cm.doc.removeLine(lineno)\r\n\
              },\r\n\
              "Tab": function(cm) {\r\n\
                var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");\r\n\
                cm.replaceSelection(spaces, "end", "+input");\r\n\
              }\r\n\
            }\r\n\
         });\r\n\
   ';

    if (System(1) == 'gae' || System(1) == 'aspx') {
        _Html += '$(\'form\').submit(function() { window.TA.save(); });';
    }
    _Html += '\r\n\
      \</script\>\r\n\
   ' + Chr(29);

    return _Html;

}
// </CODEMIRROR>

// <COLOR>
function color(_Color, Text) {
    return Font('', '', CStr(_Color), '', CStr(Text));
}
// </COLOR>

// <COLORPICKER>
function Colorpicker(Id, Defaultvalue, Readonly, Dokobinding, Additionalattributes) {
    var _Html = '';

    _Html = JsLink(jsbRoot() + 'js/spectrum.js');
    _Html += CssLink(jsbRoot() + 'css/spectrum.css');
    _Html = Head(_Html);

    if (Readonly) {
        _Html += Chr(28) + '\<input tabindex=\'-1\' class=\'COLORPICKER_ReadOnly basic\' readonly';
    } else {
        _Html += Chr(28) + '\<input class=\'COLORPICKER basic\'';
    }

    if (Dokobinding) {
        _Html += joinAttributes(JSB_BF_MERGEATTRIBUTE('data-bind', 'colorpicker: {}', ',', Additionalattributes)) + ' /\>' + Chr(29);
        _Html += JSB_HTML_SCRIPT('\r\n\
        ko.bindingHandlers.colorpicker = {\r\n\
            update: function(element, options) {\r\n\
               $(element).spectrum({\r\n\
                   showInput: true,\r\n\
                   clickoutFiresChange: true,\r\n\
                   hideAfterPaletteSelect: true,\r\n\
                   allowEmpty:true,\r\n\
                   showAlpha: true,\r\n\
                   showPalette: true,\r\n\
                   preferredFormat: "hex6",\r\n\
                   showSelectionPalette: true,\r\n\
                   palette: [ ],\r\n\
                   localStorageKey: "jsb.colorpicks"\r\n\
               })\r\n\
            }\r\n\
        }');
    } else {
        _Html += ' id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\'';
        if (CBool(Additionalattributes)) _Html += joinAttributes(Additionalattributes);
        if (Len(Defaultvalue)) _Html += ' type="text" value="' + htmlEscape(Defaultvalue);
        _Html += '" /\>' + Chr(29) + JSB_HTML_SCRIPT('\r\n\
         $("#' + CStr(Id) + '").spectrum({\r\n\
            showInput: true,\r\n\
            clickoutFiresChange: true,\r\n\
            hideAfterPaletteSelect: true,\r\n\
            allowEmpty:true,\r\n\
            showAlpha: true,\r\n\
            showPalette: true,\r\n\
            preferredFormat: "hex6",\r\n\
            showSelectionPalette: true,\r\n\
            palette: [ ],\r\n\
            localStorageKey: "jsb.colorpicks"\r\n\
         })\r\n\
      ');
    }

    return _Html;

}
// </COLORPICKER>

// <COLS3>
function COLS3(C1width, C1content, C2width, C2content, C3width, C3content) {
    // This is better done with Bootstrap grid columns

    var _Html = '';

    _Html = Div('', C1content, [undefined, 'style=\'position: relative; float:left; width:' + CStr(C1width) + '\'']);
    _Html += CStr(Div('', C2content, [undefined, 'style=\'position: relative; float:left; width:' + CStr(C2width) + '\'']));
    _Html += CStr(Div('', C3content, [undefined, 'style=\'position: relative; float:left; width:' + CStr(C3width) + '\'']));
    return Div('', _Html, [undefined, 'position:relative; width:100%']);

}
// </COLS3>

// <COMBOBOXAJAX>
function JSB_HTML_COMBOBOXAJAX(Id, Urlorarray, Default, Addblank, Descriptionfield, Valuefield, Additionalattributes, Multivalueddata, Maxselected) {
    // 9
    return ComboBox(CStr(Id), Urlorarray, Default, Addblank, Descriptionfield, Valuefield, Additionalattributes, CStr(Multivalueddata), +Maxselected);
}
// </COMBOBOXAJAX>

// <COMBOBOXINCLUDEURL>
function ComboBoxIncludeURL(Id, Srcurl, Arrayid, Default, Addblank, Descriptionfield, Valuefield, Additionalattributes, Multivalueddata, Maxselected) {
    // 10

    var _Html = [undefined,];
    var Scripts = [undefined,];
    if ((!Maxselected)) Maxselected = 1;

    _Html[_Html.length] = Head(JsLink(CStr(Srcurl)));

    if (System(1) != 'js') {
        _Html[_Html.length] = Head(JsLink(jsbRoot() + 'js/magicsuggest.js'));
        _Html[_Html.length] = Head(CssLink(jsbRoot() + 'css/magicsuggest.css'));
    }

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('class', 'magicSelect form-control', ' ', Additionalattributes);

    Default = Change(Default, '\'', '\\\'');
    Valuefield = Change(Valuefield, '\'', '\\\'');
    Descriptionfield = Change(Descriptionfield, '\'', '\\\'');

    if (Id) {
        _Html[_Html.length] = (Chr(28) + '\<input id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\'' + joinAttributes(Additionalattributes, ' ') + ' onchange="if ($(this).parsley && $(this).parsley().reset) $(this).parsley().reset()" /\> ' + Chr(29));
    } else {
        _Html[_Html.length] = (Chr(28) + '\<input' + joinAttributes(Additionalattributes, ' ') + ' onchange="if ($(this).parsley && $(this).parsley().reset) $(this).parsley().reset()" valuefield=\'' + Valuefield + '\' descriptionfield=\'' + Descriptionfield + '\' /\> ' + Chr(29));
    }

    // if no ID, then this will be setup by knockout onload
    if (Id) {
        _Html += JSB_HTML_SCRIPT('\r\n\
        $( document ).ready( \r\n\
            function () { \r\n\
                comboBoxLoad($(\'#' + CStr(Id) + '\'), ' + CStr(Arrayid) + ', \'' + Default + '\', ' + CStr(CNum(Addblank)) + ', \'' + Valuefield + '\', \'' + Descriptionfield + '\', ' + CStr(CNum(Multivalueddata)) + ', ' + CStr(CNum(Maxselected)) + ')\r\n\
            } \r\n\
        )\r\n\
    ');
    }

    return Join(_Html, crlf);

}
// </COMBOBOXINCLUDEURL>

// <CSS>
function Css(S) {
    var Crlf = '';

    Crlf = crlf;
    return Chr(28) + '\<style\>' + Crlf + Change(S, Chr(254), Crlf) + Crlf + '\</style\>' + Crlf + Chr(29);

}
// </CSS>

// <DEVXPIVOTSETUP>
async function JSB_HTML_DEVXPIVOTSETUP(Tabid, Databasename, Columnlist, Tblid_Or_Sql, Reportname, ByRef_Pivotlayout, setByRefValues) {
    // local variables
    var Issqlselect, Dftrowlimit, Theme, Urlbase, Cmd, Msg, Availflds;
    var Possible_Sums, Possible_Aggelements, Possible_Grpcols;
    var Schemadefs, Columnnames, Ignoretypes, Ignorenames, Summabletypes;
    var Agtypes, Dbcolumn, Cname, Dt, Issummable, Isaverageable;
    var Selectlist, Ftable, Dtcolumns, Dtcolcnt, Dtrows, Colcnts;
    var Ci, Sl, _Html;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                function exit(v) {
                    if (typeof setByRefValues == 'function') setByRefValues(ByRef_Pivotlayout)
                    return v
                }
                // %options aspxC-

                if (Not(ByRef_Pivotlayout)) { ByRef_Pivotlayout = {} }
                Issqlselect = LCase(Left(Tblid_Or_Sql, 7)) == 'select ';

                Dftrowlimit = 1000;

                Theme = await JSB_BF_JSBCONFIG('default_jsb_Themes', 'theme_none');
                if (CBool(Theme)) Theme = 'jsb_themes.' + CStr(Theme);

                if (Not(await JSB_ODB_ATTACHDBEXTENDED(Databasename, function (_Databasename) { Databasename = _Databasename }))) return exit(false);

                Urlbase = (jsbRootAccount() + 'devxPivotSetup' + '?databaseName=' + urlEncode(Databasename) + '&tableID=' + urlEncode(Tblid_Or_Sql));

                Cmd = '';
                Msg = '';

                if (CBool(ByRef_Pivotlayout.AvailFlds)) null; else { gotoLabel = "_Else_4"; continue atgoto }
                Availflds = ByRef_Pivotlayout.AvailFlds;
                Possible_Sums = ByRef_Pivotlayout.possible_Sums;
                Possible_Aggelements = ByRef_Pivotlayout.possible_aggElements;
                Possible_Grpcols = ByRef_Pivotlayout.possible_GrpCols;
                gotoLabel = "_EndIf_4"; continue atgoto;
            case "_Else_4":



            case "RELOADDEFS":

                Schemadefs = await JSB_MDL_GETCOLUMNDEFINITIONS(Tblid_Or_Sql, Columnnames, function (_Columnnames) { Columnnames = _Columnnames });

                Availflds = [undefined,];
                Possible_Sums = [undefined,];
                Possible_Aggelements = [undefined,];
                Possible_Grpcols = [undefined,];

                Ignoretypes = Split('guid;blob;png;jpg;password;json;jsonarray', ';');
                Ignorenames = Split('llid;lat;lon;lng;latitude;longitude', ';');
                Summabletypes = Split('integer;double;boolean;currency', ';');
                Agtypes = Split('integer;double;currency', ';');

                if (Columnlist == '*') Columnlist = '';
                if (CBool(Columnlist)) Columnlist = Split(LCase(Change(Columnlist, ' ', '')), ',');
                for (Dbcolumn of iterateOver(Schemadefs)) {
                    Cname = Dbcolumn.name;
                    if (Locate(LCase(Cname), Ignorenames, 0, 0, 0, "", position => { })) continue;
                    if (CBool(Columnlist)) {
                        if (Locate(LCase(Change(Cname, ' ', '')), Columnlist, 0, 0, 0, "", position => { })); else continue;
                    }

                    Dt = Dbcolumn.datatype;
                    if (Locate(Dt, Ignoretypes, 0, 0, 0, "", position => { })) continue;

                    if (Locate(Dt, Summabletypes, 0, 0, 0, "", position => { })) Issummable = true; else Issummable = false;
                    if (Locate(Dt, Agtypes, 0, 0, 0, "", position => { })) Isaverageable = true; else Isaverageable = false;

                    Availflds[Availflds.length] = Cname;
                    if (CBool(Issummable)) Possible_Sums[Possible_Sums.length] = Dbcolumn.name;
                    if (CBool(Isaverageable)) Possible_Aggelements[Possible_Aggelements.length] = Dbcolumn.name;
                }

                if (CBool(Issqlselect)) {
                    if (await asyncDNOSqlSelect(Tblid_Or_Sql, _selectList => Selectlist = _selectList)); else return exit(false);
                } else {
                    if (await JSB_ODB_OPEN('', CStr(Tblid_Or_Sql), Ftable, function (_Ftable) { Ftable = _Ftable })); else return exit(false);
                    if (await JSB_ODB_SELECTTO('TOP ' + CStr(Dftrowlimit) + ' ' + Join(Columnnames, ','), Ftable, '', Selectlist, function (_Selectlist) { Selectlist = _Selectlist })); else return exit(false);
                }

                Dt = Selectlist.RowHandle.Table;
                Dtcolumns = Dt.Columns;
                Dtcolcnt = Dtcolumns.Count;
                Dtrows = Dt.Rows;

                // Count how many times each column is used
                Colcnts = [undefined,];
                Ci = LBound(Columnnames) - 1;
                for (Cname of iterateOver(Columnnames)) {
                    Ci++;
                    if (await JSB_ODB_SELECTTO('Distint Count(*)', Ftable, '[' + CStr(Cname) + '] \<\> \'\'', Sl, function (_Sl) { Sl = _Sl })) {
                        Colcnts[Ci] = DCount(getList(Sl, true), am);
                    }
                }

                Possible_Grpcols = [undefined,];
                Ci = LBound(Columnnames) - 1;
                for (Cname of iterateOver(Columnnames)) {
                    Ci++;
                    if (Null0(Colcnts[Ci]) < 30) Possible_Grpcols[Possible_Grpcols.length] = Cname;
                }

                ByRef_Pivotlayout.AvailFlds = Availflds;
                ByRef_Pivotlayout.possible_Sums = Possible_Sums;
                ByRef_Pivotlayout.possible_aggElements = Possible_Aggelements;
                ByRef_Pivotlayout.possible_GrpCols = Possible_Grpcols;
            case "_EndIf_4":


                _Html = [undefined,];

                // Setup for javascript

                _Html[_Html.length] = Hidden('AvailFlds', Join(Availflds, ';'));
                _Html[_Html.length] = Hidden('possible_GrpCols', Join(Possible_Grpcols, ';'));
                _Html[_Html.length] = Hidden('possible_aggElements', Join(Possible_Aggelements, ';'));
                _Html[_Html.length] = Hidden('possible_Sums', Join(Possible_Sums, ';'));

                // Current selections
                _Html[_Html.length] = Hidden('GrpRows', CStr(ByRef_Pivotlayout.GrpRows));
                _Html[_Html.length] = Hidden('GrpCols', CStr(ByRef_Pivotlayout.GrpCols));
                _Html[_Html.length] = Hidden('Sums', CStr(ByRef_Pivotlayout.Sums));
                _Html[_Html.length] = Hidden('Counts', CStr(ByRef_Pivotlayout.Counts));
                _Html[_Html.length] = Hidden('Averages', CStr(ByRef_Pivotlayout.Averages));
                _Html[_Html.length] = Hidden('StdDevs', CStr(ByRef_Pivotlayout.StdDevs));
                _Html[_Html.length] = Hidden('Mins', CStr(ByRef_Pivotlayout.Mins));
                _Html[_Html.length] = Hidden('Maxs', CStr(ByRef_Pivotlayout.Mins));

                _Html[_Html.length] = html('\r\n\
    \<div style="position: relative"\>\r\n\
        \<div style="width: 100%; border-style: none; display: flex;"\>\r\n\
            \<div style="float: left; width: 15%; height: 30; border-style: none;"\>\</div\>\r\n\
            \<div style="float: left; width: 15%; height: 30; border-style: none;"\>\</div\>\r\n\
            \<div class="pvtHeader" style="float: left; width: 68%; height: 30; border-style: none; text-align: center;"\>\r\n\
                Grouping Columns\r\n\
            \</div\>\r\n\
        \</div\>\r\n\
        \<div style="width: 100%; border-style: none; display: flex; margin-bottom: 5px;"\>\r\n\
            \<div class="pvtHeader" style="float: left; width: 15%; height: 30; border-style: none; text-align: center;"\>\r\n\
                Avaliable Fields\r\n\
            \</div\>\r\n\
            \<div class="pvtHeader" style="float: left; width: 15%; height: 30; border-style: none; text-align: center;"\>\r\n\
                Grouping Rows\r\n\
            \</div\>\r\n\
            \<div style="float: left; width: 68%; height: 30; border-style: none;"\>\r\n\
                \<ul id="pvtList" class=" connectedlist FieldTD" /\>\r\n\
            \</div\>\r\n\
        \</div\>\r\n\
        \<div style="float: left; width: 15%; min-height: 510px; border-style: solid; border-color: #000000; border-width: thin; text-align: center; margin-right: 5px;"\>\r\n\
            \<ul id="fldList" runat="server" class="connectedlist FieldTD"  /\>\r\n\
        \</div\>\r\n\
        \<div style="float: left; width: 15%; min-height: 510px; border-style: none; text-align: center;"\>\r\n\
            \<ul id="rowList" class="connectedlist FieldTD" style="min-height: 510px;" /\>\r\n\
        \</div\>\r\n\
        \<div style="float: left; width: 60%; min-height: 510px; border-style: none; text-align: center;"\>\r\n\
            \<table style="width: 100%; min-height: 510px;"\>\r\n\
                \<tr\>\r\n\
                    \<td class="pvtHeader" style="vertical-align: top; width: 49%;"\>Counts\r\n\
                    \<br /\>\r\n\
                        \<ul id="cntList" class="connectedlist FieldTD" style="border-style: none; height: 140px" /\>\r\n\
                    \</td\>\r\n\
                    \<td class="pvtHeader" style="vertical-align: top; width: 49%;"\>Sums\r\n\
                    \<br /\>\r\n\
                        \<ul id="sumList" class="connectedlist FieldTD" style="border-style: none; height: 140px" /\>\r\n\
                    \</td\>\r\n\
                \</tr\>\r\n\
                \<tr\>\r\n\
                    \<td class="pvtHeader" style="vertical-align: top; width: 49%;"\>Averages\r\n\
                    \<br /\>\r\n\
                        \<ul id="avgList" class="connectedlist FieldTD" style="border-style: none; height: 140px" /\>\r\n\
                    \</td\>\r\n\
                    \<td class="pvtHeader" style="vertical-align: top; width: 49%;"\>Standard Deviation\r\n\
                    \<br /\>\r\n\
                        \<ul id="stdList" class="connectedlist FieldTD" style="border-style: none; height: 140px" /\>\r\n\
                    \</td\>\r\n\
                \</tr\>\r\n\
                \<tr\>\r\n\
                    \<td class="pvtHeader" style="vertical-align: top; width: 49%;"\>Minimums\r\n\
                    \<br /\>\r\n\
                        \<ul id="minList" class="connectedlist FieldTD" style="border-style: none; height: 140px" /\>\r\n\
                    \</td\>\r\n\
                    \<td class="pvtHeader" style="vertical-align: top; width: 49%;"\>Maximums\r\n\
                    \<br /\>\r\n\
                        \<ul id="maxList" class="connectedlist FieldTD" style="border-style: none; height: 140px" /\>\r\n\
                    \</td\>\r\n\
                \</tr\>\r\n\
            \</table\>\r\n\
        \</div\>\r\n\
    \</div\>\r\n\
     ');

                _Html[_Html.length] = (JSB_HTML_SCRIPT('\r\n\
    function saveRows(ulID, resultTextElement) {\r\n\
        var ulElement = document.getElementById(ulID);\r\n\
        var resultElement = document.getElementById(resultTextElement);\r\n\
        var cnt = 0;\r\n\
    \r\n\
        if (!ulElement || !resultElement) return 0;\r\n\
    \r\n\
        var ulNodes = ulElement.getElementsByTagName("li");\r\n\
        var liTags = "";\r\n\
        if (ulNodes.length != 0) {\r\n\
            for (var i = 0; i \< ulNodes.length; i++) {\r\n\
                liTags += ulNodes[i].innerText + ";";\r\n\
                cnt += 1;\r\n\
            }\r\n\
        }\r\n\
        resultElement.value = liTags;\r\n\
        return cnt;\r\n\
    }\r\n\
    \r\n\
    function saveRowsAndCols() {\r\n\
        var hasrows, hascols, hasaggs;\r\n\
    \r\n\
        saveRows("fldList", "GrpRows");\r\n\
        hasrows = saveRows("rowList", "GrpRows") != 0;\r\n\
        hascols = saveRows("pvtList", "GrpCols") != 0;\r\n\
        hasaggs = saveRows("sumList", "Sums");\r\n\
        hasaggs += saveRows("cntList", "Counts");\r\n\
        hasaggs += saveRows("avgList", "Averages");\r\n\
        hasaggs += saveRows("stdList", "StdDevs");\r\n\
        hasaggs += saveRows("minList", "Mins");\r\n\
        hasaggs += saveRows("maxList", "Maxs");\r\n\
        hasaggs = hasaggs != 0;\r\n\
    \r\n\
        //if (!hasrows) { alert(\'You must have some fields under the Grouping Rows. Please try again.\'); return false; }\r\n\
        //if (!hascols) { alert(\'You must have some fields under the Grouping Columns. Please try again.\'); return false; }\r\n\
        if (!hasaggs) { alert(\'You must have some fields entered in one of the Sum, Cnt, Avg, Min or Max areas. Please try again.\'); return false; }\r\n\
    \r\n\
        return true;\r\n\
    }\r\n\
    \r\n\
    function loadRows(ulID, resultTextElement) {\r\n\
        var ulElement = document.getElementById(ulID);\r\n\
        var resultElement = document.getElementById(resultTextElement);\r\n\
    \r\n\
        if (!ulElement || !resultElement) return;\r\n\
        var liTags = resultElement.value.split(";");\r\n\
        for (var i = 0; i \< liTags.length - 1; i++) {\r\n\
            var newLI = document.createElement("li");\r\n\
            newLI.innerText = liTags[i];\r\n\
            ulElement.appendChild(newLI);\r\n\
        }\r\n\
    }\r\n\
    \r\n\
    function loadRowsAndCols() {\r\n\
        loadRows("fldList", "AvailFlds");\r\n\
        loadRows("rowList", "GrpRows");\r\n\
        loadRows("pvtList", "GrpCols");\r\n\
        loadRows("sumList", "Sums");\r\n\
        loadRows("cntList", "Counts");\r\n\
        loadRows("avgList", "Averages");\r\n\
        loadRows("stdList", "StdDevs");\r\n\
        loadRows("minList", "Mins");\r\n\
        loadRows("maxList", "Maxs");\r\n\
    }\r\n\
    \r\n\
    function onReceive(ui, lielement) {\r\n\
        var item = ui.item[0].outerText;\r\n\
        var lst = lielement[0].id;\r\n\
    \r\n\
        // Are we dropping into the pivot area?\r\n\
        if (lst == \'pvtList\') {\r\n\
            // item must exist in possible_GrpCols\r\n\
            var ulElement = document.getElementById(\'possible_GrpCols\');\r\n\
            if (!ulElement) return;\r\n\
            if (ulElement.value.indexOf(item) == -1) {\r\n\
                var answer = confirm(\'Are you sure you wish to do this? (\' + item + \' is a large group; It might be better in the grouping fields)\')\r\n\
                if (!answer) $(ui.sender).sortable(\'cancel\');\r\n\
                return;\r\n\
            }\r\n\
        }\r\n\
    \r\n\
        // Are we dropping into a sum only area?\r\n\
        if (lst == \'sumList\') {\r\n\
            // item must exist in possible_GrpCols\r\n\
            var ulElement = document.getElementById(\'possible_Sums\');\r\n\
            if (!ulElement) return;\r\n\
            if (ulElement.value.indexOf(item) == -1) {\r\n\
                alert(item + \' is not numeric and therefore can not be summed.  Please try again.\');\r\n\
                $(ui.sender).sortable(\'cancel\');\r\n\
                return;\r\n\
            }\r\n\
        }\r\n\
    \r\n\
        // Are we dropping into a aggragate only area?\r\n\
        if (lst == \'avgList\' || lst == \'stdList\' || lst == \'minList\' || lst == \'maxList\') {\r\n\
            // item must exist in possible_GrpCols\r\n\
            var ulElement = document.getElementById(\'possible_aggElements\');\r\n\
            if (!ulElement) return;\r\n\
            if (ulElement.value.indexOf(item) == -1) {\r\n\
                alert(item + \' is not an integer or real number, therefore can not be aggregated.  Please try again.\');\r\n\
                $(ui.sender).sortable(\'cancel\');\r\n\
                return;\r\n\
            }\r\n\
        }\r\n\
    \r\n\
        // Valid drop - make a duplicate (if we came from fldlist)\r\n\
        if (ui.sender[0].id == \'fldList\' && lst != \'fldList\') {\r\n\
            var ulElement = document.getElementById(lst);\r\n\
            var fldlist = document.getElementById(\'fldList\');\r\n\
            if (!ulElement || !fldlist) return;\r\n\
    \r\n\
            // Make sure it doesn\'t already exists\r\n\
            var newLI = document.createElement("li");\r\n\
            newLI.innerText = item;\r\n\
            fldlist.appendChild(newLI);\r\n\
        }\r\n\
    }\r\n\
    \r\n\
    $(function () {\r\n\
        loadRowsAndCols();\r\n\
        $("#pvtList, #fldList, #rowList, #sumList, #cntList, #avgList, #stdList, #minList, #maxList").sortable({\r\n\
            connectWith: ".connectedlist",\r\n\
            receive: function (event, ui) {\r\n\
                onReceive(ui, $(this));\r\n\
            }\r\n\
        }).disableSelection();\r\n\
    });\r\n\
    \r\n\
    '));

                _Html[_Html.length] = JSB_HTML_STYLE('\r\n\
        #fldList, #rowList, #sumList, #cntList, #avgList, #stdList, #minList, #maxList\r\n\
        {\r\n\
            list-style-type:none;\r\n\
            padding:0px;\r\n\
            margin:0;\r\n\
            height:100%;\r\n\
            width:100%;\r\n\
            white-space:nowrap;\r\n\
        }\r\n\
        #pvtList\r\n\
        {\r\n\
            list-style-type:none;\r\n\
            height: 100%;\r\n\
            width:100%;\r\n\
            white-space:nowrap;\r\n\
            margin-top:2px;\r\n\
            margin-bottom:2px;\r\n\
            margin-left:2px;\r\n\
            margin-right:2px;\r\n\
        }\r\n\
        #pvtList li {\r\n\
            display: inline;\r\n\
            border-style: solid;\r\n\
            border-width:thin;\r\n\
            padding-right:3px;\r\n\
            padding-left:3px;\r\n\
        }\r\n\
        #fldList li, #rowList li, #sumList li, #cntList li, #avgList li, #stdList li, #minList li, #maxList li\r\n\
        {\r\n\
\r\n\
        }\r\n\
        .pvtHeader, .connectedlist {\r\n\
          border: 1px solid;\r\n\
        }\r\n\
        .connectedlist  {\r\n\
          background-color: rgba(0, 0, 0, .5)\r\n\
        }\r\n\
        .FieldTD li {\r\n\
          background-color: #999;\r\n\
          \r\n\
            border-style: solid;\r\n\
            border-width:thin;\r\n\
            padding:0px;\r\n\
            margin:2px;\r\n\
            margin-top:2px;\r\n\
            margin-bottom: 2px;\r\n\
        }\r\n\
\r\n\
\r\n\
    ');

                _Html[_Html.length] = (html('\r\n\
        \<table style="margin-top: 5px"\>\r\n\
            \<tbody\>\<tr style="height: 10px"\>\</tr\>\<tr\>\r\n\
               \<td\>\r\n\
                  \<strong\>\r\n\
                     Title\r\n\
                  \</strong\>\r\n\
               \</td\>\r\n\
               \<td\>\r\n\
                  ' + JSB_HTML_TEXTBOX('Title', ByRef_Pivotlayout.Title) + '\r\n\
               \</td\>\r\n\
            \</tr\>\r\n\
            \<tr\>\r\n\
               \<td\>\</td\>\r\n\
               \<td\>\</td\>\r\n\
            \</tr\>\r\n\
            \<tr\>\r\n\
               \<td align="center"\>\r\n\
                  \<strong\>\r\n\
                     Pivot Options:\r\n\
                  \</strong\>\r\n\
               \</td\>\r\n\
               \<td\>\r\n\
                    \<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;"\>\r\n\
                     \<tbody\>\<tr\>\r\n\
                      \<td\>' + CHECKBOX('ShowPivotTable', CStr(1), '', ByRef_Pivotlayout.ShowPivotTable) + '\</td\>\<td\>\<label for="I" style="margin-left:2px;"\>Show Pivot Table\</label\>\</td\>\r\n\
                     \</tr\>\r\n\
                    \</tbody\>\</table\>\r\n\
               \</td\>\r\n\
            \</tr\>\r\n\
            \<tr\>\r\n\
               \<td\>\</td\>\r\n\
               \<td\>\r\n\
                  \<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;"\>\r\n\
                     \<tbody\>\<tr\>\r\n\
                      \<td\>' + CHECKBOX('ShowRowGrandTotals', CStr(1), '', ByRef_Pivotlayout.ShowRowGrandTotals) + '\</td\>\<td\>\<label for="I" style="margin-left:2px;"\>Show Row Grand Totals\</label\>\</td\>\r\n\
                     \</tr\>\r\n\
                    \</tbody\>\</table\>\r\n\
               \</td\>\r\n\
            \</tr\>\r\n\
            \<tr\>\r\n\
               \<td\>\</td\>\r\n\
               \<td\>\r\n\
                  \<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;"\>\r\n\
                     \<tbody\>\<tr\>\r\n\
                      \<td\>' + CHECKBOX('ShowColumnGrandTotals', CStr(1), '', CNum(ByRef_Pivotlayout.ShowColumnGrandTotals) + 0) + '\</td\>\<td\>\<label for="I" style="margin-left:2px;"\>Show Column Grand Totals\</label\>\</td\>\r\n\
                     \</tr\>\r\n\
                    \</tbody\>\</table\>\r\n\
               \</td\>\r\n\
            \</tr\>\r\n\
            \<tr\>\</tr\>\r\n\
            \<tr\>\r\n\
               \<td align="center"\>\r\n\
                  \<strong\>\r\n\
                     &nbsp;&nbsp;&nbsp;&nbsp; Graphing Options:&nbsp;&nbsp;&nbsp;&nbsp;\r\n\
                  \</strong\>\r\n\
               \</td\>\r\n\
               \<td\>\r\n\
                  \<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;"\>\r\n\
                     \<tbody\>\<tr\>\r\n\
                      \<td\>' + CHECKBOX('ShowGraph', CStr(1), '', CNum(ByRef_Pivotlayout.ShowGraph) + 0) + '\</td\>\<td\>\<label for="I" style="margin-left:2px;"\>Show Graph\</label\>\</td\>\r\n\
                     \</tr\>\r\n\
                    \</tbody\>\</table\>\r\n\
               \</td\>\r\n\
            \</tr\>\r\n\
            \<tr\>\r\n\
               \<td\>\</td\>\r\n\
               \<td\>\r\n\
                  \<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;"\>\r\n\
                     \<tbody\>\<tr\>\r\n\
                      \<td\>' + CHECKBOX('PointLabels', CStr(1), '', CNum(ByRef_Pivotlayout.PointLabels) + 0) + '\</td\>\<td\>\<label for="I" style="margin-left:2px;"\>Show Point Labels\</label\>\</td\>\r\n\
                     \</tr\>\r\n\
                    \</tbody\>\</table\>\r\n\
               \</td\>\r\n\
            \</tr\>\r\n\
            \<tr\>\r\n\
               \<td\>\</td\>\r\n\
               \<td\>\r\n\
                  \<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;"\>\r\n\
                     \<tbody\>\<tr\>\r\n\
                      \<td\>' + CHECKBOX('ChartDataVertical', CStr(1), '', CNum(ByRef_Pivotlayout.ChartDataVertical) + 0) + '\</td\>\<td\>\<label for="I" style="margin-left:2px;"\>Generate Series from Columns\</label\>\</td\>\r\n\
                     \</tr\>\r\n\
                    \</tbody\>\</table\>\r\n\
               \</td\>\r\n\
            \</tr\>\r\n\
            \<tr\>\r\n\
               \<td align="right"\>\r\n\
                  \<label\>Chart Type:\</label\>\r\n\
               \</td\>\r\n\
               \<td\>\r\n\
                  ' + DropDownBox('ChartType', Split('Bar,StackedBar,FullStackedBar,SideBySideStackedBar,SideBySideFullStackedBar,Pie,Doughnut,Funnel,Point,Line,StepLine,Spline,ScatterLine,SwiftPlot,Area,SplineArea,StackedArea,StackedSplineArea,FullStackedArea,FullStackedSplineArea,RadarPoint,RadarLine,RadarArea,Bar3D,StackedBar3D,FullStackedBar3D,ManhattanBar,SideBySideStackedBar3D,SideBySideFullStackedBar3D,Pie3D,Doughnut3D,Funnel3D,Line3D,StepLine3D,Area3D,StackedArea3D,FullStackedArea3D,Spline3D,SplineArea3D,StackedSplineArea3D,FullStackedSplineArea3D', ','), CStr(ByRef_Pivotlayout.ChartType)) + '\r\n\
               \</td\>\r\n\
            \</tr\>\r\n\
            \<tr\>\r\n\
               \<td align="right"\>\r\n\
                  \<label\>X Axis Caption\</label\>\r\n\
               \</td\>\r\n\
               \<td\>\r\n\
                  ' + JSB_HTML_TEXTBOX('XAxisCaption', ByRef_Pivotlayout.XAxisCaption) + '\r\n\
               \</td\>\r\n\
            \</tr\>\r\n\
            \<tr\>\r\n\
               \<td align="right"\>\r\n\
                  \<label\>Y Axis Caption\</label\>\r\n\
               \</td\>\r\n\
               \<td\>\r\n\
                  ' + JSB_HTML_TEXTBOX('YAxisCaption', ByRef_Pivotlayout.YAxisCaption) + '\r\n\
               \</td\>\r\n\
            \</tr\>\r\n\
            \<tr\>\r\n\
               \<td align="right"\>\</td\>\r\n\
               \<td\>\</td\>\r\n\
            \</tr\>\r\n\
         \</tbody\>\</table\>'));

                return exit(Join(_Html, ''));

                await At_Server.asyncPause(me);

                return exit(Cmd == 'Next');


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </DEVXPIVOTSETUP>

// <DEVXUNLOADPIVOT_Sub>
async function JSB_HTML_DEVXUNLOADPIVOT_Sub(ByRef_Pivotlayout, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Pivotlayout)
        return v
    }
    // %options aspxC-

    if (Not(ByRef_Pivotlayout)) { ByRef_Pivotlayout = {} }

    ByRef_Pivotlayout.GrpRows = formVar('GrpRows');
    ByRef_Pivotlayout.GrpCols = formVar('GrpCols');
    ByRef_Pivotlayout.Sums = formVar('Sums');
    ByRef_Pivotlayout.Counts = formVar('Counts');
    ByRef_Pivotlayout.Averages = formVar('Averages');
    ByRef_Pivotlayout.StdDevs = formVar('StdDevs');
    ByRef_Pivotlayout.Mins = formVar('Mins');
    ByRef_Pivotlayout.Maxs = formVar('Maxs');

    ByRef_Pivotlayout.Title = formVar('Title');
    ByRef_Pivotlayout.XAxisCaption = formVar('XAxisCaption');
    ByRef_Pivotlayout.YAxisCaption = formVar('YAxisCaption');
    ByRef_Pivotlayout.ChartType = formVar('ChartType');
    ByRef_Pivotlayout.ShowPivotTable = CNum(formVar('ShowPivotTable'));
    ByRef_Pivotlayout.ShowRowGrandTotals = CNum(formVar('ShowRowGrandTotals'));
    ByRef_Pivotlayout.ShowColumnGrandTotals = CNum(formVar('ShowColumnGrandTotals'));
    ByRef_Pivotlayout.ShowGraph = CNum(formVar('ShowGraph'));
    ByRef_Pivotlayout.PointLabels = CNum(formVar('PointLabels'));
    ByRef_Pivotlayout.ChartDataVertical = CNum(formVar('ChartDataVertical'));
    return exit();
}
// </DEVXUNLOADPIVOT_Sub>

// <DROPDOWNBOXAJAX>
function DropDownBoxAJAX(Id, Url, Default, Addblank, Readonly, Additionalattributes, Multivalueddata, Desciptionfield, Valuefield) {
    var Onsuccess = '';
    var Onfailure = '';
    var _Html = '';

    if (Valuefield === undefined) Valuefield = Desciptionfield;
    Onsuccess = '\r\n\
      $(\'#dd_' + CStr(Id) + '\').empty();\r\n\
      \r\n\
      for(var key in json) { \r\n\
         var value = json[key];';

    if (isEmpty(Valuefield) || isEmpty(Desciptionfield)) {
        Onsuccess += '\r\n\
                         var option = $(\'\<option\>\').text(value).attr(\'value\', value);';
    } else {
        Onsuccess += '\r\n\
                         if (typeof value === \'string\') value = string2json(value)\r\n\
                         var option = $(\'\<option\>\').text(value[\'' + CStr(Desciptionfield) + '\']).attr(\'value\', value[\'' + CStr(Valuefield) + '\']);';
    }

    Onsuccess += '\r\n\
            $(\'#dd_' + CStr(Id) + '\').append(option);\r\n\
       };\r\n\
       \r\n\
       \r\n\
       if ($(\'#dd_' + CStr(Id) + '\').find(\'option\').length == 1) $(\'#dd_' + CStr(Id) + '\').find(\'option:first\').attr(\'selected\', \'selected\'); else $(\'#dd_' + CStr(Id) + '\').val(\'\')\r\n\
       $(\'#dd_' + CStr(Id) + '\').trigger( "change" )\r\n\
    ';

    Onfailure = 'alert(\'failed combobox ajax call to \' + ' + jsEscapeString(CStr(Url)) + ' + \'; error: \' + textStatus)';
    _Html = DropDownBox(CStr(Id), [undefined,], CStr(Default), +Addblank, +Readonly, Additionalattributes, CStr(Multivalueddata), CStr(Desciptionfield), CStr(Valuefield));

    // QuotedUrl, jsSuccess, jsFailure, PostPayLoad, infoMsg, HeaderJSON, Ok2Cache)
    return _Html + JSB_HTML_SCRIPT(CStr(ajax(jsEscapeHREF(CStr(Url)), Onsuccess, Onfailure, undefined, undefined, undefined, true)));
}
// </DROPDOWNBOXAJAX>

// <DROPDOWNBOXINCLUDEURL>
function DropDownBoxIncludeURL(Id, Url, Arrayid, Default, Addblank, Readonly, Additionalattributes, Multivalueddata, Desciptionfield, Valuefield) {
    var _Html = '';

    _Html = Head(JsLink(CStr(Url)));

    _Html += DropDownBox(CStr(Id), [undefined,], CStr(Default), +Addblank, +Readonly, Additionalattributes, CStr(Multivalueddata), CStr(Desciptionfield), CStr(Valuefield));

    if (CBool(Id)) { _Html += JSB_HTML_SCRIPT('$( document ).ready( function () { urlDropDownLoad($(\'#' + CStr(Id) + '\'), ' + CStr(CNum(Addblank)) + ', ' + CStr(Arrayid) + ', \'' + CStr(Id) + '\') } )'); }

    return _Html;
}
// </DROPDOWNBOXINCLUDEURL>

// <EMPHASIZED>
function emphasized(Text) {
    return Chr(28) + '\<em\>' + Chr(29) + CStr(Text) + Chr(28) + '\</em\>' + Chr(29);

}
// </EMPHASIZED>

// <FIELDSET>
function FieldSet(Id, Legend, _Innerhtml, Additionalattributes) {
    var _Html = '';

    _Html = Chr(28) + '\<fieldset';
    if (Id) _Html += ' id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\'';
    _Html += ' ' + Join(JSB_BF_MERGEATTRIBUTE('class', 'FieldSet', ' ', Additionalattributes), ' ');
    _Html += '\>' + crlf + Chr(29);
    if (Legend) _Html += Chr(28) + '\<legend\>' + Chr(29) + CStr(Legend) + Chr(28) + '\</legend\>' + crlf + Chr(29);
    _Html += CStr(_Innerhtml);
    _Html += Chr(28) + crlf + '\</fieldset\>' + crlf + Chr(29);
    return _Html;

}
// </FIELDSET>

// <LAYOUT_Pgm>
async function JSB_HTML_LAYOUT_Pgm() {  // PROGRAM
    Commons_JSB_HTML = {};
    Equates_JSB_HTML = {};

    [undefined, 'FUNCTION LAYOUT(byval CenterHtml As StRiNg, byval NorthHtml As StRiNg, byval NorthOptions As String, byval SouthHtml As StRiNg, byval SouthOptions As String, byval EastHtml As StRiNg, byval EastOptions As String, byval WestHtml As StRiNg, byval WestOptions As String) As String', '    $options async-', '    ', '*', '* Options: Fixed (!resizable, !slidable, !closable)', '*          resizable, slidable, closable    (defaults)', '*          minSize:int, maxSize:int, startsize:int, initClosed, initHidden, allowOverFlow', '*    ', '* example: ', '*   NorthHtml := @button(\'\', @Html(`\u003Cspan class=\"glyphicon glyphicon-menu-hamburger\"\u003E\u003C/span\u003E`), { onclick: \'if (myLayout.west.state.isVisible) return myLayout.hide(\"west\"); myLayout.open(\"west\"); myLayout.show(\"west\") \' } ) ', '*   print @JSB_HTML.LAYOUT(CenterHtml, NorthHtml, \"!resizable, slidable, allowoverflow, startsize:300\", SouthHtml, \"initClosed, startsize:30, minSize:15\", EastHtml, \"startsize: 60, minSize:15\", WestHtml, \"startsize: 60\"):', '*', '* NO options at all will force closed and hidden', '*', '    Dim HTML As String', '    Dim NORTHSIZE As String', '    Dim SOUTHSIZE As String', '    Dim EASTSIZE As String', '    Dim WESTSIZE As String', '    Dim NORTHMINSIZE As String', '    Dim SOUTHMINSIZE As String', '    Dim EASTMINSIZE As String', '    Dim WESTMINSIZE As String', '    Dim NORTHMAXSIZE As String', '    Dim SOUTHMAXSIZE As String', '    Dim EASTMAXSIZE As String', '    Dim WESTMAXSIZE As String', '    Dim NORTHOVERFLOW As String', '    Dim SOUTHOVERFLOW As String', '    Dim EASTOVERFLOW As String', '    Dim WESTOVERFLOW As String', '', '    Dim needLoad As Boolean = true', '    if system(1) = \"js\" then', '        if window.jQuery.layout then needload = false', '    end if', '    if needload then', '        Html = @Head(@JSLink(@jsbroot:\"js/jquery/jquery.layout.js\"))', '    end if', '    ', '', '  if !NorthOptions Then NorthOptions = \"initClosed, initHidden, Fixed\" Else NorthOptions = Replace(NorthOptions, \"px\", \"\")', '  if !SouthOptions Then SouthOptions = \"initClosed, initHidden, Fixed\" Else SouthOptions = Replace(SouthOptions, \"px\", \"\")', '  if !EastOptions Then EastOptions = \"initClosed, initHidden, Fixed\" Else EastOptions = Replace(EastOptions, \"px\", \"\")', '  if !WestOptions Then WestOptions = \"initClosed, initHidden, Fixed\" Else WestOptions = Replace(WestOptions, \"px\", \"\")', '', '  NorthOptions = LCase(NorthOptions)', '  SouthOptions = LCase(SouthOptions)', '  EastOptions = LCase(EastOptions)', '  WestOptions = LCase(WestOptions)', '', '  if Field(NorthOptions, \"startsize:\", 2) then NorthSize = \"size: \'\":Field(Field(NorthOptions, \"startsize:\", 2), \",\", 1):\"\',\"', '  if Field(SouthOptions, \"startsize:\", 2) then SouthSize = \"size: \'\":Field(Field(SouthOptions, \"startsize:\", 2), \",\", 1):\"\',\"', '  if Field(EastOptions, \"startsize:\", 2) then EastSize = \"size: \'\":Field(Field(EastOptions, \"startsize:\", 2), \",\", 1):\"\',\"', '  if Field(WestOptions, \"startsize:\", 2) then WestSize = \"size: \'\":Field(Field(WestOptions, \"startsize:\", 2), \",\", 1):\"\',\"', '', '  if Field(NorthOptions, \"minsize:\", 2) then NorthminSize = \"minSize: \'\":Field(Field(NorthOptions, \"minsize:\", 2), \",\", 1):\"\',\"', '  if Field(SouthOptions, \"minsize:\", 2) then SouthminSize = \"minSize: \'\":Field(Field(SouthOptions, \"minsize:\", 2), \",\", 1):\"\',\"', '  if Field(EastOptions, \"minsize:\", 2) then EastminSize = \"minSize: \'\":Field(Field(EastOptions, \"minsize:\", 2), \",\", 1):\"\',\"', '  if Field(WestOptions, \"minsize:\", 2) then WestminSize = \"minSize: \'\":Field(Field(WestOptions, \"minsize:\", 2), \",\", 1):\"\',\"', '', '  if Field(NorthOptions, \"maxsize:\", 2) then NorthmaxSize = \"maxSize: \'\":Field(Field(NorthOptions, \"maxsize:\", 2), \",\", 1):\"\',\"', '  if Field(SouthOptions, \"maxsize:\", 2) then SouthmaxSize = \"maxSize: \'\":Field(Field(SouthOptions, \"maxsize:\", 2), \",\", 1):\"\',\"', '  if Field(EastOptions, \"maxsize:\", 2) then EastmaxSize = \"maxSize: \'\":Field(Field(EastOptions, \"maxsize:\", 2), \",\", 1):\"\',\"', '  if Field(WestOptions, \"maxsize:\", 2) then WestmaxSize = \"maxSize: \'\":Field(Field(WestOptions, \"maxsize:\", 2), \",\", 1):\"\',\"', '', '  if InStr(NorthOptions, \"fixed\") then NorthOptions = NorthOptions:\", !resizable, !slidable, !closable\"', '  if InStr(SouthOptions, \"fixed\") then SouthOptions = SouthOptions:\", !resizable, !slidable, !closable\"', '  if InStr(EastOptions, \"fixed\") then EastOptions = EastOptions:\", !resizable, !slidable, !closable\"', '  if InStr(WestOptions, \"fixed\") then WestOptions = WestOptions:\", !resizable, !slidable, !closable\"', '', '  if InStr(NorthOptions,  \"allowoverflow\") then NorthOverflow = \"showOverflowOnHover: true,\"', '  if InStr(SouthOptions,  \"allowoverflow\") then SouthOverflow = \"showOverflowOnHover: true,\"', '  if InStr(EastOptions,   \"allowoverflow\") then EastOverflow  = \"showOverflowOnHover: true,\"', '  if InStr(WestOptions,   \"allowoverflow\") then WestOverflow  = \"showOverflowOnHover: true,\"', '', '  Html := `', '     \u003Cdiv id=\"mylayout\" style=\"position: absolute; top: 0; bottom: 0; left: 0; right: 0; border: 0; padding: 0; margin: 0;\"\u003E', '         \u003Cdiv class=\"ui-layout-center\"\u003E`:CenterHtml:`\u003C/div\u003E', '         \u003Cdiv class=\"ui-layout-north\"\u003E`:NorthHtml:`\u003C/div\u003E', '         \u003Cdiv class=\"ui-layout-south\"\u003E`:SouthHtml:`\u003C/div\u003E', '         \u003Cdiv class=\"ui-layout-east\"\u003E`:EastHtml:`\u003C/div\u003E', '         \u003Cdiv class=\"ui-layout-west\"\u003E`:WestHtml:`\u003C/div\u003E', '      \u003C/div\u003E', '      \u003Cscript type=\"text/javascript\"\u003E', '            window.myLayout = $(\'#mylayout\').layout({', '                applyDemoStyles: true,', '                defaults: {', '                    fxName: \"slide\",', '                     fxSpeed: \"fast\"', '                    , resizerClass: \"resizer\"   ', '                    , togglerClass: \"toggler\"   ', '                    , buttonClass: \"button\" ,', '                    paneClass: \"pane\"  ', '                },', '                north: {', '                    initHidden: `:(Index(NorthOptions, \"inithidden\", 1) \u003E 0):`,', '                    initClosed: `:(Index(NorthOptions, \"initclosed\", 1) \u003E 0):`,', '                    resizable: `:(Index(NorthOptions, \"!resizable\", 1) = 0):`,', '                    slidable: `:(Index(NorthOptions, \"!slidable\", 1) = 0):`,', '                    `:NorthSize:`', '                    `:NorthminSize:`', '                    `:NorthmaxSize:`', '                    `:NorthOverflow:`', '                    closable: `:(Index(NorthOptions, \"!closable\", 1) = 0):`', '                },', '                south: {', '                    initHidden: `:(Index(southOptions, \"inithidden\", 1) \u003E 0):`,', '                    initClosed: `:(Index(southOptions, \"initclosed\", 1) \u003E 0):`,', '                    resizable: `:(Index(southOptions, \"!resizable\", 1) = 0):`,', '                    slidable: `:(Index(southOptions, \"!slidable\", 1) = 0):`,', '                    `:southSize:`', '                    `:southminSize:`', '                    `:southmaxSize:`', '                    `:southOverflow:`', '                    closable: `:(Index(southOptions, \"!closable\", 1) = 0):`', '                },', '                east: {', '                    initHidden: `:(Index(eastOptions, \"inithidden\", 1) \u003E 0):`,', '                    initClosed: `:(Index(eastOptions, \"initclosed\", 1) \u003E 0):`,', '                    resizable: `:(Index(eastOptions, \"!resizable\", 1) = 0):`,', '                    slidable: `:(Index(eastOptions, \"!slidable\", 1) = 0):`,', '                    `:eastSize:`', '                    `:eastminSize:`', '                    `:eastmaxSize:`', '                    `:eastOverflow:`', '                    closable: `:(Index(eastOptions, \"!closable\", 1) = 0):`', '                },', '                west: {', '                    initHidden: `:(Index(westOptions, \"inithidden\", 1) \u003E 0):`,', '                    initClosed: `:(Index(westOptions, \"initclosed\", 1) \u003E 0):`,', '                    resizable: `:(Index(westOptions, \"!resizable\", 1) = 0):`,', '                    slidable: `:(Index(westOptions, \"!slidable\", 1) = 0):`,', '                    `:westSize:`', '                    `:westminSize:`', '                    `:westmaxSize:`', '                    `:westOverflow:`', '                    closable: `:(Index(westOptions, \"!closable\", 1) = 0):`', '                }', '            });', '     \u003C/script\u003E', '     `', '     ', '    if InStr(NorthOptions,  \"allowoverflow\") then ', '        Html := `', '            \u003Cstyle\u003E', '                .ui-layout-north { overflow: visible !important; border: none !important }', '                .resizer-north { display: none !important }', '            \u003C/style\u003E', '           `', '    end if', 'Return Chr(28):Html:Chr(29)'];
    return;
}
// </LAYOUT_Pgm>