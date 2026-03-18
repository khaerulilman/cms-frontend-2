export type Column = {
  id: string;
  tableId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Row = {
  id: string;
  tableId: string;
  createdAt: string;
  updatedAt: string;
};

export type Cell = {
  id: string;
  rowId: string;
  columnId: string;
  value: string;
  cloudinaryPublicId: string | null;
  imageUrl: string | null;
};

export type TableDetailCache = {
  columns: Column[];
  rows: Row[];
  cells: Cell[];
};
