
// <CTL_AUTOTEXTBOX_Sub>
async function JSB_CTLS_CTL_AUTOTEXTBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    var W = '';
    var Mobilepad = '';
    var Dftval = '';
    var Values = '';
    var Defaultvalue = '';

    if (CBool(Column.canedit)) {
        if (Dokobinding) {
            Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes);

            if (CBool(Column.includeurl) && CBool(Column.arrayname)) {
                W = Column.arrayname;
            } else if (CBool(Column.reffile)) {
                W = jsEscapeString(await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row }));
            } else {
                W = jsEscapeString(CStr(Column.reflist));
            }

            Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, 'window.autoCompleteTextBox($element, `:w:`, `:Val(column.minLength):`, null, `:Val(Column.restrict2List):`)', '');

            Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
            Id = '';
        }

        Mobilepad = Column.mobilepad;
        if (Mobilepad) {
            if (Mobilepad == 'custom') {
                Mobilepad = Column.custompad;
                if (Left(Mobilepad, 2) != '[[' || Right(Mobilepad, 2) != ']]') Println('Your ', Viewname, ' ', Id, ' field has has a malformed custom pad: ', Mobilepad);
            } else {
                if (Column.datatype == 'integer') {
                    if (Locate(Mobilepad, [undefined, 'integer', 'integer+', ''], 0, 0, 0, "", position => { })); else Println('Your ', Viewname, ' ', Id, ' field has an integer datatype and your are using a non-integer keyboard: ', Mobilepad);
                    Additionalattributes = JSB_BF_MERGEATTRIBUTE('type', 'number', ';', Additionalattributes);
                } else if (Column.datatype == 'double') {
                    if (Locate(Mobilepad, [undefined, 'real', 'integer', 'integer+', ''], 0, 0, 0, "", position => { })); else Println('Your ', Viewname, ' ', Id, ' field has an double datatype and your are using a non-integer keyboard: ', Mobilepad);
                }
            }

            Additionalattributes = JSB_BF_MERGEATTRIBUTE('mobilepad', Mobilepad, ';', Additionalattributes);
        }

        if (Gencode) {
            if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';
            if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));

            if (CBool(Column.includeurl) && CBool(Column.arrayname)) {
                ByRef_Html = 'ctlHtml = @jsb_html.AutoTextBoxIncludeURL("' + Id + '", "' + CStr(Column.includeurl) + '", "' + CStr(Column.arrayname) + '", ' + Dftval + ', ' + CStr(CNum(Column.minLength)) + ', ' + CStr(Additionalattributes) + ', ' + CStr(Not(Column.noSubValues)) + ', ' + CStr(CNum(Column.restrict2List)) + ')'; // 9 Parameters;
            } else if (CBool(Column.reffile)) {
                ByRef_Html = ' ctlHtml = @jsb_html.autoTextBox("' + Id + '", @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align == 'right')) + ', ' + CStr(CNum(Column.oktocache)) + '), ' + Dftval + ', ' + CStr(CNum(Column.minLength)) + ', ' + CStr(Additionalattributes) + ', ' + CStr(Not(Column.noSubValues)) + ', ' + CStr(CNum(Column.restrict2List)) + ')'; // 8 Parameters;
            } else {
                ByRef_Html = ' ctlHtml = @jsb_html.autoTextBox("' + Id + '", ' + jsEscapeString(CStr(Column.reflist)) + ', ' + Dftval + ', ' + CStr(CNum(Column.minLength)) + ', ' + CStr(Additionalattributes) + ', ' + CStr(Not(Column.noSubValues)) + ', ' + CStr(CNum(Column.restrict2List)) + ')';
            }

            if (CBool(Column.autopostback) && Id) { ByRef_Html += crlf + 'ctlHtml := @Script(' + Chr(96) + '$(\'#' + Id + '\').change(function() { doJsbSubmit() });' + Chr(96) + ')'; }
        } else {
            Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row });
            if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

            if (CBool(Column.includeurl) && CBool(Column.arrayname)) {
                ByRef_Html = AutoTextBoxIncludeURL(Id, Column.includeurl, Column.arrayname, Defaultvalue, CNum(Column.minLength), Additionalattributes, Not(Column.noSubValues), Column.restrict2List);;
            } else {
                ByRef_Html = AutoTextBox(Id, Values, Defaultvalue, CNum(Column.minLength), Additionalattributes, Not(Column.noSubValues), Column.restrict2List);
            }

            if (CBool(Column.autopostback) && Id) { ByRef_Html += JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
        }
    } else {
        // Prevents change
        await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), Id, Column, Row, ByRef_Html, CStr(Dokobinding), Additionalattributes, Gencode, CStr(Viewname), function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
    }
    return exit();
}
// </CTL_AUTOTEXTBOX_Sub>

// <AUTOTEXTBOX_EXTRAMETA_Sub>
async function JSB_CTLS_AUTOTEXTBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({ "name": 'includeurl', "label": 'JS Include Url', "width": 19, "control": 'textbox', "canedit": true, "notblank": false });
    // viewModel.columns.push ({name:'valuefield', label:'Value FieldName', width:19, control:'textbox', canedit:true, notblank: false })
    Viewmodel.columns.push({ "name": 'arrayname', "label": 'JS Array Name', "width": 19, "control": 'textbox', "canedit": true, "notblank": false });
    Viewmodel.columns.push({ "name": 'minLength', "label": 'minLength 4 Popup', "width": 19, "control": 'textbox', "canedit": true, "notblank": false });
    Viewmodel.columns.push({ "name": 'restrict2List', "label": 'restrict2List', "width": 19, "control": 'checkbox', "canedit": true, "defaultvalue": 1, "reflist": 'false,0;true,1' });

    await JSB_CTLS_TEXTBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });

    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });
    return exit();
}
// </AUTOTEXTBOX_EXTRAMETA_Sub>

// <CTL_BUTTON_Sub>
async function JSB_CTLS_CTL_BUTTON_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var _Label = '';
    var Url = '';
    var Onclick = '';
    var Zurl = '';
    var Add = '';
    var Data = '';
    var Onparentjavascript = '';

    if (Dokobinding) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        Id = '';
    }

    _Label = Column.label;
    if (!_Label) _Label = Column.name;
    Url = dropIfRight(CStr(Column.transferurl), '.page');

    if (CBool(Column.height)) { Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'height:"' + CStr(Column.height) + '"', ';', Additionalattributes); }
    Onclick = 'window.eventHandler_' + JSB_BF_NICENAME(CStr(Column.name)) + '(json2string($("#jsb")), "??ItemID??")';
    Additionalattributes = JSB_BF_MERGEATTRIBUTE('onclick', Onclick, ';', Additionalattributes);

    if (Dokobinding) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        Id = '';
    }

    if (Gencode) {
        Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]';
        _Label = '"' + _Label + '"';
        Zurl = '"' + Url + '"';

        if (CBool(Row)) {
            switch (Column.datausuage) {
                case 'As Url':
                    Zurl = Row;

                    break;

                case 'As Parameter':
                    if (InStr1(1, Url, '?')) Add = ('&'); else Add = '?';
                    Zurl = '"' + Url + Add + CStr(Column.onParentExtra) + '=":@UrlEncode(' + CStr(Row) + ')';

                    break;

                case 'As Text':
                    _Label = Row;
            }
        }

        ByRef__Html = 'ctlHtml = @jsb_html.Button("' + Id + '", ' + _Label + ', ' + CStr(Additionalattributes) + ')';
        ByRef__Html += crlf + 'ctlHtml := @genEventHandler("' + JSB_BF_NICENAME(CStr(Column.name)) + '", ' + Zurl + ', ' + CStr(CNum(Column.transferto) + 0) + ', "' + CStr(Column.onParentExtra) + '", ' + CStr(CNum(Column.transferaddfrompage) + 0) + ')';
    } else {
        if (CBool(Row)) {
            Data = Row[Column.name];
            switch (Column.datausuage) {
                case 'As Url':
                    Url = Data;

                    break;

                case 'As Parameter':
                    if (InStr1(1, Url, '?')) Add = ('&'); else Add = '?';
                    Url += Add + CStr(Column.onParentExtra) + '=' + urlEncode(Data);

                    break;

                case 'As Text':
                    _Label = Data;
            }
        }
        Onparentjavascript = genEventHandler(JSB_BF_NICENAME(CStr(Column.name)), Url, CNum(Column.transferto) + 0, CStr(Column.onParentExtra), CNum(Column.transferaddfrompage) + 0);
        ByRef__Html = CStr(Button(Id, _Label, Additionalattributes)) + Onparentjavascript;
    }

    return exit(undefined);
}
// </CTL_BUTTON_Sub>

// <BUTTON_EXTRAMETA_Sub>
async function JSB_CTLS_BUTTON_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({ "name": 'datausuage', "label": 'data Usuage', "width": 19, "control": 'dropdownbox', "canedit": true, "reflist": 'As Url;As Parameter;As Text' });
    Viewmodel.columns.push({ "name": 'transferto', "index": 46, "label": 'Transfer To', "datatype": 'number', "suppresslabel": false, "control": 'dropdownbox', "canedit": true, "notblank": true, "defaultvalue": '10', "reflist": 'new window,1;New Window Tab,2;Tab (name in Transfer Xtra),3;Frame (name in Transfer Xtra),4;Dialog (Title in Transfer Xtra),6;HTTP POST (Transfer Extra becomes formVar Name and contains SelectedID),7;HTTP GET,8;Current Window,10;JavaScript (in Transfer Extra),11;Top Window,12;Back,13;Next Tab,14;Previous Tab,15;Close Window,16;Return Pick Value,17' });
    Viewmodel.columns.push({ "name": 'transferurl', "index": 47, "label": 'Transfer URL', "datatype": 'string', "suppresslabel": false, "control": 'combobox', "canedit": true, "defaultvalue": '', "reffile": 'dict {projectname}', "refpk": 'ItemID', "refwhere": 'ItemID Like \'%.page\'', "pickfunction": 'edp_pick?projectName={projectname}' });
    Viewmodel.columns.push({ "name": 'onParentExtra', "index": 48, "label": 'Transfer Extra', "datatype": 'string', "suppresslabel": false, "control": 'textbox', "canedit": true, "defaultvalue": '' });
    Viewmodel.columns.push({ "name": 'transferaddfrompage', "index": 48, "label": 'add fromPage', "suppresslabel": false, "control": 'checkbox', "canedit": true, "defaultvalue": 1 });
    Viewmodel.columns.push({ "name": 'customcall', "index": 48, "datatype": 'string', "label": 'Custom Routine', "suppresslabel": false, "control": 'textbox', "canedit": true });

    Viewmodel.columns.push({ "name": 'lblInfo', "label": 'Info', "control": 'label', "suppresslabel": true, "fullline": true, "defaultvalue": 'For more button options, use toolbar buttons and make them inline' });
    return exit();
}
// </BUTTON_EXTRAMETA_Sub>

// <CTL_CASCADINGAUTOTEXTBOX_Sub>
async function JSB_CTLS_CTL_CASCADINGAUTOTEXTBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    // local variables
    var Attacheddb, Tablename, Objectmodel, Koid, Jsroutine;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    // See if there is a reffile, and make a json array, or json callback

    var Values = '';
    var Defaultvalue = '';
    var Quotedurl = '';
    var Dftval = '';

    Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row });
    if (!Gencode && !Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

    if (CBool(Column.canedit)) {
        // Column.parentCtlID, QuotedUrl, addBlank
        Quotedurl = Column.customRoutine;
        if (Quotedurl) {
            if (InStr1(1, Viewname, am)) {
                Attacheddb = Field(Viewname, am, 1);
                Tablename = Field(Viewname, am, 2);
            } else {
                if (await JSB_ODB_READJSON(Objectmodel, await JSB_BF_FHANDLE('dict', Projectname), CStr(Viewname), function (_Objectmodel) { Objectmodel = _Objectmodel })); else {
                    Print(); debugger;
                }
                Attacheddb = Objectmodel.attachdb;
                Tablename = Objectmodel.tableName;
            }

            if (InStr1(1, Quotedurl, '?')) Quotedurl += '&'; else Quotedurl += '?';
            Quotedurl += 'arg={id}';
            if (!InStrI1(1, Quotedurl, 'tablename=')) { Quotedurl += '&tableName={tablename}'; }
            if (!InStrI1(1, Quotedurl, 'databasename=')) { Quotedurl += '&databaseName={databasename}'; }
            Quotedurl = ChangeI(Quotedurl, '{tablename}', urlEncode(Tablename));
            Quotedurl = ChangeI(Quotedurl, '{databasename}', urlEncode(Attacheddb));
        }
        Quotedurl = '\'' + Quotedurl + '\'';

        if (Dokobinding) {
            Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
            Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
            Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, CStr(Id) + '_' + CStr(Column.parentCtlID) + '_check', '', false);
            Koid = Id;
            Id = '';
        }

        if (Gencode) {
            if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
            if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';

            ByRef__Html = 'ctlHtml = @jsb_html.cascadingAutoTextBox("' + Id + '", "' + CStr(Column.parentCtlID) + '", "' + Quotedurl + '", ' + Dftval + ', ' + CStr((CNum(Column.minLength) + 0)) + ', ' + CStr(Additionalattributes) + ')';
            if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
        } else {
            ByRef__Html = CascadingAutoTextBox(Id, Column.parentCtlID, Quotedurl, Defaultvalue, Column.minLength, Additionalattributes);
            if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
        }

        if (Dokobinding) {
            // Create a Change routine which will be called on parent changes
            Jsroutine = 'autoCompleteTextBox(childCtl, a /* choiceArray */, ' + CStr(CNum(Column.minLength) + 0) + ', null /* CompanionID */, ' + CStr(CNum(Column.restrictToList) + 0) + ', \'\' /* labelName */, \'\' /* valueName */);';
            ByRef__Html = CStr(ByRef__Html) + JSB_HTML_RELOADDATALISTFROMURL_ONPARENT_CHANGE(CStr(Koid), CStr(Column.parentCtlID), Quotedurl, CStr(Jsroutine));

            // Create a Check routine to setup on KO Load
            ByRef__Html += JSB_HTML_SCRIPT(cascadingAttach2Parent(CStr(Koid), CStr(Column.parentCtlID), true));
        }
    } else {
        // Prevents change
        await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), Id, Column, Row, ByRef__Html, CStr(Dokobinding), Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    }
    return exit();
}
// </CTL_CASCADINGAUTOTEXTBOX_Sub>

// <CASCADINGAUTOTEXTBOX_EXTRAMETA_Sub>
async function JSB_CTLS_CASCADINGAUTOTEXTBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });

    Viewmodel.columns.push({ "name": 'lblRequired', "label": 'Required', "control": 'label', "suppresslabel": true, "fullline": true, "defaultvalue": 'The following fields are required' });
    Viewmodel.columns.push({ "name": 'parentCtlID', "label": 'Parent Control', "control": 'dropDownBox', "canedit": true, "required": true, "notblank": true, "defaultvalue": '', "reffile": '{viewcolumns}' });

    Viewmodel.columns.push({ "name": 'customRoutine', "label": 'CustomRoutine', "control": 'textbox', "canedit": true, "required": true, "notblank": true, "tooltip": 'Place a json function here, or an http call with ?arg={id} for parent argument' });
    Viewmodel.columns.push({ "name": 'minLength', "label": 'minLength 4 Popup', "width": 19, "control": 'textbox', "canedit": true, "notblank": false });
    return exit();
}
// </CASCADINGAUTOTEXTBOX_EXTRAMETA_Sub>

// <CTL_CASCADINGCOMBOBOX_Sub>
async function JSB_CTLS_CTL_CASCADINGCOMBOBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    // local variables
    var Attacheddb, Tablename, Objectmodel, Koid, Jsroutine;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Values = '';
    var Defaultvalue = '';
    var Quotedurl = '';
    var Dftval = '';

    Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row });
    if (!Gencode && !Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

    if (CBool(Column.canedit)) {
        Quotedurl = Column.customRoutine;
        if (Quotedurl) {
            if (InStr1(1, Viewname, am)) {
                Attacheddb = Field(Viewname, am, 1);
                Tablename = Field(Viewname, am, 2);
            } else {
                if (await JSB_ODB_READJSON(Objectmodel, await JSB_BF_FHANDLE('dict', Projectname), CStr(Viewname), function (_Objectmodel) { Objectmodel = _Objectmodel })); else {
                    Print(); debugger;
                }
                Attacheddb = Objectmodel.attachdb;
                Tablename = Objectmodel.tableName;
            }

            if (InStr1(1, Quotedurl, '?')) Quotedurl += '&'; else Quotedurl += '?';
            Quotedurl += 'arg={id}';
            if (!InStrI1(1, Quotedurl, 'tablename=')) { Quotedurl += '&tableName={tablename}'; }
            if (!InStrI1(1, Quotedurl, 'databasename=')) { Quotedurl += '&databaseName={databasename}'; }
            Quotedurl = ChangeI(Quotedurl, '{tablename}', urlEncode(Tablename));
            Quotedurl = ChangeI(Quotedurl, '{databasename}', urlEncode(Attacheddb));
        }
        Quotedurl = '\'' + Quotedurl + '\'';

        if (Dokobinding) {
            Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
            Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
            Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', true, CStr(Id) + '_' + CStr(Column.parentCtlID) + '_check', '', false);
            Koid = Id;
            Id = '';
        }

        if (Gencode) {
            if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
            if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';

            ByRef__Html = 'ctlHtml = @jsb_html.cascadingComboBox("' + Id + '", "' + CStr(Column.parentCtlID) + '", "' + Quotedurl + '", ' + Dftval + ' /* default val */, ' + CStr((CNum(Column.addBlank) + 0)) + ' /* add blank */, "' + CStr(Column.descriptionField) + '", "' + CStr(Column.valueField) + '", ' + CStr(Additionalattributes) + ')';
            if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
        } else {
            ByRef__Html = CascadingComboBox(Id, Column.parentCtlID, Quotedurl, Defaultvalue, Column.addBlank, Column.descriptionField, Column.valueField, Additionalattributes);
            if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
        }

        if (Dokobinding) {
            // Create a Change routine which will be called on parent changes
            Jsroutine = 'loadOptions(childCtl, a /* choiceArray */, "' + CStr(Column.valueField) + '" /* valueField */, "' + CStr(Column.descriptionField) + '" /* descriptionField */, ' + CStr(CNum(Column.addBlank) + 0) + ' /* add Blank */, null /* defaultValue */, "" /* subdel */, !firstLoad);';
            ByRef__Html = CStr(ByRef__Html) + JSB_HTML_RELOADDATALISTFROMURL_ONPARENT_CHANGE(CStr(Koid), CStr(Column.parentCtlID), Quotedurl, CStr(Jsroutine));

            // Create a Check routine to setup on KO Load
            ByRef__Html += JSB_HTML_SCRIPT(cascadingAttach2Parent(CStr(Koid), CStr(Column.parentCtlID), Dokobinding));
        }
    } else {
        // Prevents change
        await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), Id, Column, Row, ByRef__Html, CStr(Dokobinding), Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    }
    return exit();
}
// </CTL_CASCADINGCOMBOBOX_Sub>

