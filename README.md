## GTPL - Grin Template Language

A highlevel javascript template engine

## Basics

**JSON**

```js
var json = {
 "first_name":"John",
 "last_name":"Smith",
 "age":10,
 "friends":["Jamie","Ryan","Gordon"]
};
```
**Template**

 ```
{namespace Example}

{template .Hello}
    <h3>Hello {_.first_name} {_.last_name}</h3>
  
    {if _.age < 12}
        <p>Grow up!</p>
    {/if}

    {foreach friend in _.friends}
        <span>{friend}</span>
    {/foreach}
{/template}
```

**Javascript**

```js
var template_manager = gtpl.create_template_manager();

template_manager.add(template_source);

template_manager.Example.Hello(json);
```

## Why GTPL?

Why another templating library?

* Easy to learn, write, read and debug.
* Truly separates code from content
* Good editor support
* Easy use of helper functions

And it is fast!

## Issues

Have a bug? Please create an issue here on GitHub!

https://github.com/GRINPublishing/GTPL/issues

## Authors

**Matthias Schmeisser**
mjs@grin.com

## License

Copyright 2012 Grin Verlag GmbH.

Licensed under the GNU GENERAL PUBLIC LICENSE, Version 3 http://www.gnu.org/licenses/gpl-3.0