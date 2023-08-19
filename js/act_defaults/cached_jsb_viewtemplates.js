{ index: 21, name: 'xCRUD', defaultvalue: 'C.R.U.D', control: 'label', suppresslabel: true, fullline: true, ctlstyle: 'text-align: center; border: none; line-height: 2.5;box-shadow: none; font-style: italic; font-weight: 900;' },
{ name: 'attachdb', index: 22, label: 'Attach DB', width: 19, control: 'combobox', autopostback: true, canedit: true, required: false, addBlank: true, reffile: "SYSTEM", refpk: "ItemID" },
{ name: 'tableName', index: 23, label: 'Table Name', datatype: 'string', width: 90, control: 'dropDownBox', required: false, addBlank: true, autopostback: true, canedit: true, reffile: "{listfiles}", pickfunction: "picktable" },
{ name: 'orderby', index: 24, label: 'order by', datatype: 'string', suppresslabel: false, control: 'textbox', canedit: true, required: false, addBlank: true, defaultvalue: "" },
{ name: 'customSQL', index: 22, label: 'Custom SQL', datatype: 'string', width: 90, control: 'textbox', required: false, autopostback: true, canedit: true, pickfunction: "pickcustomSQL" },

{ name: 'allowinserts', index: 25, label: 'Allow Inserts', width: 12, control: 'checkbox', canedit: true, required: false, notblank: true, defaultvalue: 0, reflist: "false,0;true,1" },
{ name: 'allowupdates', index: 26, label: 'Allow Updates', width: 12, control: 'checkbox', canedit: true, required: false, notblank: true, defaultvalue: 0, reflist: "false,0;true,1" },
{ name: 'allowdeletes', index: 27, label: 'Allow Deletes', width: 12, control: 'checkbox', canedit: true, required: false, notblank: true, defaultvalue: 0, reflist: "false,0;true,1" },

{ name: 'useajax', index: 28, label: 'use AJAX', width: 12, control: 'checkbox', canedit: true, required: false, notblank: true, defaultvalue: 0, reflist: "false,0;true,1" },
{ name: 'usedevx', index: 28, label: 'use devX Grid', width: 12, control: 'checkbox', canedit: true, required: false, notblank: true, defaultvalue: 0, reflist: "false,0;true,1" },

{ index: 30, name: 'xsclick', defaultvalue: 'Grid Single Click', control: 'label', suppresslabel: true, fullline: true, ctlstyle: 'text-align: center; border: none; line-height: 2.5;box-shadow: none; font-style: italic; font-weight: 900;' },
{ name: 'gridOpenTo', index: 31, label: 'Grid Selection To', datatype: 'number', suppresslabel: false, control: 'dropdownbox', canedit: true, required: false, addBlank: true, defaultvalue: "10", reflist: "New Window,1;New Window Tab,2;Tab (name in Transfer Xtra),3;Frame (name in Transfer Xtra),4;Dialog (Title in Transfer Xtra),6;HTTP POST (Transfer Extra becomes formVar Name and contains SelectedID),7;HTTP GET,8;Current Window,10;JavaScript (in Transfer Extra),11;Top Window,12;Back,13;Next Tab,14;Previous Tab,15;Close Window,16;Return Pick Value,17" },
{ name: 'gridOpenUrl', index: 32, label: 'Selection URL', datatype: 'string', suppresslabel: false, control: 'combobox', canedit: true, required: false, addBlank: true, defaultvalue: "", reffile: "dict {projectname}", refpk: "ItemID", refwhere: "ItemID Like '%.page'", pickfunction: 'edp_pick?projectName={projectname}' },
{ name: 'gridOpenExtra', index: 33, label: 'Transfer Xtra', datatype: 'string', suppresslabel: false, control: 'textbox', canedit: true, required: false, addBlank: true, defaultvalue: "" },
{ name: 'passThruParams', index: 34, label: 'pass Url Params', width: 12, control: 'checkbox', canedit: true, required: false, notblank: true, defaultvalue: 0, reflist: "false,0;true,1" },
{ name: 'addFromUrl', index: 35, label: 'add From Url', width: 12, control: 'checkbox', canedit: true, required: false, notblank: true, defaultvalue: 0, reflist: "false,0;true,1" },

{ index: 40, name: 'xdclick', defaultvalue: 'Grid Double Click', control: 'label', suppresslabel: true, fullline: true, ctlstyle: 'text-align: center; border: none; line-height: 2.5;box-shadow: none; font-style: italic; font-weight: 900;' },
{ name: 'gridDblOpenTo', index: 41, label: 'dblClick Selection To', datatype: 'number', suppresslabel: false, control: 'dropdownbox', canedit: true, required: false, addBlank: true, defaultvalue: "", reflist: "New Window,1;New Window Tab,2;Tab (name in Transfer Xtra),3;Frame (name in Transfer Xtra),4;Dialog (Title in Transfer Xtra),6;HTTP POST (Transfer Extra becomes formVar Name and contains SelectedID),7;HTTP GET,8;Current Window,10;JavaScript (in Transfer Extra),11;Top Window,12;Back,13;Next Tab,14;Previous Tab,15;Close Window,16;Return Pick Value,17" },
{ name: 'gridDblOpenUrl', index: 42, label: 'dblClick URL', datatype: 'string', suppresslabel: false, control: 'combobox', canedit: true, required: false, addBlank: true, defaultvalue: "", reffile: "dict {projectname}", refpk: "ItemID", refwhere: "ItemID Like '%.page'", pickfunction: 'edp_pick?projectName={projectname}' },
{ name: 'gridDblOpenExtra', index: 43, label: 'dblClick Xtra', datatype: 'string', suppresslabel: false, control: 'textbox', canedit: true, required: false, addBlank: true, defaultvalue: "" },
{ name: 'passDblThruParams', index: 44, label: 'dblClick pass Url Params', width: 12, control: 'checkbox', canedit: true, required: false, notblank: true, defaultvalue: 0, reflist: "false,0;true,1" },
{ name: 'addDblFromUrl', index: 45, label: 'dblClick add From Url', width: 12, control: 'checkbox', canedit: true, required: false, notblank: true, defaultvalue: 0, reflist: "false,0;true,1" },