// <CASCADINGCOMBOBOX_EXTRAMETA_Sub>
async function JSB_CTLS_CASCADINGCOMBOBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });

    Viewmodel.columns.push({ "name": 'autopostback', "label": 'Auto PostBack', "control": 'checkbox', "canedit": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });

    // *******************************************************************************************************************************************
    Viewmodel.columns.push({ "name": 'lblRequired', "label": 'Required', "control": 'label', "suppresslabel": true, "fullline": true, "defaultvalue": 'The following fields are required' });
    // *******************************************************************************************************************************************

    Viewmodel.columns.push({ "name": 'parentCtlID', "label": 'Parent Control', "control": 'dropDownBox', "canedit": true, "required": true, "notblank": true, "defaultvalue": '', "reffile": '{viewcolumns}' });

    Viewmodel.columns.push({ "name": 'customRoutine', "label": 'CustomRoutine', "control": 'textbox', "canedit": true, "required": true, "notblank": true, "tooltip": 'Place a json function here, or an http call with ?arg={id} for parent argument' });
    Viewmodel.columns.push({ "name": 'descriptionField', "label": 'descriptionField', "control": 'textbox', "canedit": true, "tooltip": 'Place a json field name here' });
    Viewmodel.columns.push({ "name": 'valueField', "label": 'valueField', "control": 'textbox', "canedit": true, "tooltip": 'Place a json field name here' });
    return exit();
}
// </CASCADINGCOMBOBOX_EXTRAMETA_Sub>

// <CTL_CASCADINGDROPDOWNBOX_Sub>
async function JSB_CTLS_CTL_CASCADINGDROPDOWNBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    // local variables
    var Attacheddb, Tablename, Objectmodel, Koid, Jsroutine;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Values = '';
    var Defaultvalue = '';
    var Quotedurl = '';
    var Dftval = '';

    Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row });
    if (!Gencode && !Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

    if (CBool(Column.canedit)) {
        Quotedurl = Column.customRoutine;
        if (Quotedurl) {
            if (InStr1(1, Viewname, am)) {
                Attacheddb = Field(Viewname, am, 1);
                Tablename = Field(Viewname, am, 2);
            } else {
                if (await JSB_ODB_READJSON(Objectmodel, await JSB_BF_FHANDLE('dict', Projectname), CStr(Viewname), function (_Objectmodel) { Objectmodel = _Objectmodel })); else {
                    Print(); debugger;
                }
                Attacheddb = Objectmodel.attachdb;
                Tablename = Objectmodel.tableName;
            }

            if (InStr1(1, Quotedurl, '?')) Quotedurl += '&'; else Quotedurl += '?';
            Quotedurl += 'arg={id}';
            if (!InStrI1(1, Quotedurl, 'tablename=')) { Quotedurl += '&tableName={tablename}'; }
            if (!InStrI1(1, Quotedurl, 'databasename=')) { Quotedurl += '&databaseName={databasename}'; }
            Quotedurl = ChangeI(Quotedurl, '{tablename}', urlEncode(Tablename));
            Quotedurl = ChangeI(Quotedurl, '{databasename}', urlEncode(Attacheddb));
        }
        Quotedurl = '\'' + Quotedurl + '\'';

        if (Dokobinding) {
            Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
            Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
            Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', true, CStr(Id) + '_' + CStr(Column.parentCtlID) + '_check', '', false);
            Koid = Id;
            Id = '';
        }

        if (Gencode) {
            if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
            if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';
            ByRef__Html = 'ctlHtml = @jsb_html.cascadingDropDownBox("' + Id + '", "' + CStr(Column.parentCtlID) + '", "' + Quotedurl + '", ' + CStr((CNum(Column.addBlank) + 0)) + ' /* add blank */, ' + Dftval + ' /* default val */, ' + CStr(Additionalattributes) + ', "' + CStr(Column.descriptionField) + '", "' + CStr(Column.valueField) + '")';
            if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
        } else {
            ByRef__Html = cascadingDropDownBox(Id, Column.parentCtlID, Quotedurl, Column.addBlank, Defaultvalue, Additionalattributes, Column.descriptionField, Column.valueField);
            if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
        }

        if (Dokobinding) {
            // Create a Change routine which will be called on parent changes
            Jsroutine = 'loadOptions(childCtl, a /* choiceArray */, "' + CStr(Column.valueField) + '" /* valueField */, "' + CStr(Column.descriptionField) + '" /* descriptionField */, ' + CStr(CNum(Column.addBlank) + 0) + ' /* add Blank */, null /* defaultValue */, "" /* subdel */, !firstLoad);';
            ByRef__Html = CStr(ByRef__Html) + JSB_HTML_RELOADDATALISTFROMURL_ONPARENT_CHANGE(CStr(Koid), CStr(Column.parentCtlID), Quotedurl, CStr(Jsroutine));

            // Create a Check routine to setup on KO Load
            ByRef__Html += JSB_HTML_SCRIPT(cascadingAttach2Parent(CStr(Koid), CStr(Column.parentCtlID), true));
        }
    } else {
        // Prevents change
        await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), Id, Column, Row, ByRef__Html, CStr(Dokobinding), Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    }
    return exit();
}
// </CTL_CASCADINGDROPDOWNBOX_Sub>

// <CASCADINGDROPDOWNBOX_EXTRAMETA_Sub>
async function JSB_CTLS_CASCADINGDROPDOWNBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });

    Viewmodel.columns.push({ "name": 'autopostback', "label": 'Auto PostBack', "control": 'checkbox', "canedit": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });

    // *******************************************************************************************************************************************
    Viewmodel.columns.push({ "name": 'lblRequired', "label": 'Required', "control": 'label', "suppresslabel": true, "fullline": true, "defaultvalue": 'The following fields are required' });
    // *******************************************************************************************************************************************

    Viewmodel.columns.push({ "name": 'parentCtlID', "label": 'Parent Control', "control": 'dropDownBox', "canedit": true, "required": true, "notblank": true, "defaultvalue": '', "reffile": '{viewcolumns}' });
    Viewmodel.columns.push({ "name": 'descriptionField', "label": 'descriptionField', "control": 'textbox', "canedit": true, "tooltip": 'Place a json field name here' });
    Viewmodel.columns.push({ "name": 'valueField', "label": 'valueField', "control": 'textbox', "canedit": true, "tooltip": 'Place a json field name here' });

    Viewmodel.columns.push({ "name": 'customRoutine', "label": 'CustomRoutine', "control": 'textbox', "canedit": true, "required": true, "notblank": true, "tooltip": 'Place a json function here, or an http call with ?arg={id} for parent argument' });
    return exit();
}
// </CASCADINGDROPDOWNBOX_EXTRAMETA_Sub>

// <CTL_CHECKBOX_Sub>
async function JSB_CTLS_CTL_CHECKBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Dftval = '';
    var Defaultvalue = '';
    var Ischecked = '';

    if (Not(Column.canedit)) Additionalattributes[Additionalattributes.length] = 'disabled';

    if (Dokobinding) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
        // AdditionalAttributes[-1] = `data-bind="checked:$data['`:Column.name:`'], checked:$data['`:Column.name:`']?$data['`:Column.name:`']:`:IFF(Column.defaultvalue, Column.defaultvalue, 0):`"` 
        Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'checked', true, '', '');
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        Id = '';
    }

    if (Gencode) {
        if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '\'\'';
        if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
        ByRef__Html = 'ctlHtml = @jsb_html.CheckBox(\'' + Id + '\', True, "", Val(' + Dftval + '), ' + CStr(Additionalattributes) + ')';
        if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
    } else {
        if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

        if (CNum(Defaultvalue)) Ischecked = true;
        ByRef__Html = CHECKBOX(Id, true, '', Ischecked, Additionalattributes);

        if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
    }
    return exit();
}
// </CTL_CHECKBOX_Sub>

// <CTL_COLORPICKER_Sub>
async function JSB_CTLS_CTL_COLORPICKER_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Dftval = '';
    var Defaultvalue = '';

    if (CBool(Column.canedit)) {
        if (Dokobinding) {
            Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
            // AdditionalAttributes[-1] = `data-bind="value:$data['`:Column.name:`'], value:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"`  
            Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, '', '');
            Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
            Id = '';
        }

        // Return attributes for a FORM ColorPicker 
        if (Gencode) {
            if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
            if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';
            ByRef__Html = 'ctlHtml = @jsb_html.ColorPicker("' + Id + '", ' + Dftval + ', False, ' + CStr(Dokobinding + 0) + ', ' + CStr(Additionalattributes) + ')';
            if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
        } else {
            if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));
            ByRef__Html = Colorpicker(Id, Defaultvalue, false, Dokobinding, Additionalattributes);
            if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
        }
    } else {
        // Prevents change
        await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), Id, Column, Row, ByRef__Html, CStr(Dokobinding), Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    }

    return exit(undefined);

    // *********************** CTLS *****************************
    return exit();
}
// </CTL_COLORPICKER_Sub>

// <COLORPICKER_EXTRAMETA_Sub>
async function JSB_CTLS_COLORPICKER_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });

    Viewmodel.columns.push({ "name": 'autopostback', "label": 'Auto PostBack', "width": 19, "control": 'checkbox', "canedit": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });
    return exit();
}
// </COLORPICKER_EXTRAMETA_Sub>

// <CTL_COMBOBOX_Sub>
async function JSB_CTLS_CTL_COMBOBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    // See if there is a reffile, and make a json array, or json callback

    var Multiselections = undefined;
    var Mobilepad = '';
    var Dftval = '';
    var Defaultvalue = '';
    var Values = '';

    if (CBool(Column.canedit)) {
        Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes); // Force JSON to array
        Additionalattributes[Additionalattributes.length] = 'autocomplete=\'off\'';
        Multiselections = Column.multiselections;
        if (Multiselections) Multiselections = 99; else Multiselections = 1;

        if (Dokobinding) {
            if (CBool(Column.includeurl) && CBool(Column.arrayname)) {
                Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, 'koUrlComboBoxLoad', CStr(CNum(Column.addBlank) + 0) + ', ' + 'window.' + CStr(Column.arrayname) + ', ' + 'window.' + CStr(Column.arrayname) + ', ' + 'window.' + CStr(Column.arrayname) + ', ' + CStr(Multiselections));
            } else {
                Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, 'koComboBoxLoad', CStr(CNum(Column.addBlank) + 0) + ',\'' + htmlEscape(Column.valueField) + '\', \'' + htmlEscape(Column.descriptionField) + '\', ' + CStr(CNum(Column.multiValuedData)) + ', ' + CStr(Multiselections));
            }
            Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
            Id = '';
        }

        Mobilepad = Column.mobilepad;
        if (Mobilepad) {
            if (Mobilepad == 'custom') {
                Mobilepad = Column.custompad;
                if (Left(Mobilepad, 2) != '[[' || Right(Mobilepad, 2) != ']]') Println('Your ', Viewname, ' ', Id, ' field has has a malformed custom pad: ', Mobilepad);
            } else {
                if (Column.datatype == 'integer') {
                    if (Locate(Mobilepad, [undefined, 'integer', 'integer+', ''], 0, 0, 0, "", position => { })); else Println('Your ', Viewname, ' ', Id, ' field has an integer datatype and your are using a non-integer keyboard: ', Mobilepad);
                    Additionalattributes = JSB_BF_MERGEATTRIBUTE('type', 'number', ';', Additionalattributes);
                } else if (Column.datatype == 'double') {
                    if (Locate(Mobilepad, [undefined, 'real', 'integer', 'integer+', ''], 0, 0, 0, "", position => { })); else Println('Your ', Viewname, ' ', Id, ' field has an double datatype and your are using a non-integer keyboard: ', Mobilepad);
                }
            }

            Additionalattributes = JSB_BF_MERGEATTRIBUTE('mobilepad', Mobilepad, ';', Additionalattributes);
        }

        if (Gencode) {
            Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]';
            if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));

            if (CBool(Column.includeurl) && CBool(Column.arrayname)) {
                ByRef__Html = 'ctlHtml = @jsb_html.ComboBoxIncludeURL("' + Id + '", "' + CStr(Column.includeurl) + '", "' + CStr(Column.arrayname) + '", ' + Dftval + ', "' + CStr(CNum(Column.addBlank) + 0) + ' /* addBlank */, ' + CStr(Column.valueField) + '", "' + CStr(Column.descriptionField) + '", ' + CStr(Additionalattributes) + ', ' + CStr(CNum(Column.multiValuedData)) + ' /* multiValuedData */, ' + CStr(Multiselections) + ' /* multiselections */)';
            } else if (CBool(Column.reffile)) {
                ByRef__Html = 'ctlHtml = @jsb_html.ComboBox("' + Id + '", @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align == 'right')) + ', ' + CStr(CNum(Column.oktocache)) + '), ' + Dftval + ', ' + CStr(CNum(Column.addBlank) + 0) + ' /* addBlank */, "' + CStr(Column.descriptionField) + '", "' + CStr(Column.valueField) + '", ' + CStr(Additionalattributes) + ', ' + CStr(CNum(Column.multiValuedData)) + ' /* multiValuedData */, ' + CStr(Multiselections) + ' /* multiselections */)';
            } else {
                ByRef__Html = 'ctlHtml = @jsb_html.ComboBox("' + Id + '", "' + Change(Column.reflist, '"', '\\"') + '", ' + Dftval + ', ' + CStr(CNum(Column.addBlank) + 0) + ' /* addBlank */, "' + CStr(Column.descriptionField) + '", "' + CStr(Column.valueField) + '", ' + CStr(Additionalattributes) + ', ' + CStr(CNum(Column.multiValuedData)) + ' /* multiValuedData */, ' + CStr(Multiselections) + ' /* multiselections */)';
            }

            if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
        } else {
            if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

            Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row });

            if (CBool(Column.includeurl) && CBool(Column.arrayname)) {
                ByRef__Html = ComboBoxIncludeURL(Id, Column.includeurl, Column.arrayname, Defaultvalue, Column.addBlank, Column.descriptionField, Column.valueField, Additionalattributes, Column.multiValuedData, Multiselections);
            } else if (CBool(Column.reffile)) {
                ByRef__Html = ComboBox(Id, Values, Defaultvalue, Column.addBlank, Column.descriptionField, Column.valueField, Additionalattributes, Column.multiValuedData, Multiselections);
            } else {
                ByRef__Html = (ComboBox(Id, Values, Defaultvalue, Column.addBlank, Column.descriptionField, Column.valueField, Additionalattributes, CBool(Column.multiValuedData) || !isEmpty(Column.reflist), Multiselections));
            }

            if (CBool(Column.autopostback) && Id) { ByRef__Html += JSB_HTML_SCRIPT('$("#' + Id + '").change(function() { doJsbSubmit() }) '); }
        }
    } else {
        // Prevents change
        await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), Id, Column, Row, ByRef__Html, CStr(Dokobinding), Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    }
    return exit();
}
// </CTL_COMBOBOX_Sub>

// <COMBOBOX_EXTRAMETA_Sub>
async function JSB_CTLS_COMBOBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });

    Viewmodel.columns.push({ "name": 'autopostback', "label": 'Auto PostBack', "width": 19, "control": 'checkbox', "canedit": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });
    Viewmodel.columns.push({ "name": 'multiselections', "label": 'Multiple Selections', "width": 19, "control": 'checkbox', "canedit": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });
    Viewmodel.columns.push({ "name": 'includeurl', "label": 'JS Include Url', "width": 19, "control": 'textbox', "canedit": true, "notblank": false });
    Viewmodel.columns.push({ "name": 'arrayname', "label": 'JS Array Name', "width": 19, "control": 'textbox', "canedit": true, "notblank": false });

    await JSB_CTLS_TEXTBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });
    return exit();
}
// </COMBOBOX_EXTRAMETA_Sub>

