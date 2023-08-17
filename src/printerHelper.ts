export class PrinterHelper {
  public static printFieldsMultiline(fields: string[], lineLength: number): string {
    const FIELD_SPLIT = ', ';
    const LINE_SPLIT = '\n';
    const lines = new Array<string>();
    let fieldsInLine = new Array<string>();
    for (const field of fields) {
      const currentLineLength = fieldsInLine.reduce((count, x) => count + x.length, 0) + field.length;
      if (currentLineLength + field.length + FIELD_SPLIT.length * fieldsInLine.length > lineLength) {
        lines.push(fieldsInLine.join(', '));
        fieldsInLine = new Array<string>();
      }
      fieldsInLine.push(field);
    }
    if (fieldsInLine.length > 0) {
      lines.push(fieldsInLine.join(FIELD_SPLIT));
    }
    return lines.join(LINE_SPLIT);
  }
}
