declare module "messagebird" {
  interface MessageBirdOptions {
    accessKey: string;
  }

  interface MessageCreateOptions {
    originator: string;
    recipients: string[];
    body: string;
  }

  interface MessageBirdResponse {
    id: string;
    href: string;
    direction: string;
    type: string;
    originator: string;
    body: string;
    reference: string;
    validity: number;
    gateway: number;
    typeDetails: Record<string, any>;
    datacoding: string;
    mclass: number;
    scheduledDatetime: string | null;
    createdDatetime: string;
    recipients: {
      totalCount: number;
      totalSentCount: number;
      totalDeliveredCount: number;
      totalDeliveryFailedCount: number;
      items: Array<{
        recipient: number;
        status: string;
        statusDatetime: string;
        messagePartCount: number;
      }>;
    };
  }

  interface MessageBirdError {
    errors: Array<{
      code: number;
      description: string;
      parameter: string | null;
    }>;
  }

  interface MessageBirdClient {
    messages: {
      create(
        options: MessageCreateOptions,
        callback: (
          error: MessageBirdError | null,
          response: MessageBirdResponse
        ) => void
      ): void;
    };
  }

  function initClient(accessKey: string): MessageBirdClient;
  export { initClient };
}
