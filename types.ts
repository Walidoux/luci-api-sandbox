/**
 *
 */
export namespace API {
  export interface Auth {
    /**
     * 重定向回调 URL
     */
    url: string;
    /**
     * 在调用应用程序端点时用于授权的承载器令牌
     */
    token: string;
    /**
     * 响应状态码
     */
    code: number;
  }

  /**
   *
   */
  export interface DeviceList {
    /**
     *
     */
    mac: string;
    /**
     *
     */
    list: Array<Device>;
  }

  export interface Status {
    status: number;
  }

  /**
   *
   */
  export interface Statistics {
    /**
     *
     */
    downspeed: string;
    /**
     *
     */
    online: string;
    /**
     *
     */
    upspeed: string;
  }

  /**
   *
   */
  export interface IP {
    /**
     *
     */
    downspeed: string;
    /**
     *
     */
    online: string;
    /**
     *
     */
    active: number
    /**
     *
     */;
    upspeed: string;
    /**
     *
     */
    ip: string;
  }

  /**
   *
   */
  export interface Device {
    /**
     *
     */
    mac: string;
    /**
     *
     */
    oname: string;
    /**
     *
     */
    isap: number;
    /**
     *
     */
    parent: string;
    /**
     *
     */
    authority: Record<"warn" | "pridisk" | "admin" | "lan", number>;
    /**
     *
     */
    push: number;
    /**
     *
     */
    online: number;
    /**
     *
     */
    name: string;
    /**
     *
     */
    times: number;
    /**
     *
     */
    ip: Array<IP>;
    /**
     *
     */
    statistics: Statistics;
    /**
     *
     */
    icon: string;
    /**
     *
     */
    type: number;
  }
}
