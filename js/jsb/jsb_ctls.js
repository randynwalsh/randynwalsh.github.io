
// <CTL_AUTOTEXTBOX_Sub>
async function JSB_CTLS_CTL_AUTOTEXTBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_autotextbox", "JSB_CTLS_CTL_AUTOTEXTBOX_Sub");
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
             W = JSB_BF_JSESCAPESTRING(await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row }));
          } else {
             W = JSB_BF_JSESCAPESTRING(CStr(Column.reflist));
          }

          Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, 'window.autoCompleteTextBox($element, `:w:`, `:Val(column.minLength):`, null, `:Val(Column.restrict2List):`)', ''); 

          Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\''; 
          Id = '';
       }

       Mobilepad = Column.mobilepad; 
       if (Mobilepad) {
          if (Mobilepad=='custom') {
             Mobilepad = Column.custompad; 
             if (Left(Mobilepad,2)!='[[' || Right(Mobilepad,2)!=']]') Println('Your ', Viewname, ' ', Id, ' field has has a malformed custom pad: ', Mobilepad);
          } else {
             if (Column.datatype=='integer') {
                if (Locate(Mobilepad, [undefined, 'integer', 'integer+', ''], 0, 0, 0, "", position => { })); else Println('Your ', Viewname, ' ', Id, ' field has an integer datatype and your are using a non-integer keyboard: ', Mobilepad);
                Additionalattributes = JSB_BF_MERGEATTRIBUTE('type', 'number', ';', Additionalattributes);
             } else if (Column.datatype=='double') {
                if (Locate(Mobilepad, [undefined, 'real', 'integer', 'integer+', ''], 0, 0, 0, "", position => { })); else Println('Your ', Viewname, ' ', Id, ' field has an double datatype and your are using a non-integer keyboard: ', Mobilepad);
             }
          }

          Additionalattributes = JSB_BF_MERGEATTRIBUTE('mobilepad', Mobilepad, ';', Additionalattributes);
       }

       if (Gencode) {
          if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';
          if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));

          if (CBool(Column.includeurl) && CBool(Column.arrayname)) {
             ByRef_Html = 'ctlHtml = @jsb_html.AutoTextBoxIncludeURL("' + Id + '", "' + CStr(Column.includeurl) + '", "' + CStr(Column.arrayname) + '", ' + Dftval + ', ' + CStr(CNum(Column.minLength)) + ', ' + CStr(Additionalattributes) + ', ' + CStr(Not(Column.noSubValues)) + ', ' + CStr(CNum(Column.restrict2List)) + ')'; // 9 Parameters;
          } else if (CBool(Column.reffile)) {
             ByRef_Html = ' ctlHtml = @jsb_html.autoTextBox("' + Id + '", @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align=='right')) + ', ' + CStr(CNum(Column.oktocache)) + '), ' + Dftval + ', ' + CStr(CNum(Column.minLength)) + ', ' + CStr(Additionalattributes) + ', ' + CStr(Not(Column.noSubValues)) + ', ' + CStr(CNum(Column.restrict2List)) + ')'; // 8 Parameters;
          } else {
             ByRef_Html = ' ctlHtml = @jsb_html.autoTextBox("' + Id + '", ' + JSB_BF_JSESCAPESTRING(CStr(Column.reflist)) + ', ' + Dftval + ', ' + CStr(CNum(Column.minLength)) + ', ' + CStr(Additionalattributes) + ', ' + CStr(Not(Column.noSubValues)) + ', ' + CStr(CNum(Column.restrict2List)) + ')';
          }

          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(' + Chr(96) + '$(\'#' + Id + '\').change(function() { doJsbSubmit() });' + Chr(96) + ')'; }
       } else {
          Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row }); 
          if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

          if (CBool(Column.includeurl) && CBool(Column.arrayname)) {
             ByRef_Html = JSB_HTML_AUTOTEXTBOXINCLUDEURL(Id, CStr(Column.includeurl), CStr(Column.arrayname), Defaultvalue, CNum(Column.minLength), Additionalattributes, Not(Column.noSubValues), CNum(Column.restrict2List)); ;
          } else {
             ByRef_Html = JSB_HTML_AUTOTEXTBOX(Id, Values, Defaultvalue, CNum(Column.minLength), Additionalattributes, CStr(Not(Column.noSubValues)), CNum(Column.restrict2List));
          }

          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
       }
    } else {
       // Prevents change
       await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
    }
    return exit(); 
}
// </CTL_AUTOTEXTBOX_Sub>

// <AUTOTEXTBOX_EXTRAMETA_Sub>
async function JSB_CTLS_AUTOTEXTBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_AUTOTEXTBOX", "JSB_CTLS_AUTOTEXTBOX_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({"name":'includeurl',"label":'JS Include Url',"width":19,"control":'textbox',"canedit":true,"notblank":false});
    // viewModel.columns.push ({name:'valuefield', label:'Value FieldName', width:19, control:'textbox', canedit:true, notblank: false })
    Viewmodel.columns.push({"name":'arrayname',"label":'JS Array Name',"width":19,"control":'textbox',"canedit":true,"notblank":false});
    Viewmodel.columns.push({"name":'minLength',"label":'minLength 4 Popup',"width":19,"control":'textbox',"canedit":true,"notblank":false});
    Viewmodel.columns.push({"name":'restrict2List',"label":'restrict2List',"width":19,"control":'checkbox',"canedit":true,"defaultvalue":1,"reflist":'false,0;true,1'});

    await JSB_CTLS_TEXTBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 

    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 
    return exit(); 
}
// </AUTOTEXTBOX_EXTRAMETA_Sub>

// <CTL_BUTTON_Sub>
async function JSB_CTLS_CTL_BUTTON_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_button", "JSB_CTLS_CTL_BUTTON_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    var Label = ''; 
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

    Label = Column.label; 
    if (!Label) Label = Column.name;
    Url = dropIfRight(Column.transferurl, '.page'); 

    if (CBool(Column.height)) { Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'height:"' + CStr(Column.height) + '"', ';', Additionalattributes); }
    Onclick = 'window.eventHandler_' + CStr(nicename(Column.name)) + '(json2string($("#jsb")), "??ItemID??")'; 
    Additionalattributes = JSB_BF_MERGEATTRIBUTE('onclick', Onclick, ';', Additionalattributes); 

    if (Dokobinding) {
       Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
       Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\''; 
       Id = '';
    }

    if (Gencode) {
       Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; 
       Label = '"' + Label + '"'; 
       Zurl = '"' + Url + '"'; 

       if (CBool(Row)) {
          switch (Column.datausuage) {
             case 'As Url': 
                Zurl = Row; 

          break; 

             case 'As Parameter': 
                if (InStr1(1,Url,'?')) Add = ('&'); else Add = '?';
                Zurl = '"' + Url + Add + CStr(Column.onParentExtra) + '=":@UrlEncode(' + CStr(Row) + ')'; 

          break; 

             case 'As Text': 
                Label = Row;           
       }
       }

       ByRef_Html = 'ctlHtml = @jsb_html.Button("' + Id + '", ' + Label + ', ' + CStr(Additionalattributes) + ')'; 
       ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @genEventHandler("' + CStr(nicename(Column.name)) + '", ' + Zurl + ', ' + CStr(CNum(Column.transferto)+0) + ', "' + CStr(Column.onParentExtra) + '", ' + CStr(CNum(Column.transferaddfrompage)+0) + ')';
    } else {
       if (CBool(Row)) {
          Data = Row[Column.name]; 
          switch (Column.datausuage) {
             case 'As Url': 
                Url = Data; 

          break; 

             case 'As Parameter': 
                if (InStr1(1,Url,'?')) Add = ('&'); else Add = '?';
                Url += Add + CStr(Column.onParentExtra) + '=' + CStr(urlEncode(Data)); 

          break; 

             case 'As Text': 
                Label = Data;           
       }
       }
       Onparentjavascript = JSB_BF_GENEVENTHANDLER(CStr(nicename(Column.name)), Url, CNum(Column.transferto)+0, CStr(Column.onParentExtra), CNum(Column.transferaddfrompage)+0); 
       ByRef_Html = JSB_HTML_BUTTON(Id, Label, Additionalattributes) + Onparentjavascript;
    }

    return exit(undefined); 
}
// </CTL_BUTTON_Sub>

// <BUTTON_EXTRAMETA_Sub>
async function JSB_CTLS_BUTTON_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_BUTTON", "JSB_CTLS_BUTTON_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({"name":'datausuage',"label":'data Usuage',"width":19,"control":'dropdownbox',"canedit":true,"reflist":'As Url;As Parameter;As Text'});
    Viewmodel.columns.push({"name":'transferto',"index":46,"label":'Transfer To',"datatype":'number',"suppresslabel":false,"control":'dropdownbox',"canedit":true,"notblank":true,"defaultvalue":'10',"reflist":'new window,1;New Window Tab,2;Tab (name in Transfer Xtra),3;Frame (name in Transfer Xtra),4;Dialog (Title in Transfer Xtra),6;HTTP POST (Transfer Extra becomes formVar Name and contains SelectedID),7;HTTP GET,8;Current Window,10;JavaScript (in Transfer Extra),11;Top Window,12;Back,13;Next Tab,14;Previous Tab,15;Close Window,16;Return Pick Value,17'});
    Viewmodel.columns.push({"name":'transferurl',"index":47,"label":'Transfer URL',"datatype":'string',"suppresslabel":false,"control":'combobox',"canedit":true,"defaultvalue":'',"reffile":'dict {projectname}',"refpk":'ItemID',"refwhere":'ItemID Like \'%.page\'',"pickfunction":'edp_pick?projectName={projectname}'});
    Viewmodel.columns.push({"name":'onParentExtra',"index":48,"label":'Transfer Extra',"datatype":'string',"suppresslabel":false,"control":'textbox',"canedit":true,"defaultvalue":''});
    Viewmodel.columns.push({"name":'transferaddfrompage',"index":48,"label":'add fromPage',"suppresslabel":false,"control":'checkbox',"canedit":true,"defaultvalue":1});
    Viewmodel.columns.push({"name":'customcall',"index":48,"datatype":'string',"label":'Custom Routine',"suppresslabel":false,"control":'textbox',"canedit":true});

    Viewmodel.columns.push({"name":'lblInfo',"label":'Info',"control":'label',"suppresslabel":true,"fullline":true,"defaultvalue":'For more button options, use toolbar buttons and make them inline'});
    return exit(); 
}
// </BUTTON_EXTRAMETA_Sub>

// <CTL_CASCADINGAUTOTEXTBOX_Sub>
async function JSB_CTLS_CTL_CASCADINGAUTOTEXTBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_cascadingAutoTextBox", "JSB_CTLS_CTL_CASCADINGAUTOTEXTBOX_Sub");
    // local variables
    var Attacheddb, Tablename, Objectmodel, Koid, Jsroutine;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    // See if there is a reffile, and make a json array, or json callback

    var Values = ''; 
    var Defaultvalue = ''; 
    var Quotedurl = ''; 
    var Dftval = ''; 

    Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row }); 
    if (!Gencode && Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

    if (CBool(Column.canedit)) {
       // Column.parentCtlID, QuotedUrl, addBlank
       Quotedurl = Column.customRoutine; 
       if (Quotedurl) {
          if (InStr1(1,Viewname,am)) {
             Attacheddb = Field(Viewname,am,1); 
             Tablename = Field(Viewname,am,2);
          } else {
             if (await JSB_ODB_READJSON(Objectmodel, await JSB_BF_FHANDLE('dict', Projectname), Viewname, function (_Objectmodel) { Objectmodel = _Objectmodel })); else {
                Print(); debugger;
             }
             Attacheddb = Objectmodel.attachdb; 
             Tablename = Objectmodel.tableName;
          }

          if (InStr1(1,Quotedurl,'?')) Quotedurl = (CStr(Quotedurl) + '&'); else Quotedurl = CStr(Quotedurl) + '?';
          Quotedurl = CStr(Quotedurl) + 'arg={id}'; 
          if (!InStrI1(1,Quotedurl,'tablename=')) { Quotedurl = (CStr(Quotedurl) + '&tableName={tablename}'); }
          if (!InStrI1(1,Quotedurl,'databasename=')) { Quotedurl = (CStr(Quotedurl) + '&databaseName={databasename}'); }
          Quotedurl = ChangeI(Quotedurl,'{tablename}',urlEncode(Tablename)); 
          Quotedurl = ChangeI(Quotedurl,'{databasename}',urlEncode(Attacheddb));
       }
       Quotedurl = '\'' + Quotedurl + '\''; 

       if (Dokobinding) {
          Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
          Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\''; 
          Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, Id + '_' + CStr(Column.parentCtlID) + '_check', '', false); 
          Koid = Id; 
          Id = '';
       }

       if (Gencode) {
          if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
          if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';

          ByRef_Html = 'ctlHtml = @jsb_html.cascadingAutoTextBox("' + Id + '", "' + CStr(Column.parentCtlID) + '", "' + Quotedurl + '", ' + Dftval + ', ' + CStr((CNum(Column.minLength)+0)) + ', ' + CStr(Additionalattributes) + ')'; 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
       } else {
          ByRef_Html = JSB_HTML_CASCADINGAUTOTEXTBOX(Id, CStr(Column.parentCtlID), Quotedurl, Defaultvalue, Column.minLength, Additionalattributes); 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
       }

       if (Dokobinding) {
          // Create a Change routine which will be called on parent changes
          Jsroutine = 'autoCompleteTextBox(childCtl, a /* choiceArray */, ' + CStr(CNum(Column.minLength)+0) + ', null /* CompanionID */, ' + CStr(CNum(Column.restrictToList)+0) + ', \'\' /* labelName */, \'\' /* valueName */);'; 
          ByRef_Html = CStr(ByRef_Html) + JSB_HTML_RELOADDATALISTFROMURL_ONPARENT_CHANGE(CStr(Koid), CStr(Column.parentCtlID), Quotedurl, CStr(Jsroutine)); 

          // Create a Check routine to setup on KO Load
          ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT(JSB_HTML_CASCADINGATTACH2PARENT(CStr(Koid), CStr(Column.parentCtlID), true));
       }
    } else {
       // Prevents change
       await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
    }
    return exit(); 
}
// </CTL_CASCADINGAUTOTEXTBOX_Sub>

// <CASCADINGAUTOTEXTBOX_EXTRAMETA_Sub>
async function JSB_CTLS_CASCADINGAUTOTEXTBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_CASCADINGAUTOTEXTBOX", "JSB_CTLS_CASCADINGAUTOTEXTBOX_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 

    Viewmodel.columns.push({"name":'lblRequired',"label":'Required',"control":'label',"suppresslabel":true,"fullline":true,"defaultvalue":'The following fields are required'});
    Viewmodel.columns.push({"name":'parentCtlID',"label":'Parent Control',"control":'dropDownBox',"canedit":true,"required":true,"notblank":true,"defaultvalue":'',"reffile":'{viewcolumns}'});

    Viewmodel.columns.push({"name":'customRoutine',"label":'CustomRoutine',"control":'textbox',"canedit":true,"required":true,"notblank":true,"tooltip":'Place a json function here, or an http call with ?arg={id} for parent argument'});
    Viewmodel.columns.push({"name":'minLength',"label":'minLength 4 Popup',"width":19,"control":'textbox',"canedit":true,"notblank":false});
    return exit(); 
}
// </CASCADINGAUTOTEXTBOX_EXTRAMETA_Sub>

