// AppIcon.tsx
import React from 'react';
import * as LucideIcons from 'lucide-react';
import { HelpCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// Create a type that includes all possible Lucide icon names as strings.
export type LucideIconName = keyof typeof LucideIcons; // <--- Make it exportable

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
    name: LucideIconName;
    size?: number;
    color?: string;
    className?: string;
    strokeWidth?: number;
}

function Icon({
    name,
    size = 24,
    color = "currentColor",
    className = "",
    strokeWidth = 2,
    ...props
}: IconProps) {
    const IconComponent = LucideIcons[name] as LucideIcon;

    if (!IconComponent) {
        return <HelpCircle size={size} color="gray" strokeWidth={strokeWidth} className={className} {...props} />;
    }

    return <IconComponent
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        className={className}
        {...props}
    />;
}

export default Icon;