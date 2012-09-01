## GTPL - Cheat Sheet


JSON for all demos
```
{
	"title": "Hello World",
	"id": 333,
	"comments": [
		{
			"text": "Lorem Ipsum",
			"free": true
		},
		{
			"text": "999"
		}
	]
}
```

## Comments
```
{* I’m a gtpl comment *}
<!-- I’m a standard html comment and I will be part of the output -->
```

## template
```
{template Test}
	{* A template in the top namespace *}
{/template}

{template MyNamespace.MySubNamespace.FooBar}
	{* 
	 * A template in namespace "MyNamespace.MySubNamespace". 
	 * Templates can’t be namespaces at the same time 
	 *}
{/template}
```

## namespace
```
{namespace MyNamespace.MySubNamespace}

{template .FooBar}
	{*
	 * !! This is a short form to improve readability!
	 * Each time a template name starts with a dot, the first
	 * preceeding namespace declaration is added to its name. 
	 *}
{/template}
```

## eval Nodes
```
{template Example}
	{_} 		{* Local Root Node  *}
	{_ctx} 	  	{* Global Root Node *}
	{_p.foo}	{* Parameter "foo"  *}
	{link_to(_)}    {* Registered helper function *} 

	{_.comments.filter(item('free'))}  {* evalNodes contain side-effect free, javascript *}

	{_.comments && _.comments[0].text || ‘no comment’} {* "&&" and "||" can be useful *}

{/template}
```

## call
```
{namespace DemoCall}

{template .Start}

	{_.title}       {* "Hello World" *}
	{_ctx.title}    {* "Hello World" *}

	{call DemoCall.Two root=_.comment[0]}

{/template}

{template .Two}

	{_.text}        {* "Lorem Ipsum" (New local root) *}
	{_ctx.title}    {* "Hello World"                  *}
{/template}

{template .MoreCallExamples}
	{call .Two root=_.comment[0]}   {* Namespace Rules also apply to calls *}
	{call .Three}                   {* Dosn’t change local root. Same as "root=_" *}
{/template}
```

## param
```
{template DemoParam}
	{param foo="bar"}                {* _p.foo == "bar" *}
	{param name=_.name || "noname"}	 {* RHS is javascript *}
{/template}
```

## call & params

This shows the semanitcs of calls in combination with params.
```
{template DemoParam2}
	{param foo=’bar’}
	{_p.foo}          {* "bar" *}

	{call Two}

	{_p.foo}          {* "bar" (param not changed here) *}

{/template}

{template Two}

	{_p.foo}            {* "bar" !!params are propagated *}
	{param foo="blub"}
	{_p.foo}            {* "blub" !!params changed locally*}
	
{/template}
```

## Call & param

Call (with capital "C") expects a closing statement {/Call}. One can specify  params and containers in its body which are padded to the called template.
```
{template DemoCall2}

	{Call Two}
		{param foo="bar"}
	{/Call}

	{_p.foo || "not set"}    {* "not set". params in Call bodies are only defined the called template *}

{/template}

{template Two}
	{_p.foo}   {* "bar" *}
{/template}
```

## if
```
{template DemoIf}
	{if _.title == "yodel"}  {* This is a javascript expression *}
		Hollaruethi
	{elseif _.id == 222}
		Small ID
	{elseif _.comments.length > 10}
		Many comments
	{else}
		Hello World
	{/if}
{/template}
```

## foreach
```
{template DemoForeach}
	{foreach comment in _.comments}
		{comment.text}      {* comment is defined in foreach*}
		{comment$first}     {* true on first item *}
		{comment$last}      {* true on last item *}
		{comment$index}     {* position in list,starting with 0*}
		{comment$length}    {* length of list *}
		{comment$list}      {* list itself *}

		{break}             {* stops looping *}
		{continue}          {* continues with next list item *}

		{cycle ["black", "white", "red"]}   {*evals to "black","white","red","black",...on each loop *}

	{ifempty}               {* optional *}
		No Comments
	{/foreach}
{/template}
```

## yield

A special form of "call", uses template containers instead of template names.
```
{template DemoYield}
	{foreach comment in _.comments}

		{Call GenericBox root=comment}
			{container GENERICBOXCONTENT = MyComment}  {* set GENERICBOXCONTENT to template "MyComment" *}
		{/Call}
	
	{/foreach}
{/template}

{template GenericBox}
	{* This template doesn’t know anything about comments *}

	<div class="box">

	 	{*
	 	 * Calls template in container GENERICBOXCONTENTS. 
	 	 * In this example, it is set to MyComment 
	 	 *}
		{yield GENERICBOXCONTENT}

	</div>
{/template}

{template MyComment}
	{_.text}
{/template}
```

## yield & fallback
fallback deals with undefined containers
```
{template GenericBox}
	<div class="box">
		
		{* 
		 * In case GENERICBOXCONTENT was not set, EmptyBox will be called.
		 *}
		{yield GENERICBOXCONTENT fallback=EmptyBox root=_}


		{yield ANNOTATION fallback=noop}   {* noop: nothing will be called *}

	</div>
{/template}

{template EmptyBox}
	No Content
{/template}
```

## Yield
Yield has a captial-form, too. Use it in the same way as Call to pass new params or containers.

```
{template GenericBox}
	{Yield GENERICBOXCONTENT}
		{param called_from="box"}
		{container SPECIAL=SpecialContent}
	{/Yield}
{/template}
```

## Container
Container (with capital "C") defines an inline template. Some special variables are available.
```
{template DemoYield2}
	{param foo="bar"}

	{foreach comment in _.comments}
		{Call GenericBox root=comment}
			{Container GENERICBOXCONTENT}
				{comment.text}  {* is still defined here *}
				{_.name}        {* local root is not changed *}
				{_y.text}       {* holds new local root of yield-call *}
				{_p.foo}        {* "bar"  *}
				{_yp.foo}       {* "blub" *}
			{/Container}
		{/Call}
	{/foreach}
{/template}

{template GenericBox}
	<div class="box">

		{Yield GENERICBOXCONTENT root=_}
			{param foo="blub"}
		{/Yield}

	</div>
{/template}
```

## meta
This statement adds meta information to the compiled template, which can be evaluated by custom plugins.

```
{template DemoMeta}
	{meta description="this is an example template for meta"}
	{meta export_template=false}
{/template}
```
