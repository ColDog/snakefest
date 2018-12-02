import * as fs from "fs";

export class FileStore {
  save(id: string, js: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(`store/${id}.js`, js, err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  load(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(`store/${id}.js`, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data.toString());
      });
    });
  }
}

// Evaluate function "func" with the parameter "req" inside the js.
export function evaluate(js: string, func: string, req: any): any {
  return new Function('req', `${js}; return ${func}(req)`)(req)
}
