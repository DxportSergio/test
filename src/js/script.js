/**
 * Winsera - Main JavaScript
 * 1. Configuration - Global settings for the application
 * 2. DOM Elements - Cached DOM elements for better performance
 * 3. Application State - Tracks the current state of the application
 * 4. Utility Functions - Helper functions used throughout the application
 * 5. Mobile Navigation - Handles mobile menu behavior
 * 6. Desktop Navigation - Handles desktop navigation behavior
 * 7. Accordion - Manages the accordion functionality
 * 8. Portfolio Slider - Controls the portfolio image carousel
 * 9. Fullscreen Image - Manages fullscreen image viewing with magnifier
 * 10. Event Listeners - Sets up all event handlers
 * 11. Initialization - Starts the application
 */

// 1. Configuration - Defines constant global settings used across the application
const CONFIG = {
	carouselWidth: 100,       // Defines the percentage width each slide should occupy/move in the portfolio slider
	magnifierZoom: 2,         // Sets the fixed zoom level for the image magnifier
	scrollThreshold: 200,     // Specifies the scroll distance (in pixels) after which the desktop navigation shadow appears
	headerOffset: 50,         // Defines an offset (in pixels) used in scroll calculations related to the header height
};

// 2. DOM Elements - Caches references to frequently used DOM elements for efficiency
const elements = {
	// Navigation elements
	body: document.body,                                            // Reference to the HTML body element
	burgerPanel: document.querySelector('.hamburger__panel'),       // Reference to the top panel containing the mobile burger button
	burgerBtn: document.querySelector('.hamburger'),                // Reference to the mobile navigation toggle (hamburger) button
	headerSection: document.querySelector('#home'),                 // Reference to the main header section (usually the top part of the page)
	navMobile: document.querySelector('.nav-mobile'),               // Reference to the container for the mobile navigation links
	navDesktop: document.querySelector('.nav-desktop'),             // Reference to the container for the desktop navigation links
	navDesktopShadow: document.querySelector('.nav-desktop-shadow'), // Reference to the element used as a shadow under the desktop nav
	subsection: document.querySelector('.subsection'), // Reference to the subsection element, handled specially by scroll spy

	// Accordion elements
	btnAccordion: document.querySelectorAll('.aboutus__accordion-box-btn'), // Selects all buttons that trigger accordion item expansion/collapse

	// Portfolio elements
	portfolio: document.querySelector('.portfolio'),                         // Reference to the main container of the portfolio section
	boxSliderPortfolio: document.querySelector('.portfolio__slider-box'),    // Reference to the inner element that slides horizontally within the portfolio
	sliderCardsPortfolio: document.querySelectorAll('.portfolio__slider-box-img'), // Selects all individual image containers within the portfolio slider
	leftBtnPortfolio: document.querySelector('.portfolio__slider-btn--left'),  // Reference to the left arrow button of the portfolio slider
	rightBtnPortfolio: document.querySelector('.portfolio__slider-btn--right'), // Reference to the right arrow button of the portfolio slider

	// Fullscreen image elements
	fullScreenBox: document.querySelector('.portfolio__full-screen'),       // Reference to the overlay element used for fullscreen image display
	fullScreenImg: document.querySelector('.portfolio__full-screen img'),   // Reference to the <img> tag inside the fullscreen overlay
	fullScreenCloseBtn: document.querySelector('.portfolio__full-screen-close'), // Reference to the button used to close the fullscreen view

	// Navigation links & Scroll Spy elements
	navItems: document.querySelectorAll('.nav-desktop-links-link'), // Selects all individual anchor links within the desktop navigation
	scrollSpySections: document.querySelectorAll('header, section'), // Selects all header and section elements to be monitored by scroll spy
	navigation: document.querySelector('.nav-desktop'),           // Reference to the desktop navigation container (used for scroll spy height calculation)
};

// 3. Application State - Defines variables that track the changing state of the application
const state = {
	prevScrollPositions: [0, 1],  // Stores the last two scroll positions [new, old] to determine scroll direction for mobile nav
	portfolioIndex: 0,             // Tracks the current index (zero-based) of the visible slide in the portfolio
	isMagnifierActive: false,      // Boolean flag indicating whether the image magnifier lens is currently active/visible
};

// 4. Utility Functions - Defines reusable helper functions
/**
 * Creates a debounced version of a function. The debounced function delays invoking
 * the original function until after a specified wait time has elapsed since the last call.
 * Useful for limiting the rate at which a function fires (e.g., on scroll or resize events).
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The debounce delay time in milliseconds.
 * @returns {Function} - The new debounced function.
 */
const debounce = (func, delay) => {
	let timeoutId; // Variable to hold the timer ID
	// Return the new debounced function
	return (...args) => {
        const context = this; // Capture the context
		clearTimeout(timeoutId); // Clear any previously scheduled execution
		// Schedule the function execution after the specified delay
		timeoutId = setTimeout(() => func.apply(context, args), delay);
	};
};

// 5. Mobile Navigation - Functions related to the behavior of the mobile navigation menu
/**
 * Shows/hides the mobile navigation top panel and its shadow based on scroll position.
 */