// <CTL_CASCADINGCOMBOBOX_Sub>
async function JSB_CTLS_CTL_CASCADINGCOMBOBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_cascadingcombobox", "JSB_CTLS_CTL_CASCADINGCOMBOBOX_Sub");
    // local variables
    var Attacheddb, Tablename, Objectmodel, Koid, Jsroutine;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    var Values = ''; 
    var Defaultvalue = ''; 
    var Quotedurl = ''; 
    var Dftval = ''; 

    Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row }); 
    if (!Gencode && Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

    if (CBool(Column.canedit)) {
       Quotedurl = Column.customRoutine; 
       if (Quotedurl) {
          if (InStr1(1,Viewname,am)) {
             Attacheddb = Field(Viewname,am,1); 
             Tablename = Field(Viewname,am,2);
          } else {
             if (await JSB_ODB_READJSON(Objectmodel, await JSB_BF_FHANDLE('dict', Projectname), Viewname, function (_Objectmodel) { Objectmodel = _Objectmodel })); else {
                Print(); debugger;
             }
             Attacheddb = Objectmodel.attachdb; 
             Tablename = Objectmodel.tableName;
          }

          if (InStr1(1,Quotedurl,'?')) Quotedurl = (CStr(Quotedurl) + '&'); else Quotedurl = CStr(Quotedurl) + '?';
          Quotedurl = CStr(Quotedurl) + 'arg={id}'; 
          if (!InStrI1(1,Quotedurl,'tablename=')) { Quotedurl = (CStr(Quotedurl) + '&tableName={tablename}'); }
          if (!InStrI1(1,Quotedurl,'databasename=')) { Quotedurl = (CStr(Quotedurl) + '&databaseName={databasename}'); }
          Quotedurl = ChangeI(Quotedurl,'{tablename}',urlEncode(Tablename)); 
          Quotedurl = ChangeI(Quotedurl,'{databasename}',urlEncode(Attacheddb));
       }
       Quotedurl = '\'' + Quotedurl + '\''; 

       if (Dokobinding) {
          Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
          Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\''; 
          Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', true, Id + '_' + CStr(Column.parentCtlID) + '_check', '', false); 
          Koid = Id; 
          Id = '';
       }

       if (Gencode) {
          if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
          if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';

          ByRef_Html = 'ctlHtml = @jsb_html.cascadingComboBox("' + Id + '", "' + CStr(Column.parentCtlID) + '", "' + Quotedurl + '", ' + Dftval + ' /* default val */, ' + CStr((CNum(Column.addBlank)+0)) + ' /* add blank */, "' + CStr(Column.descriptionField) + '", "' + CStr(Column.valueField) + '", ' + CStr(Additionalattributes) + ')'; 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
       } else {
          ByRef_Html = JSB_HTML_CASCADINGCOMBOBOX(Id, CStr(Column.parentCtlID), Quotedurl, Defaultvalue, CNum(Column.addBlank), CStr(Column.descriptionField), CStr(Column.valueField), Additionalattributes); 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
       }

       if (Dokobinding) {
          // Create a Change routine which will be called on parent changes
          Jsroutine = 'loadOptions(childCtl, a /* choiceArray */, "' + CStr(Column.valueField) + '" /* valueField */, "' + CStr(Column.descriptionField) + '" /* descriptionField */, ' + CStr(CNum(Column.addBlank)+0) + ' /* add Blank */, null /* defaultValue */, "" /* subdel */, !firstLoad);'; 
          ByRef_Html = CStr(ByRef_Html) + JSB_HTML_RELOADDATALISTFROMURL_ONPARENT_CHANGE(CStr(Koid), CStr(Column.parentCtlID), Quotedurl, CStr(Jsroutine)); 

          // Create a Check routine to setup on KO Load
          ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT(JSB_HTML_CASCADINGATTACH2PARENT(CStr(Koid), CStr(Column.parentCtlID),  +Dokobinding));
       }
    } else {
       // Prevents change
       await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
    }
    return exit(); 
}
// </CTL_CASCADINGCOMBOBOX_Sub>

// <CASCADINGCOMBOBOX_EXTRAMETA_Sub>
async function JSB_CTLS_CASCADINGCOMBOBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_CASCADINGCOMBOBOX", "JSB_CTLS_CASCADINGCOMBOBOX_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 

    Viewmodel.columns.push({"name":'autopostback',"label":'Auto PostBack',"control":'checkbox',"canedit":true,"defaultvalue":0,"reflist":'false,0;true,1'});

    // *******************************************************************************************************************************************
    Viewmodel.columns.push({"name":'lblRequired',"label":'Required',"control":'label',"suppresslabel":true,"fullline":true,"defaultvalue":'The following fields are required'});
    // *******************************************************************************************************************************************

    Viewmodel.columns.push({"name":'parentCtlID',"label":'Parent Control',"control":'dropDownBox',"canedit":true,"required":true,"notblank":true,"defaultvalue":'',"reffile":'{viewcolumns}'});

    Viewmodel.columns.push({"name":'customRoutine',"label":'CustomRoutine',"control":'textbox',"canedit":true,"required":true,"notblank":true,"tooltip":'Place a json function here, or an http call with ?arg={id} for parent argument'});
    Viewmodel.columns.push({"name":'descriptionField',"label":'descriptionField',"control":'textbox',"canedit":true,"tooltip":'Place a json field name here'});
    Viewmodel.columns.push({"name":'valueField',"label":'valueField',"control":'textbox',"canedit":true,"tooltip":'Place a json field name here'});
    return exit(); 
}
// </CASCADINGCOMBOBOX_EXTRAMETA_Sub>

// <CTL_CASCADINGDROPDOWNBOX_Sub>
async function JSB_CTLS_CTL_CASCADINGDROPDOWNBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_cascadingdropdownbox", "JSB_CTLS_CTL_CASCADINGDROPDOWNBOX_Sub");
    // local variables
    var Attacheddb, Tablename, Objectmodel, Koid, Jsroutine;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    var Values = ''; 
    var Defaultvalue = ''; 
    var Quotedurl = ''; 
    var Dftval = ''; 

    Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row }); 
    if (!Gencode && Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

    if (CBool(Column.canedit)) {
       Quotedurl = Column.customRoutine; 
       if (Quotedurl) {
          if (InStr1(1,Viewname,am)) {
             Attacheddb = Field(Viewname,am,1); 
             Tablename = Field(Viewname,am,2);
          } else {
             if (await JSB_ODB_READJSON(Objectmodel, await JSB_BF_FHANDLE('dict', Projectname), Viewname, function (_Objectmodel) { Objectmodel = _Objectmodel })); else {
                Print(); debugger;
             }
             Attacheddb = Objectmodel.attachdb; 
             Tablename = Objectmodel.tableName;
          }

          if (InStr1(1,Quotedurl,'?')) Quotedurl = (CStr(Quotedurl) + '&'); else Quotedurl = CStr(Quotedurl) + '?';
          Quotedurl = CStr(Quotedurl) + 'arg={id}'; 
          if (!InStrI1(1,Quotedurl,'tablename=')) { Quotedurl = (CStr(Quotedurl) + '&tableName={tablename}'); }
          if (!InStrI1(1,Quotedurl,'databasename=')) { Quotedurl = (CStr(Quotedurl) + '&databaseName={databasename}'); }
          Quotedurl = ChangeI(Quotedurl,'{tablename}',urlEncode(Tablename)); 
          Quotedurl = ChangeI(Quotedurl,'{databasename}',urlEncode(Attacheddb));
       }
       Quotedurl = '\'' + Quotedurl + '\''; 

       if (Dokobinding) {
          Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
          Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\''; 
          Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', true, Id + '_' + CStr(Column.parentCtlID) + '_check', '', false); 
          Koid = Id; 
          Id = '';
       }

       if (Gencode) {
          if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
          if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';
          ByRef_Html = 'ctlHtml = @jsb_html.cascadingDropDownBox("' + Id + '", "' + CStr(Column.parentCtlID) + '", "' + Quotedurl + '", ' + CStr((CNum(Column.addBlank)+0)) + ' /* add blank */, ' + Dftval + ' /* default val */, ' + CStr(Additionalattributes) + ', "' + CStr(Column.descriptionField) + '", "' + CStr(Column.valueField) + '")'; 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
       } else {
          ByRef_Html = JSB_HTML_CASCADINGDROPDOWNBOX(Id, CStr(Column.parentCtlID), Quotedurl, CNum(Column.addBlank), Defaultvalue, Additionalattributes, CStr(Column.descriptionField), CStr(Column.valueField)); 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
       }

       if (Dokobinding) {
          // Create a Change routine which will be called on parent changes
          Jsroutine = 'loadOptions(childCtl, a /* choiceArray */, "' + CStr(Column.valueField) + '" /* valueField */, "' + CStr(Column.descriptionField) + '" /* descriptionField */, ' + CStr(CNum(Column.addBlank)+0) + ' /* add Blank */, null /* defaultValue */, "" /* subdel */, !firstLoad);'; 
          ByRef_Html = CStr(ByRef_Html) + JSB_HTML_RELOADDATALISTFROMURL_ONPARENT_CHANGE(CStr(Koid), CStr(Column.parentCtlID), Quotedurl, CStr(Jsroutine)); 

          // Create a Check routine to setup on KO Load
          ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT(JSB_HTML_CASCADINGATTACH2PARENT(CStr(Koid), CStr(Column.parentCtlID), true));
       }
    } else {
       // Prevents change
       await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
    }
    return exit(); 
}
// </CTL_CASCADINGDROPDOWNBOX_Sub>

// <CASCADINGDROPDOWNBOX_EXTRAMETA_Sub>
async function JSB_CTLS_CASCADINGDROPDOWNBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_CASCADINGDROPDOWNBOX", "JSB_CTLS_CASCADINGDROPDOWNBOX_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 

    Viewmodel.columns.push({"name":'autopostback',"label":'Auto PostBack',"control":'checkbox',"canedit":true,"defaultvalue":0,"reflist":'false,0;true,1'});

    // *******************************************************************************************************************************************
    Viewmodel.columns.push({"name":'lblRequired',"label":'Required',"control":'label',"suppresslabel":true,"fullline":true,"defaultvalue":'The following fields are required'});
    // *******************************************************************************************************************************************

    Viewmodel.columns.push({"name":'parentCtlID',"label":'Parent Control',"control":'dropDownBox',"canedit":true,"required":true,"notblank":true,"defaultvalue":'',"reffile":'{viewcolumns}'});
    Viewmodel.columns.push({"name":'descriptionField',"label":'descriptionField',"control":'textbox',"canedit":true,"tooltip":'Place a json field name here'});
    Viewmodel.columns.push({"name":'valueField',"label":'valueField',"control":'textbox',"canedit":true,"tooltip":'Place a json field name here'});

    Viewmodel.columns.push({"name":'customRoutine',"label":'CustomRoutine',"control":'textbox',"canedit":true,"required":true,"notblank":true,"tooltip":'Place a json function here, or an http call with ?arg={id} for parent argument'});
    return exit(); 
}
// </CASCADINGDROPDOWNBOX_EXTRAMETA_Sub>

// <CTL_CHECKBOX_Sub>
async function JSB_CTLS_CTL_CHECKBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_checkbox", "JSB_CTLS_CTL_CHECKBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
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
       if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '\'\'';
       if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
       ByRef_Html = 'ctlHtml = @jsb_html.CheckBox(\'' + Id + '\', True, "", Val(' + Dftval + '), ' + CStr(Additionalattributes) + ')'; 
       if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
    } else {
       if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

       if (CNum(Defaultvalue)) Ischecked = true;
       ByRef_Html = JSB_HTML_CHECKBOX(Id, CStr(true), '', Ischecked, Additionalattributes); 

       if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
    }
    return exit(); 
}
// </CTL_CHECKBOX_Sub>

// <CTL_COLORPICKER_Sub>
async function JSB_CTLS_CTL_COLORPICKER_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_colorpicker", "JSB_CTLS_CTL_COLORPICKER_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
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
          if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';
          ByRef_Html = 'ctlHtml = @jsb_html.ColorPicker("' + Id + '", ' + Dftval + ', False, ' + CStr( +Dokobinding+0) + ', ' + CStr(Additionalattributes) + ')'; 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
       } else {
          if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);
          ByRef_Html = JSB_HTML_COLORPICKER(Id, Defaultvalue, false, Dokobinding, Additionalattributes); 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
       }
    } else {
       // Prevents change
       await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
    }

    return exit(undefined); 

    // *********************** CTLS *****************************
    return exit(); 
}
// </CTL_COLORPICKER_Sub>

// <COLORPICKER_EXTRAMETA_Sub>
async function JSB_CTLS_COLORPICKER_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_COLORPICKER", "JSB_CTLS_COLORPICKER_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 

    Viewmodel.columns.push({"name":'autopostback',"label":'Auto PostBack',"width":19,"control":'checkbox',"canedit":true,"defaultvalue":0,"reflist":'false,0;true,1'});
    return exit(); 
}
// </COLORPICKER_EXTRAMETA_Sub>

// <CTL_COMBOBOX_Sub>
async function JSB_CTLS_CTL_COMBOBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_combobox", "JSB_CTLS_CTL_COMBOBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
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
             Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, 'koUrlComboBoxLoad', CStr(CNum(Column.addBlank)+0) + ', ' + 'window.' + CStr(Column.arrayname) + ', ' + 'window.' + CStr(Column.arrayname) + ', ' + 'window.' + CStr(Column.arrayname) + ', ' + CStr(Multiselections));
          } else {
             Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, 'koComboBoxLoad', CStr(CNum(Column.addBlank)+0) + ',\'' + htmlEscape(Column.valueField) + '\', \'' + htmlEscape(Column.descriptionField) + '\', ' + CStr(CNum(Column.multiValuedData)) + ', ' + CStr(Multiselections));
          }
          Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\''; 
          Id = '';
       }

       Mobilepad = Column.mobilepad; 
       if (Mobilepad) {
          if (Mobilepad=='custom') {
             Mobilepad = Column.custompad; 
             if (Left(Mobilepad,2)!='[[' || Right(Mobilepad,2)!=']]') Println('Your ', Viewname, ' ', Id, ' field has has a malformed custom pad: ', Mobilepad);
          } else {
             if (Column.datatype=='integer') {
                if (Locate(Mobilepad, [undefined, 'integer', 'integer+', ''], 0, 0, 0, "", position => { })); else Println('Your ', Viewname, ' ', Id, ' field has an integer datatype and your are using a non-integer keyboard: ', Mobilepad);
                Additionalattributes = JSB_BF_MERGEATTRIBUTE('type', 'number', ';', Additionalattributes);
             } else if (Column.datatype=='double') {
                if (Locate(Mobilepad, [undefined, 'real', 'integer', 'integer+', ''], 0, 0, 0, "", position => { })); else Println('Your ', Viewname, ' ', Id, ' field has an double datatype and your are using a non-integer keyboard: ', Mobilepad);
             }
          }

          Additionalattributes = JSB_BF_MERGEATTRIBUTE('mobilepad', Mobilepad, ';', Additionalattributes);
       }

       if (Gencode) {
          Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; 
          if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));

          if (CBool(Column.includeurl) && CBool(Column.arrayname)) {
             ByRef_Html = 'ctlHtml = @jsb_html.ComboBoxIncludeURL("' + Id + '", "' + CStr(Column.includeurl) + '", "' + CStr(Column.arrayname) + '", ' + Dftval + ', "' + CStr(CNum(Column.addBlank)+0) + ' /* addBlank */, ' + CStr(Column.valueField) + '", "' + CStr(Column.descriptionField) + '", ' + CStr(Additionalattributes) + ', ' + CStr(CNum(Column.multiValuedData)) + ' /* multiValuedData */, ' + CStr(Multiselections) + ' /* multiselections */)';
          } else if (CBool(Column.reffile)) {
             ByRef_Html = 'ctlHtml = @jsb_html.ComboBox("' + Id + '", @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align=='right')) + ', ' + CStr(CNum(Column.oktocache)) + '), ' + Dftval + ', ' + CStr(CNum(Column.addBlank)+0) + ' /* addBlank */, "' + CStr(Column.descriptionField) + '", "' + CStr(Column.valueField) + '", ' + CStr(Additionalattributes) + ', ' + CStr(CNum(Column.multiValuedData)) + ' /* multiValuedData */, ' + CStr(Multiselections) + ' /* multiselections */)';
          } else {
             ByRef_Html = 'ctlHtml = @jsb_html.ComboBox("' + Id + '", "' + Change(Column.reflist,'"','\\"') + '", ' + Dftval + ', ' + CStr(CNum(Column.addBlank)+0) + ' /* addBlank */, "' + CStr(Column.descriptionField) + '", "' + CStr(Column.valueField) + '", ' + CStr(Additionalattributes) + ', ' + CStr(CNum(Column.multiValuedData)) + ' /* multiValuedData */, ' + CStr(Multiselections) + ' /* multiselections */)';
          }

          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
       } else {
          if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

          Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row }); 

          if (CBool(Column.includeurl) && CBool(Column.arrayname)) {
             ByRef_Html = JSB_HTML_COMBOBOXINCLUDEURL(Id, Column.includeurl, CStr(Column.arrayname), Defaultvalue, CNum(Column.addBlank), CStr(Column.descriptionField), CStr(Column.valueField), Additionalattributes, CNum(Column.multiValuedData), Multiselections);
          } else if (CBool(Column.reffile)) {
             ByRef_Html = JSB_HTML_COMBOBOX(Id, Values, Defaultvalue, Column.addBlank, Column.descriptionField, Column.valueField, Additionalattributes, CStr(Column.multiValuedData), Multiselections);
          } else {
             ByRef_Html = (JSB_HTML_COMBOBOX(Id, Values, Defaultvalue, Column.addBlank, Column.descriptionField, Column.valueField, Additionalattributes, CStr(CBool(Column.multiValuedData) || !isEmpty(Column.reflist)), Multiselections));
          }

          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$("#' + Id + '").change(function() { doJsbSubmit() }) '); }
       }
    } else {
       // Prevents change
       await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
    }
    return exit(); 
}
// </CTL_COMBOBOX_Sub>

// <COMBOBOX_EXTRAMETA_Sub>
async function JSB_CTLS_COMBOBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_COMBOBOX", "JSB_CTLS_COMBOBOX_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 

    Viewmodel.columns.push({"name":'autopostback',"label":'Auto PostBack',"width":19,"control":'checkbox',"canedit":true,"defaultvalue":0,"reflist":'false,0;true,1'});
    Viewmodel.columns.push({"name":'multiselections',"label":'Multiple Selections',"width":19,"control":'checkbox',"canedit":true,"defaultvalue":0,"reflist":'false,0;true,1'});
    Viewmodel.columns.push({"name":'includeurl',"label":'JS Include Url',"width":19,"control":'textbox',"canedit":true,"notblank":false});
    Viewmodel.columns.push({"name":'arrayname',"label":'JS Array Name',"width":19,"control":'textbox',"canedit":true,"notblank":false});

    await JSB_CTLS_TEXTBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 
    return exit(); 
}
// </COMBOBOX_EXTRAMETA_Sub>

