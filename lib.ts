import CryptoJS from "crypto-js";
import { config as dotenv } from "dotenv";

import { API } from "./types";

dotenv();

const ENDPOINT = "http://router.miwifi.com/cgi-bin/luci";

/**
 * 获取网页首页数据，提取当前路由器对应的key和deviceID
 * @return 提取到的key和deviceID
 */
async function retrieveKeyDeviceID() {
  const HTML = await fetch(`${ENDPOINT}/web`, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  }).then(async (res) => await res.text());

  const key = (/key: '([a-z0-9]+?)',/.exec(HTML) ?? ["", ""])[1];
  const deviceID =
    (/var deviceId = '([0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2}:[0-9a-f]{2})';/.exec(
      HTML
    ) ?? ["", ""])[1];

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
export async function getStok() {
  const { key, deviceID } = await retrieveKeyDeviceID();
  const nonce = createNonce(deviceID);

  const params = new URLSearchParams();
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  } satisfies HeadersInit;

  params.append("username", "admin");
  params.append("logtype", "2");
  params.append("nonce", nonce);
  params.append(
    "password",
    CryptoJS.SHA1(
      nonce + CryptoJS.SHA1(process.env.PSWD + key).toString()
    ).toString()
  );

  const response = await fetch(`${ENDPOINT}/api/xqsystem/login`, {
    headers,
    method: "POST",
    body: params.toString(),
  }).then(async (res) => await res.json());

  return { token: response.token, mac: deviceID };
}

/**
 * 获取当前网络状况
 * @param stok 登录获取的token
 * @return 当前网络连接情况的状态码，2表示正常连接，1表示没有外网连接
 */
export async function getStatus(stok: string): Promise<API.Auth["code"]> {
  const response = await fetch(
    `${ENDPOINT}/;stok=${stok}/api/xqnetwork/pppoe_status`,
    { headers: { "Content-Type": "application/json" } }
  ).then(async (res) => await res.json());

  return response.status;
}

export async function whoIsDemolishingBandwidth(devices: Array<API.Device>) {
  return [];
}

export async function getDeviceList(stok: string, mac: string): Promise<Array<API.Device>> {
  return await fetch(`${ENDPOINT}/;stok=${stok}/api/misystem/devicelist`)
    .then(async (res) => await res.json())
    .then((data): Array<API.Device> => Boolean(process.env.INCLUDE_LOCAL_PAYLOADS) ? data.list.filter((device: API.Device): boolean => {
      return device.mac !== mac.toUpperCase()
    }) : data.list)
}

export function getECCD(devices: Array<API.Device>): API.Device[] {
  return devices.filter((device): boolean => device.type === API.ConnectionType.ECCD);
}

// HTTPParserError: Response does not match the HTTP/1.1 protocol (Invalid header token)
// either way this is going to throw an error because of undici strict checks,
// issue comes from parsing where header response isn't formatted as JSON
export async function getUploadSpeed(stok: string): Promise<API.Bandwidth> {
  return await fetch(`${ENDPOINT}/;stok=${stok}/api/misystem/bandwidth_test`, {
    signal: AbortSignal.timeout(15000),
  }).catch(err => {
    const lines = err.cause.data.split("\n") as string[];
    return JSON.parse(lines[lines.length - 1]);
  });
}
