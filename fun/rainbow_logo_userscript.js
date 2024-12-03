// ==UserScript==
// @name         Rainbow Animation for the CivitAI logo
// @namespace    https://github.com/DraconicDragon/civitai-catppuccin-userstyle
// @version      2.1
// @description  Animate the CivitAI logo with rainbow gradients on inner and outer paths with customizable speed
// @author       Drac, ChatGPT
// @match        https://civitai.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    const defaultSpeed = 4; // Default animation speed in seconds
    let animationSpeed = GM_getValue('animationSpeed', defaultSpeed);

    // Inject CSS for animations
    function injectRainbowAnimation(speed) {
        const existingStyle = document.getElementById('rainbow-animation-style');
        if (existingStyle) existingStyle.remove();

        const style = document.createElement('style');
        style.id = 'rainbow-animation-style';
        style.innerHTML = `
            @keyframes rainbow-outer {
                0% { stop-color: #E04A4A; }
                16% { stop-color: #E0B54A; }
                33% { stop-color: #4AE0D4; }
                50% { stop-color: #4A6AE0; }
                66% { stop-color: #D44AE0; }
                100% { stop-color: #E04A4A; }
            }

            @keyframes rainbow-inner {
                0% { stop-color: #802525; }
                16% { stop-color: #806325; }
                33% { stop-color: #257D6A; }
                50% { stop-color: #25386A; }
                66% { stop-color: #6A257D; }
                100% { stop-color: #802525; }
            }

            .rainbow-outer {
                animation: rainbow-outer ${speed}s ease-in-out infinite;
            }

            .rainbow-inner {
                animation: rainbow-inner ${speed}s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
    }

    // Modify SVG gradients for animation
    function modifySvg(svg) {
        if (svg.hasAttribute('data-rainbow-processed')) return;

        const innerGradient = svg.querySelector('#innerGradient');
        const outerGradient = svg.querySelector('#outerGradient');

        if (innerGradient) {
            innerGradient.querySelectorAll('stop').forEach(stop => {
                stop.setAttribute('class', 'rainbow-inner');
            });
        }

        if (outerGradient) {
            outerGradient.querySelectorAll('stop').forEach(stop => {
                stop.setAttribute('class', 'rainbow-outer');
            });
        }

        svg.setAttribute('data-rainbow-processed', 'true');
    }

    // Observe the DOM for changes
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.matches('svg')) {
                    modifySvg(node);
                } else if (node.nodeType === 1) {
                    const svgs = node.querySelectorAll('svg');
                    svgs.forEach(svg => modifySvg(svg));
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
    });

    // Process already-loaded SVGs
    document.querySelectorAll('svg').forEach(svg => modifySvg(svg));

    // Inject initial animation
    injectRainbowAnimation(animationSpeed);

    // Menu command to update animation speed
    GM_registerMenuCommand('Set Rainbow Animation Speed', () => {
        const newSpeed = parseFloat(prompt('Enter animation speed in seconds (e.g., 5, 10, 15):', animationSpeed));
        if (!isNaN(newSpeed) && newSpeed > 0) {
            animationSpeed = newSpeed;
            GM_setValue('animationSpeed', animationSpeed);
            injectRainbowAnimation(animationSpeed);
            alert(`Animation speed updated to ${animationSpeed}s.`);
        } else {
            alert('Invalid input. Please enter a positive number.');
        }
    });
})();
