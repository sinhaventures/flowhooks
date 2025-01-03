export function run(input) {
  return {
    type: "object",
    data: input.data
  };
}

export const handle = "send-to-webhook";
export const title = "Send to Webhook";
export const description = "Sends event data to a configured webhook URL";

export const schema = {
  type: "object",
  required: ["data"],
  properties: {
    data: {
      type: "object",
      title: "Event Data",
      description: "The data to send to the webhook"
    }
  }
};
