
// <ACCOUNT>
function Account() {
    if (At_Session.Item('ATTACHEDDATABASE')) return At_Session.Item('ATTACHEDDATABASE');
    if (CBool(System(19))) return System(19);
    return jsbAccount();
}
// </ACCOUNT>

// <ACCOUNTEXISTS>
async function JSB_BF_ACCOUNTEXISTS(Actname) {
    if (await asyncFSAttach(Actname)) return true;
    if (Not(window.dotNetObj)) return false;
    if (await asyncOpen("", otNetObj.dnoSystem(26) + Actname, _fHandle => me._activeProcess.At_File = _fHandle)) return true;

    return false;
}
// </ACCOUNTEXISTS>

// <ACTIVESELECT>
function JSB_BF_ACTIVESELECT() {
    return System(11);
}
// </ACTIVESELECT>

// <ADDDAY>
function AddDay(Zdate, Numdays) {
    return CNum(r83Date(Zdate)) + Numdays;
}
// </ADDDAY>

// <ADDMONTH>
function AddMonth(Zdate, Nummonths) {
    var Zyear = undefined;
    var Zmonth = undefined;
    var Zday = undefined;
    var S = '';
    var D = '';

    S = r83Date(r83Date(Zdate));
    Zyear = CInt(Field(S, '-', 1));
    Zmonth = CInt(Field(S, '-', 2));
    Zday = CInt(Field(S, '-', 3));
    Zmonth += Nummonths;

    while (Zmonth > 12) {
        Zmonth -= 12;
        Zyear++;
    }

    while (Zmonth < 1) {
        Zmonth += 12;
        Zyear--;
    }
    if (Zmonth == 2 && Zday > 28) Zday = 28;
    D = r83Date(CStr(Zyear) + '-' + CStr(Zmonth) + '-' + CStr(Zday));
    if (Null0(D) == -1) D = r83Date(CStr(Zyear) + '-' + CStr(Zmonth) + '-' + CStr(Zday - 1));
    if (Null0(D) == -1) D = r83Date(CStr(Zyear) + '-' + CStr(Zmonth) + '-' + CStr(Zday - 2));
    if (Null0(D) == -1) D = r83Date(CStr(Zyear) + '-' + CStr(Zmonth) + '-' + CStr(Zday - 3));
    return D;
}
// </ADDMONTH>

// <ADDYEAR>
function AddYear(Zdate, Numyears) {
    var Zyear = undefined;
    var S = '';
    var Zmonth = '';
    var Zday = '';

    S = r83Date(r83Date(Zdate));
    Zyear = CNum(Field(S, '-', 1)) + Numyears;
    Zmonth = Field(S, '-', 2);
    Zday = Field(S, '-', 3);
    return r83Date(CStr(Zyear) + '-' + Zmonth + '-' + Zday);
}
// </ADDYEAR>

// <ADMINBUTTONCONTEXTMENU>
function adminButtonContextMenu(Niceobjectname, Buttonname) {
    var Cm = undefined;
    var Nicebuttonname = '';
    var Val = '';
    var Ctlid = '';

    Nicebuttonname = JSB_BF_NICENAME(CStr(Buttonname));
    Val = CStr(Niceobjectname) + ':' + Nicebuttonname;

    Cm = {
        "Button Properties": { "cmd": 'EdtBtn', "val": Val },
        "Add Button": { "cmd": 'AddBtn', "val": Val },
        "Delete Button": { "cmd": 'DelBtn', "val": Val },
        "Edit Btn Custom Code": { "cmd": 'EdtBCode', "val": Val },
        "Order Buttons": { "cmd": 'OrderButtons', "val": Val }
    };

    Ctlid = CStr(Niceobjectname) + '_' + Nicebuttonname;
    return ContextMenu('#' + Nicebuttonname, Cm, true, Ctlid + '_contextMenu');
}
// </ADMINBUTTONCONTEXTMENU>

// <ADMINCONTROLCONTEXTMENU>
function adminControlContextMenu(Niceobjectname, Columnname, Columntype, Required, Canedit, Newlineprefix, Fullline, Suppresslabel) {
    var Cm = undefined;
    var Nicecolumnname = '';
    var Val = '';
    var Cp = '';
    var S = '';

    Nicecolumnname = JSB_BF_NICENAME(CStr(Columnname));
    Val = CStr(Niceobjectname) + ':' + Nicecolumnname;

    Cm = {
        "Properties": { "cmd": 'EdtCtl', "Val": Val },
        "SPACER1": '',
        "Set Label": { "cmd": 'LblCtl', "Val": Val },
        "Set Tool Tip": { "cmd": 'TipCtl', "Val": Val },
        "SPACER2": '',
        "Make Required": { "caption": (Required ? 'Make NOT required' : 'Make required'), "cmd": 'ReqCtl', "Val": Val },
        "Make Editable": { "caption": (Canedit ? 'Make Read Only' : 'Make Editable'), "cmd": 'RO_Ctl', "Val": Val },
        "SPACER3": '',
        "Add CRLF Prefix": { "caption": (Newlineprefix ? 'Remove CRLF Prefix' : 'Add CRLF Prefix'), "cmd": 'CR_Ctl', "Val": Val },
        "Short Column": { "caption": (Fullline ? 'Short Column' : 'Full Width Column'), "cmd": 'FulCtl', "Val": Val },
        "Show Label": { "caption": (Suppresslabel ? 'Show Label' : 'Make Editable'), "cmd": 'SupLbl', "Val": Val },
        "Set URL": { "caption": (Columntype == 'button' ? 'Set URL' : ''), "cmd": 'setURL', "Val": Val },
        "Add another Btn": { "caption": (Columntype == 'button' ? 'Add another Menu-Btn' : 'Add another Column'), "cmd": 'addCol', "Val": Val },
        "SPACER4": '',
        "Hide Control": { "cmd": 'HidCtl', "Val": Val },
        "Remove View Column": { "cmd": 'RmVCol', "Val": Val },
        "Delete DB Column": { "cmd": 'DelCol', "Val": Val }
    };

    if (Columntype == 'label') Cp = 'ctllbl_';
    S = ContextMenu('#' + Cp + Nicecolumnname, Cm, true, Nicecolumnname + '_contextMenu');

    // Attach to the label also - ContextMenu adds a "cm_" prefix to the function name and a suffix of "_contextMenu"
    S += html('   $(document).on("contextmenu", "#LBL_' + Nicecolumnname + '", function (e) { return ' + Nicecolumnname + '_contextMenu(e, this) });' + crlf);

    return S;
}
// </ADMINCONTROLCONTEXTMENU>

// <ADMINGRIDCONTEXTMENU>
function adminGridContextMenu(Niceobjectname, Columnname, Columntype, Required, Canedit) {
    var Cm = undefined;
    var Nicecolumnname = '';
    var Val = '';
    var Ctlid = '';

    Nicecolumnname = JSB_BF_NICENAME(CStr(Columnname));
    Val = CStr(Niceobjectname) + ':' + Nicecolumnname;

    Cm = {
        "Properties": { "cmd": 'EdtCtl', "Val": Val },
        "SPACER": '',
        "Make required": { "caption": (Required ? 'Make NOT required' : 'Make required'), "cmd": 'ReqCtl', "Val": Val },
        "Make Editable": { "caption": (Canedit ? 'Make Read Only' : 'Make Editable'), "cmd": 'RO_Ctl', "Val": Val },
        "SPACER1": '',
        "Choose Columns": { "cmd": 'ChooseColumns', "Val": Val },
        "Order Columns": { "cmd": 'OrderColumns', "Val": Val },
        "Set Required Columns": { "cmd": 'RequiredColumns', "Val": Val },
        "Set Visible Columns": { "cmd": 'VisibleColumns', "Val": Val },
        "SPACER2": '',
        "Define Inputs": { "cmd": 'DefineInputs', "Val": Val },
        "Define Outputs": { "cmd": 'DefineOutputs', "Val": Val },
        "SPACER3": '',
        "Set Label": { "cmd": 'LblCtl', "Val": Val },
        "SPACER4": '',
        "Hide Column": { "cmd": 'HidCtl', "Val": Val },
        "Remove View Column": { "cmd": 'RmVCol', "Val": Val },
        "Delete DB Column": { "cmd": 'DelCol', "Val": Val },
        "SPACER5": '',
        "Edit Code": { "cmd": 'EdtCode', "Val": Val },
        "Re-Generate": { "cmd": 'ReGen', "Val": Val },
        "SPACER6": '',
        "Add Button": { "cmd": 'AddBtn', "Val": Val },
        "Order Buttons": { "cmd": 'OrderButtons', "Val": Val }
    };

    Ctlid = CStr(Niceobjectname) + '_' + Nicecolumnname;
    return ContextMenu('[id=\'' + Ctlid + '\']', Cm, true, Ctlid + '_contextMenu');
}
// </ADMINGRIDCONTEXTMENU>

// <ADMINVIEWCONTEXTMENU>
function adminViewContextMenu(Niceobjectname, Ignore) {
    var Cm = undefined;

    Cm = {
        "View Properties": { "caption": 'View Properties for: ' + CStr(Niceobjectname), "cmd": 'ViewProps', "val": Niceobjectname },
        "SPACER1": '',
        "Set Header Text": { "cmd": 'SetViewHeader', "val": Niceobjectname },
        "Choose Columns": { "cmd": 'ChooseColumns', "val": Niceobjectname },
        "Order Columns": { "cmd": 'OrderColumns', "val": Niceobjectname },
        "Set Required Columns": { "cmd": 'RequiredColumns', "val": Niceobjectname },
        "Set Visible Columns": { "cmd": 'VisibleColumns', "val": Niceobjectname },
        "SPACER2": '',
        "Define Inputs": { "cmd": 'DefineInputs', "val": Niceobjectname },
        "Define Outputs": { "cmd": 'DefineOutputs', "val": Niceobjectname },
        "SPACER3": '',
        "Edit Generated Code": { "cmd": 'EdtCode', "val": Niceobjectname },
        "Re-Generate": { "cmd": 'ReGen', "val": Niceobjectname },
        "SPACER4": '',
        "Add Button": { "cmd": 'AddBtn', "val": Niceobjectname },
        "Order Buttons": { "cmd": 'OrderButtons', "val": Niceobjectname },
        "SPACER5": '',
        "Page Properties": { "cmd": 'PageProps', "val": Niceobjectname }
    };
    return ContextMenu('#header_' + CStr(Niceobjectname), Cm, true, CStr(Niceobjectname) + '_contextMenu');

}
// </ADMINVIEWCONTEXTMENU>

// <AJAX>
function ajax(Quotedurl, Jssuccess, Jsfailure, Postpayload, Infomsg, Headerjson, Ok2cache) {
    var Js = '';

    if (Not(Jsfailure)) {
        Jsfailure = '\r\n\
            if ( window.doDebug ) debugger;\r\n\
            if (textStatus == \'parsererror\') {\r\n\
                new popoutWindow(\'AJAX call error, Expected JSON result\', ' + CStr(Quotedurl) + ', "80%", "auto");\r\n\
            } else if (errorThrown) {\r\n\
               alert(errorThrown); \r\n\
            } else {\r\n\
               alert(jqXHR)\r\n\
            }\r\n\
            ';
    }
    if (Not(Jssuccess)) Jssuccess = '';

    // pMethod, pUrl, pBody, pOnSuccess, pOnFailure
    if (Postpayload) {
        Js = 'ajaxCall("POST", ' + CStr(Quotedurl) + ', ' + CStr(Postpayload) + ', function(json) { ' + Jssuccess + ' }, function(jqXHR,  textStatus,  errorThrown) { ' + Jsfailure + ' }';
    } else {
        Js = 'ajaxCall("GET", ' + CStr(Quotedurl) + ', null, function(json) { ' + Jssuccess + ' }, function(jqXHR,  textStatus,  errorThrown) { ' + Jsfailure + ' }';
    }

    // pMsg
    if (Infomsg) Js += ', ' + jsEscapeString(CStr(Infomsg)); else Js += ', null';

    // pJsonHeaders
    if (isJSON(Headerjson)) Js += CStr(Headerjson, true); else Js += ', null';

    // pIsServerFlush
    Js += ', null';

    // pOkToCache
    Js += ', ' + (Ok2cache ? 'true' : 'false');

    Js += ')' + crlf;
    return Js;
}
// </AJAX>

// <ANALYSEJSON>
async function JSB_BF_ANALYSEJSON(Jsarray, ByRef_Primarykeyname, Forceallownulls, setByRefValues) {
    // local variables
    var Itemid, Previousdt;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Primarykeyname)
        return v
    }
    var Results = undefined;
    var Firstone = undefined;
    var Alldefined = undefined;
    var Ptime = undefined;
    var Pdate = undefined;
    var Counter = undefined;
    var Cc = undefined;
    var I = undefined;
    var Ordinal = undefined;
    var Biggest = undefined;
    var Columndefs = undefined;
    var Cdef = undefined;
    var Jsonitem = undefined;
    var Tn = '';
    var Tt = '';
    var Firstrec = '';
    var V = '';

    Columndefs = {};

    Firstone = Not(ByRef_Primarykeyname);
    Firstrec = undefined;

    Counter = LBound(Jsarray) - 1;
    for (Jsonitem of iterateOver(Jsarray)) {
        Counter++;
        Alldefined = false; // Need To Process All Records So We Can Get Max String Lengths
        if (Not(Firstrec)) Firstrec = Jsonitem;
        Itemid = Jsonitem.ItemID;

        Ordinal = LBound(Jsonitem) - 1;
        for (Tn of iterateOver(Jsonitem)) {
            Ordinal++;
            if (Tn != 'ItemID') {
                Cdef = Columndefs[Tn];
                if (Not(Cdef)) {
                    Columndefs[Tn] = {};
                    Cdef = Columndefs[Tn];
                    Cdef.name = Tn;
                    Cdef.required = true;
                    Cdef.notblank = true;
                    Cdef.ordinal = Ordinal;
                }

                V = Jsonitem[Tn];
                if (LCase(Tn) == LCase(ByRef_Primarykeyname) || (Firstone && Null0(V) == Null0(Itemid))) {
                    ByRef_Primarykeyname = Tn;
                    Cdef.primarykey = true;
                    Firstone = false;
                }

                // Possible data types: guid, autointeger, integer, double, boolean, string, date, time, datetime, currency, blob, png, jpg, collection, memo, password, jsonarray, jsonrow 
                if (isNothing(V)) {
                    delete Cdef['required']
                    delete Cdef['notblank'];
                } else {
                    if (CStr(CNum(V), true) == V) V = CNum(V);
                    if (Len(V) == 0) delete Cdef['notblank'];
                }

                switch (typeOf(V)) {
                    case 'Null':
                        break;

                    case 'String':
                        // Could be date, time, or datetime, or guid
                        if (Len(V) && Cdef.datatype != 'string') {

                            // Does V look like a time? 2018-05-02T18:01:53-06:00 
                            Tt = dropIfLeft(V, 'T');
                            if (InStr1(1, Tt, ' ')) Tt = Field(Tt, ' ', 2);
                            Cc = Count(Tt, ':');
                            if (Cc == 2 || Cc == 3) {
                                Ptime = (CNum(Field(Tt, ':', 1)) <= 24 && Len(Field(Tt, ':', 1)) > 0 && CNum(Field(Tt, ':', 2)) <= 59 && Len(Field(Tt, ':', 2)) > 0 && CNum(Field(Tt, ':', 3)) <= 59 && Len(Field(Tt, ':', 3)) > 0);
                            } else {
                                Ptime = false;
                            }

                            // Does V look like a date?
                            if (Count(V, '/') == 2) {
                                // day/month/year
                                // pDate = Val(Field(V, "/", 1)) >= 1 And Val(Field(V, "/", 2)) >= 1 And Val(Field(V, "/", 2)) <=12 And Val(Field(V, "/", 3)) >= 1

                                // month/day/year
                                Pdate = (CNum(Field(V, '/', 1)) >= 1 && CNum(Field(V, '/', 2)) >= 1 && CNum(Field(V, '/', 1)) <= 12 && CNum(Field(V, '/', 3)) >= 1);;
                            } else if (Count(V, '-') == 2) {
                                // month-day-year
                                Pdate = (CNum(Field(V, '-', 1)) >= 1 && CNum(Field(V, '-', 2)) >= 1 && CNum(Field(V, '-', 2)) <= 12 && CNum(Field(V, '-', 3)) >= 1);;
                            } else if (Count(V, '-') == 3 && Ptime) {
                                Pdate = (CNum(Field(V, '-', 1)) >= 1 && CNum(Field(V, '-', 2)) >= 1 && CNum(Field(V, '-', 2)) <= 12 && CNum(Field(V, '-', 3)) >= 1);
                            } else {
                                Pdate = false;
                            }

                            // guess datatype
                            Previousdt = Cdef.datatype;
                            if (Ptime && Len(V) <= 13) {
                                Cdef.datatype = 'time';;
                            } else if (Pdate && Len(V) <= 12) {
                                Cdef.datatype = 'date';;
                            } else if (Pdate && Ptime && Len(V) <= 28) {
                                Cdef.datatype = 'datetime';;
                            } else if (Left(V, 1) == '$' && isNumeric(Mid1(V, 2))) {
                                Cdef.datatype = 'currency';;
                            } else if (LCase(V) == 'true' || LCase(V) == 'false') {
                                Cdef.datatype = 'boolean';;
                            } else if (Mid1(V, 9, 1) == '-' && Mid1(V, 14, 1) == '-' && Mid1(V, 19, 1) == '-' && Mid1(V, 24, 1) == '-' && Len(V) == 36) {
                                Cdef.datatype = 'guid';;
                            } else if (Left(V, 1) == '[' && Right(V, 1) == ']') {
                                if (Left(V, 2) == '[{' && Right(V, 2) == '}]') {
                                    Cdef.datatype = 'jsonarray';
                                } else {
                                    Cdef.datatype = 'collection';
                                }
                            } else if (Left(V, 1) == '{' && Right(V, 1) == '}') {
                                Cdef.datatype = 'jsonrow';;
                            } else {
                                Cdef.datatype = 'string';
                            }

                            if (CBool(Previousdt) && Null0(Previousdt) != Null0(Cdef.datatype)) {
                                if (InStr1(1, activeProcess.At_Sentence, '!')) { Print(); debugger; }
                            }
                        }

                        break;

                    case 'Integer':
                        if (Not(Cdef.datatype) || Cdef.datatype == 'boolean') {
                            if (Null0(V) < '0' || Null0(V) > 1) Cdef.datatype = 'integer'; else Cdef.datatype = 'boolean';
                        }

                        break;

                    case 'Boolean':
                        if (Not(Cdef.datatype)) Cdef.datatype = 'boolean';

                        break;

                    case 'Double':
                        if (Len(fieldRight(V, '.')) == 2 && Cdef.datatype != 'double') {
                            Cdef.datatype = 'currency';;
                        } else if (InStr1(1, V, '.')) {
                            Cdef.datatype = 'double';;
                        } else {
                            if (Not(Cdef.datatype) || Cdef.datatype == 'boolean') {
                                if (Null0(V) < '0' || Null0(V) > 1) Cdef.datatype = 'integer'; else Cdef.datatype = 'boolean';
                            }
                        }

                        break;

                    case 'GUID':
                        Cdef.datatype = 'guid';

                        break;

                    case 'JSonObject':
                        Cdef.datatype = 'jsonrow';

                        break;

                    case 'Array':
                        if (Left(V, 2) == '[{' && Right(V, 2) == '}]') {
                            Cdef.datatype = 'jsonarray';
                        } else {
                            Cdef.datatype = 'collection';
                        }

                        break;

                    case '[object]':
                        Cdef.datatype = 'blob';

                }

                if (Not(Cdef.datatype)) Alldefined = false;
            }
        }
        if (Alldefined) break;
    }

    Results = [undefined,];
    for (Tn of iterateOver(Firstrec)) {
        Cdef = Columndefs[Tn];
        if (CBool(Cdef)) {
            if (Not(Cdef.datatype) || Cdef.datatype == 'string') {
                Cdef.datatype = 'string';
                Biggest = 0;
                for (Jsonitem of iterateOver(Jsarray)) {
                    if (Len(Jsonitem[Cdef.name]) > Biggest) Biggest = Len(Jsonitem[Cdef.name]);
                }
                if (Biggest > 256 || InStrI1(1, Cdef.name, 'Description') || InStrI1(1, Cdef.name, 'Comments')) {
                    Cdef.datatype = 'memo';
                } else {
                    if (Biggest > 100 && Biggest < 256 || Biggest == 0) Biggest = 256;
                    Cdef.maxlength = Biggest;
                }
            }
            if (Cdef.name != 'ItemID') Results[Results.length] = Cdef;
            delete Columndefs[Tn];
        }
    }
    for (Tn of iterateOver(Columndefs)) {
        Cdef = Columndefs[Tn];
        if (CBool(Cdef)) Results[Results.length] = Cdef;
    }
    var _ForEndI_44 = UBound(Results);
    for (I = 1; I <= _ForEndI_44; I++) {
        Cdef = Results[I];
        Cdef.ordinal = I - 1;
        if (Forceallownulls && Not(Cdef.primarykey)) {
            delete Cdef['required']
            delete Cdef['notblank'];
        }
    }
    return exit(Results);
}
// </ANALYSEJSON>

// <ANCHOREDIT>
function anchorEdit(Fname, Itemid, Description, Fpath, Maxlen, Gotolineno) {
    var Isdir = undefined;
    var Isbinary = undefined;
    var Ispicture = undefined;
    var Ext = '';
    var Path = '';
    var Q = '';
    var Ued = '';

    Ext = LCase(fieldRight(CStr(Itemid), '.'));
    if (Ext && Fpath && UCase(Fname) != 'SYSTEM' && InStr1(1, Itemid, '@') == 0) Isbinary = isBinaryFile('.' + Ext); else Isbinary = false;

    if (Locate(Ext, Split('gif,png,bmp,ico,tif,pdf,jpg', ','), 0, 0, 0, "", position => { })) Ispicture = true; else Ispicture = false;

    if (Isbinary && !Ispicture) {
        Path = CStr(Fpath) + CStr(Itemid); // cause a download of file;
    } else {
        Isdir = (Left(Itemid, 1) == '[' && Right(Itemid, 1) == ']');
        if (Isdir || Not(Itemid)) {
            if (Isdir) Itemid = Mid1(Itemid, 2, Len(Itemid) - 2);
            Path = JSB_BF_JSBROOTEXECUTETCLCMD('L ' + CStr(Fpath) + (Right(Fpath, 1) == '\\' ? '' : '\\') + Itemid);
        } else {
            if (InStr1(1, Itemid, '\'')) Q = '"'; else Q = '\'';
            if (Isbinary || Ispicture) Ued = 'view '; else Ued = 'ed ';
            Path = Ued + CStr(Fname) + ' ' + Q + Itemid + Q;
            if (Gotolineno) Path += ' (' + CStr(Gotolineno);
            Path = JSB_BF_JSBROOTEXECUTETCLCMD(Path);
        }
    }

    if (Not(Description) || Description == '!') {
        if (Not(Description)) Description = Itemid; else Description = CStr(Fname) + ' ' + Itemid;
        if (Maxlen) {
            if (Len(Description) > Maxlen) Description = '..' + Right(Description, Maxlen - 2);
        }
    }
    if (!InStr1(1, Description, Chr(28))) Description = Chr(29) + Description + Chr(28);
    return Chr(28) + '\<a href="#" onclick="windowOpen(' + jsEscapeHREF(Path) + ', \'_blank\'); return false"\>' + Description + '\</a\>' + Chr(29);
}
// </ANCHOREDIT>

// <APPLICATIONVAR>
function ApplicationVar(Keyname) {
    return At_Application.Item(Keyname);

}
// </APPLICATIONVAR>

// <ATTACHEDDB>
async function JSB_BF_ATTACHEDDB() {
    return At_Session.Item('ATTACHEDDATABASE');
}
// </ATTACHEDDB>

// <ATTACHTOEVENT>
function AttachToEvent(Jqselector, Eventname, Value_Or_Function) {
    var Crlf = '';
    var _Html = '';

    Crlf = crlf;
    _Html = Chr(28);
    if (Left(Value_Or_Function, 8) == 'function') {
        _Html += '\<script type="text/javascript"\>' + Crlf;
        _Html += '   $(document).on("' + CStr(Eventname) + '", "' + CStr(Jqselector) + '", ' + CStr(Value_Or_Function) + ');' + Crlf;
        _Html += '\</script\>' + Crlf + Chr(29);
        return _Html;;
    } else {
        _Html += '\<input id=\'eventResult\' name=\'eventResult\' type="hidden" value=\'\' /\>' + Crlf;
        _Html += '\<script type="text/javascript"\>' + Crlf;
        _Html += '   $(document).on("' + CStr(Eventname) + '", "' + CStr(Jqselector) + '", function () { ' + Crlf;
        _Html += '      $(\'#eventResult\').val(\'' + CStr(Value_Or_Function) + '\');' + Crlf;
        _Html += '         doJsbSubmit(); // document.forms[\'jsb\'].submit(); ' + Crlf;
        _Html += '   });' + Crlf;
        _Html += '\</script\>' + Crlf + Chr(29);
        return _Html;
    }
}
// </ATTACHTOEVENT>

// <AUDITLOG>
function JSB_BF_AUDITLOG(S) {
    if (System(1) != 'aspx') return undefined;
    if (S) return System(CStr(34) + ',' + CStr(S));
    return System(34);
}
// </AUDITLOG>

// <AUTHENTICATIONTYPE>
async function JSB_BF_AUTHENTICATIONTYPE() {
    var Config = undefined;
    if (Left(userno(), 4) == 'rpc:') return 'local';
    Config = await JSB_BF_JSBCONFIG('authenticationtype');
    if (Not(Config)) return 'local';
    return LCase(Config.value);
}
// </AUTHENTICATIONTYPE>

// <BALANCETAG>
function balanceTag(_Html, Tagname) {
    var Starttags = undefined;
    var Endtags = undefined;
    var J = undefined;
    var K = undefined;

    Starttags = Count(_Html, '\<' + CStr(Tagname));
    Endtags = Count(_Html, '\</' + CStr(Tagname));
    if (Starttags == Endtags) return _Html;

    // Otherwise - everthing gets removed if not balanced

    while (true) {
        J = Index1(_Html, '\<' + CStr(Tagname), 1);
        K = InStr1(J, _Html, '\>');
        if (Not(J && K)) break;
        _Html = Left(_Html, J - 1) + am + Mid1(_Html, K + 1);
    }

    while (true) {
        J = Index1(_Html, '\</' + CStr(Tagname), 1);
        K = InStr1(J, _Html, '\>');
        if (Not(J && K)) break;
        _Html = Left(_Html, J - 1) + Mid1(_Html, K + 1);
    }
    return _Html;
}
// </BALANCETAG>

// <BALANCETAGS>
async function JSB_BF_BALANCETAGS(_Html) {
    _Html = balanceTag(CStr(_Html), 'blockquote');
    _Html = balanceTag(_Html, 'span');
    _Html = balanceTag(_Html, 'font');
    _Html = balanceTag(_Html, 'div');
    _Html = balanceTag(_Html, 'script');
    _Html = balanceTag(_Html, 'ul');
    return _Html;
}
// </BALANCETAGS>

// <BATTERYISCHARGING>
async function JSB_BF_BATTERYISCHARGING() {
    // local variables
    var Status;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                if (!hasPlugIn('cordova-plugin-battery-status')) { activeProcess.At_Errors = 'No cordova-plugin-battery-status phonegap plugin'; return undefined; }

                Status = '';
                me._activeProcess.setBlock(setBlock_onBatteryStatus, me, "GOTFIRSTEVENT")
                window.onBatteryStatus = function (status) {
                    me.Status = status;
                    window.removeEventListener("batterystatus", window.onBatteryStatus)
                    me._activeProcess.unblock(setBlock_onBatteryStatus)
                };

                window.addEventListener('batterystatus', window.onBatteryStatus);
                return


            case "GOTFIRSTEVENT":

                return Status.isPlugged;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </BATTERYISCHARGING>

// <BATTERYLEVEL>
async function JSB_BF_BATTERYLEVEL() {
    // local variables
    var Status;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                if (!hasPlugIn('cordova-plugin-battery-status')) { activeProcess.At_Errors = 'No cordova-plugin-battery-status phonegap plugin'; return undefined; }

                Status = '';
                me._activeProcess.setBlock(setBlock_onBatteryLevel, me, "GOTBATLEVEL")
                window.onBatteryLevel = function (status) {
                    me.Status = status;
                    window.removeEventListener("batterystatus", window.onBatteryLevel)
                    me._activeProcess.unblock(setBlock_onBatteryLevel)
                };

                window.addEventListener('batterystatus', window.onBatteryLevel);
                return


            case "GOTBATLEVEL":

                return Status.level;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </BATTERYLEVEL>

// <BLUETOOTHCONNECT>
async function JSB_BF_BLUETOOTHCONNECT(ByRef_Deviceaddress, setByRefValues) {
    // local variables
    var _Err, Callbacknumber;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Deviceaddress)
        return v
    }
    await new Promise(resolve => bluetoothSerial.connect(ByRef_Deviceaddress, function () { Callbacknumber = 1; resolve(Callbacknumber) }, function (__Err) { _Err = __Err; Callbacknumber = 2; resolve(Callbacknumber) }));

    if (Null0(Callbacknumber) == 2) { activeProcess.At_Errors = _Err; return exit(false); }
    return exit(true);
}
// </BLUETOOTHCONNECT>

// <BLUETOOTHDISCONNECT>
async function JSB_BF_BLUETOOTHDISCONNECT() {
    // local variables
    var Callbacknumber;

    await new Promise(resolve => bluetoothSerial.disconnect(function () { Callbacknumber = 1; resolve(Callbacknumber) }, function (E) { alert(e); }));
    return true;
}
// </BLUETOOTHDISCONNECT>

// <BLUETOOTHSERIALREAD>
async function JSB_BF_BLUETOOTHSERIALREAD() {
    // local variables
    var Str, _Err, Callbacknumber;

    await new Promise(resolve => bluetoothSerial.read(function (_Str) { Str = _Str; Callbacknumber = 1; resolve(Callbacknumber) }, function (__Err) { _Err = __Err; Callbacknumber = 2; resolve(Callbacknumber) }));

    if (Null0(Callbacknumber) == 2) { activeProcess.At_Errors = _Err; return undefined; }
    return Str;
}
// </BLUETOOTHSERIALREAD>

// <BLUETOOTHSERIALWRITE>
async function JSB_BF_BLUETOOTHSERIALWRITE(ByRef_Str, setByRefValues) {
    // local variables
    var _Err, Callbacknumber;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Str)
        return v
    }
    await new Promise(resolve => bluetoothSerial.write(ByRef_Str, function () { Callbacknumber = 1; resolve(Callbacknumber) }, function (__Err) { _Err = __Err; Callbacknumber = 2; resolve(Callbacknumber) }));

    if (Null0(Callbacknumber) == 2) { activeProcess.At_Errors = _Err; return exit(false); }
    return exit(true);
}
// </BLUETOOTHSERIALWRITE>

// <BROWSERTYPE>
function BrowserType() {
    return window.navigator.appVersion;
}
// </BROWSERTYPE>

// <BUILDCREATECOLUMNSCRIPT>
async function JSB_BF_BUILDCREATECOLUMNSCRIPT(Columndef, Issqlite, Ismsaccess, Forceallownulls, Oneprimarykey) {
    var Cc = '';

    // name, label, defaultvalue, required, notblank, tooltip, align, sortable, datatype, primarykey, encrypt, ordinal, canedit, maxlength (for strings), unique

    if (Issqlite) Cc = '"' + CStr(Columndef.name) + '" '; else Cc = '[' + CStr(Columndef.name) + '] ';

    switch (Columndef.datatype) {
        case 'guid':
            if (Issqlite) Cc += 'char(36)'; else if (Ismsaccess) Cc += 'uniqueidentifier'; else Cc += 'uniqueidentifier';;
            break;

        case 'autointeger':
            if (Issqlite) Cc += 'INTEGER'; else if (Ismsaccess) Cc += 'AutoIncrement'; else Cc += 'INT ';;
            break;

        case 'integer':
            if (Issqlite) Cc += 'INTEGER'; else if (Ismsaccess) Cc += 'INT'; else Cc += 'BIGINT';;
            break;

        case 'double':
            if (Issqlite) Cc += 'REAL'; else if (Ismsaccess) Cc += 'float'; else Cc += 'FLOAT';;
            break;

        case 'boolean':
            if (Issqlite) Cc += 'INTEGER'; else if (Ismsaccess) Cc += 'bit'; else Cc += 'bit';;
            break;

        case 'string':
            if (Issqlite) {
                Cc += 'TEXT';
            } else {
                if (Null0(Columndef.maxlength) > 255 || Null0(Columndef.maxlength) < 1) {
                    if (Ismsaccess) Cc += 'Memo'; else Cc += 'nvarchar(max)';
                } else {
                    if (Ismsaccess) Cc += 'Text'; else Cc += 'nvarchar(' + CStr(Columndef.maxlength) + ')';
                }
            }
            break;

        case 'date':
            if (Issqlite) Cc += 'TEXT'; else if (Ismsaccess) Cc += 'DateTime'; else Cc += 'date';;
            break;

        case 'time':
            if (Issqlite) Cc += 'TEXT'; else if (Ismsaccess) Cc += 'DateTime'; else Cc += 'time';;
            break;

        case 'datetime':
            if (Issqlite) Cc += 'TEXT'; else if (Ismsaccess) Cc += 'DateTime'; else Cc += 'datetime';;
            break;

        case 'currency':
            if (Issqlite) Cc += 'INTEGER'; else if (Ismsaccess) Cc += 'Currency'; else Cc += 'money';;
            break;

        case 'blob':
            if (Issqlite) Cc += 'BLOB'; else if (Ismsaccess) Cc += 'OleObject'; else Cc += 'varbinary(MAX)';;
            break;

        case 'png': case 'jpg': case 'img':
            if (Issqlite) Cc += 'BLOB'; else if (Ismsaccess) Cc += 'OleObject'; else Cc += 'varbinary(MAX)';;
            break;

        case 'collection':
            if (Issqlite) Cc += 'TEXT'; else if (Ismsaccess) Cc += 'Memo'; else Cc += 'nvarchar(MAX)';;
            break;

        case 'url':
            if (Issqlite) Cc += 'TEXT'; else if (Ismsaccess) Cc += 'Text'; else Cc += 'nvarchar(1024)';;
            break;

        case 'memo':
            if (Issqlite) Cc += 'TEXT'; else if (Ismsaccess) Cc += 'Memo'; else Cc += 'nvarchar(MAX)';;
            break;

        case 'password':
            if (Issqlite) Cc += 'TEXT'; else if (Ismsaccess) Cc += 'Text'; else Cc += 'nvarchar(255)';;
            break;

        case 'jsonarray':
            if (Issqlite) Cc += 'TEXT'; else if (Ismsaccess) Cc += 'Memo'; else Cc += 'nvarchar(MAX)';;
            break;

        case 'jsonrow':
            if (Issqlite) Cc += 'TEXT'; else if (Ismsaccess) Cc += 'Memo'; else Cc += 'nvarchar(MAX)';;
    }

    if (CBool(Columndef.primarykey) && Oneprimarykey) Cc += ' PRIMARY KEY';
    if (Columndef.datatype == 'autointeger') { if (Issqlite) Cc += ' AUTOINCREMENT'; else if (Ismsaccess) Cc += ''; else Cc += ' IDENTITY(1,1)'; }

    if (CBool(Columndef.notblank) || CBool(Columndef.required)) if (!Forceallownulls) Cc += ' NOT NULL';

    if (Oneprimarykey && CBool(Columndef.primarykey)) {
        // Already Unique;
    } else if (CBool(Columndef.unique)) {
        if (Issqlite) {
            Cc += ', Constraint "unique_' + CStr(Columndef.name) + '" Unique ("' + CStr(Columndef.name) + '")';
        } else {
            Cc += ' Unique';
        }
    }

    return Cc;
}
// </BUILDCREATECOLUMNSCRIPT>

// <BUILDDEFAULTROW>
async function JSB_BF_BUILDDEFAULTROW(ByRef_Jsondefs, Objectname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Jsondefs)
        return v
    }
    var Defaultrow = undefined;

    Defaultrow = {};
    await JSB_BF_SETROWDEFAULTS(ByRef_Jsondefs, Defaultrow, CStr(Objectname), function (_ByRef_Jsondefs, _Defaultrow) { ByRef_Jsondefs = _ByRef_Jsondefs; Defaultrow = _Defaultrow });
    return exit(Defaultrow);
}
// </BUILDDEFAULTROW>

// <BUILDDELETESTATEMENT>
async function JSB_BF_BUILDDELETESTATEMENT(Tablename, Pks, Oldvalues, Columndefs, Forsqlserver) {
    return 'Delete From [' + CStr(Tablename) + '] Where ' + await JSB_BF_BUILDWHERECLAUSE(CStr(Tablename), Pks, Oldvalues, Columndefs, Forsqlserver) + ';' + crlf;
}
// </BUILDDELETESTATEMENT>

// <BUILDINSERTSTATEMENT>
async function JSB_BF_BUILDINSERTSTATEMENT(Tablename, Pks, Newvalues, Columndefs, Forsqlserver) {
    // local variables
    var Arrayofdefs, Column;

    var Firstcolumn = undefined;
    var Cdef = undefined;
    var Columnname = '';
    var Cvalue = '';
    var Datatype = '';
    var Cols = '';
    var Vals = '';

    // Build Insert Statement
    Firstcolumn = true;
    Arrayofdefs = isArray(Columndefs);
    for (Column of iterateOver(Columndefs)) {
        if (CBool(Arrayofdefs)) Cdef = Column; else Cdef = Columndefs[Column];
        Columnname = Cdef.name;

        // name, label, defaultvalue, required, notblank, tooltip, align, sortable, datatype, primarykey, encrypt, ordinal, canedit, maxlength (for strings), unique
        Cvalue = Newvalues[Columnname];
        Columnname = '[' + Columnname + ']';
        Datatype = Cdef.datatype;

        if (Firstcolumn) {
            Firstcolumn = false;
        } else {
            Cols = CStr(Cols) + ', ';
            Vals = CStr(Vals) + ', ';
        }

        Cols += Columnname;
        Vals += await JSB_BF_BUILDVALUE(Forsqlserver, Cdef, Cvalue);
    }

    if (Firstcolumn) return '';

    return 'Insert Into [' + CStr(Tablename) + '] (' + Cols + ') Values (' + Vals + ');' + crlf;
}
// </BUILDINSERTSTATEMENT>

// <BUILDUPDATESTATEMENT>
async function JSB_BF_BUILDUPDATESTATEMENT(Tablename, Pks, Oldvalues, Newvalues, Columndefs, Forsqlserver) {
    // local variables
    var Arrayofdefs, Column;

    var Firstcolumn = undefined;
    var Cdef = undefined;
    var Pk1 = '';
    var Pk2 = '';
    var Columnname = '';
    var Ovalue = '';
    var Cvalue = '';
    var Sets = '';

    // Build Update Statement
    Firstcolumn = true;

    if (Len(Pks) > 0) Pk1 = Pks[LBound(Pks)];
    if (Len(Pks) > 1) Pk2 = Pks[LBound(Pks) + 1];

    Arrayofdefs = isArray(Columndefs);
    for (Column of iterateOver(Columndefs)) {
        if (CBool(Arrayofdefs)) Cdef = Column; else Cdef = Columndefs[Column];
        Columnname = Cdef.name;

        Ovalue = Oldvalues[Columnname];
        Cvalue = Newvalues[Columnname];

        if (Ovalue != Cvalue) {
            Columnname = '[' + Columnname + ']';

            if (Firstcolumn) {
                Firstcolumn = false;
            } else {
                Sets = CStr(Sets) + ', ';
            }

            Sets += Columnname + ' = ' + await JSB_BF_BUILDVALUE(Forsqlserver, Cdef, Cvalue);
        }
    }

    if (Firstcolumn) return '';
    return 'Update [' + CStr(Tablename) + '] Set ' + Sets + ' Where ' + await JSB_BF_BUILDWHERECLAUSE(CStr(Tablename), Pks, Oldvalues, Columndefs, Forsqlserver) + ';' + crlf;
}
// </BUILDUPDATESTATEMENT>

// <BUILDVALUE>
async function JSB_BF_BUILDVALUE(Forsqlserver, Cdef, Cvalue) {
    var Datatype = '';

    Datatype = Cdef.datatype;
    if (isNothing(Cvalue)) {
        if (CBool(Cdef.primarykey) && Forsqlserver) {
            // SQL Server does not allow null primary keys
            if (Datatype == 'datetime' || Datatype == 'date' || Datatype == 'time') {
                return '\'12/30/1899  12:00:00 AM\'';;
            } else if (Datatype == 'boolean') {
                return 'false';;
            } else if (Datatype == 'guid') {
                return '\'0000000-0000-0000-0000-000000000000\'';;
            } else if (Datatype == 'autointeger' || Datatype == 'integer' || Datatype == 'double' || Datatype == 'currency') {
                return '0';
            } else {
                return '\'\'';
            }
        } else {
            return 'NULL';
        }
    } else if (Datatype == 'datetime' || Datatype == 'date' || Datatype == 'time') {
        if (Left(Cvalue, 11) == '12/30/1899 ') Cvalue = Mid1(Cvalue, 12);
        Cvalue = Change(Cvalue, ' 12:00:00 AM', '');
        if (CBool(Cvalue) || CBool(Cdef.required)) {
            if (Forsqlserver) Cvalue = '\'' + CStr(Cvalue) + '\''; else Cvalue = '#' + CStr(Cvalue) + '#';
        } else {
            Cvalue = 'NULL';
        }
        return Cvalue;;
    } else if (Datatype == 'boolean') {
        return CNum(Cvalue);;
    } else if (Datatype == 'guid') {
        return '\'' + CStr(Cvalue, true) + '\'';;
    } else if (Datatype == 'autointeger' || Datatype == 'integer' || Datatype == 'double' || Datatype == 'currency') {
        if (isEmpty(Cvalue)) {
            if (CBool(Cdef.required)) Cvalue = '0'; else Cvalue = 'NULL';
        }

        return Cvalue;;
    } else if (Len(Cvalue) == 0 && Not(Cdef.required) && Not(Cdef.primarykey)) {
        return 'NULL';;
    } else if (Datatype == 'blob' || Datatype == 'png' || Datatype == 'jpg') {
        if (Len(Cvalue) == 0) {
            return '\'\'';
        } else {
            return 'CONVERT(varbinary(max), \'0x' + STX(Cvalue) + '\', 1)';
        }
    } else {
        Cvalue = '\'' + Change(Cvalue, '\'', '\'\'') + '\'';
        Cvalue = Change(Cvalue, crlf, '\' + CHAR(13)+CHAR(10) + \'');
        Cvalue = Change(Cvalue, cr, '\' + CHAR(13) + \'');
        Cvalue = Change(Cvalue, lf, '\' + CHAR(10) + \'');

        return Cvalue;
    }
}
// </BUILDVALUE>

// <BUILDWHERECLAUSE>
async function JSB_BF_BUILDWHERECLAUSE(Tablename, Pks, Oldvalues, Columndefs, Forsqlserver) {
    // local variables
    var Arrayofdefs, Column;

    var Addcomma = undefined;
    var Cdef = undefined;
    var Columnname = '';
    var Datatype = '';
    var Whereclause = '';
    var Cvalue = '';

    Addcomma = false;
    Arrayofdefs = isArray(Columndefs);
    for (Column of iterateOver(Columndefs)) {
        if (CBool(Arrayofdefs)) Cdef = Column; else Cdef = Columndefs[Column];
        Columnname = Cdef.name;

        if (CBool(Cdef.primarykey)) {
            Cvalue = Oldvalues[Columnname];
            Cdef = Columndefs[Columnname];
            Datatype = Cdef.datatype;

            if (Addcomma) Whereclause = CStr(Whereclause) + ' And '; else Addcomma = true;

            Columnname = '[' + Columnname + ']';

            if (isNothing(Cvalue)) {
                Whereclause += Columnname + ' Is Null';;
            } else if (Datatype == 'boolean') {
                Whereclause += Columnname + ' = ' + CStr(CNum(Cvalue));;
            } else if (Datatype == 'datetime' || Datatype == 'date' || Datatype == 'time') {
                if (Left(Cvalue, 11) == '12/30/1899 ') Cvalue = Mid1(Cvalue, 12);
                Cvalue = Change(Cvalue, ' 12:00:00 AM', '');
                if (Cvalue) {
                    if (Forsqlserver) Cvalue = '\'' + Cvalue + '\''; else Cvalue = '#' + Cvalue + '#';
                } else {
                    Cvalue = 'NULL';
                }
                Whereclause += Columnname + ' = ' + Cvalue;;
            } else if (Datatype == 'autointeger' || Datatype == 'integer' || Datatype == 'double' || Datatype == 'currency') {
                if (!Cvalue) Cvalue = 'NULL';
                Whereclause += Columnname + ' = ' + Cvalue;;
            } else if (Len(Cvalue) > 0) {
                Cvalue = '\'' + Change(Cvalue, '\'', '\'\'') + '\'';
                Cvalue = Change(Cvalue, crlf, '\' + CHAR(13)+CHAR(10) + \'');
                Cvalue = Change(Cvalue, cr, '\' + CHAR(13) + \'');
                Cvalue = Change(Cvalue, lf, '\' + CHAR(10) + \'');

                Whereclause += Columnname + ' = ' + Cvalue;
            } else {
                Whereclause += Columnname + ' = NULL';
            }
        }
    }

    return Whereclause;
}
// </BUILDWHERECLAUSE>

// <CACHEID2XYZ>
async function JSB_BF_CACHEID2XYZ(Cid, ByRef_X, ByRef_Y, ByRef_Z, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_X, ByRef_Y, ByRef_Z)
        return v
    }
    var S = undefined;

    S = Split(Cid, '_');
    ByRef_Z = CNum(Mid1(S[2], 2));
    ByRef_X = CNum(Mid1(S[3], 2));
    ByRef_Y = CNum(Mid1(S[4], 2));
    return exit(gps_tile2LatLng(ByRef_X, ByRef_Y, ByRef_Z));
}
// </CACHEID2XYZ>

// <CDATE>
function CDate(X) {
    if (isNumber(X)) return X;
    return r83Date(X);

}
// </CDATE>

// <CHECKSTANDARDCOMMANDS_Sub>
async function JSB_BF_CHECKSTANDARDCOMMANDS_Sub(ByRef_Command, Projectname, Objectname, Columnid, Niceditid, Mustcompile, Pagename, Parentmultiview, Htmlbackdrop, Unused, setByRefValues) {
    var me = new jsbRoutine("JSB_BF", "CHECKSTANDARDCOMMANDS", "JSB_BF_CHECKSTANDARDCOMMANDS_Sub");
    me.localValue = function (varName) { return eval(varName) }
    // local variables
    var Niceobjectname, Ctltext, Ctlid, Contextmenucmd, Contextmenutext;
    var Checkbtn, Url, Nicepagename, Frompage, Abtntext, Modelafterbtn;
    var Aviewname;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Command)
        return v
    }
    await dbgCheck(me, 5, true /* modal */);
    await dbgCheck(me, 6);
    await dbgCheck(me, 7);
    await dbgCheck(me, 8);
    await dbgCheck(me, 9);
    ByRef_Command = Change(ByRef_Command, Chr(160), Chr(32));
    await dbgCheck(me, 10);

    await dbgCheck(me, 11);
    Niceobjectname = JSB_BF_NICENAME(dropIfRight(CStr(Objectname), '.view'));
    await dbgCheck(me, 12);
    if (Not(Pagename)) Pagename = dropIfRight(CStr(Objectname), '.view', true);
    await dbgCheck(me, 13);

    await dbgCheck(me, 14);
    // From Context Menu
    await dbgCheck(me, 15);
    Ctltext = formVar('contextMenuCtlText');
    await dbgCheck(me, 16);
    Ctlid = formVar('contextMenuCtlID');
    await dbgCheck(me, 17);
    Contextmenucmd = formVar('contextMenuCmd');
    await dbgCheck(me, 18);
    Contextmenutext = formVar('contextMenuText');
    await dbgCheck(me, 19);

    await dbgCheck(me, 20);
    Checkbtn = ByRef_Command;
    await dbgCheck(me, 21);
    ByRef_Command = ''; // Default To Acceptance,
    await dbgCheck(me, 22);

    await dbgCheck(me, 23);
    if (Not(Checkbtn)) Checkbtn = Contextmenucmd;
    await dbgCheck(me, 24);
    switch (Checkbtn) {
        case 'ne_Save': case 'SavBak':
            await dbgCheck(me, 26);
            Htmlbackdrop = html(CStr(formVar(Niceditid)));
            await dbgCheck(me, 27);
            if (!Htmlbackdrop) {
                await dbgCheck(me, 28);
                Alert('I don\'t have anything to save');
                await dbgCheck(me, 29);
            } else {
                await dbgCheck(me, 30);
                if (await JSB_ODB_WRITE(Htmlbackdrop, await JSB_BF_FHANDLE('DICT', Projectname), CStr(Objectname) + '.htm')); else Alert(CStr(activeProcess.At_Errors));
                await dbgCheck(me, 31);
            }
            await dbgCheck(me, 32);

            await dbgCheck(me, 33);
            break;

        case 'ne_Cancel':
            await dbgCheck(me, 34);
            if (await JSB_ODB_READ(Htmlbackdrop, await JSB_BF_FHANDLE('DICT', Projectname), CStr(Objectname) + '.htm', function (_Htmlbackdrop) { Htmlbackdrop = _Htmlbackdrop })); else Htmlbackdrop = '';
            await dbgCheck(me, 35);
            Htmlbackdrop = Htmlbackdrop;
            await dbgCheck(me, 36);

            await dbgCheck(me, 37);
            break;

        case 'EdtCtl':
            await dbgCheck(me, 38);
            await JSB_BF_POPOUTWINDOW('edc ' + CStr(Projectname) + ' ' + CStr(Objectname) + ' ' + CStr(Columnid), jsbRootExecute('editViewColumn?viewname=' + urlEncode(Objectname) + '&projectname=' + urlEncode(Projectname) + '&id=' + CStr(Columnid) + '&closeWindow=1&pagename=' + urlEncode(Pagename)), true, '95%', '95%');
            await dbgCheck(me, 39);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 40);

            await dbgCheck(me, 41);
            break;

        case 'AddCtl':
            await dbgCheck(me, 42);
            await JSB_MDL_SHOWVIEWCOLUMN_Sub(Projectname, Pagename, Objectname, function (_Projectname, _Pagename, _Objectname) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname }); // In Edv
            await dbgCheck(me, 43);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 44);

            await dbgCheck(me, 45);
            break;

        case 'HidCtl':
            await dbgCheck(me, 46);
            await JSB_MDL_HIDEVIEWCOLUMN_Sub(Projectname, Pagename, Objectname, Columnid, function (_Projectname, _Pagename, _Objectname, _Columnid) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Columnid = _Columnid }); // In Edv
            await dbgCheck(me, 47);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 48);

            await dbgCheck(me, 49);
            break;

        case 'RmVCol':
            await dbgCheck(me, 50);
            await JSB_MDL_DELETEVIEWCOLUMN_Sub(Projectname, Pagename, Objectname, Columnid, false, function (_Projectname, _Pagename, _Objectname, _Columnid, _P5) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Columnid = _Columnid }); // In Edc
            await dbgCheck(me, 51);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 52);

            await dbgCheck(me, 53);
            break;

        case 'DelCol':
            await dbgCheck(me, 54);
            await JSB_MDL_DELETEVIEWCOLUMN_Sub(Projectname, Pagename, Objectname, Columnid, true, function (_Projectname, _Pagename, _Objectname, _Columnid, _P5) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Columnid = _Columnid }); // In Edc
            await dbgCheck(me, 55);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 56);

            await dbgCheck(me, 57);
            break;

        case 'ReqCtl':
            await dbgCheck(me, 58);
            await JSB_MDL_REQUIRECOLUMN_Sub(Projectname, Pagename, Objectname, Columnid, function (_Projectname, _Pagename, _Objectname, _Columnid) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Columnid = _Columnid }); // In Edv
            await dbgCheck(me, 59);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 60);

            await dbgCheck(me, 61);
            break;

        case 'SupLbl':
            await dbgCheck(me, 62);
            await JSB_MDL_SUPPRESSLABELCOLUMN_Sub(Projectname, Pagename, Objectname, Columnid, function (_Projectname, _Pagename, _Objectname, _Columnid) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Columnid = _Columnid }); // In Edv
            await dbgCheck(me, 63);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 64);

            await dbgCheck(me, 65);
            break;

        case 'setURL':
            await dbgCheck(me, 66);
            await JSB_MDL_SETBUTTONURL_Sub(Projectname, Pagename, Objectname, Columnid, function (_Projectname, _Pagename, _Objectname, _Columnid) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Columnid = _Columnid }); // In Edv
            await dbgCheck(me, 67);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 68);

            await dbgCheck(me, 69);
            break;

        case 'addCol':
            await dbgCheck(me, 70);
            await JSB_MDL_ADDCOLUMN_Sub(Projectname, Pagename, Objectname, Columnid, function (_Projectname, _Pagename, _Objectname, _Columnid) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Columnid = _Columnid }); // In Edv
            await dbgCheck(me, 71);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 72);

            await dbgCheck(me, 73);
            break;

        case 'FulCtl':
            await dbgCheck(me, 74);
            await JSB_MDL_FULLLINECOLUMN_Sub(Projectname, Pagename, Objectname, Columnid, function (_Projectname, _Pagename, _Objectname, _Columnid) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Columnid = _Columnid }); // In Edv
            await dbgCheck(me, 75);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 76);

            await dbgCheck(me, 77);
            break;

        case 'LblCtl':
            await dbgCheck(me, 78);
            await JSB_MDL_LABELCOLUMN_Sub(Projectname, Pagename, Objectname, Columnid, function (_Projectname, _Pagename, _Objectname, _Columnid) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Columnid = _Columnid }); // In Edv
            await dbgCheck(me, 79);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 80);

            await dbgCheck(me, 81);
            break;

        case 'DftCtl':
            await dbgCheck(me, 82);
            await JSB_MDL_DEFAULTCOLUMN_Sub(Projectname, Pagename, Objectname, Columnid, function (_Projectname, _Pagename, _Objectname, _Columnid) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Columnid = _Columnid }); // In Edv
            await dbgCheck(me, 83);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 84);

            await dbgCheck(me, 85);
            break;

        case 'TipCtl':
            await dbgCheck(me, 86);
            await JSB_MDL_TOOLTIPCOLUMN_Sub(Projectname, Pagename, Objectname, Columnid, function (_Projectname, _Pagename, _Objectname, _Columnid) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Columnid = _Columnid }); // In Edv
            await dbgCheck(me, 87);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 88);

            await dbgCheck(me, 89);
            break;

        case 'RO_Ctl':
            await dbgCheck(me, 90);
            await JSB_MDL_READONLYCOLUMN_Sub(Projectname, Pagename, Objectname, Columnid, function (_Projectname, _Pagename, _Objectname, _Columnid) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Columnid = _Columnid }); // In Edv
            await dbgCheck(me, 91);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 92);

            await dbgCheck(me, 93);
            break;

        case 'CR_Ctl':
            await dbgCheck(me, 94);
            await JSB_MDL_CRLFCOLUMN_Sub(Projectname, Pagename, Objectname, Columnid, function (_Projectname, _Pagename, _Objectname, _Columnid) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Columnid = _Columnid }); // In Edv
            await dbgCheck(me, 95);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 96);

            await dbgCheck(me, 97);
            break;

        case 'ChooseColumns':
            await dbgCheck(me, 98);
            await JSB_MDL_CHOOSECOLUMNS_Sub(Projectname, Pagename, Objectname, function (_Projectname, _Pagename, _Objectname) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname }); // In Edv
            await dbgCheck(me, 99);
            if (hasTclParent()) Url = JSB_BF_JSBROOTEXECUTETCLCMD(Field(Objectname, '.view', 1)); else Url = CStr(JSB_BF_URL(), true);
            await dbgCheck(me, 100);
            return At_Response.redirect(Url);
            await dbgCheck(me, 101);

            await dbgCheck(me, 102);
            break;

        case 'RequiredColumns':
            await dbgCheck(me, 103);
            await JSB_MDL_REQUIREDCOLUMNS_Sub(Projectname, Pagename, Objectname, function (_Projectname, _Pagename, _Objectname) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname }); // In Edv
            await dbgCheck(me, 104);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 105);

            await dbgCheck(me, 106);
            break;

        case 'OrderColumns':
            await dbgCheck(me, 107);
            await JSB_MDL_ORDERCOLUMNS_Sub(Projectname, Pagename, Objectname, function (_Projectname, _Pagename, _Objectname) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname }); // In Edv
            await dbgCheck(me, 108);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 109);

            await dbgCheck(me, 110);
            break;

        case 'OrderButtons':
            await dbgCheck(me, 111);
            await JSB_MDL_ORDERBUTTONS_Sub(Projectname, Pagename, Objectname, function (_Projectname, _Pagename, _Objectname) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname }); // In Edv
            await dbgCheck(me, 112);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 113);

            await dbgCheck(me, 114);
            break;

        case 'VisibleColumns':
            await dbgCheck(me, 115);
            await JSB_MDL_SETVISIBLECOLUMNS_Sub(Projectname, Pagename, Objectname, function (_Projectname, _Pagename, _Objectname) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname }); // In Edv
            await dbgCheck(me, 116);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 117);

            await dbgCheck(me, 118);
            break;

        case 'DefineInputs':
            await dbgCheck(me, 119);
            await JSB_MDL_PICKVIEWINPUTS_Sub(Projectname, Pagename, Objectname, function (_Projectname) { Projectname = _Projectname }); // In Edv
            await dbgCheck(me, 120);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 121);

            await dbgCheck(me, 122);
            break;

        case 'DefineOutputs':
            await dbgCheck(me, 123);
            await JSB_MDL_PICKVIEWOUTPUTS_Sub(Projectname, Pagename, Objectname, function (_Projectname) { Projectname = _Projectname }); // In Edv
            await dbgCheck(me, 124);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 125);

            await dbgCheck(me, 126);
            break;

        case 'SetViewHeader':
            await dbgCheck(me, 127);
            await JSB_MDL_SETVIEWHEADER_Sub(Projectname, Pagename, Objectname, function (_Projectname, _Pagename, _Objectname) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname }); // In Edv
            await dbgCheck(me, 128);
            if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
            await dbgCheck(me, 129);

            await dbgCheck(me, 130);
            break;

        case 'PageProps':
            await dbgCheck(me, 131);
            if (Pagename) {
                await dbgCheck(me, 132);
                await JSB_MDL_EDITPAGEMODEL_Sub(Projectname, Pagename, true, false, function (_Projectname, _Pagename) { Projectname = _Projectname; Pagename = _Pagename });
                await dbgCheck(me, 133);
                if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
                await dbgCheck(me, 134);
            }
            await dbgCheck(me, 135);

            await dbgCheck(me, 136);
            break;

        case 'EdtCode':
            await dbgCheck(me, 137);
            Nicepagename = JSB_BF_NICENAME(dropIfRight(Pagename, '.page', true));
            await dbgCheck(me, 138);
            // @popoutWindow("ed ":ProjectName:" ":NicePageName,  @jsbRootExecuteTclCmd("ed ":ProjectName:" ":NicePageName), True, "95%", "95%")
            await dbgCheck(me, 139);
            JSB_BF_NEWWINDOW(JSB_BF_JSBROOTEXECUTETCLCMD('ed ' + CStr(Projectname) + ' ' + CStr(Nicepagename)));
            await dbgCheck(me, 140);

            await dbgCheck(me, 141);
            break;

        case 'ReGen':
            await dbgCheck(me, 142);
            if (hasTclParent()) Frompage = JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1)); else Frompage = CStr(JSB_BF_URL(), true);
            await dbgCheck(me, 143);
            return At_Response.redirect(jsbRootAct() + '?ReGenPageModel&projectName=' + urlEncode(Projectname) + '&pageName=' + urlEncode(Pagename) + '&fromPage=' + urlEncode(Frompage));
            await dbgCheck(me, 144);

            await dbgCheck(me, 145);
            break;

        case 'EdtBtn':
            await dbgCheck(me, 146);
            Ctltext = formVar('contextMenuCtlText');
            await dbgCheck(me, 147);
            if (await JSB_MDL_EDITVIEWBTN(Projectname, Pagename, Objectname, Ctltext, function (_Projectname, _Pagename, _Objectname, _Ctltext) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Ctltext = _Ctltext })) {
                await dbgCheck(me, 148);
                if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
                await dbgCheck(me, 149);
            }
            await dbgCheck(me, 150);

            await dbgCheck(me, 151);
            break;

        case 'DelBtn':
            await dbgCheck(me, 152);
            Abtntext = formVar('contextMenuCtlText');
            await dbgCheck(me, 153);

            await dbgCheck(me, 154);
            if (await JSB_MDL_DELETEVIEWBTN(Projectname, Pagename, Objectname, Abtntext, function (_Projectname, _Pagename, _Objectname, _Abtntext) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Abtntext = _Abtntext })) {
                await dbgCheck(me, 155);
                if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
                await dbgCheck(me, 156);
            }
            await dbgCheck(me, 157);

            await dbgCheck(me, 158);
            break;

        case 'AddBtn':
            await dbgCheck(me, 159);
            Modelafterbtn = formVar('contextMenuCtlText');
            await dbgCheck(me, 160);
            if (await JSB_MDL_ADDVIEWBTN(Projectname, Pagename, Objectname, Modelafterbtn, function (_Projectname, _Pagename, _Objectname) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname })) {
                await dbgCheck(me, 161);
                if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
                await dbgCheck(me, 162);
            }
            await dbgCheck(me, 163);

            await dbgCheck(me, 164);
            break;

        case 'EdtBCode':
            await dbgCheck(me, 165);
            Abtntext = formVar('contextMenuCtlText');
            await dbgCheck(me, 166);

            await dbgCheck(me, 167);
            if (await JSB_MDL_EDTBCODE(Projectname, Pagename, Objectname, Abtntext, function (_Projectname, _Pagename, _Objectname, _Abtntext) { Projectname = _Projectname; Pagename = _Pagename; Objectname = _Objectname; Abtntext = _Abtntext })) {
                await dbgCheck(me, 168);
                if (hasTclParent()) return At_Response.redirect(JSB_BF_JSBROOTEXECUTETCLCMD(Field(Pagename, '.page', 1))); else return At_Response.redirect(CStr(JSB_BF_URL(), true));
                await dbgCheck(me, 169);
            }
            await dbgCheck(me, 170);

            await dbgCheck(me, 171);
            break;

        case 'ViewProps':
            await dbgCheck(me, 172);
            await JSB_BF_POPOUTWINDOW('edv ' + CStr(Projectname) + ' ' + CStr(Objectname), jsbRootExecute('editViewModel?viewname=' + urlEncode(Objectname) + '&projectname=' + urlEncode(Projectname) + '&closeWindow=1&pagename=' + urlEncode(Pagename)), true, '95%', '95%');
            await dbgCheck(me, 173);

            await dbgCheck(me, 174);
            break;

        case 'editView':
            // From Ctls Json_inline
            await dbgCheck(me, 175);
            Aviewname = dropIfRight(CStr(formVar('contextMenuVal')), '.view');
            await dbgCheck(me, 176);
            if (InStr1(1, Aviewname, '*')) { Projectname = Field(Aviewname, '*', 1); Aviewname = Field(Aviewname, '*', 2); }
            await dbgCheck(me, 177);

            await dbgCheck(me, 178);
            await JSB_BF_POPOUTWINDOW('edv ' + Projectname + ' ' + CStr(Aviewname), jsbRootExecute('editViewModel?viewname=' + urlEncode(Aviewname) + '&projectname=' + urlEncode(Projectname) + '&closeWindow=1&pagename=' + urlEncode(Pagename)), true, '95%', '95%');
            await dbgCheck(me, 179);

            await dbgCheck(me, 180);
            break;

        case 'viewView':
            // From Ctls Json_inline
            await dbgCheck(me, 181);
            Aviewname = dropIfRight(CStr(formVar('contextMenuVal')), '.view');
            await dbgCheck(me, 182);
            if (InStr1(1, Aviewname, '*')) { Projectname = Field(Aviewname, '*', 1); Aviewname = Field(Aviewname, '*', 2); }
            await dbgCheck(me, 183);
            await JSB_BF_POPOUTWINDOW(JSB_BF_NICENAME(CStr(Aviewname)), jsbRootExecute(JSB_BF_NICENAME(CStr(Aviewname)) + '?fromPage=' + urlEncode(Pagename)), true, '95%', '95%');
            await dbgCheck(me, 184);

            await dbgCheck(me, 185);
            break;

        default:
            await dbgCheck(me, 186);
            ByRef_Command = Checkbtn;
            await dbgCheck(me, 187);
    }
    await dbgCheck(me, 188);
    return exit();
}
// </CHECKSTANDARDCOMMANDS_Sub>

// <CHOSEATHEME>
async function JSB_BF_CHOSEATHEME(Ignored1, Ignored2) {
    var Themes = undefined;
    var Usetheme = undefined;
    var Themescss = '';
    var Theme = '';
    var Currenttheme = '';
    var Savedscreen = '';
    var Btn = '';

    Themescss = await JSB_BF_FSELECT('css', 'ItemId Like "bootstrap_]"', undefined, undefined, function (_P1) { });
    Themes = [undefined,];
    for (Theme of iterateOver(Themescss)) {
        Theme = LCase(Theme);
        if (Right(Theme, 4) == '.css' && InStr1(1, Theme, '_')) Themes[Themes.length] = dropLeft(Left(Theme, Len(Theme) - 4), 'bootstrap_');
    }

    Usetheme = JSB_BF_USERVAR('currentTheme');
    Currenttheme = Usetheme;

    Savedscreen = await JSB_BF_SAVESCREEN();

    while (true) {
        Print(At(-1));
        if (Usetheme) Println(Center(H2('Current theme: ' + CStr(Usetheme))));
        Print(html('\<div style=\'white-space: normal\'\>'));
        for (Theme of iterateOver(Themes)) {
            Print(JSB_HTML_SUBMITBTN('Btn', Theme, { "style": 'width: 100px; overflow: hidden' }), html('\<td\>'));
        }
        Println();
        Print(Center(H2(html('\<div style=\'width: 190px; overflow: hidden; display: inline-block\'\>') + JSB_HTML_SUBMITBTN('Btn', 'Accept', { "class": 'btn btn-success' }) + JSB_HTML_SUBMITBTN('Btn', 'Quit', { "class": 'btn btn-danger' }) + html('\<td\>') + html('\</div\>'))));
        Print(html('\</div\>'));

        Println(H3('Buttons'));
        Println(html('\r\n\
\<button type="button" class="btn btn-primary"\>Primary\</button\>\r\n\
\<button type="button" class="btn btn-secondary"\>Secondary\</button\>\r\n\
\<button type="button" class="btn btn-success"\>Success\</button\>\r\n\
\<button type="button" class="btn btn-info"\>Info\</button\>\r\n\
\<button type="button" class="btn btn-warning"\>Warning\</button\>\r\n\
\<button type="button" class="btn btn-danger"\>Danger\</button\>\r\n\
\<button type="button" class="btn btn-link"\>Link\</button\>\r\n\
'));

        Print(Label('Color Picker: ', 'colorPicker'), Colorpicker('colorPicker'));

        Println(JSB_HTML_SCRIPT('$(\'#colorPicker\').change(function () { try { $(\'body\').css(\'background-color\', $(this).val()) } catch (e) {} } )'));

        Println(H3('Typography'));
        Println(html('\r\n\
\<h1 style=\'display: inline; overflow: hidden\'\>Heading 1\</h1\>\r\n\
\<h2 style=\'display: inline; overflow: hidden\'\>Heading 2\</h2\>\r\n\
\<h3 style=\'display: inline; overflow: hidden\'\>Heading 3\</h3\>\r\n\
\<h4 style=\'display: inline; overflow: hidden\'\>Heading 4\</h4\>\r\n\
\<h5 style=\'display: inline; overflow: hidden\'\>Heading 5\</h5\>\r\n\
\<h6 style=\'display: inline; overflow: hidden\'\>Heading 6\</h6\>\r\n\
\<br\>\r\n\
\<h3\>\r\n\
  Heading\r\n\
  \<small class="text-muted"\>with muted text\</small\>\r\n\
\</h3\>\r\n\
\<p class="lead"\>Simple text Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.\</p\>\r\n\
\r\n\
\r\n\
\r\n\
\<div class="jumbotron"\>\r\n\
  \<H3\>jumbotro div with a H3 header\</H3\>\r\n\
  \<p\>This is a simple text on a jumbotron div for calling extra attention to featured content or information.\</p\>\r\n\
\</div\>\r\n\
\r\n\
\<table class="table"\>\r\n\
\<tr\>\<th\>This\</th\>\<th\>is\</th\>\<th\>a\</th\>\<th\>table\</th\>\<th\>\</tr\>\r\n\
\<tr\>\<td\>it\</td\>\<td\>has\</td\>\<td\>classes\</td\>\<td\>table table-striped table-bordered\</td\>\<td\>\</tr\>\r\n\
\<tr\>\<td\>it\</td\>\<td\>has\</td\>\<td\>classes\</td\>\<td\>table table-striped table-bordered\</td\>\<td\>\</tr\>\r\n\
\<tr\>\<td\>it\</td\>\<td\>has\</td\>\<td\>classes\</td\>\<td\>table table-striped table-bordered\</td\>\<td\>\</tr\>\r\n\
\</table\>\r\n\
'));

        Println(H3('Forms'));
        Println(html('\r\n\
\<div class="form-group"\>\r\n\
  \<fieldset disabled=""\>\r\n\
    \<label class="control-label" for="disabledInput"\>Disabled input\</label\>\r\n\
    \<input class="form-control" id="disabledInput" type="text" placeholder="Disabled input here..." disabled=""\>\r\n\
  \</fieldset\>\r\n\
\</div\>\r\n\
\r\n\
\<div class="form-group"\>\r\n\
  \<fieldset\>\r\n\
    \<label class="control-label" for="readOnlyInput"\>Readonly input\</label\>\r\n\
    \<input class="form-control" id="readOnlyInput" type="text" placeholder="Readonly input here…" readonly=""\>\r\n\
  \</fieldset\>\r\n\
\</div\>\r\n\
\r\n\
\<div class="form-group has-success"\>\r\n\
  \<label class="form-control-label" for="inputSuccess1"\>Valid input\</label\>\r\n\
  \<input type="text" value="correct value" class="form-control is-valid" id="inputValid"\>\r\n\
  \<div class="valid-feedback"\>Success! You\'ve done it.\</div\>\r\n\
\</div\>\r\n\
\r\n\
\<div class="form-group has-danger"\>\r\n\
  \<label class="form-control-label" for="inputDanger1"\>Invalid input\</label\>\r\n\
  \<input type="text" value="wrong value" class="form-control is-invalid" id="inputInvalid"\>\r\n\
  \<div class="invalid-feedback"\>Sorry, that username\'s taken. Try another?\</div\>\r\n\
\</div\>\r\n\
\r\n\
\<div class="form-group"\>\r\n\
  \<label class="col-form-label col-form-label-lg" for="inputLarge"\>Large input\</label\>\r\n\
  \<input class="form-control form-control-lg" type="text" placeholder=".form-control-lg" id="inputLarge"\>\r\n\
\</div\>\r\n\
\r\n\
\<div class="form-group"\>\r\n\
  \<label class="col-form-label" for="inputDefault"\>Default input\</label\>\r\n\
  \<input type="text" class="form-control" placeholder="Default input" id="inputDefault"\>\r\n\
\</div\>\r\n\
\r\n\
\<div class="form-group"\>\r\n\
  \<label class="col-form-label col-form-label-sm" for="inputSmall"\>Small input\</label\>\r\n\
  \<input class="form-control form-control-sm" type="text" placeholder=".form-control-sm" id="inputSmall"\>\r\n\
\</div\>\r\n\
\r\n\
\<div class="form-group"\>\r\n\
  \<label class="control-label"\>Input addons\</label\>\r\n\
  \<div class="form-group"\>\r\n\
    \<div class="input-group mb-3"\>\r\n\
      \<div class="input-group-prepend"\>\r\n\
        \<span class="input-group-text"\>$\</span\>\r\n\
      \</div\>\r\n\
      \<input type="text" class="form-control" aria-label="Amount (to the nearest dollar)"\>\r\n\
      \<div class="input-group-append"\>\r\n\
        \<span class="input-group-text"\>.00\</span\>\r\n\
      \</div\>\r\n\
    \</div\>\r\n\
  \</div\>\r\n\
\</div\>\r\n\
'));

        await At_Server.asyncPause(me);
        Btn = formVar('Btn');
        if (Btn == 'Quit' || Btn == 'Accept') break;
        Usetheme = Btn;
        Print(JSB_BF_THEME(CStr(Usetheme) + '.css?cacheBuster=' + CStr(Timer())));
    }

    await JSB_BF_RESTORESCREEN_Sub(Savedscreen, function (_Savedscreen) { Savedscreen = _Savedscreen });

    if (Btn == 'Accept') Currenttheme = Usetheme;
    Print(JSB_BF_THEME(Currenttheme));
    return Usetheme;

    // unload a theme with $('link[rel=stylesheet][href*="bootstrap_"]').remove();
}
// </CHOSEATHEME>

// <CJSON>
function CJSon(Txt) {
    if (isJSON(Txt) || isArray(Txt)) return Txt;
    var ctxt = cleanJSON(Txt)
    if (!ctxt) return null
    if (Left(Txt, 1) != "{") return null

    try {
        return eval("(" + ctxt + ")")
    } catch (err) {
        return null
    }
}
// </CJSON>

// <CLEANUPTEXT>
function CleanupText(Src, Nocrlf) {
    var I = undefined;
    var Ssrc = '';
    var S = undefined;

    S = Change(Src, Chr(226) + Chr(128) + Chr(152), '\'');
    S = Change(S, Chr(226) + Chr(128) + Chr(153), '\'');
    S = Change(S, Chr(239) + Chr(191) + Chr(189), Chr(253));
    S = Change(S, Chr(226) + Chr(140) + Chr(137), Chr(253));
    S = Change(S, Chr(160), Chr(32)); // ' non breaking space
    S = Change(S, Chr(9), Chr(32));
    S = Change(S, Chr(28), '');
    S = Change(S, Chr(29), '');

    if (Not(Nocrlf)) {
        S = Change(S, crlf, am);
        S = Change(S, cr, am);
        S = Change(S, lf, am);
        S = Change(S, Chr(195) + Chr(190), am);
        S = Change(S, Chr(255), am);
    }

    S = Change(S, Chr(145), Chr(39));
    S = Change(S, Chr(146), Chr(39));

    S = Change(S, Chr(147), Chr(34));
    S = Change(S, Chr(148), Chr(34));

    I = Index1(S, Chr(26), 1);
    if (I) S = Mid1(S, 1, I - 1);

    if (System(1) == 'js') Ssrc = Change(Ssrc, Chr(8217), '\'');
    return S;
}
// </CLEANUPTEXT>

// <CLEARSCREEN>
function clearScreen() {
    return At(-1);
}
// </CLEARSCREEN>

// <CLEARUSERCACHES>
function JSB_BF_CLEARUSERCACHES() {
    var Uservars = '';
    var Tag = '';

    At_Session.Item('CACHEDACCOUNTS', '');
    At_Session.Item('RPC_CACHED_OPENS', {});
    At_Session.Item('LAST_RPC_ADDRESS', '');
    At_Session.Item('RPC_CACHED_LOGINS', {});
    At_Session.Item('RPC_CACHED_ITEMS', {});
    At_Session.Item('RPC_CACHED_TIMER', {});
    At_Session.Item('REFCACHE', {});
    At_Session.Item('CACHEDCONVCACHEDTRANSLATES', {});
    At_Session.Item('DROPBOX_CACHED_FOLDERS', {});
    At_Session.Item('DROPBOX_CACHED_ITEMS', {});
    At_Session.Item('DROPBOX_CACHED_TIMER', {});

    // clear jsbConfig() cache
    Uservars = At_Session.Item(userno());
    for (Tag of iterateOver(Uservars)) {
        if (Left(Tag, 7) == 'config ') delete Uservars[Tag];
    }
    At_Session.Item(userno(), Uservars);

    window.clearCaches();
    window.clearAllSessions();

    return true;
}
// </CLEARUSERCACHES>

// <CLONEACCOUNT>
async function JSB_BF_CLONEACCOUNT(ByRef_Newactname, Fromactname, setByRefValues) {
    // local variables
    var Result;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Newactname)
        return v
    }
    var Todir = '';
    var Fromdir = '';

    if (Not(Fromactname)) Fromactname = jsbAccount();
    if (Not(ByRef_Newactname)) { activeProcess.At_Errors = 'Empty account name'; return exit(false); }
    if (await JSB_BF_ACCOUNTEXISTS(CStr(ByRef_Newactname))) { activeProcess.At_Errors = CStr(ByRef_Newactname) + ' already exists.'; return exit(false); }
    if (!(await JSB_BF_ACCOUNTEXISTS(Fromactname))) { activeProcess.At_Errors = Fromactname + ' does not exist.'; return exit(false); }

    if (window.dotNetObj) {

        Todir = dotNetObj.dnoMapRootAccount(ByRef_Newactname);
        Fromdir = dotNetObj.dnoMapRootAccount(Fromactname);

        Result = (dotNetObj.dnoExecuteDOS('COPYDIRECTORY|' + Fromdir + '|' + Todir));
        if (Left(Result, 2) == '**') { activeProcess.At_Errors = Result; return exit(false); }
    } else {
        activeProcess.At_Errors = 'Not supported';
        return exit(false);
    }

    return exit(true);
}
// </CLONEACCOUNT>

// <CLOSEBUTTON>
function CloseButton() {
    return Center(Button('id', 'CLOSE', { "onclick": 'new windowOpen(jsbRoot() + "close_html", "_self")' }));

}
// </CLOSEBUTTON>

// <CLS>
function Cls() {
    return At(-1);
}
// </CLS>

// <COLUMNDEF2JSB>
async function JSB_BF_COLUMNDEF2JSB(Columndef) {
    var Jsb = undefined;
    var _Label = '';
    var Dft = '';
    var Datatype = '';

    // ColumnDef Fields from SqLite: ColumnName, DataType, AllowDBNull, AutoIncrement, AutoIncrementSeed, AutoIncrementStep, Caption, DefaultValue, MaxLength, ordinal, Namespace, Prefix, ReadOnly, Unique, PrimaryKey

    Jsb = {};
    Jsb.name = Columndef.ColumnName;

    _Label = Columndef.Caption;
    if (LCase(_Label) == _Label || UCase(_Label) == _Label) _Label = UCase(Left(_Label, 1)) + LCase(Mid1(_Label, 2));
    Jsb.label = Trim(Change(_Label, '_', ' '));

    if (CBool(Columndef.PrimaryKey)) Jsb.primarykey = Columndef.PrimaryKey;
    Jsb.datatype = 'string'; // Guid;Autointeger;Integer;Double;Boolean;String;Date;Time;Datetime;Currency;Blob;Png;Jpg;Collection;Url;Memo;Password,Jsonarray,Jsonrow
    Jsb.sortable = true;
    if (Not(Columndef.AllowDBNull)) {
        Jsb.required = true;
        Jsb.notblank = true;
    }

    Jsb.canedit = Not(Columndef.ReadOnly);
    if (HasTag(Columndef, 'Ordinal')) Jsb.ordinal = Columndef.Ordinal;
    if (HasTag(Columndef, 'ordinal')) Jsb.ordinal = Columndef.ordinal;

    if (Null0(Columndef.MaxLength) > '0') Jsb.maxlength = Columndef.MaxLength;
    if (Columndef.Unique == 'true') Jsb.unique = Columndef.unique;

    // Convert datatype to one of: guid;autointeger;integer;double;boolean;string;date;time;datetime;currency;blob;png;jpg;collection;url;memo;password,jsonarray,jsonrow

    Datatype = LCase(Columndef.DATA_TYPE);
    if (Not(Datatype)) Datatype = LCase(Columndef.DataType);
    if (Not(Datatype)) Datatype = LCase(Columndef.datatype);

    if (InStr1(1, Datatype, '[')) Datatype = Field(Datatype, '[', 1) + '[]';
    if (Left(Datatype, 7) == 'system.') {
        switch (Field(Datatype, '.', 2)) {
            case 'boolean':
                Jsb.datatype = 'boolean';
                break;

            case 'byte':
                Jsb.datatype = 'integer';
                break;

            case 'int16':
                Jsb.datatype = 'integer';
                break;

            case 'int32':
                Jsb.datatype = 'integer';
                break;

            case 'int64':
                Jsb.datatype = 'integer';
                break;

            case 'single':
                Jsb.datatype = 'double';
                break;

            case 'double':
                Jsb.datatype = 'double';
                break;

            case 'decimal':
                Jsb.datatype = 'currency';
                break;

            case 'datetime':
                Jsb.datatype = 'datetime';
                break;

            case 'datetimeoffset':
                Jsb.datatype = 'string'; // Includes An Offset From Time Zone
                break;

            case 'timespan':
                Jsb.datatype = 'double'; // Time Delta
                break;

            case 'string':
                Jsb.datatype = 'string';
                break;

            case 'byte[]':
                Jsb.datatype = 'blob';
                break;

            case 'guid':
                Jsb.datatype = 'guid';
                break;

            default:
                if (CBool(isAdmin())) { Print(); debugger; }

        }
    } else {
        if (isNumber(Datatype)) {
            // see https://www.w3schools.com/asp/ado_datatypes.asp
            switch (Datatype) {
                case 20:
                    Datatype = 'bigint';
                    break;

                case 128:
                    Datatype = 'binary';
                    break;

                case 11:
                    Datatype = 'bit';
                    break;

                case 129:
                    Datatype = 'char';
                    break;

                case 6:
                    Datatype = 'money';
                    break;

                case 7:
                    Datatype = 'datetime';
                    break;

                case 135:
                    Datatype = 'timestamp';
                    break;

                case 14:
                    Datatype = 'decimal';
                    break;

                case 5:
                    Datatype = 'float';
                    break;

                case 72:
                    Datatype = 'uniqueidentifier';
                    break;

                case 9:
                    Datatype = 'varbinary';
                    break;

                case 3:
                    Datatype = 'int';
                    break;

                case 205:
                    Datatype = 'varbinary'; // Image
                    break;

                case 201:
                    Datatype = 'varchar'; // Text
                    break;

                case 203:
                    Datatype = 'nvarchar'; // NText
                    break;

                case 131:
                    Datatype = 'decimal';
                    break;

                case 4:
                    Datatype = 'decimal';
                    break;

                case 2:
                    Datatype = 'smallint';
                    break;

                case 17:
                    Datatype = 'tinyint';
                    break;

                case 204:
                    Datatype = 'binary';
                    break;

                case 200:
                    Datatype = 'varchar';
                    break;

                case 12:
                    Datatype = 'varchar';
                    break;

                case 202:
                    Datatype = 'varchar';
                    break;

                case 130:
                    Datatype = 'nvarchar';
                    break;

                default:
                    if (CBool(isAdmin())) { Print(); debugger; }
            }
        }

        switch (Datatype) {
            case 'bigint':
                Jsb.datatype = 'integer'; // A 64-Bit Signed Integer.
                break;

            case 'binary':
                Jsb.datatype = 'blob'; // Array Of Type Byte Upto 8K
                break;

            case 'bit':
                Jsb.datatype = 'boolean'; // 0, 1, Or Nothing.
                break;

            case 'char':
                Jsb.datatype = 'string'; // Fixed Length String Up To 8K
                break;

            case 'date':
                Jsb.datatype = 'date';
                break;

            case 'datetime':
                Jsb.datatype = 'datetime'; // Accuracy Of 3.33 Milliseconds
                break;

            case 'datetime2':
                Jsb.datatype = 'datetime'; // 100 Nanoseconds Accuracy
                break;

            case 'datetimeoffset':
                Jsb.datatype = 'datetime'; // With Timezone
                break;

            case 'decimal':
                Jsb.datatype = 'double'; // A Fixed Precision And Scale
                break;

            case 'float':
                Jsb.datatype = 'double'; // Floating Precision
                break;

            case 'image':
                Jsb.datatype = 'jpg'; // Array Of Type Byte. (Could Be Png Or Other)
                break;

            case 'int':
                Jsb.datatype = 'integer'; // A 32-Bit Signed Integer
                break;

            case 'money':
                Jsb.datatype = 'currency'; // ;* A Fixed Precision And Scale
                break;

            case 'nchar':
                Jsb.datatype = 'string'; // Fixed Length Unicode String Up To 8K
                break;

            case 'ntext':
                Jsb.datatype = 'string'; // Variable Length Unicode Up To 8Gb
                break;

            case 'nvarchar':
                Jsb.datatype = 'string'; // Variable Length Unicode Upto 4K
                break;

            case 'real':
                Jsb.datatype = 'double';
                break;

            case 'smalldatetime':
                Jsb.datatype = 'time';
                break;

            case 'smallint':
                Jsb.datatype = 'integer';
                break;

            case 'smallmoney':
                Jsb.datatype = 'currency';
                break;

            case 'text':
                Jsb.datatype = 'memo'; // Non Unicode Upto 4Gb
                break;

            case 'time':
                Jsb.datatype = 'time';
                break;

            case 'timestamp':
                Jsb.datatype = 'blob'; // Array Of 8 Bytes Unique Within Database
                break;

            case 'tinyint':
                Jsb.datatype = 'integer';
                break;

            case 'uniqueidentifier':
                Jsb.datatype = 'guid';
                break;

            case 'varbinary':
                Jsb.datatype = 'blob'; // Array Of Byte
                break;

            case 'varchar':
                Jsb.datatype = 'string'; // String
                break;

            case 'xml':
                Jsb.datatype = 'string';
        }
    }

    if (CBool(Columndef.AutoIncrement)) { Jsb.datatype = 'autointeger'; Jsb.canedit = false; }
    if (Jsb.datatype == 'integer' || Jsb.datatype == 'autointeger' || Jsb.datatype == 'double' || Jsb.datatype == 'currency') Jsb.align = 'right';

    if (Jsb.datatype == 'blob' || Jsb.datatype == 'png' || Jsb.datatype == 'img' || Jsb.datatype == 'guid' || Jsb.datatype == 'memo' || Jsb.datatype == 'collection' || Jsb.datatype == 'jsonarray' || Jsb.datatype == 'jsonrow') {
        Jsb.sortable = false;
        if (Jsb.datatype == 'blob' || Jsb.datatype == 'png' || Jsb.datatype == 'img' || Jsb.datatype == 'guid') Jsb.canedit = false;
    }

    Dft = Columndef.DefaultValue;
    if (!isNothing(Dft)) {
        if (Dft == 'GenGUID()') { Dft = '{guid}'; }
        if (Not(Columndef.AllowDBNull) && Dft == 'null') Dft = '';
        Jsb.defaultvalue = Dft;
    }
    return Jsb;
}
// </COLUMNDEF2JSB>

// <COMPASSHEADING>
async function JSB_BF_COMPASSHEADING(Callbackiname, Callbackfname) {
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                me.hasAbsoluteOrientation = function () { return 'ondeviceorientationabsolute' in window };
                me.hasDeviceOrientation = function () { return 'ondeviceorientation' in window };

                if (Not(me.hasAbsoluteOrientation()) && Not(me.hasDeviceOrientation())) { activeProcess.At_Errors = 'No DeviceOrientationEvent'; return undefined; }

                if (CBool(Callbackiname)) {
                    if (Not(Callbackfname)) Callbackfname = System(33);
                    me.compassHeadingCallBackFName = Callbackfname;
                    me.compassHeadingCallBackIName = Callbackiname;
                    me.doCallBacks = true;
                    me.DontClearMe = true;
                }

                me.Alpha = undefined;
                me.Beta = undefined;
                me.Gamma = undefined;
                me.firstEvent = true;
                me.nested = 0;

                me.handleCompassChange = function (event) {
                    if (me.nested) return;
                    me.nested += 1;

                    if (event.absolute) {
                        // nothing to do
                    } else if (event.hasOwnProperty('webkitCompassHeading')) {
                        // get absolute orientation for Safari/iOS
                        event.alpha = 360 - event.webkitCompassHeading;
                    } else {
                        event.alpha = undefined;
                    }

                    if (event.alpha == null) {
                        me.doCallBacks = false;
                        At_Errors = 'No Compass Heading in device orientaton';
                    }

                    // One time event?
                    if (!me.doCallBacks) {
                        // one time event
                        window.removeEventListener('deviceorientationabsolute', me.handleCompassChange);
                        window.removeEventListener('ondeviceorientation', me.handleCompassChange);
                        me.handleCompassChange = undefined;
                    }

                    me.myEvent = event;
                    if (me.firstEvent) {
                        me._activeProcess.unblock(setBlock_compassReading)
                        me.firstEvent = false;
                        return
                    }


                    jsbCall(me.compassHeadingCallBackFName, me.compassHeadingCallBackIName, function (continueEvents) {
                        if (!continueEvents) {
                            window.removeEventListener('deviceorientationabsolute', me.handleCompassChange);
                            window.removeEventListener('ondeviceorientation', me.handleCompassChange);
                            me.handleCompassChange = undefined;
                        }
                        me.nested -= 1;
                    }, me.myEvent);
                };

                me._activeProcess.setBlock(setBlock_compassReading, me, "GOTFIRSTEVENT")
                if (me.hasAbsoluteOrientation()) {
                    window.addEventListener('deviceorientationabsolute', me.handleCompassChange);
                } else {
                    window.addEventListener('deviceorientation', me.handleCompassChange);
                }

                // Exit here and come back when we have the 1st event

                return


            case "GOTFIRSTEVENT":

                me.nested--;

                return me.myEvent;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </COMPASSHEADING>

// <CONNECTIONTYPE>
async function JSB_BF_CONNECTIONTYPE(Accountname) {
    return await JSB_BF_TYPEOFCONNECTION(CStr(Accountname));
}
// </CONNECTIONTYPE>

// <CONVERT2HTML>
async function JSB_BF_CONVERT2HTML(Mix, Embedded) {
    // local variables
    var O, I, Leftpart, J, Nextpart;

    // Make pure html - htmlEncode anything not between chr(28) ... chr(29)
    O = '';

    while (CBool(Mix)) {
        I = InStr1(1, Mix, Chr(28));
        if (CBool(I)) {
            Leftpart = Left(Mix, +I - 1);
            if (Not(Embedded)) Leftpart = htmlEscape(Leftpart);
            O += CStr(Leftpart);

            // Look for my tail
            Mix = Mid1(Mix, +I + 1);

            J = InStr1(1, Mix, Chr(29));
            if (Not(J)) {
                Print(); debugger;
                J = Len(Mix) + 1;
            }

            Nextpart = Left(Mix, +J - 1);

            if (InStr1(1, Nextpart, Chr(28))) {
                Mix = await JSB_BF_CONVERT2HTML(Mix, true);
                if (Count(Mix, Chr(29)) > 1) { Print(); debugger; }
                return CStr(O) + Change(Mix, Chr(29), '');
            }

            O += CStr(Nextpart);
            Mix = Mid1(Mix, +J + 1);
        } else {
            if (CBool(Embedded)) O += CStr(Mix); else O += htmlEscape(Mix);
            Mix = '';
        }
    }
    return O;
}
// </CONVERT2HTML>

// <CORDOVA>
function Cordova() {
    return window.isPhoneGap();
}
// </CORDOVA>

// <CREATEACCOUNT>
async function JSB_BF_CREATEACCOUNT(Newactname) {
    // local variables
    var Result;

    if (Not(Newactname)) { activeProcess.At_Errors = 'Empty account name'; return false; }
    if (await JSB_BF_ACCOUNTEXISTS(CStr(Newactname))) { activeProcess.At_Errors = CStr(Newactname) + ' already exists.'; return false; }

    if (window.dotNetObj) {
        Result = dotNetObj.dnoCreateFile('', dotNetObj.dnoMapRootAccount(Newactname));
        if (Left(Result, 2) == '**') {
            activeProcess.At_Errors = Result;
            return false;
        }
    } else {
        if (await asyncCreateDB(Newactname)); else return false;
    }

    return true;
}
// </CREATEACCOUNT>

// <DATAADDITIONALATTRIBUTES>
function dataAdditionalAttributes(Oadditionalattributes) {
    // local variables
    var Atr;

    var Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ' ', Oadditionalattributes);
    var Uielements = [undefined, 'class', 'style', 'on', 'placeholder'];
    var Result = [undefined,];

    for (Atr of iterateOver(Additionalattributes)) {
        var F1 = Field(Atr, '=', 1);
        if (Left(F1, 2) == 'on') F1 = 'on';
        if (Locate(F1, Uielements, 0, 0, 0, "", position => { })); else Result[Result.length] = Atr;
    }
    return Join(Result, ' ');
}
// </DATAADDITIONALATTRIBUTES>

// <DATASET2JSON>
async function JSB_BF_DATASET2JSON(Dataset, Foldercolumnname, Leafcolumnname) {
    var _Jsontree = undefined;
    var Treeleafs = undefined;
    var Leafname = '';
    var Lastfolder = '';
    var Row = undefined;

    Dataset = JSB_BF_SORTJSONARRAY(CStr(Dataset), CStr(Foldercolumnname), true);

    _Jsontree = {};
    Lastfolder = '';

    for (Row of iterateOver(Dataset)) {
        if (Null0(Lastfolder) != Null0(Row[Foldercolumnname])) {
            if (Lastfolder) _Jsontree[Lastfolder] = Treeleafs;
            Lastfolder = Row[Foldercolumnname];
            Treeleafs = {}
        }
        Leafname = Row[Leafcolumnname];
        Treeleafs[Leafname] = { "data": Row, "pkID": Leafcolumnname };
    }

    return _Jsontree;
}
// </DATASET2JSON>

// <DATETIME>
function DateTime(N) {
    if (N === undefined) return DateTime(Now());
    if (isNumeric(N)) {
        return r83Date(N) + ' ' + r83Time(N); // Year-Month-Day Ti:Me:00;
    }
    return r83Date(N); // Convert String Into Numeric
}
// </DATETIME>

// <DAYSINMONTH>
function DaysINMonth(Month) {
    var Days = '';

    Days = '31,28,31,30,31,30,31,31,30,31,30,31';
    return Field(Days, ',', Month);

}
// </DAYSINMONTH>

// <DBGBTNCMD>
function dbgBtnCmd(Cmd, Lbl, Picadr) {
    // local variables
    var Size;

    if (window.isPhoneGap()) Size = 'style=\'height:50px\' ';
    if (CBool((Picadr))) { return '\<input type=\'image\' ' + CStr(Size) + 'class=\'dbgPicBtn\' src="' + Change(Picadr, '"', '\\"') + '" alt=\'' + CStr(Lbl) + '\' onclick=\'dbgPostCommand("' + CStr(Cmd) + '")\' /\>&nbsp;'; } else { return '\<button class=\'dbgBtn\' value=\'" + cmd + "\' onclick=\'dbgPostCommand("' + CStr(Cmd) + CStr(+'")\' \>' + CNum(htmlEscape(Lbl)) + +'\</button\>&nbsp;'); }
}
// </DBGBTNCMD>

// <DBGFETCHSOURCE>
async function JSB_BF_DBGFETCHSOURCE(ByRef_Filename, ByRef_Itemname, ByRef_Dbg_Lastfname, ByRef_Dbg_Lastiname, ByRef_Dbg_Source, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Filename, ByRef_Itemname, ByRef_Dbg_Lastfname, ByRef_Dbg_Lastiname, ByRef_Dbg_Source)
        return v
    }
    if (Null0(ByRef_Filename) != Null0(ByRef_Dbg_Lastfname)) {
        ByRef_Dbg_Lastfname = ByRef_Filename;
        if (await JSB_ODB_OPEN('', CStr(ByRef_Dbg_Lastfname), Commons_JSB_BF.Dbg_File, function (_Dbg_File) { Commons_JSB_BF.Dbg_File = _Dbg_File })); else Commons_JSB_BF.Dbg_File = '';
        ByRef_Dbg_Source = '';
        ByRef_Dbg_Lastiname = '';
    }

    if (Null0(ByRef_Itemname) != Null0(ByRef_Dbg_Lastiname)) {
        ByRef_Dbg_Lastiname = ByRef_Itemname;
        if (CBool(Commons_JSB_BF.Dbg_File)) {
            if (await JSB_ODB_READ(ByRef_Dbg_Source, Commons_JSB_BF.Dbg_File, CStr(ByRef_Dbg_Lastiname), function (_ByRef_Dbg_Source) { ByRef_Dbg_Source = _ByRef_Dbg_Source })); else ByRef_Dbg_Source = 'NO SOURCE ITEM ' + CStr(ByRef_Dbg_Lastiname);
        } else {
            ByRef_Dbg_Source = 'NO SOURCE FILE ' + CStr(ByRef_Dbg_Lastfname);
        }
        return exit(true);
    }

    return exit(false);
}
// </DBGFETCHSOURCE>

// <DBGSTKCMD>
function dbgStkCmd(Cmd, Lbl, Saveposition) {
    return '\<button class=\'dbgStkBtn\' value=\'' + CStr(Cmd) + '\' onclick=\'dbgPostCommand("' + CStr(Cmd) + CStr(+'")\' \>' + CNum(htmlEscape(Lbl)) + +'\</button\>&nbsp;');
}
// </DBGSTKCMD>

// <DBISREADONLY>
async function JSB_BF_DBISREADONLY(Dbname) {
    // local variables
    var Attacheddb, Cmd, Sl, E;

    var onError;
    var gotoLabel = "";
    atgoto: while (true) {
        try {
            switch (gotoLabel) {
                case "":
                    Attacheddb = At_Session.Item('ATTACHEDDATABASE');

                    onErrorGoto = "ERROUT";
                    if (Not(Attacheddb)) { if (await JSB_ODB_ATTACHDB('databaseBuilder_rw')); else { gotoLabel = "ERROUT"; continue atgoto; } }

                    Cmd = 'SELECT name, state_desc, create_date, user_access, is_read_only, recovery_model_desc FROM sys.databases WHERE name = \'' + CStr(Dbname) + '\'';
                    if (await asyncDNOSqlSelect(Cmd, _selectList => Sl = _selectList)) Sl = getList(Sl); else Sl = [undefined,];
                    if (await JSB_ODB_ATTACHDB(CStr(Attacheddb))); else null;

                    if (Not(Sl)) return true;
                    return Sl[1].is_read_only;


                case "ERROUT":

                    activeProcess.At_Errors = CStr(activeProcess.At_Errors) + crlf + CStr(Cmd);

                    E = activeProcess.At_Errors;
                    if (await JSB_ODB_ATTACHDB(CStr(Attacheddb))); else null;
                    activeProcess.At_Errors = E;
                    return false;


                default:
                    throw "we entered an invalid gotoLabel: " + gotoLabel;
            } // switch
        } catch (err) {
            err = err2String(err);
            if (err.startsWith('*STOP*')) throw err;
            if (err.startsWith('*END*')) throw err;
            if (_onErrorGoto) {
                gotoLabel = _onErrorGoto;
                if (err.message) activeProcess.At_Errors = err.message; else activeProcess.At_Errors = err;
            } else throw err;
        }
    } // agoto while
}
// </DBISREADONLY>

// <DBNEXTPRIMARYKEY>
async function JSB_BF_DBNEXTPRIMARYKEY(Tablename, Primarykeyname) {
    // local variables
    var Id;

    var F = undefined;
    if (await JSB_ODB_OPEN('', CStr(Tablename), F, function (_F) { F = _F })); else return 1;

    if (isSqlServer(F)) {
        return CNum(SQL('select Max([' + CStr(Primarykeyname) + ']) from [' + CStr(Tablename) + ']')) + 1;
    }

    var Sl = undefined;
    if (await JSB_ODB_SELECTTO('', F, '', Sl, function (_Sl) { Sl = _Sl })); else return 1;

    var X = getList(Sl);
    var Lastid = 0;

    for (Id of iterateOver(X)) {
        if (Null0(Id) > Lastid) Lastid = Id;
    }

    return Lastid + 1;
}
// </DBNEXTPRIMARYKEY>

// <DEBUGGER_Sub>
async function JSB_BF_DEBUGGER_Sub(Fromobj, Ilineno) {
    // local variables
    var Holdstepover, Holdsinglestepping, Holdmodalstep, Holderrors;
    var Dbgfname, Dbginame, Dbginfolineno, Newsource, Doedit, Mycommons;
    var Name, Llines, Line, Lvars, Lclparamnames, Symcount, I;
    var Symname, Dbginfosrc, Word, Needdots, R, Fname, Iname, Lineno;
    var Rs, Ddbtns, Maxwidth, Maxheight, Ocmd, Cmd, Varname, V;
    var V2, Filename, Brklineno;

    var ddDiv = undefined, ddScreen = undefined;
    if (Not(Fromobj)) return;

    // This block of code runs before any process events
    Holdstepover = Fromobj._stepOver;
    Holdsinglestepping = singleStepping;
    Holdmodalstep = 0;
    activeProcess.modalStep = 0;

    Holderrors = activeProcess.At_Errors;
    window.dbgEditingObj = Fromobj;

    Fromobj._stepOver = 0;
    singleStepping = 0;
    stepOutLevel = 0;

    // Dbg_Fromobject = fromObj
    Dbgfname = UCase(Fromobj._fileName);
    Dbginame = UCase(Fromobj._itemName);
    Dbginfolineno = Field(Ilineno, '_', Count(Ilineno, '_') + 1);

    // Allow other process to run now
    FlushHTML();

    // Get Source (Dbg_Source)
    Newsource = await JSB_BF_DBGFETCHSOURCE(Dbgfname, Dbginame, Commons_JSB_BF.Dbg_Lastfname, Commons_JSB_BF.Dbg_Lastiname, Commons_JSB_BF.Dbg_Source, function (_Dbgfname, _Dbginame, _Dbg_Lastfname, _Dbg_Lastiname, _Dbg_Source) { Dbgfname = _Dbgfname; Dbginame = _Dbginame; Commons_JSB_BF.Dbg_Lastfname = _Dbg_Lastfname; Commons_JSB_BF.Dbg_Lastiname = _Dbg_Lastiname; Commons_JSB_BF.Dbg_Source = _Dbg_Source });
    if (CBool(Newsource)) Commons_JSB_BF.Dbg_Srclinecnt = DCount(Commons_JSB_BF.Dbg_Source, am);

    if (Not(Commons_JSB_BF.Stop_Png)) {
        Commons_JSB_BF.Stop_Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAJOSURBVDjLpZI9T1RBFIaf3buAoBgJ8rl6QVBJVNDCShMLOhBj6T+wNUaDjY0WmpBIgYpAjL/AShJ+gVYYYRPIony5IETkQxZ2770zc2fGYpflQy2MJzk5J5M5z/vO5ESstfxPxA4erL4Zuh4pLnoaiUZdq7XAGKzRJVbIBZ3JPLJaD9c/eCj/CFgZfNl5qK5q8EhTXdxxLKgQjAFr0NK0ppOpt9n51D2gd2cmsvOElVcvOoprKvuPtriNzsY8rH+H0ECoQEg4WklY1czP8akZby51p6G3b6QAWBl43llSVTlUfuZE3NmYh9Vl0HkHSuVq4ENFNWFdC+uJ5JI/9/V2Y//rkShA1HF6yk/VxJ0f07CcgkCB7+fSC8Dzcy7mp4l9/khlUzwecaI9hT+wRrsOISylcsphCFLl1RXIvBMpYDZJrKYRjHELACNEgC/KCQQofWBQ5nuV64UAP8AEfrDrQEiLlJD18+p7BguwfAoBUmKEsLsAGZSiFWxtgWWP4gGAkuB5YDRWylKAKIDJZBa1H8Kx47C1Cdls7qLnQTZffQ+20lB7EiU1ent7sQBQ6+vdq2PJ5dC9ABW1sJnOQbL5Qc/HpNOYehf/4lW+jY4vh2tr3fsWafrWzRtlDW5f9aVzjUVj72FmCqzBypBQCKzbjLp8jZUPo7OZyYm7bYkvw/sAAFMd7V3lp5sGqs+fjRcZhVYKY0xupwysfpogk0jcb5ucffbbKu9Esv1Kl1N2+Ekk5rg2DIXRmog1Jdr3F/Tm5mO0edc6MSP/CvjX+AV0DoH1Z+D54gAAAABJRU5ErkJggg==';
        Commons_JSB_BF.Stepinto_Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGmSURBVDhPxVM/LENBGP9e716TpgsDFk3qkUgHMdgM9A2UQTpIGEmMJJgM7P5Gi8HCwGAgHYShjaWbRGKQbo2BSJ+Upf5ERe/u+e5cMD0Ng9/Ll9+9993vu/t+985wXRf+Ap/mX8PoWelyqUnB9FOQTP0ETMkqCBCTpiklGUJJat3evtG6Txj2fKfb2xUD6sMiBEUGMiWKKb4/lB/g8a0ETtk5xCKL69HtU61V8LEKByEwXA4cWT1cAHcxhICAPwBWbQu01kTigomZyexYSGsVKGMMMtkMbh1XVi18cbghDM0NLcCpgPpgPTxXnuLOSyGLuuSHHFvwOoWhnYEEejEYjdghkxAos1fI3V+kN2O7/XqK9ynsjxxNswpLXd5doh8mBM2gbK9DpxV+PEZZ5Lp4hT4JZTRnvE6nFKr6D6TR0mAhjcXxd3h60LvaPYuGDluNVlt7UzsQH4F8MQ+3T4UcerO3NbC34LkDXHkB45wxDkwwFQLH2MYZxrKcU9Vd6EtEN6yQNWFSCk7JWTsYPZ7SqeoKSPQl7SVs5+1o/GROf1L479sI8A4OSbV1XPz1BQAAAABJRU5ErkJggsNkJVmlHFYWFoZnH55NBMZAAUicaANAAJTRgN75tTl7dw1EhIEBAHbJ07eglCKRAAAAAElFTkSuQmCC';
        Commons_JSB_BF.Stepout_Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAABGdBTUEAAK/INwWK6QAAAPBQTFRFAAAAm8KYosielb6Qaathbq9lnsmZjLiHaKphl82Pms+SdrZtm8qVpciiaqVjbK5km8+TntGWeLpwe7tzttuxUpxKndCUotOZX6xVVqFNoNKXpNSbYrFYoMqbdbhtotSZcrtpbK9kmc6RntGUlc2Mk8yLOX4zPoM3Qok7R44/S5RDUJlHVJ9LdLZro9Sbp9aehcZ7vuK5PYI3hcN+icaCjciGkcuKlsyOm9CSptWdkcuImdCR7/jtQYc6h8WBi8eFkMqJlMuNmc+QodOYksqJhMR5mNCR3vHcRYw+SZFCTpdGVqJNW6dRY7FYvuG57vjtxkl/EgAAAAF0Uk5TAEDm2GYAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAB6SURBVBjTY2AgATAyofKZWVjZkPnsHJxc3DwIPi8fv4CgkLAIkhJRMXEJFDMkpaRlkPmycvJSCsh8RSVlFVUQS01dQ1NLW0eXU0/fwBAkYGRsYmpmziVoYWllbQMSsLWzd3B0EnN2cXVzB2v28PQS9faR8DXz8yfSiwBcMA0tXgiHdAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxMy0xMC0xMVQyMTowNDoyMSswMjowMHTg6gsAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTMtMTAtMTFUMjE6MDQ6MjErMDI6MDAFvVK3AAAAGnRFWHRTb2Z0d2FyZQBQYWludC5ORVQgdjMuNS4xMDD0cqEAAAAASUVORK5CYII=';
        Commons_JSB_BF.Stepover_Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAAAlwSFlzAAAOwwAADsMBx2+oZAAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAACUklEQVQ4T6VS7U9SYRx18++gVZZOp7PsRcii1MqZptksSVKQJQm+dH3hRTFwBmkY41UURVEpza0trBwaIMNlbcYg0Oq7H/kf2unhbhA3t7bWh3N2n+ec39m99/yyAPwXGIcGZzXr7uJNqnm5wdv6ujEhWuMlxOt8r2SzleoKtLEyvSmkH6rNFZy6qese6m0HxrY1mI6Y4IzZYA3rod0ZgvSDwNO9JeJkDidBU/nYBdY1A9cjX++B9csETLtjcETNmI9NYi5mxcr3eVjC45D6SEhQxHgTmi6NllJCdzMmPuvI8DM8/6TD0GYfNH45ZiJmvPzmxOqPBeh2VOj0CalDARz1GS+1JoUmpIQupEaNrfLglqPK2OiqMfJe1B/MRC1Y2LPDHjGgY6PFeyjg/OCpxLBfhqcfNRAu3UOV8YoxZbizUGuUb3TDvT+Lxb1ptL9vTqS0JGgqkRX9fBxUYnR7GJd1bHL125AECSHDDvpTRJ4mhk5TMVWA4S05RkKDKBs5xzAkQeolP9SOpX0HSL0MnabCrjwMBgagDirAVpUwDEmQejEbtcIVnwJ/pYGh05QvOQmFvxdDJOSsophhSOKGpQIOshdzX21octcxdJpy249jwEdBGejD6f7CtIHUqyofL4s/WG7BZNhA70bvOwl47vr4/dXbynRAjugo+je7ISMhRT356QBSbzb3SamrjeyIeVcPGwl59EYMUq+T1JudDjgmOIITJCRPnIOCztx0QApcLdsqcvPx8JUAtbarpkyNYfwbSL36Sv1F7Z/3jMO/A1m/AGfCpoCxST22AAAAAElFTkSuQmCC';
        Commons_JSB_BF.Run_Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAEsSURBVDjLY/j//z8DJZhhmBuQvdj8a+p8w//xc3U5yTIgeb7h18bNUf/DZ2j8958qz0nQgPyltv9zF5v/TV9o/Ddxrv7fmvWh/1ednvi/ZLX/f9d+8b+23YI8eA0AOvn/hnPT/q89OwWsccXpCf8n7Cn5v/B41/+MpW7/TdvZ/+o2M/LjNADoZLDmvl35/zt3ZP9v3Zb2v2Fz4v+mren/Zxxq/h+zwOa/aj3DH5wGRM/W/L/y1IT/S0/0/l94rOv/vKMdQEOy/k8/1PQ/banHf8VahlfSlQwGOA0InK74z3Oi9D/nftF/1t38/+LmW/2fdrDhf9Jit//ytQzPJSsZtEiKBe1mxq/xC53/y1czPAFqVic5GoFO/ipXzfxftJJBkeyUKFzOwDm48wIAh5XH+g7drOwAAAAASUVORK5CYII=';
        Commons_JSB_BF.Resume_Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAOCAIAAABCerDeAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH1wYFEyINvBKkEQAAAAd0RVh0QXV0aG9yAKmuzEgAAAAMdEVYdERlc2NyaXB0aW9uABMJISMAAAAKdEVYdENvcHlyaWdodACsD8w6AAAADnRFWHRDcmVhdGlvbiB0aW1lADX3DwkAAAAJdEVYdFNvZnR3YXJlAF1w/zoAAAALdEVYdERpc2NsYWltZXIAt8C0jwAAAAh0RVh0V2FybmluZwDAG+aHAAAAB3RFWHRTb3VyY2UA9f+D6wAAAAh0RVh0Q29tbWVudAD2zJa/AAAABnRFWHRUaXRsZQCo7tInAAABAElEQVR4nGP8//8/A1mAiTxtDAwMLHDWxZ2Z754c+PWHgYGBQULBQd99unlzPAMDw8nahQR0vrixwyHjBIR9YIaFvjsDAwNDma8BLv0sKLwfJ9Ckv/35m+Opy8jwH1M/QuePHxDqBQOHBJTNwPDx128II9ZZk4GBQa82UkSJe1/iHHQ7f3z4wfHjxQ8OAbjI0WevkRVo60kyMDLo1UZeal6O6lpU8P3Xr69/vsJ4/6EEIzZ/cghwMHzg4BDggDrh5w8RDk6oHON/BgaGI0c/yGgKX2pejubPHwwMDAwCGgg2AwMP2z+IhTsOfGJgYLjVtR6uHtW1HBZoDuZm/b92N7oedJ0S4yViJQAAABxJREFUCh4rGgwgbAUNDwhj7e5PmHpgzqd/ugUAISFoE39yu5MAAAAASUVORK5CYII=';
        Commons_JSB_BF.Stepinout_Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAIESURBVDhPjZPPaxNBFMe/szuTxIK1lxQLqdoNVA/GRf+BVhQbCjaI0Bxb8eSv2h6KB715EQVjUTwI/gIRUSLU2JZSUQS9iF7MrbYsGJtSekmzKTG7s7vOrqtltWzzgcfMvO/M4703M8RxHPzBdmySudt3lXOLzVx8e8l3h/I3gAOHZB8N5DraOkZMzqGVtDszY+9GPDEEMvxyUNYr63Kj3igm4p3davIAZEnGwvI3lPWlB5SxMw9PPDP8/f8hyVQe5yYvEEJ2USqDStQzScyF1i9TadLfuymBEk7ls/aRvUdhWiamPk8jf3qKeGIIkj8GYJQhmUj6q3ACASLbIqviJvxVcwRKODs7NJ2Kq2lKGLhjwh1jLIq1+hqqRgVVrmPdrE2KvlyY6L1fcs8FMhBNm331voCWSIvvAWpGDVEaw+42BQfbD2GhqGUsyz7pyxsBiEiGynJ+n9rtfK9ojrai4c3XObRGd6A1th3Vhsjip45MzwAsbvX5xzZKCGPw8fHcnp1do6nEfti2jY+lD6v3+p+0u9qmt/Avz4cKY4s/FmFyExKRYNSNuC9tncGxmz2XGaNZJaGk1C7Ve6XzK/NY1peKlNGnW2bATeuasC/ig4Hb3DNbzEUfPgm70VQPXNK53ttKp3KeUYpypTzxYvj1qOtvOoBL+tbh66Ico3Bu7spvD/ALZd3XvAhqpXQAAAAASUVORK5CYII=';
    }

    // Start building output (ddDiv)
    // if newSource || !ddDiv then

    if ($('jsbSrcDialog').length) return;

    ddDiv = $('\<div id=\'jsbSrcDialog\' class=\'dbgDialog\' /\>').hide();
    ddDiv.appendTo('body');
    $(ddDiv).css('z-index', 0);
    $(ddDiv).css('z-index', nextZIndex());

    // =======================================================================================
    // Add Header
    // =======================================================================================
    Doedit = Field(Field(JSB_BF_URL(), '#', 1), '?', 1) + '?' + urlEncode('ED ' + CStr(Dbgfname) + ' ' + CStr(Dbginame));
    if (isNumeric(Dbginfolineno)) Doedit = CStr(Doedit) + ' (' + CStr(Dbginfolineno);

    if (CBool((Fromobj._activeProcess.TclProhibited))) {
        ddDiv.append('\<div id=\'dbgHeader\' class=\'dbgHeader\'\>' + dbgBtnCmd('R', 'Run', Commons_JSB_BF.Run_Png) + '\<a target=\'_blank\' style:\'vertical-align: top;\' href=\'' + CStr(Doedit) + '\'\>' + CStr(Dbgfname) + '&nbsp;' + CStr(Dbginame) + ':' + CStr(Dbginfolineno) + '\</a\>\</div\>');
    } else {
        ddDiv.append('\<div id=\'dbgHeader\' class=\'dbgHeader\'\>' + dbgBtnCmd('Q', 'Quit', Commons_JSB_BF.Stop_Png) + dbgBtnCmd('R', 'Run', Commons_JSB_BF.Run_Png) + '\<a target=\'_blank\' style:\'vertical-align: top;\' href=\'' + CStr(Doedit) + '\'\>' + CStr(Dbgfname) + '&nbsp;' + CStr(Dbginame) + ':' + CStr(Dbginfolineno) + '\</a\>\</div\>');
    }

    if (window.isPhoneGap()) $(ddDiv).css('height', '61px');

    // =======================================================================================
    // Build Symbol Table
    // =======================================================================================
    dbgSymList = [undefined,];

    window.dbgAddVar = function (Name) { if (Left(Name, 1) != '_') dbgSymList[dbgSymList.length] = Name; };

    if ((Not(Fromobj._activeProcess.TclProhibited))) {
        Mycommons = window['Commons_' + CStr(Dbgfname)];
        if (CBool(Mycommons)) {
            for (Name of iterateOver(Mycommons)) {
                window.dbgAddVar(Name);
            }
        }

        Llines = Split(Change(Change(window[Fromobj._functionName], '\r\n', '\n'), '\n', '\n '), ' var ');
        Llines.delete(1);
        for (Line of iterateOver(Llines)) {
            Lvars = Split(Change(Change(Field(Line, '\n', 1), ';', ','), ' ', ''), ',');
            for (Name of iterateOver(Lvars)) {
                Name = Field(Name, '=', 1);
                window.dbgAddVar(Name);
            }
        }

        Lclparamnames = Split(Change(Field(Field(Field(window[Fromobj._functionName], '\n', 1), '(', 2), ')', 1), ' ', ''), ',');
        if (Lclparamnames[UBound(Lclparamnames)] == 'setByRefValues') Lclparamnames.delete(UBound(Lclparamnames));
        for (Name of iterateOver(Lclparamnames)) {
            window.dbgAddVar(Name);
        }
    }

    Symcount = DCount(dbgSymList, Chr(254));
    window.realName = {};
    var _ForEndI_11 = UBound(dbgSymList);
    for (I = LBound(dbgSymList); I <= _ForEndI_11; I++) {
        Symname = dbgSymList[I];
        if (Left(Symname, 6) == 'ByRef_') Symname = Mid1(Symname, 7);
        window.realName[LCase(Symname)] = dbgSymList[I];
    }

    // =======================================================================================
    // Split source up into identifiers
    // =======================================================================================

    // \b is word boundary (white space)
    Dbginfosrc = window.htmlEscape(Commons_JSB_BF.Dbg_Source);
    Dbginfosrc = (Change(Dbginfosrc, ' ', '&nbsp;'));
    Dbginfosrc = (Change(Dbginfosrc, '"', '&quot;'));
    Dbginfosrc = Change(Dbginfosrc, '\r\n', am);
    Dbginfosrc = Change(Dbginfosrc, '\n', am);
    Dbginfosrc = Change(Dbginfosrc, '\r', am);
    Dbginfosrc = (regExp(Dbginfosrc, '\\b[a-zA-Z][a-zA-Z0-9_]*\\b', sm + '$&' + sm));
    Dbginfosrc = Split(Dbginfosrc, sm);

    // =======================================================================================
    // check each identifier and see if it's a variable
    // =======================================================================================
    var _ForEndI_13 = UBound(Dbginfosrc);
    for (I = LBound(Dbginfosrc); I <= _ForEndI_13; I++) {
        Word = Dbginfosrc[I];
        if (CBool(Word) && window.realName[LCase(Word)]) {
            Dbginfosrc[I] = '\<word\>' + CStr(Dbginfosrc[I]) + '\</word\>';
        }
    }

    // =======================================================================================
    // Build SRC
    // =======================================================================================
    Dbginfosrc = Join(Dbginfosrc, '');
    var Src = Split(Dbginfosrc, am);

    Commons_JSB_BF.Dbg_Nsrc = [undefined,];
    var _ForEndI_15 = UBound(Src);
    for (I = LBound(Src); I <= _ForEndI_15; I++) {
        Commons_JSB_BF.Dbg_Nsrc[I] = ('\<div class=\'dbgSrcLine dbgSrcLineNo_' + CStr(I) + '\'\>\<span class=\'dbgLineNums dbgLineNo_' + CStr(I) + '\'\>' + CStr(I) + '\</span\>' + '&nbsp;' + CStr(Src[I]) + '\</div\>');
    }

    Commons_JSB_BF.Dbg_Nsrc = Join(Commons_JSB_BF.Dbg_Nsrc, '');

    // put new src in div
    ddDiv.append('\<div id=\'dbgTextDiv\'\>' + CStr(Commons_JSB_BF.Dbg_Nsrc) + '\</div\>');
    if (window.isPhoneGap()) $('#dbgTextDiv').css('bottom', '61px').css('top', '50px');

    // =======================================================================================
    // build call stack
    // =======================================================================================
    var Stksubs = callStack(true);
    var Cs = [undefined,];
    var Scs = '';
    Needdots = false;

    for (R of iterateOver(Stksubs)) {
        var Rp = Split(R, ':');
        if ((Null0(Rp.length) >= 3)) {
            Fname = Rp[1];
            Iname = Rp[2];
            Lineno = Rp[3];
            Rs = CStr(Fname) + ' ' + CStr(Iname) + ' ' + CStr(Lineno);

            if ((Null0(Fname) == Null0(Dbgfname) && Null0(Iname) == Null0(Dbginame))) {
                Cs[Cs.length] = '\<option value=\'#' + CStr(Lineno) + '\' \>' + htmlEscape(Rs) + '\</option\>';
            } else {
                Cs[Cs.length] = '\<option value=\'' + CStr(Rs) + '\' \>' + htmlEscape(Rs) + '\</option\>';
            }

            // put last two on menu

            if ((Null0(I) >= CNum(Stksubs.length) - 3)) {
                if ((Null0(Rp[1]) == Null0(Dbgfname) && Null0(Rp[2]) == Null0(Dbginame))) {
                    Scs = (CStr(Scs) + '\<button class=\'dbgStkBtn\' onclick=\'alert(' + CStr(Lineno) + ')\' \>' + htmlEscape(Rs) + '\</button\>&nbsp;');
                } else {
                    Scs = CStr(Scs) + dbgStkCmd(Rs, Rs, true);
                }
            } else {
                Needdots = true;
            }
        }
    }
    if (CBool(Needdots)) Scs = CStr(Scs) + ' ... ';

    var Callstack = '\<select id=\'clsDbgStk\' onchange=\'stackSelect(this)\'\>\<option\>\</option\>' + Join(Cs, '') + '\</select\>';

    window.stackSelect = function (sel) { // Scroll to position
        var v = sel.value;
        //newSource = @dbgFetchSource(dbgFName, dbgIName, Dbg_LastFName, Dbg_LastIName, Dbg_Source) 
        //If newSource Then Dbg_srclinecnt = Dcount(Dbg_Source, Am())
        //debugger;
    };

    // =======================================================================================
    // build pop up display when hovering over variables
    // =======================================================================================
    window.dbgGetVariable = (function (Name, forDisplay) {
        var fromObj = window.dbgEditingObj;
        var vo = null;

        if (fromObj.localValue) vo = fromObj.localValue(Name);

        var myCommons = window['Commons_' + UCase(fromObj._fileName)]
        if (myCommons && myCommons.hasOwnProperty(Name)) vo = myCommons[Name];


        if (!forDisplay) return vo;
        var t = typeOf(vo);
        if (isNull(vo)) t = "NULL"
        switch (t) {
            case 'Array':
                t = 'Array[' + CStr(Len(vo)) + ']: ';
                vo = json2string(vo, true);
                break;
            case 'Selectlist':
                vo = json2string(vo, true);
                break;
            case 'JSonObject':
                vo = json2string(vo, true);
                break;
            default:
                vo = Change(CStr(vo), Chr(27), '%27');
                vo = Change(vo, Chr(28), '%28');
                vo = Change(vo, Chr(29), '%29');
                vo = Change(vo, am, "{AM}");
        }
        vo = t + ': ' + Left(vo, 800) + Left('...', Len(vo) - 800);
        vo = Change(htmlEscape(vo))
        vo = Change(vo, crlf, "<br>")
        vo = Change(vo, lf, "<br>")
        vo = Change(vo, cr, "<br>")
        vo = Change(vo, " ", "&nbsp")

        return vo;
    });

    window.dbgSetVariable = (function (Name, newVal) {
        var oldVal = window.dbgGetVariable(Name);
        var fromObj = window.dbgEditingObj
        var isCommons = oldVal == 'undefined' || !fromObj;
        var myCommons;
        var e;

        if (isCommons) {
            myCommons = window['Commons_' + UCase(fromObj._fileName)]
            if (!myCommons || !myCommons.hasOwnProperty(Name)) isCommons = false;
        }

        if (isCommons) {
            myCommons[Name] = newVal;
        } else if (fromObj.localValue) {
            try {
                return fromObj.localValue(Name + " = " + newVal);
            } catch (e) { };
            try {
                return fromObj.localValue(Name + " = '" + Replace(newVal, "'", "\\'") + "'");
            } catch (e) { alert(e); };
        } else {
            alert("unable to set variable");
        }

        return null;
    });

    var Opts = [undefined,];
    var _ForEndI_22 = UBound(dbgSymList);
    for (I = LBound(dbgSymList); I <= _ForEndI_22; I++) {
        Symname = dbgSymList[I];
        if (Left(Symname, 1) != '_') Opts[Opts.length] = '\<option\>' + CStr(Symname) + '\</option\>';
    }
    var Symbols = '\<select id=\'clsDbgVars\' onchange=\'varSelect(this)\'\>\<option\>\</option\>' + Join(Opts, '') + '\</select\>';

    window.varSelect = function (sel) {
        if ($(sel).prop('nodeName') == "DIV") {
            var Name = $(sel).prop('varname')
        } else if ($(sel).prop('nodeName') == "WORD") {
            var Name = $(sel).text()
        } else {
            var Name = Field(sel.value, ":", 1)
        }

        Name = window.realName[Name.toLowerCase()];
        $("#clsDbgVars").val([]);
        var vo = dbgGetVariable(Name)

        switch (typeOf(vo)) {
            case 'Array':
                vo = json2string(vo, true);
                break;
            case 'Selectlist':
                vo = json2string(vo, true);
                break;
            case 'JSonObject':
                vo = json2string(vo, true);
                break;
            default:
                vo = CStr(vo);
        }

        var html = '<textarea id="popvariable" rows=4 style="width: 95%" class="text-hidden">' + htmlEscape(vo) + '</textarea>'
        $('#jsbSrcDialog').attr('id', 'jsbSrcDialog2').hide()

        MsgBox("Editing " + Name, html, "OK,Cancel", "80%", null, function (msgBoxAnswer) {
            $('#jsbSrcDialog2').attr('id', 'jsbSrcDialog').show()
            if (msgBoxAnswer != "OK") return;
            var fromObj = window.dbgEditingObj;
            var newVal = $("#popvariable").val();
            window.dbgSetVariable(Name, newVal)
        })
    };

    // =======================================================================================
    // Build Debug command Buttons
    // =======================================================================================

    if (window.isPhoneGap()) { Ddbtns = '\<div class=\'dbgCmdBtns\' style=\'height:60px; font-size: xx-large;\' \>'; } else Ddbtns = '\<div class=\'dbgCmdBtns\' \>';
    Ddbtns = (CStr(Ddbtns) + dbgBtnCmd('N', '&#10552; Step Over', Commons_JSB_BF.Stepover_Png) + '\<small\>(F6) \</small\>'); // http://character-code.com/arrows-html-codes.php
    Ddbtns = (CStr(Ddbtns) + dbgBtnCmd('I', '&#10549;Step Into', Commons_JSB_BF.Stepinto_Png));
    Ddbtns = CStr(Ddbtns) + dbgBtnCmd('O', '#10548;Step Out', Commons_JSB_BF.Stepout_Png);
    Ddbtns = (CStr(Ddbtns) + dbgBtnCmd('M', '&#10174;Step InOut', Commons_JSB_BF.Stepinout_Png));
    if ((Not(Fromobj._activeProcess.TclProhibited))) Ddbtns = CStr(Ddbtns) + dbgBtnCmd('Q', 'Quit', Commons_JSB_BF.Stop_Png);
    Ddbtns = CStr(Ddbtns) + dbgBtnCmd('R', 'Run', Commons_JSB_BF.Run_Png) + '\<small\>(F5) \</small\>';

    Ddbtns = (CStr(Ddbtns) + '&nbsp;&nbsp;\<small\>Vars:\</small\>');
    Ddbtns = CStr(Ddbtns) + CStr(Symbols);
    Ddbtns = (CStr(Ddbtns) + '&nbsp;&nbsp;\<small\>Stk:\</small\>');
    Ddbtns = (CStr(Ddbtns) + CStr(Callstack) + '&nbsp;');
    Ddbtns = CStr(Ddbtns) + CStr(Scs);
    Ddbtns = CStr(Ddbtns) + '\</div\>';

    ddDiv.append($(Ddbtns));

    // =======================================================================================
    // hilight current line (override break color)
    // =======================================================================================
    $('.dbgActiveLine').removeClass('dbgActiveLine');
    $('.dbgActiveSrcLine').removeClass('dbgActiveSrcLine');

    if (isNumeric(Dbginfolineno)) {
        $('.dbgLineNo_' + CStr(Dbginfolineno)).addClass('dbgActiveLine');
        $('.dbgSrcLineNo_' + CStr(Dbginfolineno)).addClass('dbgActiveLine');
        $('.dbgSrcLineNo_' + CStr(Dbginfolineno)).attr('id', 'dbgActiveSrcLine');
    }

    // =======================================================================================
    // Restore previous position and width
    // =======================================================================================
    var Myleft = CInt(window.GetCookie('dbgLeft', 40));
    var Mytop = CInt(window.GetCookie('dbgTop', 40));
    var Mywidth = CInt(window.GetCookie('dbgWidth', 700));
    var Myheight = CInt(window.GetCookie('dbgHeight', 300));

    if ((Null0(Myleft) < '0')) Myleft = 0;
    if ((Null0(Mytop) < '0')) Mytop = 0;
    if ((Null0(Mywidth) < 100)) Mywidth = 100;
    if ((Null0(Myheight) < 100)) Myheight = 100;

    // Allow debug window to float anywhere
    Maxwidth = $(window).width();
    Maxheight = $(window).height();

    // Give a litte margin
    Maxwidth -= 30;
    Maxheight -= 30;

    // Check window inbounds
    if ((+Myleft + +Mywidth > Null0(Maxwidth))) Mywidth = +Maxwidth - +Myleft;
    if ((+Mytop + +Myheight > Null0(Maxheight))) Myheight = +Maxheight - +Mytop;

    // Insre a minimum size
    if ((Null0(Mywidth) < 300)) Mywidth = 300;
    if ((Null0(Myheight) < 200)) Myheight = 200;

    // Set fixed position
    $(ddDiv).css({ "left": Myleft, "top": Mytop, "width": Mywidth, "height": Myheight });

    if ($(ddDiv).draggable) {
        $(ddDiv).draggable({
            // options
            handle: ".dbgHeader",
            stop: function (event, ui) {
                var t = ui.position.top;
                SetCookie('dbgLeft', ui.position.left)
                SetCookie('dbgTop', ui.position.top)
            }
        }).resizable({
            stop: function (event, ui) {
                SetCookie('dbgWidth', ui.size.width)
                SetCookie('dbgHeight', ui.size.height)
            }
        });
    }

    // $('#txtInput').hide();

    // =======================================================================================
    // Make visible
    // =======================================================================================
    $(ddDiv).css('visibility', 'visible');

    $(ddDiv).show();

    window.dbgScrollLineIntoView = function (lineNo) { // Scroll to position
        try {
            var topPos = document.getElementById('dbgTextDiv').scrollTop + $(".dbgLineNo_" + lineNo).offset().top - ($('#dbgTextDiv').height() / 2) - $("#dbgTextDiv").offset().top
            if (topPos < 0) topPos = 0;

            if (window.isPhoneGap()) {
                $('#dbgTextDiv').addClass("androidFix").scrollTop(topPos).removeClass("androidFix");
            } else {
                document.getElementById('dbgTextDiv').scrollTop = topPos;
            }

            $("#clsDbgStk").val("")
        } catch (err) { }
    };

    // =======================================================================================
    // Scroll to position
    // =======================================================================================
    if (CBool(Dbginfolineno)) {
        window.dbgInfoLineNo = Dbginfolineno;
        $(document).ready(function () { setTimeout(function () { dbgScrollLineIntoView(window.dbgInfoLineNo) }, 7) });
    }

    // =======================================================================================
    // Set mouse traps
    // =======================================================================================
    window.dbgLineClick = function (e) { dbgToggleBreakPoint(Field(Field(e.currentTarget.className, "dbgLineNo_", 2), " ", 1)) };
    $('.dbgLineNums').bind('click', window.dbgLineClick);

    window.dbgToggleBreakPoint = function (lineNo) { if (dbgHasBreakPoint(Commons_JSB_BF.Dbg_Lastiname, lineNo)) dbgClearBreakPoint(Commons_JSB_BF.Dbg_Lastiname, lineNo); else dbgSetBreakPoint(Commons_JSB_BF.Dbg_Lastiname, lineNo); };

    // =======================================================================================
    // enable tooltips
    // =======================================================================================
    if (CBool(isFunction($(ddDiv).tooltip))) $(ddDiv).tooltip();
    if (CBool(isFunction($(ddDiv).tooltip))) $(ddDiv).tooltip(); else if (CBool(isFunction($(ddDiv).jqtooltip))) $(ddDiv).jqtooltip();;

    // Setup a function to restart us
    window.dbgPostCommand = function (Txt) {
        if (window.debuggerProcess) {
            debuggerProcess.At_Input = Txt
            debuggerProcess = undefined
            pauseResolve();
        } else {
            removeDebugger();
        }
    };

    // =======================================================================================
    // Make the F6 key single step, and the F5 key run
    // =======================================================================================
    window.debuggerKeyUp = (function (e) {
        if (e.which === 116) { // F5 - run
            dbgPostCommand("R")
            return false;
        }
        if (e.which === 117) { // F6 - step over
            dbgPostCommand("N")
            return false;
        }
        if (e.which === 82 && e.ctrlKey) {
            dbgPostCommand("R")
            return false;
        }
    });
    $(ddDiv).bind('keyup', window.debuggerKeyUp);

    // =======================================================================================
    // add window.realName event for <word> tag 
    // =======================================================================================
    window.dbgPopupTimer = undefined;

    if (Null0($('#popupvar').length) == '0') $('body').append('\<div id=\'popupvar\' ondblclick=\'varSelect(this)\' /\>');
    $('word').hover(function () {
        var myJSB = $('#jsb')
        var pos = $(this).offset();
        var top = pos.top + $(this).height();
        var left = pos.left + $(this).width();
        var bodyHeight = $(myJSB).height();
        var bodyWidth = $(myJSB).width();

        var popupvar = $('#popupvar')
        var maxWidth = $('#jsbSrcDialog').width();  // Just set to something proportional to the size of the current window
        var maxHeight = $('#jsbSrcDialog').height();

        // Adjust maxHeight
        if (top + maxHeight > bodyHeight) maxHeight = bodyHeight - top - 30;
        if (maxHeight < 100) maxHeight = 100;
        if (maxHeight > 500) maxHeight = 500;

        // Adjust maxWidth
        if (left + maxWidth > bodyWidth) maxWidth = bodyWidth - left - 30;
        if (maxWidth < 200) maxWidth = 200;
        if (maxWidth > 600) maxWidth = 600;
        $(popupvar).css({ maxHeight: maxHeight, maxWidth: maxWidth });

        var varname = window.realName[$(this).html().toLowerCase()];
        var vo = $(popupvar).html(window.dbgGetVariable(varname, true));
        $(popupvar).prop('varname', varname)
        if (left + maxWidth > $(myJSB).width()) left = $(myJSB).width() - maxWidth;
        if (left < 0) left = 0;

        $(popupvar).css({ top: top, left: left });
        $(popupvar).css("z-index", 0)
        $(popupvar).css("z-index", nextZIndex())
        $(popupvar).show();

        if (window.dbgPopupTimer) clearTimeout(dbgPopupTimer);
    }, function () {
        if (window.dbgPopupTimer) clearTimeout(dbgPopupTimer);
        dbgPopupTimer = setTimeout(function () { $("#popupvar").hide(); dbgPopupTimer = null; }, 500)
    });

    $('word').dblclick(function () { //var varname = window.realName[$(this).html().toLowerCase()];
        varSelect(this)
    });

    $('#popupvar').hover(function () { if (window.dbgPopupTimer) clearTimeout(dbgPopupTimer); }, function () {
        if (window.dbgPopupTimer) clearTimeout(dbgPopupTimer);
        dbgPopupTimer = setTimeout(function () { $("#popupvar").hide(); dbgPopupTimer = null; }, 500)
    });

    // =======================================================================================
    // show break points
    // =======================================================================================
    dbgHilightBreakPoints(Dbginame);


    while (1) {
        window.debuggerProcess = activeProcess;
        await asyncPause(); // restart with pauseResolve() orpauseReject() 


        Ocmd = Trim(activeProcess.At_Input);
        Cmd = LCase(Left(Ocmd, 1));
        Varname = LTrim(Mid1(Ocmd, 2));
        Varname = Change(Varname, ' ', '-');
        Varname = Change(Varname, ',', '-');

        activeProcess.At_Errors = Holderrors;
        var dblBreak41 = false;
        switch (true) {
            case Cmd == 'n':
                // Step Over (Next)
                Fromobj._stepOver = 1;
                { dblBreak41 = true; break };

                break;

            case Cmd == 'o':
                // Step Out
                stepOutLevel = Fromobj._level;
                { dblBreak41 = true; break };

                break;

            case Cmd == 'i':
                // Step In
                singleStepping = 1;
                { dblBreak41 = true; break };

                break;

            case Cmd == 'r':
                // Run
                { dblBreak41 = true; break };

                break;

            case Cmd == 'm':
                // Modal Jump
                Holdmodalstep = 1;
                stepOutLevel = Fromobj._level;
                { dblBreak41 = true; break };

                break;

            case Cmd == 'q' || Cmd == 'e':
                // Quit/end
                $(ddScreen).remove();
                Commons_JSB_BF.Dbg_Lastiname = '';
                Cmd = 'q';
                { dblBreak41 = true; break };

                break;

            case Cmd == '/':
                V = CStr(Dbgfname(Left(Varname, 1))) + LCase(Mid1(Varname, 2));
                V2 = 'Commons_' + UCase(Commons_JSB_BF.Dbg_Lastfname) + '.' + CStr(V);

                if (typeOf(Varname) != 'undefined') {
                    Println(JSB_BF_EVAL(CStr(Varname)));;
                } else if (typeOf(V2) != 'undefined') {
                    Println(JSB_BF_EVAL(CStr(V2)));;
                } else {
                    Println(Fromobj[V]);
                }

                break;

            case Cmd == 'b':
                if (CBool(Varname)) {
                    Filename = Field(Varname, '-', 1);
                    Brklineno = Field(Varname, '-', 2);
                    if (isNumeric(Filename)) {
                        Brklineno = Filename;
                        Filename = Dbgfname;
                    }
                    await JSB_BF_DBGSETBREAKPOINT_Sub(Filename, Brklineno, function (_Filename, _Brklineno) { Filename = _Filename; Brklineno = _Brklineno });
                }

                break;

            case Cmd == 'k':
                if (CBool(Varname)) {
                    Filename = Field(Varname, '-', 1);
                    Brklineno = Field(Varname, '-', 2);
                    if (isNumeric(Filename)) {
                        Brklineno = Filename;
                        Filename = Dbgfname;
                    }
                    await JSB_BF_DBGCLEARBREAKPOINT_Sub(Filename, Brklineno, function (_Filename, _Brklineno) { Filename = _Filename; Brklineno = _Brklineno });
                }
        }
        if (dblBreak41) break;
    }

    removeDebugger()

    if (Cmd == 'q') return Stop();

    activeProcess.modalStep = Holdmodalstep;
}
// </DEBUGGER_Sub>

// <DELETEACCOUNT>
async function JSB_BF_DELETEACCOUNT(ByRef_Actname, setByRefValues) {
    // local variables
    var Fhandle;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Actname)
        return v
    }
    if (!(await JSB_BF_ACCOUNTEXISTS(CStr(ByRef_Actname)))) { activeProcess.At_Errors = CStr(ByRef_Actname) + ' does not exist.'; return exit(false); }

    if (window.dotNetObj) {
        if (await asyncOpen("", dotNetObj.dnoMapRootAccount(ByRef_Actname), _fHandle => Fhandle = _fHandle)); else return exit(false);
        if (await asyncDeleteTable(Fhandle)); else return exit(false);
    } else {
        if (await asyncDeleteDB(ByRef_Actname)); else return exit(false);
    }

    return exit(true);
}
// </DELETEACCOUNT>

// <DEVICECORDOVAVERSION>
function DeviceCordovaVersion() {
    if (Cordova()) return window.device.cordova; else return '';
}
// </DEVICECORDOVAVERSION>

// <DEVICEMODEL>
function DeviceModel() {
    if (Cordova()) return window.device.model; else return System(1);
}
// </DEVICEMODEL>

// <DEVICEMOTION>
async function JSB_BF_DEVICEMOTION(Callbackiname, Callbackfname) {
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                me.hasDeviceMotion = function () { return 'DeviceMotionEvent' in window };

                if (Not(me.hasDeviceMotion())) { activeProcess.At_Errors = 'No Device Motion Event'; return undefined; }

                if (CBool(Callbackiname)) {
                    if (Not(Callbackfname)) Callbackfname = System(33);
                    me.deviceMotionCallBackFName = Callbackfname;
                    me.deviceMotionCallBackIName = Callbackiname;
                    me.doCallBacks = true;
                    me.DontClearMe = true;
                }

                me.firstEvent = true;
                me.nested = 0;

                me.handleOrientationChange = function (event) {
                    if (me.nested) return;
                    me.nested += 1;
                    me.myEvent = event;

                    if (event.acceleration == null) {
                        me.doCallBacks = false;
                        At_Errors = 'No device orientaton';
                    }

                    if (!me.doCallBacks) {
                        // one time event
                        window.removeEventListener('devicemotion', me.handleOrientationChange);
                        me.handleOrientationChange = undefined;
                    }

                    if (me.firstEvent) {
                        return me._activeProcess.unblock(setBlock_deviceMotion)
                    }

                    jsbCall(me.deviceMotionCallBackFName, me.deviceMotionCallBackIName, function (continueEvents) {
                        if (!continueEvents) {
                            window.removeEventListener('devicemotion', me.handleOrientationChange);
                            me.handleOrientationChange = undefined;
                        }
                        me.nested -= 1;
                    }, me.myEvent);
                };

                me._activeProcess.setBlock(setBlock_deviceMotion, me, "GOTFIRSTEVENT")
                window.addEventListener('devicemotion', me.handleOrientationChange);

                // Exit here and come back when we have the 1st event
                return


            case "GOTFIRSTEVENT":

                me.nested--;
                return me.myEvent;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </DEVICEMOTION>

// <DEVICEOSVERSION>
function DeviceOSVersion() {
    if (Cordova()) return window.device.version; else return System(42);
}
// </DEVICEOSVERSION>

// <DEVICEPLATFORM>
function DevicePlatform() {
    if (Cordova()) return window.device.platform;
    if (System(1) == 'js') return window.get_browser_info();
    return System(40);
}
// </DEVICEPLATFORM>

// <DEVICESERIALNUMBER>
function DeviceSerialNumber() {
    if (Cordova()) return window.device.serial;
    if (System(1) == 'js') return window.fingerprint;
    return System(47);
}
// </DEVICESERIALNUMBER>

// <DEVICEUUID>
function DeviceUUID() {
    if (Cordova()) return window.device.uuid;
    if (System(1) == 'js') return window.fingerprint;
    return System(47);
}
// </DEVICEUUID>

// <DIALOG>
async function JSB_BF_DIALOG(Title, Innerhtmldialog, Waitforanswer, Width, _Height) {
    // local variables
    var Sc, Ec;

    if (InStr1(1, Innerhtmldialog, Chr(28))) { Sc = Chr(28); Ec = Chr(29); }

    Innerhtmldialog = Change(Innerhtmldialog, '#dialog', '#popOutDIV');

    // We must have a "<" character in the 1st five characters to mark this as not a URL
    if (InStr1(1, Left(Innerhtmldialog, 4), '\<') == 0) Innerhtmldialog = CStr(Sc) + '\<b\>\</b\>' + CStr(Ec) + Innerhtmldialog;

    if (!Waitforanswer) {
        window.popoutDialog(Title, Innerhtmldialog, Width, _Height, undefined, 'msgboxResult', window);
        return '';
    }

    Innerhtmldialog = (CStr(Sc) + '\<input id=\'msgboxResult\' name=\'msgboxResult\' type="hidden" value=\'&#x1B\' /\>' + CStr(Ec) + Innerhtmldialog);

    return new Promise(resolve => {
        new window.popoutDialog(Title, Innerhtmldialog, Width, Height, function () {
            var ans = $("#msgboxResult").val();
            ans = Replace(ans, Chr(160), Chr(32))
            resolve(ans);
        })
    });
}
// </DIALOG>

// <DIFFILES>
async function JSB_BF_DIFFILES(Source, Todestination, Mustexistinbothdomains) {
    // local variables
    var Readabledifference, Srcentry, Si;

    // Do sync between mthe Master JSB files and the local machine

    var Destinationstats = await JSB_BF_FILESTATS(Todestination, undefined, function (_Todestination) { Todestination = _Todestination });
    if (Not(Destinationstats)) return undefined;

    var Sourcestats = await JSB_BF_FILESTATS(Source, undefined, function (_Source) { Source = _Source }); // Returns json fstats { Names: [], Dates: [], Times: [] } or false and @Errors
    if (Not(Sourcestats)) return undefined;

    var Srctime1 = r83Date(Sourcestats.currentTime);
    var Dsttime1 = r83Date(Destinationstats.currentTime);

    var Timedifference = +Srctime1 - +Dsttime1;
    Readabledifference = DateTime(CStr(Timedifference) + '000');

    Sourcestats = Sourcestats.stats;
    Destinationstats = Destinationstats.stats;
    var Difs = [undefined,];
    var Difcnt = 0;

    // Compare the sourceStats with destinationStats
    var Dnames = [undefined,];
    var Dstentry = undefined;
    for (Dstentry of iterateOver(Destinationstats)) {
        Dnames[Dnames.length] = LCase(Dstentry.name);
    }

    // Compare the sourceStats with destinationStats
    Si = LBound(Sourcestats) - 1;
    for (Srcentry of iterateOver(Sourcestats)) {
        Si++;
        var Itemid = LCase(Srcentry.name);
        var Foundit = undefined;
        if (Locate(Itemid, Dnames, 0, 0, 0, "", position => Foundit = position)) {
            Dstentry = Destinationstats[Foundit];

            // Compare Source & Dest
            var Srctimestamp = Srcentry.timeStamp;
            if (Not(Srctimestamp)) {
                var Srcdate = Srcentry.date;
                var Srctime = Srcentry.time;
                Srctimestamp = r83Date(Srcdate + ' ' + Srctime);
            }

            var Dsttimestamp = Dstentry.timeStamp;
            if (Not(Dsttimestamp)) {
                var Dstdate = Dstentry.date;
                var Dsttime = Dstentry.time;
                Dsttimestamp = r83Date(Dstdate + ' ' + Dsttime);
            }

            Srctimestamp -= Timedifference;

            var Readabledesttime = DateTime(CStr(Dsttimestamp) + '0000');
            var Readablesourcetime = DateTime(CStr(Srctimestamp) + '0000');

            if (Null0(Srctimestamp) > Null0(Dsttimestamp)) {
                if ((+Srctimestamp - +Dsttimestamp) > 3E-05) {
                    Difs[Difs.length] = Srcentry.name; // Must be more than 3 second difference
                    if (Srcdate == Dstdate) {
                        Difcnt++;
                    }
                }
            }
        } else {
            if (!Mustexistinbothdomains) Difs[Difs.length] = Itemid;
        }
    }

    return Difs;
}
// </DIFFILES>

// <DONOTHING>
async function JSB_BF_DONOTHING(Viewvars, Rtnerrors) {
    return true;
}
// </DONOTHING>

// <DOSDECODEID>
async function JSB_BF_DOSDECODEID(ByRef_Iid, setByRefValues) {
    // local variables
    var Idx;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Iid)
        return v
    }
    if (!InStr1(1, ByRef_Iid, '$')) return exit(ByRef_Iid);

    var R = '';
    var _ForEndI_2 = Len(ByRef_Iid);
    for (Idx = 1; Idx <= _ForEndI_2; Idx++) {
        var C = Mid1(ByRef_Iid, Idx, 1);
        if (C == '$') {
            var Hx1 = LCase(Mid1(ByRef_Iid, +Idx + 1, 1));
            var Hx2 = LCase(Mid1(ByRef_Iid, +Idx + 2, 1));
            if (InStr1(1, '0123456789abcdef', Hx1) && InStr1(1, '0123456789abcdef', Hx2)) {
                R += Chr(XTD(Hx1 + Hx2));
                Idx += 2;
            } else {
                R += C;
            }
        } else {
            R += C;
        }
    }
    return exit(R);
}
// </DOSDECODEID>

// <DOSENCODEID>
async function JSB_BF_DOSENCODEID(Iid) {
    // local variables
    var I;

    var Newiid = '';
    var _ForEndI_5 = Len(Iid);
    for (I = 1; I <= _ForEndI_5; I++) {
        var C = Mid1(Iid, I, 1);
        if (InStr1(1, '$%\\+|/\<*\>:?*"', C)) {
            Newiid += '$' + STX(C);;
        } else if (Null0(I) == 1 && C == '.') {
            Newiid += '$' + STX(C);;
        } else {
            Newiid += C;
        }
    }
    return Newiid;
}
// </DOSENCODEID>

// <DOSEXECUTE>
async function JSB_BF_DOSEXECUTE(ByRef_Startcd, Cmd, ByRef_Errs, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Startcd, ByRef_Errs)
        return v
    }
    if (System(1) == 'js') {
        if (Not(window.dotNetObj)) { ByRef_Errs = 'Not available in this version of JSB ' + CStr(System(1)); return exit(''); }
    } else {
        if (System(1) != 'aspx') { ByRef_Errs = 'Not available in this version of JSB ' + CStr(System(1)); return exit(''); }
    }

    // cd new directory
    // d:
    // --begin--
    // cmd
    // --newcd--
    // cd
    var Cd = ByRef_Startcd;
    if (Not(Cd)) Cd = jsbRootDir();

    var Doscmd = ('cd "' + Cd + '" & ' + Left(Cd, 2) + ' & echo -!-begin-!- & ' + CStr(Cmd) + ' & echo -!-newcd-!- & cd');
    var S = ExecuteDOS(Doscmd);
    var I = InStr1(1, S, '-!-newcd-!');
    var Result = Field(S, '-!-newcd-!-', 1);
    var Newcd = Field(S, '-!-newcd-!-', 2);
    ByRef_Errs = JSB_BF_TRIMWS(Extract(Newcd, 2, 0, 0));
    Newcd = JSB_BF_TRIMWS(Extract(Newcd, 1, 0, 0));

    if (Newcd && ByRef_Startcd) {
        ByRef_Startcd = Newcd;
        At_Session.Item('curdir', Newcd);
    }

    Result = JSB_BF_TRIMWS(Field(Result, '-!-begin-!-', 2));
    Result = Change(Result, Chr(13) + Chr(10), Chr(254));
    Result = Change(Result, Chr(13), Chr(254));
    Result = Change(Result, Chr(10), Chr(254));
    return exit(Result);
}
// </DOSEXECUTE>

// <DROPJSBTAG28>
function DropJsbTag28(_Html) {
    var C28 = undefined;
    var Rs = '';


    do {
        C28 = InStr1(1, _Html, Chr(28));
        if (!C28) return _Html;
        Rs = DropJsbTag29(Mid1(_Html, C28 + 1));
        _Html = Left(_Html, C28 - 1) + Rs;
    }
    while (true);
}
// </DROPJSBTAG28>

// <DROPJSBTAG29>
function DropJsbTag29(_Html) {
    var C28 = undefined;
    var C29 = undefined;


    do {
        C28 = InStr1(1, _Html, Chr(28));
        C29 = InStr1(1, _Html, Chr(29));
        if (!C28) C28 = Len(_Html) + 2;
        if (!C29) C29 = Len(_Html) + 1;

        if (C29 < C28) return Mid1(_Html, C29 + 1);
        _Html = DropJsbTag28(CStr(_Html));
    }
    while (true);
}
// </DROPJSBTAG29>

// <DROPTAGS>
function DropTags(_Html) {
    var J = undefined;
    var K = undefined;
    var _Code = '';

    _Code = DropJsbTag28(CStr(_Html)); // Drop all the stuff between Chr(28) and Chr(29)

    _Code = Change(_Code, '\<br\>', am);
    _Code = Change(_Code, Chr(160), ' ');
    _Code = (Change(_Code, '&nbsp;', ' '));
    _Code = (Change(_Code, '&#39;', '\''));
    _Code = Change(_Code, '\<br/\>', am);
    _Code = Change(_Code, '\<br /\>', am);
    _Code = Change(_Code, '\<p\>', ''); _Code = Change(_Code, '\</p\>', am);
    _Code = Change(_Code, '\<strong\>', ''); _Code = Change(_Code, '\</strong\>', am);
    _Code = Change(_Code, '\<em\>', ''); _Code = Change(_Code, '\</em\>', am);
    _Code = Change(_Code, '\<u\>', ''); _Code = Change(_Code, '\</u\>', am);
    _Code = Change(_Code, '\<p\>', ''); _Code = Change(_Code, '\</p\>', am);

    while (true) {
        J = Index1(_Code, '\<blockquote', 1);
        if (Not(J)) break;
        K = InStr1(J, _Code, '\>');
        _Code = Left(_Code, J - 1) + Mid1(_Code, K + 1);
    }

    while (true) {
        J = Index1(_Code, '\</blockquote', 1);
        K = InStr1(J, _Code, '\>');
        if (Not(J && K)) break;
        _Code = Left(_Code, J - 1) + Mid1(_Code, K + 1);
    }


    while (true) {
        J = Index1(_Code, '\<br ', 1);
        K = InStr1(J, _Code, '\>');
        if (Not(J && K)) break;
        _Code = Left(_Code, J - 1) + am + Mid1(_Code, K + 1);
    }

    while (true) {
        J = Index1(_Code, '\<input ', 1);
        K = InStr1(J, _Code, '/\>');
        if (!K) K = InStr1(J, _Code, '\>')
        if (Not(J && K)) break;
        _Code = Left(_Code, J - 1) + am + Mid1(_Code, K + 1);
    }


    while (true) {
        J = Index1(_Code, '\<span', 1);
        K = InStr1(J, _Code, '\>');
        if (Not(J && K)) break;
        _Code = Left(_Code, J - 1) + Mid1(_Code, K + 1);
    }

    while (true) {
        J = Index1(_Code, '\</span', 1);
        K = InStr1(J, _Code, '\>');
        if (Not(J && K)) break;
        _Code = Left(_Code, J - 1) + Mid1(_Code, K + 1);
    }

    while (true) {
        J = Index1(_Code, '\<font', 1);
        K = InStr1(J, _Code, '\>');
        if (Not(J && K)) break;
        _Code = Left(_Code, J - 1) + Mid1(_Code, K + 1);
    }

    while (true) {
        J = Index1(_Code, '\</font', 1);
        K = InStr1(J, _Code, '\>');
        if (Not(J && K)) break;
        _Code = Left(_Code, J - 1) + Mid1(_Code, K + 1);
    }

    while (true) {
        J = Index1(_Code, '\<div', 1);
        K = InStr1(J, _Code, '\>');
        if (Not(J && K)) break;
        _Code = Left(_Code, J - 1) + am + Mid1(_Code, K + 1);
    }

    while (true) {
        J = Index1(_Code, '\</div', 1);
        K = InStr1(J, _Code, '\>');
        if (Not(J && K)) break;
        _Code = Left(_Code, J - 1) + Mid1(_Code, K + 1);
    }


    while (true) {
        J = Index1(_Code, '\<script', 1);
        K = InStr1(J, _Code, '\</script\>');
        if (K) K = InStr1(K, _Code, '\>')
        if (Not(J && K > J)) break;
        _Code = Left(_Code, J - 1) + Mid1(_Code, K + 1);
    }

    _Code = htmlUnescape(_Code);
    _Code = Change(_Code, Chr(194) + Chr(160), Chr(32));
    return _Code;
}
// </DROPTAGS>

// <ELEVATETOADMIN_Sub>
async function JSB_BF_ELEVATETOADMIN_Sub() {
    // local variables
    var _Userno, Mysession;

    // The only reason to call this is if your web.config file has allowDosWrites to false and you actually need to
    if (System(1) == 'js') return;

    _Userno = userno();
    if (Not(At_Session.Item(_Userno))) { At_Session.Item(_Userno, {}); }
    Mysession = At_Session.Item(_Userno);
    Mysession.wasAdmin = Mysession.IsAdmin;
    Mysession.breakingIsOK = System(56);

    if (Not(Mysession.wasAdmin)) BreakOff(me);
    Mysession.IsAdmin = true;
}
// </ELEVATETOADMIN_Sub>

// <EMAIL>
async function JSB_BF_EMAIL() {
    // local variables
    var Authtype, Fusers, Profile;

    Authtype = await JSB_BF_AUTHENTICATIONTYPE();
    if (Authtype == 'server') return await asyncRpcRequest('SERVEREMAIL');
    if (await asyncOpen("", 'jsb_users', _fHandle => Fusers = _fHandle)); else return '';
    if (await asyncRead(Fusers, UserName(), "JSON", 0, _data => Profile = _data)); else { Profile = {} }
    if (CBool(Profile.email)) return Profile.email;
    return '';
}
// </EMAIL>

// <ENABLESWIPING_Sub>
async function JSB_BF_ENABLESWIPING_Sub(Row) {
    FlushHTML();
    window.row = Row;
    window.doingCall = false
    window.callSwipeMove = function (touchMove, mouseDownX, mouseDownY, MouseX, MouseY) {
        if (window.doingCall) {
            if (touchMove != 3) {
                window.touchMove = touchMove;
                return
            }
            // Accept & postpone this call for later
            window.setTimeout(function () {
                window.callSwipeMove(touchMove, mouseDownX, mouseDownY, MouseX, MouseY)
            }, 10);
            return;
        }

        window.doingCall = true
        jsbCall("jsb_bf", 'swipeMove', function () { window.doingCall = false }, touchMove, mouseDownX, mouseDownY, MouseX, MouseY)
    }
    window.enableSwipes()
    window.onSwipeMove = window.callSwipeMove
    await At_Server.asyncPause(me);
}
// </ENABLESWIPING_Sub>

// <ERRMSG>
function ErrMsg(Msgid, S1, S2, S3, S4) {
    var Linecnt = undefined;
    var Ocnt = undefined;
    var Linei = undefined;
    var Emsg = '';
    var Eitem = '';
    var Cmd = '';
    var Eline = '';
    var Parami = '';
    var Sysi = '';

    // Use the ERRMSG subroutine to print a formatted error message from the Efile file.
    // If Efile is NULL or empty, an internal errmsg table is used which
    // contains the following MessageID's:  2, 3, 5, 10, 21, 24, 72, 82, 91, 92,
    // 93, 94, 95, 96, 97, 98 99, 100, 111, 200, 201, 202, 203, 204, 210, 220,
    // 221, 222, 223, 226, 229, 235, 245, and 251.

    Emsg = '';

    if (isNumber(Msgid) == 0 || !CStr(Msgid, true)) return CStr(Msgid) + CStr(S1) + CStr(S2) + CStr(S3) + CStr(S4);

    switch (CInt(Msgid)) {
        case 2:

            Eitem = 'H UNEVEN NUMBER OF DELIMITERS (\' \').';
            break;

        case 3:

            Eitem = 'E VERB?';
            break;

        case 5:

            Eitem = 'E  THE WORD \'' + Chr(254) + 'A' + Chr(254) + 'H\' IS ILLEGAL.';
            break;

        case 7:

            Eitem = 'E  THE ITEM \'' + Chr(254) + 'A' + Chr(254) + 'H\' IS MISSING.';
            break;

        case 10:

            Eitem = 'E FILE NAME MISSING';
            break;

        case 21:

            Eitem = 'E MEANINGLESS ITEM-ID IN STATEMENT';
            break;

        case 24:

            Eitem = 'E  THE WORD \'' + Chr(254) + 'A' + Chr(254) + 'H\' CANNOT BE IDENTIFIED';
            break;

        case 72:

            Eitem = 'E THE VALUE \'' + Chr(254) + 'A' + Chr(254) + 'H\' IS MEANINGLESS.';
            break;

        case 82:

            Eitem = 'L' + Chr(254) + 'E YOUR SYSTEM PRIVILEGE LEVEL IS NOT SUFFICIENT FOR THIS STATEMENT.';
            break;

        case 91:

            Eitem = 'E END TAPE CHECK - ' + Chr(254) + 'A' + Chr(254) + 'H FILE(S)';
            break;

        case 92:

            Eitem = 'E END OF RECORDED DATA - ' + Chr(254) + 'A' + Chr(254) + 'H FILE(S)';
            break;

        case 93:

            Eitem = 'E ATTACH THE TAPE UNIT.';
            break;

        case 94:

            Eitem = 'E  END OF FILE';
            break;

        case 95:

            Eitem = 'E TAPE ATTACHED TO ELine \'' + Chr(254) + 'A' + Chr(254) + 'H\'.';
            break;

        case 96:

            Eitem = 'E  BOT';
            break;

        case 97:

            Eitem = 'E END OF TAPE';
            break;

        case 98:

            Eitem = 'E  PARITY ERROR!';
            break;

        case 99:

            Eitem = 'E BLOCK TRANSFER NOT COMPLETED';
            break;

        case 100:

            Eitem = 'E \'' + Chr(254) + 'A' + Chr(254) + 'H \' IS NOT.' + Chr(254) + 'A';
            break;

        case 111:

            Eitem = 'E ITEM \'' + Chr(254) + 'A' + Chr(254) + 'H\' IS NOT ON FILE';
            break;

        case 200:

            Eitem = 'E FILE NAME?';
            break;

        case 201: case 401:

            Eitem = 'E \'' + Chr(254) + 'A' + Chr(254) + 'H\' IS NOT A FILE NAME';
            break;

        case 202:

            Eitem = 'H\'' + Chr(254) + 'A' + Chr(254) + 'H\' NOT ON FILE.';
            break;

        case 203:

            Eitem = 'E ITEM NAME?';
            break;

        case 204:

            Eitem = 'E FILE DEFINITION \'' + Chr(254) + 'A' + Chr(254) + 'H\' IS MISSING.';
            break;

        case 210:

            Eitem = 'L' + Chr(254) + 'E FILE \'' + Chr(254) + 'A' + Chr(254) + 'H\' IS ACCESS PROTECTED.';
            break;

        case 220:

            Eitem = 'H\'' + Chr(254) + 'A' + Chr(254) + 'H\' EXITED';
            break;

        case 221:

            Eitem = 'H\'' + Chr(254) + 'A' + Chr(254) + 'H\' FILED.';
            break;

        case 222:

            Eitem = 'H\'' + Chr(254) + 'A' + Chr(254) + 'H\' NotInUse.';
            break;

        case 223:

            Eitem = 'H\'' + Chr(254) + 'A' + Chr(254) + 'H\' EXISTS ON FILE';
            break;

        case 226:

            Eitem = 'E TAPE FORMAT ERROR';
            break;

        case 229:

            Eitem = 'E' + Chr(254) + 'H \'' + Chr(254) + 'A' + Chr(254) + 'H\' IS NOT A VALID ACCOUNT NAUserControl.';
            break;

        case 235:
            Eitem = 'L' + Chr(254) + 'E ATTEMPT TO WRITE INTO UPDATE PROTECTED FILE!';

            break;

        case 245:
            Eitem = 'E LIST \'' + Chr(254) + 'A' + Chr(254) + 'H\' NotInUse.';

            break;

        case 251:

            Eitem = 'H DONE';

            break;

        case 400:
            Eitem = 'H' + Chr(254) + 'A' + Chr(254) + 'Canceled by user';

            break;

        case 405:
            Eitem = 'H' + Chr(254) + 'A' + Chr(254) + 'H rows(s)';

            break;

        default:

            Eitem = 'E Unknown error code: ' + CStr(Msgid) + ': ' + CStr(S1) + CStr(S2) + CStr(S3) + CStr(S4);
    }

    Parami = 2;

    Linecnt = DCount(Eitem, Chr(254));
    Ocnt = 0;
    var _ForEndI_4 = Linecnt;
    for (Linei = 1; Linei <= _ForEndI_4; Linei++) {

        Eline = Mid1(Extract(Eitem, Linei, 0, 0), 1, 132);

        Cmd = UCase(Mid1(Eline, 1, 1));
        switch (Cmd) {
            case 'E':

                Emsg += Mid1(Eline, 2, 99);
                Ocnt += Len(Eline) - 1;
                break;

            case 'A':

                if (Mid1(Eline, 2, 1) == '(') {

                    Parami = Field(Field(Eline, ')', 1), '(', 2);
                }
                switch (Parami) {
                    case 1:

                        Emsg += CStr(Msgid);
                        Ocnt += Len(Msgid);
                        break;

                    case 2:
                        Emsg += CStr(S1);
                        Ocnt += Len(S1);
                        break;

                    case 3:
                        Emsg += CStr(S2);
                        Ocnt += Len(S2);
                        break;

                    case 4:
                        Emsg += CStr(S3);
                        Ocnt += Len(S3);
                        break;

                    case 5:
                        Emsg += CStr(S4);
                        Ocnt += Len(S3);
                }
                Parami = +Parami + 1;
                break;

            case 'L': case 'H':

                Emsg += Mid1(Eline, 2, 99);
                Ocnt = 0;
                break;

            case 'R':

                if (Mid1(Eline, 2, 1) == '(') {

                    Sysi = CNum(CNum(Field(Field(Eline, ')', 1), '(', 2)) - Ocnt - 1);
                    if (Null0(Sysi) < 1) Sysi = 0;
                    Emsg += Space(Sysi);
                    Ocnt += +Sysi;
                }
                break;

            case 'S':

                if (Mid1(Eline, 2, 1) == '(') {

                    Sysi = Field(Field(Eline, ')', 1), '(', 2);
                    Emsg += Space(+Sysi - Ocnt - 1);
                }
                break;

            case 'D':
                Emsg += r83Date(Now());
                break;

            case 'T':
                Emsg += r83Time(Now());
        }
    }
    return Emsg;
}
// </ERRMSG>

// <EVAL>
function JSB_BF_EVAL(X) {
    return window.eval(X);
}
// </EVAL>

// <EVENTHANDLERTYPE>
function EventHandlerType(I) {
    var Types = undefined;

    Types = [undefined, 'New Window', 'New Window Tab', 'Tab', 'Frame', 'DIV', 'Dialog', 'POST', 'GET', 'LEAF', 'Current WIndow', 'Container', 'Top Window', 'Back', 'Next Tab', 'Previous Tab', 'Close Window', 'Return Pick'];
    return Types[I];
}
// </EVENTHANDLERTYPE>

// <EVENTREFLIST>
async function JSB_BF_EVENTREFLIST() {
    return 'New Window,1;New Window Tab,2;Tab (name in Transfer Xtra),3;Frame (name in Transfer Xtra),4;Dialog (Title in Transfer Xtra),6;HTTP POST (Transfer Extra becomes formVar Name and contains SelectedID),7;HTTP GET,8;Current Window,10;JavaScript (in Transfer Extra),11;Top Window,12;Back,13;Next Tab,14;Previous Tab,15;Close Window,16;Return Pick Value,17';
}
// </EVENTREFLIST>

// <EXECUTE>
async function JSB_BF_EXECUTE(X) {
    var Y = '';

    await asyncTclExecute(X, _capturedData => Y = _capturedData)
    return Y;
}
// </EXECUTE>

// <FHANDLE>
async function JSB_BF_FHANDLE(Dict, Filename, Createit) {
    // local variables
    var Mdentry;

    var Filehandle = undefined;
    var Fname = '';

    if (Filename === undefined) {
        Fname = Dict;
        Dict = '';
    } else {
        Fname = Filename;
    }

    if (Not(Fname)) return undefined;
    if (JSB_BF_TYPEOFFILE(Fname)) return Fname;

    var Lname = LCase(Fname);
    if (Lname == 'tmp' || Lname == 'jsb_selectlists') Createit = true;

    Dict = Trim(LCase(Dict));
    if (Dict != 'dict') Dict = '';
    if (await JSB_ODB_OPEN(Dict, Fname, Filehandle, function (_Filehandle) { Filehandle = _Filehandle })) return Filehandle;

    // Did we get passed an existing fHandle by mistake?
    Lname = fHandle2FileName(Fname);
    if (Lname) { if (await JSB_ODB_OPEN(Dict, Lname, Filehandle, function (_Filehandle) { Filehandle = _Filehandle })) return Fname; }

    if (!Createit) return undefined;

    // If this is a MD QD pointer, create the dict of the correct name
    var Db = Account();

    // Dict get placed on disk
    if (Dict) {
        if (await JSB_ODB_ATTACHDB('')); else null;
        var Fmd = undefined;
        if (await asyncOpen("", 'md', _fHandle => Fmd = _fHandle)); else return Stop(activeProcess.At_Errors);
        if (await asyncRead(Fmd, Fname, "", 0, _data => Mdentry = _data)) {
            Mdentry = LCase(Mdentry);
            var Spot = undefined;
            if (Locate('q', Mdentry, 1, 0, 0, "", position => Spot = position)) {
                Fname = Extract(Mdentry, 3, Spot, 0);
                Mdentry = Replace(Mdentry, 1, Spot, 0, 'qd');
                if (await JSB_ODB_WRITE(CStr(Mdentry), Fmd, Fname)); else return undefined;
            } else {
                if (Locate('qd', Mdentry, 1, 0, 0, "", position => Spot = position)) Fname = Extract(Mdentry, 3, Spot, 0);
            }
        }
    }

    var Containsdosfilepath = (InStr1(1, Fname, ':') || InStr1(1, Fname, '/') || InStr1(1, Fname, '\\'));

    var Usedskprotocol = false;
    if (System(1) == 'js') Usedskprotocol = window.fileSystem;

    if (Usedskprotocol && !Containsdosfilepath && Not(Dict)) {
        if (await asyncCreateTable("DATA", 'dsk:' + Fname, _fHandle => activeProcess.At_File = _fHandle)); else return Stop(activeProcess.At_Errors);
    } else {
        if (Not(Dict)) { if (await asyncCreateTable("DATA", Fname, _fHandle => activeProcess.At_File = _fHandle)); else return Stop(activeProcess.At_Errors); }
        if (await asyncCreateTable("DATA", LTrim(Dict + ' ') + Fname, _fHandle => activeProcess.At_File = _fHandle)); else return Stop(activeProcess.At_Errors);
    }

    if (await JSB_ODB_OPEN(Dict, Fname, Filehandle, function (_Filehandle) { Filehandle = _Filehandle })); else return Stop(activeProcess.At_Errors);
    if (Db) { if (await JSB_ODB_ATTACHDB(Db)); else return Stop(activeProcess.At_Errors); }
    return Filehandle;
}
// </FHANDLE>

// <FHANDLE2FILENAME>
function fHandle2FileName(Fhandle) {
    if (Not(JSB_BF_TYPEOFFILE(Fhandle))) return undefined;
    if (Left(Fhandle, 1) == '@') return Mid1(Field(Fhandle, '.', 1), 2);
    if (System(1) == 'gae') return Mid1(Fhandle, 2);
    if (System(1) == 'js') return Mid1(Fhandle, 2);
    return dropLeft(CStr(Fhandle), ':');
}
// </FHANDLE2FILENAME>

// <FILELIST>
async function JSB_BF_FILELIST(Showjsb, Includeviews) {
    var Results = undefined;
    var Resultswojsb = undefined;
    var Viewlist = undefined;
    var Fname = '';
    var Lname = '';
    var Sfilelist = '';

    if (await JSB_ODB_LISTFILES(Sfilelist, function (_Sfilelist) { Sfilelist = _Sfilelist })); else return undefined;
    Results = Split(Sfilelist, am);

    if (Includeviews) {
        Viewlist = System(37);
        if (Viewlist) {
            for (Fname of iterateOver(Viewlist)) {
                Results[Results.length] = Fname;
            }
        }
    }

    Results = Sort(Results, 'LAI'); // Left, Ascending, Ignore Case
    if (Showjsb) return Results;

    Resultswojsb = [undefined,];
    for (Fname of iterateOver(Results)) {
        Lname = LCase(Fname);
        if (Left(Lname, 4) != 'jsb_' && Lname != 'system' && Lname != 'md') Resultswojsb[Resultswojsb.length] = Fname;
    }

    return Resultswojsb;
}
// </FILELIST>

// <FILEPATH>
function filePath(FHandle) {
    if (JSB_BF_TYPEOFFILE(FHandle) != 'dos') return '';
    if (System(1) == 'js') {
        if (window.dotNetObj) return window.dotNetObj.dnoDosFilePath(Mid1(FHandle, 2));
    }
    return FHandle.FilePath();
}
// </FILEPATH>

// <FILESTATS>
async function JSB_BF_FILESTATS(ByRef_Filenamehandle, Iname, setByRefValues) {
    // local variables
    var Direntry, I;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Filenamehandle)
        return v
    }
    var Ftype = JSB_BF_TYPEOFFILE(ByRef_Filenamehandle);
    var Tblname = '';
    var Fhandle = undefined;

    if (Ftype) {
        Tblname = fHandle2FileName(ByRef_Filenamehandle);
        Fhandle = ByRef_Filenamehandle;
    } else {
        Tblname = ByRef_Filenamehandle;
        Fhandle = await JSB_BF_FHANDLE(CStr(ByRef_Filenamehandle));
        Ftype = JSB_BF_TYPEOFFILE(Fhandle);
        if (Not(Ftype)) return exit(undefined);
    }

    if (Ftype == 'rpc') {
        // Drop RPC cached items 
        At_Session.Item('RPC_CACHED_ITEMS', {});
        At_Session.Item('RPC_CACHED_TIMER', {});

        var Rpcdomain = dropLeft(Extract(Fhandle, 1, 1, 0), '.');
        var Rfname = dropLeft(Extract(Fhandle, 2, 0, 0), 'rmt:');
        var Fstats = (parseJSON(await JSB_BF_GET(Rpcdomain + 'fileStats?fName=' + urlEncode(Rfname) + '&iName=' + urlEncode(Iname))));
        if (CBool(Fstats.errors)) { activeProcess.At_Errors = Fstats.errors; return exit(undefined); }
        return exit(Fstats);
    }

    if (Ftype != 'dos') { activeProcess.At_Errors = 'Unable to get statistics for non-DOS file' + Tblname; return exit(undefined); }

    var Path = filePath(Fhandle);
    if (Not(Path)) { activeProcess.At_Errors = 'Invalid path'; return exit(undefined); }
    if (Iname) Path += await JSB_BF_DOSENCODEID(CStr(Iname));

    var Sdosdir = ExecuteDOS('dir "' + Path + '"');
    Sdosdir = Change(Sdosdir, crlf, am);
    var Dosdir = Split(Sdosdir, am);
    if (Len(Dosdir) <= 8) { return exit({}); }

    // Build Stats from dir command 
    var Stats = [undefined,];
    for (Direntry of iterateOver(Dosdir)) {
        var Fstat = Split(Trim(Direntry), ' '); // 01/16/2018 05:47 Pm 1,194 Doc_funcs
        var Fdate = Fstat[1]; // 01/16/2018
        var Fsize = Fstat[4]; // 1,194
        if (Count(Fdate, '/') == 2 && Fsize != '\<DIR\>') {
            Fsize = Change(Change(Fsize, '(', ''), ')', '');
            var Ftime = CStr(Fstat[2]) + ' ' + CStr(Fstat[3]); // 05:47 Pm
            var Fname = Fstat[5]; // Doc_funcs
            var _ForEndI_10 = UBound(Fstat);
            for (I = 6; I <= _ForEndI_10; I++) {
                Fname += ' ' + CStr(Fstat[I]);
            }
            Stats[Stats.length] = { "name": await JSB_BF_DOSDECODEID(Fname, function (_Fname) { Fname = _Fname }), "date": Fdate, "time": Ftime, "size": Change(Fsize, ',', ''), "timeStamp": r83Date(Fdate + ' ' + Ftime) }
        }
    }

    return exit({ "stats": Stats, "currentTime": DateTime() });
}
// </FILESTATS>

// <FILESTATS_Pgm>
async function JSB_BF_FILESTATS_Pgm() {  // PROGRAM
    Commons_JSB_BF = {};
    Equates_JSB_BF = {};

    // local variables
    var Fname = '', Iname = '', Restful_Result, R, Cb;

    var Restful_Result;
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Fname = JSB_BF_PARAMVAR('FNAME', CStr(1)); Iname = JSB_BF_PARAMVAR('INAME', CStr(2));
                var Lfname = LCase(Fname);
                if (Left(Lfname, 5) == 'data ') { Fname = Mid1(Fname, 6); Lfname = LCase(Fname); }
                if (Not(Iname)) Iname = '';

                if (Not(isAdmin())) {
                    var Publicfiles = await JSB_BF_JSBCONFIG('publicfiles');
                    if (Locate(Lfname, Publicfiles, 0, 0, 0, "", position => { })); else {
                        Fname = await JSB_BF_TRUEFILENAME(Fname);
                        Lfname = LCase(Fname);
                        if (Locate(Lfname, Publicfiles, 0, 0, 0, "", position => { })); else { Restful_Result = { "errors": 'No priviliges to get statistics for file ' + Fname }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto; }
                    }
                }

                var Stats = await JSB_BF_FILESTATS(await JSB_BF_FHANDLE(Fname), Iname, function (_P1) { });
                if (Not(Stats)) { Restful_Result = { "errors": activeProcess.At_Errors }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto; }

                Restful_Result = Stats; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto;

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </FILESTATS_Pgm>

// <FINDENDOFJSBSUB>
function findEndOfJsbSub(Startpos, Lcode) {
    var Eof = undefined;
    var Subi = undefined;
    var Funci = undefined;
    var Progi = undefined;
    var Resti = undefined;
    var Picki = undefined;
    var Lineno = undefined;
    var Priorlinenums = undefined;
    var Funclineno = undefined;
    var Routinename = '';
    var Elineno = '';
    var Scode = undefined;
    var Pline = undefined;

    Priorlinenums = DCount(Mid1(Lcode, 1, Startpos - 1), am);
    Scode = am + CStr(Lcode);
    Eof = Len(Scode) + 1;
    Routinename = '';

    // skip over comments to function
    Subi = InStr1(Startpos, Scode, am + 'subroutine#');
    Funci = InStr1(Startpos, Scode, am + 'function#');
    Progi = InStr1(Startpos, Scode, am + 'program#');
    Resti = InStr1(Startpos, Scode, am + 'restful#');
    Picki = InStr1(Startpos, Scode, am + 'pick#');

    if (Startpos + Subi + Funci + Progi + Resti + Picki == 1) {
        Funclineno = 1;
        Routinename = '';
        return CStr(Eof - 1) + am;
    }

    if (!Subi) Subi = Eof;
    if (!Funci) Funci = Eof;
    if (!Progi) Progi = Eof;
    if (!Resti) Resti = Eof;
    if (!Picki) Picki = Eof;

    if (Funci < Subi) Subi = Funci;
    if (Progi < Subi) Subi = Progi;
    if (Resti < Subi) Subi = Resti;
    if (Picki < Subi) Subi = Picki;

    if (Subi != Eof) Startpos = Subi;

    Funclineno = Count(Mid1(Scode, 1, Startpos), am);
    Routinename = Extract(Lcode, Funclineno, 0, 0);
    Routinename = Field(Field(LTrim(dropLeft(Routinename, '#')), '(', 1), ' ', 1) + '#' + CStr(Count(Routinename, ',') + Abs(Len(Field(Routinename, '(', 2)) > 1)) + '#' + Field(Routinename, '#', 1) + '#' + CStr(Funclineno - Priorlinenums);

    Startpos++;

    // find the next starting line
    Subi = InStr1(Startpos, Scode, am + 'subroutine#');
    Funci = InStr1(Startpos, Scode, am + 'function#');
    Progi = InStr1(Startpos, Scode, am + 'program#');
    Resti = InStr1(Startpos, Scode, am + 'restful#');
    Picki = InStr1(Startpos, Scode, am + 'pick#');

    if (!Subi) Subi = Eof;
    if (!Funci) Funci = Eof;
    if (!Progi) Progi = Eof;
    if (!Resti) Resti = Eof;
    if (!Picki) Picki = Eof;

    if (Funci < Subi) Subi = Funci;
    if (Progi < Subi) Subi = Progi;
    if (Resti < Subi) Subi = Resti;
    if (Picki < Subi) Subi = Picki;

    if (Subi == Eof) return CStr(Eof - 1) + am + Routinename;

    Lineno = Count(Mid1(Scode, 1, Subi), am);
    Elineno = Lineno;

    while (true) {
        if (Lineno == 1) break;
        Pline = Trim(Extract(Lcode, Lineno - 1, 0, 0));
        if (Not(isEmpty(Pline) || Mid1(Pline, 1, 1) == '*' || Mid1(Pline, 1, 2) == '//' || Mid1(Pline, 1, 1) == '\'')) break;
        Lineno--;
    }

    if (Lineno == 1) return CStr(1) + am + Routinename;
    return CStr(Index1(Lcode, am, Lineno - 1)) + am + Routinename;
}
// </FINDENDOFJSBSUB>

// <FJSBCONFIG>
async function JSB_BF_FJSBCONFIG() {
    // Create file if necessary
    return await JSB_BF_FHANDLE('', 'jsb_config', true);
}
// </FJSBCONFIG>

// <FOPEN>
async function JSB_BF_FOPEN(Dict, Fname, Createit) {
    if (Fname === undefined) {
        Fname = Dict;
        Dict = '';
    }

    return await JSB_BF_FHANDLE(Dict, Fname, +Createit);
}
// </FOPEN>

// <FORMATCODE>
function formatCode(Code, Indentation, Showprogress) {
    // local variables
    var Ni, Am, Mixcase, Ftwords, Rpwords, Item, Line1, C255, Ts;
    var Smarkers, Userwords, Luserwords, Injson, Injavascriptblock;
    var Inscriptblock, Linei, Sline, Ci, Skiptoeoc, Checklbl, Lbl;
    var Lbli, J, T, Words, Nline, Word, Wordi, Firstchar, Lword;
    var Isheader, I, Objectstuff, Spot, Uword, Nsline, Llen, C;
    var Je, Smi, Dropstart, Nc, R, Indo, Tline, Ui, Spcs, Dc;

    if (Indentation === undefined) Indentation = 4;
    Ni = Indentation;
    Am = Chr(254);
    Mixcase = [undefined, 'if', 'then', 'for', 'next', 'loop', 'elseif', 'while', 'until', 'ubound', 'chr', 'lbound', 'count', 'dcount', 'repeat',
        'index', 'replace', 'ucase', 'lcase', 'function', 'subroutine', 'sub', 'func', 'end', 'else', 'in', 'each', 'left', 'right',
        'mid', 'and', 'or', 'not', 'true', 'false', 'nothing', 'restful', 'instr', 'field', 'rtrim', 'ltrim', 'hastag'];

    Ftwords = [undefined, 'lcase', 'ucase', 'ltrim', 'rtrim', 'lbound', 'ubound', 'hastag', 'elseif', 'var', 'function', 'this', 'window'];
    Rpwords = [undefined, 'LCase', 'UCase', 'LTrim', 'RTrim', 'LBound', 'UBound', 'HasTag', 'ElseIf', 'var', 'function', 'this', 'window'];

    Code = Change(Code, Chr(9), ' ');
    Code = Change(Code, crlf, Am);
    Item = Split(Code, Am);
    if (UBound(Item) > 10000) return Item;
    Line1 = Item[1];
    if (Left(LTrim(Line1), 1) == '{') return Item;

    C255 = Chr(255);
    Ts = Timer() + 10000;
    Smarkers = '"\'' + '`';
    Userwords = [undefined,];
    Luserwords = [undefined,];
    Injson = 0;
    Injavascriptblock = 0;
    Inscriptblock = 0;

    var _ForEndI_4 = UBound(Item);
    for (Linei = 1; Linei <= _ForEndI_4; Linei++) {
        if (CBool(Showprogress)) Print('*');
        Sline = Item[Linei];
        Ci = Ni;
        Skiptoeoc = false;
        Checklbl = Mid1(Sline, 1, 1) != ' ';
        Sline = LTrim(Sline);
        Lbl = '';

        // Ignore anything starting with a comment marker
        if (InStr1(1, '*!\'/', Mid1(Sline, 1, 1))) {
            // Line starts with a comment
            // If comment at BOL, leave it there, else put it at correct indentation
            if (Not(Checklbl)) Item[Linei] = Space(Ci) + CStr(Sline);
        } else {
            // Remove labels, will put them back later
            if (CBool(Checklbl)) {
                Lbli = Index1(Sline, ':', 1);

                // Find first thing that isn't part of a label (default to eol)
                J = Len(Sline) + 1;
                T = Index1(Sline, ' ', 1);
                if (Null0(T) < Null0(J) && Null0(T) > '0') J = Index1(Sline, ' ', 1);
                T = Index1(Sline, '*', 1);
                if (Null0(T) < Null0(J) && Null0(T) > '0') J = Index1(Sline, '*', 1);
                T = Index1(Sline, '=', 1);
                if (Null0(T) < Null0(J) && Null0(T) > '0') J = Index1(Sline, '=', 1);
                T = Index1(Sline, '(', 1);
                if (Null0(T) < Null0(J) && Null0(T) > '0') J = Index1(Sline, '(', 1);

                // Anything starting with a number is assumed to be a label
                if (Null0(Lbli) == '0' && isNumber(Mid1(Sline, 1, 1))) Lbli = J;
                if (Null0(Lbli) > Null0(J)) Lbli = 0;
                if (Null0(Lbli) > 1 && Null0(Lbli) <= Null0(J)) {
                    Lbl = LTrim(Mid1(Sline, 1, +Lbli - 1) + ': ');
                    if (Mid1(Sline, Lbli, 1) == ':') {
                        Sline = LTrim(Mid1(Sline, +Lbli + 1, 999));
                    } else {
                        Sline = LTrim(Mid1(Sline, Lbli, 999));
                    }
                }
            }

            Words = Split(Change(Sline, ' ', C255), 1);
            Nline = [undefined,];

            Wordi = LBound(Words) - 1;
            for (Word of iterateOver(Words)) {
                Wordi++;
                Firstchar = Mid1(Word, 1, 1);

                if (Firstchar == '.') {
                    Wordi++; // next is object name;
                } else if (Firstchar == '{') {
                    Injson++;;
                } else if (Firstchar == '}') {
                    Injson--;;
                } else if (CBool(Injson)) {
                    Words[Wordi] = Change(Word, C255, ' ');;
                } else if (isAlpha(Firstchar)) {
                    Lword = LCase(Word);

                    if (Null0(Wordi) == 1) {
                        if (Locate(Lword, [undefined, 'function', 'func', 'sub', 'subroutine', 'program'], 0, 0, 0, "", position => { })) Isheader = true; else Isheader = false;
                    } else if (Null0(Wordi) == 3 && CBool(Isheader)) {
                        if (InStr1(1, LCase(Item[+Linei + 1]), 'async-') || InStr1(1, LCase(Item[+Linei + 2]), 'async-') || InStr1(1, LCase(Item[+Linei + 3]), 'async-')) {
                            Words[Wordi] = Change(Word, C255, ' ');
                            continue;
                        }
                    }

                    I = InStr1(1, Word, '.');
                    if (CBool(I)) {
                        Objectstuff = Mid1(Word, I);
                        Word = Left(Word, +I - 1);
                        Lword = LCase(Word);
                    } else {
                        Objectstuff = '';
                    }

                    if (Locate(Lword, Ftwords, 0, 0, 0, "", position => Spot = position)) {
                        Words[Wordi] = CStr(Rpwords[Spot]) + CStr(Objectstuff);;
                    } else {
                        if (Locate(Lword, Mixcase, 0, 0, 0, "", position => { })) {
                            Words[Wordi] = UCase(Mid1(Word, 1, 1)) + Mid1(Lword, 2) + CStr(Objectstuff);;
                        } else {
                            if (Locate(Lword, Luserwords, 0, 0, 0, "", position => Spot = position)) {
                                Words[Wordi] = CStr(Userwords[Spot]) + CStr(Objectstuff);
                            } else {
                                Uword = UCase(Word);
                                if (Null0(Word) == Null0(Uword) || Null0(Word) == Null0(Lword)) {

                                    Words[Wordi] = Mid1(Uword, 1, 1) + Mid1(Lword, 2, 999) + CStr(Objectstuff);
                                } else {
                                    Userwords[Userwords.length] = Word;
                                    Luserwords[Luserwords.length] = Lword;
                                }
                            }
                        }
                    }
                } else {
                    Words[Wordi] = Change(Word, C255, ' ');
                }
            }

            Sline = RTrim(Join(Words, ''));

            // Mast out strings (NSLINE) - use this to determine indentation
            Nsline = '';
            if (Index1(Sline, '"', 1) || Index1(Sline, '\'', 1) || Index1(Sline, '`', 1)) {
                Llen = Len(Sline);
                var _ForEndI_32 = +Llen;
                for (J = 1; J <= _ForEndI_32; J++) {
                    C = Mid1(Sline, J, 1);
                    if (InStr1(1, Smarkers, C)) {
                        J = InStr1(+J + 1, Sline, C);
                        if (CBool(J)) {
                            C = 'X';
                        } else {
                            J = +Llen + 1;
                            if (C == '`') Skiptoeoc = true;
                            if (C == '\'') C = ''; else C = 'X';
                        }
                    }
                    Nsline = CStr(Nsline) + CStr(C);
                }
            } else {
                Nsline = Sline;
            }
            Nsline = UCase(Nsline);

            // Remove trailing comments
            if (Index1(Nsline, '\'', 1)) Nsline = Field(Nsline, '\'', 1);
            if (Index1(Nsline, '//', 1)) {
                Nsline = Field(Nsline, '//', 1);
            }
            if (Index1(Nsline, ';*', 1)) { Nsline = Field(Nsline, ';*', 1); }

            // Mask out Script Blocks <% ... %>
            if (CBool(Inscriptblock)) {
                Je = InStr1(1, Nsline, '%\>');
                if (CBool(Je)) {
                    Nsline = Mid1(Nsline, +Je + 2);
                    Inscriptblock = false;
                } else {
                    Nsline = '';
                }
            }


            while (true) {
                J = InStr1(1, Nsline, '\<%');
                if (Not(CBool(J))) break;
                Je = InStr1(+J + 2, Sline, '%\>');
                if (CBool(Je)) {
                    Nsline = Left(Nsline, +J - 1) + Mid1(Nsline, +Je + 2);
                } else {
                    Nsline = Left(Nsline, +J - 1);
                    Inscriptblock = true;
                }
            }

            // CHECK FOR JAVASCRIPT BLOCK
            if (Left(Nsline, 12) == 'JAVASCRIPT {' || CBool(Injavascriptblock)) {
                Injavascriptblock += Count(Nsline, '{');
                Injavascriptblock -= Count(Nsline, '}');;
            } else if (Not(Inscriptblock)) {
                // Drop end of line comments
                Smi = Index1(Nsline, ';', 1);
                if (Not(Smi)) Smi = Index1(Nsline, ':', 1);
                if (CBool(Smi)) {
                    Dropstart = +Smi - 1;

                    do {
                        Smi++;
                        Nc = Mid1(Nsline, Smi, 1);
                    }
                    while (Nc == ' ');
                    if (Nc == '\'') if (InStr1(1, Nsline, 'PRINT') == 0) Nc = '*';
                    if (InStr1(1, '*!/', Nc)) Nsline = Left(Nsline, Dropstart);
                }

                // Pad front and Back
                Nsline = ' ' + Trim(Nsline) + ' ';

                // ******************************************************************************************************************
                // ******************************************************************************************************************
                // *************         lOOK FOR THINGS THAT INCREASE/DECREASE INDENTATION              ****************************
                // ******************************************************************************************************************
                // ******************************************************************************************************************
                R = 1;

                while (Index1(Nsline, '{', R)) {
                    Ni = +Ni + Indentation; R = +R + 1;
                }
                R = 1;

                while (Index1(Nsline, '}', R)) {
                    Ni = +Ni - Indentation; R = +R + 1;
                }

                R = 1;

                while (Index1(Nsline, ' FOR ', R)) {
                    Ni = +Ni + Indentation; R = +R + 1;
                }
                R = 1;

                while (Index1(Nsline, ' NEXT ', R)) {
                    Ni = +Ni - Indentation; R = +R + 1;
                }

                if (Left(Nsline, 6) == ' NEXT ') Ci = +Ci - Indentation;
                if (Left(Nsline, 2) == ' }') Ci = +Ci - Indentation;
                R = 1;

                while (Index1(Nsline, ' LOOP ', R)) {
                    Ni = +Ni + Indentation; R = +R + 1;
                }
                R = 1;

                while (Index1(Nsline, ' REPEAT ', R)) {
                    Ni = +Ni - Indentation; R = +R + 1;
                }

                R = 1;

                while (Index1(Nsline, ' BEGIN ', R)) {
                    Ni = +Ni + Indentation; R = +R + 1;
                }
                R = 1;

                while (Index1(Nsline, ' BEGIN CASE ', R)) {
                    Ni = +Ni + Indentation; R = +R + 1;
                }
                R = 1;

                while (Index1(Nsline, ' SELECT CASE ', R)) {
                    Ni = +Ni + Indentation * 2; R = +R + 1;
                }

                if (Left(Nsline, 5) == ' END ') { Ni = +Ni - Indentation; Ci = +Ci - Indentation; }
                R = 1;

                while (Index1(Nsline, ' END CASE ', R)) {
                    Ni = +Ni - Indentation; R = +R + 1;
                }
                R = 1;

                while (Index1(Nsline, ' END SELECT ', R)) {
                    Ni = +Ni - Indentation; R = +R + 1;
                }
                R = 1;

                while (Index1(Nsline, ' EXIT FOR ', R)) {
                    Ni = +Ni - Indentation; R = +R + 1;
                }

                if (Left(Nsline, 8) == ' REPEAT ') Ci = +Ci - Indentation;
                if (Left(Nsline, 7) == ' WHILE ') Ci = +Ci - Indentation;
                if (Left(Nsline, 7) == ' UNTIL ') Ci = +Ci - Indentation;
                if (Left(Nsline, 6) == ' CASE ') Ci = +Ci - Indentation;

                if (Left(Nsline, 6) == ' ELSE ' || Left(Nsline, 8) == ' ELSEIF ') { Ci = +Ci - Indentation; Ni = +Ni - Indentation; }
                if (Mid1(Nsline, Len(Nsline) - 5, 6) == ' THEN ' || Right(Nsline, 6) == ' ELSE ') Ni = +Ni + Indentation;

                if (Nsline == ' DO ') { Ni = +Ni + Indentation; Indo++; }
                if (CBool(Indo) && Left(Nsline, 6) == ' LOOP ') { Ni = +Ni - Indentation - Indentation; Ci = +Ci - Indentation; Indo--; }

                if (Left(Nsline, 7) == ' ENDIF ') { Ni = +Ni - Indentation; Ci = +Ci - Indentation; }

                if (Left(Nsline, 11) == ' CASE ELSE ') {
                    Nline = UCase(Trim(Item[+Linei + 1]));
                    if (Left(Nline, 8) != 'END CASE') Ni = +Ni - Indentation;
                }
                if (Left(Nsline, 10) == ' END CASE ') Ci = +Ci - Indentation;
                if (Left(Nsline, 12) == ' END SELECT ') Ci = +Ci - Indentation;

                // ******************************************************************************************************************

                Tline = UCase(Sline);
                if (isEmpty(Sline)) {
                    Item[Linei] = Lbl;;
                } else if (isEmpty(Lbl) && (Mid1(Tline, 1, 11) == 'SUBROUTINE ' || Mid1(Tline, 1, 8) == 'PROGRAM ' || Mid1(Tline, 1, 4) == 'SUB ' || Mid1(Tline, 1, 8) == 'RESTFUL ' || Mid1(Tline, 1, 5) == 'FUNC ' || Mid1(Tline, 1, 9) == 'FUNCTION ' || Mid1(Tline, 1, 5) == 'PICK ' || Mid1(Tline, 1, 6) == 'CLASS ' || Mid1(Tline, 1, 8) == 'PARTIAL ')) {
                    Item[Linei] = Sline;
                    Ni = Indentation;;
                } else if (Left(Tline, 2) == '/*') {
                    if (Null0(Ci) == Indentation && Left(Item[Linei], 1) != ' ') Ui = 0; else Ui = Ci;
                    Ui = +Ui - (InStr1(1, Item[Linei], Left(Sline, 1)) - 1);


                    while (true) {
                        if (Null0(Ui) < '0') {
                            if (Left(Item[Linei], - +Ui) == Space(- +Ui)) {
                                Item[Linei] = Mid1(Item[Linei], - +Ui);
                            }
                        } else {
                            Item[Linei] = Space(Ui) + CStr(Item[Linei]);
                        }

                        if (InStr1(1, Item[Linei], '*/') > 0 || isEmpty(Item[Linei])) break;
                        Linei = +Linei + 1;
                    };
                } else if (Null0(Ci) == Indentation) {
                    if (Mid1(Tline, 1, 1) == '*' || Mid1(Tline, 1, 7) == '$OPTION' || Mid1(Tline, 1, 7) == 'INCLUDE') {
                        if (Left(Item[Linei], 1) != ' ') Ui = 0; else Ui = Ci;
                    } else {
                        Ui = Ci;
                    }
                    Spcs = +Ui - Len(Lbl);
                    if (Null0(Spcs) < 1) Spcs = 0;
                    Item[Linei] = CStr(Lbl) + Space(Spcs) + CStr(Sline);;
                } else {
                    Spcs = +Ci - Len(Lbl);
                    if (Null0(Spcs) < 1) Spcs = 0;
                    Item[Linei] = CStr(Lbl) + Space(Spcs) + CStr(Sline);
                }

                if (CBool(Skiptoeoc)) {

                    do {
                        Linei = +Linei + 1;
                        Dc = Count(Item[Linei], '`');
                    }
                    while (Not(+Dc % 2 == 1 || Null0(Linei) > UBound(Item)));
                }
            }
        }
    }
    if (CBool(Showprogress)) Println();

    return Item;
}
// </FORMATCODE>

// <FORMVAR>
function FORMVAR(Keyname) {
    return Change(window.formVar(Keyname), Chr(160), Chr(32));
}
// </FORMVAR>

// <FORMVARS>
function formVars(Keyname) {
    if (CBool(Keyname)) return formVar(Keyname);
    return window.jsbFormVars();
}
// </FORMVARS>

// <FREAD>
async function JSB_BF_FREAD(Dd, Tblname, Itemname) {
    if (Itemname === undefined) {
        Itemname = Tblname;
        Tblname = Dd;
        Dd = '';
    }

    Dd = Trim(LCase(Dd));
    if (Dd != 'dict') Dd = '';
    var F = await JSB_BF_FHANDLE(Dd, Tblname);
    if (Not(F)) return undefined;

    var Item = '';
    if (await JSB_ODB_READ(Item, F, Itemname, function (_Item) { Item = _Item })); else return undefined;
    return Item;
}
// </FREAD>

// <FREADJSON>
async function JSB_BF_FREADJSON(Dd, Tblname, Itemname) {
    if (Itemname === undefined) {
        Itemname = Tblname;
        Tblname = Dd;
        Dd = '';
    }

    Dd = Trim(LCase(Dd));
    if (Dd != 'dict') Dd = '';
    var F = await JSB_BF_FHANDLE(Dd, Tblname);
    if (Not(F)) return undefined;

    var Item = undefined;
    if (await JSB_ODB_READJSON(Item, F, Itemname, function (_Item) { Item = _Item })); else return undefined;
    return Item;
}
// </FREADJSON>

// <FSELECT>
async function JSB_BF_FSELECT(ByRef_Tblname, Whereclause, Optdesc, Optval, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tblname)
        return v
    }
    var V = undefined;
    var F = undefined;
    var R = undefined;
    var Sl = undefined;
    var Pkname = '';
    var L = '';

    if (Optdesc === undefined && Whereclause == '*') {
        Optdesc = '*';
        Whereclause = '';
    }

    if (Len(Whereclause)) Whereclause += ' ';

    F = await JSB_BF_FHANDLE(CStr(ByRef_Tblname));
    if (!Optdesc) {
        if (JSB_BF_TYPEOFFILE(F) == 'http') Pkname = 'ItemID'; else Pkname = await JSB_BF_PRIMARYKEYNAME(F);
        if (await JSB_ODB_SELECTTO('', F, Whereclause + 'order by ' + Pkname, Sl, function (_Sl) { Sl = _Sl })); else { Alert(CStr(activeProcess.At_Errors)); return exit([undefined,]); }
        return exit(getList(Sl));
    }

    if (Optdesc == '*') {
        if (JSB_BF_TYPEOFFILE(F) == 'http') Pkname = 'ItemID'; else Pkname = await JSB_BF_PRIMARYKEYNAME(F);
        if (await JSB_ODB_SELECTTO('*', F, Whereclause + 'order by ' + Pkname, Sl, function (_Sl) { Sl = _Sl })); else { Alert(CStr(activeProcess.At_Errors)); return exit([undefined,]); }
        return exit(getList(Sl));
    }

    if (Optval) {
        if (await JSB_ODB_SELECTTO('[' + Optdesc + '],[' + CStr(Optval) + ']', F, Whereclause + 'order by [' + Optdesc + ']', Sl, function (_Sl) { Sl = _Sl })); else { Alert(CStr(activeProcess.At_Errors)); return exit([undefined,]); }
        return exit(getList(Sl));
    }

    if (await JSB_ODB_SELECTTO('[' + Optdesc + ']', F, Whereclause + 'order by [' + Optdesc + ']', Sl, function (_Sl) { Sl = _Sl })); else { Alert(CStr(activeProcess.At_Errors)); return exit([undefined,]); }
    L = getList(Sl);
    V = [undefined,];
    for (R of iterateOver(L)) {
        V[V.length] = R[Optdesc];
    }

    return exit(V);
}
// </FSELECT>

// <FWRITE>
async function JSB_BF_FWRITE(Item, Dd, Tblname, Itemname) {
    if (Itemname === undefined) {
        Itemname = Tblname;
        Tblname = Dd;
        Dd = '';
    }

    Dd = Trim(LCase(Dd));
    if (Dd != 'dict') Dd = '';

    var F = await JSB_BF_FHANDLE(Dd, Tblname);
    if (Not(F)) return false;

    if (await JSB_ODB_WRITE(CStr(Item), F, Itemname)); else return false;
    return true;
}
// </FWRITE>

// <FWRITEJSON>
async function JSB_BF_FWRITEJSON(Item, Dd, Tblname, Itemname) {
    if (Itemname === undefined) {
        Itemname = Tblname;
        Tblname = Dd;
        Dd = '';
    }

    Dd = Trim(LCase(Dd));
    if (Dd != 'dict') Dd = '';

    var F = await JSB_BF_FHANDLE(Dd, Tblname);
    if (Not(F)) return false;

    if (await JSB_ODB_WRITEJSON(Item, F, Itemname)); else return false;
    return true;
}
// </FWRITEJSON>

// <GENEVENTHANDLER>
function genEventHandler(Eventname, Url, Containertype, Containername, Addfrompage, Passthruparams) {
    var S = undefined;
    var I = undefined;
    var Genurl = '';
    var Msg = '';

    if (CNum(Containertype) == 0) Containertype = 2;
    S = [undefined,];

    Genurl = Url;
    if (Containername) {
        if (Index1(LCase(Genurl), '{containername}', 1)) {

            while (true) {
                I = Index1(LCase(Genurl), '{containername}', 1);
                if (Not(I)) break;
                Genurl = Left(Genurl, I - 1) + CStr(Containername) + Mid1(Genurl, I + Len('containerName'));
            }
        } else if (Containertype == 1 || Containertype == 2 || Containertype == 8 || Containertype == 10 || Containertype == 12 || Containertype == 13) {
            Genurl = RTrim(Genurl);
            if (Right(Genurl, 1) == '?' || Right(Genurl, 1) == '&' || Left(Containername, 1) == '?' || Left(Containername, 1) == '&') {
                Genurl += CStr(Containername);
            } else {
                if (InStr1(1, Genurl, '?')) Genurl += '&' + CStr(Containername); else Genurl += '?' + CStr(Containername);
            }
        }
    }
    if (Right(Genurl, 1) == '?' || Right(Genurl, 1) == '&') Genurl = Left(Genurl, Len(Genurl) - 1);
    Genurl = jsEscapeString(Genurl);

    if (InStr1(1, Genurl, '{') || InStr1(1, Genurl, '%7B')) { Genurl = 'urlCtlSubstitutions(' + Genurl + ', parentDataRow, primaryKeyName); '; }

    S[S.length] = 'function eventHandler_' + CStr(Eventname) + '(parentDataRow, primaryKeyName) {';
    S[S.length] = '   var selectedID = parentDataRow[primaryKeyName];';

    if (Containertype == 13) {
        S[S.length] = ' var Url = queryVar("frompage");';
        if (Genurl) S[S.length] = ' if (!Url) Url = ' + Genurl; else { S[S.length] = ' if (!Url) return window.history.back();'; }
    } else {
        S[S.length] = '   var Url = ' + Genurl;
    }

    S[S.length] = ('   if ((gup(\'inTheme\')==1) && (InStr(Url, \'inTheme=\')==-1)) {');
    S[S.length] = ('      if (InStr(Url, \'?\') \> 0) Url += \'&inTheme=1\'; else Url += \'?inTheme=1\';');
    S[S.length] = '   }';

    if (Addfrompage) {
        S[S.length] = ('   if (InStr(Url, \'?\') \> 0) Url += \'&fromPage=\' + urlEncode(myLocation()); else Url += \'?fromPage=\' + urlEncode(myLocation()); ');
    }

    if (Passthruparams) {
        S[S.length] = ('   passthruParams = Replace(Replace(Field(myLocation(), \'?\', 2), \'new1rec=newRecord\', \'\'), \'&&\', \'&\'); ');
        S[S.length] = '   if (passthruParams) {';
        S[S.length] = ('      if (InStr(Url, \'?\') \> 0) Url += \'&\' + passthruParams; else Url += \'?\' + passthruParams;');
        S[S.length] = '   } ';
    }

    // S[-1] = `   alert('on parent `:eventName:` Url' + Url +' ct: `:containerType:`');`

    // 10 open in current window (if containerName given then it is Url Extra)
    // 11 pure javascript in containerName
    // 12 open in top window (if containerName given then it is Url Extra)

    // 13 Back Page: due window history back (uses fromPage if it exists)

    // 16 Close Window
    // 17 Return a PICK value
    // 18 Force jqGrid to reload (containerName is jqGridID) - does $('#':jqGridID).trigger( 'reloadGrid' );

    // Types: 10, 12, 13, 16 will warn if page is dirty (window._isDirty)

    switch (Containertype) {
        case 11:
            if (Url) Msg = 'leave this page';
            break;

        case 10: case 12:
            // open URL
            Msg = 'leave this page';
            break;

        case 13:
            // go back
            Msg = 'leave this page';
            break;

        case 16:
            // close
            Msg = 'close this page';
            break;

        default:
            Msg = '';
    }

    if (Msg) {
        S[S.length] = '   if (window._isDirty) {';
        S[S.length] = '      if (!confirm("You have changed this record, are you sure you want to ' + Msg + '?")) return false; ';
        S[S.length] = '   }';
    }

    switch (Containertype) {
        case 1:
            // Open In A New Window
            S[S.length] = '   new windowOpen(Url, \'_blank\'); '; // 'height=' + $(Window).height() + ',width=' + $(Window).width()

            break;

        case 2:
            // Open In A New Window Tab
            S[S.length] = 'new windowOpen(Url, \'_blank\');';

            break;

        case 3:
            // Open In A New jQuery Tab (containerName Is The TabID, Title: Is The Name To Use For The New Or Existing Tab)
            S[S.length] = '   openInTab("' + CStr(Containername) + '", stripNonIdentifierCharacters(selectedID), selectedID, Url, Url); ';

            break;

        case 4:
            // Open In An Iframe
            S[S.length] = '   openInIFrame("' + CStr(Containername) + '", Url); ';

            break;

        case 5:
            // Open In A Div
            S[S.length] = '   openInDiv("' + CStr(Containername) + '", Url); ';

            break;

        case 6:
            // Open In A jQuery Model DIalog
            S[S.length] = '   new popoutWindow(\'' + CStr(Containername) + '\', Url, \'80%\', \'auto\');';

            break;

        case 7:
            // Post Back With Hiddenvar (containerName) Set To selectedID
            S[S.length] = '  postBack("' + CStr(Containername) + '", selectedID /* goes into ContainerName */, "' + CStr(Eventname) + '" /* goes into postBackTitle */, parentDataRow /* goes into postBackUrl */); ';

            break;

        case 8:
            // httpGet To Url With Parameter containerName
            S[S.length] = '   new windowOpen(Url, \'_blank\' ); ';

            break;

        case 9:
            // (Unused)

            break;

        case 10:
            // Open In A Current Window
            S[S.length] = '   new windowOpen(Url, \'_self\'); ';

            break;

        case 11:
            // Pure Javascript In containerName
            S[S.length] = CStr(Containername) + '; ';
            if (Url) { S[S.length] = '   new windowOpen(Url, \'_self\'); '; }

            break;

        case 12:
            // Open In A Top Window
            S[S.length] = '   new windowOpen(Url, \'_top\'); ';

            break;

        case 13:
            // Back (fromPage) given
            S[S.length] = '   new windowOpen(Url, \'_self\'); ';

            break;

        case 14:
            // Next Tab

            break;

        case 15:
            // Previous Tab

            break;

        case 16:
            S[S.length] = ' new windowOpen(jsbRoot() + \'close_html\', \'_self\'); ';

            break;

        case 17:
            // Return Pick Value
            S[S.length] = '   window.location = \'close_html?ans=\' + urlDecode(selectedID); ';
    }
    S[S.length] = '    return true; ';
    S[S.length] = '} ';

    return JSB_HTML_SCRIPT(Join(S, crlf));
}
// </GENEVENTHANDLER>

// <GET_Pgm>
async function JSB_BF_GET_Pgm() {  // PROGRAM
    Commons_JSB_BF = {};
    Equates_JSB_BF = {};

    [undefined, 'Function Get(ByVal Url As String, optional byval method As String, optional ByRef header As Object, optional ByRef body As String, optional ByVal opts As String) As String', '*', '* Returns Nothing on errors. ie, test with IsNothing(result)', '*', '* Method: \"GET\", POST, PUT, DELETE', '* Header: [\"Content-Type: text/html\", \"charset=utf-8\", \"Cache-Control: no-store\"] - see //en.wikipedia.org/wiki/List_of_HTTP_header_fields', '* Url:    \"//....\"', '* Body:   \"_p1=\":@jsb_bf.UrlEncode(DictData):\"&\":\"_p2=\":@jsb_bf.UrlEncode(fName)', '* Opts\u003C1\u003E:   \"\" or \"N\" for no redirecting', '* Opts\u003C2\u003E: Timeout in seconds', '* ', '    if !method Then method = \"GET\"', '    ', '    if ismissing(body) then', '        if method = \"PUT\" or method = \"POST\" then', '            body = header', '            header = nothing', '        end if', '    end if', '    ', '    // Are we profiling?', '    if system(64) and !InStrget(system(64), \"-\") Then', '        Dim gets As Array = @userVar(\'gets\')', '        if !gets then gets = []', '        gets[-1] = url', '        @userVar(\'gets\', gets)', '    end if', '    ', '    method = ucase(method)', '    Dim uHeader As String', '    If TypeOf(header) = \"Array\" Then ', '        uHeader = Join(Header, VM()) ', '    Else If Instr(Header, AM()) Then', '        uHeader = Lower(header)', '    \'ElseIf !Header Then', '    \'    uHeader = \"Cache-Control: no-store\"', '    \'    \' application/json; charset=UTF-8', '    \'    If Method = \"POST\" or Method = \"PUT\" Then uHeader\u003C1,-1\u003E = \"Content-Type: application/x-www-form-urlencoded; charset=UTF-8\" ', '    Else', '        uHeader = header', '    End If', '', '    Dim ADR As String = Url   ', '    Dim protocol As String = left(adr, 11)', '    if instr(protocol, \":\") Then', '        protocol = field(protocol, \":\", 1)', '        if left(adr, len(protocol)) = protocol then', '            adr = adr[len(protocol) + 2,999]', '        End If', '    else', '        protocol = @protocol', '    end if', '    protocol := \":\"', '    ', '    if left(adr, 2) = \"//\" Then ', '        adr = mid(adr, 3)', '        protocol := \"//\"', '    End If', '    ', '    Dim fhandle As FileHandle', '    i_open protocol to fhandle else Return Nothing', '', '    Dim www As String = adr', '    www\u003C2\u003E = Method', '    if uheader Then www\u003C3\u003E = uheader', '    if (method = \"PUT\" or method = \"POST\") And Body then www\u003C4\u003E = Body', '    If Opts Then www\u003C5\u003E = Opts ;* N FOR NO REDIRECT (Also loads www\u003C6\u003E for timeout value)', '', '    // This can do a POST too when www\u003C2\u003E is set to the method', '    Dim Doc As String', '    i_read doc from fhandle, www else ', '        if system(1) = \"js\" then window.stopSpinner()', '        Header = @Errors', '        Return doc', '    end if', '', '    Header = @Errors', '*', '*  If Result is RTF-8, then we need to convert SM, AM, VM, SVM back to single values', '*', '    Dim CT As String = InStr(uHeader, \"Content-Type\")', '    If CT Then CT = LCase(Mid(uHeader, CT))\u003C1\u003E Else CT = \"\"', '', '    Dim IsUTF8 As Boolean = InStr(uHeader, \"charset=UTF-8\") Or InStr(Header, \"charset=UTF-8\")', '    If !IsUTF8 And (InStr(CT, \"text\") \u003C\u003E 0 Or InStr(CT, \"application\") \u003C\u003E 0) And InStr(CT, \"charset=\") = 0 Then IsUTF8 = True', '', '    If IsUTF8 Then', '        Doc = Replace(Doc, Chr(195):Chr(191), Chr(255))', '        Doc = Replace(Doc, Chr(195):Chr(190), Chr(254))', '        Doc = Replace(Doc, Chr(195):Chr(189), Chr(253))', '        Doc = Replace(Doc, Chr(195):Chr(187), Chr(251))', '        Doc = Replace(Doc, Chr(195):Chr(187), Chr(251))', '    End If', '', '    Return doc', 'End Function', ''];
    return;
}
// </GET_Pgm>

// <GETBLUETOOTHBONDEDLIST>
async function JSB_BF_GETBLUETOOTHBONDEDLIST() {
    // local variables
    var Bondedlist, _Err, Callbacknumber;

    await new Promise(resolve => bluetoothSerial.list(function (_Bondedlist) { Bondedlist = _Bondedlist; Callbacknumber = 1; resolve(Callbacknumber) }, function (__Err) { _Err = __Err; Callbacknumber = 2; resolve(Callbacknumber) }));
    if (Null0(Callbacknumber) == 2) { activeProcess.At_Errors = _Err; return undefined; }
    return Bondedlist;
}
// </GETBLUETOOTHBONDEDLIST>

// <GETBLUETOOTHUNPAIREDLIST>
async function JSB_BF_GETBLUETOOTHUNPAIREDLIST() {
    // local variables
    var Devicelist, _Err, Callbacknumber;

    await new Promise(resolve => bluetoothSerial.discoverUnpaired(function (_Devicelist) { Devicelist = _Devicelist; Callbacknumber = 1; resolve(Callbacknumber) }, function (__Err) { _Err = __Err; Callbacknumber = 2; resolve(Callbacknumber) }));
    if (Null0(Callbacknumber) == 2) { activeProcess.At_Errors = _Err; return undefined; }
    return Devicelist;
}
// </GETBLUETOOTHUNPAIREDLIST>

// <GETDEFAULTVALUE>
function getDefaultValue(Currentvalue, Defaultvalue, Columnname, Viewname) {
    var Defaultvalues = undefined;
    var Fncname = '';
    var Param = '';
    var Newdefaultvalue = '';

    if (!isNothing(Currentvalue)) return Currentvalue;
    if ((Left(Defaultvalue, 2) == '[{' && Right(Defaultvalue, 2) == '}]') || Defaultvalue == '[]') return parseJSON(Defaultvalue);
    if (!InStr1(1, Defaultvalue, '{')) return Defaultvalue;

    if (Count(Defaultvalue, '{') != Count(Defaultvalue, '}')) { Alert('Mismatched {} in default value ' + CStr(Defaultvalue) + '; in field ' + CStr(Columnname)); }

    Newdefaultvalue = '';
    Defaultvalues = Split(Defaultvalue, '}');
    for (Fncname of iterateOver(Defaultvalues)) {
        Newdefaultvalue += Field(Fncname, '{', 1);
        Fncname = Field(Fncname, '{', 2);

        // Are we passing a parameter to the function?
        if (InStr1(1, Fncname, '(') && Right(Fncname, 1) == ')') {
            Param = Field(Fncname, '(', 2);
            Param = Left(Param, Len(Param) - 1);
            Fncname = Field(Fncname, '(', 1);

            if (Left(Param, 1) == '\'' && Right(Param, 1) == '\'') {
                Param = Mid1(Param, 2, Len(Param) - 2);
            } else if (Left(Param, 1) == '"' && Right(Param, 1) == '"') {
                Param = Mid1(Param, 2, Len(Param) - 2);
            }
        }
        if (Left(Fncname, 1) == '@') Fncname = Mid1(Fncname, 2);

        switch (LCase(Fncname)) {
            case 'objectname': case 'viewname':
                Newdefaultvalue += CStr(Viewname);

                break;

            case 'niceobjectname': case 'niceviewname':
                Newdefaultvalue += JSB_BF_NICENAME(CStr(Viewname));

                break;

            case 'paramvar': case '@param':
                Newdefaultvalue += CStr(paramVar(Param));

                break;

            case 'sessionvar': case '@session': case '@sessionvar':
                Newdefaultvalue += sessionVar(Param);

                break;

            case 'lastvalue':
                Newdefaultvalue += At_Session.Item('LastValue' + CStr(Columnname));

                break;

            case 'applicationvar': case '@application':
                Newdefaultvalue += ApplicationVar(Param);

                break;

            case 'queryvar': case 'urlparam': case 'urlvar': case '@param':
                Newdefaultvalue += CStr(queryVar(Param));

                break;

            case 'time':
                Newdefaultvalue += r83Time(r83Time());

                break;

            case 'itime':
                Newdefaultvalue += CStr(r83Time());

                break;

            case 'timestamp': case 'now':
                Newdefaultvalue += CStr(Now());

                break;

            case 'yy':
                Newdefaultvalue = Mid1(r83Date(r83Date()), 3, 2);

                break;

            case 'yyyy':
                Newdefaultvalue = JSB_BF_THEYEAR(r83Date());

                break;

            case 'mm':
                Newdefaultvalue = JSB_BF_THEMONTH(r83Date());

                break;

            case 'dd':
                Newdefaultvalue = JSB_BF_THEDAY(r83Date());

                break;

            case 'idate':
                Newdefaultvalue += CStr(r83Date());

                break;

            case 'date':
                Newdefaultvalue += r83Date(r83Date());

                break;

            case 'datetime':
                Newdefaultvalue += DateTime();

                break;

            case 'timedate':
                Newdefaultvalue += JSB_BF_TIMEDATE();

                break;

            case 'guid':
                Newdefaultvalue += JSB_BF_NEWGUID();

                break;

            case 'username':
                Newdefaultvalue += UserName();

                break;

            case '':
                break;

            default:
                Alert('I don\'t understand the default value function {' + Fncname + '} in field ' + CStr(Columnname));
        }
    }

    return Newdefaultvalue;
}
// </GETDEFAULTVALUE>

// <GETDEFINEDDBS>
async function JSB_BF_GETDEFINEDDBS(ByRef_Newdbfound, ByRef_Databasenames, ByRef_Dbgroups, ByRef_Defineddbs, setByRefValues) {
    // local variables
    var Groupname, Grpi, Level, Dbname, Dbi;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Newdbfound, ByRef_Databasenames, ByRef_Dbgroups, ByRef_Defineddbs)
        return v
    }
    if (Not(ByRef_Defineddbs)) ByRef_Defineddbs = [undefined,];
    Grpi = LBound(ByRef_Dbgroups) - 1;
    for (Groupname of iterateOver(ByRef_Dbgroups)) {
        Grpi++;
        Level = ByRef_Dbgroups[Groupname];
        if (isJSON(Level)) {
            await JSB_BF_GETDEFINEDDBS(ByRef_Newdbfound, ByRef_Databasenames, Level, ByRef_Defineddbs, function (_ByRef_Newdbfound, _ByRef_Databasenames, _Level, _ByRef_Defineddbs) { ByRef_Newdbfound = _ByRef_Newdbfound; ByRef_Databasenames = _ByRef_Databasenames; Level = _Level; ByRef_Defineddbs = _ByRef_Defineddbs });
        } else if (CBool(isArray(Level))) {
            Dbi = LBound(Level) - 1;
            for (Dbname of iterateOver(Level)) {
                Dbi++;
                if (Locate(Dbname, ByRef_Databasenames, 0, 0, 0, "", position => { })) {
                    Dbname = LCase(Dbname);
                    if (Locate(Dbname, ByRef_Defineddbs, 0, 0, 0, "", position => { })); else ByRef_Defineddbs[ByRef_Defineddbs.length] = Dbname;
                } else {
                    Level.Delete(Dbi);
                    ByRef_Newdbfound = true;
                    return exit(await JSB_BF_GETDEFINEDDBS(ByRef_Newdbfound, ByRef_Databasenames, ByRef_Dbgroups, ByRef_Defineddbs, function (_ByRef_Newdbfound, _ByRef_Databasenames, _ByRef_Dbgroups, _ByRef_Defineddbs) { ByRef_Newdbfound = _ByRef_Newdbfound; ByRef_Databasenames = _ByRef_Databasenames; ByRef_Dbgroups = _ByRef_Dbgroups; ByRef_Defineddbs = _ByRef_Defineddbs }));
                }
            }
        } else {
            Dbname = Level;
            if (Locate(Dbname, ByRef_Databasenames, 0, 0, 0, "", position => { })) {
                Dbname = LCase(Dbname);
                if (Locate(Dbname, ByRef_Defineddbs, 0, 0, 0, "", position => { })); else ByRef_Defineddbs[ByRef_Defineddbs.length] = Dbname;
            } else {
                delete ByRef_Dbgroups[Groupname]
                ByRef_Newdbfound = true;
                return exit(await JSB_BF_GETDEFINEDDBS(ByRef_Newdbfound, ByRef_Databasenames, ByRef_Dbgroups, ByRef_Defineddbs, function (_ByRef_Newdbfound, _ByRef_Databasenames, _ByRef_Dbgroups, _ByRef_Defineddbs) { ByRef_Newdbfound = _ByRef_Newdbfound; ByRef_Databasenames = _ByRef_Databasenames; ByRef_Dbgroups = _ByRef_Dbgroups; ByRef_Defineddbs = _ByRef_Defineddbs }));
            }
        }
    }
    return exit(ByRef_Defineddbs);
}
// </GETDEFINEDDBS>

// <GETJSONCOLUMNDEFS>
async function JSB_BF_GETJSONCOLUMNDEFS(Jsonitem, Primarykeyname, Itemid) {
    var Sqlrows = undefined;
    var Firstone = undefined;
    var Ordinal = undefined;
    var Mrow = undefined;
    var Def = undefined;
    var Tn = '';
    var Defs = '';
    var _Label = '';
    var V = '';

    Sqlrows = [undefined,];
    Firstone = Not(Primarykeyname);

    Ordinal = LBound(Jsonitem) - 1;
    for (Tn of iterateOver(Jsonitem)) {
        Ordinal++;
        Mrow = {};
        Defs = await JSB_BF_VIEWCOLUMNS();
        for (Def of iterateOver(Defs)) {
            if (CBool(Def.name)) Mrow[Def.name] = Def.defaultvalue;
        }

        Defs = await JSB_BF_TABLECOLUMNS();
        for (Def of iterateOver(Defs)) {
            if (CBool(Def.name)) Mrow[Def.name] = Def.defaultvalue;
        }

        Mrow.name = Tn;
        _Label = Tn;
        V = Jsonitem[Tn];

        if (LCase(_Label) == _Label || UCase(_Label) == _Label) _Label = UCase(Left(_Label, 1)) + LCase(Mid1(_Label, 2));
        Mrow.label = Trim(Change(_Label, '_', ' '));
        Mrow.primarykey = false;
        Mrow.datatype = 'string'; // guid;autointeger;integer;double;boolean;string;date;time;datetime;currency;blob;png;jpg;collection;url;memo;password,jsonarray,jsonrow
        Mrow.defaultvalue = '';
        Mrow.tooltip = Mrow.label;
        Mrow.align = ''; // left;right
        Mrow.reffile = '';
        Mrow.refsql = '';
        Mrow.refpk = '';
        Mrow.refwhere = '';
        Mrow.refdisplay = '';
        Mrow.required = false;
        Mrow.notblank = false;
        Mrow.iminvalue = '';
        Mrow.imaxvalue = '';
        Mrow.xminvalue = '';
        Mrow.xmaxvalue = '';
        Mrow.regx = '';
        Mrow.regxtext = '';
        Mrow.ordinal = Ordinal;
        Mrow.canedit = true;

        if (LCase(Tn) == LCase(Primarykeyname) || (Firstone && V == Itemid)) {
            Mrow.primarykey = true;
            Firstone = false;
        }

        switch (typeOf(V)) {
            case 'Null':
                Mrow.datatype = 'string';

                break;

            case 'String':
                Mrow.datatype = 'string';
                // Does V look like a date?, time?, Currency?

                if (Count(V, ':') == 2 && Len(V) <= 8 && CNum(Field(V, ':', 1)) <= 24 && CNum(Field(V, ':', 2)) <= 59 && CNum(Field(V, ':', 3)) <= 59) {
                    Mrow.datatype = 'time';
                }
                if (Count(V, '/') == 2 && Len(V) <= 10 && CNum(Field(V, '/', 1)) >= 1 && CNum(Field(V, '/', 2)) >= 1 && CNum(Field(V, '/', 2)) <= 12 && CNum(Field(V, '/', 3)) >= 1) {
                    Mrow.datatype = 'date';
                }
                if (Left(V, 1) == '$' && isNumeric(Mid1(V, 2))) {
                    Mrow.datatype = 'Currency';
                    Mrow.align = 'right';
                }
                break;

            case 'Integer':
                Mrow.datatype = 'integer'; Mrow.align = 'right';
                if (CBool(Mrow.primarykey)) Mrow.datatype = 'autointeger';
                break;

            case 'Boolean':
                Mrow.datatype = 'boolean';
                break;

            case 'Double':
                Mrow.datatype = 'double'; Mrow.align = 'right';
                break;

            case 'GUID':
                Mrow.datatype = 'guid'; Mrow.canedit = false; Mrow.defaultvalue = '{guid}';
                break;

            default:
                Mrow.datatype = 'blob';
                Mrow.sortable = false;
                Mrow.canedit = false;
        }

        Sqlrows[Sqlrows.length] = Mrow;
    }
    return Sqlrows;
}
// </GETJSONCOLUMNDEFS>

// <GETLOGS>
async function JSB_BF_GETLOGS(Types, Noformating, Limitcnt) {
    var onError;
    var gotoLabel = "";
    atgoto: while (true) {
        try {
            switch (gotoLabel) {
                case "":
                    // %options aspx, aspxC-

                    var Logs = undefined;
                    var Newlogs = undefined;
                    var Htmllog = undefined;
                    var Header = undefined;
                    var Nottype = undefined;
                    var F = undefined;
                    var Typeno = undefined;
                    var Cnt = undefined;
                    var I = undefined;
                    var Sl = undefined;
                    var Jlogs = '';
                    var D = '';
                    var Row = undefined;
                    var Fromdate = '';
                    var Type = '';

                    if (System(1) == 'js') {
                        if (await JSB_ODB_OPEN('', 'errlog', F, function (_F) { F = _F })) {
                            if (await JSB_ODB_SELECTTO('*', F, '', Sl, function (_Sl) { Sl = _Sl })) {
                                Jlogs = getList(Sl);
                                Logs = [undefined,];
                                for (Row of iterateOver(Jlogs)) {
                                    Logs[Logs.length] = Row.ItemContent;
                                }
                            }
                        }
                    } else {
                        onErrorGoto = "ERROUT";
                        Logs = System(49);
                        Logs = Split(Logs, am);
                        onErrorGoto = null;
                    }

                    Fromdate = Now() - 0.1;
                    Nottype = false;
                    Typeno = 4;

                    for (Type of iterateOver(Split(Types, ','))) {
                        if (Left(Type, 1) == '-') {
                            Fromdate = Now() + +Type / 24 / 60; // Most recent N minutes of logs;
                        } else if (InStr1(1, Type, ':') || InStr1(1, Type, '-') || InStr1(1, Type, '/')) {
                            Fromdate = r83Date(Type);;
                        } else if (CNum(Type) > 1000) {
                            Fromdate = Type;;
                        } else if (CNum(Type) > 4 && !Limitcnt) {
                            Limitcnt = Type;;
                        } else {
                            Nottype = Left(Type, 1) == '!';
                            if (Nottype) Type = Mid1(Type, 2);

                            switch (LCase(Type)) {
                                case 0: case 'i': case 'info': case 'information':
                                    Typeno = 0;
                                    break;

                                case 1: case 'w': case 'warning':
                                    Typeno = 1;
                                    break;

                                case 2: case 'e': case 'error':
                                    Typeno = 2;
                                    break;

                                case 3: case 'c': case 'critical':
                                    Typeno = 3;
                            }
                        }
                    }

                    if (Fromdate) {
                        Newlogs = [undefined,];
                        for (Row of iterateOver(Logs)) {
                            // ' EntryType ] yyy-MM-dd HH:mm:ss ] Source ] EventID ] Category ] Message (svm for crlf's)
                            D = Field(Row, vm, 2);
                            if (D) {
                                D = r83Date(D);
                                if (D >= Fromdate) Newlogs[Newlogs.length] = Row;
                            }
                        }
                        Logs = Newlogs;
                    }

                    if (Typeno < 4) {
                        Newlogs = [undefined,];
                        for (Row of iterateOver(Logs)) {
                            if (Nottype) {
                                if (Field(Row, vm, 1) != Typeno) Newlogs[Newlogs.length] = Row;
                            } else {
                                if (Field(Row, vm, 1) >= Typeno) Newlogs[Newlogs.length] = Row;
                            }
                        }
                        Logs = Newlogs;
                    }

                    Newlogs = [undefined,];
                    Cnt = 0;
                    if (!Limitcnt) Limitcnt = 30;
                    var _ForEndI_19 = LBound(Logs);
                    for (I = UBound(Logs); I >= _ForEndI_19; I--) {
                        Row = Logs[I];

                        Newlogs[Newlogs.length] = Field(Row, vm, 3) + Chr(9) + Field(Row, vm, 1) + Chr(9) + Field(Row, vm, 5) + Chr(9) + Field(Row, vm, 6);
                        Cnt++;
                        if (Cnt > Limitcnt) break;
                    }
                    Logs = Newlogs;

                    if (Noformating) return Logs;

                    Htmllog = [undefined,];
                    Htmllog[Htmllog.length] = CssLink(jsbRoot() + 'js/bootstrap-table/bootstrap-table.css');
                    Htmllog[Htmllog.length] = JsLink(jsbRoot() + 'js/bootstrap-table/bootstrap-table.js');
                    Htmllog[Htmllog.length] = html('\<table data-toggle="table" data-sortable="true" class="jsb_errlogtable table table-striped table-bordered" style="max-width: 95%; white-space: nowrap; font-size:9px;"\>');

                    // Msg:Chr(9):Datetime():Chr(9):@UserName:Chr(9):@Account:Chr(9):@Domain:Chr(9):@IsAdmin
                    Header = [undefined, '\<thead\>\<tr style="font-weight: bold"\>'];
                    Header[Header.length] = '\<th data-sortable="true" style="overflow: hidden; min-width: 70px"\>Source\</th\>';
                    Header[Header.length] = '\<th data-sortable="true" style="overflow: hidden; min-width: 60px"\>Type\</th\>';
                    Header[Header.length] = '\<th data-sortable="true" style="overflow: hidden; min-width: 35px"\>Category\</th\>';
                    Header[Header.length] = '\<th data-sortable="true" style="overflow: hidden; min-width: 150px"\>Message\</th\>';
                    Header[Header.length] = '\<th data-sortable="true" style="overflow: hidden; min-width: 100px"\>DateTime\</th\>';
                    Header[Header.length] = '\<th data-sortable="true" style="overflow: hidden; min-width: 60px"\>User\</th\>';
                    Header[Header.length] = '\<th data-sortable="true" style="overflow: hidden; min-width: 60px"\>Accountth\>';
                    Header[Header.length] = '\<th data-sortable="true" style="overflow: hidden; min-width: 100px"\>Domain\</th\>';
                    Header[Header.length] = '\<th data-sortable="true" style="overflow: hidden; min-width: 35px"\>Adm\</th\>\</tr\>\</thead\>';
                    Htmllog[Htmllog.length] = html(Join(Header, ''));

                    for (Row of iterateOver(Logs)) {
                        Htmllog[Htmllog.length] = html('\<tr\>\<td\>') + Change(Row, Chr(9), html('\</td\>\<td\>')) + html('\</td\>\</tr\>');
                    }
                    Htmllog[Htmllog.length] = [undefined, html('\</table\>')];
                    return Join(Htmllog, '');

                case "ERROUT":

                    return activeProcess.At_Errors;


                default:
                    throw "we entered an invalid gotoLabel: " + gotoLabel;
            } // switch
        } catch (err) {
            err = err2String(err);
            if (err.startsWith('*STOP*')) throw err;
            if (err.startsWith('*END*')) throw err;
            if (_onErrorGoto) {
                gotoLabel = _onErrorGoto;
                if (err.message) activeProcess.At_Errors = err.message; else activeProcess.At_Errors = err;
            } else throw err;
        }
    } // agoto while
}
// </GETLOGS>

// <GETREFCOLUMNNAMES>
async function JSB_BF_GETREFCOLUMNNAMES(Refdisplay) {
    if (Not(Refdisplay)) return '';

    var Columnnames = [undefined,];
    if (InStr1(1, Refdisplay, '{')) {

        while (true) {
            var I = InStr1(1, Refdisplay, '{');
            var E = InStr1(1, Refdisplay, '}');
            if (Not(I > 0 && I < E)) break;
            // Isolate name between {...name...}
            var Columnname = Mid1(Refdisplay, I + 1, E - I - 1);

            // Surround name with []'s
            if (InStr1(1, Columnname, ' ') && Left(Columnname, 1) != '[') Columnname = '[' + Columnname + ']';

            // add to list
            if (Columnname) { if (Locate(Columnname, Columnnames, 0, 0, 0, "", position => { })); else Columnnames[Columnnames.length] = Columnname; }

            // Remove from processing list
            Refdisplay = Mid1(Refdisplay, E + 1);
        }
    } else {
        for (Columnname of iterateOver(Split(Refdisplay, ','))) {
            // Surround name with []'s
            if (InStr1(1, Columnname, ' ') && Left(Columnname, 1) != '[') Columnname = '[' + Columnname + ']';

            // add to list
            if (Columnname) { if (Locate(Columnname, Columnnames, 0, 0, 0, "", position => { })); else Columnnames[Columnnames.length] = Columnname; }
        }
    }

    return Join(Columnnames, ',');
}
// </GETREFCOLUMNNAMES>

// <GETREFDISPLAY>
async function JSB_BF_GETREFDISPLAY(Columnname, Row, Itemid) {
    var Lcolumnname = LCase(Columnname);
    if (Lcolumnname == 'itemid' && CBool(Itemid)) return Itemid;

    if (Left(Lcolumnname, 2) == '*a' && isNumeric(Mid1(Columnname, 3, 1))) {
        var Atrno = CInt(Mid1(Columnname, 3));
        if (isJSON(Row)) {
            var Jrow = Row;
            if (CBool(Jrow['ItemContent'])) return Extract(Jrow['ItemContent'], Atrno, 0, 0);
            return Jrow[Atrno];
        }
        return Extract(Row, Atrno, 0, 0);
    }

    if (!InStr1(1, Columnname, '{')) return Row[Columnname];


    while (true) {
        var I = InStr1(1, Columnname, '{');
        var E = InStr1(1, Columnname, '}');
        if (Not(I > 0 && I < E)) break;
        var Lh = Left(Columnname, I - 1);
        var Rh = Mid1(Columnname, E + 1);
        var Cname = Mid1(Columnname, I + 1, E - I - 1);
        Columnname = Lh + CStr(Row[Cname]) + Rh;
    }

    return Columnname;
}
// </GETREFDISPLAY>

// <GETREFVALUES>
async function JSB_BF_GETREFVALUES(ByRef_Reffile, ByRef_Refwhere, ByRef_Refpk, ByRef_Refdisplay, ByRef_Reflist, ByRef_Crow, ByRef_Rightsort, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Reffile, ByRef_Refwhere, ByRef_Refpk, ByRef_Refdisplay, ByRef_Reflist, ByRef_Crow, ByRef_Rightsort)
        return v
    }
    if (ByRef_Refwhere === undefined) {
        ByRef_Reflist = ByRef_Reffile;
        ByRef_Reffile = '';
    }
    if (ByRef_Rightsort === undefined) {
        ByRef_Rightsort = ByRef_Crow;
        ByRef_Crow = undefined;
    }

    var Columns = undefined;
    var F = undefined;
    var C = undefined;
    var Y = undefined;
    var Projectname = '';
    var Fromcolumn = '';
    var Tablename = '';
    var Values = undefined;

    if (ByRef_Reflist) {
        Values = Split(ByRef_Reflist, ';');;
    } else if (ByRef_Reffile) {
        if (LCase(ByRef_Reffile) == '{listfiles}' || LCase(ByRef_Reffile) == '{roles}' || LCase(ByRef_Reffile) == '{sqlcolumns}' || LCase(ByRef_Reffile) == '{viewcolumns}' || LCase(ByRef_Reffile) == '{allcolumns}') { return exit(await JSB_BF_GETREFVALUESBYSELECT(ByRef_Reffile, ByRef_Refpk, ByRef_Refdisplay, ByRef_Refwhere, ByRef_Rightsort, false, function (_ByRef_Reffile, _ByRef_Refpk, _ByRef_Refdisplay, _ByRef_Refwhere, _ByRef_Rightsort) { ByRef_Reffile = _ByRef_Reffile; ByRef_Refpk = _ByRef_Refpk; ByRef_Refdisplay = _ByRef_Refdisplay; ByRef_Refwhere = _ByRef_Refwhere; ByRef_Rightsort = _ByRef_Rightsort })); }

        Projectname = System(34);
        ByRef_Reffile = Change(ByRef_Reffile, '{projectname}', Projectname);

        if (Left(ByRef_Reffile, 2) == '{!') {
            // Table Columns
            Fromcolumn = Field(Mid1(ByRef_Reffile, 3), '}', 1);
            Tablename = ByRef_Crow[Fromcolumn];
            Values = [undefined,];
            if (Tablename) {
                Columns = await JSB_BF_GETTABLECOLUMNDEFS(Tablename, CStr(false), true);
                for (C of iterateOver(Columns)) {
                    Values[Values.length] = C.name;
                }
                Values = Sort(Values);
            }
        } else if (LCase(ByRef_Reffile) == '{forms}' || LCase(ByRef_Reffile) == '{views}') {
            if (await JSB_ODB_OPEN('dict', Projectname, F, function (_F) { F = _F })) {
                if (await JSB_ODB_SELECTTO('', F, 'ItemId Like \'%.view\'', Y, function (_Y) { Y = _Y })) {
                    Values = Sort(getList(Y));
                } else {
                    Values = [undefined, 'unable to select file ' + Projectname + ' ' + 'Modeler-' + CStr(System(28)) + ': ' + CStr(activeProcess.At_Errors)];
                }
            } else {
                Values = [undefined, 'unable to open file ' + Projectname + ' ' + 'Modeler-' + CStr(System(28)) + ': ' + CStr(activeProcess.At_Errors)];
            }
        } else {
            Values = await JSB_BF_GETREFVALUESBYSELECT(ByRef_Reffile, ByRef_Refpk, ByRef_Refdisplay, ByRef_Refwhere, ByRef_Rightsort, false, function (_ByRef_Reffile, _ByRef_Refpk, _ByRef_Refdisplay, _ByRef_Refwhere, _ByRef_Rightsort) { ByRef_Reffile = _ByRef_Reffile; ByRef_Refpk = _ByRef_Refpk; ByRef_Refdisplay = _ByRef_Refdisplay; ByRef_Refwhere = _ByRef_Refwhere; ByRef_Rightsort = _ByRef_Rightsort });
        }
    } else {
        Values = [undefined, 'Your reffile or reflist is not setup correctly'];
    }

    return exit(Values);
}
// </GETREFVALUES>

// <GETREFVALUESBYSELECT>
async function JSB_BF_GETREFVALUESBYSELECT(ByRef_Reffile, ByRef_Refpk, ByRef_Refdisplay, ByRef_Refwhere, ByRef_Rightalign, Oktocache, setByRefValues) {
    // local variables
    var Refkey, Values, Svalues, Selectlist, Columnnames, Issqlselect;
    var Allrows, Twovalues, Row, W, V, _Err;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                function exit(v) {
                    if (typeof setByRefValues == 'function') setByRefValues(ByRef_Reffile, ByRef_Refpk, ByRef_Refdisplay, ByRef_Refwhere, ByRef_Rightalign)
                    return v
                }
                var Freffile = undefined;

                if (Left(ByRef_Reffile, 1) == '{') { return exit(await JSB_BF_GETREFSPECIALS(ByRef_Reffile, ByRef_Refpk, ByRef_Refdisplay, ByRef_Refwhere, ByRef_Rightalign, CStr(Refkey), function (_ByRef_Reffile, _ByRef_Refpk, _ByRef_Refdisplay, _ByRef_Refwhere, _ByRef_Rightalign) { ByRef_Reffile = _ByRef_Reffile; ByRef_Refpk = _ByRef_Refpk; ByRef_Refdisplay = _ByRef_Refdisplay; ByRef_Refwhere = _ByRef_Refwhere; ByRef_Rightalign = _ByRef_Rightalign })); }

                if (Not(ByRef_Refpk) || !Oktocache) {
                    if (await JSB_ODB_OPEN('', CStr(ByRef_Reffile), Freffile, function (_Freffile) { Freffile = _Freffile })); else { gotoLabel = "ATERROROUT"; continue atgoto; }
                    if (Not(ByRef_Refpk)) ByRef_Refpk = await JSB_BF_PRIMARYKEYNAME(Freffile);
                }

                // Already have a cached version?
                if (Left(ByRef_Refpk, 1) == '[' && Right(ByRef_Refpk, 1) == ']') ByRef_Refpk = Mid1(ByRef_Refpk, 2, Len(ByRef_Refpk) - 2);
                if (Left(ByRef_Refdisplay, 1) == '[' && Right(ByRef_Refdisplay, 1) == ']') ByRef_Refdisplay = Mid1(ByRef_Refdisplay, 2, Len(ByRef_Refdisplay) - 2);

                if (Oktocache) {
                    Refkey = LCase(ByRef_Reffile) + Chr(250) + LCase(ByRef_Refpk) + Chr(250) + LCase(ByRef_Refdisplay) + Chr(250) + LCase(ByRef_Refwhere);
                    var Refcache = At_Session.Item('RefCache');
                    if (CBool(Refcache)) {
                        Values = clone(Refcache[Refkey]);
                        if (CBool(Values)) return exit(Sort(Values, (ByRef_Rightalign ? 'RI' : 'I')));
                    }
                }

                if (Not(Freffile)) {
                    if (await JSB_ODB_OPEN('', CStr(ByRef_Reffile), Freffile, function (_Freffile) { Freffile = _Freffile })); else { gotoLabel = "ATERROROUT"; continue atgoto; }
                }

                // Predefined list of values already stored in RefFile?
                if (Left(ByRef_Refwhere, 1) == '!') {
                    if (await JSB_ODB_READ(Svalues, Freffile, Mid1(ByRef_Refwhere, 2), function (_Svalues) { Svalues = _Svalues })); else { gotoLabel = "ATERROROUT"; continue atgoto; }
                    Values = makeArray(Svalues);

                    // If all we are selecting only itemid;
                } else if (LCase(ByRef_Refpk) == 'itemid' && (!ByRef_Refdisplay || LCase(ByRef_Refdisplay) == 'itemid')) {
                    if (Not(ByRef_Refwhere)) ByRef_Refwhere = '';
                    if (await JSB_ODB_SELECTTO('', Freffile, ByRef_Refwhere, Selectlist, function (_Selectlist) { Selectlist = _Selectlist })); else { gotoLabel = "ATERROROUT"; continue atgoto; }
                    Values = getList(Selectlist);
                    if (Not(isArray(Values))) Values = Split(Values, am);
                } else {
                    // getRefColumnNames will extract the column names and add []'s if needed
                    // if InStr(refdisplay, "{") Then ColumnNames = getRefColumnNames(refdisplay:',{':RefPK:'},{ItemID}') Else ColumnNames = getRefColumnNames(refdisplay:',':RefPK:',ItemID')

                    // If we have {name}, all must have []
                    if (InStr1(1, ByRef_Refdisplay, '{')) { Columnnames = await JSB_BF_GETREFCOLUMNNAMES(ByRef_Refdisplay + ',{' + ByRef_Refpk + '}'); } else Columnnames = await JSB_BF_GETREFCOLUMNNAMES(ByRef_Refdisplay + ',' + ByRef_Refpk);

                    // Fill in any constants for where clause... {now}, {year}, ...     
                    if (InStr1(1, ByRef_Refwhere, '{')) ByRef_Refwhere = getDefaultValue(undefined, ByRef_Refwhere, '', '');

                    Issqlselect = isSqlServer(Freffile);

                    if (CBool(Issqlselect)) {
                        // Make Distinct select clause
                        if (await asyncDNOSqlSelect('select distinct ' + CStr(Columnnames) + ' from ' + CStr(ByRef_Reffile) + (ByRef_Refwhere ? ' Where ' + ByRef_Refwhere : ' '), _selectList => Selectlist = _selectList)); else { gotoLabel = "ATERROROUT"; continue atgoto; }
                    } else {
                        if (await JSB_ODB_SELECTTO(CStr(Columnnames), Freffile, ByRef_Refwhere, Selectlist, function (_Selectlist) { Selectlist = _Selectlist })); else { gotoLabel = "ATERROROUT"; continue atgoto; }
                    }

                    Allrows = getList(Selectlist);
                    if (Not(isArray(Allrows))) Allrows = Split(Allrows, am);
                    Values = [undefined,];
                    if (CBool(Allrows)) {
                        Twovalues = (ByRef_Refpk && ByRef_Refdisplay && ByRef_Refdisplay != ByRef_Refpk);

                        // distinct already done in sql
                        if (CBool(Issqlselect)) {
                            if (CBool(Twovalues)) {
                                for (Row of iterateOver(Allrows)) {
                                    Values[Values.length] = CStr(Row[ByRef_Refdisplay]) + Chr(253) + CStr(Row[ByRef_Refpk]);
                                }
                            } else {
                                if (ByRef_Refdisplay) W = ByRef_Refdisplay; else W = ByRef_Refpk;
                                for (Row of iterateOver(Allrows)) {
                                    Values[Values.length] = Row[W];
                                }
                            }
                        } else {
                            if (CBool(Twovalues)) {
                                for (Row of iterateOver(Allrows)) {
                                    Values[Values.length] = CStr(Row[ByRef_Refdisplay]) + Chr(253) + CStr(Row[ByRef_Refpk]);
                                }
                            } else {
                                if (ByRef_Refdisplay) W = ByRef_Refdisplay; else W = ByRef_Refpk;

                                for (Row of iterateOver(Allrows)) {
                                    V = Row[W];
                                    if (Locate(V, Values, 0, 0, 0, "", position => { })); else Values[Values.length] = V;
                                }
                            }
                        }
                    }

                    if (ByRef_Rightalign) Values = Sort(Values, 'RI'); else Values = Sort(Values, 'I');
                }

                if (Oktocache) {
                    if (Not(Refcache)) { Refcache = {} }
                    Refcache[Refkey] = Values;
                    At_Session.Item('RefCache', Refcache);
                }

                return exit(Values);


            case "ATERROROUT":

                _Err = 'I am unable to SELECT your reference file ' + CStr(ByRef_Reffile) + ' with a where clause of "' + ByRef_Refwhere + '"; Subroutine: Modeler-' + CStr(System(28)) + crlf + CStr(activeProcess.At_Errors);
                Alert(CStr(_Err));
                return exit([undefined,]);


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </GETREFVALUESBYSELECT>

// <GETREFVALUESBYSELECT_Pgm>
async function JSB_BF_GETREFVALUESBYSELECT_Pgm() {  // PROGRAM
    Commons_JSB_BF = {};
    Equates_JSB_BF = {};

    // local variables
    var Reffile, Refpk, Refdisplay, Refwhere, Rightalign, Oktocache;
    var Restful_Result, R, Cb;

    var Restful_Result;
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Reffile = JSB_BF_PARAMVAR('REFFILE', CStr(1)); Refpk = JSB_BF_PARAMVAR('REFPK', CStr(2)); Refdisplay = JSB_BF_PARAMVAR('REFDISPLAY', CStr(3)); Refwhere = JSB_BF_PARAMVAR('REFWHERE', CStr(4)); Rightalign = JSB_BF_PARAMVAR('RIGHTALIGN', CStr(5)); Oktocache = JSB_BF_PARAMVAR('OKTOCACHE', CStr(6));
                Restful_Result = { "result": await JSB_BF_GETREFVALUESBYSELECT(Reffile, Refpk, Refdisplay, Refwhere, Rightalign, +Oktocache, function (_Reffile, _Refpk, _Refdisplay, _Refwhere, _Rightalign) { Reffile = _Reffile; Refpk = _Refpk; Refdisplay = _Refdisplay; Refwhere = _Refwhere; Rightalign = _Rightalign }) }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto;

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </GETREFVALUESBYSELECT_Pgm>

// <GETREFSPECIALS>
async function JSB_BF_GETREFSPECIALS(ByRef_Reffile, ByRef_Refpk, ByRef_Refdisplay, ByRef_Refwhere, ByRef_Rightalign, Refkey, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Reffile, ByRef_Refpk, ByRef_Refdisplay, ByRef_Refwhere, ByRef_Rightalign)
        return v
    }
    var Additemid = undefined;
    var Col = undefined;
    var Row = undefined;
    var Scols = undefined;
    var Svalues = '';
    var Values = undefined;
    var Allrows = undefined;
    var Allnames = undefined;

    if (LCase(ByRef_Reffile) == '{listfiles}') {
        if (await JSB_ODB_LISTFILES(Svalues, function (_Svalues) { Svalues = _Svalues })); else return exit([undefined,]);
        Values = Sort(Split(Svalues, am));;
    } else if (LCase(ByRef_Reffile) == '{roles}') {
        var Roles = await JSB_BF_JSBCONFIG('roles');
        if (CBool(Roles)) Values = Split(Roles, am); else Values = [undefined, 'Error: No jsb_config roles'];
        Values = Sort(Values);;
    } else if (LCase(ByRef_Reffile) == '{sqlcolumns}' || LCase(ByRef_Reffile) == '{viewcolumns}' || LCase(ByRef_Reffile) == '{allcolumns}') {
        if (LCase(ByRef_Reffile) == '{viewcolumns}') {
            Allrows = clone(At_Session.Item('VIEWCOLUMNS'));
            Additemid = false;;
        } else if (LCase(ByRef_Reffile) == '{sqlcolumns}') {
            Allrows = clone(At_Session.Item('SQLCOLUMNS'));
            Additemid = false;;
        } else {
            // {allcolumns}
            Allrows = clone(At_Session.Item('VIEWCOLUMNS'));
            Allnames = [undefined,];
            for (Col of iterateOver(Allrows)) {
                if (CBool(Col.name)) Allnames[Allnames.length] = Col.name;
            }

            Scols = At_Session.Item('SQLCOLUMNS');
            for (Col of iterateOver(Scols)) {
                if (CBool(Col.name)) {
                    if (Locate(Col.name, Allnames, 0, 0, 0, "", position => { })); else {
                        Allnames[Allnames.length] = Col.name;
                        Allrows[Allrows.length] = Col;
                    }
                }
            }
            Additemid = true;
        }

        if (Additemid) {
            for (Row of iterateOver(Allrows)) {
                if (LCase(Row.name) == 'itemid') {
                    Additemid = false;
                    break;
                }
            }
            // if addItemId then AllRows[-1] = { name:'ItemID', label:'ItemID', datatype:'string' }
        }

        if (ByRef_Refpk) {
            // If TypeOf(AllRows) <> "Array" Then
            // If AllRows = "" Then AllRows = "[]"
            // If Left(AllRows, 1) = "{" Then AllRows = "[":AllRows:"]"
            // AllRows = JSon("{dset:" : AllRows : "}").dset 
            // End If

            Values = [undefined,];
            for (Row of iterateOver(Allrows)) {
                if (CBool(Row[ByRef_Refpk])) {
                    if (ByRef_Refdisplay && ByRef_Refdisplay != ByRef_Refpk) {
                        Values[Values.length] = await JSB_BF_GETREFDISPLAY(CStr(ByRef_Refdisplay), Row) + Chr(254) + CStr(Row[ByRef_Refpk]);
                    } else {
                        Values[Values.length] = Row[ByRef_Refpk];
                    }
                }
            }
        } else {
            Allnames = [undefined,];
            for (Col of iterateOver(Allrows)) {
                Allnames[Allnames.length] = Col.name;
            }
            Values = Sort(Allnames);
        }
    }

    if (ByRef_Rightalign) Values = Sort(Values, 'RI'); else Values = Sort(Values, 'I');

    if (Refkey) {
        var Refcache = At_Session.Item('RefCache');
        if (Not(Refcache)) { Refcache = {} }
        Refcache[Refkey] = Values;
        At_Session.Item('RefCache', Refcache);
    }

    return exit(Values);
}
// </GETREFSPECIALS>

// <GETROLESFORUSER>
async function JSB_BF_GETROLESFORUSER(_Username) {
    var Roles = [undefined,];
    if (Not(_Username)) _Username = UserName();

    var At = await JSB_BF_AUTHENTICATIONTYPE();
    switch (At) {
        case 'none':
            if (CBool(isAdmin())) Roles[Roles.length] = 'admin';
            return Roles;

            break;

        case 'local':
            var F_Users = undefined;
            if (await asyncOpen("", 'JSB_USERS', _fHandle => F_Users = _fHandle)); else return Roles;
            var Profile = undefined;
            if (await asyncRead(F_Users, _Username, "JSON", 0, _data => Profile = _data)); else { Profile = {} }
            Roles = Profile.getRolesForUser;
            if (Not(Roles)) Roles = [undefined,];
            if (CBool(isAdmin())) { if (Locate('admin', Roles, 0, 0, 0, "", position => { })); else Roles[Roles.length] = 'admin'; }
            return Roles;

            break;

        case 'aspx':
            Roles = At_Roles.GetRolesForUser(_Username);
            if (CBool(isAdmin())) Roles[Roles.length] = 'admin';
            return Roles;

            break;

        case 'gae':
            if (CBool(isAdmin())) { if (Locate('admin', Roles, 0, 0, 0, "", position => { })); else Roles[Roles.length] = 'admin'; }
            return Roles;

            break;

        case 'server':
            return await JSB_BF_GETROLESFORUSER(_Username);
    }
}
// </GETROLESFORUSER>

// <GETSELECTCOLUMNDEFS>
async function JSB_BF_GETSELECTCOLUMNDEFS(Sqlselect) {
    var Fielddefs = undefined;
    var Def = undefined;
    var Ss = undefined;
    var Sqldefs = undefined;

    if (LCase(Left(Sqlselect, 7)) != 'select ') { Print(); debugger; }
    if (LCase(Mid1(Sqlselect, 8, 4)) != 'top ') Sqlselect = 'select top 1 ' + Mid1(Sqlselect, 8);
    Fielddefs = [undefined,];
    if (await asyncDNOSqlSelect(Sqlselect, _selectList => Ss = _selectList)) {
        Sqldefs = Ss.getSchema();
        for (Def of iterateOver(Sqldefs)) {
            Fielddefs[Fielddefs.length] = await JSB_BF_COLUMNDEF2JSB(Def);
        }
    }
    return Fielddefs;
}
// </GETSELECTCOLUMNDEFS>

// <GETSQLTABLECOLUMNDEFS>
async function JSB_BF_GETSQLTABLECOLUMNDEFS(ByRef_Fhandle, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Fhandle)
        return v
    }
    var Sqlrows = undefined;
    var Oleschema = undefined;
    var Ordinali = undefined;
    var Mrow = undefined;
    var Row = undefined;
    var R1 = '';
    var Pkcolumnname = '';
    var _Label = '';
    var Dft = '';
    var Datatype = '';

    Sqlrows = [undefined,];
    Oleschema = ByRef_Fhandle.GetSchema();
    if (!Len(Oleschema)) return exit(Sqlrows);

    R1 = Oleschema[LBound(Oleschema)];
    if (HasTag(R1, 'ORDINAL_POSITION')) {
        Oleschema = Sort(Oleschema, '#ORDINAL_POSITION');
    } else if (HasTag(R1, 'ordinal')) {
        Oleschema = Sort(Oleschema, '#ordinal');
    }

    Pkcolumnname = await JSB_BF_PRIMARYKEYNAME(ByRef_Fhandle);

    Ordinali = LBound(Oleschema) - 1;
    for (Row of iterateOver(Oleschema)) {
        Ordinali++;
        // TABLE_CATALOG, TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, COLUMN_GUID, COLUMN_PROPID, TYPE_GUID, CHARACTER_MAXIMUM_LENGTH, CHARACTER_OCTET_LENGTH, NUMERIC_PRECISION, DESCRIPTION
        // ORDINAL_POSITION, IS_NULLABLE, COLUMN_HASDEFAULT, COLUMN_DEFAULT, "DATA_TYPE": 3

        // COLUMN_FLAGS: 
        // DBCOLUMNFLAGS_ISBOOKMARK = 0x1, DBCOLUMNFLAGS_MAYDEFER = 0x2, DBCOLUMNFLAGS_WRITE = 0x4, DBCOLUMNFLAGS_WRITEUNKNOWN = 0x8, DBCOLUMNFLAGS_ISFIXEDLENGTH = 0x10, DBCOLUMNFLAGS_ISNULLABLE = 0x20
        // DBCOLUMNFLAGS_MAYBENULL = 0x40, DBCOLUMNFLAGS_ISLONG = 0x80, DBCOLUMNFLAGS_ISROWID = 0x100, DBCOLUMNFLAGS_ISROWVER = 0x200, DBCOLUMNFLAGS_CACHEDEFERRED = 0x1000

        // "ColumnName": "xxxxxx", "DataType": "System.Int32", "AllowDBNull": true, "AutoIncrement": false, "AutoIncrementSeed": 0, "AutoIncrementStep": 1, "Caption": "xxxxxxx", "DefaultValue": null, "MaxLength": -1, "ordinal": 9,
        // "Namespace": "", "Prefix": "", "ReadOnly": false, "Unique": false

        Mrow = {};
        if (CBool(Row.ColumnName)) Mrow.name = Row.ColumnName; else Mrow.name = Row.COLUMN_NAME;

        _Label = Row.Caption;
        if (LCase(_Label) == _Label || UCase(_Label) == _Label) _Label = UCase(Left(_Label, 1)) + LCase(Mid1(_Label, 2));
        Mrow.label = Trim(Change(_Label, '_', ' '));

        Mrow.primarykey = ((Null0(Pkcolumnname) == Null0(Row.COLUMN_NAME)) || (Null0(Pkcolumnname) == Null0(Row.ColumnName)));

        Mrow.defaultvalue = '';
        Mrow.tooltip = Mrow.label;
        Mrow.align = ''; // left;right
        Mrow.sortable = true;
        Mrow.reffile = '';
        Mrow.refsql = '';
        Mrow.refpk = '';
        Mrow.refwhere = '';
        Mrow.refdisplay = '';
        Mrow.required = false;
        Mrow.notblank = false;
        Mrow.iminvalue = '';
        Mrow.imaxvalue = '';
        Mrow.xminvalue = '';
        Mrow.xmaxvalue = '';
        Mrow.regx = '';
        Mrow.regxtext = '';
        Mrow.canedit = true;
        Mrow.ordinal = Ordinali;

        // compute my jsontypes
        Datatype = LCase(Row.DATA_TYPE);
        if (Not(Datatype)) Datatype = LCase(Row.DataType);
        Mrow.datatype = 'string'; // guid;autointeger;integer;double;boolean;string;date;time;datetime;currency;blob;png;jpg;collection;url;memo;password,jsonarray,jsonrow
        if (Left(Datatype, 7) == 'system.') Datatype = dropLeft(Datatype, '.');

        if (isNumber(Datatype)) {
            // see https://www.w3schools.com/asp/ado_datatypes.asp
            switch (Datatype) {
                case 20:
                    Datatype = 'bigint';
                    break;

                case 128:
                    Datatype = 'binary';
                    break;

                case 11:
                    Datatype = 'bit';
                    break;

                case 129:
                    Datatype = 'char';
                    break;

                case 6:
                    Datatype = 'money';
                    break;

                case 7:
                    Datatype = 'datetime';
                    break;

                case 135:
                    Datatype = 'timestamp';
                    break;

                case 14:
                    Datatype = 'decimal';
                    break;

                case 5:
                    Datatype = 'float';
                    break;

                case 72:
                    Datatype = 'uniqueidentifier';
                    break;

                case 9:
                    Datatype = 'varbinary';
                    break;

                case 3:
                    Datatype = 'int';
                    break;

                case 205:
                    Datatype = 'varbinary'; // Image
                    break;

                case 201:
                    Datatype = 'varchar'; // Text
                    break;

                case 203:
                    Datatype = 'nvarchar'; // NText
                    break;

                case 131:
                    Datatype = 'decimal';
                    break;

                case 4:
                    Datatype = 'decimal';
                    break;

                case 2:
                    Datatype = 'smallint';
                    break;

                case 17:
                    Datatype = 'tinyint';
                    break;

                case 204:
                    Datatype = 'binary';
                    break;

                case 200:
                    Datatype = 'varchar';
                    break;

                case 12:
                    Datatype = 'varchar';
                    break;

                case 202:
                    Datatype = 'varchar';
                    break;

                case 130:
                    Datatype = 'nvarchar';
            }
        }

        switch (Datatype) {
            case 'bit': case 'bool': case 'boolean':
                Mrow.datatype = 'boolean'; // 0, 1, or Nothing.
                break;

            case 'char':
                Mrow.datatype = 'string'; // fixed length string up to 8K
                break;

            case 'date':
                Mrow.datatype = 'date';
                break;

            case 'datetime': case 'datetime2':
                Mrow.datatype = 'datetime'; // accuracy of 3.33 milliseconds
                break;

            case 'datetimeoffset':
                Mrow.datatype = 'datetime'; // with timezone
                break;

            case 'decimal': case 'double': case 'float': case 'single':
                Mrow.datatype = 'double'; // Floating precision
                break;

            case 'image':
                Mrow.datatype = 'jpg'; // Array of type Byte. (could be png or other)
                break;

            case 'bigint': case 'int': case 'uint': case 'int16': case 'uint16': case 'int32': case 'uint32': case 'int64': case 'uint64':
                Mrow.datatype = 'integer'; // A 32-bit signed integer
                break;

            case 'money':
                Mrow.datatype = 'currency'; // ;* A fixed precision and scale
                break;

            case 'nchar':
                Mrow.datatype = 'string'; // fixed length unicode string up to 8K
                break;

            case 'ntext':
                Mrow.datatype = 'string'; // variable length unicode up to 8GB
                break;

            case 'nvarchar':
                Mrow.datatype = 'string'; // variable length unicode upto 4K
                break;

            case 'real':
                Mrow.datatype = 'double';
                break;

            case 'smalldatetime':
                Mrow.datatype = 'time';
                break;

            case 'smallint':
                Mrow.datatype = 'integer';
                break;

            case 'smallmoney':
                Mrow.datatype = 'currency';
                break;

            case 'text':
                Mrow.datatype = 'memo'; // non unicode upto 4GB
                break;

            case 'time':
                Mrow.datatype = 'time';
                break;

            case 'timestamp':
                Mrow.datatype = 'blob'; // array of 8 bytes unique within database
                break;

            case 'tinyint': case 'byte': case 'sbyte':
                Mrow.datatype = 'integer';
                break;

            case 'uniqueidentifier':
                Mrow.datatype = 'guid';
                break;

            case 'varbinary': case 'object': case 'binary':
                Mrow.datatype = 'blob'; // array of byte
                break;

            case 'varchar':
                Mrow.datatype = 'string'; // string
                break;

            case 'xml':
                Mrow.datatype = 'string';
        }

        if ((Mrow.datatype == 'string' || Mrow.datatype == 'blob') && Null0(Row.MaxLength) > '0') Mrow.maxlength = Row.MaxLength;

        if (Mrow.datatype == 'guid') Mrow.canedit = false;
        if (CBool(Row.AutoIncrement)) { Mrow.datatype = 'autointeger'; Mrow.canedit = false; }

        if (Mrow.datatype == 'integer' || Mrow.datatype == 'autointeger' || Mrow.datatype == 'double' || Mrow.datatype == 'currency') Mrow.align = 'right';
        if (Mrow.datatype == 'blob' || Mrow.datatype == 'png' || Mrow.datatype == 'img') { Mrow.sortable = false; Mrow.canedit = false; }

        if (CBool(Row.COLUMN_HASDEFAULT)) {
            Dft = Row.COLUMN_DEFAULT;
            if (Dft == 'GenGUID()') { Dft = '{guid}'; }
            Mrow.defaultvalue = Dft;
        }

        Sqlrows[Sqlrows.length] = Mrow;
    }
    return exit(Sqlrows);
}
// </GETSQLTABLECOLUMNDEFS>

// <GETTABLECOLUMNDEFS>
async function JSB_BF_GETTABLECOLUMNDEFS(Tablename, Suppressmsgs, Dorefresh) {
    var Dictcolumns = undefined;
    var Fdicthandle = undefined;
    var Fhandle = undefined;
    var J = undefined;
    var Sl = undefined;
    var Ss = undefined;
    var Sqldefs = '';
    var Readreadlist = '';
    var Id = '';
    var Itemid = '';
    var Item = undefined;

    Dictcolumns = [undefined,];
    if (!Tablename) return Dictcolumns;

    if (await JSB_ODB_OPEN('dict', CStr(Tablename), Fdicthandle, function (_Fdicthandle) { Fdicthandle = _Fdicthandle })); else {
        if (await JSB_ODB_OPEN('', CStr(Tablename), Fhandle, function (_Fhandle) { Fhandle = _Fhandle })); else return Dictcolumns;
        Fdicthandle = await JSB_BF_FHANDLE('DICT', Tablename, true);
    }

    if (await JSB_ODB_SELECTTO('', Fdicthandle, 'ItemID like \'!%\'', Sl, function (_Sl) { Sl = _Sl })); else {
        if (Not(Suppressmsgs)) { Alert('getTableColumnDefs: Unable to select the table DICT ' + CStr(Tablename) + '; ' + CStr(activeProcess.At_Errors)); }
        return Dictcolumns;
    }


    while (true) {
        Id = readNext(Sl).itemid;
        if (Id); else break
        if (Not(+Id)) break;
        // Column definitions start with !
        if (await JSB_ODB_READJSON(J, Fdicthandle, CStr(Id), function (_J) { J = _J })) {
            // update Ordinal to ordinal
            if (CBool(J.Ordinal)) {
                if (Not(J.ordinal)) J.ordinal = J.Ordinal;
                delete J['Ordinal'];
            }
            if (Not(J.name)) J.name = Mid1(Id, 2);
            Dictcolumns[Dictcolumns.length] = J;
        }
    }

    Readreadlist = false;
    Dictcolumns = Sort(Dictcolumns, '#ordinal');

    if (!Dorefresh && Len(Dictcolumns)) return Dictcolumns;

    if (await JSB_ODB_OPEN('', CStr(Tablename), Fhandle, function (_Fhandle) { Fhandle = _Fhandle })); else {
        if (Not(Suppressmsgs)) { Alert('getTableColumnDefs: Unable to open the table ' + CStr(Tablename) + '; ' + 'Modeler-' + CStr(System(28)) + ': ' + CStr(activeProcess.At_Errors)); }
        return Dictcolumns;
    }

    if (JSB_BF_TYPEOFFILE(Fhandle) == 'ado') {
        // Insure all ADO columns are in DictColumns, if not, add
        Sqldefs = await JSB_BF_GETSQLTABLECOLUMNDEFS(Fhandle, function (_Fhandle) { Fhandle = _Fhandle });;
    } else {
        // Test one item to see if it is JSON data, if so give getJSonColumnDefs a try
        if (await JSB_ODB_SELECTTO('top 1', Fhandle, '', Ss, function (_Ss) { Ss = _Ss })); else {
            if (Not(Suppressmsgs)) Alert(CStr(activeProcess.At_Errors));
            return Dictcolumns;
        }

        Itemid = readNext(Ss).itemid;
        if (Itemid); else return Dictcolumns;

        if (await JSB_ODB_READ(Item, Fhandle, CStr(Itemid), function (_Item) { Item = _Item })); else {
            if (Not(Suppressmsgs)) Alert('Modeler-' + CStr(System(28)) + ': ' + CStr(activeProcess.At_Errors));
            return Dictcolumns;
        }

        Item = CJSon(Item);
        if (Not(Item)) return Dictcolumns;
        Sqldefs = await JSB_BF_GETJSONCOLUMNDEFS(Item, await JSB_BF_PRIMARYKEYNAMEFROMJSON(Fhandle), CStr(Itemid));
    }

    return await JSB_BF_UPDATECOLUMNDEFINITIONS(Tablename, Sqldefs, Suppressmsgs, function (_Tablename, _Sqldefs, _Suppressmsgs) { Tablename = _Tablename; Sqldefs = _Sqldefs; Suppressmsgs = _Suppressmsgs });
}
// </GETTABLECOLUMNDEFS>

// <GLYPHICONS>
function glyphicons() {
    var L = undefined;
    var L2 = undefined;

    L = [undefined, 'asterisk',
        'plus',
        'minus',
        'eur',
        'euro',
        'cloud',
        'envelope',
        'pencil',
        'glass',
        'music',
        'search',
        'heart',
        'star',
        'star-empty',
        'user',
        'film',
        'th-large',
        'th',
        'th-list',
        'ok',
        'remove',
        'zoom-in',
        'zoom-out',
        'off',
        'signal',
        'cog',
        'trash',
        'home',
        'file',
        'time',
        'road',
        'download-alt',
        'download',
        'upload',
        'inbox',
        'play-circle',
        'repeat',
        'refresh',
        'list-alt',
        'lock',
        'flag',
        'headphones',
        'volume-off',
        'volume-down',
        'volume-up',
        'qrcode',
        'barcode',
        'tag',
        'tags',
        'book',
        'bookmark',
        'print',
        'camera',
        'font',
        'bold',
        'italic',
        'text-height',
        'text-width',
        'align-left',
        'align-center',
        'align-right',
        'align-justify',
        'list',
        'indent-left',
        'indent-right',
        'facetime-video',
        'picture',
        'map-marker',
        'adjust',
        'tint',
        'edit',
        'share',
        'check',
        'move',
        'step-backward',
        'fast-backward',
        'backward',
        'play',
        'pause',
        'stop',
        'forward',
        'fast-forward',
        'step-forward',
        'eject',
        'chevron-left',
        'chevron-right',
        'plus-sign',
        'minus-sign',
        'remove-sign',
        'ok-sign',
        'question-sign',
        'info-sign',
        'screenshot',
        'remove-circle',
        'ok-circle',
        'ban-circle',
        'arrow-left',
        'arrow-right',
        'arrow-up',
        'arrow-down',
        'share-alt',
        'resize-full',
        'resize-small',
        'exclamation-sign',
        'gift',
        'leaf',
        'fire',
        'eye-open',
        'eye-close',
        'warning-sign',
        'plane',
        'calendar',
        'random',
        'comment',
        'magnet',
        'chevron-up',
        'chevron-down',
        'retweet',
        'shopping-cart',
        'folder-close',
        'folder-open',
        'resize-vertical',
        'resize-horizontal',
        'hdd',
        'bullhorn',
        'bell',
        'certificate',
        'thumbs-up',
        'thumbs-down',
        'hand-right',
        'hand-left',
        'hand-up',
        'hand-down',
        'circle-arrow-right',
        'circle-arrow-left',
        'circle-arrow-up',
        'circle-arrow-down',
        'globe',
        'wrench',
        'tasks',
        'filter',
        'briefcase',
        'fullscreen',
        'dashboard',
        'paperclip',
        'heart-empty',
        'link',
        'phone',
        'pushpin',
        'usd',
        'gbp',
        'sort',
        'sort-by-alphabet',
        'sort-by-alphabet-alt',
        'sort-by-order',
        'sort-by-order-alt',
        'sort-by-attributes',
        'sort-by-attributes-alt'
    ];

    L2 = [undefined, 'unchecked',
        'expand',
        'collapse-down',
        'collapse-up',
        'log-in',
        'flash',
        'log-out',
        'new-window',
        'record',
        'save',
        'open',
        'saved',
        'import',
        'export',
        'send',
        'floppy-disk',
        'floppy-saved',
        'floppy-remove',
        'floppy-save',
        'floppy-open',
        'credit-card',
        'transfer',
        'cutlery',
        'header',
        'compressed',
        'earphone',
        'phone-alt',
        'tower',
        'stats',
        'sd-video',
        'hd-video',
        'subtitles',
        'sound-stereo',
        'sound-dolby',
        'sound-5-1',
        'sound-6-1',
        'sound-7-1',
        'copyright-mark',
        'registration-mark',
        'cloud-download',
        'cloud-upload',
        'tree-conifer',
        'tree-deciduous',
        'cd',
        'save-file',
        'open-file',
        'level-up',
        'copy',
        'paste',
        'alert',
        'equalizer',
        'king',
        'queen',
        'pawn',
        'bishop',
        'knight',
        'baby-formula',
        'tent',
        'blackboard',
        'bed',
        'apple',
        'erase',
        'hourglass',
        'lamp',
        'duplicate',
        'piggy-bank',
        'scissors',
        'bitcoin',
        'yen',
        'ruble',
        'scale',
        'ice-lolly',
        'ice-lolly-tasted',
        'education',
        'option-horizontal',
        'option-vertical',
        'menu-hamburger',
        'modal-window',
        'oil',
        'grain',
        'sunglasses',
        'text-size',
        'text-color',
        'text-background',
        'object-align-top',
        'object-align-bottom',
        'object-align-horizontal',
        'object-align-left',
        'object-align-vertical',
        'object-align-right',
        'triangle-right',
        'triangle-left',
        'triangle-bottom',
        'triangle-top',
        'console',
        'superscript',
        'subscript',
        'menu-left',
        'menu-right',
        'menu-down',
        'menu-up'];
    return Split(CStr(L) + CStr(L2), am);

}
// </GLYPHICONS>

// <GPS_BLANKTILE>
function gps_blankTile() {
    if (Not(window.image_blank)) window.image_blank = gps_tileRGB(142, 188, 143, 255);
    return window.image_blank;
}
// </GPS_BLANKTILE>

// <GPS_BUILDTILEFROMCHILDREN>
async function JSB_BF_GPS_BUILDTILEFROMCHILDREN(F_Tilecache, F_Tmptilecache, X, Y, Z) {
    // local variables
    var Tile, Alreadyincache, X0, Y0, Nochanges, Gotc00, C00, Gotc01;
    var C01, Gotc10, C10, Gotc11, C11;

    if (await JSB_BF_GPS_CACHEREADTILE(F_Tilecache, F_Tmptilecache, +Z, +Y, +Z, false, Tile, function (_Tile) { Tile = _Tile })) {
        Alreadyincache = true;
    } else {
        if (window.onLine()) Tile = await JSB_BF_GPS_READONLINETILE(CStr(X), CStr(Y), CStr(Z)); else Tile = undefined;
        Alreadyincache = false;
    }

    if (Not(Tile)) Tile = gps_blankTile();
    if (Null0(Z) >= 19) return Tile;

    // Get my 4 children at Z+1
    X0 = +X * 2;
    Y0 = +Y * 2;

    Nochanges = true;
    Gotc00 = await JSB_BF_GPS_CACHEREADTILE(F_Tilecache, F_Tmptilecache, +X0, +Y0, +Z + 1, true, C00, function (_C00) { C00 = _C00 });
    if (Not(Gotc00)) {
        C00 = await JSB_BF_GPS_EXTRACTQUADRANTTILE(Tile, 0, 0, function (_Tile) { Tile = _Tile });
        Tile = await JSB_BF_IMAGE_REPLACEQUADRANT(Tile, C00, 0, 0, function (_Tile, _P3, _P4) { Tile = _Tile });
        Nochanges = false;
    }

    Gotc01 = await JSB_BF_GPS_CACHEREADTILE(F_Tilecache, F_Tmptilecache, +X0, +Y0 + 1, +Z + 1, true, C01, function (_C01) { C01 = _C01 });
    if (Not(Gotc01)) {
        C01 = await JSB_BF_GPS_EXTRACTQUADRANTTILE(Tile, 0, 1, function (_Tile) { Tile = _Tile });
        Tile = await JSB_BF_IMAGE_REPLACEQUADRANT(Tile, C01, 0, 1, function (_Tile, _P3, _P4) { Tile = _Tile });
        Nochanges = false;
    }

    Gotc10 = await JSB_BF_GPS_CACHEREADTILE(F_Tilecache, F_Tmptilecache, +X0 + 1, +Y0, +Z + 1, true, C10, function (_C10) { C10 = _C10 });
    if (Not(Gotc10)) {
        C10 = await JSB_BF_GPS_EXTRACTQUADRANTTILE(Tile, 1, 0, function (_Tile) { Tile = _Tile });
        Tile = await JSB_BF_IMAGE_REPLACEQUADRANT(Tile, C10, 1, 0, function (_Tile, _P3, _P4) { Tile = _Tile });
        Nochanges = false;
    }

    Gotc11 = await JSB_BF_GPS_CACHEREADTILE(F_Tilecache, F_Tmptilecache, +X0 + 1, +Y0 + 1, +Z + 1, true, C11, function (_C11) { C11 = _C11 });
    if (Not(Gotc11)) {
        C11 = await JSB_BF_GPS_EXTRACTQUADRANTTILE(Tile, 1, 1, function (_Tile) { Tile = _Tile });
        Tile = await JSB_BF_IMAGE_REPLACEQUADRANT(Tile, C11, 1, 1, function (_Tile, _P3, _P4) { Tile = _Tile });
        Nochanges = false;
    }

    if (CBool(Nochanges) && CBool(Alreadyincache)) return Tile;

    await JSB_BF_GPS_CACHEWRITETILE(F_Tilecache, +X, +Y, +Z, CStr(Tile));

    return Tile;
}
// </GPS_BUILDTILEFROMCHILDREN>

// <GPS_READOFFLINETILE>
async function JSB_BF_GPS_READOFFLINETILE(ByRef_F_Tilecache, ByRef_F_Tmptilecache, ByRef_X, ByRef_Y, ByRef_Z, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_F_Tilecache, ByRef_F_Tmptilecache, ByRef_X, ByRef_Y, ByRef_Z)
        return v
    }
    var X0 = undefined;
    var Y0 = undefined;
    var Xo = undefined;
    var Yo = undefined;
    var Tile = '';
    var Tmpid = '';
    var Ptile = '';

    if (await JSB_BF_GPS_CACHEREADTILE(ByRef_F_Tilecache, ByRef_F_Tmptilecache, ByRef_X, ByRef_Y, ByRef_Z, true, Tile, function (_Tile) { Tile = _Tile })) return exit(Tile);
    Tmpid = gps_CacheID(CStr(ByRef_X), CStr(ByRef_Y), CStr(ByRef_Z));
    if (await asyncRead(ByRef_F_Tmptilecache, 'x' + Tmpid, "", 0, _data => Tile = _data)) return exit(Tile);

    if (ByRef_Z == 6) {
        if (false && Not(window.warning1)) {
            await JSB_BF_MSGBOX('I don\'t appear to have any base tiles.  A Blank will be used');
            window.warning1 = true;
            if (await JSB_BF_GPS_CACHEREADTILE(ByRef_F_Tilecache, ByRef_F_Tmptilecache, ByRef_X, ByRef_Y, ByRef_Z, true, Tile, function (_Tile) { Tile = _Tile })) return exit(Tile);
            if (await JSB_BF_GPS_CACHEREADTILE(ByRef_F_Tilecache, ByRef_F_Tmptilecache, ByRef_X, ByRef_Y, ByRef_Z, true, Tile, function (_Tile) { Tile = _Tile })) return exit(Tile);
        }

        return exit(gps_blankTile());
    }

    // Compute my parent
    X0 = CInt(ByRef_X / 2);
    Y0 = CInt(ByRef_Y / 2);
    Xo = ByRef_X % 2;
    Yo = ByRef_Y % 2;

    Ptile = await JSB_BF_GPS_READOFFLINETILE(ByRef_F_Tilecache, ByRef_F_Tmptilecache, X0, Y0, ByRef_Z - 1, function (_ByRef_F_Tilecache, _ByRef_F_Tmptilecache, _X0, _Y0, _P5) { ByRef_F_Tilecache = _ByRef_F_Tilecache; ByRef_F_Tmptilecache = _ByRef_F_Tmptilecache; X0 = _X0; Y0 = _Y0 });

    // Extract myself from my parent
    Tile = await JSB_BF_GPS_EXTRACTQUADRANTTILE(Ptile, Xo, Yo, function (_Ptile) { Ptile = _Ptile });
    Ptile = undefined;

    Tile = await JSB_BF_IMAGE_RESIZE(Tile, 256, 256, function (_Tile, _P2, _P3) { Tile = _Tile });

    if (await asyncWrite(Tile, ByRef_F_Tmptilecache, 'x' + gps_CacheID(CStr(ByRef_X), CStr(ByRef_Y), CStr(ByRef_Z)), "", 0)); else null;
    return exit(Tile);
}
// </GPS_READOFFLINETILE>

// <GPS_CACHEID>
function gps_CacheID(X, Y, Z) {
    return 'ifwis_z' + CStr(Z) + '_y' + CStr(Y) + '_x' + CStr(X) + '.png';
}
// </GPS_CACHEID>

// <GPS_CACHEREADTILE>
async function JSB_BF_GPS_CACHEREADTILE(F_Tilecache, F_Tmptilecache, X, Y, Z, Oktogetpartialtile, ByRef_Tile, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tile)
        return v
    }
    var Tiles = undefined;
    var Hash = '';
    var Cid = '';
    var Tmpid = '';

    Hash = 'js' + CStr(Z + X + Y % 2048);
    ByRef_Tile = undefined;

    if (await asyncRead(F_Tilecache, Hash, "JSON", 0, _data => Tiles = _data)) {
        Cid = gps_CacheID(CStr(X), CStr(Y), CStr(Z));
        ByRef_Tile = Tiles[Cid];
        Tiles = undefined;
        if (ByRef_Tile) return exit(true);
    }
    if (Not(F_Tmptilecache)) return exit(false);

    Tmpid = gps_CacheID(CStr(X), CStr(Y), CStr(Z));
    if (await asyncRead(F_Tmptilecache, Tmpid, "", 0, _data => ByRef_Tile = _data)) return exit(true);

    if (!Oktogetpartialtile) return exit(false);

    if (await asyncRead(F_Tmptilecache, 'x' + Tmpid, "", 0, _data => ByRef_Tile = _data)) return exit(true);

    ByRef_Tile = undefined;
    return exit(false);
}
// </GPS_CACHEREADTILE>

// <GPS_CACHEWRITETILE>
async function JSB_BF_GPS_CACHEWRITETILE(F_Tilecache, X, Y, Z, Tile) {
    var Tiles = undefined;
    var Hash = '';
    var Cid = '';

    Hash = 'js' + CStr(Z + X + Y % 2048);
    if (await asyncRead(F_Tilecache, Hash, "JSON", 0, _data => Tiles = _data)); else { Tiles = {} }

    Cid = gps_CacheID(CStr(X), CStr(Y), CStr(Z));
    Tiles[Cid] = Tile;
    if (await asyncWrite(Tiles, F_Tilecache, Hash, "JSON", 0)); else Alert(CStr(activeProcess.At_Errors));

    Tiles = undefined;
    return true;
}
// </GPS_CACHEWRITETILE>

// <GPS_EXTRACTQUADRANTTILE>
async function JSB_BF_GPS_EXTRACTQUADRANTTILE(ByRef_Parentsrc, Xo, Yo, setByRefValues) {
    // local variables
    var Parentimg, Width, _Height;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Parentsrc)
        return v
    }
    var canvas = undefined, ctx = undefined;
    Parentimg = await JSB_BF_IMAGE_LOAD(CStr(ByRef_Parentsrc));

    Width = CInt(CNum(Parentimg.width) / 2);
    _Height = CInt(CNum(Parentimg.height) / 2);

    if (CBool(Xo)) Xo = Width;
    if (CBool(Yo)) Yo = _Height;

    canvas = Image_Canvas(Width, _Height);
    ctx = Image_CTX(canvas);

    // Get portion of parent
    ctx.drawImage(Parentimg, Xo, Yo, Width, _Height, 0, 0, Width, _Height);

    Parentimg = undefined;

    return exit(canvas.toDataURL('image/jpeg', 0.3)); // .3 image quality
}
// </GPS_EXTRACTQUADRANTTILE>

// <GPS_FETCHESRI_TILEIMG>
async function JSB_BF_GPS_FETCHESRI_TILEIMG(ByRef_Type, ByRef_X, ByRef_Y, ByRef_Z, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Type, ByRef_X, ByRef_Y, ByRef_Z)
        return v
    }
    var Tileurl = '';
    var Imagedata = '';

    Tileurl = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/' + CStr(ByRef_Z) + '/' + CStr(ByRef_Y) + '/' + CStr(ByRef_X);
    Imagedata = await JSB_BF_GET(Tileurl);
    if (Not(Imagedata)) { Alert(CStr(activeProcess.At_Errors)); return exit(undefined); }

    return exit('data:image/jpeg;base64,' + aesEncrypt(Imagedata, 64));
}
// </GPS_FETCHESRI_TILEIMG>

// <GPS_FETCHESRI_TILELABELS>
async function JSB_BF_GPS_FETCHESRI_TILELABELS(ByRef_Type, ByRef_X, ByRef_Y, ByRef_Z, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Type, ByRef_X, ByRef_Y, ByRef_Z)
        return v
    }
    var Tileurl = '';
    var Imagedata = '';

    Tileurl = 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/' + CStr(ByRef_Z) + '/' + CStr(ByRef_Y) + '/' + CStr(ByRef_X);

    Imagedata = await JSB_BF_GET(Tileurl);
    if (Not(Imagedata)) { Alert(CStr(activeProcess.At_Errors)); return exit(undefined); }

    return exit('data:image/jpeg;base64,' + aesEncrypt(Imagedata, 64));
}
// </GPS_FETCHESRI_TILELABELS>

// <GPS_FETCHESRI_TILETRANSPORTATION>
async function JSB_BF_GPS_FETCHESRI_TILETRANSPORTATION(ByRef_Type, ByRef_X, ByRef_Y, ByRef_Z, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Type, ByRef_X, ByRef_Y, ByRef_Z)
        return v
    }
    var Tileurl = '';
    var Imagedata = '';

    Tileurl = 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/' + CStr(ByRef_Z) + '/' + CStr(ByRef_Y) + '/' + CStr(ByRef_X);
    Imagedata = await JSB_BF_GET(Tileurl);
    if (Not(Imagedata)) { Alert(CStr(activeProcess.At_Errors)); return exit(undefined); }

    return exit('data:image/jpeg;base64,' + aesEncrypt(Imagedata, 64));
}
// </GPS_FETCHESRI_TILETRANSPORTATION>

// <GPS_FETCHGOOGLE_TILEIMG>
async function JSB_BF_GPS_FETCHGOOGLE_TILEIMG(ByRef_Type, ByRef_X, ByRef_Y, ByRef_Z, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Type, ByRef_X, ByRef_Y, ByRef_Z)
        return v
    }
    var Tileurl = '';
    var Imagedata = '';

    Tileurl = ('https://khms1.googleapis.com/kh?v=773&hl=en-US&x=' + CStr(ByRef_X) + '&y=' + CStr(ByRef_Y) + '&z=' + CStr(ByRef_Z));
    Imagedata = await JSB_BF_GET(Tileurl);
    if (Not(Imagedata)) return exit(undefined);

    return exit('data:image/jpeg;base64,' + aesEncrypt(Imagedata, 64));
}
// </GPS_FETCHGOOGLE_TILEIMG>

// <GPS_GETDISTANCE>
function gps_getDistance(Lat1y, Lng1x, Lat2y, Lng2x) {
    // return distance in meters
    Lng1x = 0.0174532925199444 * Lng1x;
    Lat1y = 0.0174532925199444 * Lat1y;
    Lng2x = 0.0174532925199444 * Lng2x;
    Lat2y = 0.0174532925199444 * Lat2y;

    var Deltalat = Lat2y - Lat1y;
    var Deltalon = Lng2x - Lng1x;

    var A = Pwr(Sin(Deltalat / 2), 2) + Cos(Lat1y) * Cos(Lat2y) * Pwr(Sin(Deltalon / 2), 2);
    var C = 2 * ASin(Sqrt(A));

    var Earth_Radius = 6371;
    return C * Earth_Radius * 1000;
}
// </GPS_GETDISTANCE>

// <GPS_GLYPHICON>
function gps_glyphIcon(Glyphname, Markercolor, Iconcolor) {
    return L.AwesomeMarkers.icon({ "icon": Glyphname, "prefix": 'glyphicon', "markerColor": Markercolor, "iconColor": Iconcolor });
}
// </GPS_GLYPHICON>

// <GPS_LATLNG2TILE>
function gps_LatLng2Tile(Laty, Lngx, Zoom) {
    var X = Floor((Lngx + 180) / 360 * Pwr(2, Zoom));
    var Y = Floor((1 - Ln(Tan(Laty * PI() / 180) + 1 / Cos(Laty * PI() / 180)) / PI()) / 2 * Pwr(2, Zoom));
    return { "x": X, "y": Y, "z": Zoom };
}
// </GPS_LATLNG2TILE>

// <GPS_MAPPIXELTOLATLONG>
function gps_mapPixelToLatLong(X, Y) {
    return map.containerPointToLatLng({ "pt": [X, Y] }.pt);
}
// </GPS_MAPPIXELTOLATLONG>

// <GPS_METERSPERPIXEL>
function gps_metersPerPixel() {
    // local variables
    var Mapheight, Mapwidth, Mapwidthmeters;

    var firstPoint = undefined;
    Mapheight = map.getSize().y; // this is the screen height of the map
    Mapwidth = map.getSize().x; // this is the screen width of the map

    // calculate the distance the one side of the map to the other using the haversine formula
    firstPoint = gps_mapPixelToLatLong(0, Mapheight);
    Mapwidthmeters = firstPoint.distanceTo(gps_mapPixelToLatLong(Mapwidth, Mapheight));

    // calculate how many meters each pixel represents
    return +Mapwidthmeters / +Mapwidth;
}
// </GPS_METERSPERPIXEL>

// <GPS_READONLINETILE>
async function JSB_BF_GPS_READONLINETILE(X, Y, Z) {
    var Tile = undefined;
    var Tile2 = '';
    var Tile3 = '';

    // Get base image

    if (false) {
        Tile = await JSB_BF_GPS_FETCHGOOGLE_TILEIMG('sat', X, Y, Z, function (_P1, _X, _Y, _Z) { X = _X; Y = _Y; Z = _Z }); // OK to get from cache;
    } else {
        Tile = await JSB_BF_GPS_FETCHESRI_TILEIMG('sat', X, Y, Z, function (_P1, _X, _Y, _Z) { X = _X; Y = _Y; Z = _Z }); // OK to get from cache;
    }
    if (!Tile) Tile = gps_blankTile();

    Tile2 = await JSB_BF_GPS_FETCHESRI_TILETRANSPORTATION('trans', X, Y, Z, function (_P1, _X, _Y, _Z) { X = _X; Y = _Y; Z = _Z });
    Tile3 = await JSB_BF_GPS_FETCHESRI_TILELABELS('labels', X, Y, Z, function (_P1, _X, _Y, _Z) { X = _X; Y = _Y; Z = _Z });

    if (Tile2) { Tile = await JSB_BF_IMAGE_MERGE(Tile, Tile2, 1, function (_Tile, _Tile2, _P3) { Tile = _Tile; Tile2 = _Tile2 }); }
    if (Tile3) { Tile = await JSB_BF_IMAGE_MERGE(Tile, Tile3, 1, function (_Tile, _Tile3, _P3) { Tile = _Tile; Tile3 = _Tile3 }); }

    Tile2 = undefined;
    Tile3 = undefined;

    return Tile;
}
// </GPS_READONLINETILE>

// <GPS_TILE2LATLNG>
function gps_tile2LatLng(Tile_X, Tile_Y, Zoom) {
    var N = PI() - ((2 * PI() * Tile_Y) / Pwr(2, Zoom));
    var Lngx = (Tile_X / Pwr(2, Zoom) * 360) - 180;
    var Laty = 180 / PI() * ATan(Sinh(N));
    var A = { "a": [Laty, Lngx] };
    return A.a;
}
// </GPS_TILE2LATLNG>

// <GPS_TILERGB>
function gps_tileRGB(R, G, B, I) {
    var canvas = undefined, ctx = undefined, imgData = undefined;
    canvas = Image_Canvas(256, 256);
    ctx = Image_CTX(canvas);

    imgData = ctx.createImageData(256, 256);

    var _ForEndI_1 = CNum(imgData.data.length) - 1;
    for (I = 0; I <= _ForEndI_1; I += 4) {
        imgData.data[+I + 0] = R;
        imgData.data[+I + 1] = G;
        imgData.data[+I + 2] = B;
        imgData.data[+I + 3] = I;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.3);
}
// </GPS_TILERGB>

// <GUID2HEX>
function Guid2Hex(_Guid) {
    var A = undefined;
    var J = undefined;
    var I = undefined;
    var S = '';
    var C = '';

    A = Split(_Guid, '-');
    if (Len(A) != 5) return _Guid;
    // First 3 segments are in switched order
    for (I = 1; I <= 3; I++) {
        S = A[I];
        C = '';
        var _ForEndI_2 = Len(S);
        for (J = 1; J <= _ForEndI_2; J++) {
            C = Mid1(S, J, 2) + C;
            J++;
        }
        A[I] = C;
    }
    return Join(A, '');

}
// </GUID2HEX>

// <HASATTRIBUTE>
function hasAttribute(Tag, Oadditionalattributes) {
    // local variables
    var Jtag, A;

    if (Not(Oadditionalattributes)) return false;

    if (typeOf(Oadditionalattributes) == 'JSonObject') {
        var Jadditionalattributes = Oadditionalattributes;
        for (Jtag of iterateOver(Jadditionalattributes)) {
            if (Null0(Jtag) == Null0(Tag)) return Jadditionalattributes[Jtag];
        }
    } else {
        var Aadditionalattributes = undefined;
        if (typeOf(Oadditionalattributes) == 'String') Aadditionalattributes = [undefined, Oadditionalattributes]; else Aadditionalattributes = Oadditionalattributes;
        var Taglen = Len(Tag);
        for (A of iterateOver(Aadditionalattributes)) {
            if (Left(A, Taglen) == Tag) {
                var At = Mid1(A, Taglen + 1, 1);
                if (!At) {
                    return true;
                } else if (At == '=') {
                    var Pvalue = RTrim(LTrim(Mid1(A, Taglen + 2)));
                    if (Left(Pvalue, 1) == '\'' || Left(Pvalue, 1) == '"') Pvalue = RTrim(Mid1(Pvalue, 2, Len(Pvalue) - 2));
                    if (Right(Pvalue, 1) == ' ') Pvalue = Left(Pvalue, Len(Pvalue) - 1);
                    if (Right(Pvalue, 1) == ';') Pvalue = Left(Pvalue, Len(Pvalue) - 1);
                    return htmlUnescape(Pvalue);
                }
            }
        }
    }

    return false;
}
// </HASATTRIBUTE>

// <HASPARENTPROCESS>
function hasParentProcess() {
    return System(21);
}
// </HASPARENTPROCESS>

// <HASPLUGIN>
function hasPlugIn(Name) {
    if (Not(window.isPhoneGap())) return false;

    var Plugins = window.cordova.require('cordova/plugin_list').metadata;
    if (Not(Plugins[Name])) return false;
    return true;
}
// </HASPLUGIN>

// <HASTCLPARENT>
function hasTclParent() {
    return System(22);
}
// </HASTCLPARENT>

// <HEIGHT>
function Height(Id) {
    FlushHTML();
    return $('#' + CStr(Id)).height();
}
// </HEIGHT>

// <HOST>
function JSB_BF_HOST() {
    // local variables
    var U;

    U = JSB_BF_URL();
    U = dropLeft(CStr(U), '://');
    U = Field(U, '/', 1);
    U = Field(U, ':', 1);
    return U;
}
// </HOST>

// <HTML>
function html(A) {
    return Chr(28) + CStr(A) + Chr(29);

}
// </HTML>

// <HTMLESCAPE>
function HtmlEscape(Url) {
    return htmlEscape(Url);
}
// </HTMLESCAPE>

// <HTMLROOT>
function HtmlRoot() {
    return System(25);
}
// </HTMLROOT>

// <HTMLUNESCAPE>
function HtmlUnEscape(Htm) {
    return htmlUnescape(Htm);
}
// </HTMLUNESCAPE>

// <HTTPFILEPATH>
function httpFilePath(FHandle) {
    var Tof = '';
    var Fpath = '';
    var Relpath = '';

    Tof = JSB_BF_TYPEOFFILE(FHandle);
    if (Not(Tof)) return jsbRootAct() + CStr(FHandle);
    if (Tof != 'dos') return jsbRootAct() + fHandle2FileName(FHandle);

    Fpath = filePath(FHandle);
    Relpath = LCase(jsbRootDirectory());
    if (Left(LCase(Fpath), Len(Relpath)) != Relpath) return jsbRootAct() + fHandle2FileName(FHandle);

    Fpath = Mid1(Fpath, Len(Relpath) + 1);
    return HtmlRoot() + Change(Fpath, '\\', '/');
}
// </HTTPFILEPATH>

// <ICONV>
async function JSB_BF_ICONV(ByRef_Cstring, ByRef_Conv, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Cstring, ByRef_Conv)
        return v
    }
    return exit(await JSB_BF_IOCONV('I', CStr(ByRef_Cstring), CStr(ByRef_Conv)));
}
// </ICONV>

// <IMAGE_CANVAS>
function Image_Canvas(Width, _Height) {
    return $('\<canvas width=' + CStr(Width) + ' height=' + CStr(_Height) + '\>\</canvas\>')[0];
}
// </IMAGE_CANVAS>

// <IMAGE_CTX>
function Image_CTX(canvas) {
    return canvas.getContext('2d');
}
// </IMAGE_CTX>

// <IMAGE_LOAD>
async function JSB_BF_IMAGE_LOAD(Src) {
    await Include_JSB_BF___Leaflet(false)
    if (Not(Src)) return undefined;

    return new Promise((resolve, reject) => {
        var Img = new Image();
        Img.src = Src;
        Img.onload = function () {
            resolve(Img)
        }

        Img.onerror = function (err) {
            Img.alt = "image load error";
            resolve(Img)
        }
    });
}
// </IMAGE_LOAD>

// <IMAGE_MERGE>
async function JSB_BF_IMAGE_MERGE(ByRef_Tile1, ByRef_Tile2, ByRef_Opacity, setByRefValues) {
    // local variables
    var Img1, Img2, Width, Width2, _Height, Canvas, Ctx;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tile1, ByRef_Tile2, ByRef_Opacity)
        return v
    }
    await Include_JSB_BF___Leaflet(false)

    Img1 = await JSB_BF_IMAGE_LOAD(CStr(ByRef_Tile1));
    if (Not(Img1)) return exit(undefined);

    Img2 = await JSB_BF_IMAGE_LOAD(CStr(ByRef_Tile2));
    if (Not(Img2)) return exit(undefined);

    Width = Img1.width;
    Width2 = Img2.width;

    if (Null0(Img2.width) > Null0(Width)) Width = Img2.width;

    _Height = Img1.height;
    if (Null0(Img2.height) > Null0(_Height)) _Height = Img2.height;

    Canvas = Image_Canvas(Width, _Height);
    Ctx = Image_CTX(Canvas);

    // composite now
    Ctx.drawImage(Img1, 0, 0);

    Ctx.globalAlpha = ByRef_Opacity;
    Ctx.drawImage(Img2, 0, 0);

    return exit(Canvas.toDataURL('image/jpeg', 0.3));
}
// </IMAGE_MERGE>

// <IMAGE_REPLACEQUADRANT>
async function JSB_BF_IMAGE_REPLACEQUADRANT(ByRef_Parentsrc, Childsrc, ByRef_Xo, ByRef_Yo, setByRefValues) {
    // local variables
    var Parentimg, Childimg, Width, _Height, Hwidth, Hheight;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Parentsrc, ByRef_Xo, ByRef_Yo)
        return v
    }
    var canvas = undefined, ctx = undefined;
    Parentimg = await JSB_BF_IMAGE_LOAD(CStr(ByRef_Parentsrc)); // should be 256 x 256
    Childimg = await JSB_BF_IMAGE_LOAD(CStr(Childsrc));

    Width = Parentimg.width;
    _Height = Parentimg.height;

    Hwidth = CInt(+Width / 2);
    Hheight = CInt(+_Height / 2);

    if (Null0(Childimg.width) != Null0(Hwidth) || Null0(Childimg.height) != Null0(Hheight)) {
        Print(); debugger;
        Childsrc = await JSB_BF_IMAGE_RESIZE(Childsrc, Hwidth, Hheight, function (_Childsrc, _Hwidth, _Hheight) { Childsrc = _Childsrc; Hwidth = _Hwidth; Hheight = _Hheight });
        Childimg = await JSB_BF_IMAGE_LOAD(CStr(Childsrc));
    }

    canvas = Image_Canvas(Width, _Height);
    ctx = Image_CTX(canvas);

    // composite now
    ctx.drawImage(Parentimg, 0, 0);

    if (CBool(ByRef_Xo)) ByRef_Xo = Hwidth; else ByRef_Xo = 0;
    if (CBool(ByRef_Yo)) ByRef_Yo = Hheight; else ByRef_Yo = 0;
    ctx.drawImage(Childimg, ByRef_Xo, ByRef_Yo);

    return exit(canvas.toDataURL('image/jpeg', 0.3));
}
// </IMAGE_REPLACEQUADRANT>

// <IMAGE_RESIZE>
async function JSB_BF_IMAGE_RESIZE(ByRef_Tile, ByRef_Newwidth, ByRef_Newheight, setByRefValues) {
    // local variables
    var Img;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tile, ByRef_Newwidth, ByRef_Newheight)
        return v
    }
    var canvas = undefined, ctx = undefined;
    if (Not(ByRef_Newwidth)) ByRef_Newwidth = 256;
    if (Not(ByRef_Newheight)) ByRef_Newheight = 256;

    canvas = Image_Canvas(ByRef_Newwidth, ByRef_Newheight);
    ctx = Image_CTX(canvas);

    Img = await JSB_BF_IMAGE_LOAD(CStr(ByRef_Tile));
    ctx.drawImage(Img, 0, 0, ByRef_Newwidth, ByRef_Newheight);
    return exit(canvas.toDataURL('image/jpeg', 0.3)); // (0, 0, NewWidth, NewHeight, "image/jpeg", .3)
}
// </IMAGE_RESIZE>

// <INDEXI>
function indexi(Str, Pattern, Cnt) {
    var Pos = undefined;

    if (Cnt === undefined) Cnt = 1;
    Pos = 0;
    Str = LCase(Str);
    Pattern = LCase(Pattern);

    while (Cnt > 0) {
        Pos = InStr1(Pos + 1, Str, Pattern);
        if (!Pos) return 0;
        Cnt--;
    }
    return Pos;
}
// </INDEXI>

// <INITBLUETOOTHSERIAL>
async function JSB_BF_INITBLUETOOTHSERIAL() {
    // local variables
    var Ignoredevice, Lastdevice, Autoattach, Bondedlist, Od, Hc;
    var Bluetoothdevices, Device, I, Devicename, Devicelist, Deviceproperties;

    if (!(await JSB_BF_ISBLUETOOTHENABLED())) {
        activeProcess.At_Errors = 'Your bluetooth is disabled.  Please enable and restart this program. ';
        return false;
    }

    if (await JSB_BF_ISBLUETOOTHCONNECTED()) return true;

    Ignoredevice = '';
    Lastdevice = At_Session.Item('lastDevice');
    Autoattach = true;

    // get bonded list
    Bondedlist = await JSB_BF_GETBLUETOOTHBONDEDLIST();
    if (isNothing(Bondedlist)) return false;


    while (true) {
        Od = [undefined,];
        Hc = [undefined,];
        Bluetoothdevices = {};

        I = LBound(Bondedlist) - 1;
        for (Device of iterateOver(Bondedlist)) {
            I++;
            Devicename = Device.name;
            if (!isEmpty(Devicename)) {
                if (Left(Devicename, 3) == 'HC-' && Null0(Devicename) != Null0(Ignoredevice)) Hc[Hc.length] = Devicename;
                Od[Od.length] = Devicename;
                Bluetoothdevices[Devicename] = Device;
            }
        }

        if (Not(Autoattach) || !Len(Hc)) {
            Println('Searching for Unpaired Devices');
            FlushHTML();
            Devicelist = await JSB_BF_GETBLUETOOTHUNPAIREDLIST();
            if (isNothing(Bondedlist)) return false;

            I = LBound(Devicelist) - 1;
            for (Device of iterateOver(Devicelist)) {
                I++;
                Devicename = Device.name;
                if (!isEmpty(Devicename)) {
                    if (LCase(Left(Devicename, 3)) == 'hc-' && Null0(Devicename) != Null0(Ignoredevice)) { if (Locate(Devicename, Hc, 0, 0, 0, "", position => { })); else Hc[Hc.length] = Devicename; }
                    if (Locate(Devicename, Od, 0, 0, 0, "", position => { })); else Od[Od.length] = Devicename;
                    Bluetoothdevices[Devicename] = Device;
                }
            }

            if (Len(Hc) == 1) Autoattach = true;
        }

        if (CBool(Lastdevice) && CBool(Bluetoothdevices[Lastdevice])) {
            Devicename = Lastdevice;
            Lastdevice = '';;
        } else if (Len(Hc) == 1 && CBool(Autoattach)) {
            Devicename = Hc[1];
        } else {
            Devicename = await JSB_BF_INPUTCOMBOBOX('title', 'Pick a device', CStr(Od), '', CStr(300), CStr(300));
            if (isEmpty(Devicename) || Devicename == Chr(27)) { activeProcess.At_Errors = ''; return false; }
        }

        Println('Attempting connection to ', Devicename);
        FlushHTML();

        Deviceproperties = Bluetoothdevices[Devicename];

        if (CNum(await JSB_BF_BLUETOOTHCONNECT(Deviceproperties.address, function (_P1) { }))) break;
        Println('Connection failed to ', Devicename);
        Ignoredevice = Devicename;
        Autoattach = false;
    }

    At_Session.Item('lastDevice', Devicename);

    return true;
}
// </INITBLUETOOTHSERIAL>

// <INNERHTML>
function innerHTML(_Html, Tagname) {
    var Si = undefined;
    var I1 = undefined;
    var I = undefined;
    var J = undefined;

    Si = InStr1(1, _Html, '\<' + CStr(Tagname));
    if (!Si) return undefined;
    I1 = InStr1(Si, _Html, '/\>');
    I = InStr1(Si, _Html, '\>');
    if (I1 > 0 && I1 < I) return undefined;
    if (!I) return (Alert('html Element error ' + CStr(Tagname)) ? undefined : undefined);
    Si = I + 1;
    J = InStr1(Si, _Html, '\</' + CStr(Tagname));
    if (!J) return (Alert('html Element error ' + CStr(Tagname)) ? undefined : undefined);

    return Mid1(_Html, Si, J - Si);
}
// </INNERHTML>

// <INPUTBOX>
async function JSB_BF_INPUTBOX(ByRef_Title, Message, Defaulttxt, Width, _Height, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Title)
        return v
    }
    // Returns Chr(27) if Canceled

    var Additionalattributes = undefined;
    var Jssubmit = '';
    var Jscancel = '';
    var Innerhtmldialog = '';

    if (Message === undefined) {
        Message = ByRef_Title;
        ByRef_Title = 'Input Box';
    }

    Jssubmit = 'storeVal(\'msgboxResult\', $(\'#inputBox\').val()); $(\'#dialog\').dialog(\'close\');';
    Jscancel = 'storeVal(\'msgboxResult\', Chr(27)); $(\'#dialog\').dialog(\'close\');';

    Additionalattributes = [undefined, 'style=\'width: 80%\'', 'autofocus'];
    Additionalattributes[Additionalattributes.length] = 'onKeyDown="if (event == undefined) event = window.event; if (event.which) key = event.which; else key = event.keyCode; if (key == \'13\') { ' + Jssubmit + ' }; if (key == \'27\') { ' + Jscancel + ' } "';

    Innerhtmldialog = Chr(28) + '\<h3 style=\'text-align:center\'\>' + Chr(29) + Message + Chr(28) + '\<br /\>\</h3\>' + Chr(29);
    Innerhtmldialog += JSB_HTML_TEXTBOX('inputBox', Defaulttxt, false, Additionalattributes);

    Innerhtmldialog += Chr(28) + '\<input type="button" value=\'OK\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    Innerhtmldialog += 'onclick="' + Jssubmit + '"';
    Innerhtmldialog += '/\>&nbsp;';

    Innerhtmldialog += '\<input type="button" value=\'Cancel\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    Innerhtmldialog += 'onclick="' + Jscancel + '"';
    Innerhtmldialog += '/\>&nbsp;';

    Innerhtmldialog += '\<script\>setTimeout(function () { $(\'#inputBox\').focus() }, 60)\</script\>' + Chr(29);

    return exit(await JSB_BF_DIALOG(ByRef_Title, Innerhtmldialog, true, CStr(Width), CStr(_Height)));
}
// </INPUTBOX>

// <INPUTBUTTON>
async function JSB_BF_INPUTBUTTON(Description, Value) {
    if (Not(Value)) Value = Description;
    return html('\<button type="button" class="btn btn-primary" onclick=' + jsEscapeAttr('appendKey(' + jsEscapeString(Value) + '); setFocus(10)') + '\>' + htmlEscape(Description) + '\</button\>');
}
// </INPUTBUTTON>

// <INPUTCOMBOBOX>
async function JSB_BF_INPUTCOMBOBOX(Title, Message, Values, Default, Width, _Height) {
    // local variables
    var _Innerhtml;

    // Returns Chr(27) if Canceled

    var Jssubmit = 'storeVal(\'msgboxResult\', Trim(formVar($(\'#ddbox\')))); $(\'#dialog\').dialog(\'close\');';
    var Jscancel = 'storeVal(\'msgboxResult\', Chr(27)); $(\'#dialog\').dialog(\'close\');';

    var Textboxadditionalattributes = [undefined, 'onKeyDown="if (event == undefined) event = window.event; if (event.which) key = event.which; else key = event.keyCode; if (key == \'13\') { ' + Jssubmit + ' }; if (key == \'27\') { ' + Jscancel + ' } "'];
    var Innerhtmldialog = CStr(Message) + CStr(ComboBox('ddbox', Values, Default, false, [undefined,], '', Textboxadditionalattributes, [undefined,])) + br();
    _Innerhtml = CStr(_Innerhtml) + Chr(28) + '\<input type="button" value=\'OK\' class=\'SubmitBtn\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    _Innerhtml += 'onclick="' + Jssubmit + '"';
    _Innerhtml += '/\>&nbsp;';

    _Innerhtml += '\<input type="button" value=\'Cancel\' class=\'SubmitBtn\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    _Innerhtml += 'onclick="' + Jscancel + '"';
    _Innerhtml += '/\>&nbsp;' + Chr(29);

    // if !Height Then Height = "60%"
    return await JSB_BF_DIALOG(CStr(Title), CStr(_Innerhtml), true, CStr(Width), CStr(_Height));
}
// </INPUTCOMBOBOX>

// <INPUTDATEBOX>
async function JSB_BF_INPUTDATEBOX(Title, Message, Default, Width, _Height) {
    // Returns Chr(27) if Canceled

    var Additionalattributes = undefined;
    var Jssubmit = '';
    var Jscancel = '';
    var Innerhtmldialog = '';

    if (Width === undefined) Width = '300px';
    if (_Height === undefined) _Height = '300px';

    Jssubmit = 'storeVal(\'msgboxResult\', formVar($(\'#ddbox\'))); $(\'#dialog\').dialog(\'close\');';
    Jscancel = 'storeVal(\'msgboxResult\', Chr(27)); $(\'#dialog\').dialog(\'close\');';

    Additionalattributes = [undefined, 'onKeyDown="if (event == undefined) event = window.event; if (event.which) key = event.which; else key = event.keyCode; if (key == \'13\') { ' + Jssubmit + ' }; if (key == \'27\') { ' + Jscancel + ' } "'];
    Additionalattributes[Additionalattributes.length] = 'class=\'ui-widget ui-widget-content\'';
    Additionalattributes[Additionalattributes.length] = 'style=\'width:100%\'';

    Innerhtmldialog = CStr(Innerhtmldialog) + Center(CStr(Message)) + CStr(DATEBOX('ddbox', Default, false, Additionalattributes));

    Innerhtmldialog += Chr(28) + '\<input type="button" id=\'defautAns\' value=\'OK\' class=\'SubmitBtn\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    Innerhtmldialog += 'onclick="' + Jssubmit + '"';
    Innerhtmldialog += '/\>&nbsp;';

    Innerhtmldialog += '\<input type="button" value=\'Cancel\' class=\'SubmitBtn\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    Innerhtmldialog += 'onclick="storeVal(\'msgboxResult\', Chr(27)); $(\'#dialog\').dialog(\'close\'); "';
    Innerhtmldialog += '/\>\<br/\>\<br/\>';
    Innerhtmldialog += '\<script\>$(document).ready(function () { setTimeout(function () { $( "#ddbox" ).datepicker("hide"); $(\'#defautAns\').focus() }, 20) } )\</script\>' + Chr(29);

    Innerhtmldialog = Center(Innerhtmldialog);

    return await JSB_BF_DIALOG(CStr(Title), Innerhtmldialog, true, Width, _Height);
}
// </INPUTDATEBOX>

// <INPUTDROPDOWNBOX>
async function JSB_BF_INPUTDROPDOWNBOX(Title, Message, Values, Default, Width, _Height) {
    // Returns Chr(27) if Canceled

    var Additionalattributes = undefined;
    var Jssubmit = '';
    var Jscancel = '';
    var _Innerhtml = '';

    Jssubmit = 'storeVal(\'msgboxResult\', Trim(formVar($(\'#ddbox\')))); $(\'#dialog\').dialog(\'close\');';
    Jscancel = 'storeVal(\'msgboxResult\', Chr(27)); $(\'#dialog\').dialog(\'close\');';

    Additionalattributes = [undefined, 'onKeyDown="if (event == undefined) event = window.event; if (event.which) key = event.which; else key = event.keyCode; if (key == \'13\') { ' + Jssubmit + ' }; if (key == \'27\') { ' + Jscancel + ' } "'];

    _Innerhtml = CStr(Message) + CStr(DropDownBox('ddbox', Values, Default, false, false, Additionalattributes, true));

    _Innerhtml += Chr(28) + '\<input type="button" value=\'OK\' class=\'SubmitBtn\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    _Innerhtml += 'onclick="' + Jssubmit + '"';
    _Innerhtml += '/\>&nbsp;';

    _Innerhtml += '\<input type="button" value=\'Cancel\' class=\'SubmitBtn\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    _Innerhtml += 'onclick="storeVal(\'msgboxResult\', Chr(27)); $(\'#dialog\').dialog(\'close\'); "';
    _Innerhtml += '/\>&nbsp;' + Chr(29);

    // if !Height Then Height = "60%"

    return await JSB_BF_DIALOG(CStr(Title), _Innerhtml, true, CStr(Width), CStr(_Height));
}
// </INPUTDROPDOWNBOX>

// <INPUTLISTBOX>
async function JSB_BF_INPUTLISTBOX(Title, Message, Values, Default, Width, _Height) {
    // Returns Chr(27) if Canceled

    var Jssubmit = 'storeVal(\'msgboxResult\', formVar($(\'#ddbox\'))); $(\'#dialog\').dialog(\'close\');';
    var Jscancel = 'storeVal(\'msgboxResult\', Chr(27)); $(\'#dialog\').dialog(\'close\');';

    var Additionalattributes = [undefined, 'onKeyDown="if (event == undefined) event = window.event; if (event.which) key = event.which; else key = event.keyCode; if (key == \'13\') { ' + Jssubmit + ' }; if (key == \'27\') { ' + Jscancel + ' } "'];
    Additionalattributes[Additionalattributes.length] = 'class=\'ui-widget ui-widget-content\'';

    var Innerhtmldialog = CStr(Message) + CStr(ListBox('ddbox', Values, Default, false, false, Additionalattributes));

    Innerhtmldialog += Chr(28) + '\<br/\>\<input type="button"  value="OK" id=\'defaultAns\' class=\'SubmitBtn\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    Innerhtmldialog += 'onclick="' + Jssubmit + '" /\>&nbsp;';

    Innerhtmldialog += '\<input type="button" value="Cancel" class=\'SubmitBtn\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    Innerhtmldialog += 'onclick="' + Jscancel + '" /\>&nbsp;' + Chr(29);

    return await JSB_BF_DIALOG(CStr(Title), Innerhtmldialog, true, CStr(Width), CStr(_Height));
}
// </INPUTLISTBOX>

// <INPUTMULTISELECT>
async function JSB_BF_INPUTMULTISELECT(Title, Message, Choicearray, Selectedones, Width, _Height, Fixeditemwidth) {
    var Jssubmit = 'var v1 = $(\'#dialog input:checked\').map(function(){ return Trim($(this).parent().text()); }).get(); v1 = Change(v1, \',\', Chr(254)); storeVal(\'msgboxResult\', v1); $(\'#dialog\').dialog(\'close\');';
    var Jscancel = 'storeVal(\'msgboxResult\', Chr(27)); $(\'#dialog\').dialog(\'close\');';

    var Aa = [undefined,];
    Aa[Aa.length] = 'onKeyDown="if (event == undefined) event = window.event; if (event.which) key = event.which; else key = event.keyCode; if (key == \'13\') { ' + Jssubmit + ' }; if (key == \'27\') { ' + Jscancel + ' } "';
    // AA[-1] = `class='ui-widget ui-widget-content'`

    var _Innerhtml = CStr(Message) + br() + JSB_HTML_MULTISELECTLISTBOX('ddbox', Choicearray, CStr(Selectedones), Aa, false, CStr(Fixeditemwidth)) + br();

    _Innerhtml += Chr(28) + '\<div class="centerBtns"\>';
    _Innerhtml += '\<input type="button" value=\'Select All\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    _Innerhtml += '   onclick="$(\'#dialog\').find(\':checkbox\').prop(\'checked\', true);"';
    _Innerhtml += '/\>&nbsp;';

    _Innerhtml += '\<input type="button" value=\'None\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    _Innerhtml += '   onclick="$(\'#dialog\').find(\':checkbox\').prop(\'checked\', false);"';
    _Innerhtml += '/\>&nbsp;';

    _Innerhtml += '\<input type="button"  value="OK" id=\'defaultAns\' class=\'SubmitBtn\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    _Innerhtml += 'onclick="' + Jssubmit + '" /\>&nbsp;';

    _Innerhtml += '\<input type="button" value="Cancel" class=\'SubmitBtn\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    _Innerhtml += 'onclick="' + Jscancel + '" /\>&nbsp;' + Chr(29);

    return await JSB_BF_DIALOG(CStr(Title), _Innerhtml, true, CStr(Width), CStr(_Height));
}
// </INPUTMULTISELECT>

// <INPUTMULTISELECTDROPDOWNBOX>
async function JSB_BF_INPUTMULTISELECTDROPDOWNBOX(Title, Message, Values, Defaults, Width, _Height) {
    // Returns Chr(27) if Canceled

    var Additionalattributes = undefined;
    var Jssubmit = '';
    var Jscancel = '';
    var _Innerhtml = '';

    Jssubmit = 'storeVal(\'msgboxResult\', Trim(formVar($(\'#ddbox\')))); $(\'#dialog\').dialog(\'close\');';
    Jscancel = 'storeVal(\'msgboxResult\', Chr(27)); $(\'#dialog\').dialog(\'close\');';

    Additionalattributes = [undefined, 'onKeyDown="if (event == undefined) event = window.event; if (event.which) key = event.which; else key = event.keyCode; if (key == \'13\') { ' + Jssubmit + ' }; if (key == \'27\') { ' + Jscancel + ' } "', 'style=\'width:100%\''];

    _Innerhtml = CStr(Message) + br() + CStr(multiSelectDropDownBox('ddbox', Values, Defaults, Additionalattributes)); // multiSelectListBox(ID, Values, Defaults, Sortable, AdditionalAttributes)

    _Innerhtml += Chr(28) + '\r\n\
          \<div class="centerBtns"\>\r\n\
              \<button type=\'button\' class=\'SubmitBtn\' onclick="' + Jssubmit + '"\'\>OK\</button\>\r\n\
              \<button type=\'button\' class=\'SubmitBtn\' onclick="' + Jscancel + '"\'\>Cancel\</button\>\r\n\
           \</div\>\r\n\
       \</ul\>\r\n\
    \</div\>' + crlf + Chr(29);

    return await JSB_BF_DIALOG(CStr(Title), _Innerhtml, true, CStr(Width), CStr(_Height));
}
// </INPUTMULTISELECTDROPDOWNBOX>

// <INPUTMULTISELECTLISTBOX>
async function JSB_BF_INPUTMULTISELECTLISTBOX(Title, Message, Values, Defaults, Width, _Height) {
    // Returns Chr(27) if Canceled

    var Additionalattributes = undefined;
    var Jssubmit = '';
    var Jscancel = '';
    var _Innerhtml = '';

    Jssubmit = 'storeVal(\'msgboxResult\', Trim(formVar($(\'#ddbox\')))); $(\'#dialog\').dialog(\'close\');';
    Jscancel = 'storeVal(\'msgboxResult\', Chr(27)); $(\'#dialog\').dialog(\'close\');';

    Additionalattributes = [undefined, 'onKeyDown="if (event == undefined) event = window.event; if (event.which) key = event.which; else key = event.keyCode; if (key == \'13\') { ' + Jssubmit + ' }; if (key == \'27\') { ' + Jscancel + ' } "'];

    _Innerhtml = CStr(Message) + br() + JSB_HTML_MULTISELECTLISTBOX('ddbox', Values, CStr(Defaults), Additionalattributes); // multiSelectListBox(ID, Values, Defaults, AdditionalAttributes)

    _Innerhtml += Chr(28) + '\r\n\
          \<div class="centerBtns"\>\r\n\
              \<button type=\'button\' class=\'SubmitBtn\' onclick="$(\'#dialog\').find(\':checkbox\').prop(\'checked\', true);"\>Select All\</button\>&nbsp;\r\n\
              \<button type=\'button\' class=\'SubmitBtn\' onclick="$(\'#dialog\').find(\':checkbox\').prop(\'checked\', false);"\>Select None\</button\>&nbsp;\r\n\
              \<button type=\'button\' class=\'SubmitBtn\' onclick="' + Jssubmit + '"\'\>OK\</button\>\r\n\
              \<button type=\'button\' class=\'SubmitBtn\' onclick="' + Jscancel + '"\'\>Cancel\</button\>\r\n\
           \</div\>\r\n\
       \</ul\>\r\n\
    \</div\>' + crlf + Chr(29);

    return await JSB_BF_DIALOG(CStr(Title), _Innerhtml, true, CStr(Width), CStr(_Height));
}
// </INPUTMULTISELECTLISTBOX>

// <INPUTSORTABLELIST>
async function JSB_BF_INPUTSORTABLELIST(Title, Message, Values, Width, _Height) {
    // local variables
    var X;

    var Jssubmit = 'var v1 = formVar($(\'#ddbox\')); v1 = Change(v1, \',\', Chr(254)); storeVal(\'msgboxResult\', v1); $(\'#dialog\').dialog(\'close\');';
    var Jscancel = 'storeVal(\'msgboxResult\', Chr(27)); $(\'#dialog\').dialog(\'close\');';
    var Aa = [undefined, 'onKeyDown="if (event == undefined) event = window.event; if (event.which) key = event.which; else key = event.keyCode; if (key == \'13\') { ' + Jssubmit + ' }; if (key == \'27\') { ' + Jscancel + ' } "'];

    var Innerhtmldialog = '\<h3 style=\'text-align:center\'\>' + CStr(htmlEncode(Message)) + '\<br /\>\</h3\>';
    Innerhtmldialog = CStr(Message) + br() + JSB_HTML_SORTABLELISTBOX('ddbox', Values, Aa) + br();

    Innerhtmldialog += Chr(28) + '\<input type="button" value=\'OK\' class=\'SubmitBtn\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    Innerhtmldialog += 'onclick="' + Jssubmit + '"';
    Innerhtmldialog += '/\>&nbsp;';

    Innerhtmldialog += '\<input type="button" value=\'Cancel\' class=\'SubmitBtn\' style=\'border:1px solid; border-radius: 9px; -webkit-border-radius: 9px; filter:alpha(opacity=80); opacity:0.8; background-color: lightgray; color: black;\'';
    Innerhtmldialog += 'onclick="' + Jscancel + '"';
    Innerhtmldialog += '/\>&nbsp;' + Chr(29);

    X = await JSB_BF_DIALOG(CStr(Title), Innerhtmldialog, true, CStr(Width), CStr(_Height));
    return X;
}
// </INPUTSORTABLELIST>

// <IOCONV>
async function JSB_BF_IOCONV(Io, Cstring, Conv, Lr, Iocache) {
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                var Cachedtranslates = undefined;
                var Numamc = undefined;
                var Ilen = undefined;
                var Docap = undefined;
                var Secs = undefined;
                var Mins = undefined;
                var Cmdi = undefined;
                var Starti = undefined;
                var Ci = undefined;
                var Notfound = undefined;
                var Subvalue = undefined;
                var Scalefactor = undefined;
                var Iamc = undefined;
                var Result = undefined;
                var Sl = undefined;
                var Hours = undefined;
                var F = undefined;
                var Cmd = '';
                var Scmd = '';
                var Mx = '';
                var Pat = '';
                var Signcode = '';
                var Cmdc = '';
                var C = '';
                var Sep = '';
                var Theday = '';
                var Theyear = '';
                var Themonthname = '';
                var Yytype = '';
                var Yytext = '';
                var Range1 = '';
                var Ddata = '';
                var Fname = '';
                var Ccode = '';
                var Oamc = '';
                var Amc = '';
                var Ccode1 = '';
                var Cacheid = '';
                var Whereclause = '';
                var Itemid = '';
                var F_File = '';
                var Idx = undefined;
                var Theyearlength = '';
                var Td = '';
                var Themonth = '';


                activeProcess.At_Status = undefined;

                if (CBool(Iocache)) null; else { gotoLabel = "_Else_1"; continue atgoto }

            case "PREPARSED":

                switch (Iocache.preParse) {
                    case 'TextExtraction2':
                        return Mid1(Cstring, Iocache.Range1, Iocache.Range2);
                        break;

                    case 'TextExtractionR':
                        return Right(Cstring, Iocache.Length);
                        break;

                    case 'TextExtractionL':
                        return Left(Cstring, Iocache.Length);
                        break;

                    case 'returnCString':
                        return Cstring;
                        break;

                    case 'TextTranslate':
                        gotoLabel = "TEXTTRANSLATE"; continue atgoto;

                        break;

                    default:
                        return Stop('error');
                }
                gotoLabel = "_EndIf_1"; continue atgoto;
            case "_Else_1":

                Iocache = {};
            case "_EndIf_1":


                Result = [undefined,];
                Ilen = Len(Cstring);
                Cmd = UCase(Mid1(Conv, 1));
                Scmd = Left(Cmd, 1);
                Io = UCase(Io);

                switch (true) {
                    case Mid1(Cmd, 1, 2) == 'MC':
                        switch (true) {
                            case Cmd == 'MCU':
                                return UCase(Cstring);

                                break;

                            case Cmd == 'MCL':
                                return LCase(Cstring);

                                break;

                            case Cmd == 'MCA':
                                var _ForEndI_8 = Ilen;
                                for (Idx = 1; Idx <= _ForEndI_8; Idx++) {
                                    Mx = Mid1(Cstring, Idx, 1);
                                    if (Mx >= 'A' && Mx <= 'Z') {
                                        Result[Result.length] = Mx;
                                    } else if (Mx >= 'a' && Mx <= 'z') {
                                        Result[Result.length] = Mx;
                                    }
                                }
                                return Join(Result, '');
                                break;

                            case Cmd == 'MC/A':
                                var _ForEndI_11 = Ilen;
                                for (Idx = 1; Idx <= _ForEndI_11; Idx++) {
                                    Mx = Mid1(Cstring, Idx, 1);
                                    Mx = Mid1(Cstring, Idx, 1);
                                    if (Mx >= 'A' && Mx <= 'Z'); else if (Mx >= 'a' && Mx <= 'z'); else {
                                        Result[Result.length] = Mx;
                                    }
                                }
                                return Join(Result, '');
                                break;

                            case Cmd == 'MCD':
                                if (Io == 'I') {
                                    return XTD(Cstring);
                                } else if (isNumeric(Cstring)) {
                                    return DTX(Cstring);
                                } else {
                                    activeProcess.At_Status = 1;
                                }
                                break;

                            case Cmd == 'MCX' || Cmd == 'MCXD':
                                if (Io == 'O') {
                                    return XTD(Cstring);
                                } else if (isNumeric(Cstring)) {
                                    return DTX(Cstring);
                                } else {
                                    activeProcess.At_Status = 1;
                                }
                                break;

                            case Cmd == 'MCN':
                                var _ForEndI_18 = Ilen;
                                for (Idx = 1; Idx <= _ForEndI_18; Idx++) {
                                    Mx = Mid1(Cstring, Idx, 1);
                                    if (isNumeric(Mx)) Result[Result.length] = Mx;
                                }
                                return Join(Result, '');
                                break;

                            case Cmd == 'MC/N':
                                var _ForEndI_20 = Ilen;
                                for (Idx = 1; Idx <= _ForEndI_20; Idx++) {
                                    Mx = Mid1(Cstring, Idx, 1);
                                    if (isNumeric(Mx) == 0) {
                                        Result[Result.length] = Mx;
                                    }
                                }
                                return Join(Result, '');
                                break;

                            case Cmd == 'MCP':
                                var _ForEndI_22 = Ilen;
                                for (Idx = 1; Idx <= _ForEndI_22; Idx++) {
                                    Mx = Mid1(Cstring, Idx, 1);
                                    if (Seq(Mx) > 250) {
                                        Mx = Chr(Seq(Mx) - 254 + Seq('^'));
                                    } else if (Seq(Mx) <= 31 || Seq(Mx) > 127) {
                                        Mx = '.';
                                    }
                                    Result[Result.length] = Mx;
                                }
                                return Join(Result, '');
                                break;

                            case Cmd == 'MCT':
                                Docap = 1;
                                var _ForEndI_25 = Ilen;
                                for (Idx = 1; Idx <= _ForEndI_25; Idx++) {
                                    Mx = Mid1(Cstring, Idx, 1);
                                    if ((Mx >= 'a' && Mx <= 'z')) {
                                        if (Docap) Mx = UCase(Mx);
                                        Docap = 0;
                                    } else if (Mx == ' ') {
                                        Docap = 1;
                                    } else {
                                        if (Docap == 0) Mx = LCase(Mx);
                                        Docap = 0;
                                    }
                                    Result[Result.length] = Mx;
                                }
                                return Join(Result, '');
                        }

                        break;

                    case (Cmd == 'MX') || (Cmd == 'MP'):
                        if (Ilen == 0) {
                            activeProcess.At_Status = 1;
                            return undefined;
                        }
                        if (Io == 'O') return STX(Cstring); else return XTS(Cstring);

                        break;

                    case Left(Cmd, 2) == 'MT':
                        if (Io == 'O') {
                            if (isNumeric(Cstring) == 0) {
                                activeProcess.At_Status = 1;
                                return undefined;
                            }
                            Secs = +Cstring % 60;
                            Hours = CInt(+Cstring / 60);
                            Mins = Hours % 60;
                            Hours = CInt(Hours / 60);
                            Hours = Hours % 24;
                            if (InStr1(1, UCase(Conv), 'H')) {
                                if (Hours < 13) {
                                    Pat = 'AM';
                                } else {
                                    Pat = 'PM';
                                    Hours -= 12;
                                }
                            }
                            if (InStr1(1, UCase(Conv), 'S')) {
                                return Right('00' + CStr(Hours), 2) + ':' + Right('00' + CStr(Mins), 2) + ':' + Right('00' + CStr(Secs), 2) + Pat;
                            } else {
                                return Right('00' + CStr(Hours), 2) + ':' + Right('00' + CStr(Mins), 2) + Pat;
                            }
                        } else {
                            return CNum(r83Time(Cstring)) * 60 * 60 * 24;
                        }

                        break;

                    case (Scmd == 'M') && (Io == 'O'):
                        return CStr(Fmt(Cstring, Conv), true);

                        break;

                    case Scmd == 'M':
                        // IO = "I"
                        Scalefactor = 0;
                        Signcode = ' ';
                        Cmdi = 2;

                        Cmdc = CStr(UCase(Mid1(Cmd, Cmdi, 1)), true);
                        if (((Cmdc == 'L') || (Cmdc == 'R')) || (Cmdc == 'D')) {
                            Cmdi++;
                            Cmdc = CStr(UCase(Mid1(Cmd, Cmdi, 1)), true);
                        }
                        if (isNumeric(Cmdc) && (Cmdc)) {
                            Scalefactor = -CInt(Cmdc);
                            Cmdi++;
                            Cmdc = CStr(UCase(Mid1(Cmd, Cmdi, 1)), true);
                        }

                        if (isNumeric(Cmdc) && (Cmdc)) {
                            Scalefactor = Scalefactor * 2;
                            Scalefactor = Scalefactor - (CInt(Cmdc) - 4);
                            Cmdi++;
                            Cmdc = CStr(UCase(Mid1(Cmd, Cmdi, 1)), true);
                        }

                        if (Cmdc == 'Z') {
                            Cmdi++;
                            Cmdc = CStr(UCase(Mid1(Cmd, Cmdi, 1)), true);
                        }
                        if (Cmdc == ',') {
                            Cmdi++;
                            Cmdc = CStr(UCase(Mid1(Cmd, Cmdi, 1)), true);
                        }
                        if (InStr1(1, ' CDEM', Cmdc) > 1) {
                            Signcode = Cmdc;
                            Cmdi++;
                            Cmdc = CStr(UCase(Mid1(Cmd, Cmdi, 1)), true);
                        }
                        if (Cmdc == '$') {
                            Cmdi++;
                            Cmdc = CStr(UCase(Mid1(Cmd, Cmdi, 1)), true);
                        }

                        Idx = 1;

                        while (InStr1(1, '!0$* \<', Mid1(Cstring, Idx, 1)) > 1) {
                            Idx++;
                        }
                        Starti = Idx;
                        if ((Mid1(Cstring, Idx, 1) == '-') || (Mid1(Cstring, Idx, 1) == '+')) Idx++;

                        while (true) {
                            C = Mid1(Cstring, Idx, 1);
                            if (Not(isNumeric(C) && C)) break;
                            Idx++;
                        }
                        if (Mid1(Cstring, Idx, 1) == '.') Idx++;

                        while (true) {
                            C = Mid1(Cstring, Idx, 1);
                            if (Not(isNumeric(C) && C)) break;
                            Idx++;
                        }
                        F = CNum(Mid1(Cstring, Starti, Idx - Starti));
                        Cmdc = Mid1(Cstring, Idx, 1);
                        if (Cmdc == 'C') F = -F;
                        if (Cmdc == '\>') F = -F;
                        if (Cmdc == '-') F = -F;
                        if (Scalefactor) F = F * Math.pow(10, (-Scalefactor));

                        if (Signcode == 'D') {
                            if (Cmdc != 'D') F = -F;
                            return CStr(F) + 'DB' + Mid1(Cstring, Idx);
                        }

                        return CStr(F) + Mid1(Cstring, Idx);

                        break;

                    case Cmd == 'XTD':
                        return XTD(Cstring);

                        break;

                    case Cmd == 'DTX':
                        if (isNumeric(Cstring)) return DTX(Cstring);

                        break;

                    case Scmd == 'D':
                        if (Io == 'O' && Cmd != 'DI') {
                            if (isNumeric(Cstring) == false) {
                                activeProcess.At_Status = 1;
                                return undefined;
                            }
                            if (Left(Cmd, 2) == 'DY') Conv = Mid1(Conv, 2);

                            Theyearlength = Mid1(Conv, 2, 1);
                            if (isNumeric(Theyearlength) && Theyearlength) {
                                Theyearlength = CInt(Mid1(Conv, 2, 1));
                                Sep = Mid1(Conv, 3, 1);
                            } else {
                                Theyearlength = 4;
                                Sep = Mid1(Conv, 2, 1);
                            }

                            Td = CNum(Cstring);
                            Theday = JSB_BF_THEDAY(Td);
                            if (Len(Theday) == 1) Theday = '0' + Theday;
                            Theyear = JSB_BF_THEYEAR(Td);
                            Themonth = JSB_BF_THEMONTH(Td);
                            if (Len(Themonth) == 1) Themonth = '0' + Themonth;

                            switch (1) {
                                case Cmd == 'DD':
                                    return Theday;
                                    break;

                                case Cmd == 'DJ':
                                    return +Td - CNum(r83Date('1/1/' + Theyear));
                                    break;

                                case Cmd == 'DM':
                                    return Themonth;
                                    break;

                                case Cmd == 'DMA':
                                    return UCase(Left(JSB_BF_THEMONTHNAME(Td), 3));
                                    break;

                                case Cmd == 'DQ':
                                    return CInt((+Themonth - 1) / 3 + 1);
                                    break;

                                case Cmd == 'DW':
                                    // Numeric day of the week
                                    Idx = DayOfWeek(Td);
                                    if (Idx == 0) Idx = 7;
                                    return Idx;
                                    break;

                                case Cmd == 'DWA':
                                    return UCase(JSB_BF_THEWEEKDAY(Td));
                                    break;

                                case Left(Cmd, 2) == 'DY':
                                    return Right(Theyear, Theyearlength);
                                    break;

                                case 1:
                                    if (!Sep) {
                                        Themonthname = UCase(JSB_BF_THEMONTHNAME(Td));
                                        return Theday + ' ' + Mid1(Themonthname, 1, 3) + Mid1(' ', 1, Theyearlength) + Right(Theyear, Theyearlength);
                                    } else {
                                        return Theday + Sep + Themonth + Mid1(Sep, 1, Theyearlength) + Right(Theyear, Theyearlength);
                                    }
                            }
                        } else {
                            // ICONV ON DATE
                            if (isNumeric(Cstring)) return Cstring; else return r83Date(Cstring);
                        }

                        break;

                    case Cmd == 'U50BB':
                        return JSB_BF_WHO();

                        break;

                    case Cmd == 'U80E0':
                        activeProcess.At_Echo = 0;

                        break;

                    case Cmd == 'U70E0':
                        activeProcess.At_Echo = 1;

                        break;

                    case Scmd == 'T':


                        gotoLabel = "_outOfLineCaseBlock_97"; continue atgoto;

                    default:
                        activeProcess.At_Status = 2;
                        return Cstring;
                }

                gotoLabel = "_toEndCase_4"; continue atgoto;


            case "_outOfLineCaseBlock_97":
                Ci = 2; // Skip T
                Result = '';
                Yytype = await JSB_BF_ICONV_LEX(Conv, Ci, Yytext, function (_Conv, _Ci, _Yytext) { Conv = _Conv; Ci = _Ci; Yytext = _Yytext });
                if (Yytext == ';') { Yytype = await JSB_BF_ICONV_LEX(Conv, Ci, Yytext, function (_Conv, _Ci, _Yytext) { Conv = _Conv; Ci = _Ci; Yytext = _Yytext }); }
                activeProcess.At_Errors = '';

                // Simple Text Extraction (Mid(RANGE1, n) ?)
                if (Null0(Yytype) == V_NUM) {
                    Range1 = Yytext;
                    if (Mid1(Conv, Ci, 1) == ',') {
                        Yytype = await JSB_BF_ICONV_LEX(Conv, Ci, Yytext, function (_Conv, _Ci, _Yytext) { Conv = _Conv; Ci = _Ci; Yytext = _Yytext });
                        Yytype = await JSB_BF_ICONV_LEX(Conv, Ci, Yytext, function (_Conv, _Ci, _Yytext) { Conv = _Conv; Ci = _Ci; Yytext = _Yytext });
                        if (Null0(Yytype) != V_NUM) {
                            activeProcess.At_Errors = 'Tm,n: Text extraction: Missing length';
                            return activeProcess.At_Errors;
                        }

                        Iocache.preParse = 'TextExtraction2';
                        Iocache.Range1 = Range1;
                        Iocache.Range2 = Yytext;
                    } else {
                        Iocache.Length = Yytext;
                        if (Lr == 'R') Iocache.preParse = 'TextExtractionR'; else Iocache.preParse = 'TextExtractionL';
                    }
                    gotoLabel = "PREPARSED"; continue atgoto;
                }

                // Note that CString is the ITEMID for the file

                // t{DICT }
                if (Yytext == 'DATA' || Yytext == 'DICT') {
                    Ddata = Yytext;
                    Yytype = await JSB_BF_ICONV_LEX(Conv, Ci, Yytext, function (_Conv, _Ci, _Yytext) { Conv = _Conv; Ci = _Ci; Yytext = _Yytext });
                    if (Null0(Yytype) != V_IDENT) {
                        activeProcess.At_Errors = 'Tfile;c;iamc;oamc: Missing file name';
                        return activeProcess.At_Errors;
                    }
                } else {
                    Ddata = '';
                }

                // t{DICT }file
                if (Null0(Yytype) != V_IDENT) {
                    activeProcess.At_Errors = 'Bad Text extract: Tn, or bad translate: Tfile;c;iamc;oamc';
                    return activeProcess.At_Errors;
                }
                Fname = Yytext;

                Yytext = Mid1(Conv, Ci, 1); Ci++;
                if (Yytext != ';' && Yytext) {
                    activeProcess.At_Errors = 'Tfile;c;iamc;oamc: Translate missing ;';
                    return activeProcess.At_Errors;
                }

                // t{DICT }file{ ;[c,i,o,v,x]}
                Yytext = UCase(Mid1(Conv, Ci, 1));
                if (Index1('VCIOX', Yytext, 1) && Mid1(Conv, Ci + 1, 1) == ';') {
                    Ci++;
                    if (Yytext == 'C' && isNumber(Mid1(Conv, Ci, 1))) {
                        Yytype = await JSB_BF_ICONV_LEX(Conv, Ci, Yytext, function (_Conv, _Ci, _Yytext) { Conv = _Conv; Ci = _Ci; Yytext = _Yytext });
                        Ccode = 'C' + Yytext;
                    }
                    Ccode = UCase(Yytext);
                } else {
                    Ccode = 'X';
                }

                Yytext = Mid1(Conv, Ci, 1);
                if (Yytext == ';') Ci++;

                // t{DICT }file;[c,i,o,v,x]{[vc|*]}; iamc
                Yytype = await JSB_BF_ICONV_LEX(Conv, Ci, Yytext, function (_Conv, _Ci, _Yytext) { Conv = _Conv; Ci = _Ci; Yytext = _Yytext }); // Get iamc
                if (Yytext == ';' || !Yytext) {
                    Iamc = 1;
                    if (Io == 'I') { Iocache.preParse = 'returnCString'; gotoLabel = "PREPARSED"; continue atgoto; }
                } else {
                    Iamc = Yytext;
                    Yytext = Mid1(Conv, Ci, 1); Ci++;
                }

                if (Yytext == ';') {
                    Yytype = await JSB_BF_ICONV_LEX(Conv, Ci, Yytext, function (_Conv, _Ci, _Yytext) { Conv = _Conv; Ci = _Ci; Yytext = _Yytext }); // Get oamc
                    if (Yytext == ';') {
                        if (Io == 'O') { Iocache.preParse = 'returnCString'; gotoLabel = "PREPARSED"; continue atgoto; }
                    } else {
                        Oamc = Yytext;
                        Yytext = Mid1(Conv, Ci, 1); Ci++;
                    }
                } else {
                    Oamc = Iamc;
                }

                Result = ''; Notfound = 1;

                if (Io == 'I') Amc = Iamc; else Amc = Oamc;
                Numamc = isNumber(Amc);

                // Pick up Cache
                Iocache.preParse = 'TextTranslate';
                Iocache.AMC = Amc;
                Iocache.OAMC = Oamc;
                Iocache.IAMC = Iamc;
                Iocache.DDATA = Ddata;
                Iocache.FNAME = Fname;
                Iocache.NUMAMC = Numamc;
                Iocache.CachedTranslates = {};
                Iocache.CCODE = Ccode;
                Iocache.CCODE1 = Left(Ccode, 1);
                Iocache.SubValue = Mid1(Ccode, 2);


            case "TEXTTRANSLATE":

                Oamc = Iocache.OAMC;
                Amc = Iocache.AMC;
                Iamc = Iocache.IAMC;
                Ddata = Iocache.DDATA;
                Fname = Iocache.FNAME;
                Numamc = Iocache.NUMAMC;
                Ccode = Iocache.CCODE;
                Ccode1 = Iocache.CCODE1;
                Subvalue = Iocache.SubValue;

                if (await JSB_ODB_OPEN(Ddata, Fname, F_File, function (_F_File) { F_File = _F_File })); else return activeProcess.At_Errors;

                Cachedtranslates = Iocache.CachedTranslates;

                Cacheid = LCase(Io + '*' + Ddata + '*' + Fname + '*' + CStr(Cstring) + '*' + Amc);
                Result = Cachedtranslates[Cacheid];

                // Read Result if necessary
                if (Result === undefined) {
                    if (Io == 'O') {
                        if (Numamc) {
                            if (await JSB_ODB_READV(Result, F_File, CStr(Cstring), +Oamc, function (_Result) { Result = _Result })); else Result = undefined;
                        } else {
                            if (await JSB_ODB_READJSON(Result, F_File, CStr(Cstring), function (_Result) { Result = _Result })) Result = Result[Oamc]; else Result = undefined;
                        }
                    } else {
                        // Select F_File Where AMC = CString Return ItemID
                        if (Numamc) Whereclause = '*A' + CStr(Iamc) + ' = \'' + CStr(Cstring) + '\''; else Whereclause = CStr(Iamc) + ' = \'' + CStr(Cstring) + '\'';
                        if (await JSB_ODB_SELECTTO('', F_File, Whereclause, Sl, function (_Sl) { Sl = _Sl })) {
                            Itemid = readNext(Sl).itemid;
                            if (Itemid) Result = Itemid; else Result = undefined;
                        } else {
                            Result = undefined;
                        }
                    }
                    if (!(Result === undefined)) {
                        Cachedtranslates[Cacheid] = Result;
                        // IOCache.CachedConvCachedTranslates = CachedTranslates;
                    }
                }

                switch (true) {
                    case Ccode1 == 'V' || (Ccode == 'I' && Io == 'I') || (Ccode == 'O' && Io == 'O'):
                        if (Len(Result) == 0) {
                            activeProcess.At_Errors = 'Missing T Conversion Item, not on file: ' + Ddata + ' ' + Fname + ' ' + CStr(Cstring) + ', ' + Oamc;
                            return activeProcess.At_Errors;
                        }
                        return Cstring;

                        break;

                    case Ccode1 == 'C' || (Ccode == 'I' && Io == 'O') || (Ccode == 'O' && Io == 'I'):
                        if (Len(Result) == 0) Result = Cstring;
                }

                // SubValue??
                if (Subvalue) return Extract(Result, 1, Subvalue, 0);
                return Result;

                gotoLabel = "_toEndCase_4"; continue atgoto;

            case "_toEndCase_4":


                return '';


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </IOCONV>

// <ICONV_LEX>
async function JSB_BF_ICONV_LEX(ByRef_Conv, ByRef_Ci, ByRef_Yytext, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Conv, ByRef_Ci, ByRef_Yytext)
        return v
    }
    // LEX - Return YYTYPE (V_Str, V_Num, V_Ident, V_Sym), YYText
    var Ch = '';
    var Ech = '';


    Ch = Mid1(ByRef_Conv, ByRef_Ci, 1);
    ByRef_Ci++;
    ByRef_Yytext = Ch;
    if (!Ch) return exit(V_EOL);

    // Check for a string
    if (Ch == '\'' || Ch == '"' || Ch == '\\') {
        Ech = Ch;
        ByRef_Yytext = Ch;

        do {
            Ch = Mid1(ByRef_Conv, ByRef_Ci, 1);
            ByRef_Ci++;
            ByRef_Yytext += Ch;
        }
        while (Not(!Ch || Ch == Ech));
        return exit(V_STR);
    }

    // Check for a number
    if (Index1('0123456789', Ch, 1)) {

        while (true) {
            Ch = Mid1(ByRef_Conv, ByRef_Ci, 1);
            if (Not(Index1('0123456789', Ch, 1) && Ch)) break;
            ByRef_Ci++;
            ByRef_Yytext += Ch;
        }
        return exit(V_NUM);
    }

    // Check for a identifier
    if (isAlpha(Ch)) {

        while (true) {
            Ch = Mid1(ByRef_Conv, ByRef_Ci, 1);
            if (Not(!(Index1(';,-:.+^&#[](){}\<\>=*/\'\\' + '"', Ch, 1)) && Ch)) break;
            ByRef_Ci++;
            ByRef_Yytext += Ch;
        }
        return exit(V_IDENT);
    }

    ByRef_Yytext = Ch;
    return exit(V_SYM);
}
// </ICONV_LEX>

// <ISASPXC>
function JSB_BF_ISASPXC() {
    return false;
}
// </ISASPXC>

// <ISAUTHENTICATED>
function JSB_BF_ISAUTHENTICATED() {
    // local variables
    var _Userno;

    _Userno = userno();
    if (Not(At_Session.Item(_Userno))) { At_Session.Item(_Userno, {}); }
    if (CBool(At_Session.Item(_Userno).UserName)) return true;
    return false;
}
// </ISAUTHENTICATED>

// <ISBLUETOOTHCONNECTED>
async function JSB_BF_ISBLUETOOTHCONNECTED() {
    // local variables
    var _Err, Callbacknumber;

    await new Promise(resolve => bluetoothSerial.isConnected(function () { Callbacknumber = 1; resolve(Callbacknumber) }, function (__Err) { _Err = __Err; Callbacknumber = 2; resolve(Callbacknumber) }));
    return Null0(Callbacknumber) == 1;
}
// </ISBLUETOOTHCONNECTED>

// <ISBLUETOOTHENABLED>
async function JSB_BF_ISBLUETOOTHENABLED() {
    // local variables
    var _Err, Callbacknumber;

    await new Promise(resolve => bluetoothSerial.isEnabled(function () { Callbacknumber = 1; resolve(Callbacknumber) }, function (__Err) { _Err = __Err; Callbacknumber = 2; resolve(Callbacknumber) }));
    return Null0(Callbacknumber) == 1;
}
// </ISBLUETOOTHENABLED>

// <ISBREAKENABLED>
function isBreakEnabled() {
    return System(23);
}
// </ISBREAKENABLED>

// <ISCLERK>
async function JSB_BF_ISCLERK() {
    // I am a clerk if I'm in the clerk role or anything higher( "administrator", "director", "manager", "clerk", and "employee")
    if (await JSB_BF_ISINROLE('clerk')) return true;
    return await JSB_BF_ISMANAGER();
}
// </ISCLERK>

// <ISDIRECTOR>
async function JSB_BF_ISDIRECTOR() {
    // I am a director if I'm in the director role or anything higher( "administrator", "director", "manager", "clerk", and "employee")
    if (await JSB_BF_ISINROLE('director')) return true;
    return isAdmin();
}
// </ISDIRECTOR>

// <ISDOUBLE>
function isDouble(O) {
    return typeOf(O) == 'Double';

}
// </ISDOUBLE>

// <ISECHOENABLED>
function isEchoEnabled() {
    return System(24);
}
// </ISECHOENABLED>

// <ISEMPLOYEE>
async function JSB_BF_ISEMPLOYEE() {
    // local variables
    var Mydomain;

    // I am a employee if I'm in the employee role or anything higher ( "administrator", "director", "manager", "clerk", and "employee"), or in the myDomain
    var Em = '';
    var Mymydomain = '';

    if (await JSB_BF_ISINROLE('employee')) return true;
    if (!JSB_BF_ISAUTHENTICATED()) return false;

    Em = fieldRight(await JSB_BF_EMAIL(), '@');
    Mydomain = Domain();

    while (DCount(Em, '.') > 2) {
        Em = dropLeft(Em, '.');
    }

    while (DCount(Mydomain, '.') > 2) {
        Mydomain = dropLeft(CStr(Mydomain), '.');
    }
    if (Null0(Em) == Null0(Mydomain)) return true;

    return await JSB_BF_ISCLERK();
}
// </ISEMPLOYEE>

// <ISHTA>
function isHTA() {
    if (System(1) != 'js') return false;
    return window.runningHTA;
}
// </ISHTA>

// <ISHTMLDOC>
async function JSB_BF_ISHTMLDOC(Ddict, Fname, Iname) {
    if (Iname === undefined) {
        Iname = Fname;
        Fname = Ddict;
        Ddict = '';
    }

    if (Left(Fname, 5) == 'dict ') return false;

    var Ext = LCase(fieldRight(Iname, '.'));
    if (Ext == 'htm' || Ext == 'html') return true;

    var Htmlfiles = await JSB_BF_JSBCONFIG('htmlfiles');

    Fname = await JSB_BF_TRUEFILENAME(Fname);
    if (Locate(Fname, Htmlfiles, 0, 0, 0, "", position => { })) return true;
    return false;
}
// </ISHTMLDOC>

// <ISHTMLPROCESS>
async function JSB_BF_ISHTMLPROCESS() {
    return System(38);
}
// </ISHTMLPROCESS>

// <ISINROLE>
async function JSB_BF_ISINROLE(Role) {
    // local variables
    var At, Admincheck, _Username, _Isadmin, F_Users, Profile;
    var Myroles;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                if (!JSB_BF_ISAUTHENTICATED()) return false;

                At = await JSB_BF_AUTHENTICATIONTYPE();
                if (At == 'none') { gotoLabel = "ISADMIN"; continue atgoto; }

                Role = LCase(Role);
                Admincheck = (Role == 'admin' || Role == 'administrator');

                _Username = UserName();

                if (CBool(Admincheck)) {
                    if (System(1) == 'gae') {
                        _Isadmin = At_Request.IsAdmin;
                        if (CBool(_Isadmin)) { gotoLabel = "ISADMIN"; continue atgoto; }
                    }
                }

                if (await asyncOpen("", 'jsb_users', _fHandle => F_Users = _fHandle)); else return false;
                if (await asyncRead(F_Users, _Username, "JSON", 0, _data => Profile = _data)) {
                    Myroles = Profile.isinrole;
                    if (CBool(Admincheck)) {
                        if (Locate('admin', Myroles, 0, 0, 0, "", position => { })) { gotoLabel = "ISADMIN"; continue atgoto; }
                        if (Locate('administrator', Myroles, 0, 0, 0, "", position => { })) { gotoLabel = "ISADMIN"; continue atgoto; }
                        At_Session.Item(userno()).IsAdmin = false;
                    } else {
                        if (Locate(Role, Myroles, 0, 0, 0, "", position => { })) return true;
                    }
                }

                return false;


            case "ISADMIN":

                At_Session.Item(userno()).IsAdmin = 1;
                At_Session.Item(userno()).IsAuthenticated = true;
                At_Session.Item(userno()).UserName = _Username;
                return true;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </ISINROLE>

// <ISLOCALHOST>
function IsLocalHost() {
    if (System(1) == 'js') return true;
    return At_Request.Url.Host == 'localhost';

}
// </ISLOCALHOST>

// <ISMANAGER>
async function JSB_BF_ISMANAGER() {
    // I am a manager if I'm in the manager role or anything higher( "administrator", "director", "manager", "clerk", and "employee")
    if (await JSB_BF_ISINROLE('manager')) return true;
    return await JSB_BF_ISDIRECTOR();
}
// </ISMANAGER>

// <ISNULL2>
async function JSB_BF_ISNULL2(ByRef_A, ByRef_B, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_A, ByRef_B)
        return v
    }
    if (isNothing(ByRef_A)) return exit(ByRef_B);
    return exit(ByRef_A);
}
// </ISNULL2>

// <ISOBJ>
function ISObj(O) {
    return typeOf(O) == '[object]';

}
// </ISOBJ>

// <ISODD>
function IsODD(X) {
    return X % 2 == 1;

}
// </ISODD>

// <ISPOSTBACK>
function isPostBack() {
    if (System(1) == 'aspx') {
        if (Null0(At_Request.Files.Count) > '0') return true;
        return At_Request.HTTPMETHOD == 'POST';;
    } else if (System(1) == 'gae') {
        return At_Request.HTTPMETHOD == 'POST';;
    } else {
        return 0;
    }

}
// </ISPOSTBACK>

// <ISRESTRICTEDFILE>
async function JSB_BF_ISRESTRICTEDFILE(Ddata, Filename) {
    var L5 = '';
    var Publicfiles = '';

    if (CBool(isAdmin())) return false;
    if (Filename === undefined) {
        Filename = Ddata;
        Ddata = '';
    }

    L5 = LCase(Left(Filename, 5));
    if (L5 == 'data ' || L5 == 'dict ') {
        Ddata = Trim(L5);
        Filename = Mid1(Filename, 6);
    }
    if (LCase(Ddata) == 'dict') Filename = 'dict ' + Filename;

    Publicfiles = LCase(await JSB_BF_JSBCONFIG('publicfiles'));

    Filename = LCase(Filename);
    if (Locate(Filename, Publicfiles, 0, 0, 0, "", position => { })) return false;

    Filename = LCase(await JSB_BF_TRUEFILENAME(Filename));
    if (Locate(Filename, Publicfiles, 0, 0, 0, "", position => { })) return false;

    activeProcess.At_Errors = Filename + ' is not a public file';
    return true;
}
// </ISRESTRICTEDFILE>

// <ISSQLSERVER>
function isSqlServer(Fhandle) {
    // local variables
    var E;

    if (Fhandle === undefined) {
        try {
            if (System(1) == 'aspx') return System(17).isSqlServer;
        } catch (E) {
            return false;
        }

        return false;
    }

    if (JSB_BF_TYPEOFFILE(Fhandle) != 'ado') return false;

    try {
        if (System(1) == 'aspx') return Fhandle.isSqlServer;
    } catch (E) {
        return false;
    }
}
// </ISSQLSERVER>

// <ISUSER>
function isUser() {
    return JSB_BF_ISAUTHENTICATED();
}
// </ISUSER>

// <ISVALIDJSON>
function isValidJSon(Js) {
    return CJSon(Js) != undefined;
}
// </ISVALIDJSON>

// <JOINATTRIBUTES>
function joinAttributes(Oadditionalattributes, Withdel) {
    // local variables
    var Jtag;

    var S = '';

    if (Withdel === undefined) Withdel = ' ';
    if (typeOf(Oadditionalattributes) == 'Array') {
        S = Join(Oadditionalattributes, Withdel);;
    } else if (typeOf(Oadditionalattributes) == 'JSonObject') {
        var Rtnattributearray = [undefined,];
        var Jadditionalattributes = Oadditionalattributes;
        for (Jtag of iterateOver(Jadditionalattributes)) {
            var Pvalue = Jadditionalattributes[Jtag];
            if (isNumeric(Pvalue)) {
                Rtnattributearray[Rtnattributearray.length] = CStr(Jtag) + '=' + Pvalue;
            } else {
                var Qt = '';
                if (InStr1(1, Pvalue, '\'')) Qt = '"'; else Qt = '\'';
                Rtnattributearray[Rtnattributearray.length] = CStr(Jtag) + '=' + Qt + Pvalue + Qt;
            }
        }

        S = Join(Rtnattributearray, Withdel);
    } else {

        S = Oadditionalattributes;
    }

    if (Len(S)) return ' ' + S;
    return '';
}
// </JOINATTRIBUTES>

// <JSBACCOUNT>
function jsbAccount() {
    var Act = '';

    Act = jsbRootAct();
    Act = Field(Act, '/', DCount(Act, '/') - 1);
    if (System(1) != 'js') return Act;

    // for js, account name comes from .html file
    Act = Field(Field(Act, '/', DCount(Act, '/')), '.', 1);
    if (Act == 'tcl') Act = 'jsb';
    return Act;
}
// </JSBACCOUNT>

// <JSBACCOUNTS>
async function JSB_BF_JSBACCOUNTS() {
    var Actlist = undefined;
    var Acts = undefined;
    var Spot = undefined;
    var Allactlist = '';
    var Item = '';

    if (System(1) == 'aspx') {
        Acts = Split(Trim(Extract(ExecuteDOS('dir ' + jsbDataBaseDir() + ' /b/w'), 1, 0, 0)), crlf);
        if (Locate('_gsdata_', Acts, 0, 0, 0, "", position => Spot = position)) Acts.delete(Spot);
        return Acts;
    }

    Allactlist = await JSB_BF_FSELECT(jsbDataBaseDir(), undefined, undefined, undefined, function (_P1) { });

    Actlist = [undefined,];
    for (Item of iterateOver(Allactlist)) {
        if (Left(Item, 1) == '[' && Right(Item, 1) == ']') {
            Item = Mid1(Item, 2, Len(Item) - 2);
            Actlist[Actlist.length] = Item;
        }
    }
    return Actlist;
}
// </JSBACCOUNTS>

// <JSBACT>
function jsbAct() {
    return jsbAccount();
}
// </JSBACT>

// <JSBROOTDIR>
function jsbRootDir() {
    if (System(1) == 'js') {
        if (window.runningHTA) {
            return Change(dropIfLeft(dropIfRight(JSB_BF_URL(), '/') + '/', 'file:///'), '/', '\\');
        }
        if (window.dotNetObj) return dropIfRight(dropIfRight(dropIfRight(CStr(System(26)), '\\'), '\\'), '\\') + '\\';

        return dropIfRight(jsbRootAct(), '/') + '/';
    } else if (System(1) == 'gae') {
        return '.\\';
    } else {
        return At_Server.mappath('/' + dropIfRight(dropLeft(dropLeft(jsbRootAct(), '//'), '//'), '//'));
    }
}
// </JSBROOTDIR>

// <JSBDATADIR>
function jsbDataDir() {
    if (System(1) == 'js') {
        if (window.isPhoneGap()) return window.fileSystem.root.nativeURL;
        if (window.runningHTA) {
            return Change(dropIfLeft(dropIfRight(JSB_BF_URL(), '/') + '/', 'file:///'), '/', '\\') + 'App_Data\\';
        }
        if (window.dotNetObj) return dropIfRight(dropIfRight(CStr(System(26)), '\\'), '\\') + '\\';
        return '/';
    } else if (System(1) == 'gae') {
        return '.\\';
    } else {
        return CStr(At_Server.mappath('/')) + 'App_Data\\';
    }
}
// </JSBDATADIR>

// <JSBDATABASEDIR>
function jsbDataBaseDir() {
    if (System(1) == 'js') {
        if (window.isPhoneGap()) return window.fileSystem.root.nativeURL;
        if (window.runningHTA) {
            return Change(dropIfLeft(dropIfRight(JSB_BF_URL(), '/') + '/', 'file:///'), '/', '\\') + 'App_Data\\_database\\';
        }
        if (window.dotNetObj) return dropIfRight(CStr(System(26)), '\\') + '\\';
        return '/';
    } else if (System(1) == 'gae') {
        return '.\\';
    } else {
        return jsbDataDir() + '_database\\';
    }
}
// </JSBDATABASEDIR>

// <JSBACCOUNTDIR>
function jsbAccountDir(Accountname) {
    if (Not(Accountname)) Accountname = jsbAccount();

    if (System(1) == 'js') {
        if (window.isPhoneGap()) return window.fileSystem.root.nativeURL;
        if (window.runningHTA) {
            return Change(dropIfLeft(dropIfRight(JSB_BF_URL(), '/') + '/', 'file:///'), '/', '\\') + 'App_Data\\_database\\hta\\';
        }
        if (window.dotNetObj) return CStr(System(26)) + '\\';
        return '/jsonBasic/';
    } else if (System(1) == 'gae') {
        return '.\\';
    } else {
        return jsbDataDir() + '_database\\' + Accountname + '\\';
    }
}
// </JSBACCOUNTDIR>

// <JSBCONFIG>
async function JSB_BF_JSBCONFIG(Varname, Defaultvalue) {
    // Note: use updateJsbConfig(varName, value) to write a new value

    var Item = JSB_BF_USERVAR('config ' + CStr(Varname));

    if (Item === undefined) {
        var F_Config = undefined;
        if (await asyncOpen("", 'jsb_config', _fHandle => F_Config = _fHandle)) {
            var Sitem = '';
            if (await asyncRead(F_Config, Varname, "", 0, _data => Sitem = _data)) {
                if (isValidJSon(Sitem)) {
                    Item = parseJSON(Sitem);;
                } else if (InStr1(1, Sitem, am)) {
                    Item = Split(Sitem, am);;
                } else {
                    Item = Sitem;
                }
            }
        }

        if (Item === undefined) Item = Defaultvalue;
        if (Item === undefined) {
            if (Varname == 'authenticationtype') { Item = { "value": 'local' } }
            if (Varname == 'core.jsb') Item = Split('js,css,jsb_mdl,jsb_tcl,jsb_html,jsb_themes,jsb_ctls,jsb_cspc,jsb_bf,jsb_odb', ',');
            if (Varname == 'publicfiles') Item = Split('js,css,jsb_html,jsb_bf,jsb_tcl,jsb_demos,jsb_examples,jsb_docs,tapefile', ',');
            if (Varname == 'roles') Item = Split('admin,director,manager,clerk,employee', ',');
            if (Item === undefined) {
                activeProcess.At_Errors = 'jsbConfig item not found ' + CStr(Varname);
                return Item;
            }
        }

        JSB_BF_USERVAR('config ' + CStr(Varname), Item);
    } else {
        Item = clone(Item);
    }

    return Item;
}
// </JSBCONFIG>

// <JSBRESTCALL>
function jsbRestCall(Subnameandparams, Jsstringescapeit) {
    // local variables
    var Param, Parami;

    // Handle https://, http://, file://, ftp://
    var Url = '';

    Subnameandparams = RTrim(LTrim(Subnameandparams));
    if (InStr1(1, Left(Subnameandparams, 8), '//')) return Subnameandparams;
    if (Right(Subnameandparams, 1) == ')' && InStr1(1, Subnameandparams, '(')) {
        var Firstp = InStr1(1, Subnameandparams, '(');
        var Subname = Left(Subnameandparams, Firstp - 1);
        var Sparams = Mid1(Subnameandparams, Firstp + 1);
        Sparams = Left(Sparams, Len(Sparams) - 1);
        var Params = Split(Sparams, ',');
        Url = CStr(System(31)) + '?' + Subname;
        Parami = LBound(Params) - 1;
        for (Param of iterateOver(Params)) {
            Parami++;
            Param = LTrim(RTrim(Param));
            Url += '&_p' + CStr(Parami) + '=';

            if (isNumeric(Param)) {
                Url += CStr(Param);
            } else if (Left(Param, 1) == '\'' && Right(Param, 1) == '\'') {
                Url += urlEncode(Mid1(Param, 2, Len(Param) - 2));
            } else if (Left(Param, 1) == '"' && Right(Param, 1) == '"') {
                Url += urlEncode(Mid1(Param, 2, Len(Param) - 2));
            } else if (Left(Param, 1) == '{') {
                Url += CStr(Param);
            } else {
                Url += '{' + CStr(Param) + '}'; // Assume post back form id;
            }
        }

        return Url;
    }

    if (System(1) == 'js') {
        // Url = window.myRpcUrl:"?":Replace(SubNameAndParams, "?", "&")
        Url = CStr(window.myRpcUrl) + Subnameandparams;
    } else {
        Url = jsbRootAct(false) + Subnameandparams;
    }

    if (Jsstringescapeit) Url = jsEscapeHREF(Url);

    return Url;
}
// </JSBRESTCALL>

// <JSBROOTACCOUNTDIRECTORY>
function jsbRootAccountDirectory() {
    return jsbDataBaseDir() + Account() + '\\';
}
// </JSBROOTACCOUNTDIRECTORY>

// <JSBROOTACTDIR>
function jsbRootActDir() {
    return jsbAccountDir(CStr(jsbAccount()));
}
// </JSBROOTACTDIR>

// <JSBROOTDIRECTORY>
function jsbRootDirectory() {
    var I = undefined;
    var Basedir = '';

    if (System(1) == 'js') return jsbRoot();
    Basedir = Field(jsbRoot(), '//', 2);
    I = InStr1(1, Basedir, '/');
    if (I) Basedir = Mid1(Basedir, I); else Basedir = '/';
    return At_Server.MapPath(Basedir); // ends in \
}
// </JSBROOTDIRECTORY>

// <JSBROOTEXECUTE>
function jsbRootExecute(Urlcmdandparams, Jsstringescapeit) {
    // Handle https://, http://, file://, ftp://
    if (InStr1(1, Left(Urlcmdandparams, 8), '//')) return Urlcmdandparams;

    Urlcmdandparams = Change(Urlcmdandparams, '+', '%20');
    var Rootpath = jsbRootAct(false);
    if (Right(Rootpath, 1) == '/') {
        Rootpath += Urlcmdandparams;
    } else {
        var I = InStr1(1, Urlcmdandparams, '?');
        if (I) Urlcmdandparams = (Left(Urlcmdandparams, I - 1) + '&' + Mid1(Urlcmdandparams, I + 1));
        Rootpath += '?' + Urlcmdandparams;
    }

    if (Jsstringescapeit) Urlcmdandparams = jsEscapeHREF(Urlcmdandparams);
    return Urlcmdandparams;
}
// </JSBROOTEXECUTE>

// <JSBROOTEXECUTETCLCMD>
function JSB_BF_JSBROOTEXECUTETCLCMD(Tclcmd, Jsstringescapeit) {
    // Handle https://, http://, file://, ftp://
    if (InStr1(1, Left(Tclcmd, 8), '//')) return Tclcmd;
    return jsbRootExecute(Change(urlEncode(Tclcmd), '+', '%20'), CStr(Jsstringescapeit));
}
// </JSBROOTEXECUTETCLCMD>

// <JSCOMPILE>
async function JSB_BF_JSCOMPILE(ByRef_Fname, ByRef_Iname, ByRef__Code, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Fname, ByRef_Iname, ByRef__Code)
        return v
    }
    var Fh = undefined;
    var Result = '';

    if (await JSB_ODB_OPEN('', CStr(ByRef_Fname), Fh, function (_Fh) { Fh = _Fh })); else {
        Fh = await JSB_BF_FHANDLE('', ByRef_Fname, true);
        if (await JSB_ODB_WRITE('R-', await JSB_BF_FHANDLE('dict', ByRef_Fname, true), 'options.txt')); else return exit(CStr(activeProcess.At_Errors) + '^');
    }

    if (await JSB_ODB_WRITE(CStr(ByRef__Code), Fh, CStr(ByRef_Iname))); else return exit(CStr(activeProcess.At_Errors) + '^');
    await asyncTclExecute('basic ' + CStr(ByRef_Fname) + ' ' + CStr(ByRef_Iname), _capturedData => Result = _capturedData)
    return exit(Result);
}
// </JSCOMPILE>

// <JSCONDITIONALSSCRIPT>
async function JSB_BF_JSCONDITIONALSSCRIPT(Id, Fielddefinitions, Isknockout) {
    var Script = undefined;
    var Attachments = undefined;
    var Emptylist = undefined;
    var Column = undefined;
    var Condition = undefined;
    var Hideshowfield = '';
    var Nnhideshowfield = '';
    var Nnhideshowfield_Inquotes = '';
    var Lastblock = '';
    var Allany = '';
    var Block = '';
    var Jsfunction = '';
    var Jsparameter = '';
    var Evalfield = '';
    var Operator = '';
    var Tovalue = '';
    var Evalfield_Quoted = '';
    var Lastjsfunction = '';
    var Lastjsparameter = '';
    var Cond = '';

    Script = [undefined,];
    Attachments = [undefined,];
    Id = JSB_BF_NICENAME(CStr(Id));

    for (Column of iterateOver(Fielddefinitions)) {
        if (Len(Column.jsconditionals) > 0) {
            // hideShowField is the field that gets turned off or on
            Hideshowfield = Column.field;
            if (Not(Hideshowfield)) Hideshowfield = Column.name;

            Nnhideshowfield = JSB_BF_NICENAME(Hideshowfield);
            if (Isknockout) {
                Nnhideshowfield_Inquotes = '\'KO_' + Nnhideshowfield + '_\' + koIndex';
            } else {
                Nnhideshowfield_Inquotes = '\'' + Nnhideshowfield + '\'';
            }

            Emptylist = true;
            Lastblock = 'zzz';

            for (Condition of iterateOver(Column.jsconditionals)) {
                Allany = Condition.allany;
                Block = Condition.block;
                Jsfunction = Condition.jsfunction;
                Jsparameter = Condition.jsparameter;

                Evalfield = Condition.field;
                Operator = Condition.operator;
                Tovalue = Condition.tovalue;

                if (Isknockout) Evalfield_Quoted = '\'KO_' + Evalfield + '_\' + koIndex'; else Evalfield_Quoted = '\'' + Evalfield + '\'';

                // Changing blocks?
                if (Block != Lastblock) {
                    // previous block?
                    if (!Emptylist) {
                        Script[Script.length] = CStr(Lastjsfunction) + '(' + Nnhideshowfield_Inquotes + ', ' + Lastblock + '_AllPass, triggeringField, parentValue, \'' + CStr(Lastjsparameter) + '\')';
                        Script[Script.length] = '}';
                    }
                    Emptylist = true;
                    Lastblock = Block;
                    Lastjsparameter = Jsparameter;
                    Lastjsfunction = Jsfunction;
                }

                // first entry for a new block?
                if (Emptylist) {
                    Emptylist = false;

                    Script[Script.length] = 'function ' + Id + '_' + Nnhideshowfield + '_' + Jsfunction + '(triggeringField, parentValue) {';
                    if (Isknockout) { Script[Script.length] = ' var koIndex = fieldRight($(triggeringField).attr(\'id\'), \'_\');'; }

                    if (Allany == 'Any') {
                        Script[Script.length] = ' var ' + Block + '_AllPass = false;';
                    } else {
                        Script[Script.length] = ' var ' + Block + '_AllPass = true;';
                    }
                }

                if (Operator == 'InList') {
                    Cond = 'inList(formVar(' + Evalfield_Quoted + '), ' + Tovalue + ', true) != -1';;
                } else if (Operator == 'Not InList') {
                    Cond = 'inList(formVar(' + Evalfield_Quoted + '), ' + Tovalue + ', true) == -1';;
                } else {
                    if (Operator == '=') Operator = '==';
                    if (Operator == '\<\>') Operator = '!=';
                    Cond = 'formVar(' + Evalfield_Quoted + ') ' + Operator + ' ' + Tovalue;
                }

                if (Allany == 'Any') {
                    Script[Script.length] = 'if (' + Cond + ') ' + Block + '_AllPass = true';;
                } else {
                    Script[Script.length] = 'if (' + Cond + ') ; else ' + Block + '_AllPass = false';
                }

                if (Isknockout) {
                    Attachments[Attachments.length] = 'attachToElementChange(\'KO_' + Evalfield + '\', ' + Id + '_' + Nnhideshowfield + '_' + Jsfunction + ', null, true)';
                } else {
                    Attachments[Attachments.length] = 'attachToElementChange(\'' + Evalfield + '\', ' + Id + '_' + Nnhideshowfield + '_' + Jsfunction + ', null, false)';
                }
            }

            if (!Emptylist) {
                Script[Script.length] = Lastjsfunction + '(' + Nnhideshowfield_Inquotes + ', ' + Lastblock + '_AllPass, triggeringField, parentValue, \'' + Lastjsparameter + '\')';
                Script[Script.length] = '}';;
            }
        }
    }

    if (Len(Script) == 0) return '';

    return Join(Script, crlf) + crlf + Join(Attachments, crlf);
}
// </JSCONDITIONALSSCRIPT>

// <JSESCAPEATTR>
function jsEscapeAttr(S, Q) {
    // S = Change(S, '\\', '\\\\') ??
    if ((InStr1(1, S, '\'') && !Q) || Q == '"') {
        if (Q) Q = ''; else Q = '"';
        S = (Q + Change(Change(S, '&', '&amp;'), '"', '&quot;') + Q); // minimum form of HTMLENCODE();
    } else {
        if (Q) Q = ''; else Q = '\'';
        S = (Q + Change(Change(S, '&', '&amp;'), '\'', '&apos;') + Q); // minimum form of HTMLENCODE();
    }

    S = (Change(S, Chr(13), '&#013;'));
    S = (Change(S, Chr(10), '&#010;'));
    return S;
}
// </JSESCAPEATTR>

// <JSESCAPEHREF>
function jsEscapeHREF(S) {
    // S = Replace(S, '"', "&quot;")
    // S = Replace(S, "'", "&apos;")

    S = Change(S, '"', '%22');
    S = Change(S, '\'', '%27');

    if (Left(S, 2) == '//') return jsEscapeAttr(S);
    if (Left(S, 1) == '/') return jsEscapeAttr(HtmlRoot() + Mid1(S, 2));
    if (Left(S, 2) != './') return jsEscapeAttr(S);

    // Make full paths to our stuff
    if (Left(S, 5) == './js/') return jsEscapeAttr(jsbRoot() + Mid1(S, 3));
    if (Left(S, 6) == './css/') return jsEscapeAttr(jsbRoot() + Mid1(S, 3));
    if (Left(S, 8) == './fonts/') return jsEscapeAttr(jsbRoot() + Mid1(S, 3));
    if (Left(S, 7) == './pics/') return jsEscapeAttr(jsbRoot() + Mid1(S, 3));
    if (Left(S, 6) == './css/') return jsEscapeAttr(jsbRoot() + Mid1(S, 3));

    if (Left(S, 2) == './') return jsEscapeAttr(HtmlRoot() + Mid1(S, 3));

    return jsEscapeAttr(S);
}
// </JSESCAPEHREF>

// <JSESCAPESTRING>
function jsEscapeString(X, Q) {
    X = '' + CStr(X);

    if (Not(Q)) {
        if (InStr1(1, X, '\'')) Q = '"'; else Q = '\'';
    }

    X = Change(X, '\\', '\\\\');
    X = Change(X, '"', '\\"');
    X = Change(X, '\'', '\\\'');
    X = Change(X, '\</', '\<\\/');
    X = Change(X, '\<', '\\x3C'); // this keeps the jsb print processor from catching <head> and <body> inside of javascript strings

    X = Change(X, Chr(255), '\\xFF');
    X = Change(X, Chr(254), '\\xFE');
    X = Change(X, Chr(253), '\\xFD');
    X = Change(X, Chr(252), '\\xFC');
    X = Change(X, Chr(13), '\\r');
    X = Change(X, Chr(10), '\\n');

    X = Change(X, Chr(28), '');
    X = Change(X, Chr(29), '');

    return Q + X + Q;
}
// </JSESCAPESTRING>

// <JSMINIFY>
async function JSB_BF_JSMINIFY(Javascriptcode) {
    // local variables
    var Jscode, Is2, Lastam, Specials, Results, Token, I, Firstchar;
    var Isidentifier, Lasttokenidentifier, Lefttwochars, Rightchar;
    var Allresults;

    Jscode = Change(Javascriptcode, Chr(9), ' ');

    Jscode = Change(Jscode, crlf, am);
    Jscode = Change(Jscode, Chr(13), am);
    Jscode = Change(Jscode, Chr(10), am);
    Is2 = Split(Jscode, 2);

    Lastam = true;
    Specials = (am + ',:(+-%&/|');

    Results = [undefined,];
    I = LBound(Is2) - 1;
    for (Token of iterateOver(Is2)) {
        I++;
        Firstchar = Mid1(Token, 1, 1);
        if (+I % 20000 == 0) FlushHTML();

        Isidentifier = isAlpha(Firstchar); // (firstChar >= 'a' And firstChar <= 'z') Or (firstChar >= 'A' And firstChar <= 'Z')
        if (CBool(Lasttokenidentifier) && CBool(Isidentifier)) Results[Results.length] = ' ';

        if (Left(Token, 1) == '/') {
            Lefttwochars = Left(Token, 2);
            if (Lefttwochars != '/*' && Lefttwochars != '//') {
                Results[Results.length] = Token;
                Lastam = false;
            }
        } else {
            Rightchar = Right(Token, 1);
            if (InStr1(1, Specials, Rightchar)) {
                if (Rightchar == am) {
                    if (Not(Lastam)) Results[Results.length] = crlf;
                    Lastam = true;;
                } else {
                    Results[Results.length] = Token;
                    Lastam = true;
                }
            } else {
                Results[Results.length] = Token;
                Lastam = false;
            }
        }

        Lasttokenidentifier = Isidentifier;
    }

    Allresults = CStr(Allresults) + Join(Results, '');

    return Allresults;

}
// </JSMINIFY>

// <JSON2STRING>
function Json2String(S) {
    return window.json2string(S);
}
// </JSON2STRING>

// <KEYINWAIT>
async function JSB_BF_KEYINWAIT(Dowait) {
    if (CBool(Dowait)) {
        window.KeyWaitRoutine = function (e) { window.KeyInValue = e.keyCode + '.' + e.ctrlKey + '.' + e.shiftKey; doJsbSubmit(false); };
        $(window.document).on('keydown', window.KeyWaitRoutine);
        await At_Server.asyncPause(me);
        $(window.document).off('keydown', window.KeyWaitRoutine);
        return window.KeyInValue;
    }
    return KeyIn();
}
// </KEYINWAIT>

// <LANDSCAPEMODE_Sub>
function JSB_BF_LANDSCAPEMODE_Sub() {
    if (hasPlugIn('cordova-plugin-screen-orientation')) window.screen.orientation.lock('landscape');
}
// </LANDSCAPEMODE_Sub>

// <LANGUAGE>
function Language(Text, P1, P2, P3, P4) {
    return Text;

}
// </LANGUAGE>

// <LBLCTLSET>
function lblCtlSet(_Label, Ctlhtml, Ctlid, Fullline, Suppresslabel, Lblstyle) {
    if (Suppresslabel === undefined) Suppresslabel = !_Label;
    if (Not(Ctlhtml)) return '';
    if (Lblstyle) { Lblstyle = 'padding-top:5px; ' + CStr(Lblstyle); } else Lblstyle = 'padding-top:5px';
    if (Fullline) {
        if (Suppresslabel) {
            return Chr(28) + '\<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12"\>' + Chr(29) + CStr(Ctlhtml) + Chr(28) + '\</div\>' + Chr(29);
        } else {
            return Chr(28) + '\<label id="LBL_' + CStr(Ctlid) + '" for="' + CStr(Ctlid) + '" class="col-xs-12 col-sm-2 col-md-2 col-lg-2 form-control-label" style="' + Lblstyle + '"\>' + Change(htmlEscape(_Label), ' ', '&nbsp;') + '\</label\>\r\n\
            \<div class="col-xs-12 col-sm-10 col-md-10 col-lg-10"\>' + Chr(29) + CStr(Ctlhtml) + Chr(28) + '\</div\>' + Chr(29);
        }
    } else {
        if (Suppresslabel) {
            return Chr(28) + '\<div class="col-xs-12 col-sm-6 col-md-6 col-lg-4"\>' + Chr(29) + CStr(Ctlhtml) + Chr(28) + '\</div\>' + Chr(29);
        } else {
            return Chr(28) + '\<label id="LBL_' + CStr(Ctlid) + '" for="' + CStr(Ctlid) + '" class="col-xs-12 col-sm-2 col-md-2 col-lg-2 form-control-label" style="' + Lblstyle + '"\>' + Change(htmlEscape(_Label), ' ', '&nbsp;') + '\</label\>\r\n\
            \<div class="col-xs-12 col-sm-4 col-md-4 col-lg-2"\>' + Chr(29) + CStr(Ctlhtml) + Chr(28) + '\</div\>' + Chr(29);
        }
    }
}
// </LBLCTLSET>

// <LCASEJSON>
function LCaseJSON(Jsonrec) {
    // local variables
    var Key;

    if ((Not(Jsonrec))) { return {} }
    if (typeOf(Jsonrec) != 'JSonObject') return Jsonrec;

    var Newrec = {};
    for (Key of iterateOver(Jsonrec)) {
        Newrec[LCase(Key)] = Jsonrec[Key];
    }
    return Newrec;
}
// </LCASEJSON>

// <LEAFLET_Sub>
async function JSB_BF_LEAFLET_Sub(Usecaching) {
    // local variables
    var Callbacks, Fetchinfo, Coords, Img;

    await Include_JSB_BF___Leaflet(false)
    Commons_JSB_BF.Activerecording = false;

    if (Not(window.leafLet_Initialized)) {

        Commons_JSB_BF.Iambusy = 0;
        Commons_JSB_BF.Tilelist = [undefined,];

        if (Usecaching) {
            if (!(await JSB_BF_LEAFLET_OPENTILECACHES(false))) return Stop(activeProcess.At_Errors);
        }

        Commons_JSB_BF.Redtile = leaflet_tileRGB(255, 0, 0, 255);

        if (Not(await asyncLoadFile(jsbRoot() + 'css/leaflet.css', {}, true))) return Stop(activeProcess.At_Errors);
        if (Not(await asyncLoadFile(jsbRoot() + 'js/leaflet.js', {}, true))) return Stop(activeProcess.At_Errors);
        if (Not(await asyncLoadFile(jsbRoot() + 'css/leaflet.awesome-markers.css', {}, true))) return Stop(activeProcess.At_Errors);
        if (Not(await asyncLoadFile(jsbRoot() + 'js/leaflet.awesome-markers.js', {}, true))) return Stop(activeProcess.At_Errors);
        if (Not(await asyncLoadFile(jsbRoot() + 'css/leaflet.easybutton.css', {}, true))) return Stop(activeProcess.At_Errors);
        if (Not(await asyncLoadFile(jsbRoot() + 'js/leaflet.easybutton.js', {}, true))) return Stop(activeProcess.At_Errors);

        // Create a map outside of jsb
        $('body').append('\<div id="map" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; background-color: gray;"\>\</div\>');

        if (!this.me) this.me = {};
        me.startPoint = [44.6663, -115.7029]

        // initialize the map on the "map" div with a given center and zoom
        map = L.map('map', {
            "scrollWheelZoom": 'center', "doubleClickZoom": 'center',
            "touchZoom": 'center',
            "tap": false
        }).setView(me.startPoint, 7);

        // Allow software zoom to level 22 if offline
        if ((Commons_JSB_BF.Fakeoffline || !JSB_BF_ONLINE())) Commons_JSB_BF.Maxzoom = 22; else Commons_JSB_BF.Maxzoom = 19;

        Commons_JSB_BF.Fetchtiles = [undefined,];

        L.TileLayer.myXtraLayer = L.TileLayer.extend({
            options: {
                "attribution": "<span id='leaflet_Status' style='min-width: 50px'></span>",
                "maxZoom": Commons_JSB_BF.Maxzoom,
                "minZoom": 7,
                "maxNativeZoom": 19  // Limit internet fetch to level 19
            },

            initialize: function () {
                if (!this.leafletCreateTile) this.leafletCreateTile = this.createTile;
                this.createTile = this.createTileNew;
            },

            getTileUrl: function (coords) {
                var url = "#" + coords.z + '/' + coords.y + '/' + coords.x;
                return url
            },

            createTileNew: function (coords, callBackWhenDone) {
                var tile = this.leafletCreateTile(coords, callBackWhenDone);
                tile.crossOrigin = "Anonymous";
                Commons_JSB_BF.Fetchtiles.push({ tile: tile, coords: coords, callback: callBackWhenDone }) // Callback("errors", tile)
                return tile;
            }
        });

        var Scale = L.control.scale().addTo(map);

        window.xtraLayer = new L.TileLayer.myXtraLayer();
        xtraLayer.addTo(map);

        // ================================ Add GPS button go to current GPS ================================ 
        window.easyGPSBtn = L.easyButton('\<span id="gotoGpsBtn" style="font-size: xx-small; vertical-align: middle;"\>GPS\</span\>', function (Btn, Map) { new jsbCall("jsb_bf", "leaflet_GotoGPS_FNC", function () { }); }).addTo(map);

        $('#gotoGpsBtn').parent().parent().css({ "background": 'white', "color": 'black', "margin": 'auto', "padding": 0 });

        window.limitToLevel = 0;
        window.minTileNumber = 0;
        window.tileNumber = 0;

        window.leaflet_clearTileCache = function () {
            Commons_JSB_BF.Tilelist = [undefined]
            window.minTileNumber = window.tileNumber; // Only load tiles past this #
            xtraLayer.remove()
            xtraLayer.addTo(map);
            map.invalidateSize()
        };

        // Function for zoom start
        window.leaflet_onZoomStart = function () {
            window.limitToLevel = 0; // Allow all tiles to load until ZoomEnd
            window.leaflet_clearTileCache();
            window.zoomStartZ = map.getZoom();
        };
        map.on('zoomstart', window.leaflet_onZoomStart);

        // Function for ZoomEnd
        window.leaflet_onZoomEnd = function () {
            window.limitToLevel = map.getZoom(); // Zoom is done, only load tiles are current level
        };
        map.on('zoomend', window.leaflet_onZoomEnd);

        map.on('mousedown touchstart', function (Event) {
            var msg = CStr(map.getZoom()) + ":(" + Left(Event.latlng.lat, 10) + ", " + Left(Event.latlng.lng, 10) + ")"
            leaflet_Msg(msg)
        });

        if (($('.ui-dialog').length)) {
            window.leaflet_onresize = function () {
                window.minTileNumber = window.tileNumber
                window.limitToLevel = 0
                Commons_JSB_BF.Tilelist = [undefined]
                leaflet_clearTileCache(); // 
            };
            $('.ui-dialog').on('resize', window.leaflet_onresize);
        }
        // }

        window.leaflet_Msg = function (Msg) {
            if (!Msg) Msg = CStr(map.getZoom()) + ":(" + Left(map.getCenter().lat, 10) + ", " + Left(map.getCenter().lng, 10) + ")"
            $('#leaflet_Status').text(Msg)
        };

        window.leafLet_Initialized = true;
    }

    debugger;

    Callbacks = Commons_JSB_BF.Fetchtiles;


    while (true) {
        for (Fetchinfo of iterateOver(Commons_JSB_BF.Fetchtiles)) {
            Coords = Fetchinfo.coords;

            await JSB_BF_LEAFLET_GETTILEONEATATIME(Fetchinfo.tile, CNum(Coords.x), CNum(Coords.y), CNum(Coords.z));
            Img = await JSB_BF_IMAGE_LOAD(CStr(Fetchinfo.tile.src));
            Fetchinfo.callback('', Img);
        }

        Commons_JSB_BF.Fetchtiles = [undefined,];
        await asyncSleep(200);
    }

}
// </LEAFLET_Sub>

// <LEAFLET_BLANKTILE>
function leaflet_blankTile() {
    Include_JSB_BF___Leaflet(false)

    if (Not(window.image_blank)) window.image_blank = leaflet_tileRGB(0, 0, 0, 0);
    return window.image_blank;
}
// </LEAFLET_BLANKTILE>

// <LEAFLET_BUILDTILEFROMCHILDREN>
async function JSB_BF_LEAFLET_BUILDTILEFROMCHILDREN(F__Tilecache, F__Tmptilecache, X, Y, Z) {
    // local variables
    var Tile, Alreadyincache, X0, Y0, Nochanges, Gotc00, C00, Gotc01;
    var C01, Gotc10, C10, Gotc11, C11;

    await Include_JSB_BF___Leaflet(false)
    if (await JSB_BF_LEAFLET_CACHEREADTILE(F__Tilecache, F__Tmptilecache, +Z, +Y, +Z, false, Tile, function (_Tile) { Tile = _Tile })) {
        Alreadyincache = true;
    } else {
        if (Not(Commons_JSB_BF.Fakeoffline) && JSB_BF_ONLINE()) Tile = await JSB_BF_LEAFLET_READONLINETILE(CStr(X), CStr(Y), CStr(Z)); else Tile = undefined;
        Alreadyincache = false;
    }

    if (Not(Tile)) Tile = leaflet_blankTile();
    if (Null0(Z) >= 19) return Tile;

    // Get my 4 children at Z+1
    X0 = +X * 2;
    Y0 = +Y * 2;

    Nochanges = true;
    Gotc00 = await JSB_BF_LEAFLET_CACHEREADTILE(F__Tilecache, F__Tmptilecache, +X0, +Y0, +Z + 1, true, C00, function (_C00) { C00 = _C00 });
    if (Not(Gotc00)) {
        C00 = await JSB_BF_LEAFLET_EXTRACTQUADRANTTILE(Tile, 0, 0, function (_Tile) { Tile = _Tile });
        Tile = await JSB_BF_IMAGE_REPLACEQUADRANT(Tile, C00, 0, 0, function (_Tile, _P3, _P4) { Tile = _Tile });
        Nochanges = false;
    }

    Gotc01 = await JSB_BF_LEAFLET_CACHEREADTILE(F__Tilecache, F__Tmptilecache, +X0, +Y0 + 1, +Z + 1, true, C01, function (_C01) { C01 = _C01 });
    if (Not(Gotc01)) {
        C01 = await JSB_BF_LEAFLET_EXTRACTQUADRANTTILE(Tile, 0, 1, function (_Tile) { Tile = _Tile });
        Tile = await JSB_BF_IMAGE_REPLACEQUADRANT(Tile, C01, 0, 1, function (_Tile, _P3, _P4) { Tile = _Tile });
        Nochanges = false;
    }

    Gotc10 = await JSB_BF_LEAFLET_CACHEREADTILE(F__Tilecache, F__Tmptilecache, +X0 + 1, +Y0, +Z + 1, true, C10, function (_C10) { C10 = _C10 });
    if (Not(Gotc10)) {
        C10 = await JSB_BF_LEAFLET_EXTRACTQUADRANTTILE(Tile, 1, 0, function (_Tile) { Tile = _Tile });
        Tile = await JSB_BF_IMAGE_REPLACEQUADRANT(Tile, C10, 1, 0, function (_Tile, _P3, _P4) { Tile = _Tile });
        Nochanges = false;
    }

    Gotc11 = await JSB_BF_LEAFLET_CACHEREADTILE(F__Tilecache, F__Tmptilecache, +X0 + 1, +Y0 + 1, +Z + 1, true, C11, function (_C11) { C11 = _C11 });
    if (Not(Gotc11)) {
        C11 = await JSB_BF_LEAFLET_EXTRACTQUADRANTTILE(Tile, 1, 1, function (_Tile) { Tile = _Tile });
        Tile = await JSB_BF_IMAGE_REPLACEQUADRANT(Tile, C11, 1, 1, function (_Tile, _P3, _P4) { Tile = _Tile });
        Nochanges = false;
    }

    if (CBool(Nochanges) && CBool(Alreadyincache)) return Tile;

    await JSB_BF_LEAFLET_CACHEWRITETILE(F__Tilecache, +X, +Y, +Z, CStr(Tile));

    return Tile;
}
// </LEAFLET_BUILDTILEFROMCHILDREN>

// <LEAFLET_CACHEID>
function leaflet_CacheID(X, Y, Z) {
    return 'ifwis_z' + CStr(Z) + '_y' + CStr(Y) + '_x' + CStr(X) + '.png';
}
// </LEAFLET_CACHEID>

// <LEAFLET_CACHEREADTILE>
async function JSB_BF_LEAFLET_CACHEREADTILE(F_Tilecache, F_Tmptilecache, X, Y, Z, Oktogetpartialtile, ByRef_Tile, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tile)
        return v
    }
    var Cid = '';

    ByRef_Tile = undefined;
    Cid = leaflet_CacheID(CStr(X), CStr(Y), CStr(Z));

    if (await JSB_ODB_READ(ByRef_Tile, F_Tilecache, Cid, function (_ByRef_Tile) { ByRef_Tile = _ByRef_Tile })); else {
        if (Not(F_Tmptilecache)) return exit(false);

        if (await JSB_ODB_READ(ByRef_Tile, F_Tmptilecache, Cid, function (_ByRef_Tile) { ByRef_Tile = _ByRef_Tile })); else {
            if (!Oktogetpartialtile) return exit(false);
            if (await JSB_ODB_READ(ByRef_Tile, F_Tmptilecache, 'x' + Cid, function (_ByRef_Tile) { ByRef_Tile = _ByRef_Tile })); else return exit(false);
        }
    }

    ByRef_Tile = await JSB_BF_LEAFLET_TILE2BASE64(ByRef_Tile);
    return exit(true);
}
// </LEAFLET_CACHEREADTILE>

// <LEAFLET_CACHEWRITETILE>
async function JSB_BF_LEAFLET_CACHEWRITETILE(F_Tilecache, X, Y, Z, Tile) {
    var Cid = '';

    Cid = leaflet_CacheID(CStr(X), CStr(Y), CStr(Z));
    if (await JSB_ODB_WRITE(await JSB_BF_LEAFLET_TILE2BINARY(CStr(Tile)), F_Tilecache, Cid)); else Alert(CStr(activeProcess.At_Errors));

    return true;
}
// </LEAFLET_CACHEWRITETILE>

// <LEAFLET_READOFFLINETILE>
async function JSB_BF_LEAFLET_READOFFLINETILE(ByRef_F_Tilecache, ByRef_F_Tmptilecache, ByRef_X, ByRef_Y, ByRef_Z, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_F_Tilecache, ByRef_F_Tmptilecache, ByRef_X, ByRef_Y, ByRef_Z)
        return v
    }
    var X0 = undefined;
    var Y0 = undefined;
    var Xo = undefined;
    var Yo = undefined;
    var Tile = '';
    var Tmpid = '';
    var Ptile = '';

    if (await JSB_BF_LEAFLET_CACHEREADTILE(ByRef_F_Tilecache, ByRef_F_Tmptilecache, ByRef_X, ByRef_Y, ByRef_Z, true, Tile, function (_Tile) { Tile = _Tile })) return exit(await JSB_BF_LEAFLET_TILE2BASE64(CStr(Tile)));

    Tmpid = leaflet_CacheID(CStr(ByRef_X), CStr(ByRef_Y), CStr(ByRef_Z));
    if (await JSB_ODB_READ(Tile, ByRef_F_Tmptilecache, 'x' + Tmpid, function (_Tile) { Tile = _Tile })) return exit(await JSB_BF_LEAFLET_TILE2BASE64(CStr(Tile)));

    if (ByRef_Z == 7) {
        if (false && Not(window.warning1)) {
            await JSB_BF_MSGBOX('I don\'t appear to have any base tiles.  A Blank will be used');
            window.warning1 = true;
            if (await JSB_BF_LEAFLET_CACHEREADTILE(ByRef_F_Tilecache, ByRef_F_Tmptilecache, ByRef_X, ByRef_Y, ByRef_Z, true, Tile, function (_Tile) { Tile = _Tile })) return exit(Tile);
            if (await JSB_BF_LEAFLET_CACHEREADTILE(ByRef_F_Tilecache, ByRef_F_Tmptilecache, ByRef_X, ByRef_Y, ByRef_Z, true, Tile, function (_Tile) { Tile = _Tile })) return exit(Tile);
        }

        return exit(leaflet_blankTile());
    }

    // Compute my parent
    X0 = CInt(ByRef_X / 2);
    Y0 = CInt(ByRef_Y / 2);
    Xo = ByRef_X % 2;
    Yo = ByRef_Y % 2;

    Ptile = await JSB_BF_LEAFLET_READOFFLINETILE(ByRef_F_Tilecache, ByRef_F_Tmptilecache, X0, Y0, ByRef_Z - 1, function (_ByRef_F_Tilecache, _ByRef_F_Tmptilecache, _X0, _Y0, _P5) { ByRef_F_Tilecache = _ByRef_F_Tilecache; ByRef_F_Tmptilecache = _ByRef_F_Tmptilecache; X0 = _X0; Y0 = _Y0 });

    // Extract myself from my parent
    Tile = await JSB_BF_LEAFLET_EXTRACTQUADRANTTILE(Ptile, Xo, Yo, function (_Ptile) { Ptile = _Ptile });
    Ptile = undefined;

    Tile = await JSB_BF_IMAGE_RESIZE(Tile, 256, 256, function (_Tile, _P2, _P3) { Tile = _Tile });

    if (await JSB_ODB_WRITE(await JSB_BF_LEAFLET_TILE2BINARY(Tile), ByRef_F_Tmptilecache, 'x' + leaflet_CacheID(CStr(ByRef_X), CStr(ByRef_Y), CStr(ByRef_Z)))); else null;
    return exit(await JSB_BF_LEAFLET_TILE2BASE64(Tile));
}
// </LEAFLET_READOFFLINETILE>

// <LEAFLET_EXTRACTQUADRANTTILE>
async function JSB_BF_LEAFLET_EXTRACTQUADRANTTILE(ByRef_Parentsrc, Xo, Yo, setByRefValues) {
    // local variables
    var Parentimg, Width, _Height, Canvas, Ctx;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Parentsrc)
        return v
    }
    await Include_JSB_BF___Leaflet(false)
    Parentimg = await JSB_BF_IMAGE_LOAD(CStr(ByRef_Parentsrc));

    Width = CInt(CNum(Parentimg.width) / 2);
    _Height = CInt(CNum(Parentimg.height) / 2);

    if (CBool(Xo)) Xo = Width;
    if (CBool(Yo)) Yo = _Height;

    Canvas = Image_Canvas(Width, _Height);
    Ctx = Image_CTX(Canvas);

    // Get portion of parent
    Ctx.drawImage(Parentimg, Xo, Yo, Width, _Height, 0, 0, Width, _Height);

    Parentimg = undefined;

    return exit(Canvas.toDataURL('image/jpeg', 0.3)); // .3 Image Quality
}
// </LEAFLET_EXTRACTQUADRANTTILE>

// <LEAFLET_FETCHESRI_TILEIMG>
async function JSB_BF_LEAFLET_FETCHESRI_TILEIMG(Type, ByRef_X, ByRef_Y, ByRef_Z, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_X, ByRef_Y, ByRef_Z)
        return v
    }
    var Imagedata = '';

    while (true) {
        var Tileurl = '//services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/' + CStr(ByRef_Z) + '/' + CStr(ByRef_Y) + '/' + CStr(ByRef_X);
        Imagedata = await JSB_BF_GET(Tileurl);
        if (Not(Not(Imagedata))) break;
        return exit(undefined);
    }

    return exit(await JSB_BF_LEAFLET_TILE2BASE64(Imagedata));
}
// </LEAFLET_FETCHESRI_TILEIMG>

// <LEAFLET_FETCHESRI_TILELABELS>
async function JSB_BF_LEAFLET_FETCHESRI_TILELABELS(Type, ByRef_X, ByRef_Y, ByRef_Z, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_X, ByRef_Y, ByRef_Z)
        return v
    }
    var Imagedata = '';


    while (true) {
        var Tileurl = '//services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/' + CStr(ByRef_Z) + '/' + CStr(ByRef_Y) + '/' + CStr(ByRef_X);
        Imagedata = await JSB_BF_GET(Tileurl);
        if (Not(Not(Imagedata))) break;
        return exit(undefined);
    }

    return exit(await JSB_BF_LEAFLET_TILE2BASE64(Imagedata));
}
// </LEAFLET_FETCHESRI_TILELABELS>

// <LEAFLET_FETCHESRI_TILETRANSPORTATION>
async function JSB_BF_LEAFLET_FETCHESRI_TILETRANSPORTATION(Type, ByRef_X, ByRef_Y, ByRef_Z, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_X, ByRef_Y, ByRef_Z)
        return v
    }
    var Imagedata = '';


    while (true) {
        var Tileurl = '//services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/' + CStr(ByRef_Z) + '/' + CStr(ByRef_Y) + '/' + CStr(ByRef_X);
        Imagedata = await JSB_BF_GET(Tileurl);
        if (Not(Not(Imagedata))) break;
        return exit(undefined);
    }

    return exit(await JSB_BF_LEAFLET_TILE2BASE64(Imagedata));
}
// </LEAFLET_FETCHESRI_TILETRANSPORTATION>

// <LEAFLET_FETCHGOOGLE_TILEIMG>
async function JSB_BF_LEAFLET_FETCHGOOGLE_TILEIMG(Type, ByRef_X, ByRef_Y, ByRef_Z, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_X, ByRef_Y, ByRef_Z)
        return v
    }
    var Imagedata = '';


    while (true) {
        var Tileurl = ('//khms1.googleapis.com/kh?v=773&hl=en-US&x=' + CStr(ByRef_X) + '&y=' + CStr(ByRef_Y) + '&z=' + CStr(ByRef_Z));
        Imagedata = await JSB_BF_GET(Tileurl);
        if (Not(Not(Imagedata))) break;
        return exit(undefined);
    }

    return exit(await JSB_BF_LEAFLET_TILE2BASE64(Imagedata));
}
// </LEAFLET_FETCHGOOGLE_TILEIMG>

// <LEAFLET_FILECOUNT>
async function JSB_BF_LEAFLET_FILECOUNT(F) {
    var S = undefined;
    var Sl = '';

    if (Not(F)) F = await JSB_BF_FHANDLE('tmpTileCache');

    if (await JSB_ODB_SELECTTO('', F, '', S, function (_S) { S = _S })); else return 0;
    Sl = getList(S);
    return DCount(Sl, am);
}
// </LEAFLET_FILECOUNT>

// <LEAFLET_GETDISTANCE>
function leaflet_getDistance(Lat1y, Lng1x, Lat2y, Lng2x) {
    // return distance in meters
    Lng1x = 0.0174532925199444 * Lng1x;
    Lat1y = 0.0174532925199444 * Lat1y;
    Lng2x = 0.0174532925199444 * Lng2x;
    Lat2y = 0.0174532925199444 * Lat2y;

    var Deltalat = Lat2y - Lat1y;
    var Deltalon = Lng2x - Lng1x;

    var A = Pwr(Sin(Deltalat / 2), 2) + Cos(Lat1y) * Cos(Lat2y) * Pwr(Sin(Deltalon / 2), 2);
    var C = 2 * ASin(Sqrt(A));

    var Earth_Radius = 6371;
    return C * Earth_Radius * 1000;
}
// </LEAFLET_GETDISTANCE>

// <LEAFLET_GETTILE>
async function JSB_BF_LEAFLET_GETTILE(Leaflettile, X, Y, Z) {
    await Include_JSB_BF___Leaflet(false)

    var Pngbase64 = '';
    var Cacheid = leaflet_CacheID(CStr(X), CStr(Y), CStr(Z));

    if (window.cnt) window.cnt++; else window.cnt = 1;

    if (Not(Commons_JSB_BF.Fakeoffline) && JSB_BF_ONLINE()) {
        // In either cache (f_tileCache or f_tmpTileCache)?
        if (await JSB_BF_LEAFLET_CACHEREADTILE(Commons_JSB_BF.F_Tilecache, Commons_JSB_BF.F_Tmptilecache, X, Y, Z, false, Pngbase64, function (_Pngbase64) { Pngbase64 = _Pngbase64 })) {
            // pngBase64 = Image_Merge(redTile, pngBase64, .8) // Show it was from cache;
        } else {
            Pngbase64 = await JSB_BF_LEAFLET_READONLINETILE(CStr(X), CStr(Y), CStr(Z));
            if (Pngbase64) {
                if (CBool(Commons_JSB_BF.F_Tmptilecache)) {
                    if (await JSB_ODB_WRITE(await JSB_BF_LEAFLET_TILE2BINARY(Pngbase64), Commons_JSB_BF.F_Tmptilecache, Cacheid)); else {
                        if (window.confirm('I was unable to record anymore tiles, OK to clear the temporary tile cache?')) {
                            if (await JSB_ODB_CLEARFILE(Commons_JSB_BF.F_Tmptilecache)) {
                                if (await JSB_ODB_WRITE(Pngbase64, Commons_JSB_BF.F_Tmptilecache, Cacheid)); else Alert(CStr(activeProcess.At_Errors));
                            } else {
                                await JSB_BF_LEAFLET_MSG(activeProcess.At_Errors, function (_At_Errors) { activeProcess.At_Errors = _At_Errors });
                            }
                        }
                    }
                }
            } else {
                Pngbase64 = await JSB_BF_LEAFLET_READOFFLINETILE(Commons_JSB_BF.F_Tilecache, Commons_JSB_BF.F_Tmptilecache, X, Y, Z, function (_F_Tilecache, _F_Tmptilecache, _X, _Y, _Z) { Commons_JSB_BF.F_Tilecache = _F_Tilecache; Commons_JSB_BF.F_Tmptilecache = _F_Tmptilecache; X = _X; Y = _Y; Z = _Z });
            }
        }
    } else {
        Pngbase64 = await JSB_BF_LEAFLET_READOFFLINETILE(Commons_JSB_BF.F_Tilecache, Commons_JSB_BF.F_Tmptilecache, X, Y, Z, function (_F_Tilecache, _F_Tmptilecache, _X, _Y, _Z) { Commons_JSB_BF.F_Tilecache = _F_Tilecache; Commons_JSB_BF.F_Tmptilecache = _F_Tmptilecache; X = _X; Y = _Y; Z = _Z });
    }

    Leaflettile.src = Pngbase64;

    window.cnt--;
    return true;
}
// </LEAFLET_GETTILE>

// <LEAFLET_GETTILEONEATATIME>
async function JSB_BF_LEAFLET_GETTILEONEATATIME(Leaflettile, X, Y, Z) {
    // local variables
    var Tile, Msg;

    await Include_JSB_BF___Leaflet(false)
    Commons_JSB_BF.Tilelist[Commons_JSB_BF.Tilelist.length] = { "leafletTile": Leaflettile, "x": X, "y": Y, "z": Z, "tileNumber": window.tileNumber };
    window.tileNumber++;

    if (Commons_JSB_BF.Iambusy) return;
    Commons_JSB_BF.Iambusy++;
    await asyncSleep(10);

    $('#map').append('\<div id=\'LoadingNotice\' style=\'position: absolute; z-index: 9999; left: 50%; top: 40%; transform:translate(-50%, -50%); font-size: xx-large; color: floralwhite\'\>\</div\>');


    while (Len(Commons_JSB_BF.Tilelist)) {
        Tile = Commons_JSB_BF.Tilelist[1];
        Commons_JSB_BF.Tilelist.Delete(1);

        if (Null0(Tile.tileNumber) >= Null0(window.minTileNumber)) {
            if (Not(window.limitToLevel) || Null0(window.limitToLevel) == Null0(Tile.z) || Null0(window.limitToLevel) >= Null0(window.xtraLayer.options.maxNativeZoom)) {

                if (JSB_BF_ONLINE()) Msg = 'Online'; else Msg = 'Offline';
                $('#LoadingNotice').text(CStr(Msg) + '; Level ' + CStr(Tile.z) + '; ' + CStr(Len(Commons_JSB_BF.Tilelist) + 1) + ' to load');
                await JSB_BF_LEAFLET_GETTILE(Tile.leafletTile, CNum(Tile.x), CNum(Tile.y), CNum(Tile.z));
            }
        }
    }

    $('#LoadingNotice').remove();
    Commons_JSB_BF.Iambusy = 0;

    return true;
}
// </LEAFLET_GETTILEONEATATIME>

// <LEAFLET_GLYPHICON>
function leaflet_glyphIcon(Glyphname, Markercolor, Iconcolor) {
    Include_JSB_BF___Leaflet(false)
    return L.AwesomeMarkers.icon({ "icon": Glyphname, "prefix": 'glyphicon', "markerColor": Markercolor, "iconColor": Iconcolor });
}
// </LEAFLET_GLYPHICON>

// <LEAFLET_GOTOGPS>
async function JSB_BF_LEAFLET_GOTOGPS() {
    // local variables
    var Gps, Pt;

    await Include_JSB_BF___Leaflet(false)
    Gps = await JSB_BF_MYGPS();
    if (Not(Gps)) return await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
    Pt = L.latLng(Gps.lat, Gps.lng);

    map.setView(Pt, 19);
}
// </LEAFLET_GOTOGPS>

// <LEAFLET_LATLNG2TILE>
function leaflet_LatLng2Tile(Laty, Lngx, Zoom) {
    var X = Floor((Lngx + 180) / 360 * Pwr(2, Zoom));
    var Y = Floor((1 - Ln(Tan(Laty * PI() / 180) + 1 / Cos(Laty * PI() / 180)) / PI()) / 2 * Pwr(2, Zoom));
    return { "x": X, "y": Y, "z": Zoom };
}
// </LEAFLET_LATLNG2TILE>

// <LEAFLET_MAKETILES>
async function JSB_BF_LEAFLET_MAKETILES() {
    // local variables
    var Kilo, Mega, Gigabyte, Sl, Allids, Allidcnt, Level19ids;
    var Level6, Id, Idi, S, Z, Y, X, Tilealreadythere, Tile, Idcnt;
    var Lp, Level, Np, Cacheid;

    await Include_JSB_BF___Leaflet(false)

    Kilo = 1024;
    Mega = +Kilo * +Kilo;
    Gigabyte = +Mega * +Kilo;

    if (!(await JSB_BF_LEAFLET_OPENTILECACHES(false))) return false;

    Println(At(-1), 'Selecting your tmpTileCache'); FlushHTML();

    if (await JSB_ODB_SELECTTO('', Commons_JSB_BF.F_Tmptilecache, '', Sl, function (_Sl) { Sl = _Sl })); else return Alert(CStr(activeProcess.At_Errors));

    Allids = getList(Sl);
    Sl = '';
    Allidcnt = UBound(Allids);

    if (Not(Allidcnt)) {
        await JSB_BF_MSGBOX('There are no tiles in your tmpTileCache. Go make some! (Run a leaflet enabled map at the highest magnification, or run getAllTiles)');
        return true;
    }

    Println(At(-1), 'Making ', +Allidcnt * 2, ' higher level tiles for your TileCache');

    Print(JSB_HTML_PROGRESSBAR('progressBarID', { "style": 'position: absolute; width: 60%; top: 50%; left: 20%;' }));

    FlushHTML();

    JSB_HTML_UPDATEPROGRESSBAR('progressBarID', CStr(0), 1, UBound(Allids));// updateProgressBar(Byval Id, Byval ValueNow, Byval ValueMin, Byval ValueMax, Optional Byval Animate)

    Level19ids = [undefined,];
    Level6 = [undefined,];

    Idi = LBound(Allids) - 1;
    for (Id of iterateOver(Allids)) {
        Idi++;
        // id is ifwis_z19_y191454_x92927.png
        S = Split(Id, '_');
        Z = CNum(Mid1(S[2], 2));
        Y = CNum(Mid1(S[3], 2));
        X = CNum(Mid1(S[4], 2));

        // Put into f_TileCache if not already there
        if (Null0(Z) == 7 || Null0(Z) == 19) {
            if (await JSB_ODB_READ(Tilealreadythere, Commons_JSB_BF.F_Tilecache, CStr(Id), function (_Tilealreadythere) { Tilealreadythere = _Tilealreadythere })); else {
                if (await JSB_ODB_READ(Tile, Commons_JSB_BF.F_Tmptilecache, CStr(Id), function (_Tile) { Tile = _Tile })); else return Alert(CStr(activeProcess.At_Errors));

                await JSB_BF_LEAFLET_CACHEWRITETILE(Commons_JSB_BF.F_Tilecache, +X, +Y, +Z, CStr(Tile));

                if (Null0(Z) == 19) {
                    Level19ids[Level19ids.length] = Id;
                } else if (Null0(Z) == 7) {
                    Level6[Level6.length] = Id;
                }
            }
        }
        JSB_HTML_UPDATEPROGRESSBAR('progressBarID', 'Copying detail tiles ' + CStr(Idi) + ' of ' + CStr(UBound(Allids)), 1, UBound(Allids));
    }

    // Compute and write tiles from level 19 upto level 7
    Idcnt = UBound(Level19ids);
    Lp = 0;
    for (Level = 18; Level >= 7; Level--) {
        Idi = LBound(Level19ids) - 1;
        for (Id of iterateOver(Level19ids)) {
            Idi++;

            // id is ifwis_z19_y191454_x92927.png
            S = Split(Id, '_');
            Z = CNum(Mid1(S[2], 2));
            Y = CNum(Mid1(S[3], 2));
            X = CNum(Mid1(S[4], 2));

            for (Z = +Z - 1; Z >= 7; Z--) {
                // Compute my parent (Z-1)
                X = CInt(+X / 2);
                Y = CInt(+Y / 2);
                if (Null0(Z) == Null0(Level)) {
                    Np = CStr(Level) + '.' + Left(Field(1 - (+Idi / +Idcnt), '.', 2), 2);
                    if (Null0(Np) != Null0(Lp)) {
                        JSB_HTML_UPDATEPROGRESSBAR('progressBarID', 'Building Level ' + CStr(Np) + ' from children', 7, 19);
                        Lp = Np;
                    }

                    if (Null0(Z) == 7) {
                        Cacheid = leaflet_CacheID(CStr(X), CStr(Y), CStr(Z));
                        if (Locate(Cacheid, Level6, 0, 0, 0, "", position => { })); else Level6[Level6.length] = Cacheid;
                    } else {
                        if (!(await JSB_BF_LEAFLET_CACHEREADTILE(Commons_JSB_BF.F_Tilecache, undefined, +X, +Y, +Z, true, Tile, function (_Tile) { Tile = _Tile }))) {
                            await JSB_BF_LEAFLET_BUILDTILEFROMCHILDREN(Commons_JSB_BF.F_Tilecache, undefined, X, Y, Z);// Puts Everything In Cache;
                        }
                    }

                    break;
                }
            }
        }
    }

    // Rebuild all level 7
    Idcnt = UBound(Level6);
    Idi = LBound(Level6) - 1;
    for (Id of iterateOver(Level6)) {
        Idi++;
        JSB_HTML_UPDATEPROGRESSBAR('progressBarID', 'Building level Six ' + CStr(Idi), 1, +Idcnt);

        S = Split(Id, '_');
        Z = CNum(Mid1(S[2], 2));
        Y = CNum(Mid1(S[3], 2));
        X = CNum(Mid1(S[4], 2));

        await JSB_BF_LEAFLET_BUILDTILEFROMCHILDREN(Commons_JSB_BF.F_Tilecache, undefined, X, Y, Z);// Puts Everything In Cache
    }

    if (await JSB_ODB_CLEARFILE(Commons_JSB_BF.F_Tmptilecache)); else return Alert(CStr(activeProcess.At_Errors));
    $('#progressBarID').remove();

    return true;
}
// </LEAFLET_MAKETILES>

// <LEAFLET_MAPPIXELTOLATLONG>
function leaflet_mapPixelToLatLong(X, Y) {
    Include_JSB_BF___Leaflet(false)
    return map.containerPointToLatLng({ "pt": [X, Y] }.pt);
}
// </LEAFLET_MAPPIXELTOLATLONG>

// <LEAFLET_METERSPERPIXEL>
function leaflet_metersPerPixel() {
    // local variables
    var Mapheight, Mapwidth, Mapwidthmeters;

    var firstPoint = undefined;
    Mapheight = map.getSize().y; // this Is The Screen Height Of The Map
    Mapwidth = map.getSize().x; // this Is The Screen Width Of The Map

    // calculate the distance the one side of the map to the other using the haversine formula
    firstPoint = leaflet_mapPixelToLatLong(0, Mapheight);
    Mapwidthmeters = firstPoint.distanceTo(leaflet_mapPixelToLatLong(Mapwidth, Mapheight));

    // calculate how many meters each pixel represents
    return +Mapwidthmeters / +Mapwidth;
}
// </LEAFLET_METERSPERPIXEL>

// <LEAFLET_MSG>
async function JSB_BF_LEAFLET_MSG(ByRef_Msg, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Msg)
        return v
    }
    await Include_JSB_BF___Leaflet(false)
    window.leaflet_Msg(ByRef_Msg);
    return exit();
}
// </LEAFLET_MSG>

// <LEAFLET_OPENTILECACHES>
async function JSB_BF_LEAFLET_OPENTILECACHES(Usesdcard) {
    // local variables
    var Kilo, Mega, Gigabyte, F_Tilecacheold, Sdsize, Idlist, Id;
    var Tile;

    await Include_JSB_BF___Leaflet(false)

    Kilo = 1024;
    Mega = +Kilo * +Kilo;
    Gigabyte = +Mega * +Kilo;

    Commons_JSB_BF.F_Tmptilecache = await JSB_BF_FHANDLE('', 'tmpTileCache', true);
    Commons_JSB_BF.F_Tilecache = await JSB_BF_FHANDLE('', 'tileCache', true);

    // switch tilecache to new format
    if (CBool(Usesdcard) && Left(Commons_JSB_BF.F_Tilecache, 1) != '@') {
        F_Tilecacheold = Commons_JSB_BF.F_Tilecache;

        Sdsize = await JSB_BF_MSGBOX('What size binary (sdcard) file do you want for your tile cache?', '10MB, 100MB, 1GB, 10GB, 32GB, 64GB, 128GB');
        if (Right(Sdsize, 2) == 'GB') {
            Sdsize = ('|' + CStr(CNum(Sdsize) * +Gigabyte));
        } else if (Right(Sdsize, 2) == 'GB') {
            Sdsize = ('|' + CStr(CNum(Sdsize) * +Gigabyte));
        } else {
            Sdsize = '';
        }

        if (await JSB_ODB_WRITE('q' + am + am + 'bin:tilecache' + CStr(Sdsize), await JSB_BF_FHANDLE('md'), 'tilecache')); else return Alert(CStr(activeProcess.At_Errors));
        if (await JSB_ODB_OPEN('', 'TileCache', Commons_JSB_BF.F_Tilecache, function (_F_Tilecache) { Commons_JSB_BF.F_Tilecache = _F_Tilecache })); else return Alert(CStr(activeProcess.At_Errors));
        if (Left(Commons_JSB_BF.F_Tilecache, 1) != '@') return Alert('I was unable to change the protocol!');

        // copy old tiles to new format
        if (await JSB_ODB_SELECTTO('', F_Tilecacheold, '', Idlist, function (_Idlist) { Idlist = _Idlist })) {
            Idlist = getList(Idlist);
            for (Id of iterateOver(Idlist)) {
                if (await JSB_ODB_READ(Tile, F_Tilecacheold, CStr(Id), function (_Tile) { Tile = _Tile })) {
                    if (await JSB_ODB_DELETEITEM(F_Tilecacheold, CStr(Id))); else null;
                    if (await JSB_ODB_WRITE(await JSB_BF_LEAFLET_TILE2BINARY(CStr(Tile)), Commons_JSB_BF.F_Tilecache, CStr(Id))); else null;
                }
            }
        }
    }

    return true;
}
// </LEAFLET_OPENTILECACHES>

// <LEAFLET_READONLINETILE>
async function JSB_BF_LEAFLET_READONLINETILE(X, Y, Z) {
    var Tile = undefined;
    var Tile2 = '';
    var Tile3 = '';

    // Get base image

    if (false) {
        Tile = await JSB_BF_LEAFLET_FETCHGOOGLE_TILEIMG('sat', X, Y, Z, function (_X, _Y, _Z) { X = _X; Y = _Y; Z = _Z }); // OK to get from cache;
    } else {
        Tile = await JSB_BF_LEAFLET_FETCHESRI_TILEIMG('sat', X, Y, Z, function (_X, _Y, _Z) { X = _X; Y = _Y; Z = _Z }); // OK to get from cache;
    }

    if (!Tile) return undefined;

    Tile2 = await JSB_BF_LEAFLET_FETCHESRI_TILETRANSPORTATION('trans', X, Y, Z, function (_X, _Y, _Z) { X = _X; Y = _Y; Z = _Z });
    Tile3 = await JSB_BF_LEAFLET_FETCHESRI_TILELABELS('labels', X, Y, Z, function (_X, _Y, _Z) { X = _X; Y = _Y; Z = _Z });

    if (Tile2) { Tile = await JSB_BF_IMAGE_MERGE(Tile, Tile2, 1, function (_Tile, _Tile2, _P3) { Tile = _Tile; Tile2 = _Tile2 }); }
    if (Tile3) { Tile = await JSB_BF_IMAGE_MERGE(Tile, Tile3, 1, function (_Tile, _Tile3, _P3) { Tile = _Tile; Tile3 = _Tile3 }); }

    Tile2 = undefined;
    Tile3 = undefined;

    return Tile;
}
// </LEAFLET_READONLINETILE>

// <LEAFLET_STARTRECORDING>
async function JSB_BF_LEAFLET_STARTRECORDING() {
    await Include_JSB_BF___Leaflet(false)

}
// </LEAFLET_STARTRECORDING>

// <LEAFLET_STOPRECORDING>
async function JSB_BF_LEAFLET_STOPRECORDING() {
    // local variables
    var Added;

    await Include_JSB_BF___Leaflet(false)
    var stopPopup = undefined;

    Commons_JSB_BF.Activerecording = false;
    $('#myRECBtn').html('REC');

    Added = await JSB_BF_LEAFLET_FILECOUNT(Commons_JSB_BF.F_Tmptilecache) - Commons_JSB_BF.Startcount;
    stopPopup = L.popup({ "autoClose": false }).setContent('Stop of Recording ' + CStr(Added) + ' new tiles');
    stopPopup.setLatLng(map.getCenter()).openOn(map);

    // Force a redraw of current screen
    window.idfg.redraw();

    await JSB_BF_LEAFLET_MAKETILES();
}
// </LEAFLET_STOPRECORDING>

// <LEAFLET_TILE2BASE64>
async function JSB_BF_LEAFLET_TILE2BASE64(Tile) {
    var I = InStr1(1, Tile, 'base64,');
    if (I) return Tile;
    return 'data:image/jpeg;base64,' + aesEncrypt(Tile, 64);
}
// </LEAFLET_TILE2BASE64>

// <LEAFLET_TILE2BINARY>
async function JSB_BF_LEAFLET_TILE2BINARY(Tile) {
    var I = InStr1(1, Tile, 'base64,');
    if (!I) return Tile;
    return aesDecrypt(Mid1(Tile, I + 7), 64);
}
// </LEAFLET_TILE2BINARY>

// <LEAFLET_TILE2LATLNG>
function leaflet_tile2LatLng(Tile_X, Tile_Y, Zoom) {
    var N = PI() - ((2 * PI() * Tile_Y) / Pwr(2, Zoom));
    var Lngx = (Tile_X / Pwr(2, Zoom) * 360) - 180;
    var Laty = 180 / PI() * ATan(Sinh(N));

    var A = { "a": [Laty, Lngx] };
    return A.a;
}
// </LEAFLET_TILE2LATLNG>

// <LEAFLET_TILERGB>
function leaflet_tileRGB(R, G, B, I) {
    // local variables
    var Canvas, Ctx, J;

    var imgData = undefined;
    Include_JSB_BF___Leaflet(false)
    Canvas = Image_Canvas(256, 256);
    Ctx = Image_CTX(Canvas);

    imgData = Ctx.createImageData(256, 256);

    var _ForEndI_1 = CNum(imgData.data.length) - 1;
    for (J = 0; J <= _ForEndI_1; J += 4) {
        imgData.data[+J + 0] = R;
        imgData.data[+J + 1] = G;
        imgData.data[+J + 2] = B;
        imgData.data[+J + 3] = I;
    }

    Ctx.putImageData(imgData, 0, 0);
    return Canvas.toDataURL('image/jpeg', 0.3);
}
// </LEAFLET_TILERGB>

// <LISTFILES>
async function JSB_BF_LISTFILES() {
    // local variables
    var X;

    if (await JSB_ODB_LISTFILES(X, function (_X) { X = _X })) return Split(X, am);
    return [undefined,];
}
// </LISTFILES>

// <LOADSCRIPT>
async function JSB_BF_LOADSCRIPT(Fname, Iname, Cname) {
    // local variables
    var Src;

    if (await JSB_ODB_READ(Src, await JSB_BF_FHANDLE('dict', Fname), CStr(Iname), function (_Src) { Src = _Src })) {
        if (Not(Cname)) {
            Cname = Trim(Field(Field(Src, 'function ', 2), '(', 1));
        }

        if (Not(loadCode(Src, Cname))) {
            await JSB_BF_MSGBOX('Malformed javascript code in ' + anchorEdit('DICT ' + CStr(Fname), CStr(Iname), CStr(Cname)));
            return false;
        }
    } else {
        await JSB_BF_MSGBOX('Unable to find javascript code for ' + anchorEdit(CStr(Fname), CStr(Iname)));
        return false;
    }
    return true;
}
// </LOADSCRIPT>

// <LOCALIP>
function localIP(Ip) {
    if (Mid1(Ip, 1, 3) == '10.' || Mid1(Ip, 1, 8) == '192.168.') return true;
    if (Mid1(Ip, 1, 4) == '172.') {
        if (Field(Ip, '.', 2) >= 16 && Field(Ip, '.', 2) < 31) return true;
    }
    return false;
}
// </LOCALIP>

// <LOGCRITICAL>
async function JSB_BF_LOGCRITICAL(S) {
    S = Change(S, Chr(9), ' ') + Chr(9) + DateTime() + Chr(9) + UserName() + Chr(9) + Account() + Chr(9) + Domain() + Chr(9) + CStr(isAdmin());
    if (await JSB_ODB_WRITE('[' + CStr(System(32)) + '] ' + CStr(System(33)) + Chr(9) + 'Critical' + Chr(9) + '3' + Chr(9) + S, await JSB_BF_FHANDLE('', 'ErrLog', true), DateTime())); else return Stop(activeProcess.At_Errors);
    return true;
}
// </LOGCRITICAL>

// <LOGERR>
async function JSB_BF_LOGERR(S, Showerror) {
    return await JSB_BF_LOGERROR(CStr(S), Showerror);
}
// </LOGERR>

// <LOGERROR>
async function JSB_BF_LOGERROR(S, Showerror) {
    if (Showerror) Alert(CStr(S));
    S = Change(S, Chr(9), ' ') + Chr(9) + DateTime() + Chr(9) + UserName() + Chr(9) + Account() + Chr(9) + Domain() + Chr(9) + CStr(isAdmin());
    if (await JSB_ODB_WRITE('[' + CStr(System(32)) + '] ' + CStr(System(33)) + Chr(9) + 'Error' + Chr(9) + '4' + Chr(9) + S, await JSB_BF_FHANDLE('', 'ErrLog', true), DateTime())); else return Stop(activeProcess.At_Errors);
    return true;
}
// </LOGERROR>

// <LOGINFO>
async function JSB_BF_LOGINFO(S) {
    S = Change(S, Chr(9), ' ') + Chr(9) + DateTime() + Chr(9) + UserName() + Chr(9) + Account() + Chr(9) + Domain() + Chr(9) + CStr(isAdmin());
    if (await JSB_ODB_WRITE('[' + CStr(System(32)) + '] ' + CStr(System(33)) + Chr(9) + 'Information' + Chr(9) + '0' + Chr(9) + S, await JSB_BF_FHANDLE('', 'ErrLog', true), DateTime())); else return Stop(activeProcess.At_Errors);
    return true;
}
// </LOGINFO>

// <LOGINURL>
function LoginUrl() {
    return jsbRestCall('Login&returnurl=' + urlEncode(JSB_BF_URL()));
}
// </LOGINURL>

// <LOGOUTURL>
function LogoutUrl() {
    return jsbRootExecute('Logout');
}
// </LOGOUTURL>

// <LOGWARNING>
async function JSB_BF_LOGWARNING(S) {
    S = Change(S, Chr(9), ' ') + Chr(9) + DateTime() + Chr(9) + UserName() + Chr(9) + Account() + Chr(9) + Domain() + Chr(9) + CStr(isAdmin());
    if (await JSB_ODB_WRITE('[' + CStr(System(32)) + '] ' + CStr(System(33)) + Chr(9) + 'Warning' + Chr(9) + '1' + Chr(9) + S, await JSB_BF_FHANDLE('', 'ErrLog', true), DateTime())); else return Stop(activeProcess.At_Errors);
    return true;
}
// </LOGWARNING>

// <LOOKUPCODE>
async function JSB_BF_LOOKUPCODE(_Code, Refdisplay, Refpk, Reffile, Reflist, Oktocache) {
    // Translate code into description
    var Values = undefined;
    var Vals = '';
    var Pair = '';
    var Subdelimeter = '';

    if ((Refdisplay && Refdisplay != Refpk && (Reffile || Reflist)) || Reflist) {
        // Values = @jsb_mdl.getRefValues(ProjectName, Column, Row)
        if (Reflist) {
            Values = Split(Reflist, ';');
        } else {
            Values = await JSB_BF_GETREFVALUESBYSELECT(Reffile, Refpk, Refdisplay, 'ItemID = \'' + CStr(_Code) + '\'', false, Oktocache, function (_Reffile, _Refpk, _Refdisplay, _P4, _P5) { Reffile = _Reffile; Refpk = _Refpk; Refdisplay = _Refdisplay });
            Vals = makeArray(Values); Subdelimeter = activeProcess.At_Ni;
        }

        if (Subdelimeter) {
            for (Pair of iterateOver(Vals)) {
                if (_Code == Field(Pair, Subdelimeter, 2)) {
                    return Field(Pair, Subdelimeter, 1);
                }
            }
        }
    }

    return _Code;
}
// </LOOKUPCODE>

// <MAKEARRAY>
function makeArray(O) {
    // getValuesBySelect will return an array
    var A = undefined;

    var Subdelimiter = '';

    if (typeOf(O) == 'Array') {
        Subdelimiter = Chr(253);
        if (UBound(O) == 0) return O;

        var Firstelement = O[1];
        var Lastelement = O[UBound(O)];
        var Ce = undefined;

        if (Len(Firstelement)) Ce = Firstelement; else Ce = Lastelement;
        var Tag1 = '';
        var Tag2 = '';
        if (isJSON(Ce)) {
            var Jfirstelement = Ce;
            var Tag = '';
            var Tagi = undefined;
            Tagi = LBound(Jfirstelement) - 1;
            for (Tag of iterateOver(Jfirstelement)) {
                Tagi++;
                if (Tagi == 1) {
                    Tag1 = Tag;
                } else if (Tagi == 2) {
                    Tag2 = Tag;
                } else {
                    break;
                }
            }

            var Avalues = [undefined,];
            if (Tag2) Subdelimiter = Chr(254);
            for (A of iterateOver(O)) {
                if (Tag2) Avalues[Avalues.length] = CStr(A[Tag1]) + Subdelimiter + CStr(A[Tag2]); else Avalues[Avalues.length] = A[Tag1];
            }

            activeProcess.At_Ni = Subdelimiter;
            return Avalues;
        }

        var Sce = CStr(Ce, true);
        if (InStr1(1, Sce, Chr(255))) {
            Subdelimiter = Chr(255);;
        } else if (InStr1(1, Sce, Chr(254))) {
            Subdelimiter = Chr(254);;
        } else if (InStr1(1, Sce, Chr(253))) {
            Subdelimiter = Chr(253);;
        } else if (InStr1(1, Sce, Chr(252))) {
            Subdelimiter = Chr(252);;
        } else if (InStr1(1, Sce, ';')) {
            Subdelimiter = ';';;
        } else if (InStr1(1, Sce, ',')) {
            Subdelimiter = ',';
        }

        activeProcess.At_Ni = Subdelimiter;
        return O;
    }

    var Svalues = CStr(O, true);
    var Delimiter = '';

    if (InStr1(1, Svalues, Chr(254))) {
        Delimiter = Chr(254);
        if (InStr1(1, Svalues, Chr(253))) Subdelimiter = Chr(253); else Subdelimiter = ',';
    } else if (InStr1(1, Svalues, Chr(253))) {
        Delimiter = Chr(253);
        if (InStr1(1, Svalues, Chr(252))) Subdelimiter = Chr(252); else Subdelimiter = ',';
    } else if (InStr1(1, Svalues, Chr(252))) {
        Delimiter = Chr(252);
        if (InStr1(1, Svalues, ';')) { Subdelimiter = ';'; } else Subdelimiter = ',';
    } else if (InStr1(1, Svalues, ';')) {
        Delimiter = ';';
        Subdelimiter = ',';;
    } else if (InStr1(1, Svalues, ',')) {
        Delimiter = ',';
        Subdelimiter = '';;
    } else {
        Delimiter = Chr(254);
        Subdelimiter = '';
    }

    activeProcess.At_Ni = Subdelimiter;
    return Split(O, Delimiter);

}
// </MAKEARRAY>

// <INCLUDE_JSB_BF___LEAFLET>
async function Include_JSB_BF___Leaflet(forceReset) {
    forceReset |= (typeof Commons_JSB_BF == "undefined") || (typeof Equates_JSB_BF == "undefined");
    if (!forceReset) return;

    var me = new jsbRoutine("jsb_bf", "jsb_bf.js", "Include_JSB_BF___Leaflet"); me.localValue = function (varName) { return eval(varName) };
    Commons_JSB_BF = {};
    Equates_JSB_BF = {};
    var tileList = undefined, marker = undefined, latlng = undefined, pt = undefined, canvas = undefined, ctx = undefined;
    var startPopup = undefined, stopPopup = undefined;

    Commons_JSB_BF.Redtile = '';

    return true;
}
// </INCLUDE_JSB_BF___LEAFLET>

// <MAKETILES_Pgm>
async function JSB_BF_MAKETILES_Pgm() {  // PROGRAM
    Commons_JSB_BF = {};
    Equates_JSB_BF = {};

    await Include_JSB_BF___Leaflet(true);

    await JSB_BF_LEAFLET_MAKETILES();
    return;
}
// </MAKETILES_Pgm>

// <MAPPATH>
function JSB_BF_MAPPATH(Url) {
    var L = undefined;
    var L7 = '';
    var Subdir = '';

    if (System(1) == 'js') return Url;
    if (Left(Url, 1) == '.') return jsbRootDirectory() + Mid1(Change(Url, '/', '\\'), 2);

    Url = LCase(Url);
    L7 = Left(Url, 7);

    if (L7 == 'http://' || L7 == 'https:/') {
        L = Len(jsbRoot());
        if (Left(Url, L) != LCase(jsbRoot())) { return Stop('MapPath must be in this domain ', Change(jsbRoot(), ':', Chr(28) + '&shy;' + Chr(29) + ':')); }
        Url = Mid1(Url, L - 1);
    }

    if (Left(Url, 2) == '//') {
        Subdir = Change(Mid1(Url, 3), '/', '\\');
        return jsbRootDirectory() + Subdir;;
    } else if (Left(Url, 1) == '/') {
        Subdir = Change(Mid1(Url, 2), '/', '\\');
        return jsbRootDirectory() + Subdir;
    }

    Subdir = Mid1(Url, InStr1(1, Url, '//') + 1);
    Subdir = Change(Subdir, '/', '\\');
    return jsbRootAccountDirectory() + Subdir;

}
// </MAPPATH>

// <MAXHEIGHT>
function JSB_BF_MAXHEIGHT() {
    return window.getBrowserHeight();
}
// </MAXHEIGHT>

// <MAXWIDTH>
function JSB_BF_MAXWIDTH() {
    return window.getBrowserWidth();
}
// </MAXWIDTH>

// <MERGEATTRIBUTE>
function JSB_BF_MERGEATTRIBUTE(Tag, Value, Separator, Oadditionalattributes) {
    // local variables
    var Jtag, A;

    var Tageq = CStr(Tag) + '=';
    var Tageqlen = Len(Tageq);
    var Rtnattributearray = [undefined,];
    var Addit = (Tag && Len(Value) > 0);
    if (Not(Separator)) { Separator = ';'; }
    var Q = '', Pvalue = '';

    if (InStr1(1, Value, '"')) {
        Q = '"';
        Value = jsEscapeAttr(CStr(Value), Q);
    } else {
        Q = '\'';
        Value = jsEscapeAttr(Value, Q);
    }

    if (Len(Value) == 0) Separator = '';

    if (CBool(Oadditionalattributes)) {
        if (typeOf(Oadditionalattributes) == 'JSonObject') {
            var Jadditionalattributes = Oadditionalattributes;
            for (Jtag of iterateOver(Jadditionalattributes)) {
                Pvalue = Jadditionalattributes[Jtag];
                if (InStr1(1, Pvalue, '\'') || InStr1(1, Pvalue, '"')) Pvalue = htmlEscape(Pvalue);
                if (Null0(Jtag) == Null0(Tag)) {
                    Rtnattributearray[Rtnattributearray.length] = CStr(Jtag) + '=' + Q + Value + Separator + Pvalue + Q;
                    Addit = 0;
                } else {
                    if (isNumeric(Pvalue)) {
                        Rtnattributearray[Rtnattributearray.length] = CStr(Jtag) + '=' + Pvalue;
                    } else {
                        Rtnattributearray[Rtnattributearray.length] = CStr(Jtag) + '=' + Q + Pvalue + Q;
                    }
                }
            }
        } else {
            var Aadditionalattributes = undefined;
            if (typeOf(Oadditionalattributes) == 'String') Aadditionalattributes = [undefined, Oadditionalattributes]; else Aadditionalattributes = Oadditionalattributes;

            for (A of iterateOver(Oadditionalattributes)) {
                if (Left(A, Tageqlen) == Tageq) {
                    Pvalue = RTrim(LTrim(Mid1(A, Tageqlen + 1)));
                    if (Left(Pvalue, 1) == '\'' || Left(Pvalue, 1) == '"') Pvalue = RTrim(Mid1(Pvalue, 2, Len(Pvalue) - 2));
                    if (Right(Pvalue, 1) == Separator) Pvalue = Left(Pvalue, Len(Pvalue) - 1);

                    if (InStr1(1, Pvalue, '\'') || InStr1(1, Pvalue, '"')) Pvalue = htmlEscape(Pvalue);
                    A = Tageq + Q + Value + Separator + Pvalue + Q;
                    Addit = 0;
                }

                Rtnattributearray[Rtnattributearray.length] = A;
            }
        }
    }

    if (Addit) {
        if (isNumeric(Value)) {
            Rtnattributearray.Insert(1, Tageq + Value);
        } else {
            Rtnattributearray.Insert(1, Tageq + Q + Value + Q);
        }
    }

    return Rtnattributearray;
}
// </MERGEATTRIBUTE>

// <MERGESTYLE>
function JSB_BF_MERGESTYLE(Stlyejson, Additionalattributes) {
    // local variables
    var Styletag;

    for (Styletag of iterateOver(Stlyejson)) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', CStr(Styletag) + ':' + CStr(Stlyejson[Styletag]), ';', Additionalattributes);
    }
    return Additionalattributes;
}
// </MERGESTYLE>

// <MIMETYPE>
function JSB_BF_MIMETYPE(Ext) {
    // http://stackoverflow.com/questions/1029740/get-mime-type-from-filename-extension
    switch (LCase(Ext)) {
        case '323':
            return 'text/h323';
            break;

        case '3g2':
            return 'video/3gpp2';
            break;

        case '3gp':
            return 'video/3gpp';
            break;

        case '3gp2':
            return 'video/3gpp2';
            break;

        case '3gpp':
            return 'video/3gpp';
            break;

        case '7z':
            return 'application/x-7z-compressed';
            break;

        case 'aa':
            return 'audio/audible';
            break;

        case 'aac':
            return 'audio/aac';
            break;

        case 'aaf':
            return 'application/octet-stream';
            break;

        case 'aax':
            return 'audio/vnd.audible.aax';
            break;

        case 'ac3':
            return 'audio/ac3';
            break;

        case 'aca':
            return 'application/octet-stream';
            break;

        case 'apk':
            return 'application/octet-stream';
            break;

        case 'accda':
            return 'application/msaccess.addin';
            break;

        case 'accdb':
            return 'application/msaccess';
            break;

        case 'accdc':
            return 'application/msaccess.cab';
            break;

        case 'accde':
            return 'application/msaccess';
            break;

        case 'accdr':
            return 'application/msaccess.runtime';
            break;

        case 'accdt':
            return 'application/msaccess';
            break;

        case 'accdw':
            return 'application/msaccess.webapplication';
            break;

        case 'accft':
            return 'application/msaccess.ftemplate';
            break;

        case 'acx':
            return 'application/internet-property-stream';
            break;

        case 'AddIn':
            return 'text/xml';
            break;

        case 'ade':
            return 'application/msaccess';
            break;

        case 'adobebridge':
            return 'application/x-bridge-url';
            break;

        case 'adp':
            return 'application/msaccess';
            break;

        case 'adt':
            return 'audio/vnd.dlna.adts';
            break;

        case 'adts':
            return 'audio/aac';
            break;

        case 'afm':
            return 'application/octet-stream';
            break;

        case 'ai':
            return 'application/postscript';
            break;

        case 'aif':
            return 'audio/x-aiff';
            break;

        case 'aifc':
            return 'audio/aiff';
            break;

        case 'aiff':
            return 'audio/aiff';
            break;

        case 'air':
            return 'application/vnd.adobe.air-application-installer-package+zip';
            break;

        case 'amc':
            return 'application/x-mpeg';
            break;

        case 'application':
            return 'application/x-ms-application';
            break;

        case 'art':
            return 'image/x-jg';
            break;

        case 'asa':
            return 'application/xml';
            break;

        case 'asax':
            return 'application/xml';
            break;

        case 'ascx':
            return 'application/xml';
            break;

        case 'asd':
            return 'application/octet-stream';
            break;

        case 'asf':
            return 'video/x-ms-asf';
            break;

        case 'ashx':
            return 'application/xml';
            break;

        case 'asi':
            return 'application/octet-stream';
            break;

        case 'asm':
            return 'text/plain';
            break;

        case 'asmx':
            return 'application/xml';
            break;

        case 'aspx':
            return 'application/xml';
            break;

        case 'asr':
            return 'video/x-ms-asf';
            break;

        case 'asx':
            return 'video/x-ms-asf';
            break;

        case 'atom':
            return 'application/atom+xml';
            break;

        case 'au':
            return 'audio/basic';
            break;

        case 'avi':
            return 'video/x-msvideo';
            break;

        case 'axs':
            return 'application/olescript';
            break;

        case 'bas':
            return 'text/plain';
            break;

        case 'bcpio':
            return 'application/x-bcpio';
            break;

        case 'bin':
            return 'application/octet-stream';
            break;

        case 'bmp':
            return 'image/bmp';
            break;

        case 'c':
            return 'text/plain';
            break;

        case 'cab':
            return 'application/octet-stream';
            break;

        case 'caf':
            return 'audio/x-caf';
            break;

        case 'calx':
            return 'application/vnd.ms-office.calx';
            break;

        case 'cat':
            return 'application/vnd.ms-pki.seccat';
            break;

        case 'cc':
            return 'text/plain';
            break;

        case 'cd':
            return 'text/plain';
            break;

        case 'cdda':
            return 'audio/aiff';
            break;

        case 'cdf':
            return 'application/x-cdf';
            break;

        case 'cer':
            return 'application/x-x509-ca-cert';
            break;

        case 'chm':
            return 'application/octet-stream';
            break;

        case 'class':
            return 'application/x-java-applet';
            break;

        case 'clp':
            return 'application/x-msclip';
            break;

        case 'cmx':
            return 'image/x-cmx';
            break;

        case 'cnf':
            return 'text/plain';
            break;

        case 'cod':
            return 'image/cis-cod';
            break;

        case 'config':
            return 'application/xml';
            break;

        case 'contact':
            return 'text/x-ms-contact';
            break;

        case 'coverage':
            return 'application/xml';
            break;

        case 'cpio':
            return 'application/x-cpio';
            break;

        case 'cpp':
            return 'text/plain';
            break;

        case 'crd':
            return 'application/x-mscardfile';
            break;

        case 'crl':
            return 'application/pkix-crl';
            break;

        case 'crt':
            return 'application/x-x509-ca-cert';
            break;

        case 'cs':
            return 'text/plain';
            break;

        case 'csdproj':
            return 'text/plain';
            break;

        case 'csh':
            return 'application/x-csh';
            break;

        case 'csproj':
            return 'text/plain';
            break;

        case 'css':
            return 'text/css';
            break;

        case 'csv':
            return 'text/csv';
            break;

        case 'cur':
            return 'application/octet-stream';
            break;

        case 'cxx':
            return 'text/plain';
            break;

        case 'dat':
            return 'application/octet-stream';
            break;

        case 'datasource':
            return 'application/xml';
            break;

        case 'dbproj':
            return 'text/plain';
            break;

        case 'dcr':
            return 'application/x-director';
            break;

        case 'def':
            return 'text/plain';
            break;

        case 'deploy':
            return 'application/octet-stream';
            break;

        case 'der':
            return 'application/x-x509-ca-cert';
            break;

        case 'dgml':
            return 'application/xml';
            break;

        case 'dib':
            return 'image/bmp';
            break;

        case 'dif':
            return 'video/x-dv';
            break;

        case 'dir':
            return 'application/x-director';
            break;

        case 'disco':
            return 'text/xml';
            break;

        case 'dll':
            return 'application/x-msdownload';
            break;

        case 'dll.config':
            return 'text/xml';
            break;

        case 'dlm':
            return 'text/dlm';
            break;

        case 'doc':
            return 'application/msword';
            break;

        case 'docm':
            return 'application/vnd.ms-word.document.macroEnabled.12';
            break;

        case 'docx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;

        case 'dot':
            return 'application/msword';
            break;

        case 'dotm':
            return 'application/vnd.ms-word.template.macroEnabled.12';
            break;

        case 'dotx':
            return 'application/vnd.openxmlformats-officedocument.wordprocessingml.template';
            break;

        case 'dsp':
            return 'application/octet-stream';
            break;

        case 'dsw':
            return 'text/plain';
            break;

        case 'dtd':
            return 'text/xml';
            break;

        case 'dtsConfig':
            return 'text/xml';
            break;

        case 'dv':
            return 'video/x-dv';
            break;

        case 'dvi':
            return 'application/x-dvi';
            break;

        case 'dwf':
            return 'drawing/x-dwf';
            break;

        case 'dwp':
            return 'application/octet-stream';
            break;

        case 'dxr':
            return 'application/x-director';
            break;

        case 'eml':
            return 'message/rfc822';
            break;

        case 'emz':
            return 'application/octet-stream';
            break;

        case 'eot':
            return 'application/octet-stream';
            break;

        case 'eps':
            return 'application/postscript';
            break;

        case 'etl':
            return 'application/etl';
            break;

        case 'etx':
            return 'text/x-setext';
            break;

        case 'evy':
            return 'application/envoy';
            break;

        case 'exe':
            return 'application/octet-stream';
            break;

        case 'exe.config':
            return 'text/xml';
            break;

        case 'fdf':
            return 'application/vnd.fdf';
            break;

        case 'fif':
            return 'application/fractals';
            break;

        case 'filters':
            return 'Application/xml';
            break;

        case 'fla':
            return 'application/octet-stream';
            break;

        case 'flr':
            return 'x-world/x-vrml';
            break;

        case 'flv':
            return 'video/x-flv';
            break;

        case 'fsscript':
            return 'application/fsharp-script';
            break;

        case 'fsx':
            return 'application/fsharp-script';
            break;

        case 'generictest':
            return 'application/xml';
            break;

        case 'gif':
            return 'image/gif';
            break;

        case 'group':
            return 'text/x-ms-group';
            break;

        case 'gsm':
            return 'audio/x-gsm';
            break;

        case 'gtar':
            return 'application/x-gtar';
            break;

        case 'gz':
            return 'application/x-gzip';
            break;

        case 'h':
            return 'text/plain';
            break;

        case 'hdf':
            return 'application/x-hdf';
            break;

        case 'hdml':
            return 'text/x-hdml';
            break;

        case 'hhc':
            return 'application/x-oleobject';
            break;

        case 'hhk':
            return 'application/octet-stream';
            break;

        case 'hhp':
            return 'application/octet-stream';
            break;

        case 'hlp':
            return 'application/winhlp';
            break;

        case 'hpp':
            return 'text/plain';
            break;

        case 'hqx':
            return 'application/mac-binhex40';
            break;

        case 'hta':
            return 'application/hta';
            break;

        case 'htc':
            return 'text/x-component';
            break;

        case 'htm':
            return 'text/html';
            break;

        case 'html':
            return 'text/html';
            break;

        case 'htt':
            return 'text/webviewhtml';
            break;

        case 'hxa':
            return 'application/xml';
            break;

        case 'hxc':
            return 'application/xml';
            break;

        case 'hxd':
            return 'application/octet-stream';
            break;

        case 'hxe':
            return 'application/xml';
            break;

        case 'hxf':
            return 'application/xml';
            break;

        case 'hxh':
            return 'application/octet-stream';
            break;

        case 'hxi':
            return 'application/octet-stream';
            break;

        case 'hxk':
            return 'application/xml';
            break;

        case 'hxq':
            return 'application/octet-stream';
            break;

        case 'hxr':
            return 'application/octet-stream';
            break;

        case 'hxs':
            return 'application/octet-stream';
            break;

        case 'hxt':
            return 'text/html';
            break;

        case 'hxv':
            return 'application/xml';
            break;

        case 'hxw':
            return 'application/octet-stream';
            break;

        case 'hxx':
            return 'text/plain';
            break;

        case 'i':
            return 'text/plain';
            break;

        case 'ico':
            return 'image/x-icon';
            break;

        case 'ics':
            return 'application/octet-stream';
            break;

        case 'idl':
            return 'text/plain';
            break;

        case 'ief':
            return 'image/ief';
            break;

        case 'iii':
            return 'application/x-iphone';
            break;

        case 'inc':
            return 'text/plain';
            break;

        case 'inf':
            return 'application/octet-stream';
            break;

        case 'inl':
            return 'text/plain';
            break;

        case 'ins':
            return 'application/x-internet-signup';
            break;

        case 'ipa':
            return 'application/x-itunes-ipa';
            break;

        case 'ipg':
            return 'application/x-itunes-ipg';
            break;

        case 'ipproj':
            return 'text/plain';
            break;

        case 'ipsw':
            return 'application/x-itunes-ipsw';
            break;

        case 'iqy':
            return 'text/x-ms-iqy';
            break;

        case 'isp':
            return 'application/x-internet-signup';
            break;

        case 'ite':
            return 'application/x-itunes-ite';
            break;

        case 'itlp':
            return 'application/x-itunes-itlp';
            break;

        case 'itms':
            return 'application/x-itunes-itms';
            break;

        case 'itpc':
            return 'application/x-itunes-itpc';
            break;

        case 'IVF':
            return 'video/x-ivf';
            break;

        case 'jar':
            return 'application/java-archive';
            break;

        case 'java':
            return 'application/octet-stream';
            break;

        case 'jck':
            return 'application/liquidmotion';
            break;

        case 'jcz':
            return 'application/liquidmotion';
            break;

        case 'jfif':
            return 'image/pjpeg';
            break;

        case 'jnlp':
            return 'application/x-java-jnlp-file';
            break;

        case 'jpb':
            return 'application/octet-stream';
            break;

        case 'jpe':
            return 'image/jpeg';
            break;

        case 'jpeg':
            return 'image/jpeg';
            break;

        case 'jpg':
            return 'image/jpeg';
            break;

        case 'js':
            return 'application/x-javascript';
            break;

        case 'json':
            return 'application/json';
            break;

        case 'jsx':
            return 'text/jscript';
            break;

        case 'jsxbin':
            return 'text/plain';
            break;

        case 'latex':
            return 'application/x-latex';
            break;

        case 'library-ms':
            return 'application/windows-library+xml';
            break;

        case 'lit':
            return 'application/x-ms-reader';
            break;

        case 'loadtest':
            return 'application/xml';
            break;

        case 'lpk':
            return 'application/octet-stream';
            break;

        case 'lsf':
            return 'video/x-la-asf';
            break;

        case 'lst':
            return 'text/plain';
            break;

        case 'lsx':
            return 'video/x-la-asf';
            break;

        case 'lzh':
            return 'application/octet-stream';
            break;

        case 'm13':
            return 'application/x-msmediaview';
            break;

        case 'm14':
            return 'application/x-msmediaview';
            break;

        case 'm1v':
            return 'video/mpeg';
            break;

        case 'm2t':
            return 'video/vnd.dlna.mpeg-tts';
            break;

        case 'm2ts':
            return 'video/vnd.dlna.mpeg-tts';
            break;

        case 'm2v':
            return 'video/mpeg';
            break;

        case 'm3u':
            return 'audio/x-mpegurl';
            break;

        case 'm3u8':
            return 'audio/x-mpegurl';
            break;

        case 'm4a':
            return 'audio/m4a';
            break;

        case 'm4b':
            return 'audio/m4b';
            break;

        case 'm4p':
            return 'audio/m4p';
            break;

        case 'm4r':
            return 'audio/x-m4r';
            break;

        case 'm4v':
            return 'video/x-m4v';
            break;

        case 'mac':
            return 'image/x-macpaint';
            break;

        case 'mak':
            return 'text/plain';
            break;

        case 'man':
            return 'application/x-troff-man';
            break;

        case 'manifest':
            return 'application/x-ms-manifest';
            break;

        case 'map':
            return 'text/plain';
            break;

        case 'master':
            return 'application/xml';
            break;

        case 'mda':
            return 'application/msaccess';
            break;

        case 'mdb':
            return 'application/x-msaccess';
            break;

        case 'mde':
            return 'application/msaccess';
            break;

        case 'mdp':
            return 'application/octet-stream';
            break;

        case 'me':
            return 'application/x-troff-me';
            break;

        case 'mfp':
            return 'application/x-shockwave-flash';
            break;

        case 'mht':
            return 'message/rfc822';
            break;

        case 'mhtml':
            return 'message/rfc822';
            break;

        case 'mid':
            return 'audio/mid';
            break;

        case 'midi':
            return 'audio/mid';
            break;

        case 'mix':
            return 'application/octet-stream';
            break;

        case 'mk':
            return 'text/plain';
            break;

        case 'mmf':
            return 'application/x-smaf';
            break;

        case 'mno':
            return 'text/xml';
            break;

        case 'mny':
            return 'application/x-msmoney';
            break;

        case 'mod':
            return 'video/mpeg';
            break;

        case 'mov':
            return 'video/quicktime';
            break;

        case 'movie':
            return 'video/x-sgi-movie';
            break;

        case 'mp2':
            return 'video/mpeg';
            break;

        case 'mp2v':
            return 'video/mpeg';
            break;

        case 'mp3':
            return 'audio/mpeg';
            break;

        case 'mp4':
            return 'video/mp4';
            break;

        case 'mp4v':
            return 'video/mp4';
            break;

        case 'mpa':
            return 'video/mpeg';
            break;

        case 'mpe':
            return 'video/mpeg';
            break;

        case 'mpeg':
            return 'video/mpeg';
            break;

        case 'mpf':
            return 'application/vnd.ms-mediapackage';
            break;

        case 'mpg':
            return 'video/mpeg';
            break;

        case 'mpp':
            return 'application/vnd.ms-project';
            break;

        case 'mpv2':
            return 'video/mpeg';
            break;

        case 'mqv':
            return 'video/quicktime';
            break;

        case 'ms':
            return 'application/x-troff-ms';
            break;

        case 'msi':
            return 'application/octet-stream';
            break;

        case 'mso':
            return 'application/octet-stream';
            break;

        case 'mts':
            return 'video/vnd.dlna.mpeg-tts';
            break;

        case 'mtx':
            return 'application/xml';
            break;

        case 'mvb':
            return 'application/x-msmediaview';
            break;

        case 'mvc':
            return 'application/x-miva-compiled';
            break;

        case 'mxp':
            return 'application/x-mmxp';
            break;

        case 'nc':
            return 'application/x-netcdf';
            break;

        case 'nsc':
            return 'video/x-ms-asf';
            break;

        case 'nws':
            return 'message/rfc822';
            break;

        case 'ocx':
            return 'application/octet-stream';
            break;

        case 'oda':
            return 'application/oda';
            break;

        case 'odc':
            return 'text/x-ms-odc';
            break;

        case 'odh':
            return 'text/plain';
            break;

        case 'odl':
            return 'text/plain';
            break;

        case 'odp':
            return 'application/vnd.oasis.opendocument.presentation';
            break;

        case 'ods':
            return 'application/oleobject';
            break;

        case 'odt':
            return 'application/vnd.oasis.opendocument.text';
            break;

        case 'one':
            return 'application/onenote';
            break;

        case 'onea':
            return 'application/onenote';
            break;

        case 'onepkg':
            return 'application/onenote';
            break;

        case 'onetmp':
            return 'application/onenote';
            break;

        case 'onetoc':
            return 'application/onenote';
            break;

        case 'onetoc2':
            return 'application/onenote';
            break;

        case 'orderedtest':
            return 'application/xml';
            break;

        case 'osdx':
            return 'application/opensearchdescription+xml';
            break;

        case 'p10':
            return 'application/pkcs10';
            break;

        case 'p12':
            return 'application/x-pkcs12';
            break;

        case 'p7b':
            return 'application/x-pkcs7-certificates';
            break;

        case 'p7c':
            return 'application/pkcs7-mime';
            break;

        case 'p7m':
            return 'application/pkcs7-mime';
            break;

        case 'p7r':
            return 'application/x-pkcs7-certreqresp';
            break;

        case 'p7s':
            return 'application/pkcs7-signature';
            break;

        case 'pbm':
            return 'image/x-portable-bitmap';
            break;

        case 'pcast':
            return 'application/x-podcast';
            break;

        case 'pct':
            return 'image/pict';
            break;

        case 'pcx':
            return 'application/octet-stream';
            break;

        case 'pcz':
            return 'application/octet-stream';
            break;

        case 'pdf':
            return 'application/pdf';
            break;

        case 'pfb':
            return 'application/octet-stream';
            break;

        case 'pfm':
            return 'application/octet-stream';
            break;

        case 'pfx':
            return 'application/x-pkcs12';
            break;

        case 'pgm':
            return 'image/x-portable-graymap';
            break;

        case 'pic':
            return 'image/pict';
            break;

        case 'pict':
            return 'image/pict';
            break;

        case 'pkgdef':
            return 'text/plain';
            break;

        case 'pkgundef':
            return 'text/plain';
            break;

        case 'pko':
            return 'application/vnd.ms-pki.pko';
            break;

        case 'pls':
            return 'audio/scpls';
            break;

        case 'pma':
            return 'application/x-perfmon';
            break;

        case 'pmc':
            return 'application/x-perfmon';
            break;

        case 'pml':
            return 'application/x-perfmon';
            break;

        case 'pmr':
            return 'application/x-perfmon';
            break;

        case 'pmw':
            return 'application/x-perfmon';
            break;

        case 'png':
            return 'image/png';
            break;

        case 'pnm':
            return 'image/x-portable-anymap';
            break;

        case 'pnt':
            return 'image/x-macpaint';
            break;

        case 'pntg':
            return 'image/x-macpaint';
            break;

        case 'pnz':
            return 'image/png';
            break;

        case 'pot':
            return 'application/vnd.ms-powerpoint';
            break;

        case 'potm':
            return 'application/vnd.ms-powerpoint.template.macroEnabled.12';
            break;

        case 'potx':
            return 'application/vnd.openxmlformats-officedocument.presentationml.template';
            break;

        case 'ppa':
            return 'application/vnd.ms-powerpoint';
            break;

        case 'ppam':
            return 'application/vnd.ms-powerpoint.addin.macroEnabled.12';
            break;

        case 'ppm':
            return 'image/x-portable-pixmap';
            break;

        case 'pps':
            return 'application/vnd.ms-powerpoint';
            break;

        case 'ppsm':
            return 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12';
            break;

        case 'ppsx':
            return 'application/vnd.openxmlformats-officedocument.presentationml.slideshow';
            break;

        case 'ppt':
            return 'application/vnd.ms-powerpoint';
            break;

        case 'pptm':
            return 'application/vnd.ms-powerpoint.presentation.macroEnabled.12';
            break;

        case 'pptx':
            return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            break;

        case 'prf':
            return 'application/pics-rules';
            break;

        case 'prm':
            return 'application/octet-stream';
            break;

        case 'prx':
            return 'application/octet-stream';
            break;

        case 'ps':
            return 'application/postscript';
            break;

        case 'psc1':
            return 'application/PowerShell';
            break;

        case 'psd':
            return 'application/octet-stream';
            break;

        case 'psess':
            return 'application/xml';
            break;

        case 'psm':
            return 'application/octet-stream';
            break;

        case 'psp':
            return 'application/octet-stream';
            break;

        case 'pub':
            return 'application/x-mspublisher';
            break;

        case 'pwz':
            return 'application/vnd.ms-powerpoint';
            break;

        case 'qht':
            return 'text/x-html-insertion';
            break;

        case 'qhtm':
            return 'text/x-html-insertion';
            break;

        case 'qt':
            return 'video/quicktime';
            break;

        case 'qti':
            return 'image/x-quicktime';
            break;

        case 'qtif':
            return 'image/x-quicktime';
            break;

        case 'qtl':
            return 'application/x-quicktimeplayer';
            break;

        case 'qxd':
            return 'application/octet-stream';
            break;

        case 'ra':
            return 'audio/x-pn-realaudio';
            break;

        case 'ram':
            return 'audio/x-pn-realaudio';
            break;

        case 'rar':
            return 'application/octet-stream';
            break;

        case 'ras':
            return 'image/x-cmu-raster';
            break;

        case 'rat':
            return 'application/rat-file';
            break;

        case 'rc':
            return 'text/plain';
            break;

        case 'rc2':
            return 'text/plain';
            break;

        case 'rct':
            return 'text/plain';
            break;

        case 'rdlc':
            return 'application/xml';
            break;

        case 'resx':
            return 'application/xml';
            break;

        case 'rf':
            return 'image/vnd.rn-realflash';
            break;

        case 'rgb':
            return 'image/x-rgb';
            break;

        case 'rgs':
            return 'text/plain';
            break;

        case 'rm':
            return 'application/vnd.rn-realmedia';
            break;

        case 'rmi':
            return 'audio/mid';
            break;

        case 'rmp':
            return 'application/vnd.rn-rn_music_package';
            break;

        case 'roff':
            return 'application/x-troff';
            break;

        case 'rpm':
            return 'audio/x-pn-realaudio-plugin';
            break;

        case 'rqy':
            return 'text/x-ms-rqy';
            break;

        case 'rtf':
            return 'application/rtf';
            break;

        case 'rtx':
            return 'text/richtext';
            break;

        case 'ruleset':
            return 'application/xml';
            break;

        case 's':
            return 'text/plain';
            break;

        case 'safariextz':
            return 'application/x-safari-safariextz';
            break;

        case 'scd':
            return 'application/x-msschedule';
            break;

        case 'sct':
            return 'text/scriptlet';
            break;

        case 'sd2':
            return 'audio/x-sd2';
            break;

        case 'sdp':
            return 'application/sdp';
            break;

        case 'sea':
            return 'application/octet-stream';
            break;

        case 'searchConnector-ms':
            return 'application/windows-search-connector+xml';
            break;

        case 'setpay':
            return 'application/set-payment-initiation';
            break;

        case 'setreg':
            return 'application/set-registration-initiation';
            break;

        case 'settings':
            return 'application/xml';
            break;

        case 'sgimb':
            return 'application/x-sgimb';
            break;

        case 'sgml':
            return 'text/sgml';
            break;

        case 'sh':
            return 'application/x-sh';
            break;

        case 'shar':
            return 'application/x-shar';
            break;

        case 'shtml':
            return 'text/html';
            break;

        case 'sit':
            return 'application/x-stuffit';
            break;

        case 'sitemap':
            return 'application/xml';
            break;

        case 'skin':
            return 'application/xml';
            break;

        case 'sldm':
            return 'application/vnd.ms-powerpoint.slide.macroEnabled.12';
            break;

        case 'sldx':
            return 'application/vnd.openxmlformats-officedocument.presentationml.slide';
            break;

        case 'slk':
            return 'application/vnd.ms-excel';
            break;

        case 'sln':
            return 'text/plain';
            break;

        case 'slupkg-ms':
            return 'application/x-ms-license';
            break;

        case 'smd':
            return 'audio/x-smd';
            break;

        case 'smi':
            return 'application/octet-stream';
            break;

        case 'smx':
            return 'audio/x-smd';
            break;

        case 'smz':
            return 'audio/x-smd';
            break;

        case 'snd':
            return 'audio/basic';
            break;

        case 'snippet':
            return 'application/xml';
            break;

        case 'snp':
            return 'application/octet-stream';
            break;

        case 'sol':
            return 'text/plain';
            break;

        case 'sor':
            return 'text/plain';
            break;

        case 'spc':
            return 'application/x-pkcs7-certificates';
            break;

        case 'spl':
            return 'application/futuresplash';
            break;

        case 'src':
            return 'application/x-wais-source';
            break;

        case 'srf':
            return 'text/plain';
            break;

        case 'SSISDeploymentManifest':
            return 'text/xml';
            break;

        case 'ssm':
            return 'application/streamingmedia';
            break;

        case 'sst':
            return 'application/vnd.ms-pki.certstore';
            break;

        case 'stl':
            return 'application/vnd.ms-pki.stl';
            break;

        case 'sv4cpio':
            return 'application/x-sv4cpio';
            break;

        case 'sv4crc':
            return 'application/x-sv4crc';
            break;

        case 'svc':
            return 'application/xml';
            break;

        case 'swf':
            return 'application/x-shockwave-flash';
            break;

        case 't':
            return 'application/x-troff';
            break;

        case 'tar':
            return 'application/x-tar';
            break;

        case 'tcl':
            return 'application/x-tcl';
            break;

        case 'testrunconfig':
            return 'application/xml';
            break;

        case 'testsettings':
            return 'application/xml';
            break;

        case 'tex':
            return 'application/x-tex';
            break;

        case 'texi':
            return 'application/x-texinfo';
            break;

        case 'texinfo':
            return 'application/x-texinfo';
            break;

        case 'tgz':
            return 'application/x-compressed';
            break;

        case 'thmx':
            return 'application/vnd.ms-officetheme';
            break;

        case 'thn':
            return 'application/octet-stream';
            break;

        case 'tif':
            return 'image/tiff';
            break;

        case 'tiff':
            return 'image/tiff';
            break;

        case 'tlh':
            return 'text/plain';
            break;

        case 'tli':
            return 'text/plain';
            break;

        case 'toc':
            return 'application/octet-stream';
            break;

        case 'tr':
            return 'application/x-troff';
            break;

        case 'trm':
            return 'application/x-msterminal';
            break;

        case 'trx':
            return 'application/xml';
            break;

        case 'ts':
            return 'video/vnd.dlna.mpeg-tts';
            break;

        case 'tsv':
            return 'text/tab-separated-values';
            break;

        case 'ttf':
            return 'application/octet-stream';
            break;

        case 'tts':
            return 'video/vnd.dlna.mpeg-tts';
            break;

        case 'txt':
            return 'text/plain';
            break;

        case 'u32':
            return 'application/octet-stream';
            break;

        case 'uls':
            return 'text/iuls';
            break;

        case 'user':
            return 'text/plain';
            break;

        case 'ustar':
            return 'application/x-ustar';
            break;

        case 'vb':
            return 'text/plain';
            break;

        case 'vbdproj':
            return 'text/plain';
            break;

        case 'vbk':
            return 'video/mpeg';
            break;

        case 'vbproj':
            return 'text/plain';
            break;

        case 'vbs':
            return 'text/vbscript';
            break;

        case 'vcf':
            return 'text/x-vcard';
            break;

        case 'vcproj':
            return 'Application/xml';
            break;

        case 'vcs':
            return 'text/plain';
            break;

        case 'vcxproj':
            return 'Application/xml';
            break;

        case 'vddproj':
            return 'text/plain';
            break;

        case 'vdp':
            return 'text/plain';
            break;

        case 'vdproj':
            return 'text/plain';
            break;

        case 'vdx':
            return 'application/vnd.ms-visio.viewer';
            break;

        case 'vml':
            return 'text/xml';
            break;

        case 'vscontent':
            return 'application/xml';
            break;

        case 'vsct':
            return 'text/xml';
            break;

        case 'vsd':
            return 'application/vnd.visio';
            break;

        case 'vsi':
            return 'application/ms-vsi';
            break;

        case 'vsix':
            return 'application/vsix';
            break;

        case 'vsixlangpack':
            return 'text/xml';
            break;

        case 'vsixmanifest':
            return 'text/xml';
            break;

        case 'vsmdi':
            return 'application/xml';
            break;

        case 'vspscc':
            return 'text/plain';
            break;

        case 'vss':
            return 'application/vnd.visio';
            break;

        case 'vsscc':
            return 'text/plain';
            break;

        case 'vssettings':
            return 'text/xml';
            break;

        case 'vssscc':
            return 'text/plain';
            break;

        case 'vst':
            return 'application/vnd.visio';
            break;

        case 'vstemplate':
            return 'text/xml';
            break;

        case 'vsto':
            return 'application/x-ms-vsto';
            break;

        case 'vsw':
            return 'application/vnd.visio';
            break;

        case 'vsx':
            return 'application/vnd.visio';
            break;

        case 'vtx':
            return 'application/vnd.visio';
            break;

        case 'wav':
            return 'audio/wav';
            break;

        case 'wave':
            return 'audio/wav';
            break;

        case 'wax':
            return 'audio/x-ms-wax';
            break;

        case 'wbk':
            return 'application/msword';
            break;

        case 'wbmp':
            return 'image/vnd.wap.wbmp';
            break;

        case 'wcm':
            return 'application/vnd.ms-works';
            break;

        case 'wdb':
            return 'application/vnd.ms-works';
            break;

        case 'wdp':
            return 'image/vnd.ms-photo';
            break;

        case 'webarchive':
            return 'application/x-safari-webarchive';
            break;

        case 'webtest':
            return 'application/xml';
            break;

        case 'wiq':
            return 'application/xml';
            break;

        case 'wiz':
            return 'application/msword';
            break;

        case 'wks':
            return 'application/vnd.ms-works';
            break;

        case 'WLMP':
            return 'application/wlmoviemaker';
            break;

        case 'wlpginstall':
            return 'application/x-wlpg-detect';
            break;

        case 'wlpginstall3':
            return 'application/x-wlpg3-detect';
            break;

        case 'wm':
            return 'video/x-ms-wm';
            break;

        case 'wma':
            return 'audio/x-ms-wma';
            break;

        case 'wmd':
            return 'application/x-ms-wmd';
            break;

        case 'wmf':
            return 'application/x-msmetafile';
            break;

        case 'wml':
            return 'text/vnd.wap.wml';
            break;

        case 'wmlc':
            return 'application/vnd.wap.wmlc';
            break;

        case 'wmls':
            return 'text/vnd.wap.wmlscript';
            break;

        case 'wmlsc':
            return 'application/vnd.wap.wmlscriptc';
            break;

        case 'wmp':
            return 'video/x-ms-wmp';
            break;

        case 'wmv':
            return 'video/x-ms-wmv';
            break;

        case 'wmx':
            return 'video/x-ms-wmx';
            break;

        case 'wmz':
            return 'application/x-ms-wmz';
            break;

        case 'wpl':
            return 'application/vnd.ms-wpl';
            break;

        case 'wps':
            return 'application/vnd.ms-works';
            break;

        case 'wri':
            return 'application/x-mswrite';
            break;

        case 'wrl':
            return 'x-world/x-vrml';
            break;

        case 'wrz':
            return 'x-world/x-vrml';
            break;

        case 'wsc':
            return 'text/scriptlet';
            break;

        case 'wsdl':
            return 'text/xml';
            break;

        case 'wvx':
            return 'video/x-ms-wvx';
            break;

        case 'x':
            return 'application/directx';
            break;

        case 'xaf':
            return 'x-world/x-vrml';
            break;

        case 'xaml':
            return 'application/xaml+xml';
            break;

        case 'xap':
            return 'application/x-silverlight-app';
            break;

        case 'xbap':
            return 'application/x-ms-xbap';
            break;

        case 'xbm':
            return 'image/x-xbitmap';
            break;

        case 'xdr':
            return 'text/plain';
            break;

        case 'xht':
            return 'application/xhtml+xml';
            break;

        case 'xhtml':
            return 'application/xhtml+xml';
            break;

        case 'xla':
            return 'application/vnd.ms-excel';
            break;

        case 'xlam':
            return 'application/vnd.ms-excel.addin.macroEnabled.12';
            break;

        case 'xlc':
            return 'application/vnd.ms-excel';
            break;

        case 'xld':
            return 'application/vnd.ms-excel';
            break;

        case 'xlk':
            return 'application/vnd.ms-excel';
            break;

        case 'xll':
            return 'application/vnd.ms-excel';
            break;

        case 'xlm':
            return 'application/vnd.ms-excel';
            break;

        case 'xls':
            return 'application/vnd.ms-excel';
            break;

        case 'xlsb':
            return 'application/vnd.ms-excel.sheet.binary.macroEnabled.12';
            break;

        case 'xlsm':
            return 'application/vnd.ms-excel.sheet.macroEnabled.12';
            break;

        case 'xlsx':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            break;

        case 'xlt':
            return 'application/vnd.ms-excel';
            break;

        case 'xltm':
            return 'application/vnd.ms-excel.template.macroEnabled.12';
            break;

        case 'xltx':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.template';
            break;

        case 'xlw':
            return 'application/vnd.ms-excel';
            break;

        case 'xml':
            return 'text/xml';
            break;

        case 'xmta':
            return 'application/xml';
            break;

        case 'xof':
            return 'x-world/x-vrml';
            break;

        case 'XOML':
            return 'text/plain';
            break;

        case 'xpm':
            return 'image/x-xpixmap';
            break;

        case 'xps':
            return 'application/vnd.ms-xpsdocument';
            break;

        case 'xrm-ms':
            return 'text/xml';
            break;

        case 'xsc':
            return 'application/xml';
            break;

        case 'xsd':
            return 'text/xml';
            break;

        case 'xsf':
            return 'text/xml';
            break;

        case 'xsl':
            return 'text/xml';
            break;

        case 'xslt':
            return 'text/xml';
            break;

        case 'xsn':
            return 'application/octet-stream';
            break;

        case 'xss':
            return 'application/xml';
            break;

        case 'xtp':
            return 'application/octet-stream';
            break;

        case 'xwd':
            return 'image/x-xwindowdump';
            break;

        case 'z':
            return 'application/x-compress';
            break;

        case 'zip':
            return 'application/x-zip-compressed';
    }

    return 'text/plain'; // More appropriate for mvdms

    // Return "application/octet-stream"
}
// </MIMETYPE>

// <MONTHNAME>
function JSB_BF_MONTHNAME(Monthindex1to12) {
    var Months = '';

    Months = 'January,Febuary,March,April,May,June,July,August,September,October,November,December';
    return Field(Months, ',', Monthindex1to12);

}
// </MONTHNAME>

// <MSGBOX>
async function JSB_BF_MSGBOX(Title, Message, Csvanswers, Width, _Height) {
    // Create Dialog

    var Dc = undefined;
    var I = undefined;
    var Msg = '';
    var Innerhtmldialog = '';
    var Txt = '';
    var Defaultans = '';

    if (Message === undefined) {
        Message = Title;
        Title = 'Message';
        Csvanswers = 'OK';;
    } else if (Csvanswers === undefined) {
        Csvanswers = Message;
        Message = Title;
        Title = 'Message';
    }

    if (typeOf(Csvanswers) == 'Array') Csvanswers = Join(Csvanswers, ',');

    if (InStr1(1, Message, Chr(28)) && Count(Message, Chr(28)) == Count(Message, Chr(29))) {
        Msg = Message;
    } else {
        Msg = Change(Message, crlf, am);
        Msg = Change(Msg, am, '**AM**');
        Msg = Change(Msg, Chr(28) + '\<', '**LT**');
        Msg = Change(Msg, '\>' + Chr(29), '**GT**');
        Msg = htmlEncode(Msg);
        Msg = Change(Msg, '**AM**', '\<br /\>');
        Msg = Change(Msg, '**LT**', '\<');
        Msg = Change(Msg, '**GT**', '\>');
    }

    Defaultans = '';

    Innerhtmldialog = Chr(28) + '\<span class=\'msgbox\'\>' + Msg + '\<br /\>\</span\>\<hr\>';
    Dc = DCount(Csvanswers, ',');
    var _ForEndI_5 = Dc;
    for (I = 1; I <= _ForEndI_5; I++) {
        Txt = Field(Csvanswers, ',', I);
        Innerhtmldialog += '\<button type="button" class=\'SubmitBtn\'';

        if (Left(Txt, 1) == '*' || Dc == 1) {
            if (Left(Txt, 1) == '*') Txt = Mid1(Txt, 2);
            Defaultans = Txt;
            Innerhtmldialog += ' id=\'defaultAns\'';
        }

        Innerhtmldialog += ' onclick=' + jsEscapeAttr('storeVal(\'msgboxResult\', ' + jsEscapeString(Txt) + '); $(\'#dialog\').dialog(\'close\');');
        Innerhtmldialog += '\>' + CStr(htmlEncode(Language(Txt))) + '\</button\>&nbsp;';
    }

    if (Defaultans) {
        Innerhtmldialog += JSB_HTML_SCRIPT('\r\n\
            $( document ).ready(function() {\r\n\
                setTimeout(function(){ $(\'#defaultAns\').focus() }, 50);\r\n\
            });\r\n\
        ');
    }

    Innerhtmldialog += Chr(29);
    return await JSB_BF_DIALOG(Title, Innerhtmldialog, true, CStr(Width), CStr(_Height));
}
// </MSGBOX>

// <MSGBOXFWD>
async function JSB_BF_MSGBOXFWD(Title, Message, Csvanswers, Responseurl, Width, _Height) {
    if (Csvanswers === undefined) {
        Responseurl = Csvanswers;
        Csvanswers = Message;
        Message = Title;
        Title = 'Message';
    }

    var S = ('MsgBox(' + jsEscapeString(Title) + ', ' + jsEscapeString(Message) + ', ' + jsEscapeString(Csvanswers) + ', \'auto\', \'auto\', function (ans) {\r\n\
             var url = ' + jsEscapeString(Responseurl) + ';\r\n\
             if (InStr(url, \'?\')) url += \'&\'; else url += \'?\';\r\n\
             url += \'ans=\' + ans;\r\n\
             windowOpen(url)\r\n\
            })');
    Print(At(-1), JSB_HTML_SCRIPT(S));
    return Stop();
}
// </MSGBOXFWD>

// <MYGPS>
async function JSB_BF_MYGPS() {
    // local variables
    var Pos, Status, Callbacknumber;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                var permissions = undefined;
                Pos = {};
                if (Left(JSB_BF_URL(), 5) != 'https' && Not(isPhoneGap())) { activeProcess.At_Errors = 'A secure URL is required for GPS location'; return undefined; }
                if (Not(window.navigator.geolocation)) { activeProcess.At_Errors = 'Your browser doesn\'t have Geolocation'; return undefined; }

                // See https://www.npmjs.com/package/cordova-plugin-android-permissions
                if (hasPlugIn('cordova-plugin-android-permissions')) {
                    permissions = window.cordova.plugins.permissions;
                    await new Promise(resolve => permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, function (_Status) { Status = _Status; Callbacknumber = 1; resolve(Callbacknumber) }, function (_Status) { Status = _Status; Callbacknumber = 2; resolve(Callbacknumber) }));
                    if (Null0(Callbacknumber) != 1) { activeProcess.At_Errors = 'GPS Permission Error'; return undefined; }
                    if (Not(Status.hasPermission)) { activeProcess.At_Errors = 'GPS Position disabled by user'; return undefined; }
                }

                window.waitingForGPS = true;
                window.main_VT100.showOverlay('Waiting for GPS');

                me._activeProcess.setBlock(setBlock_geoGetCurrentPosition, me, "GOTGPS")

                window.navigator.geolocation.getCurrentPosition(function (position) {
                    if (window.waitingForGPS) {
                        me.Pos = { lng: position.coords.longitude, lat: position.coords.latitude }
                        main_VT100.removeOverlay()
                        window.waitingForGPS = false;
                        me._activeProcess.unblock(setBlock_geoGetCurrentPosition)
                    }
                }, function (err) {
                    if (window.waitingForGPS) {
                        me.Pos = { error: err.message }
                        window.waitingForGPS = false;
                        me._state = "RETURNERR";
                        main_VT100.removeOverlay();
                        me._activeProcess.unblock(setBlock_geoGetCurrentPosition)
                    }
                }, { "timeout": 10000 });

                return


            case "GOTGPS":

                return Pos;


            case "RETURNERR":

                activeProcess.At_Errors = Pos.error;
                return undefined;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </MYGPS>

// <MYIP>
function JSB_BF_MYIP() {
    var Xf = '';
    var Ipadr = '';
    var Ip = '';

    Ip = At_Request.UserHostAddress;
    if (System(1) == 'aspx' && localIP(Ip)) {
        Xf = At_Request.ServerVariables('HTTP_X_FORWARDED_FOR');
        Ip = '';
        for (Ipadr of iterateOver(Split(Xf, ','))) {
            if (Count(Ipadr, '.') == 3) {
                Ip = Ipadr;
                break;
            }
        }

        if (Not(Ip)) Ip = At_Request.ServerVariables('REMOTE_ADDR');
        if (Not(Ip)) Ip = At_Request.ServerVariables('HTTP_X_CLUSTER_CLIENT_IP');
        if (Not(Ip)) Ip = At_Request.ServerVariables('HTTP_FORWARDED_FOR');
        if (Not(Ip)) Ip = At_Request.ServerVariables('HTTP_FORWARDED');
        if (Not(Ip)) Ip = At_Request.ServerVariables('REMOTE_ADDR');
    }

    return Trim(fieldLeft(Ip, ':'));
}
// </MYIP>

// <NEWGUID>
function JSB_BF_NEWGUID() {
    return System(13);
}
// </NEWGUID>

// <NEWWINDOW>
function JSB_BF_NEWWINDOW(Url) {
    return JSB_BF_TRANSFERURL(CStr(2), '', '', '', CStr(Url), CStr(false), CStr(true));
}
// </NEWWINDOW>

// <TRANSFERURL>
function JSB_BF_TRANSFERURL(Transferto, Transferextra, Selectedid, Title, Url, Addfrompage, Immediately) {
    var _Html = '';
    var B = '';
    var X = '';
    var Tx = '';

    if (Null0(Transferto) == 8 && Immediately) { return At_Response.Redirect(Url); At_Server.End(); }
    Tx = Transferextra;
    if (Null0(Transferto) == 13 && Not(Tx)) {
        Tx = -2; // Make previous page go back to.;
    }
    if (Not(Addfrompage)) Addfrompage = 'false';

    _Html = Chr(28) + '\r\n\
         \<script type="text/javascript"\>\r\n\
            transferUrl(' + CStr(Transferto) + ', ' + jsEscapeString(Tx) + ', ' + jsEscapeString(CStr(Selectedid)) + ', ' + jsEscapeString(CStr(Title)) + ', ' + jsEscapeString(CStr(Url)) + ', ' + Addfrompage + ')\r\n\
         \</script\>\r\n\
     ' + Chr(29);
    if (Not(Immediately)) return _Html;

    B = At_Response.buffer();
    Print(_Html);
    FlushHTML();
    X = At_Response.buffer(B);
    return '';
}
// </TRANSFERURL>

// <NICENAME>
function JSB_BF_NICENAME(Id) {
    return Convert('!: ~@#$%^&*?\<\>()-=+{}[].,./\\\'"', '________________________', Id);
}
// </NICENAME>

// <NOBROWSERBACK>
function JSB_BF_NOBROWSERBACK() {
    window.location.hash = 'no-back-button';
    window.location.hash = 'Again-No-back-button'; // again because google chrome don't insert first hash into history
    window.onhashchange = function () { window.location.hash = "no-back-button"; };
    return '';
}
// </NOBROWSERBACK>

// <OCONV>
async function JSB_BF_OCONV(ByRef_Cstring, ByRef_Conv, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Cstring, ByRef_Conv)
        return v
    }
    return exit(await JSB_BF_IOCONV('O', CStr(ByRef_Cstring), CStr(ByRef_Conv)));
}
// </OCONV>

// <ONLINE>
function JSB_BF_ONLINE() {
    return window.onLine();
}
// </ONLINE>

// <OPENTABLE>
async function JSB_BF_OPENTABLE(Tablename, Viewname, ByRef_Ftable, ByRef_Rtnerrors, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Ftable, ByRef_Rtnerrors)
        return v
    }
    var Tblname = '';
    var E = '';

    if (!Tablename) Tblname = 'applications'; else Tblname = Tablename;

    ByRef_Ftable = await JSB_BF_FHANDLE('', Tablename, IsLocalHost());
    if (Not(ByRef_Ftable)) {
        E = activeProcess.At_Errors;
        if (InStr1(1, E, 'does not')) E = 'Table not found: ' + Tblname;
        ByRef_Rtnerrors = E + '; From view ' + CStr(Viewname) + '-openTableAndCheckID-' + Tblname + '-' + CStr(System(32));
        await JSB_BF_LOGERR(ByRef_Rtnerrors);
        return exit(false);
    }

    return exit(true);
}
// </OPENTABLE>

// <OSVERSION>
function JSB_BF_OSVERSION() {
    return System(41);
}
// </OSVERSION>

// <OUTERHTML>
function JSB_BF_OUTERHTML(_Html, Tagname) {
    var Si = undefined;
    var I1 = undefined;
    var I = undefined;
    var J = undefined;

    Si = InStr1(1, _Html, '\<' + CStr(Tagname));
    if (!Si) return undefined;
    I1 = InStr1(Si, _Html, '/\>');
    I = InStr1(Si, _Html, '\>');
    if (I1 > 0 && I1 < I) return Mid1(_Html, Si, I1 - Si + 2);
    if (!I) return (Alert('html Element error ' + CStr(Tagname)) ? undefined : undefined);
    J = InStr1(I, _Html, '\</' + CStr(Tagname));
    if (!J) return (Alert('html Element error ' + CStr(Tagname)) ? undefined : undefined);
    J = InStr1(J, _Html, '\>');
    if (!J) return (Alert('html Element error ' + CStr(Tagname)) ? undefined : undefined);

    return Mid1(_Html, Si, J - Si + 1);
}
// </OUTERHTML>

// <PAGENAME>
async function JSB_BF_PAGENAME() {
    var Name = Field(JSB_BF_URL(), '/', DCount(JSB_BF_URL(), '/'));
    if (System(1) == 'js') {
        if (InStr1(1, Name, '#')) Name = Field(Name, '#', 2);
    } else {
        Name = Field(Name, '#', 1);
    }
    if (Left(Name, 1) == '?') Name = (Field(Field(Mid1(Name, 2), '&', 1), ' ', 1)); else Name = Field(Name, '?', 1);
    if (!Name || Field(LCase(Name), '.', 1) == 'tcl') Name = jsbAccount();
    return LCase(Name);
}
// </PAGENAME>

// <PARAMVAR>
function JSB_BF_PARAMVAR(Keyname, Indx) {
    // Name get 1st place
    var A = JSB_BF_QUERYVAR(CStr(Keyname));
    if (!isNothing(A)) return A;

    if (isPostBack()) {
        A = FORMVAR(Keyname);
        if (!isNothing(A)) return A;
    }

    if (!(Indx === undefined)) {
        A = JSB_BF_QUERYVAR('_p' + CStr(Indx));
        if (!isNothing(A)) return A;

        var Urlpathvars = JSB_BF_PARAMVARS();
        if (Null0(Indx) >= 1 && Null0(Indx) <= UBound(Urlpathvars)) return urlDecode(Field(Urlpathvars[Indx], '=', 2));
        if (isPostBack()) {
            A = FORMVAR('_p' + CStr(Indx));
            if (!isNothing(A)) return A;
        }
    }

    return GetCookie(Keyname);
}
// </PARAMVAR>

// <PARAMVARS>
function JSB_BF_PARAMVARS() {
    var U = At_Request.Url;
    if (InStr1(1, U, '?')) {
        U = Field(U, '?', 2);
        return Split(U, '&');
    }

    var Act = jsbRootAccount();
    U = Mid1(U, Len(Act) + 1);
    return Split(U, '/');
}
// </PARAMVARS>

// <PARSESELECT>
async function JSB_BF_PARSESELECT(Sentence, Defaulttop, ByRef_Top, ByRef_Columns, ByRef_Dictdata, ByRef_Fname, ByRef_Filterby, ByRef_Orderby, ByRef__Options, ByRef_Allitems, ByRef_F_File, Parsecolumnnames, Ignorefilenotfound, ByRef_Headercolumns, setByRefValues) {
    // local variables
    var Pk, Nfilterby;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Top, ByRef_Columns, ByRef_Dictdata, ByRef_Fname, ByRef_Filterby, ByRef_Orderby, ByRef__Options, ByRef_Allitems, ByRef_F_File, ByRef_Headercolumns)
        return v
    }
    var tokens = undefined;
    var Stokens = undefined;
    var Sqlsplit = undefined;
    var Ss = undefined;
    var Primarykeys = undefined;
    var Validcolumns = undefined;
    var Sqlcolumnbracketsok = undefined;
    var Inmiddle = undefined;
    var Dictdef = undefined;
    var Allprimarykeys = undefined;
    var Foundit = undefined;
    var I = undefined;
    var Infunction = undefined;
    var J = undefined;
    var Ci = undefined;
    var Sqlformat = undefined;
    var Didrefresh = undefined;
    var Pgmname = '';
    var C = '';
    var Token = '';
    var Ltoken = '';
    var Iname = '';
    var Lfname = '';
    var Alwaysok = '';
    var Oktostart = '';
    var Okinmiddle = '';
    var Cname = '';
    var Lcname = '';
    var Nc = '';
    var Test = '';
    var Ans = '';
    var Columnname = '';
    var Headercolumn = '';
    var Tk = '';
    var Cname2 = '';
    var Itemid = '';
    var Litemid = '';
    var Herr = '';
    var Operators = undefined;
    var Fd_File = undefined;
    var Cdef = undefined;
    var S = undefined;

    S = LTrim(Change(Sentence, Chr(160), Chr(32)));
    Pgmname = Field(S, ' ', 1, true);
    S = LTrim(Mid1(S, activeProcess.Col2 + 1));
    ByRef_Columns = [undefined,];

    // Drop ! debugging
    for (I = Len(S); I >= 1; I--) {
        C = Mid1(S, I, 1);
        if (C == '\'' || C == '"') break;
        if (C == '(') {
            ByRef__Options = UCase(Mid1(S, I + 1));
            ByRef__Options = Change(ByRef__Options, '!', '');
            S = RTrim(Left(S, I - 1));
            break;
        }
    }

    ByRef_Allitems = false;

    ByRef_Top = Defaulttop;
    ByRef_Dictdata = '';
    S = LTrim(RTrim(S));

    // First split on spaces to get the filename (which may be something like ./dir/ or .\dir\ )
    Stokens = Split(S, ',', 4);
    Stokens = Split(Join(Stokens, ', '), ' ', 4); // On Spaces (Ignoring Inner Strings)

    Sqlcolumnbracketsok = false;
    Sqlformat = false;
    tokens = [undefined,];
    I = LBound(Stokens) - 1;
    for (Token of iterateOver(Stokens)) {
        I++;
        Ltoken = LCase(Token);
        if (Ltoken == 'from') Sqlformat = true;
        if (Ltoken == 'where') Sqlcolumnbracketsok = true;
        if (Ltoken == 'as') {
            I++;
            tokens[UBound1(tokens)] = tokens[UBound(tokens)] + ' as ' + CStr(Stokens[I]);
            Ltoken = '';
        }
        if (Trim(Ltoken)) tokens[tokens.length] = Token;
    }
    Sqlcolumnbracketsok = (Sqlcolumnbracketsok || Sqlformat);

    // Parse out Column Names and FileName

    while (true) {
        ByRef_Fname = tokens[1];
        if (Right(ByRef_Fname, 1) == ',') ByRef_Fname = Left(ByRef_Fname, Len(ByRef_Fname) - 1);
        if (Len(tokens)) tokens.Delete(1);
        Iname = ByRef_Fname;
        Lfname = LCase(ByRef_Fname);

        if (Not(Lfname == 'top' || Lfname == '*' || Lfname == 'dict' || Lfname == 'data' || Sqlformat || Lfname == 'only')) break;
        if (Lfname == 'top') {
            ByRef_Top = Lfname + ' ' + CStr(tokens[1]);
            tokens.Delete(1);
        } else if (Lfname == '*' && Sqlformat) {
            ByRef_Columns = [undefined, '*'];
            Sqlcolumnbracketsok = false;;
        } else if (Lfname == 'dict') {
            ByRef_Dictdata = 'dict';;
        } else if (Lfname == 'data') {
            ByRef_Dictdata = '';;
        } else if (Lfname == 'only') {
            // throw it away ;
        } else if (Lfname == 'from') {
            Sqlcolumnbracketsok = false;;
        } else if (!Lfname && Len(tokens)) {
            // Skip space;
        } else if (!Lfname || Lfname == 'where' || Lfname == 'with' || Lfname == 'order' || Lfname == 'orderby' || Lfname == 'by' || Lfname == 'by-dsnd') {
            if (UBound(ByRef_Columns) >= 1) {
                ByRef_Fname = ByRef_Columns[1];
                ByRef_Columns.Delete(1);
                break;
            } else {
                activeProcess.At_Errors = 'no filename given';
                clearSelect(odbActiveSelectList);
                return exit(false);
            }
        } else if (Sqlcolumnbracketsok) {
            if (Left(ByRef_Fname, 1) == '[') {

                while (Not(Len(tokens) == 0 || InStr1(1, ByRef_Fname, ']'))) {
                    ByRef_Fname += ' ' + CStr(tokens[1]);
                    tokens.Delete(1)
                }
            }

            ByRef_Columns[ByRef_Columns.length] = ByRef_Fname;;
        } else {
            // assumed filename
            if (Left(ByRef_Fname, 1) != '[') break;
            if (InStr1(1, ByRef_Fname, ']')) break;
            if (!Len(tokens)) break;

            tokens[1] = ByRef_Fname + ' ' + CStr(tokens[1]);
        }
    }

    if (Left(ByRef_Fname, 1) == '[' && Right(ByRef_Fname, 1) == ']') {
        ByRef_Fname = Mid1(ByRef_Fname, 2, Len(ByRef_Fname) - 2);;
    } else if (Left(ByRef_Fname, 1) == '\'' && Right(ByRef_Fname, 1) == '\'') {
        ByRef_Fname = Mid1(ByRef_Fname, 2, Len(ByRef_Fname) - 2);;
    } else if (Left(ByRef_Fname, 1) == '"' && Right(ByRef_Fname, 1) == '"') {
        ByRef_Fname = Mid1(ByRef_Fname, 2, Len(ByRef_Fname) - 2);
    }

    // Put what wasn't a column name of filename back together
    S = LTrim(RTrim(Join(tokens, ' ')));

    // Allow special characters in identifiers if not parsing column names
    Alwaysok = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
    Oktostart = Alwaysok + '[';
    Okinmiddle = Alwaysok;

    if (!Parsecolumnnames) {
        Oktostart += '!@#$%*-_=+.:';
        Okinmiddle += '!@#$%*-_=+.:';
    }

    tokens = [undefined,];
    Inmiddle = false;
    S = Join(Split(S, ' ', 4), '  '); // Put Two Space Between Identifiers
    if (Sqlformat) Sqlsplit = Split(S, '', 5); else Sqlsplit = Split(S, ' ', 4);
    Infunction = 0;

    for (Token of iterateOver(Sqlsplit)) {
        Token = LTrim(RTrim(Token));

        if (!Token) {
            Inmiddle = false;;
        } else if (Infunction) {
            tokens[UBound1(tokens)] = tokens[UBound(tokens)] + Token;
            if (Token == ')') Infunction--;
            Inmiddle = false;;
        } else if (Right(Token, 1) == '(' && Len(Token) > 1) {
            // Function
            Infunction++;
            tokens[tokens.length] = Token;;
        } else if (!Inmiddle && InStr1(1, Oktostart, Left(Token, 1))) {
            tokens[tokens.length] = Token;
            Inmiddle = true;;
        } else if (Token == '!') {
            if (Inmiddle) tokens[UBound1(tokens)] = tokens[UBound(tokens)] + Token; else tokens[tokens.length] = Token;
            Inmiddle = true;;
        } else if (Token == ']' && Inmiddle) {
            tokens[UBound1(tokens)] = tokens[UBound(tokens)] + Token;
            Inmiddle = false;;
        } else if (Inmiddle && InStr1(1, Okinmiddle, Left(Token, 1))) {
            tokens[UBound1(tokens)] = tokens[UBound(tokens)] + Token;;
        } else {
            tokens[tokens.length] = Token;
            Inmiddle = false;
        }
    }

    // I use [ and ] as wild cards, so put them inside of quotes '[xxxx' or '[xxx]'
    // but sql uses these to inclose column names, so change [xxx] to 'xxx'

    // check [some name] spread across multiple tokens
    // if SqlFormat then [id id] is a 'id id', else if PickForm, [id id] is '[item' or 'id]'

    I = 1;

    while (I <= UBound(tokens)) {
        Token = tokens[I];

        if (Sqlformat) {
            if (Left(Token, 1) == '[') {
                Token = '\'' + Mid1(Token, 2);
            }
            if (Right(Token, 1) == ']') {
                Token = Left(Token, Len(Token) - 1) + '\'';
            }
        } else {
            if (Left(Token, 1) == '[') {
                if (Right(Token, 1) == ']') {
                    tokens[I] = '\'' + Token + '\'';
                } else {
                    Ss = Split(Mid1(Token, 2), ' ', 4);
                    tokens[I] = '\'[' + CStr(Ss[1]) + '\'';
                    var _ForEndI_42 = Len(Ss);
                    for (J = 2; J <= _ForEndI_42; J++) {
                        tokens.Insert(I + J - 1, '\'' + CStr(Ss[J]) + '\'');
                    }
                }
            } else if (Right(Token, 1) == ']') {
                tokens[I] = '\'' + Token + '\'';
            }
        }
        I++;
    }

    // Open
    if (!ByRef_Fname) {
        ByRef_F_File = undefined;
        Fd_File = undefined;

        if (!Ignorefilenotfound) {
            clearSelect(odbActiveSelectList);
            activeProcess.At_Errors = '';
            return exit(false);
        }
    } else {
        if (await JSB_ODB_OPEN(ByRef_Dictdata, ByRef_Fname, ByRef_F_File, function (_ByRef_F_File) { ByRef_F_File = _ByRef_F_File })) {
            if (await JSB_ODB_OPEN('DICT', ByRef_Fname, Fd_File, function (_Fd_File) { Fd_File = _Fd_File })); else Fd_File = undefined;
        } else {
            ByRef_F_File = undefined;
            Fd_File = undefined;

            if (!Ignorefilenotfound) {
                Herr = activeProcess.At_Errors;
                if (Not(Herr)) Herr = 'File not found: ' + ByRef_Fname;
                clearSelect(odbActiveSelectList);
                activeProcess.At_Errors = Herr;
                return exit(false);
            }
        }
    }

    // Build list of Pick columns upto With or End of String
    Primarykeys = [undefined,];
    if (!Sqlformat && Parsecolumnnames) {
        Didrefresh = false;
        Validcolumns = [undefined,];
        // May see column list up to 1st with clause or operator 
        ByRef_Columns = [undefined,];

        while (true) {
            Cname = tokens[1];
            Lcname = LCase(Cname);
            C = Left(Cname, 1);
            Nc = Left(tokens[2], 1);

            if (InStr1(1, ' =\>\<', C) > 1 || InStr1(1, ' =\>\<', Nc) > 1 || !C || InStr1(1, Lcname, '[') || InStr1(1, Lcname, ']') || Lcname == 'like' || LCase(Nc) == 'like' || Lcname == 'with' || Lcname == 'where' || Lcname == 'order' || Lcname == 'orderby' || Lcname == 'by') break;
            if (Left(Cname, 1) == '\'' && Right(Cname, 1) == '\'') {
                Cname = Mid1(Cname, 2, Len(Cname) - 2);;
            } else if (Left(Cname, 1) == '"' && Right(Cname, 1) == '"') {
                Cname = Mid1(Cname, 2, Len(Cname) - 2);
            }

            if (Left(Lcname, 2) == '*a' || Lcname == 'itemid' || Lcname == 'itemcontent') {
                ByRef_Columns[ByRef_Columns.length] = Cname;;
            } else if (tokens[1] == '*') {
                Primarykeys = clone(ByRef_Columns); // Any Columns So Far Are Itemid's (as in list itemid1, itemid2, *)
                ByRef_Columns = [undefined, '*'];
                break;;
            } else if (Len(Primarykeys)) {
                Primarykeys[Primarykeys.length] = Cname; // Lcname;
            } else if (Len(ByRef_Columns)) {
                ByRef_Columns[ByRef_Columns.length] = Cname; // Lcname;
            } else {
                // is this cname an ItemID or a ColumnName?
                if (await JSB_ODB_READ(Test, ByRef_F_File, Cname, function (_Test) { Test = _Test })) {
                    Primarykeys[Primarykeys.length] = Cname; // Lcname;
                } else {
                    Dictdef = false;
                    if (CBool(Fd_File)) { if (await JSB_ODB_READ(Test, Fd_File, Cname, function (_Test) { Test = _Test })) Dictdef = true; }

                    if (Dictdef) {
                        ByRef_Columns[ByRef_Columns.length] = Cname; // Lcname;
                    } else {
                        if (Len(Validcolumns) == 0) Validcolumns = await JSB_BF_GETTABLECOLUMNDEFS(ByRef_Fname, CStr(true), false);
                        Foundit = false;
                        for (Cdef of iterateOver(Validcolumns)) {
                            if (LCase(Cdef.name) == Lcname) {
                                Foundit = true;
                                Cname = Cdef.name;
                                Lcname = LCase(Cname);
                            }
                        }

                        if (!Foundit && Didrefresh == false) {
                            Didrefresh = true;
                            Validcolumns = await JSB_BF_GETTABLECOLUMNDEFS(ByRef_Fname, CStr(true), true);
                            for (Cdef of iterateOver(Validcolumns)) {
                                if (LCase(Cdef.name) == Lcname) Foundit = true;
                            }
                        }

                        if (Foundit) {
                            ByRef_Columns[ByRef_Columns.length] = Cname; // Lcname;
                        } else {
                            Ans = await JSB_BF_MSGBOX('Parsing Error', 'I don\'t know what ' + Cname + ' is.  Is it a Column Name or an ItemID?', 'Column Name,ItemID');
                            if (Ans == Chr(27) || !Ans) return Stop();
                            if (Ans == 'ItemID') Primarykeys[Primarykeys.length] = Lcname; else ByRef_Columns[ByRef_Columns.length] = Lcname;
                        }
                    }
                }
            }

            tokens.Delete(1)
        }
    }

    // Get the best possible names for the columns given and replace *A{n} where possible in Columns
    // headerColumns = Join(Clone(Columns), ", ")
    ByRef_Headercolumns = [undefined,];
    Ci = LBound(ByRef_Columns) - 1;
    for (Columnname of iterateOver(ByRef_Columns)) {
        Ci++;
        if (InStr1(1, Columnname, ' as ')) {
            ByRef_Columns[Ci] = dropRight(CStr(Columnname), ' as ');
            Headercolumn = dropLeft(CStr(Columnname), ' as ');
            if ((Left(Headercolumn, 1) == '\'' && Right(Headercolumn, 1) == '\'') || (Left(Headercolumn, 1) == '"' && Right(Headercolumn, 1) == '"')) {
                Headercolumn = Mid1(Headercolumn, 2, Len(Headercolumn) - 2);
            }
            ByRef_Headercolumns[ByRef_Headercolumns.length] = Headercolumn;
        } else {
            ByRef_Headercolumns[ByRef_Headercolumns.length] = Columnname;
            if (await JSB_ODB_READ(Cdef, Fd_File, CStr(Columnname), function (_Cdef) { Cdef = _Cdef })) {
                if (InStr1(1, ' AaSs', Extract(Cdef, 1, 0, 0)) > 1) {
                    if (isNumber(Extract(Cdef, 2, 0, 0)) && Len(Extract(Cdef, 2, 0, 0))) ByRef_Columns[Ci] = '*A' + Extract(Cdef, 2, 0, 0);
                    if (Extract(Cdef, 3, 0, 0)) ByRef_Headercolumns[Ci] = Extract(Cdef, 3, 0, 0);
                }
            }
        }
    }

    Allprimarykeys = true;

    if (Parsecolumnnames) {
        // Add +,-,*,%,/
        Operators = Split('+,-,*,%,/,!=,=,\<,\>,\<=,\>=,\<\>,:,#,like,gt,lt,ge,le,ne,eq,in', ',');
    } else {
        Operators = Split('!=,=,\<,\>,\<=,\>=,\<\>,:,#,like,gt,lt,ge,le,ne,eq,in', ',');
    }

    // Remainder is Where Clause
    Tk = LCase(tokens[1]);

    if (Tk == 'order' || Tk == 'orderby' || Tk == 'by' || Tk == 'by-dsnd') {
        ByRef_Orderby = await JSB_BF_PARSESELECT_ORDER(Fd_File, tokens, Operators, function (_Fd_File, _tokens, _Operators) { Fd_File = _Fd_File; tokens = _tokens; Operators = _Operators });
        Tk = LCase(tokens[1]);
    }

    if (Tk == 'with' && Len(tokens) > 1) {
        tokens.Delete(1);
    } else if (Tk == 'where' && Len(tokens) > 1) {
        tokens.Delete(1);
        Sqlformat = true;;
    } else if (InStr1(1, Tk, '[') || InStr1(1, Tk, ']') || InStr1(1, Tk, '%') || InStr1(1, Tk, '...') || Tk == '*'); else if (!Parsecolumnnames) {
        if (!(InStr1(1, ' ' + Join(tokens, ' '), ' by '))) {
            if (Locate(Tk, Operators, 0, 0, 0, "", position => { })); else {
                Cname2 = LCase(tokens[2]);
                if (Locate(Cname2, Operators, 0, 0, 0, "", position => { })); else {
                    // list of item id's
                    for (Itemid of iterateOver(tokens)) {
                        Litemid = LCase(Itemid);
                        if (Litemid == 'order' || Litemid == 'by') {
                            Allprimarykeys = false;
                            break;
                        }

                        if (Left(Itemid, 1) == '\'' && Right(Itemid, 1) == '\'') {
                            Itemid = Mid1(Itemid, 2, Len(Itemid) - 2);
                        } else if (Left(Itemid, 1) == '"' && Right(Itemid, 1) == '"') {
                            Itemid = Mid1(Itemid, 2, Len(Itemid) - 2);
                        }
                        Primarykeys[Primarykeys.length] = Itemid;
                    }
                    tokens = [undefined,];
                }
            }
        }
    }

    ByRef_Filterby = '';
    if (tokens[1] == '*') {
        ByRef_Allitems = true;
        tokens.Delete(1);
        Allprimarykeys = false;
        if (CBool(System(11))) clearSelect(odbActiveSelectList);
    } else if (Len(Primarykeys)) {
        for (Pk of iterateOver(Primarykeys)) {
            if (Len(ByRef_Filterby)) ByRef_Filterby += ' Or ';
            ByRef_Filterby += 'ItemId = \'' + CStr(Pk) + '\'';
        }

        Nfilterby = await JSB_BF_PARSESELECT_FILTER(Fd_File, tokens, Operators, Allprimarykeys, Primarykeys, function (_Fd_File, _tokens, _Operators, _Allprimarykeys, _Primarykeys) { Fd_File = _Fd_File; tokens = _tokens; Operators = _Operators; Allprimarykeys = _Allprimarykeys; Primarykeys = _Primarykeys });
        if (Len(Nfilterby)) ByRef_Filterby += ' Or ' + CStr(Nfilterby);
    } else {
        ByRef_Filterby = await JSB_BF_PARSESELECT_FILTER(Fd_File, tokens, Operators, Allprimarykeys, Primarykeys, function (_Fd_File, _tokens, _Operators, _Allprimarykeys, _Primarykeys) { Fd_File = _Fd_File; tokens = _tokens; Operators = _Operators; Allprimarykeys = _Allprimarykeys; Primarykeys = _Primarykeys });
    }

    Tk = LCase(tokens[1]);
    if (Tk == 'order' || Tk == 'by' || Tk == 'by-dsnd') { ByRef_Orderby = await JSB_BF_PARSESELECT_ORDER(Fd_File, tokens, Operators, function (_Fd_File, _tokens, _Operators) { Fd_File = _Fd_File; tokens = _tokens; Operators = _Operators }); }

    if (Allprimarykeys && Len(Primarykeys)) {
        clearSelect(odbActiveSelectList);
        odbActiveSelectList = formList(Primarykeys);
        ByRef_Filterby = '';
        if (ByRef_Orderby) Println('You have given me an explict list.  The order by clause will be ignored');
    }

    if (Not(isAdmin())) {
        if (await JSB_BF_ISRESTRICTEDFILE(ByRef_Dictdata, ByRef_Fname)) return Stop('You must be an admin to run this command');
    }

    if (ByRef_Orderby) ByRef_Orderby = Left(' ', Len(ByRef_Filterby)) + 'Order By ' + ByRef_Orderby;
    return exit(true);
}
// </PARSESELECT>

// <PARSESELECT_Pgm>
async function JSB_BF_PARSESELECT_Pgm() {  // PROGRAM
    Commons_JSB_BF = {};
    Equates_JSB_BF = {};

    await JSB_BF_PARSESELECT_Sub();
    return;
}
// </PARSESELECT_Pgm>

// <PARSESELECT_Sub>
async function JSB_BF_PARSESELECT_Sub() {
    // local variables
    var Lsent, Pgm, Opts, Parsecolumnnames, Defaulttop, Top, Columns;
    var Dictdata, Tablename, Filterby, Orderby, _Options, Allitems;
    var F_File, Headercolumns, I, Id;

    Lsent = LCase(LTrim(Change(activeProcess.At_Sentence, Chr(160), Chr(32))));
    Pgm = Field(Lsent, ' ', 1, true);
    if (InStr1(1, Lsent, '(!')) Opts = Field(Lsent, '(!', Count(Lsent, '(!') + 1, true);

    Parsecolumnnames = (InStr1(1, Opts, 'c') || Pgm == 'list' || Pgm == 'l' || Pgm == 'sort');
    Defaulttop = '';

    Print(); debugger;
    if (!(await JSB_BF_PARSESELECT(CStr(Lsent), CStr(Defaulttop), Top, Columns, Dictdata, Tablename, Filterby, Orderby, _Options, Allitems, F_File, +Parsecolumnnames, true, Headercolumns, function (_Top, _Columns, _Dictdata, _Tablename, _Filterby, _Orderby, __Options, _Allitems, _F_File, _Headercolumns) { Top = _Top; Columns = _Columns; Dictdata = _Dictdata; Tablename = _Tablename; Filterby = _Filterby; Orderby = _Orderby; _Options = __Options; Allitems = _Allitems; F_File = _F_File; Headercolumns = _Headercolumns }))) return Stop(activeProcess.At_Errors);
    Println('top:', Top);
    Println('Columns [', Join(Columns, ','), ']');
    Println('dict:', Dictdata);
    Println('tableName: ', Dictdata, ' "', Tablename, '"');
    Println('FilterBy:', Filterby);
    Println('OrderBY:', Orderby);
    Println('Options:', _Options);
    Println('AllItems:', Allitems);
    Println('headerColumns [', Join(Headercolumns, ','), ']');
    Println('Active Select: ', System(11));
    if (CBool(System(11))) {
        for (I = 1; I <= 5; I++) {
            Id = readNext(odbActiveSelectList).itemid;
            if (CBool(Id)); else return Stop();
            Println('readnext ', Id);
        }
    }

}
// </PARSESELECT_Sub>

// <PARSESELECT_EXPR>
async function JSB_BF_PARSESELECT_EXPR(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, ByRef_Lastoperator, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, ByRef_Lastoperator)
        return v
    }
    var Hadquotes = undefined;
    var Tk = '';
    var Gstart = '';
    var Gend = '';
    var Exprs = '';
    var _Expr = '';
    var Lr = '';
    var Atrrec = '';
    var Le = '';
    var E = '';
    var Conv = '';

    Tk = LCase(ByRef_Tokens[1]);
    ByRef_Lastoperator = '';

    if (Tk == '(' || Tk == '[') {
        // Grouping
        Gstart = Tk;
        if (Gstart == '(') Gend = ')'; else Gend = ']';

        Exprs = '(';
        ByRef_Tokens.Delete(1);


        while (true) {
            _Expr = await JSB_BF_PARSESELECT_TERM(ByRef_Tokens, ByRef_Operators, function (_ByRef_Tokens, _ByRef_Operators) { ByRef_Tokens = _ByRef_Tokens; ByRef_Operators = _ByRef_Operators });
            Exprs += _Expr;
            if (Not(ByRef_Tokens[1] == ',')) break;
            ByRef_Tokens.Delete(1);
            Exprs += ', ';
        }

        Tk = LCase(ByRef_Tokens[1]);

        Exprs += ')'; ByRef_Lastoperator = Gend;
        if (Tk != ')' && Tk != Gend) return Stop('missing ', Gend);
        ByRef_Tokens.Delete(1);
    } else if (Right(Tk, 1) == '(') {
        // function?
        Exprs = Tk;
        ByRef_Tokens.Delete(1);


        while (true) {
            E = await JSB_BF_PARSESELECT_EXPR(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, '', function (_ByRef_Fd_File, _ByRef_Tokens, _ByRef_Operators, _P4) { ByRef_Fd_File = _ByRef_Fd_File; ByRef_Tokens = _ByRef_Tokens; ByRef_Operators = _ByRef_Operators });
            if (E) Exprs += E;
            Tk = LCase(ByRef_Tokens[1]);
            if (Not(Tk == ',')) break;
            Exprs += ', ';
            ByRef_Tokens.Delete(1)
        }

        Exprs += ')'; ByRef_Lastoperator = ')';
        if (Tk != ')') return Stop('missing )');
        ByRef_Tokens.Delete(1);
    } else {
        Exprs = await JSB_BF_PARSESELECT_TERM(ByRef_Tokens, ByRef_Operators, function (_ByRef_Tokens, _ByRef_Operators) { ByRef_Tokens = _ByRef_Tokens; ByRef_Operators = _ByRef_Operators });
        if (!Exprs) return exit('');

        // Make srue column names are using "
        if (Left(Exprs, 1) == '\'' && Right(Exprs, 1) == '\'') Exprs = '"' + Change(Mid1(Exprs, 2, Len(Exprs) - 2), '"', '\\"') + '"';

        // Is this a columnName?  And if so, do we need to check for an input conversion?
        Conv = undefined;
        Lr = 'L';
        if (CBool(ByRef_Fd_File)) {
            if (await JSB_ODB_READ(Atrrec, ByRef_Fd_File, Exprs, function (_Atrrec) { Atrrec = _Atrrec })) {
                if (InStr1(1, 'asAS', Extract(Atrrec, 1, 0, 0))) {
                    if (isNumber(Extract(Atrrec, 2, 0, 0))) Exprs = '*A' + Extract(Atrrec, 2, 0, 0);
                    Conv = Extract(Atrrec, 8, 0, 0);
                    Lr = UCase(Extract(Atrrec, 9, 0, 0));
                } else {
                    Conv = undefined;
                }
            }
        }
    }


    while (true) {
        Tk = LCase(ByRef_Tokens[1]);
        if (Tk == 'not' && LCase(ByRef_Tokens[2]) == 'like') {
            ByRef_Tokens.Delete(1);
            Tk = 'not like';
        } else {
            if (Locate(Tk, ByRef_Operators, 0, 0, 0, "", position => { })); else break;
        }

        if (Not(Tk)) break;
        if (Tk == '!=' || Tk == '#') Tk = '\<\>';
        ByRef_Lastoperator = Tk;
        ByRef_Tokens.Delete(1);
        E = await JSB_BF_PARSESELECT_EXPR(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, '', function (_ByRef_Fd_File, _ByRef_Tokens, _ByRef_Operators, _P4) { ByRef_Fd_File = _ByRef_Fd_File; ByRef_Tokens = _ByRef_Tokens; ByRef_Operators = _ByRef_Operators });
        if (!E) return Stop('missing term');
        Hadquotes = (Left(E, 1) == '\'' && Right(E, 1) == '\'');
        if (!Hadquotes) Hadquotes = (Left(E, 1) == '"' && Right(E, 1) == '"');

        if (Hadquotes) E = Mid1(E, 2, Len(E) - 2);
        if (Conv) E = await JSB_BF_IOCONV('I', E, Conv, Lr);

        Le = LCase(E);
        if (!Le) {
            E = '\'\'';;
        } else if (Le == 'false' || Le == 'true' || Le == 'null') {
            E = LCase(E);;
        } else if (isNumber(E) && !Hadquotes) {
            E = E;;
        } else if (ByRef_Lastoperator == 'in' && (Left(Le, 1) == '(' || Left(Le, 1) == '[')) {
            if (Left(E, 1) == '[' && Right(E, 1) == ']') E = '(' + Mid1(E, 2, Len(E) - 2) + ')';
        } else {

            E = '\'' + E + '\'';

            E = Change(E, '[', '%');
            E = Change(E, ']', '%');

            if (InStr1(1, E, '%')) {
                if (ByRef_Lastoperator == '=') ByRef_Lastoperator = 'like';
                if (ByRef_Lastoperator == '\<\>') ByRef_Lastoperator = 'notlike';
            }
        }

        Exprs += ' ' + ByRef_Lastoperator + ' ' + E;
    }

    return exit(Exprs);
}
// </PARSESELECT_EXPR>

// <PARSESELECT_FILTER>
async function JSB_BF_PARSESELECT_FILTER(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, ByRef_Allprimarykeys, ByRef_Primarykeys, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, ByRef_Allprimarykeys, ByRef_Primarykeys)
        return v
    }
    var Filterby = '';
    var Tk = '';
    var Nt = '';
    var Conjunction = '';

    Filterby = await JSB_BF_PARSESELECT_WEXPR(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, ByRef_Allprimarykeys, ByRef_Primarykeys, function (_ByRef_Fd_File, _ByRef_Tokens, _ByRef_Operators, _ByRef_Allprimarykeys, _ByRef_Primarykeys) { ByRef_Fd_File = _ByRef_Fd_File; ByRef_Tokens = _ByRef_Tokens; ByRef_Operators = _ByRef_Operators; ByRef_Allprimarykeys = _ByRef_Allprimarykeys; ByRef_Primarykeys = _ByRef_Primarykeys });
    if (!Filterby) return exit('');


    while (true) {
        Tk = LCase(ByRef_Tokens[1]);
        if (Not(Tk && Tk != ')')) break;
        Conjunction = '';

        if (Tk == '&&' || Tk == 'and') {
            Conjunction = ' and '; ByRef_Tokens.Delete(1); Tk = LCase(ByRef_Tokens[1]);
        } else if (Tk == '||' || Tk == 'or') {
            Conjunction = ' or '; ByRef_Tokens.Delete(1); Tk = LCase(ByRef_Tokens[1]);
        }

        if (Tk == 'with' || Tk == 'where') {
            ByRef_Tokens.Delete(1); Tk = LCase(ByRef_Tokens[1]);
            if (Not(Conjunction)) Conjunction = ' and ';
        } else {
            if (Not(Conjunction)) Conjunction = ' or ';
        }

        Nt = await JSB_BF_PARSESELECT_WEXPR(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, ByRef_Allprimarykeys, ByRef_Primarykeys, function (_ByRef_Fd_File, _ByRef_Tokens, _ByRef_Operators, _ByRef_Allprimarykeys, _ByRef_Primarykeys) { ByRef_Fd_File = _ByRef_Fd_File; ByRef_Tokens = _ByRef_Tokens; ByRef_Operators = _ByRef_Operators; ByRef_Allprimarykeys = _ByRef_Allprimarykeys; ByRef_Primarykeys = _ByRef_Primarykeys });
        if (!Nt) return exit(Filterby);

        Filterby += Conjunction + Nt;
    }

    return exit(Filterby);
}
// </PARSESELECT_FILTER>

// <PARSESELECT_ORDER>
async function JSB_BF_PARSESELECT_ORDER(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators)
        return v
    }
    var Isdescendng = undefined;
    var Tk = '';
    var Orderby = '';
    var Exprs = '';

    Tk = LCase(ByRef_Tokens[1]);
    if (Tk == 'order') { ByRef_Tokens.Delete(1); Tk = LCase(ByRef_Tokens[1]); }
    Orderby = '';

    if (Tk == 'by' || Tk == 'orderby' || Tk == 'by-dsnd') {
        Isdescendng = Tk == 'by-dsnd';
        ByRef_Tokens.Delete(1);

        Exprs = await JSB_BF_PARSESELECT_EXPR(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, '', function (_ByRef_Fd_File, _ByRef_Tokens, _ByRef_Operators, _P4) { ByRef_Fd_File = _ByRef_Fd_File; ByRef_Tokens = _ByRef_Tokens; ByRef_Operators = _ByRef_Operators });
        if (!Exprs) return exit('');

        Tk = LCase(ByRef_Tokens[1]);
        if (Tk == 'asc') { ByRef_Tokens.Delete(1); Tk = LCase(ByRef_Tokens[1]); }
        if (Tk == 'desc') { ByRef_Tokens.Delete(1); Tk = LCase(ByRef_Tokens[1]); Isdescendng = true; }

        Orderby = Exprs;
        if (Isdescendng) Orderby += ' desc';


        while (true) {
            Tk = LCase(ByRef_Tokens[1]);
            if (Tk == ',') { ByRef_Tokens.Delete(1); Tk = LCase(ByRef_Tokens[1]); }

            if (Not(Tk && Tk != 'where')) break;
            Isdescendng = false;
            if (Tk == 'by' || Tk == 'by-dsnd') {
                Isdescendng = Tk == 'by-dsnd';
                ByRef_Tokens.Delete(1);
            }

            Exprs = await JSB_BF_PARSESELECT_EXPR(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, '', function (_ByRef_Fd_File, _ByRef_Tokens, _ByRef_Operators, _P4) { ByRef_Fd_File = _ByRef_Fd_File; ByRef_Tokens = _ByRef_Tokens; ByRef_Operators = _ByRef_Operators });
            if (!Exprs) return exit(Orderby);

            Tk = LCase(ByRef_Tokens[1]);
            if (Tk == 'asc') { ByRef_Tokens.Delete(1); Tk = LCase(ByRef_Tokens[1]); }
            if (Tk == 'desc') { ByRef_Tokens.Delete(1); Tk = LCase(ByRef_Tokens[1]); Isdescendng = true; }

            Orderby += ', ' + Exprs;
            if (Isdescendng) Orderby += ' desc'
        }
    }

    return exit(Orderby);
}
// </PARSESELECT_ORDER>

// <PARSESELECT_TERM>
async function JSB_BF_PARSESELECT_TERM(ByRef_Tokens, ByRef_Operators, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tokens, ByRef_Operators)
        return v
    }
    var Token = '';
    var Tk = '';
    var Nk = '';

    if (!UBound(ByRef_Tokens)) return exit('');
    Token = RTrim(LTrim(ByRef_Tokens[1]));
    Tk = LCase(Token);
    Nk = LCase(ByRef_Tokens[2]);

    if (Tk == 'by' || Tk == 'by-dsnd' || Tk == 'and' || Tk == 'or' || Tk == 'with' || Tk == 'where' || (Tk == 'order' && Nk == 'by') || (Tk == 'sort' && Nk == 'by') || Tk == 'asc' || Tk == 'desc') return exit('');
    if (Right(Tk, 1) == '(') return exit('');

    ByRef_Tokens.Delete(1);
    return exit(Token);
}
// </PARSESELECT_TERM>

// <PARSESELECT_WEXPR>
async function JSB_BF_PARSESELECT_WEXPR(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, ByRef_Allprimarykeys, ByRef_Primarykeys, setByRefValues) {
    // local variables
    var Ntk, Term;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, ByRef_Allprimarykeys, ByRef_Primarykeys)
        return v
    }
    var Token = '';
    var Tk = '';
    var Op = '';
    var Lastop = '';
    var Wexprs = '';

    // id = expr ?  (2nd arg is an operator)
    Ntk = LCase(ByRef_Tokens[2]);
    if (Locate(Ntk, ByRef_Operators, 0, 0, 0, "", position => { })) {
        return exit(await JSB_BF_PARSESELECT_EXPR(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, Lastop, function (_ByRef_Fd_File, _ByRef_Tokens, _ByRef_Operators, _Lastop) { ByRef_Fd_File = _ByRef_Fd_File; ByRef_Tokens = _ByRef_Tokens; ByRef_Operators = _ByRef_Operators; Lastop = _Lastop }));
    }

    // 1st arg an operator?
    Term = ByRef_Tokens[1];

    // implied ItemId and operator?
    if (Left(Term, 1) == '\'' || Left(Term, 1) == '"') {
        if (Mid1(Term, 2, 3) == '...') Term = Left(Term, 1) + '[' + Mid1(Term, 5);
        if (Mid1(Term, Len(Term) - 4, 3) == '...') Term = Left(Term, Len(Term) - 4) + ']' + Right(Term, 1);
        ByRef_Tokens.Delete(1);
        Op = '=';
    } else {
        // Implied ItemID?
        Op = LCase(Term);
        if (Locate(Op, ByRef_Operators, 0, 0, 0, "", position => { })); else { return exit(await JSB_BF_PARSESELECT_EXPR(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, Lastop, function (_ByRef_Fd_File, _ByRef_Tokens, _ByRef_Operators, _Lastop) { ByRef_Fd_File = _ByRef_Fd_File; ByRef_Tokens = _ByRef_Tokens; ByRef_Operators = _ByRef_Operators; Lastop = _Lastop })); }

        ByRef_Tokens.Delete(1);
        Term = await JSB_BF_PARSESELECT_EXPR(ByRef_Fd_File, ByRef_Tokens, ByRef_Operators, Lastop, function (_ByRef_Fd_File, _ByRef_Tokens, _ByRef_Operators, _Lastop) { ByRef_Fd_File = _ByRef_Fd_File; ByRef_Tokens = _ByRef_Tokens; ByRef_Operators = _ByRef_Operators; Lastop = _Lastop });
        if (isEmpty(Term)) return Stop('missing term');
    }

    // Put Term in quotes for ItemID
    if (Left(Term, 1) == '\'' && Right(Term, 1) == '\''); else {
        if (Left(Term, 1) == '"' && Right(Term, 1) == '"') {
            Term = '\'' + Change(Mid1(Term, 2, Len(Term) - 2), '\'', '\'\'') + '\'';
        } else {
            Term = '\'' + CStr(Term) + '\'';
        }
    }

    if (Op != 'in') {
        Term = Change(Term, '[', '%');
        Term = Change(Term, ']', '%');
        if (Op == '=' && InStr1(1, Term, '%')) Op = 'like';
        if (Op == '\<\>' && InStr1(1, Term, '%')) Op = 'notlike';
    }

    Wexprs = 'ItemID ' + Op + ' ' + CStr(Term);
    if (Lastop || Op != '=') ByRef_Allprimarykeys = false; else ByRef_Primarykeys[ByRef_Primarykeys.length] = Mid1(Term, 2, Len(Term) - 2);
    return exit(Wexprs);
}
// </PARSESELECT_WEXPR>

// <POPOUTWINDOW>
async function JSB_BF_POPOUTWINDOW(Title, Urlorhtml, Waitforanswer, Width, _Height, Putresultinid) {
    if (Urlorhtml === undefined) {
        Urlorhtml = Title;
        Title = '';
    }

    if (Waitforanswer) {
        var myResolve;
        var waitPromise = new Promise(resolve => myResolve = resolve);

        return popoutWindow(Title, Urlorhtml, Width, Height, function () {
            if (myResolve) myResolve()
        }, Putresultinid);
    } else {
        await popoutWindow(Title, Urlorhtml, Width, Height, null, Putresultinid);
    }
}
// </POPOUTWINDOW>

// <POPUP_JSONDEF>
async function JSB_BF_POPUP_JSONDEF(ByRef_Projectname, ByRef_Jsondeffilename, ByRef_Jsondef_Id, ByRef_Deltext, ByRef_Addtext, ByRef_Dataset, Popupheight, Popupwidth, Popuptitle, Asgrid, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Jsondeffilename, ByRef_Jsondef_Id, ByRef_Deltext, ByRef_Addtext, ByRef_Dataset)
        return v
    }
    var Fielddefinitions = undefined;

    if (CBool(isArray(ByRef_Jsondeffilename))) {
        Fielddefinitions = ByRef_Jsondeffilename;
    } else if (CBool(isArray(ByRef_Jsondef_Id))) {
        Fielddefinitions = ByRef_Jsondef_Id;
    } else {
        Fielddefinitions = await JSB_BF_READJSONDEFS(CStr(ByRef_Jsondeffilename), CStr(ByRef_Jsondef_Id));
    }

    return exit(await JSB_BF_POPUP_KNOCKOUT(ByRef_Projectname, Popuptitle, Fielddefinitions, CStr(ByRef_Deltext), CStr(ByRef_Addtext), ByRef_Dataset, CStr(Popupwidth), CStr(Popupheight), !Asgrid, undefined, undefined, undefined, function (_ByRef_Projectname, _Popuptitle, _Fielddefinitions, _ByRef_Dataset) { ByRef_Projectname = _ByRef_Projectname; Popuptitle = _Popuptitle; Fielddefinitions = _Fielddefinitions; ByRef_Dataset = _ByRef_Dataset }));
}
// </POPUP_JSONDEF>

// <POPUP_KNOCKOUT>
async function JSB_BF_POPUP_KNOCKOUT(ByRef_Projectname, ByRef_Popuptitle, ByRef_Fielddefinitions, Deltext, Addtext, ByRef_Dataset, Popupwidth, Popupheight, Asform, Xtrabtns, Databasename, Tablename, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Popuptitle, ByRef_Fielddefinitions, ByRef_Dataset)
        return v
    }
    var Innerhtmldialog = undefined;
    var Btns = undefined;
    var Results = undefined;
    var Defaultrow = '';
    var Jsscript = '';
    var Sresults = '';
    var Element = '';

    if (isNothing(ByRef_Fielddefinitions)) return exit(undefined);
    if (Not(ByRef_Projectname)) ByRef_Projectname = 'css';

    if (Len(ByRef_Dataset) == 0) {
        if (Not(Popupwidth)) Popupwidth = '80%';
        if (Not(Popupheight)) Popupheight = '90%';
    } else {
        // don't let dialog default to auto, we need a specific height
        if (Not(Popupheight)) { if (UBound(ByRef_Dataset) > 5) Popupheight = 240 + UBound(ByRef_Dataset) * 40; else Popupheight = '90%'; }
        if (Not(Popupwidth)) Popupwidth = '80%';
    }

    if (Addtext) { Defaultrow = await JSB_BF_BUILDDEFAULTROW(ByRef_Fielddefinitions, undefined, function (_ByRef_Fielddefinitions) { ByRef_Fielddefinitions = _ByRef_Fielddefinitions }); }

    Innerhtmldialog = [undefined, JSB_HTML_REPEATERLOAD(ByRef_Projectname, Defaultrow, ByRef_Dataset)];
    if (Asform) {
        Innerhtmldialog[Innerhtmldialog.length] = await JSB_CTLS_REPEATERFORMBACKGROUND(ByRef_Projectname, ByRef_Projectname, { "columns": ByRef_Fielddefinitions, "attachdb": Databasename, "tableName": Tablename }, ByRef_Dataset, CStr(Deltext), Deltext, '', '');
    } else {
        Innerhtmldialog[Innerhtmldialog.length] = await JSB_CTLS_REPEATERGRIDBACKGROUND(ByRef_Projectname, ByRef_Projectname, { "columns": ByRef_Fielddefinitions, "attachdb": Databasename, "tableName": Tablename }, ByRef_Dataset, CStr(Deltext), Deltext, '', '');
    }

    Jsscript = await JSB_BF_JSCONDITIONALSSCRIPT(ByRef_Projectname, ByRef_Fielddefinitions, true);
    if (Jsscript) Innerhtmldialog[Innerhtmldialog.length] = JSB_HTML_SCRIPT(Jsscript);

    // Add some btns
    Btns = [undefined,];
    Btns[Btns.length] = JSB_HTML_SUBMITBTN('Btn', 'OK', { "onclick": 'storeVal(\'msgboxResult\', ko.toJSON(koModel.' + ByRef_Projectname + '))' });
    Btns[Btns.length] = JSB_HTML_SUBMITBTN('Btn', 'Cancel', { "onclick": 'storeVal(\'msgboxResult\', Chr(27))' });
    if (Deltext) { Btns[Btns.length] = Button('Btn', 'Add Another', { "onclick": 'koModel.' + ByRef_Projectname + '_newRow();' }); }
    if (Xtrabtns) Btns[Btns.length] = Xtrabtns;

    Innerhtmldialog[Innerhtmldialog.length] = Center(Join(Btns, crlf));

    Sresults = await JSB_BF_DIALOG(CStr(ByRef_Popuptitle), Join(Innerhtmldialog, crlf), true, Popupwidth, Popupheight);
    if (Not(Sresults) || Sresults == Chr(27)) return exit(false);

    Results = parseJSON(Sresults);
    for (Element of iterateOver(Results)) {
        delete Element['__ko_mapping__']
    }

    return exit(Results);
}
// </POPUP_KNOCKOUT>

// <PORTRAITMODE_Sub>
function JSB_BF_PORTRAITMODE_Sub() {
    if (hasPlugIn('cordova-plugin-screen-orientation')) window.screen.orientation.lock('portrait');
}
// </PORTRAITMODE_Sub>

// <PREVIOUSVERSIONNUMBER>
async function JSB_BF_PREVIOUSVERSIONNUMBER(Fname, Iname) {
    var Fdtrashcan = undefined;
    var Cntr = '';

    var Tfname = LCase(await JSB_BF_TRUEFILENAME(CStr(Fname)));
    if (Tfname == 'tmp' || Tfname == 'trashcan') return 0;

    if (await asyncOpen('dict', 'trashcan', _fHandle => Fdtrashcan = _fHandle)); else {
        if (await JSB_ODB_OPEN('dict', 'trashcan', Fdtrashcan, function (_Fdtrashcan) { Fdtrashcan = _Fdtrashcan })); else return 0;
    }

    if (await JSB_ODB_READ(Cntr, Fdtrashcan, Tfname + ' ' + CStr(Iname), function (_Cntr) { Cntr = _Cntr })); else return 0;
    return CInt(Cntr);
}
// </PREVIOUSVERSIONNUMBER>

// <PRIMARYKEYNAME>
async function JSB_BF_PRIMARYKEYNAME(Fhandle) {
    var Success = false;
    var Fdict = undefined;
    var Jrec = undefined;
    var Tof = '';
    var Cname = '';
    var Rfhandle = '';
    var Pkname = '';

    Tof = JSB_BF_TYPEOFFILE(Fhandle);
    if (Not(Tof)) {
        Fhandle = await JSB_BF_FHANDLE(CStr(Fhandle));
        Tof = JSB_BF_TYPEOFFILE(Fhandle);
        if (Not(Tof)) return '';
    }

    if (Left(Fhandle, 1) == '@') {
        Cname = ('jsb_odb|' + Mid1(Field(Fhandle, '.', 1, true), 2) + '_primarykeyname');
        Rfhandle = Mid1(Fhandle, activeProcess.Col2 + 1);
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, Rfhandle, Pkname, Success, function (_Pkname, _Success) { Pkname = _Pkname; Success = _Success });
        if (Success) return Pkname;
        return '';
    }

    if (Tof == 'http') return 'ItemID';

    // User defined primary key?
    Pkname = await JSB_BF_PRIMARYKEYNAMEFROMDICTIONAYDEFS(Fhandle, Fdict, function (_Fdict) { Fdict = _Fdict });
    if (Pkname) return Pkname;

    if (System(1) == 'js') {
        if (window.dotNetObj) {
            Pkname = window.dotNetObj.dnoPrimaryKeyColumnName(Mid1(Fhandle, 2));
        }
    } else if (System(1) == 'aspx') {
        var Fhandleaspx = Fhandle;
        Pkname = Fhandleaspx.PrimaryKeyColumnName();
    }

    if (!Pkname || Pkname == 'ItemID') {
        // Attempt to get name from JSON records? (Already done above in .NET versions by Fhandle.PrimaryKeyColumnName())
        Pkname = await JSB_BF_PRIMARYKEYNAMEFROMJSON(Fhandle);
        if (Not(Pkname) || Pkname == 'ItemID') return 'ItemID';
    }

    if (Not(Fdict)) return Pkname;

    // Update dictionary !itemID
    if (await JSB_ODB_READJSON(Jrec, Fdict, '!' + Pkname, function (_Jrec) { Jrec = _Jrec })); else { Jrec = { "name": Pkname, "label": Pkname, "required": true, "notblank": true, "sortable": true, "canedit": false, "ordinal": 1 } }
    Jrec.primarykey = true;
    if (await JSB_ODB_WRITEJSON(Jrec, Fdict, '!' + Pkname)); else null;

    return Pkname;
}
// </PRIMARYKEYNAME>

// <PRIMARYKEYNAMEFROMDICTIONAYDEFS>
async function JSB_BF_PRIMARYKEYNAMEFROMDICTIONAYDEFS(Fhandle, ByRef_Fdict, setByRefValues) {
    // local variables
    var Itemid;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Fdict)
        return v
    }
    var Tblname = '';
    if (JSB_BF_TYPEOFFILE(Fhandle)) {
        Tblname = fHandle2FileName(Fhandle);
    } else {
        Tblname = Fhandle;
        Fhandle = await JSB_BF_FHANDLE(CStr(Fhandle));
        if (Not(Fhandle)) return exit(undefined);
    }

    if (await JSB_ODB_OPEN('dict', Tblname, ByRef_Fdict, function (_ByRef_Fdict) { ByRef_Fdict = _ByRef_Fdict })); else {
        ByRef_Fdict = undefined;
        return exit(undefined);
    }

    var Sl = undefined;
    if (await JSB_ODB_SELECTTO('', ByRef_Fdict, 'ItemID Like \'!]\'', Sl, function (_Sl) { Sl = _Sl })) {
        var Itemids = getList(Sl);
        for (Itemid of iterateOver(Itemids)) {
            var Jrec = undefined;
            if (await JSB_ODB_READJSON(Jrec, ByRef_Fdict, CStr(Itemid), function (_Jrec) { Jrec = _Jrec })); else continue;
            if (CBool(Jrec.primarykey)) return exit(Mid1(Itemid, 2));
        }
    }
    return exit(undefined);
}
// </PRIMARYKEYNAMEFROMDICTIONAYDEFS>

// <PRIMARYKEYNAMEFROMJSON>
async function JSB_BF_PRIMARYKEYNAMEFROMJSON(Fhandle) {
    // local variables
    var Tag;

    var Notjson = [undefined,];
    var Notpk = [undefined,];
    var Possibletags = [undefined,];

    var Tblname = '';
    if (JSB_BF_TYPEOFFILE(Fhandle)) {
        Tblname = fHandle2FileName(Fhandle);
    } else {
        Tblname = Fhandle;
        Fhandle = await JSB_BF_FHANDLE(CStr(Fhandle));
        if (Not(Fhandle)) return undefined;
    }

    var Sl = undefined;
    if (await JSB_ODB_SELECTTO('Top 50', Fhandle, '', Sl, function (_Sl) { Sl = _Sl })); else return undefined;

    var Itemids = getList(Sl);
    var Reci = undefined;
    var Itemid = '';
    Reci = LBound(Itemids) - 1;
    for (Itemid of iterateOver(Itemids)) {
        Reci++;
        var Jrec = undefined;
        if (await JSB_ODB_READJSON(Jrec, Fhandle, CStr(Itemid), function (_Jrec) { Jrec = _Jrec })); else continue;
        if (CBool(Jrec.ItemContent)) {
            Notjson[Notjson.length] = Itemid;
            if (Len(Notjson) > 10) return undefined;
        } else {
            Itemid = LCase(Itemid);
            for (Tag of iterateOver(Jrec)) {
                if (LCase(Jrec[Tag]) == Itemid) {
                    if (Locate(Tag, Notpk, 0, 0, 0, "", position => { })); else {
                        if (Locate(Tag, Possibletags, 0, 0, 0, "", position => { })); else Possibletags[Possibletags.length] = Tag;
                    }
                } else {
                    var Spot = undefined;
                    if (Locate(Tag, Possibletags, 0, 0, 0, "", position => Spot = position)) Possibletags.Delete(Spot);
                    if (Locate(Tag, Notpk, 0, 0, 0, "", position => { })); else Notpk[Notpk.length] = Tag;
                }
            }
        }
    }

    if (Len(Possibletags) != 1) return undefined;

    // How confident are we?
    if (Reci > 20) return Possibletags[1];
    if (Len(Notjson) == 0) return Possibletags[1];
    return undefined;
}
// </PRIMARYKEYNAMEFROMJSON>

// <PRINTDOC>
async function JSB_BF_PRINTDOC(Doc, Title) {
    var B = '';

    B = At_Response.buffer();
    Print(At(-1), Doc, JSB_HTML_SCRIPT('\r\n\
        $(\'#jsbAdminBar\').hide()\r\n\
        $(\'title\').html("' + htmlEscape(Title) + '")\r\n\
        window.print();\r\n\
        setTimeout( function() { doJsbSubmit(false) }, 0);\r\n\
    '));

    await At_Server.asyncPause(me);
    At_Response.buffer(B);

    return '';

}
// </PRINTDOC>

// <PROFILEVAR>
async function JSB_BF_PROFILEVAR(Varname, Newvalue) {
    var Fusers = undefined;
    var Profile = undefined;

    if (!Varname) { activeProcess.At_Errors = 'profilevar: missing parameter'; return false; }

    if (await asyncOpen("", 'jsb_users', _fHandle => Fusers = _fHandle)); else return false;
    if (await asyncRead(Fusers, UserName(), "JSON", 0, _data => Profile = _data)); else { Profile = {} }

    if (Newvalue === undefined) return Profile[Varname];

    Profile[Varname] = Newvalue;
    if (await asyncWrite(Profile, Fusers, UserName(), "JSON", 0)); else return false;
    return true;
}
// </PROFILEVAR>

// <PROTOCOL>
function ProtoCol() {
    return Field(JSB_BF_URL(), ':', 1);
}
// </PROTOCOL>

// <QUERYSTRING>
async function JSB_BF_QUERYSTRING() {
    // local variables
    var Qp, I, J;

    Qp = Field(JSB_BF_URL(), '?', 2);
    I = InStrI1(1, Qp, 'basepage=');
    if (Not(I)) return Qp;
    J = (InStr1(I, Qp, '&'));
    if (Not(J)) J = Len(Qp) + 1;
    return Left(Qp, +I - 1) + Mid1(Qp, +J + 1);
}
// </QUERYSTRING>

// <QUERYVAR>
function JSB_BF_QUERYVAR(Keyname) {
    return window.queryVar(Keyname);
}
// </QUERYVAR>

// <READGPS>
async function JSB_BF_READGPS() {
    // local variables
    var Gpstext, Cnt;

    if (!(await JSB_BF_STARTGPS())) return undefined;

    if (window.validGPS) {
        return { "lat": window.GPS_latitude, "lng": window.GPS_longitude }
    }

    if (Null0(window.GPS_Err) == 1) if (Null0(window.GPS_Err) == 1) return 'Your GPS is blocked by your browser settings';

    $(+'\<div id=\'gpswait\' style=\'position: fixed; z-index:' + CNum(await JSB_BF_NEXTZINDEX()) + +'; width: 100%; height: 100%; background-color: black; color: white; opacity: .5\'\>\<div id=\'gpstext\' style=\'position: fixed;top:45%; left:45%\'\>Waiting for GPS Single\</div\>\</div\>').appendTo('body');
    Gpstext = 'Waiting for GPS Single';

    Cnt = 15;

    do {
        await asyncSleep(1 * 1000); // 1/2 second sleep
        $('#gpstext').text('Waiting for GPS Signal ' + StrRpt('.', 15 - +Cnt));

        Cnt--;
        if (Null0(Cnt) == '0') Cnt = 10;

        if (window.validGPS) {
            $('#gpswait').remove();
            return { "lat": window.GPS_latitude, "lng": window.GPS_longitude }
        }
    }
    while (Null0(window.GPS_Retries) < 15);

    $('#gpswait').remove();

    activeProcess.At_Errors = window.GPS_Err.message;
    return undefined;
}
// </READGPS>

// <READJSONDEFS>
async function JSB_BF_READJSONDEFS(Jsondeffilename, Jsondef_Id) {
    var Item = undefined;
    var Fielddefinitions = undefined;
    var Fdeffile = undefined;
    var Sitem = '';
    var Line = '';

    if (await JSB_ODB_OPEN('', CStr(Jsondeffilename), Fdeffile, function (_Fdeffile) { Fdeffile = _Fdeffile })); else return undefined;
    if (await JSB_ODB_READ(Sitem, Fdeffile, CStr(Jsondef_Id), function (_Sitem) { Sitem = _Sitem })); else return undefined;
    Item = Split(Sitem, am);
    Fielddefinitions = [undefined,];
    for (Line of iterateOver(Item)) {
        Line = LTrim(RTrim(Line));
        if (Line) {
            if (Left(Line, 1) != '{') break;
            if (Right(Line, 1) == ',') Line = Left(Line, Len(Line) - 1);
            Fielddefinitions[Fielddefinitions.length] = parseJSON(Line);
        }
    }
    return Fielddefinitions;
}
// </READJSONDEFS>

// <REDIRECTPOST>
async function JSB_BF_REDIRECTPOST(ByRef_Tourl, setByRefValues) {
    // local variables
    var Redirectpage, Keys, Key;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tourl)
        return v
    }
    Redirectpage = [undefined,];
    Redirectpage[Redirectpage.length] = '\<html\>';
    Redirectpage[Redirectpage.length] = '    \<body onload=\'document.forms["jsb"].submit()\'\>';
    Redirectpage[Redirectpage.length] = '    \<form id=\'jsb\' method=\'post\' action=' + jsEscapeHREF(CStr(ByRef_Tourl)) + ' class=\'jsb\' enctype=\'multipart/form-data\'\>';
    Keys = At_Request.Form.AllKeys();

    for (Key of iterateOver(Keys)) {
        if (Left(Key, 1) != '_' && Left(Key, 4) != 'ASP.' && Left(Key, 8) != 'DXScript' && Left(Key, 8) != 'devXGrid' && Key != 'isJsbPost' && Key != '_SID_') {
            var Value = At_Request.Form(Key);
            Redirectpage[Redirectpage.length] = '\<input type=\'hidden\' name=' + jsEscapeString(CStr(Key)) + ' value=' + jsEscapeString(Value) + '\>';
        }
    }
    Redirectpage[Redirectpage.length] = '\<input name=\'_SID_\' type=\'hidden\' value=\'' + userno() + '\' /\>';
    Redirectpage[Redirectpage.length] = '\<input name=\'userClearedTclScreen\' type=\'hidden\' value=\'1\' /\>';
    Redirectpage[Redirectpage.length] = '\<input name=\'isJsbPost\' type=\'hidden\' value=\'1\' /\>';
    Redirectpage[Redirectpage.length] = '\</form\>';
    Redirectpage[Redirectpage.length] = '\</html\>';

    At_Response.Buffer('');// Clear buffer
    At_Response.Header.Set('Content-Type', 'text/html; charset=UTF-8');
    At_Response.BinaryWrite(Join(Redirectpage, crlf));
    FlushHTML();
    At_Response.Buffer('');// Clear buffer
    return Stop('Redirecting');
}
// </REDIRECTPOST>

// <RESTORESCREEN_Sub>
async function JSB_BF_RESTORESCREEN_Sub(ByRef_Savedscreen, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Savedscreen)
        return v
    }
    At_Response.buffer(ByRef_Savedscreen);
    return exit();
}
// </RESTORESCREEN_Sub>

// <RESTOREUSERPRIVILEGES_Sub>
async function JSB_BF_RESTOREUSERPRIVILEGES_Sub() {
    // local variables
    var _Userno;

    if (System(1) == 'js') return;

    _Userno = userno();
    if (Not(At_Session.Item(_Userno))) return;
    if (CBool(At_Session.Item(_Userno).wasAdmin)) return;
    At_Session.Item(_Userno).IsAdmin = false;
    if (CBool(At_Session.Item(_Userno).breakingIsOK)) BreakOn(me);
}
// </RESTOREUSERPRIVILEGES_Sub>

// <RIGHTFIELD>
function JSB_BF_RIGHTFIELD(Str, Del) {
    var Cnt = undefined;

    Cnt = Count(Str, Del);
    if (Cnt) return Mid1(Str, Index1(Str, Del, Cnt) + 1);
    return '';
}
// </RIGHTFIELD>

// <ROLEDESCRIPTION>
async function JSB_BF_ROLEDESCRIPTION() {
    // IsAdmin > IsDirector > IsManager > IsClerk > IsEmployee > IsAuthenticated
    if (!JSB_BF_ISAUTHENTICATED()) return '';
    if (!(await JSB_BF_ISEMPLOYEE())) return 'Authenticated';
    if (!(await JSB_BF_ISCLERK())) return 'Employee';
    if (!(await JSB_BF_ISMANAGER())) return 'Clerk';
    if (Not(isAdmin())) return 'Manager';
    return 'Admin';
}
// </ROLEDESCRIPTION>

// <RPC>
async function JSB_BF_RPC(Serveraccount, Sid, Command, ByRef_P1, ByRef_P2, ByRef_P3, ByRef_P4, ByRef_P5, ByRef_P6, ByRef_P7, setByRefValues) {
    // local variables
    var Retry;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_P1, ByRef_P2, ByRef_P3, ByRef_P4, ByRef_P5, ByRef_P6, ByRef_P7)
        return v
    }
    var Jsonresult = undefined;
    var Body = '';

    Serveraccount = LCase(Serveraccount);
    if (Right(Serveraccount, 1) != '/') Serveraccount += '/';
    if (!(ByRef_P1 === undefined)) Body = '_p1=' + urlEncode(ByRef_P1);
    if (!(ByRef_P2 === undefined)) Body += '&_p2=' + urlEncode(ByRef_P2);
    if (!(ByRef_P3 === undefined)) Body += '&_p3=' + urlEncode(ByRef_P3);
    if (!(ByRef_P4 === undefined)) Body += '&_p4=' + urlEncode(ByRef_P4);
    if (!(ByRef_P5 === undefined)) Body += '&_p5=' + urlEncode(ByRef_P5);
    if (!(ByRef_P6 === undefined)) Body += '&_p6=' + urlEncode(ByRef_P6);
    if (!(ByRef_P7 === undefined)) Body += '&_p7=' + urlEncode(ByRef_P7);
    Body += '&_rpcsid_=' + CStr(Sid);

    for (Retry = 1; Retry <= 99; Retry++) {
        activeProcess.At_Errors = '';
        var Stringresult = '';

        if (InStr1(1, LCase(Command), 'write') || Len(Body) > 600) {
            // Get(Url, method , header, body, opts)
            Stringresult = (await JSB_BF_GET(Serveraccount + CStr(Command), 'POST', undefined, Body + '&_cachebuster=' + JSB_BF_NEWGUID(), undefined, function (_P3, _P4) { }));
        } else {
            Stringresult = (await JSB_BF_GET(Serveraccount + CStr(Command) + '?' + Body + '&_cachebuster=' + JSB_BF_NEWGUID(), 'GET', undefined, undefined, undefined, function (_P3, _P4) { }));
        }

        var Ans = await JSB_BF_RPC_ASSERTJSON(Serveraccount + CStr(Command), Stringresult, Jsonresult, function (_P1, _Stringresult, _Jsonresult) { Stringresult = _Stringresult; Jsonresult = _Jsonresult });
        if (Not(Ans)) return exit(0);

        if (Null0(Ans) != -1) break;
    }

    if (!(Jsonresult._p1 === undefined)) ByRef_P1 = Jsonresult._p1;
    if (!(Jsonresult._p2 === undefined)) ByRef_P2 = Jsonresult._p2;
    if (!(Jsonresult._p3 === undefined)) ByRef_P3 = Jsonresult._p3;
    if (!(Jsonresult._p4 === undefined)) ByRef_P4 = Jsonresult._p4;
    if (!(Jsonresult._p5 === undefined)) ByRef_P5 = Jsonresult._p5;
    if (!(Jsonresult._p6 === undefined)) ByRef_P6 = Jsonresult._p6;
    if (!(Jsonresult._p7 === undefined)) ByRef_P7 = Jsonresult._p7;

    var Rpcsid = Jsonresult._rpcsid_;
    if (Command == 'serverlogin' && CBool(Jsonresult._restFunctionResult) && Rpcsid) {
        At_Session.Item('SERVER_RPCSID', Rpcsid);
        At_Session.Item('LASTGET_RPCSID_', Rpcsid);
        if (System(1) == 'js') window.server_rpcsid = Rpcsid;
    }

    return exit(Jsonresult._restFunctionResult);
}
// </RPC>

// <RPC_ASSERTJSON>
async function JSB_BF_RPC_ASSERTJSON(ByRef_Url, ByRef_Stringresult, ByRef_Jsonresult, setByRefValues) {
    // local variables
    var _Err;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Url, ByRef_Stringresult, ByRef_Jsonresult)
        return v
    }
    if (Left(ByRef_Stringresult, 2) == '0x') ByRef_Stringresult = XTS(Mid1(ByRef_Stringresult, 3));

    At_Session.Item('LASTGETHEADER', activeProcess.At_Errors); // GET returns header here - move it
    At_Session.Item('LASTGET_RPCSID_', '');

    if (Left(ByRef_Stringresult, 1) != '{') {
        if (!activeProcess.At_Errors || InStr1(1, activeProcess.At_Errors, '200:OK')) {
            if (InStr1(1, ByRef_Stringresult, '\<form')) {
                ByRef_Stringresult = Field(Field(ByRef_Stringresult, '\<form', 2), '\</form', 1);
                ByRef_Stringresult = htmlUnescape(ByRef_Stringresult);
                ByRef_Stringresult = dropIfLeft(ByRef_Stringresult, '\<input name=\'_attcl_\' type=\'hidden\' value=\'true\' /\>');
                ByRef_Stringresult = dropIfRight(ByRef_Stringresult, '\<style\>#jsb');
                ByRef_Stringresult = dropIfRight(ByRef_Stringresult, '\<style\>#jsb');
                ByRef_Stringresult = Change(ByRef_Stringresult, '\<br/\>', crlf);
                ByRef_Stringresult = Change(ByRef_Stringresult, '\<br /\>', crlf);
                ByRef_Stringresult = Change(ByRef_Stringresult, '\<br\>', crlf);
                activeProcess.At_Errors = 'I expected JSON data and I received HTML data. Result: ' + crlf + ByRef_Stringresult;
            } else {
                activeProcess.At_Errors = 'I expected JSON data and I received text. Result: ' + crlf + ByRef_Stringresult;
            }
        }

        if (JSB_BF_ISASPXC()) return exit(0);

        var Msg = '';
        if (CBool(isAdmin())) Msg = '*Retry,Fail,Debug'; else Msg = '*Retry,Fail';
        var Ans = await JSB_BF_MSGBOX('AJAX Error', 'Remote Server Error From ' + CStr(ByRef_Url) + crlf + crlf + CStr(activeProcess.At_Errors), Msg);
        if (Ans == 'Retry') return exit(0 - 1);
        if (Ans == 'Debug') { Print(); debugger; return exit(0 - 1); }
        return exit(0);
    }

    try {
        ByRef_Jsonresult = parseJSON(ByRef_Stringresult);
    } catch (_Err) {
        activeProcess.At_Errors = 'Unexpected json parse error from ' + CStr(ByRef_Url) + crlf + 'I expected JSON data and I received ' + crlf + crlf + ByRef_Stringresult;
        if (JSB_BF_ISASPXC()) return exit(0);

        if (await JSB_BF_MSGBOX('AJAX Error', CStr(activeProcess.At_Errors), 'Retry,Fail') == 'Retry') return exit(0 - 1);
        return exit(0);
    }

    At_Session.Item('LASTGET_RPCSID_', ByRef_Jsonresult._rpcsid_);

    if (isNothing(ByRef_Jsonresult._restFunctionResult)) {
        activeProcess.At_Errors = 'Unexpected json result from ' + CStr(ByRef_Url) + crlf + 'I expected a TAG \'_restFunctionResult\' and I received ' + crlf + crlf + CStr(ByRef_Jsonresult);
        return exit(0);
    }

    return exit(1);
}
// </RPC_ASSERTJSON>

// <SAVENEWREFVALUE>
async function JSB_BF_SAVENEWREFVALUE(ByRef_Reffile, ByRef_Refpk, ByRef_Refdisplay, ByRef_Newvalue, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Reffile, ByRef_Refpk, ByRef_Refdisplay, ByRef_Newvalue)
        return v
    }
    var Freffile = undefined;
    var Js = undefined;
    var Oldvalue = undefined;

    if (Left(ByRef_Reffile, 1) == '{' || Not(ByRef_Newvalue) || Not(ByRef_Reffile)) return exit(true);

    Freffile = await JSB_BF_FHANDLE('', ByRef_Reffile, true);
    if (LCase(ByRef_Refdisplay) == 'itemid') ByRef_Refdisplay = '';
    if (Not(ByRef_Refpk)) ByRef_Refpk = 'ItemID';

    if (await JSB_ODB_READJSON(Oldvalue, Freffile, CStr(ByRef_Newvalue), function (_Oldvalue) { Oldvalue = _Oldvalue })) return exit(true);

    Js = {};
    Js[ByRef_Refpk] = ByRef_Newvalue;
    if (ByRef_Refdisplay) Js[ByRef_Refdisplay] = ByRef_Newvalue;

    if (await JSB_ODB_WRITEJSON(Js, Freffile, CStr(ByRef_Newvalue))); else Alert(CStr(activeProcess.At_Errors));

    return exit(true);
}
// </SAVENEWREFVALUE>

// <SAVESCREEN>
async function JSB_BF_SAVESCREEN() {
    return At_Response.buffer();
}
// </SAVESCREEN>

// <SEGMENTEDOPEN>
async function JSB_BF_SEGMENTEDOPEN(Fname, Id, Minimumsize) {
    var F = undefined;
    if (await asyncOpen("", Fname, _fHandle => F = _fHandle)); else return undefined;

    var Flen = undefined;
    if (await asyncReadBlk(F, Id, -1, 0, _data => Flen = _data)); else return undefined;

    if (Minimumsize < 1) Minimumsize = 4096;
    if (Minimumsize < 256) Minimumsize = 4096;

    var R = {
        "fname": Fname,
        "id": Id,
        "currentPos": 0,
        "blkSize": Minimumsize,
        "eof": Flen <= 0,
        "fileSize": Flen,
        "remainingBytes": Flen,
        "src": ''
    };
    return R;
}
// </SEGMENTEDOPEN>

// <SEGMENTEDREAD>
async function JSB_BF_SEGMENTEDREAD(R) {
    // local variables
    var More;

    var F = undefined;

    if (Not(R.remainingBytes) || Len(R.src) > Null0(R.blkSize)) return R;
    if (await asyncOpen("", R.fname, _fHandle => F = _fHandle)); else return Stop(activeProcess.At_Errors);

    var L = R.blkSize;
    if (L > Null0(R.remainingBytes)) L = R.remainingBytes;

    if (await asyncReadBlk(F, R.id, R.currentPos, L, _data => More = _data)); else {
        return Stop(activeProcess.At_Errors);
        More = '';
    }

    R.remainingBytes -= L;
    R.currentPos += L;

    R.src += CStr(More);
    return R;
}
// </SEGMENTEDREAD>

// <SERIALCLOSE>
async function JSB_BF_SERIALCLOSE() {
    // local variables
    var Callbacknumber, Message;

    Callbacknumber = 0;
    await new Promise(resolve => window.serial.close(function () { Callbacknumber = 1; resolve(Callbacknumber) }, function (_Message) { Message = _Message; Callbacknumber = 2; resolve(Callbacknumber) }));
    if (Null0(Callbacknumber) != 1) {
        activeProcess.At_Errors = Message;
        return false;
    }
    return true;
}
// </SERIALCLOSE>

// <SERIALCONNECT>
async function JSB_BF_SERIALCONNECT(Baudrate) {
    // local variables
    var Callbacknumber, Message;

    if (!hasPlugIn('cordovarduino')) { activeProcess.At_Errors = 'No \'cordovarduino\' phonegap plugin'; return undefined; }

    Callbacknumber = 0;
    if (Not(Baudrate)) Baudrate = 115200;

    await new Promise(resolve => window.serial.requestPermission({}, function () { Callbacknumber = 1; resolve(Callbacknumber) }, function (_Message) { Message = _Message; Callbacknumber = 2; resolve(Callbacknumber) }));
    if (Null0(Callbacknumber) != 1) {
        activeProcess.At_Errors = Message;
        return undefined;
    }

    await new Promise(resolve => window.serial.open({ "baudRate": Baudrate }, function () { Callbacknumber = 1; resolve(Callbacknumber) }, function (_Message) { Message = _Message; Callbacknumber = 2; resolve(Callbacknumber) }));
    if (Null0(Callbacknumber) != 1) {
        activeProcess.At_Errors = Message;
        return undefined;
    }

    window.InData = '';
    serial.registerReadCallback(function success(data) {
        var arr = new Uint8Array(data);
        var str = String.fromCharCode.apply(null, arr);
        window.InData += str;
    }
    );
    return true;
}
// </SERIALCONNECT>

// <SERIALRESPONSE>
async function JSB_BF_SERIALRESPONSE() {
    // local variables
    var I, R;

    for (I = 1; I <= 50; I++) {
        await asyncSleep(1);
        if (InStr1(1, window.InData, '\>')) {
            R = window.InData;
            window.InData = fieldRight(CStr(R), '\>');
            return fieldLeft(CStr(R), '\>') + '\>';
        }
    }
    return '';
}
// </SERIALRESPONSE>

// <SERIALWRITE>
async function JSB_BF_SERIALWRITE(ByRef_S, setByRefValues) {
    // local variables
    var Callbacknumber, Message;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_S)
        return v
    }
    Callbacknumber = 0;
    await new Promise(resolve => window.serial.write(CStr(ByRef_S) + Chr(10), function () { Callbacknumber = 1; resolve(Callbacknumber) }, function (_Message) { Message = _Message; Callbacknumber = 2; resolve(Callbacknumber) }));
    if (Null0(Callbacknumber) != 1) {
        activeProcess.At_Errors = Message;
        return exit(false);
    }
    return exit(true);
}
// </SERIALWRITE>

// <SETROWDEFAULTS>
async function JSB_BF_SETROWDEFAULTS(ByRef_Jsondefs, ByRef_Row, Objectname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Jsondefs, ByRef_Row)
        return v
    }
    var Cdef = undefined;
    var Dvalue = undefined;
    var Columnname = '';
    var Changed = undefined;

    Changed = false;
    if (CBool(ByRef_Jsondefs)) {
        for (Cdef of iterateOver(ByRef_Jsondefs)) {
            Columnname = Cdef.name;
            if (Columnname) {
                if (isNothing(ByRef_Row[Columnname])) {
                    Dvalue = getDefaultValue(CStr(ByRef_Row[Columnname]), CStr(Cdef.defaultvalue), Columnname, CStr(Objectname));
                    if (!isNothing(Dvalue)) {
                        ByRef_Row[Columnname] = Dvalue;
                        Changed = true;
                    }
                }
            }
        }
    }

    return exit(Changed);
}
// </SETROWDEFAULTS>

// <SIGNIN>
async function JSB_BF_SIGNIN(ByRef__Username, Setdefaultlogin, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Username)
        return v
    }
    // this just sets the ISAUTHENTICATED flag for aspx

    var _Userno = userno();
    if (Not(At_Session.Item(_Userno))) { At_Session.Item(_Userno, {}); }
    var Session = At_Session.Item(_Userno);

    Session.IsAuthenticated = true;
    Session.UserName = ByRef__Username;
    Session.IsAdmin = (System(1) == 'js' && LCase(ByRef__Username) == 'admin');
    Session.IsAdmin = await JSB_BF_ISINROLE('admin');
    At_Session.Item('USERNAME', ByRef__Username);
    Session.Email = await JSB_BF_EMAIL();

    if (Setdefaultlogin) At_Session.Item('LASTUSERNAME', ByRef__Username);
    if (System(1) == 'js') window.saveAtSession();

    return exit(true);

    return exit();
}
// </SIGNIN>

// <SIGNOUT>
async function SignOut() {
    // local variables
    var X;

    JSB_BF_CLEARUSERCACHES();

    if (System(1) == 'js') X = await asyncRpcRequest('OAUTH_QUIT'); else await JSB_ODB_OAUTH_QUIT();

    var Catsession = At_Session;
    var _Username = UserName();
    var Uservars = [undefined,];

    var Id = '';
    for (Id of iterateOver(Catsession)) {
        if (InStr1(1, Id, 'jsb:')) {
            var Rec = At_Session.Item(Id);
            if (typeOf(Rec) == 'JSonObject') {
                if (Null0(Rec['UserName']) == Null0(_Username) || isEmpty(Rec['UserName'])) Uservars[Uservars.length] = Id;
            }
        }
    }

    for (Id of iterateOver(Uservars)) {
        delete At_Session[Id]
    }

    delete At_Session['LastUserName']
    delete At_Session['lastusername']
    delete At_Session['IsAdmin']
    delete At_Session['isadmin']
    delete At_Session['dbUserID']
    delete At_Session['dbuserid']
    delete At_Session['dbPassword']
    delete At_Session['username']
    delete At_Session['attacheddatabase']
    delete At_Session['cachedaccounts']
    delete At_Session['server_rpcsid']
    delete At_Session['lastget_rpcsid_']
    delete At_Session['rpc_last_address']

    delete At_Session[userno()]

    if (System(1) == 'aspx') At_Session.Item('SIGNOUT')();
    if (System(1) == 'js') window.saveAtSession();
    if (System(1) == 'gae') return At_Response.Redirect(LogoutUrl());

    return true;
}
// </SIGNOUT>

// <SORTARRAYOFSTRING>
function JSB_BF_SORTARRAYOFSTRING(Unsortedarray, Sorttags) {
    var Sorted = undefined;
    var Numericsort = undefined;
    var Ignorecase = undefined;
    var Descending = undefined;
    var Rightalign = undefined;
    var Allnumeric = undefined;
    var Appendit = undefined;
    var Tl = undefined;
    var I = undefined;
    var Item = '';
    var H = '';
    var Si = '';
    var Ci = '';

    Numericsort = (InStr1(1, Sorttags, '#') || InStr1(1, Sorttags, 'N'));
    Ignorecase = (InStr1(1, Sorttags, '~') || InStr1(1, Sorttags, 'I'));
    Descending = (InStr1(1, Sorttags, '\<') || InStr1(1, Sorttags, 'D'));
    Rightalign = (InStr1(1, Sorttags, '!') || InStr1(1, Sorttags, 'R'));

    Sorted = [undefined,];
    if (!Numericsort) {
        Allnumeric = true;
        for (Item of iterateOver(Unsortedarray)) {
            if (!isNumeric(Item)) {
                Allnumeric = false;
                break;
            }
        }
    }

    for (Item of iterateOver(Unsortedarray)) {
        Appendit = true;
        var _ForEndI_3 = UBound(Sorted);
        for (I = 1; I <= _ForEndI_3; I++) {
            Si = Sorted[I];
            Ci = Item;

            if (Numericsort) {
                Si = CNum(Si);
                Ci = CNum(Ci);
            }

            if (Ignorecase) {
                Si = LCase(Si);
                Ci = LCase(Ci);
            }

            if (Rightalign) {
                if (Len(Si) > Len(Ci)) Tl = Len(Si); else Tl = Len(Ci);
                Si = Space(Tl - Len(Si)) + Si;
                Ci = Space(Tl - Len(Ci)) + Ci;
            }

            if (Descending) {
                H = Si;
                Si = Ci;
                Ci = H;
            }

            if (Si > Ci) {
                Sorted.Insert(I, Item);
                Appendit = false;
                break;
            }
        }

        if (Appendit == true) Sorted[Sorted.length] = Item;
    }

    return Sorted;
}
// </SORTARRAYOFSTRING>

// <SORTBYTAGS>
function JSB_BF_SORTBYTAGS(Jsonrec, Ignorecase, Descending) {
    // local variables
    var Tagname;

    var Sortedtags = [undefined,];
    var Sortflag = '';
    var I = undefined;
    if (Descending) Sortflag = 'D'; else Sortflag = 'A';
    if (Ignorecase === undefined) Ignorecase = true;

    if (Ignorecase) {
        var Ignorecasetags = [undefined,];
        for (Tagname of iterateOver(Jsonrec)) {

            if (Locate(UCase(Tagname), Ignorecasetags, 0, 0, 0, Sortflag, position => I = position)); else {
                Sortedtags.Insert(I, Tagname);
                Ignorecasetags.Insert(I, UCase(Tagname));
            }
        }
    } else {
        for (Tagname of iterateOver(Jsonrec)) {
            if (Locate(Tagname, Sortedtags, 0, 0, 0, Sortflag, position => I = position)); else Sortedtags.Insert(I, Tagname);
        }
    }

    var Newrec = {};
    for (Tagname of iterateOver(Sortedtags)) {
        Newrec[Tagname] = Jsonrec[Tagname];
    }

    return Newrec;
}
// </SORTBYTAGS>

// <SORTJSONARRAY>
function JSB_BF_SORTJSONARRAY(Rows, Columnid, Ascending) {
    var Cid = '';
    var Prefix = '';

    Cid = Field(Columnid, '#', 1);
    if (InStr1(1, Columnid, '#')) Prefix = '#';
    if (Ascending) Prefix += '\>'; else Prefix += '\<';
    return Sort(Rows, '~' + Prefix + Cid);
}
// </SORTJSONARRAY>

// <SPLIT>
function JSB_BF_SPLIT(Source, Arrayofdelimiters, Stringmarkers) {
    // local variables
    var Instring, Results, Cw, I, C, Stringdel, Del;

    if (Not(isArray(Arrayofdelimiters))) Arrayofdelimiters = [undefined, Arrayofdelimiters];
    Instring = false;
    Results = [undefined,];
    Cw = '';
    var _ForEndI_2 = Len(Source);
    for (I = 1; I <= _ForEndI_2; I++) {
        C = Mid1(Source, I, 1);
        if (CBool(Instring)) {
            if (Null0(C) == Null0(Stringdel)) Instring = false;
            Cw = CStr(Cw) + CStr(C);;
        } else if (InStr1(1, Stringmarkers, C)) {
            Stringdel = C;
            Instring = true;
            Cw = CStr(Cw) + CStr(C);;
        } else {
            for (Del of iterateOver(Arrayofdelimiters)) {
                if (Mid1(Source, I, Len(Del)) == Del) {
                    if (CBool(Cw) || UBound(Results)) Results[Results.length] = Cw;
                    Cw = '';
                    I = +I + Len(Del) - 1;
                    C = '';
                    break;
                }
            }
            Cw = CStr(Cw) + CStr(C);
        }
    }
    if (CBool(Cw) || UBound(Results)) Results[Results.length] = Cw;
    return Results;

}
// </SPLIT>

// <SPLITJSBCODE>
function JSB_BF_SPLITJSBCODE(_Code, Sortit) {
    var Llcode = undefined;
    var Temparray = undefined;
    var Priorinside = undefined;
    var Startlinei = undefined;
    var Lastpos = undefined;
    var Startline = undefined;
    var Blockstart = undefined;
    var Endline = undefined;
    var Blockend = undefined;
    var Insideinsert = undefined;
    var I = undefined;
    var Blocks = undefined;
    var Amx = '';
    var Npname = '';
    var Routinename = '';
    var Fline = '';
    var Lblock = '';
    var Ablock = '';
    var Block = '';
    var Ch = '';
    var Lcode = '';
    var Nextpos = '';

    Blocks = {};
    Startlinei = 1;

    Amx = am + Chr(249);

    _Code = Change(_Code, crlf, am);
    _Code = Change(_Code, Chr(13), am);
    _Code = Change(_Code, Chr(10), am);
    _Code = Change(_Code, Chr(160), ' ');

    I = Len(_Code);

    while (true) {
        Ch = Mid1(_Code, I, 1);
        if (Not(Ch == ' ' || Ch == am)) break;
        I--;
    }

    _Code = Mid1(_Code, 1, I) + am;

    Temparray = Split(_Code, am, 7);
    Lcode = Join(Temparray, Amx);
    _Code = Join(Temparray, am);

    // LTrim all lines

    while (InStr1(1, Lcode, Amx + ' ')) {
        Lcode = Change(Lcode, Amx + ' ', Amx);
    }

    // Mark all subroutines with Am():function:#
    Lcode = Amx + LCase(Lcode);
    Lcode = Change(Lcode, Amx + 'func ', am + 'function#');
    Lcode = Change(Lcode, Amx + 'sub ', am + 'subroutine#');
    Lcode = Change(Lcode, Amx + 'subroutine ', am + 'subroutine#');
    Lcode = Change(Lcode, Amx + 'function ', am + 'function#');
    Lcode = Change(Lcode, Amx + 'program ', am + 'program#');
    Lcode = Change(Lcode, Amx + 'restful function ', am + 'restful#');
    Lcode = Change(Lcode, Amx + 'restful ', am + 'restful#');
    Lcode = Change(Lcode, Amx + 'pick function ', am + 'pick#');

    // Remove excess AMX
    Lcode = Mid1(Lcode, 2);
    Lcode = Change(Lcode, Amx, am);

    // Remove all spaces
    // LCode = Replace(LCode, ' ', '')
    Llcode = Split(Lcode, am);

    Lastpos = 1;
    Insideinsert = 0;


    while (true) {
        Npname = findEndOfJsbSub(Lastpos, Lcode);
        Nextpos = Extract(Npname, 1, 0, 0);
        Routinename = dropRight(Extract(Npname, 2, 0, 0), '#'); // Don't include sub header offset

        if (Lastpos == Null0(Nextpos)) break;

        Startline = Count(am + Mid1(Lcode, 1, Lastpos), am);
        if (Startline == 1) Blockstart = 1; else Blockstart = Index1(_Code, am, Startline - 1) + 1;

        Endline = Count(Mid1(Lcode, 1, +Nextpos - 1), am) + 1;
        Blockend = Index1(_Code, am, Endline);
        if (!Blockend) Blockend = Len(_Code);
        Block = Mid1(_Code, Blockstart, Blockend - Blockstart);


        while (true) {
            Fline = Extract(Block, 1, 0, 0);
            if (Not(Block && !Trim(Fline))) break;
            Block = Delete(Block, 1, 0, 0);
            Routinename = Field(Routinename, '#', 1) + '#' + Field(Routinename, '#', 2) + '#' + Field(Routinename, '#', 3);
        }

        Lblock = LCase(Block);

        // Don't split up inserts
        Priorinside = Insideinsert;
        Insideinsert += Count(Lblock, '* \<insert\>') + Count(Lblock, '*\<insert\>');
        Insideinsert = Insideinsert - Count(Lblock, '* \</insert\>') - Count(Lblock, '*\</insert\>');

        if (Insideinsert) {
            if (Priorinside) {
                Ablock = CStr(Ablock) + am + am + Block;
            } else {
                Ablock = Block;
            }
        } else {
            if (Priorinside) {
                Block = Ablock + am + am + Block; Ablock = '';
            }

            if (Block) {
                if (CBool(Blocks[Routinename])) {
                    // This can happen with using versioning with *options aspx, gae, etc
                    // Ans = Msgbox("I found two identical subroutines: ":RoutineName:"; tacking 2nd onto end of 1st", "OK, Debug")
                    // if Ans <> "OK" Then Debug

                    Blocks[Routinename] += am + am + Block;
                } else {
                    Blocks[Routinename] = Block;
                }
            }
        }

        Lastpos = Nextpos;
    }

    if (Priorinside && Ablock) {
        Blocks[Routinename] = Ablock;
    }

    if (Sortit) Blocks = JSB_BF_SORTBYTAGS(Blocks, true);

    return Blocks;
}
// </SPLITJSBCODE>

// <SQLSELECT>
async function JSB_BF_SQLSELECT(ByRef_Selectstatement, setByRefValues) {
    // local variables
    var Tagname;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Selectstatement)
        return v
    }
    var Sl = undefined;
    if (await asyncDNOSqlSelect(ByRef_Selectstatement, _selectList => Sl = _selectList)); else return exit(undefined);

    var Ss = getList(Sl);

    if (!Len(Ss)) return exit(Ss);
    var Rec = Ss[LBound(Ss)];
    if (DCount(Rec, am) != 1) return exit(Ss);
    for (Tagname of iterateOver(Rec)) {
        break;
    }

    var Ids = [undefined,];
    for (Rec of iterateOver(Ss)) {
        Ids[Ids.length] = Rec[Tagname];
    }

    return exit(Ids);
}
// </SQLSELECT>

// <STARTGPS>
async function JSB_BF_STARTGPS() {
    // local variables
    var Status, Callbacknumber;

    var permissions = undefined;
    if (!hasPlugIn('cordova-plugin-geolocation')) { activeProcess.At_Errors = 'No \'cordova-plugin-geolocation\' phonegap plugin'; return undefined; }
    if (window.backgroundGPSrunning) return true;

    // See https://www.npmjs.com/package/cordova-plugin-android-permissions
    if (hasPlugIn('cordova-plugin-android-permissions')) {
        permissions = window.cordova.plugins.permissions;
        await new Promise(resolve => permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, function (_Status) { Status = _Status; Callbacknumber = 1; resolve(Callbacknumber) }, function (_Status) { Status = _Status; Callbacknumber = 2; resolve(Callbacknumber) }));
        if (Null0(Callbacknumber) != 1) return 'GPS Permission Error';
        if (Not(Status.hasPermission)) return 'GPS Position disabled by user';
    }

    window.GPS_Retries = 0;
    window.enableHighAccuracy = true;
    if (window.backgroundGPSrunning) return true;

    window.backgroundGPSrunning = true;
    window.validGPS = false;
    window.GPS_Time = undefined;

    window.readGPSgeolocation = function (Timeout) {
        window.navigator.geolocation.getCurrentPosition(function (onSuccess) {
            window.GPS_latitude = onSuccess.coords.latitude;
            window.GPS_longitude = onSuccess.coords.longitude;
            window.validGPS = true;
            window.GPS_Time = TimeDate();
            window.GPS_Retries = 0;
            window.enableHighAccuracy = true;
            window.gpsCycleTimer = setTimeout(window.readGPSgeolocation, 5 * 1000);  // every 5 seconds read again

        }, function (err) {
            // we timed out...
            window.GPS_Err = err;
            window.GPS_Retries += 1

            if (err.code != 3) {  // timeout error
                window.GPS_Retries = 9999; // never going to happen
                window.backgroundGPSrunning = false;
                return
            }

            if (window.GPS_Retries >= 2) window.enableHighAccuracy = false;
            window.readGPSgeolocation(5 * 1000);  // attempt to read within 5 seconds
        },

            { maximumAge: 10000, timeout: Timeout, enableHighAccuracy: window.enableHighAccuracy }
        )
    }

    // Do first attempt with a short timeout
    window.readGPSgeolocation(100)

    return true;
}
// </STARTGPS>

// <STOPGPS>
async function JSB_BF_STOPGPS() {
    window.clearTimeout(window.gpsCycleTimer);
    window.backgroundGPSrunning = false;
    window.validGPS = false;

    return true;
}
// </STOPGPS>

// <SWIPEMOVE>
async function JSB_BF_SWIPEMOVE(ByRef_Touchmove, ByRef_Firstmousex, ByRef_Firstmousey, ByRef_Mousex, ByRef_Mousey, setByRefValues) {
    // local variables
    var Deltax, Swipediv, Newswipediv, Cname, Printtxt, _Html;
    var Pv, Cancelit;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Touchmove, ByRef_Firstmousex, ByRef_Firstmousey, ByRef_Mousex, ByRef_Mousey)
        return v
    }
    Deltax = ByRef_Firstmousex - ByRef_Mousex;
    Swipediv = $('#swipeDiv');

    if (Null0($(Swipediv).length) == '0') return exit(window.showStatus('No SwipeDiv', '', true));

    // starting?
    if (ByRef_Touchmove == 1) {
        window.clearStatus();
        if (Abs(Deltax) < 7) {
            window.touchMove = 1;
            return exit(window.showStatus('1TS', '', true));
        }

        // Pick a direction
        if (Null0(Deltax) > '0') window.previewName = window.pageRight; else window.previewName = window.pageLeft;
        if (Not(window.previewName)) return exit(undefined);

        // create newSwipeDiv
        $('#oldSwipeDiv').remove();
        $('#newSwipeDiv').remove();

        Newswipediv = $(Swipediv).clone();
        $(Newswipediv).insertAfter(Swipediv);
        $(Newswipediv).attr('id', 'newSwipeDiv').html('');

        window.swipeWidth = $(Swipediv).width();
        if (Null0(Deltax) > '0') {
            // move jsb off screen to create a new screen
            $(Newswipediv).css({ "left": window.swipeWidth });
        } else {
            // move jsb off screen to create a new screen
            $(Newswipediv).css({ "left": -CNum(window.swipeWidth) });
        }

        Cname = window.previewName;
        Printtxt = '';
        await asyncCallByName(Cname, me, 0 /*ignore if missing */, Printtxt, window.pageLeft, window.pageRight);

        _Html = window.convertPrint2Html(Printtxt);

        $(Newswipediv).html(_Html);
        window.touchMove = 2;
        return exit(window.showStatus('1OKC', '', true));;
    } else if (ByRef_Touchmove == 2) {
        // old is on screen and needs to move away
        $(Swipediv).offset({ "left": - +Deltax });
        if (Null0(window.previewName) == Null0(window.pageRight)) {
            $('#newSwipeDiv').offset({ "left": CNum(window.swipeWidth) - +Deltax });
        } else {
            $('#newSwipeDiv').offset({ "left": -CNum(window.swipeWidth) - +Deltax });
        }
        window.touchMove = 2;
        window.showStatus('.', '', true);
        return exit(undefined);;
    } else if (ByRef_Touchmove == 3) {
        // finish movement
        Pv = window.previewName;
        Cancelit = (Abs(Deltax) < 7 || isEmpty(Pv));
        if (Null0(Deltax) > '0') {
            if (Null0(Pv) != Null0(window.pageRight)) Cancelit = true;
        } else {
            if (Null0(Pv) != Null0(window.pageLeft)) Cancelit = true;
        }

        if (CBool(Cancelit)) {
            $('#newSwipeDiv').remove();
            $(Swipediv).css({ "left": 0 });
            return exit(window.showStatus('3', 'CAN', true));
        } else {
            if (Null0(window.previewName) == Null0(window.pageRight)) {
                $(Swipediv).animate({ "left": -CNum(window.swipeWidth) }, 300, function () { $('#oldSwipeDiv').hide() });
            } else {
                $(Swipediv).animate({ "left": window.swipeWidth }, 300, function () { $('#oldSwipeDiv').hide() });
            }
            $('#newSwipeDiv').animate({ "left": 0 }, 300);

            // Rename new components
            $(Swipediv).attr('id', 'oldSwipeDiv');
            $('#newSwipeDiv').attr('id', 'swipeDiv');

            // force our process to do a submit
            window.assignBtn('btn', window.previewName);
            window.setTimeout(function () { jsbSubmitEvent() }, 10);

            return exit(window.showStatus('3OK', '', true));
        }
    } else {
        window.showStatus('?', '', true);
    }
    return exit();
}
// </SWIPEMOVE>

// <SYSTEMTYPE>
function JSB_BF_SYSTEMTYPE() {
    return System(1);
}
// </SYSTEMTYPE>

// <TABLECOLUMNS>
async function JSB_BF_TABLECOLUMNS() {
    return [undefined,
        { "name": 'name', "index": 10, "label": 'Name', "datatype": 'string', "primarykey": true, "width": '30em', "control": 'label', "align": 'left', "canedit": false, "display": 'hidden' },
        { "name": 'label', "index": 11, "label": 'Label', "width": '30em', "control": 'textbox', "canedit": true, "required": true, "notblank": true },
        { "name": 'defaultvalue', "index": 12, "label": 'Default Value', "width": '30em', "control": 'textbox', "canedit": true, "required": false, "notblank": false, "tooltip": '{lastvalue}, {itime}, {time}, {idate}, {date}, {guid}, {now}, {@session(\'name\')}, {@param(\'name\')}, {@application(\'name\')}' },
        { "name": 'required', "index": 13, "label": 'Required', "width": '18em', "control": 'checkbox', "canedit": true, "required": false, "notblank": false, "reflist": 'false,0;true,1' },
        { "name": 'notblank', "index": 14, "label": 'Not Blank', "width": '18em', "control": 'checkbox', "canedit": true, "required": false, "notblank": false, "reflist": 'false,0;true,1' },
        { "name": 'tooltip', "index": 15, "label": 'Tool Tip', "width": '12em', "control": 'textbox', "canedit": true, "required": false, "notblank": false, "display": 'gridhidden' },

        { "name": 'align', "index": 41, "label": 'Align', "width": '12em', "control": 'dropDownBox', "canedit": true, "required": false, "notblank": false, "reflist": 'left;right' },
        { "name": 'sortable', "index": 42, "label": 'Sortable', "width": '12em', "control": 'checkbox', "canedit": true, "required": false, "notblank": false, "defaultvalue": 1, "reflist": 'false,0;true,1' },

        {
            "name": 'datatype', "index": 43, "label": 'Data Type', "width": '19em', "control": 'dropDownBox', "canedit": true, "required": true, "notblank": true, "defaultvalue": 'string', "autopostback": true,
            "reflist": 'guid;autointeger;integer;double;boolean;string;date;time;datetime;currency;blob;png;jpg;url;memo;password,jsonarray'
        },
        { "name": 'primarykey', "index": 44, "label": 'PKey', "width": '13em', "control": 'checkbox', "canedit": true, "required": false, "notblank": false, "defaultvalue": 0, "reflist": 'false,0;true,1' },
        { "name": 'encrypt', "index": 45, "label": 'Encrypted', "width": '13em', "control": 'checkbox', "canedit": true, "required": false, "notblank": false, "defaultvalue": 0, "reflist": 'false,0;true,1' },
        { "name": 'isLatitude', "index": 46, "label": 'Latitude Fld', "width": '13em', "control": 'checkbox', "canedit": true, "required": false, "notblank": false, "defaultvalue": 0, "reflist": 'false,0;true,1' },
        { "name": 'isLongitude', "index": 47, "label": 'Longitude Fld', "width": '13em', "control": 'checkbox', "canedit": true, "required": false, "notblank": false, "defaultvalue": 0, "reflist": 'false,0;true,1' }

    ];
}
// </TABLECOLUMNS>

// <THEDAY>
function JSB_BF_THEDAY(Datem) {
    if (Datem === undefined) Datem = Now();
    return Field(r83Date(Datem), '-', 3);
}
// </THEDAY>

// <THEDAYEXTENSION>
function JSB_BF_THEDAYEXTENSION(Datem) {
    var Daynum = '';

    Daynum = JSB_BF_THEDAY(Datem);
    switch (Daynum) {
        case 1:
            return 'st';
            break;

        case 2:
            return 'nd';
            break;

        case 3:
            return 'rd';
            break;

        case 21:
            return 'st';
            break;

        case 22:
            return 'nd';
            break;

        case 23:
            return 'rd';
            break;

        case 31:
            return 'st';
            break;

        case 32:
            return 'nd';
            break;

        case 33:
            return 'rd';
    }
    return 'th';
}
// </THEDAYEXTENSION>

// <THEME>
function JSB_BF_THEME(Usetheme) {
    // local variables
    var Newtheme;

    // Do nothing if it's that same as last time
    JSB_BF_USERVAR('currentTheme', Usetheme);
    At_Application.Item(jsbAccount() + '_lastTheme', Usetheme);
    At_Session.Item('lastTheme', Usetheme);
    window.saveAtSession();

    if ($('link[href*=\'bootstrap_' + CStr(Usetheme) + '.css\']').length) {
        return ''; // No Change;
    }
    JSB_BF_USERVAR('currentTheme', Usetheme);

    if (Usetheme) {
        Newtheme = '\<link href=' + jsEscapeHREF('./css/bootstrap_' + CStr(Usetheme) + '.css') + ' type="text/css" rel="stylesheet"\>';
        window.setTimeout(function () {
            $("link[href*='bootstrap_'][href*='.css']").remove();
            $("link[href*='jsb_mobile.css']").remove();
            $('head').append(Newtheme);
        }, 1);
    }

    return '';
}
// </THEME>

// <THEMONTH>
function JSB_BF_THEMONTH(Zdate) {
    if (Zdate === undefined) Zdate = Now();
    if (!InStr1(1, Zdate, '-')) Zdate = r83Date(Zdate);
    return Field(Zdate, '-', 2);
}
// </THEMONTH>

// <THEMONTHNAME>
function JSB_BF_THEMONTHNAME(Zdate) {
    return JSB_BF_MONTHNAME(CNum(JSB_BF_THEMONTH(Zdate)));
}
// </THEMONTHNAME>

// <THETIME>
function JSB_BF_THETIME(D) {
    // D should be a date.time (fractional) (from Now())
    // or may be a milliseconds seconds count (from time())

    return r83Time(D);
}
// </THETIME>

// <THEWEEKDAY>
function JSB_BF_THEWEEKDAY(Date) {
    if (Date === undefined) Date = Now();
    var Di = DayOfWeek(Date);
    return Split('Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday', ',')[+Di + 1];
}
// </THEWEEKDAY>

// <THEYEAR>
function JSB_BF_THEYEAR(Date) {
    if (Date === undefined) Date = Now();
    return Field(r83Date(Date), '-', 1);
}
// </THEYEAR>

// <TIMEDATE>
function JSB_BF_TIMEDATE(N) {
    if (N === undefined) N = Now();
    if (isNumeric(N)) return r83Time(N) + ' ' + JSB_BF_THEDAY(N) + ' ' + JSB_BF_THEMONTHNAME(N) + ' ' + JSB_BF_THEYEAR(N);
    return r83Date(N); // Convert string into numeric
}
// </TIMEDATE>

// <TRASHIT>
async function JSB_BF_TRASHIT(Fname, Iname) {
    var Ftrashcan = undefined;
    if (await asyncOpen("", 'trashcan', _fHandle => Ftrashcan = _fHandle)); else {
        if (await JSB_ODB_OPEN('', 'trashcan', Ftrashcan, function (_Ftrashcan) { Ftrashcan = _Ftrashcan })); else return false;
    }

    var Fdtrashcan = undefined;
    if (await asyncOpen('dict', 'trashcan', _fHandle => Fdtrashcan = _fHandle)); else {
        if (await JSB_ODB_OPEN('dict', 'trashcan', Fdtrashcan, function (_Fdtrashcan) { Fdtrashcan = _Fdtrashcan })); else return false;
    }

    var Tfname = LCase(await JSB_BF_TRUEFILENAME(CStr(Fname)));
    if (Tfname == 'tmp' || Tfname == 'trashcan') return false;

    var Fhandle = undefined;
    if (await asyncOpen("", Fname, _fHandle => Fhandle = _fHandle)); else {
        if (await JSB_ODB_OPEN('', CStr(Fname), Fhandle, function (_Fhandle) { Fhandle = _Fhandle })); else return false;
    }

    var Olditem = '';
    if (await JSB_ODB_READ(Olditem, Fhandle, CStr(Iname), function (_Olditem) { Olditem = _Olditem })); else return false;

    // put a 2MB size limit on items
    if (Len(Olditem) > 2097152) return;

    var Cntr = undefined;
    if (await JSB_ODB_READ(Cntr, Fdtrashcan, Tfname + ' ' + CStr(Iname), function (_Cntr) { Cntr = _Cntr })); else Cntr = 0;
    Cntr++;
    if (await JSB_ODB_WRITE(CStr(Cntr), Fdtrashcan, Tfname + ' ' + CStr(Iname))); else return false;

    if (await JSB_ODB_WRITE(CStr(Olditem), Ftrashcan, CStr(Iname) + '.' + CStr(Cntr))); else return false;
    return true;
}
// </TRASHIT>

// <TRIMWS>
function JSB_BF_TRIMWS(S) {
    var C = undefined;


    while (true) {
        C = Seq(Left(S, 1));
        if (Not((C > 0 && C <= 32) || C == 254)) break;
        S = Mid1(S, 2);
    }


    while (true) {
        C = Seq(Right(S, 1));
        if (Not((C > 0 && C <= 32) || C == 254)) break;
        S = Left(S, Len(S) - 1);
    }

    return S;
}
// </TRIMWS>

// <TRUEFILENAME>
async function JSB_BF_TRUEFILENAME(Fname) {
    var Ddata = LCase(Left(Fname, 5));
    var Tf = '';
    if (Ddata == 'data ' || Ddata == 'dict ') Tf = Mid1(Fname, 6); else Tf = Fname;
    if (Ddata != 'dict ') Ddata = '';

    var Fmd = undefined;
    if (await asyncOpen("", 'md', _fHandle => Fmd = _fHandle)); else return Stop(activeProcess.At_Errors);

    var Qfile = '';
    if (await asyncRead(Fmd, Tf, "", 0, _data => Qfile = _data)); else return Fname;

    Qfile = LCase(Qfile);
    var Spot = undefined;
    if (Locate('q', Qfile, 1, 0, 0, "", position => Spot = position)); else {
        if (Locate('qd', Qfile, 1, 0, 0, "", position => Spot = position)); else Spot = 0;
    }

    if (Spot) {
        Tf = Extract(Qfile, 3, Spot, 0);
        if (InStr1(1, Tf, '\\')) return Ddata + Tf;

        if (InStr1(1, Tf, '/')) {
            if (Right(Tf, 1) != '/') Tf += '/';
            return Ddata + Field(Tf, '/', Count(Tf, '/'));
        }
        return Ddata + Tf;
    }

    return Fname;
}
// </TRUEFILENAME>

// <TRUETABLENAME>
async function JSB_BF_TRUETABLENAME(Fname) {
    return await JSB_BF_TRUEFILENAME(CStr(Fname));
}
// </TRUETABLENAME>

// <TYPEOFCONNECTION>
async function JSB_BF_TYPEOFCONNECTION(Accountname) {
    if (Not(Accountname)) {
        if (System(1) == 'aspx') {
            if (CBool(await JSB_BF_ISSQLLITE())) return 'SqLite';
            if (isSqlServer()) return 'MSSQL';
        }

        Accountname = Account();
    } else {
        if (Not(isString(Accountname))) return JSB_BF_TYPEOFFILE(Accountname);
    }

    var Sysdef = '';
    if (await JSB_ODB_READ(Sysdef, await JSB_BF_FHANDLE('system'), Accountname, function (_Sysdef) { Sysdef = _Sysdef })); else {
        if (await JSB_ODB_READ(Sysdef, await JSB_BF_FHANDLE('system'), 'db_' + Accountname, function (_Sysdef) { Sysdef = _Sysdef })); else {
            if (Accountname == jsbAccount()) return 'FileSystem';
            activeProcess.At_Errors = 'Unknown account ' + Accountname;
            return undefined;
        }
    }

    var Dtype = UCase(Left(Extract(Sysdef, 1, 0, 0), 1));
    switch (Dtype) {
        case 'D':
            var Cnnstr = UCase(Extract(Sysdef, 2, 0, 0));
            if (InStr1(1, Cnnstr, '.OLEDB.')) return 'Access';
            if (InStr1(1, Cnnstr, 'SQLOLEDB.')) return 'MSSQL';
            if (InStr1(1, Cnnstr, 'DATA SOURCE=')) return 'SqLite';

            break;

        case 'P':
            return 'Pointer (Http)';
            break;

        case 'F':
            return 'FileSystem';
            break;

        case '!':
            return 'FileSystem';
    }

    activeProcess.At_Errors = 'Unknown account ' + Accountname;
    return undefined;
}
// </TYPEOFCONNECTION>

// <TYPEOFFILE>
function JSB_BF_TYPEOFFILE(Fhandle) {
    var T = '';

    if (Left(Fhandle, 1) == '@') return Mid1(Field(Fhandle, '.', 1), 2);

    if (System(1) == 'gae') {
        switch (Left(Fhandle, 1)) {
            case '0':
                return 'datastore';
                break;

            case '1':
                return 'memcache';
                break;

            case '2':
                return 'gaefilesystem';
                break;

            case '3':
                return 'http';
                break;

            case '4':
                return 'gdocs';
        };
    } else if (System(1) == 'js') {
        switch (Left(Fhandle, 1)) {
            case 'I':
                return 'indexedb';
                break;

            case 'F':
                return 'browserfilesystem';
                break;

            case '/':
                return 'http';
                break;

            case 'S':
                return 'localstorage';
                break;

            case 'A':
                return 'activex';
                break;

            case 'C':
                return 'javascriptinclude';
                break;

            case '-':
                return 'hybridstorage';
        }
        if (window.dotNetObj) {
            if (Left(Fhandle, 1) == 'H') return window.dotNetObj.dnoTypeOfFile(Mid1(Fhandle, 2));
        }
    }

    // Valid types are: ado, dos, rmt
    T = LCase(Field(Fhandle, ':', 1));
    if (T == 'ado' || T == 'dos' || T == 'rmt') return T;
    return undefined;
}
// </TYPEOFFILE>

// <UIADDITIONALATTRIBUTES>
function JSB_BF_UIADDITIONALATTRIBUTES(Oadditionalattributes) {
    // local variables
    var Atr;

    var Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ' ', Oadditionalattributes);
    var Uielements = [undefined, 'class', 'style', 'on', 'placeholder'];
    var Result = [undefined,];

    for (Atr of iterateOver(Additionalattributes)) {
        var F1 = Field(Atr, '=', 1);
        if (Left(F1, 2) == 'on') F1 = 'on';
        if (Locate(F1, Uielements, 0, 0, 0, "", position => { })) Result[Result.length] = Atr;
    }

    return Join(Result, ' ');
}
// </UIADDITIONALATTRIBUTES>

// <UNESCAPESTRING>
function JSB_BF_UNESCAPESTRING(ByRef_Ss, setByRefValues) {
    // local variables
    var P, T, V;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Ss)
        return v
    }
    P = 0;

    while (true) {
        P = InStr1(+P + 1, ByRef_Ss, '\\');
        if (Not(CBool(P))) break;
        T = LCase(Mid1(ByRef_Ss, +P + 1, 1));
        switch (true) {
            case T == '\\':
                ByRef_Ss = Left(ByRef_Ss, +P - 1) + Mid1(ByRef_Ss, +P + 1);
                break;

            case isNumber(T):
                V = CNum(Mid1(ByRef_Ss, +P + 1, 4));
                ByRef_Ss = Left(ByRef_Ss, +P - 1) + Chr(V) + Mid1(ByRef_Ss, +P + Len(V) + 1);
                break;

            case T == 'x':
                V = XTD(Mid1(ByRef_Ss, +P + 2, 2));
                ByRef_Ss = Left(ByRef_Ss, +P - 1) + Chr(V) + Mid1(ByRef_Ss, +P + Len(V) + 2);
        }
    }
    return exit(ByRef_Ss);
}
// </UNESCAPESTRING>

// <UNLOAD_UPLOADBOX>
async function JSB_BF_UNLOAD_UPLOADBOX(Id, Filestoragedirectory, Registerinsystem, Prefix, Filenamesuffix, ByRef_Shortname, setByRefValues) {
    var me = new jsbRoutine("JSB_BF", "unload_uploadbox", "JSB_BF_UNLOAD_UPLOADBOX");
    me.localValue = function (varName) { return eval(varName) }
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Shortname)
        return v
    }
    await dbgCheck(me, 17, true /* modal */);
    await dbgCheck(me, 18);
    await dbgCheck(me, 19);
    if (Not(Filestoragedirectory)) Filestoragedirectory = 'uploads';
    await dbgCheck(me, 20);

    await dbgCheck(me, 21);
    // Upload a file
    await dbgCheck(me, 22);
    var Httppostedfile = At_Request.Files(Id);
    await dbgCheck(me, 23);
    if (Not(Httppostedfile)) return exit(undefined);
    await dbgCheck(me, 24);

    await dbgCheck(me, 25);
    var Actualname = Httppostedfile.FileName;
    await dbgCheck(me, 26);
    if (Not(Actualname)) return exit(undefined);
    await dbgCheck(me, 27);

    await dbgCheck(me, 28);
    // Get contents
    await dbgCheck(me, 29);
    var Uploadedfilecontents = await JSB_HTML_REQUESTFILE(CStr(Id));
    await dbgCheck(me, 30);
    ByRef_Shortname = CStr(Prefix) + Actualname;
    await dbgCheck(me, 31);

    await dbgCheck(me, 32);
    // create long name
    await dbgCheck(me, 33);
    var Longname = CStr(Prefix) + Actualname;
    await dbgCheck(me, 34);
    if (Filenamesuffix) Longname = dropIfRight(Longname, '.') + CStr(Filenamesuffix) + '.' + fieldIfRight(Longname, '.');
    await dbgCheck(me, 35);

    await dbgCheck(me, 36);
    var Ext = '';
    await dbgCheck(me, 37);
    if (Registerinsystem) {
        await dbgCheck(me, 38);
        Ext = LCase(fieldIfRight(Longname, '.'));
        await dbgCheck(me, 39);
        if (Locate(Ext, [undefined, 'accdb', 'xlsx', 'mdb', 'db3'], 0, 0, 0, "", position => { })); else {
            await dbgCheck(me, 40);
            activeProcess.At_Errors = Longname + ' is not an accetable type for accounts and/or databases (use .mdb, .accdb or .db3)';
            await dbgCheck(me, 41);
            return exit(undefined);
            await dbgCheck(me, 42);
        }
        await dbgCheck(me, 43);
    }
    await dbgCheck(me, 44);

    await dbgCheck(me, 45);
    if (await JSB_ODB_WRITE(Uploadedfilecontents, await JSB_BF_FHANDLE('', Filestoragedirectory, true), Longname)); else return exit(undefined);
    await dbgCheck(me, 46);
    if (!Registerinsystem) return exit(Longname);
    await dbgCheck(me, 47);

    await dbgCheck(me, 48);
    var Priorsystemdef = '';
    await dbgCheck(me, 49);
    if (await JSB_ODB_READ(Priorsystemdef, await JSB_BF_FHANDLE('system'), ByRef_Shortname, function (_Priorsystemdef) { Priorsystemdef = _Priorsystemdef })) {
        await dbgCheck(me, 50);
        if (await JSB_ODB_WRITE(Priorsystemdef, await JSB_BF_FHANDLE('system'), 'x' + Longname)); else Alert(CStr(activeProcess.At_Errors));
        await dbgCheck(me, 51);
    }
    await dbgCheck(me, 52);

    await dbgCheck(me, 53);
    // Path will be embedded in a Data Source string, so use \\ as a seperator
    await dbgCheck(me, 54);
    var Path = '';
    await dbgCheck(me, 55);
    if (Filestoragedirectory == 'uploads') {
        await dbgCheck(me, 56);
        Path = '\<\<root\>\>\\\\uploads\\\\';
        await dbgCheck(me, 57);
    } else if (Filestoragedirectory == 'database') {
        await dbgCheck(me, 58);
        Path = '\<\<root\>\>\\\\App_Data\\\\_database\\\\';
        await dbgCheck(me, 59);
    } else {
        await dbgCheck(me, 60);
        Path = '\<\<root\>\>\\\\App_Data\\\\_database\\\\' + Filestoragedirectory + '\\\\';
        await dbgCheck(me, 61);
    }
    await dbgCheck(me, 62);

    await dbgCheck(me, 63);
    var Ds = '';
    await dbgCheck(me, 64);
    if (Ext == 'accdb') {
        await dbgCheck(me, 65);
        Ds = 'Provider=Microsoft.ACE.OLEDB.12.0;Data Source="' + Path + Longname + '";Persist Security Info=False';
        await dbgCheck(me, 66);
    } else if (Ext == 'xlsx') {
        await dbgCheck(me, 67);
        Ds = 'Provider=Microsoft.ACE.OLEDB.12.0;Data Source="' + Path + Longname + '";Extended Properties="Excel 12.0 Xml;HDR=YES"';
        await dbgCheck(me, 68);
    } else if (Ext == 'mdb') {
        await dbgCheck(me, 69);
        Ds = 'Provider=Microsoft.Jet.OLEDB.4.0;Data Source="' + Path + Longname + '";Persist Security Info=False';
        await dbgCheck(me, 70);
    } else {
        await dbgCheck(me, 71);
        Ds = 'Data Source="' + Path + Longname + '";Version=3;New=False;Compress=False;Pooling=True;datetimeformat=CurrentCulture';
        await dbgCheck(me, 72);
    }
    await dbgCheck(me, 73);

    await dbgCheck(me, 74);
    // Write a short version?
    await dbgCheck(me, 75);
    if (Registerinsystem == 2) { if (await JSB_ODB_WRITE('D' + am + Ds, await JSB_BF_FHANDLE('System'), ByRef_Shortname)); else return exit(undefined); }
    await dbgCheck(me, 76);

    await dbgCheck(me, 77);
    if (ByRef_Shortname != Longname) { if (await JSB_ODB_WRITE('D' + am + Ds, await JSB_BF_FHANDLE('System'), Longname)); else null; }
    await dbgCheck(me, 78);

    await dbgCheck(me, 79);
    return exit(Longname);
    await dbgCheck(me, 80);
    return exit();
}
// </UNLOAD_UPLOADBOX>

// <UNLOCKORIENTATION_Sub>
function JSB_BF_UNLOCKORIENTATION_Sub() {
    if (hasPlugIn('cordova-plugin-screen-orientation')) window.screen.orientation.unlock();
}
// </UNLOCKORIENTATION_Sub>

// <UNTRASHIT>
async function JSB_BF_UNTRASHIT(Fname, Iname) {
    // local variables
    var Currentitem, Restoreitem, Tfname;

    var Cntr = await JSB_BF_PREVIOUSVERSIONNUMBER(CStr(Fname), CStr(Iname));
    if (!Cntr) return false;

    var Fhandle = undefined;
    if (await asyncOpen("", Fname, _fHandle => Fhandle = _fHandle)); else {
        if (await JSB_ODB_OPEN('', CStr(Fname), Fhandle, function (_Fhandle) { Fhandle = _Fhandle })); else return false;
    }

    var Ftrashcan = undefined;
    if (await asyncOpen("", 'trashcan', _fHandle => Ftrashcan = _fHandle)); else {
        if (await JSB_ODB_OPEN('', 'trashcan', Ftrashcan, function (_Ftrashcan) { Ftrashcan = _Ftrashcan })); else return false;
    }

    if (await JSB_ODB_READ(Currentitem, Fhandle, CStr(Iname), function (_Currentitem) { Currentitem = _Currentitem })) {
        if (await JSB_ODB_WRITE(CStr(Currentitem), Ftrashcan, CStr(Iname) + '._' + CStr(Cntr))); else null;
    }

    if (await JSB_ODB_READ(Restoreitem, Ftrashcan, CStr(Iname) + '.' + CStr(Cntr), function (_Restoreitem) { Restoreitem = _Restoreitem })); else return false;
    if (await JSB_ODB_WRITE(CStr(Restoreitem), Fhandle, CStr(Iname))); else return false;
    if (await JSB_ODB_DELETEITEM(Ftrashcan, CStr(Iname) + '.' + CStr(Cntr))); else return Stop(activeProcess.At_Errors);

    Cntr--;
    var Fdtrashcan = undefined;
    if (await asyncOpen('dict', 'trashcan', _fHandle => Fdtrashcan = _fHandle)); else {
        if (await JSB_ODB_OPEN('dict', 'trashcan', Fdtrashcan, function (_Fdtrashcan) { Fdtrashcan = _Fdtrashcan })); else return false;
    }

    Tfname = LCase(await JSB_BF_TRUEFILENAME(CStr(Fname)));
    if (Cntr) {
        if (await JSB_ODB_WRITE(CStr(Cntr), Fdtrashcan, CStr(Tfname) + ' ' + CStr(Iname))); else return false;
    } else {
        if (await JSB_ODB_DELETEITEM(Fdtrashcan, CStr(Tfname) + ' ' + CStr(Iname))); else return false;
    }

    return true;
}
// </UNTRASHIT>

// <UPDATECOLUMNDEFINITIONS>
async function JSB_BF_UPDATECOLUMNDEFINITIONS(ByRef_Tablename, ByRef_Newdefs, ByRef_Suppressmsgs, setByRefValues) {
    // local variables
    var Default_Latname, Default_Lngname, Cname, Lcname, Actual_Latname;
    var Actual_Lngname;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tablename, ByRef_Newdefs, ByRef_Suppressmsgs)
        return v
    }
    var DictColumns = undefined;
    var Previousdef = undefined;
    var Changed = undefined;
    var Fdicthandle = undefined;
    var Fhandle = undefined;
    var J = undefined;
    var Sqlcolumn = undefined;
    var Sl = undefined;
    var Id = '';
    var Dictcol = undefined;

    DictColumns = [undefined,];

    if (await JSB_ODB_OPEN('dict', CStr(ByRef_Tablename), Fdicthandle, function (_Fdicthandle) { Fdicthandle = _Fdicthandle })); else {
        if (await JSB_ODB_OPEN('', CStr(ByRef_Tablename), Fhandle, function (_Fhandle) { Fhandle = _Fhandle })); else return exit(DictColumns);
        Fdicthandle = await JSB_BF_FHANDLE('DICT', ByRef_Tablename, true);
    }

    // Get Previous !defs
    if (await JSB_ODB_SELECTTO('', Fdicthandle, 'ItemID like \'!%\'', Sl, function (_Sl) { Sl = _Sl })); else { await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors)); return exit([undefined,]); }

    while (true) {
        Id = readNext(Sl).itemid;
        if (Id); else break
        if (Not(+Id)) break;
        if (await JSB_ODB_READJSON(J, Fdicthandle, CStr(Id), function (_J) { J = _J })) DictColumns[DictColumns.length] = J
    }

    Default_Latname = '';
    Default_Lngname = '';

    for (Sqlcolumn of iterateOver(ByRef_Newdefs)) {
        Previousdef = false;
        Cname = Sqlcolumn.name;
        Lcname = LCase(Cname);

        if (Not(Default_Lngname)) {
            if (InStr1(1, Lcname, 'longitude')) Default_Lngname = Cname;
        }

        if (Not(Default_Latname)) {
            if (InStr1(1, Lcname, 'latitude')) Default_Latname = Cname;
        }

        if (CBool(Sqlcolumn.isLatitude)) {
            if (isEmpty(Actual_Latname)) Actual_Latname = Cname; else Sqlcolumn.isLatitude = false;
        }

        if (CBool(Sqlcolumn.isLongitude)) {
            if (isEmpty(Actual_Lngname)) Actual_Lngname = Cname; else Sqlcolumn.isLongitude = false;
        }

        for (Dictcol of iterateOver(DictColumns)) {
            if (Null0(Dictcol.name) == Null0(Cname)) {
                Previousdef = true;
                break;
            }
        }

        if (Previousdef) {
            // Check if ADO updated anything important
            Changed = false;
            if (Null0(Dictcol.datatype) != Null0(Sqlcolumn.datatype)) { Dictcol.datatype = Sqlcolumn.datatype; Changed = true; }
            if (Null0(Dictcol.primarykey) != Null0(Sqlcolumn.primarykey)) { Dictcol.primarykey = Sqlcolumn.primarykey; Changed = true; }
            if (Null0(Dictcol.canedit) != Null0(Sqlcolumn.canedit)) { Dictcol.canedit = Sqlcolumn.canedit; Changed = true; }
            if (Null0(Dictcol.defaultvalue) != Null0(Sqlcolumn.defaultvalue)) { Dictcol.defaultvalue = Sqlcolumn.defaultvalue; Changed = true; }
            if (Null0(Dictcol.ordinal) != Null0(Sqlcolumn.ordinal)) { Dictcol.ordinal = Sqlcolumn.ordinal; Changed = true; }
            if (Null0(Dictcol.maxlength) != Null0(Sqlcolumn.maxlength)) { Dictcol.maxlength = Sqlcolumn.maxlength; Changed = true; }

            if (Changed) {
                if (await JSB_ODB_WRITE(CStr(Dictcol), Fdicthandle, '!' + Change(Cname, Chr(160), Chr(32)))); else return Stop(At(-1), 'getTableColumnDefs: ', 'Modeler-', System(28), ': ', activeProcess.At_Errors);
            }
        } else {
            if (await JSB_ODB_WRITEJSON(Sqlcolumn, Fdicthandle, '!' + Change(Cname, Chr(160), Chr(32)))); else return Stop(activeProcess.At_Errors);
            DictColumns[DictColumns.length] = Sqlcolumn;
        }
    }

    if (!isEmpty(Default_Latname) && isEmpty(Actual_Latname)) {
        for (Sqlcolumn of iterateOver(DictColumns)) {
            if (Null0(Sqlcolumn.name) == Null0(Default_Latname)) {
                Sqlcolumn.isLatitude = true;
                if (await JSB_ODB_WRITEJSON(Sqlcolumn, Fdicthandle, '!' + Change(Default_Latname, Chr(160), Chr(32)))); else return Stop(activeProcess.At_Errors);
                break;
            }
        }
    }

    if (!isEmpty(Default_Lngname) && isEmpty(Actual_Lngname)) {
        for (Sqlcolumn of iterateOver(DictColumns)) {
            if (Null0(Sqlcolumn.name) == Null0(Default_Lngname)) {
                Sqlcolumn.isLongitude = true;
                if (await JSB_ODB_WRITEJSON(Sqlcolumn, Fdicthandle, '!' + Change(Default_Lngname, Chr(160), Chr(32)))); else return Stop(activeProcess.At_Errors);
                break;
            }
        }
    }

    return exit(DictColumns);

    return exit(DictColumns);
}
// </UPDATECOLUMNDEFINITIONS>

// <UPDATEJSBCONFIG_Sub>
async function JSB_BF_UPDATEJSBCONFIG_Sub(Varname, Newvalue) {
    var F_Config = undefined;

    JSB_BF_USERVAR('config ' + CStr(Varname), Newvalue);

    if (await asyncOpen("", 'jsb_config', _fHandle => F_Config = _fHandle)) {
        if (isJSON(Newvalue) || CBool(isArray(Newvalue))) {
            if (await asyncWrite(Newvalue, F_Config, Varname, "JSON", 0)); else null;
        } else {
            if (await asyncWrite(CStr(Newvalue, true), F_Config, Varname, "", 0)); else null;
        }
    }
}
// </UPDATEJSBCONFIG_Sub>

// <URL>
function JSB_BF_URL() {
    if (System(1) == 'gae') {
        return At_Request.URL;;
    } else if (System(1) == 'aspx') {
        var Root = At_Request.serverVariables('HTTP_X_ORIGINAL_ROOT');
        if (Root) return CStr(Root, true) + CStr(At_Request.serverVariables('HTTP_X_ORIGINAL_URL'), true);
        return CStr(At_Request.URL, true);;
    } else {
        return window.myLocation();
    }
}
// </URL>

// <URLESCAPE>
function JSB_BF_URLESCAPE(Url) {
    return urlEncode(Url);
}
// </URLESCAPE>

// <URLPARAM>
function JSB_BF_URLPARAM(Keynameornotused, Indx) {
    if (Indx === undefined) return JSB_BF_QUERYVAR(CStr(Keynameornotused));
    return JSB_BF_QUERYVAR('_p' + CStr(Indx));
}
// </URLPARAM>

// <URLSENTENCE>
function JSB_BF_URLSENTENCE(Url) {
    return window.urlSentence(Url).tclCmd;
}
// </URLSENTENCE>

// <URLUNESCAPE>
function JSB_BF_URLUNESCAPE(Xml) {
    return urlDecode(Xml);
}
// </URLUNESCAPE>

// <USERDOMAIN>
function JSB_BF_USERDOMAIN() {
    var _Domain = '';

    if (System(1) == 'gae') {
        return At_Request.userdomain;;
    } else if (System(1) == 'aspx') {
        _Domain = At_Request.Url.Host;
        if (_Domain == 'sslifwisiis') _Domain = 'fishandgame.idaho.gov';
        if (!InStr1(1, _Domain, '.')) {
            if (!isNothing(At_Request.UrlReferrer)) {
                _Domain = At_Request.UrlReferrer.Host;
            }
        }
        return _Domain;
    } else {
        return 'localhost';
    }
}
// </USERDOMAIN>

// <USERNAME>
function UserName() {
    var _Userno = userno();
    if (Not(At_Session.Item(_Userno))) { At_Session.Item(_Userno, {}); }
    if (CBool(At_Session.Item(_Userno).UserName)) return At_Session.Item(_Userno).UserName;
    return 'anonymous';
}
// </USERNAME>

// <USERVAR>
function JSB_BF_USERVAR(Varname, Newvalue, _Userno) {
    var Userdata = undefined;

    if (Not(_Userno)) _Userno = userno();
    if (Not(At_Session.Item(_Userno))) { At_Session.Item(_Userno, {}); }
    Userdata = At_Session.Item(_Userno);

    var Oldvalue = Userdata[Varname];

    // assignment or fetch?
    if (Newvalue === undefined) return Oldvalue;

    if (!isNothing(Oldvalue)) {
        if (Null0(Oldvalue) == Null0(Newvalue)) return false;
    }

    Userdata[Varname] = Newvalue;
    if (System(1) == 'js') window.saveAtSession();

    return true;
}
// </USERVAR>

// <VERIFYUSER>
async function JSB_BF_VERIFYUSER(ByRef__Username, Password, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Username)
        return v
    }
    var Success = undefined;
    var F_Users = undefined;
    var Config = undefined;
    var Profile = undefined;
    var Authtype = '';
    var Emdomain = '';
    var Oauthauthority = '';
    var Userinfo = undefined;

    if (Left(userno(), 4) == 'rpc:') {
        Authtype = 'local';
    } else {
        Config = await JSB_BF_JSBCONFIG('authenticationtype');
        if (Not(Config)) {
            Config = {};
            Authtype = 'local';
        } else {
            Authtype = Config.value;
        }
    }

    Success = false;

    switch (Authtype) {
        case 'none':
            return exit(true);

            break;

        case 'aspx':
            try {
                if (CBool(At_Membership.ValidateUser(ByRef__Username, Password))) Success = true;
            } catch (Xerr) { }

            break;

        case 'oauth':
            Oauthauthority = Config.oauth_authority;
            Oauthauthority = dropIfRight(Oauthauthority, '_config');

            if (Oauthauthority) {
                if (await JSB_ODB_OAUTH_LOGIN(Oauthauthority, false)) {
                    Success = true;
                    Userinfo = await JSB_ODB_OAUTHWHO();
                    if (CBool(Userinfo)) {
                        if (CBool(Userinfo.username) && (!ByRef__Username || LCase(ByRef__Username) == LCase(Userinfo.username))) {
                            ByRef__Username = Userinfo.username;
                            if (LCase(Left(ByRef__Username, Len(Oauthauthority))) != LCase(Oauthauthority)) ByRef__Username = Oauthauthority + '-' + ByRef__Username;

                            if (await asyncOpen("", 'JSB_USERS', _fHandle => F_Users = _fHandle)); else return exit(true);
                            if (await asyncRead(F_Users, ByRef__Username, "JSON", 0, _data => Profile = _data)); else {
                                Profile = {};
                                Profile.username = ByRef__Username;
                                Profile.password = 'X';
                                Profile.isinrole = [undefined,];
                                Profile.disabled = false;

                                if (CBool(Userinfo.email)) {
                                    Profile.email = Userinfo.email;
                                    Emdomain = LCase(dropLeft(CStr(Userinfo.email), '@'));
                                    if (Left(Emdomain, Len(Oauthauthority) + 1) == Oauthauthority + '.') Profile.isinrole = [undefined, 'employee'];
                                }

                                if (await asyncWrite(Profile, F_Users, ByRef__Username, "JSON", 0)); else null;
                            }
                        }
                    }
                }
            }

            break;

        case 'gae':
            break;

        case 'server':
            if (System(1) == 'js' && ByRef__Username) {
                if (CBool(await asyncRpcRequest('SERVERVERIFYUSER', ByRef__Username, Password, function (_ByRef__Username, _Password) { }))) Success = true;
            }
    }

    if (!Success && System(1) == 'aspx') Success = IsLocalHost();

    if (await asyncOpen("", 'JSB_USERS', _fHandle => F_Users = _fHandle)); else return exit(Success);
    if (await asyncRead(F_Users, ByRef__Username, "JSON", 0, _data => Profile = _data)); else return exit(Success);

    if (Null0(Profile.errorcount) > 15 || CBool(Profile.disabled)) {
        Profile.disabled = true;
    } else {
        if (!Success) {
            if (Not(Profile.password)) {
                if (System(1) == 'js') {
                    Success = true;
                } else {
                    if (Locate('admin', Profile.isinrole, 0, 0, 0, "", position => { })) Success = false; else Success = true;
                }
            } else if (Profile.password == 'X') {
                Success = false;;
            } else if (Left(Profile.password, 1) == Chr(252)) {
                // encoded already
                if (Profile.password == Chr(252) + STX(aesEncrypt(Password))) Success = true;
            } else {
                if (Null0(Profile.password) == Null0(Password)) {
                    Success = true;
                    Profile.password = Chr(252) + STX(aesEncrypt(Password));
                }
            }
        }

        if (Success) {
            Profile.errorcount = 0;
            Profile.lastlogin = DateTime();
            Profile.lasturl = Field(JSB_BF_URL(), '?', 1);
            if (CBool(Userinfo)) if (CBool(Userinfo.email)) Profile.email = Userinfo.email;
            if (await asyncWrite(Profile, F_Users, ByRef__Username, "JSON", 0)); else null;
            Success = Not(Profile.disabled);
        } else {
            Profile.errorcount = CNum(Profile.errorcount) + 1;
        }
    }

    if (await asyncWrite(Profile, F_Users, ByRef__Username, "JSON", 0)); else null;
    return exit(Success);
}
// </VERIFYUSER>

// <VIBRATE_Sub>
function JSB_BF_VIBRATE_Sub(Milliseconds) {
    if (hasPlugIn('cordova-plugin-vibration')) window.navigator.vibrate(3000);
}
// </VIBRATE_Sub>

// <VIEWCOLUMNS>
async function JSB_BF_VIEWCOLUMNS() {
    return [undefined,
        { "name": 'name', "index": 1, "label": 'Name', "datatype": 'string', "primarykey": true, "width": '30em', "control": 'label', "align": 'left', "canedit": false },
        { "name": 'minimumRole', "label": 'minimum Role', "defaultvalue": '', "index": 2, "width": 18, "control": 'dropdownbox', "addBlank": true, "canedit": true, "required": false, "notblank": false, "reflist": 'Admin;Director;Manager;Clerk;Employee;User;Anonymous' },
        { "name": 'index', "index": 3, "label": 'Position', "datatype": 'integer', "width": '12em', "control": 'textbox', "align": 'right', "canedit": true, "display": 'hidden' },
        { "name": 'canedit', "index": 4, "label": 'Editable', "width": '12em', "control": 'checkbox', "canedit": true, "required": false, "notblank": false, "defaultvalue": 1, "reflist": 'false,0;true,1' },
        { "name": 'nounload', "index": 5, "label": 'No Unload', "width": '12em', "control": 'checkbox', "canedit": true, "required": false, "notblank": false, "defaultvalue": 0, "reflist": 'false,0;true,1' },

        { "index": 6 },

        { "name": 'control', "index": 7, "label": 'Control', "width": '12em', "control": 'dropDownBox', "autopostback": true, "canedit": true, "required": true, "notblank": true, "defaultvalue": 'textbox', "reffile": 'jsb_ctls', "refpk": 'ItemID' },
        { "name": 'display', "index": 8, "label": 'Display', "width": '12em', "control": 'dropDownBox', "canedit": true, "required": true, "notblank": true, "display": 'visible', "defaultvalue": 'visible', "reflist": 'visible;hidden;gridhidden' },

        { "name": 'pickfunction', "index": 9, "label": 'Pick from page', "width": '12em', "control": 'combobox', "canedit": true, "required": false, "notblank": false, "defaultvalue": '', "reffile": 'dict {projectname}', "refpk": 'ItemID', "refwhere": 'ItemID Like \'%.page\'', "pickfunction": 'edp_pick?projectName={projectname}' },
        { "name": 'pickpbfunction', "index": 9, "label": 'Pick CS Function', "width": '12em', "control": 'textbox', "canedit": true, "required": false, "notblank": false, "defaultvalue": '' },

        { "index": 10 },

        { "name": 'width', "index": 11, "label": 'Width', "width": '13em', "control": 'textbox', "canedit": true, "required": false, "notblank": false, "defaultvalue": '' },

        { "name": 'newlineprefix', "index": 12, "label": 'Prefix NewLine', "width": '12em', "control": 'checkbox', "canedit": true, "required": false, "notblank": false, "reflist": 'false,0;true,1' },
        { "name": 'ctlstyle', "index": 13, "label": 'Control css style', "width": '12em', "control": 'textbox', "canedit": true, "required": false, "notblank": false, "display": 'gridhidden' },
        { "name": 'lblstyle', "index": 14, "label": 'Label css style', "width": '12em', "control": 'textbox', "canedit": true, "required": false, "notblank": false, "display": 'gridhidden' },
        { "name": 'suppresslabel', "index": 15, "label": 'Suppress Label', "width": '12em', "control": 'checkbox', "canedit": true, "required": false, "notblank": false, "defaultvalue": '0', "reflist": 'false,0;true,1' },
        { "name": 'fullline', "index": 16, "label": 'Full Line', "width": '12em', "control": 'checkbox', "canedit": true, "required": false, "notblank": false, "defaultvalue": '0', "reflist": 'false,0;true,1' },

        { "name": 'collaspestart', "index": 17, "label": 'collaspe Start', "width": '12em', "control": 'textbox', "canedit": true, "required": false, "notblank": false },
        { "name": 'collaspeend', "index": 18, "label": 'collaspe End', "width": '12em', "control": 'checkbox', "canedit": true, "required": false, "notblank": false, "defaultvalue": '0', "reflist": 'false,0;true,1' },
        { "name": 'collaspopen', "index": 19, "label": 'collaspe Open', "width": '12em', "control": 'checkbox', "canedit": true, "required": false, "notblank": false, "defaultvalue": '0', "reflist": 'false,0;true,1' },

        { "index": 20 },

        { "name": 'jsconditionals', "index": 22, "fullline": true, "label": 'js conditionals', "datatype": 'jsonarray', "width": 90, "control": 'json_inline', "canedit": true, "addrowtxt": 'Add a Javascript Condition', "rmvrowtxt": 'DEL', "form": 'grid', "reffile": 'jsb_jsondefs', "refpk": 'viewRequiredness' }

    ];
}
// </VIEWCOLUMNS>

// <WHEREDYNAMICOPERATOR>
async function JSB_BF_WHEREDYNAMICOPERATOR(Docompareas, Dbtype, Fieldname, Uservalue, Defaultop) {
    // local variables
    var Uservalues, Tmpvals, Inlistvalues;

    var Stdop = undefined;
    var _Issqlserver = undefined;
    var Ismsaccess = undefined;
    var Isfilesystem = undefined;
    var Issqlite = undefined;
    var Op = '';
    var Rop = '';
    var Luservalue = '';

    // Check for user defined operation
    Op = Left(Uservalue, 2);
    if (Left(Fieldname, 1) != '[') Fieldname = '[' + CStr(Fieldname) + ']';

    // Determine operator and valid doCompareAs type
    if (Locate(Op, [undefined, '!=', '\<\>', '\<=', '\>='], 0, 0, 0, "", position => { })) {
        Stdop = true;
        if (Op == '!=') Op = '\<\>';
        Uservalue = LTrim(Mid1(Uservalue, 3));;
    } else if (Defaultop == 'InList') {
        Op = 'In';
        if (Docompareas != 'integer') Docompareas = 'string';
        Uservalues = Split(Uservalue, ',', 4);
        Tmpvals = [undefined,];
        if (Docompareas == 'string') {
            for (Uservalue of iterateOver(Uservalues)) {
                Uservalue = '\'' + Change(Uservalue, '\'', '\'\'') + '\'';
                Tmpvals[Tmpvals.length] = Uservalue;
            }
        } else {
            for (Uservalue of iterateOver(Uservalues)) {
                if (Left(Uservalue, 1) == '\'' && Right(Uservalue, 1) == '\'') Uservalue = Mid1(Uservalue, 2, Len(Uservalue) - 2);
                Tmpvals[Tmpvals.length] = CNum(Uservalue);
            }
        }
        Inlistvalues = Join(Tmpvals, ',');

        Stdop = true;;
    } else {
        Op = Left(Uservalue, 1);
        if (Locate(Op, [undefined, '=', '\<', '\>'], 0, 0, 0, "", position => Stdop = position)) {
            Uservalue = LTrim(Mid1(Uservalue, 2));
        } else {
            Stdop = false;
            // check for %...% or [...]
            Rop = Right(Uservalue, 1);
            if (Op == '%' || Op == '[' || Rop == '%' || Rop == ']') {
                if (Op == '[') Uservalue = '%' + Mid1(Uservalue, 2);
                if (Rop == ']') Uservalue = Left(Uservalue, Len(Uservalue) - 1) + '%';
                Docompareas = 'string';
                Op = 'like';;
            } else if (Defaultop) {
                switch (LCase(Defaultop)) {
                    case 'like ...%':
                        Uservalue += '%';
                        Docompareas = 'string';
                        Op = 'like';

                        break;

                    case 'like %...%':
                        Uservalue = '%' + Uservalue + '%';
                        Docompareas = 'string';
                        Op = 'like';

                        break;

                    case 'like %...':
                        Uservalue = '%' + Uservalue;
                        Docompareas = 'string';
                        Op = 'like';

                        break;

                    case 'dynamic':
                        Op = '=';

                        break;

                    default:
                        Op = Defaultop;
                        Stdop = true;
                }
            } else {
                Op = '=';
                Stdop = true;
            }
        }
    }

    switch (UCase(await JSB_BF_TYPEOFCONNECTION())) {
        case 'MSSQL':
            _Issqlserver = true;
            break;

        case 'ACCESS':
            Ismsaccess = true;
            break;

        case 'FILESYSTEM':
            Isfilesystem = true;
            break;

        default:
            Issqlite = true;
            if (Dbtype == 'guid') Dbtype = 'string';
            if (Dbtype == 'boolean') Dbtype = 'integer';
            if (Dbtype == 'date') Dbtype = 'string';
            if (Dbtype == 'datetime') Dbtype = 'string';
            if (Dbtype == 'currency') Dbtype = 'integer';
    }

    if (_Issqlserver || Ismsaccess) {
        if (Len(Uservalue) == 4 && (Docompareas == 'datetime' || Docompareas == 'date')) Docompareas = 'year';

        switch (Docompareas) {


















            case 'string':
                Uservalue = '\'' + Change(Uservalue, '\'', '\'\'') + '\'';
                Fieldname = 'isnull(' + Fieldname + ', \'\')';

                switch (Dbtype) {
                    case 'guid': case 'integer': case 'autointeger': case 'currency':
                        Fieldname = 'convert(varchar(50), ' + Fieldname + ')';
                        Uservalue = 'convert(varchar(50), ' + Uservalue + ')';

                        break;

                    case 'boolean':
                        Fieldname = 'convert(varchar(50), ' + Fieldname + ')';
                        if (LCase(Uservalue) == '\'false\'' || Uservalue == '\'\'' || Uservalue == '\'0\'') Uservalue = '\'0\''; else Uservalue = '\'1\'';

                        break;

                    case 'double':
                        // 2.2000012095022E+5
                        Fieldname = 'convert(varchar(50), ' + Fieldname + ', 128)';
                        Uservalue = 'convert(varchar(50), ' + Uservalue + ', 128)';

                        break;

                    case 'date':
                        // sql date: 2019-10-31
                        Fieldname = 'convert(varchar(50), ' + Fieldname + ', 23)';
                        Uservalue = 'convert(varchar(50), ' + Uservalue + ', 23)';

                        break;

                    case 'time':
                        // sql time - datetime or time
                        Fieldname = 'convert(varchar(50), ' + Fieldname + ', 8)';
                        Uservalue = 'convert(varchar(50), ' + Uservalue + ', 8)';

                        break;

                    case 'datetime':
                        // sql datetime: 2019-10-31 12:38:54
                        Fieldname = 'convert(varchar(50), ' + Fieldname + ', 20)';
                        Uservalue = 'convert(varchar(50), ' + Uservalue + ', 20)';

                        break;

                    case 'blob': case 'png': case 'jpg':
                        // varbinary(MAX)
                        Fieldname = 'convert(varchar(max), ' + Fieldname + ')';

                }
                if (Op == 'In') Uservalues = Join(Tmpvals, ',');

                // compare as a number
                break;

            case 'number': case 'boolean':
                Luservalue = LCase(Uservalue);
                if (Count(Uservalue, '/') == 2 || Count(Uservalue, '-') == 2 || Count(Uservalue, ':') == 3) {
                    Uservalue = 'convert(float, convert(datetime, \'' + Uservalue + '\'))';
                } else if (Luservalue == 'false' || Luservalue == 'no') {
                    Uservalue = '0';
                } else if (Luservalue == 'true' || Luservalue == 'yes') {
                    Uservalue = '1';
                } else if (CStr(CNum(Uservalue), true) != CStr(Uservalue, true)) {
                    Uservalue = 'convert(float, \'' + Uservalue + '\')';
                }

                switch (Dbtype) {
                    case 'guid':
                        // sql uniqueidentifier
                        Fieldname = 'isnull(convert(float, convert(varbinary(8), ' + Fieldname + ', 1)), 0)';

                        break;

                    case 'integer': case 'autointeger': case 'double': case 'currency':
                        Fieldname = 'isnull(' + Fieldname + ', 0)';

                        break;

                    case 'boolean':
                        Fieldname = 'isnull(' + Fieldname + ', 0)';

                        break;

                    case 'date': case 'time': case 'datetime':
                        // sql date: 2019-10-31
                        Fieldname = 'isnull(convert(float, convert(datetime, ' + Fieldname + ')), 0)';

                        break;

                    case 'blob': case 'png': case 'jpg':
                        // varbinary(MAX)
                        Fieldname = 'isnull(convert(float, convert(varchar(max), ' + Fieldname + ')), 0)';

                        break;

                    case 'string': case 'json': case 'jsonarray': case 'memo': case 'password': case 'url':
                        Fieldname = 'isnull(convert(float, ' + Fieldname + '), 0)';
                }

                // compare as a integer (Year)
                break;

            case 'integer':
                Luservalue = LCase(Uservalue);
                if (Count(Uservalue, '/') == 2) {
                    Uservalue = CNum(Field(Uservalue, '/', 3));;
                } else if (Count(Uservalue, '-') == 2) {
                    Uservalue = CNum(Field(Uservalue, '-', 3));;
                } else if (Count(Uservalue, ':') == 3) {
                    Uservalue = 'convert(int, convert(time, \'' + Uservalue + '\'))';;
                } else if (Luservalue == 'false' || Luservalue == 'no') {
                    Uservalue = '0';
                } else if (Luservalue == 'true' || Luservalue == 'yes') {
                    Uservalue = '1';
                } else if (CStr(CNum(Uservalue), true) != CStr(Uservalue, true)) {
                    Uservalue = 'convert(int, \'' + Uservalue + '\')';
                }

                switch (Dbtype) {
                    case 'guid':
                        // sql uniqueidentifier
                        Fieldname = 'isnull(convert(int, convert(varbinary(8), ' + Fieldname + ', 1)), 0)';

                        break;

                    case 'integer': case 'autointeger':
                        Fieldname = 'isnull(' + Fieldname + ', 0)';

                        break;

                    case 'boolean':
                        Fieldname = 'isnull(' + Fieldname + ', 0)';

                        break;

                    case 'date': case 'datetime':
                        Fieldname = 'isnull(Year(' + Fieldname + '), 0)';

                        break;

                    case 'time':
                        // sql date: 2019-10-31
                        Fieldname = 'isnull(convert(int, convert(datetime, ' + Fieldname + ')), 0)';

                        break;

                    case 'blob': case 'png': case 'jpg':
                        // varbinary(MAX)
                        Fieldname = 'isnull(convert(int, convert(varchar(max), ' + Fieldname + ')), 0)';

                        break;

                    case 'string': case 'json': case 'jsonarray': case 'memo': case 'password': case 'url': case 'double': case 'currency':
                        Fieldname = 'isnull(convert(int, ' + Fieldname + '), 0)';
                }

                // compare as a date
                break;

            case 'date':
                Fieldname = 'isnull(' + Fieldname + ', convert(date, 0))';
                Uservalue = 'convert(date, \'' + Uservalue + '\')';

                switch (Dbtype) {
                    case 'guid':
                        // sql uniqueidentifier
                        Fieldname = 'convert(date, convert(varbinary(8), ' + Fieldname + '), 1))';

                        break;

                    case 'integer': case 'autointeger': case 'double': case 'boolean': case 'currency':
                        Fieldname = 'convert(date, convert(float, ' + Fieldname + ')))';

                        break;

                    case 'double': case 'date': case 'time':
                        Fieldname = 'convert(date, ' + Fieldname + '))';

                        break;

                    case 'blob': case 'png': case 'jpg':
                        // varbinary(MAX)
                        Fieldname = 'convert(date, convert(varchar(max), ' + Fieldname + ')))';

                        break;

                    case 'string': case 'json': case 'jsonarray': case 'memo': case 'password': case 'url':
                        Fieldname = 'convert(date, ' + Fieldname + '))';

                }

                // compare as a datetime
                break;

            case 'datetime':
                Fieldname = 'isnull(' + Fieldname + ', convert(datetime, 0))';
                Uservalue = 'convert(datetime, \'' + Uservalue + '\')';

                switch (Dbtype) {
                    case 'guid':
                        // sql uniqueidentifier
                        Fieldname = 'convert(datetime, convert(varbinary(8), ' + Fieldname + '), 1))';

                        break;

                    case 'integer': case 'autointeger': case 'double': case 'boolean': case 'currency':
                        Fieldname = 'convert(datetime, convert(float, ' + Fieldname + ')))';

                        break;

                    case 'double': case 'date': case 'time':
                        Fieldname = 'convert(datetime, ' + Fieldname + '))';

                        break;

                    case 'blob': case 'png': case 'jpg':
                        // varbinary(MAX)
                        Fieldname = 'convert(datetime, convert(varchar(max), ' + Fieldname + ')))';

                        break;

                    case 'string': case 'json': case 'jsonarray': case 'memo': case 'password': case 'url':
                        Fieldname = 'convert(datetime, ' + Fieldname + '))';
                }

                break;

            case 'year':
                if (Count(Uservalue, '/') == 2) {
                    Uservalue = CNum(Field(Uservalue, '/', 3));;
                } else if (Count(Uservalue, '-') == 2) {
                    Uservalue = CNum(Field(Uservalue, '-', 3));;
                } else if (CStr(CNum(Uservalue), true) != CStr(Uservalue, true)) {
                    Uservalue = 'convert(int, \'' + Uservalue + '\')';
                }

                Fieldname = 'isnull(' + Fieldname + ', \'1/1/1901\')';

                switch (Dbtype) {
                    case 'guid':
                        // sql uniqueidentifier
                        Fieldname = 'convert(int, convert(varbinary(8), ' + Fieldname + ', 1))';

                        break;

                    case 'integer': case 'autointeger':
                        break;

                    case 'double': case 'boolean': case 'currency':
                        Fieldname = 'convert(int, convert(float, ' + Fieldname + '))';

                        break;

                    case 'date': case 'datetime':
                        Fieldname = 'Year(' + Fieldname + ')';

                        break;

                    default:
                        Fieldname = 'convert(int, ' + Fieldname + ')';

                }

        }
    } else {
        switch (Docompareas) {








            case 'string':
                Uservalue = '\'' + Change(Uservalue, '\'', '\'\'') + '\'';
                break;

            case 'boolean':
                if (LCase(Uservalue) == '\'false\'' || Uservalue == '\'\'' || Uservalue == '\'0\'') Uservalue = '\'0\''; else Uservalue = '\'1\'';
        }
    }

    if (Op == 'In') return Fieldname + ' In (' + CStr(Inlistvalues) + ')';
    return Fieldname + ' ' + Op + ' ' + Uservalue;

}
// </WHEREDYNAMICOPERATOR>

// <WHEREIS>
async function JSB_BF_WHEREIS(Ip) {
    var Dom1 = '';
    var Dom = '';
    var City = '';
    var Cc = '';

    Ip = Field(Ip, ':', 1);
    if (Count(Ip, '.') == 3 && isNumber(Field(Ip, '.', 1))) {
        if (await JSB_ODB_READ(Dom1, await JSB_BF_FHANDLE('', 'ip_database', true), Ip, function (_Dom1) { Dom1 = _Dom1 })); else {
            Dom1 = await JSB_BF_GET('//whois-ip.pro/' + Ip);
            if (await JSB_ODB_WRITE(Dom1, await JSB_BF_FHANDLE('ip_database'), Ip)); else return Stop(activeProcess.At_Errors);
        }

        Dom = Field(Dom1, '\<td\>City\</td\>', 2);
        Dom = Field(Dom, '\<td\>', 2);
        City = Field(Dom, '\</td\>', 1);

        if (City == '-') {
            Dom = Field(Dom1, '\<td\>IP2Location\</td\>', 2);
            Dom = Field(Dom, '\<td\>', 5);
            City = Field(Dom, '\</td\>', 1);
        }

        Dom = Field(Dom1, '\<td\>Country\</td\>', 3);
        Dom = Field(Dom, '\<td\>', 2);
        Cc = Field(Dom, '\</td\>', 1);
        return City + ', ' + Cc;
    }
}
// </WHEREIS>

// <WHO>
function JSB_BF_WHO() {
    return userno() + ' ' + UserName() + ' ' + Account();
}
// </WHO>

// <WHOIS>
async function JSB_BF_WHOIS(Ip) {
    // local variables
    var Dom;

    Ip = Field(Ip, ':', 1);
    if (Count(Ip, '.') == 3 && isNumber(Field(Ip, '.', 1))) {
        if (await JSB_ODB_READ(Dom, await JSB_BF_FHANDLE('', 'ip_database', true), Ip, function (_Dom) { Dom = _Dom })); else {
            Dom = await JSB_BF_GET('//whois-ip.pro/' + Ip);
            if (await JSB_ODB_WRITE(CStr(Dom), await JSB_BF_FHANDLE('ip_database'), Ip)); else return Stop(activeProcess.At_Errors);
        }

        Dom = Field(Dom, '\<td\>ASN Name\</td\>', 2);
        Dom = Field(Dom, '\<td\>', 2);
        Dom = Field(Dom, '\</td\>', 1);

        return Dom;
    }
}
// </WHOIS>

// <WIDTH>
function JSB_BF_WIDTH(Id) {
    FlushHTML();
    if (Id != 'window' && Id != 'body') Id = '#' + CStr(Id);
    return $(Id).width();
}
// </WIDTH>

// <WRITECOLUMNDEFINITIONSTODICT>
async function JSB_BF_WRITECOLUMNDEFINITIONSTODICT(ByRef_Dictcolumns, ByRef_Tablename, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Dictcolumns, ByRef_Tablename)
        return v
    }
    var Fdicthandle = undefined;
    var Fhandle = undefined;
    var I = undefined;
    var Dictcol = '';
    var Sqlcolumn = undefined;

    if (await JSB_ODB_OPEN('dict', CStr(ByRef_Tablename), Fdicthandle, function (_Fdicthandle) { Fdicthandle = _Fdicthandle })); else {
        if (await JSB_ODB_OPEN('', CStr(ByRef_Tablename), Fhandle, function (_Fhandle) { Fhandle = _Fhandle })); else return exit(ByRef_Dictcolumns);
        Fdicthandle = await JSB_BF_FHANDLE('DICT', ByRef_Tablename, true);
    }

    // Anything defined from the SELECT above (DictColumns) that's not in SqlDefs, is now invalid
    var _ForEndI_3 = UBound(ByRef_Dictcolumns);
    for (I = 1; I <= _ForEndI_3; I++) {
        Dictcol = ByRef_Dictcolumns[I];
        if (await JSB_ODB_WRITE(CStr(Sqlcolumn), Fdicthandle, '!' + Change(Sqlcolumn.name, Chr(160), Chr(32)))); else return Stop(activeProcess.At_Errors);
    }

    return exit(ByRef_Dictcolumns);
}
// </WRITECOLUMNDEFINITIONSTODICT>

// <XML2JSON>
function JSB_BF_XML2JSON(Xmlobj, Indent) {
    // local variables
    var Json;

    var I = undefined;
    var V = '';

    if (typeOf(Xmlobj) == 'String' && Indent == 0) {
        Xmlobj = parseXML(Xmlobj);
    }

    Json = '';
    if (Len(Xmlobj)) {
        Json = CStr(Json) + Space(Indent) + '"' + TagName(Xmlobj) + '":{' + crlf;
        var _ForEndI_3 = Len(Xmlobj);
        for (I = 1; I <= _ForEndI_3; I++) {
            Json = CStr(Json) + CStr(JSB_BF_XML2JSON(Xmlobj[I], Indent + 3)) + ',' + crlf;
        }
        Json = CStr(Json) + Space(Indent) + '}';
    } else {
        Json = CStr(Json) + Space(Indent) + '"' + TagName(Xmlobj) + '":';
        V = CStr(Xmlobj, true);
        switch (typeOf(V)) {
            case 'String':
                Json = CStr(Json) + '"' + V + '"';
                break;

            case 'Integer':
                Json = CStr(Json) + V;
                break;

            case 'Double':
                Json = CStr(Json) + V;
                break;

            case 'Boolean':
                Json = CStr(Json) + V;
                break;

            case 'JSonObject':
                Json = CStr(Json) + V;
                break;

            case 'Array':
                Json = CStr(Json) + V;
                break;

            default:
                Json = CStr(Json) + '"' + V + '"';
        }
    }
    return Json;

}
// </XML2JSON>

// <GET>
async function JSB_BF_GET(Url, Method, ByRef_Header, ByRef_Body, Opts, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Header, ByRef_Body)
        return v
    }
    // Returns Nothing on errors. ie, test with IsNothing(result)

    // Method: "GET", POST, PUT, DELETE
    // Header: ["Content-Type: text/html", "charset=utf-8", "Cache-Control: no-store"] - see //en.wikipedia.org/wiki/List_of_HTTP_header_fields
    // Url:    "//...."
    // Body:   "_p1=":@jsb_bf.UrlEncode(DictData):"&":"_p2=":@jsb_bf.UrlEncode(fName)
    // Opts<1>:   "" or "N" for no redirecting
    // Opts<2>: Timeout in seconds

    if (Not(Method)) Method = 'GET';

    if (ByRef_Body === undefined) {
        if (Method == 'PUT' || Method == 'POST') {
            ByRef_Body = ByRef_Header;
            ByRef_Header = undefined;
        }
    }

    // Are we profiling?
    if (CBool(System(64)) && !InStr1(1, System(64), '-')) {
        var Gets = JSB_BF_USERVAR('gets');
        if (Not(Gets)) Gets = [undefined,];
        Gets[Gets.length] = Url;
        JSB_BF_USERVAR('gets', Gets);
    }

    Method = UCase(Method);
    var Uheader = '';
    if (typeOf(ByRef_Header) == 'Array') {
        Uheader = Join(ByRef_Header, vm);
    } else if (InStr1(1, ByRef_Header, am)) {
        Uheader = Lower(ByRef_Header);
        // ElseIf !Header Then
        // uHeader = "Cache-Control: no-store"
        // ' application/json; charset=UTF-8
        // If Method = "POST" or Method = "PUT" Then uHeader<1,-1> = "Content-Type: application/x-www-form-urlencoded; charset=UTF-8";
    } else {
        Uheader = ByRef_Header;
    }

    var Adr = Url;
    var _Protocol = Left(Adr, 11);
    if (InStr1(1, _Protocol, ':')) {
        _Protocol = Field(_Protocol, ':', 1);
        if (Left(Adr, Len(_Protocol)) == _Protocol) {
            Adr = Mid1(Adr, Len(_Protocol) + 2, 999);
        }
    } else {
        _Protocol = ProtoCol();
    }
    _Protocol += ':';

    if (Left(Adr, 2) == '//') {
        Adr = Mid1(Adr, 3);
        _Protocol += '//';
    }

    var Fhandle = undefined;
    if (await asyncOpen("", _Protocol, _fHandle => Fhandle = _fHandle)); else return exit(undefined);

    var Www = Adr;
    Www = Replace(Www, 2, 0, 0, Method);
    if (Uheader) Www = Replace(Www, 3, 0, 0, Uheader);
    if ((Method == 'PUT' || Method == 'POST') && ByRef_Body) Www = Replace(Www, 4, 0, 0, ByRef_Body);
    if (Opts) {
        Www = Replace(Www, 5, 0, 0, Opts); // N FOR NO REDIRECT (Also loads www<6> for timeout value);
    }

    // This can do a POST too when www<2> is set to the method
    var Doc = '';
    if (await asyncRead(Fhandle, Www, "", 0, _data => Doc = _data)); else {
        if (System(1) == 'js') window.stopSpinner();
        ByRef_Header = activeProcess.At_Errors;
        return exit(Doc);
    }

    ByRef_Header = activeProcess.At_Errors;

    // If Result is RTF-8, then we need to convert SM, AM, VM, SVM back to single values

    var Ct = InStr1(1, Uheader, 'Content-Type');
    if (Ct) Ct = Extract(LCase(Mid1(Uheader, Ct)), 1, 0, 0); else Ct = '';

    var Isutf8 = (InStr1(1, Uheader, 'charset=UTF-8') || InStr1(1, ByRef_Header, 'charset=UTF-8'));
    if (!Isutf8 && (InStr1(1, Ct, 'text') != 0 || InStr1(1, Ct, 'application') != 0) && InStr1(1, Ct, 'charset=') == 0) Isutf8 = true;

    if (Isutf8) {
        Doc = Change(Doc, Chr(195) + Chr(191), Chr(255));
        Doc = Change(Doc, Chr(195) + Chr(190), Chr(254));
        Doc = Change(Doc, Chr(195) + Chr(189), Chr(253));
        Doc = Change(Doc, Chr(195) + Chr(187), Chr(251));
        Doc = Change(Doc, Chr(195) + Chr(187), Chr(251));
    }

    return exit(Doc);
}
// </GET>