// <CTL_DATEBOX_Sub>
async function JSB_CTLS_CTL_DATEBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_datebox", "JSB_CTLS_CTL_DATEBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
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
          if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';
          ByRef_Html = 'ctlHtml = @jsb_html.DateBox("' + Id + '", ' + Dftval + ', ' + CStr(Not(Column.canedit)) + ', ' + CStr(Additionalattributes) + ', \'' + CStr(Column.yearRange) + '\')'; 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
       } else {
          if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);
          ByRef_Html = JSB_HTML_DATEBOX(Id, Defaultvalue, Not(Column.canedit), Additionalattributes, CStr(Column.yearRange)); 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
       }
    } else {
       await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
    }

    return exit(undefined); 
}
// </CTL_DATEBOX_Sub>

// <DATEBOX_EXTRAMETA_Sub>
async function JSB_CTLS_DATEBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_DATEBOX", "JSB_CTLS_DATEBOX_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({"name":'yearRange',"label":'Year Range',"width":19,"control":'textbox',"canedit":true,"defaultvalue":'-99:+1',"tooltip":'-years:+years'});
    return exit(); 
}
// </DATEBOX_EXTRAMETA_Sub>

// <CTL_DATETIMEBOX_Sub>
async function JSB_CTLS_CTL_DATETIMEBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_datetimebox", "JSB_CTLS_CTL_DATETIMEBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    await JSB_CTLS_CTL_DATEBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html }); 
    return exit(); 
}
// </CTL_DATETIMEBOX_Sub>

// <CTL_DOWNLOADLINK_Sub>
async function JSB_CTLS_CTL_DOWNLOADLINK_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_downloadlink", "JSB_CTLS_CTL_DOWNLOADLINK_Sub");
    // local variables
    var Aa;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    var Dftval = ''; 
    var Defaultvalue = ''; 

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'width: 100%', ';', Additionalattributes); 
    Additionalattributes[Additionalattributes.length] = 'target="_blank"'; 

    if (Dokobinding) {
       // AdditionalAttributes[-1] = `data-bind="attr: {href:'`:@htmlRoot:'uploads/':`' + $data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'()}},text: $data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"` 
       Aa = 'data-bind="attr: {href:\'' + JSB_BF_HTMLROOT() + 'uploads/' + '\' + $data[\'' + CStr(Column.name) + '\']?$data[\'' + CStr(Column.name) + '\']:\'' + CStr(Column.defaultvalue) + '\'()}'; 
       Aa = CStr(Aa) + ',text: $data[\'' + CStr(Column.name) + '\']?$data[\'' + CStr(Column.name) + '\']:\'' + CStr(Column.defaultvalue) + '\''; 
       Aa = CStr(Aa) + ', attr: {id: \'KO_' + CStr(nicename(Column.name)) + '_\' + $index()}"'; 
       Additionalattributes[Additionalattributes.length] = Aa; 
       Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\''; 
       Id = '';
    }

    if (Gencode) {
       if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';
       if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
       ByRef_Html = [undefined, 'Url = ' + Dftval]; 
       ByRef_Html[ByRef_Html.length] = 'If Left(Url, 4) \<\> "http" Then Url = @htmlRoot:\'uploads/\':Url'; 
       ByRef_Html[ByRef_Html.length] = 'ctlHtml = @Anchor(\'' + Id + '\', Url, Url, ' + CStr(Additionalattributes) + ')';
    } else {
       if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);
       ByRef_Html = JSB_HTML_ANCHOR(Id, JSB_BF_HTMLROOT() + 'uploads/' + Defaultvalue, Defaultvalue, Additionalattributes);
    }

    return exit(undefined); 
}
// </CTL_DOWNLOADLINK_Sub>

// <DOWNLOADLINK_EXTRAMETA_Sub>
async function JSB_CTLS_DOWNLOADLINK_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_DOWNLOADLINK", "JSB_CTLS_DOWNLOADLINK_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    // viewModel.columns.push ({name:'linecnt', label:'Lines', width:19, control:'textbox', canedit:true, default: 1 })
    return exit(); 
}
// </DOWNLOADLINK_EXTRAMETA_Sub>

// <CTL_DROPDOWNBOX_Sub>
async function JSB_CTLS_CTL_DROPDOWNBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_dropdownbox", "JSB_CTLS_CTL_DROPDOWNBOX_Sub");
    // local variables
    var Quotedurl, Attacheddb, Tablename, Objectmodel;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    var Dftval = ''; 
    var Defaultvalue = ''; 
    var Values = ''; 

    if (Not(Column.canedit)) {
       await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html }); 
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
       ByRef_Html = [undefined, ]; 
       if (Dokobinding) Dftval = 'null'; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
       if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '\'\'';

       if (CBool(Column.includeurl) && CBool(Column.arrayname)) {
          ByRef_Html[ByRef_Html.length] = 'ctlHtml = @jsb_html.DropDownBoxIncludeURL("' + Id + '", "' + CStr(Column.includeurl) + '", "' + CStr(Column.arrayname) + '", ' + Dftval + ', ' + CStr(CNum(Column.addBlank)+0) + ' /* addBlank */, False /* readOnly */, ' + CStr(Additionalattributes) + ', ' + CStr(Column.multiValuedData) + ' /* multiValuedData */)'; ;
       } else if (CBool(Column.customRoutine)) {
          Quotedurl = Column.customRoutine; 
          if (InStr1(1,Viewname,am)) {
             Attacheddb = Field(Viewname,am,1); 
             Tablename = Field(Viewname,am,2);
          } else {
             if (await JSB_ODB_READJSON(Objectmodel, await JSB_BF_FHANDLE('dict', Projectname), Viewname, function (_Objectmodel) { Objectmodel = _Objectmodel })); else {
                Print(); debugger;
             }
             Attacheddb = Objectmodel.attachdb; 
             Tablename = Objectmodel.tableName;
          }

          if (InStr1(1,Quotedurl,'?')) Quotedurl = (CStr(Quotedurl) + '&'); else Quotedurl = CStr(Quotedurl) + '?';
          Quotedurl = CStr(Quotedurl) + 'arg={id}'; 
          if (!InStrI1(1,Quotedurl,'tablename=')) { Quotedurl = (CStr(Quotedurl) + '&tableName={tablename}'); }
          if (!InStrI1(1,Quotedurl,'databasename=')) { Quotedurl = (CStr(Quotedurl) + '&databaseName={attachedDB}'); }
          Quotedurl = ChangeI(Quotedurl,'{tablename}',urlEncode(Tablename)); 
          Quotedurl = ChangeI(Quotedurl,'{databasename}',urlEncode(Tablename)); 
          Quotedurl = '\'' + CStr(Quotedurl) + '\''; 

          ByRef_Html = 'ctlHtml = @jsb_html.DropDownBoxAJAX("' + Id + '", ' + CStr(Quotedurl) + ', ' + Dftval + ' /* default val */, ' + CStr((CNum(Column.addBlank)+0)) + ' /* add blank */, False /* ReadOnly */, ' + CStr(Additionalattributes) + ', True /* Multivalued data */, "' + CStr(Column.descriptionField) + '", "' + CStr(Column.valueField) + '")'; ;
       } else if (CBool(Column.reffile)) {
          ByRef_Html[ByRef_Html.length] = 'Dim refList As Array = @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align=='right')) + ', ' + CStr(CNum(Column.oktocache)) + ')'; 
          ByRef_Html[ByRef_Html.length] = 'If refList Then'; 
          ByRef_Html[ByRef_Html.length] = '   ctlHtml = @jsb_html.DropDownBox("' + Id + '", refList, ' + Dftval + ', ' + CStr(CNum(Column.addBlank)+0) + ' /* addBlank */, False /* readOnly */, ' + CStr(Additionalattributes) + ', ' + CStr(Column.multiValuedData) + ' /* multiValuedData */)'; 
          ByRef_Html[ByRef_Html.length] = 'Else'; 
          ByRef_Html[ByRef_Html.length] = '   ctlHtml = \'no ref list\''; 
          ByRef_Html[ByRef_Html.length] = 'End If'; ;
       } else if (CBool(Column.reflist)) {
          ByRef_Html[ByRef_Html.length] = 'ctlHtml = @jsb_html.DropDownBox("' + Id + '", "' + Change(Column.reflist,'"','\\"') + '", ' + Dftval + ', ' + CStr(CNum(Column.addBlank)+0) + ' /* addBlank */, False /* readOnly */, ' + CStr(Additionalattributes) + ', True /* multiValuedData */)'; ;
       } else {
          ByRef_Html[ByRef_Html.length] = 'ctlHtml = \'No ref list\' ;* No reference list is setup';
       }

       if (CBool(Column.autopostback) && Id) { ByRef_Html[ByRef_Html.length] = 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
    } else {
       if (Dokobinding) Defaultvalue = undefined; else Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

       if (CBool(Column.includeurl) && CBool(Column.arrayname)) {
          ByRef_Html = JSB_HTML_DROPDOWNBOXINCLUDEURL(Id, Column.includeurl, CStr(Column.arrayname), Defaultvalue, Column.addBlank, false, Additionalattributes, true); 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
       } else {
          Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row }); 
          if (CBool(isArray(Values))) {
             ByRef_Html = (JSB_HTML_DROPDOWNBOX(Id, Values, Defaultvalue, CNum(Column.addBlank), false, Additionalattributes, CStr(CBool(Column.multiValuedData) || !isEmpty(Column.reflist)))); 
             if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
          } else {
             ByRef_Html = 'no ref list';
          }
       }
    }
    return exit(); 
}
// </CTL_DROPDOWNBOX_Sub>

// <DROPDOWNBOX_EXTRAMETA_Sub>
async function JSB_CTLS_DROPDOWNBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_DROPDOWNBOX", "JSB_CTLS_DROPDOWNBOX_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 
    Viewmodel.columns.push({"name":'autopostback',"label":'Auto PostBack',"width":19,"control":'checkbox',"canedit":true,"defaultvalue":0,"reflist":'false,0;true,1'});
    Viewmodel.columns.push({"name":'includeurl',"label":'JS Include Url',"width":19,"control":'textbox',"canedit":true,"notblank":false});
    Viewmodel.columns.push({"name":'arrayname',"label":'JS Array Name',"width":19,"control":'textbox',"canedit":true,"notblank":false});
    Viewmodel.columns.push({"name":'customRoutine',"label":'CustomRoutine',"control":'textbox',"canedit":true,"required":true,"notblank":true,"tooltip":'Place a json function here, or an http call with ?arg={id} for parent argument'});

    return exit(); 
}
// </DROPDOWNBOX_EXTRAMETA_Sub>

// <CTL_EMAILBOX_Sub>
async function JSB_CTLS_CTL_EMAILBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_emailbox", "JSB_CTLS_CTL_EMAILBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
    Additionalattributes[Additionalattributes.length] = 'data-parsley-type="email"'; 
    await JSB_CTLS_CTL_TEXTBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html }); 
    return exit(); 
}
// </CTL_EMAILBOX_Sub>

// <CTL_FIELDSETBTNS_Sub>
async function JSB_CTLS_CTL_FIELDSETBTNS_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_fieldsetbtns", "JSB_CTLS_CTL_FIELDSETBTNS_Sub");
    // local variables
    var Aa;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    var Dftval = ''; 
    var Defaultvalue = ''; 
    var Values = ''; 

    if (Not(Column.canedit)) {
       await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html }); 
       return exit(undefined);
    }

    Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, [undefined, ]); // AdditionalAttributes ??

    if (Dokobinding) {
       Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
       // AdditionalAttributes[-1] = `data-bind="addIfNotInList: {}, checked:$data['`:Column.name:`'], checked:$data['`:Column.name:`']?$data['`:Column.name:`']:`:IFF(Column.defaultvalue, Column.defaultvalue, 0):
       Aa = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'checked', false, 'window.fieldSetBtn_Change($element)', undefined, true); 
       Additionalattributes[Additionalattributes.length] = CStr(Aa) + ', attr: { name: \'' + CStr(Column.name) + '\' + $index() }"'; 
       Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\''; 
       Id = '';
    }

    if (Gencode) {
       ByRef_Html = [undefined, ]; 
       if (Dokobinding) Dftval = 'null'; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
       if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '\'\'';

       if (CBool(Column.reffile)) {
          ByRef_Html[ByRef_Html.length] = 'Dim refList As Array = @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align=='right')) + ', ' + CStr(CNum(Column.oktocache)) + ')'; 
          ByRef_Html[ByRef_Html.length] = 'If refList Then'; 
          ByRef_Html[ByRef_Html.length] = '   ctlHtml = @jsb_html.fieldSetBtns("' + Id + '", refList, ' + Dftval + ', ' + CStr((Not(Column.canedit))) + ', ' + CStr(Additionalattributes) + ', ' + CStr(Column.multiValuedData) + ' /* multiValuedData */)'; 
          ByRef_Html[ByRef_Html.length] = 'Else'; 
          ByRef_Html[ByRef_Html.length] = '   ctlHtml = \'no ref list \''; 
          ByRef_Html[ByRef_Html.length] = 'End If'; ;
       } else if (CBool(Column.reflist)) {
          ByRef_Html[ByRef_Html.length] = 'ctlHtml = @jsb_html.fieldSetBtns(\'' + Id + '\', "' + Change(Column.reflist,'"','\\"') + '", ' + Dftval + ', ' + CStr((Not(Column.canedit))) + ', ' + CStr(Additionalattributes) + ', ' + CStr(CNum(Column.multiValuedData)+0) + ')'; ;
       } else {
          ByRef_Html[ByRef_Html.length] = 'ctlHtml = \'no ref list \' ;* No reference list is setup';
       }

       if (CBool(Column.autopostback) && Id) { ByRef_Html[ByRef_Html.length] = 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
    } else {
       if (Dokobinding) Defaultvalue = undefined; else Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

       Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row }); 
       if (CBool(isArray(Values))) {
          ByRef_Html = JSB_HTML_FIELDSETBTNS(Id, Values, Defaultvalue, (Not(Column.canedit)), Additionalattributes, CNum(Column.multiValuedData)); 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
       } else {
          ByRef_Html = '';
       }
    }
    return exit(); 
}
// </CTL_FIELDSETBTNS_Sub>

// <FIELDSETBTNS_EXTRAMETA_Sub>
async function JSB_CTLS_FIELDSETBTNS_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_FIELDSETBTNS", "JSB_CTLS_FIELDSETBTNS_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 
    Viewmodel.columns.push({"name":'autopostback',"label":'Auto PostBack',"width":19,"control":'checkbox',"canedit":true,"defaultvalue":0,"reflist":'false,0;true,1'});
    return exit(); 
}
// </FIELDSETBTNS_EXTRAMETA_Sub>

// <CTL_HIDDENVAR_Sub>
async function JSB_CTLS_CTL_HIDDENVAR_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_hiddenvar", "JSB_CTLS_CTL_HIDDENVAR_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
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
       if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';
       ByRef_Html = 'ctlHtml = @jsb_html.hiddenVar("' + Id + '", ' + Dftval + ', ' + CStr(Additionalattributes) + ')'; 
       if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
    } else {
       if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);
       ByRef_Html = JSB_HTML_HIDDENVAR(Id, Defaultvalue, Additionalattributes); 
       if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
    }

    return exit(undefined); 
}
// </CTL_HIDDENVAR_Sub>

// <CTL_HTMLBOX_Sub>
async function JSB_CTLS_CTL_HTMLBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_htmlbox", "JSB_CTLS_CTL_HTMLBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    var Dftval = ''; 
    var Defaultvalue = ''; 

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'width: 100%', ';', Additionalattributes); 

    if (CBool(Column.fullheight)) {
       Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'height:100%; overflow: auto', ';', Additionalattributes); ;
    } else if (Null0(Column.linecnt)>1) {
       Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'min-height:' + CStr(Column.linecnt) + 'em', ';', Additionalattributes);
    }

    if (Dokobinding) {
       // AdditionalAttributes[-1] = `data-bind="value:$data['`:Column.name:`'], value:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"` 
       Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, '', undefined); 
       Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\''; 
       Id = '';
    }

    if (Gencode) {
       if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';
       if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));

       if (CBool(Column.canedit)) {
          ByRef_Html = 'ctlHtml = @NicEditor(\'' + Id + '\', ' + Dftval + ', false, ' + CStr(Additionalattributes) + ')';
       } else {
          ByRef_Html = 'ctlHtml = @Html("\<label class=\'CtlLabel\' id=\'' + Id + '\' ' + CStr(Additionalattributes) + '\>":Replace(' + Dftval + ', Chr(13), "\<br /\>"):"\</label\>")';
       }
    } else {
       if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

       if (CBool(Column.canedit)) {
          ByRef_Html = JSB_HTML_NICEDITOR(Id, Defaultvalue, CStr(false), Additionalattributes);
       } else {
          ByRef_Html = Chr(28) + '\<label class=\'CtlLabel\' id=\'' + Id + '\' ' + Join(Additionalattributes,' ') + '\>' + Change(Defaultvalue,Chr(13),'\<br /\>') + '\</label\>' + Chr(29);
       }
    }
    return exit(undefined); 
}
// </CTL_HTMLBOX_Sub>

// <HTMLBOX_EXTRAMETA_Sub>
async function JSB_CTLS_HTMLBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_HTMLBOX", "JSB_CTLS_HTMLBOX_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({"name":'linecnt',"label":'Lines',"width":19,"control":'textbox',"canedit":true,"default":1});
    Viewmodel.columns.push({"name":'fullheight',"label":'fullheight',"width":19,"control":'checkbox',"canedit":true,"notblank":true,"defaultvalue":0,"reflist":'false,0;true,1'});
    return exit(); 
}
// </HTMLBOX_EXTRAMETA_Sub>

