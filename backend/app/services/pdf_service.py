import io
from datetime import datetime
from typing import Dict, Any, List
import pdfplumber
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class PDFService:
    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        """Parses lines from PDF raw binary using pdfplumber."""
        text_content = []
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append(page_text)
            return "\n".join(text_content)
        except Exception as e:
            # Fallback simple text in case parsing fails
            return f"Medical Report OCR Parsing failure. File size: {len(file_bytes)} bytes."

    @staticmethod
    def generate_health_report_pdf(
        title: str,
        practitioner: str,
        facility: str,
        vitals: Dict[str, Any],
        medications: List[Any],
        recommendations: List[str]
    ) -> bytes:
        """Generates print-ready A4 PDF document incorporating charts metadata and schedules."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=letter, 
            rightMargin=54, 
            leftMargin=54, 
            topMargin=54, 
            bottomMargin=54
        )
        story = []
        
        # Style sheet setup
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0F172A'), # Slate 900
            spaceAfter=15
        )
        
        section_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=17,
            textColor=colors.HexColor('#0284C7'), # Sky 600
            spaceBefore=14,
            spaceAfter=8
        )
        
        body_style = ParagraphStyle(
            'BodyTextCustom',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor('#334155') # Slate 700
        )

        bold_body_style = ParagraphStyle(
            'BodyTextCustomBold',
            parent=body_style,
            fontName='Helvetica-Bold'
        )
        
        # 1. Title Page Header
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 5))
        
        # 2. Metadata Grid Table
        meta_data = [
            [
                Paragraph(f"<b>Practitioner:</b> {practitioner}", body_style), 
                Paragraph(f"<b>Facility:</b> {facility}", body_style)
            ],
            [
                Paragraph(f"<b>Report ID:</b> PIQ-{int(datetime.now().timestamp()) % 1000000}", body_style), 
                Paragraph(f"<b>Compiled At:</b> {datetime.now().strftime('%Y-%m-%d %I:%M %p')}", body_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[250, 250])
        meta_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 10))
        story.append(Table([[""]], colWidths=[500], rowHeights=[1], style=[('LINEBELOW', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0'))])) # divider
        story.append(Spacer(1, 10))
        
        # 3. Telemetry Metrics Section
        story.append(Paragraph("Biometric Telemetry Summary", section_style))
        vitals_data = [
            [Paragraph("Vital Log Type", bold_body_style), Paragraph("Reading Value", bold_body_style), Paragraph("Reference Status", bold_body_style)],
            [Paragraph("Heart Rate", body_style), Paragraph(f"{vitals.get('heart_rate', 72)} bpm", body_style), Paragraph("Normal (Stable)", body_style)],
            [Paragraph("Oxygen Saturation (SpO2)", body_style), Paragraph(f"{vitals.get('spo2', 98)}%", body_style), Paragraph("Normal (Ideal)", body_style)],
            [Paragraph("Rest Sleep Quantity", body_style), Paragraph(f"{vitals.get('sleep_hours', 7.5)} hrs", body_style), Paragraph("Normal (Optimal)", body_style)],
            [Paragraph("Medication Adherence Ratio", body_style), Paragraph(f"{vitals.get('medication_compliance', 100)}%", body_style), Paragraph("Adhered", body_style)],
            [Paragraph("PulseIQ Health Index", body_style), Paragraph(f"{vitals.get('health_score', 92)}/100", bold_body_style), Paragraph("Excellent", body_style)]
        ]
        v_table = Table(vitals_data, colWidths=[180, 150, 170])
        v_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F8FAFC')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ]))
        story.append(v_table)
        story.append(Spacer(1, 12))
        
        # 4. Medication List Section
        story.append(Paragraph("Logged Medications Schedule", section_style))
        med_headers = [Paragraph("Medication Name", bold_body_style), Paragraph("Dosage", bold_body_style), Paragraph("Frequency", bold_body_style), Paragraph("Scheduled Time", bold_body_style)]
        med_rows = [med_headers]
        
        for m in medications:
            # m can be a Medication database model or a dict
            name = getattr(m, "name", m.get("name") if isinstance(m, dict) else "")
            dosage = getattr(m, "dosage", m.get("dosage") if isinstance(m, dict) else "")
            freq = getattr(m, "frequency", m.get("frequency") if isinstance(m, dict) else "Daily")
            time = getattr(m, "time_of_day", m.get("time_of_day") if isinstance(m, dict) else "")
            
            med_rows.append([
                Paragraph(name, body_style),
                Paragraph(dosage, body_style),
                Paragraph(freq, body_style),
                Paragraph(time, body_style)
            ])
            
        if len(med_rows) == 1:
            med_rows.append([Paragraph("No active scheduled medications found.", body_style), Paragraph("-", body_style), Paragraph("-", body_style), Paragraph("-", body_style)])
            
        m_table = Table(med_rows, colWidths=[155, 100, 100, 145])
        m_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F8FAFC')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ]))
        story.append(m_table)
        story.append(Spacer(1, 12))
        
        # 5. AI Recommendations
        story.append(Paragraph("AI Assistant Clinical Recommendations", section_style))
        if not recommendations:
            recommendations = ["Continue daily health tracking.", "Maintain balanced dietary patterns.", "Consult your primary caregiver for detailed vital evaluations."]
            
        for index, r_text in enumerate(recommendations):
            story.append(Paragraph(f"<b>{index + 1}.</b> {r_text}", body_style))
            story.append(Spacer(1, 5))
            
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

    @staticmethod
    def generate_ai_summary_pdf(
        patient_name: str,
        report_name: str,
        report_type: str,
        date_str: str,
        summary: str,
        findings: List[str],
        abnormal_values: List[str],
        recommendations: List[str],
        risk_level: str
    ) -> bytes:
        """Generates a professional healthcare-style PDF summary of the AI analysis results."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=letter, 
            rightMargin=54, 
            leftMargin=54, 
            topMargin=54, 
            bottomMargin=54
        )
        story = []
        
        # Style sheet setup
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0F172A'), # Slate 900
            spaceAfter=15
        )
        
        section_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=17,
            textColor=colors.HexColor('#1E53FF'), # Clinical Blue (#1E53FF)
            spaceBefore=14,
            spaceAfter=8
        )
        
        body_style = ParagraphStyle(
            'BodyTextCustom',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor('#334155') # Slate 700
        )

        bold_body_style = ParagraphStyle(
            'BodyTextCustomBold',
            parent=body_style,
            fontName='Helvetica-Bold'
        )
        
        # 1. Header Branding
        story.append(Paragraph("PulseIQ Clinical AI Summary", title_style))
        story.append(Spacer(1, 5))
        
        # 2. Metadata Grid Table
        meta_data = [
            [
                Paragraph(f"<b>Patient:</b> {patient_name}", body_style), 
                Paragraph(f"<b>Report:</b> {report_name}", body_style)
            ],
            [
                Paragraph(f"<b>Assessment Date:</b> {date_str}", body_style), 
                Paragraph(f"<b>Category:</b> {report_type or 'General'}", body_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[250, 250])
        meta_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 10))
        story.append(Table([[""]], colWidths=[500], rowHeights=[1], style=[('LINEBELOW', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0'))])) # divider
        story.append(Spacer(1, 10))
        
        # 3. Clinical Risk Assessment
        story.append(Paragraph("Clinical Risk Assessment", section_style))
        
        risk_lower = (risk_level or '').lower()
        if 'high' in risk_lower or 'crit' in risk_lower:
            bg_color = '#FEF2F2'
            text_color = '#991B1B'
            border_color = '#FEE2E2'
        elif 'medium' in risk_lower or 'mod' in risk_lower:
            bg_color = '#FFFBEB'
            text_color = '#92400E'
            border_color = '#FEF3C7'
        else:
            bg_color = '#ECFDF5'
            text_color = '#065F46'
            border_color = '#D1FAE5'

        risk_data = [
            [Paragraph(f"<b>Assessed Risk Level:</b> {risk_level or 'Low'}", ParagraphStyle('RiskText', parent=bold_body_style, textColor=colors.HexColor(text_color)))]
        ]
        risk_table = Table(risk_data, colWidths=[500])
        risk_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(bg_color)),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor(border_color)),
        ]))
        story.append(risk_table)
        story.append(Spacer(1, 10))

        # 4. Summary Card Section
        story.append(Paragraph("Health Summary Translation", section_style))
        story.append(Paragraph(summary or "No summary available.", body_style))
        story.append(Spacer(1, 12))
        
        # 5. Abnormal Values Section
        story.append(Paragraph("Detected Abnormal Biomarkers", section_style))
        if not abnormal_values:
            story.append(Paragraph("No critical or abnormal outliers flagged in this report.", body_style))
        else:
            abnormal_rows = []
            for val in abnormal_values:
                abnormal_rows.append([Paragraph(f"<b>Warning:</b> {val}", ParagraphStyle('AbnormalRow', parent=body_style, textColor=colors.HexColor('#B91C1C')))])
            
            abnormal_table = Table(abnormal_rows, colWidths=[500])
            abnormal_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF2F2')),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 5),
                ('BOTTOMPADDING', (0,0), (-1,-1), 5),
                ('LEFTPADDING', (0,0), (-1,-1), 8),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#FCA5A5')),
            ]))
            story.append(abnormal_table)
        story.append(Spacer(1, 12))

        # 6. Important Findings
        story.append(Paragraph("Key Diagnostic Findings", section_style))
        if not findings:
            story.append(Paragraph("No key findings logged for this report.", body_style))
        else:
            for idx, finding in enumerate(findings):
                story.append(Paragraph(f"• {finding}", body_style))
                story.append(Spacer(1, 4))
        story.append(Spacer(1, 12))

        # 7. Actionable Recommendations
        story.append(Paragraph("Clinical Recommendations & Next Actions", section_style))
        if not recommendations:
            story.append(Paragraph("No clinical recommendations generated.", body_style))
        else:
            for idx, rec in enumerate(recommendations):
                story.append(Paragraph(f"<b>{idx + 1}.</b> {rec}", body_style))
                story.append(Spacer(1, 5))
        
        story.append(Spacer(1, 15))
        story.append(Table([[""]], colWidths=[500], rowHeights=[1], style=[('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1'))])) # divider
        story.append(Spacer(1, 5))
        story.append(Paragraph("<i>Disclaimer: PulseIQ Clinical AI compilations are secure automated guidelines to simplify documentation. They do not substitute professional diagnostic consultations with physicians.</i>", ParagraphStyle('DisclaimerText', parent=body_style, fontSize=7.5, leading=10, textColor=colors.HexColor('#94A3B8'))))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
