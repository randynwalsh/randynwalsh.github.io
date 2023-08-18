// ° Json Basic ° Library ° by Randy Walsh °

if (!window.dotNetObj) dotNetObj = null;   // This is set automatically by the jsbWinforms (Windows Chromium version of JSB)
if (!window.serialPort) serialPort = null;  // If we attach under phonegap to a serial port, this get's set
if (!window.dbName) dbName = "jsb"      // If our HTML file didn't set a default account name, use "jsb"

// These are multi-value rdbms standard delimeters
var sm = "\xFF";
var am = "\xFE";
var vm = "\xFD";
var svm = "\xFC";
var ssvm = "\xFB";

var esc = "\x1B";                   // standard ASCII for ESC
var c28 = "\x1C";                   // c28 & c29 are my (jsb) escape codes for plain text (c28 - enter HTML mode and c29 exit HTML mode)
var c29 = "\x1D";

// ASCII carriagle return linefeedi
var cr = "\r";
var lf = "\n";
var crlf = "\r\n";

var lastKOReady;                    // Since we can only bind knockout once, keep track of KO binding
var doingBackBtn = false;           // prevents user from pushing back button until we have resolved this first back
var pgMultiviewChild = false;       // set to true if we were spawned by PhoneGap multi-view and we are a child
var hashChanges = [];               // Keep a log of location hash (#) changes so we can do a back btn for phoneGap
var tryFileSystem = true;           // Attempt to open a html5 filesystem
var serverVersion = false;
var doDocReady = true;
var rtnCode;                        // a temporary holding for dbgCheck
var fHandleMD = false;              // Quick reference to the account MD
var fHandleCache = "";              // This is the handle for the JSB Database Cache Table
var runningInBackground = false;    // Set or cleared by a PhoneGap event if our application is moved into background
var statusBar;                      // short-cut to $("#statusBar") - see showStatus() and hideStatusBar()
var restartTimer = null;            // Waiting to restart Go
var newGlobalsHtml = []             // Keep track of globals that shouldn't be
var profiling = null                // functions by name, call count, and time spent. Use pp(profiling) to see results. 
var docIsReady = false;
var deviceIsReady = !isPhoneGap()   // Logic for PhoneGap to make sure all is ready
    || inIframe()
    || notPhoneGapBrowser();
var goCounter = 0;
var jsbLocation = "";               // Use this instead of window.location, so we can fake certain locations
var jsbIgnoreHashChanges = 0;   // Allow process to handle it's own hash changes
var ignoreOnlyOneHashChange = false;

var debugConsoleOpen = false;

var Commons_JSB_BF = {}
var Commons_JSB_HTML = {}
var Commons_JSB_MDL = {}
var Commons_JSB_CTLS = {}
var Commons_JSB_ODB = {}
var Commons_JSB_THEMES = {}
var Commons_JSB_TCL = {}

var nestedInGo = false;
var activeProcess;                  // Only valid while we are in go() (nestedInGo is true)
var doDebug = false;
var odbActiveSelectList = null;
var me = null;  // for pause and breakon in async version
var main_VT100;

// Reason to block a process
const setBlock_fsGetDirectory = 1;
const setBlock_requestFileSystem = 2;
const setBlock_queryUsageAndQuota = 3;
const setBlock_readEntries = 4;
const setBlock_jsbExecute = 5;
const setBlock_xmlhttpSend = 6;
const setBlock_forUserPause = 7;
const setBlock_rpcRequest = 8;
const setBlock_onBatteryStatus = 9;
const setBlock_deviceorientation = 10;
const setBlock_devicemotion = 11;
const setBlock_debugInput = 12;
const setBlock_geoGetCurrentPosition = 13;
const setBlock_htmlElementLoad = 14;
const setBlock_fsRequestQuota = 15;
const setBlock_fsRemoveRecursively = 16;
const setBlock_fsGetFile = 17;
const setBlock_fsFile = 18;
const setBlock_fsReadAsArrayBuffer = 19;
const setBlock_fsCreateWriter = 20;
const setBlock_fsFileWrite = 21;
const setBlock_fsRemove = 22;
const setBlock_compassReading = 23;
const setBlock_deviceMotion = 24;
const setBlock_onBatteryLevel = 25;
const setBlock_forKeyIn = 26;
const setBlock_forSleep = 27;
const setBlock_forRQM = 28;
const setBlock_forINPUT = 29;
const setBlock_forINPUTTCL = 30;
const setBlock_forCallBack = 31;
const setBlock_debugMsgBox = 32;
const setBlock_forImageLoad = 33;

var processNumber = 0;

function isIE() { return "ActiveXObject" in window }
function isChrome() { return InStr(navigator.userAgent, 'Chrome') > 0 }

function whichVT100(optJsbRoutine) {
    if (optJsbRoutine instanceof jsbRoutine) return optJsbRoutine._activeProcess._VT100;
    return main_VT100
}

function Println(optJsbRoutine) {
    var VT100 = whichVT100(optJsbRoutine);
    for (var i = (optJsbRoutine instanceof jsbRoutine) ? 1 : 0; i < arguments.length; i++) {
        VT100.addToUserPrint(arguments[i]);
    }
    VT100.addToUserPrint(crlf);
}

function Print(optJsbRoutine) {
    var VT100 = whichVT100(optJsbRoutine);
    for (var i = (optJsbRoutine instanceof jsbRoutine) ? 1 : 0; i < arguments.length; i++) {
        VT100.addToUserPrint(arguments[i]);
    }
}

function ClearScreen(optJsbRoutine) {
    whichVT100(optJsbRoutine).ClearScreen()
}

function FlushHTML(optJsbRoutine) {
    whichVT100(optJsbRoutine).FlushHTML()
}

function iterateOver(a) {
    if (!a) return [];

    if (a instanceof Array) {
        if (a[0] != null) return a; else return a.slice(1);
    }

    if (typeof a !== "object") return a;
    if (a instanceof String) return a;

    var b = [];
    for (var tagName in a) {
        if (isJSON_Property(a[tagName], true)) b.push(tagName)
    }
    return b;
}

// ******************************* new async routines  ******************************* 
// ******************************* new async routines  ******************************* 
// ******************************* new async routines  ******************************* 
async function asyncTclExecute(Sentence, ByRef_CapturedData) {
    var me = new jsbRoutine("jsbLib.js", "asyncTclExecute") // preserve the process we are running under (me._activeProcess)

    // Remember old process and create a new process
    var parentProcess = activeProcess;
    me._activeProcess = activeProcess = new Process(me, Sentence);


    function exit(success, msg) {
        // restore previous activeProcess
        activeProcess = parentProcess

        if (msg !== undefined) {
            if (ByRef_CapturedData) ByRef_CapturedData(msg); else Println(msg);
        }

        return success;
    }

    if (!fHandleMD) {
        if (!await asyncOpen("", "MD", function (rfHandle) { fHandleMD = rfHandle })) return exit(false, At_Errors);
    }

    for (; ;) {
        Sentence = Trim(Sentence);
        if (!Sentence) return exit(true, undefined);

        var UpToOpts = Field(Sentence, '(', 1);
        var Opts = UCase(Field(Sentence, '(', 2));

        var Pgmname = UCase(Field(UpToOpts, ' ', 1));
        var Fname = Field(UpToOpts, ' ', 2);
        var Iname = Field(UpToOpts, ' ', 3);

        if (UCase(Fname) == 'DICT') {
            Fname += ' ' + Iname;
            Iname = Field(Sentence, ' ', 4);
        };

        // Check for cataloged item
        var mdItem = "";
        if (await asyncRead(fHandleMD, Pgmname, rdata => mdItem = rdata)) {
            // Check for cataloged program (CV)
            var LPos = Locate('cv', LCase(mdItem), 1, 0, 0, "");
            if (!LPos.success) return exit(false, 'UNKNOWN COMMAND: ' + Pgmname);

            var Cmdtype = UCase(Extract(mdItem, 1, LPos.position, 0));
            Fname = Extract(mdItem, 2, LPos.position, 0);
            Iname = Extract(mdItem, 3, LPos.position, 0);
            if (!Fname || !Iname) return exit(false, 'UNKNOWN COMMAND: ' + Pgmname);


        } else if (Pgmname != "RUN") return exit(false, 'UNKNOWN COMMAND: ' + Pgmname);

        // Check FName for true name - Every javascript routine is prefixed by the real filename
        if (await asyncRead(fHandleMD, Fname, rdata => mdItem = rdata)) {
            // Check Q pointer
            var LPos = Locate('q', LCase(mdItem), 1, 0, 0, "");
            if (!LPos.success) LPos = Locate('qd', LCase(mdItem), 1, 0, 0, "");
            if (LPos.success) {
                var newFName = Extract(mdItem, 3, LPos.position, 0);
                if (newFName) Fname = newFName;
            }
        }

        var i = InStr(0, Opts, "!");
        if (i >= 0) singleStepping = 1;

        try {
            var success = await asyncExecutePgm(Fname + '|' + Iname, Sentence, ByRef_CapturedData);
            return exit(success);

        } catch (err) {
            if (isString(err)) {
                if (err.startsWith("*HASH*")) {
                    if (window.Commons_JSB_BF) {
                        Commons_JSB_BF.Iambusy = 0
                        window.needmaprefresh = Len(Commons_JSB_BF.Tilelist)
                    }
                    Sentence = Mid(err, 6)

                } else if (err.startsWith("*CHAIN*")) {
                    Sentence = Mid(err, 7)

                } else if (err.startsWith("*REDIRECT*")) {
                    var url = Mid(err, 10);
                    if (url == "TCL") Sentence = ""; else {
                        new windowOpen(url)
                    }

                } else if (err.startsWith("*END*")) {
                    // if (parentProcess.hasEXECUTEParent || parentProcess.hasTCLParent) throw err;   
                    jsbCloseWindow(true);
                    return exit(true);

                } else {
                    return exit(false, err2String(err));
                }
            } else {
                return exit(false, err2String(err));
            }
        }
    }
}

async function asyncExecutePgm(tclPgm, Sentence, ByRef_CapturedData) {
    var me = new jsbRoutine("jsbLib.js", "asyncExecutePgm") // preserve the process we are running under (me._activeProcess)

    FlushHTML();
    var priorCapture = main_VT100.doingCapture;
    var priorCaptureBuffer = main_VT100.captureBuffer;
    var hSpinnerCnt = spinnerCnt;
    var priorSentence = activeProcess.At_Sentence
    activeProcess.At_Sentence = Sentence

    function exit(success) {
        FlushHTML();
        var myCap = main_VT100.captureBuffer;

        main_VT100.doingCapture = priorCapture
        main_VT100.captureBuffer = priorCaptureBuffer

        activeProcess.At_Sentence = priorSentence;

        if (ByRef_CapturedData) {
            ByRef_CapturedData(myCap);
        } else {
            Print(myCap);
        }

        return success;
    }

    // Capturing?
    if (ByRef_CapturedData) {
        // stackLevel = stackWindow('fakeCaptureBuffer'); // Creates new main_VT100
        main_VT100.doingCapture = true;
    } else {
        // stackLevel = stackWindow();
    }

    if (typeof tclPgm == "string") {
        var callName = UCase(tclPgm);
        tclPgm = undefined;
        if (!await asyncReadJSBCode(callName, me, "_Pgm", _objName => tclPgm = window[_objName])) {
            me._activeProcess.At_Errors = "Program " + Replace(callName, '|', ' ') + " not found";
            Print(me._activeProcess.At_Errors);
            return exit(false);
        }
    }

    var success = false;
    try {
        await tclPgm();
        return exit(true);

    } catch (err) {
        var success = isString(err) && err.startsWith("*STOP*");
        if (exit(success)) return true;
        if (spinnerCnt > hSpinnerCnt) hideSpinner();
        throw err;
    }
}

async function asyncCallByName(callJsbRoutine, me, ignoreMissingSubError, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12) {
    if (typeof callJsbRoutine == "string") {
        var callName = UCase(callJsbRoutine);
        callJsbRoutine = undefined;
        var i = InStr(callName, "|");
        if (i == -1) {
            i = InStr(callName, ".");
            if (i > 0) callName = Left(callName, i) + "|" + Mid(callName, i + 1);
        }

        if (!await asyncReadJSBCode(callName, me, "", _objName => callJsbRoutine = window[_objName])) {
            if (ignoreMissingSubError) return null;
            throw new Error("Call @CallByName: Undefined call to " + callName);
        }
    }

    return await callJsbRoutine(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12)
}

var loadJsbLibraries = true;

// Loaded at startup and by the compiler at runtime
async function loadJsbStandardLibraries(onlyOne) {
    var Src, gotSrc, fDictHandle;
    var libs = ['jsb_html', 'jsb_bf', 'jsb_odb', 'jsb_mdl', 'jsb_themes', 'jsb_ctls', 'jsb_tcl']
    if (onlyOne) libs = [onlyOne];

    for (var i = 0; i < libs.length; i++) {
        var fName = libs[i];
        if (await asyncOpen("DICT", fName, fHandle => fDictHandle = fHandle)) {
            gotSrc = await asyncRead(fDictHandle, fName + '.js', "", 0, data => Src = data);
            if (gotSrc) {
                if (!loadCode(Src, fName + '_js')) alert("Malformed javascript: " + fName + '.js');
            }
        }
    };

    loadJsbLibraries = false;
}

async function asyncReadJSBCode(FileName_ItemName, fromMe, ext, byRef_ObjectName) {
    function exit(success) {
        if (success) {
            byRef_ObjectName(objName);
            return true;
        }

        // are we trying to call a _Sub using a function expression?
        if (ext) return false;

        // try again
        return asyncReadJSBCode(FileName_ItemName, fromMe, "_Sub", byRef_ObjectName)
    }

    if (loadJsbLibraries) await loadJsbStandardLibraries();

    FileName_ItemName = String(FileName_ItemName);
    if (FileName_ItemName.length == 0) return false;

    var FNameProvided = InStr(0, FileName_ItemName, '|');
    var Fname, Iname, tryFName;
    if (FNameProvided >= 0) {
        Fname = Left(FileName_ItemName, FNameProvided).toUpperCase();
        Iname = Mid(FileName_ItemName, FNameProvided + 1);
        tryFName = Change(Fname, '-', '_') + "_";
        FNameProvided = true;
    } else if (fromMe && fromMe._fileName) {
        Fname = fromMe._fileName;
        tryFName = Change(Fname, '-', '_') + "_";
        Iname = FileName_ItemName
        FNameProvided = false;
    };

    var subName = makeSubName(Iname);

    // Source already in mmory?
    var objName = tryFName + subName + ext;
    if (typeof window[objName] == 'function') return exit(true);

    var Src, fDictHandle;
    if (Fname && Left(Fname, 4) != 'JSB_') {
        if (await asyncOpen("DICT", Fname, fHandle => fDictHandle = fHandle)) {
            if (await asyncRead(fDictHandle, Fname + '.js', "", 0, data => Src = data)) {
                if (loadCode(Src, LCase(Fname) + '_js')) {
                    if (typeof window[objName] == 'function') return exit(true);
                } else {
                    throw new Error("Malformed javascript: " + Fname + " " + Iname + ".js" + crlf + _activeProcess.At_Errors);
                }
            }
        }
    }

    if (!FNameProvided) {
        objName = 'JSB_BF_' + subName + ext;
        if (typeof window[objName] == 'function') return exit(true);

        objName = 'JSB_HTML_' + subName + ext;
        if (typeof window[objName] == 'function') return exit(true);
    }

    return exit(false);
}

function Process(fromJsbRoutine, At_Sentence) {
    if (this.used) { alert('Must be called with new keyword'); debugger }
    this.used = true;

    var newProcess = this;
    var oldProcess = fromJsbRoutine._activeProcess;

    processNumber += 1;
    newProcess.processNo = processNumber;
    newProcess._activeRoutine = fromJsbRoutine;

    newProcess.At_Errors = "";
    newProcess.At_Prompt = "? ";
    newProcess.At_Sentence = At_Sentence;
    newProcess.At_Echo = 1;
    newProcess.modalStep = false;
    newProcess.Col1 = 0;                  // Last Field() column results
    newProcess.Col2 = 0;
    newProcess.TclProhibited = false;       // Break OFF command set to true
    newProcess.At_Input = '';               // Result of last INPUT statement
    newProcess.At_Filename = '';            // CSPC default variables (@xxx)
    newProcess.At_File = '';
    newProcess.At_Record = '';
    newProcess.At_Mv = 0;
    newProcess.At_Ni = 0;
    newProcess.At_Id = 0;
    newProcess.At_Nv = 0;
    newProcess.At_Nb = 0;
    newProcess.At_Nd = 0;
    newProcess.isBlocked = 0;


    if (oldProcess) {
        newProcess.hasTCLParent = oldProcess.hasTCLParent || oldProcess.isTCL || fromJsbRoutine.isTCL;
        newProcess.hasEXECUTEParent = oldProcess.hasEXECUTEParent || oldProcess.isEXECUTE || fromJsbRoutine.isEXECUTE;
        newProcess._VT100 = oldProcess._VT100
    } else {
        newProcess.hasTCLParent = fromJsbRoutine.isTCL;
        newProcess.hasEXECUTEParent = fromJsbRoutine.isEXECUTE;
        newProcess._VT100 = main_VT100
    }

    return newProcess
}

var pendingReject;


/* async */ function asyncSleep(msTime) {
    return new Promise((resolve, reject) => { setTimeout(function () { pendingReject = undefined; resolve(); }, msTime); pendingReject = reject })
}

var pendingResolve;
var pendingReject;

//var stackedPromises = []

function stackPromise(resolve, reject) {
    //stackedPromises.push({ pendingResolve: pendingResolve, pendingReject: pendingReject })
    pendingResolve = resolve;
    pendingReject = reject;
}

function pauseResolve(arg) {
    pendingResolve(arg);
    //var p = stackedPromises.pop();
    //pendingResolve = p.pendingResolve;
    //pendingReject = p.pendingReject;
    pendingResolve = undefined;
    pendingReject = undefined;
}

function pauseReject(arg) {
    pendingReject(arg);
    //pendingResolve = p.pendingResolve;
    //var p = stackedPromises.pop();
    //pendingReject = p.pendingReject;
    pendingResolve = undefined;
    pendingReject = undefined;
}

/* restart with pauseResolve() orpauseReject() */

/* async */ function asyncPause() {
    var pausePromise = new Promise((resolve, reject) => stackPromise(resolve, reject));
    return pausePromise;
}

function txtInput_CRLF(event) {
    if (event === undefined) event = window.event;
    if ($(event.target).hasClass('ace_content')) return true;

    var txtInput = inputBox();

    if (!txtInput) return true;
    var inputText = makePickish($(txtInput).val());
    preventTheDefault(event)

    if (historyName) {
        var passwordBox = $(txtInput).attr("type") == "password"
        if (!passwordBox) pushHistory(inputText);
    }
    removeInputBox();
    pauseResolve(inputText);
    return false;
}

// build INPUT statement for CSPC INPUT command
function asyncInput(DefaultForTextBox, fromTCL) {
    var me = new jsbRoutine("jsbLib.js", "asyncInput") // preserve the process we are running under (me._activeProcess)

    return new Promise((resolve, reject) => {
        if (main_VT100.doingCapture) return reject("Input requested during Execute Capture");

        Print(c28, HtmlInputBox(DefaultForTextBox, fromTCL, me._activeProcess.At_Echo, me._activeProcess.At_Prompt), c29);
        FlushHTML();

        $(inputBox()).focus()
        stackPromise(resolve, reject);
    });
}

function Stop() {
    var Status = "";

    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i]
        if (arg) {
            Print(arg);
            Status += " " + arguments[i]
        }
    }

    if (Status) {
        Print(crlf);
        Status = Change(Status, "\n", "")
        Status = Change(Status, "\r", "")
        Status = LTrim(Status)
        Status = RTrim(Status)
    }

    FlushHTML();
    throw "*STOP*" + Status;
}

function closeAPopUpDialog() {
    var dialog = $('#popOutDIV')
    if (!dialog.length) return false;

    try {
        $(dialog).dialog('close');
    } catch (err) {
        debugger
    }

    return true
}

// ============ // ============ // ============ // ============ // ============ // ============ // ============ // ============ 
//                                         AT_Functions shared by all processes
// ============ // ============ // ============ // ============ // ============ // ============ // ============ // ============ 

// When a user logs in under JSB, (see file BF, item SIGNIN) - we set the following globals:
//       At_Request.IsAuthenticated
//       At_Request.UserName
//       At_Session.UserName
//       At_Session.IsAdmin

// Make sure to set items with Application.Item(name, newvalue) and get with Application.Item(name)
var At_Application = {
    // Set and Fetch
    Item: function (name, newValue) {
        name = 'Application_' + UCase(name)
        if (newValue === undefined) return GetCookie(name);
        SetCookie(name, newValue)
        return newValue;
    }
}

var At_Request = {
    IsAuthenticated: false,
    UserName: "",
    UserNo: newGUID(),
    URL: myLocation(),
    httpmethod: "GET"
}

// Server-Side quasi objects: Response, Session, Application (defined in JSB as @Response, @Session, @Application, @FileName, @File, @Record, ... )
//    object methods are defined future below (see JSB @Objects header)
var At_Page = {},
    At_Membership = {},
    At_Roles = {},
    At_User = {},
    At_Account = dbName;

var At_Response = {};

var At_Server = {
    flush: function () { FlushHTML(); },
    Flush: function () { FlushHTML(); },

    asyncPause: async function () {
        FlushHTML();
        return asyncPause();
    },

    end: function () {
        this.End()
    },

    End: function () {
        throw "*END*";

    },

    htmlencode: function (txt) { return htmlEscape(txt) },
    HTMLENCODE: function (txt) { return htmlEscape(txt) },
    Htmlencode: function (txt) { return htmlEscape(txt) },
    HtmlEncode: function (txt) { return htmlEscape(txt) }
}

var At_Session = {
    Item: function (name, value) {
        var lname = LCase(name);
        if (lname == 'item') { lname = '_item'; name = '_item' }

        if (value === undefined) {
            if (At_Session[name]) return At_Session[name];
            for (var tagName in At_Session) {
                if (LCase(tagName) == lname) return At_Session[tagName];
            }
            return undefined;
        }

        var priorNames = {}
        for (var tagName in At_Session) {
            if (LCase(tagName) == lname) priorNames[tagName] = true;
        }
        for (var tagName in priorNames) delete At_Session[tagName];

        At_Session[lname] = value;
        return value
    }
}

function datebox_onload(e, yearRange) {
    if (!yearRange) yearRange = "-99:+1";

    $(e).datepicker({
        dateFormat: "yy-mm-dd",
        showButtonPanel: true,
        changeMonth: true,
        changeYear: true,
        yearRange: yearRange,
        onChangeMonthYear: function (year, month, datePicker) {
            var day = datePicker.selectedDay;
            var newDate = new Date(month + '/' + day + '/' + year);
            while (day > 28) {
                if (newDate.getDate() == day && newDate.getMonth() + 1 == month && newDate.getFullYear() == year) {
                    break;
                } else {
                    day -= 1;
                    newDate = new Date(month + '/' + day + '/' + year);
                }
            }
            $(this).datepicker('setDate', newDate);
            $(this).trigger("change");
        },

        onSelect: function (dateText) {
            $(this).trigger("change");
        },

        beforeShow: function (dateText, datePicker) {
            // Record the starting date so that
            // if the user changes months from Jan->Feb->Mar
            // and the original date was 1/31,
            // then we go 1/31->2/28->3/31.
            $(this).data('preferred-day', ($(this).datepicker('getDate') || new Date()).getDate());
            hideKeyboard();
        }
    })
}

function clearAllSessions() {
    var myUserNo = LCase(userno())
    for (var tagName in clone(At_Session)) {
        if (Count(tagName, "-") == 4 && Len(tagName) == 36 && tagName != myUserNo && isJSON(At_Session[tagName])) delete At_Session[tagName]
    }
    At_Session.Item("gets", [])
    window.saveAtSession()
}

function BreakOn(fromJsbRoutine) {
    var myProcess;
    if (fromJsbRoutine) myProcess = fromJsbRoutine._activeProcess; else myProcess = activeProcess;
    myProcess.TclProhibited = false
}

function BreakOff(fromJsbRoutine) {
    var myProcess;
    if (fromJsbRoutine) myProcess = fromJsbRoutine._activeProcess; else myProcess = activeProcess;
    myProcess.TclProhibited = true
}

function backBrowserBtn() {
    var thisProcess = activeProcess;

    if (thisProcess && thisProcess.isTCL) return tclHistoryPrevious();

    if (Len(hashChanges)) {
        var backLocation = hashChanges.pop() // our previous location
        doingBackBtn = true
        return new windowOpen(backLocation)
    }

    // not running
    return jsbCloseWindow(false)
}

function doDocumentReady() {
    if (!doDocReady) return;

    if (window.onDocTimer) { clearTimeout(onDocTimer); onDocTimer = null }

    window.onDocTimer = setTimeout(function () {
        onDocTimer = null;
        doDocReady = false;

        jsbDocumentIsReady()
    }, 100);
}

function rebindKnockout(waitTime) {
    if (window.lastKOReady) { clearTimeout(lastKOReady); lastKOReady = null }
    if (!waitTime) waitTime = 50;

    window.lastKOReady = setTimeout(function () {
        lastKOReady = null

        if ($("#jsb").data("alreadyAppliedBindings")) {
            window.ko.cleanNode($("#jsb")[0]);
            if (window.lastKOReady) { clearTimeout(lastKOReady); lastKOReady = null }
        }

        ko.applyBindings(koModel, $("#jsb")[0]);
        $("#jsb").data("alreadyAppliedBindings", true);
    }, waitTime);
}


function jsbCloseWindow(okToExit) {
    if (inIframe()) {
        jsbLocation = "close_html";
        try {
            window.location = jsbLocation; // This needs to be location not hash, as we need an iframe load event to fire
        } catch (err) { };

    } else {
        if (!closeAPopUpDialog()) {
            var oldJsb = jsb
            var closeAdr = jsbLocation;

            if (!stackedWindows.length) {

                if (isPhoneGap()) {
                    if (window.PGMultiView) PGMultiView.dismissView(); else if (okToExit) navigator.app.exitApp();

                } else {
                    if (okToExit) {
                        try {
                            window.close();
                        } catch (err) { }
                    }
                }
            } else {

                do {
                    if (stackedWindows.length) unstackWindow();
                    jsbLocation = closeAdr;
                    if (closeAPopUpDialog()) return;
                } while (stackedWindows.length && oldJsb === jsb)
            }
        }
    }
    return null; // cause removal of process from runq
}

function err2String(err, isFatalError) {
    var errMsg = '';
    if (!err) err = 'unknown error';

    if (dotNetObj && InStr(err.message, "System.Exception: **") != -1) err = Field(Field(err.message, "System.Exception: **", 2), crlf, 1)
    if (isString(err)) errMsg += err;
    else if (err.message) errMsg += Change(err.message, lf, crlf);
    else if (err.description) errMsg += Change(err.description, lf, crlf);
    else if (err.name) errMsg += err.name;
    else if (err.number) errMsg += err.number;
    if (err.stack) errMsg += "---" + crlf + Change(err.stack, lf, crlf);

    if (isFatalError) showStatus(errMsg, '', isFatalError)
    return errMsg
}

function onLine() {
    if (!window.navigator) return false;

    if (!isPhoneGap()) return window.navigator.onLine;

    // valid types: bluethooth, cellular, ethernet, none, wifi, wimax, other, unknown
    return navigator.connection.type != 'none'
}

if (isPhoneGap() && !window.delayReady && window.addEventListener) document.addEventListener("deviceready", async () => await onDeviceReady(), false);
if (!window.delayReady) $(document).ready(async () => await onDocumentReady());

async function onDocumentReady() {
    if (docIsReady) return;
    docIsReady = true

    if (isPhoneGap()) {
        if (deviceIsReady) await jsbInitialize()
    } else {
        await jsbInitialize();
    }
}

async function onDeviceReady() {
    if (deviceIsReady) return;
    deviceIsReady = true;

    if (isPhoneGap()) {
        if (docIsReady) await jsbInitialize()
    } else {
        await jsbInitialize();
    }
}

function htaLogTo(accountName) { return LogTo(accountName) }

// If successful, we don't return from here
function Logto(accountName, noThrow) {

    if (!initDotNetAdo(accountName, true)) return false;

    validOpens = {}
    notValidOpens = {}
    fHandleSystem = null
    fHandleCache = null
    fHandleMD = null
    deletedIDS = []
    stackedWindows = []
    At_Account = accountName
    Commons_JSB_BF = {}
    Commons_JSB_HTML = {}
    Commons_JSB_MDL = {}
    Commons_JSB_CTLS = {}
    Commons_JSB_ODB = {}
    Commons_JSB_THEMES = {}
    Commons_JSB_TCL = {}

    unloadDynamicScripts();

    At_Session.Item("lastLogTo", accountName);
    window.saveAtSession()

    if (!noThrow) throw "*REDIRECT*TCL";
    return true;
}

async function jsbInitialize(startPgm) {
    if (!$.browser) $.browser = { msie: false }

    main_VT100 = new VT100('body')

    // Bug with phonegap that filesystem isn't always ready right away
    while (isPhoneGap() & !window.requestFileSystem) { asyncSleep(1) }

    window.null = null; // So CSPC programs can get real null

    if (dotNetObj) {
        initDotNetAdo(window.dbName, false);
        At_Request.URL = myLocation();
    }

    if (window.doNotUseFileSystem) tryFileSystem = false; else tryFileSystem = !dotNetObj;

    // use last path segment as account name for browser version
    if (!isPhoneGap() && Right(window.location.href, 1) != "/" && !dotNetObj) {
        At_Account = window.location.href;
        At_Account = Field(Field(At_Account, "/", DCount(At_Account, "/")), ".", 1) // pull account from .html filename
        if (At_Account = "tcl") At_Account = "jsb";
    }

    At_Request.URL = myLocation()

    $('#jsbAdminBar').append('Version ' + myVersion);
    if (isMobile()) $('#jsbAdminBar').css('overflow-x', 'auto')
    $('#jsbAdminBar').css('z-index', 0)
    $('#jsbAdminBar').css('z-index', nextZIndex())

    // We save and restore @Session between pages
    getAtSession()

    // At_Session names are all lower case
    delete At_Session["rpc_cached_logins"];
    delete At_Session["rpc_last_address"];
    delete At_Session["rpc_cached_items"];
    delete At_Session["rpc_cached_timer"];
    delete At_Session["cachedaccounts"];
    delete At_Session["last_rpc_address"];
    delete At_Session["rpc_cached_opens"];

    if (window.location.href.indexOf("#resetdb") != -1) {
        if (!confirm('reset localStorage?')) {
            window.location = Field(window.location.href, "#", 1)
            return;
        } else {
            localStorage.clear();
            window.location = Field(window.location.href, "#", 1)
            return;
        }
    }

    // check if we start in log mode (shows call returns to the console window)
    var l = LCase(myLocation());
    window.singleStepping = window.singleStepping || l.indexOf("(!") != -1 || l.indexOf("#dodebug") != -1 || l.indexOf("#!") != -1;

    // record initial location
    jsbLocation = window.location.href;

    window.onhashchange = onHashChange

    $(window).bind('beforeunload', function (e) {
        window.isClosed = true;
        jsbLocation = window.location.href;
    }
    );

    // capture / trap all links (anchors)
    $('form').on('click', 'a', function (event) {
        var url = $(this).attr('href');

        if (!url || (url + "").startsWith('#')) return;
        preventTheDefault(event);

        var target = $(this).attr('target')
        if (!target) target = "_blank";

        saveAtSession()

        return new windowOpen(url, target)
    });

    // For older versions of IE
    if (window.FileReader && FileReader.prototype.readAsBinaryString === undefined) {
        FileReader.prototype.readAsBinaryString = function (fileData) {
            var binary = "";
            var pt = this;
            var reader = new FileReader();
            reader.onload = function (e) {
                var bytes = new Uint8Array(reader.result);
                var length = bytes.byteLength;
                for (var i = 0; i < length; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                //pt.result  - readonly so assign content to another property
                pt.content = binary;
                $(pt).trigger('onload');
            }
            reader.readAsArrayBuffer(fileData);
        }
    }

    if (isPhoneGap() && notPhoneGapBrowser()) {
        document.addEventListener("pause", function () {
            runningInBackground = true
        }, false);
        document.addEventListener("resume", function () {
            runningInBackground = false
        }, false);


        document.addEventListener("backbutton", backBrowserBtn, false)

        if (window.mayflower && !inIframe()) {
            try {
                mayflower.AndroidScrollbar.toggleVerticalScrollbarVisibility(true);
            } catch (err) {
                alert("mayflower failed")
                debugger
            }
        }

        if (hasCordovaPlugIn("Keyboard")) {
            $('#jsb').on("blur", '#txtInput', function () {
                cordova.plugins.Keyboard.close()
            })
            $('#jsb').on("focus", '#txtInput', function () {
                cordova.plugins.Keyboard.show()
            })
        }

        window.hasEmailSupport = hasCordovaPlugIn("email");

        if (window.PGMultiView) setTimeout(function () { PGMultiView.getMessage(function () { pgMultiviewChild = true }, function () { pgMultiviewChild = false }) }, 800);
    }

    // fix menu dropdowns to close when touching outside
    $(document).on("touchend", function () {
        if (!$(event.srcElement).parents('nav').length) {
            $(".dropdown.open").removeClass("open").find(".dropdown-toggle").attr('aria-expanded', false);
        }
    });

    fixJQuery()

    window.checkConsoleOpen = function () {
        debugConsoleOpen = (window.outerHeight - window.innerHeight) > 600 || (window.outerWidth - window.innerWidth) > 600
    }

    $(window).resize(checkConsoleOpen);
    checkConsoleOpen()

    GlobalTester.before(window);

    if (dotNetObj) {
        // Make sure we are at our previous account
        var previousAccount = At_Session.Item("lastLogTo");
        if (previousAccount && previousAccount != window.dbName) Logto(previousAccount, true);
    }

    if (server_rpcsid) {
        At_Session.Item('server_rpcsid', server_rpcsid)
        SetCookie("At_Session", At_Session)
    } else {
        server_rpcsid = At_Session.Item('server_rpcsid');
        if (server_rpcsid == "undefined") server_rpcsid = "";
    }

    activeProcess = new Process({ isTCL: false, isEXECUTE: false }, "");

    // Start JSB RUNNING
    if (startPgm) await startPgm(); else await JSB_TCL_TCL_Pgm();
};

function onHashChange(e) {
    if (jsbIgnoreHashChanges || ignoreOnlyOneHashChange) {
        ignoreOnlyOneHashChange = false;
        return;
    }

    // jsbLocation where we are coming from
    // window.location.href is where we are going

    if (doingBackBtn) doingBackBtn = false; else hashChanges.push(jsbLocation) // Save where we were, so we can get back

    var myLoc = myLocation()
    var i = InStr(myLoc, "?")
    if (i == -1) i = InStr(myLoc, "&");
    if (i == -1) myLoc = '';
    At_Request.queryString = At_Request.querystring = At_Request.QUERYSTRING = At_Request.QueryString = Mid(myLoc, i + 1)

    if (checkUrlForClose(jsbLocation)) {
        while (stackedWindows.length && $('#popOutDIV').length == 0) unstackWindow();
        jsbLocation = window.location.href
        if ($('#popOutDIV').length) return jsbCloseWindow()
    }

    ClearScreen();

    throw "*HASH*" + window.location.href;
}


function ExecuteDOS(s) {
    if (!dotNetObj) throw new Error('ExecuteDOS not supported');
    if (!isString(s)) s = CStr(s);
    var results = dotNetObj.dnoExecuteDOS(s) + "";
    if (results.startsWith("**")) throw new Error(Mid(results, 2));
    return results
}

function hasCordovaPlugIn(name) {
    if (!window.cordova) return false;
    if (!cordova.plugins) return false;
    if (!cordova.plugins[name]) return false;
    return true
}

function getAtSession() {
    // We save and restore @Session between pages
    var s = GetCookie("At_Session");
    if (s) {
        var ifunc = At_Session.Item
        s = Change(s, '[null,', '[undefined,')
        s = Change(s, '[null],', '[undefined],')

        At_Session = parseJSON(s, {});
        At_Session.Item = ifunc;
    } else {
        At_Session.Item('UserName', 'Admin')
        At_Session.Item('IsAdmin', true)
    }
    var s = GetCookie("BreakPoints")
    if (s) bkPnts = parseJSON(s, null); else bkPnts = null;
}

// If you use putResultInCtlOrID:
//     Your URL should close with /close_html?result=NEWVALUE
//     Your html code should have 1st INPUT as the answer.
//     If you omit a title, OK and CANCEL buttons will be added
//
//     await popoutWindow('', 'Do you want to continue?', 0, 0, function (dftAns) { Alert('you choose ' + dftAns) } )
//
//
// PopoutWindow will attempt to use an IFRAME, verses popoutDialog which only uses a jQuery Dialog and accepts only HTML
//
async function popoutWindow(title, URL, width, height, onCloseSubmitOrFunction, putResultInCtlOrID) {
    var myResolve, myDialog;
    var priorIFrame = $('#popOutID');
    var popoutPromise = new Promise(resolve => myResolve = resolve);

    function exit(answer) {
        FlushHTML();

        // restore any prior iFrame
        $(priorIFrame).attr("id", "popOutID");

        if (isFunction(onCloseSubmitOrFunction)) {
            onCloseSubmitOrFunction(answer)

        } else if (onCloseSubmitOrFunction) {
            main_VT100.doJsbSubmit(false);
        }
        myResolve(answer);
    }

    // force all HTML text to use jQuery dialog instead of an IFRAME
    if (!isUrl(URL)) {
        popoutDialog(title, URL /* HTML */, width, height, exit, putResultInCtlOrID);
        return popoutPromise;
    }

    // Fake local URL calls
    if (targetIsLocal(URL)) {
        return await popoutTclCommand(title, URL, width, height, exit, putResultInCtlOrID)
    }

    // Phonegap uses InAppBrowser, as it's doesn't support IFRAME's
    if (isPhoneGap()) {
        var child = cordova.InAppBrowser.open(URL, '_blank', 'hardwareback=yes,location=yes,disallowoverscroll=yes');
        child.addEventListener('exit', () => exit(getFirstUrlArg(myLocation(child))));

    } else {

        // Create and load the IFRAME

        var iFrame = $('<iframe id="popOutID" frameborder="0" application="yes" sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms allow-top-navigation" marginwidth="0" marginheight="0" style="position: absolute; background-color: transparent; width: 100%; height: 100%; border: 0; padding: 0; margin: 0"><i><small>' + htmlEscape(URL) + '<small></i></iframe>'); // sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms allow-top-navigation" 
        $(priorIFrame).attr("id", "");
        $(iFrame).load(
            // We will wait for a load event, then check the url for parameters
            function (e) {
                // find my iFrame
                var myIFrame = window['popOutID'];
                if (e && e.currentTarget) myIFrame == e.currentTarget;

                // what address do we have now?
                if (!myIFrame || !myIFrame.contentDocument || !myIFrame.contentDocument.location || !myIFrame.contentDocument.location.host) return;
                var adr = myLocation(myIFrame);

                if (checkUrlForClose(adr)) {
                    var answer = getFirstUrlArg(adr);
                    myDialog.jsbLocation = answer;
                    myDialog.answer = answer; // to be passed to exit(myDialog.answer)
                    myDialog.dialog('close');
                    exit(answer)
                }
            }
        );

        // show the iframe in a dialog
        var myDialog = popoutDialog(title, iFrame /* HTML */, width, height, async function () { exit(myDialog.answer) }, putResultInCtlOrID)
        myDialog.answer = esc;

        // force the IFrame to load
        URL = fullUrlPath(URL);
        $(iFrame).attr('src', URL);

        var myIFrame = window['popOutID']

        var oldName = myIFrame.name;
        var oldSrc = myIFrame.src;

        var checkName = function () {
            var adr = myIFrame.src;
            if (adr != oldSrc) {
                oldSrc = adr;

                if (checkUrlForClose(adr)) {
                    clearInterval(IntervalID);
                    var answer = getFirstUrlArg(adr);
                    myDialog.jsbLocation = answer;
                    myDialog.answer = answer; // to be passed to exit(myDialog.answer)
                    myDialog.dialog('close');
                    exit(answer)
                }
            }
        }

        var IntervalID = setInterval(checkName, 500);
    }

    return popoutPromise;
}

async function popoutTclCommand(title, tclCmd, width, height, onCloseSubmitOrFunction, putResultInCtlOrID) {
    // We do a stackWindow to insure no more JSB routines run while we are running
    var stackLevel = stackWindow('body');
    var cmds = urlSentence(tclCmd);

    // Build tcl command
    var holdJsbLocation = jsbLocation;

    var dialogIsClosed = false;
    var doResolve = true;

    return new Promise(async (resolve, reject) => {

        function successfulRun() {
            if (!doResolve) return;

            unstackWindow(stackLevel, true);

            if (putResultInCtlOrID) storeVal(putResultInCtlOrID, myDialog.answer)

            if (isFunction(onCloseSubmitOrFunction)) {
                onCloseSubmitOrFunction(myDialog.answer)

            } else if (onCloseSubmitOrFunction) {
                main_VT100.doJsbSubmit(false);
            }

            resolve();
            doResolve = false;
        }

        function closeDialog() {
            dialogIsClosed = true;
            return successfulRun();
        }

        jsbLocation = cmds.url; // set new location
        var myDialog = popoutDialog(title, cmds.url, width, height, closeDialog);

        await asyncTclExecute(cmds.tclCmd);

        if (dialogIsClosed) {
            successfulRun();

        } else {
            if (checkUrlForClose(jsbLocation)) myDialog.dialog('close')
        }
    });
}

function checkUrlForClose(adr) {
    adr = LCase(adr)
    if (adr == "close_html") return true;

    var ci = InStr(0, adr, "/close_html");
    if (ci == -1) ci = InStr(0, adr, "#close_html");
    if (ci == -1) ci = InStr(0, adr, "?close_html");
    return (ci > 0);
}

function getFirstUrlArg(adr) {
    var ri = InStr(0, adr, "="); // take first argument as answer
    if (ri > 0) return unescape(Mid(adr, ri + 1));
    return esc;
}

//////////////////////////////////////////////// Function Profiling ////////////////////////////////////////////////
var profiling = null

function showProfile() {
    if (!window.profiling) {
        window.profiling = {}
        alert('profiling enabled')
        return "";
    } else {
        var d = $("#jsbProfilePop")
        if (!d.length) d = $("<div id='jsbProfilePop' class='jsbPopDialog'></div>").appendTo('body').dialog({ title: 'Execution Profile' });
        $(d).html(profilePage())
        $(d).dialog({ width: 'auto', height: 'auto' })
        if ($(d).width() > $('body').width()) $(d).dialog({ width: $('body').width() })
    }
}

function closeProfile() {
    var d = $("#jsbProfilePop")
    if (d.length) $(d).dialog('close');
    window.profiling = false;
}


function profilePage(linecnt) {
    if (!linecnt) linecnt = 3000;

    var display = [];
    display.push("<div>")
    display.push("<button onclick='window.profiling = {}; closeProfile();'>Stop</button>")
    display.push("<button onclick='updateProfile(" + linecnt + ");'>Reload</button>")
    display.push("<div id='jsbProfile'>")
    display.push(updateProfile(linecnt))
    display.push("</div>")
    display.push("</div>")
    display = Join(display, crlf)
    return display;
}

function addProfileLine(functionName) {
    if (window.profiling) {
        var prec = profiling[functionName]
        if (!prec) {
            prec = { count: 0, mstime: 99999 }
            profiling[functionName] = prec;
        }

        prec.count += 1;
    }
}

function updateProfile(linecnt) {
    var d = $("#jsbProfile")

    var display = [];
    display.push("<table id='profile' style='font-family: monospace; color: darkblue !important; background-color: lightblue !important'>")
    display.push("<col align='left' /><col align='right' /><col align='right' /><col align='right' />");
    display.push("<tr><td>FUNCTION</td><td align='right'>&nbsp;INVOCATIONS</td><td align='right'>&nbsp;MILLISECONDS</td><td align='right'>&nbsp;AVERAGE</td></tr>");

    var results = []

    for (var subName in window.profiling) {
        var rec = window.profiling[subName];
        if (rec.mstime) {
            results.push({ name: subName, mstime: rec.mstime, count: rec.count })
        }
    }

    results = Sort(results, "#<mstime"); // numeric descending

    for (var i = 0; i < results.length && i < linecnt; i++) {
        var rec = results[i]
        var time = results[i].mstime;
        var avg = ""
        var cnt = results[i].count;
        if (cnt) avg = CInt(time / cnt * 100) / 100
        display.push("<tr><td>" + htmlEscape(results[i].name) + "</td><td align='right'>" + cnt + "</td><td align='right'>" + time + "</td><td align='right'>" + avg + "</td></tr>");
    }
    display.push("</table>")
    display = Join(display, crlf);

    if (d) $(d).html(display)
    return display
}

//////////////////////////////////////////////// Network Profiling ////////////////////////////////////////////////
window.networkingTrace = null

function closeNetwork() {
    var d = $("#jsbNetworkPop")
    if (d.length) $(d).dialog('close');
    window.networkingTrace = false
}

function showNetwork() {
    if (!window.networkingTrace) {
        window.networkingTrace = {}
        alert('networkingTrace enabled')
    } else {
        var d = $("#jsbNetworkPop")
        if (!d.length) d = $("<div id='jsbNetworkPop' class='jsbPopDialog'></div>").appendTo('body').dialog({ title: 'Network Profile' });
        $(d).html(networkPage())
        $(d).dialog({ width: 'auto', height: 'auto' });
        if ($(d).width() > $('body').width()) $(d).dialog({ width: $('body').width() })
    }
}

function networkPage(linecnt) {
    if (!linecnt) linecnt = 3000;

    var display = [];
    display.push("<div>")
    display.push("<button onclick='window.networkingTrace = {}; closeNetwork();'>Stop</button>")
    display.push("<button onclick='updateNetwork(" + linecnt + ");'>Reload</button>")
    display.push("<div id='jsbNetwork'>")
    display.push(updateNetwork(linecnt))
    display.push("</div>")
    display.push("</div>")
    display = Join(display, crlf)
    return display;
}

function addNetworkLine(functionName) {
    if (window.networkingTrace) {
        var prec = networkingTrace[functionName]
        if (!prec) {
            prec = { count: 0, mstime: 99999 }
            networkingTrace[functionName] = prec;
        }

        prec.count += 1;
    }
}

function updateNetwork(linecnt) {
    var d = $("#jsbNetwork")

    var display = [];
    display.push("<table id='network' style='font-family: monospace; color: darkblue !important; background-color: lightblue !important'>")
    display.push("<tr><td>URL</td><td align='right'>&nbsp;INVOCATIONS</td><td align='right'>&nbsp;MILLISECONDS</td><td align='right'>&nbsp;AVERAGE</td></tr>");

    var results = []

    for (var url in window.networkingTrace) {
        var rec = window.networkingTrace[url];
        if (rec.mstime) {
            results.push({ name: url, mstime: rec.mstime, count: rec.count })
        }
    }

    results = Sort(results, "#<mstime"); // numeric descending

    for (var i = 0; i < results.length && i < linecnt; i++) {
        var rec = results[i]
        var time = results[i].mstime;
        var avg = ""
        var cnt = results[i].count;
        if (cnt) avg = CInt(time / cnt * 100) / 100
        display.push("<tr><td><div style='max-width: 600px; overflow: auto; white-space: nowrap;'>" + htmlEscape(results[i].name) + "</div></td><td align='right'>" + cnt + "</td><td align='right'>" + time + "</td><td align='right'>" + avg + "</td></tr>");
    }
    display.push("</table>")
    display = Join(display, crlf);

    if (d) $(d).html(display)
    return display
}

var hideOverlayTimer = null;

function showOverlay(withText) {
    if (hideOverlayTimer) {
        clearTimeout(hideOverlayTimer);
        if (withText) $('#overlay').html(withText);
    } else {
        if (!withText) withText = "";
        $("#jsb").append('<div id="overlay" style="z-index:' + nextZIndex() + '">' + withText + '</div>');
    }
}

function removeOverlay() {
    hideOverlayTimer = setTimeout(function () {
        $("#jsb").find('#overlay').remove();
    }, 150);
}

function startNetworkingTrace(url, msg) {
    if (window.networkingTrace) {
        var prec = networkingTrace[url];
        if (!prec) prec = networkingTrace[url] = { "count": 0, "mstime": 0 }
        prec.lastIn = Timer()
        prec.count++;
    }

    var sbVisible = $("#statusBar").is(":Visible");
    if (sbVisible) showStatus(url);

    showOverlay(msg);
}

function stopNetworkingTrace(url, result) {
    if (window.networkingTrace) {
        var prec = networkingTrace[url]
        if (prec && prec.lastIn) {
            prec.mstime += (Timer() - prec.lastIn)
            prec.lastIn = 0;
            prec.result = result;
        }
    }
    removeOverlay();
}

//////////////////////////////////////////////// FileSystem Profiling ////////////////////////////////////////////////
window.fileSystemTrace = null

function showFileSystem() {
    if (!window.fileSystemTrace) {
        window.fileSystemTrace = {}
        alert('File System Trace enabled')
    } else {
        var d = $("#jsbFileSystemPop");
        if (!d.length) d = $("<div id='jsbFileSystemPop' class='jsbPopDialog'></div>").appendTo('body').dialog({ title: 'File System Profile' });
        $(d).html(fileSystemPage())
        $(d).dialog({ width: 'auto', height: 'auto' });
        if ($(d).width() > $('body').width()) $(d).dialog({ width: $('body').width() })
    }
}

function closeFileSystemPage() {
    window.fileSystemTrace = {};
    $('#jsbFileSystemPop').dialog('close');
    window.fileSystemTrace = false;
}

function fileSystemPage(linecnt) {
    if (!linecnt) linecnt = 3000;

    var display = [];
    display.push("<div>")
    display.push("<button onclick='closeFileSystemPage()'>Stop</button>")
    display.push("<button onclick='updateFileSystem(" + linecnt + ");'>Reload</button>")
    display.push("<div id='jsbFileSystem'>")
    display.push(updateFileSystem(linecnt))
    display.push("</div>")
    display.push("<div>")
    display = Join(display, crlf)
    return display;
}

function addFileSystemLine(functionName) {
    if (window.fileSystemTrace) {
        var prec = fileSystemTrace[functionName]
        if (!prec) {
            prec = { count: 0, mstime: 99999 }
            fileSystemTrace[functionName] = prec;
        }

        prec.count += 1;
    }
}

function updateFileSystem(linecnt) {
    var d = $("#jsbFileSystem")

    var display = [];
    display.push("<table id='fileSystem' style='font-family: monospace; color: darkblue !important; background-color: lightblue !important'>")
    display.push("<tr><td>Path</td><td align='right'>&nbsp;INVOCATIONS</td><td align='right'>&nbsp;MILLISECONDS</td><td align='right'>&nbsp;AVERAGE</td></tr>");

    var results = []

    for (var path in window.fileSystemTrace) {
        var rec = window.fileSystemTrace[path];
        if (rec.mstime) {
            results.push({ name: path, mstime: rec.mstime, count: rec.count })
        }
    }

    results = Sort(results, "#<mstime"); // numeric descending

    for (var i = 0; i < results.length && i < linecnt; i++) {
        var rec = results[i]
        var time = results[i].mstime;
        var avg = ""
        var cnt = results[i].count;
        if (cnt) avg = CInt(time / cnt * 100) / 100
        display.push("<tr><td><div style='max-width: 600px; min-width: 300px; overflow: auto; white-space: nowrap;'>" + htmlEscape(results[i].name) + "</div></td><td align='right'>" + cnt + "</td><td align='right'>" + time + "</td><td align='right'>" + avg + "</td></tr>");
    }
    display.push("</table>")
    display = Join(display, crlf);

    if (d) $(d).html(display)
    return display
}

function startFileSystemingTrace(path) {
    if (window.fileSystemTrace) {
        var prec = fileSystemTrace[path];
        if (prec) {
            var a = true
        } else {
            prec = fileSystemTrace[path] = { "count": 0, "mstime": 0 }
        }
        prec.lastIn = Timer()
        prec.count++;

        consoleLog(path)
    }
}

function stopFileSystemingTrace(path, result) {
    if (window.fileSystemTrace) {
        var prec = fileSystemTrace[path]
        if (prec && prec.lastIn) {
            prec.mstime += (Timer() - prec.lastIn)
            prec.lastIn = 0;
            prec.result = result;
        }
    }
}


//////////////////////////////////////////////// Globals Profiling ////////////////////////////////////////////////
var recordingGlobals = false

function showGlobals() {
    if (!window.recordingGlobals) {
        window.newGlobalsHtml = []
        recordingGlobals = true
        alert('recordingGlobals enabled')
        return "";
    } else {
        var d = $("#jsbGlobalsPop")
        if (!d.length) d = $("<div id='jsbGlobalsPop' class='jsbPopDialog'></div>").appendTo('body').dialog({ title: 'Execution Globals' });
        $(d).html(GlobalsPage())
        $(d).dialog({ width: 'auto', height: 'auto' })
        if ($(d).width() > $('body').width()) $(d).dialog({ width: $('body').width() })
    }
}

function checkForNewGlobals(activeRoutine) {
    var newGlobals = GlobalTester.after(window);
    var state = activeRoutine._state;
    if (state.startsWith("attempted")) state = "After function return";

    for (var field in newGlobals) {
        newGlobalsHtml.push("<tr><td>" + htmlEscape(field) + "</td><td>" + htmlEscape(activeRoutine._fileName + ' ' + activeRoutine._itemName) + "</td><td>" + htmlEscape(state) + "</td></tr>");
    }
}

function closeGlobals() {
    var d = $("#jsbGlobalsPop")
    if (d.length) $(d).dialog('close');
    window.recordingGlobals = false
}

function GlobalsPage(linecnt) {
    if (!linecnt) linecnt = 3000;

    var display = [];
    display.push("<div>")
    display.push("   <button onclick='window.newGlobalsHtml = []; closeGlobals();'>Stop</button>")
    display.push("   <button onclick='updateGlobals();'>Reload</button>")
    display.push("   <div id='jsbGlobals'>")
    display.push(updateGlobals())
    display.push("   </div>")
    display.push("</div>")
    display = Join(display, crlf)
    return display;
}

function updateGlobals() {
    var d = $("#jsbGlobals")

    var html = [];
    html.push("<table id='Globals' style='font-family: monospace; color: darkblue !important; background-color: lightblue !important'>")
    html.push("<col align='left' /><col align='left' />");
    html.push("<tr><td>&nbsp;New Global</td><td>FUNCTION</td><td>&nbsp;State</td></tr>");
    html = Join(html, crlf);
    html += newGlobalsHtml
    html += "</table>"

    $(d).html(html)
    return html
}

var GlobalTester = (function () {
    var fields = {};
    var before = function (w) {
        for (var field in w) {
            fields[field] = true;
        };
    };

    var after = function (w) {
        var results = {}

        for (var field in w) {
            if (!fields[field]) {
                var L8 = Left(field, 8);
                fields[field] = true;
                if (L8 != "Commons_" && L8 != "Equates_" && !isFunction(window[field])) {
                    results[field] = true;
                }
            }
        };

        return results;
    };
    return {
        before: before,
        after: after
    };
}());

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function userno() {
    if (window.At_Request) return window.At_Request.UserNo;
}

function isAdmin() {
    if (!window.At_Session) return false;
    var info = At_Session.Item(userno())
    if (info) return info.IsAdmin
}

function makeAdmin() {
    if (!window.At_Request.UserNo) window.At_Request.UserNo = 'inline';
    var userNo = LCase(userno())
    if (!At_Session[userNo]) At_Session[userNo] = {}
    At_Session[userNo].IsAdmin = true;
    At_Session[userNo].IsAuthenticated = true;
    At_Session[userNo].UserName = 'admin';
}


async function fatalError(errActiveRoutine) {
    var myProcess = errActiveRoutine._activeProcess;
    var errMessage = myProcess.At_Errors

    // Flush what we can
    try {
        main_VT100.doingCapture = 0;
        myProcess.At_Errors = errMessage
        FlushHTML();
    } catch (err2) { }

    var errMsg = Field(errMessage, crlf, 1)
    var errHttp = dropLeft(errMessage, crlf) + crlf + "Call stack: " + Join(callStack(), "<-")

    var Questions = ""
    if (!isAdmin() && window.hasEmailSupport) Questions = "*E-Mail support"
    Questions += ",*End"
    if (isAdmin()) Questions += ",Reload Page"; else Questions += ",Reload Page"
    Questions += ",Ignore"
    if (isAdmin()) Questions += ",Debug";

    var Msg = "We have a runtime error.  What do you want to do?" + crlf + crlf + errMsg;
    Msg = "<span>" + htmlEscape(Msg, true) + "</span>" + crlf + crlf + errHttp;

    spinnerCnt = 0;
    hideSpinner()

    MsgBox("RUNTIME ERROR", Msg, Questions, "auto", "auto", function (ans) {

        if (ans == "E-Mail support") {
            var emailTo = "randynwalsh@gmail.com"
            var emailSubject = 'json basic runtime error'
            var emailBody = "<br />" + errMessage
            sendEMail('', emailTo, '', '', emailSubject, emailBody)
            return

        } else if (ans == "Debug") {
            if (!isIE()) debugger;
            makeAdmin()
            gotoDebugger(errActiveRoutine)
            return

        } else if (ans == "Reload Page") {
            return window.location.reload();

        } else if (ans == "Ignore") {
            return

        }

        // End - only can get here if we have errActiveRoutine
        At_Server.End(errActiveRoutine)
    })
}


// get the url (page) extension (.htm, html)
function pageExtension() {
    return fieldIfRight(Right(LCase(Field(Field(window.location.href, "#", 1), "?", 1)), 5), ".")
}

function getExtension(path) {
    path = fieldRight(path, "/");
    path = fieldRight(path, "\\");
    return fieldIfRight(path, ".")
}

function isWebPage(url) {
    url = Field(Field(url, "#", 1), "?", 1);
    var Ext = getExtension(url);
    return Ext == 'htm' || Ext == 'html' || Ext == 'hta' || Ext == 'aspx';
}

// The domain of where our page came from
function jsbRoot() {
    var url = Field(Field(window.location.href, "#", 1), "?", 1)
    if (Count(url, "/") > 3 && !isWebPage(url)) url = dropRight(url, "/"); // the right most arg is a TCL command
    url = dropRight(url, "/"); // the next is the account
    return url + "/"; // what is left is the root
}

function jsbRootAccount() {
    var url = Field(Field(window.location.href, "#", 1), "?", 1)
    if (Count(url, "/") > 3 && !isWebPage(url)) url = dropRight(url, "/"); // the right most arg is a TCL command
    return url + "/"; // what is left is the rootact
}

function jsbRootAct(useRelitivePath) {
    var rootAct = jsbRootAccount();
    if (useRelitivePath) { 
        var jsbroot = jsbRoot();
        if (rootAct.startsWith(jsbroot)) rootAct = rootAct.substr(jsbroot.length - 1);
    }
    return rootAct;
}
function JsbRootAct() { return jsbRootAct() }


// I made the status bar show different colored backgrounds as each status appears - makes it easier to read
var pastStatus = []
var statusColorI = 0;
var statusColors = ["aliceblue", "aquamarine", "beige", "blanchedalmond", "burlywood", "cadetblue", "chartreuse", "coral",
    "cornflowerblue", "cornsilk", "cyan", "deepskyblue", "gainsboro",
    "gold", "goldenrod", "greenyellow", "honeydew", "hotpink", "ivory", "khaki", "lavender",
    "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgreen", "lightgrey", "lightpink", "lightsalmon",
    "lightseagreen", "lightskyblue", "lisghtsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "mediumaquamarine",
    "mediumpurple", "mediumseagreen", "mediumspringgreen", "mediumturquoise",
    "mintcream", "mistyrose", "moccasin", "navyblue", "oldlace", "olivedrab", "orange", "orangered", "orchid",
    "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue",
    "rosybrown", "salmon", "sandybrown", "seagreen", "seashell", "silver", "skyblue", "slateblue",
    "springgreen", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "yellow", "yellowgreen"
]

function asyncRpcShowStatus(txt) {
    showStatus(txt)
}

// Call to put up a status
function showStatus(txt, html, isFatalError) {
    if (!txt) txt = ''; else txt = htmlEscape(txt)
    if (html) html = txt + html; else html = txt;

    if (html) {
        pastStatus.unshift("<span style='background-color: " + statusColors[statusColorI] + "'>" + html + "</span>");
        statusColorI += 1
        if (statusColorI >= statusColors.length) statusColorI = 0;
    }

    while (pastStatus.length > 50) pastStatus.splice(49, 9);

    if (!statusBar) statusBar = $("#statusBar");
    $(statusBar).html(Join(pastStatus, "<<"));
    if ($('#jsbAdminBar').is(":Visible") || isFatalError) showStatusBar();

    // already visible, not showing errors, or in capture?
    if (main_VT100.doingCapture || !isFatalError) return;

    // Allow debugger break here
    if (!isIE()) debugger;

    Alert(htmlDecode(html));
}

// call to hide the status bar
var dontShowStatusBar = false;
function hideStatusBar(forever) {
    $("#statusBar").hide()
    var topDiv = $('body').find('.jsb:visible:first');
    $(topDiv).css("padding-bottom", "");
    if (forever) dontShowStatusBar = true;
}


// Call  to put up a status
function showStatusBar() {
    if (dontShowStatusBar) return;

    $("#statusBar").show();
    var topDiv = $('body').find('.jsb:visible:first');
    $(topDiv).css("padding-bottom", $("#statusBar").height());
}


// Call to hide/show the status bar (will clear the status bar on hiding too)
function toggleStatusBar() {
    if ($(statusBar).is(":Visible")) clearStatus(); else showStatusBar();
}

var neverShowAdminBar = false;

function showAdminBar() {
    if (neverShowAdminBar) return;

    var topDiv = $('body').find('.jsb:visible:first');

    $('#jsbAdminBar').show()
    $(topDiv).css("top", "23px")
    $(topDiv).css("bottom", "0px")
    $(topDiv).css("min-height", "")
    $(topDiv).css("height", "")
}

function hideAdminBar(forever) {
    $('#jsbAdminBar').hide()
    var topDiv = $('body').find('.jsb:visible:first');

    $(topDiv).css("top", "0")
    $(topDiv).css("bottom", "")
    $(topDiv).css("height", "100%")
    if (forever) neverShowAdminBar = true;
}

function clearStatus() {
    pastStatus = [];
    hideStatusBar();
}

// Get the data from an html uploadbox (see file HTML item UPLOADBOX)
function formFile(fromJsbRoutine, ID, callback) {
    var myProcess = fromJsbRoutine._activeProcess;

    var inputElement = $("#" + ID)
    if (inputElement.length == 0) return null; // Not found
    var file = $(inputElement)[0].files[0]

    var reader = new FileReader()
    ret = []
    reader.onload = function (e) {
        var result = e.target.result
        return callback(result)
    }
    reader.onerror = function (e) {
        myProcess.At_Errors = e.getMessage()
        return callback(null)
    }

    reader.readAsBinaryString(file) // was readAsText
    return
}


/*
    https://www.npmjs.com/package/cordova-plugin-email#examples
    
    cordova.plugins.email.open({
        to:          Array, // email addresses for TO field 
        cc:          Array, // email addresses for CC field 
        bcc:         Array, // email addresses for BCC field 
        attachments: Array, // file paths or base64 data streams 
        subject:    String, // subject of the email 
        body:       String, // email body (for HTML, set isHtml to true) 
        isHtml:    Boolean, // indicats if the body is HTML or plain text 
    }, callback, scope);

*/

function sendEMail(fromJsbRoutine, emailFrom, emailTo, CC, BCC, emailSubject, emailBody) {
    var myProcess;

    if (fromJsbRoutine instanceof jsbRoutine) {
        var myProcess = fromJsbRoutine._activeProcess;
    } else {
        emailSubject = BCC
        BCC = CC
        CC = emailTo
        emailTo = emailFrom
        emailFrom = fromJsbRoutine;
    }

    emailBody &= "";
    var isHtml = (emailBody.startsWith("<"));

    if (isPhoneGap() && window.hasEmailSupport) {
        if (!isArray(emailTo)) emailTo = [CStr(emailTo)]
        if (!CC) CC = null; else if (!isArray(CC)) CC = [CStr(CC)]
        if (!BCC) BCC = null; else if (!isArray(BCC)) BCC = [CStr(BCC)]

        return cordova.plugins.email.open({
            isHtml: isHtml,
            to: emailTo,
            cc: CC,
            bcc: BCC,
            subject: emailSubject,
            body: emailBody
        });
    }

    if (dotNetObj) {
        var Port = 80; var SSL = ""; var Host = ""; var networkID = ""; var networkPassword = ""; var fromName = "";
        var errs = dotNetObj.dnoSendMailMessage(Host, Port, SSL, networkID, networkPassword, emailFrom, fromName, emailTo, emailSubject, emailBody) + "";
        if (errs.startsWith("**")) {
            if (myProcess) myProcess.At_Errors = Mid(errs, 2); else At_Errors = Mid(errs, 2)
            return false;
        }
        return true
    }

    var emlContent = "data:message/rfc822 eml; charset=utf-8,";
    emlContent += 'To: ' + emailTo + '\n';
    if (CC) emlContent += 'CC: ' + CC + '\n';
    if (BCC) emlContent += 'BCC: ' + BCC + '\n';
    emlContent += 'Subject: ' + emailSubject + '\n';
    emlContent += 'X-Unsent: 1' + '\n';

    if (isHtml) emlContent += 'Content-Type: text/html' + '\n'; else emlContent += 'Content-Type: text/plain' + '\n';
    emlContent += '' + '\n';
    emlContent += Change(emailBody, crlf, "</br>");

    if (!$('#emailLink').length) $('body').append("<a id='emailLink'>email Link</a>");

    $('#emailLink').attr("href", encodeURI(emlContent))
    $('#emailLink').attr("download", 'jsbEMail.eml')
    $('#emailLink').hide()

    return document.getElementById('emailLink').click(); //click the link

    // Or ?? (mailto: does not work in phonegap)

    return window.open('mailto:' + urlEnccode(emailTo) + '?subject=' + urlEnccode(emailSubject) + '&body=' + urlEnccode(emailBody));
}

function saveBlob(fileBlob, filename) {
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(fileBlob, filename);
    else { // Others
        var a = document.createElement("a");
        var url = URL.createObjectURL(fileBlob);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

// download("filename.txt", ""application/xxxx", "theText")
function saveFile(filename, type, theText) {
    var fileBlob = new Blob([theText], { type: type });
    saveBlob(fileBlob, filename);
}

// Do a global RegExp replace
function regExp(source, Pattern, Replace) {
    var re = new RegExp(Pattern, "g")
    return source.replace(re, Replace)
}

function Gosub(fromJsbRoutine, toLbl, fromlbl) {
    fromJsbRoutine._state = toLbl;
    if (!fromJsbRoutine._gosubstk) fromJsbRoutine._gosubstk = []
    fromJsbRoutine._gosubstk.push(fromlbl)
    return fromlbl
}



function isGosubRtn(fromJsbRoutine) {
    // GOSUB / RETURN?
    if (fromJsbRoutine && fromJsbRoutine._gosubstk && fromJsbRoutine._gosubstk.length) {
        fromJsbRoutine._state = fromJsbRoutine._gosubstk[fromJsbRoutine._gosubstk.length - 1];
        fromJsbRoutine._gosubstk = fromJsbRoutine._gosubstk.slice(0, fromJsbRoutine._gosubstk.length - 1)
        return true;
    }
    return false;
}

function ReturnTo(toLbl) {
    fromJsbRoutine._state = toLbl;
    if (fromJsbRoutine._gosubstk && fromJsbRoutine._gosubstk.length) {
        fromJsbRoutine._gosubstk = fromJsbRoutine._gosubstk.slice(0, fromJsbRoutine._gosubstk.length - 1)
        return true;
    }
    return false;
}

// Debugger

// ===========================================   Breakpoints  ============================================
// ===========================================   Breakpoints  ============================================
// ===========================================   Breakpoints  ============================================
var bkPnts = null;
var dbgLastLineNo = 0;
var dbgLastRoutine;
var stepOutLevel = 0;
var singleStepping = false;

// used when removing dbgCheck (ie, replaced with this)
function XdbgCheck(fromJsbRoutine, lineNo) {
    fromJsbRoutine._lineNo = lineNo
    return false
} // Used in code where nodebug is true

async function dbgCheck(fromJsbRoutine, lineNo, modalCheck, forceIt) {
    var enterDebugger = forceIt;

    dbgLastLineNo = lineNo;
    dbgLastRoutine = fromJsbRoutine;
    fromJsbRoutine._lineNo = lineNo

    if (singleStepping || fromJsbRoutine._stepOver) enterDebugger = true; else
        if (modalCheck && fromJsbRoutine._activeProcess.modalStep) enterDebugger = true; else
            if (stepOutLevel) {
                if (!fromJsbRoutine._level) fromJsbRoutine._level = Count(Error().stack, "\n");
                if (fromJsbRoutine._level < stepOutLevel) enterDebugger = true;
            } else if (bkPnts) {
                var lnos = bkPnts[UCase(fromJsbRoutine._itemName)];
                if (lnos && (lnos["0"] || lnos[lineNo])) enterDebugger = true;
            }

    if (!enterDebugger) return;
    if (!fromJsbRoutine._level) fromJsbRoutine._level = Count(Error().stack, "\n");
    return await gotoDebugger(fromJsbRoutine, "L_" + lineNo);
}

function dbgHasBreakPoint(itemName, lineNo) {
    if (!bkPnts) return false;
    itemName = UCase(itemName);
    var lnos = bkPnts[itemName];
    if (!lnos) return false;
    return lnos[lineNo];
}

function dbgSetBreakPoint(itemName, lineNo) {
    $(".dbgLineNo_" + lineNo).addClass("dbgBreakLine")
    $(".dbgSrcLineNo_" + lineNo + ":not(.dbgActiveLine)").addClass("dbgBreakLine")

    if (!bkPnts) bkPnts = {};
    itemName = UCase(itemName);
    var lnos = bkPnts[itemName];
    if (!lnos) lnos = bkPnts[itemName] = {};
    if (!lineNo) lineNo = 0;
    if (lnos[lineNo]) return;
    lnos[lineNo] = true;
    saveAtSession()
}

// lineNo is optional
function dbgClearBreakPoint(itemName, lineNo) {
    if (!bkPnts) return;
    itemName = UCase(itemName);
    var lnos = bkPnts[itemName];
    if (!lnos) return;
    if (!lineNo) lineNo = 0;
    if (!lnos[lineNo]) return;

    delete lnos[lineNo]
    $(".dbgLineNo_" + lineNo).removeClass("dbgBreakLine")
    $(".dbgSrcLineNo_" + lineNo).removeClass("dbgBreakLine")

    if (!Object.keys(lnos).length) {
        delete bkPnts[itemName];
        if (!Object.keys(bkPnts).length) bkPnts = null;
    }
    saveAtSession()
}

// itemName is optional
function killAllBreakPoints(itemName) {
    if (!bkPnts) return;
    if (!itemName) {
        bkPnts = null;
    } else {
        itemName = UCase(itemName);
        var lnos = bkPnts[itemName];
        if (!lnos) return;
        delete bkPnts[itemName];
        if (!Object.keys(bkPnts).length) bkPnts = null;
    }
    saveAtSession()
}

// Show break points
function dbgBreakPoints() {
    var S = "";
    if (!bkPnts) return S;
    for (var itemName in bkPnts) {
        if (bkPnts.hasOwnProperty(itemName)) {
            var lnos = bkPnts[itemName];
            for (var lineNo in lnos) {
                if (lnos.hasOwnProperty(lineNo)) {
                    if (S) S += ', ';
                    S += itemName + " " + lineNo;
                }
            }
        }
    }
    return S;
}

// Show break points
function dbgHilightBreakPoints(itemName) {
    if (!bkPnts) return;
    if (!itemName) {
        bkPnts = null;
        return
    }
    itemName = UCase(itemName);
    var lnos = bkPnts[itemName];
    if (!lnos) return;

    for (var lineNo in lnos) {
        $(".dbgLineNo_" + lineNo).addClass("dbgBreakLine")
        $(".dbgSrcLineNo_" + lineNo + ":not(.dbgActiveLine)").addClass("dbgBreakLine")
    }
}

// Effectively thisis a CALL
async function gotoDebugger(fromJsbRoutine, nextState) {
    await JSB_BF_DEBUGGER_Sub(fromJsbRoutine, nextState);
}

function removeDebugger() {
    $('#jsbSrcDialog').unbind('keyup', window.debuggerKeyUp);
    $('.dbgLineNums').unbind("click", window.dbgLineClick);
    $("#msgboxDialog").remove();
    $('.dbgScreen').remove();    // ddScreen
    $('#jsbSrcDialog').remove(); // ddDiv
    $('#jsbSrcDialog').remove(); // ddDiv
    $('#popupvar').remove();
}

// 
var notLocalCalls = {}

function makeSubName(id) {
    if (!id) return "";
    id = id.toUpperCase();
    if (isAlphaNumeric(id)) return id;

    var RPL = "_@SMI@PND@AT@PND@DLR@PCT@UPA@AMP@AST@BAR"
    var result = ""
    for (var i = 0; i < id.length; i++) {
        var c = id.charAt(i);
        if (isAlphaNumeric(c)) { result += c } else {
            var j = InStr(";!@#$%^&*|", c)
            if (j >= 0) result += Field(RPL, "@", j + 1); else result += "_";
        }
    }
    return result;
}

// Always call using new: ... new jsbRoutine(...)
function jsbRoutine(_fileName, _itemName, _functionName) {
    this._parameters = { _functionResult: undefined }
    this._fileName = _fileName // system(27)
    this._itemName = _itemName // system(28)
    this._activeProcess = activeProcess;
    this._functionName = _functionName
    this._state = ""
    this._gosubstk = null
}

function Alert(s) {
    if (main_VT100.doingCapture) {
        Println(s)
    } else {
        if (window.isAdmin()) {
            if (window.confirm(s + '. Enter debugger?')) { debugger; }
            return 'OK';
        }
        alert(s)
    }
    return '';
}


// Dynamically load javascript code, i.e.: loadCode('function testme() { alert("ok") }')
var loadedElements = {}
function loadCode(code, id, permanent) {
    try {
        var script = document.createElement('script');
        // if (!id) id = newGUID();
        script.text = Change(code, am, '\n');
        script.setAttribute('type', 'text/javascript');

        if (id) {
            $('#' + id).remove()
            script.setAttribute('id', id);
        }

        var jsb = $('#jsb')
        if (!jsb.length || permanent) jsb = 'head';
        $(jsb).append(script);
    } catch (err) {
        if (activeProcess) activeProcess.At_Errors = err2String(err); else alert(err2String(err));
        return false
    }

    return true
}

// Dynamically load css text, i.e.: loadCSS('#txtInput { background: red !important; }')
//
function loadCSS(cssText, id, permanent) {
    try {
        var style = document.createElement('style');
        style.type = 'text/css';
        if (id) style.setAttribute('id', id);
        if (style.styleSheet) style.styleSheet.cssText = cssText; else style.appendChild(document.createTextNode(cssText));

        var jsb = $('#jsb')
        if (!jsb.length || permanent) jsb = 'head';
        $(jsb).append(style);
    } catch (err) {
        if (activeProcess) activeProcess.At_Errors = err2String(err); else alert(err2String(err));
        return false
    }

    return true
}

// Remove any <script tags> that are in #jsb
function unloadDynamicScripts() {
    $('#jsb>script').remove()
}

// Allow unloading of a specific javascript routine 
function unloadDynamicScript(id) {
    var script = window[id];
    if (script) {
        try { delete window[id] } catch (err) { }
        window[id] = undefined
        return true;
    }
    return false
}

function CopyToClipboard(text) {
    Copied = text.createTextRange();
    Copied.execCommand("Copy");
}

// ================================================== Encryption ====================================================
// ================================================== Encryption ====================================================
// ================================================== Encryption ====================================================
function aesSizeKey(skey) {
    if (skey === undefined) skey = '';
    if (typeof skey != "string") skey = CStr(skey)
    if (skey.length >= 32) {
        skey = skey.substring(0, 32)
    } else {
        if (skey.length >= 24) {
            skey = skey.substring(0, 24)
        } else {
            if (skey.length >= 16) {
                skey = skey.substring(0, 16)
            } else {
                skey += "32o4908go293hohg98fh40gh"
                skey = skey.substring(0, 16)
            }
        }
    }

    return skey
}

function aesIV() {
    return '7781157E2629B094F0E3DD48C4D78611'
}

function aesEncrypt(str, skey) {
    if (skey == "64") return encode_base64(str);

    var lkey = LCase(skey)
    if (lkey == "html") return htmlEscape(str);
    if (lkey == "url") return urlEnccode(str);
    if (lkey == "hex") return STX(str);
    if (lkey == "utf8") return encode_utf8(str);

    var key = CryptoJS.enc.Hex.parse(STX(aesSizeKey(skey)));
    var iv = CryptoJS.enc.Hex.parse(aesIV());
    var setup = {
        iv: iv,
        key: key,
        mode: CryptoJS.mode.CFB,
        padding: CryptoJS.pad.NoPadding
    }
    var encrypted = CryptoJS.AES.encrypt(str, key, setup)
    return XTS(encrypted.ciphertext.toString())
}

function aesDecrypt(str, skey) {
    if (skey == "64") return decode_base64(str);

    var lkey = LCase(skey)
    if (lkey == "html") return htmlUnescape(str);
    if (lkey == "url") return urlDecode(str);
    if (lkey == "hex") return XTS(str);
    if (lkey == "utf8") return decode_utf8(str);

    var key = CryptoJS.enc.Hex.parse(STX(aesSizeKey(skey)));
    var iv = CryptoJS.enc.Hex.parse(aesIV());
    var setup = {
        iv: iv,
        key: key,
        mode: CryptoJS.mode.CFB,
        padding: CryptoJS.pad.NoPadding
    }
    var words = CryptoJS.enc.Hex.parse(STX(str));
    var decrypted = CryptoJS.AES.decrypt({
        ciphertext: words
    }, key, setup);
    return decrypted.toString(CryptoJS.enc.Utf8)
}

// ================================================== Arrays ====================================================
// ================================================== Arrays ====================================================
// ================================================== Arrays ====================================================
function Join(a, c) {
    if (c === undefined) c = am;

    if (isJSON(a)) {
        var newArray = []
        for (var tag in a) {
            if (a.hasOwnProperty(tag)) newArray.push(a[tag])
        }
        return newArray.join(c)
    }

    if (!(a instanceof Array)) return Change(a, am, c)

    var x = a.slice(0); // duplicates the entire array
    if (x[0] === undefined) x.splice(0, 1); // drop [0]

    for (var i = 0; i < x.length; i++) {
        if (typeof x[i] != 'string') {
            if (x[i] instanceof Array) {
                if (c.length) x[i] = Join(x[i], Chr(Seq(c) - 1)); else x[i] = Join(x[i], "");
            } else {
                x[i] = CStr(x[i])
            }
        }
    }
    return x.join(c);
}

// Return the last indexable element
function UBound(a) {
    if (isString(a)) { return DCount(a, am); }

    if (isArray(a)) {
        if (a.length == 0) return 0;  // do this for if statements, IF (Ubound(x))
        return a.length - 1;
    }

    return Len(a)
}

// This UBound is for assignment.  As in A[UBound(A)] = 'xxx' - this case needs needs UBound to return 1
function UBound1(a) {
    if (!isArray(a)) return UBound(a);
    if (a.length == 0) return 1; else return a.length - 1;
}

function LBound(a) {
    if (!a || !a.length || isString(a)) return 1;
    if (a[0] != null) return 0;
    return 1
}

function createArray(dftValue, dimension1, dimension2) {
    if (dimension1 == null) {
        var arr = new Array(1)
        if (dftValue != null) dimension1 = 1; else dimension1 = 0;
    } else {
        var arr = new Array(dimension1 + 1)
    }

    if (dimension2 == null) {
        for (var i = 1; i <= dimension1; i++) arr[i] = dftValue;
    } else {
        for (var i = 1; i <= dimension1; i++) arr[i] = createArray(dftValue, dimension2);
    }

    return arr;
}

Array.prototype.Delete = function (idx) {
    if (!this.length || idx < 0) return this;
    if (this[0] === undefined && idx < 1) return this;
    this.splice(idx, 1);
};

if (!Array.prototype['delete']) {
    Array.prototype['delete'] = function (idx) {
        if (!this.length || idx < 0) return this;
        if (this[0] === undefined && idx < 1) return this;
        this.splice(idx, 1);
    };
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
        if (this == null) throw new TypeError('"this" is null or not defined');
        var k, o = Object(this);
        var len = o.length >>> 0;
        if (len === 0) return -1;
        var n = fromIndex | 0;
        if (n >= len) return -1;
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        while (k < len) {
            if (k in o && o[k] === searchElement) return k;
            k++;
        }
        return -1;
    };
}

if (!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

Array.prototype.DELETE = function (idx) {
    if (!this.length || idx < 0) return this;
    if (this[0] === undefined && idx < 1) return this;
    this.splice(idx, 1)
};

if (!Array.prototype.remove) {
    Array.prototype.remove = function (from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };
}

Array.prototype.Remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

Array.prototype.REMOVE = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

if (!Array.prototype.insert) {
    Array.prototype.insert = function (index, item) {
        while (this.length < index) this.push(null);
        this.splice(index, 0, item);
    };
}

Array.prototype.Insert = function (index, item) {
    while (this.length < index) this.push(null);
    this.splice(index, 0, item);
};

Array.prototype.INSERT = function (index, item) {
    while (this.length < index) this.push(null);
    this.splice(index, 0, item);
};

Array.prototype.Pop = function () {
    return this.pop()
};

Array.prototype.POP = function () {
    return this.pop()
};

Array.prototype.Push = function (arg) {
    return this.push(arg)
};

Array.prototype.PUSH = function (arg) {
    return this.push(arg)
};

function ParseCSV(Src) {
    Src = Change(Src, '`', Chr(1));
    Src = Change(Src, '\'', Chr(2));
    Src = Change(Src, '"', '`');

    var Dataset = Split(Src, lf, 7); // Split on LF but not inside string
    var Results = [undefined,];

    var DSLength = UBound(Dataset);
    for (var Linei = 1; Linei <= DSLength; Linei++) {
        var Line = Expr[Linei]

        if (Line.endsWith(cr)) Line = Left(Line, Len(Line) - 1);
        if (!Line.length) continue;

        var Fields = Split(Line, ',', 7);

        var FieldCnt = UBound(Fields);
        for (var Fieldi = 1; Fieldi <= FieldCnt; Fieldi++) {
            var F = Fields[Fieldi] + "";
            if (F.startsWith('`') && F.endsWith('`')) {
                F = Mid1(F, 2, Len(F) - 2);
                Fields[Fieldi] = F;
            }

            // change ` back to double quote
            if (F.indexOf('`') >= 0) {
                F = F.replaceAll('`', '"');
                Fields[Fieldi] = F;
            }

            if (F.indexOf(Chr(1)) >= 0) {
                F = F.replaceAll(Chr(1), '`');
                Fields[Fieldi] = F;
            }

            if (F.indexOf(Chr(2)) >= 0) {
                F = F.replaceAll(Chr(2), '\'');
                Fields[Fieldi] = F;
            }

            if (F.indexOf('""') >= 0) {
                F = F.replaceAll('""', '"');
                Fields[Fieldi] = F;
            }
        }

        Results.push(Fields);
    }

    return Results;
}

// Note: if DEL isempty, will return a parse set of tokens per the language
//
function Split(SplitS, Del, SplitType) {
    if (typeof SplitS != "string") SplitS = CStr(SplitS);

    if (!SplitS) return []

    if (!SplitType) {
        if (isNumeric(Del)) {
            SplitType = CInt(Del);
            Del = " "
        } else {
            if (!Del) Del = '';
            var b = SplitS.split(Del)
            b.splice(0, 0, undefined);
            return b
        }
    }

    var StrDels = "";
    var lineComments = "";
    var EscapeChar = "";
    var LDel1 = Left(Del, 1);
    var BlockCommentsAllowed = false;

    switch (SplitType) {
        case 1:
            // JSB
            StrDels = "\"'`";
            lineComments = "//*'";
            EscapeChar = "\\";
            Del = " ";
            BlockCommentsAllowed = true;
            break;

        case 2:
            // JS 
            StrDels = "\"'";
            lineComments = "//";
            EscapeChar = "\\";
            Del = " ";
            BlockCommentsAllowed = true;
            break;

        case 3:
            // VB 
            StrDels = "\"'";
            lineComments = "'";
            EscapeChar = "";
            Del = " ";
            BlockCommentsAllowed = false;
            break;

        case 5:
            // SQL
            StrDels = "\"'";
            lineComments = "--";
            Del = " ";
            if (InStr(SplitS, "[") >= 0 && InStr(SplitS, "]") > InStr(SplitS, "[")) StrDels += "["
            BlockCommentsAllowed = true;
            break

        case 6:
            // C#
            StrDels = "\"'";
            lineComments = "//";
            EscapeChar = "\\";
            Del = " ";
            BlockCommentsAllowed = true;
            break

        case 8:
            // CSV
            return ParseCSV(SplitS);

        default: // type 4 strings
            // just strings
            StrDels = "\"'";
            lineComments = "";
            EscapeChar = "\\";
            SplitType = 4;
            BlockCommentsAllowed = false;
    }

    var SplitResult = []
    var Split_ProcessingString = false;
    var SplitIsAtBOL = true;
    var SkipToNextBOL = false;
    var EndOnDel = "";

    for (var I = 0; I < SplitS.length; I++) {
        var C = SplitS.charAt(I);

        SplitResult.push(C);
        if (Split_ProcessingString) {
            // Done with string?
            if (C == EndOnDel) {
                Split_ProcessingString = false;
                if (SplitType != 4) {
                    var nc = Mid(SplitS, I + 1, Del.length);
                    if (nc && nc != Del) SplitResult.push(Del + Chr(0));
                }

                // Escaping a char?
            } else if (InStr(EscapeChar, C) >= 0 && Len(EscapeChar) > 0) {
                I += 1;
                SplitResult.push(SplitS.charAt(I));

            } else if (C == Chr(13) || C == lf || C == am) {
                // if parsing, don't allow strings to overflow
                if (EndOnDel != "'" && SplitType != 4) {
                    Split_ProcessingString = false;
                    SplitResult.push(Chr(0));
                }

            } else if (EndOnDel == "]" && C == "[") {
                Split_ProcessingString = false;
                SplitResult.pop()
                SplitResult.push(Chr(0));
                I--;
            }

            // Starting a string?
        } else if (InStr(StrDels, C) >= 0) {
            Split_ProcessingString = true;
            EndOnDel = C;

            if (C == "[") EndOnDel = "]";
            if (C == "(") EndOnDel = ")";
            if (C == "{") EndOnDel = "}";

            SplitIsAtBOL = false;

            if (SplitType == 1) {
                if (C == "'")
                    EscapeChar = "";
                else
                    EscapeChar = "\\";
            }

            // Block comment?
        } else if (BlockCommentsAllowed && C == "/" && SplitS.charAt(I + 1) == '*') {
            SplitResult.push('*');
            I++
            var lastC = ''
            while (true) {
                I++
                var C = SplitS.charAt(I);
                SplitResult.push(C);

                if (C == '' || (lastC == '*' && C == '/')) {
                    SplitResult.push(Chr(0));
                    break
                }
                lastC = C;
            }

            // begining of line comment?
        } else if ((C == "/" || C == "-" || SplitIsAtBOL) && InStr(lineComments, C) >= 0) {
            SplitIsAtBOL = false;

            if (C == "/" || C == "-") {
                if (Mid(SplitS, I + 1, 1) == C)
                    SkipToNextBOL = true;
            } else {
                SkipToNextBOL = true;
            }

            while (SkipToNextBOL) {
                I++
                var C = SplitS.charAt(I);
                if (C == cr || C == lf || C == am || C == '') {
                    SkipToNextBOL = false;
                    SplitResult.push(Chr(0));
                    I--
                } else {
                    SplitResult.push(C);
                }
            }

        } else if (C == LDel1 && Mid(SplitS, I, Len(Del)) == Del) {
            SplitResult.push(Chr(0));
            SplitIsAtBOL = false;

        } else if (C == cr || C == lf || C == am) {
            SplitIsAtBOL = true;
            if (SplitType != 4) { SplitResult.push(Chr(0)); }

        } else {
            SplitIsAtBOL = false;

            // Types 1,2,3,5,6 = JSB, JS, SQL, C#
            if (SplitType != 4) {
                // Starting a number?
                var nextC = LCase(Mid(SplitS, I + 1, 1))
                if (isDigit(C)) {
                    I++
                    C = SplitS.charAt(I);
                    while (isDigit(C)) {
                        SplitResult.push(C);
                        I++
                        C = SplitS.charAt(I);
                    }
                    if (C == "." && (SplitType == 5 || SplitType == 1)) { // SQL or JSB allowing "." in identifier
                        SplitResult.push(C);
                        I++
                        C = SplitS.charAt(I);
                        while (isDigit(C)) {
                            SplitResult.push(C);
                            I++
                            C = SplitS.charAt(I);
                        }
                    }
                    I--

                    // Starting an identifier?
                } else if (isAlpha(C)
                    || C == '_'
                    || (SplitType == 5 && C == '*' && nextC == 'a' && isDigit(Mid(SplitS, I + 2, 1))) /* *Annn */
                    || (SplitType == 5 && (C == '[' || C == '%')) /* like clause */
                ) {
                    I++
                    C = SplitS.charAt(I);
                    while ((isAlphaNumeric(C) || C == '_' || C == '.') || (SplitType == 5 && (C == '%' || C == ']'))) {
                        SplitResult.push(C);
                        I++
                        C = SplitS.charAt(I);
                    }

                    // function call?
                    if (C == "(" && SplitType == 5) {
                        SplitResult.push(C);
                        I++
                    }
                    I--

                    // White space
                } else if (C == ' ' || C == Chr(9)) {
                    I++
                    C = SplitS.charAt(I);
                    while (C == ' ' || C == Chr(9)) {
                        SplitResult.push(C);
                        I++
                        C = SplitS.charAt(I);
                    }
                    I--

                    // Starting a conditional operator
                } else if (InStr("<>=!", C) >= 0) {
                    I++

                    C = SplitS.charAt(I);
                    while (InStr("<>=!", C) >= 0) {
                        SplitResult.push(C);
                        I++
                        C = SplitS.charAt(I);
                    }
                    I--

                } else if (InStr("&|", C) >= 0) {
                    I++
                    if (C == SplitS.charAt(I)) {
                        SplitResult.push(C);
                        I++
                        C = SplitS.charAt(I);
                    }
                    I--
                }

                if (I < SplitS.length - 1) SplitResult.push(Chr(0));
            }
        }
    }

    var SplitS = SplitResult.join("");
    if (SplitType != 4) {
        SplitS = Change(SplitS, Del + Chr(0), Chr(0))
        while (InStr(SplitS, Chr(0) + Chr(0)) != -1) SplitS = Change(SplitS, Chr(0) + Chr(0), Chr(0))
        while (Left(SplitS, 1) == Chr(0)) SplitS = Mid(SplitS, 1)
        while (Right(SplitS, 1) == Chr(0)) SplitS = Left(SplitS, Len(SplitS) - 1)
        return Split(SplitS, Chr(0))
    }

    return Split(SplitS, Del + Chr(0))
}

// ================================================== Music and Sound ====================================================
// ================================================== Music and Sound ====================================================
// ================================================== Music and Sound ====================================================
//
var loadedSoundUrls = [undefined]
var loadedAudio = [undefined]

var mobileType = {
    Android: function () {
        return /Android/i.test(navigator.userAgent);
    },
    BlackBerry: function () {
        return /BlackBerry/i.test(navigator.userAgent);
    },
    iOS: function () {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    },
    Windows: function () {
        return /IEMobile/i.test(navigator.userAgent);
    },
    any: function () {
        return (mobileType.Android() || mobileType.BlackBerry() || mobileType.iOS() || mobileType.Windows());
    }
};

function isMobile() { return mobileType.any() }

function loadSound(url, onLoaded) {
    var OnLoaded = onLoaded; // make copy for call back

    for (var soundIndex = 1; soundIndex < loadedAudio.length; soundIndex++) {
        if (loadedSoundUrls[soundIndex] == LCase(url)) {
            var audio = loadedAudio[soundIndex]
            if (onLoaded) onLoaded(soundIndex, audio);
            return soundIndex
        }
    }

    var soundsIndex = loadedAudio.length;
    loadedSoundUrls.push(LCase(url))

    if (isPhoneGap() && window.plugins.NativeAudio) {
        loadedAudio.push(onLoaded)

        try {
            var r = jsbRoot()
            if (Left(url, Len(r)) == r) url = Mid(url, Len(r))

            window.plugins.NativeAudio.preloadSimple(soundsIndex + "", url, function (msg) { // lla.preloadAudio(url, url, 1, 1, function (msg) {
                if (OnLoaded) OnLoaded(url, url)
            }, function (msg) {
                showStatus('Audio error: ' + msg + " " + url, '', true);
                if (OnLoaded) OnLoaded(url, url)
            });

        } catch (err) {
            if (activeProcess) activeProcess.At_Errors = err2String(err); else alert(err2String(err));
        }
        return soundsIndex;
    }

    var audio = $('<audio><source src="' + fullUrlPath(url) + '" /></audio>').appendTo(document.body);
    audio = $(audio).get(0);

    loadedAudio.push(audio)

    if (OnLoaded) audio.onloadeddata = function () {
        OnLoaded(soundIndex, audio)
    }

    audio.load();
    return soundIndex;
};

function playSound(soundsIndex, stopAll, startPosition, length) {
    if (!soundsIndex) return;

    if (isPhoneGap() && window.plugins.NativeAudio) {
        window.plugins.NativeAudio.play(soundsIndex + "");
        return
    }

    var stopAt = startPosition + length;
    var audio;

    try {
        if (stopAll) stopSounds();
        audio = loadedAudio[soundsIndex];
        if (!audio) return;

    } catch (err) {
        if (activeProcess) activeProcess.At_Errors = err2String(err); else alert(err2String(err));
        return
    }

    try {
        audio.pause();
        if (startPosition && audio.currentTime) audio.currentTime = startPosition; else audio.currentTime = 0;
    } catch (err) {
        if (activeProcess) activeProcess.At_Errors = err2String(err); else alert(err2String(err));
    }

    if (stopAt) {
        audio.ontimeupdate = function () {
            if (audio.currentTime >= stopAt) audio.pause();
        }
    }

    try {
        audio.play();
    } catch (err) {
        if (activeProcess) activeProcess.At_Errors = err2String(err); else alert(err2String(err));
    }

}

function stopSounds() {
    if (isPhoneGap() && window.plugins.NativeAudio) return;

    try {
        for (var i = 0; i < loadedAudio.length; i++) {
            var aElement = loadedAudio[i];
            aElement.pause();
        }
    } catch (err) {
        if (activeProcess) activeProcess.At_Errors = err2String(err); else alert(err2String(err));
    }
}


//
// Example:
//    loadSound(protoCol() + "://hpr.dogphilosophy.net/test/mp3.mp3", function () { playSound(this) })
//

// ================================================== Order, Named, Collections ====================================================
// ================================================== Order, Named, Collections ====================================================
// ================================================== Order, Named, Collections ====================================================
//
// Collections are different than just an Array, as they maintain ORDER and are indexed by Identifiers, not integers
//
// var myCollection = new Collection();
// myCollection.add("first", "Adam");
// myCollection.remove("first")
//
function Collection() {
    var collection = {};
    var order = [];

    this.add = function (property, value) {
        if (!this.exists(property)) {
            collection[property] = value;
            order.push(property);
        }
    }
    this.remove = function (property) {
        collection[property] = null;
        var ii = order.length;
        while (ii-- > 0) {
            if (order[ii] == property) {
                order[ii] = null;
                break;
            }
        }
    }
    this.toString = function () {
        var output = [];
        for (var ii = 0; ii < order.length; ++ii) {
            if (order[ii] != null) {
                output.push(collection[order[ii]]);
            }
        }
        return output;
    }
    this.getKeys = function () {
        var keys = [];
        for (var ii = 0; ii < order.length; ++ii) {
            if (order[ii] != null) {
                keys.push(order[ii]);
            }
        }
        return keys;
    }
    this.update = function (property, value) {
        if (value != null) {
            collection[property] = value;
        }
        var ii = order.length;
        while (ii-- > 0) {
            if (order[ii] == property) {
                order[ii] = null;
                order.push(property);
                break;
            }
        }
    }
    this.exists = function (property) {
        return collection[property] != null;
    }
}

function Chain(sentence) {
    throw "*CHAIN*" + sentence;
}

// ================================================== Format & Conversion ====================================================
// ================================================== Format & Conversion ====================================================
// ================================================== Format & Conversion ====================================================

// USE THE CONV PUBLIC FUNCTION TO CONVERT STRING TO A SPECIFIED STORAGE LAYOUT.'
//
// IO:         IS EITHER "I" OR "O" WHICH SIGNIFIES AN INPUT OR OUTPUT Conversion.'
// CSTRING:    IS THE STRING TO BE CONVERTED.'
// Conversion: IS ONE OR MORE VALID Conversion CODES, SEPARATED BY VALUE'
//             MARKS (ASCII 253). MULTIPLE CODES ARE APPLIED FROM LEFT TO RIGHT.'
//             THE FIRST Conversion CODE CONVERTS THE VALUE OF CSTRING.  THE SECOND'
//             Conversion CODE CONVERTS THE OUTPUT OF THE FIRST Conversion, AND SO ON.'
//
// CSTRING WITH THE NULL VALUE RETURNS NULL. Conversion WITH THE NULL VALUE'
// RESULTS IN PROGRAM TERMINATION AND A RUN-TIME ERROR.'
//
// THE @STATUS FUNCTION REFLECTS THE RESULT OF THE Conversion:'
//    0 - SUCCESSFUL Conversion'
//    1 - STRING IS INVALID.'
//    AN EMPTY STRING RETURNS, UNLESS STRING IS THE NULL VALUE.'
//    2 - INVALID Conversion'
//    3 - SUCCESSFUL Conversion OF POSSIBLY INVALID DATA'
//
// CODES HANDLED LOCAL ARE:'
//   MCU     - UPPER CASE STRING'
//   MCL     - LOWER CASE STRING'
//   MCA     - STRIP ALL BUT ALPHA CHARS'
//   MC/A    - STRIP ALL ALPHA CHARS'
//   MCD     - INPUT: CONVERT HEX TO DEC | OUTPUT: CONVERT DEC TO HEX'
//   MCX     - INPUT: CONVERT DEC TO HEX | OUTPUT: CONVERT HEX TO DEC'
//   MCN     - STRIP ALL BUT DIGITS - INCLUDING PERIODS'
//   MC/N    - STRIP ALL DIGITS'
//   MCP     - STRIP NON PRINTING CHARS'
//   MCT     - CONVERT STRING TO TITLE (UPCASE FIRST LETTERS)'
//   MX OR MP- OUTPUT: CONVERT STRING TO HEX STRING | INPUT: CONVERT HEX STRING TO STRING'
//   MTN     - OUTPUT: CONVERT INTERNAL TIME TO STRING | INPUT: CONVERT STRING TO INTERNAL TIME'
//   MN      - OUTPUT: MASKED '
//   XTD     - CONVERT HEX TO DECIMAL'
//   DTX     - CONVERT DECIMAL TO HEX'
//   DN      - OUTPUT: CONVERT INTERNAL DATE TO STRING | INPUT: CONVERT STRING TO INTERNAL DATE'
//
//
//                     D                  12 DEC 1997
//                     D2/                12/12/97
//                     D2-                12-12-97
//                     D-                 12-12-1997
// (julian date)       DJ                 346
// (numeric month)     DM                 12
// (alpha month)       DMA                DECEMBER
// (numeric day/week)  DW                 5
// (alpha day/week)    DWA                FRIDAY
// (4 digit year)      DY                 1997
// (quarter)           DQ                 4
//
//
// 12/12/97      D           10939
// 12 DEC 1997   D2          10939

function Matches(S, P) {
    var SI = 0
    var PI = 0
    var InString = 0
    var pChar = Mid(P, PI, 1)
    var SChar = Mid(S, SI, 1)
    var InChar = ""
    var digits = " 0123456789"
    var RplCnt = 0

    while (pChar != "") {
        // Check if (in middle of processing a
        switch (true) {
            case InString > 0: //Finished?
                if (pChar == InChar) {
                    InString = 0
                    PI++
                    pChar = Mid(P, PI, 1)
                } else {
                    if (pChar != SChar) {
                        return 0
                    }

                    // Equal to the end?
                    if (SChar == "") {
                        return 1
                    }

                    SI++
                    SChar = Mid(S, SI, 1)
                    PI++
                    pChar = Mid(P, PI, 1)
                }
                break;

            case pChar == "\"" || pChar == "'": // Time to start a search?
                InString = 1
                InChar = pChar
                PI++
                pChar = Mid(P, PI, 1)
                break;

            default: // Record pattern start
                var PNot = pChar == "~" // Check for NOT

                if (PNot) {
                    PI++
                    pChar = Mid(P, PI, 1)
                }

                // Check for repetition count
                RplCnt = 0

                switch (true) {
                    case Mid(P, PI, 3) == "...":
                        pChar = "X"
                        PI = PI + 2
                        break;

                    case InStr(0, digits, pChar) > 0:
                        // Get repetition count or start
                        while (InStr(0, digits, pChar) > 0) {
                            RplCnt = RplCnt * 10 + (Seq(pChar) - Seq("0"))
                            PI++
                            pChar = Mid(P, PI, 1)
                        }

                        // Check for range
                        if (pChar == "-" && InStr(0, digits, Mid(P, PI + 1, 1)) > 0) {
                            RplEnd = 0
                            PI++
                            pChar = Mid(P, PI, 1)
                            while (true) {
                                RplEnd = RplEnd * 10 + (Seq(pChar) - Seq("0"))
                                PI++
                                pChar = Mid(P, PI, 1)
                                if (InStr(0, digits, pChar) <= 0) {
                                    break
                                }
                            }

                            for (; RplEnd >= RplCnt; RplEnd--) {
                                var m1 = Mid(S, SI)
                                var m2 = CStr(RplEnd) + Mid(P, PI)
                                if (Matches(m1, m2)) {
                                    return 1
                                }
                            }

                            return 0
                        }

                    case true:
                        RplCnt = 1
                        brak;
                }

                if (RplCnt == 0) {
                    while (true) {
                        var m1 = Mid(S, SI)
                        var m2 = Mid(P, PI + 1)
                        if (Matches(m1, m2)) {
                            return 1
                        }

                        // Failed matCh - Try }
                        SChar = Mid(S, SI, 1)
                        SI++

                        // Characters we Skip over must matCh
                        switch (pChar) {
                            case "N":
                                if (PNot) {
                                    if (InStr(0, digits, SChar) > 0) {
                                        return 0
                                    }
                                } else {
                                    if (InStr(0, digits, SChar) <= 0) {
                                        return 0
                                    }
                                }
                                break;

                            case "A":
                                if (PNot) {
                                    if ((SChar >= "a" && SChar <= "a") || (SChar >= "A" && SChar <= "Z")) {
                                        return 0
                                    }
                                } else {
                                    if (!((SChar >= "a" && SChar <= "a") || (SChar >= "A" && SChar <= "Z"))) {
                                        return 0
                                    }
                                }
                                break;
                        }

                        if (SChar == "") {
                            break
                        }
                    }

                    return 0
                }

                // a Rep Count
                switch (pChar) {
                    case "x":
                    case "X": // Any Character
                        while (RplCnt > 0 && SChar != "") {
                            RplCnt--
                            SI++
                            SChar = Mid(S, SI, 1)
                        }
                        break;

                    case "n":
                    case "N": // Numeric only
                        if (PNot) {
                            while (RplCnt > 0 && InStr(0, digits, SChar) <= 0) {
                                RplCnt--
                                SI++
                                SChar = Mid(S, SI, 1)
                            }
                        } else {
                            while (RplCnt > 0 && InStr(0, digits, SChar) > 0) {
                                RplCnt--
                                SI++
                                SChar = Mid(S, SI, 1)
                            }
                        }
                        break;

                    case "A":
                    case "a": // Alphabetic Only
                        if (PNot) {
                            while (RplCnt > 0 && ((SChar >= "a" && SChar <= "a") || (SChar >= "A" && SChar <= "Z")) == false) {
                                RplCnt--
                                SI++
                                SChar = Mid(S, SI, 1)
                            }
                        } else {
                            while (RplCnt > 0 && ((SChar >= "a" && SChar <= "a") || (SChar >= "A" && SChar <= "Z"))) {
                                RplCnt--
                                SI++
                                SChar = Mid(S, SI, 1)
                            }
                        }
                        break;

                    default:
                        digitsplus = " 0123456789\"'"
                        while (InStr(0, digitsplus, pChar) <= 0 && pChar != "") {
                            if (pChar != SChar) {
                                return 0
                            }
                            SI++
                            SChar = Mid(S, SI, 1)
                            PI++
                            pChar = Mid(P, PI, 1)
                        }

                        PI--
                        RplCnt = 0
                }

                // Did we Skip the required number of Characters?

                if (RplCnt != 0) {
                    return 0
                }

                // Record pattern END
                PI++
                pChar = Mid(P, PI, 1)
        }
    }

    if (pChar == "" && SChar == "") {
        return 1
    }
    return 0
}

function Fmt(Result, FmtStr) {
    // Setup defaults
    var JUST = "L"
    var FillC = " "
    var DDIGS = -1
    var XSCALE = 0
    var ZSupp = false
    var Ins_Comma = false
    var SignCode = " "
    var ADollar = false
    var MaskCode = 0
    var Scientific = false
    var Neg = false
    var JustLen = 0
    var digits = " 0123456789"
    var cdem = " CDEM"
    var cdem2 = " Z,$CDEM"
    var fc = " %*#\\"

    FmtStr = CStr(FmtStr) + "";
    Result = CStr(Result) + "";
    if (FmtStr == "") return Result

    var Number = isNumeric(Result)
    if (Number) {
        if (Result.startsWith("-")) {
            Result = Mid(Result, 1)
            Neg = true
        }
    }

    // Parse format expression
    var FmtI = 0
    while (InStr(0, digits, FmtStr.charAt(FmtI)) > 0) {
        JustLen = JustLen * 10 + (Seq(FmtStr.charAt(FmtI)) - Seq("0"))
        FmtI++
    }

    // Check for justification FILL Character

    if (Index(fc, FmtStr.charAt(FmtI), 1) > 0) {
        FillC = FmtStr.charAt(FmtI)
        switch (FillC) {
            case "\\":
                FillC = Mid(FmtStr, FmtI + 1, 1)
                FmtI = FmtI + 2
                break

            case "%":
                FillC = "0"
                break;
        }
        FmtI++
    }

    if (UCase(FmtStr.charAt(FmtI)) == "M") {
        MaskCode = 1
        FmtI++
    }
    if (UCase(FmtStr.charAt(FmtI)) == "Q") {
        Scientific = true
        FmtI++
    }
    switch (UCase(FmtStr.charAt(FmtI))) {
        case "L":
            JUST = "L"
            FmtI++
            break;

        case "R":
            JUST = "R"
            FmtI++
            break;

        case "T":
            JUST = "T"
            FmtI++
            break;

        case "D":
            FmtI++
            break;
    }

    if (InStr(0, digits, FmtStr.charAt(FmtI)) > 0) {
        DDIGS = (Seq(FmtStr.charAt(FmtI)) - Seq("0"))
        if (MaskCode > 0) {
            XSCALE = -DDIGS
        }
        FmtI++
        if (Result == "") {
            Result = "0"
            Number = true
        }
    } else {
        if (Index(cdem, UCase(FmtStr.charAt(FmtI)), 1) > 0) {
            DDIGS = 0
        }
    }

    if (InStr(0, digits, FmtStr.charAt(FmtI)) > 0) {
        if (MaskCode > 0) {
            XSCALE *= 2
        }
        XSCALE = XSCALE - (CNum(Seq(FmtStr.charAt(FmtI)) - Seq("0")) - 4)
        FmtI++
        if (Result == "") {
            Result = "0"
            Number = true
        }
    }

    while (Index(cdem2, UCase(FmtStr.charAt(FmtI)), 1) > 0) {
        if (Result == "") {
            Result = "0"
            Number = true
        }
        if (UCase(FmtStr.charAt(FmtI)) == "Z") {
            ZSupp = true
            FmtI++
        }
        if (UCase(FmtStr.charAt(FmtI)) == "P") {
            // ??
            FmtI++
        }
        if (FmtStr.charAt(FmtI) == ",") {
            Ins_Comma = true
            FmtI++
        }
        if (Index(cdem, UCase(FmtStr.charAt(FmtI)), 1) > 0) {
            SignCode = UCase(FmtStr.charAt(FmtI))
            FmtI++
        }
        if (FmtStr.charAt(FmtI) == "$") {
            ADollar = true
            FmtI++
        }
    }

    JustLen = 0
    for (; InStr(0, digits, FmtStr.charAt(FmtI)) > 0; FmtI++) {
        JustLen = JustLen * 10 + (Seq(FmtStr.charAt(FmtI)) - Seq("0"))
    }

    // Check for justification FILL Character (#)
    if (InStr(0, fc, FmtStr.charAt(FmtI)) > 0) {
        FillC = FmtStr.charAt(FmtI)
        switch (FillC) {
            case "\\":
                FillC = FmtStr.charAt(FmtI + 1)
                FmtI = FmtI + 2
                break

            case "#":
                FillC = " "
                break

            case "%":
                FillC = "0"
                break
        }

        FmtI++
    }

    for (; InStr(0, digits, FmtStr.charAt(FmtI)) > 0; FmtI++) {
        JustLen = JustLen * 10 + (Seq(FmtStr.charAt(FmtI)) - Seq("0"))
    }

    // Check for format justification
    var PC = 0
    if ((FmtStr.charAt(FmtI) != "" && JUST == "R") || FmtStr.charAt(FmtI) == "#") {
        mf = Mid(FmtStr, FmtI)
        PC = Count(mf, "#")
        if (PC > 0) {
            JustLen = PC
        }
    }

    // Check for errors
    if (CStr(JustLen) == "") {
        return ""
    }

    // Format Result
    if (Number) {
        var DP = Index(Result, ".", 1)
        var ByteLen = Result.length
        if ((XSCALE > 0 || (DDIGS != -1)) && DP == -1) {
            Result = Result + "."
            ByteLen++
            DP = ByteLen
        }

        Result = CNum(Result) * Math.pow(10, (XSCALE))

        if (DDIGS != -1) {
            if (MaskCode > 0) {
                // Round
                Result = CNum(Result) + Math.pow(10, -DDIGS) * 0.5
            }
            dd = ""
            mf = Field(Result, ".", 2) + StrRpt("0", DDIGS)
            if (DDIGS > 0) {
                dd = "." + Mid(mf, 0, DDIGS)
            }
            Result = Field(Result, ".", 1) + dd
        }

        Result += "";
        if (ZSupp) {
            while (Result.startsWith("0")) {
                Result = Mid(Result, 1)
            }
        } else {
            if (Result.startsWith(".")) {
                Result = "0" + Result
            }
        }

        if (Scientific) {
            Result = fmt.Sprintf("%e", CNum(Result))
        } else {
            if (Ins_Comma) {
                DP = Index(Result, ".", 1)
                if (DP == -1) {
                    DP = Result.length + 1
                }
                while (DP > 3) {
                    Result = Mid(Result, 0, DP - 3) + "," + Mid(Result, DP - 3)
                    DP -= 3
                }
            }
        }

        if (ADollar) {
            Result = "$" + Result
        }

        switch (SignCode) {
            case "C":
                if (Neg) {
                    Result = Result + "cr"
                } else {
                    Result = Result + "  "
                }
                break;

            case "B":
                if (Neg) {
                    Result = Result + "DB"
                } else {
                    Result = Result + "  "
                }
                break;

            case "D":
                if (!Neg) {
                    Result = Result + "DB"
                } else {
                    Result = Result + "  "
                }
                break;

            case "E":
                if (Neg) {
                    Result = "<" + Result + ">"
                } else {
                    Result = " " + Result + " "
                }
                break;

            case "M":
                // SIGN AT END
                if (Neg) {
                    Result = Result + "-"
                } else {
                    Result = Result + "  "
                }
                break;

            case "N":
                // IGNORE SIGN
                break;

            default:
                if (Neg) {
                    Result = "-" + Result
                }
                break;
        }
    }

    // Justify
    if (JustLen != 0) {
        var CharLen = CStr(Result).length
        if (JustLen < CharLen) {
            if (JUST == "L") Result = Left(Result, JustLen);
            else Result = Right(Result, JustLen)
        } else {
            if (JUST == "L") {
                Result = Result + StrRpt(FillC, JustLen - CharLen)
            } else {
                Result = StrRpt(FillC, JustLen - CharLen) + Result
            }
        }
    }

    // Mix Remainder of &FmtStr with Result
    if (FmtStr.charAt(FmtI) != "") {
        if (PC == 0) {
            return Result + Mid(FmtStr, FmtI)
        } else {
            DinData = ""
            DP = 0
            while (true) {
                XCH = FmtStr.charAt(FmtI)
                FmtI++
                if (XCH == "") {
                    break
                }
                if (XCH == "#") {
                    XCH = Result.charAt(DP)
                    DP++
                }
                DinData = DinData + XCH
            }
            return DinData
        }
    }

    return Result
}

function callStack(jsbRoutinesOnly) {
    var error = new Error();
    var stack = error.stack || '';
    var r = []

    stack = stack.split('\n').map(function (line) {
        var l = line.trim();
        if (l.indexOf('(') < 0 || !l.startsWith('at ')) return;
        l = l.substr(3);
        l = l.substr(0, l.indexOf('(') - 1);
        if (l == 'callStack') return;

        if (jsbRoutinesOnly) {
            if (!l.startsWith("async ")) return;
            l = l.substr(6);
            if (l[0] != l[0].toUpperCase()) return;
        } else {
            if (l.startsWith("async ")) l.substr(6);
        }

        r.push(l);
    });

    return r;
}

function System(n, fromJsbRoutine) {
    // var active_process = fromJsbRoutine ? fromJsbRoutine._activeProcess : activeProcess;

    switch (n) {
        case 1: // printer is on(1)/off(0)
            return "js" // navigator.appName;

        case 2: // Page width pixels
            return window.innerWidth;

        case 3: // Page height pixels
            return window.innerHeight;

        case 4: // Line remaining on page
            return -1

        case 5: // Current Page #
            return -1

        case 6: // Current line #
            return -1

        case 7: // Term type code
            return "html"

        case 9: // CPU millisecond Count
            return (new Date()).getMilliseconds();

        case 10: // Data stack is active (0/1)
            return 0

        case 11: // Active Select?
            return isActiveSelect(odbActiveSelectList);

        case 12: // Current system time in milliseconds
            return (new Date()).getMilliseconds();

        case 13: // GUID
            return newGUID();

        case 14: // return  # of Buffered input chars
            return N - 1

        case 15: // Sentence
            return activeProcess.At_Sentence;

        case 18: // UserNo
            return At_Request.UserNo

        case 19: // Account
            return At_Account

        case 21: // has a parent process (tcl or EXECUTE)
            return activeProcess.hasEXECUTEParent || activeProcess.hasTCLParent;

        case 22: // hasTCLParent
            return activeProcess.hasTCLParent;

        case 23: // Break enabled (1) or not (0)
            return 0

        case 24: // Echo enabled (1) or not (0)
            return activeProcess.At_Echo

        case 25: // jsbroot/
            return jsbRoot()

        case 26: // Current Directory
            if (dotNetObj) return dotNetObj.dnoSystem(26); else return dropIfLeft(window.location.href, 'file:///');

        case 27: // Current FName
            return Field(callStack(true)[1], ":", 2); // fromJsbRoutine._fileName

        case 28: // Current IName
            return Field(callStack(true)[1], ":", 2); // fromJsbRoutine._itemName

        case 29: // determine columns for given fhandle

        case 30: // httpcontext.current.session.sessionid
            return server_rpcsid

        case 31: // jsbRootAccount
            return jsbRootAct()

        case 32: // parent's IName
            var p = callStack(true)[1]; // [0] is System()
            return dropIfRight(p, "_")

        case 33: // parent's FName
            var p = callStack(true)[1]; // [0] is System()
            return fieldIfRight(p, "_");

        // case 34: // get auditLog (aspx)

        case 40: // MachineName
            if (dotNetObj) return dotNetObj.dnoSystem(40);

        case 41: // OSVersion
            if (dotNetObj) return dotNetObj.dnoSystem(41);

        case 42: // OSVersion
            if (dotNetObj) return dotNetObj.dnoSystem(42);

        case 43: // UserName
            if (dotNetObj) return dotNetObj.dnoSystem(43);

        case 44: // Is64BitOperatingSystem
            if (dotNetObj) return dotNetObj.dnoSystem(44);

        case 45: // SystemDirectory
            if (dotNetObj) return dotNetObj.dnoSystem(45);

        case 46: // UserDomainName
            if (dotNetObj) return dotNetObj.dnoSystem(46);

        case 47: // SerialNumber
            if (dotNetObj) return dotNetObj.dnoSystem(47);

        case 48: // LocalApplicationData Path
            if (dotNetObj) return dotNetObj.dnoSystem(48);

        // case 49: // Get Log file (aspx & gae)
        // case 50: // server.state (aspx)
        // case 51: // new cookie container (aspx)
        // case 52..55: // allowDos... (aspx)
        // case 56: // new beginTime (aspx)

        case 57: // noTCLAllow
            return activeProcess.TclProhibited

        // case 60..63: // profiling (aspx)

        // case 70: start web socket server (aspx)
    }
}


// this urlEncode is used instead of the standard encodeURIComponent, so that this routine is compatable with the jsb server version
function urlEncode(value) {
    if (typeof value != "string") value = CStr(value);

    if (value == "") return "";
    var L = value.length;

    var r = "";
    for (var i = 0; i < L; i++) {
        var c = value.substr(i, 1);
        if (c == " ") c = "+"; else
            if (c >= "A" && c <= "Z"); else
                if (c >= "a" && c <= "z"); else
                    if (c >= "0" && c <= "9"); else
                        if (c == "-" || c == "_" || c == "." || c == "~"); else {
                            var v = String(c).charCodeAt(0);
                            var x = v.toString(16).toUpperCase();
                            if (x.length == 1) c = "%0" + x; else c = "%" + x
                        }
        r += c
    }
    return r;
}

function urlDecode(value) {
    return decodeURIComponent((value + '').replaceAll('+', ' '));
}

function myLocation(w) {
    var url;

    if (!w) w = window;
    if (w.contentWindow) w = w.contentWindow;

    if (w.location) {
        try {
            var url = w.location.href;
        } catch (err) {
        }

    } else if (w.contentDocument) {
        url = w.contentDocument.URL

    } else {
        url = w.src
    }

    if (dotNetObj && InStr(url, "?") == -1) {
        // add command line parameters to end of url
        var h = url;
        var cml = dotNetObj.dnoGetCommandLineArgs()
        var ch = "?"

        var a = Split(cml, Chr(254), 4)

        // first 4 are x,y,w,h
        for (var i = 5; i < a.length; i++) {
            var arg = a[i];
            h += ch + arg;
            ch = " "
        }
        return h;
    }
    return url;
}

function protoCol() { var p = Field(myLocation(), ':', 1); if (p == 'file') return 'http'; else return p }

// ================================================== JSB @Objects (@Request, @Response) ====================================================
// ================================================== JSB @Objects (@Request, @Response) ====================================================
// ================================================== JSB @Objects (@Request, @Response) ====================================================

At_Request.FILENAME = function (inputFileElementName) {
    return this.FileName(inputFileElementName)
}
At_Request.filename = function (inputFileElementName) {
    return this.FileName(inputFileElementName)
}

At_Request.FileName = function (inputFileElementName) {
    var inputElement = $("#" + inputFileElementName)
    if (inputElement.length) return inputElement.val();
    else return null;
}

At_Request.FILE = function (inputFileElementName) {
    Alert("use @REQUESTFILE(ID) to get files");
}
At_Request.file = function (inputFileElementName) {
    Alert("use @REQUESTFILE(ID) to get files");
}
At_Request.File = function (inputFileElementName) {
    Alert("use @REQUESTFILE(ID) to get files");
}

At_Response.dbgPrint = function (s) {
    consoleLog(s)
}

At_Response.dbgPrint_ = function (s) {
    consoleLog(s)
}

At_Response.redirect = function (url) {
    if (!url) url = "."
    At_Response.redirectURL = url
    throw "*REDIRECT*" + url;
}

At_Response.Redirect = function (url) { At_Response.redirect(url) }

// Should be called as new windowOpen
function windowOpen(pToURL, pTarget, pOptions) {
    var stackLevel;
    var options = pOptions;
    var target = pTarget;
    var toURL = pToURL;
    var myJsb = $('#jsb')

    saveAtSession()

    toURL = Replace(toURL, "??", "?")

    if (delayedHybridWrite_tableName) {
        // start write now
        var myDHandle = new delayedHybridWrite()

        function checkDone() {
            if (myDHandle._state == "done") return new windowOpen(toURL, target, options);
            setTimeout(checkDone, 500)
        }

        checkDone();
        return null;
    }

    if (target) target = LCase(target); else target = "_self"
    if (toURL.startsWith("?")) toURL = Mid(toURL, 1);
    if (toURL.startsWith("www.")) toURL = protoCol() + "://" + toURL;

    // If we don't have a protocol, give us jsbRootAct as a base
    var destination = Field(Field(toURL, "#", 1), "?", 1)
    if (InStr(destination, "//") == -1) {
        if (jsbRoot().startsWith('file://')) toURL = Field(window.location.href, "?", 1) + "?" + toURL; else
            if (InStr(toURL, "?") > 0) toURL = jsbRootAct() + toURL; else toURL = jsbRootAct() + "?" + toURL; // Change(toURL, "?", "&");
        destination = Field(Field(toURL, "#", 1), "?", 1)
    }

    var extra = Mid(toURL, Len(destination)) + "";
    destination = LCase(destination) + "";
    while (true) {
        if (extra.startsWith('#')) extra = Mid(extra, 1); else
            if (extra.startsWith('?')) extra = Mid(extra, 1); else
                break
    }

    if (targetIsLocal(toURL)) {
        // Pass our session

        if (checkUrlForClose(toURL)) {
            jsbLocation = toURL;

            // In case we are nested in a dialog already
            setTimeout(function () {
                jsbCloseWindow()

                if (!stackedWindows.length && !nestedInGo) {
                    if (isPhoneGap()) {
                        window.location.reload(true)
                    }
                }
            }, 10)
            return;
        }

        if ((target == "_self" && self == top) || (target == "_parent" && parent == top) || (target == "_top")) {
            var runningPath = LCase(myLocation())
            if (toURL.endsWith('?') || toURL.endsWith('#')) toURL = Left(toURL, Len(toURL) - 1);
            if (runningPath.endsWith('?') || runningPath.endsWith('#')) runningPath = Left(runningPath, Len(runningPath) - 1);
            var lcURL = LCase(toURL);
            _isDirty = false;

            if (lcURL == LCase(runningPath)) return window.location.reload();

            if (Field(lcURL, "#", 1) == Field(LCase(runningPath), "#", 1)) {
                //  Hash change
                window.location.hash = dropLeft(toURL, "#");
                // jsbLocation = toURL; // Set after hash change
                return
            }

            if (extra) {
                extra = extra.replace("&", "?")
                if (window.location.hash == "#" + extra) {
                    // Reloading same page - Force hash it to be different
                    if (InStr(extra, "?") > 0) window.location.hash = extra + "&%20"; else window.location.hash = extra + "?%20"
                    //jsbLocation = window.location.href;
                    return;
                }
                window.location.hash = extra;
                //jsbLocation = window.location.href;
                return
            }
            return window.open(toURL, target)
        }

        if (dotNetObj && destination.startsWith('file:///')) {
            // use StartDoc for .Net programs 
            if (destination.startsWith('file:///')) destination = Mid(destination, 8); // drop file:///
            destination = Change(destination, "/", "\\")
            var errs = dotNetObj.dnoStartDoc(urlDecode(destination), extra) + "";
            if (errs.startsWith("**")) throw new Error(Mid(errs, 2));
            return;
        }

        // if Local, just push current process 
        var htmlTarget = InStr(destination, '.htm') >= 0;
        if (isPhoneGap() && htmlTarget) {
            if (window.PGMultiView) {
                PGMultiView.loadView(toURL, { sendData: 'you are a child' }, function (data) { }, function (data) { });
                return
            }

            setTimeout(function () {
                $(myJsb).hide()
                stackLevel = stackWindow('body');
                toURL = LTrim(urlDecode(Field(toURL, "?", 2)))

                if (target == "_self") {
                    return jsbExecute(toURL, function () {
                        $(myJsb).append("<button onclick='unstackWindow(' + stackLevel + ')' style='position: absolute; right:0; top: 0; z-index:" + nextZIndex() + "'>Close</button>")
                    });
                } else {
                    return jsbExecute(toURL, function () {
                        unstackWindow(stackLevel)
                    });
                }
            }, 50);

            return;
        }

        return window.open(toURL, target, options)
    }

    if (dotNetObj) {
        // All not local targets open in another tab
        var isFileUrl = destination.startsWith('file:///');

        if (isFileUrl) {
            destination = Mid(destination, 8); // drop file:///
        } else {
            if (isUrl(destination)) return window.open(fullUrlPath(toURL), "_blank", options);
        }

        destination = Change(destination, "/", "\\")
        var errs = dotNetObj.dnoStartDoc(urlDecode(destination), extra) + "";
        if (errs.startsWith("**")) throw new Error(Mid(errs, 2));
        return;
    }

    return window.open(fullUrlPath(toURL), target, options)
}

var stackedWindows = []

function stackWindow(appendToParent) {
    // Save current Screen state
    FlushHTML();

    var stacked = {}
    stackedWindows.push(stacked)

    // Save all commons
    stacked.processCommons = {}
    for (var commonsName in window) {
        var L8 = Left(commonsName, 8);
        if (L8 == "Commons_") {
            stacked.processCommons[commonsName] = window[commonsName]
            delete window[commonsName]
        }
    }

    if (window.doDebug) {
        consoleLog(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PUSH WINDOW");
    }

    // Setup a new JSB FORM or share the existing one
    if (appendToParent) {
        stacked.whichVT100 = main_VT100
        stacked.whichVT100.shadow($(appendToParent).length == 0)

        stacked.newVT100 = new VT100(appendToParent)
        main_VT100 = stacked.newVT100
    }

    return stackedWindows.length - 1;
}

function unstackWindow(gotoStackLevel) {

    if (gotoStackLevel === undefined) gotoStackLevel = stackedWindows.length - 1;

    while (gotoStackLevel < stackedWindows.length) {
        if (window.doDebug) {
            consoleLog("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< POP");
        }
        if (main_VT100.doingCapture) FlushHTML();

        var stacked = stackedWindows.pop();

        // Restore any COMMONS we had
        for (var commonsName in stacked.processCommons) {
            window[commonsName] = stacked.processCommons[commonsName]
        }

        if (stacked.whichVT100) {
            stacked.newVT100.remove()
            main_VT100 = stacked.whichVT100.unShadow()
        }
    }
}

// Returns all parameters past the "?"
function urlParams(url) {
    var i = InStr(url, "?");
    if (i == -1) return "";
    var urlparams = Mid(url, i);
    urlparams = Field(urlparams, "&noCache=", 1)
    urlparams = Field(urlparams, "?noCache=", 1)
    return Mid(urlparams, 1);
}


function saveAtSession() {
    SetCookie("At_Session", At_Session)
    SetCookie("BreakPoints", bkPnts)
}

At_Response.buffer = function (html) {
    FlushHTML();
    if (html == null) return $('#jsb').html();
    main_VT100.ClearScreen()
    $('#jsb').css({ overflowY: 'auto' });
    $('#jsb').html(html);
}
At_Response.Buffer = function (html) { this.buffer(html) }

At_Response.Header = { Set: function (val) { this._set = val } }
At_Response.header = function () { return this.Header }

At_Response.binarywrite = function (val) { this.buffer(val) }
At_Response.BinaryWrite = function (val) { this.buffer(val) }

$(document).on("click", "a", function () {
    if (!At_Request.IsAuthenticated) return true;

    var lurl = LCase(this.href)
    var rt = LCase(jsbRoot())
    if (Left(lurl, rt.length) != rt) return true;

    SetCookie("IsAuthenticated", true);
    SetCookie("UserName", At_Request.UserName);
    SetCookie("UserNo", At_Request.UserNo);

    return true
})

// ================================================== HTTP DOM Manipulation ====================================================
// ================================================== HTTP DOM Manipulation ====================================================

function httpRequest() {
    if (window.XMLHttpRequest) return new XMLHttpRequest()

    var activexmodes = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"] //activeX versions to check for in IE
    if ("ActiveXObject" in window) {
        for (var i = 0; i < activexmodes.length; i++) {
            try {
                return new ActiveXObject(activexmodes[i])
            } catch (e) {
                //suppress error
            }
        }
    }

    return false
}

// Add Uinit Arrays for IE 9 / 10
(function () {
    try {
        var a = new Uint8Array(1);
        return; //no need
    } catch (e) { }

    function subarray(start, end) {
        return this.slice(start, end);
    }

    function set_(array, offset) {
        if (arguments.length < 2) offset = 0;
        for (var i = 0, n = array.length; i < n; ++i, ++offset)
            this[offset] = array[i] & 0xFF;
    }

    // we need typed arrays
    function TypedArray(arg1) {
        var result;
        if (typeof arg1 === "number") {
            result = new Array(arg1);
            for (var i = 0; i < arg1; ++i)
                result[i] = 0;
        } else
            result = arg1.slice(0);
        result.subarray = subarray;
        result.buffer = result;
        result.byteLength = result.length;
        result.set = set_;
        if (typeof arg1 === "object" && arg1.buffer)
            result.buffer = arg1.buffer;

        return result;
    }

    window.Uint8Array = TypedArray;
    window.Uint32Array = TypedArray;
    window.Int32Array = TypedArray;
})();


(function () {
    if ("response" in XMLHttpRequest.prototype ||
        "mozResponseArrayBuffer" in XMLHttpRequest.prototype ||
        "mozResponse" in XMLHttpRequest.prototype ||
        "responseArrayBuffer" in XMLHttpRequest.prototype)
        return;
    Object.defineProperty(XMLHttpRequest.prototype, "response", {
        get: function () {
            return new Uint8Array(new VBArray(this.responseBody).toArray());
        }
    });
})();

function getPath(pathname) {
    return Left(pathname, pathname.lastIndexOf('/') + 1);
}

function sessionVar(param) {
    return At_Session.Item(param)
}

function applicationVar(param) {
    return Application.Item(param)
}

function CreateObject(objectName) {
    if (dotNetObj) {
        var errs = dotNetObj.dnoGetDrives() + "";
        if (errs.startsWith("**")) throw new Error(Mid(errs, 2));
        if (LCase(objectName) == "getdrives") return parseJSON(errs, null)
        if (Field(LCase(objectName), ",", 1) == "opendialog") {
            var Title = Field(objectName, ",", 2)
            var InitialDirectory = Field(objectName, ",", 3)
            var Filter = Field(objectName, ",", 4)

            if (!Title) Title = "Open file dialog";
            if (!InitialDirectory) InitialDirectory = "c:\\";
            if (!Filter) Filter = "All files (*.*)|*.*|All files (*.*)|*.*";

            return dotNetObj.dnoBrowseForFile(Title, InitialDirectory, Filter)
        }
    }

    return new ActiveXObject(objectName)
}

var activeCookies = {}

function DeleteCookie(name) {
    if (dotNetObj) {
        dotNetObj.dnoDeleteCookie(name)
    } else if (localStorage != null) {
        removeObjectFromLocalStorage(name);
    }

    if (activeCookies[name]) delete activeCookies[name];
}

//  value, expires, path, domain, secure - all optional
// name & value required
function SetCookie(name, value) {
    if (dotNetObj) {
        try {
            dotNetObj.dnoSetCookie(CStr(name), CStr(value))
        } catch (err) {
            alert(err)
            debugger
        }

    } else if (localStorage != null) {
        saveObjectInLocalStorage(name, value);
    }

    activeCookies[name] = value;
    return value
}

// defaultVal is optional
function GetCookie(name, optionalValue) {
    if (dotNetObj) {
        try {
            var a = dotNetObj.dnoGetCookie(CStr(name), CStr(optionalValue))
        } catch (e) { }

        if (a == 'true') return true
        if (a == 'false') return false


    } else if (window.localStorage != null) {
        var a = getObjectFromLocalStorage(name); // preserves type

    } else {
        var a = activeCookies[name];
    }

    if (a == null) return optionalValue;
    return a;
}

function getBrowserWidth() {
    if (self.innerWidth) {
        return self.innerWidth;
    } else if (document.documentElement && document.documentElement.clientHeight) {
        return document.documentElement.clientWidth;
    } else if (document.body) {
        return document.body.clientWidth;
    }
    return 0;
}

function getBrowserHeight() {
    if (self.innerHeight) {
        return self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) {
        return document.documentElement.clientHeight;
    } else if (document.body) {
        return document.body.clientHeight;
    }
    return 0;
}

function getBrowserTop() {
    return window.screenTop ? window.screenTop : window.screenY;
}

function getBrowserLeft() {
    return window.screenLeft ? window.screenLeft : window.screenX;
}

// ================================================== Math ====================================================
// ================================================== Math ====================================================
// ================================================== Math ====================================================
var MaxInt = Number.MAX_VALUE;
var MinInt = -Number.MAX_VALUE;

// These are javascript Math equivalents
function sinh(x) { return (Math.exp(x) - Math.exp(-x)) / 2 }
function cosh(x) { return (Math.exp(x) + Math.exp(-x)) / 2 }
function tanh(x) { return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x)) }

// These are MVDBMS R83 equivalents
function Sinh(x) {
    return sinh(x)
}

function Cosh(x) {
    return cosh(x)
}

function Tanh(x) {
    return tanh(x)
}

function Sin(x) {
    return Math.sin(x)
}

function Cos(x) {
    return Math.cos(x)
}

function Tan(x) {
    return Math.tan(x)
}

function ASin(x) {
    return Math.asin(x)
}

function ACos(x) {
    return Math.acos(x)
}

function ATan(x) {
    return Math.atan(x)
}

// For backwards compatability with R83
function R83_Sin(x) {
    return Math.sin(x * 0.0174532925)
}

function R83_Cos(x) {
    return Math.cos(x * 0.0174532925)
}

function R83_Tan(x) {
    return Math.tan(x * 0.0174532925)
}

function R83_ASin(x) {
    return Math.asin(x) * 57.29577951307855
}

function R83_ACos(x) {
    return Math.acos(x) * 57.29577951307855
}

function R83_ATan(x) {
    return Math.atan(x) * 57.29577951307855
}

function Pwr(x, nth) {
    return Math.pow(x, nth)
}

function Log(x) {
    return Math.log10(x)
}

function Ln(x) {
    return Math.log(x)
}

function Exp(x) {
    return Math.exp(x)
}

function Sqrt(x) {
    return Math.atan(x)
}

function Abs(x) {
    return Math.abs(x)
}

function PI(x) {
    return Math.PI
}

function Floor(x) {
    return Math.floor(x)
}

function Ceiling(x) {
    return Math.ceil(x)
}

function Rnd(R) {
    return Math.floor(Math.random() * R)
}

function Mod(x, y) {
    return x & y;
}

// R83 style compare is very close to javascript, with the excptions of null (empty / non-assigned variables)
function CCStr(x) { return Null0(x) }

// By forcing null to '', we insure javascript will allow null will be treated as a Zero or '' if needed
function Null0(x) {
    if (x == null || x === '') return ""; // Insure '' doesn't change to "0" in next statement
    if (x == 0) return "0"; // Make "0" and 0 the same
    return x;
}

function compileCode(fname, iname, pageCode, callBack) {
    var code_hash = hashCode(pageCode)

    if (code_hash == getObjectFromLocalStorage('hash_' + fname + ' ' + iname)) {
        if (callBack) callBack("");
    } else {
        new jsbCall('jsb_bf', "jscompile", function (results) {
            if (InStr(results, "^") > 1) {
                alert(results)
            } else {
                saveObjectInLocalStorage('hash_' + fname + ' ' + iname, code_hash)
            }
            hideStatusBar()
            if (callBack) callBack(results);

        }, fname, iname, pageCode)
    }
}

// fast checksum non-SQL compatable
function hashCode(s) {
    return s.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
}

// Checksum SQL 2000 comptable
function Checksum(s) {
    var sum = 0;
    var overFlowB = 0

    for (var i = 0; i < s.length; i++) {
        sum = BIGXOR(sum * 16, s.charCodeAt(i))
        overFlowB = Math.floor(sum / 4294967296)
        sum = BIGXOR(sum, overFlowB);
        sum = BIGAND(sum, 0xFFFFFFFF)
    }

    if (sum > 2147483647) {
        sum -= 4294967296
    } else if (sum >= 32768 && sum <= 65535) {
        sum -= 65536
    } else if (sum >= 128 && sum <= 255) {
        sum -= 256
    }

    return sum
}

function BIGXOR(a, b) {
    var sp = 0xffffff + 1
    var ahigh = Math.floor(a / sp)
    var alow = a - (ahigh * sp)

    var bhigh = Math.floor(b / sp)
    var blow = b - (bhigh * sp)

    var chigh = ahigh ^ bhigh
    var clow = alow ^ blow

    return chigh * sp + clow
}

function BIGAND(a, b) {
    var sp = 0xffffff + 1
    var ahigh = Math.floor(a / sp)
    var alow = a - (ahigh * sp)

    var bhigh = Math.floor(b / sp)
    var blow = b - (bhigh * sp)

    var chigh = ahigh & bhigh
    var clow = alow & blow

    return chigh * sp + clow
}
// ================================================== MultiValue ====================================================
// ================================================== MultiValue ====================================================
// ================================================== MultiValue ====================================================

//
// Given a string (p) and a position (AmCnt, VmCnt, SvmCnt) - return {StartI: x, Length: x, StopOnNext: x}
//    StartI: the starting position of the data
//    Length: of the data (L)
//    StopOnNext:   of data found (255, 254, 253, 252)
//
function AVS_Index(P, AmCnt, VmCnt, SvmCnt) {
    // Return starting position + Length (L);

    if (typeof P != "string") P = CStr(P)
    if (VmCnt === undefined) VmCnt = 0;
    if (SvmCnt === undefined) SvmCnt = 0;

    var NewEndStr, EndStr = P.length,
        PI = 0,
        J, StopOnNext = sm;

    // Position to am
    if (AmCnt > 0) {
        StopOnNext = am;
        for (J = 2; J <= AmCnt; J++) {
            PI = InStr(PI, P, StopOnNext);
            if (PI == -1) return {
                StartI: -1,
                Length: 0,
                StopOnNext: am
            } // No such position
            PI++;
        }

        NewEndStr = InStr(PI, P, StopOnNext);
        if (NewEndStr != -1 && (NewEndStr < EndStr)) EndStr = NewEndStr;

    } else if (AmCnt < 0) {
        return {
            StartI: -1,
            Length: 0,
            StopOnNext: am
        }
    }

    // Position to vm
    if (VmCnt > 0) {
        StopOnNext = vm;
        for (J = 2; J <= VmCnt; J++) {
            PI = InStr(PI, P, StopOnNext);
            if (PI == -1 || PI >= EndStr) return {
                StartI: -1,
                Length: 0,
                StopOnNext: vm
            } // No such position
            PI++;
        }

        NewEndStr = InStr(PI, P, StopOnNext);
        if (NewEndStr != -1 && (NewEndStr < EndStr)) EndStr = NewEndStr;

    }
    if (VmCnt < 0) {
        return {
            StartI: -1,
            Length: 0,
            StopOnNext: vm
        }
    }

    if (SvmCnt > 0) {
        StopOnNext = svm;
        for (J = 2; J <= SvmCnt; J++) {
            PI = InStr(PI, P, StopOnNext);
            if (PI == -1 || PI >= EndStr) return {
                StartI: -1,
                Length: 0,
                StopOnNext: StopOnNext
            } // No such position
            PI++;
        }

        NewEndStr = InStr(PI, P, StopOnNext);
        if (NewEndStr != -1 && (NewEndStr < EndStr)) EndStr = NewEndStr;

    }
    if (SvmCnt < 0) {
        return {
            StartI: -1,
            Length: 0,
            StopOnNext: svm
        }
    }

    if (PI > EndStr) PI = EndStr
    return {
        StartI: PI,
        Length: EndStr - PI,
        StopOnNext: StopOnNext
    }
}

// Use the followingChar  function to erase the data contents of a specified AmCnt, VmCnt, || SvmCnt
function Delete(P, AmCnt, VmCnt, SvmCnt) {
    if (isArray(P)) {
        if (P.length == 0) return [];
        var x = P.slice(0); // duplicates the entire array

        x.splice(AmCnt, 1);
        return x


        if (x[0] === undefined) x.splice(AmCnt, 1); else {
            x.splice(AmCnt - 1, 1);
        }

        return x
    }

    if (typeof P != "string") P = CStr(P)
    var AVS = AVS_Index(P, AmCnt, VmCnt, SvmCnt);
    if (AVS.StartI == -1) return P; // AVS not found

    var followingChar = Mid(P, AVS.StartI + AVS.Length, 1);
    if (followingChar != "" && followingChar != AVS.StopOnNext) AVS.Length -= 1;

    if (AVS.StartI == 0 || followingChar == AVS.StopOnNext) return Left(P, AVS.StartI) + Mid(P, AVS.StartI + AVS.Length + 1);

    if (Mid(P, AVS.StartI - 1, 1) == AVS.StopOnNext) {
        return Mid(P, 0, AVS.StartI - 1) + Mid(P, AVS.StartI + AVS.Length);
    }
    return Mid(P, 0, AVS.StartI) + Mid(P, AVS.StartI + AVS.Length);
}

// Use the Extract  function to access the data contents of a specified field, Value, || subValue
function Extract(Expr, AmCnt, VmCnt, SvmCnt) {
    if (!Expr) return null;
    if (isArray(Expr)) {
        if (Expr.length == 0) return "";

        // return Expr[AmCnt]; 

        if (Expr[0] === undefined) return Expr[AmCnt];
        //return Expr[AmCnt - 1]
        return Expr[AmCnt]
    }
    if (isXML(Expr)) {
        return Expr.childNodes[0][AmCnt - 1]
    }
    if (Expr instanceof selectList) return x.SelectedItemIDs[AmCnt - 1];
    if (typeof Expr == "object") return TagName(Expr, AmCnt);

    //if (isJSON(Expr)) { var key = Object.keys(Expr)[AmCnt - 1]; var ans = {}; ans[key] = Expr[key]; return ans }


    if (typeof Expr != "string") Expr = CStr(Expr)
    var AVS = AVS_Index(Expr, AmCnt, VmCnt, SvmCnt);
    if (AVS.StartI == -1) return ""; // AVS not found
    return Mid(Expr, AVS.StartI, AVS.Length);
}

function Replace(P, AmCnt, VmCnt, SvmCnt, NewStr) {
    if (NewStr === undefined) return Change(P, AmCnt, VmCnt)

    if (typeof P != "string") P = CStr(P)
    if (typeof NewStr != "string") NewStr = CStr(NewStr)
    var AVS = AVS_Index(P, AmCnt, VmCnt, SvmCnt)
    if (AVS.StartI == -1) return Insert(P, AmCnt, VmCnt, SvmCnt, NewStr);
    return Left(P, AVS.StartI) + NewStr + Mid(P, AVS.StartI + AVS.Length)
}

function Insert(Expr, AmCnt, VmCnt, SvmCnt, NewStr) {
    if (typeof Expr != "string") Expr = CStr(Expr)
    if (typeof NewStr != "string") NewStr = CStr(NewStr)

    // Use the Insert  function to return a dynamic array that has a new field,
    // Value, || subValue inserted into the specified dynamic array.
    // Result:        is the dynamic array to be modified.
    // NewStr:   specifies the Value of the new element to be inserted.
    // AmCnt,
    // VmCnt,
    // SvmCnt:   specify the StopOnNext && position of the new element to be inserted.
    //
    var StopC = sm,
        Result = Expr;
    var NewEndStr, EndStr = Expr.length,
        PI = 0,
        J, StopOnNext;

    // Position to am
    // Position to am
    StopOnNext = am
    EndStr = InStr(PI, Result, sm)
    if (EndStr == -1) EndStr = Result.length;

    if (AmCnt > 0) {
        for (J = 2; J <= AmCnt; J++) {
            PI = InStr(PI, Result, StopOnNext)
            if (PI == -1) {
                var AddMarks = AmCnt - J + 1
                Result = Mid(Result, 0, EndStr) + StrRpt(am, AddMarks) + Mid(Result, EndStr)
                PI = EndStr + AddMarks
                EndStr += AddMarks
                break
            } else {
                PI++
            }
        }
        NewEndStr = InStr(PI, Result, am)
        if (NewEndStr != -1 && NewEndStr < EndStr) {
            EndStr = NewEndStr
        }
        StopC = am
    } else {
        if (AmCnt < 0) {
            if (EndStr > PI) {
                Result = Mid(Result, 0, EndStr) + am + Mid(Result, EndStr)
                EndStr++
            }
            StopC = am
            PI = EndStr
        }
    }

    StopOnNext = vm
    if (VmCnt > 0) {
        for (J = 2; J <= VmCnt; J++) {
            PI = InStr(PI, Result, StopOnNext)
            if (PI >= EndStr || PI == -1) {
                AddMarks = VmCnt - J + 1
                Result = Mid(Result, 0, EndStr) + StrRpt(vm, AddMarks) + Mid(Result, EndStr)
                PI = EndStr + AddMarks
                EndStr += AddMarks
                break
            } else {
                PI++
            }
        }
        NewEndStr = InStr(PI, Result, StopOnNext)
        if (NewEndStr != -1 && NewEndStr < EndStr) {
            EndStr = NewEndStr
        }
        StopC = vm
    } else {
        if (VmCnt < 0) {
            NewEndStr = InStr(PI, Result, am)
            if (NewEndStr != -1 && NewEndStr < EndStr) {
                EndStr = NewEndStr
            }
            if (EndStr > PI) {
                Result = Mid(Result, 0, EndStr) + StopOnNext + Mid(Result, EndStr)
                EndStr++
            }
            StopC = vm
            PI = EndStr
        }
    }

    StopOnNext = svm
    if (SvmCnt > 0) {
        for (J = 2; J <= SvmCnt; J++) {
            PI = InStr(PI, Result, StopOnNext)
            if (PI >= EndStr || PI == -1) {
                AddMarks = SvmCnt - J + 1
                Result = Mid(Result, 0, EndStr) + StrRpt(svm, AddMarks) + Mid(Result, EndStr)
                PI = EndStr + AddMarks
                EndStr += AddMarks
                break
            } else {
                PI++
            }
        }
        NewEndStr = InStr(PI, Result, StopOnNext)
        if (NewEndStr != -1 && NewEndStr < EndStr) {
            EndStr = NewEndStr
        }
        StopC = svm
    } else {
        if (SvmCnt < 0) {
            NewEndStr = InStr(PI, Result, vm)
            if (NewEndStr != -1 && NewEndStr < EndStr) {
                EndStr = NewEndStr
            }
            if (EndStr > PI) {
                Result = Mid(Result, 0, EndStr) + StopOnNext + Mid(Result, EndStr)
                EndStr++
            }
            StopC = svm
            PI = EndStr
        }
    }

    StopOnNext = Mid(Result, PI, 1)
    if (StopOnNext != "" && StopOnNext <= StopC) {
        return Mid(Result, 0, PI) + NewStr + StopC + Mid(Result, PI)
    }

    return Mid(Result, 0, PI) + NewStr + Mid(Result, PI)
}

// 
// If DynAry is string based, will return am position (1..n) of SearchStr
// If DynAry is a zero based javascript array, may return 0 as a valid position
//
// Returns -1 if not found; use DynAry.splice(returedPos, 1) to delete the found element
//
function LocateAM(SearchStr, DynAry, Del, StartAM) {
    if (isArray(DynAry)) return locateInArray(SearchStr, DynAry);

    // Return am position of SearchStr in DynAry
    var I = 0
    if (!StartAM) StartAM = 1;
    if (!Del) Del = am

    if (isJSON(DynAry)) {
        var PI = 1;
        for (var tag in DynAry) {
            if (DynAry.hasOwnProperty(tag)) {
                if (tag == SearchStr) return PI;
                PI++;
            }
        }
        return -1;
    }

    var dBase = Del + DynAry + Del
    var dFstr = Del + SearchStr + Del
    if (StartAM <= 1) {
        I = InStr(0, dBase, dFstr)

    } else {
        var StartPos = Index(dBase, Del, StartAM - 1)
        if (StartPos == -1) {
            return 0
        }
        I = InStr(StartPos, dBase, dFstr)
    }

    if (I == -1) {
        return -1
    }
    if (I == 0) {
        return 1
    }

    dBase = Left(dBase, I)
    return DCount(dBase, Del)
}

//
// Locate SearchStr in P<AmCnt, VmCnt>{, StartPos} Ordered By OrderCode Setting Result Then/Else
//
// Returns true/false and the am/vm/svm position (1..n)
// If the string isn't found, returns the am/vm/svm position where to insert it (1..n)
//
function Locate(SearchStr, DynAry, AmCnt, VmCnt, StartPos, OrderCode, byRef_Callback) {
    if (typeof SearchStr != "string") SearchStr = CStr(SearchStr)

    if (!AmCnt) AmCnt = 0;
    if (!VmCnt) VmCnt = 0;
    if (!StartPos) StartPos = 0;
    if (!OrderCode) OrderCode = "";

    var Result = 0
    var SvmCnt = 0

    // Setup Searching sort order
    var Ascending = InStr(0, OrderCode, "A") >= 0
    var Descending = InStr(0, OrderCode, "D") >= 0
    var RightSort = InStr(0, OrderCode, "R") >= 0

    // Choose fastest algorythm depending on sort Type
    var Longway = RightSort || Descending || Ascending

    function exit(position, success) {
        if (byRef_Callback) {
            byRef_Callback(position);
            return success;
        }
        return {
            "position": position,
            "success": success
        }
    }

    // Choose fastest algorythm depending on sort Type
    if (AmCnt == 0 && VmCnt == 0 && SvmCnt == 0 && StartPos <= 1 && !RightSort) {
        if (isArray(DynAry)) {
            if (DynAry.length == 0) return exit(1, false);

            if (DynAry[0] === undefined) PI = 1; else PI = 0

            if (Ascending) {
                for (; PI < DynAry.length; PI++) {
                    var E = CStr(DynAry[PI])
                    if (E >= SearchStr) return exit(PI, E == SearchStr);
                }
                return exit(PI, false);
            }

            if (Descending) {
                for (; PI < DynAry.length; PI++) {
                    var E = CStr(DynAry[PI])
                    if (E >= SearchStr) return exit(PI, E == SearchStr);
                }
                return exit(PI, false);
            }

            for (; PI < DynAry.length; PI++) {
                var E = CStr(DynAry[PI])
                if (E == SearchStr) return exit(PI, true);
            }

            // Didn't find it, return [-1] position
            return exit(PI, false);

        } else {
            var PI = LocateAM(SearchStr, DynAry, am, 1)

            if (PI >= 0) return exit(PI, true);

            // Didn't find it, return [-1] position
            if (!Longway) return exit(DCount(DynAry, am) + 1, false);
        }
    } else {
        if (isJSON(DynAry)) {
            // Convert to list of tags
            var newArray = []
            for (var tag in DynAry) {
                if (DynAry.hasOwnProperty(tag)) newArray.push(tag)
            }
            DynAry = Join(newArray, Chr(254))
        } else {
            DynAry = CStr(DynAry)
        }
    }

    //  dbgPrintln("long way " + CStr(AmCnt) + " " + CStr(VmCnt) + " " + CStr(StartPos))

    // Setup A,V,SV to Skip to StartPos position
    var LCLen = SearchStr.length
    var EndC = vm // end searching on vm, am, sm, || null
    var StopC = svm
    if (AmCnt <= 0) {
        EndC = sm // end searching on sm || null
        StopC = am // Strings Del by am
    } else if (VmCnt <= 0) {
        EndC = am // end searching on am, sm, || null
        StopC = vm // Strings Del by vm
    }

    if (StartPos > 0) {
        if (AmCnt == 0) {
            AmCnt = StartPos
        } else if (VmCnt == 0) {
            VmCnt = StartPos
        } else {
            SvmCnt = StartPos
        }
    }

    // Position Pi to StartPos of search strings
    var PI = 0
    var EndStr = 0
    if (AmCnt > 0) {
        for (var J = 2; J <= AmCnt; J++) {
            PI = InStr(PI, DynAry, am)
            if (PI == -1) {
                if (StartPos >= 1) {
                    Result = StartPos
                } else {
                    Result = 1
                }
                return exit(Result, false);
            }
            PI++
        }

        EndStr = InStr(PI, DynAry, sm)
        if (EndStr == -1) {
            EndStr = DynAry.length
        }

    } else {
        EndC = sm // Searching by attributes
        EndStr = DynAry.length
    }

    if (VmCnt > 0) {
        for (var J = 2; J <= VmCnt; J++) {
            PI = InStr(PI, DynAry, vm)
            if (PI >= EndStr || PI == -1) {
                if (StartPos >= 1) {
                    Result = StartPos
                } else {
                    Result = 1
                }
                return exit(Result, false);
            }
            PI++
        }
        var NewEndStr = InStr(PI, DynAry, am)
        if (NewEndStr != -1 && NewEndStr < EndStr) {
            EndStr = NewEndStr
        }
    }

    if (SvmCnt > 0) {
        for (var J = 2; J <= SvmCnt; J++) {
            PI = InStr(PI, DynAry, svm)
            if (PI >= EndStr || PI == -1) {
                if (StartPos >= 1) {
                    Result = StartPos
                } else {
                    Result = 1
                }
                return exit(Result, false);
            }
            PI++
        }
    }

    // Search from Pi to EndC

    // Get count of # of EndC's we have already skipped
    var RtnPosition = 1
    if (StartPos > 0) {
        RtnPosition = StartPos
    }

    // Check for non-existent extract
    var pChar = Mid(DynAry, PI, 1)
    var lChar = ""

    if (pChar == "" || pChar >= EndC) return exit(1, false);

    while (true) {
        var LI = 0 // We are looking for SearchStr, and LI indexes each Char of SearchStr
        var PEnd = false
        var LCEnd = false

        if (Longway) {
            var PCnt = PI;
            for (PCnt = PI; PCnt <= EndStr - 1; PCnt++) {
                if (Mid(DynAry, PCnt, 1) >= StopC) {
                    break
                }
            }

            PCnt -= PI // len of data string
            LCCnt = LCLen

            // Check for string match at this location
            while (true) {
                pChar = ""
                lChar = ""

                if (PCnt > 0) {
                    pChar = Mid(DynAry, PI, 1)
                } // data string

                if (LCCnt > 0) {
                    lChar = Mid(SearchStr, LI, 1)
                } // search string

                if (PCnt > LCCnt && RightSort) {
                    if (PCnt > 0 && pChar == " ") {
                        PI++
                        PCnt--
                    } else {
                        lChar = " "
                        break
                    }

                } else if (LCCnt > PCnt && RightSort) {
                    if (LCCnt > 0 && lChar == " ") {
                        LI++
                        LCCnt--
                    } else {
                        pChar = " "
                        break
                    }

                } else if (pChar == lChar && PCnt > 0) {
                    PI++
                    PCnt--
                    LI++
                    LCCnt--

                } else {
                    break
                }
            }

            PEnd = (PCnt == 0) //end of string conditions
            LCEnd = (LCCnt == 0)
        } else {
            // Fast Check
            while (true) {
                pChar = Mid(DynAry, PI, 1)
                lChar = Mid(SearchStr, LI, 1)
                if (pChar != lChar || pChar == "" || pChar >= StopC) {
                    break
                }
                PI++
                LI++
            }

            //end of string conditions
            PEnd = pChar >= StopC || pChar == ""
            LCEnd = lChar >= StopC || lChar == ""

            if (PEnd) {
                pChar = ""
            }
            if (LCEnd) {
                lChar = ""
            }
        }

        // Why did we end ?
        if (PEnd && LCEnd) return exit(RtnPosition, true);

        if (Ascending) {
            if (lChar < pChar || LCEnd) return exit(RtnPosition, false);
        }

        if (Descending) {
            if (lChar > pChar || PEnd) return exit(RtnPosition, false);
        }

        while (true) {
            pChar = Mid(DynAry, PI, 1)
            if (pChar >= StopC || pChar == "") {
                break
            }
            PI++
        }

        RtnPosition++
        pChar = Mid(DynAry, PI, 1)
        if (pChar >= StopC) {
            PI++
            if (Descending) {
                pChar = Mid(DynAry, PI, 1)
            }
        }

        if (pChar == "" || pChar >= EndC) {
            break
        }
    }

    return exit(RtnPosition, false);
}

// ================================================== Strings ====================================================
// ================================================== Strings ====================================================
// ================================================== Strings ====================================================

// Extend jQUery with $('p:textEquals("Hello World")');
$.expr[':'].textEquals = $.expr.createPseudo(function (arg) {
    return function (elem) {
        return $(elem).text().match("^" + arg + "$");
    };
});

String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
};

String.prototype.startsWith = function (needle) {
    return (this.indexOf(needle) == 0);
};


String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
};

function TagName(json, idx) {
    if (!isJSON(json)) return json;

    if (idx === undefined) idx = 1;
    var cnt = 0;
    for (var c in json) {
        if (typeof json[c] != "function" && c != "@attributes") {
            cnt++
        }
        if (cnt == idx) return c;
    }
    return "";
}


//   InStr (zero based)
function InStr(sp, s1, s2) {
    if (s2 === undefined) {
        s2 = s1;
        s1 = sp;
        sp = 0; // found at position 0
    };
    s1 = CStr(s1); s2 = CStr(s2)
    if (!s1 || !s2) return -1;
    return s1.indexOf(s2, sp);
}

function InStr1(sp, s1, s2) {
    if (s2 === undefined) {
        s2 = s1;
        s1 = sp;
        sp = 1; // found at position 1
    };
    s1 = CStr(s1); s2 = CStr(s2)
    if (!s1 || !s2) return 0;
    return s1.indexOf(s2, sp - 1) + 1;
}

//   InStr (zero based)
function InStrRev(sp, s1, s2) {
    if (s2 === undefined) {
        s2 = s1;
        s1 = sp;
        sp = 0; // found at position 0
    };
    s1 = CStr(s1); s2 = CStr(s2)
    if (!s1 || !s2) return -1; // Not found
    return s1.lastIndexOf(s2, sp);
}

//   InStrRev1 (one based)
function InStrRev1(sp, s1, s2) {
    if (s2 === undefined) {
        s2 = s1;
        s1 = sp;
        sp = 1; // found at position 1
    };
    s1 = CStr(s1); s2 = CStr(s2)
    if (!s1 || !s2) return 0; // Not found
    return s1.lastIndexOf(s2, sp - 1) + 1;
}

//   InStrI (zero based)
function InStrI(sp, s1, s2) {
    if (s2 === undefined) {
        s2 = s1;
        s1 = sp;
        sp = 0; // found at position 0
    };
    s1 = CStr(s1); s2 = CStr(s2)
    if (!s1 || !s2) return -1;
    return s1.toLowerCase().indexOf(s2.toLowerCase(), sp);
}

//   InStrI (one based)
function InStrI1(sp, s1, s2) {
    if (s2 === undefined) {
        s2 = s1;
        s1 = sp;
        sp = 1; // found at position 1
    };
    s1 = CStr(s1); s2 = CStr(s2)
    if (!s1 || !s2) return 0;
    return s1.toLowerCase().indexOf(s2.toLowerCase(), sp) + 1;
}

// Be careful using this  function in event procedure as it has side effects on activeProcess.Col1 + activeProcess.Col2
// Use the Field  function to return a substring located between specified Delimiters in string.
//
// Delimiter is any Character, including field mark, Value mark, &&
// subValue mark. It Delimits the start && end of the substring.  if the
// Delimiter equals more than one Character, only the first Character is;
// used.  Delimiters are ! returned with the substring.
//
// Occurrence specifies whiCh occurrence of the Delimiter is to be used as
// a terminator.  if (occurrence is less than one, one is assumed.

// Values are 0..N-1 
function Field1(Expr, Delimiter, Occurrence) { return Field(Expr, Delimiter, Occurrence, true) }

function Field(Expr, Delimiter, Occurrence, setC12) {
    var SI, L, C1, C2;

    if (typeof Expr != "string") Expr = CStr(Expr)
    if (typeof Delimiter != "string") Delimiter = CStr(Delimiter)
    if (typeof Occurrence != "number") Occurrence = parseInt("0" + Occurrence)

    if (Expr == "") {
        if (setC12 && activeProcess) {
            activeProcess.Col1 = 0; // Cause results to be 1..N
            activeProcess.Col2 = 1;
        }
        return "";
    }

    if (setC12 && activeProcess) {
        activeProcess.Col1 = 0; // Cause results to be 1..N
        activeProcess.Col2 = 0;
    }

    if (Occurrence > 1) {
        SI = Index(Expr, Delimiter, Occurrence - 1);
        if (SI == -1) return "";
        C1 = SI
        SI += Delimiter.length;
    } else {
        C1 = -1;
        SI = 0;
    }

    C2 = InStr(SI, Expr, Delimiter);
    if (C2 == -1) C2 = Expr.length;

    L = C2 - SI;

    if (setC12 && activeProcess) {
        activeProcess.Col1 = C1 + 1;  // Cause results to be 1..N for Compiler Field function
        activeProcess.Col2 = C2 + 1;  // Cause results to be 1..N
    }
    return Expr.substr(SI, L);
}

// Convert Characters one-by-one with ReplaceChars in Expr
function Convert(SearchChars, ReplaceChars, Expr) {
    var S, L;

    if (typeof SearchChars != "string") SearchChars = CStr(SearchChars);
    if (typeof ReplaceChars != "string") ReplaceChars = CStr(ReplaceChars);
    if (typeof Expr != "string") Expr = CStr(Expr);

    if (Expr == "") return "";
    L = SearchChars.length;

    for (var i = 0; i < L; i++) {
        S = SearchChars.substr(i, 1)
        if (Expr.indexOf(S) != -1) Expr = Expr.replaceAll(S, ReplaceChars.substr(i, 1));
    }
    return Expr;
}

// Add window.btoa
(function () {
    if ("btoa" in window) return;

    var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    window.btoa = function (chars) {
        var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        while (i < s.length) {
            chr1 = s.charCodeAt(i++);
            chr2 = s.charCodeAt(i++);
            chr3 = s.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);

        }

        return output;
    };
})();

function encode_base64(s) {
    if (typeof s != "string") s = CStr(s)
    return window.btoa(s);
}

function decode_base64(s) {
    if (typeof s != "string") s = CStr(s)

    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    // Drop characters out of range
    s = s.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < s.length) {
        enc1 = _keyStr.indexOf(s.charAt(i++));
        enc2 = _keyStr.indexOf(s.charAt(i++));
        enc3 = _keyStr.indexOf(s.charAt(i++));
        enc4 = _keyStr.indexOf(s.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }
    }

    return output;
}


////////////////////////////////////////////////// INPUT ////////////////////////////////////////////////// 
function fromFileDomain() {
    var U = window.myLocation();
    return Left(U, 5) == 'file:';
}

function Domain() {
    return fieldLeft(fieldLeft(dropLeft(window.myLocation(), '//'), '/'), ":", 1);
}

function HtmlInputBox(DefaultText, fromTCL, Echo, Prompt) {
    capturingKeys = false;
    var HTML = "";

    if (fromTCL) {
        if (isAdmin()) showAdminBar(); else hideAdminBar();
        var attachedDB = At_Session.Item('ATTACHEDDATABASE');
        if (attachedDB) attachedDB = "&nbsp" + attachedDB; else attachedDB = ""

        var title = $("title").html();
        if (!title) {
            title = "JSB (javascript) from " + (fromFileDomain() ? "file://" : Field(Domain(), '.', 1));
            if (fileSystem) title += " HTML5 FileSystem"; else title += " LocalStorage";
        }
        HTML += "<table id='tclInputGroup' class='tclInput'><tr><td id='txtInputPrompt'>" + htmlEncode(Prompt) + "</td><td id='tclInputInput'>"
        if (!isPhoneGap()) HTML += '<p class="tclInput watermark">' + title + '</p>'
        HTML += "<style class='tclInput'>#jsb { word-wrap: normal }</style>"
        HTML += "<input name='txtInput' id='txtInput' class='tclInput' style='z-index: " + nextZIndex();
    } else {
        HTML += "<table id='usrInputGroup'><tr><td id='txtInputPrompt'>" + htmlEncode(Prompt) + "</td><td id='usrInputInput'>"
        HTML += "<input name='txtInput' id='txtInput' class='txtInput' style='z-index: " + nextZIndex();
    }

    if (Echo == 0) {
        HTML += "; background-color: transparent; color: inherit; border-style:none;' type='password"
    }

    HTML += "' wrap='off' autofocus onkeydown='txtInput_keydown_event(event)' spellcheck='false' onfocus='this.value = this.value;'"
    if (DefaultText) HTML += " value='" + Replace(DefaultText, "'", "\\'") + "'"
    HTML += " autocomplete='off'></input>"

    HTML += "</td></tr><tr><td></td><td>";
    if (fromTCL) {

        HTML += "<span id='tclButtons' class= tclInput'>"
        HTML += "<button type='button' class='tclButtons tclInput' onclick='txtInput_CRLF(event)'>Go</button>"
        HTML += "<button type='button' class='tclButtons tclInput' onclick='tclHistoryPrevious(event)'>^</button>"
        HTML += "<button type='button' class='tclButtons tclInput' onclick='tclHistoryNext(event)'>v</button>"
        HTML += "<button type='button' class='tclButtons tclInput' onclick='tclInputX(event)'>X</button>"
        HTML += "</td></tr></span>"
    }
    HTML += "</table>"

    return HTML;
}

// Clear current command line (X)
function tclInputX(e) {
    var Prompt = $("#txtInputPrompt").text()
    var txtInput = inputBox();
    if (!txtInput) return;
    $(txtInput).val("");

    if ($(txtInput).hasClass("tclInput")) {
        main_VT100.ClearScreen()
        $('#jsb').append(HtmlInputBox("", true, true, Prompt))
    }

    historyIndex = cmdHistory.length;
    setFocus(true);
}


// We com here when the user clicks a submit button on a form (capturing form submits)
function onJsbFormSubmit(event) {
    var myForm = event.currentTarget;
    var id = $(myForm).attr('id')
    event = event || window.event;
    preventTheDefault(event);
    _isDirty = false

    if (jqGridVars.jqGridID) jqGrid_OnSubmit(jqGridVars.jqGridID);

    if (pendingResolve) {
        pauseResolve();
        return false
    }

    if (closeAPopUpDialog()) return false;

    debugger  // Why did we come here?
    return false
}


$("body").click(function (e) {
    if (e.target == this) setFocus()
});

////////////////////////////////////////////////// FLUSH ////////////////////////////////////////////////// 
////////////////////////////////////////////////// FLUSH ////////////////////////////////////////////////// 
////////////////////////////////////////////////// FLUSH ////////////////////////////////////////////////// 


// ================================================== XML & JSON Objects ====================================================
// ================================================== XML & JSON Objects ====================================================
// ================================================== XML & JSON Objects ====================================================

// See http://www.w3schools.com/Xml/xml_parser.asp
function parseXML(txt) {
    if (isXML(txt)) return txt;
    txt = CStr(txt);

    if (window.DOMParser) {
        var parser = new DOMParser();
        var xml = parser.parseFromString(txt, "text/html");
        //var ixml = xml.childNodes[1].innerHTML;
        //xml = parser.parseFromString(ixml, "text/html");
    } else {
        xml = new ActiveXObject("Microsoft.XMLDOM");
        xml.async = false;
        xml.loadXML(txt);
    }

    return xmlToJson(xml);
}

function cleanJSON(txt) {
    var Result = []
    var ProcessingString = false;
    var EndOnDel = "";
    var insideJSon = 0;

    if (typeof txt != "string") txt = CStr(txt);
    txt = txt.split("")

    for (var I = 0; I < txt.length; I++) {
        var C = txt[I];
        if (ProcessingString) {
            if (C == EndOnDel) {
                ProcessingString = false
                Result.push(C);
            } else if (C == "\\") {
                Result.push(C);
                I++
                Result.push(txt[I]);
            } else {
                Result.push(C);
            }
        } else if (C == am && insideJSon) {
            Result.push(cr)

        } else if (C == "'" || C == '"') {
            ProcessingString = true
            EndOnDel = C
            Result.push(C)

        } else if (C == "{" || C == "[") {
            insideJSon += 1;
            Result.push(C)

        } else if (C == "}" || C == "]") {
            insideJSon -= 1;
            Result.push(C)

        } else {
            Result.push(C)
        }
    }
    return Result.join("");
}

function parseJSON(txt, rtnIfErr) {
    if (isArray(txt) || isJSON(txt)) return txt; // already a json object or array

    // Special code to retreive a selectlist in full
    if (txt instanceof selectList) {
        var SelectedItems = [];
        var ids = txt.SelectedItemIDs;

        for (var i = 0; i < txt.SelectedItems.length; i++) {
            var ItemContent = txt.SelectedItems[i];
            var ItemID = ids[i];
            if (isJSON(ItemContent)) {
                SelectedItems = txt.SelectedItems;
                break;
            } else {
                SelectedItems.push({ "ItemID": ItemID, "ItemContent": ItemContent })
            }
        }

        clearSelect(txt)
        return { "SelectedItems": SelectedItems, "SelectedItemIDs": ids, "OnlyReturnItemIDs": SelectedItems == 0 }
    }

    var ctxt = cleanJSON(txt) // fix up am's
    if (!ctxt) return null;

    try {
        return unShiftArrays(eval("(" + ctxt + ")"));
    } catch (err) {
        if (activeProcess) activeProcess.At_Errors = err2String(err);
    }

    if (rtnIfErr === undefined) {
        if (activeProcess && activeProcess._activeRoutine) {
            if (activeProcess._activeRoutine._onErrorGoto) throw new Error(activeProcess.At_Errors);
            Alert("JSON parsing error in txt: " + Left(ctxt, 3000))
            singleStepping = true
        }
        return {}
    }

    return rtnIfErr;
}

function unShiftArrays(r) {
    if (r instanceof Array) {
        if (r[0] !== undefined) r.unshift(undefined);
        for (var i = 1; i < r.length; i++) {
            var e = r[i];
            if (e instanceof Array) r[i] = unShiftArrays(e)
        }
    } else if (isJSON(r)) {
        for (var tagName in r) {
            var e = r[tagName];
            if (e instanceof Array) r[tagName] = unShiftArrays(e);
        }
    }
    return r;
}

function shiftArrays(r) {
    if (r instanceof Array) {
        if (r[0] === undefined) r.shift();
        for (var i = 0; i < r.length; i++) {
            var e = r[i];
            if (e instanceof Array) r[i] = shiftArrays(e)
        }
    } else if (isJSON(r)) {
        for (var tagName in r) {
            var e = r[tagName];
            if (e instanceof Array) {
                r[tagName] = shiftArrays(e);
            }
        }
    }
    return r;
}

var jsonParse = (function () {
    var number = '(?:-?\\b(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?\\b)';
    var oneChar = '(?:[^\\0-\\x08\\x0a-\\x1f\"\\\\]|\\\\(?:[\"/\\\\bfnrt]|u[0-9A-Fa-f]{4}))';
    var string = '(?:\"' + oneChar + '*\")';

    var jsonToken = new RegExp(
        '(?:false|true|null|[\\{\\}\\[\\]]' + '|' + number + '|' + string + ')', 'g');

    // Matches escape sequences in a string literal
    var escapeSequence = new RegExp('\\\\(?:([^u])|u(.{4}))', 'g');

    // Decodes escape sequences in object literals
    var escapes = {
        "\"": "\"",
        "/": "/",
        "\\": "\\",
        "b": "\b",
        "f": "\f",
        "n": "\n",
        "r": "\r",
        "t": "\t"
    };

    function unescapeOne(_, ch, hex) {
        return ch ? escapes[ch] : String.fromCharCode(parseInt(hex, 16));
    }

    // A non-falsy value that coerces to the empty string when used as a key.
    var EMPTY_STRING = new String('');
    var SLASH = '\\';

    // Constructor to use based on an open token.
    var firstTokenCtors = {
        '{': Object,
        '[': Array
    };

    var hop = Object.hasOwnProperty;

    return function (json, opt_reviver) {
        // Split into tokens
        var toks = json.match(jsonToken);
        // Construct the object to return
        var result;
        var tok = toks[0];
        var topLevelPrimitive = false;
        if ('{' === tok) {
            result = {};
        } else if ('[' === tok) {
            result = [];
        } else {
            // The RFC only allows arrays or objects at the top level, but the $.parseJSON
            // defined by the EcmaScript 5 draft does allow strings, booleans, numbers, and null
            // at the top level.
            result = [];
            topLevelPrimitive = true;
        }

        // If undefined, the key in an object key/value record to use for the next
        // value parsed.
        var key;
        // Loop over remaining tokens maintaining a stack of uncompleted objects and
        // arrays.
        var stack = [result];
        for (var i = 1 - topLevelPrimitive, n = toks.length; i < n; ++i) {
            tok = toks[i];

            var cont;
            switch (tok.charCodeAt(0)) {
                default: // sign or digit
                    cont = stack[0];
                    cont[key || cont.length] = +(tok);
                    key = void 0;
                    break;
                case 0x22: // '"'
                    tok = tok.substring(1, tok.length - 1);
                    if (tok.indexOf(SLASH) !== -1) {
                        tok = tok.replace(escapeSequence, unescapeOne);
                    }
                    cont = stack[0];
                    if (!key) {
                        if (cont instanceof Array) {
                            key = cont.length;
                        } else {
                            key = tok || EMPTY_STRING; // Use as key for next value seen.
                            break;
                        }
                    }
                    cont[key] = tok;
                    key = void 0;
                    break;
                case 0x5b: // '['
                    cont = stack[0];
                    stack.unshift(cont[key || cont.length] = []);
                    key = void 0;
                    break;
                case 0x5d: // ']'
                    stack.shift();
                    break;
                case 0x66: // 'f'
                    cont = stack[0];
                    cont[key || cont.length] = false;
                    key = void 0;
                    break;
                case 0x6e: // 'n'
                    cont = stack[0];
                    cont[key || cont.length] = null;
                    key = void 0;
                    break;
                case 0x74: // 't'
                    cont = stack[0];
                    cont[key || cont.length] = true;
                    key = void 0;
                    break;
                case 0x7b: // '{'
                    cont = stack[0];
                    stack.unshift(cont[key || cont.length] = {});
                    key = void 0;
                    break;
                case 0x7d: // '}'
                    stack.shift();
                    break;
            }
        }
        // Fail if we've got an uncompleted object.
        if (topLevelPrimitive) {
            if (stack.length !== 1) {
                throw new Error();
            }
            result = result[0];
        } else {
            if (stack.length) {
                throw new Error();
            }
        }

        if (opt_reviver) {
            // Based on walk as implemented in http://www.json.org/json2.js
            var walk = function (holder, key) {
                var value = holder[key];
                if (value && typeof value === 'object') {
                    var toDelete = null;
                    for (var k in value) {
                        if (hop.call(value, k) && value !== holder) {
                            // Recurse to properties first.  This has the effect of causing
                            // the reviver to be called on the object graph depth-first.

                            // Since 'this' is bound to the holder of the property, the
                            // reviver can access sibling properties of k including ones
                            // that have not yet been revived.

                            // The value returned by the reviver is used in place of the
                            // current value of property k.
                            // If it returns undefined then the property is deleted.
                            var v = walk(value, k);
                            if (v !== void 0) {
                                value[k] = v;
                            } else {
                                // Deleting properties inside the loop has vaguely defined
                                // semantics in ES3 and ES3.1.
                                if (!toDelete) {
                                    toDelete = [];
                                }
                                toDelete.push(k);
                            }
                        }
                    }
                    if (toDelete) {
                        for (var i = toDelete.length; --i >= 0;) {
                            delete value[toDelete[i]];
                        }
                    }
                }
                return opt_reviver.call(holder, key, value);
            };
            result = walk({
                '': result
            }, '');
        }

        return result;
    };
})();

function xmlToJson(xmlobj) {
    var obj = {};

    if (xmlobj.nodeType == 1) { // element
        // do attributes
        if (xmlobj.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xmlobj.attributes.length; j++) {
                var attribute = xmlobj.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }

    } else if (xmlobj.nodeType == 3) { // text
        obj = xmlobj.nodeValue;

    } else if (xmlobj.nodeType == 9) { // document HTML
        var js;
        if (xmlobj.childNodes.item(0).childNodes.item(1).childNodes.length == 1) {
            js = xmlToJson(xmlobj.childNodes.item(0).childNodes.item(1).childNodes.item(0))
        } else {
            js = xmlToJson(xmlobj.childNodes.item(0).childNodes.item(1))
        }
        return js
    }

    // do children
    if (xmlobj.hasChildNodes()) {
        for (var i = 0; i < xmlobj.childNodes.length; i++) {
            var item = xmlobj.childNodes.item(i);
            var nodeName = item.nodeName;
            if (obj[nodeName] === undefined) {
                obj[nodeName] = xmlToJson(item);
            } else {
                // if not already an array, convert the type to an array
                if (!isArray(obj[nodeName])) {
                    var old = obj[nodeName];
                    obj[nodeName] = new Array;
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    obj.child = function (idx) {
        var cnt = 1;
        for (var c in this) {
            obj = this[c]
            if (typeof obj != "function" && c != "@attributes") {
                if (idx == cnt) return obj
                cnt++
            }
        }
    }

    return obj;
};

// Return Keys of a JSON object
function Keys(x) {
    var keys = [undefined];

    if (isXML(x)) {
        x = x.childNodes[0].childNodes[1].childNodes;
        for (var key in x) {
            if (x[key].nodeName) keys.push(x[key].nodeName);
        }
        return keys;
    }

    if (isJSON(x)) return keys.concat(Object.keys(x));
}

// 1st call with indent = 0
function JSON2XML(obj, indent) {
    if (!indent) indent = 0;
    var rString = "\n";
    var pad = Space(indent);

    if (obj && typeof obj === "object") {
        if (IsArray(obj)) {
            for (var i = LBound(obj); i < obj.length; i++) {
                rString += pad + "<item>" + obj[i] + "</item>\n";
            }
            rString = rString.substr(0, rString.length - 1)
        } else {
            for (var i in obj) {
                var val = JSON2XML(obj[i], indent + 1);
                if (!val)
                    return false;
                rString += ((rString === "\n") ? "" : "\n") + pad + "<" + i + ">" + val + ((typeof obj[i] === "object") ? "\n" + pad : "") + "</" + i + ">";
            }
        }
    } else if (typeof obj === "string") {
        rString = obj;
    } else if (obj.toString) {
        rString = obj.toString();
    } else {
        return false;
    }
    return rString;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ================================================================== RPC Code  ========================================================================
// ================================================================== RPC Code  ========================================================================
// ================================================================== RPC Code  ========================================================================
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function asyncRpcsid() {
    if (window._rpcsid_) return window._rpcsid_;
    window._rpcsid_ = $('#_SID_').val();
    if (!window._rpcsid_) window._rpcsid_ = $('[name="_SID_"]').val();
    if (!window._rpcsid_) return;
    window._rpcsid_ = Replace(window._rpcsid_, "jsb:", "rpc:")
    if (!window._rpcServerUrl) window._rpcServerUrl = jsbRootAct();
    return window._rpcsid_;
}

function verifyRPC(rdata, errpos) {
    var jData;

    if (isString(rdata)) {
        if (rdata.startsWith("0x")) rdata = XTS(rdata.substr(2));
        if (rdata.startsWith("{")) jData = string2json(rdata);
    } else {
        jData = rdata;
    }

    if (!errpos) return jData;
    if (!isJSON(jData)) throw new Error("Bad rpc result (not json): " + Left(rdata, 80));
    if (!jData._restFunctionResult && jData["_p" + errpos]) throw new Error(jData["_p" + errpos]);

    return jData;
}

//  Remote Procedure ID when logged in
var server_rpcsid, server_rpcgid;

async function asyncRpcLogin(username, password, serverUrl) {
    serverUrl += "";
    if (serverUrl.startsWith("/")) serverUrl = serverUrl.substring(1);
    if (!serverUrl.startsWith("http")) serverUrl = jsbRoot() + serverUrl;
    if (!serverUrl.endsWith("/")) serverUrl += "/";

    // @@ServerLogin(UserName, Password, InitialDB, Errors)

    var result = verifyRPC(await asyncAjaxCall("GET", serverUrl + "serverlogin?_p1=" + urlEncode(username) + "&_p2=" + urlEncode(password)), 4);
    if (!result._restFunctionResult) throw new Error('asyncRpcLogin failure');

    if (result._rpcsid_) {
        window._rpcsid_ = result._rpcsid_;
        window._rpcServerUrl = serverUrl; // Url logged into
    }

    return result["_p4"];
}

/* async */ function asyncRpcRequest(rpcSubroutineName) {
    var parameters = [];
    var url = window._rpcServerUrl; // Logged into
    var rpcsid = '';

    if (window._rpcServerUrl) {
        // we are logged in by rpcLogin
        url = window._rpcServerUrl;
    } else {
        url = myRpcUrl;
    }

    if (server_rpcsid) rpcsid = server_rpcsid;


    var ByRefsCallBack = undefined;
    // start at 2nd arg [1], skipping rpcSubroutineName
    for (var i = 1; i < arguments.length; i++) {
        var a = arguments[i];
        if (i == arguments.length - 1 && isFunction(a)) {
            ByRefsCallBack = a;
            break;
        };
        a = encodeURIComponent(a)
        if (arguments[i] === undefined) a = '';
        parameters.push('_p' + i + '=' + a)
    }

    parameters.push("_rpcsid_=" + rpcsid); // Push even if empty - shows we are an rpc request

    var parameterList = parameters.join('&');

    if (window.doDebug || singleStepping) showStatus('RPC:' + rpcSubroutineName)

    return new Promise((resolve, reject) => {
        var jQueryAjax = {}
        jQuery.support.cors = true; // allow cross-site scripting
        jQueryAjax.crossDomain = true;
        jQueryAjax.dataType = "text";
        jQueryAjax.url = url + rpcSubroutineName;

        // jQueryAjax.beforeSend = function (xhr) { xhr.setRequestHeader('_rpcsid_', rpcsid); }

        // if (parameterList.length + jQueryAjax.url.length > 500) { // Internet explorer has a URL limit of 2083 bytes, leave a little wiggle room, '61 was a good year for a birthday ;)
        if (Len(parameterList) > 600) {
            jQueryAjax.method = 'post';
            jQueryAjax.data = parameterList;
        } else {
            jQueryAjax.method = 'get'
            jQueryAjax.url += '?' + parameterList;
        }

        jQueryAjax.error = function (jqXHR, textStatus, errorThrown) {
            var Err = crlf + 'An error occured in a remote procedure call to ' + jQueryAjax.method + " " + jQueryAjax.url + crlf + crlf
            Err += 'textStatus: ' + textStatus + crlf + crlf;
            Err += 'errorThrown: ' + errorThrown + crlf + crlf;
            if (jqXHR && jqXHR.responseText) Err += 'jqXHR.responseText: ' + jqXHR.responseText + crlf + crlf;
            stopNetworkingTrace(rpcSubroutineName, "FAILED: " + textStatus + errorThrown);
            reject(Err);
        }

        jQueryAjax.success = function (pdata, textStatus, request) {
            if (Left(pdata, 2) != "0x") {
                if (InStr(pdata, "<form") > 0) pdata = dropRight(dropLeft(dropLeft(pdata, "<form"), ">"), "</form")
                return jQueryAjax.error(null, "non-json data", htmlDecode(pdata));
            }

            pdata = XTS(Mid(pdata, 2));
            pdata = parseJSON(pdata, { _restFunctionResult: false });

            stopNetworkingTrace(jQueryAjax.url, "SUCCESS");

            var NET_SessionId = request.getResponseHeader('NET_SessionId')

            if (window.doDebug) showStatus(fieldRight(fieldLeft(jQueryAjax.url, "?"), "/"), "&#x2713");

            if (pdata._rpcsid_) {
                if (!server_rpcsid && At_Session) {
                    At_Session.lastget_rpcsid_ = pdata._rpcsid_;
                    At_Session.rpc_last_address = url;
                }
                delete pdata._rpcsid_
            }

            if (pdata._rpcgid_) {
                server_rpcgid = pdata._rpcgid_;
                delete pdata._rpcgid_
            }

            if (ByRefsCallBack && arguments.length > 1) {
                switch (arguments.length - 1) {
                    case 1: ByRefsCallBack(pdata._p1); break;
                    case 2: ByRefsCallBack(pdata._p1, pdata._p2); break;
                    case 3: ByRefsCallBack(pdata._p1, pdata._p2, pdata._p3); break;
                    case 4: ByRefsCallBack(pdata._p1, pdata._p2, pdata._p3, pdata._p4); break;
                    case 5: ByRefsCallBack(pdata._p1, pdata._p2, pdata._p3, pdata._p4, pdata._p5); break;
                    case 6: ByRefsCallBack(pdata._p1, pdata._p2, pdata._p3, pdata._p4, pdata._p5, pdata._p6); break;
                    case 7: ByRefsCallBack(pdata._p1, pdata._p2, pdata._p3, pdata._p4, pdata._p5, pdata._p6, pdata._p7); break;
                    case 8: ByRefsCallBack(pdata._p1, pdata._p2, pdata._p3, pdata._p4, pdata._p5, pdata._p6, pdata._p7, pdata._p8); break;
                    case 9: ByRefsCallBack(pdata._p1, pdata._p2, pdata._p3, pdata._p4, pdata._p5, pdata._p6, pdata._p7, pdata._p8, pdata._p9); break;
                }
            }

            if (pdata._restFunctionResult) {
                stopNetworkingTrace(rpcSubroutineName, "Success");
                resolve(pdata._restFunctionResult);
            } else {
                var msg;
                for (var tag in pdata) {
                    if (tag != "_restFunctionResult") { msg = pdata[tag]; break }
                }
                stopNetworkingTrace(rpcSubroutineName, "Failed: " + msg);
                if (activeProcess) activeProcess.At_Errors = msg;
                resolve(pdata._restFunctionResult);
            }
        }

        startNetworkingTrace(rpcSubroutineName)

        setTimeout(function () { jQuery.ajax(jQueryAjax) }, 22);  // Must return null before running this
    });
}

async function asyncRpcOpen(dictdata, fname) {
    if (!rpcsid() || !window._rpcServerUrl) throw new Error(`RPC: not logged in`)
    if (!dictdata) dictdata = "data";

    // @@ServerOpen(ByVal DictData, filename, fhandle, Errors) 
    var result = verifyRPC(await asyncAjaxCall("GET", window._rpcServerUrl + "serveropen?_p1=" + urlEncode(dictdata) + "&_p2=" + urlEncode(fname) + "&_rpcsid_=" + window._rpcsid_), 4);
    if (!result._restFunctionResult) return null;
    return result._p3;
}

async function asyncRpcRead(fhandle, iname) {
    if (!rpcsid() || !window._rpcServerUrl) throw new Error(`RPC: not logged in`)

    // @@ServerRead (U) (JSon) (Item, fhandle, IName, Errors) 
    var result = verifyRPC(await asyncAjaxCall("GET", window._rpcServerUrl + "serverread?_p1=&_p2=" + urlEncode(fhandle) + "&_p3=" + urlEncode(iname) + "&_rpcsid_=" + window._rpcsid_), 4);
    if (!result._restFunctionResult) return null;
    return result;
}

async function asyncRpcWrite(Item, fhandle, iname) {
    if (!rpcsid() || !window._rpcServerUrl) throw new Error(`RPC: not logged in`)

    // @@ServerWrite(U) (JSon) (Item, fhandle, IName, Errors) 
    // Item = "0x" + STX(Item);

    var result = verifyRPC(await asyncAjaxCall("POST", window._rpcServerUrl + "serverwrite", "_p1=" + urlEncode(Item) + "&_p2=" + urlEncode(fhandle) + "&_p3=" + urlEncode(iname) + "&_p4=&_p5=" + Len(Item) + "&_rpcsid_=" + window._rpcsid_), 4);
    if (!result._restFunctionResult) return null;
    return result;
}

async function asyncRpcDelete(fhandle, iname) {
    if (!rpcsid() || !window._rpcServerUrl) throw new Error(`RPC: not logged in`)

    // @@ServerDeleteItem(fhandle, IName, Errors) 
    var result = verifyRPC(await asyncAjaxCall("GET", window._rpcServerUrl + "serverdeleteitem?_p1=" + urlEncode(fhandle) + "&_p2=" + urlEncode(iname) + "&_rpcsid_=" + window._rpcsid_), 3);
    if (!result._restFunctionResult) return null;
    return result;
}

async function asyncRpcListFiles() {
    if (!rpcsid() || !window._rpcServerUrl) throw new Error(`RPC: not logged in`)

    // @@ServerListFiles(Results, Errors)
    var result = verifyRPC(await asyncAjaxCall("GET", window._rpcServerUrl + "serverlistfiles?_rpcsid_=" + window._rpcsid_), 2);
    if (!result._restFunctionResult) return null;
    return result;
}

async function asyncRpcSelectFile(fhandle, whereClause) {
    if (!rpcsid() || !window._rpcServerUrl) throw new Error(`RPC: not logged in`)

    // ServerSelect(COLS, fhandle, WhereClause, Errors, Results) 
    var result = verifyRPC(await asyncAjaxCall("GET", window._rpcServerUrl + "serverselect?_p1=&_p2=" + urlEncode(fhandle) + "&_p3=" + urlEncode(whereClause) + "&_rpcsid_=" + window._rpcsid_), 4);
    if (!result._restFunctionResult) return null;
    return result;
}

async function asyncRpcClearFile(fhandle) {
    if (!rpcsid() || !window._rpcServerUrl) throw new Error(`RPC: not logged in`)

    // @@ServerClearFile(fhandle, Errors) 
    var result = verifyRPC(await asyncAjaxCall("GET", window._rpcServerUrl + "serverclearfile?_p1=" + urlEncode(fhandle) + "&_rpcsid_=" + window._rpcsid_), 2);
    if (!result._restFunctionResult) return null;
    return result;
}

async function asyncRpcDeleteFile(fhandle) {
    if (!rpcsid() || !window._rpcServerUrl) throw new Error(`RPC: not logged in`)

    var onSuccess = onsuccess;
    var onFailure = onfailure;

    // @@ServerClearFile(fhandle, Errors) 
    var result = verifyRPC(await asyncAjaxCall("GET", window._rpcServerUrl + "serverdeletefile?_p1=" + urlEncode(fhandle) + "&_rpcsid_=" + window._rpcsid_), 2);
    if (!result._restFunctionResult) return null;
    return result;
}

async function asyncRpcCreateFile(fname) {
    if (!rpcsid() || !window._rpcServerUrl) throw new Error(`RPC: not logged in`)

    var onSuccess = onsuccess;
    var onFailure = onfailure;

    // @@ServerCreateFile(filename, fhandle, Errors)
    var result = verifyRPC(await asyncAjaxCall("GET", window._rpcServerUrl + "servercreatefile?_p1=" + urlEncode(fname) + "&_rpcsid_=" + window._rpcsid_), 3);
    if (!result._restFunctionResult) return null;
    return result;
}

async function asyncRpcCompile(fhandle, iname) {
    if (!rpcsid() || !window._rpcServerUrl) throw new Error(`RPC: not logged in`)

    var onSuccess = onsuccess;
    var onFailure = onfailure;

    var result = verifyRPC(await asyncAjaxCall("GET", window._rpcServerUrl + "servercompile?_p1=" + urlEncode(fhandle) + "&_p2=" + urlEncode(iname) + "&_rpcsid_=" + window._rpcsid_), 3);
    if (!result._restFunctionResult) return null;
    return result;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// =========================================== Everything from here down is in common with JSBLib.js  =================================================
// =========================================== Everything from here down is in common with JSBLib.js  =================================================
// =========================================== Everything from here down is in common with JSBLib.js  =================================================
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var loadcnt = 0;
var alreadyLoaded = {}
var linkWaits = 0;

// loadFile('js/test.js', { extra: 'ko' }, onsuccess, onfailure)
// loadFile('css/test.css', onsuccess, onfailure)

function loadFile(httppath, attributes, onsuccess, onfailure) {
    if (httppath.startsWith("./")) httppath = jsbRoot() + httppath.substr(2);
    if (alreadyLoaded[httppath]) if (onsuccess) return onsuccess(); else return true;

    if (isFunction(attributes)) {
        onfailure = onsuccess;
        onsuccess = attributes;
        attributes = undefined;
    }

    loadcnt++;

    if (window.doDebug || window.singleStepping) showStatus("Loading " + httppath);

    var head = document.getElementsByTagName("head")[0];
    var element;
    var fakeLoadCSS = false;
    var needCallBack = (onsuccess || onfailure)
    var noLoadEvent = false;
    var loadingCSS = httppath.indexOf(".css") != -1;

    if (loadingCSS) {
        noLoadEvent = !!navigator.userAgent.match(' Safari/') && !navigator.userAgent.match(' Chrom') && !!navigator.userAgent.match(' Version/5.');
        element = document.createElement("link")
        element.rel = "stylesheet"
        element.type = "text/css"
        element.href = httppath

    } else {
        element = document.createElement("script");
        element.type = "text/javascript"
        element.src = fullUrlPath(httppath);
    }

    if (attributes) {
        for (var key in attributes) {
            element.setAttribute(key, attributes[key])
        }
    }

    // if we don't need a callback or we don't have callbacks then just append this to the head
    if (!needCallBack || noLoadEvent) {
        head.appendChild(element);
        alreadyLoaded[httppath] = true
        if (onsuccess) onsuccess(); // assume success
        return;
    }

    element.needIt = true;
    element.onload = function () {
        if (element.needIt) {
            linkWaits--;
            element.needIt = false;
            alreadyLoaded[httppath] = true
            if (onsuccess || onfailure) stopNetworkingTrace(httppath, "SUCCESS");
            if (onsuccess) onsuccess();
        }
    };

    element.onerror = function (err) {
        if (element.needIt) {
            linkWaits--;
            element.needIt = false;
            if (onsuccess || onfailure) stopNetworkingTrace(httppath, "FAILED");
            if (onfailure) onfailure(err)
        }
    }

    element.onreadystatechange = function (e) {
        if (element.needIt && (this.readyState == 'complete')) { // I get a loaded even on an error
            linkWaits--;
            element.needIt = false;
            alreadyLoaded[httppath] = true
            stopNetworkingTrace(httppath, "SUCCESS");
            if (onsuccess || onfailure) stopNetworkingTrace(httppath, "SUCCESS");
            if (onsuccess) onsuccess();
        }
    }


    linkWaits++;
    if (onsuccess || onfailure) startNetworkingTrace(httppath);

    head.appendChild(element);
    return false;
}

function targetIsLocal(toURL) {
    toURL += "";
    if (toURL.startsWith("?")) toURL = Mid(toURL, 1);

    var destination = LCase(Field(Field(toURL, "#", 1), "?", 1))

    // If we don't have a protocol, give us jsbRootAct as a base
    if (InStr(destination, "//") == -1) {
        toURL = jsbRootAct() + "?" + Replace(toURL, "?", "&");
        destination = Field(Field(toURL, "#", 1), "?", 1)
    }

    if (destination == LCase(jsbRoot()) + "close_html") return true;

    // allow different page (drop the /xxx.html) - still comes from the same server
    var runningPath = LCase(jsbRootAct())
    runningPath = dropIfRight(runningPath, "/")
    destination = dropIfRight(destination, "/")

    return runningPath == LCase(destination)
}

function fullUrlPath(url) {
    url += "";
    if (url.startsWith("www.")) url = "http://" + url;

    // if request is relitive to jsbRoot (starts only with /)
    if (url.startsWith("/") && Left(url, 2) != "//") url = jsbRoot() + Mid(url, 1);

    // if (url.startsWith("./js/")) url = jsbRoot() + Mid(url, 2); 

    if (url.startsWith("./")) url = jsbRoot() + Mid(url, 2);

    if (InStr(url, "//") == -1) {
        if (jsbRoot().startsWith('file://')) url = Field(window.location.href, "?", 1) + "?" + url; else
            if (InStr(url, "?") > 0) url = jsbRootAct() + url; else url = jsbRootAct() + "?" + url; // Change(url, "?", "&");
    }

    if (InStr(url, "//") == -1) {
        if (InStr(url, "?") > 0) url = jsbRootAct() + url; else url = jsbRootAct() + "?" + url; // Change(url, "?", "&");
    }

    // pass along NET_SessionId if not running in Chrome (Chrome does this automatically) - Enables additional tabs to be connected to the same account
    if (!isChrome() && formVar("ASP.NET_SessionId", true)) {
        if (InStr(url, "?") > 0) url += "&"; else url += "?"
        url += "ASP.NET_SessionId=" + formVar("ASP.NET_SessionId", true);
    }

    return url
}

function jsonEscapeString(s) {
    var escapechars = '\\\b\f\r\n\t"\xFF\xFE\xFD\xFC';
    var replacechars = '\\bfrnt"'
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        var pos = escapechars.indexOf(c)
        if (pos >= 0) {
            var repChar = replacechars.charAt(pos);
            if (repChar) {
                s = s.slice(0, i) + "\\" + repChar + s.slice(i + 1); i += 1;
            } else {
                s = s.slice(0, i) + "\\x" + DTX2(Seq(c)) + s.slice(i + 1); i += 3;
            }
        }
    }
    return s
}

function asyncAjaxCall(pMethod, pUrl, pBody, pMsg, pJsonHeaders) {
    return new Promise((resolve, reject) => {
        ajaxCall(pMethod, pUrl, pBody, results => resolve(results), errMsg => reject(errmsg), pMsg, pJsonHeaders)
    });
}

var nestedAjax = false;

function ajaxCall(pMethod, pUrl, pBody, pOnSuccess, pOnFailure, pMsg, pJsonHeaders) {
    // Save parameters so we can see them in the call backs
    var method = pMethod;
    var url = pUrl + "";
    var body = pBody;
    var onSuccess = pOnSuccess;
    var onFailure = pOnFailure;
    var msg = pMsg;
    var holdLoc = window.jsbLocation;
    var jsonHeaders = pJsonHeaders;
    var cmds;

    if (!jsonHeaders) jsonHeaders = {};

    if (Left(url, 4) != "http") {
        if (url.startsWith("/?")) {
            url = jsbRoot() + Mid(url, 2).replace(/&/, '?');

        } else if (url.startsWith("/")) {
            url = jsbRoot() + Mid(url, 1);

        } else if (url.startsWith("./?")) {
            url = jsbRoot() + Mid(url, 3).replace(/&/, '?');

        } else if (url.startsWith("./")) {
            url = jsbRoot() + Mid(url, 2);

        } else if (window._rpcServerUrl) {
            url = window._rpcServerUrl + url; // Logged it

        } else if (window.myRpcUrl) {
            url = window.myRpcUrl + url; // have a dafault

        } else {
            url = jsbRootAct() + url;
        }
    }

    var ajaxSuccess = function (results, status) {
        nestedAjax = false;
        if (holdLoc) window.jsbLocation = holdLoc;
        stopNetworkingTrace(msg, "SUCCESS: " + status)
        if (onSuccess) onSuccess(results);
    }

    var ajaxFailed = function (errMsg) {
        if (errMsg.message) errMsg = errMsg.message;
        nestedAjax = false;
        if (holdLoc) window.jsbLocation = holdLoc;
        stopNetworkingTrace(msg, "FAILED: " + errMsg)
        if (onFailure) onFailure(errMsg); else alert(errMsg)
    }

    // Force AJAX calls to be single threaded so that cascading combobox work in order of parent...to chilren
    var waitTilQuiet = function () {
        if (nestedAjax) {
            setTimeout(waitTilQuiet, 10)
            return
        }
        nestedAjax = true

        // fake ajax calls for local JSB routines
        if (targetIsLocal(url)) {
            var Sentence = Field(Field(url, "#", 1), "?", 1)
            if (InStr(Sentence, "//") == -1) Sentence = jsbRootAct() + "?" + Replace(Sentence, "?", "&");
            if (body) {
                if (InStr(Sentence, "?") > 0) Sentence += "&"; else Sentence += "?"
                Sentence += body
            }

            cmds = urlSentence(Sentence, true)
            if (!msg) msg = "TCL: " + cmds.tclCmd;
            startNetworkingTrace(msg);

            jsbLocation = cmds.url
            new jsbExecute(cmds.tclCmd, function (rtnData) {
                try {
                    ajaxSuccess(parseJSON(rtnData))
                } catch (err) {
                    ajaxFailed(err.message)
                }
            }, true)

        } else {
            // A JSB post back needs a flag
            if (method != "GET") {
                var lRoot = jsbRoot();
                var lUrl = LCase(url);
                if (Left(lUrl, Len(lRoot)) == lRoot) {
                    if (body) body += "&";
                    body += "isJsbPost=1"
                }
            }

            $.support.cors = true; // allow cross-site scripting
            $.ajax({
                type: method,
                crossDomain: true,
                url: url,
                data: body,
                headers: jsonHeaders,
                success: function (results, textStatus) {
                    ajaxSuccess(results, textStatus);
                },
                failure: function (errMsg) {
                    ajaxFailed(errMsg)
                },
                dataFilter: function (data) {
                    // jQuery already parses json data
                    if (data.startsWith("0x")) return data;
                    return makePickish(data);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.status == 200) {
                        ajaxSuccess(jqXHR.responseText, textStatus);
                    } else {
                        ajaxFailed(errorThrown)
                    }
                }
            });
        }
    }

    waitTilQuiet();
}


function urlSentence(Url) {
    var tclCmd;

    if (Url) tclCmd = Url; else tclCmd = myLocation();
    var oUrl = tclCmd;

    if (InStr(tclCmd, '#') >= 0) {
        tclCmd = Field(Field(tclCmd, '#', 2), '?', 1);
    } else {
        if (InStr(tclCmd, '?') >= 0) {
            tclCmd = Field(tclCmd, '?', DCount(tclCmd, '?'));
        } else {
            tclCmd = Field(tclCmd, '/', DCount(tclCmd, '/'));
        };
    };

    if (InStr(tclCmd, "(") != -1 && InStr(tclCmd, ")") != -1) {
        var uptoCmd = Left(oUrl, Len(oUrl) - Len(tclCmd))

        // Change func(a,b,c) into func a b c
        var a = Split(tclCmd, 1) // Split on jsb tokens
        var tclCmd = ""
        var newUrl = uptoCmd
        var pno = 0;
        var cc = (InStr(newUrl, "?") >= 0) ? "&" : "?";

        for (var i = LBound(a); i <= UBound(a); i++) {
            var t = a[i]
            var u = a[i]

            if (i > LBound(a)) {
                if (u == ")") break;

                if (u == "(" || u == ",") {
                    pno++;
                    u = cc + "_p" + CStr(pno) + "="
                    t = " "
                    cc = "&"
                }
            }

            tclCmd += t
            newUrl += u
        }

        Url = newUrl

    } else {
        tclCmd = (Field(tclCmd, '&noCache=', 1));
        tclCmd = (Change(tclCmd, '&', ' '));

        var splitC = "";
        if (InStr(tclCmd, " ") >= 0) splitC = ' '; else splitC = '_';
        var PgmName = Field(tclCmd, splitC, 1);
        if (isWebPage(tclCmd)) {
            tclCmd = dropRight(tclCmd, '.');
            tclCmd = dropLeft(tclCmd, splitC);
            if (tclCmd) {
                if (splitC == ' ') tclCmd = PgmName + ' ' + tclCmd;
            } else {
                tclCmd = PgmName;
            };
        };
    }

    return { tclCmd: urlDecode(tclCmd), url: Url }
}

var historyName = '';
var cmdHistory = [];
var historyIndex = 0;

function jsbDocumentIsReady() {
    $("#jsb").on("change", "input[name][type!='button'][type!='submit'],select", (function () {
        window._isDirty = true;
    }));

    // Load history (TCL always sets and restores this - if not from TCL assume userinput)
    if (!historyName) changeHistoryStack('userinput');

    fixJQuery()

    // if we resize screen, make sure active element is in viewport
    var _originalSize = $(window).width() + $(window).height()
    $(window).resize(function () {
        if ($(window).width() + $(window).height() != _originalSize) {
            if (!$(document.activeElement).isInViewport()) $(document.activeElement).scrollIntoView();
        }
    });

    // setFocus(true) - happens now with autofocus attribute
}

jQuery.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

jQuery.fn.reverse = function () {
    return this.pushStack(this.get().reverse(), arguments);
};

// With devExpress, bootstrap and jquery, sometimes $.fn.tooltip get's lost
function fixJQuery() {
    jQuery.fn.load = function (callback) { $(window).on("load", callback) };

    if (!isFunction($.fn.isInViewport)) {
        $.fn.isInViewport = function () {
            var elementTop = $(this).offset().top;
            var elementBottom = elementTop + $(this).outerHeight();
            var viewportTop = $(window).scrollTop();
            var viewportBottom = viewportTop + $(window).height();
            return elementBottom > viewportTop && elementTop < viewportBottom;
        }
    }

    if (!isFunction($.fn.scrollIntoView)) {
        $.fn.scrollIntoView = function (behavior) {
            var element = $(this)[0];
            if (element.scrollIntoView) element.scrollIntoView(behavior)
        }
    }

    if (!isFunction(Function.prototype.clone)) {
        Function.prototype.clone = function () {
            var that = this;
            var temp = function temporary() { return that.apply(this, arguments); };
            for (var key in this) {
                if (this.hasOwnProperty(key)) {
                    temp[key] = this[key];
                }
            }
            return temp;
        };
    }

    if (!window.toolTipFunction && isFunction($.fn.tooltip)) window.toolTipFunction = $.fn.tooltip.clone(); // Make a copy so that the debugger can use this.  (devExpress is clobbing this with bootstrap)

    if (!isFunction($.fn.tooltip) && isFunction(window.toolTipFunction)) {
        $.fn.tooltip = window.toolTipFunction.clone(); // devExpress is clobbing this with bootstrap
    }
}

function changeHistoryStack(newHistoryName) {
    var s = GetCookie(newHistoryName);
    historyName = newHistoryName;

    if (s)
        cmdHistory = Split(s, am);
    else
        cmdHistory = [];

    historyIndex = cmdHistory.length;
}

function setKbd(pgmName) { return changeHistoryStack(pgmName) }

function pushHistory(s) {
    if (!s) return;
    if (!cmdHistory) cmdHistory = [s];
    if (cmdHistory[cmdHistory.length - 1] != s) {
        if (cmdHistory.length > 17) cmdHistory.splice(0, cmdHistory.length - 17);
        cmdHistory.push(s)
    }

    SetCookie(historyName, Join(cmdHistory, am))
    historyIndex = cmdHistory.length
}

function tclHistoryPrevious(e) {
    var txtInput = inputBox();
    if (!txtInput) return;
    if ($(txtInput).attr("type") == "password") return;

    if (e && e.preDefault) e.preDefault();
    if (historyIndex > 0) historyIndex--;
    if (historyIndex <= cmdHistory.length) $(txtInput).val(cmdHistory[historyIndex]); else $(txtInput).val("");
    setFocus(true)
}

function tclHistoryNext(e) {
    var txtInput = inputBox();
    if (!txtInput) return;
    if ($(txtInput).attr("type") == "password") return;

    if (e && e.preDefault) e.preDefault();
    if (historyIndex < cmdHistory.length) historyIndex++;
    if (historyIndex <= cmdHistory.length) $(txtInput).val(cmdHistory[historyIndex]);
    setFocus(true)
}

function removeInputBox() {
    var prompt = $('#txtInputPrompt').html();
    $('#tclInputGroup').replaceWith(prompt);
    $('#usrInputGroup').replaceWith(prompt);
    $('#txtInput').remove()
}

function setFocus(waitALittle) {
    if (nestedInGo || waitALittle) {
        // Wait until we are idle
        window.setTimeout(setFocus, 50);
    } else {
        var txtInput = inputBox();
        if (!txtInput) return;
        if ($(txtInput).is(":focus")) return;
        if ($(txtInput).css('display') == 'none') return;

        var btns = $('#tclButtons')
        if ($(btns).length && !$(btns).isInViewport()) {
            $(btns).scrollIntoView(false);
        } else {
            if (!$(txtInput).isInViewport()) $(txtInput).scrollIntoView(false);
        }
        $(txtInput).focus()
    }
}

function makePickish(s) {
    s = CStr(s).split(""); // convert to Array
    for (var idx = 0; idx < s.length; idx++) {
        var c = s[idx];
        var i = c.charCodeAt(0)
        if (i == 160) c = " "
        if (i >= 8216 && i <= 8219) c = "'"
        if (i >= 8220 && i <= 8223) c = "'"

        if (i == 8719) c = sm
        if (i == 8593) c = am
        if (i == 8969) c = vm
        if (i == 8226) c = svm
        if (i == 65533) c = am

        s[idx] = c;
    }
    return s.join("")
}

function clone(obj, allProperties) {
    if (obj instanceof Array) {
        var newarray = obj.slice(0); // copy who thing
        for (var i = 0; i < newarray.length; i++) {
            var v = newarray[i]
            if (typeof v == "object" && v != null) newarray[i] = clone(v);
        }
        return newarray
    }

    if (obj == null) return obj;

    if (typeof obj == "object") {
        var newobj = {};
        for (var tag in obj) {
            if (obj.hasOwnProperty(tag) || allProperties) {
                newobj[tag] = clone(obj[tag]);
            }
        }
        return newobj;
    }

    return obj
}

//
//  Example: MsgBox("Title is here", "<b>Message</b>\nHere\nOK", "Yes|Y,*No|N, Maybe", null, null, function(ans) { Alert(ans) });
//    * denotes Default
//    | seperates Text from Returned Value
//    make sure your Title and/or your Msg starts with "<" for HTML or not for TEXT
//
//  Returns "" if no answer given (Closed the dialog)
//
//
function MsgBox(title, Msg, Questions, width, height, callBack) {
    var msgBoxAnswer = "";

    if (!Msg) { Msg = title; title = '' }
    if (!width) width = "auto";
    if (!height) height = "auto";
    if (!Questions) Questions = "OK"

    if (title && title.substr(0, 1) != "<") title = $('<div/>').text(title).html();
    if (Msg.substr(0, 1) != "<") Msg = $('<div/>').text(Msg).html();

    Msg = Msg.replace(/(?:\r\n|\r|\n|\xFE)/g, '<br/>')

    var Dialog = '<div id="msgboxDialog" style="display: none; z-index: ' + nextZIndex() + '; max-width: \'800px\' white-space: normal">'
    Dialog += '<span class="msgbox">' + Msg + '</span>';
    Dialog += "<input id='msgboxResult' name='msgboxResult' type='hidden' value='' />"
    Dialog += '</div>'

    // Create jQuery dialog buttons
    var Buttons = {}
    var setFocus = 0
    var btnTxt = Questions.split(',')
    for (var i = 0; i < btnTxt.length; i++) {
        var btnAnswer = btnTxt[i].trim()
        if (btnAnswer) {
            if (btnAnswer.substr(0, 1) == '*') {
                btnAnswer = btnAnswer.substr(1)
                setFocus = i - 1
            }

            btnAnswer = btnAnswer.split('|');
            var btnText = btnAnswer[0]
            var btnCmd = btnAnswer[btnAnswer.length - 1]

            Buttons[btnText] = {
                text: btnText, cmd: btnCmd, icons: "ui-icon-heart", click: function (jqEvent) {
                    var btnText = $(jqEvent.currentTarget).text()
                    msgBoxAnswer = Buttons[btnText].cmd
                    $(this).dialog("close");
                }
            }
        }
    }

    $("#msgboxDialog").remove();
    $("body").append(Dialog);

    // Define the Dialog and its properties.
    var setup = {
        resizable: false,
        modal: true,
        width: width,
        height: height,
        title: title,
        dialogClass: 'msgbox-dialog',
        open: function () {
            if (spinnerCnt) $("body").removeClass("loading");
            $(this).parent().find('#' + setFocus).focus();
        },

        close: function (event, ui) {
            if (spinnerCnt) $("body").addClass("loading");
            $('.ui-dialog').css("z-index", nextZIndex())
            if (callBack) callBack(msgBoxAnswer)
            $(this).remove()
        },

        buttons: Buttons
    }

    if (height == 'auto') setup.position = { my: 'top', at: 'top+150' }

    $("#msgboxDialog").dialog(setup);
    $('.ui-dialog').css("z-index", nextZIndex())
    if (!title) $(".msgbox-dialog .ui-dialog-titlebar").hide();
}

function nextZIndex() {
    var highest = 0;
    $('div,nav').each(function () {
        var idx = parseInt($(this).css("z-index"), 10);
        if (idx > highest) {
            highest = idx;
        }
    });
    return highest + 1;
}

function iff(a, b, c) { if (a) return b; else return c }
function iif(a, b, c) { if (a) return b; else return c }

function preventTheDefault(event, allowPropagation) {
    if (event && typeof event == "object") {
        if (event.preventDefault) event.preventDefault();
        if (event.stopPropagation && !allowPropagation) event.stopPropagation(); // needed for keypress
    }

    return false; // stop propagation on events
}

function pageName() { return Field(document.location.href.match(/[^\/]+$/)[0], "?", 1) }

function HasTag(obj, tagName) {
    if (!obj || typeof obj != "object") return false;
    return obj.hasOwnProperty(tagName)
}

// ========================== ACE EDITOR ========================== 
var startAcePos, lastAcePos;
var lastTouchStart = 0;
var touchSelecting = false;
var aceEditor;

// returns .row and .column of touch event
function acePos(editor, e) {
    var touchPos = e.touches[0] || e.changedTouches[0];
    var X = parseInt(touchPos.pageX)
    var Y = parseInt(touchPos.pageY)
    return editor.renderer.screenToTextCoordinates(X, Y);
}

function setupAce(ID, startOnLineNo) {
    window.Range = ace.require('ace/range').Range;
    window[ID] = ace.edit("ace_" + ID);
    var editor = window[ID];
    aceEditor = editor;

    // https://github.com/ajaxorg/ace/wiki/Configuring-Ace
    editor.setOptions({
        //"enableBasicAutocompletion": true,
        //"enableSnippets": true,
        autoScrollEditorIntoView: true
    });

    /* 
    var langTools = ace.require("ace/ext/language_tools");
    var wordCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
            //answers = getCompletions(editor, session, pos, prefix) ;
            //callback(null, answers)
            return
        }
    }
    */

    window.aceEditorConfirmUnload = function () {
        var isClean = editor.session.getUndoManager().isClean();
        if (isClean) return
        return "You have unsaved edits, do you really want to leave?";
    }

    $(window).on('beforeunload', aceEditorConfirmUnload)

    $('form').on("submit.ace", function () {
        $(window).off('beforeunload', aceEditorConfirmUnload)

        $('#' + ID + '_lineNo').val(editor.getCursorPosition().row);

        assignBtn(ID + '_searchFor', $('.ace_search_field[placeholder="Search for"]').val())
        assignBtn(ID + '_replaceWith', $('.ace_search_field[placeholder="Replace with"]').val())
        assignBtn(ID + '_regExpSearch', $('.ace_search_options .ace_button[title="RegExp Search"]').hasClass('checked'))
        assignBtn(ID + '_caseSensitiveSearch', $('.ace_search_options .ace_button[title="CaseSensitive Search"]').hasClass('checked'))
        assignBtn(ID + '_wholeWordSearch', $('.ace_search_options .ace_button[title="Whole Word Search"]').hasClass('checked'))
        if ($(".ace_search").css("display") == "block") {
            assignBtn(ID + '_findOpen', 1)
            assignBtn(ID + '_replaceOpen', Val($(aceEditor.searchBox.replaceBox).css("display") == "block"))
        } else {
            assignBtn(ID + '_findOpen', 0)
            assignBtn(ID + '_replaceOpen', 0)
        }

        var code = editor.getValue();
        var isClean = editor.session.getUndoManager().isClean();
        if (isClean) code = esc

        $('#' + ID).val(code);

        $('form').off("submit.ace");

        if (isMobile()) {
            if (window.aceTouchEnd) $('body').off("touchend", aceTouchEnd);
            if (window.aceTouchStart) $('#jsb').off("touchstart", aceTouchStart);
        }
        aceEditor = null;
    });

    editor.resize()

    // CTRL-G does editor.gotoLine()
    editor.commands.addCommand({
        name: "gotoLineNo",
        bindKey: {
            "win": "Ctrl-G",
            "mac": "Command-Option-G"
        },
        exec: function (editor) {
            var lineNo = prompt("Goto Line #", "");
            if (lineNo != null) {
                editor.gotoLine(lineNo, 0, false)
            }
        }
    })

    // CTRL-Y does window.lastCY = editor.getCopyText();
    editor.commands.addCommand({
        name: "deleteLineToPasteBuffer",
        bindKey: {
            "win": "Ctrl-Y",
            "mac": "Command-Option-Y"
        },
        exec: function (editor) {
            var editor = editor;
            var pos = editor.getCursorPosition();
            var sel = editor.getSelection();
            var range = sel.getRange();
            range.setStart(pos.row, 0);
            range.setEnd(pos.row + 1, 0);
            sel.setSelectionRange(range);
            window.lastCY = editor.getCopyText();
            editor.session.replace(range, "");
        }
    });


    // =========================  F3 does Search Again
    editor.commands.addCommand({ name: 'f3search', bindKey: { win: 'F3' }, exec: function (editor) { editor.execCommand("findnext"); } });

    // ========================= Shift F3 does backward search
    editor.commands.addCommand({ name: 'f3searchbackward', bindKey: { win: 'shift-F3' }, exec: function (editor) { editor.execCommand("findprevious"); } });

    // special setups for TCL ED
    editor.commands.addCommand({ name: "cmdSave", bindKey: { win: "Ctrl-s", mac: "Ctrl-s" }, exec: function (editor) { if (doEditorPostBack) doEditorPostBack(window.event, "Save") } });
    editor.commands.addCommand({ name: "cmdRun", bindKey: { win: "Ctrl-r", mac: "Ctrl-r" }, exec: function (editor) { if (doEditorPostBack) doEditorPostBack(window.event, "Run") } });
    editor.commands.addCommand({ name: "cmdCompile", bindKey: { win: "Ctrl-b", mac: "Ctrl-b" }, exec: function (editor) { if (doEditorPostBack) doEditorPostBack(window.event, "Compile") } });
    editor.commands.addCommand({ name: "cmdFormat", bindKey: { win: "Ctrl-k", mac: "Ctrl-k" }, exec: function (editor) { if (doEditorPostBack) doEditorPostBack(window.event, "Format") } });
    editor.commands.addCommand({ name: "cmdRun", bindKey: { win: "Ctrl-d", mac: "Ctrl-d" }, exec: function (editor) { if (doEditorPostBack) doEditorPostBack(window.event, "Debug") } });
    editor.commands.addCommand({ name: "cmdIgnore", bindKey: { win: "F5", mac: "F5" }, exec: function (editor) { if (doEditorPostBack) doEditorPostBack(window.event, "Run") } });

    $(document).mouseleave(function () {
        window.lastCY = null;
    });

    editor.on("cut", function (text) {
        if (isMobile()) {
            window.lastCY = text.text;
        } else {
            window.lastCY = null;
        }
    });

    editor.on("copy", function (text) {
        if (isMobile()) {
            window.lastCY = text.text;
        } else {
            window.lastCY = null;
        }
    });

    editor.on("paste", function (e) {
        if (window.lastCY) e.text = window.lastCY; else window.lastCY = e.text;
    });

    if (editor.useSoftTabs) {
        editor.useSoftTabs(true);
    }
    editor.setBehavioursEnabled(false);

    $('#ace_' + ID).show()
    editor.execCommand("replace")

    // STARTUP code
    var myID = ID;
    editor.myStart = function () {
        if (!$('.ace_search').length) return setTimeout(editor.myStart, 60);

        if (CBool(formVar(myID + '_replaceOpen', true))) editor.execCommand("replace");
        else if (CBool(formVar(myID + '_findOpen', true))) editor.execCommand("find");
        else $('.ace_search').hide();


        $('.ace_search_field[placeholder="Search for"]').val(formVar(myID + '_searchFor', true))
        $('.ace_search_field[placeholder="Replace with"]').val(formVar(myID + '_replaceWith', true))

        if (CBool(formVar(myID + '_regExpSearch', true))) $('.ace_search_options .ace_button[title="RegExp Search"]').click()
        if (CBool(formVar(myID + '_caseSensitiveSearch', true))) $('.ace_search_options .ace_button[title="CaseSensitive Search"]').click()
        if (CBool(formVar(myID + '_wholeWordSearch', true))) $('.ace_search_options .ace_button[title="Whole Word Search"]').click()

        editor.renderer.updateFull();
        editor.focus(); //To focus the ace editor

        // Stop spell checking
        $('textarea.ace_text-input').attr('autocomplete', 'off')
        if (startOnLineNo) editor.gotoLine(startOnLineNo); //Go to end of document
    }

    setTimeout(editor.myStart, 60);

    if (isMobile()) {
        // ======================================== Touch START code
        window.aceTouchStart = function (e) {
            //$('#statustxt').text('tstart ' + Timer()); 
            if ($(e.target).hasClass('ace_content')) {
                //  if (window.cutCopyPasteDialog) $(cutCopyPasteDialog).dialog("close");
                editor.selection.clearSelection();
                window.lastTouchStart = new Date().getTime();
                startAcePos = acePos(editor, e.originalEvent);
                lastAcePos = startAcePos;
                touchSelecting = false;
                return false;
            }
            return true;
        };

        $('#jsb').on("touchstart", aceTouchStart)

        // ======================================== Touch END code
        window.aceTouchEnd = function (e) {
            //$('#statustxt').text('tend ' + Timer()); 
            if ($(e.target).hasClass('ace_content')) {
                if (touchSelecting) {
                    if (!window.cutCopyPasteDialog) window.showCutCopyPaste();
                    hideKeyboard(editor);
                } else if (lastTouchStart) {
                    editor.selection.moveTo(startAcePos.row, startAcePos.column)
                    var ms = new Date().getTime() - lastTouchStart
                    if (ms < 500) {
                        // short tap
                        if (window.cutCopyPasteDialog) {
                            $(cutCopyPasteDialog).dialog("close");

                            editor.selection.clearSelection();
                        }
                        showKeyboard(editor)
                    } else {
                        // A long tag gets  
                        // editor.selection.moveTo(startAcePos.row, startAcePos.column)

                        if (!window.cutCopyPasteDialog) window.showCutCopyPaste()
                        hideKeyboard(editor);
                    }
                }
            }

            lastTouchStart = 0;
            touchSelecting = false;
        };

        $('body').on("touchend", aceTouchEnd)

        // ======================================== Touch MOVE code
        window.aceTouchMove = function (ev) {
            if (touchSelecting) {
                var Pos = acePos(editor, ev.domEvent);
                // Update only when changed from previous lastAcePos
                if (Pos.row != lastAcePos.row || Pos.column != lastAcePos.column) {
                    lastAcePos = Pos;
                    var range = Range.fromPoints(startAcePos, lastAcePos)
                    editor.selection.setSelectionRange(range)
                }
            } else if (lastTouchStart) {
                // if we move within the first 400ms, then it's a scroll             
                var ms = new Date().getTime() - lastTouchStart;
                if (ms < 100) return; // ignore bounce
                if (ms < 400) {
                    var Pos = acePos(editor, ev.domEvent);
                    var FarMove = Math.abs(Pos.row - startAcePos.row) > 2 || Math.abs(Pos.column - startAcePos.column) > 2;
                    if (FarMove) {
                        aceTouchMoveScroll(ev);
                        lastTouchStart = 0;
                        hideKeyboard(editor);
                    }
                } else {
                    // Selectin

                    if (window.cutCopyPasteDialog) $(cutCopyPasteDialog).dialog("close");
                    editor.selection.clearSelection();
                    lastTouchStart = 0; // check this only once
                    touchSelecting = true
                    hideKeyboard(editor);
                }
            } else {
                aceTouchMoveScroll(ev)
            }
        }

        aceEditor.setDefaultHandler("touchmove", aceTouchMove);
        window.showCutCopyPaste = function (e) {
            window.cutCopyPasteDialog = $("<span id='cutCopyPasteDialog' style='position: absolute'></span>").appendTo('body').dialog({
                modal: false,
                resizable: false,
                width: 'auto',
                dialogClass: 'cutCopyPasteClass',
                close: function () { window.cutCopyPasteDialog = null },
                buttons: {
                    "Cut": function () {
                        window.lastCY = editor.getCopyText();
                        try {
                            //           editor.focus()
                            document.execCommand('copy')
                        } catch (err) { }

                        var sel = editor.getSelection();
                        editor.session.replace(sel.getRange(), "");
                        editor.selection.moveTo(startAcePos.row, startAcePos.column);
                        $(this).dialog("close");
                    },

                    "Copy": function () {
                        window.lastCY = editor.getCopyText();
                        try {
                            //         editor.focus()
                            document.execCommand('copy')
                        } catch (err) { }
                        $(this).dialog("close");
                        //    editor.selection.clearSelection(); 
                    },

                    "Paste": function () {
                        var sel = editor.getSelection();
                        editor.session.replace(sel.getRange(), "");
                        editor.selection.moveTo(startAcePos.row, startAcePos.column);

                        if (window.lastCY) editor.insert(lastCY); else {
                            if (window.navigator && navigator.clipboard) {
                                navigator.clipboard.readText()
                                    .then(function (text) { editor.insert(text) })
                                    .catch(function (err) {
                                        try {
                                            editor.focus()
                                            document.execCommand('paste')
                                        } catch (err) { }
                                    });
                            } else {
                                try {
                                    editor.focus()
                                    document.execCommand('paste')
                                } catch (err) { }
                            }
                        }
                        //             $(this).dialog("close");
                    },

                    "DEL": function () {
                        var sel = editor.getSelection();
                        editor.session.replace(sel.getRange(), "");
                        $(this).dialog("close");
                    },
                    "X": function () {
                        $(this).dialog("close");
                    }
                }
            });
        }


        window.aceTouchMoveScroll = function (ev) {
            var t = ev.domEvent.timeStamp;
            var dt = t - (aceEditor.$lastScrollTime || 0);

            var isScrolable = aceEditor.renderer.isScrollableBy(ev.wheelX * ev.speed, ev.wheelY * ev.speed);
            if (isScrolable || dt < 200) {
                aceEditor.$lastScrollTime = t;
                aceEditor.renderer.scrollBy(ev.wheelX * ev.speed, ev.wheelY * ev.speed);
                return ev.stop();
            }
        }
    }

    $(window).resize(function () {
        setTimeout(function () {
            editor.resize();
            editor.renderer.updateFull();
        }, 250)
    });
}

///////////////////////////////////////////////////////////////////////////////////////////////
//                                    jqGrid Routines                                        //
///////////////////////////////////////////////////////////////////////////////////////////////

var jqGridVars = {}

// Done before Grid is created
function jqGrid_Create(jqGridID, userOptions, jqOptions, pkid) {
    if (!jqGridID || $('table#' + jqGridID).length > 1) { Alert('You are attempting to define two grids by the same name: ' + jsGridID); return false }

    var myConfig = jqGridData(jqGridID);
    var myGrid = $("#" + jqGridID)

    currentModel = jqOptions.colModel

    myConfig.userOptions = userOptions
    myConfig.pkid = pkid

    // Clone everything except the data
    var holdData = jqOptions.data;
    jqOptions.data = null;
    myConfig.jqOptions = clone(jqOptions);
    myConfig.jqOptions.colModel = clone(myConfig.jqOptions.colModel);
    if (!myConfig.jqOptions.colModel.length) Alert('You have no column model defined for your jqGrid');
    jqOptions.data = holdData;

    // Anytime we change the model from the server, we need to stick with that
    var previousInitialColModel = getObjectFromLocalStorage(jqGridID + "_Original");

    if (JSON.stringify(previousInitialColModel) != JSON.stringify(currentModel)) {
        // Reset to Original
        removeObjectFromLocalStorage(jqGridID)
        saveObjectInLocalStorage(jqGridID + "_Original", currentModel);

    } else if (hasCustomChanges(jqGridID)) {
        var columnsState = getObjectFromLocalStorage(jqGridID);
        var colStates = columnsState.colStates;
        for (var i = 0; i < currentModel.length; i++) {
            var colItem = currentModel[i];
            var cmName = colItem.name;
            if (cmName !== "rn" && cmName !== "cb" && cmName !== "subgrid") {
                currentModel[i] = $.extend(true, {}, currentModel[i], colStates[cmName]);
            }
        }
    }

    if (hasCustomChanges(jqGridID)) jqOptions.autoresizeOnLoad = false;
    $(myGrid).jqGrid(jqOptions);
    return true
}

function jqGrid_resetGrid(jqGridID) {
    var myConfig = jqGridData(jqGridID);
    var myGrid = $("#" + jqGridID)

    var jqOptions = clone(myConfig.jqOptions) // original jqOptions
    var data = clone($(myGrid).jqGrid('getGridParam', 'data'));

    jqOptions.data = data
    myConfig.notFirstLoad = false;
    $('form').off("submit.jqgrid_" + jqGridID)

    removeObjectFromLocalStorage(jqGridID);

    $(myGrid).jqGrid('GridUnload')
    $("#" + jqGridID).jqGrid(jqOptions)
}

function jqGrid_gridComplete(jqGridID) {
    var myGrid = $("#" + jqGridID)
    var myConfig = jqGridData(jqGridID);
    var firstPageLoad = !myConfig.notFirstLoad;
    var currentModel = $(myGrid).jqGrid('getGridParam', 'colModel');
    var userOptions = myConfig.userOptions

    if (firstPageLoad) {
        // myConfig.notFirstLoad = true;
        window[jqGridID + '_initialColumnOrder'] = $("#Grid").getGridParam('colNames');

        $(myGrid).jqGrid("navGrid", { edit: false, add: false, del: false, search: false, refresh: false });


        $.extend($.jgrid.search, {
            multipleSearch: true,
            multipleGroup: true,
            //recreateFilter: true,
            closeOnEscape: true,
            closeAfterSearch: true
        });

        // Only add button once
        if ($('#' + jqGridID + '_myResetBtn').length == 0) {
            $(myGrid).jqGrid("navButtonAdd", {
                id: jqGridID + '_myResetBtn',
                caption: "Reset Column Order",
                // buttonicon: "fa-times",
                title: "Reset column settings",
                onClickButton: function () {
                    jqGrid_resetGrid(jqGridID)
                }
            });
        }
        // }

        if (userOptions.HeadForeColor) $('#gbox_' + jqGridID + ' th div').css('color', userOptions.HeadForeColor);
        if (userOptions.HeadBackColor) $('#gbox_' + jqGridID + ' th div').css('background-color', userOptions.HeadBackColor);
        if (userOptions.RowForeColor) $('#' + jqGridID + ' td').css('color', userOptions.RowForeColor);
        if (userOptions.RowBackColor) $('#' + jqGridID + ' td').css('background-color', userOptions.RowBackColor);
        if (userOptions.AltForeColor) $('#' + jqGridID + ' .ui-priority-secondary td').css('color', userOptions.AltForeColor);
        if (userOptions.AltBackColor) $('#' + jqGridID + ' .ui-priority-secondary td').css('background-color', userOptions.AltBackColor);

        if (userOptions.sortableRows) {
            $(myGrid).jqGrid('sortableRows', {
                update: function (ev, ui) {
                    var item = ui.item[0], ri = item.rowIndex, itemId = item.id,
                        message = "The row with the id=" + itemId + " is moved. The new row index is " + ri;

                    if (ri > 1 && ri < this.rows.length - 1) {
                        Alert(message + '\\nThe row is inserted between item with rowid=' + this.rows[ri - 1].id + ' and the item with the rowid=' + this.rows[ri + 1].id);

                    } else if (ri > 1) {
                        Alert(message + '\\nThe row is inserted as the last item after the item with rowid=' + this.rows[ri - 1].id);

                    } else if (ri < this.rows.length - 1) {
                        Alert(message + '\\nThe row is inserted as the first item before the item with rowid=' + this.rows[ri + 1].id);

                    } else {
                        Alert(message);
                    }
                }
            });
        }

        if (userOptions.addRowNumbers) $(myGrid).jqGrid({ rownumbers: true })
        if (userOptions.caption) $(myGrid).jqGrid({ caption: userOptions.caption })

        // Capture submit 
        if (userOptions.allowInserts || userOptions.allowUpdates || userOptions.allowDeletes) {
            $('form').on("submit.jqgrid_" + jqGridID, function (event) { jqGrid_OnSubmit(jqGridID) })
        }
    }

    if (hasCustomChanges(jqGridID)) {
        jqGrid_ChangeColumnPositions(jqGridID);
        $('#' + jqGridID + '_myResetBtn').show();

    } else {
        $('#' + jqGridID + '_myResetBtn').hide();
        if (userOptions.width100percent && firstPageLoad) {
            $(window).resize(function () {
                resizeJQgrid(jqGridID, userOptions.noFilterBar)
            });

            setTimeout(function () { resizeJQgrid(jqGridID, userOptions.noFilterBar) }, 50)
        }
    }

    /*
    if (!userOptions.width100percent) {
        var TotalColumnWidths = 0;
        
        for (var i = 0; i < currentModel.length; i++) {
            var colItem = currentModel[i];
            if (colItem.width) TotalColumnWidths += colItem.width;
        }
        
        userOptions.width100percent = (TotalColumnWidths < $(window).width() + 200)
    }
    */
}

function escapeAttr(S, Q) {
    if (!Q) Q = '"';

    S = Change(S, '\\', '\\\\')
    if (Q == '"') {
        S = Q + Change(Change(S, '&', '&amp;'), '"', '&quot;') + Q
    } else {
        S = Q + Change(Change(S, '&', '&amp;'), '\'', '&apos;') + Q
    };

    return Change(Change(S, Chr(13), '&#013;'), Chr(10), '&#010;');
}


function jqGrid_loadComplete(jqGridID) {
    var myGrid = $("#" + jqGridID)
    var myConfig = jqGridData(jqGridID);
    var firstPageLoad = !myConfig.notFirstLoad;
    var recCount = $(myGrid).jqGrid('getGridParam', 'reccount');

    if (myConfig.userOptions.allowDeletes) {
        var ids = $(myGrid).jqGrid('getDataIDs');
        for (var i = 0; i < ids.length; i++) {
            var cl = ids[i];
            be = "<input style='width:60px;font-size: small;' type='button' value='DEL' onclick=\"jqGrid_DelRow(" + escapeAttr(jqGridID, "'") + ", " + escapeAttr(cl, "'") + "); \"  />";
            $(myGrid).jqGrid('setRowData', cl, { jqGridAction: be });
        }
    }

    if (firstPageLoad) {
        myConfig.notFirstLoad = true;
        if (recCount > 10 && !myConfig.userOptions.noFilterBar) {
            $(myGrid).jqGrid('filterToolbar', { stringResult: true, searchOnEnter: false });
            $("#gview_" + jqGridID + " .ui-search-toolbar").show();
        } else {
            $("#gview_" + jqGridID + " .ui-search-toolbar").hide();
        }
    }
}


function resizeJQgrid(jqGridID, noFilterBar) {
    if (!hasCustomChanges(jqGridID)) {
        var myConfig = jqGridData(jqGridID);
        var userOptions = myConfig.userOptions;

        if (userOptions.width100percent) {
            $('#gbox_' + jqGridID).hide();
            var gridParentWidth = $('#gbox_' + jqGridID).parent().width() - 2;
            $('#gbox_' + jqGridID).show()
            $('#' + jqGridID).setGridWidth(gridParentWidth);
        }

    }
}

function jqGridAddBtn(cellvalue, options, rowObject) {
    var myOpts = {}
    myOpts.transferOptions = options.colModel.editoptions; // transferurl, transferto, transferaddfrompage
    myOpts.rowID = options.rowId;
    myOpts.row = rowObject;
    myOpts.gridID = options.gid;
    myOpts = json2string(myOpts)
    if (!cellvalue) cellvalue = options.colModel.label;
    return "<a href='#' myOpts='" + htmlEscape(myOpts) + "' onclick=\"ff(this)\" class='likeabutton'>" + cellvalue + "</a>";
}

function jqGridData(jqGridID) {
    var myConfig = jqGridVars[jqGridID];
    if (myConfig) return myConfig;
    myConfig = { lastSelID: '', lastRowData: {}, ops: [] }
    jqGridVars[jqGridID] = myConfig
    jqGridVars.jqGridID = jqGridID
    return myConfig
}

function jqGrid_removeOp(jqGridID, id) {
    var myConfig = jqGridData(jqGridID);
    for (var i = 0; i < myConfig.ops.length; i++) {
        if (myConfig.ops[i].id == id) {
            myConfig.ops.splice(i, 1);
            break
        }
    }
}

function jqGrid_newOp(jqGridID, opIdRow) {
    var myConfig = jqGridData(jqGridID);
    myConfig.ops.push(opIdRow)
}

function jqGrid_FlushEdit(jqGridID) {
    var myConfig = jqGridData(jqGridID);
    var myGrid = $("#" + jqGridID)
    if ($(myGrid).length == 0) return;

    // Have a previous row?
    if (myConfig.lastSelID) {
        // Dirtied the row?
        $(myGrid).jqGrid('saveRow', myConfig.lastSelID, 'clientArray');
        var updatedRow = $(myGrid).getRowData(myConfig.lastSelID);
        var originalRow = myConfig.lastRowData;

        if (originalRow) delete originalRow['jqGridAction'];
        if (updatedRow) delete updatedRow['jqGridAction'];

        if (!Equals(updatedRow, originalRow)) {
            jqGrid_removeOp(jqGridID, myConfig.lastSelID)
            myConfig.ops.push({ op: 'update', id: myConfig.lastSelID, originalrow: originalRow, updatedrow: updatedRow })
        }
    }

    myConfig.lastRowData = null
    myConfig.lastSelID = null;
}

function jqGrid_DelRow(jqGridID, id) {
    var myGrid = $("#" + jqGridID)

    jqGrid_FlushEdit(jqGridID)

    var updatedRow = $(myGrid).getRowData(id);
    delete updatedRow['jqGridAction'];

    jqGrid_removeOp(jqGridID, id)
    jqGrid_newOp(jqGridID, { op: 'delete', id: id, row: updatedRow })

    $(myGrid).delRowData(id);
}

function jqGrid_NewRow(jqGridID, defaultRow) {
    var myGrid = $("#" + jqGridID)
    var myConfig = jqGridData(jqGridID);

    jqGrid_FlushEdit(jqGridID)

    var newRowId = $.jgrid.randId("-");
    var sNewRow = substituteDefaults(clone(defaultRow), jqGridID, newRowId)
    $(myGrid).jqGrid('addRowData', newRowId, sNewRow);

    if (myConfig.userOptions.allowDeletes) {
        var be = "<input style='width:60px;font-size: small;' type='button' value='DEL' onclick=\"jqGrid_DelRow(" + escapeAttr(jqGridID, "'") + ", " + escapeAttr(newRowId, "'") + "); \"  />";
        $('#' + jqGridID).jqGrid('setRowData', newRowId, { jqGridAction: be });
    }

    jqGrid_newOp(jqGridID, { op: 'new', id: newRowId, row: defaultRow })
}

function jqGrid_onSelectRow(e, jqGridID, rowID) {
    if (e.which != 1) return // left mouse click

    var myGrid = $("#" + jqGridID)
    var myConfig = jqGridData(jqGridID);

    if (rowID && rowID !== myConfig.lastSelID) {
        jqGrid_FlushEdit(jqGridID);
        myConfig.lastRowData = $(myGrid).getRowData(rowID);
        myConfig.lastSelID = rowID;

        window.jqGridDblTimer = setTimeout(function () {
            window.jqGridDblTimer = null;
            if (myConfig.userOptions.allowUpdates) {
                $(myGrid).jqGrid('editRow', rowID, true);
            } else if (window.eventHandler_rowSelected) {
                var gridDataRow = $(myGrid).jqGrid('getRowData', rowID);
                eventHandler_rowSelected(gridDataRow, myConfig.pkid, 'rowselected', e)
            }
        }, 300)
    }
}

function jqGrid_ondblClickRow(e, jqGridID, rowID) {
    var myGrid = $("#" + jqGridID)
    var myConfig = jqGridData(jqGridID);

    clearTimeout(window.jqGridDblTimer)
    window.jqGridDblTimer = null;

    if (rowID && rowID !== myConfig.lastSelID) {
        jqGrid_FlushEdit(jqGridID);
        myConfig.lastRowData = $(myGrid).getRowData(rowID);
        myConfig.lastSelID = rowID;
    }

    var gridDataRow = $(myGrid).jqGrid('getRowData', rowID);
    if (window.eventHandler_dblClickRow) eventHandler_dblClickRow(gridDataRow, myConfig.pkid, 'dblclick', e)
}

function jqGrid_OnSubmit(jqGridID) {
    var myGrid = $("#" + jqGridID)
    var myConfig = jqGridData(jqGridID);
    if ($(myGrid).length == 0) return;

    // push out the Operations
    if ($("#" + jqGridID + "_ops").length == 0) $('#jsb').append('<input id="' + jqGridID + '_ops" name="' + jqGridID + '_ops" type="hidden" />')

    jqGrid_FlushEdit(jqGridID)
    $("#" + jqGridID + "_ops").val(JSON.stringify(myConfig.ops));
    $('form').off("submit.jqgrid_" + jqGridID)

    // push out the entire data array
    var gridData = $(myGrid).getRowData();
    var postData = JSON.stringify(gridData);
    var iHidden = $('<input type="hidden" name="' + jqGridID + '" />').appendTo('#jsb');
    $(iHidden).val(postData);

    // dont come here again
    jqGridVars = {}
}

function hasCustomChanges(jqGridID) {
    var columnsState = getObjectFromLocalStorage(jqGridID);
    return hasColState = columnsState !== undefined && columnsState !== null;
}

// Done each GridComplete
function jqGrid_ChangeColumnPositions(jqGridID) {
    var myGrid = $("#" + jqGridID)
    var columnsState = getObjectFromLocalStorage(jqGridID);

    // Remove missing columns from saved state
    var p = $(myGrid).jqGrid("getGridParam");
    if (columnsState.cmOrder != null && columnsState.cmOrder.length > 0) {
        // Iterate over the previous saved column model
        var fixedOrder = $.map(columnsState.cmOrder, function (name) {
            // if the previous name no longer exists, make null in fixedOrder
            return (!p.iColByName || p.iColByName[name] === undefined) ? null : name;
        });
        $(myGrid).jqGrid("remapColumnsByName", fixedOrder, true);
    }
}

function saveColumnStates(jqGridID) {
    var ColumnStates = getColumnStates(jqGridID);
    saveObjectInLocalStorage(jqGridID, ColumnStates);
    $('#' + jqGridID + '_myResetBtn').show();
}

function saveObjectInLocalStorage(storageItemName, object) {
    if (window.localStorage !== undefined) {
        var s = JSON.stringify(object); // We preserve the type by JSON and parseJSON
        try {
            window.localStorage.setItem(storageItemName, s);
        } catch (e) {
            alert("I was unable to save " + storageItemName + " in local storage. " + e.mesage);

            if (e.name == "QuotaExceededError") {
                if (confirm("Would you like to clear your localStorage? and try again?")) {
                    localStorage.clear();
                    saveObjectInLocalStorage(storageItemName, object);
                }
            }
        }
    }
}

function removeObjectFromLocalStorage(storageItemName) {
    if (window.localStorage !== undefined) {
        localStorage.removeItem(storageItemName);
    }
}

function getObjectFromLocalStorage(storageItemName) {
    if (window.localStorage !== undefined) {
        var a = localStorage.getItem(storageItemName);
        try {
            var j = eval("(" + a + ")");
            return j;
        } catch (err) { }
        return a;
    }
}

function getColumnNamesFromColModel(colModel) {
    return $.map(colModel, function (cm, iCol) {
        // we remove "rn", "cb", "subgrid" columns to hold the column information 
        // independent from other jqGrid parameters
        return $.inArray(cm.name, ["rn", "cb", "subgrid"]) >= 0 ? null : cm.name;
    });
}

function getColumnStates(jqGridID) {
    var myGrid = $("#" + jqGridID)

    var p = $(myGrid).jqGrid("getGridParam"), colModel = p.colModel, i, l = colModel.length, colItem, cmName,
        postData = p.postData,
        columnsState = {
            search: p.search,
            page: p.page,
            rowNum: p.rowNum,
            sortname: p.sortname,
            sortorder: p.sortorder,
            cmOrder: getColumnNamesFromColModel(colModel),
            colStates: {}
        },
        colStates = columnsState.colStates;

    if (postData.filters !== undefined) {
        columnsState.filters = postData.filters;
    }

    for (var i = 0; i < l; i++) {
        colItem = colModel[i];
        cmName = colItem.name;
        if (cmName !== "rn" && cmName !== "cb" && cmName !== "subgrid") {
            colStates[cmName] = {
                width: colItem.width,
                hidden: colItem.hidden
            };
        }
    }

    return columnsState;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ff(anchor) {
    var allOpts = $.parseJSON($(anchor).attr("myOpts"))
    var myOpts = allOpts.transferOptions;
    var parentDataRow = allOpts.row;
    var primaryKeyName = myOpts.primaryKey;
    var title = myOpts.title;

    if (!primaryKeyName) primaryKeyName = "id"
    if (!title) title = parentDataRow[primaryKeyName];
    var selectedID = stripNonIdentifierCharacters(parentDataRow[primaryKeyName]);

    var Url = myOpts.transferurl;
    var transferextra = myOpts.transferextra;

    if (transferextra) {
        if (InStr(Url, '?') > 0) Url += '&' + transferextra; else Url += '?' + transferextra;
    }

    Url = urlCtlSubstitutions(Url, parentDataRow, primaryKeyName)

    if ((queryVar('inTheme') == 1) && (InStr(Url, 'inTheme=') == -1)) {
        if (InStr(Url, '?') > 0) Url += '&inTheme=1'; else Url += '?inTheme=1';
    }

    if (myOpts.passthruParams) {
        var passthruParams = Field(myLocation(), '?', 2)
        if (passthruParams) {
            if (InStr(Url, '?') > 0) Url += '&' + passthruParams; else Url += '?' + passthruParams;
        }
    }

    transferUrl(CNum(myOpts.transferto), transferextra, selectedID, title, Url, myOpts.transferaddfrompage)
}

function json2html(data) {
    var htmlRetStr = _json2html(data, 0);
    return htmlRetStr.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/ /g, '&nbsp;').replace(/\n/g, '<br>');
}

function _json2html(data, n) {
    var htmlRetStr = "";
    var second = false;
    if (Object.prototype.toString.call(data) === '[object Array]') {
        htmlRetStr = "[";
        second = false;
        data.forEach(function (entry) {
            if (second) htmlRetStr += ",";
            htmlRetStr += _json2html(entry, n + 3);
            second = true;
        });

        htmlRetStr += "]"

    } else {
        for (var key in data) {
            if (second) htmlRetStr += ",";
            if (typeof (data[key]) != 'function') {
                if (typeof (data[key]) == 'object' && data[key] != null) {
                    htmlRetStr += Space(n) + "{\n"
                    htmlRetStr += Space(n + 3) + key + ":\n";
                    htmlRetStr += _json2html(data[key], n + 6);
                    htmlRetStr += Space(n) + '}\n';
                } else {
                    htmlRetStr += Space(n) + key + ': ' + data[key] + '\n';
                }
            }
            second = true;
        }
    }
    return (htmlRetStr);
}

// on button clickes: Make a hidden input (ID) so submit has form data
var lastAssignedBtn;

function assignBtn(idOrBtn, val) {
    lastAssignedBtn = null;

    if (typeof idOrBtn == "string") {
        if (isAlpha(Left(idOrBtn, 1))) lastAssignedBtn = $("[id='" + idOrBtn + "']"); else lastAssignedBtn = $(idOrBtn);

        if ($(lastAssignedBtn).length == 0) {
            // find a place to create the hidden element 
            d = document.getElementById("jsb")
            if (!d) d = document.body

            // Create the hidden element
            lastAssignedBtn = document.createElement('input');
            lastAssignedBtn.type = "hidden"
            lastAssignedBtn.id = idOrBtn

            // append to parent
            d.appendChild(lastAssignedBtn)
        }
    } else {
        lastAssignedBtn = idOrBtn
    }

    var id = $(lastAssignedBtn).attr('id');
    if (id) {
        $("[id='" + id + "']").removeAttr('name')
        $(lastAssignedBtn).attr('name', id) // make sure we have a name
    }

    $(lastAssignedBtn).val(val);

    /*  assigning to a submit button that hasn't been clicked will cause a click
    if ($(lastAssignedBtn).attr('type') == 'submit' && $(lastAssignedBtn)[0] != document.activeElement) { 
        $(lastAssignedBtn)[0].focus();
        setTimeout(function () { 
           // Did set focus work?
           if ($(lastAssignedBtn)[0] == document.activeElement) $(lastAssignedBtn).click();  // if so, make the click
        }, 50); // This will recurse back here
    }
    */
}

function parentHeight(jObj) {
    var h, tm;

    if (!jObj) return $(window).height();
    if ($(jObj).length == 0) return $(window).height();
    if ($(jObj).get(0).tagName == 'BODY') {
        return $(window).height()
    }

    var myparent = $(jObj).parent().closest('div')
    if ($(myparent).get(0) === undefined) {
        h = $('body').outerHeight(true) - $('body').height()
        return $(window).height() - h;
    }
    tm = parseInt($(myparent).css("padding-top")) + parseInt($(myparent).css("padding-bottom"))
    return $(myparent).innerHeight() - tm
}

function parentWidth(jObj) {
    var h, tm;

    if (!jObj) return $(window).width();
    if ($(jObj).length == 0) return $(window).width();
    if ($(jObj).get(0).tagName == 'BODY') {
        return $(window).width()
    }

    var myparent = $(jObj).parent().closest('div')

    if ($(myparent).get(0) === undefined) {
        h = $('body').outerWidth(true) - $('body').width()
        return $(window).width() - h;
    }

    tm = parseInt($(myparent).css("padding-left")) + parseInt($(myparent).css("padding-right"))

    return $(myparent).innerWidth() - tm
}

function inputBox() {
    return document.getElementById('txtInput');
}

function selectionLength() {
    if (window.getSelection) return window.getSelection().length;
    if (document.getSelection) return document.getSelection().length;
    if (document.selection) return document.selection.createRange().text.length;
    return 0;
}

// If we switch to another window, set focus back to inputbox
$(window).focus(function () {
    if (selectionLength()) return;
    setFocus()
})

$("body").click(function (e) {
    if (e.target == this) setFocus(e)
});

// Change a string of hex bytes "65696200D0A" into a string of ascii chars "ABC"
var hexMap;

function XTS(x) {
    if (typeof x != "string") x = CStr(x) + "";
    if (x.startsWith("0x") || x.startsWith("0X")) x = x.substr(2);

    //    if (isOdd(x.length)) throw new Error('XTS odd length');

    if (!hexMap) {
        hexMap = {}
        for (var i = 0; i < 256; i++) {
            var hx = i.toString(16);
            hexMap[hx.toLowerCase()] = i;
            hexMap[hx.toUpperCase()] = i;
        }
    }

    var result = new Array;
    x = x.split("")

    for (var i = 0; i < x.length; i += 2) {
        result.push(String.fromCharCode(hexMap[x[i]] * 16 + hexMap[x[i + 1]]))
    }

    return result.join("")
}

// Change a string of USC-2 (javascript string) chars "ABC" into a string of utf-8 hex bytes "65696200D0A"
function STX(s) {
    if (!isString(s)) s = CStr(s);
    s = s.split(""); // convert to Array
    s = s.map(function (c) {
        var c2 = c.charCodeAt(0).toString(16)

        // If the length is 1 to 2, it's straight ASCII
        if (c2.length == 1) return "0" + c2;
        if (c2.length == 2) return c2;

        // Else it's USC-2 - so convert it to UTF-8
        c2 = encodeUtf8(c)
        var c = ''
        for (var i = 0; i < c2.length; i++) {
            c += DTX2(c2.charCodeAt(i))
        }

        return c
    });
    return s.join("").toUpperCase()
}

// Unmarshals an Uint8Array to string
if (!window.utf8Decoder && window.TextDecoder) window.utf8Decoder = new TextDecoder("utf-8");
if (!window.utf8Encoder && window.TextEncoder) window.utf8Encoder = new TextEncoder("utf-8");

// Returns a string
function encodeUtf8(string) {
    if (typeof string != "string") string = CStr(string)
    if (window.utf8Encoder) {
        uint8array = window.utf8Encoder.encode(string);
        return btoa(uint8array)
    }
    return unescape(encodeURIComponent(string));
}

function decodeUtf8(X) {
    if (window.utf8Decoder) {
        // Make sure X is a arraUint8Arrayy
        if (X instanceof ArrayBuffer) X = new Uint8Array(X); else
            if (!(X instanceof Uint8Array)) X = string2ArrayBuffer(X);
        return utf8Decoder.decode(X);
    }

    // Make sure we have a string
    if (X instanceof Array) {
        var result = new Array;
        for (var i = 0; i < X.length; i++) {
            result.push(String.fromCharCode(X[i]))
        }
        X = result.join("")
    } else {
        if (typeof X != "string") X = CStr(X)
    }
    return decodeURIComponent(escape(X));
}

// ItemID is only used to determine if this is binary data or UTF-8 data
function arrayBuffer2Str(ab, itemID) {
    if (!(ab instanceof ArrayBuffer)) return CStr(ab)
    ab = new Uint8Array(ab)
    if (isTextFile(itemID)) return decodeUtf8(ab);

    var result = new Array;
    for (var i = 0; i < ab.length; i++) {
        result.push(String.fromCharCode(ab[i]))
    }

    return result.join("")
}

function string2ArrayBuffer(Str) {
    var length = Str.length;
    var buf = new ArrayBuffer(length);
    var arr = new Uint8Array(buf);
    for (var i = 0; i < length; i++) {
        arr[i] = Str.charCodeAt(i);
    }
    return buf;
}

function isOdd(I) {
    return (I % 2) == 1
}

function isEven(I) {
    return (I % 2) == 0
}

// htmlEncode
function htmlEncode(value) { return $('<div/>').text(value).html(); }
function htmlEscape(str) {
    return CStr(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// htmlDecode
function htmlDecode(value) { return $('<div/>').html(value).text(); }
function htmlUnescape(value) {
    return CStr(value)
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

// Compare two json objects
function Equals(A, B) {
    if (A && B && typeof A == "object" && typeof B == "object") {
        for (var key in A) {
            var AV = A[key];
            var BV = B[key]
            if (!Equals(AV, BV)) return false
        }
        return true
    }
    return A == B
}

function xml2string(obj, prettyPrint) {
    if (!obj || typeof obj != "object") return obj;
    var xml = (new XMLSerializer()).serializeToString(obj);
    if (prettyPrint) return formatXml(xml);
    else return xml
}

function formatXml(xml) {
    var formatted = '';
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
    jQuery.each(xml.split('\r\n'), function (index, node) {
        var indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad != 0) {
                pad -= 1;
            }
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        var padding = '';
        for (var i = 0; i < pad; i++) {
            padding += '  ';
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    });

    return formatted;
}

function string2json(str) {
    try {
        var c = Left(str, 1);
        if (c == "{" || c == "[") return eval("(" + str + ")")
    } catch (e) { }
    return {}
}


function CStr(x, prettyprint) {
    if (x == undefined) return "";
    if (x === false) return "0";
    if (x === true) return "1";

    if (typeof x == "object") {
        if (x instanceof Array) return Join(x, am)
        if (x instanceof selectList) return CStr(getList(x), prettyprint);
        if (isJSON(x)) return json2string(x, prettyprint);
        if (isXML(x)) return xml2string(x, prettyprint);
    }

    return String(x);
}

function dropArrayZero(json) {
    if (typeof json == "object") {
        if (isArray(json)) {
            if (json[0] === undefined) json.shift()

            for (var i = 0; i < json.length; i++) {
                if (typeof json[i] == "object") json[i] = dropArrayZero(json[i]);
            }

        } else if (isJSON(json)) {
            for (var tag in json) {
                if (json.hasOwnProperty(tag)) {
                    if (typeof json[tag] == "object") json[tag] = dropArrayZero(json[tag])
                }
            }
        }
    }
    return json
}

function flatten(obj) {
    var result = {}
    for (var key in obj) {
        result[key] = obj[key];
    }
    return result;
}

function json2string(obj, prettyPrint, indent) {
    if (isString(obj)) {
        var l1 = Left(obj, 1);
        if (l1 != "{" && l1 != "[") return obj
        var r1 = Right(RTrim(obj, 1))
        if (r1 != l1) return obj;

        // Test if we can change the string to a json and back
        var cobj = parseJSON(obj, obj);
        if (!Len(cobj)) return obj; // Nope, so return what we were able to do
        obj = cobj;
    }

    obj = shiftArrays(obj);

    if (obj) try {

        if (!prettyPrint) {
            var result = JSON.stringify(obj);
            if (result == "{}") result = JSON.stringify(flatten(obj));
            if (result.startsWith("[null,")) result = "[" + Mid(result, 6); else if (result == "[null]") result = "[]"
            return htmlEncodeR83Chars(result);
        }

        if (!indent) indent = 3;

        if (isArray(obj)) {
            var o = []
            for (var i = (obj[0] ? 0 : 1); i < obj.length; i++) o[i] = Space(indent) + LTrim(json2string(obj[i], true, indent + 3));
            o = Space(indent) + "[" + crlf + Join(o, "," + crlf) + crlf + Space(indent) + "]"
            return o
        } else {
            result = JSON.stringify(obj, null, indent)
            if (result == "{}") result = JSON.stringify(flatten(obj), null, indent);
            return htmlEncodeR83Chars(Change(result, lf, crlf));
        }
    } catch (ex) {
        return stringify(obj, 2, null, indent)
    }

    try {
        return String(obj)
    } catch (ex) { }

    try {
        return obj.toString()
    } catch (ex) { }

    return ""
}

function stringify(val, depth, replacer, space) {
    depth = isNaN(+depth) ? 1 : depth;
    function _build(key, val, depth, o, a) {
        return !val || typeof val != 'object' ? val : (a = Array.isArray(val), JSON.stringify(val, function (k, v) { if (a || depth > 0) { if (replacer) v = replacer(k, v); if (!k) return (a = Array.isArray(v), val = v); !o && (o = a ? [] : {}); o[k] = _build(k, v, a ? depth : depth - 1); } }), o || {});
    }
    return JSON.stringify(_build('', val, depth), null, space);
}

function htmlEncodeR83Chars(Expr) {
    for (var i = 252; i < 255; i++) {
        var c = String.fromCharCode(i)
        if (Expr.indexOf(c) != -1) Expr = Expr.replaceAll(c, "\\x" + i.toString(16).toUpperCase());
    }
    return Expr;
}

function stripNonIdentifierCharacters(str) {
    // Drop all but 'a-z', 'A-Z', '0-9, '.', ' ', '-', '_' 
    return CStr(str).replace(/[^\w\s.-]/g, '');
}

// Count returns the number of unique times a Del is repeated in a string Value
// if the Str is empty, the lenght of P is returned
function Count(Str, Del) {
    if (typeof Str != "string") Str = CStr(Str);
    if (typeof Del != "string") Del = CStr(Del);

    var S = 0,
        CNT = 0;
    if (Del == "") return Str.length;

    do {
        S = Str.indexOf(Del, S)
        if (S == -1) return CNT;
        CNT++;
        S += Del.length;
    } while (1);
}

function DCount(Str, Del) {
    if (typeof Str == "object") return Len(Str); // Proper UBound for JSON and Arrays

    if (typeof Str != "string") Str = CStr(Str);
    if (typeof Del != "string") Del = CStr(Del);

    if (Str == "") return 0;
    if (Del == "") {
        return Str.length + 1;
    }

    return Count(Str, Del) + 1
}

// Return a parameter from the Query String (gup)
function gup(name) {
    return queryVar(name)
}

function queryVar(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&#]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS, "i");
    var myLoca;

    // Allow overriding for "fake" new popoutWindows
    if (jsbLocation) myLoca = jsbLocation; else myLoca = myLocation();

    var results = regex.exec(myLoca);
    if (results == null) return null;
    var a = urlDecode(results[1]);
    if (a == 'true') return true
    if (a == 'false') return false
    return a
}

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function newGUID() {
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toUpperCase();
}

function isArray(obj) {
    return (obj instanceof Array)
}

function isBoolean(obj) {
    return obj !== undefined && obj !== null && obj.constructor == Boolean;
}

function isFunction(obj) {
    return typeof obj === 'function';
}

function isXML(obj) {
    if (typeof o !== "object") return false;
    return o.childNodes != undefined;
}

// isNumber is forgiving, use isNumeric to prohibit trailing garbage (like px, or units).
// null is not a valid numbers, space is.  CNum() will return a zero for both these
function isNumber(n) {
    if (typeof n == "number") return true;
    if (n == "") return true;
    return !isNaN(parseFloat(n));   // parseFloat allows leading spaces and trailing garbage
}

// isNumeric is more strict - no trailing stuff
function isNumeric(n) {
    if (typeof n == "number") return true;
    if (typeof n != "string") n = CStr(n);
    if (!n) return false;
    var c = Left(n, 1);
    if (!isDigit(c) && c != '+' && c != '-' && c != '.') return false;
    return !isNaN(parseFloat(n)) && isFinite(n);  // isFinite will not allow trailing stuff
}

function isString(obj) {
    return obj !== undefined && obj !== null && obj.constructor == String;
}

// In general, JSB doesn't use the object-type string, only then string primitive
function isString(s) { return typeof s == 'string' } // I don't use string objects, so making this quicker, || s instanceof String; 

// isObject for things that are objects outside of my classes
function isObject(o) {
    if (!o) return false;
    if (typeof o !== "object") return false;
    if (o instanceof String) return false;
    if (o instanceof Array) return false;
    if (o instanceof selectList) return false;
    if (isXML(o)) return false;
    if (isJSON(o)) return false;
    return true;
}

function isObj(o) { return isObject(o) }

function isJSON_Property(X) {
    if (typeof X == "function") return false;
    if (typeof X !== "object") return true;
    if (X == null) return true;

    if (X instanceof Array) {
        for (var i = 0; i < X.length; i++) {
            if (!isJSON_Property(X[i])) return false;
        }
        return true;
    }

    return true; // isJSON(X); - prevent recursion
}

function isJSON(json) {
    if (!json) return false;
    if (typeof json !== "object") return false;
    if (json == null) return false;
    if (json instanceof String) return false;
    if (json instanceof selectList) return false;
    if (json instanceof Array) return false;

    for (var tagName in json) {
        if (!isJSON_Property(json[tagName], true)) return false;
    }

    return true;
}

function typeOf(x) {
    if (x === undefined) return "undefined"; // works for both null and undfined - compatible with ASPX

    if (typeof x == "object") {
        if (x instanceof Array) return "Array"
        if (x instanceof selectList) return "Selectlist"
        if (isJSON(x)) return "JSonObject"
        if (isXML(x)) return "XmlObject"
        return "[object]"
    }

    if (isString(x)) return "String"
    if (isBoolean(x) == "boolean") return "Boolean"
    if (typeof x == "number") {
        if (isInt(x)) return "Integer";
        else return "Double"
    }

    return typeof x
}

function Len(x) {
    if (x == null) return 0;
    if (x === false) return 1;
    if (x === true) return 1;

    if (typeof x == "object") {
        if (x instanceof Array) {
            if (x.length <= 0) return 0
            if (x[0] === undefined) return x.length - 1;
            return x.length;
        }
        if (x instanceof selectList) return Len(x.SelectedItemIDs);
        if (isXML(x)) return x.childNodes[0].childNodes.length;
        var cnt = 0;
        for (var c in x) {
            if (typeof x[c] != "function" && c != "@attributes") {
                cnt++
            }
        }
        return cnt;
    }

    return CStr(x).length;
}

// Use the INDEX  function to return the starting Character position (zero based) for the specified occurrence of substring in string.
// Str:    is any valid string, && is examined for the substring expression.
// Cnt:    specifies which occurrence of substring is to be located.
function Index(Str, Del, Cnt) {
    if (typeof Str != "string") Str = CStr(Str)
    if (typeof Del != "string") Del = CStr(Del)
    if (Cnt === undefined) Cnt = 1;
    if (Cnt <= 0) return -1;
    if (Del == "") return 0;
    var S;
    for (S = -1; Cnt > 0; Cnt--) {
        S++
        S = Str.indexOf(Del, S)
        if (S == -1) return -1;
    }
    return S;
}

function Index1(Str, Del, Cnt) {
    return Index(Str, Del, Cnt) + 1
}

function Raise(str) {
    if (typeof str != "string") str = CStr(str)
    str = str.replace(/\xFE/g, "\xFF"); // am
    str = str.replace(/\xFD/g, "\xFE"); // vm
    str = str.replace(/\xFC/g, "\xFD"); // svm
    str = str.replace(/\xFB/g, "\xFC"); // 
    str = str.replace(/\xFA/g, "\xFB");
    str = str.replace(/\xF9/g, "\xFA");
    str = str.replace(/\xF8/g, "\xF9");
    return str
}

function Lower(str) {
    if (typeof str != "string") str = CStr(str);
    str = str.replace(/\xF9/g, "\xF8");
    str = str.replace(/\xFA/g, "\xF9");
    str = str.replace(/\xFB/g, "\xFA"); // 
    str = str.replace(/\xFC/g, "\xFB"); // svm
    str = str.replace(/\xFD/g, "\xFC"); // vm
    str = str.replace(/\xFE/g, "\xFD"); // am
    str = str.replace(/\xFF/g, "\xFE"); // am
    return str
}

// Mid (zero based)
function Mid(str, start, l) {
    if (typeof str != "string") str = CStr(str);
    if (l < 1) return "";
    if (start < 0) start = 0;
    if (l === undefined) return str.substr(start);
    return str.substr(start, +l);
}

// Mid (one based)
function Mid1(str, start, l) {
    if (typeof str != "string") str = CStr(str);
    if (l < 1) return "";
    if (start < 1) start = 0;
    else if (start > 0) start--;
    if (l === undefined) return str.substr(start);
    return str.substr(start, +l);
}

function Chr(d) {
    if (isNaN(d)) return ''; // probably should return Number.NaN but that would be incompatable with other JSB versions.
    return String.fromCharCode(d);
}

function Seq(C) {
    if (C === undefined) return 0;
    return String(C).charCodeAt(0);
}

// Right(null, x) -> null, Right(undefined, 1) -> ''
function Right(str, n) {
    if (str === null || str === '') return str; // null, or empty
    if (typeof str != "string") str = CStr(str);
    if (+n <= 0) return "";
    else if (+n > str.length) return str;
    else {
        var iLen = str.length;
        return str.substring(iLen, iLen - +n);
    }
}

function Left(str, n) {
    if (str === null || str === '') return str; // null, or empty
    if (typeof str != "string") str = CStr(str);
    if (+n <= 0) return "";
    else return str.substr(0, +n);
}

// The cspc compiler outputs isNothing(x) 
//   for ISMISSING(x) , ISNOTHING(x)  and ISNULL(x)  
//   Returns True for null or undefined - but NOT an empty string
function isNothing(x) { return (x == null) }

// isNull returns true for exactly null 
//  (The cspc compiler does not use this. )
function isNull(x) { return (x === null) }

// Returns True for null, undefined, or empty string - Or Empty Array or SelectLists
function isEmpty(x) {
    if (x == null || x === '') return true; // Note: undefined == null
    if (x === false) return false;
    if (x === true) return false;

    if (typeof x == "object") {
        if (x instanceof Array) {
            if (x.length <= 0) return true;
            if (x[0] === undefined && x.length <= 1) return true;
            return false;
        }
        if (x instanceof selectList) return Len(x.SelectedItemIDs) == 0;

        // XML
        if (isXML(x)) return x.childNodes[0].childNodes.length == 0;

        // JSON
        for (var c in x) {
            if (typeof x[c] != "function" && c != "@attributes") return false;
        }
        return true;
    }

    return false;
}

// Trim all spaces, tabs, and carriage returns, including those in the middle (see http://regexr.com/)
function Trim(str) {
    if (str === null || str === '') return str; // null, or empty
    if (typeof str != "string") str = CStr(str);     // \s includes \n\r\t\f
    str = str.replace(/^[\r\n\s\u00a0]+|[\r\n\s\u00a0]+$/g, ""); // remove beginning and trailing white space \u00a0 is non breaking space
    str = str.replace(/[\u0020\t\f\u00a0]+/g, ' ');
    return str;
}

function LTrim(str) {
    if (str === null || str === '') return str; // null, or empty
    if (typeof str != "string") str = CStr(str);
    return str.replace(/^\s+/, "");
}

function RTrim(str) {
    if (str === null || str === '') return str; // null, or empty
    if (typeof str != "string") str = CStr(str);
    return str.replace(/\s+$/, "");
}

function LCase(str) {
    if (str === null || str === '') return str; // null, or empty
    if (typeof str != "string") str = CStr(str);
    return str.toLowerCase();
}

function UCase(str) {
    if (str === null || str === '') return str; // null, or empty
    if (typeof str != "string") str = CStr(str);
    str = str.replaceAll("|", "|.");
    str = str.replaceAll(sm, "|_");
    str = str.replaceAll(am, "|^");
    str = str.replaceAll(vm, "|]");
    str = str.replaceAll(svm, "|/");
    str = str.toUpperCase();
    str = str.replaceAll("|_", sm);
    str = str.replaceAll("|^", am);
    str = str.replaceAll("|]", vm);
    str = str.replaceAll("|/", svm);
    return str.replaceAll("|.", "|");
}

function Change(str, sstr, rstr) {
    if (str === null || str === '') return str; // null, or empty
    if (typeof str != "string") str = CStr(str);
    if (typeof sstr != "string") sstr = CStr(sstr);
    if (typeof rstr != "string") rstr = CStr(rstr);
    return str.replaceAll(sstr, rstr);
}

function preg_quote(str) {
    return "(" + (str + '').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!>\>\|\:])/g, "\\$1") + ")";
}

function ChangeI(str, sstr, rstr) {
    if (str === null || str === '') return str; // null, or empty
    if (typeof str != "string") str = CStr(str);
    if (typeof sstr != "string") sstr = CStr(sstr);
    if (typeof rstr != "string") rstr = CStr(rstr);
    return str.replace(new RegExp(preg_quote(sstr), "ig"), rstr);
}

function DTX(d) {
    return CNum(d).toString(16).toUpperCase();
}

function DTX2(d) {
    d = CNum(d)
    if (d < 16) return '0' + d.toString(16).toUpperCase();
    else return d.toString(16).toUpperCase();
}

function XTD(h) {
    return parseInt("0" + h, 16);
}

function StrRpt(str, cnt) {
    if (cnt > 0) return new Array(CInt(cnt) + 1).join(str)
    return ""
}

function Space(cnt) {
    if (cnt > 0) return new Array(CInt(cnt) + 1).join(" ");
    return ""
}

function SpaceNB(cnt) {
    if (cnt > 0) return new Array(CInt(cnt) + 1).join("&nbsp;");
    return ""
}


function isDigit(C) { return " 0123456789".indexOf(C) >= 1 }

function isAlpha(str) {
    var code, len;
    if (typeof str != "string") str = CStr(str);

    if (!str.length) return false;

    for (var i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
    }
    return true;
}

function isAlphaNumeric(str) {
    var code, len;

    if (typeof str != "string") str = CStr(str);
    if (!str.length) return false;

    for (var i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
    }
    return true;
}

// Not as forgiving as CNum or Val() - no trailing units
function CInt(str) {
    if (typeof str != "string") str = CStr(str);
    if (str == null || str === '') return 0;

    if (isNumeric(str)) {
        var ans = parseInt(str);
        if (!isNaN(ans)) return ans;
    }
    if (!isIE()) debugger;
    throw new Error("Not a number")
}

// Like CNum or Val but will throw an error with trailing garbage
function CDbl(str) {
    if (typeof str != "string") str = CStr(str);
    if (str == null || str === '') return 0;

    if (isNumeric(str)) {
        var ans = parseFloat(str);
        if (!isNaN(ans)) return ans;
    }
    if (!isIE()) debugger;
    throw new Error("Not a number")
}

// CNum() will try to convert to a number, but will return 0 if it can't
// 
function Val(str) { return CNum(str) }
function CNum(str) {
    if (typeof str != "string") str = CStr(str);
    if (str == null || str === '') return 0;
    str = LTrim(str);

    var ans = parseFloat(str);
    if (isNaN(ans)) return 0;
    return ans;
}

function IsNumeric(n) { return isNumeric(n) }

function isInt(val) { if (!val) return 0; return val % 1 === 0; }
function isInteger(val) { if (!val) return 0; return val % 1 === 0; }

function CBool(obj) {
    if (typeof obj == "object") {
        return Len(obj) != 0;
    }

    if (!obj || obj == "0") return false;
    return true
}

// Pick values 0 or 1 return for Not expression (use !CBool(x) for boolean values)
function Not(x) {
    return CBool(x) ? 0 : 1;
}

// Returns -1 if not found
function inList(SearchStr, DynAry, ignoreCase) { return locateInArray(SearchStr, DynAry, ignoreCase) }

function locateInArray(SearchStr, DynAry, ignoreCase) {
    var PI = 0;

    if (isEmpty(DynAry[0])) PI = 1;

    if (ignoreCase) SearchStr = LCase(SearchStr);

    for (; PI < DynAry.length; PI++) {
        var e = DynAry[PI];
        if (isJSON(e)) if (HasTag(e, 'value')) e = e.value; else e = e.label;

        if (ignoreCase && e) e = CStr(e).toLowerCase();
        if (e == SearchStr) return PI;
    }

    // Didn't find it, return 0-1
    return -1
}

var startSpinnerTimer = 0, stopSpinnerTimer = 0;
var spinnerCnt = 0;

function startSpinner(Msg) {
    spinnerCnt++;
    if (startSpinnerTimer || dotNetObj || spinnerCnt > 1) return; // showSpinner(Msg); 
    startSpinnerTimer = setTimeout(function () { showSpinner(Msg); startSpinnerTimer = 0 }, 300);
}

function showSpinner(Msg) {
    if (spinnerCnt) {
        Msg += "";
        if ($('#spinnerDiv').length == 0) $('body').append('<div id="spinnerDiv" class="spinnerDiv"><div id="spinnerText" class="spinnerText"></div></div>');
        if (Msg.startsWith("<")) $("#spinnerText").html(Msg); else $("#spinnerText").text(Msg)
        $("body").addClass("loading");
    }
}

function hideSpinner() {
    spinnerCnt--
    if (spinnerCnt <= 0) {
        $("#spinnerText").remove()
        $("body").removeClass("loading");
        $("#spinnerDiv").remove()
        spinnerCnt = 0;
        if (startSpinnerTimer) {
            clearTimeout(startSpinnerTimer);
            startSpinnerTimer = 0
        }
    }
}

function stopSpinner() {
    // Give a little bit of time for another spinner event to start
    setTimeout(function () {
        hideSpinner()
    }, 100);
}

function consoleLog(s, forceIt) {
    if (!debugConsoleOpen && !forceIt) return
    if (window.console && window.console.log) console.log(s);
    if (!debugConsoleOpen) $('#statustxt').text('log:' & s);
}

// JSB Field() function, drops the right field
function dropRight(str, del, ignorecase) {
    if (typeof str != 'string') str = CStr(str);
    var p;
    if (ignorecase) p = str.toLowerCase().lastIndexOf(del.toLowerCase()); else p = str.lastIndexOf(del);
    if (p == -1) return "";
    return str.substring(0, p);
}

function dropIfRight(str, del, ignorecase) {
    if (typeof str != 'string') str = CStr(str);
    var p;
    if (ignorecase) p = str.toLowerCase().lastIndexOf(del.toLowerCase()); else p = str.lastIndexOf(del);
    if (p == -1) return str;
    return str.substring(0, p);
}

// JSB Field() function, gets the right most field
function fieldRight(str, del) {
    var a = (str + "").split(del)
    return a[a.length - 1]
}

function fieldIfRight(str, del) {
    var a = (str + "").split(del)
    if (a.length <= 1) return "";
    return a[a.length - 1]
}


// JSB Field() function, drops the left field
function dropLeft(str, del, ignorecase) {
    if (typeof str != 'string') str = CStr(str);
    var p;
    if (ignorecase) p = str.toLowerCase().indexOf(del.toLowerCase()); else p = str.indexOf(del);
    if (p == -1) return "";
    return str.substring(p + del.length);
}

function dropIfLeft(str, del, ignorecase) {
    if (typeof str != 'string') str = CStr(str);
    var p;
    if (ignorecase) p = str.toLowerCase().indexOf(del.toLowerCase()); else p = str.indexOf(del);
    if (p == -1) return str;
    return str.substring(p + del.length);
}

// JSB Field() function, gets the left most field
function fieldLeft(str, del, ignorecase) {
    if (typeof str != 'string') str = CStr(str);
    var p;
    if (ignorecase) p = str.toLowerCase().indexOf(del.toLowerCase()); else p = str.indexOf(del);
    if (p == -1) return str;
    return str.substring(0, p);
}

function fieldIfLeft(str, del, ignorecase) {
    if (typeof str != 'string') str = CStr(str);
    var p;
    if (ignorecase) p = str.toLowerCase().indexOf(del.toLowerCase()); else p = str.indexOf(del);
    if (p == -1) return "";
    return str.substring(0, p);
}

// Shortcut for pretty-print - easy to use for js debugging: pp(obj)
function pp(obj) {
    return json2string(obj, true, 3);
}

// Are we running under phone gap?
function isPhoneGap() {
    return !!window.cordova;
}

// Are we the core phonegap or a launched webkit browser?
function notPhoneGapBrowser() {
    return !!window.plugins;
}

// Are we running inside of an iframe?
function inIframe() {
    var embedded = window.self !== window.parent;
    return embedded;
}

// Convert("! ~@#$%^&*()-=+{}[]:.,./\", "_", ID)
// JSB function names can include stange characters, but when converted into a JavaScript Object/Method, we need to get rid of these
function nicename(str) {
    var nn = ''
    for (var i = 0, len = str.length; i < len; i++) {
        var c = str[i];
        if (c <= ' ' || c > '\xFA') c = '_'; else
            if (InStr('! ~@#$%^&*()-=+{}[]:.,./\\"\'<>', c) >= 0) c = "_"
        nn += c;
    }
    return nn;
}

function makeObservableKO(jsonArray, defaultRow, innerArray) {
    if (jsonArray == null) return;
    if (window.ko === undefined) return;

    if (isArray(jsonArray)) {

        for (var i = 0; i < jsonArray.length; i++) {
            jsonArray[i] = makeObservableKO(jsonArray[i], defaultRow, true);
        }

        return ko.observableArray(jsonArray)
    }

    if (typeof jsonArray == "function") return jsonArray;

    if (typeof jsonArray == "object") {
        for (var tagName in jsonArray) {
            jsonArray[tagName] = makeObservableKO(jsonArray[tagName], defaultRow, false);
        }
        for (var tagName in defaultRow) {
            if (jsonArray[tagName] === undefined) {
                jsonArray[tagName] = makeObservableKO(clone(defaultRow[tagName]), defaultRow, false);
            }
        }
    }

    if (innerArray) return jsonArray;

    return ko.observable(jsonArray);
}

function autoCompleteTextBox(txtBox, choiceArray, minLength, CompanionID, restrictToList) {
    if (!minLength) minLength = 1;

    txtBox = $(txtBox)
    if (!$(txtBox).autocomplete) return;
    var hiddenInput = null;

    if (!choiceArray) {
        var myOpts = $(txtBox).attr("myOpts") + "";
        if (myOpts.startsWith("[") && myOpts.endsWith(']')) choiceArray = eval(myOpts); else
            if (myOpts.startsWith("{") && myOpts.endsWith('}')) choiceArray = $.parseJSON(myOpts); else
                choiceArray = Split(myOpts, Chr(254))
    }

    // if the choice array has values and labels that are different
    if ($.isArray(choiceArray) && isJSON(choiceArray[choiceArray.length - 1])) {
        if (!HasTag(choiceArray[choiceArray.length - 1], 'label') || !HasTag(choiceArray[choiceArray.length - 1], 'value')) {
            // determine label and key
            var label = ''
            var value = ''

            var objKeys = Object.keys(choiceArray[choiceArray.length - 1]);
            for (var i = 0; i < objKeys.length; i++) {
                var d = objKeys[i];
                var e = choiceArray[choiceArray.length - 1][d]
                if (typeof e === 'string') {
                    if (!label) label = d;
                } else {
                    if (!value) value = d
                }

                if (d == "label" && label != "label") { if (!value) value = label; label = d; }
                if (d == "value") value = d;
            }

            // Build correct json for autocomplete (label and value)
            var a = [];
            for (var i = 0; i < choiceArray.length; i++) {
                var e = choiceArray[i];
                if (value) a.push({ label: e[label], value: e[value] }); else a.push({ label: e[label] });
            }

            choiceArray = a;
        }

        if (HasTag(choiceArray[choiceArray.length - 1], 'value')) {
            // we need to hide the current textbox since it is bound with knockout
            var newTextBox = $($(txtBox).get(0).outerHTML).insertAfter($(txtBox))

            $(newTextBox).removeAttr('id')
            $(newTextBox).removeAttr('name')
            $(newTextBox).val($(txtBox).val())

            hiddenInput = txtBox;
            $(hiddenInput).hide()
            $(hiddenInput).attr('data-parsley-excluded', true);

            txtBox = newTextBox;
        }
    }

    if (Len(choiceArray) == 0 || !$.isArray(choiceArray)) choiceArray = []; else {
        if (isNothing(choiceArray[0])) choiceArray.shift()
    }

    $(txtBox).data('CompanionID', CompanionID);
    $(txtBox).data('choiceArray', choiceArray);
    $(txtBox).data('restrictToList', restrictToList);
    $(txtBox).data('hiddenInput', hiddenInput);

    $(txtBox).autocomplete({
        source: function (request, response) {
            var choiceArray = $(txtBox).data('choiceArray')
            var results = $.ui.autocomplete.filter(choiceArray, request.term);
            if (results.length > 35) {
                var lt = request.term.toLowerCase()
                var cnt = 0;
                results = $.map(results, function (item) {
                    if (typeof item == 'string') {
                        if (!item.toLowerCase().startsWith(lt)) return null;
                    } else if (typeof item == 'object') {
                        if (!item.label.toLowerCase().startsWith(lt)) return null;
                    } else {
                        return null;
                    }

                    cnt++;
                    if (cnt > 35) return false; else return item;
                });
                if (results.length > 35) {
                    results = results.slice(0, 34);
                    results.push('...more results not shown...')
                }
            }
            response(results);
        },

        open: function (event, ui) {
            if (!$(this.element).is(":focus")) {
                $(this.element).autocomplete("close");
            }
        },

        select: function (event, ui) {
            var val = ui.item.label;

            if ($(this).data('choiceArray')) {
                var txtBox = $(this)
            } else {
                var txtBox = $(this.elment)
            }

            var hiddenInput = $(txtBox).data('hiddenInput');
            if (hiddenInput) {
                preventTheDefault(event);
                if (hiddenInput && ui.item) acceptValue(txtBox, ui.item.value)
            }

            var CompanionID = $(txtBox).data('CompanionID')
            if (CompanionID && InStr(val, "*") > 1) {
                var myPick = findMyCompanion($(txtBox).get(0), CompanionID)
                if (myPick) {
                    $(txtBox).val(RTrim(Field(val, "*", 1)))
                    $(myPick).trigger("click");
                }
            }
        },

        change: function (event, ui) {
            if ($(this).data('choiceArray')) {
                var txtBox = $(this)
            } else {
                var txtBox = $(this.elment)
            }
            var hiddenInput = $(txtBox).data('hiddenInput');

            if (hiddenInput && ui.item) acceptValue(txtBox, ui.item.value); else acceptLabel(txtBox, $(this).val());

        },

        focus: function (event, ui) {
            preventTheDefault(event);
            $(this).val(ui.item.label);
        },

        minLength: minLength
    });

    if (hiddenInput) acceptValue(txtBox, $(txtBox).val())
}

function acceptValue(txtBox, newVal) {
    var hiddenInput = $(txtBox).data('hiddenInput');
    var choiceArray = $(txtBox).data('choiceArray');
    var restrictToList = $(txtBox).data('restrictToList');

    if (!$.isArray(choiceArray)) return; // this only works for arrays

    if (newVal) {
        var i = locateInArray(newVal, choiceArray, true)
        if (i >= 0) {
            var e = choiceArray[i];

            if (hiddenInput) {
                $(txtBox).val(e.label); // correct case if necessary
                if (CStr($(hiddenInput).val()) != CStr(e.value)) $(hiddenInput).val(e.value).trigger("change");
            } else {
                if (CStr($(txtBox).val()) != CStr(e)) $(txtBox).val(e).trigger("change");
            }
            return true
        }

        if (restrictToList) {
            var id = $(txtBox).attr('name');
            if (!id) id = $(txtBox).attr('id')
            if (!id) id = Field(Field($(txtBox).attr('data-bind'), '[', 2), ']', 1)
            if (!id) id = 'a control on this page';
            alert('The value "' + newVal + '" is not in the list of acceptable values for ' + id)
        }
    }

    if (hiddenInput) {
        $(txtBox).val(null);
        if (CStr($(hiddenInput).val()) != "") $(hiddenInput).val(null).trigger("change");
    } else {
        if (CStr($(txtBox).val()) != "") $(txtBox).val(null).trigger("change");
    }

    return true;
}

function acceptLabel(txtBox, newLabel) {
    var hiddenInput = $(txtBox).data('hiddenInput');
    var choiceArray = $(txtBox).data('choiceArray');
    var restrictToList = $(txtBox).data('restrictToList');

    if (!$.isArray(choiceArray)) return; // this only works for arrays

    if (newLabel) {
        var s = newLabel.toLowerCase();
        for (var i = 0; i < choiceArray.length; i++) {
            var e = choiceArray[i];
            if (hiddenInput) {
                if (e.label && e.label.toLowerCase() == s) {
                    $(txtBox).val(e.label); // correct case if necessary
                    if (CStr($(hiddenInput).val()) != CStr(e.value)) $(hiddenInput).val(e.value).trigger("change");
                    return true;
                }
            } else if (HasTag(e, 'label')) {
                if (e.label && e.label.toLowerCase() == s) {
                    if (CStr($(txtBox).val()) != e.label) {
                        $(txtBox).val(e).trigger("change");
                        $(txtBox).val(e.label);
                    }
                    return true;
                }
            } else {
                if (e.toLowerCase() == s) {
                    if (CStr($(txtBox).val()) != CStr(e)) $(txtBox).val(e).trigger("change");
                    return true;
                }
            }
        }

        if (restrictToList) {
            var id = $(txtBox).attr('name');
            if (!id) id = $(txtBox).attr('id')
            if (!id) id = Field(Field($(txtBox).attr('data-bind'), '[', 2), ']', 1)
            if (!id) id = 'a control on this page';
            alert('The value "' + newLabel + '" is not in the list of acceptable values for ' + id)
        }
    }

    if (hiddenInput) {
        $(txtBox).val(null);
        if (CStr($(hiddenInput).val()) != "") $(hiddenInput).val(null).trigger("change");
    } else {
        if ($(txtBox).val() != "") $(txtBox).val(null).trigger("change");
    }

    return true;
}

function clickMyCompanion(ctl, CompanionID) {
    var checkBox = $(ctl).prev();
    $(checkBox).prop("checked", !$(checkBox).is(":checked"))
}

// This routine is used for knockout, since it can duplicates controls giving us multiple copies of the same id
function findMyCompanion(thisCtlObject, CompanionID) {
    var myID = $(thisCtlObject).prop('id');

    if (!myID) {
        alert('I was not able to find the ID of this pick button');
        if (!isIE()) debugger;
        return null;
    }

    var idx = $("*[id='" + myID + "']").index(thisCtlObject);
    var companions = $("*[id='" + CompanionID + "']")
    if ($(companions).length) return $(companions).get(idx);

    companions = $("*[name='" + CompanionID + "']")
    if ($(companions).length) return $(companions).get(idx);

    var companion = $("*[id='" + CompanionID + "_" + idx + "']")
    if ($(companion).length) return $(companion).get($(companion).length - 1);

    companion = $(thisCtlObject).parent().next().find('input');
    if ($(companion).length) return $(companion).get($(companion).length - 1);

    alert('I was unable to find the corresponding textbox for this pick');

    if (!isIE()) debugger;
    return null;
}

// Called from jsb's INPUT statement
function txtInput_keydown_event(e) {
    if (e === undefined) e = window.event;
    var keyCode = e.which ? e.which : e.keyCode;
    if ($(e.target).hasClass('ace_content')) return true;

    if (keyCode == 13) return txtInput_CRLF();
    if (historyName && (keyCode == 38 || keyCode == 40 || keyCode == 27)) {
        if (keyCode == 27) tclInputX(); else
            if (e.keyCode == 38) tclHistoryPrevious(e); else
                if (e.keyCode == 40) tclHistoryNext(e);
        return preventTheDefault(e);

    } else if (keyCode == 27) {
        var txtInput = inputBox();
        txtInput.value = ""
        return preventTheDefault(e);
    }
}

// KeyIn routine
var capturingKeys = false;
var captureKeyRoutine = null;
var capturedKey = undefined
var capturedKeyUsekeyup = false;
var keyInResolve = null;

/* async */ function asyncKeyIn(waitForIt) {
    capturingKeys = true;
    return new Promise((resolve, reject) => {
        if (!waitForIt || capturedKey) return resolve(keyInResult());
        keyInResolve = resolve;
        FlushHTML();
        pendingReject = reject;
    });
}

function keyInResult() {
    var theResult = capturedKey;
    capturedKey = undefined
    return theResult
}

function keyInActivate(e) {
    if (keyInResolve) {
        pendingReject = undefined;
        keyInResolve(keyInResult());
        keyInResolve = null;
    }

    return preventTheDefault(e)
}


// checkKeyUp(e) & checkKeyDown(e) always capturing keyboard keys
function checkKeyUp(e) {
    if (!capturingKeys || !capturedKeyUsekeyup) return;

    if (e === undefined) e = window.event;
    var keyCode = e.which ? e.which : e.keyCode;
    var str = e.target.value;
    if (!str) str = ' ';

    capturedKey = str.charCodeAt(str.length - 1) + '.' + str.charAt(str.length - 1);
    capturedKeyUsekeyup = false;

    return keyInActivate(e);
}

function checkKeyDown(e) {
    if (e === undefined) e = window.event;
    var keyCode = e.which ? e.which : e.keyCode;

    // capturing keys? Allow gamers can capture all keys
    if (capturingKeys) {
        if (keyCode >= 16 && keyCode <= 19) return true; // ignore ctrl, shift, and alt by themselves

        if (keyCode == 229) {
            // use keyup
            capturedKeyUsekeyup = true

        } else {
            if (e.ctrlKey) e.key = "ctrl-" + e.key;
            if (e.altKey) e.key = "alt-" + e.key;
            capturedKey = e.keyCode + '.' + e.key;
            return keyInActivate(e);
        }

        return preventTheDefault(e);
    }

    if (e.ctrlKey) {
        if ($(d).is("input, textarea")) {
            // Special Input for  CTRL - am, vm, sm, svm
            if (keyCode === 54) {
                e.target.value += am;
                return preventTheDefault(e);
            } else if (keyCode === 221) {
                e.target.value += vm;
                return preventTheDefault(e);
            } else if (keyCode === 220) {
                e.target.value += svm;
                return preventTheDefault(e);
            } else if (keyCode === 189) {
                e.target.value += sm;
                return preventTheDefault(e);
            }
        }
    }

    if ($(e.target).hasClass('ace_content')) return true;  // allow more events

    // Allow old style Ctrl ] ^ and \ for R83 Multi-valued delimiters
    // Disable F5 page refresh
    if (keyCode == 116) return preventTheDefault(e);

    // Disable Ctl-R page refresh
    if ((keyCode == 82 && e.ctrlKey)) return preventTheDefault(e);

    // Disable F3 page search
    if (keyCode === 114) return preventTheDefault(e);

    var d = e.srcElement || e.target;
    if (e.ctrlKey) {
        if ($(d).is("input, textarea")) {
            // Special Input for  CTRL - am, vm, sm, svm
            if (keyCode === 54) {
                e.target.value += am;
                return preventTheDefault(e);
            } else if (keyCode === 221) {
                e.target.value += vm;
                return preventTheDefault(e);
            } else if (keyCode === 220) {
                e.target.value += svm;
                return preventTheDefault(e);
            } else if (keyCode === 189) {
                e.target.value += sm;
                return preventTheDefault(e);
            }
        } else if ($(d).attr("contenteditable") == "true") {
            // HTML versions of CTRL - am, vm, sm, svm for nicEdit
            if (keyCode === 54) {
                nicEdit_pasteHtmlAtCaret("<am>&uarr;</am>"); // am
                return preventTheDefault(e);
            } else if (keyCode === 221) {
                nicEdit_pasteHtmlAtCaret("<vm>&rceil;</vm>"); // vm
                return preventTheDefault(e);
            } else if (keyCode === 220) {
                nicEdit_pasteHtmlAtCaret("<svm>&bull;</svm>"); // svm
                return preventTheDefault(e);
            } else if (keyCode === 189) {
                nicEdit_pasteHtmlAtCaret("&prod;"); // sm
                return preventTheDefault(e);
            }
        }

        // Change return to insert <break> instead of <paragraph> for nicEdit
    } else if (keyCode === 13 && !e.shiftKey) {
        if ($(d).prop("id") != "txtInput") {
            var elid = $(document.activeElement).parents('.nicEdit-selected').length
            if (elid || $(document.activeElement).hasClass("nicEdit-selected")) {
                nicEdit_pasteHtmlAtCaret("<br/>")
                preventTheDefault(e);
            };

            if ((d.tagName.toUpperCase() === 'INPUT' &&
                (d.type.toUpperCase() === 'TEXT' ||
                    d.type.toUpperCase() === 'PASSWORD' ||
                    d.type.toUpperCase() === 'FILE' ||
                    d.type.toUpperCase() === 'COLOR' ||
                    d.type.toUpperCase() === 'DATE' ||
                    d.type.toUpperCase() === 'DATETIME' ||
                    d.type.toUpperCase() === 'DATETIME-LOCAL' ||
                    d.type.toUpperCase() === 'EMAIL' ||
                    d.type.toUpperCase() === 'MONTH' ||
                    d.type.toUpperCase() === 'NUMBER' ||
                    d.type.toUpperCase() === 'RANGE' ||
                    d.type.toUpperCase() === 'SEARCH' ||
                    d.type.toUpperCase() === 'TEL' ||
                    d.type.toUpperCase() === 'TIME' ||
                    d.type.toUpperCase() === 'URL' ||
                    d.type.toUpperCase() === 'WEEK'))) {
                hideKeyboard(d)
                return preventTheDefault(e);
            }
        }

    } else if (keyCode == 8) {
        // Prevent the backspace key from navigating back.
        var doPrevent = false;
        if ((d.tagName.toUpperCase() === 'INPUT' &&
            (d.type.toUpperCase() === 'TEXT' ||
                d.type.toUpperCase() === 'PASSWORD' ||
                d.type.toUpperCase() === 'FILE' ||
                d.type.toUpperCase() === 'COLOR' ||
                d.type.toUpperCase() === 'DATE' ||
                d.type.toUpperCase() === 'DATETIME' ||
                d.type.toUpperCase() === 'DATETIME-LOCAL' ||
                d.type.toUpperCase() === 'EMAIL' ||
                d.type.toUpperCase() === 'MONTH' ||
                d.type.toUpperCase() === 'NUMBER' ||
                d.type.toUpperCase() === 'RANGE' ||
                d.type.toUpperCase() === 'SEARCH' ||
                d.type.toUpperCase() === 'TEL' ||
                d.type.toUpperCase() === 'TIME' ||
                d.type.toUpperCase() === 'URL' ||
                d.type.toUpperCase() === 'WEEK'))
            || d.tagName.toUpperCase() === 'TEXTAREA') {
            doPrevent = d.readOnly || d.disabled;
        } else {
            doPrevent = $(d).attr("contenteditable") != "true"
        }
        if (doPrevent) return preventTheDefault(e);
    }

    return true;
}

// Prevent unwanted backspace key from going to previous page
$(document).keyup(checkKeyUp);
$(document).keydown(checkKeyDown);

var lastInputElement;
function hideKeyboard(e) {
    if (!isMobile()) return;
    if (!e) e = document.activeElement;

    lastInputElement = $(e)
    lastInputElement.attr('readonly', 'readonly'); // Force keyboard to hide on input field.
    lastInputElement.attr('disabled', 'true'); // Force keyboard to hide on textarea field.
    setTimeout(function () {
        lastInputElement.blur();  //actually close the keyboard
        // Remove readonly attribute after keyboard is hidden.
        lastInputElement.removeAttr('readonly');
        //    $('#statustxt').text('hide ' + Timer());
        lastInputElement.removeAttr('disabled');

    }, 100);
}

function showKeyboard(e) {
    if (!isMobile()) return;
    if (!e) e = document.activeElement;
    if (e.nodeName == "BODY") return $(lastInputElement).focus();

    lastInputElement = $(e)
    lastInputElement.blur();
    lastInputElement.focus();
    setTimeout(function () {
        lastInputElement.focus()
        //$('#statustxt').text('show ' + Timer())
    }, 100);
}

window._isDirty = false;

function checkKeyUp(e) {
    if (!capturingKeys || !capturedKeyUsekeyup) return;

    if (e === undefined) e = window.event;
    var keyCode = e.which ? e.which : e.keyCode;
    var str = e.target.value;
    if (!str) str = ' ';

    capturedKey = str.charCodeAt(str.length - 1) + '.false.false.' + str.charAt(str.length - 1);

    return keyInActivate(e);
}

function appendKey(C) {
    if (capturingKeys) {
        capturedKey = C.charCodeAt(C.length - 1) + '.false.false.' + C.charAt(C.length - 1);
        return
    }

    var txtInput = inputBox();
    if ($(txtInput).length == 0) return;

    var doCrlf = InStr(0, C, Chr(13));
    if (doCrlf >= 0) C = Left(C, doCrlf);

    if (Left(C, 1) == esc) {
        var currentVal = "";
        C = Mid(C, 1);
    } else {
        var currentVal = $(txtInput).val();
    }

    $(txtInput).val(currentVal + C);

    if (doCrlf != -1) txtInput_CRLF();
}

function nicEdit_pasteHtmlAtCaret(html) {
    var sel, range;
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // only relatively recently standardized and is not supported in
            // some browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(),
                node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);

            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
    }
}

function isInternetExplorer() {
    return navigator.appName.indexOf("Internet Explorer") != -1
}


function paramVar(name) {
    var results = formVar(name);
    if (results) return results;

    results = queryVar(name);
    if (results) return results

    results = GetCookie(name);
    if (results) return results

    return null;
}

function jsbFormVars(includeAllCheckBoxes) {
    var dataSet = {}
    $("#jsb .CtlLabel").each(function (idx, ele) {
        var id = $(ele).attr('id');
        var txt = $(ele).text();

        if (id & txt) dataSet[id] = $(ele).text();
    });

    $("#jsb :input[name]").each(function (idx, ele) {
        var name = $(ele).attr('name');
        var val = $(ele).val();
        if (val) dataSet[name] = val;
    });

    if (includeAllCheckBoxes) {
        $("#jsb :input[id][type='checkbox']:not([name])").each(function (idx, ele) {
            var id = $(ele).attr('id');
            var val = $(ele).prop('checked')
            if (val) dataSet[id] = val
        });
    }

    return dataSet;
}

// see also storeVal(name, val
var oneWarning = true;
function formVar(name, includeIdSearch) {
    // Try by name first
    if (typeof name == 'string') {
        var results = $("[name='" + name + "']")
        if (!results.length && includeIdSearch) results = $("[id='" + name + "']")
        if (!results.length > 1) alert('jsblib function formVar(' + name + ') resulted in multiple values')
    } else {
        var results = $(name)
    }
    if (results.length == 0) return null;

    var result = $(results)[0];
    for (var i = 0; i < results.length; i++) {
        var thisOne = results[i]
        if ($(thisOne).val()) {
            result = thisOne;
            break;
        }
    }

    if ($(result).hasClass('magicSelect')) result = $('#ms_' + $(result).attr('id'))
    if ($(result).parent().hasClass('ms-sel-ctn')) result = $(result).parent().parent()

    if ($(result).hasClass('ms-ctn')) {
        var ms = $(result).magicSuggest()
        var msResults = ms.getValue()
        if (!ms.getCfg) return null;
        if (ms.getCfg().maxSelection == 1) {
            if (msResults.length == 1) return msResults[0]; else return null;
        }
        return msResults
    }

    if (!result.nodeName) return result.value;
    if (result.nodeName == "INPUT" && (result.type == "radio" || result.type == "checkbox")) {
        var name = result.name
        if (!name) return $(result).prop('checked');
        var ctls = $("input[name='" + name + "']:checked")
        if (ctls.length <= 1) return $(ctls).val()
        return $(ctls).map(function (_, el) {
            return $(el).val();
        }).get();
    }

    if (result.type == "textarea" && $('#' + name).hasClass('ace_editor')) {
        var editor = ace.edit(name)
        return editor.session.getValue();
    }

    if ((result.type == "select" || result.type == "select-one") && result.value == "Select Something") return null;

    result = result.value;
    if (result == "true") return true
    if (result == "false") return false
    if (result == "undefined") return undefined
    if (isNumeric(result)) return CNum(result);

    return result;
}

///////////////////////////////////////////////////////////////////
// vertical Splitter Code
///////////////////////////////////////////////////////////////////
function vSplitterDragElement(ID) {
    var md; // remember mouse down info
    var splitterBox = document.getElementById(ID);
    var firstPane = document.getElementById(ID + "_1ST");
    var secondPane = document.getElementById(ID + "_2ND");
    var seperatorHandle = document.getElementById(ID + "_SEP");
    var dblState = 0;

    seperatorHandle.onmousedown = onMouseDown;
    seperatorHandle.ondblclick = onDoubleClick;
    seperatorHandle.onmouseup = onMouseUp;

    function onMouseUp(e) {
        // Fire Top & Bottom resize event
        window.dispatchEvent(new Event('resize'));
    }

    function onMouseDown(e) {
        md = {
            e: e,
            offsetLeft: seperatorHandle.offsetLeft,
            offsetTop: seperatorHandle.offsetTop,
            firstPaneWidth: firstPane.offsetWidth,
            secondPaneWidth: secondPane.offsetWidth
        };

        document.onmousemove = onMouseMove;
        document.onmouseup = function () {
            document.onmousemove = document.onmouseup = null;
        }
    }


    function onMouseMove(e) {
        if (firstPane.style.display == "none") {
            firstPane.style.display = "";
            firstPane.offsetWidth = 0;
        }

        var delta = { x: e.clientX - md.e.clientX, y: e.clientY - md.e.clientY };
        delta.x = Math.min(Math.max(delta.x, -md.firstPaneWidth), md.secondPaneWidth);
        seperatorHandle.style.left = md.offsetLeft + delta.x + "px";
        firstPane.style.width = (md.firstPaneWidth + delta.x) + "px";
        secondPane.style.width = (md.secondPaneWidth - delta.x) + "px";
    }

    function onDoubleClick(e) {
        var ID = $(e.srcElement).attr('id');
        ID = ID.substring(0, ID.length - 4); // drop _SEP

        if (secondPane.style.display == "" && firstPane.style.display == "") { // both showing
            vSplitterHideFirstPane(ID, false) // Show only Right

        } else if (firstPane.style.display != "") {
            vSplitterShowFirstPane(ID)
            vSplitterHideSecondPane(ID, false) // Show only Left

        } else if (secondPane.style.display != "") {
            vSplitterShowSecondPane(ID) // Show Both
        }
    }

    window.onresize = function () { vSplitter_resize(ID) }
}

function vSplitterHideShowFirstPane(ID, andBar) {
    var firstPane = document.getElementById(ID + "_1ST");
    if (firstPane.style.display == "none") vSplitterShowFirstPane(ID); else vSplitterHideFirstPane(ID, andBar);
}

function vSplitterHideFirstPane(ID, andBar) {
    var firstPane = document.getElementById(ID + "_1ST");
    var seperatorHandle = document.getElementById(ID + "_SEP");

    firstPane.style.display = "none";
    if (andBar) seperatorHandle.style.display = "none";
    vSplitter_resize(ID);
}

function vSplitterShowFirstPane(ID) {
    var firstPane = document.getElementById(ID + "_1ST");
    firstPane.style.display = "";
    vSplitter_resize(ID)
}

function vSplitterHideShowSecondPane(ID, andBar) {
    var secondPane = document.getElementById(ID + "_2ND");
    if (secondPane.style.display == "none") vSplitterShowSecondPane(ID); else vSplitterHideSecondPane(ID, andBar);
}

function vSplitterHideSecondPane(ID, andBar) {
    var secondPane = document.getElementById(ID + "_2ND");
    secondPane.style.display = "none";
    vSplitter_resize(ID)
}

function vSplitterShowSecondPane(ID) {
    var secondPane = document.getElementById(ID + "_2ND");
    secondPane.style.display = "";
    vSplitter_resize(ID);
}

function vSplitter_resize(ID) {
    var splitterBox = document.getElementById(ID);
    var secondPane = document.getElementById(ID + "_2ND");
    var firstPane = document.getElementById(ID + "_1ST");
    var seperatorHandle = document.getElementById(ID + "_SEP");

    if (secondPane.style.display != "none") {
        if (firstPane.style.display != "none") seperatorHandle.style.display = "";

        secondPane.style.width = (splitterBox.offsetWidth - seperatorHandle.offsetWidth - firstPane.offsetWidth) + "px"
    }

    if (firstPane.style.display != "none") {
        firstPane.style.width = (splitterBox.offsetWidth - seperatorHandle.offsetWidth - secondPane.offsetWidth) + "px"
    }
}

///////////////////////////////////////////////////////////////////
// horizontal Splitter Code
///////////////////////////////////////////////////////////////////
function hSplitterDragElement(ID) {
    var md; // remember mouse down info
    var splitterBox = document.getElementById(ID);
    var firstPane = document.getElementById(ID + "_TOP");
    var secondPane = document.getElementById(ID + "_BOT");
    var seperatorHandle = document.getElementById(ID + "_SEP");

    seperatorHandle.onmousedown = onMouseDown;
    seperatorHandle.ondblclick = onDoubleClick;
    seperatorHandle.onmouseup = onMouseUp;

    function onMouseUp(e) {
        // Fire Top & Bottom resize event
        window.dispatchEvent(new Event('resize'));
    }

    function onMouseDown(e) {
        md = {
            e: e,
            offsetLeft: seperatorHandle.offsetLeft,
            offsetTop: seperatorHandle.offsetTop,
            firstPaneHeight: firstPane.offsetHeight,
            secondPaneHeight: secondPane.offsetHeight
        };

        document.onmousemove = onMouseMove;
        document.onmouseup = function () {
            document.onmousemove = document.onmouseup = null;
        }
    }

    function onMouseMove(e) {
        if (firstPane.style.display == "none") {
            firstPane.style.display = "";
            firstPane.offsetHeight = 0;
        }

        var delta = { x: e.clientX - md.e.clientX, y: e.clientY - md.e.clientY };
        delta.y = Math.min(Math.max(delta.y, -md.firstPaneHeight), md.secondPaneHeight);
        seperatorHandle.style.top = md.offsetTop + delta.y + "px";
        firstPane.style.height = (md.firstPaneHeight + delta.y) + "px";
        secondPane.style.height = (md.secondPaneHeight - delta.y) + "px";
    }

    function onDoubleClick(e) {
        var ID = $(e.srcElement).attr('id');
        ID = ID.substring(0, ID.length - 4); // drop _SEP
        if (secondPane.style.display == "" && firstPane.style.display == "") { // both showing
            hSplitterHideFirstPane(ID, false) // Show only Right

        } else if (firstPane.style.display != "") {
            hSplitterShowFirstPane(ID)
            hSplitterHideBottomPane(ID, false) // Show only Top

        } else if (secondPane.style.display != "") {
            hSplitterShowBottomPane(ID) // Show Both
        }
    }
}

function hSplitterHideShowFirstPane(ID, andBar) {
    var firstPane = document.getElementById(ID + "_TOP");
    if (firstPane.style.display == "none") hSplitterShowFirstPane(ID); else hSplitterHideFirstPane(ID, andBar);
}

function hSplitterHideFirstPane(ID, andBar) {
    var splitterBox = document.getElementById(ID);
    var firstPane = document.getElementById(ID + "_TOP");
    var secondPane = document.getElementById(ID + "_BOT");
    var seperatorHandle = document.getElementById(ID + "_SEP");

    firstPane.style.display = "none";
    if (andBar) {
        seperatorHandle.style.display = "none";
        if (secondPane.style.display != "none") secondPane.style.height = (splitterBox.offsetHeight) + "px";
    } else {
        if (secondPane.style.display != "none") secondPane.style.height = (splitterBox.offsetHeight - seperatorHandle.offsetHeight) + "px";
    }
}

function hSplitterShowFirstPane(ID) {
    var splitterBox = document.getElementById(ID);
    var firstPane = document.getElementById(ID + "_TOP");
    var secondPane = document.getElementById(ID + "_BOT");
    var seperatorHandle = document.getElementById(ID + "_SEP");

    firstPane.style.display = "";
    if (secondPane.style.display != "none") {
        seperatorHandle.style.display = "";
        secondPane.style.height = (splitterBox.offsetHeight - seperatorHandle.offsetHeight - firstPane.offsetHeight) + "px"
    }
}

function hSplitterHideShowBottomPane(ID, andBar) {
    var secondPane = document.getElementById(ID + "_BOT");
    if (secondPane.style.display == "none") hSplitterShowBottomPane(ID); else hSplitterHideBottomPane(ID, andBar);
}

function hSplitterHideBottomPane(ID, andBar) {
    var splitterBox = document.getElementById(ID);
    var secondPane = document.getElementById(ID + "_BOT");
    var firstPane = document.getElementById(ID + "_TOP");
    var seperatorHandle = document.getElementById(ID + "_SEP");

    secondPane.style.display = "none";
    if (andBar) {
        seperatorHandle.style.display = "none";
        if (firstPane.style.display != "none") firstPane.style.height = (splitterBox.offsetHeight) + "px";
    } else {
        if (firstPane.style.display != "none") firstPane.style.height = (splitterBox.offsetHeight - seperatorHandle.offsetHeight) + "px";
    }
}

function hSplitterShowBottomPane(ID) {
    var splitterBox = document.getElementById(ID);
    var secondPane = document.getElementById(ID + "_BOT");
    var firstPane = document.getElementById(ID + "_TOP");
    var seperatorHandle = document.getElementById(ID + "_SEP");

    secondPane.style.display = "";
    if (firstPane.style.display != "none") {
        seperatorHandle.style.display = "";
        firstPane.style.height = (splitterBox.offsetHeight - seperatorHandle.offsetHeight - secondPane.offsetHeight) + "px"
    }
}


///////////////////////////////////////////////////////////////////
// Context Menu Code
///////////////////////////////////////////////////////////////////
var contextMenuTimer;
var cMenu;
var contextMenuTarget;

//$(document).on("click", ".contextMenu", function (e) {
//   var Ctl = e.target;
//   var Cmd = $(Ctl).attr("cmd")
//   var Val = $(Ctl).attr("val")
//   contextMenu_Submit(Ctl, Cmd, Val)
//})
$(document).on("mouseup", function (e) {
    if (!cMenu || $(e.target).hasClass("contextMenu")) return;
    contextMenuTimer = window.setTimeout(contextMenuClose, 10);
});

// This routine display the menu
function jsbContentMenu(e, aMenu) {
    if (cMenu) contextMenuClose();

    var bodyOffsets = document.body.getBoundingClientRect();
    if (e && e.pageY) {
        mouseDownX = e.pageX - bodyOffsets.left;
        mouseDownY = e.pageY;
    }

    cMenu = aMenu;
    $('body').append(cMenu);

    // Position Menu best we can
    var py = mouseDownY;
    var ch = $(cMenu).height();
    var wh = $(window).height();
    var endPointY = py + ch;
    var overBy = endPointY - wh;
    if (overBy > 0) py -= overBy;
    if (py < 0) py = 0;

    cMenu.css({
        'top': py,
        'left': mouseDownX,
        'z-index': nextZIndex(),
        'visibility': "visible"
    })
    cMenu.bind('mouseover', contextMenuMouseOver);
    cMenu.bind('mouseout', contextMenuSetTimer);

    // Pass information about which control we are putting a context menu on (contextMenuCtlID and contextMenuCtlText)
    contextMenuTarget = e.currentTarget;

    var targetID = $(contextMenuTarget).attr('id');
    if (!targetID) targetID = $(contextMenuTarget).attr('name');
    if (!targetID) {
        targetID = $(contextMenuTarget).closest("[for!='']").attr("for")
        if (targetID) {
            var newContextMenuTarget = $(contextMenuTarget).siblings('[id="' + targetID + '"]')
            if (newContextMenuTarget.length) contextMenuTarget = newContextMenuTarget;
        }
    }

    if (!$('#contextMenuCtlID').length) $('#jsb').append('<input type="hidden" id="contextMenuCtlID" name="contextMenuCtlID" />');
    if (!$('#contextMenuCtlText').length) $('#jsb').append('<input type="hidden" id="contextMenuCtlText" name="contextMenuCtlText" />');

    $('#contextMenuCtlText').val(Trim(Change($(contextMenuTarget).text(), Chr(160), Chr(32))))
    $('#contextMenuCtlID').val(targetID)

    return false;
}

// When we chose a context menu item, this routine is called (except for onlick: javascript versions)
function contextMenu_Submit(contextMenu, Cmd, Val) {
    //  Pass information about which context menu that they clicked (contextMenuCmd and contextMenuVal)

    if ($('#contextMenuCmd').length == 0) $('#jsb').append('<input id="contextMenuCmd" name="contextMenuCmd" type="hidden" />')
    if ($('#contextMenuVal').length == 0) $('#jsb').append('<input id="contextMenuVal" name="contextMenuVal" type="hidden" />')
    if ($('#contextMenuText').length == 0) $('#jsb').append('<input id="contextMenuText" name="contextMenuText" type="hidden" />')

    $('#contextMenuCmd').val(Cmd)
    $('#contextMenuVal').val(Val)
    $('#contextMenuText').val(Change(contextMenu.innerText, Chr(160), Chr(32)))

    contextMenuClose()
    main_VT100.doJsbSubmit(false  /* validate */)
}

var ignoreNextClose = false;
function contextMenuClose() {
    if (!cMenu) return;
    if (ignoreNextClose) { ignoreNextClose = false; return }

    cMenu.remove();
    contextMenuTimer = null;
    cMenu = null;
}

function contextMenuSetTimer() {
    contextMenuTimer = window.setTimeout(contextMenuClose, 900);
}

function contextMenuMouseOver() {
    if (contextMenuTimer) {
        window.clearTimeout(contextMenuTimer);
        contextMenuTimer = null;
    }
}
///////////////////////////////////////////////////////////////////

// Width and Height of window calculations
function calcWidth(width) {
    if (!width) width = "80%"; else width = String(width);
    if (width.substr(0, 1) == '"' || width.substr(0, 1) == "'") width = width.substr(1, width.length - 2);
    if (width.toLowerCase() == 'auto') return width;
    if (width.slice(-1) == "%") width = parseFloat(width) / 100 * $(window).width(); else width = parseFloat(width);
    return parseInt(width);
}

function calcHeight(height) {
    if (!height) height = "auto"; else height = String(height);
    if (height.substr(0, 1) == '"' || height.substr(0, 1) == "'") height = height.substr(1, height.length - 2);
    if (height.toLowerCase() == 'auto') return height;
    if (height.slice(-1) == "%") height = parseFloat(height) / 100 * $(window).height(); else height = parseFloat(height);
    return parseInt(height);
}

function isUrl(urlOrHtml) {
    if (!isString(urlOrHtml)) return false;
    if (urlOrHtml.startsWith("http:") || urlOrHtml.startsWith("https:") || urlOrHtml.startsWith(".") || urlOrHtml.startsWith("/") || urlOrHtml.startsWith("file:")) return true;
    return InStr(urlOrHtml, "<") == -1 && InStr(urlOrHtml, ">") == -1 && InStr(urlOrHtml, "\n") == -1 && InStr(urlOrHtml, "\r") == -1; // We shouldn't have these in a URL but should in HTML
    // return isString(urlOrHtml) && InStr(Left(urlOrHtml, 5), "<") == -1;
}

// Use new popoutDialog(...)
// urlOrHtml: may be String or jQuery Object
// creates an element dialog called popOutDIV
//
function popoutDialog(title, urlOrHtml, width, height, onCloseSubmitOrFunction, putResultInCtlOrID) {
    var isURL = isUrl(urlOrHtml);
    var isElement = isObject(urlOrHtml);

    var myDialog, popOutJSB;

    var myJsb = main_VT100.$jsbForm
    var maxWidth = $(window).width()
    var maxHeight = $(window).height()
    var dftAns = "";

    FlushHTML();

    if (!isElement && !isURL && InStr(urlOrHtml, c28) != -1) urlOrHtml = convertPrint2Html(null, Change(urlOrHtml, am, crlf));

    if (!width) width = 'auto';  // was 100% - 6/5/17
    if (!height) height = 'auto' // was 100% - 6/5/17

    if (width != 'auto') {
        width = calcWidth(width)
        if (myJsb.width() < maxWidth) maxWith = myJsb.width();
        if (width > maxWidth && maxWidth) width = maxWidth;
    }

    if (height != 'auto') {
        height = calcHeight(height)
        if (myJsb.height() < maxHeight) maxHeight = myJsb.height();
        if (height > maxHeight && maxHeight) height = maxHeight;
    }

    var initDialog = {
        autoOpen: false,
        modal: true,
        closeOnEscape: false,
        resizable: width != '100%',
        width: width,
        height: height,
        minHeight: 200, // added - 6/5/17
        title: title,

        open: function () {
            if (spinnerCnt) $("body").removeClass("loading");
        },

        close: function (event, ui) {
            if (spinnerCnt) $("body").addClass("loading");

            // Result is stored in myDialog.answer (Caught on location change)
            if (isURL) {
                $('#popOutID').remove();
                var adr = myDialog.answer;
                if (!adr) adr = myDialog.jsbLocation;
                if (!adr) adr = jsbLocation;
                myDialog.answer = getFirstUrlArg(adr)

            } else {
                var firstInput = $(":input[value]:not(input[name][type=button],input[type=submit],button):first", myDialog);
                if (!firstInput.length) firstInput = $(":input[name][value]:first", myDialog);
                if (firstInput.length) myDialog.answer = formVar(firstInput); //  else if (putResultInCtlOrID) myDialog.answer = formVar(putResultInCtlOrID); 
            }

            if (putResultInCtlOrID) storeVal(putResultInCtlOrID, myDialog.answer);

            if (!myDialog.killed) {
                if (isFunction(onCloseSubmitOrFunction)) {
                    onCloseSubmitOrFunction(myDialog.answer)

                } else if (onCloseSubmitOrFunction) {
                    main_VT100.doJsbSubmit(false  /* validate */);
                }
            }

            unstackWindow(stackLevel)
            $(popOutJSB).remove()
            $(this).remove();
        }
    }

    if (height == 'auto') initDialog.position = { my: 'top', at: 'top+150' }

    var myDialog = $("<div id='popOutDIV' class='jsbDialog' style='white-space: normal'></div>");
    var stackLevel = stackWindow(myDialog);    // Create new jsb inside of myDialog
    popOutJSB = main_VT100.$jsbForm

    if (!isURL) {
        // Move head tags to top
        if (!isElement) {
            var headTags = ''
            do {
                var ScriptI = InStr(0, urlOrHtml, "<head");
                if (ScriptI == -1) break;
                var EndLinkI = InStr(ScriptI, urlOrHtml, "</head>");
                if (EndLinkI == -1) break;
                EndLinkI += 7;

                headTags += Mid(urlOrHtml, ScriptI, EndLinkI - ScriptI) + crlf;
                urlOrHtml = Left(urlOrHtml, ScriptI) + Mid(urlOrHtml, EndLinkI)
            } while (true);
            $(popOutJSB).append(headTags);
        }

        $(popOutJSB).append(urlOrHtml);
    }

    // Setup Dialog Window
    myDialog.dialog(initDialog);
    myDialog.dialog("open");

    if (!title) {
        $(".ui-dialog-titlebar").hide();
        $(".ui-dialog").css("padding", 0).css("background-color", "transparent")
        $('#popOutDIV').contents().find("body").css("background-color", "transparent")
    } else {
        $(".ui-dialog-titlebar").show();
    }

    return myDialog
}

// For loading combobox's and listbox's
function loadOptions(selectCtlOrID, arrayOfJSON, ValueField, DesciptionField, addBlank, defaultVal, subDel, restrictToList) {
    var e = false;
    if (e) return;

    addBlank = CBool(addBlank)

    if (typeof selectCtlOrID == 'string') {
        var c1 = Left(selectCtlOrID, 1)
        if (c1 == "." || c1 == "#" || c1 == "[" || c1 == "*")
            selectCtlOrID = $(selectCtlOrID);
        else
            selectCtlOrID = $("[id = '" + selectCtlOrID + "']"); // allow spaces
    }

    // If we got passed a JSON object, assume first tag is an array
    if (isJSON(arrayOfJSON)) {
        for (var key in arrayOfJSON) {
            if (isArray(arrayOfJSON[key])) {
                arrayOfJSON = arrayOfJSON[key]
                break;
            }
        }
    }

    var ms = null;
    var msData = []
    var currentValue = formVar(selectCtlOrID)

    if ($(selectCtlOrID).attr('list')) selectCtlOrID = $("#" + $(selectCtlOrID).attr('list'));

    if ($(selectCtlOrID).hasClass('magicSelect')) selectCtlOrID = $('#ms_' + $(selectCtlOrID).attr('id'))
    if ($(selectCtlOrID).hasClass('ms-ctn')) {
        var ms = $(selectCtlOrID).magicSuggest()
    } else {
        $(selectCtlOrID).empty();
    }

    var hasBlank = false;
    if (isString(arrayOfJSON)) {
        if (Seq(subDel) >= 252) arrayOfJSON = Split(arrayOfJSON, Chr(Seq(subDel) + 1)); else arrayOfJSON = Split(arrayOfJSON, am);
    }

    // If we have an array of JSON, and no ValueField, assume first string first is description
    if (!ValueField && !DesciptionField && Len(arrayOfJSON)) {
        var value = arrayOfJSON[LBound(arrayOfJSON)];
        if (isJSON(value)) {
            for (var key in value) {
                var f = value[key];
                if (isString(f)) {
                    if (!DesciptionField) DesciptionField = key;
                } else if (isNumber(f)) {
                    if (!ValueField) ValueField = key;
                }
            }
        }
    }

    var oneValue;
    var ub = UBound(arrayOfJSON);
    if (!ValueField && !DesciptionField) {
        for (var i = LBound(arrayOfJSON); i <= ub; i++) {
            var value = arrayOfJSON[i];
            if (!subDel) {
                if (InStr(value, sm) >= 0) subDel = sm;
                else if (InStr(value, am) >= 0) subDel = am;
                else if (InStr(value, vm) >= 0) subDel = vm;
                else if (InStr(value, svm) >= 0) subDel = svm;
                else if (InStr(value, ssvm) >= 0) subDel = ssvm;
                else if (InStr(value, ";") >= 0) subDel = ";";
                else subDel = ",";
            }

            var j = InStr(value, subDel);
            if (subDel != "" && j != -1) { // desc, value
                var Desc = Left(value, j);
                var subValue = Mid(value, j + 1);

                oneValue = subValue;
                if (ms) {
                    if (Desc) msData.push({ id: subValue, name: Desc });
                } else {
                    $(selectCtlOrID).append($('<option>').text(Desc).attr('value', subValue));
                }

                if (!Desc) hasBlank = true;
            } else {

                if (ms) {
                    if (value) msData.push({ id: value, name: value });
                } else {
                    $(selectCtlOrID).append($('<option>').text(value).attr('value', value));
                }

                if (!value) hasBlank = true;
            }
        }

    } else if (DesciptionField && Len(arrayOfJSON) && arrayOfJSON[LBound(arrayOfJSON)][DesciptionField] !== undefined) {
        for (var i = LBound(arrayOfJSON); i <= ub; i++) {
            var jsRec = arrayOfJSON[i];
            var Desc = jsRec[DesciptionField];
            if (!ValueField) ValueField = DesciptionField;

            var value = jsRec[ValueField]
            oneValue = value;

            if (ms) {
                if (Desc) msData.push({ id: value, name: Desc });
            } else {
                $(selectCtlOrID).append($('<option>').text(Desc).attr('value', value));
            }

            if (!Desc) hasBlank = true;
        }

    } else {
        for (var i = LBound(arrayOfJSON); i <= ub; i++) {
            var val = value = arrayOfJSON[i];
            if (ValueField) val = value[ValueField];

            oneValue = val;
            if (ms) {
                if (val) msData.push({ id: val, name: val });
            } else {
                $(selectCtlOrID).append($('<option>').text(val).attr('value', val));
            }

            if (!value) hasBlank = true;
        }
    }

    if (!hasBlank && addBlank) {
        if (ms) {
            msData.unshift({ id: '', name: '' })
        } else {
            $(selectCtlOrID).prepend('<option selected></option>');
        }

    }

    if (ms) {
        //ms.clear(true);
        ms.setData(msData);
    }

    var changedValue = false;

    if (currentValue) {
        if (hasOption(selectCtlOrID, currentValue)) {
            storeVal(selectCtlOrID, currentValue);

        } else if (restrictToList) {
            if (defaultVal) {
                changedValue = CStr(defaultVal) != CStr(currentValue);
                storeVal(selectCtlOrID, defaultVal)
            } else {
                storeVal(selectCtlOrID, null)
            }

        } else {
            storeVal(selectCtlOrID, currentValue);
            changedValue = true;
        }

    } else if (defaultVal) {
        changedValue = CStr(defaultVal) != CStr(currentValue);
        storeVal(selectCtlOrID, defaultVal)

    } else if (Len(arrayOfJSON) == 1 && oneValue) {
        changedValue = CStr(currentValue) != CStr(oneValue);
        storeVal(selectCtlOrID, oneValue)

    } else {
        storeVal(selectCtlOrID, null)
    }

    if (changedValue) $(selectCtlOrID).trigger("change")
    $(selectCtlOrID)[0].disabled = ($(selectCtlOrID).hasClass('DropDownBox') && !Len(arrayOfJSON) && !addBlank)
}

// see also formVar(name)
// see also formVar(name)
function storeVal(putResultInCtlOrID, dftAns) {
    // need to be able to store esc for Cancel Button
    if (dftAns == null) dftAns = "";

    if (typeof putResultInCtlOrID == 'string') {
        var Name = putResultInCtlOrID;
        var c1 = Left(Name, 1)
        if (c1 == '#') Name = Mid(Name, 1);

        if (c1 == "." || c1 == "[") {
            putResultInCtlOrID = $(putResultInCtlOrID);
        } else {
            putResultInCtlOrID = $("[id = '" + Name + "']"); // allow spaces
            if ($(putResultInCtlOrID).length == 0) {
                putResultInCtlOrID = $('<input type="hidden" id="' + Name + '" name="' + Name + '" />').appendTo('#jsb');
            }
        }
    }

    if ($(putResultInCtlOrID).length == 0) return;
    putResultInCtlOrID = $($(putResultInCtlOrID)[0])

    if ($(putResultInCtlOrID).hasClass("fieldSetBtn")) {
        // field set btns
        var myParent = $(putResultInCtlOrID).closest(".fieldSetBtnsDiv")
        $(myParent).find("label").removeClass("checked"); // reset all children
        var radioCtl = myParent.find("[value='" + dftAns + "']")
        if (radioCtl.length) fieldSetBtn_Change(radioCtl[0]);
        return
    }

    if ($(putResultInCtlOrID).hasClass("RadioBtn")) {
        // field set btns
        var myParent = $(putResultInCtlOrID).closest("fieldset")
        $(myParent).find("input").prop("checked", false) // reset all children
        var selectedOne = myParent.find("[value='" + dftAns + "']")
        if (selectedOne.length) selectedOne.prop("checked", true)
        return
    }

    if ($(putResultInCtlOrID).hasClass('magicSelect')) putResultInCtlOrID = $('#ms_' + $(putResultInCtlOrID).attr('id'))
    if ($(putResultInCtlOrID).is("datalist") && fieldRight($(putResultInCtlOrID).attr("id"), "_")) putResultInCtlOrID = $(dropRight("#" + $(putResultInCtlOrID).attr('id'), "_"));
    if ($(putResultInCtlOrID).parent().hasClass('ms-sel-ctn')) putResultInCtlOrID = $(putResultInCtlOrID).parent().parent()

    if ($(putResultInCtlOrID).hasClass('AutoTextBox') && $(putResultInCtlOrID).next().hasClass('AutoTextBox')) return acceptValue($(putResultInCtlOrID).next(), dftAns);

    if ($(putResultInCtlOrID).is(":checkbox")) return $(putResultInCtlOrID).prop("checked", CBool(dftAns))

    if ($(putResultInCtlOrID).hasClass("hCtlLabel")) {
        $(putResultInCtlOrID).val(dftAns);
        $("#ctllbl_" + $(putResultInCtlOrID).attr('name')).text(dftAns)
        return
    }

    if ($(putResultInCtlOrID).hasClass('SliderLabeled')) {
        var sliderCtl = $(putResultInCtlOrID).prev()
        var handle = $(sliderCtl).find(".ui-slider-handle")
        var OptArray = $(sliderCtl).data().pipsOptions.labels;
        var valArray = $(this).data('valArray')

        var idx, val;
        if (Len(valArray)) idx = locateInArray(dftAns, valArray); else idx = locateInArray(dftAns, OptArray, true);
        if (idx == -1) idx = 0;
        if (Len(valArray)) val = valArray[idx]; else val = OptArray[idx]

        $(sliderCtl).slider({ value: idx })
        handle.text(OptArray[idx]);
        $(putResultInCtlOrID).get(0).value = val
        return
    }

    if ($(putResultInCtlOrID).hasClass('repeaterHtml')) {
        var id = $(putResultInCtlOrID).prop('id')
        if (id) {
            koModel[id].removeAll()
            ko.utils.arrayPushAll(koModel[id], dftAns)
        }
        return;
    }

    if ($(putResultInCtlOrID).is("select")) {
        if (dftAns && !hasOption(putResultInCtlOrID, dftAns)) {
            $(putResultInCtlOrID).append($('<option>').text(dftAns).attr('value', dftAns));
        }
        $(putResultInCtlOrID).val(dftAns);

    } else if ($(putResultInCtlOrID).hasClass('ms-ctn')) {
        var ms = $(putResultInCtlOrID).magicSuggest();
        var hiddenInputID = $(putResultInCtlOrID).attr('id').substr(3)

        var msData = ms.getData();
        var foundIt = null;
        for (var i = 0; i < msData.length; i++) {
            var rec = msData[i];
            if (rec.id == dftAns || rec.name == dftAns) {
                foundIt = rec;
                break
            }
        }

        if (foundIt) {
            ms.clear(true)
            ms.addToSelection([foundIt], true);

        } else {
            if (dftAns == null || dftAns == "") {
                ms.clear()
            } else {
                var r = { id: dftAns, name: dftAns }
                ms.setData([r]);
                ms.clear(true)
                ms.addToSelection([r]);
            }
        }

        $('[id="' + hiddenInputID + '"]').val(dftAns)

    } else {
        if ($(putResultInCtlOrID).attr("type") == "range" || $(putResultInCtlOrID).attr("type") == "number") dftAns = CNum(dftAns);
        $(putResultInCtlOrID).val(dftAns);
    }
}


// check is <select> has an option
function hasOption(ctl, value) {
    var foundIt = null;
    if ($(ctl).is("select")) {
        $(ctl).find('option').filter(function () {
            if ($(this).html() == value) foundIt = this
        });
        return foundIt;
    }

    if ($(ctl).hasClass('magicSelect')) ctl = $('#ms_' + $(ctl).attr('id'))
    if ($(ctl).hasClass('ms-ctn')) {
        var ms = $(ctl).magicSuggest();
        var msData = ms.getData();
        for (var i = 0; i < msData.length; i++) {
            var rec = msData[i];
            if (rec.id == value || rec.name == value) return rec;
        }
    }

    return null;
}

// Return the numbr of possible <options>
function optionsCount(ctl) {
    if ($(ctl).is("select")) return $(ctl).find('option').length
    if ($(ctl).hasClass('magicSelect')) ctl = $('#ms_' + $(ctl).attr('id'))
    if ($(ctl).hasClass('ms-ctn')) {
        var ms = $(ctl).magicSuggest();
        var msData = ms.getData();
        return msData.length;
    }

    return 0
}

function DropDownTextToBox(objDropdown, strTextboxId) {
    var myTextBox = $(objDropdown).parent().find('[id="' + strTextboxId + '"]')
    if (!myTextBox.length) return;
    $(myTextBox).get(0).value = $(objDropdown).val();

    $(objDropdown).get(0).lastSelectedIndex = $(objDropdown).get(0).selectedIndex
    $(objDropdown).get(0).selectedIndex = -1;

    try {
        $(myTextBox).trigger("change");
    } catch (err) {
    }

    if ($(".parsley-error").length) parsleyIsValid();
}

function DropDownIndexClear(strDropdownId, fromCtl) {
    if (document.getElementById(strDropdownId) != null) {
        document.getElementById(strDropdownId).selectedIndex = -1;
    }

    if ($(".parsley-error").length) parsleyIsValid();
}

/* 2nd attempt at a drop-down checkbox / combo box */
var lastDrop;
// when I first drop, use Input box to select items
function hasCSVvalue(str, item) {
    // Normalize search string and search list
    str = "," + Change(str, Chr(160), Chr(32)).toLowerCase() + ",";
    item = "," + Change(item, Chr(160), Chr(32)).toLowerCase() + ",";
    return InStr(str, item)
}

function multiSelectAll(box) {
    var parent = $(box).closest('.dropdown-check-list,.check-list')
    $(parent).find(':checkbox').each(function () {
        if (!$(this).prop('checked')) {
            $(this).prop('checked', true);
            multiSelectCheckBoxChanged(this)
        }
    })
}

function multiSelectNone(box) {
    var parent = $(box).closest('.dropdown-check-list,.check-list')
    $(parent).find(':checkbox').each(function () {
        if ($(this).prop('checked')) {
            $(this).prop('checked', false);
            multiSelectCheckBoxChanged(this)
        }
    })
}

// CheckBox Click (change)
function multiSelectCheckBoxChanged(chkInput) {
    if ($(chkInput)[0].nodeName == 'SPAN') chkInput = $(chkInput).prev()
    var parent = $(chkInput).closest('.dropdown-check-list,.check-list');
    var item = Trim($(chkInput).closest('li').text());
    var anchor = $(parent).children('.anchor');
    var input = $(anchor).children('input');

    var str = $(input).val();
    var posi = hasCSVvalue(str, item);

    if ($(chkInput).prop('checked')) {
        // add if it doesn't exist
        if (posi == -1) {
            if (str) str += ",";
            str += item;
        }
    } else {
        // remove if exists
        if (posi == 0) {
            str = str.substr(posi + item.length + 1)
        } else if (posi > 0) {
            str = str.substr(0, posi - 1) + str.substr(posi + item.length)
        }
    }
    $(input).val(str);

    try {
        $(input).trigger("change");
    } catch (err) {
    }

    if ($(".parsley-error").length) parsleyIsValid();

    return false
}

// see http://jsfiddle.net/HTm8z/62/
function multiSelectCheckBoxShowlist(aafter, removeOnly) {
    var parent = $(aafter).closest('.dropdown-check-list,.check-list')
    var items = $(parent).children('ul');
    var anchor = $(parent).children('.anchor');
    var input = $(anchor).children('input');

    if (!input.length) return;
    if (!items.length) return;

    if ($(items).is(":visible")) {
        $(items).hide();
        lastDrop = null;

    } else if (!removeOnly) {
        multiSelectReflectValues(input)
        $(input).attr('autocomplete', 'off');
        $(items).css("max-height", '')
        $(items).css("min-width", '')
        $(items).css("top", '')

        var myParent = $(items).closest("#popOutDIV");
        if ($(myParent).length == 0) myParent = $(parent).closest(".container");
        if ($(myParent).length == 0) myParent = $(parent).closest("div");

        var parentTop, parentHeight;

        if ($(myParent).length) {
            parentTop = $(myParent).offset().top;
        } else {
            myParent = $(window)
            parentTop = 0;
        }
        parentHeight = $(myParent).innerHeight()
        $(items).css("max-height", parentHeight - 20)
        $(items).show();

        $(items).offset({ top: $(aafter).offset().top + $(aafter).height() })

        var myHeight = $(items).outerHeight(true);
        var myTop = $(items).offset().top;
        var myOffset = $(items).offset().top - parentTop;
        var spaceLeft = parentHeight - (myHeight + myOffset);
        if (spaceLeft < 10) {
            myTop = myTop + spaceLeft - 10;
            if (myTop < parentTop + 10) myTop = parentTop + 10;
            $(items).offset({ "top": myTop });
        }

        if ($(items).width() > 200) $(items).css("min-width", $(items).width()); else $(items).css("min-width", $(input).width())
        $(items).css("display", "list-item")
        $(items).show();

        lastDrop = items;
    }
}

function multiSelectReflectValues(input) {
    var parent = $(input).closest('.dropdown-check-list,.check-list')
    var items = $(parent).children('ul');

    var inputs = $(input).val();
    var listItems = $(items).find("li");
    var newList = '';
    listItems.each(function (idx, item) {
        var txt = $(item).text();
        if (hasCSVvalue(inputs, txt) != -1) {
            $(item).find('input').prop('checked', true);
            if (newList) newList += "," + txt; else newList = txt;
        } else {
            $(item).find('input').prop('checked', false);
        }
    });
    $(input).val(newList)
}

$(document).mouseup(function (e) {
    if (!lastDrop) return;
    var target = $(e.target).closest('.dropdown-check-list').children('.items');
    if (target.length) {
        if ($(target)[0] == $(lastDrop)[0]) return;
    }

    $(".dropdown-check-list .items").hide()
    lastDrop = null;
});


/*******************************************************************************************************************
Code to enable Table Cell Swapping //jsfiddle.net/7Xd6n/7/
*******************************************************************************************************************/
var dd_target;
var dd_source;

function disableLabelJump() {
    $("label").each(function (index) {
        var oa = $(this).attr('for');
        if (Left(oa, 4) != "x!x_") $(this).attr('for', "x!x_" + oa)
    });
}

function enableLabels() {
    $("label").each(function (index) {
        var oa = $(this).attr('for') + "";
        if (oa.startsWith("x!x_")) $(this).attr('for', oa.substr(4))
    });
}

// // anything marked class="DragDrop" can be resized and moved
//function enableDD() {
//   // Stop some inputs from capturing mouse (allows d&d)
//   disableLabelJump()

//   $('.DragDrop input, .DragDrop div, .DragDrop select, .DragDrop a, .DragDrop button, .DragDrop fieldset, .DragDrop p, .DragDrop iframe, .DragDrop img, .DragDrop label, .DragDrop span').resizable();
//   $('.DragDrop').draggable({
//      cancel: false
//   });

//   /* make it so any lblctlpair can be switched with another */
//   var obj = $('.lblctlpair');
//   if (!obj.length) obj = $('mdlctl, label, th');

//   if (obj.length) {
//      $('button').click(function (event) {
//         preventTheDefault(event);
//      });

//      $(obj).draggable({
//         cancel: false,
//         cursor: 'pointer',
//         snap: $('td span'),
//         revert: true,
//         revertDuration: 0,

//         start: function (event, ui) {
//            dd_source = $(this);
//            dd_target = null;
//         },

//         stop: function (event, ui) {
//            if (dd_target) {
//               var sourceHtml = dd_source.html();
//               var targetHtml = dd_target.html();

//               dd_target.html(sourceHtml);
//               dd_source.html(targetHtml);
//               dd_target = null;
//            }
//         }
//      })

//      $(obj).droppable({
//         drop: function (event, ui) {
//            dd_target = $(event.target);
//         }
//      })
//   }

//}

//function disableDD() {
//   $('mdlctl input').css('pointer-events', 'auto');
//   $('.DragDrop input').css('pointer-events', 'auto');

//   //$(".formViewNColumns1").colResizable({"disable": true});
//   //$(".formViewNColumns2").colResizable({"disable": true});
//   //$(".formViewNColumns3").colResizable({"disable": true});
//   //(".formViewNColumns4").colResizable({"disable": true});

//   $('.ui-resizable').resizable('destroy');
//   $('.ui-draggable').draggable('destroy');
//   $('.ui-droppable').droppable('destroy');

//   // Renable labels
//   enableLabels()
//}

// use = someurl?var={ctlID1}&var2={ctlID2}
//    use !ctlID if the value shouldn't be urlencoded
//    rowData will be checked first, before $('#ID')
// 

function stdSubstitutions(arg, rowData, id, objName) {
    var param = Field(Field(arg, "(", 2), ")", 1)
    arg = Field(arg, "(", 1)

    switch (arg) {
        case "objectname": case "viewname":
            return objName

        case "niceobjectname": case "niceviewname":
            return nicename(objName)

        case "paramvar": case "@param": case "param":
            return paramVar(param)

        case "formvar": case "@formvar":
            return formVar(param, true)

        case "sessionvar": case "@session":
            return sessionVar(param)

        case "lastvalue":
            return sessionVar('LastValue' + columnName)

        case "applicationvar": case "@application":
            return applicationVar(param)

        case "queryvar": case "urlparam": case "urlvar":
            return queryVar(param)

        case "time":
            return r83Time(r83Time())

        case "itime":
            return r83Time()

        case "timestamp": case "now":
            return Now()

        case "date":
            return (new Date()).toISOString().split('T', 1)[0]; // ISO Date Year-Month_Day

        case "now":
            return Now()

        case "idate":
            return r83Date()

        case "datetime":
            return r83Date(r83Date()) + ' ' + r83Time(r83Time())

        case "timedate":
            return + ' ' + r83Time(r83Time()) + ' ' + r83Date(r83Date())

        case "guid":
            return newGUID()

        case "autoincrement":
        case "id":
        case "primarykey":
            if (id !== undefined) arg = id;
        // fall into default

        default:
            if (rowData[arg] !== undefined) return rowData[arg];
            if (formVar(arg) !== undefined) return formVar(arg, true);
    }
}

// use = someurl?var={arg1}&var2={arg2}
//    use !arg if the value shouldn't be urlencoded
//    rowData will be checked first, before $('#ID')
// 
function urlCtlSubstitutions(url, rowData, id, objName) {
    url = String(url)

    if (url.indexOf("%7B", 0) != -1) {
        url = ChangeI(url, "%7B", "{")
        url = ChangeI(url, "%7D", "}")
    }

    while (1) {
        var val = undefined;
        var i = url.indexOf("{", 0);
        if (i == -1) break;
        var j = url.indexOf("}", i);
        if (j == -1) break;
        var arg = url.substr(i + 1, j - i - 1);
        arg = RTrim(LTrim(urlDecode(arg)))

        var noEncode = arg.substr(0, 1) == '!';
        if (noEncode) arg = arg.substr(1);

        val = stdSubstitutions(arg, rowData, id, objName)

        if (!val) {
            val = ''
            var b = url.lastIndexOf("&", i);
            if (b == -1) b = url.lastIndexOf("?", i);
            if (b != -1) { i = b + 1; j += 1 }
        }

        if (!noEncode) val = urlEncode(val);
        url = url.substr(0, i) + val + url.substr(j + 1);
    }

    // drop trailing ? or &
    var lc = url.substr(url.length - 1);
    if (lc == "?" || lc == "&") url = url.substr(0, url.length - 1);

    return url
}

function substituteDefaults(jsonObj, objName, newRowID) {
    for (var key in jsonObj) {
        var arg = jsonObj[key] + "";
        if (arg.startsWith("{") && arg.endsWith('}')) {
            var arg = Mid(arg, 1, Len(arg) - 2)
            jsonObj[key] = stdSubstitutions(arg, jsonObj, newRowID, objName)
        }
    }
    return jsonObj
}

function resolveUrl(button, transferto, addFromPage, transferextra, selectedID, title) {
    // should have attributes Url, urlparametername, urlparamter
    var btn = $(button)
    var Url = $(btn).attr("url");
    var urlparametername = $(btn).attr("urlparametername");
    var urlparamter = $(btn).attr("urlparamter");

    if (urlparametername && urlparamter) {
        if (InStr(Url, "?") > 0) Url += "&";
        else Url += "?"
        Url += urlparametername + "=" + urlEncode(urlparamter)
    }

    transferUrl(transferto, transferextra, $(btn).val(), $(btn).text(), Url, addFromPage)
}

async function transferUrl(transferto, transferextra, selectedID, title, Url, addFromPage) {
    if (addFromPage) {
        if (InStr(Url, "?") > 0) Url += "&";
        else Url += "?"
        Url += "fromPage=" + urlEncode(window.location)
    }

    if (targetIsLocal(Url)) saveAtSession();

    switch (transferto) {
        case 1: // Pop out Window
            new windowOpen(Url, '_blank', 'height=' + $(window).height() + ',width=' + $(window).width());
            break;

        case 2: // New Window Tab
            new windowOpen(Url, '_blank');
            break;

        case 3: // Tab - transferextra
            openInTab(transferextra, selectedID, title, Url);
            break;

        case 4: // Frame - transferextra
            openInIFrame(transferextra, Url);
            break;

        case 5: // Div - title: transferextra
            new windowOpen(Url, '_blank');
            break;

        case 6: // Dialog
            await popoutWindow(transferextra, Url, '80%', '80%');
            break;

        case 7: // PostBack
            postBack(transferextra, selectedID, title);
            break;

        case 10: // current window
            new windowOpen(Url, '_self');
            break;

        case 12: // top window
            new windowOpen(Url, '_top');
            break;

        case 13: // Back
            var Url = queryVar("frompage");
            if (Url) new windowOpen(Url, '_self');
            if (transferextra) window.history.back(CInt(transferextra)); else window.history.back()
            break;
    }
}

function openInTab(containerName, selectedID, title, Url) {
    if (isPhoneGap()) {
        // IFRAMES (the child tab) and the file system doesn't work in Cordova
        return new windowOpen(Url, "_blank")
    }

    var tabs;
    selectedID = nicename(selectedID)

    if (containerName.startsWith(".")) {
        containerName = Mid(containerName, 1);
        tabs = $("#" + containerName)
        if (tabs.length == 0) tabs = $("." + containerName)
    } else {
        tabs = $("#" + containerName)
    }

    var createIt = 0;
    if (tabs.length == 0) createIt = 1; else if (!$(tabs).hasClass("tabs")) createIt = 2;
    if (createIt) {
        var sTabs = $('<div id="' + containerName + '" class="tabs"><ul style="border-style:hidden hidden solid hidden"><li id="tabsli_1"><a href="#tabs_1">Demo</a></li></ul></div><div id="tabs_1"></div>');
        if (createIt == 1) {
            $(sTabs).addClass("dynamicTab");
            if ($('.ui-layout-center').length) $(sTabs).appendTo('.ui-layout-center'); else
                if ($('#jsb').length) $(sTabs).appendTo('#jsb'); else
                    $(sTabs).appendTo('body');
            tabs = $("#" + containerName)
        } else {
            $(tabs).replaceWith(sTabs);
            tabs = $("#" + containerName)
        }
    }

    tabs = $(tabs).tabs();
    tab = $('#tab_' + selectedID);

    if (tab.get(0)) {
        tabs.tabs("option", "active", tab.index() - 1);

    } else {
        // Remove Hint Tab if it exists
        if (createIt) {
            $("#tabs_1").remove();
            $("#tabsli_1").remove();
        }
        var ul = tabs.find("ul");
        $("<li id='tabli_" + selectedID + "'><a href='#tab_" + selectedID + "'>" + title + "</a><span class='ui-icon ui-icon-close ui-closable-tab' role='presentation'>Remove Tab</span></li>").appendTo(ul);
        $("<div id='tab_" + selectedID + "' style='margin: 0; padding: 0; border: 0;' />").appendTo(tabs);
        var tab = $("#tab_" + selectedID)

        Url = fullUrlPath(Url)
        var stopTheSpinner = false;

        var myIFrame = $('<iframe id="mf_' + selectedID + '" scrolling= "no" class="IFrame" application="yes" sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms allow-top-navigation"  src="about:blank" />')
        $(myIFrame).on("load", function (e) {
            var loc = myLocation(myIFrame[0]);
            if (stopTheSpinner) {
                stopSpinner();
                stopTheSpinner = false;
            }

            if (checkUrlForClose(loc)) {
                tabs.tabs("option", "active", tab.parent().index() - 2);
                $("#tabli_" + selectedID).remove();
                $("#tab_" + selectedID).remove();
                tabs.tabs("refresh");
            }
        }
        ).appendTo(tab);

        tabs.tabs("refresh");
        tabs.tabs("option", "active", tab.index() - 1);

        setTimeout(function () {
            $(myIFrame).attr('src', fullUrlPath(Url));
            startSpinner("Loading");
            stopTheSpinner = true;
        }, 50);
    }

    $(tabs).on("click", ".ui-closable-tab", function () {
        var tabContainerDiv = $(this).closest(".ui-tabs").attr("id");
        var panelId = $(this).closest("li").remove().attr("aria-controls");
        $("#" + panelId).remove();
        $("#" + tabContainerDiv).tabs("refresh");
    });
}

function onjqTabClose() {
    var tabContainerDiv = $(this).closest(".ui-tabs").attr("id");
    var panelId = $(this).closest("li").remove().attr("aria-controls");
    $("#" + panelId).remove();
    $("#" + tabContainerDiv).tabs("refresh");
    if ($(".ui-tabs-tab").length == 0 && window.treeShow) window.treeShow();
}

function openInIFrame(iFrameID, Url) {
    var iframe;

    if (iFrameID.startsWith(".")) {
        iFrameID = Mid(iFrameID, 1);
        iframe = $("#" + iFrameID)
        if (iframe.length == 0) iframe = $("." + iFrameID)
    } else {
        iframe = $("#" + iFrameID)
    }

    var createIt = 0;
    if (iframe.length == 0) {
        createIt = 1
    } else {
        if (!$(iframe).is("iframe")) createIt = 2;
    }

    if (createIt) {
        var inode = $('<iframe id="' + iFrameID + '" scrolling= "no" application="yes" sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms allow-top-navigation"  />');
        $(inode).on("load",
            function (e) {
                var myIFrame = window[iFrameID]
                if (!myIFrame) return;


                if (checkUrlForClose(myLocation(myIFrame))) $(myIFrame).remove()
            }
        );
        if (createIt == 1) {
            $(inode).addClass('dynamicIFrame2')
            $(inode).appendTo('body')
        } else {
            $(iframe).attr('id', '');
            (inode).addClass('dynamicIFrame1')
            $(iframe).html(inode);
        }
        iframe = $("#" + iFrameID)
    }

    $(iframe).attr('src', fullUrlPath(Url))
}

function openInDiv(containerName, Url) {
    var iDiv;

    if (containerName.startsWith(".")) {
        containerName = Mid(containerName, 1);
        iDiv = $("#" + containerName)
        if (iDiv.length == 0) iDiv = $("." + containerName)
    } else {
        iDiv = $("#" + containerName)
    }

    if (iDiv.length == 0) iDiv = $('<div id="' + containerName + '" style= "position: relative; width: 100%; height:98%; margin: 0; padding: 0; border: 0;" />').appendTo('body');

    Url = fullUrlPath(Url)
    $(iDiv).load(Url)
}

function postBack(containerName, selectedID, title, url) {
    var iHidden, iTitle, iUrl;

    if (typeof selectedID == "object") selectedID = json2string(selectedID)
    if (typeof title == "object") title = json2string(title)
    if (typeof url == "object") url = json2string(url)

    // May start with a "." for class name
    if (containerName.startsWith(".")) {
        containerName = Mid(containerName, 1);
        iHidden = $("#" + containerName)
        if (iHidden.length == 0) iHidden = $("." + containerName)
    } else {
        iHidden = $("#" + containerName)
    }

    if (iHidden.length == 0) iHidden = $('<input type="hidden" id="' + containerName + '" name="' + containerName + '" />').appendTo('#jsb');
    $(iHidden).val(selectedID);

    if (title) {
        var iTitle = $("#postBackTitle")
        if (iTitle.length == 0) iTitle = $('<input type="hidden" id="postBackTitle" name="postBackTitle" />').appendTo('#jsb');
        $(iTitle).val(title);
    }

    if (url) {
        var iUrl = $("#postBackUrl")
        if (iUrl.length == 0) iUrl = $('<input type="hidden" id="postBackUrl" name="postBackUrl" />').appendTo('#jsb');
        $(iUrl).val(url);
    }

    main_VT100.doJsbSubmit(false /* validate */)
}

function doJsbSubmit(validate) {
    main_VT100.doJsbSubmit(validate)
}

function autoSizeTextarea(el) {
    el = $(el);
    var elH = el.outerHeight();
    el.css({ height: elH, overflow: "hidden" });
    var nH = el.get(0).scrollHeight;
    nH = nH > elH ? nH : elH;
    el.css({ height: nH, overflow: "hidden" })
}


// ================================================== jQuery Mask Plugin v1.6.5 ====================================================
// ================================================== jQuery Mask Plugin v1.6.5 ====================================================
// ================================================== jQuery Mask Plugin v1.6.5 ====================================================
// 
// github.com/igorescobar/jQuery-Mask-Plugin
// examples:
//   
//   $('.date').mask('11/11/1111');
//   $('.time').mask('00:00:00');
//   $('.date_time').mask('00/00/0000 00:00:00');
//   $('.cep').mask('00000-000');
//   $('.phone').mask('0000-0000');
//   $('.phone_with_ddd').mask('(00) 0000-0000');
//   $('.phone_us').mask('(000) 000-0000');
//   $('.mixed').mask('AAA 000-S0S');
//   $('.cpf').mask('000.000.000-00', {"reverse": true});
//   $('.money').mask('000.000.000.000.000,00', {"reverse": true});
//   $('.mixed').mask('AAA 000-S0S');
//   

/*
Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
   conditions:
   The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
 */

(function (g) {
    "function" === typeof define && define.amd ? define(["jquery"], g) : g(window.jQuery || window.Zepto)
})(function (g) {
    var z = function (b, f, d) {
        var l = this,
            x, y;
        b = g(b);
        f = "function" === typeof f ? f(b.val(), void 0, b, d) : f;
        l.init = function () {
            d = d || {};
            l.byPassKeys = [9, 16, 17, 18, 36, 37, 38, 39, 40, 91];
            l.translation = {
                0: {
                    pattern: /\d/
                },
                9: {
                    pattern: /\d/,
                    optional: !0
                },
                "#": {
                    pattern: /\d/,
                    recursive: !0
                },
                A: {
                    pattern: /[a-zA-Z0-9]/
                },
                S: {
                    pattern: /[a-zA-Z]/
                }
            };
            l.translation = g.extend({}, l.translation, d.translation);
            l = g.extend(!0, {}, l, d);
            y =
                c.getRegexMask();
            b.each(function () {
                !1 !== d.maxlength && b.attr("maxlength", f.length);
                d.placeholder && b.attr("placeholder", d.placeholder);
                b.attr("autocomplete", "off");
                c.destroyEvents();
                c.events();
                var a = c.getCaret();
                c.val(c.getMasked());
                c.setCaret(a + c.getMaskCharactersBeforeCount(a, !0))
            })
        };
        var c = {
            getCaret: function () {
                var a;
                a = 0;
                var e = b.get(0),
                    c = document.selection,
                    e = e.selectionStart;
                if (c && !~navigator.appVersion.indexOf("MSIE 10")) a = c.createRange(), a.moveStart("character", b.is("input") ? -b.val().length : -b.text().length),
                    a = a.text.length;
                else if (e || "0" === e) a = e;
                return a
            },
            setCaret: function (a) {
                if (b.is(":focus")) {
                    var e;
                    e = b.get(0);
                    e.setSelectionRange ? e.setSelectionRange(a, a) : e.createTextRange && (e = e.createTextRange(), e.collapse(!0), e.moveEnd("character", a), e.moveStart("character", a), e.select())
                }
            },
            events: function () {
                b.on("keydown.mask", function () {
                    x = c.val()
                });
                b.on("keyup.mask", c.behaviour);
                b.on("paste.mask drop.mask", function () {
                    setTimeout(function () {
                        b.keydown().keyup()
                    }, 100)
                });
                b.on("change.mask", function () {
                    b.data("changeCalled", !0)
                });
                b.on("blur.mask", function (a) {
                    a = g(a.target);
                    a.prop("defaultValue") !== a.val() && (a.prop("defaultValue", a.val()), a.data("changeCalled") || a.trigger("change"));
                    a.data("changeCalled", !1)
                });
                b.on("focusout.mask", function () {
                    d.clearIfNotMatch && !y.test(c.val()) && c.val("")
                })
            },
            getRegexMask: function () {
                var a = [],
                    e, b, c, d, k;
                for (k in f) (e = l.translation[f[k]]) ? (b = e.pattern.toString().replace(/.{1}$|^.{1}/g, ""), c = e.optional, (e = e.recursive) ? (a.push(f[k]), d = {
                    digit: f[k],
                    pattern: b
                }) : a.push(c || e ? b + "?" : b)) : a.push("\\" +
                    f[k]);
                a = a.join("");
                d && (a = a.replace(RegExp("(" + d.digit + "(.*" + d.digit + ")?)"), "($1)?").replace(RegExp(d.digit, "g"), d.pattern));
                return RegExp(a)
            },
            destroyEvents: function () {
                b.off("keydown.mask keyup.mask paste.mask drop.mask change.mask blur.mask focusout.mask").removeData("changeCalled")
            },
            val: function (a) {
                var e = b.is("input");
                return 0 < arguments.length ? e ? b.val(a) : b.text(a) : e ? b.val() : b.text()
            },
            getMaskCharactersBeforeCount: function (a, e) {
                for (var b = 0, c = 0, d = f.length; c < d && c < a; c++) l.translation[f.charAt(c)] || (a =
                    e ? a + 1 : a, b++);
                return b
            },
            determineCaretPos: function (a, b, d, h) {
                return l.translation[f.charAt(Math.min(a - 1, f.length - 1))] ? Math.min(a + d - b - h, d) : c.determineCaretPos(a + 1, b, d, h)
            },
            behaviour: function (a) {
                a = a || window.event;
                var b = a.keyCode || a.which;
                if (-1 === g.inArray(b, l.byPassKeys)) {
                    var d = c.getCaret(),
                        f = c.val(),
                        n = f.length,
                        k = d < n,
                        p = c.getMasked(),
                        m = p.length,
                        q = c.getMaskCharactersBeforeCount(m - 1) - c.getMaskCharactersBeforeCount(n - 1);
                    p !== f && c.val(p);
                    !k || 65 === b && a.ctrlKey || (8 !== b && 46 !== b && (d = c.determineCaretPos(d, n, m, q)),
                        c.setCaret(d));
                    return c.callbacks(a)
                }
            },
            getMasked: function (a) {
                var b = [],
                    g = c.val(),
                    h = 0,
                    n = f.length,
                    k = 0,
                    p = g.length,
                    m = 1,
                    q = "push",
                    s = -1,
                    r, u;
                d.reverse ? (q = "unshift", m = -1, r = 0, h = n - 1, k = p - 1, u = function () {
                    return -1 < h && -1 < k
                }) : (r = n - 1, u = function () {
                    return h < n && k < p
                });
                for (; u();) {
                    var v = f.charAt(h),
                        w = g.charAt(k),
                        t = l.translation[v];
                    if (t) w.match(t.pattern) ? (b[q](w), t.recursive && (-1 === s ? s = h : h === r && (h = s - m), r === s && (h -= m)), h += m) : t.optional && (h += m, k -= m), k += m;
                    else {
                        if (!a) b[q](v);
                        w === v && (k += m);
                        h += m
                    }
                }
                a = f.charAt(r);
                n !== p + 1 || l.translation[a] ||
                    b.push(a);
                return b.join("")
            },
            callbacks: function (a) {
                var e = c.val(),
                    g = c.val() !== x;
                if (!0 === g && "function" === typeof d.onChange) d.onChange(e, a, b, d);
                if (!0 === g && "function" === typeof d.onKeyPress) d.onKeyPress(e, a, b, d);
                if ("function" === typeof d.onComplete && e.length === f.length) d.onComplete(e, a, b, d)
            }
        };
        l.remove = function () {
            var a = c.getCaret(),
                b = c.getMaskCharactersBeforeCount(a);
            c.destroyEvents();
            c.val(l.getCleanVal()).removeAttr("maxlength");
            c.setCaret(a - b)
        };
        l.getCleanVal = function () {
            return c.getMasked(!0)
        };
        l.init()
    };
    g.fn.mask = function (b, f) {
        this.unmask();
        return this.each(function () {
            g(this).data("mask", new z(this, b, f))
        })
    };
    g.fn.unmask = function () {
        return this.each(function () {
            try {
                g(this).data("mask").remove()
            } catch (b) { }
        })
    };
    g.fn.cleanVal = function () {
        return g(this).data("mask").getCleanVal()
    };
    g("*[data-mask]").each(function () {
        var b = g(this),
            f = {};
        "true" === b.attr("data-mask-reverse") && (f.reverse = !0);
        "false" === b.attr("data-mask-maxlength") && (f.maxlength = !1);
        "true" === b.attr("data-mask-clearifnotmatch") && (f.clearIfNotMatch = !0);
        b.mask(b.attr("data-mask"), f)
    })
});

// ================================================== Sorting  ====================================================
// ================================================== Sorting  ====================================================
// ================================================== Sorting  ====================================================
// 
function Reverse(arr) {
    if (isArray(arr)) {
        arr = clone(arr);
        if (arr[0] === undefined) {
            arr.reverse()
            arr.pop()
            arr.unshift(undefined)
        } else {
            arr.reverse();
        }
        return arr
    }

    if (!isJSON(arr)) return arr;

    // build array of tag names
    var tags = []
    for (var key in arr) { tags.push(key) }
    tags.reverse();

    var newRec = {}
    for (var i = 0; i < tags.length; i++) {
        var key = tags[i];
        var obj = arr[key]
        newRec[key] = obj
    }
    return newRec
}

function numericalCompare(a, b) {
    a = CNum(a);
    b = CNum(b);
    if (a < b) return -1;
    if (a == b) return 0;
    return 1;
}

function rightCompare(a, b) {
    if (typeof a != 'string') a = CStr(a);
    if (typeof b != 'string') b = CStr(b);
    if (a == b) return 0;

    var tl = 0;
    if (a.length > b.length) tl = a.length; else tl = b.length;
    a = Space(tl - a.length) + a;
    b = Space(tl - b.length) + b;

    if (a < b) return -1;
    return 1;
}

function CompareI(a, b) {
    if (typeof a != 'string') a = CStr(a);
    if (typeof b != 'string') b = CStr(b);
    a = a.toLowerCase()
    b = b.toLowerCase()
    if (a == b) return 0
    //if (a.toLowerCase() == b.toLowerCase()) return 0;
    //if (a.toLowerCase() < b.toLowerCase()) return -1; else return 1;
    if (a < b) return -1; else return 1;
}

function rightCompareI(a, b) {
    return rightCompare(a.toLowerCase(), b.toLowerCase())
}

// for json arrays:
//    sortByTags: are comma seperated
//      -  you may prefix a tag name with # for numerical sort, ! for right sort, < for descending
//         example: sort(jsonarray, "!tag1,#<tag2")  * tag1 is right justified, tag2 is numeric descending
//
// for non json arrays:
//   sortByTags- "AL" - ascending left
//             - "AR" - ascending right
//             - "DL" - ascending left
//             - "DR" - ascending right
//             - "AN" - ascending numerical
//             - "DN" - ascending numerical
//
function Sort(arr, sortByTags) {
    var r = null;

    var sortOrder = LCase(sortByTags)
    var descendng = (InStr(sortOrder, "<") != -1) || (InStr(sortOrder, "d") != -1);

    if (InStr(sortOrder, "n") != -1) r = numericalCompare; else {
        if (InStr(sortOrder, "~") != -1 || InStr(sortOrder, "i") != -1) {
            if (InStr(sortOrder, "r") != -1 || InStr(sortOrder, "!") != -1) r = rightCompareI; else r = CompareI;
        } else {
            if (InStr(sortOrder, "r") != -1) r = rightCompare;
        }
    }

    if (isString(arr)) arr = Split(arr, am);

    if (isArray(arr)) {
        // Array of JSON?
        if (Len(arr) <= 1) return arr;

        var e1 = arr[1];
        if (!isJSON(e1)) {
            // ===================================================
            // Sort an array of non-json
            // ===================================================

            arr = clone(arr);
            if (arr[0] === undefined) arr.splice(0, 1);
            if (r) arr.sort(r); else arr.sort();
            if (descendng) arr = arr.reverse();
            arr.unshift(undefined);
            return arr;
        }

    } else {
        // ===================================================
        // Sort a single JSON record by Tag Names
        // ===================================================
        if (!isJSON(arr)) return arr;
        var tagList = []
        for (var key in arr) { tagList.push(key) }
        if (r) tagList.sort(r); else tagList.sort();
        if (descendng) tagList.reverse()

        var newRec = {}
        for (var i = 0; i < tagList.length; i++) {
            var key = tagList[i];
            var obj = arr[key]
            newRec[key] = obj
        }
        return newRec
    }

    // ===================================================
    // Sort an Array of JSON records by sortByTags
    // ===================================================
    if (!isArray(arr)) return arr;

    var lbound = 0;
    if (arr[0] === undefined) lbound = 1;

    // make sure the column names are the right case (uses 1st record)
    if (!isArray(sortByTags)) sortByTags = Split(sortByTags, ",")
    var o = arr[lbound]
    if (o) {
        for (var i = LBound(sortByTags); i < sortByTags.length; i++) {
            var tagName = sortByTags[i];
            var prefix = ""
            while (InStr("#!<>~", Left(tagName, 1)) != -1) {
                prefix += Left(tagName, 1)
                tagName = Mid(tagName, 1)
            }

            if (!o.hasOwnProperty(tagName)) {
                // loop on all tags, find a match
                tagName = LCase(tagName)
                for (var tag in o) {
                    if (LCase(tag) == tagName) {
                        sortByTags[i] = prefix + tag;
                        break;
                    }
                }
            }
        }
    }

    tagProperties = {}
    for (var i = LBound(sortByTags); i < sortByTags.length; i++) {
        var v = { "descending": false, "numerical": false, "right": false, "ignorecase": false }
        var tagName = sortByTags[i];

        var type = Left(tagName, 1);
        while (InStr(" <>#!~", type) > 0) {
            if (type == '<') { v.descending = true }
            if (type == '#') { v.numerical = true }
            if (type == '!') { v.right = true }
            if (type == '~') { v.ignorecase = true }
            tagName = Mid(tagName, 1)
            type = Left(tagName, 1);
        }

        tagProperties[tagName] = v
    }

    // QuickSort

    var beg = new Array(128);
    var end = new Array(128);

    beg[0] = lbound;
    end[0] = arr.length;
    var i = 0, j;

    // L & R are indexes in arr
    while (i >= 0) {
        var L = beg[i];
        var R = end[i] - 1;
        if (L < R) {
            var piv = arr[L];
            while (L < R) {
                while (quickSortCmp(arr[R], piv, tagProperties, false) && L < R) --R;
                if (L < R) arr[L++] = arr[R];
                while (quickSortCmp(arr[L], piv, tagProperties, true) && L < R) ++L;
                if (L < R) arr[R--] = arr[L];
            }
            arr[L] = piv;
            beg[(j = i + 1)] = (L + 1);
            end[j] = end[i];
            end[i++] = L;
        } else {
            --i;
        }
    }

    return arr
}

function quickSortCmp(a, b, tagProperties, reverse) {
    for (var tag in tagProperties) {
        tp = tagProperties[tag]

        av = a[tag]
        if (!av) av = null;
        bv = b[tag];
        if (!bv) bv = null;

        if (tp.numerical) {
            av = CNum(av);
            bv = CNum(bv);

        } else if (isNaN(av) || isNaN(bv)) {
            if (typeof av != 'string') av = CStr(av);
            if (typeof bv != 'string') bv = CStr(bv);

            if (tp.ignorecase) {
                av = av.toLowerCase();
                bv = bv.toLowerCase();
            }
        }

        if (tp.right) {
            var tl;
            if (a.length > b.length) tl = a.length; else tl = b.length;
            av = Space(tl - av.length) + av;
            bv = Space(tl - bv.length) + bv;
        }

        var dir = reverse;
        if (tp.descending) dir = !dir;

        if (dir) {
            if (av < bv) return true;
            if (av > bv) return false;
        } else {
            if (av > bv) return true;
            if (av < bv) return false;
        }
    }
    return true
}



/*
    json2.js
    2015-05-03
    Public Domain.
    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    See http://www.JSON.org/js.html
    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html
    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
    This file creates a global JSON object containing two methods: stringify
    and parse. This file is provides the ES5 JSON capability to ES3 systems.
    If a project might run on IE8 or earlier, then this file should be included.
    This file does nothing on ES5 systems.
        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.
            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.
            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.
            This method produces a JSON text from a JavaScript value.
            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value
            For example, this would serialize Dates as ISO strings.
                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 
                            ? '0' + n 
                            : n;
                    }
                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };
            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.
            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.
            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.
            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.
            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.
            Example:
            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'
            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'
            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date 
                    ? 'Date(' + this[key] + ')' 
                    : value;
            });
            // text is '["Date(---current time---)"]'
        $.parseJSON(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.
            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.
            Example:
            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.
            myData = $.parseJSON(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });
            myData = $.parseJSON('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });
    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint 
    eval, for, this 
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    var rx_one = /^[\],:{}\s]*$/,
        rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        rx_four = /(?:^|:|,)(?:\s*\[)+/g,
        rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10
            ? '0' + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate()) + 'T' +
                f(this.getUTCHours()) + ':' +
                f(this.getUTCMinutes()) + ':' +
                f(this.getUTCSeconds()) + 'Z'
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap,
        indent,
        meta,
        rep;


    function quote(string) {

        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? '"' + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"'
            : '"' + string + '"';
    }


    function str(key, holder) {

        // Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

                // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value)
                    ? String(value)
                    : 'null';

            case 'boolean':
            case 'null':

                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

            // If the type is 'object', we might be dealing with an object or an array or
            // null.

            case 'object':

                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.

                if (!value) {
                    return 'null';
                }

                // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

                // Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.

                    v = partial.length === 0
                        ? '[]'
                        : gap
                            ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                            : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                    gap
                                        ? ': '
                                        : ':'
                                ) + v);
                            }
                        }
                    }
                } else {

                    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                    gap
                                        ? ': '
                                        : ':'
                                ) + v);
                            }
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.

                v = partial.length === 0
                    ? '{}'
                    : gap
                        ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                        : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

    // If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

                // If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            // Make a fake root object containing our value under the key of ''.
            // Return the result of stringifying the value.

            return str('', { '': value });
        };
    }


    // If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with '()' and 'new'
            // because they can cause invocation, and '=' because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
            // replace all simple value tokens with ']' characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or ']' or
            // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, '@')
                        .replace(rx_three, ']')
                        .replace(rx_four, '')
                )
            ) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({ '': j }, '')
                    : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

var fingerprint = (function (window, screen, navigator) {

    // https://github.com/darkskyapp/string-hash
    function checksum(str) {
        var hash = 5381;
        var i = str.length;

        while (i--) hash = (hash * 33) ^ str.charCodeAt(i);

        return hash >>> 0;
    }

    // http://stackoverflow.com/a/4167870/1250044
    function map(arr, fn) {
        var i = 0, len = arr.length, ret = [];
        while (i < len) {
            ret[i] = fn(arr[i++]);
        }
        return ret;
    }

    return checksum([
        navigator.userAgent,
        [screen.height, screen.width, screen.colorDepth].join('x'),
        new Date().getTimezoneOffset(),
        !!window.sessionStorage,
        !!window.localStorage,
        map(navigator.plugins, function (plugin) {
            return [
                plugin.name,
                plugin.description,
                map(plugin, function (mime) {
                    return [mime.type, mime.suffixes].join('~');
                }).join(',')
            ].join("::");
        }).join(';')
    ].join('###'));

}(this, screen, navigator));

function get_browser_info() {
    var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return { name: 'IE', version: (tem[1] || '') };
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR\/(\d+)/)
        if (tem != null) { return { name: 'Opera', version: tem[1] }; }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
    return {
        name: M[0],
        version: M[1]
    };
}

/*!
* IE10 viewport hack for Surface/desktop Windows 8 bug
* Copyright 2014-2015 Twitter, Inc.
* Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
*/

// See the Getting Started docs for more information:
// http://getbootstrap.com/getting-started/#support-ie10-width

(function () {
    'use strict';

    if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
        var msViewportStyle = document.createElement('style')
        msViewportStyle.appendChild(
            document.createTextNode(
                '@-ms-viewport{width:auto!important}'
            )
        )
        document.querySelector('head').appendChild(msViewportStyle)
    }

})();


/*!
 * jQuery UI Touch Punch 0.2.3 - Simulate a mouse event based on a corresponding touch event
 *
 * Copyright 2011?2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
*/

(function ($) {

    // Detect touch support
    $.support.touch = 'ontouchend' in document;

    // Ignore browsers without touch support
    if (!$.support.touch) {
        return;
    }

    var mouseProto = $.ui.mouse.prototype,
        _mouseInit = mouseProto._mouseInit,
        _mouseDestroy = mouseProto._mouseDestroy,
        touchHandled;

    //
    //Simulate a mouse event based on a corresponding touch event
    // @param {Object} event A touch event
    // @param {String} simulatedType The corresponding mouse event
    //
    function simulateMouseEvent(event, simulatedType) {

        // Ignore multi-touch events
        if (event.originalEvent.touches.length > 1) {
            return;
        }

        preventTheDefault(event);

        var touch = event.originalEvent.changedTouches[0],
            simulatedEvent = document.createEvent('MouseEvents');

        // Initialize the simulated mouse event using the touch event's coordinates
        simulatedEvent.initMouseEvent(
            simulatedType,    // type
            true,             // bubbles                    
            true,             // cancelable                 
            window,           // view                       
            1,                // detail                     
            touch.screenX,    // screenX                    
            touch.screenY,    // screenY                    
            touch.clientX,    // clientX                    
            touch.clientY,    // clientY                    
            false,            // ctrlKey                    
            false,            // altKey                     
            false,            // shiftKey                   
            false,            // metaKey                    
            0,                // button                     
            null              // relatedTarget              
        );

        // Dispatch the simulated event to the target element
        event.target.dispatchEvent(simulatedEvent);
    }

    //
    // Handle the jQuery UI widget's touchstart events
    // @param {Object} event The widget element's touchstart event
    //
    mouseProto._touchStart = function (event) {

        var self = this;

        // Ignore the event if another widget is already being handled
        if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
            return;
        }

        // Get real target, don't translate to mouse for certain things
        var targ = document.elementFromPoint(event.originalEvent.touches[0].pageX, event.originalEvent.touches[0].pageY);
        if (targ) {
            var nn = UCase(targ.nodeName);
            if (nn == 'INPUT' || nn == 'TEXTAREA' || nn == 'BUTTON' || nn == 'LABEL' || nn == 'A') return;
        }


        // if this is an anchor or a image then ignore

        // Set the flag to prevent other widgets from inheriting the touch event
        touchHandled = true;

        // Track movement to determine if interaction was a click
        self._touchMoved = false;

        // Simulate the mouseover event
        simulateMouseEvent(event, 'mouseover');

        // Simulate the mousemove event
        simulateMouseEvent(event, 'mousemove');

        // Simulate the mousedown event
        simulateMouseEvent(event, 'mousedown');
    };

    //
    // Handle the jQuery UI widget's touchmove events
    // @param {Object} event The document's touchmove event
    // 
    mouseProto._touchMove = function (event) {

        // Ignore event if not handled
        if (!touchHandled) {
            return;
        }

        // Interaction was not a click
        this._touchMoved = true;

        // Simulate the mousemove event
        simulateMouseEvent(event, 'mousemove');
    };

    //
    // Handle the jQuery UI widget's touchend events
    // @param {Object} event The document's touchend event
    //
    mouseProto._touchEnd = function (event) {

        // Ignore event if not handled
        if (!touchHandled) {
            return;
        }

        // Simulate the mouseup event
        simulateMouseEvent(event, 'mouseup');

        // Simulate the mouseout event
        simulateMouseEvent(event, 'mouseout');

        // If the touch interaction did not move, it should trigger a click
        if (!this._touchMoved) {

            // Simulate the click event
            simulateMouseEvent(event, 'click');
        }

        // Unset the flag to allow other widgets to inherit the touch event
        touchHandled = false;
    };

    //
    // A duck punch of the $.ui.mouse _mouseInit method to support touch events.
    // This method extends the widget with bound touch event handlers that
    // translate touch events to mouse events and pass them to the widget's
    // original mouse event handling methods.
    //
    mouseProto._mouseInit = function () {

        var self = this;

        // Delegate the touch handlers to the widget's element
        self.element.bind({
            touchstart: $.proxy(self, '_touchStart'),
            touchmove: $.proxy(self, '_touchMove'),
            touchend: $.proxy(self, '_touchEnd')
        });

        // Call the original $.ui.mouse init method
        _mouseInit.call(self);
    };


    /// Remove the touch event handlers
    mouseProto._mouseDestroy = function () {

        var self = this;

        // Delegate the touch handlers to the widget's element
        self.element.unbind({
            touchstart: $.proxy(self, '_touchStart'),
            touchmove: $.proxy(self, '_touchMove'),
            touchend: $.proxy(self, '_touchEnd')
        });

        // Call the original $.ui.mouse destroy method
        _mouseDestroy.call(self);
    };

})(jQuery);

// Clearable
function togx(v) { return v ? 'addClass' : 'removeClass'; }
$(document).on('mousemove', '.clearable', function (e) {
    $(this)[togx(this.offsetWidth - 28 < e.clientX - this.getBoundingClientRect().left)]('onX');
}).on('touchstart click', '.onX', function (ev) {
    preventTheDefault(ev);
    $(this).removeClass('onX').val('').change();
});

/*  */

// ================================================== bootstrap-combobox  ====================================================
// ================================================== bootstrap-combobox  ====================================================
// ================================================== bootstrap-combobox  ====================================================

/* =============================================================
 * bootstrap-combobox.js v1.1.7
 * =============================================================
 * Copyright 2012 Daniel Farrell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */

!function ($) {

    "use strict";

    /* COMBOBOX PUBLIC CLASS DEFINITION
     * ================================ */

    var Combobox = function (element, options) {
        this.options = $.extend({}, $.fn.combobox.defaults, options);
        this.template = this.options.template || this.template
        this.$source = $(element);
        this.$container = this.setup();
        this.$element = this.$container.find('input[type=text]');
        this.$target = this.$container.find('input[type=hidden]');
        this.$button = this.$container.find('.dropdown-toggle');
        this.$menu = $(this.options.menu).appendTo('body');
        this.matcher = this.options.matcher || this.matcher;
        this.sorter = this.options.sorter || this.sorter;
        this.highlighter = this.options.highlighter || this.highlighter;
        this.shown = false;
        this.selected = false;
        this.refresh();
        this.transferAttributes();
        this.listen();
    };

    Combobox.prototype = {

        constructor: Combobox

        , setup: function () {
            var combobox = $(this.template());
            this.$source.before(combobox);
            this.$source.hide();
            return combobox;
        }

        , disable: function () {
            this.$element.prop('disabled', true);
            this.$button.attr('disabled', true);
            this.disabled = true;
            this.$container.addClass('combobox-disabled');
        }

        , enable: function () {
            this.$element.prop('disabled', false);
            this.$button.attr('disabled', false);
            this.disabled = false;
            this.$container.removeClass('combobox-disabled');
        }
        , parse: function () {
            var that = this
                , map = {}
                , source = []
                , selected = false
                , selectedValue = '';
            this.$source.find('option').each(function () {
                var option = $(this);
                if (option.val() === '') {
                    that.options.placeholder = option.text();
                    return;
                }
                map[option.text()] = option.val();
                source.push(option.text());
                if (option.prop('selected')) {
                    selected = option.text();
                    selectedValue = option.val();
                }
            })
            this.map = map;
            if (selected) {
                this.$element.val(selected);
                this.$target.val(selectedValue);
                this.$container.addClass('combobox-selected');
                this.selected = true;
            }
            return source;
        }

        , transferAttributes: function () {
            this.options.placeholder = this.$source.attr('data-placeholder') || this.options.placeholder
            if (this.options.appendId !== "undefined") {
                this.$element.attr('id', this.$source.attr('id') + this.options.appendId);
            }
            this.$element.attr('placeholder', this.options.placeholder)
            this.$target.prop('name', this.$source.prop('name'))
            this.$target.val(this.$source.val())
            this.$source.removeAttr('name')  // Remove from source otherwise form will pass parameter twice.
            this.$element.attr('required', this.$source.attr('required'))
            this.$element.attr('rel', this.$source.attr('rel'))
            this.$element.attr('title', this.$source.attr('title'))
            this.$element.attr('class', this.$source.attr('class'))
            this.$element.attr('tabindex', this.$source.attr('tabindex'))
            this.$source.removeAttr('tabindex')
            if (this.$source.attr('disabled') !== undefined)
                this.disable();
        }

        , select: function () {
            var val = this.$menu.find('.active').attr('data-value');
            this.$element.val(this.updater(val)).trigger('change');
            this.$target.val(this.map[val]).trigger('change');
            this.$source.val(this.map[val]).trigger('change');
            this.$container.addClass('combobox-selected');
            this.selected = true;
            return this.hide();
        }

        , updater: function (item) {
            return item;
        }

        , show: function () {
            var pos = $.extend({}, this.$element.position(), {
                height: this.$element[0].offsetHeight
            });

            this.$menu
                .insertAfter(this.$element)
                .css({
                    top: pos.top + pos.height
                    , left: pos.left
                })
                .show();

            $('.dropdown-menu').on('mousedown', $.proxy(this.scrollSafety, this));

            this.shown = true;
            return this;
        }

        , hide: function () {
            this.$menu.hide();
            $('.dropdown-menu').off('mousedown', $.proxy(this.scrollSafety, this));
            this.$element.on('blur', $.proxy(this.blur, this));
            this.shown = false;
            return this;
        }

        , lookup: function (event) {
            this.query = this.$element.val();
            return this.process(this.source);
        }

        , process: function (items) {
            var that = this;

            items = $.grep(items, function (item) {
                return that.matcher(item);
            })

            items = this.sorter(items);

            if (!items.length) {
                return this.shown ? this.hide() : this;
            }

            return this.render(items.slice(0, this.options.items)).show();
        }

        , template: function () {
            if (this.options.bsVersion == '2') {
                return '<div class="combobox-container"><input type="hidden" /> <div class="input-append"> <input type="text" autocomplete="false" /> <span class="add-on dropdown-toggle" data-dropdown="dropdown"> <span class="caret"/> <i class="icon-remove"/> </span> </div> </div>'
            } else {
                return '<div class="combobox-container"> <input type="hidden" /> <div class="input-group"> <input type="text" autocomplete="false" /> <span class="input-group-addon dropdown-toggle" data-dropdown="dropdown"> <span class="caret" /> <span class="glyphicon glyphicon-remove" /> </span> </div> </div>'
            }
        }

        , matcher: function (item) {
            return ~item.toLowerCase().indexOf(this.query.toLowerCase());
        }

        , sorter: function (items) {
            var beginswith = []
                , caseSensitive = []
                , caseInsensitive = []
                , item;

            while (item = items.shift()) {
                if (!item.toLowerCase().indexOf(this.query.toLowerCase())) { beginswith.push(item); }
                else if (~item.indexOf(this.query)) { caseSensitive.push(item); }
                else { caseInsensitive.push(item); }
            }

            return beginswith.concat(caseSensitive, caseInsensitive);
        }

        , highlighter: function (item) {
            var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
            return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                return '<strong>' + match + '</strong>';
            })
        }

        , render: function (items) {
            var that = this;

            items = $(items).map(function (i, item) {
                i = $(that.options.item).attr('data-value', item);
                i.find('a').html(that.highlighter(item));
                return i[0];
            })

            items.first().addClass('active');
            this.$menu.html(items);
            return this;
        }

        , next: function (event) {
            var active = this.$menu.find('.active').removeClass('active')
                , next = active.next();

            if (!next.length) {
                next = $(this.$menu.find('li')[0]);
            }

            next.addClass('active');
        }

        , prev: function (event) {
            var active = this.$menu.find('.active').removeClass('active')
                , prev = active.prev();

            if (!prev.length) {
                prev = this.$menu.find('li').last();
            }

            prev.addClass('active');
        }

        , toggle: function () {
            if (!this.disabled) {
                if (this.$container.hasClass('combobox-selected')) {
                    this.clearTarget();
                    this.triggerChange();
                    this.clearElement();
                } else {
                    if (this.shown) {
                        this.hide();
                    } else {
                        this.clearElement();
                        this.lookup();
                    }
                }
            }
        }

        , scrollSafety: function (e) {
            if (e.target.tagName == 'UL') {
                this.$element.off('blur');
            }
        }
        , clearElement: function () {
            this.$element.val('').focus();
        }

        , clearTarget: function () {
            this.$source.val('');
            this.$target.val('');
            this.$container.removeClass('combobox-selected');
            this.selected = false;
        }

        , triggerChange: function () {
            this.$source.trigger('change');
        }

        , refresh: function () {
            this.source = this.parse();
            this.options.items = this.source.length;
        }

        , listen: function () {
            this.$element
                .on('focus', $.proxy(this.focus, this))
                .on('blur', $.proxy(this.blur, this))
                .on('keypress', $.proxy(this.keypress, this))
                .on('keyup', $.proxy(this.keyup, this));

            if (this.eventSupported('keydown')) {
                this.$element.on('keydown', $.proxy(this.keydown, this));
            }

            this.$menu
                .on('click', $.proxy(this.click, this))
                .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
                .on('mouseleave', 'li', $.proxy(this.mouseleave, this));

            this.$button
                .on('click', $.proxy(this.toggle, this));
        }

        , eventSupported: function (eventName) {
            var isSupported = eventName in this.$element;
            if (!isSupported) {
                this.$element.setAttribute(eventName, 'return;');
                isSupported = typeof this.$element[eventName] === 'function';
            }
            return isSupported;
        }

        , move: function (e) {
            if (!this.shown) { return; }

            switch (e.keyCode) {
                case 9: // tab
                case 13: // enter
                case 27: // escape
                    preventTheDefault(e);
                    break;

                case 38: // up arrow
                    preventTheDefault(e);
                    this.prev();
                    this.fixMenuScroll();
                    break;

                case 40: // down arrow
                    preventTheDefault(e);
                    this.next();
                    this.fixMenuScroll();
                    break;
            }

            e.stopPropagation();
        }

        , fixMenuScroll: function () {
            var active = this.$menu.find('.active');
            if (active.length) {
                var top = active.position().top;
                var bottom = top + active.height();
                var scrollTop = this.$menu.scrollTop();
                var menuHeight = this.$menu.height();
                if (bottom > menuHeight) {
                    this.$menu.scrollTop(scrollTop + bottom - menuHeight);
                } else if (top < 0) {
                    this.$menu.scrollTop(scrollTop + top);
                }
            }
        }

        , keydown: function (e) {
            this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40, 38, 9, 13, 27]);
            this.move(e);
        }

        , keypress: function (e) {
            if (this.suppressKeyPressRepeat) { return; }
            this.move(e);
        }

        , keyup: function (e) {
            switch (e.keyCode) {
                case 40: // down arrow
                    if (!this.shown) {
                        this.toggle();
                    }
                    break;
                case 39: // right arrow
                case 38: // up arrow
                case 37: // left arrow
                case 36: // home
                case 35: // end
                case 16: // shift
                case 17: // ctrl
                case 18: // alt
                    break;

                case 9: // tab
                case 13: // enter
                    if (!this.shown) { return; }
                    this.select();
                    break;

                case 27: // escape
                    if (!this.shown) { return; }
                    this.hide();
                    break;

                default:
                    this.clearTarget();
                    this.lookup();
            }

            e.stopPropagation();
            preventTheDefault(e);
        }

        , focus: function (e) {
            this.focused = true;
        }

        , blur: function (e) {
            var that = this;
            this.focused = false;
            var val = this.$element.val();
            if (!this.selected && val !== '') {
                this.$element.val('');
                this.$source.val('').trigger('change');
                this.$target.val('').trigger('change');
            }
            if (!this.mousedover && this.shown) { setTimeout(function () { that.hide(); }, 200); }
        }

        , click: function (e) {
            e.stopPropagation();
            preventTheDefault(e);
            this.select();
            this.$element.focus();
        }

        , mouseenter: function (e) {
            this.mousedover = true;
            this.$menu.find('.active').removeClass('active');
            $(e.currentTarget).addClass('active');
        }

        , mouseleave: function (e) {
            this.mousedover = false;
        }
    };

    /* COMBOBOX PLUGIN DEFINITION
     * =========================== */
    $.fn.combobox = function (option) {
        return this.each(function () {
            var $this = $(this)
                , data = $this.data('combobox')
                , options = typeof option == 'object' && option;
            if (!data) { $this.data('combobox', (data = new Combobox(this, options))); }
            if (typeof option == 'string') { data[option](); }
        });
    };

    $.fn.combobox.defaults = {
        bsVersion: '3'
        , menu: '<ul class="typeahead typeahead-long dropdown-menu"></ul>'
        , item: '<li><a href="#"></a></li>'
    };

    $.fn.combobox.Constructor = Combobox;

}(window.jQuery);

// ================================================== bootstrap-combobox  ====================================================
// ================================================== bootstrap-combobox  ====================================================
// ================================================== bootstrap-combobox  ====================================================

function koUrlComboBoxLoad($element, $data, $index, addBlank, arrayOfValues, multiSelect, restrictToList) {
    var defaultVal = $($element).val()
    return comboBoxLoad($element, arrayOfValues, defaultVal, addBlank, null, null, null, multiSelect, restrictToList)

    $(inputCtl).combobox(); // jquery autocomplete
}

function koComboBoxLoad($element, $data, $index, addBlank, valueField, descriptionField, multiValuedData, multiSelect, restrictToList) {
    var arrayOfValues;
    var myOpts = $($element).attr("myOpts") + "";

    if (myOpts.startsWith("[") && myOpts.endsWith(']')) arrayOfValues = eval(myOpts); else
        if (myOpts.startsWith("{") && myOpts.endsWith('}')) arrayOfValues = $.parseJSON(myOpts); else
            arrayOfValues = Split(myOpts, Chr(254))

    var defaultVal = $($element).val()
    return comboBoxLoad($element, arrayOfValues, defaultVal, addBlank, valueField, descriptionField, restrictToList)
}

// This current load procedure uses the magicSelect code: See http://nicolasbize.com/magicsuggest/doc.html
// This routine should only be called only once

function comboBoxLoad(inputCtl, arrayOfValues, defaultVal, addBlank, ValueField, DescriptionField, multiValuedData, multiSelect, restrictToList) {
    if (!multiSelect) multiSelect = 1;
    var ID = $(inputCtl).attr('id');
    if (!ID) ID = newGUID();

    if (multiSelect <= 1) {
        // Use HTML datalist
        var datalist = $('<datalist id="' + ID + '_list"></datalist>').insertAfter(inputCtl);
        $(inputCtl).removeClass("magicSelect");
        $(inputCtl).attr("list", ID + "_list");
        loadOptions(datalist, arrayOfValues, ValueField, DescriptionField, addBlank, defaultVal, '', restrictToList)
        return;
    }

    // inputCtl points to the input element
    var msdiv = $('<div id="ms_' + ID + '"></div>').insertAfter(inputCtl);
    var originalStyle = $(inputCtl).attr('style');
    var originalPlaceHolder = $(inputCtl).attr('placeholder')
    var originalOnFocus = $(inputCtl).attr('onfocus');
    var originalRequired = $(inputCtl).prop('required');

    // convert to magic suggest
    var ms = $(msdiv).magicSuggest({
        maxSelection: multiSelect,
        useCommaKey: false
    });

    // when ever magic select changes, put the result into the inputbox
    $(ms).on('selectionchange', function (e, m) {
        $(inputCtl).val(formVar(this.container)).change();  // Capture user change
    });

    $(inputCtl).hide()

    // Create the control
    loadOptions(ms.container, arrayOfValues, ValueField, DescriptionField, addBlank, defaultVal, '', restrictToList) // Determine subDel ?? from multiValuedData

    // Copy placeholder and style from inputCtl to magicSelect's
    var msInput = $($(ms)[0].container[0]).find('input')
    $(msInput).attr('placeholder', originalPlaceHolder);

    if (originalStyle) {
        var parts = originalStyle.split(";")
        for (var i = 0; i < parts.length; i++) {
            var subParts = parts[i].split(':');
            $(msInput).css(subParts[0], subParts[1])
        }
    }

    if (originalRequired) $(ms.container).addClass("required", true)
    if (originalOnFocus) $(msInput).attr("onfocus", originalOnFocus)
}


function urlDropDownLoad(ctl, addBlank, arrayOfValues, defaultVal) {
    $(ctl).empty();

    if (!arrayOfValues) {
        var myOpts = $(ctl).attr("myOpts") + "";

        if (myOpts.startsWith("[") && myOpts.endsWith(']')) arrayOfValues = $.parseJSON(myOpts); else
            arrayOfValues = Split(myOpts, Chr(254))

        defaultVal = $(ctl).val()
    }

    $.each(arrayOfValues, function (i, value) {
        var newOp = $('<option>').text(value).attr('value', value);
        $(ctl).append(newOp);
    });

    if (addBlank || Len(defaultVal) == 0) {
        if ($(ctl).find('option:textEquals("")').length == 0) {
            $(ctl).prepend("<option></option>");
        }
    }

    var D = Change(defaultVal, "'", "\\'")

    if ($(ctl).find('option:textEquals("' + D + '")').length == 0) {
        $(ctl).prepend("<option selected='selected'>" + htmlEscape(defaultVal) + "</option>");
    } else {
        $(ctl).find('option:textEquals("' + D + '")').prop('selected', true);
    }
}

function sliderAdjustPips(sliderCtl) {
    var currentStep = $(sliderCtl).data().pipsOptions.step;

    var OptArray = $(sliderCtl).data().pipsOptions.labels;
    var firstVal = $(sliderCtl).slider("value")

    var steps = 0;
    do {
        steps += 1;

        $(sliderCtl).slider({
            min: 0,
            max: Len(OptArray) - 1,
            value: firstVal

        }).slider("pips", {
            first: "label",
            last: "label",
            rest: "label",
            step: steps,
            labels: OptArray
        });

        var pips = $(sliderCtl).find(".ui-slider-label")
        if ($(pips).length > 2) {
            var last = $(pips).length - 1;
            for (var i = 0; i < last; i++) {
                tooMany = $(pips[i]).offset().left + $(pips[i])[0].scrollWidth >= $(pips[i + 1]).offset().left
                if (tooMany) break;
            }
        } else {
            tooMany = false
        }
    } while (tooMany);
}

function sliderLabeled_onLoad(inputCtl, initialVal, OptArray, readOnly, valArray) {
    var isKnockOut = false;

    if (!OptArray) {
        var myOpts = $(inputCtl).attr("myOpts") + "";

        if (myOpts.startsWith("[") && myOpts.endsWith(']')) OptArray = eval(myOpts); else
            if (myOpts.startsWith("{") && myOpts.endsWith('}')) OptArray = $.parseJSON(myOpts); else
                OptArray = Split(myOpts, Chr(254))

        valArray = $(inputCtl).attr("myVals")
        if (valArray && valArray != '[]') valArray = eval(valArray); else valArray = null;
        initialVal = $(inputCtl).val()
        isKnockOut = true;
    }

    var initialIndex = 0
    if (initialVal) {
        if (Len(valArray)) initialIndex = locateInArray(initialVal, valArray); else initialIndex = locateInArray(initialVal, OptArray, true);
        if (initialIndex == -1) initialIndex = 0;
    }

    sliderCtl = $(inputCtl).prev()

    $(sliderCtl).slider({
        min: 0,
        max: Len(OptArray) - 1,
        value: initialIndex

    }).slider("pips", {
        first: "label",
        last: "label",
        rest: "label",
        step: 1,
        labels: OptArray,
        valArray: valArray
    });

    $(sliderCtl).data('valArray', valArray)

    sliderAdjustPips(sliderCtl);

    $(sliderCtl).slider({
        slide: function (event, ui) {
            var sliderCtl = $(this);
            var myInput = $(sliderCtl).next()
            var handle = $(sliderCtl).find(".ui-slider-handle")
            var OptArray = $(sliderCtl).data().pipsOptions.labels;
            var valArray = $(this).data('valArray')
            var val;

            handle.text(OptArray[ui.value]);

            if (Len(valArray)) val = valArray[ui.value]; else val = OptArray[ui.value]
            $(myInput).get(0).value = val;
        },

        change: function (event, ui) {
            if (!ui.value) return;

            var sliderCtl = $(this);
            var myInput = $(sliderCtl).next()
            var handle = $(sliderCtl).find(".ui-slider-handle")
            var OptArray = $(sliderCtl).data().pipsOptions.labels;
            var valArray = $(this).data('valArray')
            var val;

            handle.text(OptArray[ui.value]);

            if (Len(valArray)) val = valArray[ui.value]; else val = OptArray[ui.value]

            $(myInput).val(val).trigger("change");

            parsleyReset(myInput);
        }
    });

    if (readOnly) $(sliderCtl).slider('disable');
    var handle = $(sliderCtl).find(".ui-slider-handle")
    $(inputCtl).hide()

    if (Len(initialIndex)) {
        handle.text(OptArray[initialIndex]);
        var val;
        if (Len(valArray)) val = valArray[initialIndex]; else val = OptArray[initialIndex]
        $(inputCtl).val(val);
    }
}

$(window).on('resize', function () {
    $('.ui-slider').each(function () {
        sliderAdjustPips(this)
    })
})

function nouiSlider_onLoad(sliderCtl, OptArray, initialIndex) {

}

function fieldSetBtn_Change(radioCtl) {
    if (!radioCtl || radioCtl.type != "radio") return;
    if (!radioCtl.checked) return;
    $(radioCtl).closest(".fieldSetBtnsDiv").find("label").removeClass("checked");
    $(radioCtl).closest(".fieldSetBtnLbl").addClass("checked");
    parsleyReset(radioCtl);
}

function msfieldSetBtn_Change(checkboxCtl) {
    if (!checkboxCtl || checkboxCtl.type != "checkbox") return;
    var myCheckBox = $(checkboxCtl).closest(".fieldSetBtnLbl")
    if ($(myCheckBox).hasClass("checked")) $(myCheckBox).removeClass("checked"); else $(myCheckBox).addClass('checked')
    parsleyReset(checkboxCtl);
}

function nouiSlider_Change(sliderCtl) {
    if (!sliderCtl || sliderCtl.type != "radio" || !sliderCtl.checked) return;
    $(sliderCtl).closest(".fieldSetBtnsDiv").find("label").removeClass("checked");
    $(sliderCtl).closest(".fieldSetBtnLbl").addClass("checked");
    parsleyReset(sliderCtl);
}

function isHidden(ctl) {
    return $(ctl).css("visibility") == "hidden" || $("ctl").css("display") == "none"
}

function evalFormGroupRows() {
    $(".form-group + .row").each(function () {
        // check each element
        var allHidden = true;

        $(this).find("input,select,textarea").each(function () { if (!isHidden(this)) allHidden = false })

        if (allHidden) $(this).hide(); else $(this).show()
        // $(this).css('border-color', allHidden ? 'red' : 'green').css('border-width', '1px').css('border-style', 'solid')
    })
}

function cssRequiredness(ctlName, passFailed, parent_element, parentValue, extraParameter) {
    if (!ctlName) return;
    var ctl = $("#" + ctlName)

    if ($(ctl).is('div')) {
        if (passFailed) $(ctl).find('input,select,textarea').attr('required', 'required'); else $(ctl).find('input,select,textarea').removeAttr('required')

    } else {
        if (passFailed) $(ctl).attr('required', 'required'); else $(ctl).removeAttr('required');
    }
}

function cssVisibility(ctlName, isVisible, parent_element, parentValue, extraParameter) {
    if (!ctlName) return;
    var ctl = $("#" + ctlName);

    if ($(ctl).is('div')) {
        if (isVisible) $(ctl).find('input,select,textarea').removeAttr('data-parsley-excluded'); else $(ctl).find('input,select,textarea').attr('data-parsley-excluded', 'data-parsley-excluded')

    }

    if (isVisible) {
        $(ctl).css("visibility", "visible")
        $("#LBL_" + ctlName).css("visibility", "visible")
        $("#slider_" + ctlName).css("visibility", "visible")
        if (extraParameter) $(ctl).attr('required', 'required');
        $(ctl).removeAttr('data-parsley-excluded');
    } else {
        $(ctl).css("visibility", "hidden")
        $("#LBL_" + ctlName).css("visibility", "hidden")
        $("#slider_" + ctlName).css("visibility", "hidden")
        $(ctl).removeAttr('required');
        parsleyReset(ctl);
        $(ctl).attr('data-parsley-excluded', true);
    }

    evalFormGroupRows()
}

function cssLabel(ctlName, passFailed, parent_element, parentValue, extraParameter) {
    if (!ctlName || !passFailed) return;
    $("#LBL_" + ctlName).text(extraParameter)
}


function parsleyDestroy() {
    if ($('form').parsley && $('form').parsley().destroy) $('form').parsley().destroy()
}

function parsleyIsValid(alertUser) {
    $(".parsley-error").removeClass("parsley-error")
    if (!$('form').parsley) return true;
    if (!$('form').parsley()) return true;
    if (!$('form').parsley().validate) return true;

    if ($('form').parsley({ focus: 'none', excluded: "input[visibility=hidden], [data-parsley-excluded]" }).validate()) return true;
    $("label.parsley-error").parent("div").parent("fieldset").addClass("parsley-error")

    if ($('*.parsley-error').length && alertUser) {
        MsgBox("Valadation", "Your form contains errors", "", 0, 0, function () {

            var firstField = $('*.parsley-error').first();
            if ($(firstField).length) {
                $(firstField).focus()
                $(firstField).scrollIntoView()
            }
        });
    }

    return false;
}

function attachToElementChange(elementID, func, extraParameter, isKnockout) {
    var jq_element = $('#' + elementID + (isKnockout ? '_0' : ''))
    if (!$(jq_element).length) return setTimeout(function () { attachToElementChange(elementID, func, extraParameter, isKnockout) }, 100);
    if (isKnockout) {
        var i = 0;
        for (i = 0; true; i++) {
            jq_element = $('#' + elementID + '_' + CStr(i));
            if ($(jq_element).length == 0) return;
            attachToElementChange(elementID + '_' + CStr(i), func, extraParameter);
        }
        return
    }

    if ($(jq_element).hasClass('magicSelect')) jq_element = $('#ms_' + $(jq_element).attr('id'))
    if ($(jq_element).hasClass('ms-ctn')) {
        ms = jq_element.magicSuggest()

        $(ms).on('selectionchange', function () {
            var msData = ms.getSelection();
            if (msData.length) msData = msData[0].name; else msData = null;
            func(jq_element, msData, extraParameter)
        })

    } else {
        $(jq_element).on('autocompletechange', function (e, u) { func(jq_element, $(this).val(), extraParameter) });
        $(jq_element).on('autocompleteselect', function (e, u) { func(jq_element, u.item.value, extraParameter) });
        $(jq_element).on('change', function (e, u) { func(jq_element, $(this).val(), extraParameter) });
    }

    // Force one change now
    func(jq_element, formVar(elementID, true), extraParameter)
}

function cascadingUrlDropDownLoad(ctl, parentCtlID, Url, AddBlank, DefaultValue, desciptionField, valueField, isKnockout) {
    // Save our parameters
    var dropDownBox = ctl;
    var myID = $(dropDownBox).attr('id');
    var addBlank = AddBlank;
    var desciptionField = DesciptionField;
    var valueField = ValueField;
    var defaultValue = DefaultValue;
    var url = Url;

    if (isKnockout) parentCtlID += "_" + fieldRight(myID, "_");
    var parentObj = $("#" + parentCtlID)
    if (!$(parentObj).length) return alert('unable to find parent for ' + myID);

    // attach to the parent control to catch changes
    attachToElementChange(parentCtlID, function () {
        var newValue = formVar(parentCtlID, true);  // save for ajax call

        var lastValue = CStr($(parentObj).data('lastValue_' + myID));
        if (lastValue == "..pending..") return

        if (lastValue && lastValue == CStr(newValue)) {
            var arrayOfValues = $(parentObj).data('lastFetchData_' + myID);
            if (arrayOfValues) loadOptions(dropDownBox, arrayOfValues, valueField, desciptionField, addBlank, null, defaultValue, true);
            return
        }

        if (formVar(parentObj) != newValue) window._isDirty = true;

        var opts = { id: newValue }
        opts[parentCtlID] = newValue;

        url = urlCtlSubstitutions(url, opts)
        $(parentObj).data('lastFetch_' + myID, "..pending..");

        // do AJAX call
        ajaxCall("GET", url, null,
            function (json) {
                // successful fetch
                $(parentObj).data('lastFetchData_' + myID, []);
                for (var key in json) {
                    var arrayOfValues = json[key];
                    if (isArray(arrayOfValues)) {
                        $(parentObj).data('lastFetchData_' + myID, arrayOfValues);
                        break;
                    }
                }
                loadOptions(dropDownBox, arrayOfValues, valueField, desciptionField, addBlank, null, defaultValue, true);
                $(parentObj).data('lastFetch_' + myID, newValue);

            },
            function () {
                if (window.doDebug) debugger;
                if (textStatus == 'parsererror') {
                    popoutDialog('AJAX call error, Expected JSON result', url, "80%", "auto");
                } else {
                    alert(errorThrown);
                }
            }
        );
    }, '', isKnockout);
}


// ========================== Start of Swipe / Mouse Code ===============================
// ========================== Start of Swipe / Mouse Code ===============================
// ========================== Start of Swipe / Mouse Code ===============================

function enableSwipes() {
    if (isPhoneGap()) {
        $(document).on('touchstart', eventTouchStart);
        $(document).on('touchend', eventTouchEnd);
        $(document).on('touchmove', eventTouchMove);
    }
    enableSwipesNotScroll = true;
}

// This is done on a clearScreen()
function disableSwipes() {
    fingerIsDown = false;
    swipedRight = false;
    swipedLeft = false;
    swipedUp = false;
    swipedDown = false;
    onSwipedRight = null;
    onSwipedLeft = null;
    onSwipedUp = null;
    onSwipedDown = null;
    onSwipeMove = null;
    enableSwipesNotScroll = false;
}

// mouse click on background does setFocus();
var dblClickTimer = null;
var isDblClick;

$(document).ready(function () {
    $(document).on('mousedown', function (e) {
        isDblClick = dblClickTimer != null;
        if (isDblClick) {
            clearTimeout(dblClickTimer);
            dblClickTimer = null
        }

        if (!e) e = window.event;
        if (e.which != 1) return;
        if (enableSwipesNotScroll && !isMobile()) return eventTouchStart(e)
        mouseDownX = e.pageX;
        mouseDownY = e.pageY;
        mouseX = e.pageX;
        mouseY = e.pageY;
    });

    $(document).on('mousemove', function (e) {
        if (!e) e = window.event;
        if (e.which != 1) return;
        if (enableSwipesNotScroll && !isMobile()) return eventTouchMove(e)
        mouseX = e.pageX;
        mouseY = e.pageY;
    });

    $(document).on('mouseup', function (e) {
        if (!e) e = window.event;
        if (e.which != 1) return;
        if (enableSwipesNotScroll && !isMobile()) return eventTouchEnd(e);

        mouseX = e.pageX;
        mouseY = e.pageY;
        var absX = Math.abs(mouseX - mouseDownX)
        var absY = Math.abs(mouseY - mouseDownY)

        var targ = whichElement(e);
        if (targ && absX < 4 && absY < 4) {
            var nn = UCase(targ.nodeName)
            if (!isDblClick && (nn == 'FORM' || nn == 'BODY' || nn == 'HTML' || nn == 'CANVAS' || nn == 'TD' || nn == 'TR') && $(targ).attr('contenteditable') != 'true') {
                dblClickTimer = window.setTimeout(function () {
                    setFocus();
                    dblClickTimer = null
                }, 250);
            }
        }
    });
});


var mouseX = 0,
    mouseY = 0;
var mouseDownX = 0,
    mouseDownY = 0;
var mouseUpX = 0,
    mouseUpY = 0;
var touchTimer = null;
var mouseDownMSTime = 0;

var mouseClick = 0;

var enableSwipesNotScroll = false;
var swipedRight = false;
var swipedLeft = false;
var swipedUp = false;
var swipedDown = false;

var swipedSpeed = 0;

var onSwipedRight = null;
var onSwipedLeft = null;
var onSwipedUp = null;
var onSwipedDown = null;
var onSwipeMove = null;
var onDblClick = null;
var longTouchTimer = null;
var trackingTouch = false;
var ignoreMouseUp = false;

var getPointerEvent = function (event) {
    if (event.touches) {
        return event.touches[0]
    }
    if (event.originalEvent) {
        if (event.originalEvent.targetTouches) return event.originalEvent.targetTouches[0];
        if (event.originalEvent.touches) return event.originalEvent.touches[0];
    }
    return event;
};

var touchMove = 0; // 0) none, 1) start, 2) middle, 3)
var mouseEvent;
var longTouchTimer;

function eventTouchStart(oe) {
    mouseEvent = getPointerEvent(oe);
    mouseDownX = mouseEvent.pageX;
    mouseDownY = mouseEvent.pageY;
    mouseX = mouseEvent.pageX;
    mouseY = mouseEvent.pageY;
    mouseDownMSTime = Timer(); // for speed

    // make long touch a right click
    longTouchTimer = window.setTimeout(function () {
        longTouchTimer = null;

        // Did we move in a short enough period of time?
        var absX = Math.abs(mouseX - mouseDownX)
        var absY = Math.abs(mouseY - mouseDownY)
        var distance = absX + absY;

        if (distance < 8) {
            trackingTouch = false;
            $(document.elementFromPoint(mouseDownX, mouseDownY)).contextmenu()
        }
    }, 450);

    if (!enableSwipesNotScroll) return;

    // user wants swipes
    // allow swipes but not on certain elements
    var targ = whichElement(mouseEvent);
    if (targ) {
        var scrollable = targ.scrollHeight > targ.offsetHeight || targ.scrollWidth > targ.offsetWidth;
        if (scrollable) return;

        var nn = UCase(targ.nodeName);
        if (nn == 'INPUT' || nn == 'TEXTAREA' || nn == 'BUTTON' || nn == 'A' || $(targ).attr('contenteditable') == 'true') return; // removed || nn == 'LABEL'
        if ($(targ).hasClass("dbgSrcLine")) return;
    }

    swipedRight = false;
    swipedLeft = false;
    swipedUp = false;
    swipedDown = false;

    touchMove = 1;
    trackingTouch = true;

    // Clear any selections
    if (window.getSelection) {
        if (window.getSelection().empty) {  // Chrome
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) {  // IE?
        document.selection.empty();
    }

}

function eventTouchMove(oe) {
    if (!trackingTouch) return;

    e = getPointerEvent(oe);
    if (e.pageX || e.pageY) {
        mouseX = e.pageX;
        mouseY = e.pageY;
    }

    if (onSwipeMove && touchMove) {
        if (longTouchTimer) {
            window.clearTimeout(longTouchTimer);
            longTouchTimer = null
        }
        var whichMove = touchMove;
        touchMove = 0;
        preventTheDefault(e);
        return onSwipeMove(whichMove, mouseDownX, mouseDownY, mouseX, mouseY); // must bump here
    }
}

function eventTouchEnd(e) {
    if (longTouchTimer) {
        window.clearTimeout(longTouchTimer);
        longTouchTimer = null
    }

    if (!trackingTouch) return;

    trackingTouch = false;
    e = getPointerEvent(e);

    if (!e) e = window.event;
    if (e.pageX || e.pageY) {
        mouseX = e.pageX;
        mouseY = e.pageY;
    }

    if (onSwipeMove) {
        touchMove = 0;
        preventTheDefault(e);
        return onSwipeMove(3, mouseDownX, mouseDownY, mouseX, mouseY);
    }

    swipedRight = false;
    swipedLeft = false;
    swipedUp = false;
    swipedDown = false;
    onSwipeMove = null;

    // Did we move enough in a short enough period of time?
    var absX = Math.abs(mouseX - mouseDownX)
    var absY = Math.abs(mouseY - mouseDownY)
    var distance = absX + absY;
    var currentTime = Timer();

    swipedSpeed = CInt(distance / (currentTime - mouseDownMSTime) * 5);
    if (swipedSpeed > 10) swipedSpeed = 10;

    if (distance < 8) {
        // Not a swipe
        mouseClick++
        var targ = whichElement(e);
        if (targ) {
            var nn = UCase(targ.nodeName)
            if (nn == 'FORM' || nn == 'BODY' || nn == 'HTML' || nn == 'CANVAS') setFocus();
        }
        return;
    }

    // Valid Swipe!
    preventTheDefault(e);

    if (absX > absY) {
        if (mouseX - mouseDownX > 18) {
            swipedRight = true;
            if (onSwipedRight) { onSwipedRight(); }
        }
        if (mouseX - mouseDownX < -18) {
            swipedLeft = true;
            if (onSwipedLeft) { onSwipedLeft(); }
        }
    } else {
        if (mouseY - mouseDownY > 18) {
            swipedDown = true;
            if (onSwipedDown) { onSwipedDown(); }
        }
        if (mouseY - mouseDownY < -18) {
            swipedUp = true;
            if (onSwipedUp) { onSwipedUp(); }
        }
    }
}

function whichElement(e) {
    var targ;
    if (!e) e = window.event;

    if (e.target) {
        targ = e.target;
    } else if (e.srcElement) {
        targ = e.srcElement;
    }
    if (targ.nodeType == 3) // defeat Safari bug
    {
        targ = targ.parentNode;
    }
    return targ;
}
// ========================== End of Swipe / Mouse Code ===============================
// ========================== End of Swipe / Mouse Code ===============================
// ========================== End of Swipe / Mouse Code ===============================


// ================================================== TIME and DATE ====================================================
// ================================================== TIME and DATE ====================================================
// ================================================== TIME and DATE ====================================================
function isLeapYear(Year) {
    if ((Year % 100) == 0) {
        return (Year % 400) == 0;
    }
    return (Year % 4) == 0;
}

function DaysInMonth(year, month) {
    if (month == 2 && isLeapYear(year)) {
        return 29
    }
    var slice = new Array(0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)
    return slice[month]
}

function DayOfWeek(R83Date) {
    return parseInt(R83Date) % 7;
    //var slice = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
    // return slice[R83Date]
}

function DaysInYear(year) {
    if (isLeapYear(year)) {
        return 366
    }
    return 365
}

function makeR83Date(to_Day, to_Month, to_Year) {
    var Days = 0, year, month;

    if (to_Month == 0) {
        return 0;
    }

    if (to_Year >= 1968) {
        for (year = 1968; year < to_Year; year++) {
            Days += DaysInYear(year);
        }
        for (month = 1; month < to_Month; month++) {
            Days += DaysInMonth(to_Year, month);
        }
        Days += to_Day;
    } else {
        for (year = 1967; year > to_Year; year--) {
            Days -= DaysInYear(year);
        }
        for (month = 12; month > to_Month; month--) {
            Days -= DaysInMonth(to_Year, month);
        }
        Days = Days - DaysInMonth(to_Year, to_Month) + to_Day;
    }

    return Days
}

function Lead0(i) {
    if (i < 10) return "0" + i.toString();
    else return i.toString()
}

function YearMonthDay(R83Date) {
    R83Date -= 1;

    var year = 1968;
    for (; R83Date >= DaysInYear(year);) {
        R83Date -= DaysInYear(year);
        year += 1;
    }

    for (; R83Date < 0;) {
        year -= 1;
        R83Date += DaysInYear(year);
    }

    var month = 1;
    for (; R83Date >= DaysInMonth(year, month);) {
        R83Date -= DaysInMonth(year, month);
        month += 1;
    }

    R83Date = parseInt(R83Date) + 1;
    return year.toString() + "-" + Lead0(month) + "-" + Lead0(R83Date)
}

function Year(R83Date) {
    return Field(YearMonthDay(R83Date), "-", 1)
}

function Month(R83Date) {
    return Field(YearMonthDay(R83Date), "-", 2)
}

function Day(R83Date) {
    return Field(YearMonthDay(R83Date), "-", 3)
}

// YYYY-MM-DD or YY-MM-DD 11:22:33
function isDateTime(s) {
    if (typeof s != "string") s = CStr(s);

    if (s.length > 20) return 0;

    var st = Trim(s);
    if (Count(st, " ") > 1) return 0;

    var myDate = Field(st, " ", 1);
    var myTime = Field(st, " ", 2);
    if (InStr(myDate, ":") != -1) {
        myTime = myDate;
        myDate = Field(st, " ", 2);
    }

    var D = "-";
    if (InStr(myDate, D) != -1) {
        D = "/";
        if (InStr(myDate, D) != -1) {
            D = "."
        }
    }

    if (Count(myTime, ":") != 2 || Count(myDate, D) != 2) return 0;

    if (myDate != "") {
        if (myDate.length < 5 || myDate.length > 10) return 0;
    }

    if (myTime != "") {
        myTime = Field(myTime, ".", 1); // HH:MM:SS
        if (myTime.length != 8) return 0;
    }

    for (var i = 0; i < st.length; i++) {
        var c = st[i];
        if ((c >= '0' && c <= '9') || c == ':' || c == '-' || c == ' ' || c == '/') { } else {
            return 0;
        }
    }

    return 1;
}
function isDateTime(s) { return isDateTime(s) }

// NOW() returns R83 days.time
function Now(dateObj) {
    if (!dateObj) dateObj = new Date();
    var month = dateObj.getMonth() + 1;
    var day = dateObj.getDate();
    var year = dateObj.getFullYear();
    var hours = dateObj.getHours();
    var mins = dateObj.getMinutes();
    var secs = dateObj.getSeconds();
    var msecs = dateObj.getMilliseconds();

    return makeR83Date(day, month, year) + makeR83Time(hours, mins, secs, msecs)
}


// Convert javascript time t to fraction
function makeR83Time(Hours, Minutes, Seconds, Milliseconds) {
    var Mins = (Hours) * 60 + Minutes;
    var Secs = Mins * 60 + Seconds;
    Secs = Secs + Milliseconds * 1e-6
    Secs = Secs / 60 / 60 / 24
    var D = Field(String(Secs), ".", 2)
    if (Len(D) < 3) Secs += .0000001
    return Secs
}

// TIMEDATE() FUNCTION YEAR-MONTH-DAY HH:MM:SS
function TimeDate(a) {
    if (isEmpty(a)) a = Now();
    if (!isNumeric(a)) return ParseDateTime(a)

    var ymd = YearMonthDay(a)
    var Theday = Field(ymd, "-", 3);
    var Themonth = Field(ymd, "-", 2);
    var Theyear = Field(ymd, "-", 1);
    var Themonthname = [, 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][Themonth * 1];

    return HHMMSS(a) + " " + Theday + " " + Themonthname + " " + Theyear;
}

function r83Date(a) {
    if (isNumeric(a) && a !== "") return YearMonthDay(a);
    if (!a) return Now();
    else return ParseDateTime(a)
}

// NOW() returns R83 days.time
function r83Time(a) {
    if (isEmpty(a)) return Math.round(("." + (Now() + ".0").split(".")[1]) * 60 * 60 * 24 * 1000) / 1000
    if (isNumeric(a)) {
        var Millisecs = Field(a, '.', 2)
        if (Len(Millisecs) <= 3 && a > 0 && a < 60 * 60 * 24) {
            var b = a / 60 / 60 / 24
            return HHMMSS(b)
        } else {
            return HHMMSS("0." + Millisecs)
        }
    } else {
        a = ParseDateTime(a);
        a = 9999999 + a // make positive

        a = a - Math.floor(a) // make decimal part only
        a = a * 60 * 60 * 24 // change to seconds
        var r = a % 1;
        if (r < .0001) a = Math.floor(a);
        if (r > .9999) a = Math.ceil(a);
        return a
    }
}

// return a timer in milliseconds
function Timer() {
    return +new Date();
}

// Return R83 time - change back with HHMMSS(f) or YearMonthDay(int64(f))
function ParseDateTime(s) {
    var Time, Date, Month, Day, Year, Min = 0, Sec = 0, Hour = 0, Days = 0;

    s = LCase(Trim(s))

    // Find the Time part (has a :)
    var tp = InStr(s, " am")
    if (tp == -1) tp = InStr(s, " pm")
    if (tp == -1) tp = InStr(s, "am")
    if (tp == -1) tp = InStr(s, "pm")
    if (tp == -1) tp = InStr(s, ":");

    // Break into Time and Date
    if (tp != -1) {
        // Any spaces upto time part?
        var upto = Left(s, tp - 1);
        var spaces = Count(upto, " ")

        if (spaces) {
            // date part must preceed Time
            var lastspace = Index(s, " ", spaces);
            Date = Left(s, lastspace);
            Time = Mid(s, lastspace + 1)
        } else {
            // date part after time
            var nextspace = InStr(tp + 1, s, " ");
            if (nextspace != -1) {
                Time = Left(s, nextspace);
                Date = LCase(Trim(Mid(s, nextspace + 1)));
            } else {
                Time = s;
                Date = ""
            }
        }
    } else {
        Date = s;
        Time = "";
    }

    if (Date) {
        var d = new window.Date(Date);
        Year = d.getUTCFullYear()
        Month = d.getUTCMonth() + 1; // from 0
        Day = d.getUTCDate(); // 1..31
        var Days = makeR83Date(+Day, +Month, +Year)
    }

    if (Time) {
        // Do time
        var D = ":"
        if (InStr(Time, D) == -1) { D = " " }
        Time = Change(Time, "am", " am")
        Time = Change(Time, "pm", " pm")
        Time = Change(Time, "  ", " ")
        var AmPm = Field(Time, " ", 2)
        Time = Field(Time, " ", 1)
        Hour = +Field(Time, D, 1)
        Min = +Field(Time, D, 2)
        Sec = CNum(Field(Time, D, 3))

        if (Hour == 12) {
            if (AmPm.startsWith("am")) Hour += 12;
        } else {
            if (AmPm.startsWith("pm")) Hour += 12;
        }
    } return Days + makeR83Time(Hour, Min, Sec, 0)
}

// Convert R82 time (decimal fraction) to HH:MM:SS
function HHMMSS(t) {
    var b = parseInt(t)
    var t = t - b
    var bi = parseInt(t * 60 * 60 * 24 + .5)
    var Secs = parseInt(bi % 60)
    bi = bi / 60
    var Mins = parseInt(bi % 60)
    bi = bi / 60
    var Hours = parseInt(bi % 24)
    return Lead0(Hours) + ":" + Lead0(Mins) + ":" + Lead0(Secs)
}

function parsleyReset(ctl) {
    try {
        window.console.warn = null; // disable parsley warnings

        if ($(ctl).parsley && $(ctl).parsley().reset) {
            $(ctl).parsley().reset();
            $(ctl).parent("label").parent("div").parent("fieldset").removeClass("parsley-error")
        }
    } catch (e) { }
}

// ================================================== my css Tree  ====================================================
// ================================================== my css Tree  ====================================================
// ================================================== my css Tree  ====================================================
// ================================================== my css Tree  ====================================================
// ================================================== my css Tree  ====================================================
// ================================================== my css Tree  ====================================================
/*

  // this struture mimics my Menu structure so that they can be interchanged
  tree = {
     // tree folder
     file: { 
             // optional attributes for both folders and leafs
             class: 'optional extraClasses',
             id: 'id or default to caption',
             caption: 'specific caption or default to tagName',
             disabled: false,
             
             // optional user data: will get passed to eventHandlers, ie:    eventHandler_xxxxx(data, pkID, eventName, e)
             pkID: 'id',         // default name for primary key if using attribute 'data'
             data: { a user json structure }

             // optional dynamic loading URL
             url: null,     // 'a url to fetch dynamic content
             
             // optional onClick code (if using dynamic loading, will run after load)
             onclick: null, // user javascript code

             // ignored for compatablility with JSB_HTML MenuBar
             collaspable: true,
             rightalign: false, // ignored
             sep: 'ignore anything starting with sep', // seperator
             
             // leafs
             new:   { id: 1, onclick: 'alert("Hi")' },
             open:  { id: 2 },
             close: { id: 3 }
      },
      
      // tree folder
      edit: { opened: false,
             cut:   { id: 4 },
             copy:  { id: 5 },
             paste: { id: 6 }
      },
     help: { id: 7 }
  }
*/

function jsonTree(Jobj) {
    window.newIdCtl = 10000;
    return '<div class="css-treeview"><ul>' + jsonProcessChildren(Jobj) + '</ul></div>';
}

function getTreeOpenedFolders() {
    // Get list of all open folders
    var openedFolders = [];
    $(".css-treeview input:checkbox:checked").each(function () { openedFolders.push(this.id) });
    return openedFolders; //  = openedFolders.join(",")
}

function reopenTreeFolders(openedFolders) {
    openedFolders.forEach(function (value) {
        if (value) {
            var checkBox = $('[id="' + value + '"]');
            if ($(checkBox).length && !$(checkBox).prop('checked')) {
                // $(checkBox).prop('checked', true);
                $(checkBox).trigger('click');
            }
        }
    })
}

// find and process my children: loop through tags in Jobj
function jsonProcessChildren(Jobj) {
    var tags = Object.keys(Jobj);
    var Treefolders = []
    for (var i = 0; i < tags.length; i++) {
        var subtag = tags[i];
        var childElement = Jobj[subtag];

        // Skip tags which are not sub-folders or leafs
        if (InStr(".url.caption.opened.disabled.pkID.id.data.onclick.collaspable.rightalign.class.prior_onclick.", "." + subtag + ".") == -1 && Left(subtag, 3) != 'sep') {
            if (isString(childElement)) childElement = { id: subtag, caption: subtag, onclick: childElement }

            // check if this is a leaf or a folder
            if (jsonTreeIsAFolder(childElement)) Treefolders.push(jsonTreeFolder(subtag, childElement)); else Treefolders.push(jsonTreeLeaf(subtag, childElement));
        };
    }
    return Join(Treefolders, crlf)
}

// Creates a JSON structure which is rendered into a String 
function jsonTreeFormatData(data, pkID, caption, id) {
    caption = $('<div/>').html(caption).text()
    if (isString(data)) data = { data: data }
    if (!data) { data = { caption: caption }; data[pkID] = id }
    if (!data[pkID]) data[pkID] = id;
    if (!data.caption) data.caption = caption;
    return json2string(data, false);
}

// Convert the Jobj into a folder
//  JObj optional attributes:
//     .caption  (defaults to tag name)
//     .id       (defaults to id###)
//     .pkID     (defaults 'id')
//     .url      
//     .onclick
//     .class
//
function jsonTreeFolder(tag, Jobj) {
    if (InStr(tag, c28) != -1) tag = convertPrint2Html(null, Change(tag, am, crlf));
    var tagText = $('<div/>').html(tag).text(); // string html elements

    var caption = Jobj.caption ? Jobj.caption : tag;
    var id = Jobj.id;
    var pkID = Jobj.pkID ? Jobj.pkID : 'id';

    if (InStr(caption, c28) != -1) {
        caption = convertPrint2Html(null, Change(caption, am, crlf));

    } else if (Left(caption, 1) != '<') {
        caption = htmlEncode(caption);
        if (!id) id = nicename(caption);
    }

    if (!id) id = "id" + (window.newIdCtl += 1);
    var data = jsonTreeFormatData(Jobj.data, pkID, caption, id);

    var onclick = Jobj.onclick;
    if (!onclick) onclick = 'if (window.eventHandler_folderSelected) eventHandler_folderSelected(string2json($(this).attr("data")), $(this).attr("pkID"), "folderselected", this); ';

    // onclick will run after folder load if url given
    if (Jobj.url) onclick = "jsonTreeDynamicFolderLoad(this, '" + Replace(Replace(tagText, "\\", "\\\\"), "'", "\\'") + "', '" + Replace(Replace(Jobj.url, "\\", "\\\\"), "'", "\'") + "', '" + Replace(Replace(onclick, "\\", "\\\\"), "'", "\\'") + "')";

    var classes = "treeFolder treeFolder_" + nicename(tagText)
    if (Jobj.class) classes += ' ' + Jobj.class;

    // build and return html
    var Html = "<li class='" + classes + "' for='" + htmlEscape(id) + "'>" + crlf;
    Html += "<input id='" + htmlEscape(id) + "' data='" + htmlEscape(data) + "' pkID='" + htmlEscape(pkID) + "' type='checkbox'" + (Jobj.opened ? " checked" : "") + (Jobj.disabled ? " disabled='disabled'" : "") + " onclick='" + htmlEscape(onclick) + "' />" + crlf;
    Html += "<label for='" + htmlEscape(id) + "'>" + caption + "</label>" + crlf;
    Html += "<ul>" + jsonProcessChildren(Jobj) + "</ul>" + crlf
    Html += "</li>" + crlf

    return Html
}

function jsonTreeLeaf(tag, Jobj) {
    if (InStr(tag, c28) != -1) tag = convertPrint2Html(null, Change(tag, am, crlf));
    var tagText = $('<div/>').html(tag).text();

    var caption = Jobj.caption ? Jobj.caption : tag;
    var id = Jobj.id;
    var pkID = Jobj.pkID ? Jobj.pkID : 'id';

    if (InStr(caption, c28) != -1) {
        caption = convertPrint2Html(null, Change(caption, am, crlf));

    } else if (Left(caption, 1) != '<') {
        caption = htmlEncode(caption);
        if (!id) id = nicename(caption);
    }

    if (!id) id = newGUID();
    var data = jsonTreeFormatData(Jobj.data, pkID, caption, id);

    var onclick = Jobj.onclick;
    if (!onclick) onclick = 'if (window.eventHandler_leafSelected) eventHandler_leafSelected(string2json($(this).attr("data")), $(this).attr("pkID"), "leafselected", this); ';

    // setup class
    var classes = "menuLeaf menuLeaf_" + nicename(tagText)
    if (Jobj.iconurl) classes += ' tooltip';
    //if (Jobj.class) classes += ' ' + Jobj.class;

    // build return html
    var Html = "<li class='" + classes + "' for='" + htmlEscape(id) + "'>" + crlf;

    var aclass = "jsonTreeBtn"
    if (Jobj.class) aclass += ' ' + Jobj.class;

    if (Jobj.iconurl) {
        Html += "<img id='" + htmlEscape(id) + "' class='" + htmlEscape(aclass) + "' onclick='" + htmlEscape(onclick) + "' data='" + htmlEscape(data) + "' pkID='" + pkID + "'" + (Jobj.disabled ? " disabled='disabled'" : "") + "alt='" + htmlEscape(caption) + "' src='" + htmlEscape(Jobj.iconurl) + "' >";
        Html += "<span class='tooltiptext'>" + tagText + "<span>"
    } else {
        Html += "<a id='" + htmlEscape(id) + "' class='" + htmlEscape(aclass) + "' onclick='" + htmlEscape(onclick) + "' data='" + htmlEscape(data) + "' pkID='" + pkID + "'" + (Jobj.disabled ? " disabled='disabled'" : "") + ">" + caption + "</a>";
    }
    Html += "</li>"

    return Html;
}

function jsonTreeDynamicFolderLoad(e, tag, url, onclick) {
    var checkbox = e;
    var folderTag = tag;
    var nextonclick = onclick;


    ajaxCall("GET", url, null, function (newFolder) {
        var folder = $(checkbox).parent();
        var label = $(folder).find("label");

        var caption = $(label).html();
        var opened = $(checkbox).attr('checked');
        var id = $(checkbox).attr('id')
        var data = string2json($(checkbox).attr('data'))
        var pkID = $(checkbox).attr('pkID')

        newFolder.id = id;
        newFolder.caption = caption
        newFolder.pkID = pkID
        newFolder.opened = true;
        newFolder.data = data
        newFolder.onclick = nextonclick;

        $(folder).html(jsonTreeFolder(folderTag, newFolder))

        newFolder = $('#' + id)
        newFolder.attr("prior_onclick", $(checkbox).attr('onclick'))

        if (nextonclick) {
            newFolder = $('#' + id)
            if ($(newFolder).length) {
                $(newFolder).click();
                $(newFolder)[0].checked = true;
            }
        }
    })
}

function jsonTreeIsAFolder(element) {
    var isFolder = false;
    var subkeys = Object.keys(element);
    for (j = 0; j < subkeys.length; j++) {
        var key = subkeys[j];
        if (key == 'url') return true;
        if (key != 'data' && isJSON(element[key])) return true;
    }
    return false;
}

// ================================================== my jsonMenu (Pure css)  ====================================================
// ================================================== my jsonMenu (Pure css)  ====================================================
// ================================================== my jsonMenu (Pure css)  ====================================================
//  JObj optional attributes:
//     caption:  (defaults to tag name)
//     id:       (defaults to id###)
//     pkID:     (defaults 'id')
//     url:      for dynamic loading   
//     onclick:  onclick event
//     class:    extra classes
//     icon:      a url for an icon
//     data:      a json object passed to events

function jsonMenu(Jobj) {
    window.newIdCtl = 10000;
    return '<ul class="jsonMenu">' + jsonMenuLoop_li(Jobj) + '</ul>';
}

// loop through top level button in header
function jsonMenuLoop_li(Jobj) {
    var tags = Object.keys(Jobj);
    var Menufolders = []
    for (var i = 0; i < tags.length; i++) {
        var subtag = tags[i];
        var childElement = Jobj[subtag];

        // Skip tags which are not sub-folders or leafs
        if (InStr(".url.caption.opened.disabled.pkID.id.data.onclick.collaspable.rightalign.class.prior_onclick.", "." + subtag + ".") == -1 && Left(subtag, 3) != 'sep') {
            if (isString(childElement)) childElement = { id: subtag, caption: subtag, onclick: childElement }

            // check if this is a leaf or a folder
            if (jsonMenuIsAFolder(childElement)) Menufolders.push(jsonMenu_inner_ul(subtag, childElement)); else Menufolders.push(jsonMenu_li_a(subtag, childElement));
        };
    }
    return Join(Menufolders, crlf)
}

// Creates a JSON structure which is rendered into a String 
function jsonMenuFormatData(data, pkID, caption, id) {
    caption = $('<div/>').html(caption).text()
    if (isString(data)) data = { data: data }
    if (!data) { data = { caption: caption }; data[pkID] = id }
    if (!data[pkID]) data[pkID] = id;
    if (!data.caption) data.caption = caption;
    return json2string(data, false);
}

function jsonMenu_inner_ul(tag, Jobj) {
    if (InStr(tag, c28) != -1) tag = convertPrint2Html(null, Change(tag, am, crlf));
    var tagText = $('<div/>').html(tag).text(); // string html elements

    var caption = Jobj.caption ? Jobj.caption : tag;
    var id = Jobj.id;
    var pkID = Jobj.pkID ? Jobj.pkID : 'id';

    if (InStr(caption, c28) != -1) {
        caption = convertPrint2Html(null, Change(caption, am, crlf));

    } else if (Left(caption, 1) != '<') {
        caption = htmlEncode(caption);
        if (!id) id = nicename(caption);
    }

    if (!id) id = "id" + (window.newIdCtl += 1);
    var data = jsonMenuFormatData(Jobj.data, pkID, caption, id);

    var onclick = Jobj.onclick;
    if (!onclick) onclick = 'if (window.eventHandler_folderSelected) eventHandler_folderSelected(string2json($(this).attr("data")), $(this).attr("pkID"), "folderselected", this); ';

    // onclick will run after folder load if url given
    if (Jobj.url) onclick = "jsonMenuDynamicFolderLoad(this, '" + Replace(Replace(tagText, "\\", "\\\\"), "'", "\\'") + "', '" + Replace(Replace(Jobj.url, "\\", "\\\\"), "'", "\'") + "', '" + Replace(Replace(onclick, "\\", "\\\\"), "'", "\\'") + "')";

    var classes = "menuFolder menuFolder_" + nicename(tagText)
    if (Jobj.class) classes += ' ' + Jobj.class;

    // build and return html
    var Html = "<li class='" + classes + "' for='" + htmlEscape(id) + "'>" + crlf;
    Html += "<a id='" + htmlEscape(id) + "' class='jsonMenuBtn' data='" + htmlEscape(data) + "' pkID='" + htmlEscape(pkID) + "' href='javascript:void(0)' onclick='" + htmlEscape(onclick) + "'>" + caption + "</a>" + crlf;
    Html += "<ul class='jsonMenuContent'>" + jsonMenuLoop_li(Jobj) + "</ul>" + crlf
    Html += "</li>"
    return Html
}

function jsonMenu_li_a(tag, Jobj) {
    if (InStr(tag, c28) != -1) tag = convertPrint2Html(null, Change(tag, am, crlf));
    var tagText = $('<div/>').html(tag).text();

    var caption = Jobj.caption ? Jobj.caption : tag;
    var id = Jobj.id;
    var pkID = Jobj.pkID ? Jobj.pkID : 'id';

    if (InStr(caption, c28) != -1) {
        caption = convertPrint2Html(null, Change(caption, am, crlf));

    } else if (Left(caption, 1) != '<') {
        caption = htmlEncode(caption);
        if (!id) id = nicename(caption);
    }

    if (!id) id = newGUID();
    var data = jsonMenuFormatData(Jobj.data, pkID, caption, id);

    var onclick = Jobj.onclick;
    if (!onclick) onclick = 'if (window.eventHandler_leafSelected) eventHandler_leafSelected(string2json($(this).attr("data")), $(this).attr("pkID"), "leafselected", this); ';

    // setup class
    var classes = "menuLeaf menuLeaf_" + nicename(tagText)
    if (Jobj.iconurl) classes += ' tooltip';
    //if (Jobj.class) classes += ' ' + Jobj.class;

    // build return html
    var Html = "<li class='" + classes + "' for='" + htmlEscape(id) + "'>" + crlf;

    var aclass = "jsonTreeBtn"
    if (Jobj.class) aclass += ' ' + Jobj.class;

    if (Jobj.iconurl) {
        Html += "<img id='" + htmlEscape(id) + "' class='" + htmlEscape(aclass) + "' onclick='" + htmlEscape(onclick) + "' data='" + htmlEscape(data) + "' pkID='" + pkID + "'" + (Jobj.disabled ? " disabled='disabled'" : "") + "alt='" + htmlEscape(caption) + "' src='" + htmlEscape(Jobj.iconurl) + "' >";
        Html += "<span class='tooltiptext'>" + tagText + "<span>"
    } else {
        Html += "<a id='" + htmlEscape(id) + "' class='" + htmlEscape(aclass) + "' onclick='" + htmlEscape(onclick) + "' data='" + htmlEscape(data) + "' pkID='" + pkID + "'" + (Jobj.disabled ? " disabled='disabled'" : "") + ">" + caption + "</a>";
    }
    Html += "</li>"

    return Html;
}


var ignoreNextFolderClick = false;
function jsonMenuDynamicFolderLoad(e, tag, url, onclick) {
    var checkbox = e;
    var folderTag = tag;
    var nextonclick = onclick;

    ajaxCall("GET", url, null, function (newFolder) {
        var folder = $(checkbox).parent();
        var label = $(folder).find("label");

        var caption = $(label).html();
        var opened = $(checkbox).attr('checked');
        var id = $(checkbox).attr('id')
        var data = string2json($(checkbox).attr('data'))
        var pkID = $(checkbox).attr('pkID')

        newFolder.id = id;
        newFolder.caption = caption
        newFolder.pkID = pkID
        newFolder.opened = true;
        newFolder.data = data
        newFolder.onclick = nextonclick;

        $(folder).html(jsonMenuFolder(folderTag, newFolder))

        if (nextonclick) {
            if (ignoreNextFolderClick) ignoreNextFolderClick = false; else {

                newFolder = $('#' + id)
                if ($(newFolder).length) {
                    $(newFolder).click();
                    $(newFolder)[0].checked = true;
                }
            }
        }
    })
}

function jsonMenuIsAFolder(element) {
    var isFolder = false;
    var subkeys = Object.keys(element);
    for (j = 0; j < subkeys.length; j++) {
        var key = subkeys[j];
        if (key == 'url') return true;
        if (key != 'data' && isJSON(element[key])) return true;
    }
    return false;
}

// ================================================== jquery SoftKey  ====================================================
// ================================================== jquery SoftKey  ====================================================
// ================================================== jquery SoftKey  ====================================================
// License: MIT
// http://www.jqueryscript.net/other/Minimal-Virtual-Keyboard-Plugin-For-jQuery-SoftKey.html

$.fn.softkeys = function (options) {
    var settings = $.extend({
        layout: [],
        target: '',
        rowSeperator: 'br',
        buttonWrapper: 'li',
        onAccept: function () { },
        onCancel: function () { },
        onChange: function () { }
    }, options);

    var createRow = function (obj, buttons) {
        for (var i = 0; i < buttons.length; i++) {
            createButton(obj, buttons[i]);
        }

        obj.append('<' + settings.rowSeperator + '>');
    },

        createButton = function (obj, button) {
            var character = '',
                type = 'letter',
                styleClass = '';

            switch (typeof button) {
                case 'array':
                case 'object':
                    if (typeof button[0] !== 'undefined') {
                        character += '<span>' + button[0] + '</span>';
                    }
                    if (typeof button[1] !== 'undefined') {
                        character += '<span>' + button[1] + '</span>';
                    }
                    type = 'symbol';
                    break;

                case 'string':
                    switch (button.toLowerCase()) {
                        case 'capslock':
                            character = '<span>caps</span>';
                            styleClass = 'softkeys__btn--caps';
                            type = 'capslock';
                            break;

                        case 'shift':
                            character = '<span>shift</span>';
                            styleClass = 'softkeys__btn--shift';
                            type = 'shift';
                            break;

                        case 'return':
                            character = '<span>Return</span>';
                            styleClass = 'softkeys__btn--return';
                            type = 'return';
                            break;

                        case 'tab':
                            character = '<span>tab</span>';
                            styleClass = 'softkeys__btn--tab';
                            type = 'tab';
                            break;

                        case 'spacebar':
                            character = '<span>Space</span>';
                            type = 'space';
                            styleClass = 'softkeys__btn--spacebar';
                            break;

                        case 'space':
                            character = '&nbsp;';
                            styleClass = 'softkeys__btn--space';
                            type = 'space';
                            break;

                        case 'delete':
                            character = '<span>Delete</span>';
                            type = 'delete';
                            styleClass = 'btn-warning softkeys__btncmd'
                            break;

                        case 'clear':
                            character = '<span>Clear</span>';
                            type = 'clear';
                            styleClass = 'btn-info softkeys__btncmd'
                            break;

                        case 'accept':
                            character = '<span>Accept</span>';
                            type = 'accept';
                            styleClass = 'btn-success softkeys__btncmd'
                            break;

                        case 'cancel':
                            character = '<span>Cancel</span>';
                            type = 'cancel';
                            styleClass = 'btn-danger softkeys__btncmd'
                            break;

                        default:
                            if (button.substr(0, 5) == '<span') {
                                character = button;
                                var func = LCase(Field(Field(button, '>', 2), '<', 1))
                                if (func == 'return' || func == 'tab' || func == 'space' || func == 'delete' || func == 'clear' || func == 'accept' || func == 'cancel') type = func; else type = 'symbol'
                            } else {
                                character = button;
                                type = 'letter';
                            }
                            break;
                    }

                    break;
            }

            obj.append('<' + settings.buttonWrapper + ' class="softkeys__btn ' + styleClass + '" data-type="' + type + '">' + character + '</' + settings.buttonWrapper + '>');
        },

        bindKeyPress = function (obj) {
            $(obj).data('unshift', false);

            obj.children(settings.buttonWrapper).on('click touchstart', function (event) {
                event.preventDefault();

                var character = '',
                    type = $(this).data('type'),
                    targetValue = $(settings.target).val(),
                    initialTargetValue = targetValue;

                switch (type) {
                    case 'capslock':
                        toggleCase(obj);
                        break;

                    case 'shift':
                        toggleCase(obj);
                        toggleAlt(obj);
                        $(obj).data('unshift', obj.hasClass('softkeys--caps'));
                        break;

                    case 'return':
                        character = '\n';
                        break;

                    case 'tab':
                        character = '\t';
                        break;

                    case 'space':
                        character = ' ';
                        break;

                    case 'delete':
                        targetValue = targetValue.substr(0, targetValue.length - 1);
                        break;

                    case 'clear':
                        targetValue = ''
                        break;

                    case 'symbol':
                        if (obj.hasClass('softkeys--alt')) {
                            character = $(this).children('span').eq(1).html();
                        } else {
                            character = $(this).children('span').eq(0).html();
                        }

                        if ($(obj).data('unshift')) {
                            if (obj.hasClass('softkeys--caps')) {
                                toggleCase(obj);
                                toggleAlt(obj);
                            }
                            $(obj).data('unshift', false);
                        }
                        break;

                    case 'letter':
                        character = $(this).html();

                        if (obj.hasClass('softkeys--caps')) {
                            character = character.toUpperCase();
                        }

                        if ($(obj).data('unshift')) {
                            if (obj.hasClass('softkeys--caps')) {
                                toggleCase(obj);
                                toggleAlt(obj);
                            }
                            $(obj).data('unshift', false);
                        }

                        break;

                    case 'accept':
                        if (settings.onAccept) settings.onAccept(targetValue)
                        break;

                    case 'cancel':
                        if (settings.onAccept) settings.onCancel(targetValue)
                        break;

                }

                targetValue = targetValue + character;

                if (initialTargetValue != targetValue) {
                    $(settings.target).focus().val(targetValue);
                    if (settings.onChange) settings.onChange(targetValue)
                }
            });
        },

        toggleCase = function (obj) {
            obj.toggleClass('softkeys--caps');
        },

        toggleAlt = function (obj) {
            obj.toggleClass('softkeys--alt');
        };

    return this.each(function () {
        for (var i = 0; i < settings.layout.length; i++) {
            createRow($(this), settings.layout[i]);
        }

        bindKeyPress($(this));
    });
};

// ================================================== jQuery.keypad  ====================================================
// ================================================== jQuery.keypad  ====================================================
// ================================================== jQuery.keypad  ====================================================
// 
// This was butchered from jQuery.numpad - https://github.com/kabachello/jQuery.NumPad/commit/1a7e955038932251f4efa282ff18fe504d3df442
// License: MIT - Copyright (c) 2014-2015 almasaeed2010

(function ($) {
    $.fn.keypad = function (options) {
        options = $.extend({}, $.fn.keypad.defaults, options);
        var id = 'kypd' + $('.kypd-wrapper').length + 1;
        var standardKbd = typeof options.layout === 'string' || options.layout instanceof String;

        if (standardKbd) {
            id = "keypad_" + options.layout.replace("+", "Plus");

            if (options.layout == 'hex+') {
                options.layout = [['1', '2', '3', '4', '.', 'Accept'], ['5', '6', '7', '8', '-', 'Cancel'], ['9', '0', 'A', 'B', '_', 'Clear'], ['C', 'D', 'E', 'F', 'Space', 'Delete']];

            } else if (options.layout == 'hex') {
                options.layout = [['1', '2', '3', '4', 'Accept'], ['5', '6', '7', '8', 'Cancel'], ['9', '0', 'A', 'B', 'Clear'], ['C', 'D', 'E', 'F', 'Delete']]
            } else if (options.layout == 'integer+') {
                options.layout = [['1', '2', '3', '.', 'Accept'], ['4', '5', '6', '-', 'Cancel'], ['7', '8', '9', '_', 'Clear'], ['<span style="width:9.2em">0</span>', 'Space', 'Delete']]
            } else if (options.layout == 'integer') {
                options.layout = [['1', '2', '3', 'Accept'], ['4', '5', '6', 'Cancel'], ['7', '8', '9', 'Clear'], ['<span style="width:9.2em">0</span>', 'Delete']]
            } else if (options.layout == 'real') {
                options.layout = [['1', '2', '3', 'Accept'], ['4', '5', '6', 'Cancel'], ['7', '8', '9', 'Clear'], ['<span style="width:6em">0</span>', '.', 'Delete']]
            } else {
                return //  use native keyboard
                id = "keypad_fullkeyboard";
                options.layout = [
                    [['1', '!'], ['2', '@'], ['3', '#'], ['4', '$'], ['5', '%'], ['6', '^'], ['7', '&amp;'], ['8', '*'], ['9', '('], ['0', ')'], 'Accept'],
                    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'Cancel'],
                    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', [';', ':',], 'Clear'],
                    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', [',', '&lt;'], ['.', '&gt;'], 'Delete'],
                    [['+', '['], ['-', ']'], '<span style="width: 285px">Space</span>', ["'", '&quot;'], ['/', '?']]
                ]
            }
        }


        // loop on each control we are attached to
        return this.each(function () {
            $(this).attr("readonly", true);

            $(this).bind(options.openOnEvent, function () {
                kypd.open(options.target ? options.target : $(this));
            });

            // create keypad first time
            if ($('#' + id).length == 0) {
                var kypd = $('<div id="' + id + '" style="width:100%; height: 100%"></div>').addClass('kypd-wrapper');
                if (standardKbd) window['commonpads_' + id] = kypd;

                var modalContent = $('<div id="' + id + '_mc" class="modal-content kypd-modal-content"></div>')
                kypd.append(modalContent)

                var keyboard = $(options.keyboardTpl).addClass('kypd-keyboard');
                var display = $(options.displayTpl).addClass('kypd-display').attr('id', 'kypd-display').css('text-align', options.textAlign).attr('readonly', true);

                kypd.display = display;
                kypd.keyboard = keyboard;
                kypd.modalContent = modalContent;

                modalContent.append(display);
                modalContent.append(keyboard);

                kypd.append($(options.backgroundTpl).addClass('kypd-overlay').attr('id', 'kypd-overlay').click(function () {
                    kypd.close(false);
                }));

                if (options.onKeypadCreate) {
                    kypd.on('keypad.create', options.onKeypadCreate);
                }

                (options.appendKeypadTo ? options.appendKeypadTo : $(document.body)).append(kypd);

                $(keyboard).softkeys({
                    target: $(kypd.display), layout: options.layout,
                    onCancel: function () { kypd.close(false); },
                    onAccept: function () { kypd.close(true); },
                    onChange: function (newValue) {
                        if (kypd.targetIsInputTag) storeVal(kypd.target, newValue); else kypd.target.html(newValue);
                    },
                });

                kypd.trigger('keypad.create');

            } else {
                kypd = window['commonpads_' + id]
                if (!kypd) {
                    kypd = $('#' + id);
                    kypd.display = $('#' + id + ' input.kypd-display');
                }
            }

            kypd.close = function (acceptBtn) {
                var newValue = $(kypd.display).val()
                if (!acceptBtn) newValue = kypd.initialValue

                if (kypd.targetIsInputTag) storeVal(kypd.target, newValue); else kypd.target.html(newValue);

                kypd.hide('fast');
                if (acceptBtn) $(kypd.target).trigger("change");

                return kypd;
            }

            kypd.open = function (target, initialValue) {
                kypd.target = target
                kypd.targetIsInputTag = target.prop("tagName") == 'INPUT'

                if (initialValue) {
                    kypd.initialValue = initialValue
                } else {
                    if (kypd.targetIsInputTag) kypd.initialValue = formVar(target, true); else kypd.initialValue = target.text();
                }
                kypd.display.val(kypd.initialValue);

                kypd.show('fast');
                position(kypd.modalContent, options.position, options.positionX, options.positionY);
                return kypd;
            }
        });
    }

    function position(element, mode, posX, posY) {
        var x = 0;
        var y = 0;
        if (mode == 'fixed') {
            element.css('position', 'fixed');

            if (posX == 'left') {
                x = 0;
            } else if (posX == 'right') {
                x = $(window).width() - element.outerWidth();
            } else if (posX == 'center') {
                x = ($(window).width() / 2) - (element.outerWidth() / 2);
            } else if (posX == 'maximize') {
                return scaleIt(element)
            } else if ($.type(posX) == 'number') {
                x = posX;
            }
            element.css('left', x);

            if (posY == 'top') {
                y = 0;
            } else if (posY == 'bottom') {
                y = $(window).height() - element.outerHeight();
            } else if (posY == 'middle') {
                y = ($(window).height() / 2) - (element.outerHeight() / 2);
            } else if ($.type(posY) == 'number') {
                y = posY;
            }
            element.css('top', y);
        }
        //$(element).draggable()
        return element;
    }

    function scaleIt(element) {
        var width = $(element)[0].offsetWidth;
        var height = $(element)[0].offsetHeight;
        var windowWidth = $(document).outerWidth();
        var windowHeight = $(document).outerHeight();
        var r = Math.min(windowWidth / width, windowHeight / height)

        r = r - 0.2;
        if (r > 2) r = 2;

        $(element).css({
            '-webkit-transform': 'scale(' + r + ')',
            '-moz-transform': 'scale(' + r + ')',
            '-ms-transform': 'scale(' + r + ')',
            '-o-transform': 'scale(' + r + ')',
            'transform': 'scale(' + r + ')',
            'transform-origin': 'top left'
        });

        $(element).addClass('keypad_center');
        //$(element).draggable()
        return element;
    }

    $.fn.keypad.defaults = {
        target: false,
        textAlign: 'left',
        openOnEvent: 'click',
        backgroundTpl: '<div></div>',
        keyboardTpl: '<table></table>',
        displayTpl: '<input  />',
        appendKeypadTo: false,
        position: 'fixed',
        positionX: 'maximize', // center
        positionY: 'middle',
        onKeypadCreate: false,
        layout: 'integer'
    };

    // These defaults will be applied to all KeyPads within this document!
    $.fn.keypad.defaults.keyboard = '<div></div>';
    $.fn.keypad.defaults.backgroundTpl = '<div class="modal-backdrop in"></div>';
    $.fn.keypad.defaults.displayTpl = '<input type="text" class="form-control" />';
    $.fn.keypad.defaults.onKeypadCreate = function () { };
}
)(jQuery);

////// EOF //////