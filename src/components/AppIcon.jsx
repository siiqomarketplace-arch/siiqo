import React from 'react';
import * as LucideIcons from 'lucide-react';
import { HelpCircle, icons } from 'lucide-react';

// --- JSDoc Annotations for TypeScript ---

/**
 * This imports the type definition from the lucide-react library
 * and creates a new type alias named LucideIconName.
 * The @typedef tag is like `type` in TypeScript.
 * @typedef {keyof typeof import('lucide-react').icons} LucideIconName
 */

/**
 * The @export tag makes the typedef above available for other files to import.
 * This is the key to solving your error.
 * @export
 */

// --- Component Implementation ---

/**
 * Here, we define the component's props using the type we just created.
 * @param {{
 *   name: LucideIconName;
 *   size?: number;
 *   className?: string;
 *   [x:string]: any; // Allow other props
 * }} props
 */
const AppIcon = ({ name, ...props }) => {
    // This check is good practice in JS-land
    if (!name || !icons[name]) {
        return null; // or return a default/fallback icon
    }

    const LucideIcon = icons[name];
    return <LucideIcon {...props} />;
};


function Icon({
    name,
    size = 24,
    color = "currentColor",
    className = "",
    strokeWidth = 2,
    ...props
}) {
    const IconComponent = LucideIcons[name];

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