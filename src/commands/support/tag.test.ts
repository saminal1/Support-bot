import { CommandoClient, CommandoMessage } from "discord.js-commando";

import Tag from "./tag";

let channelSendSpy = jest.fn();
let replySpy = jest.fn();

describe("COMMAND tag", function () {
  beforeEach(() => {
    channelSendSpy = jest.fn();
    replySpy = jest.fn();
  });

  it("Replies to the text", async function () {
    const mockMsg = {
      channel: { send: channelSendSpy },
      reply: replySpy,
    } as unknown as CommandoMessage;
    const command = new Tag({} as CommandoClient);
    await command.run(mockMsg, "test");
    let call = channelSendSpy.mock.calls[0][0];

    expect(channelSendSpy).toBeCalledTimes(1);
    expect(call.description).toBe("Hello! This test is successful");

    await command.run(mockMsg, "doesnt exist");
    // Should not have sent a tag reply
    expect(channelSendSpy).toBeCalledTimes(1);
    expect(replySpy).toBeCalledTimes(1);

    call = replySpy.mock.calls[0][0];

    expect(call).toMatch(
      /No matching tag found for "doesnt exist". Here's some tags that you can use instead:/
    );
  });

  it("Tries to match with a command if no tags were found", async () => {
    const mockMsg = {
      channel: { send: channelSendSpy },
      reply: replySpy,
    } as unknown as CommandoMessage;
    const command = new Tag({} as CommandoClient);
    await command.run(mockMsg, "calladmin");

    expect(channelSendSpy).toBeCalledTimes(1);
    const call = channelSendSpy.mock.calls[0][0];
    expect(call.description).toBe(`
            calladmin

            Make a support ticket

            Creates a support ticket on the website and notifies admins of your call for help`);
  });

  it("Tries to match with a command if no tags were found, with aliases", async () => {
    const mockMsg = {
      channel: { send: channelSendSpy },
      reply: replySpy,
    } as unknown as CommandoMessage;
    const command = new Tag({} as CommandoClient);
    await command.run(mockMsg, "admin");

    expect(channelSendSpy).toBeCalledTimes(1);
    const call = channelSendSpy.mock.calls[0][0];
    expect(call.description).toBe(`
            calladmin

            Make a support ticket

            Creates a support ticket on the website and notifies admins of your call for help`);
  });
});
