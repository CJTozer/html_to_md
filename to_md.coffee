list_stack = []
in_pre = false

html_to_md = (top_element) ->
  md = ""
  prev = ""
  next = ""
  
  # Search contents, rather than children, so we get text too
  $(top_element).contents().each ->
    elem = $(@)[0] # Easier naming...
    md += switch elem.nodeType
      when 3
        text = elem.data
        if text.length > 0 and (text.trim().length > 0 or prev != "")
          if /^ .* $/.test(text) then next = " TEXT "
          else if /.* $/.test(text) then next = "TEXT "
          else if /^ .*/.test(text) then next = " TEXT"
          else next = "TEXT"
          "#{space_required prev, next}#{text.trim()}"
        else ""
      else
        next = elem.tagName
        "#{space_required prev, next}" + switch next
          when "H1" then "# #{elem.innerHTML}"
          when "H2" then "## #{elem.innerHTML}"
          when "H3" then "### #{elem.innerHTML}"
          when "H4" then "#### #{elem.innerHTML}"
          when "H5" then "##### #{elem.innerHTML}"
          when "H6" then "###### #{elem.innerHTML}"
          when "P", "DIV" then "#{html_to_md elem}"
          when "A" then handle_link elem
          when "B" then "__#{html_to_md elem}__"
          when "BR" then ""
          when "EM" then "*#{html_to_md elem}*"
          when "UL" then handle_list elem, "*"
          when "OL" then handle_list elem, "1."
          when "LI" then handle_list_element elem
          when "IMG" then handle_img elem
          # Need to distinguish between code in PRE and otherwise
          when "PRE" then handle_pre elem
          when "CODE" then handle_code elem
          when "BLOCKQUOTE" then "> #{html_to_md elem}".replace /\n/g, "\n> "
          else "#{elem.outerHTML}"
          
    prev = next
    
  # Don't ever need more than 2 newlines in a row.
  md.replace /\n\n+\n/g, "\n\n"
  
space_required = (prev, next) ->
  spacing = "\n"
  set_apart = /^(H\d|DIV|P)$/i
  flow_on = /^( ?TEXT ?|A|B|EM|CODE|IMG)$/i
  spacing_rules = [[/^$/, /.*/, ""], # First element needs no extra spacing
                   [set_apart, /.*/, "\n\n"], # Set apart - always a blank line
                   [/.*/, set_apart, "\n\n"], # Set apart - always a blank line
                   [/.*/, /^IMG$/, "\n"], # Images on new line for readability
                   [/^IMG$/, flow_on, "\n"], # Images on new line for readability
                   [flow_on, /^ TEXT/i, " "], # Space before text
                   [/TEXT $/i, flow_on, " "], # Space after text
                   [flow_on, flow_on, ""], # Text and links/bold intermingled
                   [/^[UO]L$/, /^[UO]L$/, "\n \n \n"], # Separate lists from each other
                   [/^BR$/i, /.*/, "  \n"], # Line breaks require two trailing spaces
                   [/.*/, /^BR$/i, ""], # But no second newline
                  ]
  for rule in spacing_rules
    if rule[0].test(prev) and rule[1].test(next)
      spacing = rule[2]
      break
  spacing
  
handle_link = (elem) ->
  "[#{html_to_md elem}](#{elem.href})"
  
handle_list = (elem, list_marker) ->
  list_stack.push list_marker
  list_md = html_to_md elem
  list_stack.pop()
  list_md
  
handle_list_element = (elem) ->
  n = list_stack.length - 1
  indent = Array(n * 2 + 1).join(" ")
  "#{indent}#{list_stack[n]} #{html_to_md elem}"

handle_img = (elem) ->
  title = ""
  title = " \"#{elem.title}\"" if elem.title
  "![#{elem.alt}](#{elem.src}#{title})"

handle_pre = (elem) ->
  in_pre = true
  pre_md = "#{html_to_md elem}" 
  in_pre = false
  pre_md
  
handle_code = (elem) ->
  if in_pre then "    #{elem.innerHTML}".replace /\n/, "\n    "
  # Handle backticks inside the code element
  else
    # Find the longest consecutive string of backticks
    bts = elem.innerHTML.match /`+/g
    longest_bt = ""
    if bts
      longest_bt = bts.reduce (a, b) ->
        if a.length > b.length then a
        else b
    "`#{longest_bt}#{elem.innerHTML}#{longest_bt}`"