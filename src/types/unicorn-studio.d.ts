
declare global {
  interface Window {
    UnicornStudio: {
      isInitialized: boolean;
      init(): Promise<any>;
      addScene(config: any): Promise<any>;
      destroy(): void;
    };
  }
}

export {};
