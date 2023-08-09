/* jsblibadb.js */

//
// JSON Basic database library by Randy Walsh
//
const pointerFileName = "jsb_selectlists"
const systemFileName = "system"
const jsbCacheFileName = "jsb_cache"
const libDBFileName = "jsblibdb.js"

if (!window.fileSystemRequestSize) fileSystemRequestSize = 10 * 1024 * 1024 // Request 10MB size (bytes) of space;

// Must be one character definitions
var odbFileSystem = 'F'
var odbTypeHttp = '/'
var odbTypeDotNet = 'H'
var odbLocalStorage = 'S'
var odbJavaScriptInclude = 'C'
var odbHybridStorage = '-'
var odbAttachedDB = 'A'

var attachedOdbDB = null;     // Current attached database
var validOpens = {}           // cache of sucessful odbOpens() by path
var notValidOpens = {}        // cache of unsucessful odbOpens()


// File System Globals
var JSBRootDir = null;        // fsXXX() filesystem: dirEntry result from fsGetDirectory("account_" + LCase(dbName))
var fileSystem = null;        // fsXXX() filesystem: fs result from requestFileSystem()
var fsRootHandle = null;      // fsXXX() filesystem: asyncFSOpen(".") result

// generic odbXXX() routines
var odbPointerFile;           // odbOpen(pointerFileName) result
var fHandleCache = null;      // odbOpen(jsbCacheFileName) result
var fHandleSystem = null;     // odbOpen(systemFileName) result
var odbCurrentDBName = "";    // current attached database
var cachedFileNames = {}      // a json list of valid files that are or can be fetched.  ie: cachedFileNames["filename"] = "httppathToFetch"; // simple path(xx) -> myCacheUrl + "cached_" + xx + ".js"; full path: http://...... .js
var virginIDS = {}            // a JSON list of TableNames with nested ItemNames from cached_jsfile.js scripts
var deletedIDS = {}           // a JSON list of TableNames with nested ItemNames of deleted item names (same format as virginIDS)


// Hybrid globals
var delayedHybridWrite_timer, delayedHybridWrite_tableName, delayedHybridWrite_data, hybridLastSuccessfulWrite_tableName;

var fsCache = {
    maxSize: 100,
    LRU: [],
    cache: {},
    itemAge: {}
}

var hybridCache = {
    maxSize: 10,
    LRU: [],
    cache: {},
    itemAge: {}
}

var dskProtocolAvaliable = validProtoCol('dsk');

function validProtoCol(protoCol) {
    if (protoCol == "ls" && localStorage) return true;
    if (protoCol == "js" && fileSystem) return true;
    if (protoCol == "dsk") {
        if (fileSystem) return true;
    }

    return false
}

const binaryFileList = ['264', '3g2', '3gp', 'asf', 'asx', 'avi', 'bik', 'dash', 'dat', 'dvr', 'flv', 'h264', 'm2t', 'm2ts', 'm4v', 'mkv', 'mod', 'mov', 'mp4', 'mpeg', 'mpg', 'mswmm', 'mts', 'ogv', 'prproj', 'rec', 'rmvb', 'swf', 'tod', 'tp',
    'ts', 'vob', 'webm', 'wmv', '3ga', 'aac', 'aiff', 'amr', 'ape', 'asf', 'asx', 'cda', 'dvf', 'flac', 'gp4', 'gp5', 'gpx', 'logic', 'm4a', 'm4b', 'm4p', 'midi', 'mp3', 'ogg', 'pcm', 'rec', 'snd', 'sng', 'uax', 'wav',
    'wma', 'wpl', 'bmp', 'dib', 'dng', 'dt2', 'emf', 'gif', 'ico', 'icon', 'jpeg', 'jpg', 'pcx', 'pic', 'png', 'psd', 'raw', 'tga', 'thm', 'tif', 'tiff', 'wbmp', 'wdp', 'webp', 'arw', 'cr2', 'crw', 'dcr', 'dng', 'fpx',
    'mrw', 'nef', 'orf', 'ptx', 'raf', 'raw', 'rw2', 'pcd', 'pcs', 'pcf', 'cdr', 'csh', 'drw', 'emz', 'odg', 'pic', 'sda', 'svg', 'swf', 'wmf', 'abr', 'ai', 'ani', 'cdt', 'cpt', 'djvu', 'eps', 'fla', 'icns', 'ico',
    'icon', 'mdi', 'odg', 'pic', 'ps', 'psb', 'psd', 'pzl', 'vsdx', '3d', '3ds', 'c4d', 'dgn', 'dwfx', 'dwg', 'dxf', 'max', 'pro', 'pts', 'skp', 'stl', 'u3d', 'x_t', 'eot', 'otf', 'ttc', 'ttf', 'woff', 'abw', 'aww',
    'chm', 'cnt', 'dbx', 'djvu', 'doc', 'docm', 'docx', 'dot', 'dotm', 'dotx', 'epub', 'gp4', 'gp5', 'ind', 'indd', 'key', 'mht', 'mpp', 'mpt', 'odf', 'ods', 'odt', 'ott', 'oxps', 'pdf', 'pmd', 'pot', 'potx', 'pps', 'ppsx',
    'ppt', 'pptm', 'pptx', 'prn', 'prproj', 'pub', 'pwi', 'rep', 'rtf', 'sdd', 'sdw', 'shs', 'snp', 'sxw', 'tpl', 'vsd', 'wlmp', 'wpd', 'wps', 'wri', 'xps', 'lrc', 'nfo', 'opml', 'pts', 'rep', 'rtf', 'srt', 'azw', 'azw3',
    'cbr', 'cbz', 'epub', 'fb2', 'iba', 'ibooks', 'lit', 'mobi', 'pdf', 'ods', 'sdc', 'sxc', 'xls', 'xlsm', 'xlsx', 'accdb', 'accdt', 'doc', 'docm', 'docx', 'dot', 'dotm', 'dotx', 'mdb', 'mpd', 'mpp', 'mpt', 'one', 'onepkg', 'pot',
    'potx', 'pps', 'ppsx', 'ppt', 'pptm', 'pptx', 'pst', 'pub', 'snp', 'thmx', 'vsd', 'vsdx', 'xls', 'xlsm', 'xlsx', 'cab', 'lng', 'res', 'swf', 'vhd', 'vmx', 'ova', 'ovf', 'pvm', 'vdi', 'vmdk', 'vmem', 'vmwarevm', 'gdoc', 'gsheet',
    'gslides', 'eml', 'flv', 'ashx', 'atom', 'crdownload', 'dlc', 'download', 'dbx', 'eml', 'ldif', 'mht', 'msg', 'pst', 'vcf', 'chm', 'com', 'cpl', 'eml', 'exe', 'inf', 'mdb', 'msi', 'prg', 'reg', 'scr', 'shs', 'bin', 'com', 'cpl',
    'dll', 'drv', 'exe', 'jar', 'ocx', 'pcx', 'scr', 'shs', 'swf', 'sys', 'vxd', 'wmf', '7z', '7zip', 'ace', 'air', 'apk', 'arc', 'arj', 'asec', 'bar', 'bin', 'cab', 'cbr', 'cbz', 'cso', 'deb', 'dlc', 'gz', 'gzip',
    'hqx', 'inv', 'ipa', 'isz', 'jar', 'msu', 'nbh', 'pak', 'rar', 'tar', 'tar.gz', 'tgz', 'uax', 'webarchive']

function isBinaryFile(ItemID) {
    var dotCnt = Count(ItemID, ".")
    if (!dotCnt) return false;
    var Ext = Field(ItemID, ".", dotCnt + 1)
    return LocateAM(Ext, binaryFileList) != -1
}

function isCrlfFile(ItemID) {
    return !isBinaryFile(ItemID)
}

function isTextFile(ItemID) {
    return !isBinaryFile(ItemID)
}

function filterLike(X, L) {
    var fchar = Left(L, 1),
        e = "%";
    X = LCase(X)
    L = LCase(L)


    if (fchar == "%" || fchar == "[") {
        if (fchar == "[") e = "]"
        var lenL = Len(L);
        if (Right(L, 1) == e) return InStrI(X, Mid(L, 1, lenL - 2)) >= 0;
        return Right(X, lenL - 1) == Mid(L, 1)
    }
    var echar = Right(L, 1);
    if (echar == "%" || echar == "]") {
        var lenL = Len(L);
        return Left(X, lenL - 1) == Left(L, lenL - 1)
    }

    return LCase(X) == LCase(L)
}

function activeColumns(sqlWhere, toLowerCase, useAsName) {
    var tokens = Split(sqlWhere, " ", 5)
    tokens.push(Chr(255))

    var results = []
    for (var i = 1; i <= UBound(tokens); i++) {
        var otoken = tokens[i];
        var token = LCase(otoken);
        var ntoken = LCase(tokens[i + 1]);
        switch (true) {
            case token == "order" && ntoken == "by":
                i += 1;
                break

            case token == "as" && (i + 1 <= UBound(tokens)):
                i += 1;
                //results[results.length-1] += " as " + tokens[i];
                if (useAsName) results[results.length - 1] = tokens[i];
                break

            case (token == "bottom" || token == "top") && (i + 1 <= UBound(tokens)):
                i += 1;
                //results.push(token + " " + tokens[i]);
                break

            case token == "or" || token == 'and' || token == 'like' || token == 'notlike' || token == 'gt' || token == 'lt' || token == 'ge' || token == 'le' || token == 'ne' || token == 'eq' || token == 'from' || token == 'where' || token == 'select':
                break

            case Left(token, 2) == "*a":
                if (toLowerCase) results.push(token);
                else results.push(otoken)
                break

            case token == "*": // * represents all columns
                results.push(token);
                break

            case isAlpha(Left(token, 1)) && InStr(token, "(") == -1:
                // get data from dataset row
                if (toLowerCase) results.push(token);
                else results.push(otoken)
                break

            case Left(token, 1) == "[" && Right(token, 1) == "]":
                // get data from dataset row
                otoken = Mid(otoken, 1, Len(otoken) - 2)
                var token = LCase(otoken);

                if (toLowerCase) results.push(token);
                else results.push(otoken)

                break

            case Left(token, 1) == '"' && Right(token, 1) == '"' && (InStr(" =<>!", Left(ntoken, 1) > 0) || ntoken == "like" || ntoken == "notlike"):
                // get data from dataset row
                otoken = Mid(otoken, 1, Len(otoken) - 2)
                var token = LCase(otoken);
                if (toLowerCase) results.push(token);
                else results.push(otoken)
                break
        } // switch
    } // for
    return results
}


// process the selectList based on the where clause, returns an updated selectList
function ijsFilterSelect(selectList, where) {
    var tokens = Split(where, " ", 5)
    tokens.push(Chr(255))

    sortColumns = []
    var jsFilter = []
    sorting = false;
    var gotone = false;

    for (var i = 1; i <= UBound(tokens); i++) {
        var otoken = tokens[i];
        var lcToken = LCase(otoken);

        if (sorting) {
            if (lcToken == ',') {
                gotone = false

            } else if (lcToken == Chr(255)) {

            } else if (gotone && lcToken == 'asc') {
                sortColumns[sortColumns.length - 1] = ">" + sortColumns[sortColumns.length - 1];

            } else if (gotone && lcToken == 'desc') {
                sortColumns[sortColumns.length - 1] = "<" + sortColumns[sortColumns.length - 1];

            } else if (gotone && lcToken == 'numeric') {
                sortColumns[sortColumns.length - 1] = "#" + sortColumns[sortColumns.length - 1];

            } else if (gotone && lcToken == 'right') {
                sortColumns[sortColumns.length - 1] = "!" + sortColumns[sortColumns.length - 1];

            } else {
                if (Left(lcToken, 1) == "[" && Right(lcToken, 1) == "]") otoken = Mid(otoken, 1, Len(otoken) - 2);
                gotone = true
                sortColumns.push(otoken)
            }

        } else {

            var ntoken = LCase(tokens[i + 1]);
            var anum = 0;
            if (Left(lcToken, 2) == "*a") anum = CNum(Mid(lcToken, 2)); else if (Left(lcToken, 2) == "[*a") anum = CNum(Mid(lcToken, 3));

            switch (true) {
                case lcToken == Chr(255):
                    break

                case lcToken == 'where' && i == 1:
                    break;

                case lcToken == "order" && ntoken == "by":
                    sorting = true
                    i++
                    break;

                case lcToken == "gt":
                    jsFilter.push(">");
                    break
                case lcToken == "lt":
                    jsFilter.push("<");
                    break
                case lcToken == "ge":
                    jsFilter.push(">=");
                    break
                case lcToken == "le":
                    jsFilter.push("<=");
                    break
                case lcToken == "eq":
                    jsFilter.push("==");
                    break
                case lcToken == "ne":
                    jsFilter.push("!=");
                    break
                case lcToken == "=":
                    jsFilter.push("==");
                    break
                case lcToken == ">":
                    jsFilter.push(">");
                    break
                case lcToken == "<":
                    jsFilter.push("<");
                    break
                case lcToken == ">=":
                    jsFilter.push(">=");
                    break
                case lcToken == "<=":
                    jsFilter.push("<=");
                    break
                case lcToken == "=>":
                    jsFilter.push(">=");
                    break
                case lcToken == "=<":
                    jsFilter.push("<=");
                    break
                case lcToken == "<>":
                    jsFilter.push("!=");
                    break
                case lcToken == "!=":
                    jsFilter.push("!=");
                    break

                case lcToken == "like":
                    jsFilter.push("filterLike(" + jsFilter.pop() + ", " + tokens[i + 1] + ")");
                    i++;
                    break

                case lcToken == "notlike":
                    jsFilter.push("!filterLike(" + jsFilter.pop() + ", " + tokens[i + 1] + ")");
                    i++;
                    break

                case lcToken == "not" && ntoken == "like":
                    i++
                    jsFilter.push("!filterLike(" + jsFilter.pop() + ", " + tokens[i + 1] + ")");
                    i++;
                    break

                case lcToken == "not":
                    jsFilter.push("!");
                    break

                case lcToken == ":":
                    jsFilter.push(" + '' + ");
                    break

                case lcToken == "&":
                    jsFilter.push(" + '' + ");
                    break

                case lcToken == 'itemid' || lcToken == '[itemid]' || lcToken == '*a0' || lcToken == '[*a0]':
                    jsFilter.push("ItemID");
                    break

                case anum != 0:
                    if (anum == 9997) { // DCount
                        jsFilter.push("DCount(row, am)")

                    } else if (anum == 9998) { // Counter
                        jsFilter.push("i")

                    } else if (anum == 9999) { // Size
                        jsFilter.push("Len(row)") // SelectedItems[i].ItemContent

                    } else {
                        jsFilter.push("LCase(" + "Extract(row," + anum + ",0,0))")
                    }

                    break

                case lcToken == Chr(9):
                    jsFilter.push(" ");
                    break
                case isNumber(lcToken):
                    jsFilter.push(lcToken);
                    break
                case InStr(" +-/^%()", Left(lcToken, 1)) > 0:
                    jsFilter.push(lcToken);
                    break;

                case lcToken == "and":
                    jsFilter.push("&&");
                    break
                case lcToken == "or":
                    jsFilter.push("||");
                    break

                case lcToken == "&&":
                    jsFilter.push("&&");
                    break
                case lcToken == "||":
                    jsFilter.push("||");
                    break

                case lcToken == "abs(":
                    jsFilter.push("Math.abs(");
                    break
                case lcToken == "guid(":
                    jsFilter.push("newGUID(");
                    break
                case lcToken == "seq(":
                    jsFilter.push("Seq(");
                    break
                case lcToken == "asc(":
                    jsFilter.push("Seq(");
                    break
                case lcToken == "isint(":
                    jsFilter.push("IsInt(");
                    break
                case lcToken == "isnull(":
                    jsFilter.push("IsNull(");
                    break
                case lcToken == "isnothing(":
                    jsFilter.push("isNothing(");
                    break
                case lcToken == "chr(":
                    jsFilter.push("Chr(");
                    break
                case lcToken == "char(":
                    jsFilter.push("Chr(");
                    break
                case lcToken == "mid(":
                    jsFilter.push("Mid1(");
                    break
                case lcToken == "left(":
                    jsFilter.push("Left(");
                    break
                case lcToken == "right(":
                    jsFilter.push("Right(");
                    break
                case lcToken == "count(":
                    jsFilter.push("Count(");
                    break
                case lcToken == "cint(":
                    jsFilter.push("CInt(");
                    break
                case lcToken == "clng(":
                    jsFilter.push("CInt(");
                    break
                case lcToken == "cdbl(":
                    jsFilter.push("CNum(");
                    break
                case lcToken == "csng(":
                    jsFilter.push("CNum(");
                    break
                case lcToken == "val(":
                    jsFilter.push("CNum(");
                    break
                case lcToken == "cdec(":
                    jsFilter.push("CNum(");
                    break
                case lcToken == "delete(":
                    jsFilter.push("Delete(");
                    break
                case lcToken == "dcount(":
                    jsFilter.push("DCount(");
                    break
                case lcToken == "extract(":
                    jsFilter.push("Extract(");
                    break
                case lcToken == "hex(":
                    jsFilter.push("DTX(");
                    break
                case lcToken == "exp(":
                    jsFilter.push("Math.exp(");
                    break
                case lcToken == "field(":
                    jsFilter.push("Field(");
                    break
                case lcToken == "index(":
                    jsFilter.push("Index1(");
                    break
                case lcToken == "instr(":
                    jsFilter.push("InStr1(");
                    break
                case lcToken == "len(":
                    jsFilter.push("Len(");
                    break
                case lcToken == "ln(":
                    jsFilter.push("Math.log(");
                    break
                case lcToken == "mcl(":
                    jsFilter.push("LCase(");
                    break
                case lcToken == "lcase(":
                    jsFilter.push("LCase(");
                    break
                case lcToken == "mcu(":
                    jsFilter.push("UCase(");
                    break
                case lcToken == "ucase(":
                    jsFilter.push("UCase(");
                    break
                case lcToken == "lower(":
                    jsFilter.push("Lower(");
                    break
                case lcToken == "raise(":
                    jsFilter.push("raise(");
                    break
                case lcToken == "mod(":
                    jsFilter.push("Mod(");
                    break
                case lcToken == "not(":
                    jsFilter.push("Not(");
                    break
                case lcToken == "pwr(":
                    jsFilter.push("Pwr(");
                    break
                case lcToken == "rem(":
                    jsFilter.push("Mod(");
                    break
                case lcToken == "rnd(":
                    jsFilter.push("Rnd(");
                    break
                case lcToken == "space(":
                    jsFilter.push("Space(");
                    break
                case lcToken == "sqrt(":
                    jsFilter.push("Math.sqrt(");
                    break
                case lcToken == "str(":
                    jsFilter.push("StrRpt(");
                    break
                case lcToken == "strrpt(":
                    jsFilter.push("StrRpt(");
                    break
                case lcToken == "dateserial(":
                    jsFilter.push("makeR83Date(");
                    break
                case lcToken == "timedate(":
                    jsFilter.push("TimeDate(");
                    break
                case lcToken == "datetime(":
                    jsFilter.push("TimeDate(");
                    break
                case lcToken == "trim(":
                    jsFilter.push("Trim(");
                    break
                case lcToken == "ltrim(":
                    jsFilter.push("LTrim(");
                    break
                case lcToken == "trimf(":
                    jsFilter.push("LTrim(");
                    break
                case lcToken == "rtrim(":
                    jsFilter.push("RTrim(");
                    break
                case lcToken == "trimb(":
                    jsFilter.push("RTrim(");
                    break
                case lcToken == "xtd(":
                    jsFilter.push("XTD(");
                    break
                case lcToken == "convert(":
                    jsFilter.push("Convert(");
                    break
                case lcToken == "replace(":
                    jsFilter.push("Change(");
                    break
                case lcToken == "change(":
                    jsFilter.push("Change(");
                    break
                case lcToken == "changei(":
                    jsFilter.push("ChangeI(");
                    break
                case lcToken == "xts(":
                    jsFilter.push("XTS(");
                    break
                case lcToken == "stx(":
                    jsFilter.push("STX(");
                    break
                case lcToken == "encode(":
                    jsFilter.push("aesEncrypt(");
                    break
                case lcToken == "encrypt(":
                    jsFilter.push("aesEncrypt(");
                    break
                case lcToken == "decode(":
                    jsFilter.push("aesDecrypt(");
                    break
                case lcToken == "decrypt(":
                    jsFilter.push("aesDecrypt(");
                    break
                case lcToken == "date(":
                    jsFilter.push("r83Date(");
                    break
                case lcToken == "time(":
                    jsFilter.push("r83Time(");
                    break
                case lcToken == "timer(":
                    jsFilter.push("Timer(");
                    break
                case lcToken == "now(":
                    jsFilter.push("Now(");
                    break
                case lcToken == "dow(":
                    jsFilter.push("DayOfWeek(");
                    break
                case lcToken == "dayofweek(":
                    jsFilter.push("DayOfWeek(");
                    break
                case lcToken == "year(":
                    jsFilter.push("Year(");
                    break
                case lcToken == "month(":
                    jsFilter.push("Month(");
                    break
                case lcToken == "day(":
                    jsFilter.push("Day(");
                    break
                case lcToken == "dmy(":
                    jsFilter.push("DMY(");
                    break
                case lcToken == "cstr(":
                    jsFilter.push("CStr(");
                    break
                case lcToken == "system(":
                    jsFilter.push("System(");
                    break
                case lcToken == "json(":
                    jsFilter.push("parseJSON(");
                    break
                case lcToken == "xml(":
                    jsFilter.push("parseXML(");
                    break
                case lcToken == "htmlencode(":
                    jsFilter.push("htmlEscape(");
                    break
                case lcToken == "htmlescape(":
                    jsFilter.push("htmlEscape(");
                    break
                case lcToken == "htmldecode(":
                    jsFilter.push("htmlUnescape(");
                    break
                case lcToken == "htmlunescape(":
                    jsFilter.push("htmlUnescape(");
                    break
                case lcToken == "urlencode(":
                    jsFilter.push("urlEncode(");
                    break
                case lcToken == "urlescape(":
                    jsFilter.push("urlEncode(");
                    break
                case lcToken == "urldecode(":
                    jsFilter.push("UrlDecode(");
                    break
                case lcToken == "urlunescape(":
                    jsFilter.push("UrlDecode(");
                    break
                case lcToken == "fmt(":
                    jsFilter.push("Fmt(");
                    break
                case lcToken == "typeof(":
                    jsFilter.push("typeOf(");
                    break
                case lcToken == "lbound(":
                    jsFilter.push("LBound(");
                    break
                case lcToken == "ubound(":
                    jsFilter.push("UBound(");
                    break
                case lcToken == "hastag(":
                    jsFilter.push("HasTag(");
                    break
                case lcToken == "regx(":
                    jsFilter.push("regExp(");
                    break
                case lcToken == "regex(":
                    jsFilter.push("regExp(");
                    break
                case lcToken == "regexp(":
                    jsFilter.push("regExp(");
                    break
                case isAlpha(Left(lcToken, 1)):
                    // get data from dataset row
                    jsFilter.push("LCase(" + "row['" + lcToken + "'])")
                    break

                case Left(lcToken, 1) == "[" && Right(lcToken, 1) == "]":
                    // get data from dataset row
                    jsFilter.push("LCase(row['" + Mid(lcToken, 1, Len(otoken) - 2) + "'])")
                    break

                case InStr("'\"", Left(lcToken, 1)) >= 0:
                    // string
                    jsFilter.push(LCase(lcToken));
                    break

                case InStr(" " + Chr(9), Left(lcToken, 1)) >= 0:
                    // white space
                    jsFilter.push(' ');
                    break
            } // switch
        }
    } // for

    // create dynamic function
    jsFilter = Join(jsFilter, ' ')
    if (!jsFilter) return selectList;

    var f = []
    f.push('function iSelectFilter(selectList) { ')
    f.push('    var Items = []; ')
    f.push('    var ItemIDs = []; ')
    f.push('    var SelectedItemIDs = selectList.SelectedItemIDs')
    f.push('    var SelectedItems = selectList.SelectedItems')
    f.push('    for (var  i = 0; i < SelectedItemIDs.length; i++) { ')
    f.push('       var ItemID = SelectedItemIDs[i]; ')
    f.push('       var row = SelectedItems[i]; ')
    f.push('       if (row && row.ItemContent) row = row.ItemContent; ')
    f.push('       row = LCaseJSON(row); ')
    f.push('       if (' + jsFilter + ') { Items.push(SelectedItems[i]); ItemIDs.push(ItemID) } ')
    f.push('    } ')
    f.push('    selectList.SelectI = 0; ')
    f.push('    selectList.SelectedItemIDs = ItemIDs; ')
    f.push('    selectList.SelectedItems = Items; ')
    f.push('    return selectList ')
    f.push('}')
    f = Join(f, crlf);

    try {
        eval(f)

    } catch (err) {
        activeProcess.At_Errors = "I was unable to build iSelectFilter(): Expression: " + jsFilter + crlf + " from : " + where
        showStatus(activeProcess.At_Errors, '', false)
        return selectList;
    }

    var newSelectList = iSelectFilter(selectList);
    if (sorting && newSelectList.SelectedItemIDs.length > 0) {
        var items = [];
        for (var i = LBound(newSelectList.SelectedItems); i < newSelectList.SelectedItems.length; i++) {
            if (!newSelectList.SelectedItems[i]) newSelectList.SelectedItems[i] = {}
            newSelectList.SelectedItems[i]._itemId_ = newSelectList.SelectedItemIDs[i]
        }

        newSelectList.SelectedItems = Sort(newSelectList.SelectedItems, sortColumns)

        for (var i = LBound(newSelectList.SelectedItems); i < newSelectList.SelectedItems.length; i++) {
            newSelectList.SelectedItemIDs[i] = newSelectList.SelectedItems[i]._itemId_
            delete newSelectList.SelectedItems[i]._itemId_
        }
    }

    return newSelectList
}

