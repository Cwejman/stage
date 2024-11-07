import dgram from 'dgram';
import DMX from 'dmx';
import chalk from 'chalk';

const socket = dgram.createSocket('udp4');
const dmx = new DMX();
const device = dmx.addUniverse('uni', 'enttec-usb-dmx-pro', '/dev/tty.usbserial-A5066GAM');

const parseArtNetPacket = (packet) => {
  if (packet.toString('ascii', 0, 7) !== 'Art-Net') {
    console.error('Invalid Art-Net packet');
    return null;
  }

  if (packet.readUInt16LE(8) !== 0x5000) {
    console.error('Not a DMX data packet');
    return null;
  }

  const universe = packet.readUInt16LE(14);
  const dmxLength = packet.readUInt16BE(16);

  const dmxData = packet.slice(18, 18 + dmxLength);

  return { universe, dmxData };
}

// Listen for incoming Art-Net packets
let prevStart = Date.now();
socket.on('message', (message, remote) => {
  const start = Date.now();
  const parsedData = parseArtNetPacket(message);

  if (parsedData) {
    const input = parsedData.dmxData;
    const output = input.reduce(
      (acc, val, i) => ({ ...acc, [i + 1]: val }),
      {},
    );

    device.update(output);

    console.log(
      Date.now() - start,
      start - prevStart,
      [...input].slice(0, 48)
        .map((value) => chalk.bgRgb(value, value, value)(' '))
        .join(''),
    );

    prevStart = start;
  }
});

// Bind the socket to listen for Art-Net packets on port 6454
socket.bind(6454, '0.0.0.0', () => {
  console.log('Listening for Art-Net packets on port 6454...');
});