// <CTL_DATEBOX_Sub>
async function JSB_CTLS_CTL_DATEBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Onload = '';
    var Dftval = '';
    var Defaultvalue = '';

    if (CBool(Column.canedit)) {
        if (Dokobinding) {
            Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
            Onload = ' window.datebox_onload($element, \'' + CStr(Column.yearRange) + '\')';
            Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, Onload, undefined);
            Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
            Id = '';
        }

        Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes);

        if (Gencode) {
            if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
            if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';
            ByRef__Html = 'ctlHtml = @jsb_html.DateBox("' + Id + '", ' + Dftval + ', ' + CStr(Not(Column.canedit)) + ', ' + CStr(Additionalattributes) + ', \'' + CStr(Column.yearRange) + '\')';
            if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
        } else {
            if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));
            ByRef__Html = DATEBOX(Id, Defaultvalue, Not(Column.canedit), Additionalattributes, Column.yearRange);
            if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
        }
    } else {
        await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), Id, Column, Row, ByRef__Html, CStr(Dokobinding), Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    }

    return exit(undefined);
}
// </CTL_DATEBOX_Sub>

// <DATEBOX_EXTRAMETA_Sub>
async function JSB_CTLS_DATEBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({ "name": 'yearRange', "label": 'Year Range', "width": 19, "control": 'textbox', "canedit": true, "defaultvalue": '-99:+1', "tooltip": '-years:+years' });
    return exit();
}
// </DATEBOX_EXTRAMETA_Sub>

// <CTL_DATETIMEBOX_Sub>
async function JSB_CTLS_CTL_DATETIMEBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    await JSB_CTLS_CTL_DATEBOX_Sub(CStr(Projectname), CStr(Id), Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    return exit();
}
// </CTL_DATETIMEBOX_Sub>

// <CTL_DOWNLOADLINK_Sub>
async function JSB_CTLS_CTL_DOWNLOADLINK_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    // local variables
    var Aa;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Dftval = '';
    var Defaultvalue = '';

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'width: 100%', ';', Additionalattributes);
    Additionalattributes[Additionalattributes.length] = 'target="_blank"';

    if (Dokobinding) {
        // AdditionalAttributes[-1] = `data-bind="attr: {href:'`:@htmlRoot:'uploads/':`' + $data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'()}},text: $data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"` 
        Aa = 'data-bind="attr: {href:\'' + HtmlRoot() + 'uploads/' + '\' + $data[\'' + CStr(Column.name) + '\']?$data[\'' + CStr(Column.name) + '\']:\'' + CStr(Column.defaultvalue) + '\'()}';
        Aa += ',text: $data[\'' + CStr(Column.name) + '\']?$data[\'' + CStr(Column.name) + '\']:\'' + CStr(Column.defaultvalue) + '\'';
        Aa += ', attr: {id: \'KO_' + JSB_BF_NICENAME(CStr(Column.name)) + '_\' + $index()}"';
        Additionalattributes[Additionalattributes.length] = Aa;
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        Id = '';
    }

    if (Gencode) {
        if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';
        if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
        ByRef__Html = [undefined, 'Url = ' + Dftval];
        ByRef__Html[ByRef__Html.length] = 'If Left(Url, 4) \<\> "http" Then Url = @htmlRoot:\'uploads/\':Url';
        ByRef__Html[ByRef__Html.length] = 'ctlHtml = @Anchor(\'' + Id + '\', Url, Url, ' + CStr(Additionalattributes) + ')';
    } else {
        if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));
        ByRef__Html = Anchor(Id, HtmlRoot() + 'uploads/' + Defaultvalue, Defaultvalue, Additionalattributes);
    }

    return exit(undefined);
}
// </CTL_DOWNLOADLINK_Sub>

// <DOWNLOADLINK_EXTRAMETA_Sub>
async function JSB_CTLS_DOWNLOADLINK_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    // viewModel.columns.push ({name:'linecnt', label:'Lines', width:19, control:'textbox', canedit:true, default: 1 })
    return exit();
}
// </DOWNLOADLINK_EXTRAMETA_Sub>

// <CTL_DROPDOWNBOX_Sub>
async function JSB_CTLS_CTL_DROPDOWNBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    // local variables
    var Quotedurl, Attacheddb, Tablename, Objectmodel;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Dftval = '';
    var Defaultvalue = '';
    var Values = '';

    if (Not(Column.canedit)) {
        await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), CStr(Id), Column, Row, ByRef__Html, CStr(Dokobinding), Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
        return exit(undefined);
    }

    Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes);

    if (Dokobinding) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
        // AdditionalAttributes[-1] = `data-bind="addIfNotInList: {}, value:$data['`:Column.name:`'], value:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"`  
        Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', true, '', undefined);
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        Id = '';
    }

    if (Gencode) {
        ByRef__Html = [undefined,];
        if (Dokobinding) Dftval = 'null'; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
        if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '\'\'';

        if (CBool(Column.includeurl) && CBool(Column.arrayname)) {
            ByRef__Html[ByRef__Html.length] = 'ctlHtml = @jsb_html.DropDownBoxIncludeURL("' + Id + '", "' + CStr(Column.includeurl) + '", "' + CStr(Column.arrayname) + '", ' + Dftval + ', ' + CStr(CNum(Column.addBlank) + 0) + ' /* addBlank */, False /* readOnly */, ' + CStr(Additionalattributes) + ', ' + CStr(Column.multiValuedData) + ' /* multiValuedData */)';;
        } else if (CBool(Column.customRoutine)) {
            Quotedurl = Column.customRoutine;
            if (InStr1(1, Viewname, am)) {
                Attacheddb = Field(Viewname, am, 1);
                Tablename = Field(Viewname, am, 2);
            } else {
                if (await JSB_ODB_READJSON(Objectmodel, await JSB_BF_FHANDLE('dict', Projectname), CStr(Viewname), function (_Objectmodel) { Objectmodel = _Objectmodel })); else {
                    Print(); debugger;
                }
                Attacheddb = Objectmodel.attachdb;
                Tablename = Objectmodel.tableName;
            }

            if (InStr1(1, Quotedurl, '?')) Quotedurl += '&'; else Quotedurl += '?';
            Quotedurl += 'arg={id}';
            if (!InStrI1(1, Quotedurl, 'tablename=')) { Quotedurl += '&tableName={tablename}'; }
            if (!InStrI1(1, Quotedurl, 'databasename=')) { Quotedurl += '&databaseName={attachedDB}'; }
            Quotedurl = ChangeI(Quotedurl, '{tablename}', urlEncode(Tablename));
            Quotedurl = ChangeI(Quotedurl, '{databasename}', urlEncode(Tablename));
            Quotedurl = '\'' + CStr(Quotedurl) + '\'';

            ByRef__Html = 'ctlHtml = @jsb_html.DropDownBoxAJAX("' + Id + '", ' + CStr(Quotedurl) + ', ' + Dftval + ' /* default val */, ' + CStr((CNum(Column.addBlank) + 0)) + ' /* add blank */, False /* ReadOnly */, ' + CStr(Additionalattributes) + ', True /* Multivalued data */, "' + CStr(Column.descriptionField) + '", "' + CStr(Column.valueField) + '")';;
        } else if (CBool(Column.reffile)) {
            ByRef__Html[ByRef__Html.length] = 'Dim refList As Array = @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align == 'right')) + ', ' + CStr(CNum(Column.oktocache)) + ')';
            ByRef__Html[ByRef__Html.length] = 'If refList Then';
            ByRef__Html[ByRef__Html.length] = '   ctlHtml = @jsb_html.DropDownBox("' + Id + '", refList, ' + Dftval + ', ' + CStr(CNum(Column.addBlank) + 0) + ' /* addBlank */, False /* readOnly */, ' + CStr(Additionalattributes) + ', ' + CStr(Column.multiValuedData) + ' /* multiValuedData */)';
            ByRef__Html[ByRef__Html.length] = 'Else';
            ByRef__Html[ByRef__Html.length] = '   ctlHtml = \'no ref list\'';
            ByRef__Html[ByRef__Html.length] = 'End If';;
        } else if (CBool(Column.reflist)) {
            ByRef__Html[ByRef__Html.length] = 'ctlHtml = @jsb_html.DropDownBox("' + Id + '", "' + Change(Column.reflist, '"', '\\"') + '", ' + Dftval + ', ' + CStr(CNum(Column.addBlank) + 0) + ' /* addBlank */, False /* readOnly */, ' + CStr(Additionalattributes) + ', True /* multiValuedData */)';;
        } else {
            ByRef__Html[ByRef__Html.length] = 'ctlHtml = \'No ref list\' ;* No reference list is setup';
        }

        if (CBool(Column.autopostback) && Id) { ByRef__Html[ByRef__Html.length] = 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
    } else {
        if (Dokobinding) Defaultvalue = undefined; else Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

        if (CBool(Column.includeurl) && CBool(Column.arrayname)) {
            ByRef__Html = DropDownBoxIncludeURL(Id, Column.includeurl, Column.arrayname, Defaultvalue, Column.addBlank, false, Additionalattributes, true);
            if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
        } else {
            Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row });
            if (CBool(isArray(Values))) {
                ByRef__Html = (DropDownBox(Id, Values, Defaultvalue, Column.addBlank, false, Additionalattributes, CBool(Column.multiValuedData) || !isEmpty(Column.reflist)));
                if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
            } else {
                ByRef__Html = 'no ref list';
            }
        }
    }
    return exit();
}
// </CTL_DROPDOWNBOX_Sub>

// <DROPDOWNBOX_EXTRAMETA_Sub>
async function JSB_CTLS_DROPDOWNBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });
    Viewmodel.columns.push({ "name": 'autopostback', "label": 'Auto PostBack', "width": 19, "control": 'checkbox', "canedit": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });
    Viewmodel.columns.push({ "name": 'includeurl', "label": 'JS Include Url', "width": 19, "control": 'textbox', "canedit": true, "notblank": false });
    Viewmodel.columns.push({ "name": 'arrayname', "label": 'JS Array Name', "width": 19, "control": 'textbox', "canedit": true, "notblank": false });
    Viewmodel.columns.push({ "name": 'customRoutine', "label": 'CustomRoutine', "control": 'textbox', "canedit": true, "required": true, "notblank": true, "tooltip": 'Place a json function here, or an http call with ?arg={id} for parent argument' });

    return exit();
}
// </DROPDOWNBOX_EXTRAMETA_Sub>

// <CTL_EMAILBOX_Sub>
async function JSB_CTLS_CTL_EMAILBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
    Additionalattributes[Additionalattributes.length] = 'data-parsley-type="email"';
    await JSB_CTLS_CTL_TEXTBOX_Sub(CStr(Projectname), CStr(Id), Column, Row, ByRef__Html, CStr(Dokobinding), Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    return exit();
}
// </CTL_EMAILBOX_Sub>

// <CTL_FIELDSETBTNS_Sub>
async function JSB_CTLS_CTL_FIELDSETBTNS_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    // local variables
    var Aa;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Dftval = '';
    var Defaultvalue = '';
    var Values = '';

    if (Not(Column.canedit)) {
        await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), CStr(Id), Column, Row, ByRef__Html, CStr(Dokobinding), Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
        return exit(undefined);
    }

    Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, [undefined,]); // AdditionalAttributes ??

    if (Dokobinding) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
        // AdditionalAttributes[-1] = `data-bind="addIfNotInList: {}, checked:$data['`:Column.name:`'], checked:$data['`:Column.name:`']?$data['`:Column.name:`']:`:IFF(Column.defaultvalue, Column.defaultvalue, 0):
        Aa = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'checked', false, 'window.fieldSetBtn_Change($element)', undefined, true);
        Additionalattributes[Additionalattributes.length] = CStr(Aa) + ', attr: { name: \'' + CStr(Column.name) + '\' + $index() }"';
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        Id = '';
    }

    if (Gencode) {
        ByRef__Html = [undefined,];
        if (Dokobinding) Dftval = 'null'; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
        if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '\'\'';

        if (CBool(Column.reffile)) {
            ByRef__Html[ByRef__Html.length] = 'Dim refList As Array = @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align == 'right')) + ', ' + CStr(CNum(Column.oktocache)) + ')';
            ByRef__Html[ByRef__Html.length] = 'If refList Then';
            ByRef__Html[ByRef__Html.length] = '   ctlHtml = @jsb_html.fieldSetBtns("' + Id + '", refList, ' + Dftval + ', ' + CStr((Not(Column.canedit))) + ', ' + CStr(Additionalattributes) + ', ' + CStr(Column.multiValuedData) + ' /* multiValuedData */)';
            ByRef__Html[ByRef__Html.length] = 'Else';
            ByRef__Html[ByRef__Html.length] = '   ctlHtml = \'no ref list \'';
            ByRef__Html[ByRef__Html.length] = 'End If';;
        } else if (CBool(Column.reflist)) {
            ByRef__Html[ByRef__Html.length] = 'ctlHtml = @jsb_html.fieldSetBtns(\'' + Id + '\', "' + Change(Column.reflist, '"', '\\"') + '", ' + Dftval + ', ' + CStr((Not(Column.canedit))) + ', ' + CStr(Additionalattributes) + ', ' + CStr(CNum(Column.multiValuedData) + 0) + ')';;
        } else {
            ByRef__Html[ByRef__Html.length] = 'ctlHtml = \'no ref list \' ;* No reference list is setup';
        }

        if (CBool(Column.autopostback) && Id) { ByRef__Html[ByRef__Html.length] = 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
    } else {
        if (Dokobinding) Defaultvalue = undefined; else Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

        Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row });
        if (CBool(isArray(Values))) {
            ByRef__Html = JSB_HTML_FIELDSETBTNS(Id, Values, Defaultvalue, (Not(Column.canedit)), Additionalattributes, CNum(Column.multiValuedData));
            if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
        } else {
            ByRef__Html = '';
        }
    }
    return exit();
}
// </CTL_FIELDSETBTNS_Sub>

// <FIELDSETBTNS_EXTRAMETA_Sub>
async function JSB_CTLS_FIELDSETBTNS_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });
    Viewmodel.columns.push({ "name": 'autopostback', "label": 'Auto PostBack', "width": 19, "control": 'checkbox', "canedit": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });
    return exit();
}
// </FIELDSETBTNS_EXTRAMETA_Sub>

// <CTL_HIDDENVAR_Sub>
async function JSB_CTLS_CTL_HIDDENVAR_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Dftval = '';
    var Defaultvalue = '';

    if (Dokobinding) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
        // AdditionalAttributes[-1] = `data-bind="value:$data['`:Column.name:`'], value:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"`  
        Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, '', undefined);
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        Id = '';
    }

    if (Gencode) {
        if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
        if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';
        ByRef__Html = 'ctlHtml = @jsb_html.hiddenVar("' + Id + '", ' + Dftval + ', ' + CStr(Additionalattributes) + ')';
        if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
    } else {
        if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));
        ByRef__Html = HiddenVar(Id, Defaultvalue, Additionalattributes);
        if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
    }

    return exit(undefined);
}
// </CTL_HIDDENVAR_Sub>

// <CTL_HTMLBOX_Sub>
async function JSB_CTLS_CTL_HTMLBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Dftval = '';
    var Defaultvalue = '';

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'width: 100%', ';', Additionalattributes);

    if (CBool(Column.fullheight)) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'height:100%; overflow: auto', ';', Additionalattributes);;
    } else if (Null0(Column.linecnt) > 1) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'min-height:' + CStr(Column.linecnt) + 'em', ';', Additionalattributes);
    }

    if (Dokobinding) {
        // AdditionalAttributes[-1] = `data-bind="value:$data['`:Column.name:`'], value:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"` 
        Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, '', undefined);
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        Id = '';
    }

    if (Gencode) {
        if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';
        if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));

        if (CBool(Column.canedit)) {
            ByRef__Html = 'ctlHtml = @NicEditor(\'' + Id + '\', ' + Dftval + ', false, ' + CStr(Additionalattributes) + ')';
        } else {
            ByRef__Html = 'ctlHtml = @Html("\<label class=\'CtlLabel\' id=\'' + Id + '\' ' + CStr(Additionalattributes) + '\>":Replace(' + Dftval + ', Chr(13), "\<br /\>"):"\</label\>")';
        }
    } else {
        if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

        if (CBool(Column.canedit)) {
            ByRef__Html = JSB_HTML_NICEDITOR(Id, Defaultvalue, CStr(false), Additionalattributes);
        } else {
            ByRef__Html = Chr(28) + '\<label class=\'CtlLabel\' id=\'' + Id + '\' ' + Join(Additionalattributes, ' ') + '\>' + Change(Defaultvalue, Chr(13), '\<br /\>') + '\</label\>' + Chr(29);
        }
    }
    return exit(undefined);
}
// </CTL_HTMLBOX_Sub>

// <HTMLBOX_EXTRAMETA_Sub>
async function JSB_CTLS_HTMLBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({ "name": 'linecnt', "label": 'Lines', "width": 19, "control": 'textbox', "canedit": true, "default": 1 });
    Viewmodel.columns.push({ "name": 'fullheight', "label": 'fullheight', "width": 19, "control": 'checkbox', "canedit": true, "notblank": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });
    return exit();
}
// </HTMLBOX_EXTRAMETA_Sub>

// <CTL_IMAGEBOX_Sub>
async function JSB_CTLS_CTL_IMAGEBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    await JSB_CTLS_CTL_TEXTBOX_Sub(CStr(Projectname), CStr(Id), Column, Row, ByRef__Html, CStr(Dokobinding), Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    return exit();
}
// </CTL_IMAGEBOX_Sub>

