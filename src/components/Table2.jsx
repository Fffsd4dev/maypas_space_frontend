import React, { useRef, useEffect, forwardRef, useState, useCallback } from "react";
import { useTable, useSortBy, usePagination, useRowSelect, useGlobalFilter, useAsyncDebounce, useExpanded } from "react-table";
import classNames from "classnames";
import 'regenerator-runtime/runtime';

// Define a default UI for filtering
const GlobalFilter = ({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
  searchBoxClass
}) => {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = useState(globalFilter);
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined);
  }, 200);
  return <div className={classNames(searchBoxClass)}>
      <span className="d-flex align-items-center">
        Search :{" "}
          <input type="search" value={value || ""} onChange={e => {
        setValue(e.target.value);
        onChange(e.target.value);
      }} placeholder={`${count} records...`} className="form-control w-auto ms-1" />
      </span>
        </div>;
};

const IndeterminateCheckbox = forwardRef(({
  indeterminate,
  ...rest
}, ref) => {
  const defaultRef = useRef(null);
  const resolvedRef = ref || defaultRef;
  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);
  return <>
            <div className="form-check">
                <input type="checkbox" className="form-check-input" ref={resolvedRef} {...rest} />
                <label htmlFor="form-check-input" className="form-check-label"></label>
            </div>
        </>;
});

