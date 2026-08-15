
  // Wait until the entire HTML document is loaded before running the script
  document.addEventListener('DOMContentLoaded', () => {
      // 1. Get references to the elements we want to interact with from the DOM (Document Object Model)
      const button = document.getElementById('myButton');
      const greetingElement = document.getElementById('greeting');

      // 2. Add an "event listener" to the button. This tells the browser:
      // "When a 'click' happens on this button, execute the function below."
      button.addEventListener('click', () => {
          // Change the text content of the paragraph element (the greeting)
          greetingElement.textContent = "🥳 Success! You clicked the button and changed the page!";

          // Optional: Change the styling slightly after clicking for feedback
          greetingElement.style.color = '#28a745'; // Green color on success
      });

      console.log("JavaScript loaded successfully.");
  });