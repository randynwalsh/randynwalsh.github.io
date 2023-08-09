/* jsblibvt.js */

var firstTime = true;

// ================================================== VT100 ====================================================
// ================================================== VT100 ====================================================
// ================================================== VT100 ====================================================
function VT100(appendToParent) {
    if (this.used) { alert('Must be called with new keyword'); debugger }
    this.used = true;

    if (firstTime) {
        this.$jsbForm = $('#jsb')
    } else {
        // hide previous VT100 with .shadow()
        appendToParent = $(appendToParent)
        this.$jsbForm = $('<form id="jsb" class="jsb"></form>').appendTo(appendToParent)
        if (appendToParent.is('body')) this.$jsbForm.addClass("jsb")
    }

    this.$jsbForm.submit(onJsbFormSubmit);

    this.doJsbSubmit = function (validate) {
        if (validate && !parsleyIsValid()) return false;
        // must be last attach so all other events fire first
        this.rebind()
        this.$jsbForm.submit();
        return true;
    }

    this.unbind = function (validate) {
        this.$jsbForm.unbind("submit", onJsbFormSubmit);
    }

    this.hide = function () {
        this.$jsbForm.hide()
    }

    this.show = function () {
        this.$jsbForm.show()
    }


    this.shadow = function (dontHide) {
        this.activeElement = document.activeElement;
        // this.$jsbForm.unbind("submit", onJsbFormSubmit);

        if (!dontHide) $(this.$jsbForm).fadeTo('slow', .25)

        // rename all elements (to hide them from jQuery operations)
        this.$jsbForm.attr("id", "");
        this.$jsbForm.find("[id]").each(function (index) {
            $(this).attr("id", 'xEx_' + $(this).attr("id"));
            if ($(this).attr("name")) $(this).attr("name", 'xEx_' + $(this).attr("name"));
        });

        if ($('#popOutDIV').length) {
            $('#popOutDIV').attr("id", "priorPopOutDIV");
            this.priorPopOutDIV = $('#priorPopOutDIV')

            $('#overlay').attr("id", "prioroverlay");
            this.priorOverlay = $('#prioroverlay')

            this.priorDialog = $("[aria-describedby='popOutDIV']")
            $(this.priorDialog).attr("aria-describedby", "priorPopOutDIV")

            if (!dontHide) {
                $(this.priorPopOutDIV).hide();
                $(this.priorOverlay).hide()
                $(this.priorDialog).hide()
            }
        }

        this.onSwipedRight = onSwipedRight;
        this.onSwipedLeft = onSwipedLeft;
        this.onSwipedUp = onSwipedUp;
        this.onSwipedDown = onSwipedDown;
        this.onSwipeMove = onSwipeMove;
        this.enableSwipesNotScroll = enableSwipesNotScroll;
        this.capturingKeys = capturingKeys;
        this.hashChanges = hashChanges;
        this.jsbIgnoreHashChanges = jsbIgnoreHashChanges;
        this.jsbLocation = jsbLocation
        this.insideDialog = window.popOutDIV
        this.pendingResolve = window.pendingResolve
        this.pendingReject = window.pendingReject
        this.txtInputResolve = window.txtInputResolve
    }

    this.unShadow = function () {
        this.$jsbForm.attr("id", "jsb");
        $(this.$jsbForm).fadeTo('fast', 1)
        $(this.$jsbForm).css('opacity', 1)

        // rename elements back to their original id's names
        this.$jsbForm.find("[id]").each(function (index) {
            $(this).attr("id", $(this).attr("id").substring(4));
            if ($(this).attr("name")) $(this).attr("name", $(this).attr("name").substring(4));
        });

        this.$jsbForm.show()

        if ($('#popOutDIV').length) {
            $('#popOutDIV').dialog("close")
            $('#popOutDIV').attr("id", "priorPopOutDIV");
        }

        if (this.priorPopOutDIV) {
            $(this.priorDialog).show();
            $(this.priorDialog).attr("aria-describedby", "PopOutDIV")

            $(this.priorOverlay).show();
            $(this.priorOverlay).attr("id", "overlay");

            $(this.priorPopOutDIV).show();
            $(this.priorPopOutDIV).attr("id", "popOutDIV");
        }

        try {
            this.activeElement.focus()
        } catch (err) { }

        onSwipedRight = this.onSwipedRight;
        onSwipedLeft = this.onSwipedLeft;
        onSwipedUp = this.onSwipedUp;
        onSwipedDown = this.onSwipedDown;
        onSwipeMove = this.onSwipeMove;
        enableSwipesNotScroll = this.enableSwipesNotScroll;
        capturingKeys = this.capturingKeys;
        hashChanges = this.hashChanges;
        jsbIgnoreHashChanges = this.jsbIgnoreHashChanges;
        jsbLocation = this.jsbLocation
        pendingReject = this.pendingReject
        pendingResolve = this.pendingResolve
        txtInputResolve = this.txtInputResolve

        if (this.insideDialog) {
            this.insideDialog.killed = true;
            $(this.insideDialog).dialog("close")
        }

        //this.rebind()
        //this.cleanupKnockout()
        return this
    }

    this.remove = function () {
        this.$jsbForm.unbind("submit", onJsbFormSubmit);
        this.$jsbForm.remove()
    }

    this.rebind = function () {
        this.$jsbForm.unbind("submit", onJsbFormSubmit);
        this.$jsbForm.submit(onJsbFormSubmit);
    }

    this.ClearScreen = function (firstTime) {
        this.underlining = false
        this.blinking = false
        this.reversing = false
        this.blanking = false
        this.diming = false
        this.graphing = false
        this.cursorX = 0
        this.cursorY = 0
        this.curFG = 0
        this.curBG = 0
        this.tabStops = 10
        this.startNewDiv = 0
        this.leftEdge = 0
        this.divOpen = false
        this.fontSize = 22
        this.nestedHTML = 0
        this.UserPrint = []

        this.HtmlBuffer = "";
        this.captureBuffer = ""
        this.inFlush = false;
        this.headTags = [];
        this.leftOverBuffer = '';
        this.nextLoadI = 0;
        this.alreadyAppliedBindings = false

        if (!firstTime) this.$jsbForm.html('')

        // Main window?
        if (this === main_VT100) {
            hideStatusBar()
            jsbIgnoreHashChanges = false;
            mouseClick = 0;
            disableSwipes()

            // unbind knockout events
            if (window.ko) {
                ko.cleanNode(this.$jsbForm[0]);
                if (window.lastKOReady) { clearTimeout(lastKOReady); lastKOReady = null }
                this.alreadyAppliedBindings = false;
                koModel = {}
            }

            if (At_Session.Item(At_Request.UserNo) && At_Session.Item(At_Request.UserNo).IsAdmin && !inIframe()) {
                showAdminBar()
            } else {
                hideAdminBar()
            }

            doDocReady = true;
        }
    }

    this.cleanupKnockout = function () {
        this.alreadyAppliedBindings = false
        if (!window.ko || !window.ko.cleanNode) return;
        window.ko.cleanNode(this.$jsbForm[0]);
    }

    this.showOverlay = function (withText) {
        this.$jsbForm.append('<div id="overlay">' + CStr(withText) + '</div>');
    }

    this.removeOverlay = function () {
        this.$jsbForm.find('#overlay').remove();
    }

    this.Print = function () {
        if (!arguments.length) return;
        for (var i = 0; i < arguments.length; i++) {
            this.addToUserPrint(arguments[i]);
        }
    }

    this.Println = function () {
        for (var i = 0; i < arguments.length; i++) {
            this.addToUserPrint(arguments[i]);
        }
        this.addToUserPrint(crlf);
    }

    // local functions
    this.addToUserPrint = function (s1) {
        if (s1 == null) return;

        if (typeof s1 == "object") {

            if (isArray(s1)) {
                this.UserPrint.push("[")
                for (var i = s1[0] === undefined ? 1 : 0; i < s1.length; i++) {
                    this.addToUserPrint(s1[i]);
                    if (i == s1.length - 1) break;
                    else this.UserPrint.push(",")
                }
                return this.UserPrint.push("]")
            }

            if (isJSON(s1)) {
                return this.UserPrint.push(json2string(s1, true));
            }

            if (isXML(s1)) return this.UserPrint.push(xml2string(s1, true));

            if (s1.toString) return this.UserPrint.push(s1.toString());

            return this.UserPrint.push("[object]")
        }
        this.UserPrint.push(s1);
    }


    this.getCurrentStyle = function () {
        var Style = ""
        if (this.curBG != 0) {
            Style += "background-color:" + colors(this.curBG) + ";"
        }
        if (this.curFG != 0) {
            Style += "color:" + colors(this.curFG) + ";"
        }
        return Style
    }

    this.startANewDiv = function () {
        var Style = ""
        var id = ""

        if (this.HtmlBuffer) FlushHTML();

        if (this.startNewDiv == 2) {
            var YY = CStr(this.cursorY * 1.4) + "em;"
            var XX = CStr(CInt(this.cursorX * (this.fontSize / 2 + 2))) + "px;"
            id = "XY_" + this.cursorX + "_" + this.cursorY;
            $("#" + id).remove();

            Style = "position:absolute; top:" + YY + " left:" + XX
        }
        Style += " display:inline; " + this.getCurrentStyle()


        var html = this.stopCurrentDiv(false)

        html += "<div class='txtOutput' "
        if (id) html += "id='" + id + "' ";
        html += "style=\"" + Style + "\">"

        this.divOpen = this.startNewDiv
        this.leftEdge = this.cursorX
        html += startAttributes()

        this.startNewDiv = 0
        return html;
    }

    this.stopCurrentDiv = function (FakeStop) {
        var html = this.stopAttributes(FakeStop)
        if (this.divOpen) {
            html += "</div>";
            this.divOpen = 0
        }
        return html
    }

    this.hasStopAttributes = function () {
        if (this.underlining) return true;
        if (this.blinking) return true;
        if (this.reversing) return true;
        if (this.blanking) return true;
        if (this.diming) return true;
        return false;
    }

    this.stopAttributes = function (FakeStop) {
        var html = ""
        if (this.underlining) {
            html += "</u>";
            this.underlining = FakeStop
        }
        if (this.blinking) {
            html += "</blink>";
            this.blinking = FakeStop
        }
        if (this.reversing) {
            html += "</i>";
            this.reversing = FakeStop
        }
        if (this.blanking) {
            html += "</strike>";
            this.blanking = FakeStop
        }
        if (this.diming) {
            html += "</strong>";
            this.diming = FakeStop
        }
        return html
    }

    function startAttributes() {
        var html = ""
        if (this.underlining) {
            html += "<u>"
        }
        if (this.blinking) {
            html += "<blink>"
        }
        if (this.reversing) {
            html += "<i>"
        }
        if (this.blanking) {
            html += "<strike>"
        }
        if (this.diming) {
            html += "<strong>"
        }
        return html;
    }

    function colors(bg) {
        // transparent Aqua Black Blue Fuchsia Gray Green Lime Maroon Navy Olive Orange Purple Red Silver Teal White Yellow Window
        switch (bg) {
            case 0:
                return "Black" // black 
            case 1:
                return "Red" // red
            case 2:
                return "Green" // green
            case 3:
                return "Yellow" // yellow
            case 4:
                return "Blue" // blue
            case 5:
                return "Maroon" // magenta
            case 6:
                return "Aqua" // Aqua
            case 7:
                return "Navy" // cNavyyan
            case 8:
                return "Lime" // Lime
            case 9:
                return "Transparent" // Transparent
        }
        return "White" // white
    }


    this.setCursorX = function (NewX) {
        this.cursorX = NewX
        if (this.cursorX < 0) this.cursorX = 0;
    }

    this.setCursorY = function (NewY) {
        this.cursorY = NewY
        if (this.cursorY < 0) this.cursorY = 0;
    }

    this.TabStop = function (N) {
        // this.addToUserPrint subroutines.  The initial tabstop setting is 10.
        this.tabStops = N
        if (this.tabStops < 1) {
            this.tabStops = 8
        }
    }

    // This routine takes HtmlBuffer and puts it into the DOM (and clears HtmlBuffer)
    this.FlushHTML = function () {
        if (!this.UserPrint.length) return;

        var uPrint = this.UserPrint.join("");
        this.UserPrint = new Array;

        if (this.doingCapture) {
            this.captureBuffer += uPrint;
            uPrint = "";
        } else {
            this.removeOverlay()

            this.HtmlBuffer += convertPrint2Html(this, uPrint);

            this.HtmlBuffer += this.stopAttributes(true);
            if (this.divOpen) {
                this.HtmlBuffer += this.stopCurrentDiv(true);
                this.startNewDiv = 2;
            }

            this.nestedHTML = 0;
            if (this.HtmlBuffer) {
                this.htmlToDOM(this.HtmlBuffer, 'head', 'body')
                this.HtmlBuffer = '';
            }
        }
    }

    this.htmlToDOM = function (HtmlBuffer, head, body) {
        // parse <script> and <link> tags from <head>
        do {
            var ScriptI = InStr(0, HtmlBuffer, "<script src");
            var LinkI = InStr(0, HtmlBuffer, "<link ");

            if (ScriptI == -1 && LinkI == -1) break;
            if (LinkI == -1) LinkI = HtmlBuffer.length + 1;
            if (ScriptI == -1) ScriptI = HtmlBuffer.length + 1;

            if (ScriptI < LinkI) {
                var SI = ScriptI;
                var EndLinkI = InStr(SI, HtmlBuffer, "</script>") + 9
                if (EndLinkI < 9) EndLinkI = InStr(SI, HtmlBuffer, "/>") + 2
            } else {
                var SI = LinkI;
                var EndLinkI = InStr(SI, HtmlBuffer, "</link>") + 7
                if (EndLinkI < 7) EndLinkI = InStr(SI, HtmlBuffer, "/>") + 2
            }

            if (EndLinkI < 9) { debugger; EndLinkI = HtmlBuffer.length + 1; }

            this.headTags.push(Mid(HtmlBuffer, SI, EndLinkI - SI))
            HtmlBuffer = Left(HtmlBuffer, SI) + Mid(HtmlBuffer, EndLinkI)

        } while (true);

        this.leftOverBuffer += HtmlBuffer;

        if (this.inFlush) return;

        if (this.headTags.length) {
            this.inFlush = true;
            return this.loadNextRescource()
        }

        return this.finishFlush();
    }

    this.scrollToBottom = function () {
        var e = this.$jsbForm
        try {
            while (e.length) {
                if (scrollable(e)) {
                    $(e).addClass("scrollFix").scrollTop($(e)[0].scrollHeight).removeClass("scrollFix");
                    return
                }
                e = $(e).parent()
            }
        } catch (err) { }
    }

    this.finishFlush = function () {
        try {
            this.nextLoadI = 0;
            this.headTags = [];
            this.inFlush = false;
            var myFlush = this.leftOverBuffer;
            this.leftOverBuffer = ''

            // if (!this.$jsbForm[0])
            this.$jsbForm.append(myFlush);
            //this.$jsbForm[0].innerHTML += myFlush

        } catch (err) {

            if (err == "redirect") throw "redirect"

            // Try one child at a time
            var flushKids = $("<div>" + myFlush + "</div>").children()
            for (var i = 0; i < flushKids.length; i++) {
                try {
                    var childHtml = flushKids[i];
                    if (childHtml && childHtml.outerHTML) childHtml = childHtml.outerHTML;
                    this.$jsbForm.append(childHtml);

                } catch (err) {
                    err.message = "HTML Flush failed: " + err.message + " " + childHtml;
                    if (nestedInGo) throw err; else err2String(err, true);
                    return;
                }
            }
        }

        this.scrollToBottom()

        // Nothing has been clicked yet, make sure to reset all Button values
        try { $('.SubmitBtn[name],.Button[name]').val(""); } catch (err) { }
    }

    this.loadNextRescource = function () {
        var scriptlink = this.headTags[this.nextLoadI];
        if (Left(scriptlink, 5) == '<link') {
            var http = LTrim(dropLeft(LTrim(dropLeft(scriptlink, ' href')), '='))
        } else {
            var http = LTrim(dropLeft(LTrim(dropLeft(scriptlink, ' src')), '='))
        }
        http = Field(http, Left(http, 1), 2)
        var vt100 = this;

        loadFile(http, {}, function () {
            // Success
            vt100.nextLoadI += 1;
            if (vt100.nextLoadI < vt100.headTags.length) return vt100.loadNextRescource();
            vt100.finishFlush()

        }, function () {
            Alert('unable to load ' + http)
            vt100.nextLoadI += 1;
            if (vt100.nextLoadI < vt100.headTags.length) return vt100.loadNextRescource();
            vt100.finishFlush()
        })
    }


    function NextNum(S, SI) {
        var I, R = 0;

        SI++
        I = SI

        while (IsDigit(S[SI])) { R = R * 10 + S[SI] - '0'; SI++ }

        return {
            value: R,
            SI: SI
        }
    }

    function SkipTo(S, SI, SkipToChars) {
        SI++
        while (InStr(0, SkipToChars, S[SI]) == -1) {
            SI++
        }
        return SI
    }

    this.ClearScreen(firstTime);
    firstTime = false;
}


