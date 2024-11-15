/**
 * Debounce
 *
 * @format
 */

const debounce = (func, delay) => {
  let timerId; // Holds a reference to the timeout between calls.
  return (...args) => {
    clearTimeout(timerId); // Clears the current timeout, if any, to reset the debounce timer.
    timerId = setTimeout(() => {
      func.apply(this, args); // Calls the passed function after the specified delay with the correct context and arguments.
    }, delay);
  };
};
/* Debounce */
/* Text Splitter */
class TextSplitter {
  constructor(textElement, options = {}) {
    // Ensure the textElement is a valid HTMLElement.
    if (!textElement || !(textElement instanceof HTMLElement)) {
      throw new Error("Invalid text element provided.");
    }

    const { resizeCallback, splitTypeTypes } = options;

    this.textElement = textElement;
    // Assign the resize callback if provided and is a function, otherwise null.
    this.onResize = typeof resizeCallback === "function" ? resizeCallback : null;

    const splitOptions = splitTypeTypes ? { types: splitTypeTypes } : {};
    this.splitText = new SplitType(this.textElement, splitOptions);

    // Initialize ResizeObserver to re-split text on resize events, if a resize callback is provided.
    if (this.onResize) {
      this.initResizeObserver(); // Set up observer to detect resize events.
    }
  }

  // Sets up ResizeObserver to re-split text on element resize.
  initResizeObserver() {
    this.previousContainerWidth = null; // Track element width to detect resize.

    let resizeObserver = new ResizeObserver(debounce((entries) => this.handleResize(entries), 100));
    resizeObserver.observe(this.textElement); // Start observing the text element.
  }

  // Handles element resize, re-splitting text if width changes.
  handleResize(entries) {
    const [{ contentRect }] = entries;
    const width = Math.floor(contentRect.width);
    // If element width changed, re-split text and call resize callback.
    if (this.previousContainerWidth && this.previousContainerWidth !== width) {
      this.splitText.split(); // Re-split text for new width.
      this.onResize(); // Execute the callback function.
    }
    this.previousContainerWidth = width; // Update stored width.
  }

  // Returns the lines created by splitting the text element.
  getLines() {
    return this.splitText.lines;
  }

  // Returns the words created by splitting the text element.
  getWords() {
    return this.splitText.words;
  }

  // Returns the chars created by splitting the text element.
  getChars() {
    return this.splitText.chars;
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");
  if (gsap && ScrollTrigger) {
    console.log("GSAP and ScrollTrigger are loaded.");
  } else {
    console.error("GSAP or ScrollTrigger is not available.");
  }
  gsap.registerPlugin(ScrollTrigger);
  // gsap code here!
  class BlurScrollEffect {
    constructor(textElement) {
      console.log("Applying BlurScrollEffect to:", textElement);
      // Check if the provided element is valid.
      if (!textElement || !(textElement instanceof HTMLElement)) {
        throw new Error("Invalid text element provided.");
      }

      // Attempt to create a SplitType instance and check the output
      this.splitter = new TextSplitter(textElement, {
        resizeCallback: () => this.scroll(),
        splitTypeTypes: "words, chars",
      });
      console.log("Testing SplitType:");
      console.log(this.splitter.getChars()); // Should log characters if SplitType is working
      this.scroll();

      this.textElement = textElement;

      // Set up the effect for the provided text element.
      this.initializeEffect();
    }

    // Sets up the initial text effect on the provided element.
    initializeEffect() {
      // Callback to re-trigger animations on resize.
      const textResizeCallback = () => this.scroll();

      // Split text for animation and store the reference.
      this.splitter = new TextSplitter(this.textElement, {
        resizeCallback: textResizeCallback,
        splitTypeTypes: "words, chars",
      });
      console.log("Characters created by SplitType:", this.splitter.getChars());

      // Trigger the initial scroll effect.
      this.scroll();
    }

    // Animates text based on the scroll position.
    scroll() {
      console.log("Scroll function triggered");
      // Query all individual characters in the line for animation.
      const chars = this.splitter.getChars();
      if (chars && chars.length) {
        console.log("Characters for animation:", chars);

        gsap.fromTo(
          chars,
          {
            filter: "blur(10px) brightness(30%)",
            willChange: "filter",
          },
          {
            ease: "none",
            filter: "blur(0px) brightness(100%)",
            stagger: 0.05,
            scrollTrigger: {
              trigger: this.textElement,
              start: "top bottom-=15%",
              end: "bottom center+=15%",
              scrub: true,
              onEnter: () => console.log("Animation started"),
            },
          }
        );
      } else {
        console.error("No characters available for animation.");
      }
    }
  }
  const textElement = document.querySelector("#text-blur-2");
  if (textElement) {
    new BlurScrollEffect(textElement);
  }
});
