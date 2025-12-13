// src/pages/Invoices.jsx  (replace your existing file)
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, CardBody, Col, Row, Collapse } from "react-bootstrap";
import { Link } from "react-router-dom";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import PageMetaData from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import {
  getSubscribers,
  exportSubscribersFile,
  deleteSubscriber,
  blockSubscriber,
  unblockSubscriber,
} from "@/api/apis"; // adjust path if needed

const Invoices = () => {
  // data + ui state
  const [subscribers, setSubscribers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // filter UI
  const [showFilters, setShowFilters] = useState(false);
  const [tempStatus, setTempStatus] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [tempSort, setTempSort] = useState(sort);

  // debounce search
  const searchRef = useRef();
  useEffect(() => {
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setPage(1); // reset page for new query
      fetchSubscribers({ page: 1, q, status: statusFilter, sort });
    }, 450);
    return () => clearTimeout(searchRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, statusFilter, sort]);

  // fetch when page changes
  useEffect(() => {
    fetchSubscribers({ page, q, status: statusFilter, sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // fetch when limit changes: reset to page 1 and fetch immediately
  useEffect(() => {
    setPage(1);
    fetchSubscribers({ page: 1, q, status: statusFilter, sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  // initial load
  useEffect(() => {
    fetchSubscribers({ page: 1, q: "", status: "", sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSubscribers = useCallback(
    async ({ page = 1, q: search = "", status = "", sort: sortBy = sort } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSubscribers({ page, limit, q: search, status, sort: sortBy });
        setSubscribers(res.data || []);
        setMeta(res.meta || { total: 0, page, limit, pages: 1 });
      } catch (err) {
        console.error("Failed to fetch subscribers", err);
        setError(err?.message || "Failed to fetch");
        setSubscribers([]);
        setMeta({ total: 0, page: 1, limit, pages: 1 });
      } finally {
        setLoading(false);
      }
    },
    [limit, sort]
  );

  const handleExport = async (type = "excel", exportAll = false) => {
    try {
      const options = { export: type, q, status: statusFilter };
      if (exportAll) options.exportAll = true;
      const res = await exportSubscribersFile(options);
      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const filename = res.headers["content-disposition"]
        ? res.headers["content-disposition"].split("filename=")[1] || `subscribers.${type === "pdf" ? "pdf" : "xlsx"}`
        : `subscribers.${type === "pdf" ? "pdf" : "xlsx"}`;

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename.replace(/"/g, "");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed", err);
      setError(err?.message || "Export failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete subscriber? This action cannot be undone.")) return;
    try {
      setLoading(true);
      await deleteSubscriber(id);
      // after deletion, if current page becomes empty and page>1, move back a page
      const newCount = subscribers.length - 1;
      if (newCount === 0 && meta.page > 1) {
        setPage(meta.page - 1);
        // fetch will be triggered by page change effect
      } else {
        await fetchSubscribers({ page, q, status: statusFilter, sort });
      }
    } catch (err) {
      console.error("Delete failed", err);
      setError(err?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (id, email, currentStatus) => {
    const isBlocking = currentStatus !== "blocked";
    const confirmMsg = isBlocking
      ? `Block ${email}? blocked subscribers will not receive newsletters.`
      : `Unblock ${email}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      setError(null);
      if (isBlocking) {
        await blockSubscriber({ id, email });
      } else {
        await unblockSubscriber({ id, email });
      }
      await fetchSubscribers({ page, q, status: statusFilter, sort });
    } catch (err) {
      console.error("Block/Unblock failed", err);
      setError(err?.message || "Block/Unblock failed");
    } finally {
      setLoading(false);
    }
  };

  // helper to render page numbers with ellipsis
  const getPageNumbers = (current, totalPages, maxButtons = 7) => {
    const pages = [];
    if (!totalPages || totalPages <= maxButtons) {
      for (let i = 1; i <= (totalPages || 1); i++) pages.push(i);
      return pages;
    }
    const side = Math.floor((maxButtons - 3) / 2);
    let left = Math.max(2, current - side);
    let right = Math.min(totalPages - 1, current + side);

    if (current - 1 <= side) {
      right = maxButtons - 1;
      left = 2;
    } else if (totalPages - current <= side) {
      left = totalPages - (maxButtons - 2);
      right = totalPages - 1;
    }

    pages.push(1);
    if (left > 2) pages.push("left-ellipsis");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("right-ellipsis");
    pages.push(totalPages);
    return pages;
  };

  // apply filters from filter panel
  const applyFilters = () => {
    setStatusFilter(tempStatus);
    setSort(tempSort);
    setShowFilters(false);
    setPage(1);
    fetchSubscribers({ page: 1, q, status: tempStatus, sort: tempSort });
  };

  const resetFilters = () => {
    setTempStatus("");
    setTempSort("createdAt:desc");
  };

  // helpers to detect pagination variant
  const hasPages = typeof meta.pages !== "undefined" && meta.pages > 0;
  const hasNextFlag = typeof meta.hasNext !== "undefined";

  return (
    <>
      <PageBreadcrumb subName="Invoice" title="Newsletter- Subscribers" />
      <PageMetaData title="Newsletter" />

      <Row>
        <Col xs={12}>
          <Card className="mb-3">
            <CardBody>
              <Row className="gy-2 align-items-center">
                <Col xs={12} md="auto" className="d-flex align-items-center gap-2">
                  <IconifyIcon icon="bx:search-alt" />
                  <input
                    type="search"
                    className="form-control form-control-sm"
                    placeholder="Search subscriber..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    aria-label="Search subscribers"
                    style={{ minWidth: 180 }}
                  />
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => setShowFilters((s) => !s)}
                    aria-expanded={showFilters}
                    aria-controls="filter-panel"
                    className="d-inline-flex align-items-center ms-1"
                  >
                    <IconifyIcon icon="bx:filter-alt" className="me-1" />
                    Filters
                  </Button>
                </Col>

                <Col xs={12} md className="d-flex justify-content-md-end gap-2">
                  <div className="d-flex flex-wrap gap-2">
                    <Button variant="outline-secondary" size="sm" onClick={() => handleExport("excel", false)} disabled={loading}>
                      Export page
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={() => handleExport("excel", true)} disabled={loading}>
                      Export all
                    </Button>
                    <Button variant="success" size="sm" onClick={() => handleExport("excel")} disabled={loading}>
                      <IconifyIcon icon="bx:plus" className="me-1" />
                      Bulk Mailer
                    </Button>
                  </div>
                </Col>
              </Row>

              <Collapse in={showFilters}>
                <div id="filter-panel" className="mt-3">
                  <Card className="p-3 border">
                    <Row className="g-2">
                      <Col xs={12} md={4}>
                        <label className="form-label mb-1">Status</label>
                        <select className="form-select form-select-sm" value={tempStatus} onChange={(e) => setTempStatus(e.target.value)}>
                          <option value="">All</option>
                          <option value="active">Active</option>
                          <option value="unsubscribed">Unsubscribed</option>
                          <option value="blocked">Blocked</option>
                          <option value="bounced">Bounced</option>
                          <option value="complained">Complained</option>
                        </select>
                      </Col>

                      <Col xs={12} md={4}>
                        <label className="form-label mb-1">Sort</label>
                        <select className="form-select form-select-sm" value={tempSort} onChange={(e) => setTempSort(e.target.value)}>
                          <option value="createdAt:desc">Newest</option>
                          <option value="createdAt:asc">Oldest</option>
                          <option value="email:asc">Email A → Z</option>
                          <option value="email:desc">Email Z → A</option>
                        </select>
                      </Col>

                      <Col xs={12} md={4} className="d-flex gap-2 align-items-end">
                        <Button size="sm" variant="primary" onClick={applyFilters} disabled={loading}>
                          Apply
                        </Button>
                        <Button size="sm" variant="secondary" onClick={resetFilters} disabled={loading}>
                          Reset
                        </Button>
                        <Button size="sm" variant="light" onClick={() => setShowFilters(false)}>
                          Close
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                </div>
              </Collapse>
            </CardBody>
          </Card>

          <Card>
            <div className="table-responsive">
              <table className="table table-hover text-nowrap mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="py-2">SL NO</th>
                    <th className="py-2">Subscriber</th>
                    <th className="py-2">Created Date</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Updated Date</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody >
                  
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="text-center text-danger py-4">
                        {error}
                      </td>
                    </tr>
                  ) : subscribers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No subscribers found
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((s, idx) => (
                      <tr key={s._id || idx}>
                        <td>
                          <div className="fw-medium">{(meta.page - 1) * meta.limit + idx + 1}</div>
                        </td>
                        <td>
                          <div className="d-flex flex-column">
                            <div className="fw-semibold">{s.email}</div>
                          </div>
                        </td>
                        <td>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}</td>
                        <td>
                          <span
                            className={`badge ${
                              s.status === "unsubscribed" ? "bg-danger" : s.status === "active" ? "bg-success" : "bg-warning text-dark"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td>{s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : ""}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-2">
                            <Button
                              variant={s.status === "active" ? "warning" : "secondary"}
                              size="sm"
                              onClick={() => handleToggleBlock(s._id, s.email, s.status)}
                              disabled={loading}
                            >
                              {s.status === "active" ? (
                                <>
                                  <IconifyIcon icon="bx:block" className="me-1" />
                                  Block
                                </>
                              ) : (
                                <>
                                  <IconifyIcon icon="bx:check" className="me-1" />
                                  Unblock
                                </>
                              )}
                            </Button>

                            <Button variant="danger" size="sm" onClick={() => handleDelete(s._id)} disabled={loading}>
                              <IconifyIcon icon="bx:trash" className="me-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-top">
              <Row className="align-items-center gy-2">
                <Col xs={12} md={6}>
                  <div className="text-muted small">
                    Showing <span className="fw-semibold">{subscribers.length}</span> of <span className="fw-semibold">{meta.total}</span> subscribers
                  </div>
                </Col>

                <Col xs={12} md={6} className="d-flex justify-content-md-end align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <label htmlFor="pageSize" className="mb-0 small">
                      Rows
                    </label>
                    <select
                      id="pageSize"
                      className="form-select form-select-sm"
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      disabled={loading}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  {/* Pagination: show numbered if pages available, else prev/next using hasNext */}
                  {hasPages ? (
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${meta.page === 1 ? "disabled" : ""}`}>
                        <Link
                          to=""
                          className="page-link"
                          onClick={(e) => {
                            e.preventDefault();
                            if (meta.page !== 1) setPage(1);
                          }}
                          aria-label="First page"
                        >
                          «
                        </Link>
                      </li>

                      <li className={`page-item ${meta.page === 1 ? "disabled" : ""}`}>
                        <Link
                          to=""
                          className="page-link"
                          onClick={(e) => {
                            e.preventDefault();
                            if (meta.page > 1) setPage(meta.page - 1);
                          }}
                          aria-label="Previous page"
                        >
                          <IconifyIcon icon="bx:left-arrow-alt" />
                        </Link>
                      </li>

                      {getPageNumbers(meta.page, meta.pages, 7).map((p, i) =>
                        typeof p === "number" ? (
                          <li key={i} className={`page-item ${p === meta.page ? "active" : ""}`}>
                            <Link
                              to=""
                              className="page-link"
                              onClick={(e) => {
                                e.preventDefault();
                                if (p !== meta.page) setPage(p);
                              }}
                            >
                              {p}
                            </Link>
                          </li>
                        ) : (
                          <li key={i} className="page-item disabled">
                            <span className="page-link">…</span>
                          </li>
                        )
                      )}

                      <li className={`page-item ${meta.page === meta.pages ? "disabled" : ""}`}>
                        <Link
                          to=""
                          className="page-link"
                          onClick={(e) => {
                            e.preventDefault();
                            if (meta.page < meta.pages) setPage(meta.page + 1);
                          }}
                          aria-label="Next page"
                        >
                          <IconifyIcon icon="bx:right-arrow-alt" />
                        </Link>
                      </li>

                      <li className={`page-item ${meta.page === meta.pages ? "disabled" : ""}`}>
                        <Link
                          to=""
                          className="page-link"
                          onClick={(e) => {
                            e.preventDefault();
                            if (meta.page !== meta.pages) setPage(meta.pages);
                          }}
                          aria-label="Last page"
                        >
                          »
                        </Link>
                      </li>
                    </ul>
                  ) : (
                    // fallback: prev / next only (works with meta.hasNext)
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={meta.page === 1 || loading}
                        onClick={() => meta.page > 1 && setPage(meta.page - 1)}
                      >
                        Prev
                      </Button>
                      <div className="small align-self-center">Page {meta.page}</div>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={!meta.hasNext || loading}
                        onClick={() => meta.hasNext && setPage(meta.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Invoices;
