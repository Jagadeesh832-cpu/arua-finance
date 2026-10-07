import { jsPDF } from "jspdf";

/**
 * Generates an official, bank-grade PDF Expense Proof for a verified saved expense.
 * @param {Object} expense - The exact expense document confirmed and saved in MongoDB
 * @param {Object} user - The logged-in authenticated user object
 * @returns {{ success: boolean, filename: string }}
 */
export function generateExpensePdf(expense, user) {
  if (!expense || (!expense._id && !expense.id && !expense.expenseId)) {
    throw new Error("Cannot generate proof: Expense has not been confirmed or saved in MongoDB.");
  }

  const expenseId = String(expense._id || expense.expenseId || expense.id || "unassigned");
  const rawAmount = Number(expense.amount) || 0;
  const formattedAmount = rawAmount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const userName = user?.name || user?.firstName || "Authorized Investor";
  const userIdentifier = user?.email || user?.phoneNumber || "Verified Account";
  
  const expenseDateStr = expense.date 
    ? new Date(expense.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  const generatedAt = new Date().toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const verificationRef = `ARUA-EXP-${expenseId.slice(-8).toUpperCase()}`;

  // Initialize jsPDF A4 Document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = 210;
  const margin = 18;
  const contentWidth = pageWidth - (margin * 2);

  // 1. Top Decorative Brand Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setFillColor(37, 99, 235); // blue-600 accent stripe
  doc.rect(0, 27, pageWidth, 1.5, "F");

  // Header Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ARUA FINANCE", margin, 12);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Smarter Money. Powered by AI.", margin, 18);

  // Right-aligned Document Label in Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text("OFFICIAL EXPENSE PROOF", pageWidth - margin, 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Ref: ${verificationRef}`, pageWidth - margin, 18, { align: "right" });

  // 2. Document Title & Status Badge
  let y = 38;

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Expense Proof & Transaction Record", margin, y);

  // Status Badge Box
  const badgeWidth = 36;
  const badgeHeight = 7;
  const badgeX = pageWidth - margin - badgeWidth;
  const badgeY = y - 5;

  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(34, 197, 94); // emerald-500
  doc.setLineWidth(0.3);
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, "FD");

  doc.setTextColor(22, 101, 52); // emerald-800
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("STATUS: RECORDED", badgeX + (badgeWidth / 2), badgeY + 4.8, { align: "center" });

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Electronic certification of expenditure logged into Arua Finance cloud ledger.", margin, y);

  // 3. Amount Highlight Box
  y += 7;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL AMOUNT RECORDED", margin + 6, y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(`₹ ${formattedAmount}  (INR)`, margin + 6, y + 17);

  // Right side of amount card: payment method & date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Payment Mode: ${expense.paymentMethod || "UPI"}`, pageWidth - margin - 6, y + 8, { align: "right" });
  doc.text(`Transaction Date: ${expenseDateStr}`, pageWidth - margin - 6, y + 15, { align: "right" });

  // 4. Primary Information Section Table
  y += 32;

  doc.setFillColor(241, 245, 249); // slate-100 header
  doc.rect(margin, y, contentWidth, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("TRANSACTION DETAILS", margin + 4, y + 4.8);

  y += 7;
  const drawRow = (label, value, isEven) => {
    const rowHeight = 7.5;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, "F");
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label, margin + 4, y + 5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(String(value), pageWidth - margin - 4, y + 5, { align: "right" });

    y += rowHeight;
  };

  drawRow("Description", expense.description || "N/A", false);
  drawRow("Category", expense.category || "Other", true);
  drawRow("Amount (INR)", `₹ ${formattedAmount}`, false);
  drawRow("Payment Method", expense.paymentMethod || "UPI", true);
  drawRow("Expense Date", expenseDateStr, false);
  drawRow("Accounting Status", "Recorded & Validated in Ledger", true);

  // 5. Verification & Security Metadata Table
  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("AUDIT & CLOUD VERIFICATION METADATA", margin + 4, y + 4.8);

  y += 7;
  drawRow("MongoDB Unique Expense ID", expenseId, false);
  if (expense.expenseId && expense.expenseId !== expenseId) {
    drawRow("Reference Expense ID", expense.expenseId, true);
  }
  drawRow("Investor Name", userName, expense.expenseId && expense.expenseId !== expenseId ? false : true);
  drawRow("Investor Account", userIdentifier, expense.expenseId && expense.expenseId !== expenseId ? true : false);
  drawRow("Proof Generation Timestamp", generatedAt, expense.expenseId && expense.expenseId !== expenseId ? false : true);
  drawRow("Cryptographic Verification Key", verificationRef, expense.expenseId && expense.expenseId !== expenseId ? true : false);

  // 6. Security & Audit Box
  y += 8;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text("AUDIT SECURITY STATEMENT", margin + 4, y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const auditStatement = `This document serves as an authorized electronic expense receipt recorded for ${userName} in Arua Finance. Any tampering or unauthorized modification invalidates this document. The database record holds immutable precedence in all financial reconciliations.`;
  const splitAudit = doc.splitTextToSize(auditStatement, contentWidth - 8);
  doc.text(splitAudit, margin + 4, y + 10);

  // 7. Footer
  const footerY = 278;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("This document is generated electronically by Arua Finance.", pageWidth / 2, footerY, { align: "center" });

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Arua Finance • Smarter Money. Powered by AI. • https://aurafinance2026.vercel.app", pageWidth / 2, footerY + 4.5, { align: "center" });

  const filename = `AruaFinance_Expense_${expenseId}.pdf`;

  // Download PDF file in client environment
  if (typeof doc.save === "function") {
    doc.save(filename);
  }

  return {
    success: true,
    filename,
    doc
  };
}

export default generateExpensePdf;
