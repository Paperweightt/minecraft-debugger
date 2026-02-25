import { EventEmitter } from 'events';
import { ServerDebugAdapterFactory } from './server-debug-adapter-factory';

// Stub minimal dependencies
const eventEmitter = new EventEmitter();

const dapAddressInfo = new ServerDebugAdapterFactory(eventEmitter).run();

console.log(dapAddressInfo);

import * as net from 'net';

const debugeeData = {
    host: '127.0.0.1',
    port: 19144,
};

const workspaceFolder = 'C:/Users/henry/OneDrive/Desktop/packs/minecraft-scripting-samples/ts-starter';
const clientSocket: net.Socket = new net.Socket();

clientSocket.connect(dapAddressInfo.port, debugeeData.host, () => {
    console.log(`Connected to Minecraft at ${debugeeData.host}:${dapAddressInfo.port}`);

    // Send an initialize request
    sendDAPMessage(clientSocket, {
        seq: 1,
        type: 'request',
        command: 'initialize',
        arguments: {
            adapterID: 'bedrock',
            pathFormat: 'path',
            linesStartAt1: true,
            columnsStartAt1: true,
            supportsVariableType: true,
            supportsProgressReporting: true,
            supportsRunInTerminalRequest: true,
        },
    });

    // Send an attach request
    sendDAPMessage(clientSocket, {
        seq: 2,
        type: 'request',
        command: 'attach',
        arguments: {
            host: debugeeData.host,
            port: debugeeData.port,
            mode: 'listen',
            //
            // preLaunchTask: 'build', // removed since it doesnt seem to be referenced
            workspace: workspaceFolder,
            sourceMapRoot: `${workspaceFolder}/dist/debug/`,
            generatedSourceRoot: `${workspaceFolder}/dist/scripts/`,
        },
    });

    sendDAPMessage(clientSocket, {
        seq: 3,
        type: 'request',
        command: 'configurationDone',
        arguments: {},
    });
});

function sendDAPMessage(socket: net.Socket, message: Record<any, any>) {
    const json = JSON.stringify(message);
    const data = `Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n${json}`;
    socket.write(data);
}

clientSocket.on('data', data => {
    console.log('[MC RESPONSE]', data.toString());
});

clientSocket.on('close', () => {
    console.log('Connection closed');
});

clientSocket.on('error', err => {
    console.error('Connection error:', err);
});
