const PLAYER_TILE_SCALE = 0.8;

function getMinMaxIndecesOfArray(array) {
	var min = undefined;
	var max = undefined;
	var keys = Object.keys(array);

	for (i in Object.keys(array)) {
		if (min == undefined || parseFloat(keys[i]) < min) {
			min = parseFloat(keys[i]);
		}
		if (max == undefined || parseFloat(keys[i]) > max) {
			max = parseFloat(keys[i]);
		}
    }
    return [min, max];
}

function getSortedFloatKeysOfArray(array) {
    var keys = Object.keys(array);
    var output = []
    for (var key in keys) {
        output.push(parseFloat(keys[key]));
    }
    output.sort();
    return output;
}

class Level {
    constructor(total_width, total_height, border_size, tile_angle, diagonal_to_horizontal_ratio, bridge_to_tile_ratio, bridge_depth_to_bridge_width_ratio) {
        Object.assign(this, { total_width, total_height, border_size, tile_angle, diagonal_to_horizontal_ratio, bridge_to_tile_ratio, bridge_depth_to_bridge_width_ratio });

        this.tiles = {};
        this.bridges = {};

        this.player = new Player(true, "bababooey");
        this.player.x = 0;
        this.player.y = 0;
    };

    // beginLevel(startX, startY) {
    //     this.player.moveToLocation(startX, startY);
    // }

    addTile(x, y, tile) {
        if (!this.tiles[x]) {
            this.tiles[x] = {};
        }
        if (this.tiles[x][y]) {
            throw "tile already there";
        }
        this.tiles[x][y] = tile;
    }

    removeTile(x, y) {
        this.tiles[x][y] = undefined;
    }

    getTile(x, y) {
        return this.tiles[x][y];
    }

    addBridge(x1, y1, x2, y2, bridge) {
        var tile1 = getTile(x1, y1);
        var tile2 = getTile(x2, y2);
        if (!tile1 || !tile2) {
            throw "Tile(s) does not exist";
        }
        var bridgeX = (x1 + x2) / 2;
        var bridgeY = (y1 + y2) / 2;
        if (this.bridges[bridgeX][bridgeY]) {
            throw "bridge already there";
        }
        this.bridges[bridgeX][bridgeY] = bridge;
    }

    removeBridge(x1, y1, x2, y2) {
        var bridgeX = (x1 + x2) / 2;
        var bridgeY = (y1 + y2) / 2;
        this.bridges[bridgeX][bridgeY] = undefined;
    }

    getBridge(x1, y1, x2, y2) {
        var bridgeX = (x1 + x2) / 2;
        var bridgeY = (y1 + y2) / 2;
        return this.bridges[bridgeX][bridgeY];
    }

    getXMin() {
        if (!this.xMin) {
            this.__bakePixelSizing();
        }
        return this.xMin;
    }

    getYMin() {
        if (!this.yMin) {
            this.__bakePixelSizing();
        }
        return this.yMin;
    }
    getBorder_size() {
        if (!this.border_size) {
            this.__bakePixelSizing();
        }
        return this.border_size;
    }
    getBridge_to_tile_ratio() {
        if (!this.bridge_to_tile_ratio) {
            this.__bakePixelSizing();
        }
        return this.bridge_to_tile_ratio;
    }
    getXCenterOffset() {
        if (!this.xCenterOffset) {
            this.__bakePixelSizing();
        }
        return this.xCenterOffset;
    }
    getTileWidth() {
        if (!this.tileWidth) {
            this.__bakePixelSizing();
        }
        return this.tileWidth;
    }
    getYMax() {
        if (!this.yMax) {
            this.__bakePixelSizing();
        }
        return this.yMax;
    }
    getTileHorizontalOverhang() {
        if (!this.tileHorizontalOverhang) {
            this.__bakePixelSizing();
        }
        return this.tileHorizontalOverhang;
    }
    getYCenterOffset() {
        if (!this.yCenterOffset) {
            this.__bakePixelSizing();
        }
        return this.yCenterOffset;
    }
    getTileHeight() {
        if (!this.tileHeight) {
            this.__bakePixelSizing();
        }
        return this.tileHeight;
    }

