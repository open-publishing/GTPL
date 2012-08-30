import sublime, sublime_plugin
import re

# Provide completions that match just after typing an opening angle bracket
class GtplTagCompletions(sublime_plugin.EventListener):
    def on_query_completions(self, view, prefix, locations):
        # Only trigger within GTPL
        if not view.match_selector(locations[0],
                "source.gtpl"):
            return []

        pt = locations[0] - len(prefix) - 1
        ch = view.substr(sublime.Region(pt, pt + 1))
        ch_close = view.substr(sublime.Region(pt-1, pt +1))
        if ch == '{' and ch_close != '{/':
                return ([
                ("if\tGTPL", "if ${1:condition}}\n\t$2\n{/if"),
                ("else\tGTPL", "else"),
                ("elseif\tGTPL", "elseif ${1:condition}"),
                ("foreach\tGTPL", "foreach ${1:iterator} in ${2:list}}\n\t${3:$SELECTION}\n{/foreach"),
                ("namespace\tGTPL", "namespace ${1:namespace}"),
                ("template\tGTPL", "template ${1:name}}\n\t${2:$SELECTION}\n{/template"),
        
                ("break\tGTPL", "break"),
                ("continue\tGTPL", "continue"),
                ("call\tGTPL", "call ${1:name}"),
                ("Call\tGTPL", "Call ${1:name}}\n\t${2:$SELECTION}\n{/Call"),
                ("yield\tGTPL", "yield ${1:name}"),
                ("Yield\tGTPL", "Yield ${1:name}}\n\t${2:$SELECTION}\n{/Yield"),
                ("param\tGTPL", "param ${1:key}=${2:value}"),
                ("container\tGTPL", "container ${1:key}=${2:value}"),
                ("meta\tGTPL", "meta ${1:key}=${2:value}"),
                ("ifempty\tGTPL", "ifempty"),
                ("cycle\tGTPL", "cycle ${1:list}"),
                ("ldelim\tGTPL", "ldelim"),
                ("rdelim\tGTPL", "rdelim"),
                ("literal\tGTPL", "literal}\n\t${2:$SELECTION}\n{/literal")
                ])
        elif ch_close == '{/':
                return ([
                ("if\tGTPL Close", "if"),
                ("foreach\tGTPL Close", "foreach"),
                ("template\tGTPL Close", "template"),
                ("Call\tGTPL Close", "Call"),
                ("Yield\tGTPL Close", "Yield"),
                ("literal\tGTPL Close", "literal"),
                ], sublime.INHIBIT_WORD_COMPLETIONS| sublime.INHIBIT_EXPLICIT_COMPLETIONS)
        elif ch == '<':
                if not view.match_selector(locations[0],"meta.gtpl.template - meta.gtpl.tag,entity.tag.gtpl"): 
                        return []
                return ([
                ("a\tTag", "a href=\"$1\">$2</a>"),
                ("abbr\tTag", "abbr>$1</abbr>"),
                ("acronym\tTag", "acronym>$1</acronym>"),
                ("address\tTag", "address>$1</address>"),
                ("applet\tTag", "applet>$1</applet>"),
                ("area\tTag", "area>$1</area>"),
                ("b\tTag", "b>$1</b>"),
                ("base\tTag", "base>$1</base>"),
                ("big\tTag", "big>$1</big>"),
                ("blockquote\tTag", "blockquote>$1</blockquote>"),
                ("body\tTag", "body>$1</body>"),
                ("button\tTag", "button>$1</button>"),
                ("center\tTag", "center>$1</center>"),
                ("caption\tTag", "caption>$1</caption>"),
                ("cdata\tTag", "cdata>$1</cdata>"),
                ("cite\tTag", "cite>$1</cite>"),
                ("col\tTag", "col>$1</col>"),
                ("colgroup\tTag", "colgroup>$1</colgroup>"),
                ("code\tTag", "code>$1</code>"),
                ("div\tTag", "div>$1</div>"),
                ("dd\tTag", "dd>$1</dd>"),
                ("del\tTag", "del>$1</del>"),
                ("dfn\tTag", "dfn>$1</dfn>"),
                ("dl\tTag", "dl>$1</dl>"),
                ("dt\tTag", "dt>$1</dt>"),
                ("em\tTag", "em>$1</em>"),
                ("fieldset\tTag", "fieldset>$1</fieldset>"),
                ("font\tTag", "font>$1</font>"),
                ("form\tTag", "form>$1</form>"),
                ("frame\tTag", "frame>$1</frame>"),
                ("frameset\tTag", "frameset>$1</frameset>"),
                ("head\tTag", "head>$1</head>"),
                ("h1\tTag", "h1>$1</h1>"),
                ("h2\tTag", "h2>$1</h2>"),
                ("h3\tTag", "h3>$1</h3>"),
                ("h4\tTag", "h4>$1</h4>"),
                ("h5\tTag", "h5>$1</h5>"),
                ("h6\tTag", "h6>$1</h6>"),
                ("i\tTag", "i>$1</i>"),
                ("iframe\tTag", "iframe src=\"$1\"></iframe>"),
                ("ins\tTag", "ins>$1</ins>"),
                ("kbd\tTag", "kbd>$1</kbd>"),
                ("li\tTag", "li>$1</li>"),
                ("label\tTag", "label>$1</label>"),
                ("legend\tTag", "legend>$1</legend>"),
                ("link\tTag", "link rel=\"stylesheet\" type=\"text/css\" href=\"$1\">"),
                ("map\tTag", "map>$1</map>"),
                ("noframes\tTag", "noframes>$1</noframes>"),
                ("object\tTag", "object>$1</object>"),
                ("ol\tTag", "ol>$1</ol>"),
                ("optgroup\tTag", "optgroup>$1</optgroup>"),
                ("option\tTag", "option>$0</option>"),
                ("p\tTag", "p>$1</p>"),
                ("pre\tTag", "pre>$1</pre>"),
                ("span\tTag", "span>$1</span>"),
                ("samp\tTag", "samp>$1</samp>"),
                ("script\tTag", "script type=\"${1:text/javascript}\">$0</script>"),
                ("style\tTag", "style type=\"${1:text/css}\">$0</style>"),
                ("select\tTag", "select>$1</select>"),
                ("small\tTag", "small>$1</small>"),
                ("strong\tTag", "strong>$1</strong>"),
                ("sub\tTag", "sub>$1</sub>"),
                ("sup\tTag", "sup>$1</sup>"),
                ("table\tTag", "table>$1</table>"),
                ("tbody\tTag", "tbody>$1</tbody>"),
                ("td\tTag", "td>$1</td>"),
                ("textarea\tTag", "textarea>$1</textarea>"),
                ("tfoot\tTag", "tfoot>$1</tfoot>"),
                ("th\tTag", "th>$1</th>"),
                ("thead\tTag", "thead>$1</thead>"),
                ("title\tTag", "title>$1</title>"),
                ("tr\tTag", "tr>$1</tr>"),
                ("tt\tTag", "tt>$1</tt>"),
                ("u\tTag", "u>$1</u>"),
                ("ul\tTag", "ul>$1</ul>"),
                ("var\tTag", "var>$1</var>"),      
                ("br\tTag", "br/>"),
                ("embed\tTag", "embed>"),
                ("hr\tTag", "hr/>"),
                ("img\tTag", "img src=\"$1\"/>"),
                ("input\tTag", "input/>"),
                ("meta\tTag", "meta />"),
                ("param\tTag", "param name=\"$1\" value=\"$2\" />"),             
                ("article\tTag", "article>$1</article>"),
                ("aside\tTag", "aside>$1</aside>"),
                ("audio\tTag", "audio>$1</audio>"),
                ("canvas\tTag", "canvas>$1</canvas>"),
                ("footer\tTag", "footer>$1</footer>"),
                ("header\tTag", "header>$1</header>"),
                ("nav\tTag", "nav>$1</nav>"),
                ("section\tTag", "section>$1</section>"),
                ("video\tTag", "video>$1</video>")
                ], sublime.INHIBIT_WORD_COMPLETIONS | sublime.INHIBIT_EXPLICIT_COMPLETIONS)
        else:
                return []

