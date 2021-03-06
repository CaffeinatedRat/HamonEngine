/**
* Copyright (c) 2020-2021, CaffeinatedRat.
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
        constructor(options = {}) {

            this._canvasId = options.canvasId || '';
            this._name = options.name || '';

            this._alpha = options.alpha !== undefined ? options.alpha : false;
            this._backgroundColor = options.backgroundColor || 'black';
            this._allowEventBinding = options.allowEventBinding !== undefined ? options.allowEventBinding : false;
            this._wrapVertical = options.wrapVertical !== undefined ? options.wrapVertical : false;
            this._wrapHorizontal = options.wrapHorizontal !== undefined ? options.wrapHorizontal : false;
            this._clipToViewPort = options.clipToViewPort !== undefined ? options.clipToViewPort : true;
            this._enableImageSmoothing = options.enableImageSmoothing !== undefined ? options.enableImageSmoothing : true;
            this._invertYAxis = options.invertYAxis !== undefined ? options.invertYAxis : false;
            this._invertXAxis = options.invertXAxis !== undefined ? options.invertXAxis : false;

            //Get the canvas is one is provided.
            const canvas = options.canvas;

            //Verify the CanvasId or Canvas exists.
            if (!this._canvasId && !canvas) {
                console.error(`[hamonengine.graphics.layer.constructor] Invalid canvasId '${this._canvasId}' or canvas. Unable to create the layer!`);
                throw 'Cannot create the layer';
            }

            //Check for a canvas first before looking for one in the DOM.
            if (canvas) {
                this._canvas = canvas;
                this._canvasId = canvas.id;
                this._name = options.name || canvas.getAttribute('name');
            }
            else {
                this._canvas = document.getElementById(this._canvasId);
            }

            if (!this._canvas) {
                console.error(`[hamonengine.graphics.layer.constructor] Invalid canvas: '${this._canvasId}' unable to create the layer!`);
                throw 'Cannot create the layer';
            }

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

            //Set the viewport to the size of the layer by default.
            this._viewPort = options.viewPort || new hamonengine.geometry.rect(0, 0, this._canvas.width, this._canvas.height);

            //By default, the layer was not reset.
            this._wasReset = false;

            //By default, allows users of this layer to save the current transformation state.
            this._allowSaveStateEnabled = true;

            //Allow the viewport border to be drawn.
            this._viewPortBorderColor = '';

            hamonengine.util.logger.debug(`[hamonengine.graphics.layer.constructor] Canvas Id: ${this._canvasId}`);
            hamonengine.util.logger.debug(`[hamonengine.graphics.layer.constructor] Name: ${this._name}`);
            hamonengine.util.logger.debug(`[hamonengine.graphics.layer.constructor] Alpha: ${this._alpha}`);
            hamonengine.util.logger.debug(`[hamonengine.graphics.layer.constructor] AllowEventBinding: ${this._allowEventBinding}`);
            hamonengine.util.logger.debug(`[hamonengine.graphics.layer.constructor] WrapVertical: ${this._wrapVertical}`);
            hamonengine.util.logger.debug(`[hamonengine.graphics.layer.constructor] WrapHorizontal: ${this._wrapHorizontal}`);
            hamonengine.util.logger.debug(`[hamonengine.graphics.layer.constructor] ClipToViewPort: ${this._clipToViewPort}`);
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
            return this._canvas.width;
        }
        /**
         * Get the width of the layer.
         */
        get height() {
            return this._canvas.height;
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
            const boundRect = this.canvas.getBoundingClientRect() || { left: 0, top: 0};
            return new hamonengine.geometry.vector2(boundRect.left, boundRect.top);
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
            return this._invertYAxis;
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
            return this._invertXAxis;
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
        static createNewCanvas(width, height, id='', name='') {
            const canvas = document.createElement('canvas');
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            if (id) {
                canvas.setAttribute('id', id);
            }
            if (name) {
                canvas.setAttribute('name', name);
            }
            return canvas;
        }        
        /**
         * Clones the current layer with a new id & name and creates a new canvas element, while retaining all other properties from the source.
         * @param {string} canvasId of the new layer.
         * @param {string} name of the new layer.
         * @param {*} elementToAttach to attach the canvas.
         */
        clone(canvasId, name, elementToAttach=null) {

            //Create a new canvas element and attach it after the original.
            const newCanvas = hamonengine.graphics.layer.createNewCanvas(this.width, this.height, canvasId, name);
            //elementToAttach = elementToAttach || this.canvas.parentNode;
            elementToAttach && elementToAttach.insertBefore(newCanvas,null);

            //Create a new canvas instance.
            const newLayer = new hamonengine.graphics.layer({
                canvasId: canvasId,
                name: name,
                canvas: newCanvas,
                alpha: this.alpha,
                allowEventBinding: this.allowEventBinding,
                wrapVertical: this.wrapVertical,
                wrapHorizontal: this.wrapHorizontal,
                clipToViewPort: this.clipToViewPort,
                enableImageSmoothing: this._enableImageSmoothing,
                invertYAxis: this.invertYAxis,
                invertXAxis: this.invertXAxis,
                viewPort: this.viewPort
            });

            //Copy non-public properties.
            newLayer._allowSaveStateEnabled = this._allowSaveStateEnabled;
            newLayer._viewPortBorderColor = this._viewPortBorderColor;

            return newLayer;
        }
        /**
         * Toggles images smoothing.
         * @param {boolean} enable true to enable.
         */
        enableImageSmoothing(enable = true) {
            hamonengine.util.logger.debug(`[hamonengine.graphics.layer.constructor] EnableImageSmoothing: ${enable}`);
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

            // --- 3/7/21 --- Handle the Chromium 89 bug where if alpha is set to false, ClearRect will not properly clear the canvas resulting in a mirroring effect.
            // This is not an issue in Firefox and was not an issue before Chromium 89.
            if (this._workAround) {
                const originalFillStyle = this.context.fillStyle;
                this.context.fillStyle = this._backgroundColor;
                this.context.fillRect(x, y, width, height);
                this.context.fillStyle = originalFillStyle;
            }
        }
        /**
         * Resets the transformation.
         */
        reset() {
            if (!this._wasReset) {
                this.context.resetTransform();
                this._wasReset = true;
            }
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
         * Begins default painting on this layer.
        */
        beginPainting() {
            this.clear();

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
            this.reset();
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
         * @param {string} obj.font of the text.
         * @param {string} obj.color of the text.
         * @param {number} obj.textDrawType format to draw, by default this is TEXT_DRAW_TYPE.FILL.
         */
        drawText(text, sourceX = 0, sourceY = 0, {font = '16px serif', color = 'white', textDrawType = TEXT_DRAW_TYPE.FILL} = {}) {
            this.context.font = font;
            this.context.textBaseline = 'top';
            if (textDrawType === TEXT_DRAW_TYPE.STROKE) {
                this.context.strokeStyle = color;
                this.context.strokeText(text, sourceX, sourceY);
            }
            else {
                this.context.fillStyle = color;
                this.context.fillText(text, sourceX, sourceY);
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
         * A method that draws the vector2 or vector3 object with no wrapping (hamonengine.geometry.vector2 or hamonengine.geometry.vector3) based on the dimension parameters provided.
         * @param {object} vector object to draw.
         * @param {number} sourceX coordinate of where to draw the vector (Optional and set to zero).
         * @param {number} sourceY coordinate of where to draw the vector (Optional and set to zero).
         * @param {number} obj.lineWidth width of the vector's lines  (Optional and set to 1).
         * @param {string} obj.color of the vector's lines.
         */    
        drawVector(vector, sourceX = 0, sourceY = 0, {lineWidth = 1, color = 'white'} = {}) {
            
            if (!(vector instanceof hamonengine.geometry.vector2)
                && !(vector instanceof hamonengine.geometry.vector3)) {
                throw "Parameter polygon is not of type hamonengine.geometry.vector2 or of type hamonengine.geometry.vector3.";
            }

            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = color;
            
            this.context.beginPath();
            this.context.moveTo(sourceX, sourceY);
            this.context.lineTo(sourceX + vector.x, sourceY + vector.y);

            this.context.stroke();
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
        drawRect(rect, sourceX = 0, sourceY = 0, {lineWidth = 1, color = 'white', fill = false, fillColor='white'} = {}) {
            this.simpleDrawRect(rect, sourceX, sourceY, {lineWidth, color, fill, fillColor} );

            //Handle rect wrapping.
            if (this.wrapHorizontal) {
                //DRAW RIGHT
                //Determine if the minimum vertex of a rect extends beyond the minimum edge (left side) of the viewport.
                const xOffset = (sourceX + rect.x) - this.viewPort.x;
                if (xOffset <= 0) {
                    this.simpleDrawRect(rect, this.viewPort.width + xOffset, sourceY, {lineWidth, color, fill, fillColor} );
                }

                //DRAW LEFT
                //Determine if the maximum vertex of a rect extends beyond the maximum edge (right side) of the viewport.
                if (sourceX + rect.width >= this.viewPort.width) {
                    const xOffset = this.viewPort.width - (sourceX + rect.x);
                    this.simpleDrawRect(rect, this.viewPort.x - xOffset, sourceY, {lineWidth, color, fill, fillColor} );
                }
            }

            //Handle rect wrapping.
            if (this.wrapVertical) {
                //DRAW DOWN
                //Determine if the minimum vertex of a rect extends beyond the minimum edge (top side) of the viewport.
                const yOffset = (sourceY + rect.y) - this.viewPort.y;
                if (yOffset <= 0) {
                    this.simpleDrawRect(rect, sourceX, this.viewPort.height + yOffset, {lineWidth, color, fill, fillColor} );
                }

                //DRAW UP
                //Determine if the maximum vertex of a rect extends beyond the maximum edge (bottom side) of the viewport.
                if (sourceY + rect.height >= this.viewPort.height) {
                    const yOffset = this.viewPort.height - (sourceY + rect.y);
                    this.simpleDrawRect(rect, sourceX, this.viewPort.y - yOffset, {lineWidth, color, fill, fillColor} );
                }
            }
        }     
        /**
         * A method that draws the rect object without wrapping (hamonengine.geometry.rect) based on the dimension parameters provided.
         * @param {object} rect object to draw.
         * @param {number} sourceX coordinate of where to draw the rect (Optional and set to zero).
         * @param {number} sourceY coordinate of where to draw the rect (Optional and set to zero).
         * @param {number} obj.lineWidth width of the rect's lines  (Optional and set to 1).
         * @param {string} obj.color of the rect's lines.
         * @param {boolean} obj.fill determines if the rect should be drawn filled (Default is false).
         * @param {string} obj.fillColor determines the fill color of the rect (Default is 'white').
         */
        simpleDrawRect(rect, sourceX = 0, sourceY = 0, {lineWidth = 1, color = 'white', fill = false, fillColor='white'} = {}) {

            if (!(rect instanceof hamonengine.geometry.rect)) {
                throw "Parameter rect is not of type hamonengine.geometry.rect.";
            }

            this.context.lineWidth = lineWidth;
            this.context.strokeStyle = color;
            this.context.fillStyle = fillColor;

            let x = rect.x + sourceX;
            let y = rect.y + sourceY;

            if (this.invertYAxis) {
                y = this.viewPort.height - y;
            }

            if (this.invertXAxis) {
                x = this.viewPort.width - x;
            }

            this.context.beginPath();

            this.context.moveTo(x, y);
            this.context.strokeRect(x, y, rect.width, rect.height);

            //Complete the shape and draw the rect.
            this.context.closePath();

            if (fill) {
                this.context.fillRect(x, y, rect.width, rect.height);
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
        drawPolygon(polygon, sourceX = 0, sourceY = 0, {lineWidth = 1, color = 'white', drawNormals = false, fill = false, fillColor='white'} = {}) {
            this.simpleDrawPolygon(polygon, sourceX, sourceY, {lineWidth, color, drawNormals, fill, fillColor} );

            //Handle polygon wrapping.
            if (this.wrapHorizontal) {
                //DRAW RIGHT
                //Determine if the minimum vertex of a polygon extends beyond the minimum edge (left side) of the viewport.
                const xOffset = (sourceX + polygon.min.x) - this.viewPort.x;
                if (xOffset <= 0) {
                    this.simpleDrawPolygon(polygon, this.viewPort.width + xOffset, sourceY, {lineWidth, color, drawNormals, fill, fillColor} );
                }

                //DRAW LEFT
                //Determine if the maximum vertex of a polygon extends beyond the maximum edge (right side) of the viewport.
                if (sourceX + polygon.width >= this.viewPort.width) {
                    const xOffset = this.viewPort.width - (sourceX + polygon.min.x);
                    this.simpleDrawPolygon(polygon, this.viewPort.x - xOffset, sourceY, {lineWidth, color, drawNormals, fill, fillColor} );
                }
            }

            //Handle polygon wrapping.
            if (this.wrapVertical) {
                //DRAW DOWN
                //Determine if the minimum vertex of a polygon extends beyond the minimum edge (top side) of the viewport.
                const yOffset = (sourceY + polygon.min.y) - this.viewPort.y;
                if (yOffset <= 0) {
                    this.simpleDrawPolygon(polygon, sourceX, this.viewPort.height + yOffset, {lineWidth, color, drawNormals, fill, fillColor} );
                }

                //DRAW UP
                //Determine if the maximum vertex of a polygon extends beyond the maximum edge (bottom side) of the viewport.
                if (sourceY + polygon.height >= this.viewPort.height) {
                    const yOffset = this.viewPort.height - (sourceY + polygon.min.y);
                    this.simpleDrawPolygon(polygon, sourceX, this.viewPort.y - yOffset, {lineWidth, color, drawNormals, fill, fillColor} );
                }
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
        simpleDrawPolygon(polygon, sourceX = 0, sourceY = 0, {lineWidth = 1, color = 'white', drawNormals = false, fill = false, fillColor='white'} = {}) {

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
            if (fill) {
                this.context.fill();
            }
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
                    
                    if (this.invertYAxis) {
                        normal.y = -normal.y;
                    }

                    if (this.invertXAxis) {
                        normal.x = -normal.x;
                    }

                    this.context.lineTo(x + normal.x * normalSize, y + normal.y * normalSize);
                    this.context.stroke();
                }
            }
        }
    }
})();