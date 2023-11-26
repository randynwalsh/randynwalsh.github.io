
// <ADD_Pgm>
async function JSB_TCL_ADD_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Args, Sum, Arg;

    Args = Split(Mid1(activeProcess.At_Sentence, Index1(activeProcess.At_Sentence, ' ', 1) + 1), ' ');
    Sum = 0;
    for (Arg of iterateOver(Args)) {
        Sum += CNum(Arg);
    }
    Println(Sum);
    clearSelect(odbActiveSelectList);
    return;
}
// </ADD_Pgm>

// <ADDD_Pgm>
async function JSB_TCL_ADDD_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Args, Sum, Arg;

    Args = Split(Mid1(activeProcess.At_Sentence, Index1(activeProcess.At_Sentence, ' ', 1) + 1), ' ');
    Sum = 0;
    for (Arg of iterateOver(Args)) {
        Sum += CNum(Arg);
    }
    Println(Sum);
    clearSelect(odbActiveSelectList);
    return;
}
// </ADDD_Pgm>

// <ADDX_Pgm>
async function JSB_TCL_ADDX_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Args, Sum, Arg;

    Args = Split(Mid1(activeProcess.At_Sentence, Index1(activeProcess.At_Sentence, ' ', 1) + 1), ' ');
    Sum = 0;
    for (Arg of iterateOver(Args)) {
        Sum += XTD(Arg);
    }
    Println(DTX(Sum));
    clearSelect(odbActiveSelectList);
    return;
}
// </ADDX_Pgm>

// <CATALOG_Pgm>
async function JSB_TCL_CATALOG_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var F_Dict, Fmd, Iname, Cname, Item, Pdef, L1, Spot;

    if (Not(isAdmin())) return Stop('You are not an administrator');

    var Ignorefilenotfound = false;
    var Dftallitems = true;
    var Help = [undefined, 'CT \<TableName\> \<itemnames\>'];

    // Include jsb_tcl __SHELL

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

    Fname = UCase(await JSB_BF_TRUETABLENAME(Tablename));
    if (await JSB_ODB_OPEN('DICT', Fname, F_Dict, function (_F_Dict) { F_Dict = _F_Dict })); else F_Dict = '';
    if (await asyncOpen('', 'MD', _fHandle => Fmd = _fHandle)); else return Stop(activeProcess.At_Errors);

    for (Iname of iterateOver(Inames)) {
        if (System(1) == 'js') {
            Cname = UCase(await JSB_BF_TRUETABLENAME(Tablename)) + '_' + UCase(Iname);
            if (Not(window[Cname])) {
                if (Not(F_Dict)) return Stop('File ', Fname, ' not found');
                if (await JSB_ODB_READ(Item, F_Dict, Fname + '.js', function (_Item) { Item = _Item })); else {
                    if (Len(activeProcess.At_Errors)) Errors[Errors.length] = activeProcess.At_Errors; else Errors[Errors.length] = 'Item ' + CStr(Iname) + ' not found.';
                    continue;
                }
            }
        } else {
            if (await JSB_ODB_READ(Item, F_Dict, CStr(Iname) + '.pcd', function (_Item) { Item = _Item })); else {
                if (await JSB_ODB_READ(Item, F_Dict, CStr(Iname) + '.pcd', function (_Item) { Item = _Item })) {
                    Errors[Errors.length] = 'Item ' + CStr(Iname) + ' not a PROGRAM file, or is not compiled.';
                } else {
                    Errors[Errors.length] = 'Item ' + CStr(Iname) + ' not found.';
                }
                continue;
            }
        }
        if (await JSB_ODB_READ(Pdef, Fmd, CStr(Iname), function (_Pdef) { Pdef = _Pdef })); else Pdef = '';
        L1 = LCase(Extract(Pdef, 1, 0, 0));
        if (Locate('cv', L1, 1, 0, 0, "", position => Spot = position)); else null;

        Pdef = Replace(Pdef, 1, Spot, 0, 'cv');
        Pdef = Replace(Pdef, 2, Spot, 0, Fname);
        Pdef = Replace(Pdef, 3, Spot, 0, Iname);

        if (await JSB_ODB_WRITE(CStr(Pdef), Fmd, CStr(Iname))); else return Stop(activeProcess.At_Errors);
        Println('Cataloged ', Fname, ' ', Iname);
    }

    if (!isEmpty(Errors)) Println(MonoSpace(Change(Errors, am, crlf)));
    return;
}
// </CATALOG_Pgm>

// <CC_Pgm>
async function JSB_TCL_CC_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Uservars, Rmlist, Tag, Fcache, Id, Key;

    if (System(1) != 'js' && Not(isAdmin())) return Stop('You are not an administrator');
    if (await asyncAttach('')); else Println(activeProcess.At_Errors);

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
    Uservars = At_Session.Item(userno());

    Rmlist = [undefined,];
    for (Tag of iterateOver(Uservars)) {
        if (Left(Tag, 7) == 'config ') Rmlist[Rmlist.length] = Tag;
    }
    for (Tag of iterateOver(Rmlist)) {
        delete Uservars[Tag]
    }
    At_Session.Item(userno(), Uservars);

    if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('jsb_config'), 'cachebuster')); else null;

    if (System(1) == 'js') {
        window.clearCaches();
        window.clearAllSessions();
        if (window.fileSystem) {
            if (await JSB_BF_MSGBOX('Do you wish to reset your database (delete all tables)?', 'Yes,*No') == 'Yes') {
                if (await JSB_BF_MSGBOX('Are you absolutely sure', 'Yes,*No') == 'Yes') {

                    if (await asyncDelete(await JSB_BF_FHANDLE('jsb_cache'), 'postloads')); else null;
                    if (await asyncDeleteTable('F/account_' + LCase(jsbAccount()))); else null;
                    if (await asyncDeleteTable('F/account_jsb')); else null;

                    window.localStorage.clear();
                    window.location.reload();
                    await At_Server.asyncPause(me);
                }
            }
        }

        Fcache = await JSB_BF_FHANDLE('', 'jsb_cache', true);
        if (await JSB_ODB_SELECT('', Fcache, '', '')); else return Stop(activeProcess.At_Errors);
        Id = readNext(odbActiveSelectList).itemid;
        if (CBool(Id)) {
            if (await JSB_BF_MSGBOX('Do you wish to clear the jsb_cache (postloads and deleted items)?', 'Yes,*No') == 'Yes') {
                if (await JSB_ODB_CLEARFILE(await JSB_BF_FHANDLE('jsb_cache'))); else await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
                window.location.reload();
            }
        } else {
            Print('No postloads exist in the cache and ');
        }
    }

    for (Key of iterateOver(At_Application.Item('KEYS'))) {
        if (Left(Key, 7) == 'config ') At_Application.Item(Key, undefined);
    }

    if (System(1) == 'aspx') {
        if (await JSB_ODB_ATTACHDB(At_Session.Item('ATTACHEDDATABASE'))); else {
            Println(activeProcess.At_Errors); // Clears table caches;
        }
    }

    Println('Caches cleared');
    return;
}
// </CC_Pgm>

// <CL_Pgm>
async function JSB_TCL_CL_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    clearSelect(odbActiveSelectList);
    Println('ACTIVE LIST CLEARED');

    return;
}
// </CL_Pgm>

// <CLEARFILE_Pgm>
async function JSB_TCL_CLEARFILE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S, Fname, Iname, Dictdata, Fhandle;

    if (Not(isAdmin())) return Stop('You are not an administrator');
    S = Trim(activeProcess.At_Sentence);
    Fname = Field(S, ' ', 2);
    Iname = Field(S, ' ', 3);

    Dictdata = '';
    if (UCase(Fname) == 'DICT' || UCase(Fname) == 'DATA') {
        Dictdata = UCase(Fname);
        Fname = Iname;
        Iname = Field(S, ' ', 4);
    }

    if (await JSB_ODB_OPEN(CStr(Dictdata), CStr(Fname), Fhandle, function (_Fhandle) { Fhandle = _Fhandle })) {
        if (await JSB_ODB_CLEARFILE(Fhandle)) return Stop(LTrim(CStr(Dictdata) + ' '), Fname, ' cleared.'); else return Stop(activeProcess.At_Errors);
    } else {
        return Stop(Fname, ' doesn\'t exist.');
    }

    return;
}
// </CLEARFILE_Pgm>

// <CLONEACCOUNT_Pgm>
async function JSB_TCL_CLONEACCOUNT_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Clonedfrom, Toaccount;

    // options aspx

    if (Not(isAdmin())) return Stop('You are not an administrator');

    Clonedfrom = Field(Field(activeProcess.At_Sentence, '(', 1), ' ', 2);
    if (Not(Clonedfrom)) { return Stop('cloneAccount {fromAccount} toAccount'); }

    Toaccount = Field(Field(activeProcess.At_Sentence, '(', 1), ' ', 3);
    if (Not(Toaccount)) {
        Toaccount = Clonedfrom;
        Clonedfrom = jsbAccount();
    }

    if (!(await JSB_BF_CLONEACCOUNT(Toaccount, CStr(Clonedfrom), function (_Toaccount) { Toaccount = _Toaccount }))) return Stop(activeProcess.At_Errors);

    return Stop('Account ', Toaccount, ' created and cloned from ', Clonedfrom);
}
// </CLONEACCOUNT_Pgm>

// <CLOSE_HTML_Pgm>
async function JSB_TCL_CLOSE_HTML_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    return At_Response.redirect(JsbRootAct() + '#close_html?ans=' + dropLeft(JSB_BF_URL(), '='));

    return;
}
// </CLOSE_HTML_Pgm>

// <CLS_Pgm>
async function JSB_TCL_CLS_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    Print(At(-1));
    clearSelect(odbActiveSelectList);
    // randy was here!

    return;
}
// </CLS_Pgm>

// <COMPARE_Pgm>
async function JSB_TCL_COMPARE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Sentence, Ptablename, Pdictdata, Ppos, _Options, Options2;
    var F_Pfile, Id, Sentence2, Stablename, Sdictdata, F_Sfile;
    var Trimspc, Ignorecomments, Removecomments, Showchanges, Showonlydifs;
    var Binary, Width, Howmuch, Cmp, Outmethod, Nochanges, Piname;
    var Itemidx, Lastid, Siname, Pitem, Sitem, Dobinary, I, Ans;
    var Bpitem, Bsitem, Z, P, S, Pl, Sl, J, Phdr, Shdr, Pau;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                // Compare two files program

                if (Not(isAdmin())) return Stop('You are not an administrator');

                activeProcess.At_Prompt = '';

                Sentence = Trim(activeProcess.At_Sentence);
                Sentence = dropLeft(CStr(Sentence), ' '); // Drop Compare
                Ptablename = fieldLeft(CStr(Sentence), ' ');
                Sentence = dropLeft(CStr(Sentence), ' '); // Drop PTableName
                if (UCase(Ptablename) == 'DICT') {
                    Pdictdata = 'DICT';
                    Ptablename = fieldLeft(CStr(Sentence), ' ');
                    Sentence = dropLeft(CStr(Sentence), ' '); // Drop PTableName;
                }

                if (isEmpty(Ptablename)) {
                    Println('COMPARE TableName Itemname(s) (Options,AutoInputResponse');
                    Println('   Options:');
                    Println('     Z)  output only changes');
                    Println('     T)  trim ALL spaces (excluding strings)');
                    Println('     I)  Ignore differences in comments');
                    Println('     R)  Remove comments (alters line numbering)');
                    Println('     W)  output tp 132 column wide paper');
                    Println('     C)  single column, changes shown');
                    Println('         TableName is base code, With File is new code');
                    Println('     D)  combines options TCIZ');
                    Println('     AutoInputResponse = list of ids, or (filename listofids');
                    return Stop();
                }

                Ppos = Index1(Sentence, '(', 1);
                if (Not(Ppos)) Ppos = Index1(Sentence, '[', 1);
                if (CBool(Ppos)) _Options = UCase(Mid1(Sentence, +Ppos + 1, 9999)); else _Options = '';
                Options2 = Field(_Options, ',', 2);
                _Options = Field(_Options, ',', 1);
                Sentence = Field(Sentence, '(', 1);
                Sentence = Field(Sentence, '[', 1);
                Sentence = RTrim(Sentence);

                if (await JSB_ODB_OPEN(CStr(Pdictdata), CStr(Ptablename), F_Pfile, function (_F_Pfile) { F_Pfile = _F_Pfile })); else {
                    Println('Primary file ', Ptablename, ' not found');
                    return Stop();
                }

                if (fieldLeft(CStr(Sentence), ' ') == '*') {
                    if (await JSB_ODB_SELECT('', F_Pfile, '', '')); else return Stop(activeProcess.At_Errors);
                    Sentence = dropLeft(CStr(Sentence), ' ');
                }


                while (true) {
                    Id = readNext(odbActiveSelectList).itemid;
                    if (CBool(Id)); else break
                    if (Not(true)) break;
                    Sentence = CStr(Sentence) + ' ' + CStr(Id);
                }

                if (isEmpty(Options2)) {
                    activeProcess.At_Prompt = 'With: ';
                    Sentence2 = await asyncInput(''); if (activeProcess.At_Echo) Println(Sentence2); FlushHTML();
                } else {
                    Sentence2 = Trim(Options2);
                }

                if (Mid1(Sentence2, 1, 1) == '(') {
                    Sentence2 = LTrim(Mid1(Sentence2, 2));
                    Stablename = fieldLeft(CStr(Sentence2), ' ');
                    Sentence2 = dropLeft(CStr(Sentence2), ' ');

                    if (UCase(Stablename) == 'DICT') {
                        Stablename = fieldLeft(CStr(Sentence2), ' ');
                        Sentence2 = dropLeft(CStr(Sentence2), ' ');
                        Sdictdata = 'DICT';
                    }
                } else {
                    Stablename = Ptablename;
                    Sdictdata = Pdictdata;
                }

                if (await JSB_ODB_OPEN(CStr(Sdictdata), CStr(Stablename), F_Sfile, function (_F_Sfile) { F_Sfile = _F_Sfile })); else {
                    Println('Secondary file ', Stablename, ' not found');
                    return Stop();
                }

                if (Index1(_Options, 'D', 1)) _Options = 'TCIFZ' + CStr(_Options);
                Trimspc = Index1(_Options, 'T', 1);
                Ignorecomments = Index1(_Options, 'I', 1);
                Removecomments = Index1(_Options, 'R', 1);
                Showchanges = Index1(_Options, 'C', 1);
                Showonlydifs = Index1(_Options, 'Z', 1);
                Binary = Index1(_Options, 'B', 1);
                if (Index1(_Options, 'S', 1)) Width = 80; else Width = 123;
                Howmuch = 2;
                Cmp = '';
                Outmethod = 1;
                if (Index1(_Options, 'A', 1)) Outmethod = 2;
                Sentence = Split(Sentence, ' ');
                Nochanges = 1;


            case "40":

                Itemidx = LBound(Sentence) - 1;
                for (Piname of iterateOver(Sentence)) {
                    Itemidx++;
                    Lastid = Null0(Itemidx) == UBound(Sentence);

                    Siname = Field(Sentence2, ' ', Itemidx);
                    if (isEmpty(Siname)) Siname = Piname;

                    if (await JSB_ODB_READ(Pitem, F_Pfile, CStr(Piname), function (_Pitem) { Pitem = _Pitem })); else {
                        Println(Piname, ' not found in ', Pdictdata, ' ', Ptablename);
                        continue;
                    }
                    if (await JSB_ODB_READ(Sitem, F_Sfile, CStr(Siname), function (_Sitem) { Sitem = _Sitem })); else {
                        Println(Siname, ' not found in ', Sdictdata, ' ', Stablename);
                        continue;
                    }

                    Dobinary = Binary;
                    if (Not(Dobinary)) {
                        for (I = 1; I <= 9; I++) {
                            if (Index1(Pitem, Chr(I), 1) || Index1(Sitem, Chr(I), 1)) {
                                Ans = await JSB_BF_MSGBOX(CStr(Piname) + ' appears to be a binary.  Do a binary compare?', '*Yes,No');
                                if (Ans == Chr(27) || isEmpty(Ans)) return Stop();
                                if (Ans == 'Yes') Dobinary = true;
                                break;
                            }
                        }
                    }

                    if (CBool(Dobinary)) {
                        Bpitem = STX(Pitem);
                        Bsitem = STX(Sitem);
                        Pitem = '';
                        Sitem = '';
                        if (Len(Bpitem) > Len(Bsitem)) Z = Len(Bpitem); else Z = Len(Bsitem);

                        var _ForEndI_26 = +Z;
                        for (I = 1; I <= _ForEndI_26; I += 32) {
                            P = CStr(P) + Mid1(Bpitem, I, 32);
                            S = CStr(S) + Mid1(Bsitem, I, 32);
                            Pl = '';
                            Sl = '';
                            for (J = 1; J <= 31; J += 2) {
                                Pl += Mid1(P, J, 2) + ' ';
                                Sl += Mid1(S, J, 2) + ' ';
                            }
                            Pitem += CStr(Pl) + am;
                            Sitem += CStr(Sl) + am;
                        }
                    }
                    Phdr = anchorEdit(CStr(Ptablename), CStr(Piname), CStr(Ptablename) + ' ' + CStr(Piname));
                    Shdr = anchorEdit(CStr(Stablename), CStr(Siname), CStr(Stablename) + ' ' + CStr(Siname));
                    await JSB_TCL_DOCOMPARE_Sub([undefined, Phdr, Shdr], Pitem, Sitem, Removecomments, Trimspc, Ignorecomments, Showchanges, Showonlydifs, Howmuch, Outmethod, Width, Nochanges, function (_P1, _Pitem, _Sitem, _Removecomments, _Trimspc, _Ignorecomments, _Showchanges, _Showonlydifs, _Howmuch, _Outmethod, _Width, _Nochanges) { Pitem = _Pitem; Sitem = _Sitem; Removecomments = _Removecomments; Trimspc = _Trimspc; Ignorecomments = _Ignorecomments; Showchanges = _Showchanges; Showonlydifs = _Showonlydifs; Howmuch = _Howmuch; Outmethod = _Outmethod; Width = _Width; Nochanges = _Nochanges });
                    Println(Phdr, Space(20), Shdr);
                    if (CBool(Nochanges)) continue;

                    if (Not(Lastid)) {
                        activeProcess.At_Prompt = 'Press return to continue';
                        Pau = await asyncInput(''); if (activeProcess.At_Echo) Println(Pau); FlushHTML();
                        Print(At(-1));
                    }
                }
                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </COMPARE_Pgm>

// <DOCOMPARE_Sub>
async function JSB_TCL_DOCOMPARE_Sub(ByRef_Header, ByRef_Pitem, ByRef_Sitem, ByRef_Removecomments, ByRef_Trimspc, ByRef_Ignorecomments, ByRef_Showchanges, ByRef_Showonlydifs, ByRef_Howmuch, ByRef_Outmethod, ByRef_Width, ByRef_Nochanges, setByRefValues) {
    // local variables
    var Project, Pnumatt, I, Snumatt, Ptokens, Att, Pline, Tpline;
    var Tline, Sum, Lnlen, Lncnt, Qt, Ch, C, Stokens, Sline, Map;
    var Line, Pos, Dum, Pstart, Sstart, Pend, Send, Resortmapping;
    var A, Wraplen, Equalline, Removedline, Addedline, Outputln;
    var Linebreak, Numhlines, Hlin, Lndiff, Leader, Mstart, Mend;
    var Midflag, Ln, Tmpln, Tmpln2, Println, Fullln, Outrec, Plncnt;
    var Slncnt;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                function exit(v) {
                    if (typeof setByRefValues == 'function') setByRefValues(ByRef_Header, ByRef_Pitem, ByRef_Sitem, ByRef_Removecomments, ByRef_Trimspc, ByRef_Ignorecomments, ByRef_Showchanges, ByRef_Showonlydifs, ByRef_Howmuch, ByRef_Outmethod, ByRef_Width, ByRef_Nochanges)
                    return v
                }
                Project = '';
                ByRef_Nochanges = false;

                if (InStr1(1, ByRef_Sitem, cr) || InStr1(1, ByRef_Sitem, lf)) {
                    ByRef_Sitem = Change(ByRef_Sitem, crlf, am);
                    ByRef_Sitem = Change(ByRef_Sitem, cr, am);
                    ByRef_Sitem = Change(ByRef_Sitem, lf, am);
                }
                if (InStr1(1, ByRef_Pitem, cr) || InStr1(1, ByRef_Pitem, lf)) {
                    ByRef_Pitem = Change(ByRef_Pitem, crlf, am);
                    ByRef_Pitem = Change(ByRef_Pitem, cr, am);
                    ByRef_Pitem = Change(ByRef_Pitem, lf, am);
                }
                ByRef_Pitem = Change(ByRef_Pitem, Chr(160), ' ');
                ByRef_Sitem = Change(ByRef_Sitem, Chr(160), ' ');

                ByRef_Pitem = Split(ByRef_Pitem, am);
                ByRef_Sitem = Split(ByRef_Sitem, am);

                // ***********************************************
                // REMOVE COMMENTS IF NECESSARY
                // ***********************************************
                if (CBool(ByRef_Removecomments)) {
                    Pnumatt = UBound(ByRef_Pitem);
                    var _ForEndI_32 = +Pnumatt;
                    for (I = 1; I <= _ForEndI_32; I++) {
                        if (Index1('!*', Mid1(Trim(ByRef_Pitem[I]), 1, 1), 1)) {
                            ByRef_Pitem = ByRef_Pitem.Delete(I);
                            Pnumatt = +Pnumatt - 1;
                            I = +I - 1;
                        }
                    }
                    Snumatt = UBound(ByRef_Sitem);
                    var _ForEndI_34 = +Snumatt;
                    for (I = 1; I <= _ForEndI_34; I++) {
                        if (Index1('!*', Mid1(Trim(ByRef_Sitem[I]), 1, 1), 1)) {
                            ByRef_Sitem = ByRef_Sitem.Delete(I);
                            Snumatt = +Snumatt - 1;
                            I = +I - 1;
                        }
                    }
                }
                // **********************************
                // Check for equality first
                // **********************************
                if (Null0(ByRef_Pitem) == Null0(ByRef_Sitem)) {
                    Println(ByRef_Header[1], ', ', ByRef_Header[2], '  Items are equal');
                    ByRef_Nochanges = true;
                    return exit(undefined);
                }
                if (CBool(ByRef_Trimspc)) {

                    if (Trim(ByRef_Pitem) == Trim(ByRef_Sitem)) {
                        Println(ByRef_Header[1], ', ', ByRef_Header[2], '  Items are equal');
                        ByRef_Nochanges = true;
                        return exit(undefined);
                    }
                }

                Pnumatt = UBound(ByRef_Pitem);
                Snumatt = UBound(ByRef_Sitem);


            case "100":
                // |-restart point for next checksum algorithm
                // **********************************
                // Reduce each line to a checksum for faster comparisons
                // **********************************

                Print('Pass 1 primary'); FlushHTML();
                Ptokens = [undefined,];
                var _ForEndI_39 = +Pnumatt;
                for (Att = 1; Att <= _ForEndI_39; Att++) {
                    Pline = ByRef_Pitem[Att];
                    if (CBool(ByRef_Ignorecomments)) {
                        Tpline = Trim(Pline);
                        if (Mid1(Tpline, 1, 1) == '*' || Mid1(Tpline, 1, 1) == '!') Pline = '*';
                        Tline = Index1(Pline, ';*', 1);
                        if (CBool(Tline)) Pline = Mid1(Pline, 1, Tline);
                        Tline = Index1(Pline, '; *', 1);
                        if (CBool(Tline)) Pline = Mid1(Pline, 1, Tline);
                        Tline = Index1(Pline, ';!', 1);
                        if (CBool(Tline)) Pline = Mid1(Pline, 1, Tline);
                        Tline = Index1(Pline, '; !', 1);
                        if (CBool(Tline)) Pline = Mid1(Pline, 1, Tline);
                    }
                    Sum = 0;
                    Lnlen = Len(Pline);
                    if (CBool(ByRef_Trimspc)) {
                        Lncnt = 0;
                        Qt = '';
                        var _ForEndI_47 = +Lnlen;
                        for (Ch = 1; Ch <= _ForEndI_47; Ch++) {
                            C = Mid1(Pline, Ch, 1);
                            if (isEmpty(Qt)) {
                                if (C != ' ') {
                                    Lncnt = +Lncnt + 1;
                                    Sum = +Sum + Seq(C) * +Lncnt;
                                }
                                if (Index1('"' + '\'', C, 1)) Qt = C;
                            } else {
                                if (Null0(C) == Null0(Qt)) Qt = '';
                                Lncnt = +Lncnt + 1;
                                Sum = +Sum + Seq(C) * +Lncnt;
                            }
                        }
                        Sum = +Sum + +Lncnt;
                    } else {
                        var _ForEndI_52 = +Lnlen;
                        for (Ch = 1; Ch <= _ForEndI_52; Ch++) {
                            Sum = +Sum + Seq(Mid1(Pline, Ch, 1)) * +Ch;
                        }
                        Sum = +Sum + +Lnlen;
                    }
                    Ptokens[Att] = Sum;
                }
                Print('secondary');
                Stokens = [undefined,];
                var _ForEndI_53 = +Snumatt;
                for (Att = 1; Att <= _ForEndI_53; Att++) {
                    Sline = ByRef_Sitem[Att];
                    if (CBool(ByRef_Ignorecomments)) {
                        Tpline = Trim(Sline);
                        if (Mid1(Tpline, 1, 1) == '*' || Mid1(Tpline, 1, 1) == '!') Sline = '*';
                        Tline = Index1(Sline, ';*', 1);
                        if (CBool(Tline)) Sline = Mid1(Sline, 1, Tline);
                        Tline = Index1(Sline, '; *', 1);
                        if (CBool(Tline)) Sline = Mid1(Sline, 1, Tline);
                        Tline = Index1(Sline, ';!', 1);
                        if (CBool(Tline)) Sline = Mid1(Sline, 1, Tline);
                        Tline = Index1(Sline, '; !', 1);
                        if (CBool(Tline)) Sline = Mid1(Sline, 1, Tline);
                    }
                    Lnlen = Len(Sline);
                    Sum = 0;
                    if (CBool(ByRef_Trimspc)) {
                        Lncnt = 0;
                        Qt = '';
                        var _ForEndI_61 = +Lnlen;
                        for (Ch = 1; Ch <= _ForEndI_61; Ch++) {
                            C = Mid1(Sline, Ch, 1);
                            if (isEmpty(Qt)) {
                                if (C != ' ') {
                                    Lncnt = +Lncnt + 1;
                                    Sum = +Sum + Seq(C) * +Lncnt;
                                }
                                if (Index1('"' + '\'', C, 1)) Qt = C;
                            } else {
                                if (Null0(C) == Null0(Qt)) Qt = '';
                                Lncnt = +Lncnt + 1;
                                Sum = +Sum + Seq(C) * +Lncnt;
                            }
                        }
                        Sum = +Sum + +Lncnt;
                    } else {
                        var _ForEndI_66 = +Lnlen;
                        for (Ch = 1; Ch <= _ForEndI_66; Ch++) {
                            Sum = +Sum + Seq(Mid1(Sline, Ch, 1)) * +Ch;
                        }
                        Sum = +Sum + +Lnlen;
                    }
                    Stokens[Att] = Sum;
                }
            // **********************************
            // Make a list of lines that occur exactly once in both items
            // **********************************

            case "110":
                // 
                Print('. Pass 2'); FlushHTML();

                // MAP is matching lines between primary and secondary source

                Map = [undefined,];
                var _ForEndI_67 = +Pnumatt;
                for (Att = 1; Att <= _ForEndI_67; Att++) {
                    Line = Ptokens[Att];
                    Ptokens[Att] = '*' + CStr(Line);
                    if (Locate(Line, Ptokens, 0, 0, 0, "", position => Pos = position)); else {
                        if (Locate(Line, Stokens, 0, 0, 0, "", position => Pos = position)); else Pos = 0;
                        if (CBool(Pos)) {
                            Stokens[Pos] = '*' + CStr(Line);
                            if (Locate(Line, Stokens, 0, 0, 0, "", position => Dum = position)); else Map[Map.length] = [undefined, Att, Att, Pos, Pos];
                            Stokens[Pos] = Line;
                        }
                    }
                    Ptokens[Att] = Line;
                }
                // **********************************
                // Scan forward from each match point, including lines that are
                // equal (but not unique)
                // **********************************
                Print('. Pass 3'); FlushHTML();
                Att = 1;

                while (Not(Null0(Att) > UBound(Map))) {
                    Pstart = Map[Att][1];
                    Sstart = Map[Att][3];
                    Pend = Pstart;
                    Send = Sstart;

                    while (Null0(Pend) < Null0(Pnumatt) && Null0(Send) < Null0(Snumatt) && Null0(Ptokens[+Pend + 1]) == Null0(Stokens[+Send + 1])) {
                        Pend++;
                        Send++;
                    }

                    Map[Att] = [undefined, Pstart, Pend, Sstart, Send];
                    Att++;

                    while (Null0(Att) <= UBound(Map)) {
                        if (Null0(Map[Att][1]) <= Null0(Pend)) Map.DELETE(Att); else break
                    }
                }
                // **********************************
                // Scan backwards (same procedure as above)
                // **********************************
                Print('. Pass 4'); FlushHTML();
                Resortmapping = '';
                var _ForEndI_73 = UBound(Map);
                for (Att = 1; Att <= _ForEndI_73; Att++) {
                    if (Locate(Map[Att][4], Resortmapping, 1, 0, 0, 'AR', position => Pos = position)); else null;
                    Resortmapping = Insert(Resortmapping, 1, Pos, 0, Map[Att][4]);
                    Resortmapping = Insert(Resortmapping, 2, Pos, 0, Att);
                }
                var _ForEndI_75 = UBound(Map);
                for (Att = 1; Att <= _ForEndI_75; Att++) {
                    A = CInt(Extract(Resortmapping, 2, Att, 0));
                    Map[A][5] = Att;
                }
                Pend = 0;
                Send = 0;
                var _ForEndI_76 = UBound(Map);
                for (Att = 1; Att <= _ForEndI_76; Att++) {
                    Pstart = Map[Att][1];
                    Sstart = Map[Att][3];

                    while (Null0(Pstart) > +Pend + 1 && Null0(Sstart) > +Send + 1 && Null0(Ptokens[+Pstart - 1]) == Null0(Stokens[+Sstart - 1])) {
                        Pstart = +Pstart - 1;
                        Sstart = +Sstart - 1;
                    }
                    Map[Att][1] = Pstart;
                    Map[Att][3] = Sstart;
                    Pend = Map[Att][2];
                    Send = Extract(Resortmapping, 1, Map[Att][5], 0);
                }
                // **********************************
                // Where sections of text were swapped, treat smallest of the two sections
                // as differences (remove it from the match-up list)
                // **********************************
                Println('. Pass 5'); FlushHTML();
                Att = 1;

                while (Null0(Att) < UBound(Map)) {
                    if (Null0(Map[Att][3]) >= Null0(Map[+Att + 1][3])) {
                        if ((CNum(Map[Att][4]) - CNum(Map[Att][3])) > (CNum(Map[+Att + 1][4]) - CNum(Map[+Att + 1][3]))) {
                            Map.Delete(+Att + 1);
                        } else {
                            Map.Delete(Att);
                            if (Null0(Att) > 1) Att = +Att - 1;
                        }
                    } else {
                        Att = +Att + 1;
                    }
                }
                // **********************************
                // Test if there are non-white space differences
                // **********************************
                if (CBool(ByRef_Trimspc)) {
                    if (UBound(Map) == 1) {
                        if (Null0(Map[1][1]) == 1 && Null0(Map[1][2]) == Null0(Pnumatt) && Null0(Map[1][3]) == 1 && Null0(Snumatt) == Null0(Pnumatt)) {
                            Println();
                            Println('White space differences only');
                            ByRef_Nochanges = true;
                            return exit(undefined); // To calling program;
                        }
                    }
                }
                // **********************************
                // Setup for printer, screen, etc
                // **********************************

                Print(html('\<span style=\'font-family:monospace\'\>'));

                // **********************************
                // Init variables and print header
                // **********************************
                Wraplen = +ByRef_Width / 2 - 6;
                Equalline = '*' + StrRpt('=', +ByRef_Width - 10);
                Removedline = '*' + StrRpt('=', +ByRef_Width / 2 - 12) + ' %% ' + CStr(Project) + ' Removed %% ' + StrRpt('=', +ByRef_Width / 2 - 10);
                Addedline = '*' + StrRpt('=', +ByRef_Width / 2 - 12) + ' %% ' + CStr(Project) + ' Added %% ' + StrRpt('=', +ByRef_Width / 2 - 10);

                Outputln = 1;
                Linebreak = html('\<br\>');

                if (Not(ByRef_Showchanges)) {
                    Print(Linebreak);
                    Println(ByRef_Header[1], Space(20), ByRef_Header[2]);
                    Print(Linebreak);
                    Numhlines = UBound(ByRef_Header);
                    var _ForEndI_84 = +Numhlines;
                    for (Hlin = 3; Hlin <= _ForEndI_84; Hlin++) {
                        Println(Mid1(ByRef_Header[Hlin], 1, +ByRef_Width - 1));
                        Outputln = +Outputln + 1;
                    }
                    if (Null0(Numhlines) > 2) {
                        Println(Equalline);
                        Outputln = +Outputln + 1;
                    }

                    Outputln = +Outputln + 1;
                    Println(Equalline);

                    Outputln = +Outputln + 1;
                }
                Map.INSERT(1, [undefined, 0, 0, 0, 0]);
                Map[Map.length] = [undefined, +Pnumatt + 1, +Pnumatt + 1, +Snumatt + 1, +Snumatt + 1];

                var _ForEndI_86 = UBound(Map) - 1;
                for (Att = 1; Att <= _ForEndI_86; Att++) {
                    // Loops thru each item in match-up list
                    // ****
                    // **********************************
                    // Prints out a section of text common to both items (if whole item was selected)
                    // **********************************
                    Lndiff = CNum(Map[Att][3]) - CNum(Map[Att][1]);
                    Leader = StrRpt(' ', +ByRef_Width / 4 - 5);
                    Mstart = CNum(Map[Att][1]) + (Null0(Map[Att][1]) == '0');
                    Mend = Map[Att][2];
                    Midflag = 0;
                    if (CBool(ByRef_Showonlydifs) && Null0(Mstart) == 1 && Null0(Mend) > Null0(ByRef_Howmuch)) Mstart = +Mend - +ByRef_Howmuch;

                    var _ForEndI_88 = +Mend;
                    for (Ln = +Mstart; Ln <= _ForEndI_88; Ln++) {
                        if (CBool(ByRef_Showonlydifs) && Null0(Ln) >= +Mstart + +ByRef_Howmuch && Null0(Ln) <= +Mend - +ByRef_Howmuch) {
                            if (Not(Midflag)) {
                                Println(Leader, '      [identical text omitted]     ');
                                Outputln = +Outputln + 1;
                                if (Null0(ByRef_Outmethod) == 3 && Outputln % 60 == 0) Print(Chr(12));
                                Midflag = 1;
                            }
                        } else {
                            Tmpln = '000' + CStr(Ln);
                            Tmpln2 = '000' + CStr(+Ln + +Lndiff);
                            Println = ByRef_Pitem[Ln];
                            if (CBool(ByRef_Showchanges)) {
                                Fullln = Println;
                                Println = '';
                            } else {
                                Fullln = CStr(Leader) + Right(Tmpln, 3) + ' ' + Right(Tmpln2, 3) + ' ' + CStr(Println); // [1,WRAPLEN];
                            }
                            Println(Fullln);

                            Outputln = +Outputln + 1;
                            if (Null0(ByRef_Outmethod) == 3 && Outputln % 60 == 0) Print(Chr(12));
                        }
                    }
                    // **************************
                    // Build image of first column
                    // **************************
                    Pstart = CNum(Map[Att][2]) + 1;
                    Pend = CNum(Map[+Att + 1][1]) - 1;
                    Sstart = CNum(Map[Att][4]) + 1;
                    Send = CNum(Map[+Att + 1][3]) - 1;
                    Outrec = [undefined,];
                    Plncnt = 0;
                    if (Null0(Pend) >= Null0(Pstart)) {
                        if (CBool(ByRef_Showchanges)) {
                            Outrec[Outrec.length] = Removedline;
                            var _ForEndI_96 = +Pend;
                            for (Ln = +Pstart; Ln <= _ForEndI_96; Ln++) {
                                Outrec[Outrec.length] = ByRef_Pitem[Ln];
                            }
                            Plncnt = +Pend - +Pstart + 1;
                        } else {

                            Println(Equalline);
                            Outputln = +Outputln + 1;
                            if (Null0(ByRef_Outmethod) == 3 && Outputln % 60 == 0) Print(Chr(12));
                            var _ForEndI_98 = +Pend;
                            for (Ln = +Pstart; Ln <= _ForEndI_98; Ln++) {
                                Println = ByRef_Pitem[Ln];
                                Tmpln = '000' + CStr(Ln);
                                Tmpln = Right(Tmpln, 3) + ' ' + Mid1(Println, 1, Wraplen);

                                while (true) {
                                    Outrec[Outrec.length] = CStr(Tmpln) + StrRpt(' ', +Wraplen - Len(Tmpln) + 4);
                                    Plncnt = +Plncnt + 1;
                                    Println = Mid1(Println, +Wraplen + 1, 9999);
                                    if (isEmpty(Println)) break;
                                    Tmpln = '    ' + Mid1(Println, 1, Wraplen);
                                }
                            }
                        }
                    }
                    // **********************************
                    // Build image of second column
                    // **********************************
                    Slncnt = 0;

                    if (Null0(Send) >= Null0(Sstart)) {
                        if (CBool(ByRef_Showchanges)) {
                            Outrec[Outrec.length] = Addedline;
                            var _ForEndI_101 = +Send;
                            for (Ln = +Sstart; Ln <= _ForEndI_101; Ln++) {
                                Outrec[Outrec.length] = ByRef_Sitem[Ln];
                            }
                            Slncnt = +Send - +Sstart + 1;
                        } else {

                            Println(Equalline);
                            Outputln = +Outputln + 1;
                            if (Null0(ByRef_Outmethod) == 3 && Outputln % 60 == 0) Print(Chr(12));
                            var _ForEndI_103 = +Send;
                            for (Ln = +Sstart; Ln <= _ForEndI_103; Ln++) {
                                Println = ByRef_Sitem[Ln];
                                Tmpln = '000' + CStr(Ln);
                                Tmpln = Right(Tmpln, 3) + ' ' + Mid1(Println, 1, Wraplen);

                                while (true) {
                                    Slncnt = +Slncnt + 1;
                                    if (Null0(Slncnt) > Null0(Plncnt)) {
                                        Outrec[Slncnt] = StrRpt(' ', +Wraplen + 6) + CStr(Tmpln);
                                    } else {
                                        Outrec[Slncnt] = CStr(Outrec[Slncnt]) + '  ' + CStr(Tmpln);
                                    }
                                    Println = Mid1(Println, +Wraplen + 1, 9999);
                                    if (isEmpty(Println)) break;
                                    Tmpln = '    ' + Mid1(Println, 1, Wraplen);
                                }
                            }
                        }
                    }
                    // **********************************
                    // Print out differences in side by side columns
                    // **********************************

                    Plncnt = UBound(Outrec);
                    var _ForEndI_105 = +Plncnt;
                    for (Ln = 1; Ln <= _ForEndI_105; Ln++) {
                        Println(Outrec[Ln]);
                        Outputln = +Outputln + 1;
                        if (Null0(ByRef_Outmethod) == 3 && Outputln % 60 == 0) Print(Chr(12));
                    }
                    if (+Pend - +Pstart >= 0 || +Send - +Sstart >= 0) {
                        Println(Equalline);
                        Outputln = +Outputln + 1;
                        if (Null0(ByRef_Outmethod) == 3 && Outputln % 60 == 0) Print(Chr(12));
                    }
                    // ****
                } // End of loop thru each item in match-up list

                Print(html('\</span\>'));

                if (isGosubRtn(me)) continue atgoto; else return exit(undefined);
                return exit();


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </DOCOMPARE_Sub>

// <CONVERT_Pgm>
async function JSB_TCL_CONVERT_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Tokensearch, Casesensitive, R83, Identifierchars, Sstr;
    var Rstr, Slen, Rlen, Scnt, List, P, Ss, Rs, Iname, Sc, Item;
    var Changed, Spos, I, Ok, C;

    if (Not(isAdmin())) return Stop('You are not an administrator');

    // Replaces a string with a string

    if (Not(isAdmin())) return Stop('You are not an administrator');

    var Ignorefilenotfound = false;
    var Dftallitems = true;
    var Help = [undefined, 'CONVERT FILE ITEMLIST (T - TOKEN SEARCH, C - CASE SENSITIVE)'];

    // Include jsb_tcl __SHELL

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

    Tokensearch = (Index1(UCase(_Options), 'T', 1) || Index1(UCase(_Options), 'W', 1));
    Casesensitive = Index1(UCase(_Options), 'C', 1);
    R83 = Index1(UCase(_Options), 'R', 1);
    Identifierchars = '0123456789_ABCDEFGHIJKLMNOPQRSTUVWXYZ$@';
    if (CBool(R83)) Identifierchars += '.';

    Sstr = [undefined,];
    Rstr = [undefined,];
    Slen = [undefined,];
    Rlen = [undefined,];
    Scnt = 0;
    List = [undefined,];

    Println(Help);
    Print('Enter Search & Replace strings as STRING, or $HH (Hex)');
    Println();

    if (CBool(Casesensitive)) Print(' Case Sensitive');
    if (CBool(Tokensearch)) Print(' by Tokens');
    Println();


    while (true) {
        if (CBool(Casesensitive)) {
            if (CBool(Tokensearch)) P = 'C)ase-sensitive W)ord to search for : '; else P = 'C)ase-sensitive S)tring to search for : ';
        } else {
            if (CBool(Tokensearch)) P = 'N)on-case-sensitive W)ORD to search for : '; else P = 'N)on-case-sensitive S)tring to search for : ';
        }
        P += '(!! to abort this): ';
        activeProcess.At_Prompt = P;
        Ss = await asyncInput(''); if (activeProcess.At_Echo) Println(Ss); FlushHTML();
        if (Ss == '!!' || InStr1(1, Ss, '(!!')) return Stop();
        Ss = JSB_BF_UNESCAPESTRING(Ss, function (_Ss) { Ss = _Ss });
        if (Not(Casesensitive)) Ss = LCase(Ss)
        if (Not(!isEmpty(Ss))) break;
        activeProcess.At_Prompt = 'String to replace with (!! to abort this): ';
        Rs = await asyncInput(''); if (activeProcess.At_Echo) Println(Rs); FlushHTML();
        Rs = JSB_BF_UNESCAPESTRING(Rs, function (_Rs) { Rs = _Rs });
        if (Rs == '!!' || InStr1(1, Rs, '(!!')) return Stop();
        Scnt = +Scnt + 1;
        Sstr[Scnt] = Ss;
        Rstr[Scnt] = Rs;
    }

    if (Null0(Scnt) == '0') return Stop();

    for (Iname of iterateOver(Inames)) {
        var _ForEndI_24 = +Scnt;
        for (Sc = 1; Sc <= _ForEndI_24; Sc++) {
            Slen(Sc) = Len(Sstr[Sc]);
            Rlen(Sc) = Len(Rstr[Sc]);
        }

        if (await JSB_ODB_READ(Item, F_File, CStr(Iname), function (_Item) { Item = _Item })); else {
            Errors[Errors.length] = 'Item ' + CStr(Iname) + ' not found.';
            continue;
        }

        Changed = 0;
        var _ForEndI_26 = +Scnt;
        for (Sc = 1; Sc <= _ForEndI_26; Sc++) {
            Spos = 1;

            while (true) {
                if (CBool(Casesensitive)) {
                    I = Index1(Mid1(Item, Spos), Sstr[Sc], 1);
                } else {
                    I = Index1(LCase(Mid1(Item, Spos)), Sstr[Sc], 1);
                }
                if (Not(CBool(I))) break;
                I = +I + +Spos - 1;
                if (CBool(Tokensearch)) {
                    Ok = 1;
                    if (Null0(I) > 1) {
                        C = UCase(Mid1(Item, +I - 1, 1));
                        if (Index1(Identifierchars, C, 1)) Ok = 0;
                    }
                    C = UCase(Mid1(Item, +I + Len(Sstr[Sc]), 1));
                    if (Index1(Identifierchars, C, 1) && !isEmpty(C)) Ok = 0;
                } else {
                    Ok = 1;
                }

                if (CBool(Ok)) {
                    Changed = 1;
                    Item = Left(Item, +I - 1) + CStr(Rstr[Sc]) + Mid1(Item, +I + CNum(Slen(Sc)));
                    Spos = +I + CNum(Rlen(Sc));
                } else {
                    Spos = +I + 1;
                }
            }
        }
        if (CBool(Changed)) {
            List[List.length] = Iname;
            Println(anchorEdit(Fname, CStr(Iname)));
            await JSB_BF_TRASHIT(Fname, CStr(Iname));
            if (await JSB_ODB_WRITE(CStr(Item), F_File, CStr(Iname))); else return Stop(activeProcess.At_Errors);
        }
    }

    if (CBool(List)) {
        if (await asyncSaveList(List, Tablename)); else return Stop(activeProcess.At_Errors);
        Println('Change list saved to ', await JSB_BF_INPUTBUTTON(Tablename, 'gl ' + Tablename + cr));
    }

    return;
}
// </CONVERT_Pgm>

// <COPY_Pgm>
async function JSB_TCL_COPY_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Idtest, Idi, Itemi, Tjson, L, I, Xx;

    if (Not(isAdmin())) return Stop('You are not an administrator');

    var Ignorefilenotfound = false;
    var Dftallitems = false;
    var Help = [undefined, 'COPY TableName \<ITEMNAMES\> {(options)}'];
    Help[Help.length] = '    D) Delete source item after copying';
    Help[Help.length] = '    I) Item ID suppress';
    Help[Help.length] = '    O) Overwrite destination';
    Help[Help.length] = '    J) JSON - use JSON read and WRITE';
    Help[Help.length] = '    -J) not JSON copy';
    Help[Help.length] = '    -TableName) specify destination';
    Help[Help.length] = '    T) Terminal copy';
    Help[Help.length] = '       S or N) Suppress line numbers';
    Help[Help.length] = '       H) HTML Data';
    Help[Help.length] = '       M) Monospace';
    Help[Help.length] = '    B) BASIC compile items after copying';

    // Include jsb_tcl __SHELL

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

    if (CBool(Errors)) return Stop(activeProcess.At_Errors);

    var Ftrashcan = undefined;
    var Sendtofile = false;
    var Dstfnamewithdd = '';
    var Iname = '';
    var Copycnt = 0;
    var Notcopiedcnt = 0;
    var Asktooverwrite = true;
    var Dstfname = Trim(Field(_Options, '-', 2, true));
    _Options = UCase(Trim(Field(_Options, '-', 1, true)));
    var Dodelete = Index1(_Options, 'D', 1);
    var Suppressiid = Index1(_Options, 'I', 1);
    var Overwrite = Index1(_Options, 'O', 1);
    var Suppressno = (Index1(_Options, 'S', 1) || Index1(_Options, 'N', 1));
    var Toterm = Index1(_Options, 'T', 1);
    var Jsoncopy = (Index1(_Options, 'J', 1) && Index1(_Options, '-J', 1) == 0);
    var Htmlitems = Index1(_Options, 'H', 1);
    var Monospaceprint = Index1(_Options, 'M', 1);
    var Compileaftercopy = Index1(_Options, 'B', 1);
    var Renamenotcopy = LCase(Left(activeProcess.At_Sentence, 7)) == 'rename ';
    var Askedjson = Index1(_Options, '-J', 1);
    var Usersupplieddestid = '';
    var Copies = -1;
    var Issqlconnection = false;
    var Fileid = '';
    var Ddata = '';
    var F_Dfile = undefined;
    var Cacheditems = undefined;
    var Connectiontype = '';
    var Item = undefined;
    var Ans = '';

    Connectiontype = UCase(await JSB_BF_CONNECTIONTYPE());
    Issqlconnection = JSB_BF_TYPEOFFILE(F_File) == 'ado';

    if (isNumber(_Options) && _Options) {
        Copies = _Options;
        _Options = '';
    } else {
        Copies = -1;
    }

    Cacheditems = {};
    if (!Allitems) {
        Idi = LBound(Inames) - 1;
        for (Idtest of iterateOver(Inames)) {
            Idi++;
            if (Jsoncopy) {
                if (await JSB_ODB_READJSON(Item, F_File, CStr(Idtest), function (_Item) { Item = _Item })); else return Stop('Item ', Idtest, ' not found.');
            } else {
                if (await JSB_ODB_READ(Item, F_File, CStr(Idtest), function (_Item) { Item = _Item })); else return Stop('Item ', Idtest, ' not found.');
            }
            Cacheditems[CStr(Idtest) + 'x'] = Item;
            if (Null0(Idi) > 10) break;
        }
    }

    if (!Toterm) {
        Usersupplieddestid = '';
        if (!Dstfname) {
            activeProcess.At_Prompt = 'To (use !! to abort): ';
            Fileid = await asyncInput(''); if (activeProcess.At_Echo) Println(Fileid); FlushHTML();
            if (Fileid == '!!') return Stop();

            if (Renamenotcopy) {
                if (!Fileid) return Stop();
                if (DCount(Usersupplieddestid, ' ') != UBound(Inames)) return Stop('Item ID count mismatch');
            } else {
                if (!Fileid) {
                    Toterm = 1;
                    if (Renamenotcopy) return Stop();
                } else {
                    Fileid = Trim(Fileid);
                    if (Mid1(Fileid, 1, 1) == '(') {
                        Dstfname = Mid1(Field(Fileid, ' ', 1, true), 2, 99);
                        if (UCase(Dstfname) == 'DICT') {
                            Ddata = 'DICT';
                            Dstfname = Field(Fileid, ' ', 2, true);
                        } else {
                            Ddata = '';
                        }
                        Usersupplieddestid = Mid1(Fileid, activeProcess.Col2 + 1, 9999);
                    } else {
                        Ddata = Dictdata;
                        Dstfname = Tablename;
                        Usersupplieddestid = Fileid;
                    }
                }
            }
        }

        if (Dstfname) {
            Sendtofile = true;
            if (await JSB_ODB_OPEN(Ddata, Dstfname, F_Dfile, function (_F_Dfile) { F_Dfile = _F_Dfile })); else return Stop('Unable to open ', Ddata, ' ', Dstfname);
            Dstfnamewithdd = LTrim(Ddata + ' ') + Dstfname;;
        }
    }

    Itemi = LBound(Inames) - 1;
    for (Iname of iterateOver(Inames)) {
        Itemi++;
        var Ext = fieldRight(UCase(Iname), '.');
        var Hdoc = (Ext == 'HTM' || Ext == 'HTML');

        Item = Cacheditems[Iname + 'x'];

        var Itemisjson = Jsoncopy;

        if (isNothing(Item)) {
            if (Jsoncopy) {
                if (await JSB_ODB_READJSON(Item, F_File, Iname, function (_Item) { Item = _Item })); else {
                    if (await JSB_ODB_READ(Item, F_File, Iname, function (_Item) { Item = _Item })) {
                        Itemisjson = false;
                    } else {
                        Errors[Errors.length] = 'Item ' + Iname + ' not found. ';
                        continue;
                    }
                }
            } else {
                if (await JSB_ODB_READ(Item, F_File, Iname, function (_Item) { Item = _Item })); else {
                    Errors[Errors.length] = 'Item ' + Iname + ' not found. ';
                    continue;
                }
                Itemisjson = false;
            }
        }

        if (!Itemisjson && !Askedjson && !Toterm) {
            if (isValidJSon(Item) || Issqlconnection) {
                if (await JSB_ODB_READJSON(Tjson, F_File, Iname, function (_Tjson) { Tjson = _Tjson })) {
                    if (!HasTag(Tjson, 'ItemContent')) {
                        Ans = await JSB_BF_MSGBOX('JSON Data', 'You seem to have JSON data, do a JSON copy?', 'Yes,*No,Yes-All,No-All,Cancel');
                        if (Ans == 'Cancel' || !Ans) return Stop();
                        if (Ans == 'No' || Ans == 'No-All') Askedjson = true;
                        if (Ans == 'Yes-All') { Jsoncopy = true; Itemisjson = true; }
                        if (Ans == 'Yes-All' || Ans == 'Yes') { Item = Tjson; Itemisjson = true; }
                    }
                } else {
                    Askedjson = true;
                }
            } else {
                Askedjson = true;
            }
        }

        if (isCrlfFile(Iname)) {
            if (InStr1(1, Item, Chr(13)) || InStr1(1, Item, Chr(10))) {
                Item = Change(Item, Chr(13) + Chr(10), Chr(254));
                Item = Change(Item, Chr(13), Chr(254));
                Item = Change(Item, Chr(10), Chr(254));
            }
        }

        if (Toterm) {
            if (!Suppressiid) {
                Println(anchorEdit(Fname, Iname));
            }

            if (Hdoc || Htmlitems) {
                Item = Change(Item, am, crlf);
                Println(html(CStr(Item)));
            } else {
                if (isValidJSon(Item)) {
                    Item = CJSon(Item);
                    if (CBool(isArray(Item))) {
                        Item = CStr({ "format": Item }, true);
                        Item = '[' + dropLeft(CStr(Item), '[');
                        Item = dropRight(CStr(Item), ']') + ']';
                    } else {
                        Item = CStr(Item, true);
                    }
                    Item = Change(Item, am, '\\r\\n');
                    Item = Change(Item, crlf, am);
                }

                Item = Split(Item, am);
                I = LBound(Item) - 1;
                for (L of iterateOver(Item)) {
                    I++;
                    if (Monospaceprint) {
                        if (!Suppressno) Print(MonoSpace(Fmt(I, 'R%4 ')));
                        Println(MonoSpace(L));
                    } else {
                        if (!Suppressno) Print(Fmt(I, 'R%4 '));
                        Println(L);
                    }
                }
            }
            Println();
            // PRINTER OFF;
        }

        if (Dodelete) {
            if (await JSB_ODB_DELETEITEM(F_File, Iname)); else return Stop(activeProcess.At_Errors);
        }

        if (Sendtofile) {
            var Destiid = Field(Usersupplieddestid, ' ', 1, true);
            Usersupplieddestid = Mid1(Usersupplieddestid, activeProcess.Col2 + 1, 9999);
            if (!Destiid) Destiid = Iname;

            if (!Overwrite) {
                var Tstitem = '';
                if (await JSB_ODB_READV(Tstitem, F_Dfile, Destiid, 1, function (_Tstitem) { Tstitem = _Tstitem })) {
                    if (Asktooverwrite) {
                        Ans = await JSB_BF_MSGBOX('Overwrite', Destiid + ' exists on file, overwrite?', 'Yes,*No,Yes-All,No-All,Cancel');
                        if (Ans == 'Cancel' || !Ans) return Stop();
                        if (Ans == 'No' || Ans == 'No-All') {
                            if (Notcopiedcnt < 30) Println(Destiid, ' exists on file, item not copied.');
                            Notcopiedcnt++;
                            if (Ans == 'No-All') Asktooverwrite = false;
                            continue;
                        }
                        if (Ans == 'Yes-All') Overwrite = true;
                    } else {
                        if (Notcopiedcnt < 30) Println(Destiid, ' exists on file, item not copied.');
                        Notcopiedcnt++;
                        continue; // no-all;
                    }
                }
            }

            if (await JSB_ODB_READ(Xx, F_Dfile, Destiid, function (_Xx) { Xx = _Xx })) {
                if (Not(Ftrashcan)) Ftrashcan = await JSB_BF_FHANDLE('', 'TrashCan', true);
                if (await JSB_ODB_WRITE(CStr(Xx), Ftrashcan, Trim(Ddata + ' ' + Dstfname) + ' ' + Destiid)); else return Stop(activeProcess.At_Errors);
            }

            if (Itemisjson) {
                if (await JSB_ODB_WRITEJSON(Item, F_Dfile, Destiid)); else return Stop(activeProcess.At_Errors);
            } else {
                if (await JSB_ODB_WRITE(CStr(Item), F_Dfile, Destiid)); else return Stop(activeProcess.At_Errors);
            }

            if (Compileaftercopy) {
                await asyncTclExecute('BASIC ' + Dstfname + ' ' + Destiid);
            } else {
                if (!Suppressiid) Println(anchorEdit(Fname, Iname), ' copied to ', anchorEdit(Dstfnamewithdd, Destiid));
            }
        }

        Copycnt++;
        if (Copycnt == Copies) { clearSelect(odbActiveSelectList); break; }
        if (System(1) == 'js') FlushHTML();
    }

    if (Notcopiedcnt) {
        if (Notcopiedcnt == 1) {
            Print('One item NOT copied. ');
        } else {
            if (Notcopiedcnt >= 30) Println('... more items NOT copied');
            Print(Notcopiedcnt, ' item(s) NOT copied. ');
        }
        if (Copycnt) Println();
    }

    if (Copycnt) {
        if (Copycnt == 1) {
            Println('One item copied.');
        } else {
            Println(Copycnt, ' items copied.');
        }
    }
    return;
}
// </COPY_Pgm>

// <RENAME_Pgm>
async function JSB_TCL_RENAME_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    var S = activeProcess.At_Sentence;
    S = LTrim(dropLeft(S, ' '));
    var Opts = UCase(Field(S, '(', 2, true));
    S = RTrim(Field(S, '(', 1, true));
    if (DCount(S, ' ') < 2) return Stop('Rename FileName ItemName(s)');
    var Cmd = 'Copy ' + S + ' (DOI';
    return Chain(Cmd);
}
// </RENAME_Pgm>

// <CT_Pgm>
async function JSB_TCL_CT_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    var S = activeProcess.At_Sentence;
    S = LTrim(dropLeft(S, ' '));
    var Opts = UCase(Field(S, '(', 2, true));
    S = RTrim(Field(S, '(', 1, true));

    if (DCount(S, ' ') < 1) return Stop('CT FileName ItemName(s) (M-Monospace, H-Html, I-Supress ID, N-No Line numbers, J-JSON');

    var Cmd = 'Copy ' + S + ' (T';
    if (InStr1(1, Opts, 'J')) Cmd += 'JN';
    if (InStr1(1, Opts, 'S') || InStr1(1, Opts, 'N')) Cmd += 'S';
    if (InStr1(1, Opts, 'H')) Cmd += 'H';
    if (InStr1(1, Opts, 'I')) Cmd += 'I';
    if (InStr1(1, Opts, 'M')) Cmd += 'M';
    return Chain(Cmd);
}
// </CT_Pgm>

// <COUNT_Pgm>
async function JSB_TCL_COUNT_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Top, Columns, Dict, Fname, Filterby, Orderby, _Options;
    var Allitems, F, Cols, Cnt, Sl, X;

    if (Not(isAdmin())) return Stop('You are not an administrator');
    if (!(await JSB_BF_PARSESELECT(CStr(activeProcess.At_Sentence), '', Top, Columns, Dict, Fname, Filterby, Orderby, _Options, Allitems, F, undefined, undefined, undefined, function (_Top, _Columns, _Dict, _Fname, _Filterby, _Orderby, __Options, _Allitems, _F) { Top = _Top; Columns = _Columns; Dict = _Dict; Fname = _Fname; Filterby = _Filterby; Orderby = _Orderby; _Options = __Options; Allitems = _Allitems; F = _F }))) return Stop(activeProcess.At_Errors);
    if (Len(_Options) && isNumber(_Options)) Cols = CInt(_Options); else Cols = 4;

    Cnt = -1;
    if (JSB_BF_TYPEOFFILE(F) == 'ado' && Not(System(11))) {
        Cnt = F.Execute('Select Count(*) From [' + CStr(Fname) + ']' + (Filterby ? ' Where ' + CStr(Filterby) : ''));
    }

    if (Null0(Cnt) == -1) {
        if (await JSB_ODB_SELECTTO(LTrim(CStr(Top) + ' ') + Join(Columns, ' '), F, CStr(Filterby) + CStr(Orderby), Sl, function (_Sl) { Sl = _Sl })); else return Stop(activeProcess.At_Errors);

        X = CStr(getList(Sl, true), true);
        clearSelect(odbActiveSelectList);

        Cnt = DCount(X, am);
    }

    if (Not(Cnt)) return Stop('No Items');
    if (Null0(Cnt) == 1) return Stop('One Item');
    return Stop(Cnt, ' items');

    return;
}
// </COUNT_Pgm>

// <CREATEFILE_Pgm>
async function JSB_TCL_CREATEFILE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Sent, Opts, Fname, Ddata, Fhandle, _Protocol, Choices;

    if (Not(isAdmin())) return Stop('You are not an administrator');
    Sent = RTrim(Field(dropLeft(Trim(activeProcess.At_Sentence), ' '), '(', 1));
    Opts = LCase(Trim(Field(activeProcess.At_Sentence, '(', 2)));

    Fname = Field(Sent, ' ', 1);
    if (UCase(Fname) == 'DICT' || UCase(Fname) == 'DATA') {
        Ddata = UCase(Fname);
        Fname = dropLeft(CStr(Sent), ' ');
    }
    if (isEmpty(Fname)) {
        return Stop('createfile filename (options - ls, dsk, js)');
    }

    if (await asyncOpen(Ddata, Fname, _fHandle => Fhandle = _fHandle)) return Stop(Fname, ' already exists.');
    _Protocol = '';

    if (System(1) == 'js' && (!At_Session.Item('ATTACHEDDATABASE') || LCase(At_Session.Item('ATTACHEDDATABASE') == 'jsb'))) {
        if (isHTA()) {
            Choices = [undefined, 'ls:', 'js:'];;
        } else if (window.dotNetObj) {
            Choices = [undefined, 'ls:', 'dsk:', 'js:'];;
        } else if (window.fileSystem) {
            Choices = [undefined, 'ls:', 'dsk:', 'js:'];;
        } else {
            Choices = [undefined, 'ls:'];
            _Protocol = ' ';
        }

        if (InStr1(1, Fname, ':')) {
            _Protocol = LCase(Field(Fname, ':', 1)) + ':';
            Fname = dropLeft(CStr(Fname), ':');
            if (Locate(_Protocol, Choices, 0, 0, 0, "", position => { })); else return Stop('Valid protocols: ', Join(Choices, ','));
        } else {
            if (Opts == LCase('LocalStorage') || Opts == 'ls') _Protocol = 'ls:';
            if (Opts == LCase('Large Table') || Opts == 'dsk') _Protocol = 'dsk:';
            if (Opts == LCase('Small Table') || Opts == 'js') _Protocol = 'js:';
        }

        if ((isEmpty(Ddata) || Ddata == 'DATA') && Not(_Protocol)) {
            Choices = 'Small Table(single JSON record),*Large Table(dsk),LocalStorage';
            _Protocol = await JSB_BF_MSGBOX('Create File ' + CStr(Fname), 'File Type?', Choices);
            if (isEmpty(_Protocol) || _Protocol == Chr(27)) return Stop();
            _Protocol = Field(_Protocol, '(', 1);
            if (_Protocol == 'LocalStorage') _Protocol = 'ls:';
            if (_Protocol == 'Large Table') {
                _Protocol = 'dsk:'; // File System;
            }
            if (_Protocol == 'Small Table') {
                _Protocol = 'js:'; // Single JSON record for table;
            }
        }
    }

    if (await JSB_ODB_CREATEFILE(LTrim(_Protocol) + CStr(Ddata), CStr(Fname))); else return Stop(activeProcess.At_Errors);

    if (System(1) == 'js' && Not(Ddata)) {
        if (await JSB_ODB_CREATEFILE('dict ' + CStr(Fname))); else return Stop(activeProcess.At_Errors);
        Println('DICT ', Fname, ' created in ', Account());
    }

    Println(LTrim(CStr(Ddata) + ' ' + CStr(Fname)), ' created in ', Account());
    return;
}
// </CREATEFILE_Pgm>

// <DECODE_Pgm>
async function JSB_TCL_DECODE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S, O;

    // decode string - default to base64

    S = dropLeft(CStr(activeProcess.At_Sentence), ' ');
    O = fieldIfRight(CStr(S), ' (', CStr(1));
    if (CBool(O)) S = dropRight(CStr(S), ' (');
    if (Not(O)) O = 64;
    S = aesDecrypt(S, O);
    Println(S);
    clearSelect(odbActiveSelectList);
    return;
}
// </DECODE_Pgm>

// <DELETE_Pgm>
async function JSB_TCL_DELETE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Top, Columns, Dict, Fname, Filterby, Orderby, _Options;
    var Allitems, F, Iname, Isdosfile, Ftrashcan, Fdtrashcan, Dcnt;
    var Quiet, Tfname, Oktotrash, Kilo, Mega, Toobig, Nottrashed;
    var Cnt, Ans, Trashthisone, Lastbyte, Olditem, Cntr, Errs;
    var Msg;

    if (Not(isAdmin())) return Stop('You are not an administrator');

    if (!(await JSB_BF_PARSESELECT(CStr(activeProcess.At_Sentence), '', Top, Columns, Dict, Fname, Filterby, Orderby, _Options, Allitems, F, undefined, undefined, undefined, function (_Top, _Columns, _Dict, _Fname, _Filterby, _Orderby, __Options, _Allitems, _F) { Top = _Top; Columns = _Columns; Dict = _Dict; Fname = _Fname; Filterby = _Filterby; Orderby = _Orderby; _Options = __Options; Allitems = _Allitems; F = _F }))) return Stop();

    // P) Do not send to TRASHCAN
    // I) Supress Item-ID

    if (Not(Allitems) && Not(Filterby) && Not(System(11))) return Stop('Delete Table \<ItemNames | *\>');
    if (await JSB_ODB_SELECT(LTrim(CStr(Top) + ' ') + Join(Columns, ' '), F, CStr(Filterby) + CStr(Orderby), '')); else return Stop(activeProcess.At_Errors);

    Iname = readNext(odbActiveSelectList).itemid;
    if (CBool(Iname)); else return Stop();

    Isdosfile = JSB_BF_TYPEOFFILE(F) == 'dos';

    Ftrashcan = await JSB_BF_FHANDLE('', 'TrashCan', true);
    Fdtrashcan = await JSB_BF_FHANDLE('dict', 'TrashCan', true);

    Dcnt = 0;
    Quiet = InStr1(1, _Options, 'I');

    Tfname = LCase(await JSB_BF_TRUEFILENAME(CStr(Fname)));
    Oktotrash = (Tfname != 'tmp' && Tfname != 'trashcan' && InStr1(1, _Options, 'P') == 0);
    Tfname = LTrim(CStr(Dict) + ' ') + CStr(Tfname);

    Kilo = 1024;
    Mega = +Kilo * +Kilo;
    Toobig = 10 * +Mega;
    Nottrashed = [undefined,];

    for (Cnt = 1; (Cnt <= 100000) && !isEmpty(Iname); Cnt++) {
        if (Null0(Cnt) > 1) {
            Iname = readNext(odbActiveSelectList).itemid;
            if (CBool(Iname)); else break;
        }
        if (Null0(Cnt) > 100 && Not(Quiet)) {
            Quiet = true;
            Println('... more items');
        }
        if (Null0(Cnt) == 500 && CBool(Oktotrash)) {
            Ans = await JSB_BF_MSGBOX('500 items deleted so far, do you want to continue to send items to the trashcan?', 'Yes,No');
            if (isEmpty(Ans) || Ans == Chr(27)) return Stop('Stopped');
            if (Ans != 'Yes') Oktotrash = false;
        }

        Trashthisone = Oktotrash;
        if (CBool(Trashthisone)) {
            if (CBool(Isdosfile)) {
                // Limit to 10 megabytes
                if (await asyncReadBlk(F, Iname, Toobig, 1, _data => Lastbyte = _data)) Trashthisone = false;
            } else {
                if (isBinaryFile(Iname)) Trashthisone = false;
            }
        }

        if (CBool(Trashthisone)) {
            if (await JSB_ODB_READ(Olditem, F, CStr(Iname), function (_Olditem) { Olditem = _Olditem })); else {
                if (activeProcess.At_Errors) Println(activeProcess.At_Errors); else Println(Iname, ' not on file');
                continue;
            }

            // put a 2MB size limit on trashcan items
            if (Len(Olditem) < 2097152) {
                if (await asyncRead(Fdtrashcan, CStr(Tfname) + ' ' + CStr(Iname), "", 0, _data => Cntr = _data)); else Cntr = 0;
                Cntr++;
                if (await JSB_ODB_WRITE(CStr(Cntr), Fdtrashcan, CStr(Tfname) + ' ' + CStr(Iname))); else return Stop(activeProcess.At_Errors);
                if (await JSB_ODB_WRITE(CStr(Olditem), Ftrashcan, CStr(Iname) + '.' + CStr(Cntr))); else return Stop(activeProcess.At_Errors);
            }
        } else {
            if (CBool(Oktotrash)) Nottrashed[Nottrashed.length] = Iname;
        }

        if (await JSB_ODB_DELETEITEM(F, CStr(Iname))) {
            if (Not(Quiet)) Println(Iname, ' deleted');
            Dcnt++;
        } else {
            Errs = Replace(Errs, -1, 0, 0, activeProcess.At_Errors);
        }
    }

    if (CBool(Errs)) Println(Change(Errs, am, crlf));
    if (CBool(Oktotrash)) Msg = 'sent to trash can'; else Msg = 'deleted';
    if (Null0(Dcnt) > 1) Println(Dcnt, ' items ', Msg);
    if (Null0(Dcnt) == 1) Println('One item ', Msg);
    if (Not(Dcnt)) Println('No items deleted');
    if (CBool(Nottrashed)) Println('Items not sent to Trash: ', Join(Nottrashed, ', '));
    return;
}
// </DELETE_Pgm>

// <DELETEFILE_Pgm>
async function JSB_TCL_DELETEFILE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Newfilelist, Ddata, Fname, Filterby, Allfilelist, Filename;
    var Cnt, Displayfname, Q, Fhandle, Foundit;

    if (Not(isAdmin())) return Stop('You are not an administrator');

    var Sent = LTrim(RTrim(dropIfRight(dropLeft(CStr(activeProcess.At_Sentence), ' '), ' (')));
    var Filelist = Split(Sent, ' ', 4); // Split on spaces, but not inside strings (4)
    var _Options = LCase(LTrim(JSB_BF_RIGHTFIELD(CStr(activeProcess.At_Sentence), ' (')));
    var Quietly = InStr1(1, _Options, 'q');
    var Suppressprinting = InStr1(1, _Options, 's');

    var Listaccount = '';
    var Mustcontain = '';
    var Mustendwith = '';
    var Lenmustendwith = 0;
    var Muststartwith = '';
    var Lenmuststartwith = 0;

    if (Not(Filelist)) {
        if (Not(System(11))) return Stop('DeleteFile FileName ... (options', crlf, '    option S - suppress showing filenames', crlf, '    option Q - quietly (no prompting)');
        Filelist = getList(0);
    }

    // Combine Dict & Data with file name
    Newfilelist = [undefined,];
    Ddata = '';
    for (Fname of iterateOver(Filelist)) {
        Fname = LCase(Fname);
        if (Fname == 'dict') {
            Ddata = 'dict ';
            continue;
        }

        if (Fname == 'dict') {
            Ddata = '';
            continue;
        }

        Newfilelist[Newfilelist.length] = CStr(Ddata) + CStr(Fname);
        Ddata = '';
    }
    Filelist = Newfilelist;

    // check for filter's
    Newfilelist = [undefined,];
    for (Filterby of iterateOver(Filelist)) {
        if (Left(Filterby, 1) == '[' || Right(Filterby, 1) == ']') {
            if (Left(Filterby, 1) == '[') {
                if (Right(Filterby, 1) == ']') {
                    Mustcontain = LCase(Mid1(Filterby, 2, Len(Filterby) - 2));
                } else {
                    Mustendwith = LCase(Mid1(Filterby, 2));
                    Lenmustendwith = Len(Mustendwith);
                }
            } else {
                Muststartwith = LCase(Left(Filterby, Len(Filterby) - 1));
                Lenmuststartwith = Len(Muststartwith);
            }

            if (await JSB_ODB_LISTFILES(Allfilelist, function (_Allfilelist) { Allfilelist = _Allfilelist })); else return Stop(activeProcess.At_Errors);
            for (Filename of iterateOver(Allfilelist)) {
                var Lcfilename = LCase(Filename);

                if (Mustcontain) {
                    if (!InStrI1(1, Filename, Mustcontain)) Filename = '';
                } else if (Mustendwith) {
                    if (LCase(Right(Filename, Lenmustendwith)) != Mustendwith) Filename = '';
                } else if (Muststartwith) {
                    if (LCase(Left(Filename, Lenmuststartwith)) != Muststartwith) Filename = '';
                }

                if (CBool(Filename)) Newfilelist[Newfilelist.length] = Filename;
            }
        } else {
            Newfilelist[Newfilelist.length] = Filterby;
        }
    }
    Filelist = Newfilelist;

    if (Len(Filelist) > 1) {
        if (!Quietly) {
            if (await JSB_BF_MSGBOX('Delete these files?' + crlf + '    ' + Join(Filelist, crlf + '    '), 'Yes,*No') != 'Yes') return Stop();
        }
    }

    Cnt = 0;
    for (Displayfname of iterateOver(Filelist)) {
        Q = Left(Displayfname, 1);
        if (InStr1(1, '"\'' + '`', Q) && Right(Displayfname, 1) == Q) Filename = Mid1(Displayfname, 2, Len(Displayfname) - 2); else Filename = Displayfname;

        Ddata = Field(UCase(Filename), ' ', 1);
        var Partialdelete = (Ddata == 'DICT' || Ddata == 'DATA');
        if (Partialdelete) Filename = LTrim(Mid1(Filename, 6)); else Ddata = '';

        if (At_Session.Item('ATTACHEDDATABASE')) {
            // don't allow deletion via a QPTR
            if (await asyncOpen(Ddata, Filename, _fHandle => Fhandle = _fHandle)) {
                Println('Your are attached to the remote database: ', At_Session.Item('ATTACHEDDATABASE'));
                return Stop('and you have a local copy of ', Filename, '.  Delete your local copy first (Detach)');
            }
            if (await JSB_ODB_OPEN(CStr(Ddata), CStr(Filename), Fhandle, function (_Fhandle) { Fhandle = _Fhandle })) Foundit = true; else Foundit = false;
        } else {
            if (await asyncOpen(Ddata, Filename, _fHandle => Fhandle = _fHandle)) {
                Foundit = true;
            } else {
                if (await asyncOpen('data', CStr(Ddata) + ' ' + CStr(Filename), _fHandle => Fhandle = _fHandle)) {
                    Foundit = true;
                } else {
                    Foundit = false;
                }
            }
        }

        if (CBool(Foundit)) {
            if (await JSB_ODB_DELETEFILE(Fhandle)); else return Stop(activeProcess.At_Errors);
            Cnt++;

            if (Partialdelete) {
                if (!Suppressprinting) Println(Displayfname, ' deleted.');
            } else {
                if (Ddata == 'DICT') Ddata = 'DATA'; else Ddata = 'DICT';
                if (await JSB_ODB_OPEN(CStr(Ddata), CStr(Filename), Fhandle, function (_Fhandle) { Fhandle = _Fhandle })) { if (await JSB_ODB_DELETEFILE(Fhandle)); else return Stop(activeProcess.At_Errors); }
                if (!Suppressprinting) Println('Deleted ', Displayfname);
            }
        } else {
            Println(Displayfname, ' NOT FOUND.');
        }
    }

    if (Null0(Cnt) > 1) Println(Cnt, ' files deleted');
    return;
}
// </DELETEFILE_Pgm>

// <DEMOS_Pgm>
async function JSB_TCL_DEMOS_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Fdemos, Fdemobp, Fdictdemobp, Sl, Demos, Cacheisgood, Colors;
    var Itemid, Itemi, Bg, Btn, Srcitem, Localitem, Whatelse, Item;

    Print(At(-1), 'Fetching demo programs...');
    await asyncSleep(1);

    if (await JSB_ODB_OPEN('', 'jsb_demos', Fdemos, function (_Fdemos) { Fdemos = _Fdemos })); else return Stop(activeProcess.At_Errors, crlf, 'Unable to open jsb_demos.  This requires an internet connection');

    Fdemobp = await JSB_BF_FHANDLE('', 'demo_bp', true);
    Fdictdemobp = await JSB_BF_FHANDLE('dict', 'demo_bp', true);
    if (await JSB_ODB_WRITE('r-', Fdictdemobp, 'options.txt')); else return Stop(activeProcess.At_Errors);

    if (Cordova()) {
        if (await JSB_ODB_SELECTTO(CStr(undefined), Fdemos, '*a1 like \'[phonegap]\'', Sl, function (_Sl) { Sl = _Sl })); else return Stop(activeProcess.At_Errors);
    } else {
        if (await JSB_ODB_SELECTTO(CStr(undefined), Fdemos, '*a1 like \'[' + CStr(System(1)) + ']\'', Sl, function (_Sl) { Sl = _Sl })); else return Stop(activeProcess.At_Errors);
    }
    Demos = getList(Sl);
    Cacheisgood = {};
    Colors = [undefined, '#70a559', '#a55978', '#daa962', '#6f9286', '#796a86', 'blue', 'green', '#887b6a', '#5a4141', 'darkblue'];


    while (true) {
        Println(At(-1), Center(H3('Click on a DEMO program to run (may need to compile, be patient)')));
        Println();
        Print(html('\<div class="container"\>'));
        Print(html('\<div class="form-group row"\>'));

        Itemi = LBound(Demos) - 1;
        for (Itemid of iterateOver(Demos)) {
            Itemi++;
            Bg = Colors[+Itemi % UBound(Colors) + 1];
            Print(html('\<div class="col-xs-12 col-sm-5 col-md-4 col-lg-3" style="margin-bottom: 4px"\>'));
            Print(JSB_HTML_SUBMITBTN('btn', Itemid, Itemid, { "style": 'width: 99%; height: 50px; display: inline-block; margin: auto; background-color: ' + CStr(Bg) + '; color: white; min-width: 160px;' }));
            Print(html('\</div\>'));
        }

        Print(html('\</div\>\</div\>'));

        Println();
        Println();
        Print(JSB_HTML_SUBMITBTN('btn', 'Quit'));

        await At_Server.asyncPause(me);
        Btn = formVar('btn');

        if (Not(Btn != 'Quit')) break;
        if (Not(Cacheisgood[Btn])) {
            if (await JSB_ODB_READ(Srcitem, Fdemos, CStr(Btn), function (_Srcitem) { Srcitem = _Srcitem })); else {
                await JSB_BF_MSGBOX('I was unable to get the source code ' + CStr(activeProcess.At_Errors));
                continue;
            }

            // Already have a local compiled copy? If not, compile one
            if (await JSB_ODB_READ(Localitem, Fdemobp, CStr(Btn), function (_Localitem) { Localitem = _Localitem })); else Localitem = '';
            if (Null0(Localitem) != Null0(Srcitem)) {
                if (await JSB_ODB_WRITE(CStr(Srcitem), Fdemobp, CStr(Btn))); else return Stop(activeProcess.At_Errors);
                await asyncTclExecute('basic demo_bp ' + CStr(Btn));
            }
            Cacheisgood[Btn] = true;
        }

        Print(At(-1));
        if (await JSB_ODB_WRITE('cv' + am + 'demo_bp' + am + CStr(Btn), await JSB_BF_FHANDLE('md'), 'demopgm')); else return Stop(activeProcess.At_Errors);

        await asyncTclExecute('demopgm');
        Println();
        Print(JSB_HTML_SUBMITBTN('btnDemo', 'Back'), JSB_HTML_SUBMITBTN('btnDemo', 'view source'));
        await At_Server.asyncPause(me);

        Whatelse = formVar('btnDemo');

        if (Whatelse == 'view source') {
            if (await JSB_ODB_READ(Item, Fdemobp, CStr(Btn), function (_Item) { Item = _Item })); else return Stop(activeProcess.At_Errors);
            Item = Change(Item, am, crlf);
            Println(At(-1), MonoSpace(Item));
            Println();
            Println(JSB_HTML_SUBMITBTN('btn', 'Back'));
            await At_Server.asyncPause(me);
        }
    }

    Print(At(-1));

    return Chain('jsb');
}
// </DEMOS_Pgm>

// <DIVD_Pgm>
async function JSB_TCL_DIVD_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var A, B;

    // Divide decimal

    A = Field(activeProcess.At_Sentence, ' ', 2);
    B = Field(activeProcess.At_Sentence, ' ', 3);
    if (!isNumber(A) || !isNumber(B)) return Stop();
    Println(CInt(+A / +B), ' Remainder ', A % B);
    clearSelect(odbActiveSelectList);

    return;
}
// </DIVD_Pgm>

// <DIV_Pgm>
async function JSB_TCL_DIV_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var A, B;

    // Divide and show decimal places

    A = Field(activeProcess.At_Sentence, ' ', 2);
    B = Field(activeProcess.At_Sentence, ' ', 3);
    if (!isNumber(A) || !isNumber(B)) return Stop();
    Println(+A / +B);
    clearSelect(odbActiveSelectList);

    return;
}
// </DIV_Pgm>

// <DIVX_Pgm>
async function JSB_TCL_DIVX_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var A, B;

    // Divide hex

    A = XTD(Field(activeProcess.At_Sentence, ' ', 2));
    B = XTD(Field(activeProcess.At_Sentence, ' ', 3));
    if (!isNumber(A) || !isNumber(B)) return Stop();
    Println(DTX(CInt(+A / +B)), ' Remainder ', DTX(A % B));
    clearSelect(odbActiveSelectList);

    return;
}
// </DIVX_Pgm>

// <DOCS_Pgm>
async function JSB_TCL_DOCS_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // Category: ThisProgram; Title: Docs Page

    // TABS doesn't work in the js version (requires iframe to work)
    if (CBool(isPhoneGap()) || JSB_BF_MAXWIDTH() < 800) return Chain('Help');

    await JSB_TCL_TREEDOC_Sub('JSB_DOCS', '', function (_P1, _P2) { });
    return;
}
// </DOCS_Pgm>

// <TREEDOC_Sub>
async function JSB_TCL_TREEDOC_Sub(ByRef_Tablename, ByRef_Onegroup, setByRefValues) {
    // local variables
    var Isdocsfile, F_File, Catagories, Containername, Url, Onselect;
    var Tree, Tabs, _Html;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tablename, ByRef_Onegroup)
        return v
    }
    // Category: ThisProgram; Title: treeDoc

    // This routine reads all the items in the given table, looking for the Category word in the 1st 1000 characters, and extracting a title.

    // It then builds an R83 style Attribute, Value, Sub-Value structure for the @jsb_html.jsTree function.
    // The result is output to the display, and intermixed with javascript code to open/close new tabs with child IFRAMES

    Isdocsfile = UCase(ByRef_Tablename) == 'JSB_DOCS';
    if (await JSB_ODB_OPEN('', CStr(ByRef_Tablename), F_File, function (_F_File) { F_File = _F_File })); else return Stop(activeProcess.At_Errors);
    if (await JSB_ODB_READJSON(Catagories, F_File, '__treeCatagories', function (_Catagories) { Catagories = _Catagories })); else { Catagories = await JSB_TCL_BUILDCATAGORIES(F_File, Isdocsfile, ByRef_Onegroup, function (_F_File, _Isdocsfile, _ByRef_Onegroup) { F_File = _F_File; Isdocsfile = _Isdocsfile; ByRef_Onegroup = _ByRef_Onegroup }); }

    Containername = 'Tabs_' + CStr(Rnd(9999));
    if (await JSB_ODB_WRITE('temp', F_File, TTABLENAME)) {
        Url = JSB_BF_JSBROOTEXECUTETCLCMD('ed ' + CStr(ByRef_Tablename) + ' \'{id}\'');
        if (await JSB_ODB_DELETEITEM(F_File, TTABLENAME)); else return Stop(activeProcess.At_Errors);
    } else {
        Url = JSB_BF_JSBROOTEXECUTETCLCMD('view ' + CStr(ByRef_Tablename) + ' \'{id}\'');
    }

    // Note that the tree already has setup: selectedNode,  selectedID, selectedText
    Onselect = genEventHandler('leafSelected', CStr(Url), 3, CStr(Containername));

    Tree = JSONTree(CStr(Catagories));

    Tabs = JSB_HTML_TABS(Containername, 'Hint', '\<br /\>\<br /\>Click on a document from the tree structure on the left.', '', '', '', '');
    _Html = LAYOUT(Tabs, 'North', '', 'South', '', 'East', '', Tree, 'startsize:240, minSize:60');
    _Html = CStr(_Html) + CStr(Onselect);
    _Html = await JSB_TCL_DOCSTHEME(_Html, function (__Html) { _Html = __Html });
    Print(At(-1), _Html);

    if (hasParentProcess()) await At_Server.asyncPause(me); else {
        return Stop(); // pause program;
    }
    return exit();
}
// </TREEDOC_Sub>

// <DOCSTHEME>
async function JSB_TCL_DOCSTHEME(ByRef_Form, setByRefValues) {
    // local variables
    var Pages, Tcl, Pageheader, _Html, P, I, L, Url;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Form)
        return v
    }
    // Category: ThisProgram; Title: Theme

    Pages = ''; // Home,Home;Examples,Examples;Docs,Docs;Blog,Blog
    if (System(1) == 'js') {
        Tcl = ''; // if window.isPhoneGap() Then TCL = "jsb.html" Else TCL = "tcl.html";
    } else {
        Tcl = jsbRootAccount();
    }

    if (CBool(isAdmin()) || System(1) == 'js') { Pages = CStr(Pages) + ';' + CStr(Tcl) + ',TCL;ResetExamples,Reset Examples'; }
    if (CBool(isAdmin()) && System(1) != 'js') { Pages = CStr(Pages) + ';RebuildDocsTree,Rebuild Tree'; }
    if (JSB_BF_ISAUTHENTICATED() && System(1) != 'js') { Pages = CStr(Pages) + ';' + LogoutUrl() + ',Logout'; } else { Pages = CStr(Pages) + ';' + LoginUrl() + ',Login'; }

    Pageheader = 'JSON Basic (JSB)';

    _Html = Chr(28) + '\r\n\
            \<head\>\r\n\
               \<title\>JSon Basic\</title\>\r\n\
               \<style type="text/css"\>\r\n\
                    .folders { background-color: #bbb; list-style-type: none; padding: 0; margin: 0; border-radius: 7px; \r\n\
                        background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #d6d6d6), color-stop(0.4, #c0c0c0), color-stop(1,#a4a4a4)); \r\n\
                        /* margin: 10px 0 16px 0; */\r\n\
                        font-size: 0px;\r\n\
                        text-align:center;\r\n\
                        width:650px;\r\n\
                        margin-left:auto;\r\n\
                        margin-right:auto\r\n\
                    }\r\n\
                    body { background-color: lightgray; }\r\n\
                    .folders li:hover { background-color: #ddd; }    \r\n\
                    .folders li { font-size: 13px; font-weight: bold; display: inline-block; padding: 0.5em 1.5em; cursor: pointer; color: white; text-shadow: #f7f7f7 0 1px 1px; border-left: 1px solid #888; border-right: 1px solid #888; }\r\n\
                    .folders li { *display: inline !important; } /* IE7 only */\r\n\
                    .folders .selected { background-color: #444 !important; color: white; text-shadow:none; border-right-color: #aaa; border-left: none; box-shadow:inset 1px 2px 6px #070707; }  \r\n\
                \</style\>\r\n\
            \</head\>\r\n\
            \<div style="position: relative; height: 100%; widht: 100%; background-color: lightgray"\>\r\n\
               \<div id="header" style="font-size: large; height:18px; font-family: \'Brush Script MT\'; vertical-align: middle; text-align: center; color: darkblue; padding: 1px;"\>\r\n\
                   ' + CStr(Pageheader) + '\r\n\
               \</div\>\r\n\
               \<div id="navcontainer" style="position: relative; display: block; vertical-align: top; height:40px; padding: 2px; margin: 0px; "\>\r\n\
                   \<ul class="folders" \>' + Chr(10);
    P = Split(Pages, ';');
    var _ForEndI_11 = UBound(P);
    for (I = LBound(P); I <= _ForEndI_11; I++) {
        L = Split(P[I], ',');
        if (CBool(L[2])) {
            Url = L[1];
            if (!InStr1(1, Url, '//')) Url = JSB_BF_JSBROOTEXECUTETCLCMD(CStr(Url));
            _Html = CStr(_Html) + '\<li\>' + Chr(29) + CStr(Anchor(Url, L[2], { "target": '_self' })) + Chr(28) + '\</li\>' + Chr(10);
        }
    }
    _Html = CStr(_Html) + '\r\n\
                   \</ul\>\r\n\
               \</div\>\r\n\
               \<div style="position:absolute; left:0; width:100%; top:62px; bottom:0; background-color: lightgray;"\>\r\n\
                  ' + CStr(ByRef_Form) + '\r\n\
               \</div\>\r\n\
            \</div\>\r\n\
        ' + Chr(29);
    return exit(_Html);

    return exit();
}
// </DOCSTHEME>

// <REBUILDDOCSTREE_Pgm>
async function JSB_TCL_REBUILDDOCSTREE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Fx, Tree;

    // Category: ThisProgram; Title: Example Page

    if (Not(isAdmin())) return Stop('You must have admin permissions to rebuild the docs tree');
    if (await JSB_ODB_OPEN('', 'JSB_DOCS', Fx, function (_Fx) { Fx = _Fx })); else return Stop(activeProcess.At_Errors);
    if (await JSB_ODB_DELETEITEM(Fx, '_treeCatagories')); else return Stop(activeProcess.At_Errors);
    Tree = await JSB_TCL_BUILDCATAGORIES(Fx, true, false, function (_Fx, _P2, _P3) { Fx = _Fx }); // IsDocsFile, OneGroup

    if (await JSB_ODB_OPEN('', 'JSB_EXAMPLES', Fx, function (_Fx) { Fx = _Fx })); else return Stop(activeProcess.At_Errors);
    if (await JSB_ODB_DELETEITEM(Fx, '_treeCatagories')); else return Stop(activeProcess.At_Errors);
    Tree = await JSB_TCL_BUILDCATAGORIES(Fx, false, false, function (_Fx, _P2, _P3) { Fx = _Fx }); // IsDocsFile, OneGroup

    return At_Response.Redirect('DOCS');
}
// </REBUILDDOCSTREE_Pgm>

// <RESETEXAMPLES_Pgm>
async function JSB_TCL_RESETEXAMPLES_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Dfx;

    if (Not(isAdmin()) && System(1) != 'js') return Stop('You must have admin permissions to rebuild the docs tree');
    if (await JSB_ODB_OPEN('dict', 'JSB_DOCS', Dfx, function (_Dfx) { Dfx = _Dfx })); else return Stop(activeProcess.At_Errors);
    if (await JSB_ODB_CLEARFILE(Dfx)); else return Stop(activeProcess.At_Errors);
    return At_Response.Redirect('DOCS');
}
// </RESETEXAMPLES_Pgm>

// <DOS_Pgm>
async function JSB_TCL_DOS_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Cd, Bindir, S, Cmd, Ans, Path, Result, Errs, Bins, Exe;
    var Lcmd;

    var Rolemsg = (await asyncRpcRequest('ISAUTHENTICATED') ? '' : 'You must be logged in to view this page. ' + Anchor(CStr(await asyncRpcRequest('LOGINURL', '', function (_P1) { })), 'Click here to login'));
    if (Not(await asyncRpcRequest('ISADMIN'))) return Stop((Rolemsg ? Rolemsg : CStr(await asyncRpcRequest('USERNAME')) + ': You must be an admin of ' + Domain() + ' to use this program.'));

    Cd = await asyncRpcRequest('JSBROOTDIR');
    Cd = Change(Cd, 'file:///', '');
    Cd = Change(Cd, '/', '\\');
    Bindir = CStr(Cd) + 'bin\\';

    S = activeProcess.At_Sentence;
    S = LTrim(Field(dropLeft(CStr(S), ' '), '(', 1));
    if (CBool(S)) {
        Cd = Field(S, ';', 1);
        Cmd = LTrim(dropLeft(CStr(S), ';'));
    } else {
        Ans = await JSB_BF_MSGBOX('Which dir', '.,_database,js,css,archives,bin,' + Account() + ',jsb_dictionaries');
        switch (Ans) {
            case '':
                return Stop();
                break;

            case Chr(27):
                return Stop();

                break;

            case '.':
                break;

            case 'bin':
                Cd += 'bin\\';

                break;

            case 'app_data':
                Cd += 'app_data\\';

                break;

            case '_database':
                Cd += 'app_data\\_database\\';

                break;

            case Account():
                Cd += 'app_data\\_database\\' + Account() + '\\';

                break;

            case 'jsb_dictionaries':
                Cd += 'app_data\\_database\\' + Account() + '\\jsb_dictionaries\\';

                break;

            case 'js':
                Cd += 'jsb\\js\\';

                break;

            case 'css':
                Cd += 'jsb\\css\\';

                break;

            case 'archives':
                Path = await JSB_BF_TRUEFILENAME('archives');
                if (Left(Path, 2) == '.\\') {
                    Cd += Mid1(Path, 3);
                } else if (Mid1(Path, 2, 1) == ':') {
                    Cd = Path;
                } else {
                    Cd += 'app_data\\_database\\' + Account() + '\\' + CStr(Path);
                }

                break;

            case 'jsb':
                Cd += 'jsb\\';
        }
    }

    if (System(1) == 'js') {
        if (window.dotNetObj) {
            if (Not(window.dotNetObj.dnoValidPath(Cd))) {
                Cd = System(26);
                Cd = Change(Cd, 'file:///', '');
                Cd = Change(Cd, '/', '\\');
                Cd = dropRight(CStr(Cd), '\\');
            }
        }
    }

    // get a list of bin "exes"
    Result = await asyncRpcRequest('DOSEXECUTE', Cd, 'dir bin\\*.exe /b', Errs, function (_Cd, _P2, _Errs) { });

    Bins = [undefined,];
    for (Exe of iterateOver(Result)) {
        Bins[Bins.length] = LCase(Left(Exe, Len(Exe) - 4));
    }

    Print(Hidden('_historyName_', 'dos'));

    while (true) {
        if (isEmpty(Cmd)) {
            Print(JSB_HTML_SCRIPT('atTcl = true'));
            // Print @Hilight(@monoSpace(Cd):">"):" ":
            // Prompt ""
            activeProcess.At_Prompt = CStr(Cd) + '\> ';
            Cmd = await asyncInput(''); if (activeProcess.At_Echo) Println(Cmd); FlushHTML();
        }
        Lcmd = Field(LCase(JSB_BF_TRIMWS(CStr(Cmd))), ' ', 1);
        if (Lcmd == 'q' || Lcmd == 'end' || Lcmd == 'quit' || Lcmd == 'exit') break;
        if (Lcmd == 'cls') {
            Print(At(-1), Hidden('_historyName_', 'dos'));
        } else if (Lcmd == 'dirs') {
            Result = await JSB_TCL_GETSUBDIRECTORIES(Cd, Cd, InStr1(1, LCase(Cmd), '/s'), 0, function (_P3, _P4) { });
            if (CBool(Result)) Println(MonoSpace(Change(Result, am, crlf)));
        } else {
            if (Locate(Lcmd, Bins, 0, 0, 0, "", position => { })) Cmd = CStr(Bindir) + CStr(Cmd);
            Result = await asyncRpcRequest('DOSEXECUTE', Cd, Cmd, Errs, function (_Cd, _Cmd, _Errs) { });
            if (CBool(Result)) Println(MonoSpace(Change(Result, am, crlf)));
            if (CBool(Errs)) Println(MonoSpace(Errs));
        }
        Cmd = '';
    }
    return Stop();
}
// </DOS_Pgm>

// <GETSUBDIRECTORIES>
async function JSB_TCL_GETSUBDIRECTORIES(Cd, Dir, ByRef_Recurse, ByRef_Cnt, setByRefValues) {
    // local variables
    var Cmd, Result, Errs, Dirs, Sdir, Sdirs, Line;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Recurse, ByRef_Cnt)
        return v
    }
    if (System(1) == 'js') {
        if (Not(window.dotNetObj)) return exit([undefined,]);
    }

    if (Right(Dir, 1) != '\\') Dir = CStr(Dir) + '\\';
    Cmd = 'dir ' + CStr(Dir) + ' /ad/b';
    Result = await asyncRpcRequest('DOSEXECUTE', Cd, 'dir ' + CStr(Dir) + ' /ad/b', Errs, function (_Cd, _P2, _Errs) { });

    Dirs = [undefined,];
    for (Sdir of iterateOver(Result)) {
        if (CBool(ByRef_Recurse)) {
            Sdirs = await JSB_TCL_GETSUBDIRECTORIES(Cd, CStr(Dir) + CStr(Sdir), ByRef_Recurse, +ByRef_Cnt + 1, function (_ByRef_Recurse, _P4) { ByRef_Recurse = _ByRef_Recurse });
            Dirs[Dirs.length] = CStr(Sdir) + '\\';
            for (Line of iterateOver(Sdirs)) {
                Dirs[Dirs.length] = '   ' + CStr(Line);
            }
        } else {
            Dirs[Dirs.length] = CStr(Dir) + CStr(Sdir) + '\\';
        }
    }

    return exit(Dirs);
}
// </GETSUBDIRECTORIES>

// <_DOWNLOAD_Pgm>
async function JSB_TCL__DOWNLOAD_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Fname, Iname, Item, Mimetype;

    if (Not(isAdmin())) return Stop('You are not an administrator');
    Fname = queryVar('TableName');
    Iname = queryVar('itemname');

    if (await JSB_ODB_READ(Item, await JSB_BF_FHANDLE(CStr(Fname)), CStr(Iname), function (_Item) { Item = _Item })); else return Stop(activeProcess.At_Errors);

    if (InStr1(1, Iname, '.')) Mimetype = JSB_BF_MIMETYPE(fieldRight(CStr(Iname), '.')); else Mimetype = JSB_BF_MIMETYPE('txt');
    if (Left(Mimetype, 4) == 'text' || InStr1(1, Mimetype, '/json') || InStr1(1, Mimetype, '/xml') || InStr1(1, Mimetype, '/java')) Item = Change(Item, am, crlf);

    Print(At(-1));
    At_Response.Buffer('');
    At_Response.Header.Set('Content-Disposition', 'attachment; filename=' + CStr(Iname));
    At_Response.Header.Set('Content-Type', Mimetype);
    At_Response.BinaryWrite(Item);
    At_Server.End();
    return;
}
// </_DOWNLOAD_Pgm>

// <UPLOAD_Pgm>
async function JSB_TCL_UPLOAD_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S, Ddata, Fname, Iname, Ffile, B, Itemname, Item, X, Todir;

    if (Not(isAdmin())) return Stop('You are not an administrator');
    S = Trim(Field(activeProcess.At_Sentence, '(', 1));
    Ddata = '';
    Fname = LCase(Field(S, ' ', 2));
    Iname = '';
    if (Fname == 'dict' || Fname == 'data') {
        Ddata = Fname;
        Fname = LCase(Field(S, ' ', 3));
        Iname = LCase(Field(S, ' ', 4));
    } else {
        Iname = LCase(Field(S, ' ', 3));
    }
    if (isEmpty(Fname)) Fname = 'uploads';
    if (await JSB_ODB_OPEN(CStr(Ddata), CStr(Fname), Ffile, function (_Ffile) { Ffile = _Ffile })); else return Stop(activeProcess.At_Errors);

    B = At_Response.buffer();
    Print(At(-1));
    Println(JSB_HTML_UPLOADBOX('upLoadID'));
    Println(JSB_HTML_SUBMITBTN('Upload'));

    await At_Server.asyncPause(me);

    Itemname = At_Request.FileName('upLoadID');
    if (CBool(Itemname)) Item = await JSB_HTML_REQUESTFILE('upLoadID');
    X = At_Response.buffer(B);

    if (Not(Itemname)) return Stop('Canceled');

    if (CBool(Iname)) Itemname = Iname; else Itemname = Field(Itemname, '\\', DCount(Itemname, '\\'));

    if (LCase(Itemname) == 'jsonbasic.dll') {
        // copy .\uploads\jsonbasic.dll .\bin /y
        if (await asyncWrite(Item, await JSB_BF_FHANDLE('.\\bin'), 'jsonbasic.dll', "", 0)); else return Stop(activeProcess.At_Errors);
    } else {
        if (await JSB_ODB_WRITE(CStr(Item), Ffile, CStr(Itemname))); else return Stop(activeProcess.At_Errors);
    }

    Println(At(-1), Len(Item), ' bytes written to ', Ddata, ' ', Fname, ' ', Itemname);
    if (Right(LCase(Itemname), 4) == '.zip') {
        Todir = LCase(Field(Field(Itemname, '.', 1), ' (', 1));
        if (await JSB_BF_MSGBOX('Unzip ' + CStr(Itemname) + ' to .\\' + CStr(Todir) + '?', 'Yes,*No') == 'Yes') {
            await asyncTclExecute('unzip ' + CStr(Fname) + ' ' + CStr(Itemname) + ' (.\\' + CStr(Todir));
        }
    }
    return;
}
// </UPLOAD_Pgm>

// <DTX_Pgm>
async function JSB_TCL_DTX_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var I, A;

    I = 2;

    while (true) {
        A = Field(activeProcess.At_Sentence, ' ', I);
        if (Not(CBool(A))) break;
        Print(DTX(CNum(A)), ' ');
        I++;
    }
    Println();
    clearSelect(odbActiveSelectList);

    return;
}
// </DTX_Pgm>

// <DUMP_Pgm>
async function JSB_TCL_DUMP_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Externs, Funcs, Tfn, Firsttime, Isjsbfile, Iname, Itemi;
    var Item, Whichdict, Niceiname, Longline, Line, Li, Size, I;
    var L, X, J, A, Y, Chars, Byte;

    if (Not(isAdmin())) return Stop('You are not an administrator');

    var Ignorefilenotfound = false;
    var Dftallitems = false;
    var Help = [undefined, 'DUMP TableName \<ITEMNAMES\> {(options)}'];
    Help[Help.length] = '   Option S: Source CPP';
    Help[Help.length] = '   Option P: Pcode for CPP';
    Help[Help.length] = '   Option T: text string for CPP split on 120 characters';
    Help[Help.length] = '   Option B: binary Pcode for CPP split on 120 characters';

    // Include jsb_tcl __SHELL

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

    Externs = [undefined,];
    Funcs = [undefined,];

    Tfn = await JSB_BF_TRUEFILENAME(Tablename);
    Firsttime = false;
    Isjsbfile = Left(LCase(Tfn), 4) == 'jsb_';

    Itemi = LBound(Inames) - 1;
    for (Iname of iterateOver(Inames)) {
        Itemi++;
        var Ext = fieldRight(UCase(Iname), '.');
        var Hdoc = (Ext == 'HTM' || Ext == 'HTML');

        if (await JSB_ODB_READ(Item, F_File, CStr(Iname), function (_Item) { Item = _Item })); else {
            Errors[Errors.length] = 'Item ' + CStr(Iname) + ' not found.';
            continue;
        }

        Whichdict = await JSB_BF_TRUEFILENAME(Tablename);
        if (Left(Whichdict, 2) == '.\\') Whichdict = ''; else Whichdict += '_';
        Iname = LCase(Iname);
        Niceiname = Change(CStr(Whichdict) + CStr(Iname), '.', '_');

        if (Index1(_Options, 'R', 1) == 0 && (Index1(_Options, 'T', 1) || Index1(_Options, 'S', 1) || Ext == 'JS' || Ext == 'CPP' || Ext == 'CSS')) {
            Item = Change(Item, crlf, am);
            Item = Change(Item, cr, am);
            Item = Change(Item, lf, am);
            Item = Split(Item, am);
            Print('const char ', Niceiname, '[] PROGMEM = ');

            Funcs[Funcs.length] = '  if (!strcmp(id, "' + CStr(Iname) + '")) return ' + CStr(Niceiname) + ';';
            Externs[Externs.length] = 'extern const char ' + CStr(Niceiname) + '[];';

            for (Longline of iterateOver(Item)) {

                do {
                    Println();
                    if (Index1(_Options, 'T', 1)) {
                        Line = Left(Longline, 120);
                        Longline = Mid1(Longline, 120 + 1);
                    } else {
                        Line = Left(Longline, 1024);
                        Longline = Mid1(Longline, 1024 + 1);
                    }
                    Line = Change(Line, '\\', '\\\\');
                    Line = Change(Line, '"', '\\"');
                    if (CBool(Longline)) {
                        Print('"', Line, '"');
                    } else {
                        Print('"', Line, '\\n"');
                    }
                }
                while (Len(Longline));
            }
            Println(';');
            Println();;
        } else if (Index1(_Options, 'P', 1) || Index1(_Options, 'B', 1)) {
            Item = STX(Item);
            Li = Len(Item);
            if (Index1(_Options, 'B', 1)) Size = 80; else Size = 1024;
            Print('const char ', Niceiname, '[] PROGMEM = ');
            Funcs[Funcs.length] = '  if (!strcmp(id, "' + CStr(Iname) + '")) return ' + CStr(Niceiname) + ';';
            Externs[Externs.length] = 'extern const char ' + CStr(Niceiname) + '[];';

            var _ForEndI_20 = +Li;
            for (I = 1; (+Size >= 0) ? (I <= _ForEndI_20) : (I >= _ForEndI_20); I += +Size) {
                L = Mid1(Item, I, Size);
                X = '';
                var _ForEndI_21 = Len(L);
                for (J = 1; J <= _ForEndI_21; J += 2) {
                    X += '\\x' + Mid1(L, J, 2);
                }
                if (+I + +Size - 1 >= Null0(Li)) {
                    Println('"', X, '";');
                } else {
                    Println('"', X, '"');
                }
            }

            Println();
        } else {
            Println('Dump of ', Iname);
            Println();

            A = 1;
            L = Len(Item);
            for (Y = 0; Y <= 3100; Y++) {
                Line = Fmt(DTX(+A - 1), 'R%4: ');
                Chars = '';
                for (I = 0; I <= 15; I++) {
                    if (Null0(A) > Null0(L)) {
                        Line += '   ';
                    } else {
                        Byte = Seq(Mid1(Item, A, 1));
                        Line += Fmt(DTX(Byte), 'R%2 ');
                        if (Null0(Byte) < 32 || Null0(Byte) > 122) {
                            if (Null0(Byte) > 250) {
                                Byte = Chr(+Byte - 255 + Seq('_'));
                            } else {
                                Byte = '.';
                            }
                        } else {
                            Byte = Chr(Byte);
                        }
                        Chars = CStr(Chars) + CStr(Byte);
                    }
                    A = +A + 1;
                    if (Null0(I) == 7) Line += ' ';
                }

                Println(MonoSpace(CStr(Line) + ' ' + CStr(Chars)));

                if (Null0(A) >= Null0(L)) break;
            }

            if ((Ext == 'PCD' || Ext == 'PCS' || Ext == 'PCF')) Println('Use option P or R to dump as CPP source code');
        }
    }

    if (!isEmpty(Errors)) Println(MonoSpace(Join(Errors, crlf)));

    if (CBool(Externs)) {
        Println();
        Println(Join(Externs, crlf));
    }
    if (CBool(Funcs)) {
        Println();
        Println(Join(Funcs, crlf));
    }

    return;
}
// </DUMP_Pgm>

// <ECHO_Pgm>
async function JSB_TCL_ECHO_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S;

    S = activeProcess.At_Sentence;
    if (LCase(Left(S, 4)) == 'echo') S = Mid1(S, 5);
    Println(S);

    return;
}
// </ECHO_Pgm>

// <TCL_Pgm>
async function JSB_TCL_TCL_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Fmd, Qptr, _Jsbroot, Mysession, U, Opts, Pgmname, Cv, Url;
    var Autostart, Myexename, Act, Attacheddb, Dodebug, S, E;

    if (await asyncOpen("", 'MD', _fHandle => Fmd = _fHandle)); else {
        if (InStr1(1, activeProcess.At_Errors, 'quota')) {
            await JSB_BF_MSGBOX('I can\'t write to storage.  Please check you Android \> Settings \> App permissions \> Chrome \> Storage is ON');
            return Stop();
        } else {
            await JSB_BF_MSGBOX('Fatal Error', CStr(activeProcess.At_Errors));
            return Stop(activeProcess.At_Errors);
        }
    }

    if (await asyncRead(Fmd, 'css', "", 0, _data => Qptr = _data)); else {
        if (window.isPhoneGap()) {
            if (await asyncWrite('q' + am + am + '.\\css', Fmd, 'css', "", 0)); else null;
            if (await asyncWrite('q' + am + am + '.\\js', Fmd, 'js', "", 0)); else null;
            if (await asyncWrite('q' + am + am + '.\\fonts', Fmd, 'fonts', "", 0)); else null;
            if (await asyncWrite('q' + am + am + '.\\pics', Fmd, 'pics', "", 0)); else null;
            if (await asyncWrite('q' + am + am + '.\\sounds', Fmd, 'sounds', "", 0)); else null;
            if (await asyncWrite('q' + am + am + '.\\htm', Fmd, 'htm', "", 0)); else null;
            if (await asyncWrite('q' + am + am + '.\\sdcard', Fmd, 'sdcard', "", 0)); else null;
            if (await asyncWrite('q' + am + am + '.\\sdcard', Fmd, 'dblog', "", 0)); else null;
            if (await asyncWrite('q' + am + am + '.\\sdcardapp', Fmd, 'sdcardapp', "", 0)); else null;
            if (await asyncWrite('q' + am + am + '.\\sdcardfiles', Fmd, 'sdcardfiles', "", 0)); else null;
            if (await asyncWrite('q' + am + am + '.\\sdcardcache', Fmd, 'sdcardcache', "", 0)); else null;
        } else {
            _Jsbroot = jsbRoot();
            if (await asyncWrite('q' + am + am + CStr(_Jsbroot) + 'css', Fmd, 'css', "", 0)); else null;
            if (await asyncWrite('q' + am + am + CStr(_Jsbroot) + 'js', Fmd, 'js', "", 0)); else null;
            if (await asyncWrite('q' + am + am + CStr(_Jsbroot) + 'fonts', Fmd, 'fonts', "", 0)); else null;
            if (await asyncWrite('q' + am + am + CStr(_Jsbroot) + 'pics', Fmd, 'pics', "", 0)); else null;
            if (await asyncWrite('q' + am + am + CStr(_Jsbroot) + 'sounds', Fmd, 'sounds', "", 0)); else null;
            if (await asyncWrite('q' + am + am + CStr(_Jsbroot) + 'htm', Fmd, 'htm', "", 0)); else null;
        }
    }

    // setup theme
    Mysession = At_Session.Item(userno());
    if (Not(Mysession)) { Mysession = {} }

    if (JSB_BF_USERVAR('currentTheme')) {
        JSB_BF_THEME(JSB_BF_USERVAR('currentTheme'));
    } else if (At_Application.Item(jsbAccount() + '_lastTheme')) {
        JSB_BF_THEME(At_Application.Item(jsbAccount() + '_lastTheme'));
    } else if (At_Session.Item('lastTheme')) {
        JSB_BF_THEME(At_Session.Item('lastTheme'));
    }

    // setup username - happens in new browser tabs
    if (CBool(Mysession.UserName)) {
        await JSB_BF_SIGNIN(Mysession.UserName, true, function (_P1) { });
    } else if (At_Session.Item('LASTUSERNAME')) {
        await JSB_BF_SIGNIN(At_Session.Item('LASTUSERNAME'), true, function (_P1) { });
    } else {
        await JSB_BF_SIGNIN('guest', true, function (_P1) { });
    }

    if (At_Session.Item('ATTACHEDDATABASE')) {
        if (await JSB_ODB_ATTACHDB(At_Session.Item('ATTACHEDDATABASE'))); else At_Session.Item('ATTACHEDDATABASE', '');
    }

    U = JSB_BF_URLSENTENCE();
    activeProcess.At_Sentence = U;
    Opts = UCase(Field(activeProcess.At_Sentence, ' (', 2));
    Pgmname = LCase(Field(activeProcess.At_Sentence, ' ', 1));

    // jsb, index, and tcl do an EXECUTE below instead of a Call
    if (Locate(Pgmname, [undefined, 'tcl', 'index', 'jsb', 'hta', 'jsbwinform', 'jsbwinforms'], 0, 0, 0, "", position => { })); else {
        if (CBool(Pgmname) && InStr1(1, Pgmname, '=') == 0) {
            if (await asyncRead(Fmd, Pgmname, "", 0, _data => Cv = _data)) {
                window.document.title = activeProcess.At_Sentence;
                await asyncTclExecute(activeProcess.At_Sentence);
                return;
            } else {
                Println('Unknown verb: ', Pgmname);
            }
        }

        // Auto Start (EXECUTE @ACCOUNT) 
        Url = window.myLocation();
        if (Right(Url, 4) != '#tcl' && Right(Url, 1) != '#' && Right(Url, 1) != '?') {
            Autostart = jsbAccount();

            // If the default Account is "jsb" (default), then check the EXE Name
            if (Autostart == 'jsb' && window.dotNetObj) {
                Myexename = window.dotNetObj.dnoMyExeName();
                if (Myexename != 'jsb') {
                    if (await JSB_BF_ACCOUNTEXISTS(CStr(Myexename))) return Stop(window.Logto(Myexename));
                }
                if (await asyncRead(Fmd, Myexename, "", 0, _data => Cv = _data)) Autostart = Myexename;
            }

            if (await asyncRead(Fmd, Autostart, "", 0, _data => Cv = _data)) {
                Cv = LCase(CleanupText(CStr(Cv)));
                if (window.me) me._activeProcess.isUrlAutoStarted = true; else activeProcess.isUrlAutoStarted = true;
                if (Locate('cv', Cv, 0, 0, 1, "", position => { })) {
                    await asyncTclExecute(Autostart);
                    return;
                }
            }
        }
    }

    if (window.me) {
        me._dontDisplayInStack = true;
        me.isTCL = true;
        me._activeProcess.hasTCLParent = true;
    } else {
        activeProcess.isTCL = true;
    }


    do {
        if (window.dotNetObj) {
            Act = System(19);
            Attacheddb = At_Session.Item('ATTACHEDDATABASE');
        } else {
            Act = jsbAccount();
            Attacheddb = At_Session.Item('ATTACHEDDATABASE');
        }

        if (CBool(Attacheddb) && Attacheddb != 'jsb' && Null0(Attacheddb) != Null0(Act)) Attacheddb = ' ' + CStr(Attacheddb); else Attacheddb = '';
        activeProcess.At_Prompt = CStr(Act) + CStr(Attacheddb) + '\> ';

        activeProcess.At_Errors = '';
        Dodebug = 0; singleStepping = 0; modalStep = 0;

        window.document.title = window.myTitle;
        window.changeHistoryStack('tclhistory');

        S = '';
        S = await asyncInput('', true);

        window.document.title = S;
        window.changeHistoryStack('userinput');
        window.clearStatus();

        if (window.dotNetObj) {
            Act = System(19);
            Attacheddb = At_Session.Item('ATTACHEDDATABASE');
        } else {
            Act = jsbAccount();
            Attacheddb = At_Session.Item('ATTACHEDDATABASE');
        }

        if (CBool(Attacheddb) && Attacheddb != 'jsb' && Null0(Attacheddb) != Null0(Act)) Attacheddb = ' ' + CStr(Attacheddb); else Attacheddb = '';
        Println(Chr(28), '\<a href="" onclick="$(\'#txtInput\').val(\'', htmlEscape(S), '\'); txtInput_CRLF(event);"\>', Chr(29), S, Chr(28), '\</a\>', Chr(29));

        // window.unloadDynamicScripts()

        try {
            if (InStr1(1, Opts, '!') || InStr1(1, Opts, '$')) { Print(); debugger; }
            await asyncTclExecute(S);
        } catch (E) {
            Println(E);
        }

    }
    while (true);
    return;
}
// </TCL_Pgm>

// <ED_Pgm>
async function JSB_TCL_ED_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Admin, Mysentence, Edtname, Msg, Savescreen, Searchfor;
    var Replacewith, Regexpsearch, Casesensitivesearch, Wholewordsearch;
    var Findopen, Replaceopen, Doreload, Firsttime, Lists, Fromlineno;
    var Truetblname, Sfile, Sedit, Sbuild, _Menubar, Iconstyle;
    var Useaceeditor, Runpng, Compilepng, Savepng, Exitpng, Menuheight;
    var Htmlmenubar, Externalopen, Iname, Itemi, Ans, Loaditem;
    var Newitem, Item, Useniceditor, Usetextarea, Usecodemirror;
    var P, Np, Nc, Tag, Af, J, Pp, Prerun, Rawitem, Txt, Cm, Cmds;
    var Btn, Docdiv, Di, Ndd, Ned, Nochanges, Exists, Actrun, Errcnt;
    var Examplename, Xmsg, Eline, Lineno, Bline, Aline, Oktorun;
    var Reloaditem;

    Admin = isAdmin();

    if (Not(Admin)) return Chain('view ' + dropLeft(CStr(Mysentence), ' '));

    var Ignorefilenotfound = false;
    var Dftallitems = false;
    var Help = [undefined, 'ED TableName \<ITEMNAMES\> {(options)}'];
    Help[Help.length] = '   (N - use nic editor';
    Help[Help.length] = '   (C - use codemirror';
    Help[Help.length] = '   (A - use aceeditor';
    Help[Help.length] = '   (I - use input html box';
    Help[Help.length] = '   (W - open in another tab or window';

    // Include jsb_tcl __SHELL

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

    Mysentence = activeProcess.At_Sentence;
    Edtname = 'TA';

    if (Index1(Field(activeProcess.At_Sentence, ' ', 1, true), 'LIST', 1)) Fname = 'JSB_SelectLists';
    Msg = '';
    Savescreen = At_Response.buffer();
    Searchfor = At_Session.Item('searchFor') + '';
    Replacewith = At_Session.Item('replaceWith') + '';
    Regexpsearch = At_Session.Item('regExpSearch') + '';
    Casesensitivesearch = At_Session.Item('caseSensitiveSearch') + '';
    Wholewordsearch = At_Session.Item('wholeWordSearch') + '';
    Findopen = At_Session.Item('findOpen') + '';
    Replaceopen = At_Session.Item('replaceOpen') + '';
    Doreload = true;

    _Options = Trim(Change(_Options, '!', ''));
    _Options = UCase(_Options);
    Firsttime = 0;
    Lists = Index1(_Options, 'LIST', 1);
    if (CBool(Lists)) {
        _Options = Mid1(_Options, 1, +Lists - 1) + Mid1(_Options, +Lists + 1, 9999);
    }
    if (CNum(_Options)) Fromlineno = CNum(_Options);
    Truetblname = await JSB_BF_TRUETABLENAME(Tablename);
    Fname = await JSB_BF_TRUETABLENAME(Fname);

    // Build Menu Bar

    Sfile = 'File';
    Sedit = 'Edit';
    Sbuild = 'Build';

    _Menubar = {};
    Iconstyle = 'padding: 2px; margin: 1px; background-color: lightgray; border-radius: 4px;';

    _Menubar[Sfile] = {};

    _Menubar[Sfile]['Save'] = {};
    _Menubar[Sfile]['Save'].id = 'Save';

    _Menubar[Sfile]['Save & Exit'] = {};
    _Menubar[Sfile]['Save & Exit'].id = 'Save\>';

    _Menubar[Sfile]['Save As'] = {};
    _Menubar[Sfile]['Save As'].id = 'Save As';

    _Menubar[Sfile]['Rename'] = {};
    _Menubar[Sfile]['Rename'].id = 'Rename';

    _Menubar[Sfile]['Reload'] = {};
    _Menubar[Sfile]['Reload'].id = 'Reload';

    _Menubar[Sfile]['Exit'] = {};
    _Menubar[Sfile]['Exit'].id = 'Exit';

    _Menubar[Sfile]['Delete'] = {};
    _Menubar[Sfile]['Delete'].id = 'Delete';

    _Menubar[Sfile]['Exit All'] = {};
    _Menubar[Sfile]['Exit All'].id = 'Exit!';

    _Menubar[Sfile]['Detach'] = {};
    _Menubar[Sfile]['Detach'].id = 'Detach';

    _Menubar[Sfile]['Who'] = {};
    _Menubar[Sfile]['Who'].id = 'Who';

    _Menubar[Sfile]['Restore Previous Version'] = {};
    _Menubar[Sfile]['Restore Previous Version'].id = 'Restore';

    _Menubar[Sedit] = {};
    if (CBool(Useaceeditor)) {
        _Menubar[Sedit].Undo = 'CheckUnDoReDo("Undo")';
        _Menubar[Sedit].Redo = 'CheckUnDoReDo("Redo")';
        _Menubar[Sedit].seperator1 = true;
        _Menubar[Sedit].Find = 'aceEditor.execCommand("find")';
        _Menubar[Sedit].Replace = 'aceEditor.execCommand("replace")';
        _Menubar[Sedit]['Find Next'] = 'aceEditor.execCommand("findnext")';
        _Menubar[Sedit]['Find Previous'] = 'aceEditor.execCommand("findprevious")';
        _Menubar[Sedit].seperator2 = true;
        _Menubar[Sedit].Goto = ('var lineNo = prompt("Goto Line #"); if (aceEditor && lineNo != null) aceEditor.gotoLine(lineNo, 0, false);');
        _Menubar[Sedit].seperator3 = true;
    }

    _Menubar[Sedit]['Format'] = {};
    _Menubar[Sedit]['Format'].id = 'Format';

    _Menubar[Sedit]['Sort'] = {};
    _Menubar[Sedit]['Sort'].id = 'Sort';

    _Menubar[Sedit].seperator4 = true;
    _Menubar[Sedit]['Help'] = {};
    _Menubar[Sedit]['Help'].id = 'Help';

    // MenuBar["collaspable"] = true

    _Menubar[Sbuild] = {};

    _Menubar[Sbuild]['Compile & Exit'] = {};
    _Menubar[Sbuild]['Compile & Exit'].id = 'Compile\>';

    _Menubar[Sbuild]['Compile'] = {};
    _Menubar[Sbuild]['Compile'].id = 'Compile';

    _Menubar[Sbuild]['Run'] = {};
    _Menubar[Sbuild]['Run'].id = 'Run';

    _Menubar[Sbuild]['Debug'] = {};
    _Menubar[Sbuild]['Debug'].id = 'Debug';

    // Glyphicon RUN
    _Menubar['Run'] = {};
    _Menubar['Run'].id = 'Run';
    // MenuBar["Run"].glyphicon = 'play-circle'
    Runpng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAX+/AAF/vwFTP+0nAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAwBQTFRF////AwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEAwEEtRVHvgAAAP90Uk5TAAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+6wjZNQAAGjpJREFUGBntwQmAVuP+B/Dv+76zNFuLSVTaJMqWpUVIpZJsSSGy5OK6riXZhUp2JWu5ZQ8lXZQta9kiS6tcoaZVqpnWabZm3vf7//vfv3ulaeY573nOc55z5vf5AMKsRl0ve3D6Zwvy8kvLCpYv/PzNhy7v3iQCURNEDr/u7a2sxPb3b2ofgwi19H5TC1iFza+fkwERVp2e2MRqbX36uAhECPX9nop+PicCETLHzKYDc7tDhEnr1+nQu20hwqLh+Ao6Fp/YFCIMcu4sYlJKR9WDCLzDVjJp6zpBBFy/7XSh9EKIIIsMT9Cd0VGIwMqcStfeqQMRUE3mUYMfWkEE0tHrqMWmHhABdEYZNam4ECJw2hVTmx3HQQRMwzXUKL85RKDU+opaLcqGCJKXqNm0CERwDKV2d0MExukJ6jcAIiAOLaQHittBBELaUnpiZQZEEFxDj9wCEQC18+mRLbkQ9rubnnkIwnoNi+iZshYQthtPD02CsNwB5fRQ4ggIu71GT30IYbWj6LFeEDZ7mx6bDWGxvSvotVYQ9rqWnhsJYa/59FxeBMJWh9CAzhC2GkEDHoaw1Wc04DsIS2XtoAGJBhB2OpFGnA1hpwdoxAQIO31GI76DsNMGGlEShbBRXRrSHMJGHWjICRA2Op+GXAVho+E05CEIG42hIc9A2OhJGjIVwkZTaMh7EDZ6h4Z8AWGjz2jIdxA2mklD5kHYaDoN+QTCRi/SkLcgbDSOhkyCsNH9NGQ8hI2upyF3QdioDw25EMJGbWhIJwgbpVXQjFwIKy2lEQUQdnqDRnwKYafraMSdEHY6nEZ0g7BTpIAGlKRDWOqfNOBDCFtdRgNugnAgo+uw9xfl5W/99vkbetaCx3LL6LlEUwhlbV8q438VvzukDTz1Gj03E0LV8e9yF6ue7FcXnjmdnhsEoSQ24FtWrmL27R2i8ERqAT1WlA2h4sTlrErB5EEN4YFR9NiTEApSRyVYrYUPdE+DZrlb6KnifSCq1+Rrqtn+1lWtoNVQeuo+iOrV/Z4O5I3rkwNtMn+hhzbWgahW2iw6tOPjW46IQI9L6aFrIar3ApOx/oXzGkCD2A/0zPJ0iGp1Y7ISc+85LhVu9aVnBkJUbw7d2Dbtby3gzhf0yLwIRLVOp2s/PXpyFpJ3LD3SE6J6i6hD2Yc3HIpkTaQnXoGoXidqs/bZAblIRq2v6YEFWRDVe5o6xb8aeXQMjjVcQ+02NIOoXnYhddv8z0uawKF2xdSs7FgIBZfQE/8a0ysDTpxNzS6GUPElvVLy7pADoe5OavUwhIqD6KlVT/avCzWRV6nRezEIFWPotYrZwzpEoSBrPrX5sS6EirR8mlDw8qBGqFbDb6jJ4uYQSs6kMYse6J6OqmVMphZv5kCoeY8mFb111f6o0m0Jund/FEJNszhNy3vi9BzsXt/tdKn0fAhVI+iHHZ8MPSKC3Wi7kq6sOwpCVXQl/bJ+4hGoXIPZdGFeEwhlvein1w5GpdLGxZmkxPOZEOqm0lfxD+4d0CaGXR38FpPyUTsIB+qX0X/FX0+44jD82XFz6Nj8XhCOXEtbLBnWCn/S70c6snxgBMKZ72mRb65tjJ2kXPYrleVfkwbhUCfaJT6rN3aSdeMSKll2e20Ix56idd5qhZ11HLuR1djyZOcIhHPZhbRP2f052FnayWMWJrg73z/apxZEUi6mlX69MII/q3/mYx+u4Z+snTXu3L0hkvYlLTWnAyqTfeQ5f79x5IPjJ4wZeeMV57avDeHKgbRWYnQUwmtjaLHXMyG8lZZPm321F4SnzqTdlreB8NK7VJPf+u/TC+mDzd0gvNM0TjUPAkjteu+8BE0rOx/CM8Op6ED8217nv7iBhv0dwiPRlVTzBf4rcuTQT8ppUHlXCG+cQEV/wc5qn/7EchqzoSmEJ16hmsJs7Gr/q94uohlzMyA8UL+Map5E5dK7j1pEE16A8MAQKuqI3Wt00csb6blrIPRbTDWLUbVox2GzK+ip8uMhdDuKiq5B9er2f3IVPZRfH0Kzp6imLBdqDhzybgm98iiEXtmFVDMF6jJ6jSmhJ3a0gtDqYirqCSe60yOvQWj1BdWsiMKB1H/RK8dCaHQgFQ2DE9fTM3MgNHqQauJN4ECjQnrnbAht0vKpZgaceIkeykuD0KU/FfWDA/vH6aURELq8SzUbUuHABHoq3gtCj6ZxqhkNB/YupbcKmkFoMZyK2sCBe+i16RA6RFdQzWw4kLOZnusAocEJVHQRHLiW3nsPQoMpVLMtC+pSV9OAwyFcyy2jmglw4AKaMB7CtWuoqAPURb6jCYU5EG4tpppFcOAkmnEZhEsdqWgwHPiYZsyDcOlJqinNhboONKU9hCtZhVTzMhz4J015GsKVv1BRD6hrFacpRXUg3JhNNcsjUPcPmnMFhAttqOh2qNurhOYsgnBhNNXE94G6u2lSJ4ikpW6gmnegLnsTTXoeeqUefsktt95+y2lNUAP0p6IzoG4IjSquB31qXzmnlP8v/4XjEHYzqGZ9KpSlrKJZg6FL83GF3MmPV8QQZk3iVDMK6s6nYf+CJpds4y6+aYsQG0ZFraFuEU3rDB32fpuVKR+B0IqsoJrPoK43jXsJGhy5hrvxeAQh1ZOKBkHdLBpXmgvX+hVxt8ZHEE5TqGZrJpS1pw+ug1u3JliFuxBKuWVUMx7qptIHP8Kd9BdYpfIjEEbXUFF7KNsvTj90gxsNZrMaC1IRQt9RzUKoe4K+mAIXDl7Bat2O8OlIRVdDWYMS+qKsAZJ28jZWr+wghM4EqindA8rupE9uQrKGxKniqxhCJmsb1UyCsqyN9MmyCJKSOoGKrkXIXERF3aFsMH3TE8nYYyZVrUtFuMymmrwIVKWspG9eRRIO+Inq+iNU2lDRrVA2kP4pbwjHum+mAx8gVEZTTUVjKFtIH90Kp/5WTicSjREiqRuo5i0o60U/rYjCkdgjdOgchEg/KuoLZR/RV73hRO0ZdOpxhMg7VLMuBara0V/T4UCL7+nYAoRHkzjV3A9lr9BfFY2h7Nh8OleE8LidivaHqpYV9NlwqLqwjElIRBAWkeVU8ymUjaPfVsegJHIfk5OFsOhJRRdA1Z7F9N2pUJH1OpO0B8LiZarZmglVI+m/t6Fgn/lM0kaERW4p1TwBVVkb6b94M1Sr/VomaybCYjAVtYOqq2mDO1Gds4qZtIcQFp9SzQKoSllBG6xNQdWGJ5i8TgiJ2uVUcyVUnUs7nIGq1JpMFz5AWPSlmpJ6UDWfdngPVdh7Dt04DmHxONW8BFUn0BKJfbFbbVfRjfEIjdepphtUfUhb3IvdOa2QbkyLITQ+ppJlESg6gtZYn4rK3RCnG59nIDwWUclQqHqZ9jgLlUl7hq5My0KI/EAVFY2gaN8K2uMjVCL3E7oyKooweZcq3oSqx2mRRCvsos0yulF+KcLlCaroA0X1i2mTUfizXlvoxubuCJkbqeDXFCgaQavkp2NnV1bQjaWtETZHUcF9UJRZQLuciz9KGUtXPquP0ImsZvVaQdGVtMwn+IO679OViWkIoUdYrZlQFFtO27TBf7T8gW4kbkMoHZlgdbpC0Tm0zkP4XZcCulFyNkJqMqvxEVTNo3U21cK/XbyDbqzriLBqVsqqHQ1FPWmhC/Cb6Gi68l0zhNcdrNJjUPUBLTQb/yv7DboyozZCLDqNVfg8FYoOp5UOBpoupCuPxxBqWXO5W2sbQtVkWukxHLWOblRchbBrOJ+7sWQ/qGpRQSttuaSEbmzrjfDLnMRKfVQPyh5nKK08BDXC9UXcRdGIFCirX8ww+mov1BB7PVTCnSQm7gMHRjCMXslAzdFo5Jw4fzd36P5wIrOAIXRXBDVLvX5DRz39yqPX9GkGh66kaZvotbILIBTF8mjaBcvprYLOEKoG0LSVKSPoqSX7QSibR9Ouwb4JeuijehDKetC0TdnAx/TOU6kQ6t6naXcCGESvxG+AcOBwmlbSAED2dnqjqC+EE5No2hP4zXP0xC9HQjjRvIKGxffDb7rSC/MbQzjyKE2biv8TWU79pmdBOJJbRNPa499GULsHoxDODKNpM/H/WiSoV/lfIRzKyKdpJ+J3H1OrzT0gnLqCpi3EfwyiTsvaQDgVW0bTBuI/srdTn8/rQzh2Nk1bmYL/eo7avJgO4dy3NG0w/qArNUkMg0hCd5q2MQt/EMmjFiUDIJLxHk27EzsZTh3WHwWRjLY0rXhP7KRFgu4tbg6RlJdo2jj8ySy69m5tiKQ0K6dhFS3xJxfSrbExiOQ8QtNewZ9lFdKViqshkrTHdprWDrt4lm4UngyRrNtp2kfYVRe6sOpQiGRlbKBpvbCrSB6T9vXeEEm7nKYtQGWGM1lTMyCSFl1K0waiMs0TTM49EYjknUnTVqSgUrOYjLJBEG58Q9OuRuUuZBI2doFwoxtN25iFymUV0rEfW0G4MoOmjcTuPEunZtWDcOVQmla8J3anCx16OhXCnRdo2ljsVmQZnUjcBOFS03IaVrEvdm84HSg6A8Kth2jaFFSheYLK1raDcKteIU07ElWZS1UL9oFw7Vaa9iGqdA8VvZEN4Vqt9TTtBFTpOKoZE4Vw7zKaNh9VS91GBeV/g9Ag+jNNOxfVeInV29ITQod+NG15CqrRrIjVyTsQQouvaNpVqNZQVmP2nhBadKFpBZmoVtqPrNJL6RB6vE3T7oCC48tZheEQmhxM04rrQ0Xv7dyd+N8gdHmOpj0ONe3Ws3LlAyF0ydhOwyr2haKWC1mZ0j4Q2vSjaS9DWfT8PO7ijdYQ+kyhaUfAgdQrfuRO5naD0ChzOw37AA7td9OcUv4mvmTSTSdGIHQ6k6b1hHOxVj2O79wuG0K32HwaNh/CIlfQtHMg7LHnJhq2PAZhj6do2pUQ9uiYoGEFmRDWiH5D00ZA2OOvNK2oPoQ19iigaY9B2OMJmlbRAsIaR8Zp2mQIa0S+pHGHQ1jjLzTuAwhr1N1A43pAWOMxGjcPwhptK2jcAAhrfEbj8mIQtjif5l0BYYvav9K4/EwIW4yhecMhbHFQOY0ryoWwxSya9xiELQbQvIrmEJbIXkPzJkHY4gH64DAIS7TeQfPeh7DFB/RBdwhL9KcP5kJYInMVfXA2hCXupg+WxSDs0KqUPrgCwhLv0Af5GRB26EM/DIOwQ63l9EFRLoQdRtAPj0LYoUUJfVDeHMIOb9APL0HY4ST64jAIK6T/TD+8B2GH2+iHRCcIKzQtoh8mQtjhVfphW0MIK5xAX9wAYYW0JfTDklQIK9xEX5wIYYXG2+mH6RB2eJl+KN0Xwgrd6IsREFZI+Z5+eC0KYYVr6YcvMiCs0HAbffBTfQg7vEgfbGgJYYfO9EFRRwg7xBbSvHgfCEtcTR9cBWGJBlvog7dzIOzwLH2xsAmEDTol6I+17SD8F51LvxT1hfDd5fRP/AYIn9XfSD9NSIHw1QT664M6ED5qH6fP/tUCwjeRr+m7DZ0g/HIJLVAyAMIf9fJpg8TtEL4YR0tMTIMw7/A4bfFJLoRpkS9oj5/3hzBsEG2ysQuEUXXW0yplF0KY9Ahtc3cEwphDKmidKbUgTPmUFvqyAYQZA+nSr2X0wPKDIEzIWUuXTjq2gB7YcgKEAaPp0nSg5RJ6oPwyCM8dWE53SloAqDeTXngwCuGxj+jSCPwm9Wl6YVoWhKfOokt5tfBvNyfogbmNIDyUtZounYbf9S+mB1YfBuGd++jSO/ivDr/SA4WnQHjlgDK6U7of/qDpInogPhjCI+/Rpbuwk5wZ9MLYGIQXzqBLKzOxs9jj9MKMHAj9MlbQpX7YxdVxemBRUwjt7qRL76MSJxfSA7+2h9CsZSnd2XEAKtN2NT1Q3A9Cr7fo0n2oXMNv6YHETRA6nUqX1mRjNzJfpxeeSoXQptYyunQ2dis6il74qC6ELsPo0kxU5dJyeuCHfSH0aF5Md8oPRJV6bKEH8o+B0GIaXXoQ1WiTRw+UnguhwYl0aW0OqrPnbHphOIRraT/RpYGoXvokeuHFdAiXhtKlT6HkDnrhs/oQrjQpojsVh0LNeWX0wNIDINyYSpcegapjC+iBTd0gkteDLq2vA2Utl9ADO/4CkazUH+jSIDhQbya9cG8EIjk30KUvInAi9Rl6YWoGRDIaFdKd+OFw6OYEPfDVXhBJmESXxsGx/sX0wIqDIRzrSpfy68G5Dr/SA1t7QTiU8h1dugTJaLqIHqi4HMKZa+jS1xEkJWcGvfBQFMKBvbfSnXh7JCn2OL3wRhaEuol0aQKSd3WcHpjfGELVMQm6s7E+XDilkB5Y0wpCTeYCunQ5XGm7mh5Y1RSiepn9XymiS3OjcKfht/TAz3tDVC2j35TtdC3RCW5lvk4PLM6F2L2MM17eTh2egXvRUfTAN5kQlavVd3Ih9djcADpcWk79RkJUotbpkwqpzVXQo8cWaleyL8SfpPd5aRs1WhiDJm3yqN10iD9KP+3FbdTrWGiz52xq1xvid+mnvrCVur0AjdInUbcfoxC/STtl4lbqt3Vv6BQZSd26QSDtlOe30BNDoNl5ZdTrH6jp0k5+bjM9sjgFunUuoFb5KajJUk96djO90xX6tVxCrXqhxkrt/cwmemkyvFBvJnV6BjVT6olPb6K3ChvDE6nPUKM81EApvZ7aSM/dCK/cnKA25THUMCknPFlAA35IhWf6F1ObZqhJUno+WUAzesJDHdZRly6oMWI9JuTTlH/CU00XUZNBqBli3cdvoDlFTeGtnBnUYxhqgNjx/9hAo4bCa7Gx1OJ6hF2s2xPradhP6fDe4Dg1OBehFu06bh3N6w0TTimke90QXtEuY9fRD9NgRttCunYQQip63OO/0h/FzWHGtXRvb4RRtPNja+mb4TDj7ATdS0XoRI59dC19tKwWjOhSSvd+QchEjnnkF/rrVBhx8GZq8CbCJHL0w2vot7dgxD6rqcMdCI3I0Q+tpv9KW8KEOouoRU+EQ6TTmNW0whCYkDaTWqyIIgQiRz24ipaYDBMik6nHbQi+jqNX0hrfZsKE0dSjohECrsOoFbTInLowYTA1mYZAa//AclplTg5M6B+nJichuNrdn0fLbN8XJnQupSYzIwioI+/Po32uhgkHbqImW5shkNLvWkYbfRaFAY1WUpeLEEi1Z9FKJfvDgNoLqMsbCKQGc2mna2BA2ofUJX8vBFHzn2in22FA5EXqsuMEBNE+v9BOQ2DC/dTmQgRR7BNaKX4pTLiS2tyKQBpBK5WfCxPOiFOXJxBIXSpooW+uawITjimhLtNjCKI91tA6i2/bD2a03khdvsxAIN1Dyyy962CY0nAFdfmpPgIpZzNtsnp0O5iTM4+6rNsXwXQ97bF+bOcIDEp9n7psPxLBlLaGltj8dM8YzHqeupT3RkANohW2Tzo1DabdQ20uQlBNo/9KXzsrE+ZdTm2GIaiim+iz8ncuqA0/9KmgLhMQWIfTV/FZl+XCH52KqcubMQTWEProy8EN4Zf9C6jLV5kIrun0y4Kbm8M/e+VRl5/3RID9QF8sGdEafsr+lrpsaIkgW0PzVtx3GPyVMoO6bG+PQNtKw9Y+0gm+e5a6VJyMQIvEaVLB+G5R+G8ktbkEwZZNc7ZO7J0KG/yV2oxAwNWhIcWvnFELdjilgro8hcDbRAPK3jg3G7boWERd3k5B4H1Nr1V8cHE92GO/DdTlmywE3yR6KvHZFQ1gkwZLqcuyBgiBkfTQt9c1gV2yvqYu+a0QBufRK4tv2w+2SXmbuhR1RCjUL6cXlt51MCz0FHWpOBUh8Ta1W/1ge1hpOLX5K8LiPOq1fmznCOx0MbW5E6GRXUx9Nj/TMwZbnVROXZ5FiEyhJtsnnZYGe7XbTl3eTUGIHFJBDUpfOysTNmu5nrrMzUaoPEq3ymdcWBt2q/8zdcnbC+FSdwPdiM+6rD5slzmHuhTsj7C5hMmbM7gR7Bd7g7oUd0LoRL9ichbc3ByBMJ66VPRBCDVcTueWjGiNgLiN2lyOUGq1gc6suP8wBMYganMPQurIbVS39pFOEQRHr3Lq8jxCq3sZ1RSM7xZFkBxRSF3eT0V4dcxj9bZNPCkVwdJiHXWZl4MwqzOF1XjzjFoImtwfqcuKhgi5S4tZhSU9ETwZX1CXja0Req2eL+duFN6YiuCJTaMuJcegJmj2aDErsWVCYwTROOoS74saYs/bPy/jTopfOT0dgXQLtbkSNUjG8XfM/HlDKclNX08aeXYOAup8anMfaqD0BnsgyHruoC4vRiCC5rBt1OXDVIigabaWuiyoDRE0e/xAXVY2ggiaWp9Tl01tIIIm+ip1KekMETiPUZd4f4jAuZHaXA0ROAMT1GUUROB0L6MukyIQQXPoVuoyMw0iaJr+Ql0W1YEImnrfU5dVjSGCJv1T6rL5IIigiU6lLqVdIALnYeqSOAsicK6jNkMgAmdAgrqMgQicrmXUZUoEImhabaEuH6dDBE3qt9RlcV2IwHmAuqzZByJweiSoyZZDIAKn/lpqUtYNIngeoSaJARDBU7eQmlwPEUA3UpOHIQIodTX1mBqFCKCB1OPTdIggepNafF8PIogiG6nDL00hAqkNddjaFiKYLqEGZd0hAuo5upcYCBFU8+nejRCBtZSuPQYRXGvp1qtRiODaSpc+rwURYOV054c9IAIsRnfWNoMItLV0Y9thEME2ky7s6AkRcGPpwvkQQXclk3cLROD1YNLGQQRfdhGT9HoUIgReZHK+yIAIgxOYlCW5EKEQW8sk/NoCIiRG07nCIyDComkRnSrvBREeQ+nUIIgQSfuRztwGESo96cg/IEJmCh14IwYRMtlfUdmcTIjQyf2eir6vDxFCjVdQyde5EKHUaj0VzMyBCKkmn7Ba09IhQit6azmrVD4qBSLMOi5lFT49BCLkcoZt4G6sOx+iBqh12U+sxNwhdSBqhmjfyau4k1X3HghRozQZ8NjH3yxe9kv+ty/cekabCGqq/wFprrvuz1TvxAAAAABJRU5ErkJggg==';
    _Menubar['Run'].iconurl = Runpng; // @jsbRoot:"pics/run2.png"
    _Menubar['Run'].style = Iconstyle;

    // Glyphicon COMPILE & Exit
    _Menubar['C\>'] = {};
    _Menubar['C\>'].id = 'Compile\>';
    Compilepng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAB2klEQVR4XtWVQU/qQBDHp9uSCOHgXQ4k8jBEookHQ3p/FzHxE3jkO3gz3jx69Er8AnwCbu/wosZ4UGn70JcmGEhNMGiBALLONpNK1gJVe9BJfuxuh5n/zE7Swo83JWQA/2y8BiHtwXn0ZC7OTO/8e2szVJz2keqNGxvO/xqSb3YXDEJYr9sH49qGWOytnsP9E3//VYGdeGIB1jcyMByOfMfewa7n++yQs4ghOx7bT3B8VKHkILOM3M4XoOScc6jVaqCqqke1WoVSqQTCyuUyFItF39dsNiGbFWGwhNxPF6Dktm1DvV73ghljYg3cI/7ecRzQdR3Q8shVkEAauROVm6YJg8FABPskk0lJ5D2NRgNSqZR/XbJABrEgGvuF/Js5A9GyZVlSxcEdtFotKBQKIWdAAzYMI+gagsVo0Ol02r+eeTMISvj9ZiC/i/4jq8iV67pBXUyfB80hl8sB2grlUhAufpiAVK8juqI8YiIjhbpYQNaQPxCN6cglMtBIII4kEIiogzgV/aLQYRHZRCoQjW0jp0hHo4/GCDEQnQSZUKeAMZ3J/GeK5GOUp4+0ac/ViSBOzh7yjDwRLp3fVvLRuTvx/87Ec5eGDIyIESRKFc43TvGcGFP1Q7G+AlUAxPwogt6sAAAAAElFTkSuQmCC';
    _Menubar['C\>'].iconurl = Compilepng; // jsbJSLik(@jsbRoot:"pics/compile.png"
    _Menubar['C\>'].style = Iconstyle;

    _Menubar['Save\>'] = {};
    _Menubar['Save\>'].id = 'Save\>';
    Savepng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAjzSURBVHja7VtfbBRFGP9mbu/2elcotmD/xVIIUIOgiP/e1JgoEh5IDIGYgL7oAyroo/HV+GY0YgwoIeCLIokJTxKj8ZEHo4mRPxU10tIWaOn/9q7Xu+ut30x3dmf2/y5IrpaB6e7Ozs7O75vv933fzOwRwzBgOScKyzxp4qS9u3sbHljOLmE8Jcy/3ejr+y3qA6Rt7do0Hr/E/DIryDY0QGNj45JDPlcsQqFQEJdfY34VBVGJogHvMvAdHR2wZ98+KJXmYGZqGkWD/wmBUrnCG25pbhYys6XnJVFYtCkGe57XYHmxjLXHrw35GqxrpUF2D4upWccw22DXo+Pj8EBXF6TTGn8Hq5HJ6pBJZ+Cb06fhzytX2GD2Yn4/igb8kc/ne944dAhOnToJ5fkS7xillB9b2jvgqcefhEe3P2b1kXccMzuKPlNxTYkCjoq6Zpn8vHhG1KfKOZjPmc9Qu70z334LE5OToKUoXlN+j+BR01Kwfduj8PmxYzA0NHQFNeDBKEZw44s7d8K5c9+5wLNGrVGqt0RAAU/xyDzapd5eeGnPHlZjY1QvQNs7O2FsZAR2vfAi7Hh+BzSval4ETwnUKXwFvFGtwsbu9bB+7TqYnZkRNoxG9gIUVUnPZODAKwegXAX4+++/YGp22lLfulQAamtoPp+D3bt3Q7UGcOTTTyCVSsV3gzPFAhx++x1+PosWldY5Bbht4HQlUJgrwYcff8TLjJj91URjLE1MT3HJWuDrmAJggmf9TKMHUAYshhCo3R6xLLEAX88UoBIFZPDMgMePBDlOajdK1UaNhRp0dnRa2iC7JKGQVIwKc9/Evna6SsvdE1voxCojqkuVy8Q72Z9aTaGADD6uBmgWAC/wJgVq+MLND262BUDUuEUG6XXPjh/87zmfDbrHJ3Au8EQRaAIK0KVLAZqcAlSWuB8F6tMGUn8KJNGAIArUaSDoS4GEXoDaHFoCFCABFIhvA4RF5qCXIQW4S/ECT4nPpLceKWBrcDIb4EGBxcah7ilAJPAkEQXATQEeGCWQ6N2mAANMJfA0sRH0BV+vAvAGn4wCyuICURqtWwo4+imfJ7ABRJoM0duS6F3VAD8tgJgUIDIFXOCXIAVIAiNog1+WFHB4gSVOgWQC+D9RILEXMLWAOChQbxuorD9BFCAkthEkEnizManRawPX+KJIPaRyuQzXR0bs6O82KaA5Q0sFPNtsWFiAip6GQ2+/CR2tbQojiLRASZxlPvG7U40D1jxdz9Zw5AeuXweazUJO130oQBMKQAKvzAlw5GmlApW0Bv3DN6S1OnM1mUhxhCwMa5tL1HOWE3U5LVI5gcaWFljd1AQpTXOpvT2BSyAAGbx6jkejBgSFoESLpn1gy5/2YoTXOfVfbVIMr7cRlkfWetY5+SFE6RuJvygK/uApcZ9LEo8FntwB8CS8nyLt2Lv3WT87inkW86AG0vK1WwuCwJP44OkdAE/DB0lKmYDB19l9KxQOpAB1zBMiacGdAE9CwHsPUow0Su8+BeKAT0aBiEJgfr2fumLrOBQgcSngAT4goLkDFAhKQ9+fOVOO5gXMF5QKRahgXGBteVnZdlPOcmeZiDqVeN7xxYmznNVuWb0GVjatdPeTJKIAM4L96t5gCPjCbAE29PTAlk2bQEuleDjKMosQRagsXztzWL1KtQpjhQLoK1Z4k/XmTf4FS2tbu7c38fACAWkYR7+o7A06wRNHo1o6Dc888QRsfegh3nk5C0BBZVHqDAwNQd/UFFCPDxxWt7XBcH8/tNFg8BE3c/qUOMDpBWROi0arqPrru7stlWMdvnD5MtSwnAHRMDLbtGGDxXV2X/YY8rVf2QOdnXB5cBAaV63ynrg4Rp4odkSiQDANxnD0p30DIS/wgpvs0xPxwq/OnoUFXbdNKgrir2vXYNdzz7mAOfnuVcYEssCEGTwHVsBT10p2JApc9V8QMcFXWOxfqUqhJVUEwO5Pzs2po4P3JmZmXEC9MlXmG3YOm3aLDRwBnn3TOF+aV/sZ7AWmcPTHfbbG7JFvYhYXJx2yUMCx9eTVWcNjpP3AetWJsh0kj/xVpMs/gwMu9xswJ+3zXRVmDzPVnSvOQRpVm+Uiuj3DsNVZpkDgMlWC0bdoEbCmJwx1pVqBsdExSGcy3DiP3hrFqXJNsgmejzOrP+I5GbJ8L03Bus2bIWd+K8xeMDl805pjhwnAi9dh9kCuw1d6QtYTiDlQJQTchFrK0nSxCKulCNGHSldR/Y3A7fG0loLJ0VHr5vTYGP/+llJ3x6MIIAkdAi24qer5XB6ABWRmyqIHSov1AW8Nmsd8I2RZXER7BVhgRrBchur8vBLKCg2gIWoal/txjKDgf2NDDgzUhAr28b6VTYob90j9OPq10FVhBlTPpPlns2PDw5DLNShhLRNAmMG6rdGPYgTNft6/Zg0fLAxQYFVTkys8llKVzfuDF0QcXqA4Pc0BN2Sz0ofIwEGIFdlAQxWT+1EpYFl7UwvyehZ09sk8VSNZRxrA0a8GCqCGUsznclDiX4svaoHXzI441u38OnlbxjBEBai0et2O4bGuZ1zrmWBTqSYmPUHL4rUTx4/D1oe3QjbbwAEzVU+lNPU7HIcal0slKKH1lTOzG0m4r1AgZKVYDoS8wHMNtoM0PuUNWxN8bWJi4sRnRz4lbx0+DL9fvAALqBHynJ0JRZNekEVqvLl/vzKZMaRfgcQdfTm4mh0egQW0PcoPKswd37bWVoUCXuBTWP7TDz+wsuGw0ecCuNHXd7K9u7vx1q1bR744ehReP3gQBocGgQKxv8bEf9mMrnS8FTvjN+NLMg8Qz2/ZuoXHIYvgxK9LqNUPawMH1N0rVr9Snodff/kVzp8/z2KYH8WUN5BUYuRQCO/h4YOuri54ZNs2VR3ZfB1d44Z165Q5vey2nOXEvsHbserL5+I585y9g80n1O/9w7a7Fz3UxPg4XL50CXAgmUAvYiT7dF9v70RkAZhCOIiHHg87QaxZM6U6vkCXwn9DOo9y/C83DYv4kp9xZno6yi/GXAJYjmnZ/3L0ngDuCeCeAJZ3+hd0gyDgPfYKaAAAAABJRU5ErkJggg==';
    _Menubar['Save\>'].iconurl = Savepng; // @jsbRoot:"pics/save.png"
    _Menubar['Save\>'].style = Iconstyle;

    // Glyphicon Exit
    _Menubar['X\>'] = {};
    _Menubar['X\>'].id = 'Exit';
    Exitpng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAlklEQVR4Xu3XQQqFIBRGYRMX2ltJuZLeTk2Q+AdyhSg9A7vQ+HyoIbrpZ8nfnr+tcyeWTj1+QNy1Gt6xwwOCcS46zIRbcNCAVQgEIAQIEAIECGECSES4EUivIMr8qhUAVkIACjH1ZfS/zoEn4+2/4Pktmaw4tAWKAwDFAYDiAEBxAKA4BVC8DeBfRmlU63uYWIDYP2M3TlI3GAOjS6m4AAAAAElFTkSuQmCC';
    _Menubar['X\>'].iconurl = Exitpng; // @jsbRoot:"pics/exit.png"
    _Menubar['X\>'].style = Iconstyle;

    Menuheight = 33;
    Htmlmenubar = MenuBar(_Menubar, 'ED', false, false, Menuheight);
    Externalopen = (InStr1(1, F_File, '@rpc.') || InStr1(1, F_File, '@'));

    if (Not(F_File)) {
        await JSB_TCL_EDITOR_REMOVEFROMRECENTLIST_Sub(Truetblname, '', function (_Truetblname, _P2) { Truetblname = _Truetblname });
        return Stop('File not found: ', Fname);
    }

    Itemi = LBound(Inames) - 1;
    for (Iname of iterateOver(Inames)) {
        Itemi++;
        var Ext = fieldRight(UCase(Iname), '.');
        var Hdoc = (Ext == 'HTM' || Ext == 'HTML');

        Hdoc = (Hdoc || LCase(Truetblname) == 'jsb_docs');

        if (InStr1(1, _Options, 'W')) {
            Print(JSB_HTML_SCRIPT('\r\n\
             window.top.open("' + jsbRootAct() + '?' + urlEncode('ED ' + Fname + ' ' + CStr(Iname) + ' (' + CStr(Fromlineno)) + '", "_blank");\r\n\
          '));
            Inames = [undefined,];
            continue;
        }

        if (UCase(Fname) != 'SYSTEM' && isBinaryFile(Iname)) {
            Ans = await JSB_BF_MSGBOX(CStr(Iname) + ' appears to be a binary file, continue to edit?', 'Yes,*No');
            if (Ans != 'Yes') continue;
        }

        // Loop on redislay
        Loaditem = true;

        while (true) {
            if (CBool(Loaditem)) {
                Loaditem = false;
                Newitem = false;

                Item = '';
                if (CBool(Externalopen)) {
                    if (await JSB_ODB_READJSON(Item, F_File, CStr(Iname), function (_Item) { Item = _Item })) {
                        if (HasTag(Item, 'ItemContent') && UBound(Item) == 2) Item = Item.ItemContent;
                        if (!Len(Item)) Item = '';
                    } else {
                        if (await JSB_ODB_READ(Item, F_File, CStr(Iname), function (_Item) { Item = _Item })); else Newitem = true;
                    }
                } else {
                    if (await asyncRead(F_File, Iname, "JSON", 0, _data => Item = _data)) {
                        if (HasTag(Item, 'ItemContent') && UBound(Item) == 2) Item = Item.ItemContent;
                        if (!Len(Item)) Item = '';
                    } else {
                        if (await asyncRead(F_File, Iname, "", 0, _data => Item = _data)); else Newitem = true;
                    }
                }

                if (CBool(Newitem)) {
                    await JSB_TCL_EDITOR_REMOVEFROMRECENTLIST_Sub(Truetblname, Iname, function (_Truetblname, _Iname) { Truetblname = _Truetblname; Iname = _Iname });
                } else {
                    await JSB_TCL_EDITOR_UPDATERECENTLIST_Sub(Truetblname, Iname, function (_Truetblname, _Iname) { Truetblname = _Truetblname; Iname = _Iname });
                    if (isValidJSon(Item)) Item = CJSon(Item);
                    if (CBool(isArray(Item))) Item = '[' + Join(Item, ',' + am) + ']';
                }

                if (CBool(Newitem) && Hdoc && Ext != 'HTM' && Ext != 'HTML') {
                    Iname = CStr(Iname) + '.HTM';

                    if (await JSB_ODB_READ(Item, F_File, CStr(Iname), function (_Item) { Item = _Item })) {
                        Newitem = false;
                    } else {
                        Item = ('* Category: BASIC Language|New Docs\<br\>\<br\>');
                        Item = Replace(Item, -1, 0, 0, 'The XXXXX function will \<br\>');
                        Item = Replace(Item, -1, 0, 0, '\<br\>');
                        Item = (Replace(Item, -1, 0, 0, '&lt;example&gt;\<br\>'));
                        if (InStr1(1, Iname, 'tcl')) {
                            Item = (Replace(Item, -1, 0, 0, '&nbsp;&nbsp;&nbsp;TCL&gt; Echo Hi'));
                        } else {
                            Item = (Replace(Item, -1, 0, 0, '&nbsp;&nbsp;&nbsp;Print @cols2("90px", "here is one", "100px", "here is another")'));
                        }
                        Item = (Replace(Item, -1, 0, 0, '\<br\>\<br\>&lt;/example&gt;\<br\>'));
                    }
                }

                if (CBool(Newitem)) Msg = 'New item';

                Useniceditor = 0;
                Useaceeditor = 0;
                Usetextarea = 0;

                if (InStr1(1, UCase(_Options), 'I')) {
                    Usetextarea = true;;
                } else if (InStr1(1, UCase(_Options), 'C')) {
                    Usecodemirror = true;;
                } else if (InStr1(1, _Options, 'A')) {
                    Useaceeditor = true;;
                } else if (InStr1(1, Item, '\<head') || InStr1(1, Item, '\<html')) {
                    Useniceditor = InStr1(1, _Options, 'N');
                    Useaceeditor = Not(Useniceditor);
                } else {
                    Useniceditor = (Hdoc || await JSB_BF_ISHTMLDOC(Dictdata, Tablename, CStr(Iname)) || InStr1(1, _Options, 'N'));
                    Useaceeditor = Not(Useniceditor);
                }

                Item = CleanupText(CStr(Item));
                Item = Change(Item, Chr(28), am);
                Item = Change(Item, Chr(29), am);

                if (CBool(Useniceditor)) {
                    Item = Change(Item, '\<br /\>', '\<br\>');
                    Item = Change(Item, '\<br/\>', '\<br\>');
                    Item = Change(Item, '\</div \>', '\</div\>');
                    if (InStr1(1, Item, '\<br\>') == 0) Item = Change(Item, am, '\<br\>'); else Item = Change(Item, am, Chr(10));
                    Item = (Change(Item, '\< ', '&lt; ')); // If It's not a tag

                    // Change > to &gt; if it's not part of a tag
                    P = 1;

                    while (true) {
                        Np = InStr1(P, Item, '\<');
                        if (Not(Np)) Np = Len(Item) + 1;

                        while (true) {
                            Nc = InStr1(P, Item, '\>');
                            if (Not(Null0(Nc) > '0' && Null0(Nc) < Null0(Np))) break;
                            Item = (Left(Item, +Nc - 1) + '&gt;' + Mid1(Item, +Nc + 1));
                        }

                        if (Not(Null0(Np) <= Len(Item))) break;
                        // move p to next <tag
                        P = +Np + 1;

                        Tag = Mid1(Item, P, 50);
                        Tag = Field(Tag, '/\>', 1, true);
                        Tag = Field(Tag, '\>', 1, true);
                        Tag = Field(Tag, ' ', 1, true);
                        if (Left(Tag, 1) == '/' || Tag == 'blockquote' || Tag == 'br' || Tag == 'span' || Tag == 'font' || Tag == 'div' || Tag == 'input') {
                            P = InStr1(P, Item, '\>') + 1;
                        }
                    }
                }

                // Auto format?
                Af = InStr1(1, Item, '* EDITOR-OPTION: AUTOFORMAT');
                if (Null0(Af) > '0' && Null0(Af) < 3000) {
                    if (LCase(Right(Iname, 3)) == '.js') {
                        Item = CStr(JSB_BF_FORMATCODEJS(CStr(Item), 4, false), true);
                    } else {
                        Item = CStr(formatCode(CStr(Item), 4, false), true);
                    }
                } else if (isValidJSon(Item)) {
                    J = CJSon(Item);
                    if (typeOf(J) == 'Array') {
                        Pp = { "pp": J };
                        Item = CStr(Pp, true);
                        Item = '[{' + dropLeft(dropLeft(CStr(Item), '['), '{');
                        Item = dropRight(CStr(Item), '}');
                        Item = Change(Item, am, crlf);
                        Item = Change(Item, crlf + Chr(9) + Chr(9), crlf);
                        Item = Change(Item, crlf + Space(8), crlf);
                    } else {
                        Item = CStr(J, true);
                    }
                    Item = CleanupText(CStr(Item));
                }

                Prerun = '';
                Rawitem = Item;
            }

            Print(At(-1), Prerun); // // @jsb_bf.theme('flatly'):
            Prerun = '';

            // Force PostBack into btn
            // HTMLMenuBar = HTMLMenuBar:@genEventHandler("SelectMenu", Null, 7, 'btn')

            if (CBool(Useaceeditor)) {
                Htmlmenubar += JSB_HTML_SCRIPT('\r\n\
                   function CheckUnDoReDo(preform) {\r\n\
                        if (!aceEditor) {\r\n\
                            clearInterval(undoRedoTimer)\r\n\
                            return\r\n\
                        }\r\n\
                        \r\n\
                        var um = aceEditor.getSession().getUndoManager();\r\n\
                        \r\n\
                        if (preform) {\r\n\
                            if (preform == \'Undo\') {\r\n\
                                if (um.hasUndo()) um.undo(); else alert(\'no more undos\');\r\n\
                                \r\n\
                            } else if (preform == \'Redo\') {\r\n\
                                 if (um.hasRedo()) um.redo(); else alert(\'no more redos\');\r\n\
                            }\r\n\
                        }\r\n\
                        \r\n\
                        var hasUndo = um.hasUndo();\r\n\
                        var hasRedo = um.hasRedo();\r\n\
                        \r\n\
                        $(\'#Undo\').css(\'pointer-events\', hasUndo?\'all\':\'none\').css(\'opacity\', hasUndo?1:0.6);\r\n\
                        $(\'#Redo\').css(\'pointer-events\', hasRedo?\'all\':\'none\').css(\'opacity\', hasRedo?1:0.6);\r\n\
                   }\r\n\
                   \r\n\
                   var undoRedoTimer = setInterval(CheckUnDoReDo, 500);\r\n\
                ');
            }

            // Display Text Area

            Txt = Item;
            if (CBool(Useniceditor)) {
                // If Instr(Txt, "<br>") = 0 Then Txt = Change(Txt, am(), "<br>") Else Txt = Change(Txt, am(), crlf())
                Cm = JSB_HTML_NICEDITOR(CStr(Edtname), CStr(Txt));
            } else {
                Txt = Change(Txt, am, crlf);
                if (InStr1(1, UCase(_Options), 'I')) {
                    Cm = JSB_HTML_TEXTAREA(CStr(Edtname), CStr(Txt), CStr(25), CStr(120));;
                } else if (InStr1(1, UCase(_Options), 'C')) {
                    Txt = htmlEscape(Txt);
                    Cm = JSB_HTML_CODEMIRROR(CStr(Edtname), CStr(Txt));
                } else {
                    Txt = htmlEscape(Txt);
                    Cm = AceEditor(Edtname, Txt, Fromlineno);

                    Cm += Hidden(CStr(Edtname) + '_searchFor', CStr(Searchfor));
                    Cm += Hidden(CStr(Edtname) + '_replaceWith', CStr(Replacewith));
                    Cm += Hidden(CStr(Edtname) + '_regExpSearch', CStr(Regexpsearch));
                    Cm += Hidden(CStr(Edtname) + '_caseSensitiveSearch', CStr(Casesensitivesearch));
                    Cm += Hidden(CStr(Edtname) + '_wholeWordSearch', CStr(Wholewordsearch));
                    Cm += Hidden(CStr(Edtname) + '_replaceOpen', CStr(Replaceopen));
                    Cm += Hidden(CStr(Edtname) + '_findOpen', CStr(Findopen));

                    // Cm = CM:@addAceCompletetions();
                }
            }

            Cmds = ' ed ' + Fname + ' ' + CStr(Iname) + ' (' + CStr(DCount(Item, am)) + ' Lines) ' + Chr(28) + ' ' + Chr(29);
            if (isSqlServer(F_File)) Cmds += ' *SQL*';

            if (InStr1(1, Msg, '!')) {
                if (Left(Msg, 1) == '!') Msg = Mid1(Msg, 2);
                await JSB_BF_MSGBOX('Message', CStr(Msg), 'OK');
                Msg = '';
            } else if (CBool(Msg)) {
                Cmds = CStr(Cmds) + ' *' + CStr(Msg) + '*';
            }

            // Options: Fixed (!resizable, !slidable, !closable),  minSize:int, maxSize:int, startsize:int, initClosed, initHidden, allowOverFlow
            Print(LAYOUT(CStr(Cm), CStr(Htmlmenubar), 'startsize:' + CStr(+Menuheight + 2) + ', allowoverflow, Fixed', CStr(Cmds), 'startsize:26, Fixed', '', '', '', ''));

            Print(JSB_HTML_SCRIPT('\r\n\
                function doEditorPostBack(event, command) {\r\n\
                   if (!event) event = window,event;\r\n\
                   preventTheDefault(event);\r\n\
                   $(window).unbind(\'keydown\', window.editorKeyDown);\r\n\
                   assignBtn(\'btn\', command)\r\n\
                   doJsbSubmit();\r\n\
                }\r\n\
            '));

            // Capture Control-S, make it postback
            Print(JSB_HTML_SCRIPT('\r\n\
                function editorKeyDown(event) {\r\n\
                   if (event.ctrlKey || event.metaKey) {\r\n\
                       switch (String.fromCharCode(event.which).toLowerCase()) {\r\n\
                           case \'s\':\r\n\
                               doEditorPostBack(event, \'Save\'); break\r\n\
                           case \'k\':\r\n\
                               doEditorPostBack(event, \'Format\'); break\r\n\
                           case \'b\':\r\n\
                               doEditorPostBack(event, \'Build\'); break\r\n\
                           case \'r\':\r\n\
                               doEditorPostBack(event, \'Run\'); break\r\n\
                           case \'d\':\r\n\
                               doEditorPostBack(event, \'Debug\'); break\r\n\
                       }\r\n\
                   } else {\r\n\
                       if (event.key == "F5") doEditorPostBack(event, \'Run\');\r\n\
                   }\r\n\
                }\r\n\
                \r\n\
                $(window).bind(\'keydown\', editorKeyDown);\r\n\
            '));

            await At_Server.asyncPause(me);

            Fromlineno = formVar(CStr(Edtname) + '_lineNo');
            Searchfor = formVar(CStr(Edtname) + '_searchFor');
            Replacewith = formVar(CStr(Edtname) + '_replaceWith');
            Regexpsearch = CNum(formVar(CStr(Edtname) + '_regExpSearch'));
            Casesensitivesearch = CNum(formVar(CStr(Edtname) + '_caseSensitiveSearch'));
            Wholewordsearch = CNum(formVar(CStr(Edtname) + '_wholeWordSearch'));
            Replaceopen = CNum(formVar(CStr(Edtname) + '_replaceOpen'));
            Findopen = CNum(formVar(CStr(Edtname) + '_findOpen'));

            Txt = formVar(Edtname);
            Btn = CStr(formVar('btn')) + CStr(formVar('SelectedMenu'));
            if (Txt != Chr(27)) Item = Txt;

            Item = CleanupText(CStr(Item), CStr(true));

            Item = Change(Item, Chr(13) + Chr(10), Chr(10));

            if (CBool(Useniceditor)) {
                Item = Change(Item, '\<br /\>', '\<br\>');
                Item = Change(Item, '\<br/\>', '\<br\>');
                Item = Change(Item, '\</div \>', '\</div\>');
                Item = (Change(Item, '\< ', '&lt; ')); // If It's not a tag

                // Get rid of nested DIV's - they come from cutting and pasting
                Docdiv = '\<div class="docExample"\>';
                Item = Change(Item, '\</div\>' + CStr(Docdiv), '\<br\>');

                Di = 0;

                while (true) {
                    Di = InStr1(+Di + 1, Item, Docdiv);
                    if (Not(CBool(Di))) break;
                    Ndd = InStr1(+Di + 1, Item, Docdiv);
                    if (Not(Ndd)) break;

                    Ned = InStr1(Di, Item, '\</div\>');
                    if (Not(Ned)) break;

                    if (Null0(Ndd) < Null0(Ned)) {
                        // Example DIV embedded in another - remove inner one
                        Item = Left(Item, +Ndd - 1) + Mid1(Item, +Ndd + Len(Docdiv));
                        Ned = InStr1(Di, Item, '\</div\>');
                        Item = Left(Item, +Ned - 1) + '\<br\>' + Mid1(Item, +Ned + Len('\</div\>'));
                    }
                };
            } else if (isValidJSon(Item)) {
                Item = Change(Item, Chr(13) + Chr(10), Chr(10));;
            } else {
                Item = Change(Item, Chr(13), am);
                Item = Change(Item, Chr(10), am);
            }

            // Exit (ALL)

            if (Btn == 'Exit!') {
                Inames = [undefined,];
                return Stop();
            }

            if (Btn == 'Detach') {
                if (Null0(Item) != Null0(Rawitem)) {
                    await JSB_BF_TRASHIT(Fname, CStr(Iname));// Fname Contains Dict If Necessary
                    if (CBool(Externalopen)) {
                        if (isValidJSon(Item)) {
                            if (await JSB_ODB_WRITEJSON(Item, F_File, CStr(Iname))); else {
                                Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                            }
                        } else {
                            if (await JSB_ODB_WRITE(CStr(Item), F_File, CStr(Iname))); else {
                                Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                            }
                        }
                    } else if (isValidJSon(Item)) {
                        if (await asyncWrite(Item, F_File, Iname, "JSON", 0)); else {
                            Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                        }
                    } else {
                        if (await asyncWrite(Item, F_File, Iname, "", 0)); else {
                            Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                        }
                    }
                }

                Print(JSB_HTML_SCRIPT('\r\n\
                        window.top.open("' + jsbRootAct() + '?' + urlEncode('ED ' + Fname + ' ' + CStr(Iname) + ' (' + CStr(Fromlineno)) + '", "_blank");\r\n\
                    '));
                FlushHTML();
                break;
            }

            if (Btn == 'Who') Msg = JSB_BF_WHO();

            // Exit

            if (Btn == 'Exit') {
                if (Null0(Item) != Null0(Rawitem)) {
                    if (Len(Item) > 100000 && System(1) != 'js') {
                        Print(At(-1)); // Save Some Bandwidth;
                    }
                    Ans = await JSB_BF_MSGBOX('Confirm Exit', CStr(Iname) + ' has changed, save before exiting? ', '*Yes,No,Cancel,Compare');
                    if (Ans == 'No') break;
                    if (Ans == 'Yes') Btn = 'Save\>';

                    if (Ans == 'Compare') {
                        Print(At(-1));
                        await JSB_TCL_DOCOMPARE_Sub([undefined, CStr(Iname) + ' Edited Version', CStr(Iname) + ' Original'], Item, Rawitem, false, false, false, false, false, 2, 1, 132, Nochanges, function (_P1, _Item, _Rawitem, _P4, _P5, _P6, _P7, _P8, _P9, _P10, _P11, _Nochanges) { Item = _Item; Rawitem = _Rawitem; Nochanges = _Nochanges });

                        Print(JSB_HTML_SUBMITBTN('Btn', 'Back to editor'), ' ', JSB_HTML_SUBMITBTN('Btn', 'Save Edits'), ' ', JSB_HTML_SUBMITBTN('Btn', 'Exit'), ' ');
                        await At_Server.asyncPause(me);
                        if (formVar('Btn') == 'Exit') break;
                        if (formVar('Btn') == 'Save Edits') Btn = 'Save\>';
                    }
                } else {
                    break;
                }
            }

            if (Btn == 'Reload') {
                if (Null0(Item) != Null0(Rawitem)) {
                    if (Len(Item) > 100000 && System(1) != 'js') {
                        Print(At(-1)); // Save Some Bandwidth;
                    }
                    Ans = await JSB_BF_MSGBOX('Confirm Reload', CStr(Iname) + ' has changed, do you want to save first? ', '*Yes,No,Cancel');
                    if (Ans == 'Yes') {
                        await JSB_BF_TRASHIT(Fname, CStr(Iname));// Fname Contains Dict If Necessary
                        if (CBool(Externalopen)) {
                            if (isValidJSon(Item)) {
                                if (await JSB_ODB_WRITEJSON(Item, F_File, CStr(Iname))); else {
                                    Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                                }
                            } else {
                                if (await JSB_ODB_WRITE(CStr(Item), F_File, CStr(Iname))); else {
                                    Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                                }
                            }
                        } else if (isValidJSon(Item)) {
                            if (await asyncWrite(Item, F_File, Iname, "JSON", 0)); else {
                                Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                            }
                        } else {
                            if (await asyncWrite(Item, F_File, Iname, "", 0)); else {
                                Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                            }
                        }
                        Rawitem = Item;
                        Msg = CStr(Iname) + ' Saved';
                        await JSB_TCL_EDITOR_UPDATERECENTLIST_Sub(Truetblname, Iname, function (_Truetblname, _Iname) { Truetblname = _Truetblname; Iname = _Iname });
                    }
                    if (Ans == 'Cancel' || isEmpty(Ans)) {
                        continue; // Redisplay;
                    }
                }

                Loaditem = true;
                break;
            }

            // Delete

            if (Btn == 'Delete') {
                if (Len(Item) > 100000 && System(1) != 'js') {
                    Print(At(-1)); // Save Some Bandwidth;
                }
                Ans = await JSB_BF_MSGBOX('Confirm Delete', 'Are you sure you want to Delete ' + CStr(Iname) + '?', 'Yes,*Cancel');
                if (Ans == 'Yes') {
                    await JSB_BF_TRASHIT(Fname, CStr(Iname));// Fname Contains Dict If Necessary
                    if (await JSB_ODB_DELETEITEM(F_File, CStr(Iname))) {
                        Print(At(-1));
                        await JSB_TCL_EDITOR_REMOVEFROMRECENTLIST_Sub(Truetblname, Iname, function (_Truetblname, _Iname) { Truetblname = _Truetblname; Iname = _Iname });
                        break;
                    } else {
                        Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                    }
                }
            }

            // Restore

            if (Btn == 'Restore') {
                if (Len(Item) > 100000 && System(1) != 'js') {
                    Print(At(-1)); // Save Some Bandwidth;
                }
                if (!(await JSB_BF_PREVIOUSVERSIONNUMBER(Fname, CStr(Iname)))) {
                    await JSB_BF_MSGBOX('Sorry, I couln\'t find a previous version');
                } else {
                    Ans = await JSB_BF_MSGBOX('Confirm Restore', 'Restore the previous version of ' + CStr(Iname) + '?', 'Yes,*Cancel');
                    if (Ans == 'Yes') {
                        await JSB_BF_UNTRASHIT(Fname, CStr(Iname));// Fname Contains Dict If Necessary
                        Loaditem = true;
                        break;
                    }
                }
            }

            // Save As

            if (Btn == 'Save As') {
                Ans = await JSB_BF_INPUTBOX('Item ' + CStr(Iname), 'Save a copy as: ', undefined, undefined, undefined);
                if (isEmpty(Ans) || Ans == Chr(27)) {
                    continue; // Redisplay;
                }
                if (await JSB_ODB_READ(Exists, F_File, CStr(Ans), function (_Exists) { Exists = _Exists })) {
                    if (Len(Item) > 100000 && System(1) != 'js') {
                        Print(At(-1)); // Save Some Bandwidth;
                    }
                    if (await JSB_BF_MSGBOX('Confirm', CStr(Ans) + ' already exists on file, overwrite?', 'Yes,*Cancel') != 'Yes') {
                        continue; // Redisplay;
                    }
                }
                await JSB_BF_TRASHIT(Fname, CStr(Ans));// Fname Contains Dict If Necessary

                if (CBool(Externalopen)) {
                    if (isValidJSon(Item)) {
                        if (await JSB_ODB_WRITEJSON(Item, F_File, CStr(Ans))); else {
                            Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                        }
                    } else {
                        if (await JSB_ODB_WRITE(CStr(Item), F_File, CStr(Ans))); else {
                            Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                        }
                    }
                } else if (isValidJSon(Item)) {
                    if (await asyncWrite(Item, F_File, Ans, "JSON", 0)); else {
                        Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                    }
                } else {
                    if (await asyncWrite(Item, F_File, Ans, "", 0)); else {
                        Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                    }
                }

                Rawitem = Item;
                Iname = Ans;
                Msg = CStr(Iname) + ' Saved';
                await JSB_TCL_EDITOR_UPDATERECENTLIST_Sub(Truetblname, Iname, function (_Truetblname, _Iname) { Truetblname = _Truetblname; Iname = _Iname });
            }

            if (Btn == 'Rename') {
                Ans = await JSB_BF_INPUTBOX('Item ' + CStr(Iname), 'Rename as: ', CStr(Iname), undefined, undefined);
                if (isEmpty(Ans) || Ans == Chr(27)) {
                    continue; // Redisplay;
                }
                if (await JSB_ODB_READ(Exists, F_File, CStr(Ans), function (_Exists) { Exists = _Exists })) {
                    if (Len(Item) > 100000 && System(1) != 'js') {
                        Print(At(-1)); // Save Some Bandwidth;
                    }
                    if (await JSB_BF_MSGBOX('Confirm', CStr(Ans) + ' already exists on file, overwrite?', 'Yes,*Cancel') != 'Yes') {
                        continue; // Redisplay;
                    }
                    await JSB_BF_TRASHIT(Fname, CStr(Ans));// Fname Contains Dict If Necessary;
                }

                if (CBool(Externalopen)) {
                    if (isValidJSon(Item)) {
                        if (await JSB_ODB_WRITEJSON(Item, F_File, CStr(Ans))); else {
                            Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                        }
                    } else {
                        if (await JSB_ODB_WRITE(CStr(Item), F_File, CStr(Ans))); else {
                            Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                        }
                    }
                    if (await JSB_ODB_DELETEITEM(F_File, CStr(Iname))); else {
                        Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                    }
                } else if (isValidJSon(Item)) {
                    if (await asyncWrite(Item, F_File, Ans, "JSON", 0)); else {
                        Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                    }
                    if (await asyncDelete(F_File, Iname)); else {
                        Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                    }
                } else {
                    if (await asyncWrite(Item, F_File, Ans, "", 0)); else {
                        Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                    }
                    if (await asyncDelete(F_File, Iname)); else {
                        Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                    }
                }
                Rawitem = Item;

                await JSB_TCL_EDITOR_REMOVEFROMRECENTLIST_Sub(Truetblname, Iname, function (_Truetblname, _Iname) { Truetblname = _Truetblname; Iname = _Iname });
                await JSB_TCL_EDITOR_UPDATERECENTLIST_Sub(Truetblname, Ans, function (_Truetblname, _Ans) { Truetblname = _Truetblname; Ans = _Ans });

                Iname = Ans;
                Msg = CStr(Ans) + ' Renamed';
            }

            // Save>

            if (Btn == 'Save' || Btn == 'Save\>') {
                await JSB_BF_TRASHIT(Fname, CStr(Iname));// Fname Contains Dict If Necessary
                Msg = CStr(Iname) + ' Saved';
                if (CBool(Externalopen)) {
                    if (isValidJSon(Item)) {
                        if (await JSB_ODB_WRITEJSON(Item, F_File, CStr(Iname))); else {
                            Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                        }
                        Msg += ' as JSON';
                    } else {
                        if (await JSB_ODB_WRITE(CStr(Item), F_File, CStr(Iname))); else {
                            Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                        }
                    }
                } else if (isValidJSon(Item)) {
                    if (await asyncWrite(Item, F_File, Iname, "JSON", 0)); else {
                        Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                    }
                    Msg += ' as JSON';
                } else {
                    if (await asyncWrite(Item, F_File, Iname, "", 0)); else {
                        Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                    }
                }
                Rawitem = Item;

                await JSB_TCL_EDITOR_UPDATERECENTLIST_Sub(Truetblname, Iname, function (_Truetblname, _Iname) { Truetblname = _Truetblname; Iname = _Iname });

                if (Btn == 'Save\>') { Print(At(-1)); break; }
            }

            // Compile

            if (Btn == 'Compile' || Btn == 'Compile\>' || Btn == 'Run' || Btn == 'Debug' || Btn == 'PC' || Btn == 'PC\>') {
                if (Right(LCase(Iname), 3) == '.js') {
                    Msg = '!I don\'t compile javascript'; continue; // Redisplay;
                }

                if (System(1) == 'js') {
                    Actrun = 'run';
                    window.Commons_JSB_BF.Dbg_Lastfname = '';
                } else {
                    Actrun = 'aexecute';
                }

                if (Hdoc) {
                    Errcnt = await JSB_TCL_EXTRACTEXAMPLES(Iname, Item, Examplename, function (_Item, _Examplename) { Item = _Item; Examplename = _Examplename });
                    if (Null0(Errcnt) == '0') {
                        await JSB_BF_TRASHIT(Fname, CStr(Iname));// Fname Contains Dict If Necessary
                        if (CBool(Externalopen)) {
                            if (isValidJSon(Item)) {
                                if (await JSB_ODB_WRITEJSON(Item, F_File, CStr(Iname))); else {
                                    Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                                }
                            } else {
                                if (await JSB_ODB_WRITE(CStr(Item), F_File, CStr(Iname))); else {
                                    Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                                }
                            }
                        } else if (isValidJSon(Item)) {
                            if (await asyncWrite(Item, F_File, Iname, "JSON", 0)); else {
                                Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                            }
                        } else {
                            if (await asyncWrite(Item, F_File, Iname, "", 0)); else {
                                Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                            }
                        }
                        Rawitem = Item;

                        await JSB_TCL_EDITOR_UPDATERECENTLIST_Sub(Truetblname, Iname, function (_Truetblname, _Iname) { Truetblname = _Truetblname; Iname = _Iname });

                        if (Btn == 'Run') {
                            Print(await JSB_BF_POPOUTWINDOW('example', JSB_BF_JSBROOTEXECUTETCLCMD(CStr(Actrun) + ' examples ' + CStr(Examplename)), true, '80%', '60%'));
                        }
                    }
                } else {
                    if (Null0(Item) != Null0(Rawitem)) {
                        await JSB_BF_TRASHIT(Fname, CStr(Iname));// Fname Contains Dict If Necessary
                        if (CBool(Externalopen)) {
                            if (isValidJSon(Item)) {
                                if (await JSB_ODB_WRITEJSON(Item, F_File, CStr(Iname))); else {
                                    Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                                }
                            } else {
                                if (await JSB_ODB_WRITE(CStr(Item), F_File, CStr(Iname))); else {
                                    Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                                }
                            }
                        } else if (isValidJSon(Item)) {
                            if (await asyncWrite(Item, F_File, Iname, "JSON", 0)); else {
                                Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                            }
                        } else {
                            if (await asyncWrite(Item, F_File, Iname, "", 0)); else {
                                Msg = '!' + CStr(activeProcess.At_Errors); continue; // Redisplay;
                            }
                        }

                        await JSB_TCL_EDITOR_UPDATERECENTLIST_Sub(Truetblname, Iname, function (_Truetblname, _Iname) { Truetblname = _Truetblname; Iname = _Iname });
                        Rawitem = Item;
                    }

                    if (Btn == 'PC' || Btn == 'PC\>') {
                        await asyncTclExecute('PC ' + Fname + ' ' + CStr(Iname), _capturedData => Xmsg = _capturedData);
                    } else {
                        await asyncTclExecute('BASIC ' + Fname + ' ' + CStr(Iname), _capturedData => Xmsg = _capturedData);
                    }

                    if (InStr1(1, Xmsg, Chr(14))) {
                        Eline = Field(Xmsg, Chr(14), 2, true);
                        Fromlineno = Field(Eline, ' ', 1, true);
                        Eline = Mid1(Eline, activeProcess.Col2 + 1);
                        Errcnt = 1;
                        Msg = '!Error: ' + CStr(Eline);;
                    } else if (InStr1(1, Xmsg, Chr(15))) {
                        Eline = Field(Xmsg, Chr(15), 2, true);
                        Fromlineno = Field(Eline, ' ', 1, true);
                        Eline = Mid1(Eline, activeProcess.Col2 + 1);
                        Errcnt = 1;
                        Msg = Eline;
                        if (Btn == 'Compile\>') { Println(At(-1), 'Warnings: ', Eline); break; }
                        if (Len(Item) > 100000 && System(1) != 'js') {
                            Print(At(-1)); // Save Some Bandwidth;
                        }
                        await JSB_BF_MSGBOX(CStr(Eline));
                    } else if (InStr1(1, Xmsg, '^')) {
                        Xmsg = Change(Xmsg, crlf, am);
                        Xmsg = Change(Xmsg, Chr(13), am);
                        Xmsg = Change(Xmsg, Chr(10), am);
                        Xmsg = DropTags(CStr(Xmsg));

                        P = InStr1(1, Xmsg, '^');

                        Errcnt = 1;

                        Lineno = DCount(Mid1(Xmsg, 1, P), am);
                        Bline = Extract(Xmsg, +Lineno - 1, 0, 0);
                        Eline = Extract(Xmsg, Lineno, 0, 0);
                        Aline = Extract(Xmsg, +Lineno + 1, 0, 0);

                        Fromlineno = CNum(Eline);
                        if (Not(Fromlineno)) Fromlineno = CNum(Bline);

                        Msg = '!' + CStr(Bline) + crlf + CStr(Eline) + crlf + CStr(Aline);
                    } else {
                        Errcnt = 0;
                        Msg = 'Sucessful compile';
                    }

                    if ((Btn == 'Compile\>' || Btn == 'PC\>') && Null0(Errcnt) == '0') { Print(At(-1), 'SUCCESSFUL Compile\>'); break; }

                    Xmsg = LCase(Xmsg);
                    if (System(1) == 'js') {
                        Oktorun = InStrI1(1, Xmsg, '.js' + Chr(28));
                    } else {
                        Oktorun = InStrI1(1, Xmsg, LCase(Fname + ' ' + CStr(Iname) + '.pcd'));
                    }

                    if (CBool(Oktorun) && Null0(Errcnt) == '0') {
                        if (Btn == 'Run') {
                            Print(await JSB_BF_POPOUTWINDOW('example', JSB_BF_JSBROOTEXECUTETCLCMD(CStr(Actrun) + ' ' + Fname + ' ' + CStr(Iname)), true, '90%', '80%'));
                        } else if (Btn == 'Debug') {
                            Print(await JSB_BF_POPOUTWINDOW('example', JSB_BF_JSBROOTEXECUTETCLCMD(CStr(Actrun) + ' ' + Fname + ' ' + CStr(Iname) + ' ($$'), true, '90%', '80%'));
                        }
                    } else if (Null0(Errcnt) == '0' && (Btn == 'Run' || Btn == 'Debug')) {
                        await JSB_BF_MSGBOX('No PROGRAM code was compiled to run. ' + CStr(Xmsg) + '; \'' + LCase(Fname + ' ' + CStr(Iname)) + '.js' + '\'');
                    }
                }
            }

            // Format

            if (Btn == 'Format') {
                if (isValidJSon(Item)) {
                    J = CJSon(Item);
                    if (typeOf(J) == 'Array') {
                        Pp = { "pp": J };
                        Item = CStr(Pp, true);
                        Item = '[{' + dropLeft(dropLeft(CStr(Item), '['), '{');
                        Item = dropRight(CStr(Item), '}');
                        Item = Change(Item, am, crlf);
                        Item = Change(Item, crlf + Chr(9) + Chr(9), crlf);
                        Item = Change(Item, crlf + Space(8), crlf);
                    } else {
                        Item = CStr(J, true);
                    }
                } else if (LCase(Right(Iname, 3)) == '.js') {
                    Item = CStr(JSB_BF_FORMATCODEJS(CStr(Item), 4, false), true);
                } else {
                    Item = CStr(formatCode(CStr(Item), 4, false), true);
                }
            }

            // Sort

            if (Btn == 'Sort') {
                if (await JSB_BF_MSGBOX('Sort?', 'Yes,*No') == 'Yes') Item = Sort(Item);
            }

            if (Btn == 'Help') {
                Println(await JSB_BF_DIALOG('Editor Keyboard Short-Cuts', await JSB_TCL_EDITOR_HTMLHELP(), true, '80%', '80%'));
            }

        }

        // Move on to next item
        Reloaditem = true;
    }

    At_Session.Item('searchFor', Searchfor);
    At_Session.Item('replaceWith', Replacewith);
    At_Session.Item('regExpSearch', Regexpsearch);
    At_Session.Item('caseSensitiveSearch', Casesensitivesearch);
    At_Session.Item('wholeWordSearch', Wholewordsearch);
    At_Session.Item('replaceOpen', Replaceopen);
    At_Session.Item('findOpen', Findopen);

    if (CBool(paramVar('fromPage'))) return At_Response.Redirect(paramVar('fromPage'));
    At_Response.buffer(Savescreen);

    if (!isEmpty(Errors)) Println(MonoSpace(Change(Errors, am, crlf)));

    Println(JSB_HTML_SCRIPT('if (parent.refreshData) parent.refreshData();'), Msg);

    if (hasTclParent() || hasParentProcess() || CBool(Errors)) return Stop();

    At_Server.End();
    return;
}
// </ED_Pgm>

// <AEXECUTE_Pgm>
async function JSB_TCL_AEXECUTE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    if (Not(isAdmin())) return Stop('You must be an admnistrator to run this code');
    await asyncTclExecute(ChangeI(Change(activeProcess.At_Sentence, '($$', '(!'), 'aexecute', 'run'));
    return;
}
// </AEXECUTE_Pgm>

// <EDITOR_UPDATERECENTLIST_Sub>
async function JSB_TCL_EDITOR_UPDATERECENTLIST_Sub(ByRef_Tablename, ByRef_Itemname, setByRefValues) {
    // local variables
    var _Username, Recentlist, Tblname, I, Spot, L, Myitemids;
    var Spot2;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tablename, ByRef_Itemname)
        return v
    }
    if (Not(ByRef_Tablename)) return exit(undefined);

    if (System(1) == 'js') _Username = 'javascript'; else _Username = UserName();
    if (await JSB_ODB_READ(Recentlist, await JSB_BF_FHANDLE('', 'jsb_selectlists', true), 'EdRecentList_' + CStr(_Username), function (_Recentlist) { Recentlist = _Recentlist })); else Recentlist = 'Recent';

    I = LBound(Split(Recentlist, am)) - 1;
    for (Tblname of iterateOver(Split(Recentlist, am))) {
        I++;
        Tblname = Extract(Tblname, 1, 1, 0);
        if (Null0(I) > 1 && LCase(Tblname) == LCase(ByRef_Tablename)) { Spot = I; break; }
    }

    if (CBool(Spot)) {
        L = Extract(Recentlist, Spot, 0, 0);
        Recentlist = Delete(Recentlist, Spot, 0, 0);
        Recentlist = Replace(Recentlist, 2, 0, 0, CStr(L) + am + Extract(Recentlist, 2, 0, 0));
    } else {
        Recentlist = Replace(Recentlist, 2, 0, 0, CStr(ByRef_Tablename) + am + Extract(Recentlist, 2, 0, 0));


        while (DCount(Recentlist, am) > 8) {
            Recentlist = Delete(Recentlist, 9, 0, 0);
        }
    }

    Myitemids = Extract(Recentlist, 2, 0, 0);
    Myitemids = Delete(Myitemids, 1, 1, 0); // Drop TableName
    if (Locate(ByRef_Itemname, Myitemids, 1, 0, 0, "", position => Spot2 = position)) {
        if (Null0(Spot2) == 1 && Null0(Spot) == 2) {
            return exit(undefined); // No Change;
        }
        Myitemids = Delete(Myitemids, 1, Spot2, 0);
    }

    if (Len(Myitemids)) Myitemids = CStr(ByRef_Itemname) + vm + CStr(Myitemids); else Myitemids = ByRef_Itemname;

    Recentlist = Replace(Recentlist, 2, 0, 0, CStr(ByRef_Tablename) + vm + CStr(Myitemids));
    if (await JSB_ODB_WRITE(CStr(Recentlist), await JSB_BF_FHANDLE('', 'jsb_selectlists', true), 'EdRecentList_' + CStr(_Username))); else null;
    return exit();
}
// </EDITOR_UPDATERECENTLIST_Sub>

// <EDITOR_REMOVEFROMRECENTLIST_Sub>
async function JSB_TCL_EDITOR_REMOVEFROMRECENTLIST_Sub(ByRef_Tablename, ByRef_Itemname, setByRefValues) {
    // local variables
    var _Username, Recentlist, Tblname, I, Spot, Myitemids, Spot2;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Tablename, ByRef_Itemname)
        return v
    }
    if (Not(ByRef_Tablename)) return exit(undefined);
    return exit(undefined);

    if (System(1) == 'js') _Username = 'javascript'; else _Username = UserName();
    if (await JSB_ODB_READ(Recentlist, await JSB_BF_FHANDLE('', 'jsb_selectlists', true), 'EdRecentList_' + CStr(_Username), function (_Recentlist) { Recentlist = _Recentlist })); else return exit(undefined);
    Recentlist = Lower(Recentlist);

    I = LBound(Split(Recentlist, vm)) - 1;
    for (Tblname of iterateOver(Split(Recentlist, vm))) {
        I++;
        Tblname = Extract(Tblname, 1, 1, 1);
        if (Null0(I) > 1 && LCase(Tblname) == LCase(ByRef_Tablename)) { Spot = I; break; }
    }
    if (Not(Spot)) return exit(undefined);

    if (Not(ByRef_Itemname)) {
        Recentlist = Delete(Recentlist, 1, Spot, 0);
    } else {
        Myitemids = Extract(Recentlist, 1, Spot, 0);
        Myitemids = Delete(Myitemids, 1, 1, 1);
        if (Locate(ByRef_Itemname, Myitemids, 1, 1, 0, "", position => Spot2 = position)); else return exit(undefined);

        Recentlist = Delete(Recentlist, 1, Spot, +Spot2 + 1);
    }

    if (await JSB_ODB_WRITE(Raise(Recentlist), await JSB_BF_FHANDLE('', 'jsb_selectlists', true), 'EdRecentList_' + CStr(_Username))); else null;
    return exit();
}
// </EDITOR_REMOVEFROMRECENTLIST_Sub>

// <EDITOR_HTMLHELP>
async function JSB_TCL_EDITOR_HTMLHELP() {
    return html('\<div style=\'overflow: auto; height: 98%; width: 99%;\'\>\r\n\
      \<table\> \r\n\
         \<tr\>\<td\>Ctl-Space\</td\>\<td\>Auto Complete\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctl-Y\</td\>\<td\>Cut Line\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctl-S\</td\>\<td\>Save\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctl-U or Ctl-Z\</td\>\<td\>Undo\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctl-R\</td\>\<td\>Redo\</td\>\</tr\>\r\n\
         \<tr\>\<td\>F5\</td\>\<td\>Run\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctl-D\</td\>\<td\>Debug\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctl-B\</td\>\<td\>Build\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctl-K\</td\>\<td\>Format\</td\>\</tr\>\r\n\
         \<tr\>\</tr\>\r\n\
        \r\n\
         \<tr\>\<td\>Ctrl-,\</td\>\<td\>Show the settings menu\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Alt-Up\</td\>\<td\>add multi-cursor above\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Alt-Down\</td\>\<td\>add multi-cursor below\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Alt-Right\</td\>\<td\>add next occurrence to multi-selection\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Alt-Left\</td\>\<td\>add previous occurrence to multi-selection\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-L\</td\>\<td\>\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Shift-U\</td\>\<td\>change to lower case\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-U\</td\>\<td\>change to upper case\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Alt-Shift-Down\</td\>\<td\>copy lines down\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Alt-Shift-Up\</td\>\<td\>copy lines up\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Delete\</td\>\<td\>delete\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Shift-D\</td\>\<td\>duplicate selection\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-F\</td\>\<td\>find\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-K\</td\>\<td\>find next\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Shift-K\</td\>\<td\>find previous\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Alt-0\</td\>\<td\>fold all\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Alt-L, Ctrl-F1\</td\>\<td\>fold selection\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Down\</td\>\<td\>go line down\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Up\</td\>\<td\>go line up\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-End\</td\>\<td\>go to end\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Left\</td\>\<td\>go to left\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-L\</td\>\<td\>go to line\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Alt-Right, End\</td\>\<td\>go to line end\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Alt-Left, Home\</td\>\<td\>go to line start\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-P\</td\>\<td\>go to matching bracket\</td\>\</tr\>\r\n\
         \<tr\>\<td\>PageDown\</td\>\<td\>go to page down\</td\>\</tr\>\r\n\
         \<tr\>\<td\>PageUp\</td\>\<td\>go to page up\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Right\</td\>\<td\>go to right\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Home\</td\>\<td\>go to start\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Left\</td\>\<td\>go to word left\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Right\</td\>\<td\>go to word right\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Tab\</td\>\<td\>indent\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Alt-E\</td\>\<td\>macros recording\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Shift-E\</td\>\<td\>macros replay\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Alt-Down\</td\>\<td\>move lines down\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Alt-Up\</td\>\<td\>move lines up\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Alt-Shift-Up\</td\>\<td\>move multicursor from current line to the line ab\<span style=\'display:none\'\>ove\</span\>\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Alt-Shift-Down\</td\>\<td\>move multicursor from current line to the line be\<span style=\'display:none\'\>low\</span\>\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Shift-Tab\</td\>\<td\>outdent\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Insert\</td\>\<td\>overwrite\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Shift-Z\</td\>\<td\>redo\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Alt-Shift-Right\</td\>\<td\>remove current occurrence from multi-selection \<span style=\'display:none\'\>and move to next\</span\>\</td\>\</tr\>\r\n\
\r\n\
         \<tr\>\<td\>Ctrl-Alt-Shift-Left\</td\>\<td\>remove current occurrence from multi-selection \<span style=\'display:none\'\>and move to previous\</span\>\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-D\</td\>\<td\>remove line\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Alt-Delete\</td\>\<td\>remove to line end\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Alt-Backspace\</td\>\<td\>remove to linestart\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Backspace\</td\>\<td\>remove word left\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Delete\</td\>\<td\>remove word right\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-R\</td\>\<td\>replace\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Shift-R\</td\>\<td\>replace all\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Down\</td\>\<td\>scroll line down\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Up\</td\>\<td\>scroll line up\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Option-PageDown\</td\>\<td\>\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Option-PageUp\</td\>\<td\>\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-A\</td\>\<td\>select all\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Shift-L\</td\>\<td\>select all from multi-selection\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Shift-Down\</td\>\<td\>select down\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Shift-Left\</td\>\<td\>select left\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Shift-End\</td\>\<td\>select line end\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Shift-Home\</td\>\<td\>select line start\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Shift-PageDown\</td\>\<td\>select page down\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Shift-PageUp\</td\>\<td\>select page up\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Shift-Right\</td\>\<td\>select right\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Shift-End\</td\>\<td\>select to end\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Alt-Shift-Right\</td\>\<td\>select to line end\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Alt-Shift-Left\</td\>\<td\>select to line start\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Shift-P\</td\>\<td\>select to matching bracket\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Shift-Home\</td\>\<td\>select to start\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Shift-Up\</td\>\<td\>select up\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Shift-Left\</td\>\<td\>select word left\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Shift-Right\</td\>\<td\>select word right\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-O\</td\>\<td\>\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-/\</td\>\<td\>toggle comment\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-T\</td\>\<td\>transpose letters\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Z\</td\>\<td\>undo\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Alt-Shift-L, Ctrl-Shift-F1\</td\>\<td\>unfold\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Alt-Shift-0\</td\>\<td\>unfold all\</td\>\</tr\>\r\n\
         \<tr\>\<td\>Ctrl-Enter\</td\>\<td\>enter full screen\</td\> \</tr\>\r\n\
      \</table\>\r\n\
      \</div\>\r\n\
');

}
// </EDITOR_HTMLHELP>

// <ADDACECOMPLETETIONS>
async function JSB_TCL_ADDACECOMPLETETIONS() {
    // local variables
    var Js, S;

    if (await JSB_ODB_READ(Js, await JSB_BF_FHANDLE('dict tcl'), '_AceCompleations', function (_Js) { Js = _Js })); else return '';
    S = ('\r\n\
       function getCompletions(editor, session, pos, prefix) {\r\n\
          if (pos.column - prefix.length - 1 \>= 0) pchar = editor.session.getLine(pos.row).substr(pos.column - prefix.length - 1, 1);\r\n\
          if (pchar == "@") { prefix = "@" + prefix; }\r\n\
          prefix = prefix.toLowerCase();\r\n\
          var answers = []\r\n\
          var lib = library_funcs();\r\n\
          plen = prefix.length;\r\n\
          for (var i = 0; i \< lib.length; i++) {\r\n\
             var l = lib[i];\r\n\
             var name = l.name;\r\n\
             var value = l.value;\r\n\
             if (prefix == name.substr(0, plen)) {\r\n\
                var r = {}\r\n\
                r.name = l.name;\r\n\
                r.value = l.value;\r\n\
                r.meta = l.meta;\r\n\
                r.score = 50;\r\n\
    \r\n\
                if (pchar == "@" && r.value.substr(0, 1) == "@") r.value = r.value.substr(1, 999)\r\n\
    \r\n\
                answers.push(r);\r\n\
             }\r\n\
          }\r\n\
          return answers;\r\n\
       }\r\n\
    \r\n\
      \r\n\
       function library_funcs() {\r\n\
           return [' + CStr(Js) + ']\r\n\
       }\r\n\
       ');

    return JSB_HTML_SCRIPT(CStr(S));
}
// </ADDACECOMPLETETIONS>

// <WHO_Pgm>
async function JSB_TCL_WHO_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    if (JSB_BF_ISAUTHENTICATED()) {
        Print(bold('UserName: '), UserName(), '; ', bold('Account: '), Account(), '; ');
        if (Not(isMobile())) { Print(bold('Domain: '), JSB_BF_USERDOMAIN(), '; ', bold('email: '), await JSB_BF_EMAIL()); }
        if (await JSB_BF_ISEMPLOYEE()) { Println('; Role: ', await JSB_BF_ROLEDESCRIPTION(), '; '); } else Println();
        Println(Anchor('off', 'Click here to logout'));;
    } else {
        Println('You are not logged in');
        Println(Anchor(LoginUrl(), 'Click here to login'));
    }
    clearSelect(odbActiveSelectList);
    return;
}
// </WHO_Pgm>

// <EDL_Pgm>
async function JSB_TCL_EDL_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Tabid, Filename, Itemnames, Servertouse, Cb, _Clearscreen;
    var Top, Columns, Dictdata, Tablename, Filterby, Orderby, _Options;
    var Allitems, F_File, Sl, Id, Recentlist, Lfname, Recentitems;
    var Itemname, Changed;

    if (Not(isAdmin())) return Stop('You must be an admin to run this command');

    Tabid = JSB_BF_URLPARAM('tabID');
    Filename = JSB_BF_URLPARAM('fileName');
    Itemnames = Split(JSB_BF_URLPARAM('itemNames'), am);
    Servertouse = JsbRootAct();
    Cb = 'nobust';

    _Clearscreen = At(-1);

    Print(_Clearscreen);

    if (Not(Filename) || Not(Itemnames) && LCase(Left(activeProcess.At_Sentence, 4)) != 'run ') {
        if (await JSB_BF_PARSESELECT(CStr(activeProcess.At_Sentence), '', Top, Columns, Dictdata, Tablename, Filterby, Orderby, _Options, Allitems, F_File, false, 0, undefined, function (_Top, _Columns, _Dictdata, _Tablename, _Filterby, _Orderby, __Options, _Allitems, _F_File) { Top = _Top; Columns = _Columns; Dictdata = _Dictdata; Tablename = _Tablename; Filterby = _Filterby; Orderby = _Orderby; _Options = __Options; Allitems = _Allitems; F_File = _F_File })) {
            Filename = LTrim(CStr(Dictdata) + ' ' + CStr(Tablename));

            // Get list of names to edit
            Itemnames = [undefined,];
            if (CBool(Allitems) || Filterby == '*') {
                Filterby = '';
                if (await JSB_ODB_SELECTTO('', F_File, '', Sl, function (_Sl) { Sl = _Sl })) Itemnames = getList(Sl); else return Stop(activeProcess.At_Errors);
            } else {
                if (CBool(Filterby)) {
                    Filterby = LTrim(RTrim(CStr(Filterby) + CStr(Orderby)));
                    if (await JSB_ODB_SELECTTO(LTrim(CStr(Top) + ' ') + Join(Columns, ' '), F_File, CStr(Filterby), Sl, function (_Sl) { Sl = _Sl })) Itemnames = getList(Sl); else return Stop(activeProcess.At_Errors);
                } else {

                    do {
                        Id = readNext(odbActiveSelectList).itemid;
                        if (CBool(Id)); else break;
                        Itemnames[Itemnames.length] = Id;
                    }
                    while (true);
                }
            }
        }
    }

    if ((Not(Itemnames))) {
        if (Tablename == '?') { return Stop('ED TableName \<ITEMNAMES\> {(options)}'); }
        return Chain('edl_ide ' + CStr(Filename));
    }

    // Update recent list with current item names
    if (await asyncRead(await JSB_BF_FHANDLE('tmp'), 'edl_recentlist', "JSON", 0, _data => Recentlist = _data)); else { Recentlist = { "cs": ['analogdemo', 'serverdemo'] } }
    Lfname = LCase(Filename);
    if (Not(Recentlist[Lfname])) Recentlist[Lfname] = [undefined,];
    Recentitems = Recentlist[Lfname];

    for (Itemname of iterateOver(Itemnames)) {
        if (Locate(LCase(Itemname), Recentitems, 0, 0, 0, "", position => { })); else {
            // read x from F_file, itemName then
            Recentitems[Recentitems.length] = LCase(Itemname);
            Changed = true;
            // x = ""
            // end if;
        }
    }

    if (CBool(Changed)) {
        if (await asyncWrite(Recentlist, await JSB_BF_FHANDLE('tmp'), 'edl_recentlist', "JSON", 0)); else await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
    }

    Itemnames = Join(Itemnames, am);
    Print(html('\r\n\
        \<div id=\'tabMaster\'\>\</div\>\r\n\
        \<script\>\r\n\
            function startEDL() {\r\n\
                if (rpcsid()) {\r\n\
                    EDL.txtArea_Setup("txtArea", "", "", "tabMaster", "' + CStr(Filename) + '", "' + CStr(Itemnames) + '")\r\n\
                } else {\r\n\
                    rpcLogin("guest", "guest", function () { \r\n\
                        EDL.txtArea_Setup("txtArea", "", "", "tabMaster", "' + CStr(Filename) + '", "' + CStr(Itemnames) + '")\r\n\
                    }, function () { \r\n\
                        var password = prompt("Admin password");\r\n\
                        rpcLogin("admin", password, function () { \r\n\
                            EDL.txtArea_Setup("txtArea", "", "", "tabMaster", "' + CStr(Filename) + '", "' + CStr(Itemnames) + '")\r\n\
                        }, function () { alert("Failed to login") }, "' + CStr(Servertouse) + '" ); \r\n\
                    });\r\n\
                }\r\n\
            }\r\n\
            \r\n\
            if (window.EDL && EDL.txtArea_Setup) {\r\n\
                startEDL();\r\n\
            } else {\r\n\
                loadFile(\'/jsb/js/edl_pics.js\', function () {\r\n\
                    loadFile(\'/jsb/js/edl.js?cb=' + CStr(Timer()) + '\', function () {\r\n\
                        loadFile(\'/jsb/js/edl_format.js\', function () {\r\n\
                            loadFile(\'/jsb/css/edl.css?cb=' + CStr(Timer()) + '\');\r\n\
                            startEDL();\r\n\
                        });\r\n\
                    });\r\n\
                });\r\n\
            };\r\n\
        \</script\>\r\n\
    '));

    // if system(1) = "aspx" then 
    await At_Server.asyncPause(me);
    // stop
    // end if
    At_Server.End();
    return;
}
// </EDL_Pgm>

// <EDL_GETITEMNAMES_Pgm>
async function JSB_TCL_EDL_GETITEMNAMES_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Forfilename, Restful_Result, Results, Eforfilename, F;
    var Sl, Ids, Iname, R, Cb;

    var Restful_Result;
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Forfilename = JSB_BF_PARAMVAR('FORFILENAME', CStr(1));
                Results = {};
                Eforfilename = jsEscapeString(CStr(Forfilename));
                if (await JSB_ODB_OPEN('', CStr(Forfilename), F, function (_F) { F = _F })) {
                    if (await JSB_ODB_SELECTTO('', F, '', Sl, function (_Sl) { Sl = _Sl })) {
                        Ids = getList(Sl);
                        for (Iname of iterateOver(Ids)) {
                            Results[Iname] = { "onclick": 'edl_editItem(' + CStr(Eforfilename) + ',' + jsEscapeString(CStr(Iname)) + ');' };
                        }
                    }
                }

                Restful_Result = Results; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto;

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </EDL_GETITEMNAMES_Pgm>

// <EDL_SIMULATEESP>
async function JSB_TCL_EDL_SIMULATEESP() {
    // local variables
    var Cb;

    Cb = 'nobust';

    return At(-1) + html('\<!DOCTYPE HTML\>\r\n\
    \<html\>\r\n\
    \<' + 'head\>\r\n\
     \<meta http-equiv=\'X-UA-Compatible\' content=\'IE=9\' /\> \r\n\
     \<meta http-equiv=\'pragma\' content=\'no-cache\' /\>\r\n\
     \<meta name=\'viewport\' content=\'width=device-width\'\>\r\n\
     \<meta charset=\'utf-8\' /\>\r\n\
     \<meta http-equiv=\'Access-Control-Allow-Origin\' content=\'*\' /\>\r\n\
     \<meta http-equiv=\'Access-Control-Allow-Headers\' content=\'Content-Type, Accept, SOAPuserion, Origin\' /\>\r\n\
     \<meta http-equiv=\'Access-Control-Max-Age\' content=\'1728000\' /\>\r\n\
     \<meta http-equiv=\'Content-Security-Policy\' content="img-src * data:; default-src *; style-src * \'unsafe-inline\'; script-src * \'unsafe-inline\' \'unsafe-eval\'" /\> \<meta http-equiv=\'cache-control\' content=\'max-age=0\' /\>\r\n\
     \<meta http-equiv=\'expires\' content=\'0\' /\>\r\n\
     \<meta http-equiv=\'expires\' content=\'Tue, 01 Jan 1980 1:00:00 GMT\' /\>\r\n\
     \<meta http-equiv=\'pragma\' content=\'no-cache\' /\>\r\n\
    \r\n\
     \<script src=\'https://jsbwinforms.azurewebsites.net/jsb/js/jsbjlite.js?cb=' + CStr(Cb) + '\'\>\</script\>\r\n\
     \<script src=\'https://jsbwinforms.azurewebsites.net/jsb/js/jsbesp.js?cb=' + CStr(Cb) + '\'\>\</script\>\r\n\
     \<link href=\'https://jsbwinforms.azurewebsites.net/jsb/css/jsbesp.css?cb=' + CStr(Cb) + '\' type=\'text/css\' rel=\'stylesheet\'\>\r\n\
     \<script src=\'https://jsbwinforms.azurewebsites.net/jsb/js/tstcompile.js?cb=' + CStr(Cb) + '\'\>\</script\>\r\n\
     \<link type="text/css" rel="stylesheet" href="https://jsbwinforms.azurewebsites.net/jsb/css/edl.css?cb=' + CStr(Cb) + '"\>\r\n\
     \<script src="https://jsbwinforms.azurewebsites.net/jsb/js/edl.js?cb=' + CStr(Cb) + '"\>\</script\>\r\n\
      \r\n\
     \<title\>EDL Test\</title\>\r\n\
     \<link rel=\'shortcut icon\' href=\'https://jsbwinforms.azurewebsites.net/jsb/pics/favicon.ico\' /\>\r\n\
     \<link type="text/css" rel="stylesheet" href="' + jsbRoot() + 'css/edl.css?cb=' + CStr(Cb) + '"\>\r\n\
     \<script src="' + jsbRoot() + 'js/edl.js?cb=' + CStr(Cb) + '"\>\</script\>\r\n\
     \<' + '/head\>\r\n\
     \<body\>\r\n\
     \<input name="_SID_" type="hidden" value="' + userno() + '"\>\r\n\
     ');
}
// </EDL_SIMULATEESP>

// <EL_Pgm>
async function JSB_TCL_EL_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S, Iname;

    if (Not(isAdmin())) return Stop('You are not an administrator');
    S = Trim(activeProcess.At_Sentence);
    Iname = Field(S, ' ', 2);
    await JSB_BF_FHANDLE('', 'JSB_SelectLists', true);
    await asyncTclExecute('ED JSB_SelectLists ' + CStr(Iname));

    return;
}
// </EL_Pgm>

// <ENCODE_Pgm>
async function JSB_TCL_ENCODE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S, O;

    // Convert string to encoded - default to base64

    S = dropLeft(CStr(activeProcess.At_Sentence), ' ');
    O = fieldIfRight(CStr(S), ' (', CStr(1));
    if (CBool(O)) S = dropRight(CStr(S), ' (');
    if (Not(O)) O = 64;
    S = aesEncrypt(S, O);
    Println(S);
    clearSelect(odbActiveSelectList);
    return;
}
// </ENCODE_Pgm>

// <FORMAT_Pgm>
async function JSB_TCL_FORMAT_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Firsttime, Iname, Itemi, Item;

    if (Not(isAdmin())) return Stop('You are not an administrator');

    var Ignorefilenotfound = false;
    var Dftallitems = false;
    var Help = [undefined, 'FORMAT \<TableName\> \<itemnames\>'];

    // Include jsb_tcl __SHELL

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

    Fname = UCase(await JSB_BF_TRUETABLENAME(Tablename));
    Firsttime = 0;

    Itemi = LBound(Inames) - 1;
    for (Iname of iterateOver(Inames)) {
        Itemi++;
        if (await JSB_ODB_READ(Item, F_File, CStr(Iname), function (_Item) { Item = _Item })) {
            Item = formatCode(CStr(Item), 4, false);
            if (await JSB_ODB_WRITE(CStr(Item), F_File, CStr(Iname))); else return Stop(activeProcess.At_Errors);
            Println('Formatted ', Fname, ' ', Iname);
        }
    }

    if (CBool(Errors)) Println(MonoSpace(Join(Errors, crlf)));
    return;
}
// </FORMAT_Pgm>

// <GET_Pgm>
async function JSB_TCL_GET_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Adr, I, Url, Doc, Header, Ptype, Pic64encoded, Result;

    var onError;
    var gotoLabel = "";
    atgoto: while (true) {
        try {
            switch (gotoLabel) {
                case "":
                    if (Not(isAdmin())) return Stop('You are not an administrator');
                    Adr = Trim(Field(activeProcess.At_Sentence, '(', 1));
                    I = Index1(Adr, ' ', 1);
                    if (Null0(I) == '0') {
                        Println('GET http://addr');
                        return Stop();
                    }

                    Url = LTrim(Mid1(Adr, I));
                    Println(Url);
                    Doc = await JSB_BF_GET(CStr(Url), 'GET', Header, '', '', function (_Header, _P4) { Header = _Header }); // et(Url, method, header, body, opts)

                    Header = Change(Header, Chr(10), '');

                    if (InStr1(1, Header, 'Content-Type=image/')) {
                        Ptype = Field(Header, 'Content-Type=image/', 2);
                        Ptype = Extract(Ptype, 1, 0, 0);
                        Pic64encoded = aesEncrypt(Doc, 64);
                        Println(IMAGE('data:image/' + CStr(Ptype) + ';base64,' + CStr(Pic64encoded)));
                        return Stop();
                    }

                    Doc = Change(Doc, Chr(10), '');

                    Println('Length of ', Len(Doc));
                    Println('=========== Header ==================');
                    Println(Change(Field(Header, '\<html', 1), Chr(254), crlf));
                    Println('============ Body ==================');
                    if (InStr1(1, Doc, Chr(13)) == 0) Doc = Change(Doc, Chr(10), Chr(13));
                    if (isEmpty(Doc)) return Stop(activeProcess.At_Errors);

                    Result = Doc;
                    onErrorGoto = "DOSTOP";

                    if (Left(Doc, 1) == '{') {
                        onErrorGoto = "JUSTTEXT";
                        Result = parseJSON(Doc);
                        return Stop(Result);
                    }


                case "JUSTTEXT":

                    for (I = 0; I <= 31; I++) {
                        if (Null0(I) == 10) continue;
                        if (Null0(I) == 13) continue;
                        if (InStr1(1, Result, Chr(I))) Result = Change(Result, Chr(I), '');
                    }


                case "DOSTOP":

                    return Stop(Result);

                    return;


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
// </GET_Pgm>

// <GL_Pgm>
async function JSB_TCL_GL_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S, Fname, Iname;

    S = Trim(activeProcess.At_Sentence);
    if (Not(isAdmin())) return Stop('You are not an administrator');
    Fname = Field(S, ' ', 2);
    Iname = Field(S, ' ', 3);

    if (UCase(Fname) == 'DICT') {
        Fname = CStr(Fname) + ' ' + CStr(Iname);
        Iname = Field(S, ' ', 4);
    }
    clearSelect(odbActiveSelectList);
    if (await asyncGetList(Fname, _selectList => odbActiveSelectList = _selectList)) {
        Println('LIST \'', Fname, '\' ACTIVATED');
    } else {
        Println(activeProcess.At_Errors);
    }
    return Stop();

    return;
}
// </GL_Pgm>

// <HEADER_Pgm>
async function JSB_TCL_HEADER_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Adr, Url, Www, Doc, Header, I, _Hline, J, Hfield, Hname;
    var M;

    if (Not(isAdmin())) return Stop('You are not an administrator');

    Adr = Field(Field(activeProcess.At_Sentence, '(', 1), ' ', 2);
    if (Left(Adr, 4) != 'http') {
        Adr = 'http://' + CStr(Adr);
    }
    Url = Adr;

    if (Left(Adr, 8) == 'https://') {
        Adr = Mid1(Adr, 9, 9999);
        if (await asyncOpen("", 'https://', _fHandle => Www = _fHandle)); else return Stop('no open');
    } else {
        Adr = Mid1(Adr, 8, 9999);
        if (await asyncOpen("", 'http://', _fHandle => Www = _fHandle)); else return Stop('no open');
    }
    Www = Replace(Www, 2, 0, 0, 'GET');
    Doc = await JSB_BF_GET(CStr(Url), 'get', Header, '', '', function (_Header, _P4) { Header = _Header });

    // i_read doc from www, adr else stop "no ":adr:" ":@Errors

    Println('=========== Header ==================');
    Header = activeProcess.At_Errors;
    Println(Change(Header, am, crlf));
    Println();
    Println('========== Set-Cookie =================');

    var _ForEndI_6 = DCount(Header, am);
    for (I = 1; I <= _ForEndI_6; I++) {
        _Hline = Extract(Header, I, 0, 0);
        if (Left(_Hline, 10) == 'Set-Cookie') {
            _Hline = Mid1(_Hline, 12); // Drop Set-Cookie

            var _ForEndI_8 = DCount(_Hline, ';');
            for (J = 1; J <= _ForEndI_8; J++) {
                Hfield = Field(_Hline, ';', J);
                Hname = Trim(Field(Hfield, '=', 1));
                switch (1 == 1) {
                    case Hname == 'expires':
                        Println(Hfield);
                        break;

                    case Hname == 'domain':
                        Println(Hfield);
                        break;

                    case Hname == 'path':
                        Println(Hfield);
                        break;

                    case Hname == 'secure':
                        Println(Hfield);
                        break;

                    case Hname == 'HttpOnly':
                        Println(Hfield);
                        break;

                    default:
                        M = InStr1(1, Hfield, '=');
                        if (CBool(M)) {
                            Println('* ', Mid1(Hfield, 1, +M - 1), ' = ', Mid1(Hfield, +M + 1));
                        } else {
                            Println('?? ', Hfield);
                        }
                }

            }
        }
    }

    return;
}
// </HEADER_Pgm>

// <HELP_Pgm>
async function JSB_TCL_HELP_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S, Searchterm, _Options, F_Jsbdocs, Catagories, Ed, X;
    var Sl, Helplist, Id, Item, Li, R, I, Es, Cnt, Hamburger, Quitbtn;
    var Northhtml, Northoptions, Westhtml, Westoptions, Centerhtml;
    var Url, Cmd, Itemid, Containername, Onselect, Htmltree, _Html;

    S = activeProcess.At_Sentence;
    if (Left(LCase(S), 8) == 'run tcl ') S = Mid1(S, 9);
    if (Left(LCase(S), 12) == 'run jsb_tcl ') S = Mid1(S, 13);

    Searchterm = dropLeft(Field(S, ' (', 1, true), ' ', CStr(1));
    _Options = LCase(Field(S, ' (', 2, true));
    if (await JSB_ODB_OPEN('', 'JSB_DOCS', F_Jsbdocs, function (_F_Jsbdocs) { F_Jsbdocs = _F_Jsbdocs })); else return Stop('Unable to open JSB_DOCS table: ', activeProcess.At_Errors);
    if (await JSB_ODB_READJSON(Catagories, F_Jsbdocs, '__treeCatagories', function (_Catagories) { Catagories = _Catagories })); else { return Stop('No __treeCatagories found; Run COMPILE JSB_DOCS *'); }
    if (await JSB_ODB_WRITE('', F_Jsbdocs, 'testPermissions')) {
        if (await JSB_ODB_DELETEITEM(F_Jsbdocs, 'testPermissions')); else return Stop(activeProcess.At_Errors);
        Ed = 'ed';
    } else {
        Ed = 'view';
    }

    if (await JSB_ODB_OPEN('', 'jsb_examples', X, function (_X) { X = _X })); else return Stop('The jsb_examples file is missing');

    if (CBool(Searchterm)) {
        if (await JSB_ODB_SELECTTO('', F_Jsbdocs, 'ItemId Like \'%' + CStr(Searchterm) + '%\'', Sl, function (_Sl) { Sl = _Sl })); else return Stop(activeProcess.At_Errors);
        Helplist = Split(getList(Sl), am);
        if (Len(Helplist) == 0) return Stop('No items found');

        if (Len(Helplist) == 1) {
            Id = Join(Helplist, '');
            if (await JSB_ODB_READ(Item, await JSB_BF_FHANDLE('jsb_docs'), CStr(Id), function (_Item) { Item = _Item })); else return Stop(activeProcess.At_Errors);
            Item = Change(Item, am, '');
            Println(anchorEdit('jsb_docs', CStr(Id)));
            Println(html(CStr(Item)));
            return Stop();
        }

        Print(html('\<table style=\'width: 95%; white-space: nowrap;\'\>'));
        Li = LBound(Helplist) - 1;
        for (Id of iterateOver(Helplist)) {
            Li++;
            R = '';
            for (I = 1; I <= 4; I++) {
                if (!isEmpty(Id)) {
                    Es = '?' + CStr(Ed) + ' JSB_DOCS \'' + urlEncode(Id) + '\'';
                    R = CStr(R) + JSB_HTML_TD(anchorEdit('jsb_docs', CStr(Id), CStr(false), CStr(40)));
                    Cnt = +Cnt + 1;
                }
                Li = +Li + 1;
                Id = Helplist[Li];
                if (Not(Id)) break;
            }
            Li = +Li - 1;
            Print(JSB_HTML_TR(CStr(R)));
        }

        Println(html('\</table\>'));
        clearSelect(odbActiveSelectList);

        Println(Cnt, ' items listed');
        return Stop();
    }

    if (true || System(1) == 'js' || JSB_BF_MAXWIDTH() < 800) {
        Hamburger = Button('', html('\<span class="glyphicon glyphicon-menu-hamburger"\>\</span\>'), { "onclick": 'westToggle()', "style": 'min-width: 15px' });
        Quitbtn = JSB_HTML_SUBMITBTN('btnCommand', 'Quit', { "style": 'width: 100%' });

        Northhtml = Cols2('38px', CStr(Hamburger), '%', CStr(Quitbtn), '', 'overflow: hidden;', 'overflow: hidden');
        Northoptions = 'startsize: 40px, Fixed';

        Westhtml = JSONTree(Catagories);
        Westoptions = 'startsize: 270px';

        Centerhtml = Div('centerDiv', '', { "style": 'background-color: white; color: black; height: 100%; width: 100%; overflow-y: auto' });

        Println(At(-1), LAYOUT(Centerhtml, Northhtml, Northoptions, 'South', '', 'East', '', Westhtml, Westoptions));

        Print(genEventHandler('leafSelected', CStr(Url), 7, 'itemID'));
        Print(JSB_HTML_SCRIPT('\r\n\
                function westToggle() {\r\n\
                  $("#mylayout").layout().toggle("west");\r\n\
                }\r\n\
                function westHide() {\r\n\
                  $("#mylayout").layout().close("west");\r\n\
                }\r\n\
            '));


        while (true) {
            Print(JSB_HTML_SCRIPT('\r\n\
            $(\'#centerDiv\').html(' + jsEscapeString(CStr(Item)) + ');\r\n\
            '));

            await At_Server.asyncPause(me);
            Cmd = formVar('btnCommand');
            Itemid = formVar('itemID');
            if (Cmd == 'Quit') break;
            if (await JSB_ODB_READ(Item, await JSB_BF_FHANDLE('jsb_docs'), CStr(Itemid), function (_Item) { Item = _Item })); else Item = CStr(activeProcess.At_Errors) + ' with ' + CStr(Itemid);
            Item = Change(Item, Chr(254), '');
            Print(JSB_HTML_SCRIPT('window.westHide()'));
        }

        Print(At(-1));
        if (System(1) == 'js') return Chain('jsb');
        return Stop();;
    }

    Containername = 'Tabs_' + CStr(Rnd(9999));
    Centerhtml = JSB_HTML_TABS(Containername, '', '', '', '', '', '');

    // *********************
    if (CBool(isAdmin()) && System(1) == 'aspx') {
        Url = JSB_BF_JSBROOTEXECUTETCLCMD('ed JSB_DOCS \'{id}\'');
    } else {
        Url = 'view JSB_DOCS \'{id}\'';
    }
    Onselect = genEventHandler('leafSelected', CStr(Url), 3, CStr(Containername)); // open in tab

    Htmltree = JSONTree(CStr(Catagories));
    Northhtml = JSB_HTML_SUBMITBTN('btnCommand', 'Quit', { "width": '70%' });
    Northoptions = 'fixed, startsize:auto';

    Westoptions = 'fixed, startsize: 270px';
    // @genEventHandler("leafSelected", Url, 7, "itemID"): // postback

    Westhtml = JSONTree(Catagories);

    _Html = LAYOUT(Centerhtml, Northhtml, Northoptions, 'South', '', 'East', '', Westhtml, Westoptions);

    Print(At(-1), _Html, Onselect);

    await At_Server.asyncPause(me);

    return Stop(At(-1));
}
// </HELP_Pgm>

// <HELP_ADDTABLENAME>
async function JSB_TCL_HELP_ADDTABLENAME(ByRef_A, ByRef_Tablename, setByRefValues) {
    // local variables
    var Newa, Catagory, I, J;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_A, ByRef_Tablename)
        return v
    }
    Newa = Split(ByRef_A, am);
    I = LBound(ByRef_A) - 1;
    for (Catagory of iterateOver(ByRef_A)) {
        I++;
        Catagory = Split(Catagory, vm);
        var _ForEndI_19 = UBound(Catagory);
        for (J = 2; J <= _ForEndI_19; J++) {
            Catagory[J] = CStr(ByRef_Tablename) + ' ' + urlEncode(Catagory[J]);
        }
        Newa[I] = Join(Catagory, vm);
    }
    return exit(Join(Newa, am));
}
// </HELP_ADDTABLENAME>

// <COMPILE_Pgm>
async function JSB_TCL_COMPILE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Help, Tree, F_Handle, Fdict_Handle, Catagories, Originalcatagories;
    var Iname, Itemi, Item, Oitem, Cancel, Tag;

    // Will extract the examples from the DOCS file (use Compile jsb_docs *)
    // Will build the necessary tree (use Compile jsb_docs)
    if (Not(isAdmin())) return Stop('You are not an administrator');

    Help = [undefined, 'COMPILE jsb_docs {itemnames} or *\> (options'];
    Help[Help.length] = '';
    Help[Help.length] = '  This program will extract the examples from the JSB_DOCS, put them in JSB_EXAMPLES, and BASIC them.  (No PC compile necessary)';
    Help[Help.length] = '  Use option (B to only rebuild the __treeCatagories index';

    var Ignorefilenotfound = true;
    var Dftallitems = false;

    // Include jsb_tcl __SHELL

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

    if (InStr1(1, _Options, 'B')) {
        if (await JSB_ODB_OPEN('', 'jsb_docs', F_File, function (_F_File) { F_File = _F_File })); else return Stop(activeProcess.At_Errors);
        Tree = await JSB_TCL_BUILDCATAGORIES(F_File, true, false, function (_F_File, _P2, _P3) { F_File = _F_File });
        return Stop();
    }

    if (InStr1(1, Inames[1], '?') || InStr1(1, _Options, '?') || Not(Inames)) return Stop(Join(Help, crlf));

    F_Handle = await JSB_BF_FHANDLE('', 'Examples', true);
    Fdict_Handle = await JSB_BF_FHANDLE('DICT', 'Examples', true);

    if (Allitems) {
        if (await JSB_ODB_CLEARFILE(F_Handle)); else return Stop(activeProcess.At_Errors);
        if (await JSB_ODB_CLEARFILE(Fdict_Handle)); else return Stop(activeProcess.At_Errors);
        if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('JSB_DOCS'), '__treeCatagories')); else return Stop(activeProcess.At_Errors);
    }

    if (await JSB_ODB_READJSON(Catagories, F_File, '__treeCatagories', function (_Catagories) { Catagories = _Catagories })); else { Catagories = {} }
    Originalcatagories = CStr(Catagories, true);

    Itemi = LBound(Inames) - 1;
    for (Iname of iterateOver(Inames)) {
        Itemi++;
        if (Left(Iname, 1) == '_') continue;

        if (await JSB_ODB_READ(Item, F_File, CStr(Iname), function (_Item) { Item = _Item })); else {
            if (Len(activeProcess.At_Errors)) Errors[Errors.length] = activeProcess.At_Errors; else Errors[Errors.length] = 'Item ' + CStr(Iname) + ' not found.';
            continue;
        }

        Print(Iname, ' ');
        if (Itemi % 7 == 1) { Println(); FlushHTML(); }

        Iname = LCase(Iname);
        Oitem = Item;

        Cancel = await JSB_TCL_EXTRACTEXAMPLES(Iname, Item, '', function (_Item, _P3) { Item = _Item });
        if (CBool(Cancel)) {
            Println('Errors in ', Iname);
        } else {
            if (await JSB_ODB_WRITE(CStr(Item), F_File, CStr(Iname))); else return Stop('Error: ', activeProcess.At_Errors);
            if (await JSB_ODB_WRITE(DateTime(), Fdict_Handle, CStr(Iname) + '.compile.time')); else return Stop(activeProcess.At_Errors);
        }

        await JSB_TCL_UPDATEANEXAMPLECATAGORY(F_File, Iname, Catagories, function (_F_File, _Iname, _Catagories) { F_File = _F_File; Iname = _Iname; Catagories = _Catagories });
    }

    if (CBool(Errors)) Println(MonoSpace(Join(Errors, crlf)));

    if (Originalcatagories != CStr(Catagories, true)) {
        Catagories = JSB_BF_SORTBYTAGS(Catagories, true);
        for (Tag of iterateOver(Catagories)) {
            Catagories[Tag] = JSB_BF_SORTBYTAGS(Catagories[Tag]);
        }

        if (await JSB_ODB_WRITEJSON(Catagories, F_File, '__treeCatagories')); else return Stop(activeProcess.At_Errors);
        if (!InStr1(1, _Options, 'S')) Println('Catagories updated');
    }

    if (await JSB_BF_MSGBOX('Do you want to update the cache now?', '*Yes,No') == 'Yes') {
        await asyncTclExecute('cache jsb_docs (s'); FlushHTML();
        await asyncTclExecute('cache jsb_examples (s'); FlushHTML();
    }

    return Stop('Done');
}
// </COMPILE_Pgm>

// <EXTRACTEXAMPLES>
async function JSB_TCL_EXTRACTEXAMPLES(Itemid, ByRef__Html, ByRef_Examplename, setByRefValues) {
    // local variables
    var Docdiv, Niceitemid, F_File, C, Prec, I, Ha, Segs, Example;
    var Header, Errcnt, Block, Enddiv, J, K, _Code, Line, Linei;
    var Lcode, Isub, Ifunc, Irest, Iprog, Iclass, Ispot, X, Ans;
    var Runclick;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Html, ByRef_Examplename)
        return v
    }
    // Extracts and compiles the examples from the HTML code (writes them to the EXAMPLES file (prefiexed with ItemID))
    // Returns a count of errors

    Docdiv = '\<div class="docExample"\>';

    Niceitemid = Field(Itemid, '.htm', 1, true);
    if (Left(Niceitemid, 1) == '@') Niceitemid = Mid1(Niceitemid, 2);
    Niceitemid = Change(DropTags(CStr(Niceitemid)), ' ', '_');

    if (isEmpty(ByRef__Html)) {
        if (await JSB_ODB_OPEN('', 'jsb_examples', F_File, function (_F_File) { F_File = _F_File })); else return Stop('Error: ', activeProcess.At_Errors);
        if (await JSB_ODB_READ(ByRef__Html, F_File, CStr(Itemid), function (_ByRef__Html) { ByRef__Html = _ByRef__Html })); else return Stop('jsb_examples item ', Itemid, ' not found.');
    }

    // Clean up Html
    ByRef__Html = Change(ByRef__Html, Chr(160), Chr(32));
    ByRef__Html = Change(ByRef__Html, '\<br \>', '\<br\>');
    ByRef__Html = Change(ByRef__Html, '\<br/\>', '\<br\>');

    // Validate Category
    C = Field(Field(Field(Field(Field(Field(Mid1(ByRef__Html, 1, 1000), ' Category:', 2, true), ';', 1, true), '\<', 1, true), Chr(254), 1, true), Chr(10), 1, true), Chr(13), 1, true);
    C = Trim(C);
    if (CBool(C)) {
        Prec = Field(Mid1(ByRef__Html, 1, 1000), ' Category:', 1, true);
        if (InStr1(1, Prec, '\<div')) {
            I = InStr1(1, ByRef__Html, '\</div\>');
            ByRef__Html = Mid1(ByRef__Html, +I + 6);

            while (Left(ByRef__Html, 5) == '\<br/\>' || Left(ByRef__Html, 6) == '\<br /\>' || Left(ByRef__Html, 4) == '\<br\>') {
                ByRef__Html = Mid1(ByRef__Html, InStr1(1, ByRef__Html, '\>') + 1);
            }
            ByRef__Html = '* Category: ' + CStr(C) + '\<br/\>\<br/\>' + CStr(ByRef__Html);
        }
    }

    // Remove any Div's that are not docDIV's

    if (InStr1(1, ByRef__Html, '\<div class="docExample"') == 0 && InStr1(1, ByRef__Html, '&lt;example&gt;') == 0) return exit(0);

    // convert all string of "<example>" tags to docDIV's
    Ha = (Split(ByRef__Html, '&lt;example'));
    Segs = [undefined,];
    var _ForEndI_59 = UBound(Ha);
    for (I = 2; I <= _ForEndI_59; I++) {
        Segs = (Split(Ha[I], '&lt;/example&gt;')); // Find </example>
        Example = Segs[1];
        if (UBound(Segs) == 1) Segs[Segs.length] = '';
        Header = (Trim(Field(Example, '&gt;', 1, true))); // Remove <example>
        Example = Mid1(Example, activeProcess.Col2 + 4); // Header And Footer Dropped
        Example = DropTags(CStr(Example));
        Ha[I] = '\<div class="docExample"\>' + CStr(Example) + '\</div\>' + CStr(Segs[2]);
    }
    ByRef__Html = Join(Ha, '');

    // Split on docDIV
    Ha = Split(ByRef__Html, Docdiv);
    if (UBound(Ha) <= 1) return exit(0);
    Errcnt = 0;

    Ha[1] = await JSB_BF_BALANCETAGS(CStr(Ha[1]));
    var _ForEndI_62 = UBound(Ha);
    for (I = 2; I <= _ForEndI_62; I++) {
        ByRef_Examplename = ('example_' + Convert('[]()!@#$%^&*()+=-:;\>\<,./?~|{}[].', '_', Niceitemid));
        if (Null0(I) > 2) ByRef_Examplename = CStr(ByRef_Examplename) + '_' + CStr(+I - 1);

        Block = Ha[I];
        Enddiv = InStrRev1(undefined, Block, '\</div');
        if (CBool(Enddiv)) {
            Example = Left(Block, +Enddiv - 1);
            Enddiv = InStr1(Enddiv, Block, '\>');
            Block = await JSB_BF_BALANCETAGS(Mid1(Block, +Enddiv + 1));
        } else {
            Block = '';
        }

        // Process the Example
        if (InStr1(1, Example, '\<br\>')) Example = Change(Example, am, ''); else Example = Change(Example, am, '\<br\>');

        // drop old runclick <a href> ... </a>
        J = Index1(Example, '\<br\>\<input ', 1);
        if (Null0(J) == '0') J = Index1(Example, '\<input ', 1);
        if (CBool(J)) {
            K = InStr1(+J + 8, Example, '\>');
            Example = Left(Example, +J - 1) + Mid1(Example, +K + 1);
        }

        Example = DropTags(CStr(Example));


        while (Left(Example, 1) == am) {
            Example = Mid1(Example, 2);
        }

        while (Right(Example, 1) == am) {
            Example = Left(Example, Len(Example) - 1);
        }

        if (InStr1(1, Example, 'TCL\>')) {
            _Code = Split(Example, am);
            Linei = LBound(_Code) - 1;
            for (Line of iterateOver(_Code)) {
                Linei++;
                if (InStr1(1, Line, 'TCL\>')) {
                    Line = 'Execute `' + LTrim(Change(Line, 'TCL\>', '') + '`');
                } else {
                    Line = '* ' + CStr(Line);
                }
                _Code[Linei] = Line;
            }
        } else {
            Example = formatCode(CStr(Example), 4, false);
            _Code = Example;
        }

        _Code = 'Program ' + CStr(ByRef_Examplename) + am + CStr(_Code);

        Lcode = LCase(_Code);

        Isub = InStr1(1, Lcode, am + 'sub');
        Ifunc = InStr1(1, Lcode, am + 'func');
        Irest = InStr1(1, Lcode, am + 'rest');
        Iprog = InStr1(1, Lcode, am + 'prog');
        Iclass = InStr1(1, Lcode, am + 'class');

        Ispot = Len(Lcode) + 1;
        if (Not(Isub)) Isub = Ispot;
        if (Not(Ifunc)) Ifunc = Ispot;
        if (Not(Irest)) Irest = Ispot;
        if (Not(Iprog)) Iprog = Ispot;
        if (Not(Iclass)) Iclass = Ispot;

        if (Null0(Isub) < Null0(Ispot)) Ispot = Isub;
        if (Null0(Ifunc) < Null0(Ispot)) Ispot = Ifunc;
        if (Null0(Irest) < Null0(Ispot)) Ispot = Irest;
        if (Null0(Iprog) < Null0(Ispot)) Ispot = Iprog;
        if (Null0(Iclass) < Null0(Ispot)) Ispot = Iclass;

        _Code = Left(_Code, +Ispot - 1) + am + ' Print crlf():crlf():@CloseButton:' + am + Mid1(_Code, Ispot);

        if (await JSB_ODB_WRITE(CStr(_Code), await JSB_BF_FHANDLE('', 'jsb_examples', true), CStr(ByRef_Examplename))); else return Stop(activeProcess.At_Errors);
        await asyncTclExecute('basic jsb_examples ' + CStr(ByRef_Examplename), _capturedData => X = _capturedData)
        if (InStr1(1, X, '^')) {
            Errcnt = +Errcnt + 1;
            Ans = await JSB_BF_MSGBOX(CStr(Itemid), CStr(X), 'Continue,*Cancel');
            // debug
            if (Ans == 'Cancel' || Ans == Chr(27)) return exit(Errcnt);
        }
        // title, URL, pWidth, pHeight, onCloseSubmit, putResultInCtlOrID, pFromWindow)
        Runclick = ('\<input type="button" class="docExampleClick" value="Click here to run this example" onclick="javascript: popoutWindow(&quot;help example&quot;, &quot;?showExample ' + CStr(ByRef_Examplename) + '&quot;, &quot;80%&quot;, &quot;80%&quot;, false);"\>');
        Example = (Change(Join(Example, crlf + '\<br\>'), ' ', '&nbsp;'));

        // Put it back together
        Ha[I] = '\<div class="docExample"\>' + CStr(Example) + '\<br\>' + CStr(Runclick) + '\</div \>\<br\>' + CStr(Block);
    }

    if (Null0(Errcnt) == '0') ByRef__Html = Join(Ha, '');
    return exit(Errcnt);
}
// </EXTRACTEXAMPLES>

// <BUILDCATAGORIES>
async function JSB_TCL_BUILDCATAGORIES(ByRef_F_File, ByRef_Ignored, ByRef_Onegroup, setByRefValues) {
    // local variables
    var Catagories, Id, Item, C, Suba, Catagory, Cati, Tag, Subc;
    var Subtag, Subcc;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_F_File, ByRef_Ignored, ByRef_Onegroup)
        return v
    }
    // Notes - 1) Select returns a list of all primary keys selected. (It takes an optional list of columns too) 
    // 2) ReadNext takes the next ID from the list are returns it.
    // 3) Locate, Extract, Delete, Insert, and Variable<x> are R83 style functions for working with Multi-valued data (see http://jes.com/pb/pb_wp1.html )
    // 4) Locate and Insert are great for sorting data
    // 5)

    if (await JSB_ODB_SELECT('', ByRef_F_File, '', '')); else {
        Println(At(-1), activeProcess.At_Errors);
        return Stop(activeProcess.At_Errors);
    }

    Catagories = {};

    while (1) {
        Id = readNext(odbActiveSelectList).itemid;
        if (CBool(Id)); else break;
        if (await asyncRead(ByRef_F_File, Id, "", 0, _data => Item = _data)); else Item = '';

        if (CBool(Item) && Left(Id, 1) != '_') {
            Item = Left(Item, 3000);
            Item = Trim(DropTags(CStr(Item)));
            C = Field(Field(Field(Field(Field(Field(Mid1(Item, 1, 1000), ' Category:', 2, true), ';', 1, true), '\<', 1, true), Chr(254), 1, true), Chr(10), 1, true), Chr(13), 1, true);
            if (CBool(C)) {
                if (Count(C, '|') == 0) C = ('Reference|' + CStr(C) + '|' + Field(Field(Id, '.HTM', 1, true), '.htm', 1, true));
                if (Count(C, '|') == 1) C += '|' + Field(LCase(Id), '.htm', 1, true);
                C = (Split(C, '|'));
                Suba = Catagories;

                Cati = LBound(C) - 1;
                for (Catagory of iterateOver(C)) {
                    Cati++;
                    Catagory = Trim(Catagory);
                    if (Null0(Cati) == UBound(C)) break;
                    if (isNumber(Catagory)) Catagory = ':' + CStr(Catagory);
                    if (Not(Suba[Catagory])) { Suba[Catagory] = {} }
                    Suba = Suba[Catagory];
                }

                Suba[Catagory] = { "id": Id }
            }
        }
    }

    Catagories = JSB_BF_SORTBYTAGS(Catagories, true);
    for (Tag of iterateOver(Catagories)) {
        Subc = Catagories[Tag];
        Subc = JSB_BF_SORTBYTAGS(Subc, true);

        for (Subtag of iterateOver(Subc)) {
            Subcc = Subc[Subtag];
            Subc[Subtag] = JSB_BF_SORTBYTAGS(Subcc, true);
        }

        Catagories[Tag] = Subc;
    }

    if (await JSB_ODB_WRITE(CStr(Catagories), ByRef_F_File, '__treeCatagories')); else return Stop(activeProcess.At_Errors);

    return exit(Catagories);
}
// </BUILDCATAGORIES>

// <UPDATEANEXAMPLECATAGORY>
async function JSB_TCL_UPDATEANEXAMPLECATAGORY(ByRef_F_File, ByRef_Id, ByRef_Catagories, setByRefValues) {
    // local variables
    var Item, C, Suba, Catagory, Cati;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_F_File, ByRef_Id, ByRef_Catagories)
        return v
    }
    // Notes - 1) Select returns a list of all primary keys selected. (It takes an optional list of columns too) 
    // 2) ReadNext takes the next ID from the list are returns it.
    // 3) Locate, Extract, Delete, Insert, and Variable<x> are R83 style functions for working with Multi-valued data (see http://jes.com/pb/pb_wp1.html )
    // 4) Locate and Insert are great for sorting data
    // 5)

    if (Left(ByRef_Id, 1) == '_') return exit(false);

    if (await asyncRead(ByRef_F_File, ByRef_Id, "", 0, _data => Item = _data)); else return exit(false);

    Item = Left(Item, 3000);
    Item = Trim(DropTags(CStr(Item)));

    C = Field(Field(Field(Field(Field(Field(Mid1(Item, 1, 1000), ' Category:', 2, true), ';', 1, true), '\<', 1, true), Chr(254), 1, true), Chr(10), 1, true), Chr(13), 1, true);

    if (CBool(C)) {
        if (Count(C, '|') == 0) C = ('Reference|' + CStr(C) + '|' + Field(Field(ByRef_Id, '.HTM', 1, true), '.htm', 1, true));
        if (Count(C, '|') == 1) C += '|' + Field(LCase(ByRef_Id), '.htm', 1, true);
        C = (Split(C, '|'));
        Suba = ByRef_Catagories;

        Cati = LBound(C) - 1;
        for (Catagory of iterateOver(C)) {
            Cati++;
            if (Null0(Cati) == UBound(C)) break;
            if (isNumber(Catagory)) Catagory = ':' + CStr(Catagory);
            if (Not(Suba[Catagory])) { Suba[Catagory] = {} }
            Suba = Suba[Catagory];
        }

        Suba[Catagory] = { "id": ByRef_Id };
        if (Null0(Suba[Catagory]) != Null0({ "id": ByRef_Id })) { Suba[Catagory] = { "id": ByRef_Id } }
    }
    return exit(true);
}
// </UPDATEANEXAMPLECATAGORY>

// <SHOWEXAMPLE_Pgm>
async function JSB_TCL_SHOWEXAMPLE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Examplename, F, Mditem, Src, Results;

    Examplename = Field(Field(activeProcess.At_Sentence, '(', 1, true), ' ', 2, true);
    if (Not(Examplename)) return Stop('showExample ExampleName');

    if (await JSB_ODB_OPEN('dict', 'jsb_examples', F, function (_F) { F = _F })); else {
        F = await JSB_BF_FHANDLE('dict', 'jsb_examples', true);
        if (Not(F)) return Stop(activeProcess.At_Errors);
        if (await JSB_ODB_WRITE('R-', F, 'options.txt')); else return Stop(activeProcess.At_Errors);
    }

    if (await JSB_ODB_READ(Mditem, await JSB_BF_FHANDLE('md'), CStr(Examplename), function (_Mditem) { Mditem = _Mditem })) {
        if (System(1) == 'js') {
            if (await JSB_ODB_READ(Src, F, CStr(Examplename) + '.js', function (_Src) { Src = _Src })) return Chain(Examplename);
        } else {
            if (await JSB_ODB_READ(Src, F, CStr(Examplename) + '.pcd', function (_Src) { Src = _Src })) return Chain(Examplename);
        }
    }

    await asyncTclExecute('basic jsb_examples ' + CStr(Examplename), _capturedData => Results = _capturedData)
    if (InStr1(1, Results, '^')) return Stop(Results);

    Print(At(-1));

    return Chain(Examplename);
}
// </SHOWEXAMPLE_Pgm>

// <JSB_Pgm>
async function JSB_TCL_JSB_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Myexename;

    Println('Welcome Admin to JSB. This startup program is TCL JSB');

    // If the default Account is "jsb" (default), then check the EXE Name
    if (Account() == 'jsb' && window.dotNetObj) {
        Myexename = window.dotNetObj.dnoMyExeName();
        if (Myexename != 'jsb') {
            Println('You may create an account called \'', Myexename, '\' (this wndows Executable File Name) to create an auto logto, or');
        }
        Print('You may catalog a program called \'', Myexename, '\' (this wndows Executable File Name) to create an autostart routine');
        if (Account() != Myexename) Println(', or'); else Println();
    }

    if (Account() != Myexename) {
        Println('You may catalog a program called \'', Account(), '\' (from your @Account) to create an autostart routine');
    }

    Println(await JSB_BF_INPUTBUTTON('DOCS', Chr(27) + 'DOCS' + Chr(13)), ' ', await JSB_BF_INPUTBUTTON('DEMOS', Chr(27) + 'DEMOS' + Chr(13)), ' ', html('\<a href="https://groups.google.com/d/forum/jsb---json-basic"\>Blog\</a\>'));
    html('\<a href="https://groups.google.com/d/forum/jsb---json-basic"\>Blog\</a\>');
    Println();
    Println('You are at TCL:');
    return;
}
// </JSB_Pgm>

// <JSBROOT_Pgm>
async function JSB_TCL_JSBROOT_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    return Stop(jsbRoot());

    return;
}
// </JSBROOT_Pgm>

// <JSBROOTACT_Pgm>
async function JSB_TCL_JSBROOTACT_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    return Stop(jsbRootAccount());

    return;
}
// </JSBROOTACT_Pgm>

// <JSBROOTACCOUNT_Pgm>
async function JSB_TCL_JSBROOTACCOUNT_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    return Stop(jsbRootAccount());

    return;
}
// </JSBROOTACCOUNT_Pgm>

// <JSBSYNC_Pgm>
async function JSB_TCL_JSBSYNC_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Mydomain, S, Fsystem, Myaccount, _Options, Dopc, Docompare;
    var Docompareall, Onefile, Jsbcore, Truefname, Gotit, Flist;
    var Fname, Jsburl, Sysprog, Ccnt, Fcnt, Fmd, Compileit, Donotoverwrite;
    var Copyonlyonce, Srcfile, Dstfile, Ftmp, Tfname, Nooverwrites;
    var Mustexist, Fdst, Fsrc, Sl, Difitems, Id, Sitem, Pitem;
    var Stimer, Dtimer, Sstats, Stime, Dstats, Dtime, Cmd, B, X;
    var Corejsb;

    Mydomain = Domain();
    S = dropLeft(Trim(activeProcess.At_Sentence), ' ');

    if (InStr1(1, S, '?') || Not(S)) {
        Println('This will check edit for newer files against jsbwinforms.azurewebsites.net.');
        Println('A   options: (a or *  sync all');
        Println('C   options: (c   compare different items');
        Println('Z   options: (z   compare all items');
        Println('P   options: (p   compile with jsb2js');
        Println('M   options: (m   must already exists - defaulted on browser systems for css & js files)');
        return Stop();
    }

    if (System(1) == 'aspx' && Mydomain == 'jsbwinforms.azurewebsites.net') return Stop('You are on azure. No sync necessary!');
    if (Not(isAdmin())) return Stop('You are not an administrator');

    Fsystem = await JSB_BF_FHANDLE('system');
    Myaccount = jsbAccount();
    _Options = UCase(Field(S, ' (', 2) + Field(await JSB_BF_JSBCONFIG('jsbSync'), ';', 1));
    Dopc = InStr1(1, _Options, 'P');
    Docompare = InStr1(1, _Options, 'C');
    Docompareall = InStr1(1, _Options, 'Z');
    Onefile = fieldLeft(CStr(S), ' ');
    if (Onefile == '*') Onefile = '';

    // Sync only core jsb in SYSPROG
    Jsbcore = Split(LCase(await JSB_BF_JSBCONFIG('core.jsb')), am);

    if (CBool(Onefile)) {
        Truefname = await JSB_BF_TRUEFILENAME(CStr(Onefile));
        if (Left(Truefname, 1) == '.' || InStr1(1, Truefname, '\\')) Truefname = Onefile;

        Gotit = false;
        Flist = [undefined,];
        for (Fname of iterateOver(Jsbcore)) {
            if (Left(Fname, 1) == '*') Flist[Flist.length] = '*';
            if (LCase(Fname) == LCase(Truefname)) {
                Gotit = true;
                Flist[Flist.length] = Fname;
            }
        }
        if (Not(Gotit)) return Stop('I don\'t sync ', Truefname);
    } else {
        Flist = Jsbcore;
    }

    Jsburl = await JSB_BF_JSBCONFIG('jsburl', 'https://jsbwinforms.azurewebsites.net/');
    if (Right(Jsburl, 1) != '/') Jsburl += '/';
    if (!InStr1(1, Jsburl, '//')) {
        Jsburl = '//' + CStr(Jsburl);
    }
    Jsburl += 'sysprog/';

    if (await JSB_ODB_READ(Sysprog, Fsystem, 'sysprog.jsb', function (_Sysprog) { Sysprog = _Sysprog })) {
        if (Extract(Sysprog, 2, 0, 0) != Jsburl) {
            Sysprog = Replace(Sysprog, 2, 0, 0, Jsburl);
            if (await JSB_ODB_WRITE(CStr(Sysprog), Fsystem, 'sysprog.jsb')); else return Stop(activeProcess.At_Errors);
        }
    } else {
        if (await JSB_ODB_WRITE('P!' + am + CStr(Jsburl) + '/sysprog/' + am + 'guest' + am + '9A7C569F40', Fsystem, 'sysprog.jsb')); else return Stop(activeProcess.At_Errors);
    }

    if (await JSB_ODB_READ(Sysprog, Fsystem, 'sysprog.lcl', function (_Sysprog) { Sysprog = _Sysprog })); else {
        if (await JSB_ODB_WRITE('F' + am + '\<\<database\>\>/sysprog/', Fsystem, 'sysprog.lcl')); else return Stop(activeProcess.At_Errors);
    }

    Ccnt = 0;
    Fcnt = 0;
    Fmd = await JSB_BF_FHANDLE('md');
    Compileit = true;

    Donotoverwrite = [undefined, 'htamd', 'pics', '.\\jsb\\pics'];
    Copyonlyonce = [undefined, 'htaconfig', 'htasystem', 'htausers', 'jsb'];

    Srcfile = 'src.compare.file';
    Dstfile = 'dst.compare.file';
    Ftmp = await JSB_BF_FHANDLE('tmp');

    for (Fname of iterateOver(Flist)) {
        if (Left(Fname, 1) == '*') {
            Compileit = false;
            continue;
        }

        Fname = LCase(Fname);
        Print(backgroundcolor('lightgray', color('blue', CStr(Fname))));
        Tfname = LCase(await JSB_BF_TRUEFILENAME(CStr(Fname)));

        if (Locate(Fname, Donotoverwrite, 0, 0, 0, "", position => { })) Nooverwrites = true; else Nooverwrites = false;
        if (Locate(Tfname, Donotoverwrite, 0, 0, 0, "", position => { })) Nooverwrites = true;

        Mustexist = InStr1(1, _Options, 'M');
        if (System(1) == 'js' && (Fname == 'js' || Fname == 'css')) Mustexist = true;

        if (await JSB_ODB_OPEN('', CStr(Fname), Fdst, function (_Fdst) { Fdst = _Fdst })); else return Stop(activeProcess.At_Errors);

        if (Locate(Fname, Copyonlyonce, 0, 0, 0, "", position => { })) continue;
        if (Locate(Tfname, Copyonlyonce, 0, 0, 0, "", position => { })) continue;

        if (await JSB_ODB_WRITE('q' + am + 'sysprog.jsb' + am + CStr(Fname), Fmd, CStr(Srcfile))); else return Stop(activeProcess.At_Errors);

        if (await JSB_ODB_OPEN('', CStr(Srcfile), Fsrc, function (_Fsrc) { Fsrc = _Fsrc })) {
            if (CBool(Docompareall)) {
                if (await JSB_ODB_SELECTTO('', Fsrc, '', Sl, function (_Sl) { Sl = _Sl })); else return Stop(activeProcess.At_Errors);
                Difitems = getList(Sl);
                Print(At(-1));
            } else {
                Difitems = await JSB_BF_DIFFILES(CStr(Srcfile), CStr(Fname), +Mustexist);
            }

            if (CBool(Difitems)) {
                Print('(', Len(Difitems), ') ');

                Fcnt = 0;
                for (Id of iterateOver(Difitems)) {
                    Fcnt++;

                    if (await JSB_ODB_READ(Sitem, Fsrc, CStr(Id), function (_Sitem) { Sitem = _Sitem })); else return Stop(activeProcess.At_Errors);

                    if (CBool(Docompare)) {
                        if (await JSB_ODB_READ(Pitem, Fdst, CStr(Id), function (_Pitem) { Pitem = _Pitem })); else Pitem = '';

                        if (InStr1(1, Sitem, cr) || InStr1(1, Sitem, lf)) {
                            Sitem = Change(Sitem, crlf, am);
                            Sitem = Change(Sitem, cr, am);
                            Sitem = Change(Sitem, lf, am);
                        }
                        if (InStr1(1, Pitem, cr) || InStr1(1, Pitem, lf)) {
                            Pitem = Change(Pitem, crlf, am);
                            Pitem = Change(Pitem, cr, am);
                            Pitem = Change(Pitem, lf, am);
                        }
                        Pitem = Change(Pitem, Chr(160), ' ');
                        Sitem = Change(Sitem, Chr(160), ' ');

                        while (Right(Pitem, 1) == am) {
                            Pitem = Left(Pitem, Len(Pitem) - 1);
                        }

                        while (Right(Sitem, 1) == am) {
                            Sitem = Left(Sitem, Len(Sitem) - 1);
                        }

                        if (Trim(Pitem) == Trim(Sitem)) {
                            Println(Fname, ' ', Id, '  (JSB) ', DateTime(Stimer), ' \<--\> (Local) ', DateTime(Dtimer), '  ==== ITEMS ARE EQUAL');
                            FlushHTML();
                            continue;
                        }

                        if (await JSB_ODB_WRITE(CStr(Sitem), Ftmp, CStr(Id))); else return Stop(activeProcess.At_Errors);
                        Sstats = await JSB_BF_FILESTATS(Fsrc, CStr(Id), function (_Fsrc) { Fsrc = _Fsrc });
                        Stime = Sstats.currentTime;
                        Sstats = Sstats.stats[1];
                        Stimer = CNum(r83Date(CStr(Sstats.date) + ' ' + CStr(Sstats.time))) - CNum(r83Date(Sstats.currentTime));

                        Dstats = await JSB_BF_FILESTATS(Fdst, CStr(Id), function (_Fdst) { Fdst = _Fdst });
                        Dtime = Dstats.currentTime;
                        Dstats = Dstats.stats[1];

                        Dtimer = CNum(r83Date(CStr(Dstats.date) + ' ' + CStr(Dstats.time))) - CNum(r83Date(Dstats.currentTime));

                        Stimer = +Stimer + CNum(r83Date(DateTime()));
                        Dtimer = +Dtimer + CNum(r83Date(DateTime()));

                        Println();
                        Println(Fname, ' ', Id, '  (JSB) ', DateTime(Stimer), ' \<--\> (Local) ', DateTime(Dtimer));

                        Cmd = 'Compare ' + CStr(Srcfile) + ' ' + CStr(Id) + ' (Z,(tmp';
                        // Print @(-1):Cmd
                        await asyncTclExecute(Cmd);
                        B = At_Response.buffer();
                        Println(JSB_HTML_SUBMITBTN('btn', 'Continue'), ' ', JSB_HTML_SUBMITBTN('btn', 'Accept'), ' ', JSB_HTML_SUBMITBTN('btn', 'Quit'));
                        await At_Server.asyncPause(me);
                        At_Response.buffer(B);
                        Print(At(-1));

                        if (await JSB_ODB_DELETEITEM(Ftmp, CStr(Id))); else null;

                        if (formVar('btn') == 'Quit') return Stop();
                        if (formVar('btn') == 'Continue') continue;
                    }

                    if (CBool(Nooverwrites)) {
                        if (await JSB_ODB_READ(Pitem, Fdst, CStr(Id), function (_Pitem) { Pitem = _Pitem })) continue;
                    }

                    if (isJSON(Sitem)) {
                        if (await JSB_ODB_WRITEJSON(Sitem, Fdst, CStr(Id))); else return Stop(activeProcess.At_Errors);
                    } else {
                        if (await JSB_ODB_WRITE(CStr(Sitem), Fdst, CStr(Id))); else return Stop(activeProcess.At_Errors);
                    }

                    Ccnt++;

                    if (CBool(Compileit)) {
                        Print('\<\<', anchorEdit(CStr(Fname), CStr(Id)), '\>\> '); // @Server.Flush
                        await asyncTclExecute('basic ' + CStr(Fname) + ' ' + CStr(Id), _capturedData => X = _capturedData)
                        if (InStr1(1, X, '^')) Println(crlf, Id, ' ', Change(X, am, crlf));
                    } else {
                        Print(anchorEdit(CStr(Fname), CStr(Id)), ' ');
                        if (+Fcnt % 20 == 19) { Print(crlf, '...'); FlushHTML(); }
                    }
                }

                if (CBool(Compileit) && CBool(Dopc)) {
                    for (Id of iterateOver(Difitems)) {
                        Fcnt++;
                        Print('[[', anchorEdit(CStr(Fname), CStr(Id)), ']] '); // @Server.Flush
                        await asyncTclExecute('pc ' + CStr(Fname) + ' ' + CStr(Id), _capturedData => X = _capturedData)
                        if (InStr1(1, X, '^')) Println(crlf, Id, ' ', Change(X, am, crlf));
                    }
                }

                if (CBool(Fcnt) && CBool(Compileit) && CBool(Dopc)) {
                    Print(crlf, 'Linking ', Fname, ' ');
                    await asyncTclExecute('link ' + CStr(Fname) + ' (n');
                    Print('Caching ', Fname, ' ');
                    await asyncTclExecute('cache ' + CStr(Fname));
                }
            } else {
                if (isNothing(Difitems)) Println(activeProcess.At_Errors);
                FlushHTML();
            }
        } else {
            return Stop('Error opening remote file: ', Fname, crlf, activeProcess.At_Errors);
        }
        if (Not(Fcnt) || Not(Compileit) || Not(Dopc)) Println();
    }

    // Deal with local changes - not synced, but edited
    if (CBool(Dopc)) {
        if (CBool(Onefile)) {
            Corejsb = CStr(Split(Field(LCase(await JSB_BF_JSBCONFIG('core.jsb')), '*', 1), am)) + am + 'cs';
            if (Locate(Truefname, Corejsb, 0, 0, 0, "", position => { })) {
                Println('Checking for local changes in ', Onefile);
                await asyncTclExecute('build ' + CStr(Onefile) + ' (s'); // Quietly;
            }
        }
    }

    if (Not(Ccnt)) return Stop('No sync files were changed');
    if (Null0(Ccnt) == 1) return Stop('One file synced');
    return Stop(Ccnt, ' items updated');
}
// </JSBSYNC_Pgm>

// <L_Pgm>
async function JSB_TCL_L_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    await JSB_TCL_TCL_LCMD_Sub(activeProcess.At_Sentence, true, function (_At_Sentence, _P2) { activeProcess.At_Sentence = _At_Sentence });
    return;
}
// </L_Pgm>

// <TCL_LCMD_Sub>
async function JSB_TCL_TCL_LCMD_Sub(ByRef_Sentence, ByRef_Checkprivilages, setByRefValues) {
    // local variables
    var Top, Columns, Dict, Fname, Filterby, Orderby, _Options;
    var Allitems, F, Headercolumns, Setdft, Cols, Tfname, Dftcolumns;
    var Dftno, Ss, Rec, Ed, Missing, Isdosdirectory, Maxlen, Cnt;
    var Ds, Wantstats, Fpath, Fstats, Pkname, Reci, Oldds, Direntry;
    var Spot, Truecolumnnames, Lctruecolumnnames, Tag, Wcolumns;
    var C, I, Wheadercolumns, Jcolumnnames, Headline, Readdicts;
    var Lcolumns, Ci, Dreads, Fd_File, Oconvs, R, Max, Lc, Preread;
    var Ditem, V, Cache, Conv, _Space, Itemids, Direntryi, Name;
    var Li, Id, Td, _Ismissing, X, Desc, Bytesfree, Errs, Nbytesfree;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Sentence, ByRef_Checkprivilages)
        return v
    }
    if (!(await JSB_BF_PARSESELECT(CStr(ByRef_Sentence), '', Top, Columns, Dict, Fname, Filterby, Orderby, _Options, Allitems, F, true, false, Headercolumns, function (_Top, _Columns, _Dict, _Fname, _Filterby, _Orderby, __Options, _Allitems, _F, _Headercolumns) { Top = _Top; Columns = _Columns; Dict = _Dict; Fname = _Fname; Filterby = _Filterby; Orderby = _Orderby; _Options = __Options; Allitems = _Allitems; F = _F; Headercolumns = _Headercolumns }))) {
        if (activeProcess.At_Errors) return Stop(activeProcess.At_Errors);
        Println('l (list) syntax:');
        Println('   l { columnNames | * } From tableName { Where Condition }');
        Println('   l tableName ColumnNames { Where Condition }');
        Println();
        Println('options:');
        Println('   (1-9 - # of columns (default is 4)');
        Println('   (n - do not clear screen');
        Println('   (f - include file stats');
        Println('   (s - sort by file size');
        Println('   (d - sort by file datetime');
        Println('   (t - sort by file time');
        Println('   (#1, (#2, ... set default list format n (use \'l tablename #1\' to use)');
        return Stop();
    }

    if (InStr1(1, _Options, '#')) {
        Setdft = CNum(Field(_Options, '#', 2, true));
        if (Not(Setdft)) Setdft = '0';
        _Options = Left(_Options, activeProcess.Col1 - 1) + Mid1(_Options, activeProcess.Col1 + Len(Setdft) + 1);
    }

    if (CNum(_Options)) Cols = CInt(CNum(_Options)); else Cols = 4;
    if (CBool(ByRef_Checkprivilages)) if (await JSB_BF_ISRESTRICTEDFILE(CStr(F))) return Stop(activeProcess.At_Errors);
    if (!isEmpty(Dict)) Dict = CStr(Dict) + ' ';

    Tfname = await JSB_BF_TRUETABLENAME(CStr(Fname));

    if (Not(Columns) && !Len(Setdft)) {
        if (await JSB_ODB_READ(Dftcolumns, await JSB_BF_FHANDLE('dict', Fname), (Dict ? 'ld' : 'l') + '_defaultcolumns_0', function (_Dftcolumns) { Dftcolumns = _Dftcolumns })) {
            Columns = '#0';
        } else {
            if (await JSB_ODB_READ(Dftcolumns, await JSB_BF_FHANDLE('dict', Tfname), (Dict ? 'ld' : 'l') + '_defaultcolumns_0', function (_Dftcolumns) { Dftcolumns = _Dftcolumns })) {
                Columns = '#0';
            }
        }
    }

    // use default?
    if (Left(Columns, 1) == '#') {
        Dftno = CNum(Mid1(Columns, 2));
        if (await JSB_ODB_READ(Dftcolumns, await JSB_BF_FHANDLE('dict', Fname), (Dict ? 'ld' : 'l') + '_defaultcolumns_' + CStr(Dftno), function (_Dftcolumns) { Dftcolumns = _Dftcolumns })); else {
            if (await JSB_ODB_READ(Dftcolumns, await JSB_BF_FHANDLE('dict', Tfname), (Dict ? 'ld' : 'l') + '_defaultcolumns_' + CStr(Dftno), function (_Dftcolumns) { Dftcolumns = _Dftcolumns })); else Dftcolumns = '';
        }

        if (CBool(Dftcolumns)) {
            if (Not(Top)) Top = Extract(Dftcolumns, 1, 0, 0);
            Columns = Split(Extract(Dftcolumns, 2, 0, 0), vm);
            Headercolumns = Split(Extract(Dftcolumns, 3, 0, 0), vm);
            if (Not(Filterby)) Filterby = Extract(Dftcolumns, 4, 0, 0);
            if (Not(Orderby)) Orderby = Extract(Dftcolumns, 5, 0, 0);
            if (Not(_Options)) _Options = Change(Extract(Dftcolumns, 6, 0, 0), ',', '');
            if (CNum(_Options)) Cols = CInt(CNum(_Options));
        } else {
            return Stop('Unable to find default column list ', Dftno);
        }
    }

    if (await JSB_ODB_SELECTTO(LTrim(CStr(Top) + ' ') + Join(Columns, ' '), F, CStr(Filterby) + CStr(Orderby), Ss, function (_Ss) { Ss = _Ss })); else return Stop(activeProcess.At_Errors);
    if (Len(Setdft)) {
        Rec = Top;
        Rec = Replace(Rec, 2, 0, 0, Join(Columns, vm));
        Rec = Replace(Rec, 3, 0, 0, Join(Headercolumns, vm));
        Rec = Replace(Rec, 4, 0, 0, Filterby);
        Rec = Replace(Rec, 5, 0, 0, Orderby);
        Rec = Replace(Rec, 6, 0, 0, Change(_Options, ',', ''));
        if (await JSB_ODB_WRITE(CStr(Rec), await JSB_BF_FHANDLE('dict', Fname, true), (Dict ? 'ld' : 'l') + '_defaultcolumns_' + CStr(Setdft))); else return Stop(activeProcess.At_Errors);
        if (await JSB_BF_MSGBOX('Default Columns set', 'OK') != 'OK') return Stop();
    }

    if (Index1(_Options, 'N', 1) == 0) Print(At(-1));

    if (CBool(isAdmin())) Ed = 'ED ';

    Missing = [undefined,];
    Isdosdirectory = JSB_BF_TYPEOFFILE(F) == 'dos';
    Maxlen = CInt(150 / +Cols) - 1;
    if (Null0(Maxlen) < 40) Maxlen = 40;
    Cnt = 0;
    Ds = getList(Ss);
    clearSelect(odbActiveSelectList);
    if (Not(Ds)) return Stop('No items found');
    if (isEmpty(Columns) && Not(isArray(Ds))) Ds = Split(Ds, am);

    // Setup for Binary files
    Wantstats = (InStr1(1, _Options, 'F') || InStr1(1, _Options, 'S') || InStr1(1, _Options, 'D') || InStr1(1, _Options, 'T'));
    if (CBool(Isdosdirectory)) {
        Fpath = Change(Mid1(F, 5), '\\', '/');
        if (Fpath == '.') Fpath = './';
        if (Left(Fpath, 1) == '.') {
            Fpath = HtmlRoot() + CStr(Fpath);
        } else {
            Fpath = HtmlRoot() + Change(Mid1(filePath(F), Len(jsbRootDir()) + 1), '\\', '/');
        }

        if (Right(Fpath, 1) != '/') Fpath += '/';

        if (CBool(Wantstats)) {
            Fstats = await JSB_BF_FILESTATS(F, undefined, function (_F) { F = _F });
            if (CBool(Fstats)) {
                Fstats = Fstats.stats;
                if (InStr1(1, _Options, 'D') || isEmpty(_Options)) Fstats = Sort(Fstats, '#timeStamp');
                if (InStr1(1, _Options, 'S')) Fstats = Sort(Fstats, '#size');
                if (InStr1(1, _Options, 'T')) Fstats = Sort(Fstats, 'time');
            }
        }
    }

    if (CBool(Columns)) {
        if (CBool(Fstats)) {
            var Titemids = [undefined,];
            Pkname = await JSB_BF_PRIMARYKEYNAME(F);

            Reci = LBound(Ds) - 1;
            for (Rec of iterateOver(Ds)) {
                Reci++;
                Titemids[Reci] = Rec[Pkname];
            }

            Oldds = Ds;
            Ds = [undefined,];
            for (Direntry of iterateOver(Fstats)) {
                if (Locate(Direntry.name, Titemids, 0, 0, 0, "", position => Spot = position)) {
                    Rec = Oldds[Spot];
                    if (Not(Rec.date)) Rec.date = Direntry.date;
                    if (Not(Rec.time)) Rec.time = Direntry.time;
                    if (Not(Rec.timeStamp)) Rec.timeStamp = Direntry.timeStamp;
                    if (Not(Rec.size)) Rec.size = Direntry.size;

                    Ds[Ds.length] = Rec;
                }
            }
        }

        Truecolumnnames = [undefined,];
        Lctruecolumnnames = [undefined,];
        for (Tag of iterateOver(Ds[LBound(Ds)])) {
            Truecolumnnames[Truecolumnnames.length] = Tag;
            Lctruecolumnnames[Lctruecolumnnames.length] = LCase(Tag);
        }

        if (Trim(Columns) == '*') {
            Columns = Truecolumnnames;
            Headercolumns = Truecolumnnames;;
        } else {
            Wcolumns = Split(LTrim(Join(Columns, am)), am);
            Columns = [undefined,];
            I = LBound(Wcolumns) - 1;
            for (C of iterateOver(Wcolumns)) {
                I++;
                if (Locate(LCase(C), Lctruecolumnnames, 0, 0, 0, "", position => Spot = position)) Columns[Columns.length] = Truecolumnnames[Spot]; else Columns[Columns.length] = Truecolumnnames[I];
            }

            Wheadercolumns = Split(LTrim(Join(Columns, am)), am);
            Headercolumns = [undefined,];
            I = LBound(Wheadercolumns) - 1;
            for (C of iterateOver(Wheadercolumns)) {
                I++;
                if (Locate(LCase(C), Lctruecolumnnames, 0, 0, 0, "", position => Spot = position)) Headercolumns[Headercolumns.length] = Truecolumnnames[Spot]; else Headercolumns[Headercolumns.length] = C;
            }
        }

        Jcolumnnames = Join(Columns, ',');
        if (CBool(Jcolumnnames)) Jcolumnnames += ' From ';
        Top = LTrim(CStr(Top) + ' ');

        Headline = ('L ' + CStr(Top) + CStr(Jcolumnnames) + CStr(Dict) + CStr(Fname) + ' ' + (CBool(Filterby) && Left(LCase(Filterby), 6) != 'order ' ? 'Where ' + CStr(Filterby) : Filterby));
        Println(html('\<button type=\'button\' class=\'btn btn-primary\' onclick=\'appendKey("' + htmlEscape(Headline) + '");\'\>' + htmlEscape(Headline) + '\</button\>'));
        Println();

        Print(html('\<table style=\'max-width: 95%; white-space: nowrap;\'\>'));

        // Pre-read all headers in one GetList
        Readdicts = [undefined,];
        Lcolumns = LCase(Columns);
        for (C of iterateOver(Headercolumns)) {
            C = dropIfLeft(LCase(C), ' as ');
            if (Locate(C, Lcolumns, 0, 0, 0, "", position => Ci = position)) Readdicts[Readdicts.length] = C;
        }

        Dreads = undefined;
        if (Len(Readdicts)) {
            if (await JSB_ODB_OPEN('dict', CStr(Fname), Fd_File, function (_Fd_File) { Fd_File = _Fd_File })) {
                odbActiveSelectList = formList(Readdicts);
                if (await JSB_ODB_SELECTTO('ItemID,*', Fd_File, '', Ss, function (_Ss) { Ss = _Ss })); else return Stop(activeProcess.At_Errors);
                Dreads = getList(Ss);
            }
        }

        // Process Header
        Oconvs = [undefined,];
        R = [undefined, html('\<tr\>')];
        for (C of iterateOver(Headercolumns)) {
            Max = 0;
            Lc = dropIfLeft(LCase(C), ' as ');
            if (Locate(Lc, Lcolumns, 0, 0, 0, "", position => Ci = position)) {
                for (Preread of iterateOver(Dreads)) {
                    if (LCase(Preread.ItemID) == Lc) {
                        Ditem = Preread.ItemContent;
                        if (Extract(Ditem, 2, 0, 0)) Max = Extract(Ditem, 2, 0, 0);
                        if (InStr1(1, ' AaSs', Extract(Ditem, 1, 0, 0)) > 1 && Extract(Ditem, 7, 0, 0)) Oconvs[Ci] = Extract(Ditem, 7, 0, 0);
                        break;
                    }
                }
            }
            V = '';
            if (CBool(Max)) {
                if (CNum(Max) == Null0(Max)) Max = CStr(+Max * 8) + 'px';
                R[R.length] = JSB_HTML_TD(bold(CStr(C)), { "style": 'max-width: ' + CStr(Max), "overflow": 'hidden' });
            } else {
                R[R.length] = JSB_HTML_TD(bold(CStr(C)));
            }
            R[R.length] = JSB_HTML_TD(' ');
        }
        R[R.length] = html('\</tr\>');
        Print(Join(R, ''));

        // Process dataset
        Cache = undefined;
        Pkname = LCase(Pkname);
        for (Rec of iterateOver(Ds)) {
            R = [undefined, '\<tr\>'];
            Ci = LBound(Columns) - 1;
            for (C of iterateOver(Columns)) {
                Ci++;
                V = Rec[Trim(C)];
                Conv = Oconvs[Ci];
                if (CBool(Conv)) V = await JSB_BF_IOCONV('O', CStr(V), CStr(Conv), undefined, Cache);

                if (Left(V, 1) != Chr(28)) {
                    Lc = LCase(C);
                    if (Lc == 'itemid' || Null0(Lc) == Null0(Pkname)) {
                        V = anchorEdit(CStr(Dict) + CStr(Fname), CStr(V), CStr(V), CStr(Fpath), +Maxlen);
                    } else {
                        if (isEmpty(V)) { V = ('&nbsp;'); } else V = At_Server.HtmlEncode(V);
                    }
                }
                R[R.length] = ('\<td\>' + CStr(V) + '\</td\>\<td\>&nbsp;\</td\>');
            }
            R[R.length] = '\</tr\>';

            Print(Chr(28), Join(R, ''), Chr(29));
            Cnt = +Cnt + 1;
        };
    } else {
        Top = LTrim(CStr(Top) + ' ');
        _Space = (html('&' + 'nbsp;'));
        _Space = ' ';
        if (Not(isArray(Ds))) Ds = Split(Ds, am);

        Headline = ('L ' + LTrim(CStr(Top) + ' ') + CStr(Dict) + CStr(Fname) + ' ' + (CBool(Filterby) && Left(LCase(Filterby), 6) != 'order ' ? 'Where ' + CStr(Filterby) : Filterby));
        Println(html('\<button type=\'button\' class=\'btn btn-primary\' onclick=\'appendKey("' + htmlEscape(Headline) + '");\'\>' + htmlEscape(Headline) + '\</button\>'));
        Println();

        Println('*************** L ', Top, ' ', Dict, Tfname, ' ', (Filterby ? ' Where ' + CStr(Filterby) : ''));
        Println();
        Print(html('\<table style=\'width: 95%; white-space: nowrap;\'\>'));

        if (CBool(Fstats)) {
            Oldds = Ds;
            Ds = [undefined,];
            Itemids = {};
            Direntryi = LBound(Fstats) - 1;
            for (Direntry of iterateOver(Fstats)) {
                Direntryi++;
                Name = Direntry.name;
                if (Locate(Name, Oldds, 0, 0, 0, "", position => { })) Ds[Ds.length] = Name;
                Itemids[Name] = Direntry;
            }
        }

        var _ForEndI_67 = UBound(Ds);
        for (Li = LBound(Ds); Li <= _ForEndI_67; Li++) {
            Id = Ds[Li];
            Td = '';
            var _ForEndI_68 = +Cols;
            for (I = 1; I <= _ForEndI_68; I++) {
                _Ismissing = isEmpty(Id);

                do {
                    if (CBool(Fstats)) Direntry = Itemids[Id]; else Direntry = '';

                    if (Not(Direntry) && (Filterby == '*' || CBool(Wantstats))) {
                        if (await JSB_ODB_READ(X, F, CStr(Id), function (_X) { X = _X })); else {
                            _Ismissing = true;
                            if (CBool(Id)) Missing[Missing.length] = Id;
                        }
                    }

                    if (Not(_Ismissing)) {
                        Cnt++;
                        Td += JSB_HTML_TD(anchorEdit(CStr(Dict) + CStr(Fname), CStr(Id), CStr(Id), CStr(Fpath), +Maxlen));

                        if (CBool(Fstats)) {
                            Direntry = Itemids[Id];
                            Td += JSB_HTML_TD(MonoSpace(CStr(_Space) + CStr(Direntry.date) + CStr(_Space) + CStr(Direntry.time) + CStr(_Space) + CStr(_Space) + Right(Space(10) + CStr(Direntry.size), 10) + CStr(_Space)));
                        } else if (CBool(Wantstats)) {
                            Td += JSB_HTML_TD(MonoSpace(Right(Space(10) + CStr(Len(X)), 10) + CStr(_Space)));
                        }
                    }

                    Li++;
                    if (Null0(Li) > UBound(Ds)) break;
                    Id = Ds[Li];
                }
                while (CBool(Missing));

                if (Null0(Li) > UBound(Ds)) break;
            }

            Print(Chr(28), '\<tr\>', Td, '\</tr\>', Chr(29));
            Li--;
        }
    }

    Println(html('\</table\>'));

    if (Null0(Cnt) == '0') Desc = ''; else if (Null0(Cnt) == 1) Desc = '1 item listed.'; else Desc = CStr(Cnt) + ' items listed.';;

    if (System(1) == 'aspx') {
        try {
            Bytesfree = await asyncRpcRequest('DOSEXECUTE', jsbRootDir(), 'dir a*.*', Errs);
        } catch (Xerr) { }
        if (CBool(Bytesfree)) {
            Bytesfree = Trim(Field(Field(Bytesfree, '(s)', 3, true), 'bytes', 1, true));
            Nbytesfree = CNum(Change(Bytesfree, ',', ''));
            if (Null0(Nbytesfree) < 10000000) Desc += '    ' + backgroundcolor('Yellow', color('Black', '(' + CStr(Bytesfree) + ' bytes free)')); else Desc += '     (' + CStr(Bytesfree) + ' bytes free)';
        }
    }
    Println(Desc);

    if (Len(Missing)) Println('Missing item ', Join(Missing, crlf + 'Missing item '));
    clearSelect(odbActiveSelectList);

    if (Not(isPhoneGap()) || hasParentProcess() || hasTclParent()) return Stop();
    Println(Button('is', 'Close', { "onclick": 'At_Server.End(me)' }));

    return exit();
}
// </TCL_LCMD_Sub>

// <LET_Pgm>
async function JSB_TCL_LET_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S, Fh, X;

    if (Not(isAdmin())) return Stop('You are not an administrator');
    S = Mid1(activeProcess.At_Sentence, Index1(activeProcess.At_Sentence, ' ', 1) + 1, 9999);

    Fh = await JSB_BF_FHANDLE('', 'tmp', true);
    if (await JSB_ODB_WRITE('Program LR' + am + 'Let ' + CStr(S), Fh, 'lr')); else return Stop(activeProcess.At_Errors);

    if (System(1) == 'gae' || System(1) == 'aspx') {
        await asyncTclExecute('basic tmp lr', _capturedData => X = _capturedData);
    } else {
        await asyncTclExecute('pc tmp lr', _capturedData => X = _capturedData);
    }

    if (InStr1(1, X, 'Successful')) await asyncTclExecute('run tmp lr'); else Println(X);

    clearSelect(odbActiveSelectList);

    return;
}
// </LET_Pgm>

// <LF_Pgm>
async function JSB_TCL_LF_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Localfiles, E, Viewname, I, Isjsbfile, Displayname, Execmd;

    clearSelect(odbActiveSelectList);
    var Attacheddb = JSB_BF_ATTACHEDDB();
    var Rmtattacheddb = '';
    if (Attacheddb) Rmtattacheddb = await asyncRpcRequest('ATTACHEDDB');

    var Sentence = activeProcess.At_Sentence;
    var _Options = LCase(Field(Sentence, ' (', 2));
    Sentence = LCase(Field(Sentence, ' (', 1));
    var Allfields = InStr1(1, _Options, '*');
    var Includejsb = (InStr1(1, _Options, 'j') || InStr1(1, _Options, 'a'));
    var Includelocal = InStr1(1, _Options, 'a');
    var Includeviews = (InStr1(1, _Options, 'a') || InStr1(1, _Options, 'v'));
    var Cols = CNum(_Options);
    if (Cols <= 0) Cols = 3;

    var Filterby = Field(Sentence, ' ', 3);
    var Listaccount = '';
    var Mustcontain = '';
    var Mustendwith = '';
    var Lenmustendwith = 0;
    var Muststartwith = '';
    var Lenmuststartwith = 0;
    if (Filterby) Listaccount = Field(Sentence, ' ', 2); else Filterby = Field(Sentence, ' ', 2);

    if (Not(Attacheddb) && Not(Listaccount) && !Includejsb) Includejsb = LCase(jsbAccount()) == 'sysprog';

    if (Left(Filterby, 1) == '[' || Right(Filterby, 1) == ']') {
        Includejsb = true;
        if (Left(Filterby, 1) == '[') {
            if (Right(Filterby, 1) == ']') {
                Mustcontain = LCase(Mid1(Filterby, 2, Len(Filterby) - 2));
            } else {
                Mustendwith = LCase(Mid1(Filterby, 2));
                Lenmustendwith = Len(Mustendwith);
            }
        } else {
            Muststartwith = LCase(Left(Filterby, Len(Filterby) - 1));
            Lenmuststartwith = Len(Muststartwith);
        }
    } else if (Listaccount) {
        return Stop('filters must start or end with []');
    } else {
        Listaccount = Filterby;
        Filterby = '';
    }

    if (Listaccount) {
        if (await JSB_ODB_ATTACHDB(Listaccount)); else {
            Println(activeProcess.At_Errors);
            if (await JSB_ODB_ATTACHDB(Attacheddb)); else null;
            return Stop();
        }
    }

    // Get whatever we are attached to
    var Sfilelist = '', Filelist = undefined, Fname = '', Idi = undefined;
    var Filemix = 0;

    if (Rmtattacheddb) {
        Sfilelist = await asyncRpcRequest('LISTFILES');
    } else {
        Sfilelist = await JSB_BF_LISTFILES();
    }

    Filelist = Sort(Sfilelist, 'LAI'); // Left, Ascending, Ignore Case
    Idi = LBound(Filelist) - 1;
    for (Fname of iterateOver(Filelist)) {
        Idi++;
        if (Attacheddb) Fname = CStr(Fname) + vm + 'RMT:';
        Filelist[Idi] = Fname;
    }

    // Do we need dos files too?
    if ((Listaccount || Attacheddb) && Includelocal) {
        if (await JSB_ODB_ATTACHDB('')) {
            if (await JSB_ODB_LISTFILES(Localfiles, function (_Localfiles) { Localfiles = _Localfiles })) {
                Localfiles = Split(Localfiles, am);
                for (Fname of iterateOver(Localfiles)) {
                    Filelist[Filelist.length] = Fname + vm + 'DOS';
                }
                Filelist = Sort(Filelist, 'LAI');
                Filemix = 1;
            }
        }
    }

    if (Includeviews) {
        var Views = undefined;
        if (System(1) == 'js') Views = await asyncRpcRequest('LISTFILES', E, true); else Views = System(37);
        if (CBool(Views)) {
            for (Viewname of iterateOver(Views)) {
                Filelist[Filelist.length] = Viewname;
            }
            Filelist = Sort(Filelist, 'I');
            Filemix = 2;
        }
    }

    if (Listaccount || Attacheddb) { if (await JSB_ODB_ATTACHDB(Attacheddb)); else null; }

    if (Attacheddb) {
        Println(Div('id2', Center(bold(Attacheddb))));
    } else {
        Println(Div('id2', Center(Account())));
    }

    Println(JSB_HTML_SETSTYLE('id2', { 'background-color': 'lightgray', "color": 'black', "border": '1px solid black ' }));
    Print(html('\<table style=\'width: 95%; white-space: nowrap;\'\>'));
    var Cnt = 0;
    Idi = 1;
    var Forformlist = [undefined,];

    while (Idi <= UBound(Filelist)) {
        var R = '';
        var _ForEndI_23 = Cols;
        for (I = 1; (I <= _ForEndI_23) && Idi <= UBound(Filelist); I++) {

            while (true) {
                var Filename = Extract(Filelist[Idi], 1, 1, 0);
                if (Left(Filename, 1) == Chr(1)) Filename = Mid1(Filename, 2);
                var Lcfilename = LCase(Filename);

                if (Mustcontain) {
                    if (!InStrI1(1, Filename, Mustcontain)) Filename = '';
                } else if (Mustendwith) {
                    if (LCase(Right(Filename, Lenmustendwith)) != Mustendwith) Filename = '';
                } else if (Muststartwith) {
                    if (LCase(Left(Filename, Lenmuststartwith)) != Muststartwith) Filename = '';
                }

                Isjsbfile = (Left(Lcfilename, 4) == 'jsb_' || Left(Lcfilename, 4) == 'jsb2');

                if (Not(Not(Filename) || (CBool(Isjsbfile) && !Includejsb))) break;
                Idi++;
                if (Idi > UBound(Filelist)) break
            }

            if (Idi <= UBound(Filelist)) {
                if (Cols == 1) {
                    Displayname = htmlEscape(Filename);
                } else if (Cols == 2) {
                    Displayname = htmlEscape(Right(Filename, 60));
                } else {
                    Displayname = htmlEscape(Right(Filename, 30));
                }
                var Protocoltag = Extract(Filelist[Idi], 1, 2, 0);

                // Local and Remote
                if (Filemix == 1) {
                    if (Protocoltag == 'RMT:') {
                        Displayname = html('\<span style=\'opacity: .5\'\>' + CStr(Displayname) + '\</span\>');
                    } else {
                        // displayName = @Bold(displayName);
                    }

                    // and Views;
                } else if (Filemix == 2) {
                    if (Protocoltag) {
                        Displayname = html('\<span data-toggle="tooltip" title="' + htmlEscape(Protocoltag) + '"\>' + CStr(Displayname) + '\</span\>');
                    } else {
                        // displayName = @html("<span style='opacity: .5'>" : DisplayName : "</span>");
                    }
                } else if (Protocoltag) {
                    Displayname = html('\<span style=\'opacity: .5\'\>' + CStr(Displayname) + '\</span\>');
                }

                if (Protocoltag != 'RMT:') Protocoltag = '';
                if (Allfields) Execmd = JSB_BF_JSBROOTEXECUTETCLCMD('L * From \'' + Protocoltag + Filename + '\''); else Execmd = JSB_BF_JSBROOTEXECUTETCLCMD('L \'' + Protocoltag + Filename + '\'');
                R += JSB_HTML_TD(Chr(28) + '\<a href=' + jsEscapeHREF(CStr(Execmd)) + ' target="_blank"\>' + CStr(Displayname) + '\</a\>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + Chr(29));

                Forformlist[Forformlist.length] = Protocoltag + Filename;
                Cnt++;
                Idi++;
            }
        }
        if (R) Print(JSB_HTML_TR(R))
    }

    Println(html('\</table\>'));
    if (Cnt) {
        if (Cnt == 1) Print('1 file listed.'); else Print(Cnt, ' files listed.');
        Println(' (savelist saved to ', anchorEdit('jsb_selectlists', 'lf'), ')');
        odbActiveSelectList = formList(Forformlist);
        if (await asyncSaveList(odbActiveSelectList, 'lf')); else return Stop(activeProcess.At_Errors);
    } else {
        Println('No files listed.');
    }
    clearSelect(odbActiveSelectList);

    if (Not(isPhoneGap()) || hasTclParent() || hasParentProcess()) return Stop();
    Print(Button('id', 'Close', { "onclick": 'return jsbClose()' }));

    return;
}
// </LF_Pgm>

// <BUMP_Pgm>
async function JSB_TCL_BUMP_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    if (Not(isAdmin())) return Stop('You are not an administrator');
    Println(await JSB_TCL_BUMPJSBVERSION('tcl.html'));
    return;
}
// </BUMP_Pgm>

// <BUMPJSBVERSION>
async function JSB_TCL_BUMPJSBVERSION(Fname) {
    // local variables
    var Rel, Fmd2, Sl, Fnames, Tclhtml, C, I, J;

    // Bump the version numbers used in JSB
    Rel = CNum(dropIfRight(CStr(Timer()), '.')) + 1;
    if (await JSB_ODB_OPEN('', '.\\jsb', Fmd2, function (_Fmd2) { Fmd2 = _Fmd2 })); else return Stop(activeProcess.At_Errors);
    if (await JSB_ODB_SELECTTO('', Fmd2, 'ItemID like \'[.html\'', Sl, function (_Sl) { Sl = _Sl })); else return Stop(activeProcess.At_Errors);
    Fnames = getList(Sl);
    for (Fname of iterateOver(Fnames)) {
        if (await JSB_ODB_READ(Tclhtml, Fmd2, CStr(Fname), function (_Tclhtml) { Tclhtml = _Tclhtml })) {
            if (InStr1(1, Tclhtml, '?cacheBuster=')) {
                var _ForEndI_6 = Count(Tclhtml, '?cacheBuster=');
                for (C = 1; C <= _ForEndI_6; C++) {
                    I = Index1(Tclhtml, '?cacheBuster=', C);
                    J = InStr1(I, Tclhtml, '!');
                    if (Not(J)) return Stop('Missing ! after ?cacheBuster=');
                    Tclhtml = Left(Tclhtml, +I - 1) + '?cacheBuster=' + CStr(Rel) + Mid1(Tclhtml, J);
                }

                if (await JSB_ODB_WRITE(CStr(Tclhtml), Fmd2, CStr(Fname))); else return Stop(activeProcess.At_Errors);
            }
        }
    }
    return Rel;
}
// </BUMPJSBVERSION>

// <LOGIN_Pgm>
async function JSB_TCL_LOGIN_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Ans;

    var Successfullogin = false;
    var Rtnto = CStr(paramVar('returnto')) + CStr(paramVar('returnurl'));

    var Config = await JSB_BF_JSBCONFIG('authenticationtype');
    var Authtype = 'local';
    if (CBool(Config)) Authtype = Config.value;

    var S = Field(activeProcess.At_Sentence, '(', 1);
    var Opts = Field(S, '?', 2);
    var D = ' ';
    if (InStr1(1, S, ',')) D = ',';

    var _Username = Trim(Field(S, D, 2));
    var _Passwd = Trim(Field(S, D, 3));

    if (Rtnto) {
        if (Not(_Username)) _Username = paramVar('returnurl');
        if (Not(_Passwd)) _Passwd = paramVar('password');
    }

    if (Authtype == 'oauth' && !_Username) {
        var Access_Token = await JSB_ODB_OAUTH_LOGIN('', false);
        if (Access_Token) {
            Successfullogin = true;
            if (InStr1(1, Rtnto, '?')) Rtnto += '&'; else Rtnto += '?';
            Rtnto += '&ccess_token=' + Access_Token;
        }
    } else {
        if (_Username) { Successfullogin = await JSB_TCL_TCLLOGIN(_Username, _Passwd, function (__Username, __Passwd) { _Username = __Username; _Passwd = __Passwd }); }

        if (!Successfullogin && Not(_Passwd) && LCase(_Username) != 'guest') {
            if (System(1) == 'gae') {
                if (JSB_BF_ISAUTHENTICATED()) return Stop('You are logged in as ', UserName(), ' and your email is ', At_Request.UserEmail);
                return At_Response.Redirect(At_Server.loginurl(At_Request.Path));
            }

            var Msg = 'Please login';
            if (Not(_Username)) _Username = UserName();
            if (_Username == 'anonymous') _Username = '';


            while (true) {
                Ans = await JSB_TCL_LOGINBOX('JSB', Msg, _Username, function (_P1, _Msg, __Username) { Msg = _Msg; _Username = __Username });
                if (Ans == Chr(27) || isEmpty(Ans)) break;
                _Username = Extract(Ans, 1, 0, 0);
                _Passwd = Extract(Ans, 2, 0, 0);

                Successfullogin = await JSB_TCL_TCLLOGIN(_Username, _Passwd, function (__Username, __Passwd) { _Username = __Username; _Passwd = __Passwd });
                if (Successfullogin) break;
                Msg = 'Invalid.  Please try again';
            }
        }
    }

    if (!Successfullogin) return Stop('Login Failed');
    if (Rtnto) return At_Response.Redirect(Rtnto);
    return;
}
// </LOGIN_Pgm>

// <TCLLOGIN>
async function JSB_TCL_TCLLOGIN(ByRef__Username, ByRef__Passwd, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef__Username, ByRef__Passwd)
        return v
    }
    if (await JSB_BF_VERIFYUSER(ByRef__Username, CStr(ByRef__Passwd), function (_ByRef__Username) { ByRef__Username = _ByRef__Username })) {
        await JSB_BF_SIGNIN(ByRef__Username, true, function (_ByRef__Username) { ByRef__Username = _ByRef__Username });
        JSB_BF_AUDITLOG('Login ' + CStr(ByRef__Username) + ' -- success');
        return exit(true);
    }
    JSB_BF_AUDITLOG('Login ' + CStr(ByRef__Username) + ' -- failed');
    return exit(false);
}
// </TCLLOGIN>

// <LOGINFO_Pgm>
async function JSB_TCL_LOGINFO_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S;

    S = Trim(dropLeft(CStr(activeProcess.At_Sentence), ' '));
    if (CBool(S)) await JSB_BF_LOGINFO(CStr(S));
    return;
}
// </LOGINFO_Pgm>

// <LOGOUT_Pgm>
async function JSB_TCL_LOGOUT_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Byebye, Rootact, Rootlen, Lurl;

    clearSelect(odbActiveSelectList);
    Byebye = paramVar('returnurl');
    if (Not(Byebye)) {
        Rootact = LCase(JsbRootAct());
        Rootlen = Len(Rootact);

        Byebye = Field(LogoutUrl(), '?', 1);
        if (Left(Byebye, Rootlen) == Rootact) Byebye = Mid1(Byebye, +Rootlen + 1);

        Lurl = Field(JSB_BF_URL(), '?', 1);
        if (Left(Lurl, Rootlen) == Rootact) Lurl = Mid1(Lurl, +Rootlen + 1);
        if (Null0(Byebye) == Null0(Lurl)) Byebye = ''; else Byebye = LogoutUrl();
    }

    await SignOut();
    if (Not(Byebye)) At_Server.End();
    if (!InStr1(1, Byebye, '//')) Byebye = JsbRootAct() + CStr(Byebye);
    return At_Response.redirect(Byebye);
}
// </LOGOUT_Pgm>

// <LOGTO_Pgm>
async function JSB_TCL_LOGTO_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    var Toaccount = Field(Trim(activeProcess.At_Sentence), ' ', 2);
    if (Not(Toaccount)) return Stop('Logto \<Account\>');

    if (System(1) == 'js') {
        if (isHTA() || window.dotNetObj) return Stop(window.Logto(Toaccount));
    } else {
        if (!(await JSB_BF_ACCOUNTEXISTS(Toaccount))) return Stop(bold(Toaccount), ' does not exist.');
    }
    if (await JSB_ODB_ATTACHDB('')); else null;
    return At_Response.Redirect(HtmlRoot() + Toaccount + '/');
}
// </LOGTO_Pgm>

// <LPICS_Pgm>
async function JSB_TCL_LPICS_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Fpics, Id;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                if (Not(isAdmin())) return Stop('You are not an administrator');
                clearSelect(odbActiveSelectList);
                if (await JSB_ODB_OPEN('', 'pics', Fpics, function (_Fpics) { Fpics = _Fpics })); else return Stop('no pics');
                if (await JSB_ODB_SELECT('', Fpics, '', '')); else return Stop(activeProcess.At_Errors);

            case "10":
                Id = readNext(odbActiveSelectList).itemid;
                if (CBool(Id)); else return Stop();
                Println();
                Println(Id);
                Println(IMAGE(jsbRoot() + 'pics/' + CStr(Id)));
                gotoLabel = "10"; continue atgoto;

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </LPICS_Pgm>

// <MAKE_Pgm>
async function JSB_TCL_MAKE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Clearfirst, Q, Ans, Iname, Itemi, X;

    if (Not(isAdmin())) return Stop('You are not an administrator');

    var Ignorefilenotfound = true;
    var Dftallitems = false;
    var Help = [undefined, 'MAKE \<TableName\> \<ITEMNAMES\> {(options)}'];

    // ;; $include __shell

    activeProcess.At_Prompt = '';
    var Errors = [undefined,];
    Dftallitems = Dftallitems; // Prevent not assigned warning

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

        var Rniname = '';;
    } else {
        if ((!Tablename || Tablename == '?') && CBool(Help)) Errors = Help; else Errors[Errors.length] = activeProcess.At_Errors;
    }

    var Inames = [undefined,];

    while (true) {
        Rniname = readNext(odbActiveSelectList).itemid;
        if (Rniname); else break
        if (Not(Rniname)) break;
        Inames[Inames.length] = Rniname;
    }

    Clearfirst = InStr1(1, LCase(_Options), 'c');

    if (Not(Fname)) Fname = 'tmp';

    if (Not(Clearfirst)) {
        if (LCase(Fname) == 'tmp') Q = '*Yes,No'; else Q = 'Yes,*No';
        Ans = await JSB_BF_MSGBOX('Clear ' + Fname + ' first?', CStr(Q));
        if (isEmpty(Ans) || Ans == Chr(27)) return Stop();
        if (Ans == 'Yes') Clearfirst = true;
    }

    if (await JSB_ODB_OPEN('', Fname, F_File, function (_F_File) { F_File = _F_File })); else return Stop(activeProcess.At_Errors);
    if (CBool(Clearfirst)) { if (await JSB_ODB_CLEARFILE(F_File)); else return Stop(activeProcess.At_Errors); }

    Itemi = LBound(Inames) - 1;
    for (Iname of iterateOver(Inames)) {
        Itemi++;
        if (Not(Clearfirst)) {
            if (await JSB_ODB_READ(X, F_File, CStr(Iname), function (_X) { X = _X })) continue;
        }
        if (await JSB_ODB_WRITE(CStr(Iname), F_File, CStr(Iname))); else return Stop(activeProcess.At_Errors);
    }

    if (CBool(Errors)) Println(MonoSpace(Join(Errors, crlf)));
    return;
}
// </MAKE_Pgm>

// <META_Pgm>
async function JSB_TCL_META_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S, Opts, Reverse, Forceallownulls, Promptforname, Csvitem;
    var Jsonitem, F, Tablenames, Fmeta, Id, Fsrc, Itemname, Ds;
    var Schemadefs, Ans, Col, Csvdata, Tablename, Tablei, Columndefs;
    var Sqlhandle;

    // Generate meta structure from all records (stored in jsb_metadefs) - uses function dbTableSchema(TableName)
    // tcl> Meta tablename

    // Generate meta structure from a single CSV record (stored in jsb_metadefs) - uses function dbTableSchema(TableName)
    // tcl> Meta tablename itemname (C

    // Generate a database from the given structure: 
    // tcl> Meta tablename ... (R

    // Generate 
    S = Field(activeProcess.At_Sentence, ' (', 1);
    Opts = UCase(Field(activeProcess.At_Sentence, ' (', 2));
    Reverse = InStr1(1, Opts, 'R');
    Forceallownulls = InStr1(1, Opts, 'N');
    Promptforname = InStr1(1, Opts, 'P');
    Csvitem = InStr1(1, Opts, 'C');
    Jsonitem = InStr1(1, Opts, 'J');

    F = dropLeft(CStr(S), ' ');
    if (Not(isAdmin())) if (await JSB_BF_ISRESTRICTEDFILE(CStr(F))) return Stop(activeProcess.At_Errors);
    Tablenames = Split(F, ' ');
    Fmeta = await JSB_BF_FHANDLE('', 'jsb_metadefs', true);
    if (Not(Tablenames)) {
        if (Not(Csvitem) && Not(Jsonitem)) {

            while (true) {
                Id = readNext(odbActiveSelectList).itemid;
                if (CBool(Id)); else Id = ' '
                if (Not(Id != ' ')) break;
                Tablenames[Tablenames.length] = LTrim(RTrim(Id));
            }
        }

        if (Not(Tablenames)) {
            Println('Meta TableName');
            Println('   will use all items in table to generate a definition');
            Println();
            Println('Meta TableName ItemName (C');
            Println('   will use all rows in the csv array ItemName to generate a definition');
            Println();
            Println('Meta TableName (R');
            Println('   will previous TableName definition to generate a SQL table');
            return Stop();
        }
    }

    if (CBool(Jsonitem)) {
        // build a json dataset from the csv
        Fsrc = await JSB_BF_FHANDLE(CStr(Tablenames[LBound(Tablenames)]));
        Itemname = Tablenames[2];
        if (Not(Itemname)) return Stop('An ItemName is required');

        if (await JSB_ODB_READJSON(Ds, Fsrc, CStr(Itemname), function (_Ds) { Ds = _Ds })); else return Stop(activeProcess.At_Errors);
        Schemadefs = await JSB_BF_ANALYSEJSON(Ds, 'primaryKey', false);

        Ans = '';
        for (Col of iterateOver(Schemadefs)) {
            if (Col.Type == 'String') {
                if (Ans != 'Yes All') Ans = await JSB_BF_MSGBOX(CStr(Col.name) + ' has a length of ' + CStr(Col.maxlength) + '.  Would you like to set it to 255?', 'Yes,No,Yes All,No All');
                if (Ans == 'No All') break;
                if (Ans == 'Yes All' || Ans == 'Yes') Col.maxlength = 255;
            }
        }

        Println(anchorEdit('jsb_metadefs', CStr(Itemname), '!'));
        if (await JSB_ODB_WRITEJSON(Schemadefs, Fmeta, CStr(Itemname))); else return Stop(activeProcess.At_Errors);
    } else if (CBool(Csvitem)) {
        // build a json dataset from the csv
        Fsrc = await JSB_BF_FHANDLE(CStr(Tablenames[LBound(Tablenames)]));
        Itemname = Tablenames[2];
        if (Not(Itemname)) return Stop('An ItemName is required');

        if (await JSB_ODB_READ(Csvdata, Fsrc, CStr(Itemname), function (_Csvdata) { Csvdata = _Csvdata })); else return Stop(activeProcess.At_Errors);

        Ds = await JSB_TCL_CONVERTCSV2JSON(Csvdata, 200, function (_Csvdata) { Csvdata = _Csvdata });

        Schemadefs = await JSB_BF_ANALYSEJSON(Ds, 'primaryKey', false);

        Ans = '';
        for (Col of iterateOver(Schemadefs)) {
            if (Col.Type == 'String') {
                if (Ans != 'Yes All') Ans = await JSB_BF_MSGBOX(CStr(Col.name) + ' has a length of ' + CStr(Col.maxlength) + '.  Would you like to set it to 255?', 'Yes,No,Yes All,No All');
                if (Ans == 'No All') break;
                if (Ans == 'Yes All' || Ans == 'Yes') Col.maxlength = 255;
            }
        }

        Println(anchorEdit('jsb_metadefs', CStr(Itemname), '!'));
        if (await JSB_ODB_WRITEJSON(Schemadefs, Fmeta, CStr(Itemname))); else return Stop(activeProcess.At_Errors);
    } else {
        // Process whole tables
        Tablei = LBound(Tablenames) - 1;
        for (Tablename of iterateOver(Tablenames)) {
            Tablei++;
            Tablename = Trim(Tablename);
            if (Not(Tablename)) continue;

            if (CBool(Reverse)) {
                // Use the meta in jsb_metadefs to build a table
                if (!At_Session.Item('ATTACHEDDATABASE')) return Stop('Please attach to a SQL database first');
                if (await JSB_ODB_READJSON(Columndefs, Fmeta, CStr(Tablename), function (_Columndefs) { Columndefs = _Columndefs })); else return Stop('I wasn\'t able to find your jsb_metadef for this table');

                if (CBool(Promptforname)) Tablename = await JSB_BF_INPUTBOX('Create File', 'Create file from metadefs ' + CStr(Tablename), CStr(Tablename), undefined, undefined);
                if (isEmpty(Tablename) || Tablename == Chr(27)) return Stop();

                if (await JSB_ODB_OPEN('', CStr(Tablename), Sqlhandle, function (_Sqlhandle) { Sqlhandle = _Sqlhandle })) {
                    if (JSB_BF_TYPEOFFILE(Sqlhandle) == 'ado') {
                        if (await JSB_BF_MSGBOX(JSB_BF_TYPEOFFILE(Sqlhandle) + ' ' + CStr(Tablename) + ' already exists, delete first?', 'Yes,*No') == 'Yes') {
                            if (await JSB_ODB_DELETEFILE(Sqlhandle)); else Println(activeProcess.At_Errors);
                        }
                    }
                }

                if (await JSB_BF_DBCREATETABLE(CStr(Tablename), CStr(Columndefs), +Forceallownulls)) Println(Tablename, ' created.'); else await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
            } else {
                if (await JSB_ODB_OPEN('', CStr(Tablename), Sqlhandle, function (_Sqlhandle) { Sqlhandle = _Sqlhandle })); else return Stop(Tablename, ' not found ');

                Schemadefs = await JSB_BF_DBTABLESCHEMA(CStr(Tablename));
                if (!Len(Schemadefs)) return Stop(activeProcess.At_Errors);

                Println(anchorEdit('jsb_metadefs', CStr(Tablename), '!'));
                if (await JSB_ODB_WRITEJSON(Schemadefs, Fmeta, CStr(Tablename))); else return Stop(activeProcess.At_Errors);
            }
        }
    }
    return;
}
// </META_Pgm>

// <CONVERTCSV2JSON>
async function JSB_TCL_CONVERTCSV2JSON(ByRef_Csvdata, Limit, setByRefValues) {
    // local variables
    var Csv, Ds, Keys, Line, Csvi, Fieldnames, Datavalues, Newguid;
    var Record, Fieldname, I, Dv, R3;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Csvdata)
        return v
    }
    ByRef_Csvdata = Change(ByRef_Csvdata, '`', Chr(1));
    ByRef_Csvdata = Change(ByRef_Csvdata, '\'', Chr(2));

    Csv = Split(ByRef_Csvdata, am, 4);
    Ds = [undefined,];
    Keys = [undefined,];

    if (Not(Limit)) Limit = UBound(Csv);
    Csvi = LBound(Csv) - 1;
    for (Line of iterateOver(Csv)) {
        Csvi++;
        if (Null0(Csvi) > Null0(Limit)) break;

        if (Null0(Csvi) == 1) {
            Fieldnames = await JSB_TCL_GETCSVFIELDS(Line, function (_Line) { Line = _Line });
        } else {
            Datavalues = await JSB_TCL_GETCSVFIELDS(Line, function (_Line) { Line = _Line });
            Newguid = newGUID();
            Record = { "primaryKey": Newguid };

            I = LBound(Fieldnames) - 1;
            for (Fieldname of iterateOver(Fieldnames)) {
                I++;
                Dv = Datavalues[I];
                if (CBool(Dv)) Record[Fieldname] = Dv; else Record[Fieldname] = undefined;

                R3 = Right(Dv, 3);
                if (R3 == ' am()' || R3 == ' PM' && r83Date(Dv)) {
                    Dv = DateTime(r83Date(Dv));
                    // if field(dv, " ", 2) = "07:00:00" then dv = field(dv, " ", 1)
                    Record[Fieldname] = Dv;;
                } else if (Count(Dv, '-') == 2 && r83Date(Dv)) {
                    Record[Fieldname] = r83Date(r83Date(Dv));;
                } else if (Count(Dv, '/') == 2 && r83Date(Dv)) {
                    Record[Fieldname] = r83Date(r83Date(Dv));;
                } else if (Dv == 'True') {
                    Record[Fieldname] = true;;
                } else if (Dv == 'False') {
                    Record[Fieldname] = false;;
                } else if (CNum(Dv) == Null0(Dv)) {
                    Record[Fieldname] = CNum(Dv);;
                }
            }

            Ds[Ds.length] = Record;
        }
    }
    return exit(Ds);
}
// </CONVERTCSV2JSON>

// <GETCSVFIELDS>
async function JSB_TCL_GETCSVFIELDS(ByRef_Line, setByRefValues) {
    // local variables
    var Fields, Field, Fieldi, F;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Line)
        return v
    }
    if (Right(ByRef_Line, 1) == cr) ByRef_Line = Left(ByRef_Line, Len(ByRef_Line) - 1);

    Fields = Split(ByRef_Line, ',', 4);

    Fieldi = LBound(Fields) - 1;
    for (Field of iterateOver(Fields)) {
        Fieldi++;
        F = Fields[Fieldi];
        if (InStr1(1, F, Chr(1))) {
            F = Change(F, Chr(1), '`');
            Fields[Fieldi] = F;
        }

        if (InStr1(1, F, Chr(2))) {
            F = Change(F, Chr(2), '\'');
            Fields[Fieldi] = F;
        }

        if (InStr1(1, F, '""')) {
            F = Change(F, '""', '"');
            Fields[Fieldi] = F;
        }
    }

    return exit(Fields);
}
// </GETCSVFIELDS>

// <ANALYSEJSON_Pgm>
async function JSB_TCL_ANALYSEJSON_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S, Opts, Forceallownulls, Override, F, Tablenames, Fmeta;
    var Tablename, Tablei, Sqlhandle, Dataset, Pk, Columndefs;
    var C, Ana, Row;

    // Generate a json metadata structure for the given tables

    S = Field(activeProcess.At_Sentence, ' (', 1);
    Opts = UCase(Field(activeProcess.At_Sentence, ' (', 2));
    Forceallownulls = Index1(Opts, 'N', 1);
    Override = Index1(Opts, 'O', 1);

    if (Not(isAdmin())) return Stop('You must be an admin to run this command');

    F = dropLeft(CStr(S), ' ');
    Tablenames = Split(F, ' ');
    Fmeta = await JSB_BF_FHANDLE('', 'jsb_metadefs', true);

    Tablei = LBound(Tablenames) - 1;
    for (Tablename of iterateOver(Tablenames)) {
        Tablei++;
        Tablename = Trim(Tablename);
        if (Not(Tablename)) continue;
        if (await JSB_ODB_OPEN('', CStr(Tablename), Sqlhandle, function (_Sqlhandle) { Sqlhandle = _Sqlhandle })); else return Stop(activeProcess.At_Errors);

        Dataset = await JSB_BF_FSELECT(Tablename, 'ItemID,*', undefined, undefined, function (_Tablename) { Tablename = _Tablename });
        if (!Len(Dataset)) return Stop('No records found to analyse');

        Pk = '';
        if (await JSB_ODB_READJSON(Columndefs, await JSB_BF_FHANDLE('jsb_metadefs'), CStr(Tablename), function (_Columndefs) { Columndefs = _Columndefs })) {
            for (C of iterateOver(Columndefs)) {
                if (CBool(C.primarykey)) {
                    Pk = C.name;
                    break;
                }
            }
        }

        Ana = await JSB_BF_ANALYSEJSON(Dataset, Pk, +Forceallownulls, function (_Pk) { Pk = _Pk });
        Print('[');
        for (Row of iterateOver(Ana)) {
            Row = CStr(Row) + ',';
            Println(Row);
        }
        Println(']');

        if (Not(Override)) {
            if (await JSB_ODB_READJSON(Columndefs, await JSB_BF_FHANDLE('jsb_metadefs'), CStr(Tablename), function (_Columndefs) { Columndefs = _Columndefs })) {
                if (await JSB_BF_MSGBOX('there is already a definition in jsb_metadefs, overwrite it?', 'Yes,No') != 'Yes') return Stop();
            }
        }
        if (await JSB_ODB_WRITEJSON(Ana, await JSB_BF_FHANDLE('jsb_metadefs'), CStr(Tablename))); else return Stop(activeProcess.At_Errors);
        Println(anchorEdit('jsb_metadefs', CStr(Tablename), '!'));
    }
    return;
}
// </ANALYSEJSON_Pgm>

// <MULD_Pgm>
async function JSB_TCL_MULD_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var A, B;

    // Decimal multiply
    A = Field(activeProcess.At_Sentence, ' ', 2);
    B = Field(activeProcess.At_Sentence, ' ', 3);
    if (!isNumber(A) || !isNumber(B)) return Stop();
    Println(+A * +B);
    clearSelect(odbActiveSelectList);

    return;
}
// </MULD_Pgm>

// <MULX_Pgm>
async function JSB_TCL_MULX_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var A, B;

    // Hex multiply
    A = Field(activeProcess.At_Sentence, ' ', 2);
    B = Field(activeProcess.At_Sentence, ' ', 3);
    Println(DTX(XTD(A) * XTD(B)));
    clearSelect(odbActiveSelectList);

    return;
}
// </MULX_Pgm>

// <OFF_Pgm>
async function JSB_TCL_OFF_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Byebye, Rootact, Rootlen, Lurl;

    clearSelect(odbActiveSelectList);
    Byebye = paramVar('returnurl');
    if (Not(Byebye)) {
        Rootact = LCase(JsbRootAct());
        Rootlen = Len(Rootact);

        Byebye = Field(LogoutUrl(), '?', 1);
        if (Left(Byebye, Rootlen) == Rootact) Byebye = Mid1(Byebye, +Rootlen + 1);

        Lurl = Field(JSB_BF_URL(), '?', 1);
        if (Left(Lurl, Rootlen) == Rootact) Lurl = Mid1(Lurl, +Rootlen + 1);
        if (Null0(Byebye) == Null0(Lurl)) Byebye = ''; else Byebye = LogoutUrl();
    }

    await SignOut();
    if (Not(Byebye)) At_Server.End();
    if (!InStr1(1, Byebye, '//')) Byebye = JsbRootAct() + CStr(Byebye);
    return At_Response.redirect(Byebye);
}
// </OFF_Pgm>

// <POST_Pgm>
async function JSB_TCL_POST_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Adr, Body, I, Url, Doc, Header, Result;

    if (Not(isAdmin())) return Stop('You are not an administrator');
    Adr = Trim(Field(activeProcess.At_Sentence, '(', 1));
    Body = LCase(Field(activeProcess.At_Sentence, '(', 2));
    I = Index1(Adr, ' ', 1);
    if (Null0(I) == '0') {
        Println('POST http://addr (body');
        return Stop();
    }

    Url = LTrim(Mid1(Adr, I));

    Println(Url);
    Doc = await JSB_BF_GET(CStr(Url), 'POST', Header, Body, '', function (_Header, _Body) { Header = _Header; Body = _Body });

    Header = Change(Header, Chr(10), '');
    Doc = Change(Doc, Chr(10), '');

    Println('=========== Header ==================');
    Println(Change(Field(Header, '\<html', 1), Chr(254), crlf));
    Println('=====================================');
    if (InStr1(1, Doc, Chr(13)) == 0) Doc = Change(Doc, Chr(10), Chr(13));
    if (isEmpty(Doc)) return Stop(activeProcess.At_Errors);

    Println('Length of ', Len(Doc));
    // print doc

    if (Left(Doc, 1) == '{') {
        if (await JSB_BF_MSGBOX('GET', 'Show JSON?', 'Yes,No') != 'Yes') return Stop();
        Result = parseJSON(Doc);
    } else {
        if (await JSB_BF_MSGBOX('GET', 'Show HTML?', 'Yes,No') != 'Yes') return Stop();
        Result = parseXML(Doc);
    }

    return Stop(Result);

    return;
}
// </POST_Pgm>

// <PRIMARYKEYS_Pgm>
async function JSB_TCL_PRIMARYKEYS_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Flist, R, Fname;

    Flist = await JSB_BF_FILELIST();
    R = {};
    for (Fname of iterateOver(Flist)) {
        R.fname = Fname;
        R.primarykey = await JSB_BF_PRIMARYKEYNAME(Fname);
        Println(R.fname, "\t", R.primarykey);
        FlushHTML();
    }
    return;
}
// </PRIMARYKEYS_Pgm>

// <PRINT_Pgm>
async function JSB_TCL_PRINT_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Js, Selecteditemids, Selecteditems, S, X, Rs;

    if (CBool(isAdmin())); else return Stop('You are not an administrator');

    if (CBool(System(11))) {
        Js = parseJSON(System(11));
        Selecteditemids = Js.SelectedItemIDs;
        Selecteditems = Js.SelectedItems;
    }

    S = Field(Mid1(activeProcess.At_Sentence, Index1(activeProcess.At_Sentence, ' ', 1) + 1, 9999), '(!', 1);

    if (await JSB_ODB_WRITE('Program PR' + am + 'PRINT ' + CStr(S), await JSB_BF_FHANDLE('', 'tmp', true), 'pr')); else return Stop(activeProcess.At_Errors);
    await asyncTclExecute('basic tmp pr', _capturedData => X = _capturedData)

    if (CBool(Js)) {
        Rs = { "SelectedItemIDs": Selecteditemids };
        Rs.SelectedItems = Selecteditems;
        Rs.OnlyReturnItemIDs = Js.OnlyReturnItemIDs;

        odbActiveSelectList = formList(Rs);
    }

    if (InStr1(1, X, 'bytes')) await asyncTclExecute('run tmp pr'); else Println(X);
    return;
}
// </PRINT_Pgm>

// <SETCOMP_Pgm>
async function JSB_TCL_SETCOMP_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S, Toname, X;

    if (CBool(isAdmin())); else return Stop('You are not an administrator');

    S = activeProcess.At_Sentence;
    Toname = Field(S, ' ', 2);
    if (Not(Toname)) return Stop('setComp name basic statement');

    S = 'Execute `' + Mid1(S, Index1(S, ' ', 2) + 1, 9999) + '`';

    if (await JSB_ODB_WRITE('Program ' + CStr(Toname) + am + CStr(S), await JSB_BF_FHANDLE('', 'jsb_comps', true), CStr(Toname))); else return Stop(activeProcess.At_Errors);
    await asyncTclExecute('basic jsb_comps ' + CStr(Toname), _capturedData => X = _capturedData)

    Println(html('\<button type=\'button\' class=\'btn btn-primary\' onclick=\'appendKey("' + CStr(Toname) + '" + Chr(13));\'\>' + CStr(Toname) + '\</button\>'));

    if (InStr1(1, X, 'bytes')) await asyncTclExecute('run tmp pr'); else Println(X);

    return;
}
// </SETCOMP_Pgm>

// <PROFILE_Pgm>
async function JSB_TCL_PROFILE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Sent, Cmd, S, X, Whichpgm, Lastsubname, Isdetail, Starttimer;

    if (Not(isAdmin())) return Stop('You are not an administrator');

    if (CBool(System(64)) && !InStr1(1, System(64), '-')) {
        await JSB_TCL_PROFILESTOP_Sub(0, false);
        return Stop();
    }

    Sent = activeProcess.At_Sentence;
    Cmd = Field(Sent, ' ', 2);
    if (Cmd == '?') return Stop('profile tcl_command (\>detailsub');

    S = dropLeft(CStr(Sent), ' ');
    X = System(63);
    At_Session.Item('gets', [undefined,]);

    if (InStr1(1, Sent, '(\>')) {
        Whichpgm = Field(Sent, '(\>', 2);
        if (Not(Whichpgm)) {
            Lastsubname = At_Session.Item('LastDetailSubName');
            Whichpgm = await JSB_BF_INPUTBOX('Sub Name', CStr(Lastsubname), undefined, undefined, undefined, function (_P1) { });
            if (isEmpty(Whichpgm) || Whichpgm == Chr(27)) return Stop();
        }
        At_Session.Item('LastDetailSubName', Whichpgm);
        Isdetail = true;
        X = System('60,' + CStr(Whichpgm));
    } else {
        Isdetail = false;
        X = System(60);
    }

    Starttimer = Timer();
    if (CBool(S)) {
        await asyncTclExecute(S);
        await JSB_TCL_PROFILESTOP_Sub(Starttimer, Isdetail);
    } else {
        Println('Profiling started, press ', await JSB_BF_INPUTBUTTON('profileStop' + Chr(13)), ' to stop');
    }
    return;
}
// </PROFILE_Pgm>

// <PROFILESTOP_Pgm>
async function JSB_TCL_PROFILESTOP_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    if (Not(System(64)) && InStr1(1, System(64), '-') == 0) return Stop('You aren\'t profiling');
    await JSB_TCL_PROFILESTOP_Sub(0, false);
    return;
}
// </PROFILESTOP_Pgm>

// <PROFILESTOP_Sub>
async function JSB_TCL_PROFILESTOP_Sub(Starttime, Isdetail) {
    // local variables
    var X, Sent, Totaltimer, Stats, Mydata, Stat, Newstat, Fname;
    var Iname, Lineno, Q, Path, Myoptions, Metadata, Gets;

    X = System(61);
    Sent = activeProcess.At_Sentence;

    if (CBool(Starttime)) Totaltimer = Timer() - +Starttime;

    Stats = System(62);
    if (Not(Stats)) return Stop('no stats');

    Mydata = [undefined,];
    for (Stat of iterateOver(Split(Stats, am))) {
        Stat = Split(Stat, vm);
        Newstat = {};
        Fname = (Field(Stat(1), '|', 1));
        Iname = (Field(Stat(1), '|', 2));
        Lineno = (Field(Stat(1), '|', 3));
        if (InStr1(1, Iname, '\'')) Q = '"'; else Q = '\'';

        if (CBool(Lineno)) {
            Newstat.lineNo = Lineno;
            Path = JSB_BF_JSBROOTEXECUTETCLCMD('ED ' + CStr(Fname) + ' ' + CStr(Q) + CStr(Iname) + CStr(Q)) + ' (' + CStr(Lineno);
            Newstat.fName = CStr(Fname) + ' ' + CStr(Iname);
            Newstat.iName = Lineno;;
        } else {
            Path = JSB_BF_JSBROOTEXECUTETCLCMD(CStr(Sent)) + ' (\>' + CStr(Iname);
            Newstat.fName = Fname;
            Newstat.iName = Iname;
        }

        Newstat.avg = Stat(2);
        Newstat.Link = Path;
        Newstat.time = Stat(3);
        Newstat.calls = Stat(4);
        Mydata[Mydata.length] = Newstat;
    }

    Myoptions = { "width100percent": true };
    Myoptions.sortname = 'avg';
    Myoptions.sortorder = 'desc';
    if (CBool(Lineno)) Myoptions.caption = CStr(Fname) + ' ' + CStr(Iname);

    Metadata = [undefined,];
    Metadata[Metadata.length] = { "name": 'fName', "index": 'fName', "label": 'Source', "width": 150 };
    if (CBool(Isdetail)) {
        Metadata[Metadata.length] = { "name": 'iName', "index": 'iName', "label": 'Line No', "width": 150 }
    } else {
        Metadata[Metadata.length] = { "name": 'iName', "index": 'iName', "label": 'IName', "width": 150 }
    }
    Metadata[Metadata.length] = { "name": 'avg', "index": 'avg', "label": 'Avg', "width": 80, "datatype": 'integer' };
    Metadata[Metadata.length] = { "name": 'time', "index": 'time', "label": 'Time', "width": 80, "datatype": 'integer' };
    Metadata[Metadata.length] = { "name": 'calls', "index": 'calls', "label": 'Calls', "width": 80, "datatype": 'integer' };
    Metadata[Metadata.length] = { "name": 'Link', "index": 'Link', "label": 'Link', "width": 446, "control": 'url', "sortable": false };

    Println(At(-1), Div('', await JSB_HTML_JQGRID('myID', Mydata, Metadata, Myoptions), { "style": 'height: 400px' }));

    if (CBool(Totaltimer)) Println('Total time ', CNum(dropIfRight(CStr(Totaltimer), '.')) / 1000, ' seconds');

    Gets = JSB_BF_USERVAR('gets');
    if (CBool(Gets)) {
        Println(Join(Gets, crlf));
        JSB_BF_USERVAR('gets', '');
    }
}
// </PROFILESTOP_Sub>

// <PWD_Pgm>
async function JSB_TCL_PWD_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Cd, Cd2, Dno;

    if (await JSB_ODB_ATTACHDB('')); else null;

    Cd = jsbRootDir();
    Cd = Change(Cd, 'file:///', '');
    Cd = Change(Cd, '/', '\\');
    if (Right(Cd, 1) == '\\') Cd = Left(Cd, Len(Cd) - 1);

    Cd2 = System(26);
    Cd2 = Change(Cd2, 'file:///', '');
    Cd2 = Change(Cd2, '/', '\\');
    if (Right(Cd2, 1) == '\\') Cd2 = Left(Cd2, Len(Cd2) - 1);

    // if cd2 <> cd then cd2 = dropifright(cd2, `\`)
    if (Null0(Cd2) == Null0(Cd)) Cd2 = '';

    Dno = false;
    if (System(1) == 'js') if (window.dotNetObj) Dno = true;
    if (CBool(Dno)) {
        Cd = Anchor('file:///' + CStr(Cd), CStr(Cd), { "target": '_blank' });
        if (CBool(Cd2)) {
            Cd2 = Anchor('file:///' + CStr(Cd2), CStr(Cd2), { "target": '_blank' });
        }
    }

    Println(Cd);
    if (CBool(Cd2)) Println(Cd2);

    clearSelect(odbActiveSelectList);
    return;
}
// </PWD_Pgm>

// <RESET_Pgm>
async function JSB_TCL_RESET_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Ans, Flist, Fname;

    if (System(1) == 'aspx') return Stop('No reset is possible from aspx versions');

    if (Not(isAdmin())) return Stop('You are not an administrator');

    if (System(1) == 'js') {
        if (await JSB_BF_MSGBOX('Do you want to reset the jsb_dictionaries?', '*Yes,No') == 'Yes') {
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb_tcl', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb_bf', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb_html', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb_mdl', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb_themes', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb2js', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb_odb', true))); else Alert(CStr(activeProcess.At_Errors));

            if (await asyncDelete(await JSB_BF_FHANDLE('jsb_cache'), 'postloads')); else Alert(CStr(activeProcess.At_Errors));
            window.location.reload();
        }
    }

    if (System(1) == 'gae') {
        if (await JSB_BF_MSGBOX('Do you want to reset the jsb_* System files (if you made any local changes they will be lost)?', 'Yes,*No') == 'Yes') {
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb_tcl', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb_bf', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb_html', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb_mdl', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb_themes', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb2js', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb_examples', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb_docs', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb_demos', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('dict', 'jsb_ctls', true))); else Alert(CStr(activeProcess.At_Errors));

            if (await asyncClearTable(await JSB_BF_FHANDLE('', 'jsb_tcl', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('', 'jsb_bf', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('', 'jsb_html', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('', 'jsb_cache', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('', 'jsb_mdl', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('', 'jsb_themes', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('', 'jsb2js', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('', 'jsb_examples', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('', 'jsb_docs', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('', 'jsb_demos', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('', 'jsb_ctls', true))); else Alert(CStr(activeProcess.At_Errors));

            if (await asyncClearTable(await JSB_BF_FHANDLE('', 'jsb_pagetemplates', true))); else Alert(CStr(activeProcess.At_Errors));
            if (await asyncClearTable(await JSB_BF_FHANDLE('', 'jsb_viewtemplates', true))); else Alert(CStr(activeProcess.At_Errors));
        }

        Print('Do you wish to clear the entire datastore? (Yes, No,Cancel, MD only) ');
        Ans = await asyncInput(''); if (activeProcess.At_Echo) Println(Ans); FlushHTML();
        Ans = LCase(Left(Ans, 1));
        if (Ans == 'c') return Stop();
        if (Ans == 'y') {
            if (await asyncListFiles(_fileList => Flist = _fileList)) {
                for (Fname of iterateOver(Flist)) {

                    while (true) {
                        if (await asyncClearTable('0' + CStr(Fname))) break
                        if (Not(InStr1(1, activeProcess.At_Errors, 'retry:'))) break;
                        FlushHTML()
                    }
                    if (await asyncDeleteTable('0' + CStr(Fname))); else Println(activeProcess.At_Errors);
                    if (Fname != 'jsb_tcl') {
                        if (await asyncDeleteTable('0' + CStr(Fname) + '.dct')); else Println(activeProcess.At_Errors);

                        while (true) {
                            if (await asyncClearTable('0' + CStr(Fname) + '.dct')) break
                            if (Not(InStr1(1, activeProcess.At_Errors, 'retry:'))) break;
                            FlushHTML()
                        }
                    }
                    Println(Fname);
                    FlushHTML();
                }
            }
        }

        await asyncTclExecute('clear-cache');
    }
    return;
}
// </RESET_Pgm>

// <RESETDB_Pgm>
async function JSB_TCL_RESETDB_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    return At_Response.redirect(Field(Field(JSB_BF_URL(), '?', 1), '#', 1) + '#resetdb');

    return;
}
// </RESETDB_Pgm>

// <RUN_Pgm>
async function JSB_TCL_RUN_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S, Fname, Iname, Opts, Fmd, Ofname, Pgm, Frun, Src, A;

    if ((window.me)) me._dontDisplayInStack = 1;
    S = Trim(activeProcess.At_Sentence);
    Fname = Field(S, ' ', 2);
    Iname = Field(S, ' ', 3);
    if (InStr1(1, S, '(')) Opts = Field(S, '(', 2); else Opts = Field(S, '[', 2);
    Opts = UCase(Opts);

    if (UCase(Fname) == 'DICT') {
        Fname = CStr(Fname) + ' ' + CStr(Iname);
        Iname = Field(S, ' ', 4);
    }

    if (await JSB_ODB_OPEN('', 'MD', Fmd, function (_Fmd) { Fmd = _Fmd })); else return Stop(activeProcess.At_Errors);
    Ofname = Fname;
    Fname = await JSB_BF_TRUETABLENAME(CStr(Fname));

    Pgm = CStr(Makesubname(UCase(Fname))) + '_' + CStr(Makesubname(UCase(Iname)));

    if (JSB_BF_EVAL('typeof(' + CStr(Pgm) + ')') == 'undefined') {
        if (await JSB_ODB_OPEN('DICT', CStr(Ofname), Frun, function (_Frun) { Frun = _Frun })) {
            if (await JSB_ODB_READ(Src, Frun, CStr(Iname) + '.js', function (_Src) { Src = _Src })) {
                A = Change(Src, am, Chr(13));
                loadCode(A, undefined);
            }
        } else {
            Frun = undefined;
        }
        if (JSB_BF_EVAL('typeof(' + CStr(Pgm) + ')') == 'undefined') {
            if (CBool(Frun)) {
                Println('Unable to find or load javascript code for ', Pgm);
            } else {
                Println('Unable to open DICT ', Ofname);
            }
        } else {
            if (InStr1(1, Opts, '#') || InStr1(1, Opts, 'D')) singleStepping = 1;
            Pgm = CStr(Makesubname(UCase(Fname))) + '.' + CStr(Makesubname(UCase(Iname))); // CALLBYNAME needs the period in it
            await asyncCallByName(Pgm, me, 0 /*ignore if missing */,);
        }
    } else {
        Pgm = CStr(Makesubname(UCase(Fname))) + '.' + CStr(Makesubname(UCase(Iname)));
        await asyncCallByName(Pgm, me, 0 /*ignore if missing */,);
    }

    return;
}
// </RUN_Pgm>

// <SEARCH_Pgm>
async function JSB_TCL_SEARCH_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var _Isjson, Tokensearch, Casesensitive, R83, Identifierchars;
    var List, Scnt, Icnt, Sstr, P, Ss, R3, Ed, Matches, Iname;
    var Itemi, Item, Nitem, Printhead, Lastlineno, Searchterm;
    var Spos, Si, Foundit, C, Lineno, Sline, I, S;

    // Search a file for a string
    // Replaces a string with a string

    if (Not(isAdmin())) return Stop('You are not an administrator');

    var Ignorefilenotfound = false;
    var Dftallitems = true;
    var Help = [undefined, 'SEARCH FILE ITEMLIST (T: TOKEN SEARCH, C: Case Sensitive)'];

    // Include jsb_tcl __SHELL

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

    if (Not(Inames)) return Stop('No items found in file ', Fname);
    if (Inames[1] == '?' || Index1(_Options, '?', 1)) return Stop(Join(Help, crlf));

    _Isjson = InStr1(1, _Options, 'J');
    Tokensearch = (Index1(_Options, 'T', 1) || Index1(_Options, 'B', 1) || Index1(_Options, 'W', 1));
    Casesensitive = InStr1(1, _Options, 'C');
    R83 = Index1(UCase(_Options), 'R', 1);
    Identifierchars = '0123456789_ABCDEFGHIJKLMNOPQRSTUVWXYZ$@';
    if (CBool(R83)) Identifierchars += '.';

    List = [undefined,];
    Scnt = 0;
    Icnt = 0;
    Sstr = [undefined,];


    while (true) {
        P = 'String to search for (';
        if (CBool(Casesensitive)) {
            P += 'Case sensitive';
        } else {
            P += 'Case ignored - add \' (C\' here to change';
        }

        if (CBool(Tokensearch)) P += ' and Token Boundaries';
        P += '): ';
        activeProcess.At_Prompt = P;
        Ss = await asyncInput(''); if (activeProcess.At_Echo) Println(Ss); FlushHTML();

        if (Not(!isEmpty(Ss))) break;
        if (InStr1(1, Ss, '()') == 0) {
            R3 = UCase(fieldRight(CStr(Ss), ' ('));
            if (Len(R3) < 4) {
                Ss = dropIfRight(CStr(Ss), ' (');
                if (InStr1(1, R3, 'C')) Casesensitive = true;
                if (InStr1(1, R3, 'T')) Tokensearch = true;
                if (InStr1(1, R3, '!')) return Stop();
            }
        }
        Ss = JSB_BF_UNESCAPESTRING(Ss, function (_Ss) { Ss = _Ss });
        if (CBool(Ss)) {
            Scnt = +Scnt + 1;
            if (CBool(Casesensitive)) Sstr[Sstr.length] = Ss; else Sstr[Sstr.length] = LCase(Ss);
        }
    }

    if (Null0(Scnt) == '0') {
        clearSelect(odbActiveSelectList);
        return Stop();
    }

    if (Dictdata) Dictdata += ' ';
    Ed = 'ED';
    Matches = 0;

    Itemi = LBound(Inames) - 1;
    for (Iname of iterateOver(Inames)) {
        Itemi++;
        if (CBool(_Isjson)) {
            if (await JSB_ODB_READJSON(Item, F_File, CStr(Iname), function (_Item) { Item = _Item })); else {
                Errors[Errors.length] = 'Item ' + CStr(Iname) + ' not found.';
                continue;
            }
            Item = CStr(Item, true);
        } else {
            if (await JSB_ODB_READ(Item, F_File, CStr(Iname), function (_Item) { Item = _Item })); else {
                Errors[Errors.length] = 'Item ' + CStr(Iname) + ' not found.';
                continue;
            }
        }

        if (InStr1(1, Item, Chr(13)) || InStr1(1, Item, Chr(10))) {
            Item = Change(Item, Chr(13) + Chr(10), Chr(254));
            Item = Change(Item, Chr(13), Chr(254));
            Item = Change(Item, Chr(10), Chr(254));
        }

        Nitem = Item;
        if (Not(Casesensitive)) Item = LCase(Item);
        Printhead = 1;

        Lastlineno = 0;
        for (Searchterm of iterateOver(Sstr)) {
            Spos = 1;

            while (true) {
                Si = InStr1(Spos, Item, Searchterm);
                if (Not(CBool(Si))) break;
                if (CBool(Tokensearch)) {
                    Foundit = true;
                    if (Null0(Si) > 1) {
                        // Check preceeding character
                        C = UCase(Mid1(Item, +Si - 1, 1));
                        if (Index1(Identifierchars, C, 1)) {
                            if (InStr1(1, Identifierchars, UCase(Left(Searchterm, 1)))) Foundit = false;
                        }
                    }

                    if (CBool(Foundit)) {
                        // Check following character
                        C = UCase(Mid1(Item, +Si + Len(Searchterm), 1));
                        if (Index1(Identifierchars, C, 1) && !isEmpty(C)) {
                            if (InStr1(1, Identifierchars, UCase(Right(Searchterm, 1)))) Foundit = false;
                        }
                    }
                } else {
                    Foundit = true;
                }

                if (CBool(Foundit)) {
                    Spos = +Si + Len(Searchterm);

                    Lineno = DCount(Mid1(Nitem, 1, Si), Chr(254));

                    if (CBool(Printhead)) {
                        Println();
                        Println(bold(CStr(Iname)));
                        List[List.length] = Iname;
                        Printhead = 0;
                        Matches++;
                    }

                    if (Null0(Lastlineno) != Null0(Lineno)) {
                        Print(anchorEdit(Dictdata + Fname, CStr(Iname), CStr(Iname) + ' (' + Right('   ' + CStr(Lineno), 4) + ')', CStr(false), CNum(undefined), +Lineno));
                        Sline = Extract(Nitem, Lineno, 0, 0);

                        I = 0;

                        while (true) {
                            I = InStrI1(1, Sline, Searchterm);
                            if (Not(CBool(I))) break;
                            S = Mid1(Sline, I, Len(Searchterm));
                            Print(Left(Sline, +I - 1), bold(Hilight(CStr(S))));
                            Sline = Mid1(Sline, +I + Len(Searchterm));
                        }

                        Println(Sline);

                        Lastlineno = Lineno;
                        if (System(1) == 'js') FlushHTML();
                    }
                } else {
                    Spos = +Si + 1;
                }
            }
        }
        Icnt++;

    }

    if (CBool(Errors)) Println(MonoSpace(Join(Errors, crlf)));

    if (CBool(Matches)) {
        Println(Matches, ' items had matches (', Icnt, ' items searched)');
        if (await asyncSaveList(List, Tablename)); else return Stop(activeProcess.At_Errors);
        Println('Search list saved to ', await JSB_BF_INPUTBUTTON(Tablename, 'gl ' + Tablename + cr));
    } else {
        Println('No matches found (', Icnt, ' items searched)');
    }
    return;
}
// </SEARCH_Pgm>

// <SELECT_Pgm>
async function JSB_TCL_SELECT_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    await JSB_TCL_SELECT_Sub(activeProcess.At_Sentence, true, function (_At_Sentence, _P2) { activeProcess.At_Sentence = _At_Sentence });
    if (CBool(System(11))) Println('select list actived'); else Println('no items selected');
    return;
}
// </SELECT_Pgm>

// <SSELECT_Pgm>
async function JSB_TCL_SSELECT_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    await JSB_TCL_SELECT_Sub(activeProcess.At_Sentence, true, function (_At_Sentence, _P2) { activeProcess.At_Sentence = _At_Sentence });
    if (CBool(System(11))) Println('select list actived'); else Println('no items selected');
    return;
}
// </SSELECT_Pgm>

// <SELECT_Sub>
async function JSB_TCL_SELECT_Sub(ByRef_Sentence, ByRef_Checkprivilages, setByRefValues) {
    // local variables
    var Top, Columns, Dict, Fname, Filterby, Orderby, _Options;
    var Allitems, F, Headercolumns, Cols, Tfname;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Sentence, ByRef_Checkprivilages)
        return v
    }
    if (!(await JSB_BF_PARSESELECT(CStr(ByRef_Sentence), '', Top, Columns, Dict, Fname, Filterby, Orderby, _Options, Allitems, F, true, false, Headercolumns, function (_Top, _Columns, _Dict, _Fname, _Filterby, _Orderby, __Options, _Allitems, _F, _Headercolumns) { Top = _Top; Columns = _Columns; Dict = _Dict; Fname = _Fname; Filterby = _Filterby; Orderby = _Orderby; _Options = __Options; Allitems = _Allitems; F = _F; Headercolumns = _Headercolumns }))) return Stop(activeProcess.At_Errors);

    if (Len(_Options) && isNumber(_Options)) Cols = CInt(_Options); else Cols = 4;
    Tfname = LCase(await JSB_BF_TRUETABLENAME(CStr(Fname)));

    if (CBool(ByRef_Checkprivilages)) if (await JSB_BF_ISRESTRICTEDFILE(CStr(Tfname))) return Stop(activeProcess.At_Errors);

    if (!isEmpty(Dict)) Dict = CStr(Dict) + ' ';

    if (isEmpty(Filterby) && LCase(Field(ByRef_Sentence, ' ', 1)) == 'sselect') Filterby = ' order by ItemID';
    if (await JSB_ODB_SELECT(LTrim(CStr(Top) + ' ') + Join(Columns, ' '), F, CStr(Filterby) + CStr(Orderby), '')); else return Stop(activeProcess.At_Errors);
    return exit();
}
// </SELECT_Sub>

// <SEQ_Pgm>
async function JSB_TCL_SEQ_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var A, I;

    A = Field(Field(activeProcess.At_Sentence, '(', 1), ' ', 2);
    Print(A, ': ');
    var _ForEndI_1 = Len(A);
    for (I = 1; I <= _ForEndI_1; I++) {
        Print(Seq(Mid1(A, I, 1)), ' ');
    }
    Println();
    clearSelect(odbActiveSelectList);

    return;
}
// </SEQ_Pgm>

// <STX_Pgm>
async function JSB_TCL_STX_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var A;

    A = Field(Field(activeProcess.At_Sentence, '(', 1), ' ', 2);
    Println(STX(A));
    clearSelect(odbActiveSelectList);

    return;
}
// </STX_Pgm>

// <XTS_Pgm>
async function JSB_TCL_XTS_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S;

    // Convert a HEX string to characters

    S = Field(UCase(Trim(activeProcess.At_Sentence)), ' ', 2);
    if (Left(S, 2) == '0X') S = Mid1(S, 3);
    S = XTS(S);
    if (isValidJSon(S)) Println(CJSon(S)); else Println(S);
    clearSelect(odbActiveSelectList);

    return;
}
// </XTS_Pgm>

// <SETFILE_Pgm>
async function JSB_TCL_SETFILE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var _Options, Q, Terms, S, Term, Act, Fname, Mdqname, Pdef;
    var Fmd, Oldpdef, Spot, Cvfile, Cvitemid;

    if (Not(isAdmin())) return Stop('You are not an administrator');

    _Options = LCase(Field(activeProcess.At_Sentence, '(', 2));
    if (InStr1(1, _Options, 'd')) Q = 'qd'; else Q = 'q';

    Terms = Split(Field(activeProcess.At_Sentence, '(', 1), ' ', 4);
    S = [undefined,];
    for (Term of iterateOver(Terms)) {
        Q = Left(Term, 1);
        if (Locate(Q, [undefined, '\'', '"', '`'], 0, 0, 0, "", position => { })) {
            if (Right(Term, 1) == Q) Term = Mid1(Term, 2, Len(Term) - 2);
        }
        Term = Change(Term, '/', '\\');
        S[S.length] = Term;
    }

    Act = S[2];
    Fname = S[3];
    Mdqname = S[4];

    if (Not(Act)) { return Stop('setfile accountName fileName {QName} ({d}'); }

    if (isEmpty(Mdqname)) Mdqname = 'qfile';

    if ((Mid1(Act, 2, 1) == ':' || Left(Act, 1) == '.' || Left(Act, 1) == '\\') && isEmpty(Fname)) Q = 'f'; else Q = 'q';
    Pdef = CStr(Q) + am + CStr(Act) + am + CStr(Fname);

    Fmd = await JSB_BF_FHANDLE('md');
    if (await JSB_ODB_READ(Oldpdef, Fmd, CStr(Mdqname), function (_Oldpdef) { Oldpdef = _Oldpdef })) {
        if (Locate('cv', Oldpdef, 1, 0, 0, "", position => Spot = position)) {
            Cvfile = Extract(Oldpdef, 2, Spot, 0);
            Cvitemid = Extract(Oldpdef, 3, Spot, 0);
            Pdef = CStr(Q) + vm + 'cv' + am + CStr(await JSB_TCL_ACT()) + vm + CStr(Cvfile) + am + CStr(Fname) + vm + CStr(Cvitemid);
        }
    }

    if (await JSB_ODB_WRITE(CStr(Pdef), Fmd, CStr(Mdqname))); else return Stop(activeProcess.At_Errors);
    return Stop(Mdqname, ' written');

    return;
}
// </SETFILE_Pgm>

// <SHOWLOGS_Pgm>
async function JSB_TCL_SHOWLOGS_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Opts, Notthis, Itype, Recentlogs;

    var onError;
    var gotoLabel = "";
    atgoto: while (true) {
        try {
            switch (gotoLabel) {
                case "":
                    if (Not(isAdmin())) return Stop('You must be an admin to run this command');
                    Opts = LTrim(LCase(Field(activeProcess.At_Sentence, ' ', 2)));
                    if (Left(Opts, 2) == '(!') Opts = LTrim(Mid1(Opts, 3));
                    if (Left(Opts, 1) == '(') Opts = LTrim(Mid1(Opts, 2));
                    if (Left(Opts, 1) == '!') {
                        Notthis = '!';
                        Opts = Mid1(Opts, 2);
                    }

                    switch (Opts) {
                        case 'w':
                            Itype = 'Warning';
                            break;

                        case 'e':
                            Itype = 'Error';
                            break;

                        case 'c':
                            Itype = 'Critical';
                            break;

                        default:
                            Itype = 'Information';
                    }

                    // Anything but information?
                    Recentlogs = await JSB_BF_GETLOGS(CStr(Notthis) + CStr(Itype) + ',' + r83Date(Now()), false, CNum(Opts)); // Today's logs
                    if (Count(Recentlogs, '\</tr\>') <= 1) {
                        Recentlogs = await JSB_BF_GETLOGS(CStr(Notthis) + CStr(Itype) + ',' + r83Date(Now() - 1), false, CNum(Opts)); // Today's logs;
                    }
                    if (Count(Recentlogs, '\</tr\>') <= 1) {
                        Recentlogs = await JSB_BF_GETLOGS(r83Date(Now()), false, CNum(Opts)); // Today's logs;
                    }
                    if (Count(Recentlogs, '\</tr\>') <= 1) {
                        Recentlogs = await JSB_BF_GETLOGS(r83Date(Now() - 1), false, CNum(Opts)); // Today's logs;
                    }
                    if (Count(Recentlogs, '\</tr\>') <= 1) {
                        Recentlogs = await JSB_BF_GETLOGS('', false, CNum(Opts)); // Today's logs;
                    }
                    onErrorGoto = "ERR59";
                    Println(At(-1), System(59));

                case "ERR59":

                    Println(crlf, Recentlogs);
                    return;


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
// </SHOWLOGS_Pgm>

// <SIZE_Pgm>
async function JSB_TCL_SIZE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Top, Columns, Dict, Fname, Filterby, Orderby, _Options;
    var Allitems, F, Id, Item, Size, Cnt;

    if (Not(isAdmin())) return Stop('You are not an administrator');
    if (!(await JSB_BF_PARSESELECT(CStr(activeProcess.At_Sentence), '', Top, Columns, Dict, Fname, Filterby, Orderby, _Options, Allitems, F, undefined, undefined, undefined, function (_Top, _Columns, _Dict, _Fname, _Filterby, _Orderby, __Options, _Allitems, _F) { Top = _Top; Columns = _Columns; Dict = _Dict; Fname = _Fname; Filterby = _Filterby; Orderby = _Orderby; _Options = __Options; Allitems = _Allitems; F = _F }))) return Stop();

    if (Not(Allitems) && Not(Filterby) && Not(System(11))) return Stop('Touch TableName\<ItemNames | *\>');
    if (await JSB_ODB_SELECT(LTrim(CStr(Top) + ' ') + Join(Columns, ' '), F, CStr(Filterby) + CStr(Orderby), '')); else return Stop(activeProcess.At_Errors);

    Id = readNext(odbActiveSelectList).itemid;
    if (CBool(Id)); else return Stop('No items found');

    do {
        if (await JSB_ODB_READ(Item, F, CStr(Id), function (_Item) { Item = _Item })) Size += Len(Item);
        Cnt++;
        Id = readNext(odbActiveSelectList).itemid;
        if (CBool(Id)); else return Stop(Size, ' bytes, ', Cnt, ' items.')
    }
    while (true);

    return;
}
// </SIZE_Pgm>

// <SL_Pgm>
async function JSB_TCL_SL_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var S, Fname, Iname, F;

    if (Not(isAdmin())) return Stop('You are not an administrator');
    S = Trim(activeProcess.At_Sentence);
    Fname = Field(S, ' ', 2);
    Iname = Field(S, ' ', 3);

    if (UCase(Fname) == 'DICT') {
        Fname = CStr(Fname) + ' ' + CStr(Iname);
        Iname = Field(S, ' ', 4);
    }
    if (CBool(System(11))) {
        F = await JSB_BF_FHANDLE('', 'JSB_SelectLists', true);
        if (await asyncSaveList(odbActiveSelectList, Fname)) {
            clearSelect(odbActiveSelectList);
            Println('LIST \'', Fname, '\' SAVED');
        } else {
            Println(activeProcess.At_Errors);
            clearSelect(odbActiveSelectList);
        }
    } else {
        Println('THERE IS NO ACTIVE LIST TO SAVE');
    }

    return;
}
// </SL_Pgm>

// <SPEED_Pgm>
async function JSB_TCL_SPEED_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var T, I;

    T = Timer();
    I = 0;

    while (Not(Timer() > +T + 1000)) {
        I = +I + 1;
    }
    Println(I, ' iterations in 1 seconds');

    return;
}
// </SPEED_Pgm>

// <SPLIT_Pgm>
async function JSB_TCL_SPLIT_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Firsttime, Icnt, Fdest, Iname, Itemi, Item, Nitem, Codeblocks;
    var Blockname, Funcname, Paramcnt, Ftype, Src, Xsrc;

    if (Not(isAdmin())) return Stop('You are not an administrator');

    var Ignorefilenotfound = false;
    var Dftallitems = false;
    var Help = [undefined, 'Split srcFile ItemList - splits into code blocks'];

    // Include jsb_tcl __SHELL

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

    if (Inames[1] == '?' || Index1(_Options, '?', 1)) return Stop(Help);
    Firsttime = 0;
    if (Dictdata) Dictdata += ' ';
    Icnt = 0;
    if (await JSB_ODB_OPEN('', 'tmp', Fdest, function (_Fdest) { Fdest = _Fdest })); else return Stop(activeProcess.At_Errors);

    Itemi = LBound(Inames) - 1;
    for (Iname of iterateOver(Inames)) {
        Itemi++;
        Println(Iname);

        if (await JSB_ODB_READ(Item, F_File, CStr(Iname), function (_Item) { Item = _Item })); else {
            Errors[Errors.length] = 'Item ' + CStr(Iname) + ' not found.';
            continue;
        }

        if (InStr1(1, Item, Chr(13)) || InStr1(1, Item, Chr(10))) {
            Item = Change(Item, Chr(13) + Chr(10), Chr(254));
            Item = Change(Item, Chr(13), Chr(254));
            Item = Change(Item, Chr(10), Chr(254));
        }

        Nitem = Item;
        Codeblocks = JSB_BF_SPLITJSBCODE(CStr(Item));

        for (Blockname of iterateOver(Codeblocks)) {
            // BlockName is "funcName#ParamCnt#type"
            Funcname = Field(Blockname, '#', 1);
            Paramcnt = Field(Blockname, '#', 2);
            Ftype = Field(Blockname, '#', 3);
            Src = Codeblocks[Blockname];

            if (Not(Funcname)) {
                Println('??? ', Iname);
                if (await JSB_ODB_WRITE(CStr(Src), Fdest, CStr(Iname))); else return Stop(activeProcess.At_Errors);
            } else {
                if (await JSB_ODB_READ(Xsrc, Fdest, CStr(Funcname), function (_Xsrc) { Xsrc = _Xsrc })) Src += am + CStr(Xsrc);
                if (await JSB_ODB_WRITE(CStr(Src), Fdest, CStr(Funcname))); else return Stop(activeProcess.At_Errors);
            }

            Icnt++;
        }
    }

    if (CBool(Errors)) Println(MonoSpace(Join(Errors, crlf)));

    if (CBool(Firsttime)) return Stop('No items found in file ', Fname);
    return Stop(Icnt, ' functions processed');

    return;
}
// </SPLIT_Pgm>

// <EXECUTESQL>
async function JSB_TCL_EXECUTESQL(ByRef_Sql, setByRefValues) {
    // local variables
    var _Err;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Sql)
        return v
    }
    try {
        var Ans = await asyncRpcRequest('SQL', ByRef_Sql, function (_ByRef_Sql) { });
        return exit(Ans);
    } catch (_Err) {
        await JSB_BF_MSGBOX(CStr(_Err));
    }
    return exit(undefined);
}
// </EXECUTESQL>

// <SQLSELECTCLEANSE>
async function JSB_TCL_SQLSELECTCLEANSE(ByRef_Sql, setByRefValues) {
    // local variables
    var L1, Topbottom, Topbottomarg;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Sql)
        return v
    }
    ByRef_Sql = Field(ByRef_Sql, ';', 1);
    ByRef_Sql = Change(ByRef_Sql, Chr(0), ' ');
    ByRef_Sql = Change(ByRef_Sql, Chr(9), ' ');
    ByRef_Sql = Change(ByRef_Sql, Chr(10), ' ');
    ByRef_Sql = Change(ByRef_Sql, Chr(13), ' ');
    ByRef_Sql = Change(ByRef_Sql, Chr(2), ' ');
    ByRef_Sql = Change(ByRef_Sql, am, ' ');
    ByRef_Sql = LTrim(ByRef_Sql);
    ByRef_Sql = RTrim(ByRef_Sql);

    L1 = LCase(Field(ByRef_Sql, ' ', 1));
    if (InStr1(1, L1, 'select')) ByRef_Sql = LTrim(dropLeft(CStr(ByRef_Sql), ' '));
    if (Right(ByRef_Sql, 2) == '(!') ByRef_Sql = RTrim(Left(ByRef_Sql, Len(ByRef_Sql) - 2));

    if (CBool(ISAdmin())) return exit(ByRef_Sql);

    // MS2Access to SQL
    // sql = replace(replace(replaceI(replaceI(sql, 'dbo.', ''), 'dbo_', ''), 'True', 1), 'False', 0)
    // sql = Trim(replace(replace(replace(sql, '"', "'"), "'*", "'%"), "*'", "%'"))

    // Allow 2nd parenthesis


    while (InStr1(1, ByRef_Sql, '( ')) {
        ByRef_Sql = Change(ByRef_Sql, '( ', '(');
    }

    while (InStr1(1, ByRef_Sql, '((') || InStr1(1, ByRef_Sql, Chr(2) + '(')) {
        ByRef_Sql = Change(ByRef_Sql, '((', '(' + Chr(2));
        ByRef_Sql = Change(ByRef_Sql, Chr(2) + '(', Chr(2) + Chr(2));
    }

    // Allow only these functions

    ByRef_Sql = ' ' + CStr(ByRef_Sql);
    ByRef_Sql = Change(ByRef_Sql, '(', '( ');
    ByRef_Sql = ChangeI(ByRef_Sql, ' cast(', ' cast' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' convert(', ' convert' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' avg(', ' avg' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' max(', ' max' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' count(', ' count' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' grouping(', ' grouping' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' grouping_id(', ' grouping_id' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' sum(', ' sum' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' checksum_agg(', ' checksum_agg' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' rank(', ' rank' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' iff(', ' iff' + Chr(2));

    ByRef_Sql = ChangeI(ByRef_Sql, ' time(', ' time' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' date(', ' date' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' smalldatetime(', ' smalldatetime' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' datetime(', ' datetime' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' datetime2(', ' datetime2' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' datetimeoffset(', ' datetimeoffset' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' getdate(', ' getdate' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' datename(', ' datename' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' datepart(', ' datepart' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' day(', ' day' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' month(', ' month' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' year(', ' year' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' datediff(', ' datediff' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' dateadd(', ' dateadd' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' isdate(', ' isdate' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' abs(', ' abs' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' ceiling(', ' ceiling' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' char(', ' char' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' charindex(', ' charindex' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' concat(', ' concat' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' format(', ' format' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' difference(', ' difference' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' left(', ' left' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' len(', ' len' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' lower(', ' lower' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' rowcount(', ' rowcount' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' row_number(', ' row_number' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' join (', ' join ' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' join(', ' join' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' over (', ' over ' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' over(', ' over' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' on (', ' on ' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' on(', ' on' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' in (', ' in ' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' in(', ' in' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' having(', ' having' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ' having (', ' having ' + Chr(2));

    ByRef_Sql = ChangeI(ByRef_Sql, ', (', ', ' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, ',(', ',' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, '= (', '= ' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, '=(', '=' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, '\< (', '\< ' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, '\<(', '\<' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, '\> (', '\> ' + Chr(2));
    ByRef_Sql = ChangeI(ByRef_Sql, '\>(', '\>' + Chr(2));

    ByRef_Sql = Change(ByRef_Sql, '(', '**');
    ByRef_Sql = Change(ByRef_Sql, Chr(2), '(');
    ByRef_Sql = LTrim(ByRef_Sql);

    Topbottom = LCase(Field(ByRef_Sql, ' ', 1));
    if (Topbottom == 'top' || Topbottom == 'bottom') {
        ByRef_Sql = dropLeft(CStr(ByRef_Sql), ' ');
        Topbottomarg = CNum(Field(ByRef_Sql, ' ', 1));
        ByRef_Sql = dropLeft(CStr(ByRef_Sql), ' ');

        if (Null0(Topbottomarg) < 1 || Null0(Topbottomarg) > 10000) Topbottomarg = 10000;
        ByRef_Sql = CStr(Topbottom) + ' ' + CStr(Topbottomarg) + ' ' + CStr(ByRef_Sql);
    } else {
        ByRef_Sql = 'Top 300 ' + CStr(ByRef_Sql);
    }

    return exit(ByRef_Sql);
}
// </SQLSELECTCLEANSE>

// <SQLSELECT_Pgm>
async function JSB_TCL_SQLSELECT_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Attacheddb, Sql, Use, S, Ss, Dataset, Usermodelcolumns;

    if (Not(ISAdmin())) return Stop('You are not an administrator');

    Attacheddb = At_Session.Item('ATTACHEDDATABASE');
    if (Not(Attacheddb)) { if (await JSB_ODB_ATTACHDB('autoattach')); else null; }

    if (LCase(Left(Sql, 4)) == 'use ') {
        Use = Field(Sql, ';', 1) + ' ';
        Sql = LTrim(dropLeft(CStr(Sql), ';'));
        if (UCase(Left(Sql, 7)) == 'select ') Sql = Mid1(Sql, 8);
    }

    S = activeProcess.At_Sentence;
    if (InStr1(1, S, '(!')) S = dropRight(CStr(S), ' (!');

    if (CBool(ISAdmin())) {
        Sql = 'Select ' + dropLeft(CStr(S), ' ');
    } else {
        Sql = 'Select ' + await JSB_TCL_SQLSELECTCLEANSE(S, function (_S) { S = _S });
    }

    if (await asyncDNOSqlSelect(CStr(Use) + CStr(Sql), _selectList => Ss = _selectList)); else return Stop(activeProcess.At_Errors);
    Dataset = parseJSON(getList(Ss));
    if (Len(Dataset) == 0) return Stop('no items');

    Usermodelcolumns = JSB_HTML_JQGRIDDEFAULTMODEL(Dataset);

    Println(At(-1), await JSB_HTML_JQGRID('myID', Dataset, Usermodelcolumns, {}));
    if (Not(Attacheddb)) { if (await JSB_ODB_ATTACHDB('')); else null; }

    return;
}
// </SQLSELECT_Pgm>

// <STARTGPS_Pgm>
async function JSB_TCL_STARTGPS_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Status, Callbacknumber;

    var permissions = undefined;
    if (Not(window.navigator)) return Stop('No navigator object');
    if (Not(window.navigator.geolocation)) return Stop('No geolocation object');

    if (window.hasCordovaPlugIn('permissions')) {
        permissions = window.cordova.plugins.permissions;
        await new Promise(resolve => permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, function (_Status) { Status = _Status; Callbacknumber = 1; resolve(Callbacknumber) }, function (_Status) { Status = _Status; Callbacknumber = 2; resolve(Callbacknumber) }));
        if (Null0(Callbacknumber) != 1) return Stop('GPS Permission Error');
        if (Not(Status.hasPermission)) return Stop('GPS Position disabled by user');
    } else {
        return Stop('You don\'t have the Cordova plugin permissions');
    }

    window.GPS_Retries = 0;
    window.enableHighAccuracy = true;
    if (window.backgroundGPSrunning) return Stop('Background GPS Running. Use ReadGPS');

    window.backgroundGPSrunning = true;
    window.validGPS = false;
    window.GPS_Time = undefined;

    window.readGPSgeolocation = function (Timeout) {
        window.navigator.geolocation.getCurrentPosition(
            function (onSuccess) {
                window.GPS_latitude = onSuccess.coords.latitude;
                window.GPS_longitude = onSuccess.coords.longitude;
                window.validGPS = true;
                window.GPS_Time = TimeDate();
                window.GPS_Retries = 0;
                window.enableHighAccuracy = true;
                window.gpsCycleTimer = setTimeout(window.readGPSgeolocation, 5 * 1000); // every 5 seconds read again
            },

            function (err) {
                // we timed out...
                window.GPS_Err = err;
                window.GPS_Retries += 1

                if (err.code != 3) { // timeout error
                    window.GPS_Retries = 9999 // never going to happen
                    window.backgroundGPSrunning = false;
                    return
                }

                if (window.GPS_Retries >= 2) window.enableHighAccuracy = false;
                window.readGPSgeolocation(5 * 1000); // attempt to read within 5 seconds
            },

            { maximumAge: 10000, timeout: Timeout, enableHighAccuracy: window.enableHighAccuracy }
        )
    }

    // Do first attempt with a short timeout
    window.readGPSgeolocation(100)

    return Stop('Background GPS Running. Use ReadGPS or StopGPS');
}
// </STARTGPS_Pgm>

// <STOPGPS_Pgm>
async function JSB_TCL_STOPGPS_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    window.clearTimeout(window.gpsCycleTimer);
    return;
}
// </STOPGPS_Pgm>

// <READGPS_Pgm>
async function JSB_TCL_READGPS_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Gpstext, Cnt;

    if (window.validGPS) {
        return Stop(window.GPS_latitude, Chr(176), ' N, ', window.GPS_longitude, Chr(176), ' W');
    }

    if (Null0(window.GPS_Err) == 1) if (Null0(window.GPS_Err) == 1) return Stop('Your GPS is blocked by your browser settings');

    $('\<div id=\'gpswait\' style=\'position: fixed; z-index:999999; width: 100%; height: 100%; background-color: black; color: white; opacity: .5\'\>\<div id=\'gpstext\' style=\'position: fixed;top:45%; left:45%\'\>Waiting for GPS Single\</div\>\</div\>').appendTo('body');
    Gpstext = 'Waiting for GPS Single';

    Cnt = 15;

    do {
        await asyncSleep(1 * 1000); // 1/2 second sleep
        $('#gpstext').text('Waiting for GPS Signal ' + CStr(window.GPS_Retries) + ' ' + StrRpt('.', Cnt));

        Cnt--;
        if (Null0(Cnt) == '0') Cnt = 10;

        if (window.validGPS) {
            $('#gpswait').remove();
            return Stop(window.GPS_latitude, Chr(176), ' N, ', window.GPS_longitude, Chr(176), ' W');
        }
    }
    while (Null0(window.GPS_Retries) < 15);

    $('#gpswait').remove();

    return Stop(window.GPS_Err.message);
}
// </READGPS_Pgm>

// <SUBD_Pgm>
async function JSB_TCL_SUBD_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Args, Arg, Argi, Sum;

    Args = Split(Change(Change(dropLeft(CStr(activeProcess.At_Sentence), ' '), ',', ''), '$', ''), ' ');
    Argi = LBound(Args) - 1;
    for (Arg of iterateOver(Args)) {
        Argi++;
        if (Null0(Argi) == 1) Sum = CNum(Arg); else Sum -= CNum(Arg);
    }
    Println(Sum);
    clearSelect(odbActiveSelectList);
    return;
}
// </SUBD_Pgm>

// <SUB_Pgm>
async function JSB_TCL_SUB_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    return Chain('SUBD ' + dropLeft(CStr(activeProcess.At_Sentence), ' '));
}
// </SUB_Pgm>

// <SUBX_Pgm>
async function JSB_TCL_SUBX_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Args, Sum, Arg;

    Args = Split(Mid1(activeProcess.At_Sentence, Index1(activeProcess.At_Sentence, ' ', 1) + 1), ' ');
    Sum = XTD(Args(1)) * 2;
    for (Arg of iterateOver(Args)) {
        Sum -= XTD(Arg);
    }
    Println(DTX(Sum));
    clearSelect(odbActiveSelectList);
    return;
}
// </SUBX_Pgm>

// <TATTACH_Pgm>
async function JSB_TCL_TATTACH_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Tapefile, Issetup, F, Fdump;

    if (Not(ISAdmin())) return Stop('You are not an administrator');

    Tapefile = Field(Field(activeProcess.At_Sentence, '(', 1), ' ', 2);
    if (isEmpty(Tapefile)) Tapefile = At_Session.Item('TAPEFILE');
    if (isEmpty(Tapefile)) Tapefile = 'tapefile';

    if (LCase(Tapefile) == 'dropbox') {
        if (await JSB_ODB_READ(Issetup, await JSB_BF_FHANDLE('md'), 'dropbox', function (_Issetup) { Issetup = _Issetup })) {
            if (await JSB_ODB_OPEN('', CStr(Tapefile), F, function (_F) { F = _F })); else return Stop('I was unable to open the tapefile on dropbox');
        } else {
            if (await JSB_BF_MSGBOX('Would you like to use DROPBOX for your tape backup?', 'Yes,No') != 'Yes') return Stop();

            if (!(await JSB_ODB_ATTACHDB('dropbox'))) return Stop(activeProcess.At_Errors);
            if (await JSB_ODB_WRITE('q' + am + 'dropbox' + am + 'tapefile', await JSB_BF_FHANDLE('md'), 'dropbox')); else return Stop(activeProcess.At_Errors);
            if (await JSB_ODB_OPEN('', CStr(Tapefile), F, function (_F) { F = _F })); else {
                if (await JSB_ODB_CREATEFILE('tapefile')); else return Stop(activeProcess.At_Errors);
                if (await JSB_ODB_OPEN('', CStr(Tapefile), F, function (_F) { F = _F })); else return Stop('I was unable to create the tapefile on dropbox');
            }
            At_Session.Item('ATTACHEDDATABASE', '');
        }
    } else {
        if (await JSB_ODB_OPEN('', CStr(Tapefile), Fdump, function (_Fdump) { Fdump = _Fdump })); else {
            if (await JSB_BF_MSGBOX('The tapefile ' + CStr(Tapefile) + ' doesn\'t exist, do you want to create it?', 'Yes,*No') != 'Yes') return Stop();
            if (await JSB_ODB_CREATEFILE(CStr(Tapefile))); else return Stop(activeProcess.At_Errors);
        }
    }

    At_Session.Item('TAPEFILE', Tapefile);

    if (isEmpty(Tapefile)) Tapefile = 'no TAPEFILE is';
    return Stop(Tapefile, ' attached');
}
// </TATTACH_Pgm>

// <TDETACH_Pgm>
async function JSB_TCL_TDETACH_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    At_Session.Item('TAPEFILE', '');
    if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('md'), 'dropbox')); else return Stop(activeProcess.At_Errors);
    return Stop('TapeFile detaached');
}
// </TDETACH_Pgm>

// <THEME_Pgm>
async function JSB_TCL_THEME_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Usetheme, _Options, Themescss, Themes, Theme;

    // Themes = ["cerulean", "cosmo", "cyborg", "darkly", "flatly", "journal", "lumen", "paper", "readable", "sandstone", "simplex", "slate", "spacelab", "superhero", "united", "yeti"]
    Usetheme = Trim(Field(Field(activeProcess.At_Sentence, ' (', 1), ' ', 2));
    _Options = LCase(Trim(Field(activeProcess.At_Sentence, ' (', 2)));
    if (_Options == 'n') return Stop(JSB_BF_THEME(''), 'Theme removed');

    if (Not(Usetheme)) {
        if (JSB_BF_USERVAR('currentTheme')) Println(Center(Mark('Current theme is ' + JSB_BF_USERVAR('currentTheme')))); else Println('No current theme is selected');
        Println('Use ', bold('Theme *'), ' or ', bold('Theme Name'), ' to select a new theme.');
        return Stop('Use ', bold('Theme (n'), ' to remove theme');
    }

    Themescss = await JSB_BF_FSELECT('css', 'ItemId Like "bootstrap_]"', undefined, undefined, function (_P1) { });
    Themes = [undefined,];
    for (Theme of iterateOver(Themescss)) {
        Theme = LCase(Theme);
        if (Right(Theme, 4) == '.css') Themes[Themes.length] = dropLeft(Left(Theme, Len(Theme) - 4), 'bootstrap_');
    }

    if (Usetheme == '*') {
        Usetheme = await JSB_BF_CHOSEATHEME();
    } else {
        Usetheme = LCase(Usetheme);
        if (Locate(Field(Usetheme, '_', 1), Themes, 0, 0, 0, "", position => { })); else return Stop('Unable to find theme ', Usetheme);
        Print(JSB_BF_THEME(CStr(Usetheme)));
    }
    return;
}
// </THEME_Pgm>

// <TIME_Pgm>
async function JSB_TCL_TIME_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    Println(r83Time(r83Time()));
    clearSelect(odbActiveSelectList);
    return;
}
// </TIME_Pgm>

// <SERVERTIME_Pgm>
async function JSB_TCL_SERVERTIME_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Restful_Result, Body, R, Cb;

    var Restful_Result;
    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                Body = At_Request.Body;
                Restful_Result = { "time": r83Time(r83Time()) }; gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto;

            case "RESTFUL_SERVEREXIT":
                window.ClearScreen(); R = window.JSON.stringify(Restful_Result); Cb = paramVar('callback');
                if (CBool(Cb)) Print(Cb, '(', R, ')'); else Print(R);

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </SERVERTIME_Pgm>

// <TLOAD_Pgm>
async function JSB_TCL_TLOAD_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var _Options, Usefile, Firstops, Override, Autocreate, Verifyonly;
    var Lowerall, Upperall, Prompt4source, Overwritestring, Autocreatestring;
    var Loadeverything, Asktooverwrite, Schemename, Passwordprotect;
    var Cypher, Tclcommand, Prompt4tapefile, Tapefile, Ftapefile;
    var S, Fname, Ddata, Singleiname, Ss, Flist, Projects, Lastschemename;
    var Tapeitemid, Scheme, Ddatafname, Filelist, Spot;

    if (Not(ISAdmin())) return Stop('You are not an administrator');
    _Options = LCase(dropLeft(CStr(activeProcess.At_Sentence), '('));
    if (InStr1(1, _Options, ')')) _Options = dropRight(CStr(_Options), ')');
    if (InStr1(1, _Options, '[')) _Options = Field(_Options, '[', 1);

    if (Field(Field(activeProcess.At_Sentence, '(', 1), ' ', 2) == '?' || InStr1(1, _Options, '?')) {
        Println('T-Load {TableName or *} {ItemID or *} (options, P{password}, s{Scheme}, F{rom file}) [Source File Name]');
        Println('   options: ', bold('O'), ' - override items without prompting');
        Println('   options: ', bold('T'), ' - prompt for new tapefile');
        Println('   options: ', bold('C'), ' - create files as needed without prompting');
        Println('   options: ', bold('CC'), '- create or clear file as needed without prompting');
        Println('   options: ', bold('V'), ' - verify load only');
        Println('   options: ', bold('P'), ' - prompt for password decoding');
        Println('   options: ', bold('S'), ' - prompt for scheme (project name)');
        Println('   options: ', bold('F'), ' - prompt for the source TableName to use');
        Println('   options: ', bold('X'), ' - when done execute this TCL command');
        Println('   options: ', bold('L'), ' - lower case all names');
        Println('   options: ', bold('U'), ' - upper case all names');
        Println('   options: ', bold('*'), ' - Load everything');
        Println();
        Println('Example: t-load md (oc, s mdtest, p passcode, x basic bp ok (x');
        return Stop();
    }

    Usefile = Field(activeProcess.At_Sentence, '[', 2);
    if (InStr1(1, Usefile, '(')) Usefile = Field(Usefile, '(', 1);
    Usefile = Field(Usefile, ']', 1);
    if (Not(Usefile)) Usefile = LTrim(Field(Field(',' + CStr(_Options), ',f', 2), ',', 1));

    Firstops = Field(_Options, ' ', 1);
    Override = InStr1(1, Firstops, 'o');
    if (InStr1(1, Firstops, 'c')) Autocreate = 1;
    if (InStr1(1, Firstops, 'cc')) Autocreate = 2;
    Verifyonly = InStr1(1, Firstops, 'v');
    Lowerall = InStr1(1, Firstops, 'l');
    Upperall = InStr1(1, Firstops, 'u');
    Prompt4source = InStr1(1, Firstops, 'f');
    Overwritestring = 'OVERWRITE ITEMS';
    Autocreatestring = 'CREATE FILES';
    Loadeverything = InStr1(1, Firstops, '*');
    Asktooverwrite = true;

    _Options = Change(_Options, ', ', ',');
    Schemename = (InStr1(1, Firstops, 's') || InStr1(1, _Options, ',s'));
    if (CBool(Schemename)) Schemename = LTrim(Field(Field(',' + CStr(_Options), ',s', 2), ',', 1));

    Passwordprotect = (InStr1(1, Firstops, 'p') || InStr1(1, _Options, ',p'));
    if (CBool(Passwordprotect)) Cypher = LTrim(Field(Field(',' + CStr(_Options), ',p', 2), ',', 1));

    Tclcommand = (InStr1(1, Firstops, 'x') || InStr1(1, _Options, ',x'));
    if (CBool(Tclcommand)) Tclcommand = LTrim(Field(Field(',' + CStr(_Options), ',x', 2), ',', 1));

    if (CBool(Passwordprotect)) {
        Cypher = LTrim(Field(Field(',' + CStr(_Options), ',p', 2), ',', 1));
        if (Not(Cypher)) { Cypher = await JSB_BF_INPUTBOX('Password Encrypted', 'Enter your cypher', At_Session.Item('Cypher'), undefined, undefined, function (_P1) { }); }
        if (Cypher == Chr(27)) return Stop();
        At_Session.Item('Cypher', Cypher);
    }

    Prompt4tapefile = (InStr1(1, Firstops, 't') || InStr1(1, _Options, ',t'));
    if (CBool(Prompt4tapefile)) Tapefile = LTrim(Field(Field(',' + CStr(_Options), ',t', 2), ',', 1));
    if (CBool(Tapefile)) Prompt4tapefile = false; else Tapefile = At_Session.Item('TAPEFILE');

    if (Not(Prompt4tapefile) && Not(Tapefile)) {
        if (await JSB_ODB_OPEN('', CStr(Tapefile), Ftapefile, function (_Ftapefile) { Ftapefile = _Ftapefile })); else Tapefile = '';
    }

    if (Not(Tapefile) || CBool(Prompt4tapefile)) {
        if (Not(Tapefile)) Tapefile = At_Session.Item('tapeFile');
        if (Not(Tapefile)) Tapefile = 'tapeFile';

        Tapefile = await JSB_BF_INPUTBOX('Tape File Location', 'Enter your tape file name', CStr(Tapefile), undefined, undefined, function (_P1) { });
        if (Tapefile == Chr(27) || isEmpty(Tapefile)) return Stop();

        if (Left(Tapefile, 1) == '(') {
            Tapefile = Mid1(Tapefile, 2);
            if (InStr1(1, Tapefile, ' ')) {
                Usefile = dropLeft(CStr(Tapefile), ' ');
                Tapefile = Field(Tapefile, ' ', 1);
            }
        }

        At_Session.Item('tapeFile', Tapefile);
    }

    if (CBool(Prompt4source) && Not(Usefile)) {
        if (Not(Usefile)) Usefile = At_Session.Item('LASTUSEFILE');
        Usefile = await JSB_BF_INPUTBOX('use source file', 'Source TableName', CStr(Usefile), undefined, undefined, function (_P1) { });
        if (Usefile == Chr(27)) return Stop();
        At_Session.Item('LASTUSEFILE', Usefile);
    }

    S = Trim(Field(Field(activeProcess.At_Sentence, '(', 1), '[', 1));
    Fname = Field(S, ' ', 2);
    if (LCase(Fname) == 'dict' || LCase(Fname) == 'data') {
        Ddata = LCase(Fname);
        Fname = Field(S, ' ', 3);
        Singleiname = Field(S, ' ', 4);
    } else {
        Ddata = 'data';
        Singleiname = Field(S, ' ', 3);
    }
    if (Fname == '*') Fname = '';
    if (Singleiname == '*') Singleiname = '';

    if (await JSB_ODB_OPEN('', CStr(Tapefile), Ftapefile, function (_Ftapefile) { Ftapefile = _Ftapefile })); else return Stop(activeProcess.At_Errors);
    At_Session.Item('TAPEFILE', Tapefile);
    if (await JSB_ODB_SELECTTO(CStr(undefined), Ftapefile, 'ItemID like \'%.1.tdump\'', Ss, function (_Ss) { Ss = _Ss })); else return Stop(activeProcess.At_Errors);
    Flist = getList(Ss);

    if (Not(Schemename)) {
        Projects = [undefined,];
        Lastschemename = At_Session.Item('SCHEMENAME');
        if (Right(Lastschemename, 1) == '.') Lastschemename = Left(Lastschemename, Len(Lastschemename) - 1);

        for (Tapeitemid of iterateOver(Flist)) {
            Scheme = Field(Tapeitemid, '.', 1);
            if (Not(Scheme)) Scheme = '.';
            Ddatafname = Field(Tapeitemid, '.', 2);
            if (LCase(CStr(Ddata) + '_' + CStr(Fname)) == LCase(Ddatafname)) Lastschemename = Scheme;
            if (Locate(Scheme, Projects, 0, 0, 0, "", position => { })); else Projects[Projects.length] = Scheme;
        }

        Projects = Sort(Projects);

        if (Len(Projects) == 1) {
            Schemename = Projects[LBound(Schemename)];
        } else {
            if (Locate(Lastschemename, Projects, 0, 0, 0, "", position => { })); else Lastschemename = '';

            Schemename = await JSB_BF_INPUTCOMBOBOX('Project Scheme', 'Enter your scheme name', CStr(Projects), CStr(Lastschemename));
            if (Schemename == Chr(27)) return Stop();
        }
    }

    if (Right(Schemename, 1) != '.') Schemename += '.';
    At_Session.Item('SCHEMENAME', Schemename);

    if (CBool(Tclcommand)) {
        Tclcommand = LTrim(Field(Field(',' + CStr(_Options), ',x', 2), ',', 1));
        if (Not(Tclcommand)) { Tclcommand = await JSB_BF_INPUTBOX('On Finish', 'Execute TCL command', At_Session.Item('tclCommand'), undefined, undefined, function (_P1) { }); }
        if (Tclcommand == Chr(27)) return Stop();
        At_Session.Item('tclCommand', Tclcommand);
    }

    if (isEmpty(Fname)) {
        Filelist = [undefined,];
        for (Tapeitemid of iterateOver(Flist)) {
            if (Left(Tapeitemid, Len(Schemename)) == Schemename) {
                Tapeitemid = Mid1(Tapeitemid, Len(Schemename) + 1);
                Tapeitemid = Change(Tapeitemid, '.1.tdump', '');
                Tapeitemid = Change(Tapeitemid, 'data_', '');
                Filelist[Filelist.length] = Tapeitemid;
            }
        }
        if (Not(Filelist)) return Stop('There are no items in your tapefile');

        clearSelect(odbActiveSelectList);
        if (Not(Loadeverything)) {
            Filelist[Filelist.length] = Autocreatestring;
            Filelist[Filelist.length] = Overwritestring;
            Filelist = await JSB_BF_INPUTMULTISELECT('T-LOAD', 'Select files to t-load', CStr(Filelist), CStr([undefined,]), '80%', 'auto', '220px');

            if (Locate(Overwritestring, Filelist, 0, 0, 0, "", position => Spot = position)) {
                Override = true;
                Filelist = Delete(Filelist, Spot, 0, 0);
            }
            if (Locate(Autocreatestring, Filelist, 0, 0, 0, "", position => Spot = position)) {
                if (Not(Autocreate)) Autocreate = 1;
                Filelist = Delete(Filelist, Spot, 0, 0);
            }
            if (isEmpty(Filelist) || Filelist == Chr(27)) return Stop();
            Filelist = Split(Filelist, am);
        }

        for (Fname of iterateOver(Filelist)) {
            Ddata = '';
            Usefile = '';
            if (Left(Fname, 5) == 'dict_') {
                Ddata = 'dict';
                Fname = Mid1(Fname, 6);
            }
            if (Not(await JSB_TCL_TLOAD_SINGLEFILE(Ftapefile, Usefile, Schemename, Ddata, Fname, Autocreate, Asktooverwrite, Override, '', +Verifyonly, Cypher, +Lowerall, +Upperall))) return Stop(activeProcess.At_Errors);
        };
    } else {
        if (Not(await JSB_TCL_TLOAD_SINGLEFILE(Ftapefile, Usefile, Schemename, Ddata, Fname, Autocreate, Asktooverwrite, Override, Singleiname, +Verifyonly, Cypher, +Lowerall, +Upperall))) return Stop(activeProcess.At_Errors);
    }

    if (CBool(Tclcommand)) return At_Response.Redirect(JSB_BF_JSBROOTEXECUTETCLCMD(CStr(Tclcommand))); else return Stop('Done');
    return;
}
// </TLOAD_Pgm>

// <TLOAD_SINGLEFILE>
async function JSB_TCL_TLOAD_SINGLEFILE(Ftapefile, Usefile, Schemename, Ddata, Fname, Autocreate, Asktooverwrite, Override, Singleiname, Verifyonly, Cypher, Lowerall, Upperall) {
    // local variables
    var Readtapename, Mdhold, Ftmp, Programfile, Dat, Items, Item;
    var Difs, Cnt, Notcnt, Dumpi, Tapename, Header, Itemi, I, Id;
    var Encoded, X, Difcnt, Q, Writeit, Ans;

    var onError;
    var gotoLabel = "";
    atgoto: while (true) {
        try {
            switch (gotoLabel) {
                case "":
                    if (Lowerall) Fname = LCase(Fname);
                    if (Upperall) Fname = UCase(Fname);

                    if (isEmpty(Usefile)) Usefile = Fname;
                    if (isEmpty(Ddata)) Ddata = 'data';
                    if (Right(Schemename, 1) != '.') Schemename = CStr(Schemename) + '.';

                    if (Left(Usefile, Len(Schemename)) == Schemename) {
                        Readtapename = Usefile;
                    } else if (Left(Usefile, 5) == 'data_' || Left(Usefile, 5) == 'dict_') {
                        Readtapename = CStr(Schemename) + CStr(Usefile);
                    } else {
                        Readtapename = CStr(Schemename) + CStr(Ddata) + '_' + CStr(Usefile);
                    }

                    Mdhold = '';

                    if (Ddata == 'data') {
                        if (await JSB_ODB_READ(Mdhold, await JSB_BF_FHANDLE('md'), CStr(Fname), function (_Mdhold) { Mdhold = _Mdhold })) {
                            if (Extract(LCase(Mdhold), 1, 0, 0) == 'ql') { if (await JSB_ODB_DELETEITEM(await JSB_BF_FHANDLE('md'), CStr(Fname))); else Mdhold = ''; }
                        }
                    }

                    if (await JSB_ODB_OPEN(CStr(Ddata), CStr(Fname), Ftmp, function (_Ftmp) { Ftmp = _Ftmp })) {
                        if (Null0(Autocreate) == 2) { if (await JSB_ODB_CLEARFILE(Ftmp)); else return Stop(activeProcess.At_Errors); }
                    } else {
                        if (Not(Autocreate)) {
                            if (await JSB_BF_MSGBOX(CStr(Ddata) + ' ' + CStr(Fname) + ' does not exist. Create it?', '*Yes,No') != 'Yes') return true;
                        }

                        // Attempt to put programs in the normal file system
                        if (System(1) == 'js' && Ddata != 'dict') {
                            Programfile = false;
                            if (await JSB_ODB_READ(Dat, Ftapefile, CStr(Readtapename) + '.1.tdump', function (_Dat) { Dat = _Dat })) {
                                Items = Split(Dat, Chr(254) + '#');
                                Item = Items[2];
                                Item = Delete(Item, 1, 0, 0);
                                Item = am + Trim(LCase(XTS(Item)));
                                Programfile = (InStr1(1, Item, am + ' program ') || InStr1(1, Item, am + ' sub ') || InStr1(1, Item, am + ' subroutine ') || InStr1(1, Item, am + ' function ') || InStr1(1, Item, am + ' func '));
                                Programfile = (CBool(Programfile) || InStr1(1, Item, am + 'program ') || InStr1(1, Item, am + 'sub ') || InStr1(1, Item, am + 'subroutine ') || InStr1(1, Item, am + 'function ') || InStr1(1, Item, am + 'func '));
                            }

                            // Place in real file system if appropriate
                            if (CBool(Programfile)) Programfile = (isHTA() || CBool(ISPhoneGap()));
                            if (CBool(Programfile)) {
                                if (await JSB_ODB_CREATEFILE('./' + CStr(Fname))); else return false;
                            } else {
                                if (await JSB_ODB_CREATEFILE(CStr(Fname))); else return false;
                            }
                        } else {
                            if (await JSB_ODB_CREATEFILE(CStr(Fname))); else return false;
                        }

                        if (System(1) == 'js') { if (await JSB_ODB_CREATEFILE('DICT ' + CStr(Fname))); else return false; }
                        if (await JSB_ODB_OPEN(CStr(Ddata), CStr(Fname), Ftmp, function (_Ftmp) { Ftmp = _Ftmp })); else return false;
                    }

                    Difs = [undefined,];
                    Cnt = 0;
                    Notcnt = 0;

                    Dumpi = 1;
                case "_topOfFor_116":
                    if (Dumpi <= 99999) null; else { gotoLabel = "_exitFor_116"; continue atgoto }
                    Tapename = CStr(Readtapename) + '.' + CStr(Dumpi) + '.tdump';
                    if (await JSB_ODB_READ(Dat, Ftapefile, CStr(Tapename), function (_Dat) { Dat = _Dat })); else {
                        if (CBool(Mdhold)) { if (await JSB_ODB_WRITE(CStr(Mdhold), await JSB_BF_FHANDLE('md'), CStr(Fname))); else return Stop(activeProcess.At_Errors); }
                        activeProcess.At_Errors = 'I was unable to read \'' + CStr(Tapename) + '\' from your tapefile \'' + CStr(Usefile) + '\'';
                        return Null0(Dumpi) > 1;
                    }

                    Items = Split(Dat, Chr(254) + '#');
                    Header = Items[1];
                    Header = Extract(Header, 1, 0, 0);
                    if (!InStr1(1, Header, 'BACKUP')) return Stop('Backup file currupt - incorrect header: ', Header);

                    var _ForEndI_87 = UBound(Items);
                    Itemi = 2;
                case "_topOfFor_113":
                    if (Itemi <= _ForEndI_87) null; else { gotoLabel = "_exitFor_113"; continue atgoto }
                    Item = Items[Itemi];
                    I = InStr1(1, Item, am);
                    Id = Left(Item, +I - 1);
                    Encoded = Left(Id, 2) == '::';
                    if (CBool(Encoded)) Id = Mid1(Id, 3);

                    if (isEmpty(Singleiname) || Singleiname == LCase(Id)) null; else { gotoLabel = "_EndIf_89"; continue atgoto }
                    Item = Mid1(Item, +I + 1);
                    Item = XTS(Item);
                    if (CBool(Encoded)) {
                        if (Not(Cypher)) {
                            Cypher = await JSB_BF_INPUTBOX('Password Encrypted', 'Enter your cypher', undefined, undefined, undefined, function (_P1) { });
                            if (Not(Cypher) || Cypher == Chr(27)) return Stop();
                        }
                        Item = aesDecrypt(Item, Cypher);
                    }

                    if (Verifyonly) null; else { gotoLabel = "_Else_93"; continue atgoto }
                    if (await JSB_ODB_READ(X, Ftmp, CStr(Id), function (_X) { X = _X })) {
                        Cnt = +Cnt + 1;
                        if (Null0(X) != Null0(Item)) {
                            Difcnt = +Difcnt + 1;
                            if (InStr1(1, Id, '\'')) Q = '"'; else Q = '\'';
                            Println(anchorEdit(CStr(Ddata) + ' ' + CStr(Fname), CStr(Id)), ' different');;
                        } else {
                            Cnt = +Cnt + 1;
                        }
                    } else {
                        Println(Id, ' missing');
                        Difcnt = +Difcnt + 1;
                    }
                    gotoLabel = "_EndIf_93"; continue atgoto;
                case "_Else_93":

                    Writeit = true;
                    if (Not(Override)) {
                        if (await JSB_ODB_READ(X, Ftmp, CStr(Id), function (_X) { X = _X })) {
                            if (CBool(Asktooverwrite)) {
                                Ans = await JSB_BF_MSGBOX('Overwrite', CStr(Id) + ' exists on file, overwrite?', 'Yes,*No,Yes-All,No-All,Cancel');
                                if (Ans == 'Cancel' || isEmpty(Ans)) return Stop();
                                if (Ans == 'No' || Ans == 'No-All') {
                                    Notcnt = +Notcnt + 1;
                                    Writeit = false;
                                }
                                if (Ans == 'No-All') Asktooverwrite = false;
                                if (Ans == 'Yes-All') Override = true;
                            } else {
                                Notcnt = +Notcnt + 1;
                                Writeit = false;
                            }
                        }
                    }

                    if (CBool(Writeit)) null; else { gotoLabel = "_EndIf_104"; continue atgoto }
                    if (Lowerall) Id = LCase(Id);
                    if (Upperall) Id = UCase(Id);

                    if (Left(Item, 1) == '{' && Right(Item, 1) == '}') null; else { gotoLabel = "_Else_107"; continue atgoto }
                    onErrorGoto = "JTRYAGAIN";
                    if (true) null; else { gotoLabel = "_Else_108"; continue atgoto }
                    X = parseJSON(Item);
                    gotoLabel = "_EndIf_108"; continue atgoto;
                case "_Else_108":


                case "JTRYAGAIN":

                    onErrorGoto = "SIMPLEWRITE";
                    X = Change(Item, am, crlf); // Need to not do this inside of strings
                    X = parseJSON(Item);
                case "_EndIf_108":

                    onErrorGoto = null;

                    if (CBool(X['_ItemContent_'])) {
                        if (await JSB_ODB_WRITE(CStr(X['_ItemContent_']), Ftmp, CStr(Id))); else return Stop('NO WRITE OF ', Id);
                    } else {
                        if (await JSB_ODB_WRITEJSON(X, Ftmp, CStr(Id))); else return Stop('NO WRITEJSON OF ', Id, crlf, X);
                    }
                    gotoLabel = "_EndIf_107"; continue atgoto;
                case "_Else_107":


                case "SIMPLEWRITE":

                    onErrorGoto = null;
                    if (await JSB_ODB_WRITE(CStr(Item), Ftmp, CStr(Id))); else return Stop('NO WRITE OF ', Id);
                case "_EndIf_107":

                    Cnt = +Cnt + 1;
                case "_EndIf_104":

                case "_EndIf_93":

                case "_EndIf_89":

                case "_continueFor_113":
                    Itemi++;
                    gotoLabel = "_topOfFor_113"; continue atgoto;
                case "_exitFor_113":


                    if (Verifyonly) {
                        Println(Ddata, ' ', Usefile, '.', Dumpi, ' (Same: ', Cnt, ' - Different:', Difcnt, ')');
                    } else if (CBool(Notcnt)) {
                        Println(Ddata, ' ', Usefile, '.', Dumpi, ' (Loaded: ', Cnt, ' - Not Loaded:', Notcnt, ')');
                    } else {
                        Println(Ddata, ' ', Usefile, '.', Dumpi, ' (Loaded: ', Cnt, ' records)');
                    }
                    FlushHTML();
                case "_continueFor_116":
                    Dumpi++;
                    gotoLabel = "_topOfFor_116"; continue atgoto;
                case "_exitFor_116":


                    if (CBool(Mdhold)) { if (await JSB_ODB_WRITE(CStr(Mdhold), await JSB_BF_FHANDLE('md'), CStr(Fname))); else return Stop(activeProcess.At_Errors); }

                    return true;



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
// </TLOAD_SINGLEFILE>

// <TOUCH_Pgm>
async function JSB_TCL_TOUCH_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Top, Columns, Dict, Fname, Filterby, Orderby, _Options;
    var Allitems, F, Id, Tcnt, Quiet, Cnt, Xx;

    if (Not(ISAdmin())) return Stop('You are not an administrator');

    if (!(await JSB_BF_PARSESELECT(CStr(activeProcess.At_Sentence), '', Top, Columns, Dict, Fname, Filterby, Orderby, _Options, Allitems, F, undefined, undefined, undefined, function (_Top, _Columns, _Dict, _Fname, _Filterby, _Orderby, __Options, _Allitems, _F) { Top = _Top; Columns = _Columns; Dict = _Dict; Fname = _Fname; Filterby = _Filterby; Orderby = _Orderby; _Options = __Options; Allitems = _Allitems; F = _F }))) return Stop();

    if (Not(Allitems) && Not(Filterby) && Not(System(11))) return Stop('Touch TableName\<ItemNames | *\>');

    if (await JSB_ODB_SELECT(LTrim(CStr(Top) + ' ') + Join(Columns, ' '), F, CStr(Filterby) + CStr(Orderby), '')); else return Stop(activeProcess.At_Errors);

    Id = readNext(odbActiveSelectList).itemid;
    if (CBool(Id)); else return Stop();

    Tcnt = 0;
    Quiet = InStr1(1, _Options, 'I');

    for (Cnt = 1; (Cnt <= 100000) && !isEmpty(Id); Cnt++) {
        if (await JSB_ODB_READ(Xx, F, CStr(Id), function (_Xx) { Xx = _Xx })) {
            if (await JSB_ODB_DELETEITEM(F, CStr(Id))); else await JSB_BF_MSGBOX(CStr(activeProcess.At_Errors));
            if (await JSB_ODB_WRITE(CStr(Xx), F, CStr(Id))); else return Stop(activeProcess.At_Errors);
            Tcnt++;
        } else {
            Println(Id, ' not on file');
        }
        Id = readNext(odbActiveSelectList).itemid;
        if (CBool(Id)); else break;
    }
    if (Null0(Tcnt) > 1) Println(Tcnt, ' items touched');
    if (Null0(Tcnt) == 1) Println('One item touched');
    if (Not(Tcnt)) Println('No items touched');
    return;
}
// </TOUCH_Pgm>

// <UNDELETE_Pgm>
async function JSB_TCL_UNDELETE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Top, Columns, Dict, Fname, Filterby, Orderby, _Options;
    var Allitems, F, Id, Cnt;

    if (Not(ISAdmin())) return Stop('You are not an administrator');

    if (!(await JSB_BF_PARSESELECT(CStr(activeProcess.At_Sentence), '', Top, Columns, Dict, Fname, Filterby, Orderby, _Options, Allitems, F, undefined, undefined, undefined, function (_Top, _Columns, _Dict, _Fname, _Filterby, _Orderby, __Options, _Allitems, _F) { Top = _Top; Columns = _Columns; Dict = _Dict; Fname = _Fname; Filterby = _Filterby; Orderby = _Orderby; _Options = __Options; Allitems = _Allitems; F = _F }))) return Stop();
    if (Not(Allitems) && Not(Filterby) && Not(System(11))) return Stop('Touch UnDelete TrashCan \<ItemNames | *\>');
    if (await JSB_ODB_SELECT(LTrim(CStr(Top) + ' ') + Join(Columns, ' '), F, CStr(Filterby) + CStr(Orderby), '')); else return Stop(activeProcess.At_Errors);

    Id = readNext(odbActiveSelectList).itemid;
    if (CBool(Id)); else return Stop('Please select something!');

    for (Cnt = 1; (Cnt <= 100000) && !isEmpty(Id); Cnt++) {
        await JSB_BF_UNTRASHIT(CStr(Fname), CStr(Id));
        Println(anchorEdit(CStr(Fname), CStr(Id)));
        Id = readNext(odbActiveSelectList).itemid;
        if (CBool(Id)); else break;
    }

    return;
}
// </UNDELETE_Pgm>

// <URL_Pgm>
async function JSB_TCL_URL_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    Println(Anchor(JSB_BF_URL(), JSB_BF_URL()));

    return;
}
// </URL_Pgm>

// <VIEW_Pgm>
async function JSB_TCL_VIEW_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Picextensions, Iname, Itemi, Item, Cmds, R4, Editor, Pic64encoded;
    var I, J, Newitem, Line, Linei, Btn, Ta, Errcnt, Msg, Ans;
    var Xmsg, P, Lineno;

    var Ignorefilenotfound = false;
    var Dftallitems = false;
    var Help = [undefined, 'View TableName \<Itemnames\> {(options)}'];

    // Include jsb_tcl __SHELL

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

    Picextensions = Split('gif,png,bmp,ico,tif,pdf,jpg', ',');
    Itemi = LBound(Inames) - 1;
    for (Iname of iterateOver(Inames)) {
        Itemi++;
        var Ext = FieldRight(UCase(Iname), '.');
        var Hdoc = (Ext == 'HTM' || Ext == 'HTML');

        if (await JSB_BF_ISRESTRICTEDFILE(Tablename) && System(1) != 'js') return Stop(JSB_BF_URL());

        if (await JSB_ODB_READ(Item, F_File, CStr(Iname), function (_Item) { Item = _Item })); else {
            if (Len(activeProcess.At_Errors)) Errors[Errors.length] = activeProcess.At_Errors; else Errors[Errors.length] = 'Item ' + CStr(Iname) + ' not found.';
            continue;
        }


        while (true) {
            Cmds = JSB_HTML_SUBMITBTN('btn', 'EXIT');

            R4 = FieldRight(LCase(Iname), '.');
            if (Locate(R4, Picextensions, 0, 0, 0, "", position => { })) {
                if (Left(Item, 5) == 'data:') {
                    Editor = IMAGE(CStr(Item));
                } else {
                    Pic64encoded = aesEncrypt(Item, 64);
                    Editor = IMAGE('data:image/jpeg;base64,' + CStr(Pic64encoded));
                }

                Print(At(-1), Editor, Cmds);
            } else {
                Item = Change(Item, crlf, am);
                Item = Change(Item, Chr(13), am);
                Item = Change(Item, Chr(10), am);
                Item = Change(Item, Chr(226) + Chr(128) + Chr(152), '\'');
                Item = Change(Item, Chr(226) + Chr(128) + Chr(153), '\'');
                Item = Change(Item, am, Chr(10));
                Item = Change(Item, Chr(160), Chr(10));

                if (Hdoc) {
                    I = InStr1(1, Item, '* Category:');
                    J = InStr1(I, Item, '\<');
                    Item = Mid1(Item, J);

                    while (Left(Item, 4) == '\<br\>') {
                        Item = Mid1(Item, 5);
                    }

                    Print(At(-1), html('\<div style="width:100%; background: white; color:black; height:100%;"\>'), JSB_HTML_ROWS2('40px', html('\<div style="width:100%; background: lightgray; height:100%; overflow: hidden;"\>') + Center(CStr(Cmds) + ' You are viewing ' + Fname + ' ' + CStr(Iname)) + html('\</div\>'), '%', html('\<br\>' + CStr(Item))), html('\</div\>'));;
                } else {
                    if (InStr1(1, LCase(Mid1(Item, 1, 1000)), 'program')) {
                        Cmds = CStr(Cmds) + JSB_HTML_SUBMITBTN('btn', 'RUN') + JSB_HTML_SUBMITBTN('btn', 'DEBUG');
                        if (CBool(ISAdmin())) Cmds = CStr(Cmds) + JSB_HTML_SUBMITBTN('btn', 'COMPILE');
                    }

                    Newitem = [undefined,];
                    Item = Split(Item, Chr(10));
                    Linei = LBound(Item) - 1;
                    for (Line of iterateOver(Item)) {
                        Linei++;
                        Newitem[Newitem.length] = CStr(Linei) + ' ' + CStr(Line);
                    }

                    Editor = JSB_HTML_PRETTYPRINT(Join(Newitem, Chr(10)));
                    if (CBool(ISAdmin())) Cmds = CStr(Cmds) + JSB_HTML_SUBMITBTN('btn', 'EDIT');
                    Print(At(-1), JSB_HTML_ROWS2('50px', html('\<div style="width:100%; background: lightgray; height:100%; overflow: hidden;"\>') + Center(CStr(Cmds) + ' You are viewing ' + Fname + ' ' + CStr(Iname)) + html('\</div\>'), '%', html(CStr(Editor))));
                }
            }

            await At_Server.asyncPause(me);

            Btn = formVar('btn');
            Ta = formVar('TA');

            Print(At(-1));

            var dblBreak22 = false;
            switch (Btn) {
                case 'EXIT':
                    { dblBreak22 = true; break };

                    break;

                case 'RUN':
                    await asyncTclExecute(Iname);
                    break;

                case 'DEBUG':
                    await asyncTclExecute(CStr(Iname) + ' (!');
                    break;

                case 'COMPILE':
                    if (Right(UCase(Iname), 4) == '.HTM' || Right(UCase(Iname), 5) == '.HTML' || UCase(Fname) == 'HTM') {
                        Errcnt = await JSB_TCL_EXTRACTEXAMPLES(Iname, Item, undefined, function (_Item) { Item = _Item });
                        if (Null0(Errcnt) == '0') {
                            if (await JSB_ODB_WRITE(CStr(Item), F_File, CStr(Iname))); else { Msg = activeProcess.At_Errors; Ans = await JSB_BF_MSGBOX('Error', CStr(Msg), '*OK'); }
                        }
                    } else {
                        Print(At(-1));
                        await asyncTclExecute('BASIC ' + Fname + ' ' + CStr(Iname), _capturedData => Xmsg = _capturedData)
                        P = InStr1(1, Xmsg, '^');
                        Errcnt = 1;
                        if (CBool(P)) {
                            Lineno = DCount(Mid1(Xmsg, 1, P), am);
                            Msg = Extract(Xmsg, +Lineno - 1, 0, 0) + crlf + Extract(Xmsg, Lineno, 0, 0);
                        } else {
                            Errcnt = 0;
                        }

                        if (Btn == 'CompileX' && Null0(Errcnt) == '0') { Print(At(-1), 'SUCCESSFUL Compile!'); return; }
                    }

                    break;

                case 'EDIT':
                    await asyncTclExecute('ED ' + Fname + ' \'' + CStr(Iname) + '\'');
                    break;

                case 'EDITN':
                    await asyncTclExecute('ED ' + Fname + ' \'' + CStr(Iname) + '\' (N');
            }
            if (dblBreak22) break;

            await asyncSleep(2 * 1000);
        }
    }

    if (CBool(Errors)) Println(MonoSpace(Join(Errors, crlf)));

    if (hasTclParent() || hasParentProcess()) {
        Println(JSB_HTML_SCRIPT('if (parent.refreshData) parent.refreshData();'));
        return Stop();
    }

    if (CBool(paramVar('fromPage'))) return At_Response.Redirect(paramVar('fromPage'));
    if (Len(Errors)) await JSB_BF_MSGBOX(Change(activeProcess.At_Errors, am, crlf));
    return;
}
// </VIEW_Pgm>

// <WHAT_Pgm>
async function JSB_TCL_WHAT_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    Println(BrowserType());

    return;
}
// </WHAT_Pgm>

// <WHICH_Pgm>
async function JSB_TCL_WHICH_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    Println(System(1));
    clearSelect(odbActiveSelectList);

    return;
}
// </WHICH_Pgm>

// <WHOIS_Pgm>
async function JSB_TCL_WHOIS_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    Println(await JSB_BF_WHOIS(Field(Trim(activeProcess.At_Sentence), ' ', 2)));
    return;
}
// </WHOIS_Pgm>

// <WHEREIS_Pgm>
async function JSB_TCL_WHEREIS_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Arg, Cat, Spot, Ed;

    Arg = Field(Trim(activeProcess.At_Sentence), ' ', 2);
    if (Count(Arg, '.') == 3 && isNumber(Field(Arg, '.', 1))) return Stop(await JSB_BF_WHEREIS(CStr(Arg)));
    if (await JSB_ODB_READ(Cat, await JSB_BF_FHANDLE('md'), CStr(Arg), function (_Cat) { Cat = _Cat })) {
        if (Locate('cv', Cat, 1, 0, 0, "", position => Spot = position)) {
            Ed = Extract(Cat, 4, Spot, 0);
            if (CBool(Ed)) return Stop(anchorEdit(Field(Ed, ' ', 2), Field(Ed, ' ', 3), '!', '', +'', CNum(Field(Ed, '(', 2))));
        }
    }

    return;
}
// </WHEREIS_Pgm>

// <WINDOWCLOSE_Pgm>
async function JSB_TCL_WINDOWCLOSE_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    Print(JSB_HTML_SCRIPT('window.close()'));
    At_Server.End();

    return;
}
// </WINDOWCLOSE_Pgm>

// <WIP_Pgm>
async function JSB_TCL_WIP_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Fname, _Options, Fl, Wip, Id, I;

    Fname = Trim(LCase(Field(Field(activeProcess.At_Sentence, ' ', 2), ' (', 1)));
    _Options = LCase(Trim(Field(activeProcess.At_Sentence, ' (', 2)));
    Fl = await JSB_BF_FHANDLE('', 'JSB_SelectLists', true);

    if (Fname == 'n' || Fname == 'e') { _Options = Fname; Fname = ''; }

    if (CBool(Fname)) {
        if (await JSB_ODB_WRITE(CStr(Fname), Fl, 'wip_fname')); else return Stop(activeProcess.At_Errors);
        if (await JSB_ODB_READ(Wip, Fl, CStr(Fname), function (_Wip) { Wip = _Wip })); else return Stop(activeProcess.At_Errors);
        if (await JSB_ODB_WRITE(CStr(Wip), Fl, 'wip')); else return Stop(activeProcess.At_Errors);
    } else {
        if (await JSB_ODB_READ(Fname, Fl, 'wip_fname', function (_Fname) { Fname = _Fname })); else return Stop('wip savelist-name (options: e)dit or n)ext');
        if (await JSB_ODB_READ(Wip, Fl, 'wip', function (_Wip) { Wip = _Wip })); else return Stop('Your list is empty');
    }

    Wip = Split(Wip, am);
    if (_Options == 'n') {
        Wip = Delete(Wip, 1, 0, 0);

        if (Not(Wip)) {
            if (await JSB_ODB_DELETEITEM(Fl, 'wip')); else return Stop(activeProcess.At_Errors);
            return Stop('Your are finished!');
        }
        if (await JSB_ODB_WRITE(CStr(Wip), Fl, 'wip')); else return Stop(activeProcess.At_Errors);
    }

    if (_Options == 'e') {
        Id = Wip[1];
        return Chain('ed ' + CStr(Fname) + ' ' + CStr(Id));
    } else {

        I = LBound(Wip) - 1;
        for (Id of iterateOver(Wip)) {
            I++;
            if (Null0(I) > 10) break;
            Println(anchorEdit(CStr(Fname), CStr(Id), CStr(Id)));
        }
        if (Null0(I) == 10) Println('...');
        Println(anchorEdit('JSB_SelectLists', 'WIP', CStr(Len(Wip)) + ' items in JSB_SelectLists WIP'));
    }
    return;
}
// </WIP_Pgm>

// <XOR_Pgm>
async function JSB_TCL_XOR_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var A, B;

    A = XTD(Field(activeProcess.At_Sentence, ' ', 2));
    B = XTD(Field(activeProcess.At_Sentence, ' ', 3));
    Println(DTX((+A ^ +B)));
    clearSelect(odbActiveSelectList);

    return;
}
// </XOR_Pgm>

// <XTD_Pgm>
async function JSB_TCL_XTD_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var I, A;

    // Convert a HEX number to decimal

    I = 2;

    while (true) {
        A = Field(activeProcess.At_Sentence, ' ', I);
        if (Not(CBool(A))) break;
        Print(XTD(A), ' ');
        I++;
    }

    Println();
    clearSelect(odbActiveSelectList);

    return;
}
// </XTD_Pgm>

// <TDUMP_Pgm>
async function JSB_TCL_TDUMP_Pgm() {  // PROGRAM
    Commons_JSB_TCL = {};
    Equates_JSB_TCL = {};

    // local variables
    var Marker, _Options, Firstops, Prompt4tapefile, Append, Schemename;
    var Passwordprotect, Cypher, Tapefile, Filelist, Fname, Fhandle;
    var Top, Columns, Ddata, Filterby, Orderby, Allitems, Fdump;
    var Ans, Cnt, Csize, Tsize, Dumpi, Dump, Dat, Id, Item;

    var gotoLabel = "";
    atgoto: while (true) {
        switch (gotoLabel) {
            case "":
                if (Not(ISAdmin())) return Stop('You are not an administrator');

                Marker = crlf + '#EOF#' + crlf;
                _Options = UCase(dropLeft(CStr(activeProcess.At_Sentence), '('));
                if (InStr1(1, _Options, ')')) _Options = dropRight(CStr(_Options), ')');

                if (!Field(Field(activeProcess.At_Sentence, '(', 1), ' ', 2)) {
                    Println('T-Dump TableName ItemSelection (options, P{password}, s{Scheme})');
                    Println('   options: ', bold('T'), ' - prompt for new tapefile');
                    Println('   options: ', bold('A'), ' - append to tapefle');
                    Println('   options: ', bold('P'), ' - prompt for password');
                    Println('   options: ', bold('S'), ' - prompt for scheme (project name)');
                    Println('Example: t-dump md wh] (s mdtest, p passcode)');
                    return Stop();
                }

                Firstops = Field(_Options, ' ', 1);
                Prompt4tapefile = InStr1(1, Firstops, 'T');
                Append = InStr1(1, Firstops, 'A');
                Schemename = (InStr1(1, Firstops, 'S') || InStr1(1, _Options, ',S'));
                Passwordprotect = (InStr1(1, Firstops, 'P') || InStr1(1, _Options, ',P'));

                _Options = Change(_Options, ', ', ',');
                if (CBool(Passwordprotect)) {
                    Cypher = LTrim(Field(Field(',' + CStr(_Options), ',P', 2), ',', 1));
                    if (Not(Cypher)) { Cypher = await JSB_BF_INPUTBOX('Password Encrypted', 'Enter your cypher', At_Session.Item('Cypher'), undefined, undefined, function (_P1) { }); }
                    if (Not(Cypher) || Cypher == Chr(27)) return Stop();
                    At_Session.Item('Cypher', Cypher);
                }

                if (CBool(Schemename)) {
                    Schemename = LTrim(Field(Field(',' + CStr(_Options), ',S', 2), ',', 1));
                    if (Not(Schemename)) { Schemename = await JSB_BF_INPUTBOX('Project Scheme', 'Enter your scheme name', At_Session.Item('schemeName'), undefined, undefined, function (_P1) { }); }
                    if (Not(Schemename) || Schemename == Chr(27)) return Stop();
                    At_Session.Item('schemeName', Schemename);
                } else {
                    Schemename = '';
                }
                Schemename += '.';

                if (Not(Prompt4tapefile)) Tapefile = At_Session.Item('TAPEFILE');

                if (!Field(Field(activeProcess.At_Sentence, '(', 1), ' ', 2)) null; else { gotoLabel = "_EndIf_11"; continue atgoto }
                if (await JSB_ODB_LISTFILES(Filelist, function (_Filelist) { Filelist = _Filelist })); else return Stop(activeProcess.At_Errors);
                Filelist = LCase(Filelist);
                Filelist = am + CStr(Filelist) + am;
                Filelist = ChangeI(Filelist, am + 'jsb_users' + am, am);
                Filelist = ChangeI(Filelist, am + 'jsb_config' + am, am);
                Filelist = ChangeI(Filelist, am + 'system' + am, am);
                Filelist = ChangeI(Filelist, am + 'jsb_dictionaries' + am, am);
                Filelist = ChangeI(Filelist, am + 'jsb_selectlists' + am, am);
                Filelist = ChangeI(Filelist, am + 'rest' + am, am);
                Filelist = ChangeI(Filelist, am + 'rests' + am, am);
                Filelist = ChangeI(Filelist, am + 'jsb_errmsg' + am, am);
                Filelist = ChangeI(Filelist, am + 'tapefile' + am, am);
                Filelist = ChangeI(Filelist, am + 'md' + am, am);
                Filelist = ChangeI(Filelist, am + 'tmp' + am, am);
                Filelist = Mid1(Filelist, 2);
                Filelist = Left(Filelist, Len(Filelist) - 1);

                Filelist = await JSB_BF_INPUTMULTISELECT('T-DUMP', 'Select files to t-dump', CStr(Filelist), CStr([undefined,]), '80%', 'auto', '220px');
                if (isEmpty(Filelist) || Filelist == Chr(27)) return Stop();
                Filelist = Split(Filelist, am);

                var FNAME_LastI17 = UBound(Filelist); var Fname_Idx = LBound(Filelist);
            case "_topOfFor_18":
                if (Fname_Idx <= FNAME_LastI17) null; else { gotoLabel = "_exitFor_18"; continue atgoto }
                Fname = Extract(Filelist, Fname_Idx, 0, 0);
                if (await JSB_ODB_OPEN('', CStr(Fname), Fhandle, function (_Fhandle) { Fhandle = _Fhandle })) null; else { gotoLabel = "_EndIf_14"; continue atgoto }
                Fname = await JSB_BF_TRUETABLENAME(CStr(Fname));
                if (await JSB_ODB_SELECT('', Fhandle, '', '')); else return Stop(activeProcess.At_Errors);
                Gosub(me, "TDUMPIT", "_afterGosub_16"); continue atgoto;
            case "_afterGosub_16":

            case "_EndIf_14":

            case "_continueFor_18":
                Fname_Idx++;
                gotoLabel = "_topOfFor_18"; continue atgoto;
            case "_exitFor_18":

                return Stop();
            case "_EndIf_11":


                if (!(await JSB_BF_PARSESELECT(CStr(activeProcess.At_Sentence), '', Top, Columns, Ddata, Fname, Filterby, Orderby, _Options, Allitems, Fhandle, undefined, undefined, undefined, function (_Top, _Columns, _Ddata, _Fname, _Filterby, _Orderby, __Options, _Allitems, _Fhandle) { Top = _Top; Columns = _Columns; Ddata = _Ddata; Fname = _Fname; Filterby = _Filterby; Orderby = _Orderby; _Options = __Options; Allitems = _Allitems; Fhandle = _Fhandle }))) return Stop();

                if (await JSB_ODB_SELECT(LTrim(CStr(Top) + ' ') + Join(Columns, ' '), Fhandle, CStr(Filterby) + CStr(Orderby), '')); else return Stop(activeProcess.At_Errors);

                Fname = await JSB_BF_TRUETABLENAME(CStr(Fname));
                Gosub(me, "TDUMPIT", "_afterGosub_21"); continue atgoto;
            case "_afterGosub_21":

                return Stop();


            case "TDUMPIT":

                if (Not(Tapefile) || CBool(Prompt4tapefile)) {
                    if (Not(Tapefile)) Tapefile = 'tapefile';
                    Tapefile = await JSB_BF_INPUTBOX('Tape File Location', 'Enter your tape file name', CStr(Tapefile), undefined, undefined, function (_P1) { });
                    if (Not(Tapefile) == Chr(27)) return Stop();

                    if (isEmpty(Tapefile)) Tapefile = 'tapeFile';
                    if (Left(Tapefile, 1) == '(') Tapefile = Mid1(Tapefile, 2);
                }

                if (await JSB_ODB_OPEN('', CStr(Tapefile), Fdump, function (_Fdump) { Fdump = _Fdump })); else {
                    Ans = await JSB_BF_MSGBOX('Tape File \'' + CStr(Tapefile) + '\' does not exist, create it?', 'Yes,*Exit');
                    if (Ans != 'Yes') return Stop();
                    Tapefile = await JSB_BF_FHANDLE('', Tapefile, true);
                }

                At_Session.Item('TAPEFILE', Tapefile);

                if (isEmpty(Ddata)) Ddata = 'data';
                Cnt = 0;
                Csize = 0;
                Tsize = 0;
                Dumpi = 1;
                Dump = [undefined, CStr(Ddata) + ' ' + CStr(Fname) + ' BACKUP [' + CStr(Fhandle) + ']' + am];

                if (CBool(Append)) {

                    do {
                        if (await JSB_ODB_READ(Dat, Fdump, CStr(Schemename) + CStr(Ddata) + '_' + CStr(Fname) + '.' + CStr(Dumpi) + '.tdump', function (_Dat) { Dat = _Dat })); else break;
                        Dumpi++;
                    }
                    while (true);

                    if (Null0(Dumpi) > 1) {
                        Dump = Split(Dat, am + '#');
                        Dumpi--;
                    }
                }


                do {
                    Id = readNext(odbActiveSelectList).itemid;
                    if (CBool(Id)); else break;
                    if (await JSB_ODB_READ(Item, Fhandle, CStr(Id), function (_Item) { Item = _Item })) {
                        if (CBool(Passwordprotect)) { Item = aesEncrypt(Item, Cypher); Id = '::' + CStr(Id); }
                        if (CBool(Item)) Item = STX(Item);
                        Dump[Dump.length] = CStr(Id) + am + CStr(Item);
                        Csize += Len(Item);
                        Tsize += Len(Item);
                        Cnt = +Cnt + 1;

                        if (Null0(Csize) > 512000) {
                            Dat = Join(Dump, am + '#');
                            if (Null0(Dumpi) == 1) Print(Schemename, Ddata, '_', Fname, '.', Dumpi, '.tdump'); else Print('.');
                            FlushHTML();
                            if (await JSB_ODB_WRITE(CStr(Dat), Fdump, CStr(Schemename) + CStr(Ddata) + '_' + CStr(Fname) + '.' + CStr(Dumpi) + '.tdump')); else return Stop(activeProcess.At_Errors);
                            Dumpi++;
                            Dump = [undefined, CStr(Ddata) + ' ' + CStr(Fname) + ' BACKUP' + am];
                            Csize = 0;
                        }
                    } else {
                        Println('Unable to read ', Id, ' from ', Fname, ' ', activeProcess.At_Errors);
                    }
                }
                while (CBool(Id));

                Dat = Join(Dump, am + '#');
                if (await JSB_ODB_WRITE(CStr(Dat), Fdump, CStr(Schemename) + CStr(Ddata) + '_' + CStr(Fname) + '.' + CStr(Dumpi) + '.tdump')); else return Stop(activeProcess.At_Errors);
                if (await JSB_ODB_DELETEITEM(Fdump, CStr(Schemename) + CStr(Ddata) + '_' + CStr(Fname) + '.' + CStr(+Dumpi + 1) + '.tdump')); else null;
                if (Null0(Dumpi) > 1) Println();

                Print('Succesfully ');
                if (CBool(Append)) Print('appended '); else Print('wrote ');
                Println(Tsize, ' bytes, ', Cnt, ' items to ', Schemename, Ddata, '_', Fname, '.', Dumpi, '.tdump');

                Print(anchorEdit(CStr(Tapefile), CStr(Schemename) + CStr(Ddata) + '_' + CStr(Fname) + '.1.tdump'));
                Println(Chr(28), '\</a\>', Chr(29));
                FlushHTML();
                if (isGosubRtn(me)) continue atgoto; else return;

                return;


            default:
                throw "we entered an invalid gotoLabel: " + gotoLabel;
        } // switch
    } // agoto while
}
// </TDUMP_Pgm>