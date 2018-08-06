const Discord = require("discord.js");
const client = new Discord.Client();
var re = /([0-9]+)d([0-9]+)([\+?|\-?]?[0-9]*)/;
var acceptedRoleNames = ['testrole1', 'testrole2', 'testrole3'];
var execFile = require('child_process').execFile;
var loggedIn = false;
var authToken = 'Mzg2NDUyNDI3ODgyMjMzODU5.DQn6_Q.yqom87-sGJ9qxWwsxz_pbdQOEGE';
var usersToShutup = [];
const say = require('say');
const fs = require('fs');
const sleep = require('sleep.js');
const shell = require('node-powershell');
const ytdl = require('ytdl-core');
var chrisIsLate = false;
var dispatcher;
var speaking = false;
var testMode = false;
var stockMarket;

let ps = new shell({
	executionPolicy: 'Bypass',
	noProfile: true
});

client.login(authToken);

console.log('\n\n+-----------+\n|  dinkOS   |\n|  loading  |\n+-----------+\n\n');

var dinkie;
var connection;
var connectedToVoice = false;
var jamie;

client.on('ready', function(){
	if(!testMode){
		console.log(`Logged in as ${client.user.tag}!`);
		loggedIn = true;
	}
	stockMarket = client.channels.get('419533162679631872');
	stockMarket.bulkDelete(100).catch(console.error);
	client.guilds.forEach(function(guild){
		dinkie = guild.members.find('id', '128655163379417097');
		if(dinkie == undefined){
			guild.leave();
		}
		else{
			var channel = dinkie.voiceChannel;
			if(channel != undefined){
				console.log('Dinkie is in voice');
				dinkie.voiceChannel.join().then(newConnection => {
					connection = newConnection;
					console.log('Joined successfully');
					connectedToVoice = true;
//					ps.addCommand('cd "' + __dirname + '"');
//					ps.addCommand('./scripts/voice.ps1 "Dink bot has joined"');
//					ps.invoke().then(output => {
//						dispatcher = connection.playFile(getDirectory("/scripts/output.wav"));
//						dispatcher.setVolume(0.5);
//					}).catch(err =>{
//						console.log(err);
//						ps.dispose();
//					});
					dispatcher = connection.playFile(getDirectory("/startup.mp3"));
					dispatcher.setVolume(0.5);
				});
			}
		}
	});
});

client.on('voiceStateUpdate', function(oldMember, newMember){
	console.log('voice state update');
	if(newMember.user.username == 'Dinkie Shy'){
		console.log('it was Dinkie');
		if(newMember.voiceChannel == undefined){
			if(connectedToVoice){
				var channel = oldMember.voiceChannel;
				dispatcher = connection.playFile(getDirectory("/shutdown.mp3"));
				dispatcher.setVolume(0.5);
				dispatcher.on('end', function(){
					channel.leave();
				});
				connectedToVoice = false;
			}
		}
		else if(oldMember.voiceChannel == undefined || !connectedToVoice){
			var channel = newMember.voiceChannel;
			console.log('Dinkie joined voice');
			newMember.voiceChannel.join().then(newConnection => {
				connection = newConnection;
				console.log('Joined successfully');
				connectedToVoice = true;
//				ps.addCommand('cd "' + __dirname + '"');
//				ps.addCommand('./scripts/voice.ps1 "Dink bot has joined"');
//				ps.invoke().then(output => {
//					dispatcher = connection.playFile(getDirectory("/scripts/output.wav"));
//					dispatcher.setVolume(0.5);
//				}).catch(err =>{
//					console.log(err);
//					ps.dispose();
//				});
				dispatcher = connection.playFile(getDirectory("/startup.mp3"));
				dispatcher.setVolume(0.5);
			});
		}
		else if(newMember.voiceChannel != undefined && oldMember.voiceChannel != undefined && oldMember.voiceChannel != newMember.voiceChannel){
			var channel = newMember.voiceChannel;
			console.log('Dinkie moved channels');
			connection.channel.leave();
			newMember.voiceChannel.join().then(newConnection =>{
				connection = newConnection;
			});
		}
	}
	else if(newMember.user.username != "DinkBot" && connectedToVoice){
		var thingToSay = generateVoiceMessage(oldMember, newMember);
		if(thingToSay != ""){
			ps.addCommand('cd \"' + __dirname + '\"');
			ps.addCommand('./scripts/voice.ps1 \"' + thingToSay + '\"');
			ps.invoke().then(output => {
				if(!dispatcher.speaking){
					dispatcher = connection.playFile(getDirectory("/scripts/output.wav"));
				}
				else{
					dispatcher.on('end', function(){
						dispatcher = connection.playFile(getDirectory("/scripts/output.wav"));
					});
				}
				if(newMember.roles.find('name', 'Chris') != undefined && chrisIsLate){
					console.log("Chris joined and is late");
					dispatcher.on('end', function(){
						dispatcher = connection.playFile(getDirectory("/ffschris.mp3"));
						dispatcher.setVolume(0.5);
					});
					chrisIsLate = false;
				}
				dispatcher.on('end', function(){
					speaking = false;
				});
			}).catch(err =>{
				console.log(err);
				ps.dispose();
			});
		}
	}
	else if(newMember.user.username != "DinkBot" && !connectedToVoice){
		var thingToSay = generateVoiceMessage(oldMember, newMember);
		say.speak(thingToSay);
	}
});