{ index: 50, name: 'xuicss', defaultvalue: 'UI CSS', control: 'label', suppresslabel: true, fullline: true, ctlstyle: 'text-align: center; border: none; line-height: 2.5;box-shadow: none; font-style: italic; font-weight: 900;' },

{ name: 'header', index: 51, label: 'Header Text', required: false, datatype: 'string', width: 90, control: 'textbox', canedit: true, defaultvalue: "{viewname}" },

{ name: 'headforecolor', index: 52, label: 'Header Forecolor', width: 30, control: 'colorpicker', required: false, addBlank: true, canedit: true },
{ name: 'headbackcolor', index: 53, label: 'Header Backcolor', width: 30, control: 'colorpicker', required: false, addBlank: true, canedit: true },

{ name: 'forecolor', index: 54, label: 'Forecolor', width: 30, control: 'colorpicker', required: false, addBlank: true, canedit: true },
{ name: 'backcolor', index: 52, label: 'Backcolor', width: 30, control: 'colorpicker', required: false, addBlank: true, canedit: true },

{ name: 'altforecolor', index: 55, label: 'Alt Forecolor', width: 30, control: 'colorpicker', required: false, addBlank: true, canedit: true },
{ name: 'altbackcolor', index: 56, label: 'Alt Backcolor', width: 30, control: 'colorpicker', required: false, addBlank: true, canedit: true },

{ name: 'font', index: 57, label: 'Font', width: 30, control: 'dropdownbox', required: false, addBlank: true, canedit: true, reflist: "Arial,Arial, Helvetica, sans-serif;Arial Black, 'Arial Black', Gadget, sans-serif;Comic Sans MS, 'Comic Sans MS', Textile, cursive;Courier New, 'Courier New', Courier, monospace;Georgia, Georgia, 'Times New Roman', Times, serif;Impact, Impact, Charcoal, sans-serif;Lucida Console, 'Lucida Console', Monaco, monospace;Lucida Sans Unicode, 'Lucida Sans Unicode', 'Lucida Grande', sans-serif;Palatino Linotype, 'Palatino Linotype', 'Book Antiqua', Palatino, serif;Tahoma, Tahoma, Geneva, sans-serif;Times New Roman, 'Times New Roman', Times, serif;Trebuchet MS, 'Trebuchet MS', Helvetica, sans-serif;Verdana, Verdana, Geneva, sans-serif;MS Sans Serif, 'MS Sans Serif', Geneva, sans-serif;MS Serif, 'MS Serif', 'New York', serif;" },
{ name: 'fontsize', index: 58, label: 'Font size', width: 30, control: 'dropdownbox', required: false, addBlank: true, canedit: true, reflist: "xx-small;x-small;small;medium;large;x-large;xx-large;smaller;larger;initial;inherit" },
{ name: 'boxed', index: 59, label: 'Boxed', width: 30, control: 'dropdownbox', required: false, addBlank: true, canedit: true, reflist: "none;solid;double;groove;ridge;inset;outset" },

{ index: 70, name: 'xio', defaultvalue: 'Input / Output Parameters', control: 'label', suppresslabel: true, fullline: true, ctlstyle: 'text-align: center; border: none; line-height: 2.5;box-shadow: none; font-style: italic; font-weight: 900;' },

{ name: 'inputs', index: 74, fullline: true, label: 'Input Params', datatype: 'jsonarray', width: 90, control: 'json_inline', canedit: true, addrowtxt: 'add input selection', rmvrowtxt: 'remove', form: 'grid', reffile: "jsb_jsondefs", refpk: "viewInputs" },
{ name: 'outputs', index: 75, fullline: true, label: 'Output Params', datatype: 'jsonarray', width: 90, control: 'json_inline', canedit: true, addrowtxt: 'add output parameter', rmvrowtxt: 'remove', form: 'grid', reffile: "jsb_jsondefs", refpk: "viewOutputs" },
{ name: 'dynamicinputs', index: 77, fullline: true, label: 'Auto Ajax Filters', datatype: 'jsonarray', width: 90, control: 'json_inline', canedit: true, addrowtxt: 'add AJax Filter', rmvrowtxt: 'remove', form: 'grid', reffile: "jsb_jsondefs", refpk: "viewInputs" },

{ name: 'custombtns', fullline: true, index: 80, label: 'Custom Btns', datatype: 'jsonarray', width: 90, control: 'json_inline', canedit: true, addrowtxt: 'add custom button', rmvrowtxt: 'remove', form: 'grid', reffile: "jsb_jsondefs", refpk: "customBtns" },
{ name: 'btnsonbot', index: 81, label: 'Btns on Bottom', width: 12, control: 'checkbox', canedit: true, defaultvalue: true, reflist: "false,0;true,1" }

**************************************************************************************************************************
************************************************** <%=viewName %> Grid View *********************************************
**************************************************************************************************************************
<%
   ** Function genCodeStub(ProjectName, pageName, pageModel, viewName, viewModel, TemplateFileName)
    ** We return the array GEN[]
        **
        niceViewName = @NiceName(@DropIfRight(viewName, ".view", true))
nicEditID = "ne_": niceViewName
mayCRUD = viewModel.allowNewRecord Or viewModel.allowupdates Or viewModel.allowdeletes Or viewModel.newRecord
doKOBinding = false

if viewModel.tableName = "" Then
@Alert("You don't have a Table Name defined in your view : " : viewName, True)
Return 0
End If

hasDefaultValues = False
latColumnName = ""
lngColumnName = ""
if viewModel.attachdb then
attachdb viewModel.attachdb else Stop @Errors
End If

