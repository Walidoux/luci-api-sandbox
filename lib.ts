import { SHA1 } from "crypto-js";
import { config as dotenv } from "dotenv";

import { API } from "./types";

dotenv();

const ROUTER_KEY_PATTERN = /key: '([a-z0-9]+?)',/;
const MAC_ADDRESS_PATTERN =
  /var deviceId = '([0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2})';/;

/**
 * 获取网页首页数据，提取当前路由器对应的key和deviceID
 * @return 提取到的key和deviceID
 */
async function getKeyDeviceID() {
  const body: string = await (
    await fetch(`http://${process.env.ROUTER_ADDRESS}/cgi-bin/luci/web`)
  ).text();

  const key = (ROUTER_KEY_PATTERN.exec(body) ?? ["", ""])[1];
  const deviceID = (MAC_ADDRESS_PATTERN.exec(body) ?? ["", ""])[1];

  return { key, deviceID };
}

/**
 * 生成登录所需的nonce参数
 * @param deviceID 设备ID，由网页端返回
 * @return 生成的nonce值
 */
function createNonce(deviceID: string): string {
  const type = 0;
  const time = Math.floor(new Date().getTime() / 1000);
  const random = Math.floor(Math.random() * 10000);
  return [type, deviceID, time, random].join("_");
}

/**
 * 模拟登录
 * @return 登录后获取的Token
 */
async function getStok(): Promise<API.Auth["token"]> {
  const { key, deviceID } = await getKeyDeviceID();
  const nonce = createNonce(deviceID);
  
  const params = new URLSearchParams();
  const headers: HeadersInit = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  };

  params.append("username", "admin");
  params.append("logtype", "2");
  params.append("nonce", nonce);
  params.append(
    "password",
    SHA1(nonce + SHA1(process.env.WIFI_PASSWORD + key).toString()).toString()
  );

  const response = await fetch(
    `http://${process.env.ROUTER_ADDRESS}/cgi-bin/luci/api/xqsystem/login`,
    {
      headers,
      method: "POST",
      signal: AbortSignal.timeout(5000),
      body: params.toString(),
    }
  );

  const data = await response.json() as API.Auth;

  return data.token;
}

/**
 * 获取当前网络状况
 * @param stok 登录获取的token
 * @return 当前网络连接情况的状态码，2表示正常连接，1表示没有外网连接
 */
export async function getStatus(stok: string): Promise<API.Auth["code"]> {
  const response = await fetch(
    `http://${process.env.ROUTER_ADDRESS}/cgi-bin/luci/;stok=${stok}/api/xqnetwork/pppoe_status`,
    { headers: { "Content-Type": "application/json" } }
  );

  const data = (await response.json()) as API.Status;

  return data.status;
}

/**
 *
 * @param stok
 * @returns
 */
export async function getDeviceList(stok: string): Promise<API.DeviceList> {
  const response = await fetch(
    `http://${process.env.ROUTER_ADDRESS}/cgi-bin/luci/;stok=${stok}/api/misystem/devicelist`
  );

  return await response.json();
}

/**
 * @returns
 */
export async function 打击锤(): Promise<void> {}
