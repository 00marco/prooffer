/**
 * @license Copyright (c) 2003-2012, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */
 
 CKEDITOR.on( 'instanceReady', function( ev )
{
	var writer = ev.editor.dataProcessor.writer; 
	// The character sequence to use for every indentation step.
	writer.indentationChars = '    ';
 
	var dtd = CKEDITOR.dtd;
	// Elements taken as an example are: block-level elements (div or p), list items (li, dd), and table elements (td, tbody).
	for ( var e in CKEDITOR.tools.extend( {}, dtd.$block, dtd.$listItem, dtd.$tableContent ) )
	{
		ev.editor.dataProcessor.writer.setRules( e, {
			// Indicates that an element creates indentation on line breaks that it contains.
			indent : false,
			// Inserts a line break before a tag.
			breakBeforeOpen : true,
			// Inserts a line break after a tag.
			breakAfterOpen : false,
			// Inserts a line break before the closing tag.
			breakBeforeClose : false,
			// Inserts a line break after the closing tag.
			breakAfterClose : true
		});
	}
 
	for ( var e in CKEDITOR.tools.extend( {}, dtd.$list, dtd.$listItem, dtd.$tableContent ) )
	{
		ev.editor.dataProcessor.writer.setRules( e, {			
			indent : true,
		});
	}
 
	// You can also apply the rules to a single element.
	ev.editor.dataProcessor.writer.setRules( 'table',
	{ 		
		indent : true
	});	
 
	ev.editor.dataProcessor.writer.setRules( 'form',
	{ 		
		indent : true
	});		
});

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here.
	// For the complete reference:
	// http://docs.ckeditor.com/#!/api/CKEDITOR.config

	// The toolbar groups arrangement, optimized for two toolbar rows.
	config.toolbarGroups = [
		{ name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
		{ name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
		{ name: 'links' },
		{ name: 'insert' },
		{ name: 'forms' },
		{ name: 'tools' },
		{ name: 'document',	   groups: [ 'mode', 'document', 'doctools' ] },
		{ name: 'others' },
		'/',
		{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
		{ name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
		{ name: 'styles' },
		{ name: 'colors' },
		{ name: 'about' }
	];

	// Remove some buttons, provided by the standard plugins, which we don't
	// need to have in the Standard(s) toolbar.
	config.removeButtons = 'Underline,Subscript,Superscript';
    //config.forcePasteAsPlainText = true;
	//config.uiColor = '#AADC6E';
	config.enterMode = CKEDITOR.ENTER_DIV;
	config.height = 500;
	config.font_names = 'Calibri;Arial;Times New Roman;Verdana';
};
