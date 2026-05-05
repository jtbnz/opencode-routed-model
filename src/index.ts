import type { Plugin } from "@opencode-ai/plugin"

export const ShowRoutedModel: Plugin = async ({ client }) => {
  return {
    event: async ({ event }) => {
      if (event.type === "message.updated") {
        const msg = event.properties
        if (msg.role === "assistant" && msg.model) {
          await client.tui.showToast({
            body: {
              message: `Router selected: ${msg.model}`,
              variant: "info",
            },
          })
        }
      }
    },
  }
}
