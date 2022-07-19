declare namespace Express {
  export interface Application {
    start(): Promise<void>;
    stop(): Promise<void>;
    server: import("http").Server;
  }
}
