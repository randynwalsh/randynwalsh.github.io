anonymousFunc = function () {
window.cachedFileNames["jsb_jsondefs"] = "jsb_jsondefs"
if (!window.cached_jsb_jsondefs) window.cached_jsb_jsondefs = {}
var z="{name:'label', index:11, label:'Label', width:\"30em\", control:'textbox', canedit:true, required: true, notblank: true },\xFE";
 z+="{name:'datausuage', label:'data Usuage', width:19, control:'dropdownbox', canedit:true, reflist: \"As Url;As Parameter;As Text\" },\xFE";
 z+="{name:'transferto', index:46, label:'Transfer To', datatype: 'number', suppresslabel: false, control:'dropdownbox', canedit:true, notblank: true, defaultvalue:\"10\", reflist: \"New Window,1;New Window Tab,2;Tab (name in Transfer Xtra),3;Frame (name in Transfer Xtra),4;Dialog (Title in Transfer Xtra),6;HTTP POST (Transfer Extra becomes formVar Name and contains SelectedID),7;HTTP GET,8;Current Window,10;JavaScript (in Transfer Extra),11;Top Window,12;Back,13;Next Tab,14;Previous Tab,15;Close Window,16;Return Pick Value,17\"},\xFE";
 z+="{name:'transferurl', index:47, label:'Transfer URL', datatype: 'string', suppresslabel: false, control:'combobox', canedit:true, defaultvalue:\"\",  reffile:\"dict {projectname}\", refpk:\"ItemID\", refwhere:\"ItemID Like '%.page'\", pickfunction: 'edp_pick?projectName={projectname}' },\xFE";
 z+="{name:'onParentExtra', index:48, label:'Transfer Extra', datatype: 'string', suppresslabel: false, control:'textbox', canedit:true, defaultvalue:\"\"},\xFE";
 z+="{name:'transferaddfrompage', index:48, label:'add fromPage', suppresslabel: false, control:'checkbox', canedit:true, defaultvalue:1},\xFE";
 z+="{name:'lblInfo', label:'Info', control:'label', suppresslabel: true, fullline: true, defaultvalue:'For more button options, use toolbar buttons and make them inline' }"
window.cached_jsb_jsondefs["buttonurl"]=z;
var z="{name:'buttontxt', label:'Text', required: false, datatype: 'string', width:90, control:'textbox', canedit:true, defaultvalue:\"\" },\xFE";
 z+="{name:'buttoncss', label:'CSS', required: false, datatype: 'string', width:90, control:'textbox', canedit:true, defaultvalue:\"\" },\xFE";
 z+="\xFE";
 z+="{name:'opento', newlineprefix: true, label:'Open To', datatype: 'number', suppresslabel: false, control:'dropdownbox', canedit:true, required: false, notblank: false, defaultvalue:10, reflist: \"New Window,1;New Window Tab,2;Tab (name in Transfer Xtra),3;Frame (name in Transfer Xtra),4;Dialog (Title in Transfer Xtra),6;HTTP POST (Transfer Extra becomes formVar Name and contains SelectedID),7;HTTP GET,8;Current Window,10;JavaScript (in Transfer Extra),11;Top Window,12;Back,13;Next Tab,14;Previous Tab,15;Close Window,16;Return Pick Value,17\"},\xFE";
 z+="{name:'url', label:'URL', datatype: 'string', suppresslabel: false, control:'combobox', canedit:true, required: false, notblank: false, defaultvalue:\"\", reffile:\"dict {projectname}\", refpk:\"ItemID\", refwhere:\"ItemID Like '%.page'\", pickfunction: 'edp_pick?projectName={projectname}' },\xFE";
 z+="{name:'onParentExtra', label:'Transfer Extra', datatype: 'string', suppresslabel: false, control:'textbox', canedit:true, required: false, notblank: false, defaultvalue:\"\"},\xFE";
 z+="{name:'addfrompage', label:'add frmPage', suppresslabel: false, control:'checkbox', canedit:true, required: false, notblank: false, defaultvalue:0},\xFE";
 z+="{name:'addoutputs', label:'add outpts', suppresslabel: false, control:'checkbox', canedit:true, required: false, notblank: false, defaultvalue:0},\xFE";
 z+="{name:'addnewrec', label:'add new rec', suppresslabel: false, control:'checkbox', canedit:true, required: false, notblank: false, defaultvalue:0},\xFE";
 z+="{name:'passparams', label:'PassThru Prms', suppresslabel: false, control:'checkbox', canedit:true, required: false, notblank: false, defaultvalue:0},\xFE";
 z+="\xFE";
 z+="{name:'verifyform', newlineprefix: true, label:'Verify form', width:12, control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:0 },\xFE";
 z+="{name:'saveform', label:'Save form', width:12, control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:0 },\xFE";
 z+="{name:'deleteform', label:'Delete form', width:12, control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:0 },\xFE";
 z+="{name:'confirmop', label:'Confirm Op?', width:12, control:'dropdownbox', canedit:true, required: false, notblank: true, defaultvalue:0, reflist: \"false,0;true,1;ifdirty,2\" },\xFE";
 z+="{name:'customcall', label:'Call Routine', required: false, datatype: 'string', width:90, control:'textbox', canedit:true, defaultvalue:\"\" },\xFE";
 z+="\xFE";
 z+="{name:'showwhen', newlineprefix: true, label:'Show btn', width:12, control:'dropdownbox', canedit:true, required: false, notblank: true, defaultvalue:0, reflist: \"always,0;if new record,1;if existing record,2\" },\xFE";
 z+="{name:'parentmayhide', label:'Prnt may hide', width:12, control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:0, reflist: \"false,0;true,1\" },\xFE";
 z+="{name:'inPlace', label:'Place Inline', width:12, control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:0, reflist: \"false,0;true,1\" }\xFE";
 z+=""
window.cached_jsb_jsondefs["custombtns"]=z;
var z="{name:'gridOpenTo', index:31, label:'Grid Selection To', datatype: 'number', suppresslabel: false, control:'dropdownbox', canedit:true, required: true, addBlank: true, defaultvalue:10, reflist: \"New Window,1;New Window Tab,2;Tab (name in Transfer Xtra),3;Frame (name in Transfer Xtra),4;Dialog (Title in Transfer Xtra),6;HTTP POST (Transfer Extra becomes formVar Name and contains SelectedID),7;HTTP GET,8;Current Window,10;JavaScript (in Transfer Extra),11;Top Window,12;Back,13;Next Tab,14;Previous Tab,15;Close Window,16;Return Pick Value,17\"},\xFE";
 z+="{name:'gridOpenUrl', index:32, label:'Selection URL', datatype: 'string', suppresslabel: false, control:'combobox', canedit:true, required: false, addBlank: true, defaultvalue:\"\",  reffile:\"dict {projectname}\", refpk:\"ItemID\", refwhere:\"ItemID Like '%.page'\", pickfunction: 'edp_pick?projectName={projectname}' },\xFE";
 z+="{name:'gridOpenExtra', index:33, label:'Transfer Xtra', datatype: 'string', width:12, control:'textbox', canedit:true, required: false, notblank: false },\xFE";
 z+="{name:'passThruParams', index:34, label:'pass Url Params', width:12, control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:0, reflist: \"false,0;true,1\" },\xFE";
 z+="{name:'addFromUrl', index:35, label:'add From Url', width:12, control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:0, reflist: \"false,0;true,1\" },\xFE";
 z+="{name:'gridDblOpenTo', index:41, label:'dblClick Selection To', datatype: 'number', suppresslabel: false, control:'dropdownbox', canedit:true, required: false, addBlank: true, defaultvalue:10, reflist: \"New Window,1;New Window Tab,2;Tab (name in Transfer Xtra),3;Frame (name in Transfer Xtra),4;Dialog (Title in Transfer Xtra),6;HTTP POST (Transfer Extra becomes formVar Name and contains SelectedID),7;HTTP GET,8;Current Window,10;JavaScript (in Transfer Extra),11;Top Window,12;Back,13;Next Tab,14;Previous Tab,15;Close Window,16;Return Pick Value,17\"},\xFE";
 z+="{name:'gridDblOpenUrl', index:42, label:'dblClick URL', datatype: 'string', suppresslabel: false, control:'combobox', canedit:true, required: false, addBlank: true, defaultvalue:\"\",  reffile:\"dict {projectname}\", refpk:\"ItemID\", refwhere:\"ItemID Like '%.page'\", pickfunction: 'edp_pick?projectName={projectname}' },\xFE";
 z+="{name:'gridDblOpenExtra', index:43, label:'dblClick Xtra', datatype: 'string', width:12, control:'textbox', canedit:true, required: false, notblank: false },\xFE";
 z+="{name:'passDblThruParams', index:44, label:'dblClick pass Url Params', width:12, control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:0, reflist: \"false,0;true,1\" },\xFE";
 z+="{name:'addDblFromUrl', index:45, label:'dblClick add From Url', width:12, control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:0, reflist: \"false,0;true,1\" }"
window.cached_jsb_jsondefs["gridpickurl"]=z;
var z="{name:'name', index:10, label:'Name', datatype: 'string', primarykey:true, width:\"30em\", control:'label', align:'left', canedit:false, display:\"hidden\" },\xFE";
 z+="{name:'label', index:11, label:'Label', width:\"30em\", control:'textbox', canedit:true, required: true, notblank: true },\xFE";
 z+="{name:'defaultvalue', index:12, label:'Default Value', width:\"30em\", control:'textbox', canedit:true, required: false, notblank: false },\xFE";
 z+="{name:'required', index:13, label:'Required', width:\"18em\", control:'checkbox', canedit:true, required: false, notblank: false, reflist: \"false,0;true,1\" },\xFE";
 z+="{name:'notblank', index:14, label:'Not Blank', width:\"18em\", control:'checkbox', canedit:true, required: false, notblank: false, reflist: \"false,0;true,1\" },\xFE";
 z+="{name:'tooltip', index:15, label:'Tool Tip', width:\"12em\", control:'textbox', canedit:true, required: false, notblank: false, display:\"gridhidden\" },\xFE";
 z+="\xFE";
 z+="\xFE";
 z+="{ index:20 },\xFE";
 z+="\xFE";
 z+="{name:'reffile', index:21, label:'Ref File', width:\"12em\", control:'comboBox', autopostback: true, canedit:true, required: false, notblank: false, reffile:\"{listfiles}\" },\xFE";
 z+="{name:'refsql', index:22, label:'Ref SQL', width:\"12em\", control:'textbox', canedit:true, required: false, notblank: false },\xFE";
 z+="{name:'refpk', index:23, label:'Ref PK', width:\"12em\", control:'comboBox', canedit:true, required: false, notblank: false, reffile:\"{!reffile}\" },\xFE";
 z+="{name:'refdisplay', index:24, label:'Ref display', width:\"12em\", control:'comboBox', canedit:true, required: false, notblank: false, reffile:\"{!reffile}\"  },\xFE";
 z+="{name:'refwhere', index:25, label:'Ref Col', width:\"12em\", control:'textbox', canedit:true, required: false, notblank: false },\xFE";
 z+="{name:'reflist', index:26, label:'Ref List', width:23, control:'textbox', canedit:true, required: false, notblank: false },\xFE";
 z+="\xFE";
 z+="{ index: 30 },\xFE";
 z+="\xFE";
 z+="{name:'iminvalue', index:31, label:'int Min Vaue', width:\"12em\", control:'textbox', canedit:true, required: false, notblank: false, display:\"gridhidden\" },\xFE";
 z+="{name:'imaxvalue', index:32, label:'int Max Value', width:\"12em\", control:'textbox', canedit:true, required: false, notblank: false, display:\"gridhidden\" },\xFE";
 z+="{name:'regx', index:33, label:'RegX', width:\"12em\", control:'textbox', canedit:true, required: false, notblank: false, display:\"gridhidden\" },\xFE";
 z+="{name:'regxtext', index:34, label:'Reg X Text', width:\"12em\", control:'textbox', canedit:true, required: false, notblank: false, display:\"gridhidden\" },\xFE";
 z+="\xFE";
 z+="{ index: 40 },\xFE";
 z+="\xFE";
 z+="{name:'align', index:41, label:'Align', width:\"12em\", control:'dropDownBox', canedit:true, required: false, notblank: false, reflist: \"left;right\" },\xFE";
 z+="{name:'sortable', index:42, label:'Sortable', width:\"12em\", control:'checkbox', canedit:true, required: false, notblank: false, defaultvalue:\"1\", reflist: \"false,0;true,1\" },\xFE";
 z+="\xFE";
 z+="{name:'datatype', index:43, label:'Data Type', width:\"19em\", control:'dropDownBox', canedit:true, required: true, notblank: true, defaultvalue:\"string\",\xFE";
 z+="      reflist:\"guid;autointeger;integer;double;boolean;string;date;time;datetime;currency;blob;png;jpg;url;memo;password;json;jsonarray\"\xFE";
 z+="},\xFE";
 z+="{name:'primarykey', index:44, label:'PKey', width:\"13em\", control:'checkbox', canedit:true, required: true, notblank: true, defaultvalue:\"1\", reflist: \"false,0;true,1\" }\xFE";
 z+="   	      "
window.cached_jsb_jsondefs["tablecolumns"]=z;
var z="{name:'caption', index:4, label:'Caption', datatype: 'string', width:12, control:'textbox', canedit:true, required: false, notblank: false },\xFE";
 z+="{name:'opento', label:'OpenTo', datatype: 'number', suppresslabel: false, control:'dropdownbox', canedit:true, required: false, notblank: false, defaultvalue:\"10\", reflist: \"New Window,1;New Window Tab,2;Tab (name in Transfer Xtra),3;Frame (name in Transfer Xtra),4;Dialog (Title in Transfer Xtra),6;HTTP POST (Transfer Extra becomes formVar Name and contains SelectedID),7;HTTP GET,8;Current Window,10;JavaScript (in Transfer Extra),11;Top Window,12;Back,13;Next Tab,14;Previous Tab,15;Close Window,16;Return Pick Value,17\"},\xFE";
 z+="{name:'openurl', index:37, label:'URL', datatype: 'string', suppresslabel: false, control:'combobox', canedit:true, required: true, notblank: false, defaultvalue:\"\",  reffile:\"dict {projectname}\", refpk:\"ItemID\", refwhere:\"ItemID Like '%.page'\", pickfunction: 'edp_pick?projectName={projectname} },\xFE";
 z+="{name:'openextra', index:38, label:'Transfer Extra', datatype: 'string', suppresslabel: false, control:'textbox', canedit:true, required: false, notblank: false, defaultvalue:\"\"}\xFE";
 z+=""
window.cached_jsb_jsondefs["urlbuttons"]=z;
var z="{name:'name', index:1, label:'Name', datatype: 'string', primarykey:true, width:\"30em\", control:'label', align:'left', canedit:false },\xFE";
 z+="{name:'suppresslabel', index:2, label:'Suppress Label', width:\"12em\", control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:\"0\", reflist: \"false,0;true,1\" },\xFE";
 z+="{name:'pickfunction', index:3, label:'Is a Pick View', width:\"12em\", control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:\"0\", reflist: \"false,0;true,1\" },\xFE";
 z+="\xFE";
 z+="{ index:5 },\xFE";
 z+="\xFE";
 z+="{name:'index', index:6, label:'Position', datatype: 'integer', width:\"12em\", control:'textbox', align:'right', canedit:true, display:\"hidden\" },\xFE";
 z+="{name:'control', index:7, label:'Control', width:\"12em\", control:'dropDownBox', autopostback: true, canedit:true, required: true, notblank: false, defaultvalue:\"textbox\", reffile:\"jsb_ctls\", refwhere:\"ItemID > 'a'\", refpk:\"ItemID\" },\xFE";
 z+="{name:'display', index:8, label:'Display', width:\"12em\", control:'dropDownBox', canedit:true, required: true, notblank: true, display:\"visible\", defaultvalue:\"visible\", reflist:\"visible;hidden;gridhidden\" },\xFE";
 z+="{name:'canedit', index:8, label:'Editable', width:\"12em\", control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:\"1\", reflist: \"false,0;true,1\" },\xFE";
 z+="\xFE";
 z+="{ index:10 },\xFE";
 z+="\xFE";
 z+="{name:'width', index:11, label:'Width', width:\"13em\", control:'textbox', canedit:true, required: true, notblank: true, defaultvalue:\"18\" },\xFE";
 z+="\xFE";
 z+="{name:'newlineprefix', index:12, label:'Prefix NewLine', width:\"12em\", control:'checkbox', canedit:true, required: false, notblank: false, reflist: \"false,0;true,1\" },\xFE";
 z+="{name:'ctlstyle', index:13, label:'Control css style', width:\"12em\", control:'textbox', canedit:true, required: false, notblank: false, display:\"gridhidden\" },\xFE";
 z+="{name:'lblstyle', index:14, label:'Label css style', width:\"12em\", control:'textbox', canedit:true, required: false, notblank: false, display:\"gridhidden\" },\xFE";
 z+="{name:'fullline', index:15, label:'Full Line', width:\"12em\", control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:\"0\", reflist: \"false,0;true,1\" },\xFE";
 z+="\xFE";
 z+="{ index:20 }"
window.cached_jsb_jsondefs["viewcolumns"]=z;
window.cached_jsb_jsondefs["viewform"] = {"name":"formname","index":31,"label":"Form Name","datatype":"array","primarykey":false,"width":30,"control":"dropdownbox","pickfunction":"edv_pick?projectName={projectname}","required":false,"notblank":false,"canedit":true,"reffile":"dict {projectname}","refpk":"ItemID","refwhere":"ItemID Like \u0027%.view\u0027"};
var z="{name:'and', index:1, label:'And', datatype: 'boolean', width:12, control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:\"1\" },\xFE";
 z+="{name:'lparen', index:2, label:'(..', datatype: 'boolean', width:12, control:'checkbox', canedit:true, required: false, notblank: true },\xFE";
 z+="{name:'field', index:3, label:'Field', datatype: 'string', width:90, control:'dropDownBox', canedit:true, reffile:\"{sqlcolumns}\", refpk:\"name\" },\xFE";
 z+="{name:'name', index:4, label:'Name', datatype: 'string', width:12, control:'textbox', canedit:true, required: false, notblank: false },\xFE";
 z+="{name:'scope', index:6, label:'Scope', datatype: 'string', width:12, control:'dropDownBox', canedit:true, required: false, notblank: true, defaultvalue:\"UrlParam\", reflist: \"UrlParam;SessionVar;ApplicationVar;ProfileVar;AppCode;memoryVar\" },\xFE";
 z+="{name:'datatype', index:7, label:'Data Type', datatype: 'string', width:12, control:'dropDownBox', canedit:true, required: false, notblank: true, defaultvalue:\"string\", reflist: \"string;number;boolean;date\" },\xFE";
 z+="{name:'operator', index:8, label:'Operator', datatype: 'string', width:12, control:'dropDownBox', canedit:true, required: false, notblank: true, defaultvalue:\"=\", reflist: \"=;<>;>;<;<=;>=;Like ...%;Like %...;Like %...%;InList\" },\xFE";
 z+="{name:'required', index:9, label:'Required', datatype: 'boolean', width:12, control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:\"1\" },\xFE";
 z+="{name:'rparen', index:10, label:'..)',  datatype: 'boolean', width:12, control:'checkbox', canedit:true, required: false, notblank: true },\xFE";
 z+="{name:'defaultvalue', index:11, datatype: 'string', label:'Default Value', width:90, control:'textbox', canedit:true }\xFE";
 z+=""
window.cached_jsb_jsondefs["viewinputs"]=z;
window.cached_jsb_jsondefs["viewnestedtest"]="{name:'outcap', index:4, label:'Caption', datatype: 'string', width:12, control:'textbox', canedit:true, required: false, notblank: false },\xFE{name:'outx', index:38, label:'Extra', datatype: 'string', suppresslabel: false, control:'textbox', canedit:true, required: false, notblank: false, defaultvalue:\"\"},\xFE{name:'innerc', index:27, label:'Inner one', datatype: 'jsonarray', fullline: true, control:'json_inline', canedit:true, reffile:\"mdl_jsondefs\", refpk:\"viewNestedTest2\" }\xFE";
window.cached_jsb_jsondefs["viewnestedtest2"]="{name:'incap', index:4, label:'Caption', datatype: 'string', width:12, control:'textbox', canedit:true, required: false, notblank: false },\xFE{name:'inx', index:38, label:'Extra', datatype: 'string', suppresslabel: false, control:'textbox', canedit:true, required: false, notblank: false, defaultvalue:\"\"}";
window.cached_jsb_jsondefs["viewoutputs"]="{name:'field', index:3, label:'Field', datatype: 'string', width:90, control:'dropDownBox', canedit:true, reffile:\"{viewcolumns}\", refpk:\"name\" },\xFE{name:'name', index:4, label:'Name', datatype: 'string', width:12, control:'textbox', canedit:true, required: false, notblank: false },\xFE{name:'scope', index:6, label:'Scope', datatype: 'string', width:12, control:'dropDownBox', canedit:true, required: false, notblank: true, defaultvalue:\"UrlParam\", reflist: \"UrlParam;SessionVar;ApplicationVar;ProfileVar;memoryVar\" }";
var z="{name:'allany', index:1, label:'All or Any', datatype: 'string', width:12, control:'dropDownBox', canedit:true, required: false, notblank: true, defaultvalue:\"All\", reflist: \"All,Any\" },\xFE";
 z+="{name:'block', index:2, label:'Block', datatype: 'string', width:12, control:'dropDownBox', canedit:true, required: false, notblank: true, defaultvalue:\"a\", reflist: \"a,b,c,d,e,f,g,h,i,j\" },\xFE";
 z+="{name:'jsfunction', index:3, toolTip: 'javascript function to call', label:'js Function', datatype: 'string', width:12, control:'dropdownbox', canedit:true, required: true, notblank: true, defaultvalue:\"\", reflist: \"cssVisibility,cssRequiredness,cssLabel\" },\xFE";
 z+="{name:'jsparameter', index:4, toolTip: 'extra parameter, # or \"string\"', label:'js Parameter', datatype: 'string', width: 12, control:'textbox', canedit: true },\xFE";
 z+="{name:'field', index:5, label:'Field', datatype: 'string', width:90, control:'dropDownBox', canedit:true, reffile:\"{viewcolumns}\", refpk:\"name\" },\xFE";
 z+="{name:'operator', index:6, label:'Operator', datatype: 'string', width:12, control:'dropDownBox', canedit:true, required: false, notblank: true, defaultvalue:\"=\", reflist: \"=;<>;>;<;<=;>=;InList;Not InList\" },\xFE";
 z+="{name:'tovalue', tooltip: \"#, 'string', or ['a', 'b', 'c']\", index:7, datatype: 'string', label:'Value', width:90, control:'textbox', canedit:true }\xFE";
 z+=""
window.cached_jsb_jsondefs["viewrequiredness"]=z;
var z="{name:'and', index:1, label:'And', datatype: 'boolean', width:12, control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:\"1\" },\xFE";
 z+="{name:'lparen', index:2, label:'(..', datatype: 'boolean', width:12, control:'checkbox', canedit:true, required: false, notblank: true },\xFE";
 z+="{name:'field', index:3, label:'Field', datatype: 'string', width:90, control:'dropDownBox', canedit:true, reffile:\"{sqlcolumns}\", refpk:\"name\" },\xFE";
 z+="{name:'name', index:4, label:'Name', datatype: 'string', width:12, control:'textbox', canedit:true, required: false, notblank: false },\xFE";
 z+="{name:'scope', index:6, label:'Scope', datatype: 'string', width:12, control:'dropDownBox', canedit:true, required: false, notblank: true, defaultvalue:\"UrlParam\", reflist: \"UrlParam;SessionVar;ObservableVar;ApplicationVar;ProfileVar;AppCode\" },\xFE";
 z+="{name:'datatype', index:7, label:'Data Type', datatype: 'string', width:12, control:'dropDownBox', canedit:true, required: false, notblank: true, defaultvalue:\"string\", reflist: \"string;number;boolean;date\" },\xFE";
 z+="{name:'operator', index:8, label:'Operator', datatype: 'string', width:12, control:'dropDownBox', canedit:true, required: false, notblank: true, defaultvalue:\"=\", reflist: \"=;<>;>;<;<=;>=;Like ...%;Like %...;Like %...%;InList\" },\xFE";
 z+="{name:'required', index:9, label:'Required', datatype: 'boolean', width:12, control:'checkbox', canedit:true, required: false, notblank: true, defaultvalue:\"1\" },\xFE";
 z+="{name:'rparen', index:10, label:'..)',  datatype: 'boolean', width:12, control:'checkbox', canedit:true, required: false, notblank: true },\xFE";
 z+="{name:'defaultvalue', index:11, datatype: 'string', label:'Default Value', width:90, control:'textbox', canedit:true }\xFE";
 z+=""
window.cached_jsb_jsondefs["viewviewbtns"]=z;
}
anonymousFunc()
anonymousFunc = null