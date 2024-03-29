/**
* Copyright \(c\) 2020-2024, CaffeinatedRat.
* All rights reserved.
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
*     * Redistributions of source code must retain the above copyright
*       notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above copyright
*       notice, this list of conditions and the following disclaimer in the
*       documentation and/or other materials provided with the distribution.
*
* THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY
* EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE AUTHOR AND CONTRIBUTORS BE LIABLE FOR ANY
* DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

//波紋
'use strict';

hamonengine.graphics = hamonengine.graphics || {};
hamonengine.graphics.sprites = hamonengine.graphics.sprites || {};

(function () {

    const SPRITE_ORIENTATION = {
        NORMAL: 0,
        FLIPPED: 1,
        MIRRORED: 2
    };

    /**
     * This class represents a graphical sprite object.
     */
    hamonengine.graphics.sprites.sprite = class {
        constructor(options = {}) {
            //Handle copy-constructor operations.
            if (options instanceof hamonengine.graphics.sprites.sprite) {
                options = {
                    image: options._image && options._image.clone(),
                    dimensions: options._dimensions?.clone(),
                    theta: options.theta
                }
            }

            //Image properties.
            this._name = options.name;
            this._image = options.image || new hamonengine.graphics.imageext();
            this._url = options.url || '';

            //Handle the dimensions different if the image is of type HTMLImageElement
            if (options.dimensions) {
                this._dimensions = options.dimensions;
            }
            else {
                if (this._image instanceof HTMLImageElement) {
                    this._dimensions = new hamonengine.geometry.rect(0, 0, this._image.width, this._image.height);
                }
                else {
                    this._dimensions = new hamonengine.geometry.rect();
                }
            }

            //Transformation variables.
            this._theta = options.theta || 0.0;
            this._scaleVector = new hamonengine.math.vector2(1.0, 1.0);

            this._spriteOrientation = SPRITE_ORIENTATION.NORMAL;
            this._showDiagnosisLines = false;
            this._showFullImage = false;
            this._maxWrapping = 0;

            if (hamonengine.debug && hamonengine.verbose) {
                console.debug(`[hamonengine.graphics.sprites.sprite.constructor] Starting Dimensions: {${this._dimensions.toString()}}`);
                console.debug(`[hamonengine.graphics.sprites.sprite.constructor] Name: '${this._name}'`);
                console.debug(`[hamonengine.graphics.sprites.sprite.constructor] Theta: ${this._theta}`);
                console.debug(`[hamonengine.graphics.sprites.sprite.constructor] ScaleVector: {${this._scaleVector.toString()}}`);
            }
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Gets the sprite's name.
         */
        get name() {
            return this._name;
        }
        /**
         * Sets the sprite's name.
         */
        set name(v) {
            this._name = v;
        }
        /**
         * Returns the sprite's height.
         */
        get height() {
            return this._dimensions.height;
        }
        /**
         * Returns the sprite's width.
         */
        get width() {
            return this._dimensions.width;
        }
        /**
         * Returns the angle of the sprite's rotation in radians.
         */
        get theta() {
            return this._theta;
        }
        /**
         * Returns true if the sprite should show outlines and orientation lines.
         */
        get showDiagnosisLines() {
            return this._showDiagnosisLines;
        }
        /**
         * Enables or disabled the lines that outline the sprite and show its orientation.
         */
        set showDiagnosisLines(v) {
            this._showDiagnosisLines = v;
        }
        /**
         * Returns true if the full image is being shown.
         */
        get showFullImage() {
            return this._showFullImage;
        }
        /**
         * Enables or disabled showing the full image.
         */
        set showFullImage(v) {
            this._showFullImage = v;
        }
        /**
         * Sets the maximum amount of times the sprite can wrap.
         * @param {number} v
         */
        set maxWrapping(v) {
            this._maxWrapping = v;
        }
        /**
         * Returns the internal image data that can either be of the type hamonengine.graphics.imageext or ImageData.
         */
        get image() {
            return this._image;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Copies the properties from another sprite in real-time.
         * Static copying should be done through the constructor.
         * @param {*} properties 
         */
        copyProperties(properties) {
            //Apply any transformations.
            this._theta = properties.theta;
            this._scaleVector = properties._scaleVector;
            this._spriteOrientation = properties._spriteOrientation;
            this._showDiagnosisLines = properties._showDiagnosisLines;
            this._showFullImage = properties._showFullImage;
        }
        /**
         * Makes a clone of the sprite.
         */
        clone() {
            return new hamonengine.graphics.sprites.sprite(this);
        }
        /**
         * Attempts to load the sprite.
         * @param {string} src url of the image.
         * @return {Object} a promise to complete loading.
         */
        async load(src = '') {
            //Handle a pre-existing URL option.
            src = src || this._url;

            if (this._image instanceof hamonengine.graphics.imageext) {
                await this._image.load(src);
                //Update the dimensions based on the image's properties.
                this._dimensions = new hamonengine.geometry.rect(0, 0, this._image.width, this._image.height);
            }

            return this;
        }
        /**
         * Rotates the sprite at the center.
         * NOTE: This method is mutable!
         * @param {number} theta the angle in radians.
         */
        rotate(theta) {
            this._theta = theta || 0.0;
            return this;
        }
        /**
         * Scales the sprite at the top-left corner by the x and y coordinates.
         * NOTE: This method is mutable!
         * @param {number} x coordinate to scale.
         * @param {number} y coordinate to scale.
         */
        scale(x, y) {
            this._scaleVector.x = x;
            this._scaleVector.y = y;
            return this;
        }
        /**
         * Mirrors the sprite at the center.
         * NOTE: This method is mutable!
         * @param {boolean} state (optional) to mirror the object
         */
        mirror(state) {
            this._spriteOrientation = bitflag.toggle(this._spriteOrientation, SPRITE_ORIENTATION.MIRRORED, state);
            return this;
        }
        /**
         * Flips the sprite at the center.
         * NOTE: This method is mutable!
         * @param {boolean} state (optional) to flip the object
         */
        flip(state) {
            this._spriteOrientation = bitflag.toggle(this._spriteOrientation, SPRITE_ORIENTATION.FLIPPED, state);
            return this;
        }
        /**
         * Blends the sprite with the specific color with the specific blending operation.
         * NOTE: This method is mutable!
         * @param {number} r red channel ranging from 0-255.
         * @param {number} g green channel ranging from 0-255.
         * @param {number} b blue channel ranging from 0-255.
         * @param {number} a alpha channel ranging from 0-255.
         * @param {number} blendingOps (BLENDING_OPS) blending operation to perform.
         */
        blendColor(r = 0, g = 0, b = 0, a = 0, blendingOps = BLENDING_OPS.REPLACE) {
            this._image.blendColorRegion(r, g, b, a, this._dimensions, blendingOps);
            return this;
        }
        /**
         * Adjusts the channels for each color.
         * NOTE: This method is mutable!
         * @param {number} r red channel ranging from 0.0-1.0.
         * @param {number} g green channel ranging from 0.0-1.0.
         * @param {number} b blue channel ranging from 0.0-1.0.
         * @param {number} a alpha channel ranging from 0.0-1.0.
         */
        adjustColorChannel(r = 1.0, g = 1.0, b = 1.0, a = 1.0) {
            this._image.adjustColorChannel(r, g, b, a, this._dimensions);
            return this;
        }
        /**
         * Performs a bitblit between two sprites where this is the destination and the source sprite is passed in.
         * NOTE: This method is mutable!
         * @param {*} sprite to bitblit with.
         * @param {number} transparency the intensity of the pixel's transparency. 0.0 - 1.0 where 0 is transparent and 1 is opaque.
         */
        bitblit(sprite, transparency = 1.0) {
            this._image.bitblit(sprite._image, sprite._dimensions, this._dimensions, transparency);
            return this;
        }
        /**
         * Draws the sprite at the specific location with the current width & height.
         * @param {Object} layer to draw upon.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds.
         * @param {number} x coordinate to draw at.
         * @param {number} y cooridnate to draw at.
         * @param {number} width the optional width of the sprite.
         * @param {number} height the option height of the sprite.
         */
        draw(layer, elapsedTimeInMilliseconds, x, y, width = this._dimensions.width, height = this._dimensions.height) {

            //Round x,y coordinates into integers.
            x = Math.bitRound(x);
            y = Math.bitRound(y);

            //NOTE: Inverting the axes requires factoring in the dimensions of the sprite.
            //Only the coordinates are inverted, not the objects or the canvas.

            if (layer.invertYAxis) {
                y = layer.viewPort.height - y - height;
            }

            if (layer.invertXAxis) {
                x = layer.viewPort.width - x - width;
            }

            //Find the center of the sprite.
            const xCenterOffset = Math.bitRound(width / 2) + x;
            const yCenterOffset = Math.bitRound(height / 2) + y;

            //Precalculate the orientation around the x & y axis.
            const yOrientation = bitflag.isSet(this._spriteOrientation, SPRITE_ORIENTATION.FLIPPED) ? -1.0 : 1.0;
            const xOrientation = bitflag.isSet(this._spriteOrientation, SPRITE_ORIENTATION.MIRRORED) ? -1.0 : 1.0;

            //Save the current state.
            layer.save();

            //Scale the sprite.
            if (this._scaleVector.x !== 1 || this._scaleVector.y !== 1) {
                layer.context.translate(x, y);
                layer.context.scale(this._scaleVector.x, this._scaleVector.y);
                layer.context.translate(-x, -y);
            }

            //Handle sprite orientations around the center of the sprite not the origin.
            if (this._spriteOrientation > SPRITE_ORIENTATION.NORMAL) {
                layer.context.translate(xCenterOffset, yCenterOffset);
                layer.context.scale(xOrientation, yOrientation);
                layer.context.translate(-xCenterOffset, -yCenterOffset);
            }

            //Rotate the sprite.
            if (this.theta !== 0.0) {
                layer.context.translate(xCenterOffset, yCenterOffset);
                layer.context.rotate(this.theta);
                layer.context.translate(-xCenterOffset, -yCenterOffset);
            }

            //Sprite wrapping relative to the local sprite's transformation not to world transformations.
            if (layer.wrapHorizontal || layer.wrapVertical) {
                this.__drawSpriteWrapping(layer, elapsedTimeInMilliseconds, x, y, width, height, xOrientation, yOrientation);
            }

            //Draw the main sprite.
            this.__drawRaw(layer, elapsedTimeInMilliseconds, x, y, width, height);

            if (hamonengine.debug && this.showDiagnosisLines) {
                //Find the center of the sprite.
                const xCenterOffset = Math.bitRound(width / 2) + x;
                const yCenterOffset = Math.bitRound(height / 2) + y;

                //Shows the wrapping test pattern.
                if (layer.wrapHorizontal || layer.wrapVertical) {

                    layer.context.strokeStyle = 'red';
                    layer.context.lineWidth = 2;

                    //(X,0)
                    layer.context.beginPath();
                    layer.context.moveTo(xCenterOffset, yCenterOffset);
                    layer.context.lineTo(xCenterOffset + layer.viewPort.width, yCenterOffset);
                    layer.context.stroke();

                    //(-X,0)
                    layer.context.beginPath();
                    layer.context.moveTo(xCenterOffset, yCenterOffset);
                    layer.context.lineTo(xCenterOffset - layer.viewPort.width, yCenterOffset);
                    layer.context.stroke();

                    //(0,Y)
                    layer.context.beginPath();
                    layer.context.moveTo(xCenterOffset, yCenterOffset);
                    layer.context.lineTo(xCenterOffset, yCenterOffset + layer.viewPort.height);
                    layer.context.stroke();

                    //(0,-Y)
                    layer.context.beginPath();
                    layer.context.moveTo(xCenterOffset, yCenterOffset);
                    layer.context.lineTo(xCenterOffset, yCenterOffset - layer.viewPort.height);
                    layer.context.stroke();

                    this.__drawRaw(layer, elapsedTimeInMilliseconds, x + layer.viewPort.width, y, width, height);
                    this.__drawRaw(layer, elapsedTimeInMilliseconds, x - layer.viewPort.width, y, width, height);
                    this.__drawRaw(layer, elapsedTimeInMilliseconds, x, y + layer.viewPort.height, width, height);
                    this.__drawRaw(layer, elapsedTimeInMilliseconds, x, y - layer.viewPort.height, width, height);

                    //Draw the viewport relative to the sprite.
                    layer.context.strokeStyle = 'white';
                    layer.context.strokeRect(xCenterOffset - layer.viewPort.width / 2, yCenterOffset - layer.viewPort.height / 2, layer.viewPort.width, layer.viewPort.height);
                }

                //Show an outline of the sprite.
                layer.context.strokeStyle = 'red';
                layer.context.strokeRect(x, y, width, height);

                //Draw the viewport raw relative to all the transformations.
                layer.context.strokeStyle = 'cyan';
                layer.context.strokeRect(layer.viewPort.x, layer.viewPort.y, layer.viewPort.width, layer.viewPort.height);
            }

            //Restore the previous state.
            layer.restore();
        }
        /**
         * Draws the sprite at the specific location with the current width & height without any transformations applied.
         * @param {Object} layer to draw upon.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         * @param {number} x coordinate to draw at.
         * @param {number} y cooridnate to draw at.
         * @param {number} width the optional width of the sprite to scale.
         * @param {number} height the option height of the sprite to scale.
         */
        __drawRaw(layer, elapsedTimeInMilliseconds, x, y, width = this._dimensions.width, height = this._dimensions.height) {
            if (this._image.complete) {
                if (this.showFullImage) {
                    layer.context.drawImage(this._image.image,
                        //Normalize x & y as integers.
                        Math.bitRound(x),
                        Math.bitRound(y),
                        //Normalize the width & height;
                        Math.bitRound(width),
                        Math.bitRound(height));
                }
                else {
                    layer.drawImage(this._image,
                        this._dimensions.x,
                        this._dimensions.y,
                        this._dimensions.width,
                        this._dimensions.height,
                        //Normalize x & y as integers.
                        Math.bitRound(x),
                        Math.bitRound(y),
                        //Normalize the width & height;
                        Math.bitRound(width),
                        Math.bitRound(height));
                }
            }
        }
        /**
         * Draws & handles the sprite wrapping.  This is more of an internal method.
         * @param {Object} layer to draw upon.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds.
         * @param {number} x coordinate to draw at.
         * @param {number} y cooridnate to draw at.
         * @param {number} width the width of the sprite.
         * @param {number} height the height of the sprite.
         * @param {number} xOrientation the xOrientation of the sprite.
         * @param {number} yOrientation the yOrientation of the sprite.
         */
        __drawSpriteWrapping(layer, elapsedTimeInMilliseconds, x, y, width, height, xOrientation, yOrientation) {
            const cosAngle = Math.cos(-this.theta);
            const sinAngle = Math.sin(-this.theta);

            const widthScaled = width * this._scaleVector.x;
            const heightScaled = height * this._scaleVector.y;

            const wrappingDirection = new hamonengine.math.vector2();
            let v1x, v1y, v2x, v2y;

            //Horizontal wrapping.
            if (layer.wrapHorizontal) {
                //Inversely scale the length to the size of the sprite scaled horizontally relative to its local transformation.
                //For example, if the sprite has been shrunk by half, then the length must be doubled.
                const horizontalLength = layer.viewPort.width / this._scaleVector.x * xOrientation;

                //Rotate and scale the horizontal vector to keep our wrapping sprite on a horizontal plane with canvas not with the rotation plane so it appears at the edges of the screen.
                v1x = Math.bitRound(cosAngle * horizontalLength);
                v1y = Math.bitRound(sinAngle * horizontalLength);

                //NOTE: The additional diff calculation between x & widthScaled is added to handle the additional wrapping loops, without it none of the wrapping loops will work beyond the first.
                if (x - widthScaled <= layer.viewPort.x) {
                    wrappingDirection.x = 1;
                    //Keep wrapping until we reach the max condition.
                    let wrapLoop = Math.abs(parseInt((x - widthScaled) / layer.viewPort.width, 10)) + 1;
                    if (this._maxWrapping === 0 || wrapLoop < this._maxWrapping) {
                        //P1: Draw an orthogonally RIGHT sprite relative to the world transformation [0 radians]
                        this.__drawRaw(layer, elapsedTimeInMilliseconds, x + v1x * wrapLoop, y + v1y * wrapLoop, width, height);
                        //Need to create continuous wrapping, where the sprite occupies both sides of the screen simultaneously.
                        if (--wrapLoop > 0) {
                            this.__drawRaw(layer, elapsedTimeInMilliseconds, x + v1x * wrapLoop, y + v1y * wrapLoop, width, height);
                        }
                    }
                }
                else if (x + widthScaled >= layer.viewPort.width) {
                    wrappingDirection.x = -1;
                    let wrapLoop = parseInt((x + widthScaled) / layer.viewPort.width, 10);
                    //Keep wrapping until we reach the max condition.
                    if (this._maxWrapping === 0 || wrapLoop < this._maxWrapping) {
                        //P3: Draw an orthogonally LEFT sprite relative to the world transformation [PI radians]
                        this.__drawRaw(layer, elapsedTimeInMilliseconds, x - v1x * wrapLoop, y - v1y * wrapLoop, width, height);
                        //Need to create continuous wrapping, where the sprite occupies both sides of the screen simultaneously.
                        if (--wrapLoop > 0) {
                            this.__drawRaw(layer, elapsedTimeInMilliseconds, x - v1x * wrapLoop, y - v1y * wrapLoop, width, height);
                        }
                    }
                }
            }

            //Vertical wrapping.
            if (layer.wrapVertical) {
                //Inversely scale the length to the size of the sprite scaled vertically relative to its local transformation.
                //For example, if the sprite has been shrunk by half, then the length must be doubled.
                const verticalLength = layer.viewPort.height / this._scaleVector.y * yOrientation;

                //Rotate and scale the vertical vector to keep our wrapping sprite on a vertical plane with canvas not with the rotation plane so it appears at the edges of the screen.
                v2x = Math.bitRound(sinAngle * verticalLength);
                v2y = Math.bitRound(cosAngle * verticalLength);

                //NOTE: The additional diff calculation between y & heightScaled is added to handle the additional wrapping loops, without it none of the wrapping loops will work beyond the first.
                if (y - heightScaled <= layer.viewPort.y) {
                    wrappingDirection.y = 1;
                    //Keep wrapping until we reach the max condition.
                    let wrapLoop = Math.abs(parseInt((y - heightScaled) / layer.viewPort.height, 10)) + 1;
                    if (this._maxWrapping === 0 || wrapLoop < this._maxWrapping) {
                        //P2: Draw an orthogonally DOWN sprite relative to the world transformation [PI/2 radians] (canvas y coordinates are inverted with +y down)
                        this.__drawRaw(layer, elapsedTimeInMilliseconds, x - v2x * wrapLoop, y + v2y * wrapLoop, width, height);
                        //Need to create continuous wrapping, where the sprite occupies both sides of the screen simultaneously.
                        if (--wrapLoop > 0) {
                            this.__drawRaw(layer, elapsedTimeInMilliseconds, x - v2x * wrapLoop, y + v2y * wrapLoop, width, height);
                        }
                    }
                }
                else if (y + heightScaled >= layer.viewPort.height) {
                    wrappingDirection.y = -1;
                    let wrapLoop = parseInt((y + heightScaled) / layer.viewPort.height, 10);
                    //Keep wrapping until we reach the map condition.
                    if (this._maxWrapping === 0 || wrapLoop < this._maxWrapping) {
                        //P4: Draw an orthogonally UP sprite relative to the world transformation [3PI/2 radians] (canvas y coordinates are inverted with -y up)
                        this.__drawRaw(layer, elapsedTimeInMilliseconds, x + v2x * wrapLoop, y - v2y * wrapLoop, width, height);
                        //Need to create continuous wrapping, where the sprite occupies both sides of the screen simultaneously.
                        if (--wrapLoop > 0) {
                            this.__drawRaw(layer, elapsedTimeInMilliseconds, x + v2x * wrapLoop, y - v2y * wrapLoop, width, height);
                        }
                    }
                }
            }

            //Handle the corner sprites if veritcal & horizontal wrapping are enabled. 
            if (layer.wrapVertical && layer.wrapHorizontal) {
                const xOffset = (x - wrappingDirection.y * v2x) + (wrappingDirection.x * v1x);
                const yOffset = (y + wrappingDirection.y * v2y) + (wrappingDirection.x * v1y);

                if (xOffset && yOffset) {
                    this.__drawRaw(layer, elapsedTimeInMilliseconds, xOffset, yOffset, width, height);
                }
            }
        }
        /**
         * Releases resources.
         */
        release() {
            if (this.image) {
                if (this.image instanceof hamonengine.graphics.imageext) {
                    this.image.release();
                }
                
                delete this._image;
            }
        }
    }
})();