function generateVoiceMessage(oldMember, newMember){
	var join = false;
	var leave = false;
	var move = false;
	var bot = newMember.user.bot;
	var thingToSay = "";
	if(newMember.voiceChannel == undefined){
		leave = true;
	}
	else if(oldMember.voiceChannel == undefined){
		join = true;
	}
	else if(oldMember.voiceChannel != newMember.voiceChannel){
		move = true;
	}
	if(connectedToVoice){
		if(join && !bot){
			thingToSay += `${newMember.user.username} has joined`;
			if(newMember.voiceChannel.guild != connection.channel.guild){ //if member join different server
				thingToSay += ` ${newMember.voiceChannel.guild.name}`;
			}
			else if(newMember.voiceChannel != connection.channel){ //if member joined different channel
				thingToSay += ` ${newMember.voiceChannel.name}`;
			}
		}
		else if(leave){
			thingToSay += `${oldMember.user.username} has left`;
			if(oldMember.voiceChannel.guild != connection.channel.guild){
				thingToSay += ` ${oldMember.voiceChannel.guild.name}`;
			}
			else if(oldMember.voiceChannel != connection.channel){
				thingToSay += ` ${oldMember.voiceChannel.name}`;
			}
		}
		else if(move && !bot){
			thingToSay += `${newMember.user.username} has moved to ${newMember.voiceChannel.name}`;
		}
	}
	else{
		if(join){
			thingToSay += `${newMember.user.username} has joined ${newMember.voiceChannel.guild.name}`;
		}
		else if(leave){
			thingToSay += `${oldMember.user.username} has left ${oldMember.voiceChannel.guild.name}`;
		}
		else if(move){
			thingToSay += `${newMember.user.username} moved to ${newMember.voiceChannel.name}`;
		}
	}
	return thingToSay;
}

