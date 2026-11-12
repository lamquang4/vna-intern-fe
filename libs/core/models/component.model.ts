import { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  header: React.ReactNode; // chữ hoặc component
  cell: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface GroupTableColumn<T> {
  key: string;
  header: string;
  field?: keyof T & string; 
  cell?: (row: T) => ReactNode; 
  rowSpan?: (row: T) => number; 
  align?: "left" | "center";
  children?: GroupTableColumn<T>[]; 
}

export type GroupTableRow<T> =
  | { id: string; data: T; bold?: boolean }
  | { id: string; section: string }; 
