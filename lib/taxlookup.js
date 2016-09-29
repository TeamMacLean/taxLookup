var tax = {};

if (typeof window === 'undefined') {
  var request = require('superagent');
  var parseString = require('xml2js').parseString;
}

tax.get = function (url, cb) {

  if (typeof window !== 'undefined') {
    httpGetAsync(url, cb);
  } else {
    nodeGetAsync(url, cb);
  }

};

function nodeGetAsync(theUrl, callback) {
  request
    .get(theUrl)
    .end(function (err, res) {
      if (err) {
        cb(err);
      } else {
        callback(null, res.text);
      }
    });
}

function httpGetAsync(theUrl, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == XMLHttpRequest.DONE && xmlHttp.status == 200) {
      callback(null, xmlHttp.responseText);
    } else {
      callback(new Error('not a 200 response'));
    }
  };
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.send(null);
}

tax.eSpell = function (search, cb) {
  var url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/espell.fcgi?term=' + search + '&db=taxonomy';

  tax.get(url, function (err, res) {
    if (res) {
      tax.xmlToJson(res, function (err, result) {
        if (err) {
          cb(err)
        } else {
          var out = result.eSpellResult.CorrectedQuery;
          cb(null, out);
        }
      })
    }
  });

};

tax.eSearch = function (search, cb) {
  var url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=taxonomy&term=' + search + '&retmode=json';

  tax.get(url, function (err, res) {
    if (res) {

      var json = JSON.parse(res);

      cb(null, json.esearchresult.idlist);
    }
  });

};

tax.eFetch = function (id, cb) {
  var url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=taxonomy&id=' + id;


  tax.get(url, function (err, res) {
    if (res) {
      tax.xmlToJson(res, function (err, result) {
        if (err) {
          cb(err)
        } else {
          var out = result.TaxaSet;
          cb(null, out);
        }
      })
    }
  });
};

stringToXML = function (xmlString) {
  try {
    var xmlDoc = null;

    if (window.DOMParser || DOMParser) {

      var parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlString, "text/xml");


      return xmlDoc;
    } else {
      xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = false;
      xmlDoc.loadXML(xmlString);

      return xmlDoc;
    }
  } catch (e) {
    return null;
  }
};

function toObj(xml, parent) {
  if (xml.nodeType == 9) // document.node
    return toObj(xml.documentElement, parent);

  var o = {};

  if (!parent                    // no parent = root element = first step in recursion
    || parent instanceof Array) { // if parent is an Array, we cannot add attributes to it, so handle it with similar extra step as a root element
    if (xml.nodeType == 1) { // element node
      o[xml.nodeName] = toObj(xml, o);
    }
    else
      err("unhandled node type: " + xml.nodeType);
    return o;
  }

  // second and following recursions
  if (xml.nodeType == 1) {   // element node ..

    if (xml.attributes.length)   // element with attributes  ..
      for (var i = 0; i < xml.attributes.length; i++)
        parent[xml.nodeName + "@" + xml.attributes[i].nodeName] = xml.attributes[i].nodeValue;

    if (xml.firstChild) { // element has child nodes. Figure out some properties of it's structure, to guide us later.
      var textChild = 0, cdataChild = 0, hasElementChild = false, needsArray = false;
      var elemCount = {};
      for (var n = xml.firstChild; n; n = n.nextSibling) {
        if (n.nodeType == 1) {
          hasElementChild = true;
          elemCount[n.nodeName] = (elemCount[n.nodeName] ? elemCount[n.nodeName] + 1 : 1);
          if (elemCount[n.nodeName] > 1) needsArray = true;
        }
        else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
        else if (n.nodeType == 4) cdataChild++; // cdata section node
      }
      if (hasElementChild && textChild) needsArray = true;
      if (hasElementChild && cdataChild) needsArray = true;
      if (textChild && cdataChild) needsArray = true;
      if (cdataChild > 1) needsArray = true;

      if (hasElementChild && !needsArray) { // Neatly structured and unique child elements, no plain text/cdata in the mix
        removeWhite(xml);
        for (var n = xml.firstChild; n; n = n.nextSibling) {
          if (n.nodeType == 3)  // text node
          //o["#text"] = escape(n.nodeValue);
            o["#text"] = escape(n.nodeValue);
          else if (n.nodeType == 4)  // cdata node
            o["#cdata"] = escape(n.nodeValue);
          else if (o[n.nodeName]) {  // multiple occurence of element ..
            if (o[n.nodeName] instanceof Array)
              o[n.nodeName][o[n.nodeName].length] = toObj(n, o);
            else
              o[n.nodeName] = [o[n.nodeName], toObj(n, o)];
          }
          else  // first occurence of element..
            o[n.nodeName] = toObj(n, o);
        }
      }
      else if (needsArray) {
        o = [];
        removeWhite(xml);
        for (var n = xml.firstChild; n; n = n.nextSibling) {
          if (n.nodeType == 3)  // text node
          //o["#text"] = escape(n.nodeValue);
            o[o.length] = escape(n.nodeValue); // TODO: shouldn't escape() happen in toJson() / printing phase???
          else if (n.nodeType == 4)  // cdata node
            o[o.length] = {"#cdata": escape(n.nodeValue)}; // TODO: same here? especially with cdata?
          else { // element
            /*                           // at least in browser, cannot create new object with value of a variable as key
             var newObj = {};
             // must set the key here separately
             newObj[n.nodeName] = toObj(n, o);
             o[o.length] = newObj; // push
             */
            o[o.length] = toObj(n, o); //push
          }
        }
      }
      else if (textChild) { // pure text
        o = escape(innerXml(xml));
      }
      else if (cdataChild) { // single cdata
        removeWhite(xml);
        o["#cdata"] = escape(xml.firstChild.nodeValue);
      }
    }

    //if (!xml.attributes.length && !xml.firstChild) o = null;
    if (!xml.firstChild) o = null;

  }
  else
    err("unhandled node type: " + xml.nodeType);

  return o;
}

