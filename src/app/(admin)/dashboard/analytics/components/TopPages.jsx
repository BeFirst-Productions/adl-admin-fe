import IconifyIcon from '@/components/wrappers/IconifyIcon'
import {
  Card,
  CardHeader,
  CardTitle,
  Table,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTopPages } from '@/hooks/useTopPages'

// export libs
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'

const TABLE_HEIGHT = 290

const TopPages = () => {
  const { data, isLoading } = useTopPages({ days: 28, limit: 15 })
  const rows = data?.rows || []

  /* ================= EXPORTS ================= */
  const downloadExcel = () => {
    if (!rows.length) return

    const sheet = XLSX.utils.json_to_sheet(
      rows.map((r) => ({
        'Page Path': r.pagePath,
        'Page Views': r.screenPageViews,
        'Active Users': r.activeUsers,
      })),
    )

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, sheet, 'Top Pages')

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      'top-pages.xlsx',
    )
  }

  const downloadPDF = () => {
    if (!rows.length) return

    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text('Top Pages (Last 28 Days)', 14, 16)

    autoTable(doc, {
      startY: 22,
      head: [['Page Path', 'Page Views', 'Active Users']],
      body: rows.map((r) => [r.pagePath, r.screenPageViews, r.activeUsers]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    doc.save('top-pages.pdf')
  }

  return (
    <Card>
      {/* ================= HEADER ================= */}
      <CardHeader className="d-flex align-items-center justify-content-between gap-2">
        <CardTitle className="mb-0">Top Pages</CardTitle>

        <Dropdown container="body">
          <OverlayTrigger placement="top" overlay={<Tooltip>Export options</Tooltip>}>
            <DropdownToggle as="a" role="button" className="arrow-none card-drop">
              <IconifyIcon icon="iconamoon:menu-kebab-vertical-circle-duotone" className="fs-20 text-muted" />
            </DropdownToggle>
          </OverlayTrigger>

          <DropdownMenu align="end" style={{ zIndex: 9999 }}>
            <DropdownItem onClick={downloadPDF}>Download PDF</DropdownItem>
            <DropdownItem onClick={downloadExcel}>Download Excel</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>

      {/* ================= TABLE ================= */}
      <SimplebarReactClient
        className="table-responsive"
        style={{
          maxHeight: TABLE_HEIGHT,
          overflowY: rows.length > 6 ? 'auto' : 'visible',
        }}>
        <Table hover className="table-nowrap table-centered m-0">
          <thead className="bg-light  sticky-top">
            <tr>
              <th className="text-muted py-2">Page Path</th>
              <th className="text-muted py-2 text-center">Page Views</th>
              <th className="text-muted py-2 text-center">Active Users</th>
            </tr>
          </thead>

          <tbody>
            {/* LOADING */}
            {isLoading && (
              <tr>
                <td colSpan={3} className="text-center py-4">
                  <Spinner animation="border" size="sm" />
                </td>
              </tr>
            )}

            {/* DATA */}
            {!isLoading &&
              rows.map((page, idx) => (
                <tr key={idx}>
                  <td className="text-truncate" style={{ maxWidth: 260 }}>
                    <Link to={page.pagePath} className="text-muted">
                      {page.pagePath}
                    </Link>
                  </td>

                  <td className="text-center fw-semibold text-primary">{page.screenPageViews.toLocaleString()}</td>

                  <td className="text-center fw-semibold text-success">{page.activeUsers.toLocaleString()}</td>
                </tr>
              ))}

            {/* EMPTY */}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-muted py-4">
                  No page data available
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </SimplebarReactClient>

    </Card>
  )
}

export default TopPages
