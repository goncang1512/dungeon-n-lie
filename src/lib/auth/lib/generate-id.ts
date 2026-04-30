import { v4 as uuidv4 } from "uuid";

export const generateId = (length: number = 32) => {
  // generate uuid lalu hapus "-"
  const clean = uuidv4().replace(/-/g, "");

  // kalau butuh lebih panjang dari 32, generate tambahan
  let result = clean;

  while (result.length < length) {
    result += uuidv4().replace(/-/g, "");
  }

  // potong sesuai panjang yang diminta
  return result.slice(0, length);
};