for Each Column In viewModel.columns
if Column.defaultvalue Then hasDefaultValues = True
if Column.isLatitude Then latColumnName = Column.name
if Column.isLongitude Then lngColumnName = Column.name
next

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Verify viewModel for grid selections [ * needs a URL: (>1 And <= 10) Or 12], or no need: >= 13 or  = 11
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//  * 1 open in a new window with ?xxx={id} (if containerName given then it is Url Extra)
//  * 2 open in a new window tab with ?containerName=idvalue (if containerName given then it is Url Extra)
//  * 3 open in a new jQuery Tab. Tab is is 4th parameter containerName
//  * 4 open in an new or existing IFRAME whose id is containerName
//  * 5 open in a DIV whose id is containerName
//  * 6 open in a jQuery Model DIalog (Title of dialog is containerName)
//  * 7 postback : 
//               Makes a FormVar('postBackUrl') which is parentDataRow
//               Makes a FormVar('postBackTitle') which is eventName
//               Makes a FormVar(containerName) which is SelectedID
//               - create this with print @genEventHandler(eventName /* put into @FormVar('postBackTitle') */, Url /*unused*/, 7, 'containerName' /* FormVar(containerName) gets SelectedID */ ):
//  * 8 httpget from Url with {id} (if containerName given then it is Url Extra)
//  * 9 (Unused)
//  * 10 open in current window (if containerName given then it is Url Extra)
//    11 pure javascript in containerName
//  * 12 open in top window (if containerName given then it is Url Extra)
//    13 Back Page: due window history back (uses fromPage if it exists)
//    14 Next Tab
//    15 Previous Tab
//    16 Close Window
//    17 Return a PICK value
//    18 Force jqGrid to reload (containerName is jqGridID) - does $('#':jqGridID).trigger( 'reloadGrid' );

gridOpenUrl = Trim(@DropIfRight(viewModel.gridOpenUrl, '.page'))
if gridOpenUrl Then
If InStr(gridOpenUrl, "//") = 0 And Left(gridOpenUrl, 1) = "/" Then gridOpenUrl = Mid(gridOpenUrl, 2)
op = @jsb_mdl.UrlOutputParams(viewModel.outputs)
if instr(gridOpenUrl, "?") then op = replace(op, "?", "&")
gridOpenUrl:= op

If viewModel.gridOpenTo = 11  Or viewModel.gridOpenTo >= 13 Then // No need for URL
If MsgBox("Your grid (": niceViewName: ") has a Non-URL 'Grid Selection To' action (": eventHandlerType(viewModel.gridOpenTo): ") and a URL defined (": gridOpenUrl: ").  Remove the URL?", "Yes,*No") = "Yes" Then
remove viewModel, "gridOpenUrl"
ReadJSON testExistance from fhandle('dict', ProjectName), viewName Then WriteJSON viewModel On fhandle('dict', ProjectName), viewName
End If
End If

ElseIf(viewModel.gridOpenTo >= 1 And viewModel.gridOpenTo < 10) Or viewModel.gridOpenTo = 12 Then // Need a URL
If MsgBox("Your grid (": niceViewName: ") has a 'Grid Selection To' action (": eventHandlerType(viewModel.gridOpenTo): "), but no URL defined.  Remove the click action?", "Yes,*No") = "Yes" Then
remove viewModel, "gridOpenTo"
ReadJSON testExistance from fhandle('dict', ProjectName), viewName Then WriteJSON viewModel On fhandle('dict', ProjectName), viewName Else MsgBox("Could not find model"); Debug
End If
End If

gridDblOpenUrl = Trim(@DropIfRight(viewModel.gridDblOpenUrl, '.page'))
if gridDblOpenUrl then
If InStr(gridDblOpenUrl, "//") = 0 And Left(gridDblOpenUrl, 1) = "/" Then gridDblOpenUrl = Mid(gridDblOpenUrl, 2)
op = @jsb_mdl.UrlOutputParams(viewModel.outputs)
if instr(gridDblOpenUrl, "?") then op = replace(op, "?", "&")
gridDblOpenUrl:= op

if viewModel.gridDblOpenTo = 11 Or viewModel.gridDblOpenTo >= 13 Then // No need for URL
If MsgBox("Your grid (": niceViewName: ") has a Non-URL 'dblClick Selection To' action (": eventHandlerType(viewModel.gridDblOpenTo): ") and a URL defined (": gridDblOpenUrl: ").  Remove the URL?", "Yes,*No") = "Yes" Then
remove viewModel, "gridDblOpenUrl"
ReadJSON testExistance from fhandle('dict', ProjectName), viewName Then WriteJSON viewModel On fhandle('dict', ProjectName), viewName Else MsgBox("Could not find model"); Debug
End If
End If

ElseIf(viewModel.gridDblOpenTo >= 1 And viewModel.gridDblOpenTo < 10) Or viewModel.gridDblOpenTo = 12 Then // Need a URL
If MsgBox("Your grid (": niceViewName: ") has a 'dblClick Selection To' action (": eventHandlerType(viewModel.gridDblOpenTo): "), but no URL defined.  Remove the dblClick action?", "Yes,*No") = "Yes" Then
remove viewModel, "gridDblOpenTo"
ReadJSON testExistance from fhandle('dict', ProjectName), viewName Then WriteJSON viewModel On fhandle('dict', ProjectName), viewName Else MsgBox("Could not find model"); Debug
End If
End If

// C)ontainerName parameter (Required by 3,4,5,6,7,11 & 18, Optional for 1,2,8,10, & 12)
if !viewModel.gridOpenExtra Then
If(viewModel.gridOpenTo >= 3 And viewModel.gridOpenTo < 7) Or(viewModel.gridOpenTo = 11 Or viewModel.gridOpenTo = 18) Then
MsgBox("You must specify more information in the 'Transfer Xtra' metadata field for action (": eventHandlerType(viewModel.gridOpenTo): "; view: ": viewName)
ElseIf viewModel.gridOpenTo = 7 Then
MsgBox("You must specify a your javascript in the 'Transfer Xtra' metadata field for action (": eventHandlerType(viewModel.gridOpenTo): "; view: ": viewName)
End If
End If

if !viewModel.gridDblOpenExtra Then
If(viewModel.gridDblOpenTo >= 3 And viewModel.gridDblOpenTo < 7) Or(viewModel.gridDblOpenTo = 11 Or viewModel.gridDblOpenTo = 18) Then
MsgBox("You must specify more information in the 'dblClick Xtra' metadata field for action (": eventHandlerType(viewModel.gridDblOpenTo): "; view: ": viewName)
ElseIf viewModel.gridDblOpenTo = 7 Then
MsgBox("You must specify a your javascript in the 'dblClick Xtra' metadata field for action (": eventHandlerType(viewModel.gridDblOpenTo): "; view: ": viewName)
End If
End If

