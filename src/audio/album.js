/**
* Copyright (c) 2020-2022, CaffeinatedRat.
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

hamonengine.audio = hamonengine.audio || {};

(function() {

    /**
     * This class represents an album a collection of tracks.
     */
    hamonengine.audio.album = class {
        constructor(options={}) {

            //Handle copy-constructor operations.
            if (options instanceof hamonengine.audio.album) {
                options = {
                    audioResource: options._audioResource,
                    tracks: options._tracks,
                    trackIndex: options._trackIndex,
                    url: options._url,
                    name: options._name
                }
            }

            this._audioResource = options.audioResource || new hamonengine.audio.audioext();
            this._tracks = options.tracks || {};
            this._trackIndex = options.trackIndex || [];
            this._url = options.url || '';
            this._name = options.name || '';

            console.debug(`[hamonengine.audio.album.constructor] Name: '${this._name}'`);
            console.debug(`[hamonengine.audio.album.constructor] Url: '${this._url}'`);
        }
        /**
         * Returns the name of the album.
         */
        get name() {
            return this._name;
        }
        /**
         * Returns the number of tracks in the album.
         */
        get length () {
            return this._trackIndex.length;
        }
        /**
         * Determines if the album is ready.
         */
        get isLoaded() {
            return this._audioResource.isLoaded();
        }
        //--------------------------------------------------------
        // Methods
        //--------------------------------------------------------
        /**
         * Makes a clone of the album.
         */
         clone() {
            return new hamonengine.audio.album(this);
        }
        /**
         * Loads the album based on the provided metadata or URL.
         * @param {*} albumMetadata JSON metadata or a URL
         */
        async load(albumMetadata) {

            //Handle a pre-existing URL option.
            albumMetadata = albumMetadata || this._url;

            //Determine if the user is attempting to load the metadata from a file or JSON data.
            if (typeof albumMetadata === 'string') {
                const albumMetadataResponse = await connect.get(albumMetadata);
                albumMetadata = JSON.parse(albumMetadataResponse.data);
            }

            //Assign the name if one doesn't exist.
            this._name = this._name || albumMetadata.name;

            //Start the image resource loading and get the promise to complete.
            const resourceLoadingPromise = this._audioResource.load(albumMetadata.albumUrl);

            //--------------------------------------------------------------------------
            // Continue loading album information while the resources are loading.
            //--------------------------------------------------------------------------

            //Load all of the static tracks from the metadata.
            for(let i = 0; i < albumMetadata.tracks.length; i++) {
                const trackData = albumMetadata.tracks[i];
                this._trackIndex.push(trackData.name);
                this._tracks[trackData.name] = new hamonengine.audio.track({
                    audioext: this._audioResource,
                    name: trackData.name,
                    trackBegin: trackData.begin,
                    trackEnd: trackData.end
                });
            }

            return resourceLoadingPromise;
        }
        /**
         * Returns the track based on the name.
         * @param {string} name of track to return.
         */
        getTrack(name) {
            return this._tracks[name].clone();
        }
        /**
         * Returns the track based on the ordinal value.
         * @param {number} index of the track to return.
         */
        getTrackByOrdinal(index) {
            return this._tracks[this._trackIndex[index]].clone();
        }
    }
})();