    __bakePixelSizing() {
        // Find the dimensions of the level
        var [xMin, xMax] = getMinMaxIndecesOfArray(this.tiles);
        var yMin = undefined;
        var yMax = undefined;
        for (var row in this.tiles) {
            var [currYMin, currYMax] = getMinMaxIndecesOfArray(this.tiles[row]);

            if (yMin == undefined || currYMin < yMin) {
                yMin = currYMin;
            }
            if (yMax == undefined || currYMax > yMax) {
                yMax = currYMax;
            }
        }
        this.xMax = xMax;
        this.xMin = xMin;
        this.yMax = yMax;
        this.yMin = yMin;
        var tilesWide = this.xMax - this.xMin + 1;
        var tilesHigh = this.yMax - this.yMin + 1;

        // Find maximum possible tile size that could fit the number of tiles needed
        var usuableWidth = this.total_width - this.border_size * 2;
        var usuableHeight = this.total_height - this.border_size * 2;
        
        // overhang tile width to horizontal tile width ratio
        var othr = this.diagonal_to_horizontal_ratio * Math.cos(this.tile_angle);
        // vertical tile height to horizontal tile height ratio
        var vthr = this.diagonal_to_horizontal_ratio * Math.sin(this.tile_angle);

        var tileWidthsWide = (tilesWide + (tilesWide - 1) * this.bridge_to_tile_ratio
        + tilesHigh * othr + (tilesHigh - 1) * this.bridge_to_tile_ratio * othr);
        var tileheightsTall = (tilesHigh * vthr + (tilesHigh - 1) * vthr * this.bridge_to_tile_ratio);
        var maxWidthHortizontal = usuableWidth / tileWidthsWide
        var maxWidthVertical = usuableHeight / tileheightsTall

        // Picks the smaller maximum tile size and sets the tile width and height
        var tileSize = Math.min(maxWidthHortizontal, maxWidthVertical);

        var usedWidth = tileSize * tileWidthsWide
        var usedHeight = tileSize * tileheightsTall

        this.tileWidth = tileSize;
        this.tileHeight = tileSize * vthr;
        this.tileHorizontalOverhang = tileSize * othr;
        this.xCenterOffset = (usuableWidth - usedWidth) / 2
        this.yCenterOffset = (usuableHeight - usedHeight) / 2

    }

    draw(ctx) {
        this.draw2(ctx)
    }