const handleScrollAction = () => {
	// Exit if necessary elements are not found in the DOM
	if (!elements.burgerPanel || !elements.headerSection || !elements.navMobile) return;

	const scrollY = window.scrollY; // Get the current vertical scroll position of the page
	const headerHeight = elements.headerSection.offsetHeight; // Get the height of the header section

	// Condition 1: User is scrolled within the header area (or above it)
	if (scrollY <= headerHeight - CONFIG.headerOffset) {
		elements.burgerPanel.classList.add('hamburger__panel--active');      // Ensure the panel is visible
		elements.burgerPanel.classList.remove('hamburger__panel--active-panel'); // Ensure the panel's background/shadow is hidden
		// If the mobile nav menu itself is currently open, close it automatically
		if (elements.navMobile.classList.contains('nav-mobile--active')) {
			closeMobileNav();
		}
	// Condition 2: User is scrolling down AND is below the header area
	} else if (
		state.prevScrollPositions[0] < state.prevScrollPositions[1] && // Check direction: previous position > current (scrolling down)
		scrollY > headerHeight - CONFIG.headerOffset                   // Check position relative to header
	) {
		elements.burgerPanel.classList.add('hamburger__panel--active');      // Ensure the panel is visible
		elements.burgerPanel.classList.add('hamburger__panel--active-panel'); // Show the panel's background/shadow
		// If the mobile nav menu itself is currently open, close it automatically
		if (elements.navMobile.classList.contains('nav-mobile--active')) {
			closeMobileNav();
		}
	// Condition 3: All other cases (e.g., scrolling up while below the header)
	} else {
		elements.burgerPanel.classList.remove('hamburger__panel--active');      // Hide the panel
		elements.burgerPanel.classList.remove('hamburger__panel--active-panel'); // Hide the panel's background/shadow
	}

	// Update the history of scroll positions to detect direction on the next scroll event
	state.prevScrollPositions.unshift(scrollY); // Add the current position to the beginning of the array
	state.prevScrollPositions.pop();           // Remove the oldest position from the end of the array
};

/**
 * Toggles the visibility of the mobile navigation menu when the hamburger button is clicked.
 */
const toggleMobileNav = () => {
	// Exit if necessary elements are not found
	if (!elements.navMobile || !elements.burgerBtn) return;

	// Toggle the '.nav-mobile--active' class on the mobile navigation container
	elements.navMobile.classList.toggle('nav-mobile--active');

	// Check the new state of the mobile navigation menu
	if (elements.navMobile.classList.contains('nav-mobile--active')) { // If the menu is now open
		elements.burgerBtn.classList.add('is-active'); // Change the hamburger button's appearance (e.g., to an 'X')
		elements.burgerPanel.classList.remove('hamburger__panel--active-panel'); // Ensure the top panel's background/shadow is hidden
	} else if ( // If the menu is now closed AND the user is scrolled within the header area
		!elements.navMobile.classList.contains('nav-mobile--active') &&
		window.scrollY <= elements.headerSection.offsetHeight - CONFIG.headerOffset
	) {
		elements.burgerBtn.classList.remove('is-active'); // Change the button's appearance back to the default (hamburger)
	} else { // If the menu is now closed AND the user is scrolled below the header area
		elements.burgerBtn.classList.remove('is-active'); // Change the button's appearance back to the default
		elements.burgerPanel.classList.remove('hamburger__panel--active'); // Also hide the top panel itself in this specific case
	}
};

/**
 * Explicitly closes the mobile navigation menu.
 */
const closeMobileNav = () => {
	// Exit if necessary elements are not found
	if (!elements.navMobile || !elements.burgerBtn) return;

	elements.navMobile.classList.remove('nav-mobile--active'); // Remove the active class to hide the menu
	elements.burgerBtn.classList.remove('is-active');       // Remove the active class to reset the button's appearance
};

// 6. Desktop Navigation - Functions related to the behavior of the desktop navigation bar
/**
 * Shows or hides the shadow element beneath the desktop navigation bar
 * depending on the vertical scroll position.
 */
const handleDesktopNavShadow = () => {
	// Exit if the shadow element is not found
	if (!elements.navDesktopShadow) return;

	// Check if the page has been scrolled vertically past the defined threshold
	if (window.scrollY > CONFIG.scrollThreshold) {
		elements.navDesktopShadow.classList.add('nav-desktop-shadow--active'); // Add the active class to show the shadow
	} else {
		elements.navDesktopShadow.classList.remove('nav-desktop-shadow--active'); // Remove the active class to hide the shadow
	}
};

      
/**
 * Implements Scroll Spy functionality: highlights the active desktop navigation link
 * based on which section (or the specific 'subsection' div) is currently visible
 * near the top of the viewport, just below the navigation bar.
 * Includes special handling for the 'subsection' div to activate the 'Kontakt' link.
 * Uses debouncing on the scroll event for performance optimization.
 */
