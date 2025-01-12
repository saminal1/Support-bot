import algoliasearch from "algoliasearch";
import { Message, MessageEmbed } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

export default class Docs extends Command {
  searchClient = algoliasearch(
    process.env.ALGOLIA_APP_ID,
    process.env.ALGOLIA_API_KEY
  );
  searchIndex = this.searchClient.initIndex("csmm");

  constructor(client: CommandoClient) {
    super(client, {
      name: "docs",
      aliases: ["search"],
      group: "support",
      memberName: "docs",
      description: "Searches the docs.",
    });
  }

  async run(message: CommandoMessage, args: string): Promise<Message> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await this.searchIndex.search(args, {
      hitsPerPage: 3,
    });

    const embed = new MessageEmbed();

    if (!res.hits || !res.hits.length) {
      return message.channel.send("Did not find any results :(");
    }

    for (const hit of res.hits) {
      const hierarchy = parseHierarchy(hit.hierarchy);
      const type = getType(hit.url);

      const friendlyText = `${type} - ${hierarchy[hierarchy.length - 1]}`;

      embed.addField(
        friendlyText,
        `[${type}/${hierarchy.join("/")}](${hit.url})`
      );
    }

    embed.setFooter(`Searched for "${args}"`);

    return message.channel.send(embed);
  }
}

function parseHierarchy(obj: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hasOwnProperty: (arg0: string) => any;
}) {
  const hierarchy = [];

  for (let i = 0; i < 7; i++) {
    const key = `lvl${i}`;
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const element = obj[key];
      if (element) {
        hierarchy.push(element);
      }
    }
  }
  return hierarchy;
}

function getType(url: string) {
  if (/docs.csmm.app\/en\/csmm/.test(url)) {
    return "CSMM";
  }

  if (/docs.csmm.app\/en\/cpm/.test(url)) {
    return "CPM";
  }

  if (/docs.csmm.app\/en\/7d2d/.test(url)) {
    return "7D2D";
  }

  return "CSMM";
}
