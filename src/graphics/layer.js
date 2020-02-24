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

    hamonengine.graphics.layer = class {
        constructor(options) {
            options = options || {};

            this._canvasId = options.canvasId || '';
            this._name = options.name || '';
            this._alpha = options.alpha !== undefined ? options.alpha : false;
            this._allowEventBinding = options.allowEventBinding !== undefined ? options.allowEventBinding : false;
            this._wrapVertical = options.wrapVertical !== undefined ? options.wrapVertical : false;
            this._wrapHorizontal = options.wrapHorizontal !== undefined ? options.wrapHorizontal : false;
            this._clipToViewPort = options.clipToViewPort !== undefined ? options.clipToViewPort : true;

            //DOM Contexts.
            if (!this._canvasId) {
                console.error(`[hamonengine.graphics.layer.constructor] Invalid canvasId: '${this._canvasId}' unable to create the engine!`);
                throw 'Cannot create the engine';
            }

            this._canvas = document.getElementById(this._canvasId);

            if (!this._canvas) {
                console.error(`[hamonengine.graphics.layer.constructor] Invalid canvas: '${this._canvasId}' unable to create the engine!`);
                throw 'Cannot create the engine';
            }

            //Try to get the 2d context.
            try {
                this._canvasContext = this._canvas.getContext('2d', {
                    alpha: this._alpha
                });
            }
            catch(err) {
            }

            this.enableImageSmoothing(options.enableImageSmoothing);

            if (!this._canvasContext) {
                console.error(`[hamonengine.graphics.layer.constructor] Unable to get the 2d context: '${this._canvasId}' unable to create the engine!`);
                throw 'Cannot create the engine';
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
         * Get the width of the layer.
         */
        get width () {
            return this._canvas.width;
        }
        /**
         * Get the width of the layer.
         */
        get height () {
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
         * Returns true if the layer is clipping to the viewport.
         */
        get clipToViewPort() {
            return this._clipToViewPort;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Toggles images smoothing.
         * @param {boolean} enable true to enable.
         */
        enableImageSmoothing(enable=true) {
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
        clear(x=this.viewPort.x, y=this.viewPort.y, width=this.viewPort.width, height=this.viewPort.height) {
            this._wasReset = false;
            this.context.clearRect(x,y,width,height);
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
        save () {
            this.allowSaveState && this.context.save();
        }
        /**
         * Restores the current transformation state.
         */
        restore () {
            this.allowSaveState && this.context.restore();
        }
        /**
         * Draws the image to the size of the layer.
         * @param {*} image to draw
         * @param {*} x coordinate, set to viewport by default.
         * @param {*} y coordinate, set to viewport by default.
         */
        fillLayerImage(image, x=this.viewPort.x, y=this.viewPort.y) {
            this.context.drawImage(image, x, y, this.viewPort.width, this.viewPort.height);
        }
        /**
         * Begins default painting on this layer.
        */
        beginPainting () {
            this.clear();

            if (this.borderColor) {
                this.context.strokeStyle = this.borderColor;
                this.context.strokeRect(this.viewPort.x, this.viewPort.y, this.viewPort.width, this.viewPort.height);
            }

            //Determine if viewport clipping is enabled.
            if (this.clipToViewPort) {
                //Broken for readability
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
        endPainting () {
            this.reset();
        }
        /**
         * A wrapper method that draws the image (where the image can be a CanvasImageSource derived class or a hamonengine.graphics.imageext) based on the dimension parameters provided.
         * Refer to the details that can be found at MDN: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
         * @param {*} image 
         * @param {*} sourceX 
         * @param {*} sourceY 
         * @param {*} sourceWidth 
         * @param {*} sourceHeight 
         * @param {*} destinationX 
         * @param {*} destinationY 
         * @param {*} destinationWidth 
         * @param {*} destinationHeight 
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
    }
})();