// <CTL_JSON_INLINE_Sub>
async function JSB_CTLS_CTL_JSON_INLINE_Sub(Projectname, Id, Column, Row, ByRef__Html, Parentmodel, Additionalattributes, Gencode, Viewname, setByRefValues) {
    // local variables
    var Errors, Defaultrow, Dataset, Editviewname, Rl, Line, Ltriml;
    var Fc, Spcs, Parent, Koid;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Usename = '';
    var Newrow = '';
    var Model = '';

    if (Not(Parentmodel)) Parentmodel = '';
    var Ahtml = [undefined,];

    if (Parentmodel) {
        Usename = Column.name;
        Newrow = 'function () { if (window.event) koModel.' + JSB_BF_NICENAME(Change(Parentmodel, '().', '_')) + Usename + '_newRow($index()) /* A */ }';
    } else {
        Usename = Id;
        Newrow = 'koModel.' + Usename + '_newRow';
        Newrow = 'function () { if (window.event) koModel.' + Usename + '_newRow() }';
    }

    if (Gencode) {
        // Two choices here:  true) put html code directly into the output file, false) write code that creates the html dynamically

        if (true) {
            if (!(await JSB_CTLS_JSON_SETUP(CStr(Projectname), CStr(Id), Column, [undefined,], Errors, Additionalattributes, Defaultrow, Dataset, Model, Editviewname, function (_Errors, _Defaultrow, _Dataset, _Model, _Editviewname) { Errors = _Errors; Defaultrow = _Defaultrow; Dataset = _Dataset; Model = _Model; Editviewname = _Editviewname }))) { Alert(CStr(Errors)); return exit(undefined); }
            Rl = JSB_HTML_REPEATERLOAD(Usename, CStr(Defaultrow), Dataset, Parentmodel);

            // This is where we can recurse
            if (Column.form == 'form' || isEmpty(Column.form) || Column.form == 'tform') {
                Rl += await JSB_CTLS_REPEATERFORMBACKGROUND(CStr(Projectname), Usename, Model, Dataset, CStr(Column.rmvrowtxt), CNum(Column.canedit), Parentmodel, CStr(Editviewname));
            } else {
                Rl += await JSB_CTLS_REPEATERGRIDBACKGROUND(CStr(Projectname), Usename, Model, Dataset, CStr(Column.rmvrowtxt), CNum(Column.canedit), Parentmodel, CStr(Editviewname));
            }

            Rl = Change(Rl, Chr(28), '');
            Rl = Change(Rl, Chr(29), '');
            Rl = Split(Rl, crlf);
            Ahtml[Ahtml.length] = '   ctlHtml = @Html(`';
            for (Line of iterateOver(Rl)) {
                Ltriml = LTrim(Line);
                if (CBool(Ltriml)) {
                    Fc = Left(Ltriml, 1);
                    Spcs = InStr1(1, Line, Fc);
                    if (Null0(Spcs) <= 1) {
                        if (Fc == '\<') Line = Space(8) + CStr(Line); else Line = Space(12) + CStr(Line);
                    }
                    Ahtml[Ahtml.length] = Line;
                }
            }
            Ahtml[Ahtml.length] = '    `)';

            if (Parentmodel) {
                Parent = 'koModel.' + JSB_BF_NICENAME(Change(Parentmodel, '().', ''));
                Koid = CStr(Parent) + '_' + JSB_BF_NICENAME(CStr(Id));
            } else {
                Koid = 'koModel.' + JSB_BF_NICENAME(CStr(Id));
            }

            Ahtml[Ahtml.length] = '   Dim DataSet As Array = ' + CStr(Row);
            Ahtml[Ahtml.length] = '   ctlHtml := @Script(\'' + CStr(Koid) + ' = makeObservableKO([\':Change(Join(dataSet, ","), CHR(160), Chr(32)):\'], ' + CStr(Koid) + '_DefaultRow);\')';
        } else {

            if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';
            if (Parentmodel) {
                Ahtml[Ahtml.length] = 'Dim parentModel As String = ' + Parentmodel;
            } else {
                Ahtml[Ahtml.length] = 'Dim parentModel As String = Null ';
            }

            Ahtml[Ahtml.length] = 'Dim Column As JSON = ' + CStr(Column);
            Ahtml[Ahtml.length] = 'Dim editViewName As String';
            Ahtml[Ahtml.length] = 'Dim Errors As String';
            Ahtml[Ahtml.length] = 'Dim defaultRow As JSON';
            Ahtml[Ahtml.length] = 'Dim Model As JSON';
            Ahtml[Ahtml.length] = 'Dim dataSet As Array';
            Ahtml[Ahtml.length] = 'If !@jsb_ctls.json_setup("' + CStr(Projectname) + '", "' + CStr(Id) + '", Column, ' + Field(Row, '[', 1) + ', Errors, ' + CStr(Additionalattributes) + ', defaultRow, dataSet, Model, editViewName) Then Return Alert(Errors) = \'*\'';

            Ahtml[Ahtml.length] = 'ctlHtml = @jsb_html.repeaterLoad("' + Usename + '", defaultRow, DataSet, parentModel) ';

            // This is where we can recurse
            if (Column.form == 'form' || isEmpty(Column.form) || Column.form == 'tform') {
                Ahtml[Ahtml.length] = 'ctlHtml := @jsb_ctls.RepeaterFormBackground("' + CStr(Projectname) + '", "' + Usename + '", Model, DataSet, "' + CStr(Column.rmvrowtxt) + '", "' + CStr(Column.canedit) + '", parentModel, editViewName)';
            } else {
                Ahtml[Ahtml.length] = 'ctlHtml := @jsb_ctls.RepeaterGridBackground("' + CStr(Projectname) + '", "' + Usename + '", Model, DataSet, "' + CStr(Column.rmvrowtxt) + '", "' + CStr(Column.canedit) + '", parentModel, editViewName)';
            }
        }

        if (CBool(Column.canedit) && CBool(Column.addrowtxt)) {
            Ahtml[Ahtml.length] = 'ctlHtml := @jsb_html.button(\'btnAddRow\', "' + CStr(Column.addrowtxt) + '", ["data-bind=\'click: ' + Newrow + '\'"]) ';
        }
    } else {
        if (!(await JSB_CTLS_JSON_SETUP(CStr(Projectname), CStr(Id), Column, Row, Errors, Additionalattributes, Defaultrow, Dataset, Model, Editviewname, function (_Errors, _Defaultrow, _Dataset, _Model, _Editviewname) { Errors = _Errors; Defaultrow = _Defaultrow; Dataset = _Dataset; Model = _Model; Editviewname = _Editviewname }))) { Alert(CStr(Errors)); return exit(undefined); }

        Ahtml[Ahtml.length] = JSB_HTML_REPEATERLOAD(Usename, CStr(Defaultrow), Dataset, Parentmodel);

        // This is where we can recurse
        if (Column.form == 'form' || isEmpty(Column.form) || Column.form == 'tform') {
            Ahtml[Ahtml.length] = await JSB_CTLS_REPEATERFORMBACKGROUND(CStr(Projectname), Usename, Model, Dataset, CStr(Column.rmvrowtxt), CNum(Column.canedit), Parentmodel, CStr(Editviewname));
        } else {
            Ahtml[Ahtml.length] = await JSB_CTLS_REPEATERGRIDBACKGROUND(CStr(Projectname), Usename, Model, Dataset, CStr(Column.rmvrowtxt), CNum(Column.canedit), Parentmodel, CStr(Editviewname));
        }

        if (CBool(Column.canedit) && CBool(Column.addrowtxt)) {
            Ahtml[Ahtml.length] = Button('btnAddRow', Column.addrowtxt, [undefined, 'data-bind=\'click: ' + Newrow + '\'']);
        }
    }

    ByRef__Html = Join(Ahtml, crlf);
    return exit();
}
// </CTL_JSON_INLINE_Sub>

// <JSON_INLINE_EXTRAMETA_Sub>
async function JSB_CTLS_JSON_INLINE_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({ "name": 'useview', "label": 'Use View', "datatype": 'string', "primarykey": false, "width": 30, "control": 'dropdownbox', "canedit": true, "pickfunction": 'edv_pick?projectName={projectname}', "reffile": 'dict {projectname}', "refpk": 'ItemID', "refwhere": 'ItemID Like \'%.view\'' });
    Viewmodel.columns.push({ "name": 'addrowtxt', "label": 'Add Row Text', "datatype": 'string', "primarykey": false, "width": 30, "control": 'textbox', "required": true, "notblank": true, "canedit": true, "defaultvalue": 'Add another row' });
    Viewmodel.columns.push({ "name": 'rmvrowtxt', "label": 'Remove Row Text', "datatype": 'string', "primarykey": false, "width": 30, "control": 'textbox', "required": true, "notblank": true, "canedit": true, "defaultvalue": 'Remove Row' });
    Viewmodel.columns.push({ "name": 'form', "label": 'form', "datatype": 'string', "primarykey": false, "width": 30, "control": 'dropdownbox', "required": true, "notblank": true, "canedit": true, "defaultvalue": 'form', "reflist": 'form;grid' });
    return exit();
}
// </JSON_INLINE_EXTRAMETA_Sub>

// <CTL_JSON_POPUP_Sub>
async function JSB_CTLS_CTL_JSON_POPUP_Sub(Projectname, Id, Column, Row, ByRef__Html, Parentmodel, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Popupwidth = '';
    var Popuptitle = '';
    var Defaultrow = '';
    var Model = '';
    var Editviewname = '';
    var Usename = '';
    var C2 = '';
    var C1 = '';
    var Koid = '';
    var Subid = '';
    var Mylayout = '';
    var S = '';
    var Popupheight = '';
    var Dataset = undefined;
    var Output = undefined;

    if (Not(Popupheight)) Popupheight = 300 + UBound(Dataset) * 40;
    if (Not(Popupwidth)) Popupwidth = '80%';
    if (CNum(Popupheight) != Null0(Popupheight)) Popupheight = '"' + Popupheight + '"';
    if (CNum(Popupwidth) != Null0(Popupwidth)) Popupwidth = '"' + Popupwidth + '"';

    if (Not(Parentmodel)) Parentmodel = '';
    if (!(await JSB_CTLS_JSON_SETUP(CStr(Projectname), CStr(Id), Column, Row, Output, Additionalattributes, Defaultrow, Dataset, Model, Editviewname, function (_Output, _Defaultrow, _Dataset, _Model, _Editviewname) { Output = _Output; Defaultrow = _Defaultrow; Dataset = _Dataset; Model = _Model; Editviewname = _Editviewname }))) return exit(undefined);

    Output = [undefined,];
    if (CBool(Parentmodel)) Usename = Column.name; else Usename = Id;
    Output[Output.length] = JSB_HTML_REPEATERLOAD(Usename, CStr(Defaultrow), Dataset, CStr(Parentmodel));

    if (CBool(Parentmodel)) {
        Additionalattributes[Additionalattributes.length] = 'data-bind="value:$data[\'' + CStr(Column.name) + '\'], value:$data[\'' + CStr(Column.name) + '\']?$data[\'' + CStr(Column.name) + '\']:\'' + CStr(Column.defaultvalue) + '\'"';
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        C2 = Button('', '...', [undefined, 'data-bind="click: function () { popup_' + CStr(Id) + '($data, $index()) }"']);
    } else {
        C2 = Button('', '...', [undefined, 'onclick=\'popup_' + CStr(Id) + '()\'']);
    }

    S = '[' + Join(Dataset, ',') + ']';
    S = HtmlEscape(S);

    if (CBool(Column.canedit)) {
        C1 = Chr(28) + '\<input id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\' class=\'CtlJsonArray\' value=\'' + S + '\' ' + Join(Additionalattributes, ' ') + ' /\>' + Chr(29);
        Output[Output.length] = Cols2('%', C1, '30px', C2, '', 'overflow: hidden', 'overflow: hidden');
    } else {
        C1 = Chr(28) + '\<input id=\'' + CStr(Id) + '\' name=\'' + CStr(Id) + '\' type=\'hidden\' class=\'CtlJsonArray\' value=\'' + S + '\' ' + Join(Additionalattributes, ' ') + ' /\>' + Chr(29);
        Output[Output.length] = C1 + C2;
    }

    Koid = 'Ctl_' + CStr(Id);
    Output[Output.length] = Chr(28) + '\<div id="' + CStr(Id) + '_dialog" title="Basic! dialog" style="display: none;"\>' + Chr(29);
    if (CBool(Parentmodel)) Subid = CStr(Parentmodel) + '().'; else Subid = '';

    if (Column.form == 'form' || isEmpty(Column.form)) {
        Mylayout = await JSB_CTLS_REPEATERFORMBACKGROUND(CStr(Projectname), Usename, Model, Dataset, CStr(Column.rmvrowtxt), CNum(Column.canedit), Subid, CStr(Editviewname));
    } else {
        Mylayout = await JSB_CTLS_REPEATERGRIDBACKGROUND(CStr(Projectname), Usename, Model, Dataset, CStr(Column.rmvrowtxt), CNum(Column.canedit), Subid, CStr(Editviewname));
    }

    Output[Output.length] = Change(Change(Mylayout, 'mdlctl', 'nstctl'), 'foreach: $data', 'foreach: $root');
    Output[Output.length] = Chr(28) + '\</div\>';

    var Script = [undefined,];
    if (CBool(Parentmodel)) {
        Script[Script.length] = 'function popup_' + CStr(Id) + '(thisRow, index) {';
        Script[Script.length] = '   var myRow = thisRow; ';
        Script[Script.length] = '   var myCtl = $(\'[name="' + CStr(Id) + '"]\').eq(index); ';
    } else {
        Script[Script.length] = 'function popup_' + CStr(Id) + '() {';
        Script[Script.length] = '   var myCtl = $("#' + CStr(Id) + '");';
    }

    Script[Script.length] = '   var myjs = $(myCtl).val();';
    Script[Script.length] = '   if (Left(myjs, 1) != "[") myjs = "[" + myjs + "]"';
    Script[Script.length] = '   myjs = string2json(myjs)';
    Script[Script.length] = '';

    Script[Script.length] = '      $("#' + CStr(Id) + '_dialog" ).dialog({';
    Script[Script.length] = '       title: "' + htmlEscape(Popuptitle) + '",';
    Script[Script.length] = '       modal: true,';
    Script[Script.length] = '       width: ' + Popupwidth + ',';
    Script[Script.length] = '       minHeight: ' + Popupheight + ',';
    Script[Script.length] = '       height: ' + Popupheight + ',';
    Script[Script.length] = '       open: function() {';
    Script[Script.length] = '           koModel.' + JSB_BF_NICENAME(Change(Parentmodel, '().', '_')) + Usename + '.removeAll()';
    Script[Script.length] = '           for (var i = 0; i \< myjs.length; ++i) koModel.' + JSB_BF_NICENAME(Change(Parentmodel, '().', '_')) + Usename + '_addRow(myjs[i]);';
    Script[Script.length] = '      },';
    Script[Script.length] = '      buttons: {';
    if (CBool(Column.canedit) && CBool(Column.addrowtxt)) {
        Script[Script.length] = '         \'' + CStr(Column.addrowtxt) + '\': function() { ';
        Script[Script.length] = '             koModel.' + JSB_BF_NICENAME(Change(Parentmodel, '().', '_')) + Usename + '_newRow()';
        Script[Script.length] = '         },';
    }
    Script[Script.length] = '         \'Save\': function() {';
    Script[Script.length] = '            $(myCtl).val(koModel.' + JSB_BF_NICENAME(Change(Parentmodel, '().', '_')) + Usename + '_Value());';
    if (CBool(Parentmodel)) {
        Script[Script.length] = '            myRow[\'' + CStr(Id) + '\'] = koModel.' + JSB_BF_NICENAME(Change(Parentmodel, '().', '_')) + Usename + '_Value();';
    }
    Script[Script.length] = '            $(this).dialog("close");';
    Script[Script.length] = '         },';
    Script[Script.length] = '         \'Cancel\': function() {';
    Script[Script.length] = '             $(this).dialog("close");';
    Script[Script.length] = '         }';
    Script[Script.length] = '       },';
    Script[Script.length] = '       close: function(event, ui) { ';
    Script[Script.length] = '          koModel.' + JSB_BF_NICENAME(Change(Parentmodel, '().', '_')) + Usename + '.removeAll()';
    Script[Script.length] = '       }';
    Script[Script.length] = '     });';
    Script[Script.length] = '   }';

    ByRef__Html = Join(Output) + JSB_HTML_SCRIPT(Join(Script));
    return exit();
}
// </CTL_JSON_POPUP_Sub>

// <JSON_POPUP_EXTRAMETA_Sub>
async function JSB_CTLS_JSON_POPUP_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({ "name": 'useview', "label": 'Use View', "datatype": 'string', "primarykey": false, "width": 30, "control": 'dropdownbox', "canedit": true, "pickfunction": 'edv_pick?projectName={projectname}', "reffile": 'dict {projectname}', "refpk": 'ItemID', "refwhere": 'ItemID Like \'%.view\'' });
    Viewmodel.columns.push({ "name": 'popuptitle', "label": 'Popup Title', "width": 19, "control": 'textbox', "canedit": true, "notblank": false });
    Viewmodel.columns.push({ "name": 'popupwidth', "label": 'Popup Width', "width": 19, "control": 'textbox', "canedit": true, "notblank": false });
    Viewmodel.columns.push({ "name": 'popupheight', "label": 'MPopup Height', "width": 19, "control": 'textbox', "canedit": true, "notblank": false });
    Viewmodel.columns.push({ "name": 'form', "label": 'form', "datatype": 'string', "primarykey": false, "width": 30, "control": 'dropdownbox', "required": true, "notblank": true, "canedit": true, "defaultvalue": 'form', "reflist": 'form;grid' });
    return exit();
}
// </JSON_POPUP_EXTRAMETA_Sub>

