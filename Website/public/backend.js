// Define a function to limit API requests
async function rateLimitedRequest(requestData) {
    // Implement your own rate-limiting logic here
    // For example, add a delay (e.g., 2 seconds) between requests
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(2000); // Adjust the delay as needed

    // Make the API request
    return fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': process.env.OPENAI_API_KEY, // Replace with your actual API key
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    });
}

function interactWithChatGPT(userMessage) {
    // Show loading circle
    document.getElementById('loading-circle').style.display = 'block';

    // Create a data object for the API request
    const requestData = {
        model: 'gpt-3.5-turbo', // Specify the ChatGPT model
        messages: [
            { role: 'system', content: 'You are a helpful assistant that converts code to PlantUML format.' },
            { role: 'user', content: userMessage },
        ],
        max_tokens: 300, // You can adjust the max_tokens as needed
    };

    // Make an API request to ChatGPT
    console.log('API Request Data:', requestData);
    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': process.env.OPENAI_API_KEY, // Replace with your actual API key
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    })
        .then(response => response.json())
        .then(data => {
            // Hide loading circle
            console.log('API Response:', data);
            document.getElementById('loading-circle').style.display = 'none';

            // Extract the response from ChatGPT
            const chatGPTResponse = data.choices[0].message.content;

            // Convert ChatGPT response to PlantUML format (customize this part)
            const plantUMLCode = convertChatGPTResponseToPlantUML(chatGPTResponse);

            // Display the PlantUML code
            displayPlantUMLCode(plantUMLCode);
        })
        .catch(error => {
            console.error('Error:', error);
            // Hide loading circle in case of an error
            document.getElementById('loading-circle').style.display = 'none';
        });
}

// Function to convert ChatGPT response to PlantUML format (customize this part)
function convertChatGPTResponseToPlantUML(response) {
    // Parse the response
    const lines = response.split('\n');
    let plantUMLCode = '';
    let isInPlantUMLBlock = false;

    for (const line of lines) {
        if (line.startsWith('@startuml')) {
            isInPlantUMLBlock = true;
            plantUMLCode += line + '\n';
        } else if (line.startsWith('@enduml')) {
            isInPlantUMLBlock = false;
            plantUMLCode += line + '\n';
        } else if (isInPlantUMLBlock) {
            plantUMLCode += line + '\n';
        }
    }

    return plantUMLCode;
}

// Function to display the PlantUML code and render the PlantUML diagram
// Function to display the PlantUML code and render the PlantUML diagram
// Function to display the PlantUML code and render the PlantUML diagram

// Function to display the PlantUML code and render the PlantUML diagram
function displayPlantUMLCode(plantUMLCode) {
    // Log and verify this PlantUML code manually
    console.log('Original PlantUML Code: \n', plantUMLCode);

    // Encode the PlantUML code in HEX format
    const hexEncodedPlantUMLCode = encodePlantUMLInHex(plantUMLCode);

    // Construct the URL with HEX-encoded data
    const imageUrl = `https://www.plantuml.com/plantuml/png/~h${hexEncodedPlantUMLCode}`;

    // Log and manually access this URL to verify
    console.log('Image URL:', imageUrl);

    // Set the image source
    const plantUMLDiagramContainer = document.getElementById('plantUML-diagram-container');
    plantUMLDiagramContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = imageUrl;
    plantUMLDiagramContainer.appendChild(img);
}

// Function to encode PlantUML text in HEX format
// Function to encode PlantUML text in HEX format
// Function to encode PlantUML text in HEX format with correct line endings
function encodePlantUMLInHex(plantUMLCode) {
    // Convert each character to HEX and include correct line endings (0D0A)
    let hex = '';
    for (let i = 0; i < plantUMLCode.length; i++) {
        const charCode = plantUMLCode.charCodeAt(i).toString(16).toUpperCase();
        hex += charCode.length < 2 ? '0' + charCode : charCode; // Ensure two characters for each code
    }
    return hex;
}


// Update the event listener to use ChatGPT
document.getElementById('upload-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form submission

    // Get user input from the code file
    const fileInput = document.getElementById('code-file');
    const selectedFile = fileInput.files[0];

    if (selectedFile) {
        // Read the contents of the selected file
        const reader = new FileReader();
        reader.onload = function (event) {
            const codeContent = event.target.result;

            // Send the code content to ChatGPT for conversion
            interactWithChatGPT(codeContent);
        };
        reader.onerror = function (event) {
            // Handle file read errors here
            console.error('File read error:', event.target.error);

            // Display an error message to the user
            const plantUMLContainer = document.getElementById('plantUML-code-container');
            plantUMLContainer.textContent = 'Error: Failed to read the selected file.';
        };
        reader.readAsText(selectedFile);
    }
});