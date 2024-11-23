// ==UserScript==
// @name         Rainbow Animation for the CivitAI logo
// @namespace    https://github.com/DraconicDragon/civitai-catppuccin-userstyle
// @version      1.4
// @description  Animate the CivitAI logo accent an "AI" text with a rainbow gradient and customizable speed
// @author       Drac, ChatGPT
// @match        https://civitai.*/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    // Default speed in seconds (if no value is saved yet)
    const defaultSpeed = 4;

    // Get saved speed value or use default
    let animationSpeed = GM_getValue('animationSpeed', defaultSpeed);

    // Function to inject CSS for animation
    function injectRainbowAnimation(speed) {
        // Remove existing animation style (if any) to update with new speed
        const existingStyle = document.getElementById('rainbow-animation-style');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Inject updated animation CSS
        const style = document.createElement('style');
        style.id = 'rainbow-animation-style';
        style.innerHTML = `
            @keyframes rainbow {
                0% { stop-color: #E04A4A; }
                16% { stop-color: #E0B54A; }
                33% { stop-color: #4AE0D4; }
                50% { stop-color: #4A6AE0; }
                66% { stop-color: #D44AE0; }
                100% { stop-color: #E04A4A; }
            }

            .rainbow-stop {
                animation: rainbow ${speed}s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
    }

    // Function to modify SVG and add a rainbow gradient
    function modifySvg(svg) {
        if (svg.hasAttribute('data-rainbow-processed')) return; // Skip already processed SVGs
        const paths = svg.querySelectorAll('.__mantine-ref-ai, .__mantine-ref-accent');
        if (paths.length > 0) {
            // Check if gradient already exists
            let gradient = svg.querySelector('linearGradient#rainbowGradient');
            if (!gradient) {
                // Create a new gradient
                gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
                gradient.id = 'rainbowGradient';
                gradient.setAttribute('gradientTransform', 'rotate(45)');

                const colors = ['#E04A4A', '#E0B54A', '#4AE0D4', '#4A6AE0', '#D44AE0'];
                colors.forEach((color, i) => {
                    const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                    stop.setAttribute('offset', `${(i / (colors.length - 1)) * 100}%`);
                    stop.setAttribute('class', 'rainbow-stop');
                    gradient.appendChild(stop);
                });

                const defs = svg.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                defs.appendChild(gradient);
                svg.insertBefore(defs, svg.firstChild);
            }

            // Apply the gradient to the paths
            paths.forEach(path => {
                path.style.fill = 'url(#rainbowGradient)';
            });

            // Mark SVG as processed
            svg.setAttribute('data-rainbow-processed', 'true');
        }
    }

    // Observe the DOM for relevant SVG additions/changes
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.matches('svg.__mantine-ref-svg')) {
                    modifySvg(node);
                } else if (node.nodeType === 1) {
                    const svgs = node.querySelectorAll('svg.__mantine-ref-svg');
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

    // Initial processing for already-loaded SVGs
    document.querySelectorAll('svg.__mantine-ref-svg').forEach(svg => modifySvg(svg));

    // Inject the initial CSS with the current animation speed
    injectRainbowAnimation(animationSpeed);

    // Function to update animation speed via user input
    function updateSpeed() {
        const newSpeed = parseFloat(prompt('Enter animation speed in seconds (e.g., 5, 10, 15):', animationSpeed));
        if (!isNaN(newSpeed) && newSpeed > 0) {
            animationSpeed = newSpeed;
            GM_setValue('animationSpeed', animationSpeed); // Save the new speed
            injectRainbowAnimation(animationSpeed); // Update CSS with the new speed
            alert(`Animation speed updated to ${animationSpeed}s.`);
        } else {
            alert('Invalid input. Please enter a positive number.');
        }
    }

    // Register a menu command for updating the animation speed
    GM_registerMenuCommand('Set Rainbow Animation Speed', updateSpeed);
})();