// <CTL_KNOB_Sub>
async function JSB_CTLS_CTL_KNOB_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Dftval = '';
    var Defaultvalue = '';

    if (Not(Column.canedit)) Additionalattributes[Additionalattributes.length] = 'readonly';
    if (Dokobinding) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
        // AdditionalAttributes[-1] = `data-bind="checked:$data['`:Column.name:`'], checked:$data['`:Column.name:`']?$data['`:Column.name:`']:`:IFF(Column.defaultvalue, Column.defaultvalue, 0):`"` 
        Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'checked', false, '', undefined);
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        Id = '';
    }

    if (Gencode) {
        if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
        if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '\'\'';
        ByRef__Html = 'ctlHtml = @jsb_html.Knob(\'' + Id + '\', ' + Dftval + ', ' + CStr(Not(CStr(Column.canedit) + ', ' + CStr(Additionalattributes) + ', ' + CStr(Column.iminvalue) + ', ' + CStr(Column.imaxvalue) + ', ' + CStr(CNum(Column.size)) + ', "' + CStr(Column.color) + '")'));

        if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
    } else {
        if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

        ByRef__Html = Knob(Id, Defaultvalue, Not(Column.canedit), Additionalattributes, Column.iminvalue, Column.imaxvalue, Column.size, Column.color);

        if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
    }
    return exit();
}
// </CTL_KNOB_Sub>

// <KNOB_EXTRAMETA_Sub>
async function JSB_CTLS_KNOB_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({ "name": 'size', "label": 'Size', "width": 19, "control": 'textbox', "canedit": true, "default": 120 });
    Viewmodel.columns.push({ "name": 'color', "label": 'Color', "width": 19, "control": 'textbox', "canedit": true });
    Viewmodel.columns.push({ "name": 'iminvalue', "index": 31, "label": 'int Min Vaue', "width": '12em', "control": 'textbox', "canedit": true, "default": 0 });
    Viewmodel.columns.push({ "name": 'imaxvalue', "index": 32, "label": 'int Max Value', "width": '12em', "control": 'textbox', "canedit": true, "default": 100 });
    return exit();
}
// </KNOB_EXTRAMETA_Sub>

// <CTL_LABEL_Sub>
async function JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var _Code = '';
    var Defaultvalue = '';
    var Displayvalue = '';

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'width: 100%', ';', Additionalattributes);
    if (Null0(Column.linecnt) > 1) { Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'min-height:' + CStr(Column.linecnt) + 'em', ';', Additionalattributes); }

    if (Dokobinding) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
        // AdditionalAttributes[-1] = `data-bind="text:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"` 
        Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'text', false, '', undefined);
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
    }

    // Label
    if (Gencode) {
        if (CBool(Additionalattributes)) Additionalattributes = joinAttributes(Additionalattributes); else Additionalattributes = '';
        ByRef__Html = [undefined,];
        _Code = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
        if (CBool(Column.multiValuedData) && ((CBool(Column.refdisplay) && Null0(Column.refdisplay) != Null0(Column.refpk) && (CBool(Column.reffile) || CBool(Column.reflist))) || CBool(Column.reflist))) {
            ByRef__Html[ByRef__Html.length] = 'desc = @lookupCode(' + _Code + ', \'' + CStr(Column.refdisplay) + '\', \'' + CStr(Column.refpk) + '\', \'' + CStr(Column.reffile) + '\', \'' + CStr(Column.reflist) + '\', ' + CStr((Column.oktocache)) + ')';
            ByRef__Html[ByRef__Html.length] = 'ctlHtml = @Html("\<label class=\'CtlLabel form-control\' id=\'ctllbl_' + CStr(Id) + '\' ' + CStr(Additionalattributes) + '\>":Replace(@HtmlEncode(desc), Chr(13), "\<br /\>"):"\</label\>\<input class=\'hCtlLabel\' type=\'hidden\' name=\'' + CStr(Id) + '\' value=\'":@HtmlEncode(' + _Code + '):"\' /\>")';
        } else {
            ByRef__Html[ByRef__Html.length] = 'ctlHtml = @Html("\<label class=\'CtlLabel form-control\' id=\'ctllbl_' + CStr(Id) + '\' ' + CStr(Additionalattributes) + '\>":Replace(@HtmlEncode(' + _Code + '), Chr(13), "\<br /\>"):"\</label\>\<input class=\'hCtlLabel\' type=\'hidden\' name=\'' + CStr(Id) + '\' value=\'":@HtmlEncode(' + _Code + '):"\' /\>")';
        }
    } else {
        if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));
        if (CBool(Column.reffile) && CBool(Column.refpk) && CBool(Column.refdisplay) && (Null0(Column.refpk) != Null0(Column.refdisplay))) {
            Displayvalue = await JSB_BF_LOOKUPCODE(Defaultvalue, CStr(Column.refdisplay), CStr(Column.refpk), CStr(Column.reffile), CStr(Column.reflist), CNum(Column.oktocache));
        } else {
            Displayvalue = Defaultvalue;
        }
        ByRef__Html = Chr(28) + '\<label class=\'CtlLabel form-control\' id=\'ctllbl_' + CStr(Id) + '\' ' + Join(Additionalattributes, ' ') + '\>' + Change(htmlEscape(Displayvalue), Chr(13), '\<br /\>') + '\</label\>\<input class=\'hCtlLabel\' type=\'hidden\' name=\'' + CStr(Id) + '\' value=\'' + htmlEscape(Defaultvalue) + '\' /\>' + Chr(29);
    }

    if (Gencode) {
        if (CBool(Column.mask)) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#ctllbl_' + CStr(Id) + '").mask("' + Mid1(Column.mask, InStr1(1, Column.mask, ',') + 1) + '");\')'; }
    } else {
        if (CBool(Column.mask)) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$("#ctllbl_' + CStr(Id) + '").mask("' + Mid1(Column.mask, InStr1(1, Column.mask, ',') + 1) + '");'); }
    }
    return exit();
}
// </CTL_LABEL_Sub>

// <LABEL_EXTRAMETA_Sub>
async function JSB_CTLS_LABEL_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({ "name": 'linecnt', "label": 'Lines', "width": 19, "control": 'textbox', "canedit": true, "default": 1 });
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });
    return exit();
}
// </LABEL_EXTRAMETA_Sub>

// <CTL_MULTISELECTDROPDOWNBOX_Sub>
async function JSB_CTLS_CTL_MULTISELECTDROPDOWNBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    // See if there is a RefFIle, and make a json array, or json callback

    var Dftval = '';
    var Values = '';
    var Defaultvalue = '';
    var Binding = undefined;

    if (CBool(Column.canedit)) {
        if (Dokobinding) {
            Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force Json To Array
            Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
            // Binding = [`data-bind="addIfNotInList: {}, value:$data['`:Column.name:`'], value:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"`  ]
            Binding = [undefined, await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, '', undefined)];
        } else {
            Binding = [undefined,];
        }

        if (Gencode) {
            if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
            if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';

            if (CBool(Column.reffile)) {
                ByRef__Html = 'ctlHtml = @jsb_html.multiSelectdropdownbox("' + CStr(Id) + '", @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align == 'right')) + ', ' + CStr(CNum(Column.oktocache)) + '), ' + Dftval + ', ' + CStr(Additionalattributes) + ', ' + CStr(Binding) + ')';
            } else if (CBool(Column.reflist)) {
                ByRef__Html = 'ctlHtml = @jsb_html.multiSelectdropdownbox("' + CStr(Id) + '", "' + Change(Column.reflist, '"', '\\"') + '", ' + Dftval + ', ' + CStr(Additionalattributes) + ', ' + CStr(Binding) + ')';
            } else {
                ByRef__Html[ByRef__Html.length] = 'ctlHtml = \'no ref list \' ;* No reference list is setup';
            }

            if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + CStr(Id) + '").change(function() { doJsbSubmit() });\')'; }
        } else {
            Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row });
            if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

            ByRef__Html = multiSelectDropDownBox(Id, Values, Defaultvalue, await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes), Binding);
            if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + CStr(Id) + '\').blur(function() { doJsbSubmit() });'); }
        }
    } else {
        // Prevents change
        await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), CStr(Id), Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    }
    return exit();
}
// </CTL_MULTISELECTDROPDOWNBOX_Sub>

// <MULTISELECTDROPDOWNBOX_EXTRAMETA_Sub>
async function JSB_CTLS_MULTISELECTDROPDOWNBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });

    // viewModel.columns.push ({name:'autopostback', label:'Auto PostBack', width:19, control:'checkbox', canedit:true, defaultvalue:0, reflist: "false,0;true,1" })
    return exit();
}
// </MULTISELECTDROPDOWNBOX_EXTRAMETA_Sub>

// <CTL_MULTISELECTFIELDSETBTNS_Sub>
async function JSB_CTLS_CTL_MULTISELECTFIELDSETBTNS_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Dftval = '';
    var Defaultvalue = '';
    var Values = '';

    Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes);

    if (Dokobinding) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
        // AdditionalAttributes[-1] = `data-bind="addIfNotInList: {}, value:$data['`:Column.name:`'], value:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"`  
        Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', true, '', undefined);
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        Id = '';
    }

    if (Gencode) {
        ByRef__Html = [undefined,];
        if (Dokobinding) Dftval = 'null'; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
        if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '\'\'';

        if (CBool(Column.reffile)) {
            ByRef__Html[ByRef__Html.length] = 'Dim refList As Array = @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align == 'right')) + ', ' + CStr(CNum(Column.oktocache)) + ')';
            ByRef__Html[ByRef__Html.length] = 'If refList Then';
            ByRef__Html[ByRef__Html.length] = '   ctlHtml = @jsb_html.multiselectfieldsetbtns("' + Id + '", refList, ' + Dftval + ', False /* readOnly */, ' + CStr(Additionalattributes) + ', ' + CStr(Column.multiValuedData) + ' /* multiValuedData */)';
            ByRef__Html[ByRef__Html.length] = 'Else';
            ByRef__Html[ByRef__Html.length] = '   ctlHtml = \'no ref list \' ;* No reference list is setup for "' + Id + '"';
            ByRef__Html[ByRef__Html.length] = 'End If';;
        } else if (CBool(Column.reflist)) {
            ByRef__Html[ByRef__Html.length] = 'ctlHtml = @jsb_html.multiselectfieldsetbtns("' + Id + '", "' + Change(Column.reflist, '"', '\\"') + '", ' + Dftval + ', ' + CStr(Not(CStr(Column.canedit) + ' /* readOnly */, ' + CStr(Additionalattributes) + ', True /* multiValuedData */)'));;
        } else {
            ByRef__Html[ByRef__Html.length] = 'ctlHtml = \'no ref list \' ;* No reference list is setup';
        }
    } else {
        if (Dokobinding) Defaultvalue = undefined; else Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

        Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row });
        if (CBool(isArray(Values))) {
            ByRef__Html = (multiSelectFieldSetBtns(Id, Values, Defaultvalue, Not(Column.canedit), Additionalattributes, CBool(Column.multiValuedData) || !isEmpty(Column.reflist)));
        } else {
            ByRef__Html = '';
        }
    }
    return exit();
}
// </CTL_MULTISELECTFIELDSETBTNS_Sub>

// <MULTISELECTFIELDSETBTNS_EXTRAMETA_Sub>
async function JSB_CTLS_MULTISELECTFIELDSETBTNS_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });
    return exit();
}
// </MULTISELECTFIELDSETBTNS_EXTRAMETA_Sub>

// <CTL_MULTISELECTLISTBOX_Sub>
async function JSB_CTLS_CTL_MULTISELECTLISTBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    // See if there is a RefFIle, and make a json array, or json callback

    var Dftval = '';
    var Holdblanks = '';
    var Values = '';
    var Defaultvalue = '';

    if (CBool(Column.canedit)) {
        if (Dokobinding) {
            Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force Json To Array
            // AdditionalAttributes[-1] = `data-bind="addIfNotInList: {}, value:$data['`:Column.name:`'], value:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`', css:  { onKOload: window.multiSelectReflectValues($element) }"`
            Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', true, 'window.multiSelectReflectValues($element)', undefined);
            Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        }

        if (Gencode) {
            if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
            if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';

            if (CBool(Column.reffile)) {
                ByRef__Html = 'ctlHtml = @jsb_html.multiSelectListBox("' + CStr(Id) + '", @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align == 'right')) + ', ' + CStr(CNum(Column.oktocache)) + '), ' + Dftval + ', ' + CStr(Additionalattributes) + ')';
            } else if (CBool(Column.reflist)) {
                ByRef__Html = 'ctlHtml = @jsb_html.multiSelectListBox("' + CStr(Id) + '", "' + Change(Column.reflist, '"', '\\"') + '", ' + Dftval + ', ' + CStr(Additionalattributes) + ')';
            } else {
                ByRef__Html[ByRef__Html.length] = 'ctlHtml = \'no ref list \' ;* No reference list is setup';
            }

            if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + CStr(Id) + '").blur(function() { doJsbSubmit() });\')'; }
        } else {
            Holdblanks = Column.notblank;
            Column.notblank = true;
            Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row });
            Column.notblank = Holdblanks;

            if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

            ByRef__Html = JSB_HTML_MULTISELECTLISTBOX(CStr(Id), Values, Defaultvalue, await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes));
            if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + CStr(Id) + '\').blur(function() { doJsbSubmit() });'); }
        }
    } else {
        // Prevents change
        await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), CStr(Id), Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    }
    return exit();
}
// </CTL_MULTISELECTLISTBOX_Sub>

// <MULTISELECTLISTBOX_EXTRAMETA_Sub>
async function JSB_CTLS_MULTISELECTLISTBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });
    Viewmodel.columns.push({ "name": 'autopostback', "label": 'Auto PostBack', "width": 19, "control": 'checkbox', "canedit": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });
    return exit();
}
// </MULTISELECTLISTBOX_EXTRAMETA_Sub>

// <CTL_PASSWORDBOX_Sub>
async function JSB_CTLS_CTL_PASSWORDBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Dftval = '';
    var Defaultvalue = '';

    if (CBool(Column.canedit)) {
        if (Dokobinding) {
            Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
            // AdditionalAttributes[-1] = `data-bind="value:$data['`:Column.name:`'], value:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"`  
            Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, '', undefined);
            Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        }

        Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes);

        if (Gencode) {
            if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
            if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';

            ByRef__Html = 'ctlHtml = @jsb_html.PasswordBox("' + CStr(Id) + '", ' + CStr(Row) + ', false, ' + CStr(Additionalattributes) + ')';
            if (CBool(Column.mask)) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + CStr(Id) + '").mask("' + Mid1(Column.mask, InStr1(1, Column.mask, ',') + 1) + '");\')'; }
            if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + CStr(Id) + '").change(function() { doJsbSubmit() });\')'; }
        } else {
            if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));
            ByRef__Html = JSB_HTML_PASSWORDBOX(CStr(Id), Defaultvalue, false, Additionalattributes);
            if (CBool(Column.mask)) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$("#' + CStr(Id) + '").mask("' + Mid1(Column.mask, InStr1(1, Column.mask, ',') + 1) + '");'); }
            if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + CStr(Id) + '\').change(function() { doJsbSubmit() });'); }
        }
    } else {
        await JSB_CTLS_CTL_TEXTBOX_Sub(CStr(Projectname), CStr(Id), Column, Row, ByRef__Html, CStr(Dokobinding), Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    }
    return exit();
}
// </CTL_PASSWORDBOX_Sub>

// <CTL_PHONEBOX_Sub>
async function JSB_CTLS_CTL_PHONEBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    // AdditionalAttributes[-1] = `data-parsley-type="phone"`
    Column.mask = '(999) 999-9999? x99999';
    await JSB_CTLS_CTL_TEXTBOX_Sub(CStr(Projectname), CStr(Id), Column, Row, ByRef__Html, CStr(Dokobinding), Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    return exit();
}
// </CTL_PHONEBOX_Sub>

// <CTL_POPSELECTION_Sub>
async function JSB_CTLS_CTL_POPSELECTION_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Dftval = '';
    var Values = '';
    var Defaultvalue = '';

    if (CBool(Column.canedit)) {
        if (Dokobinding) {
            Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
            // AdditionalAttributes[-1] = `data-bind="value:$data['`:Column.name:`'], value:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"` 
            Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, '', undefined);
            Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        }

        if (Gencode) {
            if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
            if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';

            ByRef__Html = 'ctlHtml = @jsb_html.InputPopSelection("' + CStr(Id) + '", @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align == 'right')) + ', ' + CStr(CNum(Column.oktocache)) + '), ' + Dftval + ', ' + CStr(Additionalattributes) + ', "' + CStr(Column.popupwidth) + '", "' + CStr(Column.popupheight) + '", "' + CStr(Column.popuptitle) + '")';
            if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + CStr(Id) + '").change(function() { doJsbSubmit() });\')'; }
        } else {
            Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row });

            if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

            ByRef__Html = InputPopSelection(Id, Values, Defaultvalue, await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes), Column.popupwidth, Column.popupheight, Column.popuptitle);
            if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + CStr(Id) + '\').change(function() { doJsbSubmit() });'); }
        }
    } else {
        // Prevents change
        await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), CStr(Id), Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    }

    return exit();
}
// </CTL_POPSELECTION_Sub>

