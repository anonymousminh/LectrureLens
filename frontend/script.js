// Use relative path - works with Pages Functions proxy in both dev and production
const API_BASE_PATH = '/api';
let currentLectureId = null;
// Get the DOM elements

const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");
const chatWindow = document.getElementById("chat-window");
const lectureUploadInput = document.getElementById("lecture-upload");
const summarizeButton = document.getElementById("summarize-button");

// Handle File Upload Function
async function handleFileUpload(){
    // Check if the file has been uploaded
    if (lectureUploadInput.files.length === 0){
        displayMessage("Please upload a lecture file to begin", 'system');
        return;
    }

    // Get the file
    const file = lectureUploadInput.files[0];

    // Display the loading message
    const uploadMessage = displayMessage(`Uploading and processing "${file.name}"...`, 'system');

    // Disable the upload input
    lectureUploadInput.disabled = true;
    chatInput.disabled = true;
    sendButton.disabled = true;

    try {
        // Use FileReader to read the file content as text
        const reader = new FileReader();

        // This promise will resolve when the file is read
        const fileContent = await new Promise((resolve, reject) => {
            reader.onload = (event) => {
                resolve(event.target.result); // File content
            };
            reader.onerror = (error) => {
                reject(error); // File reading error
            };
            reader.readAsText(file); // Read the file
        });

        // Log for verification
        console.log(`Received file: ${file.name}. Content preview: ${fileContent.substring(0, 100)}...`);

        // Upload the lecture to the API
        await uploadLecture(file.name, fileContent);
        
        // Update the message (uploadLecture function will display its own message)
        uploadMessage.remove();
    } catch (error){
        console.log("File Upload Error:", error);
        uploadMessage.textContent = `Error: ${error.message}. Please try again.`;
        
        // Re-enable the UI on error
        lectureUploadInput.disabled = false;
        chatInput.disabled = true;
        sendButton.disabled = true;
    }
}

// uploadLecture function to upload the lecture to the API
async function uploadLecture(fileName, fileContent){
    // Construct the full URL
    const uploadUrl = `${API_BASE_PATH}/upload`;

    // Create a new FormData object
    const formData = new FormData();
    // Append the file name and content to the form data
    formData.append('lectureFile', new Blob([fileContent], {type: 'text/plain'}), fileName);

    try {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });

        // Check the HTTP errors
        if (!response.ok){
            const errorBody = await response.json();
            throw new Error(`API Error (${response.status}): ${errorBody.error || errorBody.message || 'Unknown error'}`);
        }

        // Parsing the JSON body and return the lecture ID
        const data = await response.json();
        const newLectureId = data.lectureId;

        if (!newLectureId){
            throw new Error('Upload failed: No lecture ID returned');
        }
        // Store the new lecture ID globally and locally
        currentLectureId = newLectureId;
        localStorage.setItem('LectureLens-currentLectureId', newLectureId);

        // Enable the UI
        chatInput.disabled = false;
        sendButton.disabled = false;
        lectureUploadInput.disabled = false;
        chatInput.focus();

        displayMessage(`Lecture "${fileName}" uploaded successfully! You can now ask questions about the lecture.`, 'system');
    } catch (error){
        console.log("Upload Lecture Error:", error);
        displayMessage(`Error: ${error.message}. Please try again.`, 'system');
        throw new Error(`Upload failed: ${error.message}`);

        chatInput.disabled = true;
        sendButton.disabled = true;
        lectureUploadInput.disabled = false;
    }
}


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

    return messageElement;
}

