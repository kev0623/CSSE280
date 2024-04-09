
/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * Kai Chun Lin 
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.channelNumbers = [1, 2, 3, 4, 5, 9];
rhit.currentChannelIndex = 0;

/** function and class syntax examples */
rhit.updateChannel = function () {
    const channelNumber = document.getElementById('channelNumber');
    const televisionImage = document.getElementById('televisionImage');
    channelNumber.textContent = `Ch. ${rhit.channelNumbers[rhit.currentChannelIndex]}`;
    televisionImage.src = `images/tv_${rhit.channelNumbers[rhit.currentChannelIndex]}.jpeg`;
};

rhit.setupEventListeners = function () {
    const buttons = document.querySelectorAll('.remote button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const direction = button.getAttribute('data-direction');
            if (direction === 'up') {
                rhit.currentChannelIndex = (rhit.currentChannelIndex + 1) % rhit.channelNumbers.length;
            } else if (direction === 'down') {
                rhit.currentChannelIndex = (rhit.currentChannelIndex - 1 + rhit.channelNumbers.length) % rhit.channelNumbers.length;
            } else if (direction === 'pause') {
                const televisionImage = document.getElementById('televisionImage');
                if (televisionImage.src.includes('screensaver')) {
                    televisionImage.src = `images/tv_${rhit.channelNumbers[rhit.currentChannelIndex]}.jpeg`;
                } else {
                    televisionImage.src = 'images/screensaver.gif';
                }
                return;
            }
            rhit.updateChannel();
        });
    });
};

/* Main */
rhit.main = function () {
    console.log("Ready");
    document.addEventListener('DOMContentLoaded', () => {
        rhit.updateChannel(); 
        rhit.setupEventListeners();
    });
};

rhit.main();