// <CTL_IMAGEBOX_Sub>
async function JSB_CTLS_CTL_IMAGEBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_imagebox", "JSB_CTLS_CTL_IMAGEBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    await JSB_CTLS_CTL_TEXTBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html }); 
    return exit(); 
}
// </CTL_IMAGEBOX_Sub>

// <CTL_JSON_INLINE_Sub>
async function JSB_CTLS_CTL_JSON_INLINE_Sub(Projectname, Id, Column, Row, ByRef_Html, Parentmodel, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_json_inline", "JSB_CTLS_CTL_JSON_INLINE_Sub");
    // local variables
    var Errors, Defaultrow, Dataset, Editviewname, Rl, Line, Ltriml;
    var Fc, Spcs, Parent, Koid;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    var Usename = ''; 
    var Newrow = ''; 
    var Model = ''; 

    if (Not(Parentmodel)) Parentmodel = '';
    var Ahtml = [undefined, ]; 

    if (Parentmodel) {
       Usename = Column.name; 
       Newrow = 'function () { if (window.event) koModel.' + CStr(nicename(Change(Parentmodel,'().','_'))) + Usename + '_newRow($index()) /* A */ }';
    } else {
       Usename = Id; 
       Newrow = 'koModel.' + Usename + '_newRow'; 
       Newrow = 'function () { if (window.event) koModel.' + Usename + '_newRow() }';
    }

    if (Gencode) {
       // Two choices here:  true) put html code directly into the output file, false) write code that creates the html dynamically

       if (true) {
          if (!(await JSB_CTLS_JSON_SETUP(Projectname, Id, Column, [undefined, ], Errors, Additionalattributes, Defaultrow, Dataset, Model, Editviewname, function (_Errors, _Defaultrow, _Dataset, _Model, _Editviewname) { Errors = _Errors; Defaultrow = _Defaultrow; Dataset = _Dataset; Model = _Model; Editviewname = _Editviewname }))) { Alert(Errors);return exit(undefined); }
          Rl = JSB_HTML_REPEATERLOAD(Usename, CStr(Defaultrow), Dataset, Parentmodel); 

          // This is where we can recurse
          if (Column.form=='form' || isEmpty(Column.form) || Column.form=='tform') {
             Rl = CStr(Rl) + await JSB_CTLS_REPEATERFORMBACKGROUND(Projectname, Usename, Model, Dataset, CStr(Column.rmvrowtxt), CNum(Column.canedit), Parentmodel, CStr(Editviewname));
          } else {
             Rl = CStr(Rl) + await JSB_CTLS_REPEATERGRIDBACKGROUND(Projectname, Usename, Model, Dataset, CStr(Column.rmvrowtxt), CNum(Column.canedit), Parentmodel, CStr(Editviewname));
          }

          Rl = Change(Rl,Chr(28),''); 
          Rl = Change(Rl,Chr(29),''); 
          Rl = Split(Rl,crlf); 
          Ahtml[Ahtml.length] = '   ctlHtml = @Html(`'; 
          var LINE_LastI7 = UBound(Rl); 
          for (var Line_Idx = LBound(Rl); Line_Idx<=LINE_LastI7; Line_Idx++) {
             Line = Extract(Rl, Line_Idx, 0, 0); 
             Ltriml = LTrim(Line); 
             if (CBool(Ltriml)) {
                Fc = Left(Ltriml,1); 
                Spcs = InStr1(1,Line,Fc); 
                if (Spcs<=1) {
                   if (Fc=='\<') Line = Space(8) + CStr(Line); else Line = Space(12) + CStr(Line);
                }
                Ahtml[Ahtml.length] = Line;
             }
          } 
          Ahtml[Ahtml.length] = '    `)'; 

          if (Parentmodel) {
             Parent = 'koModel.' + CStr(nicename(Change(Parentmodel,'().',''))); 
             Koid = CStr(Parent) + '_' + CStr(nicename(Id));
          } else {
             Koid = 'koModel.' + CStr(nicename(Id));
          }

          Ahtml[Ahtml.length] = '   Dim DataSet As Array = ' + CStr(Row); 
          Ahtml[Ahtml.length] = '   ctlHtml := @Script(\'' + CStr(Koid) + ' = makeObservableKO([\':Change(Join(dataSet, ","), CHR(160), Chr(32)):\'], ' + CStr(Koid) + '_DefaultRow);\')';
       } else {
          
          if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';
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
          Ahtml[Ahtml.length] = 'If !@jsb_ctls.json_setup("' + Projectname + '", "' + Id + '", Column, ' + Field(Row,'[',1) + ', Errors, ' + CStr(Additionalattributes) + ', defaultRow, dataSet, Model, editViewName) Then Return Alert(Errors) = \'*\''; 

          Ahtml[Ahtml.length] = 'ctlHtml = @jsb_html.repeaterLoad("' + Usename + '", defaultRow, DataSet, parentModel) '; 

          // This is where we can recurse
          if (Column.form=='form' || isEmpty(Column.form) || Column.form=='tform') {
             Ahtml[Ahtml.length] = 'ctlHtml := @jsb_ctls.RepeaterFormBackground("' + Projectname + '", "' + Usename + '", Model, DataSet, "' + CStr(Column.rmvrowtxt) + '", "' + CStr(Column.canedit) + '", parentModel, editViewName)';
          } else {
             Ahtml[Ahtml.length] = 'ctlHtml := @jsb_ctls.RepeaterGridBackground("' + Projectname + '", "' + Usename + '", Model, DataSet, "' + CStr(Column.rmvrowtxt) + '", "' + CStr(Column.canedit) + '", parentModel, editViewName)';
          }
       }

       if (CBool(Column.canedit) && CBool(Column.addrowtxt)) {
          Ahtml[Ahtml.length] = 'ctlHtml := @jsb_html.button(\'btnAddRow\', "' + CStr(Column.addrowtxt) + '", ["data-bind=\'click: ' + Newrow + '\'"]) ';
       }
    } else {
       if (!(await JSB_CTLS_JSON_SETUP(Projectname, Id, Column, Row, Errors, Additionalattributes, Defaultrow, Dataset, Model, Editviewname, function (_Errors, _Defaultrow, _Dataset, _Model, _Editviewname) { Errors = _Errors; Defaultrow = _Defaultrow; Dataset = _Dataset; Model = _Model; Editviewname = _Editviewname }))) { Alert(Errors);return exit(undefined); }

       Ahtml[Ahtml.length] = JSB_HTML_REPEATERLOAD(Usename, CStr(Defaultrow), Dataset, Parentmodel); 

       // This is where we can recurse
       if (Column.form=='form' || isEmpty(Column.form) || Column.form=='tform') {
          Ahtml[Ahtml.length] = await JSB_CTLS_REPEATERFORMBACKGROUND(Projectname, Usename, Model, Dataset, CStr(Column.rmvrowtxt), CNum(Column.canedit), Parentmodel, CStr(Editviewname));
       } else {
          Ahtml[Ahtml.length] = await JSB_CTLS_REPEATERGRIDBACKGROUND(Projectname, Usename, Model, Dataset, CStr(Column.rmvrowtxt), CNum(Column.canedit), Parentmodel, CStr(Editviewname));
       }

       if (CBool(Column.canedit) && CBool(Column.addrowtxt)) {
          Ahtml[Ahtml.length] = JSB_HTML_BUTTON('btnAddRow', CStr(Column.addrowtxt), [undefined, 'data-bind=\'click: ' + Newrow + '\'']);
       }
    }

    ByRef_Html = Join(Ahtml,crlf); 
    return exit(); 
}
// </CTL_JSON_INLINE_Sub>

// <JSON_INLINE_EXTRAMETA_Sub>
async function JSB_CTLS_JSON_INLINE_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_JSON_INLINE", "JSB_CTLS_JSON_INLINE_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({"name":'useview',"label":'Use View',"datatype":'string',"primarykey":false,"width":30,"control":'dropdownbox',"canedit":true,"pickfunction":'edv_pick?projectName={projectname}',"reffile":'dict {projectname}',"refpk":'ItemID',"refwhere":'ItemID Like \'%.view\''});
    Viewmodel.columns.push({"name":'addrowtxt',"label":'Add Row Text',"datatype":'string',"primarykey":false,"width":30,"control":'textbox',"required":true,"notblank":true,"canedit":true,"defaultvalue":'Add another row'});
    Viewmodel.columns.push({"name":'rmvrowtxt',"label":'Remove Row Text',"datatype":'string',"primarykey":false,"width":30,"control":'textbox',"required":true,"notblank":true,"canedit":true,"defaultvalue":'Remove Row'});
    Viewmodel.columns.push({"name":'form',"label":'form',"datatype":'string',"primarykey":false,"width":30,"control":'dropdownbox',"required":true,"notblank":true,"canedit":true,"defaultvalue":'form',"reflist":'form;grid'});
    return exit(); 
}
// </JSON_INLINE_EXTRAMETA_Sub>

// <CTL_JSON_POPUP_Sub>
async function JSB_CTLS_CTL_JSON_POPUP_Sub(Projectname, Id, Column, Row, ByRef_Html, Parentmodel, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_json_popup", "JSB_CTLS_CTL_JSON_POPUP_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
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

    if (Not(Popupheight)) Popupheight = 300+UBound(Dataset)*40;
    if (Not(Popupwidth)) Popupwidth = '80%';
    if (CNum(Popupheight)!=Null0(Popupheight)) Popupheight = '"' + Popupheight + '"';
    if (CNum(Popupwidth)!=Null0(Popupwidth)) Popupwidth = '"' + Popupwidth + '"';

    if (Not(Parentmodel)) Parentmodel = '';
    if (!(await JSB_CTLS_JSON_SETUP(Projectname, Id, Column, Row, Output, Additionalattributes, Defaultrow, Dataset, Model, Editviewname, function (_Output, _Defaultrow, _Dataset, _Model, _Editviewname) { Output = _Output; Defaultrow = _Defaultrow; Dataset = _Dataset; Model = _Model; Editviewname = _Editviewname }))) return exit(undefined);

    Output = [undefined, ]; 
    if (CBool(Parentmodel)) Usename = Column.name; else Usename = Id;
    Output[Output.length] = JSB_HTML_REPEATERLOAD(Usename, Defaultrow, Dataset, CStr(Parentmodel)); 

    if (CBool(Parentmodel)) {
       Additionalattributes[Additionalattributes.length] = 'data-bind="value:$data[\'' + CStr(Column.name) + '\'], value:$data[\'' + CStr(Column.name) + '\']?$data[\'' + CStr(Column.name) + '\']:\'' + CStr(Column.defaultvalue) + '\'"'; 
       Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\''; 
       C2 = JSB_HTML_BUTTON('', '...', [undefined, 'data-bind="click: function () { popup_' + Id + '($data, $index()) }"']);
    } else {
       C2 = JSB_HTML_BUTTON('', '...', [undefined, 'onclick=\'popup_' + Id + '()\'']);
    }

    S = '[' + Join(Dataset,',') + ']'; 
    S = htmlEscape(S); 

    if (CBool(Column.canedit)) {
       C1 = Chr(28) + '\<input id=\'' + Id + '\' name=\'' + Id + '\' class=\'CtlJsonArray\' value=\'' + S + '\' ' + Join(Additionalattributes,' ') + ' /\>' + Chr(29); 
       Output[Output.length] = JSB_HTML_COLS2('%', C1, '30px', C2, '', 'overflow: hidden', 'overflow: hidden');
    } else {
       C1 = Chr(28) + '\<input id=\'' + Id + '\' name=\'' + Id + '\' type=\'hidden\' class=\'CtlJsonArray\' value=\'' + S + '\' ' + Join(Additionalattributes,' ') + ' /\>' + Chr(29); 
       Output[Output.length] = C1 + C2;
    }

    Koid = 'Ctl_' + Id; 
    Output[Output.length] = Chr(28) + '\<div id="' + Id + '_dialog" title="Basic! dialog" style="display: none;"\>' + Chr(29); 
    if (CBool(Parentmodel)) Subid = CStr(Parentmodel) + '().'; else Subid = '';

    if (Column.form=='form' || isEmpty(Column.form)) {
       Mylayout = await JSB_CTLS_REPEATERFORMBACKGROUND(Projectname, Usename, Model, Dataset, CStr(Column.rmvrowtxt), CNum(Column.canedit), Subid, Editviewname);
    } else {
       Mylayout = await JSB_CTLS_REPEATERGRIDBACKGROUND(Projectname, Usename, Model, Dataset, CStr(Column.rmvrowtxt), CNum(Column.canedit), Subid, Editviewname);
    }

    Output[Output.length] = Change(Change(Mylayout,'mdlctl','nstctl'),'foreach: $data','foreach: $root'); 
    Output[Output.length] = Chr(28) + '\</div\>'; 

    var Script = [undefined, ]; 
    if (CBool(Parentmodel)) {
       Script[Script.length] = 'function popup_' + Id + '(thisRow, index) {'; 
       Script[Script.length] = '   var myRow = thisRow; '; 
       Script[Script.length] = '   var myCtl = $(\'[name="' + Id + '"]\').eq(index); ';
    } else {
       Script[Script.length] = 'function popup_' + Id + '() {'; 
       Script[Script.length] = '   var myCtl = $("#' + Id + '");';
    }

    Script[Script.length] = '   var myjs = $(myCtl).val();'; 
    Script[Script.length] = '   if (Left(myjs, 1) != "[") myjs = "[" + myjs + "]"'; 
    Script[Script.length] = '   myjs = string2json(myjs)'; 
    Script[Script.length] = ''; 

    Script[Script.length] = '      $("#' + Id + '_dialog" ).dialog({'; 
    Script[Script.length] = '       title: "' + CStr(htmlEncode(Popuptitle)) + '",'; 
    Script[Script.length] = '       modal: true,'; 
    Script[Script.length] = '       width: ' + Popupwidth + ','; 
    Script[Script.length] = '       minHeight: ' + Popupheight + ','; 
    Script[Script.length] = '       height: ' + Popupheight + ','; 
    Script[Script.length] = '       open: function() {'; 
    Script[Script.length] = '           koModel.' + CStr(nicename(Change(Parentmodel,'().','_'))) + Usename + '.removeAll()'; 
    Script[Script.length] = '           for (var i = 0; i \< myjs.length; ++i) koModel.' + CStr(nicename(Change(Parentmodel,'().','_'))) + Usename + '_addRow(myjs[i]);'; 
    Script[Script.length] = '      },'; 
    Script[Script.length] = '      buttons: {'; 
    if (CBool(Column.canedit) && CBool(Column.addrowtxt)) {
       Script[Script.length] = '         \'' + CStr(Column.addrowtxt) + '\': function() { '; 
       Script[Script.length] = '             koModel.' + CStr(nicename(Change(Parentmodel,'().','_'))) + Usename + '_newRow()'; 
       Script[Script.length] = '         },';
    }
    Script[Script.length] = '         \'Save\': function() {'; 
    Script[Script.length] = '            $(myCtl).val(koModel.' + CStr(nicename(Change(Parentmodel,'().','_'))) + Usename + '_Value());'; 
    if (CBool(Parentmodel)) {
       Script[Script.length] = '            myRow[\'' + Id + '\'] = koModel.' + CStr(nicename(Change(Parentmodel,'().','_'))) + Usename + '_Value();';
    }
    Script[Script.length] = '            $(this).dialog("close");'; 
    Script[Script.length] = '         },'; 
    Script[Script.length] = '         \'Cancel\': function() {'; 
    Script[Script.length] = '             $(this).dialog("close");'; 
    Script[Script.length] = '         }'; 
    Script[Script.length] = '       },'; 
    Script[Script.length] = '       close: function(event, ui) { '; 
    Script[Script.length] = '          koModel.' + CStr(nicename(Change(Parentmodel,'().','_'))) + Usename + '.removeAll()'; 
    Script[Script.length] = '       }'; 
    Script[Script.length] = '     });'; 
    Script[Script.length] = '   }'; 

    ByRef_Html = Join(Output) + JSB_HTML_SCRIPT(Join(Script)); 
    return exit(); 
}
// </CTL_JSON_POPUP_Sub>

// <JSON_POPUP_EXTRAMETA_Sub>
async function JSB_CTLS_JSON_POPUP_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_JSON_POPUP", "JSB_CTLS_JSON_POPUP_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({"name":'useview',"label":'Use View',"datatype":'string',"primarykey":false,"width":30,"control":'dropdownbox',"canedit":true,"pickfunction":'edv_pick?projectName={projectname}',"reffile":'dict {projectname}',"refpk":'ItemID',"refwhere":'ItemID Like \'%.view\''});
    Viewmodel.columns.push({"name":'popuptitle',"label":'Popup Title',"width":19,"control":'textbox',"canedit":true,"notblank":false});
    Viewmodel.columns.push({"name":'popupwidth',"label":'Popup Width',"width":19,"control":'textbox',"canedit":true,"notblank":false});
    Viewmodel.columns.push({"name":'popupheight',"label":'MPopup Height',"width":19,"control":'textbox',"canedit":true,"notblank":false});
    Viewmodel.columns.push({"name":'form',"label":'form',"datatype":'string',"primarykey":false,"width":30,"control":'dropdownbox',"required":true,"notblank":true,"canedit":true,"defaultvalue":'form',"reflist":'form;grid'});
    return exit(); 
}
// </JSON_POPUP_EXTRAMETA_Sub>

