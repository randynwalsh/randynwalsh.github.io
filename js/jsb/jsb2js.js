
// <ASSMENT>
async function Assment() {
    // local variables
    var R, Vattr, Avs, Op, Pattr, Gattr, Htk;

    await Include_JSB2JS__Comms(false)

    Commons_JSB2JS.Hardcode = 1;
    R = await Savetk();

    Vattr = await Parsevar(1, 1, Equates_JSB2JS.C_EQUAL, 1);

    // Object Store?
    if (Index1(Equates_JSB2JS.C_EQUAL + Equates_JSB2JS.C_PLUS + Equates_JSB2JS.C_MINUS + Equates_JSB2JS.C_LESS + Equates_JSB2JS.C_FSLASH + Equates_JSB2JS.C_ASTERISK + Equates_JSB2JS.C_PERCENT + Equates_JSB2JS.C_COLON, Commons_JSB2JS.Tkno, 1) == 0) await Objectparse(Vattr);

    // <A, V, SV> ?

    Avs = await Lddynadr();

    if (InStr1(1, '+-*/:%', Commons_JSB2JS.Tkstr)) {
        Op = Commons_JSB2JS.Tkstr;
        await Restoret(R);
        Pattr = await Atom(Vattr.SYM_TYPE, Equates_JSB2JS.C_EQUAL + Equates_JSB2JS.C_PLUS + Equates_JSB2JS.C_MINUS + Equates_JSB2JS.C_LESS + Equates_JSB2JS.C_FSLASH + Equates_JSB2JS.C_ASTERISK + Equates_JSB2JS.C_PERCENT + Equates_JSB2JS.C_COLON);
        if (Null0(Op) == Null0(Commons_JSB2JS.Tkstr)) await Tcv(false); else await Err('error');
    } else {
        Op = '';
    }

    if ((Commons_JSB2JS.Tkno == Equates_JSB2JS.C_PLUS && Op == '+') || (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_MINUS && Op == '-')) {
        Gattr = {};
        Gattr.SYM_C = '1';
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_CNUM;
        await Tcv(false);
    } else {

        // If typing variables, check for A = A: (makes it a string)

        if (Commons_JSB2JS.Outputtypes && Vattr.SYM_TYPE == Equates_JSB2JS.TYPE_VAR) {
            if (!Index1(Vattr.SYM_TYPES, Equates_JSB2JS.TYPE_VSTR, 1)) {
                Htk = await Savetk();
                Gattr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_COLON);
                if (Null0(Gattr.SYM_C) == Null0(Vattr.SYM_C) && Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COLON) {
                    Vattr.SYM_TYPES = CStr(Vattr.SYM_TYPES) + Equates_JSB2JS.TYPE_VSTR;
                    await Writevsym(Vattr.SYM_TYPES, Vattr.SYMNAME, 'SYM_TYPES');
                }
                await Restoret(Htk);
            }
        }

        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_EQUAL) await Tcv(false); else await Err('assignment = expected');

        // expr

        Gattr = await Expr(Vattr.SYM_TYPE, 1, '');
    }

    if (!isEmpty(Avs)) {
        // Makes it a string
        if (!Index1(Vattr.SYM_TYPES, Equates_JSB2JS.TYPE_VSTR, 1)) {
            Vattr.SYM_TYPES = CStr(Vattr.SYM_TYPES) + Equates_JSB2JS.TYPE_VSTR;
            await Writevsym(Vattr.SYM_TYPES, Vattr.SYMNAME, 'SYM_TYPES');
        }
        await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
        Gattr.SYM_C = 'Replace(' + CStr(Vattr.SYM_C) + ',' + CStr(Avs) + ',' + CStr(Gattr.SYM_C) + ')';
    }

    if (Op == ':') {
        await Makestr(Equates_JSB2JS.TYPE_ESTR, Gattr);
        if (Not(Pattr.SYM_ASSIGNED)) Pattr.SYM_C = 'CStr(' + CStr(Pattr.SYM_C) + ')';
        Gattr.SYM_C = CStr(Pattr.SYM_C) + ' + ' + CStr(Gattr.SYM_C);;
    } else if (Op == '+') {
        await Makenum(Equates_JSB2JS.TYPE_ENUM, Gattr);
        Gattr.SYM_C = CStr(Pattr.SYM_C) + ' ' + CStr(Op) + ' ' + CStr(Gattr.SYM_C);;
    } else if (Op == '-' && InStr1(1, Gattr.SYM_C, '+') == 0 && InStr1(1, Gattr.SYM_C, '-') == 0) {
        await Makenum(Equates_JSB2JS.TYPE_ENUM, Gattr);
        Gattr.SYM_C = CStr(Pattr.SYM_C) + ' ' + CStr(Op) + ' ' + CStr(Gattr.SYM_C);;
    } else if (CBool(Op)) {
        await Makenum(Equates_JSB2JS.TYPE_ENUM, Gattr);
        Gattr.SYM_C = CStr(Pattr.SYM_C) + ' ' + CStr(Op) + ' (' + CStr(Gattr.SYM_C) + ')';
    }

    await Store(Vattr, Gattr);
    return;

    // ********************************************************************************************************************
    // Vattr = Eattr (Stored in Vattr)

}
// </ASSMENT>

// <STORE>
async function Store(Vattr, Eattr) {
    // local variables
    var Dimarray, Vlen, Dtype, Op, Nlen;

    await Include_JSB2JS__Comms(false)

    if (CBool(Vattr.SYM_ISCONST)) {
        await Err('Variable is CONST, assignment not possible');
    }

    Dimarray = (CBool(Vattr.SYM_INDEX1) || CBool(Vattr.SYM_INDEX2));
    if (CBool(Dimarray)) {
        await Err('MATSTORE not possible');
        return;
    }

    // Attempt to Fix UBOUND on empty Array.  A[UBound(A)] should return 1 if A is an empty array.  But A[UBound(A) + 1] should return 0

    if (InStr1(1, Vattr.SYM_C, '[UBound(') && InStr1(1, Vattr.SYM_C, ')]')) {
        Vattr.SYM_C = Change(Vattr.SYM_C, '[UBound(', '[UBound1(');
    }

    // Change "At_Application.Item(X) = Y" into "At_Application.Item(X, Y) = Y"
    Vlen = Len(Vattr.SYM_C);
    if ((Left(Vattr.SYM_C, 16) == 'At_Session.Item(' || Left(Vattr.SYM_C, 20) == 'At_Application.Item(') && Right(Vattr.SYM_C, 1) == ')') {
        Vattr.SYM_C = Left(Vattr.SYM_C, +Vlen - 1);
        Commons_JSB2JS.Oc = CStr(Commons_JSB2JS.Oc) + CStr(Vattr.SYM_C) + ', ' + CStr(Eattr.SYM_C) + '); ';
        return;
    }

    // Record types of assignments to variables so we can optionally type them later
    if (Vattr.SYM_TYPE == Equates_JSB2JS.TYPE_VAR) {
        Dtype = Eattr.SYM_TYPE;

        if (Eattr.SYM_TYPE == Equates_JSB2JS.TYPE_VAR) {
            if (Index1(Eattr.SYM_TYPES, Equates_JSB2JS.TYPE_VAR, 1)) {
                Dtype = Equates_JSB2JS.TYPE_VSTR;
            } else if (Index1(Eattr.SYM_TYPES, Equates_JSB2JS.TYPE_VSTR, 1)) {
                Dtype = Equates_JSB2JS.TYPE_VSTR;
            } else {
                Dtype = '';
            }
        }
        if (!isEmpty(Dtype)) {
            if (Index1(Vattr.SYM_TYPES, Dtype, 1) == 0) {
                Vattr.SYM_TYPES = CStr(Vattr.SYM_TYPES) + CStr(Dtype);
                await Writevsym(Vattr.SYM_TYPES, Vattr.SYMNAME, 'SYM_TYPES');
            }
        }
    }

    if (Not(Vattr.SYM_ASSIGNED)) {
        Vattr.SYM_ASSIGNED = true;
        await Writevsym(true, Vattr.SYMNAME, 'SYM_ASSIGNED');
    }

    // Do auto conversion of Eattr to the storage type of Vattr
    await JSB2JS_MAKEAFROMB_Sub(Eattr, Vattr, function (_Eattr, _Vattr) { Eattr = _Eattr; Vattr = _Vattr });

    // Do we have A = A + ... ?  Convert to A += ...
    Op = Mid1(Eattr.SYM_C, +Vlen + 1, 1);
    if (Op == ' ') {
        Op = Mid1(Eattr.SYM_C, +Vlen + 2, 1);
        Nlen = +Vlen + 3;
    } else {
        Nlen = +Vlen + 2;
    }

    if (Vattr.SYM_C == Mid1(Eattr.SYM_C, 1, Vlen) && Index1(' +-', Op, 1) > 1) {
        Eattr.SYM_C = LTrim(Mid1(Eattr.SYM_C, Nlen, 99999));
        if (Eattr.SYM_C == '1') {
            if (Op == '+') {
                Commons_JSB2JS.Oc += CStr(Vattr.SYM_C) + '++; ';
            } else {
                Commons_JSB2JS.Oc += CStr(Vattr.SYM_C) + '--; ';
            }
        } else if (Op == '+') {
            Commons_JSB2JS.Oc += CStr(Vattr.SYM_C) + ' ' + CStr(Op) + '= ' + CStr(Eattr.SYM_C) + '; ';;
        } else if (Index1('&|^', Op, 1)) {
            Commons_JSB2JS.Oc += CStr(Vattr.SYM_C) + ' ' + CStr(Op) + '= (' + CStr(Eattr.SYM_C) + '); ';;
        } else {
            if (Index1(Eattr.SYM_C, '+', 1) || Index1(Eattr.SYM_C, '-', 1)) {
                Commons_JSB2JS.Oc += CStr(Vattr.SYM_C) + ' = ' + CStr(Vattr.SYM_C) + CStr(Op) + CStr(Eattr.SYM_C) + '; ';
            } else {
                Commons_JSB2JS.Oc += CStr(Vattr.SYM_C) + ' ' + CStr(Op) + '= ' + CStr(Eattr.SYM_C) + '; ';
            }
        }

        return;
    }

    if (Index1(Eattr.SYM_C, '&', 1) || Index1(Eattr.SYM_C, '|', 1)) {
        Commons_JSB2JS.Oc += CStr(Vattr.SYM_C) + ' = (' + CStr(Eattr.SYM_C) + '); ';
    } else {
        Commons_JSB2JS.Oc += CStr(Vattr.SYM_C) + ' = ' + CStr(Eattr.SYM_C) + '; ';
    }

    return;

}
// </STORE>

// <DOCALL>
async function Docall(Isfunc, Xtraparams) {
    // local variables
    var Myvalidtypes, Interchangetypeschars, Interchangetypes;
    var Byrefscript, Parami, Mytmpvari, Needcalldef, Prmlist, Nobyrefparams;
    var Isatat, Iscallat, Dblparen, Rtnattr, Ignoremissingcall;
    var Hasliteralfname, Callnameisliteral, Cname, Firsttkstr;
    var Pattr, Xrefsuffix, Cnamesuffix, Fname, Shortcallname, X;
    var Standardjscall, Calldef, Subtkstr, Myfunctype, Needlp;
    var Cbadr, Paramcnt, Paramtypes, Byreffparams, Expectingtype;
    var Holdtk, Lce, Typei, Isbyref, Pname, Prefix, Returntype;
    var Callid;

    // Build and return RTNATTR

    await Include_JSB2JS__Comms(false)

    Myvalidtypes = 'v?cnbs$';

    // v (variant), s (string), b (boolean), n (real/number), i (integer), j (json), a (array), ? (object), l (select-list), f (filehandle), m (mat array)
    Interchangetypeschars = 'vsbnija?lfm';
    Interchangetypes = [undefined, Equates_JSB2JS.TYPE_VAR, Equates_JSB2JS.TYPE_ESTR, Equates_JSB2JS.TYPE_EBOOL, Equates_JSB2JS.TYPE_ENUM, Equates_JSB2JS.TYPE_ENUM, Equates_JSB2JS.TYPE_VAR, Equates_JSB2JS.TYPE_VAR, Equates_JSB2JS.TYPE_VAR, Equates_JSB2JS.TYPE_VAR, Equates_JSB2JS.TYPE_VAR, Equates_JSB2JS.TYPE_VAR];

    Byrefscript = [undefined,];
    Parami = 0;
    Mytmpvari = Commons_JSB2JS.Tmpvari;
    if (Null0(Mytmpvari) == '0') Mytmpvari = '';
    Commons_JSB2JS.Tmpvari++;
    Needcalldef = false;
    Prmlist = '';
    Nobyrefparams = false;
    Isatat = false;
    Iscallat = false;
    Dblparen = false;
    Rtnattr = {};
    Ignoremissingcall = false;
    Hasliteralfname = false;
    Callnameisliteral = false;

    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AT) {
        await Tcv(false); // Skip @
        // If Tkstr = "AM" Or Tkstr = "VM" Or Tkstr = "SVM" Or Tkstr = "CRLF" Or Tkstr = "LF" Or Tkstr = "CR" Then
        Rtnattr = await Dofuncs(Equates_JSB2JS.TYPE_ESTR, true);
        if (CBool(Rtnattr)) return Rtnattr;
        Rtnattr = {};
        // End If

        // @@rpcRequest CALL(x) ?
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AT) {
            await Tcv(false); // Skip @
            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_QUESTION) {
                Ignoremissingcall = true;
                await Tcv(false); // Skip @;
            }
            Isatat = 1;
            Cname = Commons_JSB2JS.Tkstr;
            Callnameisliteral = true; // @@odbName(x)
            Firsttkstr = Commons_JSB2JS.Tkstr;
            await Tcv(false);;
        } else {
            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_QUESTION) {
                await Tcv(false);
                Ignoremissingcall = true;
            }

            // Call @variable(params)
            // x = @literal(...)
            // x = @(variable)(params)
            // x = @literal.literal()

            // @((varname))?
            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
                await Tcv(false);
                Iscallat = true;

                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
                    await Tcv(false);
                    Firsttkstr = Commons_JSB2JS.Tkstr;
                    await Tcv(false);
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) await Tcv(false); else await Err(') expected');
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) await Tcv(false); else await Err(') expected');
                } else {
                    Firsttkstr = Commons_JSB2JS.Tkstr;
                    await Tcv(false);
                    if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RPAREN) await Err(') expected');
                }
            } else if (CBool(Ignoremissingcall) || Not(Isfunc)) {
                Firsttkstr = Commons_JSB2JS.Tkstr;
                await Tcv(false);

                if (Commons_JSB2JS.Tkstr != Commons_JSB2JS.Mobjectdelemeter) {
                    Iscallat = true;
                    Pattr = await Readsym(Firsttkstr);
                    Cname = Pattr.SYM_C;
                }
            } else {
                // @Literal() or @Literal.Literal
                Firsttkstr = Commons_JSB2JS.Tkstr;
                Callnameisliteral = true;
                await Tcv(false);
            }

            if (CBool(Iscallat)) {
                Pattr = await Readsym(Firsttkstr);
                Cname = Pattr.SYM_C;;
            } else if (Commons_JSB2JS.Tkstr == Commons_JSB2JS.Mobjectdelemeter) {
                Hasliteralfname = true;
            }
        }
    } else {
        // could be json.xxx?
        Ignoremissingcall = Commons_JSB2JS.Tkno == Equates_JSB2JS.C_QUESTION;
        if (CBool(Ignoremissingcall)) {
            await Tcv(false); // Call ?Literal;
        }
        Firsttkstr = Commons_JSB2JS.Tkstr;
        Callnameisliteral = true;
        await Tcv(false);
        if (Commons_JSB2JS.Tkstr == Commons_JSB2JS.Mobjectdelemeter) Hasliteralfname = true;
    }

    if (CBool(Isfunc)) {
        Xrefsuffix = '_fnc.def';
        Cnamesuffix = '';
    } else {
        Xrefsuffix = '.def';
        Cnamesuffix = '_Sub';
    }

    if (CBool(Isatat)); else if (CBool(Hasliteralfname)) {
        await Tcv(false); // Skip "."

        Fname = UCase(await cspc_truefilename(Firsttkstr));
        Shortcallname = Commons_JSB2JS.Tkstr;

        if (Locate(Commons_JSB2JS.Tkstr, Commons_JSB2JS.Uc_Externals_Purejs_List, 0, 0, 0, "", position => X = position)) {
            Standardjscall = true;
            Calldef = { "SUB_SUBNAME": Extract(Commons_JSB2JS.Uc_Externals_Purejs_List, X, 0, 0), "SUB_CNAME": Extract(Commons_JSB2JS.Externals_Purejs_List, X, 0, 0), "SUB_ISFUNCTION": Isfunc, "SUB_NOAWAITSALLOWED": true, "SUB_PARAMTYPES": '' };
            Cname = Extract(Commons_JSB2JS.Externals_Purejs_List, X, 0, 0);
        } else {
            Subtkstr = await Makesubname(Commons_JSB2JS.Tkstr);
            Cname = CStr(Fname) + '_' + CStr(Subtkstr) + CStr(Cnamesuffix);
            Calldef = await JSB2JS_READXREF(CStr(Cname) + CStr(Xrefsuffix));
            if (Not(Calldef)) Needcalldef = true;
        }
        await Tcv(false);;
    } else if (CBool(Callnameisliteral)) {
        // if callNameIsLiteral then firstTkStr is valid

        // Look up any previous compile on this routine
        Fname = UCase(Commons_JSB2JS.Pcfname);
        Shortcallname = Firsttkstr;
        Subtkstr = await Makesubname(Firsttkstr);
        Cname = CStr(Fname) + '_' + CStr(Subtkstr) + CStr(Cnamesuffix);
        Calldef = await JSB2JS_READXREF(CStr(Cname) + CStr(Xrefsuffix));

        if (Not(Calldef)) {
            Fname = 'JSB_BF';
            Cname = CStr(Fname) + '_' + CStr(Subtkstr) + CStr(Cnamesuffix);
            Calldef = await JSB2JS_READXREF(CStr(Cname) + CStr(Xrefsuffix));
        }

        if (Not(Calldef)) {
            Fname = 'JSB_HTML';
            Cname = CStr(Fname) + '_' + CStr(Subtkstr) + CStr(Cnamesuffix);
            Calldef = await JSB2JS_READXREF(CStr(Cname) + CStr(Xrefsuffix));
        }

        // Look first in config_jsb2js
        if (Locate(Firsttkstr, Commons_JSB2JS.Uc_Externals_Purejs_List, 0, 0, 0, "", position => X = position)) {
            Standardjscall = true;
            Cname = Extract(Commons_JSB2JS.Externals_Purejs_List, X, 0, 0);
            if (Not(Calldef)) { Calldef = { "SUB_SUBNAME": Extract(Commons_JSB2JS.Uc_Externals_Purejs_List, X, 0, 0), "SUB_ISFUNCTION": Isfunc, "SUB_NOAWAITSALLOWED": true, "SUB_PARAMTYPES": '' } }
            Calldef.SUB_CNAME = Cname;
        } else {
            if (Not(Calldef)) { Calldef = {} }
            if (Not(Calldef.SUB_CNAME)) {
                if (await JSB_ODB_READ(X, await JSB_BF_FHANDLE('JSB_HTML'), CStr(Subtkstr), function (_X) { X = _X })) {
                    Fname = 'JSB_HTML';
                } else {
                    if (await JSB_ODB_READ(X, await JSB_BF_FHANDLE('JSB_BF'), CStr(Subtkstr), function (_X) { X = _X })) {
                        Fname = 'JSB_BF';
                    } else {
                        Fname = Commons_JSB2JS.Cur_Realfname;
                    }
                }

                Needcalldef = true;
                Fname = UCase(Commons_JSB2JS.Pcfname);
                Cname = CStr(Fname) + '_' + CStr(Subtkstr) + CStr(Cnamesuffix);
            }
        }
    }

    if (CBool(Needcalldef)) {
        Myfunctype = await calcAppendage(Commons_JSB2JS.Functiontype);
        if (Not(Myfunctype)) Myfunctype = '_fnc';

        Calldef = {
            "SUB_COMPILEDATE": 'Referenced by ' + CStr(Commons_JSB2JS.Pcfname) + ' ' + CStr(Commons_JSB2JS.Itemid) + ' on ' + DateTime(),
            "SUB_FNAME": LCase(Fname),
            "SUB_CNAME": Cname,
            "SUB_SUBNAME": Shortcallname,
            "SUB_ISFUNCTION": 1, "SUB_NOAWAITSALLOWED": Commons_JSB2JS.Notasyncfunction,
            "SUB_PARAMTYPES": '',
            "SUB_RTNTYPE": '',
            "SUB_OPTIONALPARAMCNT": 0,
            "SUB_ISCALLEDBY": LCase(CStr(Commons_JSB2JS.Pcfname) + '*' + CStr(Commons_JSB2JS.Itemid) + '*' + CStr(Commons_JSB2JS.Pcfname) + '_' + CStr(Commons_JSB2JS.Subname) + '*' + CStr(Commons_JSB2JS.Pcfname) + '_' + CStr(Commons_JSB2JS.Subname) + CStr(Myfunctype))
        };
        if (CBool(Isfunc)) Calldef.SUB_ISFUNCTION = 2;
    } else {
        if (Not(Calldef)) { Calldef = {} }
        if (CBool(Calldef.SUB_CNAME)) Cname = Calldef.SUB_CNAME;
    }

    // if we are not defined as a asyn function, then we can't call any functions that are
    if (Commons_JSB2JS.Notasyncfunction && Not(Calldef.SUB_NOAWAITSALLOWED)) await Warning('A call to an async function from a non-async function.  Add IJS or ASYNC- to ' + CStr(Cname) + ' or remove it from this function');
    if (CBool(Isatat) && Commons_JSB2JS.Notasyncfunction) await Err(CStr(Commons_JSB2JS.Subname) + ' can not be an IJS function and use @@functions');
    if (CBool(Calldef.SUB_ISEXTERNAL)) Standardjscall = true;

    // LOOP ON EACH PARAMETER AND BUILD PrmList...(EXPR, EXPR, VAR, ETC)

    Needlp = Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN;
    Cbadr = '';
    Paramcnt = 0;
    Paramtypes = Split(Calldef.SUB_PARAMTYPES, ',');
    Byreffparams = '';

    if (CBool(Needlp)) {
        await Tcv(false); // Skip (
        Commons_JSB2JS.La = CStr(Commons_JSB2JS.La) + Equates_JSB2JS.C_COMMA;

        // STOP WHEN WE GET TO A ")"

        while (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RPAREN) {
            Parami++;

            // DETERMINE THE TYPE OF PARAMETER: (ByVal - Upper Case, ByRef - lower Case)
            // s (string), v (variant), b (boolean), n (real/number), i (integer), j (json), a (array), ? (object), l (select-list)

            if (CBool(Iscallat) || CBool(Isatat)) {
                Expectingtype = 'V';
                if (Commons_JSB2JS.Tkstr == 'BYREF') {
                    await Tcv(false);
                    Expectingtype = 'v';;
                } else if (Commons_JSB2JS.Tkstr == 'BYVAL') {
                    await Tcv(false);
                }
            } else if (CBool(Needcalldef)) {
                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_MAT) {
                    await Tcv(false);
                    Holdtk = await Savetk();
                    Pattr = await Matload();
                    Expectingtype = Commons_JSB2JS.Matloadsize;
                    await Restoret(Holdtk);
                } else {
                    Expectingtype = 'v';
                }

                Paramtypes[Parami] = Expectingtype;
                Calldef.SUB_PARAMTYPES = Join(Paramtypes, ',');;
            } else {
                Expectingtype = Paramtypes[Parami];
                if (Not(Expectingtype) && Not(Standardjscall)) {
                    Print(); debugger;
                    await Warning('too many parameters');
                }
                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_MAT) await Tcv(false);
            }

            Lce = LCase(Left(Expectingtype, 1));
            if (!InStr1(1, Myvalidtypes, Lce)) {
                Typei = Index1(Interchangetypeschars, Lce, 1);
                if (CBool(Typei)) {
                    Expectingtype = Interchangetypes[Typei];
                } else {
                    Println('Unknown parameter definition type: ', Lce); debugger;
                    Expectingtype = Equates_JSB2JS.TYPE_VAR;
                }
            }

            Isbyref = (LCase(Expectingtype) == Expectingtype && !isEmpty(Expectingtype));

            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                // Empty param ",,"
                Pattr = {};
                Pattr.SYM_C = 'undefined';
                Pattr.SYM_INCLEVEL = Commons_JSB2JS._Incfile;
                Pattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                Pattr.SYM_TYPES = Equates_JSB2JS.SYMTYPES_STORED;
                Pattr.SYMNAME = 'UNDEFINED';
                Pattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_EXTERNAL;
                Isbyref = LCase(Expectingtype) == Expectingtype;;
            } else {
                Pattr = await Expr(Expectingtype, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
            }

            // Update Symtypes_stored and SYM_USED if needed

            if (Index1(Equates_JSB2JS.TYPE_VNUM + Equates_JSB2JS.TYPE_VBOOL + Equates_JSB2JS.TYPE_VSTR + Equates_JSB2JS.TYPE_VAR, Pattr.SYM_TYPE, 1) && Null0(Pattr.SYM_USED) == '0') {
                Pattr.SYM_USED = 1;
                if (!Index1(Pattr.SYM_TYPES, Equates_JSB2JS.SYMTYPES_STORED, 1) && LCase(Expectingtype) == Expectingtype) Pattr.SYM_TYPES += Equates_JSB2JS.SYMTYPES_STORED;
                await Writesym(Pattr, Pattr.SYMNAME);
            }

            // if Call by reference, build ByRefScript

            if (CBool(Isbyref) || CBool(Isatat)) {
                if (CBool(Byreffparams)) Byreffparams += ', ';

                // Did we pass a variable?
                if (Index1(Equates_JSB2JS.TYPE_VNUM + Equates_JSB2JS.TYPE_VBOOL + Equates_JSB2JS.TYPE_VSTR + Equates_JSB2JS.TYPE_VAR, Pattr.SYM_TYPE, 1)) {
                    Pname = fieldLeft(CStr(Pattr.SYM_C), '[');
                    if (InStr1(1, Pname, '.')) Pname = fieldRight(CStr(Pattr.SYM_C), '.');
                    Pname = '_' + CStr(Pname);
                    Byreffparams += CStr(Pname);

                    if (CBool(Isbyref)) Byrefscript[Byrefscript.length] = CStr(Pattr.SYM_C) + ' = ' + CStr(Pname);

                    if (!Index1(Pattr.SYM_TYPES, Equates_JSB2JS.SYMTYPES_STORED, 1)) {
                        Pattr.SYM_TYPES += Equates_JSB2JS.SYMTYPES_STORED;
                        await Writevsym(Pattr.SYM_TYPES, Pattr.SYMNAME, 'SYM_TYPES');
                    }
                } else {
                    Byreffparams += '_P' + CStr(Parami);
                }

                // Update sugguesting type?
                if (Null0(Pattr.SYM_TYPE) == Null0(Expectingtype) && Not(Isatat)) {
                    if (Not(Needcalldef)) {
                        if (!Index1(Pattr.SYM_TYPES, Expectingtype, 1)) {
                            Pattr.SYM_TYPES += CStr(Expectingtype);
                            await Writevsym(Pattr.SYM_TYPES, Pattr.SYMNAME, 'SYM_TYPES');
                        }
                    }
                }
            } else {
                switch (true) {
                    case Expectingtype == 'N' || Expectingtype == 'n':
                        await Makenum(Equates_JSB2JS.TYPE_VNUM, Pattr);
                        break;

                    case Expectingtype == 'B' || Expectingtype == 'b':
                        await Makebool(Pattr);
                        break;

                    case Expectingtype == 'S' || Expectingtype == 's':
                        await Makestr(Equates_JSB2JS.TYPE_VSTR, Pattr);
                }
            }

            if (Len(Prmlist)) Prmlist += ', ';
            Prmlist += CStr(Pattr.SYM_C);

            await SkipOverComments(true);
            Paramcnt++;
            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) break;
            await Tcv(false);
            if (Index1(Equates_JSB2JS.C_AM + Equates_JSB2JS.C_ASTERISK, Commons_JSB2JS.Tkno, 1)) await SkipOverComments(true)
        }
        Commons_JSB2JS.La = Mid1(Commons_JSB2JS.La, 1, Len(Commons_JSB2JS.La) - 1);
    }

    if (CBool(Needlp)) {
        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RPAREN) await Err(') Expected'); else await Tcv(false);
    }

    // Fill in optional parameters
    if (Not(Needcalldef) && CBool(Byreffparams)) {
        var _ForEndI_70 = UBound(Paramtypes);
        for (Parami = +Parami + 1; Parami <= _ForEndI_70; Parami++) {
            Expectingtype = Paramtypes[Parami];
            if (Len(Prmlist)) Prmlist += ', ';
            Prmlist += 'undefined';
            Paramcnt++;
        }
    }

    if (CBool(Xtraparams)) {
        if (Len(Prmlist)) Prmlist += ', ';
        Prmlist += CStr(Xtraparams);
    }

    if (CBool(Byreffparams) && CBool(Byrefscript)) {
        Prmlist += ', function (' + CStr(Byreffparams) + ') { ' + Join(Byrefscript, '; ') + ' }';
    }

    if (CBool(Isatat)) {
        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Has a CALL @@ (rpc request)';

        if (CBool(Prmlist)) Prmlist = ', ' + CStr(Prmlist);
        if (CBool(Isfunc)) {
            Rtnattr.SYM_C = 'await asyncRpcRequest(\'' + CStr(Cname) + '\'' + CStr(Prmlist) + ')';
        } else {
            Commons_JSB2JS.Oc = CStr(Commons_JSB2JS.Oc) + '/* call */ await asyncRpcRequest(\'' + CStr(Cname) + '\'' + CStr(Prmlist) + '); ';
        }
    } else if (CBool(Iscallat)) {
        // A lot of assumuptions make - ASync function (all ByRefs's)
        // Call @Sub
        if (CBool(Isfunc)) {
            Rtnattr.SYM_C = 'await asyncCallByName(' + CStr(Cname) + ', me, ' + CStr(Ignoremissingcall) + '/*ignore if missing */, ' + CStr(Prmlist) + ')';
        } else {
            Commons_JSB2JS.Oc += 'await asyncCallByName(' + CStr(Cname) + ', me, ' + CStr(Ignoremissingcall) + ' /*ignore if missing */, ' + CStr(Prmlist) + '); ';
        }
    } else {

        if (Commons_JSB2JS.Notasyncfunction || CBool(Calldef.SUB_NOAWAITSALLOWED)) Prefix = ''; else Prefix = 'await ';

        if (CBool(Ignoremissingcall)) Prefix = 'if (window.' + CStr(Cname) + ') ' + CStr(Prefix);

        if (CBool(Isfunc)) {
            Rtnattr.SYM_C = CStr(Prefix) + CStr(Cname) + '(' + CStr(Prmlist) + ')';
        } else {
            Commons_JSB2JS.Oc += CStr(Prefix) + CStr(Cname) + '(' + CStr(Prmlist) + '); ';
        }
    }

    // To update or not.... what we temporarily built isn't exactly the definition
    // if needCallDef Then writejson CallDef on fXRefs, LCase(Cname):xrefSuffix

    if (CBool(Needcalldef) && CBool(Isfunc)) Returntype = 'v'; else Returntype = Calldef.SUB_RTNTYPE;
    switch (true) {
        case Returntype == 'N':
            Rtnattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
            break;

        case Returntype == 'S':
            Rtnattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
            break;

        case CBool(1):
            Rtnattr.SYM_TYPE = Equates_JSB2JS.TYPE_DC;
    }

    // Keep track of routines we call (except calls to routines in config_jsb2js)

    if (CBool(Callnameisliteral) && Not(Standardjscall)) {
        if (CBool(Isfunc)) Callid = LCase(Cname) + '_fnc'; else Callid = LCase(Cname);
        if (Locate(Callid, Commons_JSB2JS.Calllist, 0, 0, 0, "", position => { })); else Commons_JSB2JS.Calllist[Commons_JSB2JS.Calllist.length] = Callid;
    }

    return Rtnattr;
}
// </DOCALL>

// <DOFUNCS>
async function Dofuncs(Exp_Type, Noparams) {
    // local variables
    var Gattr, Success, Breakcase, S, Contents, Battr, Cattr, Bexpr;
    var Aexpr, Cexpr, Dexpr, Avs, Isx, Slen, I, Ctkstr, Htk;

    await Include_JSB2JS__Comms(false)

    // Should return a type:
    // TYPE_ESTR - a known string expression
    // Type_eNum           number
    // Type_eBool           boolean
    // TYPE_EXP            anything else (xml, json, array, etc.)

    Gattr = {};
    Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_TEMP;
    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
    Gattr.SYM_INCLEVEL = Commons_JSB2JS._Incfile;
    Gattr.SYM_ATRNO = 0;
    Gattr.SYMNAME = Commons_JSB2JS.Tkstr;

    Success = 1;
    for (Breakcase = 1; Breakcase <= 1; Breakcase++) {
        var dblBreak2 = false;
        switch (true) {
            case Commons_JSB2JS.Tkstr == '$':
                // Jquery
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Exp_Type, 1, Equates_JSB2JS.C_RPAREN);
                Gattr.SYM_C = '$(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_EXTERNAL;
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'FUNCTION':
                await Tcv(false); // Skip function
                S = '';
                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
                    await Tcv(false); // Skip (

                    while (Not(Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SM)) {
                        S = CStr(S) + CStr(Commons_JSB2JS.Otkstr);
                        await Tcv(false);
                    }
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) await Tcv(false);
                }

                if (Commons_JSB2JS.Tkstr != '{') { await Err('{ expected'); }

                Contents = ' { ' + await PassThruJavascript() + ' }';
                Gattr.SYM_C = 'function (' + CStr(S) + ')' + CStr(Contents);

                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
                    await Tcv(false);
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) await Tcv(false); else { await Err('\')\' expected; Found ' + CStr(Commons_JSB2JS.Tkstr)); }
                    Gattr.SYM_C = CStr(Gattr.SYM_C) + '()';
                }

                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;
                return Gattr;

                break;

            case Commons_JSB2JS.Tkstr == 'IIF' || Commons_JSB2JS.Tkstr == 'IFF':
                await Tcv(false); // Skip iif
                await Tcv(false); // skip (

                Gattr = await Expr(Equates_JSB2JS.TYPE_EBOOL, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { await Err(', expected'); dblBreak2 = true; break; }
                await Tcv(false); // skip ,

                Battr = await Expr(Exp_Type, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { await Err(', expected'); dblBreak2 = true; break; }
                await Tcv(false); // skip ,

                Cattr = await Expr(Exp_Type, 1, Equates_JSB2JS.C_RPAREN);

                Gattr.SYM_C = '(' + CStr(Gattr.SYM_C) + '?' + CStr(Battr.SYM_C) + ':' + CStr(Cattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Exp_Type;

                break;

            case Commons_JSB2JS.Tkstr == 'ABS':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Exp_Type, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_C = 'Abs(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'PI':
                await Tcv(false);
                await Tcv(false);
                Gattr.SYM_C = 'PI()';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'GUID':
                await Tcv(false);
                await Tcv(false);
                Gattr.SYM_C = 'newGUID()';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'ARGUMENTS':
                await Tcv(false);
                await Tcv(false);
                Gattr.SYM_C = 'arguments';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'SEQ' || Commons_JSB2JS.Tkstr == 'ASC':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'Seq(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'ISALPHA' || Commons_JSB2JS.Tkstr == 'ALPHA':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'isAlpha(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;

                break;

            case Commons_JSB2JS.Tkstr == 'ISINT':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'isInt(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;

                break;

            case Commons_JSB2JS.Tkstr == 'ISMISSING' || Commons_JSB2JS.Tkstr == 'ISUNDEFINED':
                // Returns True for undefined 
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = CStr(Gattr.SYM_C) + ' === undefined';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;

                break;

            case Commons_JSB2JS.Tkstr == 'ISNULL' || Commons_JSB2JS.Tkstr == 'ISMISSING' || Commons_JSB2JS.Tkstr == 'ISNOTHING' || Commons_JSB2JS.Tkstr == 'ISUNDEFINED':
                // Note: ISNULL: Needs to be the same for ASPX compatibility - use window.IsNull if you really need IsNull()
                // Returns True for null or undefined - but NOT an empty string
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'isNothing(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;

                break;

            case Commons_JSB2JS.Tkstr == 'ISEMPTY':
                // Returns True for null, undefined, or empty string
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'isEmpty(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;

                break;

            case Commons_JSB2JS.Tkstr == 'CHAR' || Commons_JSB2JS.Tkstr == 'CHR' || Commons_JSB2JS.Tkstr == 'CHR$':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);

                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                if (Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_CNUM) {
                    switch (true) {
                        case Null0(Gattr.SYM_C) == 10:
                            Gattr.SYM_C = '\'\\n\'';
                            break;

                        case Null0(Gattr.SYM_C) == 11:
                            Gattr.SYM_C = '\'\\f\'';
                            break;

                        case Null0(Gattr.SYM_C) == 7:
                            Gattr.SYM_C = '\'\\a\'';
                            break;

                        case Null0(Gattr.SYM_C) == 13:
                            Gattr.SYM_C = '\'\\r\'';
                            break;

                        case Null0(Gattr.SYM_C) == 9:
                            Gattr.SYM_C = '\'\\t\'';
                            break;

                        case Null0(Gattr.SYM_C) == Seq('\\'):
                            Gattr.SYM_C = '\'\\\\\'';
                            break;

                        case Null0(Gattr.SYM_C) == Seq(' '):
                            Gattr.SYM_C = '\' \'';
                            break;

                        case CBool(1):
                            Gattr.SYM_C = 'Chr(' + CStr(Gattr.SYM_C) + ')';
                            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                    }
                } else {
                    Gattr.SYM_C = 'Chr(' + CStr(Gattr.SYM_C) + ')';
                    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                }

                break;

            case Commons_JSB2JS.Tkstr == 'MID' || Commons_JSB2JS.Tkstr == 'MID$':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { await Err(', expected'); dblBreak2 = true; break; }
                await Tcv(false);

                Bexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (!(Index1(Equates_JSB2JS.TYPE_VNUM + Equates_JSB2JS.TYPE_VBOOL + Equates_JSB2JS.TYPE_ENUM + Equates_JSB2JS.TYPE_CNUM + Equates_JSB2JS.TYPE_EBOOL, Bexpr.SYM_TYPE, 1))) {
                    await Typenum(Equates_JSB2JS.TYPE_VNUM, Bexpr);
                }

                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) {
                    Gattr.SYM_C = 'Mid1(' + CStr(Gattr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ')';
                    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                    { dblBreak2 = true; break };
                }

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { await Err(', expected'); dblBreak2 = true; break; }
                await Tcv(false);

                Aexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_RPAREN);
                if (!(Index1(Equates_JSB2JS.TYPE_VNUM + Equates_JSB2JS.TYPE_VBOOL + Equates_JSB2JS.TYPE_ENUM + Equates_JSB2JS.TYPE_CNUM + Equates_JSB2JS.TYPE_EBOOL, Aexpr.SYM_TYPE, 1))) {
                    await Typenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                }

                Gattr.SYM_C = 'Mid1(' + CStr(Gattr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ',' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'LEFT' || Commons_JSB2JS.Tkstr == 'LEFT$':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { await Err(', expected'); dblBreak2 = true; break; }
                await Tcv(false);

                Aexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (!(Index1(Equates_JSB2JS.TYPE_VNUM + Equates_JSB2JS.TYPE_VBOOL + Equates_JSB2JS.TYPE_ENUM + Equates_JSB2JS.TYPE_CNUM + Equates_JSB2JS.TYPE_EBOOL, Aexpr.SYM_TYPE, 1))) {
                    await Typenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                }

                Gattr.SYM_C = 'Left(' + CStr(Gattr.SYM_C) + ',' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'RIGHT' || Commons_JSB2JS.Tkstr == 'RIGHT$':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { await Err(', expected'); dblBreak2 = true; break; }
                await Tcv(false);

                Aexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_RPAREN);
                if (!(Index1(Equates_JSB2JS.TYPE_VNUM + Equates_JSB2JS.TYPE_VBOOL + Equates_JSB2JS.TYPE_ENUM + Equates_JSB2JS.TYPE_CNUM + Equates_JSB2JS.TYPE_EBOOL, Aexpr.SYM_TYPE, 1))) {
                    await Typenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                }

                Gattr.SYM_C = 'Right(' + CStr(Gattr.SYM_C) + ',' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'COL1':
                await Tcv(false);
                await Tcv(false);
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                Gattr.SYM_C = 'activeProcess.Col1';

                break;

            case Commons_JSB2JS.Tkstr == 'COL2':
                await Tcv(false);
                await Tcv(false);
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                Gattr.SYM_C = 'activeProcess.Col2';

                break;

            case Commons_JSB2JS.Tkstr == 'COS':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                if (Commons_JSB2JS.Mr83) Gattr.SYM_C = 'R83_Cos(' + CStr(Gattr.SYM_C) + ' )'; else Gattr.SYM_C = 'Cos(' + CStr(Gattr.SYM_C) + ' )';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'COUNT':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                    Gattr = await Ferr(', expected');
                } else {
                    await Tcv(false);
                    Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                }
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Bexpr);
                Gattr.SYM_C = 'Count(' + CStr(Aexpr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'CINT' || Commons_JSB2JS.Tkstr == 'INT' || Commons_JSB2JS.Tkstr == 'CLNG' || Commons_JSB2JS.Tkstr == 'FIX':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                Gattr.SYM_C = 'CInt(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'CBOOL':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                Gattr.SYM_C = 'CBool(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;

                break;

            case Commons_JSB2JS.Tkstr == 'CDBL' || Commons_JSB2JS.Tkstr == 'CSNG' || Commons_JSB2JS.Tkstr == 'CDEC':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                Gattr.SYM_C = 'CDbl(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'CNUM' || Commons_JSB2JS.Tkstr == 'VAL':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                Gattr.SYM_C = 'CNum(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'NUM' || Commons_JSB2JS.Tkstr == 'ISNUM':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'isNumber(' + CStr(Gattr.SYM_C) + ')'; // forgiving version (trailing stuff ok)
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;

                break;

            case Commons_JSB2JS.Tkstr == 'ISNUMERIC':
                // stricter version
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'isNumeric(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;

                break;

            case Commons_JSB2JS.Tkstr == 'DCOUNT':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                    Gattr = await Ferr(', expected');
                    Bexpr = clone(Gattr);
                } else {
                    await Tcv(false);
                    Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                }
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Bexpr);
                Gattr.SYM_C = 'DCount(' + CStr(Aexpr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'DELETE':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                    Gattr = await Ferr(', expected');
                } else {
                    await Tcv(false);
                    Bexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                    await Typenum(Equates_JSB2JS.TYPE_VNUM, Bexpr);

                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                        await Tcv(false);
                        Cexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                        await Typenum(Equates_JSB2JS.TYPE_VNUM, Cexpr);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                            await Tcv(false);
                            Dexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                            await Typenum(Equates_JSB2JS.TYPE_VNUM, Dexpr);
                        } else {
                            Dexpr = {};
                            Dexpr.SYM_C = '0';
                        }
                    } else {
                        Cexpr = {};
                        Cexpr.SYM_C = '0';
                        Dexpr = {};
                        Dexpr.SYM_C = '0';
                    }
                }
                Gattr.SYM_C = 'Delete(' + CStr(Aexpr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ',' + CStr(Cexpr.SYM_C) + ',' + CStr(Dexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'DTX' || Commons_JSB2JS.Tkstr == 'HEX' || Commons_JSB2JS.Tkstr == 'HEX$':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                Gattr.SYM_C = 'DTX(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'EXP':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_C = 'Exp(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'EXTRACT':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                    Gattr = await Ferr(', expected');
                } else {
                    await Tcv(false);
                    Bexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                    await Typenum(Equates_JSB2JS.TYPE_VNUM, Bexpr);

                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                        await Tcv(false);
                        Cexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                        await Typenum(Equates_JSB2JS.TYPE_VNUM, Cexpr);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                            await Tcv(false);
                            Dexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                            await Typenum(Equates_JSB2JS.TYPE_VNUM, Dexpr);
                        } else {
                            Dexpr = {};
                            Dexpr.SYM_C = '0';
                        }
                    } else {
                        Cexpr = {};
                        Cexpr.SYM_C = '0';
                        Dexpr = {};
                        Dexpr.SYM_C = '0';
                    }
                }
                Gattr.SYM_C = 'Extract(' + CStr(Aexpr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ',' + CStr(Cexpr.SYM_C) + ',' + CStr(Dexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'FIELD':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_ESTR, Aexpr);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                    Gattr = await Ferr(', expected');
                } else {
                    await Tcv(false);
                    Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                    await Typestr(Equates_JSB2JS.TYPE_VSTR, Bexpr);
                    if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                        Gattr = await Ferr(', expected');
                    } else {
                        await Tcv(false);
                        Cexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                        await Typenum(Equates_JSB2JS.TYPE_VNUM, Cexpr);

                        if (InStr1(1, UCase(Commons_JSB2JS.Itemsrc), 'COL1()') || InStr1(1, UCase(Commons_JSB2JS.Itemsrc), 'COL2()')) {
                            Gattr.SYM_C = 'Field(' + CStr(Aexpr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ',' + CStr(Cexpr.SYM_C) + ', true)';
                        } else {
                            Gattr.SYM_C = 'Field(' + CStr(Aexpr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ',' + CStr(Cexpr.SYM_C) + ')';
                        }
                        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                    }
                }

                break;

            case Commons_JSB2JS.Tkstr == 'INDEX':
                await Tcv(false);
                await Tcv(false);
                Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Bexpr);

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                    Gattr = await Ferr(', expected');
                } else {
                    await Tcv(false);
                    Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                    await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);

                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                        await Tcv(false);
                        Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                        await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                    } else {
                        Gattr.SYM_C = 1;
                    }

                    Gattr.SYM_C = 'Index1(' + CStr(Bexpr.SYM_C) + ',' + CStr(Aexpr.SYM_C) + ',' + CStr(Gattr.SYM_C) + ')';
                    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                }

                break;

            case Commons_JSB2JS.Tkstr == 'INSTR':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                    Gattr = await Ferr(', expected');
                } else {
                    await Tcv(false);
                    Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                        await Tcv(false);
                        Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                        await Typenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                    } else {
                        Gattr = clone(Bexpr);
                        Bexpr = clone(Aexpr);
                        Aexpr.SYM_C = 1;
                    }
                    await Typestr(Equates_JSB2JS.TYPE_VSTR, Bexpr);
                    await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                    Gattr.SYM_C = 'InStr1(' + CStr(Aexpr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ',' + CStr(Gattr.SYM_C) + ')';
                    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                }

                break;

            case Commons_JSB2JS.Tkstr == 'INSTRI':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                    Gattr = await Ferr(', expected');
                } else {
                    await Tcv(false);
                    Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                        await Tcv(false);
                        Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                        await Typenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                    } else {
                        Gattr = clone(Bexpr);
                        Bexpr = clone(Aexpr);
                        Aexpr.SYM_C = 1;
                    }
                    await Typestr(Equates_JSB2JS.TYPE_VSTR, Bexpr);
                    await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                    Gattr.SYM_C = 'InStrI1(' + CStr(Aexpr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ',' + CStr(Gattr.SYM_C) + ')';
                    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                }

                break;

            case Commons_JSB2JS.Tkstr == 'INSTRREV':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                    Gattr = await Ferr(', expected');
                } else {
                    await Tcv(false);
                    Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                        await Tcv(false);
                        Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                        await Typenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                    } else {
                        Gattr = clone(Bexpr);
                        Bexpr = clone(Aexpr);
                        Aexpr.SYM_C = 'undefined';
                    }
                    await Typestr(Equates_JSB2JS.TYPE_VSTR, Bexpr);
                    await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                    Gattr.SYM_C = 'InStrRev1(' + CStr(Aexpr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ',' + CStr(Gattr.SYM_C) + ')';

                    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                }

                break;

            case Commons_JSB2JS.Tkstr == 'INSERT':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                    Gattr = await Ferr(', expected');
                } else {
                    await Tcv(false);
                    Cexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_SEMI + Equates_JSB2JS.C_RPAREN);
                    await Typenum(Equates_JSB2JS.TYPE_VNUM, Cexpr);

                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                        await Tcv(false);
                        Dexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_SEMI + Equates_JSB2JS.C_RPAREN);
                        await Typenum(Equates_JSB2JS.TYPE_VNUM, Dexpr);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                            await Tcv(false);
                            Bexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_SEMI + Equates_JSB2JS.C_RPAREN);
                            await Typenum(Equates_JSB2JS.TYPE_VNUM, Bexpr);
                        } else {
                            Bexpr = {};
                            Bexpr.SYM_C = '0';
                        }
                    } else {
                        Dexpr = {};
                        Dexpr.SYM_C = '0';
                        Bexpr = {};
                        Bexpr.SYM_C = '0';
                    }

                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SEMI || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                        await Tcv(false);
                        Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                        await Typestr(Equates_JSB2JS.TYPE_DC, Gattr);
                        Avs = CStr(Cexpr.SYM_C) + ',' + CStr(Dexpr.SYM_C) + ',' + CStr(Bexpr.SYM_C);
                        Gattr.SYM_C = 'Insert(' + CStr(Aexpr.SYM_C) + ',' + CStr(Avs) + ',' + CStr(Gattr.SYM_C) + ')';
                        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                    } else {
                        Gattr = await Ferr('";" Expected');
                    }
                }

                break;

            case Commons_JSB2JS.Tkstr == 'LEN':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_DC, Gattr);
                Gattr.SYM_C = 'Len(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'LN':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_C = 'Ln(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'LOG':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_C = 'Log(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'MCL' || Commons_JSB2JS.Tkstr == 'LCASE' || Commons_JSB2JS.Tkstr == 'LCASE$':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                Gattr.SYM_C = 'LCase(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'MCU' || Commons_JSB2JS.Tkstr == 'UCASE' || Commons_JSB2JS.Tkstr == 'UCASE$':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                Gattr.SYM_C = 'UCase(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'LOWER':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                Gattr.SYM_C = 'Lower(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'RAISE':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                Gattr.SYM_C = 'Raise(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'MXI':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                Gattr.SYM_C = 'Mxi(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'MXO':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                Gattr.SYM_C = 'Mxo(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'MOD':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Exp_Type, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                    Gattr = await Ferr(', expected');
                } else {
                    await Tcv(false);
                    Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                }

                await Typenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                if (InStr1(1, Aexpr.SYM_C, '*') || InStr1(1, Aexpr.SYM_C, '/') || InStr1(1, Aexpr.SYM_C, '-')) Aexpr.SYM_C = '(' + CStr(Aexpr.SYM_C) + ')';
                if (InStr1(1, Gattr.SYM_C, '*') || InStr1(1, Gattr.SYM_C, '/') || InStr1(1, Gattr.SYM_C, '-')) Gattr.SYM_C = '(' + CStr(Gattr.SYM_C) + ')';

                Gattr.SYM_C = CStr(Aexpr.SYM_C) + ' % ' + CStr(Gattr.SYM_C);

                break;

            case Commons_JSB2JS.Tkstr == 'NOT':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await JSB2JS_MAKENOT_Sub(Gattr);

                break;

            case Commons_JSB2JS.Tkstr == 'PWR':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { Gattr = await Ferr(', expected'); dblBreak2 = true; break; }
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                Gattr.SYM_C = 'Pwr(' + CStr(Gattr.SYM_C) + ',' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'REM':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Exp_Type, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                    Gattr = await Ferr(', expected');
                } else {
                    await Tcv(false);
                    Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                }
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                Gattr.SYM_C = CStr(Aexpr.SYM_C) + ' % ' + CStr(Gattr.SYM_C);

                break;

            case Commons_JSB2JS.Tkstr == 'RND':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_C = 'Rnd(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'SIN':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);

                if (Commons_JSB2JS.Mr83) Gattr.SYM_C = 'R83_Sin(' + CStr(Gattr.SYM_C) + ')'; else Gattr.SYM_C = 'Sin(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'SPACE':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);

                await Typenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                Gattr.SYM_C = 'Space(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'SQRT':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_C = 'Sqrt(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'STR' || Commons_JSB2JS.Tkstr == 'STRRPT':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_CSTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                    Gattr = await Ferr(', expected');
                } else {
                    await Tcv(false);
                    Bexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                    await Typenum(Equates_JSB2JS.TYPE_VNUM, Bexpr);
                }
                await Typestr(Equates_JSB2JS.TYPE_DC, Aexpr);
                Gattr.SYM_C = 'StrRpt(' + CStr(Aexpr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'TAN':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                if (Commons_JSB2JS.Mr83) Gattr.SYM_C = 'R83_Tan(' + CStr(Gattr.SYM_C) + ' )'; else Gattr.SYM_C = 'Tan(' + CStr(Gattr.SYM_C) + ' )';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'DATESERIAL':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_CSTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                    Gattr = await Ferr(', expected');
                } else {
                    await Tcv(false);
                    Bexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                    await Typenum(Equates_JSB2JS.TYPE_VNUM, Bexpr);

                    if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                        Gattr = await Ferr(', expected');
                    } else {
                        await Tcv(false);
                        Cexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                        await Typenum(Equates_JSB2JS.TYPE_VNUM, Cexpr);
                        Gattr.SYM_C = 'makeR83Date(' + CStr(Cexpr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ',' + CStr(Aexpr.SYM_C) + ')';
                        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                    }
                }

                break;

            case Commons_JSB2JS.Tkstr == 'TRIM':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'Trim(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'TRIMB' || Commons_JSB2JS.Tkstr == 'RTRIM':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'RTrim(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'TRIMF' || Commons_JSB2JS.Tkstr == 'LTRIM':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'LTrim(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'XTD':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                if (Aexpr.SYM_TYPE == Equates_JSB2JS.TYPE_CSTR) {
                    S = Mid1(Aexpr.SYM_C, 7, Len(Aexpr.SYM_C) - 8);
                    Isx = 1;
                    Slen = Len(S);
                    if (Not(Slen)) S = '0';
                    var _ForEndI_58 = +Slen;
                    for (I = 1; I <= _ForEndI_58; I++) {
                        if (!(Index1('0123456789ABCDEFabcdef', Mid1(S, I, 1), 1))) Isx = 0;
                    }
                    if (Not(Isx)) { Gattr = await Ferr('Not a Hex number'); dblBreak2 = true; break; }
                    Gattr.SYM_C = '0x' + CStr(S);
                    if (Null0(Slen) < 5) {
                        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                    } else {
                        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                    }
                    { dblBreak2 = true; break };
                }

                Gattr.SYM_C = 'XTD(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'CONVERT':
                await Tcv(false);
                await Tcv(false);
                // A = CONVERT(A TO B IN C)

                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { Gattr = await Ferr(', expected'); dblBreak2 = true; break; }
                await Tcv(false);

                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { Gattr = await Ferr(', expected'); dblBreak2 = true; break; }
                await Tcv(false);

                Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);

                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);

                await Typestr(Equates_JSB2JS.TYPE_VSTR, Bexpr);
                Gattr.SYM_C = 'Convert(' + CStr(Gattr.SYM_C) + ',' + CStr(Aexpr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ')';

                break;

            case Commons_JSB2JS.Tkstr == 'KEYIN' || Commons_JSB2JS.Tkstr == 'INKEY':
                await Tcv(false);
                await Tcv(false);

                // KeyIn() - no wait
                // KeyIn(true) - wait

                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) {
                    Gattr.SYM_C = 'KeyIn()';
                } else {
                    Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Has KeyIn()';
                    Gattr.SYM_C = 'await asyncKeyIn(true)';
                }

                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'MOUSEX' || Commons_JSB2JS.Tkstr == 'MOUSEY':
                Gattr.SYM_C = 'window.mouse' + Right(Commons_JSB2JS.Tkstr, 1);
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                await Tcv(false);
                await Tcv(false);

                break;

            case Commons_JSB2JS.Tkstr == 'REPLACE':
                // Replace(Aexpr, From, To)
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN); // Replace(Str
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);

                Dexpr = {};
                Dexpr.SYM_C = '0';
                Bexpr = {};
                Bexpr.SYM_C = '0';

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                    Gattr = await Ferr(', expected');
                } else {
                    await Tcv(false);
                    Cexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_SEMI + Equates_JSB2JS.C_RPAREN); // Replace(Str, From
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                        await Tcv(false);
                        Dexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_SEMI + Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN); // Replace(Str, From, To)
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                            await Tcv(false);
                            Bexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_SEMI + Equates_JSB2JS.C_RPAREN); // Replace(Str, Am, Vm, Svm;
                        } else if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_SEMI) {
                            Gattr.SYM_C = 'Change(' + CStr(Aexpr.SYM_C) + ',' + CStr(Cexpr.SYM_C) + ',' + CStr(Dexpr.SYM_C) + ')';
                        }
                    } else if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_SEMI) {
                        Gattr = await Ferr('";" Expected');
                    }

                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SEMI || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                        await Tcv(false);
                        Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN); // Replace(Str, Am, Vm, Svm; Withstr)
                        await Typestr(Equates_JSB2JS.TYPE_DC, Gattr);

                        await Typenum(Equates_JSB2JS.TYPE_VNUM, Cexpr);
                        await Typenum(Equates_JSB2JS.TYPE_VNUM, Dexpr);
                        await Typenum(Equates_JSB2JS.TYPE_VNUM, Bexpr);

                        Avs = CStr(Cexpr.SYM_C) + ',' + CStr(Dexpr.SYM_C) + ',' + CStr(Bexpr.SYM_C);
                        Gattr.SYM_C = 'Replace(' + CStr(Aexpr.SYM_C) + ',' + CStr(Avs) + ',' + CStr(Gattr.SYM_C) + ')';
                        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                    }
                }

                break;

            case Commons_JSB2JS.Tkstr == 'CHANGE' || Commons_JSB2JS.Tkstr == 'REPLACEI' || Commons_JSB2JS.Tkstr == 'CHANGEI':
                // X = CHANGE(AEXPR, GATTR, BEXPR)

                Ctkstr = Commons_JSB2JS.Tkstr;
                await Tcv(false);
                await Tcv(false);

                // Changes characters A to characters B in String

                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { Gattr = await Ferr(',  expected'); dblBreak2 = true; break; }
                await Tcv(false);

                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { Gattr = await Ferr(',  expected'); dblBreak2 = true; break; }
                await Tcv(false);

                Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);

                if (Ctkstr == 'CHANGE') {
                    Gattr.SYM_C = 'Change(' + CStr(Aexpr.SYM_C) + ',' + CStr(Gattr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ')';
                } else {
                    Gattr.SYM_C = 'ChangeI(' + CStr(Aexpr.SYM_C) + ',' + CStr(Gattr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ')';
                }
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'BITOR':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { Gattr = await Ferr(', expected'); dblBreak2 = true; break; }
                await Tcv(false);

                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);

                await Makenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                await Makenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                Gattr.SYM_C = ('(' + CStr(Aexpr.SYM_C) + ' | ' + CStr(Gattr.SYM_C) + ')');

                break;

            case Commons_JSB2JS.Tkstr == 'BITAND':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { Gattr = await Ferr(', expected'); dblBreak2 = true; break; }
                await Tcv(false);

                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);

                await Makenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                await Makenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                Gattr.SYM_C = ('(' + CStr(Aexpr.SYM_C) + ' & ' + CStr(Gattr.SYM_C) + ')');

                break;

            case Commons_JSB2JS.Tkstr == 'BITXOR':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { Gattr = await Ferr(', expected'); dblBreak2 = true; break; }
                await Tcv(false);

                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);

                await Makenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                await Makenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                Gattr.SYM_C = '(' + CStr(Aexpr.SYM_C) + ' ^ ' + CStr(Gattr.SYM_C) + ')';

                break;

            case Commons_JSB2JS.Tkstr == 'ACOS':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                if (Commons_JSB2JS.Mr83) Gattr.SYM_C = 'R83_ACos(' + CStr(Gattr.SYM_C) + ' )'; else Gattr.SYM_C = 'ACos(' + CStr(Gattr.SYM_C) + ' )';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'ASIN':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                if (Commons_JSB2JS.Mr83) Gattr.SYM_C = 'R83_ASin(' + CStr(Gattr.SYM_C) + ' )'; else Gattr.SYM_C = 'ASin(' + CStr(Gattr.SYM_C) + ' )';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'ATAN':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                if (Commons_JSB2JS.Mr83) Gattr.SYM_C = 'R83_ATan(' + CStr(Gattr.SYM_C) + ' )'; else Gattr.SYM_C = 'ATan(' + CStr(Gattr.SYM_C) + ' )';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'SINH':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_C = 'Sinh(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'COSH':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_C = 'Cosh(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'TANH':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_C = 'Tanh(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'FLOOR':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_C = 'Floor(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'CEIL' || Commons_JSB2JS.Tkstr == 'CEILING':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
                Gattr.SYM_C = 'Ceiling(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'XTS':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'XTS(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'STX':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'STX(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'ENCODE' || Commons_JSB2JS.Tkstr == 'ENCRYPT':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                    await Tcv(false);
                    Cexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                    Gattr.SYM_C = 'aesEncrypt(' + CStr(Gattr.SYM_C) + ',' + CStr(Cexpr.SYM_C) + ')';
                } else {
                    Gattr.SYM_C = 'aesEncrypt(' + CStr(Gattr.SYM_C) + ')';
                }
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'DECODE' || Commons_JSB2JS.Tkstr == 'DECRYPT':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                    await Tcv(false);
                    Cexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                    Gattr.SYM_C = 'aesDecrypt(' + CStr(Gattr.SYM_C) + ',' + CStr(Cexpr.SYM_C) + ')';
                } else {
                    Gattr.SYM_C = 'aesDecrypt(' + CStr(Gattr.SYM_C) + ')';
                }
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'DATE' || Commons_JSB2JS.Tkstr == 'CDATE' || Commons_JSB2JS.Tkstr == 'DATEVALUE':
                await Tcv(false);
                await Tcv(false);
                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) {
                    Gattr.SYM_C = 'r83Date()';
                    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                } else {
                    Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                    await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                    Gattr.SYM_C = 'r83Date(' + CStr(Gattr.SYM_C) + ')';
                    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                }

                break;

            case Commons_JSB2JS.Tkstr == 'TIME' || Commons_JSB2JS.Tkstr == 'CTIME':
                await Tcv(false);
                await Tcv(false);
                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) {
                    Gattr.SYM_C = 'r83Time()';
                    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                } else {
                    Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                    await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                    Gattr.SYM_C = 'r83Time(' + CStr(Gattr.SYM_C) + ')';
                    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                }

                break;

            case Commons_JSB2JS.Tkstr == 'TIMER':
                await Tcv(false);
                await Tcv(false);
                Gattr.SYM_C = 'Timer()';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'NOW':
                await Tcv(false);
                await Tcv(false);
                Gattr.SYM_C = 'Now()';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'DOW' || Commons_JSB2JS.Tkstr == 'DAYOFWEEK':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'DayOfWeek(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'YEAR':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'Field(YearMonthDay(' + CStr(Gattr.SYM_C) + '), "-", 1)';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'MONTH':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'Field(YearMonthDay(' + CStr(Gattr.SYM_C) + '), "-", 2)';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'DAY':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'Field(YearMonthDay(' + CStr(Gattr.SYM_C) + '), "-", 3)';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'DMY' || Commons_JSB2JS.Tkstr == 'DAYMONTHYEAR':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'YearMonthDay(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'CSTR' || Commons_JSB2JS.Tkstr == 'CSTR$':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);

                await Typestr(Equates_JSB2JS.TYPE_DC, Gattr);
                Gattr.SYM_C = 'CStr(' + CStr(Gattr.SYM_C) + ', true)';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'SYSTEM':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);

                Gattr.SYM_C = 'System(' + CStr(Gattr.SYM_C);
                if (CNum(Gattr.SYM_C) == 27 || CNum(Gattr.SYM_C) == 28) Gattr.SYM_C += ', me';
                Gattr.SYM_C += ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;

                break;

            case Commons_JSB2JS.Tkstr == 'JSON' || Commons_JSB2JS.Tkstr == 'STR2JSON':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'parseJSON(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;

                break;

            case Commons_JSB2JS.Tkstr == 'XML' || Commons_JSB2JS.Tkstr == 'STR2XML':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'parseXML(' + CStr(Gattr.SYM_C) + ')'; // xmlToJson(X)
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;

                break;

            case Commons_JSB2JS.Tkstr == 'HTMLENCODE' || Commons_JSB2JS.Tkstr == 'ESCAPE':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'htmlEscape(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'HTMLDECODE' || Commons_JSB2JS.Tkstr == 'UNESCAPE':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'htmlUnescape(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'URLENCODE' || Commons_JSB2JS.Tkstr == 'ENCODEURI':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'urlEncode(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'URLDECODE' || Commons_JSB2JS.Tkstr == 'DECODEURI':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'urlDecode(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'FORMVAR':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'formVar(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;

                break;

            case Commons_JSB2JS.Tkstr == 'PARAMVAR':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'paramVar(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;

                break;

            case Commons_JSB2JS.Tkstr == 'QUERYVAR' || Commons_JSB2JS.Tkstr == 'GUP':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'queryVar(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;

                break;

            case Commons_JSB2JS.Tkstr == 'SPLIT':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { Gattr = await Ferr(', expected'); dblBreak2 = true; break; }
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);

                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                    await Tcv(false);
                    Cexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                    Gattr.SYM_C = 'Split(' + CStr(Aexpr.SYM_C) + ',' + CStr(Gattr.SYM_C) + ',' + CStr(Cexpr.SYM_C) + ')';
                } else {
                    Gattr.SYM_C = 'Split(' + CStr(Aexpr.SYM_C) + ',' + CStr(Gattr.SYM_C) + ')';
                }
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;

                break;

            case Commons_JSB2JS.Tkstr == 'JOIN':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                    await Tcv(false);
                    Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                    Gattr.SYM_C = 'Join(' + CStr(Aexpr.SYM_C) + ',' + CStr(Gattr.SYM_C) + ')';
                } else {
                    await Typestr(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                    Gattr.SYM_C = 'Join(' + CStr(Aexpr.SYM_C) + ')';
                }
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'FMT':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { Gattr = await Ferr(', expected'); dblBreak2 = true; break; }
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);

                Gattr.SYM_C = 'Fmt(' + CStr(Aexpr.SYM_C) + ',' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'TYPEOF':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'typeOf(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'LBOUND' || Commons_JSB2JS.Tkstr == 'LOWERBOUND':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_EXP, 1, Equates_JSB2JS.C_RPAREN);
                Gattr.SYM_C = 'LBound(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'UBOUND' || Commons_JSB2JS.Tkstr == 'UPPERBOUND':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_EXP, 1, Equates_JSB2JS.C_RPAREN);
                Gattr.SYM_C = 'UBound(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                break;

            case Commons_JSB2JS.Tkstr == 'GETLIST':
                // Turn A Select List Into A String
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_EXP, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);

                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                    await Tcv(false);
                    Aexpr = await Expr(Equates_JSB2JS.TYPE_EBOOL, 1, Equates_JSB2JS.C_RPAREN);
                    Gattr.SYM_C = 'getList(' + CStr(Gattr.SYM_C) + ',' + CStr(Aexpr.SYM_C) + ')';
                } else {
                    Gattr.SYM_C = 'getList(' + CStr(Gattr.SYM_C) + ')';
                    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                }

                break;

            case Commons_JSB2JS.Tkstr == 'ACTIVELIST' || Commons_JSB2JS.Tkstr == 'ACTIVESELECT' || Commons_JSB2JS.Tkstr == 'LISTACTIVE' || Commons_JSB2JS.Tkstr == 'SELECTACTIVE':
                await Tcv(false);
                await Tcv(false);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RPAREN) {
                    Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                    Gattr.SYM_C = 'isActiveSelect(' + CStr(Gattr.SYM_C) + ')';
                } else {
                    Gattr.SYM_C = 'isSelectActive()';
                }
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;

                break;

            case Commons_JSB2JS.Tkstr == 'KEYS' || Commons_JSB2JS.Tkstr == 'TAGNAMES':
                // Array Of Keys
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_EXP, 1, Equates_JSB2JS.C_RPAREN);
                Gattr.SYM_C = 'Keys(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'TAGNAME':
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_EXP, 1, Equates_JSB2JS.C_RPAREN);
                S = Gattr.SYM_C;
                I = Count(S, '[');
                if (CBool(I)) {
                    I = Index1(S, '[', I);
                    S = Left(S, +I - 1) + ',' + Mid1(S, +I + 1);
                    I = InStr1(I, S, ']');
                    S = Left(S, +I - 1) + Mid1(S, +I + 1);
                }
                Gattr.SYM_C = 'TagName(' + CStr(S) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'ATTRIBUTES':
                // Array Of Attributes
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_EXP, 1, Equates_JSB2JS.C_RPAREN);
                Gattr.SYM_C = 'Attributes(' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'HASTAG':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_EXP, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { Gattr = await Ferr(', expected'); dblBreak2 = true; break; }
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
                Gattr.SYM_C = 'HasTag(' + CStr(Aexpr.SYM_C) + ',' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;

                break;

            case Commons_JSB2JS.Tkstr == 'IS':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_EXP, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { Gattr = await Ferr(', expected'); dblBreak2 = true; break; }
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_EXP, 1, Equates_JSB2JS.C_RPAREN);
                Gattr.SYM_C = '(' + CStr(Aexpr.SYM_C) + ' == ' + CStr(Gattr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;

                break;

            case Commons_JSB2JS.Tkstr == 'XTS':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                Gattr.SYM_C = 'XTS(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'STX':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                Gattr.SYM_C = 'STX(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'CLONE':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_EXP, 1, Equates_JSB2JS.C_RPAREN);
                Gattr.SYM_C = 'clone(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;

                break;

            case Commons_JSB2JS.Tkstr == 'REGX' || Commons_JSB2JS.Tkstr == 'REGEX' || Commons_JSB2JS.Tkstr == 'REGEXP':
                // RegX(Source, Pattern, Replace)
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { await Err(', expected'); dblBreak2 = true; break; }
                await Tcv(false);

                Bexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Bexpr);

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { await Err(', expected'); dblBreak2 = true; break; }
                await Tcv(false);

                Cexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Cexpr);

                Gattr.SYM_C = 'regExp(' + CStr(Gattr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ',' + CStr(Cexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'EXECUTEDOS':
                // Executedos("DIR")
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                Gattr.SYM_C = 'ExecuteDOS(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;

                break;

            case Commons_JSB2JS.Tkstr == 'CREATEOBJECT':
                // Createobject("DIR")
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                Gattr.SYM_C = 'CreateObject(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;

                break;

            case Commons_JSB2JS.Tkstr == 'CHECKSUM':
                // Checksum(String)
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                Gattr.SYM_C = 'Checksum(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;

                break;

            case Commons_JSB2JS.Tkstr == 'SORT':
                // Sort(Array {, sorttype}), Sort(Json[], Tag{, sorttype}) Or Sort(Jsonrec{, sorttype})
                await Tcv(false);
                await Tcv(false);
                Gattr = await Expr(Equates_JSB2JS.TYPE_EXP, 1, Equates_JSB2JS.C_COMMA);

                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                    await Tcv(false);
                    Bexpr = await Expr(Equates_JSB2JS.TYPE_EXP, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);

                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                        await Tcv(false);
                        Cexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                        await Typestr(Equates_JSB2JS.TYPE_VSTR, Cexpr);
                        Gattr.SYM_C = 'Sort(' + CStr(Gattr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ',' + CStr(Cexpr.SYM_C) + ')';
                        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                    } else {
                        Gattr.SYM_C = 'Sort(' + CStr(Gattr.SYM_C) + ',' + CStr(Bexpr.SYM_C) + ')';
                    }
                } else {
                    Gattr.SYM_C = 'Sort(' + CStr(Gattr.SYM_C) + ')';
                }

                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case Commons_JSB2JS.Tkstr == 'REVERSE':
                // Reverse(Array)
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_EXP, 1, Equates_JSB2JS.C_RPAREN);
                Gattr.SYM_C = 'Reverse(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;

                break;

            case Commons_JSB2JS.Tkstr == 'SQL':
                // Sql(ScalarCommand)
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                Gattr.SYM_C = 'SQL(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;

                break;

            case Commons_JSB2JS.Tkstr == 'SM' || Commons_JSB2JS.Tkstr == 'AM' || Commons_JSB2JS.Tkstr == 'VM' || Commons_JSB2JS.Tkstr == 'SVM' || Commons_JSB2JS.Tkstr == 'SSVM' || Commons_JSB2JS.Tkstr == 'CRLF' || Commons_JSB2JS.Tkstr == 'CR' || Commons_JSB2JS.Tkstr == 'LF':
                Htk = await Savetk();

                Gattr.SYM_C = LCase(Commons_JSB2JS.Tkstr);
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                await Tcv(false);

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_LPAREN && CBool(Noparams)) return Gattr;
                await Tcv(false);
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RPAREN) {
                    await Restoret(Htk);
                }

                break;

            case Commons_JSB2JS.Tkstr == 'EXECUTEDOS':
                await Tcv(false);
                await Tcv(false);
                Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                Gattr.SYM_C = 'ExecuteDos(' + CStr(Aexpr.SYM_C) + ')';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                break;

            case CBool(1):
                return undefined;
        }
        if (dblBreak2) break;
    }

    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) await Tcv(false); else { await Err(') expected;  Found ' + CStr(Commons_JSB2JS.Tkstr)); }
    return Gattr;
}
// </DOFUNCS>

// <EXPR>
async function Expr(Expectedtype, Parse_Rels, Stoptokens) {
    // local variables
    var Firsttkno, Gattr;

    await Include_JSB2JS__Comms(false)

    // PARSE_RELS = 1 ;* EXPRESSIONS INCLUDING RELATIONAL OPERATORS
    // PARSE_RELS = 2 ;* EXPRESSIONS EXCLUDING RELATIONAL OPERATORS

    Commons_JSB2JS.La = CStr(Commons_JSB2JS.La) + CStr(Stoptokens);
    Firsttkno = Commons_JSB2JS.Tkno;

    if (Null0(Parse_Rels) == 1) {
        Gattr = await Expr_AndOr(Expectedtype, Stoptokens);
    } else {
        Gattr = await Expr_ConCat(Expectedtype, Stoptokens);
    }

    // What follows an expression should be in STOPTOKENS
    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_IDENT && Firsttkno != Equates_JSB2JS.C_LPAREN) {
        await Warning('Unexpected characters: \'' + CStr(Commons_JSB2JS.Tkstr) + '\' found after ' + CStr(Gattr.SYM_C));
    }

    Commons_JSB2JS.La = Mid1(Commons_JSB2JS.La, 1, Len(Commons_JSB2JS.La) - Len(Stoptokens));
    return Gattr;
}
// </EXPR>

// <EXPR_ANDOR>
async function Expr_AndOr(Expectedtype, Stoptokens) {
    // local variables
    var Gattr, Eattr, Aop;

    await Include_JSB2JS__Comms(false)

    Gattr = await Expr_Matches(Expectedtype, Stoptokens);


    while (Index1(Equates_JSB2JS.C_AND + Equates_JSB2JS.C_OR + Equates_JSB2JS.C_ANDSIGN + Equates_JSB2JS.C_BAR, Commons_JSB2JS.Tkno, 1)) {
        Expectedtype = Equates_JSB2JS.TYPE_VNUM;
        Eattr = clone(Gattr);
        // This is unique for the client library, allows both logical and binary and/or
        Aop = Commons_JSB2JS.Tkstr;
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AND) Aop = ('&&');
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_OR) Aop = ('||');
        await Tcv(false);
        Gattr = await Expr_Matches(Expectedtype, Stoptokens);
        await Makebool(Gattr);
        await Makebool(Eattr);
        Gattr.SYM_C = CStr(Eattr.SYM_C) + ' ' + CStr(Aop) + ' ' + CStr(Gattr.SYM_C);
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
    }
    return Gattr;
}
// </EXPR_ANDOR>

// <EXPR_MATCHES>
async function Expr_Matches(Expectedtype, Stoptokens) {
    // local variables
    var Gattr, Eattr;

    await Include_JSB2JS__Comms(false)

    Gattr = await Expr_RelOps(Expectedtype, Stoptokens);


    while (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_MATCHES) {
        Expectedtype = Equates_JSB2JS.TYPE_VNUM;
        Eattr = clone(Gattr);
        await Tcv(false);
        Gattr = await Expr_RelOps(Expectedtype, Stoptokens);
        Gattr.SYM_C = 'Matches(' + CStr(Eattr.SYM_C) + ',' + CStr(Gattr.SYM_C) + ')';
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
    }
    return Gattr;
}
// </EXPR_MATCHES>

// <EXPR_RELOPS>
async function Expr_RelOps(Expectedtype, Stoptokens) {
    // local variables
    var Gattr, Rattr, Rop, Ptkno;

    await Include_JSB2JS__Comms(false)

    Gattr = await Expr_ConCat(Expectedtype, Stoptokens);


    while (Index1(Equates_JSB2JS.C_EQUAL + Equates_JSB2JS.C_POUND + Equates_JSB2JS.C_GREAT + Equates_JSB2JS.C_LESS + Equates_JSB2JS.C_EQ + Equates_JSB2JS.C_NE + Equates_JSB2JS.C_LE + Equates_JSB2JS.C_GE + Equates_JSB2JS.C_GT + Equates_JSB2JS.C_LT, Commons_JSB2JS.Tkno, 1)) {
        Rattr = clone(Gattr);
        Expectedtype = Rattr.SYM_TYPE;
        Rop = Commons_JSB2JS.Tkno;
        Ptkno = await Peektk();
        if ((Commons_JSB2JS.Tkno == Equates_JSB2JS.C_GREAT && Ptkno == Equates_JSB2JS.C_EQUAL) || (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_EQUAL && Ptkno == Equates_JSB2JS.C_GREAT)) {
            Rop = Equates_JSB2JS.C_GE;
            await Tcv(false);
        } else if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LESS && Ptkno == Equates_JSB2JS.C_GREAT) {
            Rop = Equates_JSB2JS.C_NE;
            await Tcv(false);
        } else {
            Ptkno = await Peektk();
            if ((Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LESS && Ptkno == Equates_JSB2JS.C_EQUAL) || (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_EQUAL && Ptkno == Equates_JSB2JS.C_LESS)) {
                Rop = Equates_JSB2JS.C_LE;
                await Tcv(false);
            }
        }
        await Tcv(false);
        Gattr = await Expr_ConCat(Expectedtype, Stoptokens);
        await Relcmp(Rattr, Gattr, Rop);
    }

    return Gattr;
}
// </EXPR_RELOPS>

// <EXPR_CONCAT>
async function Expr_ConCat(Expectedtype, Stoptokens) {
    // local variables
    var Catcnt, Makeexpr, Kstr, Gattr, Ptkno, Catstr, Catstr2;

    await Include_JSB2JS__Comms(false)

    Catcnt = 0;
    Makeexpr = 0;
    Kstr = '';


    while (true) {
        if (Commons_JSB2JS.Mr83) Gattr = await Expr_Fmt(Expectedtype, Stoptokens); else Gattr = await Expr_PlusMinus(Expectedtype, Stoptokens);

        Expectedtype = Equates_JSB2JS.TYPE_ESTR;
        Ptkno = await Peektk();

        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COLON || InStr1(1, Commons_JSB2JS.La, Ptkno) || InStr1(1, Stoptokens, Commons_JSB2JS.Tkno)) break;

        Makeexpr = 1;
        await Tcv(false); // Skip :
        await Makestr(Equates_JSB2JS.TYPE_DC, Gattr);
        if (Null0(Catcnt) == '0') {
            Catstr = 'new Array(';
            Catstr2 = '';
        } else {
            Catstr = CStr(Catstr) + ',';
            Catstr2 = CStr(Catstr2) + ' + ';
        }

        Catstr2 = CStr(Catstr2) + CStr(Gattr.SYM_C);
        Catstr = CStr(Catstr) + CStr(Gattr.SYM_C);
        Catcnt = +Catcnt + 1;
    }

    if (CBool(Catcnt)) {
        await Makestr(Equates_JSB2JS.TYPE_DC, Gattr);

        Catstr = CStr(Catstr) + ',' + CStr(Gattr.SYM_C);
        Catstr2 = CStr(Catstr2) + ' + ' + CStr(Gattr.SYM_C);

        if (Null0(Catcnt) > 133) {
            Gattr.SYM_C = CStr(Catstr) + ').join(\'\')';
        } else {
            Gattr.SYM_C = Catstr2;
        }
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
    }

    return Gattr;
}
// </EXPR_CONCAT>

// <EXPR_FMT>
async function Expr_Fmt(Expectedtype, Stoptokens) {
    // local variables
    var Gattr, Nextc, Fattr;

    await Include_JSB2JS__Comms(false)

    Gattr = await Expr_PlusMinus(Expectedtype, Stoptokens);

    Nextc = Left(Commons_JSB2JS.Tkstr, 1);
    if (InStr1(1, Stoptokens, Commons_JSB2JS.Tkno) == 0 && (isAlpha(Nextc) || InStr1(1, ' `\'' + '"', Nextc)) > 1) {
        Fattr = clone(Gattr);
        Gattr = await Expr_PlusMinus(Expectedtype, Stoptokens);
        Gattr.SYM_C = 'Fmt(' + CStr(Fattr.SYM_C) + ', ' + CStr(Gattr.SYM_C) + ')';
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
    }

    return Gattr;
}
// </EXPR_FMT>

// <EXPR_PLUSMINUS>
async function Expr_PlusMinus(Expectedtype, Stoptokens) {
    // local variables
    var Gattr, Pop, Pattr;

    await Include_JSB2JS__Comms(false)

    Gattr = await Expr_MulDiv(Expectedtype, Stoptokens);


    while (Index1(Equates_JSB2JS.C_PLUS + Equates_JSB2JS.C_MINUS, Commons_JSB2JS.Tkno, 1)) {
        Pop = Commons_JSB2JS.Tkstr;
        await Tcv(false);
        Pattr = clone(Gattr);
        Gattr = await Expr_MulDiv(Expectedtype, Stoptokens);

        await Makenum(Equates_JSB2JS.TYPE_VNUM, Pattr);
        await Makenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
        Gattr.SYM_C = CStr(Pattr.SYM_C) + CStr(Pop) + CStr(Gattr.SYM_C);
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
    }

    return Gattr;
}
// </EXPR_PLUSMINUS>

// <EXPR_MULDIV>
async function Expr_MulDiv(Expectedtype, Stoptokens) {
    // local variables
    var Gattr, Mop, Mattr;

    await Include_JSB2JS__Comms(false)

    Gattr = await Expr_PwrOf(Expectedtype, Stoptokens);


    while (Index1(Equates_JSB2JS.C_FSLASH + Equates_JSB2JS.C_ASTERISK + Equates_JSB2JS.C_MOD + Equates_JSB2JS.C_PERCENT, Commons_JSB2JS.Tkno, 1)) {
        Mop = Commons_JSB2JS.Tkstr;
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_MOD || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_PERCENT) Mop = ' % ';
        await Tcv(false);
        Mattr = clone(Gattr);

        Expectedtype = Equates_JSB2JS.TYPE_VNUM;
        Gattr = await Expr_PwrOf(Expectedtype, Stoptokens);

        await Makenum(Equates_JSB2JS.TYPE_VNUM, Mattr);
        await Makenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
        Gattr.SYM_C = CStr(Mattr.SYM_C) + CStr(Mop) + CStr(Gattr.SYM_C);
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
    }

    return Gattr;
}
// </EXPR_MULDIV>

// <EXPR_PWROF>
async function Expr_PwrOf(Expectedtype, Stoptokens) {
    // local variables
    var Gattr, Cattr;

    await Include_JSB2JS__Comms(false)

    Gattr = await Expr_Uniary(Expectedtype, Stoptokens);


    while (Index1(Equates_JSB2JS.C_CIRCUMFLEX, Commons_JSB2JS.Tkno, 1)) {
        Expectedtype = Equates_JSB2JS.TYPE_VNUM;
        Cattr = clone(Gattr);
        await Tcv(false);
        Gattr = await Expr_Uniary(Expectedtype, Stoptokens);

        await Makenum(Equates_JSB2JS.TYPE_VNUM, Cattr);
        await Makenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
        Gattr.SYM_C = 'Math.pow(' + CStr(Cattr.SYM_C) + ',' + CStr(Gattr.SYM_C) + ')';
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
    }

    return Gattr;
}
// </EXPR_PWROF>

// <EXPR_UNIARY>
async function Expr_Uniary(Expectedtype, Stoptokens) {
    // local variables
    var Negit, Gattr;

    await Include_JSB2JS__Comms(false)

    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_MINUS) {
        Negit = 1;
        await Tcv(false);
    } else if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_PLUS) {
        Negit = 0;
        await Tcv(false);
    } else {
        Negit = 0;
    }

    Gattr = await Atom(Expectedtype, Stoptokens);

    if (CBool(Negit)) {
        await Makenum(Equates_JSB2JS.TYPE_VNUM, Gattr);
        Gattr.SYM_C = '-' + CStr(Gattr.SYM_C);
    }

    return Gattr;
}
// </EXPR_UNIARY>

// <ATOM>
async function Atom(Expectedtype, Stoptokens) {
    // local variables
    var Gattr, Pattr, Clsname, Newhold, Params, Aexpr, S1, Htk;
    var Nc, X, Cattr, Json, Nattr, Strng, C, I, Nmbr, Amattr, Sattr;
    var Lenattr, Vmattr, Svmattr, Ptkno;

    await Include_JSB2JS__Comms(false)

    // ( EXPR )   ABS()  ID  STR  NUMBER

    Gattr = {};
    Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_TEMP;
    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_VAR;
    Gattr.SYM_INCLEVEL = Commons_JSB2JS._Incfile;
    Gattr.SYM_ATRNO = 0;

    switch (true) {
        case Commons_JSB2JS.Tkstr == 'NEW':
            await Tcv(false);
            Pattr = await Readsym(Commons_JSB2JS.Tkstr);

            if (Commons_JSB2JS.Tkstr == 'ARRAY') {
                Gattr.SYM_C = 'new Array()';
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;
                await Tcv(false);;
            } else if (Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1) == Commons_JSB2JS.Mobjectdelemeter || Null0(Pattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_EXTERNAL || CBool(Pattr.SYM_JSOBJ)) {
                // javascript new
                Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                Gattr.SYM_C = 'new ' + CStr(Gattr.SYM_C);
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;;
            } else {
                // NEW OBJECT
                Clsname = Commons_JSB2JS.Tkstr;
                await Tcv(false);

                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + '_new' + CStr(Clsname) + ' = { \'_fileName\': \'' + CStr(Commons_JSB2JS.Cur_Fname) + '\', \'_clsName\': \'' + CStr(Clsname) + '\' } ');
                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent));

                Newhold = await Savetk();

                // Call CUR_FNAME!CLSNAME._new()
                Params = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);

                // Call CUR_FNAME!CLSNAME._new(WITH PARAMS)
                if (Left(Params, 2) == '()') {
                    Params = '(me._new' + CStr(Clsname) + ')' + Mid1(Params, 3);;
                } else if (Left(Params, 1) == '(') {
                    Params = '(me._new' + CStr(Clsname) + ', ' + Mid1(Params, 2);;
                } else {
                    Params = '(me._new' + CStr(Clsname) + ') ' + Mid1(Params, 2);
                }

                // Call Base
                Commons_JSB2JS.Tkline = '@' + CStr(Commons_JSB2JS.Cur_Fname) + '.' + CStr(Clsname) + '__NEW(me._new' + CStr(Clsname) + ')';

                // Re-Parse
                Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                Aexpr = await Docall(false);

                // Build Subsitution
                Commons_JSB2JS.Tkline = '@' + CStr(Commons_JSB2JS.Cur_Fname) + '.' + CStr(Clsname) + '_NEW' + CStr(Params);

                // Re-Parse
                Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                Aexpr = await Docall(false);

                // Setup Return
                Gattr = {};
                Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_TEMP;
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;
                Gattr.SYM_INCLEVEL = Commons_JSB2JS._Incfile;
                Gattr.SYM_ATRNO = 0;
                Gattr.SYM_C = 'me._new' + CStr(Clsname);;
            }

            break;

        case Commons_JSB2JS.Tkno >= Equates_JSB2JS.C_IDENT:
            // FUNCTION CALL?
            S1 = Commons_JSB2JS.Tkstr;
            Htk = await Savetk();
            Nc = Left(Trim(Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 99)), 1);

            if (Nc == '(' || Nc == '{') {
                // Gattr.SYMNAME = Tkstr
                // Gattr.SYM_TYPE = Type_estr

                // Standard function?
                Gattr = await Dofuncs(Expectedtype, false);

                // Not a standard function?
                if (Not(Gattr)) {
                    if (Locate(Commons_JSB2JS.Tkstr, Commons_JSB2JS.Uc_Externals_Purejs_List, 0, 0, 0, "", position => X = position)) {
                        Gattr = await Docall(true);
                    } else {
                        Gattr = await Parsevar(0, 1, '', 1);
                    }
                }
            } else {
                Gattr = await Parsevar(0, 1, '', 1);
            }

            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
                // IF S1 IS ALREADY DECLARED AS A VARIABLE, THEN THIS IS NOT A CALL
                Pattr = await Readsym(S1);
                if (Null0(Pattr.SYM_FLAVOR) != Equates_JSB2JS.FLAVOR_EXTERNAL) {
                    if (Not(Commons_JSB2JS.Readsymfound) || Left(Trim(Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 99)), 1) == ')') {
                        await Restoret(Htk);
                        Commons_JSB2JS.La = CStr(Commons_JSB2JS.La) + Equates_JSB2JS.C_LESS + Equates_JSB2JS.C_LBRACK;
                        Gattr = await Docall(true);
                        Commons_JSB2JS.La = Mid1(Commons_JSB2JS.La, 1, Len(Commons_JSB2JS.La) - 2);
                    }
                }
            }

            if (Commons_JSB2JS.Tkstr == Commons_JSB2JS.Mobjectdelemeter || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK || S1 == '$' || S1 == '@') {
                await Objectparse(Gattr);;
            }

            break;

        case Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK:
            // Literal Array
            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;
            await Tcv(false);
            Gattr.SYM_C = '[undefined, '; // this Makes Constant Arrays Start At 1

            Commons_JSB2JS.La += Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RBRACK;
            // Loop on each PATTR

            while (1) {

                while (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AM) {
                    await Tcv(false);
                    Gattr.SYM_C = CStr(Gattr.SYM_C) + Chr(254);
                }
                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RBRACK) break;
                Cattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_AM);
                Gattr.SYM_C = CStr(Gattr.SYM_C) + CStr(Cattr.SYM_C);

                while (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AM) {
                    await Tcv(false);
                    Gattr.SYM_C = CStr(Gattr.SYM_C) + Chr(254);
                }
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) break;
                await Tcv(false);
                Gattr.SYM_C = CStr(Gattr.SYM_C) + ', ';
            }
            Commons_JSB2JS.La = Mid1(Commons_JSB2JS.La, 1, Len(Commons_JSB2JS.La) - 2);
            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RBRACK) await Err('] expected'); else await Tcv(false);
            Gattr.SYM_C = CStr(Gattr.SYM_C) + ']';

            break;

        case Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACE:

            // Check for JSON 
            Json = '';

            do {
                Json = CStr(Json) + CStr(Commons_JSB2JS.Tkstr);
                await Tcv(false); // ' Skip , or {

                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AM) Json = CStr(Json) + Chr(254);

                await SkipOverComments(false);

                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RBRACE) break;

                // Identifier
                if (Commons_JSB2JS.Tkno < Equates_JSB2JS.C_IDENT && Commons_JSB2JS.Tkno != Equates_JSB2JS.C_STR) await Err('Tag Identifier expected');
                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_STR) {
                    Json = CStr(Json) + Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos, Commons_JSB2JS.Tkpos - +Commons_JSB2JS.Tkstartpos);
                } else {
                    Json = CStr(Json) + '"' + Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos, Commons_JSB2JS.Tkpos - +Commons_JSB2JS.Tkstartpos) + '"';
                }

                await Tcv(false);

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COLON) await Err(': expected');
                Json = CStr(Json) + ':';
                await Tcv(false);

                Commons_JSB2JS.Otkstr = Commons_JSB2JS.Tkstr;
                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK) {

                    do {
                        Json = CStr(Json) + CStr(Commons_JSB2JS.Tkstr);
                        await Tcv(false); // ' Skip , or {

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AM) Json = CStr(Json) + Chr(254);
                        await SkipOverComments(false);

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RBRACK) break;
                        Nattr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_RBRACK + Equates_JSB2JS.C_COMMA);
                        Json = CStr(Json) + CStr(Nattr.SYM_C);

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AM) Json = CStr(Json) + Chr(254);
                        await SkipOverComments(false);
                    }
                    while (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA);

                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RBRACK) await Tcv(false); else await Err('] expected');
                    Json = CStr(Json) + ']';
                } else {
                    Nattr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_RBRACK + Equates_JSB2JS.C_COMMA);
                    Json = CStr(Json) + CStr(Nattr.SYM_C);
                }

                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AM) Json = CStr(Json) + Chr(254);
                await SkipOverComments(false);
            }
            while (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA);

            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RBRACE) await Tcv(false); else await Err('} expected');
            Json = CStr(Json) + '}';

            Gattr.SYM_ISCONST = 1;
            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;
            Gattr.SYM_C = Json;
            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_PERIOD || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) await Objectparse(Gattr);

            break;

        case Commons_JSB2JS.Tkno == Equates_JSB2JS.C_BANG:
            // !
            await Tcv(false);
            Gattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_RPAREN);
            await JSB2JS_MAKENOT_Sub(Gattr);

            break;

        case Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ANDSIGN && UCase(Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1)) == 'H':
            // &Hff
            await Tcv(false);
            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
            Gattr.SYM_C = '0x' + Mid1(Commons_JSB2JS.Tkstr, 2);
            await Tcv(false);

            break;

        case Commons_JSB2JS.Tkstr == '0' && UCase(Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1)) == 'X':
            // 0Xff
            await Tcv(false);
            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
            Gattr.SYM_C = '0x' + Mid1(Commons_JSB2JS.Tkstr, 2);
            await Tcv(false);

            break;

        case Commons_JSB2JS.Tkno == Equates_JSB2JS.C_STR:
            Gattr.SYM_ISCONST = 1;
            Gattr.SYMNAME = Commons_JSB2JS.Tkstr;
            Strng = Commons_JSB2JS.Tkstr;
            C = Mid1(Strng, 1, 1);
            Strng = Mid1(Strng, 2, Len(Strng) - 2);

            if (C == '`') {
                Strng = Change(Strng, '\\', '\\\\');
                Strng = Change(Strng, '\'', '\\\'');
                Strng = Change(Strng, '\<', '\\\<');
                Strng = Change(Strng, '\>', '\\\>');
            } else {
                for (I = 1; I <= 255; I++) {
                    C = Chr(I);
                    if (!InStr1(1, Strng, C)) break;
                }

                // Preserve \\
                Strng = Change(Strng, '\\\\', C);

                // Mask HTML characters
                Strng = Change(Strng, '\'', '\\\'');
                Strng = Change(Strng, '\<', '\\\<');
                Strng = Change(Strng, '\>', '\\\>');

                Strng = Change(Strng, '\\\\', '\\');

                // Extra Pickish stuff to escape
                Strng = Change(Strng, '\\a', '\\xFE');
                Strng = Change(Strng, '\\v', '\\xFD');
                Strng = Change(Strng, '\\s', '\\xFC');

                // Restore \\
                Strng = Change(Strng, C, '\\\\');
            }

            Strng = Change(Strng, Chr(13) + Chr(10), '\\r\\n\\' + Chr(13) + Chr(10));
            Strng = Change(Strng, Chr(10) + Chr(13), '\\r\\n\\' + Chr(13) + Chr(10));

            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_CSTR;
            Gattr.SYM_C = '\'' + CStr(Strng) + '\'';
            await Tcv(false);

            break;

        case Commons_JSB2JS.Tkno == Equates_JSB2JS.C_NUMBER:
            Gattr.SYM_ISCONST = 1;
            Nmbr = +Commons_JSB2JS.Tkstr + 0;
            await Tcv(false);
            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_PERIOD) {
                await Tcv(false);
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_CNUM;
                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_NUMBER) {
                    Nmbr = CNum(CStr(Nmbr) + '.' + CStr(Commons_JSB2JS.Tkstr)) + 0;
                    await Tcv(false);
                } else {
                    Nmbr = CStr(Nmbr) + '.0';
                }
            }
            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_CNUM;
            Gattr.SYMNAME = Nmbr;
            Gattr.SYM_C = Nmbr;
            return Gattr;

            break;

        case Commons_JSB2JS.Tkno == Equates_JSB2JS.C_PERIOD:
            Gattr.SYM_ISCONST = 1;
            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_CNUM;
            await Tcv(false);
            Gattr.SYMNAME = '.' + CStr(Commons_JSB2JS.Tkstr);
            Gattr.SYM_C = '0.' + CStr(Commons_JSB2JS.Tkstr);
            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_NUMBER) {
                await Err('Number expected');
                Gattr.SYMNAME = 0;
            } else {
                await Tcv(false);
            }
            return Gattr;

            break;

        case Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AT:
            Htk = await Savetk();
            await Tcv(false);

            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AT) {
                await Restoret(Htk);
                Gattr = await Docall(true);;
            } else if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_IDENT) {
                switch (true) {
                    case Commons_JSB2JS.Tkstr == 'REQUEST' || Commons_JSB2JS.Tkstr == 'RESPONSE' || Commons_JSB2JS.Tkstr == 'SERVER' || Commons_JSB2JS.Tkstr == 'USER' || Commons_JSB2JS.Tkstr == 'MEMBERSHIP' || Commons_JSB2JS.Tkstr == 'APPLICATION' || Commons_JSB2JS.Tkstr == 'SESSION':
                        await Restoret(Htk);
                        Gattr = await Parsevar(0, 1, '', 1);
                        if (Commons_JSB2JS.Tkstr == Commons_JSB2JS.Mobjectdelemeter || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) await Objectparse(Gattr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'SENTENCE' || Commons_JSB2JS.Tkstr == 'ERRORS' || Commons_JSB2JS.Tkstr == 'ERROR' || Commons_JSB2JS.Tkstr == 'FILENAME' || Commons_JSB2JS.Tkstr == 'FILE' || Commons_JSB2JS.Tkstr == 'PAGE' || Commons_JSB2JS.Tkstr == 'ROLES' || Commons_JSB2JS.Tkstr == 'USER':
                        await Restoret(Htk);
                        Gattr = await Parsevar(0, 1, '', 1);
                        if (Commons_JSB2JS.Tkstr == Commons_JSB2JS.Mobjectdelemeter || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) await Objectparse(Gattr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'RECORD' || Commons_JSB2JS.Tkstr == 'PROMPT' || Commons_JSB2JS.Tkstr == 'INPUT' || Commons_JSB2JS.Tkstr == 'ECHO' || Commons_JSB2JS.Tkstr == 'MV' || Commons_JSB2JS.Tkstr == 'NI' || Commons_JSB2JS.Tkstr == 'ID' || Commons_JSB2JS.Tkstr == 'NV' || Commons_JSB2JS.Tkstr == 'NB' || Commons_JSB2JS.Tkstr == 'ND' || Commons_JSB2JS.Tkstr == 'STATUS' || Commons_JSB2JS.Tkstr == 'RESTFUL_RESULT':
                        await Restoret(Htk);
                        Gattr = await Parsevar(0, 1, '', 1);
                        if (Commons_JSB2JS.Tkstr == Commons_JSB2JS.Mobjectdelemeter || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) await Objectparse(Gattr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'AM' || Commons_JSB2JS.Tkstr == 'VM' || Commons_JSB2JS.Tkstr == 'SVM' || Commons_JSB2JS.Tkstr == 'SSVM':
                        await Restoret(Htk);
                        Gattr = await Parsevar(0, 1, '', 1);
                        if (Commons_JSB2JS.Tkstr == Commons_JSB2JS.Mobjectdelemeter || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) await Objectparse(Gattr);

                        break;

                    case CBool(1):
                        // ASSUME FUNCTION CALL
                        await Restoret(Htk);
                        Gattr = await Docall(true);
                };
            } else if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
                await Tcv(false);

                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
                    await Restoret(Htk);
                    Gattr = await Docall(true);
                } else {

                    // @(X, Y)

                    Gattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                    await Typenum(Equates_JSB2JS.TYPE_VSTR, Gattr);
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                        await Tcv(false);
                        Nattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                        await Typenum(Equates_JSB2JS.TYPE_VSTR, Nattr);
                        Gattr.SYM_C = 'AtXY(' + CStr(Gattr.SYM_C) + ',' + CStr(Nattr.SYM_C) + ')';
                        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                    } else {
                        Gattr.SYM_C = 'At(' + CStr(Gattr.SYM_C) + ')';
                        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                    }
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) await Tcv(false); else await Err(') EXPECTED');
                }
            } else {
                await Err('??');
            }

            break;

        case Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN:
            await Tcv(false);
            Gattr = await Expr(Expectedtype, 1, Equates_JSB2JS.C_RPAREN);
            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RPAREN) {
                await Err(') expected');
            } else {
                await Tcv(false);
            }
            if (Index1(Equates_JSB2JS.TYPE_VSTR + Equates_JSB2JS.TYPE_CSTR + Equates_JSB2JS.TYPE_ESTR, Gattr.SYM_TYPE, 1) == 0) {
                Gattr.SYM_C = '(' + CStr(Gattr.SYM_C) + ')';
                if (Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VAR) Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;
                if (Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VNUM) Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                if (Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VSTR) Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
            }

            break;

        case CBool(1):
            await Err('Variable Identifier expected');
            return Gattr;
    }

    // CHECK FOR <EXPR{,EXPR{,EXPR}}>

    Amattr = {};
    Amattr.SYM_C = 0;
    Amattr.SYM_TYPE = Equates_JSB2JS.TYPE_CNUM;
    Amattr.SYMNAME = 0;
    Sattr = clone(Amattr); Lenattr = clone(Amattr);
    Vmattr = clone(Amattr);
    Svmattr = clone(Amattr);

    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LESS && InStr1(1, Stoptokens, Equates_JSB2JS.C_LESS) == 0) {
        Ptkno = await Peektk();
        if (Index1(Equates_JSB2JS.C_EQUAL + Equates_JSB2JS.C_LESS + Equates_JSB2JS.C_GREAT, Ptkno, 1)) return Gattr;
        Htk = await Savetk();
        await Tcv(false);

        Amattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_GREAT);

        // Must have a matching >
        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA && Commons_JSB2JS.Tkno != Equates_JSB2JS.C_GREAT) {
            await Restoret(Htk);
            return Gattr;
        }

        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
            await Tcv(false);
            Vmattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_GREAT);
            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                await Tcv(false);
                Svmattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_GREAT);
            }
        }
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_GREAT) {
            await Tcv(false);
        } else {
            await Err('"\>" Expected');
        }

        await Typestr(Equates_JSB2JS.TYPE_VSTR, Gattr);
        await Typenum(Equates_JSB2JS.TYPE_VNUM, Amattr);
        await Typenum(Equates_JSB2JS.TYPE_VNUM, Vmattr);
        await Typenum(Equates_JSB2JS.TYPE_VNUM, Svmattr);
        Gattr.SYM_C = 'Extract(' + CStr(Gattr.SYM_C) + ',' + CStr(Amattr.SYM_C) + ',' + CStr(Vmattr.SYM_C) + ',' + CStr(Svmattr.SYM_C) + ')';
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
    }

    // CHECK FOR STRING EXTRACTION [EXPR,EXPR] - NEED TO RETHINK THIS - MAYBE REMOVE IT, AS CONFLICT WITH VB6 [ARRAY] - CHANGE MY ARRAYS(X,Y) TO ARRAYS[X,Y]

    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK) {
        Htk = await Savetk();
        await Tcv(false);
        Sattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
            await Restoret(Htk);
            await Objectparse(Gattr);
            return Gattr;
        }

        await Tcv(false);
        Lenattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_RBRACK);
        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RBRACK) await Err('] expected'); else await Tcv(false);

        await Typenum(Equates_JSB2JS.TYPE_VNUM, Sattr);
        await Typenum(Equates_JSB2JS.TYPE_VNUM, Lenattr);
        await Typestr(Equates_JSB2JS.TYPE_DC, Gattr);
        Gattr.SYM_C = 'Mid1' + '(' + CStr(Gattr.SYM_C) + ', ' + CStr(Sattr.SYM_C) + ', ' + CStr(Lenattr.SYM_C) + ')';
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
    }
    return Gattr;

    // ********************************************************************************************************************
}
// </ATOM>

// <OBJECTPARSE>
async function Objectparse(Gattr) {
    // local variables
    var Hascallback, Objcall, Isatresponse, Stopon, Htk, Saveobjcall;
    var Pcnt, Iscallback, Prmlist, Cbassign, Pattr, Pname;

    await Include_JSB2JS__Comms(false)

    Hascallback = 0;
    Objcall = Gattr.SYM_C;
    Isatresponse = Objcall == 'At_Response';


    while (Commons_JSB2JS.Tkstr == Commons_JSB2JS.Mobjectdelemeter || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK) {
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;
        if (Commons_JSB2JS.Tkstr == Commons_JSB2JS.Mobjectdelemeter) {
            await Tcv(false); // Skip "."
            if (Commons_JSB2JS.Tkno < Equates_JSB2JS.C_IDENT) {
                await Err('Object\'s Method Identifier expected');
                return;
            }
            if (CBool(Isatresponse) && Commons_JSB2JS.Tkstr == 'REDIRECT') Objcall = 'return ' + CStr(Objcall);
            Objcall += '.' + CStr(Commons_JSB2JS.Otkstr);
            await Tcv(false);
        }

        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK) {
            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
                Stopon = Equates_JSB2JS.C_RPAREN;
            } else {
                Stopon = Equates_JSB2JS.C_RBRACK;
                Htk = await Savetk();
                Saveobjcall = Objcall;
            }
            Objcall += CStr(Commons_JSB2JS.Tkstr);
            await Tcv(false);
            Pcnt = 0;
            if (Null0(Commons_JSB2JS.Tkno) != Null0(Stopon)) {
                // Loop on each parameter

                while (true) {
                    Pcnt++;
                    Iscallback = Commons_JSB2JS.Tkstr == 'CALLBACK';
                    if (CBool(Iscallback)) {
                        await Tcv(false);
                        Hascallback++;
                        Prmlist = '';
                        Cbassign = '';
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
                            await Tcv(false); // Skip (
                            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RPAREN) {

                                while (true) {
                                    Pattr = await Parsevar(1, 0, CStr(Commons_JSB2JS.La) + Equates_JSB2JS.C_COMMA, 1);
                                    Pname = Pattr.SYM_C;
                                    Prmlist += '_' + CStr(Pname);
                                    Cbassign += CStr(Pname) + ' = _' + CStr(Pname) + '; ';
                                    if (Not(Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA)) break;
                                    Prmlist += ', ';
                                    await Tcv(false); // Skip ,
                                }
                            }
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) await Tcv(false); else await Err('Missing )');
                        }
                        Cbassign += 'Callbacknumber = ' + CStr(Hascallback) + '; resolve(Callbacknumber)';
                        Objcall += 'function (' + CStr(Prmlist) + ') { ' + CStr(Cbassign) + ' }';;
                    } else {
                        Pattr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Stopon);
                        if (Stopon == Equates_JSB2JS.C_RBRACK && Pattr.SYM_C == '-1') Pattr.SYM_C = CStr(Saveobjcall) + '.length';
                        Objcall += CStr(Pattr.SYM_C);
                    }
                    await SkipOverComments(false);

                    if (Not(Commons_JSB2JS.Tkstr == ',')) break;
                    await Tcv(false);
                    await SkipOverComments(false);
                    Objcall += ',';
                }

                if (Null0(Pcnt) == 2 && Stopon == Equates_JSB2JS.C_RBRACK) {
                    Objcall = Saveobjcall;
                    await Restoret(Htk);
                    break;
                }
            }

            if (Null0(Commons_JSB2JS.Tkno) == Null0(Stopon)) {
                Objcall += CStr(Commons_JSB2JS.Tkstr);
                await Tcv(false);
            } else {
                if (Stopon == Equates_JSB2JS.C_RPAREN) await Err('Missing closing symbol )'); else await Err('Missing closing symbol ]');
            }
        }
    }

    if (CBool(Hascallback)) {
        if (Commons_JSB2JS.Notasyncfunction) {
            await Err('Routines with CallBacks() can not use $options IJS');
        }
        Objcall = 'await new Promise(resolve =\> ' + CStr(Objcall) + ')';
        Pattr = await Readsym('CALLBACKNUMBER');
        if (Not(Commons_JSB2JS.Readsymfound)) await Writesym(Pattr, Pattr.SYMNAME);
        await Uses(Pattr);
        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Has a CALLBACK';
    }

    Gattr.SYM_C = Objcall;
}
// </OBJECTPARSE>

// <MAKEAFROMB_Sub>
async function JSB2JS_MAKEAFROMB_Sub(ByRef_Gattra, ByRef_Gattrb, setByRefValues) {
    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Gattra, ByRef_Gattrb)
        return v
    }
    await Include_JSB2JS__Comms(false)

    switch (true) {
        case ByRef_Gattrb.SYM_TYPE == Equates_JSB2JS.TYPE_VNUM:
            await Typenum(Equates_JSB2JS.TYPE_VNUM, ByRef_Gattra);

            break;

        default:
            await Typestr(Equates_JSB2JS.TYPE_VSTR, ByRef_Gattra);
    }
    return exit();
}
// </MAKEAFROMB_Sub>

// <MAKEBOOL>
async function Makebool(Gattr, Hardbool) {
    await Include_JSB2JS__Comms(false)

    if (Null0(Gattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_EXTERNAL) return;
    if (Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_EBOOL || Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VBOOL) return;

    if (!Hardbool) {
        if (Index1(Equates_JSB2JS.TYPE_CNUM + Equates_JSB2JS.TYPE_VNUM + Equates_JSB2JS.TYPE_ENUM + Equates_JSB2JS.TYPE_CSTR + Equates_JSB2JS.TYPE_VSTR + Equates_JSB2JS.TYPE_ESTR, Gattr.SYM_TYPE, 1)) return;
    }

    Gattr.SYM_C = 'CBool(' + CStr(Gattr.SYM_C) + ')';
    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
    return;
}
// </MAKEBOOL>

// <MAKENOT_Sub>
async function JSB2JS_MAKENOT_Sub(Gattr) {
    await Include_JSB2JS__Comms(false)

    if (Index1(Equates_JSB2JS.TYPE_VNUM + Equates_JSB2JS.TYPE_VBOOL + Equates_JSB2JS.TYPE_ENUM + Equates_JSB2JS.TYPE_CNUM + Equates_JSB2JS.TYPE_EBOOL, Gattr.SYM_TYPE, 1)) {
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
        if (InStr1(1, Gattr.SYM_C, ' ')) Gattr.SYM_C = '(' + CStr(Gattr.SYM_C) + ')';
        Gattr.SYM_C = '!' + CStr(Gattr.SYM_C);
        return;
    }

    await Typenum(Equates_JSB2JS.TYPE_VNUM, Gattr);

    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
    Gattr.SYM_C = 'Not(' + CStr(Gattr.SYM_C) + ')';
    return;
}
// </MAKENOT_Sub>

// <MAKENUM>
async function Makenum(Suggest_Type, Gattr) {
    await Include_JSB2JS__Comms(false)

    switch (true) {










































        case Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VAR:
            Gattr.SYM_C = ' +' + CStr(Gattr.SYM_C);

            // Anything that is a Variable, can receive a typing suggestion
            if (Suggest_Type != Equates_JSB2JS.TYPE_DC) {
                if (!Index1(Gattr.SYM_TYPES, Suggest_Type, 1)) {
                    Gattr.SYM_TYPES = CStr(Gattr.SYM_TYPES) + CStr(Suggest_Type);
                    await Writevsym(Gattr.SYM_TYPES, Gattr.SYMNAME, 'SYM_TYPES');
                }
            }

            // -------------- NUMERIC ------------------------
            break;

        case CBool(Index1(Equates_JSB2JS.TYPE_CNUM + Equates_JSB2JS.TYPE_VNUM + Equates_JSB2JS.TYPE_VBOOL + Equates_JSB2JS.TYPE_ENUM + Equates_JSB2JS.TYPE_EBOOL, Gattr.SYM_TYPE, 1)):
            return;

            // -------------- STRINGS------------------------
            break;

        case Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_CSTR && isEmpty(Gattr.SYM_C):
            Gattr.SYM_C = '0';
            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_CNUM;
            return;

            break;

        case CBool(Index1(Equates_JSB2JS.TYPE_CSTR + Equates_JSB2JS.TYPE_VSTR, Gattr.SYM_TYPE, 1)):
            Gattr.SYM_C = ' +' + CStr(Gattr.SYM_C);

            break;

        case CBool(1):
            // Type_exp Or String (Type_cstr:Type_vstr)
            // EXP must use CNum in case of a undefined, which +undefined turns to NaN, and we want 0
            Gattr.SYM_C = 'CNum(' + CStr(Gattr.SYM_C) + ')';

    }
    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
    return;
    // ********************************************************************************************************************
}
// </MAKENUM>

// <MAKESTR>
async function Makestr(Suggest_Type, Gattr) {
    await Include_JSB2JS__Comms(false)

    switch (true) {










































        case Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VAR:
            if (Suggest_Type != Equates_JSB2JS.TYPE_DC) {
                if (!Index1(Gattr.SYM_TYPES, Suggest_Type, 1)) {
                    Gattr.SYM_TYPES = CStr(Gattr.SYM_TYPES) + CStr(Suggest_Type);
                    await Writevsym(Gattr.SYM_TYPES, Gattr.SYMNAME, 'SYM_TYPES');
                }
            }

            break;

        case CBool(Index1(Equates_JSB2JS.TYPE_CSTR + Equates_JSB2JS.TYPE_ESTR, Gattr.SYM_TYPE, 1)):
            return;

            break;

        case Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VSTR:
            // We will ASSUME that if this code has assigned a value to this variable, it is not 'undefined'
            if (CBool(Gattr.SYM_ASSIGNED)) return;

    }

    Gattr.SYM_C = 'CStr(' + CStr(Gattr.SYM_C) + ')';
    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
    return;

}
// </MAKESTR>

// <OPTIONS>
async function Options() {
    var me = new jsbRoutine("JSB2JS", "options", "Options");
    me.localValue = function (varName) { return eval(varName) }
    // local variables
    var Forme, Notforme, Gotsomething, Ntkstr, Exitdo, Ocpgms;
    var Casesen, Holdhush, Hasexternalprefix, Optionsinternal;
    var Isexternalfunction, Isexternalsub, Pdef, Parami, Paramtypes;
    var Pattr, Docbadr, Lattr, Builddecs, Gattr, Xdefid, Ucname;
    var Isexternali;

    await dbgCheck(me, 2, true /* modal */);
    await Include_JSB2JS__Comms(false)

    await Tcv(false); // Skip $Define Or $Options

    Forme = false;
    Notforme = false;
    Gotsomething = false;


    while (Commons_JSB2JS.Tkstr) {
        Ntkstr = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1);
        Exitdo = false;

        var dblBreak2 = false;
        switch (Commons_JSB2JS.Tkstr) {
            case 'R': case 'R83':
                Commons_JSB2JS.Mr83 = Ntkstr != '-';

                break;

            case 'S': case 'SUPPRESSDEBUGGING': case 'NODEBUG':
                Commons_JSB2JS.Adddebugging = Ntkstr == '-';

                Ocpgms = Join(Commons_JSB2JS.Ocpgm, Chr(254));
                if (!Commons_JSB2JS.Adddebugging) {
                    Ocpgms = Change(Ocpgms, 'await dbgCheck(me, ', '// await dbgCheck(me,');
                }
                Commons_JSB2JS.Ocpgm = Split(Ocpgms, Chr(254));

                break;

            case '%': case 'CASESENSITIVE':
                Casesen = Ntkstr != '-';

                break;

            case 'EXPLICIT': case 'E':
                Commons_JSB2JS.Optionexplicit = Ntkstr != '-';

                break;

            case 'H': case 'HUSH':
                Commons_JSB2JS.Hush = Ntkstr != '-';

                break;

            case 'JS':
                if (Ntkstr == '-') {
                    Notforme = true;
                    Forme = false;
                    Gotsomething = true;
                    Exitdo = true;
                } else {
                    Forme = true;
                }

                break;

            case 'ASPX': case 'GAE': case 'XXX': case 'ASPX_END': case 'ASPXEND':
                Notforme = true;

                break;

            case 'JS_END': case 'JSEND': case 'JS.END':
                // NO MORE CODE IN THIS ROUTINE
                Commons_JSB2JS.Tkam = await Findendofsub(Commons_JSB2JS.Itemsrc, Commons_JSB2JS.Tkam);
                Skiprestofline();

                break;

            case 'GAE_END': case 'GAEEND': case 'JS_END': case 'JSEND':
                break;

            case ';': case '!': case '*':
                Exitdo = true;
                { dblBreak2 = true; break };

                break;

            case ',': case 'ASPXC':
                break;

            case 'ASYNC': case 'AWAIT':
                // No setByRefValuess
                Commons_JSB2JS.Notasyncfunction = Ntkstr == '-';

                break;

            case 'IJS':
                // No setByRefValuess
                Commons_JSB2JS.Notasyncfunction = Ntkstr != '-';
                Commons_JSB2JS.Byrefsnotallowed = Ntkstr != '-';
                Commons_JSB2JS.Dontmorphfunctionname = Ntkstr != '-';

                break;

            case 'EXTERNAL': case 'EXTERN': case 'INTERNAL': case 'LOCAL': case 'FUNCTION':
                Gotsomething = false;
                Exitdo = true;
                { dblBreak2 = true; break };

                break;

            default:
                Print(); debugger;
                Gotsomething = false;
                Exitdo = true;
                { dblBreak2 = true; break };
        }
        if (dblBreak2) break;
        if (CBool(Exitdo)) break;

        Gotsomething = true;
        if (Ntkstr == '-') await Tcv(false);

        Ntkstr = Left(LTrim(Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 2)), 1);
        if (Ntkstr != ',') break;
        await Tcv(false);
        await Tcv(false);
    }

    if (CBool(Gotsomething)) {
        if (CBool(Notforme) && Not(Forme)) {
            if (Not(Commons_JSB2JS.Subname)) {
                Commons_JSB2JS.Tkam = UBound(Commons_JSB2JS.Itemsrc) + 99;
            } else {
                Commons_JSB2JS.Tkam = await Findendofsub(Commons_JSB2JS.Itemsrc, Commons_JSB2JS.Tkam);
            }
            Commons_JSB2JS.Functiontype = 3; // Make Po Not Do Anything
            Holdhush = Commons_JSB2JS.Hush; Commons_JSB2JS.Hush = true;
            await Skiprestofline();
            Commons_JSB2JS.Hush = Holdhush;
            await Tcv(false);
        } else {
            await Skiprestofline();
        }
        return;
    }

    Hasexternalprefix = (Commons_JSB2JS.Tkstr == 'EXTERNAL' || Commons_JSB2JS.Tkstr == 'EXTERN');
    if (CBool(Hasexternalprefix)) await Tcv(false);

    // Allow local variable of a specific name
    Optionsinternal = (Commons_JSB2JS.Tkstr == 'JAVASCRIPT' || Commons_JSB2JS.Tkstr == 'INTERNAL' || Commons_JSB2JS.Tkstr == 'LOCAL');
    if (CBool(Optionsinternal)) await Tcv(false);

    Isexternalfunction = (Commons_JSB2JS.Tkstr == 'FUNCTION' || Commons_JSB2JS.Tkstr == 'FUNC');
    Isexternalsub = (Commons_JSB2JS.Tkstr == 'SUBROUTINE' || Commons_JSB2JS.Tkstr == 'SUB');

    if (Not(Isexternalfunction) && Not(Isexternalsub)) {
        if (CBool(Hasexternalprefix)) {
            await Typedef(Equates_JSB2JS.FLAVOR_EXTERNAL, true, Optionsinternal);
        } else {
            await Typedef(Equates_JSB2JS.FLAVOR_LOCAL, true, Optionsinternal);
        }
        return;
    }

    await Tcv(false); // Skip Function

    // ******************** CODE only for internal / external functions // ******************** 

    // Functions and subroutines that are internal or external

    Pdef = {};
    Pdef.SUB_COMPILEDATE = 'Called on ' + JSB_BF_TIMEDATE() + ' in ' + CStr(Commons_JSB2JS.Itemid);
    Pdef.SUB_ISEXTERNAL = true;
    Pdef.SUB_NOAWAITSALLOWED = (CBool(Optionsinternal) || CBool(Hasexternalprefix));

    if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_IDENT) await Err('Subroutine identifier expected');

    Pdef.SUB_CNAME = Commons_JSB2JS.Otkstr;
    Pdef.SUB_SUBNAME = Commons_JSB2JS.Tkstr;
    await Tcv(false);

    // Loop on each parameter, build PARAMTYPES

    Parami = 0;
    Paramtypes = '';
    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
        await Tcv(false);
        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RPAREN) {
            Commons_JSB2JS.La = CStr(Commons_JSB2JS.La) + Equates_JSB2JS.C_COMMA;

            while (true) {
                Parami = +Parami + 1;
                Pattr = {};
                Pattr.SYMNAME = Commons_JSB2JS.Tkstr;
                Pattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_PARAMETER;
                Pattr.SYM_C = await Makevarname(Commons_JSB2JS.Otkstr);
                Pattr.SYM_ISCONST = Docbadr;
                Pattr.SYM_ISBYVAL = (CBool(Hasexternalprefix) || CBool(Optionsinternal));

                if (Commons_JSB2JS.Tkstr == 'BYREF') {
                    Pattr.SYM_ISBYVAL = false;
                    await Tcv(false);;
                } else if (Commons_JSB2JS.Tkstr == 'BYVAL') {
                    Pattr.SYM_ISBYVAL = true;
                    await Tcv(false);;
                } else if (Commons_JSB2JS.Tkstr == 'CONST') {
                    Docbadr = 1;
                    await Tcv(false);
                } else {
                    Docbadr = 0;
                }

                if (Commons_JSB2JS.Tkno < Equates_JSB2JS.C_IDENT) await Err('Variable expected');
                await Tcv(false);

                // CHECK FOR DIM()'S

                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
                    await Tcv(false);
                    Lattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                    if (Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_CNUM || (Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_ENUM && Null0(Lattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_EQUATE)) {
                        Pattr.SYM_INDEX1 = Lattr.SYM_C;
                    } else {
                        await Err('Integer constant expected');
                    }

                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                        await Tcv(false);
                        Lattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                        if (Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_CNUM || (Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_ENUM && Null0(Lattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_EQUATE)) {
                            Pattr.SYM_INDEX2 = Lattr.SYM_C;
                        } else {
                            await Err('Integer constant expected');
                        }
                    }

                    if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RPAREN) await Err(') expected'); else await Tcv(false);
                }

                if (CBool(Pattr.SYM_ISCONST) && CBool(Pattr.SYM_INDEX1)) {
                    await Err('MAT variables can not be CONST');
                }

                await parseAStype(Pattr);

                // CHECK FOR FIXED LENGTH STRINGS[]'S

                if (Pattr.SYM_TYPE == Equates_JSB2JS.TYPE_VSTR) {
                    Pattr.SYM_STRLEN = Equates_JSB2JS.DFTSTRLEN;
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK) {
                        await Tcv(false);
                        Lattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN);
                        if (Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_CNUM || (Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_ENUM && Null0(Lattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_EQUATE)) {
                            Pattr.SYM_STRLEN = Lattr.SYM_C;
                        } else {
                            await Err('Integer constant expected');
                        }
                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RBRACK) await Err('] expected'); else await Tcv(false);
                    }
                }

                Builddecs = await Builddec(Pattr);
                Paramtypes = Replace(Paramtypes, Parami, 0, 0, UCase(Builddecs.Calldef)); // Build Calldef - ByVal - uppercase

                if (Not(Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA)) break;
                await Tcv(false);
            }
            Commons_JSB2JS.La = Mid1(Commons_JSB2JS.La, 1, Len(Commons_JSB2JS.La) - 1);
        }
        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RPAREN) await Err(') expected'); else await Tcv(false);
    }

    // return type?
    if (CBool(Isexternalfunction)) {
        Gattr = {};
        if (Commons_JSB2JS.Tkstr == 'AS') {
            await parseAStype(Gattr); // Check For As Integer, As Long, Etc.
            Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_FUNCTION;
            Gattr.SYM_ISCONST = 1; // Can't assign to function name
            Builddecs = await Builddec(Gattr); // Build Calldef
            Pdef.SUB_RTNTYPE = Builddecs.Calldef;
        } else {
            Pdef.SUB_RTNTYPE = Equates_JSB2JS.TYPE_EXP;
        }
    }

    Pdef.SUB_PARAMTYPES = Change(Paramtypes, am, ',');

    // Need to make this available in XREFS without writing to the actual file

    Xdefid = LCase(CStr(Commons_JSB2JS.Pcfname) + '_' + CStr(Pdef.SUB_SUBNAME));
    if (CBool(Isexternalfunction)) Xdefid += '_fnc'; else Xdefid += '_sub';
    Xdefid += '.def';
    Commons_JSB2JS.Cached_Xrefs[Xdefid] = Pdef;
    return;

    // Make this $options external function visible

    if (Locate(Ucname, Commons_JSB2JS.Uc_Externals_Purejs_List, 0, 0, 0, "", position => Isexternali = position)); else Isexternali = 0;

    if (CBool(Hasexternalprefix)) {
        Ucname = Pdef.SUB_CNAME;
        if (CBool(Isexternali)) {
            if (Extract(Commons_JSB2JS.Externals_Purejs_List, Isexternali, 0, 0) != Pdef.SUB_SUBNAME) {
                await Warning('You changed the name (case sensitive) declared in config_jsb2js from ' + Extract(Commons_JSB2JS.Externals_Purejs_List, Isexternali, 0, 0) + ' to ' + CStr(Pdef.SUB_SUBNAME));
            }
            Commons_JSB2JS.Uc_Externals_Purejs_List = Delete(Commons_JSB2JS.Uc_Externals_Purejs_List, Isexternali, 0, 0);
            Commons_JSB2JS.Externals_Purejs_List = Delete(Commons_JSB2JS.Externals_Purejs_List, Isexternali, 0, 0);
        }

        Commons_JSB2JS.Externals_Purejs_List = Replace(Commons_JSB2JS.Externals_Purejs_List, -1, 0, 0, Pdef.SUB_SUBNAME);
        Commons_JSB2JS.Uc_Externals_Purejs_List = Replace(Commons_JSB2JS.Uc_Externals_Purejs_List, -1, 0, 0, Ucname);
    }

    return;
}
// </OPTIONS>

// <PARSEPROGRAM>
async function Parseprogram() {
    // local variables
    var First_Subname, Truefirst_Subname, Endclause, Literalname;
    var Subtype, Scode, Gattr, A, Holdhush, Isatatfunction, Restsetup;
    var Parami, Ucifilename, Uciitemname, Commonsname, Equatesname;
    var Includesubname, Symlist, F, L, Htk;

    await Include_JSB2JS__Comms(false)

    Commons_JSB2JS.Functiontype = 0; // -1) Commons, 0) Program, 1) Subroutine, 2) function, 3) @@function (Server Only Compile), 4) Pick/RESTFUL function
    Commons_JSB2JS.Hadgosub = 0;

    First_Subname = Commons_JSB2JS.Tkstr;
    Truefirst_Subname = Commons_JSB2JS.Otkstr;

    Commons_JSB2JS.Calllist = [undefined,];
    Commons_JSB2JS.Ispickfunction = 0;
    Commons_JSB2JS.Isrestfulfunction = 0;
    Commons_JSB2JS.Ignoreerrors = 0;
    Endclause = '';
    Commons_JSB2JS.Docatalog = 0;
    Commons_JSB2JS.Paramlist = [undefined,];
    Commons_JSB2JS.Notasyncfunction = InStr1(1, Commons_JSB2JS._Options, '@');
    Commons_JSB2JS.Haspromises = [undefined,];
    Commons_JSB2JS.Haslbl = 0;

    Commons_JSB2JS.Notasyncfunction = false;
    Commons_JSB2JS.Byrefsnotallowed = false;
    Literalname = false;
    Commons_JSB2JS.Dontmorphfunctionname = false;

    await SkipOverComments(true);

    Commons_JSB2JS.Oc = '';
    Commons_JSB2JS.Blankok = 0;
    Commons_JSB2JS.Cpassthru = 0;
    Commons_JSB2JS.Lcllbl = 10000; // Local Labels
    Commons_JSB2JS.Funcattr = {};
    Commons_JSB2JS.Beforeheader = Join(Commons_JSB2JS.Ocpgm, crlf);
    if (Len(Commons_JSB2JS.Ocpgm)) Commons_JSB2JS.Beforeheader += crlf;
    Commons_JSB2JS.Ocpgm = [undefined,];

    if (Commons_JSB2JS.Tkstr == 'RESTFUL') {
        Commons_JSB2JS.Isrestfulfunction = 1;
        await Tcv(false);
        if (Commons_JSB2JS.Tkstr != 'FUNCTION') await Err('FUNCTION EXPECTED');
        Commons_JSB2JS.Tkstr = 'PROGRAM';
        Endclause = 'END FUN';;
    } else if (Commons_JSB2JS.Tkstr == 'PICK') {
        Commons_JSB2JS.Ispickfunction = 1;
        Commons_JSB2JS.Functiontype = 0; // Program
        Commons_JSB2JS.Docatalog = 1;
        await Tcv(false);
        if (Commons_JSB2JS.Tkstr != 'FUNCTION') await Err('FUNCTION EXPECTED');
        Commons_JSB2JS.Tkstr = 'PROGRAM';
        Endclause = 'END FUN';
    }

    Subtype = Commons_JSB2JS.Tkstr;
    Commons_JSB2JS.Subname = '';
    Commons_JSB2JS.Truesubname = '';
    if (Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos + 1, 1) == '\\') {
        Literalname = true;
        Commons_JSB2JS.Dontmorphfunctionname = true;
    }

    if (Commons_JSB2JS.Tkstr == 'FUNCTION' || Commons_JSB2JS.Tkstr == 'FUNC') {
        Endclause = 'END FUN';
        if (CBool(Commons_JSB2JS.Isrestfulfunction) || CBool(Commons_JSB2JS.Ispickfunction)) Commons_JSB2JS.Functiontype = 4; else Commons_JSB2JS.Functiontype = 2;

        await Tcv(false); // Skip Func


        while (true) {
            Commons_JSB2JS.Subname += Commons_JSB2JS.Tkstr;
            Commons_JSB2JS.Truesubname += CStr(Commons_JSB2JS.Otkstr);
            await Tcv(false);
            if (Not(Commons_JSB2JS.Tkstr == Commons_JSB2JS.Mobjectdelemeter)) break;
            Commons_JSB2JS.Subname += CStr(Commons_JSB2JS.Mobjectdelemeter);
            Commons_JSB2JS.Truesubname += CStr(Commons_JSB2JS.Mobjectdelemeter);
            await Tcv(false);
        }
        if (CBool(Commons_JSB2JS.Insideclass)) Commons_JSB2JS.Subname = CStr(Commons_JSB2JS.Classname) + '_' + Commons_JSB2JS.Subname;

        Commons_JSB2JS.Funcattr.SYMNAME = Commons_JSB2JS.Subname;
        await parseAStype(Commons_JSB2JS.Funcattr);
        Commons_JSB2JS.Funcattr.SYM_C = '_functionResult';
        Commons_JSB2JS.Funcattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_FUNCTION;
        Commons_JSB2JS.Funcattr.SYM_C = await Makesubname(Commons_JSB2JS.Funcattr.SYM_C);;
    } else if (Commons_JSB2JS.Tkstr == 'SUBROUTINE' || Commons_JSB2JS.Tkstr == 'SUB') {
        Endclause = 'END SUB';
        Commons_JSB2JS.Functiontype = 1;
        await Tcv(false); // Skip "SUBROUTINE"

        while (true) {
            Commons_JSB2JS.Subname += Commons_JSB2JS.Tkstr;
            Commons_JSB2JS.Truesubname += CStr(Commons_JSB2JS.Otkstr);
            await Tcv(false);
            if (Not(Commons_JSB2JS.Tkstr == Commons_JSB2JS.Mobjectdelemeter)) break;
            Commons_JSB2JS.Subname += Commons_JSB2JS.Tkstr;
            Commons_JSB2JS.Truesubname += CStr(Commons_JSB2JS.Mobjectdelemeter);
            await Tcv(false);
        }
        if (CBool(Commons_JSB2JS.Insideclass)) Commons_JSB2JS.Subname = CStr(Commons_JSB2JS.Classname) + '_' + Commons_JSB2JS.Subname;
    } else if (Commons_JSB2JS.Tkstr == 'PROGRAM') {
        Commons_JSB2JS.Functiontype = 0;
        if (Not(Endclause)) Endclause = 'END PRO';
        Commons_JSB2JS.Docatalog = 1;
        await Tcv(false); // Skip Program

        while (true) {
            Commons_JSB2JS.Subname += Commons_JSB2JS.Tkstr;
            Commons_JSB2JS.Truesubname += CStr(Commons_JSB2JS.Otkstr);
            await Tcv(false);
            if (Not(Commons_JSB2JS.Tkstr == Commons_JSB2JS.Mobjectdelemeter)) break;
            Commons_JSB2JS.Subname += Commons_JSB2JS.Tkstr;
            Commons_JSB2JS.Truesubname += CStr(Commons_JSB2JS.Mobjectdelemeter);
            await Tcv(false);
        };
    } else if (Commons_JSB2JS.Tkstr == 'COMMONS' || Commons_JSB2JS.Tkstr == 'GLOBALS') {
        Endclause = 'END ' + Left(Commons_JSB2JS.Tkstr, 3);
        Commons_JSB2JS.Functiontype = -1;
        await Tcv(false); // Skip "Globals"

        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_IDENT) {
            Commons_JSB2JS.Subname = Commons_JSB2JS.Tkstr;
            Commons_JSB2JS.Truesubname = Commons_JSB2JS.Otkstr;
            await Tcv(false);
        }
    } else {
        Commons_JSB2JS.Functiontype = 0;
        Endclause = 'END PRO';
        Commons_JSB2JS.Subname = Commons_JSB2JS.Itemid;
        Commons_JSB2JS.Truesubname = Commons_JSB2JS.Itemid;
    }

    if (Not(Literalname)) Commons_JSB2JS.Subname = await Makesubname(Commons_JSB2JS.Subname);

    // a @@function ? (SKIP - NEEDS TO BE COMPILED ON SERVER)

    if ((Commons_JSB2JS.Functiontype > 0 && Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AT)) {
        Scode = Commons_JSB2JS.Tkline;
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AT) {
            await Tcv(false);
            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AT) await Tcv(false);
            Commons_JSB2JS.Subname = Commons_JSB2JS.Tkstr;
        }

        // GET CODE

        while (Not(UCase(Left(Trim(Commons_JSB2JS.Tkline), 7)) == Endclause || Commons_JSB2JS.Tkam >= UBound(Commons_JSB2JS.Itemsrc))) {
            Commons_JSB2JS.Tkam++;
            Commons_JSB2JS.Tkline = Commons_JSB2JS.Itemsrc[Commons_JSB2JS.Tkam];
        }
        Commons_JSB2JS.Functiontype = 3;
        Commons_JSB2JS.Tkpos = 9999;
        Commons_JSB2JS.Tkno = Equates_JSB2JS.C_AM;

        await Tcv(false);

        await SkipOverComments(true);

        Commons_JSB2JS.Ocpgm = [undefined,];
        Commons_JSB2JS.Subname = '';
        return;
    }

    // Setup ME for classes

    if (CBool(Commons_JSB2JS.Insideclass)) {
        Gattr = {};
        Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_PARAMETER;
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_VAR;
        Gattr.SYM_INCLEVEL = Commons_JSB2JS._Incfile;
        Gattr.SYM_ISCONST = 0;
        Gattr.SYM_ISBYVAL = false;
        Gattr.SYMNAME = 'ME';
        Gattr.SYM_C = 'me._p1';

        await Writesym(Gattr, Gattr.SYMNAME);
    } else {
        Commons_JSB2JS.Paramlist = [undefined,]; // Built By Typedef With FLAVOR_Parameters;
    }

    // Look ahead for options NotASyncFunction ( for TYPEDEF )

    A = await Savetk();
    Holdhush = Commons_JSB2JS.Hush;
    Commons_JSB2JS.Hush = true;
    await Skiprestofline();
    await SkipOverComments(true);
    if (Commons_JSB2JS.Functiontype == 3) {
        return; // @@function Server Side Rest Funciton (Or Rejected);
    }
    await Restoret(A, true);
    Commons_JSB2JS.Hush = Holdhush;

    if (!Commons_JSB2JS.Processingtemplates) {
        Commons_JSB2JS.Ocpgm = [undefined,];
        Commons_JSB2JS.Oc = '';
    }

    if (Not(Commons_JSB2JS.Hush)) Print(Commons_JSB2JS.Truesubname);

    // PARSE POSSIBLE FUNCTION PARAMETERS

    Commons_JSB2JS.Paramlist = [undefined,];
    if (CBool(Commons_JSB2JS.Insideclass)) Commons_JSB2JS.Paramlist[Commons_JSB2JS.Paramlist.length] = 'ME';
    Commons_JSB2JS.Optionalparamcnt = 0;
    Commons_JSB2JS.Hasbyrefparamters = 0;

    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
        await Tcv(false);
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) {
            await Tcv(false);
            if (CBool(Commons_JSB2JS.Isrestfulfunction)) {
                Commons_JSB2JS.Tkline = 'Body = @Request' + CStr(Commons_JSB2JS.Mobjectdelemeter) + 'Body; '; Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                Isatatfunction = false;
            }
        } else {
            if (CBool(Commons_JSB2JS.Isrestfulfunction) || CBool(Commons_JSB2JS.Ispickfunction)) {
                Restsetup = '';
                for (Parami = 1; Parami <= 999; Parami++) {
                    if (Commons_JSB2JS.Tkstr == 'BYVAL') {
                        await Tcv(false); // All Parameters Are Considered Byval For Restful Functions;
                    }
                    Restsetup += Commons_JSB2JS.Tkstr + ' = @jsb_bf.ParamVar(\'' + Commons_JSB2JS.Tkstr + '\', ' + CStr(Parami) + '); ';
                    await Typedef(Equates_JSB2JS.FLAVOR_LOCAL, false, false);
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) await Tcv(false); else break;
                }

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RPAREN) await Err(') expected'); else await Tcv(false);

                // Re-Parse
                Commons_JSB2JS.Tkline = Restsetup;
                Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);

                Isatatfunction = false;
            } else {
                for (Parami = 1; Parami <= 999; Parami++) {
                    if (Commons_JSB2JS.Tkstr == 'OPTIONAL') {
                        await Tcv(false);
                        Commons_JSB2JS.Optionalparamcnt++;;
                    } else if (Commons_JSB2JS.Optionalparamcnt) {
                        await Err('Optional keyword expected');
                        Commons_JSB2JS.Optionalparamcnt++;;
                    }

                    if (Commons_JSB2JS.Tkstr == 'BYVAL') {
                        A = await Savetk();
                        await Tcv(false);
                        await Restoret(A);
                    } else {
                        if (Commons_JSB2JS.Byrefsnotallowed) await Err('All parameters must be defined BYVAL with $options IJS');
                        Commons_JSB2JS.Hasbyrefparamters++;
                    }

                    await Typedef(Equates_JSB2JS.FLAVOR_PARAMETER, false, false);
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) await Tcv(false); else break;
                }

                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RPAREN) await Err(') expected'); else await Tcv(false);
            }
        }
    }

    if (Commons_JSB2JS.Tkstr == 'AS') await parseAStype(Commons_JSB2JS.Funcattr);

    if (Not(Literalname)) await JSB2JS_AFTERHEADERPARSE_Sub();

    Commons_JSB2JS.Indent = 4;
    Commons_JSB2JS.Oc += Space(Commons_JSB2JS.Indent);

    if (CBool(Commons_JSB2JS.Isrestfulfunction) || CBool(Commons_JSB2JS.Ispickfunction)) {
        Gattr = {};
        Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_LOCAL;
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_VAR;
        Gattr.SYM_TYPES = Equates_JSB2JS.SYMTYPES_STORED;
        Gattr.SYM_USED = 1;
        Gattr.SYM_INCLEVEL = Commons_JSB2JS._Incfile;
        Gattr.SYM_ISCONST = 0;
        Gattr.SYM_ISBYVAL = false;
        Gattr.SYMNAME = 'RESTFUL_RESULT';
        Gattr.SYM_C = 'Restful_Result';
        await Writesym(Gattr, Gattr.SYMNAME);
    }

    if (InStr1(1, activeProcess.At_Sentence, '!')) { Print(); debugger; }

    if (Commons_JSB2JS.Globals) {
        Ucifilename = UCase(Commons_JSB2JS.Pcfname);
        Uciitemname = UCase(Commons_JSB2JS.Itemid);

        Commonsname = 'Commons_' + CStr(Ucifilename);
        Equatesname = 'Equates_' + CStr(Ucifilename);
        Includesubname = 'Include_' + CStr(Ucifilename) + '_' + await Makevarname(Commons_JSB2JS.Itemid);

        // a predefined "Commons" block?
        Symlist = Commons_JSB2JS.Incfilessrc['DICT+' + CStr(Ucifilename) + '+' + CStr(Uciitemname) + '.sym'];

        Symlist = parseJSON(Symlist);
        await Readinc(Symlist);

        // CREATE A GLOBAL SYMBOL CALLED INAME, so we know if the commons was initted
        Gattr = {};
        Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_COMMON;
        Gattr.SYM_INCLEVEL = Commons_JSB2JS._Incfile + 1;
        Gattr.SYM_ISCONST = 0;
        Gattr.SYM_ISBYVAL = false;
        Gattr.SYMNAME = Uciitemname;
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_VAR;
        F = Commons_JSB2JS.Itemid; F = await Makevarname(F);
        Gattr.SYM_C = Commonsname;
        await Writesym(Gattr, Gattr.SYMNAME);

        // Should subs & funcs check if commons is there? - yes - possible that we are called from a different project
        L = Space(Commons_JSB2JS.Indent);
        if (Commons_JSB2JS.Notasyncfunction) L += 'await ';
        L += CStr(Includesubname);
        L += '(';
        if (Commons_JSB2JS.Functiontype) L += 'false'; else L += 'true';
        L += ')';
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = L;;
    }

    if (Commons_JSB2JS.Tkstr == '{') {
        await Tcv(false);
        await states(1, '');
        if (Commons_JSB2JS.Tkstr == '}') await Tcv(false); else await Err('} expected - function ending');
    } else {
        await states(1, '');
    }

    if (CBool(Commons_JSB2JS.Isrestfulfunction) || CBool(Commons_JSB2JS.Ispickfunction)) {
        // Re-Parse
        Commons_JSB2JS.Tkline = Space(3) + 'restful_ServerExit: window.ClearScreen(); r = window.JSON.stringify(Restful_Result); cb = @paramvar(\'callback\'); if cb Then Print cb:\'(\':r:\')\': Else Print r:';
        Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
        await states(1, '');
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_END) await Tcv(false);
    }

    if (Len(Commons_JSB2JS.La) != 2) await Err('Length of LA incorrect');
    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_END) {
        Htk = await Savetk();
        await Tcv(false);
        if (Commons_JSB2JS.Tkstr == 'RESTFUL') await Tcv(false);
        if (Commons_JSB2JS.Tkstr == 'FUNCTION' || Commons_JSB2JS.Tkstr == 'SUBROUTINE' || Commons_JSB2JS.Tkstr == 'FUNC' || Commons_JSB2JS.Tkstr == 'SUB' || Commons_JSB2JS.Tkstr == 'PROGRAM' || Commons_JSB2JS.Tkstr == 'GLOBALS' || Commons_JSB2JS.Tkstr == 'COMMONS') {
            await Tcv(false);
        } else {
            await Restoret(Htk);
        }
    }

    return;
}
// </PARSEPROGRAM>

// <CSPC_TRUEFILENAME>
async function cspc_truefilename(Fname) {
    // local variables
    var Ucfname;

    await Include_JSB2JS__Comms(false)

    Ucfname = UCase(Fname);
    if (Ucfname == 'HTML') return 'JSB_HTML';
    if (Ucfname == 'BF') return 'JSB_BF';
    if (Ucfname == 'CTLS') return 'JSB_CTLS';
    if (Ucfname == 'TCL') return 'JSB_TCL';
    if (Ucfname == 'ODB') return 'JSB_ODB';
    if (Ucfname == 'THEMES') return 'JSB_THEMES';
    if (Ucfname == 'CSPC') return 'jsb2js';
    if (Ucfname == 'JSB_CSPC') return 'jsb2js';
    if (Ucfname == 'MDL') return 'JSB_MDL';
    if (Ucfname == 'DEMOS') return 'JSB_DEMOS';
    if (Null0(Ucfname) == Null0(Commons_JSB2JS.Cur_Fname)) return Commons_JSB2JS.Cur_Realfname;
    if (Null0(Ucfname) == Null0(Commons_JSB2JS.Pcfname)) return Commons_JSB2JS.Realpcfname;

    return Fname;
}
// </CSPC_TRUEFILENAME>

// <BASECONV_Sub>
async function JSB2JS_BASECONV_Sub(Fname, Iid) {
    // local variables
    var Line, Lline, Ifilename, Iitemname, Fhandle, Iitem;

    await Include_JSB2JS__Comms(false)

    var F_Temp = undefined;
    var I = undefined;

    Commons_JSB2JS.Cur_Fname = undefined;
    Commons_JSB2JS.Cur_Realfname = undefined;
    Commons_JSB2JS.Itemsrc = undefined;

    if (await JSB_ODB_OPEN('', CStr(Fname), F_Temp, function (_F_Temp) { F_Temp = _F_Temp })); else {
        Println('File not found: ', Fname);
        F_Temp = '';
        return;
    }

    Commons_JSB2JS.F_File = F_Temp;
    if (await JSB_ODB_OPEN('DICT', CStr(Fname), Commons_JSB2JS.D_File, function (_D_File) { Commons_JSB2JS.D_File = _D_File })); else {
        Println('File not found: DICT', Fname);
        return Stop();
    }

    if (await JSB_ODB_READ(Commons_JSB2JS.Itemsrc, Commons_JSB2JS.F_File, CStr(Iid), function (_Itemsrc) { Commons_JSB2JS.Itemsrc = _Itemsrc })); else {
        Println('Item not found ', Iid);
        return;
    }

    Commons_JSB2JS.Cur_Fname = Fname;
    Commons_JSB2JS.Cur_Realfname = await JSB_BF_TRUEFILENAME(CStr(Fname));
    Commons_JSB2JS.Cur_Realfname = await Makesubname(Commons_JSB2JS.Cur_Realfname);

    // Setup new program file & itemid

    Commons_JSB2JS.Itemid = Iid;

    Commons_JSB2JS.Supress = 0;
    Commons_JSB2JS.Tkline = '';
    Commons_JSB2JS.Tkam = 0;
    Commons_JSB2JS.Tkpos = 0;
    Commons_JSB2JS.Tkno = Equates_JSB2JS.C_AM;
    Commons_JSB2JS.Lineno = 1;

    Commons_JSB2JS.Incfilessrc = {};

    Commons_JSB2JS.Itemsrc = CleanupText(Commons_JSB2JS.Itemsrc);
    Commons_JSB2JS.Itemsrc = Split(Commons_JSB2JS.Itemsrc, Chr(254));

    // read all include files

    for (Line of iterateOver(Commons_JSB2JS.Itemsrc)) {
        Lline = LTrim(Line);
        Commons_JSB2JS.Tkstr = UCase(Field(Lline, ' ', 1));
        if (Commons_JSB2JS.Tkstr == '*') {
            Lline = LTrim(dropLeft(CStr(Lline), ' '));
            Commons_JSB2JS.Tkstr = UCase(Field(Lline, ' ', 1));
        }

        if (Commons_JSB2JS.Tkstr == 'INCLUDE' || Commons_JSB2JS.Tkstr == '$INCLUDE' || Commons_JSB2JS.Tkstr == 'INSERT' || Commons_JSB2JS.Tkstr == '$INSERT') {
            Ifilename = UCase(Field(Lline, ' ', 2));
            Iitemname = UCase(Field(Lline, ' ', 3));
            if (Not(Iitemname)) {
                Iitemname = Ifilename;
                Ifilename = UCase(Commons_JSB2JS.Cur_Fname);
            }

            if (await JSB_ODB_OPEN('', CStr(Ifilename), Fhandle, function (_Fhandle) { Fhandle = _Fhandle })) {
                if (await JSB_ODB_READ(Iitem, Fhandle, CStr(Iitemname), function (_Iitem) { Iitem = _Iitem })) {
                    Commons_JSB2JS.Incfilessrc[CStr(Ifilename) + '+' + CStr(Iitemname)] = Iitem;
                }
            }

            if (await JSB_ODB_OPEN('dict', CStr(Ifilename), Fhandle, function (_Fhandle) { Fhandle = _Fhandle })) {
                if (await JSB_ODB_READ(Iitem, Fhandle, CStr(Iitemname) + '.sym', function (_Iitem) { Iitem = _Iitem })) {
                    Iitem = CleanupText(CStr(Iitem));
                    Commons_JSB2JS.Incfilessrc['DICT+' + CStr(Ifilename) + '+' + CStr(Iitemname) + '.sym'] = Iitem;
                }
            }
        }
    }

    await Tcv(false);

    return;
}
// </BASECONV_Sub>

// <INCFILE>
async function Incfile(Ifilename, Iitemname) {
    // local variables
    var Ucifilename, Uciitemname, Commonsname, Equatesname, Includesubname;
    var Symlist, Gattr, F, Hitemsrc, Holdpgm, Hfname, Hcur_Realfname;
    var Hiname, Svtk, Hadlbl, Hadddebugging, Hhardcode, D_Ifile;
    var Header, Src, Cmns, Thesetypes, Id, I;

    await Include_JSB2JS__Comms(false)

    // Setup new program file & itemid

    // Is this a commons / equate only file? Do a quick read

    // read commons_Symtab from D_file, Subname:".SYM" Else Stop @Errors

    Ucifilename = UCase(Ifilename);
    Uciitemname = UCase(Iitemname);

    Commonsname = 'Commons_' + CStr(Ucifilename);
    Equatesname = 'Equates_' + CStr(Ucifilename);
    Includesubname = 'Include_' + CStr(Ucifilename) + '_' + await Makevarname(Iitemname);

    // a predefined "Commons" block?
    Symlist = Commons_JSB2JS.Incfilessrc['DICT+' + CStr(Ucifilename) + '+' + CStr(Uciitemname) + '.sym'];

    if (CBool(Symlist) && (Commons_JSB2JS.Functiontype == -1 || Commons_JSB2JS.Functiontype > 0)) {
        Symlist = parseJSON(Symlist);
        await Readinc(Symlist);

        // CREATE A GLOBAL SYMBOL CALLED INAME, so we know if the commons was initted
        Gattr = {};
        Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_COMMON;
        Gattr.SYM_INCLEVEL = Commons_JSB2JS._Incfile + 1;
        Gattr.SYM_ISCONST = 0;
        Gattr.SYM_ISBYVAL = false;
        Gattr.SYMNAME = Uciitemname;
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_VAR;
        F = Iitemname; F = await Makevarname(F);
        Gattr.SYM_C = Commonsname;
        await Writesym(Gattr, Gattr.SYMNAME);

        // Should subs & funcs check if commons is there? - yes - possible that we are called from a different project
        if (Commons_JSB2JS.Notasyncfunction) {
            Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + CStr(Includesubname) + '(false)';
        } else {
            Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + 'await ' + CStr(Includesubname) + '(false)';
        }
        return;
    }

    // Only a functionType = 0 (PROGRAM) from here on
    // Save current stuff
    if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
    Hitemsrc = Commons_JSB2JS.Itemsrc;
    Holdpgm = Commons_JSB2JS.Ocpgm; Commons_JSB2JS.Ocpgm = [undefined,];

    Hfname = Commons_JSB2JS.Cur_Fname;
    Hcur_Realfname = Commons_JSB2JS.Cur_Realfname;
    Hiname = Commons_JSB2JS.Itemid;
    Svtk = await Savetk();
    Hadlbl = Commons_JSB2JS.Haslbl;
    Hadddebugging = Commons_JSB2JS.Adddebugging;
    Hhardcode = Commons_JSB2JS.Hardcode;

    Commons_JSB2JS.Itemsrc = Commons_JSB2JS.Incfilessrc[CStr(Ucifilename) + '+' + CStr(Uciitemname)];
    if (Not(Commons_JSB2JS.Itemsrc)) {
        Commons_JSB2JS.Itemsrc = Hitemsrc;
        await Err('Missing include file: ' + CStr(Ifilename) + ' ' + CStr(Iitemname));
        return;
    }

    if (Not(Commons_JSB2JS.Hush)) { Print('; Incfile: ', Ifilename, ' ', Iitemname, ' '); }
    Commons_JSB2JS._Incfile++;

    // Setup new source
    Commons_JSB2JS.Adddebugging = 0;
    Commons_JSB2JS.Cur_Fname = LCase(Ifilename);
    Commons_JSB2JS.Cur_Realfname = await cspc_truefilename(Ifilename);
    Commons_JSB2JS.Cur_Realfname = await Makesubname(Commons_JSB2JS.Cur_Realfname);
    Commons_JSB2JS.Itemid = LCase(Iitemname);

    Commons_JSB2JS.Itemsrc = Split(Commons_JSB2JS.Itemsrc, Chr(254));
    Commons_JSB2JS.Tkline = '';
    Commons_JSB2JS.Tkam = 0;
    Commons_JSB2JS.Tkpos = 0;
    Commons_JSB2JS.Tkno = Equates_JSB2JS.C_AM;
    Commons_JSB2JS.Lineno = 1;
    Commons_JSB2JS.Haslbl = 0;
    Commons_JSB2JS.Hardcode = 0;

    // Prime
    await Tcv(false);
    await states(1, '');
    if (!(Index1(Equates_JSB2JS.C_END + Equates_JSB2JS.C_SM, Commons_JSB2JS.Tkno, 1))) await Err('End of commons expected');

    if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }

    if (await JSB_ODB_OPEN('dict', CStr(Ifilename), D_Ifile, function (_D_Ifile) { D_Ifile = _D_Ifile })); else return Stop(activeProcess.At_Errors);

    // can I make this a seperate file?
    if (Commons_JSB2JS.Haslbl == 0 && !Commons_JSB2JS.Hardcode) {
        // No real code - only definitions
        Header = [undefined, 'async function ' + CStr(Includesubname) + '(forceReset) {'];
        Header[Header.length] = (Space(Commons_JSB2JS.Indent) + 'forceReset |= (typeof ' + CStr(Commonsname) + ' == "undefined") || (typeof ' + CStr(Equatesname) + ' == "undefined"); ');
        Header[Header.length] = Space(Commons_JSB2JS.Indent) + 'if (!forceReset) return; ';
        Header[Header.length] = '';
        Header[Header.length] = Space(Commons_JSB2JS.Indent) + 'var me = new jsbRoutine("' + CStr(Ifilename) + '", "' + CStr(Ifilename) + '.js", "' + CStr(Includesubname) + '"); me.localValue = function (varName) { return eval(varName) }; ';
        Header[Header.length] = Space(Commons_JSB2JS.Indent) + CStr(Commonsname) + ' = {}; ';
        Header[Header.length] = Space(Commons_JSB2JS.Indent) + CStr(Equatesname) + ' = {}; ';
        Header[Header.length] = '';

        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + 'return true; ';
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = '}';

        Src = Join(Header, crlf) + Join(Commons_JSB2JS.Ocpgm, crlf);
        await JSB2JS_UPDATEJSCODE_Sub(Src, Commons_JSB2JS.Pcfname, Includesubname, '', function (_Src, _Pcfname, _Includesubname, _P4) { Src = _Src; Commons_JSB2JS.Pcfname = _Pcfname; Includesubname = _Includesubname });

        Cmns = {};
        Thesetypes = ' ' + CStr(Equates_JSB2JS.FLAVOR_COMMON) + CStr(Equates_JSB2JS.FLAVOR_FUNCTION) + CStr(Equates_JSB2JS.FLAVOR_EQUATE) + CStr(Equates_JSB2JS.FLAVOR_EXTERNAL);
        for (Id of iterateOver(Commons_JSB2JS.Symtab)) {
            Gattr = Commons_JSB2JS.Symtab[Id];
            if (InStr1(1, Thesetypes, Gattr.SYM_FLAVOR) > 1) Cmns[Id] = Gattr;
        }

        if (await JSB_ODB_WRITEJSON(Cmns, D_Ifile, CStr(Iitemname) + '.sym')); else return Stop(activeProcess.At_Errors);
        Commons_JSB2JS.Incfilessrc['DICT+' + CStr(Ucifilename) + '+' + CStr(Uciitemname) + '.sym'] = Cmns;

        // Restore previous source
        Commons_JSB2JS.Ocpgm = Holdpgm;
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = '';
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = '    await ' + CStr(Includesubname) + '(true); ';
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = '';
    } else {
        Holdpgm[Holdpgm.length] = '    // Include ' + CStr(Ifilename) + ' ' + CStr(Iitemname);
        var _ForEndI_86 = UBound(Commons_JSB2JS.Ocpgm);
        for (I = 1; I <= _ForEndI_86; I++) {
            Holdpgm[Holdpgm.length] = Commons_JSB2JS.Ocpgm[I];
        }
        Commons_JSB2JS.Ocpgm = Holdpgm;
    }

    Holdpgm = '';
    Commons_JSB2JS.Haslbl += +Hadlbl;

    Commons_JSB2JS.Cur_Fname = Hfname;
    Commons_JSB2JS.Itemid = Hiname;
    Commons_JSB2JS.Itemsrc = Hitemsrc;
    Commons_JSB2JS.Cur_Realfname = Hcur_Realfname;
    await Restoret(Svtk, true);
    Commons_JSB2JS.Adddebugging = Hadddebugging;
    Commons_JSB2JS.Hardcode = Hhardcode;

    Commons_JSB2JS._Incfile--;

    return;
}
// </INCFILE>

// <SKIPRESTOFLINE>
async function Skiprestofline() {
    var me = new jsbRoutine("JSB2JS", "PARSEPROGRAM", "Skiprestofline");
    me.localValue = function (varName) { return eval(varName) }
    // local variables
    var Restofline;

    await dbgCheck(me, 621, true /* modal */);
    await Include_JSB2JS__Comms(false)

    if (Commons_JSB2JS.Tkpos != 99999) {
        if (Commons_JSB2JS.Processingtemplates && Not(Commons_JSB2JS.Hush)) {
            Restofline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 9999);
            Commons_JSB2JS.Oc = CStr(Commons_JSB2JS.Oc) + CStr(Restofline);
            if (Trim(Restofline) || Trim(Commons_JSB2JS.Tkstr)) {
                Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = CStr(Commons_JSB2JS.Tkstr) + CStr(Restofline);
            }
        }

        Commons_JSB2JS.Tkpos = 99999; Commons_JSB2JS.Tkno = Equates_JSB2JS.C_AM;
        if (Trim(Commons_JSB2JS.Oc) && Not(Commons_JSB2JS.Hush)) Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc;
        Commons_JSB2JS.Oc = Space(Commons_JSB2JS.Indent);

        if (Commons_JSB2JS._Incfile == 0 && Commons_JSB2JS.Adddebugging && !Commons_JSB2JS.Notasyncfunction) {
            Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + 'await dbgCheck(me, ' + CStr(Commons_JSB2JS.Tkam + 1) + '); '; // Tkam+1 Because this Is Preceeding The Next Line;
        }

        if (Commons_JSB2JS.Tkam % 10 == 0 && Not(Commons_JSB2JS.Hush)) Print('-');
        if (System(1) == 'js') FlushHTML();
    }
}
// </SKIPRESTOFLINE>

// <FINDENDOFSUB>
async function Findendofsub(Src, Startlineno) {
    // local variables
    var Srca, Linei, Line, F1, F2;

    await Include_JSB2JS__Comms(false)

    Srca = Split(UCase(Src), Chr(254));
    var _ForEndI_94 = UBound(Srca);
    for (Linei = +Startlineno + 1; Linei <= _ForEndI_94; Linei++) {
        Line = Srca[Linei];
        if (Left(Line, 1) == ' ') Line = Mid1(Line, 2);
        F1 = Field(Line, ' ', 1);
        if (F1 == 'SUBROUTINE' || F1 == 'FUNCTION' || F1 == 'PROGRAM' || F1 == 'FUNC' || F1 == 'SUB' || F1 == 'COMMONS' || F1 == 'GLOBALS') return +Linei - 1;
        if (F1 == 'END') {
            F2 = Field(Line, ' ', 2);
            if (F2 == 'SUBROUTINE' || F2 == 'FUNCTION' || F2 == 'PROGRAM' || F2 == 'FUNC' || F2 == 'SUB' || F2 == 'COMMONS' || F2 == 'GLOBALS') return Linei;
        }
    }
    return Linei;
}
// </FINDENDOFSUB>

// <SKIPOVERCOMMENTS>
async function SkipOverComments(Includestringmarker) {
    // local variables
    var Skipper, Specials, Ntkstr, L, Ll;

    await Include_JSB2JS__Comms(false)

    Skipper = Equates_JSB2JS.C_AM + Equates_JSB2JS.C_ASTERISK + Equates_JSB2JS.C_BANG + Equates_JSB2JS.C_DBLSLASH + Equates_JSB2JS.C_CMTBLOCK;
    if (CBool(Includestringmarker)) Skipper += Equates_JSB2JS.C_STR;

    Specials = [undefined, '$DEFINE', '$OPTIONS', '$OPTION'];


    while (Index1(Skipper, Commons_JSB2JS.Tkno, 1)) {
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ASTERISK) {
            Ntkstr = UCase(Field(LTrim(Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 20)), ' ', 1));
            if (Locate(Ntkstr, Specials, 0, 0, 0, "", position => { })) {
                await Tcv(false);
                await Options();
            } else {
                await Skiprestofline();
            }
        } else if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_BANG || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_STR || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_DBLSLASH) {

            await Skiprestofline();;
        } else {
            if (Commons_JSB2JS.Processingtemplates && Not(Commons_JSB2JS.Hush)) {
                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AM) {
                    L = UBound(Commons_JSB2JS.Ocpgm);
                    Ll = Commons_JSB2JS.Ocpgm[L];
                    if (Ll == '\<!!\>') {
                        Commons_JSB2JS.Ocpgm.delete(L);
                    } else {
                        Commons_JSB2JS.Ocpgm[+L + 1] = CStr(Commons_JSB2JS.Ocpgm[+L + 1]) + '';
                    }
                }
            }

            await Tcv(false);
            if (Locate(Commons_JSB2JS.Tkstr, Specials, 0, 0, 0, "", position => { })) await Options();
        }
    }
}
// </SKIPOVERCOMMENTS>

// <RESETGLOBALOPTS>
async function ResetGlobalOpts() {
    await Include_JSB2JS__Comms(false)

    Commons_JSB2JS.Addcmt = false;
    Commons_JSB2JS.Showlist = false;
    Commons_JSB2JS.Mr83 = false;
    Commons_JSB2JS.Optionexplicit = false;
    Commons_JSB2JS.Adddebugging = System(1) == 'js';
    Commons_JSB2JS.Hush = false;

    Commons_JSB2JS.Processingtemplates = (Commons_JSB2JS.Pcfname == 'jsb_viewtemplates' || Commons_JSB2JS.Pcfname == 'jsb_pagetemplates');

    if (InStr1(1, Commons_JSB2JS._Options, 'T')) Commons_JSB2JS.Processingtemplates = true;
    if (InStr1(1, Commons_JSB2JS._Options, 'L')) Commons_JSB2JS.Showlist = true;
    if (InStr1(1, Commons_JSB2JS._Options, 'R')) Commons_JSB2JS.Mr83 = InStr1(1, Commons_JSB2JS._Options, 'R');
    if (InStr1(1, Commons_JSB2JS._Options, 'E')) Commons_JSB2JS.Optionexplicit = true;
    if (InStr1(1, Commons_JSB2JS._Options, 'S')) Commons_JSB2JS.Adddebugging = System(1) != 'js';
    if (InStr1(1, Commons_JSB2JS._Options, 'H')) Commons_JSB2JS.Hush = true;
    if (InStr1(1, Commons_JSB2JS._Options, 'C')) Commons_JSB2JS.Addcmt = true;

    if (InStr1(1, Commons_JSB2JS._Options, 'T-')) Commons_JSB2JS.Processingtemplates = false;
    if (InStr1(1, Commons_JSB2JS._Options, 'L-')) Commons_JSB2JS.Showlist = false;
    if (InStr1(1, Commons_JSB2JS._Options, 'S-')) Commons_JSB2JS.Adddebugging = true;
    if (InStr1(1, Commons_JSB2JS._Options, 'R-')) Commons_JSB2JS.Mr83 = false;
    if (InStr1(1, Commons_JSB2JS._Options, 'H-')) Commons_JSB2JS.Hush = false;
    if (InStr1(1, Commons_JSB2JS._Options, 'E-')) Commons_JSB2JS.Optionexplicit = false;
    if (InStr1(1, Commons_JSB2JS._Options, 'C-')) Commons_JSB2JS.Addcmt = false;

    if (Commons_JSB2JS.Mr83) Commons_JSB2JS.Mobjectdelemeter = ('|'); else Commons_JSB2JS.Mobjectdelemeter = '.';
    if (Commons_JSB2JS.Mr83) Commons_JSB2JS.Simplestrings = true; else Commons_JSB2JS.Simplestrings = false;
}
// </RESETGLOBALOPTS>

// <LDDYNADR>
async function Lddynadr() {
    // local variables
    var Avs, Lattr;

    await Include_JSB2JS__Comms(false)

    // CHECK FOR <PARSEVAR{,PARSEVAR{,PARSEVAR}}>

    Avs = '';
    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LESS) {
        await Tcv(false);
        Lattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_GREAT);
        await Typenum(Equates_JSB2JS.TYPE_VNUM, Lattr);
        Avs = Lattr.SYM_C;
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
            await Tcv(false);
            Lattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_GREAT);
            await Typenum(Equates_JSB2JS.TYPE_VNUM, Lattr);
            Avs = CStr(Avs) + ',' + CStr(Lattr.SYM_C);
            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                await Tcv(false);
                Lattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_GREAT);
                await Typenum(Equates_JSB2JS.TYPE_VNUM, Lattr);
                Avs = CStr(Avs) + ',' + CStr(Lattr.SYM_C);
            } else {
                Avs = CStr(Avs) + ',' + '0';
            }
        } else {
            Avs = CStr(Avs) + ',' + '0' + ',' + '0';
        }
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_GREAT) {
            await Tcv(false);
        } else {
            await Err('"\>" Expected');
        }
    }
    return Avs;

    // ********************************************************************************************************************
}
// </LDDYNADR>

// <READSYM>
async function Readsym(Symname) {
    // local variables
    var Rec;

    await Include_JSB2JS__Comms(false)

    Rec = Commons_JSB2JS.Symtab[Symname];
    if (Not(Rec)) {
        Rec = await Definesym(Symname, false);
        Commons_JSB2JS.Readsymfound = 0;
        if (CBool(Commons_JSB2JS.Optionexplicit)) await Warning('SYMBOL \'' + CStr(Symname) + '\' NOT DEFINED');
        return Rec;
    }
    Commons_JSB2JS.Readsymfound = 1;
    return clone(Rec);
}
// </READSYM>

// <DEFINESYM>
async function Definesym(Symname, Isused) {
    // local variables
    var Rec, Sname;

    await Include_JSB2JS__Comms(false)

    Rec = {};
    if (isEmpty(Symname)) return Rec;
    Rec.SYMNAME = Symname;
    Rec.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_LOCAL;
    Rec.SYM_INDEX1 = '';
    Rec.SYM_INDEX2 = '';
    Rec.isDefinedInOutput = Isused;

    Rec.SYM_INCLEVEL = Commons_JSB2JS._Incfile;
    // 1) Commons, 0) Program, 1) Subroutine, 2) function, 3) @@function (Server Only Compile), 4) Pick/RESTFUL function
    if (Commons_JSB2JS.Functiontype >= 2 && Null0(Symname) == Null0(Commons_JSB2JS.Subname)) {
        Rec.SYM_TYPE = Commons_JSB2JS.Funcattr.SYM_TYPE;
    } else {
        Rec.SYM_TYPE = Equates_JSB2JS.TYPE_VAR;
    }
    Sname = Symname;
    Sname = await Makevarname(Sname);
    if (Commons_JSB2JS.Byrefsnotallowed) {
        if (Null0(Commons_JSB2JS.Tkstr) == Null0(Symname)) Rec.SYM_C = Commons_JSB2JS.Otkstr; else Rec.SYM_C = Symname;
    } else {
        Rec.SYM_C = Sname;
    }

    if (CBool(Isused)) {
        Rec.SYM_USED = true;
        Rec.SYM_TYPES = Equates_JSB2JS.SYMTYPES_STORED;
    }

    return Rec;
}
// </DEFINESYM>

// <WRITESYM>
async function Writesym(Rec, Symname) {
    await Include_JSB2JS__Comms(false)

    Commons_JSB2JS.Symtab[Symname] = clone(Rec);
    return;

    // ********************************************************************************************************************
}
// </WRITESYM>

// <WRITEVSYM>
async function Writevsym(Value, Symname, Tag) {
    // local variables
    var Rec;

    await Include_JSB2JS__Comms(false)

    if (Not(Symname)) return;
    Rec = Commons_JSB2JS.Symtab[Symname];
    if (Not(Rec)) return;
    Rec[Tag] = Value;
    Commons_JSB2JS.Symtab[Symname] = Rec;
    return;

    // ********************************************************************************************************************
    // Valid interchangeable characters are: 
    // s (string), v (variant), b (boolean), n (real/number), i (integer), j (json), a (array), ? (object), l (select-list)

    // result.Calldef: this is used to define the type of a parameter
    // result.Var:     name to define (used in js)
    // result.Cinit:   init for local variables

}
// </WRITEVSYM>

// <BUILDDEC>
async function Builddec(Sattr) {
    // local variables
    var Result;

    await Include_JSB2JS__Comms(false)

    Result = {};
    Result.Var = Trim(Sattr.SYM_C);
    Result.Cinit = '';

    switch (true) {
        case Sattr.SYM_TYPE == Equates_JSB2JS.TYPE_CNUM || Sattr.SYM_TYPE == Equates_JSB2JS.TYPE_VNUM || Sattr.SYM_TYPE == Equates_JSB2JS.TYPE_ENUM || Sattr.SYM_TYPE == Equates_JSB2JS.TYPE_EBOOL:
            if (CBool(Sattr.SYM_ISCONST)) Result.Calldef = Equates_JSB2JS.TYPE_ENUM; else Result.Calldef = Equates_JSB2JS.TYPE_VNUM;
            Result.Cinit = '0';

            break;

        case CBool(Sattr.SYM_ISCONST):
            // All Strings (Type_cnum constants handled above)
            Result.Calldef = Equates_JSB2JS.TYPE_CSTR;

            break;

        case Sattr.SYM_TYPE == Equates_JSB2JS.TYPE_CSTR || Sattr.SYM_TYPE == Equates_JSB2JS.TYPE_VSTR || Sattr.SYM_TYPE == Equates_JSB2JS.TYPE_ESTR:
            Result.Calldef = Equates_JSB2JS.TYPE_VSTR;
            Result.Cinit = '\'\'';

            break;

        case CBool(1):
            Result.Calldef = Equates_JSB2JS.TYPE_VAR;

    }

    if (!isEmpty(Sattr.SYM_INDEX1)) {
        if (Not(Result.Cinit)) Result.Cinit = 'null';
        if (CBool(Sattr.SYM_INDEX2)) Result.Cinit = 'createArray(' + CStr(Result.Cinit) + ', ' + CStr(Sattr.SYM_INDEX1) + ', ' + CStr(Sattr.SYM_INDEX2) + ')'; else Result.Cinit = 'createArray(' + CStr(Result.Cinit) + ', ' + CStr(Sattr.SYM_INDEX1) + ')';
        Result.Calldef = 'M' + CStr(Sattr.SYM_INDEX1) + 'X' + CStr(Sattr.SYM_INDEX2) + CStr(Result.Calldef);
    }

    if (Null0(Sattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_EQUATE && Null0(Sattr.SYM_INCLEVEL) == -1) {
        Result.Cinit = ' = ' + CStr(Sattr.SYM_EQUATE);;
    } else if (Len(Result.Cinit)) {
        Result.Cinit = ' = ' + CStr(Result.Cinit);
    }

    return Result;
}
// </BUILDDEC>

// <USELBL>
async function Uselbl(Lbl) {
    // local variables
    var Linkrec;

    await Include_JSB2JS__Comms(false)

    Linkrec = await Readsym('%%' + CStr(Lbl));
    if (Not(Commons_JSB2JS.Readsymfound)) {
        Linkrec = {};
        Linkrec.SYMNAME = '%%' + CStr(Lbl);
        Linkrec.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_GOTOLBL;
        Linkrec.SYM_TYPE = Equates_JSB2JS.SYMTYPES_TEMP;
        Linkrec.SYM_INCLEVEL = 0;
        await Writesym(Linkrec, '%%' + CStr(Lbl));
    }
    return;

    // ********************************************************************************************************************
}
// </USELBL>

// <DEFLBL>
async function Deflbl(Lbl, Userlbl) {
    // local variables
    var Linkrec;

    await Include_JSB2JS__Comms(false)

    if (CBool(Userlbl)) {
        Linkrec = await Readsym('%%' + CStr(Lbl));
        if (Not(Commons_JSB2JS.Readsymfound)) { Linkrec = { "SYM_INCLEVEL": 0 } }

        if (CBool(Linkrec.SYM_USED)) await Err('Duplicate lable');

        Linkrec.SYM_USED = 1;
        Linkrec.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_GOTOLBL;
        Linkrec.SYM_TYPE = Equates_JSB2JS.SYMTYPES_TEMP;
        Linkrec.SYMNAME = '%%' + CStr(Lbl);

        await Writesym(Linkrec, '%%' + CStr(Lbl));
    }

    Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent - 4) + 'case "' + CStr(Lbl) + '": ' + Chr(254) + Space(Commons_JSB2JS.Indent));

    if (InStr1(1, Commons_JSB2JS._Options, '@')) {
        await Warning('LABEL DEFINED HERE ' + CStr(Lbl));
    } else {
        Commons_JSB2JS.Haslbl = 1;
    }

    return;

}
// </DEFLBL>

// <PASSTHRUJAVASCRIPT>
async function PassThruJavascript() {
    // local variables
    var Contents, Lpcnt, Oline, C, C2, Oktotrim, Lline;

    // SKIP FROM { TO } AND RETURN CONTENTS
    // TKSTR SHOULD BE "{" ON ENTERING THIS ROUTINE

    await Include_JSB2JS__Comms(false)

    Contents = [undefined,];
    Lpcnt = 1;
    Oline = Commons_JSB2JS.Otkstr;


    do {
        C = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1);
        Commons_JSB2JS.Tkpos++;
        Oline = CStr(Oline) + CStr(C);

        if (isEmpty(C)) {
            Commons_JSB2JS.Tkam++;
            Contents[Contents.length] = Oline;
            Oline = '';
            if (Commons_JSB2JS.Tkam > UBound(Commons_JSB2JS.Itemsrc)) {
                await Err('Missing } terminator');
                break;
            }
            Commons_JSB2JS.Tkline = Commons_JSB2JS.Itemsrc[Commons_JSB2JS.Tkam];
            Commons_JSB2JS.Tkpos = 1;;
        } else if (C == '{') {
            Lpcnt = +Lpcnt + 1;;
        } else if (C == '}') {
            Lpcnt = +Lpcnt - 1;
            if (Null0(Lpcnt) == '0') {
                break; // Done!;
            }
        } else if (C == '\'' || C == '"' || C == '`') {

            do {
                C2 = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1);
                Commons_JSB2JS.Tkpos++;
                Oline = CStr(Oline) + CStr(C2);

                if (Null0(C2) == Null0(C)) break;
                if (isEmpty(C2)) {
                    if (C != '`') {
                        if (C == '"') await Err('Missing string ' + CStr(C) + ' terminator');
                        break;
                    }
                    Commons_JSB2JS.Tkam++;
                    Contents[Contents.length] = Oline;
                    Oline = '';
                    if (Commons_JSB2JS.Tkam > UBound(Commons_JSB2JS.Itemsrc)) {
                        await Err('Missing } terminator');
                        break;
                    }
                    Commons_JSB2JS.Tkline = Commons_JSB2JS.Itemsrc[Commons_JSB2JS.Tkam];
                    Commons_JSB2JS.Tkpos = 1;
                }
            }
            while (1);
        }// Strings;;
    }
    while (1);
    await Tcv(false);

    Oktotrim = true;
    if (Trim(Oline) == '}') {
        Lline = Contents[UBound(Contents)];
        if (InStr1(1, Lline, '//')) Oktotrim = false;
    }

    Contents[Contents.length] = Oline;
    Contents = RTrim(LTrim(Join(Contents, crlf)));

    if (Left(Contents, 1) == '{' && Right(Contents, 1) == '}') {
        Contents = LTrim(Mid1(Contents, 2, Len(Contents) - 2));
        if (CBool(Oktotrim)) Contents = RTrim(Contents);
    }

    return Contents;
}
// </PASSTHRUJAVASCRIPT>

// <INCLUDE_JSB2JS__COMMS>
async function Include_JSB2JS__Comms(forceReset) {
    forceReset |= (typeof Commons_JSB2JS == "undefined") || (typeof Equates_JSB2JS == "undefined");
    if (!forceReset) return;

    var me = new jsbRoutine("jsb2js", "jsb2js.js", "Include_JSB2JS__Comms"); me.localValue = function (varName) { return me[varName] };
    Commons_JSB2JS = {};
    Equates_JSB2JS = {};
    // AM is expanded inline as Chr(254);// VM is expanded inline as Chr(253);// SVM is expanded inline as Chr(252);
    // TAB is expanded inline as Chr(9);
    Equates_JSB2JS.DFTSTRLEN = 'StringSize';

    // ENUM OF FLAVOR_TYPES

    Equates_JSB2JS.FLAVOR_PARAMETER = 1;
    Equates_JSB2JS.FLAVOR_EQUATE = 2;
    Equates_JSB2JS.FLAVOR_COMMON = 3;
    Equates_JSB2JS.FLAVOR_GOTOLBL = 4;
    Equates_JSB2JS.FLAVOR_TEMP = 5;
    Equates_JSB2JS.FLAVOR_LOCAL = 6;
    Equates_JSB2JS.FLAVOR_EXTERNAL = 7;
    Equates_JSB2JS.FLAVOR_FUNCTION = 8;

    // SYM_TYPE (EXPRESSION ARE UPPERCASE FOR READABILITY)
    // (VARIABLES  ARE LOWERCASE FOR READABILITY)

    // -------------- Variant VARIABLE ------------------------
    Equates_JSB2JS.TYPE_VAR = 'v';
    Equates_JSB2JS.TYPE_EXP = '?';

    // -------------- Numbers ------------------------
    Equates_JSB2JS.TYPE_CNUM = 'c';
    Equates_JSB2JS.TYPE_VNUM = 'n';
    Equates_JSB2JS.TYPE_ENUM = 'N';
    Equates_JSB2JS.TYPE_VBOOL = 'b';
    Equates_JSB2JS.TYPE_EBOOL = 'B';

    // -------------- STRINGS (SIZED) ------------------------
    Equates_JSB2JS.TYPE_CSTR = 'S';
    Equates_JSB2JS.TYPE_VSTR = 's';
    Equates_JSB2JS.TYPE_ESTR = '$';

    Equates_JSB2JS.TYPE_DC = '-';

    // SYM_TYPES

    Equates_JSB2JS.SYMTYPES_STORED = '7';
    Equates_JSB2JS.SYMTYPES_TEMP = 'L';

    // Await / Promise

    Commons_JSB2JS.Externals_Txt = '';
    Commons_JSB2JS.Uc_Externals_Purejs_List = '';

    // *****************************************************************

    // ERROR REPORTING

    // *****************************************************************
    Commons_JSB2JS.Errors = '';
    Commons_JSB2JS.Errline = '';

    // LEXER VARIABLES

    Commons_JSB2JS._Options = '';

    Commons_JSB2JS.Tkno = '';
    Commons_JSB2JS.Otkstr = '';
    Commons_JSB2JS.Tkstr = '';
    Commons_JSB2JS.La = '';
    Commons_JSB2JS.Mobjectdelemeter = '';
    Commons_JSB2JS.Itemid = '';
    Commons_JSB2JS.Oc = '';
    Commons_JSB2JS.Localvars = '';

    Commons_JSB2JS.Calllist = '';
    Commons_JSB2JS.Typeitem = '';
    Commons_JSB2JS.Filename = '';
    Commons_JSB2JS.Beforeheader = '';
    Commons_JSB2JS.Errs = '';
    Commons_JSB2JS.Tkline = '';

    Commons_JSB2JS.Large = '';
    Commons_JSB2JS.Subname = '';
    Commons_JSB2JS.Truesubname = '';

    // *****************************************************************

    // LEXICAL ANALYSIS VARIABLES

    // *****************************************************************
    Commons_JSB2JS.Itemsrc = '';
    Commons_JSB2JS.Symbols = '';
    Commons_JSB2JS.Idsymbols = '';
    Commons_JSB2JS.Cur_Fname = '';
    Commons_JSB2JS.Cur_Realfname = '';
    Commons_JSB2JS.Ocpgm = '';


    // Platform record

    Commons_JSB2JS.Errpos = '';
    Commons_JSB2JS.Addlist = '';
    Commons_JSB2JS.Oldcalllist = '';
    Commons_JSB2JS.Sugext = '';
    Commons_JSB2JS.Pcfname = '';
    Commons_JSB2JS.Realpcfname = '';

    // Lexer tokens

    Equates_JSB2JS.C_NUMBER = '!';
    Equates_JSB2JS.C_STR = '"';
    Equates_JSB2JS.C_UNKNOWN = '#';
    Equates_JSB2JS.C_AM = '$';
    Equates_JSB2JS.C_SM = '%';

    Equates_JSB2JS.C_VM = '&';
    Equates_JSB2JS.C_BANG = '\'';
    Equates_JSB2JS.C_AT = '(';
    Equates_JSB2JS.C_POUND = ')';
    // EQU C_DOLLAR TO "*" ;* NO LONGER USED
    Equates_JSB2JS.C_PERCENT = '+';
    Equates_JSB2JS.C_CIRCUMFLEX = ',';
    Equates_JSB2JS.C_ANDSIGN = '-';
    Equates_JSB2JS.C_ASTERISK = '.';
    Equates_JSB2JS.C_LPAREN = '/';
    Equates_JSB2JS.C_RPAREN = '0';
    Equates_JSB2JS.C_UNDER = '1';
    Equates_JSB2JS.C_PLUS = '2';
    Equates_JSB2JS.C_MINUS = '3';
    Equates_JSB2JS.C_EQUAL = '4';
    Equates_JSB2JS.C_LBRACE = '5';
    Equates_JSB2JS.C_RBRACE = '6';
    Equates_JSB2JS.C_SQUIGGLE = '7';
    Equates_JSB2JS.C_LBRACK = '8';
    Equates_JSB2JS.C_RBRACK = '9';
    Equates_JSB2JS.C_BSQUOTE = ':';
    Equates_JSB2JS.C_COLON = ';';
    // EQU C_DQUOTE TO "<" ;* " USED FOR STRINGS
    Equates_JSB2JS.C_SEMI = '=';
    // EQU C_SQUOTE TO ">" ;* ' USED FOR STRINGS
    Equates_JSB2JS.C_LESS = '?';
    Equates_JSB2JS.C_GREAT = '@';
    Equates_JSB2JS.C_QUESTION = 'A';
    Equates_JSB2JS.C_COMMA = 'B';
    Equates_JSB2JS.C_PERIOD = 'C';
    Equates_JSB2JS.C_FSLASH = 'D';
    Equates_JSB2JS.C_BAR = 'E';
    Equates_JSB2JS.C_BSLASH = 'F';
    Equates_JSB2JS.C_JSON = 'G';

    Equates_JSB2JS.C_IDENT = 'I';
    Equates_JSB2JS.C_CASE = 'J';
    Equates_JSB2JS.C_ELSE = 'K';
    Equates_JSB2JS.C_END = 'L';
    Equates_JSB2JS.C_FROM = 'M';
    Equates_JSB2JS.C_NEXT = 'N';
    Equates_JSB2JS.C_OFF = 'O';
    Equates_JSB2JS.C_ON = 'P';
    Equates_JSB2JS.C_REPEAT = 'Q';
    Equates_JSB2JS.C_THEN = 'R';
    Equates_JSB2JS.C_TO = 'S';
    Equates_JSB2JS.C_UNTIL = 'T';
    Equates_JSB2JS.C_WHILE = 'U';
    Equates_JSB2JS.C_OR = 'V';
    Equates_JSB2JS.C_AND = 'W';
    Equates_JSB2JS.C_MATCH = 'X';
    Equates_JSB2JS.C_MATCHES = 'Y';
    Equates_JSB2JS.C_CAT = 'Z';
    Equates_JSB2JS.C_LT = '[';
    Equates_JSB2JS.C_GT = '|';
    Equates_JSB2JS.C_LE = ']';
    Equates_JSB2JS.C_NE = '^';
    Equates_JSB2JS.C_GE = '_';
    Equates_JSB2JS.C_EQ = '`';
    Equates_JSB2JS.C_STEP = 'a';
    Equates_JSB2JS.C_BEFORE = 'b';
    Equates_JSB2JS.C_SETTING = 'c';
    Equates_JSB2JS.C_BY = 'd';
    Equates_JSB2JS.C_LOCKED = 'e';
    Equates_JSB2JS.C_GOTO = 'f';
    Equates_JSB2JS.C_GOSUB = 'g';
    Equates_JSB2JS.C_DO = 'h';
    Equates_JSB2JS.C_MAT = 'i';
    Equates_JSB2JS.C_DBLSLASH = 'j';
    Equates_JSB2JS.C_ERROR = 'k';
    Equates_JSB2JS.C_IN = 'l';
    Equates_JSB2JS.C_CAPTURING = 'm';
    Equates_JSB2JS.C_USING = 'n';
    Equates_JSB2JS.C_WITH = 'o';
    Equates_JSB2JS.C_LOOP = 'p';
    Equates_JSB2JS.C_MOD = 'q';
    Equates_JSB2JS.C_WHERE = 'r';
    Equates_JSB2JS.C_DEFAULT = 's';
    Equates_JSB2JS.C_CATCH = 't';
    Equates_JSB2JS.C_CMTBLOCK = 'u';

    return true;
}
// </INCLUDE_JSB2JS__COMMS>

// <PC_Pgm>
async function JSB2JS_PC_Pgm() {  // PROGRAM
    Commons_JSB2JS = {};
    Equates_JSB2JS = {};

    // local variables
    var Top, Columns, Dict, Givenfname, Filterby, Orderby, Givenoptions;
    var Allitems, Ss, Id, Ext, Xdef, Newpcfname, Dftopts, Ocfile;
    var Orginalsrccnt, Firstclassdim, Serrcnt, Firstlineno, Appendage;

    await Include_JSB2JS__Comms(true);

    if (Not(isAdmin())) return Stop('You are not an administrator');

    if (!(await JSB_BF_PARSESELECT(CStr(activeProcess.At_Sentence), '', Top, Columns, Dict, Givenfname, Filterby, Orderby, Givenoptions, Allitems, Commons_JSB2JS.F_Ffile, false, false, undefined, function (_Top, _Columns, _Dict, _Givenfname, _Filterby, _Orderby, _Givenoptions, _Allitems, _F_Ffile, _P14) { Top = _Top; Columns = _Columns; Dict = _Dict; Givenfname = _Givenfname; Filterby = _Filterby; Orderby = _Orderby; Givenoptions = _Givenoptions; Allitems = _Allitems; Commons_JSB2JS.F_Ffile = _F_Ffile }))) {
        if (activeProcess.At_Errors) return Stop(activeProcess.At_Errors);
        Println('PC FILENAME ITEMNAME(S) (OPTIONS)');
        Println('   OPTIONS:');
        Println('      (C) Add source lines as javascript comments');
        if (System(1) == 'js') {
            Println('      (S) Suppress debugging info');
        } else {
            Println('      (S) Add debugging info');
        }

        Println('      (E) Option Explicit implied');
        Println('      (L) Dump listing to screen');
        Println('      (R) R83 compatable - (Object Seperator is !, no "\\" string escapes, and expr expr (format) allowed)');
        Println('      (X) execute program after compiling (RUN)');
        if (CBool(isAdmin())) Println('      (@) attempt pure javascript converstion');
        Println();
        Println('You may add a DICT item to your file called options.txt which will appended to any command line options');
        return Stop();
    }

    if (CBool(Dict)) return Stop('Bad DICT syntax');

    if (Not(Filterby) && Not(System(11))) {
        if (Not(Allitems)) return Stop();
        if (CBool(Orderby)) Filterby = LTrim(RTrim(CStr(Filterby) + ' order by ' + CStr(Orderby)));
        if (await JSB_ODB_SELECTTO(LTrim(CStr(Top) + ' ') + CStr(Columns), Commons_JSB2JS.F_Ffile, CStr(Filterby), Ss, function (_Ss) { Ss = _Ss })); else return Stop(activeProcess.At_Errors);
    }

    Commons_JSB2JS.Itemlist = getList(Ss);
    if (Not(isArray(Commons_JSB2JS.Itemlist))) Commons_JSB2JS.Itemlist = Split(Commons_JSB2JS.Itemlist, am);

    // PARSE FILE NAME & ITEMNAMES

    Givenfname = LCase(await JSB_BF_TRUEFILENAME(CStr(Givenfname)));
    Commons_JSB2JS.D_Ffile = await JSB_BF_FHANDLE('DICT', Givenfname, true);
    if (await JSB_ODB_OPEN('', 'jsb_jsxrefs', Commons_JSB2JS.Fxrefs, function (_Fxrefs) { Commons_JSB2JS.Fxrefs = _Fxrefs })); else Commons_JSB2JS.Fxrefs = undefined;

    if (CBool(Allitems)) {
        // Don't delete anything out from under us
        if (CBool(Commons_JSB2JS.Fxrefs)) {
            for (Id of iterateOver(await JSB_BF_FSELECT(Commons_JSB2JS.D_Ffile, undefined, undefined, undefined, function (_D_Ffile) { Commons_JSB2JS.D_Ffile = _D_Ffile }))) {
                Id = LCase(Id);
                Ext = Right(Id, 4);
                if (Mid1(Ext, 2, 1) == '.') Ext = Mid1(Ext, 2, 3);
                if (Ext == '.js' || Ext == '.err' || Ext == '.lst' || Ext == '.wrn') { if (await JSB_ODB_DELETEITEM(Commons_JSB2JS.D_Ffile, CStr(Id))); else Alert(CStr(activeProcess.At_Errors)); }
            }

            // If we are recompiling everything, clear out any references that have SUB_CALLSTO and SUB_ISCALLEDBY
            if (CBool(Commons_JSB2JS.Fxrefs) && System(1) == 'aspx' && Left(Givenfname, 4) == 'jsb_') {
                for (Id of iterateOver(await JSB_BF_FSELECT(Commons_JSB2JS.Fxrefs, undefined, undefined, undefined, function (_Fxrefs) { Commons_JSB2JS.Fxrefs = _Fxrefs }))) {
                    if (await JSB_ODB_READJSON(Xdef, Commons_JSB2JS.Fxrefs, CStr(Id), function (_Xdef) { Xdef = _Xdef })) {
                        if (Null0(Xdef.SUB_FNAME) == Null0(Givenfname)) {
                            Xdef.SUB_CALLSTO = '';
                            Xdef.SrcEdit = '';
                            Xdef.SUB_ISCALLEDBY = '';
                            if (await JSB_ODB_WRITEJSON(Xdef, Commons_JSB2JS.Fxrefs, CStr(Id))); else Alert(CStr(activeProcess.At_Errors));
                        }
                    }
                }
            }
        }

        Print(At(-1));
    }

    Println('JSon Basic Compiler by Randy Walsh');
    Println('Source: ', Givenfname, '; OPTIONS: ', Givenoptions);
    Print(html('\<style\>#jsb { word-wrap: break-all; white-space: normal } \</style\>'));

    Commons_JSB2JS.Fjsbconfig = await JSB_BF_FHANDLE('jsb_config');
    if (await JSB_ODB_READ(Commons_JSB2JS.Externals_Txt, Commons_JSB2JS.Fjsbconfig, 'config_jsb2js', function (_Externals_Txt) { Commons_JSB2JS.Externals_Txt = _Externals_Txt })); else {
        await JSB_BF_MSGBOX('I\'m unable to find your config_jsb2js file in Jsb_Config');
        return Stop();
    }

    await ResetGlobalOpts();


    while (UBound(Commons_JSB2JS.Itemlist)) {
        Commons_JSB2JS.Itemid = Commons_JSB2JS.Itemlist[1];
        Commons_JSB2JS.Itemlist = Delete(Commons_JSB2JS.Itemlist, 1, 0, 0);

        if (InStr1(1, Commons_JSB2JS.Itemid, vm)) {
            Newpcfname = LCase(await JSB_BF_TRUEFILENAME(Extract(Commons_JSB2JS.Itemid, 1, 1, 0)));
            Commons_JSB2JS.Itemid = Extract(Commons_JSB2JS.Itemid, 1, 2, 0);
        } else {
            Newpcfname = Givenfname;
        }

        if (Null0(Newpcfname) != Null0(Commons_JSB2JS.Pcfname)) {
            Commons_JSB2JS.Pcfname = Newpcfname;
            Commons_JSB2JS.Realpcfname = await Makesubname(UCase(Commons_JSB2JS.Pcfname));
            Commons_JSB2JS.D_Ffile = await JSB_BF_FHANDLE('DICT', Commons_JSB2JS.Pcfname, true);
            Commons_JSB2JS._Options = UCase(Givenoptions);
            if (await JSB_ODB_READ(Dftopts, Commons_JSB2JS.D_Ffile, 'options.txt', function (_Dftopts) { Dftopts = _Dftopts })) {
                Commons_JSB2JS._Options += UCase(Dftopts);
            } else if (Left(Commons_JSB2JS.Pcfname, 4) == 'jsb_' || Commons_JSB2JS.Pcfname == 'tmp') {
                if (await JSB_ODB_WRITE('R-', Commons_JSB2JS.D_Ffile, 'options.txt')); else return Stop(activeProcess.At_Errors);
                Commons_JSB2JS._Options += 'R-';
            }
        }

        Commons_JSB2JS.Processingtemplates = (Commons_JSB2JS.Pcfname == 'jsb_pagetemplates' || Commons_JSB2JS.Pcfname == 'jsb_viewtemplates');
        Commons_JSB2JS.Firstone = 1;

        if (Mid1(Commons_JSB2JS.Itemid, 1, 1) == '_') {
            if (Commons_JSB2JS.Pcfname != 'jsb_ctls' && !Commons_JSB2JS.Processingtemplates) continue;
        }

        // Allow multiple subroutines and functions in same file


        while (true) {

            // Reset variables for next item

            Commons_JSB2JS.Ocpgm = [undefined,];
            Commons_JSB2JS.La = Equates_JSB2JS.C_END + Equates_JSB2JS.C_SM;
            Commons_JSB2JS.Errcnt = 0;
            Commons_JSB2JS.Errline = '';
            Commons_JSB2JS.Errpos = 0;
            await ResetGlobalOpts();
            Commons_JSB2JS.Symtab = {};

            if (Commons_JSB2JS.Firstone) {
                Commons_JSB2JS._Incfile = 0;
                Commons_JSB2JS.Nxtlbl = 1;
                Ocfile = '';
                Commons_JSB2JS.Cached_Xrefs = {};

                await JSB2JS_BASECONV_Sub(Commons_JSB2JS.Pcfname, Commons_JSB2JS.Itemid); // Inits Tkline, Tkam, Tkpos, Tkno, Lineno

                if (Not(Commons_JSB2JS.Itemsrc)) {
                    await Err2('Item ' + Commons_JSB2JS.Itemid + ' not found.');
                    Commons_JSB2JS.Tkam = 99999;
                    Commons_JSB2JS.Tkno = Equates_JSB2JS.C_SM;
                    break;
                }

                Orginalsrccnt = UBound(Commons_JSB2JS.Itemsrc);
            }

            if (Commons_JSB2JS.Processingtemplates) await JSB2JS_SKIPTEMPLATEHEADER_Sub();
            await SkipOverComments(true);
            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SM) break;

            if (Not(Commons_JSB2JS.Firstone == 1 || Commons_JSB2JS.Tkstr == 'SUBROUTINE' || Commons_JSB2JS.Tkstr == 'SUB' || Commons_JSB2JS.Tkstr == 'FUNCTION' || Commons_JSB2JS.Tkstr == 'PROGRAM' || Commons_JSB2JS.Tkstr == 'GLOBALS' || Commons_JSB2JS.Tkstr == 'COMMONS' || Commons_JSB2JS.Tkstr == 'CLASS' || Commons_JSB2JS.Tkstr == 'PARTIAL' || Commons_JSB2JS.Tkstr == 'RESTFUL' || Commons_JSB2JS.Tkstr == 'PICK')) break;
            if (Commons_JSB2JS.Mr83) Commons_JSB2JS.Mobjectdelemeter = ('|'); else Commons_JSB2JS.Mobjectdelemeter = '.';
            if (Commons_JSB2JS.Mr83) Commons_JSB2JS.Simplestrings = true; else Commons_JSB2JS.Simplestrings = false;

            if (!Commons_JSB2JS.Firstone) {
                Commons_JSB2JS.Subname = ''; // Should Get From Subroutine Header;
            }

            if (Commons_JSB2JS.Tkstr == 'CLASS') {
                Commons_JSB2JS.Insideclass = true;
                await Tcv(false);
                Commons_JSB2JS.Classname = Commons_JSB2JS.Tkstr;
                await Tcv(false);
                await SkipOverComments(true);
                Firstclassdim = true;

                // LOOP ON CLASS METHODS

                while (true) {
                    if (Commons_JSB2JS.Tkstr == 'DIM' || Commons_JSB2JS.Tkstr == 'VAR' && CBool(Firstclassdim)) {
                        // FORCE DIM VARIABLES INTO FIRST SUBROUTINE _NEW
                        Commons_JSB2JS.Tkpos -= Len(Commons_JSB2JS.Tkstr);
                        Commons_JSB2JS.Tkline = Left(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos - Len(Commons_JSB2JS.Tkstr) - 1) + 'Sub _NEW();' + Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 999);
                        Commons_JSB2JS.Tkno = Equates_JSB2JS.C_IDENT;
                        Commons_JSB2JS.Tkpos -= 3; // Skip Back Over Sub
                        await Tcv(false); // Reset;
                    } else if (Commons_JSB2JS.Tkstr != 'FUNCTION' && Commons_JSB2JS.Tkstr != 'FUNC' && Commons_JSB2JS.Tkstr != 'SUBROUTINE' && Commons_JSB2JS.Tkstr != 'SUB' && Commons_JSB2JS.Tkstr != 'END') {
                        await Err('Function or Subroutine Header expected');
                        break;
                    }

                    Serrcnt = Commons_JSB2JS.Errcnt;
                    Firstlineno = Commons_JSB2JS.Tkam;

                    await Parseprogram(); // Parse Program

                    if (Null0(Firstlineno) > Null0(Orginalsrccnt)) Firstlineno = 0;
                    if (Not(Commons_JSB2JS.Hush)) Println();

                    await JSB2JS_PO_Sub(Commons_JSB2JS.Subname, Firstlineno, Appendage, Serrcnt, function (_Subname, _Firstlineno, _Appendage, _Serrcnt) { Commons_JSB2JS.Subname = _Subname; Firstlineno = _Firstlineno; Appendage = _Appendage; Serrcnt = _Serrcnt });

                    // What follows us?
                    await SkipOverComments(true);

                    if (Commons_JSB2JS.Tkstr == 'END') {
                        await Tcv(false);
                        if (Commons_JSB2JS.Tkstr == 'PARTIAL') await Tcv(false);

                        if (Commons_JSB2JS.Tkstr == 'CLASS') {
                            await Tcv(false);
                        } else {
                            await Err('END CLASS expected');
                        }
                        break;
                    } else {
                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_SM && Commons_JSB2JS.Tkstr != 'FUNCTION' && Commons_JSB2JS.Tkstr != 'END' && Commons_JSB2JS.Tkstr != 'FUNC' && Commons_JSB2JS.Tkstr != 'SUBROUTINE' && Commons_JSB2JS.Tkstr != 'SUB' && Commons_JSB2JS.Tkstr != 'PROGRAM' && Commons_JSB2JS.Tkstr != 'COMMONS' && Commons_JSB2JS.Tkstr != 'GLOBALS' && Commons_JSB2JS.Tkstr != 'RESTFUL' && Commons_JSB2JS.Tkstr != 'PICK') {
                            await Err('END CLASS expected');
                            break;
                        }
                    }

                    Firstclassdim = false;
                }
            } else {
                Commons_JSB2JS.Insideclass = false;
                Serrcnt = Commons_JSB2JS.Errcnt;
                Firstlineno = Commons_JSB2JS.Tkam;
                await Parseprogram(); // Parse Program

                if (Commons_JSB2JS.Functiontype == 3) {
                    if (Not(Commons_JSB2JS.Hush)) Println();
                } else {
                    if (Null0(Firstlineno) > Null0(Orginalsrccnt)) Firstlineno = 0;
                    await JSB2JS_PO_Sub(Commons_JSB2JS.Subname, Firstlineno, Appendage, Serrcnt, function (_Subname, _Firstlineno, _Appendage, _Serrcnt) { Commons_JSB2JS.Subname = _Subname; Firstlineno = _Firstlineno; Appendage = _Appendage; Serrcnt = _Serrcnt });
                }
            }

            // check for end subname
            if (Commons_JSB2JS.Tkstr == Commons_JSB2JS.Subname) await Tcv(false);
            Commons_JSB2JS.Firstone = 0;
        }

        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_SM && Commons_JSB2JS.Tkstr != 'SUBROUTINE' && Commons_JSB2JS.Tkstr != 'SUB' && Commons_JSB2JS.Tkstr != 'FUNCTION' && Commons_JSB2JS.Tkstr != 'FUNC' && Commons_JSB2JS.Tkstr != 'PROGRAM' && Commons_JSB2JS.Tkstr != 'GLOBALS' && Commons_JSB2JS.Tkstr != 'COMMONS' && Commons_JSB2JS.Tkstr != 'COMMON' && Commons_JSB2JS.Tkstr != 'RESTFUL' && Commons_JSB2JS.Tkstr != 'PICK') {
            await Warning('Unknown code, end of code or another routine expected. ' + CStr(Commons_JSB2JS.Tkstr) + crlf + Commons_JSB2JS.Tkline);
        }

        // Output Errors for all subs combined

        if (await JSB_ODB_DELETEITEM(Commons_JSB2JS.D_Ffile, Commons_JSB2JS.Itemid + '.err')); else null;
        if (await JSB_ODB_DELETEITEM(Commons_JSB2JS.D_Ffile, Commons_JSB2JS.Itemid + '.wrn')); else null;
        if (Commons_JSB2JS.Errcnt == 0) { if (await JSB_ODB_WRITE(DateTime(), Commons_JSB2JS.D_Ffile, LCase(Commons_JSB2JS.Itemid) + '.pc.time')); else return Stop(activeProcess.At_Errors); }

        if (Len(Commons_JSB2JS.Errors)) {
            if (Commons_JSB2JS.Errcnt == 0) {
                Println('Warnings detected');
                if (await JSB_ODB_WRITE(CStr(Commons_JSB2JS.Errors), Commons_JSB2JS.D_Ffile, LCase(Commons_JSB2JS.Itemid) + '.wrn')); else return Stop(activeProcess.At_Errors);
            } else {
                if (Commons_JSB2JS.Errcnt == 1) {
                    Println('One error detected.');
                } else {
                    if (Commons_JSB2JS.Errcnt > 1) Println(Commons_JSB2JS.Errcnt, ' errors detected.');
                }
                if (await JSB_ODB_WRITE(CStr(Commons_JSB2JS.Errors), Commons_JSB2JS.D_Ffile, LCase(Commons_JSB2JS.Itemid) + '.err')); else return Stop(activeProcess.At_Errors);
            }
            Commons_JSB2JS.Errors = '';
        }
        // If @Domain = "jsbwinforms.azurewebsites.net" Then Sleep 5
    } // Next Item
    Println();

    if (Index1(Commons_JSB2JS._Options, 'X', 1) && System(1) == 'js') await asyncTclExecute('RUN ' + Commons_JSB2JS.Pcfname + ' ' + CStr(Commons_JSB2JS.Itemlist[1]));
    return;
}
// </PC_Pgm>

// <PO_Sub>
async function JSB2JS_PO_Sub(ByRef_Ignored, ByRef_Firstlineno, ByRef_Appendage, ByRef_Serrcnt, setByRefValues) {
    var me = new jsbRoutine("JSB2JS", "po", "JSB2JS_PO_Sub");
    me.localValue = function (varName) { return eval(varName) }
    // local variables
    var Socpgm, Outputtrycatch, Cname, Pdef, Rattr, Declaration;
    var Locallist, Hascommons, Localtypes, Id, _Typedef, Funcheader;
    var Fparams, Cmd, Byrefrtnrec, Sub_Paramtypes, Parami, Note;
    var Hpfx, Ucifilename, Commonsname, Equatesname, Includesubname;
    var Ll, Addc, L, Li, Startindent, Extraindent, Lastline, Src;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Ignored, ByRef_Firstlineno, ByRef_Appendage, ByRef_Serrcnt)
        return v
    }
    await dbgCheck(me, 2, true /* modal */);
    await Include_JSB2JS__Comms(false)

    // = = = = = jsonBasic compiler output = = = = =

    Socpgm = Join(Commons_JSB2JS.Ocpgm, Chr(254));
    Outputtrycatch = InStr1(1, Socpgm, 'onError' + 'Goto');
    Commons_JSB2JS.Adddebugging = InStr1(1, Socpgm, 'dbgCheck');
    Commons_JSB2JS.Ocpgm = Split(Socpgm, Chr(254));
    Socpgm = '';


    while (UBound(Commons_JSB2JS.Ocpgm) > 0) {
        if (isEmpty(Commons_JSB2JS.Ocpgm[1])) Commons_JSB2JS.Ocpgm.DELETE(1); else break
    }
    Commons_JSB2JS.Indent = 4;

    // ********************************************************************
    // Process the SYMTAB file, and build the following lists:
    // ********************************************************************
    // *
    // If we had no actual code, we are just a Symbol (COMMONS / EQUATES) files

    if (Commons_JSB2JS.Functiontype == -1) {
        if ((Not(Commons_JSB2JS.Subname))) {
            Commons_JSB2JS.Subname = Commons_JSB2JS.Itemid;
            Commons_JSB2JS.Globals = true;
        }

        if (await JSB_ODB_WRITEJSON(Commons_JSB2JS.Symtab, Commons_JSB2JS.D_File, Commons_JSB2JS.Subname + '.SYM')); else return Stop(activeProcess.At_Errors);
        Commons_JSB2JS.Incfilessrc['DICT+' + UCase(CStr(Commons_JSB2JS.Pcfname) + '+' + Commons_JSB2JS.Subname) + '.sym'] = Commons_JSB2JS.Symtab;
        if (!Commons_JSB2JS.Globals) return exit(undefined);
    } else {
        if (await JSB_ODB_DELETEITEM(Commons_JSB2JS.D_File, Commons_JSB2JS.Subname + '.SYM')); else null;
    }

    if (!Commons_JSB2JS.Subname) Commons_JSB2JS.Subname = Commons_JSB2JS.Itemid;
    if (Commons_JSB2JS.Dontmorphfunctionname || Commons_JSB2JS.Processingtemplates) {
        Cname = Commons_JSB2JS.Truesubname;
        ByRef_Appendage = '';
    } else {
        Cname = CStr(Commons_JSB2JS.Cur_Realfname) + '_' + Commons_JSB2JS.Subname;
        Cname = await Makesubname(Cname);
        ByRef_Appendage = await calcAppendage(Commons_JSB2JS.Functiontype);
    }

    Pdef = {};
    Pdef.SUB_COMPILEDATE = 'Compiled on ' + JSB_BF_TIMEDATE() + ' in ' + CStr(Commons_JSB2JS.Itemid);
    Pdef.SUB_FNAME = LCase(Commons_JSB2JS.Pcfname);
    Pdef.SUB_INAME = LCase(Commons_JSB2JS.Itemid);
    Pdef.SUB_FIRSTLINE = ByRef_Firstlineno;
    Pdef.SUB_RTNTYPE = '';
    Pdef.SUB_MAYBEIJS = (Not(Commons_JSB2JS.Haspromises) && !Commons_JSB2JS.Hasbyrefparamters);
    Pdef.SUB_PARAMTYPES = ''; // Will be computed below
    Pdef.SUB_ISCALLEDBY = '';
    Pdef.SrcEdit = anchorEdit(CStr(Pdef.SUB_FNAME), CStr(Pdef.SUB_INAME), CStr(Pdef.SUB_CNAME), '', +'', CNum(Pdef.SUB_FIRSTLINE));
    Pdef.SUB_CNAME = CStr(Cname) + CStr(ByRef_Appendage); // Name Used By C, As In Call
    Pdef.SUB_SUBNAME = Commons_JSB2JS.Subname; // Name Used By Basic Call
    Pdef.SUB_CALLSTO = Join(Commons_JSB2JS.Calllist, ',');
    Pdef.SUB_ISFUNCTION = Commons_JSB2JS.Functiontype;
    Pdef.SUB_NOAWAITSALLOWED = Commons_JSB2JS.Notasyncfunction;
    Pdef.SUB_USINGASYNCFUNCS = Join(Commons_JSB2JS.Haspromises, ',');
    Pdef.SUB_OPTIONALPARAMCNT = Commons_JSB2JS.Optionalparamcnt;

    if (Commons_JSB2JS.Functiontype == 3) {
        return exit(undefined); // Server Side Rest Funciton;
    }

    if (Commons_JSB2JS.Functiontype >= 2) {
        Rattr = clone(Commons_JSB2JS.Funcattr);
        Rattr.SYM_ISCONST = 1;
        Declaration = await Builddec(Rattr); // returns declaration.Var, declaration.Calldef, and declaration.Cinit
        Pdef.SUB_RTNTYPE = Declaration.Calldef;
    }

    // Build list of Local variables
    Locallist = [undefined,];
    Hascommons = false;

    Localtypes = CStr(Equates_JSB2JS.FLAVOR_LOCAL) + CStr(Equates_JSB2JS.FLAVOR_FUNCTION) + CStr(Equates_JSB2JS.FLAVOR_EQUATE);
    for (Id of iterateOver(Commons_JSB2JS.Symtab)) {
        Rattr = clone(Commons_JSB2JS.Symtab[Id]);
        if (Null0(Rattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_COMMON) Hascommons = true;

        if (Index1(Localtypes, Rattr.SYM_FLAVOR, 1)) {
            if (Not(Rattr.isAlreadyDefined)) {
                Declaration = await Builddec(Rattr); // returns declaration.Var, declaration.Calldef, and declaration.Cinit
                _Typedef = CStr(Declaration.Var) + CStr(Declaration.Cinit);

                switch (true) {
                    case Null0(Rattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_LOCAL:
                        if (!Index1(Rattr.SYM_TYPES, Equates_JSB2JS.SYMTYPES_STORED, 1) && isEmpty(Rattr.SYM_INDEX1) && Null0(Rattr.SYM_INCLEVEL) == '0') {
                            await Warning('Symbol ' + CStr(Id) + ' never assigned a value');
                        }
                        Locallist[Locallist.length] = _Typedef;

                        break;

                    case Null0(Rattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_FUNCTION:
                        Locallist[Locallist.length] = _Typedef; // Allow Functioname = Result

                        break;

                    case Null0(Rattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_EQUATE:
                        if (Null0(Rattr.SYM_INCLEVEL) == -1) Locallist[Locallist.length] = _Typedef;

                }
            }
        }
    }

    // ********************************************************************
    // Actual subroutine, Compute FuncHeader and parameter string
    // ********************************************************************
    if (Commons_JSB2JS.Notasyncfunction) {
        if (CBool(Commons_JSB2JS.Haspromises)) {
            await Err('ROUTINE CAN\'T BE AN IJS ROUTINE.  Remove the $options IJS or fix errors: ' + Join(Commons_JSB2JS.Haspromises, ' * ') + '.');
        }
        Funcheader = 'function ' + CStr(Cname) + CStr(ByRef_Appendage);
    } else {
        Funcheader = 'async function ' + CStr(Cname) + CStr(ByRef_Appendage);
    }

    Fparams = ''; // On Procedure Definition
    Cmd = '';
    Byrefrtnrec = '';
    Sub_Paramtypes = [undefined,];
    Parami = LBound(Commons_JSB2JS.Paramlist) - 1;
    for (Id of iterateOver(Commons_JSB2JS.Paramlist)) {
        Parami++;
        Rattr = await Readsym(Id);
        Declaration = await Builddec(Rattr); // returns declaration.Var, declaration.Calldef (vsim...), and declaration.Cinit (var = nnn)
        if (CBool(Rattr.SYM_ISBYVAL)) Declaration.Calldef = UCase(Declaration.Calldef);
        Sub_Paramtypes[Parami] = Declaration.Calldef;

        if (CBool(Fparams)) Fparams = CStr(Fparams) + ', ';
        Fparams += CStr(Declaration.Var);

        // Need to build a script to is used for callbacks when we have ByRef variables
        if (Not(Rattr.SYM_ISBYVAL)) {
            if (CBool(Byrefrtnrec)) Byrefrtnrec += ', ';
            Byrefrtnrec += CStr(Declaration.Var);
        }
    }

    Pdef.SUB_PARAMTYPES = Join(Sub_Paramtypes, ',');

    if (CBool(Byrefrtnrec)) {
        if (CBool(Fparams)) Fparams = CStr(Fparams) + ', ';
        Fparams += 'setByRefValues';
    }

    // -1) COMMONS, 0) PROGRAM, 1) SUBROUTINE, 2) FUNCTION, 3) @@FUNCTION, 4) PICK/RESTFUL FUNCTION 
    switch (Commons_JSB2JS.Functiontype) {
        case -1:
            Note = ' // COMMONS';
            break;

        case 0:
            Note = ' // PROGRAM';
            break;

        case 1:
            Note = '';
            break;

        case 2:
            Note = '';
            break;

        case 3:
            Note = ' // @@function';
            break;

        case 4:
            Note = ' // restful function (or Pick Function)';
    }

    Funcheader += '(' + CStr(Fparams) + ') { ' + CStr(Note);
    Hpfx = [undefined, Funcheader];

    if (Commons_JSB2JS.Functiontype <= 0) {
        Ucifilename = UCase(Commons_JSB2JS.Pcfname);

        Commonsname = 'Commons_' + CStr(Ucifilename);
        Equatesname = 'Equates_' + CStr(Ucifilename);
        Includesubname = 'Include_' + CStr(Ucifilename) + '_' + await Makevarname(Commons_JSB2JS.Itemid);

        if (Commons_JSB2JS.Functiontype == -1) {
            Hpfx = [undefined, 'async function ' + CStr(Includesubname) + '(forceReset) {'];
            Hpfx[Hpfx.length] = (Space(Commons_JSB2JS.Indent) + 'forceReset |= (typeof ' + CStr(Commonsname) + ' == "undefined") || (typeof ' + CStr(Equatesname) + ' == "undefined"); ');
            Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + 'if (!forceReset) return; ';
            Hpfx[Hpfx.length] = '';
            Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + CStr(Commonsname) + ' = {}; ';
            Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + CStr(Equatesname) + ' = {}; ';
            Hpfx[Hpfx.length] = '';
        } else {
            Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + CStr(Commonsname) + ' = {}; ';
            Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + CStr(Equatesname) + ' = {}; ';
            Hpfx[Hpfx.length] = '';
        }
    }

    // ********************************************************************
    // Build the startup prefix for the function
    // ********************************************************************

    if (Commons_JSB2JS.Adddebugging || CBool(Commons_JSB2JS.Insideclass)) {
        Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + 'var me = new jsbRoutine("' + Change(UCase(Commons_JSB2JS.Pcfname), '\\', '\\\\') + '", "' + CStr(Commons_JSB2JS.Itemid) + '", "' + CStr(Cname) + CStr(ByRef_Appendage) + '"); ';
        if (Commons_JSB2JS.Adddebugging && !Commons_JSB2JS.Notasyncfunction) { Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + 'me.localValue = function (varName) { return eval(varName) }'; }
    }

    if (CBool(Locallist)) {
        Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + '// local variables';
        Ll = '';
        Addc = 0;
        Li = LBound(Locallist) - 1;
        for (L of iterateOver(Locallist)) {
            Li++;
            if (Len(Ll) > 60) Addc = 0;
            if (Not(Addc)) {
                if (CBool(Ll)) { Hpfx[Hpfx.length] = CStr(Ll) + ';'; }
                Ll = Space(Commons_JSB2JS.Indent) + 'var ';
            }
            if (CBool(Addc)) Ll += ', ';
            Ll += CStr(L);
            Addc = 1;
        }
        if (CBool(Ll)) { Hpfx[Hpfx.length] = CStr(Ll) + ';'; }
        Hpfx[Hpfx.length] = '';
        Ll = '';
    }
    if (CBool(Outputtrycatch)) { Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + '   var onError;'; }
    if (CBool(Commons_JSB2JS.Isrestfulfunction)) { Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + '   var Restful_Result;'; }

    Startindent = Commons_JSB2JS.Indent;
    if (Commons_JSB2JS.Haslbl) {
        Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + 'var gotoLabel = "";';
        Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + 'atgoto: while (true) {';
        Commons_JSB2JS.Indent += 4;
    }

    if (CBool(Outputtrycatch)) {
        Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + 'try {';
        Commons_JSB2JS.Indent += 4;
    }

    if (Commons_JSB2JS.Haslbl) {
        Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + 'switch (gotoLabel) {';
        Commons_JSB2JS.Indent += 4;
        Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + 'case "":';
        Commons_JSB2JS.Indent += 4;
    }

    Extraindent = Commons_JSB2JS.Indent - +Startindent;
    if (CBool(Extraindent)) {
        Commons_JSB2JS.Ocpgm = Split(Join(Commons_JSB2JS.Ocpgm, am), am);
        var _ForEndI_44 = UBound(Commons_JSB2JS.Ocpgm);
        for (Li = 1; Li <= _ForEndI_44; Li++) {
            Commons_JSB2JS.Ocpgm[Li] = Space(Extraindent) + CStr(Commons_JSB2JS.Ocpgm[Li]);
        }
    }

    if (CBool(Byrefrtnrec)) {
        Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + 'function exit(v) {';
        Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + '    if (typeof setByRefValues == \'function\') setByRefValues(' + CStr(Byrefrtnrec) + ')';
        Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + '    return v';
        Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + '}';
    }

    if (Commons_JSB2JS.Adddebugging && !Commons_JSB2JS.Notasyncfunction) { Hpfx[Hpfx.length] = Space(Commons_JSB2JS.Indent) + 'await dbgCheck(me, ' + CStr(ByRef_Firstlineno) + ', true /* modal */); '; }

    // Output return code to Ocpgm[]

    Lastline = Split(Commons_JSB2JS.Ocpgm[UBound(Commons_JSB2JS.Ocpgm)], crlf);
    Lastline = LTrim(Lastline[UBound(Lastline)]);

    if (Left(Lastline, 7) != 'return ') {
        // -1) COMMONS, 0) PROGRAM, 1) SUBROUTINE, 2) FUNCTION, 3) @@FUNCTION, 4) PICK/RESTFUL FUNCTION 

        if (Commons_JSB2JS.Functiontype == -1) {
            // Ocpgm[-1] = Space(Indent):'Commons_':UCase(Cur_realfname):' = true; '
            // Ocpgm[-1] = Space(Indent):'Commons_':UCase(Cur_realfname):'.':Makevarname(Subname):' = true; '
            Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + 'return; ';;
        } else if (Commons_JSB2JS.Functiontype == 0) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + 'return; ';; } else {
            if (Commons_JSB2JS.Hasbyrefparamters) {
                Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + 'return exit(); ';
            } else {
                // Ocpgm[-1] = Space(Indent):'return; ';
            }

            // Else // function
            // Rattr = readsym(Funcattr.SYMNAME)
            // if hasByRefParamters then
            // Ocpgm[-1] = Space(Indent):'return exit(':Rattr.SYM_C:'); '
            // Else
            // Ocpgm[-1] = Space(Indent):'return ':Rattr.SYM_C:'; '
            // End if;
        }
    }

    if (Commons_JSB2JS.Haslbl) {
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = '';
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = '';
        Commons_JSB2JS.Indent -= 4;
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + 'default:';
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent + 4) + 'throw "we entered an invalid gotoLabel: " + gotoLabel; ';
        Commons_JSB2JS.Indent -= 4;
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + '} // switch';
    }

    if (CBool(Outputtrycatch)) {
        Commons_JSB2JS.Indent -= 4;
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + '} catch (err) {';
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent + 4) + 'err = err2String(err);';
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent + 4) + 'if (err.startsWith(\'*STOP*\')) throw err;';
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent + 4) + 'if (err.startsWith(\'*END*\')) throw err;';
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent + 4) + 'if (_onError' + 'Goto) { ';
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent + 8) + 'gotoLabel = _onError' + 'Goto; ';
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent + 8) + 'if (err.message) activeProcess.At_Errors = err.message; else activeProcess.At_Errors = err; ';
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent + 4) + '} else throw err; ';
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + '}';
    }

    if (Commons_JSB2JS.Haslbl) {
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + '} // agoto while';
        Commons_JSB2JS.Indent -= 4;
    }

    Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = '}';
    Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = '';

    Src = CStr(Commons_JSB2JS.Beforeheader) + Join(Hpfx, crlf) + crlf + Join(Commons_JSB2JS.Ocpgm, crlf);
    if (Commons_JSB2JS.Processingtemplates) Src = Change(Src, '\<!!\>' + crlf, '');

    if (Commons_JSB2JS.Showlist) {
        Println();
        Println(Src);
    }

    if (Null0(ByRef_Serrcnt) != Commons_JSB2JS.Errcnt && !Commons_JSB2JS.Processingtemplates) {
        Println(Chr(16), Commons_JSB2JS.Subname, ' had errors, no .js file written', Chr(16));
        return exit(undefined);
    }

    await JSB2JS_UPDATEJSCODE_Sub(Src, Commons_JSB2JS.Pcfname, Commons_JSB2JS.Subname, ByRef_Appendage, function (_Src, _Pcfname, _Subname, _ByRef_Appendage) { Src = _Src; Commons_JSB2JS.Pcfname = _Pcfname; Commons_JSB2JS.Subname = _Subname; ByRef_Appendage = _ByRef_Appendage });

    // Update cross references (and writes PDEF)   
    await JSB2JS_UPDATECROSSREFERENCE_Sub(Pdef, function (_Pdef) { Pdef = _Pdef });
    return exit();
}
// </PO_Sub>

// <UPDATEJSCODE_Sub>
async function JSB2JS_UPDATEJSCODE_Sub(ByRef_Src, ByRef_Fname, ByRef_Sname, ByRef_Appendage, setByRefValues) {
    // local variables
    var C, Outiname, Outputname, Linkjs, Marker, Marker2, I, J;
    var Cdef, L1, Spot;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Src, ByRef_Fname, ByRef_Sname, ByRef_Appendage)
        return v
    }
    await Include_JSB2JS__Comms(false)


    while (true) {
        C = Right(ByRef_Src, 1);
        if (Not(C == am || C == Chr(32) || C == cr || C == lf)) break;
        ByRef_Src = Left(ByRef_Src, Len(ByRef_Src) - 1);
    }

    Outiname = LCase(CStr(ByRef_Sname) + CStr(ByRef_Appendage) + '.js');
    // Write Src On D_ffile, outIName Else Stop @Errors

    // If Not(Hush) Then Print Chr(16):outIName:" ":anchorEdit("dict ":fName, outIName):" ":Len(Src):" bytes. Successful. ":UBound(ItemList):" item(s) remaining.":Chr(16)        
    if (Not(Commons_JSB2JS.Hush)) Println(Chr(16), Outiname, ' ', Len(ByRef_Src), ' bytes. Successful. ', UBound(Commons_JSB2JS.Itemlist), ' item(s) remaining.', Chr(16));

    Commons_JSB2JS.Itemid = UCase(Commons_JSB2JS.Itemid);

    Outputname = CStr(ByRef_Fname) + '.js';
    if (await JSB_ODB_READ(Linkjs, Commons_JSB2JS.D_Ffile, CStr(Outputname), function (_Linkjs) { Linkjs = _Linkjs })); else Linkjs = '';
    if (Commons_JSB2JS.Processingtemplates) {
        if (Commons_JSB2JS.Firstone) Linkjs = ''; else Linkjs += am;
        Linkjs += CStr(ByRef_Src) + am;
    } else {

        Marker = '// \<' + UCase(ByRef_Sname) + CStr(ByRef_Appendage) + '\>';
        Marker2 = '// \</' + UCase(ByRef_Sname) + CStr(ByRef_Appendage) + '\>';

        I = InStr1(1, Linkjs, Marker);
        if (CBool(I)) {
            J = InStr1(1, Linkjs, Marker2);
            if (Not(J)) I = 0;
        }

        if (CBool(I)) {
            Commons_JSB2JS.Lineno = DCount(Left(Linkjs, I), am);
            Linkjs = Left(Linkjs, +I - 1) + CStr(Marker) + am + CStr(ByRef_Src) + am + Mid1(Linkjs, J);
        } else {
            Linkjs += am + CStr(Marker) + am + CStr(ByRef_Src) + am + CStr(Marker2) + am;
        }
    }

    if (await JSB_ODB_WRITE(CStr(Linkjs), Commons_JSB2JS.D_Ffile, CStr(Outputname))); else return Stop(activeProcess.At_Errors);
    Println(anchorEdit('dict ' + CStr(ByRef_Fname), CStr(Outputname), 'Results writtien to dict ' + CStr(ByRef_Fname) + ' ' + CStr(Outputname), '', +'', Commons_JSB2JS.Lineno));

    // Update in memory copies           
    if (System(1) == 'js') {
        await loadJsbStandardLibraries(ByRef_Fname);

        // IF PROGRAM - Catalog
        if (CBool(Commons_JSB2JS.Docatalog)) {
            if (await JSB_ODB_READ(Cdef, await JSB_BF_FHANDLE('MD'), CStr(ByRef_Sname), function (_Cdef) { Cdef = _Cdef })); else Cdef = '';
            L1 = LCase(Extract(Cdef, 1, 0, 0));
            if (Locate('cv', L1, 1, 0, 0, "", position => Spot = position)); else null;

            Cdef = Replace(Cdef, 1, Spot, 0, 'cv');
            Cdef = Replace(Cdef, 2, Spot, 0, ByRef_Fname);
            Cdef = Replace(Cdef, 3, Spot, 0, ByRef_Sname);

            if (await JSB_ODB_WRITE(CStr(Cdef), await JSB_BF_FHANDLE('MD'), CStr(ByRef_Sname))); else return Stop(activeProcess.At_Errors);
        }
    }

    return exit();
}
// </UPDATEJSCODE_Sub>

// <CALCAPPENDAGE>
async function calcAppendage(Functype) {
    // local variables
    var Appendage;

    await Include_JSB2JS__Comms(false)

    // -1) COMMONS, 0) PROGRAM, 1) SUBROUTINE, 2) FUNCTION, 3) @@FUNCTION, 4) PICK/RESTFUL FUNCTION 

    switch (Functype) {
        case -1:
            // 
            Appendage = '_Cmns';

            break;

        case 0:
            Appendage = '_Pgm';

            break;

        case 1:
            Appendage = '_Sub';

            break;

        case 2:
            Appendage = '';

            break;

        default:
            return '_AtAt';
    }

    return Appendage;
}
// </CALCAPPENDAGE>

// <READXREF>
async function JSB2JS_READXREF(Xdefid) {
    // local variables
    var D;

    await Include_JSB2JS__Comms(false)

    Xdefid = LCase(Xdefid);
    D = Commons_JSB2JS.Cached_Xrefs[Xdefid];
    if (Not(D)) {
        if (await JSB_ODB_READJSON(D, Commons_JSB2JS.Fxrefs, Xdefid, function (_D) { D = _D })); else { D = {} }
        Commons_JSB2JS.Cached_Xrefs[Xdefid] = D;
    }

    return D;
}
// </READXREF>

// <RELCMP>
async function Relcmp(Lattr, Gattr, Rop) {
    // local variables
    var Nullchk, Rsy, Gnum, Lnum, Gstr, Lstr;

    await Include_JSB2JS__Comms(false)

    Nullchk = '';
    switch (true) {
        case Rop == Equates_JSB2JS.C_EQUAL || Rop == Equates_JSB2JS.C_EQ:
            // comparing gattr to ""?
            if (Lattr.SYM_C == '\'\'' || Lattr.SYM_C == '""' || Lattr.SYM_C == '``') {
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                if (Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_ESTR || Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VSTR || Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_CSTR) {
                    if (InStr1(1, Gattr.SYM_C, ' ')) Gattr.SYM_C = '!(' + CStr(Gattr.SYM_C) + ')'; else Gattr.SYM_C = '!' + CStr(Gattr.SYM_C) + '';
                } else {
                    Gattr.SYM_C = 'isEmpty(' + CStr(Gattr.SYM_C) + ')';
                }

                return;
            }

            // comparing "" to gattr?
            if (Gattr.SYM_C == '\'\'' || Gattr.SYM_C == '""' || Gattr.SYM_C == '``') {
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                if (Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_ESTR || Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_VSTR || Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_CSTR) {
                    if (InStr1(1, Gattr.SYM_C, ' ')) Gattr.SYM_C = '!(' + CStr(Lattr.SYM_C) + ')'; else Gattr.SYM_C = '!' + CStr(Lattr.SYM_C);
                } else {
                    Gattr.SYM_C = 'isEmpty(' + CStr(Lattr.SYM_C) + ')';
                }

                return;
            }

            Rsy = '==';

            break;

        case Rop == Equates_JSB2JS.C_POUND || Rop == Equates_JSB2JS.C_NE:
            // comparing gattr to ""?
            if (Lattr.SYM_C == '\'\'' || Lattr.SYM_C == '""' || Lattr.SYM_C == '``') {
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                if (Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_ESTR || Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VSTR || Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_CSTR) {
                    if (InStr1(1, Gattr.SYM_C, ' ')) Gattr.SYM_C = '(' + CStr(Gattr.SYM_C) + ')';
                } else {
                    Gattr.SYM_C = '!isEmpty(' + CStr(Gattr.SYM_C) + ')';
                }

                return;
            }

            // comparing "" to gattr?
            if (Gattr.SYM_C == '\'\'' || Gattr.SYM_C == '""' || Gattr.SYM_C == '``') {
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                if (Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_ESTR || Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_VSTR || Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_CSTR) {
                    if (InStr1(1, Lattr.SYM_C, ' ')) Gattr.SYM_C = '(' + CStr(Lattr.SYM_C) + ')'; else Gattr.SYM_C = Lattr.SYM_C;
                } else {
                    Gattr.SYM_C = '!isEmpty(' + CStr(Lattr.SYM_C) + ')';
                }

                return;
            }

            Rsy = '!=';
            break;

        case Rop == Equates_JSB2JS.C_GREAT || Rop == Equates_JSB2JS.C_GT:
            Rsy = '\>';
            break;

        case Rop == Equates_JSB2JS.C_LESS || Rop == Equates_JSB2JS.C_LT:
            Rsy = '\<';
            break;

        case Rop == Equates_JSB2JS.C_GE:
            Rsy = '\>=';
            break;

        case Rop == Equates_JSB2JS.C_LE:
            Rsy = '\<=';
    }

    // Both string expressions
    if (Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_ESTR || Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_ESTR) {
        Gattr.SYM_C = CStr(Lattr.SYM_C) + CStr(Rsy) + CStr(Gattr.SYM_C);
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
        return;
    }

    // Both numbers?
    Gnum = Index1(Equates_JSB2JS.TYPE_CNUM + Equates_JSB2JS.TYPE_VNUM + Equates_JSB2JS.TYPE_VBOOL + Equates_JSB2JS.TYPE_ENUM + Equates_JSB2JS.TYPE_EBOOL, Gattr.SYM_TYPE, 1);
    Lnum = Index1(Equates_JSB2JS.TYPE_CNUM + Equates_JSB2JS.TYPE_VNUM + Equates_JSB2JS.TYPE_VBOOL + Equates_JSB2JS.TYPE_ENUM + Equates_JSB2JS.TYPE_EBOOL, Lattr.SYM_TYPE, 1);
    if (CBool(Gnum) && CBool(Lnum)) {
        Gattr.SYM_C = CStr(Lattr.SYM_C) + CStr(Rsy) + CStr(Gattr.SYM_C);
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
        return;
    }

    // if one is a string constant of at least 1 char
    if ((Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_CSTR && Len(Gattr.SYM_C)) || (Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_CSTR && Len(Lattr.SYM_C))) {
        Gattr.SYM_C = CStr(Lattr.SYM_C) + CStr(Rsy) + CStr(Gattr.SYM_C);
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
        return;
    }

    // Both strings?
    Gstr = Index1(Equates_JSB2JS.TYPE_VSTR + Equates_JSB2JS.TYPE_CSTR + Equates_JSB2JS.TYPE_ESTR, Gattr.SYM_TYPE, 1);
    Lstr = Index1(Equates_JSB2JS.TYPE_VSTR + Equates_JSB2JS.TYPE_CSTR + Equates_JSB2JS.TYPE_ESTR, Lattr.SYM_TYPE, 1);
    if (CBool(Gstr) && CBool(Lstr)) {
        Gattr.SYM_C = CStr(Lattr.SYM_C) + CStr(Rsy) + CStr(Gattr.SYM_C);
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
        return;
    }

    // MisMatch Types 
    // If one or the other is numeric, and they can both be converted to a number, do a numeric compare, else do a string compare
    // - here, in the compiler, we make a null into a '', and 0 into a string '0', if possible, javascript will make them numeric if need be

    if (Lattr.SYM_C == 'null') Lattr.SYM_C = '\'\'';
    if (Gattr.SYM_C == 'null') Gattr.SYM_C = '\'\'';
    if (Lattr.SYM_C == '0') Lattr.SYM_C = '\'0\'';
    if (Gattr.SYM_C == '0') Gattr.SYM_C = '\'0\'';

    if (InStr1(1, Equates_JSB2JS.TYPE_VSTR + Equates_JSB2JS.TYPE_VAR + Equates_JSB2JS.TYPE_EXP, Lattr.SYM_TYPE)) Lattr.SYM_C = 'Null0(' + CStr(Lattr.SYM_C) + ')';
    if (InStr1(1, Equates_JSB2JS.TYPE_VSTR + Equates_JSB2JS.TYPE_VAR + Equates_JSB2JS.TYPE_EXP, Gattr.SYM_TYPE)) Gattr.SYM_C = 'Null0(' + CStr(Gattr.SYM_C) + ')';

    Gattr.SYM_C = CStr(Lattr.SYM_C) + CStr(Rsy) + CStr(Gattr.SYM_C);
    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
    return;
}
// </RELCMP>

// <SKIPTEMPLATEHEADER_Sub>
async function JSB2JS_SKIPTEMPLATEHEADER_Sub() {
    // local variables
    var Contents, Lpcnt, Oline, C, C2, Oktotrim, Lline;

    await Include_JSB2JS__Comms(false)

    if (Commons_JSB2JS.Processingtemplates && Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACE) {
        Contents = [undefined,];
        Lpcnt = 1;
        Oline = Commons_JSB2JS.Otkstr;


        do {
            C = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1);
            Commons_JSB2JS.Tkpos++;
            Oline = CStr(Oline) + CStr(C);

            if (isEmpty(C)) {
                Commons_JSB2JS.Tkam++;
                Contents[Contents.length] = Oline;
                Oline = '';
                if (Commons_JSB2JS.Tkam > UBound(Commons_JSB2JS.Itemsrc)) {
                    await Err('Missing } terminator');
                    break;
                }
                Commons_JSB2JS.Tkline = Commons_JSB2JS.Itemsrc[Commons_JSB2JS.Tkam];
                Commons_JSB2JS.Tkpos = 1;;
            } else if (C == '{') {
                Lpcnt = +Lpcnt + 1;;
            } else if (C == '}') {
                Lpcnt = +Lpcnt - 1;
                C = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1);
                if (Null0(Lpcnt) == '0' && C != ',') {
                    break; // Done!;
                }
            } else if (C == '\'' || C == '"' || C == '`') {

                do {
                    C2 = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1);
                    Commons_JSB2JS.Tkpos++;
                    Oline = CStr(Oline) + CStr(C2);

                    if (Null0(C2) == Null0(C)) break;
                    if (isEmpty(C2)) {
                        if (C != '`') {
                            if (C == '"') await Err('Missing string ' + CStr(C) + ' terminator');
                            break;
                        }
                        Commons_JSB2JS.Tkam++;
                        Contents[Contents.length] = Oline;
                        Oline = '';
                        if (Commons_JSB2JS.Tkam > UBound(Commons_JSB2JS.Itemsrc)) {
                            await Err('Missing } terminator');
                            break;
                        }
                        Commons_JSB2JS.Tkline = Commons_JSB2JS.Itemsrc[Commons_JSB2JS.Tkam];
                        Commons_JSB2JS.Tkpos = 1;
                    }
                }
                while (1);
            }// Strings;;
        }
        while (1);
        await Tcv(false);

        Oktotrim = true;
        if (Trim(Oline) == '}') {
            Lline = Contents[UBound(Contents)];
            if (InStr1(1, Lline, '//')) Oktotrim = false;
        }

        Contents[Contents.length] = Oline;
        Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = RTrim(LTrim(Join(Contents, crlf)));
    }
    return;
}
// </SKIPTEMPLATEHEADER_Sub>

// <STATES>
async function states(Ep, Lb) {
    await Include_JSB2JS__Comms(false)

    Commons_JSB2JS.La = CStr(Commons_JSB2JS.La) + CStr(Lb) + Equates_JSB2JS.C_DBLSLASH + Equates_JSB2JS.C_ASTERISK;
    switch (true) {
        case Null0(Ep) == 1:
            await stmProgramBlock(Lb);
            break;

        case Null0(Ep) == 2:
            await stmThenBlock(Lb);
            break;

        case Null0(Ep) == 3:
            await stmStatement(Lb);
            break;

        case Null0(Ep) == 4:
            await stmAfterThen(Lb);
    }
    Commons_JSB2JS.La = Mid1(Commons_JSB2JS.La, 1, Len(Commons_JSB2JS.La) - Len(Lb) - 2);
}
// </STATES>

// <STMPROGRAMBLOCK>
async function stmProgramBlock(Lb) {
    // local variables
    var Dline, Ud7;

    await Include_JSB2JS__Comms(false)

    // Outer most level (Program Block)
    // Assumed beginning of line


    do {
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AM) {
            await Skiprestofline(); // Flush Oc To Ocpgm
            await Tcv(false);

            Dline = LTrim(Mid1(Commons_JSB2JS.Tkline, Index1(Commons_JSB2JS.Tkline, Mid1(Trim(Commons_JSB2JS.Tkline), 1, 1), 1), 999));

            if (isEmpty(Dline)) {
                if (Commons_JSB2JS.Blankok) {
                    Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = '';
                    Commons_JSB2JS.Blankok = 0;
                }
            } else {
                // Comment?
                if ((Mid1(Dline, 1, 1) == '!' || Mid1(Dline, 1, 1) == '*' || Mid1(Dline, 1, 1) == '\'' || Mid1(Dline, 1, 2) == '//')) {
                    Dline = Mid1(Dline, 2, 99999);
                    Dline = Mid1(Dline, Index1(Dline, Mid1(Trim(Dline), 1, 1), 1), 999);
                    Ud7 = UCase(Left(Dline, 7));
                    if (Ud7 != '$DEFINE' && Ud7 != '$OPTION' && Ud7 != '$INCLUD') {

                        while (true) {
                            Dline = LTrim(Dline);
                            if (Not(Left(Dline, 1) == '/')) break;
                            Dline = Mid1(Dline, 2);
                        }

                        if (!Trim(Dline)) {
                            if (Commons_JSB2JS.Blankok) Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = '';
                            Commons_JSB2JS.Blankok = 0;
                        } else {
                            if (Commons_JSB2JS._Incfile == 0 || Commons_JSB2JS.Functiontype == 0) {
                                Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + '// ' + CStr(Dline);
                            }
                            Commons_JSB2JS.Blankok = 1;
                        }
                        Commons_JSB2JS.Tkpos = 9999;
                        Commons_JSB2JS.Tkno = Equates_JSB2JS.C_AM;
                    }
                } else {
                    if (Commons_JSB2JS._Incfile == 0 || Commons_JSB2JS.Functiontype == 0) {
                        if (Commons_JSB2JS.Addcmt) {
                            Commons_JSB2JS.Ocpgm[UBound(Commons_JSB2JS.Ocpgm) + 2] = Space(Commons_JSB2JS.Indent) + '// ***** ' + CStr(Dline);
                        }
                    }
                    Commons_JSB2JS.Blankok = 1;
                }
            }
        }

        // check for labels

        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_NUMBER || (Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1) == ':' && Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1) != '=')) {
            // a LABEL
            Commons_JSB2JS.Tkstr = await Makesubname(Commons_JSB2JS.Tkstr);
            await Deflbl(Commons_JSB2JS.Tkstr, 1);
            if (Right(Commons_JSB2JS.Oc, 1) != ' ') Commons_JSB2JS.Oc = CStr(Commons_JSB2JS.Oc) + ' ';
            await Tcv(false);
            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COLON) await Tcv(false);
        }

        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_AM && Commons_JSB2JS.Tkno != Equates_JSB2JS.C_SM) {
            Commons_JSB2JS.La = CStr(Commons_JSB2JS.La) + Equates_JSB2JS.C_AM; await stmStatement(Lb); Commons_JSB2JS.La = Mid1(Commons_JSB2JS.La, 1, Len(Commons_JSB2JS.La) - 1);
        }

        if (Index1(Equates_JSB2JS.C_STR + Equates_JSB2JS.C_DBLSLASH + Equates_JSB2JS.C_ASTERISK + Equates_JSB2JS.C_BANG + Equates_JSB2JS.C_FSLASH, Commons_JSB2JS.Tkno, 1)) await Skiprestofline();

    }
    while (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AM);
    if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
}
// </STMPROGRAMBLOCK>

// <STMAFTERTHEN>
async function stmAfterThen(Lb) {
    await Include_JSB2JS__Comms(false)

    if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_AM && Commons_JSB2JS.Tkno != Equates_JSB2JS.C_SM) {
        Commons_JSB2JS.La = CStr(Commons_JSB2JS.La) + Equates_JSB2JS.C_AM; await stmStatement(Lb); Commons_JSB2JS.La = Mid1(Commons_JSB2JS.La, 1, Len(Commons_JSB2JS.La) - 1);
    }

    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AM) await stmProgramBlock(Lb);
}
// </STMAFTERTHEN>

// <STMTHENBLOCK>
async function stmThenBlock(Lb) {
    await Include_JSB2JS__Comms(false)

    // THEN block (Statements to EOL or NULL + Program Block)
    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AM || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SEMI || Mid1(Commons_JSB2JS.Tkstr, 1, 1) == '\'' || Commons_JSB2JS.Tkstr == '{' || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_FSLASH || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ASTERISK || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_DBLSLASH) {
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SEMI) {
            await Tcv(false);
            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_AM) {
                // check for comment
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_ASTERISK && Commons_JSB2JS.Tkno != Equates_JSB2JS.C_BANG && Commons_JSB2JS.Tkno != Equates_JSB2JS.C_DBLSLASH && Commons_JSB2JS.Tkno != Equates_JSB2JS.C_STR && Commons_JSB2JS.Tkno != Equates_JSB2JS.C_FSLASH) await Err('Invalid characters');
                await Skiprestofline();
                await Tcv(false); // Skip Over Am;
            }
        } else if (Mid1(Commons_JSB2JS.Tkstr, 1, 1) == '\'' || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_FSLASH || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ASTERISK || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_DBLSLASH) {
            await Skiprestofline();
            await Tcv(false); // Skip Over Am;
        }

        await Reseti(3);
        if (Commons_JSB2JS.Tkstr == '{') {
            await Tcv(false);
            await stmProgramBlock(Lb);
            if (Commons_JSB2JS.Tkstr == '}') await Tcv(false); else await Err('} EXPECTED');
        } else {
            Commons_JSB2JS.La = CStr(Commons_JSB2JS.La) + Equates_JSB2JS.C_END + Equates_JSB2JS.C_ELSE; await stmProgramBlock(Lb); Commons_JSB2JS.La = Mid1(Commons_JSB2JS.La, 1, Len(Commons_JSB2JS.La) - 2);
            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_END) {
                await Tcv(false);
                if (Commons_JSB2JS.Tkstr == 'IF') await Tcv(false);
            } else {
                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_ELSE) await Err('END expected');
            }
        }
        await Reseti(-3);
    } else {
        await stmStatement(Lb);
    }
}
// </STMTHENBLOCK>

// <STMSTATEMENT>
async function stmStatement(Lb) {
    var me = new jsbRoutine("JSB2JS", "STATES", "stmStatement");
    me.localValue = function (varName) { return eval(varName) }
    // local variables
    var Breakcase, Hardstuff, Cmt, Cmd, Ud7, Nextc, Ptkno, Fl;
    var Htk, Begincase, Postpgm, Breaklbl, Holdocpgm, Sellbl, Aexpr;
    var Braces, Holdpgm, Holdhaslbl, Caseblock, Caselbls, Tlbl;
    var Bexpr, Cexpr, Dexpr, Hascond, Wtkno, Endblock, Endlbls;
    var Doblock, Dolbls, Has_While, Has_Until, Has_Step, Isforeach;
    var Foreachassignment, Hasforeachindex, Eexpr, Gexpr, Iexpr;
    var Foreachendexpr, Fexpr, Forblock, Forlbls, Hexpr, Usecounter;
    var Cyclelbl, Exitlbl, Continuelbl, Extra, Ocl, Jmpadr, Sent;
    var Fname, Iname, Hasthenelse, Nextcmd, Params, P, Pstr, I;
    var Crlf, Defaulttext, Loopblock, Looplbls, Lsize, Gtype, Pnum;
    var Cma, Plist, Mult, Defaultfile, Opts, Needsdict, Needsto;
    var Columnlist, Wherestring, Tofile, Fromfile, Fromexpr, Toexpr;
    var Ccexpr, Bccexpr, Subjectexpr, Bodyexpr, Rtype, Hasto;

    await dbgCheck(me, 146, true /* modal */);
    await Include_JSB2JS__Comms(false)

    Commons_JSB2JS.Tmpvari = 0;
    Commons_JSB2JS.La = CStr(Commons_JSB2JS.La) + Equates_JSB2JS.C_SEMI;


    while (true) {
        for (Breakcase = 1; Breakcase <= 1; Breakcase++) {
            Hardstuff = 0;
            switch (true) {
                case Commons_JSB2JS.Tkno == Equates_JSB2JS.C_BANG || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_DBLSLASH || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ASTERISK || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_STR:
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_STR) Cmt = Commons_JSB2JS.Tkstr; else Cmt = Trim(Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 999));
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_FSLASH) Cmt = LTrim(Mid1(Cmd, 2, 999));
                    Ud7 = UCase(Left(Cmt, 7));
                    if (Ud7 == '$INCLUD') {
                        await Tcv(false);
                        Hardstuff = 1;;
                    } else if (Ud7 == '$DEFINE' || Ud7 == '$OPTION') {
                        await Tcv(false);
                        await Options();;
                    } else {
                        if (Commons_JSB2JS._Incfile == 0) {
                            Commons_JSB2JS.Oc = CStr(Commons_JSB2JS.Oc) + '// ' + CStr(Cmt);
                        }
                        Commons_JSB2JS.Tkpos = 9999;
                        Commons_JSB2JS.Tkno = Equates_JSB2JS.C_AM;
                    }

                    break;

                case Commons_JSB2JS.Tkstr == '$DEFINE' || Commons_JSB2JS.Tkstr == '$OPTIONS' || Commons_JSB2JS.Tkstr == '$OPTION':
                    await Options();

                    break;

                case Commons_JSB2JS.Tkstr == 'COMMON' || Commons_JSB2JS.Tkstr == 'COM':
                    await Tcv(false);
                    await Typedef(Equates_JSB2JS.FLAVOR_COMMON, true, false);

                    break;

                case Commons_JSB2JS.Tkstr == 'EQUATE' || Commons_JSB2JS.Tkstr == 'EQU' || Commons_JSB2JS.Tkstr == 'CONST':
                    await Defineequates();

                    break;

                case Commons_JSB2JS.Tkstr == 'SUB' || Commons_JSB2JS.Tkstr == 'SUBROUTINE' || Commons_JSB2JS.Tkstr == 'VOID' || Commons_JSB2JS.Tkstr == 'PROGRAM' || Commons_JSB2JS.Tkstr == 'FUNCTION' || Commons_JSB2JS.Tkstr == 'FUNC' || Commons_JSB2JS.Tkstr == 'COMMONS' || Commons_JSB2JS.Tkstr == 'GLOBALS' || Commons_JSB2JS.Tkstr == 'CLASS' || Commons_JSB2JS.Tkstr == 'PARTIAL' || Commons_JSB2JS.Tkstr == 'PICK' || Commons_JSB2JS.Tkstr == 'RESTFUL':
                    Nextc = Left(LTrim(Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 5)), 1);
                    if (InStr1(1, '=+-*/:\<\>[]()', Nextc)) Hardstuff = 1;

                    break;

                case Commons_JSB2JS.Tkstr == 'REM':

                    while (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_AM && Commons_JSB2JS.Tkno != Equates_JSB2JS.C_SM) {
                        await Tcv(false);
                    }

                    break;

                case Commons_JSB2JS.Tkno == Equates_JSB2JS.C_POUND:
                    await Macro();
                    break;

                case Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SEMI:
                    null;

                    break;

                case !Commons_JSB2JS.Tkstr:
                    Commons_JSB2JS.La = Mid1(Commons_JSB2JS.La, 1, Len(Commons_JSB2JS.La) - 1);
                    return;
                    break;

                case CBool(1):
                    Hardstuff = 1;
            }
        }

        if (CBool(Hardstuff)) {
            // Peek ahead (but not past comments)
            if (Index1(Equates_JSB2JS.C_STR + Equates_JSB2JS.C_DBLSLASH + Equates_JSB2JS.C_ASTERISK + Equates_JSB2JS.C_BANG, Commons_JSB2JS.Tkno, 1)) {
                Ptkno = Equates_JSB2JS.C_QUESTION;
            } else {
                // Check for -=, +=, *=, := /= assignment
                Ptkno = await Peektk();
                if (Index1(Equates_JSB2JS.C_PLUS + Equates_JSB2JS.C_MINUS + Equates_JSB2JS.C_FSLASH + Equates_JSB2JS.C_ASTERISK + Equates_JSB2JS.C_COLON, Ptkno, 1)) {
                    Fl = Mid1(LTrim(Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos)), 2, 1);
                    if (Fl != '=') Ptkno = Equates_JSB2JS.C_QUESTION;
                }
            }

            for (Breakcase = 1; Breakcase <= 1; Breakcase++) {
                Commons_JSB2JS.Hardcode = 1;

                if (Commons_JSB2JS.Tkstr == 'SELECT') {
                    Htk = await Savetk();
                    await Tcv(false);
                    if (Commons_JSB2JS.Tkstr == 'CASE') {
                        await Restoret(Htk);
                    } else {
                        await Restoret(Htk);
                        Commons_JSB2JS.Tkstr = 'SELECTFILE';
                    }
                }

                var dblBreak46 = false;
                switch (true) {
                    case Index1(Equates_JSB2JS.C_EQUAL + Equates_JSB2JS.C_LESS + Equates_JSB2JS.C_LBRACK + Equates_JSB2JS.C_PLUS + Equates_JSB2JS.C_MINUS + Equates_JSB2JS.C_FSLASH + Equates_JSB2JS.C_ASTERISK + Equates_JSB2JS.C_COLON, Ptkno, 1) && Commons_JSB2JS.Tkstr != 'PRINT' && Commons_JSB2JS.Tkstr != 'RETURN' && Commons_JSB2JS.Tkstr != 'FORMLIST' && Commons_JSB2JS.Tkstr != 'SAVELIST' && Commons_JSB2JS.Tkstr != 'WRITELIST' && Commons_JSB2JS.Tkstr != 'CASE':
                        await Assment();

                        break;

                    case Commons_JSB2JS.Tkstr == 'BEGIN' || Commons_JSB2JS.Tkstr == 'SELECT' || Commons_JSB2JS.Tkstr == 'SWITCH':
                        Cmd = Commons_JSB2JS.Tkstr;
                        Begincase = Commons_JSB2JS.Tkstr == 'BEGIN';
                        await Tcv(false);

                        if (CBool(Begincase) && Commons_JSB2JS.Tkstr == 'CASE') await Tcv(false);

                        // BEGIN CASE
                        // CASE AEXPR

                        // OR 
                        // SELECT CASE BEXPR
                        // CASE AEXPR

                        Postpgm = '';
                        Breaklbl = '_toEndCase_' + CStr(Commons_JSB2JS.Nxtlbl); Commons_JSB2JS.Nxtlbl++;

                        if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                        Holdocpgm = Commons_JSB2JS.Ocpgm; Commons_JSB2JS.Ocpgm = [undefined,]; Sellbl = Commons_JSB2JS.Nxtlbl; Commons_JSB2JS.Nxtlbl++;

                        if (CBool(Begincase)) {
                            Commons_JSB2JS.Oc += 'switch (true) { ';
                        } else {
                            if (Commons_JSB2JS.Tkstr == 'CASE') await Tcv(false);
                            Aexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_CASE + Equates_JSB2JS.C_SM + Equates_JSB2JS.C_DEFAULT);
                            Commons_JSB2JS.Oc += 'switch (' + CStr(Aexpr.SYM_C) + ') {';
                        }

                        Braces = Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACE;
                        if (CBool(Braces)) await Tcv(false);

                        // SKIP TO FIRST CASE

                        while (Not(Commons_JSB2JS.Tkno == Equates_JSB2JS.C_CASE || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_DEFAULT || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SM)) {
                            await Tcv(false);
                            Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, '');
                        }

                        // loop on the "Case" labels

                        while (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_CASE || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_DEFAULT) {
                            await Reseti(3);
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_CASE) await Tcv(false);

                            if (Commons_JSB2JS.Tkstr == 'DEFAULT' || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ELSE) {
                                Commons_JSB2JS.Oc += 'default: ';
                                await Tcv(false);
                            } else {
                                // loop on the matching expressions
                                Commons_JSB2JS.Oc += 'case ';

                                while (true) {
                                    Aexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_COLON);
                                    if (CBool(Begincase)) await Makebool(Aexpr, true);
                                    Commons_JSB2JS.Oc += CStr(Aexpr.SYM_C);
                                    if (Not(Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA)) break;
                                    await Tcv(false);
                                    Commons_JSB2JS.Oc += ': case ';
                                }
                                if (Right(RTrim(Commons_JSB2JS.Oc), 1) != ':') Commons_JSB2JS.Oc += ': ';
                            }

                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COLON) await Tcv(false);

                            if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                            await Reseti(3);
                            Holdpgm = Commons_JSB2JS.Ocpgm; Commons_JSB2JS.Ocpgm = [undefined,]; Holdhaslbl = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl = 0;
                            await states(1, '');

                            if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                            Caseblock = Join(Commons_JSB2JS.Ocpgm, Chr(254)); Caselbls = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl += +Holdhaslbl; Commons_JSB2JS.Ocpgm = Holdpgm;
                            await Reseti(-6);

                            if (CBool(Caselbls)) {
                                Tlbl = '_outOfLineCaseBlock_' + CStr(Commons_JSB2JS.Nxtlbl); Commons_JSB2JS.Nxtlbl++;
                                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, '');
                                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent + 6) + 'gotoLabel = "' + CStr(Tlbl) + '"; continue atgoto;' + Chr(254) + Chr(254) + Space(Commons_JSB2JS.Indent));

                                Caseblock = Change(Caseblock, Chr(2) + 'break' + Chr(2), '{ gotoLabel = "' + CStr(Breaklbl) + '"; continue atgoto }');
                                Caseblock = Replace(Caseblock, -1, 0, 0, 'gotoLabel = "' + CStr(Breaklbl) + '"; continue atgoto; ');
                                Postpgm = Replace(Postpgm, -1, 0, 0, Chr(254) + Space(24) + 'case "' + CStr(Tlbl) + '": ' + Chr(254) + CStr(Caseblock));
                            } else {
                                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_END) { Caseblock = Replace(Caseblock, -1, 0, 0, Space(Commons_JSB2JS.Indent) + 'break; ' + Chr(254)); }
                                if (Trim(Caseblock)) Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Caseblock;
                            }
                        }
                        Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent - 3) + '} ');

                        Commons_JSB2JS.Oc = Join(Commons_JSB2JS.Ocpgm, am) + Commons_JSB2JS.Oc; Commons_JSB2JS.Ocpgm = Holdocpgm; Holdocpgm = undefined;

                        if (InStr1(1, Commons_JSB2JS.Oc, Chr(2) + 'break' + Chr(2))) {
                            Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + 'var dblBreak' + CStr(Sellbl) + ' = false;';
                            Commons_JSB2JS.Oc = Change(Commons_JSB2JS.Oc, '; ' + Chr(2) + 'break' + Chr(2), '; dblBreak' + CStr(Sellbl) + ' = true; break');
                            Commons_JSB2JS.Oc = Change(Commons_JSB2JS.Oc, Chr(2) + 'break' + Chr(2), '{ dblBreak' + CStr(Sellbl) + ' = true; break }');
                            Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + 'if (dblBreak' + CStr(Sellbl) + ') ' + Chr(2) + 'break' + Chr(2) + '; ');
                        }

                        if (CBool(Postpgm)) {
                            Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, '');
                            Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + 'gotoLabel = "' + CStr(Breaklbl) + '"; continue atgoto;' + Chr(254));
                            Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Postpgm);
                            Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, '');
                            await Deflbl(Breaklbl, 0);
                        }

                        if (CBool(Braces)) {
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RBRACE) await Tcv(false); else await Err('} expected');
                        } else {
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_END) await Tcv(false);
                            if (Commons_JSB2JS.Tkstr == 'SELECT' || Commons_JSB2JS.Tkstr == 'CASE') await Tcv(false); else await Err('END SELECT expected');
                        }

                        break;

                    case Commons_JSB2JS.Tkstr == 'SQLSELECT':
                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_TO);
                        await Typestr(Equates_JSB2JS.TYPE_DC, Aexpr);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_TO) {
                            await Tcv(false);
                            Bexpr = await Parsevar(1, 0, '', 1);
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK || Commons_JSB2JS.Tkno == Commons_JSB2JS.Mobjectdelemeter) await Err('Invalid reference variable. Too complicated');
                        } else {
                            Bexpr = {};
                            Bexpr.SYM_C = 'odbActiveSelectList';
                        }
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses SQLSELECT';
                        await Uses(Bexpr);
                        Aexpr.SYM_C = 'await asyncDNOSqlSelect(' + CStr(Aexpr.SYM_C) + ', _selectList =\> ' + CStr(Bexpr.SYM_C) + ' = _selectList)';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'BREAK':
                        await Tcv(false);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ON) {
                            await Tcv(false);
                            Commons_JSB2JS.Oc += 'BreakOn(me); ';
                        } else if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_OFF) {
                            await Tcv(false);
                            Commons_JSB2JS.Oc += 'BreakOff(me); ';
                        } else {
                            Commons_JSB2JS.Oc += Chr(2) + 'break' + Chr(2) + '; ';
                        }

                        break;

                    case Commons_JSB2JS.Tkstr == 'CALL':
                        await Tcv(false);
                        // Can't do this, fails CALL @NAME
                        // IF TKNO = C_AT AND TKLINE[TKPOS,1] <> "@" THEN Call Tcv(False) ;* JUST IGNORE IT
                        Aexpr = await Docall(false);

                        break;

                    case Commons_JSB2JS.Tkstr == 'CALLBYNAME':
                        if (Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1) != '@') Commons_JSB2JS.Tkno = Equates_JSB2JS.C_AT;
                        Aexpr = await Docall(false);

                        break;

                    case Commons_JSB2JS.Tkstr == 'CASE':
                        null;

                        break;

                    case Commons_JSB2JS.Tkstr == 'CHAIN':
                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, '');
                        await Typestr(Equates_JSB2JS.TYPE_DC, Aexpr);
                        Commons_JSB2JS.Oc += 'return Chain(' + CStr(Aexpr.SYM_C) + '); ';

                        break;

                    case Commons_JSB2JS.Tkstr == 'CONVERT':
                        await Tcv(false);

                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_TO);
                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_TO) { await Err('TO  expected'); dblBreak46 = true; break; }
                        await Tcv(false);

                        Cexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_IN);
                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_IN) { await Err('IN  expected'); dblBreak46 = true; break; }
                        await Tcv(false);

                        Bexpr = await Parsevar(0, 1, '', 1);
                        await Typestr(Equates_JSB2JS.TYPE_DC, Aexpr);
                        await Typestr(Equates_JSB2JS.TYPE_DC, Cexpr);

                        Dexpr = clone(Bexpr);

                        await Typestr(Equates_JSB2JS.TYPE_DC, Dexpr);
                        Aexpr.SYM_C = 'Convert(' + CStr(Aexpr.SYM_C) + ', ' + CStr(Cexpr.SYM_C) + ', ' + CStr(Dexpr.SYM_C) + ')';
                        await Store(Bexpr, Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'CONTINUE' || Commons_JSB2JS.Tkstr == 'CYCLE':
                        await Tcv(false);
                        Commons_JSB2JS.Oc += Chr(2) + 'continue' + Chr(2) + '; ';

                        break;

                    case Commons_JSB2JS.Tkstr == 'DEBUGGER':
                        await Tcv(false);
                        Commons_JSB2JS.Oc += 'debugger; ';

                        break;

                    case Commons_JSB2JS.Tkstr == 'ECHO':
                        await Tcv(false);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ON) {
                            await Tcv(false);
                            Commons_JSB2JS.Oc += 'activeProcess.At_Echo = 1; ';
                        } else if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_OFF) {
                            await Tcv(false);
                            Commons_JSB2JS.Oc += 'activeProcess.At_Echo = 0; ';
                        } else {
                            await Err('ON/OFF expected');
                        }

                        break;

                    case Commons_JSB2JS.Tkstr == 'ELSE':
                        null;

                        break;

                    case Commons_JSB2JS.Tkstr == 'ELSEIF':
                        Commons_JSB2JS.Tkpos -= 2;
                        Commons_JSB2JS.Tkno = Equates_JSB2JS.C_ELSE;
                        Commons_JSB2JS.Tkstr = 'ELSE';
                        Commons_JSB2JS.Otkstr = 'ELSE';

                        break;

                    case Commons_JSB2JS.Tkstr == 'END':
                        null;
                        break;

                    case Commons_JSB2JS.Tkstr == 'CATCH':
                        null;
                        break;

                    case Commons_JSB2JS.Tkstr == 'ENDIF':
                        null;
                        break;

                    case Commons_JSB2JS.Tkstr == '}':
                        null;

                        break;

                    case Commons_JSB2JS.Tkstr == 'JAVASCRIPT':
                        await Tcv(false);
                        if (Commons_JSB2JS.Tkstr == '{') {
                            Commons_JSB2JS.Oc += await PassThruJavascript();
                        } else {
                            await Err('{ javascript code } expected; Found ' + Commons_JSB2JS.Tkstr);
                        }

                        break;

                    case Commons_JSB2JS.Tkstr == 'EXECUTE':
                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_CAPTURING);
                        await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_CAPTURING) {
                            await Tcv(false);
                            Dexpr = await Parsevar(1, 1, '', 1);
                            Commons_JSB2JS.Oc += 'await asyncTclExecute(' + CStr(Aexpr.SYM_C) + ', _capturedData =\> ' + CStr(Dexpr.SYM_C) + ' = _capturedData)';
                        } else {
                            Commons_JSB2JS.Oc += 'await asyncTclExecute(' + CStr(Aexpr.SYM_C) + '); ';
                        }
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses EXECUTE';

                        break;

                    case Commons_JSB2JS.Tkstr == 'EXIT':
                        await Tcv(false);
                        if (Commons_JSB2JS.Tkstr == 'SUB' || Commons_JSB2JS.Tkstr == 'SUBROUTINE' || Commons_JSB2JS.Tkstr == 'FUNCTION') {
                            if (Left(Commons_JSB2JS.Tkstr, 1) == 'F') Aexpr = await Readsym(Commons_JSB2JS.Funcattr.SYMNAME); else { Aexpr = { "SYM_C": '' } }

                            if (Commons_JSB2JS.Hasbyrefparamters) {
                                Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + 'return exit(' + CStr(Aexpr.SYM_C) + '); ';
                            } else {
                                Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Space(Commons_JSB2JS.Indent) + 'return ' + CStr(Aexpr.SYM_C) + '; ';
                            }

                            await Tcv(false);
                            { dblBreak46 = true; break };;
                        } else if (Commons_JSB2JS.Tkstr == 'FOR' || Commons_JSB2JS.Tkstr == 'LOOP' || Commons_JSB2JS.Tkstr == 'WHILE' || Commons_JSB2JS.Tkstr == 'DO') {
                            await Tcv(false);
                            Commons_JSB2JS.Oc += Chr(2) + 'break' + Chr(2) + '; ';
                        } else {
                            await Err('FOR, LOOP, WHILE, DO EXPECTED');
                        }

                        break;

                    case Commons_JSB2JS.Tkstr == 'FOR':
                        await Tcv(false);

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
                            await Tcv(false); // ' skip (

                            // startstatement
                            await states(3, Equates_JSB2JS.C_SEMI);
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SEMI) await Tcv(false); else { await Err('; expected'); }

                            // Parse While
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SEMI) {
                                Hascond = false;
                            } else {
                                Hascond = true;
                                Wtkno = Equates_JSB2JS.C_WHILE;
                                Cexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_SEMI);
                            }

                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SEMI) await Tcv(false); else { await Err('; expected'); }

                            // endstatement
                            if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                            await Reseti(3);
                            Holdpgm = Commons_JSB2JS.Ocpgm; Commons_JSB2JS.Ocpgm = [undefined,]; Holdhaslbl = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl = 0;
                            await states(3, Equates_JSB2JS.C_RPAREN);
                            if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                            Endblock = Join(Commons_JSB2JS.Ocpgm, Chr(254)); Endlbls = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl += +Holdhaslbl; Commons_JSB2JS.Ocpgm = Holdpgm;
                            await Reseti(-3);

                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) await Tcv(false); else await Err(') expected');

                            // userstatements
                            if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                            await Reseti(3);
                            Holdpgm = Commons_JSB2JS.Ocpgm; Commons_JSB2JS.Ocpgm = [undefined,]; Holdhaslbl = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl = 0;

                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACE) {
                                await Tcv(false);
                                await states(1, Equates_JSB2JS.C_RBRACE);
                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RBRACE) await Tcv(false); else await Err('} expected');
                            } else {
                                await states(2, '');
                            }

                            if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                            Doblock = Join(Commons_JSB2JS.Ocpgm, Chr(254)); Dolbls = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl += +Holdhaslbl; Commons_JSB2JS.Ocpgm = Holdpgm;
                            await Reseti(-3);

                            Doblock = Replace(Doblock, -1, 0, 0, Endblock);
                            await GenLoop(Wtkno, Hascond, '', Cexpr, '', Doblock, false, +Dolbls + +Endlbls);;
                        } else {
                            Has_While = false;
                            Has_Until = false;
                            Has_Step = false;

                            Isforeach = Commons_JSB2JS.Tkstr == 'EACH';
                            Foreachassignment = '';

                            // "for each"
                            if (CBool(Isforeach)) {
                                await Tcv(false);

                                // for Each *AEXPR*, xxx IN xxx
                                Aexpr = await Parsevar(1, 0, Equates_JSB2JS.C_IN + Equates_JSB2JS.C_COMMA, 1);

                                if (!isEmpty(Aexpr.SYM_INDEX1) || !isEmpty(Aexpr.SYM_INDEX2) || CBool(Aexpr.SYM_ATRNO)) {
                                    await Err('For variable must not be an array');
                                }

                                Hasforeachindex = false;

                                // for each xxx, Eexpr in xxx
                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                                    await Tcv(false);
                                    // FOR EACH xxxx, *EEXPR_I* IN xxxx
                                    Eexpr = await Parsevar(1, 0, Equates_JSB2JS.C_IN, 1);
                                    Hasforeachindex = true;
                                } else {
                                    // make our own counting variable
                                    Eexpr = await Definesym(CStr(Aexpr.SYMNAME) + '_Idx', true);
                                    Eexpr.SYM_TYPE = Equates_JSB2JS.TYPE_VNUM;
                                    Eexpr.isAlreadyDefined = true;
                                    await Writesym(Eexpr, Eexpr.SYMNAME);
                                    Eexpr.varPrefixed = true;
                                }

                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_IN) await Tcv(false); else await Err('IN expected');

                                // for each x *IN* GEXPR ...
                                Gexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_STEP + Equates_JSB2JS.C_WHILE + Equates_JSB2JS.C_UNTIL);
                            } else {

                                // FOR Eexpr = Bexpr TO Fexpr STEP Dexpr UNTIL Cexpr
                                // Aexpr = Gexpr[Eexpr]

                                Eexpr = await Parsevar(1, 0, Equates_JSB2JS.C_EQUAL, 1);
                                if (!isEmpty(Eexpr.SYM_INDEX1) || !isEmpty(Eexpr.SYM_INDEX2) || CBool(Eexpr.SYM_ATRNO)) {
                                    await Err('For variable must not be an array');
                                }
                                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_EQUAL) { await Err('= expected'); dblBreak46 = true; break; }

                                // FOR xxx = (BEXPR) To xxx

                                await Tcv(false);
                                Bexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_TO); await Makenum(Equates_JSB2JS.TYPE_VNUM, Bexpr);

                                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_TO) { await Err('TO expected'); dblBreak46 = true; break; }
                                await Tcv(false);

                                // FOR xxx = xx TO (FEXPR)

                                Iexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_STEP + Equates_JSB2JS.C_WHILE + Equates_JSB2JS.C_UNTIL); await Makenum(Equates_JSB2JS.TYPE_VNUM, Iexpr);

                                // If this is a simple constant, no need to copy 
                                if (Iexpr.SYM_TYPE == Equates_JSB2JS.TYPE_CNUM) {
                                    Foreachendexpr = Iexpr.SYM_C;
                                } else {
                                    Foreachendexpr = '_ForEndI_' + CStr(Commons_JSB2JS.Nxtlbl); Commons_JSB2JS.Nxtlbl++;
                                    Fexpr = await Definesym(Foreachendexpr, true);
                                    Fexpr.SYM_C = Foreachendexpr;
                                    Fexpr.SYM_TYPES = Equates_JSB2JS.SYMTYPES_STORED;
                                    Fexpr.isAlreadyDefined = true;
                                    await Writesym(Fexpr, Foreachendexpr);
                                    Commons_JSB2JS.Oc += 'var ';
                                    await Store(Fexpr, Iexpr);
                                }

                                // FOR xxx = xxx TO xxx STEP (DEXPR)

                                Has_Step = (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_STEP);
                                if (CBool(Has_Step)) {
                                    await Tcv(false);
                                    Dexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_WHILE + Equates_JSB2JS.C_UNTIL);
                                    await Makenum(Equates_JSB2JS.TYPE_VNUM, Dexpr);
                                }

                                // FOR EEXPR = BEXPR TO FEXPR STEP DEXPR WHILE CEXPR

                                Has_While = (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_WHILE);
                                Has_Until = (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_UNTIL);
                                if (CBool(Has_While) || CBool(Has_Until)) {
                                    await Tcv(false);
                                    Cexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, '');
                                    await Makebool(Cexpr);
                                }
                            }

                            // FORBLOCK

                            if (Trim(Commons_JSB2JS.Oc)) Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc;
                            Holdpgm = Commons_JSB2JS.Ocpgm; Commons_JSB2JS.Oc = Space(Commons_JSB2JS.Indent + 3); Commons_JSB2JS.Ocpgm = [undefined,]; Holdhaslbl = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl = 0;
                            await Reseti(3);
                            await states(4, Equates_JSB2JS.C_NEXT);
                            await Reseti(-3);

                            if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                            Forblock = Join(Commons_JSB2JS.Ocpgm, Chr(254)); Forlbls = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl += +Holdhaslbl; Commons_JSB2JS.Ocpgm = Holdpgm; Commons_JSB2JS.Oc = Space(Commons_JSB2JS.Indent);

                            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_NEXT) await Err('NEXT expected'); else await Tcv(false);

                            if (Index1(Commons_JSB2JS.La, Commons_JSB2JS.Tkno, 1) == 0) {
                                Hexpr = await Parsevar(0, 0, '', 1);
                                if (Null0(Hexpr.SYM_C) != Null0(Eexpr.SYM_C)) await Warning('Warning: Mismatching for variable');
                            }

                            if (CBool(Isforeach)) {
                                Usecounter = false;

                                if (CBool(Hasforeachindex)) {
                                    if (InStr1(1, Forblock, ' ' + CStr(Eexpr.SYM_C) + ' = ')) Usecounter = true;
                                    if (InStr1(1, Forblock, ' ' + CStr(Eexpr.SYM_C) + ' += ')) Usecounter = true;
                                    if (InStr1(1, Forblock, ' ' + CStr(Eexpr.SYM_C) + ' -= ')) Usecounter = true;
                                    if (InStr1(1, Forblock, ' ' + CStr(Eexpr.SYM_C) + '++')) Usecounter = true;
                                    if (InStr1(1, Forblock, ' ' + CStr(Eexpr.SYM_C) + '--')) Usecounter = true;
                                }

                                Bexpr = {};
                                Bexpr.SYM_C = 'LBound(' + CStr(Gexpr.SYM_C) + ')';
                                Bexpr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;

                                if (CBool(Forlbls) || CBool(Usecounter)) {
                                    // for each aexpr, Eexpr in Gexpr    -> becomes

                                    // fexpr = UBound(GExpr) - unless GExpr is a CStr
                                    // FOR Eexpr = LBound(GExpr) TO Fexpr STEP Dexpr UNTIL Cexpr
                                    // Aexpr = Gexpr[Eexpr]

                                    // Make upper bound Fexpr
                                    if (Gexpr.SYM_TYPE == Equates_JSB2JS.TYPE_ESTR || Gexpr.SYM_TYPE == Equates_JSB2JS.TYPE_CSTR) {
                                        Fexpr = {};
                                        Foreachendexpr = 'UBound(' + CStr(Gexpr.SYM_C) + ')';
                                        Fexpr.SYM_C = Foreachendexpr;
                                        Fexpr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;;
                                    } else {
                                        // Create a fixed UBound( variable )
                                        Foreachendexpr = CStr(Aexpr.SYMNAME) + '_LastI' + CStr(Commons_JSB2JS.Nxtlbl); Commons_JSB2JS.Nxtlbl++;
                                        Fexpr = await Definesym(Foreachendexpr, true); // Create A New Fexpr = {}
                                        Fexpr.SYM_C = Foreachendexpr;
                                        Fexpr.SYM_TYPES = Equates_JSB2JS.SYMTYPES_STORED;
                                        Fexpr.isAlreadyDefined = true;

                                        Iexpr = {};
                                        Iexpr.SYM_C = 'UBound(' + CStr(Gexpr.SYM_C) + ')';
                                        Iexpr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                                        await Makenum(Equates_JSB2JS.TYPE_VNUM, Iexpr);

                                        await Writesym(Fexpr, Foreachendexpr);

                                        Commons_JSB2JS.Oc += 'var ';
                                        await Store(Fexpr, Iexpr);
                                    }

                                    Foreachassignment = Space(Commons_JSB2JS.Indent + 3);
                                    if (CBool(Aexpr.varPrefixed)) Foreachassignment += 'var ';
                                    Foreachassignment += CStr(Aexpr.SYM_C);
                                    Foreachassignment += ' = Extract(' + CStr(Gexpr.SYM_C) + ', ' + CStr(Eexpr.SYM_C) + ', 0, 0); ';
                                    Foreachassignment += Chr(254);
                                    Forblock = CStr(Foreachassignment) + CStr(Forblock);
                                    Isforeach = false;
                                }
                            }

                            // PUT IT ALL TOGETHER
                            if (CBool(Isforeach)) {
                                // FOR EACH aexpr {, Eexpr} In Gexpr   - hasForEachIndex means Eexpr is valid
                                if (CBool(Hasforeachindex)) {
                                    if (CBool(Eexpr.varPrefixed)) Commons_JSB2JS.Oc += 'var ';
                                    Bexpr.SYM_C += '-1';
                                    await Store(Eexpr, Bexpr);
                                    Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent));
                                }

                                Commons_JSB2JS.Oc += 'for (';
                                if (CBool(Aexpr.varPrefixed)) Commons_JSB2JS.Oc += 'var ';
                                Commons_JSB2JS.Oc += CStr(Aexpr.SYM_C) + ' of iterateOver(' + CStr(Gexpr.SYM_C) + ')) ';
                                if (CBool(Hasforeachindex)) {
                                    Forblock = Space(Commons_JSB2JS.Indent + 3) + CStr(Eexpr.SYM_C) + '++; ' + Chr(254) + CStr(Forblock);
                                }

                                Forblock = Change(Forblock, Chr(2) + 'break' + Chr(2), 'break');
                                Forblock = Change(Forblock, Chr(2) + 'continue' + Chr(2), 'continue');

                                Commons_JSB2JS.Oc += '{' + Chr(254) + CStr(Forblock) + Chr(254) + Space(Commons_JSB2JS.Indent) + '} ';;
                            } else if (CBool(Forlbls)) {
                                // FOR Eexpr = Bexpt TO Fexpt STEP Dexpt UNTIL Cexpr

                                // STORE
                                // CYCLELBL:
                                // PRECOND
                                // IF COND THEN GOTO EXITLBL
                                // FORBLOCK
                                // CONTINUELBL:
                                // INCREMENT
                                // GOTO CYCLELBL
                                // EXITLBL:

                                // FOR EEXPR = BEXPR TO FEXPR STEP DEXPR WHILE CEXPR

                                Cyclelbl = '_topOfFor_' + CStr(Commons_JSB2JS.Nxtlbl);
                                Exitlbl = '_exitFor_' + CStr(Commons_JSB2JS.Nxtlbl);
                                Continuelbl = '_continueFor_' + CStr(Commons_JSB2JS.Nxtlbl); Commons_JSB2JS.Nxtlbl++;

                                if (CBool(Eexpr.varPrefixed)) Commons_JSB2JS.Oc += 'var ';
                                await Store(Eexpr, Bexpr);

                                await Deflbl(Cyclelbl, 0);

                                if (CBool(Has_While) || CBool(Has_Until)) Extra = '('; else Extra = '';

                                if (CBool(Has_Step)) {
                                    if (isNumber(Dexpr.SYM_C)) {
                                        if (Null0(Dexpr.SYM_C) < '0') {
                                            Commons_JSB2JS.Oc += 'if (' + CStr(Extra) + CStr(Eexpr.SYM_C) + '\>=' + CStr(Foreachendexpr);
                                        } else {
                                            Commons_JSB2JS.Oc += 'if (' + CStr(Extra) + CStr(Eexpr.SYM_C) + '\<=' + CStr(Foreachendexpr);
                                        }
                                    } else {
                                        // DON'T KNOW DIRECTION
                                        Commons_JSB2JS.Oc += 'if ((' + CStr(Extra) + CStr(Dexpr.SYM_C) + '\>=0)?(' + CStr(Eexpr.SYM_C) + '\<=' + CStr(Foreachendexpr) + '):(' + CStr(Eexpr.SYM_C) + '\>=' + CStr(Foreachendexpr) + ')';
                                    }
                                } else {
                                    Commons_JSB2JS.Oc += 'if (' + CStr(Extra) + CStr(Eexpr.SYM_C) + '\<=' + CStr(Foreachendexpr);
                                }

                                if (CBool(Has_While)) {
                                    Commons_JSB2JS.Oc += ') && ' + CStr(Cexpr.SYM_C);
                                } else if (CBool(Has_Until)) {
                                    Commons_JSB2JS.Oc += ') && Not(' + CStr(Cexpr.SYM_C) + ')';
                                }

                                Commons_JSB2JS.Oc += ') null; else { gotoLabel = "' + CStr(Exitlbl) + '"; continue atgoto } ';

                                Forblock = Change(Forblock, Chr(2) + 'break' + Chr(2), '{ gotoLabel = "' + CStr(Exitlbl) + '"; continue atgoto }');
                                Forblock = Change(Forblock, Chr(2) + 'continue' + Chr(2), '{ gotoLabel = "' + CStr(Continuelbl) + '"; continue atgoto }');
                                Forblock = Change(Forblock, Chr(254) + '   ', Chr(254)); Forblock = Change(Forblock, 'case "_', Space(3) + 'case "_');
                                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Forblock);

                                await Deflbl(Continuelbl, 0);

                                if (Null0(Has_Step) == '0') {
                                    Dexpr = {};
                                    Dexpr.SYM_C = '+1';
                                    Dexpr.SYM_TYPE = Equates_JSB2JS.TYPE_CNUM;
                                }

                                if (Index1('+-', Mid1(Dexpr.SYM_C, 1, 1), 1) == 0) Dexpr.SYM_C = '+' + CStr(Dexpr.SYM_C);
                                Dexpr.SYM_C = CStr(Eexpr.SYM_C) + CStr(Dexpr.SYM_C);
                                await Store(Eexpr, Dexpr);

                                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + 'gotoLabel = "' + CStr(Cyclelbl) + '"; continue atgoto; ');

                                await Deflbl(Exitlbl, 0);;
                            } else {

                                // FOR EEXPR = BEXPR TO FEXPR STEP DEXPR WHILE CEXPR
                                Commons_JSB2JS.Oc += 'for (';

                                if (CBool(Eexpr.varPrefixed)) Commons_JSB2JS.Oc += 'var ';
                                await Store(Eexpr, Bexpr); // Should Already End With ";"

                                if (CBool(Has_While) || CBool(Has_Until)) Extra = '('; else Extra = '';
                                if (CBool(Has_Step)) {

                                    if (isNumber(Dexpr.SYM_C)) {
                                        if (Null0(Dexpr.SYM_C) < '0') {
                                            Commons_JSB2JS.Oc += CStr(Extra) + CStr(Eexpr.SYM_C) + '\>=' + CStr(Foreachendexpr);
                                        } else {
                                            Commons_JSB2JS.Oc += CStr(Extra) + CStr(Eexpr.SYM_C) + '\<=' + CStr(Foreachendexpr);
                                        }
                                    } else {
                                        // DON'T KNOW DIRECTION
                                        Commons_JSB2JS.Oc += '(' + CStr(Extra) + CStr(Dexpr.SYM_C) + '\>=0)?(' + CStr(Eexpr.SYM_C) + '\<=' + CStr(Foreachendexpr) + '):(' + CStr(Eexpr.SYM_C) + '\>=' + CStr(Foreachendexpr) + ')';
                                    }
                                } else {
                                    Commons_JSB2JS.Oc += CStr(Extra) + CStr(Eexpr.SYM_C) + '\<=' + CStr(Foreachendexpr);
                                }

                                // WHILE/UNTIL CEXPR

                                if (CBool(Has_While)) {
                                    Commons_JSB2JS.Oc += ') && ' + CStr(Cexpr.SYM_C);
                                } else if (CBool(Has_Until)) {
                                    Commons_JSB2JS.Oc += ') && Not(' + CStr(Cexpr.SYM_C) + ')';
                                }

                                Commons_JSB2JS.Oc += '; ';

                                if (Null0(Has_Step) == '0') {
                                    Dexpr = {};
                                    Dexpr.SYM_C = '+1';
                                    Dexpr.SYM_TYPE = Equates_JSB2JS.TYPE_CNUM;
                                }
                                if (Index1('+-', Mid1(Dexpr.SYM_C, 1, 1), 1) == 0) Dexpr.SYM_C = '+' + CStr(Dexpr.SYM_C);
                                Dexpr.SYM_C = CStr(Eexpr.SYM_C) + CStr(Dexpr.SYM_C);
                                await Store(Eexpr, Dexpr);

                                // REMOVE LAST ';'
                                Ocl = Len(Commons_JSB2JS.Oc);

                                while (Mid1(Commons_JSB2JS.Oc, Ocl, 1) == ';' || Mid1(Commons_JSB2JS.Oc, Ocl, 1) == ' ') {
                                    Ocl = +Ocl - 1;
                                }

                                Forblock = Change(Forblock, Chr(2) + 'break' + Chr(2), 'break');
                                Forblock = Change(Forblock, Chr(2) + 'continue' + Chr(2), 'continue');
                                Commons_JSB2JS.Oc = Mid1(Commons_JSB2JS.Oc, 1, Ocl) + ') {' + Chr(254) + CStr(Forblock) + Chr(254) + Space(Commons_JSB2JS.Indent) + '} ';
                            }
                        }

                        break;

                    case Commons_JSB2JS.Tkstr == 'GO' || Commons_JSB2JS.Tkstr == 'GOTO':
                        await Tcv(false);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_TO) await Tcv(false);
                        Commons_JSB2JS.Tkstr = await Makesubname(Commons_JSB2JS.Tkstr);
                        Jmpadr = Commons_JSB2JS.Tkstr;
                        await Tcv(false);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COLON) await Tcv(false);
                        Commons_JSB2JS.Oc += 'gotoLabel = "' + CStr(Jmpadr) + '"; continue atgoto; ';
                        await Uselbl(Jmpadr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'GOSUB':
                        await Tcv(false);
                        Commons_JSB2JS.Tkstr = await Makesubname(Commons_JSB2JS.Tkstr);
                        Jmpadr = Commons_JSB2JS.Tkstr;
                        await Uselbl(Jmpadr);
                        await Tcv(false);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COLON) await Tcv(false);
                        Commons_JSB2JS.Hadgosub = 1;
                        Tlbl = '_afterGosub_' + CStr(Commons_JSB2JS.Nxtlbl); Commons_JSB2JS.Nxtlbl++;
                        Commons_JSB2JS.Oc += 'Gosub(me, "' + CStr(Jmpadr) + '", "' + CStr(Tlbl) + '"); continue atgoto; ';
                        await Deflbl(Tlbl, 0);

                        break;

                    case Commons_JSB2JS.Tkstr == 'IF':
                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'INCLUDE' || Commons_JSB2JS.Tkstr == '$INCLUDE' || Commons_JSB2JS.Tkstr == 'INSERT' || Commons_JSB2JS.Tkstr == '$INSERT':
                        if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                        Sent = '';

                        do {
                            await Tcv(false);
                            Sent = CStr(Sent) + Space(Commons_JSB2JS.Spaces) + Commons_JSB2JS.Tkstr;
                        }
                        while (Not(Index1(Equates_JSB2JS.C_AM + Equates_JSB2JS.C_SM + Equates_JSB2JS.C_SEMI + Equates_JSB2JS.C_BANG + Equates_JSB2JS.C_DBLSLASH, Commons_JSB2JS.Tkno, 1)));

                        Sent = Trim(Sent);
                        Fname = Field(Sent, ' ', 1);
                        Iname = Field(Sent, ' ', 2);
                        if (Fname == 'DICT' || Fname == 'DATA') {
                            Fname = 'DICT ' + CStr(Iname);
                            Iname = Field(Sent, ' ', 3);
                        }
                        if (isEmpty(Iname)) {
                            Iname = Fname;
                            Fname = Commons_JSB2JS.Cur_Fname;
                        }

                        await Incfile(Fname, Iname);

                        break;

                    case Commons_JSB2JS.Tkstr == 'I_ATTACHDB':
                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);

                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses I_ATTACHDB';
                        Aexpr.SYM_C = 'await asyncAttach(' + CStr(Aexpr.SYM_C) + ')';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'ATTACHDB':
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses ATTACHDB';

                        await Tcv(false); // Skip ATTACHDB

                        // == Remove Everything Up To Command, So That What Remains We Be Parameterlist
                        Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                        if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }

                        // == Remove Everything Up To Command, So That What Remains We Be Parameterlist
                        Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                        if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }

                        Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 2, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE + Equates_JSB2JS.C_COMMA);

                        // ====================
                        Hasthenelse = (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_THEN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ELSE || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACE);
                        Nextcmd = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Params = Mid1(Commons_JSB2JS.Tkline, 1, +Commons_JSB2JS.Tkstartpos - 1);

                        // Build Subsitution
                        Commons_JSB2JS.Tkline = 'IF @JSB_ODB.ATTACHDB(' + CStr(Params) + ') ';
                        if (CBool(Hasthenelse)) Commons_JSB2JS.Tkline += CStr(Nextcmd); else Commons_JSB2JS.Tkline += ' ELSE STOP @ERRORS';

                        // Re-Parse
                        Commons_JSB2JS.Oc = ''; Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);

                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'INPUT':
                        await Tcv(false);

                        // Handle PRINT portion of INPUT
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AT) {
                            Cexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COLON);
                            await Typestr(Equates_JSB2JS.TYPE_VSTR, Cexpr);
                            if (Cexpr.SYM_C == Equates_JSB2JS.TYPE_CSTR) {
                                P = 1;
                                Pstr = Mid1(Cexpr.SYM_C, 2, Len(Cexpr.SYM_C) - 2);

                                while (true) {
                                    I = Index1(Pstr, '%', P);
                                    if (Not(CBool(I))) break;
                                    Pstr = Mid1(Pstr, 1, +I - 1) + '\\' + Mid1(Pstr, I, 99999);
                                    P = +P + 1;
                                }
                                Commons_JSB2JS.Oc += 'printf(' + CStr(Pstr) + '); ';
                            } else {
                                Commons_JSB2JS.Oc += 'printf("%s",' + CStr(Cexpr.SYM_C) + '); ';
                            }
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COLON) await Tcv(false); else await Err(': expected');
                        }

                        // Next handle the Input Variable (Bexpr)

                        if (Commons_JSB2JS.Tkno < Equates_JSB2JS.C_IDENT) { await Err('Identifier expected'); dblBreak46 = true; break; }
                        Bexpr = await Parsevar(1, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_UNDER + Equates_JSB2JS.C_COLON + Equates_JSB2JS.C_POUND, 1);

                        // next check for options

                        Crlf = 1; Defaulttext = 0;


                        while (InStr1(1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_UNDER + Equates_JSB2JS.C_COLON + Equates_JSB2JS.C_POUND, Commons_JSB2JS.Tkno)) {
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) await Tcv(false);
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COLON) { Crlf = 0; await Tcv(false); }
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_UNDER) { Defaulttext = 1; await Tcv(false); }
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_POUND) { Defaulttext = 1; await Tcv(false); }
                        }

                        Crlf = Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COLON;
                        if (Not(Crlf)) await Tcv(false);

                        // Create INPUTBOX and block
                        if (CBool(Defaulttext)) Defaulttext = Bexpr.SYM_C; else Defaulttext = '';

                        Dexpr = {};
                        Dexpr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                        Dexpr.SYM_C = 'await asyncInput(\'' + Change(Defaulttext, '\'', '\'') + '\')';
                        await Store(Bexpr, Dexpr);

                        if (CBool(Crlf)) {
                            Commons_JSB2JS.Oc += 'if (activeProcess.At_Echo) Println(' + CStr(Bexpr.SYM_C) + '); FlushHTML(); ';
                        } else {
                            Commons_JSB2JS.Oc += 'if (activeProcess.At_Echo) Print(' + CStr(Bexpr.SYM_C) + '); FlushHTML(); ';
                        }

                        break;

                    case Commons_JSB2JS.Tkstr == 'LOCATE':
                        await Tcv(false);

                        // Set defaults

                        Bexpr = {};
                        Bexpr.SYM_TYPE = Equates_JSB2JS.TYPE_CSTR;
                        Bexpr.SYM_C = '""';

                        Cexpr = {};
                        Cexpr.SYM_TYPE = Equates_JSB2JS.TYPE_CSTR;
                        Cexpr.SYM_C = '';

                        Iexpr = {};
                        if (Equates_JSB2JS.TYPE_ENUM == Equates_JSB2JS.TYPE_ENUM) {
                            Iexpr.SYM_TYPE = Equates_JSB2JS.TYPE_CNUM;
                            Iexpr.SYM_C = '0';
                        } else {
                            Iexpr.SYM_TYPE = Equates_JSB2JS.TYPE_CNUM;
                            Iexpr.SYM_C = '0';
                        }
                        Eexpr = clone(Iexpr);
                        Aexpr = clone(Iexpr);

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
                            await Tcv(false);

                            Fexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_SEMI + Equates_JSB2JS.C_RPAREN);
                            await Typestr(Equates_JSB2JS.TYPE_DC, Fexpr);

                            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { await Err(', expected'); dblBreak46 = true; break; }
                            await Tcv(false);

                            Gexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_SEMI + Equates_JSB2JS.C_RPAREN);
                            await Typestr(Equates_JSB2JS.TYPE_VAR, Gexpr);

                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                                await Tcv(false);
                                Iexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_SEMI + Equates_JSB2JS.C_RPAREN);
                                await Typenum(Equates_JSB2JS.TYPE_VNUM, Iexpr);
                            }

                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                                await Tcv(false);
                                Eexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_SEMI + Equates_JSB2JS.C_RPAREN);
                                await Typenum(Equates_JSB2JS.TYPE_VNUM, Eexpr);
                            }

                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SEMI || Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                                await Tcv(false);
                                Cexpr = await Parsevar(1, 0, Equates_JSB2JS.C_SEMI + Equates_JSB2JS.C_RPAREN, 1);
                            }

                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SEMI) {
                                await Tcv(false);
                                Bexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RPAREN);
                                await Typestr(Equates_JSB2JS.TYPE_DC, Bexpr);
                            }
                            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RPAREN) { await Err(') expected'); dblBreak46 = true; break; }
                            await Tcv(false);
                        } else {
                            Fexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_IN);
                            await Typestr(Equates_JSB2JS.TYPE_DC, Fexpr);

                            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_IN) { await Err('IN expected'); dblBreak46 = true; break; }
                            await Tcv(false);

                            // GEXPR = parsevar(0, 0, C_LESS:C_USING:C_SETTING:C_BY:C_THEN:C_ELSE:C_LBRACE, 1)

                            Gexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 2, Equates_JSB2JS.C_LESS + Equates_JSB2JS.C_USING + Equates_JSB2JS.C_SETTING + Equates_JSB2JS.C_BY + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);

                            await Typestr(Equates_JSB2JS.TYPE_VAR, Gexpr);

                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LESS) {
                                await Tcv(false);
                                Iexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_GREAT);
                                await Typenum(Equates_JSB2JS.TYPE_VNUM, Iexpr);
                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                                    await Tcv(false);
                                    Eexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_GREAT);
                                    await Typenum(Equates_JSB2JS.TYPE_VNUM, Eexpr);
                                }
                                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_GREAT) await Err('\> expected'); else await Tcv(false);
                            }

                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                                await Tcv(false);
                                Aexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 2, Equates_JSB2JS.C_USING + Equates_JSB2JS.C_BY + Equates_JSB2JS.C_SETTING + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                                await Typenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);
                            }


                            do {
                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_USING) {
                                    await Tcv(false);
                                    Hexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_USING + Equates_JSB2JS.C_BY + Equates_JSB2JS.C_SETTING + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                                    await Err('USING clause ignored');
                                }

                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_BY) {
                                    await Tcv(false);
                                    Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_USING + Equates_JSB2JS.C_BY + Equates_JSB2JS.C_SETTING + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                                    await Typestr(Equates_JSB2JS.TYPE_DC, Bexpr);
                                }

                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SETTING) {
                                    await Tcv(false);
                                    Cexpr = await Parsevar(1, 0, Equates_JSB2JS.C_USING + Equates_JSB2JS.C_BY + Equates_JSB2JS.C_SETTING + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE, 1);
                                }
                            }
                            while (InStr1(1, Equates_JSB2JS.C_USING + Equates_JSB2JS.C_BY + Equates_JSB2JS.C_SETTING, Commons_JSB2JS.Tkno));
                        }

                        if (CBool(Cexpr.SYM_C)) {
                            Fexpr.SYM_C = 'Locate(' + CStr(Fexpr.SYM_C) + ', ' + CStr(Gexpr.SYM_C) + ', ' + CStr(Iexpr.SYM_C) + ', ' + CStr(Eexpr.SYM_C) + ', ' + CStr(Aexpr.SYM_C) + ', ' + CStr(Bexpr.SYM_C) + ', position =\> ' + CStr(Cexpr.SYM_C) + ' = position)';
                        } else {
                            Fexpr.SYM_C = 'Locate(' + CStr(Fexpr.SYM_C) + ', ' + CStr(Gexpr.SYM_C) + ', ' + CStr(Iexpr.SYM_C) + ', ' + CStr(Eexpr.SYM_C) + ', ' + CStr(Aexpr.SYM_C) + ', ' + CStr(Bexpr.SYM_C) + ', position =\> { })';
                        }

                        Fexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Fexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'LET':
                        await Tcv(false);
                        await Assment();

                        break;

                    case Commons_JSB2JS.Tkstr == 'REMOVE':
                        await Tcv(false);
                        Bexpr = await Parsevar(1, 1, Equates_JSB2JS.C_COMMA, 1);
                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) await Err(', EXPECTED'); else await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 2, '');
                        Commons_JSB2JS.Oc += 'delete ' + CStr(Bexpr.SYM_C) + '[' + CStr(Aexpr.SYM_C) + ']';

                        break;

                    case Commons_JSB2JS.Tkstr == 'THROW':
                        await Tcv(false);
                        Gexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 2, '');
                        await Typestr(Equates_JSB2JS.TYPE_VSTR, Gexpr);
                        Commons_JSB2JS.Oc += 'throw ' + CStr(Gexpr.SYM_C);

                        break;

                    case Commons_JSB2JS.Tkstr == 'TRY':
                        await Tcv(false);
                        Commons_JSB2JS.Oc += 'try {';
                        await Reseti(3);
                        await states(4, Equates_JSB2JS.C_CATCH + Equates_JSB2JS.C_END);
                        if (Right(Commons_JSB2JS.Oc, 3) == '   ') Commons_JSB2JS.Oc = Left(Commons_JSB2JS.Oc, Len(Commons_JSB2JS.Oc) - 3);

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_CATCH) {
                            await Tcv(false);
                            Cexpr = await Parsevar(1, 0, Equates_JSB2JS.C_END, 1);
                            Commons_JSB2JS.Oc += '} catch (' + CStr(Cexpr.SYM_C) + ') { ';
                            await states(4, Equates_JSB2JS.C_END);
                        } else {
                            Commons_JSB2JS.Oc += '} catch (Xerr) { ';
                        }
                        if (Right(Commons_JSB2JS.Oc, 3) == '   ') Commons_JSB2JS.Oc = Left(Commons_JSB2JS.Oc, Len(Commons_JSB2JS.Oc) - 3);
                        Commons_JSB2JS.Oc += '} ';
                        await Reseti(-3);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_END) await Tcv(false);
                        if (Commons_JSB2JS.Tkstr == 'TRY') await Tcv(false); else await Err('END TRY expected');

                        break;

                    case Commons_JSB2JS.Tkstr == 'DO' || Commons_JSB2JS.Tkstr == 'LOOP' || Commons_JSB2JS.Tkstr == 'WHILE':
                        Loopblock = '';
                        Doblock = '';
                        Looplbls = 0;
                        Dolbls = 0;

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_WHILE) {
                            // Vb6 While .. Wend
                            if (Index1(Commons_JSB2JS.La, Equates_JSB2JS.C_WHILE, 1)) {
                                { dblBreak46 = true; break }; // Expecting While In Loop .. While;
                            }
                            // WHILE WHILECOND DOBLOCK WEND
                            await Tcv(false);
                            Cexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_DO);
                            await Makebool(Cexpr);

                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_DO) await Tcv(false);
                            if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                            await Reseti(3);
                            Holdpgm = Commons_JSB2JS.Ocpgm; Commons_JSB2JS.Ocpgm = [undefined,]; Holdhaslbl = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl = 0;
                            await states(4, Equates_JSB2JS.C_REPEAT + Equates_JSB2JS.C_LOOP);
                            if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                            Doblock = Join(Commons_JSB2JS.Ocpgm, Chr(254)); Looplbls += Commons_JSB2JS.Haslbl; Dolbls = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl += +Holdhaslbl; Commons_JSB2JS.Ocpgm = Holdpgm;
                            await Reseti(-3);
                            if (Commons_JSB2JS.Tkstr == 'WEND') await Tcv(false); else {
                                await Err('WEND EXPECTED'); // Repeat Is Extra;
                            }
                            Wtkno = Equates_JSB2JS.C_WHILE;
                            Hascond = 1;;
                        } else if (Commons_JSB2JS.Tkstr == 'DO') {
                            // Vb6 Style Do While ... Loop
                            await Tcv(false);
                            Wtkno = Commons_JSB2JS.Tkno;
                            Hascond = (Wtkno == Equates_JSB2JS.C_WHILE || Wtkno == Equates_JSB2JS.C_UNTIL);
                            if (CBool(Hascond)) {
                                // DO WHILE WHILECOND DOBLOCK LOOP
                                await Tcv(false);
                                Cexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_DO);
                                await Makebool(Cexpr);

                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_DO) await Tcv(false);

                                // DOBLOCK

                                if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                                await Reseti(3);
                                Holdpgm = Commons_JSB2JS.Ocpgm; Commons_JSB2JS.Ocpgm = [undefined,]; Holdhaslbl = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl = 0;
                                await states(4, Equates_JSB2JS.C_REPEAT + Equates_JSB2JS.C_LOOP);
                                if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                                Doblock = Join(Commons_JSB2JS.Ocpgm, Chr(254)); Dolbls = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl += +Holdhaslbl; Commons_JSB2JS.Ocpgm = Holdpgm;
                                await Reseti(-3);

                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LOOP || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_REPEAT) await Tcv(false); else {
                                    await Err('LOOP EXPECTED'); // Repeat Is Extra;
                                }
                            } else {
                                // DO LOOPBLOCK LOOP { WHILE WHILECOND }

                                // LOOPBLOCK

                                if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                                await Reseti(3);
                                Holdpgm = Commons_JSB2JS.Ocpgm; Commons_JSB2JS.Ocpgm = [undefined,]; Holdhaslbl = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl = 0;
                                await states(4, Equates_JSB2JS.C_LOOP + Equates_JSB2JS.C_WHILE + Equates_JSB2JS.C_UNTIL + Equates_JSB2JS.C_REPEAT + Equates_JSB2JS.C_DO);
                                if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                                Loopblock = Join(Commons_JSB2JS.Ocpgm, Chr(254)); Looplbls += Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl += +Holdhaslbl; Commons_JSB2JS.Ocpgm = Holdpgm;
                                await Reseti(-3);

                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LOOP) {
                                    await Tcv(false);
                                } else {
                                    Hascond = (Wtkno == Equates_JSB2JS.C_WHILE || Wtkno == Equates_JSB2JS.C_UNTIL);
                                    if (Not(Hascond)) await Err('LOOP, WHILE or UNTIL expected');
                                }

                                Wtkno = Commons_JSB2JS.Tkno;
                                Hascond = (Wtkno == Equates_JSB2JS.C_WHILE || Wtkno == Equates_JSB2JS.C_UNTIL);
                                if (CBool(Hascond)) {
                                    await Tcv(false);
                                    Cexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, '');
                                    await Makebool(Cexpr);
                                }
                            }
                        } else {
                            // TKSTR = "LOOP"
                            // LOOP
                            // LOOPBLOCK
                            // WHILE WHILECOND DO  --- or --- UNTIL CEXPR DO
                            // DOBLOCK
                            // REPEAT

                            if (Index1(Lb, Equates_JSB2JS.C_LOOP, 1)) { dblBreak46 = true; break };

                            await Tcv(false);
                            Loopblock = '';
                            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_WHILE && Commons_JSB2JS.Tkno != Equates_JSB2JS.C_UNTIL) {

                                // LOOPBLOCK

                                if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                                await Reseti(3);
                                Holdpgm = Commons_JSB2JS.Ocpgm; Commons_JSB2JS.Ocpgm = [undefined,]; Holdhaslbl = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl = 0;
                                await states(4, Equates_JSB2JS.C_WHILE + Equates_JSB2JS.C_UNTIL + Equates_JSB2JS.C_REPEAT + Equates_JSB2JS.C_DO);

                                if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                                Loopblock = Join(Commons_JSB2JS.Ocpgm, Chr(254)); Looplbls += Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl += +Holdhaslbl; Commons_JSB2JS.Ocpgm = Holdpgm;
                                await Reseti(-3);

                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_REPEAT) {
                                    if (!Trim(Commons_JSB2JS.Oc)) Commons_JSB2JS.Oc = Space(Commons_JSB2JS.Indent - 3);
                                    Commons_JSB2JS.Oc += '} while (1); ';
                                }
                            }

                            // COND: CEXPR

                            Wtkno = Commons_JSB2JS.Tkno;
                            Hascond = (Wtkno == Equates_JSB2JS.C_WHILE || Wtkno == Equates_JSB2JS.C_UNTIL);
                            Doblock = '';
                            if (CBool(Hascond)) {
                                await Tcv(false);
                                Cexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_DO + Equates_JSB2JS.C_REPEAT);
                                await Makebool(Cexpr);

                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_REPEAT) {
                                    await Tcv(false);
                                } else {
                                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_DO) await Tcv(false);

                                    // DOBLOCK

                                    if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                                    await Reseti(3);
                                    Holdpgm = Commons_JSB2JS.Ocpgm; Commons_JSB2JS.Ocpgm = [undefined,]; Holdhaslbl = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl = 0;
                                    await states(4, Equates_JSB2JS.C_REPEAT);

                                    if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }
                                    Doblock = Join(Commons_JSB2JS.Ocpgm, Chr(254)); Looplbls += Commons_JSB2JS.Haslbl; Dolbls = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl += +Holdhaslbl; Commons_JSB2JS.Ocpgm = Holdpgm;
                                    await Reseti(-3);

                                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_REPEAT) await Tcv(false); else await Err('REPEAT expected');
                                }
                            } else {
                                if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_REPEAT) await Err('REPEAT expected');
                            }
                        }

                        await GenLoop(Wtkno, Hascond, '', Cexpr, Loopblock, Doblock, Looplbls, Dolbls);

                        break;

                    case Commons_JSB2JS.Tkstr == 'MAT':
                        await Tcv(false);
                        Aexpr = await Matload();
                        Lsize = Commons_JSB2JS.Matloadsize;

                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_EQUAL) await Err('= expected'); else await Tcv(false);

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_MAT) {
                            // Mat A = Mat B
                            await Tcv(false);
                            Bexpr = await Matload();

                            if (Not(Aexpr.SYM_INDEX1) || Not(Bexpr.SYM_INDEX1) || (CBool(Aexpr.SYM_INDEX2) && Not(Bexpr.SYM_INDEX2)) || (Not(Aexpr.SYM_INDEX2) && CBool(Bexpr.SYM_INDEX2))) await Err('MISMATCHED DIMENSIONS');

                            Bexpr.SYM_C = 'clone(' + CStr(Bexpr.SYM_C) + ')';

                            Aexpr.SYM_INDEX1 = ''; Aexpr.SYM_INDEX2 = '';
                            Bexpr.SYM_INDEX1 = ''; Bexpr.SYM_INDEX2 = '';
                            await Store(Aexpr, Bexpr);
                        } else {
                            // MAT AEXPR = BEXPR
                            Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, '');
                            Commons_JSB2JS.Oc += CStr(Aexpr.SYM_C) + ' = createArray(' + CStr(Bexpr.SYM_C) + ', ' + CStr(Aexpr.SYM_INDEX1);
                            if (CBool(Aexpr.SYM_INDEX2)) Commons_JSB2JS.Oc += ', ' + CStr(Aexpr.SYM_INDEX2);
                            Commons_JSB2JS.Oc += '); ';
                        }

                        break;

                    case Commons_JSB2JS.Tkstr == 'NEXT':
                        null;

                        break;

                    case Commons_JSB2JS.Tkstr == 'NULL':
                        await Tcv(false);
                        Commons_JSB2JS.Oc += 'null; ';
                        { dblBreak46 = true; break };

                        break;

                    case Commons_JSB2JS.Tkstr == 'ON':
                        await Tcv(false);
                        if (Commons_JSB2JS.Tkstr == 'ERR' || Commons_JSB2JS.Tkstr == 'ERROR') {
                            await Tcv(false);
                            if (Commons_JSB2JS.Tkstr == 'GOTO') {
                                await Tcv(false);
                                if (Commons_JSB2JS.Tkstr == '0') {
                                    Commons_JSB2JS.Oc += 'onError' + 'Goto = null; ';
                                    await Tcv(false);
                                } else {
                                    Commons_JSB2JS.Tkstr = await Makesubname(Commons_JSB2JS.Tkstr);
                                    Commons_JSB2JS.Oc += 'onError' + 'Goto = "' + Commons_JSB2JS.Tkstr + '"; ';
                                    await Uselbl(Commons_JSB2JS.Tkstr);
                                    await Tcv(false);
                                }
                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COLON) await Tcv(false);
                            } else if (Commons_JSB2JS.Tkstr == 'RESUME') {
                                await Err('RESUME NEXT not supported');;
                            } else {
                                await Err('GOTO expected');
                            }
                        } else {
                            Aexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_GOTO + Equates_JSB2JS.C_GOSUB);
                            await Typenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);

                            Gtype = Commons_JSB2JS.Tkno;
                            if (Index1(Equates_JSB2JS.C_GOSUB + Equates_JSB2JS.C_GOTO, Gtype, 1) == 0) {
                                await Err('GOTO expected');
                                Commons_JSB2JS.Hadgosub = 1;
                                { dblBreak46 = true; break };
                            }
                            await Tcv(false);

                            Commons_JSB2JS.Oc += 'switch (' + CStr(Aexpr.SYM_C) + ') { ';
                            if (Gtype == Equates_JSB2JS.C_GOSUB) {
                                Commons_JSB2JS.Hadgosub = 1;
                                Tlbl = '_' + CStr(Commons_JSB2JS.Nxtlbl); Commons_JSB2JS.Nxtlbl++;
                            }

                            Pnum = 0;

                            while (true) {
                                Pnum = +Pnum + 1;
                                Commons_JSB2JS.Tkstr = await Makesubname(Commons_JSB2JS.Tkstr);
                                Jmpadr = Commons_JSB2JS.Tkstr;
                                await Uselbl(Jmpadr);

                                if (Gtype == Equates_JSB2JS.C_GOSUB) {
                                    Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent + 3) + 'case ' + CStr(Pnum) + ':  Gosub(me, ' + CStr(Jmpadr) + '", "' + CStr(Tlbl) + '"); continue atgoto; ');
                                } else {
                                    Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent + 3) + 'case ' + CStr(Pnum) + ': gotoLabel = "' + CStr(Jmpadr) + '"; continue atgoto;');
                                }

                                await Tcv(false);
                                if (Not(Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA)) break;
                                await Tcv(false);
                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AM) await Tcv(false)
                            }
                            Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + '} ');

                            if (Gtype == Equates_JSB2JS.C_GOSUB) await Deflbl(Tlbl, 0);
                        }
                        break;

                    case Commons_JSB2JS.Tkstr == 'PRINT' || Commons_JSB2JS.Tkstr == 'STOP' || Commons_JSB2JS.Tkstr == 'ABORT' || Commons_JSB2JS.Tkstr == 'DEBUG':
                        Cmd = Commons_JSB2JS.Tkstr;
                        await Tcv(false);

                        if (Index1(Commons_JSB2JS.La, Commons_JSB2JS.Tkno, 1) && (Cmd == 'STOP' || Cmd == 'ABORT')) {
                            Commons_JSB2JS.Oc += 'return Stop(); ';;
                        } else {
                            if (Trim(Commons_JSB2JS.Oc)) Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc;
                            Commons_JSB2JS.Oc = Space(Commons_JSB2JS.Indent);
                            Cma = '';
                            Plist = '';
                            Crlf = Cmd == 'PRINT';

                            while (Not(Index1(Commons_JSB2JS.La, Commons_JSB2JS.Tkno, 1))) {
                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                                    Plist = CStr(Plist) + ', "\\t"';
                                    Cma = ', ';
                                    await Tcv(false);
                                    Crlf = 0;;
                                } else if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COLON) {
                                    await Tcv(false);
                                    Crlf = 0;;
                                } else {
                                    Crlf = 1;
                                    Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_COLON);
                                    await Typestr(Equates_JSB2JS.TYPE_DC, Aexpr);
                                    Plist = CStr(Plist) + CStr(Cma) + CStr(Aexpr.SYM_C);
                                    Cma = ', ';
                                    Crlf = 1;
                                }
                            }

                            if (Cmd == 'STOP' || Cmd == 'ABORT') {
                                Commons_JSB2JS.Oc += 'return Stop(' + CStr(Plist) + '); ';
                            } else {
                                if (CBool(Crlf)) { Commons_JSB2JS.Oc += 'Println(' + CStr(Plist) + '); '; } else { Commons_JSB2JS.Oc += 'Print(' + CStr(Plist) + '); '; }
                            }
                        }

                        if (Cmd == 'DEBUG') {
                            if (Commons_JSB2JS.Adddebugging && !Commons_JSB2JS.Notasyncfunction) {
                                Commons_JSB2JS.Oc += 'await dbgCheck(me, ' + CStr(Commons_JSB2JS.Tkam + 1) + ', false, true); ';
                            } else {
                                Commons_JSB2JS.Oc += 'debugger; ';
                            }
                        }

                        break;

                    case Commons_JSB2JS.Tkstr == 'PROMPT':
                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, '');
                        await Typestr(Equates_JSB2JS.TYPE_DC, Aexpr);
                        Bexpr = {};
                        Bexpr.SYM_C = 'activeProcess.At_Prompt';
                        Bexpr.SYM_TYPE = Equates_JSB2JS.TYPE_VSTR;
                        await Store(Bexpr, Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'REPEAT':
                        null;

                        break;

                    case Commons_JSB2JS.Tkstr == 'RETURN':
                        await Tcv(false);

                        // Return To for Gosub's
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_TO) {
                            await Tcv(false);
                            Jmpadr = Commons_JSB2JS.Tkstr;
                            await Tcv(false);
                            await Uselbl(Jmpadr);
                            Commons_JSB2JS.Oc += 'if (ReturnTo("L_' + CStr(Jmpadr) + '")) continue atgoto; else return exit(); ';
                            Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses RETURN TO';

                            // functionType ;* -1) Commons, 0) Program, 1) Subroutine, 2) function, 3) @@function, 4) Pick/RESTFUL function;
                        } else if (Commons_JSB2JS.Functiontype == 2 && Index1(Commons_JSB2JS.La, Commons_JSB2JS.Tkno, 1) == 0) {
                            // inside a function, with a possible arugment
                            Aexpr = await Expr(Commons_JSB2JS.Funcattr.SYM_TYPE, 1, '');
                            await JSB2JS_MAKEAFROMB_Sub(Aexpr, Commons_JSB2JS.Funcattr, function (_Aexpr, _Funcattr) { Aexpr = _Aexpr; Commons_JSB2JS.Funcattr = _Funcattr });

                            if (Commons_JSB2JS.Hasbyrefparamters) {
                                Commons_JSB2JS.Oc += 'return exit(' + CStr(Aexpr.SYM_C) + '); ';
                            } else {
                                Commons_JSB2JS.Oc += 'return ' + CStr(Aexpr.SYM_C) + '; ';
                            }

                            // a Return by itself can be a Gosub's return;
                        } else if (Index1(Commons_JSB2JS.La, Commons_JSB2JS.Tkno, 1) && (Commons_JSB2JS.Haslbl || Commons_JSB2JS.Hadgosub)) {
                            if (Commons_JSB2JS.Hasbyrefparamters) {
                                Commons_JSB2JS.Oc += 'if (isGosubRtn(me)) continue atgoto; else return exit(undefined); ';
                            } else {
                                Commons_JSB2JS.Oc += 'if (isGosubRtn(me)) continue atgoto; else return;  ';
                            }
                        } else if (CBool(Commons_JSB2JS.Ispickfunction) && Index1(Commons_JSB2JS.La, Commons_JSB2JS.Tkno, 1) == 0) {
                            Aexpr = await Expr(Commons_JSB2JS.Funcattr.SYM_TYPE, 1, '');
                            Commons_JSB2JS.Oc += 'return At_Response.redirect(\'close_html?pick=\' + urlEncode(' + CStr(Aexpr.SYM_C) + ')); ';;
                        } else if (CBool(Commons_JSB2JS.Isrestfulfunction)) {
                            Aexpr = await Expr(Commons_JSB2JS.Funcattr.SYM_TYPE, 1, '');
                            Bexpr = {};
                            Bexpr.SYM_C = 'Restful_Result';
                            Bexpr.SYM_TYPE = Equates_JSB2JS.TYPE_VSTR;
                            await Store(Bexpr, Aexpr);
                            Commons_JSB2JS.Oc += 'gotoLabel = "RESTFUL_SERVEREXIT"; continue atgoto; ';
                            Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses RESTFUL';;
                        } else {
                            if (Index1(Commons_JSB2JS.La, Commons_JSB2JS.Tkno, 1) == 0) await Err('Unexpected Arugment for subroutine return');
                            if (Commons_JSB2JS.Hasbyrefparamters) {
                                Commons_JSB2JS.Oc += 'return exit(undefined); ';
                            } else {
                                Commons_JSB2JS.Oc += 'return; ';
                            }
                        }

                        break;

                    case Commons_JSB2JS.Tkstr == 'THEN':
                        null;

                        break;

                    case Commons_JSB2JS.Tkstr == 'THROW':
                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, '');
                        await Typestr(Equates_JSB2JS.TYPE_DC, Aexpr);
                        Commons_JSB2JS.Oc += 'throw ' + CStr(Aexpr.SYM_C) + '; ';

                        break;

                    case Commons_JSB2JS.Tkstr == 'UNTIL':
                        null;
                        break;

                    case Commons_JSB2JS.Tkstr == 'WEND':
                        null;

                        break;

                    case Commons_JSB2JS.Tkstr == 'SLEEP' || Commons_JSB2JS.Tkstr == 'NAP':
                        if (Commons_JSB2JS.Tkstr == 'SLEEP') Mult = ' * 1000'; else Mult = '';
                        await Tcv(false);
                        if (Index1(Commons_JSB2JS.La, Commons_JSB2JS.Tkno, 1) == 0) {
                            Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, '');
                            await Typenum(Equates_JSB2JS.TYPE_VNUM, Aexpr);;
                        } else {
                            Aexpr = {};
                            Aexpr.SYM_C = '1';
                            Mult = '';
                        }
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses SLEEP OR NAP';
                        Commons_JSB2JS.Oc += 'await asyncSleep(' + CStr(Aexpr.SYM_C) + CStr(Mult) + '); ';

                        break;

                    case Commons_JSB2JS.Tkstr == 'RQM' || Commons_JSB2JS.Tkstr == 'DOEVENTS':
                        await Tcv(false);
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses RQM OR DOEVENTS';
                        Commons_JSB2JS.Oc += 'await asyncSleep(1); ';

                        break;

                    case Commons_JSB2JS.Tkstr == 'SETAUTHCOOKIE' || Commons_JSB2JS.Tkstr == 'SIGNOUT':
                        // IGNORE THESE COMMANDS

                        while (!(Index1(Equates_JSB2JS.C_SEMI + Equates_JSB2JS.C_AM + Equates_JSB2JS.C_SM, Commons_JSB2JS.Tkno, 1))) {
                            await Tcv(false);
                        }

                        break;

                    case Commons_JSB2JS.Tkstr == 'DIM' || Commons_JSB2JS.Tkstr == 'VAR':
                        await Tcv(false);

                        await Typedef(Equates_JSB2JS.FLAVOR_LOCAL, true, false);

                        if (false) {
                            Htk = await Savetk();

                            Aexpr = await Parsevar(2, 1, Equates_JSB2JS.C_EQUAL, 0);

                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_EQUAL) {
                                await Restoret(Htk);

                                // INJECT "this." for class variables
                                if (CBool(Commons_JSB2JS.Insideclass) && Right(Commons_JSB2JS.Subname, 4) == '_NEW' && Commons_JSB2JS.Tkstr != 'THIS' && Commons_JSB2JS.Tkstr != 'ME') {
                                    Commons_JSB2JS.Tkpos -= Len(Commons_JSB2JS.Tkstr);
                                    Commons_JSB2JS.Tkline = Left(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos - 1) + 'this' + CStr(Commons_JSB2JS.Mobjectdelemeter) + Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos);
                                    Commons_JSB2JS.Tkno = Equates_JSB2JS.C_IDENT;
                                    await Tcv(false);
                                }

                                await Assment();
                            } else {
                                await Restoret(Htk);
                                await Typedef(Equates_JSB2JS.FLAVOR_LOCAL, true, false);
                            }
                        }

                        // =========================================== Substitution calls ===============================================
                        // =========================================== Substitution calls ===============================================
                        // =========================================== Substitution calls ===============================================
                        // =========================================== Substitution calls ===============================================
                        // =========================================== Substitution calls ===============================================
                        break;

                    case Commons_JSB2JS.Tkstr == 'LISTFILES':
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses LISTFILES';

                        await Tcv(false); // Skip Listfiles
                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_TO) { await Err('TO EXPECTED'); return; }

                        await Tcv(false); // Skip To

                        // == Remove Everything Up To Command, So That What Remains We Be Parameterlist
                        Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                        if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }

                        // ==================
                        Aexpr = await Parsevar(1, 0, Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_LBRACE, 1); // Storing,Matok, Gattr, Lb, Showerrors)
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK || Commons_JSB2JS.Tkno == Commons_JSB2JS.Mobjectdelemeter) await Err('Invalid reference variable. Too complicated');

                        // ====================
                        Hasthenelse = (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_THEN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ELSE || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACE);
                        Nextcmd = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Params = Mid1(Commons_JSB2JS.Tkline, 1, +Commons_JSB2JS.Tkstartpos - 1);

                        // Build Subsitution
                        Commons_JSB2JS.Tkline = 'IF @JSB_ODB.LISTFILES(' + CStr(Params) + ') ';
                        if (CBool(Hasthenelse)) Commons_JSB2JS.Tkline += CStr(Nextcmd); else Commons_JSB2JS.Tkline += ' ELSE STOP @ERRORS';

                        // Re-Parse
                        Commons_JSB2JS.Oc = ''; Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);

                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'CREATEFILE' || Commons_JSB2JS.Tkstr == 'CREATETABLE':
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses CREATEFILE';

                        await Tcv(false); // Skip Create

                        // == Remove Everything Up To Command, So That What Remains We Be Parameterlist
                        Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                        if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }

                        Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 2, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE + Equates_JSB2JS.C_COMMA);

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                            await Tcv(false); // Skip Comma
                            Bexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        }

                        Hasthenelse = (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_THEN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ELSE || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACE);
                        Nextcmd = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Params = Mid1(Commons_JSB2JS.Tkline, 1, +Commons_JSB2JS.Tkstartpos - 1);

                        // Build Subsitution
                        Commons_JSB2JS.Tkline = 'IF @JSB_ODB.CREATEFILE(' + CStr(Params) + ') ';
                        if (CBool(Hasthenelse)) Commons_JSB2JS.Tkline += CStr(Nextcmd); else Commons_JSB2JS.Tkline += ' ELSE STOP @ERRORS';

                        // Re-Parse
                        Commons_JSB2JS.Oc = ''; Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);

                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'CLEARFILE' || Commons_JSB2JS.Tkstr == 'CLEARTABLE':
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses CLEARFILE';

                        await Tcv(false); // Skip Clearfile

                        // == Remove Everything Up To Command, So That What Remains We Be Parameterlist
                        Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                        if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }

                        Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 2, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);

                        Hasthenelse = (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_THEN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ELSE || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACE);
                        Nextcmd = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Params = Mid1(Commons_JSB2JS.Tkline, 1, +Commons_JSB2JS.Tkstartpos - 1);

                        // Build Subsitution
                        Commons_JSB2JS.Tkline = 'IF @JSB_ODB.CLEARFILE(' + CStr(Params) + ') ';
                        if (CBool(Hasthenelse)) Commons_JSB2JS.Tkline += CStr(Nextcmd); else Commons_JSB2JS.Tkline += ' ELSE STOP @ERRORS';

                        // Re-Parse
                        Commons_JSB2JS.Oc = ''; Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);

                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'DELETE':
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses DELETE';

                        await Tcv(false); // Skip Delete
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_FROM) await Tcv(false);

                        // TKPOS IS ALREADY PAST THE DELETE.
                        Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos); // Remove Anything Up To Delete Command
                        Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);

                        if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }

                        // PARSE FILENO
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);

                        // PARSE ITEMNAME
                        Defaultfile = Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA;
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                            await Tcv(false); // Skip Comma
                            Bexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        }

                        Hasthenelse = (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_THEN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ELSE || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACE);
                        Nextcmd = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Params = Mid1(Commons_JSB2JS.Tkline, 1, +Commons_JSB2JS.Tkstartpos - 1);
                        if (CBool(Defaultfile)) Params = '@FILE, ' + CStr(Params);

                        // BUILD SUBSITUTION
                        Commons_JSB2JS.Tkline = 'IF @JSB_ODB.DELETEITEM(' + CStr(Params) + ') ';
                        if (CBool(Hasthenelse)) Commons_JSB2JS.Tkline += CStr(Nextcmd); else Commons_JSB2JS.Tkline += ' ELSE STOP @ERRORS';

                        Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);

                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'DELETEFILE' || Commons_JSB2JS.Tkstr == 'DELETETABLE':
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses DELETEFILE';

                        await Tcv(false); // Skip Create

                        // == Remove Everything Up To Command, So That What Remains We Be Parameterlist
                        Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                        if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }

                        Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 2, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);

                        Hasthenelse = (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_THEN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ELSE || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACE);
                        Nextcmd = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Params = Mid1(Commons_JSB2JS.Tkline, 1, +Commons_JSB2JS.Tkstartpos - 1);

                        // Build Subsitution
                        Commons_JSB2JS.Tkline = 'IF @JSB_ODB.DELETEFILE(' + CStr(Params) + ') ';
                        if (CBool(Hasthenelse)) Commons_JSB2JS.Tkline += CStr(Nextcmd); else Commons_JSB2JS.Tkline += ' ELSE STOP @ERRORS';

                        // Re-Parse
                        Commons_JSB2JS.Oc = ''; Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);

                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'WRITE' || Commons_JSB2JS.Tkstr == 'WRITEU' || Commons_JSB2JS.Tkstr == 'WRITEXML' || Commons_JSB2JS.Tkstr == 'WRITEXMLU' || Commons_JSB2JS.Tkstr == 'WRITEJSON' || Commons_JSB2JS.Tkstr == 'WRITEJSONU' || Commons_JSB2JS.Tkstr == 'WRITEV' || Commons_JSB2JS.Tkstr == 'WRITEVU' || Commons_JSB2JS.Tkstr == 'MATWRITE' || Commons_JSB2JS.Tkstr == 'MATWRITEU':
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses WRITE';

                        switch (true) {
                            case Commons_JSB2JS.Tkstr == 'WRITE':
                                Opts = '';
                                break;

                            case Commons_JSB2JS.Tkstr == 'WRITEXML':
                                Opts = 'XML';
                                break;

                            case Commons_JSB2JS.Tkstr == 'WRITEJSON':
                                Opts = 'JSON';
                                break;

                            case Commons_JSB2JS.Tkstr == 'WRITEV':
                                Opts = 'V';
                                break;

                            case Commons_JSB2JS.Tkstr == 'MATWRITE':
                                Opts = '';

                                break;

                            case Commons_JSB2JS.Tkstr == 'WRITEU':
                                Opts = 'U';
                                break;

                            case Commons_JSB2JS.Tkstr == 'WRITEXMLU':
                                Opts = 'XMLU';
                                break;

                            case Commons_JSB2JS.Tkstr == 'WRITEJSONU':
                                Opts = 'JSONU';
                                break;

                            case Commons_JSB2JS.Tkstr == 'WRITEVU':
                                Opts = 'VU';
                                break;

                            case Commons_JSB2JS.Tkstr == 'MATWRITEU':
                                Opts = 'U';
                        }

                        // Write (*Aexpr) On Aexpr, Idattr Then, Aexprlink Pc
                        await Tcv(false);

                        // == Remove Everything Up To Command, So That What Remains We Be Parameterlist
                        Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                        if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }

                        Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_ON + Equates_JSB2JS.C_TO + Equates_JSB2JS.C_FROM);
                        if (isEmpty(Opts) || Opts == 'V' || Opts == 'U' || Opts == 'VU') await Makestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);

                        if ((Commons_JSB2JS.Tkno != Equates_JSB2JS.C_ON) && (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_TO) && (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_FROM)) { await Err('ON EXPECTED'); return; }
                        await Tcv(false);

                        Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);

                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { await Err(', EXPECTED'); return; }
                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_ELSE);

                        if (InStr1(1, Opts, 'V')) {
                            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { await Err(', EXPECTED'); return; }
                            await Tcv(false);
                            Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        }

                        Hasthenelse = (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_THEN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ELSE || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACE);
                        Nextcmd = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Params = Mid1(Commons_JSB2JS.Tkline, 1, +Commons_JSB2JS.Tkstartpos - 1);

                        Params = ChangeI(Params, ' ON ', ',');

                        // Build Subsitution
                        Commons_JSB2JS.Tkline = 'IF @JSB_ODB.WRITE' + CStr(Opts) + '(' + CStr(Params) + ') ';
                        if (CBool(Hasthenelse)) Commons_JSB2JS.Tkline += CStr(Nextcmd); else Commons_JSB2JS.Tkline += ' ELSE STOP @ERRORS';

                        // Re-Parse
                        Commons_JSB2JS.Oc = ''; Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);

                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'MATREAD' || Commons_JSB2JS.Tkstr == 'MATREADU' || Commons_JSB2JS.Tkstr == 'READ' || Commons_JSB2JS.Tkstr == 'READU' || Commons_JSB2JS.Tkstr == 'READV' || Commons_JSB2JS.Tkstr == 'READVU' || Commons_JSB2JS.Tkstr == 'READXML' || Commons_JSB2JS.Tkstr == 'READXMLU' || Commons_JSB2JS.Tkstr == 'READJSON' || Commons_JSB2JS.Tkstr == 'READJSONU':
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses READ';

                        switch (true) {
                            case Commons_JSB2JS.Tkstr == 'READ':
                                Opts = '';
                                break;

                            case Commons_JSB2JS.Tkstr == 'READXML':
                                Opts = 'XML';
                                break;

                            case Commons_JSB2JS.Tkstr == 'READJSON':
                                Opts = 'JSON';
                                break;

                            case Commons_JSB2JS.Tkstr == 'READV':
                                Opts = 'V';

                                break;

                            case Commons_JSB2JS.Tkstr == 'READU':
                                Opts = 'U';
                                break;

                            case Commons_JSB2JS.Tkstr == 'READUXML':
                                Opts = 'XMLU';
                                break;

                            case Commons_JSB2JS.Tkstr == 'READUJSON':
                                Opts = 'JSONU';
                                break;

                            case Commons_JSB2JS.Tkstr == 'READUV':
                                Opts = 'VU';

                                break;

                            case Commons_JSB2JS.Tkstr == 'READXMLU':
                                Opts = 'XMLU';
                                break;

                            case Commons_JSB2JS.Tkstr == 'READJSONU':
                                Opts = 'JSONU';
                                break;

                            case Commons_JSB2JS.Tkstr == 'READVU':
                                Opts = 'VU';
                                break;

                            case Commons_JSB2JS.Tkstr == 'MATREAD':
                                Opts = 'M';
                                break;

                            case Commons_JSB2JS.Tkstr == 'MATREADU':
                                Opts = 'MU';
                        }

                        await Tcv(false);

                        // == Remove Everything Up To Command, So That What Remains We Be Parameterlist
                        Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                        if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }

                        Aexpr = await Parsevar(1, 1, Equates_JSB2JS.C_FROM, 1);

                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_FROM) { await Err('FROM EXPECTED'); return; }

                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 2, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);

                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { await Err(', EXPECTED'); return; }
                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_ELSE);

                        if (InStr1(1, Opts, 'V')) {
                            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) { await Err(', EXPECTED'); return; }
                            await Tcv(false);
                            Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        }

                        Hasthenelse = (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_THEN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ELSE || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACE);
                        Nextcmd = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Params = Mid1(Commons_JSB2JS.Tkline, 1, +Commons_JSB2JS.Tkstartpos - 1);

                        Params = ChangeI(Params, ' FROM ', ',');

                        // Build Subsitution
                        Commons_JSB2JS.Tkline = 'IF @JSB_ODB.READ' + CStr(Opts) + '(' + CStr(Params) + ') ';
                        if (CBool(Hasthenelse)) Commons_JSB2JS.Tkline += CStr(Nextcmd); else Commons_JSB2JS.Tkline += ' ELSE STOP @ERRORS';

                        // Re-Parse
                        Commons_JSB2JS.Oc = ''; Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);

                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'OPEN':
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses OPEN';

                        await Tcv(false);

                        // == Remove Everything Up To Command, So That What Remains We Be Parameterlist
                        Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                        if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }

                        Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_TO + Equates_JSB2JS.C_ON + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                            Needsdict = 0;
                            await Tcv(false);
                            Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_TO + Equates_JSB2JS.C_ON + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        } else {
                            Needsdict = 1;
                        }

                        Needsto = Commons_JSB2JS.Tkno != Equates_JSB2JS.C_TO;
                        if (Not(Needsto)) {
                            await Tcv(false);
                            Aexpr = await Parsevar(1, 0, Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_LBRACE, 1); // Storing,Matok, Gattr, Lb, Showerrors)
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK || Commons_JSB2JS.Tkno == Commons_JSB2JS.Mobjectdelemeter) await Err('Invalid reference variable. Too complicated');
                        }

                        Hasthenelse = (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_THEN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ELSE || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACE);
                        Nextcmd = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Params = Mid1(Commons_JSB2JS.Tkline, 1, +Commons_JSB2JS.Tkstartpos - 1);

                        Params = ChangeI(Params, ' TO ', ',');
                        if (CBool(Needsdict)) Params = '\'\', ' + CStr(Params);
                        if (CBool(Needsto)) Params = CStr(Params) + ', @FILE';

                        // Build Subsitution
                        Commons_JSB2JS.Tkline = 'IF @JSB_ODB.OPEN(' + CStr(Params) + ') ';

                        if (CBool(Hasthenelse)) Commons_JSB2JS.Tkline += CStr(Nextcmd); else Commons_JSB2JS.Tkline += ' ELSE STOP @ERRORS';

                        // Re-Parse
                        Commons_JSB2JS.Oc = ''; Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);

                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'SELECTFILE':
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses SELECT';

                        // Sleect F_file Then Where Cond Then To Dim
                        // Select { COLUMNS } From F_file Then Where Cond Then To Dim

                        // == Remove Everything Up To Command, So That What Remains We Be Parameterlist
                        Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                        Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false); // Reset To Start Of Line
                        if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }

                        Columnlist = '""';
                        Wherestring = '""';
                        Tofile = '""';

                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_FROM) {
                            Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_TO + Equates_JSB2JS.C_FROM + Equates_JSB2JS.C_WHERE + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        }

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_FROM) {
                            Columnlist = RTrim(Mid1(Commons_JSB2JS.Tkline, 1, +Commons_JSB2JS.Tkstartpos - 1));
                            await Tcv(false);
                            Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos); Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                            Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 2, Equates_JSB2JS.C_TO + Equates_JSB2JS.C_WHERE + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        }

                        Fromfile = RTrim(Mid1(Commons_JSB2JS.Tkline, 1, +Commons_JSB2JS.Tkstartpos - 1));
                        Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos); Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);

                        Cmd = 'SELECT';


                        while (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_WHERE || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_TO) {
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_WHERE) {
                                await Tcv(false); // Skip Fwhere
                                Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos); Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                                Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_TO + Equates_JSB2JS.C_WHERE + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                                Wherestring = RTrim(Mid1(Commons_JSB2JS.Tkline, 1, +Commons_JSB2JS.Tkstartpos - 1));
                                Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos); Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                            }

                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_TO) {
                                await Tcv(false);
                                Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos); Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                                Cmd = 'SELECTTO';

                                Aexpr = await Parsevar(1, 0, Equates_JSB2JS.C_TO + Equates_JSB2JS.C_WHERE + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE, 1); // Storing,Matok, Gattr, Lb, Showerrors)
                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK || Commons_JSB2JS.Tkno == Commons_JSB2JS.Mobjectdelemeter) await Err('Invalid reference variable. Too complicated');

                                Tofile = RTrim(Mid1(Commons_JSB2JS.Tkline, 1, +Commons_JSB2JS.Tkstartpos - 1));
                                Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos); Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                            }
                        }

                        Hasthenelse = (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_THEN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ELSE || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACE);
                        Nextcmd = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);

                        // Build Subsitution
                        Commons_JSB2JS.Tkline = 'IF @JSB_ODB.' + CStr(Cmd) + '(' + CStr(Columnlist) + ', ' + CStr(Fromfile) + ', ' + CStr(Wherestring) + ', ' + CStr(Tofile) + ') ';
                        if (CBool(Hasthenelse)) Commons_JSB2JS.Tkline += CStr(Nextcmd); else Commons_JSB2JS.Tkline += ' ELSE STOP @ERRORS';

                        // Re-Parse
                        Commons_JSB2JS.Oc = ''; Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);

                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        await Thenelse(Aexpr);

                        // ====================================================================== list Calls ======================================================================
                        // ====================================================================== list Calls ======================================================================
                        // ====================================================================== list Calls ======================================================================
                        // ====================================================================== list Calls ======================================================================
                        break;

                    case Commons_JSB2JS.Tkstr == 'CLEARSELECT' || Commons_JSB2JS.Tkstr == 'I_CLEARSELECT':
                        await Tcv(false);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_FROM) {
                            await Tcv(false);
                            Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE + Equates_JSB2JS.C_LOCKED);
                            Commons_JSB2JS.Oc += 'clearSelect(' + CStr(Aexpr.SYM_C) + '); ';
                        } else {
                            Commons_JSB2JS.Oc += 'clearSelect(odbActiveSelectList); ';
                        }

                        break;

                    case Commons_JSB2JS.Tkstr == 'READNEXT' || Commons_JSB2JS.Tkstr == 'I_READNEXT':
                        // LOAD ADDRESS OF VARIABLE NAME

                        await Tcv(false);
                        Bexpr = await Parsevar(1, 0, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_FROM + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE, 1);

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                            await Tcv(false);
                            Dexpr = await Parsevar(1, 0, Equates_JSB2JS.C_FROM + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE, 1);
                        } else {
                            Dexpr = {};
                            Dexpr.SYM_C = '';
                        }

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_FROM) {
                            await Tcv(false);
                            Cexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE + Equates_JSB2JS.C_LOCKED);
                        } else {
                            Cexpr = {};
                            Cexpr.SYM_C = 'odbActiveSelectList';
                        }

                        // READNEXT BEXPR, DEXPR FROM CEXPR ELSE

                        if (CBool(Dexpr.SYM_C)) {
                            // GET ITEM TOO
                            Commons_JSB2JS.Oc += '_ss = readNext(' + CStr(Cexpr.SYM_C) + ').item; ' + CStr(Bexpr.SYM_C) + ' = _ss.itemid; ' + CStr(Dexpr.SYM_C) + ' = _ss.item; ';
                            Bexpr.SYM_C = '_ss.success';
                        } else {
                            Commons_JSB2JS.Oc += CStr(Bexpr.SYM_C) + ' = readNext(' + CStr(Cexpr.SYM_C) + ').itemid; ';
                        }

                        await Thenelse(Bexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'READLIST' || Commons_JSB2JS.Tkstr == 'GETLIST' || Commons_JSB2JS.Tkstr == 'I_READLIST' || Commons_JSB2JS.Tkstr == 'I_GETLIST':
                        // Getlist Aexpr { TO BEXPR } Or Readlist Bexpr From Aexpr
                        if (Commons_JSB2JS.Tkstr == 'READLIST') {
                            // READLIST BEXPR FROM AEXPR
                            await Tcv(false);
                            Bexpr = await Parsevar(1, 1, Equates_JSB2JS.C_FROM, 1);
                            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_FROM) { await Err('FROM  expected'); dblBreak46 = true; break; }
                            await Tcv(false);
                            Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        } else {
                            await Tcv(false);
                            Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_TO);
                            await Typestr(Equates_JSB2JS.TYPE_DC, Aexpr);
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_TO) {
                                await Tcv(false);
                                Bexpr = await Parsevar(1, 0, '', 1); // Storing,Matok, Gattr, Lb, Showerrors)
                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK || Commons_JSB2JS.Tkno == Commons_JSB2JS.Mobjectdelemeter) await Err('Invalid reference variable. Too complicated');
                            } else {
                                Bexpr = {};
                                Bexpr.SYM_C = 'odbActiveSelectList';
                            }
                        }

                        // GETLIST AEXPR { TO BEXPR } OR READLIST BEXPR FROM AEXPR

                        await Uses(Bexpr);
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses READLIST OR GETLIST';
                        Aexpr.SYM_C = 'await asyncGetList(' + CStr(Aexpr.SYM_C) + ', _selectList =\> ' + CStr(Bexpr.SYM_C) + ' = _selectList)';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'DELETELIST' || Commons_JSB2JS.Tkstr == 'I_DELETELIST':
                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_TO);
                        await Typestr(Equates_JSB2JS.TYPE_DC, Aexpr);

                        // DELETELIST AEXPR  (Delete the itemID from the SelectList file)

                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses DELETELIST';
                        Aexpr.SYM_C = 'await asyncDeleteList(' + CStr(Aexpr.SYM_C) + ')';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'FORMLIST' || Commons_JSB2JS.Tkstr == 'I_FORMLIST':
                        // FORMLIST LIST { TO SELNO } ELSE

                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_TO + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        await Typestr(Equates_JSB2JS.TYPE_DC, Aexpr);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_TO) {
                            await Tcv(false);

                            Bexpr = await Parsevar(1, 0, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE, 1); // Storing,Matok, Gattr, Lb, Showerrors)
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK || Commons_JSB2JS.Tkno == Commons_JSB2JS.Mobjectdelemeter) await Err('Invalid reference variable. Too complicated');

                            Commons_JSB2JS.Oc += CStr(Bexpr.SYM_C) + ' = formList(' + CStr(Aexpr.SYM_C) + '); ';
                            await Uses(Bexpr);
                        } else {
                            Commons_JSB2JS.Oc += 'odbActiveSelectList = formList(' + CStr(Aexpr.SYM_C) + '); ';
                        }

                        break;

                    case Commons_JSB2JS.Tkstr == 'SAVELIST' || Commons_JSB2JS.Tkstr == 'WRITELIST' || Commons_JSB2JS.Tkstr == 'I_SAVELIST' || Commons_JSB2JS.Tkstr == 'I_WRITELIST':
                        // SAVELIST { bexpr } TO aexpr (IE, WRITE BEXPR ON POINTERFILE, AEXPR)
                        await Tcv(false);

                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_ON && Commons_JSB2JS.Tkno != Equates_JSB2JS.C_TO) {
                            Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_ON + Equates_JSB2JS.C_TO);
                            await Typestr(Equates_JSB2JS.TYPE_DC, Bexpr);
                        } else {
                            Bexpr = {};
                            Bexpr.SYM_C = 'odbActiveSelectList';
                        }

                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_ON && Commons_JSB2JS.Tkno != Equates_JSB2JS.C_TO) { await Err('TO expected'); dblBreak46 = true; break; }
                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA);
                        await Typestr(Equates_JSB2JS.TYPE_DC, Aexpr);

                        // SAVELIST bexpr TO aexpr (IE, WRITE BEXPR ON POINTERFILE, AEXPR)

                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses SAVELIST or WRITELIST';
                        Aexpr.SYM_C = 'await asyncSaveList(' + CStr(Bexpr.SYM_C) + ', ' + CStr(Aexpr.SYM_C) + ')';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Aexpr);

                        // ====================================================================== i_Direct Calls ======================================================================
                        // ====================================================================== i_Direct Calls ======================================================================
                        // ====================================================================== i_Direct Calls ======================================================================
                        // ====================================================================== i_Direct Calls ======================================================================
                        break;

                    case Commons_JSB2JS.Tkstr == 'I_EMAIL':
                        await Tcv(false);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) await Tcv(false);

                        Fromexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_COMMA);
                        await Typestr(Equates_JSB2JS.TYPE_ESTR, Fromexpr);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) await Tcv(false); else await Err('From, To, CC, BCC, Subject, Body expected');

                        Toexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_COMMA);
                        await Typestr(Equates_JSB2JS.TYPE_ESTR, Toexpr);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) await Tcv(false); else await Err('From, To, CC, BCC, Subject, Body expected');

                        Ccexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_COMMA);
                        await Typestr(Equates_JSB2JS.TYPE_ESTR, Ccexpr);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) await Tcv(false); else await Err('From, To, CC, BCC, Subject, Body expected');

                        Bccexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_COMMA);
                        await Typestr(Equates_JSB2JS.TYPE_ESTR, Bccexpr);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) await Tcv(false); else await Err('From, To, CC, BCC, Subject, Body expected');

                        Subjectexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_COMMA);
                        await Typestr(Equates_JSB2JS.TYPE_ESTR, Subjectexpr);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) await Tcv(false); else await Err('From, To, CC, BCC, Subject, Body expected');

                        Bodyexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_RPAREN + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_COMMA);
                        await Typestr(Equates_JSB2JS.TYPE_ESTR, Bodyexpr);

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) await Tcv(false);

                        Aexpr = {};
                        Aexpr.SYM_C += 'sendEMail(' + CStr(Fromexpr.SYM_C) + ', ' + CStr(Toexpr.SYM_C) + ', ' + CStr(Ccexpr.SYM_C) + ', ' + CStr(Bccexpr.SYM_C) + ', ' + CStr(Subjectexpr.SYM_C) + ', ' + CStr(Bodyexpr.SYM_C) + ')';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_THEN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ELSE) await Thenelse(Aexpr); else { Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + CStr(Aexpr.SYM_C) + '; '); }

                        break;

                    case Commons_JSB2JS.Tkstr == 'I_DELETEDB':
                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA);
                        await Typestr(Equates_JSB2JS.TYPE_DC, Aexpr);
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses I_DELETEDB';
                        Aexpr.SYM_C = 'await asyncDeleteDB(' + CStr(Aexpr.SYM_C) + ')';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'I_CREATEDB':
                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA);
                        await Typestr(Equates_JSB2JS.TYPE_DC, Aexpr);
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses I_CREATEDB';
                        Aexpr.SYM_C = 'await asyncCreateDB(' + CStr(Aexpr.SYM_C) + ')';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'I_CREATEFILE' || Commons_JSB2JS.Tkstr == 'I_CREATETABLE':
                        // Create Bexpr, Cexpr To Aexpr
                        await Tcv(false);
                        Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_TO + Equates_JSB2JS.C_ON + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE); // Parse Dict/DATA Into Bexpr
                        await Typestr(Equates_JSB2JS.TYPE_DC, Bexpr);

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                            await Tcv(false);
                            Cexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_TO + Equates_JSB2JS.C_ON + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                            await Typestr(Equates_JSB2JS.TYPE_DC, Cexpr);
                        } else {
                            Cexpr = clone(Bexpr);
                            Bexpr = {};
                            Bexpr.SYM_C = '""';
                        }

                        // LOAD FILE VARIABLE

                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_TO) {
                            Aexpr = {};
                            Aexpr.SYM_C = 'activeProcess.At_File';
                            Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_VSTR;
                        } else {
                            await Tcv(false);
                            Aexpr = await Parsevar(1, 0, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE, 1); // Storing,Matok, Gattr, Lb, Showerrors)
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK || Commons_JSB2JS.Tkno == Commons_JSB2JS.Mobjectdelemeter) await Err('Invalid reference variable. Too complicated');
                        }

                        // create bexpr, cexpr to aexpr

                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses I_CREATEFILE';
                        await Uses(Aexpr);
                        Aexpr.SYM_C = 'await asyncCreateTable(' + CStr(Bexpr.SYM_C) + ', ' + CStr(Cexpr.SYM_C) + ', _fHandle =\> ' + CStr(Aexpr.SYM_C) + ' = _fHandle)';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'I_OPEN':
                        // Parse DICT/DATA into BEXPR, Filename into CEXPR

                        await Tcv(false);
                        Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_TO + Equates_JSB2JS.C_ON + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        await Typestr(Equates_JSB2JS.TYPE_DC, Bexpr);

                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                            await Tcv(false);
                            Cexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_TO + Equates_JSB2JS.C_ON + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                            await Typestr(Equates_JSB2JS.TYPE_DC, Cexpr);
                        } else {
                            Cexpr = clone(Bexpr);
                            Bexpr = {};
                            Bexpr.SYM_C = '""';
                        }

                        // LOAD FILE VARIABLE

                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_TO) {
                            Aexpr = {};
                            Aexpr.SYM_C = 'activeProcess.At_File';
                            Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_VSTR;
                        } else {
                            await Tcv(false);
                            Aexpr = await Parsevar(1, 0, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE, 1);
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK || Commons_JSB2JS.Tkno == Commons_JSB2JS.Mobjectdelemeter) await Err('Invalid reference variable. Too complicated');
                        }

                        // open bexpr, cexpr to aexpr

                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses I_OPEN';
                        await Uses(Aexpr);
                        Aexpr.SYM_C = 'await asyncOpen(' + CStr(Bexpr.SYM_C) + ', ' + CStr(Cexpr.SYM_C) + ', _fHandle =\> ' + CStr(Aexpr.SYM_C) + ' = _fHandle)';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'I_MATREAD' || Commons_JSB2JS.Tkstr == 'I_READ' || Commons_JSB2JS.Tkstr == 'I_READV' || Commons_JSB2JS.Tkstr == 'I_READXML' || Commons_JSB2JS.Tkstr == 'I_READJSON' || Commons_JSB2JS.Tkstr == 'I_READU' || Commons_JSB2JS.Tkstr == 'I_READVU' || Commons_JSB2JS.Tkstr == 'I_READXMLU' || Commons_JSB2JS.Tkstr == 'I_READJSONU' || Commons_JSB2JS.Tkstr == 'I_READBLK':

                        Rtype = Mid1(Commons_JSB2JS.Tkstr, 3);
                        Dexpr = { "SYM_C": 0 };

                        // READ CEXPR FROM AEXPR, BEXPR {, DEXPR} {, EEXPR}

                        await Tcv(false);
                        Cexpr = await Parsevar(1, 1, Equates_JSB2JS.C_FROM, 1);
                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_FROM) { await Err('FROM  expected'); return; }
                        await Tcv(false);

                        // get file handle (Aexpr)
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE + Equates_JSB2JS.C_LOCKED);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                            await Tcv(false);
                            Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LOCKED);
                        } else {
                            // default file handle
                            if (Rtype == 'READV' || Rtype == 'READVU') {
                                await Err('","  expected');
                                return;
                            }
                            Bexpr = clone(Aexpr);
                            Aexpr.SYM_C = 'activeProcess.At_File';
                            Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_VSTR;
                        }

                        // Get first AtnoNo or Start Offset (Dexpr)
                        if (Rtype == 'READV' || Rtype == 'READVU' || Rtype == 'READBLK') {
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                                await Tcv(false);
                                Dexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE + Equates_JSB2JS.C_LOCKED);
                                await Typenum(Equates_JSB2JS.TYPE_VNUM, Dexpr);

                                if (Rtype == 'READBLK') {
                                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                                        await Tcv(false);
                                        Eexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE + Equates_JSB2JS.C_LOCKED);
                                    } else {
                                        await Err('","  length expected');
                                        return;
                                    }
                                } else if (Rtype == 'READBLK') {
                                    await Err('","  offset expected');
                                    return;
                                }
                            } else {
                                Dexpr = clone(Bexpr);
                                Bexpr = clone(Aexpr);
                                Aexpr.SYM_C = 'activeProcess.At_File';
                                Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                            }
                        }

                        // Type em: * READ CEXPR FROM AEXPR, BEXPR {, DEXPR} {, EEXPR}

                        await Typestr(Equates_JSB2JS.TYPE_VSTR, Aexpr);
                        await Typestr(Equates_JSB2JS.TYPE_VSTR, Bexpr);

                        // READ CEXPR FROM AEXPR, BEXPR {, DEXPR} {, EEXPR}

                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses READ';
                        await Uses(Cexpr);

                        switch (true) {
                            case Rtype == 'READBLK':
                                Opts = 'B';
                                break;

                            case Rtype == 'MATREAD':
                                Opts = '';
                                break;

                            case Rtype == 'READ':
                                Opts = '';
                                break;

                            case Rtype == 'READV':
                                Opts = 'V';
                                break;

                            case Rtype == 'READXML':
                                Opts = 'XML';
                                break;

                            case Rtype == 'READJSON':
                                Opts = 'JSON';
                                break;

                            case Rtype == 'MATREADU':
                                Opts = 'U';
                                break;

                            case Rtype == 'READU':
                                Opts = 'U';
                                break;

                            case Rtype == 'READVU':
                                Opts = 'VU';
                                break;

                            case Rtype == 'READXMLU':
                                Opts = 'XMLU';
                                break;

                            case Rtype == 'READJSONU':
                                Opts = 'JSONU';
                        }

                        if (Opts == 'B') {
                            Aexpr.SYM_C = 'await asyncReadBlk(' + CStr(Aexpr.SYM_C) + ', ' + CStr(Bexpr.SYM_C) + ', ' + CStr(Dexpr.SYM_C) + ', ' + CStr(Eexpr.SYM_C) + ', _data =\> ' + CStr(Cexpr.SYM_C) + ' = _data)';
                            Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses READBLK';
                        } else {
                            Aexpr.SYM_C = 'await asyncRead(' + CStr(Aexpr.SYM_C) + ', ' + CStr(Bexpr.SYM_C) + ', "' + CStr(Opts) + '", ' + CStr(Dexpr.SYM_C) + ', _data =\> ' + CStr(Cexpr.SYM_C) + ' = _data)';
                            Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses READ';
                        }

                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'I_WRITE' || Commons_JSB2JS.Tkstr == 'I_WRITEXML' || Commons_JSB2JS.Tkstr == 'I_WRITEJSON' || Commons_JSB2JS.Tkstr == 'I_MATWRITE' || Commons_JSB2JS.Tkstr == 'I_WRITEU' || Commons_JSB2JS.Tkstr == 'I_WRITEV' || Commons_JSB2JS.Tkstr == 'I_WRITEVU' || Commons_JSB2JS.Tkstr == 'I_WRITEXMLU' || Commons_JSB2JS.Tkstr == 'I_WRITEJSONU' || Commons_JSB2JS.Tkstr == 'I_MATWRITEU' || Commons_JSB2JS.Tkstr == 'I_WRITEBLK':
                        // i_write cexpr on aexpr, bexpr {, dexpr }

                        Rtype = Mid1(Commons_JSB2JS.Tkstr, 3);

                        await Tcv(false);

                        // Item (Cexpr)
                        Cexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_ON + Equates_JSB2JS.C_TO);
                        await Typestr(Equates_JSB2JS.TYPE_DC, Cexpr);

                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_ON && Commons_JSB2JS.Tkno != Equates_JSB2JS.C_TO) { await Err('ON  expected'); return; }
                        await Tcv(false);

                        // fileHande (Aexpr)
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                            await Tcv(false);

                            // ItemID (Bexpr)
                            Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                        } else {
                            if (Right(Rtype, 1) == 'V' || Right(Rtype, 2) == 'VU') {
                                await Err('","  expected');
                                return;
                            }
                            Bexpr = clone(Aexpr);
                            Aexpr.SYM_C = 'activeProcess.At_File';
                            Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                        }

                        if (Right(Rtype, 1) == 'V' || Right(Rtype, 2) == 'VU' || Rtype == 'WRITEBLK') {
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                                await Tcv(false);
                                Dexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);;
                            } else if (Rtype == 'WRITEBLK') {
                                await Err('","  offset expected');
                                return;;
                            } else {
                                Dexpr = clone(Bexpr);
                                Bexpr = clone(Aexpr);
                                Aexpr.SYM_C = 'activeProcess.At_File';
                                Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                                Dexpr.SYM_C = '0';
                            }
                            await Typenum(Equates_JSB2JS.TYPE_VNUM, Dexpr);
                        } else {
                            Dexpr = { "SYM_C": 0 }
                        }

                        // Type em: 

                        await Typestr(Equates_JSB2JS.TYPE_ESTR, Aexpr);
                        await Typestr(Equates_JSB2JS.TYPE_ESTR, Bexpr);

                        // WRITE Cexpr ON aEXPR, Bexpr, Dexpr, Eexpr

                        switch (true) {
                            case Rtype == 'WRITEBLK':
                                Opts = 'B';
                                break;

                            case Rtype == 'MATWRITE':
                                Opts = '';
                                break;

                            case Rtype == 'WRITE':
                                Opts = '';
                                break;

                            case Rtype == 'WRITEV':
                                Opts = 'V';
                                break;

                            case Rtype == 'WRITEXML':
                                Opts = 'XML';
                                break;

                            case Rtype == 'WRITEJSON':
                                Opts = 'JSON';
                                break;

                            case Rtype == 'MATWRITEU':
                                Opts = 'U';
                                break;

                            case Rtype == 'WRITEU':
                                Opts = 'U';
                                break;

                            case Rtype == 'WRITEVU':
                                Opts = 'VU';
                                break;

                            case Rtype == 'WRITEXMLU':
                                Opts = 'XMLU';
                                break;

                            case Rtype == 'WRITEJSONU':
                                Opts = 'JSONU';
                        }

                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses I_WRITE';

                        // i_write cexpr on aexpr, bexpr {, dexpr }
                        Aexpr.SYM_C = 'await asyncWrite(' + CStr(Cexpr.SYM_C) + ', ' + CStr(Aexpr.SYM_C) + ', ' + CStr(Bexpr.SYM_C) + ',"' + CStr(Opts) + '", ' + CStr(Dexpr.SYM_C) + ')';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'I_DELETE':
                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA);
                        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_COMMA) {
                            Bexpr = clone(Aexpr);
                            Aexpr = {};
                            Aexpr.SYM_C = 'activeProcess.At_File';
                        } else {
                            await Tcv(false);
                            Bexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, '');
                            await Typenum(Equates_JSB2JS.TYPE_ENUM, Aexpr);
                        }
                        await Typestr(Equates_JSB2JS.TYPE_DC, Bexpr);
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses I_DELETE';
                        Aexpr.SYM_C = 'await asyncDelete(' + CStr(Aexpr.SYM_C) + ', ' + CStr(Bexpr.SYM_C) + ')';
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'I_SELECT':
                        await Tcv(false);

                        // Sleect Aexpr { WHERE CEXPR } { TO DEXPR }
                        // Select Bexpr From Aexpr { WHERE CEXPR } { TO DEXPR } { THEN ELSE }

                        Aexpr = {};
                        Aexpr.SYM_C = 'activeProcess.At_File';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                        Bexpr = {};
                        Bexpr.SYM_C = '\'\'';
                        Bexpr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                        Cexpr = {};
                        Cexpr.SYM_C = '\'\'';
                        Cexpr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;

                        Hasto = 0;

                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_TO);
                        await Typestr(Equates_JSB2JS.TYPE_ESTR, Aexpr);

                        // Is AEXPR a columns list (FROM following) or a F_FILE?
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_FROM) {
                            await Tcv(false);
                            Bexpr.SYM_C = Aexpr.SYM_C;
                            Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_TO);
                            await Typestr(Equates_JSB2JS.TYPE_ESTR, Aexpr);
                        } else {
                            Bexpr.SYM_C = '\'\'';
                        }

                        Dexpr = { "SYM_C": 'odbActiveSelectList' };

                        while (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_WHERE || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_TO) {
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_WHERE) {
                                await Tcv(false); // Skip Where
                                Cexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_TO);
                                await Typestr(Equates_JSB2JS.TYPE_ESTR, Cexpr);
                            }

                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_TO) {
                                await Tcv(false);
                                Dexpr = await Parsevar(1, 0, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE, 1);
                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK || Commons_JSB2JS.Tkno == Commons_JSB2JS.Mobjectdelemeter) await Err('Invalid reference variable. Too complicated');
                                Hasto = 1;
                                await Uses(Dexpr);
                            }
                        }

                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses I_SELECT';

                        // Select Bexpr( Columns ) from fHandle (Aexpr)  Where (Cexpr)
                        Aexpr.SYM_C = 'await asyncSelect(' + CStr(Bexpr.SYM_C) + ', ' + CStr(Aexpr.SYM_C) + ', ' + CStr(Cexpr.SYM_C) + ', _selectList =\> ' + CStr(Dexpr.SYM_C) + ' = _selectList)';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'I_CLOSE':
                        await Tcv(false);
                        Aexpr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, '');
                        await Typestr(Equates_JSB2JS.TYPE_ESTR, Aexpr);
                        Commons_JSB2JS.Oc += '// Close(' + CStr(Aexpr.SYM_C) + '); ';

                        break;

                    case Commons_JSB2JS.Tkstr == 'I_CLEARFILE' || Commons_JSB2JS.Tkstr == 'I_CLEARTABLE':
                        // Tablename Or fHandle (Same In this Case)
                        await Tcv(false);
                        if (Index1(Commons_JSB2JS.La + Equates_JSB2JS.C_TO, Commons_JSB2JS.Tkno, 1)) {
                            Aexpr = {};
                            Aexpr.SYM_C = 'activeProcess.At_File';
                            Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
                        } else {
                            Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, '');
                            await Typestr(Equates_JSB2JS.TYPE_ESTR, Aexpr);
                        }
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses asyncClearTable';
                        Aexpr.SYM_C = 'await asyncClearTable(' + CStr(Aexpr.SYM_C) + ')';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'I_DELETEFILE' || Commons_JSB2JS.Tkstr == 'I_DELETETABLE':
                        // Tablename Or fHandle (Same In this Case)
                        await Tcv(false);
                        if (Index1(Commons_JSB2JS.La + Equates_JSB2JS.C_TO, Commons_JSB2JS.Tkno, 1)) {
                            Aexpr = {};
                            Aexpr.SYM_C = 'activeProcess.At_File';
                            Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                        } else {
                            Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, '');
                            await Typestr(Equates_JSB2JS.TYPE_ESTR, Aexpr);
                        }
                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses I_DELETEFILE';
                        Aexpr.SYM_C = 'await asyncDeleteTable(' + CStr(Aexpr.SYM_C) + ')';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkstr == 'I_LISTFILES':
                        // Ilistfiles { TO } List
                        await Tcv(false);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_TO) await Tcv(false);

                        Aexpr = await Parsevar(1, 0, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE, 1);
                        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK || Commons_JSB2JS.Tkno == Commons_JSB2JS.Mobjectdelemeter) await Err('Invalid reference variable. Too complicated');

                        Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses I_LISTFILES';
                        await Uses(Aexpr);
                        Aexpr.SYM_C = 'await asyncListFiles(_fileList =\> ' + CStr(Aexpr.SYM_C) + ' = _fileList)';
                        Aexpr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
                        await Thenelse(Aexpr);

                        break;

                    case Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AT:
                        // Check for @SERVER, @EMAIL, @xxx
                        Htk = await Savetk();
                        await Tcv(false);

                        if (Commons_JSB2JS.Tkstr == 'EMAIL') {
                            await Tcv(false);

                            if (Commons_JSB2JS.Tkstr == Commons_JSB2JS.Mobjectdelemeter) await Tcv(false);
                            if (Commons_JSB2JS.Tkstr == 'SEND') await Tcv(false);
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) await Tcv(false);
                            // == Remove Everything Up To this point, So That What Remains We Be Parameterlist
                            Commons_JSB2JS.Tkline = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                            Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);
                            if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = ''; }


                            while (true) {
                                Aexpr = await Expr(Equates_JSB2JS.TYPE_VSTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_TO + Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                                if (Not(Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA)) break;
                                await Tcv(false);
                            }

                            Hasthenelse = (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_THEN || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ELSE || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACE);
                            Nextcmd = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos);
                            Params = Mid1(Commons_JSB2JS.Tkline, 1, +Commons_JSB2JS.Tkstartpos - 1);

                            // Build Subsitution
                            if (CBool(Hasthenelse)) {
                                Commons_JSB2JS.Tkline = 'If @JSB_ODB.EMAIL(' + CStr(Params) + ') ' + CStr(Nextcmd);
                            } else {
                                Commons_JSB2JS.Tkline = 'If @JSB_ODB.EMAIL(' + CStr(Params) + ') Else Stop @Errors; ' + CStr(Nextcmd);
                            }

                            // Re-Parse
                            Commons_JSB2JS.Oc = ''; Commons_JSB2JS.Tkpos = 1; Commons_JSB2JS.Tkno = ''; await Tcv(false);

                            await Tcv(false);
                            Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_THEN + Equates_JSB2JS.C_ELSE + Equates_JSB2JS.C_LBRACE);
                            await Thenelse(Aexpr);;
                        } else if (Commons_JSB2JS.Tkstr == 'SERVER') {
                            await Tcv(false);
                            if (Commons_JSB2JS.Tkstr == Commons_JSB2JS.Mobjectdelemeter) await Tcv(false); else await Err('. expected');

                            if (Commons_JSB2JS.Tkstr == 'CLOSE') {
                                await Tcv(false);
                                Commons_JSB2JS.Oc += 'jsbClose(); ';;
                            } else if (Commons_JSB2JS.Tkstr == 'END') {
                                await Tcv(false);
                                Commons_JSB2JS.Oc += 'At_Server.End(); ';;
                            } else if (Commons_JSB2JS.Tkstr == 'TRANSFER') {
                                await Restoret(Htk); // Back Up To @
                                await defaultExpr();;
                            } else if (Commons_JSB2JS.Tkstr == 'FLUSH' || Commons_JSB2JS.Tkstr == 'REFRESH') {
                                await Tcv(false);
                                Commons_JSB2JS.Oc += 'FlushHTML();';;
                            } else if (Commons_JSB2JS.Tkstr == 'PAUSE') {
                                await Tcv(false);
                                Commons_JSB2JS.Oc += 'await At_Server.asyncPause(me); ';
                                Commons_JSB2JS.Haspromises[Commons_JSB2JS.Haspromises.length] = 'Uses @SERVER.PAUSE';;
                            } else {
                                await Err('SERVER.END expected');
                            }
                            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
                                await Tcv(false);
                                if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) await Tcv(false); else await Err(') expected');
                            }
                        } else {

                            await Restoret(Htk); // Back Up To @
                            await defaultExpr();
                        }

                        break;

                    case Commons_JSB2JS.Tkstr == 'FUNC':
                        null;
                        break;

                    case Commons_JSB2JS.Tkstr == 'SUB':
                        null;
                        break;

                    case Commons_JSB2JS.Tkstr == 'SUBROUTINE':
                        null;
                        break;

                    case Commons_JSB2JS.Tkstr == 'FUNCTION':
                        null;
                        break;

                    case Commons_JSB2JS.Tkstr == 'RESTFUL' && UCase(Left(Trim(Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 18)), 8)) == 'FUNCTION':
                        null;
                        break;

                    case Commons_JSB2JS.Tkstr == 'PICK' && UCase(Left(Trim(Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 18)), 8)) == 'FUNCTION':
                        null;

                        break;

                    case CBool(1):
                        await defaultExpr();

                }
                if (dblBreak46) break;
            }
        }

        if (Not(Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SEMI && InStr1(1, Lb, Equates_JSB2JS.C_SEMI) == 0)) break;
        await Tcv(false);
    }
    Commons_JSB2JS.La = Mid1(Commons_JSB2JS.La, 1, Len(Commons_JSB2JS.La) - 1);
}
// </STMSTATEMENT>

// <DEFAULTEXPR>
async function defaultExpr() {
    // local variables
    var Funcname, Isexternalfunc, R, Aexpr, Alreadyused, Xsub;

    await Include_JSB2JS__Comms(false)

    Funcname = Commons_JSB2JS.Tkstr;
    if (Locate(Funcname, Commons_JSB2JS.Uc_Externals_Purejs_List, 0, 0, 0, "", position => Isexternalfunc = position)); else Isexternalfunc = 0;
    R = await Savetk();
    Aexpr = await Parsevar(2, 1, Equates_JSB2JS.C_EQUAL, 0);

    if (CBool(Isexternalfunc) && Commons_JSB2JS.Tkno != Equates_JSB2JS.C_LPAREN) {
        // We are using this external function name as a variable.  Make it a local var if we haven't already used it
        Alreadyused = false;
        for (Xsub of iterateOver(Commons_JSB2JS.Calllist)) {
            Xsub = dropIfRight(CStr(Xsub), '_'); // drop "_fnc"
            if (Null0(Xsub) == Null0(Funcname)) { Alreadyused = true; break; }
        }

        if (CBool(Alreadyused)) {
            await Err('\'' + CStr(Funcname) + '\' is gobally defined as an external function, but used here as a local variable.  Redefine locally with $options local ' + CStr(Funcname));
        } else {
            Isexternalfunc = false;
        }
    }

    if (InStr1(1, ' =\<+-/*%:', Commons_JSB2JS.Tkstr) > 1) {
        await Restoret(R);
        await Assment();;
    } else if (CBool(Isexternalfunc)) {
        await Restoret(R);
        Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, '');
        Commons_JSB2JS.Oc = CStr(Commons_JSB2JS.Oc) + CStr(Aexpr.SYM_C) + ';';;
    } else if (Commons_JSB2JS.Tkstr == Commons_JSB2JS.Mobjectdelemeter || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LBRACK || Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
        // Load object address
        Commons_JSB2JS.Ignoreerrors++;
        await Objectparse(Aexpr);
        Commons_JSB2JS.Ignoreerrors--;

        // assignment ?
        if (InStr1(1, ' =\<+-/*%:', Commons_JSB2JS.Tkstr) > 1) {
            await Restoret(R);
            await Assment();
        } else {
            await Restoret(R);

            Aexpr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, '');
            Commons_JSB2JS.Oc += CStr(Aexpr.SYM_C) + ';';
        }
    } else {
        await Restoret(R);
        await Err('Unknown command: ' + CStr(Commons_JSB2JS.Tkstr));
    }
}
// </DEFAULTEXPR>

// <GENLOOP>
async function GenLoop(Wtkno, Hascond, Ignored, Cexpr, Loopblock, Doblock, Looplbls, Dolbls) {
    // local variables
    var Cyclelbl, Exitlbl;

    await Include_JSB2JS__Comms(false)

    if (Right(Doblock, 1) == ';') Doblock = RTrim(Left(Doblock, Len(Doblock) - 1));
    if (Right(Loopblock, 1) == ';') Loopblock = RTrim(Left(Loopblock, Len(Loopblock) - 1));

    if (CBool(Hascond)) await Makenum(Equates_JSB2JS.TYPE_VNUM, Cexpr);
    if (CBool(Looplbls) || CBool(Dolbls)) {
        // LOOP LOOPBLOCK WHILE COND DOBLOCK REPEAT ->

        // CYCLELBL:
        // LOOPBLOCK
        // IF !CEXPR GOTO EXITLBL
        // DOBLOCK
        // GOTO LOOPTOP
        // EXITLBL:

        Cyclelbl = '_topOfLoop_' + CStr(Commons_JSB2JS.Nxtlbl);
        Exitlbl = '_exitFor_' + CStr(Commons_JSB2JS.Nxtlbl); Commons_JSB2JS.Nxtlbl++;

        await Deflbl(Cyclelbl, 0);

        Loopblock = Change(Loopblock, Chr(2) + 'break' + Chr(2), '{ gotoLabel = "' + CStr(Exitlbl) + '"; continue atgoto }');
        Loopblock = Change(Loopblock, Chr(2) + 'continue' + Chr(2), '{ gotoLabel = "' + CStr(Cyclelbl) + '"; continue atgoto }');
        Loopblock = Change(Loopblock, Chr(254) + '   ', Chr(254)); Loopblock = Change(Loopblock, 'case "_', Space(3) + 'case "_');
        Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Loopblock);
        if (CBool(Hascond)) {
            if (Wtkno == Equates_JSB2JS.C_WHILE) {
                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent + 3) + 'if (Not(' + CStr(Cexpr.SYM_C) + ')) { gotoLabel = "' + CStr(Exitlbl) + '"; continue atgoto }; ');
            } else {
                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent + 3) + 'if (' + CStr(Cexpr.SYM_C) + ') { gotoLabel = "' + CStr(Exitlbl) + '"; continue atgoto }; ');
            }
        }
        Doblock = Change(Doblock, Chr(2) + 'break' + Chr(2), '{ gotoLabel = "' + CStr(Exitlbl) + '"; continue atgoto }');
        Doblock = Change(Doblock, Chr(2) + 'continue' + Chr(2), '{ gotoLabel = "' + CStr(Cyclelbl) + '"; continue atgoto }');
        Doblock = Change(Doblock, Chr(254) + '   ', Chr(254)); Doblock = Change(Doblock, 'case "_', Space(3) + 'case "_');
        Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Doblock);

        Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + 'gotoLabel = "' + CStr(Cyclelbl) + '"; continue atgoto; ');

        await Deflbl(Exitlbl, 0);
    } else {
        // NOT LABELS
        Doblock = Change(Doblock, Chr(2) + 'break' + Chr(2), 'break');
        Doblock = Change(Doblock, Chr(2) + 'continue' + Chr(2), 'continue');

        if (CBool(Loopblock)) {
            Loopblock = Change(Loopblock, Chr(2) + 'break' + Chr(2), 'break');
            Loopblock = Change(Loopblock, Chr(2) + 'continue' + Chr(2), 'continue');
            if (CBool(Hascond)) {
                if (CBool(Doblock)) {
                    // LOOP LOOPBLOCK WHILE COND DOBLOCK REPEAT -> while (true) { LOOPBLOCK; if (cond) break; DOBLOCK }
                    Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + 'while (true) {' + Chr(254) + CStr(Loopblock));
                    if (Wtkno == Equates_JSB2JS.C_WHILE) {
                        Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent + 3) + 'if (Not(' + CStr(Cexpr.SYM_C) + ')) break; ');
                    } else {
                        Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent + 3) + 'if (' + CStr(Cexpr.SYM_C) + ') break; ');
                    }
                    Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Doblock);
                    Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + '} ');
                } else {
                    // LOOP LOOPBLOCK WHILE COND REPEAT ->  do { LOOPBLOCK } while (cond);
                    Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + 'do {' + Chr(254) + CStr(Loopblock) + Chr(254) + Space(Commons_JSB2JS.Indent) + '} ');
                    if (Wtkno == Equates_JSB2JS.C_WHILE) {
                        Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + 'while (' + CStr(Cexpr.SYM_C) + '); ');
                    } else {
                        Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + 'while (Not(' + CStr(Cexpr.SYM_C) + ')); ');
                    }
                }
            } else {
                // LOOP LOOPBLOCK REPEAT ->  while (true) { LOOPBLOCK }
                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + 'while (true) {' + Chr(254) + CStr(Loopblock) + Chr(254) + Space(Commons_JSB2JS.Indent) + '} ');
            }
        } else {
            if (CBool(Hascond)) {
                // LOOP WHILE COND DOBLOCK REPEAT -> while (cond) { doblock }
                if (Wtkno == Equates_JSB2JS.C_WHILE) {
                    Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + 'while (' + CStr(Cexpr.SYM_C) + ') {');
                } else {
                    Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + 'while (Not(' + CStr(Cexpr.SYM_C) + ')) {');
                }
                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Doblock);
                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent) + '} ');
            } else {
                // LOOP REPEAT
                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent + 3) + 'while (true) { } ');
            }
        }
    }
}
// </GENLOOP>

// <FERR>
async function Ferr(Msg) {
    // local variables
    var Gattr;

    await Include_JSB2JS__Comms(false)

    Gattr = {};
    Gattr.SYMNAME = 'CompileError';
    Gattr.SYM_C = 'CompileError';
    Gattr.SYM_INCLEVEL = Commons_JSB2JS._Incfile;
    Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_LOCAL;
    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_VAR;
    Gattr.SYM_USED = 1;
    await Writesym(Gattr, Gattr.SYMNAME);
    await Err(Msg);
    return Gattr;
}
// </FERR>

// <MACRO>
async function Macro() {
    // local variables
    var Pstr;

    await Include_JSB2JS__Comms(false)

    if (!Trim(Commons_JSB2JS.Oc)) {
        Commons_JSB2JS.Oc = '';
    } else {
        Commons_JSB2JS.Oc += Chr(254);
    }
    await Tcv(false);

    while (true) {
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_POUND) {
            Pstr = Space(Commons_JSB2JS.Spaces) + CStr(Commons_JSB2JS.Tkstr);
            await Tcv(false);
            if (UCase(Commons_JSB2JS.Tkstr) == 'ENDMACRO') {
                await Tcv(false);
                break;
            }
            Commons_JSB2JS.Oc += CStr(Pstr);
        }
        if (Not(Commons_JSB2JS.Tkno != Equates_JSB2JS.C_SM)) break;
        Commons_JSB2JS.Oc += Space(Commons_JSB2JS.Spaces) + CStr(Commons_JSB2JS.Tkstr);
        await Tcv(false);
    }
    return;
}
// </MACRO>

// <MAKESUBNAME>
async function Makesubname(Id) {
    // local variables
    var Sch, Rpl, I, Ri;

    // Make C name for subroutine names, safe to call twice

    await Include_JSB2JS__Comms(false)

    if (Commons_JSB2JS.Processingtemplates && Not(Commons_JSB2JS.Hush)) return Id;

    Sch = (';!@#$%^&*|');
    Rpl = '_~SMI~PND~AT~PND~DLR~PCT~UPA~AMP~AST~BAR';
    Id = UCase(Id);

    var _ForEndI_58 = Len(Id);
    for (I = 1; I <= _ForEndI_58; I++) {
        var C = Mid1(Id, I, 1);
        if (Index1('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', C, 1) == 0) {
            Ri = Index1(Sch, C, 1) + 1;
            Id = Mid1(Id, 1, +I - 1) + Field(Rpl, '~', Ri) + Mid1(Id, +I + 1, 99999);
        }
    }

    // BEGIN CASE
    // CASE ID = "WEOF" ; ID = "WEOFSUB"
    // END CASE
    return Id;
}
// </MAKESUBNAME>

// <PARSEASTYPE>
async function parseAStype(Gattr) {
    await Include_JSB2JS__Comms(false)

    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_VAR;
    if (Commons_JSB2JS.Tkstr != 'AS') return;
    await Tcv(false);
    switch (true) {
        case Commons_JSB2JS.Tkstr == 'NUMBER' || Commons_JSB2JS.Tkstr == 'INT' || Commons_JSB2JS.Tkstr == 'INTEGER' || Commons_JSB2JS.Tkstr == 'LONG' || Commons_JSB2JS.Tkstr == 'REAL' || Commons_JSB2JS.Tkstr == 'FLOAT' || Commons_JSB2JS.Tkstr == 'DOUBLE' || Commons_JSB2JS.Tkstr == 'DBL' || Commons_JSB2JS.Tkstr == 'BOOLEAN' || Commons_JSB2JS.Tkstr == 'BOOL' || Commons_JSB2JS.Tkstr == 'SINGLE':
            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_VNUM;
            await Tcv(false);
            break;

        case Commons_JSB2JS.Tkstr == 'STRING' || Commons_JSB2JS.Tkstr == 'STR' || Commons_JSB2JS.Tkstr == 'CHAR':
            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_VSTR;
            await Tcv(false);
            break;

        case Commons_JSB2JS.Tkstr == 'VARIANT' || Commons_JSB2JS.Tkstr == 'VARIABLE' || Commons_JSB2JS.Tkstr == 'FILE' || Commons_JSB2JS.Tkstr == 'FILEHANDLE' || Commons_JSB2JS.Tkstr == 'TABLE' || Commons_JSB2JS.Tkstr == 'TABLEHANDLE' || Commons_JSB2JS.Tkstr == 'SELECTLIST' || Commons_JSB2JS.Tkstr == 'ARRAY' || Commons_JSB2JS.Tkstr == 'JSON' || Commons_JSB2JS.Tkstr == 'OBJECT':
            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_VAR;
            await Tcv(false);
            break;

        case CBool(1):
            await Err('Invalid type');
            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_VAR;
    }
    return;

    // ********************************************************************************************************************
}
// </PARSEASTYPE>

// <PARSEVAR>
async function Parsevar(Storing, Matok, Lb, Showerrors) {
    // local variables
    var Gattr, Atname, Nextch, Lattr, Varprefixed, Found, Jattr;

    await Include_JSB2JS__Comms(false)

    // CHECK FOR PREVIOUS DEFINITION

    Gattr = {};
    Gattr.SYM_INCLEVEL = Commons_JSB2JS._Incfile;

    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AT) {
        await Tcv(false);

        Atname = 'At_' + Mid1(Commons_JSB2JS.Tkstr, 1, 1) + LCase(Mid1(Commons_JSB2JS.Tkstr, 2));

        Gattr.SYMNAME = Atname;
        Gattr.SYM_C = Atname;

        if (Commons_JSB2JS.Tkstr == 'AM' || Commons_JSB2JS.Tkstr == 'VM' || Commons_JSB2JS.Tkstr == 'SVM' || Commons_JSB2JS.Tkstr == 'SSVM') {
            Gattr.SYM_C = LCase(Commons_JSB2JS.Tkstr);
            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_VNUM;
            Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_EXTERNAL;

            await Tcv(false);
            return Gattr;;
        } else if (Commons_JSB2JS.Tkstr == 'SENTENCE' || Commons_JSB2JS.Tkstr == 'ERRORS' || Commons_JSB2JS.Tkstr == 'FILENAME' || Commons_JSB2JS.Tkstr == 'FILE' || Commons_JSB2JS.Tkstr == 'RECORD' || Commons_JSB2JS.Tkstr == 'PROMPT' || Commons_JSB2JS.Tkstr == 'INPUT' || Commons_JSB2JS.Tkstr == 'ECHO' || Commons_JSB2JS.Tkstr == 'MV' || Commons_JSB2JS.Tkstr == 'NI' || Commons_JSB2JS.Tkstr == 'ID' || Commons_JSB2JS.Tkstr == 'NV' || Commons_JSB2JS.Tkstr == 'NB' || Commons_JSB2JS.Tkstr == 'ND' || Commons_JSB2JS.Tkstr == 'STATUS') {
            Atname = 'activeProcess.At_' + Mid1(Commons_JSB2JS.Tkstr, 1, 1) + LCase(Mid1(Commons_JSB2JS.Tkstr, 2));
            Gattr.SYM_C = Atname;
            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_VSTR;
            Gattr.SYM_TYPES = Equates_JSB2JS.SYMTYPES_STORED;
            Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_EXTERNAL;;
        } else if (Commons_JSB2JS.Tkstr == 'RESTFUL_RESULT') {
            Atname = 'Restful_Result';
            Gattr.SYM_C = Atname;
            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EXP;
            Gattr.SYM_TYPES = Equates_JSB2JS.SYMTYPES_STORED;
            Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_EXTERNAL;;
        } else if (Commons_JSB2JS.Tkstr == 'APPLICATION' || Commons_JSB2JS.Tkstr == 'SESSION') {
            Gattr.SYMNAME = Atname;
            Gattr.SYM_C = Atname;

            Nextch = Left(LTrim(Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 5)), 1);
            if (Null0(Nextch) == Null0(Commons_JSB2JS.Mobjectdelemeter)) {
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                await Tcv(false); // Skip Application
                await Tcv(false); // Skip .

                if (Commons_JSB2JS.Tkstr == 'ITEM') {
                    await Tcv(false);
                    Gattr.SYM_C = CStr(Atname) + '.Item';
                    return Gattr;
                }

                Gattr.SYM_C = CStr(Atname) + '.Item(\'' + CStr(Commons_JSB2JS.Tkstr) + '\')';
                await Tcv(false);
                return Gattr;;
            } else if (Nextch == '(' || Nextch == '[') {
                Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
                await Tcv(false);
                await Tcv(false);

                Lattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_RBRACK + Equates_JSB2JS.C_RPAREN);
                Gattr.SYM_C = CStr(Atname) + '.Item(' + CStr(Lattr.SYM_C) + ')';
                if (Nextch == '(') {
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RPAREN) await Tcv(false); else await Err(') EXPECTED');
                } else {
                    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_RBRACK) await Tcv(false); else await Err('] EXPECTED');
                }
                return Gattr;
            }
        }
    } else if (Commons_JSB2JS.Tkstr == '$' || Commons_JSB2JS.Tkstr == 'WINDOW' || Commons_JSB2JS.Tkstr == 'DOCUMENT' || Commons_JSB2JS.Tkstr == 'ME') {
        Gattr.SYM_C = LCase(Commons_JSB2JS.Tkstr);
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
        Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_EXTERNAL;

        await Tcv(false);
        return Gattr;;
    } else if (Commons_JSB2JS.Tkstr == 'TRUE' || Commons_JSB2JS.Tkstr == 'FALSE') {
        Gattr.SYM_C = LCase(Commons_JSB2JS.Tkstr);
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_EBOOL;
        Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_EXTERNAL;

        await Tcv(false);
        return Gattr;;
    } else if (Commons_JSB2JS.Tkstr == 'RANDYNWALSH') {
        Gattr.SYM_C = '\'Randy N. Walsh is the author\'';
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_CSTR;
        Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_EXTERNAL;
        await Tcv(false);
        return Gattr;

        // to be compatible with ASX null is the same - use window.null;
    } else if (Commons_JSB2JS.Tkstr == 'NOTHING' || Commons_JSB2JS.Tkstr == 'UNDEFINED' || Commons_JSB2JS.Tkstr == 'NULL') {
        Gattr.SYM_C = 'undefined';
        Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
        Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_EXTERNAL;

        await Tcv(false);
        return Gattr;;
    } else {
        Varprefixed = (Commons_JSB2JS.Tkstr == 'VAR' || Commons_JSB2JS.Tkstr == 'DIM');
        if (CBool(Varprefixed)) await Tcv(false);

        // STANDARD VARIABLE (or function?)
        Gattr = await Readsym(Commons_JSB2JS.Tkstr);
        Found = Commons_JSB2JS.Readsymfound;

        if (CBool(Found)) {
            if (CBool(Varprefixed)) await Warning('already defined');

            if (Not(Gattr.SYM_USED) && !(Index1(Equates_JSB2JS.C_LPAREN + Equates_JSB2JS.C_GREAT + Equates_JSB2JS.C_LBRACK, Commons_JSB2JS.Tkno, 1))) {
                Gattr.SYM_USED = 1;
                await Writesym(Gattr, Commons_JSB2JS.Tkstr);
            }

            if (CBool(Storing) && !Index1(Gattr.SYM_TYPES, Equates_JSB2JS.SYMTYPES_STORED, 1)) {
                Gattr.SYM_TYPES = CStr(Gattr.SYM_TYPES) + Equates_JSB2JS.SYMTYPES_STORED;
                await Writevsym(Gattr.SYM_TYPES, Gattr.SYMNAME, 'SYM_TYPES');
            }
        } else {
            if (Commons_JSB2JS.Tkno < Equates_JSB2JS.C_IDENT) {
                if (CBool(Showerrors)) await Err('Identifier expected');
                return Gattr;
            }

            if (CBool(Showerrors) && Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1) != '(') {
                if (CBool(Varprefixed)) Gattr.isAlreadyDefined = true;
                if (CBool(Storing)) Gattr.SYM_TYPES = Equates_JSB2JS.SYMTYPES_STORED;
                Gattr.SYM_USED = CNum(Gattr.SYM_USED) + 1;
                await Writesym(Gattr, Gattr.SYMNAME);
            }
        }
        if (CBool(Varprefixed)) Gattr.SYM_C = 'var ":Gattr.SYM_C';
    }

    await Tcv(false);

    if (Commons_JSB2JS.Tkstr == 'AS') {
        await parseAStype(Gattr);
    }

    if (InStr1(1, Lb, Commons_JSB2JS.Tkno)) return Gattr;

    // CHECK FOR r83 style predeclared array '(' DIM-INDEX ')'
    // OR (TKNO=C_LPAREN AND SPACES = 0)

    if (CBool(Gattr.SYM_INDEX1) && !Index1(Lb, Equates_JSB2JS.C_LPAREN, 1)) {
        if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_LPAREN) {
            if (Not(Matok)) {
                if (CBool(Showerrors)) await Err('[Array index expected]');
            }
        } else {
            if (isEmpty(Gattr.SYM_INDEX1)) {
                if (CBool(Found)) {
                    if (CBool(Showerrors)) await Err('Not a MAT variable');
                } else if (CBool(Showerrors)) {
                    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_VSTR;
                    Gattr.SYM_INDEX1 = -1;
                    await Writesym(Gattr, Gattr.SYMNAME);
                }
            }

            await Tcv(false);

            Lattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
            if (!(Index1(Equates_JSB2JS.TYPE_CNUM + Equates_JSB2JS.TYPE_VNUM + Equates_JSB2JS.TYPE_VBOOL + Equates_JSB2JS.TYPE_ENUM + Equates_JSB2JS.TYPE_EBOOL, Lattr.SYM_TYPE, 1))) {
                await Makenum(Equates_JSB2JS.TYPE_VNUM, Lattr);
            }
            Gattr.SYM_C = CStr(Gattr.SYM_C) + '[' + CStr(Lattr.SYM_C);

            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                if (isEmpty(Gattr.SYM_INDEX2)) {
                    if (CBool(Found)) {
                        if (CBool(Showerrors)) await Err('Variable does not have 2nd dimension');
                    } else if (CBool(Showerrors)) {
                        Gattr.SYM_INDEX2 = -1;
                        await Writesym(Gattr, Gattr.SYMNAME);
                    }
                }
                await Tcv(false);
                Jattr = await Expr(Equates_JSB2JS.TYPE_ENUM, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                await Makenum(Equates_JSB2JS.TYPE_VNUM, Jattr);
                Gattr.SYM_C = CStr(Gattr.SYM_C) + '][' + CStr(Jattr.SYM_C);
            } else {
                if (CBool(Gattr.SYM_INDEX2) && CBool(Showerrors)) await Err('Index expected');
            }
            Gattr.SYM_C = CStr(Gattr.SYM_C) + ']';

            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RPAREN && CBool(Showerrors)) await Err(') expected'); else await Tcv(false);
            Gattr.SYM_INDEX1 = '';
            Gattr.SYM_INDEX2 = '';
        }
    }

    return Gattr;
}
// </PARSEVAR>

// <PEEKTK>
async function Peektk() {
    // local variables
    var Htkno, Hotkstr, Htkstr, Htkpos, Htkam, Htkline, Htkstartpos;
    var Hcpassthru, Hoc, Ptk;

    await Include_JSB2JS__Comms(false)

    Htkno = Commons_JSB2JS.Tkno;
    Hotkstr = Commons_JSB2JS.Otkstr;
    Htkstr = Commons_JSB2JS.Tkstr;
    Htkpos = Commons_JSB2JS.Tkpos;
    Htkam = Commons_JSB2JS.Tkam;
    Htkline = Commons_JSB2JS.Tkline;
    Htkstartpos = Commons_JSB2JS.Tkstartpos;
    Hcpassthru = Commons_JSB2JS.Cpassthru;
    Hoc = Commons_JSB2JS.Oc;

    if (Commons_JSB2JS.Processingtemplates) Commons_JSB2JS.Hush++;
    await Tcv(false);
    if (Commons_JSB2JS.Processingtemplates) Commons_JSB2JS.Hush--;

    Commons_JSB2JS.Cpassthru = Hcpassthru;
    Commons_JSB2JS.Oc = Hoc;
    Ptk = Commons_JSB2JS.Tkno;

    Commons_JSB2JS.Tkno = Htkno;
    Commons_JSB2JS.Otkstr = Hotkstr;
    Commons_JSB2JS.Tkstr = Htkstr;
    Commons_JSB2JS.Tkpos = Htkpos;
    Commons_JSB2JS.Tkam = Htkam;
    Commons_JSB2JS.Tkline = Htkline;
    Commons_JSB2JS.Tkstartpos = Htkstartpos;

    return Ptk;

    // ********************************************************************************************************************
}
// </PEEKTK>

// <READINC>
async function Readinc(Symlist) {
    // local variables
    var Sname, Sattr, Symname, Pattr;

    await Include_JSB2JS__Comms(false)

    for (Sname of iterateOver(Symlist)) {
        Sattr = Symlist[Sname];
        Symname = Sattr.SYMNAME;
        Sattr.SYM_INCLEVEL = 999;
        Pattr = clone(Commons_JSB2JS.Symtab[Symname]);
        if (CBool(Pattr)) {
            if (Not(Pattr.SYM_USED)) {
                if (Sattr.SYM_TYPE == Equates_JSB2JS.TYPE_VAR) {
                    Sattr.SYM_TYPE = Pattr.SYM_TYPE;
                }
                if (Pattr.SYM_TYPE == Equates_JSB2JS.TYPE_VAR) {
                    Pattr.SYM_TYPE = Sattr.SYM_TYPE;
                }
                if (Null0(Pattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_PARAMETER && Null0(Sattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_LOCAL) {
                    Sattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_PARAMETER;
                }
                if (isEmpty(Sattr.SYM_INDEX1) || Null0(Sattr.SYM_INDEX1) == -1) {
                    Sattr.SYM_INDEX1 = Pattr.SYM_INDEX1;
                    Sattr.SYM_INDEX2 = Pattr.SYM_INDEX2;
                }
                if (isEmpty(Pattr.SYM_INDEX1) || Null0(Pattr.SYM_INDEX1) == -1) {
                    Pattr.SYM_INDEX1 = Sattr.SYM_INDEX1;
                    Pattr.SYM_INDEX2 = Sattr.SYM_INDEX2;;
                }
                if (Sattr.SYM_STRLEN == Equates_JSB2JS.DFTSTRLEN) {
                    Sattr.SYM_STRLEN = Pattr.SYM_STRLEN;
                }
                if (Pattr.SYM_STRLEN == Equates_JSB2JS.DFTSTRLEN) {
                    Pattr.SYM_STRLEN = Sattr.SYM_STRLEN;
                }
            }
            switch (true) {
                case Null0(Sattr.SYM_TYPE) != Null0(Pattr.SYM_TYPE):
                    await Err('Variable ' + CStr(Symname) + ' previosly defined differently');
                    break;

                case Null0(Sattr.SYM_INDEX1) != Null0(Pattr.SYM_INDEX1) || Null0(Sattr.SYM_INDEX2) != Null0(Pattr.SYM_INDEX2):
                    await Err('Variable ' + CStr(Symname) + ' previosly defined with a different index');
                    break;

                case Null0(Sattr.SYM_FLAVOR) != Null0(Pattr.SYM_FLAVOR):
                    await Err('Variable ' + CStr(Symname) + ' previously defined in a different block');
                    break;

                case Null0(Sattr.SYM_ISCONST) != Null0(Pattr.SYM_ISCONST):
                    await Err('Variable ' + CStr(Symname) + ' previously defined at a different access level');
            }
        }
        await Writesym(Sattr, Symname);
    }
    return;

    // ********************************************************************************************************************
}
// </READINC>

// <RESETI>
async function Reseti(Howmuch) {
    // local variables
    var Lline;

    // HOWMUCH = # OF SPACES +/- TO CHANGE INDENTATION

    await Include_JSB2JS__Comms(false)

    Commons_JSB2JS.Indent += Howmuch;
    Lline = Count(Commons_JSB2JS.Oc, Chr(254)) + 1;
    if (!Trim(Extract(Commons_JSB2JS.Oc, Lline, 0, 0))) Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, Lline, 0, 0, Space(Commons_JSB2JS.Indent));
    return;
    // ********************************************************************************************************************
}
// </RESETI>

// <RESTORET>
async function Restoret(A, Nolengthcheck) {
    await Include_JSB2JS__Comms(false)

    Commons_JSB2JS.Tkno = A.TKNO;
    Commons_JSB2JS.Otkstr = A.OTKSTR;
    Commons_JSB2JS.Tkstr = UCase(Commons_JSB2JS.Otkstr);
    Commons_JSB2JS.Tkpos = A.TKPOS;
    Commons_JSB2JS.Tkam = A.TKAM;
    Commons_JSB2JS.Tkline = A.TKLINE;
    Commons_JSB2JS.Cpassthru = A.CPASSTHRU;
    Commons_JSB2JS.Oc = A.OC;
    if (Len(Commons_JSB2JS.Ocpgm) != Null0(A.LOCPGM)) {
        // We should avoid putting stuff in OCPGM when between SaveTk and RestoreTk
        if (!Nolengthcheck) { Print(); debugger; }
    }

    return;

    // ********************************************************************************************************************
}
// </RESTORET>

// <SAVETK>
async function Savetk() {
    // local variables
    var A;

    await Include_JSB2JS__Comms(false)

    A = {};
    A.TKNO = Commons_JSB2JS.Tkno;
    A.OTKSTR = Commons_JSB2JS.Otkstr;
    A.TKPOS = Commons_JSB2JS.Tkpos;
    A.TKAM = Commons_JSB2JS.Tkam;
    A.TKLINE = Commons_JSB2JS.Tkline;
    A.CPASSTHRU = Commons_JSB2JS.Cpassthru;
    A.OC = Commons_JSB2JS.Oc;
    A.LOCPGM = Len(Commons_JSB2JS.Ocpgm);
    return A;

    // ********************************************************************************************************************
}
// </SAVETK>

// <TYPENUM>
async function Typenum(Suggest_Type, Gattr) {
    await Include_JSB2JS__Comms(false)

    if (Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VNUM || Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VAR || Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VSTR) {
        if (!Index1(Gattr.SYM_TYPES, Suggest_Type, 1) && Suggest_Type != Equates_JSB2JS.TYPE_DC) {
            Gattr.SYM_TYPES = CStr(Gattr.SYM_TYPES) + CStr(Suggest_Type);
            await Writevsym(Gattr.SYM_TYPES, Gattr.SYMNAME, 'SYM_TYPES');
        }
    }
    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ENUM;
    return;

    // ********************************************************************************************************************
}
// </TYPENUM>

// <TYPESTR>
async function Typestr(Suggest_Type, Gattr) {
    await Include_JSB2JS__Comms(false)

    if (Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VNUM || Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VAR || Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VSTR) {
        if (!Index1(Gattr.SYM_TYPES, Suggest_Type, 1) && Suggest_Type != Equates_JSB2JS.TYPE_DC) {
            Gattr.SYM_TYPES = CStr(Gattr.SYM_TYPES) + CStr(Suggest_Type);
            await Writevsym(Gattr.SYM_TYPES, Gattr.SYMNAME, 'SYM_TYPES');
        }
    }
    Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_ESTR;
    return;

    // ********************************************************************************************************************
}
// </TYPESTR>

// <USES>
async function Uses(Bexpr) {
    await Include_JSB2JS__Comms(false)

    if (!Index1(Bexpr.SYM_TYPES, Equates_JSB2JS.SYMTYPES_STORED, 1)) {
        Bexpr.SYM_TYPES = CStr(Bexpr.SYM_TYPES) + Equates_JSB2JS.SYMTYPES_STORED;
        await Writevsym(Bexpr.SYM_TYPES, Bexpr.SYMNAME, 'SYM_TYPES');
    }
    return;

    // ********************************************************************************************************************
}
// </USES>

// <MAKEVARNAME>
async function Makevarname(Vstr) {
    // local variables
    var C, Ostr, L, I, Cvt, C3;

    await Include_JSB2JS__Comms(false)

    // MUST BE IDENTIFIER

    C = Mid1(Vstr, 1, 1);
    if (C == '\\') {
        Vstr = Mid1(Vstr, 2, 99);
        return;
    }

    Commons_JSB2JS.Upcase = 1;
    Ostr = '';
    L = Len(Vstr);
    var _ForEndI_129 = +L;
    for (I = 1; I <= _ForEndI_129; I++) {
        C = Mid1(Vstr, I, 1);
        if (Commons_JSB2JS.Processingtemplates && Not(Commons_JSB2JS.Hush)) {
            Cvt = 0;
        } else {
            if (Commons_JSB2JS.Mr83) Cvt = (Index1('_&!@#$%.', C, 1)); else Cvt = (Index1('_&!@#$%', C, 1));
        }
        if (CBool(Cvt)) {
            C3 = Extract('_' + Chr(254) + '_AMP_' + Chr(254) + '_BANG_' + Chr(254) + '_AT_' + Chr(254) + '_PND_' + Chr(254) + '_DLR_' + Chr(254) + '_PCT_' + Chr(254) + '_', Cvt, 0, 0);
            Ostr = CStr(Ostr) + CStr(C3);
            Commons_JSB2JS.Upcase = 1;
        } else {
            if (C == '_') {
                Commons_JSB2JS.Upcase = 1;
                Ostr = CStr(Ostr) + '_';
            } else {
                if (Commons_JSB2JS.Upcase) {
                    Ostr = CStr(Ostr) + UCase(C);
                    Commons_JSB2JS.Upcase = 0;
                } else {
                    Ostr = CStr(Ostr) + LCase(C);
                }
            }
        }
    }

    if (Locate(UCase(Ostr), Commons_JSB2JS.Uc_Externals_Purejs_List, 0, 0, 0, "", position => { })) Ostr = '_' + CStr(Ostr);

    return Ostr;
}
// </MAKEVARNAME>

// <ERR>
async function Err(Msg) {
    await Include_JSB2JS__Comms(false)

    if (Commons_JSB2JS.Ignoreerrors) return;
    if (Index1(Commons_JSB2JS._Options, '!', 1)) { Print(); debugger; }

    Commons_JSB2JS.Errcnt++;
    if (Commons_JSB2JS.Errcnt == 1) {
        Println(crlf, anchorEdit(CStr(Commons_JSB2JS.Cur_Fname), CStr(Commons_JSB2JS.Itemid)));
    }

    if (Commons_JSB2JS.Tkam != Null0(Commons_JSB2JS.Errline)) {
        Println();
        Println(anchorEdit(CStr(Commons_JSB2JS.Cur_Fname), CStr(Commons_JSB2JS.Itemid), MonoSpace(CStr(Commons_JSB2JS.Tkam) + ' ' + CStr(Commons_JSB2JS.Itemsrc[Commons_JSB2JS.Tkam])), '', +'', Commons_JSB2JS.Tkam));
        Commons_JSB2JS.Errors = Replace(Commons_JSB2JS.Errors, -1, 0, 0, CStr(Commons_JSB2JS.Tkam) + ' ' + CStr(Commons_JSB2JS.Itemsrc[Commons_JSB2JS.Tkam]));
        Commons_JSB2JS.Errline = Commons_JSB2JS.Tkam;
        Commons_JSB2JS.Errpos = 0;
        if (InStr1(1, Commons_JSB2JS._Options, '!')) { Print(); debugger; }
    }

    if (Null0(Commons_JSB2JS.Errpos) != Commons_JSB2JS.Tkpos) {
        Println(MonoSpace(Space(Commons_JSB2JS.Tkpos - Len(Commons_JSB2JS.Tkstr) + 4)), '^', Chr(14), Commons_JSB2JS.Tkam, ' ', Msg, Chr(14));
        Commons_JSB2JS.Errors = Replace(Commons_JSB2JS.Errors, -1, 0, 0, Space(Commons_JSB2JS.Tkpos - Len(Commons_JSB2JS.Tkstr) + 4) + '^' + CStr(Msg));
        if (!Commons_JSB2JS.Tkstr) Println(); else { Println('; "', Commons_JSB2JS.Tkstr, '" found.'); }
        Commons_JSB2JS.Errpos = Commons_JSB2JS.Tkpos;
    }

    while (!(Index1(CStr(Commons_JSB2JS.La) + Equates_JSB2JS.C_SEMI + Equates_JSB2JS.C_AM + Equates_JSB2JS.C_SM, Commons_JSB2JS.Tkno, 1))) {
        await Tcv(false);
    }
    return;

    // ********************************************************************************************************************
}
// </ERR>

// <ERR2>
async function Err2(Msg) {
    await Include_JSB2JS__Comms(false)

    // REPORT ERROR NO MATTER WHAT

    if (Index1(Commons_JSB2JS._Options, '!', 1)) { Print(); debugger; }

    Commons_JSB2JS.Errcnt++;
    if (Commons_JSB2JS.Errcnt == 1) {
        Println(crlf, anchorEdit(CStr(Commons_JSB2JS.Cur_Fname), CStr(Commons_JSB2JS.Itemid)));
    }

    if (Commons_JSB2JS.Tkam != Null0(Commons_JSB2JS.Errline) && Commons_JSB2JS.Tkam <= UBound(Commons_JSB2JS.Itemsrc)) {
        Println();
        Println(MonoSpace(CStr(Commons_JSB2JS.Tkam) + ' ' + CStr(Commons_JSB2JS.Itemsrc[Commons_JSB2JS.Tkam])));
        Commons_JSB2JS.Errors = Replace(Commons_JSB2JS.Errors, -1, 0, 0, CStr(Commons_JSB2JS.Tkam) + ' ' + CStr(Commons_JSB2JS.Itemsrc[Commons_JSB2JS.Tkam]));
        Commons_JSB2JS.Errline = Commons_JSB2JS.Tkam;
        Commons_JSB2JS.Errpos = 0;
        if (InStr1(1, Commons_JSB2JS._Options, '!')) { Print(); debugger; }
    }
    Println(anchorEdit(CStr(Commons_JSB2JS.Cur_Fname), CStr(Commons_JSB2JS.Itemid), MonoSpace(Space(Commons_JSB2JS.Tkpos - Len(Commons_JSB2JS.Tkstr) + 3) + '^') + Chr(14) + CStr(Commons_JSB2JS.Tkam) + ' ' + CStr(Msg) + Chr(14), '', +'', Commons_JSB2JS.Tkam));
    Commons_JSB2JS.Errors = Replace(Commons_JSB2JS.Errors, -1, 0, 0, Space(Commons_JSB2JS.Tkpos - Len(Commons_JSB2JS.Tkstr) + 4) + '^' + CStr(Msg));
    Commons_JSB2JS.Errpos = Commons_JSB2JS.Tkpos;
    return;

    // ********************************************************************************************************************
}
// </ERR2>

// <WARNING>
async function Warning(Msg) {
    await Include_JSB2JS__Comms(false)

    if (Commons_JSB2JS.Tkam != Null0(Commons_JSB2JS.Errline) && Commons_JSB2JS.Tkam <= UBound(Commons_JSB2JS.Itemsrc)) {
        Println();
        Println(MonoSpace(CStr(Commons_JSB2JS.Tkam) + ' ' + CStr(Commons_JSB2JS.Itemsrc[Commons_JSB2JS.Tkam])));
        Commons_JSB2JS.Errors = Replace(Commons_JSB2JS.Errors, -1, 0, 0, CStr(Commons_JSB2JS.Tkam) + ' ' + CStr(Commons_JSB2JS.Itemsrc[Commons_JSB2JS.Tkam]));
        Commons_JSB2JS.Errline = Commons_JSB2JS.Tkam;
    }
    Println(anchorEdit(CStr(Commons_JSB2JS.Cur_Fname), CStr(Commons_JSB2JS.Itemid), MonoSpace(Space(Commons_JSB2JS.Tkpos - Len(Commons_JSB2JS.Tkstr) + 4)) + '|Warning: ' + Chr(15) + CStr(Commons_JSB2JS.Tkam) + ' ' + CStr(Msg) + Chr(15), '', +'', Commons_JSB2JS.Tkam));
    Commons_JSB2JS.Errors = (Replace(Commons_JSB2JS.Errors, -1, 0, 0, Space(Commons_JSB2JS.Tkpos - Len(Commons_JSB2JS.Tkstr) + 4) + '|Warning: ' + CStr(Msg)));
    return;

    // ********************************************************************************************************************
}
// </WARNING>

// <MATLOAD>
async function Matload() {
    // local variables
    var Gattr, Pt, Expectingtype;

    await Include_JSB2JS__Comms(false)

    if (Commons_JSB2JS.Tkno < Equates_JSB2JS.C_IDENT) {
        await Err('Variable Identifier expected');
        Commons_JSB2JS.Matloadsize = 'M1X0';
        Gattr = {};
        return Gattr;
    }

    Gattr = await Readsym(Commons_JSB2JS.Tkstr);
    if (CBool(Commons_JSB2JS.Readsymfound)) {
        if (Not(Gattr.SYM_USED) && !(Index1(Equates_JSB2JS.C_LPAREN + Equates_JSB2JS.C_GREAT + Equates_JSB2JS.C_LBRACK, Commons_JSB2JS.Tkno, 1))) {
            Gattr.SYM_USED = 1;
            await Writesym(Gattr, Commons_JSB2JS.Tkstr);
        }
        if (isEmpty(Gattr.SYM_INDEX1)) await Err('Variable not DIMensioned');
        Pt = Index1(Equates_JSB2JS.TYPE_VAR + Equates_JSB2JS.TYPE_VNUM + Equates_JSB2JS.TYPE_VBOOL + Equates_JSB2JS.TYPE_VSTR, Gattr.SYM_TYPE, 1);
        Expectingtype = Mid1('pns', Pt, 1);
        if (Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VSTR) {
            Expectingtype = 's' + CStr(Gattr.SYM_STRLEN) + CStr(Expectingtype);
        }
        Commons_JSB2JS.Matloadsize = 'M' + CStr(Gattr.SYM_INDEX1) + 'X' + CStr(Gattr.SYM_INDEX2) + CStr(Expectingtype);
    } else {
        await Err('Variable not DIMensioned');
    }
    await Tcv(false);
    return Gattr;

}
// </MATLOAD>

// <THENELSE>
async function Thenelse(Gattr) {
    // local variables
    var Ochold, Holdhaslbl, Ifblock, Elseblock, Elseifblock, Endlbl;
    var Elselbl, Needbraces, Forcebraces, Rc, Needthenbraces, Needelsebraces;

    await Include_JSB2JS__Comms(false)

    await Makebool(Gattr);
    if (Trim(Commons_JSB2JS.Oc)) { Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = Space(Commons_JSB2JS.Indent); }
    Ochold = Commons_JSB2JS.Ocpgm; Commons_JSB2JS.Ocpgm = [undefined,]; Holdhaslbl = Commons_JSB2JS.Haslbl; Commons_JSB2JS.Haslbl = 0;

    Ifblock = '';
    Elseblock = '';
    Elseifblock = '';
    Endlbl = '_EndIf_' + CStr(Commons_JSB2JS.Nxtlbl);
    Elselbl = '_Else_' + CStr(Commons_JSB2JS.Nxtlbl); Commons_JSB2JS.Nxtlbl++;

    Needbraces = false;

    if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_ELSE) {
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_THEN) {
            await Tcv(false);
            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AM) Forcebraces = true;
        }
        Commons_JSB2JS.Oc = ''; Commons_JSB2JS.Ocpgm = [undefined,];
        await states(2, Equates_JSB2JS.C_ELSE);
        if (Trim(Commons_JSB2JS.Oc)) Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc;
        Ifblock = RTrim(LTrim(Commons_JSB2JS.Ocpgm));
    }

    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ELSE || Commons_JSB2JS.Tkstr == 'ELSEIF') {
        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_ELSE) await Tcv(false); else Commons_JSB2JS.Tkstr = 'IF';

        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AM) Forcebraces = true;

        Commons_JSB2JS.Oc = ''; Commons_JSB2JS.Ocpgm = [undefined,];
        if (Commons_JSB2JS.Tkstr == 'IF') {
            await states(2, '');
            if (Trim(Commons_JSB2JS.Oc)) Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc;
            Elseifblock = RTrim(LTrim(Commons_JSB2JS.Ocpgm));;
        } else {
            await states(2, Equates_JSB2JS.C_ELSE);
            if (Trim(Commons_JSB2JS.Oc)) Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc;
            Elseblock = RTrim(LTrim(Commons_JSB2JS.Ocpgm));
        }
    }

    Commons_JSB2JS.Ocpgm = Ochold; Commons_JSB2JS.Oc = Space(Commons_JSB2JS.Indent);
    if (Commons_JSB2JS.Haslbl) {
        if (CBool(Elseifblock)) Elseblock = Elseifblock;

        if (!isEmpty(Ifblock)) {
            if (!isEmpty(Elseblock)) {
                Commons_JSB2JS.Oc += 'if (' + CStr(Gattr.SYM_C) + ') null; else { gotoLabel = "' + CStr(Elselbl) + '"; continue atgoto }';
                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent + 3) + LTrim(Ifblock));
                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent + 3) + 'gotoLabel = "' + CStr(Endlbl) + '"; continue atgoto; ');
                await Deflbl(Elselbl, 0);
                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent + 3) + LTrim(Elseblock));
            } else {
                Commons_JSB2JS.Oc += 'if (' + CStr(Gattr.SYM_C) + ') null; else { gotoLabel = "' + CStr(Endlbl) + '"; continue atgoto }';
                Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent + 3) + LTrim(Ifblock));
            }
        } else if (!isEmpty(Elseblock)) {
            // NO IF BLOCK
            Commons_JSB2JS.Oc += 'if (' + CStr(Gattr.SYM_C) + ') { gotoLabel = "' + CStr(Endlbl) + '"; continue atgoto }';
            Commons_JSB2JS.Oc = Replace(Commons_JSB2JS.Oc, -1, 0, 0, Space(Commons_JSB2JS.Indent + 3) + LTrim(Elseblock));
        }
        await Deflbl(Endlbl, 0);
        Commons_JSB2JS.Haslbl = (Commons_JSB2JS.Haslbl || CBool(Holdhaslbl));
        return;
    }


    while (true) {
        Rc = Right(Ifblock, 1);
        if (Not(Rc == ';' || Rc == am || Rc == cr || Rc == lf)) break;
        Ifblock = Left(Ifblock, Len(Ifblock) - 1);
    }


    while (true) {
        Rc = Right(Elseblock, 1);
        if (Not(Rc == ';' || Rc == am || Rc == cr || Rc == lf)) break;
        Elseblock = Left(Elseblock, Len(Elseblock) - 1);
    }

    if (InStr1(1, Ifblock, ';') || InStr1(1, Ifblock, '{') || InStr1(1, Ifblock, '//')) Needthenbraces = true;
    if (InStr1(1, Elseblock, ';') || InStr1(1, Elseblock, '{') || InStr1(1, Elseblock, '//')) Needelsebraces = true;

    if (!isEmpty(Ifblock) && (CBool(Forcebraces) || CBool(Needthenbraces))) {
        if (Right(Ifblock, 1) != '}') { Ifblock += ';'; }
        if (CBool(Forcebraces) || InStr1(1, Ifblock, Chr(254)) || InStr1(1, Ifblock, '//')) {
            Ifblock = '{' + Chr(254) + Space(Commons_JSB2JS.Indent + 3) + CStr(Ifblock) + Chr(254) + Space(Commons_JSB2JS.Indent) + '}';
        } else {
            Ifblock = '{ ' + CStr(Ifblock) + ' }';
        }
    }

    if (!isEmpty(Elseblock) && (CBool(Forcebraces) || CBool(Needelsebraces))) {
        if (Right(Elseblock, 1) != '}') { Elseblock += ';'; }
        if (CBool(Forcebraces) || InStr1(1, Elseblock, Chr(254)) || InStr1(1, Elseblock, '//')) {
            Elseblock = '{' + Chr(254) + Space(Commons_JSB2JS.Indent + 3) + CStr(Elseblock) + Chr(254) + Space(Commons_JSB2JS.Indent) + '}';
        } else {
            Elseblock = '{ ' + CStr(Elseblock) + ' }';
        }
    }

    if (!isEmpty(Elseifblock)) Elseblock = Elseifblock;

    if (!isEmpty(Ifblock)) {
        if (Right(Ifblock, 1) != '}') { Ifblock += ';'; }

        if (!isEmpty(Elseblock)) {
            if (Right(Elseblock, 1) != '}') { Elseblock += ';'; }
            Commons_JSB2JS.Oc += 'if (' + CStr(Gattr.SYM_C) + ') ' + CStr(Ifblock) + ' else ' + CStr(Elseblock);
        } else {
            Commons_JSB2JS.Oc += 'if (' + CStr(Gattr.SYM_C) + ') ' + CStr(Ifblock);
        }
    } else if (!isEmpty(Elseblock)) {
        // NO IF BLOCK
        if (Right(Elseblock, 1) != '}') { Elseblock += ';'; }
        Commons_JSB2JS.Oc += 'if (' + CStr(Gattr.SYM_C) + '); else ' + CStr(Elseblock);;
    } else {
        Commons_JSB2JS.Oc += 'if (' + CStr(Gattr.SYM_C) + ') null; ';
    }

    Commons_JSB2JS.Haslbl = (Commons_JSB2JS.Haslbl || CBool(Holdhaslbl));
    return;

}
// </THENELSE>

// <TYPEDEF>
async function Typedef(Type_Flavor, Process_Commas, Optionsinternal) {
    // local variables
    var Sep, Gattr, Ismat, Lattr, Previousdef, Spot, F, I;

    await Include_JSB2JS__Comms(false)

    // NOTE: INCFILE=1 IS MAIN FILE, INCFILE>1 IS INCLUDE
    // INDEX1=-1 IF VAR DECLARED PREVIOUSLY ONLY AS MAT

    // Parameter if SYM_FLAVOR = FLAVOR_PARAMETER

    // If parameter, parameter is:
    // Call by value if <SYM_ISCONST> = 1 (Use CONST)
    // (Not valid for type VARIANT)
    // Call by address if <SYM_ISCONST> = 0 (Default)

    Commons_JSB2JS.La = CStr(Commons_JSB2JS.La) + Equates_JSB2JS.C_COMMA;
    Sep = ';';


    while (true) {
        Gattr = {};
        Gattr.SYM_FLAVOR = Type_Flavor;
        Gattr.SYM_INCLEVEL = Commons_JSB2JS._Incfile;
        Gattr.SYM_ISCONST = 0;
        Gattr.SYM_JSOBJ = Optionsinternal;

        if (Null0(Type_Flavor) == Equates_JSB2JS.FLAVOR_PARAMETER) {
            if (Commons_JSB2JS.Tkstr == 'BYVAL') {
                await Tcv(false);
                Gattr.SYM_ISBYVAL = true;
            } else {
                // assumed byRef
                if (Commons_JSB2JS.Tkstr == 'BYREF') await Tcv(false);
                Gattr.SYM_ISBYVAL = false;
            }
            if (Commons_JSB2JS.Tkno < Equates_JSB2JS.C_IDENT) { await Err('Variable expected'); return; }
        } else {
            if (Commons_JSB2JS.Tkstr == 'CONST') {
                await Tcv(false);
                if (Commons_JSB2JS.Tkno >= Equates_JSB2JS.C_IDENT) {
                    Gattr.SYM_ISCONST = 1;
                } else {
                    if (Commons_JSB2JS.Tkno < Equates_JSB2JS.C_IDENT) { await Err('Variable expected'); return; }
                }
            }
        }

        Ismat = (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_MAT);
        if (CBool(Ismat)) await Tcv(false);

        if (Commons_JSB2JS.Tkno < Equates_JSB2JS.C_IDENT) { await Err('Variable expected'); return; }
        Gattr.SYMNAME = Commons_JSB2JS.Tkstr;
        if (Null0(Type_Flavor) != Equates_JSB2JS.FLAVOR_EXTERNAL && Not(Optionsinternal)) Commons_JSB2JS.Otkstr = await Makevarname(Commons_JSB2JS.Otkstr);
        Gattr.SYM_C = Commons_JSB2JS.Otkstr;

        await Tcv(false);

        // CHECK FOR DIM()'S

        if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_LPAREN) {
            await Tcv(false);
            Lattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
            if (Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_CNUM || (Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_ENUM && Null0(Lattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_EQUATE)) {
                Gattr.SYM_INDEX1 = Lattr.SYM_C;
            } else {
                await Err('Integer constant expected');
            }

            if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA) {
                await Tcv(false);
                Lattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA + Equates_JSB2JS.C_RPAREN);
                if (Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_CNUM || (Lattr.SYM_TYPE == Equates_JSB2JS.TYPE_ENUM && Null0(Lattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_EQUATE)) {
                    Gattr.SYM_INDEX2 = Lattr.SYM_C;
                } else {
                    await Err('Integer constant expected');
                }
            }
            if (Commons_JSB2JS.Tkno != Equates_JSB2JS.C_RPAREN) await Err(') expected.. found '); else await Tcv(false);
            Gattr.SYM_ISCONST = 0;;
        } else if (CBool(Ismat)) {
            Gattr.SYM_INDEX1 = -1;
            Gattr.SYM_INDEX2 = -1;
            Gattr.SYM_ISCONST = 0;
        }

        if (Commons_JSB2JS.Tkstr == 'AS') {
            await parseAStype(Gattr);
        } else {
            Gattr.SYM_TYPE = Equates_JSB2JS.TYPE_VAR;
        }

        // CHECK FOR PREVIOUS DEFINITION

        Previousdef = clone(Commons_JSB2JS.Symtab[Gattr.SYMNAME]);
        if (CBool(Previousdef)) {
            Gattr.SYM_JSOBJ = (CBool(Previousdef.SYM_JSOBJ) || CBool(Optionsinternal));
            Gattr.SYM_C = Previousdef.SYM_C;
            Gattr.SYM_ISBYVAL = (CBool(Gattr.SYM_ISBYVAL) || CBool(Previousdef.SYM_ISBYVAL));
            Gattr.SYM_USED += CNum(Previousdef.SYM_USED);
            Gattr.SYM_TYPES += CStr(Previousdef.SYM_TYPES);
            Gattr.SYM_ISCONST += CNum(Previousdef.SYM_ISCONST);
            if (Null0(Previousdef.SYM_INCLEVEL) < Null0(Gattr.SYM_INCLEVEL)) Gattr.SYM_INCLEVEL = Previousdef.SYM_INCLEVEL;

            if (Null0(Previousdef.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_PARAMETER || Null0(Type_Flavor) == Equates_JSB2JS.FLAVOR_PARAMETER) {
                Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_PARAMETER;;
            } else if (Null0(Previousdef.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_COMMON || Null0(Type_Flavor) == Equates_JSB2JS.FLAVOR_COMMON) {
                Gattr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_COMMON;;
            } else if (Null0(Type_Flavor) == Equates_JSB2JS.FLAVOR_EXTERNAL || CBool(Optionsinternal)) {
                // OK to declare twice (look ahead from $options);
            } else {
                await Err('Already declared');
            }
        }

        if (Null0(Gattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_PARAMETER) {
            if (Locate(Gattr.SYMNAME, Commons_JSB2JS.Paramlist, 0, 0, 0, "", position => Spot = position)); else {
                Spot = UBound(Commons_JSB2JS.Paramlist) + 1;
                Commons_JSB2JS.Paramlist[Commons_JSB2JS.Paramlist.length] = Gattr.SYMNAME;
            }

            Gattr.SYM_USED = 1;
            Gattr.SYM_TYPES = Equates_JSB2JS.SYMTYPES_STORED;
            if (Not(Gattr.SYM_ISBYVAL)) Gattr.SYM_C = 'ByRef_' + await Makevarname(Gattr.SYMNAME);
        } else if (Null0(Gattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_COMMON) {
            F = Gattr.SYMNAME;
            F = await Makevarname(F);
            // Gattr.SYM_C = "Commons_":UCase(Cur_realfname):"_":Makevarname(Subname):".":F
            Gattr.SYM_C = 'Commons_' + UCase(Commons_JSB2JS.Cur_Realfname) + '.' + CStr(F);;
        } else if (Null0(Gattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_EXTERNAL || CBool(Optionsinternal)) {
            Gattr.SYM_TYPES = Equates_JSB2JS.SYMTYPES_STORED;;
        } else if (Null0(Gattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_LOCAL) {
            Gattr.SYM_C = await Makevarname(Gattr.SYMNAME);;
        } else {
            Print(); debugger;
        }

        // CHANGE VSTR TO CSTR
        if (CBool(Gattr.SYM_ISCONST)) {
            if (Null0(Gattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_EXTERNAL) {
                I = Index1(Equates_JSB2JS.TYPE_VSTR + Equates_JSB2JS.TYPE_VNUM, Gattr.SYM_TYPE, 1);
                // Do not allow address ops on constant externals <> [], etc_
                if (CBool(I)) {
                    Gattr.SYM_TYPE = Mid1(Equates_JSB2JS.TYPE_CSTR + Equates_JSB2JS.TYPE_CNUM, I, 1);
                }
            }
        }

        await Writesym(Gattr, Gattr.SYMNAME);

        if (Not(Gattr.isAlreadyDefined) && CBool(Process_Commas) && (Null0(Gattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_COMMON || Null0(Gattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_LOCAL)) {
            if (Sep == ',') {
                Commons_JSB2JS.Oc = CStr(Commons_JSB2JS.Oc) + ', ';
            } else if (Null0(Gattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_LOCAL) {
                Commons_JSB2JS.Oc += 'var ';
            }

            Gattr.isAlreadyDefined = true;
            await Writesym(Gattr, Gattr.SYMNAME);

            if (Commons_JSB2JS.Tkstr == '=') {
                await Tcv(false);
                Lattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA);
                await Store(Gattr, Lattr);
                Sep = ';';;
            } else {
                if (Gattr.SYM_TYPE == Equates_JSB2JS.TYPE_VSTR) {
                    Commons_JSB2JS.Oc += CStr(Gattr.SYM_C) + ' = \'\'';
                    Sep = ',';;
                } else if (Null0(Gattr.SYM_FLAVOR) == Equates_JSB2JS.FLAVOR_COMMON) {
                    Sep = ';';;
                } else {
                    Commons_JSB2JS.Oc += CStr(Gattr.SYM_C) + ' = undefined';
                    Sep = ',';
                }
            }
        } else {
            if (Commons_JSB2JS.Tkstr == '=') {
                await Tcv(false);
                Lattr = await Expr(Equates_JSB2JS.TYPE_ESTR, 1, Equates_JSB2JS.C_COMMA);
                await Store(Gattr, Lattr);
                Sep = ';';
            }
        }

        if (Not(Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA && CBool(Process_Commas))) break;
        await Tcv(false);
    }

    if (Sep == ',') { Commons_JSB2JS.Oc += '; '; }
    Commons_JSB2JS.La = Mid1(Commons_JSB2JS.La, 1, Len(Commons_JSB2JS.La) - 1);
    return;
}
// </TYPEDEF>

// <DEFINEEQUATES>
async function Defineequates() {
    // local variables
    var Orgname, Symname, Aexpr, Bexpr;

    await Include_JSB2JS__Comms(false)

    await Tcv(false);

    while (true) {
        if (Commons_JSB2JS.Tkno < Equates_JSB2JS.C_IDENT) { await Err('Identifier expected'); break; }
        Orgname = Commons_JSB2JS.Tkstr;
        Symname = Commons_JSB2JS.Tkstr;
        Symname = await Makesubname(Symname);
        Aexpr = {};
        await Tcv(false);
        if (!(Index1(Equates_JSB2JS.C_TO + Equates_JSB2JS.C_EQUAL, Commons_JSB2JS.Tkno, 1))) {
            await Err('TO expected');
            break;
        }

        await Tcv(false);
        Aexpr = await Expr(Equates_JSB2JS.TYPE_CSTR, 1, Equates_JSB2JS.C_COMMA);

        Aexpr.SYMNAME = Orgname;
        Aexpr.SYM_FLAVOR = Equates_JSB2JS.FLAVOR_EQUATE;
        Aexpr.SYM_USED = 1;
        Aexpr.SYM_TYPES = Equates_JSB2JS.SYMTYPES_STORED;
        Aexpr.SYM_EQUATE = Aexpr.SYM_C;
        Aexpr.SYM_INCLEVEL = Commons_JSB2JS._Incfile;
        Aexpr.SYM_ISCONST = Index1(Equates_JSB2JS.TYPE_CNUM + Equates_JSB2JS.TYPE_CSTR, Aexpr.SYM_TYPE, 1);
        if (CBool(Aexpr.SYM_ISCONST)) {
            if (Commons_JSB2JS._Incfile > 0 || Commons_JSB2JS.Functiontype == -1) {
                Aexpr.SYM_C = 'Equates_' + UCase(Commons_JSB2JS.Cur_Realfname) + '.' + CStr(Symname);
            } else {
                Aexpr.SYM_C = Symname;
            }
        }

        Bexpr = await Readsym(Orgname);

        if (CBool(Commons_JSB2JS.Readsymfound)) await Err('Symbol already defined'); else await Writesym(Aexpr, Orgname);

        if (Commons_JSB2JS.Functiontype == 0) {
            if (CBool(Aexpr.SYM_ISCONST)) {
                Commons_JSB2JS.Oc = CStr(Commons_JSB2JS.Oc) + CStr(Aexpr.SYM_C) + ' = ' + CStr(Aexpr.SYM_EQUATE) + '; ';
            } else {
                Commons_JSB2JS.Oc += '// ' + CStr(Aexpr.SYMNAME) + ' is expanded inline as ' + CStr(Aexpr.SYM_C) + ';';
            }
        }
        if (Not(Commons_JSB2JS.Tkno == Equates_JSB2JS.C_COMMA)) break;
        await Tcv(false);
    }
}
// </DEFINEEQUATES>

// <UPDATECROSSREFERENCE_Sub>
async function JSB2JS_UPDATECROSSREFERENCE_Sub(ByRef_Newdef, setByRefValues) {
    // local variables
    var Fname, Iname, Isjs, Xrefid, Myolddef, Commoncall, Fullfileandsubname;
    var Spot, Mycallingid, Pdef, Iscalledby, Xdef, Needtorecompilemycallers;

    function exit(v) {
        if (typeof setByRefValues == 'function') setByRefValues(ByRef_Newdef)
        return v
    }
    await Include_JSB2JS__Comms(false)

    // -1) COMMONS, 0) PROGRAM, 1) SUBROUTINE, 2) FUNCTION, 3) @@FUNCTION, 4) PICK/RESTFUL FUNCTION 

    Fname = ByRef_Newdef.SUB_FNAME; // Alreaded made true and lowercase
    Iname = ByRef_Newdef.SUB_INAME;
    Isjs = ByRef_Newdef.SUB_NOAWAITSALLOWED;

    ByRef_Newdef.SUB_PARAMTYPES = Change(ByRef_Newdef.SUB_PARAMTYPES, am, ',');

    Commons_JSB2JS.Subname = CStr(Fname) + '_' + CStr(ByRef_Newdef.SUB_SUBNAME);

    if (Null0(ByRef_Newdef.SUB_ISFUNCTION) == 2) {
        Xrefid = LCase(Commons_JSB2JS.Subname) + '_fnc';
    } else if (Null0(ByRef_Newdef.SUB_ISFUNCTION) == 1) {
        Xrefid = LCase(Commons_JSB2JS.Subname) + '_sub';
    } else if (Null0(ByRef_Newdef.SUB_ISFUNCTION) == '0') {
        Xrefid = LCase(Commons_JSB2JS.Subname) + '_pgm';
    } else {
        return exit(undefined);
    }

    // This isn't necessary other than for maintaining the XREF list - skip if we don't have the file
    if (Not(Commons_JSB2JS.Fxrefs)) return exit(undefined);

    // Read our previous def
    Myolddef = await JSB2JS_READXREF(CStr(Xrefid) + '.def');
    if (CBool(Myolddef)) {
        if (Null0(Myolddef.SUB_FNAME) != Null0(ByRef_Newdef.SUB_FNAME) && !isEmpty(Myolddef.SUB_FNAME)) {
            await Warning('You have \'' + Commons_JSB2JS.Subname + '\' defined in two files: ' + CStr(Myolddef.SUB_FNAME) + ' and ' + CStr(ByRef_Newdef.SUB_FNAME) + '.');
        }
    } else {
        Myolddef = {}
    }

    // Update our new .def record 
    ByRef_Newdef.SUB_ISCALLEDBY = Myolddef.SUB_ISCALLEDBY;
    if (await JSB2JS_WRITEXREF(CStr(Xrefid) + '.def', ByRef_Newdef)); else {
        Println(activeProcess.At_Errors);
        return exit(undefined);
    }

    // See who we don't call anymore, and remove ourselves from their calllists

    var Old_Callsto = Split(Myolddef.SUB_CALLSTO, ',');
    Commoncall = [undefined,];
    for (Fullfileandsubname of iterateOver(Commons_JSB2JS.Calllist)) {
        if (Locate(Fullfileandsubname, Old_Callsto, 0, 0, 0, "", position => Spot = position)) {
            Commoncall[Commoncall.length] = Fullfileandsubname;
            Old_Callsto.DELETE(Spot);
        }
    }

    Mycallingid = LCase(CStr(Fname) + '*' + CStr(Iname) + '*' + Commons_JSB2JS.Subname + '*' + CStr(Xrefid));
    for (Fullfileandsubname of iterateOver(Old_Callsto)) {
        Pdef = await JSB2JS_READXREF(CStr(Fullfileandsubname) + '.def');
        if (CBool(Pdef)) {
            Iscalledby = (Split(Pdef.SUB_ISCALLEDBY, '|'));
            if (Locate(Mycallingid, Iscalledby, 0, 0, 0, "", position => Spot = position)) {
                Iscalledby = Delete(Iscalledby, 1, Spot, 0);
                Pdef.SUB_ISCALLEDBY = Join(Iscalledby, ',');
                if (await JSB2JS_WRITEXREF(CStr(Fullfileandsubname) + '.def', Pdef)); else return Stop(activeProcess.At_Errors);
            }
        }
    }

    // Let all the routines in our active CallList know that we call them

    for (Fullfileandsubname of iterateOver(Commons_JSB2JS.Calllist)) {
        Xdef = await JSB2JS_READXREF(CStr(Fullfileandsubname) + '.def');
        if (CBool(Xdef)) {
            Iscalledby = (Split(Xdef.SUB_ISCALLEDBY, '|'));
            if (Locate(Mycallingid, Iscalledby, 0, 0, 0, "", position => { })); else {
                Iscalledby[Iscalledby.length] = Mycallingid;
                Xdef.SUB_ISCALLEDBY = (Join(Iscalledby, '|'));
                if (await JSB2JS_WRITEXREF(CStr(Fullfileandsubname) + '.def', Xdef)); else return Stop(activeProcess.At_Errors);
            }
        }
    }

    // If we went from being an async function to not being one, or vica-verse, need to recompile anyone that calls us
    if (CBool(Myolddef.SUB_ISCALLEDBY)) {
        if (Null0(Myolddef.SUB_NOAWAITSALLOWED) != Null0(ByRef_Newdef.SUB_NOAWAITSALLOWED)) {
            Needtorecompilemycallers = 'Async function type changed from ' + CStr(Myolddef.SUB_NOAWAITSALLOWED) + ' to ' + CStr(ByRef_Newdef.SUB_NOAWAITSALLOWED) + ' in ' + Commons_JSB2JS.Subname + '; ';;
        } else if (Len(Myolddef.SUB_PARAMTYPES) != Len(ByRef_Newdef.SUB_PARAMTYPES)) {
            Needtorecompilemycallers = 'Parameters count changed from ' + CStr(Myolddef.SUB_PARAMTYPES) + ' to ' + CStr(ByRef_Newdef.SUB_PARAMTYPES) + ' in ' + Commons_JSB2JS.Subname + '; ';;
        } else if (LCase(Myolddef.SUB_PARAMTYPES) != LCase(ByRef_Newdef.SUB_PARAMTYPES)) {
            Needtorecompilemycallers = 'ByRef / ByVal Parameters changed from ' + CStr(Myolddef.SUB_PARAMTYPES) + ' to ' + CStr(ByRef_Newdef.SUB_PARAMTYPES) + ' in ' + Commons_JSB2JS.Subname + '; ';;
        } else if (Null0(Myolddef.SUB_PARAMTYPES) != Null0(ByRef_Newdef.SUB_PARAMTYPES)) {
            Needtorecompilemycallers = 'Parameters types changed from ' + CStr(Myolddef.SUB_PARAMTYPES) + ' to ' + CStr(ByRef_Newdef.SUB_PARAMTYPES) + ' in ' + Commons_JSB2JS.Subname + '; ';;
        } else if (Null0(Myolddef.SUB_OPTIONALPARAMCNT) != Null0(ByRef_Newdef.SUB_OPTIONALPARAMCNT)) {
            Needtorecompilemycallers += 'Optional parameter count changed from ' + CStr(Myolddef.SUB_OPTIONALPARAMCNT) + ' to ' + CStr(ByRef_Newdef.SUB_OPTIONALPARAMCNT) + ' in ' + Commons_JSB2JS.Subname + '; ';
        }

        // if MyOldDef.SUB_RTNTYPE <> newDef.SUB_RTNTYPE Then NeedToRecompileMyCallers := "function return type changed; "

        if (CBool(Needtorecompilemycallers)) {
            await JSB2JS_ADDTOCOMPILELIST_Sub(Myolddef.SUB_ISCALLEDBY, Needtorecompilemycallers);
        }
    }

    return exit(undefined);
}
// </UPDATECROSSREFERENCE_Sub>

// <AFTERHEADERPARSE_Sub>
async function JSB2JS_AFTERHEADERPARSE_Sub() {
    // local variables
    var Needtorecompilemycallers, Externaldef, Oldtruename, Ss;
    var I, Nc, Xrefid, Myolddef;

    await Include_JSB2JS__Comms(false)

    Needtorecompilemycallers = '';

    // We need to reload this each time as $options external func ass to this list
    Commons_JSB2JS.Externals_Purejs_List = Commons_JSB2JS.Externals_Txt;
    Commons_JSB2JS.Uc_Externals_Purejs_List = UCase(Commons_JSB2JS.Externals_Txt);

    if (Commons_JSB2JS.Functiontype != 2 && Commons_JSB2JS.Functiontype != 1) return;

    if (Locate(UCase(Commons_JSB2JS.Truesubname), Commons_JSB2JS.Uc_Externals_Purejs_List, 0, 0, 0, "", position => Externaldef = position)) Oldtruename = Extract(Commons_JSB2JS.Externals_Purejs_List, Externaldef, 0, 0); else Externaldef = 0;

    if (CBool(Externaldef)) {
        if (Null0(Oldtruename) != Null0(Commons_JSB2JS.Truesubname)) {
            Needtorecompilemycallers += 'config_jsb2js updated with correct casing of ' + CStr(Commons_JSB2JS.Truesubname) + '; ';
            Commons_JSB2JS.Externals_Txt = Replace(Commons_JSB2JS.Externals_Txt, Externaldef, 0, 0, Commons_JSB2JS.Truesubname);
        }
        Commons_JSB2JS.Subname = Commons_JSB2JS.Truesubname;
        Commons_JSB2JS.Dontmorphfunctionname = true;
    }

    if (Commons_JSB2JS.Dontmorphfunctionname && System(1) == 'aspx') {
        // Make sure we don't conflict with anything in jsblib.js
        if (Not(Commons_JSB2JS.Jsblib_Src)) {
            if (await JSB_ODB_READ(Commons_JSB2JS.Jsblib_Src, await JSB_BF_FHANDLE('js'), 'jsblib.js', function (_Jsblib_Src) { Commons_JSB2JS.Jsblib_Src = _Jsblib_Src })); else Commons_JSB2JS.Jsblib_Src = '';
        }

        if (InStr1(1, Commons_JSB2JS.Jsblib_Src, 'function ' + CStr(Commons_JSB2JS.Truesubname) + '(')) {
            await Err('function ' + CStr(Commons_JSB2JS.Truesubname) + '() conflicts with jsblib.js');
        } else {
            Ss = am + 'var ' + CStr(Commons_JSB2JS.Truesubname);
            I = InStr1(1, Commons_JSB2JS.Jsblib_Src, Ss);
            if (CBool(I)) {
                Nc = Mid1(Commons_JSB2JS.Jsblib_Src, +I + Len(Ss), 1);
                if (!isAlpha(Nc)) await Warning('var ' + CStr(Commons_JSB2JS.Truesubname) + ' may conflict with jsblib.js');
            }
        }

        // Make sure casing in config_jsb2js is correct for what we have defined
        if (Not(Externaldef)) {
            Needtorecompilemycallers = 'Added ' + CStr(Commons_JSB2JS.Truesubname) + ' to "config_jsb2js"; ';
            Commons_JSB2JS.Externals_Txt = Replace(Commons_JSB2JS.Externals_Txt, -1, 0, 0, Commons_JSB2JS.Truesubname);
        }
    } else {
        if (CBool(Externaldef)) {
            if (Null0(Oldtruename) == Null0(Commons_JSB2JS.Truesubname) && Commons_JSB2JS.Truesubname == UCase(Commons_JSB2JS.Truesubname)) {
                Needtorecompilemycallers = CStr(Oldtruename) + ' is no longer has the $options ijs; need to update dependencies';
                Commons_JSB2JS.Externals_Txt = Delete(Commons_JSB2JS.Externals_Txt, Externaldef, 0, 0);
            }
        }
    }

    if (CBool(Needtorecompilemycallers)) {
        if (await JSB_ODB_WRITE(Commons_JSB2JS.Externals_Txt, Commons_JSB2JS.Fjsbconfig, 'config_jsb2js')); else Alert(CStr(activeProcess.At_Errors));

        Commons_JSB2JS.Externals_Purejs_List = Commons_JSB2JS.Externals_Txt;
        Commons_JSB2JS.Uc_Externals_Purejs_List = UCase(Commons_JSB2JS.Externals_Txt);

        if (Commons_JSB2JS.Functiontype == 2) {
            Xrefid = LCase(Commons_JSB2JS.Subname) + '_fnc';
        } else if (Commons_JSB2JS.Functiontype == 1) {
            Xrefid = LCase(Commons_JSB2JS.Subname) + '_sub';
        } else if (Commons_JSB2JS.Functiontype == 0) {
            Xrefid = LCase(Commons_JSB2JS.Subname) + '_pgm';
        } else {
            return;
        }

        Myolddef = await JSB2JS_READXREF(CStr(Xrefid) + '.def');
        if (CBool(Myolddef)) {
            if (CBool(Myolddef.SUB_ISCALLEDBY)) await Warning(Needtorecompilemycallers);
            await JSB2JS_ADDTOCOMPILELIST_Sub(Myolddef.SUB_ISCALLEDBY, Needtorecompilemycallers);
        }
    }
}
// </AFTERHEADERPARSE_Sub>

// <ADDTOCOMPILELIST_Sub>
async function JSB2JS_ADDTOCOMPILELIST_Sub(Calledbylist, Reason) {
    // local variables
    var Cl, Xrefid, Callerid, Calledbyfname, Calledbyiname, Calledbysubname;
    var Calledbyxdefid, Recompileid, Spot;

    await Include_JSB2JS__Comms(false)
    if (Not(Calledbylist)) return;

    Cl = (Split(Calledbylist, '|'));

    Println('Appending ', UBound(Cl), ' items to compilelist because ', Reason);

    Xrefid = Field(Xrefid, '.def', 1);

    for (Callerid of iterateOver(Cl)) {
        Calledbyfname = Field(Callerid, '*', 1);
        Calledbyiname = Field(Callerid, '*', 2);
        Calledbysubname = Field(Callerid, '*', 3);
        Calledbyxdefid = Field(Callerid, '*', 4);

        Recompileid = CStr(Calledbyfname) + vm + CStr(Calledbyiname);
        if (Locate(Recompileid, Commons_JSB2JS.Itemlist, 0, 0, 0, "", position => Spot = position)) Commons_JSB2JS.Itemlist = Delete(Commons_JSB2JS.Itemlist, Spot, 0, 0);
        Commons_JSB2JS.Itemlist[Commons_JSB2JS.Itemlist.length] = Recompileid;
        Print(Calledbyiname, ' ');
    }
    Println();

}
// </ADDTOCOMPILELIST_Sub>

// <WRITEXREF>
async function JSB2JS_WRITEXREF(Xdefid, D) {
    await Include_JSB2JS__Comms(false)

    Xdefid = LCase(Xdefid);
    Commons_JSB2JS.Cached_Xrefs[Xdefid] = D;

    // If we don't know the FNAME, then we can't be sure where this routine is really located (may be BF, HTML)
    if (Not(D.SUB_FNAME)) {
        // we may just be updating SUB_ISCALLEDBY 
        return true;
    }

    if (await JSB_ODB_WRITEJSON(D, Commons_JSB2JS.Fxrefs, Xdefid)); else return false;

    return true;
}
// </WRITEXREF>

// <XREF_Pgm>
async function JSB2JS_XREF_Pgm() {  // PROGRAM
    Commons_JSB2JS = {};
    Equates_JSB2JS = {};

    // local variables
    var Specificroutine;

    if (Not(isAdmin())) return Stop('You must be an admin to run this');

    Specificroutine = LCase(Field(Field(activeProcess.At_Sentence, ' ', 2), '(', 1));
    if (Not(Specificroutine)) return Stop('xref identifier');

    if (await JSB_ODB_SELECT('', await JSB_BF_FHANDLE('jsb_jsxrefs'), 'ItemId Like \'[' + CStr(Specificroutine) + ']\'', '')); else return Stop(activeProcess.At_Errors);

    if (Not(System(11))) return Stop('no match');
    await asyncTclExecute('L ItemID,SrcEdit,SUB_FNAME,SUB_INAME,SUB_FIRSTLINE,SUB_CNAME,SUB_NOAWAITS,SUB_MAYBENOAWAITSUB,NotASyncFunction, SUB_CALLSTO, isCalledBy From jsb_jsxrefs order by SUB_FNAME, SUB_INAME');
    return;
}
// </XREF_Pgm>

// <TCV>
async function Tcv(Inexpression) {
    // local variables
    var Ec, J, Nc, L, Ll, Hstr;

    await Include_JSB2JS__Comms(false)

    var C2 = '';
    var Pau = '';
    var C3 = '';
    var C = '';
    var Lib = '';
    var I = undefined;
    var Epos = undefined;
    var Cvt = undefined;
    var Tkstrlen = undefined;
    var Si = undefined;
    var Cmts = [undefined,];

    // Pre-Compile a BASIC program

    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_SM) return;

    if (Commons_JSB2JS.Tkno == Equates_JSB2JS.C_AM) {
        Commons_JSB2JS.Tkam++;
        Commons_JSB2JS.Tkpos = 1;
        if (Commons_JSB2JS.Tkam > UBound(Commons_JSB2JS.Itemsrc)) {
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_SM;
            Commons_JSB2JS.Tkline = '';
            Commons_JSB2JS.Tkstr = '';
            Commons_JSB2JS.Otkstr = Commons_JSB2JS.Tkstr;
            return;
        }
        Commons_JSB2JS.Tkline = Commons_JSB2JS.Itemsrc[Commons_JSB2JS.Tkam];
    }

    Commons_JSB2JS.Tkstartpos = Commons_JSB2JS.Tkpos;

    // SKIP WHITE SPACE

    Commons_JSB2JS.Spaces = Commons_JSB2JS.Tkstartpos;

    while (true) {
        C = Seq(Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos, 1));
        if (Not(Null0(C) == 32 || Null0(C) == 9 || Null0(C) == 8203)) break;
        Commons_JSB2JS.Tkstartpos = +Commons_JSB2JS.Tkstartpos + 1;
    }
    Commons_JSB2JS.Spaces = +Commons_JSB2JS.Tkstartpos - Commons_JSB2JS.Spaces;

    C = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos, 1);
    if (!C) {
        Commons_JSB2JS.Tkno = Equates_JSB2JS.C_AM;
        Commons_JSB2JS.Tkstr = '';
        Commons_JSB2JS.Otkstr = Commons_JSB2JS.Tkstr;
        return;
    }

    // CHECK FOR STRINGS

    if (C == '\'' || C == '"' || C == '`') {
        if (C == '`' || Commons_JSB2JS.Mr83) Ec = Chr(255); else Ec = '\\';
        Commons_JSB2JS.Tkpos = Commons_JSB2JS.Tkstartpos;
        Commons_JSB2JS.Tkstr = C;

        do {
            Commons_JSB2JS.Tkpos++;
            I = InStr1(Commons_JSB2JS.Tkpos, Commons_JSB2JS.Tkline, C);
            J = InStr1(Commons_JSB2JS.Tkpos, Commons_JSB2JS.Tkline, Ec);

            if (I == 0) I = Len(Commons_JSB2JS.Tkline) + 1;
            if (Null0(J) == '0') J = Len(Commons_JSB2JS.Tkline) + 1;
            if (Null0(J) < I && !Commons_JSB2JS.Simplestrings) I = J;

            Commons_JSB2JS.Tkstr += Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, I - Commons_JSB2JS.Tkpos);
            Commons_JSB2JS.Tkpos = I;

            C2 = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1);
            if (Null0(C2) == Null0(Ec)) {
                Commons_JSB2JS.Tkpos++;
                C2 += Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1);
            } else {
                if (C2 == C) {
                    Commons_JSB2JS.Tkstr += C2;
                    break;
                }
            }

            Commons_JSB2JS.Tkstr += C2;

            // End of the line?
            if (!C2) {
                // Did we start with ' or "?
                if (C != '`') {
                    // If what preceeded the string was a CR, AM, ;, THEN, ELSE - it's a comment
                    Si = +Commons_JSB2JS.Tkstartpos - 1;

                    while (true) {
                        if (Si <= 0) break;
                        C2 = Mid1(Commons_JSB2JS.Tkline, Si, 1);
                        if (C2 == ';') break;
                        if (C2 == ')') break;
                        if (C2 != ' ') {
                            Commons_JSB2JS.Tkstr += C;
                            if (CBool(Inexpression)) await Err('Missing string terminator: ' + C);
                            break;
                        }
                        Si--;
                    }
                    break;
                }

                Commons_JSB2JS.Tkam++;
                Commons_JSB2JS.Tkstr += Chr(13) + Chr(10);
                if (Commons_JSB2JS.Tkam > UBound(Commons_JSB2JS.Itemsrc)) {
                    await Err('Missing string terminator: ' + C);
                    break;
                }
                Commons_JSB2JS.Tkline = Commons_JSB2JS.Itemsrc[Commons_JSB2JS.Tkam];
                Commons_JSB2JS.Tkpos = 0;
            }
        }
        while (1);

        Commons_JSB2JS.Tkpos++;
        Commons_JSB2JS.Tkno = Equates_JSB2JS.C_STR;
        Commons_JSB2JS.Otkstr = Commons_JSB2JS.Tkstr;
        return;
    }

    // CHECK FOR SYMBOLS

    // Changed $ to !, and _ to ! to allow identifiers to start with _ 
    // !  $      !        ` " '  
    Si = (Index1(Chr(253) + '!@#!%^&*()!+-={}~[]!:!;\'\<\>?,./|', C, 1));
    if (Si) {
        Commons_JSB2JS.Tkpos = +Commons_JSB2JS.Tkstartpos + 1;
        Commons_JSB2JS.Tkstr = C;
        Commons_JSB2JS.Tkno = Chr(Si + Seq(Equates_JSB2JS.C_VM) - 1);
        Commons_JSB2JS.Otkstr = Commons_JSB2JS.Tkstr;

        // CHANGE != TO "<>"
        if (C == '!') {
            if (Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1) == '=') {
                Commons_JSB2JS.Tkpos++;
                Commons_JSB2JS.Tkstr = '#';
                Commons_JSB2JS.Tkno = Equates_JSB2JS.C_POUND;
                Commons_JSB2JS.Otkstr = Commons_JSB2JS.Tkstr;
            }
        } else if (C == '&') {
            if (Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1) == '&') {
                Commons_JSB2JS.Tkpos++;
                Commons_JSB2JS.Tkstr = 'AND';
                Commons_JSB2JS.Tkno = Equates_JSB2JS.C_AND;
                Commons_JSB2JS.Otkstr = Commons_JSB2JS.Tkstr;
            }
        } else if (C == '|') {
            if (Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1) == '|') {
                Commons_JSB2JS.Tkpos++;
                Commons_JSB2JS.Tkstr = 'OR';
                Commons_JSB2JS.Tkno = Equates_JSB2JS.C_OR;
                Commons_JSB2JS.Otkstr = Commons_JSB2JS.Tkstr;
            }
        } else if (C == '=') {
            if (Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1) == '=') {
                Commons_JSB2JS.Tkpos++;
                Commons_JSB2JS.Otkstr = Commons_JSB2JS.Tkstr;
            }
        } else if (C == '\<') {
            if (Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1) == '%') {
                Commons_JSB2JS.Tkpos++;
                Commons_JSB2JS.Tkstr = '\<%';


                while (true) {
                    C2 = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1);
                    Commons_JSB2JS.Tkstr += C2;
                    Nc = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos + 1, 1);

                    // End at */?
                    if (C2 == '%' && Nc == '\>') {
                        Cmts[Cmts.length] = Commons_JSB2JS.Tkstr + '\>';

                        Commons_JSB2JS.Tkstr = Join(Cmts, crlf);
                        Commons_JSB2JS.Tkpos += 2;

                        if (CBool(Inexpression)) {
                            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_CMTBLOCK;
                        } else {
                            if (Not(Commons_JSB2JS.Hush)) {
                                if (Trim(Commons_JSB2JS.Oc)) {
                                    Commons_JSB2JS.Ocpgm[Commons_JSB2JS.Ocpgm.length] = Commons_JSB2JS.Oc; Commons_JSB2JS.Oc = Space(Commons_JSB2JS.Indent);
                                }

                                L = UBound(Commons_JSB2JS.Ocpgm);
                                Ll = Commons_JSB2JS.Ocpgm[L];
                                if (Ll == '\<!!\>') {
                                    Commons_JSB2JS.Ocpgm.delete(L);
                                    L--;
                                }

                                L++;
                                Commons_JSB2JS.Ocpgm[L] += Commons_JSB2JS.Tkstr;
                                Commons_JSB2JS.Ocpgm[+L + 1] = '\<!!\>';
                                await Tcv(false);
                            }
                        }
                        return;;
                    } else if (!C2) {
                        Commons_JSB2JS.Tkam++;
                        Cmts[Cmts.length] = Commons_JSB2JS.Tkstr;

                        if (Commons_JSB2JS.Tkam > UBound(Commons_JSB2JS.Itemsrc)) {
                            Commons_JSB2JS.Tkstr += Join(Cmts, crlf);
                            break;
                        }

                        Commons_JSB2JS.Tkline = Commons_JSB2JS.Itemsrc[Commons_JSB2JS.Tkam];
                        Commons_JSB2JS.Tkpos = 0;
                        Commons_JSB2JS.Tkstr = '';;
                    } else if (C2 == '\<' && Nc == '%') {
                        await Err2('Nested \<%');
                        Commons_JSB2JS.Tkno = Equates_JSB2JS.C_SM;
                        Commons_JSB2JS.Tkline = '';
                        Commons_JSB2JS.Tkstr = '';
                        Commons_JSB2JS.Otkstr = Commons_JSB2JS.Tkstr;
                        return;
                    }

                    Commons_JSB2JS.Tkpos++;
                }
            }
        } else if (C == '/') {

            // Comments?
            C2 = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1);
            if (C2 == '/') {
                Commons_JSB2JS.Tkpos++;
                Commons_JSB2JS.Tkstr = '//';
                Commons_JSB2JS.Tkno = Equates_JSB2JS.C_DBLSLASH;;
            } else if (C2 == '*') {
                Commons_JSB2JS.Tkpos++;
                Commons_JSB2JS.Tkstr = '/*';


                while (true) {
                    C2 = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1);
                    Commons_JSB2JS.Tkstr += C2;

                    // End at */?
                    if (C2 == '*' && Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos + 1, 1) == '/') {
                        Commons_JSB2JS.Tkstr = Join(Cmts, crlf) + Commons_JSB2JS.Tkstr + '/';
                        Commons_JSB2JS.Tkpos += 2;

                        if (CBool(Inexpression)) {
                            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_CMTBLOCK;
                        } else {
                            Hstr = Commons_JSB2JS.Tkstr;
                            await Tcv(false);
                            Commons_JSB2JS.Tkstr = CStr(Hstr) + Commons_JSB2JS.Tkstr;
                        }
                        return;;
                    } else if (!C2) {
                        Commons_JSB2JS.Tkam++;
                        Cmts[Cmts.length] = Commons_JSB2JS.Tkstr;

                        if (Commons_JSB2JS.Tkam > UBound(Commons_JSB2JS.Itemsrc)) {
                            Commons_JSB2JS.Tkstr += Join(Cmts, crlf);
                            break;
                        }

                        Commons_JSB2JS.Tkline = Commons_JSB2JS.Itemsrc[Commons_JSB2JS.Tkam];
                        Commons_JSB2JS.Tkpos = 0;
                        Commons_JSB2JS.Tkstr = '';
                    }

                    Commons_JSB2JS.Tkpos++;
                }

                if (CBool(Inexpression)) {
                    Commons_JSB2JS.Tkno = Equates_JSB2JS.C_CMTBLOCK;
                } else {
                    Hstr = Commons_JSB2JS.Tkstr;
                    await Tcv(false);
                    Commons_JSB2JS.Tkstr = CStr(Hstr) + Commons_JSB2JS.Tkstr;
                }
            } else {
                Commons_JSB2JS.Tkno = Equates_JSB2JS.C_FSLASH;
            }
        }

        return;
    }

    // CHECK FOR NUMBERS

    if (Index1(' 0123456789', C, 1) > 1) {
        Commons_JSB2JS.Tkpos = Commons_JSB2JS.Tkstartpos;

        do {
            Commons_JSB2JS.Tkpos++;
            C = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1);
        }
        while (Index1(' 0123456789', C, 1) > 1 && C);

        Commons_JSB2JS.Tkstr = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos, Commons_JSB2JS.Tkpos - +Commons_JSB2JS.Tkstartpos);
        Commons_JSB2JS.Tkno = Equates_JSB2JS.C_NUMBER;
        Commons_JSB2JS.Otkstr = Commons_JSB2JS.Tkstr;
        return;
    }

    // MUST BE IDENTIFIER
    Commons_JSB2JS.Tkpos = Commons_JSB2JS.Tkstartpos;

    do {
        Commons_JSB2JS.Tkpos++;
        C = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1);
        if (C == '\<' && Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos + 1, 1) == '%') {

            while (true) {
                C2 = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1);

                // End at */?
                if (C2 == '%' && Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos + 1, 1) == '\>') {
                    Commons_JSB2JS.Tkpos += 2;
                    C = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkpos, 1);
                    break;
                }

                if (!C2) break;

                Commons_JSB2JS.Tkpos++;
            }
        }

    }
    while (Not(Index1('@#*() +-=[]{}":;\<\>|,/' + '\'', C, 1) || !C || C == Commons_JSB2JS.Mobjectdelemeter));

    Commons_JSB2JS.Otkstr = Mid1(Commons_JSB2JS.Tkline, Commons_JSB2JS.Tkstartpos, Commons_JSB2JS.Tkpos - +Commons_JSB2JS.Tkstartpos);
    if (Mid1(Commons_JSB2JS.Otkstr, 1, 1) == '\\') {
        Commons_JSB2JS.Otkstr = Mid1(Commons_JSB2JS.Otkstr, 2);
        Commons_JSB2JS.Tkstr = Commons_JSB2JS.Otkstr;
    } else {
        Commons_JSB2JS.Tkstr = Commons_JSB2JS.Otkstr;
        Commons_JSB2JS.Tkstr = UCase(Commons_JSB2JS.Tkstr);
    }

    Commons_JSB2JS.Tkno = Equates_JSB2JS.C_IDENT;

    switch (true) {
        case Commons_JSB2JS.Tkstr == 'CASE':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_CASE;
            break;

        case Commons_JSB2JS.Tkstr == 'ELSE':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_ELSE;
            break;

        case Commons_JSB2JS.Tkstr == 'END':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_END;
            break;

        case Commons_JSB2JS.Tkstr == 'ENDIF':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_END;
            break;

        case Commons_JSB2JS.Tkstr == 'MOD':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_MOD;
            break;

        case Commons_JSB2JS.Tkstr == 'FROM':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_FROM;
            break;

        case Commons_JSB2JS.Tkstr == 'NEXT':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_NEXT;
            break;

        case Commons_JSB2JS.Tkstr == 'OFF':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_OFF;
            break;

        case Commons_JSB2JS.Tkstr == 'ON':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_ON;
            break;

        case Commons_JSB2JS.Tkstr == 'REPEAT':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_REPEAT;
            break;

        case Commons_JSB2JS.Tkstr == 'THEN':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_THEN;
            break;

        case Commons_JSB2JS.Tkstr == 'TO':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_TO;
            break;

        case Commons_JSB2JS.Tkstr == 'UNTIL':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_UNTIL;
            break;

        case Commons_JSB2JS.Tkstr == 'WHILE':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_WHILE;
            break;

        case Commons_JSB2JS.Tkstr == 'OR':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_OR;
            break;

        case Commons_JSB2JS.Tkstr == 'AND':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_AND;
            break;

        case Commons_JSB2JS.Tkstr == 'MATCH':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_MATCH;
            break;

        case Commons_JSB2JS.Tkstr == 'MATCHES':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_MATCHES;
            break;

        case Commons_JSB2JS.Tkstr == 'CAT':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_CAT;
            break;

        case Commons_JSB2JS.Tkstr == 'LT':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_LT;
            break;

        case Commons_JSB2JS.Tkstr == 'GT':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_GT;
            break;

        case Commons_JSB2JS.Tkstr == 'LE':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_LE;
            break;

        case Commons_JSB2JS.Tkstr == 'NE':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_NE;
            break;

        case Commons_JSB2JS.Tkstr == 'GE':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_GE;
            break;

        case Commons_JSB2JS.Tkstr == 'EQ':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_EQ;
            break;

        case Commons_JSB2JS.Tkstr == 'STEP':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_STEP;
            break;

        case Commons_JSB2JS.Tkstr == 'BEFORE':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_BEFORE;
            break;

        case Commons_JSB2JS.Tkstr == 'SETTING':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_SETTING;
            break;

        case Commons_JSB2JS.Tkstr == 'BY':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_BY;
            break;

        case Commons_JSB2JS.Tkstr == 'LOCKED':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_LOCKED;
            break;

        case Commons_JSB2JS.Tkstr == 'GOTO':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_GOTO;
            break;

        case Commons_JSB2JS.Tkstr == 'GO':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_GOTO;
            break;

        case Commons_JSB2JS.Tkstr == 'GOSUB':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_GOSUB;
            break;

        case Commons_JSB2JS.Tkstr == 'DO':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_DO;
            break;

        case Commons_JSB2JS.Tkstr == 'LOOP':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_LOOP;
            break;

        case Commons_JSB2JS.Tkstr == 'MAT':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_MAT;
            break;

        case Commons_JSB2JS.Tkstr == 'ERROR':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_ERROR;
            break;

        case Commons_JSB2JS.Tkstr == 'IN':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_IN;
            break;

        case Commons_JSB2JS.Tkstr == 'CAPTURING':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_CAPTURING;
            break;

        case Commons_JSB2JS.Tkstr == 'USING':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_USING;
            break;

        case Commons_JSB2JS.Tkstr == 'WITH':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_WITH;
            break;

        case Commons_JSB2JS.Tkstr == 'WHERE':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_WHERE;
            break;

        case Commons_JSB2JS.Tkstr == 'DEFAULT':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_DEFAULT;
            break;

        case Commons_JSB2JS.Tkstr == 'CATCH':
            Commons_JSB2JS.Tkno = Equates_JSB2JS.C_CATCH;
    }
    return;

    // ********************************************************************************************************************
}
// </TCV>