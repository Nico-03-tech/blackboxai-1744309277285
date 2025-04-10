document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');

    // Willkommensnachricht
    addBotMessage("Hallo! 👋 Ich bin dein kreativer Freund! Ich kann dir helfen, tolle Bilder und Videos zu erstellen. Was möchtest du machen?");

    // Focus input on load
    userInput.focus();

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (!message) {
            userInput.value = '';
            userInput.focus();
            return;
        }

        // Clear and disable input
        const currentMessage = message;
        userInput.value = '';
        userInput.disabled = true;

        try {
            // Show user message
            addUserMessage(currentMessage);
            
            // Show thinking indicator
            await showTypingIndicator();

            // Generate and show response
            const response = await generateResponse(currentMessage.toLowerCase());
            if (typeof response === 'object' && response.message && response.request) {
                // Show friendly message first
                addBotMessage(response.message);
                // Then show MCP tool request
                addBotMessage(response.request);
            } else {
                // For regular text responses
                addBotMessage(response);
            }

        } catch (error) {
            console.error('Error:', error);
            addBotMessage("Entschuldigung, da ist etwas schiefgegangen! 😔");
        } finally {
            // Re-enable input and focus
            userInput.disabled = false;
            userInput.focus();
            
            // Scroll to bottom
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    });

    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-bubble user-bubble';
        messageDiv.textContent = text;
        chatContainer.appendChild(messageDiv);
    }

    function addBotMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-bubble bot-bubble';
        messageDiv.textContent = text;
        chatContainer.appendChild(messageDiv);
    }

    async function showTypingIndicator() {
        addBotMessage("Ich denke nach... 🤔");
        await new Promise(resolve => setTimeout(resolve, 1500));
        chatContainer.removeChild(chatContainer.lastChild);
    }

    async function generateResponse(message) {
        // Einfache Schlüsselworterkennung für kindgerechte Antworten
        if (message.includes('bild') || message.includes('male') || message.includes('zeichne')) {
            return await generateMedia('generate_image', {
                description: message,
                style: 'cartoon'
            });
        }
        
        if (message.includes('video') || message.includes('film')) {
            return await generateMedia('generate_video', {
                description: message,
                duration: 10
            });
        }

        // Helper function to generate media using MCP tools
        async function generateMedia(toolName, args) {
            const isVideo = toolName === 'generate_video';
            const emoji = isVideo ? '🎥' : '🎨';
            const friendlyMessage = `Ich erstelle ${isVideo ? 'ein Video' : 'ein Bild'} für dich! ${emoji}`;
            
            const mcpRequest = `<use_mcp_tool>
<server_name>media-generator</server_name>
<tool_name>${toolName}</tool_name>
<arguments>
${JSON.stringify(args, null, 2)}
</arguments>
</use_mcp_tool>`;

            return {
                message: friendlyMessage,
                request: mcpRequest
            };
        }

        if (message.includes('hallo') || message.includes('hi')) {
            return "Hallo! 👋 Schön, dass du da bist! Ich kann Bilder und Videos für dich erstellen. Was möchtest du machen?";
        }

        if (message.includes('danke')) {
            return "Gerne! 😊 Das macht mir richtig Spaß mit dir! Möchtest du noch ein Bild oder Video erstellen?";
        }

        if (message.includes('tschüss') || message.includes('bye')) {
            return "Tschüss! 👋 Komm bald wieder zum Spielen! Ich freue mich schon darauf, neue Bilder und Videos mit dir zu erstellen!";
        }

        // Standardantwort
        return "Das klingt spannend! 🌟 Soll ich daraus ein Bild oder ein Video für dich machen?";
    }
});