// <CTL_KNOB_Sub>
async function JSB_CTLS_CTL_KNOB_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_knob", "JSB_CTLS_CTL_KNOB_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
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
       if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '\'\'';
       ByRef_Html = 'ctlHtml = @jsb_html.Knob(\'' + Id + '\', ' + Dftval + ', ' + CStr(Not(CStr(Column.canedit) + ', ' + CStr(Additionalattributes) + ', ' + CStr(Column.iminvalue) + ', ' + CStr(Column.imaxvalue) + ', ' + CStr(CNum(Column.size)) + ', "' + CStr(Column.color) + '")')); 

       if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
    } else {
       if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

       ByRef_Html = JSB_HTML_KNOB(Id, Defaultvalue, Not(Column.canedit), Additionalattributes, CStr(Column.iminvalue), CStr(Column.imaxvalue), CStr(Column.size), CStr(Column.color)); 

       if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
    }
    return exit(); 
}
// </CTL_KNOB_Sub>

// <KNOB_EXTRAMETA_Sub>
async function JSB_CTLS_KNOB_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_KNOB", "JSB_CTLS_KNOB_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({"name":'size',"label":'Size',"width":19,"control":'textbox',"canedit":true,"default":120});
    Viewmodel.columns.push({"name":'color',"label":'Color',"width":19,"control":'textbox',"canedit":true});
    Viewmodel.columns.push({"name":'iminvalue',"index":31,"label":'int Min Vaue',"width":'12em',"control":'textbox',"canedit":true,"default":0});
    Viewmodel.columns.push({"name":'imaxvalue',"index":32,"label":'int Max Value',"width":'12em',"control":'textbox',"canedit":true,"default":100});
    return exit(); 
}
// </KNOB_EXTRAMETA_Sub>

// <CTL_LABEL_Sub>
async function JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_label", "JSB_CTLS_CTL_LABEL_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    var Code = ''; 
    var Defaultvalue = ''; 
    var Displayvalue = ''; 

    Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'width: 100%', ';', Additionalattributes); 
    if (Null0(Column.linecnt)>1) { Additionalattributes = JSB_BF_MERGEATTRIBUTE('style', 'min-height:' + CStr(Column.linecnt) + 'em', ';', Additionalattributes); }

    if (Dokobinding) {
       Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
       // AdditionalAttributes[-1] = `data-bind="text:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"` 
       Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'text', false, '', undefined); 
       Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
    }

    // Label
    if (Gencode) {
       if (CBool(Additionalattributes)) Additionalattributes = JSB_BF_JOINATTRIBUTES(Additionalattributes); else Additionalattributes = '';
       ByRef_Html = [undefined, ]; 
       Code = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name)); 
       if (CBool(Column.multiValuedData) && ((CBool(Column.refdisplay) && Null0(Column.refdisplay)!=Null0(Column.refpk) && (CBool(Column.reffile) || CBool(Column.reflist))) || CBool(Column.reflist))) {
          ByRef_Html[ByRef_Html.length] = 'desc = @lookupCode(' + Code + ', \'' + CStr(Column.refdisplay) + '\', \'' + CStr(Column.refpk) + '\', \'' + CStr(Column.reffile) + '\', \'' + CStr(Column.reflist) + '\', ' + CStr((Column.oktocache)) + ')'; 
          ByRef_Html[ByRef_Html.length] = 'ctlHtml = @Html("\<label class=\'CtlLabel form-control\' id=\'ctllbl_' + Id + '\' ' + CStr(Additionalattributes) + '\>":Replace(@HtmlEncode(desc), Chr(13), "\<br /\>"):"\</label\>\<input class=\'hCtlLabel\' type=\'hidden\' name=\'' + Id + '\' value=\'":@HtmlEncode(' + Code + '):"\' /\>")';
       } else {
          ByRef_Html[ByRef_Html.length] = 'ctlHtml = @Html("\<label class=\'CtlLabel form-control\' id=\'ctllbl_' + Id + '\' ' + CStr(Additionalattributes) + '\>":Replace(@HtmlEncode(' + Code + '), Chr(13), "\<br /\>"):"\</label\>\<input class=\'hCtlLabel\' type=\'hidden\' name=\'' + Id + '\' value=\'":@HtmlEncode(' + Code + '):"\' /\>")';
       }
    } else {
       if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);
       if (CBool(Column.reffile) && CBool(Column.refpk) && CBool(Column.refdisplay) && (Null0(Column.refpk)!=Null0(Column.refdisplay))) {
          Displayvalue = await JSB_BF_LOOKUPCODE(Defaultvalue, CStr(Column.refdisplay), CStr(Column.refpk), CStr(Column.reffile), CStr(Column.reflist), CNum(Column.oktocache));
       } else {
          Displayvalue = Defaultvalue;
       }
       ByRef_Html = Chr(28) + '\<label class=\'CtlLabel form-control\' id=\'ctllbl_' + Id + '\' ' + Join(Additionalattributes,' ') + '\>' + Change(htmlEncode(Displayvalue),Chr(13),'\<br /\>') + '\</label\>\<input class=\'hCtlLabel\' type=\'hidden\' name=\'' + Id + '\' value=\'' + CStr(htmlEncode(Defaultvalue)) + '\' /\>' + Chr(29);
    }

    if (Gencode) {
       if (CBool(Column.mask)) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#ctllbl_' + Id + '").mask("' + Mid1(Column.mask,InStr1(1,Column.mask,',')+1) + '");\')'; }
    } else {
       if (CBool(Column.mask)) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$("#ctllbl_' + Id + '").mask("' + Mid1(Column.mask,InStr1(1,Column.mask,',')+1) + '");'); }
    }
    return exit(); 
}
// </CTL_LABEL_Sub>

// <LABEL_EXTRAMETA_Sub>
async function JSB_CTLS_LABEL_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_LABEL", "JSB_CTLS_LABEL_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({"name":'linecnt',"label":'Lines',"width":19,"control":'textbox',"canedit":true,"default":1});
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 
    return exit(); 
}
// </LABEL_EXTRAMETA_Sub>

// <CTL_MULTISELECTDROPDOWNBOX_Sub>
async function JSB_CTLS_CTL_MULTISELECTDROPDOWNBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_multiselectdropdownbox", "JSB_CTLS_CTL_MULTISELECTDROPDOWNBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
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
          Binding = [undefined, ];
       }

       if (Gencode) {
          if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
          if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';

          if (CBool(Column.reffile)) {
             ByRef_Html = 'ctlHtml = @jsb_html.multiSelectdropdownbox("' + Id + '", @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align=='right')) + ', ' + CStr(CNum(Column.oktocache)) + '), ' + Dftval + ', ' + CStr(Additionalattributes) + ', ' + CStr(Binding) + ')';
          } else if (CBool(Column.reflist)) {
             ByRef_Html = 'ctlHtml = @jsb_html.multiSelectdropdownbox("' + Id + '", "' + Change(Column.reflist,'"','\\"') + '", ' + Dftval + ', ' + CStr(Additionalattributes) + ', ' + CStr(Binding) + ')';
          } else {
             ByRef_Html[ByRef_Html.length] = 'ctlHtml = \'no ref list \' ;* No reference list is setup';
          }

          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
       } else {
          Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row }); 
          if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

          ByRef_Html = JSB_HTML_MULTISELECTDROPDOWNBOX(Id, Values, Defaultvalue, await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes), Binding); 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').blur(function() { doJsbSubmit() });'); }
       }
    } else {
       // Prevents change
       await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
    }
    return exit(); 
}
// </CTL_MULTISELECTDROPDOWNBOX_Sub>

// <MULTISELECTDROPDOWNBOX_EXTRAMETA_Sub>
async function JSB_CTLS_MULTISELECTDROPDOWNBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_MULTISELECTDROPDOWNBOX", "JSB_CTLS_MULTISELECTDROPDOWNBOX_EXTRAMETA_Sub");
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
async function JSB_CTLS_CTL_MULTISELECTFIELDSETBTNS_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_multiselectfieldsetbtns", "JSB_CTLS_CTL_MULTISELECTFIELDSETBTNS_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
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
       ByRef_Html = [undefined, ]; 
       if (Dokobinding) Dftval = 'null'; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
       if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '\'\'';

       if (CBool(Column.reffile)) {
          ByRef_Html[ByRef_Html.length] = 'Dim refList As Array = @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align=='right')) + ', ' + CStr(CNum(Column.oktocache)) + ')'; 
          ByRef_Html[ByRef_Html.length] = 'If refList Then'; 
          ByRef_Html[ByRef_Html.length] = '   ctlHtml = @jsb_html.multiselectfieldsetbtns("' + Id + '", refList, ' + Dftval + ', False /* readOnly */, ' + CStr(Additionalattributes) + ', ' + CStr(Column.multiValuedData) + ' /* multiValuedData */)'; 
          ByRef_Html[ByRef_Html.length] = 'Else'; 
          ByRef_Html[ByRef_Html.length] = '   ctlHtml = \'no ref list \' ;* No reference list is setup for "' + Id + '"'; 
          ByRef_Html[ByRef_Html.length] = 'End If'; ;
       } else if (CBool(Column.reflist)) {
          ByRef_Html[ByRef_Html.length] = 'ctlHtml = @jsb_html.multiselectfieldsetbtns("' + Id + '", "' + Change(Column.reflist,'"','\\"') + '", ' + Dftval + ', ' + CStr(Not(CStr(Column.canedit) + ' /* readOnly */, ' + CStr(Additionalattributes) + ', True /* multiValuedData */)')); ;
       } else {
          ByRef_Html[ByRef_Html.length] = 'ctlHtml = \'no ref list \' ;* No reference list is setup';
       }
    } else {
       if (Dokobinding) Defaultvalue = undefined; else Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

       Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row }); 
       if (CBool(isArray(Values))) {
          ByRef_Html = (JSB_HTML_MULTISELECTFIELDSETBTNS(Id, Values, Defaultvalue, Not(Column.canedit), Additionalattributes, CStr(CBool(Column.multiValuedData) || !isEmpty(Column.reflist))));
       } else {
          ByRef_Html = '';
       }
    }
    return exit(); 
}
// </CTL_MULTISELECTFIELDSETBTNS_Sub>

// <MULTISELECTFIELDSETBTNS_EXTRAMETA_Sub>
async function JSB_CTLS_MULTISELECTFIELDSETBTNS_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_MULTISELECTFIELDSETBTNS", "JSB_CTLS_MULTISELECTFIELDSETBTNS_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 
    return exit(); 
}
// </MULTISELECTFIELDSETBTNS_EXTRAMETA_Sub>

// <CTL_MULTISELECTLISTBOX_Sub>
async function JSB_CTLS_CTL_MULTISELECTLISTBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_multiselectlistbox", "JSB_CTLS_CTL_MULTISELECTLISTBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
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
          if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';

          if (CBool(Column.reffile)) {
             ByRef_Html = 'ctlHtml = @jsb_html.multiSelectListBox("' + Id + '", @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align=='right')) + ', ' + CStr(CNum(Column.oktocache)) + '), ' + Dftval + ', ' + CStr(Additionalattributes) + ')';
          } else if (CBool(Column.reflist)) {
             ByRef_Html = 'ctlHtml = @jsb_html.multiSelectListBox("' + Id + '", "' + Change(Column.reflist,'"','\\"') + '", ' + Dftval + ', ' + CStr(Additionalattributes) + ')';
          } else {
             ByRef_Html[ByRef_Html.length] = 'ctlHtml = \'no ref list \' ;* No reference list is setup';
          }

          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").blur(function() { doJsbSubmit() });\')'; }
       } else {
          Holdblanks = Column.notblank; 
          Column.notblank = true; 
          Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row }); 
          Column.notblank = Holdblanks; 

          if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

          ByRef_Html = JSB_HTML_MULTISELECTLISTBOX(Id, Values, Defaultvalue, await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes)); 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').blur(function() { doJsbSubmit() });'); }
       }
    } else {
       // Prevents change
       await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
    }
    return exit(); 
}
// </CTL_MULTISELECTLISTBOX_Sub>

// <MULTISELECTLISTBOX_EXTRAMETA_Sub>
async function JSB_CTLS_MULTISELECTLISTBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_MULTISELECTLISTBOX", "JSB_CTLS_MULTISELECTLISTBOX_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 
    Viewmodel.columns.push({"name":'autopostback',"label":'Auto PostBack',"width":19,"control":'checkbox',"canedit":true,"defaultvalue":0,"reflist":'false,0;true,1'});
    return exit(); 
}
// </MULTISELECTLISTBOX_EXTRAMETA_Sub>

// <CTL_PASSWORDBOX_Sub>
async function JSB_CTLS_CTL_PASSWORDBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_passwordbox", "JSB_CTLS_CTL_PASSWORDBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
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
          if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';

          ByRef_Html = 'ctlHtml = @jsb_html.PasswordBox("' + Id + '", ' + CStr(Row) + ', false, ' + CStr(Additionalattributes) + ')'; 
          if (CBool(Column.mask)) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").mask("' + Mid1(Column.mask,InStr1(1,Column.mask,',')+1) + '");\')'; }
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
       } else {
          if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);
          ByRef_Html = JSB_HTML_PASSWORDBOX(Id, Defaultvalue, false, Additionalattributes); 
          if (CBool(Column.mask)) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$("#' + Id + '").mask("' + Mid1(Column.mask,InStr1(1,Column.mask,',')+1) + '");'); }
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
       }
    } else {
       await JSB_CTLS_CTL_TEXTBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
    }
    return exit(); 
}
// </CTL_PASSWORDBOX_Sub>

// <CTL_PHONEBOX_Sub>
async function JSB_CTLS_CTL_PHONEBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_phonebox", "JSB_CTLS_CTL_PHONEBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    // AdditionalAttributes[-1] = `data-parsley-type="phone"`
    Column.mask = '(999) 999-9999? x99999'; 
    await JSB_CTLS_CTL_TEXTBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html }); 
    return exit(); 
}
// </CTL_PHONEBOX_Sub>

// <CTL_POPSELECTION_Sub>
async function JSB_CTLS_CTL_POPSELECTION_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_popselection", "JSB_CTLS_CTL_POPSELECTION_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
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
          if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';

          ByRef_Html = 'ctlHtml = @jsb_html.InputPopSelection("' + Id + '", @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align=='right')) + ', ' + CStr(CNum(Column.oktocache)) + '), ' + Dftval + ', ' + CStr(Additionalattributes) + ', "' + CStr(Column.popupwidth) + '", "' + CStr(Column.popupheight) + '", "' + CStr(Column.popuptitle) + '")'; 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
       } else {
          Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row }); 

          if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

          ByRef_Html = JSB_HTML_INPUTPOPSELECTION(Id, Values, Defaultvalue, await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes), CStr(Column.popupwidth), CStr(Column.popupheight), CStr(Column.popuptitle)); 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
       }
    } else {
       // Prevents change
       await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
    }

    return exit(); 
}
// </CTL_POPSELECTION_Sub>

// <POPSELECTION_EXTRAMETA_Sub>
async function JSB_CTLS_POPSELECTION_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_POPSELECTION", "JSB_CTLS_POPSELECTION_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 

    Viewmodel.columns.push({"name":'autopostback',"label":'Auto PostBack',"width":19,"control":'checkbox',"canedit":true,"defaultvalue":0,"reflist":'false,0;true,1'});

    Viewmodel.columns.push({"name":'popuptitle',"label":'Popup Title',"width":19,"control":'textbox',"canedit":true,"notblank":false});
    Viewmodel.columns.push({"name":'popupwidth',"label":'Popup Width',"width":19,"control":'textbox',"canedit":true,"notblank":false});
    Viewmodel.columns.push({"name":'popupheight',"label":'Popup Height',"width":19,"control":'textbox',"canedit":true,"notblank":false});
    return exit(); 
}
// </POPSELECTION_EXTRAMETA_Sub>

// <CTL_RADIOBOX_Sub>
async function JSB_CTLS_CTL_RADIOBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_radiobox", "JSB_CTLS_CTL_RADIOBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    // See if there is a RefFIle, and make a json array, or json callback

    var Dftval = ''; 
    var Values = ''; 
    var Defaultvalue = ''; 

    Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, [undefined, ]); 

    if (Dokobinding) {
       Additionalattributes = JSB_BF_MERGEATTRIBUTE('', '', ';', Additionalattributes); // Force JSON to array
       // AdditionalAttributes[-1] = `data-bind="addIfNotInList: {}, checked:$data['`:Column.name:`'], checked:$data['`:Column.name:`']?$data['`:Column.name:`']:`:IFF(Column.defaultvalue, Column.defaultvalue, 0):`, attr: { name: '`:Column.name:`' + $index() }"` 
       Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'checked', false, '', undefined, true) + ', attr: { name: \'' + CStr(Column.name) + '\' + $index() }"'; 
       Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\'';
    }

    if (Gencode) {
       if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
       if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '\'\'';

       if (CBool(Column.reflist)) {
          ByRef_Html = 'ctlHtml = @jsb_html.RadioBtns(\'' + Id + '\', "' + Change(Column.reflist,'"','\\"') + '", ' + Dftval + ', ' + CStr((Not(Column.canedit))) + ', ' + CStr(Additionalattributes) + ')';
       } else {
          ByRef_Html = 'ctlHtml = @jsb_html.RadioBtns(\'' + Id + '\', @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align=='right')) + ', ' + CStr(CNum(Column.oktocache)) + '), ' + Dftval + ', ' + CStr((Not(Column.canedit))) + ', ' + CStr(Additionalattributes) + ')';
       }

       if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
    } else {
       Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row }); 
       if (Dokobinding) {
          ByRef_Html = JSB_HTML_RADIOBTNS('', Values, undefined, (Not(Column.canedit)), Additionalattributes);
       } else {
          if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);
          ByRef_Html = JSB_HTML_RADIOBTNS(Id, Values, Defaultvalue, (Not(Column.canedit)), Additionalattributes); 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$("[name=\'' + Id + '\']").change(function() { doJsbSubmit() });'); }
       }
    }
    return exit(); 
}
// </CTL_RADIOBOX_Sub>