const handleScrollSpy = debounce(() => {
    // Exit the function immediately if any required elements are missing from the DOM
    if (!elements.navigation || !elements.scrollSpySections || !elements.navItems || !elements.subsection) return;

    // Get the current height of the desktop navigation bar
    const navHeight = elements.navigation.offsetHeight;
    // Initialize a variable to store the currently active <header> or <section> element
    let activeSection = null;
    // Get the current vertical scroll position of the window
    const scrollPosition = window.scrollY;

    // Iterate through each element designated for scroll spying (headers and sections)
    elements.scrollSpySections.forEach(section => {
        const sectionTop = section.offsetTop;       // Get the distance from the top of the document to the section's top edge
        const sectionHeight = section.offsetHeight; // Get the height of the section
        // Check if the section is currently intersecting the target area below the navigation bar
        if (sectionTop <= scrollPosition + navHeight + 5 && // Condition: Section's top is at or above the line just below the nav bar (+5px buffer)
            sectionTop + sectionHeight > scrollPosition + navHeight) // Condition: Section's bottom is below the line just below the nav bar
        {
            activeSection = section; // If intersecting, mark this as the potentially active section (last one found takes precedence here)
        }
    });

    // If the user is scrolled near the very top of the page, ensure the header section is marked active
    if (scrollPosition < elements.headerSection.offsetTop + elements.headerSection.offsetHeight - navHeight) {
        activeSection = elements.headerSection; // Prioritize header if near the top
    }

    // Get the position and height of the subsection element
    const subsectionTop = elements.subsection.offsetTop;
    const subsectionHeight = elements.subsection.offsetHeight;
    // Initialize a flag to track if the subsection is currently active
    let isSubsectionActive = false;

    // Check if the subsection is currently intersecting the target area below the navigation bar
    if (subsectionTop <= scrollPosition + navHeight + 5 && // Condition: Subsection's top is near or above nav bottom (+ buffer)
        subsectionTop + subsectionHeight > scrollPosition + navHeight) // Condition: Subsection's bottom is below nav bottom
    {
        isSubsectionActive = true; // Set the flag if the subsection is active
    }

    // First, remove the 'active-section' class from all navigation items
    elements.navItems.forEach(item => item.classList.remove('active-section'));

    // Check if the subsection was determined to be active
    if (isSubsectionActive) {
        // If the subsection is active, find the specific link for '#contact'
        const kontaktLink = elements.navigation.querySelector('.nav-desktop-links-link[href="#contact"]');
        // If the contact link exists, add the 'active-section' class to it, overriding any section found in Step 1
        if (kontaktLink) {
            kontaktLink.classList.add('active-section');
        }
    }
    // If the subsection is NOT active, proceed with the active section found in Step 1
    else if (activeSection && activeSection.id) {
        // Find the navigation link whose href attribute contains the ID of the active header/section
        const activeNavItem = elements.navigation.querySelector(`.nav-desktop-links-link[href*="${activeSection.id}"]`);
        // If a matching link is found, add the 'active-section' class to highlight it
        if (activeNavItem) {
            activeNavItem.classList.add('active-section');
        }
    }
    // If neither the subsection nor any main section is determined to be active (e.g., user is scrolled between sections), no link will be highlighted.

}, 100); // Set the debounce delay to 100 milliseconds


// 7. Accordion - Manages the expandable/collapsible accordion items
/**
 * Toggles the 'active' state class on the parent container of the clicked
 * accordion button. CSS rules associated with this class handle the show/hide logic.
 * Uses 'this' which refers to the specific button element that was clicked.
 */
const toggleAccordionItem = function () {
	this.parentElement.classList.toggle('aboutus__accordion-box--active'); // Toggle the class on the button's immediate parent element
};

// 8. Portfolio Slider - Controls the behavior of the image carousel
/**
 * Checks the current slider index (`state.portfolioIndex`) and updates the `disabled`
 * attribute of the left and right navigation buttons based on whether the
 * slider is at the beginning or end.
 */
const checkPortfolioIndex = () => {
	// Exit function if necessary elements are not found
	if (!elements.portfolio || !elements.leftBtnPortfolio || !elements.rightBtnPortfolio) return;

	const isMobile = window.innerWidth < 992; // Determine if the current viewport width is considered 'mobile'
	// Calculate the maximum possible index for the slider.
	// On desktop (>=992px), 4 items are assumed visible, so max index is length - 4.
	// On mobile (<992px), 1 item is assumed visible, so max index is length - 1.
	const maxIndex = isMobile ? elements.sliderCardsPortfolio.length - 1 : Math.max(0, elements.sliderCardsPortfolio.length - 4);

    // Ensure the current index is valid, especially after a window resize might change the maxIndex
    state.portfolioIndex = Math.min(state.portfolioIndex, maxIndex);

	// Disable the left button if the slider is at the first item (index 0)
	elements.leftBtnPortfolio.disabled = state.portfolioIndex === 0;
	// Disable the right button if the slider is at the last possible item position
	elements.rightBtnPortfolio.disabled = state.portfolioIndex === maxIndex;
};

/**
 * Updates the horizontal position of the slider container (`.portfolio__slider-box`)
 * using CSS `transform: translateX`. The amount of translation depends on the
 * current slide index and the configured slide width.
 */
const updateSliderPosition = () => {
	// Exit function if the slider container element is not found
	if (!elements.boxSliderPortfolio) return;

    // Check if desktop view for potential logic adjustments (though current transform uses 100% step)
    const isDesktop = window.innerWidth >= 992;
    // Calculate the translation value based on index and width config
	const translationPercentage = -state.portfolioIndex * CONFIG.carouselWidth;
	// Apply the CSS transform style to move the slider visually
	elements.boxSliderPortfolio.style.transform = `translateX(${translationPercentage}%)`;
};

