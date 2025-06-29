/**
 * Example of a working CSV parser test that matches the actual API
 * Use this as a template with Aider to fix the existing tests
 */

import { CSVParser } from '../../parsers/csv';
import { Buffer } from 'buffer';

describe('CSVParser - Working Example', () => {
  let parser: CSVParser;

  beforeEach(() => {
    parser = new CSVParser();
  });

  describe('parse', () => {
    it('should successfully parse a basic CSV', async () => {
      const csvContent = `Property Name,Revenue,Expenses,NOI
Sunset Apartments,100000,40000,60000
Downtown Tower,200000,80000,120000`;
      
      const buffer = Buffer.from(csvContent);
      const result = await parser.parse(buffer, 'test.csv');

      // Check the structure matches ParsedCSVData interface
      expect(result.headers).toEqual(['Property Name', 'Revenue', 'Expenses', 'NOI']);
      expect(result.metadata.rowCount).toBe(2);
      expect(result.metadata.hasHeaders).toBe(true);
      
      // Access data through rows (objects with headers as keys)
      expect(result.rows[0]['Property Name']).toBe('Sunset Apartments');
      expect(result.rows[0]['Revenue']).toBe(100000); // dynamicTyping converts to number
      
      // Raw data access (2D array)
      expect(result.data[0][0]).toBe('Sunset Apartments');
    });

    it('should throw error on invalid input', async () => {
      const buffer = Buffer.from(''); // Empty buffer
      
      await expect(parser.parse(buffer, 'empty.csv')).rejects.toThrow();
    });
  });
});

/**
 * To fix all tests using Aider:
 * 
 * aider src/tests/parsers/csv.test.ts tests/examples/csv-working.test.ts -m "Update the CSV tests to follow the working example pattern. The parser returns ParsedCSVData directly on success and throws on error."
 */
