import { ReactNode } from "react";

export type ColumnFilter =
  | { type: "text"; paramKey: string; placeholder?: string }
  | {
      type: "select";
      paramKey: string;
      options: SelectOption[];
      placeholder?: string;
    };

export interface TableColumn<T> {
  key: string;
  header: string;
  className?: string;
  headerClassName?: string;
  cell: (row: T, index: number) => React.ReactNode;
  filter?: ColumnFilter;
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