/**
 * Handles the click event for the "next" (right) slider button.
 * Increments the slider index if possible, then updates button states and slider position.
 */
const handleNextSlide = () => {
    const isMobile = window.innerWidth < 992; // Check current view
    // Recalculate max index based on current view
    const maxIndex = isMobile ? elements.sliderCardsPortfolio.length - 1 : Math.max(0, elements.sliderCardsPortfolio.length - 4);
	// Proceed only if the current index is less than the maximum allowed index
	if (state.portfolioIndex < maxIndex) {
		state.portfolioIndex++;      // Increment the index in the application state
		checkPortfolioIndex();     // Update the enabled/disabled status of the arrow buttons
		updateSliderPosition();    // Move the slider visually to the new position
	}
};

/**
 * Handles the click event for the "previous" (left) slider button.
 * Decrements the slider index if possible, then updates button states and slider position.
 */
const handlePrevSlide = () => {
	// Proceed only if the current index is greater than 0 (not the first slide)
	if (state.portfolioIndex > 0) {
		state.portfolioIndex--;      // Decrement the index in the application state
		checkPortfolioIndex();     // Update the enabled/disabled status of the arrow buttons
		updateSliderPosition();    // Move the slider visually to the new position
	}
};

// 9. Fullscreen Image & Magnifier - Manages viewing portfolio images fullscreen with a magnifier lens
/**
 * Calculates and updates the position of the magnifier lens element (`.lens`)
 * and its background image based on the mouse cursor's position over the fullscreen image.
 * Ensures the magnified view stays within the bounds of the original image.
 * @param {MouseEvent} e - The mouse move event object, containing cursor coordinates.
 */
const updateMagnifierPosition = e => {
	// Only execute if the magnifier state is currently active
	if (!state.isMagnifierActive) return;

	const img = elements.fullScreenImg; // Reference to the fullscreen <img> element
	const glass = img.parentElement.querySelector('.lens'); // Reference to the magnifier lens <div> element
	// Exit if the lens element or the image is not available or not fully loaded its dimensions
	if (!glass || !img.complete || img.naturalWidth === 0) return;

	const imgRect = img.getBoundingClientRect(); // Get the image's size and position relative to the viewport
	const glassWidth = glass.offsetWidth;   // Get the lens's width
	const glassHeight = glass.offsetHeight; // Get the lens's height
    const w = glassWidth / 2;  // Half-width of the lens
    const h = glassHeight / 2; // Half-height of the lens
    const zoom = CONFIG.magnifierZoom; // Get the fixed zoom factor from configuration

    // --- Calculate reference point (x, y) based on cursor, clamped within image bounds ---
	// 1. Calculate cursor coordinates relative to the image's top-left corner
	let x = e.clientX - imgRect.left;
	let y = e.clientY - imgRect.top;

    // 2. Clamp these relative coordinates (x, y). This prevents the reference point used
    //    for positioning the background from getting too close to the image edges,
    //    preventing the magnified view from showing areas outside the image.
    //    Uses img.width/height for clamping bounds as per the original code provided.
    const boundX = w / zoom; // Effective horizontal boundary inset
    const boundY = h / zoom; // Effective vertical boundary inset
    x = Math.max(boundX, Math.min(x, img.width - boundX)); // Clamp x within [boundX, img.width - boundX]
    y = Math.max(boundY, Math.min(y, img.height - boundY)); // Clamp y within [boundY, img.height - boundY]

    // --- Position the lens element ---
	// 3. Calculate the top-left position for the lens element itself, positioning it
    //    relative to the viewport based on the clamped image-relative coordinates (x, y).
	const glassX = imgRect.left + x - w; // Calculate 'left' style value for the lens
	const glassY = imgRect.top + y - h;  // Calculate 'top' style value for the lens

    // Apply the position styles to the lens element
	glass.style.left = `${glassX}px`;
	glass.style.top = `${glassY}px`;

    // --- Position the background image inside the lens ---
    // 4. Calculate the 'background-position' values. These offsets shift the background
    //    image so that the point corresponding to the clamped (x, y) appears at the center of the lens.
	const bgX = -(x * zoom - w); // Calculate background-position X offset
	const bgY = -(y * zoom - h); // Calculate background-position Y offset

    // Apply the background position styles to the lens element
	glass.style.backgroundPosition = `${bgX}px ${bgY}px`;
};

/**
 * Toggles the visibility and functionality of the magnifier lens when the
 * fullscreen image is clicked. Manages the active state, cursor style,
 * and adds/removes the mousemove event listener.
 * @param {MouseEvent} e - The click event object, used for initial positioning.
 */