function chrisPromiseRejection(message){
	message = message.toLowerCase();
	var noPunctuation = message.replace(/[.,\/#!$%\^&\*;:{}=\-_`'"~()]/g,"");
	message = noPunctuation.split(' ');
	if(message.includes("ill") && message.includes("on")){
		return true;
	}
	else{
		return false;
	}
}

function parseMessage(message){
	message.content = message.content.toLowerCase();
	if(message.content.replace(/[.,\\/#!?$%\^&\*;:{}=\-_`'"~()]/g,"") == "what"){
		message.channel.send("Fuck knows ¯\\_(ツ)_/¯");
	}
	if(message.content.indexOf("be") > -1 && message.content.indexOf("soon") > -1){
		message.reply("\"soon\" :thinking:");
	}
	else if(message.content.indexOf("soon") > -1){
		message.reply("soon(tm)");
	}
}

var options = [];
var numToEmoji = [":zero:", ":one:", ":two:", ":three:", ":four:", ":five:", ":six:", ":seven:", ":eight:", ":nine:"];
var pollMessage = "";
var pollAuthor;
var poll;

function pollFunction(message){
	poll = message.content.replace("!poll ", "").split('\n');
	var question = poll[0];
	options = [];
	var newMessage = 'React with the emoji of the option you choose!\n```' + question + "```\n";
	if(poll.length > 11){
		message.reply('Error: too many options! You can use a maximum of 10!');
	}
	else{
		var pollReactions;
		for(var i = 0; i < poll.length-1; i++){
			options[i.toString() + "%E2%83%A3"] = 0;
			newMessage += numToEmoji[i] + '`: ' + poll[i+1] + "`\n";
		}
		console.log('Created poll:\n' + newMessage);
		message.channel.send(newMessage).then(newPollMessage => {
			pollMessage = newPollMessage;
		});
	}
}

client.on('messageReactionAdd', (reaction, user) =>{
	console.log('reaction added!');
	console.log(reaction.emoji.identifier);
	if(reaction.message.content = pollMessage){
		options[reaction.emoji.identifier] += 1;
	}
});

client.on('messageReactionRemove', (reaction, user) =>{
	console.log('reaction added!');
	console.log(reaction.emoji.identifier);
	if(reaction.message.content = pollMessage){
		options[reaction.emoji.identifier] -= 1;
	}
});

client.on('message', function(message){
	if(message.author.username != "DinkBot"){
		parseMessage(message);
	}
	if(usersToShutup.includes(message.author.id)){
		message.delete();
		return;
	}
	if(message.content.toLowerCase().includes("owo") && !message.author.bot){
		if (message.content.toLowerCase().substring(0, 1) != '!'){
			message.channel.send("*notices your OwO* What's this?");
		}
	}
	if(message.content.toLowerCase() == "hmm"){
		message.channel.send({
			files: ['https://media.giphy.com/media/xUPGcz2H1TXdCz4suY/giphy.gif']
		}).catch(console.error);
	}
	if(message.channel == stockMarket){
		message.delete(600000).catch(console.error);
	}
	if(message.channel.type != "dm"){
		if(message.member.roles.find("name", "Chris") != undefined){
			if(chrisPromiseRejection(message.content)){
				message.channel.send({
					files: ['http://i0.kym-cdn.com/entries/icons/mobile/000/014/859/BS.jpg']
				}).catch(console.error);
			}
		}
	}
	if(message.content.toLowerCase().substring(0, 1) == '!'){
        var args = message.content.toLowerCase().substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);

        switch(cmd){
			case 'poll':
				if(pollMessage == ""){
					pollAuthor = message.author.username;
					pollFunction(message);
				}
				else{
					message.channel.send("There's already an active poll!");
				}
			break;

			case 'endpoll':
				console.log('end poll');
				if(message.author.username == pollAuthor){
					console.log('ending poll');
					newMessage = "The poll has ended and the results are in!\n```" + poll[0] + "```\n";
					for(var i = 0; i < poll.length-1; i++){
						newMessage += numToEmoji[i] + "`: " + poll[i+1] + " has: " + options[i.toString() + "%E2%83%A3"] + " votes!`\n";
					}
					message.channel.send(newMessage);
					pollMessage = "";
				}
			break;

			case 'say':
				//say something in voice chat if connectedToVoice
				if(connectedToVoice){
					var thingToSay = "";
					if(message.author.username != "Dinkie Shy" && message.author.username != "Trigati"){
						thingToSay = message.author.username + " says... ";
					}
					for(var i = 0; i < args.length; i++){
						thingToSay += args[i].replace(/(\r\n\t|\n|\r\t)/gm,". ") + " ";
					}
					ps.addCommand('cd \"' + __dirname + '\"');
					ps.addCommand('./scripts/voice.ps1 \"' + thingToSay + '\"');
					ps.invoke().then(output => {
						if(!dispatcher.speaking){
							dispatcher = connection.playFile(getDirectory("/scripts/output.wav"));
						}
						else{
							dispatcher.stream.on('end', function(){
								dispatcher = connection.playFile(getDirectory("/scripts/output.wav"));
							});
						}
					}).catch(err =>{
						console.log(err);
						ps.dispose();
					});
				}
				else{
					message.channel.send("I'm not in a voice chat, " + message.author.username);
				}
			break;

			case 'sh':
				if(dispatcher != undefined){
					dispatcher.end();
				}
			break;

			case 'chris':
				chrisIsLate = true;
			break;

			case 'shutup':
				if(message.author.username == 'Dinkie Shy'){
					if(message.isMemberMentioned){
						usersToShutup = message.mentions.users.keyArray();
						for(var i = 0; i < usersToShutup.length; i++){
							console.log(usersToShutup);
						}
					}
				}
			break;

			case 'changerole':
				if(message.content.split(' ')[1]){
					//Check if the bot is allowed to use the requested role
					console.log(message.content.split(' ')[1]);
					var requestedRole = message.guild.roles.filter(g=>g.name == message.content.split(' ')[1]);
					var guildRolesKeyArray = message.guild.roles.keyArray();
					if(requestedRole.keyArray().length == 0){
						message.reply("That role either doesn't exist or I'm not allowed to assign it. The accepted roles are: " + acceptedRoleNames);
						return;
					}
					//Check if the user already has the requested role
					var rolesAlreadyOwned = message.member.roles;
					for(var i = 0; i < rolesAlreadyOwned.keyArray().length; i++){
						console.log(rolesAlreadyOwned.get(rolesAlreadyOwned.keyArray()[i]).name + ": " + requestedRole.get(requestedRole.keyArray()[0]).name);
						if(rolesAlreadyOwned.keyArray()[i] == requestedRole.keyArray()[0]){
							message.reply("you already have that role!");
							return;
						}
					}
					//remove the current role and assign the requested one
					for(var i = 0; i < guildRolesKeyArray.length; i++){
						if(acceptedRoleNames.includes(message.guild.roles.get(guildRolesKeyArray[i]).name) && rolesAlreadyOwned.keyArray().includes(guildRolesKeyArray[i]) && requestedRole.keyArray()[0] != guildRolesKeyArray[i]){
							message.member.removeRole(message.guild.roles.get(guildRolesKeyArray[i]));
						}
						else if(acceptedRoleNames.includes(message.guild.roles.get(guildRolesKeyArray[i]).name) && requestedRole.keyArray()[0] == guildRolesKeyArray[i]){
							message.member.addRole(message.guild.roles.get(guildRolesKeyArray[i]));
						}
					}

					message.reply('enjoy your new role!');
				}
				else{
					message.channel.send("The available roles are: " + acceptedRoleNames);
				}
			break;

			case 'nudge':
				if(message.isMemberMentioned){
					console.log('Nudge');
					var userIDs = message.mentions.users.keyArray();
					for(var i = 0; i < userIDs.length; i++){
						message.mentions.users.get(userIDs[i]).send(`${message.author} wants your attention in ${message.channel}!`);
					}
				}
				else{
					message.channel.send('You need to tag someone!');
				}
			break;

			case 'shutdown':
				if(message.author.username == "Dinkie Shy"){
					message.channel.send("Shutting down");
					console.log("Shutting down");
					if(connectedToVoice){
						dispatcher = connection.playFile(getDirectory("/shutdown.mp3"));
						dispatcher.setVolume(0.5);
						dispatcher.on('end', function(){
							client.destroy();
							process.exit();
						});
					}
					else{
						setTimeout(function(){client.destroy(); process.exit()}, 4000);
					}
				}
				else{
					message.channel.send("Only Dinkie can do that!");
				}
			break;

            case 'ping':
                message.channel.send('Pong!');
            break;

			case 'pong':
				message.channel.send('Ping!');
			break;

			case 'roll':
				var input = message.content.toLowerCase().slice(6, message.content.length);
				input = input.split(')');
				console.log(input[0]);
				if(input[0][0] == '('){
					roll = re.exec(input[0]);
				}
				else{
					var roll = re.exec(message.content.toLowerCase().slice(6, message.content.toLowerCase().length));
				}
				if (roll != null){
					var rolls = rollDie(parseInt(roll[1]), parseInt(roll[2]), roll[3]);
					if(input[1]){
						input[1] = parseInt(input[1]);
						rolls[1] += input[1];
						var toSend = message.author + " rolled: " + rolls[0].toString() + "+" + input[1] + "=" + rolls[1].toString();
					}
					else{
						var toSend = message.author + " rolled: " + rolls[0].toString() + "=" + rolls[1].toString();
					}
					message.channel.send(toSend.toString());
				}
				else{
					message.channel.send('Invalid formula!');
				}
			break;

			case 'dinkbothelp':
				message.channel.send("Commands:\n!DinkbotHelp - display this menu\n!bf [insert brainfuck here]  interprets brainfuck! Try converting a string here: https://copy.sh/brainfuck/text.html !\n!roll xdy - roll x amount of y sided die\n!Ping - Pong!\n!Pong - Ping!\n!nudge @user - Sends the tagged user(s) a ping in dm, in case they muted the channel\n!changerole [role] - Change your role! enter !changerole to find out what roles you can swap around");
			break;

			case 'bf':
				result = '';
				code = message.content.toLowerCase().slice(4, message.content.toLowerCase().length);
				console.log('code: ' + code);
				var script = execFile(__dirname  + '/scripts/BFInterpreter.exe', [code]);
				script.stdout.on('data', function(data, err){
					if(err){
						console.log('data in err: ' + err);
					}
					if(data != undefined){
						result += data.toString();
						console.log(('result so far: ' + result));
						console.log(('data in: ' + data));
					}
				});
				script.on('close', function(err){
					if(err){
						console.log(('data out err: ' + err));
					}
					console.log(('result: ' + typeof result + " " + result));
					console.log('ready to output');
					message.channel.send(result);
				});
			break;

			case 'echo':
				if(message.author.username == "Dinkie Shy"){
					newMessage = message.content.slice(6, message.content.length);
					message.channel.send(newMessage);
					message.delete();
				}
				else{
					message.reply("only Dinkie can do that!");
				}
			break;

			case 'printstocks':
				printStocks();
			break;

			case 'leaderboard':
				printLeaderboard();
			break;

			case 'buystocks':
				if(args[1] < 0 || args[1] >= Object.keys(stocks).length || args[1] != Math.floor(parseInt(args[1])).toString() || parseInt(args[0]) < 0 || args[0] != Math.floor(parseInt(args[0])).toString()){
					message.reply("Error, correct usage: !buystocks followed by the amount you want to purchase, followed by the number next to the stock you want to buy");
				}
				else{
					buyStocks(message.author, args[1], args[0]);
				}
			break;

			case 'mystocks':
				myStocks(message.author);
			break;

			case 'sellstocks':
				if(args[1] < 0 || args[1] >= Object.keys(stocks).length || args[1] != Math.floor(parseInt(args[1])).toString() || parseInt(args[0]) < 0 || args[0] != Math.floor(parseInt(args[0])).toString()){
					message.reply("Error, correct usage: !sellstocks followed by the amount you want to sell, followed by the number next to the stock you want to sell");
				}
				else{
					sellStocks(message.author, args[1], args[0]);
				}
			break;

			case 'stockshelp':
				message.channel.send(
					"!printstocks - Display a list of items available to purchase and their current values\n!leaderboard - Display the leaderboard\n!buystocks [x] [y] - Purchase [x] amount of item [y]\n!sellstocks [x] [y] - Sell [x] amount of item [y]\n!mystocks - Display a list of the stock you currently own along with the total sell values\n!stockshelp - Display this menu\n\nEvery few minutes, the values of each item randomly increase or decrease. Your goal is to buy at the lowest value and sell at the highest, to earn the most points and reach the top of the leaderboard. Every now and then, a special event will occur in which the value of an item will double for a short time. Be sure to sell quickly if you\'ve invested, as these are rare!");
			break;

			case 'reloadstocks':
				if(message.author.username == "Dinkie Shy"){
					players = JSON.parse(fs.readFileSync(getDirectory("/gameStorage/players.json")));
					stocks = JSON.parse(fs.readFileSync(getDirectory("/gameStorage/stocks.json")));
					message.channel.send("Stocks game reloaded");
				}
				else{
					message.reply("Only Dinkie can use that command!");
				}
			break;
         }
     }
});

var players = {};
var stocks = {};

if(fs.existsSync(getDirectory("/gameStorage"))){
	players = JSON.parse(fs.readFileSync(getDirectory("/gameStorage/players.json")));
	stocks = JSON.parse(fs.readFileSync(getDirectory("/gameStorage/stocks.json")));
}
else{
	fs.mkdirSync(getDirectory("/gameStorage"));
}

var updatePeriod = 300000; //normally 5 minutes, measured in milliseconds(300000)
setInterval(updateStocks, updatePeriod);
var doubleEvent = false;
var itemToDouble;
var currency = "dic";

function printStocks(){
	var toSend = "";
	for(var i = 0; i < Object.keys(stocks).length; i++){
		toSend += `\`\`\`[${i}] ` + stocks[i.toString()].name + " are now worth " + stocks[i.toString()].value + " " + currency + " each." + "\nThere are " + stocks[i.toString()].amount + " left!```";
	}
	toSend += "\nTo buy stocks, type !buystocks followed the the number next to the stock you want to buy, followed by the amount you want to purchase";
	stockMarket.send(`${toSend}`);
}

function saveStocks(){
	fs.writeFile(getDirectory("/gameStorage/players.json"), JSON.stringify(players), function(err){
		if(err){
			console.log(err);
		}
	});
	fs.writeFile(getDirectory("/gameStorage/stocks.json"), JSON.stringify(stocks), function(err){
		if(err){
			console.log(err);
		}
	});
}

function printLeaderboard(){
	var toSend = "";
	var playerList = Object.keys(players).map(function(key){
		if(stockMarket.guild.members.get(key).nickname != undefined){
			return [stockMarket.guild.members.get(key).nickname, players[key].score];
		}
		else{
			return [stockMarket.guild.members.get(key).user.username, players[key].score];
		}
	});
	playerList.sort(function(first, second){
		return second[1]-first[1];
	});
	for(var i = 0; i < Object.keys(players).length; i++){
		toSend += "\`\`\`" + playerList[i][0] + " --- " + Math.round(playerList[i][1]*100)/100 + "\`\`\`";
	}
	stockMarket.send(toSend);
}

function resetDoubledStock(){
	stocks[itemToDouble.toString()].value = stocks[itemToDouble.toString()].value/2;
	stockMarket.send(`The value of ${stocks[itemToDouble.toString()].name} has returned to normal`);
}

function myStocks(user){
	if(players[user.id] == undefined){
		players[user.id] = {"stocks":{}, "score":20, "totalStocks":0};
	}
	var toSend = `You have ${Math.round((players[user.id].score)*100)/100} ${currency}\nYou have ${players[user.id].totalStocks}/50 stocks in your warehouse!\n`;
	for(var i = 0; i < Object.keys(stocks).length; i++){
		if(Object.keys(players[user.id].stocks).includes(i.toString())){
			if(players[user.id].stocks[i.toString()].quantity != 0){
				toSend += "```"+ players[user.id].stocks[i.toString()].quantity + " " + stocks[i.toString()].name + ", currently worth: " + Math.round((players[user.id].stocks[i.toString()].quantity*stocks[i.toString()].value)*100)/100 + " " + currency + ". ";
				var profit = Math.round(((players[user.id].stocks[i.toString()].quantity*stocks[i.toString()].value - players[user.id].stocks[i.toString()].quantity*players[user.id].stocks[i.toString()].averageValue)/players[user.id].stocks[i.toString()].quantity)*100)/100;
				if(profit > 0){
					toSend += `These make you a profit of ${profit} each!\`\`\`\n`;
				}
				else if(profit == 0){
					toSend += `These don't make you any profit at this time!\`\`\`\n`;
				}
				else{
					profit *= (-1);
					toSend += `These make you a loss of ${profit} each!\`\`\`\n`;
				}
			}
		}
	}
	stockMarket.send(toSend);
}

function sellStocks(user, stockName, quantity){
	if(players[user.id] == undefined){
		players[user.id] = {"stocks":{}, "score":20, "totalStocks":0};
	}
	var stockToAdd = stocks[stockName];
	if(players[user.id].stocks[stockName].quantity >= quantity){
		players[user.id].stocks[stockName].quantity -= parseInt(quantity);
		players[user.id].score += Math.round((stocks[stockName].value*parseInt(quantity))*100)/100;
		stocks[stockName].amount += parseInt(quantity);
		players[user.id].totalStocks -= parseInt(quantity);
		stockMarket.send(`${user.username} just sold ${quantity} ${stocks[stockName].name} for ${Math.round((stocks[stockName].value*parseInt(quantity))*100)/100}`);
		myStocks(user);
	}
	else{
		stockMarket.send(`${user.username}, you don't have that many to sell!`);
	}
	saveStocks();
}

function buyStocks(user, stockName, quantity){
	if(players[user.id] == undefined){
		players[user.id] = {"stocks":{}, "score":20, "totalStocks":0};
	}
	var stockToAdd = stocks[stockName];
	var added = false;
	if(players[user.id].totalStocks + parseInt(quantity) <= 50){
		if(stocks[stockName].amount >= parseInt(quantity)){
			if(players[user.id].score >= stockToAdd.value*quantity){
				if(players[user.id].stocks[stockName] == undefined){
					players[user.id].stocks[stockName]={"quantity":0,"averageValue":0};
				}
				players[user.id].stocks[stockName].averageValue = players[user.id].stocks[stockName].averageValue*players[user.id].stocks[stockName].quantity + quantity*stockToAdd.value;
				players[user.id].stocks[stockName].quantity += parseInt(quantity);
				players[user.id].stocks[stockName].averageValue = players[user.id].stocks[stockName].averageValue/players[user.id].stocks[stockName].quantity;
				players[user.id].score -= stockToAdd.value*parseInt(quantity);
				stocks[stockName].amount -= parseInt(quantity);
				players[user.id].totalStocks += parseInt(quantity);
				stockMarket.send(`${user.username} just bought ${quantity} ${stockToAdd.name}`);
				saveStocks();
				myStocks(user);
			}
			else{
				stockMarket.send(`${user.username}, you can't afford that!`);
			}
		}
		else{
			stockMarket.send(`${user.username}, there aren't enough ${stocks[stockName].name} left to buy!`);
		}
	}
	else{
		if(players[user.id].totalStocks == 50){
			stockMarket.send(`${user.username}, you can't fit any more stocks in your warehouse!`);
		}
		else{
			stockMarket.send(`${user.username}, you can't fit that many more stocks in your warehouse!`);
		}
	}
}

function updateStocks(){
	console.log("\nUpdating stocks");
	if(!doubleEvent){
		if(Math.random() >= 0.8){//20% chance to double the price of something next time the stocks update
			itemToDouble = Math.floor(Math.random()*Object.keys(stocks).length);
			stockMarket.send(`The value of ${stocks[itemToDouble.toString()].name} might double soon!`);
			doubleEvent = true;
		}
	}
	else{
		doubleEvent = false;
		if(Math.random() >= 0.6){//40% chance for the price to actually double
			stocks[itemToDouble.toString()].value *= 2;
			stockMarket.send(`The value of ${stocks[itemToDouble.toString()].name} has doubled for 2 minutes!`);
			setTimeout(resetDoubledStock, 120000);
		}
		else if(Math.random() >= 0.9){ //10% chance of crashing
			stockMarket.send(`Oh no! The value of ${stocks[itemToDouble.toString()].name} has crashed instead! It's value is halved!!`);
			stocks[itemToDouble.toString()].value = parseInt(stocks[itemToDouble.toString()].value/2).toFixed(2);
		}
		else{
			stockMarket.send(`The value of ${stocks[itemToDouble.toString()].name} didn't double, maybe next time!`);
		}
	}
	for(var i = 0; i < Object.keys(stocks).length; i++){
		if(i != 9){
			var oldValue = stocks[i.toString()].value;
			if(oldValue > 50){
				stocks[i.toString()].value = Math.round((((Math.random()*0.5)+0.5)*stocks[i.toString()].value)*100)/100;
			} else if(oldValue < 5){
				stocks[i.toString()].value = Math.round((((Math.random()*0.5)+1)*stocks[i.toString()].value)*100)/100;
			} else{
				stocks[i.toString()].value = Math.round((((Math.random()*0.5)+0.75)*stocks[i.toString()].value)*100)/100;
			}
			console.log(`${stocks[i].name} value changed from ${oldValue} to ${stocks[i].value}`);
		}
	}
	console.log("Finished updating stocks");
	fs.writeFile(getDirectory("/gameStorage/stocks.json"), JSON.stringify(stocks), function(err){
		if(err){
			console.log(err);
		}
		stockMarket.send({
			files:[{
				attachment: getDirectory("/newUpdateBanner.png"),
				name: "newUpdateBanner.png"
			}]
		}).then(() => {
			printStocks()
		});
	});
}

function getDirectory(filename){
	var directory = __dirname;
	for(var i = 0; i < directory.length; i++){
		if(directory[i] == '\\'){
			directory = directory.replace('\\', '/');
		}
	}
	return directory + filename;
}

function rollDie(numberOfDice, numberOfSides, modifier){
	var toSend = "";
	var total = 0;
	if (modifier == ""){
		modifier = 0;
	}
	else{
		modifier = parseInt(modifier);
	}
	if (numberOfDice > 1){
		toSend = [];
		for (var i = 0; i < numberOfDice; i++){
			var nextroll = 1+Math.round(Math.random()*(numberOfSides-1));
			total += nextroll + modifier;
			toSend.push("[" + (nextroll).toString()+ (modifier == 0 ? "": "+" + modifier.toString()) + "]");
		}
	}
	else{
		var nextroll = 1+Math.round(Math.random()*(numberOfSides-1))
		total += nextroll + modifier;
		toSend = "[" + nextroll.toString() + (modifier == 0 ? "": "+" + modifier.toString()) + "]";
	}
	return [toSend, total];
}

client.on('error', function(error){
	console.log(error);
	loggedIn = false;
	while(!loggedIn){
		try{
			client.login(authToken);
		}
		finally{
			if(loggedIn){
				console.log('Reconnected');
			}
			else{
				console.log('Reconnect failed');
			}
		}
	}
	client.destroy();
	process.exit();
});