    // tile_angle should be in radians
    draw2(ctx) {
        if (!this.xMax || !this.xMin || !this.yMax || !this.yMin || !this.tileWidth || !this.tileHeight || !this.xCenterOffset || !this.yCenterOffset || !this.tileHorizontalOverhang) {
            this.__bakePixelSizing();
        }

        // Iterate over every tile
        var rowKeys = getSortedFloatKeysOfArray(this.tiles);
        for (var i in rowKeys) {
            var x = rowKeys[i];
            var columnKeys = getSortedFloatKeysOfArray(this.tiles[x]);
            for (var j in columnKeys) {
                var y = columnKeys[j];

                // Get tile
                var tile = this.tiles[x][y]

                // Get x, y, and width and height of image to draw
                var xOff = x - this.xMin;
                var yOff = y - this.yMin;
                var xPixel = this.border_size + this.xCenterOffset + xOff * (this.tileWidth + this.tileWidth * this.bridge_to_tile_ratio)
                                     + (this.yMax - y) * (this.tileHorizontalOverhang + this.tileHorizontalOverhang * this.bridge_to_tile_ratio);
                var yPixel = this.border_size + this.yCenterOffset + yOff * (this.tileHeight + this.tileHeight * this.bridge_to_tile_ratio);
                var xWidth = this.tileWidth + this.tileHorizontalOverhang;
                var yHeight = this.tileHeight;

                // console.log("this.xMax");
                // console.log(this.xMax);
                // console.log("this.xMin");
                // console.log(this.xMin);
                // console.log("this.yMin");
                // console.log(this.yMin);
                // console.log("this.yMax");
                // console.log(this.yMax);
                // console.log("this.tileWidth");
                // console.log(this.tileWidth);
                // console.log("this.tileHeight");
                // console.log(this.tileHeight);
                // console.log("!this.tileHorizontalOverhang");
                // console.log(!this.tileHorizontalOverhang);
                // console.log("x");
                // console.log(x);
                // console.log("y");
                // console.log(y);
                // console.log("xOff");
                // console.log(xOff);
                // console.log("yOff");
                // console.log(yOff);
                // console.log("xPixel");
                // console.log(xPixel);
                // console.log("yPixel");
                // console.log(yPixel);
                // console.log("xWidth");
                // console.log(xWidth);
                // console.log("yHeight");
                // console.log(yHeight);

                // Draw image
                tile.draw(ctx, xPixel, yPixel, xWidth, yHeight, this, x, y);
            }
        }

        // Iterate over every bridge
        var rowKeys = getSortedFloatKeysOfArray(this.bridges);
        for (var i in rowKeys) {
            var x = rowKeys[i];
            var columnKeys = getSortedFloatKeysOfArray(this.bridges[x]);
            for (var j in columnKeys) {
                var y = columnKeys[j];

                // Get tile
                var bridge = this.bridges[x][y]

                // Get x, y, and width and height of image to draw
                var xOff = x - this.xMin + 0.5;
                var yOff = y - this.yMin + 0.5;

                var imageHeight = this.tileHeight + this.tileWidth * this.bridge_to_tile_ratio * this.bridge_depth_to_bridge_width_ratio;
                
                var xPixel = this.border_size + this.xCenterOffset + xOff * this.tileWidth + (xOff - 1) * this.tileWidth * this.bridge_to_tile_ratio
                                     + (this.yMax - y) * this.tileHorizontalOverhang + (this.yMax - y - 1) * this.tileHorizontalOverhang * this.bridge_to_tile_ratio;
                var yPixel = this.border_size + this.yCenterOffset + yOff * (this.tileHeight + this.tileHeight * this.bridge_to_tile_ratio) - imageHeight;
                var xWidth = this.tileWidth * this.bridge_to_tile_ratio + this.tileHorizontalOverhang;
                var yHeight = imageHeight;

                // Draw image
                bridge.draw(ctx, xPixel, yPixel, xWidth, yHeight, this, x, y);
            }
        }

        var xOff = this.player.x - this.xMin;
        var yOff = this.player.y - this.yMin;
        var xPixel = this.border_size + this.xCenterOffset + xOff * (this.tileWidth + this.tileWidth * this.bridge_to_tile_ratio)
                             + (this.yMax - this.player.y) * (this.tileHorizontalOverhang + this.tileHorizontalOverhang * this.bridge_to_tile_ratio);
        var yPixel = this.border_size + this.yCenterOffset + yOff * (this.tileHeight + this.tileHeight * this.bridge_to_tile_ratio);
        
        var maxSize = this.tileWidth - this.tileHorizontalOverhang;
        var playerSize = maxSize * PLAYER_TILE_SCALE;

        var actualX = xPixel + this.tileHorizontalOverhang + maxSize / 2 - playerSize / 2;
        var actualY = yPixel + this.tileHeight / 2 - playerSize / 2;

        // console.log("xOff");
        // console.log(xOff);
        // console.log("yOff");
        // console.log(yOff);
        // console.log("xPixel");
        // console.log(xPixel);
        // console.log("yPixel");
        // console.log(yPixel);
        // console.log("maxSize");
        // console.log(maxSize);
        // console.log("playerSize");
        // console.log(playerSize);
        // console.log("actualX");
        // console.log(actualX);
        // console.log("actualY");
        // console.log(actualY);

        this.player.draw(ctx, actualX, actualY, playerSize, playerSize, this, this.player.x, this.player.y);

        throw "Stop!"
    }

    update() {}
}

// Abstract Class
class Drawable {
    static palette = [];

    // If no colors is given, then the object does not replalce its color. 
    constructor(imagePath, sx, sy, sw, sh, colors = undefined, pattern = false, colorMode = undefined) {
        Object.assign(this, { imagePath, sx, sy, sw, sh, colors, pattern, colorMode });
        
        var spritesheet = ASSET_MANAGER.getAsset(imagePath);

        this.sprite = document.createElement('canvas');
        this.sprite.width = spritesheet.width;
        this.sprite.height = spritesheet.height;
        var offscreenCtx = this.sprite.getContext('2d');

        offscreenCtx.save();
        offscreenCtx.drawImage(spritesheet, this.sx, this.sy, this.sw, this.sh, 0, 0, spritesheet.width, spritesheet.height);
        offscreenCtx.restore();

        if (colors && !Drawable.palette[imagePath]) {
            Drawable.palette[imagePath] = {};
        }

    };