const toggleMagnifier = e => {
    // Only proceed if the click event target was the image itself, not the lens overlay
    if (e.target !== elements.fullScreenImg) return;

	state.isMagnifierActive = !state.isMagnifierActive; // Invert the active state flag
	const imgContainer = elements.fullScreenBox; // The main fullscreen container
	const glass = imgContainer.querySelector('.lens'); // The lens element
	const img = elements.fullScreenImg; // The image element

	// Toggle CSS classes to reflect the magnifier state
	imgContainer.classList.toggle('active', state.isMagnifierActive); // For container styling (e.g., border)
	elements.body.classList.toggle('hide-cursor', state.isMagnifierActive); // To hide the default mouse cursor

	// Ensure the lens element exists and the image is ready before proceeding
	if (glass && img.complete && img.naturalWidth > 0) {
		// If the magnifier should now be active
		if (state.isMagnifierActive) {
            glass.style.visibility = 'visible'; // Make the lens visible
            glass.style.opacity = '1';          // Make the lens fully opaque
			glass.style.backgroundImage = `url('${img.src}')`; // Set the lens background to the image source
			// Set the background size according to the image dimensions and fixed zoom factor.
            // Uses img.width/height as per the original code provided.
			glass.style.backgroundSize = `${img.width * CONFIG.magnifierZoom}px ${img.height * CONFIG.magnifierZoom}px`;
			updateMagnifierPosition(e); // Position the lens immediately based on the click location
			// Add an event listener to track mouse movements while magnifier is active
			document.addEventListener('mousemove', updateMagnifierPosition);
		} else { // If the magnifier should now be inactive
            glass.style.visibility = 'hidden'; // Hide the lens
            glass.style.opacity = '0';         // Make the lens transparent
			// Remove the event listener for mouse movement
			document.removeEventListener('mousemove', updateMagnifierPosition);
		}
	// Handle the case where activation was attempted but failed (e.g., image dimensions not available)
	} else if (state.isMagnifierActive) {
        state.isMagnifierActive = false; // Revert state
        imgContainer.classList.remove('active'); // Revert classes
        elements.body.classList.remove('hide-cursor');
        console.warn("Magnifier could not be activated."); // Log a warning
    }
};

/**
 * Opens the clicked portfolio image in a fullscreen overlay view.
 * Sets the image source, handles loading, creates the magnifier lens element
 * if needed, adds the click listener to the image for toggling the magnifier,
 * and disables scrolling on the main page body.
 */
const openFullscreenImage = function () { // 'this' refers to the clicked portfolio image container (`.portfolio__slider-box-img`)
	// Only allow opening on wider screens (desktop breakpoint)
	if (window.innerWidth < 992 || !elements.fullScreenImg || !elements.fullScreenBox) {
		return; // Exit if conditions aren't met
	}

	const img = this.querySelector('img'); // Find the <img> tag within the clicked container
	if (!img) return; // Exit if no image is found inside

	// Set the `src` and `alt` attributes of the dedicated fullscreen image element
	elements.fullScreenImg.src = img.src;
	elements.fullScreenImg.alt = img.alt;

    // --- Define actions to take once the fullscreen image has finished loading ---
    elements.fullScreenImg.onload = () => {
        elements.fullScreenBox.style.display = 'block'; // Make the fullscreen container visible
        elements.body.style.overflow = 'hidden'; // Prevent scrolling of the background page content

        // --- Find or create the magnifier lens element ---
        let glass = elements.fullScreenBox.querySelector('.lens'); // Check if the lens element already exists
        if (!glass) { // If it doesn't exist
            glass = document.createElement('div'); // Create a new <div> element
            glass.className = 'lens';             // Assign the 'lens' class for styling
            // Initialize the lens as hidden and transparent
            glass.style.visibility = 'hidden';
            glass.style.opacity = '0';
            // Insert the newly created lens into the DOM, positioned after the fullscreen image
            elements.fullScreenImg.parentElement.insertBefore(glass, elements.fullScreenImg.nextSibling);
        }

        // Add the click event listener directly to the fullscreen image to handle magnifier toggling
        elements.fullScreenImg.addEventListener('click', toggleMagnifier);

        // Ensure the magnifier starts in the 'off' state, even if it was somehow left 'on' from a previous interaction
        if (state.isMagnifierActive) {
            // Simulate a click event targeted at the image to trigger the 'toggleMagnifier' function to turn it off
            const fakeEvent = { target: elements.fullScreenImg, currentTarget: elements.fullScreenImg };
            toggleMagnifier(fakeEvent);
        }
    };

    // --- Define actions for when the fullscreen image fails to load ---
    elements.fullScreenImg.onerror = () => {
        console.error("Fullscreen image failed to load:", img.src); // Log an error to the console
        // Optionally, automatically close the fullscreen overlay if the image loading fails
        closeFullscreenImage();
    };
};

/**
 * Closes the fullscreen image view overlay.
 * Handles deactivation of the magnifier if active, removes event listeners,
 * hides the overlay with a fade-out effect, and re-enables scrolling on the main page.
 */
