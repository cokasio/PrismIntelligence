import { CSVParser } from '../../services/parsers/csv';
import { logger } from '../../utils/logger';

// Mock the logger to avoid console output during tests
jest.mock('../../utils/logger');

describe('CSVParser', () => {
  let parser: CSVParser;

  beforeEach(() => {
    parser = new CSVParser();
    jest.clearAllMocks();
  });

  describe('parse', () => {
    it('should parse basic CSV content correctly', async () => {
      const csvContent = `Property Name,Revenue,Expenses,NOI
Sunset Apartments,45000,32000,13000
Oak Ridge Complex,67000,41000,26000
Metro Plaza,52000,38000,14000`;

      const buffer = Buffer.from(csvContent);
      const result = await parser.parse(buffer, 'financial-report.csv');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toEqual({
        'Property Name': 'Sunset Apartments',
        Revenue: 45000,
        Expenses: 32000,
        NOI: 13000
      });
    });

    it('should handle different delimiters', async () => {
      const csvContent = `Property Name;Revenue;Expenses;NOI
Sunset Apartments;45000;32000;13000
Oak Ridge Complex;67000;41000;26000`;

      const buffer = Buffer.from(csvContent);
      const result = await parser.parse(buffer, 'financial-report.csv');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should handle quoted fields with commas', async () => {
      const csvContent = `Property Name,Description,Revenue
"Sunset Apartments, Phase 1","Modern, upscale living",45000
"Oak Ridge Complex","Family-friendly, amenities",67000`;

      const buffer = Buffer.from(csvContent);
      const result = await parser.parse(buffer, 'financial-report.csv');

      expect(result.success).toBe(true);
      expect(result.data[0]['Property Name']).toBe('Sunset Apartments, Phase 1');
      expect(result.data[0]['Description']).toBe('Modern, upscale living');
    });

    it('should handle empty cells', async () => {
      const csvContent = `Property Name,Revenue,Expenses,NOI
Sunset Apartments,,32000,
Oak Ridge Complex,67000,,26000`;

      const buffer = Buffer.from(csvContent);
      const result = await parser.parse(buffer, 'financial-report.csv');

      expect(result.success).toBe(true);
      expect(result.data[0]['Revenue']).toBeUndefined();
      expect(result.data[0]['NOI']).toBeUndefined();
    });

    it('should return error for invalid CSV', async () => {
      const invalidContent = `This is not a CSV file at all
Just some random text
Without proper structure`;

      const buffer = Buffer.from(invalidContent);
      const result = await parser.parse(buffer, 'invalid.csv');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle large files efficiently', async () => {
      // Generate a large CSV with 1000 rows
      let largeCsv = 'Property,Unit,Rent,Tenant\n';
      for (let i = 1; i <= 1000; i++) {
        largeCsv += `Property ${i},Unit ${i},${1000 + i},Tenant ${i}\n`;
      }

      const buffer = Buffer.from(largeCsv);
      const startTime = Date.now();
      const result = await parser.parse(buffer, 'large-report.csv');
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should preserve data types correctly', async () => {
      const csvContent = `Property,Units,Occupancy,Built,Active
Sunset Apartments,150,0.95,2018,true
Oak Ridge,200,0.87,2015,false`;

      const buffer = Buffer.from(csvContent);
      const result = await parser.parse(buffer, 'property-data.csv');

      expect(result.success).toBe(true);
      expect(typeof result.data[0]['Units']).toBe('number');
      expect(typeof result.data[0]['Occupancy']).toBe('number');
      expect(typeof result.data[0]['Built']).toBe('number');
      expect(typeof result.data[0]['Active']).toBe('boolean');
    });
  });

  describe('extractMetadata', () => {
    it('should extract correct metadata from parsed data', async () => {
      const csvContent = `Property Name,Revenue,Expenses,NOI,Date
Sunset Apartments,45000,32000,13000,2024-01-01
Oak Ridge Complex,67000,41000,26000,2024-01-01
Metro Plaza,52000,38000,14000,2024-01-01`;

      const buffer = Buffer.from(csvContent);
      const result = await parser.parse(buffer, 'q1-financial-report.csv');

      expect(result.success).toBe(true);
      expect(result.metadata?.rowCount).toBe(3);
      expect(result.metadata?.columnCount).toBe(5);
      expect(result.metadata?.columns).toEqual(['Property Name', 'Revenue', 'Expenses', 'NOI', 'Date']);
      expect(result.metadata?.fileSize).toBe(buffer.length);
      expect(result.metadata?.hasHeaders).toBe(true);
    });
  });
});