hasSpecialOutputs = False
for each Column in viewModel.outputs
        If Column.scope = "SessionVar" Or Column.scope = "ApplicationVar" Or Column.scope = "ProfileVar" Then
hasSpecialOutputs = True
break
End If
next
    %>
*
* To be compatable with the modeler and other views, we must implement these 4 routines:
*
* Subroutine view_ <%=niceViewName %> _Setup(ByRef viewVars As JSON) // viewVars = { fromParentPage: '', parentMultiView: '', lastView: true }
    * Subroutine view_ <%=niceViewName %> _Unload(ByRef viewVars As JSON)
        * Subroutine view_ <%=niceViewName %> _checkCommands(viewVars, inCmd, ColumnID)
            * function display_<%=niceViewName%> (ByRef viewVars As JSON) As String
                *
                Subroutine view_ <%=niceViewName %> _Setup(ByRef viewVars As JSON)
                    <% if viewModel.attachdb then %>
                        AttachDB "<%=viewModel.attachdb%>" else Stop @Errors
    <% end if %>
    
    <%if viewModel.usedevx then %>
        if !viewVars.userSettings Then viewVars.userSettings = {}
Dim userSettings As JSON = viewVars.userSettings
if !userSettings.devXGridLayout Then
Dim devXGridLayout As String = ""
Read devXGridLayout From fHandle('tmp'), @UserName: "_<%=pageName%>_<%=viewName%>_layout" Else userSettings.devXGridLayout = ""
userSettings.devXGridLayout = devXGridLayout
End If
if !userSettings.devXGridFilter Then
Dim devXGridFilter As String = ""
Read devXGridFilter From fHandle('tmp'), @UserName: "_<%=pageName%>_<%=viewName%>_filter" Else devXGridFilter = ""
userSettings.devXGridFilter = devXGridFilter
End If
    <% End if%>
    <%if latColumnName And lngColumnName Then %>
    userSettings.showKMLExport = True
userSettings.latColumnName = "<%=latColumnName%>"
userSettings.lngColumnName = "<%=lngColumnName%>"
    <% end if%>

        End Subroutine

Subroutine view_ <%=niceViewName %> _Unload(ByRef viewVars As JSON)
    <%if viewModel.usedevx then %>
        Dim Cmd As String = @formVar('Btn'): @formVar('BtnReset')
Dim userSettings As Json = viewVars.userSettings

// Record current settings
devXGrid = System(29).getControl("devXGrid")
userSettings.devXGridLayout = devXGrid.SaveClientLayout()
userSettings.devXGridFilter = devXGrid.FilterExpression

// Record current user display settings for devXgrid
viewVars.lastCmd = Cmd

Write userSettings.devXGridLayout On fHandle('tmp'), @UserName: "_<%=pageName%>_<%=viewName%>_layout" Else Null
Write userSettings.devXGridFilter On fHandle('tmp'), @UserName: "_<%=pageName%>_<%=viewName%>_filter" Else Null
    <% Else %>
        <% if hasSpecialOutputs Then %>
    Dim postBackCmd As As String = @formvar("postBackTitle")
if postBackCmd then
Dim postBackRow As JSON = JSON(@formvar("postBackUrl"))
              <%
                    // If we have any parameters for Session, Application or Profile, save them
                    for each Column in viewModel.outputs
                        If Column.name = "" Then Column.name = Column.field
Select Case Column.scope 
                           case "SessionVar"
    %> @Session["<%=Column.name%>"] = postBackRow["<%=Column.field%>"]
        <%
                              
                           case "ApplicationVar"
    %> @Application["<%=Column.name%>"] = postBackRow["<%=Column.field%>"]
        <%
                              
                           case "ProfileVar"
    %> @profilevar("<%=Column.name%>", postBackRow["<%=Column.field%>"])
                              <%
    end select
next
    %>
    End If
        <% End If %>

            viewVars.GridOperations = @formvar("<%=niceViewName%>_ops")
    <% End If %>
    End Subroutine

function view_<%=niceViewName%> _isDirty(ByRef viewVars As JSON) As Boolean
Return False
end function

<% $include _checkCommands %>


<%if viewModel.usedevx then %>
    Function gridFetch_ <%=niceViewName %> (ByVal formVars As JSON, ByRef rtnErrors As String) As SelectList
        <% Else %>
        Function gridFetch_ <%=niceViewName %> (ByVal formVars As JSON, ByRef rtnErrors As String) As Array
            <% End If %>
                Dim selectHandle As SelectList, SqlFilter As String = "", SqlColumns As String = ""
                    <% if viewModel.attachdb Then %>
                        AttachDB "<%=viewModel.attachdb%>" else rtnErrors = @Errors; Return Null
                            <% End If %>
    <%= @jsb_mdl.buildSqlSelect(viewModel, true) %>

    If rtnErrors Then Return Null

        <% if viewModel.customSQL Then
I = InStrI(viewModel.customSQL, " from ": viewModel.tableName)
if I then
Dim Columns As String = RTrim(LTrim(Left(viewModel.customSQL, I - 1)))
SqlFilter = mid(viewModel.customSQL, I + Len(" from ": viewModel.tableName))
if lcase(fieldLeft(Columns, ' ')) = 'select' then Columns = LTrim(DropLeft(Columns, ' '))
if Columns And Columns <> "*" Then %>
    SqlColumns = "<%=Replace(Columns, '"', '\\"')%>"
        <% End If
if SqlFilter Then
    %>
    SqlFilter := "<%=Replace(SqlFilter, '"', '\\"')%>"
        <%
        End If
            %>
            Dim fTable As FileHandle
