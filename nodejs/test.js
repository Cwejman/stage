const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

socket.on('message', (message, remote) => {
  if (message.toString('ascii', 0, 7) === 'Art-Net') {
    console.log(`Art-Net packet received from ${remote.address}:${remote.port}`);

    // Extract DMX data (starting at byte 18)
    const dmxData = message.slice(18);
    console.log('DMX Data:', dmxData);
  }
});

socket.bind(6454, '0.0.0.0', () => {
  console.log('Listening for Art-Net packets on port 6454...');
});