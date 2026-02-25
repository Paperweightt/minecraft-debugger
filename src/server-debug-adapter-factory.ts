// Copyright (C) Microsoft Corporation.  All rights reserved.

import * as Net from 'net';
import { EventEmitter } from 'stream';
import { Session } from './session';
// import { StatsProvider } from './stats/stats-provider';
// import { HomeViewProvider } from './panels/home-view-provider';

// Factory for creating a Debug Adapter that runs as a server inside the extension and communicates via a socket.
//
export class ServerDebugAdapterFactory {
    private server?: Net.Server;
    // private _homeViewProvider: HomeViewProvider;
    // private _statsProvider: StatsProvider;
    private _eventEmitter: EventEmitter;

    constructor(eventEmitter: EventEmitter) {
        // this._homeViewProvider = homeViewProvider;
        // this._statsProvider = statsProvider;
        this._eventEmitter = eventEmitter;
    }

    run(): Net.AddressInfo {
        if (!this.server) {
            // start listening on a random port
            this.server = Net.createServer(socket => {
                const session = new Session(this._eventEmitter);
                session.setRunAsServer(true);
                session.start(socket as NodeJS.ReadableStream, socket);
            }).listen(0);
        }

        return this.server.address() as Net.AddressInfo;
    }

    runIO(): void {
        const eventEmitter = this._eventEmitter;

        if (!this.server) {
            class StandaloneSession extends Session {
                constructor() {
                    super(eventEmitter);
                }
            }

            Session.run(StandaloneSession);
        }
    }

    dispose(): void {
        if (this.server) {
            this.server.close();
        }
    }
}
