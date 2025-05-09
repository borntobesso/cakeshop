declare module "ovh" {
  interface OVHConfig {
    appKey: string;
    appSecret: string;
    consumerKey: string;
  }

  class OVH {
    constructor(config: OVHConfig);
    requestPromised(method: string, path: string, data?: any): Promise<any>;
  }

  export default OVH;
}