// <POPSELECTION_EXTRAMETA_Sub>
async function JSB_CTLS_POPSELECTION_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });

    Viewmodel.columns.push({ "name": 'autopostback', "label": 'Auto PostBack', "width": 19, "control": 'checkbox', "canedit": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });

    Viewmodel.columns.push({ "name": 'popuptitle', "label": 'Popup Title', "width": 19, "control": 'textbox', "canedit": true, "notblank": false });
    Viewmodel.columns.push({ "name": 'popupwidth', "label": 'Popup Width', "width": 19, "control": 'textbox', "canedit": true, "notblank": false });
    Viewmodel.columns.push({ "name": 'popupheight', "label": 'Popup Height', "width": 19, "control": 'textbox', "canedit": true, "notblank": false });
    return exit();
}
// </POPSELECTION_EXTRAMETA_Sub>

// <CTL_RADIOBOX_Sub>
async function JSB_CTLS_CTL_RADIOBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    // See if there is a RefFIle, and make a json array, or json callback

    var Dftval = '';
    var Values = '';
    var Defaultvalue = '';

    Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, [undefined,]);

    if (Dokobinding) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
        // AdditionalAttributes[-1] = `data-bind="addIfNotInList: {}, checked:$data['`:Column.name:`'], checked:$data['`:Column.name:`']?$data['`:Column.name:`']:`:IFF(Column.defaultvalue, Column.defaultvalue, 0):`, attr: { name: '`:Column.name:`' + $index() }"` 
        Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'checked', false, '', undefined, true) + ', attr: { name: \'' + CStr(Column.name) + '\' + $index() }"';
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
    }

    if (Gencode) {
        if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
        if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '\'\'';

        if (CBool(Column.reflist)) {
            ByRef__Html = 'ctlHtml = @jsb_html.RadioBtns(\'' + CStr(Id) + '\', "' + Change(Column.reflist, '"', '\\"') + '", ' + Dftval + ', ' + CStr((Not(Column.canedit))) + ', ' + CStr(Additionalattributes) + ')';
        } else {
            ByRef__Html = 'ctlHtml = @jsb_html.RadioBtns(\'' + CStr(Id) + '\', @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align == 'right')) + ', ' + CStr(CNum(Column.oktocache)) + '), ' + Dftval + ', ' + CStr((Not(Column.canedit))) + ', ' + CStr(Additionalattributes) + ')';
        }

        if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + CStr(Id) + '").change(function() { doJsbSubmit() });\')'; }
    } else {
        Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row });
        if (Dokobinding) {
            ByRef__Html = JSB_HTML_RADIOBTNS('', Values, undefined, (Not(Column.canedit)), Additionalattributes);
        } else {
            if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));
            ByRef__Html = JSB_HTML_RADIOBTNS(CStr(Id), Values, Defaultvalue, (Not(Column.canedit)), Additionalattributes);
            if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$("[name=\'' + CStr(Id) + '\']").change(function() { doJsbSubmit() });'); }
        }
    }
    return exit();
}
// </CTL_RADIOBOX_Sub>

// <RADIOBOX_EXTRAMETA_Sub>
async function JSB_CTLS_RADIOBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });
    Viewmodel.columns.push({ "name": 'autopostback', "label": 'Auto PostBack', "width": 19, "control": 'checkbox', "canedit": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });
    return exit();
}
// </RADIOBOX_EXTRAMETA_Sub>

// <CTL_SLIDER_Sub>
async function JSB_CTLS_CTL_SLIDER_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Dftval = '';

    if (Not(Column.canedit)) Additionalattributes[Additionalattributes.length] = 'readonly';
    Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes); // Force to be an Array[]

    if (Dokobinding) {
        // AdditionalAttributes = @MergeAttribute("", "", ";", AdditionalAttributes) ;* Force JSON to array
        // AdditionalAttributes[-1] = `data-bind="value:$data['`:Column.name:`'], value:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`', attr: { name: '`:Column.name:`' + $index() }, css: { onKOload: window.slider_Change($element) }"` 
        Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, 'window.slider_Change($element)', undefined, true) + ', attr: { name: \'' + CStr(Column.name) + '\' + $index() }"';
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'min-width: 200px', ';', Additionalattributes);
        Id = '';
    }

    if (Gencode) {
        ByRef__Html = [undefined,];
        if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
        if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '\'\'';
        ByRef__Html[ByRef__Html.length] = 'ctlHtml = @jsb_html.Slider(\'' + Id + '\', ' + Dftval + ', ' + CStr(Column.iminvalue) + ', ' + CStr(Column.imaxvalue) + ', 1, ' + CStr(Additionalattributes) + ')';;
    } else {
        Dftval = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));
        ByRef__Html = JSB_HTML_SLIDER(Id, Dftval, CStr(Column.iminvalue), CNum(Column.imaxvalue), 1, Additionalattributes);
    }

    return exit();
}
// </CTL_SLIDER_Sub>

// <SLIDER_EXTRAMETA_Sub>
async function JSB_CTLS_SLIDER_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({ "name": 'size', "label": 'Size', "width": 19, "control": 'textbox', "canedit": true, "default": 120 });
    Viewmodel.columns.push({ "name": 'color', "label": 'Color', "width": 19, "control": 'textbox', "canedit": true });
    Viewmodel.columns.push({ "name": 'iminvalue', "index": 31, "label": 'int Min Vaue', "width": '12em', "control": 'textbox', "canedit": true, "default": 0 });
    Viewmodel.columns.push({ "name": 'imaxvalue', "index": 32, "label": 'int Max Value', "width": '12em', "control": 'textbox', "canedit": true, "default": 100 });
    Viewmodel.columns.push({ "name": 'units', "index": 33, "label": 'Units', "width": '12em', "control": 'textbox', "canedit": true, "default": '' });
    return exit();
}
// </SLIDER_EXTRAMETA_Sub>

// <CTL_SLIDERLABELED_Sub>
async function JSB_CTLS_CTL_SLIDERLABELED_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    // See if there is a RefFIle, and make a json array, or json callback

    var Dftval = '';
    var Defaultvalue = '';
    var Values = '';

    if (Dokobinding) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
        // AdditionalAttributes[-1] = `data-bind="value: $data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`', attr: { name: '`:Column.name:`' + $index() }, css: { onKOload: window.sliderLabeled_onLoad($element) }"` ;* addIfNotInList: {}, 
        Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, 'window.sliderLabeled_onLoad($element)', undefined, true) + ', attr: { name: \'' + CStr(Column.name) + '\' + $index() }"';
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'min-width: 200px', ';', Additionalattributes);
        Id = '';
    }

    if (CBool(Column.canedit)) {
        if (Gencode) {
            Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes);
            if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';

            if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));

            if (CBool(Column.reffile)) {
                ByRef__Html = 'ctlHtml = @jsb_html.sliderLabeled("' + Id + '", @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align == 'right')) + ', ' + CStr(CNum(Column.oktocache)) + '), ' + Dftval + ', ' + CStr(CNum(Column.addBlank) + 0) + ' /* addBlank */, False /* readOnly */, ' + CStr(Additionalattributes) + ', ' + CStr(Column.multiValuedData) + ' /* multiValuedData */)';
            } else {
                ByRef__Html = 'ctlHtml = @jsb_html.sliderLabeled("' + Id + '", "' + Change(Column.reflist, '"', '\\"') + '", ' + Dftval + ', ' + CStr(CNum(Column.addBlank) + 0) + ' /* addBlank */, False /* readOnly */, ' + CStr(Additionalattributes) + ', True /* multiValuedData */)';
            }
        } else {
            if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));
            Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes);

            Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row });
            ByRef__Html = (JSB_HTML_SLIDERLABELED(Id, Values, Defaultvalue, CStr(Column.addBlank), false, Additionalattributes, CStr(CBool(Column.multiValuedData) || !isEmpty(Column.reflist))));
        }
    } else {
        await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    }
    return exit();
}
// </CTL_SLIDERLABELED_Sub>

// <SLIDERLABELED_EXTRAMETA_Sub>
async function JSB_CTLS_SLIDERLABELED_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });
    return exit();
}
// </SLIDERLABELED_EXTRAMETA_Sub>

// <CTL_SMARTCOMBOBOX_Sub>
async function JSB_CTLS_CTL_SMARTCOMBOBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    Column.control = 'combobox';
    Column.savenewvalues = true;
    ComboBox(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname);

    return exit();
}
// </CTL_SMARTCOMBOBOX_Sub>

// <SMARTCOMBOBOX_EXTRAMETA_Sub>
async function JSB_CTLS_SMARTCOMBOBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({ "name": 'autopostback', "label": 'Auto PostBack', "width": 19, "control": 'checkbox', "canedit": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });
    Viewmodel.columns.push({ "name": 'multiselect', "label": 'Allow Multi Selection', "width": 19, "control": 'checkbox', "canedit": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });

    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row });
    return exit();
}
// </SMARTCOMBOBOX_EXTRAMETA_Sub>

// <CTL_TEXTBOX_Sub>
async function JSB_CTLS_CTL_TEXTBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Defaultvalue = '';
    var Mobilepad = '';

    if (!Gencode && !Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

    if (Null0(Column.linecnt) > 1) {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'width: 100%', ';', Additionalattributes);
    } else {
        Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes);
    }

    if (Dokobinding) {
        // AdditionalAttributes[-1] = `data-bind="value:$data['`:Column.name:`'], value:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"`  
        Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, '', undefined);
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        Id = '';
    }

    if (CBool(Column.canedit)) {
        Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes); // Force to be an Array[]

        if (Column.datatype == 'integer') {
            Additionalattributes[Additionalattributes.length] = 'data-parsley-type="integer"';
            if (!InStr1(1, Additionalattributes, 'placeholder')) Additionalattributes[Additionalattributes.length] = 'placeholder="please enter an integer number"';
            Additionalattributes[Additionalattributes.length] = 'type="number"';
        }

        if (Column.datatype == 'double') {
            Additionalattributes[Additionalattributes.length] = 'data-parsley-type="number"';
            if (!InStr1(1, Additionalattributes, 'placeholder')) Additionalattributes[Additionalattributes.length] = 'placeholder="please enter a decimal number"';
            // AdditionalAttributes[-1] = `pattern="[\d]+([\.][\d]+)?"`
            Additionalattributes[Additionalattributes.length] = 'type="tel"';
        }

        Mobilepad = Column.mobilepad;
        if (Mobilepad && Null0(Column.linecnt) <= 1) {
            if (Mobilepad == 'custom') {
                Mobilepad = Column.custompad;
                if (Left(Mobilepad, 2) != '[[' || Right(Mobilepad, 2) != ']]') Println('Your ', Viewname, ' ', Id, ' field has has a malformed custom pad: ', Mobilepad);
            } else {
                if (Column.datatype == 'integer') {
                    if (Locate(Mobilepad, [undefined, 'integer', 'integer+', ''], 0, 0, 0, "", position => { })); else Println('Your ', Viewname, ' ', Id, ' field has an integer datatype and your are using a non-integer keyboard: ', Mobilepad);
                    Additionalattributes = JSB_BF_MERGEATTRIBUTE('type', 'number', ';', Additionalattributes);;
                } else if (Column.datatype == 'double') {
                    if (Locate(Mobilepad, [undefined, 'real', 'integer', 'integer+', ''], 0, 0, 0, "", position => { })); else Println('Your ', Viewname, ' ', Id, ' field has an double datatype and your are using a non-integer keyboard: ', Mobilepad);
                }
            }
        }

        if (Gencode) { if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]'; }

        if (Null0(Column.linecnt) > 1) {
            if (Gencode) {
                ByRef__Html = 'ctlHtml = @jsb_html.TextArea("' + Id + '",' + CStr(Row) + ', ' + CStr(CNum(Column.linecnt) + 0) + ', "", ' + CStr(Additionalattributes) + ')';
            } else {

                ByRef__Html = JSB_HTML_TEXTAREA(Id, Defaultvalue, CStr(Column.linecnt), '', Additionalattributes);
            }
        } else {
            if (Gencode) {
                if (Column.datatype == 'integer') {
                    ByRef__Html = 'ctlHtml = @jsb_html.IntegerBox("' + Id + '", ' + CStr(Row) + ', false, ' + CStr(Additionalattributes) + ', \'' + CStr(Column.iminvalue) + '\', \'' + CStr(Column.imaxvalue) + '\')';;
                } else if (Column.datatype == 'double') {
                    ByRef__Html = 'ctlHtml = @jsb_html.DecimalBox("' + Id + '", ' + CStr(Row) + ', false, ' + CStr(Additionalattributes) + ', \'' + CStr(Column.xminvalue) + '\', \'' + CStr(Column.xmaxvalue) + '\')';;
                } else {
                    ByRef__Html = 'ctlHtml = @jsb_html.TextBox("' + Id + '", ' + CStr(Row) + ', false, ' + CStr(Additionalattributes) + ', "' + Mobilepad + '")';
                }
            } else {
                if (Column.datatype == 'integer') {
                    ByRef__Html = INTEGERBOX(Id, Defaultvalue, false, Additionalattributes, Column.iminvalue, Column.imaxvalue);;
                } else if (Column.datatype == 'double') {
                    ByRef__Html = DECIMALBOX(Id, Defaultvalue, false, Additionalattributes, Column.xminvalue, Column.xmaxvalue);;
                } else {
                    ByRef__Html = JSB_HTML_TEXTBOX(Id, Defaultvalue, false, Additionalattributes, Mobilepad);
                }
            }
        }

        if (Gencode) {
            if (CBool(Column.mask)) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + Id + '").mask("' + Mid1(Column.mask, InStr1(1, Column.mask, ',') + 1) + '");\')'; }
            if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
        } else {
            if (CBool(Column.mask)) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$("#' + Id + '").mask("' + Mid1(Column.mask, InStr1(1, Column.mask, ',') + 1) + '");'); }
            if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
        }
    } else {
        if (Null0(Column.linecnt) > 1) {
            Additionalattributes[Additionalattributes.length] = 'readonly';
            if (Gencode) {
                if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';
                ByRef__Html = 'ctlHtml = @jsb_html.TextArea("' + Id + '", ' + CStr(Row) + ', ' + CStr(Column.linecnt) + ', "", ' + CStr(Additionalattributes) + ')';
            } else {
                ByRef__Html = JSB_HTML_TEXTAREA(Id, Defaultvalue, CStr(Column.linecnt), '', Additionalattributes);
            }
        } else {
            await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
        }
    }
    return exit();
}
// </CTL_TEXTBOX_Sub>

// <TEXTBOX_EXTRAMETA_Sub>
async function JSB_CTLS_TEXTBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({ "name": 'linecnt', "label": 'Lines', "width": 19, "control": 'textbox', "canedit": true, "defaultvalue": 1 });
    Viewmodel.columns.push({ "name": 'mobilepad', "label": 'Mobile Pad', "width": 19, "control": 'dropdownbox', "canedit": true, "defaultvalue": 'full', "addBlank": true, "reflist": 'hex;hex+;integer;integer+;real;full;custom' });
    Viewmodel.columns.push({ "name": 'custompad', "label": 'Custom Pad', "width": 19, "control": 'textbox', "canedit": true, "tooltip": '[[\'a\', \'Cancel\', \'Accept\'], [\'b\', \'Clear\', \'Delete\']]', "display": 'gridhidden', "defaultvalue": '[[\'1\',\'2\',\'3\',\'4\',\'.\',\'Accept\'],[\'5\',\'6\',\'7\',\'8\',\'-\',\'Cancel\'],[\'9\',\'0\',\'A\',\'B\',\'_\',\'Clear\'],[\'C\',\'D\',\'E\',\'F\',\'Space\',\'Delete\']]' });

    // options.layout = [['1', '2', '3', '4', '.', 'Accept'], ['5', '6', '7', '8', '-', 'Cancel'], ['9', '0', 'A', 'B', '_', 'Clear'], ['C', 'D', 'E', 'F', 'Space', 'Delete']]

    Viewmodel.columns.push({
        "name": 'regx', "index": 33, "label": 'RegX', "width": '12em', "control": 'comboBox', "canedit": true, "display": 'gridhidden',
        "reflist": 'mm/dd/yy,^(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\\d\\d$;yyyy/mm/dd,^(19|20)\\d\\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$;ZipCode,^\\d{5}(?:[-\\s]\\d{4})?$;UserName,/^[a-z0-9_-]{3,16}$/;Password,/^[a-z0-9_-]{6,18};HexValue,/^#?([a-f0-9]{6}|[a-f0-9]{3})$/;E-Mail,/^([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})$/;URL,/^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$/;IP,/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;SSN,^\\d{3}-?\\d{2}-?\\d{4}$;Phone,^(?:(?:\\+?1\\s*(?:[.-]\\s*)?)?(?:\\(\\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\\s*\\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\\s*(?:[.-]\\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\\s*(?:[.-]\\s*)?([0-9]{4})(?:\\s*(?:#|x\\.?|ext\\.?|extension)\\s*(\\d+))?$'
    });

    if (ByRef_Row.datatype == 'integer') {
        Viewmodel.columns.push({ "name": 'iminvalue', "index": 31, "label": 'int Min Vaue', "width": '12em', "control": 'textbox', "canedit": true, "display": 'gridhidden' });
        Viewmodel.columns.push({ "name": 'imaxvalue', "index": 32, "label": 'int Max Value', "width": '12em', "control": 'textbox', "canedit": true, "display": 'gridhidden' });
        delete ByRef_Row['xminvalue']
        delete ByRef_Row['xminvalue'];
    } else if (ByRef_Row.datatype == 'double') {
        Viewmodel.columns.push({ "name": 'xminvalue', "index": 31, "label": 'Min Vaue', "width": '12em', "control": 'textbox', "canedit": true, "display": 'gridhidden' });
        Viewmodel.columns.push({ "name": 'xmaxvalue', "index": 32, "label": 'Max Value', "width": '12em', "control": 'textbox', "canedit": true, "display": 'gridhidden' });
        delete ByRef_Row['iminvalue']
        delete ByRef_Row['iminvalue'];
    } else {
        delete ByRef_Row['iminvalue']
        delete ByRef_Row['iminvalue']
        delete ByRef_Row['xminvalue']
        delete ByRef_Row['xminvalue'];
    }

    Viewmodel.columns.push({ "name": 'regxtext', "index": 34, "label": 'Reg X Text', "width": '12em', "control": 'textbox', "canedit": true, "display": 'gridhidden' });

    // https://igorescobar.github.io/jQuery-Mask-Plugin/
    Viewmodel.columns.push({
        "name": 'mask', "index": 33, "label": 'Mask', "width": '12em', "control": 'comboBox', "canedit": true, "display": 'gridhidden', "tooltip": ' Use S(a-z) A(a-z,0-9) 0(req digit) 9(opt digit) #(any digits)',
        "reflist": 'mm/dd/yyyy,00/00/0000;yyyy-mm-dd,0000-00-00;ZipCode,00000;SSN,000-00-0000;Phone,(000) 000-0000'
    });
    return exit();
}
// </TEXTBOX_EXTRAMETA_Sub>

