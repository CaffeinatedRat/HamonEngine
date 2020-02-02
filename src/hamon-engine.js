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

hamonengine.core = hamonengine.core || {};

(function() {
    const ENGINE_STATES = {
        STOPPED: 0,
        STARTED: 1,
        LOADING: 2,
        RUNNING: 3
    };

    const cavnas_default_name = 'canvas';
    const VERSION = '0.1.0';

    hamonengine.core.engine = class {
        constructor(options) {
            options = options || {};
            
            hamonengine.util.logger.debug(`HamonEngine -- Using version: ${VERSION}`);

            //Options.
            this._movementRate = options.movementRate || 0.25;
            this._size = options.size || 64;

            //Initialize internal states 
            this._state = ENGINE_STATES.STOPPED;
            this._startTimeStamp = 0;
            this._lastFrameTimeStamp = 0;
            this._testIndex = 12;
            
            //Add support for multiple layers that will house our canvas, and other drawing components.
            this._layers = {};
            let index = 0;
            options.canvas.forEach((canvas)=> {
                let canvasName = canvas.name || `${cavnas_default_name}${index++}`;
                this._layers[canvasName]= new hamonengine.graphics.layer({
                    name: canvasName,
                    canvasId: canvas.id,
                    viewPort: canvas.viewPort,
                    allowEventBinding: canvas.allowEventBinding,
                    enableImageSmoothing: options.enableImageSmoothing,
                    clipToViewPort: canvas.clipToViewPort
                });
            });

            this._resourcesLoaded = false;

            //Log initialization values
            hamonengine.util.logger.debug(`[hamonengine.core.engine.constructor] MovementRate: ${this._movementRate}`);
            hamonengine.util.logger.debug(`[hamonengine.core.engine.constructor] State: ${this._state}`);
        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        get primaryLayer() {
            return this._layers[`${cavnas_default_name}0`];
        }
        /**
         * Returns true if the resource are loaded.
         */
        get resourcesLoaded() {
            return this._resourcesLoaded;
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Returns the layer by name.
         * @param {string} name of the layer.
         */
        getLayer(name) {
            return this._layers[name];
        }
        /**
         * Preloads any extra resources.
         */
        load() {
            hamonengine.util.logger.debug("[hamonengine.core.engine.load]");

            this._state = ENGINE_STATES.LOADING;
            hamonengine.util.logger.debug(`[hamonengine.core.engine.constructor] State: ${this._state}`);

            //TODO: REMOVE Hardcoded id.
            this._stats = new Stats();
            this._stats.domElement.style.position = 'absolute';
            this._stats.domElement.style.left = '0px';
            this._stats.domElement.style.top = '0px';
            let parentElement = document.getElementById('canvas-wrapper');
            parentElement.insertBefore(this._stats.domElement, parentElement.firstChild);

            this.onEventBinding().then(() => {
                hamonengine.util.logger.debug("[hamonengine.core.engine.load] Event binding completed.");
            });

            //Load resources.
            this.onloadResources().then(() => {
                this._resourcesLoaded = true;
                hamonengine.util.logger.debug("[hamonengine.core.engine.load] Load resources completed.");
            }).catch(error => {
                hamonengine.util.logger.debug("[hamonengine.core.engine.load] Failed!");
                this.stop();
            });

            //Allow chaining.
            return this;
        }
        /**
         * Starts the engine.
         */
        start() {
            hamonengine.util.logger.debug("[hamonengine.core.engine.start]");

            //Don't start the engine until we are in a loading state.
            if (this._state === ENGINE_STATES.LOADING) {
                this._state = ENGINE_STATES.STARTED;
                hamonengine.util.logger.debug(`[hamonengine.core.engine.start] State: ${this._state}`);

                this.onDraw(0);
            }

            //Allow chaining.
            return this;
        }
        /**
         * Stops the engine.
         */
        stop() {
            hamonengine.util.logger.debug("[hamonengine.core.engine.stop]");
            window.cancelAnimationFrame(this._animationId);
            this._animationId = 0;
            this._startTimeStamp = 0;
            this._state = ENGINE_STATES.STOPPED;
            hamonengine.util.logger.debug(`[hamonengine.core.engine.stop] State: ${this._state}`);

            //Allow chaining.
            return this;
        }
        //--------------------------------------------------------
        // Internal Events
        //--------------------------------------------------------
        /**
         * An internal event that occurs when attempting to load resources.
         * @returns {object} a promise that the resource has loaded successfully.
         */
        onloadResources() {
            hamonengine.util.logger.debug("[hamonengine.core.engine.onloadResources]");
        }
        /**
         * Starts binding the events.
         */
        onEventBinding() {
            return new Promise((resolve, reject) => {
                //Only being adding events when the DOM has completed loading.
                window.addEventListener('DOMContentLoaded', (event) => {
                    //TODO: Decide if this should be moved into the layer.
                    // If this is moved into the layers, then it is no longer a graphics based entity, but a graphics & input entity.
                    this._layers.forEach( (key, layer) => {
                        if (layer.allowEventBinding) {
                            layer.canvas.addEventListener('keyup', (e) => {this.onKeyUp(e.code, e, layer);});
                            layer.canvas.addEventListener('keydown', (e) => {this.onKeyDown(e.code, e, layer);});
                            layer.canvas.addEventListener('click', (e) => {this.onMouseClick(e, layer);});
                            layer.canvas.addEventListener('mouseup', (e) => {this.onMouseUp(new hamonengine.geometry.vector2( 
                                e.clientX,
                                e.clientY
                            ), e, layer);});
                            layer.canvas.addEventListener('mousedown', (e) => {this.onMouseDown(new hamonengine.geometry.vector2( 
                                e.clientX,
                                e.clientY
                            ), e, layer);});
                
                            layer.canvas.addEventListener("touchstart", (e) => {
                                let touches = [];
                                for(let i = 0; i < e.touches.length; i++) {
                                    touches.push({
                                        left: e.touches[i].clientX - (layer.offsetX || 0),
                                        top: e.touches[i].clientY - (layer.offsetY || 0)
                                    });
                                }
                                this.onTouchStart(e, touches, layer);
                            });
                            layer.canvas.addEventListener("touchend", (e) => {
                                this.onTouchEnd(e, layer);
                            });
                            layer.canvas.addEventListener("touchcancel", (e) => {
                                this.onTouchCancel(e, layer);
                            });
                            layer.canvas.addEventListener("touchmove", (e) => {
                                let touches = [];
                                for(let i = 0; i < e.touches.length; i++) {
                                    touches.push({
                                        left: e.touches[i].clientX - (layer.offsetX || 0),
                                        top: e.touches[i].clientY - (layer.offsetY || 0)
                                    });
                                }
                                this.onTouchMove(e, touches, layer);
                            });
                        }
                    });
                });

                resolve();
            });
        }

        //--------------------------------------------------------
        // Events
        //--------------------------------------------------------       
        onMouseClick(e, layer) {
            hamonengine.util.logger.debug(`[hamonengine.core.engine.onMouseClick] '${e}'`);
        }
        onMouseUp(v, e, layer) {
            hamonengine.util.logger.debug(`[hamonengine.core.engine.onMouseUp] '${v.toString()}'`);
        }
        onMouseDown(v, e, layer) {
            hamonengine.util.logger.debug(`[hamonengine.core.engine.onMouseDown] '${v.toString()}'`);
        }
        onKeyUp(keyCode, e, layer) {
            hamonengine.util.logger.debug(`[hamonengine.core.engine.onKeyUp] '${keyCode}'`);
        }
        onKeyDown(keyCode, e, layer) {
            hamonengine.util.logger.debug(`[hamonengine.core.engine.onKeyDown] '${keyCode}'`);
        }
        onTouchStart(e, touches, layer) {
            e.preventDefault();
            hamonengine.util.logger.debug(`[hamonengine.core.engine.onTouchStart] '${e}'`);
        }
        onTouchMove(e, touches, layer) {
            e.preventDefault();
            hamonengine.util.logger.debug(`[hamonengine.core.engine.onTouchMove] '${e}'`);
        }
        onTouchEnd(e, layer) {
            e.preventDefault();
            hamonengine.util.logger.debug(`[hamonengine.core.engine.onTouchEnd] '${e}'`);
        }
        onTouchCancel(e, layer) {
            e.preventDefault();
            hamonengine.util.logger.debug(`[hamonengine.core.engine.onTouchCancel] '${e}'`);
        }
        /**
         * A draw loop event that is triggered once the engine starts.
         * @param {Number} timestampInMilliseconds elapsed since the origin.  See DOMHighResTimeStamp.
         */
        onDraw(timestampInMilliseconds) {

            //Normalize the timestamp to prevent undefined or NaN.
            timestampInMilliseconds = (timestampInMilliseconds || 0);

            //Set the start timestamp when the engine first starts up.
            if (!this._startTimeStamp) {
                this._startTimeStamp = timestampInMilliseconds;
            }

            //Get the time elapsed since the engine started.
            let elapsedTimeInMilliseconds = timestampInMilliseconds - this._lastFrameTimeStamp;

            //hamonengine.util.logger.debug("[hamonengine.core.engine.onDraw]");
            try {
                //NOTE: We need the scoped version of the timestamp argument to get the DOMHighResTimeStamp parameter.
                //If this parameter is removed then the timestamp will always be zero.
                this._animationId = window.requestAnimationFrame((scopedTimestampInMS) => {
                    this._state = ENGINE_STATES.RUNNING;
                    this._stats.begin();
                    this.onFrame(elapsedTimeInMilliseconds);
                    this._stats.end();
                    this.onDraw(scopedTimestampInMS);
                });
            }
            catch(exception) {
                this.stop();
                hamonengine.util.logger.debug(exception);
            }

            //Record the timestamp of the current frame.
            this._lastFrameTimeStamp = timestampInMilliseconds;

            return this;
        }
        /**
         * An onFrame event that is triggered when a single frame is being rendered to the canvas.
         * @param {number} elapsedTimeInMilliseconds since the engine has started.
         */
        onFrame(elapsedTimeInMilliseconds) {
            return this;
        }
    }
})();