function LCaseJSON(JsonRec) {
    if (!JsonRec) return {}
    if (!isJSON(JsonRec)) return JsonRec;
    var newRec = {}
    for (var key in JsonRec) {
        newRec[key.toLowerCase()] = JsonRec[key]
    }
    return newRec
}

function getSelText() {
    var txt = '';
    if (window.getSelection) {
        txt = window.getSelection();
    }
    else if (document.getSelection) {
        txt = document.getSelection();
    }
    else if (document.selection) {
        txt = document.selection.createRange().text;
    }
    else return '';
    return txt;
}

// If we switch to another window, possible running this code, we need to invalidate the cache
$(window).focus(function () {
    if (!getSelText()) clearCaches();
})

function clearCaches() {
    hybridCache = {
        maxSize: 100,
        LRU: [],
        cache: {},
        itemAge: {}
    }
    fsCache = {
        maxSize: 100,
        LRU: [],
        cache: {},
        itemAge: {}
    }
    validOpens = {}
    notValidOpens = {}
}

function cacheAdd(theCache, name, msdata) {
    for (var i = 0; i < theCache.LRU.length; i++) {
        if (theCache.LRU[i] == name) {
            theCache.LRU.splice(i, 1);
            break
        }
    }

    theCache.LRU.unshift(name); // add to top 
    theCache.cache[name] = msdata;
    theCache.itemAge[name] = Timer();

    while (theCache.LRU.length > theCache.maxSize) {
        var delName = theCache.LRU[theCache.maxSize];
        theCache.LRU.splice(theCache.maxSize, 1);
        delete theCache.cache[delName];
        delete theCache.itemAge[delName];
    }
}

function cacheFetch(theCache, name) {
    for (var i = 0; i < theCache.LRU.length; i++) {
        if (theCache.LRU[i] == name) {
            theCache.LRU.splice(i, 1); // remove

            var itemAge = theCache.itemAge[name];

            // Less than 3 seconds ok, or never expire if isPhoneGap()
            if ((Timer() - itemAge) < 3000 || isPhoneGap()) {
                theCache.LRU.unshift(name); // Put on TOP
                return theCache.cache[name];
            }

            // Stale cache
            delete theCache.cache[name];
            delete theCache.itemAge[name];
            return null; // Not Found
        }
    }

    // Not found
    return null;
}

function cacheDelete(theCache, name) {
    for (var i = 0; i < theCache.LRU.length; i++) {
        if (theCache.LRU[i] == name) {
            theCache.LRU.splice(i, 1);
            delete theCache.cache[name];
            delete theCache.itemAge[name];
            i--
        }
    }
}

function cacheClearTable(theCache, fHandle) {
    for (var i = 0; i < theCache.LRU.length; i++) {
        if (Left(theCache.LRU[i], fHandle.length) == fHandle) {
            var name = theCache.LRU[i];
            theCache.LRU.splice(i, 1);
            delete theCache.cache[name];
            delete theCache.itemAge[name];
            i--
        }
    }
}

// don't prefix this function with async - it uses Promises
/* async */ function asyncLoadFile(httppath, attributes) {
    return new Promise((resolve, reject) => {
        loadFile(httppath, attributes, function () { resolve(true) }, function (err) {
            activeProcess.At_Errors = "Unable to load " + httppath + "; code: " + (err.message ? err.message : "Error code: " + err.code);
            showStatus(activeProcess.At_Errors, '', true);
            resolve(null)
        })
    });
}

function getFileType(dictData, tableName, setByRefValues) {
    var protocol = "";

    function exit(v) {
        if (setByRefValues) setByRefValues(tableName)
        return v
    }

    dictData = LTrim(RTrim(LCase(dictData)));
    tableName = LTrim(RTrim(tableName));

    var LN = LCase(Left(tableName, 5));
    if (LN == "data " || LN == "dict ") {
        dictData = LCase(Left(LN, 4))
    }

    if (dictData == "data") dictData = "";

    LN = LCase(Left(tableName, 7));
    if (LN == "https:/" || LN == "http://") return odbTypeHttp;

    if (InStr(tableName, ":") >= 0) {
        protocol = LCase(Field(tableName, ":", 1));
        if (validProtoCol(protocol)) tableName = dropLeft(tableName, ":");
    }

    if (protocol == "js" && fileSystem) return odbHybridStorage;

    if (dotNetObj) return odbTypeDotNet

    if (protocol == "ls" && localStorage) return odbLocalStorage;

    if (fileSystem) {
        if (protocol == "dsk" || protocol == "file" || Left(tableName, 1) == "." || Left(tableName, 1) == "/" || Left(tableName, 1) == "\\" || !protocol || dictData == 'dict') return exit(odbFileSystem);
        var lTableName = LCase(tableName)
        if (Left(lTableName, 4) == "jsb_") return exit(odbFileSystem);
        if (lTableName == "tmp" || lTableName == "dblog" || lTableName == "jsb2js" || lTableName == "md" || lTableName == "system") return exit(odbFileSystem);
        return exit(odbHybridStorage);
    }

    if (localStorage) return exit(odbLocalStorage);
    return exit(odbJavaScriptInclude);
}

function jsbFHandleType(fHandle, callBack_newfHandle) {
    var jsbFileType = Left(fHandle, 1);
    if (jsbFileType != odbJavaScriptInclude) return jsbFileType;

    var holdOdbCurrentDBName = odbCurrentDBName
    odbCurrentDBName = ""
    var directoyPath = resolveDirectoryPath(Field(fHandle, am, 2), Field(fHandle, am, 3));
    odbCurrentDBName = holdOdbCurrentDBName

    fHandle = validOpens[directoyPath];
    jsbFileType = Left(fHandle, 1);
    if (!directoyPath || fHandle == odbJavaScriptInclude) return odbJavaScriptInclude;
    callBack_newfHandle(fHandle);
    return jsbFileType
}

function getDirectoryPath(fHandle) {
    var jsbFileType = jsbFHandleType(fHandle, rfHandle => fHandle = rfHandle);
    var sHandle = Mid(LCase(fHandle), 1); // Drop 1st character
    if (jsbFileType == odbHybridStorage || jsbFileType == odbJavaScriptInclude) sHandle = Mid(sHandle, 1);
    if (jsbFileType == odbJavaScriptInclude) sHandle = LTrim(Replace(sHandle, am, " "))
    if (jsbFileType == odbTypeDotNet) sHandle = Field(sHandle, "*", 2);

    if (sHandle.endsWith(".dct")) return sHandle;
    //if (sHandle.endsWith(".dct")) return Left(sHandle, Len(sHandle) - 4) + ".dct";

    var L5 = Left(sHandle, 5);
    var isDict = (L5 == "dict ")
    if (isDict || (L5 == "data ")) sHandle = Mid(sHandle, 5) + iff(isDict, ".dct", "")

    return sHandle;
}

// resolveDirectoryPath(dictData, tableName {, callBackProtocol}):
//   DICT append .dct to returned handle

function resolveDirectoryPath(dictData, tableName, callBackProtocol) {
    if (!dictData) dictData = '';

    if (InStr(tableName, ":") >= 0) {
        var protocol = LCase(Field(tableName, ":", 1));
        if (validProtoCol(protocol)) {
            tableName = dropLeft(tableName, ":");
            protocol = protocol
        }
    }

    if (Left(tableName, 5) == "file:" && dskProtocolAvaliable) {
        protocol = "dsk"
    } else {
        if (dskProtocolAvaliable && ((Left(tableName, 2) == "./" || Left(tableName, 2) == ".\\" || Left(tableName, 1) == "\\" || Left(tableName, 1) == "/") || (dotNetObj && Mid(tableName, 1, 2) == ":\\"))) {
            protocol = "dsk"
        } else {
            tableName = LCase(Trim(tableName))
            if (!dictData) {
                if (Left(tableName, 5) == "data ") {
                    tableName = LTrim(Mid(tableName, 5));
                    dictData = ""
                }
                if (Left(tableName, 5) == "dict ") {
                    tableName = LTrim(Mid(tableName, 5));
                    dictData = "dict"
                }
            }
        }
    }

    if (callBackProtocol) callBackProtocol(protocol);

    var handle = tableName
    var isDict = LCase(dictData) == "dict";
    if (Right(handle, 4) == ".dct") { isDict = true; handle = Left(handle, Len(handle) - 4) }
    if (isDict) handle += ".dct";

    return handle;
}

// ================================================== JSB multiplexed Database ====================================================
// ================================================== JSB multiplexed Database ====================================================
// ================================================== JSB multiplexed Database ====================================================

function phonegapDirectory(dbName) {
    if (isPhoneGap()) {
        dbName = LCase(dbName)
        if (dbName == "pics") return cordova.file.applicationDirectory + "www/pics";
        if (dbName == "js") return cordova.file.applicationDirectory + "www/js";
        if (dbName == "css") return cordova.file.applicationDirectory + "www/css";
        if (dbName == "www") return cordova.file.applicationDirectory + "www";
        if (dbName == "files") return dropRightSlash(cordova.file.dataDirectory);
        if (dbName == "cache") return dropRightSlash(cordova.file.cacheDirectory);
        if (dbName == "sdcard") return "file:///storage/*"
        if (dbName == "app") return dropRightSlash(cordova.file.externalApplicationStorageDirectory); // internal storage
        if (dbName == "sdcardfiles") return "file:///storage/*/Android/data/com.jsonbasic." + LCase(myTitle) + "/files"
        if (dbName == "sdcardcache") return "file:///storage/*/Android/data/com.jsonbasic." + LCase(myTitle) + "/cache"
    }
    return null
}

async function asyncCreateDB(dbName) {
    var attachedType = getFileType("", dbName);
    if (attachedType == odbFileSystem || attachedType == odbHybridStorage) return await asyncFSCreateDB(dbName);

    activeProcess.At_Errors = "Unknown Account Type " + attachedType
    return false;
}

async function asyncDeleteDB(dbName) {

    return await asyncFSDeleteDB(dbName);
}

async function asyncAttach(databaseName, UserName, Password, CreateIt, TimeOutSecs) {
    if (!UserName) UserName = "";
    if (!Password) Password = "";
    if (CreateIt == undefined) CreateIt = false;
    if (!TimeOutSecs) TimeOutSecs = 30;

    var dbName = LCase(Trim(Change(databaseName, "\\", "/")))
    var pgName = phonegapDirectory(dbName)
    if (pgName) dbName = pgName;

    // doing a detach?
    if (dbName == "" || dbName == "\"\"" || dbName == LCase(Trim(At_Account))) {
        if (attachedOdbDB) {
            if (attachedOdbDB == odbTypeDotNet) await asyncDNOAttach("");
            if (attachedOdbDB == odbFileSystem) await asyncFSAttach("");
        }
        attachedOdbDB = null
        odbCurrentDBName = ""
        return true;
    }

    if (!fHandleSystem) {
        if (!await asyncOpen("", systemFileName, function (rfHandle) { fHandleSystem = rfHandle })) {
            showStatus(activeProcess.At_Errors, '', true); // No SYSTEM??!!
            return false;
        }
    }

    // System entry exist?
    var data;
    if (await asyncRead(fHandleSystem, dbName, rdata => data = rdata)) {
        SystemRecord = data;

        var sType = UCase(Field(SystemRecord, am, 1));

        if (sType == "F") {
            attachedOdbDB = getFileType("", ".")
        } else {
            if (sType != "D" && sType != "P" && sType != "D!" && sType != "P!") {
                activeProcess.At_Errors = "Unknown Account (" + dbName + ") Type: " + sType
                showStatus(activeProcess.At_Errors, '', false);
                return false;
            }

            if (!dotNetObj) {
                activeProcess.At_Errors = "Not running with a .Net Ado Object, unable to support Account (" + dbName + ") Type: " + sType
                showStatus(activeProcess.At_Errors, '', false);
                return false;
            }

            // Attempt dotNetObj attach
            var errs = dotNetObj.dnoAttach(dbName, SystemRecord, UserName, Password, CreateIt, TimeOutSecs)
            if (Left(errs, 2) == "**") {
                activeProcess.At_Errors = Mid(errs, 2);
                showStatus(activeProcess.At_Errors, '', false)
                return false;
            }

            attachedOdbDB = odbTypeDotNet
            odbCurrentDBName = dbName + Chr(255);
            return true;
        }
    } else {
        attachedOdbDB = getFileType('', dbName)
    }

    if (attachedOdbDB == odbTypeDotNet) _functionResult = await asyncDNOAttach(dbName); else {
        if (attachedOdbDB == odbFileSystem) _functionResult = await asyncFSAttach(dbName); else {
            activeProcess.At_Errors = "Unable to attach to " + dbName
            return false;
        }
    }

    if (_functionResult) {
        odbCurrentDBName = dbName + Chr(255); // The Chr(255) seperates the dbName in the fHandle
        return true;
    } else {
        attachedOdbDB = null
        return false
    }
}

