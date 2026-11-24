interface HeaderCell<N> {
  column: N;
  rowSpan: number;
  colSpan: number;
}

const getDepth = <N extends { children?: N[] }>(nodes: N[]): number =>
  Math.max(
    ...nodes.map((node) =>
      node.children?.length ? 1 + getDepth(node.children) : 1,
    ),
  );

export const getLeaves = <N extends { children?: N[] }>(nodes: N[]): N[] =>
  nodes.flatMap((node) =>
    node.children?.length ? getLeaves(node.children) : [node],
  );

export function buildHeaderRows<N extends { children?: N[] }>(
  nodes: N[],
): HeaderCell<N>[][] {
  const depth = getDepth(nodes);
  const rows: HeaderCell<N>[][] = Array.from({ length: depth }, () => []);

  const walk = (list: N[], level: number) => {
    for (const column of list) {
      const children = column.children;
      rows[level].push({
        column,
        rowSpan: children?.length ? 1 : depth - level,
        colSpan: getLeaves([column]).length,
      });
      if (children?.length) walk(children, level + 1);
    }
  };

  walk(nodes, 0);
  return rows;
}
