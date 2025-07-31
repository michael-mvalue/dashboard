// components/GridComponent.tsx
"use client";

import type { ColDef, ColGroupDef } from "ag-grid-community";

import { useTheme } from "next-themes";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  colorSchemeDark,
  themeQuartz,
  colorSchemeLight,
} from "ag-grid-community";
import { useMemo } from "react";

ModuleRegistry.registerModules([AllCommunityModule]);

interface GridComponentProps<T = any> {
  rowData: T[];
  columnDefs: (ColDef<T> | ColGroupDef<T>)[];
}

const GridComponent = ({ rowData, columnDefs }: GridComponentProps) => {
  const { resolvedTheme } = useTheme();

  const defaultColDef = useMemo(() => {
    return {
      cellStyle: {
        display: "flex",
        alignItems: "center",
      },
    };
  }, []);

  const myTheme =
    resolvedTheme === "dark"
      ? themeQuartz.withPart(colorSchemeDark)
      : themeQuartz.withPart(colorSchemeLight);

  return (
    <div className="w-full h-full ag-theme-quartz">
      <AgGridReact
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        domLayout="autoHeight"
        rowData={rowData}
        rowHeight={50}
        theme={myTheme}
      />
    </div>
  );
};

export default GridComponent;