// <CTL_TIMEBOX_Sub>
async function JSB_CTLS_CTL_TIMEBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Dftval = '';
    var Defaultvalue = '';

    if (CBool(Column.canedit)) {
        if (Dokobinding) {
            Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
            // AdditionalAttributes[-1] = `data-bind="value:$data['`:Column.name:`'], value:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"`  
            Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, '', undefined);
            Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        }

        Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes);

        if (Gencode) {
            if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
            if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';
            ByRef__Html = 'ctlHtml = @jsb_html.TimeBox("' + CStr(Id) + '", ' + Dftval + ', ' + CStr(Not(Column.canedit)) + ', ' + CStr(Additionalattributes) + ')';
            if (CBool(Column.autopostback) && Id) { ByRef__Html += crlf + 'ctlHtml := @Script(\'$("#' + CStr(Id) + '").change(function() { doJsbSubmit() });\')'; }
        } else {
            if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));
            ByRef__Html = JSB_HTML_TIMEBOX(CStr(Id), Defaultvalue, Not(Column.canedit), Additionalattributes);
            if (CBool(Column.autopostback) && Id) { ByRef__Html = CStr(ByRef__Html) + JSB_HTML_SCRIPT('$(\'#' + CStr(Id) + '\').change(function() { doJsbSubmit() });'); }
        }
    } else {
        await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), CStr(Id), Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    }
    return exit(undefined);
}
// </CTL_TIMEBOX_Sub>

// <CTL_UPLOADBOX_Sub>
async function JSB_CTLS_CTL_UPLOADBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Defaultvalue = '';
    var Lbladditionalattributes = undefined;
    var Ctladditionalattributes = undefined;

    if (!Gencode && !Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));

    if (CBool(Column.canedit)) {
        Lbladditionalattributes = await JSB_CTLS_ADDPARSLEY(Column, Lbladditionalattributes); // Force to be an Array[]

        if (Dokobinding) {
            Lbladditionalattributes[Lbladditionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'text', false, undefined, undefined);
            Lbladditionalattributes[Lbladditionalattributes.length] = 'class=\'knockOutCtl\'';
            Id = '';

            // CtlAdditionalAttributes = koLoad(Column.name, Column.defaultvalue, 'fileinput', False /* addIfNotInList */, Nothing /* onload jsFunctionName */,  Nothing /* jsExtraFunctionParameters */)
            Ctladditionalattributes = [undefined, 'data-bind="attr: {name: \'KO_' + JSB_BF_NICENAME(CStr(Column.name)) + '_\' + $index() }"'];
        }

        if (Gencode) {
            if (CBool(Lbladditionalattributes)) Lbladditionalattributes = '[`' + Join(Lbladditionalattributes, '`,`') + '`]'; else Lbladditionalattributes = '[]';
            if (CBool(Ctladditionalattributes)) Ctladditionalattributes = '[`' + Join(Ctladditionalattributes, '`,`') + '`]';
            ByRef__Html = 'ctlHtml := @jsb_html.UploadBox("' + Id + '", ' + CStr(Row) + ', ' + CStr(CNum(Column.autopostback) + 0) + ' /* autopostback */, false /* allowMultipleFiles */, \'' + CStr(Column.mimetypes) + '\', ' + CStr(Lbladditionalattributes) + ', ' + CStr(Ctladditionalattributes) + ')';
        } else {
            if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));
            ByRef__Html = JSB_HTML_UPLOADBOX(Id, Defaultvalue, ':Column.autopostback + 0:', false, CStr(Column.mimetypes), Lbladditionalattributes, Ctladditionalattributes);
        }
    } else {
        await JSB_CTLS_CTL_LABEL_Sub(CStr(Projectname), Id, Column, Row, ByRef__Html, Dokobinding, Lbladditionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
    }
    return exit();
}
// </CTL_UPLOADBOX_Sub>

// <UPLOADBOX_EXTRAMETA_Sub>
async function JSB_CTLS_UPLOADBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({ "name": 'storagefile', "label": 'Storage Path', "width": 19, "control": 'textbox', "canedit": true, "default": 1 });
    Viewmodel.columns.push({ "name": 'mimetypes', "label": 'mimetypes', "width": 19, "control": 'combobox', "canedit": true, "reflist": 'audio/*;video/*;image/*' });

    Viewmodel.columns.push({ "name": 'appenddate', "label": 'Append Date', "width": 19, "control": 'checkbox', "canedit": true, "required": false, "notblank": false, "defaultvalue": 0, "reflist": 'false,0;true,1' });
    Viewmodel.columns.push({ "name": 'registeraccount', "label": 'Register as Act', "width": 19, "control": 'checkbox', "canedit": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });
    Viewmodel.columns.push({ "name": 'filenameprefix', "label": 'FileName Prefix', "width": 19, "control": 'checkbox', "canedit": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });

    return exit();
}
// </UPLOADBOX_EXTRAMETA_Sub>

// <CTL_URLBOX_Sub>
async function JSB_CTLS_CTL_URLBOX_Sub(Projectname, Id, Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html)
        return v
    }
    var Dftval = '';
    var Defaultvalue = '';

    if (CBool(Column.canedit)) {
        Additionalattributes[Additionalattributes.length] = 'data-parsley-type="url"';
        await JSB_CTLS_CTL_TEXTBOX_Sub(CStr(Projectname), CStr(Id), Column, Row, ByRef__Html, Dokobinding, Additionalattributes, Gencode, CStr(Viewname), function (_ByRef__Html) { ByRef__Html = _ByRef__Html });
        return exit(undefined);
    }

    if (Dokobinding) {
        // AdditionalAttributes[-1] = `data-bind="value:$data['`:Column.name:`'], value:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"`  
        Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, '', undefined);
        Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
        Id = '';
    }

    if (Gencode) {
        if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes, '`,`') + '`]'; else Additionalattributes = '[]';
        if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
        ByRef__Html = 'ctlHtml = @jsb_html.Anchor("' + Id + '", ' + Dftval + ', ' + Dftval + ', ' + CStr(Additionalattributes) + ')';
    } else {
        if (!Dokobinding) Defaultvalue = getDefaultValue(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), CStr(Viewname));
        ByRef__Html = Anchor(Id, Defaultvalue, Defaultvalue, Additionalattributes);
    }

    return exit(undefined);
}
// </CTL_URLBOX_Sub>

// <_ADDPARSLEY_Sub>
async function JSB_CTLS__ADDPARSLEY_Sub() {
}
// </_ADDPARSLEY_Sub>

// <ADDPARSLEY>
async function JSB_CTLS_ADDPARSLEY(Column, Additionalattributes) {
    var Parsleyneeded = undefined;
    var Attributes = undefined;

    Attributes = Additionalattributes;
    if (Not(Attributes)) {
        Attributes = [undefined,];
    } else if (typeOf(Attributes) != 'Array') {
        Attributes = JSB_BF_MERGEATTRIBUTE('', '', '', Attributes);
    }

    if (CBool(Column.tooltip)) {
        if (!InStr1(1, Attributes, 'title')) Attributes[Attributes.length] = 'title="' + CStr(Column.tooltip) + '"';
        if (!InStr1(1, Attributes, 'placeholder')) Attributes[Attributes.length] = 'placeholder="' + CStr(Column.tooltip) + '"';
    } else if (CBool(Column.suppresslabel)) {
        if (!InStr1(1, Attributes, 'title')) Attributes[Attributes.length] = 'title="' + CStr(Column.label) + '"';
        if (!InStr1(1, Attributes, 'placeholder')) Attributes[Attributes.length] = 'placeholder="' + CStr(Column.label) + '"';
    } else if (CBool(Column.label)) {
        if (!InStr1(1, Attributes, 'placeholder')) Attributes[Attributes.length] = 'placeholder="' + CStr(Column.label) + '"';
    }

    Parsleyneeded = (CBool(Column.required) || CBool(Column.notblank) || !isEmpty(Column.iminvalue) || !isEmpty(Column.imaxvalue) || !isEmpty(Column.xminvalue) || !isEmpty(Column.xmaxvalue) || !isEmpty(Column.regx));
    if (!Parsleyneeded) return Attributes;

    Attributes[Attributes.length] = [undefined, 'parsley-trigger="change focusout"'];
    if (CBool(Column.required) || CBool(Column.notblank)) Attributes[Attributes.length] = 'required';

    if (Column.datatype == 'integer') {
        if (Len(Column.iminvalue)) Attributes[Attributes.length] = 'min="' + CStr(Column.iminvalue) + '"';
        if (Len(Column.imaxvalue)) Attributes[Attributes.length] = 'max="' + CStr(Column.imaxvalue) + '"';
    } else if (Column.datatype == 'double') {
        if (CBool(Column.xminvalue)) Attributes[Attributes.length] = 'min="' + CStr(Column.xminvalue) + '"';
        if (CBool(Column.xmaxvalue)) Attributes[Attributes.length] = 'max="' + CStr(Column.xmaxvalue) + '"';
    }

    if (CBool(Column.regx)) {
        Attributes[Attributes.length] = 'pattern="' + Mid1(Column.regx, InStr1(1, Column.regx, ',') + 1) + '"';
        if (CBool(Column.regxtext)) Attributes[Attributes.length] = 'data-parsley-error-message="' + CStr(Column.regxtext) + '"';
    }

    Attributes = JSB_BF_MERGEATTRIBUTE('onchange', 'parsleyReset(this)', ';', Attributes);

    return Attributes;
}
// </ADDPARSLEY>

// <_GETDEFAULTFMT_Sub>
async function JSB_CTLS__GETDEFAULTFMT_Sub() {
}
// </_GETDEFAULTFMT_Sub>

// <GETDEFAULTFMT>
async function JSB_CTLS_GETDEFAULTFMT(Row, Defaultvalue, Columnname) {
    var Defaultvalues = undefined;
    var R = undefined;
    var Isexpression = undefined;
    var I = undefined;
    var Funcname = '';
    var Extra = '';
    var Newdefaultvalue = '';
    var Mrow = '';
    var Q = '';
    var Ldftval = '';

    if (Not(Defaultvalue)) return CStr(Row) + '';

    // Check for {xxx} substituions
    Isexpression = (InStr1(1, Defaultvalue, '{') || InStr1(1, Defaultvalue, '(') || InStr1(1, Defaultvalue, '+') || InStr1(1, Defaultvalue, '-') || InStr1(1, Defaultvalue, '/') || InStr1(1, Defaultvalue, '*') || InStr1(1, Defaultvalue, ':'));
    Defaultvalues = Split(Defaultvalue, '{');
    R = [undefined, Defaultvalues[1]];
    var _ForEndI_2 = UBound(Defaultvalues);
    for (I = 2; I <= _ForEndI_2; I++) {
        Funcname = LTrim(RTrim(Defaultvalues[I]));
        Funcname = Field(Funcname, '}', 1);
        if (Left(Funcname, 1) == '@') Funcname = Mid1(Funcname, 2);

        if (InStr1(1, Funcname, '(')) {
            Extra = '(' + dropLeft(Funcname, '(');
            Funcname = Field(Funcname, '(', 1);
        } else {
            Extra = '';
        }

        switch (LCase(Funcname)) {
            case 'objectname': case 'viewname':
                Newdefaultvalue = '\'' + CStr(Columnname) + '\'';

                break;

            case 'niceobjectname': case 'niceviewname':
                Newdefaultvalue = '\'' + JSB_BF_NICENAME(CStr(Columnname)) + '\'';

                break;

            case 'paramvar': case '@param':
                Newdefaultvalue = '@ParamVar' + Extra;

                break;

            case 'sessionvar': case 'session':
                Newdefaultvalue = '@SessionVar' + Extra;

                break;

            case 'applicationvar': case 'application':
                Newdefaultvalue = '@ApplicationVar' + Extra;

                break;

            case 'queryvar': case 'urlparam': case 'urlvar': case 'param':
                Newdefaultvalue = '@QueryVar' + Extra;

                break;

            case 'lastvalue':
                Newdefaultvalue = '@session(\'LastValue:' + CStr(Columnname) + '\')';

                break;

            case 'time':
                Newdefaultvalue = 'Time(Time())';

                break;

            case 'itime':
                Newdefaultvalue = 'Time()';

                break;

            case 'timestamp': case 'now':
                Newdefaultvalue = 'Now()';

                break;

            case 'yy':
                Newdefaultvalue = 'Mid(Date(Date()), 3, 2)';

                break;

            case 'yyyy':
                Newdefaultvalue = 'Theyear(Date())';

                break;

            case 'mm':
                Newdefaultvalue = 'Themonth(Date())';

                break;

            case 'dd':
                Newdefaultvalue = 'Theday(Date())';

                break;

            case 'date':
                Newdefaultvalue = 'Date(Date())';

                break;

            case 'idate':
                Newdefaultvalue = 'Date()';

                break;

            case 'datetime':
                Newdefaultvalue = 'DateTime()';

                break;

            case 'timedate':
                Newdefaultvalue = 'TimeDate()';

                break;

            case 'guid':
                Newdefaultvalue = 'Guid()';

                break;

            case 'username':
                Newdefaultvalue = '@UserName';

                break;

            default:
                // Assumed to be a column name
                Mrow = Field(Row, '[', 1);
                Newdefaultvalue = Mrow + '[\'' + Funcname + '\']';
        }

        R[R.length] = 'IFF(' + CStr(Row) + ', ' + CStr(Row) + ', ' + Newdefaultvalue + ')';
    }
    Newdefaultvalue = Join(R, '');

    Q = '';
    if (!Isexpression) {
        Newdefaultvalue = Defaultvalue;
        Ldftval = LCase(Defaultvalue);

        if (isNumeric(Newdefaultvalue)); else if (Ldftval == 'false' || Ldftval == 'true' || Ldftval == 'null'); else if (Left(Newdefaultvalue, 1) == '\'' && Right(Newdefaultvalue, 1) == '\''); else if (Left(Newdefaultvalue, 1) == '"' && Right(Newdefaultvalue, 1) == '"'); else if (Left(Newdefaultvalue, 1) == '`' && Right(Newdefaultvalue, 1) == '`'); else if (!InStr1(1, Newdefaultvalue, '`')) {
            Q = '`';
        } else if (!InStr1(1, Newdefaultvalue, '\'')) {
            Q = '\'';
        } else if (!InStr1(1, Newdefaultvalue, '"')) {
            Q = '"';
        } else {
            Alert('Your default value for ' + Newdefaultvalue + ' contains both types of quotes.');
        }
    }

    return 'IFF(' + CStr(Row) + ', ' + CStr(Row) + ', ' + Q + Newdefaultvalue + Q + ')';
}
// </GETDEFAULTFMT>

// <_JSON_SETUP_Sub>
async function JSB_CTLS__JSON_SETUP_Sub() {
}
// </_JSON_SETUP_Sub>