const Table2 = props => {
  const isSearchable = props["isSearchable"] || false;
  const isSortable = props["isSortable"] || false;
  const pagination = props["pagination"] || false;
  const isSelectable = props["isSelectable"] || false;
  const isExpandable = props["isExpandable"] || false;
  const sizePerPageList = props["sizePerPageList"] || [];
  let otherProps = {};
  if (isSearchable) {
    otherProps["useGlobalFilter"] = useGlobalFilter;
  }
  if (isSortable) {
    otherProps["useSortBy"] = useSortBy;
  }
  if (isExpandable) {
    otherProps["useExpanded"] = useExpanded;
  }
  if (pagination) {
    otherProps["usePagination"] = usePagination;
  }
  if (isSelectable) {
    otherProps["useRowSelect"] = useRowSelect;
  }
  const dataTable = useTable({
    columns: props["columns"],
    data: props["data"],
    initialState: {
      pageSize: props["pageSize"] || 10
    }
  }, otherProps.hasOwnProperty("useGlobalFilter") && otherProps["useGlobalFilter"], otherProps.hasOwnProperty("useSortBy") && otherProps["useSortBy"], otherProps.hasOwnProperty("useExpanded") && otherProps["useExpanded"], otherProps.hasOwnProperty("usePagination") && otherProps["usePagination"], otherProps.hasOwnProperty("useRowSelect") && otherProps["useRowSelect"], hooks => {
    isSelectable && hooks.visibleColumns.push(columns => [
    // Let's make a column for selection
    {
      id: "selection",
      // The header can use the table's getToggleAllRowsSelectedProps method
      // to render a checkbox
      Header: ({
        getToggleAllPageRowsSelectedProps
      }) => <div>
                            <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
                        </div>,
      // The cell can use the individual row's getToggleRowSelectedProps method
      // to the render a checkbox
      Cell: ({
        row
      }) => <div>
                            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                        </div>
    }, ...columns]);
    isExpandable && hooks.visibleColumns.push(columns => [
    // Let's make a column for selection
    {
      // Build our expander column
      id: "expander",
      // Make sure it has an ID
      Header: ({
        getToggleAllRowsExpandedProps,
        isAllRowsExpanded
      }) => <span {...getToggleAllRowsExpandedProps()}>
                {isAllRowsExpanded ? "-" : "+"}
              </span>,
      Cell: ({
        row
      }) =>
      // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
      // to build the toggle for expanding a row
      row.canExpand ? <span {...row.getToggleRowExpandedProps({
        style: {
          // We can even use the row.depth property
          // and paddingLeft to indicate the depth
          // of the row
          paddingLeft: `${row.depth * 2}rem`
        }
      })}>
                  {row.isExpanded ? "-" : "+"}
                </span> : null
    }, ...columns]);
  });

  let rows = pagination ? dataTable.page : dataTable.rows;

  const [pageCount, setPageCount] = useState(dataTable.pageCount);
  const [pageIndex, setPageIndex] = useState(dataTable.state.pageIndex);

  useEffect(() => {
    setPageCount(dataTable.pageCount);
    setPageIndex(dataTable.state.pageIndex);
  }, [dataTable.pageCount, dataTable.state.pageIndex]);

  const filterPages = useCallback((visiblePages, totalPages) => {
    return visiblePages.filter(page => page <= pageCount);
  }, [pageCount]);

  const getVisiblePages = useCallback((page, total) => {
    if (total < 7) {
      return filterPages([1, 2, 3, 4, 5, 6], total);
    } else {
      if (page % 5 >= 0 && page > 4 && page + 2 < total) {
        return [1, page - 1, page, page + 1, total];
      } else if (page % 5 >= 0 && page > 4 && page + 2 >= total) {
        return [1, total - 3, total - 2, total - 1, total];
      } else {
        return [1, 2, 3, 4, 5, total];
      }
    }
  }, [filterPages]);

  const changePage = page => {
    const activePage = pageIndex + 1;
    if (page === activePage) {
      return;
    }
    const visiblePages = getVisiblePages(page, pageCount);
    setVisiblePages(filterPages(visiblePages, pageCount));
    dataTable.gotoPage(page - 1);
  };

  useEffect(() => {
    const visiblePages = getVisiblePages(null, pageCount);
    setVisiblePages(visiblePages);
  }, [pageCount, getVisiblePages]);

  const [visiblePages, setVisiblePages] = useState(getVisiblePages(null, pageCount));
  const activePage = pageIndex + 1;

  return <>
            {isSearchable && <GlobalFilter preGlobalFilteredRows={dataTable.preGlobalFilteredRows} globalFilter={dataTable.state.globalFilter} setGlobalFilter={dataTable.setGlobalFilter} searchBoxClass={props["searchBoxClass"]} />}

            <div className="table-responsive">
                <table {...dataTable.getTableProps()} className={classNames("table table-centered react-table", props["tableClass"])}>
                    <thead className={props["theadClass"]}>
                    {(dataTable.headerGroups || []).map((headerGroup, idx) => <tr {...headerGroup.getHeaderGroupProps()} key={idx}>
                            {(headerGroup.headers || []).map((column, index) => <th key={index} {...column.getHeaderProps(column.sort && column.getSortByToggleProps())} className={classNames({
              sorting_desc: column.isSortedDesc === true,
              sorting_asc: column.isSortedDesc === false,
              sortable: column.sort === true
            })}>
                                    {column.render("Header")}
                                </th>)}
                        </tr>)}
                    </thead>
                    <tbody {...dataTable.getTableBodyProps()}>
                    {(rows || []).map((row, i) => {
            dataTable.prepareRow(row);
            return <tr {...row.getRowProps(props.getRowProps ? props.getRowProps(row) : {})} key={i}>
                                {(row.cells || []).map((cell, idx) => {
                return <td key={idx} {...cell.getCellProps([{
                  className: cell.column.className
                }])}>
                                            {cell.render("Cell")}
                                        </td>;
              })}
                            </tr>;
          })}
                    </tbody>
                </table>
            </div>
            {pagination && (
              <div className="d-lg-flex align-items-center text-center pb-1">
                {sizePerPageList.length > 0 && (
                  <div className="d-inline-block me-3">
                    <label className="me-1">Display :</label>
                    <select
                      value={dataTable.state.pageSize}
                      onChange={(e) => {
                        dataTable.setPageSize(Number(e.target.value));
                      }}
                      className="form-select d-inline-block w-auto"
                    >
                      {sizePerPageList.map((pageSize, index) => (
                        <option key={index} value={pageSize.value}>
                          {pageSize.text}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <span className="me-3">
                  Page{" "}
                  <strong>
                    {pageIndex + 1} of {dataTable.pageOptions.length}
                  </strong>{" "}
                </span>

                <span className="d-inline-block align-items-center text-sm-start text-center my-sm-0 my-2">
                  <label className="form-label">Go to page : </label>
                  <input
                    type="number"
                    value={pageIndex + 1}
                    min="1"
                    onChange={(e) => {
                      const page = e.target.value ? Number(e.target.value) - 1 : 0;
                      dataTable.gotoPage(page);
                      setPageIndex(dataTable.state.pageIndex);
                    }}
                    className="form-control w-25 ms-1 d-inline-block"
                  />
                </span>

                <ul className="pagination pagination-rounded d-inline-flex ms-auto align-item-center mb-0">
                  <li
                    key="prevpage"
                    className={classNames("page-item", "paginate_button", "previous", {
                      disabled: activePage === 1,
                    })}
                    onClick={() => {
                      if (activePage === 1) return;
                      changePage(activePage - 1);
                    }}
                  >
                    <a href="#" className="page-link">
                      <i className="mdi mdi-chevron-left"></i>
                    </a>
                  </li>
                  {visiblePages.map((page, index, array) => {
                    return array[index - 1] + 1 < page ? (
                      <React.Fragment key={page}>
                        <li className="page-item disabled d-none d-xl-inline-block">
                          <a href="#" className="page-link">
                            ...
                          </a>
                        </li>
                        <li
                          className={classNames("page-item", "d-none", "d-xl-inline-block", {
                            active: activePage === page,
                          })}
                          onClick={(e) => changePage(page)}
                        >
                          <a href="#" className="page-link">
                            {page}
                          </a>
                        </li>
                      </React.Fragment>
                    ) : (
                      <li
                        key={page}
                        className={classNames("page-item", "d-none", "d-xl-inline-block", {
                          active: activePage === page,
                        })}
                        onClick={(e) => changePage(page)}
                      >
                        <a href="#" className="page-link">
                          {page}
                        </a>
                      </li>
                    );
                  })}
                  <li
                    key="nextpage"
                    className={classNames("page-item", "paginate_button", "next", {
                      disabled: activePage === dataTable.pageCount,
                    })}
                    onClick={() => {
                      if (activePage === dataTable.pageCount) return;
                      changePage(activePage + 1);
                    }}
                  >
                    <a href="#" className="page-link">
                      <i className="mdi mdi-chevron-right"></i>
                    </a>
                  </li>
                </ul>
              </div>
            )}
        </>;
};

export default Table2;