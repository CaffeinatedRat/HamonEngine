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
     * This class represents a screen that is a specialized layer that supports a collection of child layers to render in a chain.
     * NOTE: This class also supports general layer functionality, allowing backwards support with previous engine implementations.
     */
    hamonengine.graphics.screen = class extends hamonengine.graphics.layer {
        constructor(options = {}, cloneProps = {}) {
            //Default to black if one is not provided.
            //NOTE: Screens must have a backgroundColor in order to properly refresh the screen.
            options.backgroundColor = options.backgroundColor ?? 'black';
            super(options, cloneProps);

            //Handle copy-constructor operations.
            if (options instanceof hamonengine.graphics.screen) {
                options = {
                    guiAlwaysOnTop: options._guiAlwaysOnTop,
                    layers: options.layers.map(layer => layer.clone(layer.id, layer.name)),
                    engine: options.engine,
                    enableFPSCounter: options.enableFPSCounter,
                    fpsCounterTextColor: options.fpsCounterTextColor,
                    fpsCounter: options.fpsCounter
                }
            }

            //Standard properties.
            //Determine if the GUI is always the top most layer.
            this._engine = options.engine;
            this._enableFPSCounter = options.enableFPSCounter === undefined ? true : false;
            this._guiAlwaysOnTop = options.guiAlwaysOnTop === undefined ? true : false;

            //Allow for a custom FPS counter.
            //NOTE: The class MUST support the following methods: begin & end and properties FPS, minFPS, & maxFPS.
            this._fpsCounter = options.fpsCounter ?? new fpscounter();
            this._fpsCounterTextColor = options.fpsCounterTextColor ?? 'lime';

            this._layers = options.layers ?? [];

            if (hamonengine.debug) {
                console.debug(`[hamonengine.graphics.screen.constructor] Name: ${this._name}`);
            }
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        /**
         * Gets a parental engine reference if one exists.
         * NOTE: This can be undefined if it wasn't assigned during instantiation.
         */
        get engine() {
            return this._engine;
        }
        /**
         * Gets a collection of layers.
         */
        get layers() {
            return this._layers || [];
        }
        /**
         * Returns the primary layer.
         */
        get primaryLayer() {
            return this;
        }
        /**
         * Returns the enabled status of drawing FPS to the screen.
         */
        get enableFPSCounter() {
            return this._enableFPSCounter;
        }
        /**
         * Enables or disables drawing FPS to the screen.
         */
        set enableFPSCounter(v) {
            this._enableFPSCounter = v;
        }
        /**
         * Returns the current FPSCounter.
         * If none was assigned then the engine's default one is used.
         * NOTE: The class MUST support the following methods: begin & end and properties FPS, minFPS, & maxFPS.
         */
        get fpsCounter() {
            return this._fpsCounter || this.engine?.fpsCounter;
        }
        /**
         * Assigns a custom FPSCounter.
         * NOTE: The class MUST support the following methods: begin & end and properties FPS, minFPS, & maxFPS.
         */
        set fpsCounter(v) {
            this._fpsCounter = v;
        }
        /**
         * Returns the fpsCounter text color.
         */
        get fpsCounterTextColor() {
            return this._fpsCounterTextColor;
        }
        /**
         * Sets the fpsCounter text color.
         */
        set fpsCounterTextColor(v) {
            this._fpsCounterTextColor = v;
        }
        /**
         * Returns true if wrapping horizontally is enabled on all layers.
         */
        get wrapHorizontal() {
            return super.wrapHorizontal;
        }
        /**
         * Enables or disables horizontal wrapping on all layers.
         */
        set wrapHorizontal(v) {
            super.wrapHorizontal = v;
            for (let i = 0; i < this.layers.length; i++) {
                if (this._layers[i]) {
                    this._layers[i].wrapHorizontal = v;
                }
            }
        }
        /**
         * Returns true if wrapping vertically is enabled on all layers.
         */
        get wrapVertical() {
            return super.wrapVertical;
        }
        /**
         * Enables or disables veritcal wrapping on all layers.
         */
        set wrapVertical(v) {
            super.wrapVertical = v;
            for (let i = 0; i < this.layers.length; i++) {
                if (this._layers[i]) {
                    this._layers[i].wrapVertical = v;
                }
            }
        }
        /**
        * Returns true if the Y-Axis is inverted on all layers.
        */
        get invertYAxis() {
            return super.invertYAxis;
        }
        /**
         * Inverts the Y-Axis if true on all layers.
         */
        set invertYAxis(v) {
            super.invertYAxis = v;
            for (let i = 0; i < this.layers.length; i++) {
                if (this._layers[i]) {
                    this._layers[i].invertYAxis = v;
                }
            }
        }
        /**
         * Returns true if the X-Axis is inverted on all layers.
         */
        get invertXAxis() {
            return super.invertXAxis;
        }
        /**
         * Inverts the X-Axis if true on all layers.
         */
        set invertXAxis(v) {
            super.invertXAxis = v;
            for (let i = 0; i < this.layers.length; i++) {
                if (this._layers[i]) {
                    this._layers[i].invertXAxis = v;
                }
            }
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Converts the screen to a new hamonengine.graphics.layer.
         * @param {string} canvasId of the new layer.
         * @param {string} name of the new layer.
         * @param {*} elementToAttach to attach the canvas.
         */
        toLayer(canvasId, name) {
            canvasId = canvasId || this.id;
            name = name || this.name;
            const newLayer = new hamonengine.graphics.layer(this, {
                canvas: hamonengine.graphics.layer.createNewCanvas(this.width, this.height, canvasId, name)
            });
            newLayer.drawLayer(this);
            return newLayer;
        }
        /**
         * Clones the current layer with a new id & name and creates a new canvas element, while retaining all other properties from the source.
         * @param {string} canvasId of the new layer.
         * @param {string} name of the new layer.
         * @param {*} elementToAttach to attach the canvas.
         */
        clone(canvasId, name, elementToAttach = null) {
            //Create a new canvas element and attach it after the original.
            const newCanvas = hamonengine.graphics.layer.createNewCanvas(this.width, this.height, canvasId, name);
            //Layers can no longer be attached to an element, as this is reserved for screens.
            elementToAttach?.insertBefore(newCanvas, null);

            //Create a new canvas instance.
            return new hamonengine.graphics.screen(this, {
                canvas: newCanvas
            });
        }
        /**
         * A start method that handles any pre-work a screen must do before working.
         */
        start() {
            this.fpsCounter.start();
        }
        //--------------------------------------------------------
        // Layer Methods
        //--------------------------------------------------------
        /**
         * Returns a layer by its name.
         * @param {string} name of the layer to return.
         */
        getLayer(name) {
            return this.layers.find(layer => (layer?.name || '').toLowerCase().trim() === (name || '').toLowerCase().trim());
        }
        /**
         * Returns the index of the layer by its name.
         * @param {string} name of the layer to return.
         * @returns {number} index of the layer.
         */
        getLayerIndex(name) {
            return this.layers.findIndex(layer => (layer?.name || '').toLowerCase().trim() === (name || '').toLowerCase().trim());
        }
        /**
         * Adds a new layer to the screen.
         * @param {string} name of the new layer.
         * @returns {object} layer being added to the screen.
         */
        addLayer(name) {
            const newLayer = super.clone(name, name);
            this.layers.push(newLayer);
            return newLayer;
        }
        /**
         * Swaps the two layers by their name.
         * @param {string} source name of the layer to swap.
         * @param {string} target name of the layer to swap.
         */
        swapLayer(source, target) {
            const sourceIndex = this.getLayerIndex(source);
            const targetIndex = this.getLayerIndex(target);
            if (sourceIndex > -1 && targetIndex > -1) {
                const swap = this.layers[sourceIndex];
                this.layers[sourceIndex] = this.layers[targetIndex];
                this.layers[targetIndex] = swap;
            }
        }
        /**
         * Removes a layer by its name.
         * @param {string} name of the new layer.
         * @returns {object} layer that is being removed from the screen.
         */
        removeLayer(name) {
            let layerToReturn;
            const index = this.getLayerIndex(name);
            if (index > -1 && index < this.layers.length) {
                layerToReturn = this.layers[index];
                this.layers[index] = null;
            }
            return layerToReturn;
        }
        /**
         * Removes all layers.
         */
        removeAllLayers() {
            for (let i = 0; i < this.layers.length; i++) {
                this._layers[i] && this._layers[i].release();
            }

            this._layers = [];
        }
        /**
         * Rebuilds the layers array by removing dead/deleted layers.
         */
        pruneLayers() {
            this._layers = this._layers.filter(layer => layer);
        }
        /**
         * Reverses all layers.
         * WARNING: This is a mutable change.
         */
        reverseLayers() {
            this._layers.reverse();
        }
        //--------------------------------------------------------
        // Drawing Methods
        //--------------------------------------------------------
        /**
         * Toggles global images smoothing for all layers.
         * @param {boolean} enable true to enable.
         */
        enableImageSmoothing(enable = true) {
            super.enableImageSmoothing(enable);
            for (let i = 0; i < this.layers.length; i++) {
                this._layers[i] && this._layers[i].enableImageSmoothing(enable);
            }
        }
        /**
         * Clears all layers
         * @param {*} x coordinate to clear, set to viewport by default.
         * @param {*} y coordinate to clear, set to viewport by default.
         * @param {*} width to clear, set to viewport by default.
         * @param {*} height to clear, set to viewport by default.
         */
        clear(x = this.viewPort.x, y = this.viewPort.y, width = this.viewPort.width, height = this.viewPort.height) {
            for (let i = 0; i < this.layers.length; i++) {
                this._layers[i] && this._layers[i].clear(x, y, width, height);
            }
        }
        /**
         * Resets the transformation for all layers.
         */
        reset() {
            for (let i = 0; i < this.layers.length; i++) {
                this._layers[i] && this._layers[i].reset();
            }
        }
        /**
         * Starts pre-drawing logic.
         * @param {boolean} enableFPSCounter overrides the this.enableFPSCounter property and determines if the FPSCounter should be shown.
         */
        beginPainting({enableFPSCounter} = {}) {
            if (enableFPSCounter ?? this.enableFPSCounter) {
                this.fpsCounter?.begin();
            }
            super.beginPainting();
        }
        /**
         * Draws all layers onto the screen.
         */
        draw() {
            for (let i = 0; i < this.layers.length; i++) {
                this._layers[i] && this._layers[i]?.visible && this.drawLayer(this.layers[i]);
            }
        }
        /**
         * Ends the screen with some post drawing method.
         * @param {boolean} enableFPSCounter overrides the this.enableFPSCounter property and determines if the FPSCounter should be shown.
         */
        endPainting({enableFPSCounter} = {}) {
            if (enableFPSCounter ?? this.enableFPSCounter) {
                if (this.fpsCounter) {
                    this.fpsCounter.end();
                    this.drawFPSCounter(0, 0, {color: this.fpsCounterTextColor, shadow: true, shadowXOffset: 1, shadowYOffset: 1});
                }
            }
            super.endPainting();
        }
        /**
         * A helper method that draws the FPSCounter text to this screen.
         * @param {object} fpsCounter to render to the layer.
         * @param {number} sourceX coordinate of where to draw the fpsCounter (Optional and set to zero).
         * @param {number} sourceY coordinate of where to draw the fpsCounter (Optional and set to zero).
         * @param {string} font of the text.  By default this is set to '16px serif'
         * @param {string} color of the text.  By default this is 'lime'.
         * @param {boolean} shadow draws a shadow under the text.  By default this is false.
         */
        drawFPSCounter(sourceX = 0, sourceY = 0, options = { color: 'lime', shadow: false}) {
            this.drawText(`FPS: ${this.fpsCounter.FPS} (${this.fpsCounter.minFPS} - ${this.fpsCounter.maxFPS})`, sourceX, sourceY, { ...options, ...{disableMetrics: true} });
        }
        /**
         * Releases resources.
         */
        release() {
            super.release();
            this.removeAllLayers();
        }
    }
})();