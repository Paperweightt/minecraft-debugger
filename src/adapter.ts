import EventEmitter from 'events';
import { ServerDebugAdapterFactory } from './server-debug-adapter-factory';

const eventEmitter = new EventEmitter();

new ServerDebugAdapterFactory(eventEmitter).runIO();
