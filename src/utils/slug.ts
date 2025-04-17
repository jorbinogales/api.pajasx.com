export function toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[\s\-]+/g, '_')     // reemplaza espacios y guiones por "_"
      .replace(/[^\w_]/g, '')       // elimina cualquier carácter que no sea letra, número o "_"
      .trim();
  }