// ==UserScript==
// @name         Rainbow Animation for CivitAI's accent colored elements
// @namespace    https://github.com/DraconicDragon/civitai-catppuccin-userstyle
// @version      1.2
// @description  Animate background color to rainbow for CivitAI accent colored elements
// @author       Drac, ChatGPT
// @match        https://civitai.*/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    // Default speed in seconds (if no value is saved yet)
    const defaultSpeed = 10;

    // Get saved speed value or use default
    let animationSpeed = GM_getValue('animationSpeed', defaultSpeed);

    // Function to inject CSS for animation
    function injectRainbowAnimation(speed) {
        // Remove existing animation style (if any) to update with new speed
        const existingStyle = document.getElementById('rainbow-background-animation-style');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Inject updated animation CSS
        const style = document.createElement('style');
        style.id = 'rainbow-background-animation-style';
        style.innerHTML = `
            @keyframes rainbow {
                0% { background-color: #E04A4A; }
                16% { background-color: #E0B54A; }
                33% { background-color: #4AE0D4; }
                50% { background-color: #4A6AE0; }
                66% { background-color: #D44AE0; }
                100% { background-color: #E04A4A; }
            }

            .rainbow-background {
                animation: rainbow ${speed}s linear infinite;
            }
        `;
        document.head.appendChild(style);
    }

    // Function to check if an element's background matches the target colors
    function matchesTargetColors(styles) {
        const colorToMatch = [
            'rgb(34, 139, 230)',  // rgb color format (34, 139, 230)
            'rgb(25, 113, 194)',  // rgb color format (25, 113, 194)
            'rgba(25, 113, 194, 0.2)', // rgba color format with transparency
        ];

        return colorToMatch.includes(styles.backgroundColor);
    }

    // Function to modify elements with the target background colors
    function modifyElements() {
        document.querySelectorAll('*').forEach(element => {
            const styles = window.getComputedStyle(element);
            const currentBackground = styles.backgroundColor;

            // For elements with rgba(25, 113, 194, 0.2), keep the transparency and apply animation
            if (currentBackground === 'rgba(25, 113, 194, 0.2)') {
                const originalAlpha = currentBackground.match(/rgba?\(([^)]+)\)/)[1].split(',')[3];
                if (!element.classList.contains('rainbow-background')) {
                    element.classList.add('rainbow-background');
                    element.style.backgroundColor = `rgba(25, 113, 194, ${originalAlpha})`;  // Maintain original transparency
                }
            }
            // For elements with rgb(25, 113, 194) (no alpha), apply the rainbow animation
            else if (currentBackground === 'rgb(25, 113, 194)') {
                if (!element.classList.contains('rainbow-background')) {
                    element.classList.add('rainbow-background');
                }
            }
            // For other matching colors, apply the animation
            else if (matchesTargetColors(styles)) {
                if (!element.classList.contains('rainbow-background')) {
                    element.classList.add('rainbow-background');
                }
            }
        });
    }

    // Initial processing for already-loaded elements
    modifyElements();

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
    GM_registerMenuCommand('Set Rainbow Background Animation Speed', updateSpeed);

    // Observe the DOM for changes and update affected elements
    const observer = new MutationObserver(() => modifyElements());
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style'], // Observe style changes for immediate color updates
    });

    // Also call the function on window load to ensure all elements are modified
    window.addEventListener('load', modifyElements);
})();