const closeFullscreenImage = () => {
	// Only proceed if the fullscreen box is currently displayed
	if (!elements.fullScreenBox || elements.fullScreenBox.style.display === 'none') return;

    // If the magnifier is currently active, ensure it's properly deactivated first
	if (state.isMagnifierActive) {
        // Simulate a click event on the image to trigger 'toggleMagnifier' to turn it off
        // This is important to ensure the 'mousemove' listener is removed.
        const fakeEvent = { target: elements.fullScreenImg, currentTarget: elements.fullScreenImg };
		toggleMagnifier(fakeEvent);
	}

    // Remove the click listener that was added to the image for toggling the magnifier
    elements.fullScreenImg.removeEventListener('click', toggleMagnifier);
    // Remove the onload and onerror handlers attached to the image to prevent potential issues
    elements.fullScreenImg.onload = null;
    elements.fullScreenImg.onerror = null;

	// Start the fade-out animation by setting opacity to 0 (CSS transition handles the animation)
	elements.fullScreenBox.style.opacity = '0';
	elements.fullScreenBox.style.transition = 'opacity 0.3s ease'; // Specify transition for fade-out

	// Use setTimeout to delay further actions until after the CSS transition completes
	setTimeout(() => {
		elements.fullScreenBox.style.display = 'none'; // Hide the container element completely
		elements.fullScreenBox.style.opacity = '1';    // Reset opacity for the next time it's shown
		// Clear the image source and alt text
		elements.fullScreenImg.src = "";
		elements.fullScreenImg.alt = "";
		elements.body.style.overflow = ''; // Re-enable scrolling on the main page body
	}, 300); // Set timeout duration to match the CSS transition duration (0.3s = 300ms)
};

// 10. Event Listeners - Sets up all necessary event listeners when the application initializes
/**
 * Attaches all the event listeners required for the application's interactivity.
 */
const setupEventListeners = () => {
	// --- Scroll Listener for Mobile Navigation Panel ---
	window.addEventListener(
		'scroll', // Event type
		debounce(() => { // Debounced handler
			// Check if viewport width corresponds to mobile view
			if (window.innerWidth < 992) {
				handleScrollAction(); // Execute mobile panel logic
			}
		}, 1) // Debounce delay
	);

	// --- Mobile Navigation Toggle Button Click Listener ---
	if (elements.burgerBtn) { // Check if the button exists
		elements.burgerBtn.addEventListener('click', toggleMobileNav); // Attach click handler
	}

	// --- Scroll Listener for Desktop Navigation (Shadow & Scroll Spy) ---
	window.addEventListener(
		'scroll', // Event type
		debounce(() => { // Debounced handler
			// Check if viewport width corresponds to desktop view
			if (window.innerWidth >= 992) {
				handleDesktopNavShadow(); // Handle shadow visibility
                handleScrollSpy();        // Handle scroll spy updates
			}
		}, 20) // Short debounce delay for responsiveness
	);

	// --- Accordion Button Click Listeners ---
	// Iterate over all found accordion buttons
	elements.btnAccordion.forEach(btn => {
		btn.addEventListener('click', toggleAccordionItem); // Attach click handler to each button
	});

	// --- Portfolio Slider Button Click Listeners ---
	if (elements.rightBtnPortfolio) { // Check if right button exists
		elements.rightBtnPortfolio.addEventListener('click', handleNextSlide); // Attach click handler
	}
	if (elements.leftBtnPortfolio) { // Check if left button exists
		elements.leftBtnPortfolio.addEventListener('click', handlePrevSlide); // Attach click handler
	}

	// --- Portfolio Image Click Listeners (to open fullscreen) ---
	// Iterate over all portfolio image containers
	elements.sliderCardsPortfolio.forEach(card => {
		card.addEventListener('click', openFullscreenImage); // Attach click handler to each card
	});

	// --- Fullscreen Close Button Click Listener ---
	if (elements.fullScreenCloseBtn) { // Check if close button exists
		elements.fullScreenCloseBtn.addEventListener('click', closeFullscreenImage); // Attach click handler
	}

	// --- Fullscreen Close by Clicking Background Listener ---
	elements.fullScreenBox.addEventListener('click', e => {
		// Check if the event target (the element actually clicked) is the overlay itself
		if (e.target === elements.fullScreenBox) {
			closeFullscreenImage(); // Close the fullscreen view
		}
	});

	// --- Fullscreen Close with Escape Key Listener ---
	document.addEventListener('keydown', e => {
		// Check if the pressed key was 'Escape' and if the fullscreen overlay is currently displayed
		if (e.key === 'Escape' && elements.fullScreenBox.style.display === 'block') {
			closeFullscreenImage(); // Close the fullscreen view
		}
	});

	// --- Window Resize Listener ---
	window.addEventListener(
		'resize', // Listen for the window resize event
		debounce(() => { // Debounce the handler
            // Actions to take on resize:
			closeFullscreenImage(); // Close the fullscreen view if it's open
			checkPortfolioIndex();     // Update the portfolio slider button states
            updateSliderPosition();    // Update slider position based on potentially new index/view
            // Re-run scroll spy if in desktop view
            if (window.innerWidth >= 992) { handleScrollSpy(); }
		}, 150) // Use a moderate debounce delay (150ms)
	);
};

// 11. Initialization - Code that runs once the page's DOM is ready
/**
 * Initializes the application after the HTML document has been fully parsed.
 * Calls functions to set initial states and attach event listeners.
 */
const init = () => {
	checkPortfolioIndex(); // Set the initial enabled/disabled state of the portfolio slider buttons
	setupEventListeners(); // Attach all defined event listeners
    // Perform initial setup for desktop-specific features if the page loads in desktop view
    if (window.innerWidth >= 992) {
        handleDesktopNavShadow(); // Check if the desktop nav shadow should be visible on load
        handleScrollSpy();        // Run scroll spy once to highlight the correct nav link for the initial scroll position
    }
};