async function asyncCreateTable(dictData, tableName, callback_fHandle) {
    var jsbFileType, fHandle;

    function exit(v) {
        if (callback_fHandle) callback_fHandle(fHandle)
        return v
    }

    // protocols: idb, ls, js, dsk
    if (!dictData) dictData = '';
    var directoryPath = resolveDirectoryPath(dictData, tableName)

    if (attachedOdbDB) {
        if (validOpens[odbCurrentDBName + directoryPath]) {
            fHandle = validOpens[odbCurrentDBName + directoryPath];
            return exit(true);
        }
    }

    jsbFileType = getFileType(dictData, tableName, _tableName => tableName = _tableName)

    if (validOpens[directoryPath]) {
        fHandle = validOpens[directoryPath];
        var newfType = Left(fHandle, 1);
        if (newfType == jsbFileType) return exit(true);  // Only a successful open if we didn't change file types
    }


    if (jsbFileType == odbHybridStorage) if (!await asyncHybridCreateTable(dictData, tableName, rfHandle => fHandle = rfHandle)) return false;
    if (jsbFileType == odbLocalStorage) if (!await asyncLSCreateTable(dictData, tableName, rfHandle => fHandle = rfHandle)) return false;
    if (jsbFileType == odbTypeDotNet) if (!await asyncDNOCreateTable(dictData, tableName, rfHandle => fHandle = rfHandle)) return false;
    if (jsbFileType == odbFileSystem) if (!await asyncFSCreateTable(dictData, tableName, rfHandle => fHandle = rfHandle)) return false;
    if (jsbFileType == odbTypeHttp) { activeProcess.At_Errors = "CreateTable: invalid fhandle: " + fHandle; return false; }
    if (jsbFileType == odbJavaScriptInclude) { activeProcess.At_Errors = "Read only cache system"; return false; }

    validOpens[directoryPath] = fHandle;
    delete notValidOpens[directoryPath];

    if (InStr(directoryPath, ":") > 0) {
        directoryPath = dropLeft(directoryPath, ":")
        delete notValidOpens[directoryPath];
    }

    return exit(true);
}

async function asyncDeleteTable(fHandle) {
    var jsbFileType = jsbFHandleType(fHandle, rfHandle => fHandle = rfHandle);

    var directoryPath = getDirectoryPath(fHandle);
    delete validOpens[directoryPath];

    if (jsbFileType == odbHybridStorage) return await asyncHybridDeleteTable(fHandle);
    if (jsbFileType == odbLocalStorage) return await asyncLSDeleteTable(fHandle);
    if (jsbFileType == odbTypeDotNet) return await asyncDNODeleteTable(fHandle);
    if (jsbFileType == odbFileSystem) return await asyncFSDeleteTable(fHandle);

    if (jsbFileType == odbJavaScriptInclude) {
        activeProcess.At_Errors = "Read only cache system";
        return false;
    }

    activeProcess.At_Errors = "DeleteTable: invalid fhandle: " + fHandle;
    return false;
}

async function asyncOpen(dictData, tableName, callback_fHandle) {
    var jsbFileType, fHandle;

    // Try the FileSystem to open it if needed
    if (!fileSystem && tryFileSystem) {
        if (!await asyncFSCreateDB(dbName)) {
            tryFileSystem = false;
            doNotUseFileSystem = true;
        }
    }

    // ' Do we have a cached version of this file?'
    // Example cached_md.js
    //
    //   window.cachedFileNames["md"] = "md"; 
    //   window.cached_md = {}
    //   window.cached_md["add"] = "CV" + am + "jsb_tcl" + am + "ADD"
    //   window.cached_md["addx"] = "cv" + am + "jsb_tcl" + am + "addx"
    //      ...
    //
    if (!dictData) dictData = '';
    var directoryPath = resolveDirectoryPath(dictData, tableName);
    if (validOpens[odbCurrentDBName + directoryPath]) {
        fHandle = validOpens[odbCurrentDBName + directoryPath];
        if (callback_fHandle) callback_fHandle(fHandle);
        return true;
    }

    if (validOpens[directoryPath]) {
        fHandle = validOpens[directoryPath];
        if (callback_fHandle) callback_fHandle(fHandle);
        return true;
    }

    if (!odbCurrentDBName && notValidOpens[directoryPath]) {
        activeProcess.At_Errors = notValidOpens[directoryPath]
        return false;
    }

    // Do we have a javascript include item for this table?
    var cacheList = await asyncGetCacheList(directoryPath);
    if (cacheList) {
        // Yes- already have cache of deleted ids loaded?
        if (!window.deletedIDS[directoryPath]) {
            // Cache table open??
            if (!fHandleCache) {
                // Create the cache table 
                if (!await asyncCreateTable("", jsbCacheFileName, function (rfHandle) { fHandleCache = rfHandle })) return false;
            }

            // Read the ItemList From the Cache
            if (!await asyncRead(fHandleCache, "deleted_" + directoryPath, function (rdata) { window.deletedIDS[directoryPath] = Split(rdata, am) })) window.deletedIDS[directoryPath] = []

            // Attempt to open from the filesystem (get 1st priority)
            if (fileSystem) {
                if (await asyncFSOpen(dictData, tableName, rfHandle => fHandle = rfHandle)) {
                    validOpens[directoryPath] = fHandle;
                    if (callback_fHandle) callback_fHandle(fHandle);
                    return true;
                }
            }
        }
    }

    var jsbFileType = getFileType(dictData, tableName, _tableName => tableName = _tableName)
    var successfulOpen = false;
    if (jsbFileType == odbHybridStorage) successfulOpen = await asyncHybridOpen(dictData, tableName, rfHandle => fHandle = rfHandle); else {
        if (jsbFileType == odbLocalStorage) successfulOpen = await asyncLSOpen(dictData, tableName, rfHandle => fHandle = rfHandle); else {
            if (jsbFileType == odbTypeDotNet) successfulOpen = await asyncDNOOpen(dictData, tableName, rfHandle => fHandle = rfHandle); else {
                if (jsbFileType == odbFileSystem) successfulOpen = await asyncFSOpen(dictData, tableName, rfHandle => fHandle = rfHandle); else {
                    if (jsbFileType == odbTypeHttp) successfulOpen = await asyncHTTPOpen(dictData, tableName, rfHandle => fHandle = rfHandle); else {
                        if (jsbFileType != odbJavaScriptInclude) throw "Open: invalid file Type: " + jsbFileType;
                    }
                }
            }
        }
    }

    // local success?
    if (successfulOpen) {
        validOpens[directoryPath] = fHandle;
        if (callback_fHandle) callback_fHandle(fHandle);
        return true;
    }

    // Try attachedDB next, if we have one
    if (attachedOdbDB && odbCurrentDBName) {
        if (attachedOdbDB == odbFileSystem) {
            var holdTtableName = tableName;
            tableName = Left(odbCurrentDBName, Len(odbCurrentDBName) - 1) + "/" + tableName;
        }

        successfulOpen = false;
        if (attachedOdbDB == odbHybridStorage) successfulOpen = await asyncHybridOpen(dictData, tableName, rfHandle => fHandle = rfHandle); else {
            if (attachedOdbDB == odbLocalStorage) successfulOpen = await asyncLSOpen(dictData, tableName, rfHandle => fHandle = rfHandle); else {
                if (attachedOdbDB == odbTypeDotNet) successfulOpen = await asyncDNOOpen(dictData, tableName, rfHandle => fHandle = rfHandle); else {
                    if (attachedOdbDB == odbFileSystem) successfulOpen = await asyncFSOpen(dictData, tableName, rfHandle => fHandle = rfHandle); else {
                        if (attachedOdbDB == odbTypeHttp) successfulOpen = await asyncHTTPOpen(dictData, tableName, rfHandle => fHandle = rfHandle); else {
                            if (attachedOdbDB != odbJavaScriptInclude) throw "Open: invalid file Type: " + attachedOdbDB;
                        }
                    }
                }
            }
        }

        if (attachedOdbDB == odbFileSystem) tableName = holdTtableName;

        // attachedOdbDB success?
        if (successfulOpen) {
            validOpens[directoryPath] = fHandle;
            if (callback_fHandle) callback_fHandle(fHandle);
            return true;
        }
    }

    // hybrid Storage?
    if (jsbFileType != odbHybridStorage && attachedOdbDB != odbHybridStorage && fileSystem) {
        if (await asyncHybridOpen(dictData, tableName, rfHandle => fHandle = rfHandle)) {
            validOpens[directoryPath] = fHandle;
            if (callback_fHandle) callback_fHandle(fHandle);
            return true;
        }
    }

    // odbLocalStorage?
    if (window.localStorage && jsbFileType != odbLocalStorage && attachedOdbDB != odbLocalStorage) {
        if (await asyncLSOpen(dictData, tableName, rfHandle => fHandle = rfHandle)) {
            validOpens[directoryPath] = fHandle;
            if (callback_fHandle) callback_fHandle(fHandle);
            return true;
        }
    }

    // odbFileSystem?
    if (jsbFileType != odbFileSystem && attachedOdbDB != odbFileSystem && fileSystem) {
        if (await asyncFSOpen(dictData, tableName, rfHandle => fHandle = rfHandle)) {
            validOpens[directoryPath] = fHandle;
            if (callback_fHandle) callback_fHandle(fHandle);
            return true;
        }
    }

    // odbTypeDotNet?
    if (jsbFileType != odbTypeDotNet && attachedOdbDB != odbTypeDotNet && dotNetObj) {
        if (await asyncDNOOpen(dictData, tableName, rfHandle => fHandle = rfHandle)) {
            validOpens[directoryPath] = fHandle;
            if (callback_fHandle) callback_fHandle(fHandle);
            return true;
        }
    }

    ////////////////////////////////////////////////////
    // No opens worked
    // Can we open this via a javascript include?
    ////////////////////////////////////////////////////
    if (odbCurrentDBName) {
        var holdCurrentDBName = odbCurrentDBName;
        odbCurrentDBName = ""
        if (await asyncOpen(dictData, tableName, rfHandle => fHandle = rfHandle)) {
            odbCurrentDBName = holdCurrentDBName;
            holdCurrentDBName = "";
            if (callback_fHandle) callback_fHandle(fHandle);
            return true;
        }
        odbCurrentDBName = holdCurrentDBName;
    }

    var cacheList = await asyncGetCacheList(directoryPath);
    if (cacheList) {
        // Give us a deletedIDS list if we don't have one already
        if (!window.deletedIDS[directoryPath]) window.deletedIDS[directoryPath] = [];

        // This will change on a write
        fHandle = odbJavaScriptInclude + am + dictData + am + tableName;
        validOpens[directoryPath] = fHandle;
        if (callback_fHandle) callback_fHandle(fHandle);
        return true;
    }

    // Failed to open
    if (Left(directoryPath, 1) != "/" && Left(directoryPath, 1) != ".") notValidOpens[directoryPath] = activeProcess.At_Errors
    return false;
}

async function asyncReadBlk(fHandle, itemName, offset, length, callback_data) {
    return await asyncRead(fHandle, itemName, "B|" + offset + "|" + length, undefined, callback_data);
}

async function asyncGetCacheList(directoryPath) {
    var httppath = window.cachedFileNames[directoryPath];
    if (httppath == undefined) return undefined;

    var cacheList = window["cached_" + directoryPath];

    if (cacheList == undefined || cacheList.length == 0) {
        // Fetch from server
        if (isString(httppath) && httppath) {
            if (!httppath.endsWith('.js')) httppath = myCacheUrl + 'cached_' + httppath + '.js';
            if (InStr(httppath, "?") == -1) httppath += '?cacheBuster=' + myVersion; else httppath += '&cacheBuster=' + myVersion;

            if (await asyncLoadFile(httppath)) {
                cacheList = window["cached_" + directoryPath];
            } else {
                alert("I has unable to load " + httppath);
                window["cached_" + directoryPath] = {}
                window.virginIDS[directoryPath] = [undefined];
            }
        } else {
            window["cached_" + directoryPath] = {}
            window.virginIDS[directoryPath] = [undefined];
            return {};
        }
    }

    var ItemList = window.virginIDS[directoryPath];
    if (ItemList == undefined) {
        ItemList = [undefined];
        window.virginIDS[directoryPath] = ItemList;

        var deletedList = window.deletedIDS[directoryPath];
        for (var ItemID in cacheList) {
            if (LocateAM(ItemID, deletedList) == -1) ItemList.push(ItemID);
        }
    }

    return cacheList;
}

async function asyncRead(fHandle, itemName, opts, atrno, callback_data) {
    var ItemName = LCase(itemName);
    if (!Trim(ItemName)) {
        activeProcess.At_Errors = "asyncRead: empty item id";
        return false;;
    }

    if (callback_data === undefined) {
        if (isFunction(atrno)) {
            callback_data = atrno;
            atrno = 0;
        } else if (isFunction(opts)) {
            callback_data = opts;
            atrno = 0;
            opts = "";
        } else {
            throw "Missing callback routine in call to asyncRead"
        }
    }

    var successfulRead = false;
    var data;
    var jsbFileType = jsbFHandleType(fHandle, rfHandle => fHandle = rfHandle);
    if (jsbFileType == odbHybridStorage) successfulRead = await asyncHybridRead(fHandle, itemName, opts, atrno, rdata => data = rdata); else
        if (jsbFileType == odbLocalStorage) successfulRead = await asyncLSRead(fHandle, itemName, opts, atrno, rdata => data = rdata); else
            if (jsbFileType == odbTypeDotNet) successfulRead = await asyncDNORead(fHandle, itemName, opts, atrno, rdata => data = rdata); else
                if (jsbFileType == odbFileSystem) successfulRead = await asyncFSRead(fHandle, itemName, opts, atrno, rdata => data = rdata); else
                    if (jsbFileType == odbTypeHttp) successfulRead = await asyncHTTPRead(fHandle, itemName, opts, atrno, rdata => data = rdata); else {
                        if (jsbFileType != odbJavaScriptInclude) {
                            activeProcess.At_Errors = "Read: invalid fhandle: " + fHandle;
                            return false;
                        }

                        // Dealing with a JavaScriptInclude - It's possible that a real file may have been created, so check if the open filetype changed
                        if (await asyncOpen(Field(fHandle, am, 2), Field(fHandle, am, 3), rfHandle => fHandle = rfHandle)) {
                            jsbFileType = jsbFHandleType(fHandle, rfHandle => fHandle = rfHandle);
                            if (jsbFileType != odbJavaScriptInclude) return await asyncRead(fHandle, itemName, opts, atrno, callback_data);
                        }
                    }

    // if we didn't find it, check preloaded javascript includes
    if (!successfulRead) {
        var directoryPath = getDirectoryPath(fHandle);
        var cacheList = await asyncGetCacheList(directoryPath)
        if (cacheList) {
            var ItemList = window.virginIDS[directoryPath];
            var deletedList = window.deletedIDS[directoryPath];
            if (LocateAM(ItemName, deletedList) >= 0) return false;

            // are we network caching this item?
            if (LocateAM(ItemName, ItemList) != -1) {
                var cachedItem = cacheList[ItemName]
                if (cachedItem === undefined) return false;

                if (opts == "XML" || opts == "XMLU") {
                    data = parseXML(cachedItem)

                } else if (opts == "JSON" || opts == "JSONU") {
                    data = parseJSON(cachedItem, false)
                    if (!data) data = { ItemID: ItemName, ItemContent: cachedItem }

                } else if (opts == "V" || opts == "VU") {
                    data = Field(CStr(cachedItem), am, atrno)

                } else {
                    data = CStr(cachedItem)
                }

                if (callback_data) callback_data(data);
                return true;

            }
        }

        // All files, should have values in range 0..255
        if (callback_data) callback_data(data);
        if (!successfulRead) return false;
    }

    /*
       - not sure who needed this, but this needs to be handled else where - maybe for DOS files under dno?
       
        if (!opts.startsWith("B") && isString(data)) {
            data = Change(data, Chr(65535), Chr(255))
            data = Change(data, Chr(65534), Chr(254))
            data = Change(data, Chr(65533), Chr(253))
            data = Change(data, Chr(65532), Chr(252))
    
            // Process crlf files 
            if (isCrlfFile(itemName)) {
                data = Change(data, Chr(239) + Chr(191) + Chr(189), Chr(254))
                data = Change(data, Chr(195) + Chr(190), Chr(254))
                data = Change(data, Chr(13) + Chr(10), Chr(254))
                data = Change(data, Chr(10), Chr(254))
                data = Change(data, Chr(13), Chr(254))
            }
        }
    */

    if (callback_data) callback_data(data);
    return true;
}

async function asyncWrite(data, fHandle, itemName, opts, atrno) {
    var jsbFileType = jsbFHandleType(fHandle, rfHandle => fHandle = rfHandle);
    var ItemName = Trim(LCase(itemName));

    if (!ItemName) {
        activeProcess.At_Errors = "asyncWrite: empty item id";
        return false;
    }

    // If this is cache only, attempt to create the file
    if (jsbFileType == odbJavaScriptInclude) {
        if (!await asyncCreateTable(Field(fHandle, am, 2), Field(fHandle, am, 3), rfHandle => fHandle = rfHandle)) return false;
        jsbFileType = jsbFHandleType(fHandle, rfHandle => fHandle = rfHandle);
        var directoryPath = getDirectoryPath(fHandle);
        if (validOpens[directoryPath]) validOpens[directoryPath] = fHandle;
    }

    if (jsbFileType == odbHybridStorage) return await asyncHybridWrite(data, fHandle, itemName, opts, atrno);
    if (jsbFileType == odbLocalStorage) return await asyncLSWrite(data, fHandle, itemName, opts, atrno);
    if (jsbFileType == odbTypeDotNet) return await asyncDNOWrite(data, fHandle, itemName, opts, atrno);
    if (jsbFileType == odbFileSystem) return await asyncFSWrite(data, fHandle, itemName, opts, atrno);
    if (jsbFileType == odbTypeHttp) return await asyncHTTPWrite(data, fHandle, itemName, opts, atrno);

    activeProcess.At_Errors = "Unable to write cache tables";
    return false;
}

async function asyncDelete(fHandle, itemName) {
    var jsbFileType = jsbFHandleType(fHandle, rfHandle => fHandle = rfHandle);
    var ItemName = Trim(LCase(itemName));

    if (!ItemName) {
        activeProcess.At_Errors = "asyncDelete: empty item id";
        return false;
    }

    var successfulDelete = false;
    if (jsbFileType == odbHybridStorage) successfulDelete = await asyncHybridDelete(fHandle, itemName); else
        if (jsbFileType == odbLocalStorage) successfulDelete = await asyncLSDelete(fHandle, itemName); else
            if (jsbFileType == odbTypeDotNet) successfulDelete = await asyncDNODelete(fHandle, itemName); else
                if (jsbFileType == odbFileSystem) successfulDelete = await asyncFSDelete(fHandle, itemName); else
                    if (jsbFileType == odbTypeHttp) successfulDelete = await asyncHTTPDelete(fHandle, itemName); else
                        if (jsbFileType == odbJavaScriptInclude) successfulDelete = true; else {
                            activeProcess.At_Errors = "Delete: invalid fhandle: " + fHandle;
                            return false;
                        }

    // Remove from cache too
    var directoryPath = getDirectoryPath(fHandle); // sets directoryPath
    var cacheList = await asyncGetCacheList(directoryPath)
    if (cacheList) {
        var ItemList = window.virginIDS[directoryPath];
        if (ItemList) {
            var deletedList = window.deletedIDS[directoryPath];

            // ItemID in the cache?
            var ItemName = LCase(itemName)
            if (LocateAM(ItemName, ItemList) != -1 && LocateAM(ItemName, deletedList) == -1) {
                if (!deletedList) deletedList = [];
                deletedList.push(ItemName);
                successfulDelete = true;
                if (!fHandleCache) {
                    // Create the cache table 
                    if (!await asyncCreateTable("", jsbCacheFileName, function (rfHandle) { fHandleCache = rfHandle })) return false;
                }
                return await asyncWrite(Join(deletedList, am), fHandleCache, "deleted_" + directoryPath);
            }
        }
    }

    return successfulDelete;
}