// <RADIOBOX_EXTRAMETA_Sub>
async function JSB_CTLS_RADIOBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_RADIOBOX", "JSB_CTLS_RADIOBOX_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 
    Viewmodel.columns.push({"name":'autopostback',"label":'Auto PostBack',"width":19,"control":'checkbox',"canedit":true,"defaultvalue":0,"reflist":'false,0;true,1'});
    return exit(); 
}
// </RADIOBOX_EXTRAMETA_Sub>

// <CTL_SLIDER_Sub>
async function JSB_CTLS_CTL_SLIDER_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_slider", "JSB_CTLS_CTL_SLIDER_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
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
       ByRef_Html = [undefined, ]; 
       if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
       if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '\'\'';
       ByRef_Html[ByRef_Html.length] = 'ctlHtml = @jsb_html.Slider(\'' + Id + '\', ' + Dftval + ', ' + CStr(Column.iminvalue) + ', ' + CStr(Column.imaxvalue) + ', 1, ' + CStr(Additionalattributes) + ')'; ;
    } else {
       Dftval = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname); 
       ByRef_Html = JSB_HTML_SLIDER(Id, Dftval, CStr(Column.iminvalue), CNum(Column.imaxvalue), 1, Additionalattributes);
    }

    return exit(); 
}
// </CTL_SLIDER_Sub>

// <SLIDER_EXTRAMETA_Sub>
async function JSB_CTLS_SLIDER_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_SLIDER", "JSB_CTLS_SLIDER_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({"name":'size',"label":'Size',"width":19,"control":'textbox',"canedit":true,"default":120});
    Viewmodel.columns.push({"name":'color',"label":'Color',"width":19,"control":'textbox',"canedit":true});
    Viewmodel.columns.push({"name":'iminvalue',"index":31,"label":'int Min Vaue',"width":'12em',"control":'textbox',"canedit":true,"default":0});
    Viewmodel.columns.push({"name":'imaxvalue',"index":32,"label":'int Max Value',"width":'12em',"control":'textbox',"canedit":true,"default":100});
    Viewmodel.columns.push({"name":'units',"index":33,"label":'Units',"width":'12em',"control":'textbox',"canedit":true,"default":''});
    return exit(); 
}
// </SLIDER_EXTRAMETA_Sub>

// <CTL_SLIDERLABELED_Sub>
async function JSB_CTLS_CTL_SLIDERLABELED_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_sliderlabeled", "JSB_CTLS_CTL_SLIDERLABELED_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
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
          if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';

          if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));

          if (CBool(Column.reffile)) {
             ByRef_Html = 'ctlHtml = @jsb_html.sliderLabeled("' + Id + '", @jsb_bf.getRefValuesBySelect("' + CStr(Column.reffile) + '", "' + CStr(Column.refpk) + '", "' + CStr(Column.refdisplay) + '", "' + CStr(Column.refwhere) + '", ' + CStr((Column.align=='right')) + ', ' + CStr(CNum(Column.oktocache)) + '), ' + Dftval + ', ' + CStr(CNum(Column.addBlank)+0) + ' /* addBlank */, False /* readOnly */, ' + CStr(Additionalattributes) + ', ' + CStr(Column.multiValuedData) + ' /* multiValuedData */)';
          } else {
             ByRef_Html = 'ctlHtml = @jsb_html.sliderLabeled("' + Id + '", "' + Change(Column.reflist,'"','\\"') + '", ' + Dftval + ', ' + CStr(CNum(Column.addBlank)+0) + ' /* addBlank */, False /* readOnly */, ' + CStr(Additionalattributes) + ', True /* multiValuedData */)';
          }
       } else {
          if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);
          Additionalattributes = await JSB_CTLS_ADDPARSLEY(Column, Additionalattributes); 

          Values = await JSB_MDL_MDLGETREFVALUES(Projectname, Column, Row, function (_Projectname, _Column, _Row) { Projectname = _Projectname; Column = _Column; Row = _Row }); 
          ByRef_Html = (JSB_HTML_SLIDERLABELED(Id, Values, Defaultvalue, CStr(Column.addBlank), false, Additionalattributes, CStr(CBool(Column.multiValuedData) || !isEmpty(Column.reflist))));
       }
    } else {
       await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
    }
    return exit(); 
}
// </CTL_SLIDERLABELED_Sub>

// <SLIDERLABELED_EXTRAMETA_Sub>
async function JSB_CTLS_SLIDERLABELED_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_SLIDERLABELED", "JSB_CTLS_SLIDERLABELED_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 
    return exit(); 
}
// </SLIDERLABELED_EXTRAMETA_Sub>

// <CTL_SMARTCOMBOBOX_Sub>
async function JSB_CTLS_CTL_SMARTCOMBOBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_smartcombobox", "JSB_CTLS_CTL_SMARTCOMBOBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    Column.control = 'combobox'; 
    Column.savenewvalues = true; 
    await JSB_CTLS_COMBOBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_Projectname, _Id, _Column, _Row, _ByRef_Html, _Dokobinding, _Additionalattributes, _Gencode, _Viewname) { Projectname = _Projectname; Id = _Id; Column = _Column; Row = _Row; ByRef_Html = _ByRef_Html; Dokobinding = _Dokobinding; Additionalattributes = _Additionalattributes; Gencode = _Gencode; Viewname = _Viewname }); 

    return exit(); 
}
// </CTL_SMARTCOMBOBOX_Sub>

// <SMARTCOMBOBOX_EXTRAMETA_Sub>
async function JSB_CTLS_SMARTCOMBOBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_SMARTCOMBOBOX", "JSB_CTLS_SMARTCOMBOBOX_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({"name":'autopostback',"label":'Auto PostBack',"width":19,"control":'checkbox',"canedit":true,"defaultvalue":0,"reflist":'false,0;true,1'});
    Viewmodel.columns.push({"name":'multiselect',"label":'Allow Multi Selection',"width":19,"control":'checkbox',"canedit":true,"defaultvalue":0,"reflist":'false,0;true,1'});

    await JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, function (_ByRef_Row) { ByRef_Row = _ByRef_Row }); 
    return exit(); 
}
// </SMARTCOMBOBOX_EXTRAMETA_Sub>

// <CTL_TEXTBOX_Sub>
async function JSB_CTLS_CTL_TEXTBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_textbox", "JSB_CTLS_CTL_TEXTBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    var Defaultvalue = ''; 
    var Mobilepad = ''; 

    if (!Gencode && Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

    if (Null0(Column.linecnt)>1) {
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

       if (Column.datatype=='integer') {
          Additionalattributes[Additionalattributes.length] = 'data-parsley-type="integer"'; 
          if (!InStr1(1,Additionalattributes,'placeholder')) Additionalattributes[Additionalattributes.length] = 'placeholder="please enter an integer number"';
          Additionalattributes[Additionalattributes.length] = 'type="number"';
       }

       if (Column.datatype=='double') {
          Additionalattributes[Additionalattributes.length] = 'data-parsley-type="number"'; 
          if (!InStr1(1,Additionalattributes,'placeholder')) Additionalattributes[Additionalattributes.length] = 'placeholder="please enter a decimal number"';
          // AdditionalAttributes[-1] = `pattern="[\d]+([\.][\d]+)?"`
          Additionalattributes[Additionalattributes.length] = 'type="tel"';
       }

       Mobilepad = Column.mobilepad; 
       if (Mobilepad && Null0(Column.linecnt)<=1) {
          if (Mobilepad=='custom') {
             Mobilepad = Column.custompad; 
             if (Left(Mobilepad,2)!='[[' || Right(Mobilepad,2)!=']]') Println('Your ', Viewname, ' ', Id, ' field has has a malformed custom pad: ', Mobilepad);
          } else {
             if (Column.datatype=='integer') {
                if (Locate(Mobilepad, [undefined, 'integer', 'integer+', ''], 0, 0, 0, "", position => { })); else Println('Your ', Viewname, ' ', Id, ' field has an integer datatype and your are using a non-integer keyboard: ', Mobilepad);
                Additionalattributes = JSB_BF_MERGEATTRIBUTE('type', 'number', ';', Additionalattributes); ;
             } else if (Column.datatype=='double') {
                if (Locate(Mobilepad, [undefined, 'real', 'integer', 'integer+', ''], 0, 0, 0, "", position => { })); else Println('Your ', Viewname, ' ', Id, ' field has an double datatype and your are using a non-integer keyboard: ', Mobilepad);
             }
          }
       }

       if (Gencode) { if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]'; }

       if (Null0(Column.linecnt)>1) {
          if (Gencode) {
             ByRef_Html = 'ctlHtml = @jsb_html.TextArea("' + Id + '",' + CStr(Row) + ', ' + CStr(CNum(Column.linecnt)+0) + ', "", ' + CStr(Additionalattributes) + ')';
          } else {
             
             ByRef_Html = JSB_HTML_TEXTAREA(Id, Defaultvalue, CStr(Column.linecnt), '', Additionalattributes);
          }
       } else {
          if (Gencode) {
             if (Column.datatype=='integer') {
                ByRef_Html = 'ctlHtml = @jsb_html.IntegerBox("' + Id + '", ' + CStr(Row) + ', false, ' + CStr(Additionalattributes) + ', \'' + CStr(Column.iminvalue) + '\', \'' + CStr(Column.imaxvalue) + '\')'; ;
             } else if (Column.datatype=='double') {
                ByRef_Html = 'ctlHtml = @jsb_html.DecimalBox("' + Id + '", ' + CStr(Row) + ', false, ' + CStr(Additionalattributes) + ', \'' + CStr(Column.xminvalue) + '\', \'' + CStr(Column.xmaxvalue) + '\')'; ;
             } else {
                ByRef_Html = 'ctlHtml = @jsb_html.TextBox("' + Id + '", ' + CStr(Row) + ', false, ' + CStr(Additionalattributes) + ', "' + Mobilepad + '")';
             }
          } else {
             if (Column.datatype=='integer') {
                ByRef_Html = JSB_HTML_INTEGERBOX(Id, Defaultvalue, false, Additionalattributes, CStr(Column.iminvalue), CStr(Column.imaxvalue)); ;
             } else if (Column.datatype=='double') {
                ByRef_Html = JSB_HTML_DECIMALBOX(Id, Defaultvalue, false, Additionalattributes, CStr(Column.xminvalue), CStr(Column.xmaxvalue)); ;
             } else {
                ByRef_Html = JSB_HTML_TEXTBOX(Id, Defaultvalue, false, Additionalattributes, Mobilepad);
             }
          }
       }

       if (Gencode) {
          if (CBool(Column.mask)) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").mask("' + Mid1(Column.mask,InStr1(1,Column.mask,',')+1) + '");\')'; }
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
       } else {
          if (CBool(Column.mask)) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$("#' + Id + '").mask("' + Mid1(Column.mask,InStr1(1,Column.mask,',')+1) + '");'); }
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
       }
    } else {
       if (Null0(Column.linecnt)>1) {
          Additionalattributes[Additionalattributes.length] = 'readonly'; 
          if (Gencode) {
             if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';
             ByRef_Html = 'ctlHtml = @jsb_html.TextArea("' + Id + '", ' + CStr(Row) + ', ' + CStr(Column.linecnt) + ', "", ' + CStr(Additionalattributes) + ')';
          } else {
             ByRef_Html = JSB_HTML_TEXTAREA(Id, Defaultvalue, CStr(Column.linecnt), '', Additionalattributes);
          }
       } else {
          await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
       }
    }
    return exit(); 
}
// </CTL_TEXTBOX_Sub>

// <TEXTBOX_EXTRAMETA_Sub>
async function JSB_CTLS_TEXTBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_TEXTBOX", "JSB_CTLS_TEXTBOX_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({"name":'linecnt',"label":'Lines',"width":19,"control":'textbox',"canedit":true,"defaultvalue":1});
    Viewmodel.columns.push({"name":'mobilepad',"label":'Mobile Pad',"width":19,"control":'dropdownbox',"canedit":true,"defaultvalue":'full',"addBlank":true,"reflist":'hex;hex+;integer;integer+;real;full;custom'});
    Viewmodel.columns.push({"name":'custompad',"label":'Custom Pad',"width":19,"control":'textbox',"canedit":true,"tooltip":'[[\'a\', \'Cancel\', \'Accept\'], [\'b\', \'Clear\', \'Delete\']]',"display":'gridhidden',"defaultvalue":'[[\'1\',\'2\',\'3\',\'4\',\'.\',\'Accept\'],[\'5\',\'6\',\'7\',\'8\',\'-\',\'Cancel\'],[\'9\',\'0\',\'A\',\'B\',\'_\',\'Clear\'],[\'C\',\'D\',\'E\',\'F\',\'Space\',\'Delete\']]'});

    // options.layout = [['1', '2', '3', '4', '.', 'Accept'], ['5', '6', '7', '8', '-', 'Cancel'], ['9', '0', 'A', 'B', '_', 'Clear'], ['C', 'D', 'E', 'F', 'Space', 'Delete']]

    Viewmodel.columns.push({"name":'regx',"index":33,"label":'RegX',"width":'12em',"control":'comboBox',"canedit":true,"display":'gridhidden',
"reflist":'mm/dd/yy,^(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\\d\\d$;yyyy/mm/dd,^(19|20)\\d\\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$;ZipCode,^\\d{5}(?:[-\\s]\\d{4})?$;UserName,/^[a-z0-9_-]{3,16}$/;Password,/^[a-z0-9_-]{6,18};HexValue,/^#?([a-f0-9]{6}|[a-f0-9]{3})$/;E-Mail,/^([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})$/;URL,/^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$/;IP,/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;SSN,^\\d{3}-?\\d{2}-?\\d{4}$;Phone,^(?:(?:\\+?1\\s*(?:[.-]\\s*)?)?(?:\\(\\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\\s*\\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\\s*(?:[.-]\\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\\s*(?:[.-]\\s*)?([0-9]{4})(?:\\s*(?:#|x\\.?|ext\\.?|extension)\\s*(\\d+))?$'
});

    if (ByRef_Row.datatype=='integer') {
       Viewmodel.columns.push({"name":'iminvalue',"index":31,"label":'int Min Vaue',"width":'12em',"control":'textbox',"canedit":true,"display":'gridhidden'});
       Viewmodel.columns.push({"name":'imaxvalue',"index":32,"label":'int Max Value',"width":'12em',"control":'textbox',"canedit":true,"display":'gridhidden'});
       delete ByRef_Row['xminvalue']
       delete ByRef_Row['xminvalue'];
    } else if (ByRef_Row.datatype=='double') {
       Viewmodel.columns.push({"name":'xminvalue',"index":31,"label":'Min Vaue',"width":'12em',"control":'textbox',"canedit":true,"display":'gridhidden'});
       Viewmodel.columns.push({"name":'xmaxvalue',"index":32,"label":'Max Value',"width":'12em',"control":'textbox',"canedit":true,"display":'gridhidden'});
       delete ByRef_Row['iminvalue']
       delete ByRef_Row['iminvalue'];
    } else {
       delete ByRef_Row['iminvalue']
       delete ByRef_Row['iminvalue']
       delete ByRef_Row['xminvalue']
       delete ByRef_Row['xminvalue'];
    }

    Viewmodel.columns.push({"name":'regxtext',"index":34,"label":'Reg X Text',"width":'12em',"control":'textbox',"canedit":true,"display":'gridhidden'});

    // https://igorescobar.github.io/jQuery-Mask-Plugin/
    Viewmodel.columns.push({"name":'mask',"index":33,"label":'Mask',"width":'12em',"control":'comboBox',"canedit":true,"display":'gridhidden',"tooltip":' Use S(a-z) A(a-z,0-9) 0(req digit) 9(opt digit) #(any digits)',
"reflist":'mm/dd/yyyy,00/00/0000;yyyy-mm-dd,0000-00-00;ZipCode,00000;SSN,000-00-0000;Phone,(000) 000-0000'
});
    return exit(); 
}
// </TEXTBOX_EXTRAMETA_Sub>

