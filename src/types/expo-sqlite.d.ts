// Declaração mínima para evitar erros de import/tipagem
declare module "expo-sqlite" {
  export function openDatabase(name?: string, version?: string, description?: string, size?: number): any;
  export type SQLError = any;
  export type SQLResultSet = any;
  export type SQLTransaction = any;
  const _default: { openDatabase: typeof openDatabase };
  export default _default;
}