if !@jsb_bf.OpenTable("<%=viewModel.tableName%>", "<%=viewName%>", fTable, rtnErrors) Then Return Null
Select SqlColumns From fTable to selectHandle Where SqlFilter Then
    <% Else %>
    SqlSelect "<%=Replace(viewModel.customSQL, '"', '\\"')%>": Iff(SqlFilter, " Where ": SqlFilter, "") To selectHandle Then
        <% End If %>
    <% Else %>
        if !SqlColumns Then SqlColumns = "*"
Dim fTable As FileHandle
if !@jsb_bf.OpenTable("<%=viewModel.tableName%>", "<%=viewName%>", fTable, rtnErrors) Then Return Null
Select SqlColumns From fTable to selectHandle Where SqlFilter Then
    <% End If %>
    <%if viewModel.usedevx then %>
    Return selectHandle  // Return SelectHandle as datasourc for devX components
        <%else%>
            Dim dataSet As Array = GetList(selectHandle)
Return dataSet
    <% End If %>
        End If

rtnErrors = "Grid-": System(28): ": ": @Errors: crlf(): "Sql Filter: ": SqlFilter
LogErr(rtnErrors)
Return Null
end function

    Function display_ <%=niceViewName %> (ByRef viewVars As JSON) As String
        <%if viewModel.usedevx then %>
    * $options external page
    * $options external <%=niceViewName %>
<% End If %>
    Dim viewModel As JSON
Dim Html As String = "", cname as string

    * Get our column definitions from the Model Designer(from table Views and!items in Dict of <%=viewModel.tableName %>)
ReadJSON viewModel From @fHandle("DICT", "<%=ProjectName%>"), "<%=viewName%>" Else viewModel = @jsb_mdl.createNewView("<%=viewName%>")
   
    <%if viewModel.useajax and!viewModel.usedevx then %>
    Dim urlSource As String, UrlParams As String
        <%= @jsb_mdl.UrlPassThrough(viewModel); // This will setup UrlParams %>
urlSource = "gridFetch_<%=niceViewName%>": UrlParams
    <% Else %>
    Dim rtnErrors As String = ""
        <%if viewModel.usedevx then %>
            Dim DataSource As SelectList = gridFetch_ <%=niceViewName %> (@FormVars, rtnErrors)
        <% Else %>
    Dim DataSource As Array = gridFetch_ <%=niceViewName %> (@FormVars, rtnErrors)
        <% End If %>
    If rtnErrors Then
Return rtnErrors: crlf(): @Button('backErr', "Back", { onclick: "window.history.go(-2);" })
End If
    <% End If %>
    
    <%if viewModel.usedevx then %>
    Dim userSettings As JSON = viewVars.userSettings
userSettings.showExportBtns = True

preScripts = []
postScripts = []

moreBtns = []
moreBtns[-1] = { name: 'BtnReset', text: 'Reset Layout' }
moreBtns[-1] = { name: 'Btn', text: 'Fit to Data' }
moreBtns[-1] = { name: 'Btn', text: 'Fit to Screen' }
js = 'if (devXGrid.IsCustomizationWindowVisible()) devXGrid.ShowCustomizationWindow($("#BtnShowDragDrop")[0]); else devXGrid.ShowCustomizationWindow()'
moreBtns[-1] = { name: 'BtnShowDragDrop', text: 'Show Drag & Drop Window', onclick: js }
userSettings.additionalButtons = moreBtns

// =============   ============= Create the devXGrid  =============   ============= 
Dim olderVersion = False
if system(1) = "aspx" then if Page Then olderVersion = True
if olderVersion Then
// Visual Studio version of ASPX page
Html = setup_devXGrid(<%=niceViewName %>, DataSource, userSettings)
Else
Html = @jsb_html.devXGrid("devXGrid", DataSource, userSettings)
End If

devXGrid = System(29).getControl("devXGrid")
devXGrid.ClientSideEvents.ColumnGrouping = "devXGrid_LayoutChanged"
devXGrid.ClientSideEvents.ColumnMoving = "devXGrid_LayoutChanged"
devXGrid.ClientSideEvents.ColumnResized = "devXGrid_LayoutChanged"
devXGrid.ClientSideEvents.ColumnSorting = "devXGrid_LayoutChanged"
preScripts[-1] = "function devXGrid_LayoutChanged(s, e) { $('#BtnReset').prop('disabled', false) }"
preScripts[-1] = "function devXGrid_onInit(s, e) { $('#BtnReset').prop('disabled', true) }"

if Trim(userSettings.devXGridLayout) = "" Then
// Set Reset enabled on load
devXGrid.ClientSideEvents.Init = "devXGrid_onInit"
Else
devXGrid.ClientSideEvents.Init = Nothing
End If

If viewVars.lastCmd = "Export to CSV" Then
e64 = Encode(DataSource.GetCSV(), 64)
print @script(" const b64Data = '": E64: "'; saveBlob(b64toBlob(b64Data, 'text/plain'), '<%=pageName%>_<%=niceViewName%>.csv'); doJsbSubmit(); "):
E64 = ""
@Server.Pause
        
        <%if latColumnName And lngColumnName Then %>

    Else If viewVars.lastCmd = "Export KML" Then

rowCount = devXGrid.VisibleRowCount
doIt = True
If rowCount > 10000 Then
doIt = Msgbox("You have ": rowCount: " records, proceed with export?", "Yes,No") = "Yes"
End If

If doIt Then
Kml = ['<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document>']

// Make each group into a KML folder
dim grdColumns = devXGrid.Columns
grdColumnCnt = UBound(grdColumns)

groupColumns = []
for i = 0 to grdColumnCnt - 1
                    grdColumn = grdColumns(i)
GroupIndex = grdColumn.GroupIndex
if GroupIndex <> -1 Then
groupColumns[GroupIndex + 1] = grdColumn.FieldName
end if
                next
                grpColumnCnt = UBound(groupColumns)
groupValues = []
nestedInFolder = false

For RowNo = 0 To rowCount - 1
Row = devXGrid.GetDataRow(RowNo)

if grpColumnCnt Then
startANewGroup = RowNo = 0
for i = 1 to grpColumnCnt
                            grpCName = groupColumns[i]
pVal = groupValues[i]
cVal = Row[grpCName]
if pVal <> cVal Then
startANewGroup = True
break
end if
                        next
                        
                        if startANewGroup then
