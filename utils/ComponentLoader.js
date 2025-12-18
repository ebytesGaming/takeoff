const ReadFolder = require('./ReadFolder.js');
const { existsSync } = require('node:fs');
const { SlashCommandBuilder } = require('@discordjs/builders');

const modules = [
	'commands',   // slash commands
	'buttons',
	'dropdowns',
	'messages',   // prefix commands
	'modals',
];

module.exports = function (client) {
	for (const module of modules) {
		client[module] = new Map();

		if (!existsSync(`${__dirname}/../${module}`)) continue;

		const files = ReadFolder(module);
		for (const { path, data } of files) {
			try {
				if (!data.execute) throw `No execute function found`;
				if (typeof data.execute !== 'function') throw `Execute is not a function`;

				if (module === 'commands') {
					if (!(data.data instanceof SlashCommandBuilder)) throw 'Invalid command - Must use the slash command builder';
					client[module].set(data.data.name, data);

				} else if (module === 'messages') {
					if (!data.name || typeof data.name !== 'string') throw new Error('Invalid message command - Must have a valid name');
					client[module].set(data.name.toLowerCase(), data);

				} else {
					if (!data.customID) throw 'No custom ID has been set';
					if (typeof data.customID !== 'string') throw 'Invalid custom ID - Must be string';
					client[module].set(data.customID, data);
				}
			} catch (error) {
				console.error(`[${module.toUpperCase()}] Failed to load ./${path}: ${error.stack || error}`);
			}
		}
		console.log(`Loaded ${client[module].size} ${module}`);
	}
};