// --- Start the application ---
// Add an event listener to the document that triggers the 'init' function
// once the DOM content has been fully loaded and parsed.
document.addEventListener('DOMContentLoaded', init);

// // nav-mobile
// const burgerPanel = document.querySelector('.hamburger__panel')
// const burgerBtn = document.querySelector('.hamburger')
// const headerSection = document.querySelector('#home')
// const navMobile = document.querySelector('.nav-mobile')
// let prevPosition = [0, 1]

// // nav-desktop
// const navDesktop = document.querySelector('.nav-desktop')
// const navDesktopShadow = document.querySelector('.nav-desktop-shadow')

// // aboutus accordion
// const btnAccordion = document.querySelectorAll('.aboutus__accordion-box-btn')
// const accordion = document.querySelector('.aboutus__accordion')

// // portfolio fullscreen and slider
// const portfolio = document.querySelector('.portfolio')
// const fullScreenBox = document.querySelector('.portfolio__full-screen')
// const fullScreenImg = document.querySelector('.portfolio__full-screen img')
// const fullScreenCloseBtn = document.querySelector('.portfolio__full-screen-close')

// const boxSliderPortfolio = document.querySelector('.portfolio__slider-box')
// const sliderCardsPortfolio = document.querySelectorAll('.portfolio__slider-box-img')
// const leftBtnPortfolio = document.querySelector('.portfolio__slider-btn--left')
// const rightBtnPortfolio = document.querySelector('.portfolio__slider-btn--right')
// const carouselWidthPortfolio = 100
// let indexPortfolio = 0

// // scrollspy
// const navItems = document.querySelectorAll('.nav-desktop-links-link')
// const scrollSpySections = document.querySelectorAll('header, section')
// const navigation = document.querySelector('.nav-desktop')
// const lastSection = document.querySelector('.nav-desktop-links-link:last-of-type')

// //                                          Functions

// // nav-mobile functions

// const scrollAction = () => {
// 	if (window.scrollY <= headerSection.offsetHeight - 50) {
// 		burgerPanel.classList.add('hamburger__panel--active')
// 		burgerPanel.classList.remove('hamburger__panel--active-panel')

// 		if (navMobile.classList.contains('nav-mobile--active')) {
// 			navSkip()
// 		}
// 	} else if (prevPosition[0] < prevPosition[1] && window.scrollY > headerSection.offsetHeight - 50) {
// 		burgerPanel.classList.add('hamburger__panel--active')
// 		burgerPanel.classList.add('hamburger__panel--active-panel')

// 		if (navMobile.classList.contains('nav-mobile--active')) {
// 			navSkip()
// 		}
// 	} else {
// 		burgerPanel.classList.remove('hamburger__panel--active')
// 		burgerPanel.classList.remove('hamburger__panel--active-panel')
// 	}

// 	prevPosition.unshift(window.scrollY)
// 	prevPosition.pop()
// }

// const burgerBtnAction = () => {
// 	navMobile.classList.toggle('nav-mobile--active')

// 	if (navMobile.classList.contains('nav-mobile--active')) {
// 		burgerBtn.classList.add('is-active')
// 		burgerPanel.classList.remove('hamburger__panel--active-panel')
// 	} else if (!navMobile.classList.contains('nav-mobile--active') && window.scrollY <= headerSection.offsetHeight - 50) {
// 		burgerBtn.classList.remove('is-active')
// 	} else {
// 		burgerBtn.classList.remove('is-active')
// 		burgerPanel.classList.remove('hamburger__panel--active')
// 	}
// }

// const navSkip = () => {
// 	navMobile.classList.remove('nav-mobile--active')
// 	burgerBtn.classList.remove('is-active')
// }

// scrollAction()

// // nav-desktop functions

// const deskNavAddShadow = () => {
// 	if (window.scrollY > 200) {
// 		navDesktopShadow.classList.add('nav-desktop-shadow--active')
// 	} else {
// 		navDesktopShadow.classList.remove('nav-desktop-shadow--active')
// 	}
// }

// // aboutus accordion function

// function openAccordionItems() {
// 	this.parentElement.classList.toggle('aboutus__accordion-box--active')
// }

// // portfolio slider and fullscreen

// const checkIndexPortfolio = () => {
// 	if (portfolio.clientWidth < 992) {
// 		if (indexPortfolio === 0) {
// 			leftBtnPortfolio.disabled = true
// 			rightBtnPortfolio.disabled = false
// 		} else if (indexPortfolio === sliderCardsPortfolio.length - 1) {
// 			rightBtnPortfolio.disabled = true
// 			leftBtnPortfolio.disabled = false
// 		} else {
// 			leftBtnPortfolio.disabled = false
// 			rightBtnPortfolio.disabled = false
// 		}
// 	} else {
// 		if (indexPortfolio === 0) {
// 			leftBtnPortfolio.disabled = true
// 			rightBtnPortfolio.disabled = false
// 		} else if (indexPortfolio === sliderCardsPortfolio.length - 4) {
// 			rightBtnPortfolio.disabled = true
// 			leftBtnPortfolio.disabled = false
// 		} else {
// 			leftBtnPortfolio.disabled = false
// 			rightBtnPortfolio.disabled = false
// 		}
// 	}
// }