if nestedInFolder Then Kml[-1] = "</Folder>"

for i = 1 to grpColumnCnt
                                grpCName = groupColumns[i]
cVal = Row[grpCName]
groupValues[i] = cVal
next

Kml[-1] = "<Folder>"
Kml[-1] = "<name>": @HtmlEncode(Join(groupValues, " ")): "</name>"
nestedInFolder = true
end if
                    end if
                       
                    Point = '<Point><coordinates>': Row("<%=lngColumnName%>"): ',': Row("<%=latColumnName%>"): '</coordinates></Point>'
desc = []

    <% 
                        if viewModel.outputs Then
oColumns = []
for each OColumn As JSON in viewModel.outputs; // viewModel.columns
oColumns[-1] = OColumn.field
next
Else
oColumns = []
for each OColumn As JSON in viewModel.columns
oColumns[-1] = OColumn.name
next
End If

for each Column As JSON in viewModel.columns
cName = Column.name
locate cName in oColumns Setting Spot then
Select Case column.datatype
Case "guid", "blob", "password", "jsonarray", "jpg", "png":
// Don't output these

Case "url":
                                        %> desc[-1] = @HtmlEncode("<%=cname%>: "): '<a href="': Lnk: '">': Row("<%=cname%>"): '</a>'
    <%

    Case Else
        %> desc[-1] = @HtmlEncode("<%=cname%>: ": Row("<%=cname%>")) 
                                        <%
    End Select
End If
next
    %>
    KML[-1] = "<Placemark><description>": Join(Desc, "<br />"): "</description>": Point: "</Placemark>"
Next

if nestedInFolder Then Kml[-1] = "</Folder>"
KML[-1] = "</Document></kml>"

Print @Script('saveFile("<%=niceViewName%>.kml", "application/vnd.google-earth.kmz", ': jsEscapeString(Join(KML, "\n")): ')')
End If
    <% end if%>

        Else If viewVars.lastCmd = "Fit to Data" Or viewVars.lastCmd = "Reset Layout" Or viewVars.lastCmd = "Fit to Screen" Then
dxColumns = devXGrid.DataColumns

dt = DataSource.RowHandle.Table
dtColumns = dt.Columns
dtRows = dt.Rows

dtColCnt = dtColumns.Count
dtRowCount = dtRows.Count

ShowExportBtns = True
If dtRowCount > 300 Then searchRowCnt = 300 Else searchRowCnt = dtRowCount

devXGrid.LoadClientLayout(" ")
clearCookies = true

If viewVars.lastCmd = "Fit to Data" Then
ColWidths = []

// Get length of header columns
for ColNo = 1 to dxColumns.Count 
                    DC = dxColumns[ColNo - 1]
Caption = DC.Caption
if !Caption Then Caption = DC.Name
if !Caption Then Caption = dtColumns(ColNo - 1).Caption
CW = Len(Caption) + 2
if CW > 60 Then CW = 60
ColWidths[ColNo] = CW
Next

//  Find largest data cell
For RowNo = 0 To searchRowCnt - 1
Row = dtRows(RowNo)
For ColNo = 1 To dtColCnt
V = RTrim(Row(ColNo - 1))
LenOfV = Len(V)
if LenOfV > ColWidths[ColNo] then ColWidths[ColNo] = LenOfV
Next
Next

// Update Grid
for ColNo = 1 to dxColumns.Count 
                    DC = dxColumns[ColNo - 1]
CP = ColWidths[ColNo]
DC.Width = CP * 11
Next

End If

if viewVars.lastCmd = "Fit to Screen" Then
visibleColumnCnt = 0
for ColNo = 1 to dxColumns.Count 
                    DC = dxColumns[ColNo - 1]
IF DC.Visible Then visibleColumnCnt += 1
Next

If!visibleColumnCnt Then visibleColumnCnt = 1
CP = CInt(1000 / visibleColumnCnt) / 10
CP = CreateObject("Unit(Percentage, ": CP: ")")

// Update Grid
for ColNo = 1 to dxColumns.Count 
                    DC = dxColumns[ColNo - 1]
DC.Width = CP
Next

devXGrid.Width = CreateObject("Unit(Percentage, 100)")
End If

if viewVars.lastCmd = "Reset Layout" Then
devXGrid.FilterExpression = ""
userSettings.devXGridLayout = ""
Else
// Record new settings
userSettings.devXGridLayout = devXGrid.SaveClientLayout()
userSettings.devXFilter = devXGrid.FilterExpression
End If

Write userSettings.devXGridLayout On fHandle('tmp'), @UserName: "_<%=pageName%>_<%=viewName%>_layout" Else Null
Write userSettings.devXGridFilter On fHandle('tmp'), @UserName: "_<%=pageName%>_<%=viewName%>_filter" Else Null
End If

if clearCookies Then
postScripts[-1] = "ASPxClientUtils.DeleteCookie('ASPxGridViewCookies')"
clearCookies = false
end if

        // Create an easy javaScript Handle called myGrid for debugging
        postScripts[-1] = "myGrid = ASPx.GetControlCollection().Get('devXGrid')"

        if UBound(preScripts) Then preScripts = @Script(Join(preScripts, crlf()))
if UBound(postScripts) Then postScripts = @Script(Join(postScripts, crlf()))

Html = preScripts: Html: postScripts

    <%else%>
        Dim gridOptions As JSON = {
            HeadForeColor: "<%=viewModel.headforecolor%>", HeadBackColor: "<%=viewModel.headbackcolor%>",
            RowForeColor: "<%=viewModel.forecolor%>", RowBackColor: "<%=viewModel.backcolor%>",
            AltForeColor: "<%=viewModel.altforecolor%>", AltBackColor: "<%=viewModel.altbackcolor%>",
            allowInserts: <%=viewModel.allowinserts + 0 %>, allowUpdates: <%=viewModel.allowupdates + 0 %>, allowDeletes: <%=viewModel.allowdeletes + 0 %>,
            WidthMultiplier: 12,
            width100percent: UBound(viewModel.columns) < 6
            /*  noFilterBar: false, addRowNumbers: false, doPaging: UBound(viewModel.columns) >300, caption: "", addRowNumbers: false, sortname: "colname,colname", sortorder: "desc,asc", sortablerows: false */
        }