function err(msg) {
  console.error("Error:", msg);
}

function toJson(o, ind) {
  var json = "";
  if (o instanceof Array) {
    for (var i = 0, n = o.length; i < n; i++) {
      // strings usually follow the colon, but in arrays we must add the usual indent
      var extra_indent = "";
      if (typeof(o[i]) == "string")
        extra_indent = ind + "\t";
      o[i] = extra_indent + toJson(o[i], ind + "\t");
    }
    json += "[" + (o.length > 1 ? ("\n" + o.join(",\n") + "\n" + ind) : o.join("")) + "]";
  }
  else if (o == null)
    json += "null";
  else if (typeof(o) == "string")
    json += "\"" + o.toString() + "\"";
  else if (typeof(o) == "object") {
    json += ind + "{";
    // Count the members in o
    var i = 0;
    for (var member in o)
      i++;
    for (var member in o) {
      json += "\n" + ind + "\t\"" + member + "\":" + toJson(o[member], ind + "\t");
      json += (i > 1 ? "," : "\n" + ind );
      i--;
    }
    json += "}";
  } else {
    json += o.toString();
  }
  return json;
}
function innerXml(node) {
  var s = "";
  if ("innerHTML" in node)
    s = node.innerHTML;
  else {
    var asXml = function (n) {
      var s = "";
      if (n.nodeType == 1) {
        s += "<" + n.nodeName;
        for (var i = 0; i < n.attributes.length; i++)
          s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
        if (n.firstChild) {
          s += ">";
          for (var c = n.firstChild; c; c = c.nextSibling)
            s += asXml(c);
          s += "</" + n.nodeName + ">";
        }
        else
          s += "/>";
      }
      else if (n.nodeType == 3)
        s += n.nodeValue;
      else if (n.nodeType == 4)
        s += "<![CDATA[" + n.nodeValue + "]]>";
      return s;
    };
    for (var c = node.firstChild; c; c = c.nextSibling)
      s += asXml(c);
  }
  return s;
}
function escape(txt) {
  return txt.replace(/[\\]/g, "\\\\")
    .replace(/[\"]/g, '\\"')
    .replace(/[\n]/g, '\\n')
    .replace(/[\r]/g, '\\r');
}
function removeWhite(e) {
  e.normalize();
  for (var n = e.firstChild; n;) {
    if (n.nodeType == 3) {  // text node
      if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
        var nxt = n.nextSibling;
        e.removeChild(n);
        n = nxt;
      }
      else
        n = n.nextSibling;
    }
    else if (n.nodeType == 1) {  // element node
      removeWhite(n);
      n = n.nextSibling;
    }
    else                      // any other node
      n = n.nextSibling;
  }
  return e;
}

tax.xmlToJson = function (xml, cb) {

  if (typeof window === 'undefined') {
    parseString(xml, function (err, result) {
      cb(err, result);
    });
  } else {

    var parsedString = stringToXML(xml);

    if (parsedString.nodeType == 9) { // document node
      parsedString = parsedString.documentElement;
    }
    var o = toObj(removeWhite(parsedString));
    var json = toJson(o, "");
    // If tab given, do pretty print, otherwise remove white space

    var parsedJson = JSON.parse(json.replace(/\t|\n/g, ""));

    cb(null, parsedJson);

  }


};

if (typeof window === 'undefined') {
  module.exports = tax;
}






