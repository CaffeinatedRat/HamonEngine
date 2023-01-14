/**
* Copyright \(c\) 2020-2023, CaffeinatedRat.
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

hamonengine.math = hamonengine.math || {};

(function() {
   
    const a = 214013;
    const c = 2531011;
    const m = Math.maxUInt32;

    ///////////////////////////////////////////
    // Creates a psuedorandom number from a Linear Congruential Generation algorithm.
    // X1 = (a * X0 + c) % m where
    // m -- modulus [0 < m] (Coprime w/c)
    // a -- Multiplier [0 < a < m] (Prime number)
    // c -- incrementer [0 <= c < m] (Coprime w/m)
    // X0 -- Seed value [0 <= X0 < m]
    ///////////////////////////////////////////
    hamonengine.math.LCGRandom = class {
        /**
         * Instantiates a Linear Congruential Generator.
         * @param {number} seed The random seed value.
         */
        constructor(seed) {
            this._seed = seed;
        }
        /**
         * Returns a random number based on the seed supplied.
         * @return {number} Returns a random number.
         */
        random () {
            // X1 = (a * X0 + c) % m where a = 214013, c = 2531011, m = 2^32
            return (this._seed = (a * this._seed + c) % m);
        }
    }
})();