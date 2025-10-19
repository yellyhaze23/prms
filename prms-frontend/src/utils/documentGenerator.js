import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';

export const generateMedicalRecordDocx = (record) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
          text: "MEDICAL RECORD",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
        }),
        
        // Patient Information Section
        new Paragraph({
          text: "PATIENT INFORMATION",
          heading: HeadingLevel.HEADING_1,
        }),
        
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Name:")],
                  width: { size: 20, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph(record.full_name || 'Not provided')],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph("Age:")],
                  width: { size: 20, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph(record.age || 'Not provided')],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Sex:")],
                }),
                new TableCell({
                  children: [new Paragraph(record.sex || 'Not provided')],
                }),
                new TableCell({
                  children: [new Paragraph("Date of Birth:")],
                }),
                new TableCell({
                  children: [new Paragraph(record.date_of_birth ? new Date(record.date_of_birth).toLocaleDateString() : 'Not provided')],
                }),
              ],
            }),
          ],
        }),
        
        // Vital Signs Section
        new Paragraph({
          text: "VITAL SIGNS",
          heading: HeadingLevel.HEADING_1,
        }),
        
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Blood Pressure:")],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph(record.blood_pressure || 'Not recorded')],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph("Temperature:")],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph(record.temperature || 'Not recorded')],
                  width: { size: 25, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Height:")],
                }),
                new TableCell({
                  children: [new Paragraph(record.height ? `${record.height} cm` : 'Not recorded')],
                }),
                new TableCell({
                  children: [new Paragraph("Weight:")],
                }),
                new TableCell({
                  children: [new Paragraph(record.weight ? `${record.weight} kg` : 'Not recorded')],
                }),
              ],
            }),
          ],
        }),
        
        // Chief Complaint
        new Paragraph({
          text: "CHIEF COMPLAINT",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph(record.chief_complaint || 'Not recorded'),
        
        // Medical Record Section
        new Paragraph({
          text: "MEDICAL RECORD",
          heading: HeadingLevel.HEADING_1,
        }),
        
        new Paragraph({
          text: "Diagnosis:",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph(record.diagnosis || 'No diagnosis recorded'),
        
        new Paragraph({
          text: "Laboratory Procedure:",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph(record.laboratory_procedure || 'No laboratory procedures recorded'),
        
        new Paragraph({
          text: "Prescribed Medicine:",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph(record.prescribed_medicine || 'No medications prescribed'),
        
        new Paragraph({
          text: "Medical Advice:",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph(record.medical_advice || 'No medical advice recorded'),
        
        new Paragraph({
          text: "Medical Remarks:",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph(record.medical_remarks || 'No additional remarks'),
        
        // Consultation Details
        new Paragraph({
          text: "CONSULTATION DETAILS",
          heading: HeadingLevel.HEADING_1,
        }),
        
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Date of Consultation:")],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph(record.date_of_consultation ? new Date(record.date_of_consultation).toLocaleDateString() : 'Not recorded')],
                  width: { size: 70, type: WidthType.PERCENTAGE },
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Health Provider:")],
                }),
                new TableCell({
                  children: [new Paragraph(record.health_provider || record.health_provider_medical || 'Not recorded')],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Place of Consultation:")],
                }),
                new TableCell({
                  children: [new Paragraph(record.place_of_consultation || record.place_of_consultation_medical || 'Not recorded')],
                }),
              ],
            }),
          ],
        }),
        
        // Footer
        new Paragraph({
          children: [
            new TextRun({
              text: "Generated on: ",
              bold: true,
            }),
            new TextRun(new Date().toLocaleString()),
          ],
        }),
      ],
    }],
  });

  return Packer.toBlob(doc);
};

export const downloadMedicalRecord = async (record) => {
  try {
    const blob = await generateMedicalRecordDocx(record);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medical_record_${record.full_name?.replace(/\s+/g, '_') || 'patient'}_${record.date_of_consultation ? new Date(record.date_of_consultation).toISOString().split('T')[0] : 'unknown'}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return false;
  }
};
