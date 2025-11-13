import type {
  TurboModule,
  CodegenTypes,
  EmitterSubscription,
} from 'react-native';
import {
  NativeEventEmitter,
  NativeModules,
  TurboModuleRegistry,
} from 'react-native';

export type VoskOptions = {
  /**
   * Set of phrases the recognizer will seek on which is the closest one from
   * the record, add `"[unk]"` to the set to recognize phrases striclty.
   */
  grammar?: string[];
  /**
   * Timeout in milliseconds to listen.
   */
  timeout?: number;
};

export interface Spec extends TurboModule {
  loadModel: (path: string) => Promise<void>;
  unload: () => void;

  start: (options?: VoskOptions) => Promise<void>;
  stop: () => void;

  addListener: (eventType: string) => void;
  removeListeners: (count: number) => void;

  readonly onResult: CodegenTypes.EventEmitter<string>;
  readonly onPartialResult: CodegenTypes.EventEmitter<string>;
  readonly onFinalResult: CodegenTypes.EventEmitter<string>;
  readonly onError: CodegenTypes.EventEmitter<string>;
  readonly onTimeout: CodegenTypes.EventEmitter<void>;
}

const isTurboModuleEnabled = (globalThis as any).__turboModuleProxy != null;

const legacyModule = NativeModules.Vosk;

function createLegacyModule() {
  if (legacyModule == null) {
    throw new Error(
      'The package "react-native-vosk" could not find the native module.\n' +
        'Make sure you have properly linked the library for the old architecture.'
    );
  }

  const eventEmitter = new NativeEventEmitter(legacyModule);

  const wrapListener =
    <T>(eventName: string) =>
    (listener: (value: T) => void): EmitterSubscription =>
      eventEmitter.addListener(
        eventName,
        listener as (...args: readonly unknown[]) => unknown
      );

  return {
    loadModel: (path: string) => legacyModule.loadModel(path),
    unload: () => legacyModule.unload(),
    start: (options?: VoskOptions) => legacyModule.start(options ?? {}),
    stop: () => legacyModule.stop(),
    addListener: (eventType: string) => legacyModule.addListener?.(eventType),
    removeListeners: (count: number) => legacyModule.removeListeners?.(count),
    onResult: wrapListener<string>('onResult') as Spec['onResult'],
    onPartialResult: wrapListener<string>(
      'onPartialResult'
    ) as Spec['onPartialResult'],
    onFinalResult: wrapListener<string>(
      'onFinalResult'
    ) as Spec['onFinalResult'],
    onError: wrapListener<string>('onError') as Spec['onError'],
    onTimeout: wrapListener<void>('onTimeout') as Spec['onTimeout'],
  } as Spec;
}

export default isTurboModuleEnabled
  ? TurboModuleRegistry.getEnforcing<Spec>('Vosk')
  : createLegacyModule();
