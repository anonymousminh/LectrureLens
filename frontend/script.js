// Get the DOM elements

chatInput = document.getElementById("chat-input");
sendButton = document.getElementById("send-button");
chatWindow = document.getElementById("chat-window");


// Message Display Function
function displayMessage(text, role){
    // Create a new div element
    const messageElement = document.createElement('div');
    // Set its class to include message and the role
    messageElement.classList.add('message', role);
    // Set its text content
    messageElement.textContent = text;
    // Apend the new div to the chat-window
    chatWindow.appendChild(messageElement);
    // Implement auto-scrolling
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Handle Send Message
function sendMessage(){
    // Get the message and trim whitespace
    const messageText = chatInput.value.trim();

    // Check if message is empty
    if (messageText === ""){
        return;
    }

    // Display the user's message
    displayMessage(messageText, 'user');

    // Simulate the assistant response
    displayMessage("Thinking...", 'assistant')

    // Clear the input field
    chatInput.value = ''
}

// Handle Send Button Click
sendButton.addEventListener('click', sendMessage);

// Handle Enter Key Press
chatInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter'){
        event.preventDefault();
        sendMessage();
    }
})