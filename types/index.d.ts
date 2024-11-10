// custom.d.ts
import * as Express from "express";

declare global {
  namespace Express {
    interface Request {
      addData: any;
    }
  }
}

export {};
