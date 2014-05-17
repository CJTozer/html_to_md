// Generated by CoffeeScript 1.7.1
var handle_code, handle_img, handle_link, handle_list, handle_list_element, handle_pre, html_to_md, in_pre, list_stack, space_required;

list_stack = [];

in_pre = false;

html_to_md = function(top_element) {
  var md, next, prev;
  md = "";
  prev = "";
  next = "";
  $(top_element).contents().each(function() {
    var elem, text;
    elem = $(this)[0];
    md += (function() {
      switch (elem.nodeType) {
        case 3:
          text = elem.data;
          if (text.length > 0 && (text.trim().length > 0 || prev !== "")) {
            if (/^ .* $/.test(text)) {
              next = " TEXT ";
            } else if (/.* $/.test(text)) {
              next = "TEXT ";
            } else if (/^ .*/.test(text)) {
              next = " TEXT";
            } else {
              next = "TEXT";
            }
            return "" + (space_required(prev, next)) + (text.trim());
          } else {
            return "";
          }
          break;
        default:
          next = elem.tagName;
          return ("" + (space_required(prev, next))) + (function() {
            switch (next) {
              case "H1":
                return "# " + elem.innerHTML;
              case "H2":
                return "## " + elem.innerHTML;
              case "H3":
                return "### " + elem.innerHTML;
              case "H4":
                return "#### " + elem.innerHTML;
              case "H5":
                return "##### " + elem.innerHTML;
              case "H6":
                return "###### " + elem.innerHTML;
              case "P":
              case "DIV":
                return "" + (html_to_md(elem));
              case "A":
                return handle_link(elem);
              case "B":
              case "STRONG":
                return "__" + (html_to_md(elem)) + "__";
              case "BR":
                return "";
              case "HR":
                return "\n----";
              case "EM":
                return "*" + (html_to_md(elem)) + "*";
              case "UL":
                return handle_list(elem, "*");
              case "OL":
                return handle_list(elem, "1.");
              case "LI":
                return handle_list_element(elem);
              case "IMG":
                return handle_img(elem);
              case "PRE":
                return handle_pre(elem);
              case "CODE":
                return handle_code(elem);
              case "BLOCKQUOTE":
                return ("> " + (html_to_md(elem))).replace(/\n/g, "\n> ");
              default:
                return "" + elem.outerHTML;
            }
          })();
      }
    })();
    return prev = next;
  });
  return md.replace(/\n\n+\n/g, "\n\n");
};

space_required = function(prev, next) {
  var flow_on, rule, set_apart, spacing, spacing_rules, _i, _len;
  spacing = "\n";
  set_apart = /^(H\d|DIV|P)$/i;
  flow_on = /^( ?TEXT ?|A|B|STRONG|EM|CODE|IMG)$/i;
  spacing_rules = [[/^$/, /.*/, ""], [set_apart, /.*/, "\n\n"], [/.*/, set_apart, "\n\n"], [/.*/, /^IMG$/, "\n"], [/^IMG$/, flow_on, "\n"], [flow_on, /^ TEXT/i, " "], [/TEXT $/i, flow_on, " "], [flow_on, flow_on, ""], [/^[UO]L$/, /^[UO]L$/, "\n \n \n"], [/^BR$/i, /.*/, "  \n"], [/.*/, /^BR$/i, ""]];
  for (_i = 0, _len = spacing_rules.length; _i < _len; _i++) {
    rule = spacing_rules[_i];
    if (rule[0].test(prev) && rule[1].test(next)) {
      spacing = rule[2];
      break;
    }
  }
  return spacing;
};

handle_link = function(elem) {
  return "[" + (html_to_md(elem)) + "](" + elem.href + ")";
};

handle_list = function(elem, list_marker) {
  var list_md;
  list_stack.push(list_marker);
  list_md = html_to_md(elem);
  list_stack.pop();
  return list_md;
};

handle_list_element = function(elem) {
  var indent, n;
  n = list_stack.length - 1;
  indent = Array(n * 2 + 1).join(" ");
  return "" + indent + list_stack[n] + " " + (html_to_md(elem));
};

handle_img = function(elem) {
  var title;
  title = "";
  if (elem.title) {
    title = " \"" + elem.title + "\"";
  }
  return "![" + elem.alt + "](" + elem.src + title + ")";
};

handle_pre = function(elem) {
  var pre_md;
  in_pre = true;
  pre_md = "" + (html_to_md(elem));
  in_pre = false;
  return pre_md;
};

handle_code = function(elem) {
  var bts, longest_bt;
  if (in_pre) {
    return ("    " + elem.innerHTML).replace(/\n/, "\n    ");
  } else {
    bts = elem.innerHTML.match(/`+/g);
    longest_bt = "";
    if (bts) {
      longest_bt = bts.reduce(function(a, b) {
        if (a.length > b.length) {
          return a;
        } else {
          return b;
        }
      });
    }
    return "`" + longest_bt + elem.innerHTML + longest_bt + "`";
  }
};
