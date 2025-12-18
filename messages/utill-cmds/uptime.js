/**
 * Prefix Uptime Command Script
 * This command displays a loading animation for 3 seconds before showing the bot's actual uptime.
 * It is structured for use within a Discord.js command handler.
 */

// We only need the core message object, so we include minimal imports.
// Note: If you were using the Discord.js library, 'message' would already be available 
// in the 'execute' function's arguments. We don't need the external imports 
// like ButtonBuilder since this command is simple text output.

module.exports = {
    // Note: I'm keeping the name 'uptime' as it matches the command logic, 
    // replacing 'dash' unless you intended 'dash' to be the command name 
    // that triggers the uptime check. Assuming 'uptime' is the desired command name.
    name: 'uptime', 
    cooldown: 5,
    
    /**
     * Executes the uptime command logic.
     * @param {object} message The Discord message object where the command was called.
     */
    async execute(message) {
        // --- Configuration ---
        const LOADING_EMOJI = '<a:loading:1442378094110441584>';
        const READY_EMOJI = '<:readytoduty:1325808236980604989>';

        /**
         * Formats the raw uptime (in seconds) into a readable string 
         * (e.g., "1d 2h 3m 4s").
         * @param {number} totalSeconds The total uptime in seconds (from process.uptime()).
         * @returns {string} The formatted uptime string.
         */
        function formatUptime(totalSeconds) {
            const days = Math.floor(totalSeconds / (3600 * 24));
            totalSeconds %= (3600 * 24);
            const hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = Math.floor(totalSeconds % 60);

            const parts = [];
            if (days > 0) parts.push(`${days}d`);
            if (hours > 0) parts.push(`${hours}h`);
            if (minutes > 0) parts.push(`${minutes}m`);
            parts.push(`${seconds}s`); // Always show seconds

            return parts.join(' ');
        }

        // Initial message content: "<a:loading:1442378094110441584> Finding Uptime"
        const initialMessage = `${LOADING_EMOJI} Finding Uptime`;

        try {
            // 1. Send the initial "loading" message.
            const sentMessage = await message.channel.send(initialMessage);

            // 2. Wait for 3 seconds (3000 milliseconds).
            // Using a Promise wrapped setTimeout for clean asynchronous flow.
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 3. Get the bot's uptime in seconds from the Node.js process.
            const uptimeInSeconds = process.uptime();
            const formattedUptime = formatUptime(uptimeInSeconds);

            // 4. Edit the message with the final uptime result.
            // Final format: "<:readytoduty:1325808236980604989> The current uptime is [Formatted Uptime]"
            const finalContent = `${READY_EMOJI} The current uptime is ${formattedUptime}`; 
            
            // Attempt to edit the message.
            await sentMessage.edit(finalContent);

        } catch (error) {
            // If the initial send or final edit fails (e.g., due to permissions or message deletion)
            console.error("Error executing uptime command:", error);
            // Attempt to send a failure message if the edit failed, or ignore if initial send failed.
            // A common practice is to just handle the console error in production.
            if (!message.deleted) {
                try {
                    message.channel.send("❌ Could not display uptime due to an error.");
                } catch (sendError) {
                    // Ignore send error
                }
            }
        }
    }
};

// The following section (prefix handling) is no longer needed as the 
// 'execute' function is placed directly inside the command module export.

/**
 * Main function to process incoming messages and check for the prefix and command.
 * This function simulates the core handler logic of a Discord bot.
 * @param {object} message The Discord message object received.
 */
/*
function processIncomingMessage(message) {
    // 1. Check if the message starts with the defined prefix. If not, ignore.
    if (!message.content.startsWith(PREFIX)) return;

    // 2. Extract the arguments and the command name.
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 3. Check if the command matches the uptime command name.
    if (command === COMMAND_NAME) {
        executeUptimeLogic(message);
    }
}
*/