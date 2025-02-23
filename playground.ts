import { getDeviceList, getECCD, getStok } from "lib";
import pcap from "pcap"
import { PCAP } from "types";

const { token, mac } = await getStok();
const devices = await getDeviceList(token, mac);
console.log(devices)
// console.log(getECCD(devices))

const session = pcap.createSession(process.env.NETWORK_INTERFACE, { promiscuous: true });
session.on('packet', (raw): void => {
    const packet: PCAP.Packet = pcap.decode.packet(raw);

    try {
        const { ethertype, payload, shost, dhost } = packet.payload;

        // const targets = devices.filter((dev): boolean => dev.mac === shost.toString().toUpperCase() || dev.mac === dhost.toString().toUpperCase())
        // if (targets.length === 0) return

        switch (ethertype) {
            case PCAP.EtherType.IPv4:
                // todo: checksums ipv4 for error-checking the header integrity if necessary

                switch (payload.protocol) {
                    case PCAP.ProtocolType.UDP:
                        if (payload.ttl < 64) return

                        // ipv4.payload.some(p => p instanceof TCP && (p.dport === 80 || p.dport === 44
                        // handleUDP(payload.payload as PCAP.UDP, payload.saddr.toString(), payload.daddr.toString());

                        break
                    case PCAP.ProtocolType.TCP:
                        handleTCP(payload.payload as PCAP.TCP, payload.saddr.toString(), payload.daddr.toString());
                        break
                    case PCAP.ProtocolType.MTP:
                        console.error("Unhandled MTP Protocol Type")
                        break
                    case PCAP.ProtocolType.IGMP:
                        break
                    default:
                        console.error("Unhandled Protocol Type", payload)
                }

                break
            case PCAP.EtherType.IPv6:

                break
            case PCAP.EtherType.ARP:

                break
        }
    } catch (err) {
        console.error("Error processing packet:", err, packet);
    }
});

/** @todo implement DNS + VoIP + Online Gaming */
function handleUDP(udp: PCAP.UDP, srcIp: string, dstIp: string): void {
    if (udp.data == null) return;

    switch (udp.dport) {
        // domain name lookup
        case PCAP.Port.mDNS:
        case PCAP.Port.DNS:
            let offset = 12; // skipping DNS header
            let domain = "";

            while (offset < udp.data.length) {
                const length = udp.data[offset];

                if (length === 0) break; // EOD
                if (domain.length > 0) domain += ".";

                domain += udp.data.toString("utf8", offset + 1, offset + 1 + length);
                offset += length + 1;
            }

            // from DESKTOP-Q6RCE6I to 224.0.0.251: 04f36b21-3b47-4296-8ea8-a87c4f966a02.local
            const device = devices.find(dev => dev.ip[0].ip === srcIp)
            return console.log(`[DNS] Multicast detected from ${device?.oname} to ${dstIp}: ${domain}`);
        default:
            !udp.data.toString().split("\r\n").find(h => h.startsWith("LOCATION:"))?.split(": ")[1].includes("192.168.31.1") && console.log(udp.data.toString('hex'))
            return console.error("Unhandled UDP layer type :", udp.sport + " ->", udp.dport)
    }
}

function handleTCP(tcp: PCAP.TCP, srcIp: string, dstIp: string): void {
    if (tcp.data == null) return;

    switch (tcp.dport) {
        case PCAP.Port.HTTP:
        case PCAP.Port.HTTPS:
            const payload = tcp.data.toString("hex");

            // TLS Application Data
            if (tcp.data[0] === 0x17) {
                console.log('TLS Application Data detected');
                console.log('TLS Version:', tcp.data[1], tcp.data[2]);
                console.log('Encrypted Payload (hex):', payload);
            }

            // TLD Handshake
            if (tcp.data[0] === 0x16) {
                const sni = extractTLS_SNI(tcp.data);
                if (sni) console.log(`[TLS] SNI ${sni} extracted from ${srcIp} to ${dstIp}`);
            }
    }
}

function extractTLS_SNI(buffer: Buffer): string | null {
    // TLS Handshake starts at byte 5 (after record header)
    const handshakeType = buffer[5];
    if (handshakeType !== 0x01) return null; // 0x01 = Client Hello

    // SNI extension starts at byte 43 (after handshake header)
    const extensionsOffset = 43;
    const extensionsLength = buffer.readUInt16BE(extensionsOffset);
    let offset = extensionsOffset + 2;

    // Iterate through extensions
    while (offset < extensionsOffset + 2 + extensionsLength) {
        const extensionType = buffer.readUInt16BE(offset);
        const extensionLength = buffer.readUInt16BE(offset + 2);
        offset += 4;

        // SNI extension type = 0x0000
        if (extensionType === 0x0000) {
            const sniListLength = buffer.readUInt16BE(offset);
            offset += 2;

            // Extract SNI hostname
            const sniType = buffer[offset];
            const sniLength = buffer.readUInt16BE(offset + 1);
            offset += 3;

            if (sniType === 0x00) { // 0x00 = hostname
                return buffer.toString('utf8', offset, offset + sniLength);
            }
        }

        offset += extensionLength;
    }

    return null;
}