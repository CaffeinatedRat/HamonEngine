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

hamonengine.core = hamonengine.core || {};

(function() {
    const ENGINE_STATES = {
        STOPPED: 0,
        STARTED: 1,
        LOADING: 2,
        RUNNING: 3
    };

    const ENGINE_STATES_NAMES = [
        "STOPPED",
        "STARTED",
        "LOADING",
        "RUNNING"
    ];

    const canvas_default_name = 'canvas';
    const VERSION = '0.1.1';

    hamonengine.core.engine = class {
        constructor(options={}) {
            
            hamonengine.util.logger.info(`HamonEngine -- Using version: ${VERSION}`);

            //Options.
            this._movementRate = options.movementRate || 0.25;
            this._size = options.size || 64;
            this._showFPS = options.showFPS !== undefined ? options.showFPS : false;
            this._syncFrames = options.syncFrames !== undefined ? options.syncFrames : false;
            this._splashScreenWait = options.splashScreenWait !== undefined ? options.splashScreenWait : 500;
            this._detectCanvas = options.detectCanvas !== undefined ? options.detectCanvas : false;
            this._allowDocumentEventBinding = options.allowDocumentEventBinding !== undefined ? options.allowDocumentEventBinding : false;
            this._captureTouchAsMouseEvents = options.captureTouchAsMouseEvents !== undefined ? options.captureTouchAsMouseEvents : true;

            //Initialize internal states 
            this._state = ENGINE_STATES.STOPPED;
            this._startTimeStamp = 0;
            this._lastFrameTimeStamp = 0;
            this._animationId = 0;
            this._fpsCounter = new fpscounter();
            
            //Add support for multiple layers that will house our canvas, and other drawing components.
            this._layers = {};

            //Try to detect all canvas if the feature is enabled and none are passsed in.
            const canvasCollection = options.canvas || [];
            if (this._detectCanvas && canvasCollection.length === 0) {
                hamonengine.util.logger.debug(`[hamonengine.core.engine.constructor] DetectCanvas: true.  Attempting to detect all canvas.`);
                const discoveredCanvas = Object.entries(document.getElementsByTagName('canvas'));
                discoveredCanvas.forEach(([key, value]) => {
                    const canvasName = value.getAttribute('name') || `${canvas_default_name}${key}`;
                     this._layers[canvasName]= new hamonengine.graphics.layer({
                        name: canvasName,
                        canvas: value,
                        allowEventBinding: value.dataset.alloweventbinding,
                        enableImageSmoothing:  value.dataset.enableimagesmoothing,
                        clipToViewPort: value.dataset.alloweventbinding
                    });
                });    
            }
            //If a collection of canvas objects are provided then use those instead.
            else {
                hamonengine.util.logger.debug(`[hamonengine.core.engine.constructor] DetectCanvas: false.  Using collection of options.canvas.`);
                let index = 0;
                for (let i = 0; i < canvasCollection.length; i ++) {
                    const canvas = canvasCollection[i];
                    const canvasName = canvas.name || `${canvas_default_name}${index++}`;
                    this._layers[canvasName]= new hamonengine.graphics.layer({
                        name: canvasName,
                        canvasId: canvas.id,
                        viewPort: canvas.viewPort,
                        allowEventBinding: canvas.allowEventBinding,
                        enableImageSmoothing: options.enableImageSmoothing,
                        clipToViewPort: canvas.clipToViewPort
                    });
                };
            }

            this._resourcesLoaded = false;

            //Log initialization values
            hamonengine.util.logger.debug(`[hamonengine.core.engine.constructor] MovementRate: ${this._movementRate}`);
            hamonengine.util.logger.debug(`[hamonengine.core.engine.constructor] State: ${ENGINE_STATES_NAMES[this._state]}`);
            hamonengine.util.logger.debug(`[hamonengine.core.engine.constructor] SyncFrames: ${this.syncFrames ? 'Enabled' : 'Disabled'}`);
            hamonengine.util.logger.debug(`[hamonengine.core.engine.constructor] SplashScreen Wait Time: ${this._splashScreenWait} milliseconds.`);

            hamonengine.util.logger.debug(`[hamonengine.core.engine.constructor] Global States`);
            hamonengine.util.logger.debug(`[hamonengine.core.engine.constructor] hamonengine.geometry.settings.collisionDetection.floor: ${hamonengine.geometry.settings.collisionDetection.floor}`);
            hamonengine.util.logger.debug(`[hamonengine.core.engine.constructor] hamonengine.geometry.settings.collisionDetection.limit: ${hamonengine.geometry.settings.collisionDetection.limit}`);
            hamonengine.util.logger.debug(`[hamonengine.core.engine.constructor] hamonengine.geometry.settings.coordinateSystem: ${hamonengine.geometry.settings.coordinateSystem}`);

        }
        //--------------------------------------------------------
        // Properties
        //--------------------------------------------------------
        get primaryLayer() {
            return this._layers[`${canvas_default_name}0`];
        }
        /**
         * Returns true if the resource are loaded.
         */
        get resourcesLoaded() {
            return this._resourcesLoaded;
        }
        /**
         * Returns the primrary FPS counter for the engine.
         */
        get fpsCounter() {
            return this._fpsCounter;
        }
        /**
         * Returns all registered layers
         */        
        get layers() {
            return Object.values(this._layers);
        }
        /**
         * Returns true if the processing & drawing frames are sync'ed.
         * Warning: When enabled this can impact FPS performance.
         */
        get syncFrames() {
            return this._syncFrames;
        }
        /**
         * Returns true if document event binding is allowed.
         */
        get allowDocumentEventBinding() {
            return this._allowDocumentEventBinding;
        }
        /**
         * Returns true if touch events are captured as mout events.
         */        
        get captureTouchAsMouseEvents() {
            return this._captureTouchAsMouseEvents;
        }
        /**
         * Toggles the ability to cature touch events as sync.
         */        
        set captureTouchAsMouseEvents(v) {
            this._captureTouchAsMouseEvents = v;
        }        
        /**
         * Assigns the sync value for processing & drawing frames together.
         * Warning: When enabled this can impact FPS performance.
         */
        set syncFrames(v) {
            this._syncFrames = v;
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
         * Preloads any resource loading.
         * @return {Object} a promise to complete resource loading.
         */
        async load() {
            hamonengine.util.logger.info("[hamonengine.core.engine.load]");

            //Perform a preload and wait if a splashscreen is present.
            const preloadPromise = new Promise(resolve => {
                if(this.onPreload()) {
                    setTimeout(() => resolve(), this._splashScreenWait);
                }
                else {
                    resolve();
                }
            });

            this._state = ENGINE_STATES.LOADING;
            hamonengine.util.logger.debug(`[hamonengine.core.engine.load] State: ${ENGINE_STATES_NAMES[this._state]}`);

            try {

                //Added a promise so the start can be delayed if designer so wishes to wait before starting the engine.
                let eventBindingPromise = this.onEventBinding();
                if (!(eventBindingPromise instanceof Promise)) {
                    throw 'onEventBinding is not returning a promise!  This event must return an unhandled promise.';
                }

                hamonengine.util.logger.warning("[hamonengine.core.engine.load] Engine is paused, waiting for event binding to resolve...");  
                await eventBindingPromise;
                hamonengine.util.logger.info("[hamonengine.core.engine.load] Engine has resumed loading, event binding has completed.");

                let loadingResource = this.onloadResources();
                if (!(loadingResource instanceof Promise)) {
                    throw 'onloadResources is not returning a promise!  This event must return an unhandled promise.';
                }

                hamonengine.util.logger.warning("[hamonengine.core.engine.load] Engine is paused, waiting for resources to resolve...");   
                await loadingResource;
                this._resourcesLoaded = true;
                hamonengine.util.logger.info("[hamonengine.core.engine.load] Engine has resumed loading, resource loading completed.");   
                
                //Wait at the preload promise while the other events & resources are loading.
                await preloadPromise;
                hamonengine.util.logger.info("[hamonengine.core.engine.load] Preload completed."); 
            }
            catch(error) {
                console.error("[hamonengine.core.engine.load] Resources could not be loaded due to a failure! Stopping the engine.");
                console.error(error);
                this.stop({reasons: `A critical error occured during resource loading.`});
            }

            return this;
        }
        /**
         * Starts the engine.
         */
        start() {
            hamonengine.util.logger.info("[hamonengine.core.engine.start]");

            //Don't start the engine until we are in a loading state.
            if (this._state === ENGINE_STATES.LOADING) {
                this._state = ENGINE_STATES.STARTED;
                hamonengine.util.logger.debug(`[hamonengine.core.engine.start] State: ${ENGINE_STATES_NAMES[this._state]}`);

                this.fpsCounter.start();
                this.onDraw(0);
            }

            //Allow chaining.
            return this;
        }
        /**
         * Stops the engine.
         */
        stop({reasons} = {reasons: 'Stopped By User'}) {
            hamonengine.util.logger.info("[hamonengine.core.engine.stop]");
            window.cancelAnimationFrame(this._animationId);
            this._animationId = 0;
            this._startTimeStamp = 0;
            this._state = ENGINE_STATES.STOPPED;
            hamonengine.util.logger.debug(`[hamonengine.core.engine.stop] State: ${ENGINE_STATES_NAMES[this._state]}`);

            //Let everyone know the engine has stopped and for what reason.
            this.onStop(reasons);

            //Allow chaining.
            return this;
        }
        //--------------------------------------------------------
        // Internal Events
        //--------------------------------------------------------
        /**
         * An internal event that occurs before loading has started.
         * You can use this event to display static images that have already been loaded.
         */
        onPreload() {
            hamonengine.util.logger.info("[hamonengine.core.engine.onPreload]");
            return false;
        }
        /**
         * An internal event that occurs when attempting to load resources.
         * @return {Object} a promise that the resource has loaded successfully.
         */
        async onloadResources() {
            hamonengine.util.logger.info("[hamonengine.core.engine.onloadResources]");
            return Promise.resolve();
        }
        /**
         * Starts binding the events.
         */
        async onEventBinding() {
            return new Promise((resolve, reject) => {
                //Only add events when the DOM has completed loading.
                window.addEventListener('DOMContentLoaded', (event) => {
                    const touchEventMap = new Map();
                    const bindEvents = (elementToBind, eventContainer) => {
                        const keyEvent = (type, e) => this.onKeyEvent(type, e.code, e, eventContainer);
                        const mouseEvent = (type, e) => {
                            const v = new hamonengine.geometry.vector2(e.offsetX, e.offsetY);
                            this.onMouseEvent(type, v, e, eventContainer);
                        }
                        const touchEvent = (type, e) => {
                            
                            //Retain the current touch type so we can determine if the next event is a click.
                            const lasttouchevent = touchEventMap.has(eventContainer.name) ? touchEventMap.get(eventContainer.name) : '';
                            touchEventMap.set(eventContainer.name, type);

                            const position = eventContainer.position;
                            if (position) {
                                const touches = [];
                                for(let i = 0; i < e.touches.length; i++) {
                                    touches.push(new hamonengine.geometry.vector2(e.touches[i].clientX - position.x, e.touches[i].clientY - position.y));
                                }
                                //Mimic the click event for touch.
                                const isClick = (type === 'end' && lasttouchevent === 'start');

                                //Triger the touch events.
                                this.onTouchEvent(type, touches, e, eventContainer);
                                isClick && this.onTouchEvent('click', touches, e, eventContainer);

                                //If enabled, trigger the mouse event on a touch event.
                                if (this.captureTouchAsMouseEvents) {
                                    //MDN's suggestion on mapping touch to click events.
                                    //https://developer.mozilla.org/en-US/docs/Web/API/Touch_events#handling_clicks
                                    //Map the touch events to mouse events before invoking the onMouseEvent.
                                    type = (type === 'start') ? 'down' : type;
                                    type = (type === 'end') ? 'up' : type;
                                    //Capture only changedTouches as the touches collection will contain no coordinates.
                                    const v = new hamonengine.geometry.vector2(e.changedTouches[0].clientX - position.x, e.changedTouches[0].clientY - position.y)
                                    
                                    //Triger the mouse events.
                                    this.onMouseEvent(type, v, e, eventContainer);
                                    isClick && this.onMouseEvent('click', v, e, eventContainer);
                                }
                            }
                        };

                        elementToBind.addEventListener('keyup', (e) => keyEvent('up',e));
                        elementToBind.addEventListener('keydown', (e) => keyEvent('down',e));
                        elementToBind.addEventListener('click', (e) => mouseEvent('click', e));
                        elementToBind.addEventListener('mouseup', (e) => mouseEvent('up',e));
                        elementToBind.addEventListener('mousedown', (e) => mouseEvent('down',e));
                        elementToBind.addEventListener('mousemove', (e) => mouseEvent('move',e));
                        elementToBind.addEventListener('touchstart', (e) => touchEvent('start',e), {passive: false});
                        elementToBind.addEventListener('touchmove', (e) =>  touchEvent('move',e), {passive: false});
                        elementToBind.addEventListener("touchend", (e) => touchEvent('end', e), {passive: false});
                        elementToBind.addEventListener("touchcancel", (e) => touchEvent('cancel', e), {passive: false});
                    };

                    //Allow document event binding.
                    if (this.allowDocumentEventBinding) {
                        bindEvents(document, this);
                    }

                    // If this is moved into the layers, then it is no longer a graphics based entity, but a graphics & input entity.
                    this.layers.forEach(layer => {
                        layer.allowEventBinding && bindEvents(layer.canvas, layer);
                    });
                });

                resolve();
            });
        }

        //--------------------------------------------------------
        // Events
        //--------------------------------------------------------
        onKeyEvent(type, keyCode, e, layer) {
            e && e.preventDefault();
            hamonengine.util.logger.debug(`[hamonengine.core.engine.onKeyEvent] Type: '${type}' '${keyCode}'`);
        }
        onMouseEvent(type, v, e, layer) {
            hamonengine.util.logger.debug(`[hamonengine.core.engine.onMouseEvent] Type: '${type}' '${v.toString()}'`);
        }        
        onTouchEvent(type, touches, e, layer) {
            e && e.preventDefault();
            hamonengine.util.logger.debug(`[hamonengine.core.engine.onTouchEvent] Type: '${type}' '${e}'`);
        }  
        /**
         * A draw loop event that is triggered once the engine starts.
         * @param {?number} timestampInMilliseconds elapsed since the origin.  See DOMHighResTimeStamp.
         */
        onDraw(timestampInMilliseconds) {

            //Normalize the timestamp to prevent undefined or NaN.
            timestampInMilliseconds = (timestampInMilliseconds || 0);

            //Set the start timestamp when the engine first starts up.
            if (!this._startTimeStamp) {
                this._startTimeStamp = timestampInMilliseconds;
            }

            //Get the time elapsed since the engine started.
            const elapsedTimeInMilliseconds = timestampInMilliseconds - this._lastFrameTimeStamp;

            //hamonengine.util.logger.debug("[hamonengine.core.engine.onDraw]");
            try {
                //Experimental processing frame.
                let processingComplete = false;
                setTimeout(() => {
                    this.onProcessingFrame(elapsedTimeInMilliseconds);
                    processingComplete = true;
                }, 1);

                //NOTE: We need the scoped version of the timestamp argument to get the DOMHighResTimeStamp parameter.
                //If this parameter is removed then the timestamp will always be zero.
                this._animationId = window.requestAnimationFrame((scopedTimestampInMS) => {
                    this._state = ENGINE_STATES.RUNNING;
                    (!this.syncFrames || processingComplete) && this.onFrame(elapsedTimeInMilliseconds);
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
        /**
         * An onProcessingFrame event that is triggered when a single frame is being processed before drawn.
         * @param {number} elapsedTimeInMilliseconds since the engine has started.
         */        
        onProcessingFrame(elapsedTimeInMilliseconds) {
            return this;
        }
        /**
         * An event that is triggered when the engine has been stopped.
         * @param {string} reasons as to why the engine stopped.
         */         
        onStop(reasons) {
            return this;
        }
    }
})();