async function asyncSelect(columns, fHandle, where, callback_selectList) {
    var jsbFileType = jsbFHandleType(fHandle, rfHandle => fHandle = rfHandle);

    if (!where) where = "";
    if (!columns) columns = "";

    // do we have any return columns besides ItemID?
    var returnOnlyTheItemID = true;
    var lcDisplayColumns = activeColumns(Trim(columns), true /* lower case results */);
    var displayColumns = activeColumns(Trim(columns));
    var renamedColumns = activeColumns(Trim(columns), false /* lower case results */, true); // 1:1 with displayColumns
    for (var i = 0; i < lcDisplayColumns.length; i++) {
        var lid = lcDisplayColumns[i];
        if (lid != "itemid" && lid != "*a0") {
            returnOnlyTheItemID = false;
            break
        }
    }

    // Do we have a pre-select?
    if (Left(where, 12) == "ItEmID iN ('" && InStr(where, "') AnD ")) {
        var preSelectedIDs = LCase(Field(Field(where, ")", 1), "(", 2))
        preSelectedIDs = Replace(preSelectedIDs, "','", Chr(0))
        preSelectedIDs = Mid(preSelectedIDs, 1)
        preSelectedIDs = Left(preSelectedIDs, Len(preSelectedIDs) - 1)
        preSelectedIDs = Split(preSelectedIDs, Chr(0))
        where = dropLeft(where, "') AnD ")
    }

    var needRecForFiltering = false;
    var myActiveColumns = activeColumns(Trim(columns + " " + where), false);
    for (var i = 0; i < myActiveColumns.length; i++) {
        var lid = LCase(myActiveColumns[i]);
        if (lid != "itemid" && lid != "*a0") {
            needRecForFiltering = true;
            break
        }
    }

    if (needRecForFiltering && columns == "") columns = "*";

    var sl = new selectList

    startSpinner("Selecting " + fHandle)
    var ts = Timer() // ms

    var successfulSelect = false;
    // fHandle, returnOnlyTheItemID, preSelectedIDs, columns, where, callback_selectList
    if (jsbFileType == odbHybridStorage) successfulSelect = await asyncHybridSelect(fHandle, returnOnlyTheItemID && !needRecForFiltering, preSelectedIDs, columns, where, rselectList => sl = rselectList); else {
        if (jsbFileType == odbLocalStorage) successfulSelect = await asyncLSSelect(fHandle, returnOnlyTheItemID && !needRecForFiltering, preSelectedIDs, columns, where, rselectList => sl = rselectList); else {
            if (jsbFileType == odbTypeDotNet) successfulSelect = await asyncDNOSelect(fHandle, returnOnlyTheItemID && !needRecForFiltering, preSelectedIDs, columns, where, rselectList => sl = rselectList); else {
                if (jsbFileType == odbFileSystem) successfulSelect = await asyncFSSelect(fHandle, returnOnlyTheItemID && !needRecForFiltering, preSelectedIDs, columns, where, rselectList => sl = rselectList); else {
                    if (jsbFileType == odbTypeHttp) successfulSelect = await asyncHTTPSelect(fHandle, returnOnlyTheItemID && !needRecForFiltering, preSelectedIDs, columns, where, rselectList => sl = rselectList); else {
                        if (jsbFileType == odbJavaScriptInclude) {
                            successfulSelect = true;
                        } else {
                            stopSpinner()
                            activeProcess.At_Errors = "Select: invalid fhandle: " + fHandle;
                            return false;
                        }
                    }
                }
            }
        }
    }
    stopSpinner()

    // In the cache?
    var directoryPath = getDirectoryPath(fHandle);
    var cacheList = await asyncGetCacheList(directoryPath)
    if (cacheList) {
        var ItemList = window.virginIDS[directoryPath];

        //  add all virgin items unless they have been deleted
        for (var itemi = LBound(ItemList); itemi <= UBound(ItemList); itemi++) {
            var ItemID = ItemList[itemi];
            if (!ItemID) continue;

            var deletedList = window.deletedIDS[directoryPath];

            // It's already in the list, or has been deleted
            if (LocateAM(ItemID, deletedList) != -1 || LocateAM(ItemID, sl.SelectedItemIDs) != -1) continue;

            if (preSelectedIDs && LocateAM(LCase(ItemID), preSelectedIDs) == -1) continue;

            // Got a cached Item to add
            sl.SelectedItemIDs.push(ItemID)
            var endI = sl.SelectedItemIDs.length - 1

            if (returnOnlyTheItemID && !needRecForFiltering) {
                if (columns) {
                    sl.SelectedItems[endI] = { ItemID: ItemID }
                }
                continue;
            }

            var data;
            if (!await asyncRead(fHandle, ItemID, "", null, rdata => data = rdata)) { stopSpinner(); return false; }

            sl.SelectedItems[endI] = parseSelectRow(ItemID, data)
        }
    }

    var specials = []

    // Get specials used (*a1, *a2, itemid, etc.)
    var ac = activeColumns(columns + ' ' + where, false);
    for (var i = 0; i < ac.length; i++) {
        var lcatrno = LCase(ac[i])
        if (Left(lcatrno, 2) == '*a' || lcatrno == 'itemid') specials.push(ac[i]);
    }

    // dotNetObj already has done filtering and sorting
    if (jsbFileType != odbTypeDotNet && sl.SelectedItemIDs.length) {

        // Make sure data has specials
        if (specials.length) {
            for (var rowi = LBound(sl.SelectedItems); rowi < sl.SelectedItems.length; rowi++) {
                var r, row = sl.SelectedItems[rowi];
                if (!row) {
                    row = {}
                    sl.SelectedItems[rowi] = row;
                }
                var isJSN = isJSON(row.ItemContent);
                if (isJSN) row = row.ItemContent;
                if (row.ItemContent) r = row.ItemContent;
                else r = row;

                isJSN = isJSON(r);
                for (var si = LBound(specials); si < specials.length; si++) {
                    var tag = specials[si];
                    var lcTag = LCase(tag);

                    if (lcTag == '*a9997') { // DCount
                        if (isJSN) row[tag] = UBound(r);
                        else row[tag] = DCount(r, am)

                    } else if (lcTag == '*a9998') { // Counter
                        row[tag] = rowi + 1;

                    } else if (lcTag == '*a9999') { // Size
                        if (isJSN) row[tag] = Len(CStr(r));
                        else row[tag] = Len(r)

                    } else if (lcTag == '*a0' || lcTag == "itemid") {
                        row[tag] = sl.SelectedItemIDs[rowi]

                    } else if (Left(lcTag, 2) == '*a') {
                        var atrNo = Mid(tag, 2);
                        if (isJSN) {
                            var tagName = TagName(r, atrNo);
                            row[tag] = r[tagName]
                        } else {
                            row[tag] = Extract(r, atrNo, 0, 0)
                        }

                    } else if (isJSN) {
                        row[tag] = r[tagName]

                    } else {
                        row[tag] = ""
                    }
                }
            }
        }

        // If no filter (where) skip filter call
        if (where) sl = ijsFilterSelect(sl, where)

        // Remove columns that aren't in the original Select (extras added by where clause)
        var ac = activeColumns(columns, false);

        //  Need to rename tags that have an AS clause
        if (ac.length && !returnOnlyTheItemID) {
            if (!Locate('*', ac, 1, 0, 0, "").success) {
                var hasContent = sl.SelectedItemIDs.length == sl.SelectedItems.length;

                for (var SI = LBound(sl.SelectedItemIDs); SI < sl.SelectedItemIDs.length; SI++) {
                    if (hasContent) var row = sl.SelectedItems[SI];
                    else var row = {}
                    if (row && isJSON(row.ItemContent)) row = row.ItemContent;

                    var newRow = {}
                    for (var i = 0; i < ac.length; i++) {
                        var ColumnName = ac[i];
                        if (LCase(ColumnName) == 'itemid') newRow[ColumnName] = sl.SelectedItemIDs[SI];
                        else newRow[ColumnName] = row[ColumnName]
                    }

                    sl.SelectedItems[SI] = newRow;
                }
            }
        }
    }


    if (returnOnlyTheItemID) {
        // Need only to return ItemID's
        sl.SelectedItems = [];

    } else if (displayColumns != renamedColumns && hasContent) {
        for (var SI = LBound(sl.SelectedItemIDs); SI < sl.SelectedItemIDs.length; SI++) {
            var row = sl.SelectedItems[SI];
            var useContent = row && isJSON(row.ItemContent);
            if (useContent) row = row.ItemContent;

            var newRow = {}
            for (var i = 0; i < displayColumns.length; i++) {
                var ColumnName = displayColumns[i];
                var newColumnName = renamedColumns[i];
                newRow[newColumnName] = row[ColumnName];
            }

            if (useContent) sl.SelectedItems[SI].ItemContent = newRow; else sl.SelectedItems[SI] = newRow;
        }

    }

    stopSpinner()

    callback_selectList(sl);
    return successfulSelect;
}

async function asyncClearTable(fHandle) {
    var jsbFileType = jsbFHandleType(fHandle, rfHandle => fHandle = rfHandle);

    startSpinner("Clearing " + fHandle)
    var successfulSelect = false;
    if (jsbFileType == odbHybridStorage) successfulClear = await asyncHybridClearTable(fHandle); else {
        if (jsbFileType == odbLocalStorage) successfulClear = await asyncLSClearTable(fHandle); else {
            if (jsbFileType == odbTypeDotNet) successfulClear = await asyncDNOClearTable(fHandle); else {
                if (jsbFileType == odbFileSystem) successfulClear = await asyncFSClearTable(fHandle); else {
                    if (jsbFileType == odbJavaScriptInclude) {
                        successfulClear = true;
                    } else {
                        stopSpinner()
                        activeProcess.At_Errors = "ClearTable: invalid fhandle: " + fHandle;
                        return false;
                    }
                }
            }
        }
    }

    // In Cache? 
    var directoryPath = getDirectoryPath(fHandle);
    var ItemList = window.virginIDS[directoryPath]; // window['deleted_IDS_' + directoryPath]
    if (!ItemList) {
        stopSpinner()
        return true;
    }

    window.deletedIDS[directoryPath] = ItemList;
    stopSpinner()


    // Remove from jsb_cache too
    if (!fHandleCache) {
        // Create the cache table 
        if (!await asyncCreateTable("", jsbCacheFileName, function (rfHandle) { fHandleCache = rfHandle })) return false;
    }
    if (!await asyncWrite(Join(ItemList, am), fHandleCache, "deleted_" + directoryPath)) alert('cache clear failure on ' + fHandle);

    return successfulClear;
}

async function asyncListFiles(callback_fileList) { // callback_fileList(fileList)
    var fileSysBasePath = "";
    var totalFileList = []

    function addFileList(fileList) {
        if (!isArray(fileList)) fileList = Split(fileList, am)
        for (var i = 1; i < fileList.length; i++) {
            var itemID = fileList[i];
            if (Right(itemID, 4) != ".dct") {
                if (LocateAM(itemID, totalFileList) == -1) totalFileList.push(itemID);
            }
        }
    }

    if (odbCurrentDBName && attachedOdbDB == odbFileSystem) {
        fileSysBasePath = Left(odbCurrentDBName, Len(odbCurrentDBName) - 1)
        jsbFileType = attachedOdbDB
    } else {
        if (attachedOdbDB) jsbFileType = attachedOdbDB; else jsbFileType = getFileType({})
    }

    if (jsbFileType == odbHybridStorage) await asyncHybridListFiles(fileList => addFileList(fileList)); else {
        if (jsbFileType == odbLocalStorage) await asyncLSListFiles(fileList => addFileList(fileList)); else {
            if (jsbFileType == odbTypeDotNet) await asyncDNOListFiles(fileList => addFileList(fileList)); else {
                if (jsbFileType == odbFileSystem) await asyncFSListFiles(fileSysBasePath, fileList => addFileList(fileList));
            }
        }
    }

    // hybrid Storage?
    if (jsbFileType != odbHybridStorage && attachedOdbDB != odbHybridStorage && fileSystem) await asyncHybridListFiles(fileList => addFileList(fileList));


    // odbTypeDotNet?
    if (jsbFileType != odbTypeDotNet && attachedOdbDB != odbTypeDotNet && dotNetObj) {
        await asyncDNOListFiles(fileList => addFileList(fileList));
    }

    // odbLocalStorage?
    if (window.localStorage && jsbFileType != odbLocalStorage && attachedOdbDB != odbLocalStorage) {
        await asyncLSListFiles(fileList => addFileList(fileList));
    }

    // odbFileSystem?
    if (jsbFileType != odbFileSystem && attachedOdbDB != odbFileSystem && fileSystem) {
        await asyncFSListFiles("", fileList => addFileList(fileList));
    }

    // Add cached files
    var cf = window.cachedFileNames;
    for (var key in cf) {
        if (!key.endsWith(".dct")) {
            if (isString(cf[key]) && LocateAM(key, totalFileList) == -1) totalFileList.push(key);
        }
    }

    callback_fileList(totalFileList)
    return true;
}

// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// ***********************************************************   SELECT LISTS   *****************************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************

async function asyncSaveList(sl, itemName) {
    if (!odbPointerFile) {
        if (!await asyncCreateTable("", pointerFileName, rfHandle => odbPointerFile = rfHandle)) return false;
    }

    if (!await asyncWrite(CStr(sl), odbPointerFile, itemName)) return false;
    clearSelect(sl)

    return true;
}

async function asyncGetList(itemName, callBack_SelectList) {
    if (!odbPointerFile) {
        if (!await asyncCreateTable("", pointerFileName, rfHandle => odbPointerFile = rfHandle)) return false;
    }

    var data;
    if (!await asyncRead(odbPointerFile, itemName, rdata => data = rdata)) return false;

    callBack_SelectList(formList(data));
    return true;
}

async function asyncDeleteList(sl, itemName) {
    if (!odbPointerFile) {
        if (!await asyncCreateTable("", pointerFileName, rfHandle => odbPointerFile = rfHandle)) return false;
    }

    return await asyncDelete(odbPointerFile, itemName);
}


// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// *****************************************************  LOCAL STORAGE DATABASE ROUTINES   ***************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
if (!window.localStorage) {
    window.localStorage = {
        length: 0,
        storage: {},
        keys: [],
        getItem: function (id) {
            return this.storage[id]
        },
        setItem: function (id, data) {
            this.storage[id] = data;
            if (this.keys.indexOf(id) != -1) return;
            this.keys.push(id);
            this.length = this.keys.length
        },
        removeItem: function (id) {
            delete this.storage[id];
            delete this.keys[id];
            length = this.keys.length
        },
        key: function (idx) {
            return this.keys[idx]
        }
    }
}

async function asyncLSCreateTable(dictData, tableName, callback_fHandle) {
    var directoryPath = resolveDirectoryPath(dictData, tableName);
    fHandle = odbLocalStorage + directoryPath;

    if (!getObjectFromLocalStorage(directoryPath)) {
        try {
            saveObjectInLocalStorage(directoryPath, "localFile");
        } catch (err) {
            activeProcess.At_Errors = err2String(err);
            showStatus(activeProcess.At_Errors, '', false)
            return false;
        }
    }

    if (callback_fHandle) callback_fHandle(fHandle);
    return true;
}

async function asyncLSDeleteTable(fHandle) {
    activeProcess.At_Errors = ""
    var directoryPath = Mid(fHandle, 1)

    if (!getObjectFromLocalStorage(directoryPath)) {
        Errors = "File not found: " + directoryPath;
        return false;
    }

    try {
        removeObjectFromLocalStorage(directoryPath);
    } catch (err) {
        activeProcess.At_Errors = err2String(err);
        showStatus(activeProcess.At_Errors, '', false)
        return false;
    }

    return true;
}

async function asyncLSOpen(dictData, tableName, callback_fHandle) {
    activeProcess.At_Errors = ""

    var directoryPath = resolveDirectoryPath(dictData, tableName);
    fHandle = odbLocalStorage + directoryPath;

    if (!getObjectFromLocalStorage(directoryPath)) {
        activeProcess.At_Errors = "File not found: " + LTrim(dictData + " ") + tableName + " (" + directoryPath + ")"
        return false;
    }

    if (callback_fHandle) callback_fHandle(fHandle);
    return true;
}

async function asyncLSReadBlk(fHandle, itemName, offset, length, callback_data) {
    opts = "B|" + offset + "|" + length;
    return await asyncLSRead(fHandle, itemName, "B|" + offset + "|" + length, undefined, callback_data);
}

async function asyncLSRead(fHandle, itemName, opts, atrno, callback_data) {
    var handle = fHandle + sm + LCase(Trim(itemName));
    var data = getObjectFromLocalStorage(handle);

    if (data == null) {
        activeProcess.At_Errors = "Item not found '" + Mid(fHandle, 1) + ' ' + itemName + "'"
        return false;
    }

    try {
        if (opts == "XML" || opts == "XMLU") {
            data = parseXML(CStr(data))

        } else if (opts == "JSON" || opts == "JSONU") {
            var jsonData = parseJSON(data, false)
            if (jsonData) {
                data = jsonData
            } else {
                data = { ItemID: itemName, ItemContent: data }
            }

        } else if (opts == "V" || opts == "VU") {
            data = Field(CStr(data), am, atrno)

        } else {
            data = CStr(data)
        }

        callback_data(data);
        return true;

    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
        return false;
    }
}

async function asyncLSWrite(data, fHandle, itemName, opts, atrno) {
    if (!opts) opts = "";

    if (opts == "XML" || opts == "XMLU" || isXML(data)) {
        data = xml2string(data)

    } else if (opts == "JSON" || opts == "JSONU" || isJSON(data)) {
        data = json2string(data)

    } else if (opts == "V" || opts == "VU") {
        var DataRecord = getObjectFromLocalStorage(lsItemPath);
        if (DataRecord == null) DataRecord = "";
        DataRecord = Replace(DataRecord, atrno, 0, 0, CStr(data))
    } else {
        data = CStr(data);
    }

    try {
        var lsItemPath = fHandle + sm + LCase(Trim(itemName));
        saveObjectInLocalStorage(lsItemPath, data);
        return true;

    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
        return false;
    }
}


// Returns:
//     - true or false; if false then activeProcess.At_Errors set (expect for not found error)
//
async function asyncLSDelete(fHandle, itemName) {
    var ItemName = LCase(Trim(itemName));
    var lsItemPath = fHandle + sm + LCase(Trim(itemName));
    removeObjectFromLocalStorage(lsItemPath);
    return true;
}

//
// Returns:
//  - true or false  - activeProcess.At_Errors also set
// 
async function asyncLSSelect(fHandle, returnOnlyTheItemID, preSelectedIDs, columns, where, callback_selectList) {
    var lsItemPath = fHandle + sm;
    var handleLen = Len(lsItemPath);

    var sl = new selectList

    // list of PK's
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (Left(key, handleLen) == lsItemPath) {
            var ItemID = dropLeft(key, sm)

            if (!preSelectedIDs || LocateAM(LCase(ItemID), preSelectedIDs) != -1) {
                sl.SelectedItemIDs.push(ItemID)

                if (returnOnlyTheItemID) {
                    if (columns) {
                        sl.SelectedItems[sl.SelectedItemIDs.length - 1] = {
                            ItemID: ItemID
                        }
                    }
                } else {
                    var record = parseSelectRow(ItemID, getObjectFromLocalStorage(key))
                    sl.SelectedItems[sl.SelectedItemIDs.length - 1] = record
                }
            }
        }
    }

    callback_selectList(sl);
    return true;
}

function parseSelectRow(ItemID, s) {
    if (typeof s != "string") return s; // This happens with a hybrid record
    if (!s) return { ItemID: ItemID, ItemContent: s }

    return parseJSON(s, {
        ItemID: ItemID,
        ItemContent: s
    })
}

