import { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";

import employees from "./data/employees.json";

import { StatCard } from "./components/StatCard";
import { StatusPill } from "./components/StatusPill";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function App() {
  const gridApiRef = useRef(null);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [activeOnly, setActiveOnly] = useState(false);

  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const departments = useMemo(() => {
    const uniqueDepartments = [
      ...new Set(employees.map((employee) => employee.department)),
    ];

    return ["All departments", ...uniqueDepartments];
  }, []);

  /* =========================================================
     DASHBOARD STATISTICS
  ========================================================= */

  const stats = useMemo(() => {
    const total = employees.length;

    const active = employees.filter((employee) => employee.isActive).length;

    const payroll = employees.reduce(
      (totalSalary, employee) => totalSalary + employee.salary,
      0,
    );

    const averagePerformance =
      employees.reduce(
        (totalRating, employee) => totalRating + employee.performanceRating,
        0,
      ) / total;

    return {
      total,
      active,
      payroll,
      averagePerformance,
    };
  }, []);

  /* =========================================================
     FILTERED ROWS
  ========================================================= */

  const rows = useMemo(() => {
    return employees.filter((employee) => {
      const matchesDepartment =
        department === "All departments" || employee.department === department;

      const matchesActiveFilter = !activeOnly || employee.isActive;

      return matchesDepartment && matchesActiveFilter;
    });
  }, [department, activeOnly]);

  /* =========================================================
     AG GRID COLUMNS
  ========================================================= */

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Employee",
        minWidth: 230,
        flex: 1.5,

        valueGetter: (params) =>
          `${params.data.firstName} ${params.data.lastName}`,

        cellRenderer: (params) => (
          <div className="employee-cell">
            <div className="avatar">
              {params.data.firstName.charAt(0)}
              {params.data.lastName.charAt(0)}
            </div>

            <div className="employee-info">
              <div className="employee-name">
                {params.data.firstName} {params.data.lastName}
              </div>

              <div className="employee-email">{params.data.email}</div>
            </div>
          </div>
        ),
      },

      {
        field: "department",
        headerName: "Department",
        minWidth: 120,
        flex: 1,
      },

      {
        field: "position",
        headerName: "Position",
        minWidth: 160,
        flex: 1.2,
      },

      {
        field: "salary",
        headerName: "Salary",
        minWidth: 110,
        flex: 0.8,
        type: "numericColumn",

        valueFormatter: (params) => currencyFormatter.format(params.value),
      },

      {
        field: "performanceRating",
        headerName: "Performance",
        minWidth: 120,
        flex: 0.9,
        type: "numericColumn",

        cellRenderer: (params) => (
          <div className="rating-cell">
            <span className="rating-star">★</span>
            <span>{Number(params.value).toFixed(1)}</span>
          </div>
        ),
      },

      {
        field: "projectsCompleted",
        headerName: "Projects",
        minWidth: 90,
        flex: 0.65,
        type: "numericColumn",
      },

      {
        field: "age",
        headerName: "Age",
        minWidth: 70,
        flex: 0.5,
        type: "numericColumn",
      },

      {
        field: "location",
        headerName: "Location",
        minWidth: 110,
        flex: 0.8,
      },

      {
        field: "hireDate",
        headerName: "Hire Date",
        minWidth: 115,
        flex: 0.85,

        valueFormatter: (params) =>
          dateFormatter.format(new Date(`${params.value}T00:00:00`)),
      },

      {
        field: "isActive",
        headerName: "Status",
        minWidth: 95,
        flex: 0.7,

        cellRenderer: (params) => <StatusPill active={params.value} />,
      },
    ],
    [],
  );

  /* =========================================================
     DEFAULT AG GRID COLUMN SETTINGS
  ========================================================= */

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 70,
    }),
    [],
  );

  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = (value) => {
    setSearch(value);

    gridApiRef.current?.setGridOption("quickFilterText", value);
  };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const handleClear = () => {
    setSearch("");
    setDepartment("All departments");
    setActiveOnly(false);

    gridApiRef.current?.setFilterModel(null);

    gridApiRef.current?.setGridOption("quickFilterText", "");
  };

  /* =========================================================
     CSV EXPORT
  ========================================================= */

  const handleExport = () => {
    gridApiRef.current?.exportDataAsCsv({
      fileName: "factwise-employee-dashboard.csv",
    });
  };

  return (
    <main className="app-shell">
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">F</div>

          <div>
            <div className="brand-name">FactWise</div>
            <div className="brand-subtitle">People Analytics</div>
          </div>
        </div>

        <div className="topbar-meta">
          <span className="live-dot" />
          <span>Client-side data</span>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="content">
        {/* PAGE HEADER */}

        <div className="page-heading">
          <div>
            <p className="eyebrow">WORKFORCE OVERVIEW</p>

            <h1>Employee dashboard</h1>

            <p className="subtitle">
              Explore employee performance, compensation and workforce status in
              one place.
            </p>
          </div>

          <button
            type="button"
            className="export-button"
            onClick={handleExport}
          >
            Export CSV
          </button>
        </div>

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <section className="stats-grid">
          <StatCard
            label="Total employees"
            value={stats.total}
            helper="Across all departments"
          />

          <StatCard
            label="Active employees"
            value={stats.active}
            helper={`${Math.round(
              (stats.active / stats.total) * 100,
            )}% of workforce`}
          />

          <StatCard
            label="Total payroll"
            value={currencyFormatter.format(stats.payroll)}
            helper="Annual base salary"
          />

          <StatCard
            label="Avg. performance"
            value={stats.averagePerformance.toFixed(1)}
            helper="Out of 5.0"
          />
        </section>

        {/* ===================================================
            DATA TABLE CARD
        =================================================== */}

        <section className="dashboard-card">
          {/* TOOLBAR */}

          <div className="toolbar">
            <div className="search-wrap">
              <span className="search-icon" aria-hidden="true">
                ⌕
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search employees, roles, locations..."
                aria-label="Search employees"
              />
            </div>

            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              aria-label="Filter by department"
            >
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              className={`filter-button ${activeOnly ? "selected" : ""}`}
              onClick={() => setActiveOnly((current) => !current)}
            >
              {activeOnly ? "✓ " : ""}
              Active only
            </button>

            <button
              type="button"
              className="clear-button"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>

          {/* TABLE META */}

          <div className="grid-meta">
            <div>
              <strong>{rows.length}</strong>{" "}
              {rows.length === 1 ? "employee" : "employees"}
              {search && <span className="muted"> matching “{search}”</span>}
            </div>

            <div className="hint">Sort · filter · resize columns</div>
          </div>

          {/* AG GRID */}

          <div className="grid-container ag-theme-quartz">
            <AgGridReact
              rowData={rows}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              getRowId={(params) => String(params.data.id)}
              rowHeight={54}
              headerHeight={44}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50]}
              animateRows={true}
              suppressCellFocus={true}
              onGridReady={(params) => {
                gridApiRef.current = params.api;

                params.api.setGridOption("quickFilterText", search);
              }}
            />
          </div>
        </section>

        {/* FOOTER */}

        <footer className="footer">
          Built with React + AG Grid Client-Side Row Model
        </footer>
      </section>
    </main>
  );
}