// <CTL_TIMEBOX_Sub>
async function JSB_CTLS_CTL_TIMEBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_timebox", "JSB_CTLS_CTL_TIMEBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
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
          if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';
          ByRef_Html = 'ctlHtml = @jsb_html.TimeBox("' + Id + '", ' + Dftval + ', ' + CStr(Not(Column.canedit)) + ', ' + CStr(Additionalattributes) + ')'; 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + crlf + 'ctlHtml := @Script(\'$("#' + Id + '").change(function() { doJsbSubmit() });\')'; }
       } else {
          if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);
          ByRef_Html = JSB_HTML_TIMEBOX(Id, Defaultvalue, Not(Column.canedit), Additionalattributes); 
          if (CBool(Column.autopostback) && Id) { ByRef_Html = CStr(ByRef_Html) + JSB_HTML_SCRIPT('$(\'#' + Id + '\').change(function() { doJsbSubmit() });'); }
       }
    } else {
       await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
    }
    return exit(undefined); 
}
// </CTL_TIMEBOX_Sub>

// <CTL_UPLOADBOX_Sub>
async function JSB_CTLS_CTL_UPLOADBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_uploadbox", "JSB_CTLS_CTL_UPLOADBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    var Defaultvalue = ''; 
    var Lbladditionalattributes = undefined; 
    var Ctladditionalattributes = undefined; 

    if (!Gencode && Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);

    if (CBool(Column.canedit)) {
       Lbladditionalattributes = await JSB_CTLS_ADDPARSLEY(Column, Lbladditionalattributes); // Force to be an Array[]

       if (Dokobinding) {
          Lbladditionalattributes[Lbladditionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'text', false, undefined, undefined); 
          Lbladditionalattributes[Lbladditionalattributes.length] = 'class=\'knockOutCtl\''; 
          Id = ''; 

          // CtlAdditionalAttributes = koLoad(Column.name, Column.defaultvalue, 'fileinput', False /* addIfNotInList */, Nothing /* onload jsFunctionName */,  Nothing /* jsExtraFunctionParameters */)
          Ctladditionalattributes = [undefined, 'data-bind="attr: {name: \'KO_' + CStr(nicename(Column.name)) + '_\' + $index() }"'];
       }

       if (Gencode) {
          if (CBool(Lbladditionalattributes)) Lbladditionalattributes = '[`' + Join(Lbladditionalattributes,'`,`') + '`]'; else Lbladditionalattributes = '[]';
          if (CBool(Ctladditionalattributes)) Ctladditionalattributes = '[`' + Join(Ctladditionalattributes,'`,`') + '`]';
          ByRef_Html = 'ctlHtml := @jsb_html.UploadBox("' + Id + '", ' + CStr(Row) + ', ' + CStr(CNum(Column.autopostback)+0) + ' /* autopostback */, false /* allowMultipleFiles */, \'' + CStr(Column.mimetypes) + '\', ' + CStr(Lbladditionalattributes) + ', ' + CStr(Ctladditionalattributes) + ')';
       } else {
          if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);
          ByRef_Html = JSB_HTML_UPLOADBOX(Id, Defaultvalue, ':Column.autopostback + 0:', false, CStr(Column.mimetypes), Lbladditionalattributes, Ctladditionalattributes);
       }
    } else {
       await JSB_CTLS_CTL_LABEL_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Lbladditionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html });
    }
    return exit(); 
}
// </CTL_UPLOADBOX_Sub>

// <UPLOADBOX_EXTRAMETA_Sub>
async function JSB_CTLS_UPLOADBOX_EXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "CTL_UPLOADBOX", "JSB_CTLS_UPLOADBOX_EXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({"name":'storagefile',"label":'Storage Path',"width":19,"control":'textbox',"canedit":true,"default":1});
    Viewmodel.columns.push({"name":'mimetypes',"label":'mimetypes',"width":19,"control":'combobox',"canedit":true,"reflist":'audio/*;video/*;image/*'});

    Viewmodel.columns.push({"name":'appenddate',"label":'Append Date',"width":19,"control":'checkbox',"canedit":true,"required":false,"notblank":false,"defaultvalue":0,"reflist":'false,0;true,1'});
    Viewmodel.columns.push({"name":'registeraccount',"label":'Register as Act',"width":19,"control":'checkbox',"canedit":true,"defaultvalue":0,"reflist":'false,0;true,1'});
    Viewmodel.columns.push({"name":'filenameprefix',"label":'FileName Prefix',"width":19,"control":'checkbox',"canedit":true,"defaultvalue":0,"reflist":'false,0;true,1'});

    return exit(); 
}
// </UPLOADBOX_EXTRAMETA_Sub>

// <CTL_URLBOX_Sub>
async function JSB_CTLS_CTL_URLBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "ctl_urlbox", "JSB_CTLS_CTL_URLBOX_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Html)
        return v
    }
    var Dftval = ''; 
    var Defaultvalue = ''; 

    if (CBool(Column.canedit)) {
       Additionalattributes[Additionalattributes.length] = 'data-parsley-type="url"'; 
       await JSB_CTLS_CTL_TEXTBOX_Sub(Projectname, Id, Column, Row, ByRef_Html, Dokobinding, Additionalattributes, Gencode, Viewname, function (_ByRef_Html) { ByRef_Html = _ByRef_Html }); 
       return exit(undefined);
    }

    if (Dokobinding) {
       // AdditionalAttributes[-1] = `data-bind="value:$data['`:Column.name:`'], value:$data['`:Column.name:`']?$data['`:Column.name:`']:'`:Column.defaultvalue:`'"`  
       Additionalattributes[Additionalattributes.length] = await JSB_CTLS_KOLOAD(CStr(Column.name), CNum(Column.defaultvalue), 'value', false, '', undefined); 
       Additionalattributes[Additionalattributes.length] = 'class=\'knockOutCtl\''; 
       Id = '';
    }

    if (Gencode) {
       if (CBool(Additionalattributes)) Additionalattributes = '[`' + Join(Additionalattributes,'`,`') + '`]'; else Additionalattributes = '[]';
       if (Dokobinding) Dftval = undefined; else Dftval = await JSB_CTLS_GETDEFAULTFMT(CStr(Row), CStr(Column.defaultvalue), CStr(Column.name));
       ByRef_Html = 'ctlHtml = @jsb_html.Anchor("' + Id + '", ' + Dftval + ', ' + Dftval + ', ' + CStr(Additionalattributes) + ')';
    } else {
       if (Not(Dokobinding)) Defaultvalue = JSB_BF_GETDEFAULTVALUE(CStr(Row[Column.name]), CStr(Column.defaultvalue), CStr(Column.name), Viewname);
       ByRef_Html = JSB_HTML_ANCHOR(Id, Defaultvalue, Defaultvalue, Additionalattributes);
    }

    return exit(undefined); 
}
// </CTL_URLBOX_Sub>

// <_ADDPARSLEY_Sub>
async function JSB_CTLS__ADDPARSLEY_Sub() { 
    var me = new jsbRoutine("JSB_CTLS", "_addparsley", "JSB_CTLS__ADDPARSLEY_Sub");
}
// </_ADDPARSLEY_Sub>

// <ADDPARSLEY>
async function JSB_CTLS_ADDPARSLEY(Column, Additionalattributes) { 
    var me = new jsbRoutine("JSB_CTLS", "_ADDPARSLEY", "JSB_CTLS_ADDPARSLEY");
    var Parsleyneeded = undefined; 
    var Attributes = undefined; 

    Attributes = Additionalattributes; 
    if (Not(Attributes)) {
       Attributes = [undefined, ];
    } else if (typeOf(Attributes)!='Array') {
       Attributes = JSB_BF_MERGEATTRIBUTE('', '', '', Attributes);
    }

    if (CBool(Column.tooltip)) {
       if (!InStr1(1,Attributes,'title')) Attributes[Attributes.length] = 'title="' + CStr(Column.tooltip) + '"';
       if (!InStr1(1,Attributes,'placeholder')) Attributes[Attributes.length] = 'placeholder="' + CStr(Column.tooltip) + '"';
    } else if (CBool(Column.suppresslabel)) {
       if (!InStr1(1,Attributes,'title')) Attributes[Attributes.length] = 'title="' + CStr(Column.label) + '"';
       if (!InStr1(1,Attributes,'placeholder')) Attributes[Attributes.length] = 'placeholder="' + CStr(Column.label) + '"';
    } else if (CBool(Column.label)) {
       if (!InStr1(1,Attributes,'placeholder')) Attributes[Attributes.length] = 'placeholder="' + CStr(Column.label) + '"';
    }

    Parsleyneeded = (CBool(Column.required) || CBool(Column.notblank) || !isEmpty(Column.iminvalue) || !isEmpty(Column.imaxvalue) || !isEmpty(Column.xminvalue) || !isEmpty(Column.xmaxvalue) || !isEmpty(Column.regx)); 
    if (!Parsleyneeded) return Attributes;

    Attributes[Attributes.length] = [undefined, 'parsley-trigger="change focusout"']; 
    if (CBool(Column.required) || CBool(Column.notblank)) Attributes[Attributes.length] = 'required';

    if (Column.datatype=='integer') {
       if (Len(Column.iminvalue)) Attributes[Attributes.length] = 'min="' + CStr(Column.iminvalue) + '"';
       if (Len(Column.imaxvalue)) Attributes[Attributes.length] = 'max="' + CStr(Column.imaxvalue) + '"';
    } else if (Column.datatype=='double') {
       if (CBool(Column.xminvalue)) Attributes[Attributes.length] = 'min="' + CStr(Column.xminvalue) + '"';
       if (CBool(Column.xmaxvalue)) Attributes[Attributes.length] = 'max="' + CStr(Column.xmaxvalue) + '"';
    }

    if (CBool(Column.regx)) {
       Attributes[Attributes.length] = 'pattern="' + Mid1(Column.regx,InStr1(1,Column.regx,',')+1) + '"'; 
       if (CBool(Column.regxtext)) Attributes[Attributes.length] = 'data-parsley-error-message="' + CStr(Column.regxtext) + '"';
    }

    Attributes = JSB_BF_MERGEATTRIBUTE('onchange', 'parsleyReset(this)', ';', Attributes); 

    return Attributes; 
}
// </ADDPARSLEY>

// <_GETDEFAULTFMT_Sub>
async function JSB_CTLS__GETDEFAULTFMT_Sub() { 
    var me = new jsbRoutine("JSB_CTLS", "_getdefaultfmt", "JSB_CTLS__GETDEFAULTFMT_Sub");
}
// </_GETDEFAULTFMT_Sub>

// <GETDEFAULTFMT>
async function JSB_CTLS_GETDEFAULTFMT(Row, Defaultvalue, Columnname) { 
    var me = new jsbRoutine("JSB_CTLS", "_GETDEFAULTFMT", "JSB_CTLS_GETDEFAULTFMT");
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

    if (Not(Defaultvalue)) return Row + '';

    // Check for {xxx} substituions
    Isexpression = (InStr1(1,Defaultvalue,'{') || InStr1(1,Defaultvalue,'(') || InStr1(1,Defaultvalue,'+') || InStr1(1,Defaultvalue,'-') || InStr1(1,Defaultvalue,'/') || InStr1(1,Defaultvalue,'*') || InStr1(1,Defaultvalue,':')); 
    Defaultvalues = Split(Defaultvalue,'{'); 
    R = [undefined, Defaultvalues[1]]; 
    var _ForEndI_2 = UBound(Defaultvalues); 
    for (I = 2; I<=_ForEndI_2; I++) {
       Funcname = LTrim(RTrim(Defaultvalues[I])); 
       Funcname = Field(Funcname,'}',1); 
       if (Left(Funcname,1)=='@') Funcname = Mid1(Funcname,2);

       if (InStr1(1,Funcname,'(')) {
          Extra = '(' + CStr(dropLeft(Funcname, '(')); 
          Funcname = Field(Funcname,'(',1);
       } else {
          Extra = '';
       }

       switch (LCase(Funcname)) {
          case 'objectname': case 'viewname': 
             Newdefaultvalue = '\'' + Columnname + '\''; 

       break; 

          case 'niceobjectname': case 'niceviewname': 
             Newdefaultvalue = '\'' + CStr(nicename(Columnname)) + '\''; 

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
             Newdefaultvalue = '@session(\'LastValue:' + Columnname + '\')'; 

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
             Mrow = Field(Row,'[',1); 
             Newdefaultvalue = Mrow + '[\'' + Funcname + '\']';        
    } 

       R[R.length] = 'IFF(' + Row + ', ' + Row + ', ' + Newdefaultvalue + ')'; 
    } 
    Newdefaultvalue = Join(R,''); 

    Q = ''; 
    if (!Isexpression) {
       Newdefaultvalue = Defaultvalue; 
       Ldftval = LCase(Defaultvalue); 

       if (isNumeric(Newdefaultvalue)); else if (Ldftval=='false' || Ldftval=='true' || Ldftval=='null'); else if (Left(Newdefaultvalue,1)=='\'' && Right(Newdefaultvalue,1)=='\''); else if (Left(Newdefaultvalue,1)=='"' && Right(Newdefaultvalue,1)=='"'); else if (Left(Newdefaultvalue,1)=='`' && Right(Newdefaultvalue,1)=='`'); else if (!InStr1(1,Newdefaultvalue,'`')) {
          Q = '`';
       } else if (!InStr1(1,Newdefaultvalue,'\'')) {
          Q = '\'';
       } else if (!InStr1(1,Newdefaultvalue,'"')) {
          Q = '"';
       } else {
          Alert('Your default value for ' + Newdefaultvalue + ' contains both types of quotes.');
       }
    }

    return 'IFF(' + Row + ', ' + Row + ', ' + Q + Newdefaultvalue + Q + ')'; 
}
// </GETDEFAULTFMT>

// <_JSON_SETUP_Sub>
async function JSB_CTLS__JSON_SETUP_Sub() { 
    var me = new jsbRoutine("JSB_CTLS", "_Json_setup", "JSB_CTLS__JSON_SETUP_Sub");
}
// </_JSON_SETUP_Sub>