// Handle Send Message
async function sendMessage(){
    // Get the message and trim whitespace
    const messageText = chatInput.value.trim();

    // Check if message is empty
    if (messageText === ""){
        return;
    }

    // Display the user's message and clear the input
    displayMessage(messageText, 'user');
    chatInput.value = '';

    // ------ This is the loading state ------

    // Disable the input and send button immediately after user send messages
    chatInput.disabled = true;
    sendButton.disabled = true;

    // Display the loading assistant response
    const loadingMessage = displayMessage("Thinking...", 'assistant')

    try {
    // Await the result of callChatAPI
    const aiResponse = await callChatAPI(messageText);

    // Display the AI response
    loadingMessage.textContent = aiResponse;
    } catch (error){
        console.log("Chat Error:", error);
        loadingMessage.textContent = `Error: ${error.message}. Please try again.`;
    } finally {
        // ------ End loading state ------
        // Re-enable the UI
        chatInput.disabled = false;
        sendButton.disabled = false;
    }


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

// callChatAPI function
async function callChatAPI(message) {
    // Construct the full URL
    const url = `${API_BASE_PATH}/chat/${currentLectureId}`;

    try {
        // Use the global fetch to send the POST request
        const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: message})
    });

    // Check the HTTP errors
    if (!response.ok){
        const errorBody = await response.json();
        throw new Error(`API Error (${response.status}): ${errorBody.error || errorBody.message || 'Unknown error'}`);
    }

    // Parsing the JSON body and return the AI response
    const data = await response.json();
    return data.response;

    } catch (error){
        console.log(`Fetch failed:`, error);
        throw new Error(`Chat failed: ${error.message}`);
    }
}

// Initialize the current lecture ID
function initializeApp(){
    // Try to get the lecture ID from localStorage
    const storedLectureId = localStorage.getItem('LectureLens-currentLectureId');

    if (storedLectureId){
        currentLectureId = storedLectureId;
        displayMessage(`Welcome back! Continuing chat for your last lecture.`, 'system');
        // Enable the UI
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
    } else {
        displayMessage(`Welcome! Please upload your materials to begin`, 'system');
        // Disable the UI
        chatInput.disabled = true;
        sendButton.disabled = true;
    }
    // File upload input is always enabled initially
    lectureUploadInput.disabled = false;
}

// callSummarizeAPI function
async function callSummerizeAPI(){
    if (!currentLectureId){
        displayMessage("Please upload a lecture slide to begin summarization.", 'system');
        return;
    }

    // Disable UI during API call
    chatInput.disabled = true;
    sendButton.disabled = true;
    summarizeButton.disabled = true;
    lectureUploadInput.disabled = true;

    const loadingMessage = displayMessage("Generating summary...", 'system');

    try {
        // 1. Retrieve the raw lecture text from DO
        const rawTextUrl = `${API_BASE_PATH}/chat/${currentLectureId}/raw-lecture-text`;
        const rawTextResponse = await fetch(rawTextUrl);

        if (!rawTextResponse.ok){
            const errorBody = await rawTextResponse.json();
            throw new Error(`Failed to retrieve raw lecture text (${rawTextResponse.status}): ${errorBody.error || errorBody.message || 'Unknown error'}`);
        }

        const rawTextData = await rawTextResponse.json();
        const lectureContent = rawTextData.rawText;

        if (!lectureContent){
            throw new Error('Raw lecture content not found in Durable Object.');
        }

        // 2. Send the raw lecture content to the summarize endpoint
        const summarizeUrl = `${API_BASE_PATH}/summarize`;
        const summarizeResponse = await fetch(summarizeUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: lectureContent})
        });

        if (!summarizeResponse.ok){
            const errorBody = await summarizeResponse.json();
            throw new Error(`Failed to summarize lecture content (${summarizeResponse.status}): ${errorBody.error || errorBody.message || 'Unknown error'}`);
        }

        const summarizeData = await summarizeResponse.json();
        const summary = summarizeData.summary;

        loadingMessage.textContent = `Lecture Summary: ${summary}`;
        loadingMessage.classList.remove('system');
        loadingMessage.classList.add('assistant');
    } catch (error){
        console.log("Summarize Error:", error);
        loadingMessage.textContent = `Error generating summary: ${error.message}. Please try again.`;
        loadingMessage.classList.add('error');
    } finally {
        // Re-enable the UI
        chatInput.disabled = false;
        sendButton.disabled = false;
        summarizeButton.disabled = false;
        lectureUploadInput.disabled = false;
        chatInput.focus();
    }
}


// ----- Event Listeners -----
sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter'){
        event.preventDefault();
        sendMessage();
    }
});

// Handle File Upload Button Click
lectureUploadInput.addEventListener('change', handleFileUpload);

// Handle Summarize Button Click
summarizeButton.addEventListener('click', callSummerizeAPI);

// Initialize the app
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle Clear Button Click
const clearButton = document.getElementById('clear-button');
if (clearButton){
    clearButton.addEventListener('click', () => {
        localStorage.removeItem('LectureLens-currentLectureId');
        window.location.reload();
    });
}