// success = await asyncLSClearTable(); // delete an item from the database
//
// Returns:
//  - true or false  - activeProcess.At_Errors also set
//
async function asyncLSClearTable(fHandle) {
    var lsItemPath = fHandle + sm;
    var handleLen = Len(lsItemPath);

    for (var i = 0; i < localStorage.length;) {
        var key = localStorage.key(i);
        if (Left(key, handleLen) == lsItemPath) removeObjectFromLocalStorage(key);
        else i++;
    }

    return true;
}

async function asyncLSListFiles(callback_fileList) {
    var fileList = []
    var prefix = ""
    if (window.fileSystem) prefix = "ls:"

    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (Right(key, 4) != ".dct" && InStr(key, sm) == -1 && getObjectFromLocalStorage(key) == "localFile") fileList.push(prefix + key);
    }

    callback_fileList(fileList);
    activeProcess.At_Errors = ""
    return true;
}

// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// *****************************************************  .NETOBJ DATABASE ROUTINES   ***********************************************************
// *****************************************************  Used by jsbWinForms.exe     ***********************************************************
// *****************************************************    (Chromium Version)        ***********************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
/*
    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////     Available functions from window.dotNetObj       ///////////////
    /////////     This list can be seen by calling window.dotNetObj.dnoFunctions() /////
    ////////////////////////////////////////////////////////////////////////////////////

    // Leave rootDir blank to default to dnoMapRootPath("")
    Public async function asyncDNOInit(ByVal rootDir As String, ByVal dbName As String) As String
    Public async function asyncDNOValidPath(ByVal Path As String) As Boolean
    Public async function asyncDNOFileExists(ByVal FilePath As String) As Boolean
    Public async function asyncDNOMachineName() As String
    Public async function asyncDNOLocalApplicationData() As String
    Public async function asyncDNOApplicationPath() As String
    Public async function asyncDNOOSVersion() As String
    Public async function asyncDNOOSFullName() As String
    Public async function asyncDNOUserName() As String
    Public async function asyncDNOHtaVersion() As String
    Public Function usersEmailAddress() As String

     Public async function asyncDNOSystem(ByVal X As Integer) As String
     // 13: new GUID
     // 19: myDBConnection.dbAttachedDBName
     // 26: Environment.CurrentDirectory
     // 40: physicalApplicationPath()
     // 41: Environment.OSVersion.ToString()
     // 42: My.Computer.Info.OSFullName
     // 43: Environment.UserName
     // 44: dnoIs64BitOperatingSystem()
     // 45: Same as dnoSystemDirectory()
     // 46: dnoUserDomainName()
     // 47: dnoSerialNumber()
     // 48: Same as dnoApplicationDirectory()
     // 49: Return Application logs
     // 53: allowAllDosReads
     // 55: allowAllDosWrites
     // 59: My.Application.Log.DefaultFileLogWriter.FullLogFileName

    async function asyncDNOIs64BitOperatingSystem() As String
    Public async function asyncDNOApplicationDirectory() As String
    Public async function asyncDNOSystemDirectory() As String
    Public async function asyncDNOUserDomainName() As String
    Public async function asyncDNOSerialNumber() As String
    async function asyncDNOWindowsAdmin() As String
    Public async function asyncDNOMapPath(ByVal relPath As String) As String
    Public async function asyncDNOMapRootPath(ByVal relPath As String) As String
    Public async function asyncDNOMapRootAccount(ByVal AccountName As String) As String
    Public async function asyncDNOBrowseForFile(ByVal Title As String, ByVal InitialDirectory As String, ByVal Filter As String) As String
    Public async function asyncDNOSendMailMessage(ByVal Host As String, ByVal Port As Integer, ByVal SSL As String, ByVal networkID As String, ByVal networkPassword As String, ByVal pFrom As String, ByVal fromName As String, ByVal pTo As String, ByVal pCC As String, ByVal pBCC As String, ByVal pSubject As String, ByVal pBody As String) As String
    Public async function asyncDNOCopyFromClipboard() As String
    Public async function asyncDNOExecuteDOS(ByVal Command As String) As String
    Public async function asyncDNOStartExe(ByVal commandline As String) As String
    Public async function asyncDNOAccountName() As String
    Public async function asyncDNOStartDoc(ByVal doc As String, ByVal Args As String) As String
    Public async function asyncDNOGetCommandLineArgs() As String
    Public async function asyncDNOTimeDate() As String
    Public async function asyncDNOGetDrives() As String

    ////////////////////////////////////////////////////////////////////////////////////
    ///////////  Everything from here is really an interface to adoObjects /////////////
    ////////////////////////////////////////////////////////////////////////////////////

    Public async function asyncDNOAttach(ByVal AccountName As String, ByVal ConnectionItem As String, ByVal UserID As String, ByVal Password As String, ByVal CreateIt As Boolean, ByVal TimeOutSecs As Integer) As String
    Public async function asyncDNOClearCachedTables() As String
    Public async function asyncDNOGetDDL(ByVal TableHandle As String) As String
    Public async function asyncDNOOpen(ByVal DictData As String, ByVal TableName As String) As String
    Public async function asyncDNOTypeOfFile(ByVal TableHandle As String) As String
    Public async function asyncDNODosFilePath(ByVal TableHandle As String) As String
    Public async function asyncDNODeleteFile(ByVal TableHandle As String) As String
    Public async function asyncDNOListFiles() As String
    async function asyncDNOGetList(ByVal ListName As String) As String
    async function asyncDNOSaveList(ByVal list As String, ByVal ListName As String) As String
    Public async function asyncDNOCreateFile(ByVal DictData As String, ByVal TableName As String) As String
    Public async function asyncDNORead(ByVal TableHandle As String, ByVal ItemID As String, ByVal Opts As String, ByVal AtrNo As Integer) As String
    Public async function asyncDNOClearFile(ByVal TableHandle As String) As String
    Public async function asyncDNOWrite(ByVal Item As String, ByVal TableHandle As String, ByVal ItemID As String, ByVal Opts As String, ByVal Atrno As Integer) As String
    Public async function asyncDNODelete(ByVal TableHandle As String, ByVal ItemID As String) As String
    Public async function asyncDNOSelectVX(ByVal ColumnList As String, ByVal TableHandle As String, ByVal WhereClause As String) As String
    async function asyncDNOClearCookies(Optional ByVal firstTime As Boolean = False) As String
    Public async function asyncDNOSetCookie(ByVal name As String, ByVal value As String)
    Public async function asyncDNOGetCookie(ByVal name As String, ByVal optionalvalue As String)
    Public async function asyncDNODeleteCookie(ByVal name As String)
    Public Function dbSqlSelect(ByVal SQLCommand As String) As String
    Public Function dbSqlScalar(ByVal SQLCommand As String) As String
*/

function initDotNetAdo(dbName, isLogTo) {
    if (!dbName && inIframe() && window.top.dotNetObj) dbName = window.top.dotNetObj.dnoAccountName();
    if (!dbName) dbName = window.dbName;

    try {
        var errs = dotNetObj.dnoInit(dotNetObj.dnoMapRootPath(""), dbName, isLogTo);
        if (Left(errs, 2) == "**") {
            activeProcess.At_Errors = Mid(errs, 2);
            showStatus(activeProcess.At_Errors, '', false)
            return false
        }
    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
        return false
    }

    //document.title = dbName;
    At_Account = dbName;
    return true
}

async function asyncDNOAttach(databaseName, UserName, Password, CreateIt, TimeOutSecs, SystemRecord) {
    if (!TimeOutSecs) TimeOutSecs = 30;

    try {
        var errs = dotNetObj.dnoAttach(databaseName, SystemRecord, UserName, Password, CreateIt, TimeOutSecs)
        if (Left(errs, 2) == "**") {
            activeProcess.At_Errors = Mid(errs, 2);
            showStatus(activeProcess.At_Errors, '', false)
            return false;
        }
    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
        return false;
    }
    return true;
}

// success = await asyncDNOCreateTable(dictData, tableName, callback_fHandle); 
//
// Returns:
//   - true or false  - activeProcess.At_Errors also set
//   callback_fHandle: fHandle
//
async function asyncDNOCreateTable(dictData, tableName, callback_fHandle) {
    var adofHandle = dotNetObj.dnoCreateFile(dictData, tableName)
    if (Left(adofHandle, 2) == "**") {
        activeProcess.At_Errors = Mid(adofHandle, 2);
        showStatus(activeProcess.At_Errors, '', false)
        return false;
    }
    if (callback_fHandle) callback_fHandle(odbTypeDotNet + adofHandle);
    return true;
}

// success = await asyncDNODeleteTable(fHandle); // delete an item from the database
//
// Returns:
//   - true or false  - activeProcess.At_Errors also set
//  
async function asyncDNODeleteTable(fHandle) {
    try {
        var errs = dotNetObj.dnoDeleteFile(Mid(fHandle, 1))
        if (Left(errs, 2) == "**") {
            activeProcess.At_Errors = Mid(adofHandle, 2);
            showStatus(activeProcess.At_Errors, '', false)
            return false;
        }
    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
        return false;
    }
    activeProcess.At_Errors = ""
    return true;
}

// success = await asyncDNOOpen(); 
//
// Returns:
//   - true or false  - activeProcess.At_Errors also set
//   callback_fHandle: fHandle
//
async function asyncDNOOpen(dictData, tableName, callback_fHandle) {
    if (!dictData) dictData = '';

    var TableName = tableName;
    if (Left(TableName, 5) == "file:") TableName = Replace(TableName, "/", "\\");
    if (Left(TableName, 8) == "file:\\\\\\") TableName = Mid(TableName, 8); // drop "file:\\\"

    var adofHandle = dotNetObj.dnoOpen(dictData, TableName)
    if (Left(adofHandle, 2) == "**") {
        activeProcess.At_Errors = Mid(adofHandle, 2);
        if (doDebug) consoleLog("Failed open of " + LTrim(LCase(dictData + " ")) + tableName + ": " + activeProcess.At_Errors)
        return false;
    }

    fHandle = odbTypeDotNet + adofHandle;
    if (callback_fHandle) callback_fHandle(fHandle);
    return true;
}

// success = await asyncDNOReadBlk(fHandle, itemName, offset, length, callback_data)
//
// Returns:
//   - true or false  - activeProcess.At_Errors also set

async function asyncDNOReadBlk(fHandle, itemName, offset, length, callback_data) {
    return await asyncDNORead(fHandle, itemName, "B|" + offset + "|" + length, undefined, callback_data);
}

// success = await asyncDNORead(fHandle, itemName, opts, atrno, callback_data);
//
// Returns:
//   - true or false  - activeProcess.At_Errors also set

async function asyncDNORead(fHandle, itemName, opts, atrno, callback_data) {
    var ItemName = Trim(LCase(itemName))

    try {
        var DataRecord;
        if (opts.startsWith("B")) {
            var offset = Field(opts, "|", 2);
            var length = Field(opts, "|", 3);
            DataRecord = dotNetObj.dnoReadBlk(Mid(fHandle, 1), itemName, CStr(offset), CInt(length))
        } else {
            DataRecord = dotNetObj.dnoRead(Mid(fHandle, 1), itemName, opts, atrno)
        }
        if (Left(DataRecord, 2) == "**") {
            activeProcess.At_Errors = Mid(DataRecord, 2);
            showStatus(activeProcess.At_Errors, '', false)
            return false;
        }

        if (DataRecord == null) return false;
        DataRecord = XTS(DataRecord)

        if (opts == "XML" || opts == "XMLU") {
            DataRecord = parseXML(DataRecord)

        } else if (opts == "JSON" || opts == "JSONU") {
            var validJson = parseJSON(DataRecord, false)
            if (validJson) DataRecord = validJson; else DataRecord = { ItemID: itemName, ItemContent: DataRecord }
        }

        callback_data(DataRecord);
        return true;

    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
        return false;
    }
}

// success = await asyncDNOWrite(data, fHandle, itemName, opts, atrno); 
//
// Returns:
//  - true or false  - activeProcess.At_Errors also set
//
async function asyncDNOWrite(data, fHandle, itemName, opts, atrno) {
    if (!opts) opts = "";

    var writeBlk = opts.startsWith("B")

    if (opts == "XML" || opts == "XMLU" || isXML(data)) {
        data = xml2string(data)

    } else if (opts == "JSON" || opts == "JSONU" || isJSON(data)) {
        data = json2string(data)

    } else {
        data = CStr(data)
    }

    try {
        var errs;

        if (writeBlk) {
            var offset = Field(opts, "|", 2);
            var length = Field(opts, "|", 3);
            errs = dotNetObj.dnoWriteBlk(STX(data), Mid(fHandle, 1), itemName, CStr(offset))
        } else {
            errs = dotNetObj.dnoWrite(STX(data), Mid(fHandle, 1), itemName, opts, atrno)
        }

        if (Left(errs, 2) == "**") {
            activeProcess.At_Errors = Mid(errs, 2);
            showStatus(activeProcess.At_Errors, '', false)
            return false;
        }

        activeProcess.At_Errors = ""
        return true;

    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
        return false;
    }
}

// success = await asyncDNODelete(fHandle, itemName); // delete an item from the database
//
// Returns:
//     - true or false; if false then activeProcess.At_Errors set (expect for not found error)
//
async function asyncDNODelete(fHandle, itemName) {
    var ItemName = Trim(LCase(itemName))

    try {
        var errs = dotNetObj.dnoDelete(Mid(fHandle, 1), itemName)
        if (Left(errs, 2) == "**") {
            activeProcess.At_Errors = Mid(errs, 2);
            showStatus(activeProcess.At_Errors, '', false)
            return false;
        }

        return true;
    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
        return false;
    }
}

// success = await asyncDNOSelect(fHandle, returnOnlyTheItemID, preSelectedIDs,  columns, where, callback_selectList); // delete an item from the database
//
// Returns:
//  - true or false  - activeProcess.At_Errors also set
// 
async function asyncDNOSelect(fHandle, returnOnlyTheItemID, preSelectedIDs, columns, where, callback_selectList) {
    var sl = new selectList

    try {
        var s = dotNetObj.dnoSelectVX(columns, Mid(fHandle, 1), where)
        if (Left(s, 2) == "**") {
            activeProcess.At_Errors = Mid(s, 2);
            showStatus(activeProcess.At_Errors, '', false)
            return false;
        }

        var Cols = LCase(columns);
        var OnlyIDs = Field(Cols, ' ', 1);
        if (OnlyIDs == 'bottom ' || OnlyIDs == 'top ') Cols = Field(Cols, ' ', 3)
        OnlyIDs = Cols == ''

        if (OnlyIDs || Left(s, 1) != '[' || Right(s, 1) != ']') {
            // list of PK's
            if (s) {
                if (preSelectedIDs) {
                    var SelectedItemIDs = CStr(s).split(am)
                    var filteredIDs = [];
                    var UB = UBound(SelectedItemIDs);
                    for (var j = LBound(SelectedItemIDs); j <= UB; j++) {
                        var ItemID = SelectedItemIDs[j];
                        if (LocateAM(LCase(ItemID), preSelectedIDs) != -1) filteredIDs.push(ItemID);
                    }
                    sl.SelectedItemIDs = filteredIDs
                } else {
                    sl.SelectedItemIDs = CStr(s).split(am)
                }
            }

        } else {
            var ItemList = parseJSON(s);
            if (Len(ItemList)) {
                // We have an array, does it have ItemID as a field?
                var rec = ItemList[LBound(ItemList)];
                var keyID = "ItemID"
                if (!rec.ItemID) {
                    keyID = dotNetObj.dnoPrimaryKeyColumnName(Mid(fHandle, 1))
                    if (Left(keyID, 2) == "**") {
                        activeProcess.At_Errors = Mid(keyID, 2);
                        showStatus(activeProcess.At_Errors, '', false)
                        return false;
                    }
                }

                var UB = UBound(ItemList);
                for (var j = LBound(ItemList); j <= UB; j++) {
                    var rec = ItemList[j];
                    var ItemID = rec[keyID];

                    if (rec && (!preSelectedIDs || LocateAM(LCase(ItemID), preSelectedIDs) != -1)) {
                        sl.SelectedItemIDs.push(ItemID)

                        if (rec.ItemContent)
                            sl.SelectedItems[sl.SelectedItemIDs.length - 1] = parseSelectRow(ItemID, rec.ItemContent);
                        else
                            sl.SelectedItems[sl.SelectedItemIDs.length - 1] = parseSelectRow(ItemID, rec);
                    }
                }
            }
        }


        callback_selectList(sl)
        return true;

    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
        return false;
    }
}

// success = await asyncDNOClearTable(fHandle); // delete an item from the database
//
// Returns:
//  - true or false  - activeProcess.At_Errors also set
//
async function asyncDNOClearTable(fHandle) {
    try {
        var errs = dotNetObj.dnoClearFile(Mid(fHandle, 1))
        if (Left(errs, 2) == "**") {
            activeProcess.At_Errors = Mid(errs, 2);
            showStatus(activeProcess.At_Errors, '', false)
            return false;
        }
        return true;
    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
        return false;
    }
}

async function asyncDNOListFiles(callback_fileList) {
    try {
        var fileList = dotNetObj.dnoListFiles();
        if (Left(fileList, 2) == "**") {
            activeProcess.At_Errors = Mid(fileList, 2);
            showStatus(activeProcess.At_Errors, '', false)
            return false;
        }

        // convert ArrayList to Am-String
        callback_fileList(fileList);
        activeProcess.At_Errors = ""
        return true;

    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
        return false;
    }
}

// success = await asyncDNOSqlSelect(sqlCommand); // delete an item from the database
//
// Returns:
//  - true or false  - activeProcess.At_Errors also set
//  
async function asyncDNOSqlSelect(sqlCommand, callback_selectList) {
    var sl = new selectList

    try {
        var s = dotNetObj.dnoSqlSelect(sqlCommand)
        if (Left(s, 2) == "**") {
            activeProcess.At_Errors = Mid(s, 2);
            showStatus(activeProcess.At_Errors, '', false)
            return false;
        }

        var ItemList = parseJSON(s);
        if (ItemList.length) {
            var rec = ItemList[LBound(ItemList)]
            var keyID;
            for (var key in rec) {
                if (rec.hasOwnProperty(key)) {
                    keyID = key
                    break;
                }
            }

            for (var j = LBound(ItemList); j <= UBound(ItemList); j++) {
                var rec = ItemList[j];
                var ItemID = rec[keyID];

                if (rec && (!preSelectedIDs || LocateAM(LCase(ItemID), preSelectedIDs) != -1)) {
                    sl.SelectedItemIDs.push(ItemID);
                    sl.SelectedItems[sl.SelectedItemIDs.length - 1] = parseSelectRow(rec[keyID], rec);
                }
            }
        }
        callback_selectList(sl);
        return true;

    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
        return false;
    }
}

function SQL(sqlCommand) {
    var result = dotNetObj.dnoSqlScalar(sqlCommand)
    activeProcess.At_Errors = ""
    return result
}

async function asyncDNOSaveList(sl, itemName) {
    try {
        var fileList = dotNetObj.dnoSaveList(sl, ListName)
        if (Left(fileList, 2) == "**") {
            activeProcess.At_Errors = Mid(fileList, 2);
            showStatus(activeProcess.At_Errors, '', false)
            return false;
        }

        activeProcess.At_Errors = ""
        return true;
    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
        return false;
    }
}

async function asyncDNOGetList(itemName, callBack_SelectList) {
    try {
        var fileList = dotNetObj.dnoGetList(ListName)
        if (Left(fileList, 2) == "**") {
            activeProcess.At_Errors = Mid(fileList, 2);
            showStatus(activeProcess.At_Errors, '', false)
            return false;
        }

        if (fileList == undefined) return false;
        activeProcess.At_Errors = ""
        callBack_SelectList(Split(fileList, am));
        return true;
    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
        return false;
    }
}

// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// *****************************************************  File System DATABASE ROUTINES   *********************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************

// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// *****************************************************  FILESYSDB DATABASE ROUTINES   *********************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************

var fsCache = {
    maxSize: 100,
    LRU: [],
    cache: {},
    itemAge: {}
}

function inlineDelay(seconds) {
    var d = new Date();
    var n = d.getTime();

    for (; true;) {
        var d = new Date();
        var l = d.getTime() - n;
        if (l > seconds * 1000) break;
    }
}

// Escape funny characters
function DosEncodeID(itemID) {
    var result = "", funnyChars = "$%\+\"\\|/<*>:?*/.";
    for (var i = 0; i < itemID.length; i++) {
        var c = itemID.charAt(i)
        if (funnyChars.indexOf(c) >= 0) result += "$" + STX(c); else result += c;
    }
    return result
}

function DosDecodeID(itemID) {
    if (itemID.indexOf("$") == -1) return itemID;

    var r = "", HX1, HX2;
    for (var i = 0; i < itemID.length; i++) {
        var c = itemID.charAt(i)
        if (c == "$") {
            var HX1 = itemID.charAt(i + 1).toLowerCase();
            var HX2 = itemID.charAt(i + 2).toLowerCase();
            var dg1 = '0123456789abcdefgh'.indexOf(HX1);
            var dg2 = '0123456789abcdefgh'.indexOf(HX2);

            if (dg1 >= 0 && dg2 >= 0) {
                r += Chr(dg1 * 16 + dg2)
                i += 2
            } else {
                r += c
            }
        } else {
            r += c
        }
    }
    return r
}

function dropRightSlash(TableName) {
    if (TableName != "/" && Right(TableName, 1) == "/") return Left(TableName, Len(TableName) - 1);
    return TableName
}

// Does not change case on tablename
//
// Returns:
//    result.rootDir
//    result.folderName      // foldername for use under root
//

// resolve file:///
function trueFileSysName(DictData, TableName, ItemName) {
    var result = {}

    DictData = Trim(LCase(DictData))
    if (!DictData) {
        var L5 = Left(LCase(TableName), 5)

        if (L5 == "dict " || L5 == "data ") {
            DictData = RTrim(L5);
            TableName = Mid(TableName, 5)
            L5 = Left(LCase(TableName), 5)
        }
    }

    if (DictData == "dict") DictData = ".dct"; else DictData = ""

    TableName = dropRightSlash(Change(TableName, "\\", "/"));
    if (Left(TableName, 8) == "file:///" && !isPhoneGap()) TableName = Mid(TableName, 7); // reduce to just "/"

    // If our ItemName has slashes in it, move them to the foldername
    if (ItemName) {
        var i = InStr(ItemName, "/")
        while (i != -1) {
            var DirPart = Field(ItemName, "/", 1)
            ItemName = dropLeft(ItemName, "/")
            if (DirPart) {
                if (Right(TableName, 1) == "/") TableName += DirPart + "/"; else TableName += "/" + DirPart;
            }

            i = InStr(ItemName, "/")
        }

        result.ItemName = DosEncodeID(LTrim(RTrim(ItemName)));
    }

    // directoryname/filename -> ./directoryname/filename
    if (Left(TableName, 5) == "file:") {
        result.folderName = TableName
        result.rootDir = fileSystem.root
    } else {
        var directPath = Left(TableName, 1) == "/" || Left(TableName, 2) == "./" || TableName == ".";
        if (!directPath) {
            if (InStr(Mid(TableName, 1), "/") != -1) {
                TableName = "./" + TableName;
                directPath = true;
            }
        }

        if (directPath) {
            // Set root based on / or ./
            if (Left(TableName, 1) == "/" || !JSBRootDir) {
                result.rootDir = fileSystem.root;
                TableName = Mid(TableName, 1);

            } else if (TableName == ".") {
                result.rootDir = JSBRootDir;

            } else { // else Left(TableName, 2) == "./"
                result.rootDir = JSBRootDir;
                TableName = Mid(TableName, 2);
            }

            var extra = dropLeft(TableName, "/")
            var TableName = Field(TableName, "/", 1)
            if (extra) extra = "/" + extra;

            var pgName = null;
            if (!DictData) pgName = phonegapDirectory(TableName)

            if (pgName) {
                result.folderName = pgName + extra;   // All cordova.file.consts end with a "/"
                result.rootDir = fileSystem.root

            } else {
                if (DictData) extra = ".dct" + extra;
                result.folderName = TableName + extra;
            }
        } else {
            TableName = LCase(TableName)
            if (DictData) result.folderName = TableName + ".dct"; else result.folderName = TableName;
            result.rootDir = JSBRootDir; // address of ./
        }
    }

    return result
}

function fsGetDirectory(rootDirEntry, folders, createIt, success, failure) {
    if (typeof folders == "string") {
        folders = Change(folders, "\\", "/")
        if (Left(folders, 8) == "file:///") {

            // pick 1st directory? storage/*?
            if (Left(folders, 17) == "file:///storage/*") {
                folders = Mid(folders, 18)
                window.resolveLocalFileSystemURL("file:///storage", function (rootDirEntry) {
                    // get 1st directory
                    var directoryReader = rootDirEntry.createReader();
                    directoryReader.readEntries(function (entries) {
                        for (var rowI = 0; rowI < entries.length; rowI++) {
                            if (entries[rowI].isDirectory) {
                                rootDirEntry.getDirectory(entries[rowI].name, {
                                    "create": false
                                }, function (dirEntry) {
                                    if (dirEntry.fullPath == "/storage/emulated/") return failure({ code: 1, message: "no sdcard found" });
                                    fsGetDirectory(dirEntry, folders, createIt, success, failure);
                                }, failure);
                                return
                            }
                        }
                    }, failure);
                }, failure);
                return;
            }

            if (window.resolveLocalFileSystemURL) return window.resolveLocalFileSystemURL(folders, success, failure);

            rootDirEntry = fileSystem.root;
            folders = Mid(folders, 8)
        }

        if (folders.length) folders = folders.split('/')
    }

    if (!folders.length) return success(rootDirEntry)

    // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
    if (folders[0] == '.' || folders[0] == '') {
        folders = folders.slice(1);
        fsGetDirectory(rootDirEntry, folders, createIt, success, failure)
    } else {
        if (folders[0] == '..') {
            rootDirEntry.getParent(function (dirEntry) {
                fsGetDirectory(dirEntry, folders.slice(1), createIt, success, failure);
            }, function (err) {
                failure(err)
            });
            return;
        }

        if (!rootDirEntry || !rootDirEntry.getDirectory) {
            return failure('not a directory')
        }

        // Match any directory (used for 1st directory on file:///storage/* )
        if (folders[0] == '*') {
            // get 1st directory
            var directoryReader = rootDirEntry.createReader();
            directoryReader.readEntries(function (entries) {
                for (var rowI = 0; rowI < entries.length; rowI++) {
                    if (entries[rowI].isDirectory) {
                        rootDirEntry.getDirectory(entries[rowI].name, {
                            "create": false
                        }, function (dirEntry) {
                            fsGetDirectory(dirEntry, folders.slice(1), createIt, success, failure);
                        }, failure);
                        return
                    }
                }
            }, failure);

            return;
        }

        try {
            rootDirEntry.getDirectory(folders[0], {
                "create": createIt
            }, function (dirEntry) {
                fsGetDirectory(dirEntry, folders.slice(1), createIt, success, failure);

            }, function (err) {
                if ((err.name ? err.name == "NotFoundError" : (err.code == 1 || err.code == 8)) && createIt) {
                    rootDirEntry.getDirectory(folders[0], {
                        "create": false
                    }, function (dirEntry) {
                        fsGetDirectory(dirEntry, folders.slice(1), createIt, success, failure);
                    }, function (err) {
                        failure(err)
                    });

                } else {
                    failure(err);
                }
            });
        } catch (err) {
            failure(err);
        }
    }
};

/* async dirEntry */ function asyncGetDirectory(RootDirEntry, folderName, createIt) {
    return new Promise((resolve, reject) => {
        fsGetDirectory(RootDirEntry, folderName, createIt,
            function (dirEntry) {
                resolve(dirEntry)
            },
            function (err) {
                activeProcess.At_Errors = ((err.code == 1 || err.code == 8) || err.code == 8) ? "NotFoundError" : (err.message ? err.message : "Error code: " + err.code);
                resolve(null)
            }
        )
    });
}

/* async dirEntry */ function readEntries(dirReader) {
    return new Promise((resolve, reject) => {
        dirReader.readEntries(
            function (entries) {
                resolve(entries)
            },
            function (err) {
                activeProcess.At_Errors = ((err.code == 1 || err.code == 8) || err.code == 8) ? "NotFoundError" : (err.message ? err.message : "Error code: " + err.code);
                resolve(null)
            }
        )
    });
}



// returns null on error and activeProcess.At_Errors
async function dirReader_readAllEntries(dirReader) {
    let allEntries = await readEntries(dirReader);
    if (allEntries && allEntries.length) {
        while (true) {
            var moreEntries = await readEntries(dirReader);
            if (!moreEntries.length) break;
            for (let index = 0; index < moreEntries.length; ++index) {
                allEntries.push(moreEntries[index]);
            }
        }
    }

    return allEntries;
}

/* async  fileEntry */  function asyncGetFile(dirEntry, ItemName, options) {
    if (!options) options = { "create": false, "exclusive": false }
    return new Promise((resolve, reject) => {
        dirEntry.getFile(ItemName, options,
            fileEntry => resolve(fileEntry),
            err => {
                activeProcess.At_Errors = (err.code == 1 || err.code == 8) ? "NotFoundError" : (err.message ? err.message : "Error code: " + err.code);
                resolve(null)
            }
        );
    });
}

/* async file */  function asyncFileEntry2File(fileEntry) {
    return new Promise((resolve, reject) => {
        fileEntry.file(
            file => resolve(file),
            err => {
                activeProcess.At_Errors = (err.code == 1 || err.code == 8) ? "NotFoundError" : (err.message ? err.message : "Error code: " + err.code);
                resolve(null)
            }
        );
    });
}

/* async data */  function asyncFileReader(file, opts, ItemName) {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        var blkRead = opts.startsWith("B");

        if (blkRead) {
            var offset = Field(opts, "|", 2);
            var length = Field(opts, "|", 3);
            var readType = file.slice(offset, offset + offset.length);
        } else {
            var readType = file;
        }

        reader.onload = function (evt) {
            if (blkRead) {
                if (result.byteLength) {
                    resolve(arrayBuffer2Str(evt.target.result, "binary.bin"))
                } else {
                    activeProcess.At_Errors = "Read beyond end of file"
                    resolve(null);
                }
            } else {
                resolve(arrayBuffer2Str(evt.target.result, ItemName))
            }
        }

        reader.onerror = err => {
            activeProcess.At_Errors = (err.code == 1 || err.code == 8) ? "NotFoundError" : (err.message ? err.message : "Error code: " + err.code);
            resolve(null);
        }

        reader.readAsArrayBuffer(readType); // wait for call back
    });
}

/* async boolean */  function asyncFileEntryRemove(fileEntry) {
    return new Promise((resolve, reject) => {
        fileEntry.remove(() => resolve(true),
            err => {
                activeProcess.At_Errors = (err.code == 1 || err.code == 8) ? "NotFoundError" : (err.message ? err.message : "Error code: " + err.code);
                resolve(null)
            }
        );
    });
}

/* async fileWriter */  function asyncFileEntryCreateWriter(fileEntry) {
    return new Promise((resolve, reject) => {

        fileEntry.createWriter(
            fileWriter => resolve(fileWriter),
            err => {
                activeProcess.At_Errors = (err.code == 1 || err.code == 8) ? "NotFoundError" : (err.message ? err.message : "Error code: " + err.code);
                resolve(null)
            }
        );
    });
}

/* async boolean */  function asyncfileWriterWrite(fileWriter, Item, isBinaryFile, opts) {
    return new Promise((resolve, reject) => {
        var blkWrite = opts.startsWith("B");
        var truncated = false;

        fileWriter.onerror = err => {
            activeProcess.At_Errors = (err.code == 1 || err.code == 8) ? "NotFoundError" : (err.message ? err.message : "Error code: " + err.code);
            resolve(null);
        }

        fileWriter.onwriteend = function (evt) {
            if (!truncated && !blkWrite) {
                truncated = true;
                this.truncate(this.position);
                return; // should fire onwriteend once again
            }
            resolve(true);
        }

        try {
            var blob;
            if (isBinaryFile || blkWrite)
                blob = new Blob([string2ArrayBuffer(Item)], { "type": "octet/stream" });
            else
                blob = new Blob([Item], { "type": "text/plain" });

            if (blkWrite) {
                var offset = Field(opts, "|", 2);
                if (offset > fileWriter.length) {
                    resolve(null);
                    activeProcess.At_Errors = "Write beyond end of file";
                    resolve(false);
                }
                fileWriter.seek(offset);
            }

            fileWriter.write(blob); // Should fire onwriteend()

        } catch (err) {
            activeProcess.At_Errors = (err.code == 1 || err.code == 8) ? "NotFoundError" : (err.message ? err.message : "Error code: " + err.code);
            resolve(null);
        }
    });
}

// Returns:
//   - true or false  - activeProcess.At_Errors also set
//
async function asyncFSAttach(databaseName) {
    // get account directory
    var dbName = phonegapDirectory(databaseName);
    if (!dbName) dbName = databaseName;

    if (Left(dbName, 5) != "file:" && Left(dbName, 1) != "." && Left(dbName, 1) != "/" && Mid(dbName, 1, 2) != ":/" && Left(dbName, 1) != "\\" && Mid(dbName, 1, 2) != ":\\") {
        dbName = "account_" + LCase(dbName)
    }

    var dirEntry = await asyncGetDirectory(fileSystem.root, dbName);
    if (!dirEntry) {
        activeProcess.At_Errors = "Account not found " + databaseName;
        return false;
    };

    return true;
}

// success = await asyncFSDeleteDB(dbName); // delete a database
//
// Returns:
//   - true or false  - activeProcess.At_Errors also set
// 
//
async function asyncFSDeleteDB(dbName) {
    return await asyncFSDeleteTable("F/account_" + dbName);
}

/* async */ function asyncRequestFileSystem(type, fsSize) {
    return new Promise((resolve, reject) => {
        window.requestFileSystem = window.requestFileSystem || window.mozRequestFileSystem || window.webkitRequestFileSystem || window.msrequestFileSystem;

        if (!requestFileSystem) {
            activeProcess.At_Errors = "fsCreateDB: Your browser doesn't support requestFileSystem.";
            fileSystem = null;
            tryFileSystem = false
            resolve(null);
        }

        requestFileSystem(type, fsSize, function (fs) { resolve(fs) }, function (err) {
            activeProcess.At_Errors = (err.code == 1 || err.code == 8) ? "NotFoundError" : (err.message ? err.message : "Error code: " + err.code);
            fileSystem = null;
            tryFileSystem = false
            resolve(null);
        });
    });
}

/* async */ function asyncQueryQuota(fsSize) {
    return new Promise((resolve, reject) => {
        if (!navigator || !navigator.webkitPersistentStorage) {
            activeProcess.At_Errors = "No filesystem granted quota";
            resolve(0);
        } else {
            navigator.webkitPersistentStorage.queryUsageAndQuota(
                function (usedBytes, grantedBytes) {
                    if (grantedBytes) {
                        resolve(grantedBytes);
                        return
                    }

                    navigator.webkitPersistentStorage.requestQuota(fsSize,
                        function (grantedBytes) {
                            if (!grantedBytes) {
                                activeProcess.At_Errors = "requestQuota was denied";
                                resolve(0);
                            } else {
                                resolve(grantedBytes);
                            }
                        },
                        function (err) {
                            activeProcess.At_Errors = "requestQuota was denied";
                            resolve(0);
                        }
                    );
                }
            )
        }
    })
}

/* async */ function asyncRemoveRecursively(dirEntry) {
    return new Promise((resolve, reject) => {
        dirEntry.removeRecursively(function () { resolve(true); }, function (err) {
            activeProcess.At_Errors = (err.code == 1 || err.code == 8) ? "NotFoundError" : (err.message ? err.message : "Error code: " + err.code);
            resolve(false);
        });
    })
}


// success = await asyncFSCreateDB(); // create a database
//
// Returns: true or false  - activeProcess.At_Errors also set
//   side effect of setting JSBRootDir on success
//
async function asyncFSCreateDB(dbName) {
    if (!dbName) dbName = At_Account
    dbName = Replace(dbName, "\\", "/")
    if (Left(dbName, 1) == "/") dbName = Mid(dbName, 1)

    if (fileSystem) {
        // Create account directory
        var dirEntry = await asyncGetDirectory(fileSystem.root, "account_" + LCase(dbName), true);
        return !!dirEntry;
    }

    if (isPhoneGap()) {
        var fsSize = 100 * 1024 * 1024 // Request 100 MB size (bytes) of needed space 
        fileSystem = await asyncRequestFileSystem(PERSISTENT, fsSize);

        if (!fileSystem) return false;

        // Create jsonBasic directory
        JSBRootDir = await asyncGetDirectory(fileSystem.root, "account_" + LCase(dbName), true);
        return !!JSBRootDir;
    }

    if (window.parent && window.parent.fileSystem) {
        fileSystem = window.parent.fileSystem;
        JSBRootDir = window.parent.JSBRootDir;
        return true;
    }

    if (window.opener) {
        try {
            if (window.opener.fileSystem) {
                fileSystem = window.opener.fileSystem;
                JSBRootDir = window.opener.JSBRootDir;
                return true;
            }
        } catch (err) { }
    }

    var fsSize = fileSystemRequestSize // Request some space 

    grantedBytes = await asyncQueryQuota(fsSize);
    if (!grantedBytes) return false;
    if (fsSize > grantedBytes) fsSize = grantedBytes;

    fileSystem = await asyncRequestFileSystem(PERSISTENT, fsSize);
    if (!fileSystem) return false;

    JSBRootDir = await asyncGetDirectory(fileSystem.root, "account_" + LCase(dbName), true);
    return !!JSBRootDir;
}

// success = await asyncFSCreateTable(); 
//
// Returns:
//   - true or false  - activeProcess.At_Errors also set
//   callback_fHandle: fHandle
//
async function asyncFSCreateTable(dictData, tableName, callback_fHandle) {
    if (!tableName) {
        activeProcess.At_Errors = "CreateTable: empty table name"
        return false;
    }

    if (!fileSystem && tryFileSystem) if (!await asyncFSCreateDB(dbName)) return false;

    var DirInfo = trueFileSysName(dictData, tableName)
    fHandle = odbFileSystem + LTrim(LCase(dictData + " ")) + tableName;

    var dirEntry = await asyncGetDirectory(DirInfo.rootDir, DirInfo.folderName, true);
    if (dirEntry && callback_fHandle) callback_fHandle(fHandle);
    return !!dirEntry;
}

// success = await asyncFSDeleteTable(fHandle); // delete an item from the database
//
// Returns:
//   - true or false  - activeProcess.At_Errors also set
//  
//
async function asyncFSDeleteTable(fHandle) {
    if (!fileSystem && tryFileSystem) if (!await asyncFSCreateDB(dbName)) return false;

    var DirInfo = trueFileSysName("", Mid(fHandle, 1))

    if (!DirInfo.folderName) {
        activeProcess.At_Errors = "DeleteTable: non existent table"
        return false
    }

    var dirEntry = await asyncGetDirectory(DirInfo.rootDir, DirInfo.folderName, false);
    if (!dirEntry) return false;
    return await asyncRemoveRecursively(dirEntry);
}

