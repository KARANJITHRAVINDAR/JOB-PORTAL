import React from 'react';
import SignalPing from './SignalPing';
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onWidenRadius?: () => void;
  onEnableAlerts?: () => void;
  className?: string;
}

export default function EmptyState({
  title = 'No active signals found',
  description = 'No regular jobs found matching your category. Try widening your radar radius.',
  onWidenRadius,
  onEnableAlerts,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`glass-card flex flex-col items-center justify-center text-center p-10 border border-line ${className}`}>
      
      {/* Muted radar pulse ping */}
      <div className="relative mb-6">
        <SignalPing color="muted" size="lg" />
      </div>

      {/* Bold title in Display Font */}
      <h3 className="font-display font-extrabold text-xl text-text-primary mb-2">
        {title}
      </h3>

      {/* Explanation in body font */}
      <p className="text-sm text-text-muted max-w-sm mb-8 leading-relaxed">
        {description}
      </p>

      {/* Two action buttons: secondary and primary */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {onWidenRadius && (
          <Button 
            variant="secondary" 
            onClick={onWidenRadius}
            className="w-full sm:w-auto text-xs px-5 py-2.5"
          >
            Widen Radius
          </Button>
        )}
        {onEnableAlerts && (
          <Button 
            variant="primary" 
            onClick={onEnableAlerts}
            className="w-full sm:w-auto text-xs px-5 py-2.5"
          >
            Enable Alerts
          </Button>
        )}
      </div>

    </div>
  );
}