function scrollable(element) {
    var e = $(element);

    if ($(element).prop("tagName") == "HTML") return true;

    if (e.css('overflow') == 'scroll'
        || e.css('overflow') == 'auto'
        || e.css('overflow-y') == 'scroll'
        || e.css('overflow-y') == 'auto'
    ) {
        return true;
    } else {
        return false;
    }
}

// Convert JSB VT100 string to HTML
function convertPrint2Html(vt100, S) {
    if (!S) return "";

    var SI, I, CAsc, NumStart, VTChar;
    var html = [];

    S = S.split("");
    if (!vt100) vt100 = new VT100();

    for (SI = 0; SI < S.length; SI++) {
        CAsc = S[SI]
        if (vt100.nestedHTML > 0) {
            if (CAsc == c28) { //   S[SI + 1] == "<"
                vt100.nestedHTML++

            } else if (CAsc == c29) {
                vt100.nestedHTML -= 1

            } else if (CAsc == esc) {
                if (CAsc == S[SI + 1] == "*") {
                    SI++
                    ClearScreen()
                    html = []
                }

            } else {
                html.push(CAsc)
            }

        } else if (CAsc >= svm) {
            switch (CAsc) {
                case sm:
                    html.push("<sm>&prod;</sm>");
                    break;
                case am:
                    html.push("<am>&uarr;</am>");
                    break;
                case vm:
                    html.push("<vm>&rceil;</vm>");
                    break;
                case svm:
                    html.push("<svm>&bull;</svm>");
                    break;
            }
            vt100.setCursorX(vt100.cursorX + 1)

        } else if (CAsc >= " ") {
            if (vt100.startNewDiv) {
                html.push(vt100.startANewDiv(vt100))
            }

            // Need to escape certain characters for vt100.html
            switch (CAsc) {
                case " ":
                    if (S[SI + 1] == " ") {
                        html.push("&nbsp;")
                    } else {
                        html.push(" ")
                    };
                    break;
                case "&":
                    html.push("&amp;");
                    break;
                case "'":
                    html.push("&#8217;");
                    break;
                case "<":
                    html.push("&lt;");
                    break;
                case ">":
                    html.push("&gt;");
                    break;
                case "\"":
                    html.push("&quot;");
                    break;
                default:
                    html.push(CAsc);
                    break;
            }

            vt100.setCursorX(vt100.cursorX + 1)
        } else {
            switch (Seq(CAsc)) {
                case 8: // BackSpace
                    vt100.setCursorX(vt100.cursorX - 1)
                    vt100.startNewDiv = 2
                    break;

                case 11: // Up one line
                    vt100.setCursorY(vt100.cursorY - 1)
                    vt100.startNewDiv = 2
                    break;

                case 9: // Tab
                    while (vt100.tabStops > 0) {
                        html.push("&nbsp;")
                        vt100.setCursorX(vt100.cursorX + 1)
                        if (vt100.cursorX % vt100.tabStops == 0) {
                            break
                        }
                    }
                    break;

                case 13: // Carriage return
                    if (Seq(S[SI + 1]) == 10 && vt100.leftEdge == 0) {
                        html.push("<br />\r\n")
                        vt100.setCursorX(0)
                        vt100.setCursorY(vt100.cursorY + 1)
                        SI++
                    } else {
                        if (vt100.cursorX != 0) {
                            vt100.setCursorX(0)
                            vt100.startNewDiv = 2
                        }
                    }
                    break;

                case 10: // LineFeed
                    html.push("<br />\r\n")
                    if (Seq(S[SI + 1]) == 13 && vt100.leftEdge == 0) {
                        vt100.setCursorX(0)
                        vt100.setCursorY(vt100.cursorY + 1)
                        SI++
                    } else {
                        html.push(StrRpt("&nbsp;", vt100.cursorX));
                        vt100.setCursorY(vt100.cursorY + 1)
                        //vt100.startNewDiv = 2
                        break;
                    }
                    break;


                case 12:
                case 26: // Form Feed
                    ClearScreen()
                    html = []
                    break;

                case 7: // Bell
                    // ?? what to do??
                    break;


                case 28: // Beginning of vt100.html sequence
                    vt100.nestedHTML++
                    break;

                case 27: // Escape
                    SI++
                    var cc = S[SI];
                    switch (cc) {
                        case "[": // vt100 stuff
                            VTChar = S[SI + 1]
                            switch (true) {
                                case IsNumeric(VTChar):
                                    Num = NextNum(S, SI) // starts at SI + 1
                                    NumStart = Num.value;
                                    SI = Num.SI;

                                    if (S[SI] == "m") {
                                        switch (NumStart) {
                                            case 4: // vt100.reversing
                                                html.push(vt100.stopAttributes(false))
                                                vt100.reversing = !vt100.reversing
                                                html.push(vt100.startAttributes())
                                                break;

                                            case 24: // Underline 
                                                html.push(vt100.stopAttributes(false))
                                                vt100.underlining = !vt100.underlining
                                                html.push(vt100.startAttributes())
                                                break;

                                            case 5: // Blink
                                                if (!vt100.blinking) {
                                                    html.push(vt100.stopAttributes(false))
                                                    vt100.blinking = true
                                                    html.push(vt100.startAttributes())
                                                }
                                                break;

                                            case 25: // Blink off
                                                if (vt100.blinking) {
                                                    html.push(vt100.stopAttributes(false))
                                                    vt100.blinking = false
                                                    html.push(vt100.startAttributes())
                                                }
                                                break;

                                            case 7: // Reverse
                                                if (!vt100.reversing) {
                                                    html.push(vt100.stopAttributes(false))
                                                    vt100.reversing = true
                                                    html.push(vt100.startAttributes())
                                                }
                                                break;

                                            case 0: // Reverse off
                                                if (vt100.reversing) {
                                                    html.push(vt100.stopAttributes(false))
                                                    vt100.reversing = false
                                                    html.push(vt100.startAttributes())
                                                }
                                                break;

                                            case 30:
                                            case 31:
                                            case 32:
                                            case 33:
                                            case 34:
                                            case 35:
                                            case 36:
                                            case 37: // esc:"[31m"
                                                vt100.curFG = NumStart - 30
                                                vt100.startNewDiv = 1 // background change
                                                break;

                                            case 40:
                                            case 41:
                                            case 42:
                                            case 43:
                                            case 44:
                                            case 45:
                                            case 46:
                                            case 47:
                                                vt100.curBG = NumStart - 40
                                                vt100.startNewDiv = 1 // forground change
                                                break;
                                        }
                                    }
                                    break;

                                case VTChar == "A":
                                    if (vt100.cursorY > 0) {
                                        vt100.cursorY--
                                    }
                                    vt100.startNewDiv = 2
                                    break;

                                case VTChar == "B":
                                    vt100.setCursorY(vt100.cursorY + 1)
                                    vt100.startNewDiv = 2
                                    break;

                                case VTChar == "C":
                                    vt100.cursorX = vt100.cursorX + 1
                                    vt100.startNewDiv = 2
                                    break;

                                case VTChar == "D":
                                    if (vt100.cursorX > 0) {
                                        vt100.cursorX--
                                    }
                                    vt100.startNewDiv = 2
                                    break;

                                case VTChar == "H" || VTChar == "J":
                                    ClearScreen()
                                    html = []
                                    break;

                                case VTChar == "?":
                                    SI = vt100.SkipTo(S, SI, "zlh") // Cursor On/OFF
                                    break;
                            }
                            break;

                        case ")":
                            SI = SI + 2
                            vt100.graphing = true
                            break;

                        case "(":
                            SI = SI + 2
                            vt100.graphing = false
                            break;

                        case "H":
                            SI++
                            switch (S[SI]) {
                                case Chr(2):
                                    vt100.graphing = true
                                    break;

                                case Chr(33):
                                    vt100.graphing = false
                                    break;
                            }
                            break;

                        case "a":
                            // Goto cursor address
                            Num = NextNum(S, SI) // starts at SI + 1
                            SI = Num.SI;

                            vt100.setCursorY(Num.value)

                            if (S[SI] == "R") {
                                Num = NextNum(S, SI) // starts at SI + 1
                                SI = Num.SI;
                                vt100.setCursorX(Num.value)
                            }

                            vt100.startNewDiv = 2
                            html.push(vt100.startANewDiv(vt100))
                            break;

                        case "*":
                        case "+":
                        case ":":
                            ClearScreen()
                            html = []
                            break;

                        case "T":
                            // EraseToEOL()
                            break;

                        case "{":
                            // Move cursor to home position
                            vt100.cursorX = 0
                            vt100.cursorY = 0
                            vt100.startNewDiv = 2
                            break;

                        case "Y":
                        case "y":
                        case "k": // "k" is vt100
                            // Erase to end of screen with nulls
                            break;

                        case "t":
                        case "K": // "K" is vt100
                            // Erase to end of line with nulls
                            break;

                        case "G": // ESC G 0xFF
                            // Set the video Atrbute.
                            SI++
                            var CAtr = Seq(S[SI])

                            // 1-Blank, 2-Blink, 4-Reverse, 8-Underline, 16-GraphicsMode, 32-?, 64-var, 128-Protect
                            html.push(vt100.stopAttributes(false))

                            if (vt100.blanking != ((CAtr & 1) == 0)) {
                                vt100.blanking = !vt100.blanking
                            }
                            if (vt100.blinking != ((CAtr & 2) == 0)) {
                                vt100.blinking = !vt100.blinking
                            }
                            if (vt100.reversing != ((CAtr & 4) == 0)) {
                                vt100.reversing = !vt100.reversing
                            }
                            if (vt100.underlining != ((CAtr & 8) == 0)) {
                                vt100.underlining = !vt100.underlining
                            }
                            if (vt100.graphing != ((CAtr & 16) == 0)) {
                                vt100.graphing = !vt100.graphing
                            }
                            if (vt100.blanking != ((CAtr & 32) == 0)) {
                                vt100.blanking = !vt100.blanking
                            }
                            if (vt100.diming != ((CAtr & 64) == 0)) {
                                vt100.diming = !vt100.diming
                            }
                            //if (Protecting != ((CAtr & 128) == 0)) { Protecting = !Protecting }
                            html.push(vt100.startAttributes());
                            break;

                        case "=":
                            // Goto cursor address RC (y, x)
                            SI++;
                            vt100.setCursorY(CInt(CStr(Seq(S[SI]) - Seq(" "))))
                            SI++;
                            vt100.setCursorX(CInt(CStr(Seq(S[SI]) - Seq(" "))))
                            if (vt100.cursorX < 0) {
                                vt100.cursorX = 0
                            }
                            vt100.startNewDiv = 2
                            html.push(vt100.startANewDiv(vt100))
                            break;

                        case "z":
                            // Setup avt100.key
                            SI++;
                            I = (Seq(S[SI]) - Seq(" "))
                            if (I < 1) {
                                I = 1
                            }
                            if (I > 12) {
                                I = 12
                            }
                            break;

                        case "i":
                            // Move the cursor to next tab stop
                            vt100.setCursorX(vt100.cursorX + (vt100.tabStops - vt100.cursorX % vt100.tabStops))
                            vt100.startNewDiv = 2
                            break;

                        case "'":
                            // Set screen feature
                            SI++
                            break;

                        case "2":
                            SI++ // KbdLck on/off
                            break;

                        case "4":
                            SI++ // Aux on
                            break;

                        case "5":
                            SI++ // Aux Off
                            break;

                        case ">":
                            // Is vt100 a reset?
                            break;

                        default:
                            null;
                    }
                default:
                    null;
            }
        }
    }

    return html.join("");
}

