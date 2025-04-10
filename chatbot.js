document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');

    // Willkommensnachricht
    addBotMessage("Hallo! 👋 Ich bin dein kreativer Freund! Ich kann dir helfen, tolle Bilder und Videos zu erstellen. Was möchtest du machen?");

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (!message) return;

        // Benutzernachricht anzeigen
        addUserMessage(message);
        userInput.value = '';

        // Bot "denkt nach"
        await showTypingIndicator();

        try {
            // Nachricht analysieren und Antwort generieren
            const response = await generateResponse(message.toLowerCase());
            addBotMessage(response);

            // Wenn die Antwort ein Bild oder Video enthält, füge es in den Chat ein
            if (response.includes('Hier ist es:')) {
                const mediaUrl = response.split('Hier ist es:')[1].trim();
                const mediaContainer = document.createElement('div');
                mediaContainer.className = 'chat-bubble bot-bubble';
                
                if (mediaUrl.endsWith('.mp4')) {
                    const video = document.createElement('video');
                    video.src = mediaUrl;
                    video.controls = true;
                    video.style.maxWidth = '100%';
                    mediaContainer.appendChild(video);
                } else {
                    const img = document.createElement('img');
                    img.src = mediaUrl;
                    img.alt = 'Generiertes Bild';
                    img.style.maxWidth = '100%';
                    mediaContainer.appendChild(img);
                }
                
                chatContainer.appendChild(mediaContainer);
            }
        } catch (error) {
            console.error('Error in chat response:', error);
            addBotMessage("Entschuldigung, da ist etwas schiefgegangen! 😔");
        }

        // Automatisch nach unten scrollen
        chatContainer.scrollTop = chatContainer.scrollHeight;
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
            const response = await generateMedia('generate_image', {
                description: message,
                style: 'cartoon'
            });
            return response;
        }
        
        if (message.includes('video') || message.includes('film')) {
            const response = await generateMedia('generate_video', {
                description: message,
                duration: 10
            });
            return response;
        }

        // Helper function to generate media using MCP tools
        async function generateMedia(toolName, args) {
            try {
                const result = await window.blackbox.use_mcp_tool({
                    server_name: 'media-generator',
                    tool_name: toolName,
                    arguments: args
                });

                if (result && result.content && result.content[0] && result.content[0].text) {
                    const mediaData = JSON.parse(result.content[0].text);
                    const isVideo = toolName === 'generate_video';
                    const url = isVideo ? mediaData.videoUrl : mediaData.imageUrl;
                    const emoji = isVideo ? '🎥' : '🎨';
                    return `Ich habe ${isVideo ? 'ein Video' : 'ein Bild'} für dich erstellt! ${emoji}\nHier ist es: ${url}`;
                }
                return `Entschuldigung, ich konnte gerade ${toolName === 'generate_video' ? 'kein Video' : 'kein Bild'} erstellen. 😔 Lass uns etwas anderes versuchen!`;
            } catch (error) {
                console.error(`Error generating ${toolName}:`, error);
                return "Ups, da ist etwas schiefgegangen! 😅 Sollen wir etwas anderes machen?";
            }
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
