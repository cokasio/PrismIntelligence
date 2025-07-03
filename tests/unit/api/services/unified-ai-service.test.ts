(0);
    });

    test('should scale cost with document size', () => {
      const smallCost = UnifiedAIService.estimateCost(100, 'financial');
      const largeCost = UnifiedAIService.estimateCost(10000, 'financial');
      
      expect(largeCost).toBeGreaterThan(smallCost);
    });
  });

  describe('document type mapping', () => {
    test('should map PDF to appropriate agent-specific types', () => {
      const financialDoc = { ...mockDocument, type: 'pdf' };
      const tenantDoc = { ...mockDocument, type: 'email' };
      
      // We can't directly test the private method, but we can test the behavior
      // through the public interface by checking the calls made to the services
      
      const { ClaudeFinanceService } = require('../../../../apps/api/services/ai-providers/claude-service');
      ClaudeFinanceService.analyzeDocument.mockResolvedValue({
        agentId: 'claude-finance',
        agentName: 'FinanceBot',
        analysis: 'Test',
        insights: [],
        recommendations: [],
        confidence: 0.9,
        evidence: [],
        reasoning: [],
        financialMetrics: {},
        riskFactors: []
      });

      UnifiedAIService.analyzeDocument(financialDoc, 'financial');
      
      expect(ClaudeFinanceService.analyzeDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          documentType: 'financial_statement'
        })
      );
    });
  });
});