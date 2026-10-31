import { SheetRowData, SheetTotals, DormSettings, CalendarEventSummary } from '../types';

/**
 * Creates a formatted Google Spreadsheet in the user's Google Drive
 * populated with the official dormitory water and electricity meter table.
 */
export async function exportBuildingToGoogleSheets(
  accessToken: string,
  buildingName: string,
  monthThai: string,
  prevMonthLabel: string,
  currMonthLabel: string,
  rows: SheetRowData[],
  totals: SheetTotals
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const title = `ตารางมิเตอร์น้ำ-ไฟ ${buildingName} (${monthThai})`;

  // Step 1: Create a new spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title
      },
      sheets: [
        {
          properties: {
            title: buildingName,
            gridProperties: {
              frozenRowCount: 2
            }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Failed to create Google Spreadsheet');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // Step 2: Prepare 2D array of values for the sheet
  const values: any[][] = [];

  // Header Row 1
  values.push([
    'ห้อง',
    `มิเตอร์น้ำ (${prevMonthLabel})`,
    `มิเตอร์น้ำ (${currMonthLabel})`,
    'หน่วยน้ำใช้',
    `มิเตอร์ไฟ (${prevMonthLabel})`,
    `มิเตอร์ไฟ (${currMonthLabel})`,
    'หน่วยไฟใช้',
    'ค่าน้ำ (บาท)',
    'ค่าไฟ (บาท)',
    'รวมเงิน (บาท)',
    'หมายเหตุ'
  ]);

  // Data Rows
  rows.forEach(r => {
    values.push([
      r.roomNo,
      r.hasRecord ? (r.waterType === 'flat_per_person' ? 'เหมาจ่าย' : r.waterPrev) : '',
      r.hasRecord ? (r.waterType === 'flat_per_person' ? `${r.occupants} คน` : r.waterCurr) : '',
      r.hasRecord ? (r.waterType === 'flat_per_person' ? 0 : r.waterUnits) : '',
      r.hasRecord ? r.elecPrev : '',
      r.hasRecord ? r.elecCurr : '',
      r.hasRecord ? r.elecUnits : '',
      r.hasRecord ? r.waterCost : '',
      r.hasRecord ? r.elecCost : '',
      r.hasRecord ? r.totalAmount : '',
      r.remark || ''
    ]);
  });

  // Footer Totals Row
  values.push([
    'รวมทั้งสิ้น',
    '',
    '',
    totals.waterUnits,
    '',
    '',
    totals.elecUnits,
    totals.waterCost,
    totals.elecCost,
    totals.totalAmount,
    ''
  ]);

  // Step 3: Write values to the newly created sheet
  const range = `'${buildingName}'!A1:K${values.length}`;
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values
      })
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json();
    throw new Error(err.error?.message || 'Failed to populate sheet values');
  }

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Creates an official Dormitory Utility Summary Document in Google Docs
 */