// success = await asyncFSOpen(dictData, tableName, callback_fHandle); 
//
// Returns:
//   - true or false  - activeProcess.At_Errors also set
//
async function asyncFSOpen(dictData, tableName, callback_fHandle) {
    var fHandle = odbFileSystem + LTrim(LCase(dictData + " ")) + tableName;

    if (!tableName) {
        activeProcess.At_Errors = "Open: empty table name"
        return false
    }

    if (!fileSystem && tryFileSystem) if (!await asyncFSCreateDB(dbName)) return false;

    var DirInfo = trueFileSysName(dictData, LCase(tableName))
    var dirEntry = await asyncGetDirectory(DirInfo.rootDir, DirInfo.folderName, false);
    if (!dirEntry) {
        if (LCase(tableName) == tableName) {
            if (activeProcess.At_Errors == "NotFoundError") activeProcess.At_Errors = "File not found: " + LTrim(dictData + " ") + tableName + " (" + DirInfo.folderName + ")";
            return false;
        }

        DirInfo = trueFileSysName(dictData, tableName)
        fHandle = odbFileSystem + LTrim(dictData + " ") + tableName;

        var dirEntry = await asyncGetDirectory(DirInfo.rootDir, DirInfo.folderName, false);
        if (!dirEntry) {
            if (activeProcess.At_Errors == "NotFoundError") activeProcess.At_Errors = "File not found: " + LTrim(dictData + " ") + tableName + " (" + DirInfo.folderName + ")";
            return false;
        }
    }

    if (callback_fHandle) callback_fHandle(fHandle);
    return true;
}

async function asyncFSReadBlk(fHandle, itemName, offset, length, callback_data) {
    return await asyncFSRead(fHandle, itemName, "B|" + offset + "|" + length, undefined, callback_data);
}

// success = await asyncFSRead(fHandle, itemName, opts, atrno, callback_data)
//
// Returns:
//   - true or false  - activeProcess.At_Errors also set
//

async function asyncFSRead(fHandle, itemName, opts, atrno, callback_data) {
    var blkRead = opts.startsWith("B");
    var DirInfo = trueFileSysName("", Mid(fHandle, 1), itemName)
    var ItemName = LCase(DirInfo.ItemName);
    var cacheName = fHandle + am + LCase(Trim(itemName));

    if (!DirInfo.folderName) {
        activeProcess.At_Errors = "fsRead: empty item file handle";
        return false;
    }

    function processError() {
        if (activeProcess.At_Errors == "NotFoundError") {
            activeProcess.At_Errors = "fsRead: Item not found: " + DirInfo.folderName + "/" + ItemName;
            if (cacheName) cacheAdd(fsCache, cacheName, Chr(255) + "*!not found!*" + Chr(255));
        } else {
            activeProcess.At_Errors += " on item " + ItemName;
            showStatus(activeProcess.At_Errors, '', false);
        }

        stopFileSystemingTrace(traceName, activeProcess.At_Errors)
        return false;
    }

    function processRead(result, processingFromCache) {
        var data;

        if (opts == "XML" || opts == "XMLU") {
            if (cacheName && !processingFromCache) cacheAdd(fsCache, cacheName, result);
            data = parseXML(result)

        } else if (opts == "JSON" || opts == "JSONU") {
            if (cacheName && !processingFromCache) cacheAdd(fsCache, cacheName, result);

            if (result) {
                data = parseJSON(result, false)
                if (!data) {
                    // unable to convert to JSON
                    data = { ItemID: ItemName, ItemContent: result }
                }
            }
            else data = {}

        } else if (opts == "V" || opts == "VU") {
            if (cacheName && !processingFromCache) cacheAdd(fsCache, cacheName, result);
            data = Field(result, am, atrno)

        } else if (blkRead) {
            // Don't add to cache - it's only a partial read

            //if (!isString(result)) result = CStr(result)
            data = result

        } else {
            if (cacheName && !processingFromCache) cacheAdd(fsCache, cacheName, result);
            //if (!isString(result)) result = CStr(result)
            data = result
        }

        if (!processingFromCache) stopFileSystemingTrace(traceName, "success")

        callback_data(data);
        return true;
    }

    // Is this a dictionary item? If so, check on cache
    if (cacheName && !blkRead) {
        var result = cacheFetch(fsCache, cacheName)
        if (result !== null) {
            if (result == Chr(255) + "*!not found!*" + Chr(255)) {
                activeProcess.At_Errors = "Item not found: " + ItemName;
                return false;
            } else {
                return processRead(result, true)
            }
        }
    }

    var traceName = 'fsread:' + DirInfo.rootDir.fullPath + '/' + DirInfo.folderName + '/' + ItemName
    startFileSystemingTrace(traceName)

    var dirEntry = await asyncGetDirectory(DirInfo.rootDir, DirInfo.folderName, false);
    if (!dirEntry) {
        if (activeProcess.At_Errors == "NotFoundError") {
            activeProcess.At_Errors = "Folder not found: " + DirInfo.folderName;
            if (cacheName) cacheAdd(fsCache, cacheName, Chr(255) + "*!not found!*" + Chr(255));
        } else {
            if (err && err.name) activeProcess.At_Errors = err.name + " " + err.message;
            else activeProcess.At_Errors = "Unknown File Read error on item " + DirInfo.folderName;
        }

        stopFileSystemingTrace(traceName, activeProcess.At_Errors)
        return false;
    }

    var fileEntry = await asyncGetFile(dirEntry, ItemName);

    // if lower case name not found, try original name
    if (!fileEntry) fileEntry = await asyncGetFile(dirEntry, DirInfo.ItemName);
    if (!fileEntry) return processError();

    var file = await asyncFileEntry2File(fileEntry)
    if (!file) return processError();

    var result = await asyncFileReader(file, opts, ItemName)
    if (result === null) return processError();

    return processRead(result, false)
}

async function asyncFSWriteBlk(data, fHandle, itemName, offset) {
    var opts = "B|" + offset;
    return asyncFSWrite(data, fHandle, itemName, opts, atrno);
}

// success = await asyncFSWrite(data, fHandle, itemName, opts, atrno); // delete an item from the database
//
// Returns:
//  - true or false  - activeProcess.At_Errors also set
//
async function asyncFSWrite(data, fHandle, itemName, opts, atrno) {
    if (!opts) opts = "";
    var writeBlk = opts.startsWith("B")

    function processError() {
        if (activeProcess.At_Errors == "NotFoundError") {
            activeProcess.At_Errors = "fsWrite: item not found: " + DirInfo.folderName + "/" + ItemName;
        } else {
            activeProcess.At_Errors += " on item " + ItemName;
            showStatus(activeProcess.At_Errors, '', false);
        }
        stopFileSystemingTrace(traceName, "failed")
        return false;
    }

    var DirInfo = trueFileSysName("", Mid(fHandle, 1), itemName)
    if (!DirInfo.folderName) {
        activeProcess.At_Errors = "fsWrite: empty file handle";
        return false;
    }

    var ItemName = LCase(DirInfo.ItemName)
    var Item = data;
    var cacheName = fHandle + am + LCase(Trim(itemName));

    if (opts == "XML" || opts == "XMLU" || isXML(Item)) {
        Item = xml2string(Item);
        if (cacheName) cacheAdd(fsCache, cacheName, Item);

    } else if (opts == "JSON" || opts == "JSONU" || isJSON(Item)) {
        Item = json2string(Item)
        if (cacheName) cacheAdd(fsCache, cacheName, Item);

    } else if (writeBlk) {
        var offset = Field(opts, "|", 2);
        var length = Field(opts, "|", 3);
        Item = CStr(Item)
        if (cacheName) cacheDelete(fsCache, cacheName);
        offset = CInt(offset);

    } else {
        Item = CStr(Item)
        if (cacheName) cacheDelete(fsCache, cacheName);
        if (opts == "V" || opts == "VU") throw 'fsWrite: V option not yet implemented.'
    }

    var traceName = 'fswrite:' + DirInfo.rootDir.fullPath + '/' + DirInfo.folderName + '/' + ItemName
    startFileSystemingTrace(traceName)

    // Create folder if necessary
    var dirEntry = await asyncGetDirectory(DirInfo.rootDir, DirInfo.folderName, true);
    if (!dirEntry) return false;

    var fileEntry = await asyncGetFile(dirEntry, ItemName, { "create": true, "exclusive": false });
    if (!fileEntry) return false;

    var fileWriter = await asyncFileEntryCreateWriter(fileEntry);
    var success = await asyncfileWriterWrite(fileWriter, Item, isBinaryFile(ItemName), opts)

    if (success) {
        // Final onwritend after truncation
        var Ext = LCase(Right(ItemName, 4))
        if (mobileType.Android() && hasCordovaPlugIn("MediaScannerPlugin") && (Ext == ".jpg" || Ext == ".png")) {
            // If the item we are just wrote is an image, make sure it becomes visible right away to the Android Media Scanner
            try {
                window.cordova.plugins.MediaScannerPlugin.scanFile(dirEntry.nativeURL + ItemName, function () { }, function () { })
            } catch (err) {
                showStatus(err.message)
            }
        }
        stopFileSystemingTrace(traceName, "success");
    } else {
        stopFileSystemingTrace(traceName, activeProcess.At_Errors)
    }

    return success;
}

// success = await asyncFSDelete(fHandle, itemName); // delete an item from the database
//
// Returns:
//     - true or false; if false then activeProcess.At_Errors set (expect for not found error)
//
async function asyncFSDelete(fHandle, itemName) {
    var DirInfo = trueFileSysName("", Mid(fHandle, 1), itemName)
    var ItemName = LCase(DirInfo.ItemName);
    var cacheName = null;

    function processError() {
        if (activeProcess.At_Errors == "NotFoundError") {
            activeProcess.At_Errors = ""; // fsDelete: item not found: " + DirInfo.folderName + "/" + ItemName;
        } else {
            activeProcess.At_Errors += " on item " + ItemName;
            showStatus(activeProcess.At_Errors, '', false);
        }

        return false;
    }

    if (!DirInfo.folderName) {
        activeProcess.At_Errors = "fsDelete: empty file handle";
        return false;
    }

    cacheName = fHandle + am + LCase(Trim(itemName));
    cacheDelete(fsCache, cacheName);

    var dirEntry = await asyncGetDirectory(DirInfo.rootDir, DirInfo.folderName, false);
    if (!dirEntry) return false;

    var fileEntry = await asyncGetFile(dirEntry, ItemName);
    if (!fileEntry) fileEntry = await asyncGetFile(dirEntry, DirInfo.ItemName);
    if (!fileEntry) return processError();

    if (asyncFileEntryRemove(fileEntry)) return true;
    return processError();
}

async function asyncFSSelect(fHandle, returnOnlyTheItemID, preSelectedIDs, columns, where, callback_selectList) {
    if (!fileSystem && tryFileSystem) if (!await asyncFSCreateDB(dbName)) return false;

    var sl = new selectList
    DirInfo = trueFileSysName("", Mid(fHandle, 1))

    // Block is set and stays set until final return
    var dirEntry = await asyncGetDirectory(DirInfo.rootDir, DirInfo.folderName, false);
    if (!dirEntry) return false;

    // list a directory
    var dirReader = dirEntry.createReader();
    var entries = await dirReader_readAllEntries(dirReader);
    if (entries === null) return false;

    var readWholeItem = !returnOnlyTheItemID;
    for (var i = 0; i < entries.length; i++) {
        var ItemID = DosDecodeID(entries[i].name);

        if (readWholeItem) {
            if (entries[i].isDirectory) {
                // Skip directories

            } else {
                if (!preSelectedIDs || LocateAM(LCase(ItemID), preSelectedIDs) != -1) {
                    var fileEntry = await asyncGetFile(dirEntry, entries[i].name);
                    if (!fileEntry) return false;

                    var file = await asyncFileEntry2File(fileEntry);
                    var result = await asyncFileReader(file, "", ItemID)
                    var ItemID = DosDecodeID(fileEntry.name);
                    sl.SelectedItemIDs.push(ItemID);
                    var record = parseSelectRow(ItemID, result);
                    sl.SelectedItems[sl.SelectedItemIDs.length - 1] = record;
                }
            }

            // do only ItemsIDs 
        } else if (columns) {
            if (!preSelectedIDs || LocateAM(LCase(ItemID), preSelectedIDs) != -1) {
                sl.SelectedItemIDs.push(ItemID)
                sl.SelectedItems[sl.SelectedItemIDs.length - 1] = {
                    ItemID: ItemID
                };
            }

            // do only ItemsIDs & directory names
        } else {
            if (entries[i].isDirectory && !preSelectedIDs) {
                sl.SelectedItemIDs.push("[" + entries[i].name + "]")
            } else {
                var ItemID = DosDecodeID(entries[i].name)
                if (!preSelectedIDs || LocateAM(LCase(ItemID), preSelectedIDs) != -1) {
                    sl.SelectedItemIDs.push(ItemID)
                }
            }
        }
    }

    callback_selectList(sl);
    return true;
}

// success = await asyncFSClearTable(); // delete an item from the database
//
// Returns:
//  - true or false  - activeProcess.At_Errors also set
//
async function asyncFSClearTable(fHandle) {
    var DirInfo = trueFileSysName("", Mid(fHandle, 1))
    if (!DirInfo.folderName) {
        activeProcess.At_Errors = "fsClearTable: empty table name"
        return false
    }

    cacheClearTable(fsCache, fHandle + am)

    // Select File and loop through item
    var sl;
    if (!await asyncFSSelect(fHandle, true /* only need itemid */, null /* preSelectedIDs */, 'ItemID' /* columns */, null /* where */, (rselectList) => sl = rselectList)) return false;

    //  add all virgin items unless they have been deleted
    var SelectedItemIDs = sl.SelectedItemIDs;

    for (var si = 0; si < SelectedItemIDs.length; si++) {
        var ItemID = SelectedItemIDs[si];
        if (ItemID) if (!await asyncFSDelete(fHandle, ItemID)) return false;
    }

    return true;
}

async function asyncFSListFiles(fileSysBasePath, callback_fileList) {
    var dirReader;

    if (!fileSystem && tryFileSystem) if (!await asyncFSCreateDB(dbName)) return false;

    if (fileSysBasePath) {
        var dirEntry = await asyncGetDirectory(JSBRootDir, fileSysBasePath, false);
        if (!dirEntry) return false;
        dirReader = dirEntry.createReader();
    } else {
        dirReader = JSBRootDir.createReader();
    }

    // list a directory
    var entries = await dirReader_readAllEntries(dirReader);
    if (entries === null) return false;

    var fileList = []; // Names of all "DATA" files
    var LfileList = []
    for (var i = 0; i < entries.length; i++) {
        var id = entries[i].name;
        if (entries[i].isDirectory) {
            if (Right(id, 4) != ".dct") {
                fileList.push(id);
                LfileList.push(LCase(id) + ".dct");
            }
        } else if (Left(id, 1) == "-") {
            LfileList.push(LCase(Mid(id, 1)) + ".dct");
        }
    }

    // Show abandoned dictionaries (QD files)
    for (var i = 0; i < entries.length; i++) {
        var id = entries[i].name;
        if (entries[i].isDirectory && Right(id, 4) == ".dct") {
            if (isNothing(window.cachedFileNames[Left(id, Len(id) - 4)])) {
                if (LocateAM(id, LfileList) == -1) fileList.push(id);
            }
        }
    }

    callback_fileList(fileList);
    return true;
}

// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// *****************************************************  HTTP DATABASE ROUTINES   *********************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************

// success = await asyncHTTPOpen(); 
//
// Returns:
//   - true or false  - activeProcess.At_Errors also set
//   callback_fHandle: fHandle
//
async function asyncHTTPOpen(dictData, tableName, callback_fHandle) {
    callback_fHandle(odbTypeHttp + tableName);
    return true;
}

// success = await asyncHTTPRead(fHandle, itemName, opts, atrno, callback_data); // delete an item from the database
//
//       itemName: IName,
//       opts: "XML", "JSON", or V#
//

//
// Returns:
//   - true or false  - activeProcess.At_Errors also set
//

async function asyncHTTPReadBlk(fHandle, itemName, offset, length, callback_data) {
    var opts = "B|" + offset + "|" + length;
    return await asyncHTTPReadWrite(fHandle, itemName, "GET", opts, undefined, undefined, callback_data);
}

async function asyncHTTPRead(fHandle, itemName, opts, atrno, callback_data) {
    return await asyncHTTPReadWrite(fHandle, itemName, "GET", opts, atrno, undefined, callback_data);
}

async function asyncHTTPWrite(data, fHandle, itemName, opts, atrno) {
    return await asyncHTTPReadWrite(fHandle, itemName, "POST", opts, atrno, data, callback_data);
}


async function asyncHTTPDelete(fHandle, itemName) {
    return await asyncHTTPReadWrite(fHandle, itemName, "DELETE", opts, atrno, undefined, callback_data);
}

/* async */ function asyncHttpRequest(xmlhttp, Body) {
    // If you are using IIS Express and getting CORS errors, see https://blog.jonathanchannon.com/2013-09-16-enabling-cors-in-iisexpress/
    //  and disable: chrome://flags/#block-insecure-private-network-requests
    //
    return new Promise((resolve, reject) => {
        xmlhttp.onload = () => resolve(true);
        xmlhttp.onerror = () => resolve(false);
        xmlhttp.send(Body);
    })
}

async function asyncHTTPSelect(fHandle, returnOnlyTheItemID, preSelectedIDs, columns, where, callback_selectList) {
    // Switch this to a read
    var data;
    var success = await asyncHTTPReadWrite(fHandle, "jsb_directory_list.dir", "GET", "" /* opts */, "" /* atrno */, undefined /* body */, _data => data = _data);
    if (!success) return false;

    data = Replace(data, Chr(195) + Chr(191), Chr(255))
    data = Replace(data, Chr(195) + Chr(190), Chr(254))
    data = Replace(data, Chr(195) + Chr(189), Chr(253))
    data = Replace(data, Chr(195) + Chr(187), Chr(251))
    data = Replace(data, Chr(195) + Chr(187), Chr(251))
    data = data.split(am)

    var ss = new selectList

    // Get URL + /jsb_directory_list.dir
    for (var i = 0; i < data.length; i++) {
        var ItemID = data[i]
        if (Left(ItemID, 1) != '[' || Right(ItemID, 1) != ']') {
            if (!preSelectedIDs || LocateAM(LCase(ItemID), preSelectedIDs) != -1) {
                ss.SelectedItemIDs.push(ItemID)

                if (returnOnlyTheItemID) {
                    if (columns) {
                        ss.SelectedItems[ss.SelectedItemIDs.length - 1] = {
                            ItemID: ItemID
                        }
                    }
                } else {
                    ss.SelectedItems[ss.SelectedItemIDs.length - 1] = {}
                }
            }
        }

    }

    callback_selectList(ss);
    return true;
}

