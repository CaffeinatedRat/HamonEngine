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

/**
 * A helper class for handling flags as bits.
 */
class bitflag {
    /**
     * Toggles the bit in the value based on the state.
     * @param {number} value to change.
     * @param {number} bitToToggle in the supplied value.
     * @param {*} state to change the bit, true to enable, false to clear, and undefined to toggle.
     */
    static toggle(value, bitToToggle, state) {
        if (state !== undefined) {
            if (state) {
                //Turn on the bit.
                return value | (1 << bitToToggle);
            }

            //Turn off the bit.
            return value & ~(1 << bitToToggle);
        }

        //Toggle the bitValue
        return value ^ (1 << bitToToggle);
    }
    /**
     * Determines if the bit is set in the value.
     * @param {number} value to check for the bit.
     * @param {number} bitToCheck to find in the value.
     */
    static isSet(value, bitToCheck) {
        const valueToCheck = 1 << bitToCheck;
        return (value & valueToCheck) === valueToCheck;
    }
}