// <JSON_SETUP>
async function JSB_CTLS_JSON_SETUP(Projectname, Id, Column, Row, ByRef_Errors, Additionalattributes, ByRef_Defaultrow, ByRef_Dataset, ByRef_Model, ByRef_Editviewname, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "_JSON_SETUP", "JSB_CTLS_JSON_SETUP");
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
          ByRef_Errors = JSB_BF_HTML('Unable to find view ' + CStr(Column.useview) + ' for json_inline column ' + CStr(Column.name)); 
          return exit(false);
       }
       ByRef_Editviewname = Projectname + '*' + CStr(Column.useview); 
       Columndefs = Xmodel.columns; ;
    } else if (CBool(Column.reflist)) {
       Cdefs = Change(Column.reflist,am,''); 
       Columndefs = parseJSON('{cdefs:[' + Cdefs + ']}').cdefs; ;
    } else if (!isEmpty(Column.reffile)) {
       if (LCase(Column.reffile)=='jsb_jsondefs') {
          if (await JSB_ODB_READ(Cdefs, await JSB_BF_FHANDLE('jsb_jsondefs'), CStr(Column.refpk), function (_Cdefs) { Cdefs = _Cdefs })) {
             Cdefs = Change(Cdefs,am,''); 
             Columndefs = parseJSON('{cdefs:[' + Cdefs + ']}').cdefs;
          } else {
             ByRef_Errors = JSB_BF_HTML('Unable to find refpk ' + CStr(Column.refpk) + ' in jsb_jsondefs column ' + CStr(Column.name)); 
             return exit(false);
          }
       } else {
          if (await JSB_ODB_OPEN('Dict', CStr(Column.reffile), Fhandle, function (_Fhandle) { Fhandle = _Fhandle })); else {
             ByRef_Errors = JSB_BF_HTML('Unable to find reffile ' + CStr(Column.reffile) + ' for json_inline column ' + CStr(Column.name)); 
             return exit(false);
          }
          Columndefs = await JSB_BF_GETTABLECOLUMNDEFS(Column.reffile, CStr(false), true, function (_P1) {  }); ;
       }
    } else {
       ByRef_Errors = JSB_BF_HTML('Your json_inline for column ' + CStr(Column.name) + ' isn\'t setup correctly.  There is no reflist.'); 
       return exit(false);
    }

    var Tstdataset = clone(Row[Column.name]); 
    if (typeOf(Tstdataset)!='Array') {
       if (isEmpty(Tstdataset)) Tstdataset = '[]';
       if (Left(Tstdataset,1)=='{') Tstdataset = '[' + CStr(Tstdataset) + ']';
       if (Left(Tstdataset,1)!='[') Tstdataset = '[]';
       Tstdataset = parseJSON('{dset:' + CStr(Tstdataset) + '}').dset;
    }
    ByRef_Dataset = Tstdataset; 
    At_Session.Item('MYDATASET', ByRef_Dataset); 

    ByRef_Defaultrow = {}; 

    // set default values in defaultRow and insure json_inline values are an array in the Row
    var DEF_LastI12 = UBound(Columndefs); 
    for (var Def_Idx = LBound(Columndefs); Def_Idx<=DEF_LastI12; Def_Idx++) {
       Def = Extract(Columndefs, Def_Idx, 0, 0); 
       if (CBool(Def.name)) {
          D = Def.defaultvalue; 
          if (Def.control=='json_inline') {
             if (Left(D,1)!='[' || Right(D,1)!=']') {
                if (Left(D,1)=='{' && Right(D,1)=='}') D = '[' + D + ']'; else D = '[]';
             }
             Js = parseJSON('{array:' + D + '}'); 
             D = Js.array; 
             var INLINEROW_LastI17 = UBound(ByRef_Dataset); 
             for (var Inlinerow_Idx = LBound(ByRef_Dataset); Inlinerow_Idx<=INLINEROW_LastI17; Inlinerow_Idx++) {
                Inlinerow = Extract(ByRef_Dataset, Inlinerow_Idx, 0, 0); 
                if (Not(isArray(Inlinerow[Def.name]))) Inlinerow[Def.name] = [undefined, ];
             }
          }
          ByRef_Defaultrow[Def.name] = D;
       }
    } 

    if (Not(Column.canedit)) {
       var SCOLUMN_LastI20 = UBound(Columndefs); 
       for (var Scolumn_Idx = LBound(Columndefs); Scolumn_Idx<=SCOLUMN_LastI20; Scolumn_Idx++) {
          Scolumn = Extract(Columndefs, Scolumn_Idx, 0, 0); 
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
    var me = new jsbRoutine("JSB_CTLS", "_koGridViewNColumns", "JSB_CTLS__KOGRIDVIEWNCOLUMNS_Sub");
}
// </_KOGRIDVIEWNCOLUMNS_Sub>

// <KOGRIDVIEWNCOLUMNS>
async function JSB_CTLS_KOGRIDVIEWNCOLUMNS(Projectname, Modelcolumns, Parentmodel, Id, Removerowtext, Canedit, Viewname) { 
    var me = new jsbRoutine("JSB_CTLS", "_KOGRIDVIEWNCOLUMNS", "JSB_CTLS_KOGRIDVIEWNCOLUMNS");
    var Html = undefined; 
    var Ci = undefined; 
    var Ctlname = ''; 
    var L1 = ''; 
    var Nicecolumnname = ''; 
    var Ctlhtml = ''; 
    var Pickurl = ''; 
    var Pid = ''; 
    var Column = undefined; 
    var Additionalattrs = undefined; 

    Html = [undefined, ]; 
    Html[Html.length] = JSB_BF_HTML('\<tr\>'); 

    var COLUMN_LastI1 = UBound(Modelcolumns); 
    for (Ci = LBound(Modelcolumns); Ci<=COLUMN_LastI1; Ci++) {
       Column = Extract(Modelcolumns, Ci, 0, 0); 
       if (Column.display!='hidden' && !isEmpty(Column.name)) {
          Ctlname = LCase(Column.control); 
          if (!Ctlname) Ctlname = 'textbox';

          if (Ctlname=='json_inline') Ctlname = 'json_popup';

          L1 = Column.label; 
          Nicecolumnname = 'KO_' + CStr(nicename(Column.name)); 

          Ctlname = 'jsb_ctls.ctl_' + Ctlname; 
          Additionalattrs = [undefined, 'style=\'width:auto;' + CStr(Column.ctlstyle) + '\'']; 
          if (Null0(Column.linecnt)>1) Column.linecnt = 1;
          Ctlhtml = ''; 

          await asyncCallByName(Ctlname, me, 0 /*ignore if missing */, Projectname, Nicecolumnname, Column, {}, Ctlhtml, true, Additionalattrs, false, Viewname, function (_Ctlhtml) { Ctlhtml = _Ctlhtml }); 

          if (CBool(Column.pickfunction)) {
             Pickurl = dropIfRight(Column.pickfunction, '.page'); 
             Pickurl = Change(Pickurl,'{projectname}',urlEncode(Projectname)); 
             if (InStr1(1,Pickurl,'//')==0) {
                if (Left(Pickurl,1)=='/') Pickurl = Mid1(Pickurl,2);
                Pickurl = JSB_BF_JSBRESTCALL(Pickurl);
             }
             Ctlhtml = JSB_HTML_ADDPICK(Ctlhtml, Nicecolumnname, 'Pick ' + L1, '80%', '60%', Pickurl, CStr(Column.autopostback));
          }

          Html[Html.length] = JSB_BF_HTML('\<td\>\<mdlctl id=\'ctl_' + Nicecolumnname + '\'\>') + Ctlhtml + JSB_BF_HTML('\</mdlctl\>\</td\>');
       }
    } 

    if (Canedit) {
       if (Not(Removerowtext)) Removerowtext = 'Remove';
       Html[Html.length] = JSB_BF_HTML('\<td class="anchorRemoveGridTD"\>'); 

       if (Parentmodel) {
          Pid = CStr(nicename(Change(Parentmodel,'().','_'))) + Id; 
          Html[Html.length] = JSB_BF_HTML('\<a class="anchorRemoveGridRow" data-bind="click: function() { if (confirm(\'Are you sure you want to ' + Removerowtext + ' this row?\')) koModel.' + Pid + '_delRow($data, $index(), $parent) } "\>' + Removerowtext + '\</a\>');
       } else {
          // Html[-1] = @Html(`<a class="anchorRemoveGridRow" data-bind="click: function() { $root.`:PID:`_delRow">`:removeRowText:`</a>`)
          Html[Html.length] = JSB_BF_HTML('\<a class="anchorRemoveGridRow" data-bind="click: function() { if (confirm(\'Are you sure you want to ' + Removerowtext + ' this row?\')) koModel.' + Id + '_delRow($data, $index()) }"\>' + Removerowtext + '\</a\>');
       }

       Html[Html.length] = JSB_BF_HTML('\</td\>');
    }

    Html[Html.length] = JSB_BF_HTML('\</tr\>'); 

    return Join(Html,''); 
}
// </KOGRIDVIEWNCOLUMNS>

// <_KOLOAD_Sub>
async function JSB_CTLS__KOLOAD_Sub() { 
    var me = new jsbRoutine("JSB_CTLS", "_koload", "JSB_CTLS__KOLOAD_Sub");
}
// </_KOLOAD_Sub>

// <KOLOAD>
async function JSB_CTLS_KOLOAD(Columnname, Defaultvalue, Valuefield, Addifnotinlist, Jsfunctionname, Jsextrafunctionparameters, Dontclosestring) { 
    var me = new jsbRoutine("JSB_CTLS", "_KOLOAD", "JSB_CTLS_KOLOAD");
    var Result = ''; 

    if (Len(Jsextrafunctionparameters)) Jsextrafunctionparameters = ', ' + Jsextrafunctionparameters;
    if (Not(Valuefield)) Valuefield = 'value';
    Result = 'data-bind="'; 
    if (Addifnotinlist) { Result = CStr(Result) + 'addIfNotInList: {}, '; }
    Result = CStr(Result) + 'attr: {id: \'KO_' + CStr(nicename(Columnname)) + '_\' + $index()}, '; 
    // result := `attr: {id: 'KO_`:NiceName(ColumnName):`'}, `
    if (Defaultvalue) {
       Result = CStr(Result) + Valuefield + ': $data[\'' + Columnname + '\'], ' + Valuefield + ': $data[\'' + Columnname + '\']?$data[\'' + Columnname + '\']:\'' + CStr(Defaultvalue) + '\'';
    } else {
       Result = CStr(Result) + Valuefield + ': $data[\'' + Columnname + '\']';
    }
    Result = CStr(Result) + ', valueUpdate:\'blur\''; 
    if (Jsfunctionname) {
       if (InStr1(1,Jsfunctionname,'(')) {
          Result = CStr(Result) + ', css: { ' + CStr(nicename(Columnname)) + '_load: ' + Jsfunctionname + ' }';
       } else {
          Result = CStr(Result) + ', css: { ' + CStr(nicename(Columnname)) + '_load: ' + Jsfunctionname + '($element, $data, $index' + Jsextrafunctionparameters + ') }';
       }
    }
    if (Not(Dontclosestring)) Result = CStr(Result) + '"';
    return Result; 
}
// </KOLOAD>

// <_PUSH_REFEXTRAMETA_Sub>
async function JSB_CTLS__PUSH_REFEXTRAMETA_Sub() { 
    var me = new jsbRoutine("JSB_CTLS", "_push_refextrameta", "JSB_CTLS__PUSH_REFEXTRAMETA_Sub");
}
// </_PUSH_REFEXTRAMETA_Sub>

// <PUSH_REFEXTRAMETA_Sub>
async function JSB_CTLS_PUSH_REFEXTRAMETA_Sub(ByRef_Row, Viewmodel, setByRefValues) { 
    var me = new jsbRoutine("JSB_CTLS", "_PUSH_REFEXTRAMETA", "JSB_CTLS_PUSH_REFEXTRAMETA_Sub");
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Row)
        return v
    }
    Viewmodel.columns.push({"name":'lblRef',"label":'ref',"control":'label',"suppresslabel":true,"fullline":true,"defaultvalue":'The following fields are for your Reference file'});
    Viewmodel.columns.push({"name":'reffile',"index":21,"label":'Ref File',"width":'12em',"control":'comboBox',"autopostback":true,"canedit":true,"reffile":'{listfiles}'});
    Viewmodel.columns.push({"name":'refsql',"label":'Ref SQL',"width":'12em',"control":'textbox',"canedit":true,"notblank":false});
    Viewmodel.columns.push({"name":'refpk',"label":'Ref PK',"width":'12em',"control":'comboBox',"canedit":true,"reffile":'{!reffile}'});
    Viewmodel.columns.push({"name":'refdisplay',"label":'Ref display',"width":'12em',"control":'comboBox',"canedit":true,"reffile":'{!reffile}'});
    Viewmodel.columns.push({"name":'refwhere',"label":'Ref Where',"width":'12em',"control":'textbox',"canedit":true,"notblank":false});
    Viewmodel.columns.push({"name":'reflist',"label":'Ref List',"width":23,"control":'textbox',"canedit":true,"tooltip":'Display,Key;...'});
    Viewmodel.columns.push({"name":'multiValuedData',"newlineprefix":true,"label":'multi-Valued Data',"control":'checkbox',"canedit":true,"defaultvalue":1,"reflist":'false,0;true,1'});
    Viewmodel.columns.push({"name":'addBlank',"label":'Add Blank Value',"control":'checkbox',"canedit":true,"defaultvalue":0,"reflist":'false,0;true,1'});
    Viewmodel.columns.push({"name":'oktocache',"label":'OK 2 Cache',"control":'checkbox',"canedit":true,"defaultvalue":true,"reflist":'false,0;true,1'});
    Viewmodel.columns.push({"name":'savenewvalues',"label":'Save New Values',"control":'checkbox',"canedit":true,"defaultvalue":false,"reflist":'false,0;true,1'});

    Viewmodel.columns.push({"name":'lblRef2',"label":'ref2',"control":'label',"suppresslabel":true,"fullline":true,"defaultvalue":''});
    Viewmodel.columns.push({});
    return exit(); 
}
// </PUSH_REFEXTRAMETA_Sub>

// <_REPEATERFORMBACKGROUND_Pgm>
async function JSB_CTLS__REPEATERFORMBACKGROUND_Pgm() {  // PROGRAM
    var me = new jsbRoutine("JSB_CTLS", "_RepeaterFormBackground", "JSB_CTLS__REPEATERFORMBACKGROUND_Pgm");
    return; 
}
// </_REPEATERFORMBACKGROUND_Pgm>

// <REPEATERFORMBACKGROUND>
async function JSB_CTLS_REPEATERFORMBACKGROUND(Projectname, Id, Objectmodel, Dataarray, Removerowtext, Canedit, Parentmodel, Viewname) { 
    var me = new jsbRoutine("JSB_CTLS", "_REPEATERFORMBACKGROUND", "JSB_CTLS_REPEATERFORMBACKGROUND");
    // local variables
    var Html, Cm;

    var Dropit = undefined; 
    var Lastdivi = undefined; 
    var Ls = ''; 
    var Rs = ''; 
    var Pfx = ''; 
    var Innerhtml = ''; 

    At_Session.Item('MYDATASET', Dataarray); 

    Innerhtml = await JSB_MDL_FORMVIEWNCOLUMNS(Projectname, Objectmodel, Id + '().', {}, Viewname); 

    if (Canedit && Removerowtext) {
       Dropit = InStr1(1,Innerhtml,'\<div class="form-group row"\>')<40; 
       if (Dropit) {
          Lastdivi = Index1(Innerhtml,'\</div\>',Count(Innerhtml,'\</div\>')); 
          Ls = Left(Innerhtml,Lastdivi-1); 
          Rs = Mid1(Innerhtml,Lastdivi);
       } else {
          Ls = Innerhtml; 
          Rs = '';
       }

       Pfx = '\<div class="col-xs-1"\>\<a class="anchorRemoveRow" style="display:table" data-bind="click: function() { if (confirm(\'Are you sure you want to ' + Removerowtext + ' this row?\'))'; 
       Rs = CStr(Rs) + JSB_BF_HTML('\</div\>'); 

       if (Parentmodel) {
          Innerhtml = Ls + JSB_BF_HTML(Pfx + ' $root.' + CStr(nicename(Change(Parentmodel,'().','_'))) + Id + '_delRow($data, $index(), $parent) } "\>' + Removerowtext + '\</a\>') + Rs;
       } else {
          Innerhtml = Ls + JSB_BF_HTML(Pfx + ' koModel.' + Id + '_delRow($data, $index()) }"\>' + Removerowtext + '\</a\>') + Rs;
       }
    }

    Innerhtml = JSB_HTML_DIV(Id + '_ContextDiv', Innerhtml, [undefined, 'class=\'inlineJsonBlock\'']); 
    Html = JSB_HTML_REPEATERHTML(Id, 'div', JSB_BF_HTML('\<div class=\'inlineJson ' + Id + '\'\>'), Innerhtml, JSB_BF_HTML('\</div\>'), Parentmodel); 
    Html = Change(Html,'mdlctl','nstctl'); 

    if (CBool(isAdmin()) && Viewname) {
       Cm = {}; 
       Cm[Viewname] = {"cmd":'viewView',"val":Viewname}; 
       Cm[Viewname] = {"cmd":'editView',"val":Viewname}; 

       Html = CStr(Html) + JSB_HTML_CONTEXTMENU('#' + Id + '_ContextDiv', Cm);
    }

    return Html; 
}
// </REPEATERFORMBACKGROUND>

// <_REPEATERGRIDBACKGROUND_Pgm>
async function JSB_CTLS__REPEATERGRIDBACKGROUND_Pgm() {  // PROGRAM
    var me = new jsbRoutine("JSB_CTLS", "_RepeaterGridBackground", "JSB_CTLS__REPEATERGRIDBACKGROUND_Pgm");
    return; 
}
// </_REPEATERGRIDBACKGROUND_Pgm>

// <REPEATERGRIDBACKGROUND>
async function JSB_CTLS_REPEATERGRIDBACKGROUND(Projectname, Id, Objectmodel, Dataarray, Removerowtext, Canedit, Parentmodel, Viewname) { 
    var me = new jsbRoutine("JSB_CTLS", "_REPEATERGRIDBACKGROUND", "JSB_CTLS_REPEATERGRIDBACKGROUND");
    // local variables
    var Modelcolumns, Ci, Column, Html;

    var Cm = undefined; 
    var Koid = ''; 
    var Outerhtmlprefix = ''; 
    var Innerhtml = ''; 
    var Outerhtmlsuffix = ''; 

    Modelcolumns = await JSB_MDL_DROPGRIDCOLUMNS(Objectmodel.columns, function (_P1) {  }); 

    At_Session.Item('MYDATASET', Dataarray); 

    if (Parentmodel) Koid = nicename(Id); else Koid = 'koModel.' + CStr(nicename(Id));

    Outerhtmlprefix = JSB_BF_HTML('\<table id="' + CStr(nicename(Id)) + '_table" class="repeaterTable" data-bind="visible: ' + Koid + '().length\>0"\>\<thead\>'); 

    var _ForEndI_2 = UBound(Modelcolumns); 
    for (Ci = 1; Ci<=_ForEndI_2; Ci++) {
       Column = Modelcolumns[Ci]; 
       if (isEmpty(Column.control)) Column.control = 'textbox';
       Outerhtmlprefix += JSB_BF_HTML('\<th\>') + CStr(Column.label) + JSB_BF_HTML('\</th\>'); 
    } 

    Outerhtmlprefix += JSB_BF_HTML('\<th\>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\</th\>\</thead\>'); 

    if (Viewname) {
       Innerhtml = await JSB_CTLS_KOGRIDVIEWNCOLUMNS(Projectname, Modelcolumns, Parentmodel, Id, Removerowtext, Canedit, Viewname);
    } else {
       Innerhtml = await JSB_CTLS_KOGRIDVIEWNCOLUMNS(Projectname, Modelcolumns, Parentmodel, Id, Removerowtext, Canedit, CStr(Objectmodel.attachdb) + am + CStr(Objectmodel.tableName));
    }

    Outerhtmlsuffix = JSB_BF_HTML('\</table\>'); 

    Html = JSB_HTML_REPEATERHTML(Id, 'tbody', Outerhtmlprefix, Innerhtml, Outerhtmlsuffix, Parentmodel); 

    if (CBool(isAdmin()) && Viewname) {
       Cm = {}; 
       Cm[Viewname] = {"cmd":'viewView',"val":Viewname}; 
       Cm[Viewname] = {"cmd":'editView',"val":Viewname}; 

       // CM = []
       // CM[-1] = "Display: ":viewname:",viewView,":viewName
       // CM[-1] = "Edit: ":viewname:",editView,":viewName

       Html = CStr(Html) + JSB_HTML_CONTEXTMENU('#' + CStr(nicename(Id)) + '_table', Cm);
    }

    return Html; 
}
// </REPEATERGRIDBACKGROUND>
