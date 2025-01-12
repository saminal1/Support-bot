import { Message, MessageEmbed } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

import getCommands from "../../commandsCache";
import { Tag as ITag, tags } from "../../tags";

export default class Tag extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "tag",
      aliases: ["tags"],
      group: "support",
      memberName: "tag",
      description: "Pastes a tag",
    });
  }

  async run(
    message: CommandoMessage,
    args: string
  ): Promise<Message | Message[]> {
    const tagToSend = await determineReply(args);

    if (!tagToSend) {
      const possibleTags = tags
        .filter((t) => t.code)
        .map((t) => `\`${t.code}\``)
        .sort(alphabeticalComparer)
        .join(", ");
      return message.reply(
        `No matching tag found for "${args}". Here's some tags that you can use instead: ${possibleTags}`
      );
    }

    const embed = new MessageEmbed();

    embed.setDescription(tagToSend.response);

    return message.channel.send(embed);
  }
}

async function determineReply(textToSearch): Promise<ITag> {
  const tagToSend = tags
    .filter((t) => t.code)
    .find((t) => t.code.toLowerCase() === textToSearch.toLowerCase());

  if (tagToSend) {
    return tagToSend;
  }

  // If no tags were found, we try to match with a command
  const commands = await getCommands();

  const commandToSend = commands.find((c) => {
    return (
      c.name.toLowerCase() === textToSearch.toLowerCase() ||
      c.aliases.find((a) => a.toLowerCase() === textToSearch.toLowerCase())
    );
  });

  if (commandToSend) {
    const data: ITag = {
      response: `
            ${commandToSend.name}

            ${commandToSend.description}

            ${commandToSend.extendedDescription}`,
      code: "",
    };

    return data;
  }

  // Found nothing 😭
  return null;
}

function alphabeticalComparer(a: string, b: string): number {
  if (a > b) {
    return 1;
  }
  if (b > a) {
    return -1;
  }
  return 0;
}