export async function exportSummaryToGoogleDocs(
  accessToken: string,
  buildingName: string,
  monthThai: string,
  rows: SheetRowData[],
  totals: SheetTotals,
  settings: DormSettings
): Promise<{ documentId: string; documentUrl: string }> {
  const title = `ใบแจ้งหนี้และรายงานสรุปค่าน้ำ-ไฟ_${buildingName}_${monthThai}`;

  // 1. Create Google Doc
  const docRes = await fetch('https://docs.googleapis.com/v4/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!docRes.ok) {
    const err = await docRes.json();
    throw new Error(err.error?.message || 'Failed to create Google Doc');
  }

  const doc = await docRes.json();
  const documentId = doc.documentId;
  const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

  // 2. Prepare structured content
  const recordedCount = rows.filter(r => r.hasRecord).length;
  const content =
    `รายการแจ้งหนี้ค่าน้ำประปา- ค่าไฟฟ้าประจำหอพัก${buildingName}\n` +
    `ประจำเดือน ${monthThai}\n` +
    `----------------------------------------------------------------------\n` +
    `ข้อมูลสรุปประจำรอบบิล:\n` +
    `• จำนวนห้องทั้งหมด: ${rows.length} ห้อง\n` +
    `• จำนวนห้องที่จดบันทึกแล้ว: ${recordedCount} ห้อง\n` +
    `• ปริมาณการใช้น้ำประปารวม: ${totals.waterUnits.toLocaleString('th-TH')} หน่วย\n` +
    `• ปริมาณการใช้ไฟฟ้ารวม: ${totals.elecUnits.toLocaleString('th-TH')} หน่วย\n` +
    `• ค่าน้ำประปารวม: ฿${totals.waterCost.toLocaleString('th-TH')} บาท (อัตราหน่วยละ ${settings.defaultWaterRate} บ. / เหมา ${settings.defaultFlatWaterRate} บ./คน)\n` +
    `• ค่าไฟฟ้ารวม: ฿${totals.elecCost.toLocaleString('th-TH')} บาท (อัตราหน่วยละ ${settings.defaultElecRate} บ.)\n` +
    `• ยอดรวมเงินทั้งสิ้น: ฿${totals.totalAmount.toLocaleString('th-TH')} บาท\n` +
    `----------------------------------------------------------------------\n\n` +
    `รายชื่อห้องที่มีหมายเหตุ / สถานะพิเศษ:\n` +
    rows
      .filter(r => r.remark && r.remark.trim() !== '')
      .map(r => `• ห้อง ${r.roomNo}: ${r.remark} (ยอดชำระ: ฿${r.totalAmount.toLocaleString('th-TH')})`)
      .join('\n') +
    `\n\n\n` +
    `ลงชื่อ .................................................... ผู้จัดทำรายงาน\n` +
    `     ( .................................................... )\n` +
    `     เจ้าหน้าที่ดูแลหอพัก\n\n` +
    `ลงชื่อ .................................................... ผู้อนุมัติ\n` +
    `     ( .................................................... )\n` +
    `     หัวหน้างานบริหารหอพักนักศึกษา\n`;

  // Insert text into document
  await fetch(`https://docs.googleapis.com/v4/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: content
          }
        }
      ]
    })
  });

  return { documentId, documentUrl };
}

/**
 * Lists upcoming Dormitory Billing events from Google Calendar
 */
export async function listDormCalendarEvents(accessToken: string): Promise<CalendarEventSummary[]> {
  const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    timeMin
  )}&maxResults=20&orderBy=startTime&singleEvents=true`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to fetch calendar events');
  }

  const data = await res.json();
  const items = (data.items || []) as any[];

  return items
    .filter(
      item =>
        item.summary?.includes('หอพัก') ||
        item.summary?.includes('มิเตอร์') ||
        item.summary?.includes('ค่าน้ำ') ||
        item.summary?.includes('ค่าไฟ')
    )
    .map(item => ({
      id: item.id,
      summary: item.summary,
      description: item.description,
      start: item.start,
      end: item.end,
      htmlLink: item.htmlLink
    }));
}

/**
 * Creates an event in Google Calendar for meter reading or payment deadlines
 */
export async function createDormCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    startTime?: string; // HH:mm
    endTime?: string; // HH:mm
  }
): Promise<CalendarEventSummary> {
  let body: any;

  if (event.startTime && event.endTime) {
    const startDateTime = `${event.startDate}T${event.startTime}:00+07:00`;
    const endDateTime = `${event.endDate}T${event.endTime}:00+07:00`;
    body = {
      summary: event.summary,
      description: event.description,
      start: { dateTime: startDateTime, timeZone: 'Asia/Bangkok' },
      end: { dateTime: endDateTime, timeZone: 'Asia/Bangkok' }
    };
  } else {
    // All-day event (inclusive start, exclusive end)
    body = {
      summary: event.summary,
      description: event.description,
      start: { date: event.startDate },
      end: { date: event.endDate }
    };
  }

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to create Google Calendar event');
  }

  return await res.json();
}
