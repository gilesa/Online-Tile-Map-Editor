define([
	"jquery-ui",
	"views/tileset_view"
], function($, TilesetView) {

	var Tilesets = {}, Editor;
	Tilesets.collection = {};

	Tilesets.initialize = function(namespace) {

		Editor = namespace;
		this.view = TilesetView.initialize(Editor);

		// this.add("img/tilesets/forest_tiles.png", {
		// 	tilesize: { width: 16, height: 16 },
		// 	alpha: [255, 0, 255]
		// });

		// this.add("img/tilesets/margin.png", {
		// 	tilesize: { width: 64, height: 64 },
		// 	margin: 4
		// });

		this.add("img/tilesets/mage_city.png", {
			tilesize: { width: 32, height: 32 }
		});

		return this;
	};

	Tilesets.set = function(name) {

		var tileset = Tilesets.collection[name];
		Editor.active_tileset = tileset;

		$("#tileset_container").css({
			width: tileset.width,
			height: tileset.height,
		}).attr("class", "ts_" + tileset.id);

		$("#tilesets").find("select").val(name);
		$("#tilesets").find(".loading").remove();
		this.update_selection();
	}

	Tilesets.add = function(src, opts) {

		var img = new Image(),
		    bfr = document.createElement("canvas").getContext("2d"),
		    name = opts.name || src.match(/(?:.+)\/([^\/]+)/)[1],
		    style = style = document.createElement("style"),
		    id = name.replace(/[^a-zA-Z]/g, '_'), css;

		img.src = src;
		img.addEventListener("load", function() {

			bfr.canvas.width = opts.width = this.width;
			bfr.canvas.height = opts.height = this.height;


			if (opts.alpha) { opts.base64 = Tilesets.setAlpha(this, opts.alpha); }
			if (opts.margin) { opts.base64 = Tilesets.slice(this, opts); }

			if (!opts.alpha && !opts.margin) {
				bfr.drawImage(this, 0, 0);
				opts.base64 = bfr.canvas.toDataURL();
			}

			opts.id = id;
			opts.name = name;

			Tilesets.collection[name] = opts;
			Tilesets.set(name);

			$(style).attr("id", "tileset_" + id);

			css = ".ts_" + id + ", .ts_" + id + " > div {\n";
			css += "\twidth: " + opts.tilesize.width + "px;\n";
			css += "\theight: " + opts.tilesize.height + "px;\n";
			css += "\tbackground-image: url('" + opts.base64 + "');\n";
			css += "}";

			$(style).append(css);
			$("head").append(style);
			$("#tilesets").find("select").append("<option>" + name + "</option>");
			$("#tilesets").find("select").val(name);
			$("#tileset").jScrollPane();
			Editor.Canvas.update_grid();

		}, false);
	};

	// Filters specified color and makes it transparent
	Tilesets.setAlpha = function(img, alpha) {
		var bfr = document.createElement("canvas").getContext("2d"),
		    imgData, red, i, l;

		bfr.canvas.width = img.width;
		bfr.canvas.height = img.height;
		bfr.drawImage(img, 0, 0);

		imgData = bfr.getImageData(0, 0, img.width, img.height);
		tolerance = 10;

		for (i = 0, l = imgData.data.length; i < l; i++) {
			red = i%4 == 0 ? true : false;

			if (red) {
				if (
					imgData.data[i] >= alpha[0]-tolerance && imgData.data[i] <= alpha[0]+tolerance &&
					imgData.data[i+1] >= alpha[1]-tolerance && imgData.data[i+1] <= alpha[1]+tolerance &&
					imgData.data[i+2] >= alpha[2]-tolerance && imgData.data[i+2] <= alpha[2]+tolerance

				) {
					imgData.data[i+3] = 0;
				}
			}
		}

		bfr.clearRect(0, 0, img.width, img.height);
		bfr.putImageData(imgData, 0, 0);
		return bfr.canvas.toDataURL();
	};

	// Slices the tileset according to tile size and margin
	Tilesets.slice = function(img, opts) {

		var bfr = document.createElement("canvas").getContext("2d"),
		    tw = opts.tilesize.width,
		    th = opts.tilesize.height,
		    imgData, red,
		    x, y, xl, yl,
		    m = opts.margin;

		bfr.canvas.width = img.width - (img.width/tw)*opts.margin;
		bfr.canvas.height = img.height - (img.height/th)*opts.margin;

		for (y = 0, ly = Math.floor(bfr.canvas.height / th); y < ly; y++) {
			for (x = 0, lx = Math.floor(bfr.canvas.width / tw); x < lx; x++) {
				bfr.drawImage(
					img,

					(x * (tw+m)) + m,
					(y * (th+m)) + m,

					tw, th,

					x*tw,
					y*th,
					tw, th
				);
			}
		}

		return bfr.canvas.toDataURL();
	};

	Tilesets.update_selection = function() {
		$("#canvas").find(".selection").attr("class", "selection");
		$("#tileset").find(".selection").remove();
		Editor.selection = null;
	};


	Tilesets.get_active = function() { return Tilesets.collection[$("#tilesets").find("option:selected").val()]; }

	return Tilesets;
});