    tileCoord(tileX, tileY, level) {
        var xOff = tileX - level.getXMin();
        var yOff = tileY - level.getYMin();
        var border_size = level.getBorder_size();
        var bridge_to_tile_ratio = level.getBridge_to_tile_ratio();

        var xPixel = border_size + level.getXCenterOffset() + xOff * (level.getTileWidth() * (1 + bridge_to_tile_ratio))
                                + (level.getYMax() - tileY) * (level.getTileHorizontalOverhang() * (1 + bridge_to_tile_ratio));
        var yPixel = border_size + level.getYCenterOffset() + yOff * (level.getTileHeight() * (1 + bridge_to_tile_ratio));
        
        return [xPixel, yPixel];
    }

    draw(ctx, x, y, width, height, level, tileX, tileY) {
        console.log("calculated pos:");
        console.log(this.tileCoord(tileX, tileY, level));
        console.log("actual pos:");
        console.log([x, y]);
        
        if (this.colors && !Drawable.palette[this.imagePath][JSON.stringify(this.colors)]) {
            // var newColor = getColor(grey, colorMode);  // Forces all to be grey
            var newColor = getColor(this.colors, this.colorMode);

            Drawable.palette[this.imagePath][JSON.stringify(this.colors)] = copyCanvas(this.sprite);
            replaceImageColor(Drawable.palette[this.imagePath][JSON.stringify(this.colors)], newColor, (this.pattern) ? this.colors : false);
        }
        var spriteToDraw = (this.colors) ? Drawable.palette[this.imagePath][JSON.stringify(this.colors)] : this.sprite;

        ctx.drawImage(spriteToDraw, this.sx, this.sy, this.sw, this.sh, x, y, width, height);
        // ctx.drawImage(this.spritesheet, 0, 0, 128, 97, x, y, width, height);
    }
}

class Tile extends Drawable {
    constructor(imagePath, sx, sy, sw, sh) {
        (imagePath != undefined) ? super(imagePath, sx, sy, sw, sh) : super("./sprites/tile.png", 0, 0, 128, 97);
    };

    // @Abstract
    land(player) {
        // Do nothing
    }
}

class Bridge extends Drawable {
    constructor(imagePath, sx, sy, sw, sh) {
        super(imagePath, sx, sy, sw, sh);
    };

    // @Abstract
    attemptPass(player) {
        // Do nothing
    }
}

class ColorBarrier extends Bridge {

    // colors should be an array of color strings
    constructor(imagePath, sx, sy, sw, sh, colors) {
        super(imagePath, sx, sy, sw, sh);
        Object.assign(this, { colors });

    };

    attemptPass(player) {
        passable = true;
        for (color in colors) {
            passable = passable && player.colors[color];
        }
        return passable;
    }

    draw(ctx, x, y) {

    }
}

class KeyGate extends Bridge {

    // colors should be an array of color strings
    constructor(imagePath, sx, sy, sw, sh, keyId) {
        super(imagePath, sx, sy, sw, sh);
        Object.assign(this, { keyId });
        locked = true;
    };

    attemptPass(player) {
        return player.hasKey(this.keyId);
    }

    draw(ctx, x, y) {

    }
}

class ColorPad extends Drawable {

    constructor(color, pattern = false, colorMode = undefined) {
        super("./sprites/tileColorPad.png", 0, 0, 128, 97, color, pattern, colorMode);
    }

    land(player) {
        if (!player.colors["black"]) {
            for (var color in this.color) {
                if (this.color[color]) {
                    player.colors[color] = !player.colors[color];
                }
            }
        }
    }

    // toJSON() {
    //     return {color: this.color, pattern: this.pattern, colorMode: this.colorMode};
    // }
    
    // static from(json) {
    //     return new ColorPad(json.color, json.pattern, json.colorMode);

    // }
}

class Finish extends Drawable {
    constructor(color, pattern = false, colorMode = undefined) {
        super("./sprites/tileFinish.png", 0, 0, 128, 97, color, pattern, colorMode);
    }
}

function copyCanvas(oldCanvas) {
    var sprite = document.createElement('canvas');
    sprite.width = oldCanvas.width;
    sprite.height = oldCanvas.height;
    var offscreenCtx = sprite.getContext('2d');

    offscreenCtx.save();
    offscreenCtx.drawImage(oldCanvas, 0, 0, oldCanvas.width, oldCanvas.height, 0, 0, oldCanvas.width, oldCanvas.height);
    offscreenCtx.restore();

    return sprite;
}