import Spinner from "./Spinner";
import EmptyState from "./EmptyState";
import { Inbox } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

const ALIGN_CLASSES = { left: "text-left", right: "text-right", center: "text-center" };

export default function Table<T>({
  columns,
  rows,
  rowKey,
  loading,
  emptyMessage = "Nothing here yet.",
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="border border-surface-border bg-surface-card">
        <Spinner />
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState icon={Inbox} title={emptyMessage} />;
  }

  return (
    <div className="overflow-hidden border border-surface-border bg-surface-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-sunken">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted ${col.width ?? ""} ${ALIGN_CLASSES[col.align ?? "left"]}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-surface-border last:border-0 ${onRowClick ? "cursor-pointer hover:bg-surface-sunken" : ""}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2.5 align-middle text-text-primary ${ALIGN_CLASSES[col.align ?? "left"]}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