Html = @jsb_html.jqGrid("<%=niceViewName%>", DataSource, viewModel.columns, gridOptions)
       
    <% End If %>
    
    
   <% if viewModel.gridOpenTo And gridOpenUrl Then %>
    Dim SelectUrl As String = "<%=gridOpenUrl%>"
        <% if viewModel.passThruParams Then %>
         if InStr(SelectUrl, "?") Then UrlC = "&" Else UrlC = "?"
SelectUrl = SelectUrl: Replace(Replace(UrlC:@QueryString, "newRecord=1", ""), "&&", "&");* Don't pass thru newRecord
    <% End If %>               
      <% // If we have any parameters other than URL, then we must post back here to save them %>
      <% If @jsb_mdl.hasServerSideParams(viewModel) Then %>
    // Generate the javascript code which will handle the row selected event and postback to the server
    Html := @genEventHandler("rowSelected", Null, 7 /* PostBack */, "selectedID");* selectedID = FormVar("selectedID") and postBackRow = JSON(@formvar("postBackUrl"))
      <% Else %>
    // Generate the javascript code which will handle the row selected event and redirect the browser
    Html := @genEventHandler("rowSelected", SelectUrl, <%=viewModel.gridOpenTo + 0 %> /* <%=eventHandlerType(viewModel.gridOpenTo+0) %> */, "<%=viewModel.gridOpenExtra%>", <%=viewModel.addFromUrl + 0 %>, <%=viewModel.passThruParams + 0 %>) 
      <% End If %>
   <% Else %>
      <%
    // If we have outputs that are memoryVars, we need to create the memoryVar
    Dim firstMemoryVar As Boolean = True
Dim jScript As Array = []
jScript[-1] = 'if (window._isDirty) if (!confirm("Abandoned your changes?")) return false;'
for each Column As JSON in viewModel.outputs
if Column.scope = "memoryVar" Then
cname = Column.name
if !cname then cname = Column.field
if firstMemoryVar Then firstMemoryVar = False
jScript[-1] = 'storeVal("memoryVar_': niceName(cname): '", parentDataRow["': Column.field: '"])'
jScript[-1] = '$("#memoryVar_': niceName(cname): '").trigger("change")'
    %>
    Dim currentVal As Object = @formVar('memoryVar_<%=niceName(cname)%>');
if (currentVal) Then Html:= @HIDDEN('memoryVar_<%=niceName(cname)%>', CStr(currentVal));
                <%
    End If
next
If!FirstMemoryVar Then
jScript = Replace(Join(jScript, ";"), "'", "\\'")
    %>
    // Generate the javascript code to handle the row selected event, and update the memory variables
    Html := @genEventHandler("rowSelected", "", 11 /* pure javacript */, '<%=jScript%>')
            <%
    End If
        %>
   <% End If %>

   <% If viewModel.gridDblOpenTo And gridDblOpenUrl Then %>
    Dim dblSelectUrl As String = "<%=gridDblOpenUrl%>"
        <% if viewModel.passDblThruParams Then %>
         if InStr(dblSelectUrl, "?") Then UrlC = "&" Else UrlC = "?"
dblSelectUrl = dblSelectUrl: UrlC: @QueryString
      <% End If %>               
      <%
    If @jsb_mdl.hasServerSideParams(viewModel) Then
        %>
        Html := @genEventHandler("dblClickRow", "postBackDblClick", 7, "selectedID");* will have hidden variables url and selectedID
            <% Else %>
            Html := @genEventHandler("dblClickRow", dblSelectUrl, <%=viewModel.gridDblOpenTo + 0 %> /* <%=eventHandlerType(viewModel.gridDblOpenTo+0)%> */, "<%=viewModel.gridDblOpenExtra%>", <%=viewModel.addDblFromUrl + 0 %>, <%=viewModel.passDblThruParams + 0 %>) 
      <% End If %>  
   <% End If %>

    Html = display_ <%=niceViewName %> _extras(viewVars, Html)
Return Html
End Function

    <% $include _display_extras %>

<%if viewModel.useajax and!viewModel.usedevx then %>
    *
    * This is the <%=niceViewName %> AJAX callback function for the GRID(jsGrid)
    *
    Restful Function gridFetch_ <%=niceViewName %> (ByVal formVars As JSON, _search, nd, rows As Integer, page As Integer, sidx As Integer, sord As String, searchField As String, searchOper As String, searchString As String) As JSON
Dim rtnErrors As String = ""
if !gridFetch_ <%= niceViewName %> (formVars, rtnErrors) Else
Rec = {}
    <% For Each Column In viewModel.columns
If Column.name And Column.display <> "hidden" Then
    %> Rec["<%=Column.name%>"] = rtnErrors
        <%
        End If
Next
    %>

    Return { page: 1, total: 1, records: 1, rows: [Rec] }
End If
    *
    Dim PageSize As Integer = rows
If PageSize < 1 Then PageSize = 1

If sidx Then dataSet = @SortJsonArray(dataSet, Field(sidx, "+", 1), sord = "asc")
RowCount = Len(dataSet)
Dim TotalPages As Integer = CInt((RowCount / PageSize) + .99999)
If Page > TotalPages Then Page = TotalPages
If Page < 1 Then Page = 1
StartRow = PageSize * (Page - 1);* Page is 1..N
Dim returnRows As Array = []
For I = 1 To PageSize
If StartRow + I > RowCount Then Exit For
returnRows[I] = dataSet[StartRow + I]
Next

Dim R As JSON = {}
R.page = Page
R.total = TotalPages;* pages
R.records = RowCount
R.rows = returnRows

Return R
End Function
    <% End If %>

        function view_<%=niceViewName%> _gridUpdateRows(ByVal sOps As String, rtnErrors As String) As Boolean
if !sOps then Return True
Dim fTable As Table, CName As String
Dim ops As Array = JSon(sops)