function AtXY(Col, Row) {
    // Use the GotoXY function to return a character escape sequence 
    // used to position the cursor on the display form.  This
    // sequence is recongnized and used by the FrmPrint subroutine.
    // Col must be in the range 0..131
    // Row must be in the range 0..23
    if (Col < 0) {
        Col = 0
    }
    if (Row < 0) {
        Row = 0
    }

    return esc + "=" + Chr(Row + 32) + Chr(Col + 32)
}

function At(X) {
    // The At routine returns vt 100 control characters that perform the
    // indicated action.  The following table lists the publicvt100.codes
    // supported by the addToUserPrint routine.
    //
    // Wyse 50 definitions
    //
    switch (X) {
        case -1:
            return esc + "*" // Clear all to nulls
        case -2:
            return esc + "{" // Cursor Home
        case -3:
            return esc + "y" // Erase to end of page with nulls
        case -4:
            return esc + "t" // Erase to end of row with nulls
        case -5:
            return esc + "G2" // Start blinking
        case -6:
            return esc + "G0" // Stop blinking
        case -7:
            return esc + "+" // Protect on
        case -8:
            return esc + "'" // Protect off
        case -9:
            return Chr(8) // BackSpace
        case -10:
            return Chr(11) // Cursor Up
        case -11:
            return esc + "Gp" // Start dim
        case -12:
            return esc + "G0" // Stop dim
        case -13:
            return esc + "G4" // Start reverse
        case -14:
            return esc + "G0" // Stop reverse
        case -15:
            return esc + "G8" // Start underscore
        case -16:
            return esc + "G0" // Stop underscore
        case -17:
            return esc + "G<" // Start bold (Underscore + reverse!)
        case -18:
            return esc + "G0" // Stop bold
        case -19:
            return esc + "G1" // Start blank
        case -20:
            return esc + "G0" // Stop blank
        case -21:
            return esc + "+" // Protect mode on
        case -22:
            return esc + "'" // Protect mode off
        case -23:
            return esc + "G0" // Scroll up
        case -24:
            return esc + "G<" // Start bold
        case -25:
            return esc + "G0" // Stop bold
        case -26:
            return esc + "G0" // Delete one character
        case -27:
            return esc + "G0" // Insert one blank
    }
    return ""
}