async function asyncHTTPReadWrite(fHandle, itemName, method, opts, atrno, postBody, callback_data) {
    var ItemName = itemName;
    var Url, Method, Headers, NoRedirecting, Body

    if (InStr(ItemName, am) != -1) {
        Url = Mid(fHandle, 1)
        Method = Field(ItemName, am, 2);
        Headers = Field(ItemName, am, 3)
        Body = Field(ItemName, am, 4);
        NoRedirecting = Field(ItemName, am, 5) != "";
        ItemName = Field(ItemName, am, 1)
    } else {
        Url = Mid(Field(fHandle, am, 1), 1)
        Method = Field(fHandle, am, 2);
        Headers = Split(Field(fHandle, am, 3), vm);
        Body = Field(fHandle, am, 4);
        NoRedirecting = Field(fHandle, am, 5) != "";
    }

    if (postBody) Body = postBody;

    if (Method == "") Method = method;
    if (Method == "") defaultMethod || "GET";
    if (Method == "POST" || Method == "PUT") {
        if (InStr(Headers, "Content-Type:") == -1) {
            Headers += vm + "Content-Type: application/x-www-form-urlencoded"
        }
    }

    Headers = Split(Headers, vm)

    if (Left(ItemName, 1) == "/") ItemName = Mid(ItemName, 1);
    if (Len(ItemName) > 0) {
        if (Right(Url, 1) != "/") Url += "/";
        Url += ItemName;
    }

    // Upgrade to https if fetch is from same protocol and domain
    if (protoCol() == "https" && Field(Url, ":", 1) == "http") {
        var d1 = fieldLeft(dropLeft(Url, '//'), '/');
        var d2 = fieldLeft(dropLeft(window.location.href, '//'), '/');
        if (d1 == d2) Url = "https" + Mid(Url, 4);
    }

    try {
        var xmlhttp = new httpRequest();
        if (xmlhttp.withCredentials) xmlhttp.withCredentials = InStr(LCase(Url), "/server") > 0 && (InStr(Url, "&_rpcsid_=") > 0 || InStr(Body, "&_rpcsid_=") > 0);
        xmlhttp.open(Method, Url, true);
    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
        return false;
    }

    try {
        xmlhttp.responseType = "arraybuffer";
    } catch (err) {
        activeProcess.At_Errors = err2String(err, false);
    }

    if (Headers.length == 0) {
        Headers = []
        Headers.push("Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*")
        Headers.push("Accept-Language: en-US,en;q=0.9,pt;q=0.8")
        Headers.push("Cache-Control: max-age=0")

        if (Method == "POST") Headers.push("Content-Type: application/x-www-form-urlencoded")
    }

    // add headers
    var needAccept = true;

    for (var hi = 0; hi < Headers.length; hi++) {
        var header = Headers[hi];
        var i = InStr(0, header, ":");
        if (i == -1) i = InStr(0, header, "="); // should be :, but possibliy forgot and put =
        if (i > 0) {
            var key = Trim(Left(header, i));
            var val = LTrim(Mid(header, i + 1));
            if (key == "Accept") needAccept = false;

            if (key != 'Cache-Control' && key != 'Accept-Encoding' && key != 'Connection') {
                if (val) xmlhttp.setRequestHeader(key, val); else xmlhttp.setRequestHeader(key, ' ');
            }
        }
    }

    if (needAccept) xmlhttp.setRequestHeader("Accept", "*/*")
    startNetworkingTrace(Url);

    if (!await asyncHttpRequest(xmlhttp, Body)) {
        if (xmlhttp.status) {
            activeProcess.At_Errors = "http response:" + xmlhttp.status + ":" + xmlhttp.statusText + " (" + Field(Url, "/", 3) + ")";
            var responseText = arrayBuffer2Str(xmlhttp.response, 'binary.png')
            if (Left(responseText, 1) == "{") {
                var jsErr = string2json(responseText)
                if (jsErr.error_summary) activeProcess.At_Errors = "http response: " + xmlhttp.status + ": " + jsErr.error_summary + " (" + Field(Url, "/", 3) + ")";
            }
        } else {
            activeProcess.At_Errors = "NetWork error of some sort. Did you lose your internet connection? ";
        }

        stopNetworkingTrace(Url, "FAILED:" + activeProcess.At_Errors)
        showStatus(activeProcess.At_Errors, '', false)
        return false;
    }

    // Place header in @Errors 
    var rheader = xmlhttp.status + ":" + xmlhttp.statusText;
    var rheaders = Split(xmlhttp.getAllResponseHeaders(), crlf)
    for (var i = 0; i < rheaders.length; i++) {
        var h = rheaders[i];
        var j = InStr(0, h, ":");
        if (j > 0) {
            var key = Left(h, j)
            var value = LTrim(Mid(h, j + 1))
            if (value) rheader += am + key + "=" + value;
        }
    }

    activeProcess.At_Errors = rheader; // Not really an error - just a side place to put headers
    var data = arrayBuffer2Str(xmlhttp.response, 'binary.png');
    if (callback_data && data) callback_data(data);

    if (xmlhttp.status == 200 || xmlhttp.status == 201 || xmlhttp.status == 202 || xmlhttp.status == 400) {
        stopNetworkingTrace(Url, "SUCCESS:" + xmlhttp.status + ":" + xmlhttp.statusText)
        return true;

    } else if (xmlhttp.status == 403 || xmlhttp.status == 12007) {
        // Web site unavaliable
        stopNetworkingTrace(Url, "Unavaliable")
        return false;

    } else {
        stopNetworkingTrace(Url, "Unknown xmlhttp status:" + xmlhttp.status + ":" + xmlhttp.statusText)
        if (callback_dat && !dataa) callback_data(xmlhttp.statusText);
        return false;
    }
}

// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// **********************************  hybrid DATABASE ROUTINES (multiple items stored in 1 JSON record) ****************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************
// **********************************************************************************************************************************************

var hybridCache = {
    maxSize: 10,
    LRU: [],
    cache: {},
    itemAge: {}
}

// Does not change case on tablename
//
// Returns:
//    result.rootDir
//    result.folderName      // foldername for use under root
//
function hybridFileName(DictData, tableName, slashType) {
    tableName = Trim(LCase(tableName));
    DictData = Trim(LCase(DictData))
    var L5 = Left(tableName, 5)

    if (L5 == "dict " || L5 == "data ") {
        DictData = Field(tableName, " ", 1);
        tableName = Mid(tableName, 5);
    }

    if (slashType && slashType == "/") tableName = Change(tableName, "\\", "/");
    else tableName = Change(tableName, "/", "\\")

    if (Left(tableName, 1) == "/" || Left(tableName, 1) == ".") return tableName;

    if (DictData == "dict") return "-" + tableName + '.dct';
    return "-" + tableName;
}

async function asyncHybridAttach(databaseName) {
    if (fsRootHandle) return true

    if (!await asyncFSOpen("", ".", rfHandle => fHandle = rfHandle)) return false;
    fsRootHandle = fHandle;
    return true;
}

// success = await asyncHybridCreateTable(dictData, tableName, callback_fHandle); 
//
// Returns:
//   - true or false  - activeProcess.At_Errors also set
//   callback_fHandle: fHandle
//
async function asyncHybridCreateTable(dictData, tableName, callback_fHandle) {
    if (!tableName) {
        activeProcess.At_Errors = "CreateTable: empty table name"
        return false
    }

    // not really a hybrid file
    if (Left(tableName, 1) == "/" || Left(tableName, 1) == ".") {
        return await asyncFSCreateTable("", tableName, callback_fHandle)
    }

    tableName = hybridFileName(dictData, tableName, "/")

    var fHandle = odbHybridStorage + LCase(tableName);
    if (!fsRootHandle) if (!await asyncHybridAttach(dbName)) return false;

    // create table just writes an empty item if it's not there
    var data;
    if (await asyncFSRead(fsRootHandle, tableName, "JSON", null, rdata => data = rdata)) {
        if (isPhoneGap()) cacheAdd(hybridCache, tableName, data);
        if (callback_fHandle) callback_fHandle(fHandle)
        return true;
    }

    if (!await asyncFSWrite({}, fsRootHandle, tableName, "JSON", null)) return false;

    if (isPhoneGap()) cacheAdd(hybridCache, tableName, data);
    if (callback_fHandle) callback_fHandle(fHandle)
    return true;
}

// success = await asyncHybridDeleteTable(fHandle); // delete an item from the database
//
// Returns:
//   - true or false  - activeProcess.At_Errors also set
//  
//
async function asyncHybridDeleteTable(fHandle) {
    var tableName = Mid(fHandle, 1);

    if (tableName == delayedHybridWrite_tableName) {
        clearTimeout(delayedHybridWrite_timer); // stop delayed write
        delayedHybridWrite_data = 'Canceled by hybridDeleteTable';
        delayedHybridWrite_tableName = null;
    }

    // delete table become delete item
    var _functionResult = await asyncFSDelete(fsRootHandle, tableName);

    activeProcess.At_Errors = Change(activeProcess.At_Errors, "-", "")
    activeProcess.At_Errors = Change(activeProcess.At_Errors, "Item not", "File not")
    if (isPhoneGap()) cacheDelete(hybridCache, tableName)
    return _functionResult;
}

// success = await asyncHybridOpen(); 
//
// Returns:
//   - true or false  - activeProcess.At_Errors also set
//   callback_fHandle: fHandle
//
async function asyncHybridOpen(dictData, tableName, callback_fHandle) {
    if (!tableName) {
        activeProcess.At_Errors = "Open: empty table name"
        return false
    }

    // if this filename exists as a directory, use the filesystem
    if (await asyncFSOpen(dictData, tableName, callback_fHandle)) return true;

    // attempt hybrid open
    var tableName = hybridFileName(dictData, tableName, "/")
    var fHandle = odbHybridStorage + LCase(tableName);

    if (!fsRootHandle) if (!await asyncHybridAttach(dbName)) return false;

    // Read filesystem file to see if table exists
    var data;
    if (await asyncFSRead(fsRootHandle, tableName, "JSON", null, rdata => data = rdata)) {
        if (isPhoneGap()) cacheAdd(hybridCache, tableName, data);
        callback_fHandle(fHandle);
        return true;
    }

    activeProcess.At_Errors = Change(activeProcess.At_Errors, "-", "")
    activeProcess.At_Errors = Change(activeProcess.At_Errors, "Item not", "File not")
    return false
}

// success = await asyncHybridRead(); // delete an item from the database
//
// Returns:
//   - true or false  - activeProcess.At_Errors also set
//
async function asyncHybridRead(fHandle, itemName, opts, atrno, callback_data) {
    var tableName = LCase(Mid(fHandle, 1))
    var table = null;

    if (isPhoneGap()) table = cacheFetch(hybridCache, tableName);
    if (!table && tableName == delayedHybridWrite_tableName) table = delayedHybridWrite_data;
    if (!table) if (!await asyncFSRead(fsRootHandle, tableName, "JSON", null, rdata => table = rdata)) return false;
    if (isPhoneGap()) cacheAdd(hybridCache, tableName, table);

    var itemName = LCase(itemName)
    var data = table[itemName];
    if (typeof data == "object") data = clone(data);

    if (data === undefined) {
        activeProcess.At_Errors = "Item not found: " + itemName;
        return false;
    }

    if (opts == "XML" || opts == "XMLU") {
        data = parseXML(data)

    } else if (opts == "JSON" || opts == "JSONU") {
        if (data) {
            var jsonData = parseJSON(data, false)
            if (jsonData) {
                data = jsonData
            } else {
                data = { ItemID: itemName, ItemContent: data }
            }
        }
        else data = {}

    } else if (opts == "V" || opts == "VU") {
        data = Field(CStr(data), am, atrno)

    } else {
        data = CStr(data)
    }

    callback_data(data);
    return true;
}

//
// Returns:
//  - true or false  - activeProcess.At_Errors also set
//
async function asyncHybridWrite(data, fHandle, itemName, opts, atrno) {
    var tableName = LCase(Mid(fHandle, 1))
    var itemName = LCase(itemName)
    var table = null;

    if (isPhoneGap()) table = cacheFetch(hybridCache, tableName);
    if (!table && tableName == delayedHybridWrite_tableName) table = delayedHybridWrite_data;
    if (!table) if (!await asyncFSRead(fsRootHandle, tableName, "JSON", null, rdata => table = rdata)) table = {}

    if (opts == "delete") {
        if (table[itemName] === undefined) return true;
        delete table[itemName];
    } else {
        // No change?
        if (table[itemName] == data) return true;
        table[itemName] = data;
    }

    if (isPhoneGap()) cacheAdd(hybridCache, tableName, table);

    // Are we writing to the same table as the current delayed timer?
    if (delayedHybridWrite_tableName == tableName) {
        // yes - reset timer
        clearTimeout(delayedHybridWrite_timer);
        delayedHybridWrite_data = table // update table to write in delay
        delayedHybridWrite_timer = setTimeout(delayedHybridWriteEvent, 300);
        return true;
    }

    // If a delayed timer is running, stop delayed write and do it now
    if (delayedHybridWrite_tableName) {
        // yes - force delayed write now - stop current timer
        clearTimeout(delayedHybridWrite_timer);
        delayedHybridWrite_timer = null;
        delayedHybridWrite_data = 'Canceled by HybridWrite';
        delayedHybridWrite_tableName = null;

        if (!await asyncFSWrite(data, fsRootHandle, delayedHybridWrite_tableName, "JSON", null)) return false;
    }

    // If this write is the same as the last one, start a delayed write (it takes two writes in a row to start delayed writes)
    if (hybridLastSuccessfulWrite_tableName == tableName) {
        clearTimeout(delayedHybridWrite_timer);
        delayedHybridWrite_tableName = tableName
        delayedHybridWrite_data = table
        delayedHybridWrite_timer = setTimeout(delayedHybridWriteEvent, 300);
        return true; // assumes TRUE
    }

    // Normal write
    if (!await asyncFSWrite(table, fsRootHandle, tableName, "JSON")) return false;

    // Successful
    hybridLastSuccessfulWrite_tableName = tableName;
    return true
}

async function delayedHybridWriteEvent() {
    if (!delayedHybridWrite_tableName) return
    clearTimeout(delayedHybridWrite_timer);
    delayedHybridWrite_timer = null;

    var tblName = delayedHybridWrite_tableName;
    var data = delayedHybridWrite_data;
    delayedHybridWrite_tableName = null;
    delayedHybridWrite_data = null;

    await asyncFSWrite(data, fsRootHandle, tblName, "JSON")
    hybridLastSuccessfulWrite_tableName = delayedHybridWrite_tableName;
}

// success = await asyncHybridDelete(); // delete an item from the database
//
// Returns:
//     - true or false  - activeProcess.At_Errors also set
//
async function asyncHybridDelete(fHandle, itemName) {
    return await asyncHybridWrite(undefined, fHandle, itemName, "delete");
}

// success = await asyncHybridSelect(fHandle, returnOnlyTheItemID, preSelectedIDs, columns, where, callback_selectList); // delete an item from the database
//
// Returns:
//  - true or false  - activeProcess.At_Errors also set
//
async function asyncHybridSelect(fHandle, returnOnlyTheItemID, preSelectedIDs, columns, where, callback_selectList) {
    var tableName = LCase(Mid(fHandle, 1))
    var itemName = LCase(itemName)
    var table = null;

    if (isPhoneGap()) table = cacheFetch(hybridCache, tableName);
    if (!table && tableName == delayedHybridWrite_tableName) table = delayedHybridWrite_data;
    if (!table) if (!await asyncFSRead(fsRootHandle, tableName, "JSON", null, rdata => table = rdata)) table = {}

    activeProcess.At_Errors = ""
    var sl = new selectList

    // list of PK's
    for (var ItemID in table) {
        if (!preSelectedIDs || LocateAM(LCase(ItemID), preSelectedIDs) != -1) {
            sl.SelectedItemIDs.push(ItemID)

            if (returnOnlyTheItemID) {
                if (columns) {
                    sl.SelectedItems[sl.SelectedItemIDs.length - 1] = {// not really a hybrid file
                        ItemID: ItemID
                    }
                }
            } else {
                var record = parseSelectRow(ItemID, table[ItemID])
                sl.SelectedItems[sl.SelectedItemIDs.length - 1] = record
            }
        }
    }

    callback_selectList(sl);
    return true;
}

// success = await asyncHybridClearTable(fHandle); // delete an item from the database
//
// Returns:
//  - true or false  - activeProcess.At_Errors also set
//
async function asyncHybridClearTable(fHandle) {
    var tableName = LCase(Mid(fHandle, 1))
    if (isPhoneGap()) cacheAdd(hybridCache, tableName, {});

    if (tableName == delayedHybridWrite_tableName) {
        clearTimeout(delayedHybridWrite_timer); // stop delayed write
        delayedHybridWrite_data = 'Canceled by hybridClearTable';
        delayedHybridWrite_tableName = null;
    }

    return await asyncFSWrite({}, fsRootHandle, tableName, "JSON");
}

async function asyncHybridListFiles(callback_fileList) {
    if (!fileSystem && tryFileSystem) if (!await asyncFSCreateDB(dbName)) return false;

    // list a directory
    var dirReader = JSBRootDir.createReader();
    var entries = await dirReader_readAllEntries(dirReader);
    if (entries === null) return false;

    var fileList = []
    for (var i = 0; i < entries.length; i++) {
        var iname = entries[i].name;

        if (!entries[i].isDirectory) {
            if (Left(iname, 1) == "-" && Right(iname, 4) != ".dct") fileList.push("js:" + Mid(iname, 1));
        }
    }

    callback_fileList(fileList);
    return true;
}

// SelectLists


function selectList() {
    this.SelectI = 0;
    this.SelectedItemIDs = [];
    this.SelectedItems = [];
}

function formList(s) {
    var ss = new selectList
    if (isJSON(s) && s.SelectedItemIDs != null) {

        if (!Len(s.SelectedItemIDs)) ss = [];
        else if (isArray(s.SelectedItemIDs)) ss.SelectedItemIDs = s.SelectedItemIDs;
        else ss.SelectedItemIDs = CStr(s.SelectedItemIDs).split(am);

        if (Len(s.SelectedItems) && !s.OnlyReturnItemIDs) ss.SelectedItems = s.SelectedItems;
    } else if (s) {
        ss.SelectedItemIDs = CStr(s).split(am)
    }
    return ss
}

function clearSelect(ss) {
    if (!ss) ss = odbActiveSelectList;
    if (!(ss instanceof selectList)) return;
    ss.SelectI = 0;
    ss.SelectedItemIDs = [];
    ss.SelectedItems = [];
    capturingKeys = false;
    return true
}

function isSelectActive(fromJsbRoutine) {
    return isActiveSelect(odbActiveSelectList)
}

function isActiveSelect(ss) {
    if (!ss) ss = odbActiveSelectList;
    if (!(ss instanceof selectList)) return false;

    if (ss.SelectedItemIDs == null) {
        return false
    }

    return ss.SelectI < ss.SelectedItemIDs.length;
}

function getList(ss, returnOnlyTheItemID) {
    if (!ss) ss = odbActiveSelectList;

    if (!(ss instanceof selectList)) return null; // Not found

    var SelectedItemIDs = ss.SelectedItemIDs
    if (returnOnlyTheItemID) {
        if (Len(SelectedItemIDs) == 0) return null; // Not found
        clearSelect(ss) // changed to clear after get
        return SelectedItemIDs;
    }
    if (Len(SelectedItemIDs) == 0) return [];

    // If we have JSON items, use them
    if (isJSON(ss.SelectedItems[0])) {
        if (ss.SelectedItems[0].ItemContent != undefined) {
            var result = [];
            for (var i = LBound(ss.SelectedItems); i < ss.SelectedItems.length; i++) {
                result.push(ss.SelectedItems[i].ItemContent)
            }
        } else {
            result = ss.SelectedItems;
        }
    } else {
        // Array of strings, build array of JSON
        if (ss.SelectedItems.length) result = ss.SelectedItems;
        else result = ss.SelectedItemIDs;
    }

    clearSelect(ss) // changed to clear after get
    if (result[0] != undefined) result.unshift(undefined)
    return result;
}

// return next ItemID or 
function readNext(ss) {
    if (!ss) ss = odbActiveSelectList;

    if (!isActiveSelect(ss)) return {
        "success": false,
        "itemid": null,
        "item": null
    }
    var SI = ss.SelectI++
    if (!SI && !ss.SelectedItemIDs[SI]) {
        SI++;
        if (!isActiveSelect(ss)) return {
            "success": false,
            "itemid": null,
            "item": null
        }
    }

    return {
        success: true,
        itemid: ss.SelectedItemIDs[SI],
        item: ss.SelectedItems[SI]
    }
}


