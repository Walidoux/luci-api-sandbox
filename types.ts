import type { LinkType } from "pcap";

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
  export type Bandwidth = Record<'bandwidth2' | 'code' | 'upload' | 'download' | 'bandwidth', number>

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
    icon: string;
    type: ConnectionType;
    statistics: Statistics;
  }

  /**
   * Ethernet Cable Connected Devices = 0
   * Connected devices (2.4G) = 1
   * Connected devices (5G) = 2
   */
  export enum ConnectionType {
    ECCD = 0,
    CD24G = 1,
    CD5G = 2,
  }
}

export namespace PCAP {
  export interface Packet {
    link_type: LinkType // format of data link layer but we are interested only in LINKTYPE_ETHERNET type since we are targetting a wireless network in a local area (LAN)
    pcap_header: Header
    payload: EthernetPacket
    emitter: undefined
  }

  export interface EthernetAddr {
    addr: Array<string>
  }

  export interface IPFlags {
    emitter: undefined
    reserved: false
    doNotFragment: boolean
    moreFragments: boolean
  }

  export interface TCPFlags {
    emitter: undefined
    nonce: boolean
    cwr: boolean
    ece: boolean
    urg: boolean
    ack: boolean
    psh: boolean
    rst: boolean
    syn: boolean
    fin: boolean
  }

  export enum ProtocolType {
    UDP = 17, // User Datagram Protocol (0x11)
    MTP = 92, // Multicast Transport Protocol (0x5C)
    TCP = 6, // Transmission Control Protocol (0x06)
    IGMP = 2,
  }

  export interface IPv4 {
    emitter: undefined
    version: 4
    headerLength: number // 20
    diffserv: number // 0 QoS ?
    length: number // 72
    identification: number // 20162
    flags: IPFlags
    fragmentOffset: number // 0
    ttl: number // time before router rejects packet while it's cached
    protocol: ProtocolType
    headerChecksum: number
    saddr: IPv4Addr
    daddr: IPv4Addr
    protocolName: undefined // 'Unknown' most likely gonna be removed if undefined is always returned
    payload: UDP | TCP
  }

  export interface IPv6 {
    version: 6
    emitter: undefined
    trafficClass: number // 0
    flowLabel: number // 10713
    payloadLength: number // 8
    nextHeader: number // 58
    hopLimit: number // 255
    saddr: IPv6Addr
    daddr: IPv6Addr
    payload: HeaderExtension
  }

  export interface HeaderExtension {
    payload: undefined
    nextHeader: number // 58
    headerLength: number // 8
    protocolName: string // 'Unknown'
  }

  export interface IPv6Addr {
    addr: Array<string>
  }

  export interface Arp {
    emitter: undefined
    htype: number // 1
    ptype: number // 2048
    hlen: number // 6
    plen: number // 4
    operation: number // 1 or 2
    sender_ha: EthernetAddr
    sender_pa: IPv4Addr
    target_ha: EthernetAddr
    target_pa: IPv4Addr
  }

  export interface IPv4Addr {
    addr: Array<string>
  }

  export interface TCPOptions {
    mss: null
    window_scale: null
    sack_ok: null
    sack: null
    timestamp: number // 1467016572
    echo: number // 4079126901
  }

  export interface TCP {
    emitter: undefined
    sport: number // 55298
    dport: number // 443
    seqno: number // 3419667738
    ackno: number // 1450612807
    headerLength: number // 32
    reserved: undefined
    flags: TCPFlags
    windowSize: number // 13622
    checksum: number // 1395
    urgentPointer: number // 0
    options: TCPOptions
    data?: Buffer
    dataLength: number
  }

  export enum Port {
    mDNS = 5353,
    DNS = 53,
    HTTP = 80,
    HTTPS = 443,
    SDDP = 1900,
  }

  export interface UDP {
    sport: Port
    dport: number // 42946
    checksum: number
    length: number
    data: Buffer
    emitter: undefined
  }

  export enum EtherType {
    IPv4 = 2048, // 0x0800
    IPv6 = 34525, // 0x86DD
    ARP = 2054, // 0x0806
  }

  export type EthernetPacket =
    | {
      ethertype: EtherType.IPv4
      payload: IPv4
    }
    | {
      ethertype: EtherType.IPv6
      payload: IPv6
    }
    | {
      ethertype: EtherType.ARP
      payload: Arp
    } & {
      dhost: EthernetAddr
      shost: EthernetAddr
      emitter: undefined
      vlan: null
    }

  export interface Header {
    tv_sec: number,
    tv_usec: number,
    caplen: number,
    len: number
  }
}
