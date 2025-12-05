import { useState, useEffect, useRef } from 'react';
import {
    Card,
    CardBody,
    Row,
    Col,
    Button,
    Table,
    Badge,
    Modal,
    Pagination,
    Form,
    InputGroup
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { toast } from 'react-toastify';
import { deleteEnquiries, getEnquiries } from '@/api/apis';

const EnquiryManagement = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNext: false,
        hasPrev: false
    });

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [enquiryToDelete, setEnquiryToDelete] = useState(null);

    // 🔍 SEARCH SEPARATED
    const [search, setSearch] = useState("");

    // 📅 DATE FILTERS
    const [filters, setFilters] = useState({
        dateFrom: "",
        dateTo: ""
    });

    const filterTimeoutRef = useRef(null);
    const itemsPerPage = 8;

    // Load enquiries whenever page changes
    useEffect(() => {
        loadEnquiries();
    }, [currentPage]);

    // Debounce search only
    useEffect(() => {
        if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);

        filterTimeoutRef.current = setTimeout(() => {
            setCurrentPage(1);
            loadEnquiries();
        }, 500);

        return () => clearTimeout(filterTimeoutRef.current);
    }, [search]);

    // Date filters immediately trigger load
    useEffect(() => {
        setCurrentPage(1);
        loadEnquiries();
    }, [filters.dateFrom, filters.dateTo]);

    const loadEnquiries = async () => {
        setLoading(true);
        try {
            const response = await getEnquiries(currentPage, itemsPerPage, {
                search,
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo
            });

            if (response.success) {
                setEnquiries(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            toast.error('Failed to load enquiries');
        } finally {
            setLoading(false);
        }
    };

    const loadAllEnquiriesForExport = async () => {
        try {
            const response = await getEnquiries(1, 10000, {
                search,
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo
            });
            return response.success ? response.data : [];
        } catch {
            toast.error("Failed to load data for export");
            return [];
        }
    };

    // PDF EXPORT
    const handleDownloadPDF = async () => {
        try {
            setExportLoading(true);
            const dataToExport = await loadAllEnquiriesForExport();

            if (dataToExport.length === 0) {
                toast.warning("No data to export");
                return;
            }

            const jsPDFModule = await import("jspdf");
            const autoTableModule = await import("jspdf-autotable");

            const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
            const autoTable = autoTableModule.default || autoTableModule;

            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.text("Enquiries Report", 14, 15);

            const tableData = dataToExport.map((enq, i) => [
                i + 1,
                enq.firstName,
                enq.lastName,
                enq.email,
                new Date(enq.createdAt).toLocaleDateString()
            ]);

            autoTable(doc, {
                startY: 25,
                head: [["#", "First Name", "Last Name", "Email", "Date"]],
                body: tableData,
                styles: { fontSize: 8 }
            });

            doc.save(`enquiries-${new Date().toISOString().split("T")[0]}.pdf`);
            toast.success("PDF downloaded successfully");

        } catch (e) {
            console.error(e);
            toast.error("Failed to generate PDF");
        } finally {
            setExportLoading(false);
        }
    };

    // EXCEL EXPORT
    const handleDownloadExcel = async () => {
        try {
            setExportLoading(true);
            const dataToExport = await loadAllEnquiriesForExport();

            if (dataToExport.length === 0) {
                toast.warning("No data to export");
                return;
            }

            const XLSX = await import("xlsx");

            const sheetData = [
                ["#", "First Name", "Last Name", "Email", "Message", "Date"],
                ...dataToExport.map((enq, i) => [
                    i + 1,
                    enq.firstName,
                    enq.lastName,
                    enq.email,
                    enq.message,
                    new Date(enq.createdAt).toLocaleDateString()
                ])
            ];

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
            XLSX.utils.book_append_sheet(workbook, worksheet, "Enquiries");

            XLSX.writeFile(workbook, `enquiries-${new Date().toISOString().split("T")[0]}.xlsx`);
            toast.success("Excel downloaded");

        } catch (e) {
            console.error(e);
            toast.error("Excel generation failed");
        } finally {
            setExportLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setSearch("");
        setFilters({
            dateFrom: "",
            dateTo: ""
        });
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: { bg: "warning", text: "Pending" },
            "in-progress": { bg: "info", text: "In Progress" },
            completed: { bg: "success", text: "Completed" },
        };
        const config = map[status] || { bg: "secondary", text: "Unknown" };
        return <Badge bg={config.bg}>{config.text}</Badge>;
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });

    const handleShowDetails = (enquiry) => {
        setSelectedEnquiry(enquiry);
        setShowDetailModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!enquiryToDelete) return;

        try {
            const res = await deleteEnquiries(enquiryToDelete._id);
            if (res.success) {
                if (enquiries.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    loadEnquiries();
                }
                toast.success(res.message);
                setShowDeleteModal(false);
            }
        } catch {
            toast.error("Failed to delete enquiry");
        }
    };

    return (
        <>
            <Row>
                <Col xs={12}>
                    <Card>
                        <CardBody>

                            {/* HEADER */}
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h4 className="card-title mb-0">Enquiry Management</h4>
                                    <div className="mt-2">
                                        <Badge bg="info">Total: {pagination.totalItems}</Badge>
                                        <Badge bg="primary" className="ms-2">
                                            Page: {currentPage} / {pagination.totalPages}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-success"
                                        onClick={handleDownloadExcel}
                                        disabled={exportLoading || loading}
                                    >
                                        <IconifyIcon icon="bx:download" className="me-1" />
                                        {exportLoading ? "Exporting..." : "Export Excel"}
                                    </Button>

                                    <Button
                                        variant="success"
                                        onClick={handleDownloadPDF}
                                        disabled={exportLoading || loading}
                                    >
                                        <IconifyIcon icon="bx:file" className="me-1" />
                                        {exportLoading ? "Generating..." : "Download PDF"}
                                    </Button>
                                </div>
                            </div>

                            {/* FILTERS */}
                            <Card className="mb-4">
                                <CardBody>
                                    <Row>

                                        {/* SEARCH */}
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Search</Form.Label>
                                                <InputGroup>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Search by name or email..."
                                                        value={search}
                                                        onChange={(e) => setSearch(e.target.value)}
                                                    />
                                                    <InputGroup.Text>
                                                        <IconifyIcon icon="bx:search" />
                                                    </InputGroup.Text>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>

                                        {/* DATE FROM */}
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>From Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={filters.dateFrom}
                                                    onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>

                                        {/* DATE TO */}
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label>To Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    value={filters.dateTo}
                                                    onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>

                                        {/* RESET */}
                                        <Col md={2} className="d-flex align-items-end">
                                            <Button
                                                variant="outline-secondary text-primary hover-border"
                                                className="w-100"
                                                onClick={clearFilters}
                                                disabled={loading}
                                            >
                                                {/* <IconifyIcon icon="bx:reset" /> */}
                                                Reset
                                            </Button>
                                        </Col>

                                    </Row>
                                </CardBody>
                            </Card>

                            {/* TABLE */}
                            <Table responsive striped>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Email</th>
                                        {/* <th>Status</th> */}
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="text-center">Loading...</td>
                                        </tr>
                                    ) : enquiries.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center text-muted">No enquiries found</td>
                                        </tr>
                                    ) : (
                                        enquiries.map((enquiry, index) => (
                                            <tr key={enquiry._id}>
                                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td><strong>{enquiry.firstName}</strong></td>
                                                <td><strong>{enquiry.lastName}</strong></td>
                                                <td><a href={`mailto:${enquiry.email}`}>{enquiry.email}</a></td>
                                                {/* <td>{getStatusBadge(enquiry.status)}</td> */}
                                                <td>{formatDate(enquiry.createdAt)}</td>

                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            onClick={() => handleShowDetails(enquiry)}
                                                        >
                                                            <IconifyIcon icon="bx:show" />
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="outline-danger"
                                                            onClick={() => {
                                                                setEnquiryToDelete(enquiry);
                                                                setShowDeleteModal(true);
                                                            }}
                                                        >
                                                            <IconifyIcon icon="bx:trash" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>

                            {/* PAGINATION */}
                            {pagination.totalPages > 1 && (
                                <Pagination className="justify-content-center mt-3">
                                    <Pagination.Prev
                                        disabled={!pagination.hasPrev}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                    />

                                    {[...Array(pagination.totalPages)].map((_, i) => (
                                        <Pagination.Item
                                            key={i + 1}
                                            active={i + 1 === currentPage}
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </Pagination.Item>
                                    ))}

                                    <Pagination.Next
                                        disabled={!pagination.hasNext}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                    />
                                </Pagination>
                            )}

                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* DETAILS MODAL */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Enquiry Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedEnquiry && (
                        <Row>
                            <Col md={6}><p><strong>First Name:</strong> {selectedEnquiry.firstName}</p></Col>
                            <Col md={6}><p><strong>Last Name:</strong> {selectedEnquiry.lastName}</p></Col>
                            <Col md={12}><p><strong>Email:</strong> {selectedEnquiry.email}</p></Col>
                            {/* <Col md={12}><p><strong>Status:</strong> {getStatusBadge(selectedEnquiry.status)}</p></Col> */}
                            <Col md={12}>
                                <p><strong>Message:</strong></p>
                                <div className="border p-3 rounded bg-light">
                                    {selectedEnquiry.message}
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* DELETE MODAL */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete <strong>{enquiryToDelete?.firstName} {enquiryToDelete?.lastName}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default EnquiryManagement;
