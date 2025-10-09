import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CSS_CLASSES } from '../constants';
export function LoadingSpinner({ size = 'medium', message, className = '', 'aria-label': ariaLabel = 'Loading' }) {
    const sizeClass = {
        small: 'spinner-small',
        medium: 'spinner-medium',
        large: 'spinner-large'
    }[size];
    return (_jsxs("div", { className: `loading-container ${CSS_CLASSES.LOADING} ${className}`, children: [_jsx("div", { className: `spinner ${sizeClass}`, role: "status", "aria-label": ariaLabel, children: _jsx("span", { className: "sr-only", children: ariaLabel }) }), message && (_jsx("p", { className: "loading-message", "aria-live": "polite", children: message }))] }));
}