// checkIndexPortfolio()

// const changeImagePortfolio = () => {
// 	boxSliderPortfolio.style.transform = `translateX(${-indexPortfolio * carouselWidthPortfolio}%)`
// }

// const handleRightArrowPortfolio = () => {
// 	indexPortfolio++
// 	checkIndexPortfolio()
// 	changeImagePortfolio()
// }

// const handleLeftArrowPortfolio = () => {
// 	indexPortfolio--
// 	checkIndexPortfolio()
// 	changeImagePortfolio()
// }

// function openFullScreen() {
// 	if (portfolio.clientWidth < 992) {
// 		return
// 	}

// 	const getSrc = this.firstElementChild.getAttribute('src')
// 	const getAlt = this.firstElementChild.getAttribute('alt')
// 	fullScreenImg.setAttribute('src', getSrc)
// 	fullScreenImg.setAttribute('alt', getAlt)
// 	fullScreenBox.style.display = 'block'
// }

// const closeFullScreen = () => {
// 	fullScreenBox.style.display = 'none'
// }

// const handleScrollSpy = () => {
// 	const sections = []
// 	const navHeight = navigation.offsetHeight

// 	scrollSpySections.forEach(section => {
// 		if (window.scrollY <= section.offsetTop + section.offsetHeight - navHeight) {
// 			sections.push(section)

// 			const activeSection = document.querySelector(`.nav-desktop-links-link[href*="${sections[0].id}"]`)

// 			navItems.forEach(item => item.classList.remove('active-section'))
// 			activeSection.classList.add('active-section')
// 		}
// 	})
// }

// // magnify (lens)

// const magnify = (imgID, zoom) => {
// 	const img = document.querySelector(`#${imgID}`)
// 	const imgContainer = img.parentElement
// 	const glass = document.createElement('div')
// 	glass.className = 'lens'
// 	imgContainer.insertBefore(glass, img)

// 	let isActive = false

// 	const toggleMagnifier = e => {
// 		isActive = !isActive
// 		imgContainer.classList.toggle('active', isActive)
// 		document.body.classList.toggle('hide-cursor', isActive)
// 		glass.style.visibility = isActive ? 'visible' : 'hidden'
// 		glass.style.opacity = isActive ? '1' : '0'

// 		if (isActive) {
// 			glass.style.backgroundImage = `url('${img.src}')`
// 			glass.style.backgroundSize = `${img.width * zoom}px ${img.height * zoom}px`
// 			moveMagnifier(e)
// 			document.addEventListener('mousemove', moveMagnifier)
// 		} else {
// 			document.removeEventListener('mousemove', moveMagnifier)
// 		}
// 	}

// 	const moveMagnifier = e => {
// 		if (!isActive) return;

// 		const imgRect = img.getBoundingClientRect(); // Получаем координаты изображения
// 		const w = glass.offsetWidth / 2;
// 		const h = glass.offsetHeight / 2;

// 		// Определяем позицию курсора относительно изображения
// 		let x = e.clientX - imgRect.left;
// 		let y = e.clientY - imgRect.top;

// 		// Ограничиваем движение лупы внутри изображения
// 		x = Math.max(w / zoom, Math.min(x, img.width - w / zoom));
// 		y = Math.max(h / zoom, Math.min(y, img.height - h / zoom));

// 		// Позиционируем лупу, чтобы она не выходила за границы изображения
// 		glass.style.left = `${imgRect.left + x - w}px`;
// 		glass.style.top = `${imgRect.top + y - h}px`;

// 		// Корректируем смещение фонового изображения внутри лупы
// 		glass.style.backgroundPosition = `-${x * zoom - w}px -${y * zoom - h}px`;
// 	};

// 	const getCursorPos = e => {
// 		const a = img.getBoundingClientRect()
// 		return {
// 			x: e.clientX - a.left,
// 			y: e.clientY - a.top,
// 		}
// 	}

// 	img.addEventListener('click', toggleMagnifier)
// }

// magnify('image', 2)

// //                                    listeners

// // nav-mobile listener
// document.addEventListener('scroll', () => {
// 	if (burgerPanel.clientWidth < 992) {
// 		scrollAction()
// 	}
// })
// burgerBtn.addEventListener('click', burgerBtnAction)

// // nav-desktop listener
// document.addEventListener('scroll', () => {
// 	if (navDesktop.clientWidth >= 992) {
// 		deskNavAddShadow()

// 		if ((fullScreenBox.style.display = 'block')) {
// 			closeFullScreen()
// 		}
// 	}
// })

// // aboutus accordion listener
// btnAccordion.forEach(btn => btn.addEventListener('click', openAccordionItems))

// // portfolio slider and fullscreen
// rightBtnPortfolio.addEventListener('click', handleRightArrowPortfolio)
// leftBtnPortfolio.addEventListener('click', handleLeftArrowPortfolio)

// sliderCardsPortfolio.forEach(card => card.addEventListener('click', openFullScreen))
// fullScreenCloseBtn.addEventListener('click', closeFullScreen)
// window.addEventListener('resize', closeFullScreen)

// // scrollspy
// window.addEventListener('scroll', handleScrollSpy)