// <JSON_SETUP>
async function JSB_CTLS_JSON_SETUP(Projectname, Id, Column, Row, ByRef_Errors, Additionalattributes, ByRef_Defaultrow, ByRef_Dataset, ByRef_Model, ByRef_Editviewname, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Errors, ByRef_Defaultrow, ByRef_Dataset, ByRef_Model, ByRef_Editviewname)
        return v
    }
    var Columndefs = undefined;
    var Fhandle = undefined;
    var Xmodel = undefined;
    var Def = undefined;
    var Js = undefined;
    var Inlinerow = undefined;
    var Scolumn = undefined;
    var Cdefs = '';
    var D = '';

    ByRef_Editviewname = '';

    if (CBool(Column.useview)) {
        if (await JSB_ODB_READJSON(Xmodel, await JSB_BF_FHANDLE('dict', Projectname), CStr(Column.useview), function (_Xmodel) { Xmodel = _Xmodel })); else {
            ByRef_Errors = html('Unable to find view ' + CStr(Column.useview) + ' for json_inline column ' + CStr(Column.name));
            return exit(false);
        }
        ByRef_Editviewname = CStr(Projectname) + '*' + CStr(Column.useview);
        Columndefs = Xmodel.columns;;
    } else if (CBool(Column.reflist)) {
        Cdefs = Change(Column.reflist, am, '');
        Columndefs = parseJSON('{cdefs:[' + Cdefs + ']}').cdefs;;
    } else if (!isEmpty(Column.reffile)) {
        if (LCase(Column.reffile) == 'jsb_jsondefs') {
            if (await JSB_ODB_READ(Cdefs, await JSB_BF_FHANDLE('jsb_jsondefs'), CStr(Column.refpk), function (_Cdefs) { Cdefs = _Cdefs })) {
                Cdefs = Change(Cdefs, am, '');
                Columndefs = parseJSON('{cdefs:[' + Cdefs + ']}').cdefs;
            } else {
                ByRef_Errors = html('Unable to find refpk ' + CStr(Column.refpk) + ' in jsb_jsondefs column ' + CStr(Column.name));
                return exit(false);
            }
        } else {
            if (await JSB_ODB_OPEN('Dict', CStr(Column.reffile), Fhandle, function (_Fhandle) { Fhandle = _Fhandle })); else {
                ByRef_Errors = html('Unable to find reffile ' + CStr(Column.reffile) + ' for json_inline column ' + CStr(Column.name));
                return exit(false);
            }
            Columndefs = await JSB_BF_GETTABLECOLUMNDEFS(CStr(Column.reffile), CStr(false), true);;
        }
    } else {
        ByRef_Errors = html('Your json_inline for column ' + CStr(Column.name) + ' isn\'t setup correctly.  There is no reflist.');
        return exit(false);
    }

    var Tstdataset = clone(Row[Column.name]);
    if (typeOf(Tstdataset) != 'Array') {
        if (isEmpty(Tstdataset)) Tstdataset = '[]';
        if (Left(Tstdataset, 1) == '{') Tstdataset = '[' + CStr(Tstdataset) + ']';
        if (Left(Tstdataset, 1) != '[') Tstdataset = '[]';
        Tstdataset = parseJSON('{dset:' + CStr(Tstdataset) + '}').dset;
    }
    ByRef_Dataset = Tstdataset;
    At_Session.Item('MYDATASET', ByRef_Dataset);

    ByRef_Defaultrow = {};

    // set default values in defaultRow and insure json_inline values are an array in the Row
    for (Def of iterateOver(Columndefs)) {
        if (CBool(Def.name)) {
            D = Def.defaultvalue;
            if (Def.control == 'json_inline') {
                if (Left(D, 1) != '[' || Right(D, 1) != ']') {
                    if (Left(D, 1) == '{' && Right(D, 1) == '}') D = '[' + D + ']'; else D = '[]';
                }
                Js = parseJSON('{array:' + D + '}');
                D = Js.array;
                for (Inlinerow of iterateOver(ByRef_Dataset)) {
                    if (Not(isArray(Inlinerow[Def.name]))) Inlinerow[Def.name] = [undefined,];
                }
            }
            ByRef_Defaultrow[Def.name] = D;
        }
    }

    if (Not(Column.canedit)) {
        for (Scolumn of iterateOver(Columndefs)) {
            Scolumn.canedit = false;
            Scolumn.pickfunction = '';
        }
    }

    ByRef_Model = {};

    ByRef_Model.columns = Columndefs;
    return exit(true);
}
// </JSON_SETUP>

// <_KOGRIDVIEWNCOLUMNS_Sub>
async function JSB_CTLS__KOGRIDVIEWNCOLUMNS_Sub() {
}
// </_KOGRIDVIEWNCOLUMNS_Sub>

// <KOGRIDVIEWNCOLUMNS>
async function JSB_CTLS_KOGRIDVIEWNCOLUMNS(Projectname, Modelcolumns, Parentmodel, Id, Removerowtext, Canedit, Viewname) {
    var _Html = undefined;
    var Ci = undefined;
    var Ctlname = '';
    var L1 = '';
    var Nicecolumnname = '';
    var Ctlhtml = '';
    var Pickurl = '';
    var Pid = '';
    var Column = undefined;
    var Additionalattrs = undefined;

    _Html = [undefined,];
    _Html[_Html.length] = html('\<tr\>');

    Ci = LBound(Modelcolumns) - 1;
    for (Column of iterateOver(Modelcolumns)) {
        Ci++;
        if (Column.display != 'hidden' && !isEmpty(Column.name)) {
            Ctlname = LCase(Column.control);
            if (!Ctlname) Ctlname = 'textbox';

            if (Ctlname == 'json_inline') Ctlname = 'json_popup';

            L1 = Column.label;
            Nicecolumnname = 'KO_' + JSB_BF_NICENAME(CStr(Column.name));

            Ctlname = 'jsb_ctls.ctl_' + Ctlname;
            Additionalattrs = [undefined, 'style=\'width:auto;' + CStr(Column.ctlstyle) + '\''];
            if (Null0(Column.linecnt) > 1) Column.linecnt = 1;
            Ctlhtml = '';

            await asyncCallByName(Ctlname, me, 0 /*ignore if missing */, Projectname, Nicecolumnname, Column, {}, Ctlhtml, true, Additionalattrs, false, Viewname, function (_Ctlhtml) { Ctlhtml = _Ctlhtml });

            if (CBool(Column.pickfunction)) {
                Pickurl = dropIfRight(CStr(Column.pickfunction), '.page');
                Pickurl = Change(Pickurl, '{projectname}', urlEncode(Projectname));
                if (InStr1(1, Pickurl, '//') == 0) {
                    if (Left(Pickurl, 1) == '/') Pickurl = Mid1(Pickurl, 2);
                    Pickurl = jsbRestCall(Pickurl);
                }
                Ctlhtml = addPick(Ctlhtml, Nicecolumnname, 'Pick ' + L1, '80%', '60%', Pickurl, Column.autopostback);
            }

            _Html[_Html.length] = html('\<td\>\<mdlctl id=\'ctl_' + Nicecolumnname + '\'\>') + Ctlhtml + html('\</mdlctl\>\</td\>');
        }
    }

    if (Canedit) {
        if (Not(Removerowtext)) Removerowtext = 'Remove';
        _Html[_Html.length] = html('\<td class="anchorRemoveGridTD"\>');

        if (Parentmodel) {
            Pid = JSB_BF_NICENAME(Change(Parentmodel, '().', '_')) + CStr(Id);
            _Html[_Html.length] = html('\<a class="anchorRemoveGridRow" data-bind="click: function() { if (confirm(\'Are you sure you want to ' + Removerowtext + ' this row?\')) koModel.' + Pid + '_delRow($data, $index(), $parent) } "\>' + Removerowtext + '\</a\>');
        } else {
            // Html[-1] = @Html(`<a class="anchorRemoveGridRow" data-bind="click: function() { $root.`:PID:`_delRow">`:removeRowText:`</a>`)
            _Html[_Html.length] = html('\<a class="anchorRemoveGridRow" data-bind="click: function() { if (confirm(\'Are you sure you want to ' + Removerowtext + ' this row?\')) koModel.' + CStr(Id) + '_delRow($data, $index()) }"\>' + Removerowtext + '\</a\>');
        }

        _Html[_Html.length] = html('\</td\>');
    }

    _Html[_Html.length] = html('\</tr\>');

    return Join(_Html, '');
}
// </KOGRIDVIEWNCOLUMNS>

// <_KOLOAD_Sub>
async function JSB_CTLS__KOLOAD_Sub() {
}
// </_KOLOAD_Sub>

// <KOLOAD>
async function JSB_CTLS_KOLOAD(Columnname, Defaultvalue, Valuefield, Addifnotinlist, Jsfunctionname, Jsextrafunctionparameters, Dontclosestring) {
    var Result = '';

    if (Len(Jsextrafunctionparameters)) Jsextrafunctionparameters = ', ' + CStr(Jsextrafunctionparameters);
    if (Not(Valuefield)) Valuefield = 'value';
    Result = 'data-bind="';
    if (Addifnotinlist) { Result += 'addIfNotInList: {}, '; }
    Result += 'attr: {id: \'KO_' + JSB_BF_NICENAME(CStr(Columnname)) + '_\' + $index()}, ';
    // result := `attr: {id: 'KO_`:NiceName(ColumnName):`'}, `
    if (Defaultvalue) {
        Result += Valuefield + ': $data[\'' + CStr(Columnname) + '\'], ' + Valuefield + ': $data[\'' + CStr(Columnname) + '\']?$data[\'' + CStr(Columnname) + '\']:\'' + CStr(Defaultvalue) + '\'';
    } else {
        Result += Valuefield + ': $data[\'' + CStr(Columnname) + '\']';
    }
    Result += ', valueUpdate:\'blur\'';
    if (Jsfunctionname) {
        if (InStr1(1, Jsfunctionname, '(')) {
            Result += ', css: { ' + JSB_BF_NICENAME(CStr(Columnname)) + '_load: ' + CStr(Jsfunctionname) + ' }';
        } else {
            Result += ', css: { ' + JSB_BF_NICENAME(CStr(Columnname)) + '_load: ' + CStr(Jsfunctionname) + '($element, $data, $index' + Jsextrafunctionparameters + ') }';
        }
    }
    if (Not(Dontclosestring)) Result += '"';
    return Result;
}
// </KOLOAD>

// <_PUSH_REFEXTRAMETA_Sub>
async function JSB_CTLS__PUSH_REFEXTRAMETA_Sub() {
}
// </_PUSH_REFEXTRAMETA_Sub>

// <PUSH_REFEXTRAMETA_Sub>
async function JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({ "name": 'lblRef', "label": 'ref', "control": 'label', "suppresslabel": true, "fullline": true, "defaultvalue": 'The following fields are for your Reference file' });
    Viewmodel.columns.push({ "name": 'reffile', "index": 21, "label": 'Ref File', "width": '12em', "control": 'comboBox', "autopostback": true, "canedit": true, "reffile": '{listfiles}' });
    Viewmodel.columns.push({ "name": 'refsql', "label": 'Ref SQL', "width": '12em', "control": 'textbox', "canedit": true, "notblank": false });
    Viewmodel.columns.push({ "name": 'refpk', "label": 'Ref PK', "width": '12em', "control": 'comboBox', "canedit": true, "reffile": '{!reffile}' });
    Viewmodel.columns.push({ "name": 'refdisplay', "label": 'Ref display', "width": '12em', "control": 'comboBox', "canedit": true, "reffile": '{!reffile}' });
    Viewmodel.columns.push({ "name": 'refwhere', "label": 'Ref Where', "width": '12em', "control": 'textbox', "canedit": true, "notblank": false });
    Viewmodel.columns.push({ "name": 'reflist', "label": 'Ref List', "width": 23, "control": 'textbox', "canedit": true, "tooltip": 'Display,Key;...' });
    Viewmodel.columns.push({ "name": 'multiValuedData', "newlineprefix": true, "label": 'multi-Valued Data', "control": 'checkbox', "canedit": true, "defaultvalue": 1, "reflist": 'false,0;true,1' });
    Viewmodel.columns.push({ "name": 'addBlank', "label": 'Add Blank Value', "control": 'checkbox', "canedit": true, "defaultvalue": 0, "reflist": 'false,0;true,1' });
    Viewmodel.columns.push({ "name": 'oktocache', "label": 'OK 2 Cache', "control": 'checkbox', "canedit": true, "defaultvalue": true, "reflist": 'false,0;true,1' });
    Viewmodel.columns.push({ "name": 'savenewvalues', "label": 'Save New Values', "control": 'checkbox', "canedit": true, "defaultvalue": false, "reflist": 'false,0;true,1' });

    Viewmodel.columns.push({ "name": 'lblRef2', "label": 'ref2', "control": 'label', "suppresslabel": true, "fullline": true, "defaultvalue": '' });
    Viewmodel.columns.push({});
    return exit();
}
// </PUSH_REFEXTRAMETA_Sub>

// <_REPEATERFORMBACKGROUND_Pgm>
async function JSB_CTLS__REPEATERFORMBACKGROUND_Pgm() {  // PROGRAM
    Commons_JSB_CTLS = {};
    Equates_JSB_CTLS = {};

    return;
}
// </_REPEATERFORMBACKGROUND_Pgm>

// <REPEATERFORMBACKGROUND>
async function JSB_CTLS_REPEATERFORMBACKGROUND(Projectname, Id, Objectmodel, Dataarray, Removerowtext, Canedit, Parentmodel, Viewname) {
    // local variables
    var _Html, Cm;

    var Dropit = undefined;
    var Lastdivi = undefined;
    var Ls = '';
    var Rs = '';
    var Pfx = '';
    var _Innerhtml = '';

    At_Session.Item('MYDATASET', Dataarray);

    _Innerhtml = await JSB_MDL_FORMVIEWNCOLUMNS(CStr(Projectname), Objectmodel, CNum(CStr(Id) + '().'), {}, CStr(Viewname));

    if (Canedit && Removerowtext) {
        Dropit = InStr1(1, _Innerhtml, '\<div class="form-group row"\>') < 40;
        if (Dropit) {
            Lastdivi = Index1(_Innerhtml, '\</div\>', Count(_Innerhtml, '\</div\>'));
            Ls = Left(_Innerhtml, Lastdivi - 1);
            Rs = Mid1(_Innerhtml, Lastdivi);
        } else {
            Ls = _Innerhtml;
            Rs = '';
        }

        Pfx = '\<div class="col-xs-1"\>\<a class="anchorRemoveRow" style="display:table" data-bind="click: function() { if (confirm(\'Are you sure you want to ' + CStr(Removerowtext) + ' this row?\'))';
        Rs += html('\</div\>');

        if (Parentmodel) {
            _Innerhtml = Ls + html(Pfx + ' $root.' + JSB_BF_NICENAME(Change(Parentmodel, '().', '_')) + CStr(Id) + '_delRow($data, $index(), $parent) } "\>' + CStr(Removerowtext) + '\</a\>') + Rs;
        } else {
            _Innerhtml = Ls + html(Pfx + ' koModel.' + CStr(Id) + '_delRow($data, $index()) }"\>' + CStr(Removerowtext) + '\</a\>') + Rs;
        }
    }

    _Innerhtml = Div(CStr(Id) + '_ContextDiv', _Innerhtml, [undefined, 'class=\'inlineJsonBlock\'']);
    _Html = JSB_HTML_REPEATERHTML(CStr(Id), 'div', html('\<div class=\'inlineJson ' + CStr(Id) + '\'\>'), _Innerhtml, html('\</div\>'), CStr(Parentmodel));
    _Html = Change(_Html, 'mdlctl', 'nstctl');

    if (CBool(isAdmin()) && Viewname) {
        Cm = {};
        Cm[Viewname] = { "cmd": 'viewView', "val": Viewname };
        Cm[Viewname] = { "cmd": 'editView', "val": Viewname };

        _Html = CStr(_Html) + CStr(ContextMenu('#' + CStr(Id) + '_ContextDiv', Cm));
    }

    return _Html;
}
// </REPEATERFORMBACKGROUND>

// <_REPEATERGRIDBACKGROUND_Pgm>
async function JSB_CTLS__REPEATERGRIDBACKGROUND_Pgm() {  // PROGRAM
    Commons_JSB_CTLS = {};
    Equates_JSB_CTLS = {};

    return;
}
// </_REPEATERGRIDBACKGROUND_Pgm>

// <REPEATERGRIDBACKGROUND>
async function JSB_CTLS_REPEATERGRIDBACKGROUND(Projectname, Id, Objectmodel, Dataarray, Removerowtext, Canedit, Parentmodel, Viewname) {
    // local variables
    var Modelcolumns, Ci, Column, _Html;

    var Cm = undefined;
    var Koid = '';
    var Outerhtmlprefix = '';
    var _Innerhtml = '';
    var Outerhtmlsuffix = '';

    Modelcolumns = await JSB_MDL_DROPGRIDCOLUMNS(Objectmodel.columns);

    At_Session.Item('MYDATASET', Dataarray);

    if (Parentmodel) Koid = JSB_BF_NICENAME(CStr(Id)); else Koid = 'koModel.' + JSB_BF_NICENAME(CStr(Id));

    Outerhtmlprefix = html('\<table id="' + JSB_BF_NICENAME(CStr(Id)) + '_table" class="repeaterTable" data-bind="visible: ' + Koid + '().length\>0"\>\<thead\>');

    var _ForEndI_2 = UBound(Modelcolumns);
    for (Ci = 1; Ci <= _ForEndI_2; Ci++) {
        Column = Modelcolumns[Ci];
        if (isEmpty(Column.control)) Column.control = 'textbox';
        Outerhtmlprefix += html('\<th\>') + CStr(Column.label) + html('\</th\>');
    }

    Outerhtmlprefix += html('\<th\>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\</th\>\</thead\>');

    if (Viewname) {
        _Innerhtml = await JSB_CTLS_KOGRIDVIEWNCOLUMNS(CStr(Projectname), Modelcolumns, CStr(Parentmodel), CStr(Id), CStr(Removerowtext), Canedit, CStr(Viewname));
    } else {
        _Innerhtml = await JSB_CTLS_KOGRIDVIEWNCOLUMNS(CStr(Projectname), Modelcolumns, CStr(Parentmodel), CStr(Id), CStr(Removerowtext), Canedit, CStr(Objectmodel.attachdb) + am + CStr(Objectmodel.tableName));
    }

    Outerhtmlsuffix = html('\</table\>');

    _Html = JSB_HTML_REPEATERHTML(CStr(Id), 'tbody', Outerhtmlprefix, _Innerhtml, Outerhtmlsuffix, CStr(Parentmodel));

    if (CBool(isAdmin()) && Viewname) {
        Cm = {};
        Cm[Viewname] = { "cmd": 'viewView', "val": Viewname };
        Cm[Viewname] = { "cmd": 'editView', "val": Viewname };

        // CM = []
        // CM[-1] = "Display: ":viewname:",viewView,":viewName
        // CM[-1] = "Edit: ":viewname:",editView,":viewName

        _Html = CStr(_Html) + CStr(ContextMenu('#' + JSB_BF_NICENAME(CStr(Id)) + '_table', Cm));
    }

    return _Html;
}
// </REPEATERGRIDBACKGROUND>