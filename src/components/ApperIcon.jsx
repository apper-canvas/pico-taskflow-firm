import * as Icons from 'lucide-react';
import * as ReactIcons from 'react-icons/fa';

const ApperIcon = ({ name, ...props }) => {
    let IconComponent = Icons[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" does not exist in lucide-react`);
        IconComponent = Icons['Smile'];
        
        // Try react-icons as fallback
        if (ReactIcons[name]) {
            IconComponent = ReactIcons[name];
        }
    }

    return <IconComponent {...props} />;
};

export default ApperIcon;