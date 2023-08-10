
// <ADDCLASSNAMES_Sub>
async function JSB_MDL_ADDCLASSNAMES_Sub(ByRef_Dbgroups, setByRefValues) {
    // local variables
    var Tagname, V;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Dbgroups)
        return v
    }
    // %options aspxC-

    for (Tagname of iterateOver(ByRef_Dbgroups)) {
        V = ByRef_Dbgroups[Tagname];

        if (isJSON(V)) {
            V.class = 'group';
            await JSB_MDL_ADDCLASSNAMES_Sub(V, function (_V) { V = _V });;
        } else if (CBool(isArray(V))) {

            await JSB_MDL_ADDCLASSNAMES_Sub(V, function (_V) { V = _V });;
        } else {
            V.class = 'database';
        }
    }
    return exit();
}
// </ADDCLASSNAMES_Sub>

// <ADDCOLUMN_Sub>
async function JSB_MDL_ADDCOLUMN_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, setByRefValues) {
    // local variables
    var Dataset, Columnidx, Newcolumnid, Newcolumnidx, Viewrow;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid)
        return v
    }
    // %options aspxC-
    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);
    Columnidx = await JSB_MDL_FINDVIEWCOLUMN(Dataset, ByRef_Columnid, function (_Dataset) { Dataset = _Dataset });

    Newcolumnid = Trim(await JSB_BF_INPUTBOX('Add Column', 'New column name', undefined, undefined, undefined));
    if (Len(Newcolumnid) == 0 || Newcolumnid == Chr(27)) return exit(undefined);

    Newcolumnidx = await JSB_MDL_FINDVIEWCOLUMN(Dataset, Newcolumnid, function (_Dataset) { Dataset = _Dataset });
    if (CBool(Newcolumnidx)) {
        Viewrow = Dataset.columns[Newcolumnidx];;
    } else {
        Newcolumnidx = UBound(Dataset.columns) + 1;
        Viewrow = clone(Dataset.columns[Columnidx]); // Clone Previous Column
        Viewrow.name = Newcolumnid;
        Viewrow.label = Newcolumnid;
        Viewrow.transferurl = '';
        Dataset.columns[Dataset.columns.length] = Viewrow;;
    }

    Viewrow.display = 'visible';
    Viewrow.index = 0;
    Viewrow.index = await JSB_MDL_HIGHESTVIEWINDEX(Dataset, function (_Dataset) { Dataset = _Dataset });

    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edc-', System(28), ': ', activeProcess.At_Errors);

    if (Viewrow.control == 'button') {
        await JSB_MDL_SETBUTTONURL_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, Newcolumnid, function (_ByRef_Projectname, _ByRef_Pagename, _ByRef_Viewname, _Newcolumnid) { ByRef_Projectname = _ByRef_Projectname; ByRef_Pagename = _ByRef_Pagename; ByRef_Viewname = _ByRef_Viewname; Newcolumnid = _Newcolumnid });
    } else {
        await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    }
    return exit();
}
// </ADDCOLUMN_Sub>

// <ADDEXTRACOLUMNS2VIEWMODEL_Sub>
async function JSB_MDL_ADDEXTRACOLUMNS2VIEWMODEL_Sub(ByRef_Model, ByRef_Templatename, setByRefValues) {
    // local variables
    var Template, Columns, Xrow;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Model, ByRef_Templatename)
        return v
    }
    // %options aspxC-

    if (await JSB_ODB_READ(Template, await JSB_BF_FHANDLE('JSB_viewTemplates'), CStr(ByRef_Templatename), function (_Template) { Template = _Template })); else {
        if (!isEmpty(ByRef_Templatename)) Alert('JSB_viewTemplates Template ' + CStr(ByRef_Templatename) + ' not found');
        return exit(undefined);
    }

    Columns = Field(Template, '******************************************************************************', 1);
    Columns = Change(Columns, Chr(254), ' ');
    if (!Trim(Columns)) return exit(undefined);
    Columns = parseJSON('[' + CStr(Columns) + ']');
    if (typeOf(Columns) == 'String') {
        Alert('Your JSB_viewTemplates ' + CStr(ByRef_Templatename) + ' does not have valid JSON extra columns');
        return exit(undefined);
    }
    for (Xrow of iterateOver(Columns)) {
        ByRef_Model.columns[ByRef_Model.columns.length] = Xrow;
    }
    return exit();
}
// </ADDEXTRACOLUMNS2VIEWMODEL_Sub>

// <ADDFROMANOTHERVIEW>
async function JSB_MDL_ADDFROMANOTHERVIEW(ByRef_Projectname, ByRef_Viewname, ByRef_Dataset, setByRefValues) {
    // local variables
    var Fdict, Sl, Values, Tprefix, List, Filename, Ans, Possiblecolumns;
    var Anotherview;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Viewname, ByRef_Dataset)
        return v
    }
    // %options aspxC-

    Fdict = await JSB_BF_FHANDLE('DICT', ByRef_Projectname);
    if (await JSB_ODB_SELECTTO('', Fdict, 'ItemId Like \'%.view\'', Sl, function (_Sl) { Sl = _Sl })); else return exit(false);
    Values = getList(Sl);
    Tprefix = 'Table: ';

    List = await JSB_BF_FILELIST();
    for (Filename of iterateOver(List)) {
        Values = Replace(Values, -1, 0, 0, CStr(Tprefix) + CStr(Filename));
    }
    Values = Sort(Values);

    Ans = await JSB_BF_INPUTDROPDOWNBOX('Choose View', 'Pick a view to choose from', CStr(Values));
    if (isEmpty(Ans) || Ans == Chr(27)) return exit(false);

    if (Left(Ans, Len(Tprefix)) == Tprefix) {
        Ans = Mid1(Ans, Len(Tprefix) + 1);
        Possiblecolumns = await JSB_BF_GETTABLECOLUMNDEFS(CStr(Ans), CStr(true), true);
    } else {
        if (await JSB_ODB_READJSON(Anotherview, Fdict, CStr(Ans), function (_Anotherview) { Anotherview = _Anotherview })); else return exit(false);
        Possiblecolumns = Anotherview.columns;
    }

    return exit(await JSB_MDL_CHOOSECOLUMNS_SS(CStr(ByRef_Projectname), CStr(ByRef_Viewname), ByRef_Dataset, Possiblecolumns));
}
// </ADDFROMANOTHERVIEW>

// <ADDNESTEDVIEWS>
async function JSB_MDL_ADDNESTEDVIEWS(ByRef_Projectname, ByRef_Views, setByRefValues) {
    // local variables
    var Viewname, Vs, Column, Ctlname, Newviewname;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Views)
        return v
    }
    // %options aspxC-

    for (Viewname of iterateOver(ByRef_Views)) {
        if (await JSB_ODB_READJSON(Vs, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(Viewname), function (_Vs) { Vs = _Vs })) {
            for (Column of iterateOver(Vs.columns)) {
                Ctlname = LCase(Column.control);
                if (Ctlname == 'json_inline' || Ctlname == 'json_inline') {
                    Newviewname = Column.useview;
                    if (Locate(Newviewname, ByRef_Views, 0, 0, 0, "", position => { })); else {
                        ByRef_Views[ByRef_Views.length] = Newviewname;
                        await JSB_MDL_ADDNESTEDVIEWS(ByRef_Projectname, ByRef_Views, function (_ByRef_Projectname, _ByRef_Views) { ByRef_Projectname = _ByRef_Projectname; ByRef_Views = _ByRef_Views });
                    }
                }
            }
        }
    }

    return exit(ByRef_Views);
}
// </ADDNESTEDVIEWS>

// <ADDPAGETOMENU>
async function JSB_MDL_ADDPAGETOMENU(ByRef_Projectname, ByRef_Pagename, ByRef_Whichmenupage, setByRefValues) {
    // local variables
    var Pagedataset, Objectmodel, Pagetype, Viewname, Viewdataset;
    var Alreadythere, C, Hassave, Hascancel, Btn;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Whichmenupage)
        return v
    }
    // %options aspxC-

    if (isEmpty(ByRef_Projectname)) { activeProcess.At_Errors = 'Missing URL Parameters'; return exit(false); }

    ByRef_Pagename = dropIfRight(CStr(ByRef_Pagename), '.page', true);
    ByRef_Whichmenupage = dropIfRight(CStr(ByRef_Whichmenupage), '.page', true);

    if (await JSB_ODB_READJSON(Pagedataset, await JSB_BF_FHANDLE('dict', ByRef_Projectname), CStr(ByRef_Whichmenupage) + '.page', function (_Pagedataset) { Pagedataset = _Pagedataset })); else {
        Objectmodel = await JSB_MDL_MODELFORPAGE(ByRef_Projectname, function (_ByRef_Projectname) { ByRef_Projectname = _ByRef_Projectname });
        Pagetype = 'simplePage';
        await JSB_MDL_GETEXTRAPAGECOLUMNS_Sub(Objectmodel.columns, Pagetype, function (_P1, _Pagetype) { Pagetype = _Pagetype });
        Pagedataset = await JSB_MDL_NEWROW('Menu', Objectmodel.columns);
        Pagedataset.templateName = Pagetype;
        Pagedataset.menuitem = 'Admin';
        Pagedataset.centerview = CStr(ByRef_Whichmenupage) + '.view';
        if (await JSB_ODB_WRITEJSON(Pagedataset, await JSB_BF_FHANDLE('dict', ByRef_Projectname), CStr(ByRef_Whichmenupage) + '.page')); else return Stop(At(-1), 'Edp-', System(28), ': ', activeProcess.At_Errors);
    }

    Viewname = Pagedataset.centerview;
    if (await JSB_ODB_READJSON(Viewdataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(Viewname), function (_Viewdataset) { Viewdataset = _Viewdataset })); else {
        Viewdataset = await JSB_MDL_CREATENEWVIEW(Viewname, function (_Viewname) { Viewname = _Viewname });
        Viewdataset.templateName = 'NoCrud_Form';
    }

    Alreadythere = false;
    for (C of iterateOver(Viewdataset.columns)) {
        if (Null0(C.name) == Null0(ByRef_Pagename)) Alreadythere = true;
    }

    if (Not(Alreadythere)) {
        Viewdataset.columns[Viewdataset.columns.length] = { "name": ByRef_Pagename, "label": ByRef_Pagename, "control": 'button', "display": 'visible', "datatype": 'string', "suppresslabel": true, "width": 12, "transferurl": CStr(ByRef_Pagename) + '.page', "transferto": '10', "transferaddfrompage": false, "fullline": true, "ctlstyle": 'width: 99%; height: 50px; display: block; margin: auto; max-width: 300px;' };
        if (await JSB_ODB_WRITEJSON(Viewdataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(Viewname))); else return Stop(At(-1), 'Edp-', System(28), ': ', activeProcess.At_Errors);
    }

    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Whichmenupage, false);

    // Put a back button on the page
    if (await JSB_ODB_READJSON(Viewdataset, await JSB_BF_FHANDLE('dict', ByRef_Projectname), CStr(ByRef_Pagename) + '.view', function (_Viewdataset) { Viewdataset = _Viewdataset })) {
        Hassave = false;
        Hascancel = false;

        for (Btn of iterateOver(Viewdataset.custombtns)) {
            if (Btn.buttontxt == 'Save') {
                Hassave = true;
                if (isEmpty(Btn.url)) Btn.url = CStr(ByRef_Whichmenupage) + '.page';
            }

            if (Btn.buttontxt == 'Cancel') {
                Hascancel = true;
                if (isEmpty(Btn.url)) Btn.url = CStr(ByRef_Whichmenupage) + '.page';
            }

            if (Btn.buttontxt == 'Back') {
                Hascancel = true;
                if (isEmpty(Btn.url)) Btn.url = CStr(ByRef_Whichmenupage) + '.page';
            }
        }

        if (await JSB_ODB_WRITEJSON(Viewdataset, await JSB_BF_FHANDLE('dict', ByRef_Projectname), CStr(ByRef_Pagename) + '.view')); else Alert(CStr(activeProcess.At_Errors));
    }

    return exit(true);
}
// </ADDPAGETOMENU>

// <ADDPAGETOMENU_Pgm>
async function JSB_MDL_ADDPAGETOMENU_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Projectname, Pagename, Frompage, _Closewindow;

    // %options aspxC-

    if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a data manager to run program');

    Projectname = paramVar('ProjectName');
    Pagename = paramVar('pageName');
    Frompage = paramVar('fromPage');
    _Closewindow = paramVar('closeWindow');

    if (Not(await JSB_MDL_ADDPAGETOMENU(Projectname, Pagename, 'Menu', function (_Projectname, _Pagename, _P3) { Projectname = _Projectname; Pagename = _Pagename }))) Alert(CStr(activeProcess.At_Errors));

    if (CBool(Frompage)) return At_Response.Redirect(Frompage);
    if (CBool(_Closewindow) || !hasParentProcess()) At_Server.End();

    return At_Response.Redirect(jsbRootExecute(CStr(Pagename)));
}
// </ADDPAGETOMENU_Pgm>

// <ADDPAGETOREFERENCEMENU_Pgm>
async function JSB_MDL_ADDPAGETOREFERENCEMENU_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Projectname, Pagename, Frompage, _Closewindow;

    // %options aspxC-

    if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a data manager to run program');

    Projectname = paramVar('ProjectName');
    Pagename = paramVar('pageName');
    Frompage = paramVar('fromPage');
    _Closewindow = paramVar('closeWindow');

    if (Not(await JSB_MDL_ADDPAGETOMENU(Projectname, Pagename, 'ReferenceMenu', function (_Projectname, _Pagename, _P3) { Projectname = _Projectname; Pagename = _Pagename }))) Alert(CStr(activeProcess.At_Errors));

    if (CBool(Frompage)) return At_Response.Redirect(Frompage);
    if (CBool(_Closewindow) || !hasParentProcess()) At_Server.End();

    return At_Response.Redirect(jsbRootExecute(CStr(Pagename)));
}
// </ADDPAGETOREFERENCEMENU_Pgm>

// <ADDVIEWBTN>
async function JSB_MDL_ADDVIEWBTN(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, Modelafterbtn, setByRefValues) {
    // local variables
    var Defaultrow, Objectmodel, Btni, Btn, Property, Ans;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname)
        return v
    }
    // %options aspxC-

    Defaultrow = await JSB_MDL_GETJSONDEFDEFAULTS('customBtns');
    if (await JSB_ODB_READJSON(Objectmodel, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Objectmodel) { Objectmodel = _Objectmodel })); else { Println(Alert('Unable to find view ' + CStr(ByRef_Viewname))); debugger; return exit(false); }

    if (CBool(Modelafterbtn)) {
        Btni = await JSB_MDL_FINDBTNI(Objectmodel, Modelafterbtn, function (_Objectmodel, _Modelafterbtn) { Objectmodel = _Objectmodel; Modelafterbtn = _Modelafterbtn });
        if (CBool(Btni)) {
            Btn = Objectmodel.custombtns[Btni];
            for (Property of iterateOver(Btn)) {
                if (CBool(Btn[Property])) Defaultrow[Property] = Btn[Property];
            }

            Defaultrow.url = '';
            Defaultrow.buttontxt = '';
            Defaultrow.customcall = '';
        }
    }

    Ans = await JSB_BF_POPUP_JSONDEF(ByRef_Projectname, 'jsb_jsondefs', 'customBtns', '', '', Defaultrow, '80%', '80%', 'Buttons for view ' + CStr(ByRef_Viewname), undefined, function (_ByRef_Projectname, _P2, _P3, _P4, _P5, _Defaultrow) { ByRef_Projectname = _ByRef_Projectname; Defaultrow = _Defaultrow });
    if (Not(Ans)) return exit(false);

    if (Not(Objectmodel.custombtns)) Objectmodel.custombtns = [undefined,];
    for (Btn of iterateOver(parseJSON(Ans))) {
        Objectmodel.custombtns[Objectmodel.custombtns.length] = Btn;
    }

    if (await JSB_ODB_WRITEJSON(Objectmodel, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit(true);
}
// </ADDVIEWBTN>

// <BUILDSQLSELECT>
async function JSB_MDL_BUILDSQLSELECT(ByRef_Viewmodel, Haslocalformvars, Orderallcolumns, setByRefValues) {
    // local variables
    var Inputs, Buildselect, Db, Loadvars, Checkrequired, Lpcnt;
    var Flatfile, Tablecolumns, Columnnames, Tfile, Dbcolumns;
    var Dbcolumn, Row, Varname, Op, Docompareas, Sqldatatype, Missingparam;
    var Hasparam, Dftval, Cj, _Html, Possibleerrors, Columns, Cnames;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Viewmodel)
        return v
    }
    // %options aspxC-

    Inputs = ByRef_Viewmodel.inputs;
    Buildselect = [undefined,];

    if (CBool(Inputs)) {
        if (CBool(ByRef_Viewmodel.attachdb)) {
            Db = Account();
            if (await JSB_ODB_ATTACHDB(CStr(ByRef_Viewmodel.attachdb))); else {
                Print(); debugger; // No db??;
            }
        }

        Inputs = parseJSON(Inputs);
        Loadvars = [undefined,];
        Checkrequired = [undefined,];
        Lpcnt = 0;

        if (CBool(ByRef_Viewmodel.customsql)) {
            Flatfile = false;
            Tablecolumns = await JSB_MDL_GETCOLUMNDEFINITIONS(ByRef_Viewmodel.customsql, Columnnames, function (_Columnnames) { Columnnames = _Columnnames });
        } else {
            Flatfile = true;
            Tablecolumns = await JSB_MDL_GETCOLUMNDEFINITIONS(ByRef_Viewmodel.tableName, Columnnames, function (_Columnnames) { Columnnames = _Columnnames });
            if (await JSB_ODB_OPEN('', CStr(ByRef_Viewmodel.tableName), Tfile, function (_Tfile) { Tfile = _Tfile })) {
                if (Left(Tfile, 4) == 'ado:') Flatfile = false;
            }
        }

        if (CBool(Db)) {
            if (await JSB_ODB_ATTACHDB(CStr(Db))); else {
                Print(); debugger; // ??;
            }
        }

        Dbcolumns = {};
        for (Dbcolumn of iterateOver(Tablecolumns)) {
            Dbcolumns[Dbcolumn.name] = Dbcolumn;
        }

        // Fetch each Input into a local variable and check for required
        for (Row of iterateOver(Inputs)) {
            if (isEmpty(Row.name)) Row.name = Row.field;
            Varname = JSB_BF_NICENAME(CStr(Row.name));
            if (Not(Varname)) { Print(); debugger; }

            Op = Row.operator;
            Docompareas = Row.datatype;
            if (Len(Op) > 2 && Docompareas != 'integer' && Op != 'Dynamic') Docompareas = 'string';

            Dbcolumn = Dbcolumns[Row.field];
            if (Not(Dbcolumn)) { Dbcolumn = { "datatype": Row.datatype } }

            Sqldatatype = Dbcolumn.datatype;
            if (Not(Sqldatatype)) {
                Print(); debugger; // Missing sqlDataType!;
            }

            if (Docompareas == 'string') {
                Missingparam = 'IsNothing(' + CStr(Varname) + ')';
                Hasparam = '!IsNothing(' + CStr(Varname) + ')';
            } else {
                Missingparam = '!Len(' + CStr(Varname) + ')';
                Hasparam = 'Len(' + CStr(Varname) + ')';
            }

            switch (Row.scope) {
                case 'SessionVar':
                    Loadvars[Loadvars.length] = '      Dim ' + CStr(Varname) + ' As String = @SessionVar("' + CStr(Row.name) + '")';
                    if (CBool(Row.required)) { Checkrequired[Checkrequired.length] = '      ' + 'If ' + CStr(Missingparam) + ' Then @Errors = "' + CStr(Varname) + ' is a required session parameter";'; }

                    break;

                case 'ApplicationVar':
                    Loadvars[Loadvars.length] = '      Dim ' + CStr(Varname) + ' As String = @Application("' + CStr(Row.name) + '")';
                    if (CBool(Row.required)) { Checkrequired[Checkrequired.length] = '   If ' + CStr(Missingparam) + ' Then @Errors = "' + CStr(Varname) + ' is a required application parameter";'; }

                    break;

                case 'ProfileVar':
                    Loadvars[Loadvars.length] = '   ReadJSon Profile From @fHandle("JSB_USERS"), @username Else Profile = {}';
                    Loadvars[Loadvars.length] = '   Dim ' + CStr(Varname) + ' As String = Profile["' + CStr(Row.name) + '"]';
                    if (CBool(Row.required)) { Checkrequired[Checkrequired.length] = '   If ' + CStr(Missingparam) + ' Then @Errors = "' + CStr(Varname) + ' is a required profile parameter";'; }

                    break;

                case 'FormVar':
                    if (CBool(Haslocalformvars)) {
                        Loadvars[Loadvars.length] = '   Dim ' + CStr(Varname) + ' As String = FormVars["' + CStr(Row.name) + '"]';
                    } else {
                        Loadvars[Loadvars.length] = '   Dim ' + CStr(Varname) + ' As String = @FormVar("' + CStr(Row.name) + '")';
                    }
                    if (CBool(Row.required)) { Checkrequired[Checkrequired.length] = '   If ' + CStr(Missingparam) + ' Then @Errors = "' + CStr(Varname) + ' is a required form variable parameter";'; }

                    break;

                case 'memoryVar':
                    if (CBool(Haslocalformvars)) {
                        Loadvars[Loadvars.length] = '   Dim ' + CStr(Varname) + ' As String = FormVars["memoryVar_' + CStr(Row.name) + '"]';
                    } else {
                        Loadvars[Loadvars.length] = '   Dim ' + CStr(Varname) + ' As String = @FormVar("memoryVar_' + CStr(Row.name) + '")';
                    }
                    if (CBool(Row.required)) { Checkrequired[Checkrequired.length] = '   If ' + CStr(Missingparam) + ' Then @Errors = "' + CStr(Varname) + ' is a required memory variable parameter";'; }

                    break;

                case 'AppCode':
                    Loadvars[Loadvars.length] = '   Dim ' + CStr(Varname) + ' As String = ' + CStr(Row.defaultvalue);

                    break;

                default:
                    Loadvars[Loadvars.length] = '   Dim ' + CStr(Varname) + ' As String = @ParamVar("' + CStr(Row.name) + '")';
                    if (CBool(Row.required)) { Checkrequired[Checkrequired.length] = '   If ' + CStr(Missingparam) + ' Then @Errors = "' + CStr(Varname) + ' is a required url/post parameter";'; }
            }

            if (Len(Row.defaultvalue) && Row.scope != 'AppCode') {
                Dftval = Row.defaultvalue;

                if (isNumeric(Dftval)) {
                    Loadvars[Loadvars.length] = '   If IsEmpty(' + CStr(Varname) + ') Then ' + CStr(Varname) + ' = ' + CStr(Dftval);
                } else if (Left(Dftval, 1) == '{') {
                    Loadvars[Loadvars.length] = '   If ' + CStr(Missingparam) + ' Then ' + CStr(Varname) + ' = getDefaultValue(Nothing, "' + CStr(Dftval) + '", "' + CStr(Row.name) + '", "' + CStr(ByRef_Viewmodel.name) + '")';
                } else {
                    Loadvars[Loadvars.length] = '   If ' + CStr(Missingparam) + ' Then ' + CStr(Varname) + ' = "' + CStr(Dftval) + '"';
                }
            }

            // Now we need to set the varName and the Cast

            // There are futher checks on IsNothing - so can't force a value yet
            // If doCompareAs = "boolean" Then LoadVars[-1] = `   If !IsEmpty(`:varName:`) Then If `:varName:` Then `:varName:` = -1 Else `:varName:` = 0 `
            // If doCompareAs = "number" Then LoadVars[-1] = `   If !IsEmpty(`:varName:`) And !`:varName:` Then `:varName:` = 0`

            // (and) (lparen) (field) Pname) (scope) (datatype) (operator) (required) (rparen)

            if (CBool(Row.and)) {
                if (CBool(Row.lparen)) {
                    Lpcnt++;
                    Cj = 'iif(sqlFilter, \' And (\', \'(\')';
                } else {
                    Cj = 'iif(sqlFilter, \' And \', \'\')';
                }
            } else {
                if (CBool(Row.lparen)) {
                    Lpcnt++;
                    Cj = 'iif(sqlFilter, \' Or (\', \'(\')';
                } else {
                    Cj = 'iif(sqlFilter, \' Or \', \'\')';
                }
            }

            if (Not(Lpcnt)) Buildselect[Buildselect.length] = '          If ' + CStr(Hasparam) + ' Then';
            Buildselect[Buildselect.length] = ('              sqlFilter := ' + CStr(Cj) + ':whereDynamicOperator("' + LCase(Docompareas) + '", "' + LCase(Sqldatatype) + '", "' + CStr(Row.field) + '" , ' + CStr(Varname) + ', "' + CStr(Row.operator) + '")' + (CBool(Row.rparen) && CBool(Lpcnt) ? ')' : ''));
            if (Not(Lpcnt)) Buildselect[Buildselect.length] = '           End If';
            if (CBool(Row.rparen) && CBool(Lpcnt)) Lpcnt--;
        }

        _Html = Loadvars;

        Possibleerrors = UBound(Loadvars) > 1;
        if (CBool(Checkrequired)) {
            _Html[_Html.length] = '   @Errors = \'\'';
            _Html[_Html.length] = Join(Checkrequired, crlf);
            _Html[_Html.length] = '   If @Errors Then';
            _Html[_Html.length] = '      rtnErrors = @Errors';
            _Html[_Html.length] = '      sqlFilter = \'1=0\'';
            _Html[_Html.length] = '   Else';
            _Html[_Html.length] = Join(Buildselect, crlf);
            _Html[_Html.length] = '   End If';
        } else {
            _Html[_Html.length] = Join(Buildselect, crlf);
        }

        if (CBool(ByRef_Viewmodel.orderby)) _Html[_Html.length] = '    sqlFilter := ` ' + CStr(ByRef_Viewmodel.orderby) + '`';
    } else {
        _Html = Buildselect;
        if (CBool(ByRef_Viewmodel.orderby)) _Html[_Html.length] = [undefined, '    sqlFilter = `' + CStr(ByRef_Viewmodel.orderby) + '`'];
    }

    // Build list of columns to fetch
    Columns = await JSB_MDL_GETSELECTIONCOLUMNS(ByRef_Viewmodel, Cnames, Orderallcolumns, function (_ByRef_Viewmodel, _Cnames) { ByRef_Viewmodel = _ByRef_Viewmodel; Cnames = _Cnames });

    _Html[_Html.length] = '   SqlColumns = `' + Join(Cnames, ',') + '`';

    return exit(Join(_Html, crlf));
}
// </BUILDSQLSELECT>

// <CHOOSECOLUMNS_Sub>
async function JSB_MDL_CHOOSECOLUMNS_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, setByRefValues) {
    // local variables
    var Fdict, Dataset, Possiblecolumns;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname)
        return v
    }
    // %options aspxC-

    Fdict = await JSB_BF_FHANDLE('DICT', ByRef_Projectname);
    if (await JSB_ODB_READJSON(Dataset, Fdict, CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else { Dataset = await JSB_MDL_CREATENEWVIEW(ByRef_Viewname, function (_ByRef_Viewname) { ByRef_Viewname = _ByRef_Viewname }); }
    Possiblecolumns = await JSB_BF_GETTABLECOLUMNDEFS(CStr(Dataset.tableName), CStr(true), true);

    if (await JSB_MDL_CHOOSECOLUMNS_SS(CStr(ByRef_Projectname), CStr(ByRef_Viewname), Dataset, Possiblecolumns)) {
        if (await JSB_ODB_WRITEJSON(Dataset, Fdict, CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
        await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    }
    return exit();
}
// </CHOOSECOLUMNS_Sub>

// <CHOOSECOLUMNS_SS>
async function JSB_MDL_CHOOSECOLUMNS_SS(Projectname, Viewname, Dataset, Possiblecolumns, Question) {
    // local variables
    var Selectedname, Model, I;

    // %options aspxC-

    var Allcolumns = [undefined,];
    if (Not(Question)) Question = 'Select your columns';

    var Needsort = true;
    if (Len(Possiblecolumns)) {
        if (HasTag(Possiblecolumns[LBound(Possiblecolumns)], 'Oridinal')) {
            Possiblecolumns = Sort(Possiblecolumns, 'Oridinal');
            Needsort = false;
        }
    }

    var Column = undefined;
    for (Column of iterateOver(Possiblecolumns)) {
        var Cname = Trim(Column.name);
        if (Cname) Allcolumns[Allcolumns.length] = Cname;
    }

    var Selcolumns = [undefined,];
    for (Column of iterateOver(Dataset.columns)) {
        Cname = Column.name;

        if (Cname) {
            Selcolumns[Selcolumns.length] = Cname;
            if (Locate(Cname, Allcolumns, 0, 0, 0, "", position => { })); else Allcolumns[Allcolumns.length] = Cname;
        }
    }
    if (Len(Selcolumns) == 0) Selcolumns = clone(Allcolumns);

    if (Needsort) Allcolumns = Sort(Allcolumns);

    // Basically a copy of @jsb_bf.InputMultiSelect

    var Innerhtmldialog = JSB_HTML_MULTISELECTLISTBOX('ddbox', Allcolumns, CStr(Selcolumns), [undefined,]) + br() + br();
    Innerhtmldialog += CStr(htmlEncode('Add detached columns (comma seperated):')) + br() + br();
    Innerhtmldialog += JSB_HTML_TEXTBOX('addcols');

    Innerhtmldialog += Chr(28) + '\<input type="button" value=\'or Select another table/view\' class=\'Button\'';
    Innerhtmldialog += '   onclick="$(\'#msgboxResult\').val(Chr(27)+\'SA\'); $(\'#dialog\').dialog(\'close\'); "';
    Innerhtmldialog += '/\>&nbsp;\<br /\>\<br /\>';

    Innerhtmldialog += '\<input type="submit" value=\'OK\' class=\'Button\'';
    Innerhtmldialog += 'onclick="\r\n\
      var v1 = formVar(\'ddbox\');\r\n\
      var v2 = LTrim(formVar(\'addcols\'));\r\n\
\r\n\
    v1 = Change(v1, \',\', Chr(254));\r\n\
    v2 = Change(v2, \',\', Chr(254));\r\n\
\r\n\
    if (v1 && v2) v1 += Chr(254) + v2; else v1 += v2; \r\n\
\r\n\
    $(\'#msgboxResult\').val(v1); \r\n\
    $(\'#dialog\').dialog(\'close\'); "';

    Innerhtmldialog += '/\>&nbsp;';
    Innerhtmldialog += '\<input type="button" value=\'All\' class=\'Button\'';
    Innerhtmldialog += '   onclick="multiSelectAll($(\'#ddbox\'));"';
    Innerhtmldialog += '/\>&nbsp;';

    Innerhtmldialog += '\<input type="button" value=\'None\' class=\'Button\'';
    Innerhtmldialog += '   onclick="multiSelectNone($(\'#ddbox\'));"';
    Innerhtmldialog += '/\>&nbsp;';

    Innerhtmldialog += '\<input type="submit" value=\'Cancel\' class=\'Button\'';
    Innerhtmldialog += '   onclick="$(\'#msgboxResult\').val(Chr(27)); $(\'#dialog\').dialog(\'close\'); "';
    Innerhtmldialog += '/\>&nbsp;' + Chr(29);

    var Ans = await JSB_BF_DIALOG(Question, Innerhtmldialog, true, '80%', '90%');

    if (Ans == Chr(27)) return false;
    if (Ans == Chr(27) + 'SA') { return await JSB_MDL_ADDFROMANOTHERVIEW(Projectname, Viewname, Dataset, function (_Projectname, _Viewname, _Dataset) { Projectname = _Projectname; Viewname = _Viewname; Dataset = _Dataset }); }

    var Selectedcols = Split(Ans, am);

    // check for New ones
    var Oldcolumn = undefined;
    var Newcolumn = undefined;
    var Previousdef = undefined;

    for (Selectedname of iterateOver(Selectedcols)) {
        Previousdef = false;
        Selectedname = Trim(Selectedname);

        for (Oldcolumn of iterateOver(Dataset.columns)) {
            if (Null0(Oldcolumn.name) == Null0(Selectedname)) {
                Previousdef = true;
                if (isEmpty(Oldcolumn.datatype)) Oldcolumn.datatype = 'string';
                if (isEmpty(Oldcolumn.control)) Oldcolumn.control = 'textbox';
                if (isNothing(Oldcolumn.display)) Oldcolumn.display = 'visible';
                if (isNothing(Oldcolumn.sortable)) Oldcolumn.sortable = '1';
                if (isNothing(Oldcolumn.width)) Oldcolumn.width = 12;
                if (isNothing(Oldcolumn.canedit)) Oldcolumn.canedit = true;
                if (isNothing(Oldcolumn.label)) Oldcolumn.label = Oldcolumn.name;
                break;
            }
        }

        // Add New ones
        if (!Previousdef) {
            // New definition
            for (Newcolumn of iterateOver(Possiblecolumns)) {
                if (Null0(Newcolumn.name) == Null0(Selectedname)) {
                    await JSB_MDL_SETCOLUMNDEFAULTS_Sub(Newcolumn.datatype, Newcolumn, function (_P1, _Newcolumn) { Newcolumn = _Newcolumn });
                    Dataset.columns[Dataset.columns.length] = Newcolumn;
                    Previousdef = true;
                    break;
                }
            }

            if (!Previousdef) {
                Model = await JSB_MDL_MODELFORALLCOLUMNS();
                Newcolumn = await JSB_MDL_NEWROW(Viewname, Model.columns, function (_Viewname, _P2) { Viewname = _Viewname });
                Newcolumn.name = Selectedname;
                Newcolumn.label = Selectedname;
                Newcolumn.datatype = 'string';
                await JSB_MDL_SETCOLUMNDEFAULTS_Sub('string', Newcolumn, function (_P1, _Newcolumn) { Newcolumn = _Newcolumn });
                Dataset.columns[Dataset.columns.length] = Newcolumn;

                if (CBool(Dataset.tableName)) { if (await JSB_ODB_WRITE(CStr(Newcolumn), await JSB_BF_FHANDLE('dict', Dataset.tableName), '!' + CStr(Selectedname))); else return Stop(activeProcess.At_Errors); }
            }
        }
    }

    var _ForEndI_24 = UBound(Dataset.columns);
    for (I = 1; (I <= _ForEndI_24) && Null0(I) <= UBound(Dataset.columns); I++) {
        Oldcolumn = Dataset.columns[I];
        Previousdef = false;

        for (Selectedname of iterateOver(Selectedcols)) {
            if (Null0(Oldcolumn.name) == Null0(Selectedname)) {
                Previousdef = true;
                break;
            }
        }

        if (!Previousdef) {
            // Delete this one
            Dataset.columns.Delete(I);
            I = +I - 1;
        }
    }

    return true;
}
// </CHOOSECOLUMNS_SS>

// <CLONEPAGEMODEL>
async function JSB_MDL_CLONEPAGEMODEL(Projectname, Oldpagename, Clonepagename) {
    // local variables
    var Cprojectname, Xxxx, Pagedataset, Src;

    // %options aspxC-

    Oldpagename = dropIfRight(CStr(Oldpagename), '.page', true);

    if (Not(Clonepagename)) {
        Clonepagename = Trim(await JSB_BF_INPUTBOX('Save a copy As', 'Enter a clone pageName or \'(\' projectname clonePageName', '', '80%', ''));
        Clonepagename = dropIfRight(CStr(Clonepagename), '.page', true);
        if (Clonepagename == Chr(27) || isEmpty(Clonepagename)) return '';
    }

    if (InStr1(1, Clonepagename, '(')) {
        Cprojectname = Field(Clonepagename, '(', 1);
        Clonepagename = dropLeft(CStr(Clonepagename), '(');
    } else {
        Cprojectname = Projectname;
    }

    if (await JSB_ODB_READJSON(Xxxx, await JSB_BF_FHANDLE('DICT', Cprojectname), CStr(Clonepagename) + '.page', function (_Xxxx) { Xxxx = _Xxxx })) {
        if (await JSB_BF_MSGBOX('Confirm', 'Page ' + CStr(Clonepagename) + ' already exists, overwrite?', 'Yes,*No') == 'Yes') return '';
    }

    if (await JSB_ODB_READJSON(Pagedataset, await JSB_BF_FHANDLE('dict', Projectname), CStr(Oldpagename) + '.page', function (_Pagedataset) { Pagedataset = _Pagedataset })); else { activeProcess.At_Errors = 'Unable to find page ' + CStr(Oldpagename); return ''; }

    if (CBool(Pagedataset.centerview)) Pagedataset.centerview = await JSB_MDL_CLONEVIEWTO(CStr(Projectname), CStr(Cprojectname), CStr(Pagedataset.centerview), await JSB_MDL_MAKECLONENAME(Cprojectname, Oldpagename, Pagedataset.centerview, Clonepagename));
    if (CBool(Pagedataset.northview)) Pagedataset.northview = await JSB_MDL_CLONEVIEWTO(CStr(Projectname), CStr(Cprojectname), CStr(Pagedataset.northview), await JSB_MDL_MAKECLONENAME(Cprojectname, Oldpagename, Pagedataset.northview, Clonepagename));
    if (CBool(Pagedataset.southview)) Pagedataset.southview = await JSB_MDL_CLONEVIEWTO(CStr(Projectname), CStr(Cprojectname), CStr(Pagedataset.southview), await JSB_MDL_MAKECLONENAME(Cprojectname, Oldpagename, Pagedataset.southview, Clonepagename));
    if (CBool(Pagedataset.westview)) Pagedataset.westview = await JSB_MDL_CLONEVIEWTO(CStr(Projectname), CStr(Cprojectname), CStr(Pagedataset.westview), await JSB_MDL_MAKECLONENAME(Cprojectname, Oldpagename, Pagedataset.westview, Clonepagename));
    if (CBool(Pagedataset.eastview)) Pagedataset.eastview = await JSB_MDL_CLONEVIEWTO(CStr(Projectname), CStr(Cprojectname), CStr(Pagedataset.eastview), await JSB_MDL_MAKECLONENAME(Cprojectname, Oldpagename, Pagedataset.eastview, Clonepagename));

    if (CBool(Pagedataset.parentview)) Pagedataset.parentview = await JSB_MDL_CLONEVIEWTO(CStr(Projectname), CStr(Cprojectname), CStr(Pagedataset.parentview), await JSB_MDL_MAKECLONENAME(Cprojectname, Oldpagename, Pagedataset.parentview, Clonepagename));
    if (CBool(Pagedataset.childview)) Pagedataset.childview = await JSB_MDL_CLONEVIEWTO(CStr(Projectname), CStr(Cprojectname), CStr(Pagedataset.childview), await JSB_MDL_MAKECLONENAME(Cprojectname, Oldpagename, Pagedataset.childview, Clonepagename));

    Pagedataset.menuitem = ChangeI(Pagedataset.menuitem, Oldpagename, Clonepagename);
    Pagedataset.header = ChangeI(Pagedataset.header, Oldpagename, Clonepagename);

    if (await JSB_ODB_WRITEJSON(Pagedataset, await JSB_BF_FHANDLE('DICT', Cprojectname), CStr(Clonepagename) + '.page')); else return '';

    await JSB_MDL_UPDATEMENU_Sub(CStr(Projectname), true);

    if (await JSB_ODB_READ(Src, await JSB_BF_FHANDLE(CStr(Cprojectname)), CStr(Oldpagename), function (_Src) { Src = _Src })) {
        if (await JSB_ODB_WRITE(Change(Src, Oldpagename, Clonepagename), await JSB_BF_FHANDLE(CStr(Cprojectname)), CStr(Clonepagename))); else return Stop(activeProcess.At_Errors);
    }

    await JSB_MDL_REGENPAGEMODEL_Sub(Projectname, Clonepagename, false);

    return Clonepagename;
}
// </CLONEPAGEMODEL>

// <CLONEPAGEMODEL_Pgm>
async function JSB_MDL_CLONEPAGEMODEL_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Projectname, Pagename, Frompage, Sentence, Clonepagename;

    // %options aspxC-

    if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a data manager to run program');

    Projectname = paramVar('ProjectName');
    Pagename = paramVar('pageName');
    Frompage = paramVar('fromPage');

    if (isEmpty(Projectname) && InStr1(1, activeProcess.At_Sentence, '=') == 0) {
        Sentence = Field(activeProcess.At_Sentence, '(', 1);
        Projectname = Field(Sentence, ' ', 2);
        Pagename = Field(Sentence, ' ', 3);
        if (LCase(Projectname) == 'dict') {
            Projectname = Field(Sentence, ' ', 3);
            Pagename = Field(Sentence, ' ', 4);
        }
    }
    Pagename = dropIfRight(CStr(Pagename), '.page', true);

    Clonepagename = await JSB_MDL_CLONEPAGEMODEL(Projectname, Pagename);
    if (Clonepagename == Chr(27) || isEmpty(Clonepagename)) {
        if (CBool(Frompage)) { await JSB_MDL_RESPONSEREDIRECT(Frompage, function (_Frompage) { Frompage = _Frompage }); }
        if (hasParentProcess()) return Stop();
        await JSB_MDL_RESPONSEREDIRECT(jsbRootExecute(CStr(Pagename)));
    }

    if (CBool(Frompage)) {
        if (await JSB_BF_MSGBOX('Where to?', 'Go to new page?', '*Yes,No') != 'Yes') { await JSB_MDL_RESPONSEREDIRECT(Frompage, function (_Frompage) { Frompage = _Frompage }); }
    } else {
        if (hasParentProcess()) return Stop();
    }

    await JSB_MDL_RESPONSEREDIRECT(jsbRootExecute(CStr(Clonepagename)));
    return;
}
// </CLONEPAGEMODEL_Pgm>

// <CLONEVIEWTO>
async function JSB_MDL_CLONEVIEWTO(Fromprojectname, Toprojectname, Fromviewname, Opttoviewname) {
    // local variables
    var Ftodict, Tmp, Column, Newviewname, Htm;

    // %options aspxC-

    Ftodict = await JSB_BF_FHANDLE('DICT', Toprojectname);

    if (Not(Opttoviewname)) {
        Opttoviewname = Trim(await JSB_BF_INPUTBOX('Save a copy As', 'Enter a clone name (may space-prefix with another project)', '', '80%', ''));
        if (Opttoviewname == Chr(27) || !Opttoviewname) return false;

        if (InStr1(1, Opttoviewname, ' ')) {
            Toprojectname = Field(Opttoviewname, ' ', 1);
            Opttoviewname = Field(Opttoviewname, ' ', 2);
        }

        if (LCase(Left(Opttoviewname, 5)) == 'view_') Opttoviewname = Mid1(Opttoviewname, 6);
        Opttoviewname = dropIfRight(Opttoviewname, '.view', true);

        if (await JSB_ODB_READ(Tmp, Ftodict, Opttoviewname + '.view', function (_Tmp) { Tmp = _Tmp })) {
            if (await JSB_BF_MSGBOX('Confirm', Opttoviewname + ' already exists, overwrite?', 'Yes,*No') != 'Yes') return false;
        }
    }
    Opttoviewname = dropIfRight(Opttoviewname, '.view', true);

    // copy the view, and update any nested views (json_inline)
    var Dataset = undefined;
    if (await JSB_ODB_READJSON(Dataset, Ftodict, CStr(Fromviewname), function (_Dataset) { Dataset = _Dataset })); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);

    for (Column of iterateOver(Dataset.columns)) {
        var Ctlname = LCase(Column.control);
        if (Ctlname == 'json_inline' || Ctlname == 'json_popup') {
            Newviewname = await JSB_MDL_MAKECLONENAME(Toprojectname, dropIfRight(CStr(Fromviewname), '.view', true), Column.useview, dropIfRight(Opttoviewname, '.view', true));
            Column.useview = await JSB_MDL_CLONEVIEWTO(CStr(Fromprojectname), Toprojectname, CStr(Column.useview), CStr(Newviewname));
        }
    }

    if (await JSB_ODB_READ(Htm, Ftodict, CStr(Fromviewname) + '.htm', function (_Htm) { Htm = _Htm })) {
        if (await JSB_ODB_WRITE(CStr(Htm), Ftodict, Opttoviewname + '.htm')); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
    }

    if (await JSB_ODB_WRITEJSON(Dataset, Ftodict, Opttoviewname + '.view')); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
    return Opttoviewname + '.view';
}
// </CLONEVIEWTO>

// <CLONEWEBSITE_Pgm>
async function JSB_MDL_CLONEWEBSITE_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Frompage, Projectname, Title, Fmd, Dft, Newactname, Hold;
    var Didclone;

    // %options aspxC-
    if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a manager to run this command');
    Frompage = paramVar('fromPage');

    if (await JSB_ODB_ATTACHDB('')); else null;
    Projectname = jsbAccount();

    Title = 'New Project';
    Fmd = await JSB_BF_FHANDLE('MD');

    if (await JSB_ODB_READ(Dft, Fmd, CStr(Projectname), function (_Dft) { Dft = _Dft })); else Dft = '';


    while (true) {
        Newactname = await JSB_BF_INPUTBOX('Clone ' + CStr(Projectname), 'New Web Site Name', '', '80%', '');
        if (Newactname == Chr(27) || isEmpty(Newactname)) { if (CBool(Frompage)) return At_Response.Redirect(Frompage); else return; }

        if (CBool(Dft)) {
            if (await JSB_ODB_READ(Hold, Fmd, CStr(Newactname), function (_Hold) { Hold = _Hold })); else Hold = '';
            if (await JSB_ODB_WRITE(CStr(Dft), Fmd, CStr(Newactname))); else await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
            Didclone = await JSB_BF_CLONEACCOUNT(Newactname, undefined, function (_Newactname) { Newactname = _Newactname });
            if (CBool(Hold)) {
                if (await JSB_ODB_WRITE(CStr(Hold), Fmd, CStr(Newactname))); else await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
            } else {
                if (await JSB_ODB_DELETEITEM(Fmd, CStr(Newactname))); else await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
            }
        } else {
            Didclone = await JSB_BF_CLONEACCOUNT(Newactname, undefined, function (_Newactname) { Newactname = _Newactname });
        }

        if (CBool(Didclone)) break;
        await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors))
    }

    return At_Response.Redirect(HtmlRoot() + CStr(Newactname));
}
// </CLONEWEBSITE_Pgm>

// <COPYVIEWFROM>
async function JSB_MDL_COPYVIEWFROM(ByRef_Projectname, ByRef_Viewname, setByRefValues) {
    // local variables
    var Fdict, Sl, Fromviewname, Tmp, Dataset;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Viewname)
        return v
    }
    // %options aspxC-

    Fdict = await JSB_BF_FHANDLE('DICT', ByRef_Projectname);
    if (await JSB_ODB_SELECTTO('', Fdict, 'ItemId Like \'%.view\'', Sl, function (_Sl) { Sl = _Sl })); else { Println(Alert(CStr(activeProcess.At_Errors))); debugger; }
    Fromviewname = await JSB_BF_INPUTDROPDOWNBOX('Choose a view', 'Pick a view to choose from', Sort(getList(Sl)));
    if (Fromviewname == Chr(27) || isEmpty(Fromviewname)) return exit(false);
    Fromviewname = dropIfRight(CStr(Fromviewname), '.view', true) + '.view';
    if (await JSB_ODB_READJSON(Tmp, Fdict, CStr(Fromviewname), function (_Tmp) { Tmp = _Tmp })); else return exit(false);

    Dataset = Tmp;
    if (await JSB_ODB_WRITEJSON(Dataset, Fdict, CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);

    return exit(true);
}
// </COPYVIEWFROM>

// <CREATENEWVIEW>
async function JSB_MDL_CREATENEWVIEW(ByRef_Viewname, setByRefValues) {
    // local variables
    var Objectmodel, Dataset;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Viewname)
        return v
    }
    Objectmodel = await JSB_MDL_MODELFORVIEW();
    Dataset = await JSB_MDL_NEWROW(ByRef_Viewname, Objectmodel.columns, function (_ByRef_Viewname, _P2) { ByRef_Viewname = _ByRef_Viewname });
    await JSB_MDL_ADDEXTRACOLUMNS2VIEWMODEL_Sub(Objectmodel, Dataset.templateName, function (_Objectmodel, _P2) { Objectmodel = _Objectmodel });

    Dataset = await JSB_MDL_NEWROW(dropIfRight(CStr(ByRef_Viewname), '.view', true), Objectmodel.columns);
    Dataset.attachdb = Account();
    Dataset.columns = [undefined,];
    return exit(Dataset);
}
// </CREATENEWVIEW>

// <CRLFCOLUMN_Sub>
async function JSB_MDL_CRLFCOLUMN_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, setByRefValues) {
    // local variables
    var Dataset, Columnidx;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid)
        return v
    }
    // %options aspxC-
    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);
    Columnidx = await JSB_MDL_FINDVIEWCOLUMN(Dataset, ByRef_Columnid, function (_Dataset) { Dataset = _Dataset });
    if (Null0(Columnidx) == '0') return exit(undefined);
    Dataset.columns[Columnidx].newlineprefix = Not(Dataset.columns[Columnidx].newlineprefix);
    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edc-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </CRLFCOLUMN_Sub>

// <CUSTOMMERGE>
async function JSB_MDL_CUSTOMMERGE(Newgeneratedcode, Priorgeneratedcode) {
    // local variables
    var Lpriorgeneratedcode, Nci, Pci, Mergedcode, Pline, Nline;
    var Nci2, Ptline, Ntline, Done, Newtemp, Foundmatch, Nline2;
    var Ntline2, Xline, Z, Cd;

    // %options aspxC-

    Newgeneratedcode = Change(Newgeneratedcode, crlf, am);
    Priorgeneratedcode = Change(Priorgeneratedcode, crlf, am);

    Lpriorgeneratedcode = LCase(Priorgeneratedcode);
    if (!(InStr1(1, Lpriorgeneratedcode, '* \<insert\>')) && !InStr1(1, Lpriorgeneratedcode, '*\<insert\>') && !(InStr1(1, Lpriorgeneratedcode, '* \<delete\>')) && !InStr1(1, Lpriorgeneratedcode, '*\<delete\>')) return Newgeneratedcode;

    if (Not(isArray(Newgeneratedcode))) Newgeneratedcode = Split(Newgeneratedcode, am);
    if (Not(isArray(Priorgeneratedcode))) Priorgeneratedcode = Split(Priorgeneratedcode, am);

    Nci = LBound(Newgeneratedcode); // pointer into newGeneratedCode
    Pci = LBound(Priorgeneratedcode); // pointer into PriorGeneratedCode

    Mergedcode = [undefined,];


    while (true) {
        Pline = Priorgeneratedcode[Pci];
        Nline = Newgeneratedcode[Nci];

        if (isNothing(Pline)) {
            var _ForEndI_5 = UBound(Newgeneratedcode);
            for (Nci2 = +Nci; Nci2 <= _ForEndI_5; Nci2++) {
                Mergedcode[Mergedcode.length] = Newgeneratedcode[Nci2];
            }
            break;
        }

        Ptline = LCase(Trim(Pline));
        Ntline = LCase(Trim(Nline));

        if (Left(Ptline, 10) == '* \<insert\>' || Left(Ptline, 9) == '*\<insert\>') {
            Pline = LTrim(dropLeft(CStr(Pline), '\>'));
            if (CBool(Pline)) {
                Mergedcode[Mergedcode.length] = '* \<insert\>';
                Mergedcode[Mergedcode.length] = Pline;
                Mergedcode[Mergedcode.length] = '* \</insert\>';
                Pci++;
            } else {
                Pline = '* \<insert\>';

                do {
                    Mergedcode[Mergedcode.length] = Pline;
                    Done = (Left(Ptline, 11) == '* \</insert\>' || Left(Ptline, 10) == '*\</insert\>' || isNothing(Pline));
                    Pci++;
                    Pline = Priorgeneratedcode[Pci];
                    Ptline = LCase(Trim(Pline));
                }
                while (Not(CBool(Done)));
            }
        } else if (Left(Ptline, 10) == '* \<delete\>' || Left(Ptline, 9) == '*\<delete\>') {
            Ptline = dropLeft(CStr(Ptline), '\>');
            Ptline = Trim(Pline);
            if (Null0(Ptline) == Null0(Ntline)) Pci++;
            Mergedcode[Mergedcode.length] = Pline;
            Pci++;;
        } else if (Null0(Ptline) == Null0(Ntline)) {
            Mergedcode[Mergedcode.length] = Nline;
            Nci++;
            Pci++;;
        } else if (isEmpty(Ptline) || Left(Ptline, 1) == '*' || Left(Ptline, 2) == '//') {
            if (isEmpty(Ptline)) Mergedcode[Mergedcode.length] = Pline;
            Pci++;;
        } else {
            Newtemp = [undefined,];
            Foundmatch = false;

            var _ForEndI_13 = UBound(Newgeneratedcode);
            for (Nci2 = +Nci; Nci2 <= _ForEndI_13; Nci2++) {
                Nline2 = Newgeneratedcode[Nci2];
                Ntline2 = LCase(Trim(Nline2));

                if (Null0(Ptline) == Null0(Ntline2) && Len(Ptline) > 3) {
                    for (Xline of iterateOver(Newtemp)) {
                        Mergedcode[Mergedcode.length] = Xline;
                    }
                    Foundmatch = true;
                    Nci = Nci2;
                    break;
                }

                Newtemp[Newtemp.length] = Nline2;
            }

            if (Not(Foundmatch)) {
                // Couldn't match any pline with anything generated, go to next pline
                Pci++;
            }
        }
        if (Null0(Z) > 19999) break;
        Z++; // Fail safe for infinite loop
    }
    if (Null0(Z) > 19999) Alert('mdl updatecode fail safe fallout');

    Cd = Join(Mergedcode, am);
    return await JSB_MDL_FORMATCD(Cd, function (_Cd) { Cd = _Cd });
}
// </CUSTOMMERGE>

// <DB_Pgm>
async function JSB_MDL_DB_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Rolemsg, Tabid, Treeid, Centerhtml, Westoptions, Theme;
    var Northhtml, Northoptions, Southoptions, Eastoptions, Fromroot;
    var Tree, Westhtml, _Html, Cmd, Itemid, Menucmd, Menutext;
    var Menuval, Targetid, Targettext;

    // %options aspxC-

    // db database 
    // tables        -> showTop1000(id only)
    // views         -> showTop1000(id only)
    // Sql Selects   -> sqlQueryBuilder  (id or *NEW*)
    // reports       -> edp dbBuilderReports (id or blank for new)
    // --- all new windows get passed in tabID

    Rolemsg = (JSB_BF_ISAUTHENTICATED() ? '' : 'You must be logged in to view this page. ' + Anchor(LoginUrl(), 'Click here to login'));
    if (!(await JSB_BF_ISEMPLOYEE())) return Stop((Rolemsg ? Rolemsg : 'You must be at least an employee to view this page.'));

    if (window.JSB_MDL_CHECKIN_Sub) await JSB_MDL_CHECKIN_Sub();

    if (await JSB_ODB_ATTACHDB('')); else return Stop('Unable to detach');

    JSB_BF_THEME('lumen');
    Tabid = 'myTabs';
    Treeid = 'myTree';

    Centerhtml = JSB_HTML_TABS(Tabid, '', '', '', '', '', '');
    Westoptions = 'startsize: 270px';
    Theme = await JSB_BF_JSBCONFIG('default_jsb_Themes', 'theme_none');
    if (CBool(Theme)) Theme = 'jsb_themes.' + CStr(Theme);

    Northhtml = ''; Northoptions = ''; Southoptions = ''; Eastoptions = '';
    Fromroot = queryVar('root');

    /* call */ await asyncRpcRequest('DB_REMOVEVACANTDATABASES');
    /* call */ await asyncRpcRequest('DB_ADDNEWDATABASES');


    do {
        Tree = await JSB_MDL_DB_BUILDJSON4TREEVIEW(CStr(Tabid), CStr(Fromroot));
        Westhtml = Div('', JSONTree(CStr(Treeid), Tree), { "style": 'height: 98%; width: 100%; padding-top: 5px' });

        _Html = html('\r\n\
            \<style\>\r\n\
                .database\>label, .database\>li\>label {\r\n\
                    background: url("../jsb/pics/database.png") no-repeat;\r\n\
                    background-position-x: 18px;\r\n\
                    background-size: 18px;\r\n\
                    background-position-y: -2px;\r\n\
                }\r\n\
                \r\n\
                .treeFolder_Tables label {\r\n\
                    background: url("../jsb/pics/tables.png") no-repeat;\r\n\
                    background-position-x: 18px;\r\n\
                    background-size: 18px;\r\n\
                    background-position-y: -2px;\r\n\
                }\r\n\
                \r\n\
                .treeFolder_SqlSelects label {\r\n\
                    background: url("../jsb/pics/sql.png") no-repeat;\r\n\
                    background-position-x: 18px;\r\n\
                    background-size: 18px;\r\n\
                    background-position-y: -2px;\r\n\
                }\r\n\
                \r\n\
                .treeFolder_Reports label {\r\n\
                    background: url("../jsb/pics/reports.png") no-repeat;\r\n\
                    background-position-x: 18px;\r\n\
                    background-size: 18px;\r\n\
                    background-position-y: -2px;\r\n\
                }\r\n\
                \r\n\
                .treeFolder_Views label {\r\n\
                    background: url("../jsb/pics/views.png") no-repeat;\r\n\
                    background-position-x: 18px;\r\n\
                    background-size: 18px;\r\n\
                    background-position-y: -2px;\r\n\
                }\r\n\
                \r\n\
            \</style\>');

        _Html += CStr(LAYOUT(Centerhtml, Northhtml, Northoptions, 'South', Southoptions, 'East', Eastoptions, Westhtml, Westoptions));

        _Html += JSB_HTML_SCRIPT('function treeShow() { $("#mylayout").layout().open("west");}');
        _Html += JSB_HTML_SCRIPT('function treeToggle() {$("#mylayout").layout().toggle("west");}');
        _Html += JSB_HTML_SCRIPT('function treeHide() { if (innerWidth \< 1024) $("#mylayout").layout().close("west");}');

        // Add javascript to allow tree to be loaded via API
        _Html += await JSB_MDL_DB_LOADDBTREEGROUPS(Tabid, Treeid, function (_Tabid, _Treeid) { Tabid = _Tabid; Treeid = _Treeid });

        // Add jQuery drag & drop to allow .databases to be dropped on .databaseLists
        if (await JSB_BF_ISMANAGER()) {
            _Html += await JSB_MDL_DB_SETUPDRAGANDDROP(Fromroot, function (_Fromroot) { Fromroot = _Fromroot });
            _Html += await JSB_MDL_DB_SETUPCONTEXTMENUS(Fromroot, function (_Fromroot) { Fromroot = _Fromroot });
        }

        // Theme it
        if (CBool(Theme)) _Html = await asyncCallByName(Theme, me, 0/*ignore if missing */, System(27), System(28), _Html);

        // Display it
        Print(At(-1), _Html);

        if (!hasTclParent()) break;

        await At_Server.asyncPause(me);

        Cmd = formVar('SelectedMenu');
        Itemid = formVar('itemID');
        Menucmd = formVar('contextmenucmd');
        Menutext = formVar('contextmenutext');
        Menuval = formVar('contextmenuval');
        Targetid = formVar('contextmenuctlid');
        Targettext = formVar('contextmenuctltext');

        Print(At(-1));
        await JSB_BF_MSGBOX('You chose context menucmd: ' + CStr(Menucmd) + '; text: ' + CStr(Menutext) + '; val: ' + CStr(Menuval) + crlf + 'on target \'' + CStr(Targetid) + '\'; with text \'' + CStr(Targettext) + '\'');

    }
    while (Not(Cmd == 'Quit'));

    // If @HasParentProcess Then Stop @(-1) Else @Server.End
    return;
}
// </DB_Pgm>

// <DB_SETUPDRAGANDDROP>
async function JSB_MDL_DB_SETUPDRAGANDDROP(ByRef_Fromroot, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Fromroot)
        return v
    }
    // %options aspxC-

    return exit(JSB_HTML_SCRIPT('\r\n\
        ' + 'function disableDragAndDrop() {\r\n\
            $(".css-treeview,.databaseList,.group").droppable("destroy");\r\n\
            $(".database" ).draggable("destroy");\r\n\
        }\r\n\
        \r\n\
        ' + 'function setupDragAndDrop() {\r\n\
            var droppables = $(".css-treeview,.databaseList,.group").reverse();\r\n\
            window.acceptDrop = false;\r\n\
          \r\n\
            $(droppables).droppable(\r\n\
            { \r\n\
                classes: [ ".css-treeview" , "database", "group" ],\r\n\
                drop: function (event, ui) { \r\n\
                    // I had better have moved at least the line height\r\n\
                    if (window.acceptDrop && Math.abs(ui.position.top) \>= ui.helper.height()) {\r\n\
                        var srcDBName = ui.draggable.children().first().attr(\'id\'); // id is on first input child\r\n\
                        var prmGrp = $(event.target).children().first().attr(\'id\');\r\n\
                        if (!prmGrp) prmGrp = "";\r\n\
                        if ($(event.target).hasClass("group")) {\r\n\
                            var droppedOnFolder = $(event.target).children().first("input");\r\n\
                            if (droppedOnFolder && !$(droppedOnFolder).prop("checked")) $(droppedOnFolder).prop("checked", true);\r\n\
                        }\r\n\
                        \r\n\
                        ignoreNextFolderClick = true;\r\n\
                        ajaxReloadTree("db_MoveDataBaseAPI", srcDBName, prmGrp);\r\n\
                    } else {\r\n\
                        if (window.acceptDrop) ui.draggable.draggable(\'option\', \'revert\', true);\r\n\
                    }\r\n\
                    window.acceptDrop = false;\r\n\
                }\r\n\
            });\r\n\
          \r\n\
            $(".database" ).draggable( \r\n\
            { \r\n\
                start: function(event, ui) {\r\n\
                    window.acceptDrop = true;\r\n\
                },\r\n\
                scroll: false, \r\n\
                containment: ".css-treeview" \r\n\
            }); \r\n\
       }\r\n\
       \r\n\
       setupDragAndDrop();\r\n\
    '));
    return exit();
}
// </DB_SETUPDRAGANDDROP>

// <DB_SETUPCONTEXTMENUS>
async function JSB_MDL_DB_SETUPCONTEXTMENUS(ByRef_Fromroot, setByRefValues) {
    // local variables
    var Javascriptsharecode, Javascriptrenamecode, Javascriptdeletecode;
    var Javascriptnewsubgrpcode, S, Cmgroupmenu, _Html, Cmdatabasemenu;
    var Cmreportmenu, Cmrootmenu;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Fromroot)
        return v
    }
    // %options aspxC-

    // Add javascript to allow a context menu on .databaseList 
    Javascriptsharecode = ('\r\n\
        var root = queryVar(\'root\');\r\n\
        if (root) root += "|"; else root = "";\r\n\
       \r\n\
        if ($(contextMenuTarget).parent().hasClass(\'treeLeaf\')) {\r\n\
          // share report URL: \r\n\
          var data = string2json($(contextMenuTarget).attr(\'data\'));\r\n\
          var url = data.url;\r\n\
        } else {\r\n\
\r\n\
          var pathway = root + $(contextMenuTarget).parentsUntil(\'.css-treeview\').filter(\'.treeFolder:visible:not(.ui-draggable)\').reverse().map(function () { return $(this).attr("for") }).get().join("|");\r\n\
          var url = Field(myLocation(), "?", 1) + "?root=" + pathway;\r\n\
        }\r\n\
        windowOpen(url, \'_blank\');\r\n\
    ');

    Javascriptrenamecode = ('\r\n\
        var pathway = $(contextMenuTarget).parentsUntil(\'.css-treeview\').filter(\'.treeFolder:visible:not(.ui-draggable)\').reverse().map(function () { return $(this).attr("for") }).get().join("|");\r\n\
        var groupName = $(contextMenuTarget).attr(\'id\');\r\n\
        debugger\r\n\
        var newName = prompt("Please enter a new name for \'" + groupName + "\'");\r\n\
        if (newName) ajaxReloadTree("db_renameGroupAPI", pathway, newName);\r\n\
    ');

    Javascriptdeletecode = ('\r\n\
        var pathway = $(contextMenuTarget).parentsUntil(\'.css-treeview\').filter(\'.treeFolder:visible:not(.ui-draggable)\').reverse().map(function () { return $(this).attr("for") }).get().join("|");\r\n\
        var groupName = $(contextMenuTarget).attr(\'id\');\r\n\
        debugger\r\n\
        if (confirm("Are you sure you want to delete the group \'" + groupName + "\'")) ajaxReloadTree("db_deleteGroupAPI", pathway);\r\n\
    ');

    Javascriptnewsubgrpcode = ('\r\n\
        var pathway = $(contextMenuTarget).parentsUntil(\'.css-treeview\').filter(\'.treeFolder:visible:not(.ui-draggable)\').reverse().map(function () { return $(this).attr("for") }).get().join("|");\r\n\
        var groupName = $(contextMenuTarget).attr(\'id\');\r\n\
        debugger\r\n\
        var newName = prompt("Please enter a new subgroup name under \'" + pathway + "\'");\r\n\
        if (newName) ajaxReloadTree("db_newSubGroupAPI", pathway, newName);\r\n\
    ');

    // Groups
    S = [undefined,];
    Cmgroupmenu = 'grpContextMenu';
    _Html = CStr(_Html) + ContextMenu('#doNothingYet', {
        "Share URL": { "onclick": Javascriptsharecode },
        "Rename Group": { "onclick": Javascriptrenamecode },
        "Delete Group": { "onclick": Javascriptdeletecode },
        "New Sub-Group": { "onclick": Javascriptnewsubgrpcode }
    }, false, CStr(Cmgroupmenu));

    S[S.length] = '$(document).on("contextmenu", ".databaseList\>label", function (e) { return ' + CStr(Cmgroupmenu) + '(e, this) });';
    S[S.length] = '$(document).on("contextmenu", ".group\>label", function (e) { return ' + CStr(Cmgroupmenu) + '(e, this) });';

    // Databases
    Cmdatabasemenu = 'grpContextDBLeafMenu';
    _Html += ContextMenu('#doNothingYet', {
        "Delete Database": { "onclick": 'alert(\'not yet implemented\');' },
        "Rename Database": { "onclick": 'alert(\'not yet implemented\');' }
    }, false, CStr(Cmdatabasemenu));

    S[S.length] = '$(document).on("contextmenu", ".database\>label", function (e) { return ' + CStr(Cmdatabasemenu) + '(e, this) });';

    // Leafs (reports)
    S[S.length] = ('\r\n\
        window.editRPT = function(contextMenuTarget, e) {\r\n\
            var data = string2json($(contextMenuTarget).attr("data"));\r\n\
            var Url = jsbRootAct() + "makenewreport?databaseName=" + urlEncode(data.databaseName) + "&reportName=" + urlEncode(data.reportID); // tabID=" + urlEncode(data.tabID) + \r\n\
            // openInTab(data.tabID, "Edit_" + data.reportID, "Edit " + data.reportID, Url); \r\n\
            windowOpen(Url, \'_blank\'); \r\n\
            treeHide();\r\n\
        }\r\n\
        \r\n\
        window.shareRPT = function(contextMenuTarget, e) {\r\n\
            var data = string2json($(contextMenuTarget).attr("data"));\r\n\
            var Url = jsbRootAct() + urlEncode(data.reportID);\r\n\
            windowOpen(Url, \'_blank\'); \r\n\
            // treeHide();\r\n\
        }\r\n\
        \r\n\
        window.deleteRPT = function(contextMenuTarget, e) {\r\n\
            var pathway = $(contextMenuTarget).parentsUntil(\'.css-treeview\').filter(\'.treeFolder:visible:not(.ui-draggable)\').reverse().map(function () { return $(this).attr("for") }).get().join("|");\r\n\
            var data = string2json($(contextMenuTarget).attr("data"));\r\n\
            var url = jsbRootAct() + "deleteRptAPI?tabID=" + urlEncode(data.tabID) + "&databaseName=" + urlEncode(data.databaseName) + "&reportName=" + urlEncode(data.reportID) + "&path=" + urlEncode(pathway) ;\r\n\
            url += \'&cacheBuster=\' + newGUID();\r\n\
            var myDBTree = $("#" + string2json( $(contextMenuTarget).attr("data") ).databaseName)\r\n\
            \r\n\
            MsgBox("Confirm report deletion", "Are you sure you wish to delete the report: " + data.databaseName + "?", "Yes,No", 0, 0, \r\n\
                function (ans) { \r\n\
                    if (ans == "Yes") {\r\n\
                        disableDragAndDrop();\r\n\
                        \r\n\
                        // call deleteRptAPI\r\n\
                        ajaxCall("GET", url, null, function(success) {    \r\n\
                            if (window.setupDragAndDrop) setupDragAndDrop();\r\n\
                            if (success.AtErrors) alert(success.AtErrors); else {\r\n\
                                debugger;\r\n\
                                $(myDBTree).onclick = $(myDBTree).attr("prior_onclick")\r\n\
                                $(myDBTree)[0].click();\r\n\
                            }\r\n\
                        });\r\n\
                    }\r\n\
                }\r\n\
            )\r\n\
        }\r\n\
        \r\n\
    ');

    Cmreportmenu = 'grpContextRPTLeafMenu';
    _Html += ContextMenu('#doNothingYet', {
        "Share URL": { "onclick": 'shareRPT(contextMenuTarget, this);' },
        "Edit Report": { "onclick": 'editRPT(contextMenuTarget, this);' },
        "Delete Report": { "onclick": 'deleteRPT(contextMenuTarget, this);' }
    }, false, CStr(Cmreportmenu));

    S[S.length] = '$(document).on("contextmenu", ".usrReport", function (e) { return ' + CStr(Cmreportmenu) + '(e, this) });';

    Cmrootmenu = 'contextMenuRoot';
    _Html += ContextMenu('#doNothingYet', { "New Sub-Group": { "onclick": Javascriptnewsubgrpcode } }, false, CStr(Cmrootmenu));
    S[S.length] = '$(document).on("contextmenu", ".css-treeblankspace", function (e) { return ' + CStr(Cmrootmenu) + '(e, this) });';

    _Html += JSB_HTML_SCRIPT('\r\n\
        ' + 'function setupContextMenus() {\r\n\
             ' + Join(S, crlf) + '\r\n\
        }\r\n\
       \r\n\
        setupContextMenus();\r\n\
    ');

    return exit(_Html);
}
// </DB_SETUPCONTEXTMENUS>

// <DB_BUILDJSON4TREEVIEW>
async function JSB_MDL_DB_BUILDJSON4TREEVIEW(Tabid, Root) {
    // local variables
    var Dbgroups, Nopermissions, Onlinedbs, Cnt, Tree;

    // %options aspxC-
    Dbgroups = await asyncRpcRequest('DB_GETGROUPSFROMROOT', Root);
    if (isNothing(Dbgroups)) { Dbgroups = {} }

    Nopermissions = await asyncRpcRequest('DB_GETDATABASENAMESWITHOUTPERMISSONS');
    Onlinedbs = Split(LCase(await asyncRpcRequest('DB_GETDATABASENAMES')), am);

    Cnt = await JSB_MDL_DB_BUILDTREEVIEWSUBLEVEL(Tabid, Nopermissions, Onlinedbs, Dbgroups, Tree, function (_Tree) { Tree = _Tree });
    return Tree;
}
// </DB_BUILDJSON4TREEVIEW>

// <DB_BUILDTREEVIEWSUBLEVEL>
async function JSB_MDL_DB_BUILDTREEVIEWSUBLEVEL(Tabid, Nopermissions, Onlinedbs, Dbsubgroup, ByRef_Tree, setByRefValues) {
    // local variables
    var Dbcnt, Tag, V, Subcnt, Subtree;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tree)
        return v
    }
    // %options aspxC-

    ByRef_Tree = {};
    Dbcnt = 0;
    for (Tag of iterateOver(Dbsubgroup)) {
        V = Dbsubgroup[Tag];

        if (isJSON(V)) {
            // a High level group
            if (Len(V)) {
                Subcnt = await JSB_MDL_DB_BUILDTREEVIEWSUBLEVEL(Tabid, Nopermissions, Onlinedbs, V, Subtree, function (_Subtree) { Subtree = _Subtree });
                ByRef_Tree[Tag] = Subtree;

                if (CBool(Subcnt)) {
                    Dbcnt += +Subcnt;
                } else {
                    // subTree.disabled =  true
                    Subtree.caption = await JSB_MDL_DISABLEDLOOK(CStr(Tag) + ' (not online)');
                }
            } else {
                // empty group
                ByRef_Tree[Tag] = { "url": '' }
            }

            ByRef_Tree[Tag].class = 'group';
            ByRef_Tree[Tag].id = Tag;;
        } else {
            ByRef_Tree[Tag] = ({
                "url": jsbRestCall('db_getSubTree') + '?tabID=' + urlEncode(Tabid) + '&databaseName=' + urlEncode(V) + '&noCache=' + CStr(Timer()),
                "data": V,
                "class": 'database',
                "id": Tag
            });

            if (Locate(LCase(V), Onlinedbs, 0, 0, 0, "", position => { })) {
                if (Locate(LCase(V), Nopermissions, 0, 0, 0, "", position => { })) {
                    ByRef_Tree[Tag].caption = await JSB_MDL_DISABLEDLOOK(CStr(Tag) + ' (no permissions)');
                    ByRef_Tree[Tag].url = '';
                }
                Dbcnt++;
            } else {
                ByRef_Tree[Tag].caption = await JSB_MDL_DISABLEDLOOK(CStr(Tag) + ' (not online)');
                ByRef_Tree[Tag].url = '';
            }
        }
    }
    return exit(Dbcnt);
}
// </DB_BUILDTREEVIEWSUBLEVEL>

// <DISABLEDLOOK>
async function JSB_MDL_DISABLEDLOOK(ByRef_Txt, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Txt)
        return v
    }
    return exit(Chr(28) + '\<span style=\'opacity: .5; font-style: italic;\'\>' + Chr(29) + CStr(ByRef_Txt) + Chr(28) + '\</span\>' + Chr(29));
}
// </DISABLEDLOOK>

// <DB_LOADDBTREEGROUPS>
async function JSB_MDL_DB_LOADDBTREEGROUPS(ByRef_Tabid, ByRef_Treeid, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tabid, ByRef_Treeid)
        return v
    }
    // %options aspxC-

    return exit(JSB_HTML_SCRIPT('\r\n\
        ' + 'function reloadDbTree(Root) {\r\n\
            asyncRpcRequest(\'DB_GETGROUPSFROMROOT\', Root).then(Dbgroups =\> {\r\n\
                if (isNothing(Dbgroups)) { Dbgroups = {} }\r\n\
                asyncRpcRequest(\'DB_GETDATABASENAMESWITHOUTPERMISSONS\').then(Nopermissions =\> {\r\n\
                    asyncRpcRequest(\'DB_GETDATABASENAMES\').then(Onlinedbs =\> {\r\n\
                        Onlinedbs = Split(LCase(Onlinedbs),am); \r\n\
                        var newTree;\r\n\
                        if (!window.tabID) tabID = \'\';\r\n\
                        JSB_MDL_DB_BUILDTREEVIEWSUBLEVEL(tabID, Nopermissions, Onlinedbs, Dbgroups, null, function (_Tree) { newTree = _Tree }).then(function () {\r\n\
                            var treeID = $(".css-treeview").parent().attr(\'id\');\r\n\
                            var html = JSB_HTML_JSONTREE(treeID, newTree);\r\n\
                            debugger;\r\n\
                            var openedFolders = getTreeOpenedFolders()\r\n\
                            $(".css-treeview").html(html);\r\n\
                            reopenTreeFolders(openedFolders);\r\n\
                            if (window.setupDragAndDrop) setupDragAndDrop();\r\n\
                        });\r\n\
                    });\r\n\
                });\r\n\
            });\r\n\
        }\r\n\
        \r\n\
        ' + 'function ajaxReloadTree(operation, prmDB, prmGrp) {\r\n\
            if (!window.tabID) tabID = \'\';\r\n\
            var url = myRpcUrl + operation + \'?tabID=' + CStr(ByRef_Tabid) + '\';  // operation(tabID, root, prmDB, prmGrm\r\n\
            var root = queryVar(\'root\');\r\n\
            var openedFolders = getTreeOpenedFolders();\r\n\
            \r\n\
            if (!root) root = \'\';\r\n\
            url += \'&root=\' + urlEncode(root);\r\n\
            if (prmDB != null)  url += \'&prmDB=\' + urlEncode(prmDB)\r\n\
            if (prmGrp != null) url += \'&prmGrp=\' + urlEncode(prmGrp);\r\n\
            \r\n\
            url += \'&cacheBuster=\' + newGUID();\r\n\
            \r\n\
            disableDragAndDrop();\r\n\
            \r\n\
            ajaxCall("GET", url, null, function(result) {  \r\n\
                if (result.startsWith(\'0x\')) {\r\n\
                    result = string2json(XTS(result));\r\n\
                    reloadDbTree(root);\r\n\
                } else {\r\n\
                    debugger;\r\n\
                    if (result != \'\') alert(result);\r\n\
                }\r\n\
            })\r\n\
        }\r\n\
    '));
    return exit();
}
// </DB_LOADDBTREEGROUPS>

// <DBCLEANJSON>
async function JSB_MDL_DBCLEANJSON(ByRef_Dbsubgroup, setByRefValues) {
    // local variables
    var Tag, V, Ary, Db;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Dbsubgroup)
        return v
    }
    // %options aspxC-

    for (Tag of iterateOver(ByRef_Dbsubgroup)) {
        V = ByRef_Dbsubgroup[Tag];

        if (CBool(isArray(V))) {
            Ary = V;
            V = {};
            for (Db of iterateOver(Ary)) {
                V[Db] = Db;
            }
            ByRef_Dbsubgroup[Tag] = V;
        }

        if (isJSON(V)) { await JSB_MDL_DBCLEANJSON(V, function (_V) { V = _V }); }
    }
    return exit();
}
// </DBCLEANJSON>

// <DBUPLOADDATABASE_Pgm>
async function JSB_MDL_DBUPLOADDATABASE_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Attacheddb, Tabid, Dbprefix, Ftmp, Fsystem, Ftmppath, Actname;
    var Ctlid, Style, Nicebackground, Header, Ctlhtml, Btns, Cmd;
    var Uploadddbname, Ext, Uploadedfilecontents, L, Srcdb, Appendrecords;
    var Dstdb, Ans, Msg, I, Newname, Ds;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                var Pg = undefined;
                // %options aspxC-

                if (await JSB_ODB_ATTACHDB('')); else null;

                Attacheddb = At_Session.Item('ATTACHEDDATABASE');

                if (!(await JSB_BF_ISMANAGER())) {
                    await JSB_BF_MSGBOX('You must be a data Manager to run this command');
                    if (CBool(Tabid)) At_Server.End(); else return Stop();
                }

                // Insure we have the proper setup
                if (await JSB_ODB_ATTACHDB('')); else null;

                Dbprefix = 'z' + Change(Field(await JSB_BF_EMAIL(), '@', 1), '_', '.');
                if (InStr1(1, Dbprefix, '.')) {
                    Dbprefix = Split(Dbprefix, '.');
                    Dbprefix = UCase(Left(Dbprefix[1], 1)) + UCase(Left(Dbprefix[2], 1)) + LCase(Mid1(Dbprefix[2], 2));
                }
                Dbprefix += '-';

                Ftmp = await JSB_BF_FHANDLE('tmp');
                Fsystem = await JSB_BF_FHANDLE('system');
                Ftmppath = filePath(Ftmp);
                if (Not(Ftmppath)) { gotoLabel = "ERROUT"; continue atgoto; }

                JSB_BF_THEME('lumen');
                Actname = Account();
                Tabid = paramVar('tabID');
                Ctlid = 'uploadBoxID';
                Style = JSB_HTML_STYLE('#jsb { word-wrap: break-all; white-space: normal }');
                Nicebackground = IMAGE('bk', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAAC3CAMAAAAGjUrGAAAAaVBMVEX///9CpfX4+/8uoPU1ofUrnvQ8o/VTrfa32PowoPTU6P37/f/x+P9Rqvbd7f3K4/zi8P3q9P5vt/dFp/WTx/mo0fpstvd+vvidzPl4u/ix1vu83PtfsPbO5fzB3/va6/2PxvmayvmEwfg9U86wAAAFZUlEQVR4nO2d23qqMBCFlRwoAooinqvo+z/kBq1tdYsFnZWJfvNfeGVLskwmk5lM6PUEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRCEXpxku8/RaDQYjgPutnhAtp7OUmuUirTWShmVbg7FZ8LdLDay1aSSwdr+BdbqSKXTUczdPPeMi43RV3L8Fkbp5Za7jW7Zzu4IctYlstMxd0OdUeTqL0FOaLUccjfWCSutWwlyGixmlnE3GM4ojdorclRFHd7b3CZL027WXKiiP7jbDWR9vfC2RM3e1pebq4cUqYeKHXE3HkKSdrCt/w+Vgrv9AAYt199GUebcPSBn+/C8OaM33H0g5sM8K0llVNK3WpS3BJJUooTc/SCERpJKlPeZPjsiSSqbsuTuCxHJcwvOBdGeuzc0bAg16Zu3cN7KZ1y1G6K8QWByQGZMTtgZd4+6EwfZsCJLTs5EnFPOnBq1Yu5hJ4br/SSsg/A1xxD8ajilnTlHUV5lkzyug/DaXgQDrNVPbnJuYl9i5xPcDcKTo/wP0mYH5VCQ/gu4s8MZYn7cx3gdtx7PHwiwPo312cVfcChSobx13LLw6UDRg+gFd98b+HBvSL7JuTt/mwPXIKnxcjmOZ/QOagd8nDxByjdvajx0UQLynV1XvNv0xMyjpCLyLbZEGjl7DN8MypzVvJ7wzJVdcS7C33jloQy9kKRvuHX4Db99PaI8Ov9X+DFMfPJkE08k6UcDbim+WfoxcypNPrmlOJMRZ2sexx+nzZth4o8mY1+sCa8mcZB8E0y9GSZ9tWMQY7xeTMI8Mr/xRxIG/2RYpqpO63H3vBl7cOqgJEXq04howJq0cBW+T0rlwb63FVqVTkJLRZdSEna0xp+vzsKOpSTsRBtworRgTNk8isUe0nm8cKJN22H/GXkUf4O0JHqJU0XDzrhBI89R2ctwCRBQfUIMlcSU1SMS3EjB5MAmyIljTitmgotbIk6dL5BrsDk7EUEIE0WRJ3w+kbEi87NYBjg7bogDbzGqocfGXlw8AJyjtCVPB6Axua4aWKKcIF1SSpIBfTX1X3z9gDJditLLx0VZrb4RDitBPwFlDnkIM7BW3/zp9qAHGrowE2yY2LwhQFhgRKE7iQ9L7dmwMQ5GUVt7A7JzswVo0dGbO4sjVSnp1SOpIkwg31JP7j51gKhboNr2JJhhHP01tzOEKIYmPruGmBNV/v1jAGIHak2iSYmYOq12ZIBtsp2SaIIwJ6ZliJR8R0hjUGKEJK1HMPmO0FJsBAHeSZda8Tnx5ofEQ6E/xnhri9PMgXackhxzG1HvUjsWihOPU5JjKc9f6nNNvht8cec4xPkrgxWtRfFUk370xb3Vp6++vkRsZBXFbaLkc+eHe/fvoSL4JOPk3TShiFTvcHFHDk1I1h3gUUYWTSiOuSH82C84NLEEkiBT5wyaEAVQIPviIxyalCSarGH5LgZNSNyTXi+AZTIYNKG6lQuW63evCdmlXKi4PYMmmuq4Hyy/w6AJ2cFqVB7QuSaECWNUvti5JpT3LE1AWS/Hmtj7WbZugKr8XGtCev6kB7iBsO9cE017tyxmI+hYE5rt3w8DxHrsVhNDXiAIKbnPw0bIn4V4UcISYVJsI9RPwtzePXu90p0fQJUZMe7cNxwdol6RAK3fQYKr3wHXeeFQB5wkvd7qBeqKr7FkAYIGXrBuNMRfsNvpVXXsaPQgORHsI7fXSz+M1dHC1RWH8UvcV6BNunL6kqLdNPf3Xov63nyV7xkumRpv95Mwt8rULzYwdz/VrU/Un+k8nOy3nLezxYF3MKohCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCILQin/qP2m6tagoOQAAAABJRU5ErkJggg==', { "style": 'margin-top: 15%' });
                Nicebackground = Div('backgroundPic', CStr(Nicebackground), { "style": 'position:fixed; top: 0; width:100%; height:100%; background-color:white', "class": 'watermark' });

                Header = [undefined, CStr(Nicebackground) + CStr(Style)];

                Ctlhtml = JSB_HTML_UPLOADBOX(CStr(Ctlid), '', 0, false, '', [undefined, 'title="Database"', 'placeholder="Database"'], [undefined, '']);
                Ctlhtml = lblCtlSet('Database', CStr(Ctlhtml), CStr(Ctlid), true, 0, '');

                JSB_HTML_SUBMITBTN('Btn', 'OK', 'OK Display', {}, 'danger', 'lg', 'alert(\'you clicked it\')');

                Btns = Div('', JSB_HTML_SAVEBTN('cmd', 'Upload', 'Upload', {}, '', '', 'if ($(\'#uploadBoxID\').val()) startSpinner(\'Uploading\')') + JSB_HTML_SAVEBTN('cmd', 'Cancel', 'Cancel'), { "class": 'col-xs-12 col-sm-10 col-md-10 col-lg-11', "style": 'xmargin-top:5px' });

                Println(At(-1), Join(Header, crlf), Ctlhtml, Btns);

                await At_Server.asyncPause(me);

                Cmd = formVar('cmd');

                if (Cmd != 'Upload') { gotoLabel = "DOEXIT"; continue atgoto; }

                Uploadddbname = At_Request.FileName(Ctlid);
                if (Not(Uploadddbname)) { gotoLabel = "ERROUT"; continue atgoto; }

                Ext = LCase(fieldIfRight(CStr(Uploadddbname), '.'));

                Uploadddbname = dropIfRight(CStr(Uploadddbname), '.');

                if (Locate(Ext, [undefined, 'accdb', 'mdb', 'db3', 'sl3', 'xls', 'xlsx', 'xlsm', 'xlsb'], 0, 0, 0, "", position => { })); else {
                    await JSB_BF_MSGBOX('Files must have an extension of: .accdb, .mdb, .sl3, .xlsx, .xls or .db3');
                    gotoLabel = "DOEXIT"; continue atgoto;
                }

                // Get the database
                Uploadedfilecontents = await JSB_HTML_REQUESTFILE(CStr(Ctlid));
                L = Len(Uploadedfilecontents);

                if (Locate(Ext, [undefined, 'xls', 'xlsx', 'xlsm', 'xlsb'], 0, 0, 0, "", position => { })) {
                    Srcdb = CStr(Uploadddbname) + '.' + CStr(Ext);
                    if (await JSB_ODB_WRITE(CStr(Uploadedfilecontents), Ftmp, CStr(Srcdb))); else { gotoLabel = "ERROUT"; continue atgoto; }
                    if (Not(await JSB_MDL_SHOWEXCELFORM(undefined, Ftmp.filePath(), Srcdb, 'scp_history', function (_P1, _P2, _Srcdb, _P4) { Srcdb = _Srcdb }))) await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
                    return Stop();
                }

                Srcdb = CStr(Dbprefix) + Change(Timer(), '.', '') + '.' + CStr(Ext);
                if (await JSB_ODB_WRITE(CStr(Uploadedfilecontents), Ftmp, CStr(Srcdb))); else { gotoLabel = "ERROUT"; continue atgoto; }

                Appendrecords = false;
                Dstdb = CStr(Dbprefix) + CStr(Uploadddbname);

                // Incase we msgbox
                Print(At(-1), Join(Header, crlf));


                while (await JSB_BF_DBDATABASEEXISTS(CStr(Dstdb))) {
                    Ans = await JSB_BF_MSGBOX('The SQL Server database ' + CStr(Uploadddbname) + ' already exists.  What do you want to do?', 'Delete Existing SQL DB,Choose a New Name,Rename the existing SQL DB,Append New Records,Cancel');
                    if (isEmpty(Ans) || Ans == Chr(27) || Ans == 'Cancel') { gotoLabel = "ERROUT"; continue atgoto; }

                    var dblBreak16 = false;
                    switch (Ans) {
                        case 'Delete Existing SQL DB':
                            if (await JSB_BF_MSGBOX('Are you sure you want to DELETE the existing SQL database: ' + CStr(Dstdb), 'DELETE IT!,Cancel') != 'DELETE IT!') continue;

                            if (!(await JSB_BF_DBDROPSQLDATABASE(CStr(Dstdb)))) await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));

                            break;

                        case 'Choose a New Name': case 'Rename the existing SQL DB':
                            Msg = Ans;

                            while (true) {
                                for (I = 1; I <= 50; I++) {
                                    if (Null0(I) > 1) Newname = CStr(Dbprefix) + CStr(Uploadddbname) + '_' + CStr(I);
                                    if (!(await JSB_BF_DBDATABASEEXISTS(CStr(Newname)))) break;
                                }
                                if (Null0(I) >= 50) Newname = '';

                                Newname = await JSB_BF_INPUTBOX('New Name', CStr(Msg), CStr(Newname), undefined, undefined);
                                if (isEmpty(Newname) || Newname == Chr(27)) { gotoLabel = "DOEXIT"; continue atgoto; }

                                if (Not(await JSB_BF_DBDATABASEEXISTS(CStr(Dbprefix) + CStr(Newname)))) break;
                                Msg = CStr(Newname) + ' is already used. Try again:';
                            }

                            if (Ans == 'Choose a New Name') {
                                Dstdb = CStr(Dbprefix) + CStr(Newname);
                            } else {
                                if (!(await JSB_BF_DBRENAMESQLDATABASE(CStr(Dstdb), CStr(Dbprefix) + CStr(Newname)))) await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
                            }

                            break;

                        case 'Append New Records':
                            Appendrecords = true;
                            { dblBreak16 = true; break };

                            break;

                        default:
                            gotoLabel = "DOEXIT"; continue atgoto;
                    }
                    if (dblBreak16) break;
                }

                if (Ext == 'accdb') {
                    Ds = 'Provider=Microsoft.ACE.OLEDB.12.0;Data Source="' + CStr(Ftmppath) + CStr(Srcdb) + '";Persist Security Info=False';
                } else if (Ext == 'xlsx') {
                    Ds = 'Provider=Microsoft.ACE.OLEDB.12.0;Data Source="' + CStr(Ftmppath) + CStr(Srcdb) + '";Extended Properties="Excel 12.0 Xml;HDR=YES"';
                } else if (Ext == 'mdb') {
                    Ds = 'Provider=Microsoft.Jet.OLEDB.4.0;Data Source="' + CStr(Ftmppath) + CStr(Srcdb) + '";Persist Security Info=False';
                } else {
                    Ds = 'Data Source="' + CStr(Ftmppath) + CStr(Srcdb) + '";Version=3;New=False;Compress=False;Pooling=True;datetimeformat=CurrentCulture';
                }
                if (await JSB_ODB_WRITE('D\xFE' + CStr(Ds), Fsystem, CStr(Srcdb))); else { gotoLabel = "ERROUT"; continue atgoto; }

                if (await JSB_BF_DBCOPYDATABASE(Srcdb, Dstdb, Appendrecords, function (_Srcdb, _Dstdb, _Appendrecords) { Srcdb = _Srcdb; Dstdb = _Dstdb; Appendrecords = _Appendrecords })) { gotoLabel = "DOEXIT"; continue atgoto; }


            case "ERROUT":

                if (activeProcess.At_Errors) await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));


            case "DOEXIT":

                if (await JSB_ODB_ATTACHDB(CStr(Attacheddb))); else null;

                if (await JSB_ODB_DELETEITEM(Fsystem, CStr(Srcdb))); else null;
                if (await JSB_ODB_DELETEITEM(Ftmp, CStr(Srcdb))); else null;

                if (Not(Tabid)) return Stop('');

                Print(At(-1), JSB_HTML_SCRIPT('\r\n\
        if (window.parent.reloadDbTree) window.parent.reloadDbTree();\r\n\
    '));

                FlushHTML();
                Print(At(-1)); FlushHTML();
                At_Server.End();
                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </DBUPLOADDATABASE_Pgm>

// <DB_CUSTOMMENU_Sub>
async function JSB_MDL_DB_CUSTOMMENU_Sub(ByRef_Jsonmenu, setByRefValues) {
    // local variables
    var Tabid, Onclick, Url;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Jsonmenu)
        return v
    }
    // %options aspxC-
    Tabid = 'myTabs';

    // ******************* Open / Close     // ******************* 
    Onclick = 'treeToggle()';
    ByRef_Jsonmenu.iconOpenClose = { "id": 'openclose', "glyphicon": 'forward', "onclick": Onclick };

    // ******************* upload     // ******************* 
    if (await JSB_BF_ISMANAGER()) {
        Url = (jsbRestCall('dbUploadDatabase') + '?tabID=' + urlEncode(Tabid) + '&noCache=' + CStr(Timer()));
        Onclick = 'openInTab(' + jsEscapeString(CStr(Tabid)) + ', "Upload_Database", "Upload database", ' + jsEscapeString(CStr(Url)) + ');';
        ByRef_Jsonmenu.File = {};
        ByRef_Jsonmenu.File.Upload = { "id": 'upload', "caption": 'Upload MS Access Or Excel DB', "onclick": Onclick };
        ByRef_Jsonmenu.collaspable = true;
    }

    if (hasTclParent()) {
        ByRef_Jsonmenu.btnQuit = 'Quit'; // put into @FormVar('SelectedMenu') will be "Quit";
    }
    return exit();
}
// </DB_CUSTOMMENU_Sub>

// <DB_SERVER>
async function JSB_MDL_DB_SERVER() {
}
// </DB_SERVER>

// <MOVEDBTOLIST>
async function JSB_MDL_MOVEDBTOLIST(Dbsubgroup, Dbname, Togroup) {
    // local variables
    var Tag;

    if (Togroup) {
        for (Tag of iterateOver(Dbsubgroup)) {
            var V = Dbsubgroup[Tag];
            var L = Len(V);

            if (isJSON(V) && L) {
                if (Null0(Tag) == Null0(Togroup)) {
                    V[Dbname] = Dbname;
                    return true;
                } else {
                    // a High level group
                    if (await JSB_MDL_MOVEDBTOLIST(V, CStr(Dbname), CStr(Togroup))) return true;
                }
            } else if (Null0(Tag) == Null0(Togroup)) {
                // *** a single database
                V = [undefined, Dbname];
                Dbsubgroup[Tag] = V;
                return true;
            }
        }
    } else {
        Dbsubgroup[Dbname] = Dbname;
        return true;
    }

    return false;
}
// </MOVEDBTOLIST>

// <HASGROUPNAME>
async function JSB_MDL_HASGROUPNAME(Dbsubgroup, Groupname) {
    // local variables
    var Tag;

    for (Tag of iterateOver(Dbsubgroup)) {
        if (Null0(Tag) == Null0(Groupname)) return true;
        var V = Dbsubgroup[Tag];

        if (isJSON(V)) {
            if (await JSB_MDL_HASGROUPNAME(V, CStr(Groupname))) return true;
        }
    }

    return false;
}
// </HASGROUPNAME>

// <REMOVETREEVIEWDB>
async function JSB_MDL_REMOVETREEVIEWDB(Dbsubgroup, Dbname) {
    // local variables
    var Tag, Spot;

    var Changed = false;

    for (Tag of iterateOver(Dbsubgroup)) {
        var V = Dbsubgroup[Tag];

        if (isJSON(V)) {
            // a High level group
            if (await JSB_MDL_REMOVETREEVIEWDB(V, CStr(Dbname))) Changed = true;
        } else if (CBool(isArray(V))) {
            // *** an array of databases
            if (Locate(Dbname, V, 0, 0, 0, "", position => Spot = position)) {
                V.Delete(Spot);
                Changed = true;
            }
        } else if (Null0(Tag) == Null0(Dbname)) {
            // *** a single database
            delete Dbsubgroup[Tag]
            Changed = true;
        }
    }

    return Changed;
}
// </REMOVETREEVIEWDB>

// <DBFINDANDRENAMEGROUP>
async function JSB_MDL_DBFINDANDRENAMEGROUP(Dbsubgroup, Path, Newname) {
    // local variables
    var Tag;

    var Groupname = (fieldLeft(CStr(Path), '|'));
    var Subpath = (dropLeft(CStr(Path), '|'));

    for (Tag of iterateOver(Dbsubgroup)) {
        if (Null0(Tag) == Null0(Groupname)) {
            var V = Dbsubgroup[Tag];
            if (Subpath) {
                if (isJSON(V)) {
                    if (await JSB_MDL_DBFINDANDRENAMEGROUP(V, Subpath, CStr(Newname))) return true;
                }
            } else {
                delete Dbsubgroup[Groupname]
                Dbsubgroup[Newname] = V;
                return true;
            }
        }
    }

    return false;
}
// </DBFINDANDRENAMEGROUP>

// <DBFINDANDDELETEGROUP>
async function JSB_MDL_DBFINDANDDELETEGROUP(Dbsubgroup, Path) {
    // local variables
    var Tag;

    var Groupname = (fieldLeft(CStr(Path), '|'));
    var Subpath = (dropLeft(CStr(Path), '|'));

    for (Tag of iterateOver(Dbsubgroup)) {
        if (Null0(Tag) == Null0(Groupname)) {
            var V = Dbsubgroup[Tag];
            if (Subpath) {
                if (isJSON(V)) {
                    if (await JSB_MDL_DBFINDANDDELETEGROUP(V, Subpath)) return true;
                }
            } else {
                delete Dbsubgroup[Groupname]
                return true;
            }
        }
    }

    return false;
}
// </DBFINDANDDELETEGROUP>

// <NEWSUBGROUPAPI_Pgm>
async function JSB_MDL_NEWSUBGROUPAPI_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Tabid = '', Root = '', Prmdb = '', Prmgrp = '', Restful_Result;
    var R, Cb;

    var Restful_Result;
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Tabid = JSB_BF_PARAMVAR('TABID', CStr(1)); Root = JSB_BF_PARAMVAR('ROOT', CStr(2)); Prmdb = JSB_BF_PARAMVAR('PRMDB', CStr(3)); Prmgrp = JSB_BF_PARAMVAR('PRMGRP', CStr(4));
                await JSB_MDL_DBNEWSUBGROUP_Sub(Root, Prmdb, Prmgrp, function (_Prmgrp) { Prmgrp = _Prmgrp });
                Restful_Result = ''; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto;

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </NEWSUBGROUPAPI_Pgm>

// <DBNEWSUBGROUP_Sub>
async function JSB_MDL_DBNEWSUBGROUP_Sub(Root, Path, ByRef_Newsubgroupname, setByRefValues) {
    // local variables
    var Dbgroups;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Newsubgroupname)
        return v
    }
    Dbgroups = await JSB_MDL_GETDBGROUPSFROMROOT(Root, function (_Root) { Root = _Root });
    if (isNothing(Dbgroups)) return exit(undefined);

    if (await JSB_MDL_DBFINDANDADDSUBGROUP(Dbgroups, Path, ByRef_Newsubgroupname, function (_Dbgroups, _Path, _ByRef_Newsubgroupname) { Dbgroups = _Dbgroups; Path = _Path; ByRef_Newsubgroupname = _ByRef_Newsubgroupname })) { await JSB_MDL_UPDATEGROUPFROMPATH(Root, Dbgroups, function (_Root, _Dbgroups) { Root = _Root; Dbgroups = _Dbgroups }); }
    return exit();
}
// </DBNEWSUBGROUP_Sub>

// <DELETEGROUPAPI_Pgm>
async function JSB_MDL_DELETEGROUPAPI_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Tabid, Root = '', Path = '', Restful_Result, R, Cb;

    var Restful_Result;
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Tabid = JSB_BF_PARAMVAR('TABID', CStr(1)); Root = JSB_BF_PARAMVAR('ROOT', CStr(2)); Path = JSB_BF_PARAMVAR('PATH', CStr(3));
                if (Not(await JSB_MDL_DBDELETEGROUP(Root, Path))) { Restful_Result = activeProcess.At_Errors; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto; }
                Restful_Result = ''; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto;

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </DELETEGROUPAPI_Pgm>

// <DBDELETEGROUP>
async function JSB_MDL_DBDELETEGROUP(Root, Path) {
    var Dbgroups = await JSB_MDL_GETDBGROUPSFROMROOT(Root, function (_Root) { Root = _Root });
    if (isNothing(Dbgroups)) return false;

    if (await JSB_MDL_DBFINDANDDELETEGROUP(Dbgroups, CStr(Path))) {
        await JSB_MDL_UPDATEGROUPFROMPATH(Root, Dbgroups, function (_Root, _Dbgroups) { Root = _Root; Dbgroups = _Dbgroups });
    }

    return '';
}
// </DBDELETEGROUP>

// <DBMOVEDATABASEAPI_Pgm>
async function JSB_MDL_DBMOVEDATABASEAPI_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Tabid = '', Root = '', Frompath = '', Topath = '', Restful_Result;
    var R, Cb;

    var Restful_Result;
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Tabid = JSB_BF_PARAMVAR('TABID', CStr(1)); Root = JSB_BF_PARAMVAR('ROOT', CStr(2)); Frompath = JSB_BF_PARAMVAR('FROMPATH', CStr(3)); Topath = JSB_BF_PARAMVAR('TOPATH', CStr(4));
                if (Not(await JSB_MDL_DBMOVEDBTOGROUP(Root, Frompath, Topath))) { Restful_Result = activeProcess.At_Errors; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto; }
                Restful_Result = ''; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto;

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </DBMOVEDATABASEAPI_Pgm>

// <DBMOVEDBTOGROUP>
async function JSB_MDL_DBMOVEDBTOGROUP(Root, Dbname, Togroup) {
    var Dbgroups = await JSB_MDL_GETDBGROUPSFROMROOT(Root, function (_Root) { Root = _Root });
    if (isNothing(Dbgroups)) return false;

    await JSB_MDL_REMOVETREEVIEWDB(Dbgroups, CStr(Dbname));
    if (await JSB_MDL_MOVEDBTOLIST(Dbgroups, CStr(Dbname), CStr(Togroup))) { await JSB_MDL_UPDATEGROUPFROMPATH(Root, Dbgroups, function (_Root, _Dbgroups) { Root = _Root; Dbgroups = _Dbgroups }); }

    return '';
}
// </DBMOVEDBTOGROUP>

// <RENAMEGROUPAPI_Pgm>
async function JSB_MDL_RENAMEGROUPAPI_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Tabid = '', Root = '', Fromname = '', Toname = '', Restful_Result;
    var R, Cb;

    var Restful_Result;
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Tabid = JSB_BF_PARAMVAR('TABID', CStr(1)); Root = JSB_BF_PARAMVAR('ROOT', CStr(2)); Fromname = JSB_BF_PARAMVAR('FROMNAME', CStr(3)); Toname = JSB_BF_PARAMVAR('TONAME', CStr(4));
                if (Not(await JSB_MDL_DBRENAMEGROUP(Root, Fromname, Toname, function (_Root, _Fromname, _Toname) { Root = _Root; Fromname = _Fromname; Toname = _Toname }))) { Restful_Result = activeProcess.At_Errors; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto; }
                Restful_Result = ''; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto;

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </RENAMEGROUPAPI_Pgm>

// <DB_RENAMEGROUP>
async function JSB_MDL_DB_RENAMEGROUP(Root, Path, Newname) {
    // local variables
    var Dbgroups;

    Dbgroups = await JSB_MDL_GETDBGROUPSFROMROOT(Root, function (_Root) { Root = _Root });
    if (isNothing(Dbgroups)) return false;

    if (await JSB_MDL_HASGROUPNAME(Dbgroups, CStr(Newname))) { activeProcess.At_Errors = '\'' + CStr(Newname) + '\' already exists'; return false; }

    if (await JSB_MDL_DBFINDANDRENAMEGROUP(Dbgroups, CStr(Path), CStr(Newname))) {
        await JSB_MDL_UPDATEGROUPFROMPATH(Root, Dbgroups, function (_Root, _Dbgroups) { Root = _Root; Dbgroups = _Dbgroups });
    }

    return '';
}
// </DB_RENAMEGROUP>

// <RUNREPORTURL>
async function JSB_MDL_RUNREPORTURL(Tabid, Reportid, Databasename) {
    return jsbRootAccount() + urlEncode(Reportid) + '?tabID=' + urlEncode(Tabid) + '&databaseName=' + urlEncode(Databasename);
}
// </RUNREPORTURL>

// <NEWREPORTURL>
async function JSB_MDL_NEWREPORTURL(Tabid, Databasename) {
    return jsbRootAccount() + 'makenewreport?tabID=' + urlEncode(Tabid) + '&databaseName=' + urlEncode(Databasename);
}
// </NEWREPORTURL>

// <DB_SHOWTOP1000URL>
async function JSB_MDL_DB_SHOWTOP1000URL(Tabid, Tableorviewname, Databasename) {
    return jsbRootAccount() + 'showTop1000?tabID=' + urlEncode(Tabid) + '&tableID=' + urlEncode(Tableorviewname) + '&databaseName=' + urlEncode(Databasename);
}
// </DB_SHOWTOP1000URL>

// <DB_GETSUBTREE_Pgm>
async function JSB_MDL_DB_GETSUBTREE_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Tabid = '', Databasename = '', Restful_Result, R, Cb;

    var Restful_Result;
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Tabid = JSB_BF_PARAMVAR('TABID', CStr(1)); Databasename = JSB_BF_PARAMVAR('DATABASENAME', CStr(2));
                Restful_Result = await JSB_MDL_DBGETSUBTREE(Tabid, Databasename); gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto;

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </DB_GETSUBTREE_Pgm>

// <DBGETSUBTREE>
async function JSB_MDL_DBGETSUBTREE(Tabid, Databasename) {
    var Preventtimeout = System(56);
    Databasename = Change(Change(Databasename, '[', ''), ']', '');

    var Tables = await JSB_MDL_DB_GETLISTOFTABLES(CStr(Tabid), Databasename);
    var Views = await JSB_MDL_DB_GETLISTOFVIEWS(CStr(Tabid), Databasename);
    var Dbbuilderreports = await JSB_MDL_DB_GETLISTOFREPORTS(CStr(Tabid), Databasename);
    // Dim CustomSQLs As Json = @db_getListOfCustomSQL(tabID, databaseName)

    var Tree = {};
    if (Len(Tables)) Tree.Tables = Tables;
    if (Len(Views)) Tree.Views = Views;
    if (Len(Dbbuilderreports)) Tree.Reports = Dbbuilderreports;
    // If Len(CustomSQLs) Then Tree.SqlSelects = CustomSQLs

    return Tree;
}
// </DBGETSUBTREE>

// <DB_GETLISTOFCUSTOMSQL>
async function JSB_MDL_DB_GETLISTOFCUSTOMSQL(Tabid, Databasename) {
    var Customsqls = {};

    // Database must be SQL type
    if (CBool(await JSB_ODB_ATTACHDBEXTENDED(Databasename, function (_Databasename) { Databasename = _Databasename }))) {
        if (UCase(await JSB_BF_TYPEOFCONNECTION()) != 'FILESYSTEM') {
            var Fsql = undefined;
            if (await JSB_ODB_OPEN('', 'jsbCustomSQL', Fsql, function (_Fsql) { Fsql = _Fsql })); else {
                if (await JSB_ODB_ATTACHDB('')); else return Stop(activeProcess.At_Errors);
                Fsql = await JSB_BF_FHANDLE('', 'jsbCustomSQL', true);
            }

            var Prefix = JSB_BF_NICENAME(CStr(Databasename)) + '_';
            var Sl = undefined;
            if (await JSB_ODB_SELECTTO('', Fsql, 'ItemID like \'' + Prefix + ']\' Order By ItemID', Sl, function (_Sl) { Sl = _Sl })); else { return {} }
            var Sqllist = getList(Sl);
            var Sqlid = '';
            var Url = '';
            var Tabcaption = '';
            var Ontableclick = '';

            for (Sqlid of iterateOver(Sqllist)) {
                if (LCase(Right(Sqlid, 4)) == '.sql') {
                    Sqlid = dropRight(CStr(Sqlid), '.');
                    Url = await JSB_MDL_DB_BUILDQRYURL(Tabid, Sqlid, Databasename, function (_Tabid, _Sqlid, _Databasename) { Tabid = _Tabid; Sqlid = _Sqlid; Databasename = _Databasename });
                    Tabcaption = 'sql: ' + Change(Mid1(Sqlid, Len(Prefix) + 1), '_', ' ');
                    Ontableclick = 'openInTab(' + jsEscapeString(CStr(Tabid)) + ', ' + jsEscapeString(Sqlid) + ', ' + jsEscapeString(Tabcaption) + ', ' + jsEscapeString(Url) + '); treeHide();';
                    Customsqls[Sqlid] = { "id": Sqlid, "class": 'usrSQL', "onclick": Ontableclick, "data": { "url": Url, "sqlID": Sqlid, "databaseName": Databasename, "tabID": Tabid } }
                }
            }

            Sqlid = '*NEW*';
            Url = await JSB_MDL_DB_BUILDQRYURL(Tabid, Sqlid, Databasename, function (_Tabid, _Sqlid, _Databasename) { Tabid = _Tabid; Sqlid = _Sqlid; Databasename = _Databasename });
            Tabcaption = 'SQL: *NEW*';
            Ontableclick = 'openInTab(' + jsEscapeString(CStr(Tabid)) + ', ' + jsEscapeString(CStr(Databasename) + '_' + Sqlid) + ', ' + jsEscapeString(Tabcaption) + ', ' + jsEscapeString(Url) + '); treeHide();';
            Customsqls[Sqlid] = { "id": Sqlid, "class": 'usrSQL', "onclick": Ontableclick, "data": { "url": Url, "sqlID": Sqlid, "databaseName": Databasename, "tabID": Tabid } }
        }
    }

    if (await JSB_ODB_ATTACHDB('')); else null;
    return Customsqls;
}
// </DB_GETLISTOFCUSTOMSQL>

// <DB_FDICT_DBBUILDER>
async function JSB_MDL_DB_FDICT_DBBUILDER() {
    // Create file if necessary
    return await JSB_BF_FHANDLE('dict', 'dbBuilderReports', true);
}
// </DB_FDICT_DBBUILDER>

// <DB_BUILDQRYURL>
async function JSB_MDL_DB_BUILDQRYURL(ByRef_Tabid, ByRef_Sqlid, ByRef_Databasename, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tabid, ByRef_Sqlid, ByRef_Databasename)
        return v
    }
    return exit(jsbRootAccount() + 'sqlQueryBuilder?sqlID=' + urlEncode(ByRef_Sqlid) + '&tabID=' + urlEncode(ByRef_Tabid) + '&databaseName=' + urlEncode(ByRef_Databasename));
}
// </DB_BUILDQRYURL>

// <DB_GETLISTOFREPORTS>
async function JSB_MDL_DB_GETLISTOFREPORTS(Tabid, Databasename) {
    // local variables
    var Reportname, Reportid, Ontableclick;

    var Freports = await JSB_MDL_DB_FDICT_DBBUILDER();
    var Rptprefix = JSB_BF_NICENAME(CStr(Databasename)) + '_';
    var Prefixlen = Len(Rptprefix);

    var Sl = undefined;
    if (await JSB_ODB_SELECTTO('', Freports, 'ItemID like \'' + Rptprefix + ']\'', Sl, function (_Sl) { Sl = _Sl })); else { return {} }
    var Pages = getList(Sl);

    // Build list of reports
    var Reportlist = [undefined,];
    for (Reportname of iterateOver(Pages)) {
        if (LCase(Right(Reportname, 5)) == '.page') {
            Reportname = Field(Reportname, '.page', 1);
            var Fright = LCase(fieldRight(CStr(Reportname), '_'));
            if (Locate(Fright, [undefined, 'grid', 'pivotsetup', 'pivot', 'editrecord'], 0, 0, 0, "", position => { })); else Reportlist[Reportlist.length] = Reportname;
        }
    }

    Reportlist = Sort(Reportlist);
    var Dbbuilderreports = {};
    for (Reportid of iterateOver(Reportlist)) {
        var Url = '', Tabcaption = '';
        if (Reportid == '*New Report*') {
            Url = await JSB_MDL_NEWREPORTURL(CStr(Tabid), CStr(Databasename));
            Tabcaption = Reportid;
        } else {
            Url = await JSB_MDL_RUNREPORTURL(CStr(Tabid), CStr(Reportid), CStr(Databasename));
            Tabcaption = Change(Mid1(Reportid, Prefixlen + 1), '_', ' ');
        }

        Ontableclick = 'openInTab(' + jsEscapeString(CStr(Tabid)) + ', ' + jsEscapeString(CStr(Reportid)) + ', ' + jsEscapeString(Tabcaption) + ', ' + jsEscapeString(Url) + '); treeHide();';
        Dbbuilderreports[Reportid] = { "id": Reportid, "class": 'usrReport', "onclick": Ontableclick, "caption": Tabcaption, "data": { "url": Url, "reportID": Reportid, "databaseName": Databasename, "tabID": Tabid } };
    }

    return Dbbuilderreports;
}
// </DB_GETLISTOFREPORTS>

// <DB_GETLISTOFVIEWS>
async function JSB_MDL_DB_GETLISTOFVIEWS(Tabid, Databasename) {
    // local variables
    var Row, Viewname, Url, Tabcaption, Ontableclick, _Err;

    var Views = {};
    try {
        var Systemdbtemplatename = '', Connectionstring = '', _Username = '', Password = '', Initialcatalog = '';
        if (CBool(await JSB_ODB_ATTACHDBEXTENDED(Databasename, Systemdbtemplatename, Connectionstring, _Username, Password, Initialcatalog, function (_Databasename, _Systemdbtemplatename, _Connectionstring, __Username, _Password, _Initialcatalog) { Databasename = _Databasename; Systemdbtemplatename = _Systemdbtemplatename; Connectionstring = _Connectionstring; _Username = __Username; Password = _Password; Initialcatalog = _Initialcatalog }))) {
            var Sql = 'USE [' + CStr(Initialcatalog) + ']; SELECT Name FROM sys.objects WHERE type = \'V\' Order By Name';
            var Sl = undefined;
            if (await asyncDNOSqlSelect(Sql, _selectList => Sl = _selectList)); else { return {} }

            var Rows = getList(Sl);

            var Viewlist = [undefined,];
            for (Row of iterateOver(Rows)) {
                Viewname = Row.Name;
                Url = await JSB_MDL_DB_SHOWTOP1000URL(CStr(Tabid), CStr(Viewname), CStr(Databasename));
                Tabcaption = 'view: ' + CStr(Viewname);
                Ontableclick = 'openInTab(' + jsEscapeString(CStr(Tabid)) + ', ' + jsEscapeString(CStr(Databasename) + '_' + CStr(Viewname)) + ', ' + jsEscapeString(CStr(Tabcaption)) + ', ' + jsEscapeString(CStr(Url)) + '); treeHide();';
                Views[Viewname] = { "id": Viewname, "class": 'usrView', "onclick": Ontableclick, "data": { "url": Url, "viewName": Viewname, "databaseName": Databasename, "tabID": Tabid } };
            }
        }

    } catch (_Err) {

    }

    if (await JSB_ODB_ATTACHDB('')); else null;
    return Views;
}
// </DB_GETLISTOFVIEWS>

// <DB_GETLISTOFTABLES>
async function JSB_MDL_DB_GETLISTOFTABLES(Tabid, Databasename) {
    // local variables
    var Rec;

    var Tables = {};

    if (await JSB_ODB_ATTACHDB('databaseBuilder_ro')); else return Tables;

    var Sql = 'use [' + CStr(Databasename) + ']; SELECT table_name FROM information_schema.tables WHERE table_type = \'base table\'  Order By table_name';
    var Sl = undefined;
    if (await asyncDNOSqlSelect(Sql, _selectList => Sl = _selectList)); else {
        if (await JSB_ODB_ATTACHDB('')); else null;
        return { "Errors": activeProcess.At_Errors }
    }

    var Recs = getList(Sl);
    for (Rec of iterateOver(Recs)) {
        var Tablename = Rec.table_name;
        if (Locate(Tablename, [undefined, 'master', 'tempdb', 'model', 'msdb', 'MSys', 'sysdiagrams'], 0, 0, 0, "", position => { })); else {
            var Url = await JSB_MDL_DB_SHOWTOP1000URL(CStr(Tabid), Tablename, CStr(Databasename));
            var Tabcaption = 'tbl: ' + Tablename;
            var Ontableclick = 'openInTab(' + jsEscapeString(CStr(Tabid)) + ', ' + jsEscapeString(CStr(Databasename) + '_' + Tablename) + ', ' + jsEscapeString(Tabcaption) + ', ' + jsEscapeString(Url) + '); treeHide();';
            Tables[Tablename] = { "id": Tablename, "class": 'usrTable', "onclick": Ontableclick, "data": { "url": Url, "tableName": Tablename, "databaseName": Databasename, "tabID": Tabid } }
        }
    }

    if (await JSB_ODB_ATTACHDB('')); else null;
    return Tables;
}
// </DB_GETLISTOFTABLES>

// <DB_GETDATABASENAMESWITHOUTPERMISSONS>
async function JSB_MDL_DB_GETDATABASENAMESWITHOUTPERMISSONS() {
    // local variables
    var Databasename;

    var Databasenames = undefined;
    var Ss = undefined;
    var Sql = '';
    var Sl = undefined;
    var Recs = '';
    var Nopermissions = [undefined,];

    Databasenames = await asyncRpcRequest('DB_GETDATABASENAMES');

    if (await JSB_ODB_ATTACHDB('databaseBuilder_ro')); else return Stop(activeProcess.At_Errors);
    for (Databasename of iterateOver(Databasenames)) {
        // Make sure we can query the table names Or The viewNames
        Sql = 'use [' + CStr(Databasename) + ']; SELECT top 3 table_name FROM information_schema.tables WHERE table_type = \'base table\'  Order By table_name';
        if (await asyncDNOSqlSelect(Sql, _selectList => Sl = _selectList)); else Nopermissions[Nopermissions.length] = LCase(Databasename);
    }

    if (await JSB_ODB_ATTACHDB('')); else null;
    return Nopermissions;
}
// </DB_GETDATABASENAMESWITHOUTPERMISSONS>

// <DB_CLEANJSON>
async function JSB_MDL_DB_CLEANJSON(Dbsubgroup) {
    // local variables
    var Tag, Db;

    // %options aspxC-

    for (Tag of iterateOver(Dbsubgroup)) {
        var V = Dbsubgroup[Tag];

        if (CBool(isArray(V))) {
            var Ary = V;
            V = {};
            for (Db of iterateOver(Ary)) {
                V[Db] = Db;
            }
            Dbsubgroup[Tag] = V;
        }

        if (isJSON(V)) await JSB_MDL_DB_CLEANJSON(V);
    }

    return true;
}
// </DB_CLEANJSON>

// <DB_GETDEFINEDDBS>
async function JSB_MDL_DB_GETDEFINEDDBS(Databasenames, Dbgroups, ByRef_Defineddbs, setByRefValues) {
    // local variables
    var Groupname, Grpi, Dbname, Dbi;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Defineddbs)
        return v
    }
    if (Not(ByRef_Defineddbs)) ByRef_Defineddbs = [undefined,];
    Grpi = LBound(Dbgroups) - 1;
    for (Groupname of iterateOver(Dbgroups)) {
        Grpi++;
        var Subgroups = Dbgroups[Groupname];
        if (isJSON(Subgroups)) {
            await JSB_MDL_DB_GETDEFINEDDBS(Databasenames, Subgroups, ByRef_Defineddbs, function (_ByRef_Defineddbs) { ByRef_Defineddbs = _ByRef_Defineddbs });
        } else if (CBool(isArray(Subgroups))) {
            Dbi = LBound(Subgroups) - 1;
            for (Dbname of iterateOver(Subgroups)) {
                Dbi++;
                if (Locate(Dbname, Databasenames, 0, 0, 0, "", position => { })) {
                    Dbname = LCase(Dbname);
                    if (Locate(Dbname, ByRef_Defineddbs, 0, 0, 0, "", position => { })); else ByRef_Defineddbs[ByRef_Defineddbs.length] = Dbname;
                } else {
                    return exit(await JSB_MDL_DB_GETDEFINEDDBS(Databasenames, Dbgroups, ByRef_Defineddbs, function (_ByRef_Defineddbs) { ByRef_Defineddbs = _ByRef_Defineddbs }));
                }
            }
        } else {
            Dbname = LCase(Subgroups);
            if (Locate(Dbname, ByRef_Defineddbs, 0, 0, 0, "", position => { })); else ByRef_Defineddbs[ByRef_Defineddbs.length] = Dbname;
        }
    }

    return exit(ByRef_Defineddbs);
}
// </DB_GETDEFINEDDBS>

// <DB_GETDATABASENAMES>
async function JSB_MDL_DB_GETDATABASENAMES() {
    // local variables
    var Sl, Rec;

    if (await JSB_ODB_ATTACHDB('databaseBuilder_ro')); else return Stop(activeProcess.At_Errors);
    var Cmd = 'SELECT name FROM sys.databases Where Not name In (\'master\', \'tempdb\', \'model\', \'msdb\', \'MSys\', \'sysdiagrams\') And state_desc!=\'OFFLINE\' Order By name';
    if (await asyncDNOSqlSelect(Cmd, _selectList => Sl = _selectList)); else return Stop(activeProcess.At_Errors);

    var Recs = getList(Sl);
    var Databasenames = [undefined,];
    for (Rec of iterateOver(Recs)) {
        Databasenames[Databasenames.length] = Rec.name;
    }

    if (await JSB_ODB_ATTACHDB('')); else null;
    return Databasenames;
}
// </DB_GETDATABASENAMES>

// <DB_UPDATEGROUPFROMPATH>
async function JSB_MDL_DB_UPDATEGROUPFROMPATH(Root, Dbgroupreplacement) {
    var Allgroups = undefined;

    if (Root) {
        Allgroups = await JSB_MDL_DB_GETGROUPSFROMROOT('');
        await JSB_MDL_DB_REPLACEGROUP(CStr(Root), Allgroups, Dbgroupreplacement);
    } else {
        await JSB_BF_TRASHIT('jsb_config', 'dbBuilderDBGroups');
        Allgroups = Dbgroupreplacement;
    }

    if (await JSB_ODB_WRITEJSON(Allgroups, await JSB_BF_FJSBCONFIG(), 'dbBuilderDBGroups')); else null;
    return true;
}
// </DB_UPDATEGROUPFROMPATH>

// <DB_REPLACEGROUP>
async function JSB_MDL_DB_REPLACEGROUP(Path, Dbgroups, Replacement) {
    // local variables
    var Tag;

    var Groupname = (LCase(fieldLeft(CStr(Path), '|')));
    var Subpath = (dropLeft(CStr(Path), '|'));

    if (Not(Subpath)) {
        Dbgroups[Groupname] = Replacement;
        return true;
    }

    for (Tag of iterateOver(Dbgroups)) {
        if (LCase(Tag) == Groupname) {
            var V = Dbgroups[Tag];
            if (isJSON(V)) return await JSB_MDL_DB_REPLACEGROUP(Subpath, V, Replacement);
        }
    }

    return false;
}
// </DB_REPLACEGROUP>

// <DB_REMOVEVACANTDATABASESSUBLEVEL>
async function JSB_MDL_DB_REMOVEVACANTDATABASESSUBLEVEL(Level, Dbsubgroup, Databasenames, ByRef_Changed, setByRefValues) {
    // local variables
    var Tag, Tagi;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Changed)
        return v
    }
    var Truecnt = 0;
    var Subcnt = undefined;

    Tagi = LBound(Dbsubgroup) - 1;
    for (Tag of iterateOver(Dbsubgroup)) {
        Tagi++;
        var V = Dbsubgroup[Tag];

        if (isJSON(V)) {
            // a High level group
            if (Len(V)) {
                Subcnt = await JSB_MDL_DB_REMOVEVACANTDATABASESSUBLEVEL(Level + 1, CStr(V), Databasenames, ByRef_Changed, function (_ByRef_Changed) { ByRef_Changed = _ByRef_Changed });
            } else {
                // but empty
                Subcnt = 0;
            }

            Truecnt += Subcnt;

            // Remove empty groups
            // if SubCnt = 0 And Level <> 0 Then
            // remove dbSubGroup, Tag
            // Changed = True
            // TagI -= 1    
            // End If;
        } else if (CBool(V)) {
            if (Locate(V, Databasenames, 0, 0, 0, "", position => { })) {
                Truecnt++;
            } else {
                // remove dbSubGroup, Tag
                // Changed = True
                // TagI -= 1;
            }
        }
    }

    return exit(Truecnt);
}
// </DB_REMOVEVACANTDATABASESSUBLEVEL>

// <DB_GETGROUPSFROMROOT>
async function JSB_MDL_DB_GETGROUPSFROMROOT(Root) {
    // local variables
    var Dbgroups;

    if (await JSB_ODB_READJSON(Dbgroups, await JSB_BF_FJSBCONFIG(), 'dbBuilderDBGroups', function (_Dbgroups) { Dbgroups = _Dbgroups })); else return undefined;
    if (HasTag(Dbgroups, 'ItemID')) { activeProcess.At_Errors = 'Corrupt jsb_config dbBuilderDBGroups'; return undefined; }

    await JSB_MDL_DB_CLEANJSON(Dbgroups);

    if (Root) Dbgroups = await JSB_MDL_DB_FINDROOT(Dbgroups, CStr(Root));

    return Dbgroups;
}
// </DB_GETGROUPSFROMROOT>

// <DB_FINDROOT>
async function JSB_MDL_DB_FINDROOT(Dbgroups, Path) {
    // local variables
    var Tag;

    var Groupname = (LCase(fieldLeft(CStr(Path), '|')));
    if (Not(Groupname)) return Dbgroups;
    var Subpath = (dropLeft(CStr(Path), '|'));

    for (Tag of iterateOver(Dbgroups)) {
        if (LCase(Tag) == Groupname) {
            var V = Dbgroups[Tag];
            if (Not(Subpath)) return V;
            if (isJSON(V)) {
                return await JSB_MDL_DB_FINDROOT(V, Subpath);
            }
        }
    }

    return {};
}
// </DB_FINDROOT>

// <DEFAULTCOLUMN_Sub>
async function JSB_MDL_DEFAULTCOLUMN_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, setByRefValues) {
    // local variables
    var Dataset, Columnidx, Newvalue;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid)
        return v
    }
    // %options aspxC-
    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);
    Columnidx = await JSB_MDL_FINDVIEWCOLUMN(Dataset, ByRef_Columnid, function (_Dataset) { Dataset = _Dataset });
    if (Null0(Columnidx) == '0') return exit(undefined);
    Newvalue = Trim(await JSB_BF_INPUTBOX('Column Property ' + CStr(ByRef_Columnid), 'Default Value', CStr(Dataset.columns[Columnidx].defaultvalue), '80%', 'auto'));
    if (Newvalue == Chr(27)) return exit(undefined);
    Dataset.columns[Columnidx].defaultvalue = Newvalue;
    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edc-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </DEFAULTCOLUMN_Sub>

// <DELETENONESSENTIALFILES_Sub>
async function JSB_MDL_DELETENONESSENTIALFILES_Sub(ByRef_Projectname, setByRefValues) {
    // local variables
    var Scp, Dscp, X, Sl, Id;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname)
        return v
    }
    // %options aspxC-
    if (await JSB_ODB_OPEN('', CStr(ByRef_Projectname), Scp, function (_Scp) { Scp = _Scp })); else return Stop();
    if (await JSB_ODB_OPEN('dict', CStr(ByRef_Projectname), Dscp, function (_Dscp) { Dscp = _Dscp })); else return Stop();

    await asyncTclExecute('delete dict ' + CStr(ByRef_Projectname) + ' = "[.PCS"', _capturedData => X = _capturedData)
    await asyncTclExecute('delete dict ' + CStr(ByRef_Projectname) + ' = "[.PCF"', _capturedData => X = _capturedData)
    await asyncTclExecute('delete dict ' + CStr(ByRef_Projectname) + ' = "[.PCD"', _capturedData => X = _capturedData)
    if (await JSB_ODB_SELECTTO('', Scp, '', Sl, function (_Sl) { Sl = _Sl })); else return Stop(activeProcess.At_Errors);

    while (true) {
        Id = readNext(Sl).itemid;
        if (CBool(Id)); else break
        if (Not(true)) break;
        if (InStr1(1, LCase(Id), '_custom') == 0) { if (await JSB_ODB_DELETEITEM(Scp, CStr(Id))); else return Stop(activeProcess.At_Errors); }
    }
    return exit();
}
// </DELETENONESSENTIALFILES_Sub>

// <DELETEPAGE_Pgm>
async function JSB_MDL_DELETEPAGE_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Top, Columns, Dict, Projectname, Filterby, Orderby, _Options;
    var Allitems, F, Itemlist, Ans, Pagename;

    // %options aspxC-
    if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a data manager to run program');

    if (!(await JSB_BF_PARSESELECT(CStr(activeProcess.At_Sentence), '', Top, Columns, Dict, Projectname, Filterby, Orderby, _Options, Allitems, F, undefined, undefined, undefined, function (_Top, _Columns, _Dict, _Projectname, _Filterby, _Orderby, __Options, _Allitems, _F) { Top = _Top; Columns = _Columns; Dict = _Dict; Projectname = _Projectname; Filterby = _Filterby; Orderby = _Orderby; _Options = __Options; Allitems = _Allitems; F = _F }))) return Stop();
    Itemlist = getList(0);
    if (Len(Itemlist) == 0) return Stop();

    Ans = await JSB_BF_MSGBOX('Warning!', 'Are you sure you wish to delete these page(s): ' + Change(Itemlist, am, ', '), 'Yes,*No');
    if (Ans != 'Yes') return Stop();

    for (Pagename of iterateOver(Itemlist)) {
        await JSB_MDL_DELETEPAGEMODEL(Projectname, Pagename, function (_Projectname, _Pagename) { Projectname = _Projectname; Pagename = _Pagename });
    }
    return;
}
// </DELETEPAGE_Pgm>

// <DELETEPAGEMODEL>
async function JSB_MDL_DELETEPAGEMODEL(ByRef_Projectname, ByRef_Ipagename, setByRefValues) {
    // local variables
    var Pagename, Views, Viewname, Fdict;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Ipagename)
        return v
    }
    // %options aspxC-

    Pagename = dropIfRight(CStr(ByRef_Ipagename), '.page', true);

    Views = await JSB_MDL_VIEWSINPAGE(ByRef_Projectname, Pagename, function (_ByRef_Projectname) { ByRef_Projectname = _ByRef_Projectname });
    if (Len(Views) == 0) Views[Views.length] = CStr(Pagename) + '.view';

    for (Viewname of iterateOver(Views)) {
        await JSB_MDL_DELETEVIEW(ByRef_Projectname, Pagename, Viewname, false, function (_ByRef_Projectname, _Pagename, _Viewname, _P4) { ByRef_Projectname = _ByRef_Projectname; Pagename = _Pagename; Viewname = _Viewname });
    }

    // really only need to TrashIt if there is custom code 
    await JSB_BF_TRASHIT(CStr(ByRef_Projectname), CStr(Pagename));
    if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('', ByRef_Projectname), CStr(Pagename))); else if (activeProcess.At_Errors) Alert(CStr(activeProcess.At_Errors));;

    Fdict = await JSB_BF_FHANDLE('DICT', ByRef_Projectname);
    await JSB_BF_TRASHIT('dict ' + CStr(ByRef_Projectname), CStr(Pagename) + '.page');
    if (await JSB_ODB_DELETEITEM(Fdict, CStr(Pagename) + '.page')); else if (activeProcess.At_Errors) Alert(CStr(activeProcess.At_Errors));;
    if (await JSB_ODB_DELETEITEM(Fdict, CStr(Pagename) + '.pcd')); else if (activeProcess.At_Errors) Alert(CStr(activeProcess.At_Errors));;

    if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('', 'md'), CStr(Pagename))); else if (activeProcess.At_Errors) Alert(CStr(activeProcess.At_Errors));;

    await JSB_MDL_UPDATEMENU_Sub(CStr(ByRef_Projectname), true);
    return exit(true);
}
// </DELETEPAGEMODEL>

// <DELETEPAGEMODEL_Pgm>
async function JSB_MDL_DELETEPAGEMODEL_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Projectname, Pagename, Frompage, Ans;

    // %options aspxC-

    if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a data manager to run program');

    Projectname = paramVar('ProjectName');
    Pagename = paramVar('pageName');
    Frompage = paramVar('fromPage');

    if (CBool(Projectname) && Len(JSB_BF_PARAMVARS())) {
        Pagename = dropIfRight(CStr(Pagename), '.page', true);

        Ans = await JSB_BF_MSGBOX('Warning!', 'Are you sure you wish to delete this page: ' + CStr(Pagename) + '.page', 'Yes,*No');
        if (Ans == 'Yes') { await JSB_MDL_DELETEPAGEMODEL(Projectname, Pagename, function (_Projectname, _Pagename) { Projectname = _Projectname; Pagename = _Pagename }); }
    }

    if (Not(Frompage) && !hasParentProcess()) At_Server.End();
    return At_Response.Redirect(jsbRootExecute('menu'));
}
// </DELETEPAGEMODEL_Pgm>

// <DELETERPTAPI_Pgm>
async function JSB_MDL_DELETERPTAPI_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Tabid, Databasename, Reportname, Path, Restful_Result;
    var Success_Editrecord, Success_Grid, Success_Pivot, Success_Pivotsetup;
    var Freports, Rptprefix, Sl, Rptitems, Rptname, R, Cb;

    var Restful_Result;
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Tabid = JSB_BF_PARAMVAR('TABID', CStr(1)); Databasename = JSB_BF_PARAMVAR('DATABASENAME', CStr(2)); Reportname = JSB_BF_PARAMVAR('REPORTNAME', CStr(3)); Path = JSB_BF_PARAMVAR('PATH', CStr(4));
                // %options aspxC-

                if (Left(Reportname, Len(Databasename) + 1) != CStr(Databasename) + '_') { Restful_Result = { "AtErrors": 'bad report name prefix' }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto; }
                if (LCase(Right(Reportname, 7)) != '_report') { Restful_Result = { "AtErrors": 'bad report name suffix' }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto; }

                Success_Editrecord = await JSB_MDL_DELETEPAGEMODEL('dbBuilderReports', CStr(Reportname) + '_editRecord');
                Success_Grid = await JSB_MDL_DELETEPAGEMODEL('dbBuilderReports', CStr(Reportname) + '_Grid');
                Success_Pivot = await JSB_MDL_DELETEPAGEMODEL('dbBuilderReports', CStr(Reportname) + '_Pivot');
                Success_Pivotsetup = await JSB_MDL_DELETEPAGEMODEL('dbBuilderReports', CStr(Reportname) + '_PivotSetup');

                // Create file if necessary
                Freports = await JSB_MDL_FDICTDBBUILDER();
                Rptprefix = JSB_BF_NICENAME(CStr(Reportname));

                if (await JSB_ODB_SELECTTO('', Freports, 'ItemID like \'' + CStr(Rptprefix) + ']\'', Sl, function (_Sl) { Sl = _Sl })); else { Restful_Result = { "AtErrors": activeProcess.At_Errors }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto; }
                Rptitems = getList(Sl);

                for (Rptname of iterateOver(Rptitems)) {
                    if (await JSB_ODB_DELETEITEM(Freports, CStr(Rptname))); else return Stop(activeProcess.At_Errors);
                }

                Restful_Result = { "success": true }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto;

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </DELETERPTAPI_Pgm>

// <DELETEVIEW>
async function JSB_MDL_DELETEVIEW(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Confirm, setByRefValues) {
    // local variables
    var Fdict, Id, Ext;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Confirm)
        return v
    }
    // %options aspxC-

    ByRef_Viewname = dropIfRight(CStr(ByRef_Viewname), '.view', true);
    if (CBool(ByRef_Confirm)) {
        if (await JSB_BF_MSGBOX('Confirm', 'Are you sure you wish to delete view \'' + CStr(ByRef_Viewname) + '\'?', 'Yes,*No') != 'Yes') return exit(false);
    }

    Fdict = await JSB_BF_FHANDLE('DICT', ByRef_Projectname);

    await JSB_BF_TRASHIT('dict ' + CStr(ByRef_Projectname), CStr(ByRef_Viewname) + '.view');
    if (await JSB_ODB_DELETEITEM(Fdict, CStr(ByRef_Viewname) + '.view')); else if (activeProcess.At_Errors) Alert(CStr(activeProcess.At_Errors));;

    await JSB_BF_TRASHIT('dict ' + CStr(ByRef_Projectname), CStr(ByRef_Viewname) + '.htm');
    if (await JSB_ODB_DELETEITEM(Fdict, CStr(ByRef_Viewname) + '.htm')); else if (activeProcess.At_Errors) Alert(CStr(activeProcess.At_Errors));;

    if (await JSB_ODB_DELETEITEM(Fdict, CStr(ByRef_Viewname) + '.pcd')); else if (activeProcess.At_Errors) Alert(CStr(activeProcess.At_Errors));;
    if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('MD'), CStr(ByRef_Viewname))); else if (activeProcess.At_Errors) Alert(CStr(activeProcess.At_Errors));;

    // cleaup .pcd, .pcs, .pcf files:  (Anything the starts, contains, or endswith viewname
    for (Id of iterateOver(await JSB_BF_FSELECT('dict ' + CStr(ByRef_Projectname), 'ItemID like \'' + CStr(ByRef_Viewname) + '_%\' Or ItemID like \'%_' + CStr(ByRef_Viewname) + '_%\' Or ItemID like \'%_' + CStr(ByRef_Viewname) + '\'', undefined, undefined))) {
        Ext = LCase(Right(Id, 4));
        if (Ext == '.pcd' || Ext == '.pcs' || Ext == '.pcf') {
            if (await JSB_ODB_DELETEITEM(Fdict, CStr(Id))); else Alert(CStr(activeProcess.At_Errors));
        }
    }

    return exit(true);
}
// </DELETEVIEW>

// <DELETEVIEWBTN>
async function JSB_MDL_DELETEVIEWBTN(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Btntext, setByRefValues) {
    // local variables
    var Objectmodel, Btni;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Btntext)
        return v
    }
    // %options aspxC-

    if (await JSB_ODB_READJSON(Objectmodel, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Objectmodel) { Objectmodel = _Objectmodel })); else { Println(Alert('Unable to find view ' + CStr(ByRef_Viewname))); debugger; return exit(false); }
    Btni = await JSB_MDL_FINDBTNI(Objectmodel, ByRef_Btntext, function (_Objectmodel, _ByRef_Btntext) { Objectmodel = _Objectmodel; ByRef_Btntext = _ByRef_Btntext });
    if (Not(Btni)) return exit(false);

    if (await JSB_BF_MSGBOX('Confirm', 'Are you sure you wish to delete this button \'' + CStr(ByRef_Btntext) + '\'?', 'Yes,*No') == 'Yes') {
        Objectmodel.custombtns.Delete(Btni);
        if (await JSB_ODB_WRITEJSON(Objectmodel, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
        await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
        return exit(true);
    }

    return exit(false);
}
// </DELETEVIEWBTN>

// <DELETEVIEWCOLUMN_Sub>
async function JSB_MDL_DELETEVIEWCOLUMN_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, ByRef_Includedb, setByRefValues) {
    // local variables
    var Ans, Dataset, Columnidx, Tablename, X, Sl, Items, Item;
    var Itemid;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, ByRef_Includedb)
        return v
    }
    // %options aspxC-

    if (CBool(ByRef_Includedb)) {
        Ans = await JSB_BF_MSGBOX('Warning!', 'Are you sure you wish to DELETE the database column: \'' + CStr(ByRef_Columnid) + '?', 'Yes,No');
    } else {
        Ans = await JSB_BF_MSGBOX('Warning!', 'Are you sure you wish to remove the column: \'' + CStr(ByRef_Columnid) + '\' from the view ' + CStr(ByRef_Viewname) + '?', 'Yes,No');
    }

    if (Ans != 'Yes') return exit(undefined);

    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);
    Columnidx = await JSB_MDL_FINDVIEWCOLUMN(Dataset, ByRef_Columnid, function (_Dataset) { Dataset = _Dataset });
    if (Null0(Columnidx) == '0') return exit(undefined);
    Dataset.columns.Delete(Columnidx);
    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edc-', System(28), ': ', activeProcess.At_Errors);

    if (CBool(ByRef_Includedb)) {
        Tablename = Dataset.tableName;
        if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('dict', Tablename), '!' + CStr(ByRef_Columnid))); else null;
        if (await JSB_ODB_OPEN('', CStr(Tablename), X, function (_X) { X = _X })) {
            if (await JSB_ODB_SELECTTO('ItemID,*', X, '', Sl, function (_Sl) { Sl = _Sl })) {
                Items = getList(Sl);
                for (Item of iterateOver(Items)) {
                    if (HasTag(Item, ByRef_Columnid)) {
                        Itemid = Item.ItemID;
                        delete Item[ByRef_Columnid]
                        delete Item['ItemID']
                        if (await JSB_ODB_WRITEJSON(Item, X, CStr(Itemid))); else Alert(CStr(activeProcess.At_Errors));
                    }
                }
            }
        }
    }

    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </DELETEVIEWCOLUMN_Sub>

// <DELETEWEBSITEMODEL_Pgm>
async function JSB_MDL_DELETEWEBSITEMODEL_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Ans;

    // %options aspxC-
    if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a manager to run this command');
    if (await JSB_ODB_ATTACHDB('')); else null;

    Ans = await JSB_BF_MSGBOX('DELETE ACCOUNT', 'Are you sure you want to completely DELETE the website: ' + jsbAccount(), 'Yes,No');
    if (Ans == 'Yes') {
        if (await JSB_BF_DELETEACCOUNT(jsbAccount())) return At_Response.Redirect(LogoutUrl());
        await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
    }
    return;
}
// </DELETEWEBSITEMODEL_Pgm>

// <DEVXPIVOTSETUP_Pgm>
async function JSB_MDL_DEVXPIVOTSETUP_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Rolemsg, Databasename, Tableid, Tabid, Pivotlayout, S;
    var Cmd, Issqlselect, Reportname;

    // %options aspxC-
    if (!IsLocalHost()) {
        Rolemsg = (JSB_BF_ISAUTHENTICATED() ? '' : 'You must be logged in to view this page. ' + Anchor(LoginUrl(), 'Click here to login'));
        if (!(await JSB_BF_ISEMPLOYEE())) return Stop((Rolemsg ? Rolemsg : 'I\'m sorry, you must be an employee to view this page.'));

        if (window.JSB_MDL_CHECKIN_Sub) await JSB_MDL_CHECKIN_Sub();
    }

    Databasename = paramVar('databaseName');
    Tableid = paramVar('tableID');
    Tabid = paramVar('tabID');
    Pivotlayout = paramVar('layout');

    // Did we run from TCL? setup something for testing
    if (Not(Tableid)) {
        S = RTrim(Field(activeProcess.At_Sentence, '(', 1));
        Cmd = Field(S, ' ', 1);
        if (LCase(Cmd) == 'run') Tableid = Field(S, ' ', 4); else Tableid = Field(S, ' ', 2);
        // If !tableID Then Stop 'tableID (the Table Name) is a required parameter'
        Tableid = 'democustomers.json';
        Databasename = '';
    } else {
        if (Databasename === undefined) return Stop('databaseName is a required parameter');
    }

    Issqlselect = LCase(Left(Tableid, 7)) == 'select ';
    if (CBool(Issqlselect)) {
        Reportname = CStr(Databasename) + '_SqlSelect';
    } else {
        Reportname = CStr(Databasename) + '_' + CStr(Tableid);
    }

    if (await JSB_ODB_READJSON(Pivotlayout, await JSB_BF_FHANDLE('tmp'), CStr(Reportname), function (_Pivotlayout) { Pivotlayout = _Pivotlayout })); else { Pivotlayout = {} }

    Print(await JSB_HTML_DEVXPIVOTSETUP(Tabid, Databasename, Pivotlayout.AvailFlds, Tableid, Reportname, Pivotlayout, function (_Pivotlayout) { Pivotlayout = _Pivotlayout }));
    Print(JSB_HTML_SUBMITBTN('btn', 'Next', { "onclick": 'return saveRowsAndCols();', "style": 'display:block; width: 100%;' }), ' ');
    Print(JSB_HTML_SUBMITBTN('btn', 'Refresh', { "onclick": 'return saveRowsAndCols();', "style": 'display:block; width: 100%;' }));

    await At_Server.asyncPause(me);

    Cmd = formVar('btn');
    await JSB_HTML_DEVXUNLOADPIVOT_Sub(Pivotlayout, function (_Pivotlayout) { Pivotlayout = _Pivotlayout });

    if (Cmd == 'Refresh') Pivotlayout.AvailFlds = '';
    if (await JSB_ODB_WRITEJSON(Pivotlayout, await JSB_BF_FHANDLE('tmp'), CStr(Reportname))); else return Stop(activeProcess.At_Errors);

    if (hasTclParent() || hasParentProcess()) return Stop(); else At_Server.End();
    return;
}
// </DEVXPIVOTSETUP_Pgm>

// <DISPLAY_EXCELUPLOAD>
async function JSB_MDL_DISPLAY_EXCELUPLOAD(Viewvars) {
    var Aryhtml = [undefined, html('\<div class="container"\>')]; var Row = Viewvars.Row; var Ctlhtml = '';

    Aryhtml[Aryhtml.length] = html('\<div class="form-group row"\>');

    Ctlhtml = CHECKBOX('DataMustHaveOneNumericRow', true, '', CNum((Row['DataMustHaveOneNumericRow'] ? Row['DataMustHaveOneNumericRow'] : 1)), '');
    Aryhtml[Aryhtml.length] = lblCtlSet('Rows have some numeric data', Ctlhtml, 'DataMustHaveOneNumericRow', 0, 0, '');

    Ctlhtml = CHECKBOX('SideBySideTables', true, '', CNum(Row['SideBySideTables']), '');
    Aryhtml[Aryhtml.length] = lblCtlSet('Allow Side By Side Tables', Ctlhtml, 'SideBySideTables', 0, 0, '');

    Ctlhtml = CHECKBOX('ignoreTablesWithNoRows', true, '', CNum((Row['ignoreTablesWithNoRows'] ? Row['ignoreTablesWithNoRows'] : 1)), '');
    Aryhtml[Aryhtml.length] = lblCtlSet('ignore Tables With No Rows', Ctlhtml, 'ignoreTablesWithNoRows', 0, 0, '');

    Ctlhtml = INTEGERBOX('ignoreTablesWithLessThanNColumns', Row['ignoreTablesWithLessThanNColumns'], false, [undefined, 'onchange=\'parsleyReset(this)\'', 'placeholder="ignore Tables With Less Than N-Columns"', 'parsley-trigger="change focusout"', 'min="0"', 'max="10"', 'data-parsley-type="integer"', 'type=\'number;number\''], '0', '10');
    Aryhtml[Aryhtml.length] = lblCtlSet('ignore Tables With Less Than N-Columns', Ctlhtml, 'ignoreTablesWithLessThanNColumns', 0, 0, '');

    Ctlhtml = CHECKBOX('OneTablePerSheet', true, '', CNum((Row['OneTablePerSheet'] ? Row['OneTablePerSheet'] : 1)), '');
    Aryhtml[Aryhtml.length] = lblCtlSet('OneTablePerSheet', Ctlhtml, 'OneTablePerSheet', 0, 0, '');

    Ctlhtml = CHECKBOX('AllowBlankRows', true, '', CNum((Row['AllowBlankRows'] ? Row['AllowBlankRows'] : 1)), '');
    Aryhtml[Aryhtml.length] = lblCtlSet('Allow Blank Rows', Ctlhtml, 'AllowBlankRows', 0, 0, '');

    Ctlhtml = CHECKBOX('DefaultEmptyValuesFromPreviousRow', true, '', CNum(Row['DefaultEmptyValuesFromPreviousRow']), '');
    Aryhtml[Aryhtml.length] = lblCtlSet('Default Empty Values From Previous Row', Ctlhtml, 'DefaultEmptyValuesFromPreviousRow', 0, 0, '');

    Ctlhtml = CHECKBOX('deleteAndRecreateTables', true, '', CNum(Row['deleteAndRecreateTables']), '');
    Aryhtml[Aryhtml.length] = lblCtlSet('delete And Recreate Sql Table', Ctlhtml, 'deleteAndRecreateTables', 0, 0, '');

    Ctlhtml = CHECKBOX('showTables', true, '', CNum((Row['showTables'] ? Row['showTables'] : 1)), '');
    Aryhtml[Aryhtml.length] = lblCtlSet('show Table', Ctlhtml, 'showTables', 0, 0, '');

    Aryhtml[Aryhtml.length] = html('\</div\>');
    Aryhtml[Aryhtml.length] = html('\<div class="form-group row"\>');

    Ctlhtml = JSB_HTML_TEXTBOX('commonDatabaseName', Row['commonDatabaseName'], false, [undefined, 'title="Leave blank to put each Excel file into it\'s own database"', 'placeholder="Leave blank to put each Excel file into it\'s own database"'], '');
    Aryhtml[Aryhtml.length] = lblCtlSet('Put tables into the Database', Ctlhtml, 'commonDatabaseName', 1, 0, '');

    Aryhtml[Aryhtml.length] = html('\</div\>');
    Aryhtml[Aryhtml.length] = html('\</div\>');

    Aryhtml[Aryhtml.length] = JSB_HTML_SCRIPT('_isDirty = ' + LCase(await JSB_MDL_VIEW_EXCELUPLOAD_ISDIRTY(Viewvars))); // Some Of The Defaults May Have Made The Page Dirty

    return await JSB_MDL_DISPLAY_EXCELUPLOAD_EXTRAS(Viewvars, Join(Aryhtml, ''));
}
// </DISPLAY_EXCELUPLOAD>

// <DISPLAY_EXCELUPLOAD_EXTRAS>
async function JSB_MDL_DISPLAY_EXCELUPLOAD_EXTRAS(Viewvars, _Html) {
    var Toolbar = ''; var Additionalattributes = undefined, Btnhtml = '';
    var Confirm = '', Urlparams = '', Jscode = '', Jscall = '', Contextmenus = '';

    if (Not(Viewvars.currentID)) {
        // Setup server-side button: Save
        Additionalattributes = { "style": '', "name": 'formBtn_ExcelUpload' };
        Btnhtml = JSB_HTML_SAVEBTN('formBtn_Save', 'Save', 'Save', Additionalattributes);
        Contextmenus = CStr(Contextmenus) + CStr(adminButtonContextMenu('ExcelUpload', 'formBtn_Save'));
        Toolbar += Btnhtml;
    }

    if (CBool(Viewvars.currentID)) {
        // Setup server-side button: Update
        Additionalattributes = { "style": '', "name": 'formBtn_ExcelUpload' };
        Btnhtml = JSB_HTML_SAVEBTN('formBtn_Update', 'Update', 'Update', Additionalattributes);
        Contextmenus += CStr(adminButtonContextMenu('ExcelUpload', 'formBtn_Update'));
        Toolbar += Btnhtml;
    }

    Confirm = ('if (window._isDirty && !confirm("Your changes will be lost. Are you sure you want to Cancel this record?")) return false; ');
    // Setup client-side button: Cancel
    Urlparams = '';

    Jscode = genEventHandler('Cancel', 'ExcelUpload' + Urlparams, 10, '', 0, false);
    Jscall = 'window.eventHandler_Cancel(jsbFormVars(), "ItemID" /* primary Key */);';
    Jscall = '$("form").parsley().destroy(); ' + Jscall;
    Btnhtml = Button('formBtn_Cancel', 'Cancel', { "onclick": Jscall, "style": '' }) + Jscode;
    Contextmenus += CStr(adminButtonContextMenu('ExcelUpload', 'formBtn_Cancel'));
    Toolbar += Btnhtml;

    Toolbar += CStr(Viewvars.extraToolBarHtml);

    var Header = html('\<div id=\'header_ExcelUpload\' class=\'HeaderStyle\'\>') + 'ExcelUpload' + html('\</div\>');
    _Html = JSB_HTML_ROWS2('46px', Header, '%', CStr(_Html), 'overflow: hidden', 'overflow: auto');

    if (await JSB_BF_ISMANAGER()) {
        Contextmenus += adminControlContextMenu('ExcelUpload', 'DataMustHaveOneNumericRow', 'ctl_checkbox', 0, -1, 0, 0, 0);
        Contextmenus += adminControlContextMenu('ExcelUpload', 'SideBySideTables', 'ctl_checkbox', 0, -1, 0, 0, 0);
        Contextmenus += adminControlContextMenu('ExcelUpload', 'ignoreTablesWithNoRows', 'ctl_checkbox', 0, -1, 0, 0, 0);
        Contextmenus += adminControlContextMenu('ExcelUpload', 'ignoreTablesWithLessThanNColumns', 'textbox', 0, -1, 0, 0, 0);
        Contextmenus += adminControlContextMenu('ExcelUpload', 'OneTablePerSheet', 'ctl_checkbox', 0, -1, 0, 0, 0);
        Contextmenus += adminControlContextMenu('ExcelUpload', 'AllowBlankRows', 'ctl_checkbox', 0, -1, 0, 0, 0);
        Contextmenus += adminControlContextMenu('ExcelUpload', 'DefaultEmptyValuesFromPreviousRow', 'ctl_checkbox', 0, -1, 0, 0, 0);
        Contextmenus += adminControlContextMenu('ExcelUpload', 'deleteAndRecreateTables', 'ctl_checkbox', 0, -1, 0, 0, 0);
        Contextmenus += adminControlContextMenu('ExcelUpload', 'showTables', 'ctl_checkbox', 0, -1, 0, 0, 0);
        Contextmenus += adminControlContextMenu('ExcelUpload', 'commonDatabaseName', 'textbox', 0, -1, 0, 1, 0);
        Contextmenus += adminViewContextMenu('ExcelUpload', CNum(Viewvars.showAddRmvViews) + 0);
        _Html += Hidden('contextMenuText') + Hidden('contextMenuID');
    }
    _Html += JSB_HTML_SCRIPT(Contextmenus);

    if (window.JSB_MDL_VIEW_EXCELUPLOAD_DISPLAY_CC_Sub) await JSB_MDL_VIEW_EXCELUPLOAD_DISPLAY_CC_Sub(Viewvars, _Html, Toolbar, function (__Html, _Toolbar) { _Html = __Html; Toolbar = _Toolbar });

    if (Toolbar) {
        Toolbar = html('\<div class=\'BOBlock_ToolBar\'\>') + Toolbar + html('\</div\>');
        if (CBool(Viewvars.parentMultiView)) {
            _Html = html('\<div class="BOBlock ExcelUpload"\>' + crlf) + _Html + Toolbar + html('\</div\>' + crlf);
        } else {
            _Html = html('\<div class="BOBlock FullHeight ExcelUpload"\>' + crlf) + JSB_HTML_ROWS2('%', _Html, '66px', Toolbar, 'overflow-y:auto', 'overflow:hidden') + html('\</div\>' + crlf);
        }
    } else {
        _Html = html('\<div class="BOBlock ExcelUpload"\>' + crlf) + _Html + html('\</div\>' + crlf);
    }

    // Output Refresh if needed
    if (CBool(Viewvars.masterview)) {
        // Output Code that will enable us to refresh() if needed by our childer
        _Html += JSB_HTML_SCRIPT('function refreshData() { if (window.ExcelUpload_refresh) window.ExcelUpload_refresh() }');;
    } else if (CBool(Viewvars.ParentRefresh)) {
        Viewvars.ParentRefresh = false;
        _Html += JSB_HTML_SCRIPT('if (parent.refreshData) parent.refreshData();');
    }

    return _Html;
}
// </DISPLAY_EXCELUPLOAD_EXTRAS>

// <DOWIZARD_Sub>
async function JSB_MDL_DOWIZARD_Sub(ByRef_Viewname, ByRef_Dataset, ByRef_Totype, setByRefValues) {
    // local variables
    var Dictcolumns, Modelforallcolumns, Column, Dictcolumn, Lc;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Viewname, ByRef_Dataset, ByRef_Totype)
        return v
    }
    // %options aspxC-

    Dictcolumns = await JSB_BF_GETTABLECOLUMNDEFS(CStr(ByRef_Dataset.tableName), CStr(false), true); // Suppress Messages, doRefresh
    Modelforallcolumns = await JSB_MDL_MODELFORALLCOLUMNS();

    for (Column of iterateOver(ByRef_Dataset.columns)) {
        if (Column.control != 'htmlbox') {
            switch (ByRef_Totype) {
                case 'Reset Form':
                    await JSB_MDL_SETDEFAULTS(ByRef_Viewname, Modelforallcolumns.columns, Column, function (_ByRef_Viewname, _P2, _Column) { ByRef_Viewname = _ByRef_Viewname; Column = _Column });// Defaults From Model
                    await JSB_MDL_SETCOLUMNDEFAULTS_Sub('string', Column, function (_P1, _Column) { Column = _Column });
                    for (Dictcolumn of iterateOver(Dictcolumns)) {
                        if (Null0(Dictcolumn.name) == Null0(Column.name) && Dictcolumn.datatype != 'string') {
                            await JSB_MDL_SETCOLUMNDEFAULTS_Sub(Dictcolumn.datatype, Column, function (_P1, _Column) { Column = _Column }); // Sets Control, Display, Width, Canedit, Suppresslabel, Fullline;
                        }
                    }

                    break;

                case 'Search Form':
                    Column.control = 'textbox';
                    Column.fullline = false;
                    Column.width = 12;
                    Column.canedit = true;
                    Column.ctlstyle = '';
                    Column.display = 'visible';

                    switch (Column.datatype) {
                        case 'integer': case 'autointeger':
                            Column.control = 'textbox';

                            break;

                        case 'double':
                            Column.control = 'textbox';

                            break;

                        case 'boolean':
                            Column.control = 'dropdownbox';

                            break;

                        case 'date':
                            Column.control = 'datebox';

                            break;

                        case 'time':
                            Column.control = 'timebox';

                            break;

                        case 'datetime':
                            Column.control = 'datetimebox';

                            break;

                        case 'currency':
                            Column.control = 'textbox';

                            break;

                        case 'blob': case 'jpg': case 'png':
                            Column.control = 'display';

                            break;

                        case 'url':
                            Column.control = 'urlbox';

                    }

                    break;

                case 'ReadOnly Form':
                    Lc = LCase(Column.control);
                    if (Lc != 'checkbox' && InStr1(1, Lc, 'box')) Column.control = 'label';
                    Column.canedit = false;
                    Column.ctlstyle = '';

                    break;

                case 'Menu Form':
                    Column.control = 'button';
                    Column.suppresslabel = true;
                    Column.ctlstyle = 'width: 99%; height: 50px; display: block; margin: auto; max-width: 300px;';
                    Column.fullline = true;
                    Column.canedit = false;
                    Column.addfrompage = false;
            }
        }
    }

    switch (ByRef_Totype) {
        case 'Search Form':
            ByRef_Dataset.startempty = true;
            ByRef_Dataset.updatebtn = false;
            ByRef_Dataset.allowupdates = false;
            ByRef_Dataset.deletebtn = false;
            ByRef_Dataset.allowdeletes = false;
            ByRef_Dataset.searchbtn = true;
            ByRef_Dataset.template = 'Form';

            break;

        case 'DisplayOnly Form':
            ByRef_Dataset.startempty = false;
            ByRef_Dataset.updatebtn = false;
            ByRef_Dataset.allowupdates = false;
            ByRef_Dataset.deletebtn = false;
            ByRef_Dataset.allowdeletes = false;
            ByRef_Dataset.template = 'Form';

            break;

        case 'Menu Form':
            ByRef_Dataset.startempty = true;
            ByRef_Dataset.updatebtn = false;
            ByRef_Dataset.allowupdates = false;
            ByRef_Dataset.deletebtn = false;
            ByRef_Dataset.allowdeletes = false;
            ByRef_Dataset.template = 'Form';
    }
    return exit();
}
// </DOWIZARD_Sub>

// <DROPGRIDCOLUMNS>
async function JSB_MDL_DROPGRIDCOLUMNS(ByRef_Columns, setByRefValues) {
    // local variables
    var Rcolumns, Corder, Column;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Columns)
        return v
    }
    Rcolumns = [undefined,];
    Corder = [undefined,];
    for (Column of iterateOver(ByRef_Columns)) {
        if (CBool(Column.name)) {
            if (Column.display == 'gridhidden') Column.display = 'visible';
            if (isNumeric(Column.width) && Len(Column.width)) Column.width = CStr(Column.width) + 'em';
            if (Column.display != 'hidden') Rcolumns[Rcolumns.length] = Column;
        }
    }

    return exit(Rcolumns);
}
// </DROPGRIDCOLUMNS>

// <EDC_Pgm>
async function JSB_MDL_EDC_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Projectname, Viewname, Frompage, Iniframe, Columnid, _Closewindow;
    var Pagename, Sentence;

    // %options aspxC-
    if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a data manager to run this command');

    Projectname = paramVar('ProjectName');
    Viewname = paramVar('ViewName');
    Frompage = paramVar('fromPage');
    Iniframe = paramVar('inIFrame');
    Columnid = paramVar('id');
    Frompage = paramVar('fromPage');
    _Closewindow = paramVar('closeWindow');
    Pagename = paramVar('PageName');

    if (isEmpty(Projectname) && Len(JSB_BF_PARAMVARS()) <= 1) {
        Sentence = Field(activeProcess.At_Sentence, '(!', 1);
        Projectname = Field(Sentence, ' ', 2);
        Viewname = Field(Sentence, ' ', 3);
        Columnid = Field(Sentence, ' ', 4);
    }

    if (CBool(Viewname)) Viewname = dropIfRight(CStr(Viewname), '.view', true) + '.view';
    if (isEmpty(Projectname) || isEmpty(Viewname)) return Stop('edc ProjectName ViewName ColumnName');

    if (await JSB_ODB_OPEN('', CStr(Projectname), activeProcess.At_File, function (_At_File) { activeProcess.At_File = _At_File })); else return Stop(At(-1), 'File/Project ', Projectname, ' not found');

    if (CBool(Columnid)) {
        await JSB_MDL_EDITVIEWCOLUMN_Sub(Projectname, Pagename, Viewname, Columnid, Iniframe, function (_Projectname, _Pagename, _Viewname, _Columnid, _Iniframe) { Projectname = _Projectname; Pagename = _Pagename; Viewname = _Viewname; Columnid = _Columnid; Iniframe = _Iniframe });
    } else {
        await JSB_MDL_EDITVIEWMODELCOLUMNS_Sub(Projectname, Pagename, Viewname, false, function (_Projectname, _Pagename, _Viewname, _P4) { Projectname = _Projectname; Pagename = _Pagename; Viewname = _Viewname });
    }

    if (CBool(Frompage)) return At_Response.Redirect(Frompage);
    if (CBool(Iniframe)) return Stop();

    if (CBool(_Closewindow) || !hasParentProcess()) At_Server.End();
    return;
}
// </EDC_Pgm>

// <EDITPAGEMODEL_Pgm>
async function JSB_MDL_EDITPAGEMODEL_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Pagename, Projectname, Frompage;

    // %options aspxC-
    Pagename = paramVar('pagename');
    Projectname = paramVar('projectname');
    Frompage = paramVar('fromPage');

    await JSB_MDL_EDITPAGEMODEL_Sub(Projectname, Pagename, true, false, function (_Projectname, _Pagename) { Projectname = _Projectname; Pagename = _Pagename });
    if (CBool(Frompage)) return At_Response.Redirect(Frompage);
    if (hasTclParent()) return Stop();
    At_Server.End();
    return;
}
// </EDITPAGEMODEL_Pgm>

// <EDITPAGEMODEL_Sub>
async function JSB_MDL_EDITPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, Showbackbtn, Quickrtn, setByRefValues) {
    // local variables
    var Originaldb, Pagetype, Isnew, Pagedataset, Ans, Viewname;
    var Objectmodel, _Html, Toolbar, Parentrefresh, Cmd, Clonepagename;
    var Oldpagename, Newpagename;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename)
        return v
    }
    // %options aspxC-

    ByRef_Pagename = dropIfRight(CStr(ByRef_Pagename), '.page', true);
    Originaldb = Account();

    if (isEmpty(ByRef_Pagename)) {
        if (Not(await JSB_MDL_NEWPAGE(CStr(ByRef_Projectname), '', ByRef_Pagename, [undefined,], [undefined,], [undefined,], Pagetype, '', undefined, undefined, function (_ByRef_Pagename, _Pagetype, _P8) { ByRef_Pagename = _ByRef_Pagename; Pagetype = _Pagetype }))) return exit(undefined);
        Isnew = true;
    } else {
        if (await JSB_ODB_READJSON(Pagedataset, await JSB_BF_FHANDLE('dict', ByRef_Projectname), CStr(ByRef_Pagename) + '.page', function (_Pagedataset) { Pagedataset = _Pagedataset })) {
            Isnew = false;
        } else {
            Ans = await JSB_BF_MSGBOX('Warning', 'The web page ' + CStr(ByRef_Pagename) + ' does not exist, do you want to create it?', '*Yes,No');
            if (Ans != 'Yes') { ByRef_Pagename = ''; return exit(undefined); }
            if (Not(await JSB_MDL_NEWPAGE(CStr(ByRef_Projectname), '', ByRef_Pagename, [undefined,], [undefined,], [undefined,], Pagetype, '', undefined, undefined, function (_ByRef_Pagename, _Pagetype, _P8) { ByRef_Pagename = _ByRef_Pagename; Pagetype = _Pagetype }))) return exit(undefined);
            if (CBool(Quickrtn)) return exit(undefined);
            Isnew = true;
        }
    }

    if (await JSB_ODB_READJSON(Pagedataset, await JSB_BF_FHANDLE('dict', ByRef_Projectname), CStr(ByRef_Pagename) + '.page', function (_Pagedataset) { Pagedataset = _Pagedataset })); else { ByRef_Pagename = ''; return exit(undefined); }
    Viewname = CStr(ByRef_Pagename) + '.view';


    do {
        // Redisplay the record
        Objectmodel = await JSB_MDL_MODELFORPAGE(ByRef_Projectname, function (_ByRef_Projectname) { ByRef_Projectname = _ByRef_Projectname });
        await JSB_MDL_GETEXTRAPAGECOLUMNS_Sub(Objectmodel.columns, Pagedataset.templateName);

        _Html = await JSB_MDL_FORMVIEWNCOLUMNS(CStr(ByRef_Projectname), Objectmodel, CStr(false), Pagedataset, CStr(Viewname));

        if (CBool(Showbackbtn)) {
            Toolbar = JSB_HTML_SUBMITBTN('formBtn', 'B', 'Back');
            Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('formBtn', 'S', 'Save') + JSB_HTML_SUBMITBTN('formBtn', 'CC', 'Cancel') + JSB_HTML_SUBMITBTN('formBtn', 'D', 'Delete');
        } else {
            Toolbar = JSB_HTML_SUBMITBTN('formBtn', 'Q', 'Quit');
            Toolbar = CStr(Toolbar) + JSB_HTML_SAVEBTN('formBtn', 'S', 'Save') + JSB_HTML_SUBMITBTN('formBtn', 'D', 'Delete') + JSB_HTML_SAVEBTN('formBtn', 'G', 'Generate');
        }
        Toolbar = CStr(Toolbar) + JSB_HTML_SAVEBTN('formBtn', 'C', 'Clone');

        Print(clearScreen(), JSB_HTML_ROWS2('%', CStr(_Html), '66px', CStr(Toolbar)));

        if (CBool(Parentrefresh)) {
            Print(JSB_HTML_SCRIPT('if (parent.refreshData) parent.refreshData();'));
            Parentrefresh = 0;
        }

        // *** Pause ****
        await At_Server.asyncPause(me);
        await JSB_MDL_STANDARDUNLOAD(Objectmodel.columns, Pagedataset, true);
        Cmd = formVar('formBtn'); // Only Exists If This Is A Post Back

        // In case we MsgBox
        // Html = @jsb_mdl.putRowDataIntoHtml(ProjectName, objectModel, pageDataSet, htmlBackDrop)
        // Html = @jsb_mdl.formViewNColumns(ProjectName, ObjectModel, False, pageDataSet)
        // Print @ClearScreen:@Rows2("%", Html, "66px", ToolBar):

        switch (Cmd) {
            case 'Q': case 'B':
                if (await JSB_ODB_ATTACHDB(CStr(Originaldb))); else null;
                ByRef_Pagename = Chr(27);
                return exit(undefined);

                break;

            case 'CC':
                // Cancel = delete what work we have done so far
                if (CBool(Isnew)) {
                    if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Pagename))); else if (activeProcess.At_Errors) Alert(CStr(activeProcess.At_Errors));;
                    if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Pagename) + '.view')); else if (activeProcess.At_Errors) Alert(CStr(activeProcess.At_Errors));;
                    if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Pagename) + '_west.view')); else if (activeProcess.At_Errors) Alert(CStr(activeProcess.At_Errors));;
                    if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('dict', ByRef_Projectname), CStr(ByRef_Pagename) + '.page')); else if (activeProcess.At_Errors) Alert(CStr(activeProcess.At_Errors));
                }
                if (await JSB_ODB_ATTACHDB(CStr(Originaldb))); else null;
                return exit(undefined);

                break;

            case 'C':
                Clonepagename = await JSB_MDL_CLONEPAGEMODEL(ByRef_Projectname, ByRef_Pagename);
                if (CBool(Clonepagename)) await JSB_MDL_RESPONSEREDIRECT(jsbRootExecute(CStr(Clonepagename)));

                break;

            case 'D':
                if (await JSB_MDL_DELETEPAGEMODEL(ByRef_Projectname, ByRef_Pagename, function (_ByRef_Projectname, _ByRef_Pagename) { ByRef_Projectname = _ByRef_Projectname; ByRef_Pagename = _ByRef_Pagename })) {
                    ByRef_Pagename = Chr(27);
                    return Stop(clearScreen());
                }

                break;

            case 'S': case 'G':
                Print(clearScreen());
                if (await JSB_ODB_WRITEJSON(Pagedataset, await JSB_BF_FHANDLE('dict', ByRef_Projectname), CStr(ByRef_Pagename) + '.page')); else return Stop(At(-1), 'Edp-', System(28), ': ', activeProcess.At_Errors);
                await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, true);
                if (Cmd == 'S') {
                    if (CBool(Showbackbtn)) {
                        if (await JSB_ODB_ATTACHDB(CStr(Originaldb))); else null;
                        return exit(undefined);
                    }

                    return At_Response.Redirect(jsbRootExecute(CStr(ByRef_Pagename)));
                }

                break;

            case 'R':
                Oldpagename = dropIfRight(CStr(ByRef_Pagename), '.page', true);

                Newpagename = Trim(await JSB_BF_INPUTBOX('Rename', 'Enter a new name', '', '80%', ''));
                Newpagename = dropIfRight(CStr(Newpagename), '.page', true);
                if (Newpagename != Chr(27) && !isEmpty(Newpagename)) {
                    if (await JSB_MDL_CLONEPAGEMODEL(ByRef_Projectname, Oldpagename, Newpagename)) {
                        await JSB_MDL_DELETEPAGEMODEL(ByRef_Projectname, Oldpagename, function (_ByRef_Projectname, _Oldpagename) { ByRef_Projectname = _ByRef_Projectname; Oldpagename = _Oldpagename });
                        ByRef_Pagename = Newpagename;
                    }
                }

                Parentrefresh = 1;
        }

    }
    while (1);
    return exit();
}
// </EDITPAGEMODEL_Sub>

// <EDITREPORTURL>
async function JSB_MDL_EDITREPORTURL(ByRef_Tabid, ByRef_Reportid, ByRef_Databasename, setByRefValues) {
    // local variables
    var Url;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tabid, ByRef_Reportid, ByRef_Databasename)
        return v
    }
    // %options aspxC-

    Url = jsbRootAccount() + '?edp dbBuilderReports';
    if (CBool(ByRef_Reportid)) Url += ' ' + CStr(ByRef_Reportid);
    Url += ' (' + '&tabID=' + urlEncode(ByRef_Tabid) + '&databaseName=' + urlEncode(ByRef_Databasename);
    return exit(Url);
}
// </EDITREPORTURL>

// <EDITTABLE_Sub>
async function JSB_MDL_EDITTABLE_Sub(ByRef_Tablename, ByRef_Showtablelist, setByRefValues) {
    // local variables
    var Fdict, Metadata, Row, _Options, Mydata, Header, Jqgrid;
    var Newdata, Ops, Pkname, Cmd, Originalrow, Originalpkid, Pkid;
    var Pname, Nval;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                function exit(v) {
                    if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tablename, ByRef_Showtablelist)
                    return v
                }
                // %options aspxC-

                if (Not(ByRef_Tablename) || CBool(ByRef_Showtablelist)) {
                    ByRef_Tablename = await JSB_MDL_PICKATABLE(ByRef_Tablename, '');
                    if (Not(ByRef_Tablename)) return exit(undefined);
                }

                Fdict = await JSB_BF_FHANDLE('dict', ByRef_Tablename);

                Metadata = await JSB_BF_TABLECOLUMNS();
                Metadata[1].display = '';
                Metadata[1].canedit = true;
                Metadata[Metadata.length] = { "name": 'original_name', "label": 'Original Name', "defaultvalue": '', "align": 'left', "datatype": 'string', "display": 'hidden' };
                for (Row of iterateOver(Metadata)) {
                    Row.width = '100%';
                }

                _Options = { "HeadForeColor": 'blue', "HeadBackColor": 'yellow', "allowUpdates": true, "allowDeletes": true, "allowInserts": true, "width100percent": true };


            case "STARTOVER":

                Mydata = await JSB_BF_GETTABLECOLUMNDEFS(CStr(ByRef_Tablename), CStr(false), true);

                for (Row of iterateOver(Mydata)) {
                    Row.original_name = Row.name;
                    Row.required = !Not(Row.required);
                    Row.sortable = !Not(Row.sortable);
                    Row.notblank = !Not(Row.notblank);
                    Row.primarykey = !Not(Row.primarykey);
                    Row.encrypt = !Not(Row.encrypt);
                    if (isEmpty(Row.align)) Row.align = 'left';
                }

                Header = Center('Editing Meta Data for table ' + bold(CStr(ByRef_Tablename)));
                Header += crlf;
                Header += Center(JSB_HTML_SUBMITBTN('btn', 'Save') + ' ' + JSB_HTML_SUBMITBTN('btn', 'Cancel'));


            case "TOP":

                Jqgrid = await JSB_HTML_JQGRID('myGrid', Mydata, Metadata, _Options);

                Print(At(-1), JSB_HTML_ROWS2('6em', CStr(Header), '%', CStr(Jqgrid), 'overflow: hidden', 'overflow: hidden'));

                await At_Server.asyncPause(me);

                if (formVar('btn') == 'Cancel') return exit(undefined);

                Newdata = parseJSON(formVar('myGrid'));
                Ops = parseJSON(formVar('myGrid_ops'));
                Pkname = 'name';

                for (Cmd of iterateOver(Ops)) {
                    Row = Cmd.updatedrow;
                    Originalrow = Cmd.originalrow;
                    if (Not(Originalrow)) { Originalrow = {} }

                    if (Cmd.op == 'delete') {
                        if (Left(Cmd.id, 1) != '-') {
                            if (await JSB_ODB_DELETEITEM(Fdict, '!' + CStr(Cmd.row[Pkname]))); else await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
                        }
                    } else {
                        Originalpkid = Originalrow[Pkname];
                        Pkid = Row[Pkname];

                        for (Pname of iterateOver([undefined, 'required', 'sortable', 'notblank', 'primarykey', 'notblank', 'encrypt'])) {
                            Nval = CStr(Row[Pname], true);
                            if (Nval == 'false' || Nval == '0' || isEmpty(Nval)) Row[Pname] = 0; else Row[Pname] = 1;

                            Nval = CStr(Originalrow[Pname], true);
                            if (Nval == 'false' || Nval == '0' || isEmpty(Nval)) Originalrow[Pname] = 0; else Originalrow[Pname] = 1;
                        }

                        if (Cmd.op == 'new') {
                            if (await JSB_ODB_WRITE(CStr(Row), Fdict, CStr(Pkid))); else await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
                        } else if (Cmd.op == 'update') {
                            if (Left(Cmd.id, 1) == '-') {
                                if (await JSB_ODB_WRITE(CStr(Row), Fdict, CStr(Pkid))); else await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
                            } else {
                                if (Null0(Originalpkid) != Null0(Pkid) && !isEmpty(Originalpkid)) { if (await JSB_ODB_DELETEITEM(Fdict, '!' + CStr(Originalpkid))); else await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors)); }

                                if (await JSB_ODB_WRITE(CStr(Row), Fdict, CStr(Pkid))); else await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
                            }
                        }
                    }
                }

                return exit();


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </EDITTABLE_Sub>

// <EDITVIEWBTN>
async function JSB_MDL_EDITVIEWBTN(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Btntext, setByRefValues) {
    // local variables
    var Objectmodel, Btni, Jsbtn, Array, Ans;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Btntext)
        return v
    }
    // %options aspxC-

    if (await JSB_ODB_READJSON(Objectmodel, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Objectmodel) { Objectmodel = _Objectmodel })); else { Println(Alert('Unable to find view ' + CStr(ByRef_Viewname))); debugger; return exit(false); }
    Btni = await JSB_MDL_FINDBTNI(Objectmodel, ByRef_Btntext, function (_Objectmodel, _ByRef_Btntext) { Objectmodel = _Objectmodel; ByRef_Btntext = _ByRef_Btntext });
    if (Not(Btni)) return exit(false);
    Jsbtn = Objectmodel.custombtns[Btni];

    Array = [undefined,];
    Array[Array.length] = clone(Jsbtn);

    Ans = await JSB_BF_POPUP_JSONDEF(ByRef_Projectname, 'jsb_jsondefs', 'customBtns', '', '', Array, '80%', '80%', 'Buttons for view ' + CStr(ByRef_Viewname), undefined, function (_ByRef_Projectname, _P2, _P3, _P4, _P5, _Array) { ByRef_Projectname = _ByRef_Projectname; Array = _Array });
    if (Not(Ans)) return exit(false);

    if (UBound(Ans) != 1) return exit(false);

    Objectmodel.custombtns[Btni] = Ans[1];
    if (await JSB_ODB_WRITEJSON(Objectmodel, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit(true);
}
// </EDITVIEWBTN>

// <EDITVIEWCOLUMN_Sub>
async function JSB_MDL_EDITVIEWCOLUMN_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, ByRef_Iniframe, setByRefValues) {
    // local variables
    var Viewdataset, Tablename, Isgrid, Canmodify, Changed, Viewrow;
    var Columnidx, Viewmodel, Callname, Subname, _Html, Toolbar;
    var Parentrefresh, Btn, Tablerow, Tn;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, ByRef_Iniframe)
        return v
    }
    // %options aspxC-

    if (await JSB_ODB_READJSON(Viewdataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Viewdataset) { Viewdataset = _Viewdataset })); else { Viewdataset = await JSB_MDL_CREATENEWVIEW(ByRef_Viewname, function (_ByRef_Viewname) { ByRef_Viewname = _ByRef_Viewname }); }
    Tablename = Viewdataset.tableName;

    Isgrid = Viewdataset.templateName == 'Grid';
    Canmodify = (CBool(Viewdataset.allowupdates) || CBool(Viewdataset.allowinserts));
    if (Not(Canmodify)) {
        Changed = false;
        for (Viewrow of iterateOver(Viewdataset.columns)) {
            if (Viewrow.control == 'textbox') { Viewrow.control = 'label'; Changed = true; }
        }
        if (CBool(Changed)) { if (await JSB_ODB_WRITEJSON(Viewdataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(activeProcess.At_Errors); }
    }

    // Find the column
    Columnidx = await JSB_MDL_FINDVIEWCOLUMN(Viewdataset, ByRef_Columnid, function (_Viewdataset) { Viewdataset = _Viewdataset });
    if (Null0(Columnidx) == '0') {
        Println('editViewColumn: view: ', ByRef_Viewname, ' does not have a column named ', ByRef_Columnid);
        Print(); debugger; // Ok
        return exit(undefined);
    }

    await JSB_MDL_MDLSESSIONSETUP_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, Viewdataset, function (_ByRef_Projectname, _ByRef_Pagename, _ByRef_Viewname, _Viewdataset) { ByRef_Projectname = _ByRef_Projectname; ByRef_Pagename = _ByRef_Pagename; ByRef_Viewname = _ByRef_Viewname; Viewdataset = _Viewdataset });

    // Extend it

    do {
        Print(clearScreen());
        Viewrow = Viewdataset.columns[Columnidx];

        // Re-Read since we are changing it
        Viewmodel = await JSB_MDL_MODELFORALLCOLUMNS();

        // Extend Model for this type of control
        Callname = LCase(Viewrow.control);
        if (Left(Callname, 4) == 'ctl_') Callname = Mid1(Callname, 5);

        Subname = ('jsb_ctls|' + CStr(Callname) + '_ExtraMeta');
        await asyncCallByName(Subname, me, 1 /*ignore if missing */, Viewrow, Viewmodel, function (_Viewrow) { Viewrow = _Viewrow });

        // fill defaults for any missing meta-data columns
        await JSB_MDL_SETDEFAULTS(ByRef_Viewname, Viewmodel.columns, Viewrow, function (_ByRef_Viewname, _P2, _Viewrow) { ByRef_Viewname = _ByRef_Viewname; Viewrow = _Viewrow });

        // Display the record
        _Html = await JSB_MDL_FORMVIEWNCOLUMNS(CStr(ByRef_Projectname), Viewmodel, CStr(false), Viewrow, CStr(ByRef_Viewname));
        // Html = @jsb_mdl.putRowDataIntoHtml(ProjectName, viewModel, viewRow, viewBackDrop)

        Toolbar = JSB_HTML_SUBMITBTN('edc_formBtn', 'SV', 'Save');
        if (CBool(Tablename)) Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edc_formBtn', 'LD', 'Load defaults');

        Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edc_formBtn', 'D', 'Delete from View');

        if (CBool(ByRef_Iniframe)) {
            Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edc_formBtn', 'B', 'Close');
        } else {
            if (hasTclParent()) {
                Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edc_formBtn', 'Q', 'Quit');
            } else if (hasParentProcess()) {
                Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edc_formBtn', 'B', 'Back');
            } else {
                Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edc_formBtn', 'X', 'Exit'); // From User Screen;
            }
        }

        _Html = JSB_HTML_ROWS2('%', CStr(_Html), '33px', CStr(Toolbar));
        Print(clearScreen(), _Html);

        if (CBool(Parentrefresh)) {
            Print(JSB_HTML_SCRIPT('if (parent.refreshData) parent.refreshData();'));
            Parentrefresh = 0;
        }

        await At_Server.asyncPause(me);

        await JSB_MDL_STANDARDUNLOAD(Viewmodel.columns, Viewrow);
        Btn = formVar('edc_formBtn'); // Only Exists If This Is A Post Back

        // In case we msgbox
        // Html = @jsb_mdl.putRowDataIntoHtml(ProjectName, viewModel, viewRow, viewBackDrop)
        // Html = @formViewNColumns(ProjectName, viewModel, False, viewRow)
        // print @ClearScreen:Html:

        // What button did the user click?
        switch (Btn) {
            case 'Q': case 'B': case 'C': case 'X':
                Print(clearScreen(), JSB_HTML_SCRIPT('if (parent.refreshData) parent.refreshData();'));
                return exit(undefined);

                break;

            case 'LD':
                if (await JSB_ODB_READJSON(Tablerow, await JSB_BF_FHANDLE('DICT', Tablename), '!' + CStr(ByRef_Columnid), function (_Tablerow) { Tablerow = _Tablerow })) {
                    for (Tn of iterateOver(Tablerow)) {
                        Viewrow[Tn] = Tablerow[Tn];
                    }
                }
                Viewdataset.columns[Columnidx] = Viewrow;

                break;

            case 'D':
                await JSB_MDL_DELETEVIEWCOLUMN_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, false, function (_ByRef_Projectname, _ByRef_Pagename, _ByRef_Viewname, _ByRef_Columnid, _P5) { ByRef_Projectname = _ByRef_Projectname; ByRef_Pagename = _ByRef_Pagename; ByRef_Viewname = _ByRef_Viewname; ByRef_Columnid = _ByRef_Columnid });
                Print(clearScreen(), JSB_HTML_SCRIPT('if (parent.refreshData) parent.refreshData();'));
                return exit(undefined);

                break;

            case 'SV':
                // Save defaults
                if (CBool(Tablename)) {
                    if (await JSB_ODB_READJSON(Tablerow, await JSB_BF_FHANDLE('DICT', Tablename), '!' + CStr(ByRef_Columnid), function (_Tablerow) { Tablerow = _Tablerow })); else { Tablerow = {} }
                    await JSB_MDL_STANDARDUNLOAD(await JSB_BF_TABLECOLUMNS(), Tablerow);
                    if (await JSB_ODB_WRITE(CStr(Tablerow), await JSB_BF_FHANDLE('DICT', Tablename), '!' + CStr(ByRef_Columnid))); else return Stop(At(-1), 'edc-', System(28), ': ', activeProcess.At_Errors);
                }

                // Save view column
                if (await JSB_ODB_WRITEJSON(Viewdataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edc-', System(28), ': ', activeProcess.At_Errors);

                if (CBool(ByRef_Iniframe)) {
                    Parentrefresh = 1;
                    Print(clearScreen(), JSB_HTML_SCRIPT('if (parent.refreshData) parent.refreshData();'));
                    return exit(undefined);
                } else {
                    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);

                    Parentrefresh = 1;
                    Print(clearScreen(), JSB_HTML_SCRIPT('if (parent.refreshData) parent.refreshData();'));
                    return exit(undefined);;
                }
        }

    }
    while (1);
    return exit();
}
// </EDITVIEWCOLUMN_Sub>

// <EDITVIEWCOLUMN_Pgm>
async function JSB_MDL_EDITVIEWCOLUMN_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Viewname, Columnid, Projectname, Iniframe, Frompage, _Closewindow;
    var Pagename;

    // %options aspxC-

    if (Not(isAdmin())) return Stop('You must be an administrator to run this command');

    Viewname = paramVar('viewname');
    Columnid = paramVar('id');
    Projectname = paramVar('projectname');
    Viewname = dropIfRight(CStr(Viewname), '.view', true) + '.view';
    Iniframe = paramVar('inIFrame');
    Frompage = paramVar('fromPage');
    _Closewindow = paramVar('closeWindow');
    Pagename = paramVar('PageName');

    await JSB_MDL_EDITVIEWCOLUMN_Sub(Projectname, Pagename, Viewname, Columnid, Iniframe, function (_Projectname, _Pagename, _Viewname, _Columnid, _Iniframe) { Projectname = _Projectname; Pagename = _Pagename; Viewname = _Viewname; Columnid = _Columnid; Iniframe = _Iniframe });

    if (CBool(Frompage)) return At_Response.Redirect(Frompage);
    if (CBool(Iniframe)) return Stop();

    if (CBool(_Closewindow) || !hasParentProcess()) At_Server.End();
    return;
}
// </EDITVIEWCOLUMN_Pgm>

// <EDITVIEWMODEL_Sub>
async function JSB_MDL_EDITVIEWMODEL_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Showbackbtn, setByRefValues) {
    // local variables
    var Parentrefresh, Dataset, Initialtable, Objectmodel, F, Toolbar;
    var Cmd, Tablename, Niceobjectname, Newviewname;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Showbackbtn)
        return v
    }
    // %options aspxC-

    // Grid ajax restful setup
    // viewColumns = @modelForAllColumns()
    Parentrefresh = 0;
    ByRef_Viewname = dropIfRight(CStr(ByRef_Viewname), '.view', true) + '.view';

    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else { Dataset = await JSB_MDL_CREATENEWVIEW(ByRef_Viewname, function (_ByRef_Viewname) { ByRef_Viewname = _ByRef_Viewname }); }
    Initialtable = Dataset.tableName;


    do {
        if (System(1) == 'aspx') {
            if (await JSB_ODB_ATTACHDB(CStr(Dataset.attachdb))); else { Println(Alert('edv-' + CStr(System(28)) + ': Unable to attach to ' + CStr(Dataset.attachdb) + ' in view ' + CStr(ByRef_Viewname))); debugger; }
        }

        // Does an ExtraMeta item exist to call?
        Objectmodel = await JSB_MDL_MODELFORVIEW();
        await JSB_MDL_ADDEXTRACOLUMNS2VIEWMODEL_Sub(Objectmodel, Dataset.templateName, function (_Objectmodel, _P2) { Objectmodel = _Objectmodel });

        await JSB_MDL_MDLSESSIONSETUP_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, Dataset, function (_ByRef_Projectname, _ByRef_Pagename, _ByRef_Viewname, _Dataset) { ByRef_Projectname = _ByRef_Projectname; ByRef_Pagename = _ByRef_Pagename; ByRef_Viewname = _ByRef_Viewname; Dataset = _Dataset });
        await JSB_MDL_SETDEFAULTS(ByRef_Viewname, Objectmodel.columns, Dataset, function (_ByRef_Viewname, _P2, _Dataset) { ByRef_Viewname = _ByRef_Viewname; Dataset = _Dataset });
        F = await JSB_MDL_FORMVIEWNCOLUMNS(CStr(ByRef_Projectname), Objectmodel, CStr(false), Dataset, CStr(ByRef_Viewname));

        Toolbar = '';
        if (CBool(ByRef_Showbackbtn)) {
            Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', 'SG', 'Save');
            Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', 'B', 'Cancel');
        } else {
            if (hasTclParent()) {
                Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', 'Q', 'Quit');
            } else if (hasParentProcess()) {
                Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', 'B', 'Back');
            } else {
                Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', 'C', 'Close');
            }

            Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', 'R', 'Rename');
            Toolbar = CStr(Toolbar) + JSB_HTML_SAVEBTN('edv_formBtn', 'S', 'Save');
            Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', 'D', 'Del');
        }

        Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', '@', 'Cols');
        Toolbar = CStr(Toolbar) + JSB_HTML_SAVEBTN('edv_formBtn', 'Z', 'SaveAs');
        Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', 'X', 'CopyFrom');
        Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', '#', 'Ed Code');
        Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', 'W', 'Wizard');
        Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', 'I', 'Choose Cols');
        Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', 'makeUpdate', '+UpdBtn');
        Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', 'makeDelete', '+DelBtn');

        Print(clearScreen(), JSB_HTML_ROWS2('%', CStr(F), '66px', CStr(Toolbar)));

        if (CBool(Parentrefresh)) {
            Print(JSB_HTML_SCRIPT('if (parent.refreshData) parent.refreshData();'));
            Parentrefresh = 0;
        }

        await At_Server.asyncPause(me);

        // Don't restrict to model, as we may change template types
        await JSB_MDL_STANDARDUNLOAD(Objectmodel.columns, Dataset, false);
        Cmd = formVar('edv_formBtn');

        // Did we change tables?
        if (Null0(Dataset.tableName) != Null0(Tablename)) {
            if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
            Tablename = Dataset.tableName;
        }

        At_Session.Item('SQLCOLUMNS', await JSB_MDL_POSSIBLEINPUTCOLUMNS(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, function (_ByRef_Projectname) { ByRef_Projectname = _ByRef_Projectname }));
        At_Session.Item('VIEWCOLUMNS', Dataset.columns);

        // In case we MsgBox
        // F = @jsb_mdl.putRowDataIntoHtml(ProjectName, ObjectModel, dataSet, htmlBackDrop)
        // F = @jsb_mdl.formViewNColumns(ProjectName, ObjectModel, false, dataSet)
        // Print @ClearScreen:@Rows2("%", F, "66px", ToolBar):

        switch (Cmd) {
            case 'Q': case 'C': case 'B':
                Println(clearScreen()); return exit(undefined);

                break;

            case 'I':
                if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
                await JSB_MDL_CHOOSECOLUMNS_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, function (_ByRef_Projectname, _ByRef_Pagename, _ByRef_Viewname) { ByRef_Projectname = _ByRef_Projectname; ByRef_Pagename = _ByRef_Pagename; ByRef_Viewname = _ByRef_Viewname });
                if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else { Dataset = await JSB_MDL_CREATENEWVIEW(ByRef_Viewname, function (_ByRef_Viewname) { ByRef_Viewname = _ByRef_Viewname }); }

                break;

            case 'W':
                await JSB_MDL_VIEWWIZARD_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, Dataset, function (_ByRef_Projectname, _ByRef_Pagename, _ByRef_Viewname, _Dataset) { ByRef_Projectname = _ByRef_Projectname; ByRef_Pagename = _ByRef_Pagename; ByRef_Viewname = _ByRef_Viewname; Dataset = _Dataset });

                break;

            case 'SG':
                Print(clearScreen());
                if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
                await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
                return exit(undefined);

                break;

            case '#':
                Niceobjectname = JSB_BF_NICENAME(dropIfRight(CStr(ByRef_Viewname), '.view', true));
                await asyncTclExecute('ED ' + CStr(ByRef_Projectname) + ' view_' + CStr(Niceobjectname));

                break;

            case '@':
                await JSB_MDL_EDITVIEWMODELCOLUMNS_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, true, function (_ByRef_Projectname, _ByRef_Pagename, _ByRef_Viewname, _P4) { ByRef_Projectname = _ByRef_Projectname; ByRef_Pagename = _ByRef_Pagename; ByRef_Viewname = _ByRef_Viewname });

                break;

            case 'S':
                Print(clearScreen());
                if (await JSB_ODB_WRITE(CStr(Dataset), await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
                await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, dropIfRight(CStr(ByRef_Viewname), '.view', true), false); // Was GenerateView

                if (hasTclParent() || hasParentProcess()) return exit(undefined);

                break;

            case 'E':
                await JSB_MDL_EDITTABLE_Sub(ByRef_Viewname, false, function (_ByRef_Viewname, _P2) { ByRef_Viewname = _ByRef_Viewname });

                break;

            case 'R':
                if (await JSB_MDL_RENAMEVIEW(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, '', function (_ByRef_Projectname, _ByRef_Pagename, _ByRef_Viewname, _P4) { ByRef_Projectname = _ByRef_Projectname; ByRef_Pagename = _ByRef_Pagename; ByRef_Viewname = _ByRef_Viewname })) {
                    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
                    Parentrefresh = 1;
                }

                break;

            case 'X':
                // Copy From
                if (await JSB_MDL_COPYVIEWFROM(ByRef_Projectname, ByRef_Viewname, function (_ByRef_Projectname, _ByRef_Viewname) { ByRef_Projectname = _ByRef_Projectname; ByRef_Viewname = _ByRef_Viewname })) {
                    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else { Dataset = await JSB_MDL_CREATENEWVIEW(ByRef_Viewname, function (_ByRef_Viewname) { ByRef_Viewname = _ByRef_Viewname }); }
                    Parentrefresh = 1;
                }

                break;

            case 'Z':
                // Clone a view
                Newviewname = await JSB_MDL_CLONEVIEWTO(CStr(ByRef_Projectname), CStr(ByRef_Projectname), CStr(ByRef_Viewname), '');

                if (CBool(Newviewname)) {
                    ByRef_Viewname = Newviewname;
                    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else { Dataset = await JSB_MDL_CREATENEWVIEW(ByRef_Viewname, function (_ByRef_Viewname) { ByRef_Viewname = _ByRef_Viewname }); }
                    Parentrefresh = 1;
                }

                break;

            case 'D':
                // Delete a view
                if (await JSB_MDL_DELETEVIEW(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, true, function (_ByRef_Projectname, _ByRef_Pagename, _ByRef_Viewname, _P4) { ByRef_Projectname = _ByRef_Projectname; ByRef_Pagename = _ByRef_Pagename; ByRef_Viewname = _ByRef_Viewname })) {
                    Parentrefresh = 1;
                    FlushHTML();
                    return exit(undefined);
                }

                break;

            case 'V':
                break;

            case 'makeUpdate':
                if (isEmpty(Dataset.custombtns)) Dataset.custombtns = [undefined,];
                Dataset.custombtns[Dataset.custombtns.length] = { "buttontxt": 'Save', "verifyform": true, "saveform": true, "deleteform": false, "confirmop": 0, "addoutputs": true, "addfrompage": false, "showwhen": 1, "addnewrec": false, "parentmayhide": true };
                Dataset.custombtns[Dataset.custombtns.length] = { "buttontxt": 'Update', "verifyform": true, "saveform": true, "deleteform": false, "confirmop": 0, "addoutputs": true, "addfrompage": false, "showwhen": 2, "addnewrec": false, "parentmayhide": true };

                break;

            case 'makeDelete':
                if (isEmpty(Dataset.custombtns)) Dataset.custombtns = [undefined,];
                Dataset.custombtns[Dataset.custombtns.length] = { "buttontxt": 'Delete', "verifyform": false, "saveform": false, "deleteform": true, "confirmop": 1, "addoutputs": false, "addfrompage": false, "showwhen": 2, "addnewrec": false, "parentmayhide": true };
        }
    }
    while (1);
    return exit();
}
// </EDITVIEWMODEL_Sub>

// <EDITVIEWMODEL_Pgm>
async function JSB_MDL_EDITVIEWMODEL_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Viewname, Projectname, Frompage, _Closewindow, Pagename;

    // %options aspxC-

    if (Not(isAdmin())) return Stop('You must be an administrator to run this command');

    Viewname = paramVar('viewname');
    Projectname = paramVar('projectname');
    Frompage = paramVar('fromPage');
    _Closewindow = paramVar('closeWindow');
    Pagename = paramVar('pageName');

    Viewname = dropIfRight(CStr(Viewname), '.view', true) + '.view';
    if (Not(Pagename)) Pagename = dropIfRight(CStr(Viewname), '.view', true) + '.page';

    if (Not(Projectname)) {
        Alert('editviewmodel missing projectname ' + JSB_BF_URL());
    } else {
        await JSB_MDL_EDITVIEWMODEL_Sub(Projectname, Pagename, Viewname, true, function (_Projectname, _Pagename, _Viewname, _P4) { Projectname = _Projectname; Pagename = _Pagename; Viewname = _Viewname });
    }

    if (CBool(Frompage)) return At_Response.Redirect(Frompage);
    if (CBool(_Closewindow) || !hasParentProcess()) At_Server.End();
    return;
}
// </EDITVIEWMODEL_Pgm>

// <EDITVIEWMODELCOLUMNS_Sub>
async function JSB_MDL_EDITVIEWMODELCOLUMNS_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Showbackbtn, setByRefValues) {
    // local variables
    var Url, Containername, Onselect, Viewmodel, Column, Jqgridrestcall;
    var Jq, Toolbar, Th, Cmd;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Showbackbtn)
        return v
    }
    // %options aspxC-

    // onParentSelect setup a child launch
    Url = (jsbRestCall('editViewColumn?viewname=' + urlEncode(ByRef_Viewname) + '&id={id}&projectname=' + urlEncode(ByRef_Projectname) + '&inIFrame=1'));
    Containername = 'newDiv' + CStr(Rnd(9999));
    Onselect = genEventHandler('Select', CStr(Url), 4, CStr(Containername)); // 4 Open In An Iframe Whose Id Is containerName

    // Grid ajax restful setup
    Viewmodel = await JSB_MDL_MODELFORALLCOLUMNS();
    for (Column of iterateOver(Viewmodel.columns)) {
        if (Locate(Column.name, [undefined, 'tooltip', 'encrypt', 'Width', 'pickfunction', 'pickpbfunction', 'newlineprefix', 'ctlstyle', 'lblstyle', 'suppresslabel', 'fullline', 'collaspestart', 'collaspeend', 'collaspopen', 'jsconditionals', 'align', 'sortable', 'nounload', 'minimumRole'], 0, 0, 0, "", position => { })) {
            Column.display = 'gridhidden';
        }
    }

    Jqgridrestcall = (jsbRestCall('fetchViewColumns?viewname=' + urlEncode(ByRef_Viewname) + '&projectname=' + urlEncode(ByRef_Projectname)));
    Jq = await JSB_HTML_JQGRID('jqGrid001', Jqgridrestcall, Viewmodel.columns, {}) + CStr(Onselect);


    do {
        Toolbar = '';
        if (CBool(ByRef_Showbackbtn)) {
            Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', 'B', 'Back');
        } else {
            Toolbar = CStr(Toolbar) + JSB_HTML_SUBMITBTN('edv_formBtn', 'Q', 'Quit');
        }
        Th = JSB_HTML_ROWS2('%', CStr(Jq), '6em', Center(CStr(Toolbar)));
        Print(clearScreen(), JSB_HTML_ROWS2('50%', CStr(Th), '50%', Iframe(CStr(Containername), '')));

        await At_Server.asyncPause(me);

        Cmd = formVar('edv_formBtn');
        switch (Cmd) {
            case 'Q':
                return Stop(clearScreen());
                break;

            case 'B':
                return exit(undefined);
        }
    }
    while (1);
    return exit();
}
// </EDITVIEWMODELCOLUMNS_Sub>

// <EDP_Pgm>
async function JSB_MDL_EDP_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Projectname, Pagename, Frompage, Sentence, X, B;

    // %options aspxC-
    if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a data manager to run program');

    Projectname = paramVar('ProjectName');
    Pagename = paramVar('pageName');
    Frompage = paramVar('fromPage');
    Sentence = Field(activeProcess.At_Sentence, '(', 1);

    if (isEmpty(Projectname) && isEmpty(Pagename) && isEmpty(Frompage) && InStr1(1, Sentence, '=') == 0) {
        Projectname = Field(Sentence, ' ', 2);
        Pagename = Field(Sentence, ' ', 3);
        if (LCase(Projectname) == 'dict') {
            Projectname = Field(Sentence, ' ', 3);
            Pagename = Field(Sentence, ' ', 4);
        }
    }
    Pagename = dropIfRight(CStr(Pagename), '.page', true);

    if (isEmpty(Projectname)) return Stop('edp ProjectName viewname');
    if (await JSB_ODB_OPEN('', CStr(Projectname), activeProcess.At_File, function (_At_File) { activeProcess.At_File = _At_File })); else {
        if (await JSB_BF_MSGBOX('The File/Project ' + CStr(Projectname) + ' doesn\'t exist, would you like to create it?', 'Yes,*No') != 'Yes') return Stop();
        X = await JSB_BF_FHANDLE('', Projectname, true);
        X = await JSB_BF_FHANDLE('dict', Projectname, true);
        if (await JSB_ODB_OPEN('', CStr(Projectname), activeProcess.At_File, function (_At_File) { activeProcess.At_File = _At_File })); else return Stop('I\'m sorry, I wasn\'t able to create that project');
    }

    B = At_Response.buffer();
    await JSB_MDL_EDITPAGEMODEL_Sub(Projectname, Pagename, !isEmpty(Frompage), !isEmpty(Pagename), function (_Projectname, _Pagename) { Projectname = _Projectname; Pagename = _Pagename });

    if (CBool(Frompage)) return At_Response.Redirect(Frompage);

    At_Response.buffer(B);

    if (Pagename != Chr(27) && !isEmpty(Pagename)) {
        if (hasParentProcess()) {
            if (await JSB_BF_MSGBOX('Launch page', CStr(Pagename), '*Yes,No') != 'Yes') return;
        }

        return At_Response.Redirect(jsbRootExecute(CStr(Pagename)));
    }

    if (hasTclParent()) return Stop('Done');
    At_Server.End();
    return;
}
// </EDP_Pgm>

// <EDP_PICK_Pgm>
async function JSB_MDL_EDP_PICK_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Fromurl, Fromvalue, Restful_Result, Projectname, Newfromvalue;
    var R, Cb;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Fromurl = JSB_BF_PARAMVAR('FROMURL', CStr(1)); Fromvalue = JSB_BF_PARAMVAR('FROMVALUE', CStr(2));
                // %options aspxC-
                Projectname = paramVar('projectName');
                Newfromvalue = Fromvalue;
                await JSB_MDL_EDITPAGEMODEL_Sub(Projectname, Newfromvalue, true, isEmpty(Fromvalue), function (_Projectname, _Newfromvalue) { Projectname = _Projectname; Newfromvalue = _Newfromvalue });
                if (Newfromvalue == Chr(27)) Newfromvalue = Fromvalue;
                Newfromvalue = dropIfRight(CStr(Newfromvalue), '.page', true);
                if (CBool(Newfromvalue)) Newfromvalue += '.page'; else Newfromvalue = Chr(27);
                return At_Response.redirect('close_html?pick=' + urlEncode(Newfromvalue));

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </EDP_PICK_Pgm>

// <EDT_Pgm>
async function JSB_MDL_EDT_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Paramvars, Tablename, Frompage, _Closewindow, Sentence;

    // %options aspxC-

    if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a data manager to run this command');
    Paramvars = JSB_BF_PARAMVARS();

    Tablename = paramVar('tableName');
    Frompage = paramVar('fromPage');
    _Closewindow = paramVar('closeWindow');

    if (isEmpty(Tablename) && Len(Paramvars) <= 1) {
        Sentence = Field(activeProcess.At_Sentence, '(', 1);
        Tablename = Field(Sentence, ' ', 2);
    }

    await JSB_MDL_EDITTABLE_Sub(Tablename, false, function (_Tablename, _P2) { Tablename = _Tablename });

    Print(At(-1));
    if (CBool(Frompage)) return At_Response.Redirect(Frompage);
    if (CBool(_Closewindow) || !hasParentProcess()) At_Server.End();
    return;
}
// </EDT_Pgm>

// <EDTBCODE>
async function JSB_MDL_EDTBCODE(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Btntext, setByRefValues) {
    // local variables
    var Objectmodel, Niceviewname, Btni, Btn, _Code;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Btntext)
        return v
    }
    // %options aspxC-

    if (await JSB_ODB_READJSON(Objectmodel, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Objectmodel) { Objectmodel = _Objectmodel })); else { Println(Alert('Unable to find view ' + CStr(ByRef_Viewname))); debugger; return exit(false); }
    Niceviewname = JSB_BF_NICENAME(dropIfRight(CStr(ByRef_Viewname), '.view', true));

    Btni = await JSB_MDL_FINDBTNI(Objectmodel, ByRef_Btntext, function (_Objectmodel, _ByRef_Btntext) { Objectmodel = _Objectmodel; ByRef_Btntext = _ByRef_Btntext });
    if (Not(Btni)) return exit(false);
    Btn = Objectmodel.custombtns[Btni];

    if (isEmpty(Btn.customcall)) {
        if (await JSB_BF_MSGBOX('Confirm', 'This button \'' + CStr(ByRef_Btntext) + '\' has no custom code, do you want to add some?', '*Yes,No') != 'Yes') return exit(false);
        Btn.customcall = CStr(Niceviewname) + '_' + JSB_BF_NICENAME(CStr(ByRef_Btntext)) + '_button';
        if (await JSB_ODB_WRITEJSON(Objectmodel, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
        await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    }

    if (await JSB_ODB_READ(_Code, await JSB_BF_FHANDLE('', ByRef_Projectname), dropIfRight(CStr(ByRef_Pagename), '.page', true), function (__Code) { _Code = __Code })); else return exit(false);
    if (InStr1(1, LCase(_Code), 'function ' + LCase(Btn.customcall) + '(') == 0) {
        _Code = Replace(_Code, -1, 0, 0, '');
        _Code = Replace(_Code, -1, 0, 0, 'function ' + CStr(Btn.customcall) + '(viewVars, rtnErrors)');
        _Code = Replace(_Code, -1, 0, 0, '   return false ;* stops any transfers');
        _Code = Replace(_Code, -1, 0, 0, 'end function');
        if (await JSB_ODB_WRITE(CStr(_Code), await JSB_BF_FHANDLE('', ByRef_Projectname), dropIfRight(CStr(ByRef_Pagename), '.page', true))); else { Println(Alert(CStr(activeProcess.At_Errors))); debugger; }
    }

    await JSB_BF_POPOUTWINDOW(CStr(ByRef_Viewname) + ' Custom Code', jsbRootExecute('ed ' + CStr(ByRef_Projectname) + ' \'' + dropIfRight(CStr(ByRef_Pagename), '.page', true) + '\''), true, '80%', '80%');
    return exit(true);
}
// </EDTBCODE>

// <EDV_Pgm>
async function JSB_MDL_EDV_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Projectname, Viewname, Frompage, _Closewindow, Pagename;
    var Sentence, Dataset, Ans, Originaldb;

    // %options aspxC-
    if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a data manager to run this command');

    Projectname = paramVar('ProjectName');
    Viewname = paramVar('ViewName');
    Frompage = paramVar('fromPage');
    _Closewindow = paramVar('closeWindow');
    Pagename = paramVar('pageName');
    if (Not(Pagename)) Pagename = dropIfRight(CStr(Viewname), '.view', true) + '.page';

    if (isEmpty(Projectname) && isEmpty(Viewname) && InStr1(1, activeProcess.At_Sentence, '=') == 0) {
        Sentence = Field(activeProcess.At_Sentence, '(', 1);
        Projectname = Field(Sentence, ' ', 2);
        Viewname = Field(Sentence, ' ', 4);

        if (CBool(Viewname)) {
            Pagename = Field(Sentence, ' ', 3);
        } else {
            Viewname = Field(Sentence, ' ', 3);
        }
    }

    Viewname = dropIfRight(CStr(Viewname), '.view', true) + '.view';
    if (Not(Pagename)) Pagename = dropIfRight(CStr(Viewname), '.view', true) + '.page';

    if (isEmpty(Projectname) || isEmpty(Viewname)) { return Stop('edv ProjectName {pageName} viewname'); }
    if (await JSB_ODB_OPEN('', CStr(Projectname), activeProcess.At_File, function (_At_File) { activeProcess.At_File = _At_File })); else return Stop(At(-1), 'File/Project ', Projectname, ' not found');

    if (Left(LCase(Viewname), 5) == 'view_') {
        if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', Projectname), CStr(Viewname), function (_Dataset) { Dataset = _Dataset })); else Viewname = Mid1(Viewname, 6);
    }

    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', Projectname), CStr(Viewname), function (_Dataset) { Dataset = _Dataset })); else {
        Ans = await JSB_BF_MSGBOX('Warning', 'The view ' + CStr(Viewname) + ' does not exist, do you want to create it?', '*Yes,No');
        if (Ans != 'Yes') { if (CBool(Frompage)) return At_Response.Redirect(Frompage); else return; }
        Dataset = await JSB_MDL_CREATENEWVIEW(Viewname, function (_Viewname) { Viewname = _Viewname });
        if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', Projectname), CStr(Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
        await JSB_MDL_REGENPAGEMODEL_Sub(Projectname, Pagename, false);
    }

    Originaldb = Account();
    if (CBool(Dataset.attachdb)) { if (await JSB_ODB_ATTACHDB(CStr(Dataset.attachdb))); else null; }
    await JSB_MDL_EDITVIEWMODEL_Sub(Projectname, Pagename, Viewname, !isEmpty(Frompage), function (_Projectname, _Pagename, _Viewname, _P4) { Projectname = _Projectname; Pagename = _Pagename; Viewname = _Viewname });
    if (await JSB_ODB_ATTACHDB(CStr(Originaldb))); else null;

    if (CBool(Frompage)) return At_Response.Redirect(Frompage); else Println(clearScreen());
    if (CBool(_Closewindow) || !hasParentProcess()) At_Server.End();
    return;
}
// </EDV_Pgm>

// <EDV_PICK_Pgm>
async function JSB_MDL_EDV_PICK_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Fromurl, Fromvalue, Restful_Result, Projectname, Viewname;
    var Frompage, Pagename, Title, Dataset, Originaldb, R, Cb;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Fromurl = JSB_BF_PARAMVAR('FROMURL', CStr(1)); Fromvalue = JSB_BF_PARAMVAR('FROMVALUE', CStr(2));
                // %options aspxC-

                Projectname = paramVar('projectName');
                if (isEmpty(Fromvalue)) Viewname = ''; else Viewname = dropIfRight(CStr(Fromvalue), '.view', true) + '.view';
                Frompage = paramVar('fromPage');

                Pagename = paramVar('pageName');
                if (Not(Pagename)) Pagename = dropIfRight(CStr(Viewname), '.view', true) + '.page';

                if (isEmpty(Projectname)) return Stop('edv_pick ProjectName viewname');
                if (await JSB_ODB_OPEN('', CStr(Projectname), activeProcess.At_File, function (_At_File) { activeProcess.At_File = _At_File })); else return Stop(At(-1), 'File/Project ', Projectname, ' not found');

                if (isEmpty(Viewname)) {
                    Title = 'new view';

                    do {
                        Viewname = Trim(await JSB_BF_INPUTBOX(Title, 'Enter a new name', CStr(Viewname), '80%', '', function (_Title) { Title = _Title }));
                        if (Viewname == Chr(27) || isEmpty(Viewname)) return At_Response.redirect('close_html?pick=' + urlEncode(Fromvalue));
                        Viewname = dropIfRight(CStr(Viewname), '.view', true) + '.view';
                        if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', Projectname), CStr(Viewname), function (_Dataset) { Dataset = _Dataset })); else break;
                        Title = 'View already exists!';
                    }
                    while (1);

                    Dataset = await JSB_MDL_CREATENEWVIEW(Viewname, function (_Viewname) { Viewname = _Viewname });
                    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', Projectname), CStr(Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
                    await JSB_MDL_REGENPAGEMODEL_Sub(Projectname, Pagename, false);
                } else {
                    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', Projectname), CStr(Viewname), function (_Dataset) { Dataset = _Dataset })); else { Dataset = await JSB_MDL_CREATENEWVIEW(Viewname, function (_Viewname) { Viewname = _Viewname }); }
                }

                Originaldb = Account();
                if (CBool(Dataset.attachdb)) { if (await JSB_ODB_ATTACHDB(CStr(Dataset.attachdb))); else null; }
                await JSB_MDL_EDITVIEWMODEL_Sub(Projectname, Pagename, (Viewname), true, function (_Projectname, _Pagename, _P3, _P4) { Projectname = _Projectname; Pagename = _Pagename });
                if (await JSB_ODB_ATTACHDB(CStr(Originaldb))); else null;

                return At_Response.redirect('close_html?pick=' + urlEncode(Viewname));

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </EDV_PICK_Pgm>

// <ENABLEDHTMLEDITING>
async function JSB_MDL_ENABLEDHTMLEDITING(ByRef_Backdrophtml, ByRef_Niceditid, setByRefValues) {
    // local variables
    var S;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Backdrophtml, ByRef_Niceditid)
        return v
    }
    ByRef_Backdrophtml = JSB_HTML_NICEDITOR(CStr(ByRef_Niceditid), CStr(ByRef_Backdrophtml), CStr(2));

    ByRef_Backdrophtml = CStr(ByRef_Backdrophtml) + html('\<input id=\'' + CStr(ByRef_Niceditid) + '_ViewProps\' name=\'' + CStr(ByRef_Niceditid) + '_formBtn\' type=\'submit\' value=\'ViewProps\' style=\'display:none\'/\>' + crlf);
    ByRef_Backdrophtml = CStr(ByRef_Backdrophtml) + html('\<input id=\'' + CStr(ByRef_Niceditid) + '_PageProps\' name=\'' + CStr(ByRef_Niceditid) + '_formBtn\' type=\'submit\' value=\'PageProps\' style=\'display:none\'/\>' + crlf);
    ByRef_Backdrophtml = CStr(ByRef_Backdrophtml) + html('\<input id=\'' + CStr(ByRef_Niceditid) + '_RstBak\' name=\'' + CStr(ByRef_Niceditid) + '_formBtn\' type=\'submit\' value=\'RstBak\' style=\'display:none\'/\>' + crlf);
    ByRef_Backdrophtml = CStr(ByRef_Backdrophtml) + html('\<input id=\'' + CStr(ByRef_Niceditid) + '_SavBak\' name=\'' + CStr(ByRef_Niceditid) + '_formBtn\' type=\'submit\' value=\'SavBak\' style=\'display:none\'/\>' + crlf);

    // Create context menu on background BOBlock
    S = '$(document).on(\'contextmenu\', \'#x_' + CStr(ByRef_Niceditid) + '\', function (e) { return ' + CStr(ByRef_Niceditid) + '_myMenu(e, this) });';
    S = Replace(S, -1, 0, 0, '');
    S = Replace(S, -1, 0, 0, 'var nicEditorEnabled = false;');
    S = Replace(S, -1, 0, 0, 'function ' + CStr(ByRef_Niceditid) + '_myMenu(e) {');
    S = Replace(S, -1, 0, 0, '   if ($(\'#' + CStr(ByRef_Niceditid) + '_myNicPanel\').is(\':visible\')) return true;');
    S = Replace(S, -1, 0, 0, '   var cMenu = $(\'\<ul id=\\\'contextMenu\\\' /\>\');');
    S = Replace(S, -1, 0, 0, '   if (nicEditorEnabled) {');
    S = Replace(S, -1, 0, 0, '       $(cMenu).append(\'\<li onClick=\\\'' + CStr(ByRef_Niceditid) + '_SaveBackground()\\\'\>Save Changes\</li\>\');');
    S = Replace(S, -1, 0, 0, '   } else {');
    S = Replace(S, -1, 0, 0, '       $(cMenu).append(\'\<li onClick=\\\'' + CStr(ByRef_Niceditid) + '_ViewProps()\\\'\>View Properties\</li\>\');');
    S = Replace(S, -1, 0, 0, '       $(cMenu).append(\'\<li onClick=\\\'' + CStr(ByRef_Niceditid) + '_PageProps()\\\'\>Page Properties\</li\>\');');
    S = Replace(S, -1, 0, 0, '       $(cMenu).append(\'\<li\>\<br/\>\</li\>\');');
    S = Replace(S, -1, 0, 0, '       $(cMenu).append(\'\<li onClick=\\\'' + CStr(ByRef_Niceditid) + '_EnableEdit()\\\'\>Edit HTML\<br /\>\</li\>\');');
    S = Replace(S, -1, 0, 0, '       $(cMenu).append(\'\<li onClick=\\\'' + CStr(ByRef_Niceditid) + '_ResetBackground()\\\'\>Reset HTML\<br /\>\</li\>\');');
    S = Replace(S, -1, 0, 0, '   }');
    S = Replace(S, -1, 0, 0, '   return jsbContentMenu(e, cMenu)');
    S = Replace(S, -1, 0, 0, '}');
    S = Replace(S, -1, 0, 0, 'function ' + CStr(ByRef_Niceditid) + '_SaveBackground() { $(\'#' + CStr(ByRef_Niceditid) + '_SavBak\').click(); }');
    S = Replace(S, -1, 0, 0, 'function ' + CStr(ByRef_Niceditid) + '_ResetBackground() { $(\'#' + CStr(ByRef_Niceditid) + '_RstBak\').click(); }');
    S = Replace(S, -1, 0, 0, 'function ' + CStr(ByRef_Niceditid) + '_EnableEdit() { nicEditorEnabled = true; ' + CStr(ByRef_Niceditid) + '_EnableEditing() }');
    S = Replace(S, -1, 0, 0, 'function ' + CStr(ByRef_Niceditid) + '_ViewProps() { $(\'#' + CStr(ByRef_Niceditid) + '_ViewProps\').click(); }');
    S = Replace(S, -1, 0, 0, 'function ' + CStr(ByRef_Niceditid) + '_PageProps() { $(\'#' + CStr(ByRef_Niceditid) + '_PageProps\').click(); }');

    return exit(CStr(ByRef_Backdrophtml) + JSB_HTML_SCRIPT(CStr(S)));
}
// </ENABLEDHTMLEDITING>

// <EXCELUPLOAD_Pgm>
async function JSB_MDL_EXCELUPLOAD_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    var Frompage = queryVar('fromPage');
    var Rolemsg = (JSB_BF_ISAUTHENTICATED() ? '' : 'You must be logged in to view this page. ' + Anchor(LoginUrl(), 'Click here to login'));
    if (!(await JSB_BF_ISEMPLOYEE())) return Stop((Rolemsg ? Rolemsg : 'You must be at least an employee to view this page.'));

    var Centerviewvars = { "showAddRmvViews": true, "fromParentPage": 'ExcelUpload.page', "parentMultiView": '', "lastView": true };
    await JSB_MDL_VIEW_EXCELUPLOAD_SETUP_Sub(Centerviewvars, undefined, undefined, undefined, function (_Centerviewvars) { Centerviewvars = _Centerviewvars });

    if (isPostBack()) {
        // Figure out what the user clicked
        var Pagebtn = formVar('pageBtn');
        var Columnid = Field(formVar('contextMenuVal'), ':', 2);
        if (Left(Columnid, 4) == 'LBL_') Columnid = Mid1(Columnid, 5);
        if (Left(Columnid, 4) == 'ctl_') Columnid = Mid1(Columnid, 5);

        // Unload the form elements
        await JSB_MDL_VIEW_EXCELUPLOAD_UNLOAD_Sub(Centerviewvars);

        // Process the user command
        await JSB_MDL_VIEW_EXCELUPLOAD_CHECKCOMMANDS_Sub(Centerviewvars, Pagebtn, Columnid);
    }

    Print(At(-1)); // Clears output & reset activePage internal variable
    Print(JSB_HTML_STYLE('    \r\n\
    .form-control-label {\r\n\
        word-break: break-word;\r\n\
        white-space: normal;\r\n\
        max-height: 45px;\r\n\
        font-size: 11px;\r\n\
    }'));

    // Build and output HTML in user's theme
    Print(await JSB_THEMES_THEME_IFWIS('mdl', 'ExcelUpload', await JSB_MDL_DISPLAY_EXCELUPLOAD(Centerviewvars)));

    // We will stop here, and wait for the user to click on something
    return;
}
// </EXCELUPLOAD_Pgm>

// <EXCELUPLOAD_CUSTOMMENU_Sub>
async function JSB_MDL_EXCELUPLOAD_CUSTOMMENU_Sub(ByRef__Menubar, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Menubar)
        return v
    }
    // Placeholder
    return exit();
}
// </EXCELUPLOAD_CUSTOMMENU_Sub>

// <FETCHVIEWCOLUMNS_Pgm>
async function JSB_MDL_FETCHVIEWCOLUMNS_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Projectname, Viewname, _Search, Nd, Rows, Page, Sidx, Sord;
    var Searchfield, Searchoper, Searchstring, Restful_Result;
    var Preventtimeout, Dataset, R, Cb;

    var Restful_Result;
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Projectname = JSB_BF_PARAMVAR('PROJECTNAME', CStr(1)); Viewname = JSB_BF_PARAMVAR('VIEWNAME', CStr(2)); _Search = JSB_BF_PARAMVAR('_SEARCH', CStr(3)); Nd = JSB_BF_PARAMVAR('ND', CStr(4)); Rows = JSB_BF_PARAMVAR('ROWS', CStr(5)); Page = JSB_BF_PARAMVAR('PAGE', CStr(6)); Sidx = JSB_BF_PARAMVAR('SIDX', CStr(7)); Sord = JSB_BF_PARAMVAR('SORD', CStr(8)); Searchfield = JSB_BF_PARAMVAR('SEARCHFIELD', CStr(9)); Searchoper = JSB_BF_PARAMVAR('SEARCHOPER', CStr(10)); Searchstring = JSB_BF_PARAMVAR('SEARCHSTRING', CStr(11));
                // %options aspxC-
                Preventtimeout = System(56);
                Viewname = dropIfRight(CStr(Viewname), '.view', true) + '.view';
                if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', Projectname), CStr(Viewname), function (_Dataset) { Dataset = _Dataset })); else { Restful_Result = { "errors": activeProcess.At_Errors }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto; }
                Restful_Result = { "page": 1, "total": 1, "records": Len(Dataset.columns), "rows": Dataset.columns }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto;

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </FETCHVIEWCOLUMNS_Pgm>

// <FINDBTNI>
async function JSB_MDL_FINDBTNI(ByRef_Objectmodel, ByRef_Btntext, setByRefValues) {
    // local variables
    var I;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Objectmodel, ByRef_Btntext)
        return v
    }
    // %options aspxC-

    var _ForEndI_1 = UBound(ByRef_Objectmodel.custombtns);
    for (I = 1; I <= _ForEndI_1; I++) {
        if (Null0(ByRef_Objectmodel.custombtns[I].buttontxt) == Null0(ByRef_Btntext)) return exit(I);
    }
    Println(Alert('unable to find button ' + CStr(ByRef_Btntext))); debugger;
    return exit(0);
}
// </FINDBTNI>

// <FINDVIEWCOLUMN>
async function JSB_MDL_FINDVIEWCOLUMN(ByRef_Dataset, Columnid, setByRefValues) {
    // local variables
    var Vcolumns, Nicecolumnid, Columnidx, Viewrow, Vname;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Dataset)
        return v
    }
    // %options aspxC-

    Vcolumns = ByRef_Dataset.columns;
    Columnid = LCase(Columnid);
    if (Left(Columnid, 7) == 'ctllbl_') Columnid = Mid1(Columnid, 8);
    Nicecolumnid = JSB_BF_NICENAME(CStr(Columnid));
    var _ForEndI_2 = Len(Vcolumns);
    for (Columnidx = 1; Columnidx <= _ForEndI_2; Columnidx++) {
        Viewrow = Vcolumns[Columnidx];
        Vname = LCase(Viewrow.name);
        if (Null0(Vname) == Null0(Columnid) || JSB_BF_NICENAME(CStr(Vname)) == Nicecolumnid) return exit(Columnidx);
    }
    return exit(0);
}
// </FINDVIEWCOLUMN>

// <FORMATCD>
async function JSB_MDL_FORMATCD(ByRef_Cd, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Cd)
        return v
    }
    // %options aspxC-

    // Loop while instr(cd, AM():AM()) do
    // cd = replace(cd, AM():AM(), AM())
    // repeat

    ByRef_Cd = ChangeI(ByRef_Cd, am + 'end func' + am, am + 'End Func' + am + am);
    ByRef_Cd = ChangeI(ByRef_Cd, am + 'end sub' + am, am + 'End Sub' + am + am);
    ByRef_Cd = ChangeI(ByRef_Cd, am + 'end program' + am, am + 'End Program' + am + am);
    ByRef_Cd = ChangeI(ByRef_Cd, am + 'end function' + am, am + 'End Function' + am + am);
    ByRef_Cd = ChangeI(ByRef_Cd, am + 'end subroutine' + am, am + 'End Subroutine' + am + am);

    return exit(ByRef_Cd);
}
// </FORMATCD>

// <FORMURL>
async function JSB_MDL_FORMURL(Url, Addoutputs, Outputfields, Passparams, Addnewrec, Addfrompage) {
    // local variables
    var Insidequotes, Sep;

    // %options aspxC-

    Url = '\'' + dropIfRight(CStr(Url), '.page');
    Insidequotes = true;

    if (InStr1(1, Url, '?')) Sep = ('&'); else Sep = '?';

    if (CBool(Addoutputs) && CBool(Outputfields)) {
        if (Not(Insidequotes)) { Url += ':\''; Insidequotes = true; }
        Url += CStr(Sep) + Mid1(await JSB_MDL_URLOUTPUTPARAMS(Outputfields, function (_Outputfields) { Outputfields = _Outputfields }), 2);
        Sep = ('&');
    }

    if (CBool(Addnewrec)) {
        if (Not(Insidequotes)) { Url += ':\''; Insidequotes = true; }
        Url += CStr(Sep) + 'newRecord=1';
    }

    if (CBool(Addfrompage)) {
        if (Not(Insidequotes)) { Url += ':\''; Insidequotes = true; }
        Url += CStr(Sep) + 'fromPage=\':@Url';
        Insidequotes = false;
        Sep = ('&');
    }

    if (CBool(Passparams)) {
        if (CBool(Insidequotes)) { Url += '\':'; Insidequotes = false; }
        Url += 'iif(@QueryString, \'' + CStr(Sep) + '\':Replace(Replace(@QueryString, "newRecord=1", ""), "&&", "&"), \'\')';
    }

    if (CBool(Insidequotes)) Url += '\'';
    return Url;
}
// </FORMURL>

// <FORMVIEWNCOLUMNS>
async function JSB_MDL_FORMVIEWNCOLUMNS(Projectname, Objectmodel, Dokobinding, Userow, Viewname) {
    // local variables
    var Ci, Callname, Ctllabel, Additionalattrs, Dataref, Pickurl;

    var Ctlhtml = undefined;
    var Column = undefined;
    var Modelcolumns = undefined;

    var _Html = [undefined,];
    if (Not(Userow)) { Userow = {} }

    var Style = '';
    if (CBool(Objectmodel.forecolor)) { Style += 'color:' + CStr(Objectmodel.forecolor) + '; '; }
    if (CBool(Objectmodel.backcolor)) { Style += 'background-color:' + CStr(Objectmodel.backcolor) + '; '; }
    if (CBool(Objectmodel.font)) { Style += 'font-family:' + CStr(Objectmodel.font) + '; '; }
    if (CBool(Objectmodel.fontsize)) { Style += 'font-size:' + CStr(Objectmodel.fontsize) + '; '; }
    if (Objectmodel.boxed == 'solid' || Objectmodel.boxed == 'dashed') {
        Style += 'border-style:' + CStr(Objectmodel.boxed) + '; border-width:1px;';
    } else if (Objectmodel.boxed == 'double') {
        Style += 'border-style:double; border-width:3px;';
    } else if (Objectmodel.boxed != 'none' && !isEmpty(Objectmodel.boxed)) {
        Style += 'border-style:' + CStr(Objectmodel.boxed) + '; border-width:4px;';
    }
    if (Style) Style = ' style=\'' + Style + '\'';

    var Startedformgrouprow = false;
    var Startedcollaspe = false;
    Modelcolumns = await JSB_MDL_DROPGRIDCOLUMNS(Objectmodel.columns);

    Ci = LBound(Modelcolumns) - 1;
    for (Column of iterateOver(Modelcolumns)) {
        Ci++;
        if (isEmpty(Column.control)) Column.control = 'textbox';
        if (isEmpty(Column.name)) Column.name = 'no id';

        if (Column.display != 'hidden') {
            if (CBool(Column.collaspestart)) {
                if (Startedformgrouprow) _Html[_Html.length] = html('\</div\>');

                _Html[_Html.length] = (html('\<div class="collase_block"\>\<div class="collase_header" onclick="$(this).next().slideToggle();"\>&#8681;&nbsp;' + htmlEscape(Column.collaspestart) + '&nbsp;&#8681;\</div\>'));
                if (CBool(Column.collaspopen)) {
                    _Html[_Html.length] = html('\<div class="collase_content"\>');
                } else {
                    _Html[_Html.length] = html('\<div class="collase_content" style="display: none"\>');
                }

                Startedformgrouprow = false;
                Startedcollaspe = true;
            } else {
                if (CBool(Column.newlineprefix) || CBool(Column.fullline)) {
                    if (Startedformgrouprow) _Html[_Html.length] = html('\</div\>');
                    Startedformgrouprow = false;
                }
            }

            if (!Startedformgrouprow) {
                _Html[_Html.length] = html('\<div class="form-group row"' + Style + '\>');
                Startedformgrouprow = true;
            }

            Callname = LCase(Column.control);
            Ctllabel = Column.label;
            if (Not(Ctllabel)) Ctllabel = Column.name;
            var Nicecolumnname = JSB_BF_NICENAME(CStr(Column.name));

            if (Left(Callname, 4) != 'ctl_') Callname = 'ctl_' + CStr(Callname);
            Callname = 'jsb_ctls.' + CStr(Callname);
            if (CBool(Column.ctlstyle)) { Additionalattrs = { "style": Column.ctlstyle } } else Additionalattrs = [undefined,];
            if (CBool(Column.encrypt)) Dataref = 'decode(xts(Row["' + CStr(Column.name) + '"]))'; else Dataref = 'Row["' + CStr(Column.name) + '"]';

            await asyncCallByName(Callname, me, 0 /*ignore if missing */, Projectname, Nicecolumnname, Column, Userow, Ctlhtml, Dokobinding, Additionalattrs, false, Viewname, function (_Ctlhtml) { Ctlhtml = _Ctlhtml });

            if (CBool(Column.pickfunction)) {
                if (InStr1(1, Column.pickfunction, '.page')) Pickurl = dropRight(CStr(Column.pickfunction), '.page'); else Pickurl = Column.pickfunction;
                Pickurl = Change(Pickurl, '{projectname}', urlEncode(Projectname));
                // If !Instr(PickURL, "//") And Left(PickURL, 1) <> "." and Left(PickURL, 1) <> "/" Then PickURL = "./":PickURL
                Ctlhtml = addPick(Ctlhtml, Nicecolumnname, Pickurl, '80%', '90%', Pickurl, Column.autopostback);
            }

            if (Callname == 'ctl_json_inline') {
                Ctlhtml = Change(Ctlhtml, 'mdlctl', 'nstctl');
                Ctlhtml = Change(Ctlhtml, ' id="LBL_', ' id="lbln_');

                if (CBool(Column.suppresslabel)) {
                    _Html[_Html.length] = html('\<mdlctl id=\'ctl_' + Nicecolumnname + '\' style=\'width: 100%\'\>') + CStr(Ctlhtml) + html('\</mdlctl\>');
                } else {
                    _Html[_Html.length] = lblCtlSet(CStr(Ctllabel), CStr(Ctlhtml), Nicecolumnname, CNum(Column.fullline), CNum(Column.suppresslabel), CStr(Column.lblstyle));
                }
            } else {
                _Html[_Html.length] = lblCtlSet(CStr(Ctllabel), CStr(Ctlhtml), Nicecolumnname, CNum(Column.fullline), CNum(Column.suppresslabel), CStr(Column.lblstyle));
            }

            if (CBool(Column.collaspeend) && Startedcollaspe) {
                if (Startedformgrouprow) _Html[_Html.length] = html('\</div\>');
                _Html[_Html.length] = html('\</div\>\</div\>'); // Collase_block, Collase_content
                Startedformgrouprow = false;
                Startedcollaspe = false;
            }
        }
    }

    if (Startedformgrouprow) {
        _Html[_Html.length] = html('\</div\>');
        Startedformgrouprow = false;
    }

    return Join(_Html, '');
}
// </FORMVIEWNCOLUMNS>

// <FULLLINECOLUMN_Sub>
async function JSB_MDL_FULLLINECOLUMN_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, setByRefValues) {
    // local variables
    var Dataset, Columnidx;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid)
        return v
    }
    // %options aspxC-
    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);
    Columnidx = await JSB_MDL_FINDVIEWCOLUMN(Dataset, ByRef_Columnid, function (_Dataset) { Dataset = _Dataset });
    if (Null0(Columnidx) == '0') return exit(undefined);
    Dataset.columns[Columnidx].fullline = Not(Dataset.columns[Columnidx].fullline);
    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edc-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </FULLLINECOLUMN_Sub>

// <GENERATECODEFROMTEMPLATE>
async function JSB_MDL_GENERATECODEFROMTEMPLATE(ByRef_Projectname, Templatefilename, ByRef_Parentobjectname, ByRef_Parentobject, ByRef_Objectname, ByRef_Results, ByRef_Compileresults, Nomodelingstuff, setByRefValues) {
    // local variables
    var Objectmodel, Templatename, Template, Templatejson, Templatefield;
    var _Code, Codename, Errors;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Parentobjectname, ByRef_Parentobject, ByRef_Objectname, ByRef_Results, ByRef_Compileresults)
        return v
    }
    // %options aspxC-

    Templatefilename = LCase(await JSB_BF_TRUEFILENAME(CStr(Templatefilename)));

    if (!(await JSB_BF_ISMANAGER())) {
        ByRef_Compileresults = '^You must be in the manager role or higher to generate templates';
        return exit(false);
    }

    if (await JSB_ODB_READJSON(Objectmodel, await JSB_BF_FHANDLE('dict', ByRef_Projectname), CStr(ByRef_Objectname), function (_Objectmodel) { Objectmodel = _Objectmodel })); else {
        ByRef_Compileresults = '^GenerateCodeFromTemplate ' + CStr(ByRef_Projectname) + ' ' + CStr(ByRef_Objectname) + ' not found.';
        return exit(false);
    }

    Templatename = LCase(Objectmodel.templateName);
    if (Not(Templatename)) {
        ByRef_Compileresults = '^GenerateCodeFromTemplate: Your \'' + CStr(ByRef_Objectname) + '\' is missing a templateName field.' + CStr(Objectmodel, true);

        if (CBool(ByRef_Parentobject)) ByRef_Results = CStr(ByRef_Results) + 'This is coming from an embedded template "' + CStr(ByRef_Parentobject.templateName) + '"';
        return exit(false);
    }

    if (await JSB_ODB_READ(Template, await JSB_BF_FHANDLE(CStr(Templatefilename)), CStr(Templatename), function (_Template) { Template = _Template })); else {
        ByRef_Compileresults = '^GenerateCodeFromTemplate: Your \'' + CStr(ByRef_Objectname) + '\' has an unknown template reference: \'' + CStr(Templatename) + '\' from fHandle(' + CStr(Templatefilename) + ')';
        if (CBool(ByRef_Parentobject)) ByRef_Compileresults += 'This is coming from an embedded template ' + CStr(ByRef_Parentobject.templateName);
        return exit(false);
    }

    Templatejson = Field(Template, '******************************************************************************', 1, true);
    Template = Mid1(Template, activeProcess.Col2);
    if (InStr1(1, Template, '`')) {
        ByRef_Compileresults = '^Your template ' + CStr(Templatename) + ' is using the ` character.  You need change this.';
        return exit(false);
    }

    // Make sure that all of the defaults from this template exist in the objectModel
    Templatejson = parseJSON('[' + CStr(Templatejson) + ']');
    for (Templatefield of iterateOver(Templatejson)) {
        if (CBool(Templatefield.name) && CBool(Templatefield.defaultvalue)) {
            if (!HasTag(Objectmodel, Templatefield.name)) Objectmodel[Templatefield.name] = Templatefield.defaultvalue;
        }
    }

    if (CBool(ByRef_Parentobject)) {
        // process view
        _Code = [undefined, 'Function genCodeStubView(ProjectName, pageName, pageModel, viewName, viewModel, TemplateFileName, Errors, noModelingStuff)' + am];
        Codename = 'genCodeStubView';
    } else {
        // process page
        _Code = [undefined, 'Function genCodeStubPage(ProjectName, pageName, pageModel, TemplateFileName, Errors, noModelingStuff)' + am];
        Codename = 'genCodeStubPage';
    }

    _Code[_Code.length] = 'Gen = []';

    if (Templatefilename == 'jsb_viewtemplates') {
        if (CBool(ByRef_Parentobject)) _Code[_Code.length] = 'pageTemplateName = "' + LCase(Objectmodel.templateName) + '"';
        _Code[_Code.length] = 'viewTemplateName = "' + CStr(Templatename) + '"';;
    } else if (Templatefilename == 'jsb_pagetemplates') {
        _Code[_Code.length] = 'pageTemplateName = "' + CStr(Templatename) + '"';;
    } else {
        _Code[_Code.length] = 'TemplateName = "' + CStr(Templatename) + '"';
    }

    await JSB_MDL_PROCESSTEMPLATE_Sub(_Code, Templatefilename, Templatename, Template, function (__Code) { _Code = __Code });

    _Code[_Code.length] = 'Gen = Join(Gen, \'\')';

    _Code[_Code.length] = 'Return Gen';
    _Code[_Code.length] = 'End Function';
    _Code = Join(_Code, am);

    if (await JSB_ODB_WRITE(CStr(_Code), await JSB_BF_FHANDLE('TMP'), CStr(Codename))); else return Stop(At(-1), 'Modeler-', System(28), ': ', activeProcess.At_Errors);
    await asyncTclExecute('Basic TMP ' + CStr(Codename), _capturedData => ByRef_Compileresults = _capturedData)
    ByRef_Compileresults = 'Generating ' + CStr(ByRef_Projectname) + ' ' + CStr(ByRef_Objectname) + crlf + Change(ByRef_Compileresults, am, crlf);

    if (InStr1(1, ByRef_Compileresults, '^') || InStr1(1, ByRef_Compileresults, 'You must be an administrator')) {
        ByRef_Compileresults = 'Compiler error: Basic TMP ' + CStr(Codename) + crlf + CStr(ByRef_Compileresults) + crlf;
        ByRef_Compileresults += anchorEdit(CStr(Templatefilename), CStr(Templatename));
        return exit(false);
    }

    ByRef_Compileresults += anchorEdit(CStr(ByRef_Projectname), dropIfRight(CStr(ByRef_Objectname), '.page'));

    if (CBool(ByRef_Parentobject)) {
        ByRef_Results = await TMP_GENCODESTUBVIEW(ByRef_Projectname, ByRef_Parentobjectname, ByRef_Parentobject, ByRef_Objectname, Objectmodel, Templatefilename, Errors, Nomodelingstuff, function (_ByRef_Projectname, _ByRef_Parentobjectname, _ByRef_Parentobject, _ByRef_Objectname, _Objectmodel, _Templatefilename, _Errors, _Nomodelingstuff) { ByRef_Projectname = _ByRef_Projectname; ByRef_Parentobjectname = _ByRef_Parentobjectname; ByRef_Parentobject = _ByRef_Parentobject; ByRef_Objectname = _ByRef_Objectname; Objectmodel = _Objectmodel; Templatefilename = _Templatefilename; Errors = _Errors; Nomodelingstuff = _Nomodelingstuff });
    } else {
        ByRef_Results = await TMP_GENCODESTUBPAGE(ByRef_Projectname, ByRef_Objectname, Objectmodel, Templatefilename, Errors, Nomodelingstuff, function (_ByRef_Projectname, _ByRef_Objectname, _Objectmodel, _Templatefilename, _Errors, _Nomodelingstuff) { ByRef_Projectname = _ByRef_Projectname; ByRef_Objectname = _ByRef_Objectname; Objectmodel = _Objectmodel; Templatefilename = _Templatefilename; Errors = _Errors; Nomodelingstuff = _Nomodelingstuff });
    }

    if (CBool(Errors)) {
        ByRef_Compileresults = Errors;
        return exit(false);
    }

    return exit(true);
}
// </GENERATECODEFROMTEMPLATE>

// <GETCOLUMNDEFINITIONS>
async function JSB_MDL_GETCOLUMNDEFINITIONS(Tblid_Or_Sql, ByRef_Columnnames, setByRefValues) {
    // local variables
    var Isselect, Tablecolumns, Column;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Columnnames)
        return v
    }
    // %options aspxC-

    // Get the schemaColumns
    Isselect = LCase(Left(Tblid_Or_Sql, 7)) == 'select ';
    if (CBool(Isselect)) {
        Tablecolumns = await JSB_BF_GETSELECTCOLUMNDEFS(CStr(Tblid_Or_Sql));
    } else {
        Tablecolumns = await JSB_BF_GETTABLECOLUMNDEFS(CStr(Tblid_Or_Sql), CStr(false), false);
    }

    if (HasTag(Tablecolumns[LBound(Tablecolumns)], 'Oridinal')) Tablecolumns = Sort(Tablecolumns, 'Oridinal');
    if (HasTag(Tablecolumns[LBound(Tablecolumns)], 'oridinal')) Tablecolumns = Sort(Tablecolumns, 'oridinal');

    ByRef_Columnnames = [undefined,];
    for (Column of iterateOver(Tablecolumns)) {
        ByRef_Columnnames[ByRef_Columnnames.length] = Column.name;
    }

    return exit(Tablecolumns);
}
// </GETCOLUMNDEFINITIONS>

// <GETDISTINCTVALUES>
async function JSB_MDL_GETDISTINCTVALUES(ByRef_Tblid_Or_Sql, ByRef_Field, ByRef_Limitno, ByRef_Datatype, setByRefValues) {
    // local variables
    var Isselect, Top, Sqlselect, Ss, F, Usename, Tmptblname, Keys;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tblid_Or_Sql, ByRef_Field, ByRef_Limitno, ByRef_Datatype)
        return v
    }
    // %options aspxC-

    Isselect = LCase(Left(ByRef_Tblid_Or_Sql, 7)) == 'select ';
    if (CBool(ByRef_Limitno)) Top = 'Top ' + CStr(ByRef_Limitno); else Top = '';

    if (CBool(Isselect)) {
        Sqlselect = 'Select ' + CStr(Top) + ' Distinct [' + CStr(ByRef_Field) + '] From ' + Mid1(ByRef_Tblid_Or_Sql, InStrI1(1, ByRef_Tblid_Or_Sql, ' from ') + 1);
        if (await asyncDNOSqlSelect(Sqlselect, _selectList => Ss = _selectList)); else { Alert(CStr(activeProcess.At_Errors)); return exit([undefined,]); }
    } else {
        if (await JSB_ODB_OPEN('', CStr(ByRef_Tblid_Or_Sql), F, function (_F) { F = _F })); else { Alert(CStr(activeProcess.At_Errors)); return exit([undefined,]); }

        if (isSqlServer(F)) {
            Usename = ByRef_Tblid_Or_Sql;
            if (await JSB_BF_DBVIEWEXISTS(Usename, undefined, function (_Usename) { Usename = _Usename })) {
                Tmptblname = '##dview_' + CStr(ByRef_Tblid_Or_Sql) + '_' + JSB_BF_NICENAME(UserName());
                if (await JSB_ODB_OPEN('', CStr(Tmptblname), F, function (_F) { F = _F })) Usename = Tmptblname;
            }

            Sqlselect = 'Select distinct ' + CStr(Top) + ' [' + CStr(ByRef_Field) + '] From ' + Mid1(Usename, InStrI1(1, Usename, ' from ') + 1);
            if (await asyncDNOSqlSelect(Sqlselect, _selectList => Ss = _selectList)); else { Alert(CStr(activeProcess.At_Errors)); return exit([undefined,]); }
        } else if (ByRef_Field == await JSB_BF_PRIMARYKEYNAME(ByRef_Tblid_Or_Sql)) {
            if (await JSB_ODB_SELECTTO('', F, '', Ss, function (_Ss) { Ss = _Ss })); else { Alert(CStr(activeProcess.At_Errors)); return exit([undefined,]); }
            Keys = getList(Ss);
            return exit(Split(Keys, am));;
        } else {
            if (await JSB_ODB_SELECTTO('distinct ' + CStr(Top) + ' [' + CStr(ByRef_Field) + ']', F, '', Ss, function (_Ss) { Ss = _Ss })); else { Alert(CStr(activeProcess.At_Errors)); return exit([undefined,]); }
        }
    }

    return exit(await JSB_MDL_ORDERDISTINCTVALUES(Ss, ByRef_Field, ByRef_Limitno, 'AI', function (_Ss, _ByRef_Field, _ByRef_Limitno, _P4) { Ss = _Ss; ByRef_Field = _ByRef_Field; ByRef_Limitno = _ByRef_Limitno }));
}
// </GETDISTINCTVALUES>

// <GETDISTINCTYEARS>
async function JSB_MDL_GETDISTINCTYEARS(ByRef_Tblid_Or_Sql, ByRef_Field, ByRef_Limitno, ByRef_Datatype, setByRefValues) {
    // local variables
    var Isselect, Top, Fnc, Sqlselect, Ss, F, Usename, Tmptblname;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tblid_Or_Sql, ByRef_Field, ByRef_Limitno, ByRef_Datatype)
        return v
    }
    // %options aspxC-

    Isselect = LCase(Left(ByRef_Tblid_Or_Sql, 7)) == 'select ';
    if (CBool(ByRef_Limitno)) Top = 'Top ' + CStr(ByRef_Limitno); else Top = '';

    if (ByRef_Datatype == 'date' || ByRef_Datatype == 'time' || ByRef_Datatype == 'datetime') Fnc = 'Year([' + CStr(ByRef_Field) + '])'; else Fnc = '[' + CStr(ByRef_Field) + ']';

    if (CBool(Isselect)) {
        Sqlselect = 'Select distinct ' + CStr(Top) + ' ' + CStr(Fnc) + ' As [' + CStr(ByRef_Field) + '] From ' + Mid1(ByRef_Tblid_Or_Sql, InStrI1(1, ByRef_Tblid_Or_Sql, ' from ') + 1);
        if (await asyncDNOSqlSelect(Sqlselect, _selectList => Ss = _selectList)); else { Alert(CStr(activeProcess.At_Errors)); return exit([undefined,]); }
    } else {
        if (await JSB_ODB_OPEN('', CStr(ByRef_Tblid_Or_Sql), F, function (_F) { F = _F })); else { Alert(CStr(activeProcess.At_Errors)); return exit([undefined,]); }

        if (isSqlServer(F)) {
            Usename = ByRef_Tblid_Or_Sql;
            if (await JSB_BF_DBVIEWEXISTS(Usename, undefined, function (_Usename) { Usename = _Usename })) {
                Tmptblname = '##dview_' + CStr(ByRef_Tblid_Or_Sql) + '_' + JSB_BF_NICENAME(UserName());
                if (await JSB_ODB_OPEN('', CStr(Tmptblname), F, function (_F) { F = _F })) Usename = Tmptblname;
            }

            Sqlselect = 'Select distinct ' + CStr(Top) + ' ' + CStr(Fnc) + ' As [' + CStr(ByRef_Field) + '] From ' + Mid1(Usename, InStrI1(1, Usename, ' from ') + 1);
            if (await asyncDNOSqlSelect(Sqlselect, _selectList => Ss = _selectList)); else { Alert(CStr(activeProcess.At_Errors)); return exit([undefined,]); }
        } else {
            if (await JSB_ODB_OPEN('', CStr(ByRef_Tblid_Or_Sql), F, function (_F) { F = _F })); else { Alert(CStr(activeProcess.At_Errors)); return exit([undefined,]); }
            if (await JSB_ODB_SELECTTO('distinct ' + CStr(Top) + ' ' + CStr(Fnc) + ' As [' + CStr(ByRef_Field) + ']', F, '', Ss, function (_Ss) { Ss = _Ss })); else { Alert(CStr(activeProcess.At_Errors)); return exit([undefined,]); }
        }
    }

    return exit(await JSB_MDL_ORDERDISTINCTVALUES(Ss, ByRef_Field, ByRef_Limitno, 'ND', function (_Ss, _ByRef_Field, _ByRef_Limitno, _P4) { Ss = _Ss; ByRef_Field = _ByRef_Field; ByRef_Limitno = _ByRef_Limitno }));
}
// </GETDISTINCTYEARS>

// <GETEXTRAPAGECOLUMNS_Sub>
async function JSB_MDL_GETEXTRAPAGECOLUMNS_Sub(ByRef_Modelcolumns, ByRef_Pagetemplatename, setByRefValues) {
    // local variables
    var Template, Columns, Xrow;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Modelcolumns, ByRef_Pagetemplatename)
        return v
    }
    // %options aspxC-

    if (await JSB_ODB_READ(Template, await JSB_BF_FHANDLE('JSB_pageTemplates'), CStr(ByRef_Pagetemplatename), function (_Template) { Template = _Template })); else {
        if (!isEmpty(ByRef_Pagetemplatename)) Alert('JSB_pageTemplates Template ' + CStr(ByRef_Pagetemplatename) + ' not found');
        return exit(undefined);
    }

    Columns = Field(Template, '******************************************************************************', 1);
    Columns = Change(Columns, Chr(254), ' ');
    if (!Trim(Columns)) return exit(undefined);
    Columns = parseJSON('[' + CStr(Columns) + ']');
    if (typeOf(Columns) == 'String') {
        Alert('Your JSB_pageTemplates ' + CStr(ByRef_Pagetemplatename) + ' does not have valid JSON');
        return exit(undefined);
    }
    for (Xrow of iterateOver(Columns)) {
        ByRef_Modelcolumns[ByRef_Modelcolumns.length] = Xrow;
    }
    return exit();
}
// </GETEXTRAPAGECOLUMNS_Sub>

// <GETJSONDEFDEFAULTS>
async function JSB_MDL_GETJSONDEFDEFAULTS(ByRef_Jsondef_Id, setByRefValues) {
    // local variables
    var Jsondefs;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Jsondef_Id)
        return v
    }
    // %options aspxC-

    Jsondefs = await JSB_BF_READJSONDEFS('jsb_jsondefs', CStr(ByRef_Jsondef_Id));
    return exit(await JSB_BF_BUILDDEFAULTROW(Jsondefs, undefined, function (_Jsondefs) { Jsondefs = _Jsondefs }));
}
// </GETJSONDEFDEFAULTS>

// <GETROW>
async function JSB_MDL_GETROW(ByRef_Settings, ByRef_Rows, ByRef_Rowi, setByRefValues) {
    // local variables
    var Row, Srcrow, C, Cellvalue;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Settings, ByRef_Rows, ByRef_Rowi)
        return v
    }
    Row = [undefined,];
    Srcrow = ByRef_Rows[ByRef_Rowi];

    if (Null0(ByRef_Settings.State) == STATE_LOOKINGFORHEADER) {
        ByRef_Settings.FirstC = 1;
        ByRef_Settings.LastC = UBound(Srcrow);
    }

    var _ForEndI_2 = CNum(ByRef_Settings.LastC);
    for (C = CNum(ByRef_Settings.FirstC); (C <= _ForEndI_2) && Null0(C) <= UBound(Srcrow); C++) {
        Cellvalue = Srcrow[C];
        if (CBool(Cellvalue)) {
            if (Null0(ByRef_Settings.State) == STATE_LOOKINGFORHEADER) {
                ByRef_Settings.firstR = ByRef_Rowi;
                ByRef_Settings.FirstC = C;
                ByRef_Settings.State = STATE_PROCESSINGHEADER;
            }

            // Blank cell ?;
        } else if (Null0(ByRef_Settings.State) == STATE_PROCESSINGHEADER) {
            // allow blanks in column header?
            if (CBool(ByRef_Settings.SideBySideTables)) {
                ByRef_Settings.LastC = +C - 1;
                break;
            }
        }

        if (Null0(ByRef_Settings.State) == STATE_PROCESSINGDATA) {
            Row[Row.length] = Cellvalue;;
        } else if (Null0(ByRef_Settings.State) == STATE_PROCESSINGHEADER) {
            Row[Row.length] = CStr(Cellvalue, true);
        }
    }

    return exit(Row);
}
// </GETROW>

// <GETSELECTIONCOLUMNS>
async function JSB_MDL_GETSELECTIONCOLUMNS(ByRef_Viewmodel, ByRef_Cnames, Orderallcolumns, setByRefValues) {
    // local variables
    var Columns, Actualcols, Flatfile, Tfile, Mycolumns, Columnnames;
    var C, Column, Cname, Lcnames, Newcolumn;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Viewmodel, ByRef_Cnames)
        return v
    }
    // %options aspxC-

    ByRef_Cnames = [undefined,];
    Columns = [undefined,];
    Actualcols = [undefined,];

    if (CBool(ByRef_Viewmodel.customsql)) {
        Flatfile = false;
    } else {
        Flatfile = true;
        if (await JSB_ODB_OPEN('', CStr(ByRef_Viewmodel.tableName), Tfile, function (_Tfile) { Tfile = _Tfile })) {
            if (Left(Tfile, 4) == 'ado:') Flatfile = false;
        }
    }

    if (await JSB_ODB_OPEN('', CStr(ByRef_Viewmodel.tableName), Tfile, function (_Tfile) { Tfile = _Tfile })) {
        if (Left(Tfile, 4) == 'ado:') Actualcols = Tfile.ColumnNames;
    }

    if (CBool(Orderallcolumns)) {
        // devExpress Grid uses ordinal for perserving the grid layout.  Make sure the column query order is the same by ordering the selection
        if (CBool(ByRef_Viewmodel.customsql)) {
            Mycolumns = await JSB_MDL_GETCOLUMNDEFINITIONS(ByRef_Viewmodel.customsql, Columnnames, function (_Columnnames) { Columnnames = _Columnnames });
        } else {
            Mycolumns = await JSB_MDL_GETCOLUMNDEFINITIONS(ByRef_Viewmodel.tableName, Columnnames, function (_Columnnames) { Columnnames = _Columnnames });
        }

        for (C of iterateOver(Mycolumns)) {
            C.display = 'visible';
        }
    } else {
        Mycolumns = ByRef_Viewmodel.columns;
    }

    for (Column of iterateOver(Mycolumns)) {
        Cname = Column.field;
        if (Not(Cname)) Cname = Column.name;
        if (CBool(Cname) && Column.display != 'hidden') {
            if (Len(Actualcols)) {
                if (Locate(Cname, Actualcols, 0, 0, 0, "", position => { })) ByRef_Cnames[ByRef_Cnames.length] = '[' + CStr(Cname) + ']';
            } else {
                ByRef_Cnames[ByRef_Cnames.length] = '[' + CStr(Cname) + ']';
            }

            if (isNumeric(Column.width)) {
                Column = clone(Column);
                Column.width = CNum(Column.width) * 8; // Character size to pt size, roughly;
            }
            Columns[Columns.length] = Column;
        }
    }

    Lcnames = LCase(Join(ByRef_Cnames, am));

    // If it's in the output, it must be selected too
    for (Column of iterateOver(ByRef_Viewmodel.outputs)) {
        Cname = Column.field;
        if (Not(Cname)) Cname = Column.name;
        if (CBool(Cname)) {
            if (Locate(LCase(Cname), Lcnames, 0, 0, 0, "", position => { })); else {
                if (Len(Actualcols)) {
                    if (Locate(Cname, Actualcols, 0, 0, 0, "", position => { })) ByRef_Cnames[ByRef_Cnames.length] = '[' + CStr(Cname) + ']';
                } else {
                    ByRef_Cnames[ByRef_Cnames.length] = '[' + CStr(Cname) + ']';
                }

                Lcnames = Replace(Lcnames, -1, 0, 0, LCase(Cname));
                Newcolumn = {};
                Newcolumn.name = Cname;
                Newcolumn.control = 'label';
                Newcolumn.display = 'hidden';
                Columns[Columns.length] = Newcolumn;
            }
        }
    }

    return exit(Columns);
}
// </GETSELECTIONCOLUMNS>

// <GETTABLEPRIMARYKEYCOL>
async function JSB_MDL_GETTABLEPRIMARYKEYCOL(ByRef_Tablecolumns, setByRefValues) {
    // local variables
    var Primarykeyname, Col, Newcolumn;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tablecolumns)
        return v
    }
    // %options aspxC-

    Primarykeyname = '';
    for (Col of iterateOver(ByRef_Tablecolumns)) {
        if (CBool(Col.primarykey)) return exit(Col);
    }

    // Force a primaryKeyCol if none
    Primarykeyname = 'ItemID';
    Newcolumn = { "name": Primarykeyname, "primarykey": true, "datatype": 'string' };
    await JSB_MDL_SETCOLUMNDEFAULTS_Sub(Newcolumn.datatype, Newcolumn, function (_P1, _Newcolumn) { Newcolumn = _Newcolumn });
    return exit(Newcolumn);
}
// </GETTABLEPRIMARYKEYCOL>

// <HASSERVERSIDEPARAMS>
async function JSB_MDL_HASSERVERSIDEPARAMS(ByRef_Viewmodel, setByRefValues) {
    // local variables
    var Row;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Viewmodel)
        return v
    }
    // %options aspxC-

    if (isEmpty(ByRef_Viewmodel.outputs)) return exit(false);
    for (Row of iterateOver(ByRef_Viewmodel.outputs)) {
        if (CBool(Row.scope) && Row.scope != 'UrlParam') return exit(true);
    }
    return exit(false);
}
// </HASSERVERSIDEPARAMS>

// <HIDEVIEWCOLUMN_Sub>
async function JSB_MDL_HIDEVIEWCOLUMN_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, setByRefValues) {
    // local variables
    var Dataset, Columnidx, Vcolumns, Viewrow;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid)
        return v
    }
    // %options aspxC-

    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);
    Columnidx = await JSB_MDL_FINDVIEWCOLUMN(Dataset, ByRef_Columnid, function (_Dataset) { Dataset = _Dataset });
    if (Null0(Columnidx) == '0') return exit(undefined);
    Vcolumns = Dataset.columns;
    Viewrow = Vcolumns[Columnidx];
    Viewrow.display = 'hidden';
    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edc-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </HIDEVIEWCOLUMN_Sub>

// <HIGHESTVIEWINDEX>
async function JSB_MDL_HIGHESTVIEWINDEX(ByRef_Dataset, setByRefValues) {
    // local variables
    var Vcolumns, I, Columnidx, Viewrow;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Dataset)
        return v
    }
    // %options aspxC-

    Vcolumns = ByRef_Dataset.columns;
    I = 0;
    var _ForEndI_1 = Len(Vcolumns);
    for (Columnidx = 1; Columnidx <= _ForEndI_1; Columnidx++) {
        Viewrow = Vcolumns[Columnidx];
        if (Null0(Viewrow.index) > Null0(I)) I = Viewrow.index;
    }
    return exit(+I + 1);
}
// </HIGHESTVIEWINDEX>

// <ISROWEMPTY>
async function JSB_MDL_ISROWEMPTY(ByRef_Row, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    if (Not(ByRef_Row)) return exit(true);
    return exit(!Trim(Join(ByRef_Row, '')));
}
// </ISROWEMPTY>

// <LABELCOLUMN_Sub>
async function JSB_MDL_LABELCOLUMN_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, setByRefValues) {
    // local variables
    var Dataset, Columnidx, Newvalue;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid)
        return v
    }
    // %options aspxC-
    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);
    Columnidx = await JSB_MDL_FINDVIEWCOLUMN(Dataset, ByRef_Columnid, function (_Dataset) { Dataset = _Dataset });
    if (Null0(Columnidx) == '0') return exit(undefined);
    Newvalue = Trim(await JSB_BF_INPUTBOX('Column Property ' + CStr(ByRef_Columnid), 'Label', CStr(Dataset.columns[Columnidx].label), '80%', 'auto'));
    if (Newvalue == Chr(27)) return exit(undefined);
    Dataset.columns[Columnidx].label = Newvalue;
    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edc-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </LABELCOLUMN_Sub>

// <LBLCTLPAIR>
async function JSB_MDL_LBLCTLPAIR(ByRef__Label, ByRef_Ctlhtml, ByRef_Nicecolumnname, ByRef_Fullline, ByRef_Suppresslabel, ByRef_Lblstyle, setByRefValues) {
    // local variables
    var C1, Lbl, Ctl;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Label, ByRef_Ctlhtml, ByRef_Nicecolumnname, ByRef_Fullline, ByRef_Suppresslabel, ByRef_Lblstyle)
        return v
    }
    // %options aspxC-

    C1 = [undefined,];
    if (CBool(ByRef_Fullline)) {
        if (CBool(ByRef_Suppresslabel)) {
            C1[C1.length] = html('\<div class="lblctlpair_FullLine lblctlpair_FullLine_suppressLabel"\>');
            C1[C1.length] = html('   \<mdlctl id=\'ctl_' + CStr(ByRef_Nicecolumnname) + '\'\>') + CStr(ByRef_Ctlhtml) + html('\</mdlctl\>');
            C1[C1.length] = html('\</div\>');
        } else {
            if (true) {
                Lbl = (html('\<label id=\'LBL_' + CStr(ByRef_Nicecolumnname) + '\' xfor=\'' + CStr(ByRef_Nicecolumnname) + '\' style=\'float: left; overflow:hidden; text-align:right; width: 116px;' + CStr(ByRef_Lblstyle) + '\'\>') + Trim(ByRef__Label) + html('&nbsp;\</label\>'));
                Ctl = html('\<mdlctl id=\'ctl_' + CStr(ByRef_Nicecolumnname) + '\'\>') + CStr(ByRef_Ctlhtml) + html('\</mdlctl\>');
                C1[C1.length] = Cols2('120px', CStr(Lbl), '%', CStr(Ctl), '', 'overflow: hidden', 'overflow: auto'); // Cols2(C1Width, C1Content, C2Width, C2Content, Height, C1Style, C2Style);
            } else {
                C1[C1.length] = html('\<div class="lblctlpair_FullLine lblctlpair_FullLine_withLabel" \>');
                Lbl = (html('\<label id=\'LBL_' + CStr(ByRef_Nicecolumnname) + '\' xfor=\'' + CStr(ByRef_Nicecolumnname) + '\' style=\'' + CStr(ByRef_Lblstyle) + '\'\>') + Trim(ByRef__Label) + html('&nbsp;\</label\>'));
                Ctl = html('\<mdlctl id=\'ctl_' + CStr(ByRef_Nicecolumnname) + '\'\>') + CStr(ByRef_Ctlhtml) + html('\</mdlctl\>');
                C1[C1.length] = CStr(Lbl) + CStr(Ctl);
                C1[C1.length] = html('\</div\>');
            }
        }
    } else {
        if (CBool(ByRef_Suppresslabel)) {
            C1[C1.length] = html('\<div class="lblctlpair lblctlpair_suppressLabel"\>');
            C1[C1.length] = html('   \<mdlctl id=\'ctl_' + CStr(ByRef_Nicecolumnname) + '\' \>') + CStr(ByRef_Ctlhtml) + html('\</mdlctl\>');
            C1[C1.length] = html('\</div\>');
        } else {
            C1[C1.length] = html('\<div class="lblctlpair lblctlpair_withLabel"\>');
            C1[C1.length] = (html('\<label id=\'LBL_' + CStr(ByRef_Nicecolumnname) + '\' xfor=\'' + CStr(ByRef_Nicecolumnname) + '\' style=\'' + CStr(ByRef_Lblstyle) + '\'\>') + Trim(ByRef__Label) + html('&nbsp;\</label\>'));
            C1[C1.length] = html('   \<mdlctl id=\'ctl_' + CStr(ByRef_Nicecolumnname) + '\'\>') + CStr(ByRef_Ctlhtml) + html('\</mdlctl\>');
            C1[C1.length] = html('\</div\>');
        }
    }

    return exit(Join(C1, ''));
}
// </LBLCTLPAIR>

// <MAKECLONENAME>
async function JSB_MDL_MAKECLONENAME(Projectname, Oldpagename, Oldviewname, Newpagename) {
    // local variables
    var Newviewname, Fdict, I, Test;

    // %options aspxC-

    Oldviewname = LCase(dropIfRight(CStr(Oldviewname), '.view', true));
    Newpagename = LCase(dropIfRight(CStr(Newpagename), '.page', true));
    Oldpagename = LCase(dropIfRight(CStr(Oldpagename), '.page', true));

    Newviewname = Change(Oldviewname, Oldpagename, Newpagename);
    if (Null0(Newviewname) != Null0(Oldpagename)) return CStr(Newviewname) + '.view';

    Fdict = await JSB_BF_FHANDLE('DICT', Projectname);
    for (I = 1; I <= 10; I++) {
        Newviewname = CStr(Oldviewname) + '_' + CStr(I) + '.view';
        if (await JSB_ODB_READ(Test, Fdict, CStr(Newviewname), function (_Test) { Test = _Test })); else return Newviewname;
    }

    return CStr(Oldviewname) + '_' + newGUID();
}
// </MAKECLONENAME>

// <MAKENEWREPORT_Pgm>
async function JSB_MDL_MAKENEWREPORT_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Rolemsg, Databasename, Tableid, Tabid, Reportname, Frompage;
    var Closethistab;

    // %options aspxC- 

    Rolemsg = (JSB_BF_ISAUTHENTICATED() ? '' : 'You must be logged in to view this page. ' + Anchor(LoginUrl(), 'Click here to login'));
    if (!(await JSB_BF_ISMANAGER())) return Stop((Rolemsg ? Rolemsg : 'You must be at least a data manager to use this command.'));

    JSB_BF_THEME('lumen');

    Databasename = paramVar('databaseName');
    if (Databasename === undefined) return Stop('databaseName is a required parameter');
    if (Not(await JSB_ODB_ATTACHDBEXTENDED(Databasename, function (_Databasename) { Databasename = _Databasename }))) return Stop(activeProcess.At_Errors);

    Tableid = paramVar('tableID');
    Tabid = paramVar('tabID');

    Reportname = paramVar('reportName');
    Frompage = paramVar('fromPage');

    Reportname = dropIfRight(CStr(Reportname), '.page', true);
    Closethistab = isEmpty(Reportname);

    if (Not(await JSB_MDL_MAKENEWREPORT(CStr(Tabid), CStr(Databasename), Reportname, CStr(Tableid), undefined, undefined, function (_Reportname) { Reportname = _Reportname }))) {
        if (activeProcess.At_Errors) await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
        Reportname = '';
    }

    if (CBool(Frompage)) return At_Response.Redirect(Frompage);

    if (Reportname != Chr(27) && !isEmpty(Reportname)) {
        if (hasParentProcess()) {
            if (await JSB_BF_MSGBOX('Launch report', CStr(Reportname), '*Yes,No') != 'Yes') return;
        }
        await JSB_BF_MSGBOX('Redirecting to ' + JsbRootAct() + CStr(Reportname));
        return At_Response.Redirect(JsbRootAct() + CStr(Reportname));
        return Stop();
    }

    if (hasTclParent()) return Stop('Done');
    At_Server.End();
    return;
}
// </MAKENEWREPORT_Pgm>

// <MAKENEWREPORT>
async function JSB_MDL_MAKENEWREPORT(Tabid, Databasename, ByRef_Reportname, Tblid_Or_Sql, Visiblecolumns, Defaultdevxgridlayout, setByRefValues) {
    // local variables
    var Projectname, F, Fdictproject, Isselect, View, Tablecolumns;
    var Columnnames, Searchtypes, Searchoutputs, Gridviewinputs;
    var Searchfields, Gridcolumns, Nextlinecrlfprefix, Searchrow;
    var Field, Name, Searchctl, Datatype, Outputcol, Inputcol;
    var Rangecolumn1, Rangecolumn2, Outputcol1, Outputcol2, Inputcol1;
    var Inputcol2, Reflist, Fnc, Gridcolumn, Editinputs, Editcolumns;
    var Editctl, Prefix, X, Src, Find, Replacewith, Griddataset;
    var Oldview, Newview, Newcolumnnames, Column, Newcolumns, Gotit;
    var Cname, Btn, Url, Tabtitle;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Reportname)
        return v
    }
    // %options aspxC-

    if (await JSB_ODB_ATTACHDB('')); else null;
    Projectname = 'dbBuilderReports';
    if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a data manager to use this command.');

    F = await JSB_BF_FHANDLE('', Projectname, true);
    Fdictproject = await JSB_BF_FHANDLE('dict', Projectname, true);

    Isselect = LCase(Left(Tblid_Or_Sql, 7)) == 'select ';

    if (Not(Tblid_Or_Sql)) {
        if (CBool(ByRef_Reportname)) {
            if (await JSB_ODB_READJSON(View, await JSB_BF_FHANDLE('dict', 'dbBuilderReports'), CStr(ByRef_Reportname) + '.view', function (_View) { View = _View })) {
                Tblid_Or_Sql = View.tableName;
                if (Not(Databasename)) {
                    Databasename = View.attachdb;
                    if (Left(Databasename, 3) == 'db_') Databasename = Mid1(Databasename, 4);
                }
            }
        }
    }

    if (Not(Databasename)) { activeProcess.At_Errors = 'A databaseName is a required URL parameter'; return exit(false); }
    if (Not(await JSB_ODB_ATTACHDBEXTENDED(Databasename, function (_Databasename) { Databasename = _Databasename }))) return exit(false);

    if (Not(Tblid_Or_Sql)) {
        Tblid_Or_Sql = await JSB_MDL_PICKATABLE('', 'Pick a Table to use for your report');
        if (Not(Tblid_Or_Sql)) return exit(false);
    }

    // If we have some dict !defs, this may help us choose  control and ref list
    Tablecolumns = await JSB_MDL_GETCOLUMNDEFINITIONS(Tblid_Or_Sql, Columnnames, function (_Columnnames) { Columnnames = _Columnnames });

    // Get search setup and visibleColumns
    Searchtypes = await JSB_MDL_NEWSEARCHTYPE(Projectname, Databasename, Tblid_Or_Sql, Visiblecolumns);
    if (Null0(Searchtypes) == false) return exit(false);

    if (CBool(Visiblecolumns)) Visiblecolumns = Split(LCase(Visiblecolumns), ',');

    // define what outputs and then what inputs we need  

    Searchoutputs = [undefined,];
    Gridviewinputs = [undefined,];
    Searchfields = [undefined,];
    Gridcolumns = [undefined,];

    // I/O       types: string;number;boolean;date
    // I/O   operators: =;<>;>;<;<=;>=;Like ...%;Like %...;Like %...%;InList;Dynamic
    Nextlinecrlfprefix = false;

    for (Searchrow of iterateOver(Searchtypes)) {
        if (Not(Searchrow.queryfield)) continue;
        if (Not(Searchrow.label)) Searchrow.label = Searchrow.name;

        // predefine single fields
        Field = Searchrow.name;
        Name = Searchrow.label;

        Searchctl = clone(Searchrow);
        Searchctl.control = 'textbox';
        Searchctl.fullline = false;
        Searchctl.width = 12;
        Searchctl.canedit = true;
        Searchctl.ctlstyle = '';
        Searchctl.display = 'visible';
        Searchctl.required = false;
        Searchctl.notblank = false;
        Searchctl.primarykey = false;
        Searchctl.oktocache = true;
        Searchctl.newlineprefix = Nextlinecrlfprefix;
        Searchctl.addBlank = true;
        Nextlinecrlfprefix = false;

        Datatype = Searchctl.datatype;

        switch (Datatype) {
            case 'boolean':
                Searchctl.control = 'dropdownbox';
                Searchctl.reflist = 'false,0;true,1';
                Searchctl.addBlank = true;

                break;

            case 'date':
                Searchctl.control = 'datebox';

                break;

            case 'time':
                Searchctl.control = 'timebox';

                break;

            case 'datetime':
                Searchctl.control = 'datetimebox';

                break;

            case 'url':
                Searchctl.control = 'urlbox';
        }

        Searchctl.defaultvalue = '{@ParamVar(\'' + CStr(Searchctl.name) + '\')}';

        Outputcol = { "field": Field, "name": Name, "scope": 'UrlParam' };
        Inputcol = { "field": Field, 'and': 1, "name": Name, "scope": 'UrlParam', "datatype": Datatype, "operator": 'Dynamic', "required": Searchrow.required };
        // lparen, rparen, defaultvalue

        // predefine for dual fields (range from ... to)
        Rangecolumn1 = clone(Searchctl);
        Rangecolumn1.name = 'From_' + CStr(Rangecolumn1.name); Rangecolumn1.label = 'From ' + CStr(Rangecolumn1.label);
        Rangecolumn1.newlineprefix = true;
        Rangecolumn1.defaultvalue = '{@ParamVar(\'' + CStr(Rangecolumn1.name) + '\')}';

        Rangecolumn2 = clone(Searchctl);
        Rangecolumn2.name = 'To_' + CStr(Rangecolumn2.name); Rangecolumn2.label = 'To ' + CStr(Rangecolumn2.label);
        Rangecolumn2.defaultvalue = '{@ParamVar(\'' + CStr(Rangecolumn2.name) + '\')}';

        Outputcol1 = { "field": Rangecolumn1.name, "name": Rangecolumn1.label, "scope": 'UrlParam' };
        Outputcol2 = { "field": Rangecolumn2.name, "name": Rangecolumn2.label, "scope": 'UrlParam' };

        Inputcol1 = { "field": Field, 'and': 1, "name": Rangecolumn1.label, "scope": 'UrlParam', "datatype": Datatype, "operator": '\>=', "required": Searchrow.required };
        Inputcol2 = { "field": Field, 'and': 1, "name": Rangecolumn2.label, "scope": 'UrlParam', "datatype": Datatype, "operator": '\<=', "required": Searchrow.required };

        // setup search operation: 
        Datatype = Searchctl.datatype;
        Searchctl.datatype = 'string';

        switch (Searchrow.searchType) {
            case 'an exact string match': case 'GUID':
                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'partial string match':
                Inputcol.operator = 'Like %...%';
                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'string starts with':
                Inputcol.operator = 'Like %...';
                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'string ends with':
                Inputcol.operator = 'Like ...%';
                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'an exact numeric value':
                Inputcol.datatype = 'number';
                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'year range':
                Reflist = await JSB_MDL_GETDISTINCTYEARS(Tblid_Or_Sql, Field, 0, Datatype, function (_Tblid_Or_Sql, _Field, _P3, _Datatype) { Tblid_Or_Sql = _Tblid_Or_Sql; Field = _Field; Datatype = _Datatype });

                Rangecolumn1.addBlank = true;
                Rangecolumn1.reflist = Join(Reflist, ';');
                Rangecolumn1.control = 'dropdownbox';
                Rangecolumn1.addBlank = true;

                Rangecolumn2.addBlank = true;
                Rangecolumn2.reflist = Join(Reflist, ';');
                Rangecolumn2.control = 'dropdownbox';

                Searchfields[Searchfields.length] = Rangecolumn1;
                Searchfields[Searchfields.length] = Rangecolumn2;
                Nextlinecrlfprefix = true;

                Searchoutputs[Searchoutputs.length] = Outputcol1;
                Searchoutputs[Searchoutputs.length] = Outputcol2;

                Gridviewinputs[Gridviewinputs.length] = Inputcol1;
                Gridviewinputs[Gridviewinputs.length] = Inputcol2;

                break;

            case 'an exact date':
                Inputcol.datatype = 'date';
                Searchctl.control = 'datebox';
                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'date range':
                Searchfields[Searchfields.length] = Rangecolumn1;
                Searchfields[Searchfields.length] = Rangecolumn2;
                Nextlinecrlfprefix = true;

                Searchoutputs[Searchoutputs.length] = Outputcol1;
                Searchoutputs[Searchoutputs.length] = Outputcol2;

                Gridviewinputs[Gridviewinputs.length] = Inputcol1;
                Gridviewinputs[Gridviewinputs.length] = Inputcol2;

                break;

            case 'time range':
                Searchfields[Searchfields.length] = Rangecolumn1;
                Searchfields[Searchfields.length] = Rangecolumn2;
                Nextlinecrlfprefix = true;

                Searchoutputs[Searchoutputs.length] = Outputcol1;
                Searchoutputs[Searchoutputs.length] = Outputcol2;

                Gridviewinputs[Gridviewinputs.length] = Inputcol1;
                Gridviewinputs[Gridviewinputs.length] = Inputcol2;

                break;

            case 'numeric range (inclusive)':
                Searchfields[Searchfields.length] = Rangecolumn1;
                Searchfields[Searchfields.length] = Rangecolumn2;
                Nextlinecrlfprefix = true;

                Searchoutputs[Searchoutputs.length] = Outputcol1;
                Searchoutputs[Searchoutputs.length] = Outputcol2;

                Gridviewinputs[Gridviewinputs.length] = Inputcol1;
                Gridviewinputs[Gridviewinputs.length] = Inputcol2;

                break;

            case 'numeric range (exclusive)':
                Searchfields[Searchfields.length] = Rangecolumn1;
                Searchfields[Searchfields.length] = Rangecolumn2;
                Nextlinecrlfprefix = true;

                Searchoutputs[Searchoutputs.length] = Outputcol1;
                Searchoutputs[Searchoutputs.length] = Outputcol2;

                Inputcol1.operator = '\>';
                Inputcol2.operator = '\<';
                Gridviewinputs[Gridviewinputs.length] = Inputcol1;
                Gridviewinputs[Gridviewinputs.length] = Inputcol2;

                break;

            case 'dropdown (literal)':
                Searchctl.reflist = Searchrow.reflist;
                Searchctl.control = 'dropdownbox';
                Searchctl.addBlank = true;

                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'dropdown (ref-file)':
                // searchCtl.refsql = SearchRow.refsql
                // searchCtl.refwhere = SearchRow.refwhere

                Searchctl.reffile = Searchrow.reffile;
                Searchctl.refpk = Searchrow.refpk;
                Searchctl.refdisplay = Searchrow.refdisplay;

                Searchctl.control = 'dropdownbox';
                Searchctl.addBlank = true;

                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'dropdown (derived)':
                Searchctl.reffile = Tblid_Or_Sql;
                Searchctl.refpk = Field;
                Searchctl.refdisplay = Field;

                Searchctl.control = 'dropdownbox';

                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'dropdown (derive now)': case 'dropdown':
                Reflist = await JSB_MDL_GETDISTINCTVALUES(Tblid_Or_Sql, Field, 0, Datatype, function (_Tblid_Or_Sql, _Field, _P3, _Datatype) { Tblid_Or_Sql = _Tblid_Or_Sql; Field = _Field; Datatype = _Datatype });

                Searchctl.addBlank = true;
                Searchctl.reflist = Join(Reflist, ';');

                Searchctl.control = 'dropdownbox';

                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'dropdown (Year(derive now))': case 'dropdown (Year())':
                Reflist = await JSB_MDL_GETDISTINCTYEARS(Tblid_Or_Sql, Field, 0, Datatype, function (_Tblid_Or_Sql, _Field, _P3, _Datatype) { Tblid_Or_Sql = _Tblid_Or_Sql; Field = _Field; Datatype = _Datatype });
                Searchctl.addBlank = true;
                Searchctl.reflist = Join(Reflist, ';');

                Searchctl.control = 'dropdownbox';

                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'dropdown (Year(derived))':
                Searchctl.reffile = Tblid_Or_Sql;
                if (Datatype == 'date' || Datatype == 'time' || Datatype == 'datetime') Fnc = 'Year([' + CStr(Field) + '])'; else Fnc = '[' + CStr(Field) + ']';
                Searchctl.refpk = Fnc;
                Searchctl.refdisplay = Fnc;

                Searchctl.control = 'dropdownbox';

                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'autocomplete (derived)':
                Searchctl.reffile = Tblid_Or_Sql;
                Searchctl.refpk = Field;
                Searchctl.refdisplay = Field;

                Searchctl.control = 'autotextbox';

                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'autocomplete (ref-file)':
                Searchctl.reffile = Searchrow.reffile;
                Searchctl.refpk = Searchrow.refpk;
                Searchctl.refdisplay = Searchrow.refdisplay;

                Searchctl.control = 'autotextbox';

                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'multi-select (literal)':
                Searchctl.reflist = Searchrow.reflist;
                Searchctl.control = 'multiselectdropdownbox';
                Searchctl.addBlank = true;

                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'multi-select (ref-file)':
                Searchctl.reffile = Searchrow.reffile;
                Searchctl.refpk = Searchrow.refpk;
                Searchctl.refdisplay = Searchrow.refdisplay;

                Searchctl.control = 'multiselectdropdownbox';
                Searchctl.addBlank = true;

                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'multi-select (derived)':
                Searchctl.reffile = Tblid_Or_Sql;
                Searchctl.refpk = Field;
                Searchctl.refdisplay = Field;

                Inputcol.operator = 'InList';
                Searchctl.addBlank = true;

                Searchctl.control = 'multiselectdropdownbox';

                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'multi-select (derive now)': case 'multi-select':
                Reflist = await JSB_MDL_GETDISTINCTVALUES(Tblid_Or_Sql, Field, 0, Datatype, function (_Tblid_Or_Sql, _Field, _P3, _Datatype) { Tblid_Or_Sql = _Tblid_Or_Sql; Field = _Field; Datatype = _Datatype });

                Inputcol.operator = 'InList';
                Searchctl.addBlank = true;
                Searchctl.reflist = Join(Reflist, ';');

                Searchctl.control = 'multiselectdropdownbox';

                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'multi-select (Year(derived))':
                Searchctl.reffile = Tblid_Or_Sql;
                Searchctl.refpk = Field;
                Searchctl.refdisplay = Field;

                Inputcol.operator = 'InList';
                Searchctl.addBlank = true;

                Searchctl.control = 'multiselectdropdownbox';

                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            case 'multi-select (Year(derive now))': case 'multi-select Year() dropdown':
                Reflist = await JSB_MDL_GETDISTINCTYEARS(Tblid_Or_Sql, Field, 0, Datatype, function (_Tblid_Or_Sql, _Field, _P3, _Datatype) { Tblid_Or_Sql = _Tblid_Or_Sql; Field = _Field; Datatype = _Datatype });

                Inputcol.operator = 'InList';
                Searchctl.addBlank = true;
                Searchctl.reflist = Join(Reflist, ';');

                Searchctl.control = 'multiselectdropdownbox';

                Searchfields[Searchfields.length] = Searchctl;
                Searchoutputs[Searchoutputs.length] = Outputcol;
                Gridviewinputs[Gridviewinputs.length] = Inputcol;

                break;

            default:
                if (CBool(isAdmin())) { Print(); debugger; }

        }
    }

    if (UBound(Gridviewinputs) != UBound(Searchoutputs)) {
        Print(); debugger; // should match;
    }

    // create model for grid
    Gridcolumns = [undefined,];
    for (Searchrow of iterateOver(Searchtypes)) {
        if (Not(Searchrow.displayfield)) continue;

        Gridcolumn = clone(Searchrow);
        if (CBool(Visiblecolumns)) {
            if (Locate(LCase(Gridcolumn.name), Visiblecolumns, 0, 0, 0, "", position => { })); else Gridcolumn.display = 'gridhidden';
        }
        Gridcolumns[Gridcolumns.length] = Gridcolumn;
    }

    Editinputs = [undefined,];
    for (Searchrow of iterateOver(Searchtypes)) {
        if (CBool(Searchrow.primarykey)) {
            Field = Searchrow.name;
            Name = Searchrow.label;
            Editinputs[Editinputs.length] = { "field": Field, 'and': 1, "name": Name, "scope": 'UrlParam', "datatype": Searchrow.datatype, "operator": 'Dynamic', "required": Searchrow.required }
        }
    }

    Editcolumns = [undefined,];
    if (CBool(Editinputs)) {
        for (Searchrow of iterateOver(Searchtypes)) {
            if (Not(Searchrow.editfield)) continue;

            Editctl = clone(Searchrow);
            Editctl.control = 'textbox';
            Editctl.fullline = false;
            Editctl.width = 12;
            Editctl.canedit = true;
            Editctl.ctlstyle = '';
            Editctl.display = 'visible';
            Editctl.required = false;
            Editctl.notblank = false;
            Editctl.primarykey = false;
            Editctl.newlineprefix = Nextlinecrlfprefix;
            Nextlinecrlfprefix = false;

            // Editing for year
            if (InStrI1(1, Searchrow.searchType, 'year')) Datatype = 'integer';

            switch (Editctl.datatype) {
                case 'boolean':
                    Editctl.control = 'dropdownbox';
                    Editctl.reflist = 'false,0;true,1';
                    Editctl.addBlank = true;

                    break;

                case 'date':
                    Editctl.control = 'datebox';

                    break;

                case 'time':
                    Editctl.control = 'timebox';

                    break;

                case 'datetime':
                    Editctl.control = 'datetimebox';

                    break;

                case 'url':
                    Editctl.control = 'urlbox';
            }

            switch (Searchrow.searchType) {
                case 'dropdown (Year(derived))': case 'year range': case 'dropdown (Year(derived))': case 'multi-select (Year(derived))':
                    Reflist = await JSB_MDL_GETDISTINCTYEARS(Tblid_Or_Sql, Searchrow.name, 0, Searchrow.datatype, function (_Tblid_Or_Sql, _P2, _P3, _P4) { Tblid_Or_Sql = _Tblid_Or_Sql });
                    Editctl.addBlank = true;
                    Editctl.reflist = Join(Reflist, ';');
                    Editctl.control = 'dropdownbox';

                    break;

                case 'pick from derived': case 'pick multiple values': case 'multi-select dropdown':
                    // Editing
                    Reflist = await JSB_MDL_GETDISTINCTVALUES(Tblid_Or_Sql, Searchrow.name, 0, Searchrow.datatype, function (_Tblid_Or_Sql, _P2, _P3, _P4) { Tblid_Or_Sql = _Tblid_Or_Sql });
                    Editctl.addBlank = true;
                    Editctl.reflist = Join(Reflist, ';');
                    Editctl.control = 'dropdownbox';

                    break;

                case 'use a pic-list':
                    Editctl.reflist = Searchrow.reflist;
                    Editctl.control = 'dropdownbox';
                    Editctl.addBlank = true;

                    break;

                case 'use a pic-file':
                    Editctl.reffile = Searchrow.reffile;
                    Editctl.refpk = Searchrow.refpk;
                    Editctl.refdisplay = Searchrow.refdisplay;
                    Editctl.control = 'dropdownbox';
                    Editctl.addBlank = true;

            }

            Editcolumns[Editcolumns.length] = Editctl;
        }
    }

    // This prefix is used by the dbTree to find reports for given database
    Prefix = JSB_BF_NICENAME(Databasename) + '_';
    // If reportName Then reportName = Prefix:reportName

    Println(At(-1), 'Building search selection page'); FlushHTML();
    if (Not(await JSB_MDL_NEWPAGE(CStr(Projectname), CStr(Prefix), ByRef_Reportname, Searchfields, [undefined,], Searchoutputs, 'Report', Tblid_Or_Sql, Visiblecolumns, Defaultdevxgridlayout, function (_ByRef_Reportname, _P7, _Tblid_Or_Sql) { ByRef_Reportname = _ByRef_Reportname; Tblid_Or_Sql = _Tblid_Or_Sql }))) return exit(false);

    // Make sure Project_Menus was compiled
    await asyncTclExecute('basic dbBuilderReports Project_Menus', _capturedData => X = _capturedData)

    // Add custom script
    if (await JSB_ODB_READ(Src, await JSB_BF_FHANDLE('dbBuilderReports'), CStr(ByRef_Reportname), function (_Src) { Src = _Src })) {
        if (!InStr1(1, Src, '@Script(CrlfTrigger)')) {
            Find = 'Print Html:';
            Replacewith = Find;
            Replacewith = Replace(Replacewith, -1, 0, 0, '* \<insert\>');
            Replacewith = (Replace(Replacewith, -1, 0, 0, 'CrlfTrigger = "window.oneTime = function (e) { if (e.keyCode != 13 || e.shiftKey) return true; $(document).off(\'keydown\', oneTime); $(\'#formBtn_Query\').click() }; $(document).on(\'keydown\', oneTime);"'));
            Replacewith = Replace(Replacewith, -1, 0, 0, 'Print @Script(CrlfTrigger):');
            Replacewith = Replace(Replacewith, -1, 0, 0, '* \</insert\>');
            Src = Change(Src, Find, Replacewith);
            if (await JSB_ODB_WRITE(CStr(Src), await JSB_BF_FHANDLE('dbBuilderReports'), CStr(ByRef_Reportname))); else null;
        }

        await asyncTclExecute('basic dbBuilderReports ' + CStr(ByRef_Reportname), _capturedData => X = _capturedData);
    }

    if (Not(Editcolumns)) Editinputs = [undefined,];
    Println('Building grid report page'); FlushHTML();
    if (Not(await JSB_MDL_NEWPAGE(CStr(Projectname), CStr(Prefix), CStr(ByRef_Reportname) + '_Grid', Gridcolumns, Gridviewinputs, Editinputs, 'Report(Grid)', Tblid_Or_Sql, Visiblecolumns, Defaultdevxgridlayout, function (_P3, _P7, _Tblid_Or_Sql) { Tblid_Or_Sql = _Tblid_Or_Sql }))) return exit(false);

    if (CBool(isAdmin())) {
        Println('Building pivot setup page'); FlushHTML();
        if (Not(await JSB_MDL_NEWPAGE(CStr(Projectname), CStr(Prefix), CStr(ByRef_Reportname) + '_PivotSetup', Gridcolumns, Gridviewinputs, [undefined,], 'Report(Pivot Setup)', Tblid_Or_Sql, Visiblecolumns, '', function (_P3, _P7, _Tblid_Or_Sql) { Tblid_Or_Sql = _Tblid_Or_Sql }))) return exit(false);

        Println('Building pivot report page'); FlushHTML();
        if (Not(await JSB_MDL_NEWPAGE(CStr(Projectname), CStr(Prefix), CStr(ByRef_Reportname) + '_Pivot', Gridcolumns, Gridviewinputs, [undefined,], 'Report(Pivot)', Tblid_Or_Sql, Visiblecolumns, '', function (_P3, _P7, _Tblid_Or_Sql) { Tblid_Or_Sql = _Tblid_Or_Sql }))) return exit(false);
    }

    if (CBool(Editinputs) && CBool(Editcolumns)) {
        if (await JSB_ODB_READJSON(Griddataset, await JSB_BF_FHANDLE('dict', 'dbBuilderReports'), CStr(ByRef_Reportname) + '_Grid.view', function (_Griddataset) { Griddataset = _Griddataset })) {
            Griddataset.gridDblOpenTo = 2;
            Griddataset.gridDblOpenUrl = CStr(ByRef_Reportname) + '_editRecord';
            Griddataset.passDblThruParams = false;
            Griddataset.addDblFromUrl = false;
            if (await JSB_ODB_WRITEJSON(Griddataset, await JSB_BF_FHANDLE('dict', 'dbBuilderReports'), CStr(ByRef_Reportname) + '_Grid.view')); else return Stop(activeProcess.At_Errors);
        }

        Println('Building edit page'); FlushHTML();

        if (await JSB_ODB_READJSON(Oldview, await JSB_BF_FHANDLE('dict', 'dbBuilderReports'), CStr(ByRef_Reportname) + '_editRecord.view', function (_Oldview) { Oldview = _Oldview })); else { Oldview = {} }

        if (Not(await JSB_MDL_NEWPAGE(CStr(Projectname), CStr(Prefix), CStr(ByRef_Reportname) + '_editRecord', Editcolumns, Editinputs, [undefined,], 'Form', Tblid_Or_Sql, Visiblecolumns, '', function (_P3, _P7, _Tblid_Or_Sql) { Tblid_Or_Sql = _Tblid_Or_Sql }))) return exit(false);

        if (await JSB_ODB_READJSON(Newview, await JSB_BF_FHANDLE('dict', 'dbBuilderReports'), CStr(ByRef_Reportname) + '_editRecord.view', function (_Newview) { Newview = _Newview })); else return exit(false);

        if (CBool(Oldview.columns)) {
            // any column defs in oldView stay the same
            Newcolumnnames = [undefined,];
            for (Column of iterateOver(Newview.columns)) {
                Newcolumnnames[Newcolumnnames.length] = Column.name;
            }

            Newcolumns = [undefined,];
            Gotit = [undefined,];
            for (Column of iterateOver(Oldview.columns)) {
                Cname = Column.name;
                if (Locate(Cname, Newcolumnnames, 0, 0, 0, "", position => { })) {
                    Newcolumns[Newcolumns.length] = Column;
                    Gotit[Gotit.length] = Cname;
                }
            }

            for (Column of iterateOver(Newview.columns)) {
                Cname = Column.name;
                if (Locate(Cname, Gotit, 0, 0, 0, "", position => { })); else Newcolumns[Newcolumns.length] = Column;
            }

            Oldview.columns = Newcolumns;
            if (await JSB_ODB_WRITEJSON(Oldview, await JSB_BF_FHANDLE('dict', 'dbBuilderReports'), CStr(ByRef_Reportname) + '_editRecord.view')); else return Stop(activeProcess.At_Errors);
        } else {
            for (Btn of iterateOver(Newview.custombtns)) {
                if (CBool(Btn.url)) {
                    Btn.opento = 16;
                    Btn.url = '';
                }
            }

            if (await JSB_ODB_WRITEJSON(Newview, await JSB_BF_FHANDLE('dict', 'dbBuilderReports'), CStr(ByRef_Reportname) + '_editRecord.view')); else return Stop(activeProcess.At_Errors);
        }
    }

    ByRef_Reportname = dropIfRight(CStr(ByRef_Reportname), '.page', true);
    Url = jsbRootAccount() + urlEncode(ByRef_Reportname) + '?tabID=' + urlEncode(Tabid);

    if (Tabid) {
        Tabtitle = Mid1(ByRef_Reportname, Len(Prefix) + 1);

        Print(At(-1), JSB_HTML_SCRIPT('\r\n\
            if (window.parent.reloadDbTree) {\r\n\
                window.parent.reloadDbTree();\r\n\
                \r\n\
                if (true || isMobile()) {\r\n\
                    window.parent.openInTab("' + CStr(Tabid) + '", ' + jsEscapeString(CStr(ByRef_Reportname)) + ', ' + jsEscapeString(CStr(Tabtitle)) + ', ' + jsEscapeString(CStr(Url)) + ');\r\n\
                    var tabID = dropLeft(window.frameElement.id, "_");\r\n\
                    window.parent.$(\'a[href="#tab_' + CStr(Tabid) + '"]\').click()\r\n\
                } else {\r\n\
                    windowOpen(' + jsEscapeString(CStr(Url)) + ', \'_blank\');\r\n\
                }\r\n\
                \r\n\
                window.parent.$("#tabli_" + tabID).remove();\r\n\
                window.parent.$("#tab_" + tabID).remove();\r\n\
                window.close();\r\n\
            }\r\n\
        '));
        FlushHTML();
        At_Server.End();
    }

    return exit(true);
}
// </MAKENEWREPORT>

// <MDLGETREFFIELDS_Pgm>
async function JSB_MDL_MDLGETREFFIELDS_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Databasename, Tablename, Arg, Restful_Result, Preventtimeout;
    var Tbldefs, Columns, Column, R, Cb;

    var Restful_Result;
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Databasename = JSB_BF_PARAMVAR('DATABASENAME', CStr(1)); Tablename = JSB_BF_PARAMVAR('TABLENAME', CStr(2)); Arg = JSB_BF_PARAMVAR('ARG', CStr(3));
                // %options aspxC-

                Preventtimeout = System(56);

                if (await JSB_ODB_ATTACHDB('')); else null;

                if (!(await JSB_BF_ISMANAGER())) { Restful_Result = { "err": 'You must be at least a data manager to use this command.' }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto; }
                if (Not(Databasename)) { Restful_Result = { "err": 'A databaseName is a required URL parameter' }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto; }
                if (Not(Arg)) { Restful_Result = { "err": 'A arg value is a required URL parameter' }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto; }

                if (Not(await JSB_ODB_ATTACHDBEXTENDED(Databasename, function (_Databasename) { Databasename = _Databasename }))) { Restful_Result = false; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto; }

                Tbldefs = await JSB_BF_GETTABLECOLUMNDEFS(CStr(Arg), CStr(false), false);
                Columns = [undefined, ''];
                for (Column of iterateOver(Tbldefs)) {
                    Columns[Columns.length] = Column.name;
                }
                Restful_Result = { "results": Columns }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto;

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </MDLGETREFFIELDS_Pgm>

// <MDLGETREFVALUES>
async function JSB_MDL_MDLGETREFVALUES(ByRef_Projectname, ByRef_Column, ByRef_Crow, setByRefValues) {
    // local variables
    var Reffile, Values, Fromcolumn, Tablename, Columns, C, F;
    var Y;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Column, ByRef_Crow)
        return v
    }
    Reffile = Change(ByRef_Column.reffile, '{projectname}', ByRef_Projectname);

    if (CBool(ByRef_Column.reflist)) {
        Values = makeArray(ByRef_Column.reflist);;
    } else if (!isEmpty(Reffile)) {
        if (Left(Reffile, 2) == '{!') {
            // Table Columns
            Fromcolumn = Field(Mid1(Reffile, 3), '}', 1);
            Tablename = ByRef_Crow[Fromcolumn];
            Values = [undefined,];
            if (!isEmpty(Tablename)) {
                Columns = await JSB_BF_GETTABLECOLUMNDEFS(CStr(Tablename), CStr(false), true);
                for (C of iterateOver(Columns)) {
                    Values[Values.length] = C.name;
                }
                Values = Sort(Values);
            }
        } else if (LCase(Reffile) == '{forms}' || LCase(Reffile) == '{views}') {

            if (await JSB_ODB_OPEN('dict', CStr(ByRef_Projectname), F, function (_F) { F = _F })) {
                if (await JSB_ODB_SELECTTO('', F, 'ItemId Like \'%.view\'', Y, function (_Y) { Y = _Y })) {
                    Values = Sort(getList(Y));
                } else {
                    Values = [undefined, 'unable to select file ' + CStr(ByRef_Projectname) + ' ' + 'Modeler-' + CStr(System(28)) + ': ' + CStr(activeProcess.At_Errors)];
                }
            } else {
                Values = [undefined, 'unable to open file ' + CStr(ByRef_Projectname) + ' ' + 'Modeler-' + CStr(System(28)) + ': ' + CStr(activeProcess.At_Errors)];
            }
        } else {
            Values = await JSB_BF_GETREFVALUESBYSELECT(Reffile, ByRef_Column.refpk, ByRef_Column.refdisplay, ByRef_Column.refwhere, ByRef_Column.align == 'right', CNum(ByRef_Column.oktocache), function (_Reffile, _P2, _P3, _P4, _P5) { Reffile = _Reffile });
        }
    } else {
        Values = [undefined, 'Your reffile or reflist is not setup correctly'];
    }

    return exit(Values);
}
// </MDLGETREFVALUES>

// <MDLSESSIONSETUP_Sub>
async function JSB_MDL_MDLSESSIONSETUP_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Viewdataset, setByRefValues) {
    // local variables
    var Sqlcolumns, Viewcolumns, Column, Cname, Foundit, Subc;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Viewdataset)
        return v
    }
    // %options aspxC-

    Sqlcolumns = await JSB_MDL_POSSIBLEINPUTCOLUMNS(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, function (_ByRef_Projectname) { ByRef_Projectname = _ByRef_Projectname });
    At_Session.Item('SQLCOLUMNS', Sqlcolumns);

    Viewcolumns = ByRef_Viewdataset.columns;
    At_Session.Item('VIEWCOLUMNS', Viewcolumns);

    for (Column of iterateOver(Viewcolumns)) {
        Cname = Column.name;
        Foundit = false;
        for (Subc of iterateOver(Sqlcolumns)) {
            if (Null0(Subc.name) == Null0(Cname)) {
                Foundit = true;
                break;
            }
        }
        if (Not(Foundit)) At_Session.Item('SQLCOLUMNS')[At_Session.Item('SQLCOLUMNS').length] = Column;
    }
    return exit();
}
// </MDLSESSIONSETUP_Sub>

// <MODELER_Sub>
async function JSB_MDL_MODELER_Sub() {
}
// </MODELER_Sub>

// <MODELFORALLCOLUMNS>
async function JSB_MDL_MODELFORALLCOLUMNS() {
    // local variables
    var Allcolumns, Model, Viewmodel, Column;

    // %options aspxC-

    Allcolumns = [undefined,];
    Model = await JSB_MDL_MODELFORTABLECOLUMNS();
    Viewmodel = await JSB_MDL_MODELFORVIEWCOLUMNS();

    Allcolumns = Model.columns;
    for (Column of iterateOver(Viewmodel.columns)) {
        Allcolumns[Allcolumns.length] = Column;
    }
    Allcolumns = Sort(Allcolumns, '#index');
    Model.columns = Allcolumns;
    return Model;
}
// </MODELFORALLCOLUMNS>

// <MODELFORPAGE>
async function JSB_MDL_MODELFORPAGE(ByRef_Projectname, setByRefValues) {
    // local variables
    var Defaulttheme, F, Menupage, Columns, Model;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname)
        return v
    }
    // %options aspxC-

    Defaulttheme = At_Session.Item('DEFAULTTHEME');
    if (Not(Defaulttheme)) {
        Defaulttheme = 'theme_none';
        if (await JSB_ODB_OPEN('', CStr(ByRef_Projectname), F, function (_F) { F = _F })) { if (await JSB_ODB_READ(Menupage, F, 'menu.page', function (_Menupage) { Menupage = _Menupage })) Defaulttheme = Menupage.theme; }
    }

    Columns = [undefined,
        { "name": 'templateName', "defaultvalue": 'simplePage', "index": 1, "label": 'Template', "datatype": 'string', "width": 90, "control": 'dropDownBox', "required": false, "notblank": false, "autopostback": true, "canedit": true, "reffile": 'JSB_pageTemplates', "refpk": 'ItemID', "refwhere": 'ItemID \>= \'a\'' },
        { "name": 'theme', "defaultvalue": Defaulttheme, "index": 2, "label": 'theme', "width": 18, "control": 'dropDownBox', "canedit": true, "required": false, "notblank": false, "reffile": 'jsb_themes', "refpk": 'ItemID' },
        { "index": 3 },

        { "name": 'minimumRole', "label": 'minimum Role', "defaultvalue": 'employee', "index": 4, "width": 18, "control": 'dropdownbox', "canedit": true, "required": false, "notblank": false, "reflist": 'Admin;Director;Manager;Clerk;Employee;User;Anonymous' },
        { "name": 'menucategory', "defaultvalue": '', "index": 5, "label": 'Category', "width": 18, "control": 'comboBox', "canedit": true, "required": false, "notblank": false, "reffile": 'dict {projectname}', "refpk": 'menucategory', "refwhere": 'ItemID Like \'%.page\'' },
        { "name": 'menuitem', "index": 6, "label": 'Menu Item', "width": 18, "control": 'textbox', "canedit": true, "required": false, "notblank": false },
        { "name": 'glyphicon', "label": 'glyphicon', "defaultvalue": '', "index": 4, "width": 18, "control": 'dropdownbox', "canedit": true, "required": false, "notblank": false, "addBlank": true, "reflist": 'asterisk,plus,minus,eur,euro,cloud,envelope,pencil,glass,music,search,heart,star,star-empty,user,film,th-large,th,th-list,ok,remove,zoom-in,zoom-out,off,signal,cog,trash,home,file,time,road,download-alt,download,upload,inbox,play-circle,repeat,refresh,list-alt,lock,flag,headphones,volume-off,volume-down,volume-up,qrcode,barcode,tag,tags,book,bookmark,print,camera,font,bold,italic,text-height,text-width,align-left,align-center,align-right,align-justify,list,indent-left,indent-right,facetime-video,picture,map-marker,adjust,tint,edit,share,check,move,step-backward,fast-backward,backward,play,pause,stop,forward,fast-forward,step-forward,eject,chevron-left,chevron-right,plus-sign,minus-sign,remove-sign,ok-sign,question-sign,info-sign,screenshot,remove-circle,ok-circle,ban-circle,arrow-left,arrow-right,arrow-up,arrow-down,share-alt,resize-full,resize-small,exclamation-sign,gift,leaf,fire,eye-open,eye-close,warning-sign,plane,calendar,random,comment,magnet,chevron-up,chevron-down,retweet,shopping-cart,folder-close,folder-open,resize-vertical,resize-horizontal,hdd,bullhorn,bell,certificate,thumbs-up,thumbs-down,hand-right,hand-left,hand-up,hand-down,circle-arrow-right,circle-arrow-left,circle-arrow-up,circle-arrow-down,globe,wrench,tasks,filter,briefcase,fullscreen,dashboard,paperclip,heart-empty,link,phone,pushpin,usd,gbp,sort,sort-by-alphabet,sort-by-alphabet-alt,sort-by-order,sort-by-order-alt,sort-by-attributes,sort-by-attributes-altunchecked,expand,collapse-down,collapse-up,log-in,flash,log-out,new-window,record,save,open,saved,import,export,send,floppy-disk,floppy-saved,floppy-remove,floppy-save,floppy-open,credit-card,transfer,cutlery,header,compressed,earphone,phone-alt,tower,stats,sd-video,hd-video,subtitles,sound-stereo,sound-dolby,sound-5-1,sound-6-1,sound-7-1,copyright-mark,registration-mark,cloud-download,cloud-upload,tree-conifer,tree-deciduous,cd,save-file,open-file,level-up,copy,paste,alert,equalizer,king,queen,pawn,bishop,knight,baby-formula,tent,blackboard,bed,apple,erase,hourglass,lamp,duplicate,piggy-bank,scissors,bitcoin,yen,ruble,scale,ice-lolly,ice-lolly-tasted,education,option-horizontal,option-vertical,menu-hamburger,modal-window,oil,grain,sunglasses,text-size,text-color,text-background,object-align-top,object-align-bottom,object-align-horizontal,object-align-left,object-align-vertical,object-align-right,triangle-right,triangle-left,triangle-bottom,triangle-top,console,superscript,subscript,menu-left,menu-right,menu-down,menu-up' },
        { "name": 'iconurl', "label": 'icon url', "defaultvalue": '', "index": 4, "width": 18, "control": 'textbox', "canedit": true, "required": false, "notblank": false },

        { "name": 'pickpage', "index": 9, "label": 'Is Pick Page', "width": '12em', "control": 'checkbox', "canedit": true, "required": false, "notblank": true, "defaultvalue": '0', "reflist": 'false,0;true,1' },

        { "index": 10 }
    ];

    Model = {};
    Model.columns = Columns;
    return exit(Model);
}
// </MODELFORPAGE>

// <MODELFORTABLECOLUMNS>
async function JSB_MDL_MODELFORTABLECOLUMNS() {
    // local variables
    var Columns, Model;

    // %options aspxC-

    Columns = await JSB_BF_TABLECOLUMNS();
    Model = {};
    Model.columns = Columns;
    return Model;
}
// </MODELFORTABLECOLUMNS>

// <MODELFORVIEW>
async function JSB_MDL_MODELFORVIEW() {
    // local variables
    var Columns, Model;

    Columns = [undefined,
        { "name": 'templateName', "defaultvalue": 'Form', "index": 1, "label": 'Template', "datatype": 'string', "width": 90, "control": 'dropDownBox', "required": false, "notblank": false, "autopostback": true, "canedit": true, "reffile": 'JSB_viewTemplates', "refpk": 'ItemID', "refwhere": 'ItemID \>= \'a\'' }];
    Model = {};
    Model.columns = Columns;
    return Model;
}
// </MODELFORVIEW>

// <MODELFORVIEWCOLUMNS>
async function JSB_MDL_MODELFORVIEWCOLUMNS() {
    // local variables
    var Model;

    // %options aspxC-

    Model = {};
    Model.columns = await JSB_BF_VIEWCOLUMNS();
    return Model;
}
// </MODELFORVIEWCOLUMNS>

// <NEWPAGE>
async function JSB_MDL_NEWPAGE(Projectname, Pagenameprefix, ByRef_Pagename, Predefinedcolumns, Predefinedinputs, Predefinedoutputs, ByRef_Pagetype, ByRef_Tblid_Or_Sql, Visiblecolumns, Devxgridlayout, setByRefValues) {
    // local variables
    var Fdictproject, Isselect, Desc, Title, Suggestedname, Caption;
    var Pagedataset, Ans, Pagemodel, Usetype, Stdtypes, Xtratypes;
    var Xtype, Viewtype, Viewname, Masterviewdataset, Tablename;
    var Schemacolumns, Primarykeycol, Primarykeyname, Gotpk, Column;
    var Newcolumn, Viewdataset, D, Pickinputs, Pickoutputs, Pickgridurl;
    var Nicepagename, Oururl, Searchoutputs, Cname, _Label, Basepagename;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Pagename, ByRef_Pagetype, ByRef_Tblid_Or_Sql)
        return v
    }
    // %options aspxC-

    ByRef_Pagename = dropIfRight(CStr(ByRef_Pagename), '.page', true);
    if (await JSB_ODB_OPEN('dict', CStr(Projectname), Fdictproject, function (_Fdictproject) { Fdictproject = _Fdictproject })); else return exit(undefined);
    Isselect = LCase(Left(ByRef_Tblid_Or_Sql, 7)) == 'select ';

    if (InStrI1(1, ByRef_Pagetype, 'Report')) Desc = 'report'; else Desc = 'page';
    Title = 'Create a new ' + CStr(Desc);
    if (!ByRef_Pagename) {
        if (!(InStr1(1, ByRef_Tblid_Or_Sql, ' ')) && Desc == 'report') {
            Suggestedname = JSB_BF_NICENAME(CStr(ByRef_Tblid_Or_Sql) + ' Report');
        }


        while (true) {
            Caption = 'New ' + CStr(Desc) + ' name?';
            ByRef_Pagename = Trim(await JSB_BF_INPUTBOX(Title, CStr(Caption), CStr(Suggestedname), '80%', '', function (_Title) { Title = _Title }));
            ByRef_Pagename = dropIfRight(ByRef_Pagename, '.page', true);

            if (ByRef_Pagename == Chr(27) || !ByRef_Pagename) { ByRef_Pagename = ''; return exit(undefined); }
            ByRef_Pagename = JSB_BF_NICENAME(ByRef_Pagename);
            if (await JSB_ODB_READJSON(Pagedataset, Fdictproject, CStr(Pagenameprefix) + ByRef_Pagename + '.page', function (_Pagedataset) { Pagedataset = _Pagedataset })); else break;
            Ans = await JSB_BF_MSGBOX('Warning', 'The ' + CStr(Desc) + ' ' + ByRef_Pagename + ' already exists. OverWrite?', 'Yes,*No');
            if (isEmpty(Ans) || Ans == Chr(27)) return exit(undefined);
            if (Ans == 'Yes') break;
            Suggestedname = '';
        }

        ByRef_Pagename = CStr(Pagenameprefix) + ByRef_Pagename;
    }

    Pagemodel = await JSB_MDL_MODELFORPAGE(Projectname, function (_Projectname) { Projectname = _Projectname });

    if (ByRef_Pagetype) {
        Usetype = ByRef_Pagetype;
    } else {
        Stdtypes = Split('Menu,Editable Grid,Readonly Grid,Form,Search Form,Form \> Grid,Grid \> Form,Chart,HTML', ',');

        Xtratypes = await JSB_BF_FSELECT('vt', 'ItemID \> "1"', undefined, undefined);
        for (Xtype of iterateOver(Xtratypes)) {
            if (Locate(LCase(Xtype), LCase(Stdtypes), 0, 0, 0, "", position => { })); else Stdtypes[Stdtypes.length] = Xtype;
        }

        Usetype = await JSB_BF_INPUTLISTBOX('Page Type', 'What type of page?', CStr(Stdtypes), 'Form', '80%', ''); // ,Report(Grid),Report(Pivot)
        if (Usetype == Chr(27) || isEmpty(Usetype)) { ByRef_Pagename = ''; return exit(undefined); }
    }

    switch (Usetype) {
        case 'Menu':
            ByRef_Pagetype = 'simplePage';
            Viewtype = 'NoCrud_Form';

            break;

        case 'Editable Grid': case 'Readonly Grid':
            ByRef_Pagetype = 'simplePage';
            Viewtype = 'Grid';

            break;

        case 'Search Form': case 'Report':
            ByRef_Pagetype = 'simplePage';
            Viewtype = 'NoCrud_Form';

            break;

        case 'Form \> Grid':
            ByRef_Pagetype = 'twoViews';
            Viewtype = 'Form,Grid';

            break;

        case 'Grid \> Form':
            ByRef_Pagetype = 'twoViews';
            Viewtype = 'Grid,Form';

            break;

        case 'Report(Grid)':
            ByRef_Pagetype = 'simplePage';
            Viewtype = 'Grid';

            break;

        case 'Report(Pivot)': case 'pivot':
            ByRef_Pagetype = 'simplePage';
            Viewtype = 'Pivot';
            Usetype = 'Report(Pivot)';

            break;

        case 'Report(Pivot Setup)': case 'pivotSetup':
            ByRef_Pagetype = 'simplePage';
            Viewtype = 'PivotSetup';
            Usetype = 'Report(Pivot Setup)';

            break;

        case 'Chart':
            ByRef_Pagetype = 'simplePage';
            Viewtype = 'Chart';

            break;

        case 'HTML': case 'HtmlBlock':
            ByRef_Pagetype = 'simplePage';
            Viewtype = 'HTMLBlock';

            break;

        default:
            ByRef_Pagetype = 'simplePage';
            Viewtype = Usetype;
    }

    await JSB_MDL_GETEXTRAPAGECOLUMNS_Sub(Pagemodel.columns, ByRef_Pagetype, function (_P1, _ByRef_Pagetype) { ByRef_Pagetype = _ByRef_Pagetype });

    // Create the page from the meta data (pageModel)
    Pagedataset = await JSB_MDL_NEWROW(ByRef_Pagename, Pagemodel.columns, function (_ByRef_Pagename, _P2) { ByRef_Pagename = _ByRef_Pagename });

    Pagedataset.templateName = ByRef_Pagetype;
    Pagedataset.menuitem = ByRef_Pagename;
    Pagedataset.minimumRole = 'employee';

    // Setup Master view for two views
    if (LCase(ByRef_Pagetype) == 'twoviews') {
        Viewname = ByRef_Pagename + '_Master.view';
        Pagedataset.westview = Viewname;
        Masterviewdataset = await JSB_MDL_CREATENEWVIEW(Viewname, function (_Viewname) { Viewname = _Viewname });
        Masterviewdataset.templateName = dropIfRight(CStr(Viewtype), ',');

        Tablename = await JSB_MDL_PICKATABLE('', 'Pick your ' + dropIfRight(CStr(Viewtype), ',') + ' Table');
        if (Not(Tablename)) { ByRef_Pagename = ''; return exit(undefined); }

        Masterviewdataset.attachdb = Account();
        Masterviewdataset.tableName = Tablename;
        Masterviewdataset.newRecord = false;
        Masterviewdataset.allowNewRecord = false;
        Masterviewdataset.allowupdates = false;
        Masterviewdataset.allowdeletes = false;
        Masterviewdataset.allowinserts = false;
        Masterviewdataset.header = Mid1(Viewname, Len(Pagenameprefix) + 1);

        // pick columns
        Schemacolumns = await JSB_BF_GETTABLECOLUMNDEFS(CStr(Masterviewdataset.tableName), CStr(true), true);
        Primarykeycol = await JSB_MDL_GETTABLEPRIMARYKEYCOL(Schemacolumns, function (_Schemacolumns) { Schemacolumns = _Schemacolumns });
        Primarykeyname = Primarykeycol.name;

        if (Not(await JSB_MDL_CHOOSECOLUMNS_SS(CStr(Projectname), CStr(Viewname), Masterviewdataset, Schemacolumns))) { ByRef_Pagename = ''; return exit(undefined); }

        Gotpk = false;
        for (Column of iterateOver(Masterviewdataset.columns)) {
            if (Null0(Column.name) == Null0(Primarykeyname)) { Gotpk = true; break; }
        }
        if (Not(Gotpk)) {
            Newcolumn = clone(Primarykeycol);
            await JSB_MDL_SETCOLUMNDEFAULTS_Sub(Newcolumn.datatype, Newcolumn, function (_P1, _Newcolumn) { Newcolumn = _Newcolumn });
            Masterviewdataset.columns[Masterviewdataset.columns.length] = Newcolumn;
        }

        // Define master Outputs
        Masterviewdataset.outputs = [undefined,];
        Masterviewdataset.outputs[Masterviewdataset.outputs.length] = { "field": Primarykeyname, "name": '', "scope": 'memoryVar' };

        await JSB_MDL_MDLSESSIONSETUP_Sub(Projectname, ByRef_Pagename, Viewname, Masterviewdataset, function (_Projectname, _ByRef_Pagename, _Viewname, _Masterviewdataset) { Projectname = _Projectname; ByRef_Pagename = _ByRef_Pagename; Viewname = _Viewname; Masterviewdataset = _Masterviewdataset });
        Ans = await JSB_BF_POPUP_JSONDEF(Projectname, 'jsb_jsondefs', 'viewOutputs', 'DEL', 'Add Output Parameter', Masterviewdataset.outputs, '80%', '80%', 'Outputs for view ' + CStr(Viewname), true, function (_Projectname, _P2, _P3, _P4, _P5, _P6) { Projectname = _Projectname });
        if (Not(isArray(Ans))) { ByRef_Pagename = ''; return exit(undefined); }
        if (Len(Ans)) Masterviewdataset.outputs = Ans;

        if (await JSB_ODB_WRITEJSON(Masterviewdataset, Fdictproject, CStr(Viewname))); else return Stop(At(-1), 'Edp-', System(28), ': ', activeProcess.At_Errors);

        Title = 'Pick your ' + dropIfLeft(CStr(Viewtype), ',') + ' Table';
    } else {
        Title = 'Pick a table for your ' + CStr(Usetype) + ' view';
    }

    // Create a center view
    Viewname = ByRef_Pagename + '.view';
    Pagedataset.centerview = Viewname;

    Viewdataset = await JSB_MDL_CREATENEWVIEW(Viewname, function (_Viewname) { Viewname = _Viewname });
    Viewdataset.templateName = dropIfLeft(CStr(Viewtype), ',');
    Viewdataset.attachdb = Account();
    Viewdataset.header = Mid1(ByRef_Pagename, Len(Pagenameprefix) + 1);

    if (Usetype != 'Menu') {
        if (Not(ByRef_Tblid_Or_Sql)) {
            ByRef_Tblid_Or_Sql = await JSB_MDL_PICKATABLE(ByRef_Tblid_Or_Sql, Title);
            if (Not(ByRef_Tblid_Or_Sql)) {
                if (LCase(ByRef_Pagetype) == 'twoviews') { if (await JSB_ODB_DELETEITEM(Fdictproject, CStr(Viewname))); else if (activeProcess.At_Errors) Alert(CStr(activeProcess.At_Errors)); }
                ByRef_Pagename = ''; return exit(undefined);
            }
            Viewdataset.tableName = ByRef_Tblid_Or_Sql;;
        } else if (CBool(Isselect)) {
            Viewdataset.customsql = ByRef_Tblid_Or_Sql;;
        } else {
            Viewdataset.tableName = ByRef_Tblid_Or_Sql;
        }
    }

    Viewdataset.newRecord = false;
    Viewdataset.allowNewRecord = false;
    Viewdataset.allowupdates = false;
    Viewdataset.allowdeletes = false;
    Viewdataset.allowinserts = false;
    Viewdataset.usedevx = true;
    Viewdataset.custombtns = [undefined,];
    if (CBool(Predefinedcolumns)) Viewdataset.columns = Predefinedcolumns; else Viewdataset.columns = [undefined,];
    if (CBool(Predefinedinputs)) Viewdataset.inputs = Predefinedinputs; else Viewdataset.inputs = [undefined,];
    if (CBool(Predefinedoutputs)) Viewdataset.outputs = Predefinedoutputs; else Viewdataset.outputs = [undefined,];

    if (Usetype == 'Report(Grid)') {
        Viewdataset.devXGridLayout = Devxgridlayout;
        Viewdataset.visibleColumns = Visiblecolumns;
    }

    // Get the schemaColumns
    if (CBool(Isselect)) {
        Schemacolumns = await JSB_BF_GETSELECTCOLUMNDEFS(CStr(ByRef_Tblid_Or_Sql));
    } else {
        Schemacolumns = await JSB_BF_GETTABLECOLUMNDEFS(CStr(ByRef_Tblid_Or_Sql), CStr(false), false);
    }

    // Get defined table columns
    Primarykeycol = await JSB_MDL_GETTABLEPRIMARYKEYCOL(Schemacolumns, function (_Schemacolumns) { Schemacolumns = _Schemacolumns });
    Primarykeyname = Primarykeycol.name;

    // Does user need to pick columns?
    if (Not(Predefinedcolumns)) {
        Viewdataset.columns = [undefined,];
        for (Newcolumn of iterateOver(Schemacolumns)) {
            await JSB_MDL_SETCOLUMNDEFAULTS_Sub(Newcolumn.datatype, Newcolumn, function (_P1, _Newcolumn) { Newcolumn = _Newcolumn });
            Viewdataset.columns[Viewdataset.columns.length] = Newcolumn;
        }

        if (Usetype == 'Report(Grid)') {
            D = 'Pick columns that should be on the columnar report (grid view)';;
        } else if (Usetype == 'Report(Pivot)') {
            D = 'Pick columns that should be enabled on PIVOT setup (for avg, sum, etc..)';;
        } else if (Usetype == 'Report') {
            D = 'Pick columns that should be on the report\'s search form';
        } else {
            D = 'Pick columns to place on the ' + CStr(Usetype);
        }

        if (Not(await JSB_MDL_CHOOSECOLUMNS_SS(CStr(Projectname), CStr(Viewname), Viewdataset, Schemacolumns, CStr(D)))) { ByRef_Pagename = ''; return exit(undefined); }
    }

    Pickinputs = (LCase(ByRef_Pagetype) == 'twoviews' && Not(Predefinedinputs));
    Pickoutputs = false;
    Pickgridurl = false;

    // Insure primary key there if twoviews
    if (LCase(ByRef_Pagetype) == 'twoviews' && CBool(Primarykeyname)) {
        Gotpk = false;
        for (Column of iterateOver(Viewdataset.columns)) {
            if (Null0(Column.name) == Null0(Primarykeyname)) { Gotpk = true; break; }
        }
        if (Not(Gotpk)) {
            Newcolumn = clone(Primarykeycol);
            await JSB_MDL_SETCOLUMNDEFAULTS_Sub(Newcolumn.datatype, Newcolumn, function (_P1, _Newcolumn) { Newcolumn = _Newcolumn });
            Viewdataset.columns[Viewdataset.columns.length] = Newcolumn;
        }
    }

    Nicepagename = JSB_BF_NICENAME(ByRef_Pagename);
    Oururl = CStr(Nicepagename) + '.page';
    switch (Usetype) {
        case 'Menu':
            // toType is "Reset Form","Search Form","ReadOnly Form", or "Menu Form"
            if (Not(Predefinedcolumns)) { await JSB_MDL_DOWIZARD_Sub(Viewname, Viewdataset, 'Menu Form', function (_Viewname, _Viewdataset, _P3) { Viewname = _Viewname; Viewdataset = _Viewdataset }); }

            break;

        case 'Editable Grid':
            Pickinputs = Not(Predefinedinputs);

            Viewdataset.allowupdates = true;
            Viewdataset.allowdeletes = true;
            Viewdataset.allowinserts = true;

            // update btn
            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Save', "opento": 10, "url": Oururl, "verifyform": true, "saveform": true, "deleteform": false, "confirmop": '0', "addoutputs": true, "addfrompage": false, "showwhen": 1, "addnewrec": false, "parentmayhide": true };
            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Cancel', "opento": 10, "url": Oururl, "verifyform": false, "saveform": false, "deleteform": false, "confirmop": 2, "addoutputs": false, "addfrompage": false, "showwhen": 0, "addnewrec": false, "parentmayhide": false };

            break;

        case 'Readonly Grid':
            Pickinputs = Not(Predefinedinputs);
            Pickoutputs = Not(Predefinedoutputs);
            Pickgridurl = true;

            break;

        case 'Form':
            Pickinputs = Not(Predefinedinputs);

            Viewdataset.allowNewRecord = true;
            Viewdataset.allowupdates = true;
            Viewdataset.allowdeletes = true;
            Viewdataset.allowinserts = true;

            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Save', "opento": 10, "url": Oururl, "verifyform": true, "saveform": true, "deleteform": false, "confirmop": 0, "addoutputs": true, "addfrompage": false, "showwhen": 1, "addnewrec": false, "parentmayhide": true };
            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Update', "opento": 10, "url": Oururl, "verifyform": true, "saveform": true, "deleteform": false, "confirmop": 0, "addoutputs": true, "addfrompage": false, "showwhen": 2, "addnewrec": false, "parentmayhide": true };
            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Delete', "opento": 10, "url": Oururl, "verifyform": false, "saveform": false, "deleteform": true, "confirmop": 1, "addoutputs": false, "addfrompage": false, "showwhen": 2, "addnewrec": false, "parentmayhide": true };
            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Cancel', "opento": 10, "url": Oururl, "verifyform": false, "saveform": false, "deleteform": false, "confirmop": 2, "addoutputs": false, "addfrompage": false, "showwhen": 0, "addnewrec": false, "parentmayhide": false };

            break;

        case 'Form \> Grid':
            Viewdataset.allowupdates = true;
            Viewdataset.allowdeletes = true;
            Viewdataset.allowinserts = true;

            // Define slave Inputs
            if (Not(Predefinedinputs)) {
                Viewdataset.inputs = [undefined,];
                if (CBool(Primarykeyname)) {
                    Viewdataset.inputs[Viewdataset.inputs.length] = { "and": true, "field": Primarykeyname, "name": undefined, "scope": 'memoryVar', "datatype": 'string', "operator": '=', "required": false, "defaultvalue": '' }
                }
            }

            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Cancel', "opento": 10, "url": Oururl, "verifyform": false, "saveform": false, "deleteform": false, "confirmop": 2, "addoutputs": false, "addfrompage": false, "showwhen": 0, "addnewrec": false, "parentmayhide": false };

            Viewdataset.allowNewRecord = true;

            break;

        case 'Grid \> Form':
            Viewdataset.allowupdates = true;
            Viewdataset.allowdeletes = true;
            Viewdataset.allowinserts = true;

            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Save', "opento": 10, "url": Oururl, "verifyform": true, "saveform": true, "deleteform": false, "confirmop": 0, "addoutputs": true, "addfrompage": false, "showwhen": 1, "addnewrec": false, "parentmayhide": true };
            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Update', "opento": 10, "url": Oururl, "verifyform": true, "saveform": true, "deleteform": false, "confirmop": 0, "addoutputs": true, "addfrompage": false, "showwhen": 2, "addnewrec": false, "parentmayhide": true };
            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Delete', "opento": 10, "url": Oururl, "verifyform": false, "saveform": false, "deleteform": true, "confirmop": 1, "addoutputs": false, "addfrompage": false, "showwhen": 2, "addnewrec": false, "parentmayhide": true };
            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Cancel', "opento": 10, "url": Oururl, "verifyform": false, "saveform": false, "deleteform": false, "confirmop": 2, "addoutputs": false, "addfrompage": false, "showwhen": 0, "addnewrec": false, "parentmayhide": false };

            // Define slave Inputs
            if (Not(Predefinedinputs)) {
                Viewdataset.inputs = [undefined,];
                if (CBool(Primarykeyname)) {
                    Viewdataset.inputs[Viewdataset.inputs.length] = { "and": true, "field": Primarykeyname, "name": undefined, "scope": 'memoryVar', "datatype": 'string', "operator": '=', "required": false, "defaultvalue": '' }
                }
            }

            Viewdataset.allowNewRecord = true;

            break;

        case 'Search Form': case 'Report':
            // toType is "Reset Form","Search Form","ReadOnly Form", or "Menu Form"
            if (Not(Predefinedcolumns)) { await JSB_MDL_DOWIZARD_Sub(Viewname, Viewdataset, 'Search Form', function (_Viewname, _Viewdataset, _P3) { Viewname = _Viewname; Viewdataset = _Viewdataset }); }

            // Pick URL to goto for click and dblClick
            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Query', "opento": 10, "url": JSB_BF_NICENAME(ByRef_Pagename) + '_grid', "verifyform": true, "addoutputs": true };

            if (CBool(isAdmin())) {
                Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Pivot', "opento": 10, "url": JSB_BF_NICENAME(ByRef_Pagename) + '_pivotsetup', "verifyform": true, "addoutputs": true }
            }

            // Every column we put on the seach form is an output automatically
            if (Not(Predefinedoutputs)) {
                Searchoutputs = [undefined,];
                for (Column of iterateOver(Viewdataset.columns)) {
                    Cname = Column.name;
                    if (Null0(Column.name) != Null0(Column.label) && !isEmpty(Column.label)) _Label = Column.label; else _Label = '';
                    Searchoutputs[Searchoutputs.length] = { "field": Column.name, "name": _Label, "scope": 'UrlParam' };
                }
                Viewdataset.outputs = Searchoutputs;
            }

            break;

        case 'Report(Grid)':
            // Every column we put on the seach form is an output automatically
            Basepagename = dropIfRight(ByRef_Pagename, '_');
            Viewdataset.header = CStr(Usetype) + ' Search Results for ' + Mid1(Basepagename, Len(Pagenameprefix) + 1);

            if (Len(Predefinedinputs) == 0) {
                Predefinedinputs = [undefined,];
                for (Column of iterateOver(Viewdataset.columns)) {
                    // operator types: "=;<>;>;<;<=;>=;Like ...%;Like %...;Like %...%;InList"
                    // datatypes:      "string;number;boolean;date"
                    // Scope types:    "UrlParam;SessionVar;ApplicationVar;ProfileVar;AppCode;memoryVar"
                    if (Null0(Column.name) != Null0(Column.label) && !isEmpty(Column.label)) _Label = Column.label; else _Label = '';
                    Predefinedinputs[Predefinedinputs.length] = { "and": '1', "lparen": false, "field": Column.name, "name": _Label, "scope": 'UrlParam', "datatype": Column.datatype, "operator": '=', "required": false, "rparen": false, "defaultvalue": '' };
                }
            }

            Viewdataset.inputs = Predefinedinputs;
            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Back', "opento": 10, "url": JSB_BF_NICENAME(CStr(Basepagename)), "confirmop": 2, "passparams": true };

            // PIVOTS ///////
            break;

        case 'Report(Pivot Setup)':
            // Every column we put on the seach form is an output automatically
            Basepagename = dropIfRight(ByRef_Pagename, '_');
            Viewdataset.header = CStr(Usetype) + ' Pivot setup for ' + Mid1(Basepagename, Len(Pagenameprefix) + 1);

            if (Len(Predefinedinputs) == 0) {
                Predefinedinputs = [undefined,];
                for (Column of iterateOver(Viewdataset.columns)) {
                    // operator types: "=;<>;>;<;<=;>=;Like ...%;Like %...;Like %...%;InList"
                    // datatypes:      "string;number;boolean;date"
                    // Scope types:    "UrlParam;SessionVar;ApplicationVar;ProfileVar;AppCode;memoryVar"
                    if (Null0(Column.name) != Null0(Column.label) && !isEmpty(Column.label)) _Label = Column.label; else _Label = '';
                    Predefinedinputs[Predefinedinputs.length] = { "and": '1', "lparen": false, "field": Column.name, "name": _Label, "scope": 'UrlParam', "datatype": Column.datatype, "operator": '=', "required": false, "rparen": false, "defaultvalue": '' };
                }
            }

            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Back', "opento": 10, "url": JSB_BF_NICENAME(CStr(Basepagename)), "confirmop": 2, "passparams": true };
            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Requery Meta', "customcall": 'view_' + CStr(Nicepagename) + '_ReQueryMeta' };

            // Our search form parameters are already setup in the URL - so pass them through
            // add a javascript call to saveRowsAndCols  (opento: 11:  pure javascript in containerName )
            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Next', "opento": 11, "url": JSB_BF_NICENAME(CStr(Basepagename)) + '_pivot', "onParentExtra": 'if (!saveRowsAndCols()) return false; ', "customcall": 'view_' + CStr(Nicepagename) + '_Next', "verifyform": true, "passparams": true, "addoutputs": true };

            break;

        case 'Report(Pivot)':
            Basepagename = dropIfRight(ByRef_Pagename, '_');

            // Every column we put on the seach form is an output automatically
            Viewdataset.header = CStr(Usetype) + ' Pivot Results for ' + Mid1(Basepagename, Len(Pagenameprefix) + 1);

            if (Len(Predefinedinputs) == 0) {
                Predefinedinputs = [undefined,];
                for (Column of iterateOver(Viewdataset.columns)) {
                    // operator types: "=;<>;>;<;<=;>=;Like ...%;Like %...;Like %...%;InList"
                    // datatypes:      "string;number;boolean;date"
                    // Scope types:    "UrlParam;SessionVar;ApplicationVar;ProfileVar;AppCode;memoryVar"
                    if (Null0(Column.name) != Null0(Column.label) && !isEmpty(Column.label)) _Label = Column.label; else _Label = '';
                    Predefinedinputs[Predefinedinputs.length] = { "and": '1', "lparen": false, "field": Column.name, "name": _Label, "scope": 'UrlParam', "datatype": Column.datatype, "operator": '=', "required": false, "rparen": false, "defaultvalue": '' };
                }
            }

            Viewdataset.inputs = Predefinedinputs;
            Viewdataset.custombtns[Viewdataset.custombtns.length] = { "buttontxt": 'Back', "opento": 10, "url": JSB_BF_NICENAME(CStr(Basepagename)) + '_pivotsetup', "confirmop": 2, "passparams": true };

            break;

        case 'Chart':
            Pickinputs = Not(Predefinedinputs);

            break;

        case 'HTML':
    }

    if (CBool(Pickoutputs)) {
        await JSB_MDL_MDLSESSIONSETUP_Sub(Projectname, ByRef_Pagename, Viewname, Viewdataset, function (_Projectname, _ByRef_Pagename, _Viewname, _Viewdataset) { Projectname = _Projectname; ByRef_Pagename = _ByRef_Pagename; Viewname = _Viewname; Viewdataset = _Viewdataset });

        Ans = await JSB_BF_POPUP_JSONDEF(Projectname, 'jsb_jsondefs', 'viewOutputs', 'DEL', 'Add Output Parameter', Viewdataset.outputs, '80%', '80%', 'Outputs for view ' + CStr(Viewname), true, function (_Projectname, _P2, _P3, _P4, _P5, _P6) { Projectname = _Projectname });
        if (Not(isArray(Ans))) { ByRef_Pagename = ''; return exit(undefined); }
        if (Len(Ans)) Viewdataset.outputs = Ans;
    }

    if (CBool(Pickinputs)) {
        await JSB_MDL_MDLSESSIONSETUP_Sub(Projectname, ByRef_Pagename, Viewname, Viewdataset, function (_Projectname, _ByRef_Pagename, _Viewname, _Viewdataset) { Projectname = _Projectname; ByRef_Pagename = _ByRef_Pagename; Viewname = _Viewname; Viewdataset = _Viewdataset });
        Ans = await JSB_BF_POPUP_JSONDEF(Projectname, 'jsb_jsondefs', 'viewInputs', 'DEL', 'Add Input Parameter', Viewdataset.inputs, '80%', '80%', 'Inputs for view ' + CStr(Viewname), true, function (_Projectname, _P2, _P3, _P4, _P5, _P6) { Projectname = _Projectname });
        if (Not(isArray(Ans))) { ByRef_Pagename = ''; return exit(undefined); }
        if (Len(Ans)) Viewdataset.inputs = Ans;
    }

    if (CBool(Pickgridurl)) {
        Ans = (await JSB_BF_POPUP_JSONDEF(Projectname, 'jsb_jsondefs', 'gridPickUrl', 'DEL', 'Add', [undefined, {}], '80%', '80%', 'Click & DblClick selections for view ' + CStr(Viewname), undefined, function (_Projectname, _P2, _P3, _P4, _P5, _P6) { Projectname = _Projectname }));
        if (Not(isArray(Ans))) { ByRef_Pagename = ''; return exit(undefined); }
        if (Len(Ans)) {
            Ans = Ans[LBound(Ans)];
            Viewdataset.gridOpenTo = Ans.gridOpenTo;
            Viewdataset.gridOpenUrl = Ans.gridOpenUrl;
            Viewdataset.gridOpenExtra = Ans.gridOpenExtra;
            Viewdataset.passThruParams = Ans.passThruParams;
            Viewdataset.addFromUrl = Ans.addFromUrl;

            Viewdataset.gridDblOpenTo = Ans.gridDblOpenTo;
            Viewdataset.gridDblOpenUrl = Ans.gridDblOpenUrl;
            Viewdataset.gridDblOpenExtra = Ans.gridDblOpenExtra;
            Viewdataset.passDblThruParams = Ans.passDblThruParams;
            Viewdataset.addDblFromUrl = Ans.addDblFromUrl;
        }
    }

    if (await JSB_ODB_WRITEJSON(Viewdataset, Fdictproject, CStr(Viewname))); else return Stop(At(-1), 'Edp-', System(28), ': ', activeProcess.At_Errors);

    if (await JSB_ODB_WRITEJSON(Pagedataset, Fdictproject, ByRef_Pagename + '.page')); else return Stop(At(-1), 'Edp-', System(28), ': ', activeProcess.At_Errors);

    await JSB_MDL_REGENPAGEMODEL_Sub(Projectname, ByRef_Pagename, false);

    return exit(true);
}
// </NEWPAGE>

// <NEWROW>
async function JSB_MDL_NEWROW(ByRef_Objectname, ByRef_Columns, setByRefValues) {
    // local variables
    var Newrow;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Objectname, ByRef_Columns)
        return v
    }
    Newrow = {};
    await JSB_MDL_SETDEFAULTS(ByRef_Objectname, ByRef_Columns, Newrow, function (_ByRef_Objectname, _ByRef_Columns, _Newrow) { ByRef_Objectname = _ByRef_Objectname; ByRef_Columns = _ByRef_Columns; Newrow = _Newrow });
    return exit(Newrow);
}
// </NEWROW>

// <NEWSEARCHTYPE>
async function JSB_MDL_NEWSEARCHTYPE(Projectname, Databasename, Tblid_Or_Sql, Visiblecolumns) {
    // local variables
    var Rptid, Priordataset, Searchtypearray, Searchtypes, Jsconditional;
    var Jscondreflist, Jscondreffile, Fielddefinitions, Isselect;
    var Schemacolumns, Columnnames, Ignoretypes, Dataset, Default_Latname;
    var Default_Lngname, Column, Columni, Cname, Lcname, Dt, Sf;
    var Priorrow, Priorfield, Reflist, Datatype, Rf, V, _Html;
    var Jsscript, Btns, Btn, Collatitude, Collongitude, Sresults;
    var Isautopostback, Passed, Fdicthandle, J;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                // %options aspxC-

                if (CBool(Projectname)) {
                    Rptid = 'rptdef_' + JSB_BF_NICENAME(CStr(Projectname)) + '_' + JSB_BF_NICENAME(CStr(Tblid_Or_Sql)) + '.rpt';
                } else {
                    Projectname = 'css';
                    Rptid = 'rptdef_' + JSB_BF_NICENAME(CStr(Databasename)) + '_' + JSB_BF_NICENAME(CStr(Tblid_Or_Sql)) + '.rpt';
                }

                if (await JSB_ODB_READJSON(Priordataset, await JSB_BF_FHANDLE('dict', 'dbBuilderReports'), CStr(Rptid), function (_Priordataset) { Priordataset = _Priordataset })); else Priordataset = [undefined,];


            case "STARTOVER":

                Searchtypearray = [undefined,];
                Searchtypearray[Searchtypearray.length] = 'an exact string match';
                Searchtypearray[Searchtypearray.length] = 'partial string match';
                Searchtypearray[Searchtypearray.length] = 'string starts with';
                Searchtypearray[Searchtypearray.length] = 'string ends with';
                Searchtypearray[Searchtypearray.length] = 'an exact numeric value';
                Searchtypearray[Searchtypearray.length] = 'year range';
                Searchtypearray[Searchtypearray.length] = 'an exact date';
                Searchtypearray[Searchtypearray.length] = 'date range';
                Searchtypearray[Searchtypearray.length] = 'time range';
                Searchtypearray[Searchtypearray.length] = 'numeric range (inclusive)';
                Searchtypearray[Searchtypearray.length] = 'numeric range (exclusive)';
                Searchtypearray[Searchtypearray.length] = 'GUID';

                Searchtypearray[Searchtypearray.length] = 'dropdown (literal)';
                Searchtypearray[Searchtypearray.length] = 'dropdown (ref-file)';
                Searchtypearray[Searchtypearray.length] = 'dropdown (derived)';
                Searchtypearray[Searchtypearray.length] = 'dropdown (derive now)';
                Searchtypearray[Searchtypearray.length] = 'dropdown (Year(derived))';
                Searchtypearray[Searchtypearray.length] = 'dropdown (Year(derive now))';

                Searchtypearray[Searchtypearray.length] = 'autocomplete (ref-file)';
                Searchtypearray[Searchtypearray.length] = 'autocomplete (derived)';

                Searchtypearray[Searchtypearray.length] = 'multi-select (literal)';
                Searchtypearray[Searchtypearray.length] = 'multi-select (ref-file)';
                Searchtypearray[Searchtypearray.length] = 'multi-select (derived)';
                Searchtypearray[Searchtypearray.length] = 'multi-select (derive now)';
                Searchtypearray[Searchtypearray.length] = 'multi-select (Year(derived))';
                Searchtypearray[Searchtypearray.length] = 'multi-select (Year(derive now))';

                Searchtypes = Join(Searchtypearray, ';');

                // Definitions for knockOut (can build these with EDV and get the dict .view)
                Jsconditional = [undefined, { "allany": 'All', "block": 'a', "jsfunction": 'cssVisibility', "field": 'queryfield', "operator": '=', "tovalue": '1' }];

                Jscondreflist = [undefined, { "allany": 'All', "block": 'a', "jsfunction": 'cssVisibility', "field": 'queryfield', "operator": '=', "tovalue": '1' },

                    { "allany": 'All', "block": 'a', "jsfunction": 'cssVisibility', "field": 'reffile', "operator": '=', "tovalue": '""' },
                    { "allany": 'Any', "block": 'b', "jsfunction": 'cssVisibility', "field": 'searchType', "operator": 'InList', "tovalue": '["dropdown (literal)", "multi-select (literal)", "autocomplete (literal)"]' }
                ];

                Jscondreffile = [undefined, { "allany": 'All', "block": 'a', "jsfunction": 'cssVisibility', "field": 'queryfield', "operator": '=', "tovalue": '1' },
                    { "allany": 'All', "block": 'a', "jsfunction": 'cssVisibility', "field": 'searchType', "operator": 'InList', "tovalue": '["dropdown (ref-file)","multi-select (ref-file)","autocomplete (ref-file)"]' }
                ];

                Fielddefinitions = ([undefined,
                    { "name": 'queryfield', "label": 'On Selection Screen', "datatype": 'boolean', "control": 'checkbox', "canedit": true, "required": false, "notblank": true, "defaultvalue": '0' },
                    { "name": 'displayfield', "label": 'Display in Grid', "datatype": 'boolean', "control": 'checkbox', "canedit": true, "required": false, "notblank": true, "defaultvalue": '1' },
                    { "name": 'editfield', "label": 'On Edit Page', "datatype": 'boolean', "control": 'checkbox', "canedit": true, "required": false, "notblank": true, "defaultvalue": '1' },

                    { "name": 'name', "label": 'Field', "datatype": 'string', "control": 'label' },
                    { "name": 'label', "index": 11, "label": 'Label', "control": 'textbox', "canedit": true, "required": true, "notblank": true },
                    { "name": 'searchType', "label": 'Search Type', "datatype": 'string', "width": '200px', "control": 'dropDownBox', "canedit": true, "required": false, "notblank": true, "defaultvalue": 'string', "reflist": Searchtypes, "jsconditionals": Jsconditional },
                    { "name": 'required', "label": 'Required', "datatype": 'boolean', "control": 'checkbox', "canedit": true, "required": false, "notblank": true, "defaultvalue": '1', "jsconditionals": Jsconditional },

                    { "name": 'reffile', "index": 21, "label": 'Select Pic File', "width": '200px', "control": 'comboBox', "canedit": true, "required": false, "notblank": false, "reffile": '{listfiles}', "jsconditionals": Jscondreffile },
                    { "name": 'refpk', "index": 23, "label": 'Ref Value Field', "width": '12em', "control": 'cascadingDropDownBox', "parentCtlID": 'reffile', "canedit": true, "required": false, "notblank": false, "customRoutine": 'mdlGetRefFields?databaseName={databaseName}&tableName={tablename}', "jsconditionals": Jscondreffile },
                    { "name": 'refdisplay', "index": 24, "label": 'Ref Display Field', "width": '12em', "control": 'cascadingDropDownBox', "parentCtlID": 'reffile', "canedit": true, "required": false, "notblank": false, "customRoutine": 'mdlGetRefFields?databaseName={databaseName}&tableName={tablename}', "jsconditionals": Jscondreffile },

                    { "name": 'reflist', "index": 26, "label": 'Ref List', "width": 23, "control": 'textbox', "canedit": true, "required": false, "notblank": false, "jsconditionals": Jscondreflist, "tooltip": 'Lbl,Val;.. Or Lbl,Lbl,..' }
                ]);

                // {name:'operator', label:'Operator', datatype: 'string', width:12, control:'dropDownBox', canedit:true, required: false, notblank: false, defaultvalue:"Dynamic", reflist: "=;<>;>;<;<=;>=;Like ...%;Like %...;Like %...%;InList;Dynamic", jsconditionals: jsconditional },
                Isselect = LCase(Left(Tblid_Or_Sql, 7)) == 'select ';

                // Get the schemaColumns
                Schemacolumns = await JSB_MDL_GETCOLUMNDEFINITIONS(Tblid_Or_Sql, Columnnames, function (_Columnnames) { Columnnames = _Columnnames });

                // numericTypes = Split("autointeger;integer;double;currency", ";")
                // dateTypes = Split("date;time;datetime", ";")
                // stringTypes = Split("memo;string", ";")
                // ignoreNames = Split("llid;lat;lon;lng;latitude;longitude", ";")

                Ignoretypes = Split('guid;blob;png;jpg;password;json;jsonarray', ';');

                Visiblecolumns = Split(LCase(Visiblecolumns), ',');

                Dataset = [undefined,];
                Columnnames = [undefined,];
                Default_Latname = '';
                Default_Lngname = '';

                Columni = LBound(Schemacolumns) - 1;
                for (Column of iterateOver(Schemacolumns)) {
                    Columni++;
                    Cname = Column.name;
                    if (Not(Cname)) continue;

                    Lcname = LCase(Cname);

                    Dt = Column.datatype;
                    if (Locate(Dt, Ignoretypes, 0, 0, 0, "", position => { })) continue;
                    if (Left(Lcname, 4) == 'aud_') continue;
                    if (Lcname == 'llid') continue;

                    Columnnames[Columnnames.length] = Column.name;

                    Sf = clone(Column);
                    Sf.queryfield = false;
                    Sf.displayfield = true;
                    Sf.editfield = false;
                    Sf.required = false;
                    Sf.datatype = Dt;

                    // Get previous changes when editing dataset
                    for (Priorrow of iterateOver(Priordataset)) {
                        if (Null0(Priorrow.name) == Null0(Sf.name)) {
                            Priorfield = Priorrow;
                            break;
                        }
                        Priorrow = {};
                    }

                    if (CBool(Priorrow)) {
                        Sf.queryfield = Priorrow.queryfield;
                        Sf.displayfield = Priorrow.displayfield;
                        Sf.editfield = Priorrow.editfield;
                        Sf.label = Priorrow.label;
                        Sf.searchType = Priorrow.searchType;
                        Sf.required = Priorrow.required;
                        Sf.reffile = Priorrow.reffile;
                        Sf.refpk = Priorrow.refpk;
                        Sf.refdisplay = Priorrow.refdisplay;
                        Sf.reflist = Priorrow.reflist;
                        Sf.isLatitude = Priorrow.isLatitude;
                        Sf.isLongitude = Priorrow.isLongitude;;
                    } else {
                        if (Not(Default_Latname)) if (InStr1(1, Lcname, 'latitude')) Default_Latname = Cname;
                        if (Not(Default_Lngname)) if (InStr1(1, Lcname, 'longitude')) Default_Lngname = Cname;

                        if (Not(Default_Lngname)) if (InStr1(1, Lcname, 'lng') || InStr1(1, Lcname, 'long')) Default_Lngname = Cname;
                        if (Not(Default_Latname)) if (InStr1(1, Lcname, 'lat')) Default_Latname = Cname;

                        if (Right(Lcname, 5) == 'codes') {
                            Sf.queryfield = true;
                            Sf.searchType = 'dropdown (ref-file)';;
                        } else if (Left(Lcname, 4) == 'pic_' || InStr1(1, Lcname, '_pic_')) {
                            Sf.queryfield = true;
                            Sf.searchType = 'dropdown (ref-file)';;
                        } else if (Dt == 'guid') {
                            Sf.queryfield = false;
                            Sf.searchType = 'GUID';;
                        } else if (InStr1(1, Lcname, 'year')) {
                            Sf.queryfield = true;
                            Sf.searchType = 'multi-select Year() dropdown';;
                        } else if (Dt == 'date') {
                            if (InStr1(1, Lcname, 'start') || InStr1(1, Lcname, 'end')) {
                                Sf.queryfield = true;
                                Sf.searchType = 'date';
                            } else {
                                Sf.queryfield = true;
                                Sf.searchType = 'date range';
                            }
                        } else if (Dt == 'autointeger' || Dt == 'integer') {
                            Sf.queryfield = true;
                            Sf.searchType = 'an exact numeric value';;
                        } else if (Dt == 'double' || Dt == 'currency') {
                            Sf.queryfield = true;
                            Sf.searchType = 'numeric range (inclusive)';;
                        } else if (Dt == 'boolean') {
                            Sf.queryfield = true;
                            Sf.searchType = 'dropdown (literal)';
                            Sf.reflist = 'True,1;False,0';;
                        } else if (InStr1(1, Lcname, 'date')) {
                            Sf.queryfield = true;
                            Sf.searchType = 'date range';;
                        } else {
                            Reflist = await JSB_MDL_GETDISTINCTVALUES(Tblid_Or_Sql, Column.name, 40, Datatype, function (_Tblid_Or_Sql, _P2, _P3, _Datatype) { Tblid_Or_Sql = _Tblid_Or_Sql; Datatype = _Datatype });

                            if (Len(Reflist) > 1 && Len(Reflist) < 40) {
                                if (Len(Reflist) < 5) {
                                    Rf = [undefined,];
                                    for (V of iterateOver(Reflist)) {
                                        Rf[Rf.length] = LTrim(RTrim(V));
                                    }
                                    Sf.reflist = Join(Rf, ';');
                                    Sf.searchType = 'dropdown (literal)';
                                } else {
                                    Sf.searchType = 'dropdown (derived)';
                                }
                            } else {
                                Sf.queryfield = true;
                                Sf.searchType = 'partial string match';
                            }
                        }
                    }

                    if (CBool(Visiblecolumns)) {
                        if (Locate(Lcname, Visiblecolumns, 0, 0, 0, "", position => { })); else Sf.queryfield = false;
                    }

                    if (CBool(Sf.isLatitude)) Default_Latname = Sf.name;
                    if (CBool(Sf.isLongitude)) Default_Lngname = Sf.name;

                    Dataset[Dataset.length] = Sf;
                }

                if (Not(Projectname)) Projectname = 'searchType';


                do {

                    _Html = [undefined,];
                    _Html[_Html.length] = html('\<input id=\'dataset\' name=\'dataset\' type="hidden" value=\'\' /\>');

                    _Html[_Html.length] = H1('Select columns for the Selection Screen, the display grid, and the edit screen for the ' + CStr(Tblid_Or_Sql) + ' report') + crlf;

                    _Html[_Html.length] = JSB_HTML_REPEATERLOAD(CStr(Projectname), undefined, Dataset);
                    _Html[_Html.length] = await JSB_CTLS_REPEATERGRIDBACKGROUND(CStr(Projectname), CStr(Projectname), { "columns": Fielddefinitions, "attachdb": Databasename, "tableName": Tblid_Or_Sql }, Dataset, '', false, '', '');

                    Jsscript = await JSB_BF_JSCONDITIONALSSCRIPT(CStr(Projectname), Fielddefinitions, true);
                    if (CBool(Jsscript)) _Html[_Html.length] = JSB_HTML_SCRIPT(CStr(Jsscript));

                    _Html[_Html.length] = html('\<br\>GPS Coordinate columns:\<br\>');
                    _Html[_Html.length] = Label('Longitude: ', 'colLongitude') + DropDownBox('colLongitude', Columnnames, CStr(Default_Lngname), true);
                    _Html[_Html.length] = Label('Latitude: ', 'colLatitude') + DropDownBox('colLatitude', Columnnames, CStr(Default_Latname), true);
                    _Html[_Html.length] = html('\<br\>');

                    // Add some btns
                    Btns = [undefined,];
                    Btns[Btns.length] = JSB_HTML_SUBMITBTN('Btn', 'OK', { "onclick": 'storeVal(\'dataset\', ko.toJSON(koModel.' + CStr(Projectname) + '))' });
                    Btns[Btns.length] = JSB_HTML_SUBMITBTN('Btn', 'Cancel', { "onclick": 'parsleyDestroy(); storeVal(\'dataset\', ko.toJSON(koModel.' + CStr(Projectname) + '))' });
                    Btns[Btns.length] = JSB_HTML_SUBMITBTN('Btn', 'Reset', { "onclick": 'parsleyDestroy(); storeVal(\'dataset\', ko.toJSON(koModel.' + CStr(Projectname) + '))' });

                    Btns[Btns.length] = Button('BtnSelectAll', 'Select None', {
                        "onclick": '\r\n\
                 var ck = $(\'#BtnSelectAll\').text() == \'Select All\'; \r\n\
                 if (ck) $(\'#BtnSelectAll\').text(\'Select None\'); else $(\'#BtnSelectAll\').text(\'Select All\');\r\n\
                 koModel.' + CStr(Projectname) + '().forEach(function(item, index) { item.queryfield(ck) } );\r\n\
                 $("[id^=\'queryfield_\'").each(function () { $(this).trigger(\'change\') });\r\n\
            '});

                    Btns[Btns.length] = Button('BtnDisplayAll', 'Display None', {
                        "onclick": '\r\n\
                var ck = $(\'#BtnDisplayAll\').text() == \'Display All\'; \r\n\
                if (ck) $(\'#BtnDisplayAll\').text(\'Display None\'); else $(\'#BtnDisplayAll\').text(\'Display All\');\r\n\
                koModel.' + CStr(Projectname) + '().forEach(function(item, index) { item.displayfield(ck) } );\r\n\
                $("[id^=\'displayfield_\'").each(function () { $(this).trigger(\'change\') });\r\n\
            '});

                    Btns[Btns.length] = Button('BtnEditAll', 'Edit None', {
                        "onclick": '\r\n\
                var ck = $(\'#BtnEditAll\').text() == \'Edit All\'; \r\n\
                if (ck) $(\'#BtnEditAll\').text(\'Edit None\'); else $(\'#BtnEditAll\').text(\'Edit All\');\r\n\
                koModel.' + CStr(Projectname) + '().forEach(function(item, index) { item.editfield(ck) } );\r\n\
                $("[id^=\'editfield_\'").each(function () { $(this).trigger(\'change\') });\r\n\
            '});

                    _Html[_Html.length] = Center(Join(Btns, ''));

                    Print(Join(_Html, ''));
                    await At_Server.asyncPause(me);

                    // Unload
                    Btn = formVar('Btn');
                    Collatitude = formVar('colLatitude');
                    Collongitude = formVar('colLongitude');
                    Sresults = FORMVAR('dataset');
                    Isautopostback = formVar('isAutoPostBack');

                    // Process command
                    if (Btn == 'Cancel') return false;

                    Dataset = parseJSON(Sresults);
                    for (Sf of iterateOver(Dataset)) {
                        delete Sf['__ko_mapping__']
                    }

                    // Clear any column that thinks is a lat or a long and reset with given values
                    for (Sf of iterateOver(Dataset)) {
                        if (CBool(Sf.isLatitude) || CBool(Sf.isLongitude)) {
                            delete Sf['isLatitude']
                            delete Sf['isLongitude'];
                        }
                    }

                    if (CBool(Collatitude) || CBool(Collongitude)) {
                        for (Sf of iterateOver(Dataset)) {
                            if (Null0(Sf.name) == Null0(Collatitude)) Sf.isLatitude = true;
                            if (Null0(Sf.name) == Null0(Collongitude)) Sf.isLongitude = true;
                        }
                    }

                    if (CBool(Isautopostback)) continue;

                    if (Btn == 'Reset') {
                        if (await JSB_BF_MSGBOX('Are you sure you want to reset the grid?', 'Yes,*No') == 'Yes') {
                            Priordataset = [undefined,];
                            gotoLabel = "STARTOVER"; continue atgoto;
                        }
                    }

                    // Check proper pic-list setup
                    Passed = true;
                    for (Sf of iterateOver(Dataset)) {
                        if (CBool(Sf.queryfield) && Sf.searchType == 'dropdown (literal)' && Not(Sf.reflist)) {
                            await JSB_BF_MSGBOX('You need to complete your pic-list on column: ' + CStr(Sf.name));
                            Passed = false;
                            break;
                        }
                        if (CBool(Sf.queryfield) && Sf.searchType == 'dropdown (ref-file)' && (Not(Sf.reffile) || Not(Sf.refpk))) {
                            await JSB_BF_MSGBOX('You need to complete your pic-file fields on column: ' + CStr(Sf.name));
                            Passed = false;
                            break;
                        }
                    }
                }
                while (Not(CBool(Passed)));

                // Did we need update any labels?
                if (Not(Isselect)) {
                    Fdicthandle = await JSB_BF_FHANDLE('dict', Tblid_Or_Sql);
                    for (Sf of iterateOver(Dataset)) {
                        if (CBool(Sf.queryfield) && Trim(Sf.label)) {
                            for (Column of iterateOver(Schemacolumns)) {
                                if (Null0(Sf.name) == Null0(Column.name)) {
                                    if (Null0(Sf.label) != Null0(Column.label)) {
                                        if (await JSB_ODB_READJSON(J, Fdicthandle, '!' + CStr(Column.name), function (_J) { J = _J })) {
                                            J.label = Sf.label;
                                            if (await JSB_ODB_WRITEJSON(J, Fdicthandle, '!' + CStr(Column.name))); else null;
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('dict', 'dbBuilderReports'), CStr(Rptid))); else null;
                return Dataset;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </NEWSEARCHTYPE>

// <NEWWEBSITEMODEL_Pgm>
async function JSB_MDL_NEWWEBSITEMODEL_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Frompage, Title, Actname;

    // %options aspxC-
    if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a manager to run this command');
    Frompage = paramVar('fromPage');

    Title = 'New Project';

    while (true) {
        Actname = await JSB_BF_INPUTBOX(Title, 'New Web Site Name', '', '80%', '', function (_Title) { Title = _Title });
        if (Actname == Chr(27) || isEmpty(Actname)) { if (CBool(Frompage)) return At_Response.Redirect(Frompage); else return; }
        Actname = JSB_BF_NICENAME(CStr(Actname));
        if (await JSB_BF_CREATEACCOUNT(CStr(Actname))) break;
        await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors))
    }

    // Get them to create a basic page
    return At_Response.Redirect(HtmlRoot() + CStr(Actname) + '/edp%20BP%20' + CStr(Actname));
}
// </NEWWEBSITEMODEL_Pgm>

// <NEXTROWISDIFFERENT>
async function JSB_MDL_NEXTROWISDIFFERENT(ByRef_Settings, ByRef_Rows, ByRef_Nxtrowi, setByRefValues) {
    // local variables
    var Nxtrow, Nxtrowcc, Minimumcolumns;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Settings, ByRef_Rows, ByRef_Nxtrowi)
        return v
    }
    // Make sure the next row has at least 60% of the Header Columns
    if (CBool(ByRef_Settings.SideBySideTables)) { Nxtrow = await JSB_MDL_GETROW(ByRef_Settings, ByRef_Rows, ByRef_Nxtrowi, function (_ByRef_Settings, _ByRef_Rows, _ByRef_Nxtrowi) { ByRef_Settings = _ByRef_Settings; ByRef_Rows = _ByRef_Rows; ByRef_Nxtrowi = _ByRef_Nxtrowi }); } else Nxtrow = ByRef_Rows[ByRef_Nxtrowi];
    if (Not(Nxtrow)) return exit(true);

    Nxtrowcc = UBound(Nxtrow);
    if (Not(Nxtrowcc)) return exit(true);

    if (Null0(Nxtrowcc) > UBound(ByRef_Settings.HdrRow)) return exit(true);

    if (CBool(ByRef_Settings.SideBySideTables)) {
        if (!Join(Nxtrow, '')) return exit(true);
    }

    if (Null0(ByRef_Nxtrowi) < 100) {
        Minimumcolumns = UBound(ByRef_Settings.HdrRow) * 0.40;
        return exit(Null0(Nxtrowcc) < Null0(Minimumcolumns));
    }

    return exit(false);
}
// </NEXTROWISDIFFERENT>

// <OKAYTOOUTPUTTBL>
async function JSB_MDL_OKAYTOOUTPUTTBL(ByRef_Settings, ByRef_Tbl, Sheetname, setByRefValues) {
    // local variables
    var Rowcnt, Colcnt;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Settings, ByRef_Tbl)
        return v
    }
    Rowcnt = UBound(ByRef_Tbl);
    if (CBool(ByRef_Settings.ignoreTablesWithNoRows) && Null0(Rowcnt) <= 1) {
        activeProcess.At_Errors = 'Ignored... not enough rows';
        return exit(false);
    }

    ByRef_Settings.HdrRow = ByRef_Tbl[1];
    Colcnt = UBound(ByRef_Settings.HdrRow);
    if (Null0(Colcnt) < Null0(ByRef_Settings.ignoreTablesWithLessThanNColumns)) {
        activeProcess.At_Errors = 'Ignored... not enough columns';
        return exit(false);
    }

    return exit(true);
}
// </OKAYTOOUTPUTTBL>

// <OPENTABLEANDCHECKID>
async function JSB_MDL_OPENTABLEANDCHECKID(ByRef_Objectmodel, ByRef_Viewname, ByRef_Ftable, ByRef_Pkid, ByRef_Rtnerrors, setByRefValues) {
    // local variables
    var Tblname;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Objectmodel, ByRef_Viewname, ByRef_Ftable, ByRef_Pkid, ByRef_Rtnerrors)
        return v
    }
    // %options aspxC-

    if (isEmpty(ByRef_Objectmodel.tableName)) Tblname = 'applications'; else Tblname = ByRef_Objectmodel.tableName;

    if (isEmpty(ByRef_Pkid)) {
        ByRef_Rtnerrors = 'This record in \'' + CStr(ByRef_Viewname) + '\' does not have a primary key and autokeys are not enabled.';
        return exit(false);
    }

    return exit(await JSB_BF_OPENTABLE(CStr(ByRef_Objectmodel.tableName), CStr(ByRef_Viewname), ByRef_Ftable, ByRef_Rtnerrors, function (_ByRef_Ftable, _ByRef_Rtnerrors) { ByRef_Ftable = _ByRef_Ftable; ByRef_Rtnerrors = _ByRef_Rtnerrors }));
}
// </OPENTABLEANDCHECKID>

// <ORDERBUTTONS_Sub>
async function JSB_MDL_ORDERBUTTONS_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, setByRefValues) {
    // local variables
    var Objectmodel, Btnnames, Btn, Neworder, Btnname;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname)
        return v
    }
    // %options aspxC-

    if (await JSB_ODB_READJSON(Objectmodel, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Objectmodel) { Objectmodel = _Objectmodel })); else return exit(undefined);

    Btnnames = [undefined,];
    for (Btn of iterateOver(Objectmodel.custombtns)) {
        Btnnames[Btnnames.length] = Btn.buttontxt;
    }

    Btnnames = await JSB_BF_INPUTSORTABLELIST('Order Buttons', 'Order Buttons:', CStr(Btnnames), '50%', '80%');
    if (isEmpty(Btnnames) || Btnnames == Chr(27)) return exit(undefined);

    Neworder = [undefined,];
    for (Btnname of iterateOver(Btnnames)) {
        for (Btn of iterateOver(Objectmodel.custombtns)) {
            if (Null0(Btn.buttontxt) == Null0(Btnname)) Neworder[Neworder.length] = Btn;
        }
    }

    Objectmodel.custombtns = Neworder;
    if (await JSB_ODB_WRITEJSON(Objectmodel, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </ORDERBUTTONS_Sub>

// <ORDERCOLUMNS_Sub>
async function JSB_MDL_ORDERCOLUMNS_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, setByRefValues) {
    // local variables
    var Dataset, Allcolumns, Column, Cname, Selectedcols, Newcolumns;
    var Columnname;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname)
        return v
    }
    // %options aspxC-

    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);

    Allcolumns = [undefined,];
    for (Column of iterateOver(Dataset.columns)) {
        Cname = Trim(Column.name);
        if (CBool(Cname)) Allcolumns[Allcolumns.length] = Cname;
    }

    Selectedcols = await JSB_BF_INPUTSORTABLELIST('Order Columns', 'Order columns:', CStr(Allcolumns), '50%', '80%');
    if (isEmpty(Selectedcols) || Selectedcols == Chr(27)) return exit(undefined);

    Newcolumns = [undefined,];
    for (Columnname of iterateOver(Selectedcols)) {
        for (Column of iterateOver(Dataset.columns)) {
            if (Null0(Column.name) == Null0(Columnname)) Newcolumns[Newcolumns.length] = Column;
        }
    }

    Dataset.columns = Newcolumns;
    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </ORDERCOLUMNS_Sub>

// <ORDERDISTINCTVALUES>
async function JSB_MDL_ORDERDISTINCTVALUES(ByRef_Ss, ByRef_Field, ByRef_Limitno, ByRef_Sortorder, setByRefValues) {
    // local variables
    var Dfields, Ub, Reflist, Row, Rowi, V;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Ss, ByRef_Field, ByRef_Limitno, ByRef_Sortorder)
        return v
    }
    Dfields = getList(ByRef_Ss);
    Ub = UBound(Dfields);

    // print field:" ":UB; @server.flush
    // debug

    if (CBool(ByRef_Limitno) && Null0(Ub) > Null0(ByRef_Limitno)) return exit([undefined,]);

    if (Null0(Ub) > 200) {
        await JSB_BF_MSGBOX('Excessive data!', 'Your field \'' + CStr(ByRef_Field) + '\' has ' + CStr(UBound(Dfields)) + ' distinct values.  It will be limited to 200');
        if (CBool(isAdmin())) { Print(); debugger; }
        Ub = 200;
    }

    // Make JSON into an array
    Reflist = [undefined,];
    Rowi = LBound(Dfields) - 1;
    for (Row of iterateOver(Dfields)) {
        Rowi++;
        V = Row[ByRef_Field];
        if (CBool(V)) Reflist[Reflist.length] = V;
        if (Null0(Rowi) > Null0(Ub)) break;
    }

    return exit(Sort(Reflist, ByRef_Sortorder));
}
// </ORDERDISTINCTVALUES>

// <OUTPUTTABLE>
async function JSB_MDL_OUTPUTTABLE(ByRef_Settings, ByRef_Tbl, Sheetname, setByRefValues) {
    // local variables
    var Rowcnt, Dbtblname, Colcnt, Jsarray, Stepsize, Rowi, Row;
    var Rec, Name, Coli, Forceallownulls, Primarykeyname, Lastfailedrowi;
    var Columndefs, Sqlhandle, Hdrs, Cnu, I;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                function exit(v) {
                    if (typeof setByRefValues == 'function') setByRefValues(ByRef_Settings, ByRef_Tbl)
                    return v
                }
                Rowcnt = UBound(ByRef_Tbl);

                // give a different name if 1st Tbl in the set
                if (CBool(ByRef_Settings.SheetTblCnt)) {
                    Sheetname = CStr(Sheetname) + ' (' + CStr(ByRef_Settings.firstR) + ':' + CStr(ByRef_Settings.FirstC) + ')';
                } else {
                    Sheetname = Sheetname;
                }

                // Shorten name
                Dbtblname = CStr(ByRef_Settings.XlsFileName) + '\\' + CStr(Sheetname);

                ByRef_Settings.HdrRow = ByRef_Tbl[1];
                Colcnt = UBound(ByRef_Settings.HdrRow);

                ByRef_Settings.SheetTblCnt++;

                // Convert upto the 1st 1000 Rows to json to get an analysis
                Jsarray = [undefined,];
                Stepsize = CInt(+Rowcnt / 100) + 1;

                var _ForEndI_2 = +Rowcnt;
                for (Rowi = 2; (+Stepsize >= 0) ? (Rowi <= _ForEndI_2) : (Rowi >= _ForEndI_2); Rowi += +Stepsize) {
                    Row = ByRef_Tbl[Rowi];
                    Rec = { "RowNumber": Rowi };
                    Coli = LBound(ByRef_Settings.HdrRow) - 1;
                    for (Name of iterateOver(ByRef_Settings.HdrRow)) {
                        Coli++;
                        if (CBool(Name)) Rec[Name] = Row[Coli];
                    }
                    Jsarray[Jsarray.length] = Rec;
                }

                Forceallownulls = true;
                Primarykeyname = 'RowNumber';

                Lastfailedrowi = 0;

            case "REDO":

                await JSB_MDL_STATUSPRINT_Sub('Sheet \'' + CStr(Dbtblname) + '\' of ' + CStr(Rowcnt) + ' Rows and ' + CStr(UBound(ByRef_Settings.HdrRow)) + ' columns');

                Columndefs = await JSB_BF_ANALYSEJSON(Jsarray, Primarykeyname, +Forceallownulls, function (_Primarykeyname) { Primarykeyname = _Primarykeyname });

                // Create a new table
                Dbtblname = Change(Dbtblname, '\'', '');

                if (CBool(ByRef_Settings.deleteAndRecreateTables)) {
                    if (await JSB_ODB_OPEN('', CStr(Dbtblname), Sqlhandle, function (_Sqlhandle) { Sqlhandle = _Sqlhandle })) {
                        if (JSB_BF_TYPEOFFILE(Sqlhandle) == 'ado') {
                            if (await JSB_ODB_DELETEFILE(Sqlhandle)); else return exit(false);
                        }
                    }
                }

                if (await JSB_ODB_OPEN('', CStr(Dbtblname), Sqlhandle, function (_Sqlhandle) { Sqlhandle = _Sqlhandle })); else {
                    if (CBool(await JSB_MDL_CREATETABLE(Dbtblname, Columndefs, Forceallownulls, function (_Dbtblname, _Columndefs, _Forceallownulls) { Dbtblname = _Dbtblname; Columndefs = _Columndefs; Forceallownulls = _Forceallownulls }))); else {
                        Print(); debugger;
                        // Return False;
                    }

                    if (await JSB_ODB_OPEN('', CStr(Dbtblname), Sqlhandle, function (_Sqlhandle) { Sqlhandle = _Sqlhandle })); else {
                        Print(); debugger;
                        return exit(false);
                    }
                }

                // Write out the records
                var _ForEndI_11 = UBound(ByRef_Tbl);
                for (Rowi = 2; Rowi <= _ForEndI_11; Rowi++) {
                    Row = ByRef_Tbl[Rowi];
                    Rec = { "RowNumber": Rowi };
                    Coli = LBound(ByRef_Settings.HdrRow) - 1;
                    for (Name of iterateOver(ByRef_Settings.HdrRow)) {
                        Coli++;
                        if (CBool(Name)) {
                            Rec[Name] = Row[Coli];
                        }
                    }

                    if (await JSB_ODB_WRITEJSON(Rec, Sqlhandle, CStr(Rec[Primarykeyname]))); else {
                        if (CBool(ByRef_Settings.deleteAndRecreateTables) && InStr1(1, activeProcess.At_Errors, 'truncated')) {
                            if (Null0(Rowi) > Null0(Lastfailedrowi)) {
                                Lastfailedrowi = Rowi;

                                var _ForEndI_16 = +Rowi + 100;
                                for (Rowi = +Rowi; (Rowi <= _ForEndI_16) && Null0(Rowi) <= UBound(ByRef_Tbl); Rowi++) {
                                    Row = ByRef_Tbl[Rowi];
                                    Rec = { "RowNumber": Rowi };
                                    Coli = LBound(ByRef_Settings.HdrRow) - 1;
                                    for (Name of iterateOver(ByRef_Settings.HdrRow)) {
                                        Coli++;
                                        if (CBool(Name)) Rec[Name] = Row[Coli];
                                    }

                                    Jsarray[Jsarray.length] = Rec;
                                }

                                await JSB_MDL_STATUSPRINT_Sub('Redoing analysis of metadata');
                                gotoLabel = "REDO"; continue atgoto;
                            }
                        }

                        activeProcess.At_Errors = CStr(activeProcess.At_Errors) + crlf + CStr(Rec);
                        return exit(false);
                    }

                    if (Rowi % 1000 == 0) await JSB_MDL_STATUSPRINT_Sub('Writing row ' + CStr(Rowi) + ' of ' + CStr(UBound(ByRef_Tbl)));
                }

                // record column names
                Hdrs = {};
                Cnu = ByRef_Settings.columnNamesUsed;
                I = LBound(ByRef_Settings.HdrRow) - 1;
                for (Name of iterateOver(ByRef_Settings.HdrRow)) {
                    I++;
                    if (CBool(Name)) {
                        Hdrs[Name] = I;
                        if (Locate(Name, Cnu, 0, 0, 0, "", position => { })); else Cnu[Cnu.length] = Name;
                    }
                }

                return exit(true);


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </OUTPUTTABLE>

// <PICKATABLE>
async function JSB_MDL_PICKATABLE(Defaulttablename, Title) {
    // local variables
    var Tables, Tablename, Newtablename, Fh;

    // %options aspxC-

    if (Not(Title)) Title = 'Pick a Table';

    Tables = await JSB_BF_FILELIST(CStr(false), true);
    Tables = Sort(Tables, 'LAI');
    Tables[Tables.length] = '*New Table*';
    Tablename = await JSB_BF_INPUTLISTBOX(CStr(Title), 'pick a Table', CStr(Tables), CStr(Defaulttablename));
    if (Tablename == Chr(27)) return '';
    if (Tablename != '*New Table*') return Tablename;

    Newtablename = await JSB_BF_INPUTBOX('Create Table', 'New Table Name', '', '80%', '');
    if (Newtablename == Chr(27) || isEmpty(Newtablename)) return '';
    Fh = await JSB_BF_FHANDLE('', Newtablename, true);
    await JSB_MDL_EDITTABLE_Sub(Newtablename, false, function (_Newtablename, _P2) { Newtablename = _Newtablename });

    return Newtablename;
}
// </PICKATABLE>

// <PICKTABLE_Pgm>
async function JSB_MDL_PICKTABLE_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Fromurl, Fromvalue, Restful_Result, R, Cb;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Fromurl = JSB_BF_PARAMVAR('FROMURL', CStr(1)); Fromvalue = JSB_BF_PARAMVAR('FROMVALUE', CStr(2));
                // %options aspxC-

                await JSB_MDL_EDITTABLE_Sub(Fromvalue, false, function (_Fromvalue, _P2) { Fromvalue = _Fromvalue });
                Print(At(-1));
                return At_Response.redirect('close_html?pick=' + urlEncode(Fromvalue));

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </PICKTABLE_Pgm>

// <PICKVIEWINPUTS_Sub>
async function JSB_MDL_PICKVIEWINPUTS_Sub(ByRef_Projectname, Pagename, Viewname, setByRefValues) {
    // local variables
    var Pagedataset, Viewdataset, Ans;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname)
        return v
    }
    // %options aspxC-

    Pagename = dropIfRight(CStr(Pagename), '.page', true) + '.page';
    Viewname = dropIfRight(CStr(Viewname), '.view', true) + '.view';

    if (await JSB_ODB_READJSON(Pagedataset, await JSB_BF_FHANDLE('dict', ByRef_Projectname), CStr(Pagename), function (_Pagedataset) { Pagedataset = _Pagedataset })); else {
        Alert('Unable to find page ' + CStr(Pagename) + ' ' + CStr(activeProcess.At_Errors));
        return exit(undefined);
    }

    if (await JSB_ODB_READJSON(Viewdataset, await JSB_BF_FHANDLE('dict', ByRef_Projectname), CStr(Viewname), function (_Viewdataset) { Viewdataset = _Viewdataset })); else {
        Alert('Unable to find view ' + CStr(Pagename) + ' ' + CStr(Viewname) + ' ' + CStr(activeProcess.At_Errors));
        return exit(undefined);
    }

    At_Session.Item('SQLCOLUMNS', await JSB_MDL_POSSIBLEINPUTCOLUMNS(ByRef_Projectname, Pagename, Viewname, function (_ByRef_Projectname) { ByRef_Projectname = _ByRef_Projectname }));
    At_Session.Item('VIEWCOLUMNS', Viewdataset.columns);

    Ans = await JSB_BF_POPUP_JSONDEF(ByRef_Projectname, 'jsb_jsondefs', 'viewInputs', 'DEL', 'Add Input Parameter', Viewdataset.inputs, '80%', '80%', 'Inputs for view ' + CStr(Viewname), true, function (_ByRef_Projectname, _P2, _P3, _P4, _P5, _P6) { ByRef_Projectname = _ByRef_Projectname });
    if (Len(Ans)) {
        Viewdataset.inputs = Ans;
        if (await JSB_ODB_WRITEJSON(Viewdataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
        await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, Pagename, false);
    }
    return exit();
}
// </PICKVIEWINPUTS_Sub>

// <PICKVIEWOUTPUTS_Sub>
async function JSB_MDL_PICKVIEWOUTPUTS_Sub(ByRef_Projectname, Pagename, Viewname, setByRefValues) {
    // local variables
    var Pagedataset, Viewdataset, Ans;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname)
        return v
    }
    // %options aspxC-

    Pagename = dropIfRight(CStr(Pagename), '.page', true) + '.page';
    Viewname = dropIfRight(CStr(Viewname), '.view', true) + '.view';

    if (await JSB_ODB_READJSON(Pagedataset, await JSB_BF_FHANDLE('dict', ByRef_Projectname), CStr(Pagename), function (_Pagedataset) { Pagedataset = _Pagedataset })); else {
        Alert('Unable to find page ' + CStr(Pagename) + ' ' + CStr(activeProcess.At_Errors));
        return exit(undefined);
    }

    if (await JSB_ODB_READJSON(Viewdataset, await JSB_BF_FHANDLE('dict', ByRef_Projectname), CStr(Viewname), function (_Viewdataset) { Viewdataset = _Viewdataset })); else {
        Alert('Unable to find view ' + CStr(Pagename) + ' ' + CStr(Viewname) + ' ' + CStr(activeProcess.At_Errors));
        return exit(undefined);
    }

    At_Session.Item('SQLCOLUMNS', await JSB_BF_GETTABLECOLUMNDEFS(CStr(Viewdataset.tableName), CStr(true), true));
    At_Session.Item('VIEWCOLUMNS', Viewdataset.columns);

    Ans = await JSB_BF_POPUP_JSONDEF(ByRef_Projectname, 'jsb_jsondefs', 'viewOutputs', 'DEL', 'Add Output Parameter', Viewdataset.outputs, '80%', '80%', 'Outputs for view ' + CStr(Viewname), true, function (_ByRef_Projectname, _P2, _P3, _P4, _P5, _P6) { ByRef_Projectname = _ByRef_Projectname });
    if (Len(Ans)) {
        Viewdataset.outputs = Ans;
        if (await JSB_ODB_WRITEJSON(Viewdataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
        await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, Pagename, false);
    }
    return exit();
}
// </PICKVIEWOUTPUTS_Sub>

// <PKCOLUMNID>
async function JSB_MDL_PKCOLUMNID(Viewmodel, Projectname, Viewname) {
    // local variables
    var Cnames, Column, Pkname, Lpkname, Phandle, Model;

    // %options aspxC-

    Cnames = [undefined,];

    if (Not(Viewmodel)) {
        Viewname = dropIfRight(CStr(Viewname), '.view', true) + '.view';
        Viewmodel = await JSB_BF_FREADJSON('dict', CStr(Projectname), CStr(Viewname));
    }

    // Count # of primary key columns defined
    for (Column of iterateOver(Viewmodel.columns)) {
        if (CBool(Column.primarykey)) Cnames[Cnames.length] = Column;
    }

    if (Len(Cnames) == 1) return Cnames[1].name;

    Pkname = await JSB_BF_PRIMARYKEYNAME(await JSB_BF_FHANDLE(CStr(Viewmodel.tableName)));

    Lpkname = LCase(Pkname);
    if (Not(Pkname) || Lpkname == 'itemid') {
        Pkname = 'ItemID';
        Lpkname = 'itemid';
    }

    // Fix so we don't have to do this again
    if (CBool(Projectname) && CBool(Viewname)) {
        if (Len(Cnames) > 1) { Alert('Your view ' + CStr(Viewname) + ' has two many primary keys fields defined for table ' + CStr(Viewmodel.tableName) + '; fixing to ' + CStr(Pkname)); }

        Phandle = await JSB_BF_FHANDLE('dict', Projectname);
        Viewname = dropIfRight(CStr(Viewname), '.view', true) + '.view';

        if (await JSB_ODB_READJSON(Model, Phandle, CStr(Viewname), function (_Model) { Model = _Model })) {
            for (Column of iterateOver(Model.columns)) {
                Column.primarykey = LCase(Column.name) == Lpkname;
            }

            if (await JSB_ODB_WRITEJSON(Model, Phandle, CStr(Viewname))); else return Stop(activeProcess.At_Errors);
        }
    }

    return Pkname;
}
// </PKCOLUMNID>

// <POSSIBLEINPUTCOLUMNS>
async function JSB_MDL_POSSIBLEINPUTCOLUMNS(ByRef_Projectname, Pagename, Currentviewname, setByRefValues) {
    // local variables
    var Viewdataset, Columns, Columnnames, Column, Cname, Views;
    var Viewname;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname)
        return v
    }
    // %options aspxC-

    Pagename = dropIfRight(CStr(Pagename), '.page', true);
    Currentviewname = LCase(dropIfRight(CStr(Currentviewname), '.view', true) + '.view');

    // we can pick any column in the current view's table
    if (await JSB_ODB_READJSON(Viewdataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(Currentviewname), function (_Viewdataset) { Viewdataset = _Viewdataset })) {
        Columns = await JSB_BF_GETTABLECOLUMNDEFS(CStr(Viewdataset.tableName), CStr(true), true);
    } else {
        // No table?
        Columns = [undefined,];
    }

    Columnnames = [undefined,];
    for (Column of iterateOver(Columns)) {
        Cname = Column.cname;
        if (CBool(Cname)) Columnnames[Columnnames.length] = LCase(Cname);
    }

    // We can also pick any column from another form field in another view
    Views = await JSB_MDL_VIEWSINPAGE(ByRef_Projectname, Pagename, function (_ByRef_Projectname) { ByRef_Projectname = _ByRef_Projectname });
    if (Len(Views) == 0) Views[Views.length] = CStr(Pagename) + '.view';

    for (Viewname of iterateOver(Views)) {
        Viewname = LCase(Viewname);
        if (Null0(Viewname) != Null0(Currentviewname)) {
            if (await JSB_ODB_READJSON(Viewdataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(Viewname), function (_Viewdataset) { Viewdataset = _Viewdataset })) {
                for (Column of iterateOver(Viewdataset.columns)) {
                    Cname = LCase(Column.name);
                    if (Locate(Cname, Columnnames, 0, 0, 0, "", position => { })); else {
                        Columns[Columns.length] = Column;
                        Columnnames[Columnnames.length] = Cname;
                    }
                }
            }
        }
    }

    return exit(Columns);
}
// </POSSIBLEINPUTCOLUMNS>

// <PROCESSEXCELFILE>
async function JSB_MDL_PROCESSEXCELFILE(ByRef_Settings, ByRef_Basedirectory, ByRef_Xlsfilename, ByRef_Sqldbname, setByRefValues) {
    // local variables
    var Excelobj, Success, Sheets, Sheetname;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Settings, ByRef_Basedirectory, ByRef_Xlsfilename, ByRef_Sqldbname)
        return v
    }
    if (Right(ByRef_Basedirectory, 1) != '\\') ByRef_Basedirectory = CStr(ByRef_Basedirectory) + '\\';

    if (Left(ByRef_Xlsfilename, Len(ByRef_Basedirectory)) == ByRef_Basedirectory) ByRef_Xlsfilename = Mid1(ByRef_Xlsfilename, Len(ByRef_Basedirectory) + 1);
    if (Not(ByRef_Xlsfilename)) return exit(true);

    if (CBool(ByRef_Settings.excelObj)) {
        Excelobj = ByRef_Settings.excelObj;
    } else {
        Excelobj = CreateObject('excel');
        if (Not(Excelobj)) return exit(false);
        ByRef_Settings.excelObj = Excelobj;
    }

    ByRef_Settings.sqlDBName = ByRef_Sqldbname;
    ByRef_Settings.BaseDirectory = ByRef_Basedirectory;
    ByRef_Settings.XlsFileName = ByRef_Xlsfilename;

    ByRef_Settings.DefaultEmptyValuesFromPreviousRow = InStr1(1, ByRef_Xlsfilename, 'Basset Report Form 2007.xlsx');

    Success = Excelobj.OpenExistingWorkbook(CStr(ByRef_Basedirectory) + CStr(ByRef_Xlsfilename));
    if (Not(Success)) {
        activeProcess.At_Errors = 'Could not open ' + CStr(ByRef_Xlsfilename);
        return exit(false);
    }

    Sheets = Excelobj.EnumerateSheets();
    for (Sheetname of iterateOver(Sheets)) {
        if (InStr1(1, Sheetname, 'LookUp Values') && InStr1(1, ByRef_Xlsfilename, 'Foster')) {
            ByRef_Settings.SideBySideTables = true;
        } else {
            ByRef_Settings.SideBySideTables = false;
        }

        if (Not(await JSB_MDL_PROCESSSHEET(ByRef_Settings, Sheetname, function (_ByRef_Settings, _Sheetname) { ByRef_Settings = _ByRef_Settings; Sheetname = _Sheetname }))) return exit(false);
    }

    return exit(true);
}
// </PROCESSEXCELFILE>

// <PROCESSNEWDATAROW>
async function JSB_MDL_PROCESSNEWDATAROW(ByRef_Settings, ByRef_Tbl, ByRef_Row, ByRef_Rowi, setByRefValues) {
    // local variables
    var Validdata, Term, Previousrow, Termi;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Settings, ByRef_Tbl, ByRef_Row, ByRef_Rowi)
        return v
    }
    // Does the Row contain any numbers?  Should have at least one

    if (CBool(ByRef_Settings.DataMustHaveOneNumericRow)) {
        Validdata = 0;
        for (Term of iterateOver(ByRef_Row)) {
            if (isNumber(Term) || isEmpty(Term) || InStr1(1, Term, '-')) Validdata++;
        }

        if (Not(Validdata)) {
            if (await JSB_MDL_ISROWEMPTY(ByRef_Tbl[UBound(ByRef_Tbl)])) {
                ByRef_Tbl.Delete(UBound(ByRef_Tbl));
                ByRef_Rowi--;
                return exit(false);
            }
            return exit(false);
        }
    }

    if (CBool(ByRef_Settings.DefaultEmptyValuesFromPreviousRow) && UBound(ByRef_Tbl) > 1) {
        Previousrow = ByRef_Tbl[UBound(ByRef_Tbl)];
        Termi = LBound(ByRef_Row) - 1;
        for (Term of iterateOver(ByRef_Row)) {
            Termi++;
            if (Not(Term)) {
                ByRef_Row[Termi] = Previousrow[Termi];
            }
        }
    }

    ByRef_Tbl[ByRef_Tbl.length] = ByRef_Row;

    return exit(true);
}
// </PROCESSNEWDATAROW>

// <PROCESSNEWHEADER>
async function JSB_MDL_PROCESSNEWHEADER(ByRef_Settings, ByRef_Tbl, ByRef_Rows, ByRef_Rowi, setByRefValues) {
    // local variables
    var Hdrrowi, Nxtrow, I, Cell, V2, Hdrrow, Lasti, Row, J, C;
    var Noofemptycells, Noofnumbers, Term, Termi, H;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Settings, ByRef_Tbl, ByRef_Rows, ByRef_Rowi)
        return v
    }
    // Begin valid Settings.HdrRow
    Hdrrowi = ByRef_Rowi;
    ByRef_Settings.State = STATE_PROCESSINGDATA;

    // Allow a blank row after header
    if (await JSB_MDL_ISROWEMPTY(ByRef_Rows(+ByRef_Rowi + 1))) {
        if (UBound(ByRef_Rows[+ByRef_Rowi + 2]) > 3) ByRef_Rowi++;
    }

    if (Not(ByRef_Settings.SideBySideTables)) {
        // Keep accepting header Rows until we have actual data or an empty row

        while (true) {
            Nxtrow = ByRef_Rows[+ByRef_Rowi + 1];

            // adjust bounds?
            var _ForEndI_4 = UBound(Nxtrow);
            for (I = 1; I <= _ForEndI_4; I++) {
                Cell = Nxtrow[I];
                if (CBool(Cell)) {
                    if (Null0(I) < Null0(ByRef_Settings.FirstC)) ByRef_Settings.FirstC = I;
                    if (Null0(I) > Null0(ByRef_Settings.LastC)) ByRef_Settings.LastC = I;
                }
            }

            Nxtrow = await JSB_MDL_GETROW(ByRef_Settings, ByRef_Rows, +ByRef_Rowi + 1, function (_ByRef_Settings, _ByRef_Rows, _P3) { ByRef_Settings = _ByRef_Settings; ByRef_Rows = _ByRef_Rows });
            if (await JSB_MDL_ROWHASNUMBERS(Nxtrow, function (_Nxtrow) { Nxtrow = _Nxtrow })) break;
            if (await JSB_MDL_ISROWEMPTY(Nxtrow, function (_Nxtrow) { Nxtrow = _Nxtrow })) break;

            if (Not(true)) break;
            ByRef_Rowi++;
        }
    }
    ByRef_Settings.HdrLastC = ByRef_Settings.LastC;

    // allow one blank on previous column incase the key field isn't named
    if (Null0(ByRef_Settings.FirstC) > 1) {
        Nxtrow = ByRef_Rows[+ByRef_Rowi + 1];
        if (Not(Nxtrow)) Nxtrow = [undefined,];
        V2 = Nxtrow[CNum(ByRef_Settings.FirstC) - 1];
        if (CBool(V2)) ByRef_Settings.FirstC--;
    }

    // Build header  
    Hdrrow = [undefined,];
    Lasti = false;
    var _ForEndI_13 = +Hdrrowi;
    for (I = +ByRef_Rowi; I >= _ForEndI_13; I--) {
        Row = await JSB_MDL_GETROW(ByRef_Settings, ByRef_Rows, I, function (_ByRef_Settings, _ByRef_Rows, _I) { ByRef_Settings = _ByRef_Settings; ByRef_Rows = _ByRef_Rows; I = _I });

        var _ForEndI_14 = UBound(Row);
        for (J = 1; J <= _ForEndI_14; J++) {
            C = Row[J];
            if (C == '*') {
                Lasti = true;
            } else if (CBool(C) && Len(C) < 80) {
                Hdrrow[J] = Trim(CStr(C) + ' ' + CStr(Hdrrow[J]));
            }
        }
        if (CBool(Lasti)) break;
    }

    Noofemptycells = 0;
    Noofnumbers = 0;

    Termi = LBound(Hdrrow) - 1;
    for (Term of iterateOver(Hdrrow)) {
        Termi++;
        Term = Trim(Term);

        if (Not(Term)) {
            Noofemptycells++;
            // HdrRow[TermI] = "Column_":TermI;
        } else if (isNumber(Term)) {
            Noofnumbers++;
            Hdrrow[Termi] = '#' + CStr(Term);;
        } else {
            Hdrrow[Termi] = Term;
        }
    }

    if (UBound(Hdrrow) && Null0(Noofemptycells) > (UBound(Hdrrow) / 2)) return exit(false);

    // Does the header contain numbers?  Problably not really a header then
    if (Null0(Noofnumbers) > 1 && UBound(Hdrrow) == 1) {
        // Maybe they forgot to make a header?
        H = [undefined,];
        I = LBound(Hdrrow) - 1;
        for (Term of iterateOver(Hdrrow)) {
            I++;
            H[H.length] = 'Column_' + CStr(I);
        }
        Hdrrow = H;
        ByRef_Rowi--;
    }

    ByRef_Settings.HdrRow = Hdrrow;
    ByRef_Tbl = [undefined, Hdrrow];

    // Allow a blank row after header
    if (await JSB_MDL_ISROWEMPTY(ByRef_Rows(+ByRef_Rowi + 1))) {
        if (UBound(ByRef_Rows[+ByRef_Rowi + 2]) > 3) ByRef_Rowi++;
    }

    return exit(true);
}
// </PROCESSNEWHEADER>

// <PROCESSSHEET>
async function JSB_MDL_PROCESSSHEET(ByRef_Settings, ByRef_Sheetname, setByRefValues) {
    // local variables
    var Excelobj, Rows, Rowcount, Rowi, Tbl, Row, Ri, Srcrow, Ci;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Settings, ByRef_Sheetname)
        return v
    }
    ByRef_Settings.sheetName = ByRef_Sheetname;

    Excelobj = ByRef_Settings.excelObj;
    Excelobj.selectSheet(ByRef_Sheetname);
    Rows = Excelobj.getAllCells();
    Rowcount = UBound(Rows);

    Rowi = 0;
    if (Not(Rowcount)) return exit(true);
    ByRef_Settings.HdrRow = [undefined,];

    ByRef_Settings.SheetTblCnt = 0;

    while (true) {
        // How many tables can we find?
        Tbl = [undefined,];
        ByRef_Settings.State = STATE_LOOKINGFORHEADER;
        if (CBool(ByRef_Settings.SideBySideTables)) Rowi = 0;

        var _ForEndI_3 = +Rowcount;
        for (Rowi = +Rowi + 1; Rowi <= _ForEndI_3; Rowi++) {
            if (Rowi % 1000 == 0) await JSB_MDL_STATUSPRINT_Sub('Extrcting row ' + CStr(Rowi) + ' of ' + CStr(Rowcount));

            Row = await JSB_MDL_GETROW(ByRef_Settings, Rows, Rowi, function (_ByRef_Settings, _Rows, _Rowi) { ByRef_Settings = _ByRef_Settings; Rows = _Rows; Rowi = _Rowi });

            // Is the row a Header?
            if (Null0(ByRef_Settings.State) == STATE_PROCESSINGHEADER) {
                if (Not(await JSB_MDL_PROCESSNEWHEADER(ByRef_Settings, Tbl, Rows, Rowi, function (_ByRef_Settings, _Tbl, _Rows, _Rowi) { ByRef_Settings = _ByRef_Settings; Tbl = _Tbl; Rows = _Rows; Rowi = _Rowi }))) break;
                if (await JSB_MDL_NEXTROWISDIFFERENT(ByRef_Settings, Rows, +Rowi + 1, function (_ByRef_Settings, _Rows, _P3) { ByRef_Settings = _ByRef_Settings; Rows = _Rows })) break;
                // if Settings.verbose then Call statusPrint(Join(Settings.HdrRow, " - "));
            } else if (Null0(ByRef_Settings.State) == STATE_PROCESSINGDATA) {
                if (Not(await JSB_MDL_PROCESSNEWDATAROW(ByRef_Settings, Tbl, Row, Rowi, function (_ByRef_Settings, _Tbl, _Row, _Rowi) { ByRef_Settings = _ByRef_Settings; Tbl = _Tbl; Row = _Row; Rowi = _Rowi }))) break;
                if (await JSB_MDL_NEXTROWISDIFFERENT(ByRef_Settings, Rows, +Rowi + 1, function (_ByRef_Settings, _Rows, _P3) { ByRef_Settings = _ByRef_Settings; Rows = _Rows })) {
                    if (CBool(ByRef_Settings.SideBySideTables)) break;
                    if (await JSB_MDL_NEXTROWISDIFFERENT(ByRef_Settings, Rows, +Rowi + 2, function (_ByRef_Settings, _Rows, _P3) { ByRef_Settings = _ByRef_Settings; Rows = _Rows })) break;
                }
            }
        }

        if (await JSB_MDL_OKAYTOOUTPUTTBL(ByRef_Settings, Tbl, ByRef_Sheetname, function (_ByRef_Settings, _Tbl) { ByRef_Settings = _ByRef_Settings; Tbl = _Tbl })) {
            if (Not(await JSB_MDL_OUTPUTTABLE(ByRef_Settings, Tbl, ByRef_Sheetname, function (_ByRef_Settings, _Tbl) { ByRef_Settings = _ByRef_Settings; Tbl = _Tbl }))) return exit(false);
        }

        Print(await JSB_MDL_SHOWTABLE(ByRef_Settings, Tbl, ByRef_Sheetname, function (_ByRef_Settings, _Tbl, _ByRef_Sheetname) { ByRef_Settings = _ByRef_Settings; Tbl = _Tbl; ByRef_Sheetname = _ByRef_Sheetname }));

        if (Not(Null0(Rowi) < Null0(Rowcount))) break;
        // clear range 
        var _ForEndI_15 = +Rowi;
        for (Ri = CNum(ByRef_Settings.firstR); Ri <= _ForEndI_15; Ri++) {
            Srcrow = Rows[Ri];
            var _ForEndI_16 = UBound(Srcrow);
            for (Ci = CNum(ByRef_Settings.FirstC); (Ci <= _ForEndI_16) && Null0(Ci) <= Null0(ByRef_Settings.LastC); Ci++) {
                Srcrow[Ci] = '';
            }
        }
    }

    return exit(true);
}
// </PROCESSSHEET>

// <PROCESSTEMPLATE_Sub>
async function JSB_MDL_PROCESSTEMPLATE_Sub(ByRef__Code, Templatefilename, Templatename, Template, setByRefValues) {
    // local variables
    var Originaltemplate, I, S, E, Upto, Section, After, Ifile;
    var Iitem, Ffile, Itemplate, Lno, Lno2, Ot;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Code)
        return v
    }
    // %options aspxC-

    Originaltemplate = Template;

    // Drop leading spaces
    for (I = 6; I >= 2; I--) {

        while (InStr1(1, Template, am + Space(I))) {
            Template = Change(Template, am + Space(I), am + ' ');
        }
    }


    while (true) {
        S = InStr1(1, Template, '\<%');
        E = InStr1(1, Template, '%\>');
        if (Not(Null0(S) < Null0(E) && Null0(S) != '0')) break;
        Upto = Left(Template, +S - 1);
        Section = Mid1(Template, +S + 2, +E - +S - 2);
        After = Mid1(Template, +E + 2);
        Ifile = '';

        ByRef__Code[ByRef__Code.length] = 'Gen[-1] = `' + CStr(Upto) + '`';
        if (Left(Section, 1) == '=') {
            ByRef__Code[ByRef__Code.length] = 'Gen[-1] = ' + Mid1(Section, 2);
        } else if (LCase(Left(LTrim(Section), 8)) == '$include') {
            Section = Trim(Section);
            Ifile = Field(Section, ' ', 2);
            Iitem = Field(Section, ' ', 3);
            if (Not(Iitem)) { Iitem = Ifile; Ifile = Templatefilename; }
            if (await JSB_ODB_OPEN('', CStr(Ifile), Ffile, function (_Ffile) { Ffile = _Ffile })); else Alert('You\'re include file ' + CStr(Ifile) + ' wasn\'t found.');
            if (await JSB_ODB_READ(Itemplate, Ffile, CStr(Iitem), function (_Itemplate) { Itemplate = _Itemplate })); else Alert('You\'re include item ' + CStr(Iitem) + ' wasn\'t found.');
            if (InStr1(1, Itemplate, '`')) Alert('Your template ' + CStr(Iitem) + ' is using the ` character.  You need change this.');
            // NewCode = []
            await JSB_MDL_PROCESSTEMPLATE_Sub(ByRef__Code, Ifile, Iitem, Itemplate, function (_ByRef__Code) { ByRef__Code = _ByRef__Code });
            if (Left(After, 1) == am) After = Mid1(After, 2);
        } else {
            ByRef__Code[ByRef__Code.length] = Section;
        }

        Lno += Count(Upto, am);
        Lno += Count(Section, am);

        Upto = RTrim(Upto);

        Template = After;
        if (Left(After, 1) == am && Not(Ifile)) {
            After = LTrim(Mid1(After, 2));
            if (Right(Upto, 1) == am) Template = After;
        }
    }
    if (CBool(Template)) ByRef__Code[ByRef__Code.length] = 'Gen[-1] = `' + CStr(Template) + '`';

    if (CBool(S) || CBool(E)) {
        // If S Then LNo2 = DCount(Left(Template, S), AM())  

        Lno2 = +Lno + DCount(Left(Template, E), am);

        if (await JSB_ODB_READ(Ot, await JSB_BF_FHANDLE(CStr(Templatefilename)), CStr(Templatename), function (_Ot) { Ot = _Ot })) {
            I = InStr1(1, Ot, '******************************************************************************');
            if (CBool(I)) {
                Lno += Count(Left(Ot, I), am);
                Lno2 += Count(Left(Ot, I), am);
                Originaltemplate = Ot;
            }
        }

        Println(At(-1), 'Ending marker missing in template ', Templatefilename, ' ', Templatename, ' at line number ', Lno);
        Println();
        var _ForEndI_14 = +Lno2;
        for (I = +Lno; I <= _ForEndI_14; I++) {
            if (Null0(I) > '0') Println(I, ' ', Change(Change(Extract(Originaltemplate, I, 0, 0), '\<%', bold('\<%')), '%\>', bold('%\>')));
        }

        Println('Ending marker missing in template ', Templatefilename, ' ', Templatename, ' at line number ', Lno);
        Println();

        Println();
        Println(html('\<a href=' + jsbRootExecute('ED ' + CStr(Templatefilename) + ' ' + CStr(Templatename) + ' (' + CStr(Lno2), CStr(true)) + ' target="_blank"\>' + Chr(29) + 'ED ' + CStr(Templatefilename) + ' ' + CStr(Templatename) + Chr(28) + '\</a\>'));
        Println();
        Println(JSB_HTML_SUBMITBTN('formBtn', 'OK')); await At_Server.asyncPause(me);
    }
    return exit();
}
// </PROCESSTEMPLATE_Sub>

// <PROJECT_MENUS_Sub>
async function JSB_MDL_PROJECT_MENUS_Sub(ByRef__Menubar, Edpname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Menubar)
        return v
    }
    // EDITOR-OPTION: AUTOFORMAT")
    ByRef__Menubar = {};
    if (CBool(isAdmin())) {
        var Frompage = '';
        if (InStr1(1, JSB_BF_URL(), '\\' + CStr(Edpname))) Frompage = JSB_BF_URL(); else Frompage = Edpname;

        ByRef__Menubar['Web Page'] = {};
        ByRef__Menubar['Web Page']['View Page Props'] = {};
        ByRef__Menubar['Web Page']['View Page Props'].id = ('?edp&projectName=' + urlEncode(System(27)) + '&pageName=' + urlEncode(Edpname) + '&fromPage=' + urlEncode(Frompage));
        ByRef__Menubar['Web Page']['ReGen Page'] = {};
        ByRef__Menubar['Web Page']['ReGen Page'].id = ('?ReGenPageModel&projectName=' + urlEncode(System(27)) + '&pageName=' + urlEncode(Edpname) + '&fromPage=' + urlEncode(Frompage));
        ByRef__Menubar['Web Page'].seperator1 = true;
        ByRef__Menubar['Web Page']['Add Page'] = {};
        ByRef__Menubar['Web Page']['Add Page'].id = ('?edp&projectName=' + urlEncode(System(27)) + '&fromPage=' + urlEncode(Frompage));
        ByRef__Menubar['Web Page']['Clone Page As'] = {};
        ByRef__Menubar['Web Page']['Clone Page As'].id = ('?clonePageModel&projectName=' + urlEncode(System(27)) + '&pageName=' + urlEncode(Edpname) + '&fromPage=' + urlEncode(Frompage));
        ByRef__Menubar['Web Page'].seperator2 = true;
        ByRef__Menubar['Web Page']['Rename Page'] = {};
        ByRef__Menubar['Web Page']['Rename Page'].id = ('?renamePageModel&projectName=' + urlEncode(System(27)) + '&pageName=' + urlEncode(Edpname) + '&fromPage=' + urlEncode(Frompage));
        ByRef__Menubar['Web Page'].seperator3 = true;
        ByRef__Menubar['Web Page']['Delete Page'] = {};
        ByRef__Menubar['Web Page']['Delete Page'].id = ('?deletePageModel&projectName=' + urlEncode(System(27)) + '&pageName=' + urlEncode(Edpname) + '&fromPage=Menu');

        // Can collaspe here after Any HTML
        ByRef__Menubar.collaspable = true;

        ByRef__Menubar['Menus'] = {};
        ByRef__Menubar['Menus']['Main Menu'] = {};
        ByRef__Menubar['Menus']['Main Menu'].id = '?Menu';
        ByRef__Menubar['Menus']['Add Page To Menu'] = {};
        ByRef__Menubar['Menus']['Add Page To Menu'].id = ('?addPageToMenu&projectName=' + urlEncode(System(27)) + '&pageName=' + urlEncode(Edpname) + '&fromPage=' + urlEncode(Frompage));
        ByRef__Menubar['Menus']['Add Page To Reference Menu'] = {};
        ByRef__Menubar['Menus']['Add Page To Reference Menu'].id = ('?addPageToReferenceMenu&projectName=' + urlEncode(System(27)) + '&pageName=' + urlEncode(Edpname) + '&fromPage=' + urlEncode(Frompage));

        ByRef__Menubar['TCL'] = {};
        ByRef__Menubar['TCL'].id = 'tcl';

        ByRef__Menubar['Web Security'] = {};
        ByRef__Menubar['Web Security']['Security'] = {};
        ByRef__Menubar['Web Security']['Security'].id = ('?WebSiteSecurity&projectName=' + urlEncode(System(27)) + '&fromPage=' + urlEncode(Frompage));

        ByRef__Menubar['Websites'] = {};
        ByRef__Menubar['Websites']['ReGen MenuBar'] = {};
        ByRef__Menubar['Websites']['ReGen MenuBar'].id = ('?updateMenus&projectName=' + urlEncode(System(27)) + '&fromPage=' + urlEncode(Frompage));
        ByRef__Menubar['Websites'].seperator1 = true;
        ByRef__Menubar['Websites']['ReGen Website'] = {};
        ByRef__Menubar['Websites']['ReGen Website'].id = ('?RegenWebSiteModel&projectName=' + urlEncode(System(27)) + '&fromPage=' + urlEncode(Frompage));
        ByRef__Menubar['Websites'].seperator2 = true;
        ByRef__Menubar['Websites']['New Website'] = {};
        ByRef__Menubar['Websites']['New Website'].id = ('?newWebSiteModel&fromPage=' + urlEncode(Frompage));
        ByRef__Menubar['Websites']['Clone Website'] = {};
        ByRef__Menubar['Websites']['Clone Website'].id = ('?cloneWebSite&fromPage=' + urlEncode(Frompage));
        ByRef__Menubar['Websites'].seperator3 = true;
        ByRef__Menubar['Websites']['Delete Website'] = {};
        ByRef__Menubar['Websites']['Delete Website'].id = ('?deleteWebSiteModel&projectName=' + urlEncode(System(27)) + '');
    }

    var Custommenu = 'mdl.' + JSB_BF_NICENAME(CStr(Edpname)) + '_customMenu';
    await asyncCallByName(Custommenu, me, 1 /*ignore if missing */, ByRef__Menubar);
    return exit();
}
// </PROJECT_MENUS_Sub>

// <PUTROWDATAINTOHTML>
async function JSB_MDL_PUTROWDATAINTOHTML(ByRef_Projectname, ByRef_Objectmodel, ByRef_Row, ByRef_Htmlbackdrop, ByRef_Viewname, setByRefValues) {
    // local variables
    var Backdrophtml, I, J, Nicecolumnnames, Column, Nicecolumnname;
    var Ctllabel, Callname, Additionalattrs, H, Newctl, Pickurl;
    var Oldctl, Oldstylescnt, Newstylescnt, Stylei, Posi, Oldc;
    var Endi, Oldstyle, Newc, Newstyle, C1, Divheader, Spot;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Objectmodel, ByRef_Row, ByRef_Htmlbackdrop, ByRef_Viewname)
        return v
    }
    // %options aspxC-

    var Ctlhtml = '';

    if (Not(ByRef_Htmlbackdrop)) return exit(await JSB_MDL_FORMVIEWNCOLUMNS(CStr(ByRef_Projectname), ByRef_Objectmodel, CStr(false), ByRef_Row, CStr(ByRef_Viewname)));

    Backdrophtml = Change(ByRef_Htmlbackdrop, am, crlf);
    Backdrophtml = Change(Backdrophtml, '\<mdlCtl', '\<mdlctl');

    // Need to remove all "<head>" stuff from htmlBackDrop, It will get replaced with the new Controls

    while (true) {
        I = InStr1(1, Backdrophtml, '\<head');
        J = InStr1(I, Backdrophtml, '\</head\>');
        if (Not(Null0(I) != '0' && Null0(J) > Null0(I))) break;
        Backdrophtml = Left(Backdrophtml, +I - 1) + Mid1(Backdrophtml, +J + 7);
    }

    // Check that each control is defined in the background
    Nicecolumnnames = [undefined,];

    for (Column of iterateOver(ByRef_Objectmodel.columns)) {
        if (isEmpty(Column.control)) Column.control = 'textbox';
        if (isEmpty(Column.name)) Column.name = 'no id';
        if (Column.display != 'hidden') {
            Nicecolumnname = JSB_BF_NICENAME(CStr(Column.name));
            Nicecolumnnames[Nicecolumnnames.length] = Nicecolumnname;

            // Build New Ctl
            Ctllabel = Column.label;
            if (Not(Ctllabel)) Ctllabel = Column.name;

            Callname = LCase(Column.control);
            if (Left(Callname, 4) != 'ctl_') Callname = 'ctl_' + CStr(Callname);
            Callname = 'jsb_ctls.' + CStr(Callname);

            Additionalattrs = [undefined, 'style=\'width:auto;' + CStr(Column.ctlstyle) + '\''];
            if (CBool(Column.encrypt)) {
                H = ByRef_Row[Column.name];
                ByRef_Row[Column.name] = aesDecrypt(XTS(H));
            }

            await asyncCallByName(Callname, me, 0 /*ignore if missing */, ByRef_Projectname, (Nicecolumnname), false, Column, ByRef_Row, Newctl, false, Additionalattrs, ByRef_Viewname, function (_Newctl) { Newctl = _Newctl });

            if (CBool(Column.encrypt)) ByRef_Row[Column.name] = H;

            if (CBool(Column.pickfunction)) {
                if (InStr1(1, Column.pickfunction, '.page')) Pickurl = dropRight(CStr(Column.pickfunction), '.page'); else Pickurl = Column.pickfunction;
                Pickurl = Change(Pickurl, '{projectname}', urlEncode(ByRef_Projectname));
                Newctl = addPick(Newctl, Nicecolumnname, 'Pick a ' + CStr(Ctllabel), '80%', '90%', Pickurl, Column.autopostback);
            }

            // If Control already exists in BackDropHtml, replace it with the new one we just built
            I = InStr1(1, Backdrophtml, '\<mdlctl id="ctl_' + CStr(Nicecolumnname) + '"');
            if (Null0(I) == '0') I = InStr1(1, Backdrophtml, '\<mdlctl id=\'ctl_' + CStr(Nicecolumnname) + '\'');
            if (CBool(I)) {
                I = InStr1(I, Backdrophtml, '\>' + Chr(29)) + 2; // Skip To Inner Stuff;
            }

            J = InStr1(I, Backdrophtml, Chr(28) + '\</mdlctl\>');

            // Start and stop of MDLCTL found?
            if (CBool(I) && CBool(J)) {
                Oldctl = Mid1(Backdrophtml, I, +J - +I);

                if (Null0(Oldctl) != Null0(Newctl)) {
                    Oldstylescnt = Count(Oldctl, 'style=');
                    Newstylescnt = Count(Newctl, 'style=');
                    if (Null0(Oldstylescnt) == Null0(Oldstylescnt) && Left(Callname, 9) != 'ctl_json_') {
                        var _ForEndI_16 = +Oldstylescnt;
                        for (Stylei = 1; Stylei <= _ForEndI_16; Stylei++) {
                            Posi = Index1(Oldctl, 'style=', Stylei);
                            Posi = +Posi + Len('style=');
                            Oldc = Mid1(Oldctl, Posi, 1);
                            Endi = InStr1(+Posi + 1, Oldctl, Oldc);
                            if (Not(Endi)) {
                                Alert('unable to find style marker ' + CStr(Oldc) + ' in source ' + CStr(Oldctl));
                                Print(); debugger;
                            }

                            Oldstyle = Mid1(Oldctl, Posi, +Endi - +Posi + 1);

                            Posi = Index1(Newctl, 'style=', Stylei);
                            Posi = +Posi + Len('style=');
                            Newc = Mid1(Newctl, Posi, 1);
                            Endi = InStr1(+Posi + 1, Newctl, Newc);
                            if (Not(Endi)) {
                                Alert('unable to find style marker ' + CStr(Newc) + ' in source ' + CStr(Newctl));
                                Print(); debugger;
                            }

                            Newstyle = Mid1(Newctl, Posi, +Endi - +Posi + 1);

                            Newctl = Left(Newctl, +Posi - 1) + CStr(Oldstyle) + Mid1(Newctl, +Endi + 1);

                        }
                    }
                }

                Backdrophtml = Left(Backdrophtml, I) + CStr(Newctl) + Mid1(Backdrophtml, +J - 1);;
            } else {
                // Place a new control
                C1 = lblCtlSet(CStr(Column.label), CStr(Newctl), CStr(Nicecolumnname), CNum(Column.fullline), CNum(Column.suppresslabel), CStr(Column.lblstyle));

                I = InStrRev1(Backdrophtml, '\</mdlctl\>', -1);
                if (CBool(I)) I = InStr1(I, Backdrophtml, '\</div\>');
                if (CBool(I)) {
                    I = +I + 6;
                    Backdrophtml = Left(Backdrophtml, +I - 1) + CStr(C1) + Mid1(Backdrophtml, I);
                } else {
                    Backdrophtml = CStr(Backdrophtml) + CStr(C1);
                }
            }
            // End If;
        }
    }

    // Remove extra controls
    J = 1;

    while (true) {
        Divheader = '\<mdlctl id="ctl_';
        I = InStr1(J, Backdrophtml, Divheader);
        J = InStr1(I, Backdrophtml, '\</mdlctl\>');
        if (Not(Null0(I) != '0' && Null0(J) != '0')) break;
        Nicecolumnname = Field(Mid1(Backdrophtml, +I + Len(Divheader), 60), '"', 1);
        if (Locate(Nicecolumnname, Nicecolumnnames, 0, 0, 0, "", position => Spot = position)); else Backdrophtml = Left(Backdrophtml, +I - 1) + Mid1(Backdrophtml, +J + 9)
    }

    // Remove extra labels
    J = 1;

    while (true) {
        Divheader = ' id="LBL_';
        I = InStr1(J, Backdrophtml, Divheader);
        J = InStr1(I, Backdrophtml, '\</label\>');
        if (Not(Null0(I) != '0' && Null0(J) != '0')) break;
        Nicecolumnname = Field(Mid1(Backdrophtml, +I + Len(Divheader), 60), '"', 1);
        if (Locate(Nicecolumnname, Nicecolumnnames, 0, 0, 0, "", position => Spot = position)); else {
            // Search I backwards for beginning of <label
            I = InStrRev1(Backdrophtml, '\<label', I);
            Backdrophtml = Left(Backdrophtml, +I - 1) + Mid1(Backdrophtml, +J + 8);
        }
    }

    return exit(Backdrophtml);
}
// </PUTROWDATAINTOHTML>

// <READONLYCOLUMN_Sub>
async function JSB_MDL_READONLYCOLUMN_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, setByRefValues) {
    // local variables
    var Dataset, Columnidx;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid)
        return v
    }
    // %options aspxC-
    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);
    Columnidx = await JSB_MDL_FINDVIEWCOLUMN(Dataset, ByRef_Columnid, function (_Dataset) { Dataset = _Dataset });
    if (Null0(Columnidx) == '0') return exit(undefined);
    Dataset.columns[Columnidx].canedit = Not(Dataset.columns[Columnidx].canedit);
    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edc-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </READONLYCOLUMN_Sub>

// <REBUILD_Pgm>
async function JSB_MDL_REBUILD_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // %options aspxC-
    return Chain('Regen ' + dropLeft(CStr(activeProcess.At_Sentence), ' ', CStr(1)));
}
// </REBUILD_Pgm>

// <REFRESHVIEWMODEL>
async function JSB_MDL_REFRESHVIEWMODEL(Viewname, Viewmodel, Mergedict, Getalldictcols) {
    // local variables
    var Dicttablemeta, Viewcolumns, Dictcolumn, Foundit, Viewcolumn;
    var Tn, Updated, Fdicthandle;

    // %options aspxC-

    Dicttablemeta = {};
    Dicttablemeta.tableName = Viewmodel.tableName;
    Dicttablemeta.columns = await JSB_BF_GETTABLECOLUMNDEFS(CStr(Viewmodel.tableName), CStr(false), true); // Suppress Messages, doRefresh

    // Insure every dictColumn(!) exists in viewColumns
    Viewcolumns = Viewmodel.columns;
    for (Dictcolumn of iterateOver(Dicttablemeta.columns)) {
        Foundit = false;
        for (Viewcolumn of iterateOver(Viewcolumns)) {
            if (Null0(Viewcolumn.name) == Null0(Dictcolumn.name)) {
                Foundit = true;
                break;
            }
        }

        if (CBool(Foundit)) {
            if (Mergedict) {
                for (Tn of iterateOver(Dictcolumn)) {
                    if (Tn != 'name' && Tn != 'index') Viewcolumn[Tn] = Dictcolumn[Tn];
                }
            }
        } else if (Getalldictcols) {
            // Not found
            if (Mergedict) {
                Viewcolumn = parseJSON(CStr(Dictcolumn, true));
            } else {
                Viewcolumn = {};
                Viewcolumn.name = Dictcolumn.name;
                Updated = 1;
            }

            await JSB_MDL_SETCOLUMNDEFAULTS_Sub(Dictcolumn.datatype, Viewcolumn, function (_P1, _Viewcolumn) { Viewcolumn = _Viewcolumn });

            Viewcolumns[Viewcolumns.length] = Viewcolumn;
        }
    }

    // Remove any extra view columns from view not found in the Table (DICT)
    // For ColumnsListI = 1 to UBound(viewColumns) while ColumnsListI <= UBound(viewColumns)
    // viewColumn = viewColumns[ColumnsListI]
    // FoundIt = false
    // For Each dictColumn In dictTableMeta.columns
    // If viewColumn.name = dictColumn.name Then
    // FoundIt = true
    // Exit For
    // End If
    // Next
    // If FoundIt = False Then 
    // viewColumns.Delete(ColumnsListI)
    // ColumnsListI = ColumnsListI - 1
    // Updated = 1
    // End If
    // if !viewColumn.index Then
    // viewColumn.index = ColumnsListI
    // Updated = 1
    // End If
    // Next

    Viewcolumns = Sort(Viewcolumns, '#index');

    if (CBool(Updated)) Viewmodel.columns = Viewcolumns;

    if (!Mergedict && CBool(Updated)) {
        if (await JSB_ODB_OPEN('DICT', CStr(Viewmodel.tableName), Fdicthandle, function (_Fdicthandle) { Fdicthandle = _Fdicthandle })); else return Stop(At(-1), 'refreshViewModel: edv: ', activeProcess.At_Errors);

        if (await JSB_ODB_WRITEJSON(Viewmodel, Fdicthandle, CStr(Viewname))); else null;
    }

    return Viewmodel;
}
// </REFRESHVIEWMODEL>

// <REGEN_Pgm>
async function JSB_MDL_REGEN_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Nomodelingstuff, Fdict, Lctime, Iname, Itemi, Pagename;
    var Pagedataset;

    // %options aspxC-
    if (Not(isAdmin())) return Stop('You are not an administrator');

    var Ignorefilenotfound = false;
    var Dftallitems = false;
    var Help = [undefined, 'ReGen \<TableName\> \<itemnames\> (N'];
    Help[Help.length] = Extract(Help, -1, 0, 0) == '   option N)o inline modeler generation';

    // Include JSB_TCL __SHELL

    // prefix with:

    // Input Variables:
    // DftAllItems:         set to 1 before include to allow all items by default (* allowed)
    // IgnoreFileNotFound:  set to 1 before include to ignored "file not found" errors
    // Help:                An Array of help instructions if filename is empty or "?"

    // File Variables:
    // Dictdata:   "" or "dict"
    // TableName:  FILE NAME ONLY (NO DICT/DATA CLAUSE) 
    // Fname:      FILE NAME WITH DICT/DATA CLAUSE 
    // F_file:     Opened file Or Empty

    // Item Variables:
    // Inames:   Array of items selected

    // Misc Variables:
    // Errors:    Multi-valued list of errors that are automatically printed at end of run
    // FilterBy:  Any filter applied
    // OrderBY:   Any OrderBy applied
    // Options:   a UCase of @Sentence with ! (debug) removed
    // AllItems: All items of the file were selected (*)

    activeProcess.At_Prompt = '';
    var Errors = [undefined,];
    Dftallitems = Dftallitems;

    // Specific file(s) given? 

    var Defaulttop = '';
    var Top = '';
    var Columns = '';
    var Dictdata = '';
    var Tablename = '';
    var Filterby = '';
    var Orderby = '';
    var Allitems = false;
    var F_File = undefined;

    var _Options = '';
    var Fname = '';

    if (Not(Help)) Help = [undefined,];

    if (await JSB_BF_PARSESELECT(CStr(activeProcess.At_Sentence), Defaulttop, Top, Columns, Dictdata, Tablename, Filterby, Orderby, _Options, Allitems, F_File, false, Ignorefilenotfound, undefined, function (_Top, _Columns, _Dictdata, _Tablename, _Filterby, _Orderby, __Options, _Allitems, _F_File) { Top = _Top; Columns = _Columns; Dictdata = _Dictdata; Tablename = _Tablename; Filterby = _Filterby; Orderby = _Orderby; _Options = __Options; Allitems = _Allitems; F_File = _F_File })) {
        Fname = LTrim(Dictdata + ' ' + Tablename);

        if (!Fname) {
            if (!Ignorefilenotfound) {
                if (Not(Help)) Errors[Errors.length] = Field(activeProcess.At_Sentence, ' ', 1) + ' TableName ItemID(s) (Options'; else Errors = Help;
            }
        } else {
            if (Allitems || Filterby == '*' || (!Filterby && Dftallitems && Not(System(11)))) {
                Filterby = '';
                clearSelect(odbActiveSelectList);
                if (await JSB_ODB_SELECT('', F_File, '', '')); else return Stop(activeProcess.At_Errors);
            } else {
                if (Filterby) {
                    Filterby = LTrim(RTrim(Filterby + Orderby));
                    if (await JSB_ODB_SELECT(LTrim(Top + ' ') + Join(Columns, ' '), F_File, Filterby, '')); else return Stop(activeProcess.At_Errors);
                }
            }
        }
    } else {
        if ((!Tablename || Tablename == '?') && CBool(Help)) Errors = Help; else Errors[Errors.length] = activeProcess.At_Errors;
        Fname = LTrim(Dictdata + ' ' + Tablename);
    }

    var Inames = [undefined,];
    var Rniname = '';

    while (true) {
        Rniname = readNext(odbActiveSelectList).itemid;
        if (Rniname); else break
        if (Not(Rniname)) break;
        Inames[Inames.length] = Rniname;
    }

    if (Not(F_File)) return Stop(Change(Help, am, crlf));
    if (Not(Inames)) return Chain('ReGenWebSiteModel ' + Fname);

    Fname = UCase(await JSB_BF_TRUETABLENAME(Tablename));
    if (Fname == 'jsb_docs') return Stop('Try compile jsb_docs instead');

    Nomodelingstuff = InStr1(1, _Options, 'N');
    Fdict = await JSB_BF_FHANDLE('dict', Fname);

    Errors = [undefined,];
    Lctime = At_Session.Item('LastMenuCompile_' + Fname);

    Itemi = LBound(Inames) - 1;
    for (Iname of iterateOver(Inames)) {
        Itemi++;
        Iname = dropIfRight(CStr(Iname), '.view', true);
        Iname = dropIfRight(CStr(Iname), '.page', true);

        if (Left(Iname, 1) == '_') continue;

        Pagename = CStr(Iname) + '.page';
        if (await JSB_ODB_READJSON(Pagedataset, Fdict, CStr(Pagename), function (_Pagedataset) { Pagedataset = _Pagedataset })) {
            At_Session.Item('LastMenuCompile_' + Fname, r83Time() + 30);
            await JSB_MDL_REGENPAGEMODEL_Sub(Fname, Iname, true, true, Nomodelingstuff);
            FlushHTML();
        } else {
            Errors[Errors.length] = 'Unable to find page: ' + Fname + ' ' + CStr(Pagename);
        }
    }

    if (CBool(Errors)) Println(MonoSpace(Join(Errors, crlf)));

    At_Session.Item('LastMenuCompile_' + Fname, Lctime);

    await JSB_MDL_UPDATEMENU_Sub(Fname);
    return Stop('Done');
}
// </REGEN_Pgm>

// <REGENPAGEMODEL_Sub>
async function JSB_MDL_REGENPAGEMODEL_Sub(Projectname, Ipagename, Showresults, Nostopping, Nomodelingstuff) {
    // local variables
    var Pagename, Pagedataset, Compileresults;

    // %options aspxC-

    Pagename = dropIfRight(CStr(Ipagename), '.page', true) + '.page';

    if (await JSB_ODB_READJSON(Pagedataset, await JSB_BF_FHANDLE('dict', Projectname), CStr(Pagename), function (_Pagedataset) { Pagedataset = _Pagedataset })); else {
        Println('Unable to find page ', Pagename, ' ', activeProcess.At_Errors);
        return;
    }

    await JSB_MDL_UPDATEMENU_Sub(CStr(Projectname));
    await JSB_MDL_GENERATECODEFROMTEMPLATE(Projectname, 'JSB_pageTemplates', '', undefined, Pagename, '', Compileresults, Nomodelingstuff, function (_Projectname, _P3, _P4, _Pagename, _P6, _Compileresults) { Projectname = _Projectname; Pagename = _Pagename; Compileresults = _Compileresults });
    if (CBool(Showresults)) {
        if (CBool(Compileresults)) {
            if (CBool(Nostopping)) Println(Compileresults); else { Println(At(-1), Compileresults, JSB_HTML_SUBMITBTN('edv_formBtn', 'OK')); await At_Server.asyncPause(me); }
        } else if (Not(Nostopping)) {
            Alert('Sucessful generation of page ' + CStr(Pagename));
        }
    } else if (InStr1(1, Compileresults, '^')) {
        if (CBool(Nostopping)) Println(Compileresults); else { Println(At(-1), Compileresults, JSB_HTML_SUBMITBTN('edv_formBtn', 'OK')); await At_Server.asyncPause(me); }
    }
}
// </REGENPAGEMODEL_Sub>

// <REGENPAGEMODEL_Pgm>
async function JSB_MDL_REGENPAGEMODEL_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Projectname, Pagename, Frompage, Sentence;

    // %options aspxC-
    if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a data manager to run program');

    Projectname = paramVar('ProjectName');
    Pagename = paramVar('pageName');
    Frompage = paramVar('fromPage');

    if (isEmpty(Projectname) && InStr1(1, activeProcess.At_Sentence, '=') == 0) {
        Sentence = Field(activeProcess.At_Sentence, '(', 1);
        Projectname = Field(Sentence, ' ', 2);
        Pagename = Field(Sentence, ' ', 3);
        if (LCase(Projectname) == 'dict') {
            Projectname = Field(Sentence, ' ', 3);
            Pagename = Field(Sentence, ' ', 4);
        }
    }

    Print(At(-1), 'Working...');
    await JSB_MDL_REGENPAGEMODEL_Sub(Projectname, Pagename, false);

    Print(At(-1), 'Complete..');
    if (CBool(Frompage)) return At_Response.Redirect(Frompage);
    if (Not(System(22))) await JSB_MDL_RESPONSEREDIRECT(jsbRootExecute(CStr(Pagename)));
    return;
}
// </REGENPAGEMODEL_Pgm>

// <REGENWEBSITEMODEL_Pgm>
async function JSB_MDL_REGENWEBSITEMODEL_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Projectname, Frompage, Sentence, Scp, Dscp, Sl, L, Id;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                // %options aspxC-
                if (Not(isAdmin())) return Stop('You must be an administrator to run this command');

                Projectname = paramVar('ProjectName');
                Frompage = paramVar('fromPage');

                if (isEmpty(Projectname) && InStr1(1, activeProcess.At_Sentence, '=') == 0) {
                    Sentence = Field(activeProcess.At_Sentence, '(', 1);
                    Projectname = Field(Sentence, ' ', 2);
                }
                if (Not(Projectname)) Projectname = 'cs';

                if (await JSB_ODB_OPEN('', CStr(Projectname), Scp, function (_Scp) { Scp = _Scp })); else { gotoLabel = "DONE"; continue atgoto; }
                if (await JSB_ODB_OPEN('dict', CStr(Projectname), Dscp, function (_Dscp) { Dscp = _Dscp })); else { gotoLabel = "DONE"; continue atgoto; }

                Print(At(-1));
                if (await JSB_ODB_SELECTTO('', Dscp, 'ItemID Like \'%.page\'', Sl, function (_Sl) { Sl = _Sl })); else return Stop(activeProcess.At_Errors);
                L = getList(Sl);

                L = await JSB_BF_INPUTMULTISELECT('Select pages to regenerate', 'Pages', CStr(L), CStr(L));
                if (Len(L) == 0 || L == Chr(27)) { gotoLabel = "DONE"; continue atgoto; }

                for (Id of iterateOver(L)) {
                    if (Id != '.page') {
                        Println('-------------------------------------------------------');
                        Println(Id);
                        At_Session.Item('LastMenuCompile_' + CStr(Id), r83Time() + 30);
                        await JSB_MDL_REGENPAGEMODEL_Sub(Projectname, Id, true);
                        FlushHTML();
                    }
                }

                At_Session.Item('LastMenuCompile_' + CStr(Id), r83Time() - 30);
                await JSB_MDL_UPDATEMENU_Sub(CStr(Id));
                Println(await JSB_BF_MSGBOX('done'));


            case "DONE":

                if (CBool(Frompage)) return At_Response.Redirect(Frompage);
                if (hasTclParent() || hasParentProcess()) return Stop();
                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </REGENWEBSITEMODEL_Pgm>

// <RENAMEPAGEMODEL_Pgm>
async function JSB_MDL_RENAMEPAGEMODEL_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Projectname, Oldpagename, Frompage, _Closewindow, Sentence;
    var Newpagename;

    // %options aspxC-
    if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a data manager to run program');

    Projectname = paramVar('ProjectName');
    Oldpagename = paramVar('pageName');
    Frompage = paramVar('fromPage');
    _Closewindow = paramVar('closeWindow');

    if (isEmpty(Projectname) && InStr1(1, activeProcess.At_Sentence, '=') == 0) {
        Sentence = Field(activeProcess.At_Sentence, '(', 1);
        Projectname = Field(Sentence, ' ', 2);
        Oldpagename = Field(Sentence, ' ', 3);
        if (LCase(Projectname) == 'dict') {
            Projectname = Field(Sentence, ' ', 3);
            Oldpagename = Field(Sentence, ' ', 4);
        }
    }
    Oldpagename = dropIfRight(CStr(Oldpagename), '.page', true);

    Newpagename = Trim(await JSB_BF_INPUTBOX('Rename', 'Enter a new name', '', '80%', ''));
    Newpagename = dropIfRight(CStr(Newpagename), '.page', true);
    if (Newpagename == Chr(27) || isEmpty(Newpagename)) {
        if (CBool(Frompage)) { await JSB_MDL_RESPONSEREDIRECT(Frompage, function (_Frompage) { Frompage = _Frompage }); }
        if (CBool(_Closewindow) || !hasParentProcess()) At_Server.End();
        await JSB_MDL_RESPONSEREDIRECT(jsbRootExecute(CStr(Oldpagename)));
    }

    At_Session.Item('LastMenuCompile_' + CStr(Projectname), r83Time() - 30);

    if (await JSB_MDL_CLONEPAGEMODEL(Projectname, Oldpagename, Newpagename)) {
        await JSB_MDL_DELETEPAGEMODEL(Projectname, Oldpagename, function (_Projectname, _Oldpagename) { Projectname = _Projectname; Oldpagename = _Oldpagename });
    }

    if (CBool(Frompage) || hasTclParent()) {
        if (await JSB_BF_MSGBOX('Where to?', 'Go to new page?', '*Yes,No') != 'Yes') { await JSB_MDL_RESPONSEREDIRECT(Frompage, function (_Frompage) { Frompage = _Frompage }); }
    } else {
        if (CBool(_Closewindow) || !hasParentProcess()) At_Server.End();
    }

    if (hasTclParent()) return Stop('Done');

    await JSB_MDL_RESPONSEREDIRECT(jsbRootExecute(CStr(Newpagename)));
    return;
}
// </RENAMEPAGEMODEL_Pgm>

// <RENAMEVIEW>
async function JSB_MDL_RENAMEVIEW(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Newviewname, setByRefValues) {
    // local variables
    var Fdict, Dataset, Tmp;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Newviewname)
        return v
    }
    // %options aspxC-

    ByRef_Viewname = dropIfRight(CStr(ByRef_Viewname), '.view', true);
    Fdict = await JSB_BF_FHANDLE('DICT', ByRef_Projectname);

    if (await JSB_ODB_READJSON(Dataset, Fdict, CStr(ByRef_Viewname) + '.view', function (_Dataset) { Dataset = _Dataset })); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);

    if (Not(ByRef_Newviewname)) {
        ByRef_Newviewname = Trim(await JSB_BF_INPUTBOX('Rename view', 'Enter a new name', CStr(ByRef_Viewname), '80%', ''));
        if (ByRef_Newviewname == Chr(27) || isEmpty(ByRef_Newviewname)) return exit(false);

        ByRef_Newviewname = dropIfRight(CStr(ByRef_Newviewname), '.view', true);
        if (LCase(ByRef_Newviewname) == LCase(ByRef_Viewname)) return exit(false);
    }

    ByRef_Newviewname = dropIfRight(CStr(ByRef_Newviewname), '.view', true);
    if (await JSB_ODB_READ(Tmp, Fdict, CStr(ByRef_Newviewname) + '.view', function (_Tmp) { Tmp = _Tmp })) {
        Alert(CStr(ByRef_Newviewname) + ' already exists', false);
        return exit(false);
    }

    if (await JSB_MDL_CLONEVIEWTO(CStr(ByRef_Projectname), CStr(ByRef_Projectname), CStr(ByRef_Viewname), CStr(ByRef_Newviewname))) {
        await JSB_MDL_DELETEVIEW(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, false, function (_ByRef_Projectname, _ByRef_Pagename, _ByRef_Viewname, _P4) { ByRef_Projectname = _ByRef_Projectname; ByRef_Pagename = _ByRef_Pagename; ByRef_Viewname = _ByRef_Viewname });
    }

    ByRef_Viewname = CStr(ByRef_Newviewname) + '.view';
    return exit(true);
}
// </RENAMEVIEW>

// <REQUIRECOLUMN_Sub>
async function JSB_MDL_REQUIRECOLUMN_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, setByRefValues) {
    // local variables
    var Dataset, Columnidx;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid)
        return v
    }
    // %options aspxC-

    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);
    Columnidx = await JSB_MDL_FINDVIEWCOLUMN(Dataset, ByRef_Columnid, function (_Dataset) { Dataset = _Dataset });
    if (Null0(Columnidx) == '0') return exit(undefined);
    Dataset.columns[Columnidx].required = Not(Dataset.columns[Columnidx].required);
    Dataset.columns[Columnidx].notblank = Dataset.columns[Columnidx].notblank;
    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edc-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </REQUIRECOLUMN_Sub>

// <REQUIREDCOLUMNS_Sub>
async function JSB_MDL_REQUIREDCOLUMNS_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, setByRefValues) {
    // local variables
    var Dataset, Allcolumns, Selcolumns, Column, Cname, Selectedcols;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname)
        return v
    }
    // %options aspxC-

    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);

    Allcolumns = [undefined,];
    Selcolumns = [undefined,];
    for (Column of iterateOver(Dataset.columns)) {
        Cname = Trim(Column.name);
        if (CBool(Cname)) {
            Allcolumns[Allcolumns.length] = Cname;
            if (CBool(Column.required) || CBool(Column.notblank)) Selcolumns[Selcolumns.length] = Cname;
        }
    }

    Selectedcols = await JSB_BF_INPUTMULTISELECT('Required Columns', 'Select required columns:', CStr(Allcolumns), CStr(Selcolumns), '50%', '80%');
    if (isEmpty(Selectedcols) || Selectedcols == Chr(27)) return exit(undefined);

    for (Column of iterateOver(Dataset.columns)) {
        Cname = Trim(Column.name);
        if (Locate(Cname, Selectedcols, 0, 0, 0, "", position => { })) Column.required = true; else Column.required = false;
    }

    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </REQUIREDCOLUMNS_Sub>

// <RESETBACKGROUND>
async function JSB_MDL_RESETBACKGROUND(Projectname, Objectmodel, ByRef_Htmlbackdrop, Viewname, setByRefValues) {
    // local variables
    var Ans;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Htmlbackdrop)
        return v
    }
    // %options aspxC-

    Ans = await JSB_BF_MSGBOX('Warning!', 'Reset background to:', 'New,Appended Columns,No Format,Cancel'); // FormView
    switch (Ans) {
        case 'Appended Columns':
            ByRef_Htmlbackdrop = await JSB_MDL_PUTROWDATAINTOHTML(Projectname, Objectmodel, {}, ByRef_Htmlbackdrop, Viewname, function (_Projectname, _Objectmodel, _P3, _ByRef_Htmlbackdrop, _Viewname) { Projectname = _Projectname; Objectmodel = _Objectmodel; ByRef_Htmlbackdrop = _ByRef_Htmlbackdrop; Viewname = _Viewname });

            break;

        case 'New':
            ByRef_Htmlbackdrop = '';

            break;

        case 'No Format':
            ByRef_Htmlbackdrop = await JSB_MDL_STANDARDFORMVIEW(Projectname, Objectmodel, false, Viewname, function (_Projectname, _Objectmodel, _P3, _Viewname) { Projectname = _Projectname; Objectmodel = _Objectmodel; Viewname = _Viewname });

            break;

        default:
            return exit(false);
    }

    return exit(true);
}
// </RESETBACKGROUND>

// <RESPONSEREDIRECT>
async function JSB_MDL_RESPONSEREDIRECT(ByRef_Topage, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Topage)
        return v
    }
    // %options aspxC-

    Print(At(-1), JSB_HTML_SCRIPT('window.open(' + jsEscapeString(CStr(ByRef_Topage)) + ')'));
    FlushHTML();
    return Stop();
}
// </RESPONSEREDIRECT>

// <RESTAPIFETCH_Pgm>
async function JSB_MDL_RESTAPIFETCH_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Grpi, Innsersql, Grpi2, Rec;

    var Notimeout = System(56);
    var Clause = undefined;
    var Databasename = JSB_BF_PARAMVAR('databaseName');
    var Tablename = JSB_BF_PARAMVAR('tableName');

    var Result = undefined;

    if (await JSB_ODB_ATTACHDB(Databasename)); else { Result = { "errors": activeProcess.At_Errors }; await JSB_MDL_RTNRESULT(Result, function (_Result) { Result = _Result }); return; }
    var Ftable = undefined;
    if (await JSB_ODB_OPEN('', Tablename, Ftable, function (_Ftable) { Ftable = _Ftable })); else { Result = { "errors": activeProcess.At_Errors }; await JSB_MDL_RTNRESULT(Result, function (_Result) { Result = _Result }); return; }

    if (!isSqlServer(Ftable)) { Result = { "errors": 'not a arySQL table' }; await JSB_MDL_RTNRESULT(Result, function (_Result) { Result = _Result }); return; }

    var Skip = JSB_BF_PARAMVAR('skip');
    var Take = JSB_BF_PARAMVAR('take');
    var Requiretotalcount = JSB_BF_PARAMVAR('requireTotalCount');
    var Requiregroupcount = JSB_BF_PARAMVAR('requireGroupCount');
    var Order = JSB_BF_PARAMVAR('sort');
    var Filter = JSB_BF_PARAMVAR('filter');
    var Totalsummary = JSB_BF_PARAMVAR('totalSummary');
    var Group = JSB_BF_PARAMVAR('group');
    var Groupsummary = JSB_BF_PARAMVAR('groupSummary');

    if (Len(Take)) {
        Take = ' fetch next ' + Take + ' rows only';
        if (!Len(Skip)) Skip = '0';
        Skip = '  Offset ' + Skip + ' rows';
    }

    var Filterbyclause = '';
    if (Filter) {
        var Filterby = await JSB_MDL_RESTAPIBUILDWHERE(parseJSON(Filter));
        Filterbyclause = Join(Filterby, ' ');
    }

    // simple fetch: skip=0&take=12&requireTotalCount=true
    var Orderbyclause = '';
    var Aryorder = [undefined,];
    var Orderby = [undefined,];
    var Arysql = [undefined,];

    var Sl = undefined;

    if (Not(Group)) {
        if (Order) {
            Aryorder = parseJSON(Order);
            for (Clause of iterateOver(Aryorder)) {
                Orderby[Orderby.length] = '[' + CStr(Clause.selector) + ']' + (Clause.desc ? ' desc' : '');
            }
            Orderbyclause = Join(Orderby, ', ');
        }

        if (Filterbyclause) Filterbyclause = ' where ' + Filterbyclause;

        if (Not(Orderbyclause)) {
            var Pk = Ftable.PrimaryKeyColumnName();
            if (Pk) Orderbyclause = ' [' + Pk + ']'; else { Result = { "errors": 'No primary key in table ' + Tablename + '; ' + Databasename }; await JSB_MDL_RTNRESULT(Result, function (_Result) { Result = _Result }); return; }
        }

        if (Orderbyclause) Orderbyclause = ' order by ' + Orderbyclause;

        var Sqlcmd = 'Select * from [' + Tablename + ']' + Filterbyclause + Orderbyclause + Skip + Take;

        if (await asyncDNOSqlSelect(Sqlcmd, _selectList => Sl = _selectList)); else { Result = { "errors": CStr(activeProcess.At_Errors) + '; ' + Databasename + ': ' + CStr(Arysql) }; await JSB_MDL_RTNRESULT(Result, function (_Result) { Result = _Result }); return; }

        var Recs = getList(Sl);

        Result = { "data": Recs };
        if (Requiretotalcount) {
            Result.totalCount = Ftable.Execute('Select Count(*) From [' + Tablename + ']' + Filterbyclause);
            Result.totalCount = CNum(Result.totalCount) + 0;
        }

        await JSB_MDL_RTNRESULT(Result, function (_Result) { Result = _Result }); return;
    }

    // grouping request: databaseName=sgs tableName=strm_fish & group=[{"selector":"SexDeterminationID","desc":false,"isExpanded":false}]

    if (Not(Group)) Group = '[]';
    var Arygroup = parseJSON(Group);

    for (Grpi = UBound(Arygroup) + 1; Grpi >= 1; Grpi--) {
        var Newsql = [undefined,];

        if (Null0(Grpi) > UBound(Arygroup)) {
            Newsql[Newsql.length] = '(select * from [' + Tablename + '] As F' + CStr(Grpi);
        } else {
            Clause = Arygroup[Grpi];
            if (CBool(Clause.isExpanded)) {
                Newsql[Newsql.length] = CStr((Null0(Grpi) > 1 ? '(' : '')) + 'select [' + CStr(Clause.selector) + '] As "key", count(*) As "count", items = ';
                for (Innsersql of iterateOver(Arysql)) {
                    Newsql[Newsql.length] = '   ' + CStr(Innsersql);
                }
            } else {
                Newsql[Newsql.length] = CStr((Null0(Grpi) > 1 ? '(' : '')) + 'select [' + CStr(Clause.selector) + '] As "key", count(*) As "count", items = null';
            }
        }

        var Wc = [undefined,];
        if (Null0(Grpi) == 1) {
            if (Filterbyclause) Wc[Wc.length] = Filterbyclause;
        } else {
            var _ForEndI_20 = +Grpi - 1;
            for (Grpi2 = 1; Grpi2 <= _ForEndI_20; Grpi2++) {
                var Clause2 = Arygroup[Grpi2];
                Wc[Wc.length] = 'F' + CStr(Grpi2) + '.[' + CStr(Clause2.selector) + '] = F' + CStr(Grpi) + '.[' + CStr(Clause2.selector) + ']';
            }
        }

        if (Null0(Grpi) <= UBound(Arygroup)) {
            Newsql[Newsql.length] = '   from [' + Tablename + '] As F' + CStr(Grpi);
        }

        if (CBool(Wc)) Newsql[Newsql.length] = '   where ' + Join(Wc, ' And ');

        if (Null0(Grpi) > UBound(Arygroup)) {
            Orderby = [undefined,];
            var Alreadydone = [undefined,];

            for (Clause of iterateOver(Arygroup)) {
                Orderby[Orderby.length] = '[' + CStr(Clause.selector) + ']' + (Clause.desc ? ' desc' : '');
                Alreadydone[Alreadydone.length] = Clause.selector;
            }

            for (Clause of iterateOver(Aryorder)) {
                if (Locate(Clause.selector, Alreadydone, 0, 0, 0, "", position => { })); else {
                    Orderby[Orderby.length] = '[' + CStr(Clause.selector) + ']' + (Clause.desc ? ' desc' : '');
                    Alreadydone[Alreadydone.length] = Clause.selector;
                }
            }

            Newsql[Newsql.length] = '   Order By ' + Join(Orderby, ', ');;
        } else {
            Newsql[Newsql.length] = '   Group By [' + CStr(Clause.selector) + '] Order By [' + CStr(Clause.selector) + ']' + (Clause.desc ? ' desc' : '');;
        }

        if (Null0(Grpi) > 1) {
            Newsql[Newsql.length] = '   for json auto, INCLUDE_NULL_VALUES ';
            Newsql[Newsql.length] = ')';
        }

        Arysql = Newsql;
    }

    var Ssql = Join(Arysql, crlf);

    if (await asyncDNOSqlSelect(Ssql, _selectList => Sl = _selectList)); else { Result = { "errors": CStr(activeProcess.At_Errors) + '; ' + Databasename + ': ' + Ssql }; await JSB_MDL_RTNRESULT(Result, function (_Result) { Result = _Result }); return; }
    var Sqldataset = getList(Sl);

    if (UBound(Arygroup) > 1) {
        for (Rec of iterateOver(Sqldataset)) {
            Rec.items = parseJSON(Rec.items);
        }
    }

    Result = { "data": Sqldataset };
    return;
}
// </RESTAPIFETCH_Pgm>

// <RTNRESULT>
async function JSB_MDL_RTNRESULT(ByRef_Result, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Result)
        return v
    }
    At_Response.Buffer('');
    At_Response.Header.Set('Content-Type', 'application/json');
    At_Response.BinaryWrite(ByRef_Result);
    At_Server.End();
    return exit();
}
// </RTNRESULT>

// <RESTAPIBUILDWHERE>
async function JSB_MDL_RESTAPIBUILDWHERE(Filter) {
    // local variables
    var Filterby, Clause;

    Filterby = [undefined,];
    for (Clause of iterateOver(Filter)) {
        var C = '';

        if (CBool(isArray(Clause))) {
            if (CBool(isArray(Clause[1]))) {
                C = '(' + await JSB_MDL_RESTAPIBUILDWHERE(Clause) + ')';
            } else if (UBound(Clause) == 3) {
                if (isNothing(Clause[3])) {
                    if (Clause[2] == '=') Clause[2] = 'Is'; else Clause[2] = 'Is Not';
                    Clause[3] = 'null';;
                } else {
                    Clause[3] = '\'' + CStr(Clause[3]) + '\'';;
                }

                C = '[' + CStr(Clause[1]) + '] ' + CStr(Clause[2]) + ' ' + CStr(Clause[3]);
            } else {
                C = Join(Clause, ' ');
            }
        } else {
            C = Clause;
        }

        Filterby[Filterby.length] = C;
    }

    return Join(Filterby, ' ');
}
// </RESTAPIBUILDWHERE>

// <ROWHASNUMBERS>
async function JSB_MDL_ROWHASNUMBERS(ByRef_Row, setByRefValues) {
    // local variables
    var Numbersinhdr, Term;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    // Does the header contain numbers?  Problably not a header then
    Numbersinhdr = 0;
    for (Term of iterateOver(ByRef_Row)) {
        if (isNumber(Term)) Numbersinhdr++;
    }
    return exit(Numbersinhdr);
}
// </ROWHASNUMBERS>

// <SETBUTTONURL_Sub>
async function JSB_MDL_SETBUTTONURL_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, setByRefValues) {
    // local variables
    var Dataset, Columnidx, Btn;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid)
        return v
    }
    // %options aspxC-
    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);
    Columnidx = await JSB_MDL_FINDVIEWCOLUMN(Dataset, ByRef_Columnid, function (_Dataset) { Dataset = _Dataset });
    if (Null0(Columnidx) == '0') return exit(undefined);

    Btn = [undefined, {}];
    Btn[1].label = Dataset.columns[Columnidx].label;
    Btn[1].datausuage = Dataset.columns[Columnidx].datausuage;
    Btn[1].transferto = Dataset.columns[Columnidx].transferto;
    Btn[1].transferurl = Dataset.columns[Columnidx].transferurl;
    Btn[1].onParentExtra = Dataset.columns[Columnidx].onParentExtra;
    Btn[1].transferaddfrompage = Dataset.columns[Columnidx].transferaddfrompage;

    Btn = await JSB_BF_POPUP_JSONDEF(ByRef_Projectname, 'jsb_jsondefs', 'buttonurl', '', '', Btn, '80%', 'auto', 'Button selections for view ' + CStr(ByRef_Viewname) + ' ' + CStr(ByRef_Columnid), undefined, function (_ByRef_Projectname, _P2, _P3, _P4, _P5, _Btn) { ByRef_Projectname = _ByRef_Projectname; Btn = _Btn });

    if (Len(Btn)) {
        Dataset.columns[Columnidx].label = Btn[1].label;
        Dataset.columns[Columnidx].datausuage = Btn[1].datausuage;
        Dataset.columns[Columnidx].transferto = Btn[1].transferto;
        Dataset.columns[Columnidx].transferurl = Btn[1].transferurl;
        Dataset.columns[Columnidx].onParentExtra = Btn[1].onParentExtra;
        Dataset.columns[Columnidx].transferaddfrompage = Btn[1].transferaddfrompage;

        if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edc-', System(28), ': ', activeProcess.At_Errors);
        await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    }
    return exit();
}
// </SETBUTTONURL_Sub>

// <SETCOLUMNDEFAULTS_Sub>
async function JSB_MDL_SETCOLUMNDEFAULTS_Sub(ByRef_Datatype, ByRef_Viewcolumn, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Datatype, ByRef_Viewcolumn)
        return v
    }
    // %options aspxC-

    // Setup defaults

    ByRef_Viewcolumn.display = 'visible';
    ByRef_Viewcolumn.width = 12;
    ByRef_Viewcolumn.control = 'textbox';
    ByRef_Viewcolumn.canedit = true;
    ByRef_Viewcolumn.suppresslabel = false;
    ByRef_Viewcolumn.fullline = false;
    ByRef_Viewcolumn.ctlstyle = '';

    switch (ByRef_Datatype) {
        case 'guid':
            ByRef_Viewcolumn.control = 'label';

            break;

        case 'autointeger':
            ByRef_Viewcolumn.control = 'label';

            break;

        case 'integer':
            ByRef_Viewcolumn.control = 'textbox';

            break;

        case 'double':
            ByRef_Viewcolumn.control = 'textbox';

            break;

        case 'boolean':
            ByRef_Viewcolumn.control = 'checkbox';

            break;

        case 'string':
            ByRef_Viewcolumn.control = 'textbox';

            break;

        case 'date':
            ByRef_Viewcolumn.control = 'datebox';

            break;

        case 'time':
            ByRef_Viewcolumn.control = 'timebox';

            break;

        case 'datetime':
            ByRef_Viewcolumn.control = 'datetimebox';

            break;

        case 'currency':
            ByRef_Viewcolumn.control = 'currencyboxUS';

            break;

        case 'blob':
            ByRef_Viewcolumn.display = 'hidden';

            break;

        case 'jpg':
            ByRef_Viewcolumn.control = 'uploadimagebox';

            break;

        case 'png':
            ByRef_Viewcolumn.control = 'uploadimagebox';

            break;

        case 'url':
            ByRef_Viewcolumn.control = 'urlbox';

            break;

        case 'memo':
            ByRef_Viewcolumn.control = 'htmlbox';
            ByRef_Viewcolumn.fullline = true;

            break;

        case 'password':
            ByRef_Viewcolumn.control = 'passwordbox';

            break;

        case 'jsonarray':
            ByRef_Viewcolumn.control = 'jsonarray';

    }
    return exit();
}
// </SETCOLUMNDEFAULTS_Sub>

// <SETDEFAULTS>
async function JSB_MDL_SETDEFAULTS(ByRef_Objectname, ByRef_Columns, ByRef_Row, setByRefValues) {
    // local variables
    var Changed, Column, Cname, Dvalue;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Objectname, ByRef_Columns, ByRef_Row)
        return v
    }
    Changed = false;

    for (Column of iterateOver(ByRef_Columns)) {
        Cname = Column.name;
        if (CBool(Cname)) {
            if (isNothing(ByRef_Row[Cname])) {
                Dvalue = getDefaultValue(CStr(ByRef_Row[Cname]), CStr(Column.defaultvalue), CStr(Cname), CStr(ByRef_Objectname));
                if (!isNothing(Dvalue)) {
                    ByRef_Row[Cname] = Dvalue;
                    Changed = true;
                }
            }
        }
    }
    return exit(Changed);
}
// </SETDEFAULTS>

// <SETVIEWHEADER_Sub>
async function JSB_MDL_SETVIEWHEADER_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, setByRefValues) {
    // local variables
    var Dataset, Newvalue;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname)
        return v
    }
    // %options aspxC-

    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);
    Newvalue = Trim(await JSB_BF_INPUTBOX('View Header for' + CStr(ByRef_Viewname), 'Header', CStr(Dataset.header), '80%', ''));
    if (Newvalue == Chr(27) || isEmpty(Newvalue)) return exit(undefined);
    Dataset.header = Newvalue;
    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </SETVIEWHEADER_Sub>

// <SETVISIBLECOLUMNS_Sub>
async function JSB_MDL_SETVISIBLECOLUMNS_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, setByRefValues) {
    // local variables
    var Dataset, Allcolumns, Selcolumns, Column, Cname, Selectedcols;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname)
        return v
    }
    // %options aspxC-

    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);

    Allcolumns = [undefined,];
    Selcolumns = [undefined,];
    for (Column of iterateOver(Dataset.columns)) {
        Cname = Trim(Column.name);
        if (CBool(Cname)) {
            Allcolumns[Allcolumns.length] = Cname;
            if (Column.display != 'hidden' && Column.display != 'gridhidden') Selcolumns[Selcolumns.length] = Cname;
        }
    }

    Selectedcols = await JSB_BF_INPUTMULTISELECT('Visible Columns', 'Select Visible Columns:', CStr(Allcolumns), CStr(Selcolumns), '50%', '80%');
    if (isEmpty(Selectedcols) || Selectedcols == Chr(27)) return exit(undefined);

    for (Column of iterateOver(Dataset.columns)) {
        Cname = Trim(Column.name);
        if (Locate(Cname, Selectedcols, 0, 0, 0, "", position => { })) {
            Column.display = 'visible';
        } else {
            if (Column.display != 'hidden' && Column.display != 'gridhidden') Column.display = 'hidden';
        }
    }

    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </SETVISIBLECOLUMNS_Sub>

// <SHOW1000CONTEXTMENU>
function show1000ContextMenu(Gridid, Columnname) {
    // local variables
    var niceColumnName, niceGridName, CtlID, Cm;

    // %options aspxC-

    niceColumnName = JSB_BF_NICENAME(CStr(Columnname));
    niceGridName = JSB_BF_NICENAME(CStr(Gridid));

    CtlID = CStr(niceGridName) + '_' + CStr(niceColumnName);

    Cm = {
        "Set Column Label": { "cmd": 'SetLbl', "val": CtlID },
        "Hide Column": { "cmd": 'HideCol', "val": CtlID },
        "Show Column": { "cmd": 'ShowCol', "val": CtlID }
    };

    return ContextMenu('[id=\'' + CStr(CtlID) + '\']', Cm, true, CStr(CtlID) + '_contextMenu');
}
// </SHOW1000CONTEXTMENU>

// <SHOWEXCELFORM>
async function JSB_MDL_SHOWEXCELFORM(ByRef_Centerviewvars, ByRef_Basedirectory, ByRef_Xlsfilename, ByRef_Sqldbname, setByRefValues) {
    // local variables
    var Form, Settings, Dstdb, _Options;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Centerviewvars, ByRef_Basedirectory, ByRef_Xlsfilename, ByRef_Sqldbname)
        return v
    }
    if (InStr1(1, ByRef_Basedirectory, 'SCP Permits')) ByRef_Sqldbname = 'SCP Permits';

    await JSB_MDL_VIEW_EXCELUPLOAD_SETUP_Sub(ByRef_Centerviewvars, CStr(ByRef_Basedirectory), CStr(ByRef_Xlsfilename), CStr(ByRef_Sqldbname), function (_ByRef_Centerviewvars) { ByRef_Centerviewvars = _ByRef_Centerviewvars });

    Form = await JSB_MDL_DISPLAY_EXCELUPLOAD(ByRef_Centerviewvars);

    Print(At(-1));
    Print(JSB_HTML_STYLE('\r\n\
        .form-control-label {\r\n\
            word-break: break-word;\r\n\
            white-space: normal;\r\n\
            max-height: 45px;\r\n\
            font-size: 11px;\r\n\
        }'));

    Print(await JSB_THEMES_THEME_IFWIS('mdl', 'ExcelUpload', Form, function (_P1, _P2, _Form) { Form = _Form }), JSB_HTML_SCRIPT('$(\'.navbar-default\').hide();'));

    await At_Server.asyncPause(me);
    var Btn = formVar('formBtn_ExcelUpload');
    await JSB_MDL_VIEW_EXCELUPLOAD_UNLOAD_Sub(ByRef_Centerviewvars);

    if (Btn == 'Cancel') {
        activeProcess.At_Errors = '';
        return exit(false);
    }

    Print(JSB_HTML_STYLE('.IFrame { background-color: aliceblue; }'), JSB_HTML_SCRIPT('\r\n\
        openInTab("Excel2SQL", "Status", "Status", "");\r\n\
        $("#tab_Status").html("\<div id=\'xlsStatus\' class=\'IFrame\'\>\</div\>");\r\n\
        spinnerCnt--;\r\n\
    '));

    Settings = ByRef_Centerviewvars.Row;

    Dstdb = Settings.commonDatabaseName;
    if (Not(Dstdb)) Dstdb = ByRef_Xlsfilename;

    if (!(await JSB_BF_DBDATABASEEXISTS(CStr(Dstdb)))) {
        if (await JSB_ODB_ATTACHDB('')); else null;
        if (!(await JSB_BF_DBCREATESQLDATABASE(CStr(Dstdb)))) { await JSB_MDL_STATUSPRINT_Sub(activeProcess.At_Errors, function (_At_Errors) { activeProcess.At_Errors = _At_Errors }); return exit(false); }
    }

    if (Not(await JSB_ODB_ATTACHDBEXTENDED(Dstdb, 'databaseBuilder_rw', function (_Dstdb, _P2) { Dstdb = _Dstdb }))) { await JSB_MDL_STATUSPRINT_Sub(activeProcess.At_Errors, function (_At_Errors) { activeProcess.At_Errors = _At_Errors }); return exit(false); }

    _Options = 'Importing Excel file: ' + CStr(ByRef_Xlsfilename) + ' into SQL Database ' + CStr(Dstdb) + crlf;
    _Options += '   Option: Data rows must have at least one numeric cell ' + CStr(Settings.DataMustHaveOneNumericRow) + crlf;
    _Options += '   Option: Allow Side By Side Tables ' + CStr(Settings.SideBySideTables) + crlf;
    _Options += '   Option: Ignore Tables With No Rows ' + CStr(Settings.ignoreTablesWithNoSettingss) + crlf;
    _Options += '   Option: Ignore Tables With Less Than ' + CStr(Settings.ignoreTablesWithLessThanNColumns) + ' Columns ' + crlf;
    _Options += '   Option: One Table Per Sheet ' + CStr(Settings.OneTablePerSheet) + crlf;
    _Options += '   Option: Allow Data to have Blank Rows ' + CStr(Settings.AllowBlankRows) + crlf;
    _Options += '   Option: Default Empty Values From Previous Row ' + CStr(Settings.DefaultEmptyValuesFromPreviousRow) + crlf;
    _Options += '   Option: Delete And Recreate Sql Table ' + CStr(Settings.deleteAndRecreateTables) + crlf;
    _Options += '   Option: Show Imported Data ' + CStr(Settings.showTables) + crlf;
    await JSB_MDL_STATUSPRINT_Sub(_Options, function (__Options) { _Options = __Options });

    if (Not(await JSB_MDL_PROCESSEXCELFILE(Settings, ByRef_Basedirectory, ByRef_Xlsfilename, Dstdb, function (_Settings, _ByRef_Basedirectory, _ByRef_Xlsfilename, _Dstdb) { Settings = _Settings; ByRef_Basedirectory = _ByRef_Basedirectory; ByRef_Xlsfilename = _ByRef_Xlsfilename; Dstdb = _Dstdb }))) { await JSB_MDL_STATUSPRINT_Sub(activeProcess.At_Errors, function (_At_Errors) { activeProcess.At_Errors = _At_Errors }); return exit(false); }

    await JSB_MDL_STATUSPRINT_Sub('Done');
    return exit(true);
}
// </SHOWEXCELFORM>

// <SHOWTABLE>
async function JSB_MDL_SHOWTABLE(ByRef_Settings, ByRef_Tbl, ByRef_Sheetname, setByRefValues) {
    // local variables
    var _Html, Col, Coli, Rc, Rowi, Row;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Settings, ByRef_Tbl, ByRef_Sheetname)
        return v
    }
    _Html = html('\<style\>\r\n\
        table, th, td {\r\n\
          border: 1px solid black;\r\n\
          border-collapse: collapse;\r\n\
        }\r\n\
        th, td {\r\n\
          padding: 5px;\r\n\
        }\r\n\
        th {\r\n\
          text-align: left;\r\n\
        }\r\n\
    \</style\>');

    _Html += html('\<table\>');

    ByRef_Settings.HdrRow = ByRef_Tbl[1];
    _Html += html('\<tr\>');
    Coli = LBound(ByRef_Settings.HdrRow) - 1;
    for (Col of iterateOver(ByRef_Settings.HdrRow)) {
        Coli++;
        _Html += html('\<th\>') + CStr(Col) + html('\</th\>');
    }
    _Html += html('\</tr\>');

    Rc = UBound(ByRef_Tbl);
    var _ForEndI_1 = +Rc;
    for (Rowi = 2; (Rowi <= _ForEndI_1) && Null0(Rowi) < 10; Rowi++) {
        Row = ByRef_Tbl[Rowi];

        _Html += html('\<tr\>');
        Coli = LBound(Row) - 1;
        for (Col of iterateOver(Row)) {
            Coli++;
            _Html += html('\<td\>') + CStr(Col) + html('\</td\>');
        }
        _Html += html('\</tr\>');
    }
    _Html += html('\</table\>');
    if (Null0(Rowi) > 10) {
        _Html += '.......................' + CStr(+Rc - 10) + ' more Rows';
    }

    if (await JSB_MDL_OKAYTOOUTPUTTBL(ByRef_Settings, ByRef_Tbl, ByRef_Sheetname, function (_ByRef_Settings, _ByRef_Tbl) { ByRef_Settings = _ByRef_Settings; ByRef_Tbl = _ByRef_Tbl })) {
        return exit(JSB_HTML_STYLE('.IFrame { background-color: aliceblue; }') + JSB_HTML_SCRIPT('openInTab("Excel2SQL", "' + CStr(ByRef_Sheetname) + '", "' + CStr(ByRef_Sheetname) + '", ' + jsEscapeString(CStr(_Html)) + ')'));
    } else {
        _Html += color('lightgray', CStr(_Html));
        _Html += color('Red', CStr(activeProcess.At_Errors));

        Print(JSB_HTML_SCRIPT('\r\n\
            $("#xlsStatus").append(' + jsEscapeString(CStr(_Html)) + '); \r\n\
            $("#Excel2SQL").tabs("option", "active", 0);\r\n\
        '));

        await JSB_MDL_STATUSPRINT_Sub(crlf);
        _Html = '';
    }

    return exit(_Html);
}
// </SHOWTABLE>

// <SHOWTOP1000_Pgm>
async function JSB_MDL_SHOWTOP1000_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Rolemsg;

    Rolemsg = (JSB_BF_ISAUTHENTICATED() ? '' : 'You must be logged in to view this page. ' + Anchor(LoginUrl(), 'Click here to login'));
    if (!(await JSB_BF_ISEMPLOYEE())) return Stop((Rolemsg ? Rolemsg : 'I\'m sorry, you must be at least an IDFG employee to view this page.'));
    if (window.JSB_MDL_CHECKIN_Sub) await JSB_MDL_CHECKIN_Sub();

    var Databasename = paramVar('databaseName');
    var Tableid = paramVar('tableID');
    var Tabid = paramVar('tabID');

    var Devxgridlayout = paramVar('layout');

    // Did we run from TCL? setup something for testing
    if (Not(Tableid)) {
        var S = RTrim(Field(activeProcess.At_Sentence, '(', 1));
        var Cmd = Field(S, ' ', 1);
        if (LCase(Cmd) == 'run') Tableid = Field(S, ' ', 4); else Tableid = Field(S, ' ', 2);

        if (Not(isAdmin()) && Not(Tableid)) return Stop('tableID (the Table Name) is a required parameter');

        // for testing
        if (Domain() == 'idfg.idaho.gov' || Domain() == 'localhost') {
            Databasename = 'SGS';
            Tableid = 'PIC_Transect';
            if (await JSB_ODB_ATTACHDB(Databasename)); else return Stop('Unable to attach to ', Databasename);
        } else {
            Tableid = 'democustomers.json';
            Databasename = '';
        }
    } else {
        if (Databasename === undefined) return Stop('databaseName is a required parameter');
    }

    var Reportname = Databasename + '_' + Tableid;
    if (Not(await JSB_MDL_SHOWTOP1000(Tabid, Databasename, Tableid, Reportname, Devxgridlayout))) return Stop(activeProcess.At_Errors);
    if (hasTclParent() || hasParentProcess()) return Stop(); else At_Server.End();
    return;
}
// </SHOWTOP1000_Pgm>

// <SHOWTOP1000>
async function JSB_MDL_SHOWTOP1000(Tabid, Databasename, Tablename, Reportname, Devxgridlayout) {
    // local variables
    var Theme, Tablecolumns, Latcolumnname, Lngcolumnname, Primarykeyfield;
    var Dtcolumns, Column, Cname, Lcname, Settings, Htmlgrid, Toolbar;
    var Prescripts, Postscripts, _Html, Ctltext, Ctlid, Contextmenutext;
    var Selectlist, Searchrowcnt, Row1, Dtcolcnt, Tag, Colwidths;
    var Row, Colname, V, Lenofv, Dc, Cw, Caption, Visiblecolumncnt;
    var Cp, Wx, E64, Item, Url;

    var Ftmp = await JSB_BF_FHANDLE('tmp');
    var Gridid = 'showGrid';
    Reportname = CStr(Databasename) + '_gridViewGridDefs_';

    Theme = await JSB_BF_JSBCONFIG('default_jsb_Themes', 'theme_none');
    if (CBool(Theme)) Theme = 'jsb_themes.' + CStr(Theme);

    var Ftable = undefined;

    if (Databasename) {
        if (Not(await asyncRpcRequest('ATTACHDBEXTENDED', Databasename))) return false;
        if (CBool(await asyncRpcRequest('DBVIEWEXISTS', Tablename))) {
            var Tmptblname = '##dview_' + CStr(Tablename) + '_' + JSB_BF_NICENAME(UserName());
            if (await JSB_ODB_OPEN('', Tmptblname, Ftable, function (_Ftable) { Ftable = _Ftable })); else {
                Ftable = await asyncRpcRequest('DBMAKETMPTABLE', Tablename);
            }
        }
    }

    if (Not(Ftable)) {
        if (await JSB_ODB_OPEN('', CStr(Tablename), Ftable, function (_Ftable) { Ftable = _Ftable })); else return false;
    }

    var Columnnames = '*';
    var Hideexportbtns = false;
    var Urlbase = (jsbRootAccount() + '?showTop1000&databaseName=' + urlEncode(Databasename) + '&tableID=' + urlEncode(Tablename));

    var Cmd = '';
    if (Not(Devxgridlayout)) {
        if (await JSB_ODB_READJSON(Devxgridlayout, Ftmp, Reportname, function (_Devxgridlayout) { Devxgridlayout = _Devxgridlayout })); else { Devxgridlayout = {} }
    }

    var Msg = '';
    var Gridwidth = '';

    // Do we have a lat and a lng column?
    Tablecolumns = await asyncRpcRequest('GETTABLECOLUMNDEFS', Tablename, true, true);
    if (HasTag(Tablecolumns[LBound(Tablecolumns)], 'ordinal')) Tablecolumns = Sort(Tablecolumns, 'ordinal');
    if (HasTag(Tablecolumns[LBound(Tablecolumns)], 'Ordinal')) Tablecolumns = Sort(Tablecolumns, 'Ordinal');

    Latcolumnname = '';
    Lngcolumnname = '';
    Primarykeyfield = '';
    Dtcolumns = [undefined,];

    for (Column of iterateOver(Tablecolumns)) {
        Cname = Column.Name;
        Lcname = LCase(Cname);
        if (isEmpty(Lngcolumnname)) {
            if (InStr1(1, Lcname, 'longitude')) Lngcolumnname = Cname;
        }
        if (isEmpty(Latcolumnname)) {
            if (InStr1(1, Lcname, 'latitude')) Latcolumnname = Cname;
        }

        Dtcolumns[Dtcolumns.length] = Cname;
        if (CBool(Column.isLatitude)) Latcolumnname = Cname;
        if (CBool(Column.isLongitude)) Lngcolumnname = Cname;
        if (CBool(Column.primarykey)) Primarykeyfield = Cname;
    }

    if (Not(Primarykeyfield)) Primarykeyfield = await JSB_BF_PRIMARYKEYNAME(Ftable);

    // ======================================================================
    // Setup the DevxGrid
    // ======================================================================
    Settings = {};
    Settings.hideExportBtns = Hideexportbtns;
    Settings.latColumnName = Latcolumnname;
    Settings.lngColumnName = Lngcolumnname;
    Settings.databaseName = Databasename;
    Settings.tableName = Tablename;
    Settings.primaryKeyField = Primarykeyfield;
    if (CBool(Devxgridlayout.columnAutoWidth)) {
        Settings.columnAutoWidth = true;
    } else {
        Settings.columnAutoWidth = false;
    }
    delete Devxgridlayout['columnAutoWidth']


    do {
        Settings.devXGridLayout = Devxgridlayout;

        Htmlgrid = await JSB_HTML_DEVXGRID(Gridid, CStr(Tablename), Settings);

        // ======================================================================
        // Create a toolbar
        // ======================================================================
        Toolbar = JSB_HTML_SUBMITBTN('Btn', 'Update URL');

        if (await JSB_BF_ISMANAGER()) Toolbar += JSB_HTML_SUBMITBTN('Btn', 'Make Report');

        Toolbar += JSB_HTML_SUBMITBTN('Btn', 'Reset Layout', { "class": 'btnReset' });
        Toolbar += JSB_HTML_SUBMITBTN('Btn', 'Fit to Screen');
        Toolbar += JSB_HTML_SUBMITBTN('Btn', 'Fit to Data');

        if (!Hideexportbtns) {
            Toolbar += JSB_HTML_SUBMITBTN('Btn', 'Export to CSV');
        }

        if (Tabid || hasTclParent()) Toolbar += JSB_HTML_SUBMITBTN('Btn', 'Quit');

        // Create JS to capture when the layout changes
        Prescripts = [undefined,];
        Postscripts = [undefined,];

        Postscripts[Postscripts.length] = '\r\n\
            function onFormSubmitEvent_' + Gridid + '(event) {\r\n\
                var devXGridLayout = localStorage["' + Gridid + '" ];\r\n\
                \r\n\
                if (devXGridLayout) {\r\n\
                    // .columns (array), .allowedPageSizes (array, .filterPanel (json) .filterValue (string), .searchText (string), \r\n\
                    // .pageIndex (integer), .pageSize (integer), .selectedRowKeys (array)\r\n\
    \r\n\
                    $(\'#jsb\').append(\'\<input id="' + Gridid + '_devXGridLayout"  name="' + Gridid + '_devXGridLayout" type="hidden" /\>\');\r\n\
                    $("#' + Gridid + '_devXGridLayout").val(devXGridLayout);\r\n\
                }\r\n\
            }\r\n\
            \r\n\
            $("#jsb").submit(onFormSubmitEvent_' + Gridid + ');\r\n\
        ';

        Prescripts[Prescripts.length] = '\r\n\
            function ' + Gridid + '_onInit(s, e) { \r\n\
                // debugger;\r\n\
                $(\'.BtnReset\').prop(\'disabled\', false) \r\n\
            }\r\n\
        ';

        Prescripts[Prescripts.length] = '\r\n\
            function ' + Gridid + '_LayoutChanged(s, e) { \r\n\
                debugger;\r\n\
                $(\'.BtnReset\').prop(\'disabled\', false) \r\n\
            }\r\n\
        ';

        if (UBound(Prescripts)) Prescripts = JSB_HTML_SCRIPT(Join(Prescripts, crlf));
        if (UBound(Postscripts)) Postscripts = JSB_HTML_SCRIPT(Join(Postscripts, crlf));

        _Html = CStr(Prescripts) + JSB_HTML_ROWS2('%', CStr(Htmlgrid), '66px', CStr(Toolbar)) + CStr(Postscripts);

        // Theme screen
        if (Not(Tabid) && CBool(Theme)) {
            _Html = await asyncCallByName(Theme, me, 0/*ignore if missing */, System(27), System(28), _Html);
        }

        // ======================================================================
        // Show it all and give user a chance to interact
        // ======================================================================
        Print(At(-1), _Html);
        await At_Server.asyncPause(me);
        // ======================================================================
        // ======================================================================

        Devxgridlayout = CJSon(formVar(Gridid + '_devXGridLayout'));
        if (await asyncWrite(Devxgridlayout, Ftmp, Reportname, "JSON", 0)); else null;

        // ======================================================================
        // What does the user want to do?
        // ======================================================================
        Cmd = formVar('Btn');

        // Context menu command?
        if (Not(Cmd)) {
            Cmd = formVar('contextMenuCmd');
            Ctltext = formVar('contextMenuCtlText');
            Ctlid = formVar('contextMenuVal');
            Contextmenutext = formVar('contextMenuText');
        }

        // ======================================================================
        // Adjust Column widths to data
        // ======================================================================
        if (Cmd == 'Fit to Data') {
            // just use rows in the grid??
            debugger;
            Settings.columnAutoWidth = true;
            Devxgridlayout = {};;
        } else if (false) {
            if (await JSB_ODB_SELECTTO('top 100 *', Ftable, '', Selectlist, function (_Selectlist) { Selectlist = _Selectlist })); else return Stop(activeProcess.At_Errors);
            var Dt = getList(Selectlist);
            Searchrowcnt = Len(Dt);
            if (CBool(Searchrowcnt)) {
                Row1 = Dt[LBound(Dt)];
                Dtcolcnt = Len(Row1);
                Dtcolumns = [undefined,];
                for (Tag of iterateOver(Row1)) {
                    Dtcolumns[Dtcolumns.length] = Tag;
                }
            } else {
                Dtcolumns = [undefined,];
                Dtcolcnt = 0;
            }

            Colwidths = {};
            for (Row of iterateOver(Dt)) {
                for (Colname of iterateOver(Row)) {
                    V = RTrim(Row[Colname]);
                    Lenofv = Len(V);
                    if (Null0(Lenofv) > Null0(Colwidths[Colname])) Colwidths[Colname] = Lenofv;
                }
            }

            var Dxcolumns = Devxgridlayout.columns;
            for (Dc of iterateOver(Dxcolumns)) {
                Colname = Dc.dataField;
                Cw = Colwidths[Colname];
                if (Null0(Cw) < 3) Cw = 3;

                Caption = Dc.caption; // ID?
                if (Not(Caption)) Caption = Colname;
                if (Len(Caption) + 2 > Null0(Cw)) Cw = Len(Caption) + 2;
                if (Null0(Cw) > 60) Cw = 60;
                Dc.width = CStr((+Cw / 1.8)) + 'em';
            };
        } else if (Cmd == 'Fit to Screen') {
            debugger;

            Dxcolumns = Devxgridlayout.columns;
            Visiblecolumncnt = 0;

            for (Dc of iterateOver(Dxcolumns)) {
                if (CBool(Dc.visible)) Visiblecolumncnt++;
            }

            Cp = CInt(1000 / +Visiblecolumncnt) / 10;

            for (Dc of iterateOver(Dxcolumns)) {
                Dc.width = CStr(Cp) + '%';
            }

            // devXGrid.Width = CreateObject("Unit(Percentage, 100)")
            Settings.columnAutoWidth = false;
            delete Devxgridlayout['columnAutoWidth'];
        } else if (Cmd == 'Reset Layout') {
            debugger;

            // Let the devXGrid figure out the layut
            Devxgridlayout = {};
            Settings.columnAutoWidth = false;

            if (await JSB_ODB_DELETEITEM(Ftmp, Reportname)); else null;

            if (CBool(paramVar('filter')) || CBool(paramVar('layout'))) {
                if (await JSB_ODB_DELETEITEM(Ftmp, Reportname)); else return Stop(activeProcess.At_Errors);
                if (Tabid) {
                    Print(JSB_HTML_SCRIPT('windowOpen(' + jsEscapeString(Urlbase) + ', \'_blank\'); doJsbSubmit();'));
                    FlushHTML();
                    Print(At(-1));
                } else {
                    return At_Response.Redirect(Urlbase);
                }
            }
        }

        Wx = clone(Devxgridlayout);
        if (CBool(Settings.columnAutoWidth)) Wx.columnAutoWidth = true;
        if (await asyncWrite(Wx, Ftmp, Reportname, "JSON", 0)); else null;

        // ======================================================================
        // Exporting
        // ======================================================================
        if (Cmd == 'Export KML') {
            debugger;

            await JSB_MDL_DEVXGRID_DOWNLOADKML(Gridid, Settings, false, function (_Gridid, _Settings, _P3) { Gridid = _Gridid; Settings = _Settings });
        } else if (Cmd == 'Export to CSV') {
            debugger;

            E64 = aesEncrypt(Selectlist.GetCSV(), 64);

            Print(JSB_HTML_SCRIPT('\r\n\
               const b64Data = \'' + CStr(E64) + '\';\r\n\
               saveBlob(b64toBlob(b64Data, \'text/plain\'), "' + Reportname + '.csv")\r\n\
            '));

            E64 = '';
            Item = [undefined,];;
        } else if (Cmd == 'Update URL') {
            debugger;

            // Open this report in a seperate window with it's own URL
            Url = Urlbase;

            if (Devxgridlayout) Url += '&layout=' + urlEncode(Devxgridlayout);

            await JSB_MDL_RUNSCRIPT('\r\n\
                if (window.self !== window.parent) { \r\n\
                    w = window.parent.open(' + jsEscapeString(CStr(Url)) + ', \'_blank\'); \r\n\
                    setTimeout(function () { window.location = "close_html"; }, 500);\r\n\
                } else { \r\n\
                    window.open(' + jsEscapeString(CStr(Url)) + ', \'_self\'); \r\n\
                } \r\n\
            ');
        } else if (Cmd == 'Make Report') {
            debugger;

            Url = (jsbRootAccount() + '?makenewreport&databaseName=' + urlEncode(Databasename) + '&tableID=' + urlEncode(Tablename));
            await JSB_MDL_RUNSCRIPT('debugger; window.parent.open(' + jsEscapeString(CStr(Url)) + ', \'_blank\'); jsb.submit();');
        }

    }
    while (Cmd != 'Quit');

    return true;
}
// </SHOWTOP1000>

// <RUNSCRIPT>
async function JSB_MDL_RUNSCRIPT(ByRef_S, setByRefValues) {
    // local variables
    var Redirectpage;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_S)
        return v
    }
    Redirectpage = '\<!DOCTYPE html\>\r\n\
    \<html\>\r\n\
    \<head\>\r\n\
     \<meta http-equiv=\'Access-Control-Allow-Origin\' content=\'*\' /\>\r\n\
     \<meta http-equiv=\'Access-Control-Allow-Headers\' content=\'Content-Type, Accept, SOAPAction, Origin\' /\>\r\n\
     \<meta http-equiv=\'Access-Control-Max-Age\' content=\'1728000\' /\>\r\n\
     \<meta http-equiv=\'Content-Security-Policy\' content="img-src * data:; default-src *; style-src * \'unsafe-inline\'; script-src * \'unsafe-inline\' \'unsafe-eval\'" /\> \r\n\
     \<meta http-equiv=\'cache-control\' content=\'max-age=0\' /\>\r\n\
     \<meta http-equiv=\'expires\' content=\'0\' /\>\r\n\
     \<meta http-equiv=\'expires\' content=\'Tue, 01 Jan 1980 1:00:00 GMT\' /\>\r\n\
     \<meta http-equiv=\'pragma\' content=\'no-cache\' /\>\r\n\
    \<title\>devXGrid Redirect\</title\>\r\n\
    \</head\>\r\n\
    \<body\>\r\n\
    \<form id=\'jsb\' method=\'post\' action=\'\' class=\'jsb\' enctype=\'multipart/form-data\'\>\r\n\
    \<input name=\'_SID_\' type=\'hidden\' value=\'' + userno() + '\' /\>\r\n\
    \<input name=\'userClearedTclScreen\' type=\'hidden\' value=\'1\' /\>\r\n\
    \<input name=\'isJsbPost\' type=\'hidden\' value=\'1\' /\>\r\n\
    \</form\>\r\n\
    \<script\>\r\n\
    ' + CStr(ByRef_S) + '\r\n\
    \</script\>\r\n\
    \</html\>';

    At_Response.Buffer('');// Clear buffer
    At_Response.Header.Set('Content-Type', 'text/html; charset=UTF-8');
    At_Response.BinaryWrite(Redirectpage);
    FlushHTML();
    At_Response.Buffer('');// Clear buffer

    return exit(undefined);
}
// </RUNSCRIPT>

// <SHOWTOP1000_MYGRID>
async function JSB_MDL_SHOWTOP1000_MYGRID(Gridid) {
    return System(29).getControl(Gridid);
}
// </SHOWTOP1000_MYGRID>

// <SHOWVIEWCOLUMN_Sub>
async function JSB_MDL_SHOWVIEWCOLUMN_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, setByRefValues) {
    // local variables
    var Dataset, Cnames, Vcolumns, Columnidx, Viewrow, Columnid;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname)
        return v
    }
    // %options aspxC-

    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else { Dataset = await JSB_MDL_CREATENEWVIEW(ByRef_Viewname, function (_ByRef_Viewname) { ByRef_Viewname = _ByRef_Viewname }); }

    Cnames = [undefined,];
    Vcolumns = Dataset.columns;
    var _ForEndI_2 = Len(Vcolumns);
    for (Columnidx = 1; Columnidx <= _ForEndI_2; Columnidx++) {
        Viewrow = Vcolumns[Columnidx];
        if (Viewrow.display == 'hidden') Cnames[Cnames.length] = Viewrow.name;
    }

    if (Len(Cnames) == 0) {
        Alert('All columns are currently being displayed');
        return exit(undefined);
    }

    Columnid = await JSB_BF_INPUTDROPDOWNBOX('Pick a Column', '', CStr(Cnames));
    if (Columnid == Chr(27)) return exit(undefined);

    Columnidx = await JSB_MDL_FINDVIEWCOLUMN(Dataset, Columnid, function (_Dataset) { Dataset = _Dataset });
    if (Null0(Columnidx) == '0') return exit(undefined);
    Vcolumns = Dataset.columns;
    Viewrow = Vcolumns[Columnidx];
    Viewrow.display = 'visible';
    Viewrow.index = 0;
    Viewrow.index = await JSB_MDL_HIGHESTVIEWINDEX(Dataset, function (_Dataset) { Dataset = _Dataset });
    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edc-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </SHOWVIEWCOLUMN_Sub>

// <SQLQUERYBUILDER_Pgm>
async function JSB_MDL_SQLQUERYBUILDER_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Rolemsg, Databasename, Sqlid, Tabid, Fsystem, Fsql, Fhandle;
    var Lastxmlquery, Pdatabase, Querybuilderid, Mybtnicon1, Mybtnonclick1;
    var Btnsave, Hideothersave, Mybtnicon2, Mybtnonclick2, Btnquit;
    var Mybtnicon3, Mybtnonclick3, Btndelete, Hideotherdelete;
    var Mybtnicon4, Mybtnonclick4, Btnmakereport, Toolbar, Msg;
    var _Username, Passwrd, Initialcat, B, Mylastsql, Cmd, Ctltext;
    var Ctlid, Contextmenutext, Inputmsg, Newname, Prefix, Xx;
    var Url, Lbl;

    // %options aspxC-

    Rolemsg = (JSB_BF_ISAUTHENTICATED() ? '' : 'You must be logged in to view this page. ' + Anchor(LoginUrl(), 'Click here to login'));
    if (!(await JSB_BF_ISMANAGER())) return Stop((Rolemsg ? Rolemsg : 'You must be at least at least a data manager to use this command.'));

    Databasename = paramVar('databaseName');
    if (Databasename === undefined) return Stop('databaseName is a required parameter');

    Sqlid = paramVar('sqlID');
    Tabid = paramVar('tabID');
    Databasename = paramVar('databaseName');
    if (await JSB_ODB_ATTACHDB('')); else null;
    Fsystem = await JSB_BF_FHANDLE('system');

    if (await JSB_ODB_OPEN('', 'jsbCustomSQL', Fsql, function (_Fsql) { Fsql = _Fsql })); else {
        Fhandle = await JSB_BF_FHANDLE('', 'jsbCustomSQL', true);
        Fsql = await JSB_BF_FHANDLE('dict', 'jsbCustomSQL', true);
    }

    if (Sqlid == '*NEW*') {
        Lastxmlquery = '';
    } else {
        if (await JSB_ODB_READ(Lastxmlquery, Fsql, CStr(Sqlid) + '.devX', function (_Lastxmlquery) { Lastxmlquery = _Lastxmlquery })) {
            Pdatabase = Field(Lastxmlquery, '\<Parameter Name="database" Value=', 2);
            Pdatabase = Field(Pdatabase, '"', 2);
        }
    }

    Querybuilderid = 'myQB_' + Change(Right(Timer(), 4), '.', '');

    // Save
    Mybtnicon1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAN1wAADdcBQiibeAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAA8dSURBVHic7d1vjFzVecfx3xZUkFy1oiVSUhAiUqRUEFKaBFJjsfY6xRvhbUP8lxUVYAurFIkK1nbKupQXsHggCymFNrFCWOPdWdbr8VppaxpmrdRmqb0KNpQ4DS2igigqiRRSUK2iEoR5+mKu679M7pmdM+fec74faV5Y2rnn0b3PnPn5zr33dJmZAKTpV0IXACAcJgAgYUwAQMKYAICEMQEACWMCABLGBAAkjAkASBgTAJAwJgAgYWe3+sbZ2dkrJS2XdIWkz0r69XYVBSTqiKQXJB2UNDV//vznfQ/Y5XovwOzs7NmS7pG0SdJZPooCoKOSNku6d/78+e/7GsRpAjhw4MDZkv5J0tW+CgJwkuckLb7qqqu8TAKu5wC+Ij78QCddrcbnzovcCWD//v2flPR9Sef4KgbAGf1C0u8uWLDglXZv2CUB/LH48AMhnKPG56/tcv8KYGa/56MAALlc7mOjLgnASwEAcvHyBeySAC7wUQCAXLx8/rgSEEiYSwLwWcdcvCPp65JmJO3v7u5+O3A9KJmZmZnzJC2Q1C3pNknzwlbUObl/BpyZmSniDPC6pC91d3f/IHQhiMPMzMxlkv5O0sdD13Kq7u7urnZvs8wJ4EeSrli4cOF/hS4E8eju7v7Bs88+e4WkQ5IuDlyOd2U+BzDIhx8+ZH01GLqOTihrAnhe0mToIhAvM5uUdKekK0PX4lPLtwP/Ej9X427B70p6fdGiRafNHvv27etS4/9ZX1DjrqfzHbY/caZtAu2yaNEi27dv34SYABocEsCbki7v6en5SbM/yj7Ar0l6be/evU9LeknSR3KO8cO8xQCtMrPo+8zHOYDBX/bhP1X29y7/5/pXt5KAlkTfZ7knADPL+6q3UoiZ1fOO0dPT89NWxgBc9PT0/NSh772/fGh7Ali8ePF/dvJ9AFpXqF8BCvZLAxB9T5b5OgAAc0QCAJqIvSdJAEDCSABAE7H3pK8rAQtpz549X5D0R2osZHK5ErrtM0HvqHFx2QuS/v6aa675buB6CqntCWB6evrCJUuWOP+kNz09faHrexy2fZ6kRyTd6GsMFM48Ne7xXyDpz6anp0cl3bFkyRKn50XEngB8nAPo7fD7mpqenv5NNb4J+PCn7UZJL2X9gIyPcwCVer3+nd7e3tyXA9fr9d+WVMn79y7MbIuki3xsG6VzkaQtklblfUPsCcDHOYCPSPp+vV7//7sBe3t7T9uL9Xp9LncD5lKv16+TtLLd20WprazX69f19vZ+O3QhReDrV4DzJX3z2D+eeeYZl/e2jZl9McjAKLovSso1AcSeAGK/DuBzoQtAIdEXmUJdB9BuZvbJ0DWgkHL3RRn73kXsCaDtiykiCvRFJvYEcEiNi36AEx3K+4dl7HsXsSeAMGcfUXT0RSbqBHDttdd+++mnn66JnwJxXG3p0qW5fwIsY9+7iD0BSNKtkn4cuggUwo/V6Adkok4AkrR06dK3du/efbm4FyB1o5Lu6Ovr416AEyRxN2B20G/avXv3qLgbMBUn3Q3Y19fH3YBnEH0COFHWBDQCcouh75tJ4RwAgA+RVAIAXMXe9yQAIGEkAKCJ2PueBAAkjAQANBF735MAgISRAIAmYu97EgCQMBIA0ETsfU8CABJGAgCaiL3vSQBAwkgAQBOx9330zwPYuXNnl6Q7JN2gxjMAzgpbEQI4qsazAcYlPbJixYq4P9UOok8AZjYhaXXoOhDUWWo8BOazkj4v6fq8byxr3+cV9TmAWq22XHz4cbLVWV9AkScAM+MBkDiTWyVN5fnDMva9i6gTgKRPhy4AhURfZGJPAKFLQMnF3kOxJ4DDoQtAIdEXmdgTwBZJfxC6DhTOlrx/WMa+dxF1Arj++uunJE2GrgOFMpn1BRR5ApAkM+uX9D1xIVDKTroQyOWNZe37vKK/ErC/v98k/VX2AnCC6BMAMBex933U5wAANEcCAJqIve9JAEDCSABAE7H3PQkASBgJAGgi9r4nAQAJIwEATcTe9yQAIGEkAKCJ2PueBAAkjAQANBF735MAgIRFnwC2bt3KwiA46XkAa9asyd3MZe37vKJ/HoAkFgZBywuDxC7qBDAyMsLCIDjV6pGRkdratWtZF0DxnwNgYRCcCX2RiToBmBkLQOBMcvdFGfveRewJAEATsSeAw2JdAJwu98IgZex7F7EngNwLQCAp9EUm6gRwyy23TD3++OOT4pcAHDe5bt263AuDlLHvXcSeACSpX9KApBfUuCAE6TmqxvEfUKMfkIk6AUjSunXrWBgELStr3+eVQgIA8CGiTwDAXMTe9yQAIGEkAKCJ2PueBAAkjAQANBF735MAgISRAIAmYu97EgCQMBIA0ETsfU8CABJGAgCaiL3vSQBAwkgAQBOx93306wI89thjLAyCkxYGuf322+P+VDuIPgGYGQuDoOWFQcra93lFfQ7g0UcfZWEQnGp11hdQ5AnAzFgAAmdyqyRWBlLkCUAOC0AgKfRFJvYEELoElFzsPRR7Asi9AASSQl9kYk8AW8TKQDhd7oVBytj3LqJOAHfeeeeUpMnQdaBQJrO+gCJPAJJkZv2SvicuBErZSRcCubyxrH2fV/RXAg4MDLAwCPAhok8AwFzE3vdMAEATsfd91CcBATRHAgCaiL3vSQBAwkgAQBOx9z0JAEgYCQBoIva+JwEACSMBAE3E3vckACBhuScAMyvMq1KpfMznTgEkqVKpfCx0r5/48qGsCeBToQtAEqLvs7KeA7hU0p7QRSBuZnZp6Bp8K2sC6N+8eXNX6CIQr6y/+kPX4VtZE8CVajzvf3voQhAnM1utRp9FrawJQJIq999//2+FLgLxyfqqErqOTijlrwDZ62IzOzg0NHSZzx2EtAwNDV1mZgez/grd495/BSj7I8E+Lml2aGjo65JmJO2/++673w5cE0pmaGjoPEkLJHVLuk3SvLAVdU5ZzwGcaJ6kjdlL9913X9hqgBIp8zkAAHMUQwIA0CISAJAwEgCQMBIAkDASAJAwEgCQMBIAkDASAJAwEgCQMBIAkDASAJAwEgCQMBIAkDASAJAwEgCQMBIAkDASAJAwEgCQMBLAmb0oaUrSrKSDlUrlfwLXg8zg4OCvSbpC0nxJyyV9JmxF5Vb2pwK32weSHpR0T6VSeT90MThdNhnvlbR3cHDwq5LulfTnIs22hARw3AeS/vCBBx74x9CFIJ9skt501113/bOkfxCTgDN22HHf4MNfTtlx+0boOsqIBNDwhqRNoYtA68xsk6TrJF0QupYyIQE0bH3wwQePhC4CrcuO39bQdZQNCaDhpdAFYO7MjOPoiATQQOPEgePoiATQ8FroAjB3ZsZxdMR1AJKGh4dbnt02btx4gRory/6OWk9UH0j6d0n7h4eH32i1ltQNDw/bxo0bQ5dRKiSAFm3YsOHTkiYkXdLm7b4sqf+hhx463M7tpoI+dcM5gBZs2LBhhaQDavOHP3OJpAPZGIBXJABH69ev/4ykHZK6PA4zT9KO9evXf+7hhx9+0eM40aFP3ZAA3H1Nfj/8x3RlYwHe5J4AzCzaV14DAwN9Zrawg7UtHBgY6GvpyCYqdC8VoU9dkADcXJPImEgE5wAcmNmlAYYNMWZp0aduSABumAAQFRKAAzP7aIBhQ4xZWvSpGxIAkDASgAP2QfFxjNyQAICEkQAcsA+Kj2PkhgQAJIwE4IB9UHwcIzckACBhJAAH7IPi4xi5IQEACSMBOGAfFB/HyA0JAEgYCcAB+6D4OEZuSABAwkgADtgHxccxckMCABJGAnDAPig+jpEbEgCQMBKAA/ZB8XGM3JAAgISRABywD4qPY+SGBAAkjATggH1QfBwjNy4J4G1vVQAIwiUBvCHpPI+1FB7fLsXHMXLjkgB+4q0KAEG4JIBDkpZ4rKXw+HYpPo6RG5cE8KSvIgCEkTsBPPHEE6+uXbv2OUlXe6yn0Ph2KT6OkRvX6wD+1ksVAILInQAkaWRkZHLNmjVrlei5AL5dio9j5KaVKwH/RNI77S4EQOc5JQBJ2rp1649uvvnmTZL+2kM9hca3S/FxjNy0ei/A30ja18Y6yuK9RMZEIpwTgCQ9+eSTH9x0002rJB2SdFF7SyouM3tF0mUdHvaVDo9XaiQANy3fDbht27Y3JX1Z0v+2r5zC+2EiYyIRc7odeNu2bS+a2TozU5lfeZnZ4QD1HZ7LMUpN6F4qQp+6mPPzAEZHR8clfa0NtZTBE5KOdHC8I9mYgBdteSCImX3FzPaEniF9z6yjo6M/M7NKB2urjI6O/qwdxygVoXupCH3qoi0TwNjY2FFJKyW93I7tFdwjkg52YJyD2ViAN217JNjY2Nh/m1mfmb0Zeqb0ObOOjY29a2bdZjbmsaYxM+seGxt7t13HJxWhe6kofZpXW58JWK1WX5f0JUlRN261Wn23Wq3eKGmVpG9J+jdJczlClm3jW5JWVavVG6vVatT7EMXQ0nUAzVSr1dkbbrjhZkkTkrravf0iqVarNUm10HXgOF/flLHy8lTg8fHxSUn3+Ng2gPbx9ljw8fHxITMbDf3/plD/t0IYoXupbH3qe12AdZJmPI8BoEVeJ4CnnnrqPTP7spm9Gnr2JAGkIXQvla1Pva8MNDEx8ZakpZLe8j0WADcdWRpsYmLiVTNbZmbvhZ5FSQBxC91LZevTjq0NuH379mfVOCcAoCA6ujjo9u3bR83s/tAzKQkgXqF7qWx9GmJ14L+UNBlgXACn6ArxDbhq1apzJe2V9PsdHxwoqR07drT9ytoQCUA7dux4V417Bl4PMT6AhiAJ4JiVK1deIumApN8IVgRQDm/UarUL273RIAngmFqt9rIazxF4P2QdQAn8i4+Ntv1uQFe1Wm3PihUrVksal3Ru6HqAgnrJx0aDJoBjdu7cuUvSYkk/D10LUEC/kFT1seGg5wBOtXz58k9I+o6kT4SuBSiQv5iamtrsY8OFSADHTE1N/Yek+ZK+qbTWGwA+zHOSvupr44VKACdatmzZ+ZL+VNJtkj4auByg045K2izp3l27dnk7SV7YCeCYZcuWnSPp85I+dcLrYjVOGJ4r6RxJvxqqPqCNjkh6QY0nQk/t2rXred8DFn4CAOBPoc4BAOgsJgAgYUwAQMKYAICEMQEACWMCABLGBAAkjAkASBgTAJCw/wOS0gLRE6r/QwAAAABJRU5ErkJggg==';
    Mybtnonclick1 = 'assignBtn("Btn", "Save");';
    Btnsave = await JSB_MDL_DEVXQUERYBUILDERBTN(Querybuilderid, Mybtnonclick1, Mybtnicon1, true, true, 'left', function (_Querybuilderid, _Mybtnonclick1, _Mybtnicon1, _P4, _P5, _P6) { Querybuilderid = _Querybuilderid; Mybtnonclick1 = _Mybtnonclick1; Mybtnicon1 = _Mybtnicon1 });
    Hideothersave = '$(".dxqb-image-save").hide();';
    Btnsave += CStr(Hideothersave);
    Btnsave = '';

    // Quit
    Mybtnicon2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAAAAABWESUoAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfjCRsPOSWY0G+jAAACjElEQVQ4y11U7VITMRTt4yq/cJTN6l94AHDY7BYcH0ABK/oA0m7bHz6EQ6HttsCMg3aTe29y401aPsam2ZM7zd7Pc9oJgZ8+/v9zCJ3gXWD0gYgZXHDIXiwBRhd/67Anh4gOwMWN4AjRAxBFy3FHfK2AsXXcWqaVYwPBRbDsWwpywSPFBYiQFm1WejB3Alnv5Ko14goDtOxaAeO9QSaIHpy1BBbJWjkBmmiBbEJL7Dscrj7oqiyqqhA4LKuiENCVPqzK44nkEHy99V6XR7roVkXZ1brb1VW31N1K72/VXsrkOpuJyxjHCJh1LENkZnmdQoyzecAVSe2BWueNlTIpwjIbxTLDUDWrk0Kf/v05Rrr4cf91cnlUHh1+WjVZnXLo58vp693is/2ummX+5TbvTz7uvtg//T3LB7GTYaSaGzVwRNdvz87eNU0+cthXU/BNNgwxh1HW3Kk+s7W9V9u9MFNjD3U+BclhnFo9yBezbE9/XvnJjrqGZd53oVZLb+d57eOw+moxz/aKk5avMnWNC4kcBmrhQS5wyiFb3KkLljH2tmOIfBxMCrFYh4hl3uQDIprGJOcxSTdQDblGDR/KnL2RHOy5am7z3q26cFzv3HgzfyqzPSv0yZ9hjdgf3Z9fEv36do9+7WHT6pakTE6tBgGx4KHVXOdzi5EUQoU4pQ0QzFKZgeuXB3HA5WbclYy7KmXrg61h7EMiTCFM0UX5SJg1HF+lTkZ2AQhfrTgHtBaTJawD8om0wnYSmrKLpDXMQmFovW+FtCgeRCgQSb8BOSQhiYKQKM1CyPMonDYpRjyyMQ/CEX3Jmx7sGkR6dgMgmoqtFvKDiFdUuxavqJafife5/EP6rv8DvI87hH/2yn7V6u5rEwAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOS0wOS0yN1QxNTo1NzozNy0wNDowMCIsQBkAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTktMDktMjdUMTU6NTc6MzctMDQ6MDBTcfilAAAAAElFTkSuQmCC';
    // myBtnICon2 = `ui-icon-closethick`
    Mybtnonclick2 = 'if (confirm("Are you sure you want to quit?")) { assignBtn("Btn", "Quit"); doJsbSubmit(false); } ';
    Btnquit = await JSB_MDL_DEVXQUERYBUILDERBTN(Querybuilderid, Mybtnonclick2, Mybtnicon2, false, false, 'right', function (_Querybuilderid, _Mybtnonclick2, _Mybtnicon2, _P4, _P5, _P6) { Querybuilderid = _Querybuilderid; Mybtnonclick2 = _Mybtnonclick2; Mybtnicon2 = _Mybtnicon2 });

    // Delete
    Mybtnicon3 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAPFBMVEX///+SkpKVlZXy8vL8/PykpKS+vr6enp6wsLDNzc2YmJj5+fnS0tK5ubmnp6fR0dHe3t7r6+vj4+PY2NgBRovlAAABSElEQVR4nO3bzW6DMBBGUdtgMIQ/J+//rvVQVe3CJIoHV6W63y6yxnMYQNkYYwghhJCCxM47m4nzXfyF9u2ca/6Vrq3ef3nW39pQW/D0+vcZ1O0fpYffbrm12+Zlte5z0En/bPud4KuPQDpsx8ub+KoC5P07HEAagbyNVQFykzXrAAAAuA7g1V9OSQBcC/ATUlR4Uj0AAAD+HkD7GwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMA1AYrz8q3VHnTu0w5Nebmche9VgJB2mMrL11QeVIAh7bCUl8tZ+EEFaKxmBDIAzR2UyBcV7l5We5ez+LOuv2lkE1c0g0lKR+UAjHnIGO0yxbfexjau+/ce9qHt//kcFmfV908zGEvbjydcv6R5+W1PPrP6/n8ThtBnP+86iuvDcF57Qsh/zgezKwxHulPuywAAAABJRU5ErkJggg==';
    Mybtnonclick3 = 'if (confirm("Are you sure you want to delete ' + CStr(Sqlid) + '?")) { assignBtn("Btn", "Delete"); doJsbSubmit(false); } ';
    Btndelete = await JSB_MDL_DEVXQUERYBUILDERBTN(Querybuilderid, Mybtnonclick3, Mybtnicon3, false, false, 'left', function (_Querybuilderid, _Mybtnonclick3, _Mybtnicon3, _P4, _P5, _P6) { Querybuilderid = _Querybuilderid; Mybtnonclick3 = _Mybtnonclick3; Mybtnicon3 = _Mybtnicon3 });
    Hideotherdelete = '$(".dxqb-toolbar-item-container\>div[title=\'Delete\']").hide();';
    Btndelete += CStr(Hideotherdelete);

    // Make Report
    Mybtnicon4 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHEAAABxCAIAAABtHNuHAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH4wkbDy003M6YBAAAHCZJREFUeNrdfXuMrVd131pr7+9xHnPncX3H92Jf4wfGwY/awQFiHApplDhJK1VQteIvt5FsyQKaCoFoQ2NBMapcVKLemECrFCyFlkRVWtKqUkKbtsFBvG3jllKbCzYX29x7Z+5jZu6cc77v23ut1T/2Od98c+Y8Z87M3LB07+jMme+1f996r7X3RlWFWRBrQUoguScSwJgJDAmxgQiAZnKLvyqEu8BUVRGx70tm9gQeOYHYCgBBoc6wkol2HvzTTXYX5wzESFEijujCK8Xl/1EA4cI98fJdYDNQA2qg7wwF+OnFeTeYDiShCE//fuupfxEn5GyNist63S/aez9ilm4GAAAPahV7SP70Agq7ln0RUdVwrqoSUbHx6pX/9Z6a6dR+4QlTuwVf+fP15z5eYG3+gSdd4/pEM9UaKBOgXjWAiggAYI9U1VpbjujgMFXVzc3Nzc3NqlZFRNZ1WpO4trQ5B9Zrni5Erz5/zdfetX79L/Od/zwBaGMRA6AhEX+VWK0w9jAKRGTm+fn5ZrO5x8tOMbbAnhsbG+vr61mWhZdc/inmozJ/1DXjNI+t97X1V3Du1kvLb+XzXwf1KEjgFQOgM1M4e4Gy/Oy9z/Pcew8AFy5cWFtb2+P1pxheEPZ2u42IjUbDGGOMQUQRQUQFG0MG0nZxgnFK7caGvXw0O290fnVurgYtq6lIDam4Gpg08KaIiIj3PgCKiFEUdTqder0exzEM8XBmg2l4sUTUarWKorDWxrEVwMyB4bUrksbiKKo7tQYBcpdzO82X9Pt/0Fr5ptz2sVq+ds5TSo7AKRLIbDziyeEL2p+IjDFFUQTtCQDGGGutMSYgi4jhs3MuYLo7L3BqMSSCKIk7nRwIvWs7IYdx4jP/wr931y7Qwt+1dNZmzfzKl48+/dH11zwYv/6drkBiMeAdiRyGhQpodjodZl5aWrpy5QoREREzM7O1NvwKPc7d4+12galFBWbmghMLhcY1WyQ/+Qv92oeTe38jvu7vtWCpeeVi9s0Przdvqd/7Xp9eg9JeqCecI9nD0aSImKZplmVPPPHEww8/fN11121sbARMAydqj4L132NsOfUgRXyeq7WW2eW5SxrzvPnDjWc+nr7m1trPfLDTaKdrPnvm43zhx/YdX3DHbon9RZPUAHKtpbExIAqEeFDSH9AJ3Fev119++eXHHnvs0UcfPXbsWJ7nxhgi8t4754JymEnINzWmCkwEea6oMdk0J+avPW6ylej+3/HLJ2Muoh/8x87/+w/FPQ8d/Zm/KbRhk3kVi4gRKCqAAQBBNLPKM0xCIhJEu9lsnj59+tSpU+9///uXl5dbrRYAeO+DsZ1VDD01pt57BAOkKIhRM3vmiYUXvpj/0qnipnfM8ZXNs2c2v/Z+Wbx9+c4POzpPRZK7GDDrs/Wo/iD1KiIGTIloYWHh9OnTjz/++Ac/+MHjx49vbm7GcRxEfla3m17BacyM1miG3r/6l3Nff2zzlr81d9uD6v1l7sR/8aHMbS7c/7FOI7WZRjbOXNsQADAiSmDVA6dSaSZJYq1dXFw8e/bsJz7xiQ996EPXXnttlmUB04D73sGd2lW0JiGLDJi3NvVbH2mnS/r2fwYxxRy7b3xq/aUvmZ97zJ68nzGz6NrcslEwqoSIFujgyRhTBtPW2lqtVqvVFhcXV1ZWPvnJT549ezaKImbuA3Qvlmo8pgqQKyMLS2YoNawdvqJi5Du/qytPL/78B44svRGtXjr3VPz0v6Ib35Xc/W7lVqpWEAgQpDSqKlsG9qDJGAMAcRzHcRycpwDrpz/96YsXLzYaDedcGf7vUb2OxxQBrPqWKYhSt/LtTF8iuDU7/V/oe/8mfsPfz+96GDZXi7VXWn/26Pm4duQXf7sWxQYFABRmY0Z3Rz0uozIWEhFrbRRF1to4jo0xi4uLr7766qc+9amVlZV6vR54Oc/zPYr/KEwFFEBUlTwjxp1Xv/Xi/zyF9ibbfu7Stz9G9bvxjb9lQTXmtW+cwvPPXnPfv8xOXE+MVhuHBWVJvdcpVYittUmSpGkax3GaplEUHTt27MKFC6dOnVpdXY3j2DkHe1apNPJvGN6zRrbu6Mf/+dHiwndsOle89JXGpZXivt+GxjwRXnnhT1rf+H188yMLd7w77ag1KGR6gxFFOKx/ffiqqrVxHMdRFCVJEj4QUbPZXFtb+9znPre6ulqr1YiozGHOHtPuEahI8YWv/utLz39p7s53e8nBLGVe1P2oVjtaXPj+2n//SO3Efcv3/xOPLaPgmdF3SBDQKzlBL+gF5eD/MQmTKHpVRQVLkcU4pH6CEgjqNYqi+fn58+fPP/nkkxcvXjTG5Hm+F0xH+FICQKqMaDbOP/vSn/xW855fv+Ht7zvzcmZuubNxywPtLz124cVvtlefTtbd4rv+MTXnMS+ACADYKCIxRCAYa9672kETolFlVfXqHakaFzXYdiz0Eivlz5A5PX/+/Gc/+9lHHnnkxIkT5ffBuM0KU4JejePlr37ByJXX/9rjHVpq6nfX66+p/eoT+u1/607/sV++aemB37PX/7wUHUJjABWBVQ26CNGaqCNpebWDJeneVMkQRAaLHFEbUZQBQMieBDH33hORiFxzzTWrq6uf//znP/CBDxw9ejR8v5t3OZrDg9H83u/9nQLa97z3T1sbqy9fOlfLltvRWqxpEiULST1PusIFvToEQaTK6C9z5xLi4WagFQCAWMl0Ns0f/eEXL7scehmA4LcGfFXVOYeI7Xb7jjvueOSRR+bm5sqgdioaO2ABMGhrcvGsBwBR4xvetBIWp5mtpy4uULwxaTczrSoixpq1H/y7+v/5A60dTY6+doah9O4IJdeoU2weRwuKUb2IC6UcrqBBo4QWQ47KGCOgdYDnnnvuM5/5zHve855arVYURRRFgbcmHMVoPhVVRTQ/fuG/Pf87D/y1f/ifmq975+qLp32iqAQAjSSNm3WQkDELgsZkG7zyHPzXX9flGxtvedCCAz0EZQqK0AuERWLCROX8F56i588upHhRBDSvAxaCmQiIeO+DevWFZxLY2Gy94Q23ve9972s0GmVya0LdOhzTsgQvIAj/9w/fu/qVJ2/8jU/D0b/u2BOoKtYa9UatHiLlrv8h3tQW5YU/li8/rPc9WPvJd9sv/xAostg9AFDhQNMnykoNKto+grn8+dbd3770axsmZ1qjIjeaejAiXkSYNSiEMle9ubl5++23P/TQQ0eOHAkh1oR6wHz0ox8d8jQSQFVQgXz5zl/Vi+d+8q0v1m5/JxIhqIjGUVStMagqIoBJYOMc/+hPXaul5573URPQM4qSMoqgHqxHxYqYiffxRpThIqy18OImz3u4FjVBJEULYACMAgh7CAWVOALVer2+urp66dKl2267LY7jycV/jN0PeBEYUHzdg7/bePGFyzlHRCKAulWuKYu6GKyUSpa3o/WXMppH8T0TfLBlqK48EIBnSdEl7JXA3RX/79eaVzt8XVarGd20ogAIbrN27HXx/f/UqGGjRtgYo0DGRIiKFZrk1kMx7Ym+ABCIQVRA2zh249rZV7wwKigMyNyIiAEA9U6BlFAdeGEwh+KfChKpIABCoQIFqoCZg3wRz4pZY0CwRYQEEiFdoLllvv6GSJENkuYqW6ozNFIEC7wnPu2d2q18EVlEQORQ9VSAIAo7BwIABXplryKqACoAooCzzfuOJSUkYem7o7osapAlEGeYPVNLTQSk3sTekPeo6AWMsMK2HoAuJnvk0yoZYwPjqpbvikKaecexJADEKBCKZQwsgiiodMCcKsDV3xBIAUGhEIeZoAcfqVVE51RQi+AkICKAAikBld7htI7ghA5590Uxl88pqhrqjiEICQ+kQYGhgCB7dOpiVAUiOWiD30ek3WEo5AiKDIoMQkZjVRSOigJqhpSdUYtqFbXPWswc0+0AV5Lh1e8FFJQAQJEUjCgAExMrKEJvTIdNjEgCAARKFPwQZVZnumV9geBgIqKCGgSe+qGnr5sOARS6plYEQD0KgxKpimcBoCqTHi7DAmiQNUE2wVEEEkYIvTYKDCTAAdLdtczMEtNABlHZe5fHcapsEFgRuSd9EJj1KmBYElAiUFJEZvXiEFEQFMQoyB7M6aT9UmVDYZlWKEs91QMAjbpOcvIOXrjHn/t60UTwapQC/15tpJAY7xk0t/Hine8ylKrmiCJUypHsov94N3w6Ig2OiOyLtHnTrX/71IXn/ww6a2id0cNv5NtJAiTUjtAXndryDW9q3P4redFG3BbR666U1IwxBQBEzGWts3zrwsmfs1lbTcR4FWFKCoIAAATi2YqojYvcUDvL7LbARABodz71bux+cNyG/VVVDRxJfatw59oENW/wauJTqXyIwIChvFPUjHdiAKMdR+2GRmE6zN0tvyyzOL1vCAAQRWQTCYymRi3v8PUnefk7b42lYUMBANjze2LQCEVRGZJcUkJf+eOeLj4K08FzdnrpkkEaoAef9i6LBVYesXuWCo57aEQA4OrYgnODWkIrALvsY66MnEA0AtfLtsyGpr5QCWV1gsHI65e3kN4pE1bNtj1bWZ4BoGA5psoVjRrLtoecAU2qT8t+V9hlkbar8kVkq/o2kkIEMehIQR1vKsdSmUeHWYchE2Fa1YDlh74e7XFj6+lDQjBp4ZyFocqaUFW8JXC67bLlyGMUk8aZiEUL6qoTnMYPmEmRPKhw5rxHm3T9+9mFIVPw6c4PY2OqvleCqNamZ1559ctP/SV7N1hsFUHciePLv/Q33qHdbqdu+rUU+baD7//wBx32RqxKMZX4RwJOAaP41huPN2sRe9mL9tgTplUcqwmbiRUrAID3gsjnzp179tlnrI0GHkNEzhVnzpx529veVquFBqYgECF4YzTUdvrN577Xdi4GO22pmAw6ZvVyZO6+uRteg+pmPlFzNz5/mViEydRZlZ1tFAFAkqRxnA48vfBiIkobzcJxmipsiXw3b0RAyhJbY9MEnLB3U/Xhe8njmvUdiNSRisfZz32dVJ9W52eUAFUT4JOos66uVPXeW+sHHm+MUdagrLuvrTdoRYDQbG3oSLPZbretsRqbYMiCV6A4xgIS2MK7ZK6eNI96tLAtc32AmO6kKqAwcVEhpLG77wB0oF0wREKgAIim3+0P2TiGI/X4gbfdFyaOKCEQVpNyo98uigIAkqZJXZyf3LjtI6Z9dmkqBT+JOykiiCaUF4cOVYo0xiSKjSEuPCKA6StyDL0LIimhiASHITSDzhDQPWHaB9asngwRVQfL4xZqFHfygohqUU2N88wUQOz1bMFwRU/GOBUKbdPGDLvX6PHOGNNgoIL3Xs4krDoAY08P3fUDha68CDMPTAv1fu1OtM/zXBWJLCJ7l0OI0HRUzCreIakoChIaw8WkvtTkEjn7PP/oxwqjZWYxA4w1EYVaC1HgJKmeu5UP02CKwvfkXYeIavUmKlXjvcGYAgs4SxF7X/GRaYYdCAeKKRFZa0PPPCKG3kTYngphQRHvfRzasMpKbQkWIlbHj8hEpCZeudwqWp1u1mo4eQFVTWNzpJGayGLoUhfGkdnLfcd01xNdwzz1Y8eOnThxQthjzz5scRaqgnHO3XTjyShKCu+oz/TvGDkCGGNy0T//8lcurF82BsOU1uEjjhHRuOwd97/l5htOsvMICDMNpSbFtJwOAztYdXJww/T5W2587UP/4MEtRx23poYgIntV1VqaEpH3xSh0AACAmZWENYnStF400JIOAajb8qjGIJFiZBMi4m4j10RpnRljOuwpJ7NO3XJ0YAcV32wkZRS/45rlChBbrd+j80aIJrZE4jvtlh03nZ3IFOwNO2QBCWjibOcUH0xjOKlq6ESAYIi8MLud1llVyRrE7uy/rfhtOKDGWhFQn7/5Z+9i2dJMQ9BHr2KREHTxyHzQ7DCLOaYHj2lQHagq0PPGhvbHqqhodf7daGIhUEZ1J4/NKxkWGj1NmJGNIlnjhYuiiIwdO6PhcDAdsd4FohHvCIQAhUiBtBuUDsOrWwVQUOn1BI0mVSCTtAuvKqPXr1IAY7wqiJAXMiYSGePz76KUMANMRwep3hfWxpbQORdFUdcfmiavPkGQFkYRj3lOBET0BbD4KIpAPOn43p1D4NP+PpQdf0VUL+7yRuFR41ZWtTwzArQ8VCYppjoGVUyMazQsQAQ4y8A60Gxkf4R02IhePHP2q996zqR1Ep1KjKYri47FVBUAXGRUvfHZ2+970/XHTxSFpxmnUGbkS8EQhlJVGyUdX7RcnqZ1FZkkZ7GHYsb4ZCiBsZS4op11hFlBWMfVcaddHWlmdn94vgp95kmUOx1rJpP6/WxRF5c51Ugx6q4eNvsemX33pbyTG68/acmiOcwlEkoSASIwpEtLC5UOmlnSvmPqcr80v7B4ZM6YbpM/AIDSsGTH3mR/PKGKqAdERXL5dDXXCWl/ZR8AkCB3bRGxZFi3Ap39Q200EaCoJyIkO2ENbdpb7DufhkgxzKNAwrI3eL/vO4IIIlXdP619ELFpr+CxrSsAR2aPxkYvM+T0mc8vmBmmw3ypkjF7fyVjII4t0eBbh2xAuYbezqQ19JYr6mYLxzln/Y8EoGoAhJklzILY1SSofcS02gs28MmqOdaQoj93Yf2Zp58tXE7a13GFgqACnt3x48ff+pY3VyepVwM2ETn9o1c2M2dFgHCrTWUCEhQFG0Xm5uuOpZEVpMCmwxg/LJdwQJgObJocm+NJ0/TMmTNPPfUUWQMSEoCVZiFAsnGe54vzzTfefU+jHoelXgFEkUI7HxFtZNlXn/mOx8iCAgDDUPkYPGAkFt9M7r755PWZ8wQzXvBu95iWQj155qZMiaZpGsVDkmxoY2vTON2emunNsFIIINpaIl6jyAiD2d4zMZoiBOcYyQRewH3YKeBAFysJFdNh5aweiOB9DpgS9euTslJQp6hGFgwSs0FSUZ2mopSksair1WqjE0CHg2kYc1nxH5Fd79OGIwpZqmqMhdAJ0G0921bYYOYktr/yC2/t5AWBKoVug0lxYVAFNIbmm6n3vrvuw9WTl+orRg174WVdvrpTwiQXD+uxhPtUrywijbqda0SBO4MOmviyqIoInqUr/TNEcwaYVmkEm2wJ7wQO/7BcDGx317ywMiBicHun8DGl2ysYVs6bKZhdOmh9ClMKGvaMiKKg0BZX9VpSRAR7CxhMcuXuM4T/hLuoO4ylmcn+8CSj9Fqcu3Y8SRJEVDADxa7bJUnkNVSkAXudpQJd8KrYCZIBIWEwQMaacQUsEcIodiqKHlzPuYah/fzluCZfv2vfcyjV2WKqHDbCKIoCzeBbk7Us3jsXIoLRgSwAICohGaSNdqtdtEoEhsk1MbCyJPb4wpEy5A+9K1OOa/8xHWv3EVEVmHlhYeHIwhEdwtdIyIWcWD4WWWDm8QvPM5DBvNBvPPfd1Y02oRnhwquqUQEQBv/We+49eWLZe0FUPZT5UWNp7PsMIZBz7rbbbvtHv/mb4vzAwxjUItRTaxHamQ9rFoy4LIJ4L2psq1AvYgxq6JcaEgUooE0b2eZlUSCyANnMTf/M4v1J+uJEABF9njXSBNNo2PGI6FzeKRwQIZKyjOiaEvHWxoiURno5zyhJRyg+VWUDXGwaL5ZCFmb27tRebRRME4eEw9gXbZePPJAQFbFn2QhH9IciGu+9sfSzd77+pisFmWhMporQF0WN7DULiy7fl02CZiD7U3pI3UmSI642KMoaCpMl471HgOWjy8tHBUFwpP9PGLODiNA7l3vfq5kO1TCHaaMmub2qAimMdnemmXAFAJFibKlwRd7xGCEYQBklNAY9sxZEXpiISBU1tFcedl9fyQuhj3kkmoQKhc+jKLIGSXUGXd4V0FQYGCwBJbZXUBh2Wpj4b5RADUSRBc+qk67PsY/9/N2RbI/xR6hUAqOgeSGZz3pNk0iiMiPDUL3vJHIaCTtlrJkjcY3Z9coNh9rPP4y0sgpqOVoRIQNnXvnJ977/A0/AaFXKWTeHU+azII4LMXL/3fdee2zRF2FywShADy7PX8VuYIW5+ytpK+usXmml8wvsClC/92U39kKWSI1pd1p54Qj2pYg7m17JgS1T3V/Rk0XvfafTAXakCMBhRcJDIbYGGCAHVRRFHde5dkB2v0/Mq2W+nU/jC75+eflNd4lTawwSoBzeKmiIqChefR3NsYWm8zlsZbXGj3qWa3UOeLIhZeedfMqOF5sLS3ceFUUFHtvXt98UNouz6H3hOkVubKyqk9ioyRl2ljZqIJ+qsevZFRA2RAx4mMoUBQCMRsBSWBWVsPMmAIyIKWbf29PH8EHkwzflqn1h66uh+dOQ7zUkAIYM4qHCCkCoYoDIhOXQxk4Y2JnQGKsExmBaWcoEAaDRaMzPz6+trZUr1SNilmXW2mG3QQUE7M58EFWYhc+/B+Jp9jCrViSrXw48eIvbJrmu9vZeS9P05ptvTtNUVZm50+mU/WWwfQpatQTQ9+tVQgOftqxC7uKBKzXzySaIl8ARUafTWVlZ6XQ6Ybc7Y0zYj2WaHu1ZzkXcBZpjeQ0qMnrttdc2m83JaydDMd3WctOz6eXqMkH2NzY2VlZWoKdb974r8FVCZbtCGPKJEyfm5ubKxbPLcs6o9qFhmO58M6Ua1d40/LE56cPt4N07GWOiKILKxhzbVhIYREMxrS7GC5XNgUqGhcp8fO/9sMmzJaB/hcCtjjoYjzDA6saS1QacvtOHjjMg6L1n5nKf+sCYYTf1sNFKURQz38d21zRtjmoSMsakaRr65oLSK6kEtA/ZAcwVUPPeZ1mW57lzLuyyHnDM85yZvffhGO99s9lcXFwcGK2OUDr7oXyHOT3V9bEmwT2wSFEURVGEU4JElpsjxnEcPoTvy63muxDvLKCHy7Xb7cuXL7darXa7vbm5GXAMP0s/AxHDbqDhHfb1RQWUR07vHXD3vVD1FQ6L6/r6ratacifcJWOGnuywg2fYzTNQrVar1+thy+TyChZ2mJdwuQDr+vr6xsZGnuel7EdRVOrW8H5Utd1u9/Hp2PFXo4aZAAo9Cdvil4rtHmhVhvEsVsj77gZIRJTnebvdLmEN28wSUZibXJ5u+56p6uGXIURQz1rpdOzr5yn1985nHVEW3g8VXDWJ1WfoY8OdPbB97Z59eqN6euDuclw7i8cD9CkiWmvr9frS0lLYtLooijBpIRilYLWCXARLtfMKpX7Y+dcq1qU8lpHY7ti2qi7LK1Q3gdlZ4Cl3jy/PLY8s30EJn7U27IpqrQ3b+AY9UKvVkiQp5bX7MDuVTrcKz1wURTBTAdBgkYLaDrCGfasDBZeg1KfV70ejAACljh7t943GtDsFq4fC6Eipelj5EwCCNS91aAgUA5TBUQ17TYcPAetA24RgoACWSqAcc6lDA5rlz+BvBW1bSkHpfpULpe2karwQDN1UHb99VCISxgkAfTpu5zsI4li6RAGjElzs7W4eICtfQIl4tWLU9wqHYhq+79uVHnp2oNwOMKBT8lefWdiZ1Nl5i/KtVDX4tEwKFTVX0sCCbpVPy7PKY0opDpptm4e0/Wf5nAGH8ZiOpTKOqvpVO59+BN9VZX/XqaA+TPvwGn1KNY1ZKvSqGz+QD/pezMCL/386Sbz3vJW5bwAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxOS0wOS0yN1QxNTo0NTo1Mi0wNDowMHMAacQAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTktMDktMjdUMTU6NDU6NTItMDQ6MDACXdF4AAAAAElFTkSuQmCC';
    // myBtnOnclick4 = `if (confirm("Are you sure you build a report for `:sqlID:`?")) { assignBtn("Btn", "Make Report"); doJsbSubmit(false); } `
    Mybtnonclick4 = 'assignBtn("Btn", "Make Report"); ';
    Btnmakereport = await JSB_MDL_DEVXQUERYBUILDERBTN(Querybuilderid, Mybtnonclick4, Mybtnicon4, true, true, 'left', function (_Querybuilderid, _Mybtnonclick4, _Mybtnicon4, _P4, _P5, _P6) { Querybuilderid = _Querybuilderid; Mybtnonclick4 = _Mybtnonclick4; Mybtnicon4 = _Mybtnicon4 });

    Toolbar = '';
    // ToolBar := @SubmitBtn('Btn', 'Make Report')
    // ToolBar := @SubmitBtn('Btn', 'Quit')

    Msg = '';


    while (true) {
        Print(At(-1), JSB_HTML_ROWS2('%', CStr(await JSB_MDL_DEVXSQLBUILDER(Querybuilderid, Databasename, Lastxmlquery, CStr(Btnsave) + CStr(Btnquit) + CStr(Btndelete) + CStr(Btnmakereport), _Username, Passwrd, Initialcat, function (_Querybuilderid, _Databasename, _Lastxmlquery, _P4, __Username, _Passwrd, _Initialcat) { Querybuilderid = _Querybuilderid; Databasename = _Databasename; Lastxmlquery = _Lastxmlquery; _Username = __Username; Passwrd = _Passwrd; Initialcat = _Initialcat })), '66px', CStr(Toolbar)));

        // Do not break or pause between getting the page and the flush (server.pause)
        if (CBool(Msg)) {
            B = At_Response.buffer();
            Print(JSB_HTML_SCRIPT('alert("' + CStr(Msg) + '")'));
            await At_Server.asyncPause(me);
            At_Response.buffer(B);
            Msg = '';
        } else {
            await At_Server.asyncPause(me);
        }

        Lastxmlquery = System(29).lastXmlQuery;
        Mylastsql = System(29).myLastSql;

        Cmd = formVar('Btn');
        if (Not(Cmd)) Cmd = formVar('Btns');
        if (Not(Cmd)) {
            Cmd = formVar('contextMenuCmd');
            Ctltext = formVar('contextMenuCtlText');
            Ctlid = formVar('contextMenuVal');
            Contextmenutext = formVar('contextMenuText');
        }

        if (Not(Cmd != 'Quit' && Cmd != 'Q')) break;
        if (Cmd == 'Delete') {
            if (Sqlid != '*NEW*') {
                if (await JSB_ODB_DELETEITEM(Fsql, CStr(Sqlid) + '.devX')); else Alert(CStr(activeProcess.At_Errors));
                if (await JSB_ODB_DELETEITEM(Fsql, CStr(Sqlid) + '.SQL')); else Alert(CStr(activeProcess.At_Errors));
                Print(At(-1), JSB_HTML_SCRIPT('\r\n\
                            if (window.parent.reloadDbTree) window.parent.reloadDbTree();\r\n\
                        '));
                FlushHTML();
                Print(At(-1)); FlushHTML();
            }
            At_Server.End();
        }

        if (!isEmpty(Lastxmlquery)) {
            if (Sqlid == '*NEW*') {
                Print(At(-1));

                Inputmsg = 'Name this Query';
                Newname = '';

                while (true) {
                    Newname = await JSB_BF_INPUTBOX(Inputmsg, CStr(Newname), undefined, undefined, undefined, function (_Inputmsg) { Inputmsg = _Inputmsg });
                    if (Not(!isEmpty(Newname) && Newname != Chr(27))) break;

                    Prefix = JSB_BF_NICENAME(CStr(Databasename)) + '_';

                    Sqlid = CStr(Prefix) + CStr(Newname);

                    if (await JSB_ODB_READ(Xx, Fsql, CStr(Sqlid) + '.devX', function (_Xx) { Xx = _Xx })) {
                        Inputmsg = CStr(Newname) + ' is already used. Try again.';
                        await JSB_BF_MSGBOX(CStr(Inputmsg));
                    } else {
                        if (await JSB_ODB_WRITE(CStr(Lastxmlquery), Fsql, CStr(Sqlid) + '.devX')); else Alert(CStr(activeProcess.At_Errors));
                        if (await JSB_ODB_WRITE(CStr(Mylastsql), Fsql, CStr(Sqlid) + '.SQL')); else Alert(CStr(activeProcess.At_Errors));

                        if (Cmd == 'Make Report') break;

                        // Reopen with correct tabID
                        Url = await JSB_MDL_SQLQUERYBUILDERURL(Tabid, Sqlid, Databasename, function (_Tabid, _Sqlid, _Databasename) { Tabid = _Tabid; Sqlid = _Sqlid; Databasename = _Databasename });
                        Lbl = Mid1(Sqlid, Len(Prefix) + 1);
                        Print(At(-1), JSB_HTML_SCRIPT('\r\n\
                            if (window.parent.reloadDbTree) {\r\n\
                                window.parent.reloadDbTree();\r\n\
                                window.parent.openInTab("' + CStr(Tabid) + '", ' + jsEscapeString(CStr(Sqlid)) + ', ' + jsEscapeString(CStr(Lbl)) + ', ' + jsEscapeString(CStr(Url)) + ')\r\n\
                                window.close();\r\n\
                            }\r\n\
                        '));
                        FlushHTML();
                        Print(At(-1)); FlushHTML();
                        At_Server.End();
                    }
                }
            } else {
                if (await JSB_ODB_WRITE(CStr(Lastxmlquery), Fsql, CStr(Sqlid) + '.devX')); else return Stop(activeProcess.At_Errors);
                if (await JSB_ODB_WRITE(CStr(Mylastsql), Fsql, CStr(Sqlid) + '.SQL')); else return Stop(activeProcess.At_Errors);
            }
        }

        if (Cmd == 'Make Report') {
            Print(At(-1));
            if (Sqlid == '*NEW*') {
                if (Not(await JSB_MDL_SHOWTOP1000(CStr(Tabid), CStr(Databasename), CStr(Mylastsql)))) Msg = activeProcess.At_Errors;
            } else {
                if (Not(await JSB_MDL_SHOWTOP1000(CStr(Tabid), CStr(Databasename), CStr(Mylastsql), CStr(Sqlid)))) Msg = activeProcess.At_Errors;
            }
        }
    }

    Print(At(-1));
    if (hasTclParent() || hasParentProcess()) return Stop();
    At_Server.End();
    return;
}
// </SQLQUERYBUILDER_Pgm>

// <STANDARDFORMVIEW>
async function JSB_MDL_STANDARDFORMVIEW(ByRef_Projectname, ByRef_Objectmodel, ByRef_Absolutepositioning, ByRef_Viewname, setByRefValues) {
    // local variables
    var Columns, _Html, Column, Callname, Ctllabel, Nicecolumnname;
    var Additionalattrs, Pickurl, I;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Objectmodel, ByRef_Absolutepositioning, ByRef_Viewname)
        return v
    }
    // %options aspxC-

    var Ctlhtml = '';

    Columns = await JSB_MDL_DROPGRIDCOLUMNS(ByRef_Objectmodel.columns);

    _Html = [undefined,];
    for (Column of iterateOver(Columns)) {
        if (Column.display != 'hidden') {
            if (isEmpty(Column.control)) Column.control = 'textbox';
            if (isEmpty(Column.name)) Column.name = 'no id';

            Callname = LCase(Column.control);
            if (Left(Callname, 4) != 'ctl_') Callname = 'ctl_' + CStr(Callname);
            Callname = 'jsb_ctls.' + CStr(Callname);

            Ctllabel = Column.label;
            if (Not(Ctllabel)) Ctllabel = Column.name;

            Nicecolumnname = JSB_BF_NICENAME(CStr(Column.name));

            Additionalattrs = [undefined, 'style=\'width:auto;' + CStr(Column.ctlstyle) + '\''];
            await asyncCallByName(Callname, me, 0 /*ignore if missing */, ByRef_Projectname, Nicecolumnname, Column, {}, Ctlhtml, false, Additionalattrs, ByRef_Viewname, function (_Ctlhtml) { Ctlhtml = _Ctlhtml });

            if (CBool(Column.pickfunction)) {
                if (InStr1(1, Column.pickfunction, '.page')) Pickurl = dropRight(CStr(Column.pickfunction), '.page'); else Pickurl = Column.pickfunction;
                Pickurl = Change(Pickurl, '{projectname}', urlEncode(ByRef_Projectname));
                Ctlhtml = addPick(Ctlhtml, Nicecolumnname, Pickurl, '80%', '90%', Pickurl, Column.autopostback);
            }

            I = InStr1(1, Ctlhtml, 'class=\'');
            if (Null0(I) == '0') I = InStr1(1, Ctlhtml, 'class="');
            if (CBool(I)) Ctlhtml = Left(Ctlhtml, +I + 6) + 'DragDrop ' + Mid1(Ctlhtml, +I + 7);

            Ctlhtml = '\<mdlctl id="ctl_' + CStr(Nicecolumnname) + '" class="DragDrop"\>' + Ctlhtml + '\</mdlctl\>';

            _Html[_Html.length] = Label(CStr(Column.label), Nicecolumnname) + Ctlhtml;
        }
    }
    return exit(Join(_Html, ''));
}
// </STANDARDFORMVIEW>

// <STANDARDUNLOAD>
async function JSB_MDL_STANDARDUNLOAD(Columns, Row, Restricttomodel) {
    // local variables
    var Newvaluen;

    // %options aspxC-
    // Unload current form

    if (Restricttomodel === undefined) Restricttomodel = true;

    var Columnnames = [undefined,];
    if (Not(Row)) { Row = {} }

    // Build values so I can debug after this
    var Values = {};
    var Column = undefined;
    var Cn = '';

    for (Column of iterateOver(Columns)) {
        Cn = Column.name;
        if (Cn) {
            var V = formVar(JSB_BF_NICENAME(CStr(Column.name)));
            if (CBool(Column.encrypt)) V = STX(aesEncrypt(V));
            Values[Cn] = V;
            if (LCase(Column.defaultvalue) == '{lastvalue}') At_Session.Item('LastValue:' + Cn, V);
        }
    }

    var Changed = false;
    for (Column of iterateOver(Columns)) {
        Columnnames[Columnnames.length] = Column.name;
        if (CBool(Column.canedit) && Column.display != 'hidden') {
            Cn = Column.name;
            var Newvalue = Values[Cn];
            var Oldvalue = Row[Cn];

            if (Column.control == 'json_inline' || Column.control == 'json_popup') Column.datatype = 'jsonarray';
            if (Column.control == 'datebox') Column.datatype = 'date';
            if (Column.control == 'datatimebox') Column.datatype = 'datetime';
            if (Column.control == 'timebox') Column.datatype = 'time';
            if (Column.control == 'checkbox') Column.datatype = 'boolean';

            if (Column.control == 'dropdownbox' || Column.control == 'combobox' || Column.control == 'cascadingdropdownbox') {
                if (Newvalue == 'Select Something') Newvalue = undefined;
            }

            switch (Column.datatype) {
                case 'autointeger': case 'integer':
                    Newvalue = CInt(Newvalue);
                    break;

                case 'double':
                    Newvalue = CNum(Newvalue);
                    break;

                case 'boolean':
                    if (LCase(Newvalue) == 'false' || isEmpty(Newvalue) || Newvalue == '0') Newvalue = false; else Newvalue = true;
                    break;

                case 'jsonarray':
                    Newvalue = parseJSON(Newvalue);
                    break;

                case 'date':
                    if (CBool(Newvalue)) {
                        Newvaluen = r83Date(r83Date(Newvalue));
                        if (CBool(Newvaluen)) Newvalue = Newvaluen;
                    }
                    break;

                case 'datetime':
                    if (CBool(Newvalue)) {
                        Newvaluen = DateTime(DateTime(Newvalue));
                        if (CBool(Newvaluen)) Newvalue = Newvaluen;
                    }
                    break;

                case 'time':
                    if (CBool(Newvalue)) {
                        Newvaluen = r83Time(r83Time(Newvalue));
                        if (CBool(Newvaluen)) Newvalue = Newvaluen;
                    }
            }

            if (Null0(Oldvalue) != Null0(Newvalue)) {
                Changed = true;
                Row[Cn] = Newvalue;
            }
        }
    }

    if (CBool(Restricttomodel)) {
        var Badtags = [undefined,];
        var Tagname = '';

        for (Tagname of iterateOver(Row)) {
            if (Locate(Tagname, Columnnames, 0, 0, 0, "", position => { })); else Badtags[Badtags.length] = Tagname;
        }

        if (CBool(Badtags)) {
            for (Tagname of iterateOver(Badtags)) {
                delete Row[Tagname]
            }
        }
    }

    return Changed;
}
// </STANDARDUNLOAD>

// <STATUSPRINT_Sub>
async function JSB_MDL_STATUSPRINT_Sub(ByRef_Text, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Text)
        return v
    }
    Print(JSB_HTML_SCRIPT('\r\n\
        $("#xlsStatus").append(convertPrint2Html(null, ' + jsEscapeString(CStr(ByRef_Text) + crlf) + ')); \r\n\
        $("#Excel2SQL").tabs("option", "active", 0);\r\n\
    '));
    FlushHTML();
    return exit();
}
// </STATUSPRINT_Sub>

// <SUBTREEURL>
async function JSB_MDL_SUBTREEURL(ByRef_Tabid, ByRef_Databasename, setByRefValues) {
    // local variables
    var Url;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tabid, ByRef_Databasename)
        return v
    }
    // %options aspxC-

    Url = (jsbRestCall('getDBSubTree') + '?tabID=' + urlEncode(ByRef_Tabid) + '&noCache=' + CStr(Timer()));
    if (CBool(ByRef_Databasename)) Url += '&databaseName=' + urlEncode(ByRef_Databasename);
    return exit(Url);
}
// </SUBTREEURL>

// <SUPPRESSLABELCOLUMN_Sub>
async function JSB_MDL_SUPPRESSLABELCOLUMN_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, setByRefValues) {
    // local variables
    var Dataset, Columnidx;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid)
        return v
    }
    // %options aspxC-
    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);
    Columnidx = await JSB_MDL_FINDVIEWCOLUMN(Dataset, ByRef_Columnid, function (_Dataset) { Dataset = _Dataset });
    if (Null0(Columnidx) == '0') return exit(undefined);
    Dataset.columns[Columnidx].suppresslabel = Not(Dataset.columns[Columnidx].suppresslabel);
    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edc-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </SUPPRESSLABELCOLUMN_Sub>

// <TOOLTIPCOLUMN_Sub>
async function JSB_MDL_TOOLTIPCOLUMN_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid, setByRefValues) {
    // local variables
    var Dataset, Columnidx, Tooltip, Newvalue;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Columnid)
        return v
    }
    // %options aspxC-
    if (await JSB_ODB_READJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname), function (_Dataset) { Dataset = _Dataset })); else return exit(undefined);
    Columnidx = await JSB_MDL_FINDVIEWCOLUMN(Dataset, ByRef_Columnid, function (_Dataset) { Dataset = _Dataset });
    if (Null0(Columnidx) == '0') return exit(undefined);
    Tooltip = Dataset.columns[Columnidx].tooltip;
    if (isEmpty(Tooltip)) Tooltip = Dataset.columns[Columnidx].label;
    Newvalue = Trim(await JSB_BF_INPUTBOX('Column Property ' + CStr(ByRef_Columnid), 'Tool Tip', CStr(Tooltip), '80%', 'auto'));
    if (Newvalue == Chr(27)) return exit(undefined);
    if (Null0(Newvalue) == Null0(Dataset.columns[Columnidx].label)) Newvalue = '';
    Dataset.columns[Columnidx].tooltip = Newvalue;
    if (await JSB_ODB_WRITEJSON(Dataset, await JSB_BF_FHANDLE('DICT', ByRef_Projectname), CStr(ByRef_Viewname))); else return Stop(At(-1), 'edc-', System(28), ': ', activeProcess.At_Errors);
    await JSB_MDL_REGENPAGEMODEL_Sub(ByRef_Projectname, ByRef_Pagename, false);
    return exit();
}
// </TOOLTIPCOLUMN_Sub>

// <UPDATECODE>
async function JSB_MDL_UPDATECODE(Genedsrc, Projectname, Itemid) {
    // local variables
    var Usrmodifiedsrc, Blockname, Genedblock, Priorblock, Results;

    // %options aspxC-

    var Fproject = await JSB_BF_FHANDLE(CStr(Projectname));

    Genedsrc = Change(Genedsrc, crlf, am);

    // Drop trailing spaces

    while (InStr1(1, Genedsrc, ' ' + am)) {
        Genedsrc = Change(Genedsrc, ' ' + am, am);
    }

    // drop extra lines

    while (InStr1(1, Genedsrc, am + am + am)) {
        Genedsrc = Change(Genedsrc, am + am + am, am + am);
    }

    if (await JSB_ODB_READ(Usrmodifiedsrc, await JSB_BF_FHANDLE(CStr(Projectname)), CStr(Itemid), function (_Usrmodifiedsrc) { Usrmodifiedsrc = _Usrmodifiedsrc })); else Usrmodifiedsrc = '';
    if (Null0(Usrmodifiedsrc) != Null0(Genedsrc)) {
        var Lprior = LCase(Usrmodifiedsrc);
        if (InStr1(1, Lprior, '* \<insert\>') || InStr1(1, Lprior, '*\<insert\>') || InStr1(1, Lprior, '* \<delete\>') || InStr1(1, Lprior, '*\<delete\>')) {
            var Priorblocks = JSB_BF_SPLITJSBCODE(CStr(Usrmodifiedsrc), CStr(false));
            var Genedblocks = JSB_BF_SPLITJSBCODE(Genedsrc, CStr(false));

            for (Blockname of iterateOver(Genedblocks)) {
                Genedblock = Genedblocks[Blockname];
                Priorblock = Priorblocks[Blockname];

                Genedblocks[Blockname] = await JSB_MDL_CUSTOMMERGE(Genedblock, Priorblock);
                delete Priorblocks[Blockname]
            }

            // Append any extra routines
            for (Blockname of iterateOver(Priorblocks)) {
                var Pblock = Priorblocks[Blockname];
                var Lpblock = LCase(Pblock);

                if (InStr1(1, Lpblock, '* \<insert\>') || InStr1(1, Lpblock, '*\<insert\>') || InStr1(1, Lpblock, '* \<delete\>') || InStr1(1, Lpblock, '*\<delete\>')) {
                    Genedblocks[Blockname] = Pblock;
                }
            }

            var Genedsrcary = [undefined,];
            for (Blockname of iterateOver(Genedblocks)) {
                Genedsrcary[Genedsrcary.length] = Genedblocks[Blockname];
            }

            Genedsrc = Join(Genedsrcary, am + am);

            await JSB_BF_TRASHIT(CStr(Projectname), CStr(Itemid));
        }

        if (await JSB_ODB_WRITE(Genedsrc, Fproject, CStr(Itemid))); else return Stop('Form-', System(28), ': ', activeProcess.At_Errors);

        await asyncTclExecute('Basic ' + CStr(Projectname) + ' ' + CStr(Itemid), _capturedData => Results = _capturedData)
        Results = Change(Results, am, crlf);
        if (InStr1(1, Results, '^')) {
            Results = 'Compiler error: ' + 'Basic ' + CStr(Projectname) + ' ' + CStr(Itemid) + crlf + CStr(Results) + crlf;
        }
    }

    return CStr(Results) + anchorEdit(CStr(Projectname), CStr(Itemid)) + crlf + crlf;
}
// </UPDATECODE>

// <UPDATEMENU_Sub>
async function JSB_MDL_UPDATEMENU_Sub(Projectname, Forceit) {
    // local variables
    var Oldmenu, Role, Fproject, Fs, Projectpages, Menutree, Pageid;
    var Pno, Item, Menuname, Menus, Menuitems, Submenuname, Onlyone;
    var So, To, To2;

    // %options aspxC-

    // When generating the whole website, try no to do this more than once
    if (await JSB_ODB_READ(Oldmenu, await JSB_BF_FHANDLE(CStr(Projectname)), 'Project_Menus', function (_Oldmenu) { Oldmenu = _Oldmenu })) {
        var Lastmenucompile = At_Session.Item('LastMenuCompile_' + CStr(Projectname));
        if (r83Time() - Lastmenucompile < 15) return;
    }

    var _Html = [undefined,];
    _Html[_Html.length] = 'Subroutine Project_Menus(ByRef MenuBar As JSON, ByVal edpName As String)';
    _Html[_Html.length] = '* EDITOR-OPTION: AUTOFORMAT") ';
    _Html[_Html.length] = '   MenuBar = {}';

    var Roles = [undefined, 'Admin', 'Director', 'Manager', 'Clerk', 'Employee', 'User', 'Anonymous'];

    var Pages = {};
    for (Role of iterateOver(Roles)) {
        Pages[Role] = [undefined,];
    }

    // Loop on Organize Pages by Role
    if (await JSB_ODB_OPEN('dict', CStr(Projectname), Fproject, function (_Fproject) { Fproject = _Fproject })); else return Stop(At(-1), 'Edp-', System(28), ': ', activeProcess.At_Errors);
    if (await JSB_ODB_SELECTTO(CStr(undefined), Fproject, 'ItemID Like \'%.page\'', Fs, function (_Fs) { Fs = _Fs })); else return Stop(At(-1), 'Edp-', System(28), ': ', activeProcess.At_Errors);
    Projectpages = getList(Fs);

    Menutree = {};
    Pno = LBound(Projectpages) - 1;
    for (Pageid of iterateOver(Projectpages)) {
        Pno++;
        if (await JSB_ODB_READJSON(Item, Fproject, CStr(Pageid), function (_Item) { Item = _Item })); else return Stop(At(-1), 'Edp-', System(28), ': ', activeProcess.At_Errors);

        Menuname = Item.menucategory;
        if (CBool(Item.menuitem) && (CBool(Menuname) || CBool(Item.iconurl) || CBool(Item.glyphicon))) {
            Role = UCase(Left(Item.minimumRole, 1)) + LCase(Mid1(Item.minimumRole, 2));
            if (Not(Role)) Role = 'Anonymous';
            Item.minimumRole = Role;
            Item.pageID = Pageid;
            if (Locate(Role, Roles, 0, 0, 0, "", position => { })) {
                Pages[Role][Pages[Role].length] = Item;
                if (CBool(Menuname)) {
                    if (Not(Menutree[Menuname])) Menutree[Menuname] = [undefined,];
                    Menutree[Menuname][Menutree[Menuname].length] = Pageid;
                }
            }
        }
    }

    for (Role of iterateOver(Roles)) {
        // Build Menus for this role
        Menus = {};
        Menuitems = Pages[Role];

        for (Item of iterateOver(Menuitems)) {
            Menuname = Item.menucategory;
            Submenuname = Field(Field(Item.menuitem, '#', 1), '?', 1);
            Pageid = Item.pageID;

            Onlyone = UBound(Menutree[Menuname]) == 1;
            if (Not(Submenuname)) Submenuname = dropRight(CStr(Pageid), '.page');

            if (CBool(Menuname)) {
                if (Not(Menus[Menuname])) { Menus[Menuname] = {} }

                if (CBool(Item.iconurl) || CBool(Item.glyphicon)) {
                    Menus[Menuname][Submenuname] = { "id": dropRight(CStr(Pageid), '.page'), "iconurl": Item.iconurl, "glyphicon": Item.glyphicon }
                } else {
                    if (CBool(Onlyone)) { Menus[Menuname] = 'window.eventHandler_SelectMenu({id:"' + dropRight(CStr(Pageid), '.page') + '"}, \'id\')'; } else { Menus[Menuname][Submenuname] = { "id": dropRight(CStr(Pageid), '.page') } }
                }
            } else {
                if (CBool(Item.iconurl) || CBool(Item.glyphicon)) {
                    Menus[Submenuname] = { "id": Item.menuitem, "iconurl": Item.iconurl, "glyphicon": Item.glyphicon }
                } else {
                    Menus[Submenuname] = 'window.eventHandler_SelectMenu({id:"' + CStr(Item.menuitem) + '"}, \'id\')';
                }
            }
        }

        if (Len(Menus)) {
            _Html[_Html.length] = '';
            if (Role != 'Anonymous') _Html[_Html.length] = '   If @Is' + CStr(Role) + ' Then';

            // Convert to HTML - do ICONs first
            for (Menuname of iterateOver(Menus)) {
                So = Menus[Menuname];
                if (isJSON(So)) {
                    if (JSB_BF_NICENAME(CStr(Menuname)) == Menuname) To = '.' + CStr(Menuname); else To = '[\'' + CStr(Menuname) + '\']';
                    _Html[_Html.length] = '   MenuBar' + CStr(To) + ' = ' + CStr(So);
                } else if (Not(isArray(So))) {
                    if (JSB_BF_NICENAME(CStr(Menuname)) == Menuname) To = '.' + CStr(Menuname); else To = '[\'' + CStr(Menuname) + '\']';
                    _Html[_Html.length] = '   MenuBar' + CStr(To) + ' = `' + CStr(So) + '`';
                }
            }

            // Then Menus
            for (Menuname of iterateOver(Menus)) {
                So = Menus[Menuname];
                if (CBool(isArray(So))) {
                    if (JSB_BF_NICENAME(CStr(Menuname)) == Menuname) To = '.' + CStr(Menuname); else To = '[\'' + CStr(Menuname) + '\']';
                    _Html[_Html.length] = '   If !isJson(MenuBar' + CStr(To) + ') Then MenuBar' + CStr(To) + ' = {}';
                    for (Submenuname of iterateOver(So)) {
                        if (JSB_BF_NICENAME(CStr(Submenuname)) == Submenuname) To2 = '.' + CStr(Submenuname); else To2 = '[\'' + CStr(Submenuname) + '\']';
                        Item = So[Submenuname];
                        if (isJSON(Item)) {
                            _Html[_Html.length] = '   MenuBar' + CStr(To) + CStr(To2) + ' = ' + CStr(Item);
                        } else {
                            _Html[_Html.length] = '   MenuBar' + CStr(To) + CStr(To2) + ' = { id: "' + CStr(Item) + '" }';
                        }
                    }
                }
            }

            if (Role != 'Anonymous') _Html[_Html.length] = '   End If';
        }
    }

    // Tag on web master stuff
    _Html[_Html.length] = '   If @IsAdmin Then';
    _Html[_Html.length] = '      Dim fromPage As String';
    _Html[_Html.length] = '      If InStr(@Url, "\\\\":edpName) Then fromPage = @Url Else fromPage = edpName';
    _Html[_Html.length] = '';
    _Html[_Html.length] = '      MenuBar["Web Page"] = {}';
    _Html[_Html.length] = '      MenuBar["Web Page"]["View Page Props"] = {}';
    _Html[_Html.length] = ('      MenuBar["Web Page"]["View Page Props"].id = "?edp&projectName=":@UrlEncode(System(27)):"&pageName=":@UrlEncode(edpName):"&fromPage=":@UrlEncode(fromPage)');
    _Html[_Html.length] = '      MenuBar["Web Page"]["ReGen Page"] = {}';
    _Html[_Html.length] = ('      MenuBar["Web Page"]["ReGen Page"].id = "?ReGenPageModel&projectName=":@UrlEncode(System(27)):"&pageName=":@UrlEncode(edpName):"&fromPage=":@UrlEncode(fromPage)');
    _Html[_Html.length] = '      MenuBar["Web Page"].seperator1 = true';
    _Html[_Html.length] = '      MenuBar["Web Page"]["Add Page"] = {}';
    _Html[_Html.length] = ('      MenuBar["Web Page"]["Add Page"].id = "?edp&projectName=":@UrlEncode(System(27)):"&fromPage=":@UrlEncode(fromPage)');
    _Html[_Html.length] = '      MenuBar["Web Page"]["Clone Page As"] = {}';
    _Html[_Html.length] = ('      MenuBar["Web Page"]["Clone Page As"].id = "?clonePageModel&projectName=":@UrlEncode(System(27)):"&pageName=":@UrlEncode(edpName):"&fromPage=":@UrlEncode(fromPage)');
    _Html[_Html.length] = '      MenuBar["Web Page"].seperator2 = true';
    _Html[_Html.length] = '      MenuBar["Web Page"]["Rename Page"] = {}';
    _Html[_Html.length] = ('      MenuBar["Web Page"]["Rename Page"].id = "?renamePageModel&projectName=":@UrlEncode(System(27)):"&pageName=":@UrlEncode(edpName):"&fromPage=":@UrlEncode(fromPage)');
    _Html[_Html.length] = '      MenuBar["Web Page"].seperator3 = true';
    _Html[_Html.length] = '      MenuBar["Web Page"]["Delete Page"] = {}';
    _Html[_Html.length] = ('      MenuBar["Web Page"]["Delete Page"].id = "?deletePageModel&projectName=":@UrlEncode(System(27)):"&pageName=":@UrlEncode(edpName):"&fromPage=Menu"');
    _Html[_Html.length] = '';
    _Html[_Html.length] = '      // Can collaspe here after Any HTML ';
    _Html[_Html.length] = '      MenuBar.collaspable = True';
    _Html[_Html.length] = '';
    _Html[_Html.length] = '      MenuBar["Menus"] = {}';
    _Html[_Html.length] = '      MenuBar["Menus"]["Main Menu"] = {}';
    _Html[_Html.length] = '      MenuBar["Menus"]["Main Menu"].id = "?Menu"';
    _Html[_Html.length] = '      MenuBar["Menus"]["Add Page To Menu"] = {}';
    _Html[_Html.length] = ('      MenuBar["Menus"]["Add Page To Menu"].id = "?addPageToMenu&projectName=":@UrlEncode(System(27)):"&pageName=":@UrlEncode(edpName):"&fromPage=":@UrlEncode(fromPage)');
    _Html[_Html.length] = '      MenuBar["Menus"]["Add Page To Reference Menu"] = {}';
    _Html[_Html.length] = ('      MenuBar["Menus"]["Add Page To Reference Menu"].id = "?addPageToReferenceMenu&projectName=":@UrlEncode(System(27)):"&pageName=":@UrlEncode(edpName):"&fromPage=":@UrlEncode(fromPage)');
    _Html[_Html.length] = '';
    _Html[_Html.length] = '      MenuBar["TCL"] = {}';
    _Html[_Html.length] = '      MenuBar["TCL"].id = "tcl"';
    _Html[_Html.length] = '';
    _Html[_Html.length] = '      MenuBar["Web Security"] = {}';
    _Html[_Html.length] = '      MenuBar["Web Security"]["Security"] = {}';
    _Html[_Html.length] = ('      MenuBar["Web Security"]["Security"].id = "?WebSiteSecurity&projectName=":@UrlEncode(System(27)):"&fromPage=":@UrlEncode(fromPage)');
    _Html[_Html.length] = '';
    _Html[_Html.length] = '      MenuBar["Websites"] = {}';
    _Html[_Html.length] = '      MenuBar["Websites"]["ReGen MenuBar"] = {}';
    _Html[_Html.length] = ('      MenuBar["Websites"]["ReGen MenuBar"].id = "?updateMenus&projectName=":@UrlEncode(System(27)):"&fromPage=":@UrlEncode(fromPage)');
    _Html[_Html.length] = '      MenuBar["Websites"].seperator1 = true';
    _Html[_Html.length] = '      MenuBar["Websites"]["ReGen Website"] = {}';
    _Html[_Html.length] = ('      MenuBar["Websites"]["ReGen Website"].id = "?RegenWebSiteModel&projectName=":@UrlEncode(System(27)):"&fromPage=":@UrlEncode(fromPage)');
    _Html[_Html.length] = '      MenuBar["Websites"].seperator2 = true';
    _Html[_Html.length] = '      MenuBar["Websites"]["New Website"] = {}';
    _Html[_Html.length] = ('      MenuBar["Websites"]["New Website"].id = "?newWebSiteModel&fromPage=":@UrlEncode(fromPage)');
    _Html[_Html.length] = '      MenuBar["Websites"]["Clone Website"] = {}';
    _Html[_Html.length] = ('      MenuBar["Websites"]["Clone Website"].id = "?cloneWebSite&fromPage=":@UrlEncode(fromPage)');
    _Html[_Html.length] = '      MenuBar["Websites"].seperator3 = true';
    _Html[_Html.length] = '      MenuBar["Websites"]["Delete Website"] = {}';
    _Html[_Html.length] = ('      MenuBar["Websites"]["Delete Website"].id = "?deleteWebSiteModel&projectName=":@UrlEncode(System(27)):""');

    _Html[_Html.length] = '   End If';

    _Html[_Html.length] = '';
    _Html[_Html.length] = '    Dim customMenu As String = \'' + CStr(Projectname) + '.\':NiceName(edpName):\'_customMenu\'';
    _Html[_Html.length] = '    Call @?customMenu(MenuBar)';
    _Html[_Html.length] = 'End Sub';

    var Newmenu = Join(_Html, crlf);
    Oldmenu = Change(Oldmenu, am, crlf);

    if (Null0(Oldmenu) != Null0(Newmenu) || Forceit) {
        Println(await JSB_MDL_UPDATECODE(CStr(_Html), CStr(Projectname), 'Project_Menus'));
    }

    At_Session.Item('LastMenuCompile_' + CStr(Projectname), r83Time());
}
// </UPDATEMENU_Sub>

// <UPDATEMENUS_Pgm>
async function JSB_MDL_UPDATEMENUS_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Projectname, Frompage, Sentence;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                // %options aspxC-
                if (!(await JSB_BF_ISMANAGER())) return Stop('You must be at least a manager to run this command');

                Projectname = paramVar('ProjectName');
                Frompage = paramVar('fromPage');

                if (isEmpty(Projectname) && InStr1(1, activeProcess.At_Sentence, '=') == 0) {
                    Sentence = Field(activeProcess.At_Sentence, '(', 1);
                    Projectname = Field(Sentence, ' ', 2);
                }

                if (Not(Projectname)) Projectname = 'cs';

                await JSB_MDL_UPDATEMENU_Sub(CStr(Projectname), true);

                Println(await JSB_BF_MSGBOX('done'));


            case "DONE":

                if (CBool(Frompage)) return At_Response.Redirect(Frompage); else return;
                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </UPDATEMENUS_Pgm>

// <URLOUTPUTPARAMS>
async function JSB_MDL_URLOUTPUTPARAMS(ByRef_Outputfields, setByRefValues) {
    // local variables
    var Urlparams, Row;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Outputfields)
        return v
    }
    // %options aspxC-

    if (Not(ByRef_Outputfields)) return exit('');
    ByRef_Outputfields = parseJSON(ByRef_Outputfields);

    Urlparams = '';
    for (Row of iterateOver(ByRef_Outputfields)) {
        if (Row.scope == 'UrlParam') {
            if (isEmpty(Row.name)) Row.name = Row.field;
            if (!isEmpty(Row.name) && !isEmpty(Row.field)) {
                if (CBool(Urlparams)) Urlparams = (CStr(Urlparams) + '&'); else Urlparams = '?';
                Urlparams = CStr(Urlparams) + CStr(Row.name) + '={' + CStr(Row.field) + '}';
            }
        }
    }

    return exit(Urlparams);
}
// </URLOUTPUTPARAMS>

// <URLPASSTHROUGH>
async function JSB_MDL_URLPASSTHROUGH(ByRef_Viewmodel, setByRefValues) {
    // local variables
    var _Html, Inputs, Row, Varname;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Viewmodel)
        return v
    }
    // %options aspxC-

    _Html = [undefined, '   UrlParams = ""']; // Returns UrlParams
    Inputs = [undefined,];
    if (!isEmpty(ByRef_Viewmodel.inputs)) Inputs = parseJSON(ByRef_Viewmodel.inputs);

    // Fetch each Input
    for (Row of iterateOver(Inputs)) {
        if (isEmpty(Row.name)) Row.name = Row.field;
        if (CBool(Row.name)) {
            Varname = JSB_BF_NICENAME(CStr(Row.name));
            switch (Row.scope) {
                case 'UrlParam':
                    _Html[_Html.length] = '   ' + CStr(Varname) + ' = @ParamVar("' + CStr(Row.name) + '")';
                    _Html[_Html.length] = '   if !IsNothing(' + CStr(Varname) + ') Then';
                    _Html[_Html.length] = ('      If UrlParams Then UrlParams := "&" Else UrlParams = "?"');
                    _Html[_Html.length] = '      UrlParams := "' + CStr(Row.name) + '=":@UrlEncode(' + CStr(Varname) + ')';
                    _Html[_Html.length] = '   End If';
            }
        }
    }

    return exit(Join(_Html, crlf));
}
// </URLPASSTHROUGH>

// <VIEWDEFINITIONS>
async function JSB_MDL_VIEWDEFINITIONS(ByRef_Modelcolumns, setByRefValues) {
    // local variables
    var Viewcolumns, Xrow;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Modelcolumns)
        return v
    }
    // %options aspxC-

    Viewcolumns = [undefined,];
    for (Xrow of iterateOver(ByRef_Modelcolumns)) {
        if (Right(Xrow.name, 4) == 'view') {
            Viewcolumns[Viewcolumns.length] = Xrow;
        }
    }
    return exit(Viewcolumns);
}
// </VIEWDEFINITIONS>

// <VIEWSINPAGE>
async function JSB_MDL_VIEWSINPAGE(ByRef_Projectname, Pagename, setByRefValues) {
    // local variables
    var Pagedataset, Views, Jdef, Viewname;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname)
        return v
    }
    // %options aspxC-

    Pagename = dropIfRight(CStr(Pagename), '.page', true) + '.page';
    if (await JSB_ODB_READJSON(Pagedataset, await JSB_BF_FHANDLE('dict', ByRef_Projectname), CStr(Pagename), function (_Pagedataset) { Pagedataset = _Pagedataset })); else Pagedataset = [undefined,];

    Views = [undefined,];
    for (Jdef of iterateOver(Pagedataset)) {
        if (Right(Jdef, 4) == 'view') {
            Viewname = Pagedataset[Jdef];
            if (CBool(Viewname)) Views[Views.length] = Viewname;
        }
    }

    Views = await JSB_MDL_ADDNESTEDVIEWS(ByRef_Projectname, Views, function (_ByRef_Projectname, _Views) { ByRef_Projectname = _ByRef_Projectname; Views = _Views });
    return exit(Views);
}
// </VIEWSINPAGE>

// <VIEWWIZARD_Sub>
async function JSB_MDL_VIEWWIZARD_Sub(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Dataset, setByRefValues) {
    // local variables
    var Fdict, Totype;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Projectname, ByRef_Pagename, ByRef_Viewname, ByRef_Dataset)
        return v
    }
    // %options aspxC-

    Fdict = await JSB_BF_FHANDLE('DICT', ByRef_Projectname);
    if (await JSB_ODB_READJSON(ByRef_Dataset, Fdict, CStr(ByRef_Viewname), function (_ByRef_Dataset) { ByRef_Dataset = _ByRef_Dataset })); else return exit(undefined);

    Totype = await JSB_BF_INPUTDROPDOWNBOX('ViewWizard', 'Change columns to:', CStr([undefined, '', 'Reset Form', 'Search Form', 'ReadOnly Form', 'Menu Form']), '');
    if (isEmpty(Totype) || Totype == Chr(27)) return exit(undefined);

    await JSB_MDL_DOWIZARD_Sub(ByRef_Viewname, ByRef_Dataset, Totype, function (_ByRef_Viewname, _ByRef_Dataset, _Totype) { ByRef_Viewname = _ByRef_Viewname; ByRef_Dataset = _ByRef_Dataset; Totype = _Totype });

    if (await JSB_ODB_WRITEJSON(ByRef_Dataset, Fdict, CStr(ByRef_Viewname))); else return Stop(At(-1), 'edv-', System(28), ': ', activeProcess.At_Errors);
    // Call @jsb_mdl.ReGenPageModel(ProjectName, pageName, False)
    return exit();
}
// </VIEWWIZARD_Sub>

// <VIEW_EXCELUPLOAD_CANCELEDITS>
async function JSB_MDL_VIEW_EXCELUPLOAD_CANCELEDITS(Pkid, ByRef_Rtnerrors, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Rtnerrors)
        return v
    }
    return exit(true);
}
// </VIEW_EXCELUPLOAD_CANCELEDITS>

// <VIEW_EXCELUPLOAD_CHECKCOMMANDS_Sub>
async function JSB_MDL_VIEW_EXCELUPLOAD_CHECKCOMMANDS_Sub(Viewvars, Pagebtn, Columnid) {
    // What button did the user click?
    var Btn = CStr(Pagebtn) + CStr(formVar('formBtn_ExcelUpload')) + CStr(formVar('ne_ExcelUpload_formBtn')) + CStr(formVar('contextMenuCmd'));
    var Rtnerrors = ''; var Pkid = ''; var Transferhtml = ''; var Urlparams = ''; var Buff = '', Tag = '';

    await JSB_BF_CHECKSTANDARDCOMMANDS_Sub(Btn, 'mdl', 'ExcelUpload.view', CStr(Columnid), 'ne_ExcelUpload', false, CStr(Viewvars.fromParentPage), CNum(Viewvars.parentMultiView), CStr(Viewvars.htmlBackDrop), undefined, function (_Btn) { Btn = _Btn });
    var Successop = undefined;

    switch (Btn) {
        case 'C': case 'B': case 'Q':
            // Page Cancel
            var Ans = '';
            if (await JSB_MDL_VIEW_EXCELUPLOAD_ISDIRTY(Viewvars)) {
                Ans = await JSB_BF_MSGBOX('Warning!', Language('You are about to lose any edits you have made. Continue?'), 'Yes,No');
            } else {
                Ans = 'Yes';
            }
            if (Ans == 'Yes') {
                if (await JSB_MDL_VIEW_EXCELUPLOAD_CANCELEDITS(CStr(Viewvars.currentID), Rtnerrors, function (_Rtnerrors) { Rtnerrors = _Rtnerrors })) {
                    await JSB_MDL_VIEW_EXCELUPLOAD_SETUP_Sub(Viewvars, undefined, undefined, undefined, function (_Viewvars) { Viewvars = _Viewvars });
                } else if (Rtnerrors) {
                    Alert(Rtnerrors, false);
                }
            }

            break;

        case 'C!': case 'B!': case 'Q!':
            await JSB_MDL_VIEW_EXCELUPLOAD_SETUP_Sub(Viewvars, undefined, undefined, undefined, function (_Viewvars) { Viewvars = _Viewvars });

            break;

        case 'D':
            // Multi-Form Delete
            if (await JSB_MDL_VIEW_EXCELUPLOAD_DELETEROW(CStr(Viewvars.currentID), Rtnerrors, function (_Rtnerrors) { Rtnerrors = _Rtnerrors })) {
                Viewvars.ParentRefresh = true;
            } else if (Rtnerrors) {
                Alert(Rtnerrors, false);
            }

            break;

        case 'S':
            // this Is A Multi-Form Save
            Pkid = Viewvars.currentID;
            if (await JSB_MDL_VIEW_EXCELUPLOAD_WRITEROW(Viewvars.Row, Pkid, Rtnerrors, function (_Pkid, _Rtnerrors) { Pkid = _Pkid; Rtnerrors = _Rtnerrors })) {
                Viewvars.currentID = Pkid;
                Viewvars.ParentRefresh = true;;
            } else if (Rtnerrors) {
                Alert(Rtnerrors, false);
            }

            break;

        case 'Save':
            // A Server Side Required Button
            Pkid = Viewvars.currentID;
            Successop = await JSB_MDL_VIEW_EXCELUPLOAD_WRITEROW(Viewvars.Row, Pkid, Rtnerrors, function (_Pkid, _Rtnerrors) { Pkid = _Pkid; Rtnerrors = _Rtnerrors });
            if (Successop) { Viewvars.currentID = Pkid; Viewvars.ParentRefresh = true; }

            if (Successop) {
                Urlparams = '';
                Transferhtml = genEventHandler('Transfer', 'ExcelUpload' + Urlparams, 10, '', 0, false);
                if (CBool(Viewvars.ParentRefresh)) { Transferhtml += JSB_HTML_SCRIPT('if (parent.refreshData) parent.refreshData();'); }
                Transferhtml += JSB_HTML_SCRIPT('window.eventHandler_Transfer(jsbFormVars(), "ItemID");');

                // Push all our values into a hidden tag to be used by the transfer
                for (Tag of iterateOver(Viewvars.Row)) {
                    Transferhtml = Hidden(CStr(Tag), CStr(Viewvars.Row[Tag])) + Transferhtml;
                }

                return Stop(At(-1), Transferhtml);;
            } else if (Rtnerrors) {
                Alert(Rtnerrors, false);
            }

            break;

        case 'Update':
            // A Server Side Required Button
            Pkid = Viewvars.currentID;
            Successop = await JSB_MDL_VIEW_EXCELUPLOAD_WRITEROW(Viewvars.Row, Pkid, Rtnerrors, function (_Pkid, _Rtnerrors) { Pkid = _Pkid; Rtnerrors = _Rtnerrors });
            if (Successop) { Viewvars.currentID = Pkid; Viewvars.ParentRefresh = true; }

            if (Successop) {
                Urlparams = '';
                Transferhtml = genEventHandler('Transfer', 'ExcelUpload' + Urlparams, 10, '', 0, false);
                if (CBool(Viewvars.ParentRefresh)) { Transferhtml += JSB_HTML_SCRIPT('if (parent.refreshData) parent.refreshData();'); }
                Transferhtml += JSB_HTML_SCRIPT('window.eventHandler_Transfer(jsbFormVars(), "ItemID");');

                // Push all our values into a hidden tag to be used by the transfer
                for (Tag of iterateOver(Viewvars.Row)) {
                    Transferhtml = Hidden(CStr(Tag), CStr(Viewvars.Row[Tag])) + Transferhtml;
                }

                return Stop(At(-1), Transferhtml);;
            } else if (Rtnerrors) {
                Alert(Rtnerrors, false);
            }

            break;

        case 'Cancel': case '':
            break;

        default:
        // @Alert("Form ExcelUpload.view got a '":Btn:"' on column ":ColumnID)    
    }
}
// </VIEW_EXCELUPLOAD_CHECKCOMMANDS_Sub>

// <VIEW_EXCELUPLOAD_DELETEROW>
async function JSB_MDL_VIEW_EXCELUPLOAD_DELETEROW(Pkid, ByRef_Rtnerrors, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Rtnerrors)
        return v
    }
    var Ftable = undefined;

    if (!(await JSB_BF_OPENTABLE('tmp', 'ExcelUpload.view', Ftable, ByRef_Rtnerrors, function (_Ftable, _ByRef_Rtnerrors) { Ftable = _Ftable; ByRef_Rtnerrors = _ByRef_Rtnerrors }))) return exit(false);
    if (!Pkid) { ByRef_Rtnerrors = 'No primary key defined.  Delete failed'; return exit(false); }

    if (await JSB_ODB_DELETEITEM(Ftable, CStr(Pkid))); else {
        ByRef_Rtnerrors = activeProcess.At_Errors;
        await JSB_BF_LOGERR(ByRef_Rtnerrors);
        return exit(false);
    }

    return exit(true);
}
// </VIEW_EXCELUPLOAD_DELETEROW>

// <VIEW_EXCELUPLOAD_DISPLAY_CC_Sub>
async function JSB_MDL_VIEW_EXCELUPLOAD_DISPLAY_CC_Sub(Viewvars, ByRef__Html, ByRef_Toolbar, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html, ByRef_Toolbar)
        return v
    }
    // Any extra setup needed
    return exit();
}
// </VIEW_EXCELUPLOAD_DISPLAY_CC_Sub>

// <VIEW_EXCELUPLOAD_GETPK>
async function JSB_MDL_VIEW_EXCELUPLOAD_GETPK(Sqlfilter, ByRef_Pkid, ByRef_Rtnerrors, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Pkid, ByRef_Rtnerrors)
        return v
    }
    var Selecthandle = undefined;
    var Ftable = undefined;

    if (!(await JSB_BF_OPENTABLE('tmp', 'ExcelUpload.view', Ftable, ByRef_Rtnerrors, function (_Ftable, _ByRef_Rtnerrors) { Ftable = _Ftable; ByRef_Rtnerrors = _ByRef_Rtnerrors }))) return exit(false);

    if (await JSB_ODB_SELECTTO('', Ftable, CStr(Sqlfilter), Selecthandle, function (_Selecthandle) { Selecthandle = _Selecthandle })); else {
        ByRef_Rtnerrors = 'Form-' + CStr(System(28)) + '-Select-' + CStr(Sqlfilter) + ': ' + CStr(activeProcess.At_Errors);
        await JSB_BF_LOGERR(ByRef_Rtnerrors);
        return exit(false);
    }

    ByRef_Pkid = readNext(Selecthandle).itemid;
    if (ByRef_Pkid); else ByRef_Rtnerrors = 'No items found in table \'tmp\' Where ' + CStr(Sqlfilter);

    return exit(true);
}
// </VIEW_EXCELUPLOAD_GETPK>

// <VIEW_EXCELUPLOAD_ISDIRTY>
async function JSB_MDL_VIEW_EXCELUPLOAD_ISDIRTY(Viewvars) {
    var Currentrow = Viewvars.Row;
    var Originalrow = Viewvars.OriginalRow;
    if (Null0(Currentrow['DataMustHaveOneNumericRow']) != Null0(Originalrow['DataMustHaveOneNumericRow'])) return true;
    if (Null0(Currentrow['SideBySideTables']) != Null0(Originalrow['SideBySideTables'])) return true;
    if (Null0(Currentrow['ignoreTablesWithNoRows']) != Null0(Originalrow['ignoreTablesWithNoRows'])) return true;
    if (Null0(Currentrow['ignoreTablesWithLessThanNColumns']) != Null0(Originalrow['ignoreTablesWithLessThanNColumns'])) return true;
    if (Null0(Currentrow['OneTablePerSheet']) != Null0(Originalrow['OneTablePerSheet'])) return true;
    if (Null0(Currentrow['AllowBlankRows']) != Null0(Originalrow['AllowBlankRows'])) return true;
    if (Null0(Currentrow['DefaultEmptyValuesFromPreviousRow']) != Null0(Originalrow['DefaultEmptyValuesFromPreviousRow'])) return true;
    if (Null0(Currentrow['deleteAndRecreateTables']) != Null0(Originalrow['deleteAndRecreateTables'])) return true;
    if (Null0(Currentrow['showTables']) != Null0(Originalrow['showTables'])) return true;
    if (Null0(Currentrow['commonDatabaseName']) != Null0(Originalrow['commonDatabaseName'])) return true;
    return false;
}
// </VIEW_EXCELUPLOAD_ISDIRTY>

// <VIEW_EXCELUPLOAD_NEWROW>
async function JSB_MDL_VIEW_EXCELUPLOAD_NEWROW(ByRef_Rtnerrors, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Rtnerrors)
        return v
    }
    return exit(await JSB_MDL_VIEW_EXCELUPLOAD_SETDEFAULTS({}));
}
// </VIEW_EXCELUPLOAD_NEWROW>

// <VIEW_EXCELUPLOAD_READROW>
async function JSB_MDL_VIEW_EXCELUPLOAD_READROW(Pkid, ByRef_Rtnrow, ByRef_Rtnerrors, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Rtnrow, ByRef_Rtnerrors)
        return v
    }
    if (await JSB_ODB_ATTACHDB('sysprog')); else { ByRef_Rtnerrors = activeProcess.At_Errors; return exit(undefined); }

    var Ftable = undefined;
    if (!(await JSB_BF_OPENTABLE('tmp', 'ExcelUpload.view', Ftable, ByRef_Rtnerrors, function (_Ftable, _ByRef_Rtnerrors) { Ftable = _Ftable; ByRef_Rtnerrors = _ByRef_Rtnerrors }))) return exit(false);
    if (!Pkid) { return exit(await JSB_MDL_VIEW_EXCELUPLOAD_NEWROW(ByRef_Rtnerrors, function (_ByRef_Rtnerrors) { ByRef_Rtnerrors = _ByRef_Rtnerrors })); }

    if (await JSB_ODB_READJSON(ByRef_Rtnrow, Ftable, CStr(Pkid), function (_ByRef_Rtnrow) { ByRef_Rtnrow = _ByRef_Rtnrow })); else {
        ByRef_Rtnerrors = activeProcess.At_Errors;
        if (!ByRef_Rtnerrors) ByRef_Rtnerrors = 'Item \'' + CStr(Pkid) + '\' in \'ExcelUpload.view\' not found.';
        await JSB_BF_LOGERR(ByRef_Rtnerrors);
        return exit(false);
    }

    if (CBool(ByRef_Rtnrow.ItemID) && HasTag(ByRef_Rtnrow, 'ItemContent')) {
        var Sitem = ByRef_Rtnrow.ItemContent;
        var Item = undefined;
        if (InStr1(1, Sitem, crlf)) Item = Split(Sitem, crlf); else Item = Split(Sitem, am);
        ByRef_Rtnrow = { "isA_CrlF_TextFile": true }
    }

    return exit(true);
}
// </VIEW_EXCELUPLOAD_READROW>

// <VIEW_EXCELUPLOAD_SETDEFAULTS>
async function JSB_MDL_VIEW_EXCELUPLOAD_SETDEFAULTS(Rtnrow) {
    Rtnrow['DataMustHaveOneNumericRow'] = 1;
    Rtnrow['ignoreTablesWithNoRows'] = 1;
    Rtnrow['ignoreTablesWithLessThanNColumns'] = 7;
    Rtnrow['OneTablePerSheet'] = 1;
    Rtnrow['AllowBlankRows'] = 1;
    Rtnrow['showTables'] = 1;

    return Rtnrow;
}
// </VIEW_EXCELUPLOAD_SETDEFAULTS>

// <VIEW_EXCELUPLOAD_SETUP_Sub>
async function JSB_MDL_VIEW_EXCELUPLOAD_SETUP_Sub(ByRef_Viewvars, Basedirectory, Xlsfilename, Sqldbname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Viewvars)
        return v
    }
    if (await JSB_ODB_ATTACHDB('sysprog')); else null;

    if (Not(ByRef_Viewvars)) {
        var Row = {};
        Row.DataMustHaveOneNumericRow = true;
        Row.SideBySideTables = false;
        Row.ignoreTablesWithNoRows = true;
        Row.ignoreTablesWithLessThanNColumns = 7;
        Row.OneTablePerSheet = true;
        Row.AllowBlankRows = true;
        Row.DefaultEmptyValuesFromPreviousRow = false;
        Row.deleteAndRecreateTables = true;
        Row.showTables = true;
        Row.commonDatabaseName = Sqldbname;
        Row.XlsFileName = Xlsfilename;
        Row.BaseDirectory = Basedirectory;
        Row.verbose = true;
        Row.columnNamesUsed = [undefined,];

        ByRef_Viewvars = {};
        ByRef_Viewvars.Row = Row;
    }

    var Currentid = ''; // this Will Be Set Here Or By Write
    var Rtnerrors = '';
    var Sqlfilter = '';
    var Sqlcolumns = '';

    if (InStr1(1, JSB_BF_URL(), 'newRecord=1')) {
        Row = await JSB_MDL_VIEW_EXCELUPLOAD_NEWROW(Rtnerrors, function (_Rtnerrors) { Rtnerrors = _Rtnerrors });
        if (Rtnerrors && !isPostBack()) Alert(Rtnerrors, true);
    } else {
        Row = {};
        Sqlfilter = '';
        Sqlcolumns = '[DataMustHaveOneNumericRow],[SideBySideTables],[ignoreTablesWithNoRows],[ignoreTablesWithLessThanNColumns],[OneTablePerSheet],[AllowBlankRows],[DefaultEmptyValuesFromPreviousRow],[deleteAndRecreateTables],[showTables],[commonDatabaseName]';

        if (Rtnerrors && !isPostBack()) Alert(Rtnerrors, true);

        // Based on current filtering (SqlFilter), Get a record ID (PrimaryKey)
        if (!(await JSB_MDL_VIEW_EXCELUPLOAD_GETPK(Sqlfilter, Currentid, Rtnerrors, function (_Currentid, _Rtnerrors) { Currentid = _Currentid; Rtnerrors = _Rtnerrors })) && !isPostBack()) Alert(Rtnerrors, true);

        if (!Currentid) {
            Rtnerrors = '';
            Row = await JSB_MDL_VIEW_EXCELUPLOAD_NEWROW(Rtnerrors, function (_Rtnerrors) { Rtnerrors = _Rtnerrors });
            if (Rtnerrors && !isPostBack()) Alert(Rtnerrors, true);
        } else if (await JSB_MDL_VIEW_EXCELUPLOAD_READROW(Currentid, Row, Rtnerrors, function (_Row, _Rtnerrors) { Row = _Row; Rtnerrors = _Rtnerrors })) {
            Row = await JSB_MDL_VIEW_EXCELUPLOAD_SETDEFAULTS(Row);
        } else {
            // Didn't find record
            if (Not(Row)) { Row = {} }
            if (Rtnerrors && !isPostBack()) Alert(Rtnerrors, false);
        }
    }

    ByRef_Viewvars.Row = Row;
    ByRef_Viewvars.currentID = Currentid; // Will Always Be Blank If New Record (Updated On Write)
    ByRef_Viewvars.htmlBackDrop = '';
    ByRef_Viewvars.OriginalRow = clone(Row);

    return exit();
}
// </VIEW_EXCELUPLOAD_SETUP_Sub>

// <VIEW_EXCELUPLOAD_UNLOAD_Sub>
async function JSB_MDL_VIEW_EXCELUPLOAD_UNLOAD_Sub(Viewvars) {
    // Unload the submitted form fields (@FormVars) into the edit row (viewvars.row)
    var Row = Viewvars.Row;
    var Unloadedvalue = '';

    Unloadedvalue = formVar('DataMustHaveOneNumericRow');
    if (Unloadedvalue) Row['DataMustHaveOneNumericRow'] = Unloadedvalue;
    Unloadedvalue = formVar('SideBySideTables');
    if (Unloadedvalue) Row['SideBySideTables'] = Unloadedvalue;
    Unloadedvalue = formVar('ignoreTablesWithNoRows');
    if (Unloadedvalue) Row['ignoreTablesWithNoRows'] = Unloadedvalue;
    Unloadedvalue = formVar('ignoreTablesWithLessThanNColumns');

    if (Len(Unloadedvalue)) Row['ignoreTablesWithLessThanNColumns'] = CInt(CNum(Unloadedvalue));
    Unloadedvalue = formVar('OneTablePerSheet');
    if (Unloadedvalue) Row['OneTablePerSheet'] = Unloadedvalue;
    Unloadedvalue = formVar('AllowBlankRows');
    if (Unloadedvalue) Row['AllowBlankRows'] = Unloadedvalue;
    Unloadedvalue = formVar('DefaultEmptyValuesFromPreviousRow');
    if (Unloadedvalue) Row['DefaultEmptyValuesFromPreviousRow'] = Unloadedvalue;
    Unloadedvalue = formVar('deleteAndRecreateTables');
    if (Unloadedvalue) Row['deleteAndRecreateTables'] = Unloadedvalue;
    Unloadedvalue = formVar('showTables');
    if (Unloadedvalue) Row['showTables'] = Unloadedvalue;
    Unloadedvalue = formVar('commonDatabaseName');
    if (Unloadedvalue) Row['commonDatabaseName'] = Unloadedvalue;

}
// </VIEW_EXCELUPLOAD_UNLOAD_Sub>

// <VIEW_EXCELUPLOAD_WRITEROW>
async function JSB_MDL_VIEW_EXCELUPLOAD_WRITEROW(Row, ByRef_Pkid, ByRef_Rtnerrors, setByRefValues) {
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                function exit(v) {
                    if (typeof setByRefValues == 'function') setByRefValues(ByRef_Pkid, ByRef_Rtnerrors)
                    return v
                }
                // Verify anything in Row you want here with custom code - return False and rtnErrors
                var Newrecord = Not(ByRef_Pkid);
                var Ftable = undefined;
                if (!(await JSB_BF_OPENTABLE('tmp', 'ExcelUpload.view', Ftable, ByRef_Rtnerrors, function (_Ftable, _ByRef_Rtnerrors) { Ftable = _Ftable; ByRef_Rtnerrors = _ByRef_Rtnerrors }))) return exit(false);

                // If this is a new record get a default primary key value (or set one here in code)
                if (Newrecord) {
                    if (HasTag(Row, '')) ByRef_Pkid = Row['']; else { ByRef_Rtnerrors = 'No default set for new row\'s primary key '; return exit(false); }
                    if (await JSB_ODB_WRITEJSON(Row, Ftable, ByRef_Pkid)); else { gotoLabel = "ERRWRITE"; continue atgoto; }
                } else {
                    if (HasTag(Row, 'isA_CrlF_TextFile')) {
                        var Supdatedrow = '';
                        if (await JSB_ODB_READ(Supdatedrow, Ftable, ByRef_Pkid, function (_Supdatedrow) { Supdatedrow = _Supdatedrow })); else Supdatedrow = '';
                        if (await JSB_ODB_WRITE(Supdatedrow, Ftable, ByRef_Pkid)); else { gotoLabel = "ERRWRITE"; continue atgoto; }
                    } else {
                        var Updatedrow = undefined, Tag = '';
                        if (await JSB_ODB_READJSON(Updatedrow, Ftable, ByRef_Pkid, function (_Updatedrow) { Updatedrow = _Updatedrow })); else { Updatedrow = {} }
                        for (Tag of iterateOver(Row)) {
                            if (LCase(Tag) != 'ItemID') Updatedrow[Tag] = Row[Tag];
                        }
                        if (await JSB_ODB_WRITEJSON(Updatedrow, Ftable, ByRef_Pkid)); else { gotoLabel = "ERRWRITE"; continue atgoto; }
                    }
                }

                // Alert("Record Saved", False)
                return exit(true);


            case "ERRWRITE":

                if (Newrecord) {
                    ByRef_Pkid = ''; // Restore To New Record;
                }
                ByRef_Rtnerrors = activeProcess.At_Errors;
                await JSB_BF_LOGERR(ByRef_Rtnerrors);
                return exit(false);


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </VIEW_EXCELUPLOAD_WRITEROW>

// <WEBSITEMODEL_Sub>
async function JSB_MDL_WEBSITEMODEL_Sub() {
    // %options aspxC-
}
// </WEBSITEMODEL_Sub>

// <WEBSITESECURITY_Pgm>
async function JSB_MDL_WEBSITESECURITY_Pgm() {  // PROGRAM
    Commons_JSB_MDL = {};
    Equates_JSB_MDL = {};

    // local variables
    var Projectname, Frompage, Sentence, F, Sl, Pages, Choices;
    var Pagename, Page, R, Pn, B, Updatethemenus, Values, V, P;

    // %options aspxC-
    if (Not(isAdmin())) return Stop('You must be an administrator to run this command');

    Projectname = paramVar('ProjectName');
    Frompage = paramVar('fromPage');

    // If ProjectName = "" And !Len(@ParamVars) Then  
    if (isEmpty(Projectname)) {
        Sentence = Field(activeProcess.At_Sentence, '(', 1);
        Projectname = Field(Sentence, ' ', 2);
    }
    if (isEmpty(Projectname)) Projectname = 'cs';

    if (await JSB_ODB_OPEN('dict', CStr(Projectname), F, function (_F) { F = _F })); else return Stop(activeProcess.At_Errors);
    if (await JSB_ODB_SELECTTO(CStr(undefined), F, 'ItemID like \'%.page\'', Sl, function (_Sl) { Sl = _Sl })); else return Stop(activeProcess.At_Errors);
    Pages = getList(Sl);

    Choices = [undefined, 'Admin', 'Director', 'Manager', 'Clerk', 'Employee', 'User', 'Anonymous', '\<delete\>'];

    Println(At(-1), 'Web site Security for ', Projectname);
    Println();
    Println('Choose the mimimum level of security for each page');
    Println();
    Print(html('\<div class="container"\>'));
    for (Pagename of iterateOver(Pages)) {
        if (await JSB_ODB_READJSON(Page, F, CStr(Pagename), function (_Page) { Page = _Page })); else return Stop(activeProcess.At_Errors);
        R = Page.minimumRole;
        if (Locate(R, Choices, 0, 0, 0, "", position => { })); else R = 'Anonymous';
        Pn = dropIfRight(CStr(Pagename), '.page', true);
        Print(lblCtlSet(CStr(Pn), JSB_HTML_RADIOBTNS(CStr(Pn), Choices, CStr(R)), CStr(Pn), true));
    }
    Println(html('\</div\>')); // Container
    Println();
    Print(JSB_HTML_SAVEBTN('btn', 'Save'), JSB_HTML_SAVEBTN('btn', 'Cancel'));

    await At_Server.asyncPause(me);
    Print(At(-1));
    B = formVar('btn');
    Updatethemenus = false;

    if (B == 'Save') {
        Values = {};
        for (Pagename of iterateOver(Pages)) {
            Pn = dropIfRight(CStr(Pagename), '.page', true);
            Values[Pn] = formVar(Pn);
        }

        for (Pagename of iterateOver(Pages)) {
            Pn = dropIfRight(CStr(Pagename), '.page');
            Pagename = CStr(Pn) + '.page';
            V = Values[Pn];
            if (CBool(V)) {
                if (V == '\<delete\>') {
                    if (Not(await JSB_MDL_DELETEPAGEMODEL(Projectname, Pagename, function (_Projectname, _Pagename) { Projectname = _Projectname; Pagename = _Pagename }))) Alert(CStr(activeProcess.At_Errors));
                    Updatethemenus = true;;
                } else {
                    if (await JSB_ODB_READJSON(P, F, CStr(Pagename), function (_P) { P = _P })); else return Stop(activeProcess.At_Errors);
                    R = P.minimumRole;
                    if (Locate(R, Choices, 0, 0, 0, "", position => { })); else R = 'Anonymous';
                    if (Null0(R) != Null0(V)) {
                        P.minimumRole = V;
                        if (await JSB_ODB_WRITEJSON(P, F, CStr(Pagename))); else return Stop(At(-1), 'WebSiteSecurity-', System(28), ': ', activeProcess.At_Errors);

                        Println('Regenerating ', Pagename); FlushHTML();
                        await JSB_MDL_REGENPAGEMODEL_Sub(Projectname, Pagename, false);
                        Updatethemenus = true;
                    }
                }
            }
        }
    }

    if (CBool(Updatethemenus)) await JSB_MDL_UPDATEMENU_Sub(CStr(Projectname));
    if (CBool(Frompage)) return At_Response.Redirect(Frompage);
    return;
}
// </WEBSITESECURITY_Pgm>