export interface TableColumn<T> {
  key: string;
  header: React.ReactNode; // chữ hoặc component
  cell: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}
