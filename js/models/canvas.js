define([
	"jquery-ui", 
	"jquery.draggable"
], function($) {

	var Canvas = {};
	var Editor;

	Canvas.initialize = function(namespace) {
		Editor = namespace;

		// Selection movement
		$("#canvas").on("mousedown mousemove", function(e) {

			// Tileset hasn't loaded yet
			if (!Editor.active_tileset) { return; }

			var tileset = Editor.active_tileset,
		        tw = tileset.tilesize.width,
		        th = tileset.tilesize.height;

			    offset = $("#canvas").offset(),
			    x = Math.floor((e.pageX - offset.left) / tw),
			    y = Math.floor((e.pageY - offset.top) / th);

			$("#canvas").find(".selection").css({
				top: y * th,
				left: x * tw
			});

			Canvas.cursor = [x, y];
			if (((e.type == "mousedown" && e.which == 1) || Editor.mousedown) && Editor.selection) { Canvas.draw(); }

		});

		$("#canvas").draggable({
			mouseButton: 3,
			cursor: "move"
		});

		this.reposition();
		$("#canvas").fadeIn();
		$(window).on("resize", this.reposition);

		return this;
	};

	Canvas.draw = function() {
		var tileset = Editor.active_tileset,
		    layer = Editor.Layers.get_active(),

		    cx = this.cursor[0],
		    cy = this.cursor[1],

		    tw = tileset.tilesize.width,
		    th = tileset.tilesize.height,

		    sx = Editor.selection[0][0] / tw,
		    sy = Editor.selection[0][1] / th,
		    ex = Editor.selection[1][0] / tw,
		    ey = Editor.selection[1][1] / th,

		    lx = ex-sx,
		    ly = ey-sy,

		    bgx = parseInt($("#canvas").find(".selection").css("background-position").split(" ")[0], 10),
		    bgy = parseInt($("#canvas").find(".selection").css("background-position").split(" ")[1], 10),

		    pos_x, pos_y, coords,
		    $div, exists, x, y, query;

		if (!$(layer.elem).attr("data-tileset")) {
			$(layer.elem).addClass("ts_" + tileset.id);
			$(layer.elem).attr("data-tileset", tileset.name);
		} else if ($(layer.elem).attr("data-tileset") != tileset.name) {
			if (!$("#canvas").find(".warning:visible").length)
			{ $("#canvas").find(".warning").html("Cannot use different tilesets on one layer, please clear the layer first.").show().delay(2000).fadeOut(1000); }
			return;
		}

		// Iterate through the selection
		for (y = 0; y <= ly; y++) {
			for (x = 0; x <= lx; x++) {

				pos_x = cx + x;
				pos_y = cy + y;

				coords = pos_x + "." + pos_y;

				query = $(layer.elem).find("div[data-coords='" + coords + "']");
				$div = query.length ? query : $("<div>").css({
					position: "absolute",
					left: pos_x * tw,
					top: pos_y * th
				})

				.attr("data-coords", coords)
				.attr("data-coords-tileset", (Math.abs(bgx/tw)+x) + "." + (Math.abs(bgy/th)+y));

				$div.css("background-position", (bgx-(x*tw)) + "px" + " " + (bgy-(y*th)) + "px");
				$(layer.elem).append($div);
			}
		}
	};

	Canvas.reposition = function(e) {
		var extra = $("#toolbar").width() + $("#canvas").width() < $(window).width() ? $("#toolbar").width() / 2 : 0;
		var left = ($(window).width() / 2) - ($("#canvas").width() / 2) + extra;
		var top = ($(window).height() / 2) - ($("#canvas").height() / 2);

		$("#canvas").css({ top: top, left: left });
	};

	Canvas.update_grid = function() {
		var buffer = document.createElement("canvas");
		    bfr = buffer.getContext("2d"),
		    tileset = Editor.active_tileset,
		    tw = tileset.tilesize.width,
		    th = tileset.tilesize.height;

		buffer.width = tw;
		buffer.height = th;

		bfr.fillStyle = "rgba(0, 0, 0, 0.1)";
		bfr.fillRect(0, th-1, tw, 1);
		bfr.fillRect(tw-1, 0, 1, th);

		$("#canvas").css("backgroundImage", "url(" + buffer.toDataURL() + ")");
		$("#canvas").find(".selection").css("width", tw);
		$("#canvas").find(".selection").css("height", th);
	};

	return Canvas;
});