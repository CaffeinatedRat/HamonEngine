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

(function () {

    /**
     * This class represents a layer, a canvas wrapper class.
     */
    hamonengine.graphics.layer = class {
        constructor(options = {}, cloneProps = {}) {

            //Handle copy-constructor operations.
            if (options instanceof hamonengine.graphics.layer) {
                options = {
                    //Copy the new properties that should not be cloned.
                    canvas: cloneProps.canvas,
                    backgroundColor: cloneProps.backgroundColor,
                    //Clone the remaining properties.
                    canvasId: options._canvasId,
                    alpha: options.alpha,
                    allowEventBinding: options.allowEventBinding,
                    wrapVertical: options.wrapVertical,
                    wrapHorizontal: options.wrapHorizontal,
                    clipToViewPort: options.clipToViewPort,
                    enableImageSmoothing: options._enableImageSmoothing,
                    invertYAxis: options.invertYAxis,
                    invertXAxis: options.invertXAxis,
                    allowSaveState: options.allowSaveState,
                    borderColor: options.borderColor,
                    viewPort: options.viewPort?.clone()
                }
            }

            //Get the canvas is one is provided.
            let canvas = options.canvas;

            //Verify the CanvasId or Canvas exists.
            if (!options.canvasId && !canvas) {
                console.error(`[hamonengine.graphics.layer.constructor] Invalid canvasId '${options.canvasId}' or canvas. Unable to create the layer!`);
                throw 'Cannot create the layer';
            }

            //Check for a canvas first before looking for one in the DOM.
            canvas = canvas || document.getElementById(options.canvasId);

            if (!canvas) {
                console.error(`[hamonengine.graphics.layer.constructor] Invalid canvas: '${options.canvasId}' unable to create the layer!`);
                throw 'Cannot create the layer';
            }

            //Canvas properties.
            this._canvas = canvas;
            this._canvasId = canvas.id;
            this._name = options.name || canvas.getAttribute('name');

            this._alpha = options.alpha !== undefined ? options.alpha : false;
            this._backgroundColor = options.backgroundColor; // || 'black';
            this._allowEventBinding = options.allowEventBinding !== undefined ? options.allowEventBinding : false;
            this._wrapVertical = options.wrapVertical !== undefined ? options.wrapVertical : false;
            this._wrapHorizontal = options.wrapHorizontal !== undefined ? options.wrapHorizontal : false;
            this._clipToViewPort = options.clipToViewPort !== undefined ? options.clipToViewPort : true;
            this._enableImageSmoothing = options.enableImageSmoothing !== undefined ? options.enableImageSmoothing : true;
            this._invertYAxis = options.invertYAxis !== undefined ? options.invertYAxis : false;
            this._invertXAxis = options.invertXAxis !== undefined ? options.invertXAxis : false;

            //By default, allows users of this layer to save the current transformation state.
            this._allowSaveStateEnabled = options.allowSaveState !== undefined ? options.allowSaveState : true;

            //Allow the viewport border to be drawn.
            this._viewPortBorderColor = options.borderColor || '';

            //Set the viewport to the size of the layer by default.
            this._viewPort = options.viewPort || new hamonengine.geometry.rect(0, 0, this._canvas.width, this._canvas.height);

            //Try to get the 2d context.
            try {
                // --- 3/7/21 --- Handle the Chromium 89 bug where if alpha is set to false, ClearRect will not properly clear the canvas resulting in a mirroring effect.
                // This is not an issue in Firefox and was not an issue before Chromium 89.
                if (this._alpha) {
                    this._canvasContext = this._canvas.getContext('2d', {
                        alpha: this._alpha
                    });
                }
                else {
                    this._workAround = true;
                    this._canvasContext = this._canvas.getContext('2d');
                }
            }
            catch (err) {
            }

            this.enableImageSmoothing(options.enableImageSmoothing);

            if (!this._canvasContext) {
                console.error(`[hamonengine.graphics.layer.constructor] Unable to get the 2d context: '${this._canvasId}' unable to create the layer!`);
                throw 'Cannot create the layer';
            }

            //By default, the layer was not reset.
            this._wasReset = false;

            if (hamonengine.debug) {
                console.debug(`[hamonengine.graphics.layer.constructor] Canvas Id: ${this._canvasId}`);
                console.debug(`[hamonengine.graphics.layer.constructor] Name: ${this._name}`);
                console.debug(`[hamonengine.graphics.layer.constructor] Alpha: ${this._alpha}`);
                console.debug(`[hamonengine.graphics.layer.constructor] AllowEventBinding: ${this._allowEventBinding}`);
                console.debug(`[hamonengine.graphics.layer.constructor] WrapVertical: ${this._wrapVertical}`);
                console.debug(`[hamonengine.graphics.layer.constructor] WrapHorizontal: ${this._wrapHorizontal}`);
                console.debug(`[hamonengine.graphics.layer.constructor] ClipToViewPort: ${this._clipToViewPort}`);
            }
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Get the name of the context.
         */
        get name() {
            return this._name;
        }
        /**
         * Returns true if the layer allows binding.
         */
        get allowEventBinding() {
            return this._allowEventBinding;
        }
        /**
         * Get the context.
         */
        get context() {
            return this._canvasContext
        }
        /**
         * Get the whole canvas.
         */
        get canvas() {
            return this._canvas;
        }
        /**
         * Returns true if the layer is clipping to the viewport.
         */
        get clipToViewPort() {
            return this._clipToViewPort;
        }
        /**
         * Get the width of the layer.
         */
        get width() {
            return this.canvas.width;
        }
        /**
         * Get the width of the layer.
         */
        get height() {
            return this.canvas.height;
        }
        /**
         * Get the left offset of the layer.
         */
        get offsetX() {
            return this.canvas.offsetLeft;
        }
        /**
         * Get the left offset of the layer.
         */
        get offsetY() {
            return this.canvas.offsetTop;
        }
        /**
         * Get the position of the layer.
         */
        get position() {
            const boundRect = this.canvas.getBoundingClientRect() || { left: 0, top: 0 };
            return new hamonengine.math.vector2(boundRect.left, boundRect.top);
        }
        /**
         * Gets the viewport.
         */
        get viewPort() {
            return this._viewPort;
        }
        /**
         * Returns true if wrapping horizontally is enabled.
         */
        get wrapHorizontal() {
            return this._wrapHorizontal;
        }
        /**
         * Enables or disables horizontal wrapping.
         */
        set wrapHorizontal(v) {
            this._wrapHorizontal = v;
        }
        /**
         * Returns true if wrapping vertically is enabled.
         */
        get wrapVertical() {
            return this._wrapVertical;
        }
        /**
         * Enables or disables veritcal wrapping.
         */
        set wrapVertical(v) {
            this._wrapVertical = v;
        }
        /**
         * Returns true if the save state is enabled.
         */
        get allowSaveState() {
            return this._allowSaveStateEnabled;
        }
        /**
         * Sets the allow save state, by default this is true.
         */
        set allowSaveState(v) {
            this._allowSaveStateEnabled = v;
        }
        /**
         * Returns viewport border color.
         */
        get borderColor() {
            return this._viewPortBorderColor;
        }
        /**
         * Sets viewport border color.
         */
        set borderColor(v) {
            this._viewPortBorderColor = v;
        }
        /**
        * Returns true if the Y-Axis is inverted.
        */
        get invertYAxis() {
            return hamonengine.graphics.settings.globalInvertYAxis || this._invertYAxis;
        }
        /**
         * Inverts the Y-Axis if true.
         */
        set invertYAxis(v) {
            this._invertYAxis = v;
        }
        /**
         * Returns true if the X-Axis is inverted.
         */
        get invertXAxis() {
            return hamonengine.graphics.settings.globalInvertXAxis || this._invertXAxis;
        }
        /**
         * Inverts the X-Axis if true.
         */
        set invertXAxis(v) {
            this._invertXAxis = v;
        }
        /**
         * Gets the current background color.
         */
        get alpha() {
            return this.context.globalAlpha;
        }
        /**
         * Sets the current background color.
         */
        set alpha(v) {
            this.context.globalAlpha = v;
        }
        /**
         * Gets the current tooltip of the layer.
         */
        get tooltip() {
            return this.canvas.title;
        }
        /**
         * Sets the current tooltip of the layer.
         */
        set tooltip(v) {
            this.canvas.title = v;
        }
        /**
         * Returns the current cursor of the layer.
         */
        get cursor() {
            return this.canvas.style.cursor;
        }
        /**
          * Sets the current cursor of the layer.
          */
        set cursor(v) {
            this.canvas.style.cursor = v;
        }
        /**
         * Returns the background color, defaults to black.
         */
        get backgroundColor() {
            return this._backgroundColor;
        }
        /**
         * Assigns the background color.
         */
        set backgroundColor(v) {
            this._backgroundColor = v;
        }
        /**
         * Returns the zIndex of the canvas element.
         */
        get depthIndex() {
            return this.canvas.style.zIndex;
        }
        /**
         * Assigns the zIndex of the canvas element.
         */
        set depthIndex(v) {
            this.canvas.style.zIndex = v;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Creates a new canvas.
         * @param {number} width of the new canvas.
         * @param {number} height of the new canvas.
         * @param {string} id of the new canvas.
         * @param {string} name of the new canvas.
         * @returns {Object} a newly created canvas
         */
        static createNewCanvas(width, height, id = '', name = '') {
            const canvas = document.createElement('canvas');
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            id && canvas.setAttribute('id', id);
            name && canvas.setAttribute('name', name);
            return canvas;
        }
        /**
         * Clones the current layer with a new id & name and creates a new canvas element, while retaining all other properties from the source.
         * @param {string} canvasId of the new layer.
         * @param {string} name of the new layer.
         */
        clone(canvasId, name, properties = {}) {
            return new hamonengine.graphics.layer(this, {
                canvas: hamonengine.graphics.layer.createNewCanvas(this.width, this.height, canvasId, name), ...properties
            }
            );
        }
        /**
         * Toggles images smoothing.
         * @param {boolean} enable true to enable.
         */
        enableImageSmoothing(enable = true) {
            hamonengine.debug && console.debug(`[hamonengine.graphics.layer.constructor] EnableImageSmoothing: ${enable}`);
            this._enableImageSmoothing = enable;
            try {
                this.context.webkitImageSmoothingEnabled = enable;
                this.context.mozImageSmoothingEnabled = enable;
                this.context.imageSmoothingEnabled = enable;
            }
            catch (err) {
            }
        }
        /**
         * Clears the layer
         * @param {*} x coordinate to clear, set to viewport by default.
         * @param {*} y coordinate to clear, set to viewport by default.
         * @param {*} width to clear, set to viewport by default.
         * @param {*} height to clear, set to viewport by default.
         */
        clear(x = this.viewPort.x, y = this.viewPort.y, width = this.viewPort.width, height = this.viewPort.height) {
            this._wasReset = false;
            this.context.clearRect(x, y, width, height);
        }
        /**
         * Resets the transformation.
         */
        reset() {
            this.context.resetTransform();
        }
        /**
         * Saves the current transformation state.
         */
        save() {
            this.allowSaveState && this.context.save();
        }
        /**
         * Restores the current transformation state.
         */
        restore() {
            this.allowSaveState && this.context.restore();
        }
        /**
         * Draws the image to the size of the layer.
         * @param {*} image to draw
         * @param {*} x coordinate, set to viewport by default.
         * @param {*} y coordinate, set to viewport by default.
         */
        fillLayerImage(image, x = this.viewPort.x, y = this.viewPort.y) {
            this.context.drawImage(image, x, y, this.viewPort.width, this.viewPort.height);
        }
        /**
         * Fills the layer with the specified color.
         * @param {string} color to fill the canvas.
         * @param {number} x location to start painting.  By default this is set to the this.viewPort.x;
         * @param {number} y location to start painting.  By default this is set to the this.viewPort.y;
         * @param {number} width to start painting.  By default this is set to the this.viewPort.width;
         * @param {number} height to start painting.  By default this is set to the this.viewPort.height;
        */
        fillLayerColor(color, x = this.viewPort.x, y = this.viewPort.y, width = this.viewPort.width, height = this.viewPort.height) {
            this.context.fillStyle = color;
            this.context.fillRect(x, y, width, height);
        }
        /**
         * Begins default painting on this layer with varoius options
         * @param {number} obj.x location to start painting.  By default this is set to the this.viewPort.x;
         * @param {number} obj.y location to start painting.  By default this is set to the this.viewPort.y;
         * @param {number} obj.width to start painting.  By default this is set to the this.viewPort.width;
         * @param {number} obj.height to start painting.  By default this is set to the this.viewPort.height;
         * @param {string} obj.backgroundColor to fill the canvas.  By default this is this.backgroundColor.
        */
        beginPainting({ x = this.viewPort.x, y = this.viewPort.y, width = this.viewPort.width, height = this.viewPort.height, backgroundColor = this.backgroundColor } = {}) {
            //Added support for resetting the background color.
            if (backgroundColor) {
                this.fillLayerColor(backgroundColor, x, y, width, height);
            }
            //No background color then just perform a normal clear.
            else {
                this.clear(x, y, width, height);
            }

            if (this.borderColor) {
                this.context.strokeStyle = this.borderColor;
                this.context.strokeRect(this.viewPort.x, this.viewPort.y, this.viewPort.width, this.viewPort.height);
            }

            //Determine if viewport clipping is enabled.
            if (this.clipToViewPort) {
                //Broken up for readability
                //Only perform additional clip operations if the canvas & the viewport are not the same size.
                if (this.viewPort.x !== 0 || this.viewPort.y !== 0 || this.viewPort.width !== this.width || this.viewPort.height !== this.height) {
                    this.context.beginPath();
                    this.context.rect(this.viewPort.x, this.viewPort.y, this.viewPort.width, this.viewPort.height);
                    this.context.clip();
                }
            }
        }
        /**
         * Ends default painting on this layer.
        */
        endPainting() {
            if (!this._wasReset) {
                this.reset();
                this._wasReset = true;
            }
        }
        /**
         * Draws another layer onto this layer.
         * @param {object} layer 
         * @param {number} destinationX 
         * @param {number} destinationY 
         * @param {number} destinationWidth 
         * @param {number} destinationHeight 
         */
        drawLayer(layer, destinationX = 0, destinationY = 0, destinationWidth = this.width, destinationHeight = this.height) {
            if (!(layer instanceof hamonengine.graphics.layer)) {
                throw "Parameter layer is not of type hamonengine.graphics.layer.";
            }

            this.context.drawImage(layer.canvas,
                destinationX,
                destinationY,
                destinationWidth,
                destinationHeight);
        }
        /**
         * A method that draws text based on the dimension parameters provided.
         * @param {string} text to draw.
         * @param {number} sourceX coordinate of where to draw the text.
         * @param {number} sourceY coordinate of where to draw the text.
         * @param {string} obj.font of the text.  By default this is set to '16px serif'
         * @param {string} obj.color of the text.  By default this is 'white'.
         * @param {number} obj.textDrawType format to draw, by default this is TEXT_DRAW_TYPE.FILL.
         * @param {number} obj.textOffset horizontal starting coordinate of where to offset the text. By default this is left. The values are left, center, right.
         * @param {number} obj.verticalTextOffset vertical starting coordinate of where to offset the text. By default this is left. The values are top, center, bottom.
         * @param {boolean} obj.shadow draws a shadow under the text.  By default this is false.
         * @param {number} obj.shadowXOffset horizontal coordinate of where to offset the shadow text.  By default this is 2.
         * @param {number} obj.shadowYOffset horizontal coordinate of where to offset the shadow text.  By default this is 2.
         * @param {string} obj.shadowColor of the shadow text.  By default this is 'black'.
         * @param {object} obj.metrics that contain precomputed width & height.
         * @param {boolean} obj.disableMetrics when set to true, internal metric gathering is disabled to improve performance; however, both textOffset & verticalTextOffset will no longer work.
         */
        drawText(text, sourceX = 0, sourceY = 0, { font = '16px serif', color = 'white', textDrawType = TEXT_DRAW_TYPE.FILL, textOffset = 'left', verticalTextOffset = 'top', shadow = false, shadowXOffset = 2, shadowYOffset = 2, shadowColor = 'black', metrics, disableMetrics = false } = {}) {
            this.context.font = font;
            this.context.textBaseline = 'top';

            //NOTE: Inverting the axes requires factoring in the length and size of the text as well.
            //Only the coordinates are inverted, not the objects or the canvas.

            //NOTE: The text cannot be properly inverted if metrics are disabled since the width of the text is unknown.
            if (!disableMetrics && this.invertYAxis) {
                sourceY = this.viewPort.height - sourceY;
                verticalTextOffset = verticalTextOffset === 'top' ? 'bottom' : verticalTextOffset;
            }

            if (!disableMetrics && this.invertXAxis) {
                sourceX = this.viewPort.width - sourceX;
                textOffset = textOffset === 'left' ? 'right' : textOffset;
            }

            //Get the metrics for any offset that is not left or top.
            //const metrics = (textOffset !== 'left' || verticalTextOffset !== 'top') ? this.context.measureText(text) : {};

            let height = 0, width = 0;
            //Determine if metrics are disabled for performance.
            if (!disableMetrics) {
                //Use the precomputed metrics if one is included, otherwise fetch new metrics.
                metrics = (metrics?.height && metrics?.width) ? metrics : this.context.measureText(text);
                //Use the precomputed height or compute it if one doesn't exist.
                height = metrics.height || (metrics.fontBoundingBoxDescent - metrics.fontBoundingBoxAscent);
                width = metrics.width;

                //Attempt to handle predefined text offsets.
                switch (textOffset.toLowerCase()) {
                    case 'center':
                        sourceX -= width / 2;
                        break;

                    case 'right':
                        sourceX -= width;
                        break;

                    case 'left':
                        break;

                    //If the textual offsets aren't passed then try to parse the offset as an integer.
                    default:
                        sourceX -= parseInt(textOffset);
                        break;
                }

                //Attempt to handle predefined vertical text offsets.
                switch (verticalTextOffset.toLowerCase()) {
                    case 'center':
                        sourceY -= (height / 2);
                        break;

                    case 'bottom':
                        sourceY -= (height);
                        break;

                    case 'top':
                        break;

                    //If the textual offsets aren't passed then try to parse the offset as an integer.
                    default:
                        sourceY -= parseInt(verticalTextOffset);
                        break;
                }
            }

            if (textDrawType === TEXT_DRAW_TYPE.STROKE) {
                //Draw the shadow text.
                if (shadow) {
                    this.context.strokeStyle = shadowColor;
                    this.context.strokeText(text, sourceX + shadowXOffset, sourceY + shadowYOffset);
                }

                //Draw the regular text.
                this.context.strokeStyle = color;
                this.context.strokeText(text, sourceX, sourceY);
            }
            else {
                //Draw the shadow text.
                if (shadow) {
                    this.context.fillStyle = shadowColor;
                    this.context.fillText(text, sourceX + shadowXOffset, sourceY + shadowYOffset);
                }

                //Draw the regular text.
                this.context.fillStyle = color;
                this.context.fillText(text, sourceX, sourceY);
            }

            //Return text metrics & properties.
            return {
                width: width,
                height: height,
            }
        }
        /**
         * A wrapper method that draws the image (where the image can be a CanvasImageSource derived class or a hamonengine.graphics.imageext) based on the dimension parameters provided.
         * Refer to the details that can be found at MDN: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
         * @param {object} image 
         * @param {number} sourceX 
         * @param {number} sourceY 
         * @param {number} sourceWidth 
         * @param {number} sourceHeight 
         * @param {number} destinationX 
         * @param {number} destinationY 
         * @param {number} destinationWidth 
         * @param {number} destinationHeight 
         */
        drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight) {
            if (image.complete) {
                this.context.drawImage((image instanceof hamonengine.graphics.imageext) ? image.image : image,
                    sourceX,
                    sourceY,
                    sourceWidth,
                    sourceHeight,
                    destinationX,
                    destinationY,
                    destinationWidth,
                    destinationHeight);
            }
        }
        /**
         * A method that draws the vector2 or vector3 object with no wrapping (hamonengine.math.vector2 or hamonengine.math.vector3) based on the dimension parameters provided.
         * @param {object} vector object to draw.
         * @param {number} sourceX coordinate of where to draw the vector (Optional and set to zero).
         * @param {number} sourceY coordinate of where to draw the vector (Optional and set to zero).
         * @param {number} obj.lineWidth width of the vector's lines  (Optional and set to 1).
         * @param {string} obj.color of the vector's lines.
         */
        drawVector(vector, sourceX = 0, sourceY = 0, { lineWidth = 1, color = 'white' } = {}) {
            if (!(vector instanceof hamonengine.math.vector2)
                && !(vector instanceof hamonengine.math.vector3)) {
                throw "Parameter vector is not of type hamonengine.math.vector2 or of type hamonengine.math.vector3.";
            }

            if (this.invertYAxis) {
                sourceY = this.viewPort.height - sourceY;
            }

            if (this.invertXAxis) {
                sourceX = this.viewPort.width - sourceX;
            }

            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = color;

            this.context.beginPath();
            this.context.moveTo(sourceX, sourceY);
            this.context.lineTo(sourceX + vector.x, sourceY + vector.y);

            this.context.stroke();
        }
        /**
         * A method that draws the lineSegment object with no wrapping (hamonengine.geometry.lineSegment) based on the dimension parameters provided.
         * @param {object} lineSegment object to draw.
         * @param {number} sourceX coordinate of where to offset the lineSegment (Optional and set to zero).
         * @param {number} sourceY coordinate of where to offset the lineSegment (Optional and set to zero).
         * @param {number} obj.lineWidth width of the lineSegment  (Optional and set to 1).
         * @param {boolean} obj.drawNormals determines if the normal should be drawn (Default is false).
         * @param {string} obj.color of the lineSegment.
         */
        drawLineSegment(lineSegment, sourceX = 0, sourceY = 0, { lineWidth = 1, drawNormals = true, color = 'white' } = {}) {
            if (!(lineSegment instanceof hamonengine.geometry.lineSegment)) {
                throw "Parameter lineSegment is not of type hamonengine.geometry.lineSegment.";
            }

            this.__simpleDrawCoords(lineSegment._coords, 4, lineSegment._offset, sourceX, sourceY, { lineWidth, color, normals: (drawNormals ? lineSegment.normals : []) });
        }
        /**
         * A method that draws the polyChain object with no wrapping (hamonengine.geometry.polyChain) based on the dimension parameters provided.
         * @param {object} polyChain object to draw.
         * @param {number} sourceX coordinate of where to offset the polyChain (Optional and set to zero).
         * @param {number} sourceY coordinate of where to offset the polyChain (Optional and set to zero).
         * @param {number} obj.lineWidth width of the polyChain  (Optional and set to 1).
         * @param {boolean} obj.drawNormals determines if the normal should be drawn (Default is false).
         * @param {string} obj.color of the polyChain.
         */
        drawPolyChain(polyChain, sourceX = 0, sourceY = 0, { lineWidth = 1, drawNormals = true, color = 'white' } = {}) {
            if (!(polyChain instanceof hamonengine.geometry.polyChain)) {
                throw "Parameter polyChain is not of type hamonengine.geometry.polyChain.";
            }

            this.__simpleDrawCoords(polyChain._coords, polyChain._coords.length, 0, sourceX, sourceY, { lineWidth, color, normals: (drawNormals ? polyChain.normals : []) });
        }
        /**
         * A method that draws a series of coordinates of a non-closed shape with no wrapping based on the dimension parameters provided.
         * @param {object} coordinates array of coordinates to draw.
         * @param {object} length of coordinates to draw from the coordinate array.
         * @param {object} offset of where to start in the coordinate array.
         * @param {number} sourceX coordinate of where to offset the points (Optional and set to zero).
         * @param {number} sourceY coordinate of where to offset the points (Optional and set to zero).
         * @param {number} obj.lineWidth width of the points  (Optional and set to 1).
         * @param {string} obj.color of the points.
         * @param {object} obj.normals associated with the coordinates.
         */
        __simpleDrawCoords(coordinates, length = 0, offset = 0, sourceX = 0, sourceY = 0, { lineWidth = 1, color = 'white', normals = [] } = {}) {
            //Bail if we don't have asymmetrical coordinates, a coordinate pair (coordinates[i + 0] = x, coordinates[i + 1] = y).
            //Bail if the offset extends beyond the size of the coordinate pair (coordinates[offset + i + 0] = x, coordinates[offset + i + 1] = y).
            if ((coordinates.length % 2 != 0) || (offset + 1 > coordinates.length)) {
                return;
            }

            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = color;
            this.context.beginPath();

            //Normalize the length.
            length = offset + length > coordinates.length ? coordinates.length : offset + length;

            let lastPoint;
            const edges = [];
            for (let i = offset; i < length; i += 2) {
                //Get the x,y coords.
                let x = Math.bitRound(sourceX + coordinates[i]);
                let y = Math.bitRound(sourceY + coordinates[i + 1]);

                if (this.invertYAxis) {
                    y = this.viewPort.height - y;
                }

                if (this.invertXAxis) {
                    x = this.viewPort.width - x;
                }

                if (i === offset) {
                    this.context.moveTo(x, y);
                    lastPoint = new hamonengine.math.vector2(x, y);
                }
                else {
                    this.context.lineTo(x, y);

                    //Calculate the edges.
                    const v1 = new hamonengine.math.vector2(x, y);
                    edges.push(v1.subtract(lastPoint));
                    lastPoint = v1;
                }
            }

            this.context.stroke();

            //Only draw the normals if:
            //1) debug mode is on.
            //2) The number of normals is equal to the number off coordinate pairs or greater.
            if (hamonengine.debug && normals.length > 0) {
                this.context.strokeStyle = 'white';

                for (let index = offset, edgeIndex = 0; index < length && edgeIndex < edges.length && edgeIndex < normals.length; index += 2, edgeIndex++) {

                    let x = sourceX + coordinates[index];
                    let y = sourceY + coordinates[index + 1];

                    if (this.invertYAxis) {
                        y = this.viewPort.height - y;
                    }

                    if (this.invertXAxis) {
                        x = this.viewPort.width - x;
                    }

                    //Find the coordinates to begin the normal.
                    //The normal will start at the middle of the edge.
                    x = Math.bitRound(x + (edges[edgeIndex].x / 2));
                    y = Math.bitRound(y + (edges[edgeIndex].y / 2));

                    this.context.beginPath();
                    this.context.moveTo(x, y);

                    //Find the normal for the current edge and draw a line to it.
                    const normal = normals[edgeIndex];
                    const normalSize = Math.bitRound(edges[edgeIndex].length / 2);

                    let normalY = (this.invertYAxis) ? -normal.y : normal.y;
                    let normalX = (this.invertXAxis) ? -normal.x : normal.x;

                    this.context.lineTo(x + normalX * normalSize, y + normalY * normalSize);
                    this.context.stroke();
                }
            }
        }
        /**
         * A method that draws the rect object with wrapping (hamonengine.geometry.rect) based on the dimension parameters provided.
         * @param {object} rect object to draw.
         * @param {number} sourceX coordinate of where to draw the rect (Optional and set to zero).
         * @param {number} sourceY coordinate of where to draw the rect (Optional and set to zero).
         * @param {number} obj.lineWidth width of the rect's lines  (Optional and set to 1).
         * @param {string} obj.color of the rect's lines.
         * @param {boolean} obj.fill determines if the rect should be drawn filled (Default is false).
         * @param {string} obj.fillColor determines the fill color of the rect (Default is 'white').
         */
        drawRect(rect, sourceX = 0, sourceY = 0, { lineWidth = 1, color = 'white', fill = false, fillColor = 'white' } = {}) {
            if (!(rect instanceof hamonengine.geometry.rect)) {
                throw "Parameter rect is not of type hamonengine.geometry.rect.";
            }

            let x = sourceX + rect.x;
            let y = sourceY + rect.y;

            if (this.invertYAxis) {
                y = (this.viewPort.height - y - rect.height);
            }

            if (this.invertXAxis) {
                x = (this.viewPort.width - x - rect.width);
            }

            this.__simpleDrawRect(x, y, rect.width, rect.height, { lineWidth, color, fill, fillColor });

            //Retain the wrapping coordinates for the 4 wrapping shape.
            const wrappingPosition = new hamonengine.math.vector2();

            //Handle rect wrapping.
            if (this.wrapHorizontal) {
                //DRAW RIGHT
                //Determine if the minimum vertex of a rect extends beyond the minimum edge (left side) of the viewport.
                const xOffset = x - this.viewPort.x;
                if (xOffset <= 0) {
                    this.__simpleDrawRect(this.viewPort.width + xOffset, y, rect.width, rect.height, { lineWidth, color, fill, fillColor });
                    wrappingPosition.x = this.viewPort.width + xOffset;
                }

                //DRAW LEFT
                //Determine if the maximum vertex of a rect extends beyond the maximum edge (right side) of the viewport.
                if (x + rect.width >= this.viewPort.width) {
                    const xOffset = this.viewPort.width - x;
                    this.__simpleDrawRect(this.viewPort.x - xOffset, y, rect.width, rect.height, { lineWidth, color, fill, fillColor });
                    wrappingPosition.x = this.viewPort.x - xOffset;
                }
            }

            //Handle rect wrapping.
            if (this.wrapVertical) {
                //DRAW DOWN
                //Determine if the minimum vertex of a rect extends beyond the minimum edge (top side) of the viewport.
                const yOffset = y - this.viewPort.y;
                if (yOffset <= 0) {
                    this.__simpleDrawRect(x, this.viewPort.height + yOffset, rect.width, rect.height, { lineWidth, color, fill, fillColor });
                    wrappingPosition.y = this.viewPort.height + yOffset;
                }

                //DRAW UP
                //Determine if the maximum vertex of a rect extends beyond the maximum edge (bottom side) of the viewport.
                if (y + rect.height >= this.viewPort.height) {
                    const yOffset = this.viewPort.height - y;
                    this.__simpleDrawRect(x, this.viewPort.y - yOffset, rect.width, rect.height, { lineWidth, color, fill, fillColor });
                    wrappingPosition.y = this.viewPort.y - yOffset;
                }
            }

            //Handle the corner shape if veritcal & horizontal wrapping are enabled. 
            if (this.wrapVertical && this.wrapHorizontal && wrappingPosition.x && wrappingPosition.y) {
                this.__simpleDrawRect(wrappingPosition.x, wrappingPosition.y, rect.width, rect.height, { lineWidth, color, fill, fillColor });
            }
        }
        /**
         * A method that draws the rect object without wrapping (hamonengine.geometry.rect) based on the dimension parameters provided.
         * @param {number} x coordinate of where to draw the rect.
         * @param {number} y coordinate of where to draw the rect.
         * @param {number} width of the rectangle.
         * @param {number} height of the rectangle.
         * @param {number} obj.lineWidth width of the rect's lines  (Optional and set to 1).
         * @param {string} obj.color of the rect's lines.
         * @param {boolean} obj.fill determines if the rect should be drawn filled (Default is false).
         * @param {string} obj.fillColor determines the fill color of the rect (Default is 'white').
         */
        __simpleDrawRect(x, y, width, height, { lineWidth = 1, color = 'white', fill = false, fillColor = 'white' } = {}) {
            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = color;
            this.context.fillStyle = fillColor;

            this.context.beginPath();

            this.context.moveTo(x, y);
            this.context.strokeRect(x, y, width, height);

            //Complete the shape and draw the rect.
            this.context.closePath();

            if (fill) {
                this.context.fillRect(x, y, width, height);
            }

            this.context.stroke();
        }
        /**
         * A method that draws the polygon object with wrapping (hamonengine.geometry.polygon) based on the dimension parameters provided.
         * @param {object} polygon object to draw.
         * @param {number} sourceX coordinate of where to draw the polygon (Optional and set to zero).
         * @param {number} sourceY coordinate of where to draw the polygon (Optional and set to zero).
         * @param {number} obj.lineWidth width of the polygon's lines  (Optional and set to 1).
         * @param {string} obj.color of the polygon's lines.
         * @param {boolean} obj.drawNormals determines if the normals should be drawn (Default is false).
         * @param {boolean} obj.fill determines if the polygon should be drawn filled (Default is false).
         * @param {string} obj.fillColor determines the fill color of the polygon (Default is 'white').
         */
        drawPolygon(polygon, sourceX = 0, sourceY = 0, { lineWidth = 1, color = 'white', drawNormals = false, fill = false, fillColor = 'white' } = {}) {
            this.__simpleDrawPolygon(polygon, sourceX, sourceY, { lineWidth, color, drawNormals, fill, fillColor });

            //Retain the wrapping coordinates for the 4 wrapping shape.
            const wrappingPosition = new hamonengine.math.vector2();

            //Handle polygon wrapping.
            if (this.wrapHorizontal) {
                //DRAW RIGHT
                //Determine if the minimum vertex of a polygon extends beyond the minimum edge (left side) of the viewport.
                let xOffset = sourceX - this.viewPort.x;
                if (xOffset + polygon.min.x <= 0) {
                    this.__simpleDrawPolygon(polygon, this.viewPort.width + xOffset, sourceY, { lineWidth, color, drawNormals, fill, fillColor });
                    wrappingPosition.x = this.viewPort.width + xOffset;
                }

                //DRAW LEFT
                //Determine if the maximum vertex of a polygon extends beyond the maximum edge (right side) of the viewport.
                xOffset = this.viewPort.width - sourceX;
                if (sourceX + polygon.min.x + polygon.width >= this.viewPort.width) {
                    this.__simpleDrawPolygon(polygon, this.viewPort.x - xOffset, sourceY, { lineWidth, color, drawNormals, fill, fillColor });
                    wrappingPosition.x = this.viewPort.x - xOffset;
                }
            }

            //Handle polygon wrapping.
            if (this.wrapVertical) {
                //DRAW DOWN
                //Determine if the minimum vertex of a polygon extends beyond the minimum edge (top side) of the viewport.
                //const yOffset = (sourceY + polygon.min.y) - this.viewPort.y;
                let yOffset = sourceY - this.viewPort.y;
                if (yOffset + polygon.min.y <= 0) {
                    this.__simpleDrawPolygon(polygon, sourceX, this.viewPort.height + yOffset, { lineWidth, color, drawNormals, fill, fillColor });
                    wrappingPosition.y = this.viewPort.height + yOffset;
                }

                //DRAW UP
                //Determine if the maximum vertex of a polygon extends beyond the maximum edge (bottom side) of the viewport.
                yOffset = this.viewPort.height - sourceY;
                if (sourceY + polygon.min.y + polygon.height >= this.viewPort.height) {
                    this.__simpleDrawPolygon(polygon, sourceX, this.viewPort.y - yOffset, { lineWidth, color, drawNormals, fill, fillColor });
                    wrappingPosition.y = this.viewPort.y - yOffset;
                }
            }

            //Handle the corner shape if veritcal & horizontal wrapping are enabled. 
            if (this.wrapVertical && this.wrapHorizontal && wrappingPosition.x && wrappingPosition.y) {
                this.__simpleDrawPolygon(polygon, wrappingPosition.x, wrappingPosition.y, { lineWidth, color, drawNormals, fill, fillColor });
            }
        }
        /**
         * A method that draws the polygon object without wrapping (hamonengine.geometry.polygon) based on the dimension parameters provided.
         * @param {object} polygon object to draw.
         * @param {number} sourceX coordinate of where to draw the polygon (Optional and set to zero).
         * @param {number} sourceY coordinate of where to draw the polygon (Optional and set to zero).
         * @param {number} obj.lineWidth width of the polygon's lines  (Optional and set to 1).
         * @param {string} obj.color of the polygon's lines.
         * @param {boolean} obj.drawNormals determines if the normals should be drawn (Default is false).
         * @param {boolean} obj.fill determines if the polygon should be drawn filled (Default is false).
         * @param {string} obj.fillColor determines the fill color of the polygon (Default is 'white').
         */
        __simpleDrawPolygon(polygon, sourceX = 0, sourceY = 0, { lineWidth = 1, color = 'white', drawNormals = false, fill = false, fillColor = 'white' } = {}) {
            if (!(polygon instanceof hamonengine.geometry.polygon)) {
                throw "Parameter polygon is not of type hamonengine.geometry.polygon.";
            }

            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = color;
            this.context.fillStyle = fillColor;

            this.context.beginPath();

            for (let index = 0; index < polygon.vertices.length; index++) {
                let x = Math.bitRound(sourceX + polygon.vertices[index].x);
                let y = Math.bitRound(sourceY + polygon.vertices[index].y);

                if (this.invertYAxis) {
                    y = this.viewPort.height - y;
                }

                if (this.invertXAxis) {
                    x = this.viewPort.width - x;
                }

                if (index === 0) {
                    this.context.moveTo(x, y);
                }
                else {
                    this.context.lineTo(x, y);
                }
            }

            //Complete the shape and draw the polygon.
            this.context.closePath();
            fill && this.context.fill();
            this.context.stroke();

            if (hamonengine.debug && drawNormals) {
                this.context.strokeStyle = 'white';

                for (let index = 0; index < polygon.vertices.length; index++) {

                    //Get the current vertex and edge.
                    const vertex = polygon.vertices[index];
                    const edge = polygon.edges[index];

                    //Find the coordinates to begin the normal.
                    //The normal will start at the middle of the edge.
                    let x = Math.bitRound(sourceX + vertex.x + edge.x / 2);
                    let y = Math.bitRound(sourceY + vertex.y + edge.y / 2);

                    if (this.invertYAxis) {
                        y = this.viewPort.height - y;
                    }

                    if (this.invertXAxis) {
                        x = this.viewPort.width - x;
                    }

                    this.context.beginPath();
                    this.context.moveTo(x, y);

                    //Find the normal for the current edge and draw a line to it.
                    const normal = polygon.normals[index];
                    const normalSize = Math.bitRound(edge.length / 2);

                    let normalY = (this.invertYAxis) ? -normal.y : normal.y;
                    let normalX = (this.invertXAxis) ? -normal.x : normal.x;

                    this.context.lineTo(x + normalX * normalSize, y + normalY * normalSize);
                    this.context.stroke();
                }
            }
        }
        /**
         * A method that draws a shape (rect\polygon) object with wrapping based on the dimension parameters provided.
         * @param {object} shape object to draw.
         * @param {number} sourceX coordinate of where to draw the shape (Optional and set to zero).
         * @param {number} sourceY coordinate of where to draw the shape (Optional and set to zero).
         * @param {number} obj.lineWidth width of the shape's lines  (Optional and set to 1).
         * @param {string} obj.color of the shape's lines.
         * @param {boolean} obj.drawNormals determines if the normals should be drawn (Default is false).
         * @param {boolean} obj.fill determines if the shape should be drawn filled (Default is false).
         * @param {string} obj.fillColor determines the fill color of the shape (Default is 'white').
         */
        drawShape(shape, sourceX = 0, sourceY = 0, { lineWidth = 1, color = 'white', drawNormals = false, fill = false, fillColor = 'white' } = {}) {
            if (shape instanceof hamonengine.geometry.rect) {
                this.drawRect(shape, sourceX, sourceY, { lineWidth, color, drawNormals, fill, fillColor });
            }

            if (shape instanceof hamonengine.geometry.polygon) {
                this.drawPolygon(shape, sourceX, sourceY, { lineWidth, color, drawNormals, fill, fillColor });
            }

            if (shape instanceof hamonengine.geometry.lineSegment) {
                this.drawLineSegment(shape, sourceX, sourceY, { lineWidth, drawNormals, color });
            }

            if (shape instanceof hamonengine.geometry.polyChain) {
                this.drawPolyChain(shape, sourceX, sourceY, { lineWidth, drawNormals, color });
            }
        }
        __simpleDrawEllipse(ellipse, sourceX = 0, sourceY = 0, radiusX = 1, radiusY = 1, { lineWidth = 1, color = 'white', drawNormals = false, fill = false, fillColor = 'white' } = {}) {
            /*
            if (!(ellipse instanceof hamonengine.geometry.ellipse)) {
                throw "Parameter polygon is not of type hamonengine.geometry.ellipse.";
            }*/

            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = color;
            this.context.fillStyle = fillColor;

            this.context.beginPath();
            this.context.ellipse(sourceX, sourceY, radiusX, radiusY, 0, Math.PI2, true);

            //Complete the shape and draw the ellipse.
            this.context.closePath();
            fill && this.context.fill();
            this.context.stroke();

            /*
            if (hamonengine.debug && drawNormals) {
                this.context.strokeStyle = 'white';
                this.context.lineTo(x + normal.x * normalSize, y + normal.y * normalSize);
                this.context.stroke();
            }
            */
        }
        /**
         * Releases resources.
         */
        release() {
            delete this._canvasId;
            delete this._canvas;
            delete this._canvasContext;
        }
    }
})();