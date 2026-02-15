/**
 * Disclaimer banner component
 */

import { AlertTriangle } from 'lucide-react';

export const Disclaimer = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
      <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-yellow-800">
        <strong>AI Disclaimer:</strong> Generated images are stylized representations 
        and may not be pixel-perfect reproductions of the original products. 
        Results are AI-generated for visualization purposes.
      </p>
    </div>
  );
};
