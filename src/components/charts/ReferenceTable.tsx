import type { ChartTable } from "@/config/charts/definitions";

/**
 * A reference table. Server rendered with no interaction, so it costs no
 * JavaScript and a crawler receives the whole thing.
 *
 * Wide tables scroll horizontally inside their own container rather than
 * pushing the page sideways, and the first column is the row's label so the
 * table still makes sense when scrolled.
 */
export function ReferenceTable({ table, caption }: { table: ChartTable; caption: string }) {
  return (
    <figure data-reveal="up" className="card p-5 sm:p-7">
      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              {table.columns.map((column) => (
                <th key={column.key} scope="col" className="whitespace-nowrap py-2 pe-4 text-start font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {table.rows.map((row, index) => (
              <tr key={index}>
                {table.columns.map((column, columnIndex) =>
                  columnIndex === 0 ? (
                    <th
                      key={column.key}
                      scope="row"
                      className="tabular whitespace-nowrap py-2.5 pe-4 text-start font-medium text-foreground"
                    >
                      {row[column.key]}
                    </th>
                  ) : (
                    <td
                      key={column.key}
                      className="tabular whitespace-nowrap py-2.5 pe-4 text-start text-muted"
                    >
                      {row[column.key]}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {table.note ? (
        <figcaption className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted">
          {table.note}
        </figcaption>
      ) : null}
    </figure>
  );
}