Dim PKName As String = "<%=@jsb_mdl.pkColumnID(viewModel, ProjectName, viewName)%>"
if !@jsb_bf.OpenTable("<%=viewModel.tableName%>", "<%=viewName%>", fTable, rtnErrors) Then Return False

For Each Cmd As JSON in Ops
If Cmd.op = "delete" Then
If Left(Cmd.id, 1) <> "-" Then
If @view_<%=niceViewName %> _deleteRow(Cmd.row[PKName], rtnErrors) Else Return False
End If
Else;* Update or New
Dim Row As JSON = Cmd.updatedrow
Dim OldPKID As String = Cmd.originalrow[PKName]

    <%
                // Validate Required Columns for new and update
                for each Column As JSON in viewModel.columns
if Column.required And Column.display <> "hidden" And Column.display <> "gridhidden" And(Column.canedit || Column.editable) Then
cname = Column.name
if !cname then cname = Column.field;* field is required
    %>
                        if Row["<%=CName%>"] = "" Then
rtnErrors = "Column '<%=CName%>' is required for new rows."
Return False
End If
    <%
    End If
next
    %>

    Dim PKID As String = Row[PKName]
If Cmd.op = "new" Then
If @view_<%=niceViewName %> _writeRow(Row, PKID, rtnErrors) Else Return False

Else If Cmd.op = "update" Then
// Put all tags from original row into the row we write
Dim OriginalRow As JSON
ReadJSON OriginalRow from fTable, OldPKID Then
Row = clone(OriginalRow)
Dim updatedRow As JSON = Cmd.updatedrow
    <%
                    for each Column in viewModel.columns
                        cname = Column.name
                        if !cname then cname = Column.field
if Column.display <> "hidden" And Column.display <> "gridhidden" And(Column.canedit || Column.editable) Then %>
    Row["<%=CName%>"] = updatedRow["<%=CName%>"]
        <%
        End If
Next
    %>
    End If

If Left(Cmd.id, 1) = "-" Then;* New Row
If @view_<%=niceViewName %> _writeRow(Row, PKID, rtnErrors) Else Return False
Else
If OldPKID <> PKID And OldPKID <> "" Then;* Primary key change ?
    If @view_<%=niceViewName %> _deleteRow(OldPKID, rtnErrors) Else Return False
End If

If @view_<%=niceViewName %> _writeRow(Row, PKID, rtnErrors) Else Return False
End If
End If
End If
Next

Return True
end function

<% $include _writeRow %>

<% $include _deleteRow %>

    function view_<%=niceViewName%> _cancelEdits(ByVal pkID As String, ByRef rtnErrors As String) As Boolean
Return True
end function

<%   
    * update menu if needed
    Call @Jsb_mdl.UpdateMenu(ProjectName)
%>

<%
    // Generate an .aspx page for compiled versions
    aspxSrc =[]
aspxSrc[-1] = '<': '%@ Page Language="vb" AutoEventWireup="false" CodeBehind="': niceViewName: '.aspx.vb" Inherits="WebApplication1.': niceViewName: '_AspxPage" %': '>'
aspxSrc[-1] = '<': '%@ Register Assembly="DevExpress.Web.v19.1, Version=19.1.3.0, Culture=neutral, PublicKeyToken=b88d1754d700e49a" Namespace="DevExpress.Web" TagPrefix="dx" %': '>'
aspxSrc[-1] = '<!DOCTYPE html>'
aspxSrc[-1] = '<html>'
aspxSrc[-1] = '<head runat="server">'
aspxSrc[-1] = '<asp:Literal ID="HeaderStuff" runat="server"></asp:Literal>'
aspxSrc[-1] = '</head>'
aspxSrc[-1] = '<body>'
aspxSrc[-1] = '    <asp:Literal ID="uptoForm" runat="server"></asp:Literal>'
aspxSrc[-1] = '        <form id="jsb" method="post" class="jsb" action="" enctype="multipart/form-data" runat="server">'
aspxSrc[-1] = '           <asp:Literal ID="upToMarker" runat="server"></asp:Literal>'
aspxSrc[-1] = '           <dx:ASPxGridView ID="': niceViewName: '" runat="server" Width="100%">'
aspxSrc[-1] = '              <SettingsContextMenu Enabled="True" EnableRowMenu="True">'
aspxSrc[-1] = '              </SettingsContextMenu>'
aspxSrc[-1] = '              <SettingsPager AlwaysShowPager="True" PageSize="15">'
aspxSrc[-1] = '                  <PageSizeItemSettings Items="15, 30, 100, 500, 10000" Position="Left" ShowAllItem="True">'
aspxSrc[-1] = '                  </PageSizeItemSettings>'
aspxSrc[-1] = '              </SettingsPager>'
aspxSrc[-1] = '              <Settings ColumnMaxWidth="2000" HorizontalScrollBarMode="Auto" ShowFilterBar="Visible" ShowFilterRow="True" ShowFooter="True" ShowGroupPanel="True" ShowHeaderFilterButton="True" />'
aspxSrc[-1] = '              <SettingsBehavior EnableCustomizationWindow="True" />'
aspxSrc[-1] = '              <SettingsResizing ColumnResizeMode="Control" />'
aspxSrc[-1] = '              <SettingsExport EnableClientSideExportAPI="True">'
aspxSrc[-1] = '              </SettingsExport>'
aspxSrc[-1] = '              <Toolbars>'
aspxSrc[-1] = '                  <dx:GridViewToolbar>'
aspxSrc[-1] = '                  </dx:GridViewToolbar>'
aspxSrc[-1] = '              </Toolbars>'
aspxSrc[-1] = '           </dx:ASPxGridView>'
aspxSrc[-1] = '           <asp:Literal ID="afterMarker" runat="server"></asp:Literal>'
aspxSrc[-1] = '        </form>'
aspxSrc[-1] = '    <asp:Literal ID="afterForm" runat="server"></asp:Literal>'
aspxSrc[-1] = '</body>'
aspxSrc[-1] = '</html>'

Write aspxSrc On @fHandle("dict ": ProjectName), niceViewName: ".aspx" Else Stop "Form-": System(28): ": ": @Errors
%>