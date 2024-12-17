// Function to copy the content of an input field to clipboard
function copyToClipboard(inputId) {
    var inputElement = document.getElementById(inputId);
    
    // Disable text selection
    inputElement.blur(); // Remove focus from input to prevent text selection
    
    inputElement.select();
    inputElement.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand("copy");

    // Get the copy button and change its text to 'Copied'
    var copyButton = document.querySelector(`#${inputId} + .copy-btn`);
    copyButton.textContent = "✓Copied";  // Change the button text to 'Copied' with a check mark
    copyButton.disabled = true;  // Disable the button to prevent further clicks

    // Revert the button text back to 'Copy' after 5 seconds
    setTimeout(function() {
        copyButton.textContent = "Copy";
        copyButton.disabled = false;  // Enable the button again
    }, 600);
}