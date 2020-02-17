/**
* Copyright (c) 2020, CaffeinatedRat.
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

(function() {

    const SPRITE_ORIENTATION = {
        NORMAL: 0,
        FLIPPED: 1,
        MIRRORED: 2
    };

    hamonengine.graphics.sprite = class {
        constructor(options) {
            options = options || {}
            //Handle copy-constructor operations.
            if (options instanceof hamonengine.graphics.sprite) {
                options = {
                    name: options.name,
                    image: options._image && options._image.copy(),
                    dimensions: options._dimensions,
                    theta: options.theta
                }
            }

            //Image properties.
            this._name = options.name;
            this._image = options.image;
            this._dimensions = options.dimensions || new hamonengine.geometry.rect();

            //Transformation variables.
            this._theta = options.theta || 0.0;
            this._scaleVector = new hamonengine.geometry.vector2(1.0,1.0);
            
            this._spriteOrientation = SPRITE_ORIENTATION.NORMAL;
            this._showDiagnosisLines = false;
            this._showFullImage = false;
            this._maxWrapping = 0;

            hamonengine.util.logger.debug(`[hamonengine.graphics.sprite.constructor] Starting Dimensions: {${this._dimensions.toString()}}`);
            hamonengine.util.logger.debug(`[hamonengine.graphics.sprite.constructor] Name: ${this._name}`);
            hamonengine.util.logger.debug(`[hamonengine.graphics.sprite.constructor] Theta: ${this._theta}`);
            hamonengine.util.logger.debug(`[hamonengine.graphics.sprite.constructor] ScaleVector: {${this._scaleVector.toString()}}`);
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
         * Makes a copy of the sprite.
         */
        copy() {
            return new hamonengine.graphics.sprite(this);
        }
        /**
         * Rotates the sprite at the center.
         * @param {number} theta the angle in radians.
         */
        rotate(theta) {
            this._theta = theta || 0.0;
        }
        /**
         * Scales the sprite at the top-left corner by the x and y coordinates.
         * @param {number} x coordinate to scale.
         * @param {number} y coordinate to scale.
         */
        scale(x, y) {
            this._scaleVector.x = x;
            this._scaleVector.y = y;
        }
        /**
         * Mirrors the sprite at the center.
         * @param {boolean} state (optional) to mirror the object
         */
        mirror(state) {
            this._spriteOrientation = hamonengine.util.bitwise.toggle(this._spriteOrientation, SPRITE_ORIENTATION.MIRRORED, state);
        }
        /**
         * Flips the sprite at the center.
         * @param {boolean} state (optional) to flip the object
         */
        flip(state) {
            this._spriteOrientation = hamonengine.util.bitwise.toggle(this._spriteOrientation, SPRITE_ORIENTATION.FLIPPED, state);
        }
        /**
         * Blends the sprite with the specific color with the specific blending operation.
         * @param {number} r red channel ranging from 0-255.
         * @param {number} g green channel ranging from 0-255.
         * @param {number} b blue channel ranging from 0-255.
         * @param {number} a alpha channel ranging from 0-255.
         * @param {number} blendingOps (BLENDING_OPS) blending operation to perform.
         */
        blendColor(r=0, g=0, b=0, a=0, blendingOps) {
            this._image.blendColorRegion(r,g,b,a, this._dimensions, blendingOps);
        }
        /**
         * Adjusts the channels for each color.
         * @param {number} r red channel ranging from 0.0-1.0.
         * @param {number} g green channel ranging from 0.0-1.0.
         * @param {number} b blue channel ranging from 0.0-1.0.
         * @param {number} a alpha channel ranging from 0.0-1.0.
         */
        adjustColorChannel(r=1.0, g=1.0, b=1.0, a=1.0) {
            this._image.adjustColorChannel(r,g,b,a, this._dimensions);
        }
        /**
         * Performs a bitblit between two sprites where this is the destination and the source sprite is passed in.
         * @param {*} sprite to bitblit with.
         * @param {number} transparency the intensity of the pixel's transparency. 0.0 - 1.0 where 0 is transparent and 1 is opaque.
         */
        bitblit(sprite, transparency=1.0) {
            this._image.bitblit(sprite._image, sprite._dimensions, this._dimensions, transparency);
        }
        /**
         * Draws the sprite at the specific location with the current width & height without any transformations applied.
         * @param {object} layer to draw upon.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds. 
         * @param {number} x coordinate to draw at.
         * @param {number} y cooridnate to draw at.
         * @param {number} width the optional width of the sprite to scale.
         * @param {number} height the option height of the sprite to scale.
         */
        drawRaw(layer, elapsedTimeInMilliseconds, x, y, width=this._dimensions.width, height=this._dimensions.height) {
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
         * Draws the sprite at the specific location with the current width & height.
         * @param {object} layer to draw upon.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds.
         * @param {number} x coordinate to draw at.
         * @param {number} y cooridnate to draw at.
         * @param {number} width the optional width of the sprite.
         * @param {number} height the option height of the sprite.
         */
        draw(layer, elapsedTimeInMilliseconds, x, y, width=this._dimensions.width, height=this._dimensions.height) {

            //Round x,y coordinates into integers.
            x = Math.bitRound(x);
            y = Math.bitRound(y);

            //Find the center of the sprite.
            let xCenterOffset = Math.bitRound(width/2) + x;
            let yCenterOffset = Math.bitRound(height/2) + y;

            //Precalculate the orientation around the x & y axis.
            let yOrientation = hamonengine.util.bitwise.isSet(this._spriteOrientation, SPRITE_ORIENTATION.FLIPPED) ? -1.0 : 1.0;
            let xOrientation = hamonengine.util.bitwise.isSet(this._spriteOrientation, SPRITE_ORIENTATION.MIRRORED) ? -1.0 : 1.0;

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

            if (this.showDiagnosisLines) {
                this.drawDiagnosisOutlines(layer, elapsedTimeInMilliseconds, x, y, width, height);
            }

            //Draw the main sprite.
            this.drawRaw(layer, elapsedTimeInMilliseconds, x, y, width, height);

            //Sprite wrapping relative to the local sprite's transformation not to world transformations.
            if (layer.wrapHorizontal || layer.wrapVertical) {
                let cosAngle = Math.cos(-this.theta);
                let sinAngle = Math.sin(-this.theta);

                let widthScaled = width * this._scaleVector.x;
                let heightScaled = height * this._scaleVector.y;

                //Horizontal wrapping.
                if (layer.wrapHorizontal) {
                    //Inversely scale the length to the size of the sprite scaled horizontally relative to its local transformation.
                    //For example, if the sprite has been shrunk by half, then the length must be doubled.
                    let horizontalLength = layer.viewPort.width / this._scaleVector.x * xOrientation;

                    //Rotate and scale the horizontal vector to keep our wrapping sprite on a horizontal plane with canvas not with the rotation plane so it appears at the edges of the screen.
                    let v1x = Math.bitRound(cosAngle * horizontalLength);
                    let v1y = Math.bitRound(sinAngle * horizontalLength);
                    if (x - widthScaled <= layer.viewPort.x) {
                        //Keep wrapping until we reach the max condition.
                        let wrapLoop = Math.abs(parseInt((x-widthScaled)/layer.viewPort.width)) + 1;
                        if (this._maxWrapping === 0 || wrapLoop < this._maxWrapping) {
                            //P1: Draw an orthogonally RIGHT sprite relative to the world transformation [0 radians]
                            this.drawRaw(layer, elapsedTimeInMilliseconds, x + v1x * wrapLoop, y + v1y * wrapLoop, width, height);
                            //Need to create continuous wrapping, where the sprite occupies both sides of the screen simultaneously.
                            if (--wrapLoop > 0) {
                                this.drawRaw(layer, elapsedTimeInMilliseconds, x + v1x * wrapLoop, y + v1y * wrapLoop, width, height);
                            }
                        }
                    }
                    else if (x + widthScaled >= layer.viewPort.width) {
                        let wrapLoop = parseInt((x+widthScaled)/layer.viewPort.width);
                        //Keep wrapping until we reach the map condition.
                        if (this._maxWrapping === 0 || wrapLoop < this._maxWrapping) {
                            //P3: Draw an orthogonally LEFT sprite relative to the world transformation [PI radians]
                            this.drawRaw(layer, elapsedTimeInMilliseconds, x - v1x * wrapLoop, y - v1y * wrapLoop, width, height);
                            //Need to create continuous wrapping, where the sprite occupies both sides of the screen simultaneously.
                            if (--wrapLoop > 0) {
                                this.drawRaw(layer, elapsedTimeInMilliseconds, x - v1x * wrapLoop, y - v1y * wrapLoop, width, height);
                            }
                        }
                    }
                }

                //Vertical wrapping.
                if (layer.wrapVertical) {
                    //Inversely scale the length to the size of the sprite scaled vertically relative to its local transformation.
                    //For example, if the sprite has been shrunk by half, then the length must be doubled.
                    let verticalLength = layer.viewPort.height / this._scaleVector.y * yOrientation;

                    //Rotate and scale the vertical vector to keep our wrapping sprite on a vertical plane with canvas not with the rotation plane so it appears at the edges of the screen.
                    let v2x = Math.bitRound(sinAngle * verticalLength);
                    let v2y = Math.bitRound(cosAngle * verticalLength);
                    if (y - heightScaled  <= layer.viewPort.y) {
                        //Keep wrapping until we reach the max condition.
                        let wrapLoop = Math.abs(parseInt((y - heightScaled) /layer.viewPort.height)) + 1;
                        if (this._maxWrapping === 0 || wrapLoop < this._maxWrapping) {
                            //P2: Draw an orthogonally DOWN sprite relative to the world transformation [PI/2 radians] (canvas y coordinates are inverted with +y down)
                            this.drawRaw(layer, elapsedTimeInMilliseconds, x - v2x * wrapLoop, y + v2y * wrapLoop, width, height);
                            //Need to create continuous wrapping, where the sprite occupies both sides of the screen simultaneously.
                            if (--wrapLoop > 0) {
                                this.drawRaw(layer, elapsedTimeInMilliseconds, x - v2x * wrapLoop, y + v2y * wrapLoop, width, height);
                            }
                        }
                    }
                    else if (y + heightScaled >= layer.viewPort.height) {
                        let wrapLoop = parseInt((y + heightScaled) / layer.viewPort.height);
                        //Keep wrapping until we reach the map condition.
                        if (this._maxWrapping === 0 || wrapLoop < this._maxWrapping) {
                            //P4: Draw an orthogonally UP sprite relative to the world transformation [3PI/2 radians] (canvas y coordinates are inverted with -y up)
                            this.drawRaw(layer, elapsedTimeInMilliseconds, x + v2x * wrapLoop, y - v2y * wrapLoop, width, height);
                            //Need to create continuous wrapping, where the sprite occupies both sides of the screen simultaneously.
                            if (--wrapLoop > 0) {
                                this.drawRaw(layer, elapsedTimeInMilliseconds, x + v2x * wrapLoop, y - v2y * wrapLoop, width, height);
                            }
                        }
                    }
                }
            }

            //Restore the previous state.
            layer.restore();
        }
        /**
         * Draws the diagnosis outlines.  This is more of an internal method.
         * @param {object} layer to draw upon.
         * @param {number} elapsedTimeInMilliseconds the time elapsed between frames in milliseconds.
         * @param {number} x coordinate to draw at.
         * @param {number} y cooridnate to draw at.
         * @param {number} width the optional width of the sprite.
         * @param {number} height the option height of the sprite.
         */
        drawDiagnosisOutlines(layer, elapsedTimeInMilliseconds, x, y, width, height) {

            //Find the center of the sprite.
            let xCenterOffset = Math.bitRound(width/2) + x;
            let yCenterOffset = Math.bitRound(height/2) + y;

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

                this.drawRaw(layer, elapsedTimeInMilliseconds, x + layer.viewPort.width, y, width, height);
                this.drawRaw(layer, elapsedTimeInMilliseconds, x - layer.viewPort.width, y, width, height);
                this.drawRaw(layer, elapsedTimeInMilliseconds, x, y + layer.viewPort.height, width, height);
                this.drawRaw(layer, elapsedTimeInMilliseconds, x, y - layer.viewPort.height, width, height);

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
    }
})();