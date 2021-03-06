define(["jquery-ui"], function($) {

	var Menubar = {}, Editor;

	Menubar.initialize = function(namespace) {

		Editor = namespace;
		
		$("*[data-template]").on("click", this.open_dialog);
		$("*[data-toggle]").on("click", this.toggle);

		$("body").on("keydown keyup", "#canvas_settings input", this.canvas_settings);
		$("body").on("keydown keyup", "#viewport_settings input", this.viewport_settings);
		return this;
	};

	Menubar.open_dialog = function(e) {
		var template = $(e.currentTarget).attr("data-template"),
		    title = $(e.currentTarget).text();

		$.get("templates/" + template + ".tpl", function(data) {

			$("#dialog").html(data).dialog({
				title: title, modal: true,
				closeText: "<span class='icon-remove-sign'></span>",
				resizable: false,
				width: "auto"
			});

			$("#dialog").find("input[data-value]").each(function() {
				var pair = $(this).attr("data-value").split(":"),
				    type = $(this).attr("type"),
				    value = $(pair[0]).css(pair[1]);

				if (type == "number") { value = parseInt(value, 10); }
				if (pair[2] == "tiles") { value = Math.floor(value / Editor.active_tileset.tilesize[pair[1]]); }
				$(this).val(value);
			});
		});
	};

	Menubar.toggle = function(e) {
		var value = $(e.currentTarget).attr("data-toggle"),
			extra = value.split(":"), status;

		if (extra[0] == "visibility") {
			status = $(extra[1]).toggle();
			$(e.currentTarget).find("span").toggleClass("icon-check-empty", "icon-check");
		} else if (extra[0] == "class") {
			status = $(extra[2]).toggleClass(extra[1]);
			$(e.currentTarget).find("span").toggleClass("icon-check-empty", "icon-check");
		} else {
			Menubar.toggleFunctions[value]();
		}
	};

	Menubar.canvas_settings = function(e) {
		var name = $(e.currentTarget).attr("name"),
		    value = $(e.currentTarget).val(),
		    tileset = Editor.active_tileset;

		if (name == "width") { value = (+value) * tileset.tilesize.width; }
		if (name == "height") { value = (+value) * tileset.tilesize.height; }

		$("#canvas").css(name, value);
		Editor.Canvas.reposition();
	};

	Menubar.viewport_settings = function(e) {
		var name = $(e.currentTarget).attr("name"),
		    value = +$(e.currentTarget).val();

		$("#viewport").css(name, value);
		Editor.Canvas.reposition();
	};

	Menubar.toggleFunctions = {
	};

	return Menubar;
});