import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Card, CardBody, CardHeader, CardTitle, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import SimplebarReactClient from '@/components/wrappers/SimplebarReactClient'
import { useSessionsByCountry } from '@/hooks/useSessionsByCountry'

// ✅ IMPORTS (DO NOT CHANGE)
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const SessionByBrowser = ({ range = '3mo', metric = 'activeUsers', topN = 250 }) => {
  const { data: countries = [], isLoading } = useSessionsByCountry({
    range,
    metric,
    topN,
  })

  const totalVisitors = countries.reduce((s, c) => s + c.value, 0)

  /* =========================
        EXCEL DOWNLOAD
     ========================= */
  const handleExcelDownload = (e) => {
    e.preventDefault()

    if (!countries.length) return

    const rows = countries.map((c) => ({
      Country: c.country,
      ISO: c.iso,
      Visitors: c.value,
      'Percentage (%)': totalVisitors > 0 ? ((c.value / totalVisitors) * 100).toFixed(1) : '0.0',
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sessions By Country')

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    saveAs(blob, 'sessions-by-country.xlsx')
  }

  /* =========================
        PDF DOWNLOAD
     ========================= */
  const handlePdfDownload = (e) => {
    e.preventDefault()

    if (!countries.length) return

    const doc = new jsPDF('p', 'mm', 'a4')

    doc.setFontSize(14)
    doc.text('Sessions by Country', 14, 15)

    autoTable(doc, {
      startY: 22,
      head: [['Country', 'ISO', 'Visitors', '% of Total']],
      body: countries.map((c) => [
        c.country,
        c.iso,
        c.value.toLocaleString(),
        totalVisitors > 0 ? ((c.value / totalVisitors) * 100).toFixed(1) + '%' : '0.0%',
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] }, // Tailwind blue-500
    })

    doc.save('sessions-by-country.pdf')
  }

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center border-bottom border-dashed">
        <CardTitle>Session By Country</CardTitle>

        <Dropdown>
          <OverlayTrigger placement="top" overlay={<Tooltip>Export options</Tooltip>}>
            <DropdownToggle as="a" role="button" className="arrow-none card-drop">
              <IconifyIcon icon="iconamoon:menu-kebab-vertical-circle-duotone" className="fs-20 align-middle text-muted" />
            </DropdownToggle>
          </OverlayTrigger>
          <DropdownMenu align="end">
            <DropdownItem onClick={handlePdfDownload}>Download PDF</DropdownItem>
            <DropdownItem onClick={handleExcelDownload}>Download Excel</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>

      <CardBody className="py-2 px-0 ">
        <SimplebarReactClient className="px-2" style={{ height: 270, overflow: 'hidden' }}>
          {isLoading && (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" />
            </div>
          )}

          {!isLoading &&
            countries.map((country, idx) => {
              const percentage = totalVisitors > 0 ? ((country.value / totalVisitors) * 100).toFixed(1) : '0.0'

              return (
                <div key={country.iso || idx} className="d-flex align-items-center p-2">
                  <div className="flex-grow-1 fw-medium text-truncate">
                    {country.country} <small className="text-muted">({country.iso})</small>
                  </div>

                  <div className="fw-semibold text-muted text-end" style={{ width: 80 }}>
                    {percentage}%
                  </div>

                  <div className="fw-semibold text-muted text-end" style={{ width: 110 }}>
                    {country.value.toLocaleString()}
                  </div>
                </div>
              )
            })}
        </SimplebarReactClient>
      </CardBody>
    </Card>
  )
}

export default SessionByBrowser
